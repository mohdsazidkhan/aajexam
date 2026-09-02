import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { protect, admin } from '@/middleware/auth';
import axios from 'axios';

export const maxDuration = 300; // 5 minutes

// ============================================================
// OLLAMA CONFIGURATION
// ============================================================

const OLLAMA_API_URL =
  process.env.OLLAMA_API_URL ||
  'http://localhost:11434/api/chat';

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL ||
  'qwen3:8b';

const OLLAMA_TIMEOUT_MS =
  parseInt(process.env.QUIZ_AI_TIMEOUT_MS || '900000', 10);

const QUIZ_AI_DELAY_MS =
  parseInt(process.env.QUIZ_AI_DELAY_MS || '2000', 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// BUILD PROMPT
// ============================================================

function buildPrompt(examName, sectionName, questionCount, language = 'en', retryError = null, qIndex = 1, totalQ = 1, previousQuestions = []) {
  const langInstr = language === 'hi'
    ? 'Write all questions, options, hints and explanations in HINDI language only.'
    : 'Write all questions, options, hints and explanations in ENGLISH language only.';

  const prevTexts = previousQuestions.slice(-10).map(q => q.questionText);
  const avoidDupes = prevTexts.length > 0
    ? `\nCRITICAL: Do NOT generate any questions similar to these previously generated ones:\n${prevTexts.join('\n')}\n`
    : '';

  let prompt = `
You are an expert educational quiz creator for competitive government exams in India.

EXAM: "${examName}"
SECTION: "${sectionName}"
LANGUAGE: ${language === 'hi' ? 'Hindi' : 'English'}

Create exactly ${questionCount} multiple-choice question(s) strictly based on the syllabus and previous year question (PYQ) trends of the "${sectionName}" section for the "${examName}" exam.
This is question ${qIndex} of ${totalQ} for this section.
${avoidDupes}
IMPORTANT REQUIREMENTS:
1. Questions MUST strictly match the actual difficulty, syllabus, and question pattern of the ${examName} exam.
2. Questions MUST be specifically and exclusively about the "${sectionName}" topic area.
3. Use real concepts, formulas, rules, and terminology relevant to this specific exam and section.
4. Do NOT generate generic or basic trivia. The content must be competitive-exam level.
5. Each question must have EXACTLY 4 options.
6. Exactly ONE option must be correct.
7. Wrong options must be plausible and related to the topic.
8. Do NOT repeat questions.
9. Do NOT repeat options inside a question.
10. Vary correctAnswerIndex across questions (use 0,1,2,3 spread evenly).
11. Every question must have a useful hint that does NOT reveal the answer directly.
12. Every question must have a clear factual explanation of why the correct answer is correct.
13. Include relevant tags (2-3 keywords per question).
14. Vary difficulty: mix easy, medium, hard questions.
15. Do NOT use "A)", "B)", "C)", "D)" inside option text.
16. Do NOT use markdown formatting.
17. Return ONLY valid JSON — no text before or after.
${langInstr}
`;

  if (retryError) {
    prompt += `\nIMPORTANT: Previous attempt failed with: "${retryError}". Fix the issue and return valid JSON.\n`;
  }

  prompt += `
Return EXACTLY this JSON structure:

{
  "questions": [
    {
      "questionText": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Why the correct answer is correct",
      "hint": "A helpful hint that does not reveal the answer",
      "tags": ["tag1", "tag2"],
      "difficulty": "medium"
    }
  ]
}

Generate exactly ${questionCount} questions. Return ONLY the JSON object above.`;

  return prompt.trim();
}

// ============================================================
// CALL OLLAMA
// ============================================================

async function callOllama(prompt, signal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  // If parent signal aborts, abort ours too
  const onAbort = () => controller.abort();
  if (signal) signal.addEventListener('abort', onAbort);

  try {
    console.log('[DEBUG] Calling Ollama via axios at:', OLLAMA_API_URL);
    const response = await axios.post(
      OLLAMA_API_URL,
      {
        model: OLLAMA_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 6000,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener('abort', onAbort);

    const raw = response.data?.message?.content || response.data?.response || '';
    return raw.trim();
  } catch (err) {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener('abort', onAbort);

    if (err.response) {
      throw new Error(`Ollama API error: ${err.response.status} ${JSON.stringify(err.response.data)}`);
    } else if (err.request) {
      throw new Error(`Ollama Network error (fetch failed): ${err.message}`);
    } else {
      throw err;
    }
  }
}

// ============================================================
// PARSE & VALIDATE QUESTIONS
// ============================================================

function parseQuestions(raw, expectedCount) {
  // Strip markdown code fences if present
  let text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Strip <think>...</think> tags (qwen3 reasoning blocks)
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Extract JSON object
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  text = text.slice(start, end + 1);

  const parsed = JSON.parse(text);
  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error('Missing "questions" array in response');
  }

  const questions = parsed.questions.map((q, i) => {
    if (!q.questionText || typeof q.questionText !== 'string') {
      throw new Error(`Question ${i + 1}: missing questionText`);
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${i + 1}: must have exactly 4 options`);
    }
    if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
      throw new Error(`Question ${i + 1}: invalid correctAnswerIndex`);
    }
    return {
      questionText: String(q.questionText).trim(),
      options: q.options.map((o) => String(o).trim()),
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: String(q.explanation || '').trim(),
      hint: String(q.hint || '').trim(),
      tags: Array.isArray(q.tags) ? q.tags.map((t) => String(t).trim().toLowerCase()) : [],
      difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
    };
  });

  if (questions.length === 0) throw new Error('No questions generated');
  return questions;
}

// ============================================================
// GENERATE FOR ONE SECTION
// ============================================================

async function generateSection({ examName, sectionName, questionCount, language, signal, send, sectionIndex }) {
  let lastError = null;
  const questions = [];

  for (let i = 0; i < questionCount; i++) {
    let successForThisQuestion = false;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const prompt = buildPrompt(examName, sectionName, 1, language, lastError?.message, i + 1, questionCount, questions);
        const raw = await callOllama(prompt, signal);
        const parsed = parseQuestions(raw, 1);
        
        if (parsed.length > 0) {
          questions.push(parsed[0]);
          successForThisQuestion = true;
          lastError = null;

          if (send && sectionIndex !== undefined) {
            const questionsWithSection = questions.map((q) => ({
              ...q,
              section: sectionName,
            }));
            send({
              type: 'section_progress',
              index: sectionIndex,
              sectionName,
              questions: questionsWithSection,
            });
          }
          break; // success, move to next question
        }
      } catch (err) {
        lastError = err;
        if (attempt < 3) await sleep(2000);
      }
    }

    if (!successForThisQuestion) {
      return { success: false, error: `Failed at question ${i + 1}: ` + (lastError?.message || 'Unknown error'), questions };
    }
  }

  return { success: true, questions };
}

// ============================================================
// POST — Main generation endpoint (SSE streaming)
// ============================================================

export async function POST(req) {
  const auth = await protect(req);
  if (!auth.authenticated || !admin(auth.user)) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  await dbConnect();

  const body = await req.json();
  const { examName, patternTitle, sections, language = 'en' } = body;

  if (!examName || !sections || !Array.isArray(sections) || sections.length === 0) {
    return NextResponse.json({ success: false, error: 'examName and sections are required' }, { status: 400 });
  }

  // SSE streaming response
  const encoder = new TextEncoder();
  const signal = req.signal;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (_) {}
      };

      // Keep-alive ping to prevent connection timeout during long generation
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (_) {}
      }, 15000);

      send({ type: 'start', total: sections.length, examName, patternTitle, language });

      const allSectionResults = [];

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const { name: sectionName, totalQuestions } = section;

        send({
          type: 'section_start',
          index: i,
          sectionName,
          totalQuestions,
        });

        const result = await generateSection({
          examName,
          sectionName,
          questionCount: totalQuestions,
          language,
          signal,
          send,
          sectionIndex: i,
        });

        if (result.success) {
          // Attach section name to each question
          const questionsWithSection = result.questions.map((q) => ({
            ...q,
            section: sectionName,
          }));
          allSectionResults.push({ sectionName, questions: questionsWithSection });
          send({
            type: 'section_done',
            index: i,
            sectionName,
            count: questionsWithSection.length,
            questions: questionsWithSection,
          });
        } else {
          const partialQ = result.questions || [];
          const questionsWithSection = partialQ.map((q) => ({
            ...q,
            section: sectionName,
          }));
          allSectionResults.push({ sectionName, error: result.error, questions: questionsWithSection });
          send({
            type: 'section_error',
            index: i,
            sectionName,
            error: result.error,
            questions: questionsWithSection,
          });
        }

        if (i < sections.length - 1) {
          await sleep(QUIZ_AI_DELAY_MS);
        }
      }

      const totalGenerated = allSectionResults.reduce((acc, s) => acc + s.questions.length, 0);
      send({
        type: 'complete',
        totalGenerated,
        sections: allSectionResults,
      });

      clearInterval(pingInterval);
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
