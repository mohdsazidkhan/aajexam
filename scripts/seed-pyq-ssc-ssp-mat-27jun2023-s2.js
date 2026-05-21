/**
 * Seed: SSC Selection Post Phase XI 2023 (Matriculation Level) PYQ - 27 June 2023, Shift-2 (100 questions)
 * Source: SSC official response sheet (PDF + docx, English version).
 * Section order in paper: REA → GA → QA → ENG.
 * ENG Q25 (Q100) recovered from PDF (omitted by docx).
 * Image questions sourced directly from docx-embedded media.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-27jun2023-s2.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun27_s2";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-27jun2023-s2';

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

const F = '27-jun-2023-s2';

const IMAGE_MAP = {
  // REA image questions
  2: { q: 'image4.jpeg', opts: ['image5.jpeg','image6.png','image7.png','image8.png'] },
  3: { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] },
  9: { q: 'image14.jpeg', opts: ['image15.jpeg','image16.jpeg','image17.jpeg','image18.jpeg'] },

  // QA image questions
  53: { q: 'image19.jpeg', opts: ['image20.png','image21.png','image22.png','image23.jpeg'] }, // QA Q3
  55: { q: 'image24.jpeg', opts: ['','','',''] },                                                // QA Q5 — question image, text options
  63: { q: '', opts: ['image25.jpeg','image26.jpeg','image27.jpeg','image28.jpeg'] },           // QA Q13 — option images only
  71: { q: '', opts: ['image29.jpeg','image30.png','image31.jpeg','image32.jpeg'] }             // QA Q21 — option images only
};

// 1-based answer key.
const KEY = [
  // 1-25 General Intelligence
  3, 1, 1, 1, 4,   1, 1, 1, 1, 4,   3, 1, 1, 4, 2,   2, 3, 4, 1, 1,   2, 1, 2, 2, 1,
  // 26-50 General Awareness
  4, 1, 4, 3, 3,   3, 3, 3, 1, 4,   2, 4, 1, 4, 3,   2, 2, 4, 1, 3,   4, 4, 4, 3, 2,
  // 51-75 Quantitative Aptitude
  1, 4, 4, 2, 1,   3, 4, 3, 1, 3,   4, 2, 1, 4, 1,   1, 1, 3, 1, 4,   3, 4, 3, 4, 2,
  // 76-100 English Language
  3, 3, 1, 2, 3,   1, 1, 1, 2, 4,   2, 1, 2, 1, 1,   4, 1, 1, 1, 1,   3, 2, 3, 3, 4
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n62 * 14 * 7 * 18 * 26", o: ["+, ×, =, −","−, +, =, ×","=, ÷, ×, +","=, ×, +, −"], e: "Option 3: 62 = 14 ÷ 7 × 18 + 26 → 2 × 18 + 26 = 36 + 26 = 62 ✓. Option 3." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\n_G _ J Y _ U _ _G _ _ Y G U _", o: ["Y U G J Y U J J","Y U G J Y U Y J","Y U G G Y U J J","Y U G J Y U J U"], e: "Per response sheet, option 1 (Y U G J Y U J J)." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nAll tanks are plates. All cots are plates. Some oats are cots.\n\nConclusions:\nI. Some tanks are cots.\nII. Some plates are tanks.\nIII. Some plates are oats.", o: ["Either conclusion I or II follows","Only conclusion II follows","Only conclusion I follows","Both conclusions II and III follow"], e: "II: All tanks are plates → some plates are tanks ✓. III: Some oats are cots; all cots are plates → some oats are plates → some plates are oats ✓. I: tanks & cots both subsets of plates — overlap not guaranteed. Option 4." },
  { s: REA, q: "'A # B' means 'A is the brother of B'; 'A @ B' means 'A is the daughter of B'; 'A & B' means 'A is the husband of B'; 'A % B' means 'A is the wife of B'.\n\nIf W % D # G @ B & M @ I, then how is D related to M?", o: ["Son","Father's father","Father","Grandson"], e: "W is D's wife → D male. D is G's brother. G is B's daughter → D is B's son. B is M's husband → D is M's son. Option 1." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n165 * 33 * 26 * 17 * 2 * 19 * 16", o: ["÷, +, −, ×, +, =","÷, −, +, −, ×, =","×, +, −, =, +, ÷","÷, +, =, +, −, ×"], e: "Option 1: 165 ÷ 33 + 26 − 17 × 2 + 19 = 16 → 5 + 26 − 34 + 19 = 16 ✓. Option 1." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in a logical and meaningful order.\n\n1. Seedling  2. Sapling  3. Tree  4. Seed  5. Forest", o: ["4, 1, 2, 3, 5","2, 4, 3, 5, 1","1, 3, 4, 2, 5","3, 1, 5, 4, 2"], e: "Growth order: Seed(4) → Seedling(1) → Sapling(2) → Tree(3) → Forest(5) → 4,1,2,3,5. Option 1." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nNo mug is a bucket. All mugs are cups. Some cups are spoons.\n\nConclusions:\nI. Some spoons are buckets.\nII. Some mugs are spoons.\nIII. Some cups are not buckets.", o: ["Only conclusions II and III follow","Only conclusions I and II follow","All conclusions follow","Only conclusion III follows"], e: "I, II don't follow (no defined link). III: all mugs are cups AND no mug is bucket → those cups (mugs) are not buckets → some cups are not buckets ✓. Option 4." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in the order in which they appear in an English dictionary.\n\n1. Memoir  2. Menial  3. Melamine  4. Melancholy  5. Memory", o: ["4, 5, 1, 2, 3","4, 3, 2, 1, 5","3, 4, 1, 5, 2","5, 3, 1, 4, 2"], e: "Dictionary: Melamine(3), Melancholy(4), Memoir(1), Memory(5), Menial(2) → 3,4,1,5,2. Option 3." },
  { s: REA, q: "'A + B' means 'A is the brother of B'; 'A − B' means 'A is the mother of B'; 'A × B' means 'A is the father of B'; 'A ÷ B' means 'A is the sister of B'.\n\nIf C × M ÷ S × K − T + Q, then which of the following statements is NOT correct?", o: ["M is T's father's sister.","C is K's father's father.","K is the mother of Q.","S is Q's mother's father."], e: "M is K's father's sister (aunt), not T's father's sister. K is T's mother → T's father is K's husband, whose sister relationship is undefined. Option 1." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second is related to the first and the fourth is related to the third.\n\nRED : GHU :: BLUE : HXOE :: PINK : ?", o: ["NQLS","PLOK","MNHO","JHGF"], e: "Per response sheet, option 1 (NQLS)." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nAll schools are colleges. All colleges are houses. All houses are roads.\n\nConclusions:\nI. All schools are roads.\nII. All schools are houses.\nIII. All colleges are roads.", o: ["Only conclusions I and III follow.","Only conclusions II and III follow.","Only conclusions I and II follow.","All conclusions follow."], e: "Universal chain: schools ⊆ colleges ⊆ houses ⊆ roads. All three follow. Option 4." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\nQ _ C _ Q S _ B _ S _ _ Q S _ _", o: ["C B C Q C B B C","S B C Q C B C B","S B C B C B Q C","B B C B C B Q C"], e: "Per response sheet, option 2 (S B C Q C B C B)." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nOology : Eggs :: Palaeontology : ?", o: ["Soil","Fossils","Man","Writings"], e: "Oology = study of eggs; Palaeontology = study of fossils. Option 2." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. MUSLIN  2. MOUSSE  3. MOUTH  4. MOW  5. MOVE  6. MUCK", o: ["2, 4, 3, 5, 6, 1","5, 3, 4, 2, 1, 6","2, 3, 5, 4, 6, 1","1, 2, 3, 4, 5, 6"], e: "Dictionary order: MOUSSE(2), MOUTH(3), MOVE(5), MOW(4), MUCK(6), MUSLIN(1) → 2,3,5,4,6,1. Option 3." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nNo pigeon is a dove. Some doves are sparrows. All sparrows are birds.\n\nConclusions:\nI. Some sparrows are not pigeons.\nII. Some sparrows are doves.\nIII. Some birds are doves.", o: ["Only conclusion I follows","Only conclusion II follows","Either conclusion I or conclusion III follows","All the conclusions I, II and III follow"], e: "I: some doves (which are sparrows) are not pigeons ✓. II: 'some doves are sparrows' converts to 'some sparrows are doves' ✓. III: those doves which are sparrows are birds → some birds are doves ✓. Option 4." },
  { s: REA, q: "Which letter cluster will replace the question mark (?) to complete the given series?\n\nSPIN, RQJM, ?, PSLK, OTMJ", o: ["QRKL","QRLK","RQLK","QPKL"], e: "Per-letter shifts −1, +1, +1, −1 per term. SPIN→RQJM ✓. RQJM→QRKL ✓ (matches further to PSLK and OTMJ). Option 1." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given number series?\n\n25, 115, 214, 322, ?, 565, 700", o: ["439","427","448","432"], e: "Differences: 90, 99, 108, 117(?), 126, 135 (each +9). 322 + 117 = 439. Option 1." },
  { s: REA, q: "Select the option that is related to the third term in the same way as the second is related to the first and the sixth is related to the fifth.\n\nMISSION : NOSSIIM :: PHOENIX : ? :: ORGANIC : CIGANRO", o: ["XHOENIP","XIOENHP","PHEONIX","PHOEXIN"], e: "Reverse the word and swap positions 3 and 5. MISSION reversed=NOISSIM, swap pos 3 & 5 (I↔S) → NOSSIIM ✓. ORGANIC reversed=CINAGRO, swap pos 3 & 5 (N↔G) → CIGANRO ✓. PHOENIX reversed=XINEOHP, swap pos 3 & 5 (N↔E) → XIOENHP. Option 2." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\nL _ H _ _ L K H C _ _ K H _ _ L _ H C W", o: ["K C W W L C W K","W C L K L W K L","K K C W L K C W","L C W K K W C L"], e: "Per response sheet, option 1 (K C W W L C W K)." },
  { s: REA, q: "Select the option that is related to the fourth term in the same way as the first is related to the second and the fifth is related to the sixth.\n\n8 : 508 :: ? : 2193 :: 2 : 4", o: ["15","13","19","17"], e: "Pattern: n³ − 4. 8³−4 = 508 ✓. 2³−4 = 4 ✓. ?³ − 4 = 2193 → ?³ = 2197 = 13³ → ? = 13. Option 2." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second is related to the first and the fourth is related to the third.\n\nEARLY : YLRAE :: IMAGE : EGAMI :: LASER : ?", o: ["RASEL","RESAL","ERSLA","EASRL"], e: "Reverse the word. EARLY → YLRAE ✓. IMAGE → EGAMI ✓. LASER reversed = RESAL. Option 2." },
  { s: REA, q: "'A # B' means 'A is the daughter of B'; 'A % B' means 'A is the husband of B'; 'A & B' means 'A is the brother of B'; 'A @ B' means 'A is the sister of B'.\n\nIf S # P % Q @ T & V % X, then how is S related to X?", o: ["Husband's sister's daughter","Brother","Sister","Husband's brother's daughter"], e: "S is P's daughter; P is Q's husband → S is Q's daughter. Q is T's sister, T is V's brother → Q is V's sister. V is X's husband. So Q is X's husband's sister; S is Q's daughter → S is X's husband's sister's daughter. Option 1." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "In which of the following sports is the technique clean and jerk used?", o: ["Wrestling","Hammer throw","Body building","Weightlifting"], e: "'Clean and jerk' is a standard lift in Weightlifting (Olympic discipline). Option 4." },
  { s: GA, q: "Which compound is used to remove the skins from tomatoes, potatoes and other fruits and vegetables for canning and as an ingredient in food preservatives that helps prevent mold and bacteria from growing in food?", o: ["Sodium hydroxide","Magnesium bisulphite","Aluminium phosphide","Sodium bicarbonate"], e: "Sodium hydroxide (NaOH) is used in commercial peeling of tomatoes/potatoes and as a food preservative. Option 1." },
  { s: GA, q: "How is the molecular weight of fatty acid determined?", o: ["Iodine value","Acid value","Peroxide value","Saponification value"], e: "Saponification value (mg KOH per gram of fat) is inversely proportional to the molecular weight of fatty acids. Option 4." },
  { s: GA, q: "If four resistors of 3 Ω, 4 Ω, 5 Ω and 6 Ω are connected in series, what will be the combined resistance of the four resistors?", o: ["3 Ω","9 Ω","18 Ω","10 Ω"], e: "Series: 3 + 4 + 5 + 6 = 18 Ω. Option 3." },
  { s: GA, q: "Which of the following instruments is performed by Nandini and Ragini Shankar?", o: ["Veena","Sitar","Violin","Mridangam"], e: "Nandini and Ragini Shankar are renowned Indian classical violinists. Option 3." },
  { s: GA, q: "What was the theme of Independence Day in the year 2015 in India?", o: ["Ye India ka Time Hai","Towards True Freedom","Yad Karo Kurbani","One Country, One People"], e: "Theme of India's 69th Independence Day (2015) was 'Yad Karo Kurbani' (Remember the Sacrifices). Option 3." },
  { s: GA, q: "What was the style of architecture used in Laxmi Vilas Palace of Vadodara, Gujarat?", o: ["Indo-Islamic","Hindu Temple","Indo-Saracenic","Mughal"], e: "Laxmi Vilas Palace (1890) is built in the Indo-Saracenic style of architecture. Option 3." },
  { s: GA, q: "Which of the following is the highest peak of South India?", o: ["Doda Betta","Mahendragiri","Anai Mudi","Makurti"], e: "Anamudi (Anai Mudi) in Kerala at 2,695 m is the highest peak in South India. Option 3." },
  { s: GA, q: "In which of the following years did the Nawab of Awadh accept the Subsidiary Alliance, introduced by Lord Wellesley, Governor General of British India?", o: ["1801","1806","1796","1809"], e: "The Nawab of Awadh accepted the Subsidiary Alliance under Lord Wellesley in 1801. Option 1." },
  { s: GA, q: "Kamalini and Nalini Asthana, the dancer duo conferred with Padma Shri in 2022, are renowned for which of the following dance forms?", o: ["Kuchipudi","Manipuri","Bharatnatyam","Kathak"], e: "Asthana sisters (Padma Shri 2022) are eminent Kathak exponents. Option 4." },
  { s: GA, q: "Which of the following is considered as small earthquakes in underground caves and mines which are caused by the seismic waves produced by the eruption of rock on the surface?", o: ["Explosion earthquake","Collapse earthquake","Reservoir induced earthquakes","Volcanic earthquake"], e: "Collapse earthquakes occur in caves and mines due to roof/rock collapse. Option 2." },
  { s: GA, q: "Which of the following classical dance forms begins with a drum playing performance called 'Kelikottu'?", o: ["Bharatanatyam","Odissi","Kuchipudi","Kathakali"], e: "Kathakali performance traditionally begins with 'Kelikottu' — an invitational drum announcement. Option 4." },
  { s: GA, q: "Mariyappan Thangavelu and Sharad Kumar won Silver and Bronze in which sport at the Tokyo Paralympics?", o: ["High Jump","Shot Put","Weightlifting","Shooting"], e: "Both Mariyappan Thangavelu (Silver) and Sharad Kumar (Bronze) competed in the Men's High Jump T42/T63 at Tokyo Paralympics 2020. Option 1." },
  { s: GA, q: "Which of the following Articles of the Constitution of India states that no religious instructions shall be provided in any education institution wholly maintained out of state funds?", o: ["Article 40","Article 68","Article 54","Article 28"], e: "Article 28 prohibits religious instruction in any educational institution wholly maintained by state funds. Option 4." },
  { s: GA, q: "Who was appointed as the Chief Economic Advisor of the Government of India in January 2022?", o: ["M Jagdish Kumar","Sanjeev Sanyal","V Anantha Nageswaran","Madhavi Puri"], e: "V. Anantha Nageswaran was appointed Chief Economic Advisor of India on 28 January 2022. Option 3." },
  { s: GA, q: "When were the general elections to the Legislative Assembly of the National Capital Territory held for the first time?", o: ["1990","1993","1992","1991"], e: "The first elections to the Delhi NCT Legislative Assembly were held in 1993, following the 69th Amendment (1991). Option 2." },
  { s: GA, q: "In 1921–22, farmers of the Malabar seacoast of Kerala undertook a great uprising, which is known as the ________.", o: ["Munda uprising","Moplah uprising","Santhal uprising","Kol uprising"], e: "The Moplah (Mappila) uprising of 1921 took place in Malabar, Kerala. Option 2." },
  { s: GA, q: "Which of the following indicators presents a picture of occupational structure and unemployment in India?", o: ["Literacy rate","Per capita income","Sex ratio","Work participation rate"], e: "Work Participation Rate (WPR) directly reflects the occupational structure and employment scenario. Option 4." },
  { s: GA, q: "Karmayogi Bharat owns and operates the digital assets and platforms for the online training of ________.", o: ["civil servants","defence personnel","social activists","academicians"], e: "Karmayogi Bharat is the SPV under Mission Karmayogi for training civil servants. Option 1." },
  { s: GA, q: "Who is the author of the novel 'A Suitable Boy' which is one of the longest novels?", o: ["Salman Rushdie","R K Narayan","Vikram Seth","Rohinton Mistry"], e: "Vikram Seth wrote 'A Suitable Boy' (1993). Option 3." },
  { s: GA, q: "Who is given the credit for starting the Gupta era?", o: ["Samudragupta","Chandragupta II","Kumaragupta","Chandragupta I"], e: "Chandragupta I (reign 320-335 CE) is credited with starting the Gupta era in 320 CE. Option 4." },
  { s: GA, q: "Rohan Bopanna and Ramkumar Ramanathan got a direct entry into the doubles main draw of the fourth edition of which of the following tennis tournaments that began in January 2022?", o: ["Qatar ExxonMobil Open","Dubai Duty Free Tennis Championships","BNP Paribas Open","Tata Open Maharashtra"], e: "Tata Open Maharashtra began its fourth edition in January 2022 in Pune. Option 4." },
  { s: GA, q: "What does the 'Green Revolution' refer to in Indian Agriculture?", o: ["Increase in Agro based industries","Increase in forest cover","Increase in land under grassland","Spectacular increase in production of food grains"], e: "The Green Revolution (1960s onwards) refers to the dramatic rise in food grain production in India. Option 4." },
  { s: GA, q: "Who is a marginal worker as per the standard census definition in India?", o: ["A person who works for less than 100 days in a year","A person who works for less than 200 days in a year","A person who works for less than 183 days in a year","A person who works for less than 150 days in a year"], e: "Per Census of India: A worker who worked for less than 183 days (i.e., less than 6 months) in the reference year is a Marginal Worker. Option 3." },
  { s: GA, q: "Buland Darwaza at Fatehpur Sikri is a gateway to which of the following mosques?", o: ["Moti Masjid","Jama Masjid","Adhai Din Ka Jhonpra","Jamali Kamali"], e: "Buland Darwaza is the southern entrance to the Jama Masjid at Fatehpur Sikri. Option 2." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "P borrows ₹5,00,000 from the bank which charges 18% simple interest per annum at the start of the year. He pays 11 equal monthly instalments of ₹40,000 and his bike at the end of the year to pay the amount. What is the value of the bike given?", o: ["₹1,50,000","₹1,75,000","₹1,25,000","₹1,10,000"], e: "SI = 500000 × 0.18 = 90,000. Total due = 590,000. Paid in instalments = 11 × 40,000 = 4,40,000. Bike = 590,000 − 4,40,000 = ₹1,50,000. Option 1." },
  { s: QA, q: "Find the fourth proportion to the numbers 20, 32 and 36.", o: ["52","48","49.4","57.6"], e: "20 : 32 = 36 : x → x = 32 × 36 / 20 = 1152/20 = 57.6. Option 4." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "If 45 men can build a wall of 360 m length in 18 days, how many men will take 15 days to build a similar type of wall of length 180 m?", o: ["29 men","27 men","21 men","25 men"], e: "Men ∝ work/days. New men = 45 × (180/360) × (18/15) = 45 × 0.5 × 1.2 = 27 men. Option 2." },
  { s: QA, q: "Find the length based on the figure shown.", o: ["10.5 cm","9 cm","10 cm","9.5 cm"], e: "Per response sheet, option 1 (10.5 cm)." },
  { s: QA, q: "What is the remainder when 4999 is divided by 7?", o: ["2","4","1","3"], e: "4999 = 7 × 714 + 1 (since 7×714 = 4998). Remainder = 1. Option 3." },
  { s: QA, q: "A merchant bought two qualities of rice at the rate of Rs.120/kg and Rs.220/kg. In 72 kg of the second quality rice, how much rice (in kg) of the first quality should be mixed so that the resulting mixture may be sold at the rate of Rs.280/kg to earn a profit of 40%?", o: ["20","22","15","18"], e: "Selling 280/kg at 40% profit → CP per kg = 280/1.4 = 200. (15840 + 120x)/(72 + x) = 200 → 15840+120x = 14400+200x → 80x = 1440 → x = 18 kg. Option 4." },
  { s: QA, q: "Sanjib's salary was initially reduced by 50% and then boosted by 50%. What percentage of his salary does he lose?", o: ["0%","15%","25%","10%"], e: "Net factor = 0.5 × 1.5 = 0.75. Loss = 100% − 75% = 25%. Option 3." },
  { s: QA, q: "If the salary of Reeta is 25% more than the salary of Geeta, then the salary of Geeta is how much percentage less than the salary of Reeta?", o: ["20%","15%","25%","30%"], e: "R = 1.25G → G/R = 0.8 → G is 20% less than R. Option 1." },
  { s: QA, q: "A shopkeeper gives a 25% discount on the marked price of an item. If the selling price of the item is ₹150, then its marked price is:", o: ["₹300","₹500","₹200","₹100"], e: "SP = MP × 0.75 → MP = 150 / 0.75 = ₹200. Option 3." },
  { s: QA, q: "A bus travels at 70 km/h. How much distance will it travel in 36 minutes?", o: ["45 km","40 km","39 km","42 km"], e: "Distance = 70 × (36/60) = 42 km. Option 4." },
  { s: QA, q: "A is the average of 10 given numbers. B is the average after 2 of the numbers were replaced by 3 other different numbers. The average of the removed numbers is 48 and the average of the newly included numbers is 56. If A + B = 438, then the value of A − B is:", o: ["21","14","12","26"], e: "11B = 10A − 2×48 + 3×56 = 10A + 72. With A+B = 438 → B = 438−A → 11(438−A) = 10A+72 → A = 226, B = 212. A−B = 14. Option 2." },
  { s: QA, q: "A shopkeeper is purchasing goods from a wholesaler. The wholesaler is selling 1265 units of goods to the shopkeeper after gaining the sale price of 165 units of goods. What is the gain percentage of the wholesaler?", o: ["Option (image)","Option (image)","Option (image)","Option (image)"], e: "Per response sheet, option 1." },
  { s: QA, q: "The simple interest on a sum of ₹8,000 for 2 years is ₹720. What is rate of interest per annum?", o: ["5.5%","5%","6%","4.5%"], e: "R = (SI × 100)/(P × T) = (720 × 100)/(8000 × 2) = 72000/16000 = 4.5%. Option 4." },
  { s: QA, q: "In a division problem, the divisor is 12 times the quotient and 9 times the remainder. If the remainder is 96, then find the dividend.", o: ["62304","62404","62205","62208"], e: "Divisor = 9 × 96 = 864. Divisor = 12 × quotient → Q = 72. Dividend = 864 × 72 + 96 = 62208 + 96 = 62304. Option 1." },
  { s: QA, q: "While playing cards, a man loses 75% of his money in the first round, 75% of the remaining in the second round, and 75% of the remaining in the third round. If he is left with Rs.100, how much money does he have initially?", o: ["Rs.6,400","Rs.2,400","Rs.1,600","Rs.3,200"], e: "Initial × 0.25³ = 100 → Initial = 100 / 0.015625 = ₹6,400. Option 1." },
  { s: QA, q: "The mean proportional of 11 and 44 is:", o: ["22","27.5","25","33"], e: "Mean proportional = √(11 × 44) = √484 = 22. Option 1." },
  { s: QA, q: "A store declares a discount scheme as 'Buy 1 shampoo bottle and get 60% off on another shampoo of same quality, size and of the same price.' What is the profit percentage of the store, if each shampoo bottle has the cost price 60% below the marked price?", o: ["60%","64%","75%","54%"], e: "Let MP = 100, CP = 40. Customer pays MP + 0.4 MP = 140 for 2 bottles. Cost = 80. Profit = 140 − 80 = 60. Profit% = 60/80 × 100 = 75%. Option 3." },
  { s: QA, q: "A shopkeeper sells pens for ₹12 each, notebooks for ₹25 each and notebook covers for ₹8 each. What is the average price per item (in ₹) if he sells 5 pens, 8 notebooks and 16 notebook covers (rounded off to two decimal places)?", o: ["13.38","18.13","13.83","18.31"], e: "Total = 5×12 + 8×25 + 16×8 = 60 + 200 + 128 = 388. Items = 29. Avg = 388/29 ≈ 13.38. Option 1." },
  { s: QA, q: "A and B can do a piece of work in 16 days and 12 days, respectively. Both work for 4 days and then A goes away. Find how long will B take to complete the remaining work.", o: ["8 days","7 days","6 days","5 days"], e: "Together 4 days = 4 × (1/16 + 1/12) = 4 × 7/48 = 7/12. Remaining = 5/12. B alone: (5/12) / (1/12) = 5 days. Option 4." },
  { s: QA, q: "By selling 20 items, a shopkeeper gains the selling price of 5 items. His gain percentage is:", o: ["Option (image)","Option (image)","Option (image)","Option (image)"], e: "SP × 20 − CP × 20 = SP × 5 → SP × 15 = CP × 20 → SP/CP = 20/15 = 4/3. Gain = 1/3 = 33.33%. Per response sheet, option 3." },
  { s: QA, q: "A bus is running at a speed of 60 km/h to cover a distance in 50 min. To reduce the time of the journey to 20 min, at what speed (in km/h) should the bus run?", o: ["120","90","140","150"], e: "Distance = 60 × 50/60 = 50 km. New speed = 50 / (20/60) = 150 km/h. Option 4." },
  { s: QA, q: "In a parallelogram, one of the parallel sides is 16 cm and the other side is 12 cm. If the perpendicular distance between the two parallel sides of dimension 16 cm is 24 cm, then the perpendicular distance between its other two parallel sides is:", o: ["16 cm","12 cm","32 cm","24 cm"], e: "Area = 16 × 24 = 384 cm². Distance from 12-cm sides = 384 / 12 = 32 cm. Option 3." },
  { s: QA, q: "A certain sum, at a certain rate of simple interest, amounts to ₹2,225 in 4 years and to ₹2,606 in 8 years. Find the sum (in ₹).", o: ["1,344","1,240","1,143","1,844"], e: "Interest for 4 yrs = 2606 − 2225 = 381. Principal = 2225 − 381 = ₹1,844. Option 4." },
  { s: QA, q: "A TV manufacturer sells an item to a wholesale dealer at a profit of 8%. The wholesaler sells the same to a retailer at a profit of 10%. The retailer in turn sells it to a customer for ₹11,050 thereby earning a profit of 15%. The cost price of the manufacturer is: (Consider integral part only)", o: ["₹8,000","₹8,088","₹7,088","₹8,888"], e: "Retailer's CP = 11050/1.15 = 9608.70. Wholesaler's CP = 9608.70/1.10 = 8735.18. Manufacturer's CP = 8735.18/1.08 = 8088.13 → ₹8,088 (integral part). Option 2." },

  // ============ English Language (76-100) ============
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe streets are empty today as ________ a holiday.", o: ["was","its","it's","is"], e: "'As it's a holiday' = 'because it is a holiday'. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nPaddy is grown by the farmers of this village.", o: ["The farmers of this village grew paddy.","The farmers of this village have grown paddy.","The farmers of this village grow paddy.","The farmers of this village had grown paddy"], e: "Present simple passive → present simple active: 'is grown by' → 'grow'. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM to replace the italicised word.\n\nThere is a/an abundance of fertile soil and magnificent grazing land.", o: ["dearth","plenitude","adequacy","plethora"], e: "'Abundance' antonym = 'dearth' (scarcity). Option 1." },
  { s: ENG, q: "Choose the correct spelling of the underlined word.\n\nThe world is governed by several elemenyts.", o: ["elyments","elements","aliments","eliments"], e: "Correct spelling: 'elements'. Option 2." },
  { s: ENG, q: "Identify the sentence that contains no spelling errors.", o: ["An Ethical Hacker identifies software vulanerabilities so that business owners may adress them before a baleful hacker uncovers them.","An Ethickal Hacker identifies software vulnerabilities so that bussiness owners may address them before a baleful hacker uncovers them.","An Ethical Hacker identifies software vulnerabilities so that business owners may address them before a baleful hacker uncovers them.","An Ethickal Hacker identifies software vulanerabilities so that business owners may adress them before a baleful hacker uncovers them."], e: "Option 3 has all words spelled correctly: Ethical, vulnerabilities, business, address. Option 3." },
  { s: ENG, q: "Choose the option which means the same as the underlined segment.\n\nHis deep study of the case uncovered more problems.", o: ["opened a Pandora's box","opened the fire on","opened conversation","opened a season on"], e: "'Opened a Pandora's box' = caused a complex of unanticipated problems. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the underlined group of words in the given sentence.\n\nHe was severe in his manner, due to his rigidly puritanical outlook.", o: ["austere","faithful","precise","authentic"], e: "'Austere' = severe / strictly disciplined. Option 1." },
  { s: ENG, q: "Identify the INCORRECTLY spelt word from the options given.", o: ["Bangel","Angle","Angel","Bagel"], e: "'Bangel' is misspelled — correct is 'Bangle'. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the word 'Unworthy' from the given sentence.\n\nUnethical behaviour like saying mean or nasty things is intolerable to a noble person.", o: ["Intolerable","Noble","Nasty","Unethical"], e: "'Unworthy' antonym = 'Noble' (worthy). Option 2." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nAlthough the jury system is fundamentally ________, no one has ever come up with a better one.", o: ["sorted","appealing","flawless","flawed"], e: "'Although ... fundamentally flawed, no one has come up with a better one' — concession works only if word is negative. Option 4." },
  { s: ENG, q: "Identify the idiom that best expresses the meaning of the underlined group of words.\n\nHe is in a very bad situation after being caught with drugs at school.", o: ["Last resort","In dire straits","Square an account","At cross purposes"], e: "'In dire straits' = in a very bad/desperate situation. Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA floating container anchored to the sea bottom, so used for directing ships and warning them of possible danger", o: ["Buoy","Deck","Cabin","Channel"], e: "'Buoy' = floating navigation marker anchored to the seabed. Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom/phrase in the given sentence.\n\nHenry said he would help with the rent, but he left me in the lurch.", o: ["To comfort someone","To desert someone","To impersonate someone","To blame someone"], e: "'Leave (someone) in the lurch' = to desert in a difficult situation. Option 2." },
  { s: ENG, q: "Select the idiom that gives the most appropriate meaning of the underlined phrase.\n\nMy neighbour has decided to join the air force.", o: ["Made up his mind","Made a clean sweep","Made a fuss","Made his own way"], e: "'Made up his mind' = decided. Option 1." },
  { s: ENG, q: "Select the correct direct narration of the given sentence.\n\nPrem said that he had been listening to music for an hour.", o: ["Prem said, \"I have been listening to music for an hour.\"","Prem said, \"He has listening to music for an hour.\"","Prem said, \"He has be listened to music for an hour.\"","Prem said, \"I had listened to music for an hour.\""], e: "Indirect (past perfect continuous) → direct (present perfect continuous): he had been listening → 'I have been listening'. Option 1." },
  { s: ENG, q: "Read the passage on road rage.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'All drivers are affected by road rage, whether they are directly or indirectly (1)________.'", o: ["involves","involving","involve","involved"], e: "Past participle as adjective: 'directly or indirectly involved'. Option 4." },
  { s: ENG, q: "Read the passage on road rage.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'Individual coping qualities (2)________ the behaviour of stressful drivers.'", o: ["influence","increase","apply","multiply"], e: "'Influence the behaviour' is the natural collocation. Option 1." },
  { s: ENG, q: "Read the passage on road rage.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'drivers (3)________ learn to be patient.'", o: ["must","ought","can","to"], e: "Modal of obligation: 'drivers must learn'. Option 1." },
  { s: ENG, q: "Read the passage on road rage.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'we must be (4)________ to control our own emotions.'", o: ["able","consistent","oblige","brave"], e: "'Must be able to control' — standard modal + adjective + infinitive. Option 1." },
  { s: ENG, q: "Read the passage on road rage.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'Road raged drivers are also more likely to (5)________ more traffic offences.'", o: ["incur","proceed","reflect","drag"], e: "'Incur traffic offences' — incur = bring upon oneself. Option 1." },
  { s: ENG, q: "Read the passage on sparrows.\n\nWhat is the structure of the passage?", o: ["Compare and Contrast","Cause and Effect","Process Writing","Problems and Solution"], e: "The passage describes how sparrows nest, feed, bathe — step-by-step process descriptions. Option 3." },
  { s: ENG, q: "Read the passage on sparrows.\n\nWhat is the central theme of the passage?", o: ["About the food eaten by sparrows","About the lifestyle of sparrows","About the nest-building style of sparrows","About the bathing style of sparrows"], e: "Passage covers nests, eggs, feeding, bathing — overall lifestyle. Option 2." },
  { s: ENG, q: "Read the passage on sparrows.\n\nHow can one describe sparrows?", o: ["Sparrows are loving","Sparrows are good parents","Sparrows are found everywhere","Sparrows are good"], e: "Passage: 'Sparrows can be found almost everywhere, where there are humans'. Option 3." },
  { s: ENG, q: "Read the passage on sparrows.\n\nWhat is the tone of the passage?", o: ["Biased","Speculative","Descriptive","Apologetic"], e: "Passage objectively describes sparrows without strong emotion → Descriptive. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nEverywhere", o: ["Little","Somewhere","Rare","Nowhere"], e: "'Everywhere' antonym = 'Nowhere'. Option 4." }
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

  const TEST_TITLE = 'SSC Selection Post Phase XI (Matriculation) - 27 June 2023 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2023, pyqShift: 'Shift-2',
    pyqExamName: 'SSC Selection Post Phase XI (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
