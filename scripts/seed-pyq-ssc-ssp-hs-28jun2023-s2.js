/**
 * Seed: SSC Selection Post Phase XI 2023 (Higher Secondary Level) PYQ - 28 June 2023, Shift-2 (100 questions)
 * Source: SSC official response sheet (PDF + docx, English version).
 * Section order: REA → GA → QA → ENG.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-hs-28jun2023-s2.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun28_s2";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-hs-28jun2023-s2';

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

async function uploadFile(localPath, publicId) {
  if (!fs.existsSync(localPath)) return '';
  const res = await cloudinary.uploader.upload(localPath, {
    folder: CLOUDINARY_FOLDER,
    public_id: publicId,
    overwrite: true,
    resource_type: 'image'
  });
  return res.secure_url;
}

const F = '28-jun-2023-s2';

const IMAGE_MAP = {
  // REA
  2:  { q: 'image4.jpeg', opts: ['image5.jpeg','image6.png','image7.png','image8.jpeg'] },
  15: { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] },
  16: { q: 'image14.jpeg', opts: ['','','',''] },

  // QA (overall 51-75)
  53: { q: 'image15.jpeg', opts: ['image16.jpeg','image17.jpeg','image18.jpeg','image19.jpeg'] },
  54: { q: 'image20.jpeg', opts: ['','','',''] },
  56: { q: 'image21.jpeg', opts: ['','','',''] },
  59: { q: 'image22.jpeg', opts: ['','','',''] },
  60: { q: 'image23.jpeg', opts: ['','','',''] },
  66: { q: 'image24.jpeg', opts: ['','','',''] },
  70: { q: '', opts: ['image25.jpeg','image26.jpeg','image27.jpeg','image28.jpeg'] },
  71: { q: '', opts: ['image29.jpeg','image30.jpeg','image31.jpeg','image32.jpeg'] },
  72: { q: 'image33.jpeg', opts: ['image34.jpeg','image35.jpeg','image36.jpeg','image37.jpeg'] },
  73: { q: 'image38.jpeg', opts: ['','','',''] }
};

const KEY = [
  // REA (1-25)
  1, 4, 2, 1, 3,   3, 4, 4, 4, 3,   3, 4, 3, 3, 2,   2, 2, 3, 1, 2,   1, 2, 3, 4, 2,
  // GA (26-50) — many overrides per GK
  2, 3, 1, 2, 2,   1, 2, 2, 3, 1,   4, 3, 2, 1, 1,   3, 2, 3, 4, 4,   3, 4, 3, 4, 3,
  // QA (51-75) — Q61 override 4 (scheme math)
  3, 2, 1, 4, 1,   1, 3, 2, 3, 2,   4, 1, 2, 2, 3,   2, 3, 2, 2, 1,   3, 2, 1, 4, 3,
  // ENG (76-100) — Q86 override 2 (died), Q87 override 1 (about), Q92 override 2 (damage), Q99 override 3 (NOT in control of mind)
  4, 2, 4, 1, 3,   4, 4, 4, 4, 4,   2, 1, 4, 1, 3,   2, 2, 2, 3, 3,   1, 2, 4, 3, 3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nUproar : Peace :: Gloom : ?", o: ["Delight","Obscurity","Shade","Murk"], e: "Uproar and Peace are antonyms; Gloom and Delight are antonyms. Option 1." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nAll dinosaurs are extinct. No tigers are extinct. Some tigers are omnivores.\n\nConclusions:\nI. Some omnivores are dinosaurs.\nII. No tigers are dinosaurs.\nIII. Some tigers are dinosaurs.", o: ["Only conclusions II and III follow","Only conclusion II follows","Only conclusions I and III follow","Only conclusions I and II follow"], e: "All dinosaurs are extinct; no tigers are extinct → no tigers are dinosaurs (II ✓). I and III not certain. Option 2." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and balance the given equation.\n\n11 * 4 * 12 * 14 * 7 * 530", o: ["×, ×, +, ×, =","×, −, +, ×, =","−, ×, +, ×, =","+, ×, +, ×, ="], e: "Per response sheet, option 1." },
  { s: REA, q: "Family-relation puzzle: 'B%D' sister, 'B&D' father, 'B×D' husband, 'B#D' brother, 'B$D' wife, 'B@D' mother-in-law.\n\nIn A×B@C$D#E&K, how is A related to K?", o: ["Paternal uncle","Sibling","Grandfather","Brother"], e: "A is B's husband; B is C's mother-in-law (so C married B's child); E father of K → K is grandchild of B → A is grandfather of K. Option 3." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Goodness  2. Gooseberry  3. Goodbye  4. Goodwill  5. Goodies", o: ["4, 1, 5, 2, 3","2, 4, 5, 1, 3","3, 5, 1, 4, 2","1, 2, 3, 4, 5"], e: "Goodbye(3), Goodies(5), Goodness(1), Goodwill(4), Gooseberry(2) → 3,5,1,4,2. Option 3." },
  { s: REA, q: "Family-relation puzzle: 'A+B' brother, 'A×B' mother, 'A÷B' husband, 'A−B' sister, 'A@B' son.\n\nIn P×Q+R@S+T, how is P related to T?", o: ["Husband's brother","Husband","Son","Brother's wife"], e: "Per response sheet, option 4 (Brother's wife)." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following human body parts from top to bottom.\n\n1. Waist  2. Neck  3. Legs  4. Chest  5. Eyes", o: ["2, 1, 4, 5, 3","2, 5, 1, 4, 3","5, 4, 2, 1, 3","5, 2, 4, 1, 3"], e: "Top to bottom: Eyes(5), Neck(2), Chest(4), Waist(1), Legs(3) → 5,2,4,1,3. Option 4." },
  { s: REA, q: "Select the combination of letters that when sequentially placed from left to right in the blanks of the given series will complete the letter series.\n\nA_E_IAC_G___EGIACE__", o: ["C E G I A C I G","C G I E A C I G","C G E I A I G C","C G E I A C G I"], e: "Per response sheet, option 4 (C G E I A C G I)." },
  { s: REA, q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term.\n\n22 : 52 :: 17 : ? :: 42 : 92", o: ["48","44","42","34"], e: "Pattern n×2 + 8. 22×2+8=52 ✓; 42×2+8=92 ✓; 17×2+8=42. Option 3." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\nJ_K_ON_LKM_N_ L_MO_", o: ["LMOJJNK","LMOKNKJ","LMJOJKN","LMJLMJO"], e: "Per response sheet, option 3 (LMJOJKN)." },
  { s: REA, q: "In a certain code language, 'DISHRAG' is coded as '132' and 'ENVELOPE' is coded as '188'. How will 'IMMINENT' be coded in that language?", o: ["139","167","107","194"], e: "Sum of alphabetical positions × 2. IMMINENT = 9+13+13+9+14+5+14+20 = 97 × 2 = 194. Option 4." },
  { s: REA, q: "In a certain code language, 'VIOLENT' is coded as '104' and 'UPDATED' is coded as '78'. How will 'TOUCHED' be coded in that language?", o: ["65","93","83","26"], e: "Per response sheet, option 3 (83)." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nSon : Daughter :: Fox : ?", o: ["Witch","Doe","Vixen","Filly"], e: "Son↔Daughter (male/female human). Fox↔Vixen (male/female fox). Option 3." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "Answer based on the figure shown.", o: ["T","S","R","U"], e: "Per response sheet, option 2 (S)." },
  { s: REA, q: "In a certain code language, 'PAWS' is written as '59' and 'CLAW' is written as '39'. How will 'TOES' be written in that language?", o: ["69","59","39","29"], e: "Sum of letter positions. TOES = 20+15+5+19 = 59. Option 2." },
  { s: REA, q: "'M+O' means M is the father of O; 'M×O' means M is the mother of O; 'M−O' means M is the brother of O; 'M÷O' means M is the sister of O.\n\nWhat does 'W+T+S' mean?", o: ["W is the father of S","W is the sister of S","W is the father's father of S","W is the brother of S"], e: "W father of T; T father of S → W is S's father's father (grandfather). Option 3." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\n\nBA, DC, _E, H_, JI, _K", o: ["FGL","LGF","GGL","GFL"], e: "Pattern: each pair = consecutive letters reversed (BA, DC, FE, HG, JI, LK). Missing: F (pos 3 first), G (pos 4 second), L (pos 6 first). FGL. Option 1." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and balance the given equation.\n\n2 * 16 * 11 * 12 * 4 * 355", o: ["×, +, +, ×, =","×, ×, +, ÷, =","−, ×, +, ×, =","×, −, +, ×, ="], e: "Option 2: 2 × 16 × 11 + 12 ÷ 4 = 352 + 3 = 355 ✓. Option 2." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nSome pages are words. All pages are books. All words are registers.\n\nConclusions:\nI. Some books are registers.\nII. Some books are words.\nIII. All pages are registers.", o: ["Only conclusions I and II follow.","All conclusions follow.","Only conclusions II and III follow.","Only conclusions I and III follow."], e: "Some pages⊆words⊆registers and pages⊆books → some books are registers (I ✓). Some pages are words ⊆ books → some books are words (II ✓). III not certain. Option 1." },
  { s: REA, q: "Letter-cluster analogy.\n\nGROUNDED : UORGDEDN :: SPECIALS : CEPSSLAI :: BOOKENDS : ?", o: ["KOBOSDNE","KOOBSDNE","KOBODSNE","KOOBDSNE"], e: "Pattern rearranges positions to 4,3,2,1,8,7,6,5. BOOKENDS → K,O,O,B,S,D,N,E = KOOBSDNE. Option 2." },
  { s: REA, q: "In a certain code language, 'HAPPY' is written as 'SZKKB' and 'SOUND' is written as 'HLFMW'. How will 'SNORE' be written in that language?", o: ["MHLIV","HMLEV","HMLIV","HMLUV"], e: "Mirror code (A↔Z). SNORE → HMLIV. Option 3." },
  { s: REA, q: "In a certain code language, 'SUPER' is coded as '61' and 'COLOR' is coded as '77'. How will 'CENTER' be coded in that language?", o: ["88","98","65","103"], e: "Per response sheet, option 4 (103)." },
  { s: REA, q: "Letter-cluster analogy.\n\nLOGO : PHPM :: MOCK : LDPN :: DEAR : ?", o: ["EFBS","SBFE","SCFE","SBEF"], e: "Per response sheet, option 2 (SBFE)." },

  // ============ GA (26-50) ============
  { s: GA, q: "Which of the following food items can be used as natural food preservatives?", o: ["Vinegar, ginger, apple and banana","Garlic, lemon, sugar and vinegar","Garlic, apple, salt and tamarind","Ginger, garlic, banana and tamarind"], e: "Sugar, vinegar, salt, lemon are classic natural preservatives. Option 2." },
  { s: GA, q: "Who among the following won the 2022 JCB Prize for Literature for his book 'The Paradise of Food'?", o: ["AS Panneerselvan","Amitabha Bagchi","Khalid Jawed","Ramchandra Guha"], e: "Khalid Jawed won the 2022 JCB Prize for Literature (translation by Baran Farooqi). Option 3." },
  { s: GA, q: "Nagarjuni Caves were donated to which of the following sects by Mauryans?", o: ["Ajivika","Buddhism","Lokayat","Jainism"], e: "Nagarjuni caves (donated by Dasaratha) and Barabar caves (Ashoka) were given to Ajivikas. Option 1." },
  { s: GA, q: "Which of the following is NOT a Constitutional Body in India?", o: ["Election Commission of India","State Human Rights Commission","State Public Service Commission","Union Public Service Commission of India"], e: "State Human Rights Commission is a statutory body (under PHR Act 1993), not a constitutional body. Option 2." },
  { s: GA, q: "Which Kabaddi player received the defender of the season award of the Pro Kabaddi League Season 8?", o: ["Mohit Goyat","Mohammadreza Chiyaneh shadloui","Naveen Kumar","Pradeep Narwal"], e: "Iran's Mohammadreza Chiyaneh won the Defender of the Season award in PKL 8. Option 2." },
  { s: GA, q: "Name the hot, dry oppressing winds that blow in between Delhi and Patna.", o: ["Loo","Mango shower","Nor westers","Blossom shower"], e: "'Loo' is the hot dry summer wind over north India (Delhi-Patna belt). Option 1." },
  { s: GA, q: "Which festival celebrated by Muslims is also known as Barawafat?", o: ["Muharram","Milad-un-Nabi","Id-ul-Zuha","Shab-e-Barat"], e: "Milad-un-Nabi (Prophet's birthday) is also called Barawafat. Option 2." },
  { s: GA, q: "The noted danseuse Yamini Krishnamurthy opened Yamini School of Dance in _________, in the year 1990.", o: ["Mumbai","Delhi","Chennai","Hyderabad"], e: "Yamini Krishnamurthy opened her school in New Delhi in 1990. Option 2." },
  { s: GA, q: "The name of Bhajan Sopori is associated with which musical instrument?", o: ["Sitar","Surbahar","Santoor","Sarod"], e: "Pt. Bhajan Sopori was the legendary Santoor maestro (Sufiana Gharana). Option 3." },
  { s: GA, q: "Which stone could convert all baser metals like iron into gold?", o: ["Philosopher's stone","Emerald","Jade","Copper stone"], e: "The 'Philosopher's stone' is the legendary alchemical substance said to transmute base metals to gold. Option 1." },
  { s: GA, q: "Which of the following rulers is credited with the construction of Purana Quila in Delhi?", o: ["Babar and Akbar","Qutub ud din and Illtutmish","ShahJahan and Jahangir","Humayun and Sher Shah"], e: "Purana Qila was started by Humayun and completed by Sher Shah Suri. Option 4." },
  { s: GA, q: "The capacity of Vishakhapatnam, one of the oil refinery of Hindustan Petroleum Corporation Ltd, is:", o: ["6.5 million metric tonnes per annum","9.69 million metric tonnes per annum","8.3 million metric tonnes per annum","5.5 million metric tonnes per annum"], e: "HPCL Visakh refinery capacity is 8.3 MMTPA. Option 3." },
  { s: GA, q: "Who became India's second highest wicket taker in Tests after Anil Kumble by taking his 435th test wicket in March 2022?", o: ["Yuzvendra Chahal","Ravichandran Ashwin","Ishant Sharma","Mohammed Shami"], e: "R Ashwin overtook Kapil Dev to become India's 2nd highest Test wicket-taker in March 2022. Option 2." },
  { s: GA, q: "The Constitution (One Hundred and Twenty Seventh Amendment) Bill, 2021, was introduced in the Lok Sabha by the ______ in August 2021.", o: ["Minister of Social Justice and Empowerment","Minister of Minority Affairs","Minister of Tribal Affairs","Minister of Rural Development"], e: "The 127th Const. Amendment Bill (OBC list — became 105th Amendment Act) was introduced by Virendra Kumar, Minister of Social Justice & Empowerment. Option 1." },
  { s: GA, q: "Which of the following correctly define the way the unemployment rate is calculated in India?", o: ["The percentage of persons unemployed among the persons in the labour force","The percentage of persons unemployed among the total population","The percentage of persons in labour force","The percentage of employed persons in the population"], e: "Unemployment rate = unemployed / labour force × 100. Option 1." },
  { s: GA, q: "The Election Commission of India was established in ________.", o: ["1953","1952","1950","1951"], e: "The Election Commission of India was established on 25 January 1950. Option 3." },
  { s: GA, q: "The famous tripartite struggle was fought for control over ________ in early medieval period.", o: ["Mudgagiri","Kannauj","Pataliputra","Manyakheta"], e: "The Palas, Rashtrakutas and Pratiharas fought the tripartite struggle for control of Kannauj. Option 2." },
  { s: GA, q: "Vasanta Ritu falls in which months, according to the Gregorian Calendar?", o: ["January-February","July-August","March-April","May-June"], e: "Vasanta Ritu (Spring) covers Phalgun-Chaitra ≈ March-April. Option 3." },
  { s: GA, q: "How many Directive Principles were added or amended in the Indian Constitution by the 42nd Amendment Act of 1976?", o: ["Five","Three","Two","Four"], e: "The 42nd Amendment (1976) added/amended four Directive Principles (Arts 39A, 43A, 48A + amendments to 39). Option 4." },
  { s: GA, q: "When was the Duckworth-Lewis formula used for the first time in international cricket?", o: ["1 January 1998","1 January 1999","1 January 1996","1 January 1997"], e: "The D/L method was first used in a ZIM vs ENG ODI on 1 January 1997. Option 4." },
  { s: GA, q: "Who among the following founded the Depressed Classes Association, in 1930?", o: ["Swami Sahajanand Saraswati","Mahatma Gandhi","Dr. BR Ambedkar","Jayaprakash Narayan"], e: "Dr. B.R. Ambedkar founded the Depressed Classes Association in 1930. Option 3." },
  { s: GA, q: "Choose from the following the novel written by Salman Rushdie.", o: ["In a Free State","A Bend in the River","An Area of Darkness","The Satanic Verses"], e: "'The Satanic Verses' (1988) is by Salman Rushdie. Option 4." },
  { s: GA, q: "In which Five-year plan was the following statement quoted?\n\n\"The urge to bring economic and social change under present conditions comes from the fact of poverty and inequalities in income, wealth and opportunity\".", o: ["Second Five-year plan","Fourth Five-year plan","First Five-year plan","Third Five-year plan"], e: "Per response sheet, option 3 (First Five-year plan)." },
  { s: GA, q: "Which of the following traditional dances is mainly performed during Navaratri?", o: ["Ras leela","Nati","Dumhal","Garba"], e: "Garba is performed during Navaratri (Gujarat). Option 4." },
  { s: GA, q: "What will be the focal length of a convex lens with the power of a +2.5 Diopter?", o: ["20 cm","10 cm","40 cm","5 cm"], e: "f (m) = 1/P = 1/2.5 = 0.4 m = 40 cm. Option 3." },

  // ============ QA (51-75) ============
  { s: QA, q: "The speed of a boat when travelling downstream is 48 km/h, whereas when travelling upstream it is 32 km/h. What is the speed of the boat in still water?", o: ["80 km/h","30 km/h","40 km/h","20 km/h"], e: "Boat speed = (downstream + upstream)/2 = (48+32)/2 = 40 km/h. Option 3." },
  { s: QA, q: "△ABC ~ △LMN and their perimeters are 72 cm and 48 cm, respectively. If LM = 8 cm, then what is the length of AB (in cm)?", o: ["14","12","10","8"], e: "Similar triangles: AB/LM = 72/48 = 3/2 → AB = 12 cm. Option 2." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "Answer based on the figure shown.", o: ["2625.5","2255.5","1925.5","2425.5"], e: "Per response sheet, option 4 (2425.5)." },
  { s: QA, q: "10 men can complete a work in 12 days, and 10 women can complete the same work in 6 days. How many days will it take to complete the work if they work together?", o: ["4 days","9 days","12 days","6 days"], e: "Combined rate = 1/12 + 1/6 = 1/4 → 4 days. Option 1." },
  { s: QA, q: "There was a mock test conducted in a class. The following are the scores of the students who gave all the tests. What is the average score of the subject that has the highest average score for all the students?", o: ["131","129.33","133.33","126"], e: "Per response sheet, option 1 (131)." },
  { s: QA, q: "For what value of q does the system of equations 38x + qy + 171 = 0 and 46x + 414y + 207 = 0 have infinite number of solutions?", o: ["380","345","342","350"], e: "Infinite solutions: a1/a2 = b1/b2 = c1/c2. 38/46 = q/414 → q = 414 × 38/46 = 342. Option 3." },
  { s: QA, q: "Raman buys 18 kg of rice at ₹35 per kg and 30 kg of rice at ₹39 per kg. Find the average price (in ₹) per kg of the total rice.", o: ["39","37.5","38.5","38"], e: "Avg = (18×35 + 30×39)/48 = 1800/48 = 37.5. Option 2." },
  { s: QA, q: "Answer based on the figure shown.", o: ["D","C","A","B"], e: "Per response sheet, option 3 (A)." },
  { s: QA, q: "Answer based on the figure shown.", o: ["50","54","56","52"], e: "Per response sheet, option 2 (54)." },
  { s: QA, q: "A trader offers to sell a commodity under any of the two schemes mentioned below:\n\nScheme 1: The trader offers two successive discounts of 20% and 12.5% on the sale of each unit.\nScheme 2: The trader offers the buyer an option to 'pay for y units, get z units free'.\nThe buyer realizes that if he needs to buy (y + z) units, it does not matter to him which of the two schemes he opts for.\n\nWhich of the following options gives a correct ordered pair of (y, z)?", o: ["(3, 7)","(7, 10)","(10, 7)","(7, 3)"], e: "Scheme 1 net = 0.8 × 0.875 = 0.7 → 30% discount. Scheme 2 discount = z/(y+z). 30% = z/(y+z) → 3y = 7z. Pair (7,3) gives 3/10 = 30% ✓. Option 4." },
  { s: QA, q: "If tan 15θ = cot 15θ (0° < θ < 10°), then the value of θ is:", o: ["3°","1°","9°","6°"], e: "tan(x) = cot(x) → tan²(x) = 1 → x = 45°. 15θ = 45 → θ = 3°. Option 1." },
  { s: QA, q: "If x = 14, y = 15 and z = 17, then the value of x³ + y³ + z³ − 3xyz is:", o: ["333","322","312","222"], e: "x+y+z=46. x²+y²+z²=710. xy+yz+zx=703. Diff = 7. Result = 46 × 7 = 322. Option 2." },
  { s: QA, q: "A policeman follows a thief, who is 1 km ahead of him. The thief and the policeman run at speeds of 8 km/h and 10.5 km/h, respectively. What distance (in km) is run by the thief before he is nabbed by the policeman?", o: ["4.4","3.2","3.6","2.5"], e: "Relative speed = 2.5 km/h. Time = 1/2.5 = 0.4 h. Thief distance = 8 × 0.4 = 3.2 km. Option 2." },
  { s: QA, q: "Find the least value of '@' to make the number 7@5471 perfectly divisible by 9.", o: ["6","1","3","4"], e: "Digit sum = 24+@. Must be ÷9 → @=3 (sum 27). Option 3." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Rs.1,250","Rs.1,400","Rs.1,200","Rs.1,350"], e: "Per response sheet, option 2 (Rs.1,400)." },
  { s: QA, q: "Two-thirds of a certain distance was covered at the speed of 15 km/h, one-fifth at the speed of 25 km/h and the rest at the speed of 50 km/h. Find the average speed (in km/h) for the whole journey (rounded off to two decimal places).", o: ["22.65","25.25","18.15","20.25"], e: "Times: (2/3)/15 + (1/5)/25 + (2/15)/50. Avg = 1/(2/45 + 1/125 + 2/750) ≈ 18.15 km/h. Option 3." },
  { s: QA, q: "What is the least value of * so that the number 457643*4 is divisible by 18?", o: ["9","3","4","5"], e: "Need ÷2 (✓ ends in 4) and ÷9 (digit sum 33+* ÷9 → *=3). Option 2." },
  { s: QA, q: "The marked price of a commodity was given as ₹y per kg. After two successive discounts of 8% and 12.5%, respectively, the retailer purchased it for ₹3,059 per kg. What was the value of y?", o: ["3840","3800","3900","3750"], e: "y × 0.92 × 0.875 = 3059 → y × 0.805 = 3059 → y = 3800. Option 2." },
  { s: QA, q: "A shopkeeper keeps the marked price of his goods 50% more than the cost price. If he gives successive discounts of 5%, 10% and 20% on marked price, then what is his profit percentage?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "SP = 1.5 × 0.95 × 0.9 × 0.8 × CP = 1.026 CP → 2.6% profit. Per response sheet, option 1." },
  { s: QA, q: "A dealer sells rice at a profit of 15% and uses a weight that is 15% less than the actual weight. Find his percentage gain.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Effective gain = (1.15/0.85 − 1) × 100 ≈ 35.29%. Per response sheet, option 3." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "Answer based on the figure shown.", o: ["1973","1972","1974","1975"], e: "Per response sheet, option 1 (1973)." },
  { s: QA, q: "On reducing the entry fee by 25% in a museum, the number of people coming to the museum increased by 50%, Find the percentage increase or decrease in the collection of the entry fee.", o: ["10% decrease","12.5% decrease","10% increase","12.5% increase"], e: "New collection = 0.75 × 1.5 = 1.125 → 12.5% increase. Option 4." },
  { s: QA, q: "If x : y = 2 : 1, find the value of (2x + 3y) : (4x + 7y).", o: ["3 : 5","7 : 5","7 : 15","3 : 15"], e: "x=2k, y=k. (4k+3k):(8k+7k) = 7:15. Option 3." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\n\nHer collection consists of rare stamps.", o: ["Disposed","Essential","Unique","Common"], e: "Antonym of 'rare' = Common. Option 4." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA building containing interesting, rare, and old objects", o: ["Auditorium","Museum","Stockroom","Mansion"], e: "A museum houses interesting/rare/old objects. Option 2." },
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order to form a meaningful and coherent paragraph.\n\nA. I was taking a stroll along the beach, when I came across a heap of plastic waste.\nB. Realising the importance of removing the waste, I joined them.\nC. Some children came to clean the beach, seeing the dumped waste.\nD. The adjacent industry had dumped the waste, which was floating, into the water, therefore polluting the sea water.", o: ["DCAB","BADC","ADBC","ADCB"], e: "A (found waste) → D (industry dumped) → C (children came) → B (joined them) = ADCB. Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nHumble", o: ["Pompous","Brilliant","Meek","Compliant"], e: "Antonym of 'Humble' = Pompous. Option 1." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Unconscious","Unnatural","Vaccant","Vengeance"], e: "'Vaccant' is misspelled — correct is 'Vacant'. Option 3." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nPull yourself together", o: ["Fight violently","Work overtime","Help the needy","Calm down"], e: "'Pull yourself together' = compose yourself / calm down. Option 4." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Inflammatory","Whether","Zodiac","Communiqe"], e: "'Communiqe' is misspelled — correct is 'Communiqué'. Option 4." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nThe old man now cherishes only broken memories.", o: ["unified","compact","rectified","fragmented"], e: "'Broken memories' ≈ fragmented memories. Option 4." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nThe policemen thoroughly examined the room where the theft had happened.", o: ["restricted","scrambled","groped","inspected"], e: "'Thoroughly examined' ≈ 'inspected'. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nShe asked, \"Where do you live?\"", o: ["She asked me where I had lived.","She told me where I lived.","She asked me where I had been living.","She asked me where I lived."], e: "Direct 'do you live' → indirect 'where I lived'. Option 4." },
  { s: ENG, q: "Select the most appropriate option that can substitute the words in the brackets in the given sentence.\n\nTen years have passed since my father (is dead).", o: ["had died","died","was dead","had been dead"], e: "After 'since' use simple past: 'my father died'. Option 2." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nOne is sure ________ what one sees.", o: ["about","with","around","without"], e: "'Sure about' is the standard collocation. Option 1." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nHe is as concerned as me / regarding / the renewed / examination schedule.", o: ["the renewed","examination schedule","regarding","He is as concerned as me"], e: "Should be 'as concerned as I' (subjective). Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nIce-cream is liked by her.", o: ["She likes ice-cream.","She like to eat ice-cream.","She like ice-cream.","She loves ice-cream."], e: "Passive 'is liked by her' → active 'She likes'. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in reported speech.\n\nI said, \"They never help anybody\".", o: ["I said nobody helped them.","I said they never help anybody.","I said that they never helped anybody.","I said them never helped anybody."], e: "Present simple 'help' → past simple 'helped' in reported speech. Option 3." },
  { s: ENG, q: "Read the Healthy Diet passage.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'A healthy diet is (1)_________ in fibre, whole grains...'", o: ["easy","rich","wealthy","prosperous"], e: "'Rich in fibre' is the standard collocation. Option 2." },
  { s: ENG, q: "Read the Healthy Diet passage.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'inflammation, which can (2)__________ tissue, joints, artery walls and organs'", o: ["resuscitate","damage","revive","casualty"], e: "Inflammation can damage tissues/organs. Option 2." },
  { s: ENG, q: "Read the Healthy Diet passage.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'Going easy on processed foods is another (3)_________ of healthy eating'", o: ["ground","element","cause","compartment"], e: "'Another element of healthy eating' fits the context. Option 2." },
  { s: ENG, q: "Read the Healthy Diet passage.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'beverages can (4)_________ spikes in blood sugar'", o: ["reason","amend","cause","provision"], e: "'Cause spikes in blood sugar' is the natural collocation. Option 3." },
  { s: ENG, q: "Read the Healthy Diet passage.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'High blood sugar is (5)_________ the development of diabetes, obesity...'", o: ["source of","made of","linked to","affiliated to"], e: "'Linked to the development of diabetes' is the standard phrase. Option 3." },
  { s: ENG, q: "Read the Positivity passage.\n\nSelect the most appropriate option that depicts the central theme of the passage.", o: ["Being happy and content are the keys to a successful life.","Positive and negative emotions are a part of life.","Man has polluted life and environment both.","God is the supreme power."], e: "Passage emphasises happiness, positivity and success. Option 1." },
  { s: ENG, q: "Read the Positivity passage.\n\nSelect the most appropriate ANTONYM for 'Periphery'.", o: ["Troops","Centre","Clatter","Divine"], e: "Antonym of 'Periphery' (outer edge) = Centre. Option 2." },
  { s: ENG, q: "Read the Positivity passage.\n\nAccording to the passage, what is the human soul hungry for?", o: ["More wealth","Success","A positive feeling","A smile"], e: "'Your soul is hungry for a smile from you.' Option 4." },
  { s: ENG, q: "Read the Positivity passage.\n\nSelect the option that is NOT true, according to the passage.", o: ["One should take out time to look deep into oneself.","Life has so much to offer.","Human beings are in control of their mind.","Money gives freedom to do whatever we want to do."], e: "Passage explicitly says 'We are not in control of our mind.' Option 3 is NOT true. Option 3." },
  { s: ENG, q: "Read the Positivity passage.\n\nSelect the most suitable title for the passage.", o: ["Earth and Environment","Environment Pollution","Core of Human Existence","How to be Successful?"], e: "Passage centres on bliss/positivity at the core of human existence. Option 3." }
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
        const localPath = path.join(EXTRACTED_DIR, imgInfo.q);
        const publicId = `${F}-q-${qNum}`;
        process.stdout.write(`Uploading Q${qNum} question... `);
        questionImage = await uploadFile(localPath, publicId);
        console.log(questionImage ? 'ok' : 'missing');
      }
      if (imgInfo.opts) {
        for (let oi = 0; oi < imgInfo.opts.length; oi++) {
          if (!imgInfo.opts[oi]) { optionImages[oi] = ''; continue; }
          const localPath = path.join(EXTRACTED_DIR, imgInfo.opts[oi]);
          const publicId = `${F}-q-${qNum}-option-${oi + 1}`;
          process.stdout.write(`  opt ${oi + 1}... `);
          optionImages[oi] = await uploadFile(localPath, publicId);
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
      tags: ['SSC', 'Selection Post', 'Phase XI', 'Higher Secondary', 'PYQ', '2023'],
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

  let exam = await Exam.findOne({ code: 'SSC-SSP-HS' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC Selection Post (Higher Secondary Level)',
      code: 'SSC-SSP-HS',
      description: 'Staff Selection Commission - Selection Post (Higher Secondary Level - 12th-pass eligibility)',
      isActive: true
    });
  }

  const PATTERN_TITLE = 'SSC Selection Post (Higher Secondary Level)';
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

  const TEST_TITLE = 'SSC Selection Post Phase XI (Higher Secondary) - 28 June 2023 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2023, pyqShift: 'Shift-2',
    pyqExamName: 'SSC Selection Post Phase XI (Higher Secondary)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
