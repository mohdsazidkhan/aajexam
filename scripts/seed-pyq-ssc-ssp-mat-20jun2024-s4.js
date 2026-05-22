/**
 * Seed: SSC Selection Post Phase XII 2024 (Matriculation Level) PYQ - 20 June 2024, Shift-4 (100 questions)
 * Source: SSC official docx — answer key decoded from inline green-tick image bullets.
 * Note: In this docx the tick/empty rIds are swapped (tick=rId5, empty=rId6); auto-detected by parser.
 * Section order: REA → GA → QA → ENG.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-20jun2024-s4.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun20_2024_s4";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-20jun2024-s4';

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

const F = '20-jun-2024-s4';

const IMAGE_MAP = {
  // REA
  9:  { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] }, // mirror image
  14: { q: 'image9.jpeg', opts: ['image10.png','image11.png','image12.png','image13.png'] }, // figure series

  // QA (overall 51-75)
  55: { q: '', opts: ['image14.jpeg','image15.jpeg','image16.jpeg','image17.jpeg'] }, // QA Q5 cylinder
  64: { q: 'image18.jpeg', opts: ['image19.jpeg','image20.jpeg','image21.jpeg','image22.jpeg'] } // QA Q14
};

// Answer key decoded from inline green-tick bullets (tick=rId5, empty=rId6 in this docx)
const KEY = [
  // REA (1-25)
  1, 3, 4, 2, 3,   1, 2, 2, 3, 2,   4, 4, 3, 4, 1,   2, 2, 2, 4, 3,   1, 2, 1, 3, 3,
  // GA (26-50)
  3, 2, 1, 4, 3,   4, 1, 1, 1, 4,   4, 3, 3, 1, 3,   2, 1, 1, 1, 3,   4, 3, 3, 1, 1,
  // QA (51-75)
  4, 4, 3, 2, 4,   2, 2, 1, 2, 3,   2, 4, 4, 1, 3,   4, 1, 3, 4, 1,   1, 4, 1, 4, 1,
  // ENG (76-100)
  4, 4, 1, 4, 1,   4, 4, 3, 3, 1,   4, 2, 3, 3, 3,   3, 1, 3, 4, 4,   1, 2, 1, 2, 2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Which of the following terms will replace the question mark (?) in the given series?\n\nSOWJ, QPUK, OQSL, ?, KSON", o: ["MRQM","NQQL","NRPM","MSQN"], e: "1st letter −2 (S,Q,O,M,K); 2nd letter +1 (O,P,Q,R,S); 3rd letter −2 (W,U,S,Q,O); 4th letter +1 (J,K,L,M,N). MRQM. Option 1." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nCar : Garage :: Clothes : ?", o: ["Dress","Bus","Wardrobe","Iron"], e: "A car is kept in a garage; clothes are kept in a wardrobe. Option 3." },
  { s: REA, q: "Select the option that is related to the fifth number in the same way as the fourth number is related to the third number and the second number is related to the first number.\n\n16 : 36 :: 64 : 100 :: 25 : ?", o: ["61","47","45","49"], e: "Pattern: n + (next perfect square step). 16=4², 36=6²; 64=8², 100=10²; 25=5², so ?=7²=49. Option 4." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks, will complete the letter series.\n\n_ R _ _AR _ O _ _ G O A_ G O", o: ["A A G O G R R","A G O G A R R","A G G O A R R","A G O G R A A"], e: "Per docx answer key, option 2 (A G O G A R R)." },
  { s: REA, q: "Three statements followed by four conclusions.\n\nStatements:\nSome cars are bikes. All bikes are trucks. Some trucks are buses.\n\nConclusions:\nI. Some trucks are cars.\nII. All buses are cars.\nIII. Some cars are buses.\nIV. All bikes are buses.", o: ["Only conclusions I, II and IV follow","Only conclusions I and IV follow","Only conclusion I follows","Only conclusions II and III follow"], e: "Some cars are bikes ⊆ trucks → some trucks are cars (I ✓). II, III, IV not certain. Option 3." },
  { s: REA, q: "Which two numbers (not individual digits) should be interchanged to make the given equation correct?\n\n[(39 ÷ 3) − 6] + 11 × 2 ÷ 4 × 5 = 13", o: ["3 and 6","2 and 5","2 and 6","11 and 4"], e: "Per docx answer key, option 1 (3 and 6)." },
  { s: REA, q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster.\n\nROYAL : ALZRO :: ABOUT : UTPAB :: POLES : ?", o: ["FSNPR","ESMPO","ESNPQ","FRMQN"], e: "Per docx answer key, option 2 (ESMPO)." },
  { s: REA, q: "In a certain code language, 'ABROAD' is written as 'SCBFCQ' and 'ACCEPT' is written as 'DDBVRG'. How will 'ACTION' be written in that language?", o: ["TCANOI","UDBPQK","TCAPQK","VECPQK"], e: "Per docx answer key, option 2 (UDBPQK)." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at line MN as shown below.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3." },
  { s: REA, q: "In a code language, 'government help people' is written as 'abc pqr mno', 'people live happily' is written as 'efg xyz pqr', and 'people choose government' is written as 'abc pqr ijk'. What is the code for the word 'choose' in that language?", o: ["pqr","ijk","abc","xyz"], e: "Common 'people' = pqr; 'government' appears in 1st & 3rd → abc; remaining new word in 3rd = ijk for 'choose'. Option 2." },
  { s: REA, q: "What will come in place of the question mark (?) in the following equation if '+' and '×' are interchanged and '−' and '÷' are interchanged?\n\n16 − 4 + 7 × 8 ÷ 1 = ?", o: ["47","15","23","35"], e: "After swap: 16 ÷ 4 × 7 + 8 − 1 = 4×7 + 7 = 28+7 = 35. Option 4." },
  { s: REA, q: "In a certain code language, CAT is written as 24 and LATE is written as 38. How will DOLL be written in the same language?", o: ["40","39","47","43"], e: "Per docx answer key, option 4 (43)." },
  { s: REA, q: "Select the letter-cluster from among the given options that can replace the question mark (?) in the following series.\n\nAGMZ, CEOX, ECQV, ?", o: ["GDSX","GBTS","GAST","GCSW"], e: "Per docx answer key, option 3 (GAST)." },
  { s: REA, q: "Identify the option figure that can replace the question mark (?) in the following series to logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: REA, q: "In a certain code language, 'SEQUINS' is written as 'HVJFKPU' and 'REACTED' is written as 'IVZXVGF'. How will 'PROCESS' be written in that language?", o: ["KILXGUU","BDIUNMO","LOPKFGH","TRUIWDM"], e: "Per docx answer key, option 1 (KILXGUU)." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nIBDA, MFHE, QJLI, ?, YRTQ", o: ["UNTM","UNPM","VNPM","QNPQ"], e: "1st letter +4 (I,M,Q,U,Y); 2nd letter +4 (B,F,J,N,R); 3rd letter +4 (D,H,L,P,T); 4th letter +4 (A,E,I,M,Q). UNPM. Option 2." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. Rain  2. Sea  3. Evaporation  4. Clouds", o: ["1, 2, 3, 4","2, 3, 4, 1","1, 2, 4, 3","3, 4, 1, 2"], e: "Water cycle: Sea(2) → Evaporation(3) → Clouds(4) → Rain(1) → 2,3,4,1. Option 2." },
  { s: REA, q: "In a certain code language, 'FLUTE' is written as 'VGFOU' and 'EXILE' is written as 'VORCV'. How will 'BLOOD' be written in that language?", o: ["WLOXY","WLLOY","WLLDB","WLLOB"], e: "Per docx answer key, option 2 (WLLOY)." },
  { s: REA, q: "In a certain code language, 'WHITE' is written as 'FSJGX' and 'COLOR' is written as 'SNMND'. How will 'SHIRT' be written in that language?", o: ["UQJIT","UPJGT","TGJQU","UQJGT"], e: "Per docx answer key, option 4 (UQJGT)." },
  { s: REA, q: "According to the series given below, fill in the blank with a suitable letter that would satisfy the series.\n\nZ, B, D, F, H, ________", o: ["N","K","J","I"], e: "Series: Z then B, D, F, H, ... +2 each → J. Option 3." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n5, 3, 20, 9, 80, 27, 320, ?", o: ["81","100","89","90"], e: "Alternate: 5,20,80,320 (×4); 3,9,27,? (×3) → 81. Option 1." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Discover  2. Disperse  3. Disjointed  4. Discard  5. Disposable  6. Discriminate", o: ["4, 1, 6, 2, 3, 5","4, 1, 6, 3, 2, 5","4, 6, 1, 3, 2, 5","4, 1, 6, 5, 3, 2"], e: "Discard(4), Discover(1), Discriminate(6), Disjointed(3), Disperse(2), Disposable(5) → 4,1,6,3,2,5. Option 2." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nI. Some clay are soils.\nII. Some soil are mud.\nIII. Some mud are dust.\n\nConclusions:\nI. Some clay are dust.\nII. All dust are soil.", o: ["Neither conclusion I nor II follows","Only conclusion I follows","Only conclusion II follows","Both conclusions I and II follow"], e: "Chained 'some' statements don't yield certainty; neither I nor II follows. Option 1." },
  { s: REA, q: "Family-relation puzzle: A+B = mother, A−B = brother, A×B = wife, A÷B = father.\n\nHow is C related to E if A + B × C ÷ D − E?", o: ["Sister's husband","Mother","Brother's wife","Sister"], e: "Per docx answer key, option 3 (Brother's wife)." },
  { s: REA, q: "Family-relation puzzle: X+Y = mother, X*Y = father, X−Y = daughter, X%Y = wife.\n\nHow is A related to D if 'A − B * C + D'?", o: ["Mother's mother","Daughter","Mother's sister","Mother"], e: "A daughter of B; B father of C; C mother of D → A is C's sibling → A is D's Mother's sister. Option 3." },

  // ============ GA (26-50) ============
  { s: GA, q: "Which of the following classes has the largest number of animals?", o: ["Pisces","Reptiles","Insects","Mammals"], e: "Insecta is the largest animal class (~1 million species). Option 3." },
  { s: GA, q: "On 7th March 2022, the Government initiated a scheme to re-enrol out-of-school adolescent girls (OoSAG) in the age group of 11-14 years. What is the name of the scheme?", o: ["Prerna Scheme","Kanya Shiksha Pravesh Utsav","Rashtriya Madhyamik Shiksha Abhiyan","National Scheme of Incentives to Girls for Secondary Education"], e: "Kanya Shiksha Pravesh Utsav was launched on 7 March 2022. Option 2." },
  { s: GA, q: "When Akbar introduced Mansabdari system, __________ was the lowest grade of Mansabdar.", o: ["ten","fifty","one thousand","one hundred"], e: "Akbar's Mansabdari ranks ranged from 10 (lowest) to 10,000. Option 1." },
  { s: GA, q: "Which of the following classical dance forms has originated in Andhra Pradesh?", o: ["Kathakali","Kathak","Bharatnatyam","Kuchipudi"], e: "Kuchipudi originated in Andhra Pradesh. Option 4." },
  { s: GA, q: "The festival of Eid Milad-un-Nabi is celebrated in which of the following Islamic months?", o: ["Muharram","Rajab","Rabi' al-Awwal","Safar"], e: "Eid Milad-un-Nabi (Mawlid) falls in the month of Rabi' al-Awwal. Option 3." },
  { s: GA, q: "Thaneswar where the Vardhana dynasty ruled around the present-day state of ________.", o: ["Madhya Pradesh","Rajasthan","Gujarat","Haryana"], e: "Thaneswar (Thanesar) is in present-day Haryana. Option 4." },
  { s: GA, q: "Why I Am An Atheist is the autobiography of which Indian freedom fighter?", o: ["Bhagat Singh","Subhash Chandra Bose","Lala Lajpat Rai","Sarojini Naidu"], e: "Essay by Bhagat Singh (1930). Option 1." },
  { s: GA, q: "Technetium, the first artificially produced element used in many medical diagnostic imaging scans, is found in which group of the periodic table?", o: ["Group 7","Group 12","Group 19","Group 14"], e: "Technetium (Tc, atomic no. 43) is in Group 7. Option 1." },
  { s: GA, q: "In December 1929, Jawaharlal Nehru, president of Indian National Congress, formally demanded __________ from British Government.", o: ["complete freedom","civil rights","fundamental rights","dominion status"], e: "1929 Lahore Session — Purna Swaraj (complete freedom) declaration. Option 1." },
  { s: GA, q: "The term 'bishop' is associated with which game?", o: ["hockey","basketball","golf","chess"], e: "Bishop is a chess piece. Option 4." },
  { s: GA, q: "From the given alternatives, identify an inner planet.", o: ["Jupiter","Uranus","Saturn","Mercury"], e: "Mercury is an inner (terrestrial) planet. Option 4." },
  { s: GA, q: "K-selected species are characterised by:", o: ["species possessing relatively unstable populations and which tend to produce relatively large numbers of offspring","species possessing relatively stable populations and which tend to produce relatively large numbers of offspring","species possessing relatively stable populations and which tend to produce relatively low numbers of offspring","species possessing relatively unstable populations and which tend to produce relatively low numbers of offspring"], e: "K-selected species: stable populations, few offspring, high parental care. Option 3." },
  { s: GA, q: "In which Harappan site was a paved bathroom found?", o: ["Banawali","Dholavira","Mohenjodaro","Kalibangan"], e: "Mohenjodaro is famous for its sophisticated drainage and bath structures (incl. Great Bath). Option 3." },
  { s: GA, q: "Natya Sangeet is a form of musical play in classical music still prevalent in Maharashtra. Bal Gandharava is an exponent of this musical form. What is the actual name of Balgandharva?", o: ["Narayan Shripad Rajhans","Vishnu Digambar Paluskar","Vishnu Narayan Bhatkhande","Mallikarjun Mansur"], e: "Bal Gandharva's birth name was Narayan Shripad Rajhans. Option 1." },
  { s: GA, q: "The first train steamed off from Mumbai to ________.", o: ["Malad","Pune","Thane","Nagpur"], e: "India's first train (16 Apr 1853) ran from Bombay to Thane. Option 3." },
  { s: GA, q: "What is the name of the farmer's parliament formed by the villagers in 1999 with the primary objective of safeguarding community efforts to conserve and utilise their scarce natural resources?", o: ["Renuka Sansad","Arvari Sansad","Siddhi Sansad","Kulsi Sansad"], e: "Arvari Sansad (Rajasthan, 1999) is the famed water-parliament. Option 2." },
  { s: GA, q: "In April 2022, the Prime Minister Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi) scheme was extended till December _______.", o: ["2024","2026","2023","2025"], e: "PM SVANidhi was extended till December 2024 (Apr 2022). Option 1." },
  { s: GA, q: "In which of the following places the Indian National Congress passed the resolution of Purna Swaraj?", o: ["Lahore","Bombay","Madras","Karachi"], e: "Purna Swaraj resolution passed at the Lahore Session (Dec 1929). Option 1." },
  { s: GA, q: "On the 46th Civil Accounts Day, as a part of 'Ease of Doing Business (EoDB) and Digital India eco-system', the Government of India introduced which of the following?", o: ["E-bill processing system","Digi-bill processing system","Saral system","Sahaj system"], e: "Government launched the e-Bill Processing System on the 46th Civil Accounts Day. Option 1." },
  { s: GA, q: "Who has been named the new CEO of the Food Safety and Standards Authority of India (FSSAI) in December 2022?", o: ["Manish Mani Tiwari","Ramesh Chander","Ganji Kamala V Rao","Prasanna K Sharma"], e: "Ganji Kamala V Rao was appointed CEO of FSSAI in Dec 2022. Option 3." },
  { s: GA, q: "Which of the following statements is NOT correct about the Attorney General of India?", o: ["A person qualified to be appointed as the judge of the Supreme Court is eligible for the office of the Attorney General of India.","He/She is considered the highest law officer in the country.","Article 76 provides for the Attorney General of India.","He/She is appointed by the Prime Minister of India."], e: "AG is appointed by the President (not PM). Option 4 is incorrect." },
  { s: GA, q: "Which of the following Articles of the Constitution of India states about the executive power of the Union?", o: ["Article 52","Article 54","Article 53","Article 55"], e: "Article 53 vests executive power of the Union in the President. Option 3." },
  { s: GA, q: "As per the 2011 census, what is the density of population in Arunachal Pradesh?", o: ["18 persons/km²","19 persons/km²","17 persons/km²","20 persons/km²"], e: "Arunachal Pradesh had the lowest density 17 persons/km² in Census 2011. Option 3." },
  { s: GA, q: "Which of the following is NOT an Indian tournament?", o: ["UEFA Champions League","Subroto Cup","Durand Cup","Santosh Trophy"], e: "UEFA Champions League is a European football tournament (not Indian). Option 1." },
  { s: GA, q: "From which country were the ideals of justice of the Indian Constitution borrowed?", o: ["The USSR","The US","Japan","The UK"], e: "The ideals of justice (social, economic, political) in the Preamble were inspired by the USSR Constitution. Option 1." },

  // ============ QA (51-75) ============
  { s: QA, q: "In an election between two candidates, 75% of the voters cast their votes, out of which 4% of the votes were declared invalid. A candidate got 9504 votes, which were 80% of the valid votes. Find the total number of votes enrolled in that election.", o: ["13,200","12,375","12,672","16,500"], e: "Valid = 9504/0.80 = 11880. Cast = 11880/0.96 = 12375. Enrolled = 12375/0.75 = 16500. Option 4." },
  { s: QA, q: "If the cost price of a table is ₹400 and the selling price is ₹600, then find the profit percentage.", o: ["45%","33%","55%","50%"], e: "Profit% = (200/400) × 100 = 50%. Option 4." },
  { s: QA, q: "If Tanmay covers three equal distances at the speeds of 2 km/h, 3 km/h and 4 km/h, respectively, then find his average speed (in km/h) during the whole journey. (Rounded off to 2 decimal places)", o: ["4.35","5.75","2.77","3.25"], e: "Avg = 3 / (1/2 + 1/3 + 1/4) = 3 / (13/12) = 36/13 ≈ 2.77. Option 3." },
  { s: QA, q: "At a construction site, 15 men or 10 machines can construct a room in 66 days. In how many days can 5 men and 4 machines together complete the work?", o: ["80","90","75","85"], e: "1 man = 1/990 work/day; 1 machine = 1/660. 5m+4m = 5/990 + 4/660 = 1/198 + 1/165 = 11/990 → days = 990/11 = 90. Option 2." },
  { s: QA, q: "If the cylinder height is 9 cm and the base area is 25π cm², then find the total surface area.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "r²π = 25π → r = 5. TSA = 2πr² + 2πrh = 50π + 90π = 140π cm². Per docx, option 4." },
  { s: QA, q: "Kajal offers two successive discounts of 10% and 8% on the sale of a cosmetic item to her customer. What is the equivalent single percentage discount offered by Kajal?", o: ["17.4%","17.2%","17.6%","17.8%"], e: "Net = 1 − 0.9 × 0.92 = 1 − 0.828 = 17.2%. Option 2." },
  { s: QA, q: "A shopkeeper expects a gain of 36% on his cost price. If in a month, his sale was ₹6,14,856, then what was his profit (in ₹)?", o: ["1,62,800","1,62,756","1,61,235","1,63,900"], e: "SP = 1.36 CP → CP = 614856/1.36 = 452100. Profit = 614856 − 452100 = 162756. Option 2." },
  { s: QA, q: "A garrison of 140 men has provisions for 35 days. At the end of 10 days, 35 more men joined them. How many days can they sustain on the remaining provisions?", o: ["20","10","25","35"], e: "Remaining provisions = 140 × 25 = 3500 man-days. New count = 175. Days = 3500/175 = 20. Option 1." },
  { s: QA, q: "If two-fifth of three-eighth of one-sixth of a certain number is 52, what is 40% of the number?", o: ["2080","832","1248","1664"], e: "(2/5)(3/8)(1/6) N = 52 → N/40 = 52 → N = 2080. 40% = 832. Option 2." },
  { s: QA, q: "Which of the following numbers are divisible by 11?\n(i) 29435417  (ii) 57463828  (iii) 57463824  (iv) 29435416", o: ["(i) and (ii)","(iii) and (iv)","(i) and (iii)","(ii) and (iii)"], e: "Check alt-sum: 29435417 alt = (2+4+5+1)−(9+3+4+7) = 12−23 = −11 ✓. 57463824 alt = (5+4+3+2)−(7+6+8+4) = 14−25 = −11 ✓. Option 3." },
  { s: QA, q: "A sum of ₹2,400 gives a simple interest of ₹378 in 2 years 4 months. What is the rate of interest per annum?", o: ["7.05%","6.75%","6.95%","6.85%"], e: "R = SI × 100 / (P × T) = 378 × 100 / (2400 × 7/3) = 37800/5600 = 6.75%. Option 2." },
  { s: QA, q: "The radius of a hemisphere is 9 cm. Its volume will be:", o: ["243π cm³","972π cm³","712π cm³","486π cm³"], e: "V = (2/3)πr³ = (2/3)π × 729 = 486π cm³. Option 4." },
  { s: QA, q: "Roshan owned a plot of land having an area that was 20% more than the area of the plot owned by Susan, while the area of the plot of land owned by Jacob was 30% more than the area of the plot owned by Roshan. If the area of the plot owned by Susan was 1250 square feet, what was the area (in square feet) of the plot owned by Jacob?", o: ["1875","2050","2020","1950"], e: "Roshan = 1250 × 1.2 = 1500. Jacob = 1500 × 1.3 = 1950. Option 4." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: QA, q: "If class A has 11 boys and 18 girls, class B has 13 boys and 17 girls, and class C has 20 boys and 9 girls, which class has the biggest ratio(s) of boys to girls?", o: ["Class A","Class B","Class C","Both class A and class B"], e: "A: 11/18 ≈ 0.61; B: 13/17 ≈ 0.76; C: 20/9 ≈ 2.22. Class C biggest. Option 3." },
  { s: QA, q: "A train passes a 500 m long platform in 12 seconds and a man standing on the platform in four seconds. Find the speed of the train.", o: ["125 km/h","252.5 km/h","152.5 km/h","225 km/h"], e: "Let speed = v m/s, length = L. L/v = 4 (man); (L+500)/v = 12. So 500/v = 8 → v = 62.5 m/s = 225 km/h. Option 4." },
  { s: QA, q: "A thief is noticed by a policeman from a distance of 500 m. The thief starts running and the policeman chases him. The thief and the policeman run at the speed of 12 km/h and 13 km/h, respectively. What is the distance between them after 12 minutes?", o: ["300 m","150 m","100 m","200 m"], e: "Relative speed = 1 km/h. In 12 min (0.2 h) closes 200 m. Remaining = 500 − 200 = 300 m. Option 1." },
  { s: QA, q: "The average age of all the students of a class is 18 years. The average age of the boys of the class is 19 years and of the girls is 14 years. If the number of girls in the class is 30, then what is the number of boys in the class?", o: ["100","140","120","110"], e: "Let boys = B. (19B + 14×30) / (B+30) = 18 → 19B+420 = 18B+540 → B = 120. Option 3." },
  { s: QA, q: "If an electricity bill is paid before the due date, one gets a reduction of 5% on the amount of the bill. By paying the bill before the due date, a person got a reduction of ₹250. The original amount of his electricity bill (in ₹) was:", o: ["4500","4000","5500","5000"], e: "0.05 × bill = 250 → bill = 5000. Option 4." },
  { s: QA, q: "₹1,380 has to be paid after 4 years. If four equal instalments are required with a simple interest of 10% on each instalment, then what is the value of each instalment?", o: ["₹300","₹400","₹500","₹200"], e: "Use formula x = 100P / (100n + r×n(n−1)/2) = 100×1380/(400 + 60) = 138000/460 = 300. Option 1." },
  { s: QA, q: "Sanjana borrows ₹16,000 at 24% per annum simple interest and Savithri borrows ₹18,200 at 20% per annum simple interest. In how many years will their amounts of debts be equal?", o: ["11","10","12","15"], e: "16000(1+0.24t) = 18200(1+0.20t) → 3840t − 3640t = 2200 → 200t = 2200 → t = 11. Option 1." },
  { s: QA, q: "A teacher travelled a distance of 22 km in 7 hours. He travelled partly on foot at the speed of 2 km/h and partly on bicycle at the rate of 4 km/h. The distance travelled on foot is:", o: ["8 km","10 km","3 km","6 km"], e: "Let foot = x km, bike = 22−x. x/2 + (22−x)/4 = 7 → 2x + 22 − x = 28 → x = 6. Option 4." },
  { s: QA, q: "A 4-digit number '34PQ' is divisible by 3, 5 and 7. Find the value of P+Q.", o: ["11","12","10","13"], e: "Divisible by 5 → Q = 0 or 5. Check 3415, 3430, 3465... 3465/7 = 495 ✓ & 3+4+6+5=18 ÷3 ✓. P=6, Q=5 → P+Q=11. Option 1." },
  { s: QA, q: "A salesman purchases goods at ₹1,250 and is forced to sell it at ₹1,000. Find his loss percentage.", o: ["15%","30%","25%","20%"], e: "Loss = 250/1250 × 100 = 20%. Option 4." },
  { s: QA, q: "The average of v numbers is w² and that of w numbers is v². Then the average of all the numbers is:", o: ["vw","vw²","v² + w²","v + w"], e: "Total = v·w² + w·v² = vw(w + v). Avg = vw(v+w) / (v+w) = vw. Option 1." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the most appropriate option to fill in the blanks.\n\nThe term 'germ'________ an army of tiny terrors, including viruses, fungi, parasites and bacteria. These pathogens all have the ability to ________ from victim to victim, who is known as host. These look like microscopic monsters.", o: ["incorporate; grow","encircle; stretch","enclose; extend","encompasses; spread"], e: "'Encompasses ... spread' best fits the medical/microbiology register. Option 4." },
  { s: ENG, q: "From among the words given in bold, select the INCORRECTLY spelt word in the following sentence.\n\nThese are the letters of administration that are useful for genaelogical studies and for investigations pertaining to the state of society.", o: ["administration","investigations","pertaining","genaelogical"], e: "'Genaelogical' is misspelled — correct is 'genealogical'. Option 4." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nWarm", o: ["Amicable","Unkind","Hostile","Mean"], e: "Warm ≈ Amicable (friendly). Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nA snake in the grass", o: ["A man with a straightforward attitude","A man of ability","A worthless person","A secret or hidden enemy"], e: "'A snake in the grass' = a hidden/treacherous enemy. Option 4." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nConcise", o: ["Brief","Relief","Belief","Grief"], e: "Concise ≈ Brief. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\n\nA frugal lifestyle doesn't necessarily reflect someone's personality.", o: ["conventional","cooperative","dynamic","wasteful"], e: "Frugal (sparing) ↔ Wasteful. Option 4." },
  { s: ENG, q: "Select the most appropriate meaning of the given underlined idiom.\n\nThe construction of the office building of the company was taking place in leaps and bounds.", o: ["Broken because of negligence","Moving very slowly","Stopped due to some legal issues","Progressing very quickly"], e: "'By leaps and bounds' = at a very rapid rate. Option 4." },
  { s: ENG, q: "Identify the option that rectifies the spelling of the incorrectly spelt word in the given sentence.\n\nThe fencing was adoned with ornamental plants of various colours.", o: ["Ornamenntal","Variouse","Adorned","Fensing"], e: "'Adoned' is misspelled — correct is 'Adorned'. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nMany societies throughout history have understood the ______ for harmony between the environment, society, and economy.", o: ["caninity","superfluity","necessity","amenity"], e: "'The necessity for harmony' fits the context. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM for the highlighted word.\n\nHis liberal policies were responsible for progress in the community.", o: ["conservative","hysterical","ineffectual","central"], e: "Liberal ↔ Conservative. Option 1." },
  { s: ENG, q: "Select the option that expresses the following sentence in passive voice.\n\nThe police is interrogating the peons of my school.", o: ["The peons of my school has been being interrogated by the police.","The peons of my school were being interrogated by the police.","The peons of my school have been being interrogated by the police.","The peons of my school are being interrogated by the police."], e: "Present continuous active → present continuous passive: 'are being interrogated'. Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\n\nIt was certainly a cowardly act.", o: ["Fearful","Brave","Comfortable","Believable"], e: "Cowardly ↔ Brave. Option 2." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Psychiatry","Psychology","Phisiology","Psychometric"], e: "'Phisiology' is misspelled — correct is 'Physiology'. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in reported speech.\n\nSheena said, 'I am flying a kite.'", o: ["Sheena said that she has been flying a kite.","Sheena says she was flying a kite.","Sheena said that she was flying a kite.","Sheena said that she had flown a kite."], e: "'I am flying' → 'she was flying' (backshift). Option 3." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nSpeech without prior preparation", o: ["Debate","Lecture","Extempore","Rambling"], e: "Extempore = without preparation. Option 3." },
  { s: ENG, q: "Read the Sustainability passage.\n\nIn the context of the passage, select the most appropriate option to fill in blank (1).\n\n'Sustainability is ___(1)___ longer just a buzzword.'", o: ["any","not","no","never"], e: "'No longer just a buzzword' is the standard phrase. Option 3." },
  { s: ENG, q: "Read the Sustainability passage.\n\nIn the context of the passage, select the most appropriate option to fill in blank (2).\n\n'It ___(2)___ a necessity and the primary agenda of the world today.'", o: ["is","might be","will be","was"], e: "Present-tense statement of fact: 'is'. Option 1." },
  { s: ENG, q: "Read the Sustainability passage.\n\nIn the context of the passage, select the most appropriate option to fill in blank (3).\n\n'India too is witnessing a growth of ___(3)___ green economy.'", o: ["his","their","its","hers"], e: "India → 'its' (singular non-personal possessive). Option 3." },
  { s: ENG, q: "Read the Sustainability passage.\n\nIn the context of the passage, select the most appropriate option to fill in blank (4).\n\n'It ___(4)___ estimated that India's renewable energy target will create more than 3.4 million new job opportunities'", o: ["had been","were","will be","is"], e: "'It is estimated' fits the present-tense report. Option 4." },
  { s: ENG, q: "Read the Sustainability passage.\n\nIn the context of the passage, select the most appropriate option to fill in blank (5).\n\n'more than 3.4 million new job opportunities ___(5)___ 2030'", o: ["with","for","since","by"], e: "'By 2030' (deadline). Option 4." },
  { s: ENG, q: "Read the Dhamaal passage.\n\nWhat is the tone of the speaker?", o: ["Informative","Biased","Aggressive","Sarcastic"], e: "Passage gives facts and explanations — Informative tone. Option 1." },
  { s: ENG, q: "Read the Dhamaal passage.\n\nIdentify the most suitable title for the passage.", o: ["The Bhavnagar Treat","The Saga of the Siddis","Wonders of Indian Dance","What's Missing in Dhamaal?"], e: "Passage centres on the Siddi community and their Dhamaal tradition. Option 2." },
  { s: ENG, q: "Read the Dhamaal passage.\n\nWhat is played in a Dhamaal song after blowing into a conch shell?", o: ["Musindo","Lyre","Baithaaki","Table"], e: "Passage: 'followed by the slow playing of East African percussion instruments like the musindo'. Option 1." },
  { s: ENG, q: "Read the Dhamaal passage.\n\nSelect the most suitable word from the passage which means 'excited'.", o: ["Ritual","Frenzied","Spiritual","Percussion"], e: "'Frenzied' = wildly excited. Option 2." },
  { s: ENG, q: "Read the Dhamaal passage.\n\nWho is NOT a spiritual leader of the Siddis?", o: ["Mai Misra","Gulam Ali","Sidi Nabi Sultan","Baba Habash"], e: "Passage lists Bava Gor, Mai Misra, Baba Habash, Sidi Nabi Sultan as leaders. Gulam Ali is not mentioned. Option 2." }
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Matriculation) - 20 June 2024 Shift-4';
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
