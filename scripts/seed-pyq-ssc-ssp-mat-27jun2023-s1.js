/**
 * Seed: SSC Selection Post Phase XI 2023 (Matriculation Level) PYQ - 27 June 2023, Shift-1 (100 questions)
 * Source: SSC official response sheet (PDF + docx, English version).
 * Section order in paper: REA → GA → QA → ENG (different from Phase IX papers).
 * Image questions sourced directly from docx-embedded media.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-27jun2023-s1.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun27_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-27jun2023-s1';

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

const F = '27-jun-2023-s1';

const IMAGE_MAP = {
  // REA image questions
  12: { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] },
  17: { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] },
  18: { q: 'image14.jpeg', opts: ['image15.jpeg','image16.jpeg','image17.jpeg','image18.jpeg'] },

  // GA Q48 (= GA Q23): option images only (male literacy rate values)
  48: { q: '', opts: ['image19.jpeg','image20.jpeg','image21.jpeg','image22.jpeg'] },

  // QA option-image questions
  59: { q: '', opts: ['image23.jpeg','image24.jpeg','image25.jpeg','image26.jpeg'] }, // QA Q9
  64: { q: '', opts: ['image27.jpeg','image28.jpeg','image29.jpeg','image30.jpeg'] }, // QA Q14
  65: { q: '', opts: ['image31.jpeg','image32.jpeg','image33.jpeg','image34.jpeg'] }, // QA Q15
  69: { q: '', opts: ['image35.png','image36.png','image37.png','image38.png'] },     // QA Q19
  72: { q: 'image39.jpeg', opts: ['','','',''] }                                      // QA Q22 question image
};

// 1-based answer key.
const KEY = [
  // 1-25 General Intelligence
  1, 2, 3, 1, 3,   3, 3, 2, 4, 1,   1, 4, 2, 3, 1,   2, 1, 2, 1, 1,   2, 4, 1, 2, 4,
  // 26-50 General Awareness
  2, 4, 1, 3, 4,   2, 3, 1, 2, 2,   4, 1, 1, 2, 4,   4, 1, 1, 1, 3,   1, 1, 4, 2, 3,
  // 51-75 Quantitative Aptitude
  1, 3, 3, 3, 3,   2, 4, 2, 4, 2,   3, 4, 1, 2, 3,   2, 3, 2, 3, 4,   1, 2, 4, 4, 3,
  // 76-100 English Language
  1, 1, 4, 1, 2,   3, 1, 4, 1, 4,   4, 2, 2, 1, 1,   2, 4, 4, 1, 2,   4, 3, 4, 3, 1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "In a code language, 'BANYAN' is written as 'EDQBDQ' and 'LAUNCH' is written as 'ODXQFK'. How will 'STRIKER' be written in that language?", o: ["VWULNHU","SCFIRET","ELBURPT","UNDARSA"], e: "Each letter shifted by +3. BANYAN: B+3=E, A+3=D, N+3=Q, Y+3=B, A+3=D, N+3=Q ✓. STRIKER: S+3=V, T+3=W, R+3=U, I+3=L, K+3=N, E+3=H, R+3=U = VWULNHU. Option 1." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in a logical and meaningful order.\n\n1. Month  2. Day  3. Year  4. Hour  5. Minute", o: ["3, 4, 2, 1, 5","3, 1, 2, 4, 5","3, 1, 2, 5, 4","3, 2, 1, 4, 5"], e: "Descending time units: Year(3) > Month(1) > Day(2) > Hour(4) > Minute(5) → 3,1,2,4,5. Option 2." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n54, 46, 34, 26, 14, ?", o: ["5","7","6","8"], e: "Differences alternate −8, −12, −8, −12. Next = −8. 14 − 8 = 6. Option 3." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\nM _ O _ _ N O _ _ N _ P M _ O _", o: ["N P M P M O N P","N P O P M O P O","N P M P M P M N","O P M P M O P M"], e: "Per response sheet, option 1 (N P M P M O N P)." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nOmelette : Egg :: Road : ?", o: ["Ore","Latex","Asphalt","Flax"], e: "Omelette is made from Egg; Road is made from Asphalt. Option 3." },
  { s: REA, q: "'A # B' means 'A is the brother of B'; 'A @ B' means 'A is the daughter of B'; 'A & B' means 'A is the husband of B'; 'A % B' means 'A is the wife of B'.\n\nIf L @ M % F # Q & P @ N, then how is F related to P?", o: ["Husband","Brother","Husband's brother","Father"], e: "F is M's husband (since M is F's wife); F is Q's brother; Q is P's husband. So F is P's husband's brother. Option 3." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Devoted  2. Determine  3. Devastating  4. Diaphragm  5. Diagnose  6. Different", o: ["2, 3, 1, 4, 6, 5","2, 1, 5, 4, 6, 3","2, 3, 1, 5, 4, 6","2, 3, 1, 5, 6, 4"], e: "Dictionary order: Determine(2), Devastating(3), Devoted(1), Diagnose(5), Diaphragm(4), Different(6) → 2,3,1,5,4,6. Option 3." },
  { s: REA, q: "Three statements are given followed by four conclusions.\n\nStatements:\nSome parrots are pigs. Some pigs are poles. All poles are pets.\n\nConclusions:\nI. Some poles are pigs.\nII. Some pets are parrots.\nIII. All the parrots are pets.\nIV. Some pets are pigs.", o: ["Only conclusion III follows","Only conclusions I and IV follow","Only conclusion IV follows","Only conclusions I and II follow"], e: "I: some pigs are poles → some poles are pigs ✓. IV: all poles are pets + some pigs are poles → some pets are pigs ✓. II/III don't follow. Option 2." },
  { s: REA, q: "'A # B' means 'A is the wife of B'; 'A @ B' means 'A is the father of B'; 'A % B' means 'A is the sister of B'; 'A & B' means 'A is the daughter of B'.\n\nIf A % G & H # B @ Z % M, then how is H related to M?", o: ["Mother-in-law","Daughter","Son","Mother"], e: "H is B's wife, B is Z's father → H is Z's mother. Z is M's sister → H is M's mother too. Option 4." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks, will complete the letter series.\n\nR M _ G _ M _ _ R _ T G _ M T _", o: ["T R T G M R G","T R G T G M R","T M T G M T G","T R G T M R G"], e: "Per response sheet, option 1 (T R T G M R G)." },
  { s: REA, q: "Select the option that is related to the fourth term in the same way as the first term is related to the second term and the fifth term is related to the sixth term.\n\n16 : 36 :: ? : 50 :: 9 : 22", o: ["23","34","22","31"], e: "Pattern: 2n+4. 16×2+4=36 ✓. 9×2+4=22 ✓. ?×2+4=50 → ?=23. Option 1." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए / Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nVISION : IVISNO :: COLOUR : OCOLRU :: YELLOW : ?", o: ["LEYWOL","EYLLWO","WOLLEY","EYLOLW"], e: "Swap pairs (1,2), (3,4), (5,6). VISION → IVISNO ✓. YELLOW → EYLLWO. Option 2." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n289 * 121 * 154 * 307 * (34 * 3) * 2", o: ["÷, −, +, −, ×, =","×, +, −, =, +, ÷","+, −, =, −, ×, ÷","÷, +, −, ×, +, ="], e: "Option 3: 289 + 121 − 154 = 307 − (34 × 3) ÷ 2 → 256 = 307 − 51 = 256 ✓. Option 3." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) and complete the given series?\n\nCURB, ESPC, ?, IOLE, KMJF", o: ["GQND","HRND","GRND","HQND"], e: "1st letter +2, 2nd letter −2, 3rd letter −2, 4th letter +1. 3rd term: G(E+2), Q(S−2), N(P−2), D(C+1) = GQND. Option 1." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nChoreographer : Ballet :: Dramatist : ?", o: ["Design","Play","Composition","Movie"], e: "A choreographer creates a ballet; a dramatist creates a play. Option 2." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n119 * 7 * 63 * 24 * 3 * 8", o: ["÷, +, –, ×, =","–, +, ÷, ×, =","+, ÷, ×, –, =","+, ÷, –, ×, ="], e: "Option 1: 119 ÷ 7 + 63 − 24 × 3 = 8 → 17 + 63 − 72 = 8 ✓. Option 1." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nINPUT : STOMH :: OUTPUT : STOSTN :: SOLVE : ?", o: ["DUKNR","TPMXF","DUMPT","PTUKD"], e: "Reverse the word and shift each letter −1. INPUT reversed=TUPNI, −1 each = STOMH ✓. SOLVE reversed=EVLOS, −1 each = DUKNR. Option 1." },
  { s: REA, q: "Three statements are given followed by three conclusions.\n\nStatements:\nSome cribs are pants. No crib is a tap. All pants are shells.\n\nConclusions:\nI. All shells being cribs is a possibility.\nII. At least some taps are not cribs.\nIII. Some pants are not taps.", o: ["Only conclusions I and III follow","Only conclusions II and III follow","Only conclusion I follows","All conclusions I, II and III follow"], e: "II: 'no crib is tap' → all taps are not cribs ✓. III: some cribs are pants and no crib is tap → some pants (the crib-pants) are not taps ✓. I is a possibility but not a definite conclusion. Option 2." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in the order in which they appear in an English dictionary.\n\n1. Bunion  2. Bureau  3. Bundle  4. Bunting  5. Bungle", o: ["4, 5, 1, 3, 2","4, 5, 3, 1, 2","5, 3, 4, 2, 1","3, 5, 1, 4, 2"], e: "Dictionary order: Bundle(3), Bungle(5), Bunion(1), Bunting(4), Bureau(2) → 3,5,1,4,2. Option 4." },
  { s: REA, q: "Three statements are given, followed by three conclusions.\n\nStatements:\nAll computers are footballs. Some footballs are round. Some round are stools.\n\nConclusions:\nI. Some footballs are computers.\nII. Some round are footballs.\nIII. Some stools are round.", o: ["All the conclusions follow","Only conclusions II and III follow","Only conclusions I and II follow","Only conclusions I and III follow"], e: "I: All computers are footballs → some footballs are computers ✓. II: 'some footballs are round' converts to 'some round are footballs' ✓. III: 'some round are stools' converts to 'some stools are round' ✓. All follow. Option 1." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nMost suits are trousers. Some shirts are ties. All suitcases are watches.\n\nConclusions:\nI. All trousers are suits.\nII. Some shirts are suitcases.\nIII. Some shirts are not watches.", o: ["Either conclusion I or conclusion III follows","None of the conclusions follow","Only conclusion II follows","Only conclusion I follows"], e: "I doesn't follow (most suits are trousers ≠ all trousers are suits). II: no link between shirts and suitcases. III: no link. None follow. Option 2." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series, will complete the series.\n\nG_BAGS_BGSBC_SB_", o: ["DGSB","SCBD","BDSC","SBGD"], e: "Per response sheet, option 4 (SBGD)." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "Which water-soluble vitamin found in various foods, including liver, milk, eggs and fish, helps to keep your body's blood and nerve cells healthy?", o: ["Vitamin C","Vitamin B12","Vitamin E","Vitamin A"], e: "Vitamin B12 (cobalamin) is water-soluble and keeps blood and nerve cells healthy. (Vitamins A, E are fat-soluble; Vitamin C is water-soluble but doesn't fit this description.) Option 2." },
  { s: GA, q: "According to the Census of India 2011, which of the following groups of union territories has the highest literacy rate?", o: ["Chandigarh and Andaman & Nicobar","Delhi and Chandigarh","Delhi and Lakshadweep","Lakshadweep and Daman & Diu"], e: "Per Census 2011: Lakshadweep (91.85%) and Daman & Diu (87.07%) are the top two UTs by literacy. Option 4." },
  { s: GA, q: "Which of the following classical dance forms is related to the worship of Lord Jagannath?", o: ["Odissi","Kathak","Sattriya","Bharatanatyam"], e: "Odissi originated in the temples of Odisha, associated with the worship of Lord Jagannath at Puri. Option 1." },
  { s: GA, q: "Who among the following personalities has received both Grammy and Oscar awards?", o: ["Javed Akhtar","Jagjit Singh","Gulzar","Amitabh Bhattacharya"], e: "Gulzar won the Oscar (2008) and Grammy (2010) for 'Jai Ho' (Slumdog Millionaire). Option 3." },
  { s: GA, q: "Who among the following launched the Virtual Smart Grid Knowledge Centre and Innovation Park in March 2022?", o: ["Giriraj Singh","Kiren Rijiju","Hardeep Singh Puri","Raj Kumar Singh"], e: "Union Power Minister R.K. Singh launched the Virtual Smart Grid Knowledge Centre (SGKC) and Innovation Park in March 2022. Option 4." },
  { s: GA, q: "Who was the first Sultan of the Delhi Sultanate to start military expeditions into southern India?", o: ["Ghiyasuddin Balban","Alauddin Khalji","Muhammad Tughluq","Shamsuddin Iltutmish"], e: "Alauddin Khalji was the first sultan to send military expeditions to southern India (via Malik Kafur). Option 2." },
  { s: GA, q: "Which of the following harvest festivals is celebrated in Karnataka in the months of November-December?", o: ["Hampi","Dasara","Huthri","Kambala"], e: "Huthri is the harvest festival of the Kodava community in Karnataka, celebrated in November-December. Option 3." },
  { s: GA, q: "Padma Awardee Sudha Singh is a sports person in which of the following fields?", o: ["Athletics","Shooting","Swimming","Table Tennis"], e: "Sudha Singh is an Indian athlete (3000m steeplechase) and Padma Shri awardee. Option 1." },
  { s: GA, q: "Who among the following national leaders was called 'Grand Old Man of India' in British India?", o: ["Gopal Krishna Gokhale","Dadabhai Naoroji","Prithvis Chandra Ray","Mahadev Govind Ranade"], e: "Dadabhai Naoroji was called the 'Grand Old Man of India'. Option 2." },
  { s: GA, q: "Who became only the third Indian to win a singles tennis match at Olympics in July 2021?", o: ["Ramkumar Ramanathan","Sumit Nagal","Mukund Sasikumar","Prajnesh Gunneswaran"], e: "Sumit Nagal won his first round match at Tokyo 2020 (July 2021), becoming the third Indian to win an Olympic singles tennis match. Option 2." },
  { s: GA, q: "India was named 'Bharat' after the name of the Bharat clan. In which of the following Vedas is this clan first mentioned?", o: ["Atharvaveda","Yajurveda","Samaveda","Rigveda"], e: "The Bharata clan is first mentioned in the Rigveda. Option 4." },
  { s: GA, q: "The Hoysaleshvara temple was built with which of the following stones by a Hoysala king in 1150?", o: ["Dark Schist Stone","White Marble","Sandstone","Grey Basalt"], e: "The Hoysaleshvara temple at Halebidu is built of dark chloritic schist (soapstone). Option 1." },
  { s: GA, q: "Which potassium salt is a mineral supplement used to treat or prevent low levels of potassium in the blood?", o: ["Potassium chloride","Potassium iodide","Potassium citrate","Potassium nitrate"], e: "Potassium chloride (KCl) is the standard supplement used to treat hypokalemia. Option 1." },
  { s: GA, q: "What is the rank of India in the production of rice globally? (As of year 2020)", o: ["Third","Second","Fourth","First"], e: "India is the world's second-largest producer of rice (after China). Option 2." },
  { s: GA, q: "Which of the following autobiographies was written by the Indian film actor Balraj Sahni?", o: ["The Act of Life","Main Ek Harfanmaula","Meri Filmi Aatmakatha","I Am Not an Island"], e: "Balraj Sahni's autobiography 'Balraj Sahni: An Autobiography' was published in English as 'I Am Not an Island'. Option 4." },
  { s: GA, q: "Which are the only major rivers of south India that flow into the Arabian sea?", o: ["The Chambal and the Kosi","The Mahanadi and the Brahmaputra","The Krishna and the Cauvery","The Narmada and the Tapti"], e: "Among major south/west India rivers, only Narmada and Tapti flow westward into the Arabian Sea. Option 4." },
  { s: GA, q: "What is the basic requirement for an ecosystem to function and sustain?", o: ["Input of solar energy","Soil structure","Organisms","Micro-organisms"], e: "Solar energy is the fundamental input that drives all ecosystem functions. Option 1." },
  { s: GA, q: "In which of the following years was the first edition of the Thomas Cup, an international men's team championship in badminton organised?", o: ["1949","1952","1955","1961"], e: "The first Thomas Cup tournament was held in 1948-49. Option 1." },
  { s: GA, q: "Rani Gaidinliu is associated with which of the following movements?", o: ["Heraka","Meira Paibi","Nupi Lan","Nisha Bandh"], e: "Rani Gaidinliu led the Heraka religious-political movement among the Zeliangrong Nagas. Option 1." },
  { s: GA, q: "In January 2022, The Union Cabinet, chaired by PM Narendra Modi, approved the extension of the tenure of the National Commission for Safai Karamcharis (NCSK) for ________ years beyond 31 March 2022.", o: ["five","four","three","two"], e: "The NCSK tenure was extended by three years (up to 31 March 2025). Option 3." },
  { s: GA, q: "To which state of India did Fathima Beevi, the first woman Supreme Court Judge of India, belong?", o: ["Kerala","Andhra Pradesh","Tamil Nadu","Karnataka"], e: "Justice M. Fathima Beevi (b. 1927, d. 2023), the first woman Supreme Court judge, belonged to Kerala. Option 1." },
  { s: GA, q: "Ratikant Mohapatra, an awardee of 'Sangeet Natak Akademi Award', is known for which of the following classical dances of India?", o: ["Odissi","Manipuri","Kathak","Kathakali"], e: "Ratikant Mohapatra is a renowned Odissi dance guru/choreographer. Option 1." },
  { s: GA, q: "As per the 2011 census of India, the male literacy rate in India is ________.", o: ["Option (image)","Option (image)","Option (image)","Option (image)"], e: "Per response sheet, option 4 — male literacy rate per Census 2011 ≈ 82.14%." },
  { s: GA, q: "Which of the following Articles of the Constitution of India defines that the Fundamental Duties are only meant for the Indian Citizens and not for foreigners?", o: ["Article 46 B","Article 51 A","Article 67 A","Article 81 C"], e: "Article 51A of the Constitution lists the Fundamental Duties of Indian citizens. Option 2." },
  { s: GA, q: "Name the instrument that is used by meteorologists to measure the solar radiation from the region of the hemisphere of incidence on a flat surface.", o: ["Hygrometer","Barometer","Pyranometer","Anemometer"], e: "A pyranometer measures global solar irradiance (hemispherical) on a flat surface. Option 3." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "In a circular race along a track of length 3600 m, X and Y run at speeds of 27 km/h and 45 km/h, respectively. Suppose they start at the same time and in the same direction, when will they meet again at the starting point?", o: ["1440 sec","720 sec","2200 sec","1200 sec"], e: "Time for one lap: X = 3600/(27000/3600) = 480 s; Y = 3600/(45000/3600) = 288 s. LCM(480, 288) = 1440 s. Option 1." },
  { s: QA, q: "Aravind deposited ₹18,500 for 5 years at simple interest. After 5 years, he received ₹4,625 as interest. The annual rate of interest was:", o: ["6%","6.5%","5%","7%"], e: "R = (SI × 100)/(P × T) = (4625 × 100)/(18500 × 5) = 5%. Option 3." },
  { s: QA, q: "A grocer sells pulses at a profit of 13% and uses weights which are 24% less than the market weight. The percentage of profit (correct to 2 decimal places) earned by him will be:", o: ["45.56%","37.75%","48.68%","42.35%"], e: "Effective profit = (113/76) − 1 = 0.4868 = 48.68%. Option 3." },
  { s: QA, q: "Which of the following numbers is NOT divisible by 72?", o: ["359784","426816","486280","754344"], e: "72 = 8 × 9. 486280: digit sum = 4+8+6+2+8+0 = 28 (not divisible by 9). The other three are divisible by both 8 and 9. Option 3." },
  { s: QA, q: "The third proportional of 16 and 24 will be ________.", o: ["40","30","36","32"], e: "Third proportional x: 16 : 24 = 24 : x → x = 24²/16 = 576/16 = 36. Option 3." },
  { s: QA, q: "Class A has 20 students scoring average marks of 75, and class B has 30 students scoring average marks of 60. What is the average of both the classes together?", o: ["64","66","68","62"], e: "Combined average = (20×75 + 30×60)/50 = (1500 + 1800)/50 = 3300/50 = 66. Option 2." },
  { s: QA, q: "A number is first increased by 5% and then it is further increased by 20%. The original number is increased by:", o: ["16%","30%","18%","26%"], e: "Net = 1.05 × 1.20 − 1 = 1.26 − 1 = 0.26 = 26%. Option 4." },
  { s: QA, q: "Marked price of a TV is listed at ₹24,500. If its selling price is ₹20,090, then what is the discount percentage?", o: ["22%","18%","20%","15%"], e: "Discount = (24500 − 20090)/24500 × 100 = 4410/24500 × 100 = 18%. Option 2." },
  { s: QA, q: "A, B and C can separately complete a work in 20, 25 and 30 days, respectively. If A works on the first day alone, B on second day alone and C on the third day alone, and this sequence goes on further, in how many days will the entire work be finished?", o: ["Option (image)","Option (image)","Option (image)","Option (image)"], e: "3-day cycle work = 1/20+1/25+1/30 = 37/300. 8 cycles (24 days) = 296/300. Remaining 4/300 done by A on day 25 → 4/15 of a day. Total = 24 + 4/15 ≈ 24.27 days. Per response sheet, option 4." },
  { s: QA, q: "The mean weight of 32 students in a school is 50 kg. If the weight of the teacher be included, the mean rises by 500 grams. Find the weight of the teacher.", o: ["63.5 kg","66.5 kg","65.5 kg","64.5 kg"], e: "33 × 50.5 = 1666.5. Teacher = 1666.5 − 32×50 = 1666.5 − 1600 = 66.5 kg. Option 2." },
  { s: QA, q: "The internal and external diameters of a hollow hemispherical bowl are 6 cm and 10 cm, respectively. If it is melted and recast into a solid cylinder of diameter 14 cm, what is the height of the cylinder in cm?", o: ["1.1","1.22","1.33","1"], e: "Vol of hollow hemisphere = (2/3)π(5³−3³) = (2/3)π(125−27) = 196π/3 cm³. Cylinder vol = π(7)²h = 49πh. So h = 196/(3×49) = 4/3 ≈ 1.33. Option 3." },
  { s: QA, q: "Food is available for 27 days for 35 students in a hostel. For how many days will this food be sufficient for 45 students?", o: ["25","22","23","21"], e: "Inverse proportion: 27 × 35 = 945 student-days. For 45 students: 945/45 = 21 days. Option 4." },
  { s: QA, q: "If the cost price is 66% of the selling price, then what is the profit percentage (correct to 2 decimal places)?", o: ["51.52%","50.52%","60.25%","55.62%"], e: "Profit% = (SP − CP)/CP × 100 = (0.34/0.66) × 100 = 51.515% ≈ 51.52%. Option 1." },
  { s: QA, q: "Venkat spends 65% of his income and is able to save ₹1,100 per month. His monthly expenses (correct up to two decimals) are:", o: ["Option (image)","Option (image)","Option (image)","Option (image)"], e: "Saving = 35% of income = 1100 → income = ₹3142.857. Expenses = 65% = ₹2042.86. Per response sheet, option 2." },
  { s: QA, q: "The simple interest earned on ₹7,000 in 2 years at the rate of R% per annum equals to the simple interest earned on ₹5,000 at the rate of 5% per annum in 14 years. The value of R (in percentage) is:", o: ["Option (image)","Option (image)","Option (image)","Option (image)"], e: "7000 × 2 × R/100 = 5000 × 14 × 5/100 → 140R = 3500 → R = 25%. Per response sheet, option 3." },
  { s: QA, q: "Somesh is a shopkeeper who gives two successive discounts on an umbrella marked ₹560. The first discount given is 17%. If the customer Mahesh pays ₹420 for the umbrella, then find the second discount given (correct to two places of decimals).", o: ["4.69%","9.64%","6.49%","6.94%"], e: "After 1st discount: 560 × 0.83 = 464.80. Second discount = (464.80 − 420)/464.80 × 100 = 44.80/464.80 × 100 ≈ 9.64%. Option 2." },
  { s: QA, q: "The sum of two numbers 10373 + 24871 is divisible by:", o: ["7","8","6","13"], e: "10373 + 24871 = 35244. 35244/6 = 5874 (whole number). Option 3." },
  { s: QA, q: "The students in three batches of a dance class are in ratio 2 : 3 : 5. If 20 students increase in each batch the ratio changes to 4 : 5 : 7. Find the total number of students in the three batches before the increase.", o: ["120","100","150","80"], e: "Let batches = 2x, 3x, 5x. (2x+20)/(3x+20) = 4/5 → 10x+100 = 12x+80 → x=10. Total = 10x = 100. Option 2." },
  { s: QA, q: "If the cost price is 94% of the selling price, then find the profit percentage.", o: ["Option (image)","Option (image)","Option (image)","Option (image)"], e: "Profit% = (6/94) × 100 = 6.383% ≈ 6 6/47 %. Per response sheet, option 3." },
  { s: QA, q: "Find the length of a diagonal of a cuboid whose dimensions are 12 m, 10 m and 8 m. (up to one decimal point)", o: ["18 m","16.5 m","17 m","17.54 m"], e: "Diagonal = √(12² + 10² + 8²) = √(144+100+64) = √308 ≈ 17.55 m. Option 4." },
  { s: QA, q: "If 20% of a number is subtracted from a second number and the second number decreases to its 70%, then what is the ratio of the first number to the second number?", o: ["3 : 2","4 : 3","2 : 3","3 : 4"], e: "B − 0.2A = 0.7B → 0.3B = 0.2A → A : B = 3 : 2. Option 1." },
  { s: QA, q: "Answer based on the figure shown.", o: ["4 ∶ 1","1 ∶ 4","3 ∶ 4","1 ∶ 3"], e: "Per response sheet, option 2 (1 ∶ 4)." },
  { s: QA, q: "A person covers 48 km at the speed of 8 km/h, 36 km at the speed of 18 km/h and 16 km at the speed of 8 km/h. What is his average speed in covering the whole distance?", o: ["9 km/h","11 km/h","10.5 km/h","10 km/h"], e: "Total dist = 100 km. Total time = 48/8 + 36/18 + 16/8 = 6 + 2 + 2 = 10 h. Avg speed = 100/10 = 10 km/h. Option 4." },
  { s: QA, q: "An item is bought on a condition that three equal instalments of ₹3,993 are to be paid at a rate of 10% compound interest, compounded annually. The cost of the item is:", o: ["₹10,000","₹9,050","₹9,590","₹9,930"], e: "PV = 3993[(1/1.1) + (1/1.1²) + (1/1.1³)] = 3993 × 2.4868 ≈ ₹9,930. Option 4." },
  { s: QA, q: "In Class I, there are 12 students of average age 20 years and in Class II, there are 16 students of average age 23 years. What will be the approximate average age for all the students of these two classes?", o: ["20.7 years","1.53 years","21.7 years","43 years"], e: "Combined avg = (12×20 + 16×23)/28 = (240+368)/28 = 608/28 ≈ 21.71 years. Option 3." },

  // ============ English Language (76-100) ============
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nHe brought his servant to book for breaking the beautiful showpiece.", o: ["Scolded his servant","Relieved his servant","Rewarded his servant","Sent his servant away"], e: "'Bring (someone) to book' = call to account / reprimand / scold. Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nEasier said than done", o: ["Not as easy as it appears to be","Not as moderate as it appears to be","Not as restricted as it appears to be","Not as difficult as it appears to be"], e: "'Easier said than done' = harder to do than it sounds. Option 1." },
  { s: ENG, q: "Select the correct spelling of the underlined word from the options.\n\nShe is the most underated cricketer in the country.", o: ["underateed","underatted","undderated","underrated"], e: "'Underrated' is the correct spelling (two r's). Option 4." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the underlined group of words.\n\nAdversity always presents opportunities for the examination of one's own conscious thoughts and feelings.", o: ["introspection","judgement","evaluation","cognition"], e: "'Introspection' = examination of one's own thoughts/feelings. Option 1." },
  { s: ENG, q: "Select the most appropriate synonym of the underlined word.\n\nBiosphere reserves are 'learning places for sustainable development'.", o: ["brief","maintainable","temporary","unsuitable"], e: "'Sustainable' = able to be maintained = maintainable. Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nAravind said, \"My teacher is correcting the answer sheets.\"", o: ["Aravind said his teacher was be corrected the answer sheets.","Aravind said that his teacher is being correcting the answer sheets.","Aravind said that his teacher was correcting the answer sheets.","Aravind said that teacher is corrected the answer sheets."], e: "Direct (present continuous) → indirect (past continuous): 'is correcting' → 'was correcting'; 'my' → 'his'. Option 3." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe wide variety of shared and different personal and group characteristics among human beings", o: ["Diversity","Viscosity","Community","Intensity"], e: "'Diversity' = variety of differences among people. Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nTo show a clean pair of heels", o: ["To clean shoes fast","Show clean shoes","Show clean feet","To run fast"], e: "'Show a clean pair of heels' = run away quickly. Option 4." },
  { s: ENG, q: "Fill in the blank with the most appropriate word.\n\nWe as human beings usually tend to forget that life itself is an accumulated process of ________.", o: ["learning","recalling","remembering","testing"], e: "'Life is an accumulated process of learning' — most natural collocation. Option 1." },
  { s: ENG, q: "Select the option that contains a spelling error.\n\nIn the unscientific age or community, there are official repositories of wisdom, such as Egyptian preists and Tibetan Lamas.", o: ["repositories","Egyptian","unscientific","preists"], e: "'preists' is misspelled — correct is 'priests'. Option 4." },
  { s: ENG, q: "Select the idiom that gives the most appropriate meaning of the underlined phrase.\n\n'Honesty is the best policy' does not remain valid in the present times of corruption and greed.", o: ["Go through thick and thin","Put up","Keep pace with","Hold good"], e: "'Hold good' = remain valid / true. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nYou must ________ what you cannot cure.", o: ["embracing","endure","state","take"], e: "Standard proverb: 'What can't be cured must be endured'. Option 2." },
  { s: ENG, q: "Identify the most appropriate ANTONYM of the underlined word.\n\nPrecious stones are expensive because they are not common.", o: ["Abundant","Rare","Natural","Extinct"], e: "'Common' antonym = Rare. Option 2." },
  { s: ENG, q: "Choose the correct spelling of the underlined word.\n\nWe are going on a hiking expidition.", o: ["expedition","expedetion","exhipidition","ixpedition"], e: "Correct spelling: 'expedition'. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe manager was being scolded by Rushikesh.", o: ["Rushikesh was scolding the manager.","Rushikesh scolded the manager.","Rushikesh has been scolding the manager.","Rushikesh will be scolding the manager."], e: "Past continuous passive → past continuous active: 'was being scolded by' → 'was scolding'. Option 1." },
  { s: ENG, q: "Read the passage on Power Foods.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'Power foods are foods that provide (1)________ levels of nutrients'", o: ["thriving","rich","flourishing","prosperous"], e: "'Rich levels of nutrients' — natural collocation for nutrient-density. Option 2." },
  { s: ENG, q: "Read the passage on Power Foods.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'a lot of fitness trainers encourage their clients to include these foods in their daily diet to (2)________ muscle development'", o: ["spike","magnify","intensify","increase"], e: "'Increase muscle development' — natural and grammatical. Option 4." },
  { s: ENG, q: "Read the passage on Power Foods.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'proper preparation of these foods, the (3)________ of season-fresh foods'", o: ["wield","apply","handle","use"], e: "'The use of season-fresh foods' — fits as a noun. Option 4." },
  { s: ENG, q: "Read the passage on Power Foods.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'Iron (4)________ can lead to anaemia, fatigue, brain fog and tiredness'", o: ["deficiency","inadequacy","lack","drought"], e: "'Iron deficiency' is the standard medical term causing anaemia. Option 1." },
  { s: ENG, q: "Read the passage on Power Foods.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'teenagers who need to be (5)________ about getting iron in their diet'", o: ["vibrant","diligent","swamped","immersed"], e: "'Diligent about getting iron' — natural collocation. Option 2." },
  { s: ENG, q: "Read the passage on trees.\n\nWhere can one read the complete history of a tree?", o: ["On its leaves in sunny days","On its branches when it is full-grown","On its skin when it is counted","On its trunk when it is cut down"], e: "Passage: 'When a tree is cut down ... one can read its whole history ... in the rings of its trunk'. Option 4." },
  { s: ENG, q: "Read the passage on trees.\n\nWhere does the world rustle, according to the given passage?", o: ["Around the trunk of trees","Over the forest in the sunny days","In the highest boughs of trees","In the deepest roots of trees"], e: "Passage: 'In their highest boughs the world rustles'. Option 3." },
  { s: ENG, q: "Read the passage on trees.\n\nSelect the most suitable word given in the passage that means 'very good and perfect'.", o: ["Holier","Penetrating","Luminous","Exemplary"], e: "'Exemplary' = serving as a model / very good. Option 4." },
  { s: ENG, q: "Read the passage on trees.\n\nWhich of the following labels is most appropriate for the author of the given passage?", o: ["Arrogant theorist","Nostalgic dreamer","Environment enthusiast","Social activist"], e: "Author reveres trees and nature — Environment enthusiast. Option 3." },
  { s: ENG, q: "Read the passage on trees.\n\nWhat is the tone of the speaker?", o: ["Emotional","Apathetic","Vituperative","Sarcastic"], e: "Reverent, passionate language about trees → Emotional. Option 1." }
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

  const TEST_TITLE = 'SSC Selection Post Phase XI (Matriculation) - 27 June 2023 Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2023, pyqShift: 'Shift-1',
    pyqExamName: 'SSC Selection Post Phase XI (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
