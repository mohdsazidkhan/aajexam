/**
 * Seed: RRB NTPC CBT-1 - Practice Test 2
 * Run with: node scripts/seed-rrb-ntpc-pt-2.js
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

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);
mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);

const MATH = 'Mathematics';
const REA  = 'General Intelligence and Reasoning';
const GA   = 'General Awareness';

const SECTION_MAP = {
  Maths: MATH,
  Reasoning: REA,
  GK: GA,
  'Current Affairs': GA,
  History: GA,
  Polity: GA,
  Geography: GA,
  Physics: GA,
  Chemistry: GA,
  Biology: GA
};

const RAW = [
  {"question":"Series: 7, 15, 31, 63, ?","options":["125","127","129","131"],"answer":"127","category":"Reasoning"},
  {"question":"Coding: WATER = XBUFS, EARTH = ?","options":["FBSUI","FBSUG","FCSUI","FBSVI"],"answer":"FBSUI","category":"Reasoning"},
  {"question":"Find missing: 4, 6, 12, 14, 28, ?","options":["30","32","34","36"],"answer":"30","category":"Reasoning"},
  {"question":"Odd one out","options":["Cube","Sphere","Cylinder","Triangle"],"answer":"Triangle","category":"Reasoning"},
  {"question":"If A=1, B=2, Z=26 then BAD=?","options":["7","8","9","6"],"answer":"7","category":"Reasoning"},
  {"question":"Series: 2, 6, 7, 21, 22, ?","options":["44","66","46","48"],"answer":"66","category":"Reasoning"},
  {"question":"Mirror of '9'","options":["6","Ƨ","9","P"],"answer":"6","category":"Reasoning"},
  {"question":"Blood relation: Father's sister's son","options":["Cousin","Uncle","Brother","Nephew"],"answer":"Cousin","category":"Reasoning"},
  {"question":"Direction: West → North turn?","options":["Right","Left","Back","None"],"answer":"Right","category":"Reasoning"},
  {"question":"Analogy: Heart: Pump :: Lungs:?","options":["Breathe","Filter","Circulate","Move"],"answer":"Breathe","category":"Reasoning"},
  {"question":"Arrange persons puzzle: A,B,C,D,E sit in row. A not at ends. B next to A. D at end. Who is middle?","options":["A","B","C","D"],"answer":"C","category":"Reasoning"},
  {"question":"Series: 1, 3, 9, 27, ?","options":["54","81","72","90"],"answer":"81","category":"Reasoning"},
  {"question":"Coding: PEN = QFO, MAP = ?","options":["NBQ","NBR","NBP","NBO"],"answer":"NBQ","category":"Reasoning"},
  {"question":"Odd: Apple, Mango, Carrot, Banana","options":["Apple","Mango","Carrot","Banana"],"answer":"Carrot","category":"Reasoning"},
  {"question":"Clock: 5:20 angle","options":["50°","60°","40°","70°"],"answer":"40°","category":"Reasoning"},
  {"question":"Series: 3, 6, 12, 24, ?","options":["36","48","60","72"],"answer":"48","category":"Reasoning"},
  {"question":"Venn: Dogs, Cats, Animals","options":["All animals","Separate","Dogs only","Cats only"],"answer":"All animals","category":"Reasoning"},
  {"question":"Find: 11, 13, 17, 19, 23, ?","options":["25","27","29","31"],"answer":"29","category":"Reasoning"},
  {"question":"Analogy: Bird: Fly :: Snake:?","options":["Crawl","Run","Jump","Swim"],"answer":"Crawl","category":"Reasoning"},
  {"question":"Series: Z, X, U, Q, ?","options":["L","M","N","O"],"answer":"L","category":"Reasoning"},

  {"question":"Who founded Maurya Empire?","options":["Ashoka","Chandragupta Maurya","Bindusara","Harsha"],"answer":"Chandragupta Maurya","category":"History"},
  {"question":"Battle of Buxar year","options":["1764","1757","1857","1747"],"answer":"1764","category":"History"},
  {"question":"Who wrote Arthashastra?","options":["Kalidas","Chanakya","Panini","Vyas"],"answer":"Chanakya","category":"History"},
  {"question":"Delhi Sultanate founder","options":["Iltutmish","Qutubuddin Aibak","Balban","Alauddin"],"answer":"Qutubuddin Aibak","category":"History"},
  {"question":"Quit India Movement year","options":["1942","1930","1919","1947"],"answer":"1942","category":"History"},
  {"question":"First Mughal emperor","options":["Akbar","Babur","Humayun","Aurangzeb"],"answer":"Babur","category":"History"},

  {"question":"Fundamental Rights in Constitution","options":["Part III","Part IV","Part II","Part V"],"answer":"Part III","category":"Polity"},
  {"question":"Article 21 related to","options":["Equality","Life & Liberty","Education","Religion"],"answer":"Life & Liberty","category":"Polity"},
  {"question":"Finance Commission article","options":["280","360","370","356"],"answer":"280","category":"Polity"},
  {"question":"Lok Sabha term","options":["5 years","6 years","4 years","3 years"],"answer":"5 years","category":"Polity"},

  {"question":"Largest state by area","options":["UP","Rajasthan","MP","Maharashtra"],"answer":"Rajasthan","category":"Geography"},
  {"question":"Tropic of Cancer passes through","options":["India","USA","China","Brazil"],"answer":"India","category":"Geography"},
  {"question":"Capital of Assam","options":["Dispur","Guwahati","Shillong","Agartala"],"answer":"Dispur","category":"Geography"},
  {"question":"River Brahmaputra origin","options":["Tibet","India","Nepal","China"],"answer":"Tibet","category":"Geography"},

  {"question":"Unit of force","options":["Newton","Joule","Watt","Pascal"],"answer":"Newton","category":"Physics"},
  {"question":"Speed of light approx","options":["3×10^8","3×10^6","3×10^5","3×10^7"],"answer":"3×10^8","category":"Physics"},
  {"question":"pH value of neutral","options":["7","0","14","1"],"answer":"7","category":"Chemistry"},
  {"question":"Chemical formula methane","options":["CH4","CO2","C2H6","CH3"],"answer":"CH4","category":"Chemistry"},
  {"question":"Vitamin C source","options":["Lemon","Milk","Rice","Wheat"],"answer":"Lemon","category":"Biology"},
  {"question":"Blood group universal donor","options":["O","A","B","AB"],"answer":"O","category":"Biology"},

  {"question":"G20 2025 host country","options":["India","Brazil","USA","China"],"answer":"Brazil","category":"Current Affairs"},
  {"question":"Asian Games 2026 host","options":["China","Japan","India","Indonesia"],"answer":"Japan","category":"Current Affairs"},
  {"question":"World Environment Day","options":["5 June","10 June","15 June","20 June"],"answer":"5 June","category":"Current Affairs"},
  {"question":"India's digital payments regulated by","options":["RBI","SEBI","NITI","Finance"],"answer":"RBI","category":"Current Affairs"},
  {"question":"ISRO new mission (recent) relates to","options":["Moon","Sun","Mars","Venus"],"answer":"Sun","category":"Current Affairs"},

  {"question":"25% of 800","options":["200","150","100","250"],"answer":"200","category":"Maths"},
  {"question":"SI: P=5000 R=4% T=2","options":["300","400","500","200"],"answer":"400","category":"Maths"},
  {"question":"Average of 10 numbers =15 sum?","options":["150","120","130","140"],"answer":"150","category":"Maths"},
  {"question":"Ratio 7:3 total 100","options":["70","30","60","40"],"answer":"70","category":"Maths"},
  {"question":"Work: A=6 days B=12 days, together?","options":["4","3","2","5"],"answer":"4","category":"Maths"},
  {"question":"Square 85","options":["7225","6225","8225","9025"],"answer":"7225","category":"Maths"},
  {"question":"60% of 500","options":["250","300","350","400"],"answer":"300","category":"Maths"},
  {"question":"LCM 12,18","options":["36","24","48","72"],"answer":"36","category":"Maths"},
  {"question":"HCF 36,48","options":["6","12","18","24"],"answer":"12","category":"Maths"},
  {"question":"Profit: CP=900 SP=1080","options":["20%","25%","15%","10%"],"answer":"20%","category":"Maths"},
  {"question":"Speed 240km in 4hr","options":["50","60","70","80"],"answer":"60","category":"Maths"},
  {"question":"Time 360km at 90km/hr","options":["3","4","5","6"],"answer":"4","category":"Maths"},
  {"question":"Area circle r=7","options":["154","144","164","174"],"answer":"154","category":"Maths"},
  {"question":"Perimeter square 9","options":["36","27","18","45"],"answer":"36","category":"Maths"},
  {"question":"Ratio 5:8 total 65","options":["25","40","35","30"],"answer":"25","category":"Maths"},
  {"question":"Discount 1000→800","options":["20%","25%","30%","15%"],"answer":"20%","category":"Maths"},
  {"question":"3/4 + 1/4","options":["1","2","0","1/2"],"answer":"1","category":"Maths"},
  {"question":"Cube 8","options":["512","256","128","64"],"answer":"512","category":"Maths"},
  {"question":"5^3","options":["125","25","75","150"],"answer":"125","category":"Maths"},
  {"question":"Average sum 200 numbers 20","options":["10","20","15","25"],"answer":"10","category":"Maths"}
];

console.log(`Total questions: ${RAW.length}`);

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
      tags: ['RRB', 'NTPC', 'CBT-1'],
      difficulty: 'easy'
    };
  });
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'RRB-NTPC' });
  if (!exam) { console.error('RRB-NTPC exam not found. Run pt-1 seed first.'); process.exit(1); }
  console.log(`Found Exam: RRB NTPC (${exam._id})`);

  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'RRB NTPC CBT-1' });
  if (!pattern) { console.error('RRB NTPC CBT-1 pattern not found. Run pt-1 seed first.'); process.exit(1); }
  console.log(`Found ExamPattern: RRB NTPC CBT-1 (${pattern._id})`);

  const TITLE = 'RRB NTPC CBT-1 Practice Test 2';

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
    totalMarks: questions.length,
    duration: 90,
    accessLevel: 'FREE',
    isPYQ: false,
    questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
