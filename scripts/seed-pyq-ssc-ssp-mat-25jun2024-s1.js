/**
 * Seed: SSC Selection Post Phase XII 2024 (Matriculation Level) PYQ - 25 June 2024, Shift-1
 * Section order: REA → GA → QA → ENG. Key decoded from green-tick bullets (with 3-extra adjustment).
 *
 * NOTE: S1's docx had 403 bullets vs 400 expected. Brute-force search of all 3-bullet
 * removals produced a UNIQUE consistent answer key (12 valid removal combos all converged).
 * Spot-verified against PDF question texts + GK across all 4 sections.
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun25_2024_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-25jun2024-s1';

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

const F = '25-jun-2024-s1';

const IMAGE_MAP = {
  15: { q: 'image4.png', opts: ['image5.png','image6.png','image7.png','image8.png'] },          // REA figure series
  19: { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] }, // REA mirror
  56: { q: '', opts: ['image14.jpeg','image15.jpeg','image16.jpeg','image17.jpeg'] },             // QA Q6 rectangle err%
  66: { q: 'image18.jpeg', opts: ['image19.jpeg','image20.jpeg','image21.jpeg','image22.jpeg'] }  // QA Q16 image-only
};

const KEY = [
  // REA (1-25)
  1, 1, 2, 1, 4,   1, 2, 2, 2, 3,   2, 3, 4, 4, 4,   4, 1, 4, 3, 3,   1, 3, 3, 4, 4,
  // GA (26-50)
  3, 1, 4, 2, 1,   1, 4, 4, 4, 3,   3, 4, 1, 2, 1,   1, 1, 1, 4, 2,   2, 1, 2, 1, 4,
  // QA (51-75)
  4, 2, 2, 4, 3,   2, 2, 2, 1, 2,   1, 4, 3, 3, 1,   1, 4, 1, 3, 2,   3, 3, 4, 4, 4,
  // ENG (76-100)
  1, 1, 2, 1, 1,   2, 2, 4, 4, 2,   2, 2, 4, 4, 4,   4, 3, 1, 4, 2,   3, 3, 3, 1, 2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n(The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word.)\n\nCat : Kitten :: Bear : ?", o: ["Cub","Child","Fawn","Lamb"], e: "A young cat is a kitten; a young bear is a cub. Option 1." },
  { s: REA, q: "In a code language, 'grass is green' is written as 'pp rr tt', 'vegetables are green' is written as 'rr dd ee', and 'bamboos are grass' is written as 'pp dd mm'. What is the code for the word 'vegetables' in that language?", o: ["ee","rr","dd","pp"], e: "'green' common in #1,#2 → rr. 'are' common in #2,#3 → dd. 'grass' common in #1,#3 → pp. Remaining in #2: ee = vegetables. Option 1." },
  { s: REA, q: "Which option represents the correct order of the given words as they would appear in an English dictionary?\n1. CHATTER\n2. CHASTISE\n3. CHARTER\n4. CHANT\n5. CHAIR", o: ["1, 2, 3, 5, 4","5, 4, 3, 2, 1","1, 3, 2, 5, 4","5, 3, 4, 1, 2"], e: "CHAIR(5), CHANT(4), CHARTER(3), CHASTISE(2), CHATTER(1) → 5,4,3,2,1. Option 2." },
  { s: REA, q: "In a certain code language,\n'A + B' means 'A is the daughter of B', 'A − B' means 'A is the husband of B', 'A × B' means 'A is the mother of B' and 'A ÷ B' means 'A is the father of B'.\nHow is B related to D, if A × B + C ÷ D?", o: ["Sister","Mother","Brother's wife","Brother"], e: "A is mother of B; B is daughter of C; C is father of D. So B and D are both children of C → B is sister of D. Option 1." },
  { s: REA, q: "In a certain language, GATE is coded as FZSD, and PANT is coded as OZMS. How will BANK be coded in the same language?", o: ["KNAB","CBOK","ABKN","AZMJ"], e: "Each letter −1. B−1=A, A−1=Z, N−1=M, K−1=J → AZMJ. Option 4." },
  { s: REA, q: "In a certain code language, SAD is coded as 48 and DOG is coded as 52. What is the code for HIT in that language?", o: ["74","73","47","37"], e: "Sum × 2: S+A+D = 19+1+4 = 24×2 = 48 ✓. D+O+G = 4+15+7 = 26×2 = 52 ✓. H+I+T = 8+9+20 = 37×2 = 74. Option 1." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\nSA_C_ _S_D_A T_ _D C A _ S _DC_ T", o: ["DTATSDADAA","DATACSATAA","SASASSASAA","CASASSASAS"], e: "Per docx answer key, option 2 (DATACSATAA)." },
  { s: REA, q: "In a certain code language, 'BUTTON' is coded as 'CTVRRK' and 'ACTUAL' is coded as 'BBVSDI'. How will 'STRONG' be coded in the same language?", o: ["TRTNQE","TSTMQD","RSTMQD","TSSMRD"], e: "Per docx answer key, option 2 (TSTMQD)." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\nXJPC YLOA ZNNY APMW ?", o: ["BQKU","BRLU","BRKU","CRKU"], e: "Per docx answer key, option 2 (BRLU)." },
  { s: REA, q: "What will come in the place of the question mark (?) in the following equation, if '÷' and '−' are interchanged and '×' and '+' are interchanged?\n[(48 − 2) ÷ 23] × 19 + 3 = ?", o: ["48","68","58","38"], e: "Per docx answer key, option 3 (58)." },
  { s: REA, q: "In a certain code language, 'all fell down' is written as 'jm ib fc', and 'down the road' is coded as 'ib gb tf'. How will 'down' be coded in that language?", o: ["tf","ib","gb","fc"], e: "Common word 'down' in both → common code 'ib'. Option 2." },
  { s: REA, q: "Select the option that is related to the fifth number in the same way as the fourth number is related to the third number and the second number is related to the first number.\n4862 : 6428 :: 3952 : 5392 :: 1758 : ?", o: ["2593","8765","8517","3857"], e: "Per docx answer key, option 3 (8517)." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n1. Western Europe\n2. Germany\n3. Munich\n4. Europe\n5. Bavaria", o: ["4, 1, 5, 3, 2","4, 1, 3, 5, 2","4, 1, 2, 3, 5","4, 1, 2, 5, 3"], e: "Europe(4) → Western Europe(1) → Germany(2) → Bavaria(5) → Munich(3) = 4,1,2,5,3. Option 4." },
  { s: REA, q: "Which of the following terms will replace the question mark (?) in the given series?\nWCKY, XENC, ?, ZITK, AKWO", o: ["YGSY","YCQG","YCSY","YGQG"], e: "Per docx answer key, option 4 (YGQG)." },
  { s: REA, q: "Identify the figure given in the options which when put in place of the question mark (?) will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: REA, q: "Which number will replace the question mark (?) in the following series?\n58, 62, 75, ?", o: ["58","62","75","69"], e: "Per docx answer key, option 4 (69)." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks, will complete the letter series.\n_cb__amcc_e aa_cc_e __m", o: ["c e a b m b a a","c a e b m b e a","c e a b m b e a","c a a b m b a a"], e: "Per docx answer key, option 1 (c e a b m b a a)." },
  { s: REA, q: "Select the numbers from among the given options that can replace the question marks (?) in the following series.\n1, 2, 4, ?, 11, ?, 22", o: ["6, 18","8, 20","5, 17","7, 16"], e: "Differences increase by 1: +1,+2,+3,+4,+5,+6. 1,2,4,7,11,16,22. Missing: 7,16. Option 4." },
  { s: REA, q: "Three statements followed by two conclusions.\nStatements:\nI. No art is a drawing.\nII. Some drawings are paintings.\nIII. All sketches are paintings.\nConclusions:\nI. No sketch is a drawing.\nII. No painting is an art.", o: ["Only conclusion II follows","Both conclusions I and II follow","Neither conclusion I nor II follows","Only conclusion I follows"], e: "Per docx answer key, option 3 (Neither follows)." },
  { s: REA, q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster.\n\nMASTER : RETSAM :: DURING : GNIRUD :: THEORY : ?", o: ["YROEGS","WROHET","YROEHT","ZSOEIS"], e: "Reverse the word: THEORY → YROEHT. Option 3." },
  { s: REA, q: "Identify the figure given in the options which when put in place of the question mark (?) will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at line MN as shown below.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3." },
  { s: REA, q: "In a certain code language,\n'M + N' means 'M is the daughter of N',\n'M − N' means 'M is the father of N',\n'M * N' means 'M is the wife of N',\n'M $ N' means 'M is the son of N'.\nBased on the above, how is A related to C if 'A + B * C'?", o: ["Sister","Mother","Daughter","Mother's sister"], e: "A is daughter of B; B is wife of C → A is daughter of C. Option 3." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\nIJKL, MNOP, QRST, ?, YZAB", o: ["TUYZ","TUWX","UVYZ","UVWX"], e: "Each block shifts +4. After QRST → UVWX. Option 4." },
  { s: REA, q: "In a certain code, PROVIDE is written as QSPWJEF and PLATE is written as QMBUF. What is the code for POND?", o: ["PNOD","RQPF","ONMC","QPOE"], e: "Each letter +1. P+1=Q, O+1=P, N+1=O, D+1=E → QPOE. Option 4." },

  // ============ GA (26-50) ============
  { s: GA, q: "The Sisodiya ruler of Mewar, Amar Singh, accepted Mughal service during the reign of ___________.", o: ["Akbar","Shah Jahan","Jahangir","Aurangzeb"], e: "Amar Singh of Mewar signed treaty with Jahangir (1615). Option 3." },
  { s: GA, q: "Which of the following Articles of the Constitution of India deals with the appointment of the Comptroller and Auditor General of India?", o: ["Article 148","Article 145","Article 146","Article 140"], e: "Article 148 deals with appointment of CAG. Option 1." },
  { s: GA, q: "Launched in March 2023, the VAIBHAV fellowship for Indian diaspora that aims at improving the research ecosystem of India's Higher Educational and Scientific Institutions is for a researcher engaged in an overseas academic/research/industrial organisation working in the top _________ QS World University Ranking.", o: ["300","200","400","500"], e: "VAIBHAV fellowship targets top 500 QS-ranked institutions. Option 4." },
  { s: GA, q: "Who was appointed as the Chairman of National Bank for Financing Infrastructure and Development (NaBFID) in October 2021?", o: ["NR Narayana Murthy","KV Kamath","Nandan Nilekani","Uday Kotak"], e: "KV Kamath was appointed first Chairman of NaBFID (Oct 2021). Option 2." },
  { s: GA, q: "Which of the following states has the largest net-out migrants?", o: ["Uttar Pradesh","Gujarat","Haryana","Maharashtra"], e: "Uttar Pradesh has the highest net-out migration in India. Option 1." },
  { s: GA, q: "Sashastra Seema Bal is the lead intelligence unit for the ________ and Bhutan borders and the coordinating agency for national security activities.", o: ["Nepal","Bangladesh","Pakistan","Myanmar"], e: "SSB guards the Indo-Nepal and Indo-Bhutan borders. Option 1." },
  { s: GA, q: "'An Unsuitable Boy' is the autobiography of which Indian personality?", o: ["AR Rahman","Virat Kohli","Salman Khan","Karan Johar"], e: "'An Unsuitable Boy' is Karan Johar's autobiography. Option 4." },
  { s: GA, q: "The historic Salt March was started by Mahatma Gandhi and his followers from ________.", o: ["Gandhinagar","Dandi","Kheda","Sabarmati Ashram"], e: "Dandi March (1930) started from Sabarmati Ashram. Option 4." },
  { s: GA, q: "Post 1857 revolt, the Peel commission was set up to give recommendations on ________ reorganisation of British India.", o: ["telecom","trade","land revenue","military"], e: "Peel Commission (1859) recommended military reorganisation post-1857. Option 4." },
  { s: GA, q: "Who was recognised for his services in the discovery of inert gaseous elements in air and in the determination of their place in the periodic system?", o: ["Henry Miers","Lord Rayleigh","Sir William Ramsay","Henry Cavendish"], e: "Sir William Ramsay won the 1904 Nobel Prize for discovery of inert/noble gases. Option 3." },
  { s: GA, q: "The National Health Authority (NHA), Ministry of Health and Family Welfare (MoHFW), has organised '__________' to celebrate five years of Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB PM-JAY) and two years of Ayushman Bharat Digital Mission (ABDM) on 25th and 26th September 2023 in New Delhi.", o: ["Bharat Arogya Mela","Ayushman Ayojan","Arogya Manthan","Swasthya Kalyan"], e: "NHA organised 'Arogya Manthan' (Sep 2023). Option 3." },
  { s: GA, q: "Which of the following holy days in Christianity is a mourning day?", o: ["Easter","Christmas","Maundy Thursday","Good Friday"], e: "Good Friday commemorates the crucifixion of Jesus — a day of mourning. Option 4." },
  { s: GA, q: "What is the name of the cold phase of the ENSO climate pattern that describes the unusual cooling of the surface waters of the region?", o: ["La Nina","ENSO-neutral","NINO-3 region","Trans-Nino"], e: "La Nina is the ENSO cold phase. Option 1." },
  { s: GA, q: "Which of the following leagues is related to the game of football?", o: ["Indian Soft League","Indian Super League","Indian Supra League","Super Indian League"], e: "Indian Super League (ISL) is India's top football league. Option 2." },
  { s: GA, q: "The cell wall of spirogyra contains:", o: ["cellulose","suberin","lignin","Chitin"], e: "Spirogyra cell wall is composed primarily of cellulose. Option 1." },
  { s: GA, q: "Who is considered as the 'linchpin of the Government'?", o: ["Prime Minister","Vice-President","President","Chief Justice of the Supreme Court"], e: "The PM is described as the 'linchpin of the Government'. Option 1." },
  { s: GA, q: "NALCO is an Indian government enterprise, dealing with which of the following minerals?", o: ["Bauxite","Iron","Mica","Copper"], e: "National Aluminium Company (NALCO) deals with bauxite/aluminium. Option 1." },
  { s: GA, q: "From which of the following epics did the Garadi folk dance of Puducherry originate?", o: ["Ramayana","Panchatantra","Hitopadesha","Mahabharata"], e: "Garadi dance of Puducherry depicts episodes from the Ramayana. Option 1." },
  { s: GA, q: "Which state of India does the musician Shyamamani Devi belong to?", o: ["West Bengal","Bihar","Uttar Pradesh","Odisha"], e: "Shyamamani Devi is an Odissi music exponent from Odisha. Option 4." },
  { s: GA, q: "During the reign of which of the Pallava kings was the shore temple at Mahabalipuram built?", o: ["Paramesvaravarman I","Narasimhavarman II","Narasimhavarman I","Mahendravarman II"], e: "Shore Temple built under Narasimhavarman II (Rajasimha). Option 2." },
  { s: GA, q: "Biotic potential can be defined as:", o: ["the minimum number of individuals of a species that can survive but cannot reproduce","the maximum number of individuals a species can produce","the minimum number of individuals a species can produce","the maximum number of individuals of a species that cannot survive after birth"], e: "Biotic potential = maximum reproductive capacity of a species. Option 2." },
  { s: GA, q: "Who among the following rulers was defeated in the battle for Pataliputra by Chandragupta Maurya?", o: ["Dhana Nanda","Megasthenes","Seleucus Nicator","Elara"], e: "Chandragupta Maurya defeated Dhana Nanda (last Nanda king) at Pataliputra. Option 1." },
  { s: GA, q: "In 1962, who published 'The History of Ocean Basins', which outlined the theory of how tectonic plates could move, later called 'sea floor spreading'?", o: ["Louis Bauer","Harry Hammond Hess","Alfred Wegener","George Edward Backus"], e: "Harry Hess proposed sea-floor spreading in 'The History of Ocean Basins' (1962). Option 2." },
  { s: GA, q: "The emergency provisions of the Indian Constitution are borrowed from the Government of India Act, ________.", o: ["1935","1940","1933","1931"], e: "Emergency provisions are borrowed from GoI Act 1935. Option 1." },
  { s: GA, q: "How many players from one team can play in a Kabaddi match at a time?", o: ["10","9","8","7"], e: "Standard Kabaddi has 7 players per team on the court. Option 4." },

  // ============ QA (51-75) ============
  { s: QA, q: "If the weight of A is 40 kg, weight of B is 54 kg and weight of C is 62 kg, then what is the average weight (in kg) of the three persons?", o: ["58","156","78","52"], e: "(40+54+62)/3 = 156/3 = 52. Option 4." },
  { s: QA, q: "In an examination, there were two papers, A and B, and the maximum mark in each of the two papers was 10. However, the weights assigned to papers A and B were in the ratio 2 : 1, respectively. Riddhi scored 8 out of 10 in Paper B, and an overall 70% in the examination. How much did she score in Paper A out of 10?", o: ["5.5","6.5","6","5"], e: "Weighted avg: (2A + 1×8)/3 = 7 → 2A + 8 = 21 → A = 6.5. Option 2." },
  { s: QA, q: "If 5⁵⁵ is divided by 4, then the remainder is:", o: ["2","1","5","3"], e: "5 ≡ 1 (mod 4) → 5⁵⁵ ≡ 1 (mod 4). Option 2." },
  { s: QA, q: "A person bought bananas at 6 for ₹12 and sold them at 8 for ₹10. Find his gain or loss percentage?", o: ["0.375% loss","375% gain","3.75% gain","37.5% loss"], e: "CP/banana = 2; SP/banana = 1.25. Loss = 0.75/2 × 100 = 37.5%. Option 4." },
  { s: QA, q: "How many cubes of length 50 cm can be accommodated in a container of 5 m in length, 2 m in width and 5 m in height?", o: ["500","250","400","450"], e: "Container 5×2×5 = 50 m³. Cube 0.5³ = 0.125 m³. 50/0.125 = 400. Option 3." },
  { s: QA, q: "In measuring the sides of a rectangle, one side is taken 10% in excess, and the other 8% in deficit. The error percent in the area calculated from these measurements is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Error% = 10 − 8 − (10×8)/100 = 2 − 0.8 = 1.2%. Per docx, option 2." },
  { s: QA, q: "Two trains of equal length take 10 s and 20 s, respectively, to cross a pole. If these trains are moving in the same direction, then how long will they take to cross each other?", o: ["15 sec","40 sec","10 sec","30 sec"], e: "Speeds = L/10 and L/20 m/s. Time = 2L/(L/10 − L/20) = 2L/(L/20) = 40 s. Option 2." },
  { s: QA, q: "An item costs ₹15,000. A customer can choose either 30% discount or the buy two get one free offer. Jeevan chose the first offer and Rakshit chose the second offer. Find the difference in their payment for a single item.", o: ["Rs.10,000","Rs.500","Rs.750","Rs.10,500"], e: "Jeevan pays 15000×0.7 = 10500. Rakshit: 2 for 30000 = 10000/item (avg). Difference = 500. Option 2." },
  { s: QA, q: "An annual instalment of ₹3,500 will discharge a debt of ₹16,310 due in 4 years at y% simple interest per annum. What is the value of y?\n(Instalments paid at end of Year 1, 2, 3, 4)", o: ["11","16.5","11.5","10.5"], e: "Per docx answer key, option 1 (11)." },
  { s: QA, q: "A store is running a scheme for offering a discount of 12% if the customer pays instantly, and a discount of 6% if purchased through credit card. Ankur purchased a shirt (MP ₹2,200) through credit card and paid instantly for a coat (MP ₹7,500). What was the total amount (in ₹) billed?", o: ["8778","8668","8814","8568"], e: "Shirt: 2200×0.94 = 2068. Coat: 7500×0.88 = 6600. Total = 8668. Option 2." },
  { s: QA, q: "The price of a television set and a washing machine are in the ratio of 8 : 7. If the cost of the television set is ₹4,800 more than the cost of the washing machine, then find the price of the washing machine.", o: ["₹33,600","₹33,700","₹33,500","₹33,000"], e: "Let TV=8x, WM=7x. 8x−7x = 4800 → x = 4800. WM = 7×4800 = 33600. Option 1." },
  { s: QA, q: "The initial ratio of water and milk in a mixture of 84 litres is 2:5. What quantity of water (in litres) should be added to the mixture so that the resulting mixture has 50% of water?", o: ["32","16","18","36"], e: "Water=24, milk=60. (24+x)/(84+x) = 0.5 → 48+2x = 84+x → x = 36. Option 4." },
  { s: QA, q: "The amount of debt that will be discharged by 5 equal monthly instalments of ₹1,845 each, at the rate of 48% simple interest per annum, is:", o: ["₹9,048","₹9,936","₹9,963","₹9,468"], e: "Per docx answer key, option 3 (₹9,963)." },
  { s: QA, q: "Two workers - Sagar and Manish - are working on a heavy machine to melt waste metal. Sagar can complete the work in 15 days while both workers on alternate basis can complete the work in 12 days. In how many days can Manish alone complete the work?", o: ["30","18","10","9"], e: "Alt 12 days = 6 of each. 6/15 + 6/M = 1 → 6/M = 0.6 → M = 10. Option 3." },
  { s: QA, q: "Which of the following statements is true?", o: ["The sum of deviations of the items from the arithmetic mean is always zero.","The sum of deviations of the items from the arithmetic mean is always one.","Arithmetic mean is the sum of deviations from the mid value.","The sum of the squared deviations of the items from the arithmetic mean is maximum."], e: "Property of mean: Σ(xᵢ − x̄) = 0. Option 1." },
  { s: QA, q: "Evaluate the given expression.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: QA, q: "Find the third proportional to 5 and 15 which is equal to the fourth proportional of 2, 5 and 18.", o: ["36","32","46","45"], e: "Third prop: 5:15::15:x → x = 45. Fourth prop: 2:5::18:y → y = 45. Both = 45. Option 4." },
  { s: QA, q: "A number when divided by a divisor leaves a remainder of 24. When twice the original number is divided by the same divisor, the remainder is 13. What is the value of the divisor?", o: ["35","37","30","25"], e: "2×24 = 48. 48 − 13 = 35 (the divisor). Option 1." },
  { s: QA, q: "A bank gives simple interest at the rate of 4.5% per annum. How much money (in ₹) should a person deposit to get ₹7,500 as interest every year?", o: ["2,66,666.67","1,33,333.33","1,66,666.67","2,33,333.33"], e: "P = 7500 × 100 / 4.5 = 166666.67. Option 3." },
  { s: QA, q: "A tradesman marked his goods at 26% above its cost price and then allowed a discount of 13%. His gain (in %) is:", o: ["9.26","9.62","6.29","6.92"], e: "1.26 × 0.87 = 1.0962 → 9.62% gain. Option 2." },
  { s: QA, q: "If the GST on a certain article was Rs.600 two years back and it increased to Rs.750 this year, find the percentage increase in the GST on that article.", o: ["15%","30%","25%","20%"], e: "Increase = 150/600 × 100 = 25%. Option 3." },
  { s: QA, q: "The cost price of 10 apples is equal to the selling price of 20 apples. Find the loss or gain percentage.", o: ["Loss 40%","Gain 10%","Loss 50%","Gain 20%"], e: "10 CP = 20 SP → SP = CP/2 → 50% loss. Option 3." },
  { s: QA, q: "Two trains start at the same time from stations P and Q and travel towards each other at the speeds of 75 km/h and 100 km/h, respectively. When they meet, it is found that one train has travelled 50 km more than the other. The distance (in km) between two stations is:", o: ["325","375","300","350"], e: "Relative diff = 25 km/h. 50/25 = 2 hours. Total = (100+75)×2 = 350. Option 4." },
  { s: QA, q: "A city's population grows by 10% in the first year, 20% in the second year and 10% in the third year. If the population after 3 years is 8,71,200, then what was the original population 3 years ago?", o: ["7,92,000","7,00,000","6,60,000","6,00,000"], e: "Original = 871200/(1.1×1.2×1.1) = 871200/1.452 = 600000. Option 4." },
  { s: QA, q: "A goods train 350 m long passes through a tunnel of 1250 m in 80 seconds. What is the speed of the train?", o: ["56 km/h","64 km/h","78 km/h","72 km/h"], e: "Total = 1600 m. Speed = 1600/80 = 20 m/s = 72 km/h. Option 4." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nDelighted", o: ["Joyful","Sad","Confused","Angry"], e: "Delighted ≈ Joyful. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nTo frighten or threaten someone, usually in order to persuade the person to do something he or she does not wish to do", o: ["Intimidate","Compel","Forceless","Authoritative"], e: "Intimidate = frighten into compliance. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nPride", o: ["Attraction","Modesty","Assurance","Aristocracy"], e: "Pride ↔ Modesty. Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nAn extremely abnormal fear of confined space", o: ["Claustrophobia","Glossophobia","Selenophobia","Acrophobia"], e: "Claustrophobia = fear of confined spaces. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nSindhu mailed the letter.", o: ["The letter was mailed by Sindhu.","Sindhu was mailed by the letter.","Letter mailed by the Sindhu.","The letter was mailed by the Sindhu."], e: "Past simple passive: 'was mailed by'. Option 1." },
  { s: ENG, q: "Select the most appropriate option to fill in the blanks.\nNicholas Copernicus is famous for showing the world that the sun is the ________ of the universe in 1543 AD in Poland. He also noticed that some planets appeared to change directions when moving ________ the sky. Earlier astronomers believed in the phenomenon of retrograde motion but Copernicus saw it as ________ that earth orbited the sun like other planets did.", o: ["foundation; inside; display","centre; across; proof","polar; off; indicate","bipolar; through; evidence"], e: "Sun is the centre; planets move across the sky; saw it as proof. Option 2." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nEnthusiastic", o: ["Fanatic","Apathetic","Desperate","Courageous"], e: "Enthusiastic ↔ Apathetic. Option 2." },
  { s: ENG, q: "Select the INCORRECTLY spelt word in the options given below.", o: ["Deficiency","Amateur","Noticeable","Comparision"], e: "Correct is 'Comparison', not 'Comparision'. Option 4." },
  { s: ENG, q: "Select the correctly spelt word to fill in the blank.\nThe people affected with ____________ are vulnerable to other infections as well.", o: ["neumonia","pnemonea","pnemonia","pneumonia"], e: "Correct spelling: pneumonia. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\nHe said that he might change that format.", o: ["He said, \"I will change that format\".","He said, \"I may change this format\".","He told, \"He may change that format\".","He says, \"He might change that format\"."], e: "Direct speech: 'might' → 'may'; 'that' → 'this'. Option 2." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nSunny", o: ["Bright","Cloudy","Fair","Brilliant"], e: "Sunny ↔ Cloudy. Option 2." },
  { s: ENG, q: "Select the most appropriate idiomatic expression that can substitute the underlined segment in the given sentence.\nHe wanted to be a professional basketball player but given his height, luck was against him.", o: ["his principles were against him","the cards were stacked against him","his health was not in his favour","the ball was against him"], e: "'Cards stacked against him' = circumstances unfavourable. Option 2." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nLullaby", o: ["Love","Baby","Disturb","Song"], e: "Lullaby = a soothing song for children. Option 4." },
  { s: ENG, q: "Select the option with the correct spelling to substitute the underlined word in the given sentence.\nIt was a priviledge to meet the finance minister of the country last week.", o: ["previledge","privledge","privilage","privilege"], e: "Correct spelling: 'privilege'. Option 4." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\nNo one even thought that Sheila's success would burst the bubble.", o: ["Change her into arrogance","Break the border","Last for ever","Suddenly end"], e: "Burst the bubble = abruptly end an illusion. Option 4." },
  { s: ENG, q: "Read the Curd passage. Select the most appropriate option to fill in blank number 1.\n'Lactobacillus ___(1)___ the formation of curd.'", o: ["help","cause","lead","promotes"], e: "Singular subject 'Lactobacillus' → 'promotes' (third-person verb agreement). Option 4." },
  { s: ENG, q: "Read the Curd passage. Select the most appropriate option to fill in blank number 2.\n'It multiplies in milk and ___(2)____ it into curd.'", o: ["cause","change","converts","leads"], e: "'Converts it into curd' fits the agentive sense. Option 3." },
  { s: ENG, q: "Read the Curd passage. Select the most appropriate option to fill in blank number 3.\n'Bacteria are also involved in the ____(3)____ of cheese, pickles...'", o: ["making","causing","converting","changing"], e: "'Making' of cheese — the production sense. Option 1." },
  { s: ENG, q: "Read the Curd passage. Select the most appropriate option to fill in blank number 4.\n'Yeast ____(4)____ rapidly and produces carbon dioxide'", o: ["leads","convert","change","reproduces"], e: "Yeast 'reproduces' rapidly. Option 4." },
  { s: ENG, q: "Read the Curd passage. Select the most appropriate option to fill in blank number 5.\n'Bubbles of the gas fill the dough and increase its ____(5)____.'", o: ["length","volume","shape","width"], e: "Bubbles in dough increase its volume (rising). Option 2." },
  { s: ENG, q: "Read the Karnataka-Maharashtra Border passage. Identify the most suitable title for the passage.", o: ["Political Leaders and Their Corruption","Linguistic Love of The People","Border Disputes and Political Fuel","Unending Love of Religion"], e: "Passage centres on border dispute fuelled by politicians. Option 3." },
  { s: ENG, q: "Read the Karnataka-Maharashtra Border passage. What is the apple of discord mentioned in the passage?", o: ["Mumbai","Bengaluru","Belgavi","Bellari"], e: "Belgavi is the disputed border town. Option 3." },
  { s: ENG, q: "Read the Karnataka-Maharashtra Border passage. Reorganisation of states in the 1950s was done based on ________.", o: ["economic lines","religious lines","linguistic lines","castes"], e: "Passage: 'reorganisation of states on linguistic lines in the 1950s'. Option 3." },
  { s: ENG, q: "Read the Karnataka-Maharashtra Border passage. Select the most appropriate ANTONYM of the word 'impose'.", o: ["Release","Compel","Cure","Ennoble"], e: "Impose ↔ Release. Option 1." },
  { s: ENG, q: "Read the Karnataka-Maharashtra Border passage. What is the passage based upon?", o: ["Linguistic narrowmindedness of the common men of the two states Karnataka and Maharashtra","Existing border dispute between Karnataka and Maharashtra fuelled often by politicians, not common men","The bureaucracy in India and the egoism of the leaders in the administration","Political leaders and their opportunism in using court decisions for their own pastime"], e: "Passage central thesis. Option 2." }
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
      tags: ['SSC', 'Selection Post', 'Phase XII', 'Matriculation', 'PYQ', '2024'],
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
      description: 'Staff Selection Commission - Selection Post (Matriculation Level - 10th-pass eligibility)',
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Matriculation) - 25 June 2024 Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2024, pyqShift: 'Shift-1',
    pyqExamName: 'SSC Selection Post Phase XII (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
