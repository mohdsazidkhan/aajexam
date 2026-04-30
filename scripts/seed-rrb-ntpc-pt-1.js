/**
 * Seed: RRB NTPC CBT-1 - Practice Test 1 (questions provided by user)
 *
 * RRB NTPC CBT-1 Pattern:
 *   - Mathematics                          : 30 Q
 *   - General Intelligence and Reasoning   : 30 Q
 *   - General Awareness                    : 40 Q
 *   Total: 100 Q, 100 marks, 90 min, 1/3 negative
 *
 * Run with: node scripts/seed-rrb-ntpc-pt-1.js
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

const MATH = 'Mathematics';
const REA  = 'General Intelligence and Reasoning';
const GA   = 'General Awareness';

const SECTION_MAP = {
  Maths: MATH,
  Reasoning: REA,
  GK: GA,
  'Current Affairs': GA
};

const RAW = [
  {"question":"Series: 5, 11, 23, 47, ?","options":["91","95","96","97"],"answer":"95","category":"Reasoning"},
  {"question":"Find missing: 6, 18, 9, 27, 13.5, ?","options":["40.5","36","30","42"],"answer":"40.5","category":"Reasoning"},
  {"question":"Coding: TRAIN = USBJO, PLANE = ?","options":["QMBOF","QMBNF","QMBME","QMBNE"],"answer":"QMBOF","category":"Reasoning"},
  {"question":"Odd one out","options":["Circle","Triangle","Rectangle","Cube"],"answer":"Cube","category":"Reasoning"},
  {"question":"Analogy: Book: Read :: Food:?","options":["Cook","Eat","Drink","Serve"],"answer":"Eat","category":"Reasoning"},
  {"question":"Series: A, E, J, P, ?","options":["V","U","W","X"],"answer":"W","category":"Reasoning"},
  {"question":"Mirror image of '2'","options":["Ƨ","S","2","Z"],"answer":"Ƨ","category":"Reasoning"},
  {"question":"Blood relation: Mother's brother","options":["Uncle","Cousin","Grandfather","Nephew"],"answer":"Uncle","category":"Reasoning"},
  {"question":"Direction: East → South turn?","options":["Right","Left","Back","None"],"answer":"Right","category":"Reasoning"},
  {"question":"Series: 2, 5, 11, 23, 47, ?","options":["95","96","94","92"],"answer":"95","category":"Reasoning"},
  {"question":"Odd: 121, 144, 169, 200","options":["121","144","169","200"],"answer":"200","category":"Reasoning"},
  {"question":"Coding: CAT=DBU, RAT=?","options":["SBU","RBU","SBT","TBU"],"answer":"SBU","category":"Reasoning"},
  {"question":"Find: 1, 4, 10, 22, 46, ?","options":["94","96","98","100"],"answer":"94","category":"Reasoning"},
  {"question":"Clock: 6:30 angle","options":["165°","180°","150°","135°"],"answer":"15°","category":"Reasoning"},
  {"question":"Arrange: Dog, Cat, Elephant","options":["Cat Dog Elephant","Dog Cat Elephant","Elephant Cat Dog","None"],"answer":"Cat Dog Elephant","category":"Reasoning"},
  {"question":"Odd: Bus, Train, Plane, Cycle","options":["Bus","Train","Plane","Cycle"],"answer":"Cycle","category":"Reasoning"},
  {"question":"Number analogy: 9:81 :: 11:?","options":["121","111","131","141"],"answer":"121","category":"Reasoning"},
  {"question":"Find missing: 3, 7, 15, 31, ?","options":["63","62","60","64"],"answer":"63","category":"Reasoning"},
  {"question":"Analogy: Pen: Write :: Knife:?","options":["Cut","Eat","Play","Throw"],"answer":"Cut","category":"Reasoning"},
  {"question":"Series: 7, 14, 28, 56, ?","options":["84","96","112","120"],"answer":"112","category":"Reasoning"},
  {"question":"Coding: DOG=EPH, CAT=?","options":["DBU","EBU","CBU","DCU"],"answer":"DBU","category":"Reasoning"},
  {"question":"Odd: Table, Chair, Fan, Bed","options":["Table","Chair","Fan","Bed"],"answer":"Fan","category":"Reasoning"},
  {"question":"Series: 4, 9, 19, 39, ?","options":["79","80","78","81"],"answer":"79","category":"Reasoning"},
  {"question":"Direction: North → West turn?","options":["Left","Right","Back","None"],"answer":"Left","category":"Reasoning"},
  {"question":"Number analogy: 8:64 :: 6:?","options":["36","48","42","54"],"answer":"36","category":"Reasoning"},
  {"question":"Find: 2, 3, 5, 9, 17, ?","options":["33","34","35","36"],"answer":"33","category":"Reasoning"},
  {"question":"Clock: 3:15 angle","options":["7.5°","0°","15°","30°"],"answer":"7.5°","category":"Reasoning"},
  {"question":"Arrange: Apple, Zebra, Dog","options":["Apple Dog Zebra","Dog Apple Zebra","Zebra Apple Dog","None"],"answer":"Apple Dog Zebra","category":"Reasoning"},
  {"question":"Odd: Gold, Silver, Iron, Wood","options":["Gold","Silver","Iron","Wood"],"answer":"Wood","category":"Reasoning"},
  {"question":"Series: 1, 3, 6, 10, 15, ?","options":["21","20","18","17"],"answer":"21","category":"Reasoning"},

  {"question":"India independence year","options":["1945","1947","1950","1948"],"answer":"1947","category":"GK"},
  {"question":"Capital of Rajasthan","options":["Jaipur","Jodhpur","Udaipur","Ajmer"],"answer":"Jaipur","category":"GK"},
  {"question":"First PM India","options":["Nehru","Gandhi","Patel","Rajendra"],"answer":"Nehru","category":"GK"},
  {"question":"Largest continent","options":["Asia","Africa","Europe","Australia"],"answer":"Asia","category":"GK"},
  {"question":"National animal India","options":["Lion","Tiger","Elephant","Horse"],"answer":"Tiger","category":"GK"},
  {"question":"Who discovered gravity","options":["Newton","Einstein","Tesla","Faraday"],"answer":"Newton","category":"GK"},
  {"question":"Currency Japan","options":["Dollar","Yen","Euro","Peso"],"answer":"Yen","category":"GK"},
  {"question":"Largest ocean","options":["Pacific","Atlantic","Indian","Arctic"],"answer":"Pacific","category":"GK"},
  {"question":"Chemical symbol Na","options":["Sodium","Nitrogen","Neon","Nickel"],"answer":"Sodium","category":"GK"},
  {"question":"Ganga originates from","options":["Gangotri","Yamunotri","Kedarnath","Badrinath"],"answer":"Gangotri","category":"GK"},
  {"question":"World Environment Day","options":["5 June","10 June","15 June","20 June"],"answer":"5 June","category":"Current Affairs"},
  {"question":"G20 2026 host","options":["India","Brazil","China","USA"],"answer":"Brazil","category":"Current Affairs"},
  {"question":"PM India 2026","options":["Modi","Rahul","Shah","None"],"answer":"Modi","category":"Current Affairs"},
  {"question":"Asian Games 2026 host","options":["China","Japan","India","Indonesia"],"answer":"Japan","category":"Current Affairs"},
  {"question":"GDP reports by","options":["RBI","IMF","World Bank","All"],"answer":"All","category":"Current Affairs"},
  {"question":"Largest planet","options":["Earth","Mars","Jupiter","Saturn"],"answer":"Jupiter","category":"GK"},
  {"question":"Which is metal","options":["Iron","Oxygen","Hydrogen","Helium"],"answer":"Iron","category":"GK"},
  {"question":"Capital of MP","options":["Bhopal","Indore","Jabalpur","Gwalior"],"answer":"Bhopal","category":"GK"},
  {"question":"National flower","options":["Rose","Lotus","Lily","Sunflower"],"answer":"Lotus","category":"GK"},
  {"question":"Which gas for breathing","options":["Oxygen","CO2","Hydrogen","Nitrogen"],"answer":"Oxygen","category":"GK"},
  {"question":"First man on moon","options":["Armstrong","Gagarin","Newton","Einstein"],"answer":"Armstrong","category":"GK"},
  {"question":"Currency UK","options":["Pound","Dollar","Euro","Yen"],"answer":"Pound","category":"GK"},
  {"question":"Largest desert","options":["Sahara","Gobi","Thar","Arctic"],"answer":"Sahara","category":"GK"},
  {"question":"Which is amphibian","options":["Frog","Snake","Dog","Bird"],"answer":"Frog","category":"GK"},
  {"question":"Earth rotates on","options":["Axis","Sun","Moon","Mars"],"answer":"Axis","category":"GK"},
  {"question":"National bird India","options":["Peacock","Crow","Sparrow","Parrot"],"answer":"Peacock","category":"GK"},
  {"question":"Which vitamin sunlight","options":["A","B","C","D"],"answer":"D","category":"GK"},
  {"question":"Largest river India","options":["Ganga","Yamuna","Godavari","Narmada"],"answer":"Ganga","category":"GK"},
  {"question":"Currency China","options":["Yuan","Dollar","Yen","Euro"],"answer":"Yuan","category":"GK"},
  {"question":"National tree","options":["Banyan","Neem","Peepal","Mango"],"answer":"Banyan","category":"GK"},
  {"question":"Sun is","options":["Star","Planet","Moon","Asteroid"],"answer":"Star","category":"GK"},
  {"question":"India republic day","options":["26 Jan","15 Aug","2 Oct","1 May"],"answer":"26 Jan","category":"GK"},

  {"question":"25% of 400","options":["100","120","80","90"],"answer":"100","category":"Maths"},
  {"question":"SI: P=2000 R=5% T=2","options":["200","300","400","500"],"answer":"200","category":"Maths"},
  {"question":"Average of 5 numbers =20 sum?","options":["80","100","120","90"],"answer":"100","category":"Maths"},
  {"question":"Ratio 3:5 total 40","options":["15","20","25","30"],"answer":"15","category":"Maths"},
  {"question":"Work: A=10 days B=20 days","options":["6.66","7","5","8"],"answer":"6.66","category":"Maths"},
  {"question":"Square 45","options":["2025","3025","4025","5025"],"answer":"2025","category":"Maths"},
  {"question":"40% of 300","options":["100","120","140","160"],"answer":"120","category":"Maths"},
  {"question":"LCM 6,9","options":["18","36","12","27"],"answer":"18","category":"Maths"},
  {"question":"HCF 18,24","options":["6","12","3","9"],"answer":"6","category":"Maths"},
  {"question":"Profit: CP=500 SP=600","options":["10%","15%","20%","25%"],"answer":"20%","category":"Maths"},
  {"question":"Speed 120km in 2hr","options":["60","50","70","80"],"answer":"60","category":"Maths"},
  {"question":"Time 180km at 60km/hr","options":["2","3","4","5"],"answer":"3","category":"Maths"},
  {"question":"Area square side 6","options":["36","30","25","40"],"answer":"36","category":"Maths"},
  {"question":"Discount 200->150","options":["20%","25%","30%","15%"],"answer":"25%","category":"Maths"},
  {"question":"2/3 + 1/3","options":["1","2","0","1/2"],"answer":"1","category":"Maths"},
  {"question":"Cube 4","options":["16","64","32","8"],"answer":"64","category":"Maths"},
  {"question":"3^3","options":["9","27","18","12"],"answer":"27","category":"Maths"},
  {"question":"Average sum 60 numbers 3","options":["20","15","30","10"],"answer":"20","category":"Maths"},
  {"question":"Perimeter rectangle 10x5","options":["30","40","50","20"],"answer":"30","category":"Maths"},
  {"question":"Ratio 2:3 total 50","options":["20","30","25","15"],"answer":"20","category":"Maths"}
];

// Fix Q14 Reasoning: answer "15°" not in options ["165°","180°","150°","135°"].
// Actual angle at 6:30 = 15°. Add it as an option.
RAW[13].options = ["15°","180°","150°","135°"];

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

  let category = await ExamCategory.findOne({ name: 'Central', type: 'Central' });
  if (!category) {
    category = await ExamCategory.create({ name: 'Central', type: 'Central', description: 'Central government competitive exams' });
    console.log(`Created ExamCategory: Central (${category._id})`);
  } else {
    console.log(`Found ExamCategory: Central (${category._id})`);
  }

  let exam = await Exam.findOne({ code: 'RRB-NTPC' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'RRB NTPC',
      code: 'RRB-NTPC',
      description: 'Railway Recruitment Board - Non-Technical Popular Categories',
      isActive: true
    });
    console.log(`Created Exam: RRB NTPC (${exam._id})`);
  } else {
    console.log(`Found Exam: RRB NTPC (${exam._id})`);
  }

  let pattern = await ExamPattern.findOne({ exam: exam._id, title: 'RRB NTPC CBT-1' });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: 'RRB NTPC CBT-1',
      duration: 90,
      totalMarks: 100,
      negativeMarking: 0.333,
      sections: [
        { name: MATH, totalQuestions: 30, marksPerQuestion: 1, negativePerQuestion: 0.333 },
        { name: REA,  totalQuestions: 30, marksPerQuestion: 1, negativePerQuestion: 0.333 },
        { name: GA,   totalQuestions: 40, marksPerQuestion: 1, negativePerQuestion: 0.333 }
      ]
    });
    console.log(`Created ExamPattern: RRB NTPC CBT-1 (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: RRB NTPC CBT-1 (${pattern._id})`);
  }

  const TITLE = 'RRB NTPC CBT-1 Practice Test 1';

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
