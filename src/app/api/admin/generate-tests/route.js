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

// Timeout set to 60 minutes because local CPU generation of 10 questions can take a very long time
const OLLAMA_TIMEOUT_MS =
  parseInt(process.env.QUIZ_AI_TIMEOUT_MS || '3600000', 10);

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

  const prevTexts = previousQuestions.slice(-30).map(q => q.questionText);
  const avoidDupes = prevTexts.length > 0
    ? `\nCRITICAL DIVERSITY RULE: You MUST ensure HIGH DIVERSITY. Do NOT generate any questions similar in structure, logic, or wording to these previously generated ones:\n${prevTexts.join('\n')}\n\nDO NOT use the same question template with just different variables (e.g., if a previous question is about "average height of people wearing hats", DO NOT generate one about "average height of people wearing shoes"). Every question MUST test a completely different sub-topic and concept!\n`
    : '';

  const batchInfo = questionCount > 1 
    ? `These are questions ${qIndex} to ${qIndex + questionCount - 1} out of ${totalQ} for this section.`
    : `This is question ${qIndex} of ${totalQ} for this section.`;

  let prompt = `
You are an expert educational quiz creator for competitive government exams in India.

EXAM: "${examName}"
SECTION: "${sectionName}"
LANGUAGE: ${language === 'hi' ? 'Hindi' : 'English'}

Create exactly ${questionCount} multiple-choice question(s) strictly based on the syllabus and previous year question (PYQ) trends of the "${sectionName}" section for the "${examName}" exam.
${batchInfo}
${avoidDupes}
IMPORTANT REQUIREMENTS:
1. Questions MUST strictly match the actual difficulty, syllabus, and question pattern of the ${examName} exam.
2. Questions MUST be specifically and exclusively about the "${sectionName}" topic area.
3. Use real concepts, formulas, rules, and terminology relevant to this specific exam and section.
4. Do NOT generate generic or basic trivia. The content must be competitive-exam level.
5. Each question must have EXACTLY 4 options.
6. Exactly ONE option must be correct.
7. Wrong options must be plausible and related to the topic.
8. DIVERSITY IS MANDATORY. Do NOT repeat questions, question structures, or logic templates. Each question in the batch MUST cover a COMPLETELY DIFFERENT sub-topic and concept.
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

async function callOllama(prompt, signal, onChunk) {
  if (signal && signal.aborted) {
    throw new Error('Ollama Network error (fetch failed): canceled by client');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  // If parent signal aborts, abort ours too
  const onAbort = () => controller.abort();
  if (signal) signal.addEventListener('abort', onAbort);

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        options: {
          temperature: 0.85, // Increased for more diversity
          top_p: 0.95,
          // Removed num_predict to let reasoning models think fully
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let lastSendTime = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkStr = decoder.decode(value, { stream: true });
      const lines = chunkStr.split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          const content = parsed.message?.content || parsed.response || '';
          fullText += content;
        } catch (e) {}
      }

      if (onChunk) {
        const now = Date.now();
        if (now - lastSendTime > 150) { // Throttle UI updates to 150ms
          lastSendTime = now;
          onChunk(fullText);
        }
      }
    }

    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener('abort', onAbort);

    if (onChunk) onChunk(''); // Clear the stream text when done

    return fullText.trim();
  } catch (err) {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener('abort', onAbort);
    if (err.name === 'AbortError' || (err.cause && err.cause.name === 'AbortError')) {
      throw new Error('Ollama Network error (fetch failed): canceled');
    }
    throw err;
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

async function generateSection({ examName, sectionName, questionCount, language, signal, send, sectionIndex, initialQuestions = [] }) {
  let lastError = null;
  const questions = [...initialQuestions];
  const fs = require('fs');
  const logFile = 'd:\\Sazid\\Github\\aajexam\\ollama_debug.log';

  const BATCH_SIZE = 10;
  
  if (questions.length >= questionCount) return questions.slice(0, questionCount);

  for (let i = questions.length; i < questionCount; i += BATCH_SIZE) {
    const currentBatchSize = Math.min(BATCH_SIZE, questionCount - i);
    let successForThisBatch = false;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        fs.appendFileSync(logFile, `\n[${new Date().toISOString()}] Generating Q${i+1} to Q${i+currentBatchSize}, attempt ${attempt}\n`);
        const prompt = buildPrompt(examName, sectionName, currentBatchSize, language, lastError?.message, i + 1, questionCount, questions);
        const raw = await callOllama(prompt, signal, (currentText) => {
          if (send && sectionIndex !== undefined) {
            send({
              type: 'section_stream',
              index: sectionIndex,
              text: currentText,
            });
          }
        });
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Received response length: ${raw?.length}\n`);
        const parsed = parseQuestions(raw, currentBatchSize);
        
        if (parsed.length > 0) {
          questions.push(...parsed);
          successForThisBatch = true;
          lastError = null;
          fs.appendFileSync(logFile, `[${new Date().toISOString()}] Successfully parsed batch (got ${parsed.length} questions)\n`);

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
          break; // success, move to next batch
        }
      } catch (err) {
        lastError = err;
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Error parsing batch starting at Q${i+1}: ${err.message}\nRaw response:\n${err.message.includes('No JSON') ? '...omitted...' : err.message}\n`);
        if (attempt < 3) await sleep(2000);
      }
    }

    if (!successForThisBatch) {
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Failed batch starting at Q${i+1} after 3 attempts\n`);
      return { success: false, error: `Failed at question batch ${i + 1}-${i + currentBatchSize}: ` + (lastError?.message || 'Unknown error'), questions };
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
  const { examName, patternTitle, sections, language = 'en', existingState = [] } = body;

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
        const state = existingState[i];

        // If this section is already fully generated, skip generating it again
        if (state && state.status === 'DONE' && state.questions && state.questions.length >= section.totalQuestions) {
          if (send) {
            send({ type: 'section_done', index: i, sectionName: section.name, questions: state.questions });
          }
          allSectionResults.push({ sectionName: section.name, error: null, questions: state.questions });
          if (i < sections.length - 1) {
            await sleep(QUIZ_AI_DELAY_MS);
          }
          continue;
        }

        const initialQuestions = (state && state.questions) ? state.questions : [];

        if (send) {
          send({ type: 'section_start', index: i, sectionName: section.name });
        }

        const result = await generateSection({
          examName,
          sectionName: section.name,
          questionCount: section.totalQuestions,
          language,
          signal: req.signal,
          send,
          sectionIndex: i,
          initialQuestions
        });

        if (result.success) {
          const questionsWithSection = result.questions.map((q) => ({
            ...q,
            section: section.name,
          }));
          allSectionResults.push({ sectionName: section.name, questions: questionsWithSection });
          send({
            type: 'section_done',
            index: i,
            sectionName: section.name,
            count: questionsWithSection.length,
            questions: questionsWithSection,
          });
        } else {
          const partialQ = result.questions || [];
          const questionsWithSection = partialQ.map((q) => ({
            ...q,
            section: section.name,
          }));
          allSectionResults.push({ sectionName: section.name, error: result.error, questions: questionsWithSection });
          send({
            type: 'section_error',
            index: i,
            sectionName: section.name,
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
