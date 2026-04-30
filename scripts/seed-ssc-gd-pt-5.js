/**
 * Seed: SSC GD Constable - Practice Test 5 (80 questions)
 * Run with: node scripts/seed-ssc-gd-pt-5.js
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
  'Current Affairs': GA,
  Maths: QA,
  English: EH,
  Hindi: EH
};

const RAW = [
  {"question":"Series: 6, 13, 27, 55, ?","options":["109","111","113","115"],"answer":"111","category":"Reasoning"},
  {"question":"Find missing: 8, 24, 12, 36, 18, ?","options":["54","48","56","52"],"answer":"54","category":"Reasoning"},
  {"question":"Coding: TREE = USFF, BOOK = ?","options":["CPPL","CPQM","BPPL","CQQM"],"answer":"CPPL","category":"Reasoning"},
  {"question":"Odd one out","options":["Square","Rectangle","Triangle","Sphere"],"answer":"Sphere","category":"Reasoning"},
  {"question":"A is mother of B, B is brother of C. A is?","options":["Mother","Grandmother","Aunt","Sister"],"answer":"Mother","category":"Reasoning"},
  {"question":"Series: 3, 9, 18, 30, 45, ?","options":["60","63","66","69"],"answer":"63","category":"Reasoning"},
  {"question":"Mirror of '7'","options":["L","Γ","7","F"],"answer":"Γ","category":"Reasoning"},
  {"question":"If 4x+2=18, x=?","options":["3","4","5","6"],"answer":"4","category":"Reasoning"},
  {"question":"Analogy: Shoe: Foot :: Hat:?","options":["Head","Hand","Hair","Face"],"answer":"Head","category":"Reasoning"},
  {"question":"Series: B, E, I, N, ?","options":["S","T","U","R"],"answer":"T","category":"Reasoning"},
  {"question":"Odd: 16, 25, 36, 50","options":["16","25","36","50"],"answer":"50","category":"Reasoning"},
  {"question":"Direction: North -> West turn?","options":["Left","Right","Back","None"],"answer":"Left","category":"Reasoning"},
  {"question":"Number analogy: 7:49 :: 11:?","options":["121","111","131","141"],"answer":"121","category":"Reasoning"},
  {"question":"Blood relation: Sister's son","options":["Nephew","Cousin","Brother","Uncle"],"answer":"Nephew","category":"Reasoning"},
  {"question":"Series: 10, 20, 40, 80, ?","options":["120","140","160","180"],"answer":"160","category":"Reasoning"},
  {"question":"Coding: DOG=EPH, CAT=?","options":["DBU","EBU","CBU","DCU"],"answer":"DBU","category":"Reasoning"},
  {"question":"Find: 2, 3, 5, 9, 17, ?","options":["33","34","35","36"],"answer":"33","category":"Reasoning"},
  {"question":"Odd: Chair, Table, Bed, Air","options":["Chair","Table","Bed","Air"],"answer":"Air","category":"Reasoning"},
  {"question":"Clock: 4:30 angle","options":["45°","60°","75°","105°"],"answer":"45°","category":"Reasoning"},
  {"question":"Arrange: Lion, Ant, Elephant","options":["Ant Elephant Lion","Lion Ant Elephant","Elephant Ant Lion","None"],"answer":"Ant Elephant Lion","category":"Reasoning"},

  {"question":"Who is Chief Justice of India (2026)?","options":["DY Chandrachud","Ramana","Bobde","None"],"answer":"DY Chandrachud","category":"GK"},
  {"question":"Capital of Australia","options":["Sydney","Melbourne","Canberra","Perth"],"answer":"Canberra","category":"GK"},
  {"question":"Largest lake India","options":["Wular","Chilika","Dal","Sambhar"],"answer":"Chilika","category":"GK"},
  {"question":"Who discovered electricity","options":["Newton","Faraday","Edison","Tesla"],"answer":"Faraday","category":"GK"},
  {"question":"National game India","options":["Cricket","Hockey","Kabaddi","Football"],"answer":"Hockey","category":"GK"},
  {"question":"Which is noble gas","options":["Oxygen","Helium","Nitrogen","Hydrogen"],"answer":"Helium","category":"GK"},
  {"question":"Currency Russia","options":["Ruble","Dollar","Euro","Yen"],"answer":"Ruble","category":"GK"},
  {"question":"Longest river world","options":["Amazon","Nile","Yangtze","Mississippi"],"answer":"Nile","category":"GK"},
  {"question":"First Indian Nobel winner","options":["Tagore","Gandhi","Nehru","Bose"],"answer":"Tagore","category":"GK"},
  {"question":"Which is smallest state India","options":["Goa","Sikkim","Tripura","Nagaland"],"answer":"Goa","category":"GK"},
  {"question":"Earth rotates around","options":["Sun","Moon","Axis","Mars"],"answer":"Axis","category":"GK"},
  {"question":"National currency UK","options":["Pound","Dollar","Euro","Yen"],"answer":"Pound","category":"GK"},
  {"question":"Which is not metal","options":["Iron","Gold","Oxygen","Silver"],"answer":"Oxygen","category":"GK"},
  {"question":"Which country hosts Olympics 2028","options":["USA","China","France","Japan"],"answer":"USA","category":"GK"},
  {"question":"Largest dam India","options":["Bhakra","Tehri","Hirakud","Sardar Sarovar"],"answer":"Tehri","category":"GK"},
  {"question":"Which vitamin for eyes","options":["A","B","C","D"],"answer":"A","category":"GK"},
  {"question":"Currency Germany","options":["Euro","Dollar","Mark","Pound"],"answer":"Euro","category":"GK"},
  {"question":"Which is amphibian","options":["Frog","Snake","Dog","Bird"],"answer":"Frog","category":"GK"},
  {"question":"Largest island","options":["Greenland","Australia","India","Japan"],"answer":"Greenland","category":"GK"},
  {"question":"Which gas plants release","options":["Oxygen","CO2","Nitrogen","Hydrogen"],"answer":"Oxygen","category":"GK"},

  {"question":"45% of 400","options":["160","170","180","190"],"answer":"180","category":"Maths"},
  {"question":"SI: P=3000 R=5% T=2","options":["200","300","400","500"],"answer":"300","category":"Maths"},
  {"question":"Average of 7 numbers =14 sum?","options":["84","90","98","100"],"answer":"98","category":"Maths"},
  {"question":"Ratio 6:7 total 65","options":["30","35","40","25"],"answer":"30","category":"Maths"},
  {"question":"Work: A=5 days B=10 days, together?","options":["3.33","4","5","6"],"answer":"3.33","category":"Maths"},
  {"question":"Square 65","options":["4225","3025","5025","6025"],"answer":"4225","category":"Maths"},
  {"question":"70% of 200","options":["120","130","140","150"],"answer":"140","category":"Maths"},
  {"question":"LCM 9,12","options":["36","48","24","72"],"answer":"36","category":"Maths"},
  {"question":"HCF 21,28","options":["7","14","3","4"],"answer":"7","category":"Maths"},
  {"question":"Profit: CP=700 SP=840","options":["10%","15%","20%","25%"],"answer":"20%","category":"Maths"},
  {"question":"Speed 210km in 3hr","options":["60","70","80","90"],"answer":"70","category":"Maths"},
  {"question":"Time 300km at 75km/hr","options":["3","4","5","6"],"answer":"4","category":"Maths"},
  {"question":"Perimeter rectangle 8x6","options":["28","24","30","32"],"answer":"28","category":"Maths"},
  {"question":"Area rectangle 9x5","options":["45","40","50","35"],"answer":"45","category":"Maths"},
  {"question":"Ratio 4:9 total 52","options":["16","18","20","24"],"answer":"16","category":"Maths"},
  {"question":"Discount 800->600","options":["20%","25%","30%","35%"],"answer":"25%","category":"Maths"},
  {"question":"3/5 + 2/5","options":["1","2","0","1/2"],"answer":"1","category":"Maths"},
  {"question":"Cube 7","options":["343","216","512","256"],"answer":"343","category":"Maths"},
  {"question":"5^2","options":["10","20","25","30"],"answer":"25","category":"Maths"},
  {"question":"Average sum 120 numbers 6","options":["20","15","25","30"],"answer":"20","category":"Maths"},

  {"question":"Synonym Smart","options":["Clever","Dull","Weak","Lazy"],"answer":"Clever","category":"English"},
  {"question":"Antonym Cold","options":["Hot","Cool","Warm","Freeze"],"answer":"Hot","category":"English"},
  {"question":"She ___ singing","options":["is","are","am","be"],"answer":"is","category":"English"},
  {"question":"They ___ cricket","options":["play","plays","playing","played"],"answer":"play","category":"English"},
  {"question":"Plural mouse","options":["mouses","mice","mouse","mices"],"answer":"mice","category":"English"},
  {"question":"Past see","options":["saw","seen","see","seeing"],"answer":"saw","category":"English"},
  {"question":"Fill: He ___ my brother","options":["is","are","am","be"],"answer":"is","category":"English"},
  {"question":"Synonym rich","options":["Wealthy","Poor","Weak","Small"],"answer":"Wealthy","category":"English"},
  {"question":"Antonym near","options":["Far","Close","Next","Here"],"answer":"Far","category":"English"},
  {"question":"Correct spelling","options":["Definately","Definitely","Definetely","Definatly"],"answer":"Definitely","category":"English"},
  {"question":"विलोम: प्रेम","options":["घृणा","प्यार","स्नेह","मित्र"],"answer":"घृणा","category":"Hindi"},
  {"question":"पर्यायवाची: राजा","options":["नरेश","गुलाम","सेवक","मित्र"],"answer":"नरेश","category":"Hindi"},
  {"question":"शुद्ध शब्द","options":["अधिकार","अधीकार","अधिकार्","आधिकार"],"answer":"अधिकार","category":"Hindi"},
  {"question":"विलोम: तेज","options":["मंद","प्रकाश","गति","आग"],"answer":"मंद","category":"Hindi"},
  {"question":"संधि: मनः+आलय","options":["मनोलय","मनालय","मनःआलय","मन्आलय"],"answer":"मनोलय","category":"Hindi"},
  {"question":"मुहावरा: हाथ धोकर पीछे पड़ना","options":["लगातार पीछा करना","रोना","हँसना","भागना"],"answer":"लगातार पीछा करना","category":"Hindi"},
  {"question":"विलोम: ऊष्ण","options":["शीत","गरम","ताप","आग"],"answer":"शीत","category":"Hindi"},
  {"question":"पर्यायवाची: सूर्य","options":["दिनकर","चंद्र","जल","पवन"],"answer":"दिनकर","category":"Hindi"},
  {"question":"वाक्य सही","options":["वह खेलता है","वह खेलते है","वह खेलता हूँ","वह खेल"],"answer":"वह खेलता है","category":"Hindi"},
  {"question":"शब्द अर्थ: परिश्रम","options":["मेहनत","आलस","नींद","खेल"],"answer":"मेहनत","category":"Hindi"}
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

  const TITLE = 'SSC GD Constable Practice Test 5';

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
