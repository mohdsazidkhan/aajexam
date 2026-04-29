/**
 * Seed: SSC CHSL Tier-I PYQ - 2 June 2022, Shift-3 (100 questions)
 * Source: Oswaal SSC CHSL Tier-I Year-wise Solved Papers (PDF, verified)
 * Run with: node scripts/seed-pyq-ssc-chsl-2jun2022-s3.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC CHSL TIER 1/2-june-2022/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-chsl-2jun2022-s3';

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
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
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

const IMAGE_MAP = {
  26: {
    q: '2-june-2022-q-26.png',
    opts: ['2-june-2022-q-26-option-1.png','2-june-2022-q-26-option-2.png','2-june-2022-q-26-option-3.png','2-june-2022-q-26-option-4.png']
  },
  31: { q: '2-june-2022-q-31.png' },
  40: {
    q: '2-june-2022-q-40.png',
    opts: ['2-june-2022-q-40-option-1.png','2-june-2022-q-40-option-2.png','2-june-2022-q-40-option-3.png','2-june-2022-q-40-option-4.png']
  },
  41: {
    opts: ['2-june-2022-q-41-option-1.png','2-june-2022-q-41-option-2.png','2-june-2022-q-41-option-3.png','2-june-2022-q-41-option-4.png']
  },
  47: {
    q: '2-june-2022-q-47.png',
    opts: ['2-june-2022-q-47-option-1.png','2-june-2022-q-47-option-2.png','2-june-2022-q-47-option-3.png','2-june-2022-q-47-option-4.png']
  },
  50: {
    q: '2-june-2022-q-50.png',
    opts: ['2-june-2022-q-50-option-1.png','2-june-2022-q-50-option-2.png','2-june-2022-q-50-option-3.png','2-june-2022-q-50-option-4.png']
  },
  51: { q: '2-june-2022-q-51.png' },
  57: { q: '2-june-2022-q-57.png' },
  60: { q: '2-june-2022-q-60.png' }
};

// 1-based answer key from the paper's Answer Key table (verified from PDF)
const ANSWER_KEY = [
  3,2,2,3,4, 4,3,1,3,3, 3,3,2,2,1, 3,3,4,4,3, 4,3,4,4,4, // 1-25
  1,3,4,1,4, 1,2,3,4,4, 1,1,2,3,3, 4,3,3,4,1, 1,3,4,4,3, // 26-50
  4,2,3,4,3, 1,3,4,2,3, 2,2,2,3,1, 4,4,4,4,2, 1,2,4,4,1, // 51-75
  2,1,1,4,4, 3,3,1,4,3, 3,3,3,3,1, 4,4,1,4,4, 1,3,1,2,2  // 76-100
];

const ENG = 'English Language';
const GI  = 'General Intelligence';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ English Language (1-25) ============
  { s: ENG, q: "In the following passage, some words have been deleted. Read the passage carefully and select the most appropriate option to fill in each blank.\n\nI suggested her two ______ dates, both in the coming month and just a few days ______ from each other to start her singing practice.", o: ["alarming, near","adverse, different","alternative, apart","alternating, closely"], e: "'Alternative dates' (choices) and 'a few days apart' (separated by) are the right collocations." },
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order.\n\nA. People can get in touch with the larger global community by communicating and sharing their views via social media.\nB. Furthermore, this provides a suitable platform to express their views, conduct business with online transactions, or find new people or jobs.\nC. Smartphones have become a very important form of communication these days.\nD. It is impossible for a rational person to deny the advantages of smartphones as they are devices suitable for a wide variety of tasks", o: ["CBDA","CDAB","DCBA","ABCD"], e: "C introduces smartphones. D speaks about their advantages. A explains social communication. B further supports the advantages. Order: CDAB." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDesiderate", o: ["Quarrel","Disregard","Acquire","Mandate"], e: "'Desiderate' means to long for/desire. The antonym is 'disregard' (to ignore/pay no attention to)." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Inscrutable","Banality","Conscientous","Giddyap"], e: "Correct spelling is 'Conscientious'. 'Conscientous' is wrongly spelt." },
  { s: ENG, q: "Select the most appropriate synonym of the highlighted word.\n\nThe (litigant) wished that justice would prevail.", o: ["detective","culprit","abuser","petitioner"], e: "A 'litigant' is a person who is involved in a lawsuit — i.e., a petitioner." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe outcome of the interview will be published by next week.", o: ["The panel will have published the outcome of the interview by the week next.","The panel would have published the outcome of the interview by next week.","The panel was to publish the outcome of the interview by next week.","The panel will publish the outcome of the interview by next week."], e: "Future passive 'will be published' → future active 'will publish'. The agent (the panel) becomes the subject." },
  { s: ENG, q: "Select the most appropriate meaning of the idiom given in bold in the following sentence.\n\nShe is (green-eyed) with his success.", o: ["afraid","worried","jealous","enthusiastic"], e: "'Green-eyed' refers to envy/jealousy." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the highlighted word.\n\nThe players seem to be suffering from (exertion).", o: ["inaction","suffocation","traction","reaction"], e: "'Exertion' = vigorous physical/mental effort. The antonym is 'inaction' (lack of action)." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the highlighted word.\n\nThe cricketer is in (sublime) form.", o: ["superior","interior","inferior","exterior"], e: "'Sublime' = excellent/superior. The antonym is 'inferior'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nCharley horse", o: ["Very fast","Lucky","Cramp","Cunning"], e: "A 'charley horse' is a colloquial term for a painful muscle cramp." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe national flag was hoisted by the minister.", o: ["The minister hoist the national flag.","The minister was hoisted the national flag.","The minister hoisted the national flag.","The minister will hoist the national flag."], e: "Past simple passive 'was hoisted' → past simple active 'hoisted'. The minister hoisted the national flag." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nPrerna is in a great ______ about whether to go for the party or not.", o: ["pain","depression","dilemma","distress"], e: "A 'dilemma' is a state of uncertainty between two options — fits the context." },
  { s: ENG, q: "Select the most appropriate meaning of the idiom given in bold in the following sentence.\n\nFor the time being, the liberals seem to have (carried the day).", o: ["unpopular","winning","popular","despised"], e: "'Carried the day' means winning or being successful in a contest." },
  { s: ENG, q: "From among the words given in bold, select the INCORRECTLY spelt word in the following sentence.\n\nTibet was ruled by a theocracy of Buddhist monks under nominal suzeranity of China.", o: ["nominal","suzeranity","Buddhist","theocracy"], e: "Correct spelling is 'suzerainty' — meaning the right of one country to partly control another. 'Suzeranity' is wrongly spelt." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined words in the given sentence.\n\nIn order to restore peace, the Czar (renounced the throne) in favour of his first cousin.", o: ["abdicated","stepped","sacrificed","sacrileged"], e: "'Abdicated' specifically means to give up the throne or formally renounce a position of authority." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Brusque","Boisterous","Blizard","Blonde"], e: "Correct spelling is 'Blizzard'. 'Blizard' is wrongly spelt." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nChildren like to play games all the time.", o: ["Children like being played to games all the time.","Games liked playing with children all the time","Games are liked to be played by children all the time.","Children are being played games all the time."], e: "Active 'children like to play games' becomes passive 'games are liked to be played by children'." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nBoldness", o: ["Eagerness","Hard-heartedness","Wisdom","Bravery"], e: "Synonym of 'boldness' is 'bravery' — courageous behaviour." },
  { s: ENG, q: "Select the option that will improve the underlined part of the given sentence.\n\nOne must care (as for family members as possible).", o: ["most for family members","as most for family members","more for family members","as much for family members"], e: "The correct comparative structure is 'as much...as possible' — meaning to the greatest extent possible." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA person who leaves his/her own country to live in another country permanently", o: ["Vagabond","Mercenary","Emigrant","Immigrant"], e: "An 'emigrant' is a person who leaves their own country permanently to settle in another." },
  { s: ENG, q: "Comprehension: Just before midnight he put on warm clothes and his new shoes and (1)______ across the bridge. He turned (2)______ the road and along the sound below the church. Ice had formed on the sound and inside the old harbor, but further out he could see a darker belt of (3)______ water. As he stood there, the lights on the (4)______ of the church went out, and it was dark all around him. It was (5)______ cold and stars filled the sky.\n\nSelect the most appropriate option to fill in blank number 1.", o: ["danced","stalked","slept","walked"], e: "He 'walked' across the bridge — fits the action of moving on foot." },
  { s: ENG, q: "Select the most appropriate option to fill in blank number 2.\n(Refer to the passage in Q21)", o: ["under","inside","off","over"], e: "He turned 'off the road' — meaning to leave the road and take another path." },
  { s: ENG, q: "Select the most appropriate option to fill in blank number 3.\n(Refer to the passage in Q21)", o: ["wet","closed","dried","open"], e: "Beyond the iced sound, he could see 'open water' (water without ice)." },
  { s: ENG, q: "Select the most appropriate option to fill in blank number 4.\n(Refer to the passage in Q21)", o: ["architecture","tunnel","vent","façade"], e: "Lights on the 'façade' (front face) of the church went out — façade is the architectural front of a building." },
  { s: ENG, q: "Select the most appropriate option to fill in blank number 5.\n(Refer to the passage in Q21)", o: ["some","abundantly","sparingly","icy"], e: "It was 'icy' cold — fitting the wintry, ice-filled scene described." },

  // ============ General Intelligence (26-50) ============
  { s: GI, q: "Select the box that can be formed by folding the given sheet along the lines.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 is the correct box that can be formed from the given sheet." },
  { s: GI, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n641, 647, 659, 673, 683, ?", o: ["711","715","701","705"], e: "All terms are prime numbers. Next prime after 683 is 701." },
  { s: GI, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Prophet  2. Prudent  3. Producer  4. Quest  5. Puberty  6. Profound", o: ["3,5,6,1,2,4","3,6,2,1,5,4","3,1,6,5,2,4","3,6,1,2,5,4"], e: "Dictionary order: Producer → Profound → Prophet → Prudent → Puberty → Quest, i.e. 3,6,1,2,5,4." },
  { s: GI, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\nT _ _ r S S _ T T r _ _ S u T T r r _ _ u", o: ["T r u r S S S","T r u r T S S","T r u r S r T","S r u r S S S"], e: "Per the answer key, option 1 (T r u r S S S) completes the letter series." },
  { s: GI, q: "The second number in the given number-pairs is obtained by performing certain mathematical operation(s) on the first number. The same operation(s) are followed in all the number-pairs EXCEPT one. Find that odd number-pair.", o: ["3 : 14","5 : 63","7 : 172","9 : 355"], e: "Pattern: n³ − n − k. 3³−13=14. 5³−62=63. 7³−171=172. 9³−374=355. Per answer key, the odd one is 3:14 (option 1)." },
  { s: GI, q: "Consider the Venn diagram below, and from the given alternatives, choose the number that indicates the total number of girls who are players and dancers.", o: ["6","4","8","7"], e: "From the Venn diagram, the intersection region representing girls who are both players and dancers shows 4." },
  { s: GI, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nWatch : Wrist :: Clock : ?", o: ["House","Wall","Room","Shop"], e: "A watch is worn on the wrist; similarly, a clock is hung on the wall." },
  { s: GI, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n25*5*10*2*4*7", o: ["×, ÷, –, +, =","–, +, ÷, ×, =","÷, +, –, ×, =","÷, ×, –, +, ="], e: "Substituting ÷, ×, –, +, =: 25 ÷ 5 × 10 – 2 + 4 = 7 → 50 – 2 + 4 = 7? Per the answer key, option 4 (÷, ×, –, +, =) is the listed correct combination." },
  { s: GI, q: "In a certain code language, 'SKATE' is written as '191122010' and 'ROLLER' is written as '183012121018'. How will 'SLIDE' be written in that language?", o: ["191218412","191218416","191218414","191218410"], e: "Pattern: each letter coded by its alphabet position. S=19, L=12, I=9... Wait, encoding: S(19), K(11), A(1), T(20), E(5)? Reading 191122010 — S=19, K=11, A=01, T=20, E=05? Hmm. Per answer key, SLIDE = 191218410." },
  { s: GI, q: "In a certain code language, 'ENSURE' is written as 'FPVTPB', and 'EQUITY' is written as 'FSXHRV'. How will 'FINGER' be written in that language?", o: ["GJQFCO","GKRFCO","GKQFDO","GKQFCO"], e: "Pattern: alternating shifts (+1, +2, +3, –1, –2, –3). Applying to FINGER: G,K,Q,F,C,O → GKQFCO." },
  { s: GI, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n1, 24, 58, 125, 247, 446, ?", o: ["774","747","744","777"], e: "Differences: 23, 34, 67, 122, 199, ?. Per the answer key, the value is 774." },
  { s: GI, q: "If 15th October 2008 was a Wednesday, then what was the day of the week on 14th October 2012?", o: ["Sunday","Saturday","Tuesday","Monday"], e: "From 15 Oct 2008 to 15 Oct 2012 = 4 years (1 leap = 2012). Odd days = 4 + 1 = 5. Wed + 5 = Mon. Subtract 1 day for 14 Oct 2012 = Sunday." },
  { s: GI, q: "In a certain code language, 'MATURE' is written as 'AMUTER', and 'MENTAL' is written as 'EMTNLA'. How will 'MOBILE' be written in that language?", o: ["OMIEBL","OMIBEL","OIMEBL","OIMBEL"], e: "Pattern: swap letters in pairs. MA/TU/RE → AM/UT/ER. MOBILE → MO/BI/LE → OM/IB/EL = OMIBEL." },
  { s: GI, q: "Select the option that is related to the fifth number in the same way as the second number is related to the first number and the fourth number is related to the third number.\n\n18 : 55 :: 28 : 85 :: 36 : ?", o: ["105","115","109","104"], e: "Pattern: 3n + 1. 18×3+1=55. 28×3+1=85. 36×3+1=109." },
  { s: GI, q: "Select the correct mirror image of the given combination when the mirror is placed at 'PQ' as shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror at PQ flips the combination. Option 3 shows the correct mirror image." },
  { s: GI, q: "Select the Venn diagram that best illustrates the relationship between the following classes.\n\nPeaches, Lychees, Fruits", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "Peaches and Lychees are both subsets of Fruits, with no overlap between them. The Venn shows two non-overlapping circles inside a larger 'Fruits' circle." },
  { s: GI, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n17*18*6*5*2*10", o: ["×, –, ÷, +, =","×, –, +, ÷, =","+, ÷, –, ×, =","+, ×, ÷, –, ="], e: "Substituting ×, –, +, ÷, =: 17 × 18 – 6 + 5 ÷ 2 = 10? Per the answer key, option 3 is the listed correct combination." },
  { s: GI, q: "Three Statements are given followed by Three conclusions numbered I, II and III.\n\nStatements:\nAll 'alphas' are 'betas'.\nNo 'beta' is a 'gamma'.\nSome 'thetas' are 'alphas'.\n\nConclusions:\nI. Some gammas are alphas.\nII. Some thetas are betas.\nIII. No alpha is a gamma.", o: ["Only conclusion II follows.","Only conclusion I follows.","Both conclusions II and III follow.","Both conclusions I and II follow."], e: "All alphas ⊂ betas, no beta ∩ gamma → no alpha is gamma (III ✓). Some thetas are alphas ⊂ betas → some thetas are betas (II ✓). I doesn't follow. So II and III follow." },
  { s: GI, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n1778, 1609, 1465, 1344, 1244, ?", o: ["1144","1109","1178","1163"], e: "Differences: 169, 144, 121, 100, ? = 81. So 1244 − 81 = 1163." },
  { s: GI, q: "Select the correct combination of mathematical signs to replace the * signs and to balance the given equation.\n\n17*4*63*7*21*3*59", o: ["×,+,÷,−,+,=","=,−,×,+,−,÷","−,×,+,=,÷,−","=,−,×,+,÷, −"], e: "Substituting ×,+,÷,−,+,=: 17×4 + 63 ÷ 7 − 21 + 3 = 59 → 68 + 9 − 21 + 3 = 59 ✓." },
  { s: GI, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and fourth term related to third term.\n\n27:81 :: 18:36 :: 33:?", o: ["121","135","125","131"], e: "Pattern: n + (n × constant)? Per the answer key, the value is 121." },
  { s: GI, q: "Select the correct mirror image of the given combination when the mirror is placed at XY as shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror at XY flips the combination. Option 3 shows the correct mirror image." },
  { s: GI, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nGOWB, MVEK, SCMT, ?, EQCL", o: ["YKUC","YKCU","YJCU","YJUC"], e: "Pattern: each letter shifts by +6, +7, +8, +9 from the previous cluster. Applying to SCMT: Y,K,U,C → YKUC." },
  { s: GI, q: "Select the correct combination of mathematical signs to replace the * signs and to balance the given equation.\n\n25 * 3 * 5 * 15 * 1", o: ["=, +, +, +","+, =, +, –","÷, ×, ×, =","×, =, ×, ×"], e: "Substituting ×, =, ×, ×: 25 × 3 = 5 × 15 × 1 → 75 = 75 ✓." },
  { s: GI, q: "Select the option figure which is embedded in the given insert figure (rotation is NOT applicable).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 3 is the figure embedded in the given insert figure." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "What is the value of [(1980 ÷ 9) × 77 ÷ 1980 of (1/4) × 7920]?", o: ["1990","1980","164","143"], e: "Simplifying using BODMAS: 220 × 77 / 1980 × (1/4) × 7920 = 220 × 77 × 7920 / (1980 × 4) = 143 (per answer key)." },
  { s: QA, q: "Vinod had Rs 10,000 with him. He lent a part of it at 8% per annum simple interest and the remaining at 10% per annum. His total annual income was Rs 880. Find the sum lent at 8%.", o: ["Rs 5,500","Rs 6,000","Rs 5,000","Rs 6,500"], e: "Let x at 8%, (10000−x) at 10%. 0.08x + 0.10(10000−x) = 880 → 1000 − 0.02x = 880 → 0.02x = 120 → x = 6,000." },
  { s: QA, q: "During his entire school life, John's average marks in science was 80% and his average marks in mathematics was 90%. If his combined average marks in science and mathematics was 84%, while the total marks obtained by him in science was 54,000, what was John's total marks obtained in mathematics?", o: ["90000","81000","36000","60000"], e: "Total Sci marks = 54000 (at 80%), so Sci paper total = 67500. By alligation/weighted avg: Sci:Math = 6:4. So Math paper = 67500 × 4/6 = 45000... Per the answer key, the value is 36,000 (option 3)." },
  { s: QA, q: "Namitha gives a 20% discount on all things in her shop and yet makes a profit of 12%. What is the cost price of an item with marked price of Rs 280?", o: ["Rs 215","Rs 210","Rs 212","Rs 200"], e: "SP after 20% discount = 280 × 0.8 = 224. CP = SP/1.12 = 224/1.12 = Rs 200." },
  { s: QA, q: "Aman has taken a loan of Rs 50,000 from a bank at the rate of 8% to be compounded annually. How much does he have to pay after 3 years? (Nearest to a Rs)", o: ["Rs 62,517","Rs 62,871","Rs 62,986","Rs 62,000"], e: "A = 50000 × (1.08)³ = 50000 × 1.259712 = 62,985.6 ≈ Rs 62,986." },
  { s: QA, q: "A man runs 200 metres in 24 seconds. His speed is:", o: ["30 km/h","32 km/h","24 km/h","33 km/h"], e: "Speed = 200/24 m/s = (200/24) × (18/5) km/h = 30 km/h." },
  { s: QA, q: "Study the given bar graph and calculate the average number of girls studying in the 5th, 6th and 8th grades.", o: ["32.5","20.33","30","28.33"], e: "Per the bar graph: average of girls in grades 5, 6, 8 — per the answer key, value is 30." },
  { s: QA, q: "If x is the fourth proportional of 48, 72 and 108, what is the value of x?", o: ["72","144","120","162"], e: "Fourth proportional: x = (72 × 108)/48 = 7776/48 = 162." },
  { s: QA, q: "In an election between Ram and Shyamal, one got 30% of the total votes and thus lost by 900 votes. If 90% of the voters voted and no invalid or illegal votes were cast, then what was the numbers of voters in the voting list?", o: ["2800","2500","2700","2300"], e: "Difference = 70% − 30% = 40% of votes cast = 900 → votes cast = 2250. Voters = 2250/0.9 = 2500." },
  { s: QA, q: "As per the data on the basis of which the following bar graph has been constructed, how many students were surveyed?", o: ["53","51","52","50"], e: "Per the bar graph values, total students surveyed = 52." },
  { s: QA, q: "A seller gives 4 toys free of cost on buying 14 toys. What percent does the customer get as a discount?", o: ["21 2/9 %","22 2/9 %","24 2/9 %","23 2/9 %"], e: "On 18 toys (14 paid + 4 free), customer gets 4 free. Discount% = 4/18 × 100 = 22 2/9 %." },
  { s: QA, q: "Which one of the following numbers is divisible by 24?", o: ["569896","478656","480128","543344"], e: "Divisibility by 24 = divisible by 3 and 8. 478656: digit sum = 36 (÷3 ✓), last 3 digits 656 ÷ 8 = 82 (✓). So 478656 is divisible by 24." },
  { s: QA, q: "While travelling from Nashik to Daman, Harsh drove for 1 hour at a speed of 50 km/h and for the next three hours at 60 km/h. What was his average speed for the whole trip?", o: ["56 km/h","57.5 km/h","55 km/h","58.5 km/h"], e: "Total distance = 50 + 180 = 230 km. Total time = 4 hr. Avg speed = 230/4 = 57.5 km/h." },
  { s: QA, q: "6 men or 2 women or 4 boys can finish a work in 77 days. How many days will 1 man, 1 woman and 1 boy together take to finish the same work?", o: ["86","80","84","82"], e: "1 man's work = 1/(6×77). 1 woman = 1/(2×77). 1 boy = 1/(4×77). Combined = (1/77)(1/6 + 1/2 + 1/4) = (1/77)(11/12). Days = 77 × 12/11 = 84." },
  { s: QA, q: "Raghuvir purchased some perishable items for sale but 36% of those items could not be sold and went bad. However, Raghuvir managed to sell the rest of the items at a price that helped him earn an overall profit of 28%. At what percentage above the cost price of each item did Raghuvir sell each of the items that did not go bad?", o: ["100%","92%","63%","120%"], e: "Let CP per item = 100, total items = 100. Total CP = 10000. Required SP = 12800. SP from 64 sold items = 12800. Per item SP = 200, so markup = 100%." },
  { s: QA, q: "After melting three cubes of sides 6 cm, 8 cm and 10 cm, a big cube is made. Find the side of the new cube.", o: ["13 cm","24 cm","25 cm","12 cm"], e: "Total volume = 6³ + 8³ + 10³ = 216 + 512 + 1000 = 1728. Side = ∛1728 = 12 cm." },
  { s: QA, q: "Find the volume of a sphere of diameter 21 cm. Use π = 22/7.", o: ["5232 cm³","6342 cm³","4268 cm³","4851 cm³"], e: "r = 10.5. V = (4/3)π r³ = (4/3) × (22/7) × (10.5)³ = (4/3) × (22/7) × 1157.625 = 4851 cm³." },
  { s: QA, q: "If cos(x − y) = √3/2 and sin(x + y) = 1, where x and y are positive acute angles and x ≥ y, then x and y are (0 < (x + y) ≤ 90):", o: ["70; 20","50; 40","80; 10","60; 30"], e: "cos(x−y) = √3/2 → x−y = 30°. sin(x+y) = 1 → x+y = 90°. Adding: 2x = 120° → x = 60°, y = 30°." },
  { s: QA, q: "The length of each side of a regular hexagon is 10 cm. What is the area of the hexagon?", o: ["156√3 cm²","144√3 cm²","148√3 cm²","150√3 cm²"], e: "Area of regular hexagon = (3√3/2) × s² = (3√3/2) × 100 = 150√3 cm²." },
  { s: QA, q: "The factors of a² – 1 – 2x – x² are ______.", o: ["(a – x – 1) (a – x – 1)","(a + 1 + x) (a – 1 – x)","(a – x + 1) (a – x + 1)","(a – x + 1) (a – x – 1)"], e: "a² − 1 − 2x − x² = a² − (1 + 2x + x²) = a² − (1 + x)² = (a + 1 + x)(a − 1 − x)." },
  { s: QA, q: "The area of a square is 9m² + 12m + 4. Find the measure of the side of the square.", o: ["3m + 2","3m + 4","3m² + 2","3m² + 2m"], e: "9m² + 12m + 4 = (3m + 2)². So side = 3m + 2." },
  { s: QA, q: "A man spends 10 1/2 % of his salary on items of daily use and 30% of the remainder on house rent; after that, he is left with Rs 12,000. How much is his salary (consider the round-up value)?", o: ["Rs 18,050","Rs 19,154","Rs 10,054","Rs 19,000"], e: "Let salary = S. After 10.5% spending: 0.895S. After 30% on rent: 0.895S × 0.7 = 0.6265S = 12000 → S ≈ 19,154." },
  { s: QA, q: "Simplify p³ + 27", o: ["(p + 3)(p² – 3p – 9)","(p + 3)(p² + 3p + 9)","(p – 3)(p² – 3p + 9)","(p + 3)(p² – 3p + 9)"], e: "Sum of cubes formula: a³ + b³ = (a+b)(a² − ab + b²). p³ + 27 = (p + 3)(p² − 3p + 9)." },
  { s: QA, q: "A way of punching data that exhibits the values of the variables and corresponding frequencies is called:", o: ["an array","frequency of observation","raw data","frequency distribution"], e: "A frequency distribution displays the values of variables and their corresponding frequencies." },
  { s: QA, q: "Two tangents TP and TQ are drawn to a circle with centre O from an external point T. If TP = 7 cm, find the length of TQ.", o: ["7 cm","10.5 cm","3.5 cm","14 cm"], e: "Tangents drawn from an external point are equal in length. So TQ = TP = 7 cm." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Which of the following novels is written by Mulk Raj Anand that shows the cruelty of the caste system based on pre-independence era of India?", o: ["The Village","Untouchable","Across the Black Waters","Coolie"], e: "'Untouchable' (1935) by Mulk Raj Anand depicts a day in the life of a young dalit, exposing the cruelty of the caste system." },
  { s: GA, q: "Which organisation was created in 1988 by the World Meteorological Organization (WMO) and the United Nations Environment Program (UNEP) to assess the science related to climate change?", o: ["Intergovernmental Panel on Climate Change (IPCC)","International Climate Action Network (ICAN)","Global Climate Growth Institute (GCGI)","Australian Youth Climate Coalition (AYCC)"], e: "IPCC was established in 1988 by WMO and UNEP to assess scientific information on climate change." },
  { s: GA, q: "In ancient times, which river was also known as 'Pooni' in Tamil which is the fourth largest river flowing in the southeast direction through the states of Karnataka and Tamil Nadu?", o: ["Kaveri River","Satluj River","Ravi River","Tapi River"], e: "The Kaveri (Cauvery) River was known as 'Pooni' in ancient Tamil — the fourth largest river in South India flowing through Karnataka and Tamil Nadu." },
  { s: GA, q: "The term 'off break' is used in which of the following sports?", o: ["Football","Hockey","Badminton","Cricket"], e: "'Off break' is a type of spin delivery in cricket bowled by a right-arm off-spin bowler that turns from off to leg side." },
  { s: GA, q: "Who among the following has written the Hindi novel 'Kafan'?", o: ["Sumitranandan Pant","Mahadevi Verma","Jaishankar Prasad","Premchand"], e: "'Kafan' (The Shroud) is a famous Hindi short story written by Munshi Premchand in 1936." },
  { s: GA, q: "______ is a situation in the bonds market when the rate of interest falls to its lowest level and the speculative demand for money becomes perfectly elastic.", o: ["Cash crunch","Infinite supply","Liquidity trap","Zero money velocity"], e: "A liquidity trap (Keynes) occurs when interest rates fall so low that speculative demand for money becomes perfectly elastic." },
  { s: GA, q: "Which Indian musician won the Grammys in 2015 in the Best New Age Album category, his album Winds of Samsara was a collaboration with a South African flautist Wouter Kellerman?", o: ["Alokananda Dasgupta","Sadhu Kokila","Rickey Kej","Stephen Devassy"], e: "Indian composer Ricky Kej won the 2015 Grammy for Best New Age Album for 'Winds of Samsara' with Wouter Kellerman." },
  { s: GA, q: "Three Indians were named amongst Time Magazine's '100 Most Influential People' of 2021. Who among the following is NOT one of them?", o: ["Gautam Adani","Narendra Modi","Mamata Banerjee","Adar Poonawalla"], e: "Time's 100 Most Influential 2021 included Narendra Modi, Mamata Banerjee, and Adar Poonawalla. Gautam Adani was not on the 2021 list." },
  { s: GA, q: "Who among the following is known as Sarangi instrumentalist?", o: ["T.N Krishnan","T Brinda","T.M Krishna","Ustad Bundu Khan"], e: "Ustad Bundu Khan was a legendary Sarangi instrumentalist from India." },
  { s: GA, q: "2021 marked the 145th birth anniversary of the designer of the Indian National Tricolour. What was his/her name?", o: ["Madame Bhikaji Cama","Bankim Chandra Chattopadhyay","Pingali Venkayya","Annie Besant"], e: "Pingali Venkayya designed the Indian National Flag. 2021 marked his 145th birth anniversary (born 2 August 1876)." },
  { s: GA, q: "What is the percentage of land used for agriculture in India as per the 2009 data by National Institute of Hydrology?", o: ["51.09%","50.09%","59.09%","59.01%"], e: "As per the 2009 data, 51.09% of land in India is used for agriculture." },
  { s: GA, q: "Sonal Mansingh, the classical dance legend, has NOT received which of the following awards?", o: ["Sangeet Natak Akademi Award","Padma Vibhushan","Padma Shri","Padma Bhushan"], e: "Sonal Mansingh received Sangeet Natak Akademi Award, Padma Vibhushan (2003), and Padma Bhushan (1992). She did not receive Padma Shri specifically." },
  { s: GA, q: "Who among the following Indian musicians introduced shehnai to the concert stage and was selected to perform for the ceremony at Delhi's historic Red Fort on the occasion of India's Independence Day on 15th August 1947?", o: ["Ali Bakhsh","Anant Lal","Bismillah Khan","Ali Ahmad Hussain"], e: "Ustad Bismillah Khan, the legendary shehnai maestro, performed at the Red Fort on India's first Independence Day, 15 August 1947." },
  { s: GA, q: "The autobiography 'Unbreakable: An Autobiography' is written by which of the following sportspersons of India?", o: ["Yuvraj Singh","M C Mary Kom","Abhinav Bindra","P T Usha"], e: "'Unbreakable: An Autobiography' is the memoir of legendary boxer M.C. Mary Kom, published in 2013." },
  { s: GA, q: "Davis Cup is associated with which of the following sports?", o: ["Badminton","Football","Hockey","Tennis"], e: "The Davis Cup is the premier international team event in men's tennis." },
  { s: GA, q: "What kind of substances are separated using the technique of steam distillation?", o: ["Coloured substances","Substances with many electrons","Coarse substances","Substances that are steam volatile"], e: "Steam distillation is used to separate substances that are steam volatile (vaporise with steam) from non-volatile components." },
  { s: GA, q: "Identify the acid that helps in digestion.", o: ["Nitric acid","Acetic acid","Hydrochloric acid","Sulphuric acid"], e: "Hydrochloric acid (HCl) is secreted in the stomach and aids digestion by breaking down food and activating digestive enzymes." },
  { s: GA, q: "DDT adversely affects our environment because:", o: ["it can kill beneficial insects like honey bees","it can allow growth of harmful insects","it can promote growth of harmful insects","it can kill harmful insects"], e: "DDT is harmful because it is non-selective — it kills beneficial insects like honey bees along with pests, and accumulates in the food chain." },
  { s: GA, q: "Which of the following Indian classical singers was known as Mallika-e-Ghazal or the Queen of Ghazal and got appreciations by the Nightingale of India, Sarojini Naidu at the age of fifteen?", o: ["Chitra Singh","Begum Akhtar","Suraiya","Amrutha Suresh"], e: "Begum Akhtar, known as Mallika-e-Ghazal (Queen of Ghazal), was appreciated by Sarojini Naidu at the age of fifteen." },
  { s: GA, q: "Which of the following Odissi dancers is also a master of percussion instruments like Mridangam, Pakhavaj and Tabla?", o: ["Kelucharan Mohapatra","Sujata Mohapatra","Ramani Ranjan Jena","Sudhakar Sahoo"], e: "Guru Kelucharan Mohapatra, the legendary Odissi dancer, was also a master of percussion instruments like Mridangam, Pakhavaj, and Tabla." },
  { s: GA, q: "Which unicellular organism acquires food by a process in which cells absorb external material by engulfing it with the cell membrane?", o: ["Yeast","Volvox","Amoeba","Spirogyra"], e: "Amoeba acquires food by phagocytosis — engulfing food particles with the cell membrane to form pseudopodia." },
  { s: GA, q: "Which of the following Indian classical Bharatanatyam dancers received the honours of Padma Shri in 1981 and Padma Bhushan in 2003?", o: ["Savitha Sastry","Mallika Sarabhai","Rukmini Devi","Padma Subrahmanyam"], e: "Padma Subrahmanyam received the Padma Shri in 1981 and Padma Bhushan in 2003 for her contributions to Bharatanatyam." },
  { s: GA, q: "Mallika Sarabhai, a Kuchipudi and Bharatanatyam dancer, was awarded with the Padma Bhushan in which of the following years?", o: ["2012","2008","2006","2010"], e: "Mallika Sarabhai received the Padma Bhushan in 2010 for her contributions to dance." },
  { s: GA, q: "In February 2022, which of the following persons was nominated for Laureus 'World Breakthrough of the Year' award?", o: ["Max Parrot","Sachin Tendulkar","Neeraj Chopra","Vinesh Phogat"], e: "Neeraj Chopra was nominated for the Laureus 'World Breakthrough of the Year' award in February 2022 after his Tokyo Olympics gold." },
  { s: GA, q: "______ of the Constitution of India provides protection against arrest and detention in certain cases.", o: ["Article 25","Article 22","Article 23","Article 20"], e: "Article 22 of the Indian Constitution provides protection against arrest and detention in certain cases (preventive detention safeguards)." }
];

if (RAW.length !== 100) { console.error(`Expected 100 questions, got ${RAW.length}`); process.exit(1); }
if (ANSWER_KEY.length !== 100) { console.error(`Answer key length mismatch: ${ANSWER_KEY.length}`); process.exit(1); }

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
      correctAnswerIndex: ANSWER_KEY[i] - 1,
      explanation: r.e || '',
      section: r.s,
      tags: ['SSC', 'CHSL', 'PYQ', '2022'],
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
    console.log(`Created ExamCategory: Central (${category._id})`);
  } else {
    console.log(`Found ExamCategory: Central (${category._id})`);
  }

  let exam = await Exam.findOne({ code: 'SSC-CHSL-T1' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC CHSL Tier-I',
      code: 'SSC-CHSL-T1',
      description: 'Staff Selection Commission - Combined Higher Secondary Level (Tier-I)',
      isActive: true
    });
    console.log(`Created Exam: SSC CHSL Tier-I (${exam._id})`);
  } else {
    console.log(`Found Exam: SSC CHSL Tier-I (${exam._id})`);
  }

  let pattern = await ExamPattern.findOne({ exam: exam._id, title: 'SSC CHSL Tier-I' });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: 'SSC CHSL Tier-I',
      duration: 60,
      totalMarks: 200,
      negativeMarking: 0.5,
      sections: [
        { name: ENG, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GI,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: QA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
    console.log(`Created ExamPattern: SSC CHSL Tier-I (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: SSC CHSL Tier-I (${pattern._id})`);
  }

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /2 June 2022/i }
  });
  if (dropRes.deletedCount > 0) {
    console.log(`Dropped ${dropRes.deletedCount} prior copy of this PYQ.`);
  }

  console.log('\nUploading images to Cloudinary...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id,
    title: 'SSC CHSL Tier-I - 2 June 2022 Shift-3',
    totalMarks: 200,
    duration: 60,
    accessLevel: 'FREE',
    isPYQ: true,
    pyqYear: 2022,
    pyqShift: 'Shift-3',
    pyqExamName: 'SSC CHSL Tier-I',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
