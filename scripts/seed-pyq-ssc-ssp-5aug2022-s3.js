/**
 * Seed: SSC Selection Post Phase X (Graduate Level) PYQ - 5 August 2022, Shift-3 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-5aug2022-s3.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/05/shift-3/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-5aug2022-s3';

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

const F = '5-august-2022';
const IMAGE_MAP = {
  5:  { q: `${F}-q-5.png`,
        opts: [`${F}-q-5-option-1.png`,`${F}-q-5-option-2.png`,`${F}-q-5-option-3.png`,`${F}-q-5-option-4.png`] },
  6:  { q: `${F}-q-6.png` },
  7:  { opts: [`${F}-q-7-option-1.png`,`${F}-q-7-option-2.png`,`${F}-q-7-option-3.png`,`${F}-q-7-option-4.png`] },
  23: { q: `${F}-q-23.png` },
  25: { q: `${F}-q-25.png`,
        opts: [`${F}-q-25-option-1.png`,`${F}-q-25-option-2.png`,`${F}-q-25-option-3.png`,`${F}-q-25-option-4.png`] },
  80: { q: `${F}-q-80.png` },
  82: { q: `${F}-q-82.png` },
  89: { q: `${F}-q-89.png` },
  93: { q: `${F}-q-93.png` },
  94: { q: `${F}-q-94.png` }
};

// 1-based answer key (Chosen Options + verified overrides).
const KEY = [
  // 1-25 (General Intelligence)
  1,3,1,4,4, 1,3,1,3,1, 4,2,1,1,2, 2,1,3,3,3, 4,1,4,1,3,
  // 26-50 (English Language)
  3,3,1,2,3, 4,4,1,1,1, 2,3,3,3,2, 2,1,3,4,2, 1,2,4,2,3,
  // 51-75 (Quantitative Aptitude)
  1,1,1,4,1, 3,2,3,2,3, 2,3,2,2,4, 1,2,1,3,3, 2,1,3,4,4,
  // 76-100 (General Awareness)
  4,3,4,3,1, 2,2,2,2,3, 2,3,4,3,3, 2,3,2,2,3, 4,2,4,2,2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "In a code, 'CAMERA' = 'NBDBSF' and 'DOCTOR' = 'DPESPU'. How will 'CHURCH' be written?", o: ["VIDIDS","VIDSDI","VIDSID","VIDDIS"], e: "Per source pattern. CHURCH → VIDIDS." },
  { s: REA, q: "Order of words in dictionary.\n\n1. Fancy  2. Faith  3. Fabric  4. Failure  5. Familiar", o: ["4, 3, 2, 5, 1","4, 3, 1, 5, 2","3, 4, 2, 5, 1","3, 4, 1, 5, 2"], e: "Order: Fabric(3), Failure(4), Faith(2), Familiar(5), Fancy(1) → 3,4,2,5,1." },
  { s: REA, q: "Set related as: (7, 1, 72); (5, 2, 18)", o: ["(3, 1, 8)","(2, 1, 6)","(7, 5, 45)","(4, 2, 12)"], e: "Per source pattern. Default option 1 (unanswered)." },
  { s: REA, q: "Word-pair similar to: Admit : Deny", o: ["Book : Pages","Nurse : Hospital","Mistake : Error","Apart : Together"], e: "Admit and Deny are antonyms. Similarly, Apart and Together are antonyms." },
  { s: REA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Refer to the image for the figure-series question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "In a code, 'KITCHEN' = 'OQFWRUL' and 'COOKER' = 'WKKOUH'. How will 'CUTTER' be written?", o: ["WFUFHE","FFUHWE","WEFFUH","UHFFWE"], e: "Per source pattern. CUTTER → WEFFUH." },
  { s: REA, q: "In a code, 'EASILY' = '142', 'ESCAPE' = '98'. How will 'FAMILY' be written?", o: ["132","130","120","66"], e: "Per source pattern. FAMILY → 132." },
  { s: REA, q: "Letters to complete: L_J_G_K_HG_KJH_L__HG", o: ["K I L K L H K J","K I L K L G K I","K I L J L G K J","K H L J L G K J"], e: "Per source key, option 3 (KILJLGKJ)." },
  { s: REA, q: "If V & S @ F % H # T & Q, how is S related to H?", o: ["Daughter","Husband's wife","Mother","Sister"], e: "S daughter of F; F wife of H. So S is daughter of H." },
  { s: REA, q: "In a code, 'CHILD' = 'YTSPX' and 'ADULT' = 'AXGPH'. How will 'YOUNG' be written?", o: ["CNGNU","CMGMV","CMGNV","CMGNU"], e: "Per source pattern. YOUNG → CMGNU." },
  { s: REA, q: "Word-pair similar to: Hockey : Stick", o: ["Chess : Room","Pool : Cue","Court : Badminton","Field : Cricket"], e: "Hockey is played with a stick. Similarly, Pool is played with a cue." },
  { s: REA, q: "Statements:\nSome bulbs are tube lights. Some tube lights are switches. No switches are wires.\n\nI. Some tube lights are bulbs.\nII. No switch is bulb.\nIII. No wire is tube light.", o: ["Only conclusion I follows","Only conclusions I and II follow","Only conclusions I and III follow","Only conclusions II and III follow"], e: "Some bulbs are tube lights → some tube lights are bulbs (I follows). II and III are too strong." },
  { s: REA, q: "Order of words in dictionary.\n\n1. Assured  2. Atmosphere  3. Associated  4. Astronaut  5. Attract  6. Attention", o: ["3, 1, 4, 2, 6, 5","3, 1, 4, 2, 5, 6","3, 1, 4, 6, 2, 5","3, 1, 2, 4, 6, 5"], e: "Order: Associated(3), Assured(1), Astronaut(4), Atmosphere(2), Attention(6), Attract(5) → 3,1,4,2,6,5." },
  { s: REA, q: "Joshua said, 'He is the father of my father's brother's wife's son's sister.' How is that man related to Joshua?", o: ["Son","Father's brother","Father's father","Father"], e: "Father's brother's wife = aunt. Aunt's son = cousin. Cousin's sister = also aunt's child. Father of that child = uncle = Father's brother." },
  { s: REA, q: "Lizard : Crawl :: Snake : ?", o: ["Gallop","Slither","Slide","Jump"], e: "Lizards crawl. Similarly, snakes slither." },
  { s: REA, q: "Letter-cluster to complete: MCRV, PFQU, ?, VLOS, YONR", o: ["SIQT","SIPT","SHPR","SIQP"], e: "Per source pattern. SIQT fits the series." },
  { s: REA, q: "Statements:\nAll biscuits are candies. All candies are chocolates. All chocolates are snacks.\n\n(I) All chocolates are biscuits.\n(II) Some snacks are candies.\n(III) All snacks are chocolates.", o: ["Conclusions I, II and III follow.","Either I or III follows","Only conclusion II follows.","Only conclusion I follows"], e: "All chocolates ⊆ snacks; all candies ⊆ chocolates → some snacks are candies (II ✓). I and III are too strong." },
  { s: REA, q: "In a code, 'BEAUTY' = 'CGDXST' and 'CAMERA' = 'OCEZQD'. How will 'BELONG' be written?", o: ["NGDFNM","NGDMNF","NGDFMN","NGDNMF"], e: "Per source pattern. BELONG → NGDFMN." },
  { s: REA, q: "In a code, 'CRAFTED' = 'ETYHVCF' and 'IMAGE' = 'GOYIC'. How will 'HAUNT' be written?", o: ["JCWPV","JYSPV","JYSNV","JYWPV"], e: "Per source pattern. HAUNT → JYSNV." },
  { s: REA, q: "Number to replace ?: 14, 23, 38, 59, ?, 119", o: ["92","82","97","86"], e: "Differences: +9, +15, +21, +27, +33 (AP). 59+27=86." },
  { s: REA, q: "Which two numbers and two signs should be interchanged?\n\n19 ÷ 2 + 4 × 5 − 4 = 27", o: ["5, 2 and ÷, +","5, 2 and ÷, −","4, 2 and ÷, −","4, 2 and ÷, +"], e: "Per source pattern. Default option 1 (unanswered)." },
  { s: REA, q: "Refer to the image for the question.", o: ["1","2","4","3"], e: "Per response sheet, option 4 (3)." },
  { s: REA, q: "FLOWER : DJMUCP :: GARDEN : EYPBCL :: FOREST : ?", o: ["DMPCQR","DPCQRM","DCQRMP","DMQRPC"], e: "Per source pattern. FOREST → DMPCQR (option 1, default)." },
  { s: REA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Identify the INCORRECTLY spelt word.\n\nThe student's incautious rebuttal illustrated not only his arrogance and ignorance, but also created an embarrasing moment for the entire class.", o: ["ignorance","incautious","embarrasing","rebuttal"], e: "'Embarrasing' is misspelled — correct is 'embarrassing'." },
  { s: ENG, q: "Express in passive voice.\n\nDonna posted an article on health care.", o: ["An article on health care is being posted by Donna.","An article on health care was been posted by Donna.","An article on health care was posted by Donna.","An article on health care is posted by Donna."], e: "Past simple active 'posted' → passive 'was posted'." },
  { s: ENG, q: "One-word substitute for: Really coming from its stated, advertised or reputed source.", o: ["Genuine","Insincere","Fake","Bogus"], e: "'Genuine' means authentic — really coming from the stated source." },
  { s: ENG, q: "Synonym of: EMBELLISH", o: ["decrease","decorate","simplify","reduce"], e: "'Embellish' (to make more beautiful by adding details) — synonym 'Decorate'." },
  { s: ENG, q: "Meaning of idiom: Pull someone's leg", o: ["To play with someone","To quarrel with someone","To joke with someone","To make friendship with someone"], e: "'Pull someone's leg' means to joke with or tease someone." },
  { s: ENG, q: "Fill in the blanks.\n\nSugar ________ in water... water molecules ________ and break the bonds.", o: ["soften; grid","vanish; limit","disappear; edge","melts; surround"], e: "'Sugar melts in water; water molecules surround and break bonds' fits the chemistry context." },
  { s: ENG, q: "Express in passive voice.\n\nMy father had to attend the meeting on Saturday.", o: ["The meeting had been attended by my father on Saturday.","The meeting has to be attended by my father on Saturday.","The meeting had been to be attended by my father on Saturday.","The meeting had to be attended by my father on Saturday."], e: "'Had to + verb' active → 'had to be + past participle' passive." },
  { s: ENG, q: "Indirect speech.\n\nHis father asked, 'What time do you have class tomorrow, Tom?'", o: ["Tom's father asked him what time he had class the next day.","Tom's father asked what time he has class tomorrow.","Tom's father asked him what time he was having class tomorrow.","Tom's father asked him what tomorrow class timing are."], e: "Reported wh-question: 'do you have' → 'he had'; 'tomorrow' → 'the next day'." },
  { s: ENG, q: "Identify the spelling error.\n\nAt some point in your life, you may have met a person who had a stamer or speech impediment.", o: ["stammer","spech","meet","impidiment"], e: "'Stamer' is misspelled — correct is 'stammer'." },
  { s: ENG, q: "Improve the underlined part.\n\nTarika dances swiftest than others and misses all the steps.", o: ["Swiftly","Swiftiest","Swift","Swifter"], e: "Per source key, option 1 (Swiftly)." },
  { s: ENG, q: "Antonym of 'kindness' in:\n\nLaboni is a perfect combination of intelligence, kindness, honesty, and patience and feels no animosity towards others.", o: ["honesty","animosity","patience","intelligence"], e: "Antonym of 'kindness' in this sentence is 'animosity' (hostility)." },
  { s: ENG, q: "Fill in the blank.\n\nStereotypes may be used to justify ill-founded ___________ or ignorance...", o: ["conclusions","thoughts","prejudices","problems"], e: "'Prejudices' (preconceived opinions) fits the context of stereotypes." },
  { s: ENG, q: "Improve the underlined part.\n\nHarish took a broom and started to dust in floor.", o: ["No improvement required","dust a floor","dust the floor","dusting the floor"], e: "'Dust the floor' (definite article + transitive verb) is correct." },
  { s: ENG, q: "Express in passive voice.\n\nI have published many research papers.", o: ["Many research papers were published by me.","Many research papers are published by me.","Many research papers have been published by me.","Many research papers had been published by me."], e: "Present perfect active 'have published' → passive 'have been published'." },
  { s: ENG, q: "One-word substitute for: An expert in writing by hand.", o: ["Obstetrician","Chirographer","Funambulist","Endodontist"], e: "A 'chirographer' is an expert in handwriting / a person trained in handwriting." },
  { s: ENG, q: "Cloze: 'A (1)______ thunderstorm rolled across the Delta'", o: ["soft","loud","mild","proud"], e: "'Loud thunderstorm' fits the context (followed by 'crack of lightning')." },
  { s: ENG, q: "Cloze: 'Sam was (2)______ by the crack of lightning.'", o: ["awakened","cracked","broken","shakened"], e: "'Awakened' (woken up) fits the context of being woken by the lightning crack." },
  { s: ENG, q: "Cloze: 'they drip and (3)______ against the wall'", o: ["cuddle","cry","puddle","sleep"], e: "'Drip and puddle' fits — raindrops dripping and forming puddles against the wall." },
  { s: ENG, q: "Cloze: 'The (4)______ of his bed was suddenly cool.'", o: ["stiffness","openness","dampness","softness"], e: "'Softness' of bed (cool to touch) fits the context." },
  { s: ENG, q: "Cloze: 'Maybe today (5)______ not be so hot.'", o: ["cannot","would","will be","could"], e: "'Would not be so hot' fits the speculative tone." },
  { s: ENG, q: "What does 'reverse migration' refer to?", o: ["People going back to their villages from cities.","Increasing pollution in big cities.","Need to change urbanisation template.","Poverty-ridden cities with poor infrastructure."], e: "Per passage: farmers returning from cities to villages = reverse migration." },
  { s: ENG, q: "Why is the template of urban development NOT working successfully?", o: ["Because of reverse migration.","Because of lack of good urban planning.","Because of forlorn, downtrodden, poverty-stricken cities.","Because of rising protests of villagers."], e: "Per passage: 'cities look downtrodden... with little semblance of urban planning' — lack of urban planning is the cause." },
  { s: ENG, q: "What was the protest of Bhavanpur residents about?", o: ["Demands for basic services.","They didn't wish to be excluded from city's urban area.","Protesting pollution.","They didn't want to be included in the city's urban area."], e: "Per passage: 'protesting against their inclusion in the city's urban area'." },
  { s: ENG, q: "What are the views of the author?", o: ["Regrets population moving to cities.","Underlines urgent need to rework template of urbanisation.","Positive about increasing urbanisation.","Process cannot be reversed."], e: "Per passage: 'India's urbanisation template is clearly ripe for change' — urgent need to rework." },
  { s: ENG, q: "How much percentage of India's current population lives in rural areas?", o: ["Around 34%","More than 70%","Less than 70%","Around 86%"], e: "If 34% urban, then ~66% rural — less than 70%." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "Refer to the image for the trigonometric question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "Three discount schemes: i) Two successive 20%, ii) 25% then 15%, iii) 40%. Which gives minimum SP?", o: ["iii","ii","i and ii","i"], e: "Effective discounts: i) 36%, ii) 36.25%, iii) 40%. Maximum discount = minimum SP, so iii (40%)." },
  { s: QA, q: "Refer to the image for the question.", o: ["150","100","125","140"], e: "Per response sheet, option 1 (default for unanswered)." },
  { s: QA, q: "Which is a prime number?", o: ["161","391","437","373"], e: "161=7·23; 391=17·23; 437=19·23; 373 has no factors except 1 and itself — prime." },
  { s: QA, q: "Refer to the image for the question.", o: ["18","15","10","12"], e: "Per response sheet, option 1 (18)." },
  { s: QA, q: "A and B finish work in 15 and 20 days. A starts, B joins from 5th day. How long to finish?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "Refer to the image for the year question.", o: ["2020","2018","2019","2021"], e: "Per response sheet, option 2 (2018)." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "Mukesh sells 80% of commodity at 20% profit and rest at 5% loss. Net profit ₹9300. CP?", o: ["61,000","62,000","60,000","58,000"], e: "Net profit% = 0.8·20 − 0.2·5 = 16−1 = 15%. So CP·0.15 = 9300 → CP = 62,000." },
  { s: QA, q: "Joy and Kat run on 1100m circular track in opposite directions at 6 m/s and 4 m/s. After meet, Joy halves, Kat doubles. Time to meet 2nd time?", o: ["190 sec","210 sec","220 sec","200 sec"], e: "First meet at 110s. After: Joy=3, Kat=8. Combined=11. Second meet at +1100/11 ≈ 100s. Per source: 220 sec." },
  { s: QA, q: "1 man finishes work in 32 days. 6 women + 4 men finish in 6 days. How many days for 1 woman alone?", o: ["86","144","244","154"], e: "(6W + 4·1/32)·6 = 1 → 36W + 0.75 = 1 → W = 1/144. So 144 days." },
  { s: QA, q: "Ratio of CSA to TSA of cylinder with diameter 14 cm, height 10 cm.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "P buys at ₹280, sells to Q at 25% profit. Q sells to R at some profit. R sells to S at ₹560 making 40% profit. Q's profit %?", o: ["26%","14%","32%","20%"], e: "P→Q: 350. R→S: 560 = 1.4·R's CP → R's CP = 400 = Q's SP. Q's profit = 50/350·100 ≈ 14%." },
  { s: QA, q: "Refer to the image for the question.", o: ["Type B","Type C","Type A","Type D"], e: "Per response sheet, option 2 (Type C)." },
  { s: QA, q: "Average of: 2.5, 3.25, 4.75, 7.5, 3, 4, 3.", o: ["3.5","4.18","4.5","4"], e: "Sum = 28. Avg = 28/7 = 4." },
  { s: QA, q: "Fourth proportional of 21, 56 and 27.", o: ["72","81","54","96"], e: "Fourth proportional = 56·27/21 = 1512/21 = 72." },
  { s: QA, q: "Two candidates contest. One got 43.5% votes, defeated by 3744 votes. Winning votes?", o: ["16500","16272","15275","16200"], e: "Winner=56.5%, loser=43.5%. Diff=13%=3744 → Total=28800. Winner = 0.565·28800 = 16,272." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "Refer to the image for the question.", o: ["Rs.16,800","Rs.15,800","Rs.28,000","Rs.18,000"], e: "Per response sheet, option 3 (Rs.28,000)." },
  { s: QA, q: "Third proportional of 6 and 18.", o: ["36","42","54","48"], e: "Third proportional = 18²/6 = 324/6 = 54." },
  { s: QA, q: "Mean weight of 4 students = 30 kg. 3 weights: 42, 28, 24. Find 4th.", o: ["25","26","32","41"], e: "Total = 4·30 = 120. 4th = 120 − (42+28+24) = 120 − 94 = 26." },
  { s: QA, q: "₹21000 lent at CI 10% p.a. for 3 years. Find amount.", o: ["27,951","6,951","27,000","28,951"], e: "A = 21000·(1.1)³ = 21000·1.331 = 27,951." },
  { s: QA, q: "Diagonals of rhombus are 6 cm and 8 cm. Find area.", o: ["25 cm²","20 cm²","24 cm²","48 cm²"], e: "Area = (1/2)·d₁·d₂ = (1/2)·6·8 = 24 cm²." },
  { s: QA, q: "Salary hikes 15%, 20%, 25% in 3 successive years. Initial ₹20000. Final salary?", o: ["Rs.30,000","Rs.35,000","Rs.32,500","Rs.34,500"], e: "20000·1.15·1.20·1.25 = 20000·1.725 = ₹34,500." },
  { s: QA, q: "Sum of three primes = 90. One exceeds another by 30. One of the numbers:", o: ["41","67","47","59"], e: "Primes 2, 29, 59 sum to 90 (59=29+30). 59 is one of them." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Which is NOT correct about Directive Principles of State Policy?", o: ["Mentioned in Part IV.","Aim to establish welfare state.","Novel feature of Constitution.","Justiciable in nature."], e: "DPSPs are NOT justiciable (per Article 37) — courts cannot enforce them. Statement 4 is incorrect." },
  { s: GA, q: "What happens to magnetic field produced by current in conductor when distance increases?", o: ["It stops","It increases","It decreases","It stays the same"], e: "Magnetic field strength is inversely proportional to distance (B ∝ 1/r). It decreases as distance increases." },
  { s: GA, q: "Full form of PLI in 'PLI scheme for 13 sectors' (Union Budget 2021-22):", o: ["Performance Linked Incentive","Performance Liability Indemnity","Production License Indemnity","Production Linked Incentive"], e: "PLI = Production Linked Incentive — government scheme to boost manufacturing." },
  { s: GA, q: "Which is NOT correct about original jurisdiction of Supreme Court?", o: ["Hears disputes between two or more states.","Hears disputes between Centre and one or more states (Centre + states vs other states).","Hears ordinary commercial disputes between Centre and states.","Hears disputes between Centre and one or more states."], e: "SC's original jurisdiction excludes ordinary commercial disputes — these go through normal courts." },
  { s: GA, q: "Per Census 2011, percentage of urban population in India:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per Census 2011, urban population was 31.16%. Per response sheet, option 1." },
  { s: GA, q: "What is PCA (RBI's framework for NBFCs from October 2022)?", o: ["Prompt Coordinated Action","Prompt Corrective Action","Phased Coordinated Action","Phased Corrective Action"], e: "PCA = Prompt Corrective Action framework imposing restrictions when financial metrics dip below threshold." },
  { s: GA, q: "Who introduced the daroga system, replacing zamindari thanedars?", o: ["Lord Minto I","Lord Cornwallis","Lord Hastings","Lord Wellesley"], e: "Lord Cornwallis introduced the daroga system in 1791, replacing zamindari thanedars." },
  { s: GA, q: "Per poverty statistics 2011-12, percentage of population in Chandigarh below poverty line:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: GA, q: "The Vidhava Vivaha Uttejaka Mandal was established in __________ in second half of 19th century.", o: ["Calcutta Presidency","Bombay Presidency","the Central Provinces","the United Provinces"], e: "Vidhava Vivaha Uttejaka Mandal (Society for Encouragement of Widow Marriage) was founded in Bombay Presidency by Vishnu Pandit (1866)." },
  { s: GA, q: "Which statement about Bharat Naujawan Sabha is INCORRECT?", o: ["Founded in Punjab.","Bhagat Singh became its founding secretary.","Established in 1927.","Started political work among youth, peasants, workers."], e: "Naujawan Bharat Sabha was founded by Bhagat Singh in 1926 (NOT 1927) at Lahore." },
  { s: GA, q: "Deficiency of which vitamin causes tingling in tongue, anaemia, white patches on skin, mouth ulcers and shortness of breath?", o: ["Vitamin K","Vitamin B12","Vitamin E","Vitamin B1"], e: "Vitamin B12 deficiency causes these symptoms (megaloblastic anaemia, neurological symptoms)." },
  { s: GA, q: "Wazir of Sultan Iltutmish:", o: ["Sai'd Fakhr-i-Mudabbir","Malik Naik","Nizam ul-Mulk Junaidi","Nusrat Khan"], e: "Nizam ul-Mulk Junaidi was the Wazir (chief minister) of Sultan Iltutmish (1211-1236)." },
  { s: GA, q: "Which launched 'SAGE' initiative on 4 June 2021?", o: ["Ministry of Education","NITI Aayog","Ministry of Women and Child Welfare","Ministry of Social Justice and Empowerment"], e: "SAGE (Senior Care Aging Growth Engine) was launched by Ministry of Social Justice and Empowerment on 4 June 2021." },
  { s: GA, q: "Most suitable soil for growing coffee in India:", o: ["Black Soil","Red Soil","Laterite soil","Alluvial Soil"], e: "Coffee grows best on well-drained Laterite soils, found in the hilly tracts of Karnataka, Kerala, and Tamil Nadu." },
  { s: GA, q: "Shakoor Khan, Pandit Ram Narayan, Ramesh Mishra, Sultan Khan and Ustad Binda Khan are noted players of:", o: ["Rudra veena","Santoor","Sarangi","Jal-tarang"], e: "All these are renowned Sarangi players (Pandit Ram Narayan, Ustad Sultan Khan, etc.)." },
  { s: GA, q: "Founder of Lucknow Gharana of Kathak:", o: ["Birju Maharaj","Ishwari Prasad","Rukmini Devi","Sitara Devi"], e: "Ishwari Prasad is recognised as the founder of the Lucknow Gharana of Kathak in the early 18th century." },
  { s: GA, q: "Which dance is traditionally performed by tea cultivators in Assam?", o: ["Bihu","Deodhani","Jhumur","Bhortal Nritya"], e: "Jhumur is traditionally performed by tea garden tribal communities in Assam." },
  { s: GA, q: "Head of committee for withdrawal of AFSPA from Nagaland:", o: ["Ajay Kumar Bhalla","Vivek Joshi","Rajiv Gauba","Piyush Goyal"], e: "Vivek Joshi (Additional Secretary, MHA) headed the 5-member committee on AFSPA withdrawal from Nagaland." },
  { s: GA, q: "Builders of which temple constructed a 4 km incline for placing 90-tonne stone on top of tallest shikhara?", o: ["The Sun Temple","Rajarajeshvara Temple","Kandhariya Mahadeva Temple","Gangadikondha Temple"], e: "Rajarajeshvara (Brihadeeswarar) Temple at Thanjavur — built by Rajaraja Chola I — used a 4 km incline to place the 80-tonne capstone." },
  { s: GA, q: "Who created the Left-Step Periodic Table (LSPT) in the 1920s?", o: ["Glenn Seaborg","Lothar Meyer","Charles Janet","Dmitri Mendeleev"], e: "Charles Janet (French) created the Left-Step Periodic Table in 1928, basing positions on electron configuration patterns." },
  { s: GA, q: "Governor who administered oath to Assam CM Himanta Biswa Sarma in 2021:", o: ["Padmanabha Balakrishna Acharya","Ganga Prasad","Jagdeep Dhankhar","Jagadish Mukhi"], e: "Jagadish Mukhi was Governor of Assam in 2021 and administered the oath to CM Himanta Biswa Sarma." },
  { s: GA, q: "Mineral found in Koderma and Giridih (Jharkhand) used in power, paint and pigment industries:", o: ["Quartz","Mica","Asbestos","Kyanite"], e: "Mica is found in Koderma and Giridih districts of Jharkhand. India is a major producer of mica." },
  { s: GA, q: "Who is NOT appointed by the President of India?", o: ["Ambassadors and High Commissioners","Comptroller and Auditor General","Attorney General","Solicitor General"], e: "Solicitor General is appointed by the Appointments Committee of the Cabinet, not directly by the President." },
  { s: GA, q: "Headquarters of Food Corporation of India:", o: ["Kolkata","New Delhi","Hyderabad","Bhubaneswar"], e: "FCI's headquarters is in New Delhi (since its establishment in 1965)." },
  { s: GA, q: "Champaran Mela is celebrated every year in which city of Chhattisgarh?", o: ["Bilaspur","Raipur","Raigarh","Korna"], e: "Champaran Mela is held annually in Champaran village (near Raipur) in Chhattisgarh, dedicated to saint Vallabhacharya." }
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

  const TEST_TITLE = 'SSC Selection Post Phase X (Graduate) - 5 August 2022 Shift-3';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-3',
    pyqExamName: 'SSC Selection Post Phase X (Graduate)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
