/**
 * Seed: SSC Selection Post Phase XII 2024 (Matriculation Level) PYQ - 20 June 2024, Shift-1 (100 questions)
 * Source: SSC official docx — answer key decoded from inline green-tick (rId6) image bullets.
 * Section order: REA → GA → QA → ENG.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-20jun2024-s1.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun20_2024_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-20jun2024-s1';

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

const F = '20-jun-2024-s1';

const IMAGE_MAP = {
  6:  { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] }, // REA Q6 mirror
  14: { q: 'image9.png',  opts: ['image10.png','image11.png','image12.png','image13.png'] }, // REA Q14 figure series
  67: { q: '', opts: ['image14.jpeg','image15.jpeg','image16.jpeg','image17.jpeg'] }          // QA Q17 area of triangle
};

// Answer key decoded from inline green-tick (rId6) bullets in source docx
const KEY = [
  // REA (1-25)
  4, 4, 4, 2, 1,   2, 3, 4, 3, 1,   3, 1, 1, 4, 4,   3, 3, 3, 3, 4,   1, 4, 2, 2, 1,
  // GA (26-50)
  2, 1, 3, 3, 4,   2, 1, 3, 1, 4,   4, 2, 4, 4, 3,   1, 2, 2, 2, 4,   3, 2, 4, 3, 2,
  // QA (51-75)
  4, 1, 1, 2, 4,   1, 3, 1, 2, 3,   1, 4, 2, 3, 2,   2, 2, 3, 1, 4,   1, 4, 1, 4, 3,
  // ENG (76-100)
  3, 3, 3, 1, 1,   2, 1, 3, 3, 2,   1, 4, 1, 4, 4,   3, 4, 2, 2, 1,   1, 1, 4, 4, 4
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "In a certain code language 'WHEAT' is written as 'AMIFX' and 'BLACK' is written as 'FQEHO'. How will 'GREASE' be written in the same code language?", o: ["KWIFVJ","KWIGWI","KWIFWI","KWIFWJ"], e: "Pattern: each letter shifts +4,+5,+4,+5,+4,+5. G→K, R→W, E→I, A→F, S→W, E→J = KWIFWJ. Option 4." },
  { s: REA, q: "In a certain code language, 'BORE' is coded as '7513', and 'ROTE' is coded as '1457'. What is the code for 'T' in that language?", o: ["1","5","3","4"], e: "Common letters O, R, E share codes {1,5,7}. Extra code in ROTE ({1,4,5,7}) vs BORE ({7,5,1,3}) is 4 → T = 4. Option 4." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks, will complete the letter series.\n\nr _ m _ s_ t _ i _ m s s _ r i m _ _ s t", o: ["i m s r s t s s","i s m r m t m s","i m s r t t m s","i m s r m t m s"], e: "Per source key, option 4 (i m s r m t m s)." },
  { s: REA, q: "Following certain logic, 64 is related to 16 and 100 is related to 25. To which of the following is 144 related, following the same logic?", o: ["24","36","72","48"], e: "Pattern n/4: 64/4=16, 100/4=25, 144/4=36. Option 2." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in the order in which they appear in an English dictionary.\n\n1. Expert  2. Exotic  3. Explicit  4. Expense  5. Expanse", o: ["2, 5, 4, 1, 3","3, 5, 2, 1, 4","3, 4, 5, 1, 2","4, 2, 5, 1, 3"], e: "Exotic(2), Expanse(5), Expense(4), Expert(1), Explicit(3) → 2,5,4,1,3. Option 1." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 2." },
  { s: REA, q: "In a certain code language, 'LAST' is coded as '5489', and 'SILT' is coded as '9465'. What is the code for 'I' in that language?", o: ["5","4","6","9"], e: "From the two codes, common letters L,S,T overlap. Extra code in SILT ({9,4,6,5}) vs LAST ({5,4,8,9}) is 6 → I = 6. Option 3." },
  { s: REA, q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster.\n\nLINK : JGKN :: THAT : RFTA :: GROW : ?", o: ["EQVP","EQXO","FQVO","EPWO"], e: "Per docx answer key, option 4 (EPWO)." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nBINZ, EJOY, HKPX, ?, NMRV", o: ["KLRW","JLQW","KLQW","JLRW"], e: "1st letter +3 (B,E,H,K,N); 2nd +1 (I,J,K,L,M); 3rd +1 (N,O,P,Q,R); 4th -1 (Z,Y,X,W,V). KLQW. Option 3." },
  { s: REA, q: "Which of the following terms will replace the question mark (?) in the given series?\n\nMBZT, KYBW, IVDZ, ?, EPHF", o: ["GSFC","GRFB","FSGC","FRGB"], e: "1st letter -2 each (M,K,I,G,E); 2nd -3 each (B,Y,V,S,P); 3rd +2 each (Z,B,D,F,H); 4th +3 each (T,W,Z,C,F). GSFC. Option 1." },
  { s: REA, q: "In a certain code language, 'GROUP' is written as '7T 15W16' and 'STATE' is written as '19V1V5'. How will 'RIGHT' be written in that language?", o: ["17K 8J20","18K 8K 20","18K 7J20","18J7J20"], e: "Per docx answer key, option 3 (18K 7J20)." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n168, 191, 218, 249, 284, ?", o: ["323","333","319","329"], e: "Differences +23,+27,+31,+35,+39 (AP +4). 284+39 = 323. Option 1." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed in the blanks below, will complete the letter-series.\n\ne_bho_etb_ _met_hom_tbhom", o: ["t m h o b e","m h t o b e","t m b h o e","h m t e b o"], e: "Per docx answer key, option 1 (t m h o b e)." },
  { s: REA, q: "Identify the option figure that can replace the question mark (?) in the following series to logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: REA, q: "If WATER is coded as 30 and ORANGE is coded as 36, what will EIGHT be coded as?", o: ["42","36","25","30"], e: "Per docx answer key, option 4 (30). (Sum of letter positions divided by some factor.)" },
  { s: REA, q: "What will come in the place of '?' in the following equation, if '+' and '−' are interchanged and also '×' and '÷' are interchanged?\n\n88 − 7 ÷ 65 × 13 + 34 = ?", o: ["94","76","89","101"], e: "After swap: 88 + 7 × 65 ÷ 13 − 34 = 88 + 7×5 − 34 = 88+35−34 = 89. Option 3." },
  { s: REA, q: "In a certain code language, 'BLOOD' is written as 'CNRSI' and 'VEINS' is written as 'WGLRX'. How will 'HEART' be written in that language?", o: ["IGVDY","IGDYV","IGDVY","IGYDV"], e: "Per docx answer key, option 3 (IGDVY)." },
  { s: REA, q: "In a certain code language, 'P * Q' means 'P is the father of Q', 'P # Q' means 'P is the sister of Q', 'P + Q' means 'P is the brother of Q', 'P = Q' means 'P is the mother of Q', 'P − Q' means 'P is the son of Q'.\n\nBased on the above, how is P related to R if 'P * Q = R'?", o: ["Mother's brother","Brother","Mother's father","Father"], e: "P father of Q; Q mother of R → P is R's mother's father (maternal grandfather). Option 3." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nConvict : Prison :: Eskimo : ?", o: ["Hut","Cottage","Igloo","Palace"], e: "A convict lives in a prison; an Eskimo lives in an Igloo. Option 3." },
  { s: REA, q: "Read the given statements and conclusions carefully.\n\nStatements:\n1) All mats are sheets.\n2) No sheet is a paper.\n3) Some papers are notebooks.\n\nConclusions:\nI. No mat is a paper.\nII. Some sheets are notebooks.", o: ["Neither conclusion I nor II follows","Only conclusion II follows","Both conclusions I and II follow","Only conclusion I follows"], e: "All mats ⊆ sheets; no sheet is paper → no mat is paper (I ✓). II is not certain. Option 4." },
  { s: REA, q: "What will come in the place of '?' in the following equation, if '+' and '−' are interchanged and also '×' and '÷' are interchanged?\n\n9 ÷ 145 × 29 − 75 + 13 = ?", o: ["107","137","124","113"], e: "After swap: 9 × 145 ÷ 29 + 75 − 13 = 9×5 + 75 − 13 = 45+62 = 107. Option 1." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Neural  2. Newspaper  3. Neglect  4. Newfound  5. Neutron  6. Nephew", o: ["3, 1, 6, 5, 4, 2","3, 6, 1, 4, 5, 2","3, 6, 5, 1, 4, 2","3, 6, 1, 5, 4, 2"], e: "Neglect(3), Nephew(6), Neural(1), Neutron(5), Newfound(4), Newspaper(2) → 3,6,1,5,4,2. Option 4." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nSome bamboos are sticks. All canes are sticks. All canes are twigs.\n\nConclusions:\nI. Some bamboos are twigs.\nII. Some twigs are sticks.", o: ["Neither conclusion I nor II follows","Only conclusion II follows","Only conclusion I follows","Both conclusions I and II follow"], e: "All canes ⊆ sticks and All canes ⊆ twigs → some twigs are sticks (II ✓). I uncertain. Option 2." },
  { s: REA, q: "Family-relation puzzle.\n\nA + B means 'A is the mother of B'; A − B means 'A is the brother of B'; A × B means 'A is the wife of B'; A ÷ B means 'A is the father of B'.\n\nBased on the above, how is O related to M if 'C − O ÷ L × U ÷ M ÷ N'?", o: ["Father's father","Mother's father","Father's brother","Mother's mother"], e: "O father of L; L wife of U; U father of M → L is M's mother; O is L's father → O is M's mother's father. Option 2." },
  { s: REA, q: "Select the option that represents the letters that, when placed from left to right in the blanks below, will complete the letter-series.\n\na_m x_q_y c_o_", o: ["pbnrz","nbprz","prnbx","pnbrz"], e: "Per docx answer key, option 1 (pbnrz)." },

  // ============ GA (26-50) ============
  { s: GA, q: "Which group of oilfields among the following is located in Assam?", o: ["Kosamba and Lunej","Digboi and Naharkatiya","Ankaleshwar and Kalol","Mehsana and Nawagam"], e: "Digboi and Naharkatiya are the main oilfields of Assam. Option 2." },
  { s: GA, q: "Where was the first cement plant located in India in the year 1904?", o: ["Chennai","Jaipur","Hyderabad","Rajkot"], e: "India's first cement plant was set up at Chennai (Madras) in 1904. Option 1." },
  { s: GA, q: "The density of population is the crude relationship between human and ________.", o: ["growth","capital","land","family"], e: "Population density = persons per unit land area. Option 3." },
  { s: GA, q: "In February 2023, which high court ordered that even foreigners can invoke Domestic Violence Act, 2005 in Indian courts and that the residence of women is immaterial?", o: ["Delhi","Calcutta","Madras","Bombay"], e: "The Madras High Court delivered this ruling in Feb 2023. Option 3." },
  { s: GA, q: "Which of the following states is associated with Bonalu festival?", o: ["Tamil Nadu","Karnataka","Kerala","Telangana"], e: "Bonalu is a Hindu festival celebrated in Telangana. Option 4." },
  { s: GA, q: "Alarippu, Jatiswaram, Shabdam, Varnam and Tillana are regular patterns of which of the following classical dance forms of India?", o: ["Sattriya","Bharatanatyam","Kathak","Manipuri"], e: "These are items of a Bharatanatyam Margam recital. Option 2." },
  { s: GA, q: "Which metalloid in the carbon group is chemically similar to its group neighbours tin and silicon?", o: ["Germanium","Flerovium","Lead","Arsenic"], e: "Germanium (Group 14) is a metalloid chemically similar to Si and Sn. Option 1." },
  { s: GA, q: "Rajasthani architecture is also known as:", o: ["Indo-Saracenic","Greco-Roman","Maru-Gurjara","Sharqi"], e: "Maru-Gurjara is the architectural style of Rajasthan and Gujarat. Option 3." },
  { s: GA, q: "During a National Emergency, the term of Lok Sabha can be extended for:", o: ["one year at a time","three months at a time","six months at a time","two years at a time"], e: "Under Article 83(2), term may be extended by 1 year at a time during emergency. Option 1." },
  { s: GA, q: "Which Ministry of the Government of India launched South Asia Distribution Utility Network (SADUN) which aims to modernise distribution of utilities in South Asia?", o: ["Railways ministry","Information and Broadcasting ministry","Civil Aviation ministry","Power ministry"], e: "Ministry of Power launched SADUN. Option 4." },
  { s: GA, q: "The Asian Games is also known as _________.", o: ["National Games","World Cup","Commonwealth Games","Asiad"], e: "The Asian Games are popularly known as 'Asiad'. Option 4." },
  { s: GA, q: "Who among the following personalities renounced his knighthood after the Jallianwala Bagh massacre?", o: ["JC Bose","Rabindranath Tagore","CV Raman","Syed Ahmed Khan"], e: "Rabindranath Tagore renounced his knighthood after the 1919 massacre. Option 2." },
  { s: GA, q: "The Suresh Tendulkar committee was formed in 2005 for _______.", o: ["economic reform","foreign policy","employment","poverty estimates"], e: "Suresh Tendulkar Committee (2005) was constituted for poverty line estimation. Option 4." },
  { s: GA, q: "The Union Cabinet has approved to extend the Pradhan Mantri Ujjwala Yojana (PMUY) for how many years in September 2023?", o: ["Five years","Seven years","Two years","Three years"], e: "PMUY extended for three more years (Sept 2023). Option 4." },
  { s: GA, q: "The Federal Court of India was established in Delhi by the Act of ________.", o: ["1905","1919","1935","1908"], e: "Government of India Act 1935 established the Federal Court (operational from 1937). Option 3." },
  { s: GA, q: "In which of the following sports/games is the term 'bull's eye' used?", o: ["Shooting","Kabaddi","Chess","Kho-kho"], e: "'Bull's eye' is the central target ring in Shooting/Archery. Option 1." },
  { s: GA, q: "Identify a factor that does NOT determine the temperature of ocean waters.", o: ["Unequal distribution of land and water","Longitude","Ocean currents","Latitude"], e: "Latitude (not longitude) affects ocean temperature; Longitude does NOT. Option 2." },
  { s: GA, q: "Which Assamese artist was known as Sudhakantha?", o: ["Hiteswar Saikia","Bhupen Hazarika","Hem Barua","Hema Bharali"], e: "Bhupen Hazarika was popularly called 'Sudhakantha' (Nightingale). Option 2." },
  { s: GA, q: "Which of the following statements is NOT correct about the Directive Principles of State Policy?", o: ["They were incorporated in our Constitution in order to provide economic justice.","These principles are justiciable.","They are fundamental in the governance of the country.","The idea of Directive Principles of State Policy has been taken from the Irish Republic."], e: "DPSPs are NON-justiciable (Article 37). Option 2 is the incorrect statement." },
  { s: GA, q: "What is called the powerhouse of the cell?", o: ["Cytoplasm","Nucleus","Chloroplast","Mitochondria"], e: "Mitochondria generate ATP — the cell's powerhouse. Option 4." },
  { s: GA, q: "Which type of muscles do the uterus, iris of the eye, and bronchi contain?", o: ["Cardiac muscles","Striated muscles","Smooth muscles","Skeletal muscles"], e: "Uterus, iris, bronchi are involuntary smooth muscle tissue. Option 3." },
  { s: GA, q: "Kalidasa was a famous poet in the court of ________.", o: ["Harshavardhana","Chandragupta II","Kanishka","Pushyamitra Shunga"], e: "Kalidasa graced the court of Chandragupta II Vikramaditya. Option 2." },
  { s: GA, q: "Which of the following novels was written by George Orwell?", o: ["Fahrenheit 451","Pride and Prejudice","Brave New World","Animal Farm"], e: "George Orwell wrote 'Animal Farm' (1945). Option 4." },
  { s: GA, q: "Identify the Mughal emperor who was imprisoned for the rest of his life in Agra after the war of succession among his sons.", o: ["Jahandar Shah","Aurangzeb","Shah Jahan","Bahadur Shah I"], e: "Shah Jahan was imprisoned by Aurangzeb in Agra Fort. Option 3." },
  { s: GA, q: "The Quit India Resolution was ratified in the _________ session of Indian National Congress to launch the movement.", o: ["Bankipur","Bombay","Lucknow","Nagpur"], e: "Quit India Resolution was passed at the Bombay AICC session on 8 Aug 1942. Option 2." },

  // ============ QA (51-75) ============
  { s: QA, q: "The perimeter of one face of a cube is 40 cm. Its volume will be:", o: ["10000 cm³","100 cm³","10 cm³","1000 cm³"], e: "Side = 40/4 = 10 cm. Volume = 10³ = 1000 cm³. Option 4." },
  { s: QA, q: "A and B complete a work in 12 and 15 days, respectively. They started the work alternatively for 1 day each and A started the work first. In how much time will 60% of the work be completed?", o: ["8 days","9 days","7 days","10 days"], e: "Two-day cycle = 1/12 + 1/15 = 9/60 = 3/20. 0.6 = (3/20) × cycles → cycles = 4 (8 days) for 60%. Option 1." },
  { s: QA, q: "Rashid sells a book at a gain of 20%. If he had sold it at ₹34.51 more, he would have gained 37%. The cost price (in ₹) of the book is:", o: ["203","220","210","207"], e: "0.17 × CP = 34.51 → CP ≈ 203. Option 1." },
  { s: QA, q: "The lateral surface area of a cone is 550 cm². If the diameter of the cone is 14 cm, then the height of the cone is:", o: ["12 cm","24 cm","25 cm","12.5 cm"], e: "πrl = 550 with r=7 → l = 25. h = √(l² − r²) = √(625−49) = √576 = 24 cm. Option 2." },
  { s: QA, q: "In an educational institution, the ratio of the numbers of students in middle school and in high school, respectively, in a given year was given as 4 : 3. If there were 324 students in middle school in that year in that institution, what was the number of students in high school in the same year in that institution?", o: ["246","249","240","243"], e: "324 × 3/4 = 243. Option 4." },
  { s: QA, q: "The marked price of a fancy toy is ₹30,000. It is to be sold allowing two successive discounts of 20% and 24%, respectively. On cash payment, an additional 10% discount on the net price is also given. The selling price (in ₹) of the toy is:", o: ["16416","18350","16520","17280"], e: "30000 × 0.8 × 0.76 × 0.9 = 16416. Option 1." },
  { s: QA, q: "In a Panchayat election, three contestants - A, B, and C - are contesting. 75% of the total population of 8000 cast their votes. There were no invalid or NOTA votes in the election. A got the least votes, with only 300 votes. B got 66% of the total votes and won the election. How many votes did B get?", o: ["5280","3660","3960","4060"], e: "Votes cast = 6000. B = 66% × 6000 = 3960. Option 3." },
  { s: QA, q: "Rohan buys a bike priced at ₹95,000. He pays ₹25,000 at once and the rest after 18 months, on which he is charged a simple interest at the rate of 10% per annum. The total amount (in ₹) he pays for the bike is:", o: ["1,05,500","1,02,320","1,03,500","1,23,200"], e: "Balance = 70000; SI = 70000 × 0.10 × 1.5 = 10500. Total = 25000 + 70000 + 10500 = 105500. Option 1." },
  { s: QA, q: "The number 10000 is exactly divisible by which of the following numbers?", o: ["14","25","17","18"], e: "10000 ÷ 25 = 400 (exact). Option 2." },
  { s: QA, q: "Find the average of all prime numbers between 42 and 75.", o: ["60.25","55.75","59.25","57.65"], e: "Primes: 43,47,53,59,61,67,71,73. Sum 474 / 8 = 59.25. Option 3." },
  { s: QA, q: "In a circular path of 619 m, Preeti and Rani start walking in opposite directions from the same point at the speed of 2.85 km/h and 5.4 km/h, respectively. When they will meet for the first time approximately?", o: ["After 4.50 minutes","After 6.05 minutes","After 4.75 minutes","After 6.75 minutes"], e: "Relative speed = 8.25 km/h = 137.5 m/min. Time = 619/137.5 ≈ 4.50 min. Option 1." },
  { s: QA, q: "Find the average of 642, 253, 834 and 303.", o: ["512","452","509","508"], e: "Sum = 2032. Avg = 2032/4 = 508. Option 4." },
  { s: QA, q: "An iron costing ₹758 was sold by Ramesh at a gain of 15%, and it was again sold by Reena, who bought it from Ramesh, at a loss of 8%. Find the selling price of the iron for Reena (correct to two places of decimals).", o: ["808.69","801.96","810.96","820.69"], e: "758 × 1.15 × 0.92 = 801.96. Option 2." },
  { s: QA, q: "The price of a trouser is first decreased by 12% and then increased by 15%. If the initial price of the trouser was ₹1,500, find the final price (in ₹) of the trouser.", o: ["1,554","1,545","1,518","1,581"], e: "1500 × 0.88 × 1.15 = 1518. Option 3." },
  { s: QA, q: "If 28 men can do a piece of work in 26 days, then in how many days 13 men will do it?", o: ["52","56","58","50"], e: "28 × 26 = 13 × d → d = 728/13 = 56. Option 2." },
  { s: QA, q: "Rameshwar sold a bike at a loss of 15%. If the selling price had been increased by ₹3,375, there would have been a gain of 12%. Find the cost price of the bike.", o: ["15,200","12,500","25,100","25,200"], e: "0.27 × CP = 3375 → CP = 12500. Option 2." },
  { s: QA, q: "If the length of each of the two equal sides of an isosceles triangle is 15 cm and the adjacent angle is 30°, then the area of the triangle is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Area = (1/2)×15×15×sin(30°) = (1/2)×225×0.5 = 56.25 cm². Per docx answer key, option 2." },
  { s: QA, q: "A car covers the distance from Delhi to Gurugram at 60 km/h and returns at a uniform speed of 40 km/h. The average speed of the car during the whole journey is:", o: ["50 km/h","40 km/h","48 km/h","60 km/h"], e: "Average = 2×60×40/(60+40) = 4800/100 = 48 km/h. Option 3." },
  { s: QA, q: "A bank gives ₹1,500 as simple interest in one year on an amount of ₹60,000. What is the annual rate of simple interest (in percentage)?", o: ["2.5","3.5","5.5","3"], e: "R = SI × 100 / (P × T) = 1500 × 100 / (60000 × 1) = 2.5%. Option 1." },
  { s: QA, q: "In a college election between two rivals, a candidate got 30% of the total votes polled. He was defeated by his rival by 200 votes. The total number of votes polled was:", o: ["300","600","400","500"], e: "Difference = 40% of total = 200 → total = 500. Option 4." },
  { s: QA, q: "Find the amount of equal annual instalment, which will discharge a debt of Rs.40,376 due in 4 years at the rate of 2% p.a. simple interest.", o: ["Rs.9,800","Rs.8,600","Rs.10,250","Rs.8,758"], e: "x = 100×40376 / (100×4 + 2×4×3/2) = 4037600/412 ≈ 9800. Option 1." },
  { s: QA, q: "Which of the following numbers is divisible by 11?", o: ["611571","908781","701611","969331"], e: "969331: (9+9+3) − (6+3+1) = 21 − 10 = 11 → divisible by 11. Option 4." },
  { s: QA, q: "A chemistry laboratory requests for a 25% solution of ferrous sulphate. A supplier has 40 millilitres of 20% solution. How many millilitres of 40% solution should be added to make it a 25% solution (correct to two decimal places)?", o: ["13.33","14.30","15.20","16.40"], e: "(40×0.20 + x×0.40) / (40+x) = 0.25 → 8 + 0.4x = 10 + 0.25x → x = 13.33. Option 1." },
  { s: QA, q: "Find a single discount equivalent to the successive discount of 12%, 20%, 24%, and 32%. (Correct to two places of decimals)", o: ["73.71%","43.41%","53.51%","63.62%"], e: "Net = 1 − 0.88 × 0.80 × 0.76 × 0.68 = 1 − 0.36382 = 63.62%. Option 4." },
  { s: QA, q: "A man walks 3 km and 200 metres in 25 minutes. What is his speed (in km/h)?", o: ["8.76","7.86","7.68","6.87"], e: "3.2 km / (25/60) h = 3.2 × 60/25 = 7.68 km/h. Option 3." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nSomeone who does not care about rules", o: ["Tyrant","Vampire","Nonconformist","Illegitimate"], e: "A nonconformist refuses to follow conventional rules. Option 3." },
  { s: ENG, q: "In the following question a sentence has been given with a blank. You are required to choose the correct idiom to fill in the blank.\n\nI'm ________ until my family arrives from their holiday. I cannot wait to see them.", o: ["bearing the gift of the gab","losing ground","counting down the days","getting myself into a mess"], e: "'Counting down the days' = eagerly awaiting. Option 3." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe state or condition of not being in agreement, accordance, or in harmony", o: ["Congeniality","Diplomacy","Incongruence","Liquidity"], e: "Incongruence = lack of harmony/agreement. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nShe will clear the test tomorrow.", o: ["The test will be cleared by her the next day.","The test would be cleared by her tomorrow.","The test should be cleared by her the previous day.","The test must be cleared by her the coming day."], e: "Future active → future passive: 'will be cleared'. Option 1." },
  { s: ENG, q: "Select the INCORRECTLY spelt word in the given sentence.\n\nOn this auspicious Monday, chilled and shudering in spite of astrologer's assurances, he was glad to return to the shelter of canvas awnings on bamboo stakes.", o: ["shudering","auspicious","assurances","stakes"], e: "'Shudering' is misspelled — correct is 'shuddering'. Option 1." },
  { s: ENG, q: "Select the MISSPELT word.", o: ["Retain","Resturant","Resemblance","Refrain"], e: "'Resturant' is misspelled — correct is 'Restaurant'. Option 2." },
  { s: ENG, q: "Select the most appropriate idiom to fill in the blank.\n\n____________, French was the most difficult language for Shruti.", o: ["By far","Break into","Be in the air","Bear out"], e: "'By far' = without question, the most. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the word 'Rue' from the given sentence.\n\nRubina was in distress and guilt due to the loss she incurred to her company, so she could not accept the bonus with relish at the end of the month.", o: ["Loss","Guilt","Relish","Distress"], e: "'Rue' = regret. Antonym = Relish (enjoy). Option 3." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nStunning", o: ["Hideous","Plain","Gorgeous","Ugly"], e: "Stunning ≈ Gorgeous. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nPixar's feature-length releases, which consistently achieved ______ commercial success, were lauded not only for their visual innovations but for their intelligent and emotional storytelling.", o: ["worldly","worldwide","aggregate","planetary"], e: "Worldwide commercial success is the natural phrase. Option 2." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nBrave", o: ["Coward","Shallow","Courageous","Foolish"], e: "Antonym of brave = Coward. Option 1." },
  { s: ENG, q: "Select the INCORRECTLY spelt word in the options given below.", o: ["Liquidity","Pioneer","Phenomenon","Enthusiatik"], e: "'Enthusiatik' is misspelled — correct is 'Enthusiastic'. Option 4." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nJargon", o: ["Terminology","Music","Essay","Automobile"], e: "Jargon = specialised terminology. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nHe said, \"I can speak three languages fluently.\"", o: ["He said that he can speak three languages fluently.","He said that he was able to speak three languages fluently.","He said that he will be able to speak three languages fluently.","He said that he could speak three languages fluently."], e: "'Can' → 'could' in reported speech. Option 4." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nCourageous", o: ["Cowardly","Fearful","Timid","Gutsy"], e: "Courageous ≈ Gutsy. Option 4." },
  { s: ENG, q: "Read the Child Labour passage.\n\nSelect the most appropriate option for blank 1:\n\n'Children working in hazardous industries are ___1 to debilitating diseases'", o: ["Determined","Questionable","Prone","Elevated"], e: "Prone to diseases is the standard collocation. Option 3." },
  { s: ENG, q: "Read the Child Labour passage.\n\nSelect the most appropriate option for blank 2:\n\n'they are ______2 of bronchial diseases and TB'", o: ["Producers","Creators","Admirers","Victims"], e: "Victims of bronchial diseases fits the context. Option 4." },
  { s: ENG, q: "Read the Child Labour passage.\n\nSelect the most appropriate option for blank 3:\n\n'Their mental and physical development is permanently _____3 by long hours of work'", o: ["Included","Impaired","Established","Examined"], e: "Development is impaired (harmed) by labour. Option 2." },
  { s: ENG, q: "Read the Child Labour passage.\n\nSelect the most appropriate option for blank 4:\n\n'Once ______4, they can't get out of the vicious circle of poverty'", o: ["Adopted","Trapped","Determined","Confirmed"], e: "Once trapped in the vicious circle. Option 2." },
  { s: ENG, q: "Read the Child Labour passage.\n\nSelect the most appropriate option for blank 5:\n\n'They ______5 uneducated and powerless'", o: ["Remain","Compete","Accuse","Choose"], e: "They remain uneducated/powerless. Option 1." },
  { s: ENG, q: "Read the POCSO passage.\n\nSelect the most appropriate title for the passage.", o: ["A Decade of POCSO Act and its Reflect","POCSO, the Perfect Protection","POCSO Act and the Lawyers' Opinions","Lawlessness of POCSO Act"], e: "Passage reflects on 10 years of POCSO Act. Option 1." },
  { s: ENG, q: "Read the POCSO passage.\n\nSelect the most appropriate option to fill in the blank.\n\nThe POCSO Act deals with ______________.", o: ["sexual offenses against children","offenses against children in their education","sexual offenses against women","sexual offenses against the mentally challenged"], e: "POCSO = Protection of Children from Sexual Offences. Option 1." },
  { s: ENG, q: "Read the POCSO passage.\n\nWhich of the following statements is NOT correct, according to the passage?", o: ["Implementing a law in India is difficult.","The government and the judiciary need to assess the gaps.","The trial court completes the trial within a period of one year.","Chandigarh takes about six years on average to dispose of a case."], e: "Passage says Chandigarh takes about six MONTHS, not years. Option 4 is the incorrect statement." },
  { s: ENG, q: "Read the POCSO passage.\n\nSelect the most appropriate ANTONYM of the word 'incarcerate'.", o: ["Reject","Invite","Commit","Liberate"], e: "Incarcerate = imprison. Antonym = Liberate. Option 4." },
  { s: ENG, q: "Read the POCSO passage.\n\nWhat is the view of the writer on one decade of the POCSO Act?", o: ["It has been a complete success in controlling crime against children.","It has failed in protecting child victims.","It has brought new problems to children who have become victims.","It has made the criminal justice system more sensitive towards child victims."], e: "Passage: 'criminal justice system is more sensitive towards child victims today than a decade ago'. Option 4." }
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Matriculation) - 20 June 2024 Shift-1';
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
