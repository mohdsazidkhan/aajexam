// Exam-syllabus "family" merge: near-synonym / sub-variant topics -> ONE canonical chapter name (e.g. Coding, Alphabet, Interest ...).
// Members are matched by normalized name across live (active, non-merged) topics; Hindi / state-specific / computer-container
// subjects are excluded unless a family says otherwise. Survivor = member already named like the canonical (else the biggest member,
// which is RENAMED to the canonical name + slug regenerated, old slug kept in previousSlugs).
// Repoints .topic AND .subject on questions/quizzes/studynotes/flashcarddecks. Dry-run unless --go. Backup first.
const fs = require('fs');
const path = require('path');
const m = require('mongoose');
const env = fs.readFileSync(path.join(__dirname, '../../.env.local'), 'utf8');
const uri = env.match(/^MONGO_URI=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '');
const GO = process.argv.includes('--go');
const REF_COLS = ['questions', 'quizzes', 'studynotes', 'flashcarddecks'];
const EXCLUDE_SUBJECTS = new Set(['General Hindi', 'Hindi', 'Hindi Language', 'Language I (Hindi)', 'Language II (Hindi)', 'Rajasthan GK', 'Rajasthan General Studies', 'Haryana GK', 'State Specific GK', 'Computer Awareness / Fundamentals']);
const HINDI_SUBJECTS = new Set(['Hindi', 'General Hindi', 'Hindi Language']);
const F = (canonical, members, opts = {}) => ({ canonical, members, ...opts });
const FAMILIES = [
    // ---- Reasoning
    F('Number Series', ['Arithmetic Number Series', 'Number Series', 'Series', 'Logical Series', 'Missing Number']),
    F('Non-Verbal Reasoning', ['Non-Verbal', 'Non-Verbal Series', 'Non-Verbal Reasoning']),
    F('Analogy', ['Analogies', 'Analogy']),
    F('Arithmetic Reasoning', ['Arithmetic Reasoning', 'Arithmetical Reasoning and Figural Classification']),
    F('Mathematical Operations', ['Mathematical Operations', 'Operations']),
    F('Order & Ranking', ['Order & Ranking', 'ranking']),
    F('Direction Sense', ['Direction', 'Direction Sense']),
    F('Seating Arrangement', ['Seating Arrangement', 'Circular Seating']),
    F('Puzzles', ['Puzzles', 'Box', 'Floor']),
    F('Input-Output', ['Input-Output', 'Machine Input']),
    F('Inequalities', ['Inequalities', 'Inequality']),
    F('Statement & Assumptions', ['Statement & Assumptions', 'Assumptions & Conclusions']),
    F('Classification', ['Classification', 'Number Classification', 'Odd One Out']),
    // ---- Quant
    F('Ratio & Proportion', ['Ratio & Proportion', 'Ratio', 'Proportion']),
    F('LCM & HCF', ['LCM & HCF', 'LCM', 'HCF']),
    F('Simple & Compound Interest', ['Simple & Compound Interest', 'Simple Interest', 'Compound Interest', 'Interest']),
    F('Profit & Loss', ['Profit & Loss', 'Profit', 'Discount']),
    F('Time Speed & Distance', ['Time Speed & Distance', 'Speed', 'Speed & Distance', 'Time and Distance', 'Speed Conversion']),
    F('Time & Work', ['Time & Work', 'Work & Time', 'Work']),
    F('Number System', ['Number System', 'Numbers', 'Number Theory', 'Divisibility']),
    F('Square Roots & Cube Roots', ['Square Roots', 'Squares', 'Cube', 'Cube Roots', 'Roots']),
    F('Surds & Indices', ['Surds & Indices', 'Indices']),
    F('Decimals & Fractions', ['Decimals & Fractions', 'Decimals and Fractions', 'Decimals', 'Fractions']),
    F('Simplification', ['Simplification', 'BODMAS', 'Computation of Whole Numbers', 'Fundamental Arithmetical Operations']),
    F('Mensuration', ['Mensuration', 'Perimeter']),
    // ---- English
    F('Synonyms & Antonyms', ['Synonyms & Antonyms', 'Synonyms', 'Synonym', 'Antonym', 'Synonyms/Homonyms']),
    F('Error Spotting', ['Error Spotting', 'Spot the Error', { n: 'Error', not: ['Numerical & Mental Ability'] }]),
    F('Active & Passive Voice', ['Voice', 'Voice Change', 'Active-Passive Voice', 'Active/Passive Voice of Verbs']),
    F('Direct & Indirect Speech', ['Narration', 'Reported', 'Reported Speech', 'Direct-Indirect Speech']),
    F('Idioms & Phrases', ['Idioms & Phrases', 'Idiom', 'Phrases']),
    F('Phrasal Verbs', ['Phrasal Verbs', 'Phrasal']),
    F('Spelling', ['Spelling', 'Spelling Correction', 'Spelling Test', 'Spellings/Detecting Mis-spelt words']),
    F('Fill in the Blanks', ['Fill in the Blanks', 'fillups', 'Fillers']),
    F('Sentence Improvement', ['Sentence Improvement', 'Correct Sentence', 'Phrase Replacement']),
    F('Para Jumbles', ['Para Jumbles', 'Sentence Rearrangement']),
    F('Reading Comprehension', ['Reading Comprehension', 'Comprehension Passage', 'Inference Based', 'Para Summary']),
    // ---- GK / Current Affairs / Banking
    F('Important Appointments', ['Important Appointments', 'Appointments']),
    F('Awards & Honours', ['Awards & Honours', 'Awards']),
    F('Books & Authors', ['Books & Authors', 'Books']),
    F('Digital Banking & Payments', ['Digital Banking', 'Digital Payments', 'Payments', 'Banking Technology']),
    F('Insurance', ['Insurance', 'Insurance Schemes', 'Insurance Sector']),
    F('Capital Markets', ['Capital Markets', 'Stock Market', 'Financial Markets']),
    F('Monetary Policy', ['Monetary Policy', 'Monetary Aggregates']),
    F('Constitution of India', ['Constitution of India', 'Indian Constitution']),
    F('Fundamental Rights & Duties', ['Fundamental Rights & Duties', 'Fundamental Rights']),
    F('Parliament & State Legislature', ['Parliament & State Legislature', 'Parliament', 'Lok Sabha', 'Rajya Sabha']),
    F('Panchayati Raj & Municipalities', ['Panchayati Raj & Municipalities', 'Panchayati Raj']),
    F('Indian Polity', ['Indian Polity', 'Polity', 'Polity & Governance']),
    F('Governance & Public Policy', ['Governance & Public Policy', 'Governance']),
    F('Ancient History', ['Ancient History', 'Ancient India', 'Maurya', 'Indus Valley', 'Vedic Age', 'Buddhism'], { prefer: 'History' }),
    F('Medieval History', ['Medieval History', 'Medieval India', 'Chalukya', 'Hoysala', 'Vijayanagara'], { prefer: 'History' }),
    F('Modern History', ['Modern History', 'Modern India'], { prefer: 'History' }),
    F('Indian National Movement', ['Indian National Movement', 'Freedom Fighters']),
    F('Indian History', ['Indian History', 'History']),
    F('Indian Geography', ['Indian Geography', 'India Geography', 'Geography']),
    F('Physical Geography', ['Physical Geography', 'Earth', 'Geology', 'Oceanography']),
    F('Climatology', ['Climatology', 'Climate Change']),
    F('Rivers & Lakes', ['Rivers & Lakes', 'Rivers']),
    F('Indian Economy', ['Indian Economy', 'Economy', 'Economics', 'Economic Scene']),
    F('Agriculture Economy', ['Agriculture Economy', 'Agriculture', 'Agriculture Finance', 'Rural Economy']),
    F('Budget & Economic Survey', ['Budget & Economic Survey', 'Budget Terminology']),
    F('Foreign Exchange', ['Foreign Exchange', 'International Finance']),
    F('Current Affairs', ['Current Affairs', 'Economy News', 'Science & Tech News', 'National Events', 'International Events']),
    F('International Organisations', ['International Organisations', 'International Organizations', 'International Reports']),
    F('Science & Technology', ['Science & Technology', 'Technology']),
    F('Space Technology', ['Space Technology', 'Space', 'Astronomy']),
    F('Environment & Ecology', ['Environment & Ecology', 'Environment']),
    F('Human Physiology', ['Human Physiology', 'Human Body']),
    F('Human Health & Disease', ['Human Health & Disease', 'Diseases']),
    F('Nutrition', ['Nutrition', 'Vitamins']),
    F('Networking & Internet', ['Networking & Internet', 'Internet & Networking', 'networking', 'Internet']),
    F('DBMS', ['DBMS', 'Database Basics']),
    F('Programming Fundamentals', ['Programming Fundamentals', 'Programming Basics']),
    // ---- Hindi (Hindi-domain subjects only)
    F('Samas', ['Samas', 'Samasa'], { hindi: true }),
    F('Muhavare & Lokoktiyan', ['Muhavare & Lokoktiyan', 'Muhavare', 'कहावतें व लोकोक्तियां'], { hindi: true }),
];

const MAX_LEN = 120;
const slugify = (input) => {
    const raw = String(input || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
    const c = raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!c) return 'item';
    if (c.length <= MAX_LEN) return c;
    const t = c.slice(0, MAX_LEN); const h = t.lastIndexOf('-');
    return (h > 60 ? t.slice(0, h) : t).replace(/-+$/, '');
};
const norm = s => String(s || '').normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();

(async () => {
    await m.connect(uri);
    const db = m.connection.db;
    if (GO) { const r = await db.collection('topics').find({ slug: { $in: [null, ''] } }).toArray(); for (const t of r) await db.collection('topics').updateOne({ _id: t._id }, { $set: { slug: `merged-${t._id}` } }); console.log('repaired null slugs', r.length); }
    const subj = new Map((await db.collection('subjects').find({}).toArray()).map(s => [String(s._id), s.name]));
    const topics = await db.collection('topics').find({ mergedInto: { $exists: false }, isActive: { $ne: false } }).toArray();
    const cnt = new Map();
    for (const c of REF_COLS) (await db.collection(c).aggregate([{ $group: { _id: '$topic', n: { $sum: 1 } } }]).toArray()).forEach(x => cnt.set(String(x._id), (cnt.get(String(x._id)) || 0) + x.n));
    const used = t => cnt.get(String(t._id)) || 0;
    const claimed = new Set();
    const plan = [];
    for (const f of FAMILIES) {
        const specs = f.members.map(x => typeof x === 'string' ? { n: x, not: [] } : x);
        const docs = topics.filter(t => {
            if (claimed.has(String(t._id))) return false;
            const sn = subj.get(String(t.subject));
            if (f.hindi ? !HINDI_SUBJECTS.has(sn) : EXCLUDE_SUBJECTS.has(sn)) return false;
            return specs.some(s => norm(s.n) === norm(t.name) && !s.not.includes(sn));
        });
        if (docs.length < 2) continue;
        docs.forEach(d => claimed.add(String(d._id)));
        const pref = d => (f.prefer && subj.get(String(d.subject)) === f.prefer ? 1 : 0);
        docs.sort((a, b) => pref(b) - pref(a) || (norm(b.name) === norm(f.canonical)) - (norm(a.name) === norm(f.canonical)) || used(b) - used(a));
        const survivor = docs[0];
        plan.push({ f, survivor, losers: docs.slice(1), rename: norm(survivor.name) !== norm(f.canonical) || survivor.name !== f.canonical });
    }
    let moveQ = 0;
    for (const p of plan) {
        const ids = p.losers.map(l => l._id);
        const q = await db.collection('questions').countDocuments({ topic: { $in: ids } });
        moveQ += q;
        console.log(`${p.f.canonical} <= KEEP "${p.survivor.name}"[${subj.get(String(p.survivor.subject))}:${used(p.survivor)}]${p.rename ? ' (rename)' : ''} + ${p.losers.map(l => `"${l.name}"[${subj.get(String(l.subject))}:${used(l)}]`).join(', ')}`);
    }
    console.log('families', plan.length, 'losers', plan.reduce((s, p) => s + p.losers.length, 0), 'questions to move', moveQ, 'renames', plan.filter(p => p.rename).length);
    // collision guard for renames: (subject, name) unique and (subject, slug) unique
    for (const p of plan.filter(p => p.rename)) {
        const clash = await db.collection('topics').findOne({ subject: p.survivor.subject, _id: { $ne: p.survivor._id }, mergedInto: { $exists: false }, $or: [{ name: p.f.canonical }, { slug: slugify(p.f.canonical) }] });
        if (clash && !p.losers.some(l => String(l._id) === String(clash._id))) { console.log('!! rename clash for', p.f.canonical, 'with', clash.name, clash.slug); p.blocked = true; }
    }
    if (!GO) { console.log('DRY RUN'); return m.disconnect(); }

    const run = plan.filter(p => !p.blocked);
    const backup = { topics: [], refs: {} };
    for (const c of REF_COLS) backup.refs[c] = [];
    for (const p of run) {
        backup.topics.push(p.survivor, ...p.losers);
        for (const c of REF_COLS) backup.refs[c].push(...await db.collection(c).find({ topic: { $in: p.losers.map(l => l._id) } }, { projection: { _id: 1, topic: 1, subject: 1 } }).toArray());
    }
    const bak = path.join(__dirname, `topic_merge_families_backup_${Date.now()}.json`);
    fs.writeFileSync(bak, JSON.stringify(backup));
    console.log('backup ->', bak);
    const now = new Date();
    for (const p of run) {
        const s = p.survivor;
        for (const l of p.losers) for (const c of REF_COLS) await db.collection(c).updateMany({ topic: l._id }, { $set: { topic: s._id, subject: s.subject } });
        const prev = new Set(s.previousSlugs || []);
        const exams = new Map((s.exams || []).map(e => [String(e), e]));
        for (const l of p.losers) { if (l.slug) prev.add(l.slug); (l.previousSlugs || []).forEach(x => prev.add(x)); (l.exams || []).forEach(e => exams.set(String(e), e)); }
        const set = { exams: [...exams.values()], updatedAt: now };
        if (p.rename) {
            set.name = p.f.canonical;
            const base = slugify(p.f.canonical);
            let cand = base, n = 1;
            while (await db.collection('topics').findOne({ subject: s.subject, slug: cand, _id: { $nin: [s._id, ...p.losers.map(l => l._id)] } })) { n++; cand = `${base}-${n}`; }
            if (s.slug && s.slug !== cand) prev.add(s.slug);
            set.slug = cand;
        }
        if (set.slug) prev.delete(set.slug);
        set.previousSlugs = [...prev];
        // free the loser slugs first so the survivor can take a loser's slug without a unique-index clash
        // (subject, slug) unique index is NOT sparse in effect (subject always present), so a missing slug counts as null -> use a unique placeholder
        for (const l of p.losers) await db.collection('topics').updateOne({ _id: l._id }, { $set: { mergedInto: s._id, isActive: false, slug: `merged-${l._id}`, updatedAt: now } });
        await db.collection('topics').updateOne({ _id: s._id }, { $set: set });
    }
    const all = run.flatMap(p => p.losers.map(l => l._id));
    for (const c of REF_COLS) console.log('left on losers', c, await db.collection(c).countDocuments({ topic: { $in: all } }));
    await m.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
