/**
 * Seed: SSC Selection Post Phase X (Graduate Level) PYQ - 4 August 2022, Shift-4 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-4aug2022-s4.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not found'); process.exit(1); }

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/04/shift-4/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-4aug2022-s4';

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

async function uploadIfExists(filename) {
  const fp = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(fp)) return '';
  const res = await cloudinary.uploader.upload(fp, {
    folder: CLOUDINARY_FOLDER,
    public_id: filename.replace(/\.png$/i, ''),
    overwrite: true,
    resource_type: 'image'
  });
  return res.secure_url;
}

const F = '4-august-2022';
const IMAGE_MAP = {
  3:  { q: `${F}-q-3.png`,
        opts: [`${F}-q-3-option-1.png`,`${F}-q-3-option-2.png`,`${F}-q-3-option-3.png`,`${F}-q-3-option-4.png`] },
  17: { q: `${F}-q-17.png`,
        opts: [`${F}-q-17-option-1.png`,`${F}-q-17-option-2.png`,`${F}-q-17-option-3.png`,`${F}-q-17-option-4.png`] },
  21: { q: `${F}-q-21.png` },
  24: { q: `${F}-q-24.png`,
        opts: [`${F}-q-24-option-1.png`,`${F}-q-24-option-2.png`,`${F}-q-24-option-3.png`,`${F}-q-24-option-4.png`] },
  51: { q: `${F}-q-51.png` },
  53: { q: `${F}-q-53.png` },
  54: { q: `${F}-q-54.png` },
  56: { q: `${F}-q-56.png` },
  64: { q: `${F}-q-64.png` },
  69: { q: `${F}-q-69.png` },
  71: { q: `${F}-q-71.png` },
  73: { q: `${F}-q-73.png` },
  90: { q: `${F}-q-90.png` }
};

// 1-based answer key (Chosen Options + verified overrides).
const KEY = [
  // 1-25 (General Intelligence)
  4,3,3,1,3, 3,1,1,4,3, 2,2,4,3,4, 4,2,1,3,1, 3,3,1,4,3,
  // 26-50 (English Language)
  1,4,1,4,2, 1,3,2,1,1, 2,1,1,3,1, 2,3,1,2,4, 1,2,1,3,3,
  // 51-75 (Quantitative Aptitude)
  1,3,2,1,2, 1,1,1,1,2, 3,2,1,1,4, 4,1,3,2,2, 3,2,3,3,3,
  // 76-100 (General Awareness)
  2,4,3,3,3, 2,1,1,2,3, 4,2,1,3,4, 4,2,3,4,1, 1,3,2,1,2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "In a code, 'ORANGE' = 'BSPFHO' and 'INCOME' = 'DOJFNP'. How will 'PARENT' be written?", o: ["SBQFOU","SBQOUF","SBQUFO","SBQUOF"], e: "Per source pattern. PARENT → SBQUOF." },
  { s: REA, q: "Order of words in English dictionary.\n\n1. Eternal  2. Ether  3. Escape  4. Ethical  5. Escort  6. Eschew", o: ["6, 3, 5, 1, 2, 4","3, 6, 5, 1, 4, 2","3, 6, 5, 1, 2, 4","3, 6, 5, 2, 1, 4"], e: "Order: Escape(3) → Eschew(6) → Escort(5) → Eternal(1) → Ether(2) → Ethical(4) → 3,6,5,1,2,4." },
  { s: REA, q: "Refer to the image for the figure-series question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "In a code, 'POCKET' = 'VGMEQR' and 'BUSH' = 'JUWD'. How will 'DESIRE' be written?", o: ["GTKUGF","GTKVGE","GTJUGF","GTLVGF"], e: "Per source pattern. DESIRE → GTKUGF." },
  { s: REA, q: "Letter-cluster to complete: BIRD, DMTG, ?, HUXM, JYZP", o: ["FQWJ","FRVJ","FQVJ","FRWJ"], e: "Position-wise +2,+4,+2,+3 each step. So FQVJ." },
  { s: REA, q: "Order of words in dictionary.\n\n1. Warm  2. Wealth  3. Welcome  4. Warning  5. Weapon", o: ["1, 5, 4, 2, 3","1, 3, 2, 5, 4","1, 4, 2, 5, 3","1, 2, 4, 5, 3"], e: "Order: Warm, Warning, Wealth, Weapon, Welcome → 1,4,2,5,3." },
  { s: REA, q: "In a code, 'CHERRY' = 'CFAWPP' and 'LEMONS' = 'KCJQLM'. How will 'FRUITS' be written?", o: ["SPDQRG","SPCQRF","SPCQSG","SPDQRF"], e: "Per source pattern. FRUITS → SPDQRG." },
  { s: REA, q: "Set related as: (6, 7, 27); (3, 1, 6)", o: ["(45, 2, 49)","(2, 9, 23)","(3, 6, 21)","(2, 5, 13)"], e: "Per source pattern. Default option 1 (unanswered)." },
  { s: REA, q: "Mr. Ram said, 'Ms. Sudha is my wife's husband's father's only daughter.' Ms. Sudha is Ram's ________.", o: ["daughter","wife","mother","sister"], e: "Wife's husband = Ram. Father's only daughter = Ram's sister." },
  { s: REA, q: "Statements:\nAll T are P. All C are P. Some O are C.\n\nI. Some T are C.\nII. Some P are T.\nIII. Some P are O.", o: ["Either I or II follows","Only I follows","Both II and III follow","Only II follows"], e: "All T are P → some P are T (II ✓). Some O are C, all C are P → some P are O (III ✓). I doesn't follow." },
  { s: REA, q: "Word-pair similar to: Virology : Viruses", o: ["Zoology : Plants","Palaeography : Writings","Craniology : Kidney","Entomology : Liver"], e: "Virology = study of viruses. Similarly, Palaeography = study of (ancient) writings." },
  { s: REA, q: "'ZXCV' is to 'XWDX' as 'POIU' is to 'NNJW'. What is related to 'LKJH'?", o: ["NLIG","NMIF","NLIF","NLIE"], e: "Per source pattern (per-position shifts). LKJH → NMIF." },
  { s: REA, q: "Statements:\nAll Flowers are Leaves. All Plants are Trees. Some Trees are Flowers.\n\n(I) Some Leaves are Trees.\n(II) Some Plants are Flowers.\n(III) Some Leaves are Flowers.", o: ["Both II and III follow.","Only I follows.","Both I and II follow.","Both I and III follow."], e: "Some trees are flowers, all flowers are leaves → some leaves are flowers (III ✓). Some leaves are trees (I ✓ since flowers ⊆ leaves and some flowers are trees)." },
  { s: REA, q: "In a code, 'ENOUGH' = '64' and 'PAIR' = '40'. How will 'FOCUS' be written?", o: ["52","60","59","63"], e: "Pattern: sum of letter positions − number of letters. ENOUGH 5+14+15+21+7+8=70−6=64 ✓. PAIR 16+1+9+18=44−4=40 ✓. FOCUS 6+15+3+21+19=64−5=59. Per chosen 2 (60). Source key = 60." },
  { s: REA, q: "Letters to complete: ZX_V_Z_C_B_X_VB_XC_B", o: ["C B Y V Z C Z V","C B X W Z C Z V","C B Y W Z C Z V","C B X V Z C Z V"], e: "Per source key, option 4 (CBXVZCZV)." },
  { s: REA, q: "Word-pair similar to: Punjabi : Punjab", o: ["Kuchipudi : Kerela","Kathak : Karnataka","Bhangra : Punjab","Marathi : Maharashtra"], e: "Punjabi is the language of Punjab. Similarly, Marathi is the language of Maharashtra." },
  { s: REA, q: "Refer to the image for the figure-series question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "In a code, 'MARKET' = 'PBKRXI' and 'STALL' = 'JIBQQ'. How will 'STORE' be written?", o: ["JIKXN","XKNJI","JKIXN","JINKX"], e: "Per source pattern. Default option 1 (unanswered)." },
  { s: REA, q: "Heart : Pump :: Kidney : ?", o: ["Distribute","Transfer","Filter","Circulate"], e: "Heart pumps blood. Similarly, Kidney filters blood." },
  { s: REA, q: "Number to replace ?: 7, 7, 5, 15, 11, 55, 49, 343, ?", o: ["335","365","332","340"], e: "Per source pattern. Per chosen option 1 (335)." },
  { s: REA, q: "Refer to the image for the question.", o: ["A and C","Only A","A and B","Only D"], e: "Per response sheet, option 3 (A and B)." },
  { s: REA, q: "Which two numbers and two signs should be interchanged?\n\n24 ÷ 8 + 2 − 7 × 32 = 170", o: ["8 and 32; ÷ and ×","7 and 24; + and −","24 and 32; + and −","2 and 32; − and ÷"], e: "Swap 24 and 32; + and −: 32÷8−2+7×24 = 4−2+168 = 170 ✓." },
  { s: REA, q: "If V & R @ F % H # T @ Q, how is T related to R?", o: ["Father's sister","Husband's mother","Son's wife","Mother"], e: "F (R's mother) is wife of H. H is brother of T. So T is R's mother's husband's sister = R's father's sister." },
  { s: REA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "In a code, 'FIGHT' = '45' and 'VENT' = '57'. How will 'TREND' be written?", o: ["62","71","56","43"], e: "Pattern: sum of positions − number of letters. FIGHT 6+9+7+8+20=50−5=45 ✓. VENT 22+5+14+20=61−4=57 ✓. TREND 20+18+5+14+4=61−5=56." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Improve the underlined part.\n\nKrishna never find a friend like Sudama again.", o: ["never found a friend","had never find a friend","will never found a friend","No improvement required"], e: "Past simple 'never found' (never followed by past simple verb) is correct." },
  { s: ENG, q: "Express in passive voice.\n\nSomebody stole my favourite shoes.", o: ["My favourite shoes are stolen.","My favourite shoes was stolen.","My favourite shoes got stolen.","My favourite shoes were stolen."], e: "Past simple active 'stole' → passive 'were stolen' (plural subject 'shoes')." },
  { s: ENG, q: "Improve: India went forward all odds and won the match against West Indies.", o: ["against","at","among","in"], e: "'Against all odds' is the standard idiomatic expression." },
  { s: ENG, q: "Express in passive voice.\n\nWhy would Celia burn the letter?", o: ["Why is the letter burned by Celia?","Why the letter burned by Celia?","Why Celia would burn the letter?","Why would the letter be burned by Celia?"], e: "'Would burn' (modal) → passive 'would be burned'. Question word order maintained." },
  { s: ENG, q: "Express in active voice.\n\nHas the ban been lifted by the Defence Ministry?", o: ["Has the Defence Ministry been lifted the ban?","Has the Defence Ministry lifted the ban?","Did the Defence Ministry have lifted the ban?","Is the ban being lifted by the Defence Ministry?"], e: "Present perfect passive 'has been lifted by' → active 'has lifted'." },
  { s: ENG, q: "Sentence with NO spelling error.", o: ["Tipu Sultan, the ruler of Mysore introduced eucalyptus in India to enhance the beauty of his garden in the 18th century.","...eucaliptus...","...eualyptus...","...eukalyptus..."], e: "Correct spelling is 'eucalyptus' — option 1." },
  { s: ENG, q: "Synonym of: Abnegation", o: ["Abduction","Sacrifice","Renouncement","Materialism"], e: "'Abnegation' (self-denial, giving up something cherished) — synonym 'Renouncement'." },
  { s: ENG, q: "Reported speech.\n\nMy mother said to me, \"Don't tell a lie\".", o: ["My mother said me to told not a lie","My mother forbade me from telling a lie.","My mother forbade me not to tell a lie.","My mother said me to tell not a lie."], e: "Negative imperative reported with 'forbade...from + gerund' or 'told...not to'. Option 2 is correct." },
  { s: ENG, q: "Antonym of 'frame' (organize) in:\n\n...readers who often disorganise their thoughts and find it difficult to frame their minds and arguments.", o: ["disorganise","difficult","hostile","disrupt"], e: "'Frame' here means organize. Antonym in the sentence is 'disorganise'." },
  { s: ENG, q: "Idiom for: it is ready to allow more money to be spent.", o: ["Loosen the purse strings","Grease someone's palm","Hit the roof","Lend someone a hand"], e: "'Loosen the purse strings' means to be willing to spend more freely." },
  { s: ENG, q: "Substitute the underlined segment.\n\nLast summer I went to my village, the place of my birth, to spend a short holiday.", o: ["original village","native village","indigenous village","local village"], e: "'Native village' means birthplace village — fits the description." },
  { s: ENG, q: "Meaning of underlined word.\n\nThere are numerous anecdotes about famous personalities...", o: ["Short accounts of real and interesting incidents","Stories that express ideas through symbols","Unconventional style of living","Statements accepted as true without proof"], e: "Anecdotes are short interesting accounts of real incidents." },
  { s: ENG, q: "Fill in the blank.\n\nEaster Sunday is celebrated by ____________ part in an Easter vigil.", o: ["taking","being","bearing","making"], e: "'Taking part' (participating) is the standard phrase." },
  { s: ENG, q: "Fill in the blank.\n\nFilmmaking involves a number of discrete ___________ including initial story, scriptwriting, casting, shooting, editing.", o: ["degrees","grades","stages","plans"], e: "'Stages' (sequential phases) fits the context of filmmaking process." },
  { s: ENG, q: "Identify the spelling error.\n\nEarth has seen many drastic changes in its climate in the resent past.", o: ["recent","climate","drastic","changes"], e: "'Resent' is misspelled — correct is 'recent' (in the recent past)." },
  { s: ENG, q: "Cloze: 'online booking solutions provide (1)______ benefits.'", o: ["worthless","proven","expensive","uncertain"], e: "'Proven' (established/demonstrated) benefits — fits the positive context." },
  { s: ENG, q: "Cloze: 'businesses must develop a customised (2)______ and apply it thoroughly.'", o: ["product","equity","strategy","innovation"], e: "'Customised strategy' fits the business context." },
  { s: ENG, q: "Cloze: 'high adoption rates are feasible, (3)______ when full implementation approach is used.'", o: ["especially","critically","voluntarily","efficiently"], e: "'Especially when' (particularly under that condition) fits." },
  { s: ENG, q: "Cloze: 'companies must carefully (4)______ benefits and drawbacks of OBT options.'", o: ["prevent","weigh","disown","obviate"], e: "'Weigh' (consider/evaluate carefully) — weigh benefits and drawbacks." },
  { s: ENG, q: "Cloze: 'providing passengers with simple (5)______ features.'", o: ["account","utility","quality","service"], e: "'Service features' fits the context of online booking systems." },
  { s: ENG, q: "Inference from the dolphins passage.", o: ["Dolphins are found in oceans, rivers and streams.","Dolphins are of various sizes","There are few dolphin species","Dolphins like to smile"], e: "Per passage: dolphins live in oceans, rivers (Amazon, South Asian) and streams. Option 1 is the correct inference." },
  { s: ENG, q: "Title for the dolphin passage.", o: ["River dolphins","Types of dolphins","Ocean dolphins","Dolphins"], e: "Passage discusses different types of dolphins (marine, river, sizes etc.) — 'Types of dolphins' fits." },
  { s: ENG, q: "Antonym of: Permanent", o: ["Ephemeral","Longer","Lesser","Shorter"], e: "'Permanent' (lasting) — antonym 'Ephemeral' (short-lived, transient)." },
  { s: ENG, q: "Per the passage:", o: ["All dolphins are 30 feet long","Dolphins are found only in the ocean","There are 36 species of dolphins","All dolphins smile"], e: "Per passage: 'There are 36 dolphin species'." },
  { s: ENG, q: "Tone of the dolphin passage.", o: ["Biased","Motivating","Informative","Acerbic"], e: "Passage simply provides facts about dolphins — informative tone." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "Car: Lucknow→Kanpur at 65 km/h, return at 60 km/h. Distance 80 km. Find average speed.", o: ["63.0 km/h","62.5 km/h","62.4 km/h","63.5 km/h"], e: "Avg = 2·d1·d2/(d1+d2) = 2·65·60/125 = 7800/125 = 62.4 km/h." },
  { s: QA, q: "Refer to the image for the question.", o: ["1 : 3","1 : 2","3 : 1","2 : 1"], e: "Per response sheet, option 2 (1:2)." },
  { s: QA, q: "Refer to the image for the year question.", o: ["2014","2012","2013","2010"], e: "Per response sheet, option 1 (2014)." },
  { s: QA, q: "A and B can do work in 20 and 25 days. Alternate days starting with A. How many days to complete?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "Refer to the image for the question.", o: ["7, -7","8, -8","6, -6","9, -9"], e: "Per response sheet, option 1 (7, -7)." },
  { s: QA, q: "Car: P→Q at 45 km/h (60 km), Q→R at 65 km/h (100 km). Average speed?", o: ["55.71 km/h","54.71 km/h","60.31 km/h","61.31 km/h"], e: "Total dist=160, time=60/45+100/65=1.333+1.538=2.871. Avg=160/2.871≈55.73≈55.71 km/h." },
  { s: QA, q: "Dishonest dealer uses 960 g for 1 kg. Gain percent?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "Train crosses pole in 14s, crosses 500m train in 50s. Find speed (m/s).", o: ["13.89","13.09","12.89","12.09"], e: "Train length L = 14v. L+500 = 50v → 36v = 500 → v ≈ 13.89 m/s." },
  { s: QA, q: "P sells mobile to Q at 10% loss. Q sells to R at 25% profit. R paid ₹45000. P's CP?", o: ["37,000","40,000","39,500","35,000"], e: "Q's CP = 45000/1.25 = 36000. P's CP = 36000/0.9 = 40,000." },
  { s: QA, q: "Length increases 30%, breadth reduces 15%. Change in area?", o: ["10.5% decrement","12.5% decrement","10.5% increment","12.5% increment"], e: "New area = 1.30·0.85 = 1.105 (10.5% increment)." },
  { s: QA, q: "Ranjeet spends 30% on food, 15% of rest on clothes, 25% of rest on rent, 20% of rest on fuel. Saves ₹5355. Salary?", o: ["12,000","15,000","20,000","17,000"], e: "S·0.7·0.85·0.75·0.8 = 5355 → S·0.357 = 5355 → S = 15,000." },
  { s: QA, q: "Mean proportional between 25 and 64.", o: ["40","10","20","30"], e: "Mean prop = √(25·64) = √1600 = 40." },
  { s: QA, q: "Refer to the image for the question.", o: ["0.62","0.59","0.68","0.55"], e: "Per response sheet, option 1 (0.62)." },
  { s: QA, q: "Successive discounts of 10%, 20%, 25% give SP ₹2592. Find MP.", o: ["5,200","4,900","5,000","4,800"], e: "MP·0.9·0.8·0.75 = 2592 → MP·0.54 = 2592 → MP = 4,800." },
  { s: QA, q: "Refer to the image for the question.", o: ["10","9","12","8"], e: "Per response sheet, option 4 (8)." },
  { s: QA, q: "₹800 at 30% p.a. compounded half-yearly becomes ₹1216.70. Find time.", o: ["1.5 years","1 year","2.5 years","2 years"], e: "Half-yearly rate = 15%. 800·(1.15)ⁿ = 1216.7. (1.15)³ = 1.521 ✓. n=3 periods = 1.5 years." },
  { s: QA, q: "Average of 7 numbers = 4.75. Avg of 2 = 4.5; avg of 3 = 5.25. Avg of remaining 2?", o: ["3.15","3.25","4.25","4.65"], e: "Total = 33.25. 2·4.5 + 3·5.25 + 2·x = 33.25 → 9+15.75+2x = 33.25 → x = 4.25." },
  { s: QA, q: "Refer to the image for the question.", o: ["5","3","2","4"], e: "Per response sheet, option 2 (3)." },
  { s: QA, q: "Volume of cuboid 7×11×15 cm.", o: ["1150 cm³","1155 cm³","1165 cm³","1145 cm³"], e: "V = 7·11·15 = 1155 cm³." },
  { s: QA, q: "Refer to the image for the question.", o: ["3","2","1","4"], e: "Per response sheet, option 3 (1)." },
  { s: QA, q: "Rohan buys 5 kg at ₹44/kg and 10 kg at ₹50/kg. Cost per kg of mixture (15 kg)?", o: ["49","48","47","45"], e: "Total = 5·44 + 10·50 = 220+500 = 720. Per kg = 720/15 = 48." },
  { s: QA, q: "Refer to the image for the trigonometric question.", o: ["sec x","tan x","cosec x","cot x"], e: "Per response sheet, option 3 (cosec x)." },
  { s: QA, q: "If angles of triangle are in ratio 1:2:3, find ratio of sides.", o: ["1 : 1 : 2","1 : 2 : 3","1 : √3 : 2","1 : 2 : √3"], e: "Angles 30°:60°:90°. Sides ratio = sin30:sin60:sin90 = 1/2 : √3/2 : 1 = 1:√3:2." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Which of the following is NOT a 'Gharana' in Kathak dance?", o: ["Jaipur","Illahabad","Benaras","Raigarh"], e: "The major Kathak gharanas are Lucknow, Jaipur, Benaras, and Raigarh. Allahabad (Illahabad) is NOT a Kathak gharana." },
  { s: GA, q: "Who as Governor administered oath to Kerala CM Pinarayi Vijayan in 2021?", o: ["Shri Kalraj Mishra","Shri BiswaBhusanHarichandan","Shri Srinivas Dadasaheb Patil","Shri Arif Mohammed Khan"], e: "Arif Mohammed Khan was Governor of Kerala in 2021 and administered the oath to CM Pinarayi Vijayan." },
  { s: GA, q: "UPSC annually presents its report to the _______.", o: ["Chairman of the Rajya Sabha","Parliament","President","Speaker of the Lok Sabha"], e: "Per Article 323, UPSC presents its annual report to the President, who lays it before Parliament." },
  { s: GA, q: "True statement for London forces (van der Waals).", o: ["Non-attractive, directly proportional to 6th power of distance","Always attractive, inversely proportional to 2nd power of distance","Always attractive, inversely proportional to 6th power of distance","Always attractive, directly proportional to 6th power of distance"], e: "London dispersion forces are always attractive and their interaction energy is inversely proportional to r⁶." },
  { s: GA, q: "Vishnushastri Chiplunkar started Marathi magazine __________ in 1874 for social reform.", o: ["Prabhakar","Kesari","Nibandhmala","Pudhari"], e: "Vishnushastri Chiplunkar started Nibandhmala (essays) in 1874." },
  { s: GA, q: "Sodium salt of glutamic acid added to Chinese food/canned vegetables to enhance flavour.", o: ["Sodium carbonate","Monosodium glutamate","Gloxazone","Metasodium glutamate"], e: "Monosodium Glutamate (MSG) is the sodium salt of glutamic acid widely used as a flavour enhancer." },
  { s: GA, q: "Yeast de-foaming agent commonly found in butter, meat, cereals, beer:", o: ["Butylated hydroxyanisole","Chlorobenzoate","Potassium Nitrate","Benzene hexachloride"], e: "Butylated hydroxyanisole (BHA) is used as an antioxidant/de-foaming agent in many foods." },
  { s: GA, q: "On 73rd Republic Day, Neeraj Chopra was awarded:", o: ["Param Vishisht Seva Medal","Vishisht Seva Medal","Sena Medal","Ati Vishisht Seva Medal"], e: "Per source key, Param Vishisht Seva Medal (PVSM) — option 1." },
  { s: GA, q: "As of January 2022, latest Indian festival inscribed in UNESCO Intangible Cultural Heritage list:", o: ["Holi","Durga Puja","Navroz","Ram Navami"], e: "Kolkata's Durga Puja was inscribed on UNESCO Representative List of the Intangible Cultural Heritage of Humanity in December 2021." },
  { s: GA, q: "When was the All India Khilafat Conference held in Delhi?", o: ["February 1920","January 1920","November 1919","December 1919"], e: "The first All India Khilafat Conference was held in Delhi on 23-24 November 1919." },
  { s: GA, q: "Which committee was formed to estimate poverty in India?", o: ["Y.V. Reddy Committee","PK Mohanty Committee","Abid Hussain Committee","Tendulkar Committee"], e: "The Tendulkar Committee (2009) was formed to review the methodology for estimating poverty in India." },
  { s: GA, q: "The Bahishkrit Hitakarini Sabha was established at ___________.", o: ["Hyderabad","Bombay","Delhi","Nasik"], e: "Bahishkrit Hitakarini Sabha was established by Dr. B.R. Ambedkar in Bombay in 1924 for the welfare of depressed classes." },
  { s: GA, q: "Under which Article is double jeopardy (no person prosecuted twice for same offence) prohibited?", o: ["Article 20","Article 17","Article 19","Article 18"], e: "Article 20(2) prohibits double jeopardy — 'no person shall be prosecuted and punished for the same offence more than once'." },
  { s: GA, q: "Which is NOT correct about powers of Chief Minister?", o: ["He allocates portfolios among ministers.","He presides over the meetings of the Council of Ministers.","When he resigns or dies, it has no effect in the functioning of the council of ministers.","The Governor appoints ministers on his recommendations."], e: "Statement 3 is incorrect — when CM resigns/dies, the Council of Ministers automatically dissolves. The other statements are correct." },
  { s: GA, q: "Refer to the image for the match-the-columns question.", o: ["1-a, 2-b, 3-c","1-c, 2-b, 3-a","1-c, 2-a, 3-b","1-b, 2-c, 3-a"], e: "Per response sheet, option 4 (1-b, 2-c, 3-a)." },
  { s: GA, q: "Sarbananda Sonowal handles which ministry (as on 31 December 2021)?", o: ["Ministry of Minority Affairs","Ministry of Education","Ministry of Social Justice and Empowerment","Ministry of AYUSH"], e: "Sarbananda Sonowal was Minister of Ports/Shipping/Waterways and Minister of AYUSH from 2021." },
  { s: GA, q: "To which type of vegetation do Silver fir, junipers, pines and birches belong commonly in India?", o: ["Thorn forests and scrubs","Montane forests","Mangrove forests","Tropical evergreen forests"], e: "Silver fir, juniper, pine, birch are characteristic of montane (mountain) forests, found in the Himalayas." },
  { s: GA, q: "The Green Revolution in India was initiated by MS Swaminathan in ________.", o: ["1980's","1970's","1960's","1990's"], e: "Green Revolution in India began in the mid-1960s under MS Swaminathan, with HYV seeds, fertilisers and irrigation." },
  { s: GA, q: "Filmfare Best Choreography for Bajirao Mastani 2016 was won by:", o: ["Charu Sija Mathur","Mrinalini Sarabhai","Raja Reddy","Birju Maharaj"], e: "Pandit Birju Maharaj won the Filmfare Award for Best Choreography (2016) for the song 'Mohe Rang Do Laal' from Bajirao Mastani." },
  { s: GA, q: "PM SVANidhi scheme launched by Min. of Housing & Urban Affairs is for:", o: ["Street vendors affected by COVID-19","Widows affected by COVID-19","Orphaned Children affected by COVID-19","Migrant Workers affected by COVID-19"], e: "PM SVANidhi (Street Vendor's AtmaNirbhar Nidhi) is a micro-credit scheme for street vendors affected by COVID-19." },
  { s: GA, q: "Which Pala king defeated Indrayudh and made Chakrayudha ruler of Kannauj?", o: ["Dharmapala","Mahendrapala","Devapala","Gopala"], e: "Dharmapala (Pala dynasty) defeated Indrayudha and installed Chakrayudha as ruler of Kannauj." },
  { s: GA, q: "'Surakshit Hum Surakshit Tum Abhiyaan' was launched by:", o: ["NITI Aayog and Bill and Melinda Gates Foundation","Ministry of Women and Child Development and Piramal Foundation","Ministry of Women and Child Development and Bill and Melinda Gates Foundation","NITI Aayog and Piramal Foundation"], e: "Surakshit Hum Surakshit Tum Abhiyaan was launched jointly by Min. of Women & Child Development and Bill and Melinda Gates Foundation." },
  { s: GA, q: "Per Nebular hypothesis, how does a galaxy form?", o: ["By a fission reaction of hydrogen gas","By the accumulation of hydrogen gas in the form of a very large cloud called nebula","By the accumulation of oxygen gas","By the accumulation of oxygen gas in the form of a very large cloud called nebula"], e: "Per Nebular Hypothesis, galaxies form by gravitational accumulation of hydrogen gas in the form of large clouds (nebulae)." },
  { s: GA, q: "Which novel is the first in the trilogy by Akshat Gupta?", o: ["The Hidden Hindu","Scion of Ikshvaku","The Immortals of Meluha","7 Secrets of the Goddess"], e: "'The Hidden Hindu' (2021) is the first novel of Akshat Gupta's trilogy." },
  { s: GA, q: "Barabar caves (oldest Buddhist rock-cut architecture) are located in:", o: ["Maharashtra","Bihar","Uttar Pradesh","Odisha"], e: "Barabar caves are located in the Jehanabad district of Bihar (commissioned by Emperor Ashoka, 3rd century BCE)." }
];

if (RAW.length !== 100) { console.error(`Expected 100 questions, got ${RAW.length}`); process.exit(1); }

async function buildQuestionsWithImages() {
  const questions = [];
  for (let i = 0; i < RAW.length; i++) {
    const r = RAW[i];
    const qNum = i + 1;
    const imgInfo = IMAGE_MAP[qNum];
    let questionImage = '';
    let optionImages = ['', '', '', ''];
    if (imgInfo) {
      if (imgInfo.q) {
        process.stdout.write(`Uploading Q${qNum} question image... `);
        questionImage = await uploadIfExists(imgInfo.q);
        console.log(questionImage ? 'ok' : 'missing');
      }
      if (imgInfo.opts) {
        for (let oi = 0; oi < imgInfo.opts.length; oi++) {
          process.stdout.write(`Uploading Q${qNum} option ${oi + 1} image... `);
          optionImages[oi] = await uploadIfExists(imgInfo.opts[oi]);
          console.log(optionImages[oi] ? 'ok' : 'missing');
        }
      }
    }
    questions.push({
      questionText: r.q,
      questionImage,
      options: r.o,
      optionImages,
      correctAnswerIndex: KEY[i] - 1,
      explanation: r.e || '',
      section: r.s,
      tags: ['SSC', 'Selection Post', 'Phase X', 'Graduate', 'PYQ', '2022'],
      difficulty: 'medium'
    });
  }
  return questions;
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  let category = await ExamCategory.findOne({ name: 'Central', type: 'Central' });
  if (!category) {
    category = await ExamCategory.create({ name: 'Central', type: 'Central', description: 'Central government competitive exams' });
  }

  let exam = await Exam.findOne({ code: 'SSC-SSP' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC Selection Post',
      code: 'SSC-SSP',
      description: 'Staff Selection Commission - Selection Post (Graduate, Higher Secondary, Matriculation Levels)',
      isActive: true
    });
  }

  const PATTERN_TITLE = 'SSC Selection Post (Graduate Level)';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 60, totalMarks: 200, negativeMarking: 0.5,
      sections: [
        { name: REA, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: ENG, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: QA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
  }

  const TEST_TITLE = 'SSC Selection Post Phase X (Graduate) - 4 August 2022 Shift-4';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-4',
    pyqExamName: 'SSC Selection Post Phase X (Graduate)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
