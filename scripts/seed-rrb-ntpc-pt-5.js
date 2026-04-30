/**
 * Seed: RRB NTPC CBT-1 - Practice Test 5
 * Run with: node scripts/seed-rrb-ntpc-pt-5.js
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
  {"question":"Series: 12, 25, 51, 103, ?","options":["205","206","207","208"],"answer":"207","category":"Reasoning"},
  {"question":"Find missing: 7, 14, 28, 56, 112, ?","options":["200","210","224","240"],"answer":"224","category":"Reasoning"},
  {"question":"Coding: PLANT = QMBOU, SHIP = ?","options":["TIJQ","TIHP","UIJR","SIJQ"],"answer":"TIJQ","category":"Reasoning"},
  {"question":"Odd one out","options":["Cylinder","Cube","Sphere","Rectangle"],"answer":"Rectangle","category":"Reasoning"},
  {"question":"If A=3, B=6, then DOG=?","options":["30","33","36","39"],"answer":"36","category":"Reasoning"},
  {"question":"Series: 4, 18, 48, 100, ?","options":["180","196","200","210"],"answer":"180","category":"Reasoning"},
  {"question":"Mirror image of 'L'","options":["⅃","L","Γ","J"],"answer":"⅃","category":"Reasoning"},
  {"question":"Blood relation: Father's wife's brother","options":["Uncle","Father","Cousin","Grandfather"],"answer":"Uncle","category":"Reasoning"},
  {"question":"Direction: North → East → South → West final?","options":["North","South","East","West"],"answer":"West","category":"Reasoning"},
  {"question":"Analogy: Teacher: School :: Doctor:?","options":["Hospital","Clinic","Patient","Medicine"],"answer":"Hospital","category":"Reasoning"},
  {"question":"Puzzle: A,B,C,D,E in row. B at extreme left, C next to B, A not at ends. Who is middle?","options":["A","C","D","E"],"answer":"A","category":"Reasoning"},
  {"question":"Series: 3, 8, 18, 38, ?","options":["78","76","80","82"],"answer":"78","category":"Reasoning"},
  {"question":"Coding: HARD = IBSE, SOFT=?","options":["TPGU","TPFT","TPHU","TPHT"],"answer":"TPGU","category":"Reasoning"},
  {"question":"Odd: Potato, Carrot, Mango, Onion","options":["Potato","Carrot","Mango","Onion"],"answer":"Mango","category":"Reasoning"},
  {"question":"Clock: 9:20 angle","options":["160°","140°","150°","170°"],"answer":"160°","category":"Reasoning"},
  {"question":"Series: 9, 27, 81, 243, ?","options":["729","720","700","750"],"answer":"729","category":"Reasoning"},
  {"question":"Venn: Birds, Animals, Humans","options":["All animals","Separate","Birds only","Humans only"],"answer":"All animals","category":"Reasoning"},
  {"question":"Find: 19, 23, 29, 31, 37, ?","options":["41","39","40","42"],"answer":"41","category":"Reasoning"},
  {"question":"Analogy: Water: Drink :: Food:?","options":["Eat","Cook","Serve","Taste"],"answer":"Eat","category":"Reasoning"},
  {"question":"Series: V, R, M, G, ?","options":["A","B","C","D"],"answer":"A","category":"Reasoning"},
  {"question":"Number analogy: 18:324 :: 20:?","options":["400","380","420","360"],"answer":"400","category":"Reasoning"},
  {"question":"Find missing: 10, 17, 31, 59, ?","options":["115","117","118","120"],"answer":"117","category":"Reasoning"},
  {"question":"Odd: Glass, Cup, Bottle, Plate","options":["Glass","Cup","Bottle","Plate"],"answer":"Plate","category":"Reasoning"},
  {"question":"Direction: East → West → North final?","options":["North","South","East","West"],"answer":"North","category":"Reasoning"},
  {"question":"Series: 6, 11, 21, 41, 81, ?","options":["161","162","163","164"],"answer":"161","category":"Reasoning"},
  {"question":"Coding: FIRE = GJFS, WATER=?","options":["XBUFS","XATFS","XBUFR","WBUFS"],"answer":"XBUFS","category":"Reasoning"},
  {"question":"Clock: 11:25 angle","options":["162.5°","150°","140°","155°"],"answer":"162.5°","category":"Reasoning"},
  {"question":"Arrange: Eagle, Snake, Grass","options":["Grass Snake Eagle","Snake Eagle Grass","Eagle Snake Grass","None"],"answer":"Grass Snake Eagle","category":"Reasoning"},
  {"question":"Odd: Silver, Gold, Copper, Sand","options":["Silver","Gold","Copper","Sand"],"answer":"Sand","category":"Reasoning"},
  {"question":"Series: 20, 18, 15, 11, 6, ?","options":["0","1","2","-1"],"answer":"0","category":"Reasoning"},

  {"question":"Who was founder of Gupta Empire?","options":["Chandragupta I","Samudragupta","Ashoka","Harsha"],"answer":"Chandragupta I","category":"History"},
  {"question":"Battle of Haldighati fought in","options":["1576","1526","1600","1707"],"answer":"1576","category":"History"},
  {"question":"Who wrote Gita?","options":["Vyasa","Kalidas","Tulsidas","Valmiki"],"answer":"Vyasa","category":"History"},
  {"question":"Permanent Settlement by","options":["Cornwallis","Clive","Dalhousie","Curzon"],"answer":"Cornwallis","category":"History"},
  {"question":"Civil Disobedience Movement year","options":["1930","1942","1919","1905"],"answer":"1930","category":"History"},
  {"question":"Who built Taj Mahal","options":["Shahjahan","Akbar","Babur","Aurangzeb"],"answer":"Shahjahan","category":"History"},

  {"question":"Preamble type","options":["Intro","Law","Bill","Rule"],"answer":"Intro","category":"Polity"},
  {"question":"Article 19 gives","options":["Freedom","Equality","Religion","Education"],"answer":"Freedom","category":"Polity"},
  {"question":"Comptroller Auditor General article","options":["148","149","150","151"],"answer":"148","category":"Polity"},
  {"question":"Vice President term","options":["5 years","6 years","4 years","3 years"],"answer":"5 years","category":"Polity"},

  {"question":"Highest peak India","options":["K2","Everest","Kanchenjunga","Nanda Devi"],"answer":"Kanchenjunga","category":"Geography"},
  {"question":"River Godavari flows into","options":["Bay of Bengal","Arabian Sea","Indian Ocean","None"],"answer":"Bay of Bengal","category":"Geography"},
  {"question":"Capital of Odisha","options":["Bhubaneswar","Cuttack","Puri","Rourkela"],"answer":"Bhubaneswar","category":"Geography"},
  {"question":"Red soil found in","options":["South India","North India","Desert","Himalaya"],"answer":"South India","category":"Geography"},

  {"question":"Unit of voltage","options":["Volt","Ampere","Watt","Ohm"],"answer":"Volt","category":"Physics"},
  {"question":"Energy unit","options":["Joule","Watt","Newton","Volt"],"answer":"Joule","category":"Physics"},
  {"question":"Chemical formula CO2","options":["Carbon dioxide","Oxygen","Nitrogen","Hydrogen"],"answer":"Carbon dioxide","category":"Chemistry"},
  {"question":"Most abundant gas","options":["Nitrogen","Oxygen","CO2","Hydrogen"],"answer":"Nitrogen","category":"Chemistry"},
  {"question":"Human brain part","options":["Cerebrum","Heart","Liver","Kidney"],"answer":"Cerebrum","category":"Biology"},
  {"question":"Plant food process","options":["Photosynthesis","Respiration","Digestion","Absorption"],"answer":"Photosynthesis","category":"Biology"},

  {"question":"Gaganyaan mission relates to","options":["Space","Sea","Army","Air"],"answer":"Space","category":"Current Affairs"},
  {"question":"India's Mars mission","options":["Mangalyaan","Chandrayaan","Aditya","Gaganyaan"],"answer":"Mangalyaan","category":"Current Affairs"},
  {"question":"World Earth Day","options":["22 April","5 June","7 April","1 May"],"answer":"22 April","category":"Current Affairs"},
  {"question":"Make in India launched","options":["2014","2015","2016","2013"],"answer":"2014","category":"Current Affairs"},
  {"question":"SEBI regulates","options":["Stock market","Banks","Insurance","Education"],"answer":"Stock market","category":"Current Affairs"},

  {"question":"55% of 600","options":["330","300","350","360"],"answer":"330","category":"Maths"},
  {"question":"SI: P=8000 R=5% T=2","options":["800","600","700","900"],"answer":"800","category":"Maths"},
  {"question":"Average of 40 numbers =25 sum?","options":["1000","900","800","950"],"answer":"1000","category":"Maths"},
  {"question":"Ratio 8:2 total 100","options":["80","20","60","40"],"answer":"80","category":"Maths"},
  {"question":"Work: A=20 B=10, together?","options":["6.66","5","4","3"],"answer":"6.66","category":"Maths"},
  {"question":"Square 85","options":["7225","7025","7325","7425"],"answer":"7225","category":"Maths"},
  {"question":"75% of 400","options":["300","250","200","350"],"answer":"300","category":"Maths"},
  {"question":"LCM 18,24","options":["72","36","48","96"],"answer":"72","category":"Maths"},
  {"question":"HCF 64,96","options":["32","16","8","4"],"answer":"32","category":"Maths"},
  {"question":"Profit CP=1500 SP=1800","options":["20%","25%","30%","15%"],"answer":"20%","category":"Maths"},
  {"question":"Speed 420km in 7hr","options":["60","70","80","90"],"answer":"60","category":"Maths"},
  {"question":"Time 600km at 100","options":["6","5","4","7"],"answer":"6","category":"Maths"},
  {"question":"Area circle r=28","options":["2464","2500","2400","2600"],"answer":"2464","category":"Maths"},
  {"question":"Perimeter square 20","options":["80","60","40","100"],"answer":"80","category":"Maths"},
  {"question":"Ratio 9:3 total 120","options":["90","30","60","80"],"answer":"90","category":"Maths"},
  {"question":"Discount 3000→2400","options":["20%","25%","30%","15%"],"answer":"20%","category":"Maths"},
  {"question":"7/8 + 1/8","options":["1","2","0","1/2"],"answer":"1","category":"Maths"},
  {"question":"Cube 12","options":["1728","144","288","512"],"answer":"1728","category":"Maths"},
  {"question":"8^2","options":["64","72","56","48"],"answer":"64","category":"Maths"},
  {"question":"Average sum 800 numbers 40","options":["20","25","30","35"],"answer":"20","category":"Maths"}
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

  const TITLE = 'RRB NTPC CBT-1 Practice Test 5';

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
