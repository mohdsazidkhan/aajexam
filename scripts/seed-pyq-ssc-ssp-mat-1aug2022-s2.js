/**
 * Seed: SSC Selection Post Phase X (Matriculation Level) PYQ - 1 August 2022, Shift-2 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-1aug2022-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/01/shift-2/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-1aug2022-s2';

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

const F = '1-august-2022';
// Reasoning Q14 and Q16 are image-based (only image assets in source folder for this paper).
const IMAGE_MAP = {
  14: { q: `${F}-q-14.png`,
        opts: [`${F}-q-14-option-1.png`,`${F}-q-14-option-2.png`,`${F}-q-14-option-3.png`,`${F}-q-14-option-4.png`] },
  16: { q: `${F}-q-16.png`,
        opts: [`${F}-q-16-option-1.png`,`${F}-q-16-option-2.png`,`${F}-q-16-option-3.png`,`${F}-q-16-option-4.png`] }
};

// 1-based answer key (Chosen Options + GK overrides for unanswered/wrong picks).
const KEY = [
  // 1-25 (General Intelligence / Reasoning) — Q11/Q19/Q20/Q24 unanswered (overridden)
  4,1,2,2,4, 1,2,4,1,4, 3,4,4,1,4, 2,4,2,4,1, 3,4,2,2,1,
  // 26-50 (English Language) — Q5/Q7/Q8/Q11 wrong picks overridden; Q24 unanswered
  4,4,2,3,1, 4,2,3,1,4, 4,4,2,1,4, 3,3,3,3,1, 3,4,3,2,4,
  // 51-75 (Quantitative Aptitude) — Q6 wrong (math), Q14/Q21 unanswered, Q20 wrong overridden
  1,4,1,2,1, 4,3,4,4,1, 3,4,4,1,2, 4,4,1,4,3, 4,3,1,3,3,
  // 76-100 (General Awareness) — Q7/Q8/Q13/Q22 wrong, Q3/Q6/Q15/Q20/Q21/Q25 unanswered
  3,4,4,1,4, 2,3,1,1,2, 4,4,2,3,4, 2,4,1,3,2, 4,2,1,3,4
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "In a code language, 'five times six' is written as '564' and 'eleven plus eight' is written as '756'. How will 'two minus one' be written in that language?", o: ["242","353","575","464"], e: "Each digit = (letter count + 1). five(4)→5, times(5)→6, six(3)→4 ⇒ 564. two(3)→4, minus(5)→6, one(3)→4 ⇒ 464." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nHELIPAD : HILOPED :: GROUND : GRUAND :: DELIGHT : ?", o: ["DILOGHT","DOLIGHT","DELOGHT","DALUGHT"], e: "Each vowel shifts to the NEXT vowel in cycle (A→E→I→O→U→A). DELIGHT: E→I, I→O ⇒ DILOGHT." },
  { s: REA, q: "'P @ Q' means 'P is the mother of Q'.\n'P & Q' means 'P is the wife of Q'.\n'P # Q' means 'P is the husband of Q'.\n\nIf 'A # B @ C @ D & E', then how is D related to A?", o: ["Mother's mother","Daughter's daughter","Mother's father","Daughter"], e: "A husband of B; B mother of C; C mother of D → A father of C, grandfather of D. D is A's daughter's daughter." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nXSMP, WTKR, VUIT, ?, TWEX", o: ["UVHW","UVGV","UWHV","UWFX"], e: "1st: −1 (X,W,V,U,T). 2nd: +1 (S,T,U,V,W). 3rd: −2 (M,K,I,G,E). 4th: +2 (P,R,T,V,X). Missing = UVGV." },
  { s: REA, q: "Two statements are given followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nAll lotuses are roses.\nAll lotuses are hibiscuses.\n\nConclusions:\nI. All roses are hibiscuses.\nII. Some hibiscuses are lotuses.\nIII. Some roses are hibiscuses.", o: ["Only conclusions I and III follow","Only conclusions I and II follow","All of the conclusions follow","Only conclusions II and III follow"], e: "II follows by conversion of 'all lotuses are hibiscuses'. III follows: lotuses are both roses and hibiscuses → some roses are hibiscuses. I doesn't follow." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Loaves  2. Loans  3. Loaded  4. Loafer  5. Lonely  6. Loathsome", o: ["3, 4, 2, 6, 1, 5","6, 3, 4, 2, 1, 5","1, 3, 4, 2, 6, 5","2, 3, 4, 6, 1, 5"], e: "Order: Loaded(3), Loafer(4), Loans(2), Loathsome(6), Loaves(1), Lonely(5) → 3,4,2,6,1,5." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nETGW, ?, INOM, KKSH, MHWC", o: ["GRKS","GQKR","HQLR","HRLS"], e: "1st: +2 (E,G,I,K,M). 2nd: −3 (T,Q,N,K,H). 3rd: +4 (G,K,O,S,W). 4th: −5 (W,R,M,H,C). Missing = GQKR." },
  { s: REA, q: "In a certain code language, 'FINE' is written as 'HKLC' and 'TOUR' is written as 'VQSP'. How will 'MILK' be written in that language?", o: ["KGNM","KGJI","OKNM","OKJI"], e: "First two letters +2, last two −2. M+2=O, I+2=K, L−2=J, K−2=I → OKJI." },
  { s: REA, q: "In a certain code language, 'ORANGE' is written as 'RONAEG' and 'NINETY' is written as 'INENYT'. How will 'TRAVEL' be written in that language?", o: ["RTVALE","ALTVRE","VLTARE","VERATL"], e: "Pair-swap: TR→RT, AV→VA, EL→LE → RTVALE." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the following blanks, will complete the letter-series.\n\nA__US_PR_SAP_U_A_RU_", o: ["PRAUSRPS","PRUARSPS","PRUAPSPS","PRAURSPS"], e: "Per response sheet, option 4 (PRAURSPS)." },
  { s: REA, q: "Which letter cluster will replace the question mark (?) to complete the given series?\n\nSVGQ, OCWD, ?, GQCD, CXSQ", o: ["LQJM","KCMS","KJMQ","LDCP"], e: "1st: −4 (S,O,K,G,C). 2nd: +7 (V,C,J,Q,X). 3rd: +16 mod 26 (G,W,M,C,S). 4th: +13 alternating (Q,D,Q,D,Q). Missing = KJMQ." },
  { s: REA, q: "Two statements are given followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nAll A are B.\nSome A are C.\n\nConclusions:\nI. Some B are C.\nII. No C is B.\nIII. Some B are A.", o: ["Only conclusions II and III follow","Only conclusions I and II follow","All of the conclusions follow","Only conclusions I and III follow"], e: "I follows: A⊆B + some A are C ⇒ some B are C. III follows by conversion of 'all A are B'. II contradicts I." },
  { s: REA, q: "Three statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nSome fish are limes.\nAll limes are chairs.\nSome chairs are big.\n\nConclusions:\nI. Some limes are big.\nII. Some fish are chairs.\nIII. All limes are fish.", o: ["None of the conclusions follows","Only conclusion III follows","Only conclusion I follows","Only conclusion II follows"], e: "II follows: some fish are limes + all limes are chairs ⇒ some fish are chairs. I & III don't follow." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Which two numbers (not digits of the numbers), from amongst the given options, should be interchanged to make the given equation correct?\n\n12 × 9 + 27 ÷ 3 − 5 = 60", o: ["27 and 9","12 and 3","12 and 5","5 and 9"], e: "Swap 5 and 9: 12×5 + 27÷3 − 9 = 60 + 9 − 9 = 60. ✓" },
  { s: REA, q: "Refer to the image for the figure-series question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "Based on meaning/relevance of the words, News is related to Editor in the same way as Movie is related to _______.", o: ["Lyricist","Singer","Theatre","Director"], e: "An Editor leads news production; a Director leads movie production." },
  { s: REA, q: "In a certain code language, 'FAITH' is written as 'JDMWL', and 'GLASS' is written as 'KOEVW'. How will 'HEART' be written in that language?", o: ["LHFUX","LHEUX","LHEUY","LHEWX"], e: "Alternating +4/+3 shifts. H+4=L, E+3=H, A+4=E, R+3=U, T+4=X → LHEUX." },
  { s: REA, q: "Which number will replace the question mark (?) in the following series?\n\n2, 3, 6, 18, 108, ?", o: ["1620","1188","648","1944"], e: "Each term = product of previous two. 18 × 108 = 1944." },
  { s: REA, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\nFirst row: 21, 12, 19\nSecond row: 27, 10, 19\nThird row: 24, 10, ?", o: ["19","16","18","17"], e: "Per source pattern, third column appears constant at 19 across rows." },
  { s: REA, q: "In a code language, 'RAIN' is written as '18-1-9-14' and 'CLOUD' is written as '3-12-15-21-4'. How will 'WEATHER' be written in that language?", o: ["23-5-8-20-1-5-18","23-5-1-21-9-5-18","23-5-1-20-8-5-18","23-6-1-20-8-6-18"], e: "Each letter coded by its alphabet position. W=23, E=5, A=1, T=20, H=8, E=5, R=18 → 23-5-1-20-8-5-18." },
  { s: REA, q: "In a code language, 'please come here' is written as '533' and 'bring the potatoes' is written as '427'. How will 'an early start' be written in that language?", o: ["255","155","366","144"], e: "Each digit = (letter count − 1). an(1), early(4), start(4) → 144." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Insurance  2. Insomnia  3. Insufficient  4. Instalment  5. Inscription  6. Instrument", o: ["5, 2, 4, 6, 1, 3","5, 2, 4, 6, 3, 1","2, 5, 4, 6, 3, 1","5, 2, 6, 4, 3, 1"], e: "Order: Inscription(5), Insomnia(2), Instalment(4), Instrument(6), Insufficient(3), Insurance(1) → 5,2,4,6,3,1." },
  { s: REA, q: "In a certain code language, 'FAN' is written as '63', and 'DEAR' is written as '112'. How will 'BABY' be written in that language?", o: ["115","120","130","110"], e: "Code = (sum of alphabet positions) × (number of letters). FAN: 21×3=63. DEAR: 28×4=112. BABY: 30×4=120." },
  { s: REA, q: "Pointing to a person in a photograph, a man, Kabir, said, \"She is the sister of my mother's daughter's daughter.\" How is the person related to Kabir?", o: ["Sister's daughter","Daughter","Wife","Sister"], e: "Mother's daughter = Kabir's sister. Sister's daughter = Kabir's niece. Sister of niece = also Kabir's sister's daughter (niece)." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the correctly spelt word to fill in the blank.\n\nThe _________ of a place is the total number of citizens of the place having voting rights.", o: ["electrate","electroate","elektorate","electorate"], e: "'Electorate' is the correct spelling — body of people entitled to vote." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nOut of spirits", o: ["To blunder","To disclose","Cheerful or joyful","Gloomy or sad"], e: "'Out of spirits' means feeling low / gloomy / sad." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe court verdict had been challenged by the officer.", o: ["The officer challenged the court verdict.","The officer had challenged the court verdict.","The officer has challenged the court verdict.","The officer was challenging the court verdict."], e: "Past-perfect passive 'had been challenged' → active 'had challenged'." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nAn official inspection of a company's, or individual's, accounts", o: ["Survey","Documentation","Audit","Audition"], e: "An 'audit' is the official inspection/examination of accounts." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe inner soft part of a seed, fruit or nut", o: ["Kernel","Pulp","Peel","Bud"], e: "'Kernel' refers to the softer, edible inner part of a nut/seed/stone fruit." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\n\nJack said he is unfortunate to win the jackpot.", o: ["sensible","bad","untimely","lucky"], e: "Antonym of 'unfortunate' = 'lucky' / fortunate." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nHard cash", o: ["Cash in the form of gold","Notes and coins as opposed to cheques and ATM cards","Currencies that can be paid only in gold","Cash that cannot be transformed into liquid cash"], e: "'Hard cash' refers to physical money — actual notes and coins (as opposed to cheques/cards)." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Abdicate","Juvenile","Dumbell","Abbreviate"], e: "'Dumbell' is misspelled — correct spelling is 'Dumbbell' (with double-b)." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\n\nThe criminal offered his testimony before the jury.", o: ["denial","deputation","time","jokes"], e: "Antonym of 'testimony' (sworn statement affirming truth) = 'denial'." },
  { s: ENG, q: "Select the most appropriate option to replace the underlined word in the given sentence.\n\nWhat an epic journey! I love the whole concept.", o: ["narration","story","belief","notion"], e: "'Concept' = 'notion' (an abstract idea)." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nThe professor asked, \"How many of you can afford a trip to New York?\"", o: ["The professor asked how many of you can afford a trip to New York.","The professor asked how many of them can afford a trip to New York.","The professor asked how many of us could have afforded a trip to New York.","The professor asked how many of them could afford a trip to New York."], e: "'asked' (past) → 'can' becomes 'could'; 'you' becomes 'them'; no inversion." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nDistribute", o: ["Practice","Impress","Oblige","Circulate"], e: "'Distribute' = 'circulate' (spread / pass around)." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe professor was very happy to see that John was a _______ student.", o: ["sunny","diligent","careless","cunning"], e: "A 'diligent' (hardworking) student would make a professor happy." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nAn arrangement of flowers that is usually given as present.", o: ["Bouquet","Inflorescence","Decoration","Bunch"], e: "A 'bouquet' is an arranged bunch of flowers given as a gift." },
  { s: ENG, q: "Select the correctly spelt word to fill in the blank.\n\nThere can be maximum twelve light fittings on a _________.", o: ["cirkit","Sirkit","circkit","circuit"], e: "'Circuit' is the correct spelling." },
  { s: ENG, q: "Read the passage about coral reefs and answer the question.\n\nSelect the most appropriate synonym of the word 'surges' as used in the passage.", o: ["Diminishes","Contracts","Gushes","Decreases"], e: "'Surges' (sudden powerful rushes) = 'Gushes'." },
  { s: ENG, q: "Read the passage about coral reefs and answer the question.\n\nSelect the most appropriate synonym of the word 'erosion' as used in the passage.", o: ["Increase","Buildup","Attrition","Gain"], e: "'Erosion' = 'Attrition' (gradual wearing away)." },
  { s: ENG, q: "Read the passage about coral reefs and answer the question.\n\nSelect the most appropriate synonym of the word 'imperiled' as used in the passage.", o: ["Sheltered","Protected","Endangered","Preserved"], e: "'Imperiled' = 'Endangered' (put at risk)." },
  { s: ENG, q: "Read the passage about coral reefs and answer the question.\n\nSelect the most appropriate synonym of the word 'bleached' as used in the passage.", o: ["Coloured","Brunet","Discoloured","Hued"], e: "'Bleached' (whitened/lost colour) = 'Discoloured'." },
  { s: ENG, q: "Read the passage about coral reefs and answer the question.\n\nSelect the most appropriate synonym of the word 'vicinity' as used in the passage.", o: ["Neighbourhood","Remoteness","Removal","Distance"], e: "'Vicinity' = 'Neighbourhood' (the area near a place)." },
  { s: ENG, q: "Read the passage about Sir Thomas Philips and Bernard Levin, then answer.\n\nFill in the blank: Sir Thomas amassed the greatest private library the world has ever seen, spending on it some __________.", o: ["£350,000","£550,000","£250,000","£150,000"], e: "Per passage: 'spending on it some £250,000'." },
  { s: ENG, q: "Read the passage about Sir Thomas Philips and Bernard Levin, then answer.\n\nFill in the blank: Few other nations can produce such dedicated book loonies as __________.", o: ["Leonard Cohen","Sir Philip","Sir Thomas","Bernard Levin"], e: "Per passage: 'such dedicated book loonies as Bernard Levin'." },
  { s: ENG, q: "Read the passage about Sir Thomas Philips and Bernard Levin, then answer.\n\nWho can produce a book collector on quite the heroic scale of Sir Thomas Philips?", o: ["A few nations","All nations","No other nation","Very few nations"], e: "Per passage: 'No other nation can produce a book collector on quite the heroic scale...'" },
  { s: ENG, q: "Read the passage about Sir Thomas Philips and Bernard Levin, then answer.\n\nFill in the blank: Levin has been warned never to display his humungous collection of books on shelves, as their weight could bring ____________.", o: ["the ceiling of his apartment crashing about his ears","the walls of his London apartment crashing about his ears","the kitchen and reading room crashing about his ears","the adjacent balcony crashing about his ears"], e: "Per passage: 'bring the walls of his London apartment crashing about his ears'." },
  { s: ENG, q: "Read the passage about Sir Thomas Philips and Bernard Levin, then answer.\n\nFill in the blank: Sir Thomas Philips in __________ years amassed the greatest private library.", o: ["60","40","30","50"], e: "Per passage: 'who in 50 years amassed...'" },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "A man can row a boat at 10 km/h in still water. If the speed of the stream is 7 km/h, what is the time taken to row a distance of 85 km down the stream?", o: ["5 hours","4 hours","6 hours","3 hours"], e: "Downstream speed = 10 + 7 = 17 km/h. Time = 85/17 = 5 hours." },
  { s: QA, q: "A hemisphere has 14 cm diameter. Find its volume.", o: ["818.60 cm³","650.50 cm³","790.20 cm³","718.67 cm³"], e: "r = 7. V = (2/3)·(22/7)·7³ = (2·22·343)/(3·7) = 15092/21 ≈ 718.67 cm³." },
  { s: QA, q: "The present population of a city is 60,000. If the rate of increase is 10% per year, find the population of the city after 2 years.", o: ["72600","71600","72000","70600"], e: "60000 × (1.10)² = 60000 × 1.21 = 72,600." },
  { s: QA, q: "6 men earn as much as 7 women, 2 women earn as much as 3 boys, 4 boys earn as much as 5 girls. If 5 girls earn Rs.400 a week, how much does a man earn in a week?", o: ["Rs.195","Rs.175","Rs.200","Rs.180"], e: "5 girls = ₹400; 4 boys = ₹400 → 1 boy = 100; 3 boys = ₹300 = 2 women → 1 woman = 150; 7 women = ₹1050 = 6 men → 1 man = ₹175." },
  { s: QA, q: "The body weight of eight members of a club is recorded as 69 kg, 63 kg, 72 kg, 76 kg, 82 kg, 93 kg, 59 kg, and 55 kg. What is the average body weight of all the eight members?", o: ["71.13 kg","61.13 kg","75.15 kg","73.50 kg"], e: "Sum = 569 kg. Average = 569/8 ≈ 71.13 kg." },
  { s: QA, q: "On selling 2800 school bags, Anita earns a profit equal to the sale price of 420 school bags. What is the gain percentage that Anita earned?\n\nNote: round off to two decimal places", o: ["15.85%","20.5%","18.57%","17.65%"], e: "Profit = 420·SP. CP = (2800−420)·SP = 2380·SP. Gain% = 420/2380 × 100 ≈ 17.65%." },
  { s: QA, q: "If X and Y have incomes in the ratio 5 : 3 and expenditures in the ratio 3 : 1 and each one of them saves 27,000, then what is the income of X?", o: ["68,500","70,000","67,500","69,500"], e: "Let X=5k, Y=3k; expenditures 3m, m. 5k−3m=27000, 3k−m=27000 ⇒ m=3k−27000 ⇒ 5k−9k+81000=27000 ⇒ k=13500. X = 5×13500 = ₹67,500." },
  { s: QA, q: "If the market price of a bedsheet is 24% above the cost price and a discount of 15% is declared on it, then find the gain percentage.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Let CP=100. MP=124. SP=124·0.85=105.4. Gain% = 5.4%. Per response sheet, option 4." },
  { s: QA, q: "If 23% of 'x' is 46, then 'x' is _______.", o: ["100","400","300","200"], e: "0.23x = 46 → x = 200." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "Raju can complete a piece of job in 15 hours, Vinay in 20 hours and Vardhan in 30 hours. If they work together and they are paid Rs.7,200 for the job, then what amount would Vinay receive?", o: ["Rs.1,600","Rs.4,000","Rs.3,200","Rs.2,400"], e: "Pay ∝ rate. Rates: 1/15, 1/20, 1/30 (LCM 60: 4, 3, 2). Vinay's share = 3/9 × 7200 = ₹2,400." },
  { s: QA, q: "P and Q can do a piece of work in 36 days, Q and R can do it in 60 days, and P and R can do it in 45 days. When P, Q and R work together, how much work is finished by them in 5 days?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Sum: 2(P+Q+R) = 1/36+1/60+1/45 = 1/15 ⇒ P+Q+R = 1/30. In 5 days: 5/30 = 1/6 of work. Per response sheet, option 4." },
  { s: QA, q: "The perimeter of the rectangle is 280 m and the difference between its two sides is 40 m. Find the side of a square whose area is equal to the area of this rectangle.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "l+b=140, l−b=40 ⇒ l=90, b=50. Area = 4500 m². Square side = √4500 = 30√5 m. Per response sheet, option 1." },
  { s: QA, q: "Ram buys 13 balls for Rs.390 and sells them at the rate of Rs.33 per ball. Find his gain percentage.", o: ["11.5%","10%","10.5%","11%"], e: "CP/ball = 390/13 = ₹30. Gain/ball = 33−30 = ₹3. Gain% = 3/30 × 100 = 10%." },
  { s: QA, q: "A person covers a distance of 40 km by bus in 70 mins. After deboarding the bus, he took a rest for 40 mins and covered another 20 km by taxi in 40 mins. Find his average speed for the whole journey.", o: ["26 km/h","34 km/h","20 km/h","24 km/h"], e: "Total distance = 60 km. Total time = 70+40+40 = 150 min = 2.5 h. Avg = 60/2.5 = 24 km/h." },
  { s: QA, q: "In an election, there were three candidates — A, B and C. The winner, A, got five times the votes received by C. B got 240 votes which was 1.5 times the votes of C. How many total votes were polled in the election if there were no bogus votes?", o: ["1500","1400","1600","1200"], e: "C = 240/1.5 = 160. A = 5·160 = 800. Total = 800+240+160 = 1200." },
  { s: QA, q: "A bus covers the first 80 km at a speed of 40 km/h. It covers the next 100 km at a speed of 50 km/h. What is its average speed?", o: ["45 km/h","42 km/h","44 km/h","46 km/h"], e: "Time = 80/40 + 100/50 = 2 + 2 = 4 h. Total dist = 180 km. Avg = 180/4 = 45 km/h." },
  { s: QA, q: "At a college NSS camp, there is food provisions for 320 students for 38 days. If 60 more students join the NSS camp on the first day itself, then for how many days will the provisions last?", o: ["34","35","33","32"], e: "Total provision = 320 × 38 = 12160 student-days. With 380 students: 12160/380 = 32 days." },
  { s: QA, q: "Which least number should be subtracted from 5825 to make it a perfect square?", o: ["48","42","49","46"], e: "76² = 5776; 77² = 5929. 5825 − 5776 = 49. Subtract 49 to get 5776 (76²)." },
  { s: QA, q: "A man invested a total of Rs.16,50,000 in the names of his two daughters aged 15 years and 17 years, respectively, such that they get equal amounts when they are 20 years old. If the rate of interest is 25% per annum, compounded annually, then how much money (in Rs., to the nearest tens) should be deposited in the name of his younger daughter?", o: ["8,54,650","7,23,600","9,30,640","6,43,900"], e: "Younger gets 5 yrs growth, elder 3 yrs. y(1.25)⁵ = e(1.25)³ ⇒ y = e/1.5625 ⇒ y ≈ 0.64e. With y+e = 1650000 ⇒ e ≈ 10,06,098, y ≈ 6,43,902 ≈ ₹6,43,900." },
  { s: QA, q: "If the selling price of 10 chairs is the same as the cost price of 8 chairs, find the loss percentage.", o: ["22%","18%","20%","15%"], e: "Loss on 10 chairs = CP of 2 chairs. Loss% = 2/10 × 100 = 20%." },
  { s: QA, q: "Find the simple interest on Rs.3,500 at 10% p.a. for 7 years.", o: ["Rs.2,450","Rs.2,500","Rs.3,000","Rs.2,050"], e: "SI = PRT/100 = 3500 × 10 × 7 / 100 = ₹2,450." },
  { s: QA, q: "If the MP is Rs.650/- and discount is 10%, then the SP is ________.", o: ["Rs.685","Rs.689","Rs.585","Rs.589"], e: "SP = 650 × (1 − 0.10) = 650 × 0.9 = ₹585." },
  { s: QA, q: "What is the average of the following numbers?\n\n20.54, 11.51, 13.71, 18.31, 17.53", o: ["18.35","32.10","16.32","21.62"], e: "Sum = 20.54+11.51+13.71+18.31+17.53 = 81.60. Average = 81.60/5 = 16.32." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "'Bibi ka Maqbara' at Aurangabad is situated in which of the following states of India?", o: ["Madhya Pradesh","Rajasthan","Maharashtra","Punjab"], e: "Bibi ka Maqbara, built by Aurangzeb's son Azam Shah, is in Aurangabad, Maharashtra." },
  { s: GA, q: "The 'Blood Sugar' disease is also known as:", o: ["Low blood pressure","High blood pressure","Cancer","Diabetes"], e: "Blood sugar disease = Diabetes (Diabetes Mellitus)." },
  { s: GA, q: "Which of the following classical dance forms was patronised by the Nawab of Awadh, Wajid Ali Shah?", o: ["Odissi","Manipuri","Kuchipudi","Kathak"], e: "Wajid Ali Shah (last Nawab of Awadh) was a great patron of Kathak; he himself was a trained Kathak dancer." },
  { s: GA, q: "Who among the following court poets of Samudragupta, wrote poetic appreciations for him during the Gupta period?", o: ["Harishena","Shudraka","Kalidasa","Visakhadutta"], e: "Harishena composed the famous Allahabad Pillar (Prayag Prashasti) inscription praising Samudragupta." },
  { s: GA, q: "Who contributed in the development of the periodic table?", o: ["Gregor Mendel","J J Thomson","Isaac Newton","Dmitri Mendeleev"], e: "Dmitri Mendeleev is credited with developing the modern periodic table (1869)." },
  { s: GA, q: "Ali Akbar Khan was associated with which instrument?", o: ["Flute","Sarod","Sitar","Drums"], e: "Ustad Ali Akbar Khan (1922-2009) was a renowned Indian classical musician famous for the Sarod." },
  { s: GA, q: "Which of the following statements is correct about nutrients?", o: ["Nutrients are required only in small amount.","Fat is the only nutrient rich food.","Nutrients are molecules that all organisms need for growth, development and reproduction.","Nutrients are not necessary for energy generation."], e: "Statement 3 is the correct definition — nutrients are essential molecules needed by organisms for growth, development and reproduction." },
  { s: GA, q: "The 35th Summer Olympics will be held in ____.", o: ["Australia","The US","Brazil","South Africa"], e: "The Games of the XXXV Olympiad (35th Summer Olympics) are scheduled for 2032 at Brisbane, Australia." },
  { s: GA, q: "Which of the following national festivals is celebrated to mark the day when the Constitution of India came into effect?", o: ["Republic Day","National Youth Day","Voters' Day","Independence Day"], e: "Republic Day (26 January) marks the day the Constitution of India came into effect in 1950." },
  { s: GA, q: "In which of the following years did Turkish ruler, Timur Lang invade India?", o: ["1387","1398","1412","1407"], e: "Timur (Tamerlane) invaded India and sacked Delhi in 1398." },
  { s: GA, q: "Who is the 15th Chief Minister (CM) of Assam appointed on 10 May 2021?", o: ["Sarbananda Sonowal","Prafulla Kumar Mahanta","Ripun Bora","Dr Himanta Biswa Sarma"], e: "Dr. Himanta Biswa Sarma was sworn in as the 15th Chief Minister of Assam on 10 May 2021." },
  { s: GA, q: "Under the Regulating Act, 1773, in which of the following places was the Supreme Court established in British India?", o: ["Bombay","Delhi","Madras","Calcutta"], e: "The Regulating Act, 1773 established the Supreme Court of Judicature at Fort William in Calcutta (1774)." },
  { s: GA, q: "Which of the following is NOT a Fundamental Duty?", o: ["Develop the scientific temper","Pay tax on time","Respect National Flag and the National Anthem","To defend the country and render national service when called upon to do so"], e: "Paying tax on time is a legal obligation but not listed in Article 51A. The other three are explicit Fundamental Duties." },
  { s: GA, q: "Which of the following leaders is also known as 'Frontier Gandhi'?", o: ["Abul Kalam Azad","Jawaharlal Nehru","Khan Abdul Ghaffar Khan","Vallabhbhai Patel"], e: "Khan Abdul Ghaffar Khan was known as 'Frontier Gandhi' / 'Badshah Khan' for his non-violent struggle in the NWFP." },
  { s: GA, q: "At the AIBA Youth World Boxing Championships – 2021, India ranked __________.", o: ["third","second","fourth","first"], e: "India topped the medal tally (8 medals incl. 3 golds) at the AIBA Youth World Boxing Championships 2021 — ranked first." },
  { s: GA, q: "Temperature, pressure and humidity are the main components of:", o: ["desert","climate","eating habits","rainy forest"], e: "Climate is defined by atmospheric variables — temperature, pressure, humidity, etc." },
  { s: GA, q: "The western part of which river, along with its significant tributaries Sonanadi, Palain and Mandal, forms the prominent hydrological resource for the Corbett National Park?", o: ["Gandaki","Beas","Sutlej","Ramganga"], e: "The Ramganga river (with Sonanadi, Palain, Mandal tributaries) is the main hydrological feature of Jim Corbett National Park." },
  { s: GA, q: "Whose birth anniversary is celebrated as Non-Violence Day?", o: ["Mohandas Karamchand Gandhi","Mother Teresa","Nelson Mandela","Sardar Vallabhbhai Patel"], e: "International Day of Non-Violence is observed on 2 October — birth anniversary of Mahatma Gandhi." },
  { s: GA, q: "What was the growth rate of India's population in the decade of 2001 - 2011?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "India's population grew at 17.7% during 2001–2011 (Census). Per response sheet, option 3." },
  { s: GA, q: "Under which medieval dynasty was the Jamat Khana Masjid in Delhi constructed?", o: ["Mughal Dynasty","Khilji Dynasty","Lodi Dynasty","Tughlaq Dynasty"], e: "The Jamat Khana Masjid (at Hazrat Nizamuddin Dargah, Delhi) was built during the Khilji Dynasty (Alauddin Khilji's reign)." },
  { s: GA, q: "Who was the first Indian woman to write an autobiography?", o: ["Lakshmibai Tilak","Baby Halder","Kamala Das","Rassundari Devi"], e: "Rassundari Devi (1809-1899) wrote 'Amar Jiban' (1876) — the first full-length autobiography in Bengali and by an Indian woman." },
  { s: GA, q: "Which of the following states had a population density of 751 - 1000 persons per km² as per the 2011 census?", o: ["Tamil Nadu","Kerala","Maharashtra","Gujarat"], e: "Per Census 2011: Kerala density = 859/km² (in 751-1000 range). TN=555, MH=365, GJ=308." },
  { s: GA, q: "The Election Laws (Amendment) Bill, 2021 seeks to designate 1 April, 1 July and 1 October as qualifying dates in addition to __________ for the enrolment of 18-year-olds as voters.", o: ["1 January","1 March","1 May","1 September"], e: "The 2021 amendment added 3 more qualifying dates in addition to the existing 1 January for voter enrolment." },
  { s: GA, q: "Thawarchand Gehlot was appointed as the Governor of ______________________ in July 2021.", o: ["Punjab","Gujarat","Karnataka","Goa"], e: "Thawarchand Gehlot was appointed Governor of Karnataka on 6 July 2021." },
  { s: GA, q: "In India, where was the first jute mill set up near Kolkata in 1855?", o: ["Naihati","Icchapur","Hooghly","Rishra"], e: "The first jute mill in India was set up by George Acland at Rishra (near Kolkata) on the banks of the Hooghly in 1855." }
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
      tags: ['SSC', 'Selection Post', 'Phase X', 'Matriculation', 'PYQ', '2022'],
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

  let exam = await Exam.findOne({ code: 'SSC-SSP-MAT' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC Selection Post (Matriculation Level)',
      code: 'SSC-SSP-MAT',
      description: 'Staff Selection Commission - Selection Post Phase X (Matriculation Level - 10th-pass eligibility)',
      isActive: true
    });
  }

  const PATTERN_TITLE = 'SSC Selection Post (Matriculation Level)';
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

  const TEST_TITLE = 'SSC Selection Post Phase X (Matriculation) - 1 August 2022 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-2',
    pyqExamName: 'SSC Selection Post Phase X (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
