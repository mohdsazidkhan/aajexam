/**
 * Seed: SSC GD Constable - Practice Test 4 (80 questions)
 * Run with: node scripts/seed-ssc-gd-pt-4.js
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
  {"question":"Series: 4, 9, 19, 39, ?","options":["79","80","78","81"],"answer":"79","category":"Reasoning"},
  {"question":"Find missing: 3, 5, 11, 21, 43, ?","options":["85","87","86","88"],"answer":"85","category":"Reasoning"},
  {"question":"Coding: SUN = TVO, MOON = ?","options":["NPPQ","NQPP","NPPO","NPPP"],"answer":"NPPQ","category":"Reasoning"},
  {"question":"Odd one out","options":["Dog","Cat","Lion","Cow"],"answer":"Lion","category":"Reasoning"},
  {"question":"A is brother of B, B is mother of C. A is?","options":["Uncle","Father","Brother","Grandfather"],"answer":"Uncle","category":"Reasoning"},
  {"question":"Series: 2, 6, 18, 54, ?","options":["108","162","150","200"],"answer":"162","category":"Reasoning"},
  {"question":"Mirror of '5'","options":["Ƨ","S","5","Z"],"answer":"Ƨ","category":"Reasoning"},
  {"question":"If x/2 = 8 then x=?","options":["12","14","16","18"],"answer":"16","category":"Reasoning"},
  {"question":"Analogy: Car: Road :: Train:?","options":["Track","Sky","Water","Bridge"],"answer":"Track","category":"Reasoning"},
  {"question":"Series: A, D, H, M, ?","options":["R","S","T","Q"],"answer":"R","category":"Reasoning"},
  {"question":"Odd: 8, 27, 64, 100","options":["8","27","64","100"],"answer":"100","category":"Reasoning"},
  {"question":"Direction: East -> North turn?","options":["Left","Right","Back","None"],"answer":"Left","category":"Reasoning"},
  {"question":"Number analogy: 6:36 :: 9:?","options":["72","81","90","99"],"answer":"81","category":"Reasoning"},
  {"question":"Blood relation: Father's father","options":["Grandfather","Uncle","Brother","Cousin"],"answer":"Grandfather","category":"Reasoning"},
  {"question":"Series: 7, 14, 28, 56, ?","options":["84","96","112","120"],"answer":"112","category":"Reasoning"},
  {"question":"Coding: BAT=CBU, CAT=?","options":["DBU","CBU","DCU","DAU"],"answer":"DBU","category":"Reasoning"},
  {"question":"Find: 1, 3, 7, 15, 31, ?","options":["63","62","60","64"],"answer":"63","category":"Reasoning"},
  {"question":"Odd: Apple, Mango, Potato, Banana","options":["Apple","Mango","Potato","Banana"],"answer":"Potato","category":"Reasoning"},
  {"question":"Clock: 12:30 angle","options":["165°","180°","150°","120°"],"answer":"165°","category":"Reasoning"},
  {"question":"Arrange: Dog, Ant, Elephant","options":["Ant Dog Elephant","Dog Ant Elephant","Elephant Dog Ant","None"],"answer":"Ant Dog Elephant","category":"Reasoning"},

  {"question":"PMGSY scheme extension related to?","options":["Road","Health","Education","Banking"],"answer":"Road","category":"Current Affairs"},
  {"question":"Asia richest person 2026 (news)?","options":["Elon Musk","Gautam Adani","Ambani","Bill Gates"],"answer":"Gautam Adani","category":"Current Affairs"},
  {"question":"MILAN 2026 exercise type?","options":["Naval","Air","Army","Police"],"answer":"Naval","category":"Current Affairs"},
  {"question":"India rank Happiness Report 2026?","options":["100","116","120","110"],"answer":"116","category":"Current Affairs"},
  {"question":"BRICS 2026 meeting hosted by?","options":["India","China","Brazil","Russia"],"answer":"India","category":"Current Affairs"},
  {"question":"National Vaccination Day?","options":["15 March","16 March","17 March","18 March"],"answer":"16 March","category":"Current Affairs"},
  {"question":"Army Day India?","options":["10 Jan","15 Jan","20 Jan","25 Jan"],"answer":"15 Jan","category":"Current Affairs"},
  {"question":"GI tag Nagauri Ashwagandha state?","options":["UP","MP","Rajasthan","Gujarat"],"answer":"Rajasthan","category":"Current Affairs"},
  {"question":"India-UK exercise Vajra Prahar held in?","options":["Punjab","Rajasthan","UP","MP"],"answer":"Rajasthan","category":"Current Affairs"},
  {"question":"World Hindi Day?","options":["5 Jan","10 Jan","15 Jan","20 Jan"],"answer":"10 Jan","category":"Current Affairs"},
  {"question":"Central Excise Day?","options":["20 Feb","24 Feb","25 Feb","28 Feb"],"answer":"24 Feb","category":"Current Affairs"},
  {"question":"Which festival Jan?","options":["Diwali","Holi","Makar Sankranti","Eid"],"answer":"Makar Sankranti","category":"Current Affairs"},
  {"question":"Hurun Rich List 2026 top?","options":["Musk","Adani","Ambani","Bezos"],"answer":"Musk","category":"Current Affairs"},
  {"question":"Winter Olympics 2026 topper country?","options":["USA","China","Norway","Japan"],"answer":"Norway","category":"Current Affairs"},
  {"question":"India-China talks under?","options":["UN","SCO","NATO","G20"],"answer":"SCO","category":"Current Affairs"},
  {"question":"ISSF World Cup relates to?","options":["Cricket","Shooting","Football","Tennis"],"answer":"Shooting","category":"Current Affairs"},
  {"question":"India new digital payment rules by?","options":["RBI","SEBI","NITI","Finance"],"answer":"RBI","category":"Current Affairs"},
  {"question":"India Naxal free news relates to?","options":["Security","Education","Health","Sports"],"answer":"Security","category":"Current Affairs"},
  {"question":"Bharat Tribes Fest location?","options":["Mumbai","Delhi","Jaipur","Lucknow"],"answer":"Delhi","category":"Current Affairs"},
  {"question":"World Book Fair 2026 guest country?","options":["USA","UK","Germany","France"],"answer":"Germany","category":"Current Affairs"},

  {"question":"35% of 200","options":["60","70","80","90"],"answer":"70","category":"Maths"},
  {"question":"SI: P=2500 R=4% T=2","options":["150","200","250","300"],"answer":"200","category":"Maths"},
  {"question":"Average of 8 numbers =10 sum?","options":["70","80","90","100"],"answer":"80","category":"Maths"},
  {"question":"Ratio 5:7 total 60","options":["25","30","35","20"],"answer":"25","category":"Maths"},
  {"question":"Work: A=8 days B=4 days, together?","options":["2.5","2.67","4","5"],"answer":"2.67","category":"Maths"},
  {"question":"Square 55","options":["3025","2025","4025","5025"],"answer":"3025","category":"Maths"},
  {"question":"60% of 150","options":["70","80","90","100"],"answer":"90","category":"Maths"},
  {"question":"LCM 12,15","options":["60","30","45","90"],"answer":"60","category":"Maths"},
  {"question":"HCF 18,24","options":["6","12","3","9"],"answer":"6","category":"Maths"},
  {"question":"Profit: CP=600 SP=720","options":["10%","15%","20%","25%"],"answer":"20%","category":"Maths"},
  {"question":"Speed 180km in 3hr","options":["50","60","70","80"],"answer":"60","category":"Maths"},
  {"question":"Time 240km at 80km/hr","options":["2","3","4","5"],"answer":"3","category":"Maths"},
  {"question":"Perimeter square side 6","options":["24","36","18","30"],"answer":"24","category":"Maths"},
  {"question":"Area square side 7","options":["49","42","36","56"],"answer":"49","category":"Maths"},
  {"question":"Ratio 2:3 total 40","options":["16","20","24","18"],"answer":"16","category":"Maths"},
  {"question":"Discount 400->300","options":["20%","25%","30%","35%"],"answer":"25%","category":"Maths"},
  {"question":"2/3 + 1/3","options":["1","2","0","1/2"],"answer":"1","category":"Maths"},
  {"question":"Cube 6","options":["216","125","150","180"],"answer":"216","category":"Maths"},
  {"question":"4^2","options":["8","16","32","12"],"answer":"16","category":"Maths"},
  {"question":"Average sum 90 numbers 9","options":["10","15","20","25"],"answer":"10","category":"Maths"},

  {"question":"Synonym Quick","options":["Fast","Slow","Late","Weak"],"answer":"Fast","category":"English"},
  {"question":"Antonym Happy","options":["Sad","Joy","Glad","Smile"],"answer":"Sad","category":"English"},
  {"question":"He ___ eating","options":["is","are","am","be"],"answer":"is","category":"English"},
  {"question":"We ___ cricket","options":["play","plays","playing","played"],"answer":"play","category":"English"},
  {"question":"Plural tooth","options":["tooths","teeth","toothes","tooth"],"answer":"teeth","category":"English"},
  {"question":"Past go","options":["went","gone","goes","goed"],"answer":"went","category":"English"},
  {"question":"Fill: I ___ happy","options":["is","are","am","be"],"answer":"am","category":"English"},
  {"question":"Synonym big","options":["Large","Tiny","Small","Short"],"answer":"Large","category":"English"},
  {"question":"Antonym dark","options":["Light","Night","Black","Shadow"],"answer":"Light","category":"English"},
  {"question":"Correct spelling","options":["Buisness","Business","Busines","Busyness"],"answer":"Business","category":"English"},
  {"question":"विलोम: अमीर","options":["गरीब","धनी","मोटा","बड़ा"],"answer":"गरीब","category":"Hindi"},
  {"question":"पर्यायवाची: नदी","options":["सरिता","पर्वत","जल","समुद्र"],"answer":"सरिता","category":"Hindi"},
  {"question":"शुद्ध शब्द","options":["विद्यार्थी","विद्यार्थि","विद्यारथी","विदयार्थी"],"answer":"विद्यार्थी","category":"Hindi"},
  {"question":"विलोम: गर्म","options":["ठंडा","गरम","ताप","आग"],"answer":"ठंडा","category":"Hindi"},
  {"question":"संधि: जल+आशय","options":["जलाशय","जलआशय","जलशय","जलायश"],"answer":"जलाशय","category":"Hindi"},
  {"question":"मुहावरा: नाक कटना","options":["अपमान","खुशी","रोना","हँसना"],"answer":"अपमान","category":"Hindi"},
  {"question":"विलोम: ऊँचा","options":["नीचा","ऊपर","लंबा","बड़ा"],"answer":"नीचा","category":"Hindi"},
  {"question":"पर्यायवाची: मित्र","options":["सखा","दुश्मन","शत्रु","राजा"],"answer":"सखा","category":"Hindi"},
  {"question":"वाक्य सही","options":["मैं जाता हूँ","मैं जाता है","मैं जाते हूँ","मैं जाओ"],"answer":"मैं जाता हूँ","category":"Hindi"},
  {"question":"शब्द अर्थ: साहसी","options":["बहादुर","डरपोक","कमजोर","धीमा"],"answer":"बहादुर","category":"Hindi"}
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

  const TITLE = 'SSC GD Constable Practice Test 4';

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
