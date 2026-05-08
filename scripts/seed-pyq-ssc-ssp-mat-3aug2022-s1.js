/**
 * Seed: SSC Selection Post Phase X (Matriculation Level) PYQ - 3 August 2022, Shift-1 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-3aug2022-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/03/shift-1/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-3aug2022-s1';

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

const F = '3-august-2022';
// Reasoning Q21 and Q25 are image-based (only image assets in source folder for this paper).
const IMAGE_MAP = {
  21: { q: `${F}-q-21.png`,
        opts: [`${F}-q-21-option-1.png`,`${F}-q-21-option-2.png`,`${F}-q-21-option-3.png`,`${F}-q-21-option-4.png`] },
  25: { q: `${F}-q-25.png`,
        opts: [`${F}-q-25-option-1.png`,`${F}-q-25-option-2.png`,`${F}-q-25-option-3.png`,`${F}-q-25-option-4.png`] }
};

// 1-based answer key (Chosen Options + GK overrides for unanswered/wrong picks).
const KEY = [
  // 1-25 (General Intelligence) — Q8/Q9/Q15 wrong/unanswered overridden
  1,2,2,3,2, 1,4,4,2,2, 2,1,2,4,3, 1,3,3,3,2, 1,1,2,4,1,
  // 26-50 (English Language) — many overrides
  1,3,4,2,2, 3,3,2,1,3, 1,1,4,1,2, 1,1,3,4,3, 4,4,4,3,1,
  // 51-75 (Quantitative Aptitude) — many overrides for unanswered/wrong
  2,2,1,3,3, 3,1,2,2,2, 1,2,4,1,3, 4,2,1,4,1, 1,1,4,2,2,
  // 76-100 (General Awareness) — heavy overrides (many unanswered)
  4,1,1,1,2, 3,2,1,1,2, 3,4,4,1,3, 4,3,1,3,1, 3,3,4,3,2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "Which two numbers (not the digits of the numbers), from amongst the given options, should be interchanged to make the given equation correct?\n\n36 ÷ 6 + 8 − 2 × 5 = −4", o: ["2 and 6","6 and 8","36 and 8","2 and 8"], e: "Swap 2 and 6: 36÷2 + 8 − 6×5 = 18 + 8 − 30 = −4. ✓" },
  { s: REA, q: "In a code language, 'SPORTY' is written as 'QMKMNR' and 'PREYS' is written as 'NOATM'. How will 'CLIP' be written in that language?", o: ["AJEL","AIEK","AIFL","AJFK"], e: "Successive shifts −2,−3,−4,−5,−6,−7. CLIP: C−2=A, L−3=I, I−4=E, P−5=K → AIEK." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Jaundice  2. Jackal  3. Jargon  4. Janitor  5. Jamaica  6. Javelin", o: ["6, 2, 1, 5, 4, 3","2, 5, 4, 3, 1, 6","1, 6, 2, 5, 4, 3","1, 2, 5, 4, 3, 6"], e: "Order: Jackal(2), Jamaica(5), Janitor(4), Jargon(3), Jaundice(1), Javelin(6) → 2,5,4,3,1,6." },
  { s: REA, q: "Select the option that is related to the fifth number in the same way as the second number is related to the first number and the fourth number is related to the third number.\n\n149 : 12 :: 230 : 15 :: 294 : ?", o: ["19","21","17","20"], e: "Pattern: floor(√n). √149≈12.2→12; √230≈15.16→15; √294≈17.15→17." },
  { s: REA, q: "In a certain code language, 'JUNIOR' is written as 'LWNIQT', and 'LABOUR' is written as 'NCBOWT'. How will 'MAKING' be written in that language?", o: ["OCKIOI","OCKIPI","OBKIPI","OCKQPI"], e: "Pattern: +2,+2,0,0,+2,+2. M+2=O, A+2=C, K+0=K, I+0=I, N+2=P, G+2=I → OCKIPI." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nJDTY, LHRU, NLPQ, ?, RTLI", o: ["PPNM","PPON","PONL","PQML"], e: "1st:+2 (J,L,N,P,R). 2nd:+4 (D,H,L,P,T). 3rd:−2 (T,R,P,N,L). 4th:−4 (Y,U,Q,M,I). Missing = PPNM." },
  { s: REA, q: "Pointing to a person in a photograph, a man, Kumar, said, \"He is the son of my sister's father-in-law's wife Sushma.\" Sushma has only one son. How is the person related to Kumar?", o: ["Father-in-law","Son","Sister's son","Sister's husband"], e: "Sister's father-in-law's wife = Sushma = sister's mother-in-law. Her only son = sister's husband." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Plunge  2. Pulse  3. Police  4. Prudent  5. Purse  6. Palate", o: ["6, 1, 3, 4, 5, 2","6, 3, 1, 4, 2, 5","6, 1, 4, 3, 2, 5","6, 1, 3, 4, 2, 5"], e: "Order Pa < Pl < Po < Pr < Pu: Palate(6), Plunge(1), Police(3), Prudent(4), Pulse(2), Purse(5) → 6,1,3,4,2,5." },
  { s: REA, q: "Which number will replace the question mark (?) in the following series?\n\n11, 19, ?, 49, 79, 128", o: ["38","30","40","28"], e: "Each term = sum of previous two (Fibonacci-like). 11+19=30, 19+30=49, 30+49=79, 49+79=128. So ?=30." },
  { s: REA, q: "In a certain code language, 'SEA' is written as '75', and 'POND' is written as '196'. How will 'LAKE' be written in that language?", o: ["120","116","112","124"], e: "Code = (sum of letter positions) × (number of letters). LAKE: (12+1+11+5)×4 = 29×4 = 116." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the following blanks, will complete the letter-series.\n\nT_U_P_Y_IPT_UI_TY__P", o: ["YUTUYPPI","YITUYPUI","YUTIYPPI","YITUYPPI"], e: "Per response sheet, option 2 (YITUYPUI)." },
  { s: REA, q: "In a certain code language, 'CONGRESS' is written as 'RTDSFOND' and 'COUNTRY' is written as 'ZQUMVND'. How will 'CONTROL' be written in that language?", o: ["MNSSOND","KPQUMPB","KPQUMND","KPSSONB"], e: "Per response sheet, option 1 (MNSSOND)." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\nTA_BL_E_AA_LL_T_AB_LE", o: ["A A B T L E A","A L T B E A L","B E A L A T L","A T L B E A L"], e: "Per response sheet, option 2 (ALTBEAL)." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nFOREST : EROFTS :: LETTER : TTELRE :: SELECT : ?", o: ["TCSLEE","CTELES","EELSTC","ELESTC"], e: "Position rearrangement 1234 56 → 4,3,2,1,6,5. SELECT → E,L,E,S,T,C = ELESTC." },
  { s: REA, q: "In a code language, 'want to go fishing' is written as '4227', 'deep in the sea' is written as '4233', 'under the clear blue sky' is written as '53543'. What is the code for the phrase 'come along with me' in this language?", o: ["4442","5442","4542","5432"], e: "Each digit = letter count of word. come(4), along(5), with(4), me(2) = 4542." },
  { s: REA, q: "'P @ Q' means 'P is the wife of Q'.\n'P & Q' means 'P is the father of Q'.\n'P # Q' means 'P is the mother of Q'.\n\nIf 'A # B @ C & D @ E', then how is D related to A?", o: ["Daughter's daughter","Father's mother","Mother's mother","Daughter's husband"], e: "A mother of B; B wife of C; C father of D; D wife of E. So B is A's daughter, D is B's child = A's grandchild. D is wife (female) → A's daughter's daughter." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the following blanks, will complete the letter-series.\n\nA__SD_GF_DAG_S_A_F_D", o: ["GFSAFDGS","GFASFGDS","GFASFDGS","GFSADFGS"], e: "Per response sheet, option 3 (GFASFDGS)." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nAGES : YDCO :: FAIR : DXGN :: LIFE : ?", o: ["JEDA","JEDB","JFDA","JFDB"], e: "Shifts −2,−3,−2,−4. LIFE: L−2=J, I−3=F, F−2=D, E−4=A → JFDA." },
  { s: REA, q: "In a certain code language, 'JUPITER' is written as 'PWRKVGH' and 'SATURN' is written as 'LCVWTQ'. How will 'ASTEROID' be written in that language?", o: ["YUVGTQKB","CUVGTQKF","BUVGTQKY","FUVGTQKC"], e: "Per response sheet, option 3 (BUVGTQKY)." },
  { s: REA, q: "In a certain code language, 'CLOCK' is written as 'XHLAJ' and 'FAITH' is written as 'AWFRG'. How will 'BEACH' be written in that language?", o: ["HCAEB","WAXAG","ABXCG","AAXBG"], e: "Successive shifts −5,−4,−3,−2,−1. B−5=W, E−4=A, A−3=X, C−2=A, H−1=G → WAXAG." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Given below are two statements and two conclusions. Take the statements to be true even if they are at variance with commonly known facts, and decide whether the conclusion(s) follow(s) the given statements.\n\nStatements:\nSome bags are sacks.\nSome sacks are juts.\n\nConclusions:\nI. Some bags are juts.\nII. Some juts are sacks.", o: ["Only conclusion II follows","Either conclusion I or II follows","Neither conclusion I nor II follows","Only conclusion I follows"], e: "II follows by simple conversion of 'some sacks are juts'. I cannot be inferred from disjoint 'some' premises." },
  { s: REA, q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nSome defects are problems.\nSome problems are solutions.\n\nConclusions:\nI. Some defects being solutions is a possibility.\nII. No solution is a defect.", o: ["Neither conclusion I nor II follows","Only conclusion I follows","Both conclusions I and II follow","Only conclusion II follows"], e: "Possibility-type conclusion I follows (cannot be ruled out). II is too strong." },
  { s: REA, q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nSome figures are numbers.\nSome numbers are digits.\n\nConclusions:\nI. No figure is a digit.\nII. All digits are figures.", o: ["Only conclusion II follows","Only conclusion I follows","Both conclusions I and II follow","Neither conclusion I nor II follows"], e: "Neither I nor II can be definitely inferred from disjoint 'some' premises." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nHaughty", o: ["Arrogant","Lowly","Modest","Humble"], e: "'Haughty' (showing disdainful pride) — synonym 'Arrogant'." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Counterfeit","Deceive","Protien","Conceit"], e: "'Protien' is misspelled — correct is 'Protein'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nGift of the gab", o: ["A talent of lying well","Gift from a friend","A very poor gift","A talent of speaking well"], e: "'Gift of the gab' means a natural talent for speaking eloquently." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the underlined group of words.\n\nHana was excited to study about the origin, composition and structure of rocks.", o: ["Tetralogy","Petrology","Tectonics","Geology"], e: "Petrology is the branch of science dealing with origin, composition and structure of rocks." },
  { s: ENG, q: "Substitute one word for the italicised expression.\n\nShelley was also known for his association with John Keats and Lord Byron as these were the men living in the same age.", o: ["preceding","contemporaries","old-fashioned","succeeding"], e: "'Contemporaries' = people living in the same age." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nCease", o: ["terminate","quit","begin","halt"], e: "'Cease' (to stop) — antonym 'begin'." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nThe instructor said to the student, \"Can you explain this?\"", o: ["The instructor asked the student whether she can explain this.","The instructor asked the student whether she could explain this.","The instructor asked the student whether she could explain that.","The instructor asked the student whether she can explain that."], e: "'said' (past) → 'can' becomes 'could'; 'this' becomes 'that'." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nTurbulent", o: ["Restricted","Disordered","Patterned","Capitalised"], e: "'Turbulent' (chaotic / unrest) — synonym 'Disordered'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDictatorship", o: ["Democracy","Communism","Monarchy","Republic"], e: "'Dictatorship' — antonym 'Democracy'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe strange noise which came from the room created a ________ among the students.", o: ["transport","deficit","panic","civility"], e: "'Panic' fits the context of fear/alarm caused by a strange noise." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Thressold","Supersede","Filial","Leisure"], e: "'Thressold' is misspelled — correct is 'Threshold'." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe arrangement of events or dates in the order of their occurrence", o: ["Chronology","Periodic","Dialectology","Morphology"], e: "'Chronology' = arrangement of events in their time-order of occurrence." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nThe car hit the pole beside the shop before the accident.", o: ["The pole beside the shop hit by the car before the accident.","The pole beside the shop had been hit by the car before the accident.","The pole beside the shop were hit by the car before the accident.","The pole beside the shop was hit by the car before the accident."], e: "Simple past active 'hit' → simple past passive 'was hit'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nBetter late than never", o: ["It is better to reach late than never arrive","It is not good to reach late","It is bad to read late","It is better not to attend if late"], e: "'Better late than never' = it is better to do/reach something late than not at all." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Camouflage","Buisness","Building","Camphor"], e: "'Buisness' is misspelled — correct is 'Business'." },
  { s: ENG, q: "Read the passage about women's empowerment and answer.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'mechanisms (1) ______ women's equal participation'", o: ["for","from","about","on"], e: "'Mechanisms FOR women's equal participation' — preposition for purpose." },
  { s: ENG, q: "Read the passage about women's empowerment and answer.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'organisations should try (2) _______ all practices that discriminate'", o: ["eliminating","blacklisting","exiling","precluding"], e: "'Try eliminating' (removing) all discriminatory practices." },
  { s: ENG, q: "Read the passage about women's empowerment and answer.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'practices that discriminate (3) ________ women'", o: ["athwart","contradict","against","rebel"], e: "'Discriminate against' is the standard phrasal collocation." },
  { s: ENG, q: "Read the passage about women's empowerment and answer.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'violence and safety is a major (4) ________ to women in society'", o: ["snare","retreat","trap","threat"], e: "'A major threat to women' fits the context of violence and safety concerns." },
  { s: ENG, q: "Read the passage about women's empowerment and answer.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'It is (5) ________ unfair and sexist to pay someone less'", o: ["frank","foursquare","downright","laconic"], e: "'Downright unfair' (utterly / completely) — standard intensifier." },
  { s: ENG, q: "Read the passage about ocean colour change and Phytoplankton.\n\nChoose the most appropriate title for the passage.", o: ["Climate Change","Blue and Green","Weather Conditions","Ocean Colour"], e: "The passage focuses on why oceans appear blue/green and how their colour will change — 'Ocean Colour' is the central theme." },
  { s: ENG, q: "Read the passage about ocean colour change and Phytoplankton.\n\nSelect the most appropriate synonym of the given word.\n\nAbsorb", o: ["Replace","Embrace","Renew","Assimilate"], e: "'Absorb' = 'Assimilate' (to take in / soak up)." },
  { s: ENG, q: "Read the passage about ocean colour change and Phytoplankton.\n\nSelect the word from the passage that best explains the given word.\n\nPhytoplankton", o: ["Creatures","Molecules","Organisms","Plants"], e: "Per passage: 'Phytoplankton which are tiny microscopic organisms like plants' — most directly described as plants/like plants in this context." },
  { s: ENG, q: "Read the passage about ocean colour change and Phytoplankton.\n\nSelect the most appropriate synonym of the given word.\n\nSurvival", o: ["Close","Change","Existence","Start"], e: "'Survival' = 'Existence' (continued life)." },
  { s: ENG, q: "Read the passage about ocean colour change and Phytoplankton.\n\nIdentify the tone of the given passage.", o: ["Informative","Imaginative","Interactive","Reciprocal"], e: "The passage presents factual scientific information about ocean colour — informative tone." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "Refer to the image for the area question.", o: ["211.76 cm²","221.76 cm²","221.16 cm²","222.26 cm²"], e: "Per response sheet, option 2 (221.76 cm²)." },
  { s: QA, q: "ABC Ltd is selling laptops across the nation. The manager said that the company earned a profit of the sale price of 1008 laptops on the sale of 6608 laptops in a year. What is the gain percentage that the company earned?", o: ["15%","18%","16%","20%"], e: "Profit = SP of 1008. CP = SP·(6608−1008) = SP·5600. Gain% = 1008/5600·100 = 18%." },
  { s: QA, q: "The third proportional to 0.9 and 0.3 is:", o: ["0.1","0.9","0.01","0.3"], e: "Third proportional = b²/a = (0.3)²/0.9 = 0.09/0.9 = 0.1." },
  { s: QA, q: "Ramesh purchased watches at the rate of Rs.600 each from a wholesaler. He raised the price by 25% and then allowed a discount of 12% on each watch. What was his profit percentage?", o: ["10.5%","11.5%","10%","11%"], e: "MP = 600·1.25 = 750. SP = 750·0.88 = 660. Profit% = 60/600·100 = 10%." },
  { s: QA, q: "A tradesman marks his goods at 30% above the cost price. If he allows the customers a 10% discount, how much percentage does he make as profit?", o: ["23%","22%","17%","20%"], e: "Let CP=100. MP=130. SP=130·0.90=117. Profit% = 17%." },
  { s: QA, q: "An employee spends 75% of his income. His income rises by 25%, while his spending rises by 10%. The percentage of increase in his saving is ________.", o: ["68%","65%","70%","72%"], e: "Let income=100, spend=75, save=25. New: income=125, spend=82.5, save=42.5. Increase = (42.5−25)/25·100 = 70%." },
  { s: QA, q: "A and B can complete a piece of work in 12 days and 18 days, respectively. A begins to do the work and they work alternately, one at a time, for one day each. The whole work will be completed in ________.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1 (14 1/3 days)." },
  { s: QA, q: "A shopkeeper mixed two varieties of rice of prices Rs.36/kg and Rs.24/kg in the ratio of 1 : 2, respectively. He sold the mixture for Rs.2,100 to earn a profit of 25%. Find the quantity of rice of cost Rs.24/kg used in the mixture.", o: ["39 kg","40 kg","38 kg","37 kg"], e: "Mean cost = (36+2·24)/3 = 28/kg. CP = 2100/1.25 = 1680. Total kg = 1680/28 = 60. ₹24/kg portion = (2/3)·60 = 40 kg." },
  { s: QA, q: "Sonu and Ravi working together can complete a job in 3 hours whereas Sonu alone can complete the same job in 4 hours. In how many hours can Ravi alone do the job?", o: ["10","12","15","8"], e: "1/Sonu + 1/Ravi = 1/3 ⇒ 1/4 + 1/Ravi = 1/3 ⇒ 1/Ravi = 1/12 ⇒ Ravi = 12 hours." },
  { s: QA, q: "The perimeter of a rectangle and a square are 160 m each. The area of the rectangle is less than that of the square by 100 m². The length of the rectangle is _________.", o: ["55 m","50 m","65 m","60 m"], e: "Square side = 40, area = 1600. Rectangle area = 1500. l+b=80, lb=1500. Solving: l=50, b=30. Length = 50 m." },
  { s: QA, q: "On selling a mobile for Rs.3,825 a man loses 15%. For how much should he sell it to gain 12%?", o: ["Rs.5,040","Rs.4,820","Rs.4,860","Rs.4,950"], e: "CP = 3825/0.85 = 4500. SP for 12% gain = 4500·1.12 = ₹5,040." },
  { s: QA, q: "The ratio of the two numbers is 5 : 8 and their LCM is 840. What are the two numbers?", o: ["110, 180","105, 168","98, 140","102, 179"], e: "Numbers = 5x, 8x. LCM = 40x = 840 ⇒ x = 21. Numbers = 105, 168." },
  { s: QA, q: "A teacher is giving students the practical experience of compounding. A sum of Rs.1,00,000 is invested at the rate of 10% compound interest by the students for a period of two years. There are two different cases — the given money being compounded annually and being compounded half-yearly. What is the difference between the compound interest earned in the two different cases? (Round off the answer to nearest Rs.)", o: ["Rs.651","Rs.625","Rs.21,000","Rs.551"], e: "Annual CI: 100000·(1.1)² − 100000 = 21000. Half-yearly CI: 100000·(1.05)⁴ − 100000 = 21550.625. Difference ≈ ₹551." },
  { s: QA, q: "The population of a town 2 years ago was 8000. If the population growth rate is 30% per annum. What will the population after 1 year?", o: ["17576","15678","17000","16754"], e: "Present population = 8000·(1.30)² = 13520. After 1 more year = 13520·1.30 = 17576." },
  { s: QA, q: "A sum is invested at CI payable annually. The interest in 2 successive years was Rs.225 and Rs.238.50, respectively. Find the rate percentage per annum.", o: ["8%","5%","6%","4%"], e: "Difference = 13.50 = 225·r ⇒ r = 0.06 = 6%." },
  { s: QA, q: "A thief steals a car at 3:30 A.M. and drives it at 64 km/h. The thief is discovered at 4:30 A.M. and the owner starts the chase with another car at 80 km/h. When will he catch the thief?", o: ["7:30 AM","8:30 PM","7:30 PM","8:30 AM"], e: "Lead at 4:30 AM = 64 km. Relative speed = 16 km/h. Catch time = 64/16 = 4 h. So at 4:30 + 4 = 8:30 AM." },
  { s: QA, q: "If 10% of an electricity bill is deducted, Rs.45 is still to be paid. The bill amount is ________.", o: ["Rs.55","Rs.50","Rs.65","Rs.45"], e: "0.90·Bill = 45 ⇒ Bill = ₹50." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "16 kg of Rs.20 per kg wheat is mixed with 8 kg of another type of wheat to get a mixture that costs Rs.25 per kg. Find the price (per kg) of the costlier wheat.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "16·20 + 8·X = 24·25 ⇒ 320 + 8X = 600 ⇒ X = ₹35/kg. Per response sheet, option 4." },
  { s: QA, q: "The ratio of expenditure to savings of a woman is 2 : 1. If her income and expenditure increase by 17% and 13%, respectively, then find the percentage increase in her saving.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Income=3, exp=2, save=1. New income=3.51, new exp=2.26, new save=1.25. Increase = 25%. Per response sheet, option 1." },
  { s: QA, q: "A dishonest shopkeeper professes to sell his goods at cost price, but he uses a weight of 900 g for the kg weight. Find the gain percentage.", o: ["11.11%","10.10%","12.12%","13.33%"], e: "Gain% = (1000−900)/900 · 100 = 100/9 ≈ 11.11%." },
  { s: QA, q: "A number is square of 167. When digits of the number are rearranged in descending order, then the new number which is formed will be divisible by:", o: ["17","13","5","11"], e: "167² = 27889. Descending: 98872. 98872 = 17 × 5816, hence divisible by 17." },
  { s: QA, q: "The fourth proportional to 0.08, 0.12 and 6 is:", o: ["0.13","0.09","10","9"], e: "Fourth proportional = (0.12 × 6)/0.08 = 0.72/0.08 = 9." },
  { s: QA, q: "The arithmetic mean of 16 student's scores is 320. Find the sum of these scores.", o: ["6240","5120","5320","7150"], e: "Sum = 16 × 320 = 5120." },
  { s: QA, q: "A 315-m-long train is moving at a speed of 24 km/h. It will cross a man coming from the opposite direction at a speed of 3 km/h in __________.", o: ["38 sec","42 sec","40 sec","36 sec"], e: "Relative speed = 24+3 = 27 km/h = 7.5 m/s. Time = 315/7.5 = 42 sec." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Who among the following rulers of the Suri dynasty defeated the Mughal emperor Humayun?", o: ["Islam Shah Suri","Firuz Shah Suri","Sikandar Shah Suri","Sher Shah Suri"], e: "Sher Shah Suri defeated Humayun at Chausa (1539) and Kannauj/Bilgram (1540), forcing him into exile." },
  { s: GA, q: "'Phulaich' festival is celebrated in which of the following states of India?", o: ["Himachal Pradesh","Gujarat","Kerala","Meghalaya"], e: "Phulaich (Festival of Flowers) is celebrated in the Kinnaur region of Himachal Pradesh." },
  { s: GA, q: "Who founded the Satyashodhak Samaj (Truth-Seeking Society)?", o: ["Jyotirao Phule","Ram Mohun Roy","Keshab Chandra Sen","Debendranath Tagore"], e: "Jyotirao Phule founded the Satyashodhak Samaj on 24 September 1873 in Pune." },
  { s: GA, q: "The State Policy Directive Principles are some of the ideas outlined in Articles 36 through ____________ of the Constitution of India.", o: ["51","57","47","53"], e: "DPSPs are listed in Part IV of the Constitution, Articles 36 through 51." },
  { s: GA, q: "Identify the group of insulators from the following?", o: ["Plastic, copper and rubber","Plastic, wood and rubber","Iron, wood and rubber","Steel, copper and rubber"], e: "Plastic, wood and rubber are all electrical/thermal insulators. (Copper, iron, steel are conductors.)" },
  { s: GA, q: "Who among the following became the king of Magadha after killing his father, Bimbisara?", o: ["Anuruddha","Munda","Ajatashatru","Udayin"], e: "Ajatashatru, son of Bimbisara, killed his father and ascended the throne of Magadha (~492 BCE)." },
  { s: GA, q: "The first Paralympic Games was organised by _______.", o: ["Australia","Italy","The US","England"], e: "The first official Paralympic Games (parallel to the Olympics) were held in Rome, Italy in 1960." },
  { s: GA, q: "Effective from 1 April 2022 the Government of India has increased the compensation for the immediate family members of the victims of 'hit-and-run' cases from Rs.25,000 to __________ for death.", o: ["Rs.2,00,000","Rs.1,50,000","Rs.50,000","Rs.1,00,000"], e: "Compensation under hit-and-run scheme increased from ₹25,000 to ₹2,00,000 for death, effective 1 April 2022." },
  { s: GA, q: "__________ are in Madhya Pradesh.", o: ["Bagh caves","Ajanta caves","Bhaja caves","Kanheri caves"], e: "Bagh Caves are in Dhar district of Madhya Pradesh. (Ajanta — Maharashtra; Bhaja — Maharashtra; Kanheri — Maharashtra.)" },
  { s: GA, q: "The autobiography titled _________ by Anne Frank describes a thirteen-year-old Jewish girl's experiences during World War II.", o: ["My Country My Life","The Diary of A Young Girl","True Love and a Little Malice","I Know Why the Caged Bird Sings"], e: "'The Diary of A Young Girl' (Het Achterhuis) — Anne Frank's diary published posthumously by her father in 1947." },
  { s: GA, q: "According to Census of India 2011, what is the gap (in %) between male and female literacy rate in India?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per Census 2011: male literacy 80.9%, female 64.6%, gap ≈ 16.3%. Per response sheet, option 3." },
  { s: GA, q: "The rocky outer part of Earth is called:", o: ["the inner core","the outer core","the mantle","the lithosphere"], e: "The lithosphere is the rigid, rocky outer shell of Earth, comprising the crust and uppermost mantle." },
  { s: GA, q: "Who among the following is known as the 'Missile Man' of India?", o: ["MF Hussain","Homi Bhabha","Rajiv Gandhi","APJ Abdul Kalam"], e: "Dr. APJ Abdul Kalam is known as the Missile Man of India for his role in the development of ballistic missiles (Agni, Prithvi)." },
  { s: GA, q: "The ceremonial gateway in a Stupa is also known as:", o: ["Torana","Chhatra","Vedika","Medhi"], e: "Torana is the ornate ceremonial gateway leading into a Stupa enclosure (e.g., Sanchi)." },
  { s: GA, q: "Which of the following organisations was founded by Surendranath Banerjee and Ananda Mohan Bose in 1876?", o: ["British Indian Association","Poona Sarvajanik Sabha","The Indian Association","Bombay Presidency Association"], e: "The Indian Association was founded by Surendranath Banerjee and Ananda Mohan Bose at Calcutta on 26 July 1876 — first nationalist political organisation." },
  { s: GA, q: "What is the total area of the state of Bihar?", o: ["89,631 km²","98,631 km²","82,163 km²","94,163 km²"], e: "Bihar's total area (after the 2000 Jharkhand bifurcation) is 94,163 km²." },
  { s: GA, q: "Who was appointed as the Chairman of the University Grants Commission (UGC), in February 2022?", o: ["Biren Sinha","Rakesh Asthana","M Jagadesh Kumar","DP Singh"], e: "Prof. M. Jagadesh Kumar (former JNU VC) was appointed UGC Chairman in February 2022." },
  { s: GA, q: "The famous musicians Nikhil Banerjee and Vilayat Khan are associated with which musical instrument?", o: ["Sitar","Sarod","Shehnai","Tabla"], e: "Pandit Nikhil Banerjee and Ustad Vilayat Khan were both legendary Sitar maestros." },
  { s: GA, q: "Which of the following is NOT a method used for measuring unemployment in India?", o: ["Daily Status Approach","Usual Status Approach","Unusual Status Approach","Weekly Status Approach"], e: "NSSO's three approaches: Usual Status, Weekly Status, Daily Status. 'Unusual Status' is fictitious." },
  { s: GA, q: "The 19th Commonwealth Games were organised by ________.", o: ["India","The Bahamas","England","Australia"], e: "The 19th Commonwealth Games were held in Delhi, India, from 3–14 October 2010." },
  { s: GA, q: "Which of the following factors did NOT influence the distribution pattern of the railway network in India?", o: ["Physiographic","Economic","Linguistic","Administrative"], e: "Railway network distribution is shaped by physiographic, economic and administrative factors. Linguistic considerations did not influence the network." },
  { s: GA, q: "Onam is a major festival of India primarily celebrated in which of the following states?", o: ["Punjab","Bihar","Kerala","Assam"], e: "Onam is the most prominent festival of Kerala, marking the homecoming of the legendary king Mahabali." },
  { s: GA, q: "What kitchen ingredient is used as a natural preservative for pickles that triggers osmosis by attracting water and driving it across the membrane?", o: ["Sugar","Oil","Vinegar","Kitchen salt"], e: "Salt acts as a natural preservative by drawing water out of microbes through osmosis (high osmotic pressure), preventing spoilage." },
  { s: GA, q: "In January 2022, the Supreme Court of India quashed the one-year suspension of 12 MLAs, belonging to the state of _________, who had been suspended for 'disorderly conduct'.", o: ["Bihar","Punjab","Maharashtra","Kerala"], e: "12 BJP MLAs of Maharashtra were suspended in July 2021 for one year; the Supreme Court quashed the suspension on 28 January 2022." },
  { s: GA, q: "Indian dancer Pandit Birju Maharaj was an exponent of which of the following Kathak gharanas?", o: ["Jaipur","Lucknow","Raigarh","Banaras"], e: "Pandit Birju Maharaj (1938–2022) was the leading exponent of the Lucknow Gharana of Kathak." }
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

  const TEST_TITLE = 'SSC Selection Post Phase X (Matriculation) - 3 August 2022 Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-1',
    pyqExamName: 'SSC Selection Post Phase X (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
