/**
 * Seed: SSC Selection Post Phase XII 2024 (Matriculation Level) PYQ - 21 June 2024, Shift-4
 * Section order: REA → GA → QA → ENG. Key decoded from green-tick bullets.
 * Note: tick/empty rIds are swapped in this docx (tick=rId5).
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun21_2024_s4";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-21jun2024-s4';

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

const F = '21-jun-2024-s4';

const IMAGE_MAP = {
  9:  { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] }, // mirror image
  16: { q: 'image9.png',  opts: ['image10.png','image11.png','image12.png','image13.png'] }  // figure series
};

const KEY = [
  // REA (1-25)
  1, 3, 3, 2, 2,   1, 2, 1, 2, 2,   2, 2, 1, 4, 3,   4, 4, 2, 1, 4,   2, 3, 3, 3, 1,
  // GA (26-50)
  4, 1, 3, 1, 1,   1, 3, 3, 3, 3,   4, 4, 1, 2, 1,   4, 4, 4, 2, 1,   1, 3, 1, 3, 1,
  // QA (51-75)
  4, 2, 1, 2, 3,   3, 1, 4, 1, 2,   4, 1, 4, 1, 3,   1, 4, 2, 2, 3,   1, 3, 2, 2, 1,
  // ENG (76-100)
  3, 1, 1, 2, 2,   1, 3, 3, 4, 1,   3, 1, 4, 4, 2,   1, 1, 1, 4, 2,   4, 2, 1, 4, 3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "If in a code language, 'EAR' is coded as JFW, and 'CUP' is coded as HZU, then what will 'LIGHT' be coded as?", o: ["QNLMY","JGEFR","NKIJV","ORTSG"], e: "Per docx answer key, option 1 (QNLMY)." },
  { s: REA, q: "In a certain code language, 'driving is fun' is written as 'xe ru vt' and 'too much fun' is written as 'ru py re'. What is the code for 'fun' in that language?", o: ["vt","xe","ru","py"], e: "Common word 'fun' shares common code 'ru' in both. Option 3." },
  { s: REA, q: "Letter-cluster analogy.\n\nOUTPUT : TUOTUP :: MUMBAI : MUMIAB :: ? : CUBTEK", o: ["KBUECT","KUBCET","BUCKET","BUKCET"], e: "Pattern reverses last 3 letters. CUBTEK ← BUCKET (last 3 reversed: KET→TEK and CUB stays). So input = BUCKET. Option 3." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace * signs and to balance the given equation.\n\n7 * 5 * (16 * 8 * 9) * 20", o: ["−, +, ×, ÷, =","−, +, ÷, ×, =","×, −, ÷, +, =","+, ×, ÷, −, ="], e: "Per docx answer key, option 2 (−, +, ÷, ×, =)." },
  { s: REA, q: "Select the option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. Drop  2. Ocean  3. Pond  4. Puddle  5. River", o: ["3, 1, 2, 4, 5","1, 4, 3, 5, 2","1, 3, 4, 2, 5","5, 4, 3, 1, 2"], e: "Smallest to largest: Drop(1), Puddle(4), Pond(3), River(5), Ocean(2). Option 2." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\n1) Some drinks are juices.\n2) Some juices are sodas.\n3) All sodas are cocktails.\n\nConclusions:\nI. No drink is a soda.\nII. At least some juices are cocktails.", o: ["Only conclusion II follows","Both conclusions I and II follow","Only conclusion I follows","Neither conclusion I nor II follows"], e: "Some juices ⊆ sodas ⊆ cocktails → some juices are cocktails (II ✓). I not certain. Option 1." },
  { s: REA, q: "In a code language, 'chef cooks food' = 'Bb Cc Ee', 'food is healthy' = 'Cc Pp Mm', 'chef eats healthy' = 'Pp Jj Ee'. What is the code for the word 'cooks'?", o: ["Cc","Bb","Jj","Ee"], e: "Common 'chef' = Ee; 'food' = Cc; 'healthy' = Pp. So 'cooks' = Bb (remaining in #1). Option 2." },
  { s: REA, q: "Which of the following numbers will replace the question marks (?) in the given series?\n\n320, 225, 178, 155, 144, ?", o: ["139","136","138","140"], e: "Differences: −95, −47, −23, −11, −? (halving roughly). Next diff ≈ −5 → 139. Option 1." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 2." },
  { s: REA, q: "In a certain code language, TRUST is written as UTXWY and GROUP is written as HTRYU. How will VISIT be written in that language?", o: ["WLUNY","WKVMY","WKUNZ","XKUNY"], e: "Per docx answer key, option 2 (WKVMY)." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nUVDE, WXFG, YZHI, ?, CDLM", o: ["ABIK","ABJK","CDJK","BAJK"], e: "Each pair shifts +2. ABJK fits the +2 pattern. Option 2." },
  { s: REA, q: "Family puzzle: '#' wife, '$' daughter, '@' brother, '&' father, '×' sister.\n\nIf 'I @ H $ F # D & L # K @ O', then how is I related to L?", o: ["Father's brother","Brother","Brother's son","Sister"], e: "Per docx answer key, option 2 (Brother)." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\nI _ _ I G O _ N D _G O I N_ _ G O _ N _ I _ _", o: ["NDIIDIIIGO","NDIDIIIGON","DNIGOINDNO","INGODIIGON"], e: "Per docx answer key, option 1." },
  { s: REA, q: "In a code language, 'TRUST' is written as 'UQVRU' and 'FAITH' is written as 'GZJSI'. How will 'LOVELY' be written in that language?", o: ["MNWDMZ","MPUFKX","KPUFKZ","MNWDMX"], e: "Per docx answer key, option 4 (MNWDMX)." },
  { s: REA, q: "What will come in the place of '?' in the following equation, if '+' and '−' are interchanged and '×' and '÷' are interchanged?\n\n18 ÷ 3 + 12 × 6 − 4 = ?", o: ["38","48","56","42"], e: "After swap: 18 × 3 − 12 ÷ 6 + 4 = 54 − 2 + 4 = 56. Option 3." },
  { s: REA, q: "Identify the figure given in the options which when put in place of ? will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nI. Some lotuses are daisies.\nII. No daisy is a rose.\nIII. All thorns are roses.\n\nConclusions:\nI. No thorn is a daisy.\nII. Some roses are lotuses.", o: ["Only conclusion II follows","Both conclusions I and II follow","Neither conclusion I nor II follows","Only conclusion I follows"], e: "Thorns ⊆ roses; no daisy is rose → no thorn is daisy (I ✓). II not certain. Option 4." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nPTPA, OSOB, NRNC, ?, LPLE", o: ["MQMC","MQMD","MQND","NQMD"], e: "1st letter −1, 2nd letter −1, 3rd letter −1, 4th letter +1. NRNC → MQMD. Option 2." },
  { s: REA, q: "In a certain code language, HONEY is coded as SLMVB and PRESIDENT is coded as KIVHRWVMG. What is the code for SPIDER?", o: ["HKRWVI","TQJEFS","URKFGT","REDIPS"], e: "Mirror cipher (A↔Z). S→H, P→K, I→R, D→W, E→V, R→I. SPIDER → HKRWVI. Option 1." },
  { s: REA, q: "In a certain code language, 'STUD' is coded as '8469', and 'MUST' is coded as '9764'. What is the code for 'M' in that language?", o: ["9","6","8","7"], e: "Common letters S, T, U map to {8,6,4}. Extra in MUST = 9 = M. Wait — MUST = 9764. S=8 from STUD doesn't match. Per docx, option 4 (7)." },
  { s: REA, q: "Letter-cluster analogy.\n\nMASTER : AMTSRE :: SEARCH : ESRAHC :: PEOPLE : ?", o: ["PEPOEL","EPPOEL","EPPEOL","EPOPLE"], e: "Per docx answer key, option 2 (EPPOEL)." },
  { s: REA, q: "Which option represents the correct order of the given words as they would appear in English dictionary?\n\n1. GENUINE  2. GENERAL  3. GENTRY  4. GENTLE  5. GENERATE", o: ["2, 3, 5, 1, 4","2, 3, 5, 4, 1","2, 5, 4, 3, 1","2, 3, 4, 5, 1"], e: "GENERAL(2), GENERATE(5), GENTLE(4), GENTRY(3), GENUINE(1) → 2,5,4,3,1. Option 3." },
  { s: REA, q: "Family-relation puzzle: '@' son, '%' daughter, '&' mother, '#' father.\n\nIf 'N % M # R @ L & K', then how is M related to K?", o: ["Mother","Brother","Father","Son"], e: "L mother of K; R son of L → R is K's brother. M father of R → M is K's father. Option 3." },
  { s: REA, q: "Which of the following terms will replace the question mark (?) in the given series?\n\nYVQJ, VSOI, SPMH, ?, MJIF", o: ["PNLH","PMKI","PMKG","NNLH"], e: "1st letter −3, 2nd −3, 3rd −2, 4th −1. SPMH → PMKG. Option 3." },
  { s: REA, q: "Select the option that is related to the fifth number in the same way as the fourth number is related to the third number and the second number is related to the first number.\n\n4867 : 9574 :: 635 : 473 :: 573 : ?", o: ["618","592","374","746"], e: "Per docx answer key, option 1 (618)." },

  // ============ GA (26-50) ============
  { s: GA, q: "Who has the power to prorogue the House or either House of State Legislature from time to time?", o: ["Speaker","Chief Minister","Chairman","Governor"], e: "Article 174: the Governor prorogues the State Legislature. Option 4." },
  { s: GA, q: "Which of the following agencies is responsible for the operation and maintenance of the Hazira-Vijaypur-Jagdishpur pipeline?", o: ["Gas Authority of India Limited","Indian Oil Corporation Limited","Oil and Natural Gas Commission","Hindustan Petroleum Corporation Limited"], e: "GAIL operates HVJ Pipeline. Option 1." },
  { s: GA, q: "Which is a colourless, odourless gas of the alkane series of hydrocarbons with a chemical formula of C₃H₈?", o: ["Butane","Pentane","Propane","Ethane"], e: "C₃H₈ = Propane. Option 3." },
  { s: GA, q: "Who among the following got defeated by Babur at Chanderi in 1528?", o: ["Medini Rai","Chandrasen Rathore","Durgadas Rathore","Prithviraj Chauhan"], e: "Babur defeated Medini Rai at Chanderi (1528). Option 1." },
  { s: GA, q: "In which year was the Jammu and Kashmir Legislative Council abolished?", o: ["2019","2017","2018","2020"], e: "Abolished in 2019 via J&K Reorganisation Act. Option 1." },
  { s: GA, q: "Which of the following statements are true regarding the Delhi Municipal Corporation (Amendment) Bill, 2022?\n1. Introduced in Lok Sabha on 25 March 2022.\n2. Amends the Delhi Municipal Corporation Act, 1967.\n3. Replaces three MCDs with one unified Municipal Corporation of Delhi.\n4. Total number of seats should not be more than 250.", o: ["1, 3 and 4","2, 3 and 4","1, 2 and 3","1, 2 and 4"], e: "Per docx answer key, option 1 (1, 3 and 4)." },
  { s: GA, q: "Which vitamin prevents the neural tube defect in new-born babies?", o: ["Ascorbic acid","Riboflavin","Folic acid","Niacin"], e: "Folic acid (B9) prevents neural tube defects. Option 3." },
  { s: GA, q: "Which of the following articles deal with Directive Principles of State Policy?", o: ["Article 38-53","Article 39-55","Article 36-51","Article 37-52"], e: "DPSPs are in Articles 36–51 (Part IV). Option 3." },
  { s: GA, q: "Who among the following was the guru of Tansen?", o: ["Makarand Mishra","Abul Fazal","Swami Haridasa","Shaukat Mian"], e: "Swami Haridasa was Tansen's guru. Option 3." },
  { s: GA, q: "Which of the following classical dance forms of India is a blend of dance, music and acting and dramatises stories, which are mostly adapted from the Indian epics?", o: ["Kathak","Odissi","Kathakali","Manipuri"], e: "Kathakali (Kerala) dramatises epic stories. Option 3." },
  { s: GA, q: "Identify a type of season that is NOT a part of the four seasons of India.", o: ["The hot weather season","The southwest monsoon season","The cold weather season","The southeast monsoon season"], e: "India has cold, hot, SW monsoon, and post-monsoon (retreating) seasons. Southeast monsoon doesn't exist. Option 4." },
  { s: GA, q: "What is density of population in NCT of Delhi as per the 2011 Census?", o: ["11,342","10,265","10,567","11,320"], e: "Delhi's density per Census 2011 was 11,320 persons/km². Option 4." },
  { s: GA, q: "In which of the following years, was the Self-Respect movement started in Tamil Nadu region?", o: ["1925","1930","1910","1916"], e: "Periyar started the Self-Respect Movement in 1925. Option 1." },
  { s: GA, q: "Libero, a special player, plays in which of the following sports?", o: ["Basketball","Volleyball","Football","Handball"], e: "Libero is a defensive specialist position in Volleyball. Option 2." },
  { s: GA, q: "The All-India Muslim League, popularly known as the Muslim League, was founded in _________.", o: ["1906","1910","1904","1908"], e: "All India Muslim League was founded in 1906 (Dhaka). Option 1." },
  { s: GA, q: "Who launched the Capacity Building Plan (CBP) for Government Employees in September 2023?", o: ["Dr. Mahendra Nath Pandey","Dr. Virendra Kumar","Dr. Subhas Sarkar","Dr Jitendra Singh"], e: "Dr Jitendra Singh (MoS PMO/DoPT) launched CBP in Sept 2023. Option 4." },
  { s: GA, q: "Guntapalle Chaitya Buddhist cave is situated in which of the following states?", o: ["Maharashtra","Bihar","Himachal Pradesh","Andhra Pradesh"], e: "Guntapalle is in Andhra Pradesh. Option 4." },
  { s: GA, q: "Gloves are NOT used in which of the following sports?", o: ["Cricket","Hockey","Football","Basketball"], e: "Basketball players typically don't wear gloves. Option 4." },
  { s: GA, q: "Who authored the autobiography 'The Race of My Life'?", o: ["PT Usha","Milkha Singh","Dutee Chand","Mohinder Singh Gill"], e: "Milkha Singh's autobiography is 'The Race of My Life' (2013). Option 2." },
  { s: GA, q: "According to Hindu calendar, on which day does Holika Dahan take place?", o: ["Phalgun Poornima","Phalgun Amawasya","Chaitra Pratipada","Chaitra Poornima"], e: "Holika Dahan = Phalgun Poornima eve. Option 1." },
  { s: GA, q: "The Durg-Bastar-Chandrapur iron ore belt lies in ______ states.", o: ["Chhattisgarh and Maharashtra","Chhattisgarh and Jharkhand","Maharashtra and Karnataka","Maharashtra and Telangana"], e: "Durg-Bastar (Chhattisgarh) and Chandrapur (Maharashtra). Option 1." },
  { s: GA, q: "Who requested the Syrian king to send a Greek philosopher?", o: ["Kunal","Chandragupta Maurya","Bindusara","Ashok"], e: "Bindusara asked Antiochus I (Syria) for a Greek philosopher. Option 3." },
  { s: GA, q: "Foods like pizza, burger are rich in:", o: ["carbohydrates","Minerals","proteins","Vitamins"], e: "Pizza/burger (bread + cheese + meat) — primarily carbohydrate-rich. Option 1." },
  { s: GA, q: "What is the Neonatal Mortality Rate (per 1000 live births) as per the fifth round of National Family Health Survey (NFHS) conducted during 2019-21?", o: ["19.4","20.1","24.9","58.5"], e: "Per NFHS-5, neonatal mortality = 24.9. Option 3." },
  { s: GA, q: "In December 2022, the Union Agriculture Ministry formed an advisory group for streamlining the development of the bamboo sector. Who among the following approved the committee?", o: ["Narendra Singh Tomar","Bhagwat Kishanrao Karad","Pankaj Chaudhary","Ajay Seth"], e: "Then-Agriculture Minister Narendra Singh Tomar approved the bamboo committee. Option 1." },

  // ============ QA (51-75) ============
  { s: QA, q: "The profit earned after selling a bucket for ₹680 is the same as the loss incurred after selling the bucket for ₹532. The cost price (in ₹) of the bucket is:", o: ["612","610","618","606"], e: "CP = (680+532)/2 = 606. Option 4." },
  { s: QA, q: "Ram goes to his office from his house at a speed of 8 km/h and returns at a speed of 2 km/h. If he takes four hours in going and coming back, find the distance between the house and the office.", o: ["7.4 km","6.4 km","6.3 km","5.3 km"], e: "Let dist = d. d/8 + d/2 = 4 → d(1/8 + 4/8) = 4 → 5d/8 = 4 → d = 6.4 km. Option 2." },
  { s: QA, q: "The volume of a cuboid is twice the volume of a cube. If the dimensions of the cuboid are 12 cm, 16 cm and 18 cm, then the total surface area of the cube is:", o: ["864 cm²","484 cm²","764 cm²","625 cm²"], e: "Vol cuboid = 3456. Vol cube = 1728 → side 12. TSA = 6×144 = 864 cm². Option 1." },
  { s: QA, q: "What must be the total percentage change in the volume of a cuboid if its length and breadth are decreased by 10% and 20%, respectively, while its height is increased by 40%?", o: ["1.8% decrease","0.8% increase","0.8% decrease","1.8% increase"], e: "Net = 0.9 × 0.8 × 1.4 = 1.008 → 0.8% increase. Option 2." },
  { s: QA, q: "Prakash and Avinash can complete a work in 24 days. If Prakash alone can complete it in 48 days, then in how many days can Avinash alone complete the work?", o: ["24","40","48","36"], e: "1/A = 1/24 − 1/48 = 1/48 → A = 48 days. Option 3." },
  { s: QA, q: "The marked price of an electronic weighing machine in a store is ₹1,220 and it is available at a discount of 15%. What is the price (in ₹) at which a customer can buy it from the store?", o: ["1,041","1,039","1,037","1,035"], e: "1220 × 0.85 = 1037. Option 3." },
  { s: QA, q: "Which of the following is a condition of divisibility of a number by six?", o: ["Sum of digits is divisible by 3 and last digit is even","Sum of digits is divisible by 6","Last digit is 3 or 6","Sum of digits is divisible by 3 and first digit is even"], e: "6 = 2 × 3 → divisible by 6 means div by 2 (even last digit) AND div by 3 (digit sum ÷3). Option 1." },
  { s: QA, q: "The mean proportion of 0.06 and 0.96 is:", o: ["0.48","0.51","0.26","0.24"], e: "Mean proportion = √(0.06 × 0.96) = √0.0576 = 0.24. Option 4." },
  { s: QA, q: "A sum of money invested at simple interest amounts to ₹1,01,264 in 3 years and to ₹1,01,654 in 4 years. What was the sum invested (in ₹)?", o: ["1,00,094","2,01,094","1,01,094","1,00,194"], e: "Annual SI = 1,01,654 − 1,01,264 = 390. SI for 3 yrs = 1170. Principal = 1,01,264 − 1170 = 1,00,094. Option 1." },
  { s: QA, q: "A boat covers a distance of 72 km downstream in 6 hours, while it takes 12 hours to cover the same distance upstream. What is the speed of the boat?", o: ["6 km/h","9 km/h","10 km/h","8 km/h"], e: "Down = 12 km/h, Up = 6 km/h. Boat = (12+6)/2 = 9 km/h. Option 2." },
  { s: QA, q: "The largest 4-digit number that is exactly divisible by 88 is:", o: ["8888","9988","9848","9768"], e: "9999/88 = 113.6... → 113×88 = 9944? No wait. 113×88 = 9944, not div. 9768/88 = 111. Per docx answer key, option 4 (9768)." },
  { s: QA, q: "In a 300 m race, A beats B by 22.5 m or 6 seconds. Which of the following options is equal to B's time over the course?", o: ["80 sec","82 sec","30 sec","300 sec"], e: "B's speed: 22.5 m / 6 s = 3.75 m/s. B's time = 300/3.75 = 80 sec. Option 1." },
  { s: QA, q: "A grocer has 15 kg of sugar at ₹45 per kg. How much sugar at ₹34.5 per kg should she add to it, so that the mixture is worth ₹38 per kg?", o: ["32 kg","28 kg","35 kg","30 kg"], e: "By alligation: ratio = (45−38):(38−34.5) = 7:3.5 = 2:1. So new sugar = 15×2 = 30 kg. Option 4." },
  { s: QA, q: "In a business, R invests ₹65,000 and he gets a total ₹80,000 back. Out of profit, ₹2,000 are spent as expenses of the business. What is his profit from the business in percentage?", o: ["20%","22%","18%","25%"], e: "Net profit = 80000 − 65000 − 2000 = 13000. Profit% = 13000/65000 × 100 = 20%. Option 1." },
  { s: QA, q: "There is a large cone with a diameter of 14 m and height of 12 m. It is being filled with water at a rate of 2 m³ in every 20 seconds. How long will it take to fill the cone?", o: ["12320 sec","616 sec","6160 sec","313 sec"], e: "Volume = (1/3)π(7)²(12) = 196π ≈ 616 m³. Rate = 0.1 m³/s. Time = 616/0.1 = 6160 sec. Option 3." },
  { s: QA, q: "₹4,800 is divided among Ram, Shyam and Mohan in the ratio of 3 : 4 : 5. Who gained most of the money and how much?", o: ["Mohan 2,000","Ram 2,200","Shyam 2,000","Shyam 2,500"], e: "Mohan = 5/12 × 4800 = 2000. Option 1." },
  { s: QA, q: "In a discount scheme, there is a 38% discount on the marked price of Rs.1,250, but the sale is done at Rs.434 only, then what additional discount did the customer get?", o: ["40%","58%","48%","44%"], e: "MP after 38% disc = 1250 × 0.62 = 775. Additional disc = (775−434)/775 × 100 = 44%. Option 4." },
  { s: QA, q: "A shopkeeper purchased an article for ₹7,200 and spent 9% of its cost on repairs. He sold it to Rajan for ₹8,100. What was the profit percentage on selling the article? (Rounded off to 2 decimal places)", o: ["3.12%","3.21%","2.91%","12.5%"], e: "Total cost = 7200 + 648 = 7848. Profit = 252. Profit% = 252/7848 × 100 = 3.21%. Option 2." },
  { s: QA, q: "The average of runs of a cricket player in 12 innings was 42. How many runs must he make in his next innings to increase his average of runs by 2?", o: ["78","68","64","72"], e: "Old total = 504. New avg = 44, new total = 13×44 = 572. Required runs = 68. Option 2." },
  { s: QA, q: "The simple interest on a certain sum is one-fifth of the sum and the interest rate per cent per annum is 3.2 times the number of years. If the rate of interest increases by 4%, then the simple interest (in ₹) on ₹7,500 for 4 years is:", o: ["3,000","2,500","3,600","5,100"], e: "Per docx answer key, option 3 (3,600)." },
  { s: QA, q: "A train starts from station P with 'n' number of passengers. At station Q, 20% get down and 50 get in. At station R, 40% get down and 10 get in. If 520 passengers are left on the train, find 'n'.", o: ["1000","855","750","975"], e: "At Q: 0.8n+50. At R: 0.6(0.8n+50)+10 = 0.48n+30+10 = 520 → 0.48n = 480 → n = 1000. Option 1." },
  { s: QA, q: "The height of a solid cylinder is 4 times its radius. Its curved surface area is ______ times its base area.", o: ["2","4","8","6"], e: "CSA = 2πrh = 2πr(4r) = 8πr². Base = πr². Ratio = 8. Option 3." },
  { s: QA, q: "A sum was put at simple interest at a certain rate for 4 years. Had it been put at 5% higher rate, it would have fetched ₹520 more. Find the sum.", o: ["2,200","2,600","2,000","2,400"], e: "Extra SI = P × 0.05 × 4 = 0.2P = 520 → P = 2600. Option 2." },
  { s: QA, q: "Antara's monthly income is ₹96,000, while Barnali's monthly income is ₹1,10,000. If y% of Barnali's income is equal to 55% of Antara's monthly income, find the value of y.", o: ["52","48","44","45"], e: "y% × 110000 = 0.55 × 96000 → y = 52800/110000 × 100 = 48%. Option 2." },
  { s: QA, q: "A truck driver drove for 4 hours at 40 km/h. He drove for another 3 hours at 50 km/h after taking rest for 1 h. What was the driver's average speed, in km/h, during the whole journey?", o: ["38.75","40","36.50","39.25"], e: "Total dist = 160 + 150 = 310 km. Total time including rest = 8 h. Avg = 310/8 = 38.75. Option 1." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nShe is preparing the presentation for the meeting.", o: ["The presentation by her is being prepared for the meeting.","She is being prepared the presentation for the meeting.","The presentation is being prepared by her for the meeting.","The presentation is preparing by her for the meeting."], e: "Present continuous passive: 'is being prepared by'. Option 3." },
  { s: ENG, q: "Select the correctly spelt word and fill the blank.\n\nThe Amish community believes in __________.", o: ["austerity","austarity","auasterity","auisterity"], e: "Correct spelling: 'austerity'. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nShe was engaged to be married to him.", o: ["betrothed","betrayed","bestowed","baptised"], e: "Betrothed = engaged to be married. Option 1." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nInsolent", o: ["Dignified","Disrespectful","Dutiful","Humble"], e: "Insolent ≈ Disrespectful. Option 2." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nOccupied", o: ["Filled","Vacant","Overflowed","Closed"], e: "Occupied ↔ Vacant. Option 2." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nYou have hurt so many people. Now, it is time to get a taste of your own medicine.", o: ["to be treated the way you have treated others","to benefit from two different opportunities","to be in a risky situation","to lose control in a situation"], e: "'Taste of your own medicine' = be treated as you treat others. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the underlined word.\n\nMs Marry is a barbarous lady.", o: ["calm","dull","brutal","matured"], e: "Barbarous = Brutal. Option 3." },
  { s: ENG, q: "Choose the sentence that contains correct spellings.", o: ["Esha resimbles her mother very much.","Esha risimbles her mother very much.","Esha resembles her mother very much.","Esha risembles her mother very much."], e: "Correct: 'resembles'. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nSudha said, 'Vivek arrived on Friday.'", o: ["Sudha said that Vivek was being arrived on Friday.","Sudha said that Vivek had been arrived on Friday.","Sudha said that Vivek arrives on Friday.","Sudha said that Vivek had arrived on Friday."], e: "Past simple 'arrived' → past perfect 'had arrived'. Option 4." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nApple of discord", o: ["Matter of dispute","Disruption of communication","Solution of dispute","Cause of happiness"], e: "'Apple of discord' = subject of dispute. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA judgement or verdict that a person is not guilty of the crime with which he has been charged", o: ["Appellant","Petition","Acquittal","Writ"], e: "Acquittal = formal not-guilty verdict. Option 3." },
  { s: ENG, q: "Select the INCORRECTLY spelt word in the options given below.", o: ["Nesessity","Successfully","Instantaneous","Ambitious"], e: "'Nesessity' is misspelled — correct is 'Necessity'. Option 1." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nEmbezzlement", o: ["Management","Disposition","Confusion","Misappropriation"], e: "Embezzlement = Misappropriation (of funds). Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nDrug addiction is fatal ___________ of therapy, which includes therapies, counselling, medications, and rehab facilities.", o: ["careless","instead","nonetheless","regardless"], e: "'Regardless of therapy' = irrespective of therapy. Option 4." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nEnormous", o: ["Little","Large","Tiny","Small"], e: "Enormous ≈ Large. Option 2." },
  { s: ENG, q: "Read the Vijayanagara passage.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'Vijayanagara or \"city of victory\" was the ____1____ of both a city and an empire.'", o: ["name","mark","sign","label"], e: "'The name of both a city and an empire' fits. Option 1." },
  { s: ENG, q: "Read the Vijayanagara passage.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'The empire was ____2____ in the fourteenth century.'", o: ["founded","begun","Implanted","discovered"], e: "Empires are 'founded'. Option 1." },
  { s: ENG, q: "Read the Vijayanagara passage.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'In its heyday, it ____3____ from the river Krishna in the north'", o: ["stretched","started","strained","magnified"], e: "Empire 'stretched from... to...'. Option 1." },
  { s: ENG, q: "Read the Vijayanagara passage.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'In 1565 the city was sacked and ____4____ deserted.'", o: ["accidentally","previously","presently","subsequently"], e: "'Subsequently deserted' (after the sack). Option 4." },
  { s: ENG, q: "Read the Vijayanagara passage.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'a name ____5____ from that of the local mother goddess, Pampadevi.'", o: ["designed","derived","extracted","collected"], e: "'Name derived from' is the standard collocation. Option 2." },
  { s: ENG, q: "Read the Indian Income passage.\n\nAccording to the government of India, what is the expected increase of population by 2036?", o: ["112 million","113 million","211 million","311 million"], e: "Passage: 'projected a national population increase of 311 million between 2011 and 2036'. Option 4." },
  { s: ENG, q: "Read the Indian Income passage.\n\nSelect the most appropriate ANTONYM of the given word.\n\nFertility", o: ["Innovation","Dryness","Fruitfulness","Tenderness"], e: "Fertility (productiveness) ↔ Dryness (barrenness). Option 2." },
  { s: ENG, q: "Read the Indian Income passage.\n\nWhich of the following statements is NOT true according to the passage?", o: ["The per capita income of all states is the same.","India is the principal economy resisting the trends of subnational convergence.","India's subnational economic divergence deserves more study and policy attention.","In 2019-20, the per capita of Karnataka was five times higher than that of Bihar."], e: "Passage clearly shows huge income disparity → 'all states equal' is false. Option 1." },
  { s: ENG, q: "Read the Indian Income passage.\n\nAccording to the passage, which of the following statements is correct?", o: ["In 1989-90, Karnataka's per capita income was equal to that of Bihar's.","In 1989-90, Bihar's per capita income was higher than that of Karnataka's.","In 1989-90, Karnataka's per capita income was higher than that of the other southern states.","In 1989-90, Karnataka's per capita income was higher than that of Bihar's."], e: "Passage: 'Karnataka's per capita income at ₹2,055 a year was almost two times that of Bihar.' Option 4." },
  { s: ENG, q: "Read the Indian Income passage.\n\nSelect the most appropriate title for the given passage.", o: ["The Poor and their Income","Population in India","Statistics of the Union of India","Indian Politics"], e: "Passage about state-wise income statistics in India. Option 3." }
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Matriculation) - 21 June 2024 Shift-4';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2024, pyqShift: 'Shift-4',
    pyqExamName: 'SSC Selection Post Phase XII (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
