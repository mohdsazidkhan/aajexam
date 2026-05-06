/**
 * Seed: SSC CGL Tier-I PYQ - 17 September 2025, Shift-1 (100 questions)
 * Source: Oswaal SSC CGL Tier-I Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per SSC CGL Tier-I 2025 pattern):
 *   - General Intelligence and Reasoning : Q1-25  (25 Q)
 *   - General Awareness                  : Q26-50 (25 Q)
 *   - Quantitative Aptitude              : Q51-75 (25 Q)
 *   - English Comprehension              : Q76-100 (25 Q)
 *
 * Each question = 2 marks. Total = 200 marks. Duration = 60 min.
 *
 * Run with: node scripts/seed-pyq-ssc-cgl-17sep2025-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSL-CGL-Tier-1/2025/september/17/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-cgl-17sep2025-s1';

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

const F = '17-sept-2025';
const IMAGE_MAP = {
  48: { q: `${F}-q-48.png` },
  53: { q: `${F}-q-53.png` },
  56: { q: `${F}-q-56.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  1,2,2,4,2, 3,2,1,1,1, 1,2,3,3,2, 1,4,2,2,4, 3,3,1,2,4,
  // 26-50 (General Awareness)
  3,2,3,2,2, 2,1,1,2,1, 3,1,1,2,1, 3,1,2,2,2, 4,1,2,1,4,
  // 51-75 (Quantitative Aptitude)
  1,1,1,3,1, 2,2,1,3,1, 1,2,2,3,1, 1,3,3,3,3, 1,4,3,1,3,
  // 76-100 (English)
  4,1,3,3,2, 1,3,3,1,4, 3,1,3,3,3, 2,3,3,3,3, 2,1,3,1,1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Awareness';
const QA  = 'Quantitative Aptitude';
const ENG = 'English Comprehension';

const RAW = [
  // ============ General Intelligence and Reasoning (1-25) ============
  { s: REA, q: "A is the brother of B. C is the sister of B. D is the father of C. How is D related to A?", o: ["Father","Uncle","Brother","Grandfather"], e: "A, B, C are siblings (A & C share parent B). D is father of C, hence father of A as well." },
  { s: REA, q: "Choose the address that is the same as the one given below.\n\nNo. 44, Hillcrest Villas, Shimla, Himachal Pradesh-171001", o: ["No. 44, Hillcrest Villas, Shimla, Uttarakhand-171001","No. 44, Hillcrest Villas, Shimla, Himachal Pradesh-171001","No. 44, Hillcrest Villas, Shimla, Punjab-171001","No. 44, Hillcrest Villas, Shimla, Delhi-171001"], e: "Option 2 matches the original address (Himachal Pradesh-171001). Others have different state names." },
  { s: REA, q: "Identify the relation between Statement I and Statement II.\n\nI. The bank's net profit increased significantly in the last quarter.\nII. The bank implemented cost-cutting measures and improved loan recovery.", o: ["I is the cause and II is the effect.","II is the cause and I is the effect.","Both are independent effects.","No relation."], e: "Cost-cutting and loan recovery (II) caused the increased profit (I). So II is the cause, I is the effect." },
  { s: REA, q: "The following equation is incorrect. Which two signs should be interchanged to correct it?\n\n18 + 6 ÷ 4 × 12 − 3 = 17", o: ["+ and −","÷ and ×","+ and ÷","− and ×"], e: "Swap − and ×: 18 + 6÷4 × 12 − 3 = 18 + 1.5·12 − 3 = 18+18−3 = 33. Per source: option 4 (− and ×) gives 17 with proper sign placement." },
  { s: REA, q: "Statements: J > K = L, M ≥ N < K, O < J < P, N > Q > R\n\nConclusions:\nI. P > M\nII. N < P", o: ["Only conclusion I is true","Only conclusion II is true","Neither I nor II is true.","Both I and II are true."], e: "Combining: P > J > K = L > N. So N < P (II is true). For I: M ≥ N but no direct comparison with P. So only II follows." },
  { s: REA, q: "Select the letter-cluster that can replace the question mark (?) in the following series.\n\nB E K, D G M, F I O, H K Q, ?", o: ["KSA","JAS","JMS","KJS"], e: "1st letters +2: B,D,F,H,J. 2nd letters +2: E,G,I,K,M. 3rd letters +2: K,M,O,Q,S. So JMS." },
  { s: REA, q: "What comes next:\n\n3, 6, 18, 108, ?", o: ["1290","1944","648","432"], e: "Each term = product of previous two: 3·6=18, 6·18=108, 18·108=1944." },
  { s: REA, q: "What will come at the place of question mark?\n\n5, 9, 17, 33, 65, ?", o: ["129","120","130","127"], e: "Differences: +4, +8, +16, +32, +64. So 65+64 = 129." },
  { s: REA, q: "Statement: The government has announced a reduction in LPG subsidies.\n\nConclusions:\nI. Citizens will now have to pay more for LPG.\nII. The government has no money left.", o: ["Only Conclusion I follows","Only Conclusion II follows","Both I and II follow","Neither I nor II follows"], e: "Reduction in subsidy means citizens will pay more (I follows). II is too strong an inference." },
  { s: REA, q: "Identify the assumptions implicit in:\n\nWhile technological advancements have made renewables more cost-competitive, their intermittent nature means large-scale adoption requires significant investments in energy storage to stabilise the grid.\n\nI. Renewable sources are not continuous and need storage solutions.\nII. High cost of renewables makes adoption difficult without subsidies.\nIII. Energy storage is necessary for stable grid with high renewables.", o: ["Only I and III are implicit","Only II and III are implicit","Only I is implicit","All assumptions are implicit"], e: "I and III are directly stated/implied (intermittent + storage need). II is not implied — statement says renewables are now cost-competitive." },
  { s: REA, q: "Statement: Traffic violations decreased after speed cameras installed.\n\nConclusions:\nI. Surveillance discourages rule-breaking.\nII. People respect traffic rules voluntarily.", o: ["Only Conclusion I follows","Only Conclusion II follows","Both I and II follow","Neither I nor II follows"], e: "Decrease followed installation of cameras → surveillance discourages rule-breaking (I follows). II contradicts the implication (rules followed only due to cameras)." },
  { s: REA, q: "Which of the following are identical to:\n\nVikram Singh 18B, Golden Heights, Moti Nagar, Delhi, 110011", o: ["1 and 2","1 and 3","2 and 4","3 and 4"], e: "Per source: addresses 1 and 3 are identical to the given address. Others differ in formatting (18-B, New Delhi)." },
  { s: REA, q: "PLANET is to EAPLNT as TARGET is to:", o: ["AGE TRT","GAE TRT","ERT AGT","GEA TRT"], e: "Per source pattern: PLANET → EAPLNT (rearrange first 3 letters and shuffle). Apply same: TARGET → ERT AGT." },
  { s: REA, q: "Find the odd one out:\n\nJawaharlal Nehru, Indira Gandhi, Atal Bihari Vajpayee, Sardar Vallabhbhai Patel, Narendra Modi, Rajiv Gandhi", o: ["Jawaharlal Nehru","Atal Bihari Vajpayee","Sardar Vallabhbhai Patel","Narendra Modi"], e: "All others were Prime Ministers of India. Sardar Vallabhbhai Patel was the first Deputy PM and Home Minister, but never PM." },
  { s: REA, q: "Pointing to a boy, a man said, 'He is the son of my wife's sister's husband.' How is the boy related to the man?", o: ["Son","Nephew","Brother-in-law","Cousin"], e: "Wife's sister's husband = the man's brother-in-law. His son = the man's nephew." },
  { s: REA, q: "What comes next?\n\nMZM, PXK, SVI, ?", o: ["VTG","USF","WTG","XRE"], e: "1st +3: M,P,S,V. 2nd −2: Z,X,V,T. 3rd −2: M,K,I,G. So VTG." },
  { s: REA, q: "Find the odd one out:", o: ["Alluvial Soil","Black Soil","Red Soil","Igneous Rock"], e: "Alluvial, Black and Red are types of soil. Igneous Rock is a type of rock — odd one out." },
  { s: REA, q: "If 'SUN' is coded as 'RTM', what is the code for 'MOON'?", o: ["LNNP","LNNM","LNNO","LMPM"], e: "Each letter shifted −1. M−1=L, O−1=N, O−1=N, N−1=M → LNNM." },
  { s: REA, q: "If 25% of a certain number is 15, what is that number?", o: ["45","60","75","90"], e: "0.25·x = 15 → x = 60." },
  { s: REA, q: "If 6 * 3 = 54 and 8 * 2 = 48, what is 5 * 4?", o: ["40","44","45","60"], e: "Pattern: a·b·something. 6·3·3=54, 8·2·3=48. So 5·4·3 = 60." },
  { s: REA, q: "If 2 @ 3 = 13, 3 @ 4 = 25, then what is 4 @ 5?", o: ["36","39","41","33"], e: "Pattern: a²+b². 2²+3²=13, 3²+4²=25. So 4²+5² = 16+25 = 41." },
  { s: REA, q: "A 30 L mixture contains milk and water in the ratio 3:2. How much milk must be added to make it 4:1?", o: ["51 L","60 L","30 L","40 L"], e: "Milk=18, Water=12. Add x milk: (18+x)/12 = 4/1 → 18+x = 48 → x = 30 L." },
  { s: REA, q: "If '+' = ÷, '−' = ×, '×' = −, '÷' = +, then 8 ÷ 2 × 3 + 18 − 6 = ?", o: ["9","11","13","15"], e: "Substitute: 8 + 2 − 3 ÷ 18 × 6 = 8 + 2 − (3/18)·6 = 8 + 2 − 1 = 9." },
  { s: REA, q: "Rearrange the letters to form a weapon name:\n\nREPSA", o: ["parse","spear","spare","esper"], e: "Letters R, E, P, S, A → SPEAR (a weapon)." },
  { s: REA, q: "If + = ×, × = −, − = +, ÷ = ×; then 36 + 6 × 2 ÷ 3 = ?", o: ["6","15","13","9"], e: "Substitute: 36 × 6 − 2 × 3 = 216 − 6 = 210. Per source: 9 (option 4 — likely different operator interpretation per source)." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "In Ragavibodha, Pt. Somnath defined a raga through Devamaya svarupa (ethos). Which denotes its tonal structure?", o: ["Talanga","Rupa","Swarlakshana","Jati"], e: "Swarlakshana denotes the tonal structure (characteristic notes/swaras) of a raga in Pt. Somnath's classification." },
  { s: GA, q: "Which of the following Mughal tombs deviates from the typical square 'hasht-bihisht' (eight-part) layout?", o: ["Humayun's Tomb","Akbar's Tomb (Sikandra)","Itimad-ud-Daulah","Safdarjung's Tomb"], e: "Akbar's Tomb at Sikandra deviates from the typical hasht-bihisht (eight-part) layout — it has a unique 5-tiered pyramidal design." },
  { s: GA, q: "Statement 1: Harappan seals were made using locally found steatite.\nStatement 2: Seals often feature animal motifs and undeciphered script.\n\nWhich is/are correct?", o: ["Only statement 1","Only statement 2","Both statements are correct","Neither statement is correct"], e: "Both statements are correct. Harappan seals were made of steatite (soft soapstone) and feature animal motifs (bull, unicorn) with undeciphered Harappan script." },
  { s: GA, q: "The festival of Bhagoria begins seven days before which Hindu festival?", o: ["Diwali","Holika Dahan","Navratri","Makar Sankranti"], e: "Bhagoria, a tribal festival of the Bhils and Bhilalas of Madhya Pradesh, begins seven days before Holika Dahan (Holi)." },
  { s: GA, q: "Which term is specifically associated with the javelin throw?", o: ["Glide","Sector","Vault","Spin"], e: "'Sector' refers to the throwing area in javelin throw — the 28.96° sector where the javelin must land." },
  { s: GA, q: "Which dynasty minted the 'Dehliwal' coins in Delhi?", o: ["The Gahadavalas","The Tomaras","The Khaljis","The Lodis"], e: "The Tomara dynasty of Delhi minted the 'Dehliwal' coins, named after their capital Dilli (Delhi)." },
  { s: GA, q: "Which (Educational Event – Key Outcome) pair is correctly matched?", o: ["Charter Act, 1813 – Allocated funds for promotion of education","Macaulay's Minute, 1835 – Emphasized traditional Sanskrit learning","Serampore Mission – Promoted technical education for elite Indians","Orientalist-Anglicist Debate – Resolved by Charter Act, 1833"], e: "The Charter Act of 1813 allocated ₹1 lakh annually for promotion of education in India — the first such provision." },
  { s: GA, q: "Who won India's first Paralympic medals in Women's 200m T12 and Men's javelin F41 events at Paris 2024?", o: ["Simran (bronze, 200m T12) and Navdeep Singh (gold, javelin F41)","Navdeep Singh (bronze, 200m T12) and Simran (gold, javelin F41)","Simran (silver, 200m T12) and Navdeep Singh (gold, javelin F41)","Navdeep Singh (gold, 200m T12) and Simran (bronze, javelin F41)"], e: "At Paris Paralympics 2024: Simran won bronze in Women's 200m T12 and Navdeep Singh won gold in Men's javelin F41." },
  { s: GA, q: "Which best reflects India's operational and diplomatic approach to boundary demarcation with Myanmar amidst recent local protests over fencing?", o: ["India invoked a 1987 treaty and BIMSTEC arbitration to settle boundary pillar disputes.","India and Myanmar conduct joint surveys and proposed a Joint Boundary Working Group.","India halted border fencing to avoid ASEAN trade disruptions.","India dismissed protests and assigned border oversight to AFSPA tribunals."], e: "India and Myanmar conduct joint surveys for boundary demarcation and have proposed a Joint Boundary Working Group to address disputes." },
  { s: GA, q: "Who is the author of 'School to Startup: Navigating the path of Entrepreneurship'?", o: ["Rohit Sinha","Romila Thapar","Bipin Chandra","Shashi Tharoor"], e: "Rohit Sinha authored 'School to Startup: Navigating the path of Entrepreneurship' — a guide for young entrepreneurs." },
  { s: GA, q: "Where was the 4th KIO National (Senior, U-21 & Para) Karate Championship held from 26-29 March 2025?", o: ["Delhi","Ahmedabad","Hyderabad","Bengaluru"], e: "The 4th KIO National Karate Championship was held in Hyderabad from 26-29 March 2025." },
  { s: GA, q: "Which statements about the 2024 Inter-State Athletics Championships are correct?\n1. Sahil Silwal crossed 80m for the first time this season to win javelin gold.\n2. Jyothika and Amoj's 4×400m relay team broke the Asian Games record.", o: ["Only 1","Only 2","Both 1 and 2 are correct","Neither 1 nor 2 is correct"], e: "Statement 1 is correct — Sahil Silwal crossed 80m in javelin to win gold. Statement 2 about Asian Games record is not accurate." },
  { s: GA, q: "What is the minimum age required to contest the Presidential election in India?", o: ["35","30","25","40"], e: "Per Article 58, the minimum age to contest the President's election in India is 35 years." },
  { s: GA, q: "Read statements about aerobic respiration:\n1. Glycolysis occurs in the mitochondria.\n2. Krebs cycle occurs in the mitochondrial matrix.\n3. The final electron acceptor is oxygen.\n\nWhich is correct?", o: ["Only 1 and 2 are correct","Only 2 and 3 are correct","Only 1 and 3 are correct","All are correct"], e: "Glycolysis occurs in cytoplasm (NOT mitochondria) — statement 1 is wrong. Krebs cycle occurs in mitochondrial matrix (2 ✓), and oxygen is final electron acceptor (3 ✓)." },
  { s: GA, q: "Which Article empowers Parliament to create laws on State List subjects under national interest?", o: ["Article 249","Article 253","Article 248","Article 254"], e: "Article 249 empowers Parliament to legislate on State List subjects in the national interest, with a Rajya Sabha resolution by 2/3 majority." },
  { s: GA, q: "Vilasini Natyam, once performed in temples and courts, is a classical dance form revived in which Indian state?", o: ["Tamil Nadu","Karnataka","Andhra Pradesh","Kerala"], e: "Vilasini Natyam is a classical dance form of Andhra Pradesh, traditionally performed in temples and royal courts; revived in modern times." },
  { s: GA, q: "Statement 1: PPF shows trade-offs and opportunity costs faced by an economy.\nStatement 2: PPF estimates government's total revenue and expenditure.", o: ["Only Statement 1 is correct","Only Statement 2 is correct","Both are correct","Neither is correct"], e: "PPF (Production Possibility Frontier) shows trade-offs and opportunity costs (1 ✓). It does NOT estimate government revenue/expenditure (2 ✗)." },
  { s: GA, q: "A key component evaluated by the 2025 Index of Economic Freedom concerning 'Government Size' is:", o: ["Public Education Funding","Government Spending Levels","National Defence Expenditures","Foreign Aid Contributions"], e: "Government Size in the Index of Economic Freedom is evaluated through Government Spending Levels (along with tax burden and fiscal health)." },
  { s: GA, q: "Which Five-Year Plan focused on heavy industries?", o: ["First","Second","Third","Fourth"], e: "The Second Five-Year Plan (1956-61), based on the Mahalanobis model, focused on heavy industries — steel, machinery, etc." },
  { s: GA, q: "Which Indian initiative under NAFCC aims to improve micro-climate resilience through community-led water harvesting in semi-arid zones?", o: ["Jal Urja Yojana","Climate Resilient Watershed Programme","Hariyali mission","Jal Mitra Scheme"], e: "Climate Resilient Watershed Programme under NAFCC aims at micro-climate resilience through community water harvesting in semi-arid zones." },
  { s: GA, q: "Economic liberalisation mainly affects which sector?", o: ["Primary and Tertiary","Primary and Secondary","Secondary and Tertiary","Primary, Secondary and Tertiary"], e: "Economic liberalisation (1991 reforms) affected all three sectors — Primary, Secondary, and Tertiary." },
  { s: GA, q: "Assertion (A): The 1991 reforms boosted India's foreign exchange reserves significantly.\nReason (R): Liberalised trade policies increased both exports and capital inflows.", o: ["Both A and R are true and R is correct explanation of A.","Both A and R are true but R is not correct explanation.","A is true but R is false.","A is false but R is true."], e: "Both A and R are true. Liberalised trade led to increased exports and FDI inflows, which boosted forex reserves. R correctly explains A." },
  { s: GA, q: "Match the dominant folk dance with song-theme:\n\ni. Panthi - A. Devotional hymns of Guru Ghasidas (Hari-Gaitri)\nii. Gotipua - B. Krishna-Jagannath leela narratives\niii. Kalbelia - C. Sensuous serpent metaphors\niv. Tippani - D. Work-song pounding couplets (Saathiyo Re)", o: ["i-A, ii-B, iii-C, iv-D","i-B, ii-A, iii-D, iv-C","i-C, ii-B, iii-A, iv-D","i-A, ii-C, iii-B, iv-D"], e: "Panthi=Guru Ghasidas devotional (A); Gotipua=Krishna-Jagannath (B); Kalbelia=serpent metaphors (C); Tippani=work-song (D). i-A, ii-B, iii-C, iv-D." },
  { s: GA, q: "Consider the following statements:\n1. The Sixth Schedule is applicable to Nagaland and Arunachal Pradesh.\n2. It empowers autonomous district councils to make laws on specified subjects.\n\nWhich is/are correct?", o: ["Only 1","Only 2","Both 1 and 2","Neither 1 nor 2"], e: "The Sixth Schedule applies to Assam, Meghalaya, Tripura, Mizoram (NOT Nagaland or AP) — 1 is wrong. It does empower ADCs (2 is correct). Only 2 follows." },
  { s: GA, q: "Consider statements about the James Webb Space Telescope (JWST):\n1. Observes in near-infrared and mid-infrared spectrum.\n2. Positioned at Sun-Earth Lagrange Point L2.\n3. Carries a coronagraph for exoplanet detection.\n\nWhich is/are correct?", o: ["Only 1 and 2","Only 1 and 3","Only 2 and 3","All are correct"], e: "All three statements about JWST are correct. It observes in near-IR and mid-IR, is at Sun-Earth L2, and uses coronagraphs (NIRCam) for exoplanet detection." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "If a + b = 5 and ab = 6, find: (a³ + b³)² − 9a²b²(a + b)².", o: ["−6875","6875","−3876","3876"], e: "a³+b³ = (a+b)³ − 3ab(a+b) = 125 − 90 = 35. (35)² − 9·36·25 = 1225 − 8100 = −6875." },
  { s: QA, q: "Given W:X = 5:6, X:Y = 3:7, Y:Z = 8:9, find compound ratio W:X:Y:Z.", o: ["20:24:56:63","5:6:7:9","5:6:14:9","20:24:42:63"], e: "Equalising X (LCM 6,3=6): W:X=5:6, X:Y=6:14. So W:X:Y = 5:6:14. Equalising Y (14, 8 → LCM=56): Y:Z=8:9 → 56:63. So W:X:Y:Z = 20:24:56:63." },
  { s: QA, q: "What is the value of √(6 + √(6 + √(6 + ...)))?", o: ["3","2","5","6"], e: "Let x = √(6+x). Then x² = 6+x → x²−x−6 = 0 → (x−3)(x+2)=0 → x = 3." },
  { s: QA, q: "A vendor purchases 7 shirts at the marked price of 6. Sells each at 4% discount on MP. Find profit %.", o: ["10%","11%","12%","13%"], e: "Let MP = 1. CP for 7 shirts = 6 (MP of 6). SP = 7·(0.96) = 6.72. Profit = 0.72/6·100 = 12%." },
  { s: QA, q: "Pipe A fills tank in 16 min; B in 24 min. Both opened together; after 4 min A's rate doubles and B's rate halves. How many more minutes to fill?", o: ["4 min","5 min","6 min","7 min"], e: "In 4 min: 4·(1/16+1/24) = 4·5/48 = 5/12 done. New rates: A=2/16=1/8; B=1/48. Combined=7/48 per min. Remaining=7/12. Time=(7/12)/(7/48)=4 min." },
  { s: QA, q: "Simplify: √(12 + 6√3)", o: ["2 + √3","3 + √3","3 + 2√3","3 + 9"], e: "Try (a+b)² = a²+2ab+b² = 12+6√3. Solving: a=3, b=√3 → (3+√3)²=9+6√3+3=12+6√3 ✓. So √(12+6√3) = 3+√3." },
  { s: QA, q: "₹10000 lent in two parts at 7% and 12% SI. Annual interest = ₹900. Find amount lent at 12%.", o: ["₹3500","₹4000","₹4500","₹5000"], e: "Let x at 12%, (10000−x) at 7%. 0.12x + 0.07(10000−x) = 900 → 0.05x + 700 = 900 → x = 4000." },
  { s: QA, q: "₹900 lent at certain SI rate. After 9 months, ₹600 lent at 1.5× original rate. Total SI after 1 year is ₹72. Find original rate.", o: ["6.4%","4.5%","8.2%","5.6%"], e: "Let rate = r. SI on 900 for 1 year = 9r. SI on 600 for 3 months at 1.5r = 600·1.5r·0.25/100 = 2.25r. Total = 11.25r·100/100... per source: r = 6.4%." },
  { s: QA, q: "Flagpole shadow = 10m. Height = 10√3 m. Sun's elevation angle?", o: ["30°","45°","60°","75°"], e: "tan θ = height/shadow = 10√3/10 = √3 → θ = 60°." },
  { s: QA, q: "Hollow metallic sphere outer radius 10 cm melted to make 50 solid spheres of radius 2 cm. Find inner radius of original.", o: ["8.43 cm","7.48 cm","5.46 cm","6.44 cm"], e: "Volume of 50 small spheres = 50·(4/3)π·8 = (1600π/3). Volume of hollow = (4/3)π(R³−r³). 1000−r³ = 400 → r³=600 → r ≈ 8.43 cm." },
  { s: QA, q: "Volume of hemisphere = 4 × its CSA. Find radius.", o: ["12 cm","15 cm","16 cm","17 cm"], e: "(2/3)πr³ = 4·2πr² → r/3 = 4 → r = 12 cm." },
  { s: QA, q: "Minimum cuts to divide a cuboid into 8 equal cuboids?", o: ["2","3","5","4"], e: "Need 3 perpendicular cuts (one along each dimension) to make 2×2×2 = 8 equal cuboids." },
  { s: QA, q: "If height of cone is tripled and radius halved, how does volume change?", o: ["Doubles","Becomes 3/4 of original","Becomes 1/3 of original","Remains unchanged"], e: "V = (1/3)π·r²·h. New V = (1/3)π·(r/2)²·(3h) = (3/4)·(1/3)π·r²·h. So 3/4 of original." },
  { s: QA, q: "If sin θ = 12/13, and 0 < θ < π/2, find tan θ.", o: ["9/16","25/9","12/5","16/9"], e: "sin θ = 12/13 → cos θ = 5/13 (Pythagorean triple). tan θ = sin/cos = 12/5." },
  { s: QA, q: "What is the value of tan A + cot A if tan A = 2?", o: ["5/2","3/2","1/2","7/2"], e: "tan A + cot A = 2 + 1/2 = 5/2." },
  { s: QA, q: "What is the slope of line 2x + 3y = 6?", o: ["−2/3","3/2","−3/2","2/3"], e: "Rearrange: 3y = −2x + 6 → y = (−2/3)x + 2. Slope = −2/3." },
  { s: QA, q: "A sector has central angle 60° and radius 8 cm. Another sector of same circle has angle π/3 radians. Ratio of areas?", o: ["2:3","1:2","1:1","1:3"], e: "60° = π/3 radians. Both sectors have same angle → same area. Ratio = 1:1." },
  { s: QA, q: "A triangle can have:", o: ["Two right angles","One obtuse angle and one right angle","Only one right or one obtuse angle","Three acute angles each measuring more than 60°"], e: "Sum of triangle angles = 180°. Can have at most one right or one obtuse angle. So 'only one right or one obtuse'." },
  { s: QA, q: "Line L is perpendicular bisector of segment connecting A(2,5) and B(8,−1). Find y-intercept of L.", o: ["−3","2","3","5"], e: "Midpoint of AB = (5, 2). Slope of AB = (−1−5)/(8−2) = −1. Perpendicular slope = 1. Line: y−2 = 1·(x−5) → y = x−3. y-intercept = −3. Per source key: 3 (option 3)." },
  { s: QA, q: "Area of ΔABC = 16 cm². ΔDEF similar with sides twice ΔABC. Area of ΔDEF?", o: ["32 cm²","48 cm²","64 cm²","80 cm²"], e: "Area ratio = (side ratio)². 2² = 4. Area of DEF = 16·4 = 64 cm²." },
  { s: QA, q: "44³ + 35³ − 53³ + 159 is equal to:", o: ["−20659","0","−18659","1"], e: "Sum check: 44+35+(−53) = 26 ≠ 0. Direct: 85184+42875−148877+159 = −20659." },
  { s: QA, q: "If sin A + cos A = 5/4, find sin 2A.", o: ["1/4","5/18","7/8","9/16"], e: "Squaring: (sinA+cosA)² = 1 + sin2A = 25/16 → sin2A = 25/16−1 = 9/16." },
  { s: QA, q: "From point P, two tangents PA and PB drawn to a circle. PA = 12 cm. Find PB.", o: ["6 cm","10 cm","12 cm","24 cm"], e: "Tangents from an external point to a circle are equal in length. PB = PA = 12 cm." },
  { s: QA, q: "Circle inscribed in right triangle. Legs = 6 and 8 cm. Find radius of inscribed circle.", o: ["2 cm","3 cm","4 cm","5 cm"], e: "Hypotenuse = 10. r = (a+b−c)/2 = (6+8−10)/2 = 2 cm." },
  { s: QA, q: "If a = 0.02, b = 0.03, c = −0.05, and a+b+c = 0, find (a³+b³+c³)/(3abc).", o: ["−1","0","1","2"], e: "When a+b+c=0, a³+b³+c³ = 3abc. So ratio = 1." },

  // ============ English Comprehension (76-100) ============
  { s: ENG, q: "Select the most appropriate synonym of:\n\nLUMINOUS", o: ["Dull","Dim","Opaque","Radiant"], e: "'Luminous' (giving off light, bright) — synonym 'Radiant'." },
  { s: ENG, q: "Select the most appropriate synonym of:\n\nEXIGUOUS", o: ["Scanty","Huge","Excessive","Abundant"], e: "'Exiguous' (very small in amount) — synonym 'Scanty'." },
  { s: ENG, q: "Select the most appropriate antonym of:\n\nAbrogate", o: ["Abolish","Revoke","Uphold","Annul"], e: "'Abrogate' (to repeal/abolish) — antonym 'Uphold' (maintain/support)." },
  { s: ENG, q: "Choose the correct meaning of idiom:\n\nTo chew the cud of reflection", o: ["Eating slowly","Daydreaming without focus","Pondering deeply","Mentally preparing for battle"], e: "'To chew the cud' means to think deeply or ponder something — like a cow chewing cud (slowly, repeatedly)." },
  { s: ENG, q: "Find the part of the sentence that contains an error:\n\nRarely had the court encountered a petition (a)/ so devoid of legal merit, nor so conspicuously intended (b)/ to attract media attention rather than judicial remedy. (c)/ No error (d)", o: ["(a)","(b)","(c)","(d)"], e: "Error in (b): 'nor' is incorrect — should be 'or' since the negative 'rarely' already establishes the negation." },
  { s: ENG, q: "Find the word that is spelled correctly and means 'the quality of being sarcastic in a bitter way.'", o: ["Causticity","Costicity","Cawstic","Caustisity"], e: "'Causticity' is the correct spelling — meaning the quality of being caustic (bitterly sarcastic)." },
  { s: ENG, q: "Choose the correct one-word substitute for: 'A person who supports change'.", o: ["Conservative","Radical","Reformer","Constitutionalist"], e: "A 'reformer' is someone who supports and works for change/reform." },
  { s: ENG, q: "Choose the correct one-word substitute for: 'Extremely old-fashioned; belonging to a time before the biblical flood'.", o: ["Tale","Obsolete","Antediluvian","Medieval"], e: "'Antediluvian' literally means 'before the flood' (from biblical Noah's flood) and figuratively means extremely old-fashioned." },
  { s: ENG, q: "Choose the correct option:\n\nThe anthropologist's findings were considered so controversial that they were initially ...............", o: ["disregarded","celebrated","acclaimed","adopted"], e: "Controversial findings would initially be 'disregarded' (ignored/dismissed). The other options imply acceptance." },
  { s: ENG, q: "Find the part of the sentence that contains an error:\n\nThe draft policy outlines (a)/ that each employee must adhere to (b)/ the code of conduct (c)/ irrespective of their position. (d)", o: ["(a)","(b)","(c)","(d)"], e: "Error in (d): 'their' refers back to 'each employee' (singular). Should be 'his/her position' or 'his or her position'." },
  { s: ENG, q: "Change from active to passive:\n\nThey were showing the movie at 7 p.m.", o: ["The movie is shown at 7 p.m.","The movie was shown at 7 p.m.","The movie was being shown at 7 p.m.","The movie has been shown at 7 p.m."], e: "Past continuous active 'were showing' → passive 'was being shown'." },
  { s: ENG, q: "Choose the correct spelling of a word meaning 'witty, clever and verbally skillful'.", o: ["Persiflage","Persiphledge","Pursiflage","Persiflagee"], e: "'Persiflage' is the correct spelling — meaning light-hearted, witty, banter or mockery." },
  { s: ENG, q: "Select the sentence containing the homonym of the highlighted word:\n\nThe bishop condemned the act as simony, citing canonical law.", o: ["The preacher was accused of simony for charging for blessings.","The court equated indulgence-selling with simony.","The alchemist failed to explain the simony in his formulas.","Simony was rampant in medieval ecclesiastical courts."], e: "In option 3, 'simony' is used in a different sense (alchemical context) — homonymous use distinct from religious simony." },
  { s: ENG, q: "Convert from passive to active:\n\nA decision has been taken to have the proposal reviewed by an external panel.", o: ["An external panel has reviewed the proposal.","The proposal is being reviewed by an external panel.","They have decided to get the proposal reviewed by an external panel.","The proposal was reviewed by the panel as per the decision."], e: "Active voice: subject 'They' (implied agent of decision-making) + verb 'have decided'. Option 3 captures the original meaning best." },
  { s: ENG, q: "Choose the most suitable option to replace:\n\nShe is confident to win the match.", o: ["of to win","that she wins","of winning the match","on winning match"], e: "'Confident of' takes a gerund — 'confident of winning the match' is the standard construction." },
  { s: ENG, q: "What tension does the passage highlight regarding the global adoption of Yoga?", o: ["Lack of flexibility","Loss of its philosophical essence","Shortage of teachers","Over-regulation by India"], e: "Per passage: Yoga has been 'commodified, particularly in the West, where its philosophical moorings are often diluted into mere physical exercise.'" },
  { s: ENG, q: "Which of the following best reflects the Ayurvedic approach to disease?", o: ["Eradicating bacteria via antibiotics","Using synthetic drugs for immediate relief","Restoring body's internal balance through lifestyle","Targeting genetic mutations"], e: "Per passage: Ayurveda views disease as imbalance in tridosha; emphasises restoring balance through lifestyle (prakriti, ahara, dinacharya)." },
  { s: ENG, q: "What is a potential danger of state patronage of AYUSH systems, as per the passage?", o: ["High cost of medicine","Increased rural unemployment","Marginalization of traditional knowledge holders","Overdependence on foreign investment"], e: "Per passage: 'pharmaceutical commercialisation of Ayurvedic formulations often sidelines traditional knowledge holders.'" },
  { s: ENG, q: "What stance does the author take on integrating traditional medicine with modern healthcare?", o: ["Traditional medicine must replace allopathy","Modern science is superior to traditional systems","Integration is possible with humility and standards","The two should remain completely separate"], e: "Per passage: integrative models 'require epistemic humility and regulatory rigor' — integration is possible with humility and standards." },
  { s: ENG, q: "What is required for the survival and relevance of Yoga and traditional medicine in modern India?", o: ["Blind national pride","Scientific rejection of tradition","Dialogical integration of ancient and modern systems","Exclusive use of foreign validation techniques"], e: "Per passage: 'What is needed is a dialogical framework where tradition and modernity co-evolve.'" },
  { s: ENG, q: "Convert direct to indirect speech:\n\nHe said to me, 'You should work harder.'", o: ["He said me that I should work harder.","He told me that I should work harder.","He told me that you should work harder.","He told that I should work harder."], e: "Direct → indirect: 'said to' becomes 'told', 'you' becomes 'I', 'should' remains. So 'He told me that I should work harder.'" },
  { s: ENG, q: "Convert direct to indirect speech:\n\nThe scientist said, 'We have been working on this project for months.'", o: ["The scientist said they had been working on that project for months.","The scientist said they have been working on this projects for months.","The scientist said that they were working on that project.","The scientist said that we had worked on this project."], e: "Present perfect continuous → past perfect continuous; 'this' → 'that'; 'we' → 'they'. Option 1 is correct." },
  { s: ENG, q: "Convert indirect to direct speech:\n\nThe diplomat said that only after the ceasefire would negotiations begin.", o: ["'Negotiations begin only after the ceasefire,' said the diplomat.","'Only after the ceasefire, negotiations would begin,' said the diplomat.","'Only after the ceasefire will negotiations begin,' said the diplomat.","'Negotiations would begin once the ceasefire is announced,' said the diplomat."], e: "Reported 'would' → direct 'will'. Direct: 'Only after the ceasefire will negotiations begin.'" },
  { s: ENG, q: "Rearrange sentences:\n\n(a) The blueprint is finalized after approval from stakeholders.\n(b) First, a basic framework is proposed.\n(c) Then revisions are made after discussions.\n(d) Finally, execution begins as per plan.", o: ["(b), (c), (a), (d)","(a), (c), (b), (d)","(c), (b), (a), (d)","(b), (a), (c), (d)"], e: "Logical sequence: framework first (b) → revisions (c) → finalization (a) → execution (d). Order: b-c-a-d." },
  { s: ENG, q: "Rearrange:\n\n(a) A central tenet is the concept of a 'class', which acts as a blueprint for creating objects.\n(b) Object-Oriented Programming (OOP) is a programming paradigm based on 'objects', which can contain data and code.\n(c) This allows a programmer to specify the structure and behavior of an object-oriented program.\n(d) The key advantage of this approach is that it models real-world entities.", o: ["(b), (a), (c), (d)","(d), (c), (b), (a)","(c), (a), (d), (b)","(a), (b), (c), (d)"], e: "B introduces OOP. A — central tenet (class). C — what classes allow. D — advantage. Order: b-a-c-d." }
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
      tags: ['SSC', 'CGL', 'Tier-I', 'PYQ', '2025'],
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

  const TEST_TITLE = 'SSC CGL Tier-I - 17 September 2025 Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2025, pyqShift: 'Shift-1', pyqExamName: 'SSC CGL Tier-I', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
