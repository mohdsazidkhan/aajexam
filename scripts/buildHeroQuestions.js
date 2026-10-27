// Builds src/data/heroQuestions.json: 100 short, text-only questions for the landing-page quiz card, taken
// as 5 questions from each of 20 quizzes spread across exams, subjects and topics. The card shows 5 random ones per load straight from
// this file, so the landing page needs no API call.
//
// Usage: node scripts/buildHeroQuestions.js          (dry run: prints the spread)
//        node scripts/buildHeroQuestions.js --write  (writes src/data/heroQuestions.json)
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const WRITE = process.argv.includes('--write');
const QUIZZES = 20;
const PER_QUIZ = 5; // 20 quizzes x 5 questions = 100
const FAKE_EXAM = /central board of secondary education/i; // not a real exam, never show it

// Same rules the old /api/public/sample-quiz hero used: short, English, four options, one correct answer,
// nothing that points at a picture, table or passage the card cannot show.
const NO_DEVANAGARI = { $not: /[ऀ-ॿ]/ };
const NEEDS_CONTEXT = { $not: /[ऀ-ॿ]|figure|diagram|image|picture|shown|highlight|underline|passage|given below|above/i };
const FILTER = {
    isActive: true,
    image: '',
    source: { $ne: 'practice_embedded' },
    questionText: NEEDS_CONTEXT,
    'options.text': NO_DEVANAGARI,
    $expr: {
        $and: [
            { $eq: [{ $size: '$options' }, 4] },
            { $lte: [{ $strLenCP: '$questionText' }, 140] },
            { $lte: [{ $max: { $map: { input: '$options', as: 'o', in: { $strLenCP: '$$o.text' } } } }, 40] },
            { $eq: [{ $size: { $filter: { input: '$options', as: 'o', cond: '$$o.isCorrect' } } }, 1] },
        ],
    },
};

const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    const quizzes = await db.collection('quizzes').find(
        { type: 'subject_test', status: 'published', 'questions.0': { $exists: true } },
        { projection: { title: 1, applicableExams: 1, subject: 1, topic: 1, questions: 1 } },
    ).toArray();

    const nameMap = async (col, ids) => {
        const rows = await db.collection(col).find({ _id: { $in: [...new Set(ids.map(String))].map((i) => new mongoose.Types.ObjectId(i)) } }, { projection: { name: 1, title: 1 } }).toArray();
        return new Map(rows.map((r) => [String(r._id), r.name || r.title || '']));
    };
    const exams = await nameMap('exams', quizzes.flatMap((q) => q.applicableExams || []));
    const subjects = await nameMap('subjects', quizzes.map((q) => q.subject).filter(Boolean));
    const topics = await nameMap('topics', quizzes.map((q) => q.topic).filter(Boolean));

    // group quizzes by exam + subject, shuffled, then take one quiz per group in turn so the quizzes are spread out
    const groups = new Map();
    for (const qz of quizzes) {
        const examName = (qz.applicableExams || []).map((e) => exams.get(String(e))).find((n) => n && !FAKE_EXAM.test(n));
        if (!examName) continue;
        const key = `${examName}|${subjects.get(String(qz.subject)) || ''}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push({ qz, examName });
    }
    const lists = shuffle([...groups.values()].map((l) => shuffle(l)));

    // a quiz is used only if it has at least PER_QUIZ questions that pass the filter; 5 random ones are taken
    const out = [];
    const seenTopic = new Set();
    let used = 0;
    for (let round = 0; used < QUIZZES && round < 200; round++) {
        for (const l of lists) {
            if (used >= QUIZZES) break;
            const i = l.findIndex(({ qz, examName }) => !seenTopic.has(`${examName}|${subjects.get(String(qz.subject))}|${topics.get(String(qz.topic))}`));
            const pick = i >= 0 ? l.splice(i, 1)[0] : l.shift();
            if (!pick) continue;
            const { qz, examName } = pick;
            const docs = await db.collection('questions').find({ _id: { $in: qz.questions }, ...FILTER }, { projection: { questionText: 1, options: 1 } }).toArray();
            if (docs.length < PER_QUIZ) continue;
            const subject = subjects.get(String(qz.subject)) || '';
            const topic = topics.get(String(qz.topic)) || '';
            seenTopic.add(`${examName}|${subject}|${topic}`);
            shuffle(docs).slice(0, PER_QUIZ).forEach((doc) => out.push({
                id: String(doc._id),
                exam: examName,
                subject,
                topic,
                quiz: qz.title,
                q: doc.questionText,
                o: doc.options.map((o) => o.text),
                a: doc.options.findIndex((o) => o.isCorrect),
            }));
            used++;
        }
    }

    const count = (k) => new Set(out.map((r) => r[k])).size;
    console.log(`quizzes ${quizzes.length}, usable groups ${groups.size}, picked ${out.length} questions from ${used} quizzes`);
    console.log(`distinct exams ${count('exam')}, subjects ${count('subject')}, topics ${count('topic')}, quizzes ${count('quiz')}`);

    if (WRITE) {
        const file = path.join(__dirname, '..', 'src', 'data', 'heroQuestions.json');
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify(out));
        console.log('wrote', file, `(${(fs.statSync(file).size / 1024).toFixed(1)} KB)`);
    } else {
        console.log('dry run, pass --write to save');
    }
    await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
