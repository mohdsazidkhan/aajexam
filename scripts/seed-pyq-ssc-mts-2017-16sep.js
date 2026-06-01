/**
 * Seed: SSC MTS 2017 Paper-I PYQ - 16th September 2017, Shift-1 (100 questions)
 * Source: Oswaal SSC MTS Year-wise Solved Papers (docx + PDF).
 *
 * SSC MTS (2017 Pattern) Paper-I:
 *   - General English                    : Q1-25   (25 Q)
 *   - General Intelligence & Reasoning   : Q26-50  (25 Q)
 *   - Numerical Aptitude                 : Q51-75  (25 Q)
 *   - General Awareness                  : Q76-100 (25 Q)
 *   1 mark each, 0.25 negative. Total 100 marks, 100 minutes.
 *
 * Answers resolved by explanation CONTENT (and by solving the maths), with the
 * printed numeric key used only as a cross-check. Q97: key prints (3) but the
 * explanation states all three persons were awarded Bharat Ratna in 2019, so the
 * correct answer is option 4 ("All of the above").
 *
 * Run: node scripts/seed-pyq-ssc-mts-2017-16sep.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC MTS/2017/september/16/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-mts-2017-16sep';

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

const ENG = 'General English';
const REA = 'General Intelligence & Reasoning';
const NUM = 'Numerical Aptitude';
const GA  = 'General Awareness';

// Figure questions whose questionImage is a cropped figure (non-verbal reasoning).
const IMAGE_MAP = { 27:'q-27.png', 29:'q-29.png', 30:'q-30.png', 31:'q-31.png', 32:'q-32.png', 41:'q-41.png' };
const OPT4 = ['Option (1)', 'Option (2)', 'Option (3)', 'Option (4)'];

function sectionFor(n) {
  if (n <= 25) return ENG;
  if (n <= 50) return REA;
  if (n <= 75) return NUM;
  return GA;
}

async function uploadIfExists(filename) {
  const fp = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(fp)) { console.log(`  MISSING image ${filename}`); return ''; }
  const res = await cloudinary.uploader.upload(fp, {
    folder: CLOUDINARY_FOLDER,
    public_id: '2017-16sep-' + filename.replace(/\.png$/i, ''),
    overwrite: true, resource_type: 'image'
  });
  return res.secure_url;
}

const RAW = [
// ===================== GENERAL ENGLISH (Q1-25) =====================
{ "n": 1, "q": "Find the part of the sentence that has an error. If there is no error, choose \"No error\".\nSaying this, she (1) storm out of the room, (2) leaving her bogs behind. (3)/ No error (4)", "o": ["Saying this, she", "storm out of the room,", "leaving her bogs behind.", "No error"], "ans": 1, "e": "The action is in the past ('leaving her bogs behind' shows a completed event), so 'storm' should be 'stormed'. The error is in part 2." },
{ "n": 2, "q": "Find the part of the sentence that has an error. If there is no error, choose \"No Error\".\nWe recommend that (1)/ you keep your (2)/ advice to yourself (3)/ No Error (4)", "o": ["We recommend that", "you keep your", "advice to yourself", "No Error"], "ans": 3, "e": "The sentence is grammatically correct ('We recommend that you keep your advice to yourself'), so the answer is 'No Error'." },
{ "n": 3, "q": "Fill in the blank with the most appropriate word.\nThe CM flew ____ the flooded areas in a helicopter.", "o": ["in", "over", "of", "along"], "ans": 1, "e": "'Over' shows movement at a higher level than something else; the helicopter flies over the flooded areas." },
{ "n": 4, "q": "Fill in the blank with the most appropriate word.\nHer mother is anxious ____ her health.", "o": ["about", "of", "after", "for"], "ans": 0, "e": "The phrase 'anxious about' means worried about someone or something. 'Her mother is anxious about her health.'" },
{ "n": 5, "q": "Select the word which best expresses the meaning of the given word.\nPrimitive", "o": ["present", "new", "basic", "modern"], "ans": 2, "e": "'Primitive' relates to a very early stage of development, so 'basic' is its synonym." },
{ "n": 6, "q": "Select the word which best expresses the meaning of the given word.\nDefinite", "o": ["complete", "inexact", "unclear", "vague"], "ans": 0, "e": "'Definite' means clearly stated or decided; the closest synonym here is 'complete'." },
{ "n": 7, "q": "Select the word which best expresses the meaning of the given word.\nCondemn", "o": ["criticize", "aquit", "clear", "pardon"], "ans": 0, "e": "'Condemn' means to criticize something or someone strongly, so 'criticize' is the synonym." },
{ "n": 8, "q": "Select the word which is opposite in meaning of the given word.\nVirtual", "o": ["fundamental", "implied", "indirect", "authentic"], "ans": 3, "e": "'Virtual' means not real or only nearly so, while 'authentic' means genuinely real, making it the antonym." },
{ "n": 9, "q": "Select the word which is opposite in meaning of the given word.\nRustic", "o": ["homely", "simple", "urban", "plain"], "ans": 2, "e": "'Rustic' means rural and simple; its opposite is 'urban'." },
{ "n": 10, "q": "Select the word which is opposite in meaning of the given word.\nBarren", "o": ["fertile", "depleted", "empty", "waste"], "ans": 0, "e": "'Barren' means producing little or no vegetation; its opposite is 'fertile'." },
{ "n": 11, "q": "Select the alternative which best expresses the meaning of the Idiom/Phrase.\nMan in the Street", "o": ["man of talent", "a foolish man", "simple man", "a dutiful person"], "ans": 2, "e": "The idiom 'Man in the Street' means an average or ordinary person, i.e. a 'simple man'." },
{ "n": 12, "q": "Select the alternative which best expresses the meaning of the Idiom/Phrase.\nNow and again", "o": ["occasionally", "always", "to be continued", "at present time or future"], "ans": 0, "e": "The idiom 'Now and again' means from time to time, i.e. 'occasionally'." },
{ "n": 13, "q": "Improve the bracketed part of the sentence.\nThese recipes are delicious (overtly) popular and so, so easy to prepare.", "o": ["widely", "overly", "majorly", "no improvement"], "ans": 0, "e": "'Overtly' (openly) is wrong here; since the recipes are popular over widespread areas, 'widely' is correct." },
{ "n": 14, "q": "Improve the bracketed part of the sentence.\nIn the after math, you will have a litmus (effect) for all the people you know.", "o": ["paper", "affect", "test", "no improvement"], "ans": 2, "e": "The fixed phrase is 'litmus test', used to make a judgement about whether something is acceptable." },
{ "n": 15, "q": "Select the alternative which is the best substitute of the phrase.\nRight or advantage available to a person", "o": ["accountability", "power", "annuity", "privilege"], "ans": 3, "e": "A right or special advantage available to a person is called a 'privilege'." },
{ "n": 16, "q": "Select the alternative which is the best substitute of the phrase.\nReturn the same sort of attack", "o": ["confiscate", "subjugate", "retaliate", "alleviate"], "ans": 2, "e": "To return the same sort of attack is to 'retaliate'." },
{ "n": 17, "q": "Select the correctly spelt word.", "o": ["definite", "definate", "difanate", "definiate"], "ans": 0, "e": "The correct spelling is 'definite' (certain or sure)." },
{ "n": 18, "q": "Select the correctly spelt word.", "o": ["gazete", "gazette", "gazeete", "gazzete"], "ans": 1, "e": "The correct spelling is 'gazette' (an official journal or newspaper)." },
{ "n": 19, "q": "Rearrange the parts of the sentence in correct order.\nHeavy metal\nP : In many applications\nQ : are today being\nR : replaced by polymers", "o": ["RQP", "QRP", "PRQ", "QPR"], "ans": 1, "e": "Heavy metals (Q) are today being (R) replaced by polymers (P) in many applications — the correct order is QRP." },
{ "n": 20, "q": "Rearrange the parts of the sentence in correct order.\nOne should\nP : think calmly\nQ : and clearly\nR : learn how to", "o": ["PQR", "QRP", "QPR", "RPQ"], "ans": 3, "e": "One should (R) learn how to (P) think calmly (Q) and clearly — the correct order is RPQ." },
{ "n": 21, "q": "Fill the blank in the passage with the correct word.\nMy father is an ____ person of my life.", "o": ["ideal", "idle", "idol", "idiot"], "ans": 0, "e": "Since the passage praises the father, 'ideal' (perfect / the best possible) fits best." },
{ "n": 22, "q": "Fill the blank in the passage with the correct word.\nHe is my real ____ and my best friend ever.", "o": ["actor", "player", "hero", "zero"], "ans": 2, "e": "The narrator speaks highly of his father, so 'He is my real hero' is appropriate." },
{ "n": 23, "q": "Fill the blank in the passage with the correct word.\nHe is the ____ of my family and gives advice to every family member.", "o": ["boss", "leader", "knight", "fighter"], "ans": 1, "e": "Since he directs and guides every family member, he is the 'leader' of the family." },
{ "n": 24, "q": "Fill the blank in the passage with the correct word.\nHe is the leader of my family and gives ____ and instruction to every family member.", "o": ["instructions", "advice", "comments", "jokes"], "ans": 1, "e": "'And' joins two similar nouns; alongside 'instruction', the matching noun is 'advice'." },
{ "n": 25, "q": "Fill the blank in the passage with the correct word.\nHe takes me to school on every PTM and ____ my performance with my teacher.", "o": ["evaluates", "calculates", "comprehends", "discusses"], "ans": 3, "e": "A Parent-Teacher Meeting is a place for discussion, so 'discusses' is the appropriate verb." },
// ===================== GENERAL INTELLIGENCE & REASONING (Q26-50) =====================
{ "n": 26, "q": "Select the number which can be placed at the sign of question mark (?) from the given alternatives.\n2   5   6\n3   1   3\n4   2   2\n10  7   ?", "o": ["12", "16", "20", "24"], "ans": 2, "e": "Column-wise, (1st number × 2nd number) + 3rd number = 4th number. Column 3: (6 × 3) + 2 = 20." },
{ "n": 27, "q": "How many triangles are there in the given figure?", "o": ["4", "6", "7", "8"], "ans": 1, "e": "Counting all the small and combined triangles in the figure gives a total of 6 triangles." },
{ "n": 28, "q": "A word is represented by only one set of numbers as given in any one of the alternatives. The columns and rows of Matrix-I are numbered from 0 to 4 and those of Matrix-II from 5 to 9. A letter can be represented first by its row and then by its column, e.g. 'S' can be represented by 34, 99, etc. Identify the set for the word \"FAINT\".\nMatrix-I (rows/cols 0-4):\n    0 1 2 3 4\n0:  B M U A F\n1:  H E O W D\n2:  P J G Q Y\n3:  V R L I S\n4:  Z X T N K\nMatrix-II (rows/cols 5-9):\n    5 6 7 8 9\n5:  D N X G Q\n6:  L V E O Y\n7:  S T C M W\n8:  H R B K U\n9:  F P A I S", "o": ["95, 03, 34, 43, 76", "95, 97, 33, 40, 42", "04, 97, 99, 56, 34", "04, 97, 33, 56, 42"], "ans": 3, "e": "F=04, A=97, I=33, N=56, T=42 — all valid coordinates, so FAINT = 04, 97, 33, 56, 42." },
{ "n": 29, "q": "From the given answer figures, select the one in which the question figure is hidden/embedded. (Refer to the figure.)", "o": OPT4, "ans": 2, "e": "The question figure is completely embedded in option (3)." },
{ "n": 30, "q": "Which answer figure will complete the pattern in the question figure? (Refer to the figure.)", "o": OPT4, "ans": 0, "e": "Following the symmetry of the pattern, option (1) completes the question figure." },
{ "n": 31, "q": "If a mirror is placed on the line AB, then which of the answer figures is the right image of the given figure? (Refer to the figure.)", "o": OPT4, "ans": 2, "e": "In a mirror image, left becomes right and right becomes left; option (3) is the correct mirror image." },
{ "n": 32, "q": "A piece of paper is folded and punched as shown in the question figures. From the given answer figures, indicate how it will appear when opened. (Refer to the figure.)", "o": OPT4, "ans": 0, "e": "Unfolding the punched paper produces the pattern shown in option (1)." },
{ "n": 33, "q": "If '+' means '×', '–' means '÷', '×' means '–' and '÷' means '+', then 26 – 52 + 74 = ?", "o": ["39", "37", "148", "42"], "ans": 1, "e": "After interchanging the signs: 26 ÷ 52 × 74 = (1/2) × 74 = 37." },
{ "n": 34, "q": "If 6 @ 7 @ 3 = 16 and 4 @ 5 @ 1 = 10, then 9 @ 7 @ 6 = ?", "o": ["21", "22", "29", "20"], "ans": 1, "e": "The '@' simply adds the terms: 6+7+3 = 16 and 4+5+1 = 10, so 9+7+6 = 22." },
{ "n": 35, "q": "Arrange the given words in the sequence in which they occur in the dictionary.\n1. mango  2. mind  3. master  4. minty  5. muted", "o": ["13425", "31425", "31245", "13245"], "ans": 3, "e": "Dictionary order: mango(1), master(3), mind(2), minty(4), muted(5) → 13245." },
{ "n": 36, "q": "Select the missing number from the given alternatives.\n143, 139, 134, 128, 121, ?", "o": ["114", "113", "115", "112"], "ans": 1, "e": "The differences are 4, 5, 6, 7, 8: 121 – 8 = 113." },
{ "n": 37, "q": "Select the term that will complete the series.\nAQR, BPS, COT, DNU, ?", "o": ["FOX", "FMX", "EMV", "EOV"], "ans": 2, "e": "1st letters: A,B,C,D,E; 2nd letters: Q,P,O,N,M; 3rd letters: R,S,T,U,V → EMV." },
{ "n": 38, "q": "Select the odd word pair from the given alternatives.", "o": ["Ganga : River", "Pen : Write", "Ostrich : Bird", "Pepper : Spice"], "ans": 1, "e": "In the other pairs the first word is an example of the second (a category). Pen is not an example of 'Write', so it is the odd one out." },
{ "n": 39, "q": "Select the odd number pair from the given alternatives.", "o": ["14 : 27", "2 : 5", "4 : 9", "12 : 25"], "ans": 0, "e": "In the others, 2nd = (1st × 2) + 1. But 14 : 27 follows (14 × 2) – 1 = 27, so it is the odd one out." },
{ "n": 40, "q": "Select the odd letter pair from the given alternatives.", "o": ["AP – EQ", "IS – OT", "OC – UB", "EK – IL"], "ans": 2, "e": "In the others the 2nd letter increases by 1 (P→Q, S→T, K→L). In OC–UB, C→B decreases by 1, so it is the odd one out." },
{ "n": 41, "q": "Identify the diagram that best represents the relationship among the given classes: Computer, Monitor, Keyboard. (Refer to the figure.)", "o": OPT4, "ans": 2, "e": "A monitor and a keyboard are separate parts that are both included in a computer, so two non-overlapping circles lie inside one big circle — option (3)." },
{ "n": 42, "q": "Select the related word pair from the alternatives.\nIron : Metal :: Oxygen : ?", "o": ["respiration", "gas", "odourless", "living"], "ans": 1, "e": "Iron is an example of a metal; similarly oxygen is an example of a gas." },
{ "n": 43, "q": "Select the related number from the given alternatives.\n13 : 27 :: 31 : ?", "o": ["63", "58", "69", "74"], "ans": 0, "e": "The relation is (n × 2) + 1: (13 × 2) + 1 = 27, so (31 × 2) + 1 = 63." },
{ "n": 44, "q": "Select the related letters from the given alternatives.\nAG : ZT :: JD : ?", "o": ["UV", "PX", "QW", "OY"], "ans": 2, "e": "Each letter is replaced by its opposite in the alphabet: A→Z, G→T, J→Q, D→W, giving QW." },
{ "n": 45, "q": "Select the word which cannot be formed using the letters of the given word.\nNoteworthy", "o": ["worth", "torn", "hate", "rent"], "ans": 2, "e": "The letter 'A' is not present in NOTEWORTHY, so 'HATE' cannot be formed." },
{ "n": 46, "q": "Raman is 19th from top and 25th from bottom in a row. How many people are there in the row?", "o": ["42", "44", "43", "45"], "ans": 2, "e": "Total = 19 + 25 – 1 = 43." },
{ "n": 47, "q": "Kamal remembers his birthday is before 24th April. His mother remembers that his birthday is after 22nd April. On which date of April is Kamal's birthday?", "o": ["25", "24", "22", "23"], "ans": 3, "e": "Before 24th (23rd, 22nd, …) and after 22nd (23rd, 24th, …) — the only common date is 23rd April." },
{ "n": 48, "q": "Statements:\nI. Some tables are chairs.\nII. All chairs are cups.\nConclusions:\nI. All tables are cups.\nII. Some tables are cups.\nWhich conclusion logically follows?", "o": ["Only conclusion (I) follows.", "Only conclusion (II) follows.", "Both conclusion follow.", "Neither conclusion (I) nor conclusion (II) follows."], "ans": 1, "e": "Since some tables are chairs and all chairs are cups, those tables are cups — but not necessarily all tables. So only conclusion II follows." },
{ "n": 49, "q": "In a certain code language, \"PALM\" is written as \"QCOQ\". How is \"STEM\" written in that code language?", "o": ["TVHQ", "TVHP", "TVIQ", "TUHQ"], "ans": 0, "e": "The letters are shifted by +1, +2, +3, +4: STEM → S+1=T, T+2=V, E+3=H, M+4=Q = TVHQ." },
{ "n": 50, "q": "In a certain code language, \"SUN\" is written as \"108\" and \"MOON\" is written as \"114\". How is \"STAR\" written in that code language?", "o": ["112", "116", "126", "108"], "ans": 1, "e": "Sum of letter positions × 2: STAR = (19+20+1+18) × 2 = 58 × 2 = 116." },
// ===================== NUMERICAL APTITUDE (Q51-75) =====================
{ "n": 51, "q": "What is the value of 1² + 2² + 3² + …… + 14² ?", "o": ["1050", "1015", "1105", "1225"], "ans": 1, "e": "Using n(n+1)(2n+1)/6 = 14 × 15 × 29 / 6 = 1015." },
{ "n": 52, "q": "How many times does the digit 7 appear in the numbers from 1 to 90?", "o": ["19", "18", "20", "10"], "ans": 0, "e": "Units place: 7,17,27,37,47,57,67,77,87 (9 times); tens place: 70–79 (10 times). Total = 19." },
{ "n": 53, "q": "What is the value of √(1500 + √441) ?", "o": ["37", "39", "49", "47"], "ans": 1, "e": "√441 = 21, so √(1500 + 21) = √1521 = 39." },
{ "n": 54, "q": "If 373P is divisible by 4, then what is the value of P?", "o": ["2", "6", "2 or 6", "4"], "ans": 2, "e": "A number is divisible by 4 if its last two digits are; '3P' must be 32 or 36, so P = 2 or 6." },
{ "n": 55, "q": "What is the value of 12 1/2 + 12 1/3 + 12 1/6 ?", "o": ["36", "37", "39", "38"], "ans": 1, "e": "12 + 12 + 12 = 36 and 1/2 + 1/3 + 1/6 = 1, so the total is 37." },
{ "n": 56, "q": "Which of the following is not a perfect square?", "o": ["1024", "1521", "1444", "876"], "ans": 3, "e": "1024 = 32², 1521 = 39², 1444 = 38², but 876 = 2 × 2 × 3 × 73 is not a perfect square." },
{ "n": 57, "q": "A, B and C together can complete a work in 15 days. B and C can complete the same work in 20 days. In how many days can A alone complete the work?", "o": ["40", "45", "60", "75"], "ans": 2, "e": "A's one-day work = 1/15 – 1/20 = (4 – 3)/60 = 1/60, so A alone takes 60 days." },
{ "n": 58, "q": "P, Q and R together can complete a work in 20 days. P alone can complete it in 40 days and Q alone in 60 days. In how many days can R alone complete the work?", "o": ["60", "80", "40", "120"], "ans": 3, "e": "R's one-day work = 1/20 – 1/40 – 1/60 = (6 – 3 – 2)/120 = 1/120, so R alone takes 120 days." },
{ "n": 59, "q": "What is the area of a rhombus having one side as 30 cm and one diagonal as 36 cm?", "o": ["432", "864", "1080", "540"], "ans": 1, "e": "Half-diagonals: 18 and √(30² – 18²) = 24, so the other diagonal = 48. Area = ½ × 36 × 48 = 864 cm²." },
{ "n": 60, "q": "The selling price and cost price of an article are Rs 5400 and Rs 5200 respectively. If a 10% discount was given, then what is the percentage mark up?", "o": ["12.5", "14.12", "17.25", "15.38"], "ans": 3, "e": "Marked price = 5400 / 0.9 = 6000. Mark up = (6000 – 5200)/5200 × 100 = 15.38%." },
{ "n": 61, "q": "Cost price of an article is Rs 3600. It was sold at a profit of 15%. If the article was sold at a discount of 8%, then what is the marked price (in Rs) of the article?", "o": ["4000", "4250", "4500", "4750"], "ans": 2, "e": "Selling price = 3600 × 1.15 = 4140. Marked price = 4140 / 0.92 = 4500." },
{ "n": 62, "q": "200 litres of alcohol solution has 30% alcohol in it. How much alcohol should be added to make it 50% in the solution?", "o": ["40", "60", "80", "50"], "ans": 2, "e": "Alcohol = 60 L. (60 + x)/(200 + x) = 0.5 ⇒ 60 + x = 100 + 0.5x ⇒ x = 80 litres." },
{ "n": 63, "q": "In a college, the ratio of boys and girls is 5 : 3 and the ratio of girls and teachers is 7 : 1. What is the ratio of students and teachers?", "o": ["57 : 3", "54 : 1", "26 : 1", "56 : 3"], "ans": 3, "e": "B : G : T = 35 : 21 : 3, so students = 56 and teachers = 3, giving 56 : 3." },
{ "n": 64, "q": "What is the average of the first 9 odd numbers?", "o": ["9", "7", "10", "8"], "ans": 0, "e": "Sum of first 9 odd numbers = 9² = 81; average = 81/9 = 9." },
{ "n": 65, "q": "A man buys 8 oranges for a rupee and sells 6 oranges for a rupee. What is the profit percentage?", "o": ["25", "20", "33.33", "10"], "ans": 2, "e": "CP of one orange = 1/8, SP = 1/6. Profit% = (1/6 – 1/8)/(1/8) × 100 = 33.33%." },
{ "n": 66, "q": "A fan costing Rs 1050 is being sold for Rs 1500. What is the profit percentage?", "o": ["35.26", "42.85", "44.23", "37.57"], "ans": 1, "e": "Profit = 1500 – 1050 = 450. Profit% = 450/1050 × 100 = 42.85%." },
{ "n": 67, "q": "If 23% of a number is 690, then what is 72% of the same number?", "o": ["1475", "1450", "2160", "1380"], "ans": 2, "e": "The number = 690 × 100/23 = 3000; 72% of 3000 = 2160." },
{ "n": 68, "q": "If A is 20% less than B, then B is how much percent more than A?", "o": ["16.66", "20", "25", "10"], "ans": 2, "e": "Let B = 100, then A = 80. B is (20/80) × 100 = 25% more than A." },
{ "n": 69, "q": "Govind covers 3/11 of the total distance by train and the remaining 72 km by bus. What is his total journey (in km)?", "o": ["108", "99", "118", "126"], "ans": 1, "e": "Remaining fraction = 8/11 = 72 km, so total = 72 × 11/8 = 99 km." },
{ "n": 70, "q": "A man can row 10 km/hr in still water. If the speed of the current is 2 km/hr, he takes 3 hours more upstream than downstream. What is the distance (in km)?", "o": ["36", "72", "48", "24"], "ans": 1, "e": "Upstream = 8, downstream = 12 km/h. x/8 – x/12 = 3 ⇒ x/24 = 3 ⇒ x = 72 km." },
{ "n": 71, "q": "A certain sum becomes k times in 6 years at compound interest. In 24 years it will become how many times?", "o": ["4k", "k⁴", "k³", "3k"], "ans": 1, "e": "24 years = 4 × 6 years, so the sum becomes k⁴ times." },
{ "n": 72, "q": "The line chart shows the profit % of a shopkeeper over 6 consecutive years: Y1 = 20%, Y2 = 25%, Y3 = 10%, Y4 = 12%, Y5 = 20%, Y6 = 18%. [Profit % = (Revenue – Expenditure)/Expenditure × 100]\nIf the expenditure in year Y2 is Rs 40000, then what is the revenue (in Rs) in that year?", "o": ["50000", "35000", "30000", "46000"], "ans": 0, "e": "Profit% in Y2 = 25, so revenue = 40000 × (1 + 25/100) = 50000." },
{ "n": 73, "q": "The line chart shows the profit % of a shopkeeper over 6 consecutive years: Y1 = 20%, Y2 = 25%, Y3 = 10%, Y4 = 12%, Y5 = 20%, Y6 = 18%. [Profit % = (Revenue – Expenditure)/Expenditure × 100]\nIf the revenue in year Y5 is Rs 96000, then what is the expenditure (in Rs) in that year?", "o": ["66000", "80000", "84000", "74000"], "ans": 1, "e": "Profit% in Y5 = 20, so expenditure = 96000 / (1 + 20/100) = 80000." },
{ "n": 74, "q": "The line chart shows the profit % of a shopkeeper over 6 consecutive years: Y1 = 20%, Y2 = 25%, Y3 = 10%, Y4 = 12%, Y5 = 20%, Y6 = 18%. [Profit % = (Revenue – Expenditure)/Expenditure × 100]\nThe expenditure of Y1 and Y4 are Rs 40000 and Rs 60000 respectively. What is the total profit (in Rs) of Y1 and Y4?", "o": ["16800", "13400", "15200", "19500"], "ans": 2, "e": "Profit = 40000 × 20/100 + 60000 × 12/100 = 8000 + 7200 = 15200." },
{ "n": 75, "q": "The line chart shows the profit % of a shopkeeper over 6 consecutive years: Y1 = 20%, Y2 = 25%, Y3 = 10%, Y4 = 12%, Y5 = 20%, Y6 = 18%. [Profit % = (Revenue – Expenditure)/Expenditure × 100]\nThe expenditure of Y3 and Y6 are Rs 100000 and Rs 200000 respectively. What is the average revenue (in Rs) for these 2 years?", "o": ["148000", "156000", "152000", "173000"], "ans": 3, "e": "Revenue Y3 = 100000 × 1.10 = 110000; Y6 = 200000 × 1.18 = 236000. Average = (110000 + 236000)/2 = 173000." },
// ===================== GENERAL AWARENESS (Q76-100) =====================
{ "n": 76, "q": "What is National Income?", "o": ["It is the money value of all goods and services produced in a country in a year", "It is the money value of all goods and services produced in a country in two years", "It is the money value of all goods and services produced in a country in five years", "It is the money value of all goods and services produced outside the country in a year"], "ans": 0, "e": "National Income is the monetary value of all finished goods and services produced within a country in a set time period (a year)." },
{ "n": 77, "q": "How is the Net National Product (NNP) calculated?", "o": ["NNP = GNP − Depreciation", "NNP = GDP − Taxes", "NNP = GNP + Taxes", "NNP = GNP + Depreciation"], "ans": 0, "e": "Net National Product = Gross National Product − Depreciation." },
{ "n": 78, "q": "From which date did the Indian Constitution come into commencement completely?", "o": ["15th Aug 1950", "26th Jan 1947", "15th Aug 1947", "26th Jan 1950"], "ans": 3, "e": "The Constitution was adopted on 26th November 1949 and came into force on 26th January 1950." },
{ "n": 79, "q": "How many houses are there in the Indian Parliament?", "o": ["2", "3", "4", "5"], "ans": 0, "e": "The Indian Parliament is bicameral, with two houses — the Rajya Sabha and the Lok Sabha." },
{ "n": 80, "q": "Stone tools were first found in which period?", "o": ["Neolithic", "Palaeolithic", "Microlith", "Mesolithic"], "ans": 1, "e": "Stone tools were first found in the Palaeolithic (Old Stone Age) period." },
{ "n": 81, "q": "What were cotton textiles taken by the Portuguese from Calicut generally named in Europe?", "o": ["Calco", "Calico", "Cottex", "None of these"], "ans": 1, "e": "Such cotton textiles came to be called 'Calico', from the city name Calicut (Kozhikode)." },
{ "n": 82, "q": "What is the position of Mercury from the Sun among the eight planets?", "o": ["first", "second", "third", "fourth"], "ans": 0, "e": "Mercury is the innermost planet, first from the Sun." },
{ "n": 83, "q": "What is the zone between the Tropic of Cancer and Tropic of Capricorn called?", "o": ["temperate zone", "frigid zone", "torrid zone", "none of these"], "ans": 2, "e": "The zone between the two tropics, receiving direct sun rays, is the Torrid Zone." },
{ "n": 84, "q": "Which of the following roots are not eaten?", "o": ["Carrot", "Tapioca", "Raddish", "Wheat"], "ans": 3, "e": "Carrot, tapioca and radish are edible roots; wheat is a cereal grain (grass), not a root." },
{ "n": 85, "q": "In deficiency of which vitamin does blood not clot?", "o": ["Vitamin A", "Vitamin K", "Vitamin E", "Vitamin D"], "ans": 1, "e": "Vitamin K is essential for normal blood clotting." },
{ "n": 86, "q": "In man, ribs are attached to ____.", "o": ["Clavicle", "Ileum", "Sternum", "Scapula"], "ans": 2, "e": "The ribs are attached to the sternum in front and the thoracic vertebrae at the back." },
{ "n": 87, "q": "The reciprocal of resistance is conductance. If the unit of resistance is ohm, the unit of conductance will be ____.", "o": ["ohm⁻¹", "ohmmeter", "rho", "ampere"], "ans": 0, "e": "Conductance is the reciprocal of resistance, so its unit is ohm⁻¹ (per ohm / siemens)." },
{ "n": 88, "q": "Minimum work is done when the body is ____.", "o": ["pushed down an inclined plane", "raised vertically upwards", "pushed over smooth rollers", "pulled on a plane horizontal surface"], "ans": 2, "e": "When a body is pushed over smooth rollers, work done against friction and gravity is essentially zero, so the work is minimum." },
{ "n": 89, "q": "What is the first page of a website called?", "o": ["home page", "main page", "design page", "none of these"], "ans": 0, "e": "The first page of a website is called the home page." },
{ "n": 90, "q": "When sodium reacts with fluorine ____.", "o": ["Each fluorine atom loses one electron", "Each sodium atom gains one electron", "Fluorine neither gains nor loses electron", "The compound formed is a good conductor of electricity in the molten state"], "ans": 3, "e": "Sodium and fluorine form ionic sodium fluoride (NaF), which is a good conductor of electricity in the molten state." },
{ "n": 91, "q": "Essential component of an amalgam is ____.", "o": ["an acid", "mercury", "a base", "a non-metal"], "ans": 1, "e": "An amalgam is an alloy of a metal with mercury, so mercury (Hg) is the essential component." },
{ "n": 92, "q": "What is the effect of greenhouse gases on the average temperature of the Earth's atmosphere?", "o": ["increases", "decreases", "remains same", "first increases and then decreases"], "ans": 0, "e": "Greenhouse gases trap solar radiation, increasing the average temperature of the atmosphere." },
{ "n": 93, "q": "Which is a scheme for providing physical aids and assisted-living devices for senior citizens belonging to the BPL category?", "o": ["Rashtriya Vayoshri Yojana", "Vayoshreshtha Yojana", "Pradhan Mantri Vayoushri Yojana", "None of these"], "ans": 0, "e": "Rashtriya Vayoshri Yojana provides free physical aids and assisted-living devices to BPL senior citizens." },
{ "n": 94, "q": "Who invented the Barometer?", "o": ["E. Torricelli", "Walter Reed", "William Herschel", "William Stanley"], "ans": 0, "e": "Evangelista Torricelli invented the mercury barometer in 1643." },
{ "n": 95, "q": "Which country hosted the 2019 ICC Cricket World Cup?", "o": ["England", "South Africa", "India", "West Indies"], "ans": 0, "e": "The 2019 ICC Cricket World Cup was hosted by England (and Wales)." },
{ "n": 96, "q": "Which art is also known as Greco-Buddhist art?", "o": ["Gandhara Art", "Mathura Art", "Sunga Art", "Madhubani Art"], "ans": 0, "e": "Gandhara Art, which developed in the Gandhara region, is also known as Greco-Buddhist art." },
{ "n": 97, "q": "Who was/were the last person/persons to be awarded the 'Bharat Ratna'?", "o": ["Pranab Mukherjee", "Bhupen Hazarika", "Nanaji Deshmukh", "All of the above"], "ans": 3, "e": "Pranab Mukherjee, Nanaji Deshmukh and Bhupen Hazarika were all awarded the Bharat Ratna in 2019, so the answer is 'All of the above'." },
{ "n": 98, "q": "Who is the author of the book named 'A Bend in the River'?", "o": ["V.S Naipaul", "Mark Twain", "Bill Gates", "G.B Shaw"], "ans": 0, "e": "'A Bend in the River' (1979) was written by Nobel laureate V. S. Naipaul." },
{ "n": 99, "q": "The African Nuclear-Weapon-Free Zone Treaty is also called ____.", "o": ["Pelindaba Treaty", "Petrotech Treaty", "Tropex Treaty", "None of these"], "ans": 0, "e": "The African Nuclear-Weapon-Free Zone Treaty is also known as the Pelindaba Treaty." },
{ "n": 100, "q": "Which neighbouring country of India is also known by the name Burma?", "o": ["Mayanmar", "Bangladesh", "Bhutan", "China"], "ans": 0, "e": "Myanmar, which borders India to the east, was earlier known as Burma." }
];

async function buildQuestions() {
  const all = RAW.slice().sort((a, b) => a.n - b.n);
  if (all.length !== 100) throw new Error(`Expected 100 questions, got ${all.length}`);
  all.forEach((q, i) => { if (q.n !== i + 1) throw new Error(`Question numbering gap at index ${i}: n=${q.n}`); });

  const questions = [];
  for (const r of all) {
    if (!Array.isArray(r.o) || r.o.length !== 4) throw new Error(`Q${r.n} does not have 4 options`);
    if (typeof r.ans !== 'number' || r.ans < 0 || r.ans > 3) throw new Error(`Q${r.n} bad ans ${r.ans}`);
    let questionImage = '';
    if (IMAGE_MAP[r.n]) {
      process.stdout.write(`Uploading Q${r.n} image... `);
      questionImage = await uploadIfExists(IMAGE_MAP[r.n]);
      console.log(questionImage ? 'ok' : 'missing');
    }
    questions.push({
      questionText: r.q,
      questionImage,
      options: r.o,
      optionImages: ['', '', '', ''],
      correctAnswerIndex: r.ans,
      explanation: r.e || '',
      section: sectionFor(r.n),
      tags: ['SSC', 'MTS', 'Paper-I', 'PYQ', '2017'],
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
  } else console.log(`Found ExamCategory: Central (${category._id})`);

  let exam = await Exam.findOne({ code: 'SSC-MTS' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id, name: 'SSC MTS', code: 'SSC-MTS',
      description: 'Staff Selection Commission - Multi Tasking (Non-Technical) Staff', isActive: true
    });
    console.log(`Created Exam: SSC MTS (${exam._id})`);
  } else console.log(`Found Exam: SSC MTS (${exam._id})`);

  const PATTERN_TITLE = 'SSC MTS (2017 Pattern)';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 100, totalMarks: 100, negativeMarking: 0.25,
      sections: [
        { name: ENG, totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25, sectionDuration: 0 },
        { name: REA, totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25, sectionDuration: 0 },
        { name: NUM, totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25, sectionDuration: 0 },
        { name: GA,  totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25, sectionDuration: 0 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);

  const TEST_TITLE = 'SSC MTS (2017 Pattern) - 2017 (16 Sep) Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading figure images to Cloudinary)...');
  const questions = await buildQuestions();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 100,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2017, pyqShift: '16 Sep 2017 Shift-1', pyqExamName: 'SSC MTS', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
