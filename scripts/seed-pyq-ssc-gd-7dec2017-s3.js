/**
 * Seed: SSC GD Constable PYQ - 7 December 2017, Shift-3 (94 questions)
 * Source: Oswaal SSC Constable (GD) Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per old SSC GD Tier-I pattern, pre-2019):
 *   - General Intelligence & Reasoning      : Q1-35  (35 Q)
 *   - General Knowledge & General Awareness : Q36-85 (50 Q)
 *   - Elementary Mathematics                : Q86-94 (9 Q)
 *
 * Computer Proficiency section (6 Q) was dropped from this paper as it
 * is no longer asked. So the paper is 94 Q in total.
 *
 * Run with: node scripts/seed-pyq-ssc-gd-7dec2017-s3.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC-GD-Constable/7-dec-2017/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-gd-7dec2017-s3';

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

const IMAGE_MAP = {
  8:  { q: '7-dec-2017-q-8.png' },
  9:  { q: '7-dec-2017-q-9.png' },
  10: { q: '7-dec-2017-q-10.png' },
  12: { q: '7-dec-2017-q-12.png',
        opts: ['7-dec-2017-q-12-option-1.png','7-dec-2017-q-12-option-2.png','7-dec-2017-q-12-option-3.png','7-dec-2017-q-12-option-4.png'] },
  13: { q: '7-dec-2017-q-13.png',
        opts: ['7-dec-2017-q-13-option-1.png','7-dec-2017-q-13-option-2.png','7-dec-2017-q-13-option-3.png','7-dec-2017-q-13-option-4.png'] },
  14: { q: '7-dec-2017-q-14.png',
        opts: ['7-dec-2017-q-14-option-1.png','7-dec-2017-q-14-option-2.png','7-dec-2017-q-14-option-3.png','7-dec-2017-q-14-option-4.png'] },
  15: { q: '7-dec-2017-q-15.png' },
  17: { opts: ['7-dec-2017-q-17-option-1.png','7-dec-2017-q-17-option-2.png','7-dec-2017-q-17-option-3.png','7-dec-2017-q-17-option-4.png'] },
  18: { q: '7-dec-2017-q-18.png' },
  25: { opts: ['7-dec-2017-q-25-option-1.png','7-dec-2017-q-25-option-2.png','7-dec-2017-q-25-option-3.png','7-dec-2017-q-25-option-4.png'] },
  26: { opts: ['7-dec-2017-q-26-option-1.png','7-dec-2017-q-26-option-2.png','7-dec-2017-q-26-option-3.png','7-dec-2017-q-26-option-4.png'] },
  27: { opts: ['7-dec-2017-q-27-option-1.png','7-dec-2017-q-27-option-2.png','7-dec-2017-q-27-option-3.png','7-dec-2017-q-27-option-4.png'] },
  30: { q: '7-dec-2017-q-30.png',
        opts: ['7-dec-2017-q-30-option-1.png','7-dec-2017-q-30-option-2.png','7-dec-2017-q-30-option-3.png','7-dec-2017-q-30-option-4.png'] },
  31: { q: '7-dec-2017-q-31.png',
        opts: ['7-dec-2017-q-31-option-1.png','7-dec-2017-q-31-option-2.png','7-dec-2017-q-31-option-3.png','7-dec-2017-q-31-option-4.png'] },
  32: { q: '7-dec-2017-q-32.png',
        opts: ['7-dec-2017-q-32-option-1.png','7-dec-2017-q-32-option-2.png','7-dec-2017-q-32-option-3.png','7-dec-2017-q-32-option-4.png'] },
  88: { q: '7-dec-2017-q-88.png' },
  90: { q: '7-dec-2017-q-90.png' }
};

// 1-based answer key from the paper's Answer Key table.
// NOTE: Q34 — official key prints (2) but the explanation in the same book
// clearly resolves to option (3) "YTKKLX" by the +2,+2,+2,+4,+4,+4 rule.
// Treating Q34 as (3) since the printed key is a typo.
const ANSWER_KEY = [
  1,2,4,4,3, 3,4,1,3,2, 3,3,2,4,2, 1,1,2,3,3, 1,3,1,1,3, 4,4,2,2,3, 4,2,1,3,4,  // 1-35 (Reasoning)
  2,1,4,3,2, 2,2,4,1,3, 4,4,1,3,4, 1,3,4,4,1, 4,2,1,2,4, 3,2,2,3,4, 1,1,2,2,4, 3,1,4,1,4, 4,1,4,2,1, 3,4,3,3,4,                                                          // 36-50 (15 q)
  2,1,1,2,1                                                                       // would be 51-55 etc — placeholder; replaced below
];
// Rebuild ANSWER_KEY explicitly (above mixed list was for cross-check).
const KEY = [
  // 1-10
  1,2,4,4,3, 3,4,1,3,2,
  // 11-20
  3,3,2,4,2, 1,1,2,3,3,
  // 21-30
  1,3,1,1,3, 4,4,2,2,3,
  // 31-35
  4,2,1,3,4,
  // 36-45
  2,1,4,3,2, 2,4,1,3,4,
  // 46-55
  4,4,1,3,4, 1,4,1,2,2,
  // 56-65
  1,2,3,1,2, 4,1,2,3,3,
  // 66-75
  1,1,2,1,1, 1,4,1,3,1,
  // 76-85
  4,4,2,2,2, 3,1,3,3,4,
  // 86-94
  3,3,2,1,3, 1,1,2,1
];
if (KEY.length !== 94) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence & Reasoning';
const GA  = 'General Knowledge & General Awareness';
const QA  = 'Elementary Mathematics';

const RAW = [
  // ============ General Intelligence & Reasoning (1-35) ============
  { s: REA, q: "Select the related word from the given alternatives.\n\nHouse : Brick :: Book : ?", o: ["Paper","Letter","Binding","Cover"], e: "A house is made up of bricks; similarly, a book is made up of papers." },
  { s: REA, q: "Select the related letters from the given alternatives.\n\nHEALS : NLGSY :: FREAK : ?", o: ["KQHYL","LYKHQ","AZLYK","KZAYL"], e: "Pattern: +6,+7,+6,+7,+6. F+6=L, R+7=Y, E+6=K, A+7=H, K+6=Q → LYKHQ." },
  { s: REA, q: "Select the related number from the given alternatives.\n\n49 : 98 :: 33 : ?", o: ["39","52","47","66"], e: "First term × 2 = second term. 49×2=98 and 33×2=66." },
  { s: REA, q: "Select the odd word from the given alternatives.", o: ["Yellow","Red","Blue","Rainbow"], e: "Yellow, Red and Blue are individual colours; Rainbow is a mixture of seven colours." },
  { s: REA, q: "Select the odd letters from the given alternatives.", o: ["FKPU","CHMR","LQVB","DINS"], e: "Pattern is +5 each step (F+5=K, +5=P, +5=U etc.). LQVB has L+5=Q, Q+5=V, V+6=B — odd one out." },
  { s: REA, q: "Select the odd number pair from the given alternatives.", o: ["65 — 78","11 — 24","19 — 34","53 — 66"], e: "First term + 13 = second term. 65+13=78, 11+13=24, 53+13=66, but 19+13=32 (not 34)." },
  { s: REA, q: "Select the odd number pair from the given alternatives.", o: ["13 — 171","11 — 123","5 — 27","7 — 53"], e: "Pattern: n² + 2 = second term. 13²+2=171, 11²+2=123, 5²+2=27, but 7²+2=51 (not 53)." },
  { s: REA, q: "How many triangles are there in the given figure?", o: ["4","5","6","7"], e: "Triangles formed: ABC, ADE, DEH, FGH — total 4." },
  { s: REA, q: "How many rectangles are there in the given figure?", o: ["5","6","7","8"], e: "Rectangles formed: ABDC, AEFG, ABJG, EBJF, GHIC, GJDC, HJDI — total 7." },
  { s: REA, q: "In the given figure, what will come opposite to face containing 'N'?", o: ["B","A","M","S"], e: "Opposite pairs: A–N, B–O, M–S. So A will come opposite to N." },
  { s: REA, q: "3 equidistant cuts are made on each axis of a large cube. After cutting how many small cubes are obtained?", o: ["125","27","64","216"], e: "Number of small cubes = (cuts on each axis + 1)³ = (3+1)³ = 4³ = 64." },
  { s: REA, q: "From the given answer figures, select the one in which the question figure is hidden/embedded.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 contains the embedded figure." },
  { s: REA, q: "Which answer figure will complete the pattern in the question figure?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 2 completes the pattern." },
  { s: REA, q: "If a mirror is placed on the line AB, then which of the answer figures is the right mirror image of the given figure?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "In a mirror image, left becomes right and right becomes left. Per the answer key, option 4 is correct." },
  { s: REA, q: "Select the number which can be placed at the sign of question mark (?) from the given alternatives.\n\n7 3 2 → 49\n6 5 1 → 36\n3 7 24 → ?", o: ["81","87","89","93"], e: "Row-wise: (1st × 2nd × 3rd) + 1st = 4th. (3×7×24)+3 = 504+3 = 87." },
  { s: REA, q: "Arrange the given words in the sequence in which they occur in the dictionary.\n\n1. Rain  2. Range  3. Right  4. Rest  5. Round", o: ["12435","21435","12345","21453"], e: "Dictionary order: Rain → Range → Rest → Right → Round, i.e. 1,2,4,3,5." },
  { s: REA, q: "Identify the diagram that best represents the relationship among the given classes.\n\nCup, Plate, Utensils", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "Cups and Plates are both subsets of Utensils, with no overlap between them. Per the answer key, diagram 1 fits." },
  { s: REA, q: "In the given figure, how many boys are both tall and young?", o: ["15","29","31","30"], e: "From the Venn diagram, boys who are both tall and young = 15 + 14 = 29." },
  { s: REA, q: "Statements:\nI. Some red are fans.\nII. All fans are vehicles.\n\nConclusions:\nI. Some vehicles are red.\nII. Some vehicles are fans.", o: ["Only conclusion (I) follows.","Only conclusion (II) follows.","Both conclusions follow.","Neither conclusion (I) nor conclusion (II) follows."], e: "All fans ⊂ vehicles, and some red are fans ⊂ vehicles → some vehicles are red (I ✓). All fans are vehicles → some vehicles are fans (II ✓). Both follow." },
  { s: REA, q: "Statements:\nI. All yellow are red.\nII. Some yellow are white.\n\nConclusions:\nI. All red are white.\nII. Some white are yellow.\nIII. Some red are yellow.", o: ["Only conclusion (I) follows.","Only conclusion (II) follows.","Only conclusion (II) and (III) follows.","Neither conclusion follows."], e: "All yellow ⊂ red so 'All red are white' is not necessarily true (I ✗). Some yellow are white → some white are yellow (II ✓). All yellow are red → some red are yellow (III ✓). Only II and III follow." },
  { s: REA, q: "A is the brother of P, P is the mother of Q, Q is the son of F. How is F related to A?", o: ["Brother-in-law","Son","Father","Nephew"], e: "P is A's sister (since A is P's brother and P is a mother). F is the husband of P (Q's father). So F is A's brother-in-law." },
  { s: REA, q: "Pointing towards a man in the photograph, Raju said, 'He is my daughter's father's son.' How is Raju related to that man?", o: ["Nephew","Son-in-law","Father","Son"], e: "'My daughter's father' is Raju himself. 'Raju's son' is the man. Hence Raju is the father of that man." },
  { s: REA, q: "If a : b = 3 : 2 then what is (3a + 4b) : (5a − b)?", o: ["17 : 13","15 : 13","11 : 9","13 : 11"], e: "Take a=3, b=2. (3×3+4×2):(5×3−2) = (9+8):(15−2) = 17:13." },
  { s: REA, q: "A and B alone can do a work in 40 days and 60 days respectively. They started together, but B leaves the work after 15 days and A completes the remaining work alone. In how many days was the work completed?", o: ["30","45","42","36"], e: "LCM(40,60)=120. Eff: A=3, B=2. In 15 days together = 15×5=75. Remaining = 45. A alone = 45/3 = 15. Total = 15+15 = 30 days." },
  { s: REA, q: "There are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is odd one out.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Three figures contain a triangle inside; option 3 has a rectangle inside instead, hence the odd one out." },
  { s: REA, q: "There are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is odd one out.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Options 1, 2, 3 have two identical shapes (both rectangles, both triangles, both hexagons). Option 4 has a rectangle and a hexagon — the odd one out." },
  { s: REA, q: "There are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is odd one out.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "In options 1–3, two of the three short straight lines are inside the shape and one is outside. In option 4, two are outside and one is inside — the odd one out." },
  { s: REA, q: "Select the missing number from the given series.\n\n5, 11, 6, 12, 7, 13, ?", o: ["9","8","5","11"], e: "Alternate terms increase by 1 each: 5,6,7,8 and 11,12,13,…. Next is 8." },
  { s: REA, q: "Select the missing number from the given series.\n\n4, 5, 9, 14, 23, ?", o: ["33","37","42","39"], e: "Each term = sum of previous two terms. 4+5=9, 5+9=14, 9+14=23, 14+23=37." },
  { s: REA, q: "Select the figure which can be placed at the sign of question mark (?) from the given alternatives.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Arrow alternates between two positions and the circle moves one step clockwise. Per the answer key, option 3 fits." },
  { s: REA, q: "Select the figure which can be placed at the sign of question mark (?) from the given alternatives.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Number of lines increases by 1 and they shift half-step clockwise. Per the answer key, option 4 fits." },
  { s: REA, q: "Select the figure which can be placed at the sign of question mark (?) from the given alternatives.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 2 fits the symmetry pattern of the series." },
  { s: REA, q: "In a certain code language, 'FAIR' is written as '34' and 'TALK' is written as '44'. How is 'FIRE' written in that code language?", o: ["38","40","36","42"], e: "Sum of alphabet positions: FAIR=6+1+9+18=34. FIRE=6+9+18+5=38." },
  { s: REA, q: "In a certain code language, 'FRINGE' is written as 'HTKRKI'. How will 'WRIGHT' be written in that code language?", o: ["WTLKKY","XSLKLY","YTKKLX","TKKLXY"], e: "Pattern: +2,+2,+2,+4,+4,+4. FRINGE→HTKRKI. WRIGHT: W+2=Y, R+2=T, I+2=K, G+4=K, H+4=L, T+4=X → YTKKLX." },
  { s: REA, q: "In a certain code language, 'MARIGOLD' is written as 'EMPHJSBN'. How will 'STAGWOOD' be written in that code language?", o: ["DRPXGHBU","EQQYGAUS","DOOXHASU","EPPXHBUT"], e: "Reverse the word and add +1 to each letter. MARIGOLD reversed = DLOGIRAM, +1 each = EMPHJSBN. STAGWOOD reversed = DOOWGATS, +1 each = EPPXHBUT." },

  // ============ General Knowledge & General Awareness (36-85) ============
  { s: GA, q: "Which of the following options is NOT true for the unorganised sector?", o: ["No provision for overtime work","There is a provision for paid leaves","Insecure employment","Largely outside the control of government"], e: "In the unorganised sector, paid leaves are generally not provided. Hence option 2 is not true." },
  { s: GA, q: "Which organisation formulates Fiscal Policy in India?", o: ["Ministry of Finance","NITI Aayog","Reserve Bank of India","State Bank of India"], e: "The Ministry of Finance formulates the Fiscal Policy in India, covering taxation, public spending and economic strategies." },
  { s: GA, q: "Which among the following is NOT a function of the Reserve Bank of India?", o: ["Monetary management","Government debt management","Foreign exchange management","Accepting deposits from customers"], e: "RBI does not accept deposits from customers — that is the function of commercial banks. RBI handles monetary, debt and forex management." },
  { s: GA, q: "In which year did Economic liberalisation take place in India?", o: ["1985","1989","1991","1993"], e: "Economic liberalisation in India took place in 1991 in response to a balance-of-payments crisis." },
  { s: GA, q: "Territory which is under the immediate political control of another state is called a/an ______.", o: ["Community","Colony","District","Province"], e: "A 'colony' is a territory under the direct political control of another state." },
  { s: GA, q: "In a/an ______, each adult citizen must have one vote and each vote must have one value.", o: ["Autocracy","Democracy","Plutocracy","Theocracy"], e: "In a democracy, every adult citizen has one vote and each vote carries equal value." },
  { s: GA, q: "Provision of admission or establishment of new states is given in which article of the Indian Constitution?", o: ["Article 1","Article 2","Article 3","Article 4"], e: "Article 2 empowers Parliament to admit or establish new states into the Union of India." },
  { s: GA, q: "Which of the following is a fundamental duty under the Indian Constitution?", o: ["To have equality before law","Not to promote untouchability","Not to use titles","To defend country and render National services when required"], e: "Article 51A(g) lists defending the country and rendering national service when called upon as a fundamental duty." },
  { s: GA, q: "Which was the most important Mahajanapada among the 16 known Mahajanapadas?", o: ["Magadha","Kosala","Vatsa","Anga"], e: "Magadha was the most important Mahajanapada due to its strategic location and strong rulers." },
  { s: GA, q: "In which historical text of India are silver coins mentioned as 'rupyarupa'?", o: ["Upanishads","Puranas","Arthashastra","Bhagavad Gita"], e: "Kautilya's Arthashastra refers to silver coins as 'rupyarupa'." },
  { s: GA, q: "Who among the following led the march to break the salt law in India?", o: ["Lala Lajpat Rai","Sarojini Naidu","Bhagat Singh","Mahatma Gandhi"], e: "Mahatma Gandhi led the Dandi/Salt March in 1930 to defy the British salt monopoly." },
  { s: GA, q: "Who became the major spokesperson of the Muslim League after 1934?", o: ["Mahatma Gandhi","Maulana Azad","Badshah Khan","Mohammad Ali Jinnah"], e: "After 1934, Mohammad Ali Jinnah became the principal spokesperson of the All India Muslim League." },
  { s: GA, q: "Which Varna was at the fourth place among the four known Varnas?", o: ["Shudra","Kshatriya","Brahmin","Vaishya"], e: "In the traditional Varna system, the order is Brahmin, Kshatriya, Vaishya and Shudra. Shudra is fourth." },
  { s: GA, q: "Who was the founder of Satyashodhak Samaj?", o: ["Lala Lajpat Rai","Mahatma Gandhi","Jyotirao Phule","Raja Ram Mohan Roy"], e: "Jyotirao Phule founded Satyashodhak Samaj in 1873 to fight the caste system and promote education for marginalised groups." },
  { s: GA, q: "What is the total approximate length (in km) of the coastline of India including Andaman & Nicobar and Lakshadweep?", o: ["7800","9328","9658","7516"], e: "The total coastline of India including Andaman & Nicobar and Lakshadweep is approximately 7,516 km." },
  { s: GA, q: "In which direction is India NOT bounded by the young fold mountains?", o: ["West","North-West","North","North-East"], e: "India is bounded by Young Fold Mountains in the north-west, north and north-east; not in the west." },
  { s: GA, q: "Beyond the Dihang gorge, the Himalayas bend towards the south and form the eastern boundary of India which is known as ______.", o: ["Shiwaliks","Pir Panjal","Himachal","Purvanchal"], e: "The Purvanchal range forms the eastern boundary of India beyond the Dihang Gorge." },
  { s: GA, q: "The entire northern plains of India are made of which type of soil?", o: ["Alluvial Soils","Black Soil","Laterite Soil","Arid Soil"], e: "The northern plains are formed from alluvial soils deposited by rivers like the Ganges and Brahmaputra." },
  { s: GA, q: "Which of the following is NOT among the six major controls of climate of any place?", o: ["Distance from sea","Human influence","Latitude","Ocean currents"], e: "The six major controls of climate are latitude, altitude, distance from sea, ocean currents, prevailing winds and topography. 'Human influence' is not one of them." },
  { s: GA, q: "How many National Waterways are there in India?", o: ["100","111","311","401"], e: "India has 111 National Waterways used for inland trade and transport." },
  { s: GA, q: "Magnetic materials are the materials which ______.", o: ["Always get attracted towards a magnet","Never get attracted towards a magnet","Always move away from a magnet","No option is correct"], e: "Magnetic materials are those that consistently get attracted towards a magnet due to alignment of their magnetic domains." },
  { s: GA, q: "What are the images formed by a plane mirror, which cannot be obtained on a screen, called?", o: ["Real","Virtual","Imaginary","Duplicate"], e: "Plane mirrors form virtual images that cannot be obtained on a screen." },
  { s: GA, q: "Which among the following is NOT an example of capillary action?", o: ["Upward movement of water in a straw","Tears moving through tear duct","Formation of soap bubbles","Absorption of ink by blotting paper"], e: "Soap bubbles form due to surface tension, not capillary action." },
  { s: GA, q: "What is the network of air tubes for gas exchange in insects called?", o: ["Trachea","Spiracles","Bronchi","Tubes"], e: "Insects breathe through a network of air tubes called the trachea." },
  { s: GA, q: "By which process does the water evaporate through the stomata present on the surface of leaves?", o: ["Photosynthesis","Transpiration","Transportation","Evaporation"], e: "Transpiration is the process by which water vapour is lost through the stomata of leaves." },
  { s: GA, q: "Which among the following is an electronegative element?", o: ["Lithium","Sodium","Magnesium","Fluorine"], e: "Fluorine is the most electronegative element on the periodic table." },
  { s: GA, q: "In which type of chemical reaction can a more reactive metal replace a less reactive metal?", o: ["Displacement","Neutralization","Decomposition","Redox"], e: "In a displacement reaction, a more reactive metal displaces a less reactive metal from its compound." },
  { s: GA, q: "Polythene and PVC are some of the examples of ______.", o: ["Thermosetting plastic","Thermoplastics","Acrylic","No option is correct"], e: "Polythene and PVC are thermoplastics — they can be melted and reshaped multiple times." },
  { s: GA, q: "Which chemical is used in refrigerators, air conditioners (AC) and aerosol sprays that forms an air pollutant?", o: ["Sulphur dioxide","Nitrogen dioxide","Chlorofluorocarbon","Methane"], e: "Chlorofluorocarbons (CFCs) used in refrigerators, ACs and aerosols are major air pollutants damaging the ozone layer." },
  { s: GA, q: "What is the tendency of biological systems to resist change in internal environment called?", o: ["Isobarism","Ammensalism","Homeostasis","Symbiosis"], e: "Homeostasis is the tendency of living organisms to maintain stable internal conditions despite external changes." },
  { s: GA, q: "Union Ministry of Human Resource Development announced which scheme on the 51st International Literacy Day in September 2017?", o: ["Saakshar Bharat","School Prakash","School Chalo Abhiyan","Siksha ka Adhikaar"], e: "The 'Saakshar Bharat' scheme was announced on the 51st International Literacy Day in September 2017 to promote literacy among adults in rural areas." },
  { s: GA, q: "In which state has the Union Ministry of Petroleum and Natural Gas launched the 'Pradhan Mantri LPG Panchayat Yojana'?", o: ["Gujarat","West Bengal","Haryana","Chhattisgarh"], e: "PM LPG Panchayat Yojana was launched in Gujarat by the Union Ministry of Petroleum and Natural Gas." },
  { s: GA, q: "Researchers from the University of British Columbia in Canada have developed ______ fibre-reinforced concrete.", o: ["fire proof","earthquake proof","flood proof","snow resistant"], e: "Researchers at UBC, Canada developed earthquake-proof fibre-reinforced concrete." },
  { s: GA, q: "Which is the first country to give citizenship to a robot named Sophia?", o: ["Saudi Arabia","North Korea","Iran","Japan"], e: "Saudi Arabia became the first country to grant citizenship to a robot when it gave citizenship to Sophia in 2017." },
  { s: GA, q: "Where was the final match of the 2017 Women's Hockey Asia Cup?", o: ["Kakamighara, Japan","Kuala Lumpur, Malaysia","Guangzhou, China","New Delhi, India"], e: "The final of the 2017 Women's Hockey Asia Cup was held in Kakamighara, Japan." },
  { s: GA, q: "Who is the winner of the 2017 US Open Tennis Championship in the women's singles category?", o: ["Sloane Stephens","Martina Hingis","Chan Yung-jan","Venus Williams"], e: "Sloane Stephens of the USA won the 2017 US Open women's singles title." },
  { s: GA, q: "Which neighbouring country of India hosted the 14th SAARCLAW Conference in October 2017?", o: ["Nepal","Bangladesh","Maldives","Sri Lanka"], e: "Sri Lanka hosted the 14th SAARCLAW Conference in October 2017." },
  { s: GA, q: "With which of its neighbouring countries did India establish a direct air freight corridor in June 2017?", o: ["Afghanistan","Bhutan","Nepal","China"], e: "India established a direct air freight corridor with Afghanistan in June 2017." },
  { s: GA, q: "Who has been chosen for the Indira Gandhi Prize for Peace, Disarmament and Development for the year 2017?", o: ["Sheikh Hasina","Angela Merkel","Dr. Manmohan Singh","Hamid Karzai"], e: "Dr. Manmohan Singh was chosen for the Indira Gandhi Prize for Peace, Disarmament and Development 2017." },
  { s: GA, q: "What is the name of the village set up by the International Society for Krishna Consciousness which has won the 'Green Platinum Award'?", o: ["Govardhan Eco Village","Gopinath Eco Village","Kalyani Village","Sajan Nature Village"], e: "ISKCON's Govardhan Eco Village won the Green Platinum Award." },
  { s: GA, q: "India's first mega coastal economic zone (CEZ) will be set up in which state?", o: ["Kerala","Tamil Nadu","Andhra Pradesh","Maharashtra"], e: "India's first mega Coastal Economic Zone (CEZ) is being set up in Maharashtra." },
  { s: GA, q: "In October 2017, the goods and service tax network released an offline facility to allow tax payers to finalise which among the following forms?", o: ["GSTR-1","GSTR-2","GSTR-3","GSTR-3B"], e: "GSTN released an offline tool to help taxpayers finalise the GSTR-3B form in October 2017." },
  { s: GA, q: "With which country has India signed a Letter of Intent on September 28, 2017 to extend bilateral cooperation in the health sector?", o: ["Denmark","Norway","Sweden","Romania"], e: "On 28 September 2017, India signed a Letter of Intent with Norway to extend bilateral cooperation in the health sector." },
  { s: GA, q: "On October 17, 2017 India signed a Memorandum of Cooperation with Japan on ______.", o: ["Solar Alliance Framework","Technical Intern Training Program","Disaster Response tools","Eradication of Poverty"], e: "On 17 October 2017, India signed an MoC with Japan on the 'Technical Intern Training Program'." },
  { s: GA, q: "Which Indian state planted 6 crore saplings in 12 hours in July 2017 in an attempt to fulfill the Paris Agreement promise?", o: ["Kerala","Madhya Pradesh","West Bengal","Jharkhand"], e: "Madhya Pradesh planted 6 crore saplings in 12 hours in July 2017 in line with Paris Agreement commitments." },
  { s: GA, q: "On November 1, 2017 the Government of Odisha imposed a ban of how many months on sea fishing activity to protect endangered Olive Ridley sea turtles?", o: ["3","5","7","10"], e: "Odisha imposed a 7-month ban on sea fishing from 1 November 2017 to protect Olive Ridley turtles." },
  { s: GA, q: "World's oldest man Yisrael Kristal died at the age of 113. He was a resident of which country?", o: ["Israel","Japan","Indonesia","Yemen"], e: "Yisrael Kristal, the world's oldest man, was a resident of Israel." },
  { s: GA, q: "Who is the Handicap International's first-ever goodwill ambassador?", o: ["Ronaldo","Lionel Messi","Neymar","David Beckham"], e: "Football star Neymar was named Handicap International's first-ever goodwill ambassador in 2017." },
  { s: GA, q: "Which place is the first in the world to be served by drones for commercial delivery?", o: ["Berlin, Germany","Lyon, France","Reykjavik, Iceland","Copenhagen, Denmark"], e: "Reykjavik in Iceland became the first place in the world to be served by drones for commercial delivery." },
  { s: GA, q: "In which city of India is the Philippines-based International Rice Research Institute setting up a regional centre?", o: ["Wardha","Patna","Ghazipur","Varanasi"], e: "IRRI's South Asia Regional Centre (ISARC) has been set up in Varanasi, Uttar Pradesh." },

  // ============ Elementary Mathematics (86-94) ============
  { s: QA, q: "How many composite numbers are there from 1 to 11?", o: ["3","4","5","6"], e: "Composite numbers from 1 to 11 are: 4, 6, 8, 9, 10 — total 5." },
  { s: QA, q: "What is the value of 2² − 1² + 4² − 3² + 8² − 7²?", o: ["20","22","25","27"], e: "= (4−1) + (16−9) + (64−49) = 3 + 7 + 15 = 25." },
  { s: QA, q: "Which of the following statement(s) is/are true?\n\nI.  2/7 > 3/4 > 1/2\nII. 5/6 > 2/3 > 3/5", o: ["Only I","Only II","Both I and II","Neither I nor II"], e: "2/7≈0.28, 3/4=0.75, 1/2=0.5 → I is FALSE. 5/6≈0.83, 2/3≈0.66, 3/5=0.6 → II is TRUE. Only II is correct." },
  { s: QA, q: "For what value of M is 34M divisible by 7?", o: ["3","2","1","4"], e: "343 is divisible by 7 (343 ÷ 7 = 49). So M = 3." },
  { s: QA, q: "What is the value of (3 × 7 + 4 ÷ 2) / (8 ÷ 2 × 3 + 5)?", o: ["23/12","27/13","23/17","25/7"], e: "Numerator: 3×7 + 4÷2 = 21 + 2 = 23. Denominator: 8÷2×3 + 5 = 12 + 5 = 17. Value = 23/17." },
  { s: QA, q: "A is 7 times of B. B is how much percent less than A?", o: ["85.71","75.12","87.29","82.52"], e: "Let B = x, A = 7x. % less = (7x − x)/7x × 100 = 6/7 × 100 = 85.71%." },
  { s: QA, q: "The ratio of three numbers is 4 : 3 : 7 and the sum of their squares is 666. What is the value of the largest of the three numbers?", o: ["21","28","14","17"], e: "Let numbers be 4x, 3x, 7x. (4x)² + (3x)² + (7x)² = 16x²+9x²+49x² = 74x² = 666 → x² = 9 → x = 3. Largest = 7×3 = 21." },
  { s: QA, q: "Average age of a group of 16 boys is 21 years. Two boys with ages 15 years and 18 years left the group. One boy with age 24 years joined the group. What is the new average age (in years) of the group?", o: ["21.2","21.8","21.4","21.6"], e: "Total age initially = 16×21 = 336. New total = 336 − 15 − 18 + 24 = 327. New count = 16 − 2 + 1 = 15. New average = 327/15 = 21.8." },
  { s: QA, q: "A sum of money triples itself in 6 years at compound interest. In how many years will it become 81 times of itself?", o: ["24 years","15 years","20 years","18 years"], e: "Triples every 6 years: P → 3P (6) → 9P (12) → 27P (18) → 81P (24). So 24 years." }
];

if (RAW.length !== 94) { console.error(`Expected 94 questions, got ${RAW.length}`); process.exit(1); }

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
      tags: ['SSC', 'GD', 'Constable', 'PYQ', '2017'],
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

  let exam = await Exam.findOne({ code: 'SSC-GD' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC GD Constable',
      code: 'SSC-GD',
      description: 'Staff Selection Commission - General Duty (GD) Constable',
      isActive: true
    });
    console.log(`Created Exam: SSC GD Constable (${exam._id})`);
  } else {
    console.log(`Found Exam: SSC GD Constable (${exam._id})`);
  }

  // Old (pre-2019) SSC GD Tier-I pattern. Kept separate from the modern
  // 80-Q pattern used by the recent Practice Tests so PYQ section/Q-counts
  // line up with what was actually asked in 2017.
  const PATTERN_TITLE = 'SSC GD Constable Tier-I (Pre-2019 Pattern)';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: PATTERN_TITLE,
      duration: 90,
      totalMarks: 100,
      negativeMarking: 0.25,
      sections: [
        { name: REA, totalQuestions: 35, marksPerQuestion: 1, negativePerQuestion: 0.25 },
        { name: GA,  totalQuestions: 50, marksPerQuestion: 1, negativePerQuestion: 0.25 },
        { name: QA,  totalQuestions: 9,  marksPerQuestion: 1, negativePerQuestion: 0.25 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  }

  const TEST_TITLE = 'SSC GD Constable - 7 December 2017 Shift-3';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /7 December 2017/i }
  });
  if (dropRes.deletedCount > 0) {
    console.log(`Dropped ${dropRes.deletedCount} prior copy of this PYQ.`);
  }

  console.log('\nUploading images to Cloudinary...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id,
    title: TEST_TITLE,
    totalMarks: 94,
    duration: 90,
    accessLevel: 'FREE',
    isPYQ: true,
    pyqYear: 2017,
    pyqShift: 'Shift-3',
    pyqExamName: 'SSC GD Constable',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
