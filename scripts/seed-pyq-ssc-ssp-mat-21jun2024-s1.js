/**
 * Seed: SSC Selection Post Phase XII 2024 (Matriculation Level) PYQ - 21 June 2024, Shift-1 (100 questions)
 * Source: SSC official docx — answer key decoded from inline green-tick image bullets.
 * Section order: REA → GA → QA → ENG.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-21jun2024-s1.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun21_2024_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-21jun2024-s1';

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

const F = '21-jun-2024-s1';

const IMAGE_MAP = {
  // REA
  10: { q: 'image4.jpeg', opts: ['image5.png','image6.png','image7.png','image8.png'] }, // figure series
  13: { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] }, // mirror image
  // QA
  52: { q: 'image14.jpeg', opts: ['','','',''] }, // QA Q2 figure, text opts (12/11/13/14 cm)
  58: { q: '', opts: ['image15.jpeg','image16.jpeg','image17.jpeg','image18.jpeg'] } // QA Q8 cube vol increase
};

// Answer key decoded from inline green-tick bullets in source docx
const KEY = [
  // REA (1-25)
  3, 4, 4, 1, 4,   1, 1, 3, 3, 3,   4, 2, 1, 2, 2,   2, 2, 2, 1, 2,   2, 4, 1, 3, 4,
  // GA (26-50)
  2, 1, 3, 1, 4,   1, 2, 2, 1, 4,   1, 1, 1, 3, 1,   4, 3, 3, 2, 3,   3, 1, 3, 4, 1,
  // QA (51-75)
  3, 3, 2, 4, 3,   4, 2, 2, 2, 2,   4, 1, 4, 2, 3,   4, 1, 1, 2, 2,   1, 2, 4, 3, 3,
  // ENG (76-100)
  1, 3, 3, 1, 4,   4, 2, 2, 2, 3,   3, 3, 3, 1, 1,   2, 4, 1, 4, 1,   1, 4, 3, 1, 3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "In a certain code language, 'MUTUAL' is written as 'OXVXCO' and 'REASON' is written as 'THCVQQ'. How will 'SERIES' be written in that language?", o: ["UHTKHU","VHTKHW","UHTLGV","VHTKGU"], e: "Per docx answer key, option 3 (UHTLGV)." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n13, ?, 25, 37, 53, 73", o: ["21","19","15","17"], e: "Differences +4,+8,+12,+16,+20 → 13+4=17. Option 4." },
  { s: REA, q: "What will come in the place of the question mark (?) in the following equation, if '+' and '×' are interchanged and '−' and '÷' are interchanged?\n\n(14 ÷ 2) − (16 × 4) + 12 = ?", o: ["25","16","32","20"], e: "After swap: (14−2)×(16÷4)+12... per docx, option 4 (20)." },
  { s: REA, q: "Which two numbers (not individual digits) should be interchanged to make the given equation correct?\n\n3 × 9 + 7 − 18 ÷ 4 + (72 ÷ 8) × 21 = 186", o: ["3 and 4","18 and 21","9 and 8","7 and 4"], e: "Per docx answer key, option 1 (3 and 4)." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed in the blanks below, will complete the letter-series.\n\nkr_om_kry_mt_ _yom_kryo_t", o: ["t k y r o m k","t y k o r m t","y t k r o t m","y t o k r t m"], e: "Per docx answer key, option 4 (y t o k r t m)." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nI. No fact is a truth.\nII. No truth is a detail.\nIII. Some details are points.\n\nConclusions:\nI. Some points are facts.\nII. No point is a truth.", o: ["Neither conclusion I nor II follows","Only conclusion II follows","Only conclusion I follows","Both conclusions I and II follow"], e: "Per docx answer key, option 1 (neither follows)." },
  { s: REA, q: "Which option represents the correct order of the given words as they would appear in an English dictionary?\n\n1. FEARED  2. FAIRER  3. FIRED  4. FERRIED  5. FARED", o: ["2, 5, 1, 4, 3","1, 2, 5, 3, 4","2, 1, 5, 3, 4","1, 3, 5, 4, 2"], e: "FAIRER(2), FARED(5), FEARED(1), FERRIED(4), FIRED(3) → 2,5,1,4,3. Option 1." },
  { s: REA, q: "In a certain code language, 'BREWING' is written as 'CIFDJMH' and 'ANCIENT' is written as 'BMDRFMU'. How will 'MUSEUMS' be written in that language?", o: ["HITUOPL","BADGGIU","NFTVVNT","MULCSPE"], e: "Per docx answer key, option 3 (NFTVVNT)." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. Country  2. City  3. Town  4. State  5. District", o: ["3, 5, 2, 4, 1","3, 2, 4, 5, 1","3, 2, 5, 4, 1","3, 2, 4, 1, 5"], e: "Smallest to largest: Town(3), City(2), District(5), State(4), Country(1) → 3,2,5,4,1. Option 3." },
  { s: REA, q: "Identify the figure given in the options which when put in place of ? will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3." },
  { s: REA, q: "Family-relation puzzle: A+B = mother, A×B = husband, A&B = wife, A−B = sister, A÷B = son.\n\nIf 'H ÷ D + C × B − A + X', then how is D related to X?", o: ["Mother's mother","Mother","Father","Father's mother"], e: "H son of D; D mother of C; C husband of B; B sister of A; A mother of X. So B is X's aunt; A is X's mother; D is grandmother of A's siblings — D is mother of B & C, A is sibling of B (sister of A means A's sister), so A and B siblings, but B is D's child. So D is A's mother → D is X's grandmother (Mother's mother) — but X is A's child. Per docx, option 4 (Father's mother)." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nIQAF, JRBG, KSCH, ?, MUEJ", o: ["MTDI","LTDI","KTDI","LTCJ"], e: "Each letter +1 step. IQAF→JRBG→KSCH→LTDI→MUEJ. Option 2." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: REA, q: "Select the option that is related to the fifth number in the same way as the fourth number is related to the third number and the second number is related to the first number.\n\n27 : 9 :: 125 : 25 :: 64 : ?", o: ["13","16","21","23"], e: "Pattern: n^(2/3)? 27=3³ → 9=3²; 125=5³ → 25=5²; 64=4³ → 16=4². Option 2." },
  { s: REA, q: "In a certain code language, 'CONTEXT' is written as 'DNOSFWU' and 'OUTLOOK' is written as 'PTUKPNL'. How will 'CLIMATE' be written in that language?", o: ["EKJLCSE","DKJLBSF","EKJLCSG","DKKLCSF"], e: "Per docx answer key, option 2 (DKJLBSF)." },
  { s: REA, q: "Family-relation puzzle: R+T = sister, R×T = father, R*T = wife, R÷T = mother.\n\nHow is L related to S if 'K × L × P * Q × R + S * T'?", o: ["Sister","Mother's mother","Wife","Mother"], e: "Per docx answer key, option 2 (Mother's mother)." },
  { s: REA, q: "Which of the following terms will replace the question mark (?) in the given series?\n\nJPNH, IRMI, HTLJ, GVKK, ?", o: ["EZJN","FXJL","EXJN","FZJP"], e: "1st letter −1 (J,I,H,G,F); 2nd letter +2 (P,R,T,V,X); 3rd letter −1 (N,M,L,K,J); 4th letter +1 (H,I,J,K,L). FXJL. Option 2." },
  { s: REA, q: "In a certain code language, 'CUP' is coded as '45' and 'FIT' is coded as '50'. How will 'FUN' be coded in that language?", o: ["40","44","48","55"], e: "Sum × something. C(3)+U(21)+P(16)=40, code 45 (+5). F(6)+I(9)+T(20)=35, code 50 (+15). FUN = 6+21+14=41+? Per docx, option 2 (44)." },
  { s: REA, q: "In a certain code, TAPE is coded as WDSH and SACK is coded as VDFN. What is the code for MANY?", o: ["PDQB","PDBQ","BDQP","BQDP"], e: "Each letter +3 (Caesar shift). MANY → PDQB. Option 1." },
  { s: REA, q: "If ROW is coded as 3 and LAND is coded as 4, FRIGHTENED will be coded as ________.", o: ["15","10","25","20"], e: "Code = number of letters. ROW=3, LAND=4. FRIGHTENED=10 letters → code 10. Option 2." },
  { s: REA, q: "Letter-cluster analogy.\n\nPOWER : QOYEU :: FIRST : GITSW :: BEING : ?", o: ["DFKNK","CEKNJ","CEJNK","CFJNK"], e: "Per docx answer key, option 2 (CEKNJ)." },
  { s: REA, q: "In a code language, 'football and cricket' is written as 'aa dd ee', 'cricket is game' is written as 'ee rr ss', and 'football or cricket' is written as 'dd bb ee'. What is the code for the word 'or' in that language?", o: ["dd","ee","ss","bb"], e: "Common 'cricket' = ee. 'football' = dd. New word in 3rd = bb for 'or'. Option 4." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the following blanks, will complete the letter-series.\n\nP__S H _B K _H PB _S _PB __H", o: ["BKPSKHKS","BKPSKSKS","KSBKPHKS","KBSKPHKS"], e: "Per docx answer key, option 1 (BKPSKHKS)." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nShirt : Trouser :: Shoes : ?", o: ["Leather","Sandal","Socks","Polish"], e: "Shirt and Trouser are worn together (upper+lower); Shoes and Socks are worn together (footwear pair). Option 3." },
  { s: REA, q: "Two statements followed by two conclusions.\n\nStatements:\n1) All bottles are doors.\n2) All doors are pens.\n\nConclusions:\nI. All doors are bottles.\nII. All pens are doors.", o: ["Only conclusion I follows","Only conclusion II follows","Both conclusions I and II follow","Neither conclusion I nor conclusion II follows"], e: "Universal 'All A are B' doesn't imply 'All B are A'. Neither follows. Option 4." },

  // ============ GA (26-50) ============
  { s: GA, q: "Article 171 deals with ________.", o: ["qualifications of the Chief Minister of a State","composition of the Legislative Councils","qualifications of the Governor of a State","composition of the Legislative Assembly"], e: "Article 171 defines composition of the State Legislative Councils. Option 2." },
  { s: GA, q: "Which of the following movement is known as first Satyagraha led by Mahatma Gandhi?", o: ["Champaran movement","Ahmedabad movement","Kheda movement","Quit India Movement"], e: "Champaran Satyagraha (1917) was Gandhi's first Satyagraha in India. Option 1." },
  { s: GA, q: "In which of the following sports/games is the term 'checkmate' used?", o: ["Volleyball","Handball","Chess","Polo"], e: "'Checkmate' is the winning move in Chess. Option 3." },
  { s: GA, q: "On which of the following component of chloroplast is chlorophyll arranged?", o: ["Thylakoids","Stroma","Cell Membrane","Matrix"], e: "Chlorophyll is in the thylakoid membranes of chloroplasts. Option 1." },
  { s: GA, q: "Who is the author of the poetry 'Chand Pukhraj Ka'?", o: ["Shailendra","Anand Bakshi","Gurmel Singh","Gulzar"], e: "'Chand Pukhraj Ka' is by Gulzar (Sampooran Singh Kalra). Option 4." },
  { s: GA, q: "Ibn Battuta, who visited India during Delhi Sultanate, originally belonged to which country?", o: ["Morocco","Russia","Egypt","England"], e: "Ibn Battuta was a Moroccan traveller (14th century). Option 1." },
  { s: GA, q: "Who called the preamble of the Indian Constitution 'The Political Horoscope of our Constitution'?", o: ["Sir Alladi Krishnaswamy Iyer","Dr. K M Munshi","Sir Ernest Baker","M. Hidayatullah"], e: "K M Munshi called the Preamble 'the political horoscope of our Constitution'. Option 2." },
  { s: GA, q: "A primitive form of cultivation called Bewar is practised in which state?", o: ["Andhra Pradesh","Madhya Pradesh","Mizoram","Odisha"], e: "Bewar is a slash-and-burn shifting cultivation practised in Madhya Pradesh. Option 2." },
  { s: GA, q: "Which Olympian authored the book titled 'A Shot at History: My Obsessive Journey to Olympic Gold'?", o: ["Abhinav Bindra","PV Sindhu","Leander Paes","Mary Kom"], e: "Abhinav Bindra wrote 'A Shot at History' (2011). Option 1." },
  { s: GA, q: "The festival of Ram Navami is celebrated in which of the following Hindu months?", o: ["Kartik","Falgun","Magh","Chaitra"], e: "Ram Navami falls on the 9th day of bright fortnight of Chaitra. Option 4." },
  { s: GA, q: "Which neighbouring country has assumed the chairmanship of the Indian Ocean Rim Association (IORA) from November 2021 to November 2023?", o: ["Bangladesh","Afghanistan","Myanmar","China"], e: "Bangladesh held IORA chairmanship Nov 2021–Nov 2023. Option 1." },
  { s: GA, q: "Who was appointed as the chairman of the Insurance Regulatory and Development Authority of India (IRDAI) in March 2022?", o: ["Debasish Panda","Supratim Bandyopadhyay","Rajesh Bhushan","JB Mohapatra"], e: "Debasish Panda was appointed IRDAI Chairman in March 2022. Option 1." },
  { s: GA, q: "Henry Louis Vivian Derozio, a teacher at Hindu College, Calcutta, in the 1820s, promoted radical ideas. His followers were called the ______.", o: ["Young Bengal Movement","Young Radical Movement","Young Men's Movement","Young Christian Movement"], e: "Derozio's students formed the 'Young Bengal' movement. Option 1." },
  { s: GA, q: "The Constitution of India was adopted on 26th November in ________.", o: ["1950","1947","1949","1948"], e: "The Constitution was adopted on 26 Nov 1949 and came into force on 26 Jan 1950. Option 3." },
  { s: GA, q: "Which crops are benefitted from the temperate cyclones arising from the Mediterranean Sea that cause rainfall in Punjab?", o: ["Rabi crops","Kharif crops","Zaid crops","Cash crops"], e: "Winter (western disturbance) rainfall benefits Rabi crops in Punjab. Option 1." },
  { s: GA, q: "The All India MCC Murugappa Gold Cup Tournament in Chennai is held for which sport?", o: ["Football","Basketball","Handball","Hockey"], e: "MCC Murugappa Gold Cup is a Hockey tournament. Option 4." },
  { s: GA, q: "Which of the following statements are true regarding the Central Universities (Amendment) Bill, 2022?\n1. Introduced in Lok Sabha on 1 August 2022.\n2. Amends the Central Universities Act, 2019.\n3. Converts National Rail & Transportation Institute, Vadodara into Gati Shakti Vishwavidyalaya.\n4. Establishment of the Vishwavidyalaya will address need of trained talent in the transportation sector.", o: ["1, 2 and 3","2, 3 and 4","1, 3 and 4","1, 2 and 4"], e: "Per docx key, option 3 (1, 3 and 4 — Bill amends 2009 Act, not 2019, so #2 is false)." },
  { s: GA, q: "At which place is Harappan Dockyard found?", o: ["Amri","Banawali","Lothal","Surkotada"], e: "The Harappan dockyard is at Lothal (Gujarat). Option 3." },
  { s: GA, q: "In which state is the Sambhar Salt Lake located?", o: ["West Bengal","Rajasthan","Maharashtra","Odisha"], e: "Sambhar Lake (India's largest inland salt lake) is in Rajasthan. Option 2." },
  { s: GA, q: "'Lai Haraoba' is the earliest form of dance of which of the following classical dance forms of India?", o: ["Kuchipudi","Kathakali","Manipuri","Mohiniattam"], e: "Lai Haraoba is the proto-form of Manipuri dance. Option 3." },
  { s: GA, q: "Bhabru-Bairat rock edicts mainly depicting Ashoka's conversion to Buddhism is found in _______.", o: ["Uttar Pradesh","Odisha","Rajasthan","Bihar"], e: "Bhabru-Bairat edicts are at Bairat, Rajasthan. Option 3." },
  { s: GA, q: "Which chromosome is involved in the production of 'masked' mRNAs for early development?", o: ["Lampbrush chromosome","Sex chromosome","Polytene chromosome","Autosomal chromosome"], e: "Lampbrush chromosomes (in amphibian oocytes) produce masked mRNAs for early development. Option 1." },
  { s: GA, q: "The main worker is a person who works for at least ________ days in a year.", o: ["115","145","183","167"], e: "Per Census definition, 'main worker' = 183 days/year or more. Option 3." },
  { s: GA, q: "Which is the weakest intermolecular force, considered as the Van der Waals force, often found in halogens, noble gases and other non-polar molecules?", o: ["Dipole–induced dipole forces","Ion-dipole forces","Dipole–dipole forces","London dispersion forces"], e: "London dispersion (instantaneous induced-dipole) forces are weakest van der Waals forces. Option 4." },
  { s: GA, q: "As of December 2021, NPS and APY are the two flagship pension schemes of _________.", o: ["PFRDA","IIFCL","NABARD","PFC"], e: "PFRDA (Pension Fund Regulatory and Development Authority) administers NPS and APY. Option 1." },

  // ============ QA (51-75) ============
  { s: QA, q: "The percentage profit earned by selling an article for Rs.2,100 is equal to the percentage loss incurred by selling the same article for Rs.1,460. At what price should the article be sold to make 20% profit?", o: ["Rs.2,056","Rs.2,156","Rs.2,136","Rs.2,256"], e: "CP = (2100+1460)/2 = 1780. SP at 20% = 1780×1.2 = 2136. Option 3." },
  { s: QA, q: "Answer based on the figure shown.", o: ["12 cm","11 cm","13 cm","14 cm"], e: "Per docx answer key, option 3 (13 cm)." },
  { s: QA, q: "At a fitness club, 70% of the members are men and 30% of the members are women. If the average age of the men is 30 years and that of the women is 40 years, then what is the average age of all the members?", o: ["30 years","33 years","35 years","38 years"], e: "Avg = 0.7×30 + 0.3×40 = 21 + 12 = 33 years. Option 2." },
  { s: QA, q: "The monthly salaries of A and B together amount to ₹45,000. A spends 75% of his salary and B spends 80% of his salary. If now their savings are the same, then the salary of B (in ₹) is:", o: ["20,000","30,000","15,000","25,000"], e: "Let A = a, B = 45000−a. Savings: 0.25a = 0.20(45000−a) → 0.45a = 9000 → a = 20000; B = 25000. Option 4." },
  { s: QA, q: "Find the average of the first 18 multiples of 9.", o: ["88.5","84.6","85.5","82.3"], e: "Sum = 9(1+2+...+18) = 9×171 = 1539. Avg = 1539/18 = 85.5. Option 3." },
  { s: QA, q: "Mr Gogia invested an amount of ₹13,900 divided into two different schemes A and B at the simple interest rate of 14% p.a. and 11% p.a., respectively. If the total amount of simple interest earned in 2 years is ₹3,508, what was the amount invested in scheme B?", o: ["6,500","7,200","7,500","6,400"], e: "Let B = b. 2(0.14(13900−b)+0.11b) = 3508 → 0.28(13900−b)+0.22b = 3508 → 3892 −0.28b + 0.22b = 3508 → −0.06b = −384 → b = 6400. Option 4." },
  { s: QA, q: "On a deposit of ₹1,50,000, R gets ₹2,000 as interest on simple rate of interest in a year. How much amount (in ₹) should he deposit to get interest of ₹4,500?", o: ["2,77,500","3,37,500","4,25,500","3,77,500"], e: "Rate fixed. P/I ratio = 150000/2000 = 75. For interest 4500 → P = 4500×75 = 337500. Option 2." },
  { s: QA, q: "A cube is having surface area of 5400 square units. Its volume would increase approximately ______ if the side is increased by 5 units.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Side = √(5400/6) = 30. New side = 35. Volume increase = 35³ − 30³ = 42875 − 27000 = 15875 units³. Per docx, option 2." },
  { s: QA, q: "A shopkeeper marks the price of his goods at 20% higher than the cost price and allows a discount of 10%. What is his profit percentage?", o: ["10%","8%","4%","6%"], e: "SP = 1.20 × 0.90 = 1.08 CP → 8% profit. Option 2." },
  { s: QA, q: "In an election between two candidates, 10% of the voters did not cast their vote and 5% of the votes polled were found invalid. The successful candidate got 55% of the valid votes and won by a majority of 1,710 votes. The number of voters enrolled on the voters list was:", o: ["21,000","20,000","19,000","18,000"], e: "Polled = 0.9V; valid = 0.9 × 0.95 V = 0.855V. Winner 55%, loser 45%. Margin = 10% of valid = 0.0855V = 1710 → V = 20000. Option 2." },
  { s: QA, q: "The price of a bike is first increased by 21% and later on, it is decreased by 34% due to reduction in sales. Find the net percentage change in the final price of the bike.", o: ["Decrease of 13.25%","Increase of 13.25%","Increase of 20.14%","Decrease of 20.14%"], e: "Net = 1.21 × 0.66 = 0.7986 → 20.14% decrease. Option 4." },
  { s: QA, q: "Two trains, A and B started travelling towards each other at the same time, from places P to Q and Q to P, respectively. After crossing each other, A and B took 9 hours and 16 hours to reach Q and P, respectively. If the speed of A was 56 km/h, then what was the speed (in km/h) of B?", o: ["42","38","40","46"], e: "Sa/Sb = √(t_b/t_a) = √(16/9) = 4/3. So Sb = 56 × 3/4 = 42 km/h. Option 1." },
  { s: QA, q: "The height of one cone is 3 times the height of another cone, while its radius is half of the radius of other cone. If their total volume is 100 unit³, then the difference in the volumes of the cones is ______ unit³.", o: ["13.4","15.5","12.5","14.3"], e: "Cone1: r/2, 3h → V1 ∝ (r/2)²(3h) = (3/4)r²h. Cone2: r,h → V2 ∝ r²h. Ratio V1:V2 = 3:4. Total = 7 parts = 100 → V1 = 300/7 ≈ 42.86, V2 = 400/7 ≈ 57.14. Diff ≈ 14.3. Option 4." },
  { s: QA, q: "A recipe is made using cheese and butter in the ratio 4 : 3. If Arohi uses 8 bowls of cheese, how many bowls of butter should she use?", o: ["8","6","3","4"], e: "8 × 3/4 = 6 bowls of butter. Option 2." },
  { s: QA, q: "By selling a mobile phone for ₹23,856, Ramesh gains 20%. If he sells it for ₹20,580, find his gain or loss percentage (correct to two places of decimals).", o: ["Gain 5.32%","Loss 5.32%","Gain 3.52%","Loss 3.52%"], e: "CP = 23856/1.2 = 19880. SP 20580 → gain 700 → 700/19880 × 100 ≈ 3.52%. Option 3." },
  { s: QA, q: "Which of the following numbers is divisible by 11?", o: ["88,65,987","45,12,458","55,78,961","88,65,747"], e: "88,65,747: alt sum (8+6+7+7) − (8+5+4+?) = 28 − 17 = 11 ✓ div by 11. Option 4." },
  { s: QA, q: "To clear a stock of items, a seller gives an 8% discount on the marked price. He spends ₹x on the promotion of the discount offer. His total cost of the items is ₹2,50,000 and the marked price is 10% more than the cost price. Finally, he earns no profit or no loss. What is the value of x?", o: ["3000","6000","4500","7500"], e: "MP = 1.10 × 250000 = 275000. SP after 8% discount = 0.92 × 275000 = 253000. He bears total cost 250000+x = 253000 → x = 3000. Option 1." },
  { s: QA, q: "The ratio of the salaries of S to F is 2 : 3 and the ratio of their savings is 3 : 4. What is the ratio of their expenditures if their total savings are equal to the salary of S?", o: ["8 : 13","7 : 15","7 : 12","8 : 15"], e: "Salaries 2x:3x. Total savings = 2x = sal(S). So savings = (3k:4k) totaling 7k = 2x → k = 2x/7. S savings = 6x/7, exp = 2x − 6x/7 = 8x/7. F savings = 8x/7, exp = 3x − 8x/7 = 13x/7. Ratio 8:13. Option 1." },
  { s: QA, q: "A dealer sells an article at a discount of 5% on the marked price. If the marked price is 20% above the cost price and the article was sold for ₹2,280, then the cost price would be:", o: ["2,500","2,000","3,500","3,000"], e: "MP = 2280/0.95 = 2400. CP = 2400/1.20 = 2000. Option 2." },
  { s: QA, q: "A drives for 2 hours, 2.5 hours, 3 hours, 2 hours and 2.5 hours in five days of a week, respectively. His speeds on these days are 45 km/h, 50 km/h, 60 km/h, 70 km/h and 80 km/h, respectively. What is his average speed for the week?", o: ["60.8 km/h","61.25 km/h","68.02 km/h","64.08 km/h"], e: "Total dist = 90+125+180+140+200 = 735 km. Total time = 12 h. Avg = 735/12 = 61.25. Option 2." },
  { s: QA, q: "If the number 3727 x 4 is completely divisible by 8, then the smallest integer in place of x will be:", o: ["0","6","8","2"], e: "Last 3 digits 'x 0 4' must be ÷8. Try x=0: 004 — wait actually need 'X04' or '0X04'? Per docx, option 1 (0)." },
  { s: QA, q: "In a 200-m race, if A gives B a head start of 35 m, then A wins the race by 20 sec. Alternatively, if A gives B a head start of 55 m, the race ends in a dead heat. How long does A take to run 200 m?", o: ["165 sec","145 sec","150 sec","155 sec"], e: "Per docx answer key, option 2 (145 sec)." },
  { s: QA, q: "In a 3000 m race, if vehicle A gives vehicle B a start of 400 m, then vehicle A wins the race by 10 s. If vehicle A gives vehicle B a start of 750 m, then the race ends in a dead heat. How long does vehicle A take to run 3000 m?", o: ["100 s","90.5 s","92.5 s","64.3 s"], e: "Per docx answer key, option 4 (64.3 s)." },
  { s: QA, q: "A borrows ₹20,000 from B and C. B lends him a certain sum of money at 25% simple interest per annum, while C lends him the remaining sum of money at 21% simple interest per annum. The total interest paid by A in one year is ₹4,500. The sum (in ₹) borrowed from B is:", o: ["9,000","12,500","7,500","6,000"], e: "Let B's sum = x. 0.25x + 0.21(20000−x) = 4500 → 0.04x + 4200 = 4500 → 0.04x = 300 → x = 7500. Option 3." },
  { s: QA, q: "If 108 workers can build a wall in 36 days, then in how many days can 48 workers build the same wall?", o: ["54","72","81","63"], e: "108 × 36 = 48 × d → d = 3888/48 = 81. Option 3." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nSeclusion", o: ["Solitude","Readiness","Involvement","Tactics"], e: "Seclusion ≈ Solitude. Option 1." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Appropriate","Connoisseur","Haphaazard","Diffusion"], e: "'Haphaazard' is misspelled — correct is 'Haphazard'. Option 3." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Unreasonable","Despondent","Complimentery","Impertinent"], e: "'Complimentery' is misspelled — correct is 'Complimentary'. Option 3." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nTo move into or through something", o: ["Penetrate","Cross","Perpetuate","Transparent"], e: "Penetrate = move into/through. Option 1." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nRenewable energy is energy that is environment-friendly because it is ______ from renewable resources, that are naturally replenished.", o: ["found","construed","deduced","derived"], e: "Energy is 'derived from' renewable resources. Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nTroublesome", o: ["Planless","Soulful","Curious","Obedient"], e: "Troublesome ↔ Obedient. Option 4." },
  { s: ENG, q: "Select the option that expresses the following sentence in passive voice.\n\nThe insect bit the little baby.", o: ["The little baby has bitten by the insect.","The little baby was bitten by the insect.","The little baby had bitten by the insect.","The little baby is bitten by the insect."], e: "Past simple active 'bit' → past passive 'was bitten'. Option 2." },
  { s: ENG, q: "Select the sentence that uses the given idiom correctly.\n\nEat like a bird", o: ["Nobody can eat with Jerry at the same table as he is so messy.","Pinky is on a diet so she is too picky about the food she eats.","The colonial powers colonised small countries by exploiting them and stealing their resources.","Overeating is the most obvious reason for gaining weight quickly."], e: "'Eat like a bird' = eat very little. Pinky's diet/picky-eating fits. Option 2." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nFrisky", o: ["Loose","Playful","Transient","Memorable"], e: "Frisky ≈ Playful. Option 2." },
  { s: ENG, q: "Select the word which is INCORRECTLY spelt in the given sentence.\n\nThe opertunity cost of going with parents back to the village made Naman upset for almost the entire month.", o: ["parents","village","opertunity","almost"], e: "'Opertunity' should be 'opportunity'. Option 3." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nAll Greek to me", o: ["Something that is fancy and classy","Something that is harmful to all","Something that is not understandable","Something that is ancient and classic"], e: "'All Greek to me' = incomprehensible. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nBold", o: ["Valiant","Gallant","Timid","Heroic"], e: "Bold ↔ Timid. Option 3." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe reasons or intentions that cause a particular set of beliefs or actions", o: ["Thinkable","Motive","Rationale","Practical"], e: "'Rationale' = the reasoning behind beliefs/actions. Option 3." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nFelicity", o: ["Happiness","Fellow being","Function","Anguish"], e: "Felicity = great happiness. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\n'I have been to Australia,' Amritha told me.", o: ["Amritha told me that she had been to Australia.","Amritha told me that she had being to Australia.","Amritha told me that she has be to Australia.","Amritha tell me that she has being to Australia."], e: "Direct present perfect → indirect past perfect: 'had been'. Option 1." },
  { s: ENG, q: "Read the Internet passage.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'The internet has (1)__________ reshaped the way information is accessed'", o: ["discreetly","significantly","occasionally","gradually"], e: "'Significantly reshaped' fits the context of major transformation. Option 2." },
  { s: ENG, q: "Read the Internet passage.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'individuals can (2)__________ connect with others globally'", o: ["scarcely","hesitantly","periodically","seamlessly"], e: "'Seamlessly connect' is the natural collocation. Option 4." },
  { s: ENG, q: "Read the Internet passage.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'However, this digital age also brings (3)__________ challenges'", o: ["numerous","abstract","irrelevant","intriguing"], e: "'Numerous challenges' fits. Option 1." },
  { s: ENG, q: "Read the Internet passage.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'The spread of misinformation has become a (4)__________ issue'", o: ["negligible","soothing","dormant","pressing"], e: "'A pressing issue' fits the urgency. Option 4." },
  { s: ENG, q: "Read the Internet passage.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'It is essential for users to (5)__________ assess the credibility of sources'", o: ["meticulously","reluctantly","impulsively","hesitantly"], e: "'Meticulously assess' fits careful evaluation. Option 1." },
  { s: ENG, q: "Read the Earth Day passage.\n\nWho are the engineers NOT mentioned in the passage?", o: ["Eggs","Fungi","Birds","Insects"], e: "Passage lists birds, animals, insects, fungi — NOT eggs. Option 1." },
  { s: ENG, q: "Read the Earth Day passage.\n\nSelect the most appropriate title for the given passage.", o: ["Animals and Birds","Earth and Nature","Nature and Animals","Earth and its Dangers"], e: "Passage focuses on threats to Earth: 'Earth and its Dangers'. Option 4." },
  { s: ENG, q: "Read the Earth Day passage.\n\nSelect the tone of the passage.", o: ["Narrative","Entertaining","Cautionary","Persuasive"], e: "Passage warns about Earth's deterioration — Cautionary tone. Option 3." },
  { s: ENG, q: "Read the Earth Day passage.\n\nWho caused the loss of forests?", o: ["People","Realtors","Animals","Nature"], e: "Passage: 'Earth has now lost one-third of its forests through human activity'. Option 1." },
  { s: ENG, q: "Read the Earth Day passage.\n\nSelect the most appropriate ANTONYM of the word 'decline'.", o: ["Drag","Push","Increase","Decrease"], e: "Decline ↔ Increase. Option 3." }
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Matriculation) - 21 June 2024 Shift-1';
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
