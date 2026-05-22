/**
 * Seed: SSC Selection Post Phase XI 2023 (Matriculation Level) PYQ - 30 June 2023, Shift-4 (100 questions)
 * Source: SSC official response sheet (PDF + docx, English version).
 * Section order: REA → GA → QA → ENG.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-30jun2023-s4.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun30_s4";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-30jun2023-s4';

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

const F = '30-jun-2023-s4';

const IMAGE_MAP = {
  // REA (1-25)
  1:  { q: 'image2.jpeg', opts: ['image4.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] },
  9:  { q: '', opts: ['image9.jpeg','image10.jpeg','image11.jpeg','image12.jpeg'] },
  18: { q: 'image13.jpeg', opts: ['image14.png','image15.png','image16.png','image17.png'] },
  22: { q: 'image18.jpeg', opts: ['image19.jpeg','image20.jpeg','image21.jpeg','image22.jpeg'] },

  // QA (overall 51-75)
  54: { q: 'image23.jpeg', opts: ['image24.jpeg','image25.jpeg','image26.jpeg','image27.jpeg'] }, // QA Q4
  63: { q: 'image28.jpeg', opts: ['','','',''] },  // QA Q13 text options
  64: { q: 'image29.jpeg', opts: ['','','',''] },  // QA Q14 text options
  68: { q: '', opts: ['image30.jpeg','image31.jpeg','image32.jpeg','image33.jpeg'] } // QA Q18 option images
};

const KEY = [
  // REA (1-25) — Q4 override 1 (Father), Q15 override 1 (Sheep→Shear→Wool→Knit→Sweater)
  2, 2, 4, 1, 3,   1, 3, 4, 2, 3,   4, 3, 2, 4, 1,   3, 4, 1, 3, 3,   4, 2, 3, 2, 4,
  // GA (26-50) — many overrides per GK
  4, 2, 3, 2, 1,   1, 2, 4, 1, 1,   3, 4, 1, 3, 4,   1, 2, 1, 1, 4,   4, 4, 4, 1, 1,
  // QA (51-75) — many overrides per solved math
  3, 4, 3, 3, 1,   1, 3, 1, 1, 4,   2, 3, 1, 2, 4,   4, 3, 4, 1, 4,   2, 3, 4, 3, 3,
  // ENG (76-100) — Q80→3, Q82→1, Q83→4, Q84→3 (was '--'), Q85→3, Q88→4, Q92→1 (was '--'), Q96→1, Q97→2 (was '--')
  1, 3, 2, 4, 3,   4, 1, 4, 3, 3,   3, 3, 4, 2, 1,   1, 1, 4, 1, 1,   1, 2, 4, 4, 1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n3, 12, 30, 57, 93, 138, 192, ?", o: ["222","255","252","225"], e: "Differences +9,+18,+27,+36,+45,+54,+63 (AP +9). 192+63 = 255. Option 2." },
  { s: REA, q: "Select the option that is related to the fourth term in the same way as the first term is related to the second term and the fifth term is related to the sixth term.\n\n8 : 512 :: ? : 1728 :: 18 : 5832", o: ["8","14","9","12"], e: "Pattern n³. 8³=512 ✓; 18³=5832 ✓; ?³=1728 → ?=12. Option 4." },
  { s: REA, q: "'A # B' means A is the husband of B; 'A & B' means A is the daughter of B; 'A @ B' means A is the grandmother of B; 'A % B' means A is the son of B.\n\nIf E @ F % G # H & I @ J, then how is G related to J if I has only one child?", o: ["Father","Uncle","Grandfather","Son"], e: "I's only child is H (her daughter); J is I's grandchild → J must be H's child. G is H's husband → G is J's Father. Option 1." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nTermites : Colony :: Musicians : ?", o: ["Crowd","Army","Band","Brood"], e: "A group of termites is a Colony; a group of musicians is a Band. Option 3." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) and complete the given series?\n\nHERO, GISM, ?, EQUI, DUVG", o: ["FMTK","FMUL","FNUL","FMUK"], e: "1st letter −1 (H,G,F,E,D); 2nd letter +4 (E,I,M,Q,U); 3rd letter +1 (R,S,T,U,V); 4th letter −2 (O,M,K,I,G) → FMTK. Option 1." },
  { s: REA, q: "'P # Q' means P is the wife of Q; 'P % Q' means P is the father of Q; 'P & Q' means P is the son of Q; 'P @ Q' means P is the mother of Q.\n\nIf A % B # C % D & B @ E, then how is A related to E?", o: ["Father's father","Wife","Mother's father","Brother"], e: "A father of B; B wife of C; D son of C; B mother of E. So B is E's mother; A is B's father → A is E's Mother's father. Option 3." },
  { s: REA, q: "In a certain code language, 'DEVOUT' is written as 'FIXSWX' and 'BLAMED' is written as 'DPCQGH'. How will 'SWEET' be written in that language?", o: ["UZIIV","UAIGV","UYGGV","UAGIV"], e: "Per response sheet pattern, option 4 (UAGIV)." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n41 * 5 * 3 * 10 * 2 = 31", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "In a certain code language, 'GOLDEN' is written as 'OFEMPH' and 'INCOME' is written as 'FNPDOJ'. How will 'METHOD' be written in that language?", o: ["DOHTEM","EQIUFN","EPIUFN","DPUIEN"], e: "Per response sheet pattern, option 3 (EPIUFN)." },
  { s: REA, q: "'A # B' means A is the brother of B; 'A @ B' means A is the daughter of B; 'A & B' means A is the husband of B; 'A % B' means A is the wife of B.\n\nIf V & S @ F % H # T @ Q, then how is F related to Q?", o: ["Mother","Husband's mother","Daughter","Son's wife"], e: "T daughter of Q; H brother of T → H is Q's son. F wife of H → F is Q's Son's wife (daughter-in-law). Option 4." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Earn  2. Efficient  3. Educator  4. Effort  5. Elite  6. Eloquence", o: ["1, 3, 4, 2, 5, 6","1, 3, 2, 4, 6, 5","1, 3, 2, 4, 5, 6","1, 3, 4, 5, 6, 2"], e: "Earn(1), Educator(3), Efficient(2), Effort(4), Elite(5), Eloquence(6) → 1,3,2,4,5,6. Option 3." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\nh f _ _ r p i _ _ x t _ p i h f _ t r _ _", o: ["xthfrpxi","xthfrxpi","xthfxrpi","xthrxpfi"], e: "Per response sheet, option 2 (xthfrxpi)." },
  { s: REA, q: "Select the option that is related to the fourth term in the same way as the first term is related to the second term and the fifth term is related to the sixth term.\n\n64 : 320 :: ? : 70 :: 22 : 110", o: ["17","8","12","14"], e: "Pattern n × 5. 64×5=320 ✓; 22×5=110 ✓; 14×5=70 → ?=14. Option 4." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in a logical and meaningful order.\n\n1. Shear  2. Wool  3. Knit  4. Sweater  5. Sheep", o: ["5, 1, 2, 3, 4","4, 1, 3, 2, 5","5, 1, 3, 2, 4","3, 2, 1, 4, 5"], e: "Sheep(5) → Shear(1) → Wool(2) → Knit(3) → Sweater(4) → 5,1,2,3,4. Option 1." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) and complete the given series?\n\nSTAR, PUBO, ?, JWDI, GXEF", o: ["MVCK","NVCM","MVCL","NVCL"], e: "1st −3 (S,P,M,J,G); 2nd +1 (T,U,V,W,X); 3rd +1 (A,B,C,D,E); 4th −3 (R,O,L,I,F) → MVCL. Option 3." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nSome horses are donkeys. Some goats are sheep. All sheep are fishes.\n\nConclusions:\n(I) Some goats are donkeys.\n(II) Some fishes are goats.\n(III) Some horses are sheep.", o: ["Either conclusion I or conclusion III follows","None of the conclusions follow","Only conclusion I follows","Only conclusion II follows"], e: "Some goats are sheep ⊆ fishes → some fishes are goats (II ✓). I and III not certain. Option 4." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nAll beds are pillows. No pillow is a chair. Some tables are chairs.\n\nConclusions:\nI. Some tables are pillows.\nII. Some beds are tables.\nIII. No bed is a chair.", o: ["Both conclusions I and II follow.","Both conclusions I and III follow.","Only conclusion III follows.","Only conclusion II follows."], e: "All beds ⊆ pillows; no pillow is chair → no bed is chair (III ✓). I and II not certain. Option 3." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nSculptor : Chisel :: Woodcutter : ?", o: ["Scalpel","Anvil","Axe","Plough"], e: "A sculptor uses a chisel; a woodcutter uses an axe. Option 3." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nSCENE : DMDBR :: STORY : XQNSR :: WRITE : ?", o: ["DUHSV","DSJSV","ETIRW","DSHQV"], e: "Per response sheet, option 4 (DSHQV)." },
  { s: REA, q: "Answer based on the figure shown (visual analogy).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nSome shops are houses. Some houses are garages. Some garages are cameras.\n\nConclusions:\nI. Some cameras are shops.\nII. All cameras are houses.\nIII. Some cameras are garages.", o: ["Only conclusion II follows","All the conclusions follow","Only conclusion III follows","Only conclusion I follows"], e: "Some garages are cameras → some cameras are garages (III ✓). I and II not certain. Option 3." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nLARGEST : ESTGLAR :: QUALITY : ITYLQUA :: QUICKLY : ?", o: ["UCLKYQI","KLYCQUI","KQICUYL","KYLCUQI"], e: "Rearrange positions 5,6,7,4,1,2,3. QUICKLY → K,L,Y,C,Q,U,I = KLYCQUI. Option 2." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nSome chairs are tables. All chairs are stairs. All tables are roofs.\n\nConclusions:\nI. Some roofs are stairs.\nII. Some roofs are chairs.\nIII. All tables are stairs.", o: ["Only conclusions II and III follow.","All conclusions follow.","Only conclusions I and III follow.","Only conclusions I and II follow."], e: "Some chairs are tables; all chairs ⊆ stairs; all tables ⊆ roofs. Some chairs = some tables → some stairs are tables → some roofs are stairs (I ✓). Some tables are chairs → some roofs are chairs (II ✓). III not certain. Option 4." },

  // ============ GA (26-50) ============
  { s: GA, q: "What is another name for centre-seeking force?", o: ["Van der Waals","Centrifugal","Gravitational","Centripetal"], e: "Centripetal force is the centre-seeking force in circular motion. Option 4." },
  { s: GA, q: "Which cell organelle containing millions of membrane-bound ribosomes is involved in the production, folding, quality control and dispatch of certain proteins?", o: ["Peroxisome","Rough endoplasmic reticulum","Mitochondrion","Golgi apparatus"], e: "Rough ER (RER) has membrane-bound ribosomes for protein synthesis and quality control. Option 2." },
  { s: GA, q: "Which is the oldest oil producing state of India?", o: ["Gujarat","Maharashtra","Assam","Telangana"], e: "Oil production in India began at Digboi, Assam (1889). Option 3." },
  { s: GA, q: "Who among the following Gupta king adopted the title of Vikramaditya?", o: ["Chandragupta I","Chandragupta II","Skandagupta","Samudragupta"], e: "Chandragupta II adopted the title 'Vikramaditya'. Option 2." },
  { s: GA, q: "Which mobile app was launched to strengthen the pre-litigation mechanism in the country in November 2021?", o: ["Citizens' Tele-Law Mobile App","Citizens' e-salah Mobile App","Citizens' e-Law Mobile App","Citizens' e-legal Mobile App"], e: "Citizens' Tele-Law Mobile App was launched in Nov 2021 for pre-litigation advice. Option 1." },
  { s: GA, q: "What does the Lincoln index measure?", o: ["Population Size","Population Natality Rate","Population Mortality Rate","Population Density"], e: "The Lincoln Index uses capture-recapture to estimate Population Size. Option 1." },
  { s: GA, q: "Which of the following Articles of the Constitution of India lays down the maximum strength of the Rajya Sabha as 250?", o: ["Article 85","Article 80","Article 83","Article 81"], e: "Article 80 fixes the maximum strength of the Rajya Sabha at 250 members. Option 2." },
  { s: GA, q: "In January 2022, which Indian badminton player won the Yonex-Sunrise India Open with a straight-game victory over the reigning world champion Loh Kean Yew of Singapore in the men's singles final in Delhi?", o: ["Srikanth Kidambi","Prannoy Kumar","B Sai Praneeth","Lakshya Sen"], e: "Lakshya Sen won the India Open 2022 by beating Loh Kean Yew. Option 4." },
  { s: GA, q: "Who among the following was given the Filmfare Award in the Best Choreographer category in 2008?", o: ["Saroj Khan","Remo D'Souza","Geeta Kapoor","Farah Khan"], e: "Saroj Khan won the 2008 Filmfare Best Choreographer Award (for 'Jab We Met'). Option 1." },
  { s: GA, q: "Which of the following states has the highest literacy rate as per the census of India 2011?", o: ["Kerala","Tamil Nadu","West Bengal","Maharashtra"], e: "Kerala recorded the highest literacy rate (93.91%) in Census 2011. Option 1." },
  { s: GA, q: "The second session of Round Table Conference was held in:", o: ["1932","1929","1931","1930"], e: "The 2nd Round Table Conference took place in Sept–Dec 1931 (Gandhi attended). Option 3." },
  { s: GA, q: "Which clause of Article 51A of the Constitution of India requires to value and preserve the rich heritage of our composite culture?", o: ["Clause d","Clause c","Clause a","Clause f"], e: "Article 51A(f) directs citizens to value and preserve the rich heritage of our composite culture. Option 4." },
  { s: GA, q: "Which sea, located in the north-western part of the Indian Ocean, joins the Gulf of Oman in the north-west and the Gulf of Aden in the south-west and covers a total area of 1,491,000 square miles?", o: ["Arabian Sea","Mediterranean Sea","Caribbean Sea","Coral Sea"], e: "The Arabian Sea connects to the Gulf of Oman (NW) and Gulf of Aden (SW). Option 1." },
  { s: GA, q: "Who among the following musicians was awarded Grammy in Music Album category for his collaborative album 'Global Drum Project' along with Mickey Hart, Sikiru Adepoju and Giovanni Hidalgo?", o: ["Ricky Kej","Vikku Vinayakram","Zakir Hussain","A R Rahman"], e: "Zakir Hussain shared the Grammy (Best Contemporary World Music Album 2009) for 'Global Drum Project'. Option 3." },
  { s: GA, q: "Who among the following succeeded K Sivan as the ISRO chairman, in January 2022?", o: ["Shailesh Nayak","A S Kiran Kumar","VK Saraswat","S Somanath"], e: "S Somanath succeeded K Sivan as ISRO chairman in January 2022. Option 4." },
  { s: GA, q: "Who among the following sportspersons is credited with the autobiography 'Undisputed Truth'?", o: ["Mike Tyson","Matthew Hayden","Muhammad Ali","Kevin Pietersen"], e: "'Undisputed Truth' (2013) is the autobiography of boxer Mike Tyson. Option 1." },
  { s: GA, q: "'Amuktamalyada', a Telugu work, is composed by which of the following rulers?", o: ["Sadasiva Raya","Krishnadevaraya","Vira Narasimha Raya","Achyuta Deva Raya"], e: "'Amuktamalyada' is a Telugu poem by Vijayanagara king Krishnadevaraya. Option 2." },
  { s: GA, q: "What was the minimum consumption expenditure (per capita per month) set as a benchmark of the poverty line for rural India in 1979?", o: ["49.09","43.5","56.7","62.1"], e: "The 1979 Task Force (Y K Alagh) fixed rural poverty line at Rs.49.09 per capita per month. Option 1." },
  { s: GA, q: "In which of the following sessions of the Indian National Congress was Dadabhai Naoroji the President?", o: ["Calcutta Session, 1886","Madras Session, 1887","Bombay Session, 1889","Allahabad Session, 1892"], e: "Dadabhai Naoroji presided at the 2nd INC session at Calcutta in 1886 (and again later). Option 1." },
  { s: GA, q: "How many urban post offices are there in India in 2020?", o: ["17503","15703","15793","15907"], e: "Per India Post Annual Report 2020, urban post offices count ≈ 15,907. Option 4." },
  { s: GA, q: "The first ICC T20 Cricket World Cup was held in the year_______.", o: ["2009","2003","2006","2007"], e: "The inaugural ICC Men's T20 World Cup was held in 2007 (South Africa). Option 4." },
  { s: GA, q: "Which of the following terms is NOT related to the structure of a stupa?", o: ["Harmika","Vedika","Chhatra","Vimana"], e: "Stupa structures include Harmika, Vedika, Chhatra. Vimana is a temple-architecture term — NOT part of a stupa. Option 4." },
  { s: GA, q: "Who among the following has won the ICC Women's Cricketer of the Year 2021?", o: ["Lizelle Lee","Harmanpreet Kaur","Tammy Beaumont","Smriti Mandhana"], e: "Smriti Mandhana was named ICC Women's Cricketer of the Year 2021. Option 4." },
  { s: GA, q: "Which of the following steps must be performed first in the classical Odissi dance?", o: ["Mangalacharan","Pallavi","Abhinaya","Batu"], e: "Mangalacharan is the invocatory opening of an Odissi recital. Option 1." },
  { s: GA, q: "In which year did Rajpath become the permanent venue for the Republic Day parade?", o: ["1956","1957","1954","1955"], e: "Per response sheet, option 1 (1956)." },

  // ============ QA (51-75) ============
  { s: QA, q: "S and M can do a piece of work in 9 days, while M alone can finish it in 12 days. In how many days can S alone finish the work?", o: ["46 days","35 days","36 days","27 days"], e: "S's rate = 1/9 − 1/12 = (4−3)/36 = 1/36 → 36 days. Option 3." },
  { s: QA, q: "What is the average marks of all the students if the average marks of three batches of 55, 60, and 45 students is 50, 55, and 60, respectively?", o: ["51.23","55.98","57.42","54.68"], e: "(55×50 + 60×55 + 45×60)/160 = 8750/160 = 54.6875 ≈ 54.68. Option 4." },
  { s: QA, q: "A starts a business with ₹45,000 and was joined afterwards by B with ₹30,000. When did B join if the profit at the end of the year was divided in the ratio 2 : 1?", o: ["After 6 months","After 12 months","After 3 months","After 9 months"], e: "45000×12 : 30000×t = 2:1 → 540000 = 2×30000t → t=9 (B's months). B joined after 12−9 = 3 months. Option 3." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "Ram reads 200 pages at the rate of 70 pages/hour in the morning. In the evening, when he was tired, he read 200 pages at the rate of 30 pages/hour. What was his average rate of reading, in pages per hour?", o: ["42 pages/hour","50 pages/hour","62 pages/hour","30 pages/hour"], e: "Avg = total pages / total time = 400 / (200/70 + 200/30) = 400 / (200/21 × 1 + ...) = 42 pages/h. Option 1." },
  { s: QA, q: "The six-digit number 7x1yyx is a multiple of 33 for non-zero digits x and y. Which of the following could be a possible value of (x + y)?", o: ["5","4","2","3"], e: "Divisibility by 11: (7+1+y) − (x+y+x) = 8−2x = 0 → x=4. Div by 3: 8+2(x+y) divisible by 3 → with x=4, y=1 works (sum 18). x+y = 5. Option 1." },
  { s: QA, q: "A book seller bought a book for Rs.40 and sold it for Rs.45. Find his gain percentage.", o: ["20%","15%","12.5%","17.5%"], e: "Gain% = (45−40)/40 × 100 = 12.5%. Option 3." },
  { s: QA, q: "Despite giving 23% discount on the book, Raj makes 10% profit. If Raj earns Rs.63 profit, then find the marked price of the book.", o: ["Rs.900","Rs.880","Rs.988","Rs.852"], e: "Profit 63 = 0.1×CP → CP=630. SP = 693. MP = 693/0.77 = 900. Option 1." },
  { s: QA, q: "A family member spends 25% of his monthly income on food, 35% of the remaining on a home loan and other bank debts, and half of the rest on the education of the children. If the member saves ₹46,215 every year, then the monthly income of the member is:", o: ["₹15,800","₹190,248","₹15,520","₹19,200"], e: "After food 0.75I; after debts 0.4875I; after education 0.24375I per month → 2.925I = 46215 → I = ₹15,800. Option 1." },
  { s: QA, q: "In a grocery shop, Samarth sold 950 g of sugar to a customer in place of 1 kg for ₹54. The cost price of 1 kg sugar was ₹36. How much profit (in ₹) did he earn on selling the sugar?", o: ["16.2","18.7","20.2","19.8"], e: "SP = 54; CP for 950g = 36 × 0.95 = 34.20. Profit = 19.80. Option 4." },
  { s: QA, q: "Find the simple interest on ₹24,000 at 18% per annum for a period of 7 months.", o: ["₹2,525","₹2,520","₹2,530","₹2,535"], e: "SI = 24000 × 18 × 7/12 / 100 = 2520. Option 2." },
  { s: QA, q: "In an 800 m race, the ratio of the speeds of two contestants Alka and Mira is 4 : 7. If Alka has a start of 520 m, then, Alka will win by:", o: ["490 m","280 m","310 m","210 m"], e: "Alka runs 280 m. In same time Mira runs 280×7/4 = 490 m. Alka wins by 800 − 490 = 310 m. Option 3." },
  { s: QA, q: "Answer based on the figure shown.", o: ["4 unit²","1 unit²","3 unit²","2 unit²"], e: "Per response sheet (unattempted), default option 1." },
  { s: QA, q: "Answer based on the figure shown.", o: ["12 : 14 : 17","10 : 12 : 15","5 : 9 : 12","3 : 4 : 5"], e: "Per response sheet, option 2 (10 : 12 : 15)." },
  { s: QA, q: "A certain amount of work can be done by a man, a woman and a boy in 20, 30 and 60 days, respectively. How many boys should be there in order to complete the work in 2 days with 2 men and 8 women?", o: ["5 boys","10 boys","12 boys","8 boys"], e: "Combined rate × 2 = 1: (2/20 + 8/30 + x/60) × 2 = 1 → 1/10 + 4/15 + x/60 = 1/2 → 6/60 + 16/60 + x/60 = 30/60 → x = 8. Option 4." },
  { s: QA, q: "What annual payment will discharge a debt of ₹1,936 in four annual equal instalments at the rate of 14% on simple interest?", o: ["500","475","425","400"], e: "x = 100×1936 / (400 + 14×4×3/2) = 193600/484 = 400. Option 4." },
  { s: QA, q: "Which of the following numbers is divisible by 12?", o: ["5409844","4298123","4512984","3215678"], e: "12 = 4 × 3. 4512984: 84 ÷ 4 ✓; digit sum = 33 ÷ 3 ✓ → divisible by 12. Option 3." },
  { s: QA, q: "A person covers 35 km distance at the speed of 45 km/h, and after that he covers 95 km distance at the speed of 105 km/h. What is the average speed during the whole journey?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Total dist = 130 km. Total time = 35/45 + 95/105 = 7/9 + 19/21 = 106/63. Avg = 130 × 63/106 ≈ 77.26 km/h. Per response sheet, option 4." },
  { s: QA, q: "To pack a set of books, Surbhi made a carton that was 48 inches long, 27 inches wide and 30 inches tall. What will be the total surface area (in square feet) of this carton, once it closed from all sides? [Use 1 foot = 12 inches]", o: ["49.25","48.25","48.75","49.75"], e: "TSA = 2(48×27 + 27×30 + 48×30) = 2×3546 = 7092 sq in = 7092/144 = 49.25 sq ft. Option 1." },
  { s: QA, q: "Simple interest gained on ₹9,000 at the rate of 8% is equal to ₹2,160. Calculate the time.", o: ["5 years","4 years","2 years","3 years"], e: "t = 2160 × 100 / (9000 × 8) = 3 years. Option 4." },
  { s: QA, q: "The ratio of the number of boys to that of girls in a village is 5 : 3. If 40% of the boys and 60% of the girls appeared in an examination, then the ratio of the number of boys and girls who appeared in the examination to the number who did not appear in the same examination, is:", o: ["17 : 21","19 : 21","17 : 27","19 : 23"], e: "Appeared = 0.4×5 + 0.6×3 = 2 + 1.8 = 3.8. Not appeared = 3 + 1.2 = 4.2. Ratio 3.8:4.2 = 19:21. Option 2." },
  { s: QA, q: "After offering two successive discounts of 10% each, the seller earns 10% profit. The cost price is what per cent (rounded off to 2 decimal places) of the tag price?", o: ["70.64%","76.64%","73.64%","79.64%"], e: "SP = 0.81 MP; CP = SP/1.10 = 0.81/1.10 MP = 73.64% of MP. Option 3." },
  { s: QA, q: "The cost price of 15 apples is the same as the selling price of 12 apples. Find the percentage profit.", o: ["30","20","15","25"], e: "SP/CP = 15/12 = 1.25 → Profit 25%. Option 4." },
  { s: QA, q: "Rekha has two laptops of the same kind. She sold one of them at ₹32,000 and incurred a loss of 20%. At what price (in ₹) should she sell the second laptop to gain a profit of 20%?", o: ["38,400","41,600","48,000","44,000"], e: "CP = 32000/0.8 = 40000. Required SP = 40000×1.2 = 48000. Option 3." },
  { s: QA, q: "A runs 4/3 times as fast as B. In a race, if A gives a lead of 80 m to B, find the distance from the starting point where they both will meet.", o: ["300 m","360 m","320 m","340 m"], e: "Let A's speed = 4v, B's = 3v. Time equal: d/(4v) = (d−80)/(3v) → 3d = 4d − 320 → d = 320 m. Option 3." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe first prize will be won by Williams in the singing competition.", o: ["Williams will win the first prize in the singing competition.","Williams will be winning the first prize in the singing competition.","Williams had won the first prize in the singing competition.","Williams wins the first prize in the singing competition."], e: "Future passive 'will be won' → future active 'will win'. Option 1." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe Thar desert is _____________ in the state of Rajasthan.", o: ["bounded","seen","situated","placed"], e: "'Situated in Rajasthan' is the natural geographic collocation. Option 3." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nA piece of information received by word of mouth has no authenticity.", o: ["through an official order","through rumours","in written form","in spoken form"], e: "'By word of mouth' (here) = informally / through rumours. Option 2." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nI hope you ___________ what I taught you today.", o: ["cleared","divided","summoned","understood"], e: "'Understood' fits the context of teaching. Option 4." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Authority","Illegitimate","Inaffectual","Authentic"], e: "'Inaffectual' is misspelled — correct is 'Ineffectual'. Option 3." },
  { s: ENG, q: "Select the idiom that gives the most appropriate meaning of the underlined phrase in the following sentence.\n\nI finally understood how to operate the new smart television.", o: ["Cast aside","Hit the sack","Don't know","Figured out"], e: "'Finally understood' = 'figured out'. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe propaganda was made to invade ________ neighbouring countries.", o: ["smaller","largest","stranger","strongest"], e: "Propaganda typically targets 'smaller' neighbouring countries. Option 1." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nAwful", o: ["Inoffensive","Delightful","Acceptable","Terrible"], e: "'Awful' = Terrible. Option 4." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nAthira would like to get him a special birthday present, but nothing springs to mind.", o: ["almost always","forget about something","dawns on","from the beginning of time"], e: "'Springs to mind' ≈ 'dawns on'. Option 3." },
  { s: ENG, q: "Identify the sentence that contains no spelling errors.", o: ["Games insteal in people the values of timliness, honesty and consistency in their routines.","Games instil in people the values of timeliness, honesty and consistensy in their routeenes.","Games instil in people the values of timeliness, honesty and consistency in their routines.","Games insteal in people the values of timeliness, honesty and consistensy in their routines."], e: "Option 3 has all words correctly spelled (instil, timeliness, consistency, routines). Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nArya said, \"I am very busy now.\"", o: ["Arya said that she is being very busy now.","Arya said that she is be very busy now.","Arya said that she was very busy then.","Arya said that she was being very busy then."], e: "Direct → indirect backshift: 'am' → 'was'; 'now' → 'then'. Option 3." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined words in the given sentence.\n\nStudents were asked to write the historical events in the order of their occurrence.", o: ["aesthetic order","historic order","chronological order","diachronic order"], e: "'Order of occurrence' = chronological order. Option 3." },
  { s: ENG, q: "Identify the idiom/phrase that can best substitute the underlined segment.\n\nThey discussed everything in the meeting and finalised the next step.", o: ["the home stretch","through thick and thin","the eleventh hour","the whole nine yards"], e: "'Discussed everything' = 'the whole nine yards' (everything completely). Option 4." },
  { s: ENG, q: "Select the most appropriate synonym of the underlined word in the following sentence.\n\nUNESCO is committed to protecting individual privacy and securing the personal information made available to us when you visit unesco.org, as well as UNESCO pages on other sites.", o: ["disloyal","devoted","unfaithful","inconstant"], e: "'Committed' = 'devoted'. Option 2." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains an INCORRECTLY spelt word.\n\nSince the health hazards have reduced, / the ministry has relaxed the earlier regulations / and has suggested only a short period / of quarrantine for the affected people.", o: ["of quarrantine for the affected people","the ministry has relaxed the earlier regulations","Since the health hazards have reduced","and has suggested only a short period"], e: "'Quarrantine' is misspelled — correct is 'quarantine'. Option 1." },
  { s: ENG, q: "Read the White Tiger passage.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'black stripes on (1)_____ white coat'", o: ["a","an","the","of"], e: "'A white coat' (consonant sound 'w'). Option 1." },
  { s: ENG, q: "Read the White Tiger passage.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'(2)______ species of animal has blue eyes and a pink nose'", o: ["This","These","Those","Them"], e: "Singular 'species ... has' → 'This species'. Option 1." },
  { s: ENG, q: "Read the White Tiger passage.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'spotted in India (3)______ the last one-hundred years'", o: ["following","next to","behind","in"], e: "'In the last one-hundred years' (time period). Option 4." },
  { s: ENG, q: "Read the White Tiger passage.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'They are (4)_______ animals, and are fond of hunting at night'", o: ["solitary","separate","loner","unaccompanied"], e: "Tigers are 'solitary' animals (standard descriptor). Option 1." },
  { s: ENG, q: "Read the White Tiger passage.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'They are slow runners, (5)______ good swimmers'", o: ["but","either","nor","or"], e: "Contrast 'slow runners but good swimmers'. Option 1." },
  { s: ENG, q: "Read the Fine Motor Skills passage.\n\nSelect the most appropriate title for the passage.", o: ["Development of Fine Motor Skills in Children","Importance of Fine Motor Skills","Systematic Development of Children","Development of New-borns"], e: "Passage focuses on age-wise development of fine motor skills. Option 1." },
  { s: ENG, q: "Read the Fine Motor Skills passage.\n\nIn light of the above passage, which of the following toys may help in the development of fine motor skills?", o: ["Crayons","All of the given options","String beads","Stacks and building blocks"], e: "Passage mentions crayons, string beads and building blocks — all aid fine motor development. Option 2." },
  { s: ENG, q: "Read the Fine Motor Skills passage.\n\nWhen do children learn to regulate the release of the objects that they are gripping?", o: ["3-6 months","2-4 years","12-24 months","6-12 months"], e: "Passage states this skill develops between 6 and 12 months. Option 4." },
  { s: ENG, q: "Read the Fine Motor Skills passage.\n\nSelect the most appropriate ANTONYM of the given word.\n\nSystematically", o: ["Evenly","Selectively","Oddly","Haphazardly"], e: "Antonym of 'Systematically' (in an orderly way) = Haphazardly. Option 4." },
  { s: ENG, q: "Read the Fine Motor Skills passage.\n\nWhen do children get interested in playing with building blocks?", o: ["12-24 months","2-4 years","6-12 months","0-6 months"], e: "Passage: 'interested in stacking building blocks between 12 and 24 months'. Option 1." }
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
      tags: ['SSC', 'Selection Post', 'Phase XI', 'Matriculation', 'PYQ', '2023'],
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

  const TEST_TITLE = 'SSC Selection Post Phase XI (Matriculation) - 30 June 2023 Shift-4';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2023, pyqShift: 'Shift-4',
    pyqExamName: 'SSC Selection Post Phase XI (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
