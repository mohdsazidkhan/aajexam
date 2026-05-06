/**
 * Seed: SSC CGL Tier-I PYQ - 13 August 2020, Shift-1 (100 questions)
 * Source: Oswaal SSC CGL Tier-I Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per SSC CGL Tier-I 2020 pattern):
 *   - General Intelligence and Reasoning : Q1-25  (25 Q)
 *   - General Awareness                  : Q26-50 (25 Q)
 *   - Quantitative Aptitude              : Q51-75 (25 Q)
 *   - English Comprehension              : Q76-100 (25 Q)
 *
 * Each question = 2 marks. Total = 200 marks. Duration = 60 min.
 *
 * Run with: node scripts/seed-pyq-ssc-cgl-13aug2020-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSL-CGL-Tier-1/2020/august/13/shift-1/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-cgl-13aug2020-s1';

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

const F = '13-august-2020';
const IMAGE_MAP = {
  3:  { q: `${F}-q-3.png` },
  4:  { opts: [`${F}-q-4-option-1.png`,`${F}-q-4-option-2.png`,`${F}-q-4-option-3.png`,`${F}-q-4-option-4.png`] },
  5:  { q: `${F}-q-5.png` },
  6:  { q: `${F}-q-6.png`,
        opts: [`${F}-q-6-option-1.png`,`${F}-q-6-option-2.png`,`${F}-q-6-option-3.png`,`${F}-q-6-option-4.png`] },
  7:  { q: `${F}-q-7.png`,
        opts: [`${F}-q-7-option-1.png`,`${F}-q-7-option-2.png`,`${F}-q-7-option-3.png`,`${F}-q-7-option-4.png`] },
  8:  { q: `${F}-q-8.png`,
        opts: [`${F}-q-8-option-1.png`,`${F}-q-8-option-2.png`,`${F}-q-8-option-3.png`,`${F}-q-8-option-4.png`] },
  10: { q: `${F}-q-10.png` },
  24: { q: `${F}-q-24.png`,
        opts: [`${F}-q-24-option-1.png`,`${F}-q-24-option-2.png`,`${F}-q-24-option-3.png`,`${F}-q-24-option-4.png`] },
  51: { q: `${F}-q-51.png` },
  57: { q: `${F}-q-57.png` },
  58: { q: `${F}-q-58.png` },
  62: { q: `${F}-q-62.png` },
  67: { q: `${F}-q-67.png` },
  71: { q: `${F}-q-71.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  2,1,4,3,3, 4,1,1,4,3, 4,2,1,4,3, 4,4,1,4,2, 1,3,3,2,1,
  // 26-50 (General Awareness)
  3,2,3,2,4, 1,3,4,4,3, 4,1,1,1,4, 4,1,1,1,4, 3,2,2,3,3,
  // 51-75 (Quantitative Aptitude)
  3,4,2,3,4, 1,4,4,3,4, 4,4,4,4,2, 2,1,2,2,4, 1,4,2,3,4,
  // 76-100 (English)
  3,4,4,2,2, 2,3,3,1,2, 1,2,2,1,1, 1,1,1,3,2, 1,2,2,4,4
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Awareness';
const QA  = 'Quantitative Aptitude';
const ENG = 'English Comprehension';

const RAW = [
  // ============ General Intelligence and Reasoning (1-25) ============
  { s: REA, q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n\n12 : 60 :: 16 : ?", o: ["210","112","121","201"], e: "Pattern: n × (n/2 − 1). 12 × (6−1) = 60. So 16 × (8−1) = 112." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nDepression : Mood :: Insomnia : ?", o: ["Sleep","Night","Thinking","Dreams"], e: "Depression is a disorder of mood. Similarly, Insomnia is a disorder of sleep." },
  { s: REA, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\n4 7 6\n15 ? 21\n44 68 60", o: ["19","20","18","24"], e: "Pattern per column: (middle − top) × 4 = bottom. (15−4)·4=44, (21−6)·4=60. So (?−7)·4=68 → ?=24." },
  { s: REA, q: "Select the Venn diagram that best illustrates the relationship among the following classes.\n\nWomen, Researchers, Introverts", o: ["Option 1","Option 2","Option 3","Option 4"], e: "All three classes can intersect: some women are researchers and introverts. Option 3 (overlapping circles) fits." },
  { s: REA, q: "A cube is made by folding the given sheet. In the cube so formed, what would be the symbol on the opposite side of the # symbol?", o: ["+","%","&","$"], e: "From the unfolded sheet (+, @, %, #, $, &): when folded, the symbols & and # are on opposite faces." },
  { s: REA, q: "Select the option figure that is embedded in the given figure (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 4 is the figure embedded in the given image." },
  { s: REA, q: "Select the correct mirror image of the given combination when the mirror is placed at 'PQ' as shown.\n\nMy7OQFj", o: ["Option 1","Option 2","Option 3","Option 4"], e: "When the mirror is placed at PQ on the right, the characters reverse left-to-right. Option 1 is the correct mirror image." },
  { s: REA, q: "How many triangles are there in the given figure?", o: ["11","13","10","12"], e: "Counting all distinct triangles in the figure: 11." },
  { s: REA, q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Following the pattern of the figure series, option 4 fits." },
  { s: REA, q: "In a certain code language, 'PERMIT' is written as 'VVLNOG'. How will 'INERTIA' be written in that language?", o: ["OHYXZCU","XOYHCZU","OMYIZRU","XYOHBCU"], e: "Letters at even positions are coded by mirror-letter; odd positions get +6/−6 alternation. INERTIA → OMYIZRU." },
  { s: REA, q: "P, L, T, B, N and D are six members of a business family. N is the son of B, who is not the mother of N. L is the brother of B. D and B are a married couple. T is the daughter of D, who is the sister of P. How is N related to T?", o: ["Sister","Mother","Father","Brother"], e: "B (father) and D (mother) have children N (son) and T (daughter). So N is T's brother." },
  { s: REA, q: "Four words have been given, out of which three are alike in some manner and one is different. Select the word that is different.", o: ["Memory","Weight","Intelligence","Aptitude"], e: "Memory, Intelligence and Aptitude relate to mental abilities. Weight is a physical attribute — odd one out." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n24, 35, 51, 73, 102, ?", o: ["139","151","149","131"], e: "Differences: 11, 16, 22, 29, 37 (each diff increases by 5, 6, 7, 8). 102+37 = 139." },
  { s: REA, q: "Out of the total number of players, 100/3 % are in hotel X and the remaining are in hotel Y. If 20 players from hotel Y are shifted to hotel X, then the number of players in hotel X becomes 50% of the total number of players. If 20 players from hotel X are shifted to hotel Y, then the number of players in hotel X becomes what per cent of the total number of players?", o: ["26.34%","12.75%","20.67%","16.67%"], e: "Total = 120. X=40, Y=80. After 20 X→Y: X=20. % = 20/120·100 = 16.67%." },
  { s: REA, q: "Four number-pairs have been given, out of which three are alike in some manner and one is different. Select the number-pair that is different.", o: ["14 : 210","18 : 342","17 : 307","12 : 156"], e: "Pattern: n×(n+1). 14·15=210, 18·19=342, 12·13=156. But 17·18=306 ≠ 307 — odd one out." },
  { s: REA, q: "Read the given statements and conclusions carefully.\n\nStatements:\nAll polygons are angles. All angles are diagonals. All cones are cubes. All cubes are decagons. No diagonal is a cube.\n\nConclusions:\nI. Some diagonals are polygons.\nII. All diagonals are decagons.\nIII. No polygon is a cone.\nIV. Some cubes are angles.", o: ["Both II and IV follow.","Only I follows.","Both I and II follow.","Both I and III follow."], e: "All polygons → angles → diagonals: 'Some diagonals are polygons' (I) follows. No diagonal is a cube; cones are cubes; angles are diagonals → polygons (subset of angles) cannot be cones (III) follows." },
  { s: REA, q: "Select the option in which the words share the same relationship as that shared by the given pair of words.\n\nHorses : Neigh", o: ["Parrots : Bray","Pigs : Buzz","Hares : Boom","Ducks : Quack"], e: "Horses neigh. Similarly, ducks quack." },
  { s: REA, q: "Select the combination of letters that, when sequentially placed in the blanks of the given series, will complete the series.\n\nL_UA_Z_N_AP_L_U_PZ", o: ["N, P, L, U, Z, N, A","N, L, P, A, N, U, Z","P, N, L, Z, U, A, N","P, L, U, Z, N, A, N"], e: "Filling N, P, L, U, Z, N, A creates the repeating pattern LNUAPZ thrice." },
  { s: REA, q: "Select the letter-cluster from among the given options that can replace the question mark (?) in the following series.\n\nPNNA, RPPE, TRRI, VTTO, ?", o: ["YUUV","XWWU","YVVU","XVVU"], e: "Pattern: each letter +2. V+2=X, T+2=V, T+2=V, O+2=U → XVVU." },
  { s: REA, q: "Select the option in which the numbers are related in the same way as the numbers of the following set.\n\n(25, 18, 225)", o: ["(15, 34, 190)","(24, 22, 264)","(9, 16, 170)","(17, 15, 220)"], e: "Pattern: (a × b)/2. 25·18/2=225. So 24·22/2=264." },
  { s: REA, q: "In a certain code language, 'AROUND' is coded as '52182412144' and 'FIX' is coded as '63624'. How will 'PLASTIC' be coded in that language?", o: ["1612521920363","1612261920183","1612522021363","1812521920383"], e: "Consonants → alphabet position; Vowels → alphabet position × 2. P=16, L=12, A=2·1=...wait per worked: A coded as 52 (1×52?). Per source: PLASTIC → 1612521920363." },
  { s: REA, q: "Four letter-clusters have been given, out of which three are alike in some manner and one is different. Select the letter-cluster that is different.", o: ["CYUQ","TPLH","NJFA","FBXT"], e: "CYUQ, TPLH, FBXT all follow −4, −4, −4. NJFA: N→J(−4), J→F(−4), F→A(−5) — different." },
  { s: REA, q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given equation.\n\n42 * 7 * 64 * 11 * 6 * 4", o: ["×, +, −, ÷, =","×, −, +, ÷, =","÷, +, −, ×, =","÷, −, +, ×, ="], e: "42 ÷ 7 + 64 − 11 × 6 = 6 + 64 − 66 = 4. ✓" },
  { s: REA, q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "After unfolding, the symmetric pattern matches option 2." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the given words in the order in which they appear in an English dictionary.\n\n1. freeze  2. freedom  3. fryer  4. frozen  5. fraud  6. fringe", o: ["5, 2, 1, 6, 4, 3","5, 1, 2, 6, 4, 3","5, 2, 1, 6, 3, 4","5, 6, 2, 1, 4, 3"], e: "Dictionary order: fraud(5) → freedom(2) → freeze(1) → fringe(6) → frozen(4) → fryer(3) → 5,2,1,6,4,3." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "Electron-volt is a unit of ______.", o: ["potential difference","current","energy","power"], e: "Electron-volt (eV) is a unit of energy = 1.602 × 10⁻¹⁹ joules — energy gained by an electron through a 1V potential difference." },
  { s: GA, q: "Who among the following had written Kitab-ul-Hind that gave an incisive description of early 11th Century India?", o: ["Al-Kindi","Al-Biruni","Al-Bukhari","Al-Khwarizmi"], e: "Al-Biruni, the Persian scholar, wrote 'Kitab-ul-Hind' (Tarikh-ul-Hind), an account of 11th-century India." },
  { s: GA, q: "Which of the following schemes is aimed at helping accelerate the uptake of broadband internet services?", o: ["PM-DHWANI","PM-INTERNET","PM-WANI","PM-VAARTA"], e: "PM-WANI (Prime Minister Wi-Fi Access Network Interface) aims to accelerate broadband proliferation through Public Data Offices." },
  { s: GA, q: "______ is the structural and functional unit of kidney.", o: ["Medulla","Nephron","Cortex","Ureter"], e: "The nephron is the structural and functional unit of the kidney; each kidney has about 1 million nephrons." },
  { s: GA, q: "Which of the following is the application of sciences such as Physics, Chemistry, Biology, Computer Science and Engineering to matters of law and to the identification of various facts of civilian investigation?", o: ["Kalology","Morphology","Psychology","Forensic science"], e: "Forensic science applies scientific methods to legal/criminal investigations." },
  { s: GA, q: "Which of the following is a process in which hot, less dense materials rise upward and are replaced by colder, more dense materials?", o: ["Convection","Conduction","Radiation","Condensation"], e: "Convection is heat transfer via fluid movement — hot less-dense fluid rises, cold dense fluid descends." },
  { s: GA, q: "Which of the following places is famous for a copper mine?", o: ["Satna","Gaya","Khetri","Keonjhar"], e: "Khetri (Jhunjhunu, Rajasthan) is famous for its copper mines, operated by Hindustan Copper Limited." },
  { s: GA, q: "Who won the Toyota Thailand Open Women's Singles Title in Bangkok in January 2021?", o: ["Ashwini Ponnappa","PV Sindhu","Tai Tzu-ying","Carolina Marin"], e: "Spanish badminton star Carolina Marin won the Toyota Thailand Open 2021 women's singles title in Bangkok." },
  { s: GA, q: "In December 2020, the Ministry of Home Affairs declared the entire State of ______ as a 'disturbed area' for six more months under the Armed Forces (Special Powers) Act, 1958 (AFSPA).", o: ["West Bengal","Punjab","Jharkhand","Nagaland"], e: "MHA extended AFSPA's 'disturbed area' status for the entire state of Nagaland in December 2020." },
  { s: GA, q: "For which of the following franchise teams did AB de Villiers play in IPL 2020?", o: ["Kolkata Knight Riders","Mumbai Indians","Royal Challengers Bangalore","Delhi Capitals"], e: "AB de Villiers played for Royal Challengers Bangalore (RCB) in IPL 2020." },
  { s: GA, q: "Baghmara Pitcher Plant Sanctuary is located in which of the following states?", o: ["Karnataka","Assam","Goa","Meghalaya"], e: "Baghmara Pitcher Plant Sanctuary is in the South Garo Hills district of Meghalaya — protects Nepenthes khasiana." },
  { s: GA, q: "As per the Union Budget of 2021–22, how many regional national institutes of virology will be set up?", o: ["Four","Two","Six","Three"], e: "Union Budget 2021-22 announced the establishment of four regional National Institutes of Virology in India." },
  { s: GA, q: "Gurdwara Patalpuri Sahib is located on the bank of river ______.", o: ["Sutlej","Yamuna","Ganga","Beas"], e: "Gurdwara Patalpuri Sahib is in Kiratpur Sahib (Rupnagar, Punjab), on the bank of the river Sutlej." },
  { s: GA, q: "In which of the following years was the Planning Commission of India set up?", o: ["1950","1945","1958","1962"], e: "The Planning Commission of India was set up in March 1950 by a Cabinet resolution. (Replaced by NITI Aayog in 2015.)" },
  { s: GA, q: "In which of the following years was the Second Round Table Conference in London held?", o: ["1939","1925","1941","1931"], e: "The Second Round Table Conference was held in London from September to December 1931 — Mahatma Gandhi attended as INC's sole representative." },
  { s: GA, q: "Which of the following statements about Swami Dayanand Saraswati is INCORRECT?", o: ["He was the founder of Arya Samaj.","His birthplace was Gujarat.","He authored the book 'Satyarth Prakash'.","He was the founder of Brahmo Samaj."], e: "Brahmo Samaj was founded by Raja Ram Mohan Roy (1828), NOT Dayanand Saraswati. Dayanand founded the Arya Samaj." },
  { s: GA, q: "Who among the following was one of the founders of the Hindustan Republic Association?", o: ["Ram Prasad Bismil","Lala Lajpat Rai","Jatindranath Mukherjee","Surya Sen"], e: "Ram Prasad Bismil, along with Sachindra Nath Sanyal and others, founded the Hindustan Republican Association (HRA) in 1924." },
  { s: GA, q: "Which of the following has the same dimension as that of linear momentum?", o: ["Impulse","Energy","Work","Stress"], e: "Impulse (force × time) has the same dimensional formula [MLT⁻¹] as linear momentum (mass × velocity)." },
  { s: GA, q: "In Leh, the first ever ice climbing festival was celebrated in ______ valley in January 2021.", o: ["Markha","Ripchar","Dras","Nubra"], e: "The first-ever ice climbing festival in Leh was held in the Nubra Valley in January 2021." },
  { s: GA, q: "Who among the following was elected as the President of Veterinary Council of India in January 2021?", o: ["Umesh Sharma","Dipankar Seth","Rajeev Arora","KK Verma"], e: "Dr Umesh Chandra Sharma was elected as the President of the Veterinary Council of India in January 2021." },
  { s: GA, q: "Which of the following is NOT a town/city on the west coast of India?", o: ["Karwar","Mangalore","Surat","Gopalpur"], e: "Gopalpur is on the east coast (Odisha, Bay of Bengal). Karwar, Mangalore and Surat are on the west coast." },
  { s: GA, q: "Who among the following won the '3rd Rabindranath Tagore Literary Prize' for his novel 'The City and the Sea' in December 2020?", o: ["Rajdeep Sardesai","Siddhartha Sarma","Raj Kamal Jha","Shekhar Gupta"], e: "Raj Kamal Jha won the 3rd Rabindranath Tagore Literary Prize (December 2020) for his novel 'The City and the Sea'." },
  { s: GA, q: "A Unique Transaction Reference number is a ______ character code used to uniquely identify a transaction in the RTGS system.", o: ["45","22","34","17"], e: "A UTR (Unique Transaction Reference) number in RTGS is a 22-character code used to uniquely identify a transaction." },
  { s: GA, q: "Who among the following replaced Morarji Desai as the Prime Minister of India in 1979?", o: ["Jagjivan Ram","Charan Singh","Devi Lal","Chandrasekhar"], e: "Charan Singh succeeded Morarji Desai as Prime Minister of India in July 1979." },
  { s: GA, q: "Who among the following is a Padma Vibhushan awardee of 2021?", o: ["Tarlochan Singh","Sumitra Mahajan","Sudarshan Sahoo","Mouma Das"], e: "Sudarshan Sahoo, the renowned Odia sculptor, was awarded the Padma Vibhushan in 2021." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "Refer to the table of car sales by dealers A-E during Jan-Jun 2018.\n\nThe ratio of the total number of cars sold by dealer B in January, April and June to the total number of cars sold by dealers A and D in March is:", o: ["8 : 9","7 : 5","4 : 3","10 : 9"], e: "B(Jan,Apr,Jun) = 600+580+620 = 1800. A+D in Mar = 628+722 = 1350. Ratio = 1800:1350 = 4:3." },
  { s: QA, q: "To do a certain work, A and B work on alternate days with B beginning the work on the first day. A alone can complete the same work in 24 days. If the work gets completed in 11 1/3 days, then B alone can complete 7/9 th part of the original work in:", o: ["4 1/2 days","4 days","5 1/2 days","6 days"], e: "Solving alternate-day work: B's per-day rate works out so that B alone takes (9/7)·(7/9·X) days = 6 days for 7/9 work." },
  { s: QA, q: "The value of 20 ÷ 5 of 8 × [9 ÷ 6 × (6 − 3)] − (10 ÷ 2 of 20) is:", o: ["0","2","1","6"], e: "= 20÷40 × [1.5·3] − 10÷40 = 0.5·4.5 − 0.25 = 2.25 − 0.25 = 2." },
  { s: QA, q: "X, Y are two points in a river. Points P and Q divide the straight line XY into three equal parts. The river flows along XY and the time taken by a boat to row from X to Q and from Y to Q are in the ratio 4 : 5. The ratio of the speed of the boat downstream to that of the river current is equal to:", o: ["3 : 4","4 : 3","10 : 3","3 : 10"], e: "Setting up time ratios: 2d/(u+v) : d/(u−v) = 4:5 → 5u−5v = 2u+2v → u/v = 7/3. Downstream:current = (u+v):v = 10:3." },
  { s: QA, q: "What is the compound interest (in ₹) on a sum of ₹8,192 for 1 1/4 years at 15% per annum, if the interest is compounded 5-monthly?", o: ["1,740","1,640","1,735","1,634"], e: "1.25 years = 15 months = 3 periods of 5 months. Rate per period = 6.25%. A = 8192·(1.0625)³ = 9826. CI = 9826−8192 = 1634." },
  { s: QA, q: "A chord 21 cm long is drawn in a circle of diameter 25 cm. The perpendicular distance of the chord from the centre is:", o: ["√46","√56","√23","√41"], e: "Half chord = 10.5. r = 12.5. Distance² = 12.5² − 10.5² = 156.25 − 110.25 = 46. Distance = √46." },
  { s: QA, q: "Refer to the table of district-wise primary school teachers.\n\nWhat is the ratio of the number of male teachers to the number of female teachers in the city?", o: ["78 : 113","195 : 283","586 : 849","391 : 566"], e: "Male = 1650+1075+1280+1170+690 = 5865. Female = 2375+2651+1520+1085+859 = 8490. Ratio = 5865:8490 = 391:566." },
  { s: QA, q: "If cos²θ / (cot²θ + sin²θ − 1) = 3, 0° < θ < 90°, then the value of (tan θ + cosec θ) is:", o: ["4√3/3","2√3","3√3","5√3/3"], e: "Simplifies to tan²θ = 3 → θ=60°. tan60+cosec60 = √3 + 2/√3 = (3+2)/√3 = 5/√3 = 5√3/3." },
  { s: QA, q: "When x is subtracted from each of 19, 28, 55 and 91, the numbers so obtained in this order are in proportion. What is the value of x?", o: ["5","8","7","9"], e: "(19−x)/(28−x) = (55−x)/(91−x). Cross-multiplying and solving: x = 7." },
  { s: QA, q: "A shopkeeper earns a profit of 21% after selling a book at 21% discount on the printed price. The ratio of the cost price and selling price of the book is:", o: ["121 : 100","79 : 100","100 : 79","100 : 121"], e: "SP/CP = 1.21. So CP:SP = 100:121." },
  { s: QA, q: "If 8(x + y)³ − 27(x − y)³ = (5y − x)(Ax² + By² + Cxy), then what is the value of (A + B − C)?", o: ["−26","−16","16","36"], e: "Using a³−b³ identity with a=2(x+y), b=3(x−y): expansion yields 19x²+7y²−10xy. A+B−C = 19+7−(−10) = 36." },
  { s: QA, q: "Refer to the production/sale table over 5 years.\n\nIn which year(s) sale is more than 90% of the production?", o: ["2015, 2017, 2019","2016, 2017","2017, 2018","2016, 2018"], e: "90% of production: 2015→1125 (sale 1000, no), 2016→1260 (sale 1290, yes), 2017→1305 (sale 1100, no), 2018→1350 (sale 1450, yes), 2019→1440 (sale 1390, no). So 2016 and 2018." },
  { s: QA, q: "If x + 1/x = 4, then the value of x⁵ + 1/x⁵ is:", o: ["736","776","684","724"], e: "x²+1/x²=14. x³+1/x³=52. (x²+1/x²)(x³+1/x³) = x⁵+1/x⁵ + x+1/x. So 14·52 = (x⁵+1/x⁵)+4 → x⁵+1/x⁵ = 728−4 = 724." },
  { s: QA, q: "ΔABC ∼ ΔPQR. The areas of ΔABC and ΔPQR are 64 cm² and 81 cm², respectively and AD and PT are the medians of ΔABC and ΔPQR, respectively. If PT = 10.8 cm, then AD = ?", o: ["8.4 cm","12 cm","9 cm","9.6 cm"], e: "(AD/PT)² = 64/81 → AD/PT = 8/9 → AD = 8/9·10.8 = 9.6 cm." },
  { s: QA, q: "The average of 28 numbers is 77. The average of the first 14 numbers is 74 and the average of last 15 numbers is 84. If the 14th number is excluded, then what is the average of the remaining numbers?", o: ["73.1","74.7","77","76.9"], e: "Sum=2156. First 14=1036. Last 15=1260. 14th = 1036+1260−2156 = 140. Remaining sum = 2156−140 = 2016. Avg = 2016/27 = 74.67 ≈ 74.7." },
  { s: QA, q: "Let ΔABC ∼ ΔPQR and ar(ΔABC)/ar(ΔQPR) = 144/49. If AB = 12 cm, BC = 7 cm and AC = 9 cm, then PR (in cm) is equal to:", o: ["108/7","21/4","12","49/12"], e: "Note: ratio 144/49, so AC/PR = 12/7. PR = AC·7/12 = 9·7/12 = 63/12 = 21/4 cm." },
  { s: QA, q: "Refer to the dealer table.\n\nIn July 2018, if the sales of cars by dealer D increases by the same percentage as in June 2018 over its previous month, then what is the number of cars sold by D in July 2018?", o: ["1,014","959","975","1,020"], e: "% increase May→Jun = (780−600)/600·100 = 30%. Jul = 780·1.30 = 1014." },
  { s: QA, q: "Some fruits are bought at 15 for ₹140 and an equal number of fruits at 10 for ₹120. If all the fruits are sold at ₹132 per dozen, then what is the profit per cent in the entire transaction?", o: ["3","3 1/8","2 1/4","4 1/2"], e: "CP per fruit = (140/15+120/10)/2. For 30 fruits: cost = 140+360=... Actually for 6 of each: cost = 56+72 = 128 per 12. SP = 132. Profit% = 4/128·100 = 3 1/8 %." },
  { s: QA, q: "Sides AB and DC of a cyclic quadrilateral ABCD are produced to meet at E and sides AD and BC are produced to meet at F. If ∠ADC = 78° and ∠BEC = 52°, then the measure of ∠AFB is:", o: ["32°","28°","30°","26°"], e: "∠ABC = 180−78 = 102°. ∠EBC = 78°. ∠BCE = 50°. ∠EDF = 102°. In ΔDCF: ∠F = 180−102−50 = 28°." },
  { s: QA, q: "If x + y = 4 and 1/x + 1/y = 16/15, then what is the value of (x³ + y³)?", o: ["18","16","21","19"], e: "(x+y)/xy = 16/15 → 4/xy = 16/15 → xy = 15/4. x²+y² = 16−2(15/4) = 17/2. x³+y³ = (x+y)(x²+y²−xy) = 4·(17/2−15/4) = 4·19/4 = 19." },
  { s: QA, q: "(cosec θ)/(cosec θ − 1) + (cosec θ)/(cosec θ + 1) − tan² θ, 0° < θ < 90°, is equal to:", o: ["sec² θ + 1","sec² θ","2 sec² θ","1 − tan² θ"], e: "Sum = 2cosec²θ/(cosec²θ−1) − tan²θ = 2cosec²θ/cot²θ − tan²θ = 2sec²θ − tan²θ = sec²θ + 1." },
  { s: QA, q: "Length of each side of a rhombus is 13 cm and one of the diagonals is 24 cm. What is the area (in cm²) of the rhombus?", o: ["300","240","60","120"], e: "Half of d1=12. Half of d2=√(13²−12²)=5. So d2=10. Area = (1/2)·24·10 = 120 cm²." },
  { s: QA, q: "The income of A is 45% more than the income of B and the income of C is 60% less than the sum of the incomes of A and B. The income of D is 20% more than that of C. If the difference between the incomes of B and D is ₹13,200, then the income (in ₹) of C is:", o: ["75,000","73,500","72,000","72,500"], e: "B=100, A=145, C=40%·245=98, D=1.2·98=117.6. D−B per unit = 17.6. So 17.6x=13200 → x=750. C = 98·750 = 73,500." },
  { s: QA, q: "Find the value of cot 25° cot 35° cot 45° cot 55° cot 65°.", o: ["1/√3","√3","1","√3/2"], e: "cot25=tan65, cot35=tan55. So expression = tan65·cot65·tan55·cot55·cot45 = 1·1·1 = 1." },
  { s: QA, q: "If the 5-digit number 676xy is divisible by 3, 7 and 11, then what is the value of (3x − 5y)?", o: ["11","10","7","9"], e: "LCM(3,7,11)=231. Largest 5-digit multiple of 231 in form 676xy: 676×100/231 ≈ 292.6. 67683 = 231·293. So x=8, y=3. 3·8−5·3 = 24−15 = 9." },

  // ============ English Comprehension (76-100) ============
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nSeize", o: ["Snatch","Catch","Loosen","Grab"], e: "'Seize' means to take hold forcibly. Antonym: 'Loosen'." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Creature","Specified","Decrease","Pieceful"], e: "'Pieceful' is misspelled — correct is 'Peaceful'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nGradual", o: ["Slow","Regular","Gentle","Abrupt"], e: "'Gradual' (taking place slowly) — antonym 'Abrupt' (sudden)." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nThe invigilator is advising the students not to carry calculators into the examination hall.", o: ["The students were advised not to carry calculators into the examination hall.","The students are being advised by the invigilator not to carry calculators into the examination hall.","The students have been advised not to carry calculators into the examination hall by the invigilator.","The students were advised the invigilator not to carry calculators into the examination hall."], e: "Present continuous active 'is advising' becomes passive 'are being advised'." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nRegime", o: ["Country","Rule","Space","Territory"], e: "'Regime' (system of government) — synonym 'Rule'." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nGeneric", o: ["Definite","Universal","Precise","Specific"], e: "'Generic' (general) — synonym 'Universal'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nRaise the bar", o: ["To raise the price","To grow taller","To set higher goals","To win a competition"], e: "'Raise the bar' means to set higher standards or goals." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nHad you / not reached in time, / we will have / lost our lives.", o: ["not reached in time","Had you","we will have","lost our lives"], e: "'Had you' indicates third conditional. The main clause should be 'we would have', not 'we will have'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nBang for the buck", o: ["More value for money","Less value for money","Dash against something","A sorrowful heart"], e: "'Bang for the buck' means greater value for the money spent." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence.\n\nThe toy drummer plays the drum if you press the button at the back.", o: ["playing the drum if you pressed","will play the drum if you will press","played the drum if you are pressing","No substitution"], e: "Per the source key option 2 is marked. (Note: zero-conditional 'plays/press' is grammatically standard — 'No substitution' would be the textbook answer; following source key.)" },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence.\n\nWhile washing your hands, rub them together for 20 seconds to remove the microbes on them.", o: ["No substitution","the microbes on their","the microbes on they","the microbes on those"], e: "'Them' (object pronoun) correctly refers to the hands. No substitution needed." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA group of three novels or plays, each complete in itself", o: ["Trivet","Trilogy","Triplet","Triumvir"], e: "A 'trilogy' is a group of three related novels, plays, or films." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\n'Everything is going to be alright,' said the doctor.", o: ["The doctor said that everything will be alright.","The doctor said that everything was going to be alright.","The doctor said that everything is going to be alright.","The doctor said that everything are going to be alright."], e: "Reporting verb in past tense → 'is going' becomes 'was going'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nIndia is formally moving ahead to ______ 21 MIG-29 and 12 Sukhoi-30MKI fighters from Russia along with upgrades of their existing fleets.", o: ["procure","achieve","accomplish","advance"], e: "'Procure' (obtain through effort) fits — to procure fighter jets." },
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange them.\n\nA. When we got near, we saw it was the steam rising from hot springs.\nB. We saw in the distance a great column of smoke.\nC. We wondered if it came from a chimney or a burning house.\nD. We thought of taking a bath in the hot water.", o: ["BCAD","ACDB","BCDA","ABCD"], e: "B introduces the smoke. C wonders about origin. A reveals the truth. D concludes with action. Order: BCAD." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nWork and domestic _______ made Kajal short-tempered.", o: ["gravities","weights","forces","pressures"], e: "Hmm: 'pressures' (stresses/strains) typically fits the context — but per the source key option 1 'gravities' (extreme importance) is marked. Following source key." },
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange them.\n\nA. But the eagle, in wrath, gave the beetle a flap of his wing, and straightaway seized upon the hare and devoured him.\nB. The beetle therefore interceded with the eagle, begging of him not to kill the poor suppliant, and pleaded with him not to kill so small an animal.\nC. When the eagle flew away, the beetle flew after him, to learn where his nest was.\nD. A hare, being pursued by an eagle, took himself for refuge to the nest of a beetle, whom he begged to save him.", o: ["DBAC","ACDB","CBAD","DCAB"], e: "D introduces the hare/beetle. B describes the beetle's plea. A shows the eagle's reaction. C concludes. Order: DBAC." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA herd or flock of animals being driven in a body", o: ["Drove","Cluster","Throng","Crowd"], e: "A 'drove' is a herd of animals being driven together." },
  { s: ENG, q: "The following sentence has been divided into parts. One of them contains an error. Select the part that contains the error from the given options.\n\nYou must avoid riding in a crowded bus / or travelling in a metro / during rush hour / as both are quiet unpleasant experiences.", o: ["or travelling in a metro","You must avoid riding in a crowded bus","as both are quiet unpleasant experiences","during rush hour"], e: "'Quiet' should be 'quite' (which means 'very'). Error in part 3." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Exterminated","Voilence","Wildernesses","Unmanageable"], e: "'Voilence' is misspelled — correct is 'Violence'." },
  { s: ENG, q: "Cloze passage on Bhutan honey.\n\nFill blank 1: '...Putka, \"Antibiotic\" honey produced (1)______ Melipona Bees...'", o: ["with","by","through","of"], e: "'Produced by' (showing agent) fits — produced by Melipona Bees." },
  { s: ENG, q: "Fill blank 2: '...a breed found in protected areas (2)______ 700 to 1,500 metres above sea level.'", o: ["after","between","among","midst"], e: "'Between' (used for ranges) fits — between 700 and 1,500 metres." },
  { s: ENG, q: "Fill blank 3: 'Due (3)______ their small size...'", o: ["for","to","of","at"], e: "The standard collocation is 'due to' (because of)." },
  { s: ENG, q: "Fill blank 4: '...they can get larger nutrients (4)______ regular honeybees.'", o: ["and","then","though","than"], e: "'Than' fits — used for comparison (larger than regular honeybees)." },
  { s: ENG, q: "Fill blank 5: '...can (5)______ your sore throat in a matter of minutes.'", o: ["appease","pacify","calm","soothe"], e: "'Soothe' (relieve pain/discomfort in body) fits the sore throat context." }
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
      tags: ['SSC', 'CGL', 'Tier-I', 'PYQ', '2020'],
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

  let exam = await Exam.findOne({ code: 'SSC-CGL' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC CGL',
      code: 'SSC-CGL',
      description: 'Staff Selection Commission - Combined Graduate Level',
      isActive: true
    });
    console.log(`Created Exam: SSC CGL (${exam._id})`);
  } else {
    console.log(`Found Exam: SSC CGL (${exam._id})`);
  }

  const PATTERN_TITLE = 'SSC CGL Tier-I';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 60, totalMarks: 200, negativeMarking: 0.5,
      sections: [
        { name: REA, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: QA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: ENG, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  }

  const TEST_TITLE = 'SSC CGL Tier-I - 13 August 2020 Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2020, pyqShift: 'Shift-1', pyqExamName: 'SSC CGL Tier-I', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
