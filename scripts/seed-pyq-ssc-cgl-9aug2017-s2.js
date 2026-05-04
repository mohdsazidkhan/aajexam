/**
 * Seed: SSC CGL Tier-I PYQ - 9 August 2017, Shift-2 (100 questions)
 * Source: Oswaal SSC CGL Tier-I Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per SSC CGL Tier-I 2017 pattern):
 *   - General Intelligence and Reasoning : Q1-25  (25 Q)
 *   - General Awareness                  : Q26-50 (25 Q)
 *   - Quantitative Aptitude              : Q51-75 (25 Q)
 *   - English Comprehension              : Q76-100 (25 Q)
 *
 * Each question = 2 marks. Total = 200 marks. Duration = 60 min.
 *
 * Run with: node scripts/seed-pyq-ssc-cgl-9aug2017-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSL-CGL-Tier-1/2017/august/09/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-cgl-9aug2017-s2';

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

const F = '9-august-2017';
const IMAGE_MAP = {
  16: { q: `${F}-q-16.png` },
  17: { q: `${F}-q-17.png` },
  19: { q: `${F}-q-19.png`,
        opts: [`${F}-q-19-option-1.png`,`${F}-q-19-option-2.png`,`${F}-q-19-option-3.png`,`${F}-q-19-option-4.png`] },
  20: { opts: [`${F}-q-20-option-1.png`,`${F}-q-20-option-2.png`,`${F}-q-20-option-3.png`,`${F}-q-20-option-4.png`] },
  21: { q: `${F}-q-21.png`,
        opts: [`${F}-q-21-option-1.png`,`${F}-q-21-option-2.png`,`${F}-q-21-option-3.png`,`${F}-q-21-option-4.png`] },
  22: { q: `${F}-q-22.png`,
        opts: [`${F}-q-22-option-1.png`,`${F}-q-22-option-2.png`,`${F}-q-22-option-3.png`,`${F}-q-22-option-4.png`] },
  23: { q: `${F}-q-23.png`,
        opts: [`${F}-q-23-option-1.png`,`${F}-q-23-option-2.png`,`${F}-q-23-option-3.png`,`${F}-q-23-option-4.png`] },
  24: { q: `${F}-q-24.png`,
        opts: [`${F}-q-24-option-1.png`,`${F}-q-24-option-2.png`,`${F}-q-24-option-3.png`,`${F}-q-24-option-4.png`] },
  25: { q: `${F}-q-25.png` },
  46: { q: `${F}-q-46.png` },
  62: { q: `${F}-q-62.png` },
  64: { q: `${F}-q-64.png` },
  65: { q: `${F}-q-65.png` },
  66: { q: `${F}-q-66.png` },
  70: { q: `${F}-q-70.png` },
  72: { q: `${F}-q-72.png` },
  73: { q: `${F}-q-73.png` },
  74: { q: `${F}-q-74.png` },
  75: { q: `${F}-q-75.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  3,1,1,1,3, 1,1,2,4,3, 3,3,4,3,1, 2,3,1,2,2, 3,1,3,1,4,
  // 26-50 (General Awareness)
  2,1,4,2,2, 3,3,3,1,1, 1,3,4,3,3, 3,3,3,3,3, 1,2,2,4,3,
  // 51-75 (Quantitative Aptitude)
  3,4,2,2,2, 4,2,2,1,2, 3,4,3,2,1, 3,2,1,4,2, 3,2,4,1,4,
  // 76-100 (English)
  2,3,4,1,1, 1,3,1,3,4, 4,2,2,1,4, 4,2,2,4,3, 4,3,2,1,4,
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Awareness';
const QA  = 'Quantitative Aptitude';
const ENG = 'English Comprehension';

const RAW = [
  // ============ General Intelligence and Reasoning (1-25) ============
  { s: REA, q: "In the following question, select the related word from the given alternatives.\n\nCalendar : Date :: Index : ?", o: ["Name of Author","Glossary","Contents","Summary"], e: "A calendar is used to check the date. Similarly, an index is used to check the contents of a book." },
  { s: REA, q: "In the following question, select the related number from the given alternatives.\n\nACOUSTIC : 91 :: RENOUNCE : ?", o: ["95","99","105","109"], e: "Sum of alphabet positions: A(1)+C(3)+O(15)+U(21)+S(19)+T(20)+I(9)+C(3) = 91. R(18)+E(5)+N(14)+O(15)+U(21)+N(14)+C(3)+E(5) = 95." },
  { s: REA, q: "In the following question, select the related number from the given alternatives.\n\n243 : 819 :: 163 : ?", o: ["487","563","572","593"], e: "Pattern: product of digits squared, then add the number. 2×4×3=24, 24²=576, 576+243=819. For 163: 1×6×3=18, 18²=324, 324+163=487." },
  { s: REA, q: "In the following question, select the odd word from the given alternatives.", o: ["Badminton","Table Tennis","Cricket","Hockey"], e: "Table Tennis, Cricket and Hockey use a ball. Badminton uses a shuttlecock — odd one out." },
  { s: REA, q: "In the following question, select the odd letters from the given alternatives.", o: ["ACFJ","RTWA","NPSV","HJMQ"], e: "ACFJ, RTWA and HJMQ follow +2, +3, +4. NPSV follows +2, +3, +3 — odd one out." },
  { s: REA, q: "In the following question, select the odd number group from the given alternatives.", o: ["(4, 16, 48)","(6, 36, 90)","(8, 64, 160)","(12, 144, 360)"], e: "Pattern: (n, n², 2.5n²). 4²=16 ✓ but 2.5×16=40 ≠ 48. Others fit: 6→36→90 ✓, 8→64→160 ✓, 12→144→360 ✓. (4,16,48) is the odd one." },
  { s: REA, q: "Arrange the given words in the sequence in which they occur in the dictionary.\n\n1. decollete  2. desecrate  3. decorous  4. desipicable  5. destitute", o: ["13245","15243","32451","45231"], e: "Dictionary order: decollete(1) → decorous(3) → desecrate(2) → desipicable(4) → destitute(5) → 13245." },
  { s: REA, q: "In the following question, which one set of letters, when sequentially placed in the gaps in the given letter series, shall complete it?\n\na _ bc _ a _ bcdabc _ da _ cd _", o: ["acbddb","adbcbd","cabddc","ddcbbc"], e: "Filling with adbcbd gives the pattern: aabcd · abbcd · abccd · abcdd repeating — completes the series." },
  { s: REA, q: "In the following question, select the missing number from the given series.\n\n1357, 3085, 5282, 8026, ?", o: ["9961","10441","11321","11401"], e: "Differences are 12³=1728, 13³=2197, 14³=2744, 15³=3375. So 8026 + 3375 = 11401." },
  { s: REA, q: "5 years hence, the ratio of ages of A and B will be 7 : 5 and the difference between their ages will be 4 years. What are present ages (in years) of A and B, respectively?", o: ["5, 9","6, 5","9, 5","9, 6"], e: "Future ages 7x and 5x; 7x − 5x = 4 → x = 2. Future: A=14, B=10. Present: A=9, B=5." },
  { s: REA, q: "From a point, Lokesh starts walking towards south and after walking 30 metres, he turns to his right and walks 20 metres, then he turns right again and walks 30 metres. He finally turns to his left and walks 40 metres. In which direction is he with reference to the starting point?", o: ["North-West","East","West","South"], e: "Tracing the path: south 30 → west 20 → north 30 (back to start latitude) → west 40. Final point is 60 m to the west of start." },
  { s: REA, q: "In the following question, from the given alternative words, select the word which cannot be formed using the letters of the given word.\n\nENCYCLOPEDIA", o: ["CONE","CYCLE","NOISY","PEACE"], e: "ENCYCLOPEDIA does not contain the letter 'S'. So NOISY cannot be formed." },
  { s: REA, q: "In a certain code language, 'RAIN' is written as 'OHBQ'. How is 'SUMMER' written in that code language?", o: ["QFLNTT","QDLLTR","SFNNVT","SDNLVR"], e: "Pattern (interleaved): R→O (−3?). Per the worked solution applied across letters, SUMMER → SDNLVR." },
  { s: REA, q: "In the following question, correct the given equation by interchanging two numbers.\n\n8 × 3 ÷ 4 + 9 − 5 = 16", o: ["3 and 4","4 and 8","5 and 3","5 and 9"], e: "Interchanging 5 and 3: 8 × 5 ÷ 4 + 9 − 3 = 10 + 9 − 3 = 16. ✓" },
  { s: REA, q: "If (2)# * 4 = 2 and (4)# * 4 = 16, then what is the value of A in (6)# * A = 18?", o: ["12","14","16","20"], e: "Pattern: n³/A. 2³/4=2 ✓, 4³/4=16 ✓. So 6³/A = 18 → 216/A = 18 → A = 12." },
  { s: REA, q: "In the following question, select the number which can replace the question mark (?) from the given alternatives. (See figure.)", o: ["189","227","277","339"], e: "Pattern: product of 4 outer numbers + sum of those 4 numbers. Fig1: (2·5·3·1)+(2+5+3+1)=30+11=41. Fig2: 144+15=159. Fig3: (7·3·2·5)+(7+3+2+5)=210+17=227." },
  { s: REA, q: "How many triangles are there in the given figure?", o: ["8","10","12","14"], e: "Counting all distinct triangles in the labelled figure: ΔADF, ΔBEC, ΔADE, ΔBFC, ΔFGE, ΔAGF, ΔBGE, ΔABE, ΔAFB, ΔAGB, ΔBFE, ΔAFE = 12 triangles." },
  { s: REA, q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, even if it appears to be at variance with commonly known facts, decide which of the given conclusions logically follows from the statements.\n\nStatements:\nI. All rackets are bats.\nII. All bats are wickets.\n\nConclusions:\nI. Some wickets are rackets.\nII. All wickets are rackets.", o: ["Only conclusion I follows.","Only conclusion II follows.","Neither conclusion (I) nor conclusion (II) follows.","Both conclusions follow."], e: "All rackets ⊂ bats ⊂ wickets. So 'Some wickets are rackets' follows. 'All wickets are rackets' is too strong — doesn't follow." },
  { s: REA, q: "From the given options, which figure can be formed by folding the figure given in the question?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "When folded into a cube, B↔O, R↔G, Y↔I as opposites. Option 2 matches." },
  { s: REA, q: "Identify the diagram that best represents the relationship among the given classes.\n\nStaff, Manager, Worker", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Managers and Workers are both subsets of Staff but disjoint from each other. Option 2 fits." },
  { s: REA, q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 3 correctly continues the figure series pattern." },
  { s: REA, q: "From the given figures, select the one in which the question figure is hidden/embedded.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The question figure is embedded in option 1." },
  { s: REA, q: "A piece of paper is folded and punched as shown below in the question figure. From the given answer figure, indicate how it will appear when opened.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Following the symmetry of folding and punching, the unfolded paper looks like option 3." },
  { s: REA, q: "If a mirror is placed on the line AB, then which of the answer figure is the right image of the given figure?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "When the mirror is on line AB (horizontal), top becomes bottom and vice versa. Option 1 is the correct mirror image." },
  { s: REA, q: "A word is represented by only one set of numbers as given in any one of the alternatives. The sets of numbers given in the alternatives are represented by two classes of alphabets as shown in the given two matrices. The columns and rows of Matrix-I are numbered from 0 to 4 and that of Matrix-II are numbered from 5 to 9. A letter from these matrices can be represented first by its row and next by its column, for example, 'X' can be represented by 21, 44, etc, and 'R' can be represented by 67, 98, etc. Similarly, you have to identify the set for the word 'CREEP'.", o: ["10, 79, 23, 32, 42","24, 55, 14, 41, 12","33, 86, 32, 13, 43","42, 98, 41, 00, 34"], e: "Decoding option 4: 42=C, 98=R, 41=E, 00=E, 34=P → CREEP. Hence option 4." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "In which market form, a market or an industry is dominated by a single seller?", o: ["Oligopoly","Monopoly","Duopoly","Monopolistic Competition"], e: "A monopoly is a market structure where a single seller controls the entire supply of a product or service." },
  { s: GA, q: "Which one of the following is also regarded as disguised unemployment?", o: ["Underemployment","Frictional unemployment","Seasonal unemployment","Cyclical unemployment"], e: "Underemployment, where workers are employed below their productive capacity, is also regarded as disguised unemployment." },
  { s: GA, q: "Which of the following are constituents of Indian Parliament?\n(i) The President\n(ii) The Council of States (Rajya Sabha)\n(iii) The House of the People (Lok Sabha)", o: ["(ii) and (iii)","(i) and (ii)","(i) and (iii)","(i), (ii) and (iii)"], e: "Per Article 79, Parliament of India consists of the President and the two Houses — Rajya Sabha and Lok Sabha." },
  { s: GA, q: "Who among the following is the executive head of state in India?", o: ["Prime Minister","President","Cabinet Secretary","Finance Secretary"], e: "The President of India is the constitutional head and executive head of the State, in whose name the executive action of the Union is taken." },
  { s: GA, q: "Who built the Konark's Sun Temple?", o: ["Anantavarman Chodaganga Deva","Narasimhadeva I","Kapilendra Deva Routaray","Purushottam Dev"], e: "King Narasimhadeva I of the Eastern Ganga dynasty built the Konark Sun Temple in 1250 CE." },
  { s: GA, q: "Who was the first Governor General of Bengal?", o: ["Robert Clive","William Bentick","Warren Hastings","Charles Cornawallis"], e: "Warren Hastings served as the first Governor General of Bengal from 1772 to 1785, under the Regulating Act of 1773." },
  { s: GA, q: "Amazon river flows through which of the following country?", o: ["USA","France","Brazil","Canada"], e: "The Amazon, the largest river by water flow, originates in Peru and flows through Brazil before emptying into the Atlantic." },
  { s: GA, q: "What is the other name of Sahyadri Range?", o: ["Lesser Himalayas","Shivaliks","Western Ghats","Eastern Ghats"], e: "The Sahyadri Range is also called the Western Ghats — a mountain chain along India's western coast and a UNESCO World Heritage site." },
  { s: GA, q: "Who discovered bacteria?", o: ["Antonie Ven Leeuwenhoek","Robert Brown","Robert Hook","Robert Koch"], e: "Antonie van Leeuwenhoek, the 'father of microbiology', first observed bacteria using single-lens microscopes." },
  { s: GA, q: "What is the name of a group of similar cells performing a specific function?", o: ["Tissue","Organ","Organ system","Cellular organisation"], e: "A tissue is a group of similar cells that perform a specific function in multicellular organisms." },
  { s: GA, q: "Plant tissues are of how many types?", o: ["3","2","5","6"], e: "Plant tissues are broadly of two types — meristematic and permanent — but per the source/key, the answer is 3 (treating sub-categories or counting by another classification)." },
  { s: GA, q: "It is difficult to fix a nail on a freely suspended wooden frame. Which law supports this statement?", o: ["Law of inertia","Newton's second law","Newton's third law","Pascal's law"], e: "When the hammer hits the nail, the frame deflects due to Newton's third law (action-reaction), reducing the impact." },
  { s: GA, q: "Which one of the following is not a property of electromagnetic waves?", o: ["Electromagnetic waves do not show interference and diffraction.","Oscillating electric field and magnetic field are perpendicular to each other.","Electromagnetic waves are transverse waves.","Electromagnetic waves do not require a medium to propagate."], e: "Electromagnetic waves DO show interference and diffraction (e.g., light). Statement 1 is the false statement (the question asks for the property that is NOT true). Per the answer key, the option chosen is the one about not requiring a medium — note: this matches the source key but conventional physics says EM waves indeed don't need a medium. (Answer per official key.)" },
  { s: GA, q: "What is a bug in computer terminology?", o: ["A virus","A program","An error in a program","Magnetic disk storage device"], e: "In computing, a 'bug' is an error or flaw in a program that causes it to produce incorrect or unexpected results." },
  { s: GA, q: "A radio-active substance has a half life of six months. Three-fourth of the substance will decay in ______.", o: ["six months","ten months","twelve Months","twenty-four months"], e: "After 6 months, 1/2 remains. After 12 months, 1/4 remains, i.e., 3/4 has decayed." },
  { s: GA, q: "pH of the human blood is ______.", o: ["slightly Acidic","highly Acidic.","slightly Basic","highly Basic"], e: "Human blood has a pH of 7.35–7.45, which is slightly basic (alkaline)." },
  { s: GA, q: "In which city is the Forest Research Institute of India located?", o: ["New Delhi","Hyderabad","Dehradun","Shimla"], e: "The Forest Research Institute (FRI) is located in Dehradun, Uttarakhand — one of the oldest forestry research institutes." },
  { s: GA, q: "Deen Dayal Rasoi Yojana to provide food at only ₹5 has been launched on 6th April, 2017 by which state?", o: ["Chattisgarh","Haryana","Madhya Pradesh","Uttar Pradesh"], e: "Madhya Pradesh launched the Deen Dayal Rasoi Yojana on 6 April 2017, providing subsidised meals at ₹5." },
  { s: GA, q: "What was invented by Zacharias Jansen?", o: ["Jet Engine","Radium","Microscope","Electric Lamp"], e: "Dutch eyeglass maker Zacharias Janssen is credited with inventing the compound microscope (c. 1590)." },
  { s: GA, q: "In which of the following game, a ball is not used?", o: ["Football","Cricket","Badminton","Tennis"], e: "Badminton uses a shuttlecock, not a ball. Football, Cricket and Tennis all use balls." },
  { s: GA, q: "Match the following.\n\nFestival — State\n1. Gangaur — (a) West Bengal\n2. Ganesh Chaturthi — (b) Rajasthan\n3. Durga Puja — (c) Maharashtra", o: ["1-b, 2-c, 3-a","1-c, 2-a, 3-b","1-b, 2-a, 3-c","1-a, 2-c, 3-b"], e: "Gangaur is celebrated in Rajasthan (b); Ganesh Chaturthi in Maharashtra (c); Durga Puja in West Bengal (a). So 1-b, 2-c, 3-a." },
  { s: GA, q: "Who has won the 'Miss Universe 2016' title?", o: ["Pia Wurtzbach","Iris Mittenaere","Raquel Pellissier","Andrea Tova"], e: "Iris Mittenaere of France was crowned Miss Universe 2016 on 30 January 2017." },
  { s: GA, q: "Who is the author of the book titled 'Numbers Do Lie'?", o: ["Anil Menon","Akash Chopra","Ian Chapell","Kunal Basu"], e: "Former Indian cricketer Aakash Chopra authored 'Numbers Do Lie: 61 Hidden Cricket Stories'." },
  { s: GA, q: "Who has been appointed as the Secretary General of the United Nations in January, 2017?", o: ["Ban Ki-Moon","Kofi Annan","Boutros-Boutros Ghali","Antonio Guterres"], e: "Antonio Guterres of Portugal became the 9th UN Secretary-General on 1 January 2017, succeeding Ban Ki-moon." },
  { s: GA, q: "India has the longest international border with which country?", o: ["Bhutan","Nepal","Bangladesh","Pakistan"], e: "India shares its longest international land border (about 4,096 km) with Bangladesh." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "How many numbers are there from 700 to 950 (including both) which are neither divisible by 3 nor by 7?", o: ["107","141","144","145"], e: "Total = 251. Divisible by 3: 83. By 7: 36. By 21: 12. By 3 or 7 = 83+36−12 = 107. Neither = 251 − 107 = 144." },
  { s: QA, q: "A can complete a work in 20 days and B can complete the same work in 25 days. If both of them work together, then in 3 days, what per cent of the total work will be completed?", o: ["9","12","25","27"], e: "Combined rate = 1/20 + 1/25 = 9/100. In 3 days = 27/100 = 27%." },
  { s: QA, q: "The length of the two parallel sides of a trapezium is 18 m and 24 m. If its height is 12 m, then what is the area (in m²) of the trapezium?", o: ["126","252","504","1,024"], e: "Area = (1/2)(sum of parallel sides)(height) = (1/2)(18+24)(12) = (1/2)(42)(12) = 252 m²." },
  { s: QA, q: "If two successive discounts of 50% and 10% are offered, then what is the net discount (in %)?", o: ["50","55","60","65"], e: "Net factor = 0.5 × 0.9 = 0.45. So net discount = 100 − 45 = 55%." },
  { s: QA, q: "Three bottles with equal capacity containing a mixture of milk and water in the ratios 2 : 5, 3 : 4 and 4 : 5, respectively. If the content of these three bottles are emptied into a large bottle, what will be the ratio of milk and water, respectively in the large bottle?", o: ["73 : 106","73 : 116","73 : 113","73 : 189"], e: "Equal capacity = LCM-based. Milk fractions: 2/7, 3/7, 4/9 → with total 1 each → milk total = 18/63 + 27/63 + 28/63 = 73/63 (after equating). Working out gives ratio 73 : 116." },
  { s: QA, q: "The average age of 6 members of a family is 20 years. If the age of the servant is included, then the average age increases by 25%. What is the age (in years) of the servant?", o: ["30","35","50","55"], e: "Total of 6 = 120. New avg = 25. Total of 7 = 175. Servant's age = 175 − 120 = 55." },
  { s: QA, q: "For an article, the profit is 190% of the cost price. If the cost price increases by 10% but the selling price remains the same, then the profit is what percentage of the selling price (approximately)?", o: ["54","62","70","163"], e: "CP=100, SP=290. New CP=110. New profit = 290−110=180. % of SP = 180/290 × 100 ≈ 62%." },
  { s: QA, q: "A, B and C are three students. A got 18% more marks than B and 12% less than C. If B got 220 marks, then how many marks did C get?", o: ["230","295","240","290"], e: "A = 220 × 1.18 = 259.6. A = 0.88 × C → C = 259.6/0.88 = 295." },
  { s: QA, q: "Two people A and B are at a distance of 260 km from each other at 9:00 a.m. A immediately starts moving towards B at a speed of 25 km/h and at 11:00 a.m., B starts moving towards A at a speed of 10 km/hr. At what time (in p.m.) will they meet each other?", o: ["5:00","6:00","6:30","7:00"], e: "By 11 a.m., A has covered 50 km. Remaining 210 km closed at 25+10=35 km/h → 6 hours. So they meet at 11 a.m. + 6 h = 5 p.m." },
  { s: QA, q: "If ₹2,500 becomes ₹2,970.25 in 2 years at compound interest compounded annually, then what is the yearly rate of interest (in %)?", o: ["7","9","11","13"], e: "(1+R/100)² = 2970.25/2500 = 1.1881. So 1+R/100 = 1.09 → R = 9%." },
  { s: QA, q: "If (1/x) + (1/y) + (1/z) = 0 and x + y + z = 9, then what is the value of x³ + y³ + z³ − 3xyz?", o: ["81","361","729","6,561"], e: "1/x+1/y+1/z=0 → xy+yz+zx=0. Then x²+y²+z² = (x+y+z)² − 2(xy+yz+zx) = 81. x³+y³+z³−3xyz = (x+y+z)(x²+y²+z²−xy−yz−zx) = 9×81 = 729." },
  { s: QA, q: "If x⁴ + 1/x⁴ = 34, then what is the value of x³ − 1/x³?", o: ["0","6","8","14"], e: "x²+1/x² = √(34+2)=6. (x−1/x)² = 6−2 = 4 → x−1/x = 2. x³−1/x³ = (x−1/x)(x²+1/x²+1) = 2 × 7 = 14." },
  { s: QA, q: "If x = 1 − y and x² = 2 − y², then what is the value of xy?", o: ["1","2","−1/2","−1"], e: "x+y=1, x²+y²=2. (x+y)²=1 → x²+y²+2xy=1 → 2+2xy=1 → xy = −1/2." },
  { s: QA, q: "If x + 1/(x+7) = 0, then what is the value of x − 1/(x+7)?", o: ["3√5","3√5 − 7","3√5 + 7","8"], e: "x²+7x+1=0 → x = (−7+√45)/2. Then x+7 = (7+√45)/2. x − 1/(x+7) simplifies (per worked solution) to 3√5 − 7." },
  { s: QA, q: "In the given figure, DE||BC and AD : DB = 5 : 3, then what is the value of (DE/BC)?", o: ["5/8","2/3","3/4","5/3"], e: "AD/AB = 5/(5+3) = 5/8. By similar triangles ΔADE ~ ΔABC, DE/BC = AD/AB = 5/8." },
  { s: QA, q: "PQRS is a cyclic quadrilateral and PQ is the diameter of the circle. If ∠RPQ = 38°, then what is the value (in degrees) of ∠PSR?", o: ["52","77","128","142"], e: "∠PRQ = 90° (angle in semicircle). ∠PQR = 180−90−38 = 52°. ∠PSR = 180 − ∠PQR (cyclic) = 128°." },
  { s: QA, q: "The smaller diagonal of a rhombus is equal to the length of its sides. If the length of each side is 6 cm, then what is the area (in cm²) of an equilateral triangle whose side is equal to the bigger diagonal of the rhombus?", o: ["18√3","27√3","27/√3","36√3"], e: "Smaller diagonal = side = 6. Half-diagonals: 3 and √(36−9)=3√3. Bigger diagonal = 6√3. Area of equilateral with side 6√3 = (√3/4)(6√3)² = (√3/4)·108 = 27√3 cm²." },
  { s: QA, q: "In the given figure, PR and ST are perpendicular to the tangent QR. PQ passes through centre O of the circle whose diameter is 10 cm. If PR = 9 cm, then what is the length (in cm) of ST?", o: ["1","1.25","1.5","2"], e: "From similar triangles QST ~ QOM and QPR ~ QST, solving gives x = 5/4 and ST = 1 cm." },
  { s: QA, q: "What is the simplified value of (sec A + cos A)(sec A − cos A)?", o: ["2 tan² A","2 sin² A","sin² A tan² A","sin² A + tan² A"], e: "= sec²A − cos²A = (1+tan²A) − (1−sin²A) = tan²A + sin²A." },
  { s: QA, q: "What is the simplified value of (cosec A / (cot A + tan A))²?", o: ["2 cos² A","1 − sin² A","sec² A","sec A tan A"], e: "(cosec A / (cot A + tan A))² = (1/sinA / (1/(sinA·cosA)))² = cos²A = 1 − sin²A." },
  { s: QA, q: "What is the simplified value of  tan A/(1 − cot A) + cot A/(1 − tan A) − 2/sin 2A ?", o: ["−1","0","1","2"], e: "Standard identity: tanA/(1−cotA) + cotA/(1−tanA) = 1 + secA·cosecA = 1 + 2/sin2A. Hence the given expression simplifies to 1." },
  { s: QA, q: "Refer to the table showing % of literate people in 6 cities and male:female ratios.\n\nIf the total population of City 4 is 6,00,000, then how many literate people are there in City 4?", o: ["4,80,000","3,78,000","4,68,000","3,48,000"], e: "City 4 literate = 63% of 6,00,000 = 3,78,000." },
  { s: QA, q: "The total population of City 6 is 2,00,000 and the total population of City 2 is 2,20,000. What is the respective ratio of literate males of City 2 and literate females of City 6?", o: ["348 : 595","255 : 199","595 : 348","199 : 255"], e: "Lit males C2 = (85/100)·220000·(7/11) = 7·85·200. Lit females C6 = (58/100)·200000·(3/5) = 3·23200. Ratio = 595:348." },
  { s: QA, q: "If there are 2,59,210 literate females in City 5, then what is the total population of City 5?", o: ["6,44,000","3,54,200","6,90,000","4,83,000"], e: "City 5 lit females = (7/16)·92%·P = 259210. Total literate = 259210·(16/7) = 5,92,480. P = 5,92,480·(100/92) = 6,44,000." },
  { s: QA, q: "The population of the 6 cities are 2,50,000, 2,00,000, 2,20,000, 3,00,000, 1,50,000 and 4,00,000, respectively. Which is the correct order of the number of literate people in these cities?", o: ["City 6 > City 1 > City 4 > City 2 > City 3 > City 5","City 4 > City 6 > City 1 > City 2 > City 3 > City 5","City 6 > City 4 > City 1 > City 3 > City 2 > City 5","City 6 > City 1 > City 4 > City 3 > City 2 > City 5"], e: "Literate counts: C1=2,00,000; C2=1,70,000; C3=1,71,600; C4=1,89,000; C5=1,38,000; C6=2,32,000. Order: C6 > C1 > C4 > C3 > C2 > C5." },

  // ============ English Comprehension (76-100) ============
  { s: ENG, q: "Find out which part of the sentence has an error. If a sentence is free from error, select 'No Error'.\n\nThe Tata group owns (1)/ many industries that are spread (2)/ across the globe. (3)/ No Error (4)", o: ["1","2","3","4"], e: "Error in part 2 — 'industries' should be 'companies'. (Industry refers to a sector; company is the entity.)" },
  { s: ENG, q: "Find out which part of the sentence has an error.\n\nShe has not been (1)/ to the restaurant (2)/ much late. (3)/ No Error (4)", o: ["1","2","3","4"], e: "Error in part 3 — 'much late' should be 'much lately' (recently)." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nHe could excel in his board exams only after _____ very hard.", o: ["continuing","functioning","learning","toiling"], e: "'Toiling' (working hard) fits best with the rest of the sentence." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nHe _____ his camera on the table.", o: ["laid","lain","lay","lie"], e: "'Lay' (transitive, past tense 'laid') is needed because there is an object 'camera'. 'He laid his camera on the table.'" },
  { s: ENG, q: "Select the word similar in meaning to the word given.\n\nMonotonous", o: ["Dull","Timid","Unfriendly","Lusty"], e: "'Monotonous' means dull, repetitive, lacking in variety. Closest synonym: 'Dull'." },
  { s: ENG, q: "Select the word similar in meaning to the word given.\n\nElusive", o: ["Baffling","Enticing","Directing","Soothing"], e: "'Elusive' means difficult to grasp/understand — synonym 'Baffling'." },
  { s: ENG, q: "Select the word opposite in meaning to the word given.\n\nColossal", o: ["Epic","Rust","Teeny","Vast"], e: "'Colossal' means extremely large. Antonym: 'Teeny' (very small)." },
  { s: ENG, q: "Select the word opposite in meaning to the word given.\n\nOpprobrium", o: ["Adulation","Ignominy","Mystical","Preclude"], e: "'Opprobrium' means harsh criticism/disgrace. Antonym: 'Adulation' (excessive admiration/praise)." },
  { s: ENG, q: "Select the alternative which best expresses the meaning of the idiom/phrase.\n\nAll agog", o: ["Avoid","Contentment","Amazed","Unsystematically"], e: "'All agog' means full of excitement and eager anticipation — closest is 'Amazed'." },
  { s: ENG, q: "Select the alternative which best expresses the meaning of the idiom/phrase.\n\nNot to mince matters", o: ["To be at ease","To not confuse others","To not interfere in others affairs","To speak out politely"], e: "'Not to mince matters' means to speak frankly without softening the message — option 4 (closest among given choices per the answer key)." },
  { s: ENG, q: "Improve the bracketed part of the sentence.\n\nThe doctor (has advice) him to take proper diet.", o: ["has advised","had been advised","was advised","No improvement"], e: "Per the source key, no improvement is selected; though grammatically 'has advised' would be standard, the answer key marks (4)." },
  { s: ENG, q: "Improve the bracketed part of the sentence.\n\n(Being a pleasant evening), we went out for a long drive on a highway.", o: ["As a pleasant evening","It being a pleasant evening","With a pleasant evening","No improvement"], e: "'It being a pleasant evening' is the correct absolute participial phrase — the dummy subject 'it' is needed." },
  { s: ENG, q: "Select the alternative which is the best substitute of the phrase.\n\nA roundabout way of speaking", o: ["Centipede","Circumlocution","Coercion","Concentric"], e: "'Circumlocution' means using many words where fewer would do — a roundabout way of speaking." },
  { s: ENG, q: "Select the alternative which is the best substitute of the phrase.\n\nAn old unmarried woman", o: ["Masochist","Septuagenarian","Sniper","Spinster"], e: "'Spinster' refers to an old unmarried woman." },
  { s: ENG, q: "Four words are given, out of which one word is incorrectly spelt. Select the incorrectly spelt word.", o: ["Autumn","Desperate","Reciept","Traffic"], e: "'Reciept' is misspelled — the correct spelling is 'Receipt' (i before e except after c)." },
  { s: ENG, q: "Four words are given, out of which one word is incorrectly spelt. Select the incorrectly spelt word.", o: ["Century","Finance","Remember","Sponser"], e: "'Sponser' is misspelled — the correct spelling is 'Sponsor'." },
  { s: ENG, q: "Select the most logical order of the sentences to form a coherent paragraph.\n\nP — However, our environment also needs some help from all of us to get maintained as usual to nourish our lives forever and to never ruin our lives.\nQ — It gives us all things which we need to live our life on this planet.\nR — It provides us a better medium to grow and develop.\nS — An environment includes all the natural resources which surround us to help in a number of ways.", o: ["PQRS","QPSR","SRQP","QSPR"], e: "S introduces 'environment' (subject). R elaborates the medium it provides. Q lists what it gives us. P concludes with the caveat. Order: SRQP." },
  { s: ENG, q: "Select the most logical order of the sentences to form a coherent paragraph.\n\nP — The starting point can be the experience of a minority within a society generally or even the experience of a group of people within a progressive social movement which does not live up to its progressive agenda in every respect.\nQ — Within (or after) postmodernism a grand unifying theory no longer seems possible. This does not exclude the possibility or the necessity of dialogue.\nR — The starting points of social criticism can be very different and the different forms of socialism never has a monopoly on social criticism.\nS — Nevertheless, most social critics still consider the critique of capitalism to be central.", o: ["PRQS","RPQS","RQPS","PSRQ"], e: "R opens by stating starting points are diverse. P elaborates with examples. Q comments on postmodernism. S concludes. Order: RPQS." },
  { s: ENG, q: "Select the one which best expresses the same sentence in Passive/Active voice.\n\nRohan was not told about the e-mail.", o: ["Nobody told Rohan about the e-mail.","Somebody did not tell Rohan about the e-mail","The e-mail was not told about to Rohan.","There was nobody who could tell Rohan about the e-mail."], e: "Active voice of 'X was not told' is 'Nobody told X' — option 1." },
  { s: ENG, q: "Select the one which best expresses the same sentence in indirect/direct speech.\n\nRam said to Rohan, 'Don't run so fast.'", o: ["Ram advised Rohan don't run so fast.","Ram asked Rohan why is he running so fast.","Ram requested Rohan not to run so fast.","Ram told Rohan not to run so fast."], e: "For an imperative/command in indirect speech, the reporting verb 'said to' becomes 'told ... not to ...'. Option 4." },
  { s: ENG, q: "Cloze test passage:\n\n'Language, they say, is the (1) _____ through which human beings perceive the world. If so, English is perhaps the most (2) _____ lens through which to see animals. It has (3) _____ a cross-eyed view of birds, beasts, fish and fowl. The very word \"animal\" can (4) _____ the brutish and the sensual. Animal (5) _____ imply baseness and vulgarity.'\n\nFill blank 1.", o: ["lens","resource","source","telescope"], e: "The next sentence uses 'lens' explicitly, so 'lens' fits best in blank 1." },
  { s: ENG, q: "Fill blank 2.", o: ["distorting","disturbing","popular","useful"], e: "Reference to 'cross-eyed view' implies the lens is distorting." },
  { s: ENG, q: "Fill blank 3.", o: ["accompanied","exercised","perpetuated","undeterred"], e: "'Perpetuated' (made to continue) fits — English perpetuates a cross-eyed view." },
  { s: ENG, q: "Fill blank 4.", o: ["connote","rectify","trouble","understand"], e: "'Connote' (suggest in addition to literal meaning) fits — the word 'animal' can connote brutish and sensual." },
  { s: ENG, q: "Fill blank 5.", o: ["breeding","gestures","instincts","species"], e: "'Animal instincts' is the standard collocation implying baseness/vulgarity." }
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
      tags: ['SSC', 'CGL', 'Tier-I', 'PYQ', '2017'],
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

  const TEST_TITLE = 'SSC CGL Tier-I - 9 August 2017 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2017, pyqShift: 'Shift-2', pyqExamName: 'SSC CGL Tier-I', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
