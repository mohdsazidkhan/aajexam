/**
 * Seed: SSC Selection Post Phase XII 2024 (Matriculation Level) PYQ - 24 June 2024, Shift-1
 * Section order: REA → GA → QA → ENG. Key auto-decoded from green-tick bullets.
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun24_2024_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-24jun2024-s1';

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

const F = '24-jun-2024-s1';

const IMAGE_MAP = {
  15: { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] }, // figure series
  19: { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] }, // mirror
  72: { q: '', opts: ['image14.jpeg','image15.jpeg','image16.jpeg','image17.jpeg'] }, // cube diagonal vol
  74: { q: 'image18.jpeg', opts: ['','','',''] } // figure-based
};

const KEY = [
  // REA (1-25)
  3, 4, 2, 3, 4,   4, 4, 1, 3, 1,   2, 4, 2, 1, 1,   4, 4, 1, 1, 1,   1, 3, 4, 2, 4,
  // GA (26-50)
  1, 2, 2, 3, 4,   4, 4, 4, 3, 4,   1, 1, 1, 2, 3,   3, 2, 3, 2, 2,   2, 3, 2, 3, 4,
  // QA (51-75)
  1, 1, 4, 1, 3,   3, 1, 4, 4, 4,   4, 2, 4, 1, 3,   4, 3, 2, 1, 4,   3, 3, 2, 2, 1,
  // ENG (76-100)
  4, 3, 1, 2, 2,   1, 4, 1, 2, 4,   4, 1, 1, 2, 1,   3, 1, 2, 2, 4,   1, 4, 2, 1, 3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "In a certain code language, 'served her people' is written as 'vt yc df', and 'dinner is served' is coded as 'kp df hu'. How will 'served' be coded in that language?", o: ["kp","vt","df","yc"], e: "Common word 'served' shares common code 'df'. Option 3." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nI. All vases are bottles.\nII. All bottles are flasks.\nIII. All flasks are cups.\n\nConclusions:\nI. Some cups are bottles.\nII. All vases are flasks.", o: ["Neither conclusion I nor II follows","Only conclusion I follows","Only conclusion II follows","Both conclusions I and II follow"], e: "Bottles ⊆ flasks ⊆ cups → some cups are bottles (I ✓). Vases ⊆ bottles ⊆ flasks → all vases are flasks (II ✓). Both. Option 4." },
  { s: REA, q: "What will come in the place of '?' in the following equation, if '+' and '−' are interchanged and '×' and '÷' are interchanged?\n\n143 ÷ 42 − 7 × 8 + 21 = ?", o: ["176","170","159","181"], e: "After swap: 143 × 42 + 7 ÷ 8 − 21. Per docx, option 2 (170)." },
  { s: REA, q: "What will come in the place of '?' in the following equation, if '+' and '−' are interchanged and '×' and '÷' are interchanged?\n\n42 × 6 + 11 − 97 + 25 = ?", o: ["120","131","149","154"], e: "After swap: 42 ÷ 6 − 11 + 97 − 25 = 7 − 11 + 97 − 25 = 68. Per docx, option 3 (149)." },
  { s: REA, q: "Family-relation puzzle: A+B = mother, A−B = brother, A×B = wife, A÷B = father.\n\nHow is B related to E if A − B + C × D ÷ E?", o: ["Mother","Mother's daughter","Father's mother","Mother's mother"], e: "Per docx answer key, option 4 (Mother's mother)." },
  { s: REA, q: "'P × Q' brother, 'P ÷ Q' wife, 'P + Q' father, 'P − Q' daughter.\n\nIf 'D − B × E + C − A', then how is A related to E?", o: ["Father-in-law","Brother's son","Son","Son-in-law"], e: "Per docx answer key, option 4 (Son-in-law)." },
  { s: REA, q: "Select the letter-cluster from among the given options that can replace the question mark (?) in the following series.\n\nAGMST, CIOUV, EKQWX, ?", o: ["FLPXZ","FLOYU","GKSWA","GMSYZ"], e: "Per docx answer key, option 4 (GMSYZ)." },
  { s: REA, q: "In a code language, 'bus car bike' is written as 'az bz ez', 'bicycle tyre car' is written as 'bz fz pz', and 'scooter bus tyre' is written as 'az pz sz'. What is the code for the word 'bicycle' in that language?", o: ["fz","sz","ez","pz"], e: "car=bz, tyre=pz, bus=az. Remaining 'bicycle' in #2 = fz. Option 1." },
  { s: REA, q: "Letter-cluster analogy.\n\nTRUE : XUWF :: USED : YVGE :: POOR : ?", o: ["SSQS","URQR","TRQS","VRPS"], e: "Per docx answer key, option 3 (TRQS)." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\n1) Some trips are hikes.\n2) All hikes are climbs.\n3) Some climbs are jumps.\n\nConclusions:\nI. All trips can never be jumps.\nII. At least some hikes are jumps.", o: ["Neither conclusion I nor II follows","Only conclusion I follows","Both conclusions I and II follow","Only conclusion II follows"], e: "Chain of 'some' doesn't yield definite conclusions. Option 1." },
  { s: REA, q: "In a certain code language, 'sun and sand' is written as 'zf jc dt', and 'the hot sun' is coded as 'km dt wo'. How will 'sun' be coded in that language?", o: ["wo","dt","km","zf"], e: "Common word 'sun' shares common code 'dt'. Option 2." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nEFCD, GHEF, IJGH, ?, MNKL", o: ["KLKI","LLIJ","KLJI","KLIJ"], e: "1st letter +2 (E,G,I,K,M); 2nd +2 (F,H,J,L,N); 3rd +2 (C,E,G,I,K); 4th +2 (D,F,H,J,L). KLIJ. Option 4." },
  { s: REA, q: "Select the option that is related to the fifth number in the same way as the fourth number is related to the third number and the second number is related to the first number.\n\n56 : 51 :: 71 : 64 :: 69 : ?", o: ["60","63","64","61"], e: "Pattern n − (n-1th prime). 56→51 = −5; 71→64 = −7; 69→? Per docx, option 2 (63)." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nBCDA, FGHE, JKLI, ?, RSTQ", o: ["NOPM","MNPM","NOPL","MOPM"], e: "1st letter +4 (B,F,J,N,R); 2nd +4 (C,G,K,O,S); 3rd +4 (D,H,L,P,T); 4th +4 (A,E,I,M,Q). NOPM. Option 1." },
  { s: REA, q: "Identify the figure given in the options which when put in place of ? will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nFlies : Buzz :: Doves : ________", o: ["Howl","Quack","Roar","Coo"], e: "Flies buzz; doves coo. Option 4." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in the order in which they appear in an English dictionary.\n\n1. Brutal  2. Browse  3. Bubble  4. Bruise  5. Buckle", o: ["4, 2, 3, 1, 5","4, 3, 1, 2, 5","3, 4, 1, 5, 2","2, 4, 1, 3, 5"], e: "Browse(2), Bruise(4), Brutal(1), Bubble(3), Buckle(5) → 2,4,1,3,5. Option 4." },
  { s: REA, q: "Which number will replace the question mark (?) in the following series?\n\n31, 37, 41, 43, ?, 53, 59, 61, 67", o: ["47","51","45","49"], e: "Series of primes. After 43, next prime is 47. Option 1." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: REA, q: "In a certain code language, 'candle main' is coded as 'fire blaze' and 'line candle' is coded as 'number fire'. What is the code word for 'main'?", o: ["blaze","over","fire","candle"], e: "Common 'candle' = fire. So 'main' = blaze (from #1). Option 1." },
  { s: REA, q: "Which of the following terms will replace the question mark (?) in the given series?\n\nWGZC, TJVG, ?, NPNO, KSJS", o: ["QMRK","PMRJ","QNRJ","PMRK"], e: "Per docx answer key, option 1 (QMRK)." },
  { s: REA, q: "Which option represents the correct order of the given words as they would appear in an English dictionary?\n\n1. BRILLIANT  2. BRITTLE  3. BRIGHTON  4. BRITISH  5. BRIDGESTONE", o: ["5, 1, 3, 4, 2","3, 1, 5, 2, 4","5, 3, 1, 4, 2","3, 5, 1, 2, 4"], e: "BRIDGESTONE(5), BRIGHTON(3), BRILLIANT(1), BRITISH(4), BRITTLE(2) → 5,3,1,4,2. Option 3." },
  { s: REA, q: "In a certain code language, 'RULE' is written as 'VXNF' and 'LEAD' is written as 'PHCE'. How will 'HERO' be written in that language?", o: ["LHUQ","MHUP","MITP","LHTP"], e: "Per docx answer key, option 4 (LHTP)." },
  { s: REA, q: "In a code language, 'SLEEK' is coded as 37 and 'FOLD' is coded as 25. How will 'YATCH' be coded in the same language?", o: ["52","42","48","40"], e: "Per docx answer key, option 2 (42)." },
  { s: REA, q: "In a certain code language, FROM is coded as 8 and BITTERNESS is coded as 20. What is the code for CAULIFLOWER?", o: ["10","12","11","22"], e: "Pattern: 2 × length. FROM = 4 letters × 2 = 8 ✓. BITTERNESS = 10 × 2 = 20 ✓. CAULIFLOWER = 11 × 2 = 22. Option 4." },

  // ============ GA (26-50) ============
  { s: GA, q: "Sher Khan defeated Humayun in the battle of Chausa and Kanauj and forced him to flee to _______.", o: ["Iran","Uzbekistan","Turkey","Iraq"], e: "Humayun fled to Iran (Safavid court) after Kanauj (1540). Option 1." },
  { s: GA, q: "What is the name of the large-scale demographic survey conducted to provide reliable estimates of birth and death rates and other fertility and mortality indicators at the national and sub-national levels?", o: ["Creation and bifurcation System (CBS)","Sample Registration System (SRS)","Enumeration of Human Resource system (EHRS)","Direct Recruitment System (DRS)"], e: "SRS provides reliable birth/death rate estimates in India. Option 2." },
  { s: GA, q: "Which artificial element has been provisionally named seaborgium by American researchers in honour of Nobel Laureate Glenn T Seaborg?", o: ["Element 103","Element 106","Element 97","Element 90"], e: "Seaborgium has atomic number 106. Option 2." },
  { s: GA, q: "Who among the following has been credited with developing a notation system for Indian classical music?", o: ["Bal Gandharva","Kumar Gandharva","Vishnu Narayan Bhatkhande","Bhimsen Joshi"], e: "Pt. V N Bhatkhande developed the Bhatkhande notation system. Option 3." },
  { s: GA, q: "As of April 2021, the ________ India scheme aims at providing people belonging to the SC/ST or women a loan between ₹10 lakh to ₹1 crore for entrepreneurship, extended up to 2025.", o: ["Grow-up","Start-up","Rise-up","Stand-up"], e: "Stand-Up India scheme provides ₹10 lakh–₹1 crore loans to SC/ST/women entrepreneurs. Option 4." },
  { s: GA, q: "_____________ was elected as the president of the third session of Indian National Congress.", o: ["Pherozeshah Mehta","KT Telang","AO Hume","Badruddin Tyabji"], e: "Badruddin Tyabji presided over the 3rd INC session (1887, Madras). Option 4." },
  { s: GA, q: "How many classical dance forms were officially acknowledged by the Sangeet Natak Akademi in India till 2023?", o: ["9","10","7","8"], e: "SNA recognises 8 classical dance forms. Option 4." },
  { s: GA, q: "The golden revolution in India related to the agriculture sector is referred to as:", o: ["minerals","coconut production","cashew cultivation","horticulture and honey"], e: "Golden Revolution = horticulture and honey production. Option 4." },
  { s: GA, q: "Who among the following is to succeed Air Marshal Sandeep Singh as Vice Chief of Indian Air Force in 2023?", o: ["Vivek Ram Chaudhari","Harjit Singh Arora","Amar Preet Singh","Rakesh Kumar Singh Bhadauria"], e: "AM Amar Preet Singh took over as VCAS in 2023. Option 3." },
  { s: GA, q: "In 1883, which of the following allowed Indians to try Europeans in courts of law?", o: ["Murderous Outrage Regulation","Christian Personal Law","Indian Penal Code","Ilbert Bill"], e: "Ilbert Bill (1883) allowed Indian judges to try Europeans. Option 4." },
  { s: GA, q: "According to article 112 of Indian constitution, who shall cause in every financial year a statement of estimated receipts and expenditure of the Government of India?", o: ["President","Vice President","Speaker","Prime Minister"], e: "Article 112: President causes the Annual Financial Statement (Budget). Option 1." },
  { s: GA, q: "The disease caused by deficiency of iodine is:", o: ["goitre","chicken pox","malaria","anaemia"], e: "Iodine deficiency causes goitre. Option 1." },
  { s: GA, q: "Who has taken over as the new Chief Executive Officer and Chairman of the Railway Board since January 2023?", o: ["Anil Kumar Lahoti","Udai Singh Kumawat","Rashmi Verma","Sansar Chand Bardai"], e: "Anil Kumar Lahoti took over as CEO & Chairman of Railway Board in Jan 2023. Option 1." },
  { s: GA, q: "Bahu Mela in _________ is the major festival held at the Kali Temple in the Bahu Fort twice a year.", o: ["Punjab","Jammu","Haryana","Leh"], e: "Bahu Fort & Bahu Mela are in Jammu. Option 2." },
  { s: GA, q: "Amaravati stupa is situated in which of the following states?", o: ["Tamil Nadu","Odisha","Andhra Pradesh","Madhya Pradesh"], e: "Amaravati Stupa is in Andhra Pradesh. Option 3." },
  { s: GA, q: "Which of the following is defined as the number of females per thousand males in India?", o: ["Population Growth","Fertility Rate","Sex Ratio","Population Density"], e: "Sex Ratio = females per 1000 males. Option 3." },
  { s: GA, q: "Barabar Cave, famously known for depicting Ashoka's inscription, is situated at _______.", o: ["Rampurva, Bihar","Gaya, Bihar","Sanchi, Madhya Pradesh","Sarnath, Uttar Pradesh"], e: "Barabar Caves are in Gaya district, Bihar. Option 2." },
  { s: GA, q: "Which of the following is the correct formula for calculating Body Mass Index (BMI)?", o: ["BMI = kg × cm²","BMI = gm/cm²","BMI = kg/m²","BMI = kg × m²"], e: "BMI = weight (kg) / height² (m²). Option 3." },
  { s: GA, q: "Who founded the International Olympic Committee (IOC) in 1894?", o: ["Konstantinos Zappas","Baron Pierre de Coubertin","Sir Ludwig Guttmann","George Averoff"], e: "Baron Pierre de Coubertin founded the IOC in 1894. Option 2." },
  { s: GA, q: "Which of the following is NOT a part of the ocean floor?", o: ["The continental slope","The deep sea shelf","The deep sea plain","The continental shelf"], e: "'Deep sea shelf' is not a recognised ocean-floor zone (continental shelf, slope, abyssal plain are). Option 2." },
  { s: GA, q: "What is the weight of the shot put for the men's category?", o: ["14 pounds","16 pounds","12 pounds","10 pounds"], e: "Men's shot put weighs 7.26 kg ≈ 16 pounds. Option 2." },
  { s: GA, q: "Which of the following articles lays down for protection from self-incrimination i.e. protection from standing trial against oneself?", o: ["Article 18","Article 19","Article 20","Article 17"], e: "Article 20(3) protects against self-incrimination. Option 3." },
  { s: GA, q: "How many Members of Parliament were elected to the 17th Lok Sabha from Odisha?", o: ["24","21","22","20"], e: "Odisha has 21 Lok Sabha constituencies. Option 2." },
  { s: GA, q: "According to the Indian Mineral Yearbook 2018, which state alone accounts for 72% of the magnetite deposits in India?", o: ["Maharashtra","Tamil Nadu","Karnataka","West Bengal"], e: "Karnataka holds about 72% of India's magnetite reserves. Option 3." },
  { s: GA, q: "Who is the author of the book 'A Life Misspent'?", o: ["Maithili Sharan Gupt","Harivansh Rai Bachchan","Dushyant Kumar","Suryakant Tripathi Nirala"], e: "'A Life Misspent' (Kullī Bhāṭ) was written by Suryakant Tripathi Nirala. Option 4." },

  // ============ QA (51-75) ============
  { s: QA, q: "The lateral surface area of a cylinder is 3862.2 cm² and its height is 15 cm. Find its volume (take π = 3.14) correct to one decimal place.", o: ["79175.1 cm³","78275.2 cm³","89175.1 cm³","88275.2 cm³"], e: "2πrh = 3862.2 → r = 3862.2/(2×3.14×15) ≈ 41. V = πr²h = 3.14×41²×15 ≈ 79175.1 cm³. Option 1." },
  { s: QA, q: "A person can paint a 2.5 ft² of a wall in 5 minutes. How much ft² of the wall will he paint in 6 hours?", o: ["180","160","120","140"], e: "Rate = 2.5/5 = 0.5 ft²/min. In 360 min = 180 ft². Option 1." },
  { s: QA, q: "Dixit covers a certain distance by car, driving at the speed of 28 km/h and he returns to the starting point riding on a scooter at the speed of 36 km/h. Find the average speed (in km/h) for the whole journey.", o: ["64.0","48.5","32.0","31.5"], e: "Avg = 2×28×36/(28+36) = 2016/64 = 31.5 km/h. Option 4." },
  { s: QA, q: "The ratio of the cost price of an article to its selling price is 432 : 612. The profit percentage (rounded off to 2 decimal places) on it is:", o: ["41.66%","40.25%","38.26%","42.33%"], e: "Profit% = (612−432)/432 × 100 = 180/432 × 100 = 41.6666...% Option 1." },
  { s: QA, q: "An amusement park gives an offer to its customers that one person will be given free entry with four other people. What is the effective percentage discount given by the amusement park?", o: ["14%","18%","20%","16%"], e: "Pay 4, get 5 → 1/5 = 20% discount. Option 3." },
  { s: QA, q: "A train covers 40 km between two stations in 45 minutes. It covers another 30 km in 30 minutes and the remaining 20 km in 15 minutes. Find the average speed of the train in the whole journey.", o: ["40 km/h","50 km/h","60 km/h","45 km/h"], e: "Total dist = 90 km. Total time = 90 min = 1.5 h. Avg = 60 km/h. Option 3." },
  { s: QA, q: "A shopkeeper charges his customer 23% more than the cost price. If a customer paid ₹30,135 for a dining table, then find its original price (in ₹).", o: ["24,500","28,200","24,000","23,300"], e: "CP = 30135/1.23 = 24500. Option 1." },
  { s: QA, q: "S varies directly as (R + 7), and S = 42 when R = 17. What is the value of S when R = 29?", o: ["66","58","51","63"], e: "S/(R+7) = 42/24 = 7/4. When R=29: S = 36 × 7/4 = 63. Option 4." },
  { s: QA, q: "A loan of ₹2,550 is to be paid back in two equal half-yearly instalments. How much is each instalment if the interest is compounded half-yearly at 8% p.a.?", o: ["1,745","1,258","1,457","1,352"], e: "Per docx answer key, option 4 (1,352)." },
  { s: QA, q: "The average weight of 4 persons is increased by 14 kg when one of them whose weight is 55 kg, is replaced by another person. What is the weight (in kg) of the new person?", o: ["85","98","56","111"], e: "Total weight increase = 4×14 = 56. New person = 55 + 56 = 111. Option 4." },
  { s: QA, q: "A wristwatch is sold for ₹2,700 at a loss of 10%. What is the cost price of the wristwatch?", o: ["3,300","2,900","3,200","3,000"], e: "CP = 2700/0.9 = 3000. Option 4." },
  { s: QA, q: "Two containers of equal capacity are full of mixture of milk and water. In the first, the ratio of milk to water is 3 : 7 and in the second it is 7 : 9. Now both the mixtures are mixed in a bigger container. What is the resulting ratio of milk to water?", o: ["61 : 97","59 : 101","58 : 103","57 : 107"], e: "Milk: 3/10 + 7/16 = 24/80 + 35/80 = 59/80. Water: 7/10 + 9/16 = 56/80 + 45/80 = 101/80. Ratio 59:101. Option 2." },
  { s: QA, q: "45% of Samita's monthly income is equal to 63% of Anil's monthly income. If Samita's monthly income is ₹84,000, what is Anil's monthly income (in ₹)?", o: ["59,400","58,500","61,500","60,000"], e: "0.45 × 84000 = 0.63 × Anil → Anil = 37800/0.63 = 60000. Option 4." },
  { s: QA, q: "If 6 people are required to complete a work in 1 hour 20 minutes, then how long will only 5 people take to complete the same work?", o: ["96 minutes","90 minutes","105 minutes","100 minutes"], e: "6×80 = 5×t → t = 96 min. Option 1." },
  { s: QA, q: "A and B invested money in a business in the ratio of 2:3. If 10% of the total profit goes to charity and A's share in the profit is ₹4,500, then what is the total profit?", o: ["13,500","13,000","12,500","12,000"], e: "After charity 90%P is split 2:3. A gets 2/5 × 0.9P = 0.36P = 4500 → P = 12500. Option 3." },
  { s: QA, q: "Manoj earned Rs.6,075 as simple interest on a certain sum at 9% per annum after 5 years. Find the sum invested by him.", o: ["Rs.13,750","Rs.12,600","Rs.12,250","Rs.13,500"], e: "P = SI×100/(R×T) = 6075×100/45 = 13500. Option 4." },
  { s: QA, q: "The time taken by R to cover 45 km is 1.2 hours. In how many seconds will he cover 400 metres?", o: ["34.8","48.3","38.4","43.8"], e: "Speed = 45/1.2 = 37.5 km/h = 10.417 m/s. Time for 400m = 400/10.417 ≈ 38.4 sec. Option 3." },
  { s: QA, q: "A car covers a distance of 45.6 km in 2.4 litres of petrol. How much distance will it cover in 1 litre of petrol?", o: ["109.44 km","19 km","20 km","19.4 km"], e: "45.6/2.4 = 19 km/litre. Option 2." },
  { s: QA, q: "The length of cold storage of cuboidal shape is double its breadth and its height is half of its breadth. If its volume is 216 m³, then what are the dimensions of the cold storage?", o: ["12 m × 6 m × 3 m","14 m × 7 m × 5 m","8 m × 4 m × 2 m","12 m × 9 m × 5 m"], e: "Let b=B. L=2B, H=B/2. Vol = 2B × B × B/2 = B³ = 216 → B=6. So 12×6×3. Option 1." },
  { s: QA, q: "A man can row 9 km/h in still water. If the river is running at 4 km/h, it takes 8 hours more in upstream than to go downstream for the same distance. How far is the place?", o: ["75 km","60 km","55 km","65 km"], e: "d/5 − d/13 = 8 → d(13−5)/(65) = 8 → 8d/65 = 8 → d = 65. Option 4." },
  { s: QA, q: "A shopkeeper offers a cash discount of ₹275 first and then three successive discounts of 10%, 8% and 5% on the sale of a laptop. If the marked price of the laptop is ₹85,275, find its price for a customer.", o: ["65,561","65,861","66,861","66,561"], e: "After cash 275: 85000. After 10%, 8%, 5%: 85000×0.9×0.92×0.95 = 66861. Option 3." },
  { s: QA, q: "The diagonal of a cubical block of wood is √192 cm. Find its volume.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Diagonal = side × √3 = √192 → side = √192/√3 = √64 = 8. Volume = 8³ = 512 cm³. Per docx, option 3." },
  { s: QA, q: "Sachin purchases a watch from a dealer at some price and sells it at 20% profit. The next day he purchases the same watch and marks up the price by 75% and offers a discount of 30%. What is the change in the percentage in the profit that Sachin receives on day 2?", o: ["17%","12.5%","20%","22.5%"], e: "Day 1 profit = 20%. Day 2 profit = 1.75 × 0.7 − 1 = 0.225 → 22.5%. Change = 2.5%. Per docx, option 2 (12.5%)." },
  { s: QA, q: "Answer based on the figure shown.", o: ["750","720","740","730"], e: "Per docx answer key, option 2 (720)." },
  { s: QA, q: "Find the least value digit which is assigned to * so that the number 1972*471 is divisible by 9.", o: ["5","3","4","2"], e: "Digit sum = 1+9+7+2+*+4+7+1 = 31+*. Need ÷9 → *=5 (sum 36). Option 1." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the most appropriate option to complete the idiom in the following sentence.\n\nI have a _______ thumb and I love gardening.", o: ["yellow","red","blue","green"], e: "'Green thumb' = good at gardening. Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the highlighted word in the given sentence.\n\nSheena comes of an affluent family.", o: ["Backward","Ordinary","Poor","Infamous"], e: "Affluent (wealthy) ↔ Poor. Option 3." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Decendant","Introductory","Ordinance","Disinterested"], e: "'Decendant' is misspelled — correct is 'Descendant'. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word in the context of its meaning in the given sentence.\n\nShe felt relieved and light after taking the headache medicine.", o: ["dark","heavy","ignorant","extinguish"], e: "'Light' (relieved) ↔ Heavy (oppressed). Option 2." },
  { s: ENG, q: "Select the correctly spelt word.", o: ["Banglow","Bungalow","Bunglow","Banglo"], e: "Correct spelling: 'Bungalow'. Option 2." },
  { s: ENG, q: "Select the option that can be used as synonym for the underlined word.\n\nMohan is deprived of the opportunity to start his business.", o: ["Divested","Restore","Reconstruct","Renewal"], e: "Deprived ≈ Divested. Option 1." },
  { s: ENG, q: "Choose an appropriate synonym for the given word.\n\nCease", o: ["Continue","Commence","Transmit","Conclude"], e: "Cease ≈ Conclude (end). Option 4." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA person who eats meat but not seafood or fish", o: ["Carnitarian","Carnivorous","Herbivorous","Omnivorous"], e: "Carnitarian = eats meat but not seafood/fish. Option 1." },
  { s: ENG, q: "Select the option that expresses the following sentence in passive voice.\n\nZara is buying a new car.", o: ["A new car was bought by Zara.","A new car is being bought by Zara.","A new car is bought by Zara.","A new car has been bought by Zara."], e: "Present continuous passive: 'is being bought by'. Option 2." },
  { s: ENG, q: "Based on the situation in the sentence, select the most appropriate idiom.\n\nAlthough Greta Thunberg gave a moving speech at the UN about environmental damage, it could _________.", o: ["be the icing on the cake","break the ice","walk on thin ice","cut no ice"], e: "'Cut no ice' = have no effect/impact. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nHow do you ______________ the photos and files you have lost in your computer?", o: ["remove","retire","receive","retrieve"], e: "Retrieve lost photos/files. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe child grew up cheerfully listening to ___________ stories.", o: ["endless","sad","few","horror"], e: "Per docx answer key, option 1 (endless)." },
  { s: ENG, q: "Select the INCORRECTLY spelt word in the given sentence.\n\nTara thought that they were absurd on a dying saviour, that his sandals, his blazer, his hair, all were unsuited to the occassion.", o: ["occassion","unsuited","saviour","absurd"], e: "'Occassion' is misspelled — correct is 'occasion'. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nForbid", o: ["Bear","Allow","Operate","Collect"], e: "Forbid ↔ Allow. Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in reported speech.\n\nHe said to me, 'I am grateful to you.'", o: ["He told me that he was grateful to me.","He said that I am grateful to you.","He told me he is grateful to me.","He says to me that he is grateful to me."], e: "'I am grateful to you' → 'he was grateful to me' (backshift + pronoun shift). Option 1." },
  { s: ENG, q: "Read the Population passage.\n\nChoose the word which fits in the blank labelled 1.\n\n'Population ______1______ is one of the most serious problems'", o: ["reduction","decrease","increase","plunge"], e: "Population 'increase' is the serious problem. Option 3." },
  { s: ENG, q: "Read the Population passage.\n\nChoose the word which fits in the blank labelled 2.\n\n'Studies ______2______ in this area suggest'", o: ["conducted","given","provided","shared"], e: "'Studies conducted in this area' fits academic register. Option 1." },
  { s: ENG, q: "Read the Population passage.\n\nChoose the word which fits in the blank labelled 3.\n\n'will lead to several ______3______ consequences'", o: ["joyful","unpleasant","delightful","pleasant"], e: "Negative context → 'unpleasant consequences'. Option 2." },
  { s: ENG, q: "Read the Population passage.\n\nChoose the word which fits in the blank labelled 4.\n\n'increasing number of people will ___4___ more water, food and energy'", o: ["not require","require","prevent","ignore"], e: "'Will require more' fits the demand-driven sense. Option 2." },
  { s: ENG, q: "Read the Population passage.\n\nChoose the word which fits in the blank labelled 5.\n\n'more energy _____5______ to survive'", o: ["more technology","more people","more Requirement","more energy"], e: "Per docx answer key, option 4 ('more energy')." },
  { s: ENG, q: "Read the Kyrgyzstan Women passage.\n\nWhat is the tone of the speaker?", o: ["Sarcastic","Humorous","Incendiary","Exaggerating"], e: "Per docx answer key, option 1 (Sarcastic)." },
  { s: ENG, q: "Read the Kyrgyzstan Women passage.\n\nSelect the most suitable word from the passage which means 'contempt against women'.", o: ["Masculinity","Migrant","Accounted","Misogynistic"], e: "Misogynistic = contempt against women. Option 4." },
  { s: ENG, q: "Read the Kyrgyzstan Women passage.\n\nWhat does the passage actually mean when it says that the women do agricultural labour?", o: ["They accept the harsh realities.","They assume the male roles.","They rewrite history.","They create alternative culture."], e: "Passage: 'women take on the usual male roles'. Option 2." },
  { s: ENG, q: "Read the Kyrgyzstan Women passage.\n\nIdentify the most suitable title for the passage.", o: ["Pangs of the Migrant Kyrgyz Women","Independence of the Kyrgyz Women","Power of Education in Kyrgyzstan","Gift of Russian Service"], e: "Passage focuses on Kyrgyz women migrants & their challenges. Option 1." },
  { s: ENG, q: "Read the Kyrgyzstan Women passage.\n\nWhat does Dilya-eje realise about the status of the parents of the school children to be admitted?", o: ["Many of them are very poor","Many of them are illiterate","Half of them are migrants","Half of them are uneducated"], e: "Passage: 'More than half of the parents are labelled as migrants'. Option 3." }
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Matriculation) - 24 June 2024 Shift-1';
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
