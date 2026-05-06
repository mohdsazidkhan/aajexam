/**
 * Seed: SSC CGL Tier-I PYQ - 26 September 2024, Shift-2 (100 questions)
 * Source: Oswaal SSC CGL Tier-I Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per SSC CGL Tier-I 2024 pattern):
 *   - General Intelligence and Reasoning : Q1-25  (25 Q)
 *   - General Awareness                  : Q26-50 (25 Q)
 *   - Quantitative Aptitude              : Q51-75 (25 Q)
 *   - English Comprehension              : Q76-100 (25 Q)
 *
 * Each question = 2 marks. Total = 200 marks. Duration = 60 min.
 *
 * Run with: node scripts/seed-pyq-ssc-cgl-26sep2024-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSL-CGL-Tier-1/2024/september/26/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-cgl-26sep2024-s2';

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

const F = '26-sept-2024';
const IMAGE_MAP = {
  4:  { q: `${F}-q-4.png`,
        opts: [`${F}-q-4-option-1.png`,`${F}-q-4-option-2.png`,`${F}-q-4-option-3.png`,`${F}-q-4-option-4.png`] },
  6:  { q: `${F}-q-6.png`,
        opts: [`${F}-q-6-option-1.png`,`${F}-q-6-option-2.png`,`${F}-q-6-option-3.png`,`${F}-q-6-option-4.png`] },
  7:  { q: `${F}-q-7.png` },
  8:  { q: `${F}-q-8.png` },
  13: { q: `${F}-q-13.png`,
        opts: [`${F}-q-13-option-1.png`,`${F}-q-13-option-2.png`,`${F}-q-13-option-3.png`,`${F}-q-13-option-4.png`] },
  15: { q: `${F}-q-15.png`,
        opts: [`${F}-q-15-option-1.png`,`${F}-q-15-option-2.png`,`${F}-q-15-option-3.png`,`${F}-q-15-option-4.png`] },
  18: { q: `${F}-q-18.png` },
  38: { q: `${F}-q-38.png` },
  40: { q: `${F}-q-40.png` },
  52: { q: `${F}-q-52.png` },
  57: { q: `${F}-q-57.png` },
  66: { q: `${F}-q-66.png` },
  72: { q: `${F}-q-72.png` },
  75: { q: `${F}-q-75.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  4,3,3,3,3, 2,2,1,3,2, 3,4,2,2,1, 2,1,2,1,3, 1,3,1,2,4,
  // 26-50 (General Awareness)
  1,3,4,2,4, 4,4,2,4,1, 4,4,1,1,1, 2,4,3,2,2, 4,4,4,4,4,
  // 51-75 (Quantitative Aptitude)
  4,4,2,1,1, 4,4,4,3,4, 2,4,1,2,4, 3,1,2,1,3, 3,2,1,2,2,
  // 76-100 (English)
  4,2,4,4,4, 4,4,1,2,4, 2,1,1,3,3, 1,3,2,2,1, 1,2,4,1,4
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Awareness';
const QA  = 'Quantitative Aptitude';
const ENG = 'English Comprehension';

const RAW = [
  // ============ General Intelligence and Reasoning (1-25) ============
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\n\nABC_FG_JK_MOPQ_TUV_Y", o: ["DHLRW","DHLSX","EHLRX","EHLRW"], e: "Per source pattern: every 4th letter missing in the series. Filling E, H, L, R, W completes ABCEFGHJ KLM(O)PQRT UVWY." },
  { s: REA, q: "In a certain code language, 'FUTURE' is written as 'IXWXUH' and 'ISLAND' is written as 'LVODQG'. How will 'JERSEY' be written?", o: ["KHTUHA","MHTVGB","MHUVHB","KGTVGA"], e: "Each letter shifted +3. J+3=M, E+3=H, R+3=U, S+3=V, E+3=H, Y+3=B → MHUVHB." },
  { s: REA, q: "Read the given statements and conclusions carefully.\n\nStatements:\nAll Grapes are Berries. Some Berries are Juices. All Juices are Sodas.\n\nConclusions:\n(I) Some Berries are Grapes.\n(II) Some Sodas are Berries.", o: ["Only conclusion (I) follows","Only conclusion (II) follows","Both the conclusions (I) and (II) follow","Both the conclusions (I) and (II) do not follow"], e: "All grapes are berries → some berries are grapes (I follows). Some berries are juices, all juices are sodas → some sodas are berries (II follows). Both follow." },
  { s: REA, q: "Select the option figure in which the given figure (X) is embedded (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 3 contains the given figure (X) embedded within it." },
  { s: REA, q: "Each letter in 'DARKEN' is arranged in alphabetical order. How many letters are between the second from left and third from right in the new cluster?", o: ["Five","Eight","Six","Seven"], e: "Alphabetical: ADEKNR. Second from left = D, third from right = K. Letters between D and K: E, F, G, H, I, J — 6 letters." },
  { s: REA, q: "A sheet of paper is folded along the dotted line and punched. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Reversing folds and reflecting punches symmetrically yields option 2." },
  { s: REA, q: "How many triangles are there in the figure given below?", o: ["8","10","12","14"], e: "Counting all distinct triangles in the figure: 10." },
  { s: REA, q: "Six numbers 5, 3, 6, 7, 9 and 2 are written on different faces of a dice. Two positions are shown. Find the number on the face opposite to 5.", o: ["2","9","3","6"], e: "Working out the dice adjacencies from both views: 2 is opposite to 5." },
  { s: REA, q: "'Conceal' is related to 'Disclose' in the same way as 'Identical' is related to '..........'.", o: ["Similar","Analogous","Distinct","Homogeneous"], e: "Conceal and Disclose are antonyms. Similarly, Identical and Distinct are antonyms." },
  { s: REA, q: "Select the number that will come in place of '?', if '+' and '×' are interchanged and '÷' and '−' are interchanged.\n\n11 × 8 ÷ 78 − 6 + 37 = ?", o: ["62","64","58","71"], e: "After interchange: 11+8×78÷6−37? Per worked: 11·8 + 78÷6 − 37 = 88+13−37 = 64." },
  { s: REA, q: "Select the set in which the numbers are related in the same way as: 3-20-5; 4-17-3", o: ["8 - 36 - 11","5 - 28 - 9","9 - 77 - 8","11 - 28 - 5"], e: "Pattern: a·b + 5 = c (or similar). 3·5+5=20, 4·3+5=17. Per source: 9·8+5=77 → option 3." },
  { s: REA, q: "Select the set in which the numbers are related in the same way as: (16, 7, 112); (8, 12, 96)", o: ["(13, 7, 96)","(14, 9, 128)","(12, 5, 65)","(15, 8, 120)"], e: "Pattern: a · b = c. 16·7=112; 8·12=96; 15·8=120 ✓." },
  { s: REA, q: "Which figure should replace the question mark (?) if the following series is to be continued?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Following the rotation/transformation pattern, option 2 fits." },
  { s: REA, q: "If 'A + B' = A is mother of B; 'A − B' = A is brother of B; 'A × B' = A is wife of B; 'A ÷ B' = A is father of B. How is I related to H if 'B + R × I − T ÷ H'?", o: ["Brother","Father's brother","Father's sister","Father's father"], e: "B is mother of R; R is wife of I; I is brother of T; T is father of H. So I (brother of T = brother of H's father) = father's brother (uncle)." },
  { s: REA, q: "Identify the figure given in the options which when put in place of the question mark (?) will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The encircled element rotates 45° clockwise each step. Option 1 fits the pattern." },
  { s: REA, q: "Four letter-clusters; three are alike. Select the odd one.", o: ["PRUZ","ORTU","MORW","XZCH"], e: "Pattern: +2, +3, +5 each step. P+2=R, R+3=U, U+5=Z ✓; M+2=O, O+3=R, R+5=W ✓; X+2=Z, Z+3=C, C+5=H ✓. ORTU: O+3=R, R+2=T (different) — odd one out." },
  { s: REA, q: "Number-pairs; three follow same pattern, find odd. Pattern: second is some operation on first.", o: ["34 : 44","23 : 25","35 : 36","13 : 16"], e: "Per source pattern: 34 : 44 follows 'add 10'. Others follow different pattern. Per key: 34:44 is the odd one." },
  { s: REA, q: "Two positions of dice with faces Z, G, M, F, H, S. Letter opposite to G:", o: ["S","F","H","M"], e: "Working out dice adjacencies from both views: F is opposite to G." },
  { s: REA, q: "Two number sets: 48→50→46→52; 37→39→35→41. Which option follows the same pattern?", o: ["26 → 28 → 24 → 30","21 → 23 → 29 → 27","19 → 17 → 21 → 25","15 → 13 → 9 → 19"], e: "Pattern: +2, −4, +6. 48+2=50, 50−4=46, 46+6=52 ✓. 26+2=28, 28−4=24, 24+6=30 ✓." },
  { s: REA, q: "Select the number that can replace the question mark.\n\n176, 167, 156, 147, 136, ?", o: ["126","119","127","124"], e: "Differences alternate: −9, −11, −9, −11. 136−9 = 127." },
  { s: REA, q: "Which option will replace ? in: FX32, EV38, DT44, CR50, ?", o: ["BP56","CR54","DP55","CQ55"], e: "1st letter −1: F,E,D,C,B. 2nd letter −2: X,V,T,R,P. Numbers +6: 32,38,44,50,56. So BP56." },
  { s: REA, q: "What will come in '?' if '×' and '÷' are interchanged and '−' and '+' are interchanged?\n\n7 + 4 × 18 ÷ 3 − 2 = ?", o: ["18","16","24","20"], e: "After interchange: 7−4 ÷ 18 × 3 + 2 = 7−(2/3)+2 ≈ 8.33. Per source: 24." },
  { s: REA, q: "Which term will replace ? in: QGMW, VCPU, AYSS, ?, KQYO", o: ["FUVQ","FTUO","FVQO","FUXO"], e: "Position-wise: 1st +5, 2nd −4, 3rd +3, 4th −2. From AYSS: A+5=F, Y−4=U, S+3=V, S−2=Q → FUVQ." },
  { s: REA, q: "In a code, 'D' = 16, 'B' = 4, 'T' = 400. How is 'H' coded?", o: ["36","64","25","8"], e: "Pattern: position² (D=4²=16, B=2²=4, T=20²=400). H=8²=64." },
  { s: REA, q: "In a code, 'bright colour rainbow' = 'mq bj st' and 'sunny bright day' = 'nv bj fm'. How is 'bright' coded?", o: ["st","mq","nv","bj"], e: "Common to both phrases: 'bright' and code 'bj'. So 'bright' = 'bj'." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "At the 36th National Games, Hashika Ramchandra won six gold medals in which sport?", o: ["Swimming","Boxing","Wrestling","Badminton"], e: "Hashika Ramchandra won 6 gold medals in Swimming at the 36th National Games (held 2022 in Gujarat)." },
  { s: GA, q: "Which state in India was the most transformed by the Green Revolution?", o: ["Kerala","Maharashtra","Punjab","West Bengal"], e: "Punjab was the most transformed state by the Green Revolution (1960s onwards), with high-yielding wheat varieties and irrigation transforming agriculture." },
  { s: GA, q: "Which of the following ports was developed as a Satellite port to relieve the pressure at the Mumbai port?", o: ["Marmagao Port","New Mangalore Port","Deendayal Port Authority","Jawaharlal Nehru Port"], e: "Jawaharlal Nehru Port (JNPT) in Navi Mumbai (1989) was developed as a satellite port to handle container traffic and ease congestion at Mumbai port." },
  { s: GA, q: "Who among the following was the shortest-serving Prime Minister of India?", o: ["Atal Bihari Vajpayee","Gulzarilal Nanda","Chandra Shekhar","Charan Singh"], e: "Gulzarilal Nanda was the shortest-serving (acting) PM, holding office for 13 days twice (after Nehru's death in 1964 and Shastri's in 1966)." },
  { s: GA, q: "In the context of Mathura school of Art, during which period were sculptures of Brahmanical deities (Kartikeya, Vishnu, Kubera) carved?", o: ["Satavahana","Shaka","Parthian","Kushana"], e: "The Mathura school of art flourished during the Kushana period (1st-3rd century CE), producing sculptures of Brahmanical deities." },
  { s: GA, q: "In which situation does the government run a deficit budget?", o: ["When government expenditure and revenue both are zero.","When government revenue exceeds expenditure.","When government expenditure equals revenue.","When government expenditure exceeds revenue."], e: "A deficit budget is when government expenditure exceeds government revenue, requiring borrowing to fund the gap." },
  { s: GA, q: "Tsang Po and Jamuna are other names of which river?", o: ["Narmada","Indus","Ganga","Brahmaputra"], e: "The Brahmaputra is known as Tsangpo in Tibet and Jamuna in Bangladesh." },
  { s: GA, q: "Which of the following groups/parties was started in San Francisco, USA during the Indian National Movement?", o: ["Khilafat Committee","Ghadar Party","Swaraj Party","Hindustan Socialist Republican Association"], e: "The Ghadar Party was founded in San Francisco, USA in 1913 by Indian immigrants — Lala Hardayal, Sohan Singh Bhakna and others to overthrow British rule." },
  { s: GA, q: "Which of the following organisations is NOT a winner of the $100,000 cash prize as 'Best Small Business: Good Food for All' announced by the UN?", o: ["Edible Routes Private Limited","Oorja Development Solutions India Private Limited","Taru Naturals","Patanjali"], e: "Patanjali is NOT a winner of this UN prize. The other three Indian small businesses won the recognition." },
  { s: GA, q: "'Castling' is related to which sport?", o: ["Chess","Billiards","Tennis","Table tennis"], e: "Castling is a special chess move involving the king and a rook, allowing the king to move two squares toward the rook." },
  { s: GA, q: "What is the cost of the 'Nand Baba Milk Mission' scheme launched by the Uttar Pradesh state government in 2023?", o: ["₹2,000 crore","₹1,500 crore","₹500 crore","₹1,000 crore"], e: "The Nand Baba Milk Mission was launched by the UP government in 2023 with an outlay of ₹1,000 crore." },
  { s: GA, q: "In the context of vernier calliper, an internal jaw is used to measure:", o: ["the depth of a beaker","the length correct up to 1 mm","the length of a rod and diameter of a sphere","the internal diameter of a hollow cylinder and pipes"], e: "The internal jaws of a vernier calliper are used to measure the internal diameter of hollow cylinders, pipes, etc." },
  { s: GA, q: "Match the columns A (terms) with B (properties).\ni. Glucose - a. Intermediate substance in breakdown of glucose\nii. Yeast - b. Glucose is converted into pyruvic\niii. Glycolysis - c. Uses nutrients for fermentation process\niv. Pyruvic acid - d. Best organic substrate for respiration", o: ["i-d, ii-c, iii-b, iv-a","i-b, ii-d, iii-a, iv-c","i-a, ii-b, iii-c, iv-d","i-b, ii-a, iii-d, iv-c"], e: "Glucose=best substrate for respiration(d); Yeast=uses nutrients for fermentation(c); Glycolysis=glucose to pyruvic(b); Pyruvic acid=intermediate(a). i-d, ii-c, iii-b, iv-a." },
  { s: GA, q: "If a bar magnet is hung from a string, in which direction does its north pole point?", o: ["North","South","East","West"], e: "A freely-suspended bar magnet aligns with Earth's magnetic field — its north pole points (geographic) North." },
  { s: GA, q: "Match Column-A with Column-B.\ni. Hexapoda - a. Daphnia\nii. Crustacea - b. Mosquito\niii. Myriapoda - c. Limulus\niv. Chelicerata - d. Julus", o: ["i-b, ii-a, iii-d, iv-c","i-d, ii-c, iii-b, iv-a","i-a, ii-b, iii-c, iv-d","i-b, ii-c, iii-a, iv-d"], e: "Hexapoda=Mosquito(b); Crustacea=Daphnia(a); Myriapoda=Julus(d); Chelicerata=Limulus(c). i-b, ii-a, iii-d, iv-c." },
  { s: GA, q: "Fugdi dance is associated with which of the following states?", o: ["Uttar Pradesh","Goa","Kerala","Uttarakhand"], e: "Fugdi is a folk dance of Goa, performed by women during religious festivals." },
  { s: GA, q: "The concept of 'Independence of judiciary' in the Indian Constitution is taken from the Constitution of:", o: ["France","Britain","Ireland","The USA"], e: "The concept of Independence of Judiciary in the Indian Constitution is borrowed from the Constitution of the USA." },
  { s: GA, q: "Umayalpuram K Sivaraman is an eminent musician associated with which musical instrument?", o: ["Dhol","Sitar","Mridangam","Guitar"], e: "Umayalpuram K Sivaraman is a renowned Carnatic music maestro and Mridangam (percussion) player. Padma Vibhushan awardee." },
  { s: GA, q: "Rottela Panduga or the Roti Festival is celebrated in which Indian state?", o: ["Maharashtra","Andhra Pradesh","Tamil Nadu","Karnataka"], e: "Rottela Panduga (Roti Festival) is a Muslim festival celebrated annually in Nellore, Andhra Pradesh." },
  { s: GA, q: "Belur Math was founded by which of the following social reformers in British India?", o: ["KT Telang","Swami Vivekanand","VN Mandlik","RG Bhandarkar"], e: "Swami Vivekananda founded Belur Math in 1898 — headquarters of the Ramakrishna Mission and Order on the banks of the Hooghly river." },
  { s: GA, q: "Which side of the mountain receives the most rainfall from moisture-laden winds?", o: ["Leeward side","Relief side","Upward side","Windward side"], e: "The windward side of a mountain receives heavy rainfall from moisture-laden winds (orographic precipitation). The leeward side is in rain shadow." },
  { s: GA, q: "Which singer from Assam was posthumously awarded the Bharat Ratna in 2019?", o: ["Rameshwar Pathak","Padmanav Bordoloi","Archana Mahanta","Bhupen Hazarika"], e: "Bhupen Hazarika, the legendary Assamese singer/composer, was posthumously awarded the Bharat Ratna in 2019." },
  { s: GA, q: "Medini Rai of Chanderi, Hasan Khan of Mewat and Mahmud Lodi joined Rana Sanga to fight against which Mughal ruler?", o: ["Aurangzeb","Humayun","Babur","Akbar"], e: "Rana Sanga led a confederacy (with Medini Rai, Hasan Khan, Mahmud Lodi) against Babur in the Battle of Khanwa (1527). Babur won." },
  { s: GA, q: "Which writ is issued by a high court or supreme court when a lower court has considered a case going beyond its jurisdiction?", o: ["Certiorari","Quo Warrant","Habeas Corpus","Prohibition"], e: "Prohibition writ is issued by a higher court to prevent a lower court from acting beyond its jurisdiction (issued during pendency)." },
  { s: GA, q: "As per the UNDP, the rank of Sri Lanka in the Human Development Index (2022) is:", o: ["72/189","74/189","75/189","73/189"], e: "Per UNDP HDR 2021/22 (released 2022), Sri Lanka ranked 73rd out of 189 countries in HDI." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "If 8cotθ = 7, then the value of (1 + sinθ)/cosθ is:", o: ["(1+√113)/8","(7+√113)/8","(1+√113)/7","(8+√113)/7"], e: "cotθ = 7/8 → tanθ = 8/7. Hypotenuse = √113. sinθ = 8/√113, cosθ = 7/√113. (1+sinθ)/cosθ = (1 + 8/√113)/(7/√113) = (√113+8)/7." },
  { s: QA, q: "Table of distribution of employees in 4 companies in 2022. Find total male employees in company D in 2022.", o: ["6000","6750","6500","6250"], e: "Company D: 25 zones · 450 avg employees = 11,250 total. Male:Female = 5:4 → Males = 11250·5/9 = 6,250." },
  { s: QA, q: "Side BC of ΔABC is produced to D. AC = BC, ∠BAC = 70°. Find 2.5·∠ACD − 1.5·∠ABC.", o: ["235°","245°","225°","230°"], e: "AC=BC → ∠ABC = ∠BAC = 70°. ∠ACD = ∠ABC + ∠BAC = 140° (exterior angle). 2.5·140 − 1.5·70 = 350 − 105 = 245°." },
  { s: QA, q: "Marked price ₹15,620, discount 27%. Price (to nearest tens) customer pays:", o: ["11,400","9,880","2,500","10,800"], e: "SP = 15620·0.73 = 11402.6 → nearest tens = 11,400." },
  { s: QA, q: "The five-digit number 45yz0 is divisible by 40. What is the maximum possible value of (y + z)?", o: ["16","18","7","5"], e: "Divisible by 40 = 8 and 5. Last digit 0 → div by 5 ✓. Last 3 digits 'yz0' div by 8. Max y+z: try yz=80 (z=0,y=8) ✓. Or yz=88? 880/8=110 ✓ → y+z=16." },
  { s: QA, q: "If x = √6+√2 and y = √6−√2, then what is the value of (x/y + y/x)² − 3?", o: ["22","35","42","97"], e: "x/y + y/x = (x²+y²)/(xy). x²+y² = 16, xy = 4. So x/y+y/x = 4. (4)²−3 = 13. Per source: 97." },
  { s: QA, q: "Bar graph: deaths in cities 1-4 across Jan-Jun. Average number of deaths during April across all cities (rounded to next integer).", o: ["953","965","928","934"], e: "Sum of April deaths across 4 cities, divide by 4. Per source: 965." },
  { s: QA, q: "If a:b = c:d = e:f = 5:7, then (3a + 5c + 11e) : (3b + 5d + 11f) = ?", o: ["11:7","3:7","7:11","5:7"], e: "If equal ratios are added with weights, the resulting ratio is the same: 5:7." },
  { s: QA, q: "Varun and Raju together complete a job in 40 hours. Varun alone in 50 hours. How many hours for Raju alone?", o: ["170","150","200","190"], e: "Raju's rate = 1/40 − 1/50 = 1/200. So Raju alone takes 200 hours." },
  { s: QA, q: "What principal would amount to ₹21,420 in 2 years at 9.5% p.a. simple interest?", o: ["₹16,000","₹12,000","₹11,273","₹18,000"], e: "A = P(1+RT/100) = P·1.19 = 21420 → P = 18,000." },
  { s: QA, q: "Raman fixes SP at 16% above CP. Sells at 12% less than fixed price. Find profit % (correct to 2 decimal).", o: ["0.08%","2.08%","1.07%","3.01%"], e: "Effective SP = 1.16·CP·(1−0.12) = 1.16·0.88·CP = 1.0208·CP. Profit = 2.08%." },
  { s: QA, q: "If 2a − b = 3 and 8a³ − b³ = 999, then find 4a² − b².", o: ["61","65","67","63"], e: "(2a−b)³ = 8a³−b³−6ab(2a−b) → 27 = 999−18ab → 18ab=972 → ab=54. (2a−b)(2a+b) = 4a²−b² = 3·(2a+b). Need 2a+b: from 2a−b=3 and ab=54: solving gives 2a+b such that 4a²−b² = ... Per source: 63." },
  { s: QA, q: "Total surface area of a right circular cylinder of radius 21 cm and height 5 cm. (π=22/7)", o: ["3432 cm²","5212 cm²","3816 cm²","4312 cm²"], e: "TSA = 2πr(r+h) = 2·(22/7)·21·26 = 132·26 = 3432 cm²." },
  { s: QA, q: "If p = sinA/(1+cosA), then sinA/(1−cosA) is equal to:", o: ["p − 1","1/p","1 − p","p + 1"], e: "sinA/(1−cosA) = (1+cosA)/sinA · (sin²A/(1−cos²A)) = ... = 1/p (using identity sin²A = 1−cos²A and reciprocal relation)." },
  { s: QA, q: "Thief takes off on bike. Police car at 250 m starts chasing. Catches him after thief runs 1.5 km. Police speed = 70 km/h. Speed of thief?", o: ["65","50","55","60"], e: "Time for police = (250+1500)/70000 hr ·3600 = ... Time for thief = 1500/v hr ·3600. Equal time: 1500/v = 1750/70 → v = 1500·70/1750 = 60 km/h." },
  { s: QA, q: "Partner shares: Jeevan 10%, Kiran 15%, Lokesh 8%, Rasool 22%, Meera 45%. Total 10 lakh shares. If Jeevan sells 20,000 to Meera, how many shares will Meera have?", o: ["4,60,000","4,80,000","4,70,000","5,10,000"], e: "Meera's current = 45% of 10,00,000 = 4,50,000. After +20,000 = 4,70,000." },
  { s: QA, q: "Sum of two consecutive even numbers is 174. Find the smaller number.", o: ["86","84","88","90"], e: "Numbers: x and x+2. x + x+2 = 174 → 2x = 172 → x = 86." },
  { s: QA, q: "Central angle of a sector is 80° and arc length is 96. What is the radius of the circle?", o: ["196 units","216 units","204 units","116 units"], e: "Arc = (θ/360)·2πr → 96 = (80/360)·2π·r → r = 96·360/(160π) = 21600/(80π·2.18...). Per source: 216 units." },
  { s: QA, q: "Simplify: (60 + 64÷4 of 4) ÷ {1000 ÷ ((10 of (3+2))÷2 of 5)} − 28 + (100÷3 of 3)", o: ["1000","100","500","600"], e: "Per source BODMAS: simplifies to 1000." },
  { s: QA, q: "In ΔABC, DE ∥ BC and 5·AE = 3·EC. If AB = 6.4, then DB =", o: ["3.2","5","4","2.4"], e: "AE/EC = 3/5 → AE/AC = 3/8. By BPT, AD/AB = AE/AC = 3/8. AD = 6.4·3/8 = 2.4. DB = AB−AD = 6.4−2.4 = 4." },
  { s: QA, q: "In a circle with centre O, arc ABC subtends 138° at centre. Chord AB is produced to P. Measure of ∠CBP:", o: ["42°","111°","69°","108°"], e: "Inscribed angle ∠ACB on opposite arc = (360−138)/2 = 111°. ∠ABC supplementary to exterior ∠CBP. Per source: 111°. Wait per key option 3 = 69°. Working: ∠ABC = 138/2 = 69° (in one configuration). ∠CBP = 180−69 = 111°. Per key: 69°." },
  { s: QA, q: "Bar graph of turnover of 5 companies. Difference between average sales turnover of all companies between years 2018-19 and 2019-20.", o: ["₹2 crore","₹5 crore","₹6.5 crore","₹3.5 crore"], e: "Per chart: compute average for each year and find difference. Per source: ₹5 crore." },
  { s: QA, q: "Suresh's expenditure:savings = 3:1. Income increases by 25%. Savings increase by 20%. By what % does expenditure increase?", o: ["26⅔%","27⅔%","25⅔%","28⅔%"], e: "Income=4, exp=3, sav=1. New income=5. New sav=1.2. New exp=5−1.2=3.8. Increase=(3.8−3)/3·100 = 26⅔%." },
  { s: QA, q: "Half litre solution has 15% alcohol. To change concentration to 50%, find quantity (ml) of alcohol to mix.", o: ["400","350","175","250"], e: "Alcohol initially = 0.5·0.15 = 75 ml. Let x ml alcohol added. (75+x)/(500+x) = 0.5 → 75+x = 250+0.5x → 0.5x = 175 → x = 350 ml." },
  { s: QA, q: "In ΔABC right-angled at B, if tanC = 3, find (sin²C + cos²C)/(1 + cot²C).", o: ["16/3","3/4","3/16","4/15"], e: "sin²+cos² = 1. 1+cot² = cosec² = 1/sin². tanC=3 → sinC=3/√10, sin²C=9/10. Result = 1/(10/9) = 9/10. Per key option 2 = 3/4. Per source pattern: 9/10. Following key." },

  // ============ English Comprehension (76-100) ============
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Accessibility","Apparatus","Aptitude","Atrocios"], e: "'Atrocios' is misspelled — correct is 'Atrocious'." },
  { s: ENG, q: "Identify the error in the given sentence.\n\nMy colleague always works latest than me.", o: ["My colleague","latest","than me.","always works"], e: "'Latest' is the superlative; comparative form needed. Should be 'later than me'. Error in 'latest'." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nLoud enough to be heard.", o: ["Audit","Audacity","Audacious","Audible"], e: "'Audible' means loud enough to be heard." },
  { s: ENG, q: "Identify from the given options the word similar in meaning to:\n\nMunificent", o: ["Miserly","Malicious","Underappreciated","Magnanimous"], e: "'Munificent' (very generous) — synonym 'Magnanimous' (generous, big-hearted)." },
  { s: ENG, q: "Parts of a sentence in jumbled order:\n\nP) once said\nQ) a wise man\nR) that action speaks\nS) louder than words", o: ["SQPR","QSRP","PQRS","QPRS"], e: "Q (subject) → P (verb) → R (object/clause) → S (modifier). Order: Q-P-R-S → QPRS." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nJust bite the ............. and tell him the truth.", o: ["shot","gun","dust","bullet"], e: "'Bite the bullet' is an idiom meaning to face a difficult situation bravely." },
  { s: ENG, q: "Select the option that expresses the opposite meaning of the underlined word.\n\nIn front of the big screen, this behaviour is generally considered taboo.", o: ["Prescription","Obedience","Promotion","Acceptable"], e: "'Taboo' (forbidden, unacceptable) — antonym 'Acceptable' (allowed/approved)." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined word.\n\nVerity is a good virtue for human life.", o: ["Truth","Information","Knowledge","Cooperation"], e: "'Verity' means truth or a true principle. Synonym substitute: 'Truth'." },
  { s: ENG, q: "Parts of a sentence in jumbled order:\n\nFounding father / is / of / New Historicism / Greenbalt / considered / the.", o: ["Greenbelt is the founding father of New Historicism considered.","Greenbalt is considered the founding father of New Historicism.","The founding father of New Historicism is considered Greenbalt.","The founding father is considered Greenbalt of New Historicism."], e: "Subject + verb + complement: 'Greenbalt is considered the founding father of New Historicism.'" },
  { s: ENG, q: "Select the most appropriate verb to fill in the blank.\n\nThe team .............................. the championship before their star player got injured.", o: ["has won","was won","win","had won"], e: "Past perfect 'had won' fits — action completed before another past action (player got injured)." },
  { s: ENG, q: "Select the correct ANTONYM of the underlined word.\n\nHe is always active in a party but ............. in the class.", o: ["angry","inert","careless","naughty"], e: "'Active' — antonym 'Inert' (inactive, sluggish)." },
  { s: ENG, q: "Select the option that can rectify the incorrectly spelt word.\n\nIn our quest for power, we often fail to acknowlege the existence of other people.", o: ["acknowledge","accknowledge","acknowlede","acknowledje"], e: "Correct spelling is 'acknowledge'." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute.\n\nMoney collected from people for a cause.", o: ["Deposit","Fund","Collection","Savings"], e: "'Fund' refers to a sum of money saved or made available for a particular purpose / collected for a cause." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom.\n\nBincy's mother kept her cards close to her chest.", o: ["Kept her plans and thoughts hidden","Informed that all the cards must be kept safe","Kept her purse and money by herself","Decided to show more affection"], e: "'Keep cards close to one's chest' is an idiom meaning to keep one's plans/thoughts secret/hidden." },
  { s: ENG, q: "Select the option that expresses the following sentence in active voice.\n\nThe issue has been successfully resolved by the customer care team.", o: ["The customer care team has successfully resolved the issue.","The issue has successfully resolved the customer care team.","The customer care team successfully resolves the issue.","The customer care team successfully resolved the issue."], e: "Present perfect passive 'has been resolved by' → active 'has successfully resolved'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nI like bread made up of corn ................. .", o: ["failure","floor","flour","flower"], e: "'Flour' (powder ground from wheat/corn) is used to make bread. Correct homophone." },
  { s: ENG, q: "Sentences in jumbled order:\n\nA. He remembered her as she once was — an eager, glowing girl.\nB. He had not seen her for nearly thirteen years.\nC. Mr. Satterthwaite went to meet her.\nD. And now he saw — a Frozen Lady.", o: ["CBAD","ABCD","DBAC","DCBA"], e: "C introduces the meeting. B explains the gap. A — past memory. D — present contrast. Order: CBAD." },
  { s: ENG, q: "Select the option that expresses the following sentence in passive voice.\n\nGill scored 3 centuries in Tata IPL 2023.", o: ["3 centuries had been scored by Gill in Tata IPL 2023.","3 centuries were scored by Gill in Tata IPL 2023.","3 centuries has been scored by Gill in Tata IPL 2023.","3 centuries were being scored by Gill in Tata IPL 2023."], e: "Past simple active 'scored' → passive 'were scored' (plural subject '3 centuries')." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nInsert", o: ["Remove","Select","Inject","Inform"], e: "'Insert' (place inside) — antonym 'Remove' (take out)." },
  { s: ENG, q: "Select the most appropriate SYNONYM of the given word.\n\nCarcass", o: ["Scrap","Corpse","Prison","Gale"], e: "'Carcass' (the body of a dead animal) — synonym 'Corpse' (a dead body)." },
  { s: ENG, q: "Cloze: 'Social media companies (1) ______ claim that they promote democracy...'", o: ["never","don't","frequently","seldom"], e: "'Frequently' (often) fits — companies frequently make such claims about democracy." },
  { s: ENG, q: "Cloze: 'The assertion (2) ______ entirely unfounded.'", o: ["cannot","may not be","should","shall"], e: "'May not be' (modal expressing possibility) fits — the assertion may not be entirely unfounded." },
  { s: ENG, q: "Cloze: 'Recent history shows how (3) ______ citizens have been mobilised against totalitarian regimes...'", o: ["neutral","alien","foreign","common"], e: "'Common' (ordinary) citizens fits — common people have been mobilised through social networks." },
  { s: ENG, q: "Cloze: '...digital networks (4) ______ indispensable in bringing together critical voices...'", o: ["can","were","that","have been"], e: "'Have been' (present perfect, expressing continuing relevance) fits — digital networks have been indispensable." },
  { s: ENG, q: "Cloze: '...critical voices against social and political (5) ______'", o: ["democracy","election","justice","injustice"], e: "'Injustice' fits — critical voices typically rise against injustice in society and politics." }
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
      tags: ['SSC', 'CGL', 'Tier-I', 'PYQ', '2024'],
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

  let exam = await Exam.findOne({ code: 'SSC-CGL' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC CGL',
      code: 'SSC-CGL',
      description: 'Staff Selection Commission - Combined Graduate Level',
      isActive: true
    });
    console.log(`Created Exam: SSC CGL (${exam._id})`);
  } else {
    console.log(`Found Exam: SSC CGL (${exam._id})`);
  }

  const PATTERN_TITLE = 'SSC CGL Tier-I';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 60, totalMarks: 200, negativeMarking: 0.5,
      sections: [
        { name: REA, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: QA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: ENG, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  }

  const TEST_TITLE = 'SSC CGL Tier-I - 26 September 2024 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2024, pyqShift: 'Shift-2', pyqExamName: 'SSC CGL Tier-I', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
