/**
 * Seed: RRB NTPC CBT-1 - Practice Test 4
 * Run with: node scripts/seed-rrb-ntpc-pt-4.js
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
  {"question":"Series: 11, 23, 47, 95, ?","options":["189","190","191","192"],"answer":"191","category":"Reasoning"},
  {"question":"Find missing: 9, 27, 18, 54, 27, ?","options":["72","81","90","108"],"answer":"81","category":"Reasoning"},
  {"question":"Coding: BRAVE = CSBWF, SMART = ?","options":["TNBSU","TNART","TNBRT","TOBSV"],"answer":"TNBSU","category":"Reasoning"},
  {"question":"Odd one out","options":["Pentagon","Hexagon","Circle","Triangle"],"answer":"Circle","category":"Reasoning"},
  {"question":"If A=2, B=4, then CAB=?","options":["12","14","16","18"],"answer":"12","category":"Reasoning"},
  {"question":"Series: 5, 20, 60, 120, ?","options":["200","180","240","300"],"answer":"200","category":"Reasoning"},
  {"question":"Mirror image of 'F'","options":["ꟻ","F","E","Ǝ"],"answer":"ꟻ","category":"Reasoning"},
  {"question":"Blood relation: Mother's father's daughter","options":["Aunt","Mother","Sister","Cousin"],"answer":"Mother","category":"Reasoning"},
  {"question":"Direction: East → North → West turn?","options":["South","North","East","West"],"answer":"West","category":"Reasoning"},
  {"question":"Analogy: Knife: Cut :: Pen:?","options":["Write","Draw","Ink","Paper"],"answer":"Write","category":"Reasoning"},
  {"question":"Puzzle: A,B,C,D,E in line. C middle, A at end, B left of C. Who is rightmost?","options":["A","D","E","B"],"answer":"E","category":"Reasoning"},
  {"question":"Series: 2, 10, 30, 68, ?","options":["130","140","150","160"],"answer":"130","category":"Reasoning"},
  {"question":"Coding: GOLD = HPME, SILVER=?","options":["TJMWFS","TJMWEF","TILWFS","TJMWER"],"answer":"TJMWFS","category":"Reasoning"},
  {"question":"Odd: Rose, Lotus, Lily, Carrot","options":["Rose","Lotus","Lily","Carrot"],"answer":"Carrot","category":"Reasoning"},
  {"question":"Clock: 8:20 angle","options":["140°","130°","120°","150°"],"answer":"130°","category":"Reasoning"},
  {"question":"Series: 6, 18, 54, 162, ?","options":["324","486","500","600"],"answer":"486","category":"Reasoning"},
  {"question":"Venn: Engineers, Doctors, Humans","options":["All humans","Separate","Doctors only","Engineers only"],"answer":"All humans","category":"Reasoning"},
  {"question":"Find: 17, 19, 23, 29, 31, ?","options":["33","35","37","39"],"answer":"37","category":"Reasoning"},
  {"question":"Analogy: Sun: Day :: Moon:?","options":["Night","Light","Dark","Sky"],"answer":"Night","category":"Reasoning"},
  {"question":"Series: W, T, P, K, ?","options":["E","F","G","H"],"answer":"E","category":"Reasoning"},
  {"question":"Number analogy: 14:196 :: 16:?","options":["256","240","260","280"],"answer":"256","category":"Reasoning"},
  {"question":"Find missing: 8, 15, 29, 57, ?","options":["113","114","115","116"],"answer":"113","category":"Reasoning"},
  {"question":"Odd: Chair, Table, Fan, Sofa","options":["Chair","Table","Fan","Sofa"],"answer":"Fan","category":"Reasoning"},
  {"question":"Direction: North → South → East final?","options":["East","West","North","South"],"answer":"East","category":"Reasoning"},
  {"question":"Series: 3, 5, 9, 17, 33, ?","options":["65","66","67","68"],"answer":"65","category":"Reasoning"},
  {"question":"Coding: TIME = UJNF, GAME=?","options":["HBNF","HAME","HBMF","HBNG"],"answer":"HBNF","category":"Reasoning"},
  {"question":"Clock: 2:40 angle","options":["140°","130°","150°","160°"],"answer":"160°","category":"Reasoning"},
  {"question":"Arrange: Snake, Frog, Grass","options":["Grass Frog Snake","Snake Frog Grass","Frog Snake Grass","None"],"answer":"Grass Frog Snake","category":"Reasoning"},
  {"question":"Odd: Iron, Copper, Plastic, Silver","options":["Iron","Copper","Plastic","Silver"],"answer":"Plastic","category":"Reasoning"},
  {"question":"Series: 15, 13, 10, 6, 1, ?","options":["-5","-4","-3","-2"],"answer":"-5","category":"Reasoning"},

  {"question":"Who started Non-Cooperation Movement?","options":["Gandhi","Nehru","Tilak","Patel"],"answer":"Gandhi","category":"History"},
  {"question":"Battle of Plassey fought in","options":["1757","1764","1857","1773"],"answer":"1757","category":"History"},
  {"question":"Who built Fatehpur Sikri","options":["Akbar","Babur","Humayun","Shahjahan"],"answer":"Akbar","category":"History"},
  {"question":"Who was last Mughal emperor","options":["Bahadur Shah II","Akbar","Aurangzeb","Shah Alam"],"answer":"Bahadur Shah II","category":"History"},
  {"question":"Indian National Congress founded in","options":["1885","1905","1857","1875"],"answer":"1885","category":"History"},
  {"question":"Who discovered sea route to India","options":["Vasco da Gama","Columbus","Magellan","Cook"],"answer":"Vasco da Gama","category":"History"},

  {"question":"President election article","options":["54","52","56","58"],"answer":"54","category":"Polity"},
  {"question":"Fundamental Duties part","options":["Part IVA","Part III","Part II","Part V"],"answer":"Part IVA","category":"Polity"},
  {"question":"Emergency article","options":["352","360","370","356"],"answer":"352","category":"Polity"},
  {"question":"Lok Sabha Speaker elected by","options":["Members","President","PM","Judiciary"],"answer":"Members","category":"Polity"},

  {"question":"Longest river world","options":["Nile","Amazon","Ganga","Yangtze"],"answer":"Nile","category":"Geography"},
  {"question":"Desert in India","options":["Thar","Sahara","Gobi","Kalahari"],"answer":"Thar","category":"Geography"},
  {"question":"Capital of Punjab","options":["Chandigarh","Amritsar","Ludhiana","Patiala"],"answer":"Chandigarh","category":"Geography"},
  {"question":"Black soil found in","options":["Deccan","Himalaya","Desert","Coastal"],"answer":"Deccan","category":"Geography"},

  {"question":"Unit of current","options":["Ampere","Volt","Watt","Ohm"],"answer":"Ampere","category":"Physics"},
  {"question":"SI unit of work","options":["Joule","Newton","Watt","Pascal"],"answer":"Joule","category":"Physics"},
  {"question":"Chemical formula NaCl","options":["Salt","Acid","Base","Water"],"answer":"Salt","category":"Chemistry"},
  {"question":"Most reactive metal","options":["Potassium","Iron","Gold","Silver"],"answer":"Potassium","category":"Chemistry"},
  {"question":"Human heart chambers","options":["4","2","3","5"],"answer":"4","category":"Biology"},
  {"question":"DNA full form","options":["Deoxyribonucleic acid","Ribonucleic acid","Acid DNA","None"],"answer":"Deoxyribonucleic acid","category":"Biology"},

  {"question":"Olympics 2024 host","options":["Paris","Tokyo","London","USA"],"answer":"Paris","category":"Current Affairs"},
  {"question":"India Chandrayaan mission","options":["Moon","Sun","Mars","Venus"],"answer":"Moon","category":"Current Affairs"},
  {"question":"World Water Day","options":["22 March","5 June","7 April","10 Oct"],"answer":"22 March","category":"Current Affairs"},
  {"question":"Digital India launched in","options":["2015","2014","2016","2013"],"answer":"2015","category":"Current Affairs"},
  {"question":"India's central bank","options":["RBI","SEBI","NABARD","SIDBI"],"answer":"RBI","category":"Current Affairs"},

  {"question":"45% of 800","options":["360","320","300","400"],"answer":"360","category":"Maths"},
  {"question":"SI: P=6000 R=5% T=2","options":["600","500","400","300"],"answer":"600","category":"Maths"},
  {"question":"Average of 25 numbers =20 sum?","options":["500","450","400","480"],"answer":"500","category":"Maths"},
  {"question":"Ratio 4:6 total 100","options":["40","60","50","70"],"answer":"40","category":"Maths"},
  {"question":"Work: A=15 B=5, together?","options":["3.75","4","2.5","5"],"answer":"3.75","category":"Maths"},
  {"question":"Square 75","options":["5625","5525","5725","5825"],"answer":"5625","category":"Maths"},
  {"question":"90% of 200","options":["180","170","160","150"],"answer":"180","category":"Maths"},
  {"question":"LCM 16,20","options":["80","40","60","100"],"answer":"80","category":"Maths"},
  {"question":"HCF 56,72","options":["8","6","12","4"],"answer":"8","category":"Maths"},
  {"question":"Profit CP=1200 SP=1500","options":["25%","20%","30%","15%"],"answer":"25%","category":"Maths"},
  {"question":"Speed 360km in 6hr","options":["60","50","70","80"],"answer":"60","category":"Maths"},
  {"question":"Time 480km at 80","options":["6","5","4","7"],"answer":"6","category":"Maths"},
  {"question":"Area circle r=21","options":["1386","1300","1400","1450"],"answer":"1386","category":"Maths"},
  {"question":"Perimeter square 15","options":["60","45","30","75"],"answer":"60","category":"Maths"},
  {"question":"Ratio 7:5 total 120","options":["70","50","60","80"],"answer":"70","category":"Maths"},
  {"question":"Discount 2000→1600","options":["20%","25%","30%","15%"],"answer":"20%","category":"Maths"},
  {"question":"5/6 + 1/6","options":["1","2","0","1/2"],"answer":"1","category":"Maths"},
  {"question":"Cube 11","options":["1331","121","111","144"],"answer":"1331","category":"Maths"},
  {"question":"7^2","options":["49","42","56","63"],"answer":"49","category":"Maths"},
  {"question":"Average sum 500 numbers 25","options":["20","25","30","15"],"answer":"20","category":"Maths"}
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

  const TITLE = 'RRB NTPC CBT-1 Practice Test 4';

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
