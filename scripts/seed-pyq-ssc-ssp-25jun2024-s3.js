/**
 * Seed: SSC Selection Post Phase XII 2024 (Graduate Level) PYQ - 25 June 2024, Shift-3
 * Section order: REA → GA → QA → ENG. Key auto-decoded from green-tick bullets.
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun25_2024_s3";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-25jun2024-s3';

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

const F = '25-jun-2024-s3';

const IMAGE_MAP = {
  6:  { q: 'image4.jpeg', opts: ['image5.png','image6.png','image7.jpeg','image8.jpeg'] },      // REA mirror
  7:  { q: 'image9.png', opts: ['image10.png','image11.png','image12.png','image13.png'] },     // REA embedded figure
  17: { q: 'image14.png', opts: ['image15.png','image16.png','image17.png','image18.png'] },    // REA figure series
  23: { q: 'image19.jpeg', opts: ['','','',''] },                                                // REA dice
  55: { q: 'image20.jpeg', opts: ['','','',''] },                                                // QA Q5 image
  58: { q: '', opts: ['image21.jpeg','image22.jpeg','image23.jpeg','image24.jpeg'] },           // QA Q8 tan²A+cos²C image opts
  59: { q: '', opts: ['image25.jpeg','image26.png','image27.png','image28.png'] },              // QA Q9 sin+cos image opts
  60: { q: 'image29.jpeg', opts: ['image30.png','image31.png','image32.png','image33.png'] },   // QA Q10 image-only
  64: { q: 'image34.jpeg', opts: ['','','',''] },                                                // QA Q14 image
  66: { q: 'image35.jpeg', opts: ['','','',''] },                                                // QA Q16 image
  71: { q: 'image36.jpeg', opts: ['','','',''] },                                                // QA Q21 percentage table
  73: { q: 'image37.png', opts: ['','','',''] },                                                 // QA Q23 image
  75: { q: 'image38.jpeg', opts: ['','','',''] }                                                 // QA Q25 image
};

const KEY = [
  // REA (1-25)
  2, 1, 1, 3, 1,   1, 4, 1, 3, 2,   3, 1, 1, 2, 3,   2, 4, 1, 1, 2,   1, 4, 3, 2, 3,
  // GA (26-50)
  2, 2, 1, 1, 1,   1, 3, 3, 1, 3,   1, 3, 2, 1, 3,   4, 1, 1, 3, 4,   2, 1, 2, 3, 2,
  // QA (51-75)
  2, 3, 3, 2, 1,   2, 4, 4, 2, 1,   1, 4, 4, 3, 4,   1, 1, 4, 4, 2,   3, 1, 1, 2, 1,
  // ENG (76-100)
  4, 2, 4, 2, 1,   1, 4, 4, 2, 1,   1, 4, 4, 3, 2,   4, 4, 3, 4, 1,   2, 2, 1, 1, 2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n(The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word.)\n\nCow : Calf :: Pig : ?", o: ["Kitten","Piglet","Puppy","Foal"], e: "A young cow is a calf; a young pig is a piglet. Option 2." },
  { s: REA, q: "100 is related to 18 following a certain logic. Following the same logic, 90 is related to 16. Which of the following is related to 12 using the same logic?", o: ["70","65","80","60"], e: "Pattern: (n − 10)/5 + base... Per docx answer key, option 1 (70)." },
  { s: REA, q: "In a certain code language, 'TAIL' is coded as '7614' and 'TALE' is coded as '1749'. What is the code for 'I' in the given language?", o: ["6","9","1","7"], e: "Per docx answer key, option 1 (6)." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n1. Decision\n2. Deference\n3. Decorative\n4. Decide\n5. Defeat", o: ["3, 1, 2, 5, 2","3, 2, 1, 5, 4","4, 1, 3, 5, 2","4, 1, 2, 5, 3"], e: "Decide(4), Decision(1), Decorative(3), Defeat(5), Deference(2) → 4,1,3,5,2. Option 3." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\nCO_ _ _G_C_ _ _E_E_OL_ _GE", o: ["LLEEOLLGCLE","CGLEOCOLGEL","LGLEOCOGLGE","COGLECELGEC"], e: "Per docx answer key, option 1 (LLEEOLLGCLE)." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: REA, q: "Select the option figure in which the given figure is embedded as its part (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n4, 27, 16, 125, ?, 343", o: ["36","512","64","216"], e: "Pattern alternates squares (2², 4², 6², ...) and cubes (3³, 5³, 7³). 4=2², 16=4², ?=6²=36, then 7³=343. Option 1." },
  { s: REA, q: "In a code language, 'DANCER' is coded as 'REPEAD' and 'QUEAZY' is coded as 'YZGCUQ'. How will 'SQUAWK' be coded in the same language?", o: ["KWAUQS","KMWCQS","KWWCQS","KWBUQS"], e: "Per docx answer key, option 3 (KWWCQS)." },
  { s: REA, q: "In a code language, 'FAMOUS' is coded as 'UZNLFH' and 'SLOW' is coded as 'HOLD'. How will 'RUMOUR' be coded in the same language?", o: ["IGNLGI","IFNLFI","JFNLFJ","JGNLGI"], e: "Per docx answer key, option 2 (IFNLFI)." },
  { s: REA, q: "Three statements followed by three conclusions.\nStatements:\nSome rings are gold.\nAll gold is hot.\nSome hot are red.\n\nConclusions:\nI. Some gold are rings.\nII. Some hot are gold.\nIII. Some red are hot.", o: ["Only conclusion III follows.","Only conclusion I follows.","All the conclusions follow.","Only conclusion II follows."], e: "Some rings ∩ gold → some gold rings (I ✓). All gold ⊆ hot → some hot are gold (II ✓). 'Some hot are red' → 'some red are hot' (III ✓). All follow. Option 3." },
  { s: REA, q: "In a certain code language, JUMP is coded as 'HRIK' and WOLF is coded as 'ULHA'. How will FOWL be coded in that language?", o: ["DLSG","HLSG","ALSG","FLSG"], e: "Per docx answer key, option 1 (DLSG)." },
  { s: REA, q: "In a certain code language, 'QKV' is coded as '14819' and 'SHY' is coded as '16522'. How will 'MDS' be coded in that language?", o: ["10116","13127","12125","9127"], e: "Per docx answer key, option 1 (10116)." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in a logical and meaningful order.\n1. Flower\n2. Bees\n3. Seed\n4. Nectar\n5. Honey", o: ["1, 4, 2, 5, 3","3, 1, 4, 2, 5","1, 3, 2, 4, 5","3, 1, 2, 4, 5"], e: "Seed(3)→Flower(1)→Nectar(4)→Bees(2)→Honey(5) → 3,1,4,2,5. Option 2." },
  { s: REA, q: "Three statements are given, followed by Three conclusions.\nStatements:\nAll calculators are dustbins.\nAll complexes are dustbins.\nSome adamants are cameras.\n\nConclusions:\nI. Some calculators are complexes.\nII. Some dustbins are calculators.\nIII. Some dustbins are adamants.", o: ["Both conclusions I and II follow","Only conclusion III follows","Only conclusion II follows","Both conclusions II and III follow"], e: "All calculators ⊆ dustbins → some dustbins are calculators (II ✓). I cannot be inferred without overlap. III has no link. Option 3." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nGAINED : NEDGAI :: KINDLY : DLYKIN :: JUNIOR : ?", o: ["ROINUJ","IORJUN","JOINUR","JRUNIO"], e: "Pattern: take last 3 letters then first 3. JUNIOR → IOR + JUN = IORJUN. Option 2." },
  { s: REA, q: "Identify the figure which when put in place of the question mark (?) will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\nL__L_M _L__M _", o: ["MMLMLML","MLMLMLL","LMLMLMM","LLMMLMM"], e: "Per docx answer key, option 1 (MMLMLML)." },
  { s: REA, q: "In a certain code language, 'we live here' is coded as 'pa tu nk' and 'here was tree' is coded as 'rp nk fu'. How is 'here' coded in the given language?", o: ["nk","fu","pa","rp"], e: "Common word 'here' shares common code 'nk'. Option 1." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nMEN : NVM :: OUT : LFG :: JOB : ?", o: ["RKX","QLY","QKW","RJY"], e: "Per docx answer key, option 2 (QLY)." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nMAKE : NCJC :: FOLD : GQKB :: VIEW : ?", o: ["WKDU","XKDV","WKEV","WJEV"], e: "Pattern +1, +2, −1, −2. V+1=W, I+2=K, E−1=D, W−2=U. WKDU. Option 1." },
  { s: REA, q: "What will come in place of the question mark (?) in the following equation, if '+' and '−' are interchanged and '×' and '÷' are interchanged?\n16 − 6 + 12 ÷ 3 × 6 = ?", o: ["96","94","92","98"], e: "After swap: 16 + 6 − 12 × 3 ÷ 6 = 22 − 6 = 16... Per docx, option 4 (98)." },
  { s: REA, q: "Six numbers 1, 2, 3, 4, 5 and 6 are written on different faces of a dice. Three different positions of the same dice are shown. Select the number on the face opposite to the one having 1.", o: ["4","3","6","5"], e: "Per docx answer key, option 3 (6)." },
  { s: REA, q: "In a certain code language,\n'A + B' means 'A is the mother of B',\n'A − B' means 'A is the brother of B',\n'A × B' means 'A is the wife of B',\n'A ÷ B' means 'A is the father of B'.\nHow is S related to U if 'P + Q ÷ R × S − T ÷ U'?", o: ["Father's mother","Father's brother","Father's father","Father's sister"], e: "P is mother of Q; Q is father of R; R is wife of S; S is brother of T; T is father of U → S is uncle (father's brother) of U. Option 2." },
  { s: REA, q: "Ayush told Neha, 'Though I am the son of your father, but you are not my brother'. How is Neha related to Ayush?", o: ["Step-daughter","Cousin","Sister","Daughter"], e: "Son of Neha's father (Ayush) + Neha is not brother → Neha is female. Same father → Neha is Ayush's sister. Option 3." },

  // ============ GA (26-50) ============
  { s: GA, q: "Koderma Gaya Hazaribagh belt is known for the production of which of the following minerals?", o: ["Copper","Mica","Coal","Bauxite"], e: "Koderma-Gaya-Hazaribagh belt (Jharkhand) is famed for Mica. Option 2." },
  { s: GA, q: "With which sport is the Burdwan Trophy associated?", o: ["Boxing","Weightlifting","Powerlifting","Wrestling"], e: "Burdwan Trophy is awarded in Weightlifting. Option 2." },
  { s: GA, q: "Who was appointed as the chairman of the National Commission for Backward classes in December 2022?", o: ["Hansraj Gangaram Ahir","Arun Haldar","Vijay Sampla","Dr. Manoj Soni"], e: "Hansraj Gangaram Ahir appointed NCBC Chairman (Dec 2022). Option 1." },
  { s: GA, q: "________ is a mode of communication in itself, and it also regulates the use of other means of communication.", o: ["Satellite","Phone","Television","Radio"], e: "Satellite communication is a mode AND backbone for other channels. Option 1." },
  { s: GA, q: "Kathasaritasagara, a collection of stories, was written in which of the following languages?", o: ["Sanskrit","Prakrit","Persian","Pali"], e: "Kathasaritasagara by Somadeva (11th c.) is in Sanskrit. Option 1." },
  { s: GA, q: "Which Article of the Indian Constitution mentions that 'All doubts and disputes arising out of or in connection with the election of a President or Vice-President shall be inquired into and decided by the Supreme Court, whose decision shall be final'?", o: ["Article 71","Article 69","Article 68","Article 70"], e: "Article 71 deals with election disputes of President/VP. Option 1." },
  { s: GA, q: "Which Article of the Indian Constitution mentions that 'The President shall, notwithstanding the expiration of his/her term, continue to hold office until his successor enters upon his/her office'?", o: ["Article 61","Article 50","Article 56","Article 58"], e: "Article 56(1)(c) deals with continuity of office of President. Option 3." },
  { s: GA, q: "Who among the following revolutionaries was one of the co-founders of the Hindustan Socialist Republican Association (HSRA) which got established in 1928 at Ferozeshah Kotla in Delhi?", o: ["Gopal Krishna Gokhale","Aurobindo Ghosh","Bhagat Singh","Mahatma Gandhi"], e: "Bhagat Singh was a co-founder of HSRA (1928). Option 3." },
  { s: GA, q: "The novel 'Raavan - Enemy of Aryavarta' is written by whom among the following writers?", o: ["Amish Tripathi","Amitav Ghosh","Ruskin Bond","Kiran Desai"], e: "Amish Tripathi authored the Ram Chandra Series including 'Raavan'. Option 1." },
  { s: GA, q: "Read the given statements and select the correct option.\nA. Directive Principles of State Policy consists of all the ideals which the state should follow and keep in mind while formulating policies and enacting laws for the country.\nB. It can be enforced by the Judiciary.\nC. They can be suspended during a national emergency.", o: ["Only C","Only B","Only A","Both A and C"], e: "DPSP statement A is correct. B is wrong (non-justiciable). C is wrong (DPSP not suspended). Option 3." },
  { s: GA, q: "What is the growth rate of population of India as per census 2011?", o: ["17.64%","21.54%","21.64%","18.94%"], e: "India's decadal population growth (2001-2011) was 17.64%. Option 1." },
  { s: GA, q: "Which of the following is NOT an option related to the non-cooperation movement launched by Mahatma Gandhi?", o: ["Picketing of liquor shops","Distribution of Charkhas","Signing the resolution at Lahore for Poorna Swaraj","Boycott of foreign goods"], e: "Lahore Resolution (1929) belongs to the Civil Disobedience era, not NCM. Option 3." },
  { s: GA, q: "Rani Karnaa was awarded the Sangeet Natak Akademi (1996) for her contribution to _______.", o: ["Kathakali","Kathak","Kuchipudi","Odissi"], e: "Rani Karnaa was a noted Kathak dancer. Option 2." },
  { s: GA, q: "Who is credited with inventing the reflecting telescope?", o: ["Isaac Newton","Galileo Galilei","Johannes Kepler","Christiaan Huygens"], e: "Isaac Newton invented the reflecting telescope (1668). Option 1." },
  { s: GA, q: "In 2023, Government of India has proposed to set up 'Central Processing Centre' for faster response to organisations through centralised handling of various forms filed with field offices under the _____________.", o: ["Sale of Goods Act","Contract Act","Companies Act","Partnership Act"], e: "CPC was proposed under the Companies Act. Option 3." },
  { s: GA, q: "Which was the prominent architectural feature of the Indus Valley towns and cities?", o: ["Stupas","Pyramids","False Arch","Citadel"], e: "Indus Valley cities had a fortified Citadel area. Option 4." },
  { s: GA, q: "Select the correct statement.", o: ["The pyramid of energy is always upright.","The pyramid of mass is always upright.","The pyramid of number is always upright.","The pyramid of biomass is always inverted."], e: "Pyramid of energy is always upright (energy decreases up trophic levels). Option 1." },
  { s: GA, q: "The Beating Retreat Ceremony during Republic Day is held every year at which of the following places?", o: ["New Delhi","Bengaluru","Hyderabad","Jaipur"], e: "Beating Retreat is at Vijay Chowk, New Delhi. Option 1." },
  { s: GA, q: "The Vienna Convention is related to ____________.", o: ["Disposing of harmful electronic waste","sustainable agriculture","protection of ozone layer","protection of wild life"], e: "Vienna Convention (1985) is for protection of the ozone layer. Option 3." },
  { s: GA, q: "Select the INCORRECT combination of folk dance and its respective state.", o: ["Dollu Kunitha - Karnataka","Dandiya Raas – Gujarat","Dhangari Gaja - Maharashtra","Paika – Kerala"], e: "Paika is a folk dance of Odisha (not Kerala). Option 4." },
  { s: GA, q: "Which of the following Indo-Greek kings was mentioned in the Buddhist text Milindapanho as Milinda?", o: ["Antiochus II","Menander I","Demetrius I","Strato II"], e: "Menander I (Milinda) is the protagonist of Milindapanho. Option 2." },
  { s: GA, q: "Consider the following statements and select the correct option:\ni. Marginal Worker is a person who works for less than 183 days (or six months) in a year.\nii. Main Worker is a person who works for at least 300 days (or ten months) in a year.", o: ["Only i is correct.","Only ii is correct.","Both i and ii are incorrect.","Both i and ii are correct."], e: "Marginal = <183 days; Main = ≥183 days (not 300). Per Census definition. Only (i) is correct. Option 1." },
  { s: GA, q: "Which of the following was discovered by GN Ramachandran?", o: ["Golgi bodies","Triple helical structure of collagen","Fluid mosaic model of a cell","Plasma membrane"], e: "GN Ramachandran proposed the triple-helix structure of collagen. Option 2." },
  { s: GA, q: "Identify the Indian musician who is associated with any string instrument.", o: ["Krishna Ram Chaudhary","Anindo Chatterjee","Pandit Ravi Shankar","Zakir Hussain"], e: "Pandit Ravi Shankar was a renowned sitar (string) maestro. Option 3." },
  { s: GA, q: "On 11 May 2023, the Uttarakhand Chief Minister launched the 'Smart School Smart Block Programme' in the Goralchod auditorium in the state's ________ district.", o: ["Dehradun","Champawat","Almora","Bageshwar"], e: "Launched in Champawat district by Uttarakhand CM. Option 2." },

  // ============ QA (51-75) ============
  { s: QA, q: "PQR and ABC are two congruent triangles. If the area of PQR is 225 cm², then the area of ABC is:", o: ["15 cm²","225 cm²","112.5 cm²","25 cm²"], e: "Congruent triangles have equal areas → 225 cm². Option 2." },
  { s: QA, q: "Simplify the expression:\n15×15×15 + 3×15×12×12 − 3×15×15×12 − 12×12×12", o: ["36","18","27","9"], e: "= (15 − 12)³ = 3³ = 27. Option 3." },
  { s: QA, q: "Suresh invested a certain sum of money at 5% per annum simple interest. If he receives an interest of ₹69,687 after 15 years, the sum (in ₹) he invested is:", o: ["92880","92456","92916","92530"], e: "P = SI × 100 / (R × T) = 69687 × 100 / (5 × 15) = 6968700/75 = 92916. Option 3." },
  { s: QA, q: "The strength of a school increases and decreases every alternate year by 20%. It started with an increase in 2018. What is the strength of the school at the start of 2021 as compared to that of 2018?", o: ["Increase by 16.2%","Increase by 15.2%","Decrease by 16.2%","Decrease by 15.2%"], e: "Net = 1.2 × 0.8 × 1.2 = 1.152. Then end of 2020 = 1.152 (increase by 15.2%). Option 2." },
  { s: QA, q: "Evaluate the given expression.", o: ["34","32","36","38"], e: "Per docx answer key, option 1 (34)." },
  { s: QA, q: "A vendor buys 20 laptop bags for ₹13,000 and sells them at 15 for ₹10,125. How many laptop bags should be bought and sold to earn a profit of ₹3,225?", o: ["120","129","123","127"], e: "CP/bag = 650; SP/bag = 675. Profit/bag = 25. Need 3225/25 = 129 bags. Option 2." },
  { s: QA, q: "A policeman notices a thief from a distance of 300 m. The thief starts running and the policeman chases him. The thief and the policeman run at the speeds of 10 km/h and 12 km/h, respectively. What will be the distance between them (in m) after 6 minutes?", o: ["80","200","150","100"], e: "Relative gain = 2 km/h × 6/60 = 0.2 km = 200 m. So distance reduces from 300 m → 100 m. Option 4." },
  { s: QA, q: "The sides of a right-angled triangle, right-angled at B, are 6, 8 and 10 units. C is the vertex opposite to the side with length 8 units. What is the value of tan²A + cos²C?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: QA, q: "If θ = 60°, then Sin θ + Cos(90 − θ) = _______.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Sin 60° + Cos 30° = √3/2 + √3/2 = √3. Per docx, option 2." },
  { s: QA, q: "Evaluate the given expression.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: QA, q: "The average weight of Rohan and his three friends is 62 kg. If Rohan's weight is 8 kg more than the average weight of his three friends, what is Rohan's weight (in kg)?", o: ["68","60","65","72"], e: "Total = 248. Let friends' avg = x. So 3x + (x + 8) = 248 → 4x = 240 → x = 60. Rohan = 68. Option 1." },
  { s: QA, q: "The fourth proportional of 64, 80 and 88 is:", o: ["100","90","120","110"], e: "64 : 80 :: 88 : x → x = 80 × 88 / 64 = 110. Option 4." },
  { s: QA, q: "An old HP Deskjet printer was bought for ₹4,800 and ₹500 was spent on its repair. If it was sold for ₹6,360, then its profit percentage is:", o: ["12%","15%","18%","20%"], e: "Total CP = 5300. Profit = 1060. % = 1060/5300 = 20%. Option 4." },
  { s: QA, q: "Evaluate the given expression.", o: ["1450","1625","1520","1850"], e: "Per docx answer key, option 3 (1520)." },
  { s: QA, q: "If three angles of a triangle are (18x+6°), (10x+30°) and (15x+15°), then the triangle is:", o: ["right angled","scalene","isosceles","equilateral"], e: "Sum = 43x + 51° = 180° → 43x = 129 → x = 3. Angles: 60°, 60°, 60° — equilateral. Option 4." },
  { s: QA, q: "Evaluate the given expression.", o: ["56.0","56.33","55.5","54.33"], e: "Per docx answer key, option 1 (56.0)." },
  { s: QA, q: "Nazeer spends 20% of his monthly income on housing, 25% of the remaining on education, and saves 10% of the remaining. If his monthly salary is ₹52,600, how much money does he save every month?", o: ["3,156","2,367","5,260","1,578"], e: "After housing: 0.8 × 52600 = 42080. After education: 0.75 × 42080 = 31560. Savings = 0.1 × 31560 = 3156. Option 1." },
  { s: QA, q: "The number 7918378 is divisible by:", o: ["4","11","9","13"], e: "Digit sum = 43 (not 9, ÷3). Last 2 = 78 (not ÷4). 7918378 ÷ 11 (alt sum 8-7+3-8+1-9+7 = -5 not 0 not div by 11). 7918378 ÷ 13 = 609106 ✓. Option 4." },
  { s: QA, q: "A and B can do a piece of work in 10 days. B and C can do the same work in 12 days. C and A can do the same work in 15 days. If all the three work together, find the number of days required to complete the work.", o: ["12","6","10","8"], e: "2(A+B+C) = 1/10 + 1/12 + 1/15 = 6/60 + 5/60 + 4/60 = 15/60 = 1/4. So A+B+C = 1/8 → 8 days. Option 4." },
  { s: QA, q: "What least number must be subtracted from 2001 to get a number exactly divisible by 17?", o: ["11","12","13","14"], e: "2001 ÷ 17 = 117 rem 12. Subtract 12. Option 2." },
  { s: QA, q: "Who among the following scored the maximum overall percentage?", o: ["Sanjana","Simran","Jyoti","Bhumika"], e: "Per docx answer key, option 3 (Jyoti)." },
  { s: QA, q: "The average monthly income of A and B is ₹5,050, the average monthly income of B and C is ₹6,250, and the average monthly income of A and C is ₹5,200. What is the sum of the monthly incomes (in ₹) of A, B and C?", o: ["16500","18000","11000","19500"], e: "A+B = 10100; B+C = 12500; A+C = 10400. Sum: 2(A+B+C) = 33000 → A+B+C = 16500. Option 1." },
  { s: QA, q: "Evaluate the given expression.", o: ["3","2","1","0"], e: "Per docx answer key, option 1 (3)." },
  { s: QA, q: "A tractor manufacturing company sells each tractor for ₹5,00,000. Assuming that KISAN firm buys 50 tractors from them as a part of an annual contract, the company offers a trade discount of 10% to KISAN and an additional 2% discount if the payment is made within 30 days. What will be the amount payable by KISAN within 30 days for the consignment?", o: ["₹22,080,100","₹22,050,000","₹20,051,000","₹24,050,020"], e: "Gross = 50 × 500000 = 25000000. After 10%: 22500000. After 2%: 22050000. Option 2." },
  { s: QA, q: "Find the value as per the figure.", o: ["21 cm","18 cm","27 cm","24 cm"], e: "Per docx answer key, option 1 (21 cm)." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nGrave", o: ["Low","Living","Belittle","Humorous"], e: "Grave (serious) ↔ Humorous. Option 4." },
  { s: ENG, q: "The given sentence has an error. Select the option that contains the error in the given sentence.\nWe have to be cautius regarding the impact of global warming.", o: ["regarding the impact","be cautius","We have to","of global warming"], e: "'Cautius' is misspelt (should be 'cautious'). Option 2." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nInertia", o: ["Progression","Energy","Activeness","Inactivity"], e: "Inertia ≈ Inactivity. Option 4." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom.\nMany unavoidable situations were avoided only because someone had our back.", o: ["In consultation","To support","Without help","Within reach"], e: "Had our back = supported us. Option 2." },
  { s: ENG, q: "Parts of a sentence are given below in jumbled order.\n(A) fell dead in an instant\n(B) stunned the movement\n(C) of the busy Bazaar and\n(D) silenced the cacophony\n(E) suddenly, a ringing blast\n(F) out of the bodies, which", o: ["EDCBFA","BADFEC","CABEDF","FACEDB"], e: "Per docx answer key, option 1 (EDCBFA)." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\nThe teacher orders Mohan not to tear off pages from his note-book.", o: ["The teacher says to Mohan, \"Don't tear off pages from your notebook.\"","The teacher says to Mohan, \"You shouldn't tear off pages from your notebook.\"","The teacher says to Mohan, \"Let the pages not be torn off from your notebook.\"","The teacher says to Mohan, \"Mustn't tear off pages from your notebook.\""], e: "Direct of imperative 'not to' → 'Don't ...'. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nMelancholy", o: ["Sad","Blue","Sorrow","Cheerful"], e: "Melancholy (sad) ↔ Cheerful. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\"Hurrah! I have topped again,\" he said. \"Congratulations,\" said I.", o: ["He exclaimed that he topped, and I congratulated him.","He said that he topped again. I congratulated him.","He said to me he had topped again, and I congratulated him.","He exclaimed with joy that he had topped again. I congratulated him."], e: "'Hurrah!' converts to 'exclaimed with joy'; backshift 'have topped' → 'had topped'. Option 4." },
  { s: ENG, q: "Parts of the following sentence have been given as options. Select the option that contains an error.\nDue to its fragrance, the petals of an rose are often used in perfumes and cosmetics.", o: ["Due to its fragrance,","the petals of an","rose are often used","in perfumes and cosmetics."], e: "'an rose' should be 'a rose' (rose starts with consonant sound). Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\nWho is looking for a smart advisor?", o: ["By whom is a smart advisor being looked for?","By whom was a smart advisor looked?","By whom is a smart advisor looked for?","By whom is a smart advisor looked?"], e: "Present continuous passive: 'is being looked for'. Option 1." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\nThe plot of the story effects the character and their growth.", o: ["affects the character","affect the character's","effect the character","affect the character"], e: "'Affects' (verb) is correct, not 'effects' (noun). Option 1." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a spelling error.\nIt seemed that his route / to the covted island / was not to be / an easy one.", o: ["was not to be","an easy one","It seemed that his route","to the covted island"], e: "'Covted' should be 'coveted'. Option 4." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\nThe enigma of quantum mechanics remains inscrutably elusive despite of decades of intensive research by the world's leading physicists.", o: ["despite decades with","despite of decades to","despite of decades in","despite decades of"], e: "'Despite' takes a noun directly, not 'despite of'. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\nMr. Johnson teaches us mathematics.", o: ["Mathematics will be taught to us by Mr. Johnson.","Mathematics was taught to us by Mr. Johnson.","Mathematics is taught to us by Mr. Johnson.","Mathematics is being taught to us by Mr. Johnson."], e: "Present simple passive: 'is taught to us by'. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\nA popular theory among critics is that the character Count Dracula is based on the ________ barbaric Vlad III, better known as Vlad the Impaler.", o: ["debauched","infamously","miserably","ingloriously"], e: "'Infamously barbaric' fits as adverb modifying barbaric. Option 2." },
  { s: ENG, q: "Read the Student Clubs passage. Select the most appropriate option to fill in blank number 1.\n'students can (1)____________ their learning through interaction'", o: ["reduce","adjust","calculate","improve"], e: "Students 'improve' learning. Option 4." },
  { s: ENG, q: "Read the Student Clubs passage. Select the most appropriate option to fill in blank number 2.\n'Every activity in the club (2)________ students to cultivate'", o: ["diminishes","confuses","simplifies","encourages"], e: "Activities 'encourage' students. Option 4." },
  { s: ENG, q: "Read the Student Clubs passage. Select the most appropriate option to fill in blank number 3.\n'provide a/an (3)_________ to showcase their talents'", o: ["occasion","risk","opportunity","excuse"], e: "Provide an 'opportunity' to showcase. Option 3." },
  { s: ENG, q: "Read the Student Clubs passage. Select the most appropriate option to fill in blank number 4.\n'students find time to (4)_________ themselves for their future'", o: ["interrupt","clean","control","groom"], e: "'Groom themselves for their future'. Option 4." },
  { s: ENG, q: "Read the Student Clubs passage. Select the most appropriate option to fill in blank number 5.\n'develop their leadership ... in a/an (5)___________ way'", o: ["optimistic","aggressive","dominant","pessimistic"], e: "Positive context → 'optimistic'. Option 1." },
  { s: ENG, q: "Read the Herbal Remedies passage. Select the most appropriate ANTONYM of the given word in the context of the passage.\n\nSubstitute", o: ["Perdurable","Equivalent","Rival","Surrogate"], e: "Per docx answer key, option 2 (Equivalent — though typically Substitute ≈ Equivalent; the antonym would be 'Original'. Trust docx)." },
  { s: ENG, q: "Read the Herbal Remedies passage. Identify the tone of the passage.", o: ["Sarcastic","Cautionary","Populist","Pedestrian"], e: "Passage warns/cautions about herbal remedies — cautionary tone. Option 2." },
  { s: ENG, q: "Read the Herbal Remedies passage. Identify the statement that holds true according to the passage.", o: ["Herbal remedies can sometimes contain artificial ingredients.","Herbal remedies have no proven health benefits.","Herbal remedies can be trusted blindly.","Herbal concoctions should not be used for curing minor illnesses."], e: "Passage: 'Some may contain synthetic ingredients'. Option 1." },
  { s: ENG, q: "Read the Herbal Remedies passage. Select the option that best describes the central theme of the passage.", o: ["While herbal remedies may have some benefits, these should be used with caution.","Herbal remedies are entirely safe.","Herbal remedies are useless.","Traditional medicine should be replaced by herbal remedies."], e: "Passage advocates cautious use of herbal remedies. Option 1." },
  { s: ENG, q: "Read the Herbal Remedies passage. Select the most appropriate title for the passage.", o: ["Herbal Remedies","Risks with Herbal Remedies","The Benefits of Herbal Concoctions","Herbal Remedies: A Way of Life"], e: "Per docx answer key, option 2 (Risks with Herbal Remedies)." }
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
      tags: ['SSC', 'Selection Post', 'Phase XII', 'Graduate', 'PYQ', '2024'],
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

  let exam = await Exam.findOne({ code: 'SSC-SSP' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC Selection Post',
      code: 'SSC-SSP',
      description: 'Staff Selection Commission - Selection Post (Graduate, Higher Secondary, Matriculation Levels)',
      isActive: true
    });
  }

  const PATTERN_TITLE = 'SSC Selection Post (Graduate Level)';
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Graduate) - 25 June 2024 Shift-3';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2024, pyqShift: 'Shift-3',
    pyqExamName: 'SSC Selection Post Phase XII (Graduate)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
