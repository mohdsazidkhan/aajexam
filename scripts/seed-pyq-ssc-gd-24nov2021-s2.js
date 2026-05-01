/**
 * Seed: SSC GD Constable PYQ - 24 November 2021, Shift-2 (100 questions)
 * Source: Oswaal SSC Constable (GD) Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per 2019/2021 SSC GD Tier-I pattern):
 *   - General Intelligence & Reasoning      : Q1-25  (25 Q)
 *   - General Knowledge & General Awareness : Q26-50 (25 Q)
 *   - Elementary Mathematics                : Q51-75 (25 Q)
 *   - English                               : Q76-100 (25 Q)
 *
 * Run with: node scripts/seed-pyq-ssc-gd-24nov2021-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC-GD-Constable/24-nov-2021/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-gd-24nov2021-s2';

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

const F = '24-nov-2021';
const IMAGE_MAP = {
  3:  { q: `${F}-q-3.png`,
        opts: [`${F}-q-3-option-1.png`,`${F}-q-3-option-2.png`,`${F}-q-3-option-3.png`,`${F}-q-3-option-4.png`] },
  4:  { q: `${F}-q-4.png` },
  11: { q: `${F}-q-11.png`,
        opts: [`${F}-q-11-option-1.png`,`${F}-q-11-option-2.png`,`${F}-q-11-option-3.png`,`${F}-q-11-option-4.png`] },
  23: { q: `${F}-q-23.png`,
        opts: [`${F}-q-23-option-1.png`,`${F}-q-23-option-2.png`,`${F}-q-23-option-3.png`,`${F}-q-23-option-4.png`] },
  25: { q: `${F}-q-25.png` },
  67: { q: `${F}-q-67.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  4,2,2,3,4, 1,2,2,4,3, 3,1,1,1,2, 3,3,3,4,1, 2,1,2,3,2,
  // 26-50 (GK)
  1,2,4,2,2, 3,4,3,3,4, 4,4,2,3,1, 4,3,1,4,2, 1,2,1,4,4,
  // 51-75 (Maths)
  1,2,1,2,4, 3,3,4,4,1, 2,3,2,1,4, 4,4,2,3,2, 3,1,4,2,3,
  // 76-100 (English)
  3,2,3,3,2, 4,2,2,3,3, 3,3,3,4,2, 4,2,4,1,1, 2,1,3,2,4
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence & Reasoning';
const GA  = 'General Knowledge & General Awareness';
const QA  = 'Elementary Mathematics';
const ENG = 'English';

const RAW = [
  // ============ General Intelligence & Reasoning (1-25) ============
  { s: REA, q: "Mira is the wife of Ketan. Chaitanya is the brother of Kapila, who is the wife of Sudeep. Rani is the mother of Ketan and the wife of Surendra. Chaitanya is the son of Rani. How is Surendra related to Sudeep?", o: ["Son","Brother","Father","Father-in-law"], e: "Rani is mother of Ketan and Chaitanya. Chaitanya's sister Kapila is Sudeep's wife. So Surendra (Rani's husband) is Kapila's father, hence Sudeep's father-in-law." },
  { s: REA, q: "Statements:\n1. Some medicines are injections.\n2. No injection is an equipment.\n\nConclusions:\nI. No equipment is an injection.\nII. No medicine is an equipment.", o: ["Only conclusion II follows","Only conclusion I follows","None of the conclusions follow","Both the conclusions follow"], e: "No injection is an equipment → no equipment is an injection (I ✓). Some medicines are not injections, so 'no medicine is an equipment' is not certain (II ✗)." },
  { s: REA, q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 2 shows the correctly unfolded shape." },
  { s: REA, q: "A cube is made by folding the given sheet. In the cube so formed, what would be the symbol on the opposite side of the symbol '+'?", o: ["%","@","=","#"], e: "Opposite pairs from the unfolded cube: @–#, %–$, +–=. So '=' is opposite to '+'." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n1, 2, 2, 4, 8, 32, ?", o: ["64","40","16","256"], e: "Each term is the product of the previous two: 1×2=2, 2×2=4, 2×4=8, 4×8=32, 8×32=256." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n40, 76, 44, 70, 49, 64, 55, 58, ?", o: ["62","80","65","71"], e: "Two interleaved series. Odd-positioned: 40, 44, 49, 55, 62 (+4, +5, +6, +7). Even-positioned: 76, 70, 64, 58 (−6 each). Next = 62." },
  { s: REA, q: "Select the letter from among the given options that can replace the question mark (?) in the following series.\n\nG, K, O, S, W, A, ?", o: ["J","E","G","C"], e: "Each letter shifts by +4 (with wrap-around). G+4=K, K+4=O, O+4=S, S+4=W, W+4=A, A+4=E." },
  { s: REA, q: "In a certain code language, 'LEJ' is written as 'XJT' and 'FAME' is written as 'LBZJ'. How will 'CABLE' be written in that language?", o: ["HBDZJ","FBDXJ","DBCXF","XZYOJ"], e: "Each letter's position is doubled. C(3)→F(6), A(1)→B(2), B(2)→D(4), L(12)→X(24), E(5)→J(10). So FBDXJ." },
  { s: REA, q: "Six persons, P, Q, R, S, T and U, are watching a movie sitting in a line, all facing the north. S is sitting between P and Q. T is at second place to the left of P. R is third to the left of Q. Q is sitting at one of the corners. Who is sitting at the other corner?", o: ["S","R","T","U"], e: "Working through the constraints, the arrangement places U at the opposite corner from Q." },
  { s: REA, q: "'Majority' is related to 'Minority' in the same way as 'Natural' is related to '________'.", o: ["Nature","Fragrance","Artificial","Environment"], e: "Majority and Minority are antonyms; similarly, Natural and Artificial are antonyms." },
  { s: REA, q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The object moves half-step clockwise; outer rectangle has corner lines. Per the answer key, option 3 fits." },
  { s: REA, q: "Select the option in which the numbers are related in the same way as are the numbers in the given set.\n\n(9, 79, 7)", o: ["(15, 239, 14)","(24, 635, 25)","(20, 800, 40)","(12, 135, 18)"], e: "Pattern: (1st × 3rd) + (1st + 3rd) = 2nd. (9×7)+(9+7) = 63+16 = 79. (15×14)+(15+14) = 210+29 = 239. So {15, 239, 14}." },
  { s: REA, q: "Which two signs should be interchanged to make the given equation correct?\n\n12 × 14 ÷ 21 − 7 + 28 = 193", o: ["÷ and −","+ and ÷","+ and −","− and ÷"], e: "Interchanging ÷ and −: 12 × 14 − 21 ÷ 7 + 28 = 168 − 3 + 28 = 193 ✓." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\n\nL__R_T_MP_S__MP_ST", o: ["M, P, S, L, R, T, L, R","L, R, T, S, P, P, S, T","L, M, R, S, L, M, P, R","R, P, L, M, S, L, S, T"], e: "Filling in option 1 produces L M P R S T L M P R S T L M P R S T — the repeating pattern LMPRST." },
  { s: REA, q: "Select the option that is related to the fourth number in the same way as the first number is related to the second number and the fifth number is related to the sixth number.\n\n345 : 7 :: ? : 9 :: 66 : 4", o: ["514","731","445","651"], e: "Pattern: (2nd term)³ + 2 = 1st term. 7³+2 = 345. 4³+2 = 66. 9³+2 = 731." },
  { s: REA, q: "Select the correct mirror image of the given combination when the mirror is placed at the right side.\n\nGN21qK", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror at right flips left-right; characters reverse order. Per the answer key, option 3 fits." },
  { s: REA, q: "Four letter-clusters have been given, out of which three are alike in some manner and one is different. Select the letter-cluster that is different.", o: ["HLM","KOP","PRT","DHI"], e: "Pattern in three clusters: +4, +1 (HLM, KOP, DHI). PRT has +2, +2 — different pattern. PRT is the odd one out." },
  { s: REA, q: "P, Q, R, S, T, U, V and W are sitting anticlockwise around a circular table in the same sequence at equal distances between them. All are facing the centre. S is facing the south. Then V and Q interchange their positions. In which direction is Q sitting now?", o: ["South-east","North-east","South-west","North"], e: "With S facing south and the anticlockwise order, V's original position (south-west) becomes Q's after swap. So Q now faces south-west." },
  { s: REA, q: "An amount of ₹1,189 is to be divided among Rakesh, Mrinal and Sanjay in the ratio of 11 : 13 : 17. How much amount will Sanjay get more than Rakesh?", o: ["₹160","₹222","₹194","₹174"], e: "Total parts = 41. Sanjay = 1189×17/41 = 493. Rakesh = 1189×11/41 = 319. Difference = 174." },
  { s: REA, q: "In a certain code language, 'SOIL' is coded as '38301824'. How will 'DECIMAL' be coded in that language?", o: ["81061826224","41060928224","85161626224","81062028226"], e: "Each letter's position is doubled. S(19)→38, O(15)→30, I(9)→18, L(12)→24. DECIMAL: D(4)→8, E(5)→10, C(3)→6, I(9)→18, M(13)→26, A(1)→2, L(12)→24 → 81061826224 (concatenated)." },
  { s: REA, q: "Select the option that is related to the third term in the same way as the second term is related to the first term.\n\nORATOR : RQDSRQ :: TACKLE : ?", o: ["WYFMOC","WZFJOD","VYFJPQ","WZFLOF"], e: "Per the answer key, the same encoding rule applied to TACKLE gives WYFMOC (option 1). Hint: each letter shifts by +3, +1 alternating in opposite directions." },
  { s: REA, q: "In a certain code language, 'MANGOES' is written as 'AEGMNOS'. How will 'FRIEND' be written in that language?", o: ["DEFINR","RDHFNI","RFEIDN","UIRVMW"], e: "The letters of the word are arranged in alphabetical order. MANGOES sorted = AEGMNOS. FRIEND sorted = DEFINR." },
  { s: REA, q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 2 contains the embedded figure." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the given words in the order in which they appear in an English dictionary.\n\n1. Pegmatites  2. Persistence  3. Peroration  4. Percodan  5. Perfection", o: ["1, 3, 2, 4, 5","1, 4, 5, 2, 3","1, 4, 5, 3, 2","1, 3, 4, 5, 2"], e: "Dictionary order: Pegmatites, Percodan, Perfection, Peroration, Persistence → 1, 4, 5, 3, 2." },
  { s: REA, q: "In the diagram, circles stand for 'teachers', the rectangle stands for 'part-time workers', and the triangle stands for 'online educators'. The numbers represent the persons of that category. How many teachers are online educators and also part-time workers?", o: ["24","19","15","16"], e: "The intersection of all three classes (teachers ∩ part-time workers ∩ online educators) is 19." },

  // ============ General Knowledge & General Awareness (26-50) ============
  { s: GA, q: "A 'duopoly' is a type of oligopoly wherein ________ firms have dominant or exclusive control over a market.", o: ["two","five","four","three"], e: "A duopoly involves exactly two dominant firms controlling the market." },
  { s: GA, q: "Who among the following had laid the foundation of Lodi dynasty?", o: ["Ibrahim Lodi","Bahlul Lodi","Sikandar Lodi","Jalaluddin Lodi"], e: "Bahlul Khan Lodi founded the Lodi dynasty in 1451 after the decline of the Sayyid dynasty." },
  { s: GA, q: "Which team became the first IPL team to win the IPL title for the fifth time in 2020?", o: ["Delhi Capitals","Chennai Super Kings","Royal Challengers Bangalore","Mumbai Indians"], e: "Mumbai Indians won their fifth IPL title in 2020, becoming the first franchise to do so." },
  { s: GA, q: "According to Census 2011, which is the least populous state in India?", o: ["Arunachal Pradesh","Sikkim","Mizoram","Goa"], e: "Sikkim is the least populous state in India per Census 2011, with a population of about 6.10 lakh." },
  { s: GA, q: "Which of the following statements is CORRECT?", o: ["The sun is an example of an illuminated object.","A frying pan is an example of an opaque object.","A wooden box is an example of a luminous object.","An empty bottle made of clear glass is an example of a translucent object."], e: "A frying pan does not let light pass through, making it an opaque object. The other statements are incorrect." },
  { s: GA, q: "Which neighbouring country and India's boundary was ratified by The Constitution (100th Amendment) Act, 2015?", o: ["Bhutan","Myanmar","Bangladesh","Nepal"], e: "The 100th Constitutional Amendment Act, 2015 ratified the Land Boundary Agreement between India and Bangladesh." },
  { s: GA, q: "Which clause allows the government to breach its fiscal deficit target by 0.5% points at times of severe stress in the economy?", o: ["FAR clause","Guarantee clause","DEAR clause","Escape clause"], e: "The 'Escape clause' allows breaching the FRBM fiscal deficit target by up to 0.5 percentage points during severe stress." },
  { s: GA, q: "Annie Zaidi was awarded the Nine Dots Prize for the year ______.", o: ["2020-21","2021-22","2019-20","2018-19"], e: "Indian writer Annie Zaidi was awarded the Nine Dots Prize for the 2019-20 cycle for her essay 'Bread, Cement, Cactus'." },
  { s: GA, q: "Which of the following states is the 'Vinchhudo' dance primarily associated with?", o: ["Nagaland","Madhya Pradesh","Gujarat","Goa"], e: "'Vinchhudo' is a traditional folk dance of Gujarat." },
  { s: GA, q: "The natural tendency of objects to resist a change in their state of rest or of uniform motion is known as _______.", o: ["momentum","acceleration","force","inertia"], e: "Inertia is the property of matter by which it resists changes to its state of motion or rest." },
  { s: GA, q: "When government is lowering taxes and raising government spending, which kind of fiscal policy is it following?", o: ["Neutral Fiscal Policy","Contractional Fiscal Policy","Both, Contractional Fiscal Policy and Expansionary Fiscal Policy","Expansionary Fiscal Policy"], e: "Lowering taxes and raising government spending is the hallmark of expansionary fiscal policy, used to stimulate the economy." },
  { s: GA, q: "Kamala Harris, the first female Vice-President of the US, has family roots in the Indian state of:", o: ["Karnataka","Kerala","Andhra Pradesh","Tamil Nadu"], e: "Kamala Harris's mother Shyamala Gopalan was born in Chennai, Tamil Nadu." },
  { s: GA, q: "In which Indian city is one of the country's ancient lakes, the 'Lendiya Talab' located?", o: ["Chennai","Bhopal","Lucknow","Varanasi"], e: "Lendiya Talab, an ancient lake, is located in Bhopal, Madhya Pradesh." },
  { s: GA, q: "Who among the following players won the Women's Singles event at the French Open 2020?", o: ["Katie Boulter","Elina Svitolina","Iga Swiatek","Sofia Kenin"], e: "Iga Swiatek of Poland won the Women's Singles title at the 2020 French Open." },
  { s: GA, q: "Which of the following conspiracies was linked to the train robbery in 1925?", o: ["Kakori Conspiracy","Delhi Conspiracy","Peshawar Conspiracy","Muzaffarpur Conspiracy"], e: "The Kakori Conspiracy (Aug 1925) involved a train robbery near Kakori (UP) by HRA revolutionaries to fund their activities." },
  { s: GA, q: "The Fundamental Principles of the Olympic Charter are based on a document written by:", o: ["Leo Tolstoy","Aristotle","Muhammad Ali","Pierre de Coubertin"], e: "The Fundamental Principles of the Olympic Charter are based on a document by Pierre de Coubertin, founder of the modern Olympics." },
  { s: GA, q: "Deepa Malik is India's first female para-athlete to win a medal at the ______ Rio Paralympics.", o: ["2014","2018","2016","2015"], e: "Deepa Malik won a silver medal at the 2016 Rio Paralympics in the F-53 shot put." },
  { s: GA, q: "In which year did Subhash Chandra Bose escape from under British surveillance?", o: ["1941","1939","1932","1945"], e: "Subhas Chandra Bose escaped from under British surveillance in January 1941, leaving Calcutta and travelling to Germany via Afghanistan." },
  { s: GA, q: "Which is the first month of the Indian national calendar year beginning on 22 March, which is the day after the spring equinox?", o: ["Ashwin","Kartika","Phalguna","Chaitra"], e: "Chaitra is the first month of the Indian national (Saka) calendar, beginning on 22 March (or 21 March in leap years)." },
  { s: GA, q: "Which of the following is a chemical element with the atomic number 10?", o: ["Helium","Neon","Lithium","Carbon"], e: "Neon (Ne) has atomic number 10." },
  { s: GA, q: "With reference to the ancient history of India, which of the following sites is associated with the Ashoka Pillar?", o: ["Sanchi","Khajuraho","Chatru","Mandu"], e: "Sanchi is associated with the Ashoka Pillar (and the Great Stupa) — built during the reign of Emperor Ashoka." },
  { s: GA, q: "Rechna Doab is located between:", o: ["Ganga and Ghaghara rivers","Ravi and Chenab rivers","Beas and Sutlej rivers","Indus and Jhelum rivers"], e: "Rechna Doab lies between the Ravi and Chenab rivers in the Punjab region." },
  { s: GA, q: "With reference to the constitutional provisions regarding Rajya Sabha, which of the following statements is correct?", o: ["The Vice-president of India is ex officio Chairman of the Rajya Sabha.","The Attorney-General of India is ex officio Chairman of the Rajya Sabha.","The President of India is ex officio Chairman of the Rajya Sabha.","The Prime Minister of India is ex officio Chairman of the Rajya Sabha."], e: "Per Article 64, the Vice-President of India is the ex officio Chairman of the Rajya Sabha." },
  { s: GA, q: "When was the Fit India movement launched to encourage Indians to include fitness activities and sports in their daily lives to pave the way for a healthy and fit lifestyle?", o: ["June 2019","July 2019","September 2019","August 2019"], e: "The Fit India Movement was launched on 29 August 2019 by PM Narendra Modi." },
  { s: GA, q: "Who among the following took oath as Lieutenant Governor of Jammu and Kashmir in August 2020?", o: ["Farooq Khan","Satya Pal Malik","Girish Chandra Murmu","Manoj Sinha"], e: "Manoj Sinha took oath as the Lieutenant Governor of Jammu and Kashmir in August 2020." },

  // ============ Elementary Mathematics (51-75) ============
  { s: QA, q: "In a toy factory, a worker can assemble a toy in 5 minutes. If from 10:30 a.m. to 12:30 p.m. 1248 toys are to be assembled, then how many workers should be employed?", o: ["52","50","78","26"], e: "Time = 120 min. Toys per worker = 120/5 = 24. Workers needed = 1248/24 = 52." },
  { s: QA, q: "A dealer sold an article at a loss of 8%. Had he sold it for ₹72 more, he would have gained 16%. The cost price of the article was:", o: ["₹350","₹300","₹450","₹400"], e: "(116 − 92)% = 24% of CP = 72 → CP = 72×100/24 = ₹300." },
  { s: QA, q: "If the simple interest on a certain sum of money for 15 months at 9.6% per annum exceeds the simple interest on the same sum for 8 months at 11.4% by ₹1,320, then the sum is:", o: ["₹30,000","₹32,000","₹28,000","₹25,000"], e: "P×9.6×(15/12)/100 − P×11.4×(8/12)/100 = 1320 → P(0.12 − 0.076) = 1320 → P×0.044 = 1320 → P = 30,000." },
  { s: QA, q: "Two students A and B appeared in a class test. B scored 40% of the sum total of their marks, which is 7 less than the marks of A. How many marks did B score?", o: ["5","14","12","21"], e: "Let A=a, B=b. b = 0.4(a+b) → 0.6b = 0.4a → b = 2a/3. b = a − 7. So 2a/3 = a − 7 → a = 21, b = 14." },
  { s: QA, q: "The HCF and LCM of two numbers are 25 and 150 respectively. If one of the numbers is 50, then what is the sum of the two numbers?", o: ["100","175","75","125"], e: "Other number = (HCF × LCM)/given = (25×150)/50 = 75. Sum = 50 + 75 = 125." },
  { s: QA, q: "A shopkeeper buys a computer table for ₹5,500. What should be the marked price of the computer table such that even after allowing a 10% discount, he gains ₹1,070?", o: ["₹6,050","₹7,227","₹7,300","₹6,570"], e: "SP = 5500 + 1070 = 6570. SP = MP × 0.9 → MP = 6570/0.9 = 7300." },
  { s: QA, q: "Two solutions A and B of acid and water contain acid and water in the ratio 7 : 9 and 5 : 3 respectively. A and B are mixed in the ratio x : y. If the ratio of acid and water in the resulting solution is 9 : 7, then x : y is:", o: ["4 : 5","2 : 3","1 : 2","3 : 4"], e: "Acid fraction in A = 7/16, in B = 5/8 = 10/16, target = 9/16. By alligation: x:y = (10−9):(9−7) = 1:2." },
  { s: QA, q: "The price of a commodity has increased by 20%. The Gupta family reframed their monthly budget and plans to spend 8% more money on that particular commodity. By what percentage should they reduce its consumption so as to manage with the increased amount of money?", o: ["12","8","14","10"], e: "Let original price=100, qty=100, expense=10000. New price=120, new expense=10800. New qty = 10800/120 = 90. Reduction = 10%." },
  { s: QA, q: "A student walking at 5 km/h took 50 minutes, but reached the school 10 minutes later than the scheduled time. To reach school on time, the speed of the student should be:", o: ["6.5 km/h","25/6 km/h","6 km/h","25/4 km/h"], e: "Distance = 5 × 50/60 = 25/6 km. Required time = 50 − 10 = 40 min = 2/3 hr. Required speed = (25/6)/(2/3) = 25/4 km/h." },
  { s: QA, q: "If 62% of a number is equal to three-fifth of another number, then what is the ratio of the first number to the second number?", o: ["30 : 31","31 : 30","31 : 20","20 : 31"], e: "0.62 × A = 0.6 × B → A/B = 0.6/0.62 = 60/62 = 30/31." },
  { s: QA, q: "Four years ago, the average age of 45 employees in an office was 32 years. During this period 3 more persons joined the company and at present the average age of the company's employees is 37 years. What is the average age of the 3 new employees?", o: ["54 years 3 months","52 years","51 years","58 years"], e: "Total age 4 yrs ago = 45×32 = 1440. After 4 yrs, original 45 = 1440 + 4×45 = 1620. Total now = 48×37 = 1776. New 3 employees = 1776 − 1620 = 156. Avg = 52." },
  { s: QA, q: "The average of four 3-digit numbers 34x, 197, 6x4 and 348 is 386. What is the average of (3x + 1) and (7x − 2)?", o: ["26","23","24.5","25.5"], e: "Sum = 4 × 386 = 1544. (340+x) + 197 + (604+10x) + 348 = 1489 + 11x = 1544 → x = 5. Avg of (16, 33) = 24.5." },
  { s: QA, q: "A motorist travels a certain distance at an average speed of 48 km/h and returns at an average speed of 32 km/h. What is the average speed (in km/h) for the whole journey?", o: ["38","38.4","39.8","40"], e: "Average speed (round trip) = 2×48×32/(48+32) = 3072/80 = 38.4 km/h." },
  { s: QA, q: "Simplify the following expression.\n\n7 + 35 ÷ 7 × 5 of 6 − 1", o: ["156","132","12","179"], e: "Using BODMAS with 'of': 5 of 6 = 30. 35 ÷ 7 × 30 = 5 × 30 = 150. So 7 + 150 − 1 = 156." },
  { s: QA, q: "If the ratio of the base radii of a cylinder and a cone is 1 : 2 and that of their heights is 2 : 1, then what is the ratio of the volume of the cylinder to that of the cone?", o: ["2 : 3","1 : 1","2 : 1","3 : 2"], e: "V_cyl/V_cone = (πr₁²h₁)/((1/3)πr₂²h₂) = 3 × (1/4) × (2/1) = 3/2. So 3:2." },
  { s: QA, q: "The LCM of two numbers is 45 times their HCF, and the sum of the LCM and HCF is 1518. If one of the numbers is divided by 16, the quotient is 18 and the remainder is 9. What is the other number?", o: ["495","363","330","165"], e: "LCM=45×HCF, LCM+HCF=1518 → HCF=33, LCM=1485. First number = 16×18+9 = 297. Other = (HCF×LCM)/297 = (33×1485)/297 = 165." },
  { s: QA, q: "What is the value of the given expression? (Refer to figure)", o: ["7/2","21","19","22"], e: "Per the worked solution in the source, the simplified value is 22." },
  { s: QA, q: "A shopkeeper buys a budget for ₹1,125 after getting 25% discount. If he sells it by allowing 10% discount on the marked price, then how much does he gain?", o: ["₹150","₹225","₹325","₹250"], e: "MP = 1125/0.75 = 1500. SP = 1500×0.9 = 1350. Gain = 1350 − 1125 = 225." },
  { s: QA, q: "A man sells two mobile phones for ₹6,000 each, gaining 25% on one and losing 25% on the other. What is his gain or loss percent in whole transaction (up to two decimal places)?", o: ["Profit, 6.67","Loss, 6.67","Loss, 6.25","Profit, 6.25"], e: "When SPs are equal and gain%=loss%=x, overall loss% = x²/100 = 25²/100 = 6.25%." },
  { s: QA, q: "A certain sum amounts to ₹12,236 in 3 3/4 years at 8.8% p.a. at simple interest. What will be the simple interest (in ₹) on the same sum at the same rate in 4 3/8 years?", o: ["3,624","3,542","3,484","3,524"], e: "A = P(1 + RT/100). 12236 = P(1 + 8.8×15/4/100) = P × 1.33 → P = 9200. SI = 9200 × 8.8 × 35/8/100 = ₹3,542." },
  { s: QA, q: "A sum of ₹39,000 is divided among A, B, C such that A's share is 1/3 of B and B gets 20% more than C. A's share is:", o: ["₹9,000","₹7,500","₹6,000","₹8,000"], e: "Let C = 100, B = 120, A = 40. Ratio A:B:C = 40:120:100 = 2:6:5. Total = 13. A = 39000 × 2/13 = 6000." },
  { s: QA, q: "6 men and 8 women can complete as much work in a given time as 3 men and 13 women. If a man can complete a work in 12 days, then in how many days will 4 women be able to complete the same work?", o: ["5 days","8 days","4 days","20 days"], e: "6M + 8W = 3M + 13W → 3M = 5W → 1M = 5W/3. 1M does work in 12 days, so W's day work = 1/(12 × 5/3) = 1/20. 4W work = 4/20 = 1/5 → 5 days." },
  { s: QA, q: "A retailer buys a tracksuit for ₹850. His overhead expenses are ₹50. If he sells the tracksuit for ₹1,170, then what is his profit percentage?", o: ["20","25","22","30"], e: "Total CP = 850 + 50 = 900. Profit = 1170 − 900 = 270. Profit% = 270/900 × 100 = 30%." },
  { s: QA, q: "A sum of money becomes double in 5 years at compound interest rate. The same sum of money will be 4 times of itself in:", o: ["12 years","10 years","8 years","15 years"], e: "Doubles every 5 yrs. P→2P (5 yrs)→4P (10 yrs). So 10 years." },
  { s: QA, q: "The circumference of a circle of diameter 14 cm is the same as the perimeter of a square. The area of the square is (take π = 22/7).", o: ["400 cm²","256 cm²","121 cm²","289 cm²"], e: "Circumference = π × 14 = 44 cm. Square perimeter = 44, side = 11. Area = 121 cm²." },

  // ============ English (76-100) ============
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nI don't have some money at all.", o: ["few","No substitution required","any","little"], e: "In negative sentences, 'any' replaces 'some'. Correct: 'I don't have any money at all.'" },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nPrecarious", o: ["Safe","Insecure","Stable","Strange"], e: "Precarious means uncertain or unstable; synonym is 'Insecure'." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nI will / be in school / for / 7 a.m. to 2 p.m.", o: ["be in school","7 a.m. to 2 p.m.","for","I will"], e: "'for' should be 'from' — 'from 7 a.m. to 2 p.m.' indicates a duration between two specific times." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Hover","Dreary","Monark","Adorn"], e: "The correct spelling is 'Monarch'. 'Monark' is incorrect." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nI have been worked hard to finish this project.", o: ["No substitution required","have been working","working","had been worked"], e: "Present perfect continuous active form is required: 'I have been working hard to finish this project.'" },
  { s: ENG, q: "Select the correctly spelt word.", o: ["Harbore","Glossery","Premire","Orchestra"], e: "'Orchestra' is the correctly spelt word among the options." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nPlease ______ my subscription of the children's magazine.", o: ["settle","renew","finish","regain"], e: "'Renew' fits — meaning to extend the validity of a subscription." },
  { s: ENG, q: "The following sentence has been divided into parts. One of them may contain an error. Select the part that contains the error from the given options. If you don't find any error, select 'No error' as your answer.\n\nJyoti is one of / the best police officer / in this town.", o: ["No error","the best police officer","in this town","Jyoti is one of"], e: "'one of the best police officer' is incorrect. After 'one of the', the noun must be plural: 'the best police officers'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nObscure", o: ["Vague","Dim","Clear","Doubtful"], e: "Obscure means unclear/hidden. Its antonym is 'Clear'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nSpick and span", o: ["Safe and secure","Over and over again","Very neat and clean","Far from each other"], e: "'Spick and span' means very neat and clean." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA remedy for all diseases", o: ["Medicine","Treatment","Panacea","Diagnosis"], e: "A 'panacea' is a remedy or solution for all diseases or problems." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe company is going to ______ the North Sea for oil.", o: ["search","tour","explore","traverse"], e: "'Explore' is the right verb for searching/investigating an area for resources." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nReverence", o: ["Respect","Admiration","Awe","Contempt"], e: "Reverence means deep respect. The antonym is 'Contempt' (the feeling of having no respect)." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nDuring foggy weather, flights are often cancelled, isn't it?", o: ["do they","aren't they","No substitution required","haven't they"], e: "Tag question for 'flights are' is 'aren't they?' (subject-verb agreement)." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe police ______ the protestors from entering the parliament.", o: ["persuaded","presumed","protected","prevented"], e: "'Prevented' fits — police prevented (stopped) the protestors from entering." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA place where money is coined", o: ["Store","Mint","Factory","Industry"], e: "A 'mint' is a place where coins are manufactured." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nThe poet / and the author / is awarded / by the President.", o: ["by the President","The poet","and the author","is awarded"], e: "Two distinct subjects (the poet and the author) take a plural verb: 'are awarded' instead of 'is awarded'." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nNoble", o: ["Dignified","Poor","Ordinary","Normal"], e: "Noble means having high moral qualities or rank; synonym is 'Dignified'." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe sound made by bees", o: ["Buzz","Hiss","Moo","Coo"], e: "Bees make a buzzing sound. 'Buzz' is the one-word substitute." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nAt a snail's pace", o: ["Quickly","Very slowly","Peacefully","Carelessly"], e: "'At a snail's pace' means very slowly — like the slow movement of a snail." },
  { s: ENG, q: "Comprehension. Fill in blank 1.\n\nElephants regularly swarm to the landfill (1)______ near a wildlife sanctuary in Sri Lanka.", o: ["site","scene","scenery","sight"], e: "'Landfill site' is the standard term for a waste-disposal location. So 'site' fits." },
  { s: ENG, q: "Fill in blank 2.\n\n(2)______ with food scraps, they consume plastic, ...", o: ["Beside","Next","Along","Across"], e: "'Along with' is the standard collocation — meaning together with food scraps." },
  { s: ENG, q: "Fill in blank 3.\n\nThey consume plastic, (3)______ slowly kills them, officials say.", o: ["what","whom","which","who"], e: "'Which' refers to plastic (a thing). 'Plastic, which slowly kills them...' is the correct relative clause." },
  { s: ENG, q: "Fill in blank 4.\n\nImages (4)______ the elephants foraging through the waste ...", o: ["on","of","for","in"], e: "'Images of the elephants...' — the correct preposition with images is 'of'." },
  { s: ENG, q: "Fill in blank 5.\n\n... the waste (5)______ environmentalists.", o: ["are shocking","have been shocking","has shocked","have shocked"], e: "Subject 'images' is plural and the action describes a present perfect event ('have shocked' environmentalists)." }
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
      tags: ['SSC', 'GD', 'Constable', 'PYQ', '2021'],
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

  let exam = await Exam.findOne({ code: 'SSC-GD' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC GD Constable',
      code: 'SSC-GD',
      description: 'Staff Selection Commission - General Duty (GD) Constable',
      isActive: true
    });
    console.log(`Created Exam: SSC GD Constable (${exam._id})`);
  } else {
    console.log(`Found Exam: SSC GD Constable (${exam._id})`);
  }

  // Re-use the 2019 SSC GD Tier-I pattern (4 sections × 25 Q, 100 marks, 90 min, 0.25 negative).
  // The 2021 paper follows the same pattern.
  const PATTERN_TITLE = 'SSC GD Constable Tier-I (2019 Pattern)';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: PATTERN_TITLE,
      duration: 90,
      totalMarks: 100,
      negativeMarking: 0.25,
      sections: [
        { name: REA, totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25 },
        { name: GA,  totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25 },
        { name: QA,  totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25 },
        { name: ENG, totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  }

  const TEST_TITLE = 'SSC GD Constable - 24 November 2021 Shift-2';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /24 November 2021/i }
  });
  if (dropRes.deletedCount > 0) {
    console.log(`Dropped ${dropRes.deletedCount} prior copy of this PYQ.`);
  }

  console.log('\nUploading images to Cloudinary...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id,
    title: TEST_TITLE,
    totalMarks: 100,
    duration: 90,
    accessLevel: 'FREE',
    isPYQ: true,
    pyqYear: 2021,
    pyqShift: 'Shift-2',
    pyqExamName: 'SSC GD Constable',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
