/**
 * Seed: SSC Selection Post Phase XI 2023 (Matriculation Level) PYQ - 28 June 2023, Shift-1 (100 questions)
 * Source: SSC official response sheet (PDF + docx, English version).
 * Section order: REA → GA → QA → ENG.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-28jun2023-s1.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun28_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-28jun2023-s1';

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

const F = '28-jun-2023-s1';

const IMAGE_MAP = {
  3:  { q: 'image3.jpeg', opts: ['image4.jpeg','image5.jpeg','image6.jpeg','image7.jpeg'] },
  15: { q: 'image8.jpeg', opts: ['image9.png','image10.png','image11.png','image12.png'] },
  18: { q: 'image13.jpeg', opts: ['image14.jpeg','image15.jpeg','image16.jpeg','image17.jpeg'] },
  61: { q: '', opts: ['image18.jpeg','image19.jpeg','image20.jpeg','image21.jpeg'] }, // QA Q11
  64: { q: '', opts: ['image22.jpeg','image23.jpeg','image24.jpeg','image25.jpeg'] }, // QA Q14
  67: { q: 'image26.jpeg', opts: ['','','',''] }                                       // QA Q17
};

const KEY = [
  // REA
  2, 2, 2, 3, 4,   2, 4, 2, 3, 1,   2, 3, 4, 1, 1,   1, 2, 1, 4, 1,   1, 1, 1, 2, 1,
  // GA
  2, 3, 2, 4, 3,   2, 2, 1, 4, 3,   3, 4, 1, 2, 1,   4, 3, 1, 1, 4,   1, 1, 3, 1, 1,
  // QA
  2, 3, 4, 1, 4,   3, 2, 1, 1, 1,   4, 2, 3, 2, 3,   1, 1, 3, 1, 1,   3, 2, 2, 4, 3,
  // ENG
  3, 3, 3, 2, 2,   4, 2, 1, 1, 2,   2, 2, 1, 2, 4,   3, 2, 3, 3, 4,   1, 1, 3, 4, 2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term.\n\nFEDERAL : LAREDEF :: ECONOMY : ? :: GENERAL : LARENEG", o: ["MONEYCO","YMONOCE","OMYNECO","COMONEY"], e: "Pattern: reverse the word. FEDERAL → LAREDEF ✓. GENERAL → LARENEG ✓. ECONOMY reversed = YMONOCE. Option 2." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nPupils : Class :: Flowers : ?", o: ["Brood","Bouquet","Rose","Band"], e: "Pupils form a Class; Flowers form a Bouquet. Option 2." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nEscape : Abscond :: Idea : ?", o: ["Squander","Empty","Notion","Artificial"], e: "Escape and Abscond are synonyms; Idea and Notion are synonyms. Option 3." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nAll keys are windows. No window is a door. Some doors are locks.\n\nConclusions:\nI. Some locks are keys.\nII. No lock is a window.\nIII. No door is a key.", o: ["Both conclusions I and II follow.","Only conclusion II follows.","Only conclusion I follows.","Only conclusion III follows."], e: "Keys ⊆ Windows; No window is door → no key is door = no door is key (III ✓). I, II don't follow definitively. Option 4." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nAll bottles are plastics. Some plastics are fibres. Some fibres are glasses.\n\nConclusions:\nI. Some fibres are plastics.\nII. All plastics are bottles.\nIII. Some glasses are fibres.", o: ["None of the conclusions follows","Only conclusions I and III follow","Only conclusion II follows","Only conclusion I follows"], e: "I: some plastics are fibres → some fibres are plastics ✓. III: some fibres are glasses → some glasses are fibres ✓. II not derivable. Option 2." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n73, 57, 43, 31, ?, 13", o: ["27","25","29","21"], e: "Differences: −16, −14, −12, −10, −8. So next = 31 − 10 = 21. (Then 21 − 8 = 13 ✓.) Option 4." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in a logical and meaningful order.\n\n1. Wheat  2. Dough  3. Bake  4. Grind  5. Bread", o: ["4, 2, 1, 3, 5","1, 4, 2, 3, 5","3, 1, 5, 2, 4","1, 4, 3, 5, 2"], e: "Bread-making process: Wheat(1) → Grind(4) → Dough(2) → Bake(3) → Bread(5) → 1,4,2,3,5. Option 2." },
  { s: REA, q: "Select the option that is related to the fourth term in the same way as the first is related to the second and the fifth is related to the sixth.\n\n9 : 126 :: ? : 238 :: 21 : 294", o: ["18","28","17","22"], e: "Pattern: n × 14. 9×14=126 ✓. 21×14=294 ✓. 17×14=238. Option 3." },
  { s: REA, q: "'A # B' means 'A is the daughter of B'; 'A @ B' means 'A is the only son of B'; 'A & B' means 'A is the mother of B'; 'A % B' means 'A is the father-in-law of B'.\n\nIf P # Q @ R % S & T @ Q, then how is P related to T?", o: ["Sister","Mother's sister","Brother","Father's brother"], e: "P is Q's daughter; Q is R's only son; R is S's father-in-law → S is Q's wife. S is T's mother; T is Q's only son. P and T share parents (Q & S). P is female (daughter), T is male (only son). P is T's sister. Option 1." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second is related to the first and the fourth is related to the third.\n\nFLIGHT : GHIFLT :: PERIOD : IORPED :: GARLIC : ?", o: ["LIRGCA","LIRGAC","RILACG","RILAGC"], e: "Rearrange letters to positions 4,5,3,1,2,6 of original. FLIGHT(F,L,I,G,H,T) → G(4),H(5),I(3),F(1),L(2),T(6) = GHIFLT ✓. GARLIC → L(4),I(5),R(3),G(1),A(2),C(6) = LIRGAC. Option 2." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in a logical and meaningful order.\n\n1. Country  2. Continent  3. City  4. Street  5. State", o: ["1, 2, 5, 3, 4","1, 2, 3, 5, 4","2, 1, 5, 3, 4","3, 2, 1, 5, 4"], e: "Descending size: Continent(2) > Country(1) > State(5) > City(3) > Street(4) → 2,1,5,3,4. Option 3." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) and complete the given series?\n\nUTSR, XWVU, ?, DCBA, GFED", o: ["BZYW","BZYX","AZWY","AZYX"], e: "Each letter +3 per term. UTSR → XWVU (+3 each); +3 → AZYX (X+3=A, W+3=Z, V+3=Y, U+3=X). Option 4." },
  { s: REA, q: "Which letter cluster will replace the question mark (?) to complete the given series?\n\nTUBE, SXEH, ?, QDKN, PGNQ", o: ["RAHK","RADG","RAKH","RAGD"], e: "Per-letter shifts: 1st −1, 2nd +3, 3rd +3, 4th +3 per term. TUBE → SXEH ✓. SXEH → RAHK. Option 1." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "A − B means 'A is the wife of B'; A + B means 'A is the sister of B'; A * B means 'A is the father of B'.\n\nIf Q − T * Y + M − K, then how is Q related to K?", o: ["Mother-in-law","Mother","Sister","Grandmother"], e: "Q is T's wife. T is Y's father. Y is M's sister → M is also T's daughter (sibling). M is K's wife → K is T's son-in-law. Q is T's wife → Q is K's mother-in-law. Option 1." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n83 * 16 * 4 * 57 * 3", o: ["=, ÷, +, −","−, ×, =, ÷","−, +, =, −","−, ÷, =, +"], e: "Option 2: 83 − 16 × 4 = 57 ÷ 3 → 83 − 64 = 19 → 57/3 = 19 ✓. Option 2." },
  { s: REA, q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nSome diamonds are stones. Some stones are hard. All hard are rocks.\n\nConclusions:\nI. Some stones are diamonds.\nII. All stones are hard.\nIII. Some hard are rocks.", o: ["All the conclusions follow","Only conclusions I and II follow","Only conclusions II and III follow","Only conclusions I and III follow"], e: "I: 'some diamonds are stones' converts to 'some stones are diamonds' ✓. II: 'some' doesn't imply 'all'. III: all hard are rocks → some hard are rocks ✓. Option 4." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Cope  2. Cosmetic  3. Courage  4. Cough  5. Course  6. Courier", o: ["1, 2, 4, 3, 6, 5","1, 2, 4, 3, 5, 6","1, 2, 4, 6, 3, 5","2, 1, 4, 3, 6, 5"], e: "Dictionary order: Cope(1), Cosmetic(2), Cough(4), Courage(3), Courier(6), Course(5) → 1,2,4,3,6,5. Option 1." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series, will complete the series.\n\nPB_EP_UF_BU_PBUH", o: ["UBPG","RUPE","URGH","EPRU"], e: "Per response sheet, option 1 (UBPG)." },
  { s: REA, q: "In a code language, 'chores are hobbies' is written as 'tpl esr nil', 'hobbies keep me busy' is written as 'cha esr lon ane', 'busy with chores' is written as 'sia ane nil'. What is the code for the word 'with' in this language?", o: ["sia","ane","cha","tpl"], e: "Common 1&3: 'chores' = nil. Common 2&3: 'busy' = ane. Set 3 remaining: 'with' = sia. Option 1." },
  { s: REA, q: "Read the given statements and conclusions.\n\nStatements:\nAll pigeons are ants. Some ants are birds. All birds are cats.\n\nConclusions:\nI. Some cats are pigeons.\nII. Some birds are pigeons.\nIII. Some cats are ants.", o: ["Only conclusion III follows","Only conclusion II follows","All conclusions follow","Only conclusion I follows"], e: "III: some ants are birds, all birds are cats → some ants are cats → some cats are ants ✓. I, II not definitively derivable. Option 1." },
  { s: REA, q: "Select the option that is related to the fourth term in the same way as the first is related to the second and the fifth is related to the sixth.\n\n22 : 676 :: ? : 361 :: 2 : 36", o: ["18","15","17","13"], e: "Pattern: (n + 4)². 22+4=26, 26²=676 ✓. 2+4=6, 6²=36 ✓. √361 = 19 → ? + 4 = 19 → ? = 15. Option 2." },
  { s: REA, q: "'A # B' means 'A is the brother of B'; 'A @ B' means 'A is the daughter of B'; 'A & B' means 'A is the husband of B'; 'A % B' means 'A is the wife of B'.\n\nIf S % D # F @ G & H @ J, then how is F related to H?", o: ["Daughter","Son's wife","Daughter's daughter","Mother"], e: "F is G's daughter. G is H's husband → H is G's wife. F is therefore H's daughter (G & H's daughter). Option 1." },

  // ============ GA (26-50) ============
  { s: GA, q: "In September 2021, the 'SAATH' initiative was launched in ________, for women associated with Self Help Groups (SHGs).", o: ["Tamil Nadu","Jammu and Kashmir","Kerala","Andaman and Nicobar Islands"], e: "The SAATH initiative was launched in Jammu & Kashmir in Sept 2021 to support women in SHGs. Option 2." },
  { s: GA, q: "Rajya Sabha has to return the money bill to Lok Sabha with or without the recommendation within ________.", o: ["10 days","30 days","14 days","21 days"], e: "Per Article 109, Rajya Sabha must return a money bill within 14 days. Option 3." },
  { s: GA, q: "In January 2022, TS Tirumurti was in news due to:", o: ["being nominated as the president of FIH","assuming chair of the Counter-Terrorism Committee of the United Nations","becoming FIFA player of the year","becoming the first Indian to reach the north pole"], e: "T.S. Tirumurti (India's PR to the UN) assumed the chair of the UN Counter-Terrorism Committee in January 2022. Option 2." },
  { s: GA, q: "The 2021 U-19 Asia Cup Cricket was hosted by which of the following countries?", o: ["Qatar","Bangladesh","Pakistan","UAE"], e: "The 2021 ACC U-19 Asia Cup was held in the UAE in December 2021. Option 4." },
  { s: GA, q: "Identify the odd option in relation to the oceanic layers.", o: ["The Oceanic Deeps","The Oceanic Slope","The Continental Shelf","The Continental Slope"], e: "Continental Shelf is part of the continental margin (not strictly an oceanic layer). Option 3." },
  { s: GA, q: "According to standard census definition, who among the following can be categorised as a main worker in India?", o: ["A person who works for at least 160 days","A person who works for at least 183 days","A person who works for at least 200 days","A person who works for at least 100 days"], e: "Per Census of India: A main worker is one who has worked for the major part (6 months / 183 days or more) of the reference year. Option 2." },
  { s: GA, q: "Who is the 50th Chief Justice of India?", o: ["UU Lalit","DY Chandrachud","NV Ramana","Sharad Arvind Bobde"], e: "Justice DY Chandrachud was sworn in as the 50th CJI on 9 November 2022. Option 2." },
  { s: GA, q: "India lifted a record-extending ________ ICC U19 World Cup title after defeating England in the final at the Sir Vivian Richards Stadium in North Sound, Antigua in February 2022.", o: ["fifth","third","sixth","eighth"], e: "India's 2022 U19 WC win (5th title: 2000, 2008, 2012, 2018, 2022). Option 1." },
  { s: GA, q: "Triple point can be defined as:", o: ["the condition of temperature under which the gaseous and liquid phases of a substance can exist in equilibrium","the temperature at which solid is converted into liquid","the condition of pressure under which the solid and liquid phases of a substance can exist in equilibrium","the condition of temperature and pressure under which the gaseous, liquid and solid phases of a substance can exist in equilibrium"], e: "Triple point: the unique T and P at which all three phases (solid, liquid, gas) coexist in equilibrium. Option 4." },
  { s: GA, q: "In which year, the Koya rebellion took place in the eastern Godavari tract?", o: ["1882-1883","1887-1888","1879-1880","1874-1875"], e: "The Koya / Rampa Rebellion in the eastern Godavari tract occurred in 1879-80, led by Tomma Sora. Option 3." },
  { s: GA, q: "For how many days did the Government of India launch the 'Garib Kalyan Rojgar Abhiyan' (GKRA), in June 2020?", o: ["100 days","150 days","125 days","200 days"], e: "GKRA was launched on 20 June 2020 as a 125-day employment campaign across 116 districts. Option 3." },
  { s: GA, q: "Devdas Smriti Panthi Dance Award is related to which state?", o: ["Rajasthan","Bihar","Jharkhand","Chhattisgarh"], e: "Panthi is a folk dance of the Satnami community of Chhattisgarh; the award is given by the Chhattisgarh government. Option 4." },
  { s: GA, q: "Fazilka Heritage Festival is an annual art, cultural and food festival celebrated in which of the following states?", o: ["Punjab","Maharashtra","Haryana","Uttar Pradesh"], e: "Fazilka Heritage Festival is held in Fazilka, Punjab. Option 1." },
  { s: GA, q: "Identify an algae that undergoes anisogamous fusion of gametes.", o: ["Spirogyra","Eudorina","Volvox","Ulothrix"], e: "Eudorina exhibits anisogamous reproduction (gametes differ in size). Spirogyra is isogamous; Volvox is oogamous. Option 2." },
  { s: GA, q: "The correct sequence in descending order of the following states in terms of the proved coal reserves (as of the Ministry of Coal, Government of India, 2018) is:", o: ["Jharkhand, Odisha, Chhattisgarh, West Bengal","Odisha, Chhattisgarh, Madhya Pradesh, Jharkhand","Jharkhand, Chhattisgarh, Odisha, Madhya Pradesh","Chhattisgarh, Odisha, Jharkhand, Madhya Pradesh"], e: "Per the 2018 coal reserves data: Jharkhand > Odisha > Chhattisgarh > West Bengal. Option 1." },
  { s: GA, q: "Zakir Hussain is renowned for playing the ________.", o: ["santoor","sitar","shehnai","tabla"], e: "Ustad Zakir Hussain is a legendary tabla maestro. Option 4." },
  { s: GA, q: "In North Indian temple architecture, which element denotes the superstructure or tower above the sanctum and the pillared mandapas?", o: ["Kalasha","Amalaka","Shikhara","Antarala"], e: "Shikhara is the towering superstructure above the garbhagriha in Nagara-style North Indian temples. Option 3." },
  { s: GA, q: "Lai Haraoba is the earliest form of dance that forms the basis of all stylist dances of ________.", o: ["Manipur","Madhya Pradesh","Punjab","Uttar Pradesh"], e: "Lai Haraoba is the traditional Meitei ritual dance of Manipur, considered the foundation of Manipuri classical dance. Option 1." },
  { s: GA, q: "Which of the following autobiographies was written by the Indian female poet Kamala Das, who was nominated for Nobel Prize for literature in 1984?", o: ["My Story","A Life Less Ordinary","A Life Apart","Smritichitre: The Memoire of a Spirited Wife"], e: "'My Story' (1976) is the autobiography of Kamala Das. Option 1." },
  { s: GA, q: "'Vikramarjuna-Vijaya' composed by Pampa was written in which of the following languages?", o: ["Sanskrit","Tamil","Telugu","Kannada"], e: "Pampa (10th century), the 'Adikavi of Kannada', wrote Vikramarjuna Vijaya in Kannada. Option 4." },
  { s: GA, q: "Which of the following National Waterways is located in Tamil Nadu?", o: ["National Waterway-97","National Waterway-93","National Waterway-98","National Waterway-99"], e: "Per response sheet, option 1 (NW-97)." },
  { s: GA, q: "Pushyamitra, who was the commander of Brihadratha, the last Mauryan emperor, killed the king and established a new dynasty. Which of the following was his dynasty?", o: ["Shunga","Satavahana","Chedi","Kanva"], e: "Pushyamitra founded the Shunga dynasty (c. 185 BCE) after killing Brihadratha. Option 1." },
  { s: GA, q: "Who among the following founded the 'Forward Bloc'?", o: ["Motilal Nehru","Dadabhai Naoroji","Subhas Chandra Bose","Surendranath Banerjee"], e: "Subhas Chandra Bose founded the All India Forward Bloc on 22 June 1939. Option 3." },
  { s: GA, q: "Who became the first Indian to win a silver medal in an individual section of the Para Archery World championship in February 2022?", o: ["Pooja Jatyan","Rakesh Kumar","Jyothi Surekha Vennam","Harvinder Singh"], e: "Pooja Jatyan became the first Indian to win silver in individual section at the World Para Archery Championship in Dubai, February 2022. Option 1." },
  { s: GA, q: "Identify the type of cell that is long and branched.", o: ["Nerve cell","Columnar epithelial cell","White blood cell","Red blood cell"], e: "Nerve cells (neurons) are long and branched (dendrites + axon) — among the longest cells in the body. Option 1." },

  // ============ QA (51-75) ============
  { s: QA, q: "The largest number of four digits that is divisible by 12, 15 and 18 is ________.", o: ["9450","9900","9000","9750"], e: "LCM(12,15,18) = 180. 9999/180 = 55 remainder 99 → 55×180 = 9900. Option 2." },
  { s: QA, q: "Find the time taken by a 150 m long train, running at a speed of 63 km/h, to cross another train of length 100 m, running at a speed of 45 km/h in the same direction.", o: ["40 seconds","45 seconds","50 seconds","60 seconds"], e: "Relative speed = 63 − 45 = 18 km/h = 5 m/s. Combined length = 250 m. Time = 250/5 = 50 s. Option 3." },
  { s: QA, q: "A can complete a piece of work in 12 days while B can do the same work in 18 days. If they both work together, then how many days will be required to finish the work?", o: ["6.5","6","7","7.2"], e: "1/12 + 1/18 = 5/36. Days = 36/5 = 7.2. Option 4." },
  { s: QA, q: "A vehicle travels 200 metres in 5 sec and then another 250 metres in 5 sec. What is its average speed (in meters/sec)?", o: ["45","50","55","40"], e: "Total dist = 450 m, total time = 10 s. Avg speed = 45 m/s. Option 1." },
  { s: QA, q: "In a company, the total customer calls on Monday, Wednesday and Friday are 15,500 and the total calls on Tuesday and Thursday are 12,500. The average calls on Saturday and Sunday are 7,000. What are the average calls per day in a week?", o: ["6500","7500","7000","6000"], e: "Sat+Sun = 7000 × 2 = 14000. Total week = 15500 + 12500 + 14000 = 42000. Daily avg = 42000/7 = 6000. Option 4." },
  { s: QA, q: "In a street there are 20 dogs and cats. If the ratio between dogs and cats is 3:2, then the number of cats is ________.", o: ["16","10","8","22"], e: "Cats = (2/5) × 20 = 8. Option 3." },
  { s: QA, q: "X, Y and Z can do a piece of work in 4 days, 5 days and 7 days, respectively. They get ₹415 for completing the work. If X, Y and Z have worked together to complete the work, what is X's share?", o: ["₹275","₹175","₹200","₹225"], e: "Daily rates: 1/4 : 1/5 : 1/7 = 35 : 28 : 20 (over 140). X's share = 35/(35+28+20) × 415 = 35/83 × 415 = ₹175. Option 2." },
  { s: QA, q: "The average of 48, 39 and y is 40. Find the value of y.", o: ["33","32","35","31"], e: "48 + 39 + y = 120 → y = 33. Option 1." },
  { s: QA, q: "The annual incomes of Anand and Bharath are in the ratio 3 : 5 and their annual expenses are in the ratio 1 : 3. If each of them saves ₹10,000 at the end of the year, then the annual income of Bharath is:", o: ["₹25,000","₹12,000","₹15,000","₹30,000"], e: "Incomes 3x, 5x; expenses y, 3y. 3x − y = 10000; 5x − 3y = 10000. Solving: x = 5000. Bharath's income = 5 × 5000 = ₹25,000. Option 1." },
  { s: QA, q: "Mukesh sells almonds at the cost price but uses a false weight and thus gains a 23% profit. How many grams of almonds is he giving for 3.075 kg?", o: ["2500","2700","2400","2600"], e: "True quantity = 3075 / 1.23 = 2500 g. Option 1." },
  { s: QA, q: "A dishonest shopkeeper professes to sell grains at cost price, but he uses a weight of 935 g for 1 kg weight. Find his gain percentage.", o: ["Option (image)","Option (image)","Option (image)","Option (image)"], e: "Gain% = (65/935) × 100 ≈ 6.95% = 6 50/187 %. Per response sheet, option 4." },
  { s: QA, q: "In an election between two candidates, one candidate got 60% of the valid votes. If the total number of votes polled were 8850, and 10% of the votes were invalid, then find the number of valid votes that the other candidate got.", o: ["3816","3186","3681","3618"], e: "Valid votes = 8850 × 0.9 = 7965. Other candidate's = 40% = 0.4 × 7965 = 3186. Option 2." },
  { s: QA, q: "A person completes 80 km of a journey at 10 km/h and the remaining 70 km in 7 hours. His average speed for the whole journey is:", o: ["10.5 km/h","9 km/h","10 km/h","9.5 km/h"], e: "Total time = 80/10 + 7 = 15 h. Total dist = 150 km. Avg = 10 km/h. Option 3." },
  { s: QA, q: "By working 12 hours a day, 90 people can complete a work in 16 days. How much work will be left after 24 days if 70 people work for 8 hours per day?", o: ["Option (image)","Option (image)","Option (image)","Option (image)"], e: "Total man-hours needed = 12 × 90 × 16 = 17280. Done = 70 × 8 × 24 = 13440. Done fraction = 13440/17280 = 7/9. Left = 2/9. Per response sheet, option 2." },
  { s: QA, q: "To buy a car, Sahil borrowed some amount at 10% simple interest rate. He has paid some loan amount but ₹1,81,500 is due which he has to pay in 3 years. What will be the annual installment (in ₹)?", o: ["65,000","47,000","55,000","54,500"], e: "Annual instalment formula (SI): I = 100P / [100n + r×n(n−1)/2] = 100×181500 / (300+30) = ₹55,000. Option 3." },
  { s: QA, q: "A book is sold at a discount of 32% and an additional discount of 25% is allowed on cash payment. If Ramesh purchased the book by paying ₹2,550 in cash, find the marked price of the book.", o: ["₹5,000","₹5,050","₹4,950","₹5,560"], e: "MP × 0.68 × 0.75 = 2550 → MP × 0.51 = 2550 → MP = ₹5,000. Option 1." },
  { s: QA, q: "Answer based on the figure shown.", o: ["8%","10%","5%","12%"], e: "Per response sheet, option 1 (8%)." },
  { s: QA, q: "In an examination, the ratio of practical to theory marks is 3 : 7. If 80% of the marks are scored in the practical and 60% of marks are scored in the theory, what is the ratio of marks scored in the theory and the practical?", o: ["6 : 7","5 : 7","7 : 4","3 : 7"], e: "Scored: practical = 0.8 × 3 = 2.4; theory = 0.6 × 7 = 4.2. Ratio theory : practical = 4.2 : 2.4 = 7 : 4. Option 3." },
  { s: QA, q: "What annual instalment will discharge a debt of ₹35,455 due in three years at 12% simple interest per annum (round off to nearest rupee)?", o: ["₹10,552","₹14,652","₹11,804","₹12,548"], e: "Annual instalment I = 100P / [100n + r×n(n−1)/2] = 100×35455 / (300+36) = 3545500/336 ≈ ₹10,552. Option 1." },
  { s: QA, q: "The perimeter of an isosceles right-angled triangle having an area of 200 cm² is:", o: ["68.3 cm","78.2 cm","70.6 cm","58.6 cm"], e: "Legs a: a²/2 = 200 → a = 20. Hypotenuse = 20√2 ≈ 28.28. Perimeter = 40 + 28.28 ≈ 68.3 cm. Option 1." },
  { s: QA, q: "The height of Ankit was 160 cm last year. In a year, his height increased by 8%. What is his height now?", o: ["173 cm","172.2 cm","172.8 cm","173.2 cm"], e: "160 × 1.08 = 172.8 cm. Option 3." },
  { s: QA, q: "A solid sphere has a surface area of 616 cm². This sphere is now cut into two hemispheres. What is the total surface area of one of the hemispheres?", o: ["440 cm²","462 cm²","452 cm²","390 cm²"], e: "4πr² = 616 → r² = 49. TSA of hemisphere = 3πr² = 3 × 22/7 × 49 = 462 cm². Option 2." },
  { s: QA, q: "If a shopkeeper sold one-third of his goods at a loss of 20%, then at what gain % should the remainder be sold to gain 25% on the whole transaction?", o: ["32.5%","47.5%","20%","5%"], e: "Let CP = 3. SP of 1/3 = 0.8. Total SP = 3 × 1.25 = 3.75. SP of 2/3 = 2.95. Gain% = (2.95−2)/2 × 100 = 47.5%. Option 2." },
  { s: QA, q: "In an election between two candidates, 84 votes were declared as invalid. The winning candidate secures 62% of the valid votes and wins by 96 votes. The number of votes polled is:", o: ["424","543","641","484"], e: "Margin = 62% − 38% = 24% of valid = 96 → valid = 400. Total = 400 + 84 = 484. Option 4." },
  { s: QA, q: "After giving two successive discounts of 30% and 40% on the marked price, an article is sold for ₹420. Find the marked price of the article.", o: ["₹900","₹800","₹1,000","₹1,100"], e: "MP × 0.7 × 0.6 = 420 → MP × 0.42 = 420 → MP = ₹1,000. Option 3." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the idiom that gives the most appropriate meaning of the underlined phrase.\n\nChanda always annoys everyone by praising herself all the time.", o: ["Crying over the spilt milk","Catching one's eyes","Blowing her own trumpet","Facing the music"], e: "'Blowing her own trumpet' = boastfully self-praising. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDespair", o: ["Distant","Sorrow","Optimism","Distinct"], e: "'Despair' = hopelessness. Antonym = Optimism (hope). Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nHe said, \"I will see you now.\"", o: ["He said he will see you now.","He said he will see me now.","He said he would see me then.","He said I will see you now."], e: "Direct → indirect: I → he; will → would; you → me; now → then. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nTropical forests have ________ greenery.", o: ["exciting","lush","thorny","withered"], e: "'Lush greenery' is the natural collocation for tropical forests. Option 2." },
  { s: ENG, q: "Select the INCORRECTLY spelt word in the following sentence.\n\nWomen's vulnarability due to the denial of ownership of productive resources has been focused on in the analysis of how progressive laws shaped gender relations.", o: ["analysis","vulnarability","progressive","focused"], e: "'vulnarability' is misspelled — correct is 'vulnerability'. Option 2." },
  { s: ENG, q: "Select the most appropriate ANTONYM to replace the italicised word.\n\n\"Can I borrow your cell?\" She asked.", o: ["bite","rent","hire","lend"], e: "'Borrow' antonym = 'Lend'. Option 4." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nGet out of hand", o: ["Keep control of hand","Go out of control","Hands should be crossed","Fall from hand"], e: "'Get out of hand' = become uncontrollable / out of control. Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe sweater is knitted by Suman.", o: ["Suman knits the sweater.","Suman be knitted the sweater.","Suman have knitting the sweater.","Suman been knit the sweater."], e: "Present simple passive → present simple active: 'is knitted by' → 'knits'. Option 1." },
  { s: ENG, q: "Choose the option that rectifies the grammatical and spelling errors in the given sentence.\n\nThe secret to tightrope walking is to graps the rope between the twos and distribute one's weight evenly on the soles of one's feet.", o: ["to grasp the rope between the toes","evenly on the soul of one's feet","and distribute ones weight","The secrte of tightrope walk is"], e: "Original errors: 'graps' → 'grasp'; 'twos' → 'toes'. Option 1 corrects both. Option 1." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nTime management is essential for a ________ life and career.", o: ["failed","successful","scrupulous","mere"], e: "'A successful life and career' — positive collocation. Option 2." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nAll desire wealth and some will ________ it.", o: ["remove","acquire","aspire","collude"], e: "'Some will acquire it' = some will obtain wealth. Option 2." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nThrow caution to the wind", o: ["To be indecisive or unsure about a decision","To take a big risk or be reckless","To be overly cautious or hesitant","To be too strict or rigid in following rules"], e: "'Throw caution to the wind' = act recklessly / take big risk. Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nJokes and funny remarks amongst friends.", o: ["Banter","Discussion","Meet","Saunter"], e: "'Banter' = playful, friendly exchange of teasing remarks. Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nThrough the grapevine", o: ["Through difficulties","Via gossip","Extremely ill","Succeeded brilliantly"], e: "'Through the grapevine' = via informal gossip channels. Option 2." },
  { s: ENG, q: "Choose the option that rectifies the incorrectly spelt underlined word.\n\nThe Swiss entrepreneure has pulled the plug on any further investment in the firm.", o: ["antepreneure","entreperneur","entreprenur","entrepreneur"], e: "Correct spelling: 'entrepreneur'. Option 4." },
  { s: ENG, q: "Read the passage on children/future.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'a country that does not take care of this (1)________ resource'", o: ["valued","extravagant","valuable","worthless"], e: "'This valuable resource' — natural collocation. Option 3." },
  { s: ENG, q: "Read the passage on children/future.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'lift this (2)________ responsibility on their shoulders'", o: ["impotent","mighty","bulky","frail"], e: "'Mighty responsibility' — large, weighty duty. Option 2." },
  { s: ENG, q: "Read the passage on children/future.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'(3)________, this is not the case in our country.'", o: ["Certainly","Necessarily","Unfortunately","Partially"], e: "'Unfortunately' — used to introduce a regretful contrast. Option 3." },
  { s: ENG, q: "Read the passage on children/future.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'Education, which is a necessity, is still a (4)________ here.'", o: ["theory","delight","luxury","study"], e: "Saying education is still a 'luxury' — i.e., not affordable for all — fits context. Option 3." },
  { s: ENG, q: "Read the passage on children/future.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'Poor people (5)________ to send their children to school.'", o: ["explicate","agitate","fluctuate","hesitate"], e: "'Poor people hesitate to send their children to school' — fits financial constraint context. Option 4." },
  { s: ENG, q: "Read the passage on sparrows.\n\nIdentify the central theme of the passage.", o: ["Description of lifestyle of sparrows","Description of sparrows' nest","Different shortcomings of sparrows","Availability of sparrows"], e: "Passage covers nests, eggs, feeding habits, parents — overall lifestyle. Option 1." },
  { s: ENG, q: "Read the passage on sparrows.\n\nHow many eggs are laid by female sparrows at a time?", o: ["Four to six","Two to four","Six to eight","Eight to ten"], e: "Passage: 'Four to six eggs are laid by female sparrows at a time'. Option 1." },
  { s: ENG, q: "Read the passage on sparrows.\n\nSelect the most appropriate ANTONYM of the given word.\n\nMelody", o: ["Musicality","Symphony","Disharmony","Ballad"], e: "'Melody' (pleasing tune) antonym = 'Disharmony'. Option 3." },
  { s: ENG, q: "Read the passage on sparrows.\n\nIdentify a suitable title for the passage.", o: ["Song of Sparrows","How Sparrows Build Nests","What Do The Sparrows Eat?","The Lives Of Sparrows"], e: "Passage broadly covers various aspects of sparrows' lives → 'The Lives Of Sparrows'. Option 4." },
  { s: ENG, q: "Read the passage on sparrows.\n\nIdentify the tone of the passage.", o: ["Analytical","Descriptive","Satiric","Humorous"], e: "Passage objectively describes sparrows — descriptive tone. Option 2." }
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

  const TEST_TITLE = 'SSC Selection Post Phase XI (Matriculation) - 28 June 2023 Shift-1';
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
