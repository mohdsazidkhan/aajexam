/**
 * Seed: SSC GD Constable - Practice Test 3 (80 questions)
 * Run with: node scripts/seed-ssc-gd-pt-3.js
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

const examCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Central', 'State'], required: true },
  description: { type: String, trim: true }
}, { timestamps: true });

const examSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamCategory', required: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  logo: { type: String }
}, { timestamps: true });

const examPatternSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  title: { type: String, required: true, trim: true },
  duration: { type: Number, required: true, min: 1 },
  totalMarks: { type: Number, required: true, min: 0 },
  negativeMarking: { type: Number, default: 0, min: 0 },
  sections: [{
    name: { type: String, required: true, trim: true },
    totalQuestions: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, required: true, min: 0 },
    negativePerQuestion: { type: Number, default: 0, min: 0 },
    sectionDuration: { type: Number, min: 0 }
  }]
}, { timestamps: true });

const practiceTestSchema = new mongoose.Schema({
  examPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern', required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, lowercase: true, trim: true },
  totalMarks: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 1 },
  accessLevel: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
  isPYQ: { type: Boolean, default: false },
  pyqYear: { type: Number, default: null },
  pyqShift: { type: String, default: null, trim: true },
  pyqExamName: { type: String, default: null, trim: true },
  publishedAt: { type: Date, default: Date.now },
  questions: [{
    questionText: { type: String, required: true },
    questionImage: { type: String, default: '' },
    options: [{ type: String, required: true }],
    optionImages: [{ type: String, default: '' }],
    correctAnswerIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, trim: true },
    section: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'medium' }
  }]
}, { timestamps: true });

const ExamCategory = mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);
const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Knowledge and General Awareness';
const QA  = 'Elementary Mathematics';
const EH  = 'English/Hindi';

const SECTION_MAP = {
  Reasoning: REA,
  GK: GA,
  Maths: QA,
  English: EH,
  Hindi: EH
};

const RAW = [
  {"question":"Find missing: 9, 18, 36, 72, ?","options":["124","144","150","148"],"answer":"144","category":"Reasoning"},
  {"question":"Series: 5, 7, 12, 19, 31, ?","options":["40","48","50","52"],"answer":"50","category":"Reasoning"},
  {"question":"Coding: FISH = GJTI, BIRD = ?","options":["CJSE","CJSF","CJTD","CKSE"],"answer":"CJSE","category":"Reasoning"},
  {"question":"Odd one out","options":["Lion","Tiger","Dog","Leopard"],"answer":"Dog","category":"Reasoning"},
  {"question":"If A=1, B=2, then CAT=?","options":["24","26","27","25"],"answer":"24","category":"Reasoning"},
  {"question":"Mirror image of '4'","options":["h","4","Ƹ","L"],"answer":"Ƹ","category":"Reasoning"},
  {"question":"Series: 2, 4, 12, 48, ?","options":["96","144","192","240"],"answer":"240","category":"Reasoning"},
  {"question":"If 3x+5=20, x=?","options":["3","4","5","6"],"answer":"5","category":"Reasoning"},
  {"question":"Venn: Teacher, Student, School","options":["School includes both","Separate","Teacher only","Student only"],"answer":"School includes both","category":"Reasoning"},
  {"question":"Direction: West -> South turn?","options":["Left","Right","Back","None"],"answer":"Left","category":"Reasoning"},
  {"question":"Odd: 121, 144, 169, 180","options":["121","144","169","180"],"answer":"180","category":"Reasoning"},
  {"question":"Series: 3, 6, 11, 18, ?","options":["25","27","29","30"],"answer":"27","category":"Reasoning"},
  {"question":"Coding: BAT = CBU, RAT=?","options":["SBU","SBT","RBU","SCU"],"answer":"SBU","category":"Reasoning"},
  {"question":"Blood relation: Son of my mother","options":["Brother","Father","Uncle","Cousin"],"answer":"Brother","category":"Reasoning"},
  {"question":"Number analogy: 8:64 :: 7:?","options":["49","56","63","42"],"answer":"49","category":"Reasoning"},
  {"question":"Clock: 9:00 angle","options":["90°","180°","270°","45°"],"answer":"90°","category":"Reasoning"},
  {"question":"Arrange: Apple, Zebra, Dog","options":["Apple Dog Zebra","Dog Apple Zebra","Zebra Apple Dog","None"],"answer":"Apple Dog Zebra","category":"Reasoning"},
  {"question":"Find: 11, 13, 17, 23, ?","options":["29","31","30","28"],"answer":"31","category":"Reasoning"},
  {"question":"Odd: Bus, Car, Train, Bicycle","options":["Bus","Car","Train","Bicycle"],"answer":"Bicycle","category":"Reasoning"},
  {"question":"Analogy: Pen: Write :: Knife:?","options":["Cut","Eat","Play","Throw"],"answer":"Cut","category":"Reasoning"},

  {"question":"Who is President of India?","options":["PM","President","CM","Governor"],"answer":"President","category":"GK"},
  {"question":"Which river is longest in India","options":["Ganga","Yamuna","Godavari","Narmada"],"answer":"Ganga","category":"GK"},
  {"question":"Capital of Gujarat","options":["Ahmedabad","Gandhinagar","Surat","Rajkot"],"answer":"Gandhinagar","category":"GK"},
  {"question":"Who invented bulb","options":["Edison","Newton","Tesla","Einstein"],"answer":"Edison","category":"GK"},
  {"question":"Largest ocean world","options":["Pacific","Atlantic","Indian","Arctic"],"answer":"Pacific","category":"GK"},
  {"question":"Which is gas","options":["Iron","Copper","Oxygen","Gold"],"answer":"Oxygen","category":"GK"},
  {"question":"Indian National Song","options":["Vande Mataram","Jana Gana Mana","Saare Jahan","None"],"answer":"Vande Mataram","category":"GK"},
  {"question":"Currency China","options":["Yuan","Dollar","Yen","Euro"],"answer":"Yuan","category":"GK"},
  {"question":"First man India space","options":["Rakesh Sharma","Kalpana","Sunita","Abdul Kalam"],"answer":"Rakesh Sharma","category":"GK"},
  {"question":"Largest animal","options":["Elephant","Blue Whale","Giraffe","Lion"],"answer":"Blue Whale","category":"GK"},
  {"question":"Which is metal","options":["Water","Iron","Air","Fire"],"answer":"Iron","category":"GK"},
  {"question":"Which is planet","options":["Moon","Sun","Mars","Star"],"answer":"Mars","category":"GK"},
  {"question":"India Independence","options":["1945","1947","1950","1948"],"answer":"1947","category":"GK"},
  {"question":"National fruit","options":["Apple","Banana","Mango","Orange"],"answer":"Mango","category":"GK"},
  {"question":"Capital of UP","options":["Lucknow","Kanpur","Varanasi","Agra"],"answer":"Lucknow","category":"GK"},
  {"question":"Water freezes at","options":["0°C","10°C","-10°C","5°C"],"answer":"0°C","category":"GK"},
  {"question":"Sun is star or planet","options":["Star","Planet","Moon","None"],"answer":"Star","category":"GK"},
  {"question":"Currency Europe","options":["Euro","Dollar","Yen","Pound"],"answer":"Euro","category":"GK"},
  {"question":"Largest mountain","options":["Everest","K2","Kilimanjaro","Kanchenjunga"],"answer":"Everest","category":"GK"},
  {"question":"Which vitamin sunlight","options":["A","B","C","D"],"answer":"D","category":"GK"},

  {"question":"30% of 500","options":["100","150","200","250"],"answer":"150","category":"Maths"},
  {"question":"SI: P=1500 R=8% T=2","options":["200","240","260","300"],"answer":"240","category":"Maths"},
  {"question":"Average of 6 numbers =15 sum?","options":["80","90","100","110"],"answer":"90","category":"Maths"},
  {"question":"Ratio 4:5 total 45","options":["20","25","30","15"],"answer":"20","category":"Maths"},
  {"question":"Work: A=4 days B=12 days","options":["3","2","4","1"],"answer":"3","category":"Maths"},
  {"question":"Square 45","options":["2025","3025","4025","5025"],"answer":"2025","category":"Maths"},
  {"question":"40% of 300","options":["100","120","140","160"],"answer":"120","category":"Maths"},
  {"question":"LCM 6,8","options":["24","48","12","36"],"answer":"24","category":"Maths"},
  {"question":"HCF 20,30","options":["5","10","15","20"],"answer":"10","category":"Maths"},
  {"question":"Profit: CP=800 SP=1000","options":["20%","25%","30%","15%"],"answer":"25%","category":"Maths"},
  {"question":"Speed 150km in 3hr","options":["40","50","60","70"],"answer":"50","category":"Maths"},
  {"question":"Time 200km at 50km/hr","options":["3","4","5","6"],"answer":"4","category":"Maths"},
  {"question":"Perimeter rectangle 10x5","options":["30","40","50","20"],"answer":"30","category":"Maths"},
  {"question":"Area rectangle 12x3","options":["36","24","30","48"],"answer":"36","category":"Maths"},
  {"question":"Ratio 3:7 total 50","options":["15","20","30","25"],"answer":"15","category":"Maths"},
  {"question":"Discount 500->400","options":["10%","15%","20%","25%"],"answer":"20%","category":"Maths"},
  {"question":"5/10 + 1/2","options":["1","2","0","1/2"],"answer":"1","category":"Maths"},
  {"question":"Cube 5","options":["25","125","100","150"],"answer":"125","category":"Maths"},
  {"question":"3^3","options":["9","27","18","12"],"answer":"27","category":"Maths"},
  {"question":"Average sum 80 numbers 4","options":["20","25","30","15"],"answer":"20","category":"Maths"},

  {"question":"Synonym Strong","options":["Weak","Powerful","Soft","Light"],"answer":"Powerful","category":"English"},
  {"question":"Antonym Clean","options":["Dirty","Clear","Pure","Neat"],"answer":"Dirty","category":"English"},
  {"question":"He ___ playing","options":["is","are","am","be"],"answer":"is","category":"English"},
  {"question":"They ___ food","options":["eat","eats","eating","ate"],"answer":"eat","category":"English"},
  {"question":"Plural woman","options":["womans","women","womens","woman"],"answer":"women","category":"English"},
  {"question":"Past eat","options":["ate","eated","eaten","eat"],"answer":"ate","category":"English"},
  {"question":"Fill: You ___ my friend","options":["is","are","am","be"],"answer":"are","category":"English"},
  {"question":"Synonym small","options":["Tiny","Big","Large","Huge"],"answer":"Tiny","category":"English"},
  {"question":"Antonym good","options":["Bad","Nice","Great","Fine"],"answer":"Bad","category":"English"},
  {"question":"Correct spelling","options":["Enviroment","Environment","Envirement","Enviornment"],"answer":"Environment","category":"English"},
  {"question":"विलोम: जीवन","options":["मृत्यु","जीना","जीव","प्राण"],"answer":"मृत्यु","category":"Hindi"},
  {"question":"पर्यायवाची: चंद्र","options":["सूर्य","शशि","जल","अग्नि"],"answer":"शशि","category":"Hindi"},
  {"question":"शुद्ध शब्द","options":["कृतज्ञ","कृतग्य","कृतज्ञ्य","कृतज्ञा"],"answer":"कृतज्ञ","category":"Hindi"},
  {"question":"विलोम: नया","options":["पुराना","ताज़ा","अच्छा","बड़ा"],"answer":"पुराना","category":"Hindi"},
  {"question":"संधि: देव+आलय","options":["देवालय","देवआलय","देवालाय","देवालयः"],"answer":"देवालय","category":"Hindi"},
  {"question":"मुहावरा: दाँत खट्टे करना","options":["हराना","जीतना","रोना","भागना"],"answer":"हराना","category":"Hindi"},
  {"question":"विलोम: सरल","options":["कठिन","आसान","सीधा","हल्का"],"answer":"कठिन","category":"Hindi"},
  {"question":"पर्यायवाची: पृथ्वी","options":["धरती","जल","आकाश","वायु"],"answer":"धरती","category":"Hindi"},
  {"question":"वाक्य सही","options":["मैं खेलता हूँ","मैं खेलता है","मैं खेलते हूँ","मैं खेल"],"answer":"मैं खेलता हूँ","category":"Hindi"},
  {"question":"शब्द अर्थ: ज्ञानी","options":["बुद्धिमान","मूर्ख","आलसी","डरपोक"],"answer":"बुद्धिमान","category":"Hindi"}
];

if (RAW.length !== 80) { console.error(`Expected 80 questions, got ${RAW.length}`); process.exit(1); }

function buildQuestions() {
  return RAW.map((r, i) => {
    const idx = r.options.indexOf(r.answer);
    if (idx < 0) {
      throw new Error(`Q${i + 1}: answer "${r.answer}" not found in options ${JSON.stringify(r.options)}`);
    }
    const sectionName = SECTION_MAP[r.category];
    if (!sectionName) {
      throw new Error(`Q${i + 1}: unknown category "${r.category}"`);
    }
    return {
      questionText: r.question,
      questionImage: '',
      options: r.options,
      optionImages: ['', '', '', ''],
      correctAnswerIndex: idx,
      explanation: '',
      section: sectionName,
      tags: ['SSC', 'GD', 'Constable'],
      difficulty: 'easy'
    };
  });
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'SSC-GD' });
  if (!exam) { console.error('SSC-GD exam not found. Run pt-1 seed first.'); process.exit(1); }
  console.log(`Found Exam: SSC GD Constable (${exam._id})`);

  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'SSC GD Constable Tier-I' });
  if (!pattern) { console.error('SSC GD pattern not found. Run pt-1 seed first.'); process.exit(1); }
  console.log(`Found ExamPattern: SSC GD Constable Tier-I (${pattern._id})`);

  const TITLE = 'SSC GD Constable Practice Test 3';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: TITLE
  });
  if (dropRes.deletedCount > 0) {
    console.log(`Dropped ${dropRes.deletedCount} prior copy of this practice test.`);
  }

  const questions = buildQuestions();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id,
    title: TITLE,
    totalMarks: 160,
    duration: 60,
    accessLevel: 'FREE',
    isPYQ: false,
    questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
