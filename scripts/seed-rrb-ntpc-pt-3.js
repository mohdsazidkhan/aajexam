/**
 * Seed: RRB NTPC CBT-1 - Practice Test 3
 * Run with: node scripts/seed-rrb-ntpc-pt-3.js
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
  {"question":"Series: 8, 18, 38, 78, ?","options":["156","158","160","162"],"answer":"158","category":"Reasoning"},
  {"question":"Coding: LIGHT = MJHIU, SOUND = ?","options":["TPVOE","TPVOD","TPWND","TPVNE"],"answer":"TPVOE","category":"Reasoning"},
  {"question":"Find missing: 5, 10, 20, 35, 55, ?","options":["75","80","85","90"],"answer":"80","category":"Reasoning"},
  {"question":"Odd one out","options":["Sphere","Cone","Cube","Triangle"],"answer":"Triangle","category":"Reasoning"},
  {"question":"If CAT=24, DOG=?","options":["26","27","28","29"],"answer":"26","category":"Reasoning"},
  {"question":"Series: 3, 12, 48, 192, ?","options":["768","784","700","720"],"answer":"768","category":"Reasoning"},
  {"question":"Mirror image of 'E'","options":["Ǝ","E","3","M"],"answer":"Ǝ","category":"Reasoning"},
  {"question":"Blood relation: Brother of my father's son","options":["Me","Cousin","Uncle","Friend"],"answer":"Me","category":"Reasoning"},
  {"question":"Direction: South → West turn?","options":["Right","Left","Back","None"],"answer":"Right","category":"Reasoning"},
  {"question":"Analogy: Eye: See :: Ear:?","options":["Hear","Speak","Listen","Talk"],"answer":"Hear","category":"Reasoning"},
  {"question":"Puzzle: 5 persons in row. A at 2nd, B right of A, C at end, D left of A. Who is middle?","options":["A","B","D","C"],"answer":"A","category":"Reasoning"},
  {"question":"Series: 1, 2, 6, 24, 120, ?","options":["720","600","500","650"],"answer":"720","category":"Reasoning"},
  {"question":"Coding: MAP = N B Q (pattern +1), PEN=?","options":["QFO","QFN","QGP","QEO"],"answer":"QFO","category":"Reasoning"},
  {"question":"Odd: Wheat, Rice, Mango, Barley","options":["Wheat","Rice","Mango","Barley"],"answer":"Mango","category":"Reasoning"},
  {"question":"Clock: 7:20 angle","options":["100°","110°","120°","130°"],"answer":"100°","category":"Reasoning"},
  {"question":"Series: 4, 16, 36, 64, ?","options":["100","81","121","144"],"answer":"100","category":"Reasoning"},
  {"question":"Venn: Teachers, Students, Humans","options":["All humans","Separate","Teachers only","Students only"],"answer":"All humans","category":"Reasoning"},
  {"question":"Find: 13, 17, 19, 23, 29, ?","options":["31","33","35","37"],"answer":"31","category":"Reasoning"},
  {"question":"Analogy: Fire: Burn :: Ice:?","options":["Freeze","Cool","Melt","Chill"],"answer":"Freeze","category":"Reasoning"},
  {"question":"Series: Y, V, R, M, ?","options":["G","H","I","J"],"answer":"G","category":"Reasoning"},
  {"question":"Number analogy: 12:144 :: 15:?","options":["225","200","210","240"],"answer":"225","category":"Reasoning"},
  {"question":"Find missing: 6, 11, 21, 36, ?","options":["55","56","57","58"],"answer":"56","category":"Reasoning"},
  {"question":"Odd: Pen, Pencil, Ink, Eraser","options":["Pen","Pencil","Ink","Eraser"],"answer":"Ink","category":"Reasoning"},
  {"question":"Direction: North → East → South turn final?","options":["South","West","North","East"],"answer":"South","category":"Reasoning"},
  {"question":"Series: 2, 8, 24, 48, 96, ?","options":["144","160","192","200"],"answer":"192","category":"Reasoning"},
  {"question":"Coding: HOME = IPNF, COME=?","options":["DPNF","EPNF","CPNF","DPNE"],"answer":"DPNF","category":"Reasoning"},
  {"question":"Clock: 10:10 angle","options":["120°","110°","100°","105°"],"answer":"105°","category":"Reasoning"},
  {"question":"Arrange: Tiger, Deer, Grass","options":["Grass Deer Tiger","Tiger Deer Grass","Deer Tiger Grass","None"],"answer":"Grass Deer Tiger","category":"Reasoning"},
  {"question":"Odd: Copper, Iron, Silver, Oxygen","options":["Copper","Iron","Silver","Oxygen"],"answer":"Oxygen","category":"Reasoning"},
  {"question":"Series: 10, 9, 7, 4, 0, ?","options":["-5","-4","-3","-2"],"answer":"-5","category":"Reasoning"},

  {"question":"Who was the first Governor-General of India?","options":["Clive","Warren Hastings","Cornwallis","Dalhousie"],"answer":"Warren Hastings","category":"History"},
  {"question":"Battle of Panipat (1st) year","options":["1526","1556","1761","1530"],"answer":"1526","category":"History"},
  {"question":"Who abolished sati system","options":["Raja Ram Mohan Roy","Gandhi","Nehru","Tilak"],"answer":"Raja Ram Mohan Roy","category":"History"},
  {"question":"Regulating Act year","options":["1773","1784","1765","1793"],"answer":"1773","category":"History"},
  {"question":"Swadeshi Movement year","options":["1905","1919","1930","1942"],"answer":"1905","category":"History"},
  {"question":"Who built Qutub Minar","options":["Aibak","Akbar","Shahjahan","Humayun"],"answer":"Aibak","category":"History"},

  {"question":"Directive Principles part","options":["Part IV","III","II","V"],"answer":"Part IV","category":"Polity"},
  {"question":"Article 32 related to","options":["Equality","Constitutional remedies","Religion","Liberty"],"answer":"Constitutional remedies","category":"Polity"},
  {"question":"Election Commission article","options":["324","325","326","327"],"answer":"324","category":"Polity"},
  {"question":"Rajya Sabha max strength","options":["250","245","240","260"],"answer":"250","category":"Polity"},

  {"question":"Largest plateau India","options":["Deccan","Malwa","Chota Nagpur","Shillong"],"answer":"Deccan","category":"Geography"},
  {"question":"Narmada river flows into","options":["Arabian Sea","Bay of Bengal","Indian Ocean","None"],"answer":"Arabian Sea","category":"Geography"},
  {"question":"Capital of Kerala","options":["Thiruvananthapuram","Kochi","Kozhikode","Kannur"],"answer":"Thiruvananthapuram","category":"Geography"},
  {"question":"Sundarbans located in","options":["WB","Odisha","AP","TN"],"answer":"WB","category":"Geography"},

  {"question":"Unit of power","options":["Watt","Joule","Newton","Volt"],"answer":"Watt","category":"Physics"},
  {"question":"Acceleration due to gravity","options":["9.8","10","8","12"],"answer":"9.8","category":"Physics"},
  {"question":"Chemical formula H2SO4","options":["Sulphuric acid","Hydrochloric","Nitric","Carbonic"],"answer":"Sulphuric acid","category":"Chemistry"},
  {"question":"Gas used in balloons","options":["Helium","Oxygen","CO2","Nitrogen"],"answer":"Helium","category":"Chemistry"},
  {"question":"Largest gland","options":["Liver","Heart","Kidney","Lungs"],"answer":"Liver","category":"Biology"},
  {"question":"Cell unit of","options":["Life","Energy","Mass","Heat"],"answer":"Life","category":"Biology"},

  {"question":"G20 2024 host","options":["India","Brazil","Italy","USA"],"answer":"Brazil","category":"Current Affairs"},
  {"question":"ISRO mission to Sun","options":["Aditya L1","Chandrayaan","Mangalyaan","Gaganyaan"],"answer":"Aditya L1","category":"Current Affairs"},
  {"question":"Asian Games 2023 host","options":["China","Japan","India","Korea"],"answer":"China","category":"Current Affairs"},
  {"question":"World Health Day","options":["7 April","5 June","10 Oct","1 May"],"answer":"7 April","category":"Current Affairs"},
  {"question":"India digital payments regulated by","options":["RBI","SEBI","NITI","Finance"],"answer":"RBI","category":"Current Affairs"},

  {"question":"35% of 600","options":["200","210","220","230"],"answer":"210","category":"Maths"},
  {"question":"SI: P=4000 R=5% T=3","options":["600","500","400","300"],"answer":"600","category":"Maths"},
  {"question":"Average of 20 numbers =10 sum?","options":["200","150","180","160"],"answer":"200","category":"Maths"},
  {"question":"Ratio 9:11 total 100","options":["45","55","50","60"],"answer":"45","category":"Maths"},
  {"question":"Work: A=12 B=6, together?","options":["4","3","2","5"],"answer":"4","category":"Maths"},
  {"question":"Square 95","options":["9025","8025","10025","7225"],"answer":"9025","category":"Maths"},
  {"question":"80% of 250","options":["200","180","150","170"],"answer":"200","category":"Maths"},
  {"question":"LCM 15,20","options":["60","45","30","90"],"answer":"60","category":"Maths"},
  {"question":"HCF 45,60","options":["15","10","20","5"],"answer":"15","category":"Maths"},
  {"question":"Profit CP=1000 SP=1200","options":["20%","25%","15%","30%"],"answer":"20%","category":"Maths"},
  {"question":"Speed 300km in 5hr","options":["60","50","70","80"],"answer":"60","category":"Maths"},
  {"question":"Time 400km at 80","options":["5","4","6","3"],"answer":"5","category":"Maths"},
  {"question":"Area circle r=14","options":["616","600","650","700"],"answer":"616","category":"Maths"},
  {"question":"Perimeter square 12","options":["48","36","24","60"],"answer":"48","category":"Maths"},
  {"question":"Ratio 3:7 total 80","options":["24","56","30","50"],"answer":"24","category":"Maths"},
  {"question":"Discount 1500→1200","options":["20%","25%","30%","15%"],"answer":"20%","category":"Maths"},
  {"question":"4/5 + 1/5","options":["1","2","0","1/2"],"answer":"1","category":"Maths"},
  {"question":"Cube 9","options":["729","512","343","216"],"answer":"729","category":"Maths"},
  {"question":"6^2","options":["36","12","24","18"],"answer":"36","category":"Maths"},
  {"question":"Average sum 300 numbers 15","options":["20","15","25","30"],"answer":"20","category":"Maths"}
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

  const TITLE = 'RRB NTPC CBT-1 Practice Test 3';

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
