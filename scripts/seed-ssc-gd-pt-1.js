/**
 * Seed: SSC GD Constable - Practice Test 1 (80 questions)
 *
 * Sections (per SSC GD Tier-I pattern):
 *   - General Intelligence and Reasoning      : 20 Q
 *   - General Knowledge and General Awareness : 20 Q
 *   - Elementary Mathematics                  : 20 Q
 *   - English/Hindi                           : 20 Q (10 English + 10 Hindi)
 *
 * Run with: node scripts/seed-ssc-gd-pt-1.js
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
  {"question":"Find missing number: 7, 13, 25, 43, ?, 97","options":["65","67","63","69"],"answer":"67","category":"Reasoning"},
  {"question":"Series: 2, 6, 7, 21, 22, ?","options":["44","66","45","23"],"answer":"66","category":"Reasoning"},
  {"question":"Coding: CAT = DBU, DOG = ?","options":["EPH","EOG","DPH","EOH"],"answer":"EPH","category":"Reasoning"},
  {"question":"Odd one out","options":["Cow","Dog","Goat","Tiger"],"answer":"Tiger","category":"Reasoning"},
  {"question":"A is brother of B, B is sister of C. C is father of D. A is?","options":["Uncle","Father","Brother","Grandfather"],"answer":"Uncle","category":"Reasoning"},
  {"question":"Mirror image of 3","options":["Ɛ","E","S","3"],"answer":"Ɛ","category":"Reasoning"},
  {"question":"Alphabet series: A, C, F, J, O, ?","options":["T","U","V","W"],"answer":"U","category":"Reasoning"},
  {"question":"If 5x = 20 then x=?","options":["2","3","4","5"],"answer":"4","category":"Reasoning"},
  {"question":"Venn diagram: Apple, Mango, Fruits","options":["All fruits","Apple fruit","Mango fruit","None"],"answer":"All fruits","category":"Reasoning"},
  {"question":"Direction: North -> East turn?","options":["Right","Left","Back","None"],"answer":"Right","category":"Reasoning"},
  {"question":"Find odd: 4, 9, 16, 20","options":["4","9","16","20"],"answer":"20","category":"Reasoning"},
  {"question":"Series: 1, 4, 9, 16, ?","options":["20","25","30","36"],"answer":"25","category":"Reasoning"},
  {"question":"Coding: RAM = SBO, SUN=?","options":["TVO","TVN","SVN","TWN"],"answer":"TVO","category":"Reasoning"},
  {"question":"Blood relation: Father's brother","options":["Uncle","Cousin","Grandfather","Nephew"],"answer":"Uncle","category":"Reasoning"},
  {"question":"Number pair: 3:9 :: 4:?","options":["12","16","20","8"],"answer":"16","category":"Reasoning"},
  {"question":"Clock: 3:00 angle","options":["0°","90°","180°","45°"],"answer":"90°","category":"Reasoning"},
  {"question":"Arrange: Mango, Apple, Banana","options":["Apple Banana Mango","Banana Mango Apple","Mango Apple Banana","None"],"answer":"Apple Banana Mango","category":"Reasoning"},
  {"question":"Find missing: 2, 4, 8, 16, ?","options":["18","20","32","24"],"answer":"32","category":"Reasoning"},
  {"question":"Odd: Pen, Pencil, Eraser, Book","options":["Pen","Pencil","Eraser","Book"],"answer":"Book","category":"Reasoning"},
  {"question":"Analogy: Bird: Fly :: Fish:?","options":["Swim","Run","Jump","Walk"],"answer":"Swim","category":"Reasoning"},

  {"question":"Indian Constitution implemented in?","options":["1947","1950","1949","1952"],"answer":"1950","category":"GK"},
  {"question":"Capital of India","options":["Mumbai","Delhi","Chennai","Kolkata"],"answer":"Delhi","category":"GK"},
  {"question":"National animal","options":["Lion","Tiger","Elephant","Horse"],"answer":"Tiger","category":"GK"},
  {"question":"Jallianwala Bagh year","options":["1919","1920","1930","1942"],"answer":"1919","category":"GK"},
  {"question":"Red planet","options":["Earth","Mars","Jupiter","Saturn"],"answer":"Mars","category":"GK"},
  {"question":"Currency of India","options":["Dollar","Rupee","Euro","Yen"],"answer":"Rupee","category":"GK"},
  {"question":"Prime Minister of India","options":["President","PM","CM","Governor"],"answer":"PM","category":"GK"},
  {"question":"Largest ocean","options":["Indian","Pacific","Atlantic","Arctic"],"answer":"Pacific","category":"GK"},
  {"question":"Who wrote Ramayana","options":["Valmiki","Tulsidas","Kalidas","Vyas"],"answer":"Valmiki","category":"GK"},
  {"question":"National bird","options":["Peacock","Crow","Parrot","Sparrow"],"answer":"Peacock","category":"GK"},
  {"question":"Largest state India","options":["UP","Rajasthan","MP","Maharashtra"],"answer":"Rajasthan","category":"GK"},
  {"question":"Sun rises in","options":["North","South","East","West"],"answer":"East","category":"GK"},
  {"question":"Water formula","options":["H2O","CO2","O2","NaCl"],"answer":"H2O","category":"GK"},
  {"question":"First President India","options":["Nehru","Rajendra Prasad","Gandhi","Patel"],"answer":"Rajendra Prasad","category":"GK"},
  {"question":"Freedom year India","options":["1945","1947","1950","1949"],"answer":"1947","category":"GK"},
  {"question":"Largest river India","options":["Ganga","Yamuna","Godavari","Narmada"],"answer":"Ganga","category":"GK"},
  {"question":"Currency USA","options":["Dollar","Euro","Rupee","Yen"],"answer":"Dollar","category":"GK"},
  {"question":"National flower","options":["Rose","Lotus","Lily","Sunflower"],"answer":"Lotus","category":"GK"},
  {"question":"Earth shape","options":["Flat","Round","Triangle","Square"],"answer":"Round","category":"GK"},
  {"question":"Gas for breathing","options":["Oxygen","Hydrogen","CO2","Nitrogen"],"answer":"Oxygen","category":"GK"},

  {"question":"15% of 200","options":["25","30","35","40"],"answer":"30","category":"Maths"},
  {"question":"SI: P=1000 R=10% T=2","options":["100","200","300","400"],"answer":"200","category":"Maths"},
  {"question":"Average 10,20,30,40","options":["20","25","30","35"],"answer":"25","category":"Maths"},
  {"question":"2:3 = x:12","options":["6","8","9","10"],"answer":"8","category":"Maths"},
  {"question":"A=10 days B=20 days","options":["6.66","7","5","8"],"answer":"6.66","category":"Maths"},
  {"question":"Square 25","options":["525","625","725","825"],"answer":"625","category":"Maths"},
  {"question":"50% of 100","options":["25","50","75","100"],"answer":"50","category":"Maths"},
  {"question":"LCM 4,6","options":["12","24","18","6"],"answer":"12","category":"Maths"},
  {"question":"HCF 12,18","options":["6","12","3","9"],"answer":"6","category":"Maths"},
  {"question":"Profit: CP=100 SP=120","options":["10","15","20","25"],"answer":"20","category":"Maths"},
  {"question":"Speed: 60km in 1hr","options":["60","50","70","80"],"answer":"60","category":"Maths"},
  {"question":"Time: 120km at 60km/hr","options":["1","2","3","4"],"answer":"2","category":"Maths"},
  {"question":"Perimeter square side 4","options":["16","12","8","20"],"answer":"16","category":"Maths"},
  {"question":"Area square side 5","options":["25","20","15","10"],"answer":"25","category":"Maths"},
  {"question":"Ratio 1:2 total 30","options":["10","15","20","25"],"answer":"10","category":"Maths"},
  {"question":"Discount 100->90","options":["5%","10%","15%","20%"],"answer":"10%","category":"Maths"},
  {"question":"1/2 + 1/2","options":["1","2","0","1/2"],"answer":"1","category":"Maths"},
  {"question":"Cube 3","options":["9","27","18","6"],"answer":"27","category":"Maths"},
  {"question":"2^3","options":["6","8","9","4"],"answer":"8","category":"Maths"},
  {"question":"Average 5 numbers sum 50","options":["5","10","15","20"],"answer":"10","category":"Maths"},

  {"question":"Synonym Happy","options":["Sad","Joyful","Angry","Cry"],"answer":"Joyful","category":"English"},
  {"question":"Antonym Big","options":["Small","Large","Huge","Wide"],"answer":"Small","category":"English"},
  {"question":"He ___ going","options":["is","are","am","be"],"answer":"is","category":"English"},
  {"question":"She ___ a book","options":["read","reads","reading","readed"],"answer":"reads","category":"English"},
  {"question":"Plural child","options":["childs","children","childes","child"],"answer":"children","category":"English"},
  {"question":"Past go","options":["goed","went","gone","goes"],"answer":"went","category":"English"},
  {"question":"Fill: I ___ a pen","options":["has","have","is","are"],"answer":"have","category":"English"},
  {"question":"Synonym fast","options":["quick","slow","lazy","weak"],"answer":"quick","category":"English"},
  {"question":"Antonym hot","options":["cold","warm","heat","fire"],"answer":"cold","category":"English"},
  {"question":"Correct spelling","options":["Recieve","Receive","Receeve","Receve"],"answer":"Receive","category":"English"},
  {"question":"विलोम: अंधकार","options":["प्रकाश","छाया","रात","दिन"],"answer":"प्रकाश","category":"Hindi"},
  {"question":"पर्यायवाची: सूर्य","options":["चंद्र","दिनकर","पवन","जल"],"answer":"दिनकर","category":"Hindi"},
  {"question":"शुद्ध शब्द","options":["असफल","असफळ","अस्फल","असपल"],"answer":"असफल","category":"Hindi"},
  {"question":"विलोम: लाभ","options":["हानि","नुकसान","क्षति","लाभदायक"],"answer":"हानि","category":"Hindi"},
  {"question":"संधि: राम+आयण","options":["रामायण","रामायन","रामआयन","रामायन"],"answer":"रामायण","category":"Hindi"},
  {"question":"मुहावरा: आँख दिखाना","options":["डराना","रोना","हँसना","भागना"],"answer":"डराना","category":"Hindi"},
  {"question":"विलोम: सत्य","options":["असत्य","झूठ","गलत","सही"],"answer":"असत्य","category":"Hindi"},
  {"question":"पर्यायवाची: जल","options":["पानी","नदी","समुद्र","तालाब"],"answer":"पानी","category":"Hindi"},
  {"question":"वाक्य सही","options":["मैं जाता है","मैं जाता हूँ","मैं जाती है","मैं जाऊँगा है"],"answer":"मैं जाता हूँ","category":"Hindi"},
  {"question":"शब्द अर्थ: वीर","options":["बहादुर","डरपोक","कमजोर","आलसी"],"answer":"बहादुर","category":"Hindi"}
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

  let category = await ExamCategory.findOne({ name: 'Central', type: 'Central' });
  if (!category) {
    category = await ExamCategory.create({ name: 'Central', type: 'Central', description: 'Central government competitive exams' });
    console.log(`Created ExamCategory: Central (${category._id})`);
  } else {
    console.log(`Found ExamCategory: Central (${category._id})`);
  }

  let exam = await Exam.findOne({ code: 'SSC-GD' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC GD Constable',
      code: 'SSC-GD',
      description: 'Staff Selection Commission - General Duty (GD) Constable',
      isActive: true
    });
    console.log(`Created Exam: SSC GD Constable (${exam._id})`);
  } else {
    console.log(`Found Exam: SSC GD Constable (${exam._id})`);
  }

  let pattern = await ExamPattern.findOne({ exam: exam._id, title: 'SSC GD Constable Tier-I' });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: 'SSC GD Constable Tier-I',
      duration: 60,
      totalMarks: 160,
      negativeMarking: 0.25,
      sections: [
        { name: REA, totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GA,  totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: QA,  totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: EH,  totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
    console.log(`Created ExamPattern: SSC GD Constable Tier-I (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: SSC GD Constable Tier-I (${pattern._id})`);
  }

  const TITLE = 'SSC GD Constable Practice Test 1';

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
