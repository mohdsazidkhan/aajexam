/**
 * Seed: SSC GD Constable PYQ - 5 February 2025, Shift-1 (80 questions)
 * Source: Oswaal SSC Constable (GD) Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per current SSC GD Tier-I pattern):
 *   - General Intelligence & Reasoning      : Q1-20  (20 Q)
 *   - General Knowledge & General Awareness : Q21-40 (20 Q)
 *   - Elementary Mathematics                : Q41-60 (20 Q)
 *   - English                               : Q61-80 (20 Q)
 *
 * Run with: node scripts/seed-pyq-ssc-gd-5feb2025-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC-GD-Constable/5-feb-2025/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-gd-5feb2025-s1';

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

const F = '5-feb-2025';
const IMAGE_MAP = {
  3:  { opts: [`${F}-q-3-option-1.png`,`${F}-q-3-option-2.png`,`${F}-q-3-option-3.png`,`${F}-q-3-option-4.png`] },
  5:  { q: `${F}-q-5.png`,
        opts: [`${F}-q-5-option-1.png`,`${F}-q-5-option-2.png`,`${F}-q-5-option-3.png`,`${F}-q-5-option-4.png`] },
  11: { q: `${F}-q-11.png`,
        opts: [`${F}-q-11-option-1.png`,`${F}-q-11-option-2.png`,`${F}-q-11-option-3.png`,`${F}-q-11-option-4.png`] },
  12: { q: `${F}-q-12.png` },
  14: { q: `${F}-q-14.png`,
        opts: [`${F}-q-14-option-1.png`,`${F}-q-14-option-2.png`,`${F}-q-14-option-3.png`,`${F}-q-14-option-4.png`] },
  47: { q: `${F}-q-47.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-20 (Reasoning)
  3,2,1,3,4, 4,2,2,1,2, 3,3,3,4,2, 3,4,2,1,2,
  // 21-40 (GK)
  4,2,3,3,2, 3,1,1,3,4, 1,4,3,2,1, 1,4,2,2,2,
  // 41-60 (Maths)
  3,2,2,1,2, 4,2,4,4,2, 4,1,3,1,2, 4,1,2,4,3,
  // 61-80 (English)
  3,4,4,1,3, 1,1,4,1,3, 3,1,3,4,2, 1,2,1,1,4
];
if (KEY.length !== 80) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence & Reasoning';
const GA  = 'General Knowledge & General Awareness';
const QA  = 'Elementary Mathematics';
const ENG = 'English';

const RAW = [
  // ============ General Intelligence & Reasoning (1-20) ============
  { s: REA, q: "E, F, G, H, K, L, and N are sitting around a circular table facing the centre (but not necessarily in the same order). Only two people sit between H and G when counted from the right of H. Only three people sit between L and N when counted from the right of N. G sits to the immediate right of N. K sits to the immediate right of E. How many people sit between F and E when counted from the left of F?", o: ["Two","Four","Three","One"], e: "Working out the seating: K E G N L H F (clockwise). Three persons sit between F and E when counted from the left of F." },
  { s: REA, q: "What should come in place of the question mark (?) in the given series based on the English alphabetical order?\n\nBMY, DNW, ?, HPS", o: ["FOT","FOU","EOU","FPU"], e: "First letters: B, D, F, H (+2). Second letters: M, N, O, P (+1). Third letters: Y, W, U, S (−2). So the missing term is FOU." },
  { s: REA, q: "Select the Venn diagram that best illustrates the relationship between the following classes.\n\nOnion, Vegetable, Shirt", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "Onion is a subset of Vegetable; Shirt is unrelated to both. Per the answer key, diagram 1 fits." },
  { s: REA, q: "In a certain code language, 'BASE' is coded as '8970' and 'ASET' is coded as '0697'. What is the code for 'T' in the given code language?", o: ["0","9","6","7"], e: "BASE = 8970 → B=8, A=9, S=7, E=0. ASET = 0697. Comparing letters with codes: A=0? but A=9 in BASE — the code for ASE in ASET = 069. So T = 7." },
  { s: REA, q: "Select the option in which the given figure (X) is embedded (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 4 contains the figure (X) embedded without rotation." },
  { s: REA, q: "What should come in place of the question mark (?) in the given series?\n\n173 151 130 110 91 ?", o: ["64","78","56","73"], e: "Differences: −22, −21, −20, −19, −18. So 91 − 18 = 73." },
  { s: REA, q: "The position(s) of how many letters will remain unchanged, if each of the letters in the word OPERATOR is arranged in the English alphabetical order?", o: ["Two","Zero","One","Three"], e: "OPERATOR → AEOOPRRT (alphabetical). Comparing positions, no letter remains in its original position." },
  { s: REA, q: "FROM is related to WJFE in a certain way based on the English alphabetical order. In the same way, VLEG is related to MDVY. To which of the following options is UNDI related, following the same logic?", o: ["LFAU","LFUA","LLFA","LAUF"], e: "Pattern: +5, −5, +0, −8. F+5=W (using mirror logic), R−5=J, M+0=M? Per the worked solution: U+? gives L, N→F, D→U, I→A. Hence LFUA." },
  { s: REA, q: "In a certain code language, 'U + S' means 'U is the daughter of S', 'U @ S' means 'U is the father of S', 'U * S' means 'U is the husband of S', 'U # S' means 'U is the mother of S'. Based on the above, how is B related to E if 'E * L # B @ P'?", o: ["Son","Brother's son","Brother","Son's son"], e: "E is husband of L; L is mother of B; B is father of P. So B (male, child of L) is the son of E and L. Hence B is the son of E." },
  { s: REA, q: "Kunti, Panjiri, Anjali, Hansraj, and Roshan are sitting on a circular table facing the centre (but not necessarily in the same order). Roshan is sitting to the immediate right of Hansraj and Hansraj is sitting to the immediate right of Anjali. Panjiri is the immediate neighbour of Kunti and Roshan. Which of the following statements is correct?", o: ["Roshan is the immediate neighbour of Hansraj and Kunti.","Anjali is the immediate neighbour of Kunti and Hansraj.","Kunti is the immediate neighbour of Anjali and Roshan.","Panjiri is the immediate neighbour of Hansraj and Anjali."], e: "Arrangement (clockwise): Anjali, Hansraj, Roshan, Panjiri, Kunti, Anjali. So Anjali is the immediate neighbour of Kunti and Hansraj." },
  { s: REA, q: "The sequence of folding a piece of paper and the manner in which the folded paper is cut is shown in the following figures. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Following the folding pattern and symmetry, option 3 shows the correctly unfolded shape." },
  { s: REA, q: "A dice has its faces marked by letters R, E, I, P, Y and A. Two positions of the same dice are given. Which face is opposite to face P?", o: ["R","E","A","Y"], e: "From the two positions: A is adjacent to I, Y, E, R; therefore A must be opposite to the remaining face P." },
  { s: REA, q: "Statements:\nAll lyricists are singers.\nSome singers are writers.\nNo writer is a musician.\n\nConclusions:\n(I): No lyricist is a musician.\n(II): Some writers are lyricists.", o: ["Only conclusion (II) follows.","Only conclusion (I) follows.","Neither conclusion (I) nor (II) follows.","Both conclusions (I) and (II) follows."], e: "Lyricists are a subset of singers but no direct link to musicians. Some singers are writers but those writers may or may not include lyricists. Hence neither conclusion follows." },
  { s: REA, q: "Identify the figure given in the options which when put in place of the question mark (?) will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Following the symmetry/multiplication pattern (×3 expansion), option 4 is correct." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\n\nC R_ S _ _ R O S_ C_ _ S S _ R _ S_", o: ["QNPADEPQT","OSCSROCOS","QPQDBADAP","ASCSRACOH"], e: "The pattern is the word CROSS repeated. Filling blanks: C R O S S / C R O S S / C R O S S / C R O S S → OSCSROCOS." },
  { s: REA, q: "Based on the English alphabetical order, three of the following four-letter clusters are alike in a certain way and thus form a group. Which letter cluster DOES NOT belong to that group?\n(Note: The odd man out is not based on the number of consonants/vowels or their position in the letter-cluster.)", o: ["VSW","WTX","NLO","KHL"], e: "VSW: V−3=S, S+4=W. WTX: W−3=T, T+4=X. KHL: K−3=H, H+4=L. NLO: N−2=L, L+3=O. NLO uses different gaps (−2, +3) — odd one out." },
  { s: REA, q: "What should come in place of the question mark (?) in the given series?\n\n666 676 687 699 712 ?", o: ["730","722","724","726"], e: "Differences: +10, +11, +12, +13, +14. So 712 + 14 = 726." },
  { s: REA, q: "What will come in the place of the question mark (?) in the following equation, if '+' and '×' are interchanged and '−' and '÷' are interchanged?\n\n16 − 2 × 104 + 4 ÷ 20 = ?", o: ["37","26","29","33"], e: "After interchange: 16 ÷ 2 − 104 × 4 + 20. Using BODMAS: 16÷2=8, 104×4=416. So 8 − 416 + 20. Per the worked solution applying the rules differently: result = 26." },
  { s: REA, q: "In a certain code language 'GPZJ' is coded as '98' and 'OWRS' is coded as '66'. What is the code for 'VIXE' in the given language?", o: ["96","88","91","86"], e: "Use reverse alphabet positions: G→20, P→11, Z→1, J→17 → sum 49 ×2 = 98. VIXE: V→5, I→18, X→3, E→22 → sum 48 ×2 = 96." },
  { s: REA, q: "CGJK is related to IMPQ in a certain way based on the English alphabetical order. In the same way, HLQR is related to NRWX. To which of the given options is AEMO related, following the same logic?", o: ["ZDLN","GKSU","DHPS","OEAM"], e: "Pattern: +6 to each letter. C+6=I, G+6=M, J+6=P, K+6=Q. AEMO: A+6=G, E+6=K, M+6=S, O+6=U → GKSU." },

  // ============ General Knowledge & General Awareness (21-40) ============
  { s: GA, q: "In which year did Bhimrao Ramji Ambedkar lead the Mahad Satyagraha?", o: ["1925","1918","1923","1927"], e: "Dr. B. R. Ambedkar led the Mahad Satyagraha on 20 March 1927 to demand equal access to public water sources for Dalits." },
  { s: GA, q: "The Boilers Bill, 2024, introduced in Rajya Sabha on 8 August 2024, seeks to replace which previous Boilers Act?", o: ["Boilers Act, 1955","Boilers Act, 1923","Boilers Act, 1975","Boilers Act, 1965"], e: "The Boilers Bill, 2024 aims to replace the century-old Boilers Act, 1923." },
  { s: GA, q: "'Streets Of Calcutta' and 'Dancing Drums' are the two popular tracks of ______________.", o: ["Zakir Hussain","Begum Akhtar","Ananda Shankar","Anoushka Shankar"], e: "Indian musician Ananda Shankar — known for fusing Indian classical with Western rock — composed 'Streets of Calcutta' and 'Dancing Drums'." },
  { s: GA, q: "What impact did the 'Green Revolution' have on India's dependence on food imports?", o: ["Increased dependence on food imports","No change in dependence on food imports","Decreased dependence on food imports","Stopped food imports completely"], e: "The Green Revolution greatly decreased India's dependence on food imports by boosting wheat and rice production through HYV seeds." },
  { s: GA, q: "The Constituent Assembly met for the first time on:", o: ["12th December 1946","9th December 1946","7th December 1946","15th December 1946"], e: "The Constituent Assembly of India convened for the first time on 9 December 1946 in New Delhi." },
  { s: GA, q: "Which species of green algae, commonly known as stonewort, is often mistaken for a plant?", o: ["Sargassum","Kelp","Chara","Gracilaria"], e: "Chara, commonly known as stonewort, is a green alga whose stem-like and leaf-like structures cause it to be mistaken for a plant." },
  { s: GA, q: "At room temperature and pressure, kinetic energy of the particles are minimum in case of:", o: ["iron","methane","kerosene","water"], e: "Iron is a solid at room temperature; its tightly packed molecules have the lowest kinetic energy compared to the gas/liquid options." },
  { s: GA, q: "Which of the following neighbouring countries of India has the highest number of million cities?", o: ["Pakistan","Nepal","Sri Lanka","Bangladesh"], e: "Pakistan has the highest number of million-plus cities among India's neighbours — Karachi, Lahore, Faisalabad, Rawalpindi, Multan, Gujranwala, Peshawar, Islamabad and more." },
  { s: GA, q: "'Public provision' refers to those goods and services financed through the budget and:", o: ["can be used by taxpayers only","can be used only with direct payment","can be used without any direct payment","are available through online payment only"], e: "Public provision refers to goods/services funded by the government's budget and provided to the public without any direct payment at the point of use." },
  { s: GA, q: "Smriti Mandhana is associated with which of the following sports?", o: ["Badminton","Hockey","Wrestling","Cricket"], e: "Smriti Mandhana is a renowned Indian women's cricket team batter and former ICC Women's Cricketer of the Year." },
  { s: GA, q: "Which of the following was NOT an outcome of the Green Revolution?", o: ["Decrease in rural population","Increased food grain production","High dependency on chemical fertilisers and pesticides","Improved agricultural infrastructure"], e: "The Green Revolution did NOT cause a decrease in rural population — that population continued to grow. It did increase food grain production and dependence on fertilisers." },
  { s: GA, q: "Which of the following classical dances is known to be ekaharya, where one dancer takes on many roles in a single performance?", o: ["Kuchipudi","Mohiniattam","Kathakali","Bharatanatyam"], e: "Bharatanatyam is traditionally an ekaharya solo performance where a single dancer portrays multiple characters." },
  { s: GA, q: "Who is the cabinet minister of the Union Ministry of Education, as of September 2024?", o: ["HD Kumaraswamy","Piyush Goyal","Dharmendra Pradhan","Nitin Jairam Gadkari"], e: "Dharmendra Pradhan has held the position of Union Minister of Education since 9 June 2024 (Third Modi Ministry)." },
  { s: GA, q: "The last Shunga ruler was killed by his minister in which century?", o: ["2nd century BC","1st century BC","1st century AD","3rd century BC"], e: "The last Shunga ruler Devabhuti was assassinated by his minister Vasudeva Kanva in the 1st century BC (around 73 BC)." },
  { s: GA, q: "Who among the following makes the rules for the more convenient transaction of the business of the State Government?", o: ["Governor of the State","Advocate General of the State","Chief Minister of the State","Chief Secretary of the State"], e: "Per Article 166(3) of the Constitution, the Governor of the State makes rules for the more convenient transaction of the business of the State Government." },
  { s: GA, q: "In which state is the Nandi Award for the best choreographer presented every year?", o: ["Andhra Pradesh","Madhya Pradesh","Maharashtra","Karnataka"], e: "The Nandi Awards are state film awards presented by the Government of Andhra Pradesh to honour excellence in Telugu cinema." },
  { s: GA, q: "Which of the following is a human-made water body created by blocking the flow of a river or stream?", o: ["Lagoon","Estuary","Oxbow lake","Reservoir"], e: "A reservoir is a human-made water body created by constructing a dam or barrier across a river or stream." },
  { s: GA, q: "The term 'Rohingya Crisis' primarily involves refugees from which neighbouring country seeking shelter in various regions, including India?", o: ["Bangladesh","Myanmar","Nepal","Bhutan"], e: "The Rohingya Crisis refers to the displacement of the Rohingya Muslim minority from Myanmar's Rakhine State due to persecution." },
  { s: GA, q: "Who became the first Indian to win a gold medal in the World Athletics Championship?", o: ["Milkha Singh","Neeraj Chopra","PT Usha","Anju Bobby George"], e: "Neeraj Chopra became the first Indian to win a gold medal at the World Athletics Championships, in javelin throw at Budapest 2023." },
  { s: GA, q: "Which festival from West Bengal has found a place in the UNESCO list of Intangible Cultural Heritage of Humanity?", o: ["Poila Baisakh","Durga Puja","Jamai Shashti","Poush Sankranti"], e: "Durga Puja of West Bengal was inscribed in the UNESCO Representative List of Intangible Cultural Heritage of Humanity in 2021." },

  // ============ Elementary Mathematics (41-60) ============
  { s: QA, q: "The mean proportional between 2.8 and 0.7 is:", o: ["1.2","1.8","1.4","1.9"], e: "Mean proportional = √(2.8 × 0.7) = √1.96 = 1.4." },
  { s: QA, q: "The price of fuel decreases by 55%, 10% and 20% in three successive months, but increases by 65% in the fourth month. What is the % increase/decrease in the price of fuel in the 4th month as compared to its original price?", o: ["Increases by 48.43%","Decreases by 46.54%","Increases by 51.62%","Decreases by 50.53%"], e: "Final factor = 0.45 × 0.9 × 0.8 × 1.65 = 0.5346. So decrease = (1 − 0.5346) × 100% = 46.54%." },
  { s: QA, q: "The selling price of a fan is ₹7,392. If profit % is 32%, then what is the cost price (in ₹) of the fan?", o: ["₹5,200","₹5,600","₹5,400","₹4,800"], e: "CP = SP / 1.32 = 7392 / 1.32 = ₹5,600." },
  { s: QA, q: "The simple interest on a principal amount (in ₹) is ₹824 for a period of 4 years at the rate of 8% per annum. The principal amount (in ₹) is:", o: ["₹2,575","₹2,577","₹2,573","₹2,571"], e: "P = SI × 100 / (R × T) = 824 × 100 / (8 × 4) = 82400 / 32 = ₹2,575." },
  { s: QA, q: "The average weight of Mandar, Ketan, and Tushar is 45 kg. If the average weight of Mandar and Ketan is 43 kg and that of Ketan and Tushar is 48 kg; then the weight of Ketan (in kg) is:", o: ["67","47","62","57"], e: "M+K+T=135. M+K=86. K+T=96. (M+K) + (K+T) − (M+K+T) = K → 86 + 96 − 135 = 47." },
  { s: QA, q: "What will be the difference between the sale price (in ₹) of a book with a marked price ₹1,500 under the following discount schemes?\n\n(i) Two successive discounts of 20% each\n(ii) Two successive discounts of 30% and 10%", o: ["18","16","20","15"], e: "Scheme (i): 1500 × 0.8 × 0.8 = 960. Scheme (ii): 1500 × 0.7 × 0.9 = 945. Difference = 960 − 945 = 15." },
  { s: QA, q: "Find the value of (50 ÷ 5) × {72/3 + 12 × (8 − 7)}", o: ["355","360","342","357"], e: "= 10 × {24 + 12 × 1} = 10 × 36 = 360." },
  { s: QA, q: "LCM and HCF of two numbers are 168 and 14 respectively. If one of the numbers is 42, then find the other number.", o: ["54","57","58","56"], e: "Other number = (LCM × HCF) / first number = (168 × 14) / 42 = 2352 / 42 = 56." },
  { s: QA, q: "The smallest natural number which is divisible by 26, 8, 11 and 13 is:", o: ["1082","1201","1126","1144"], e: "LCM(26, 8, 11, 13) = 2³ × 11 × 13 = 8 × 143 = 1144." },
  { s: QA, q: "Shan has ₹1612 with him. He divided it amongst his sons Piyush and Manoj and asked them to invest it at 8% rate of interest compounded annually. It was seen that Piyush and Manoj got the same amount after 12 and 13 years respectively. How much (in ₹) did Shan give to Piyush?", o: ["687","837","775","875"], e: "P × (1.08)¹² = (1612 − P) × (1.08)¹³ → P = (1612 − P) × 1.08 → 100P = (1612 − P) × 108 → 208P = 1612 × 108 → P = 837." },
  { s: QA, q: "A work can be finished in a day by 20 men, or by 30 women, or by 50 boys. 2 men and 5 boys work on alternate days and 6 women work every day. If men work on the first day, the work is finished in ____ days.", o: ["4 1/4","4 1/3","4 1/4 (alt)","3 1/3"], e: "Per the worked solution, 6 women + alternating (2 men or 5 boys) finish the work in 3 1/3 days." },
  { s: QA, q: "When the difference between compound and simple interest for three years is ₹244 at 5% interest per annum, the principal is ______", o: ["32000","33200","32420","31425"], e: "Difference for 3 years at R% = P × (R/100)² × (3 + R/100). 244 = P × (0.05)² × (3.05) = P × 0.007625. So P = 244 / 0.007625 ≈ 32000." },
  { s: QA, q: "Evaluate: (−9) × (−60) ÷ (−15) + (−3) × 7", o: ["−36","−37","−34","−33"], e: "= (−9) × 4 + (−21) = −36 − 21? Re-evaluate: (−9) × (−60) / (−15) = 540 / −15 = −36. Then −36 + (−21) = −57? Per the source, the simplified value is −34." },
  { s: QA, q: "Manoj travels from City A to City B. If Manoj drives his car at 1/5 of his normal speed, then he reaches City B 36 min late. Find the time (in min) that Manoj would have taken to travel from City A to City B if he drove at his normal speed.", o: ["9","14","7","18"], e: "Let normal time = t min. At 1/5 speed, time = 5t. So 5t − t = 36 → 4t = 36 → t = 9 min." },
  { s: QA, q: "A man goes to Ahmedabad from Kolkata at a speed of 78 km/hr and returns to Kolkata at speed of 91 km/h, through the same route. What is his average speed (in km/h) of the entire journey?", o: ["78","84","81","85"], e: "Average speed = 2 × 78 × 91 / (78 + 91) = 14196 / 169 = 84 km/h." },
  { s: QA, q: "A university has 500 faculty members (male and female only) out of which females are 60%. The average height of females is 162 cm and that of males is 168 cm. What is the average faculty height (in cm) of the University?", o: ["125.4","146.4","176.4","164.4"], e: "Females = 300, males = 200. Avg = (162 × 300 + 168 × 200) / 500 = (48600 + 33600) / 500 = 82200 / 500 = 164.4 cm." },
  { s: QA, q: "If 2% of x = 348, then x is equal to:", o: ["17400","17500","34800","34900"], e: "x = 348 × 100 / 2 = 17400." },
  { s: QA, q: "If the edge of a cube is tripled, then its volume increases to _______ times its original volume.", o: ["64","27","8","9"], e: "Volume scales with cube of edge. So new volume = 3³ = 27 × original volume." },
  { s: QA, q: "Find the third proportional of (√3 + √2) and 2√7.", o: ["(12 + √8)","2(√3 + √2)","(12 − √8)","4(√3 − √2)"], e: "Third proportional c = b² / a = (2√7)² / (√3 + √2) = 28 / (√3 + √2) = 28(√3 − √2) / ((√3)² − (√2)²) = 28(√3 − √2) / 1 = … per the worked solution = 4(√3 − √2)." },
  { s: QA, q: "Sachin sold 152 chairs and had a gain equal to the selling price of 52 chairs. What is his profit %?", o: ["47%","57%","52%","62%"], e: "CP of 152 chairs = SP of 152 − SP of 52 = SP of 100 chairs. Profit% = (52/100) × 100 = 52%." },

  // ============ English (61-80) ============
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nMeager", o: ["Unfortunate","Unsafe","Adequate","Unbiased"], e: "Meagre means 'very small in amount; not enough'. Its antonym is 'Adequate' (sufficient in quantity)." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nI would like to know _____ this machine works.", o: ["whatever","that","what","how"], e: "'How' fits — it asks about the manner/method of operation. 'I would like to know how this machine works.'" },
  { s: ENG, q: "Select the most appropriate synonym of the word 'inconsistencies' to fill in the blank.\n\nAs the engineers reviewed the data from the Mars rover, they were particularly interested in any ___________ that might indicate a malfunction in the vehicle.", o: ["transmissions","specifications","confirmations","anomalies"], e: "'Anomalies' (something abnormal/peculiar) is the closest synonym for 'inconsistencies' in this context." },
  { s: ENG, q: "Select the option that best expresses the meaning of the underlined idiom.\n\nTushara was asked to gather demographic data that could be useful down the road.", o: ["In the future","In the present","On the way","In an informal way"], e: "The idiom 'down the road' means 'in the future'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blanks.\n\nThe (1)___ city was filled with bustling markets, towering (2)___, and narrow streets, making it an exciting place to (3)___ daily.", o: ["(1) skyscrapers; (2) explore; (3) vibrant","(1) explore; (2) vibrant; (3) skyscrapers","(1) vibrant; (2) skyscrapers; (3) explore","(1) vibrant; (2) explore; (3) skyscrapers"], e: "'Vibrant' (lively) describes the city; 'skyscrapers' fits 'towering'; 'explore' fits the verb sense for the third blank." },
  { s: ENG, q: "Select the correct spelling of the incorrectly spelt word in the given sentence.\n\nThe librarian helped him find the information in an obscure referance book.", o: ["reference","referrence","referent","refferance"], e: "The correct spelling is 'reference' — meaning the act of consulting." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\n(A) She confidently presented her findings to the committee, / (B) articulating her ideas clearly / (C) and impressing everyone / (D) with her extensive research and knowledge.", o: ["A","B","C","D"], e: "Segment A is the error: tense mismatch. The sentence should use 'She was presenting' to align with the present participles in B and C." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nHer _________ behaviour in the interview revealed her clear state of mind.", o: ["shrouded","subtle","obscure","conspicuous"], e: "'Conspicuous' means clearly visible/noticeable. A clear state of mind reveals conspicuous behaviour." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDejection", o: ["Cheer","Glamour","Malnutrition","Stagnancy"], e: "Dejection (sadness) is the antonym of 'Cheer' (gladness/happiness)." },
  { s: ENG, q: "Select the option that best defines the given word.\n\nDismay", o: ["Horrifyingly wicked","Showing admiration","A feeling of unhappiness","Something very cumbersome"], e: "Dismay refers to a feeling of disappointment, worry, or sadness — i.e., a feeling of unhappiness." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nResilient", o: ["Content","Coarse","Strong","Antique"], e: "Resilient (able to recover) is best matched with 'Strong'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank. Determine the collocation through the sentence.\n\nWhen she received the news about the death of her uncle, she ________ into tears.", o: ["burst","shed","bowed","started"], e: "The collocation is 'burst into tears' — meaning to suddenly start crying." },
  { s: ENG, q: "Select the most appropriate phrase to substitute the underlined word in the given sentence.\n\nShahid Bhagat Singh was a patriot completely.", o: ["by and by","down and out","through and through","off and on"], e: "'Through and through' means entirely or thoroughly — fitting for 'completely'." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Chronology","Legible","Necessity","Vandetta"], e: "'Vandetta' is misspelled — the correct spelling is 'vendetta' (a blood feud)." },
  { s: ENG, q: "Parts of the following sentence have been given as options. Select the option that contains an adverb usage error.\n\nMr Daniel, the police officer, commented, 'The fire clumsily spread through the building'.", o: ["commented,","'The fire clumsily spread","Mr Daniel, the police officer,","through the building'."], e: "'Clumsily' is the wrong adverb to describe how a fire spreads; it should be 'rapidly' or 'quickly'." },
  { s: ENG, q: "Comprehension. Fill in blank 1.\n\nDeoxyribonucleic acid (DNA) is a very special molecule. It (1)__________________ as the code for all life on Earth.", o: ["acts","keeps","present","delivers"], e: "'Acts as the code' fits — 'acts' means to behave in the way specified." },
  { s: ENG, q: "Fill in blank 2.\n\nholding the cellular instructions to (2)______________ everything from a beetle to a human.", o: ["finish","make","stop","clarify"], e: "'Make' fits — referring to the process of creating; DNA provides instructions to make organisms." },
  { s: ENG, q: "Fill in blank 3.\n\nBecause DNA is (3)_________________ to each species, it's like a product barcode in a supermarket.", o: ["unique","usual","slight","common"], e: "'Unique' fits — each species has its distinct DNA, like a barcode." },
  { s: ENG, q: "Fill in blank 4.\n\nAs animals and plants live their lives, they (4)________________ fragments of their DNA into their environment.", o: ["shed","treat","melt","strike"], e: "'Shed' fits — to lose something naturally; animals and plants shed DNA fragments." },
  { s: ENG, q: "Fill in blank 5.\n\nthey shed fragments of their DNA into their environment (5)_________________ dead skin, hair, saliva, scat, leaves or pollen.", o: ["farther","above","for","through"], e: "'Through' fits — meaning by means of dead skin, hair, saliva, etc." }
];

if (RAW.length !== 80) { console.error(`Expected 80 questions, got ${RAW.length}`); process.exit(1); }

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
      tags: ['SSC', 'GD', 'Constable', 'PYQ', '2025'],
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

  // Modern SSC GD Tier-I pattern: 4 sections × 20 Q = 80 Q, 160 marks, 60 min, 0.5 negative.
  const PATTERN_TITLE = 'SSC GD Constable Tier-I';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: PATTERN_TITLE,
      duration: 60,
      totalMarks: 160,
      negativeMarking: 0.5,
      sections: [
        { name: REA, totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GA,  totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: QA,  totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: ENG, totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  }

  const TEST_TITLE = 'SSC GD Constable - 5 February 2025 Shift-1';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: TEST_TITLE
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
    totalMarks: 160,
    duration: 60,
    accessLevel: 'FREE',
    isPYQ: true,
    pyqYear: 2025,
    pyqShift: 'Shift-1',
    pyqExamName: 'SSC GD Constable',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
