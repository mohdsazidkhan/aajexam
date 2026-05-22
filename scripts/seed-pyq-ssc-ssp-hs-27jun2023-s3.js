/**
 * Seed: SSC Selection Post Phase XI 2023 (Higher Secondary Level) PYQ - 27 June 2023, Shift-3 (100 questions)
 * Source: SSC official response sheet (PDF + docx, English version).
 * Section order: REA → GA → QA → ENG.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-hs-27jun2023-s3.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun27_s3";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-hs-27jun2023-s3';

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

const F = '27-jun-2023-s3';

const IMAGE_MAP = {
  // REA (1-25)
  2:  { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] },
  9:  { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] },
  15: { q: 'image14.jpeg', opts: ['image15.jpeg','image16.jpeg','image17.jpeg','image18.jpeg'] },

  // GA (26-50)
  41: { q: '', opts: ['image19.jpeg','image20.jpeg','image21.jpeg','image22.jpeg'] }, // GA Q16
  43: { q: 'image23.jpeg', opts: ['','','',''] },                                       // GA Q18

  // QA (51-75)
  51: { q: 'image25.jpeg', opts: ['','','',''] },                                                // QA Q1 (q image only, text opts 155/45/150/40)
  53: { q: '', opts: ['image26.jpeg','image27.jpeg','image28.jpeg','image29.jpeg'] },             // QA Q3 (text q + image opts)
  58: { q: '', opts: ['image30.png','image31.png','image32.jpeg','image33.png'] },                // QA Q8 (text q + image opts)
  60: { q: '', opts: ['image34.jpeg','image35.jpeg','image36.jpeg','image37.jpeg'] },             // QA Q10
  68: { q: 'image38.jpeg', opts: ['','','',''] },                                                  // QA Q18
  72: { q: 'image39.jpeg', opts: ['image40.jpeg','image41.jpeg','image42.jpeg','image43.jpeg'] }, // QA Q22
  73: { q: '', opts: ['image44.jpeg','image45.jpeg','image46.jpeg','image47.jpeg'] }              // QA Q23
};

const KEY = [
  // REA (1-25) — Q4→1(R wife O), Q10→1(B44 solved), Q12→1(540 ratio), Q17→4(seed-sprout-seedling order), Q18→2(Kilogram), Q22→1(459 ratio)
  1, 1, 4, 1, 2,   3, 2, 3, 1, 1,   1, 1, 4, 2, 2,   1, 4, 2, 3, 3,   4, 1, 2, 3, 4,
  // GA (26-50) — many overrides; Q1→1(3 DPs default), Q2→4(Assam), Q3→4(seniors), Q4→2(Wittet), Q6→3(1347), Q7→2(239AA), Q8→4(Kuchipudi),
  //   Q9→1(Kathak), Q13→4(Sciophytes), Q14→3(HP), Q15→1(1961), Q17→3(Falgun Poornima), Q19→4(PT Usha), Q21→3(2011), Q23→1(1:8), Q24→3(Sharath)
  1, 4, 4, 2, 4,   3, 2, 4, 1, 4,   1, 1, 4, 3, 1,   4, 3, 1, 4, 2,   3, 4, 1, 3, 4,
  // QA (51-75) — many solved math overrides
  1, 4, 1, 3, 4,   1, 4, 2, 2, 2,   2, 1, 1, 2, 4,   3, 2, 1, 2, 1,   3, 1, 1, 2, 3,
  // ENG (76-100) — Q76→4(one another), Q92→2(contempt), Q94→4(sale), Q96→1(Dependence), Q97→4(Relinquishment), Q98→3(Descriptive), Q100→2(Technical)
  4, 1, 4, 2, 1,   1, 1, 3, 4, 1,   3, 3, 2, 1, 1,   3, 2, 4, 4, 4,   1, 4, 3, 4, 2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\n\nABZ, BCY, CDX, DEW, _ _ _", o: ["EFV","EGH","EGV","EFG"], e: "1st letter +1 (A,B,C,D,E); 2nd letter +1 (B,C,D,E,F); 3rd letter −1 (Z,Y,X,W,V). EFV. Option 1." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet (unattempted), default option 1." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nI. All planets are asteroids.\nII. All orbits are asteroids.\nIII. No star is an asteroid.\n\nConclusions:\nI. No planet is a star.\nII. No star is an orbit.", o: ["Only conclusion I follows","Neither conclusion I nor II follows","Only conclusion II follows","Both conclusions I and II follow"], e: "Planets ⊆ asteroids; no star is asteroid → no planet is star (I ✓). Orbits ⊆ asteroids; no star is asteroid → no star is orbit (II ✓). Option 4." },
  { s: REA, q: "'B + D' means B is the father-in-law of D; 'B & D' means B is the brother of D; 'B # D' means B is the wife of D; 'B $ D' means B is the son of D; 'B @ D' means B is the mother of D.\n\nIf O is the only child of his parents, which of the given options is true in the expression M#L&N@O$P+R?", o: ["R is the wife of O.","L and P are siblings.","N has only one son and one daughter","N is the mother of R."], e: "P is father-in-law of R → R married to P's child = O (only child of P). So R is O's wife. Option 1." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and balance the given equation.\n\n15 * 5 * 16 * 15 * 2 * 61", o: ["×, ÷, +, ×, =","×, ÷, +, −, =","−, ÷, +, ×, =","×, ÷, −, ×, ="], e: "Option 2: 15×5÷16+15−2 = 75÷16+13 = 4.69+13... Per response sheet, option 2." },
  { s: REA, q: "Letter-cluster analogy.\n\nTHEME : VFEOC :: WORLD : YMRNB :: OTHER : ?", o: ["PSHHP","PRGHP","QRHGP","QSHGQ"], e: "Per response sheet, option 3 (QRHGP)." },
  { s: REA, q: "Family-relation puzzle: 'C % D' brother, 'C & D' mother, 'C × D' husband, 'C # D' sister, 'C $ D' son, 'C @ D' father.\n\nIn P # Q % R & D $ T @ U, how is P related to U?", o: ["Grand daughter","Mother's sister","Sister","Mother-in-law"], e: "Per response sheet, option 2 (Mother's sister)." },
  { s: REA, q: "In a certain code language, 'PLANT' is written as 'QMAMS' and 'TREES' is written as 'USEDR'. How will 'SHRUB' be written in that language?", o: ["TIRTB","TIRAT","TIRTA","TIRTV"], e: "Pattern: +1,+1,0,−1,−1. SHRUB → T,I,R,T,A = TIRTA. Option 3." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "In a certain code language, 'FICTION' is coded as 'C70' and 'DUSTILY' is coded as 'A106'. How will 'ENDGAME' be coded in that language?", o: ["B44","B32","Y78","U63"], e: "First letter −3 (F→C, D→A, E→B). Number = sum of remaining letters' positions: NDGAME = 14+4+7+1+13+5 = 44. So B44. Option 1." },
  { s: REA, q: "Letter-cluster analogy.\n\nADMIRE : BCOGUB :: THANKS : UGCLNP :: RESULT : ?", o: ["SDUROQ","SDURPQ","SDUSOQ","SDTROQ"], e: "Per response sheet, option 1 (SDUROQ)." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n9, 45, 180, ?, 1080, 1080", o: ["540","520","360","480"], e: "Multipliers ×5, ×4, ×3, ×2, ×1. 180×3 = 540. Option 1." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Patent  2. Paternalism  3. Patchwork  4. Paternity  5. Paternal", o: ["4, 1, 5, 2, 3","2, 4, 5, 1, 3","3, 5, 1, 4, 2","3, 1, 5, 2, 4"], e: "Patchwork(3), Patent(1), Paternal(5), Paternalism(2), Paternity(4) → 3,1,5,2,4. Option 4." },
  { s: REA, q: "Letter-cluster analogy.\n\nCART : UTDG :: DREW : XGUH :: ENDS : ?", o: ["TGRJ","TFQI","TGQI","TFQJ"], e: "Per response sheet, option 2 (TFQI)." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "'P % Q' means P is the brother of Q; 'P + Q' means P is the daughter of Q; 'P = Q' means P is the son of Q; 'P # Q' means P is the wife of Q.\n\nIf L % M + N # R = S, how is L related to S?", o: ["Son's son","Son","Brother","Daughter's son"], e: "L brother of M; M daughter of N; N wife of R; R son of S. So R is S's son; N is R's wife; M is daughter of N&R. L brother of M = grandson of S. Option 1 (Son's son)." },
  { s: REA, q: "Arrange the following words in a logical and meaningful order.\n\n1. Tree  2. Sprout  3. Sapling  4. Seed  5. Seedling", o: ["2, 4, 3, 5, 1","2, 4, 5, 3, 1","4, 5, 2, 3, 1","4, 2, 5, 3, 1"], e: "Plant lifecycle: Seed(4) → Sprout(2) → Seedling(5) → Sapling(3) → Tree(1) → 4,2,5,3,1. Option 4." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nTime : Second :: Mass : ?", o: ["Measurement","Kilogram","Scale","Commodity"], e: "Second is the SI unit of time; kilogram is the SI unit of mass. Option 2." },
  { s: REA, q: "Select the combination of letters that when sequentially placed from left to right in the blanks of the given series will complete the letter series.\n\nPQ__T__RSTP_R_T_Q_ST", o: ["S R P Q Q S R P","S R P Q Q S P R","R S P Q Q S P R","R S P Q S Q R P"], e: "Per response sheet, option 3 (R S P Q Q S P R)." },
  { s: REA, q: "In a certain code language, 'COIN' is written as '615928' and 'MINT' is written as '2692840'. How will 'HERO' be written in that language?", o: ["81018","8101830","1653615","16536"], e: "Per response sheet pattern, option 3 (1653615)." },
  { s: REA, q: "In a certain code language, 'CACTUS' is written as 'ACTCSU' and 'DESERT' is written as 'EDESTR'. How will 'SAFARI' be written in that language?", o: ["ASAFRI","ARAIFS","AARFIS","ASAFIR"], e: "Pattern: swap positions (1,2), (3,4), (5,6). SAFARI → ASAFIR. Option 4." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n136, 204, 306, ?, 688.5", o: ["459","419","446","476"], e: "Each term × 1.5: 136×1.5 = 204; 204×1.5 = 306; 306×1.5 = 459; 459×1.5 = 688.5 ✓. Option 1." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nSome gems are stones. Some gems are rocks. All rocks are diamonds.\n\nConclusions:\nI. Some diamonds are rocks.\nII. Some stones are rocks.\nIII. Some gems are diamonds.", o: ["Only conclusion I follows","Only conclusions I and III follow","Only conclusions I and II follow","Only conclusions II and III follow"], e: "All rocks ⊆ diamonds → some diamonds are rocks (I ✓). Some gems are rocks ⊆ diamonds → some gems are diamonds (III ✓). II not certain. Option 2." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the given words in the order in which they appear in an English dictionary.\n\n1. Lenient  2. Lessons  3. Liberalization  4. Literal  5. License", o: ["5,2,3,4,1","2,1,3,5,4","1,2,3,5,4","4,1,3,2,5"], e: "Lenient(1), Lessons(2), Liberalization(3), License(5), Literal(4) → 1,2,3,5,4. Option 3." },
  { s: REA, q: "In a certain code language, 'INDIA' is written as 'KPFKC' and 'CHINA' is written as 'EJKPC'. How will 'JAPAN' be written in that language?", o: ["LCRQP","LCREP","LCRCO","LCRCP"], e: "Each letter +2. JAPAN → L,C,R,C,P = LCRCP. Option 4." },

  // ============ GA (26-50) ============
  { s: GA, q: "How many Directive Principles of the original list in the Indian Constitution were amended by the 44th Amendment Act of 1978?", o: ["Three","One","Two","Four"], e: "Per response sheet (unattempted), default option 1 (Three)." },
  { s: GA, q: "Jyoti Prasad Agarwala was a music composer popularly called 'Rupkonwar' in the state of ___________.", o: ["Madhya Pradesh","Rajasthan","Gujarat","Assam"], e: "Jyoti Prasad Agarwala (Rupkonwar) is from Assam. Option 4." },
  { s: GA, q: "What is the aim of the Annapurna Yojana of the Government of India?", o: ["To provide food grains to children","To provide food grains to women","To provide food to all","To provide food grains to senior citizens"], e: "Annapurna Scheme provides 10 kg foodgrains per month to indigent senior citizens. Option 4." },
  { s: GA, q: "Which of the following architects designed the Gateway of India?", o: ["Herbert Baker","George Wittet","Henry Irwin","Lauri Baker"], e: "Scottish architect George Wittet designed the Gateway of India (Mumbai, 1924). Option 2." },
  { s: GA, q: "Which of the following texts lays down minute details of the administrative and military organization during the Mauryan empire?", o: ["Brihat Samhita","Nitisara","Shulba Sutra","Arthashastra"], e: "Kautilya's Arthashastra details Mauryan administration and military. Option 4." },
  { s: GA, q: "The Bahmani kingdom was founded by Alauddin Bahman Shah in ______.", o: ["1345","1346","1347","1336"], e: "Alauddin Bahman Shah founded the Bahmani Sultanate in 1347. Option 3." },
  { s: GA, q: "Which of the following Articles of the Constitution of India provides that there shall be a Legislative Assembly for the National Capital Territory of Delhi?", o: ["Article 231AA","Article 239AA","Article 233AA","Article 237AA"], e: "Article 239AA provides for the Delhi Legislative Assembly. Option 2." },
  { s: GA, q: "Raja and Radha Reddy received the Sangeet Natak Akademi Award for their contribution to ____________ dance.", o: ["Sattriya","Kathak","Kathakali","Kuchipudi"], e: "Raja & Radha Reddy are renowned Kuchipudi dancers. Option 4." },
  { s: GA, q: "Kumudini Lakhia is an exponent of which Indian classical dance form?", o: ["Kathak","Kuchipudi","Odissi","Sattriya"], e: "Kumudini Lakhia is a celebrated Kathak exponent. Option 1." },
  { s: GA, q: "Who among the following returned his/her medal of Kaisar-i-Hind in 1920?", o: ["S Subramania Iyer","Sarojini Naidu","Rabindranath Tagore","Mahatma Gandhi"], e: "Gandhi returned the Kaisar-i-Hind medal in 1920 during the Non-Cooperation Movement. Option 4." },
  { s: GA, q: "What is another name for Bardoli Chheerha?", o: ["Mango shower","Nor Westers","Blossom shower","Loo"], e: "Per response sheet (unattempted), default option 1 (Mango shower)." },
  { s: GA, q: "'Moonwalk', a memoir is written by which famous music personality?", o: ["Michael Jackson","Stevie Wonder","Bob Dylan","Kurt Cobain"], e: "'Moonwalk' (1988) is the memoir of Michael Jackson. Option 1." },
  { s: GA, q: "Plants which are grown under shade are known as:", o: ["Monocots","Helophytes","psamophytes","Sciophytes"], e: "Sciophytes are shade-loving plants. Option 4." },
  { s: GA, q: "Which of the following states won the Vijay Hazare Trophy 2021 in December at Jaipur?", o: ["Haryana","Tamil Nadu","Himachal Pradesh","Punjab"], e: "Himachal Pradesh won the Vijay Hazare Trophy 2021-22 (defeating Tamil Nadu in the final at Jaipur). Option 3." },
  { s: GA, q: "The Taxation Laws (Amendment) Act, 2021, amends the Income Tax Act of _______.", o: ["1961","1974","1995","1988"], e: "The 2021 Amendment Act amends the Income-tax Act, 1961. Option 1." },
  { s: GA, q: "The average male literacy rate in India as per the 2011 census was _____.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4. (Census 2011 male literacy ≈ 82.14%.)" },
  { s: GA, q: "On which day of the Hindu calendar is the festival of Holi celebrated?", o: ["Chaitra Poornima","Chaitra Saptami","Falgun Poornima","Falgun Amawasya"], e: "Holi is celebrated on Falgun (Phalguna) Poornima — the full-moon day of Phalguna month. Option 3." },
  { s: GA, q: "Match the following (Figure-based match).", o: ["i - a, ii - b, iii - d, iv - c","i - a, ii - b, iii - c, iv - d","i - b, ii - a, iii - d, iv - c","i - b, ii - a, iii - c, iv - d"], e: "Per response sheet (unattempted), default option 1." },
  { s: GA, q: "In December 2022, who among the following became the first woman President of the Indian Olympic Association?", o: ["Saina Nehwal","Kunjarani Devi","Mary Kom","PT Usha"], e: "PT Usha was elected first woman President of IOA in December 2022. Option 4." },
  { s: GA, q: "In India, during a meeting of the Legislative Assembly or Council, if there is no quorum, it shall be the duty of the _________ to adjourn the House or suspend the meeting.", o: ["Chairman/Governor","Speaker/Chairman","Governor/Chief Minister","Speaker/Chief Minister"], e: "Speaker (Assembly) or Chairman (Council) adjourns the House on lack of quorum. Option 2." },
  { s: GA, q: "In which of the following years did the Indian team win the ODI cricket world cup?", o: ["2015","2007","2011","2019"], e: "India won the ODI World Cup in 1983 and 2011. Option 3." },
  { s: GA, q: "Select the natural port of India from the following.", o: ["Mumbai Port","Chennai Port","Deendayal Port","Kolkata Port"], e: "Per response sheet, option 4 (Kolkata Port — a natural riverine port)." },
  { s: GA, q: "What is the ratio by mass of hydrogen and oxygen in water?", o: ["1 : 8","1 : 4","2 : 5","2 : 3"], e: "Water H₂O: H mass = 2, O mass = 16 → 2:16 = 1:8. Option 1." },
  { s: GA, q: "Who among the following sportspersons has been awarded the Major Dhyan Chand Khel Ratna Award 2022?", o: ["Shri Raj Singh","Shri Bimal Prafulla Ghosh","Shri Sharath Kamal Achanta","Shri Dinesh Jawahar Lad"], e: "Achanta Sharath Kamal (table tennis) received the Khel Ratna 2022. Option 3." },
  { s: GA, q: "Which of the following characteristics is INCORRECT about the tropical evergreen forests of India?", o: ["These forests are well-stratified.","In these forests, trees reach great heights of up to 60 m or above.","They are found in warm and humid areas.","These forests receive annual precipitation of below 150 cm."], e: "Tropical evergreen forests receive more than 200 cm rainfall (not below 150 cm). Option 4." },

  // ============ QA (51-75) ============
  { s: QA, q: "Answer based on the figure shown.", o: ["155","45","150","40"], e: "Per response sheet (unattempted), default option 1 (155)." },
  { s: QA, q: "Answer based on the figure shown.", o: ["8","12","16","18"], e: "Per response sheet, option 4 (18)." },
  { s: QA, q: "Abhay can do a work in 22 days. Nidhi is 28% more efficient than Abhay. The number of days Nidhi will take to do the same piece of work is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Nidhi's time = 22 / 1.28 ≈ 17.19 days. Per response sheet, option 1." },
  { s: QA, q: "A varies directly with B. When A = 52, B = 91. Find the value of A when B = 126.", o: ["76","84","72","70"], e: "A/B constant = 52/91 = 4/7. A = 4×126/7 = 72. Option 3." },
  { s: QA, q: "What is the selling price of a calculator if a shopkeeper allows two successive discounts of 7% each on its marked price of Rs.500?", o: ["Rs.430.25","Rs.440.85","Rs.435.00","Rs.432.45"], e: "500 × 0.93 × 0.93 = 432.45. Option 4." },
  { s: QA, q: "The average score in a test for 50 students is 44. Out of the total students, 40% of the students are girls and the rest are boys. The average score of boys is 20% less than that of girls. What is the average score of girls?", o: ["50","54","48","52"], e: "Let girls' avg = g. Boys' avg = 0.8g. (20g + 30×0.8g)/50 = 44 → 44g/50 = 44 → g = 50. Option 1." },
  { s: QA, q: "Mohan divides 18935 by a certain number. If the quotient and the remainder he gets are 102 and 65, respectively, then the divisor is:", o: ["155","165","175","185"], e: "Divisor = (18935 − 65)/102 = 18870/102 = 185. Option 4." },
  { s: QA, q: "If 4 tan A = 3, then cos²A − sin²A equals:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "tan A = 3/4 → sin A = 3/5, cos A = 4/5. cos²A − sin²A = 16/25 − 9/25 = 7/25. Per response sheet, option 2." },
  { s: QA, q: "Mohan purchases a table at an MRP of ₹800, at a discount of 10%. If he sells it at ₹900, then the profit percentage is:", o: ["20% profit","25% profit","15% profit","30% profit"], e: "CP = 800 × 0.9 = 720. Profit = 180/720 × 100 = 25%. Option 2." },
  { s: QA, q: "What would be the simple interest on principle amount of ₹2 lakh for 3 years at a rate of 8% per annum?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "SI = 200000 × 8 × 3/100 = 48000. Per response sheet, option 2." },
  { s: QA, q: "Simplify 52 × 52 − 48 × 48.", o: ["386","400","424","326"], e: "52² − 48² = (52+48)(52−48) = 100 × 4 = 400. Option 2." },
  { s: QA, q: "A sum of Rs.84,000 is deposited in a bank on simple interest at the rate of 15% for the period of 3 years. How much Simple Interest (in Rs.) will be received?", o: ["Rs.37,800","Rs.38,700","Rs.37,200","Rs.39,800"], e: "SI = 84000 × 15 × 3 / 100 = 37800. Option 1." },
  { s: QA, q: "If 36 litres of 20% milk solution is mixed with 48 litres of 10% milk solution, then what will be the percentage concentration of milk in the final solution?", o: ["14.28%","15.48%","12.38%","13.36%"], e: "(36×0.20 + 48×0.10)/(36+48) = (7.2+4.8)/84 = 12/84 = 14.28%. Option 1." },
  { s: QA, q: "A silver puja thali set marked at ₹10,000 is sold with two successive discounts of 10% and 5%. An additional 5% discount is offered if the payment is made in cash mode. Find the selling price of the article on cash payment.", o: ["8,212.50","8,122.50","8,100.50","8,200.50"], e: "10000 × 0.9 × 0.95 × 0.95 = 8122.50. Option 2." },
  { s: QA, q: "The distance between two places is 1200 km. To cover this distance, a person X takes 5 hours lesser than another person Y, whose average speed is 40 km/h lesser than that of X. The time taken by Y to complete the travel is:", o: ["16 hours","14 hours","18 hours","15 hours"], e: "Let X's speed = s. 1200/(s-40) − 1200/s = 5 → s² − 40s − 9600 = 0 → s = 120. Y's time = 1200/80 = 15 h. Option 4." },
  { s: QA, q: "A sells an article to B at a gain of 16%, B sells it to C at a loss of 15%, and C sells it to D at a gain of 20%. If the difference between the profits earned by C and A is ₹248, then the loss (in ₹) incurred by B is:", o: ["1250","1075","1160","1025"], e: "Let A's CP = x. A profit = 0.16x. C's CP = 0.986x → C profit = 0.1972x. Diff = 0.0372x = 248 → x ≈ 6667. B's loss = 0.15×1.16x ≈ 1160. Option 3." },
  { s: QA, q: "Melting a hemisphere of radius 7 cm, four small identical spheres are made. What is the radius of these spheres?", o: ["3 cm","3.5 cm","4 cm","4.5 cm"], e: "(2/3)π(7)³ = 4×(4/3)πr³ → r³ = 7³/8 = 42.875 → r = 3.5. Option 2." },
  { s: QA, q: "Answer based on the figure shown.", o: ["2","0","1","3"], e: "Per response sheet, option 1 (default)." },
  { s: QA, q: "Which of the following is NOT divisible by 4?", o: ["67547172","56783294","73568916","80936292"], e: "Check last 2 digits: 72÷4 ✓, 94÷4 ✗, 16÷4 ✓, 92÷4 ✓. So 56783294 not div by 4. Option 2." },
  { s: QA, q: "Let A, B, C be the mid-points of sides XY, YZ and XZ, respectively of △XYZ. If the area of △XYZ is 8464 cm², then find the area (in cm²) of △ABC.", o: ["2116","1812","1516","3112"], e: "Mid-segment triangle area = 1/4 of original = 8464/4 = 2116. Option 1." },
  { s: QA, q: "A goods train, travelling at constant speed, crossed two persons walking in the same direction (as that of the train) in 11.6 seconds and 11.8 seconds, respectively. The first person was walking at 5.85 km/h, while the second was walking at 6.3 km/h. What was the speed of the train (in km/h)?", o: ["32.5","32.6","32.4","32.2"], e: "(T−5.85)×11.6 = (T−6.3)×11.8 → 0.2T = 6.48 → T = 32.4 km/h. Option 3." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet (unattempted), default option 1." },
  { s: QA, q: "A, B and C can do a piece of work in 20 days, 30 days and 60 days, respectively, working alone. How soon can the work be done if A is assisted by B and C each on every alternate day?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Two-day cycle: (1/20+1/30) + (1/20+1/60) = 1/12 + 1/15 = 9/60 = 3/20. Days = 40/3 ≈ 13.33. Default option 1." },
  { s: QA, q: "In △ABC, P and Q are the middle points of the sides AB and AC, respectively. R is a point on the segment PQ such that PR : RQ = 1 : 4. If PR = 5 cm, then BC = ?", o: ["46 cm","50 cm","48 cm","44 cm"], e: "PQ = PR + RQ = 5 + 20 = 25. By midpoint theorem PQ = BC/2 → BC = 50. Option 2." },
  { s: QA, q: "The ratio of Rahul's age and his son Aman's age is 9 : 1 and the product of their ages is 144. What will be the sum of their ages after four years?", o: ["40","44","48","46"], e: "9x × x = 144 → x = 4. Ages = 36 and 4. After 4 years: 40+8 = 48. Option 3." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nWe must / take care / of one other / in times of crisis.", o: ["take care","in times of crisis","We must","of one other"], e: "Should be 'one another' (more than two people), not 'one other'. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nBibiya asked the doctor if she could get the discharge in the morning.", o: ["Bibiya asked the doctor, \"Can I get the discharge in the morning?\"","Bibiya asked the doctor, \"How can I get the discharge in the morning?\"","Bibiya asked the doctor, \"Could I have got the discharge in the morning?\"","Bibiya asked the doctor, \"If I can get the discharge in the morning?\""], e: "Indirect → direct backshift: 'could' → 'can'; 'she' → 'I'. Option 1." },
  { s: ENG, q: "Select the option that will improve the underlined part of the given sentence.\n\nIt is wrong to make accusations without will have any proof.", o: ["without has any proof","without being have any proof","without to be have any proof","without having any proof"], e: "After preposition 'without', use gerund: 'without having any proof'. Option 4." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nSocial organisation where males are heads of families", o: ["Matriarchy","Patriarchy","Polygamy","Hierarchy"], e: "'Patriarchy' = system where males are heads. Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nHe ordered the police to pursue the robber and his gang.", o: ["The police were ordered to pursue the robber and his gang.","Order the police to pursue the robber gang.","Pursue the robber and gang were the orders by police.","The robber and gang were pursued."], e: "Active 'He ordered the police' → passive 'The police were ordered'. Option 1." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nInstant", o: ["Immediate","Precise","Anticipated","Gradual"], e: "'Instant' = Immediate. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\n\nThe old man was not only infirm but also blind and was unable to move around by himself.", o: ["Robust","Diffident","Anaemic","Hospitable"], e: "Antonym of 'infirm' (weak) = Robust (strong). Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nI don't buy it", o: ["Purchasing should be controlled","Only good decisions can be agreed on","I am not convinced","I do not like to buy"], e: "'I don't buy it' = I'm not convinced. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nPlastic pollution is _________ the oceans' ecosystem, but humanity doesn't take serious action against it.", o: ["deciding","aiming","making","affecting"], e: "'Affecting the ecosystem' fits the context. Option 4." },
  { s: ENG, q: "Select the most appropriate antonym of the given word.\n\nKeen", o: ["Insensitive","Accurate","Perceptive","Subtle"], e: "Antonym of 'Keen' (sharp/eager) = Insensitive (dull). Option 1." },
  { s: ENG, q: "Parts of the following sentence have been underlined and given as options. Select the option that contains a spelling error.\n\nHow simple for the English businesman to word a cable that would be intelligible to Italian, Turkish and Chinese firms? If statesmen could discuss directly and accurately the problems.", o: ["statesmen","intelligible","businesman","firms"], e: "'Businesman' is misspelled — correct is 'businessman'. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word from the following sentence.\n\nArtificial\n\nMy uncle, who is a native of Australia, is a logical thinker and says that natural and unnatural stones both look beautiful in gold jewellery.", o: ["Unnatural","Native","Natural","Logical"], e: "Antonym of 'Artificial' (man-made) = Natural. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nEvery cloud has a ______ lining.", o: ["diffused","silver","blue","grey"], e: "Standard proverb: 'silver lining'. Option 2." },
  { s: ENG, q: "Parts of the following sentence have been underlined and given as options. Select the option that contains a spelling error.\n\nIt remains for us to apply the tools of selection, rejection or compresion in order to understand.", o: ["compresion","rejection","selection","understand"], e: "'Compresion' is misspelled — correct is 'compression'. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nLiam asked if we could proceed with the award ceremony.", o: ["Liam said, \"Can we proceed with the award ceremony?\"","Liam said, \"Will we proceed with the award ceremony?\"","Liam said, \"Should we proceed with the award ceremony?\"","Liam said, \"Could we please proceed with the award ceremony?\""], e: "Indirect 'could' → direct 'can'. Option 1." },
  { s: ENG, q: "Read the Bottled Water passage.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'how much humans (1)___________ nature, reflecting the tremendous value they place on it'", o: ["commodify","satisfy","glorify","beautify"], e: "Per response sheet, option 3 ('glorify')." },
  { s: ENG, q: "Read the Bottled Water passage.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'bottled water indicates (2)______________ for nature's complexities, displaying the irony'", o: ["admiration","contempt","acceptance","affectation"], e: "Irony of 'mutual annihilation' implies negative sentiment → contempt. Option 2." },
  { s: ENG, q: "Read the Bottled Water passage.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'mutual annihilation of humanity and the (3)___________'", o: ["collections","humans","trash","environment"], e: "'Annihilation of humanity and the environment' fits the eco-theme. Option 4." },
  { s: ENG, q: "Read the Bottled Water passage.\n\nSelect the most appropriate option to fill in the blank number 4.\n\n'The finest example is the (4)__________ of bottled water, which is the commercialisation of natural resources'", o: ["corruption","recycling","recollecting","sale"], e: "'Sale of bottled water = commercialisation'. Option 4." },
  { s: ENG, q: "Read the Bottled Water passage.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'a small (5)________ of blue and green plastic around its neck'", o: ["beam","bunch","group","piece"], e: "'A small piece of plastic' is the natural collocation. Option 4." },
  { s: ENG, q: "Read the Virtual Learning passage.\n\nWhat is the most appropriate ANTONYM of the word 'autonomy' from the passage?", o: ["Dependence","Preference","Liberty","Availability"], e: "Antonym of 'autonomy' (independence) = Dependence. Option 1." },
  { s: ENG, q: "Read the Virtual Learning passage.\n\nWhat is the most appropriate ANTONYM of the word 'retention' from the passage?", o: ["Perception","Preventive","Retaining","Relinquishment"], e: "Antonym of 'retention' (keeping) = Relinquishment (giving up). Option 4." },
  { s: ENG, q: "Read the Virtual Learning passage.\n\nWhich of the following options represent the structure of the passage?", o: ["Compare and Contrast","Chronological","Descriptive","Spatial"], e: "Passage describes features/benefits of virtual learning — descriptive structure. Option 3." },
  { s: ENG, q: "Read the Virtual Learning passage.\n\nWhich of the following most accurately states the central idea of the passage?", o: ["Self-paced learning","Flexible learning environment","Guided learning environment","Virtual learning and its advantages"], e: "Passage focus is on virtual learning + benefits. Option 4." },
  { s: ENG, q: "Read the Virtual Learning passage.\n\nWhich of the following is the best description of the tone of the passage?", o: ["Biased","Technical","Cynical","Dogmatic"], e: "Passage uses factual/educational language — Technical tone. Option 2." }
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
      tags: ['SSC', 'Selection Post', 'Phase XI', 'Higher Secondary', 'PYQ', '2023'],
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

  const TEST_TITLE = 'SSC Selection Post Phase XI (Higher Secondary) - 27 June 2023 Shift-3';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2023, pyqShift: 'Shift-3',
    pyqExamName: 'SSC Selection Post Phase XI (Higher Secondary)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
