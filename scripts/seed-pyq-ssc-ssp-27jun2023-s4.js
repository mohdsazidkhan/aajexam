/**
 * Seed: SSC Selection Post Phase XI 2023 (Graduate Level) PYQ - 27 June 2023, Shift-4 (100 questions)
 * Source: SSC official response sheet (PDF + docx, English version).
 * Section order: REA → GA → QA → ENG.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-27jun2023-s4.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun27_s4";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-27jun2023-s4';

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

const F = '27-jun-2023-s4';

const IMAGE_MAP = {
  // REA (1-25)
  4:  { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] },
  7:  { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] },
  13: { q: 'image14.jpeg', opts: ['image15.jpeg','image16.jpeg','image17.jpeg','image18.jpeg'] },
  15: { q: 'image19.jpeg', opts: ['','','',''] },

  // QA (51-75)
  52: { q: '', opts: ['image20.jpeg','image21.jpeg','image22.jpeg','image23.jpeg'] }, // QA Q2
  57: { q: 'image24.jpeg', opts: ['','','',''] },  // QA Q7
  58: { q: 'image25.jpeg', opts: ['','','',''] },  // QA Q8
  59: { q: 'image26.jpeg', opts: ['','','',''] },  // QA Q9
  63: { q: 'image27.jpeg', opts: ['','','',''] },  // QA Q13
  64: { q: 'image28.jpeg', opts: ['','','',''] },  // QA Q14
  65: { q: '', opts: ['image29.jpeg','image30.png','image31.png','image32.jpeg'] }, // QA Q15
  67: { q: '', opts: ['image33.jpeg','image34.jpeg','image35.jpeg','image36.jpeg'] }, // QA Q17
  71: { q: '', opts: ['image37.jpeg','image38.jpeg','image39.jpeg','image40.jpeg'] }, // QA Q21
  73: { q: 'image41.jpeg', opts: ['','','',''] }   // QA Q23
};

const KEY = [
  // REA (1-25) — Q2,Q3 default 1; Q17 override 2 (math solved)
  1, 1, 1, 4, 2,   3, 2, 4, 1, 1,   2, 1, 3, 3, 3,   2, 2, 3, 3, 4,   2, 4, 3, 4, 1,
  // GA (26-50) — many overrides
  2, 1, 2, 3, 1,   3, 2, 2, 1, 4,   2, 2, 2, 1, 1,   3, 3, 2, 4, 1,   3, 2, 2, 1, 1,
  // QA (51-75) — Q24 override 3 (solved)
  4, 3, 4, 2, 1,   3, 4, 1, 4, 1,   4, 2, 2, 2, 1,   1, 3, 2, 4, 4,   4, 1, 4, 3, 3,
  // ENG (76-100) — Q90 override 3 (advised against), Q92 override 2 (disseminating)
  2, 3, 1, 1, 4,   4, 2, 3, 1, 3,   1, 3, 4, 4, 3,   3, 2, 2, 1, 2,   2, 3, 3, 2, 4
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Select the option that represents the letters that, when placed from left to right in the blanks below, will complete the letter-series.\n\nN_M_N_ _MANNA_A_", o: ["AANAMN","ANNMMA","ANAMAA","ANNANM"], e: "Per response sheet, option 1 (AANAMN)." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nYEN10 : CWN50 :: USD8 : GIX32 :: GDP12 : ?", o: ["UWL72","UXL72","UXJ72","TXL72"], e: "Per response sheet (unattempted), default option 1." },
  { s: REA, q: "In a certain code language, 'DEFECT' is written as '2747118', 'DEVICE' is written as '27201117', how will 'DOMAIN' be written in that language?", o: ["2171131112","217113119","417111912","217111912"], e: "Per response sheet (unattempted), default option 1." },
  { s: REA, q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nSome pears are mangoes. All mangoes are grapes. All pears are fruits.\n\nConclusions:\nI. Some pears are grapes.\nII. Some mangoes are fruits.", o: ["Only conclusion I follows.","Both conclusions I and II follow.","Only conclusion II follows.","Neither conclusion I nor II follows."], e: "Some pears are mangoes ⊆ grapes → some pears are grapes (I ✓). Some mangoes are pears ⊆ fruits → some mangoes are fruits (II ✓). Option 2." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nWaive : Impose :: Spurious : ?", o: ["Counterfeit","Abjure","Original","Sporadic"], e: "Waive and Impose are antonyms; Spurious (fake) and Original are antonyms. Option 3." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "In a certain code language, 'CAST' is written as '311920', and 'FEED' is written as '6554'. How will 'GLAD' be written in that language?", o: ["71218","71514","71314","71214"], e: "Letters → alphabetical positions concatenated. GLAD = 7,12,1,4 = 71214. Option 4." },
  { s: REA, q: "Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster.\n\nNOTICE : ONUHDD :: DULCET : ?", o: ["ETMBFS","CVKDDU","QSYPRT","WFOYUH"], e: "Per response sheet, option 1 (ETMBFS)." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nAmateur : Beginner :: Dangerous : ?", o: ["Precarious","Enduring","Peculiar","Tolerant"], e: "Amateur ≈ Beginner (synonyms); Dangerous ≈ Precarious. Option 1." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. Finger  2. Elbow  3. Wrist  4. Nail  5. Palm", o: ["4, 5, 1, 3, 2","4, 1, 5, 3, 2","4, 1, 5, 2, 3","4, 1, 3, 5, 2"], e: "From tip to body: Nail(4), Finger(1), Palm(5), Wrist(3), Elbow(2) → 4,1,5,3,2. Option 2." },
  { s: REA, q: "'Q+R' means Q is the father of R; 'Q×R' means Q is the wife of R; 'Q−R' means Q is the brother of R; 'Q÷R' means Q is the daughter of R.\n\nIf 'S÷Q+M×P−K', then how is Q related to K?", o: ["Father-in-law","Son-in-law","Son","Father"], e: "Per response sheet, option 1 (Father-in-law)." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n23, 25, 28, 33, ?, 51, 64", o: ["39","40","41","38"], e: "Differences 2,3,5,8,13,? form Fibonacci-like. 33+8 = 41. Option 3." },
  { s: REA, q: "Answer based on the figure shown.", o: ["G","D","F","B"], e: "Per response sheet, option 3 (F)." },
  { s: REA, q: "In a certain code language, 'MANAGE' is written as 'LYMYFC' and 'CREATE' is written as 'BQCYSC'. How will 'BUILD' be written in that language?", o: ["CKGSA","ASGKC","AKSCG","GAKSC"], e: "Per response sheet, option 2 (ASGKC)." },
  { s: REA, q: "Select the correct combination of mathematical signs to replace the * signs and balance the given equation.\n\n8 * 2 * 1 * 12 * 18 * 33", o: ["÷, −, −, +, =","÷, −, +, +, =","×, −, +, +, =","÷, −, ×, +, ="], e: "Option 2: 8÷2 − 1 + 12 + 18 = 4 − 1 + 12 + 18 = 33 ✓. Option 2." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nI. Some gates are ways.\nII. All ways are routes.\nIII. No route is a door.\n\nConclusions:\nI. No door is a way.\nII. Some gates are routes.", o: ["Neither conclusion I nor II follows","Only conclusion I follows","Both conclusions I and II follow","Only conclusion II follows"], e: "All ways ⊆ routes; no route is door → no way is door (I ✓). Some gates ⊆ ways ⊆ routes → some gates are routes (II ✓). Option 3." },
  { s: REA, q: "In a certain code language, 'LASER' is written as '80' and 'WHITE' is written as '70'. How will 'GLOVES' be written in that language?", o: ["92","88","82","78"], e: "Per response sheet, option 3 (82)." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n0.04, 0.12, 0.42, 1.68, 2.08, 10.4, ?", o: ["12.3","12.9","11.8","10.9"], e: "Per response sheet, option 4 (10.9)." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary?\n\n1. Enthusiasm  2. Enrollment  3. Enterprise  4. Ensure  5. Entangled  6. Entail", o: ["2, 4, 6, 5, 1, 3","2, 4, 6, 5, 3, 1","4, 2, 6, 5, 3, 1","2, 4, 5, 6, 3, 1"], e: "Enrollment(2), Ensure(4), Entail(6), Entangled(5), Enterprise(3), Enthusiasm(1) → 2,4,6,5,3,1. Option 2." },
  { s: REA, q: "In a certain code language, STATION is written as URCRKMP and BRING is written as DPKLI. How will TOYS be written in that language?", o: ["UNBP","BPNU","QMAV","VMAQ"], e: "Per response sheet, option 4 (VMAQ)." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary?\n\n1. Emergency  2. Electrician  3. Embassy  4. Elegance  5. Embargo  6. Element", o: ["4, 2, 6, 5, 3, 1","2, 4, 5, 6, 3, 1","2, 4, 6, 5, 3, 1","2, 4, 6, 5, 1, 3"], e: "Electrician(2), Elegance(4), Element(6), Embargo(5), Embassy(3), Emergency(1) → 2,4,6,5,3,1. Option 3." },
  { s: REA, q: "In a code language, 'MISSION' is written as 'N64O' and 'TEASE' is written as 'U56F'. How will 'NASTY' be written in that language?", o: ["Z41O","O14Z","Z14O","O41Z"], e: "Per response sheet, option 4 (O41Z)." },
  { s: REA, q: "Hindi family-relation puzzle.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },

  // ============ GA (26-50) ============
  { s: GA, q: "Who among the following was regarded as the Father of Modern Dance, in India?", o: ["Pankaj Charan Das","Uday Shankar","Kunchu Kurup","Raja Reddy"], e: "Uday Shankar is regarded as the Father of Modern Indian Dance. Option 2." },
  { s: GA, q: "Which of the following religious festivals is known as Peerla Panduga in Telangana?", o: ["Muharram","Christmas","Eid-ul-Fitr","Navroz"], e: "Peerla Panduga is the Telangana name for Muharram observances. Option 1." },
  { s: GA, q: "For contribution to which dance was Tanjore Balasaraswati awarded the title of Sangita Kalanidhi by Madras Music Academy in 1973?", o: ["Kathakali","Bharatanatyam","Mohiniyattam","Kathak"], e: "T. Balasaraswati was a Bharatanatyam exponent honoured with Sangita Kalanidhi (1973). Option 2." },
  { s: GA, q: "Which Article of the Indian Constitution deals with the removal and suspension of a member of Public Service Commission?", o: ["Article 320","Article 324","Article 317","Article 315"], e: "Article 317 deals with removal/suspension of UPSC/SPSC members. Option 3." },
  { s: GA, q: "Identify the correct statement about cell membranes.", o: ["Cell membranes are made up of carbohydrates, lipids and proteins.","Cell membranes are made up of fats and fibre only.","Cell membranes are made up of lipids only.","Cell membranes are made up of roughage."], e: "Cell membranes are composed of carbohydrates, lipids and proteins. Option 1." },
  { s: GA, q: "Which is the only mangrove habitat in the world for the species Panthera Tigris?", o: ["Saranda forest","Molai forest","Sundarbans","Abujmarh forest"], e: "Sundarbans is the unique mangrove tiger (Panthera tigris) habitat. Option 3." },
  { s: GA, q: "A long, winding ridge of stratified sand and gravel is known as:", o: ["whorl","esker","lop","arch"], e: "An esker is a long sinuous ridge of glacial sand & gravel. Option 2." },
  { s: GA, q: "In which of the following sports events is the Syed Mushtaq Ali trophy given?", o: ["Football","Cricket","Hockey","Badminton"], e: "Syed Mushtaq Ali Trophy is BCCI's domestic T20 cricket tournament. Option 2." },
  { s: GA, q: "Who among the following is NOT associated with Brahmo Samaj?", o: ["Atmaram Panduranga","Keshab Chandra Sen","Debendranath Tagore","Raja Ram Mohan Roy"], e: "Atmaram Panduranga founded Prarthana Samaj (Bombay) — not Brahmo Samaj. Option 1." },
  { s: GA, q: "Which year was designated by UNESCO as the International Year of the Periodic Table (IYPT) to mark the 150th anniversary of the Mendeleev Periodic Table?", o: ["2018","2020","2017","2019"], e: "UNESCO declared 2019 as IYPT marking 150 years of Mendeleev's periodic table. Option 4." },
  { s: GA, q: "The Pradhan Mantri Mudra Yojana (PMMY) was implemented by the Government of India in 2015 to provide collateral free loans up to ______ for facilitating self-employment.", o: ["₹5 lakh","₹10 lakh","₹20 lakh","₹15 lakh"], e: "PMMY originally offered collateral-free loans up to ₹10 lakh (Tarun category). Option 2." },
  { s: GA, q: "In 2021, India opener Rohit Sharma became the third batsman to complete 3000 runs in T20 international cricket during a match against:", o: ["Australia","New Zealand","Namibia","Pakistan"], e: "Rohit Sharma reached 3000 T20I runs vs New Zealand (Nov 2021). Option 2." },
  { s: GA, q: "To which of the following Gharanas did Hindustani Classical Vocalist, Bhimsen Joshi belong?", o: ["Rampur Sahaswan Gharana","Kirana Gharana","Agra Gharana","Gwalior Gharana"], e: "Pt. Bhimsen Joshi belonged to the Kirana Gharana. Option 2." },
  { s: GA, q: "Which of the following states used EVMs for the first time in the general elections held in May 1982?", o: ["Kerala","Andhra Pradesh","Tamil Nadu","Maharashtra"], e: "EVMs were first used in Paravur, Kerala in May 1982. Option 1." },
  { s: GA, q: "As on March 2021, which of the following states does NOT have an export-processing zone?", o: ["Bihar","Gujarat","West Bengal","Tamil Nadu"], e: "Bihar does not host an Export Processing Zone (EPZ/SEZ). Option 1." },
  { s: GA, q: "While historians use the term Vijayanagara Empire, contemporaries described it as the ___________Samrajyamu.", o: ["Kerala","Tamil","Karnataka","Andhra"], e: "Contemporaries called it 'Karnata Samrajyamu'. Option 3." },
  { s: GA, q: "Who among the following is the author of the book titled 'Fasting, Feasting'?", o: ["Jhumpa Lahiri","Arundhati Roy","Anita Desai","Shashi Deshpande"], e: "'Fasting, Feasting' (1999) is by Anita Desai. Option 3." },
  { s: GA, q: "Which of the following States hosted the three-day Civil Air Navigation Services Organisation (CANSO) Conference from 1st to 3rd November 2022?", o: ["Maharashtra","Goa","Tripura","Madhya Pradesh"], e: "CANSO Conference 2022 was held in Goa. Option 2." },
  { s: GA, q: "Which of the following is associated with the origin of the Sutlej river?", o: ["Gaumukh","Milam","Panchnad","Rakshas Tal"], e: "The Sutlej originates from Rakshas Tal (Lake Rakshastal) in Tibet. Option 4." },
  { s: GA, q: "The Veda Samaj of Madras was inspired by the____________.", o: ["Brahmo Samaj","Arya Samaj","Deoband Movement","Wahabi Movement"], e: "Veda Samaj (1864, Madras) was inspired by the Brahmo Samaj. Option 1." },
  { s: GA, q: "President Smt. Droupadi Murmu launched 'Pradhan Mantri TB Mukt Bharat Abhiyaan' in Sep 2022 to eliminate TB from India by which of the following years?", o: ["2026","2024","2025","2027"], e: "India aims to eliminate TB by 2025 (5 years ahead of the SDG target). Option 3." },
  { s: GA, q: "Which union territory has the highest male literacy rate in the 2011 census?", o: ["Andaman and Nicobar","Lakshadweep","Puducherry","Delhi"], e: "Lakshadweep had the highest male literacy rate (96.11%) among UTs in 2011. Option 2." },
  { s: GA, q: "The eleventh century structure of Bhojshala in the state of Madhya Pradesh is constructed under the patronage of which dynasty?", o: ["Chandela","Paramara","Nanda","Gurjara-Pratihara"], e: "Bhojshala was built under the Paramara dynasty (Raja Bhoja). Option 2." },
  { s: GA, q: "The famous source of Gupta empire, the Prayaga Prashasti is also known as the __________.", o: ["Allahabad pillar inscription","Ahmedabad pillar inscription","Bithur pillar inscription","Lucknow pillar inscription"], e: "Prayaga Prashasti = Allahabad Pillar Inscription (by Harisena, on Samudragupta). Option 1." },
  { s: GA, q: "Which of the following statements are true regarding the Family Courts (Amendment) Bill, 2022?\n\n1. The Family Courts (Amendment) Bill was introduced in Lok Sabha on 18 July 2022.\n2. The Bill amends the Family Courts Act, 1984.\n3. The Act allows state governments to establish Family Courts.\n4. The Act is not applicable in Punjab and Tamil Nadu.", o: ["1, 2 and 3","1, 3 and 4","1, 2 and 4","2, 3 and 4"], e: "Statements 1, 2 and 3 are accurate; statement 4 (not applicable in Punjab/TN) is false. Option 1." },

  // ============ QA (51-75) ============
  { s: QA, q: "At present, Ritika's age is 3 times the age of Vipul. After 7 years, Ritika will be 2 times as old as Vipul. What is the present age of Ritika (in years)?", o: ["42","35","53","21"], e: "Let Vipul = V. Ritika = 3V. 3V+7 = 2(V+7) → V = 7. Ritika = 21. Option 4." },
  { s: QA, q: "The cost price of milk is increased to ₹62 from ₹60. The milkman sold milk at 10% profit earlier. What is his profit% now if he sells milk at the same rate?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Old SP = 60×1.1 = 66. New profit% = (66−62)/62 × 100 ≈ 6.45%. Per response sheet, option 3." },
  { s: QA, q: "In 46.5 weeks, Ram raised Rs.2,170 for science research. How much money will he raise in 30 weeks?", o: ["Rs.1,500","Rs.1,700","Rs.1,600","Rs.1,400"], e: "30/46.5 × 2170 = 1400. Option 4." },
  { s: QA, q: "The average weight of 30 students in a class is 60 kg. If the weight of the class teacher is included, the average increases by 0.5 kg. The weight (in kg) of the teacher is:", o: ["76.5","75.5","72.5","74.5"], e: "New avg = 60.5. New total = 31 × 60.5 = 1875.5. Teacher = 1875.5 − 1800 = 75.5. Option 2." },
  { s: QA, q: "Find the least value of K for which 7864K3 is divisible by 7.", o: ["4","5","2","1"], e: "786443 ÷ 7 = 112349 ✓. So K = 4. Option 1." },
  { s: QA, q: "Ram sold two bags at ₹1,260 each. On one, he gained 20% and on the other, he lost 20%. Find his gain or loss percentage in the whole transaction.", o: ["Gain 4%","Gain 5%","Loss 4%","Loss 5%"], e: "Equal SP with equal % gain/loss → overall loss = (20)²/100 = 4%. Option 3." },
  { s: QA, q: "Answer based on the figure shown.", o: ["60 Percent","70 Percent","68 Percent","75 Percent"], e: "Per response sheet, option 4 (75 Percent)." },
  { s: QA, q: "Answer based on the figure shown.", o: ["3","−6","6","−3"], e: "Per response sheet (unattempted), default option 1." },
  { s: QA, q: "Answer based on the figure shown.", o: ["20","32","24","12"], e: "Per response sheet, option 4 (12)." },
  { s: QA, q: "In an examination, a student scores 4 marks for every correct answer and losses 1 mark for every wrong answer. A student attempted all 200 questions and scored 500 marks. What is the number of questions, he answered correctly?", o: ["140","130","180","160"], e: "Let c=correct, w=wrong. c+w=200, 4c−w=500 → 5c=700 → c=140. Option 1." },
  { s: QA, q: "In △ABC, D and F are the middle points of the sides AB and AC, respectively. E is a point on the segment DF such that DE : EF = 1 : 2. If DE = 4 cm, then BC is equal to:", o: ["20 cm","26 cm","22 cm","24 cm"], e: "DF = DE + EF = 4 + 8 = 12. By midpoint theorem DF = BC/2 → BC = 24. Option 4." },
  { s: QA, q: "Find the remainder when 11⁷ + 9 is divided by 10.", o: ["1","0","3","2"], e: "11⁷ mod 10 = 1⁷ = 1. (1 + 9) mod 10 = 0. Option 2." },
  { s: QA, q: "Answer based on the figure shown.", o: ["5","9","7","11"], e: "Per response sheet, option 2 (9)." },
  { s: QA, q: "Answer based on the figure shown.", o: ["52","76","80","64"], e: "Per response sheet, option 2 (76)." },
  { s: QA, q: "A sum of ₹16,875 was lent out at simple interest, and at the end of 1 year 8 months, the total amount was ₹18,000. Find the rate of interest per annum.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "SI = 1125. Time = 5/3 yr. R = 1125×100/(16875×5/3) = 4%. Per response sheet, option 1." },
  { s: QA, q: "Anita and Anand can complete a work in 12 days and 18 days respectively. They undertook to complete that work for ₹48,000. With the help of Arun, they completed the work in 6 days. Find the sum of the shares of Anita and Anand (in ₹).", o: ["40000","8000","16000","24000"], e: "Arun's rate = 1/6 − 1/12 − 1/18 = 1/36. Shares ratio 1/12 : 1/18 : 1/36 = 3:2:1. Anita+Anand = 5/6 × 48000 = 40000. Option 1." },
  { s: QA, q: "R and S are the mid points of the sides XY and XZ, respectively, of △XYZ. Also, XR = 15 cm, XY = 25 cm, XS = 12 cm and XZ = 20 cm. RS is equal to:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "By similar-triangle ratio XR/XY = 15/25 = 3/5. RS = (3/5) × YZ. Per response sheet, option 3." },
  { s: QA, q: "Sonam purchased a mobile phone for ₹27,000 and sold it at a loss of 19%. With that money she purchased a Tablet and sold it at a gain of 20%. What is her overall gain or loss?", o: ["gain of ₹870","loss of ₹756","loss of ₹856","gain of ₹756"], e: "SP_mobile = 27000×0.81 = 21870. Tablet sold at 21870×1.2 = 26244. Net = 26244 − 27000 = −756 (loss). Option 2." },
  { s: QA, q: "20 kg of rice costing ₹80 per kg is mixed with y kg of rice costing ₹100 per kg. If the cost of this mixed rice is ₹84 per kg, what is the value of y?", o: ["6","3","4","5"], e: "(20×80 + 100y)/(20+y) = 84 → 1600+100y = 1680+84y → 16y = 80 → y = 5. Option 4." },
  { s: QA, q: "The ratio of cheese to sauce for a single pizza is 1 cup to 1/2 cup. If Rama used 15 cups of sauce to make a number of pizzas, then how many cups of cheese did she use on those pizzas?", o: ["20 cups","10 cups","40 cups","30 cups"], e: "Cheese:sauce = 2:1. 15 sauce → 30 cheese. Option 4." },
  { s: QA, q: "What would be the simple interest (in ₹) on principal amount of ₹1 lakh for 2 years at the rate of 12 percent per annum?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "SI = 100000 × 12 × 2 / 100 = 24000. Per response sheet, option 4." },
  { s: QA, q: "Out of the total income, a family saves 15% and the rest of the amount is spent on three types of expenditure – health, education and food in the ratio of 1 : 2 : 2. The income is Rs.300 less than thrice the expenditure incurred on education. What is the difference between the savings and the expenditure incurred on health?", o: ["Rs.300","Rs.350","Rs.2,250","Rs.500"], e: "Spent = 0.85I in 1:2:2. Education = 0.34I. I = 3×0.34I − 300 → I = 15000. Savings = 2250, Health = 2550 → Diff = 300. Option 1." },
  { s: QA, q: "Answer based on the figure shown.", o: ["15","16","14","17"], e: "Per response sheet, option 4 (17)." },
  { s: QA, q: "A trader marked a table at ₹37,062, and sold it allowing a 33% discount. If his profit was 42%, then the cost price (in ₹) of the table was:", o: ["15,487","16,487","17,487","13,487"], e: "SP = 37062 × 0.67 = 24831.54. CP = 24831.54/1.42 ≈ 17487. Option 3." },
  { s: QA, q: "If the volume of a cube is given as 12167 cm³, then the surface area of the cube will be:", o: ["3475 cm²","4574 cm²","3174 cm²","5413 cm²"], e: "Side = ∛12167 = 23. SA = 6×23² = 3174. Option 3." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nOn cloud nine", o: ["To be extremely cautious","To be extremely happy","To be extremely shaky","To be extremely sad"], e: "'On cloud nine' = extremely happy. Option 2." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nPrudent", o: ["Wise","Atrocious","Stupid","Crafty"], e: "Antonym of 'Prudent' (wise) = Stupid. Option 3." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nThe rebels laid up their arms.", o: ["laid down","laid out","laid on","laid by"], e: "'Laid down their arms' (surrendered) is the standard idiom. Option 1." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\n___________ UK government continually reiterates its commitment to halting the brain drain.", o: ["The","A","An","Any"], e: "'The UK government' uses definite article. Option 1." },
  { s: ENG, q: "Identify the segment that contains a grammatical error.\n\nI caught / a white cat / rustling / beneath my room.", o: ["a white cat","I caught","rustling","beneath my room."], e: "Per response sheet, option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in reported speech.\n\n\"We will have a thorough search before opening the room,\" the inspector told his subordinates.", o: ["The inspector told his subordinates that they would be having a thorough search before opening the room.","The inspector told his subordinates that they can have a thorough search before opening the room.","The inspector told his subordinates that they will had a thorough search before opening the room.","The inspector told his subordinates that they would have a thorough search before opening the room."], e: "Direct 'will' → indirect 'would'. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in reported speech.\n\nThe teacher said, \"She had started the fight\".", o: ["The teacher complained that she has started the fight.","The teacher said that she had started the fight.","The teacher ordered that she had started the fight.","The teacher said that she has started the fight."], e: "Past perfect 'had started' remains in reported speech. Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the underlined group of words in the given sentence.\n\nThe war resulted in ruthless killing of many people.", o: ["sacrilege","fratricide","carnage","murder"], e: "'Carnage' = ruthless mass killing. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nThe storm destroyed the entire village.", o: ["The entire village was destroyed by the storm.","The storm was destroying the entire village.","The village was being destroyed entirely by the storm.","The village was entirely destroyed by the storm."], e: "Past simple active → passive 'was destroyed'. Option 1." },
  { s: ENG, q: "Select the most appropriate synonym for the highlighted word.\n\nThe hapless incident was a result of sheer negligence by the authorities.", o: ["joyful","triumphant","ill-fated","grateful"], e: "'Hapless' = unfortunate/ill-fated. Option 3." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence.\n\nShe has gained a lot of fame but still she is very realistic and sensible.", o: ["down to earth","down to it","down to bottom","down to drown"], e: "'Down to earth' = realistic and sensible. Option 1." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Publicly","Punctual","Protien","Pursuit"], e: "'Protien' is misspelled — correct is 'Protein'. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nHasten", o: ["Triumph","Spooky","Present","Dawdle"], e: "Antonym of 'Hasten' (hurry) = Dawdle (linger). Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nConditions such as stress, depression and anxiety can all affect mental health and _________ a person's routine.", o: ["fragment","crush","dishevel","disrupt"], e: "'Disrupt a person's routine' is the natural collocation. Option 4." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution'.\n\nHe was advised for walking alone in the neighbourhood.", o: ["No substitution","advised about","advised against","advised on"], e: "'Advised against walking alone' (warned not to). Option 3." },
  { s: ENG, q: "Read the Publications Division passage.\n\nSelect the most appropriate option to fill in blank no. 1.\n\n'functions (1)________ the Ministry of Information and Broadcasting'", o: ["of","in","under","on"], e: "'Functions under the Ministry' (i.e., reports to). Option 3." },
  { s: ENG, q: "Read the Publications Division passage.\n\nSelect the most appropriate option to fill in blank no. 2.\n\n'(2)________ information and creating awareness'", o: ["concealing","disseminating","pouring","assembling"], e: "'Disseminating information' is the standard expression. Option 2." },
  { s: ENG, q: "Read the Publications Division passage.\n\nSelect the most appropriate option to fill in blank no. 3.\n\n'the (3)________ cultures and beliefs of the Nation'", o: ["same","myriad","clear","absolute"], e: "'Myriad cultures' (countless) fits India's diversity. Option 2." },
  { s: ENG, q: "Read the Publications Division passage.\n\nSelect the most appropriate option to fill in blank no. 4.\n\n'in important cities and also (4)________ agents'", o: ["through","as","about","in"], e: "'Through agents' (via distribution agents). Option 1." },
  { s: ENG, q: "Read the Publications Division passage.\n\nSelect the most appropriate option to fill in blank no. 5.\n\n'Till date, 7,600 titles (5)________ published'", o: ["have being","have been","have be","had being"], e: "Present perfect passive: 'have been published'. Option 2." },
  { s: ENG, q: "Read the Achilles passage.\n\nWhich word in the passage is OPPOSITE in meaning to 'advanced'?", o: ["Flushed","Lingered","Crossed","Snagged"], e: "'Lingered' (stayed back) is the opposite of 'advanced'. Option 2." },
  { s: ENG, q: "Read the Achilles passage.\n\n\"He was holding the earrings up to his ears now, turning them this way and that, pursing his lips, playing at girlishness.\"\n\nWhat do you infer as the most probable reason for Achilles' behaviour?", o: ["Achilles was selecting an ideal gift for Lycomedes.","Achilles was in charge of selecting the best accessories for war.","Achilles was in a woman's disguise and was playing his part.","Achilles was playing the part of an ideal host."], e: "Achilles is in female disguise on Scyros (Greek myth); he plays the role. Option 3." },
  { s: ENG, q: "Read the Achilles passage.\n\nWhy was Odysseus distributing the gifts?", o: ["Because he was very generous and wanted to help the people of Scyros who could not afford such gifts.","Because he knew Achilles' fascination for jewellery and wanted to gift him earrings and other ornaments.","Because he was pleased after witnessing the performance of the dancers of Scyros.","Because he wanted to take Lycomedes to war and had come to gift him swords and shields."], e: "Stated reason in passage: tokens of admiration after the dance performance. Option 3." },
  { s: ENG, q: "Read the Achilles passage.\n\n\"Lycomedes' eyes had caught on one of these, like a fish snagged by a line.\" What can be inferred from this statement?", o: ["He was attracted to the unique looking sword which looked like a fishing line with a hook.","Being a warrior, he was attracted to the sword and all the more since he could not afford one like that on his own.","He was very cunning and wanted to take the shields and swords in order to fight Odysseus later on.","He was a greedy man and wanted to take the best gifts for himself without sharing anything with others."], e: "Inference: a warrior-king attracted to a fine sword he couldn't otherwise afford. Option 2." },
  { s: ENG, q: "Read the Achilles passage.\n\nWhat is the passage based upon?", o: ["A palace scene where the king and his counsellors are deciding to give gifts to the poor people who had just completed their dance performance in front of everyone.","A palace scene where the king is distributing gifts to the performers who are very poor and cannot afford to buy such gifts on their own.","A palace scene where a dance performance is taking place and thereafter, gifts are distributed to the performers and their selecting the trinkets are described.","A palace scene where gifts are being distributed after a dance performance and detailed descriptions of the gifts and the way that people are choosing them are presented."], e: "Best fit: palace scene, gifts after dance, detailed descriptions. Option 4." }
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
      tags: ['SSC', 'Selection Post', 'Phase XI', 'Graduate', 'PYQ', '2023'],
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

  const TEST_TITLE = 'SSC Selection Post Phase XI (Graduate) - 27 June 2023 Shift-4';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2023, pyqShift: 'Shift-4',
    pyqExamName: 'SSC Selection Post Phase XI (Graduate)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
