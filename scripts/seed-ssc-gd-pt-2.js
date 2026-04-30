/**
 * Seed: SSC GD Constable - Practice Test 2 (80 questions)
 * Run with: node scripts/seed-ssc-gd-pt-2.js
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
  {"question":"Series: 3, 9, 27, 81, ?","options":["162","243","324","256"],"answer":"243","category":"Reasoning"},
  {"question":"Find missing: 4, 6, 9, 13, 18, ?","options":["22","24","25","23"],"answer":"24","category":"Reasoning"},
  {"question":"Coding: BOOK = CPPL, READ = ?","options":["SFBE","SFAD","SFBF","SEAD"],"answer":"SFBE","category":"Reasoning"},
  {"question":"Odd one out","options":["Triangle","Square","Circle","Cube"],"answer":"Cube","category":"Reasoning"},
  {"question":"A is father of B, B is brother of C, C is mother of D. A is?","options":["Grandfather","Father","Uncle","Brother"],"answer":"Grandfather","category":"Reasoning"},
  {"question":"Mirror of '2'","options":["S","Ƨ","2","Z"],"answer":"Ƨ","category":"Reasoning"},
  {"question":"Series: Z, X, U, Q, ?","options":["L","M","N","O"],"answer":"L","category":"Reasoning"},
  {"question":"If 7x - 3 = 25, x=?","options":["3","4","5","6"],"answer":"4","category":"Reasoning"},
  {"question":"Venn: Car, Bike, Vehicle","options":["Vehicle includes both","Separate","Bike only","Car only"],"answer":"Vehicle includes both","category":"Reasoning"},
  {"question":"Direction: South -> East turn?","options":["Left","Right","Back","None"],"answer":"Left","category":"Reasoning"},
  {"question":"Odd: 2, 4, 8, 14","options":["2","4","8","14"],"answer":"14","category":"Reasoning"},
  {"question":"Series: 1, 1, 2, 3, 5, ?","options":["6","7","8","9"],"answer":"8","category":"Reasoning"},
  {"question":"Coding: PEN = QFO, MAP = ?","options":["NBQ","NBR","NBP","NBO"],"answer":"NBQ","category":"Reasoning"},
  {"question":"Blood relation: Mother's sister","options":["Aunt","Cousin","Grandmother","Niece"],"answer":"Aunt","category":"Reasoning"},
  {"question":"Number analogy: 5:25 :: 6:?","options":["30","36","40","42"],"answer":"36","category":"Reasoning"},
  {"question":"Clock: 6:00 angle","options":["0°","90°","180°","45°"],"answer":"180°","category":"Reasoning"},
  {"question":"Arrange: Zebra, Cat, Dog","options":["Cat Dog Zebra","Dog Cat Zebra","Zebra Dog Cat","None"],"answer":"Cat Dog Zebra","category":"Reasoning"},
  {"question":"Find: 2, 5, 11, 23, ?","options":["45","47","48","50"],"answer":"47","category":"Reasoning"},
  {"question":"Odd: Table, Chair, Fan, Bed","options":["Table","Chair","Fan","Bed"],"answer":"Fan","category":"Reasoning"},
  {"question":"Analogy: Doctor: Hospital :: Teacher:?","options":["School","Book","Student","Class"],"answer":"School","category":"Reasoning"},

  {"question":"Battle of Plassey year","options":["1757","1764","1857","1747"],"answer":"1757","category":"GK"},
  {"question":"First PM India","options":["Nehru","Gandhi","Patel","Rajendra"],"answer":"Nehru","category":"GK"},
  {"question":"Largest continent","options":["Asia","Africa","Europe","Australia"],"answer":"Asia","category":"GK"},
  {"question":"National sport India","options":["Cricket","Hockey","Football","Kabaddi"],"answer":"Hockey","category":"GK"},
  {"question":"Ganga originates from","options":["Yamunotri","Gangotri","Kedarnath","Badrinath"],"answer":"Gangotri","category":"GK"},
  {"question":"Chemical symbol Na","options":["Sodium","Nitrogen","Neon","Nickel"],"answer":"Sodium","category":"GK"},
  {"question":"Currency Japan","options":["Dollar","Yen","Euro","Peso"],"answer":"Yen","category":"GK"},
  {"question":"Largest desert","options":["Sahara","Gobi","Thar","Arctic"],"answer":"Sahara","category":"GK"},
  {"question":"First man on Moon","options":["Armstrong","Aldrin","Gagarin","Newton"],"answer":"Armstrong","category":"GK"},
  {"question":"Who discovered gravity","options":["Newton","Einstein","Galileo","Tesla"],"answer":"Newton","category":"GK"},
  {"question":"Capital of Maharashtra","options":["Mumbai","Pune","Nagpur","Nashik"],"answer":"Mumbai","category":"GK"},
  {"question":"Largest river world","options":["Amazon","Nile","Ganga","Yangtze"],"answer":"Nile","category":"GK"},
  {"question":"Gas CO2","options":["Oxygen","Carbon dioxide","Nitrogen","Hydrogen"],"answer":"Carbon dioxide","category":"GK"},
  {"question":"Freedom fighter India","options":["Gandhi","Hitler","Lincoln","Napoleon"],"answer":"Gandhi","category":"GK"},
  {"question":"Indian flag colors","options":["3","4","5","2"],"answer":"3","category":"GK"},
  {"question":"Largest planet","options":["Earth","Mars","Jupiter","Saturn"],"answer":"Jupiter","category":"GK"},
  {"question":"Which is metal","options":["Gold","Oxygen","Hydrogen","Helium"],"answer":"Gold","category":"GK"},
  {"question":"Sun is","options":["Planet","Star","Moon","Asteroid"],"answer":"Star","category":"GK"},
  {"question":"Currency UK","options":["Dollar","Pound","Euro","Yen"],"answer":"Pound","category":"GK"},
  {"question":"National tree India","options":["Neem","Peepal","Banyan","Mango"],"answer":"Banyan","category":"GK"},

  {"question":"25% of 400","options":["50","100","150","200"],"answer":"100","category":"Maths"},
  {"question":"SI: P=2000 R=5% T=3","options":["200","300","400","500"],"answer":"300","category":"Maths"},
  {"question":"Average 5 numbers =20, sum?","options":["80","100","120","90"],"answer":"100","category":"Maths"},
  {"question":"Ratio 3:4 total 28","options":["12","16","20","8"],"answer":"12","category":"Maths"},
  {"question":"Work: A=6 days B=3 days","options":["2","3","4","1"],"answer":"2","category":"Maths"},
  {"question":"Square 36","options":["108","1296","256","625"],"answer":"1296","category":"Maths"},
  {"question":"20% of 250","options":["40","50","60","70"],"answer":"50","category":"Maths"},
  {"question":"LCM 8,12","options":["24","48","36","12"],"answer":"24","category":"Maths"},
  {"question":"HCF 16,24","options":["4","6","8","12"],"answer":"8","category":"Maths"},
  {"question":"Profit: CP=500 SP=600","options":["10%","15%","20%","25%"],"answer":"20%","category":"Maths"},
  {"question":"Speed 120km in 2hr","options":["60","50","40","70"],"answer":"60","category":"Maths"},
  {"question":"Time 180km at 60km/hr","options":["2","3","4","5"],"answer":"3","category":"Maths"},
  {"question":"Perimeter rectangle 5x3","options":["16","15","14","18"],"answer":"16","category":"Maths"},
  {"question":"Area rectangle 5x4","options":["20","25","15","10"],"answer":"20","category":"Maths"},
  {"question":"Ratio 2:5 total 35","options":["10","15","20","25"],"answer":"10","category":"Maths"},
  {"question":"Discount 200->150","options":["20%","25%","30%","15%"],"answer":"25%","category":"Maths"},
  {"question":"3/4 + 1/4","options":["1","2","0","1/2"],"answer":"1","category":"Maths"},
  {"question":"Cube 4","options":["16","64","32","8"],"answer":"64","category":"Maths"},
  {"question":"2^4","options":["8","16","32","4"],"answer":"16","category":"Maths"},
  {"question":"Average sum 60 numbers 3","options":["20","15","30","10"],"answer":"20","category":"Maths"},

  {"question":"Synonym Brave","options":["Coward","Bold","Weak","Fear"],"answer":"Bold","category":"English"},
  {"question":"Antonym Rich","options":["Poor","Wealthy","Big","Strong"],"answer":"Poor","category":"English"},
  {"question":"They ___ playing","options":["is","are","am","be"],"answer":"are","category":"English"},
  {"question":"He ___ food","options":["eat","eats","eating","ate"],"answer":"eats","category":"English"},
  {"question":"Plural man","options":["mans","men","man","mens"],"answer":"men","category":"English"},
  {"question":"Past run","options":["run","ran","running","runned"],"answer":"ran","category":"English"},
  {"question":"Fill: We ___ friends","options":["is","are","am","be"],"answer":"are","category":"English"},
  {"question":"Synonym big","options":["Large","Small","Tiny","Short"],"answer":"Large","category":"English"},
  {"question":"Antonym fast","options":["Slow","Quick","Speed","Run"],"answer":"Slow","category":"English"},
  {"question":"Correct spelling","options":["Acomodate","Accommodate","Acommodate","Accomadate"],"answer":"Accommodate","category":"English"},
  {"question":"विलोम: सुख","options":["दुख","खुशी","आनंद","शांति"],"answer":"दुख","category":"Hindi"},
  {"question":"पर्यायवाची: अग्नि","options":["जल","पवन","आग","धूप"],"answer":"आग","category":"Hindi"},
  {"question":"शुद्ध शब्द","options":["निर्णय","निर्णेय","निर्णय्य","निर्णैय"],"answer":"निर्णय","category":"Hindi"},
  {"question":"विलोम: दिन","options":["रात","सूर्य","प्रकाश","छाया"],"answer":"रात","category":"Hindi"},
  {"question":"संधि: लोक+आचार","options":["लोकाचार","लोकार","लोकआचार","लोकाराचार"],"answer":"लोकाचार","category":"Hindi"},
  {"question":"मुहावरा: हाथ मलना","options":["पछताना","रोना","हँसना","भागना"],"answer":"पछताना","category":"Hindi"},
  {"question":"विलोम: अच्छा","options":["बुरा","खराब","गलत","सब"],"answer":"बुरा","category":"Hindi"},
  {"question":"पर्यायवाची: आकाश","options":["गगन","धरती","जल","वन"],"answer":"गगन","category":"Hindi"},
  {"question":"वाक्य सही","options":["वह जाता है","वह जाते है","वह जाओ है","वह जाओ"],"answer":"वह जाता है","category":"Hindi"},
  {"question":"शब्द अर्थ: शूरवीर","options":["बहादुर","डरपोक","कमजोर","आलसी"],"answer":"बहादुर","category":"Hindi"}
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

  const TITLE = 'SSC GD Constable Practice Test 2';

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
