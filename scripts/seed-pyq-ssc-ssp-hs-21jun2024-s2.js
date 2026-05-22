/**
 * Seed: SSC Selection Post Phase XII 2024 (Higher Secondary Level) PYQ - 21 June 2024, Shift-2
 * Section order: REA → GA → QA → ENG. Answer key decoded from inline green-tick bullets.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-hs-21jun2024-s2.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun21_2024_s2";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-hs-21jun2024-s2';

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

const F = '21-jun-2024-s2';

const IMAGE_MAP = {
  // REA
  1: { q: 'image1.jpeg', opts: ['image3.jpeg','image5.jpeg','image6.jpeg','image7.jpeg'] }, // embedded figure
  2: { q: 'image9.jpeg', opts: ['image10.png','image11.png','image12.png','image13.png'] }, // mirror image
  3: { q: 'image14.jpeg', opts: ['','','',''] }, // dice
  8: { q: 'image15.jpeg', opts: ['image16.jpeg','image17.jpeg','image18.jpeg','image19.jpeg'] }, // figure series

  // QA (51-75)
  52: { q: 'image20.png', opts: ['','','',''] },   // bar chart
  53: { q: '', opts: ['image21.jpeg','image22.jpeg','image23.png','image24.jpeg'] },  // algebra opts
  58: { q: '', opts: ['image26.jpeg','image27.jpeg','image28.jpeg','image29.jpeg'] }, // loss opts
  59: { q: '', opts: ['image30.jpeg','image31.jpeg','image32.jpeg','image33.jpeg'] }, // mean proportional opts
  60: { q: '', opts: ['image34.png','image35.png','image36.png','image37.png'] },     // days work opts
  65: { q: 'image39.jpeg', opts: ['','','',''] },  // Q15 figure
  69: { q: '', opts: ['image41.png','image42.png','image43.png','image44.png'] },     // Q19 image opts

  // ENG
  87: { q: 'image46.jpeg', opts: ['','','',''] }  // ENG Q12 jumbled sentences figure
};

// Answer key auto-decoded from inline green-tick bullets
const KEY = [
  // REA (1-25)
  1, 4, 2, 2, 1,   4, 3, 1, 1, 4,   3, 3, 4, 3, 3,   1, 2, 4, 2, 2,   3, 2, 4, 4, 1,
  // GA (26-50)
  1, 1, 1, 2, 4,   1, 3, 1, 1, 3,   3, 3, 4, 4, 3,   3, 3, 3, 3, 1,   4, 3, 4, 4, 4,
  // QA (51-75)
  4, 4, 3, 4, 1,   2, 3, 1, 2, 3,   3, 3, 2, 3, 4,   3, 2, 4, 4, 2,   2, 2, 2, 4, 2,
  // ENG (76-100)
  3, 1, 2, 3, 4,   2, 1, 2, 3, 1,   3, 4, 3, 3, 1,   3, 1, 4, 3, 3,   3, 1, 1, 4, 2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Select the option figure in which the given figure is embedded as its part (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: REA, q: "Six numbers 1, 2, 3, 4, 5 and 6 are written on different faces of a dice. Two positions of this dice are shown in the following figure. Find the number on the face opposite to 2.", o: ["6","5","4","1"], e: "Per docx answer key, option 2 (5)." },
  { s: REA, q: "Family-relation puzzle: '$' mother, '#' father, '!' sister, '@' brother, '*' wife, '>' husband, '%' father-in-law, '^' mother-in-law.\n\nGiven (a) 'P > Q $ R > S ! T', (b) 'U # T', (c) 'R # A', how is U related to A?", o: ["Mother's brother","Mother's father","Father","Son"], e: "Per docx answer key, option 2 (Mother's father)." },
  { s: REA, q: "In a certain code language, 'QUOD' is written as 'GCIT' and 'CRY' is written as 'UFY'. How will 'QUIP' be written in that language?", o: ["GCOH","GHCO","GCHO","GHOC"], e: "Per docx answer key, option 1 (GCOH)." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. Autorickshaw  2. Car  3. Train  4. Bicycle  5. Bus", o: ["3, 1, 2, 5, 4","2, 4, 3, 1, 5","1, 5, 2, 4, 3","4, 1, 2, 5, 3"], e: "Slowest to fastest (or smallest to largest): Bicycle(4), Autorickshaw(1), Car(2), Bus(5), Train(3). Option 4." },
  { s: REA, q: "Letter-cluster analogy.\n\nONGOING : HOIOHOO :: PROJECT : UDEKOSQ :: REPORTS : ?", o: ["TUSOQFS","TUSPQFS","TUSOQES","TUSPQES"], e: "Per docx answer key, option 3 (TUSOQES)." },
  { s: REA, q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: REA, q: "In a code language some statements:\n1. 'Economy growth level down' = '77 42 11 36'\n2. 'Slow percentage rate range' = '55 91 23 82'\n3. 'Economy growth rate index range' = '77 64 91 11 82'\n4. 'Economy range level down' = '36 11 42 82'\nWhat is the code for 'Growth'?", o: ["77","64","55","42"], e: "Economy appears in 1,3,4; common = 11. From #3 'index' = 64 (new). Growth in #1,#3: codes in #1 = {77,42,11,36}; in #3 = {77,64,91,11,82}. Common = {77,11}. 11 = Economy → Growth = 77. Option 1." },
  { s: REA, q: "In a certain code language, 'DESTROY' is written as 'DYORTSE' and 'EFFECTS' is written as 'ESTCEFF'. How will 'FOUNDED' be written in that language?", o: ["FOEDDNU","DFOUNDE","DEDNUOF","FDEDNUO"], e: "Per docx answer key, option 4 (FDEDNUO)." },
  { s: REA, q: "A and C are sisters. A is the daughter of D. D is the mother of B. How is A related to B?", o: ["Mother","Grand Mother","Sisters","Aunt"], e: "A is D's daughter; B is D's child; so A and B are siblings (A is female → sister). Option 3." },
  { s: REA, q: "Radha visits her brother Rohan, who stays with their father Prasant, mother Sarala and grandfather Raghuvir. Rohan has two children, Binny and Champak. Binny's husband is Keshab, and Champak's wife is Tina. Tina's daughter helped Radha to find their home. How is Tina's daughter related to Rohan?", o: ["Son's son","Daughter","Son's daughter","Son"], e: "Tina is wife of Champak (Rohan's son). Tina's daughter is Rohan's son's daughter. Option 3." },
  { s: REA, q: "Which two signs should be interchanged to make the given equation correct?\n\n36 + 8 ÷ 184 − 23 × 10 = 90", o: ["− and +","÷ and ×","+ and ×","× and −"], e: "Per docx answer key, option 4 (× and − swap)." },
  { s: REA, q: "The position of how many letters will change if each of the letters in the word CUSHION is arranged in alphabetical order?", o: ["Five","Two","Six","Three"], e: "CUSHION → CHINOSU (alpha). C stays, others move. Per docx, option 3 (Six)." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nAll boxes are squares. All squares are rectangles. All rectangles are figures.\n\nConclusions:\nI. All boxes are figures.\nII. All squares are figures.", o: ["Only conclusion II follows.","Neither conclusion I nor II follows.","Both conclusions I and II follow.","Only conclusion I follows."], e: "Boxes ⊆ squares ⊆ rectangles ⊆ figures → both I and II follow. Option 3." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nCat : Kitten :: Lion : ?", o: ["Cub","Infant","Shoal","Fawn"], e: "Young of cat = kitten; young of lion = cub. Option 1." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n3, 14, 20, 31, ?, 48", o: ["41","37","40","39"], e: "Differences +11,+6,+11,+6,+11 → 31+6 = 37. Option 2." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\n\n_AT_RLA_ERL__E__A_ER", o: ["TLERLTLR","LTERRLET","TTRLETLR","LETATRLT"], e: "Per docx answer key, option 4." },
  { s: REA, q: "Letter-cluster analogy.\n\nPORTRAY : YARTROP :: CONCEPT : TPECNOC :: REGULAR : ?", o: ["RRALUGE","RALUGER","RAULGER","RALUEGR"], e: "Reverse the word: REGULAR → RALUGER. Option 2." },
  { s: REA, q: "Select the option that represents the letters that when sequentially placed in the blanks below will complete the letter series.\n\nS_P__G_IS G_I__PI", o: ["GIPSSPG","GISPPSG","SISPSPG","SISSSPG"], e: "Per docx answer key, option 2 (GISPPSG)." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nI. All tables are charts.\nII. Some charts are graphs.\nIII. Some graphs are pies.\n\nConclusions:\nI. No table is a graph.\nII. Some pies are charts.", o: ["Only conclusion I follows","Only conclusion II follows","Neither conclusion I nor II follows","Both conclusions I and II follow"], e: "Per docx answer key, option 3 (neither follows)." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nI. Some tables are chairs.\nII. All desks are chairs.\nIII. No chair is a fan.\n\nConclusions:\nI. Some desks are tables.\nII. Some fans are desks.", o: ["Both conclusions I and II follow","Neither conclusion I nor II follows","Only conclusion II follows","Only conclusion I follows"], e: "Some tables-chairs and desks-chairs don't link directly. No chair is fan + desks⊆chairs → no fan is desk. Neither follows. Option 2." },
  { s: REA, q: "The numbers in each set are related to each other in a certain way.\n\n(2, 8, 100), (7, 2, 81), (4, 7, ?)\n\nBased on the relationship among the numbers in the first two sets, select the number that can replace the question mark (?) in the third set.", o: ["112","98","124","121"], e: "Pattern: (a+b)² = 3rd. (2+8)²=100; (7+2)²=81; (4+7)²=121. Option 4." },
  { s: REA, q: "Arrange the following countries according to world map from East to West.\n\n1. Canada  2. Japan  3. India  4. Uzbekistan  5. Germany  6. Malaysia", o: ["2, 6, 4, 3, 1, 5","1, 5, 4, 3, 2, 6","1, 5, 4, 3, 6, 2","2, 6, 3, 4, 5, 1"], e: "Per docx answer key, option 4 (Japan, Malaysia, India, Uzbekistan, Germany, Canada)." },
  { s: REA, q: "In a certain code language, 'FEATURE' is coded as 1001010 and 'CANDID' is coded as 101101. How will 'HOLIDAY' be coded in the same language?", o: ["1010101","1010100","1011001","1001101"], e: "Per docx answer key, option 1 (1010101)." },

  // ============ GA (26-50) ============
  { s: GA, q: "The famous musician Vishnu Govind Jog is primarily associated with which of the following musical instruments?", o: ["Violin","Flute","Veena","Tabla"], e: "V G Jog was an eminent Hindustani violinist. Option 1." },
  { s: GA, q: "Who among the following wrote the book 'Long Walk to Freedom'?", o: ["Nelson Mandela","Mother Teresa","Barack Obama","Winston Churchill"], e: "'Long Walk to Freedom' is Nelson Mandela's autobiography. Option 1." },
  { s: GA, q: "If the recipient of Employee Provident Fund (EPF) withdrawal does not provide his PAN, TDS on the withdrawal will be ________, instead of the maximum marginal rate as per new budget of 2023.", o: ["20%","40%","30%","51%"], e: "Budget 2023 reduced TDS on non-PAN EPF withdrawals to 20%. Option 1." },
  { s: GA, q: "Who among the following was chosen by Shah Jahan as his successor to the Mughal throne?", o: ["Aurangzeb","Dara Shikoh","Shah Shuja","Murad Bakhsh"], e: "Shah Jahan favoured his eldest son Dara Shikoh. Option 2." },
  { s: GA, q: "Who was the first speaker of the Lok Sabha after India's Independence?", o: ["MA Ayyangar","M Ananthasayanam","Meira Kumar","Ganesh V Mavalankar"], e: "G V Mavalankar was the first Speaker of independent India's Lok Sabha. Option 4." },
  { s: GA, q: "Rickets is caused by deficiency of:", o: ["vitamin D","vitamin B","vitamin C","vitamin A"], e: "Vitamin D deficiency causes rickets. Option 1." },
  { s: GA, q: "Which of the following statements are true regarding the Ravana Phadi cave at Aihole?\n1. Nataraja is the important structure at this site.\n2. The Nataraja image is surrounded on the right by four large saptamatrikas and on the left by three large ones.\n3. The figures have slim, graceful bodies with long oval faces.\n4. The temple shows a distinct feature of Pandya architecture of mixing and incorporation of several styles.", o: ["1, 3 and 4","1, 2 and 4","1, 2 and 3","2, 3 and 4"], e: "Per docx answer key, option 3 (1, 2 and 3)." },
  { s: GA, q: "________ unemployment refers to the time lag between jobs when an individual is searching for a new job or is switching between jobs.", o: ["Frictional","Technological","Structural","Seasonal"], e: "Frictional unemployment is the transitional lag between jobs. Option 1." },
  { s: GA, q: "Which metallic element is called 'ferromagnetic' because of its strong attraction?", o: ["Iron","Aluminium","Gold","Molybdenum"], e: "Iron is the classic ferromagnetic metal. Option 1." },
  { s: GA, q: "In which of the following cities is the Agera festival celebrated?", o: ["Kolkata","Lucknow","Mumbai","Chennai"], e: "Agera Festival is celebrated in Mumbai. Option 3." },
  { s: GA, q: "The Greek ambassador Megasthenes was sent to the court of Chandra Gupta Maurya by which of the following Greek kings?", o: ["Antigonus","Antiochus","Seleucus I Nicator","Alexander"], e: "Seleucus I Nicator sent Megasthenes as ambassador. Option 3." },
  { s: GA, q: "Under Phase I of Mission COVID Suraksha, the Government of India had sanctioned an amount of ________, in November 2020.", o: ["₹1,000 crores","₹800 crores","₹900 crores","₹700 crores"], e: "Phase I of Mission COVID Suraksha sanctioned ₹900 crores. Option 3." },
  { s: GA, q: "Which glands help in digestion in the stomach?", o: ["Thyroid","Pineal","Pituitary","Gastric glands"], e: "Gastric glands in the stomach secrete digestive juices. Option 4." },
  { s: GA, q: "A western disturbance is the extra-tropical storm that brings rainfall over northeast India during winter. From which ocean does this disturbance originate?", o: ["East Siberian Sea","Arabian Sea","Coral Sea","Mediterranean Sea"], e: "Western Disturbances originate from the Mediterranean Sea. Option 4." },
  { s: GA, q: "In the context of British rule in India, who among the following Governor-Generals created a professional cadre of company servants making provisions for them for generous salaries?", o: ["Lord Mayo","Warren Hastings","Lord Cornwallis","Lord Dalhousie"], e: "Lord Cornwallis reformed the civil service and introduced higher salaries. Option 3." },
  { s: GA, q: "Who has been appointed as the new Chairperson of the New Delhi International Arbitration Centre in December 2022?", o: ["Justice Krishnendra Pratap Singh","Justice Vinod G Khandare","Justice Hemant Gupta","Justice Ajay Kumar"], e: "Justice Hemant Gupta was appointed Chairperson of IIAC (Dec 2022). Option 3." },
  { s: GA, q: "Which of the following is NOT a directive principle of international peace and security?", o: ["Encourage settlements of international disputes","Respect for international laws and treaty obligations","Create opportunities of employment for foreigners","Promotion of international peace and security"], e: "Article 51 of DPSP does not include employment for foreigners. Option 3." },
  { s: GA, q: "How many Lok Sabha seats are there for the state of Meghalaya?", o: ["One","Three","Two","Four"], e: "Meghalaya has 2 Lok Sabha seats. Option 3." },
  { s: GA, q: "McMahon Line is the boundary line between India and ________.", o: ["Sri Lanka","Pakistan","China","Nepal"], e: "McMahon Line separates Indian Arunachal Pradesh from China. Option 3." },
  { s: GA, q: "Sriharikota island is located in which of the following states?", o: ["Andhra Pradesh","Tamil Nadu","Odisha","West Bengal"], e: "Sriharikota (ISRO Satish Dhawan Space Centre) is in Andhra Pradesh. Option 1." },
  { s: GA, q: "In the context of British rule in India, who among the following became the first Governor-General after the post of Governor was elevated to Governor-General of Bengal?", o: ["Lord William Bentinck","Lord Canning","Lord Cornwallis","Warren Hastings"], e: "Warren Hastings was the first Governor-General of Bengal (1773). Option 4." },
  { s: GA, q: "'Sacred Games' is a novel written by which of the following writers?", o: ["Chetan Bhagat","Rohinton Mistry","Vikram Chandra","Amitav Ghosh"], e: "'Sacred Games' (2006) is by Vikram Chandra. Option 3." },
  { s: GA, q: "The Finance Commission of India consists of ________.", o: ["a Chairperson and five other members","a Chairperson and two other members","a Chairperson and three other members","a Chairperson and four other members"], e: "Finance Commission = Chairperson + four members. Option 4." },
  { s: GA, q: "Who unfurls the flag at Rajpath on the Republic Day?", o: ["The Prime Minister of India","The Chief of Defence Staff","The Chief Minister of Delhi","The President of India"], e: "The President of India unfurls the flag at Rajpath/Kartavya Path on Republic Day. Option 4." },
  { s: GA, q: "Which of the following is NOT one of the Rabi crops?", o: ["Mustard","Wheat","Barley","Cucumber"], e: "Cucumber is a Kharif/summer crop, not a Rabi crop. Option 4." },

  // ============ QA (51-75) ============
  { s: QA, q: "The selling price of 84 items is equal to the cost price of 105 items. What is the percentage of profit gained in the transaction?", o: ["21%","20%","28%","25%"], e: "84 SP = 105 CP → SP/CP = 105/84 = 1.25 → 25% profit. Option 4." },
  { s: QA, q: "The following table shows the % of marks obtained by three students in three different subjects in a school exam. Find the total marks obtained by Varun and Seema together in Science.", o: ["178","126","145","189"], e: "Per docx answer key, option 4 (189)." },
  { s: QA, q: "If x³ = 184 + y³ and x = 4 + y, then the value of (x + y) is (given that x > 0 and y > 0):", o: ["Option 1","Option 2","Option 3","Option 4"], e: "(4+y)³ = 184 + y³ → 12y² + 48y + 64 = 184 → y² + 4y − 10 = 0. Per docx, option 3." },
  { s: QA, q: "In a parallelogram ABCD, if vertices are in respective order and diagonals AC and BD intersect at O, then which of the following is NOT always correct?", o: ["△ABC ≅ △ADC","△BOC ≅ △AOD","△AOB ≅ △COD","△AOD ≅ △COD"], e: "Diagonals create 4 triangles, but △AOD ≅ △COD requires that the parallelogram be a rhombus. Option 4." },
  { s: QA, q: "△ABC is inscribed in a circle with centre O. If AB = 35 cm, BC = 12 cm and AC = 37 cm, then what is the circumradius of a triangle?", o: ["18.5 cm","14.5 cm","13.5 cm","16.5 cm"], e: "12² + 35² = 144 + 1225 = 1369 = 37². Right triangle; hypotenuse = diameter → R = 37/2 = 18.5. Option 1." },
  { s: QA, q: "Answer based on the figure shown.", o: ["decreased by 2.57%","increased by 1.57%","increased by 2.57%","decreased by 1.57%"], e: "Per docx answer key, option 2 (increased by 1.57%)." },
  { s: QA, q: "Rashi travelled a distance of 400 km at an average speed of 50 km/h. She covers the first half distance in the first lag in 2 hours, while she covers another lag at half the speed of that of the first lag in 1 hour. What is the speed (in km/h) of the remaining distance?", o: ["45","50","30","60"], e: "Per docx answer key, option 3 (30)." },
  { s: QA, q: "Two articles were sold for Rs.3,000 each, with no loss and profit in the entire transaction. If one was sold at a profit of 25%, then the loss incurred on the second article is ________.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "CP1 = 3000/1.25 = 2400. Net CP = 6000 = SP. So CP2 = 6000 − 2400 = 3600. Loss = 600/3600 = 16.67%. Per docx, option 1." },
  { s: QA, q: "What is the mean proportional of 45x⁴ and 5y²?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mean proportional = √(45x⁴ × 5y²) = √(225x⁴y²) = 15x²y. Per docx, option 2." },
  { s: QA, q: "3 men can finish a work in 10 days, 4 women can finish it in 12 days and 10 qualified workers can finish it in 6 days. In how many days is the work finished by 4 men, 4 women and 4 qualified workers, working together every day?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "1 man = 1/30, 1 woman = 1/48, 1 worker = 1/60. Per day = 4/30+4/48+4/60. Per docx, option 3." },
  { s: QA, q: "A person, while trading the shares of a particular company, observes that its price has gone down by 10% from the previous day. In anticipation of increment on the next day, he holds it for the next day. But the share price further falls down by another 8% of the previous day. Then he sells his shares and gets ₹12,420. How much could he have saved had he sold it the previous day?", o: ["₹1,260","₹1,220","₹1,080","₹1,140"], e: "After 10%: P×0.9. After further 8%: P×0.9×0.92 = 12420 → P = 15000. Previous day SP = P×0.9 = 13500. Saving = 13500 − 12420 = 1080. Option 3." },
  { s: QA, q: "Simplify the following.\n\n(x − 3y)³ + 27(y³ − xy²)", o: ["x³ − 27y³ − 9x²y","x³ − 3x²y","x³ − 9x²y","x³ − 27y³ − 9x²y + 27xy² + 27y² − 27y²"], e: "(x−3y)³ = x³ − 9x²y + 27xy² − 27y³. + 27y³ − 27xy² = x³ − 9x²y. Option 3." },
  { s: QA, q: "Answer based on the figure shown.", o: ["112","95","75","45"], e: "Per docx answer key, option 2 (95)." },
  { s: QA, q: "The ages of A and B are in the ratio 4 : 7, respectively. After 8 years, the ratio of their ages will be 2 : 3. What is the sum of the ages of A and B (in years)?", o: ["38","42","44","36"], e: "4x and 7x. (4x+8)/(7x+8) = 2/3 → 12x+24 = 14x+16 → x = 4. Sum = 11×4 = 44. Option 3." },
  { s: QA, q: "Answer based on the figure shown.", o: ["₹19,220","₹19,230","₹19,210","₹19,200"], e: "Per docx answer key, option 4 (₹19,200)." },
  { s: QA, q: "On a machine there is 12% trade discount on the marked price of ₹2,56,000, but the machine is sold for ₹2,05,000 after giving a cash discount. How much is this cash discount (in %)? (Rounded to the nearest whole number)", o: ["10%","8%","9%","12%"], e: "After 12% trade discount: 256000×0.88 = 225280. Cash discount = (225280−205000)/225280×100 ≈ 9.00%. Option 3." },
  { s: QA, q: "P drives a car for 5 hours and after every hour he doubles the speed. In the fifth hour, his speed is 128 km/h. What is his average speed of the journey in km/h?", o: ["55.6","49.6","62.6","52.6"], e: "Speeds: 8, 16, 32, 64, 128 (doubling backwards). Avg = (8+16+32+64+128)/5 = 248/5 = 49.6 km/h. Option 2." },
  { s: QA, q: "The number 1254216 is divisible by which of the following numbers?", o: ["5","16","11","8"], e: "1254216: last 3 digits 216, ÷8 = 27 ✓. Option 4." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: QA, q: "Pipes A and B can fill a tank in 18 hours and 27 hours, respectively, whereas pipe C can empty the full tank in 54 hours. All three pipes are opened together, but pipe C is closed after 12 hours. In how much time (in minutes) will the one-third of the remaining part of the tank be filled by A and B together?", o: ["36","24","15","30"], e: "Together (A+B−C) rate = (3+2−1)/54 = 4/54 = 2/27 per hour. In 12h fills 24/27 = 8/9. Remaining = 1/9. (1/3)(1/9) = 1/27. A+B = 5/54 per hour → time = (1/27)/(5/54) = 2/5 h = 24 min. Option 2." },
  { s: QA, q: "Answer based on the figure shown.", o: ["5540 mm²","5544 mm²","5542 mm²","5546 mm²"], e: "Per docx answer key, option 2 (5544 mm²)." },
  { s: QA, q: "Veena and Karmesh were at different places in Delhi. They fixed a meeting point to meet to settle some issue. Veena started her journey at 8:00 a.m. from place A and reached place B at 4:00 p.m. and Karmesh started moving from place B 2 hours later than the time Veena started and could reach place A at 5:00 p.m. the same day, via the same route. At what time will Karmesh and Veena meet each other?", o: ["1:24 p.m.","12:48 p.m.","1:46 p.m.","1:00 p.m."], e: "Per docx answer key, option 2 (12:48 p.m.)." },
  { s: QA, q: "What is the average of the first 10 prime numbers?", o: ["12.1","12.9","13.1","13.9"], e: "Primes: 2,3,5,7,11,13,17,19,23,29 = sum 129 / 10 = 12.9. Option 2." },
  { s: QA, q: "The difference between the simple interest on a sum of money for 3½ years at the rate of 12% per annum and simple interest on the same sum of money for 4½ years at 10% per annum is ₹360. Find the sum (in ₹).", o: ["14,000","10,000","16,000","12,000"], e: "P(0.12×3.5) − P(0.10×4.5) = 360 → 0.42P − 0.45P = 360. Negative — so taking absolute: P(0.45−0.42) = 360 → 0.03P = 360 → P = 12000. Option 4." },
  { s: QA, q: "Which of the following numbers is divisible by 36?", o: ["8840","55512","1542","96272"], e: "55512: 5+5+5+1+2 = 18 ÷9 ✓; last 2 = 12 ÷4 ✓ → divisible by 36. Option 2." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined word in the following sentence with its ANTONYM.\n\nThe teacher filled the students' minds with pessimistic thoughts about their futures.", o: ["discouraging","cynical","bright","desperate"], e: "Pessimistic ↔ Bright (optimistic). Option 3." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nLiable to be easily broken", o: ["Brittle","Amateur","Tenacious","Precious"], e: "Brittle = easily broken. Option 1." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment.\n\nRuby fell victim to the green eyed monster.", o: ["flattery","jealousy","hatred","love"], e: "'Green-eyed monster' = jealousy (Shakespeare's Othello). Option 2." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Weird","Vacuum","Seperate","Receive"], e: "'Seperate' is misspelled — correct is 'Separate'. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nHave they broken the car?", o: ["Have they been broken by the car?","Has they been broken by the car?","Have the car been broken by them?","Has the car been broken by them?"], e: "Present perfect interrogative passive: 'Has the car been broken by them?'. Option 4." },
  { s: ENG, q: "Select the most appropriate article to fill in the blank.\n\nRatan doesn't like _________ tea.", o: ["an","No article required","the","a"], e: "Uncountable 'tea' used generally → no article. Option 2." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom.\n\nThe boss of our organisation is considered a jack of all trades.", o: ["Doing several different jobs instead of specialising in one","Innocence about everything","Knowing nothing but boasting","Engaged in gambling"], e: "'Jack of all trades' = versatile but not specialised. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nAnita said, \"I am happy.\"", o: ["Anita was happy she said.","Anita said that she was happy.","She was happy said Anita.","I am happy said Anita."], e: "Direct present → indirect past: 'said that she was happy'. Option 2." },
  { s: ENG, q: "Select the sentence that does NOT have a spelling error.", o: ["Meet me in my office tommorrow.","Meet me in my office tomorow.","Meet me in my office tomorrow.","Meet me in my office tommorow."], e: "Correct spelling is 'tomorrow' (one m, one t, double r). Option 3." },
  { s: ENG, q: "Sentences of a paragraph — labelled A, B, C, D — are given below in jumbled order. Select the option that arranges the sentences in the correct logical order to form a meaningful and coherent paragraph.\n\nA. \"A brilliant story about death and the fear of death,\" said the original jacket blurb on Don DeLillo's 1985 novel, White Noise.\nB. The writer that inspired Netflix's latest hit, White Noise, is a dazzling chronicler of modern America.\nC. So this feels like a good time to look again at White Noise's author, and consider why Don DeLillo is one of the great novelists of our time.\nD. This month, Noah Baumbach's Netflix film, White Noise, dazzles its way on to our screens.", o: ["B, A, D, C","A, D, B, C","C, D, A, B","D, A, B, C"], e: "Per docx answer key, option 1 (B, A, D, C)." },
  { s: ENG, q: "Select the option that expresses the following sentence in active voice.\n\nTara's painting was stolen from the museum.", o: ["Tara's painting has been stolen from the museum.","Someone has stolen Tara's painting from the museum.","Someone stole Tara's painting from the museum.","Someone from the museum stole Tara's painting."], e: "Past passive → past active with unknown agent 'Someone stole'. Option 3." },
  { s: ENG, q: "Sentences/items of a paragraph are given as letters a–k. Arrange them in correct order to form a meaningful and coherent paragraph.", o: ["a, d, c, e, f, i, h, g, k, j, b","a, d, e, k, f, i, h, b, g, j, c","a, d, b, e, f, i, h, c, g, k, j","a, d, c, e, g, f, i, h, b, k, j"], e: "Per docx answer key, option 4 (a, d, c, e, g, f, i, h, b, k, j)." },
  { s: ENG, q: "Identify the error in the verb form in the following sentence and choose the correct sentence from the given options (Present Tense).\n\nEarth revolve around the sun.", o: ["Earth are revolve around the sun.","Earth revolved around the sun.","Earth revolves around the sun.","Earth has revolve around the sun."], e: "Earth (3rd person singular, universal truth) → 'revolves'. Option 3." },
  { s: ENG, q: "Select the idiom that means the same as the underlined segment in the given sentence.\n\nShe forgot to apply for her internship abroad due to the ongoing marriage preparations she had to help with and now that opportunity is lost.", o: ["Beat about the bush","Treading on thin ice","Missing the boat","Burning the midnight oil"], e: "'Missing the boat' = missing an opportunity. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nJack loves the Christmas break.", o: ["The Christmas break is loved by Jack.","The Christmas break was loved by Jack.","The Christmas break is being loved by Jack.","The Christmas break would loved by Jack."], e: "Present simple active 'loves' → passive 'is loved by'. Option 1." },
  { s: ENG, q: "Read the New Trend passage.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'hoping to create as (1)__________ as 500 jobs'", o: ["lot","more","many","much"], e: "'As many as' (countable). Option 3." },
  { s: ENG, q: "Read the New Trend passage.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'Peter Dalton, a 36-year-old businessman (2)__________ Liverpool'", o: ["in","from","to","up"], e: "'Businessman from Liverpool' (origin). Option 1 ('in' is acceptable; per key option 1)." },
  { s: ENG, q: "Read the New Trend passage.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'In 12 months' time, (3)__________ will be a further 200 jobs'", o: ["it","they","here","there"], e: "'There will be' is the standard existential construction. Option 4." },
  { s: ENG, q: "Read the New Trend passage.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'Peter Dalton is also (4)__________ to open a shop in New York'", o: ["been planning","plans","planning","planned"], e: "'Is planning to open' (present continuous). Option 3." },
  { s: ENG, q: "Read the New Trend passage.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'This project has (5)__________ me over four years to finalise'", o: ["took","taking","taken","been taking"], e: "Present perfect: 'has taken me over four years'. Option 3." },
  { s: ENG, q: "Read the Climate Change passage.\n\nWhat is one of the most important steps that can be taken to address climate change?", o: ["Burning more fossil fuels.","Investing in new coal power plants.","Reducing dependence on fossil fuels and investing in renewable energy.","Increasing meat consumption."], e: "Passage: 'transition to renewable energy sources... reducing our dependence on fossil fuels'. Option 3." },
  { s: ENG, q: "Read the Climate Change passage.\n\nWhich of the following is NOT a potential consequence of climate change, discussed in the passage?", o: ["Reduction in greenhouse gas emissions from human activities.","Increased frequency and intensity of extreme weather events.","Rise in global temperatures.","Disruption of agricultural systems."], e: "Reduction in GHG emissions is a solution, not a consequence. Option 1." },
  { s: ENG, q: "Read the Climate Change passage.\n\nHow can individuals contribute to reducing their carbon footprint?", o: ["By reducing energy consumption at home","By increasing meat consumption","By using private transportation instead of public transport","By not recycling waste products"], e: "Passage: 'reducing energy consumption at home'. Option 1." },
  { s: ENG, q: "Read the Climate Change passage.\n\nWhat is the central theme of the passage?", o: ["The importance of reducing meat consumption.","The impact of climate change on biodiversity.","The role of governments in reducing greenhouse gas emissions.","The need for a global response to climate change."], e: "Passage concludes 'requires a global response'. Option 4." },
  { s: ENG, q: "Read the Climate Change passage.\n\nWhich of the following is the most appropriate title for the passage?", o: ["The Importance of Renewable Energy","The Impact of Climate Change","Biodiversity Loss and Climate Change","Strategies for Adapting to Climate Change"], e: "Passage details impacts of climate change broadly. Option 2." }
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
      tags: ['SSC', 'Selection Post', 'Phase XII', 'Higher Secondary', 'PYQ', '2024'],
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Higher Secondary) - 21 June 2024 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2024, pyqShift: 'Shift-2',
    pyqExamName: 'SSC Selection Post Phase XII (Higher Secondary)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
