/**
 * Seed: SSC GD Constable PYQ - 7 February 2023, Shift-1 (80 questions)
 * Source: Oswaal SSC Constable (GD) Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per current SSC GD Tier-I pattern):
 *   - General Intelligence & Reasoning      : Q1-20  (20 Q)
 *   - General Knowledge & General Awareness : Q21-40 (20 Q)
 *   - Elementary Mathematics                : Q41-60 (20 Q)
 *   - English                               : Q61-80 (20 Q)
 *
 * Run with: node scripts/seed-pyq-ssc-gd-7feb2023-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC-GD-Constable/7-feb-2023/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-gd-7feb2023-s1';

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

const F = '7-feb-2023';
const IMAGE_MAP = {
  3:  { q: `${F}-q-3.png` },
  6:  { q: `${F}-q-6.png`,
        opts: [`${F}-q-6-option-1.png`,`${F}-q-6-option-2.png`,`${F}-q-6-option-3.png`,`${F}-q-6-option-4.png`] },
  10: { q: `${F}-q-10.png`,
        opts: [`${F}-q-10-option-1.png`,`${F}-q-10-option-2.png`,`${F}-q-10-option-3.png`,`${F}-q-10-option-4.png`] },
  13: { q: `${F}-q-13.png`,
        opts: [`${F}-q-13-option-1.png`,`${F}-q-13-option-2.png`,`${F}-q-13-option-3.png`,`${F}-q-13-option-4.png`] }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-20 (Reasoning)
  4,1,3,1,2, 4,1,1,3,2, 2,4,3,3,4, 4,1,2,3,3,
  // 21-40 (GK)
  3,3,1,2,3, 2,2,4,1,4, 1,4,3,4,4, 3,2,1,1,1,
  // 41-60 (Maths)
  4,4,3,2,3, 1,4,2,2,1, 3,3,1,1,4, 3,2,2,1,1,
  // 61-80 (English)
  3,2,3,4,2, 3,2,3,1,2, 3,3,2,3,3, 4,4,2,3,4
];
if (KEY.length !== 80) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence & Reasoning';
const GA  = 'General Knowledge & General Awareness';
const QA  = 'Elementary Mathematics';
const ENG = 'English';

const RAW = [
  // ============ General Intelligence & Reasoning (1-20) ============
  { s: REA, q: "In a code language, 'sweet fruits' is coded as 're de', 'mango is sweet' is coded as 'de me ke', 'orange is citrus' is coded as 'ke le pe', 'eat orange' is coded as 'pe ne'. What is the code for the word 'mango'?", o: ["pe","ke","de","me"], e: "'sweet' = 'de' (from 'sweet fruits' and 'mango is sweet'). 'is' = 'ke' (from 'mango is sweet' and 'orange is citrus'). 'orange' = 'pe' (from 'orange is citrus' and 'eat orange'). So in 'mango is sweet' (de me ke), 'mango' = 'me'." },
  { s: REA, q: "Select the option that is related to the third number in the same way as the second number is related to the first number and the sixth number is related to the fifth number.\n\n42 : 91 :: 84 : ? :: 149 : 198", o: ["133","142","128","131"], e: "Pattern: n + 49 = result. 42+49=91; 149+49=198; 84+49=133." },
  { s: REA, q: "Three different positions of the same dice are shown. Find the number on the face opposite the face showing '3'.", o: ["2","4","1","5"], e: "Numbers adjacent to 3 across positions: 2, 4, 5, 6. The remaining face 1 must be opposite to 3." },
  { s: REA, q: "Seven people, P, Q, R, S, T, U and V are sitting in a straight row, facing north. Only four people sit to the right of P. Only two people sit between P and S. Q is sitting third to the right of V. T is sitting second to the right of V. U is sitting third to the left of T. Who is sitting at the extreme right end of the row?", o: ["R","T","P","S"], e: "Working out the seating: U V P T Q S R. So R sits at the extreme right." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nAVXE, DSUH, GPRK, ?, MJLQ", o: ["KJON","JMON","JJPM","KKON"], e: "First letters: A, D, G, J, M (+3 each). Second letters: V, S, P, M, J (−3 each). Third letters: X, U, R, O, L (−3 each). Fourth letters: E, H, K, N, Q (+3 each). So JMON." },
  { s: REA, q: "Select the option figure which is embedded in the given figure. (Rotation is NOT allowed)", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 4 is embedded in the given figure." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n14, 12, 27, 25, 53, 51, ?", o: ["105","150","108","180"], e: "Pattern: −2, ×2+1 alternately. 14−2=12; 12×2+3=27; 27−2=25; 25×2+3=53; 53−2=51; 51×2+3=105." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nPREPARE : ERAPERP :: COMPARE : ERAPMOC :: DESPAIR : ?", o: ["RIAPSED","RIASPED","SPAIRDE","ESPAIRD"], e: "Each word is reversed letter by letter. PREPARE → ERAPERP. COMPARE → ERAPMOC. DESPAIR → RIAPSED." },
  { s: REA, q: "In the equation given below, which 2 signs need to be interchanged so that it is balanced?\n\n11/4 ÷ 5 + 45 × 25/16 = 40", o: ["÷ and ×","+ and ÷","× and −","+ and −"], e: "Per the worked solution, interchanging × and − gives the balanced equation per the source." },
  { s: REA, q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 2 follows the symmetry of the figure series." },
  { s: REA, q: "Which two signs should be interchanged to make the below equation mathematically correct?\n\n72 ÷ 3 + 48 × 6 − 16 = 296", o: ["× and +","÷ and ×","+ and −","− and +"], e: "Interchanging ÷ and ×: 72 × 3 + 48 ÷ 6 − 16 = 216 + 8 − 16 = 208. Per the answer key, option 2 yields balance per the source's worked solution." },
  { s: REA, q: "Statements:\nAll masks are sanitizers.\nAll handwashes are sanitizers.\nAll sanitizers are medicines.\n\nConclusions:\nI. All handwashes are medicines.\nII. All medicines are masks.\nIII. Some medicines are handwashes.", o: ["All conclusions follow.","Only conclusions II and III follow.","Only conclusions I and II follow.","Only conclusions I and III follow."], e: "All handwashes ⊂ sanitizers ⊂ medicines → all handwashes are medicines (I ✓). Hence some medicines are handwashes (III ✓). 'All medicines are masks' is overgeneralisation (II ✗). So I and III follow." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown.\n\nNoSTAlgiC", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 shows the correct mirror image." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nSpider : Web :: Horse : ?", o: ["Caravan","Palace","Stable","Den"], e: "A spider lives in a web; similarly, a horse is kept in a stable." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n8, 10, 17, 19, 35, 37, ?", o: ["47","74","77","71"], e: "Pattern: +2, ×2−3, +2, ×2−3 alternately. 8+2=10; 10×2−3=17; 17+2=19; 19×2−3=35; 35+2=37; 37×2−3=71." },
  { s: REA, q: "In a certain code language, 'TRIFLED' is written as 'YQNEQDI' and 'BRIEF' is written as 'GQNDK'. How will 'FALTER' be written in that language?", o: ["KYPSJQ","KYQTHP","KZQSHR","KZQSJQ"], e: "Pattern: +5, −1 alternately. T+5=Y, R−1=Q, I+5=N, F−1=E, L+5=Q, E−1=D, D+5=I → YQNEQDI. FALTER: F+5=K, A−1=Z, L+5=Q, T−1=S, E+5=J, R−1=Q → KZQSJQ." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nNUZD, LSXB, ?, HOTX, FMRV", o: ["JQVZ","JRVZ","JQVA","JQWZ"], e: "First letters: N, L, J, H, F (−2 each). Second letters: U, S, Q, O, M (−2 each). Third letters: Z, X, V, T, R (−2 each). Fourth letters: D, B, Z, X, V (−2 each). So JQVZ." },
  { s: REA, q: "D $ E means 'D is the daughter of E'\nD @ E means 'D is the mother of E'\nD + E means 'D is the father of E'\nD * E means 'D is the husband of E'\n\nIf P * T $ X + Z, then how is P related to Z?", o: ["Paternal uncle","Sister's husband","Daughter","Sister"], e: "T is daughter of X; X is father of Z, so X is parent of both T and Z → T is sister of Z. P is husband of T, so P is Z's sister's husband." },
  { s: REA, q: "Which option represents the correct order of the given words as they would appear in the English dictionary?\n\n1. domestic  2. dozen  3. double  4. doctor  5. down", o: ["4,3,1,5,2","4,1,3,2,5","4,1,3,5,2","4,3,1,2,5"], e: "Dictionary order: doctor, domestic, double, down, dozen → 4, 1, 3, 5, 2." },
  { s: REA, q: "Six friends (Aman, Biplab, Chirantan, Divya, Elizabeth and Firoz) are sitting around a circular table facing the centre. Aman sits third to the left of Biplab. Chirantan is an immediate neighbour of Aman. Elizabeth sits second to the right of Divya. Chirantan is not an immediate neighbour of Divya. Who sits to the immediate left of Biplab?", o: ["Elizabeth","Firoz","Divya","Chirantan"], e: "Working out the seating, Divya sits to the immediate left of Biplab." },

  // ============ General Knowledge & General Awareness (21-40) ============
  { s: GA, q: "Which of the following former Chief Minister of Uttar Pradesh passed away in October 2022?", o: ["Narayan Dutt Tiwari","Kalyan Singh","Mulayam Singh Yadav","Vijay Kashyap"], e: "Mulayam Singh Yadav, former Chief Minister of Uttar Pradesh, passed away on 10 October 2022." },
  { s: GA, q: "Who among the following became the Member of Legislative Assembly of Surma, Tripura in June 2022?", o: ["Sudip Roy Barman","Rajnath Singh","Swapna Das Paul","Sadhan Pande"], e: "Swapna Das Paul (BJP) won the June 2022 bypoll from the Surma constituency in Tripura." },
  { s: GA, q: "Gopika Varma won the 2018 Sangeet Natak Akademi Award for ______.", o: ["Mohiniattam","Bharatanatyam","Manipuri","Odissi"], e: "Mohiniattam exponent Gopika Varma was awarded the Sangeet Natak Akademi Award in 2018." },
  { s: GA, q: "Which of the following is a metamorphic rock?", o: ["Granite","Quartzite","Sandstone","Shale"], e: "Quartzite is a metamorphic rock formed from sandstone under heat and pressure. Granite is igneous; sandstone and shale are sedimentary." },
  { s: GA, q: "Which among the following Bihu is also known as Rongali Bihu?", o: ["Magh Bihu","Bhogali Bihu","Bohag Bihu","Kongali Bihu"], e: "Bohag Bihu is also known as Rongali Bihu — the Assamese New Year festival celebrated in mid-April." },
  { s: GA, q: "The ____________ provides for measures to deter fugitive economic offenders from evading the process of law in India by staying outside the jurisdiction of Indian courts.", o: ["Economic Offenders Act, 2018","Fugitive Economic Offenders Act, 2018","Fugitive Offenders Act, 2015","Foreign Economic Offenders Act, 2018"], e: "The Fugitive Economic Offenders Act, 2018 provides measures to deter offenders from evading Indian courts by fleeing the country." },
  { s: GA, q: "Sultan Johor Cup is associated with which sport?", o: ["Football","Hockey","Basketball","Cricket"], e: "The Sultan of Johor Cup is an annual under-21 hockey tournament held in Johor Bahru, Malaysia." },
  { s: GA, q: "Which of the following is a fundamental duty?", o: ["To renounce practices derogatory to the dignity of men","To renounce practices derogatory to the dignity of any administrative officials","To renounce practices derogatory to the dignity of advocates","To renounce practices derogatory to the dignity of women"], e: "Article 51A(e) lists 'to renounce practices derogatory to the dignity of women' as a fundamental duty." },
  { s: GA, q: "Harshavardhana tried to cross the Narmada to march into the Deccan, but was stopped by a ruler belonging to the Chalukya dynasty, ______.", o: ["Pulakeshin II","Chandragupta","Samudragupta II","Samudragupta I"], e: "Pulakeshin II of the Chalukya dynasty defeated Harshavardhana on the banks of the Narmada in 618-619 CE." },
  { s: GA, q: "Net Worth = Assets − _______", o: ["Book Debts","Equity","Current Assets","Liabilities"], e: "Net Worth = Total Assets − Total Liabilities. It represents the value of an entity owned by its shareholders." },
  { s: GA, q: "Which of the given statements is correct?\n\nI. Acid turns red litmus blue.\nII. Acids are bitter in taste.", o: ["Neither I nor II","Only II","Only I","Both I and II"], e: "Acids turn blue litmus red (not the other way), and acids taste sour (not bitter). Both statements are incorrect — neither I nor II." },
  { s: GA, q: "The folk dance 'Cheraw' is primarily associated with which Indian state?", o: ["Bihar","Odisha","Goa","Mizoram"], e: "Cheraw (the bamboo dance) is the traditional folk dance of the Mizo tribe of Mizoram." },
  { s: GA, q: "In which of the following years did the first elected Parliament come into existence?", o: ["1950","1949","1952","1955"], e: "The first elected Parliament of India came into existence in 1952 after the first general elections (1951-52)." },
  { s: GA, q: "Which are the two social groups in India which are most vulnerable to poverty?", o: ["Forward castes and Brahmins","Scheduled tribes and Other Backward Classes","Brahmins and Scheduled castes","Scheduled tribes and Scheduled castes"], e: "Scheduled Tribes (STs) and Scheduled Castes (SCs) are the two social groups most vulnerable to poverty in India." },
  { s: GA, q: "The _______ of a country is measured by the development of manufacturing industries.", o: ["debt","expenditure","liability","economic strength"], e: "A country's economic strength is measured by the development of its manufacturing industries." },
  { s: GA, q: "How is calcium oxide formed?", o: ["By double decomposition of calcium oxide and water","By displacement of calcium oxide and calcium carbonate","By decomposition of calcium carbonate into calcium oxide and carbon dioxide on heating","By decomposition of calcium carbonate and calcium hydroxide"], e: "Calcium oxide (CaO) is formed by heating calcium carbonate (CaCO₃ → CaO + CO₂) — thermal decomposition." },
  { s: GA, q: "Which currency notes were demonetised by the government of India in 2016?", o: ["₹500 and ₹50","₹500 and ₹1,000","₹500 and ₹100","₹100 and ₹1,000"], e: "On 8 November 2016, the Government of India demonetised ₹500 and ₹1,000 currency notes." },
  { s: GA, q: "Which of the following activity is related to the tertiary sector of the economy?", o: ["Storage","Automobile production","Fishing","Cloth Weaving"], e: "Storage is part of the tertiary (services) sector. Automobile production and cloth weaving are secondary; fishing is primary." },
  { s: GA, q: "He is perhaps best known for his speech at the Parliament of the World's Religions in Chicago in 1893. Who is 'he' referred to?", o: ["Swami Vivekananda","Keshab Chandra Sen","Swami Dayanand Saraswati","Mahatma Gandhi"], e: "Swami Vivekananda's famous Chicago speech at the Parliament of the World's Religions in 1893 introduced Hinduism and Vedanta philosophy to the West." },
  { s: GA, q: "The inaugural winners of the Hero Indian Super League (ISL) was ATK, which is a football club based in _________.", o: ["Kolkata","Chennai","Mumbai","Bengaluru"], e: "Atletico de Kolkata (ATK) won the inaugural ISL season in 2014 — based in Kolkata." },

  // ============ Elementary Mathematics (41-60) ============
  { s: QA, q: "A, B and C run at speeds 5 m/s, 3 m/s and 8 m/s respectively. They start the race at the same time from the same point. After some time, it was found that the distance between A and C is 6 m. Determine the distance between A and B.", o: ["3 m","2 m","5 m","4 m"], e: "Relative speed of C w.r.t. A = 3 m/s. Time = 6/3 = 2 s. A−B distance = (5−3) × 2 = 4 m." },
  { s: QA, q: "A dishonest shopkeeper sells rice at the cost price but he uses a faulty weight of 925g for 1000g. Find his gain percentage.", o: ["6.01%","7.0%","5.3%","8.11%"], e: "Gain% = (true − false)/false × 100 = (1000−925)/925 × 100 = 75/925 × 100 ≈ 8.11%." },
  { s: QA, q: "A single discount equivalent to three successive discounts of 10%, 5% and 3 1/2 % will be _______.", o: ["18.5%","16.9475%","17.4925%","14.5%"], e: "Multiplier = 0.9 × 0.95 × 0.965 = 0.8251... → discount = 17.49%." },
  { s: QA, q: "What is the smallest positive number that should be subtracted from each of 12 and 21, so that 36 is the third proportion to them?", o: ["5","3","4","2"], e: "Third proportion: 36 = (21−x)²/(12−x). Solving: (21−x)² = 36(12−x). x = 3 satisfies: (18)²/(9) = 324/9 = 36 ✓." },
  { s: QA, q: "The value of a painting rises from ₹140000 to ₹182000. The percent increase in the value of the painting is:", o: ["50%","10%","30%","40%"], e: "Increase = 182000 − 140000 = 42000. % increase = 42000/140000 × 100 = 30%." },
  { s: QA, q: "Find the HCF of the cube of 16 and the square of 48.", o: ["256","768","512","128"], e: "16³ = 4096 = 2¹². 48² = 2304 = 2⁸ × 3². HCF = 2⁸ = 256." },
  { s: QA, q: "24 men complete a work in 9 days. 3 days after they started working, 8 more men joined them. How many days will all of them take to complete the remaining work?", o: ["9","4","5.5","4.5"], e: "Total work = 24 × 9 = 216 man-days. After 3 days, work done = 72. Remaining = 144. Now 32 men: days = 144/32 = 4.5." },
  { s: QA, q: "If the price of tea is increased by 20%, by what percentage must the consumption of tea be diminished so as NOT to increase the expenditure on tea?", o: ["33 1/3 %","16 2/3 %","20%","25%"], e: "% reduction = increase/(100+increase) × 100 = 20/120 × 100 = 16 2/3 %." },
  { s: QA, q: "A solid right-circular cylinder whose radius of the base is 22.5 cm and whose height is 24 cm is melted and moulded in the shape of a right circular cone whose radius of the base is 36 cm. What will be the height of this cone?", o: ["26.225 cm","28.125 cm","29.105 cm","30.25 cm"], e: "Volume cylinder = π × 22.5² × 24. Cone volume = (1/3) × π × 36² × h. Equating: h = 3 × 22.5² × 24 / 36² = 3 × 506.25 × 24 / 1296 = 28.125 cm." },
  { s: QA, q: "The present value of a house is ₹46,40,000. If its value depreciates at the rate of 5% per annum, then the value of the house after 3 years will be:", o: ["₹39,78,220","₹44,08,000","₹40,70,520","₹41,87,600"], e: "Value = 4640000 × (0.95)³ = 4640000 × 0.857375 = ₹39,78,220." },
  { s: QA, q: "A person travels three equal distances at the speeds of 2 km/h, 3 km/h and 4 km/h and takes a total time of 52 minutes. The total distance is:", o: ["2.8 km","2.7 km","2.4 km","2.5 km"], e: "Let each distance = d. d/2 + d/3 + d/4 = 52/60 → 13d/12 = 52/60 → d = 0.8 km. Total = 2.4 km." },
  { s: QA, q: "An object moves 15 m in 2.6 min and the next 26 km at a speed of 30 km/h. Find its average speed (in m/sec) for the whole movement.", o: ["8.59","3.76","7.94","2.92"], e: "Per the worked solution, the average speed for the entire movement is approximately 7.94 m/s." },
  { s: QA, q: "Simplify the following.\n\n30% of [{(820% of 40) ÷ 28}] % of 600", o: ["540","200","500","250"], e: "Per the worked solution, the value evaluates to 540." },
  { s: QA, q: "At what rate of compound interest does a sum of money become 3.375-fold in 3 years, compounding annually?", o: ["50%","200%","100%","150%"], e: "(1 + R/100)³ = 3.375 → 1 + R/100 = 1.5 → R = 50%." },
  { s: QA, q: "A wholesaler has 1000 kg sugar, part of which he sells at 6% profit and the rest at 12% profit. His gain is 10% on the whole. The quantity sold at 6% profit is: (consider up to two decimals)", o: ["666.66 kg","336.33 kg","663.66 kg","333.33 kg"], e: "By alligation: 6% — 10% — 12%. Ratio = 2:4 = 1:2. So 1/3 of 1000 = 333.33 kg sold at 6% profit." },
  { s: QA, q: "Balvendra offers two successive discounts of 9% and 4% first and then he also provides a cash discount of ₹268 on the sale of a CCTV camera. If the marked price of the CCTV camera is ₹5,000, what is the final price of the CCTV camera for a customer?", o: ["₹4,000","₹4,368","₹4,100","₹4,636"], e: "After 9% & 4%: 5000 × 0.91 × 0.96 = 4368. After ₹268 cash discount: 4368 − 268 = ₹4,100." },
  { s: QA, q: "Ram and Ramesh run two kilometres and Ram wins by 40 seconds. Ram and Naresh run two kilometres and Ram wins by 650 metres. When Ramesh and Naresh run the same distance, Ramesh wins by 25 seconds. Find the time taken by Ram to run two kilometres.", o: ["3 minutes, 15 seconds","2 minutes, 15 seconds","3 minutes, 35 seconds","2 minutes, 35 seconds"], e: "Per the worked solution, Ram takes 2 minutes 15 seconds to run 2 km." },
  { s: QA, q: "If the volume of a solid right circular cone is v cm³ and its height is h cm, then the radius of the cone is:", o: ["√(v/πh²)","√(3v/πh)","√(3v/πh²)","√(v/πh)"], e: "V = (1/3)πr²h → r² = 3V/(πh) → r = √(3V/(πh))." },
  { s: QA, q: "Aman can do a piece of work in 78 days. Ram can do this work in 39 days. Aman started the work alone. After how many days should Ram join him, so that the work is finished in 39 days?", o: ["39/2 days","77/2 days","27/2 days","17/2 days"], e: "Let Ram join after x days. Aman works 39 days alone first part, but actually: Aman 39 days = 39/78 = 1/2. Remaining 1/2 by both in (39−x) days at rate 1/78+1/39 = 3/78 = 1/26 → (39−x)/26 = 1/2 → x = 39/2." },
  { s: QA, q: "₹936 is divided among P, Q and R in the ratio 2 : 3 : 4 instead of 1/2 : 1/3 : 1/4 by mistake. The gain of R in the distribution is _____.", o: ["₹200","₹24","₹124","₹216"], e: "Original ratio 1/2:1/3:1/4 = 6:4:3 (×12). Sum = 13. R's correct share = 936×3/13 = 216. Wrong ratio 2:3:4 sum=9. R's wrong share = 936×4/9 = 416. Gain = 416 − 216 = 200." },

  // ============ English (61-80) ============
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nThe library is the right place to write an article from a journal.", o: ["to fill an article","to correct an article","to read an article","to find the article"], e: "Libraries are places to 'read an article' (from journals); the original 'write an article from a journal' makes no sense in context." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nSwindle", o: ["Threat","Fraud","Observation","Ride"], e: "Swindle (to cheat or defraud) is synonymous with 'Fraud'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nA cakewalk", o: ["An unexpected twist","A stylish walk","An easy task or victory","A precious memory to cherish"], e: "'A cakewalk' refers to something that is easily accomplished — an easy task or victory." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nWhen the separatist tendencies become very active, the unity of any nation can be in __________.", o: ["solitaire","docile","negotiation","peril"], e: "'Peril' (danger) fits — when separatism is active, national unity is in danger." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nCalamity", o: ["Fortune","Disaster","Windfall","Prosperity"], e: "Calamity means a great misfortune — synonym is 'Disaster'." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nThe treaty was signed by both the parties to retain the status-quo.", o: ["previous condition","unnatural behaviour","current situation","class of societies"], e: "'Status-quo' means the existing/current situation. 'Current situation' fits the meaning." },
  { s: ENG, q: "Select the most appropriate synonym of the word given in the bracket to fill in the blank.\n\nRohan ________ (insufficient) the compassion required to be a doctor.", o: ["oversized","lacked","was deprived","voided"], e: "'Lacked' (was without) is the synonym of 'insufficient' — Rohan lacked the compassion." },
  { s: ENG, q: "Select the correct spelling of the underlined word in the following sentence.\n\nYou can eat anything you like accept the rice pudding.", o: ["axcept","accede","except","assess"], e: "'Except' (excluding/other than) is correct — 'accept' (to receive willingly) is wrong here." },
  { s: ENG, q: "Identify the spelling error in the given sentence and select the option that rectifies the error.\n\nHe dared to compeete against the experienced boxer.", o: ["compete","ageinst","experianced","deired"], e: "'Compeete' should be 'compete' — that is the spelling error." },
  { s: ENG, q: "Parts of the following sentence have been given as options. One of them may contain an error. Select the part that contains the error from the given options. If you don't find any error, mark 'No error' as your answer.\n\nLast night I played my guitar loudly and the neighbours complain.", o: ["Last night I played","and the neighbours complain","No error","my guitar loudly"], e: "'and the neighbours complain' should be 'complained' — past tense to match 'Last night I played'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nHas bigger fish to fry", o: ["Has better choice of food","Has easier plans to solve the issue","Has more important work to do","Has greater plans to discuss"], e: "'Bigger fish to fry' means having more important things to attend to." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nEscalate", o: ["Corrupt","Intensify","Diminish","Enlarge"], e: "Escalate (to increase) is the antonym of 'Diminish' (to decrease)." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nFollow", o: ["Ensue","Predate","Supplant","Displace"], e: "Follow (to come after) is the antonym of 'Predate' (to come before)." },
  { s: ENG, q: "Select the correct word for the blanks in the given sentence.\n\nI need a blue _________ for writing and my brother runs a _________ for dogs.", o: ["shelter","nib","pen","herd"], e: "'Pen' fits both blanks — a writing pen and a pen (enclosure) for dogs/animals." },
  { s: ENG, q: "Select the most appropriate option to fill in the blanks in the given sentence.\n\nShelley is good at ______ and also has a new ______ of the Oxford dictionary launched last month.", o: ["edition; addition","addition; addition","addition; edition","edition; edition"], e: "'Addition' (adding numbers) for the first blank, and 'edition' (a published version) for the second — 'a new edition of the Oxford dictionary'." },
  { s: ENG, q: "Comprehension. Fill in blank 1.\n\nLooking at the stars is a glimpse (1) _________ history.", o: ["among","besides","up","of"], e: "'A glimpse of history' is the standard idiomatic phrase." },
  { s: ENG, q: "Fill in blank 2.\n\nSome of the things we see (2)_________ millions of light-years (3) ________.", o: ["flush","separate","grow","are"], e: "'Are' fits as the verb — 'Some of the things we see are millions of light-years away'." },
  { s: ENG, q: "Fill in blank 3.\n\n... millions of light-years (3) ________.", o: ["now","away","between","close"], e: "'Away' completes the phrase 'millions of light-years away' — referring to distance." },
  { s: ENG, q: "Fill in blank 4.\n\nEverything in the universe (4) ________ a past but stars don't try to hide it.", o: ["have","should","has","can"], e: "Singular 'Everything' takes singular verb 'has'." },
  { s: ENG, q: "Fill in blank 5.\n\nThey just (5) _________ shining, for everyone to see.", o: ["blight","part","force","keep"], e: "'Keep' fits — 'they just keep shining' (continue shining)." }
];

if (RAW.length !== 80) { console.error(`Expected 80 questions, got ${RAW.length}`); process.exit(1); }

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
      tags: ['SSC', 'GD', 'Constable', 'PYQ', '2023'],
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

  // 2023+ SSC GD Tier-I pattern: 4 sections × 20 Q = 80 Q, 160 marks, 60 min, 0.5 negative.
  const PATTERN_TITLE = 'SSC GD Constable Tier-I';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: PATTERN_TITLE,
      duration: 60,
      totalMarks: 160,
      negativeMarking: 0.5,
      sections: [
        { name: REA, totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GA,  totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: QA,  totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: ENG, totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  }

  const TEST_TITLE = 'SSC GD Constable - 7 February 2023 Shift-1';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: TEST_TITLE
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
    totalMarks: 160,
    duration: 60,
    accessLevel: 'FREE',
    isPYQ: true,
    pyqYear: 2023,
    pyqShift: 'Shift-1',
    pyqExamName: 'SSC GD Constable',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
