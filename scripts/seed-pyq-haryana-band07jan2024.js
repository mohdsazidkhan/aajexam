/**
 * Seed: Haryana Police Constable (Band) - 07 Jan 2024
 * Haryana Police Constable written exam (scanned bilingual paper, English version
 * seeded). 100 Q x 1 mark, 4 options, no negative marking. Reuses Exam
 * `HR-POL-CONST` + ExamPattern 'Haryana Police Written Exam'. The scan carried no
 * official key (only unreliable hand-marks) -> answers derived by independent
 * solving; Haryana-state-specific GK falls back to the scan marks.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not found'); process.exit(1); }

const examPatternSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  title: { type: String, required: true, trim: true },
  duration: { type: Number }, totalMarks: { type: Number }, negativeMarking: { type: Number },
  sections: [{ name: String, totalQuestions: Number, marksPerQuestion: Number,
    negativePerQuestion: Number, sectionDuration: Number }]
}, { timestamps: true });
const examSchema = new mongoose.Schema({
  category: mongoose.Schema.Types.ObjectId, name: String, code: String
}, { timestamps: true });
const practiceTestSchema = new mongoose.Schema({
  examPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern', required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, lowercase: true, trim: true },
  totalMarks: { type: Number, required: true }, duration: { type: Number, required: true },
  accessLevel: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
  isPYQ: { type: Boolean, default: false }, pyqYear: { type: Number, default: null },
  pyqShift: { type: String, default: null }, pyqExamName: { type: String, default: null },
  publishedAt: { type: Date, default: Date.now },
  questions: [{
    questionText: { type: String, required: true },
    questionImage: { type: String, default: '' },
    options: [{ type: String, required: true }],
    optionImages: [{ type: String, default: '' }],
    correctAnswerIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, trim: true },
    explanationImage: { type: String, default: '' },
    section: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    difficulty: { type: String, enum: ['easy','medium','hard','mixed'], default: 'medium' }
  }]
}, { timestamps: true });

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

const TAGS = ["Haryana Police", "Constable", "PYQ", "2024", "Haryana Police Constable (Band) - 07 Jan 2024"];
const RAW = [
  { n: 1, s: "Haryana GK", q: "The Indus Valley Civilisation site Rakhigarhi is located in which of the following districts of Haryana?", o: ["Jind", "Hisar", "Kaithal", "Sirsa"], a: 1 },
  { n: 2, s: "Haryana GK", q: "The Anang Dam/Anandpur Bandh is located in which of the following districts of Haryana?", o: ["Rohtak", "Panipat", "Nuh", "Faridabad"], a: 3 },
  { n: 3, s: "General Studies", q: "Who among the following had originally composed our National Anthem Jana-gana-mana in Bangla?", o: ["Munshi Premchand", "Harivansh Rai Bachchan", "Rabindranath Tagore", "Chittaranjan Das"], a: 2 },
  { n: 4, s: "Haryana GK", q: "Which of the following fairs is known as Chaitra Chaudas Mela?", o: ["Phalgu Fair", "Pehowa Fair", "Baba Chetar Fair", "Mansa Devi Fair"], a: 2 },
  { n: 5, s: "Haryana GK", q: "Teej or Haryali Teej is observed throughout the state of Haryana in which of the following months?", o: ["Savan", "Chaitra", "Magh", "Phalgun"], a: 0 },
  { n: 6, s: "General Studies", q: "Who among the following is known as Iron Man of India?", o: ["Dr. B. R. Ambedkar", "Sardar Vallabhbhai Patel", "Subhash Chandra Bose", "Gopal Krishna Gokhale"], a: 1 },
  { n: 7, s: "General Studies", q: "In Gangaur Puja which of the following pair of God-Goddess is worshiped?", o: ["Ishwar and Gangaur (Lord Shiva and Parvati)", "Lord Vishnu and Goddess Lakshmi", "Lord Ganesh and Goddesses Riddhi and Siddhi", "Lord Krishna and Radhaji"], a: 0 },
  { n: 8, s: "Haryana GK", q: "Which of the following famous tourist place of Haryana is situated in Bhiwani district?", o: ["Nahar Singh Mahal", "Kalpana Chawla Planetarium", "Star Monument", "Miran Sahib Tomb"], a: 2 },
  { n: 9, s: "General Studies", q: "In which of the following languages were the Vedas composed?", o: ["Pali", "Prakrit", "Sanskrit", "Tamil"], a: 2 },
  { n: 10, s: "Haryana GK", q: "Total how many districts are there in the state of Haryana as on November, 2023?", o: ["21", "22", "28", "26"], a: 1 },
  { n: 11, s: "Haryana GK", q: "Who among the following was the first Chief Minister of Haryana state?", o: ["Shri Om Prakash Chautala", "Shri Bhajan Lal", "Shri Bansi Lal", "Shri Bhagwat Dayal Sharma"], a: 3 },
  { n: 12, s: "General Studies", q: "Who among the following is known as India's Father of the Nation?", o: ["Sardar Vallabhbhai Patel", "Mahatma Gandhi", "Motilal Nehru", "Jawaharlal Nehru"], a: 1 },
  { n: 13, s: "Band/Music", q: "Which of the following instruments is generally played by extending and shortening the slide?", o: ["Bag Pipe", "Tenor Trombone", "Side Drum", "Bass Drum"], a: 1 },
  { n: 14, s: "Band/Music", q: "A ring known as which of the following is used to attach the head to the shell, and the tuning bolts are tightened to tighten the head?", o: ["Hoop", "Loop", "Tube", "Canal"], a: 0 },
  { n: 15, s: "Band/Music", q: "Which of the following is advised to remove finger prints and dirt from the surface of the Saxophone?", o: ["Sand Paper", "Bloating Paper", "Polishing Cloth", "Filter Paper"], a: 2 },
  { n: 16, s: "Band/Music", q: "Chanter is the part of which of the following instruments?", o: ["Bb Clarinet", "Bag pipe", "Side Drum", "Eb Alto Saxophone"], a: 1 },
  { n: 17, s: "Band/Music", q: "Which of the following is used for the oiling of the rotary valve in Tenor Trombone?", o: ["Alcohol", "Coconut Oil", "Rotor Oil", "Slide Grease"], a: 2 },
  { n: 18, s: "Band/Music", q: "Which of the following instruments is a part of Pipe Band?", o: ["Bb Trumpet", "Bag Pipe", "Eb Alto Saxophone", "Tenor Trombone"], a: 1 },
  { n: 19, s: "Band/Music", q: "Most commonly how many piston valves are found in the Bb Trumpet?", o: ["1", "2", "3", "4"], a: 2 },
  { n: 20, s: "Band/Music", q: "Which of the following is used to be applied on the lugs of the drum in a very small amount to keep the bolts turning smoothly?", o: ["Any Cream", "Brass Instrument Grease", "Alcohol", "Olive Oil"], a: 1 },
  { n: 21, s: "Band/Music", q: "Nowadays which of the following is primarily used for the making of drum heads?", o: ["Cotton", "Jute", "Glass", "Plastic"], a: 3 },
  { n: 22, s: "Band/Music", q: "Which of the following musical instruments does belong to Percussion family of musical instruments?", o: ["Bass Drum", "Bb Trumpet", "Bb Clarinet", "Bb Tenor Saxophone"], a: 0 },
  { n: 23, s: "Band/Music", q: "Which of the following is used for cleaning of the tone holes of Bb Clarinet?", o: ["Sand Paper", "Toothpick", "Ear Bud", "Tone Hole Cleaner"], a: 3 },
  { n: 24, s: "Band/Music", q: "After playing Bb Trumpet the moisture must be removed from the body of the trumpet via which of the following?", o: ["Water Key", "Bell", "Main Slide", "Second Slide"], a: 0 },
  { n: 25, s: "Band/Music", q: "To play the Clarinet, in which of the following part of a Clarinet is air blown?", o: ["Upper Tube", "Key", "Mouthpiece", "Bell"], a: 2 }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'HR-POL-CONST' });
  if (!exam) throw new Error('Exam HR-POL-CONST not found — aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Haryana Police Written Exam' });
  if (!pattern) throw new Error('ExamPattern "Haryana Police Written Exam" not found — aborting.');

  const TEST_TITLE = "Haryana Police Constable (Band) - 07 Jan 2024";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  const questions = RAW.map(r => ({
    questionText: r.q, questionImage: '', options: r.o,
    optionImages: r.o.map(() => ''), correctAnswerIndex: r.a,
    explanation: '', section: r.s, tags: TAGS, difficulty: 'medium'
  }));

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 25, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2024,
    pyqShift: TEST_TITLE, pyqExamName: 'Haryana Police Constable', questions
  });
  console.log('Created PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
