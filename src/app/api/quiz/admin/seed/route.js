import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import Topic from '@/models/Topic';
import { protect, admin } from '@/middleware/auth';

// ═══════════════════════════════════════════════════════════════
// UNIQUE SUBJECTS & TOPICS FOR ALL INDIAN COMPETITIVE EXAMS
// Subjects are exam-independent. One "General Knowledge" for all.
// Topics belong to a subject. One "Current Affairs" under "General Knowledge".
// ═══════════════════════════════════════════════════════════════

const SEED_DATA = {
    // ── General Studies / GK ──
    "General Knowledge": ["Indian History", "Medieval History", "Modern History", "Indian National Movement", "World History", "Art & Culture", "Indian Polity", "Constitution of India", "Judiciary", "Governance", "Indian Geography", "World Geography", "Indian Economy", "General Science", "Static GK", "Current Affairs", "Awards & Honours", "Books & Authors", "Important Days", "Sports", "Government Schemes"],
    "History": ["Ancient India", "Medieval India", "Modern India", "Indian National Movement", "World History", "Art & Culture", "Post-Independence India", "Freedom Fighters"],
    "Polity & Governance": ["Constitution of India", "Fundamental Rights & Duties", "Parliament & State Legislature", "Judiciary", "Panchayati Raj & Municipalities", "Governance & Public Policy", "International Relations", "Separation of Powers", "Constitutional Amendments", "Election Commission"],
    "Geography": ["Physical Geography", "Indian Geography", "World Geography", "Climatology", "Oceanography", "Environment & Ecology", "Biodiversity", "Climate Change", "Disaster Management", "Rivers & Lakes", "Soil Types"],
    "Economy": ["Macroeconomics", "Microeconomics", "Indian Economy", "Budget & Economic Survey", "Banking & Finance", "Taxation", "Poverty & Unemployment", "Sustainable Development", "International Trade", "Agriculture Economy", "Economic Reforms"],
    "General Science": ["Physics Basics", "Chemistry Basics", "Biology Basics", "Life Science", "Human Body", "Nutrition", "Diseases", "Environment", "Inventions & Discoveries"],

    // ── Quantitative / Maths ──
    "Quantitative Aptitude": ["Number System", "Percentage", "Profit & Loss", "Simple & Compound Interest", "Ratio & Proportion", "Average", "Time Speed & Distance", "Work & Time", "Mixture & Alligation", "LCM & HCF", "Simplification", "Surds & Indices", "Partnership"],
    "Mathematics": ["Number System", "Algebra", "Geometry", "Mensuration", "Trigonometry", "Statistics", "Probability", "Calculus", "Coordinate Geometry", "Percentage", "Profit & Loss", "Time & Distance", "Time & Work", "Interest", "Ratio & Proportion", "Determinants"],
    "Advanced Maths": ["Algebra", "Geometry & Mensuration", "Trigonometry", "Statistics", "Coordinate Geometry", "Calculus"],
    "Data Interpretation": ["Bar Graphs", "Pie Charts", "Line Graphs", "Tabulation", "Caselets", "Data Sufficiency", "Mixed DI"],
    "Engineering Mathematics": ["Linear Algebra", "Calculus", "Differential Equations", "Complex Analysis", "Probability & Statistics", "Numerical Methods", "Discrete Mathematics", "Transform Theory"],

    // ── Reasoning ──
    "Reasoning Ability": ["Analogy", "Classification", "Series", "Coding-Decoding", "Blood Relations", "Direction Sense", "Syllogism", "Matrix", "Word Arrangement", "Venn Diagram", "Missing Number", "Statement & Conclusion", "Order & Ranking", "Inequality", "Embedded Figures", "Paper Folding", "Mirror Image", "Non-Verbal Reasoning"],
    "Logical Reasoning": ["Syllogism", "Blood Relations", "Coding-Decoding", "Seating Arrangement", "Puzzles", "Ranking & Order", "Inequalities", "Input-Output", "Data Sufficiency", "Critical Reasoning", "Assumptions & Conclusions"],
    "Analytical Reasoning": ["Statement & Assumptions", "Cause & Effect", "Course of Action", "Input-Output", "Decision Making", "Strengthening & Weakening"],

    // ── English ──
    "English Language": ["Reading Comprehension", "Cloze Test", "Error Spotting", "Fill in the Blanks", "Synonyms & Antonyms", "One Word Substitution", "Idioms & Phrases", "Active-Passive Voice", "Direct-Indirect Speech", "Sentence Improvement", "Sentence Rearrangement", "Spelling Correction", "Para Jumbles", "Vocabulary", "Grammar Rules"],
    "Vocabulary": ["Synonyms & Antonyms", "One Word Substitution", "Idioms & Phrases", "Spelling Test", "Word Usage", "Foreign Words"],
    "English Grammar": ["Error Spotting", "Fill in the Blanks", "Active-Passive Voice", "Direct-Indirect Speech", "Sentence Improvement", "Subject-Verb Agreement", "Tenses", "Articles", "Prepositions", "Conjunctions"],
    "Comprehension": ["Reading Comprehension", "Cloze Test", "Para Jumbles", "Para Summary", "Inference Based"],

    // ── Science Subjects (NEET/JEE) ──
    "Physics": ["Mechanics", "Laws of Motion", "Work Energy Power", "Rotational Motion", "Gravitation", "Properties of Matter", "Thermodynamics", "Kinetic Theory", "Oscillations & Waves", "Electrostatics", "Current Electricity", "Magnetic Effects", "EMI & AC", "Optics", "Dual Nature of Matter", "Atoms & Nuclei", "Semiconductor", "Modern Physics"],
    "Chemistry": ["Atomic Structure", "Chemical Bonding", "States of Matter", "Thermodynamics", "Equilibrium", "Redox Reactions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry", "p-Block Elements", "d & f Block Elements", "Coordination Compounds", "Organic Chemistry", "Hydrocarbons", "Haloalkanes", "Alcohols & Phenols", "Aldehydes & Ketones", "Amines", "Biomolecules", "Polymers", "Chemistry in Everyday Life"],
    "Biology": ["Cell Structure", "Cell Division", "Biomolecules", "Plant Physiology", "Photosynthesis", "Respiration", "Human Physiology", "Digestion", "Breathing", "Body Fluids & Circulation", "Excretion", "Locomotion", "Neural Control", "Reproduction", "Genetics", "Molecular Biology", "Evolution", "Human Health & Disease", "Biotechnology", "Ecology", "Biodiversity", "Environmental Issues"],

    // ── Banking / Finance ──
    "Banking Awareness": ["RBI Functions", "Monetary Policy", "Financial Terms", "Digital Banking", "Banking History", "SEBI", "NABARD", "Insurance", "Financial Inclusion", "Basel Norms", "NPA"],
    "Computer Knowledge": ["Computer Basics", "MS Office", "Internet & Networking", "Hardware & Software", "Cyber Security", "Database Basics", "Operating Systems", "Computer Abbreviations", "Programming Basics"],
    "Financial Awareness": ["Indian Financial System", "Capital Markets", "Insurance Sector", "Mutual Funds", "Foreign Exchange", "Budget Terminology", "Economic Indicators"],

    // ── Specialized ──
    "Ethics & Integrity": ["Ethics & Human Interface", "Emotional Intelligence", "Attitude & Aptitude", "Civil Service Values", "Probity in Governance", "Case Studies", "Ethical Thinkers & Philosophers", "Corporate Governance"],
    "Science & Technology": ["Space Technology", "Defense Technology", "Biotechnology", "Nuclear Technology", "AI & Robotics", "Nanotechnology", "IT & Computers", "Health & Medicine", "Indigenization of Technology"],
    "Current Affairs": ["National Events", "International Events", "Awards & Honours", "Sports", "Summits & Conferences", "Government Schemes", "Important Appointments", "Science & Tech News", "Economy News"],
    "Child Development & Pedagogy": ["Growth & Development", "Piaget's Theory", "Vygotsky's Theory", "Kohlberg's Theory", "Learning Theories", "Motivation & Learning", "Intelligence", "Inclusive Education", "Assessment & Evaluation", "Language Development", "Children with Special Needs"],
    "General Aptitude": ["Verbal Ability", "Numerical Ability", "Spatial Aptitude", "Analytical Ability", "Critical Reasoning"],
    "Legal Reasoning": ["Constitutional Law", "Criminal Law", "Contracts", "Torts", "Legal Maxims", "Legal GK", "Important Judgments"],
    "Hindi Language": ["Hindi Grammar", "Comprehension", "Vocabulary", "Muhavare & Lokoktiyan", "Error Correction", "Essay Writing", "Patra Lekhan"],
    "Essay Writing": ["Philosophical Topics", "Social Issues", "Economic Topics", "Political Topics", "Science & Tech Topics", "Environmental Topics"],
    "State Specific GK": ["State History", "State Geography", "State Polity", "State Economy", "Culture & Heritage", "State Schemes", "Important Personalities"],
};

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const body = await req.json().catch(() => ({}));
        const cleanFirst = body.clean === true;

        // Drop old compound indexes that conflict with new unique(name) index
        try {
            const subCollection = mongoose.connection.collection('subjects');
            const topCollection = mongoose.connection.collection('topics');
            // Drop old indexes safely
            const subIndexes = await subCollection.indexes();
            for (const idx of subIndexes) {
                if (idx.key?.exam && idx.key?.name) {
                    await subCollection.dropIndex(idx.name).catch(() => {});
                }
            }
            const topIndexes = await topCollection.indexes();
            for (const idx of topIndexes) {
                if (idx.key?.subject && idx.key?.name && idx.unique) {
                    await topCollection.dropIndex(idx.name).catch(() => {});
                }
            }
        } catch (e) {
            console.log('Index cleanup note:', e.message);
        }

        // Clean duplicates if requested
        if (cleanFirst) {
            await Subject.deleteMany({});
            await Topic.deleteMany({});
        }

        let subjectsCreated = 0;
        let topicsCreated = 0;
        let skipped = 0;

        for (const [subjectName, topicNames] of Object.entries(SEED_DATA)) {
            // Upsert subject by name only
            let subject;
            try {
                subject = await Subject.findOneAndUpdate(
                    { name: subjectName },
                    { name: subjectName, isActive: true },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                subjectsCreated++;
            } catch (e) {
                subject = await Subject.findOne({ name: subjectName });
                if (subject) skipped++;
                else continue;
            }

            // Upsert topics by name only
            let topicOrder = 0;
            for (const topicName of topicNames) {
                topicOrder++;
                try {
                    await Topic.findOneAndUpdate(
                        { name: topicName },
                        { name: topicName, subject: subject._id, isActive: true, order: topicOrder },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                    topicsCreated++;
                } catch (e) {
                    skipped++;
                }
            }
        }

        // Ensure new indexes exist
        await Subject.syncIndexes().catch(() => {});
        await Topic.syncIndexes().catch(() => {});

        return NextResponse.json({
            success: true,
            message: `Seeded ${Object.keys(SEED_DATA).length} subjects`,
            stats: {
                subjectsCreated,
                topicsCreated,
                skipped,
                totalSubjects: Object.keys(SEED_DATA).length,
                totalTopics: Object.values(SEED_DATA).flat().length,
                cleaned: cleanFirst
            }
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
