/**
 * Seed: SSC MTS 2017 Paper-I PYQ - 18th September 2017, Shift-1 (100 questions)
 * Source: Oswaal SSC MTS Year-wise Solved Papers (docx + PDF).
 *
 * SSC MTS (2017 Pattern) Paper-I: 25 Q each for General English / Reasoning /
 * Numerical / General Awareness. 1 mark each, 0.25 negative, 100 marks, 100 min.
 *
 * Answers resolved by explanation CONTENT and by solving the maths, with the
 * printed numeric key used as a cross-check (they agree for this paper).
 * Text fixes from the Oswaal OCR: Q33 expression is "12 × 6 ÷ 4" and Q68 is
 * "[(30% of 360)+(11% of 200)] ÷ (2% of 400)" (per their worked explanations).
 * Q17 source misprints option 1 identically to option 3 ("height"); option 1 is
 * rendered here as the intended misspelling "heigth" so the four options differ.
 *
 * Run: node scripts/seed-pyq-ssc-mts-2017-18sep.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC MTS/2017/september/18/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-mts-2017-18sep';

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
    public_id: '2017-18sep-' + filename.replace(/\.png$/i, ''),
    overwrite: true, resource_type: 'image'
  });
  return res.secure_url;
}

const RAW = [
// ===================== GENERAL ENGLISH (Q1-25) =====================
{ "n": 1, "q": "Find the part of the sentence that has an error. If there is no error, choose 'No Error'.\nYou hereby are requested (1)/ to ensure that any such link is (2)/ immediately removed from your platforms. (3)/ No Error (4)", "o": ["You hereby are requested", "to ensure that any such link is", "immediately removed from your platforms.", "No Error"], "ans": 0, "e": "The adverb 'hereby' is misplaced; it should come after the auxiliary: 'You are hereby requested'. The error is in part 1." },
{ "n": 2, "q": "Find the part of the sentence that has an error. If there is no error, choose 'No Error'.\nPower corrupts; (1)/ absolute power (2)/ corrupts absolutely. (3)/ No Error (4)", "o": ["Power corrupts;", "absolute power", "corrupts absolutely.", "No Error"], "ans": 3, "e": "The sentence is grammatically correct, so the answer is 'No Error'." },
{ "n": 3, "q": "Fill in the blank with the most appropriate word.\nKalpana is endowed ____ many great qualities.", "o": ["from", "to", "with", "in"], "ans": 2, "e": "The verb 'endow' takes the preposition 'with': 'endowed with many great qualities'." },
{ "n": 4, "q": "Fill in the blank with the most appropriate word.\nKashish is a very unhappy person, she ____ about almost everything.", "o": ["grumbles", "likes", "enjoys", "loves"], "ans": 0, "e": "An unhappy person complains, so 'grumbles' fits the context." },
{ "n": 5, "q": "Select the word which best expresses the meaning of the given word.\nEventual", "o": ["intermediate", "preliminary", "ultimate", "prior"], "ans": 2, "e": "'Eventual' means happening at a later time or at the end, so 'ultimate' is its synonym." },
{ "n": 6, "q": "Select the word which best expresses the meaning of the given word.\nForbid", "o": ["ban", "grant", "permit", "allow"], "ans": 0, "e": "'Forbid' means to refuse to allow something, so 'ban' is the synonym." },
{ "n": 7, "q": "Select the word which best expresses the meaning of the given word.\nFragile", "o": ["tough", "sturdy", "brittle", "hary"], "ans": 2, "e": "'Fragile' means easily broken or damaged, so 'brittle' is the synonym." },
{ "n": 8, "q": "Select the word which is opposite in meaning of the given word.\nTranquil", "o": ["violent", "quiet", "calm", "easy"], "ans": 0, "e": "'Tranquil' means free from disturbance; its opposite is 'violent'." },
{ "n": 9, "q": "Select the word which is opposite in meaning of the given word.\nShrewd", "o": ["clever", "naive", "brainy", "artful"], "ans": 1, "e": "'Shrewd' means sharp in judgement; its opposite is 'naive'." },
{ "n": 10, "q": "Select the word which is opposite in meaning of the given word.\nSuspicious", "o": ["doubtful", "jealous", "wondering", "trustworthy"], "ans": 3, "e": "'Suspicious' means feeling doubt or distrust; its opposite is 'trustworthy'." },
{ "n": 11, "q": "Select the alternative which best expresses the meaning of the Idiom/Phrase.\nAt the eleventh hour.", "o": ["the initial moment", "at the last possible moment", "at its usual time", "at the earliest possible time"], "ans": 1, "e": "The idiom 'at the eleventh hour' means at the last possible moment before it is too late." },
{ "n": 12, "q": "Select the alternative which best expresses the meaning of the Idiom/Phrase.\nA red letter day.", "o": ["a day when one feels lazy", "a day that is pleasantly noteworthy or memorable", "a sorrowful day", "most dangerous day of one's life"], "ans": 1, "e": "A 'red letter day' is a day that is pleasantly noteworthy or memorable." },
{ "n": 13, "q": "Improve the bracketed part of the sentence. If no improvement is needed, select 'no improvement'.\nI spoke to (my all) friends and finalized the plan.", "o": ["my every", "every my", "all my", "no improvement"], "ans": 2, "e": "When a predeterminer and a determiner occur together, the predeterminer comes first: 'all my friends'." },
{ "n": 14, "q": "Improve the bracketed part of the sentence. If no improvement is needed, select 'no improvement'.\nThe higher the demand (the more) the prices.", "o": ["great", "the greater", "high", "no improvement"], "ans": 1, "e": "In the 'the + comparative … the + comparative' structure, 'higher' must be matched by 'the greater'." },
{ "n": 15, "q": "Select the alternative which is the best substitute of the phrase.\nThe killing of human beings.", "o": ["homicide", "patricide", "suicide", "infanticide"], "ans": 0, "e": "'Homicide' is the killing of one human being by another." },
{ "n": 16, "q": "Select the alternative which is the best substitute of the phrase.\nSomething which is out of use.", "o": ["catastrophe", "obsolete", "common", "disaster"], "ans": 1, "e": "'Obsolete' refers to something no longer in use." },
{ "n": 17, "q": "Select the correctly spelt word.", "o": ["heigth", "hite", "height", "hieght"], "ans": 2, "e": "The correct spelling is 'height'." },
{ "n": 18, "q": "Select the correctly spelt word.", "o": ["guidance", "giuance", "giudence", "guidence"], "ans": 0, "e": "The correct spelling is 'guidance'." },
{ "n": 19, "q": "Select the most logical order of the sentences to form a coherent paragraph.\nManagement is a set of\nP : technology running smoothly\nQ : system of people and\nR : processes that can keep a complicated", "o": ["RQP", "QPR", "PQR", "RPQ"], "ans": 0, "e": "Management is a set of (R) processes that can keep a complicated (Q) system of people and (P) technology running smoothly — order RQP." },
{ "n": 20, "q": "Select the most logical order of the sentences to form a coherent paragraph.\nIndia is a country\nP : which respects spiritualism\nQ : much more\nR : than materialism", "o": ["PRQ", "QPR", "PQR", "QRP"], "ans": 2, "e": "India is a country (P) which respects spiritualism (Q) much more (R) than materialism — order PQR." },
{ "n": 21, "q": "Cloze test (passage on the benefits of the Internet). Select the correct word for the blank.\nThe benefits of Internet are ____ for lay people.", "o": ["unstoppable", "unachievable", "uncomprehendable", "unthinkable"], "ans": 3, "e": "The writer stresses how vast the benefits are, so 'unthinkable' (beyond imagination) fits best." },
{ "n": 22, "q": "Cloze test (passage on the benefits of the Internet). Select the correct word for the blank.\nThe most ____, the cheapest, and the quickest people can afford.", "o": ["unthinkable", "extensive", "limited", "restricted"], "ans": 1, "e": "The Internet is applicable extensively to all kinds of people, so 'extensive' is appropriate." },
{ "n": 23, "q": "Cloze test (passage on the benefits of the Internet). Select the correct word for the blank.\nPeople can learn about gender relations in an ____ country like Iran without going there physically.", "o": ["secluded", "loving", "sacred", "amazing"], "ans": 0, "e": "Iran is referred to as an isolated/remote place, so 'secluded' fits." },
{ "n": 24, "q": "Cloze test (passage on the benefits of the Internet). Select the correct word for the blank.\nYouTube would save him ____ of dollars without a need to visit the USA.", "o": ["few", "hundreds", "less", "more"], "ans": 1, "e": "'Hundreds of dollars' is the correct expression before 'of'." },
{ "n": 25, "q": "Cloze test (passage on the benefits of the Internet). Select the correct word for the blank.\nIt costs US$ 1 for internet use at ____ cafe.", "o": ["pizza", "bakery and", "internet", "food and"], "ans": 2, "e": "Internet use is possible at an 'internet' cafe, so 'internet' fits the blank." },
// ===================== GENERAL INTELLIGENCE & REASONING (Q26-50) =====================
{ "n": 26, "q": "Select the number which can be placed at the sign of question mark (?) from the given alternatives.\n3   1   8\n4   6   9\n2   5   2\n24  30  ?", "o": ["36", "72", "144", "268"], "ans": 2, "e": "Column-wise, (1st number × 2nd number) × 3rd number = 4th number. Column 3: (8 × 9) × 2 = 144." },
{ "n": 27, "q": "How many triangles are there in the given figure? (The figure is a square with both of its diagonals drawn.)", "o": ["4", "6", "7", "8"], "ans": 3, "e": "A square with both diagonals drawn contains 4 small triangles and 4 larger half-square triangles — 8 in total." },
{ "n": 28, "q": "A word is represented by a set of numbers; a letter is represented first by its row and then by its column, e.g. 'A' = 24, 95 and 'M' = 11, 66. Identify the set for the word \"CALF\".\nMatrix-I (rows/cols 0-4):\n    0 1 2 3 4\n0:  A C E G I\n1:  K M O Q S\n2:  U W Y B A\n3:  F H J L N\n4:  P R T V X\nMatrix-II (rows/cols 5-9):\n    5 6 7 8 9\n5:  I K D F X\n6:  G M B H V\n7:  E O Y J T\n8:  C F W L R\n9:  A S U N P", "o": ["85, 01, 33, 31", "02, 00, 88, 30", "01, 95, 88, 58", "85, 00, 89, 87"], "ans": 2, "e": "C=01, A=95, L=88, F=58 — all valid coordinates, so CALF = 01, 95, 88, 58." },
{ "n": 29, "q": "From the given answer figures, select the one in which the question figure is hidden/embedded. (Refer to the figure.)", "o": OPT4, "ans": 2, "e": "The question figure is completely embedded in option (3)." },
{ "n": 30, "q": "Which answer figure will complete the pattern in the question figure? (Refer to the figure.)", "o": OPT4, "ans": 2, "e": "Following the logic and symmetry of the pattern, option (3) completes the figure." },
{ "n": 31, "q": "If a mirror is placed on the line AB, then which of the answer figures is the right image of the given figure? (Refer to the figure.)", "o": OPT4, "ans": 1, "e": "In a mirror image, left becomes right and right becomes left; option (2) is the correct mirror image." },
{ "n": 32, "q": "A piece of paper is folded and punched as shown in the question figures. From the given answer figures, indicate how it will appear when opened. (Refer to the figure.)", "o": OPT4, "ans": 2, "e": "Unfolding the punched paper produces the pattern shown in option (3)." },
{ "n": 33, "q": "If '+' means '–', '–' means '×', '×' means '÷' and '÷' means '+', then 12 × 6 ÷ 4 = ?", "o": ["4", "8", "6", "2"], "ans": 2, "e": "After interchanging the signs: 12 ÷ 6 + 4 = 2 + 4 = 6." },
{ "n": 34, "q": "If 48 + 18 = 30 and 27 + 15 = 12, then 55 + 20 = ?", "o": ["77", "35", "27", "50"], "ans": 1, "e": "Here '+' acts as '–': 48 – 18 = 30, 27 – 15 = 12, so 55 – 20 = 35." },
{ "n": 35, "q": "Arrange the given words in the sequence in which they occur in an English dictionary.\n1. nasty  2. niggle  3. nine  4. normal  5. normandy", "o": ["13254", "13245", "12345", "12354"], "ans": 2, "e": "Dictionary order: nasty(1), niggle(2), nine(3), normal(4), normandy(5) → 12345." },
{ "n": 36, "q": "Select the missing number from the given alternatives.\n36, 41, 47, ?, 62, 71", "o": ["52", "54", "53", "55"], "ans": 1, "e": "The differences are 5, 6, 7, 8, 9: 47 + 7 = 54." },
{ "n": 37, "q": "Select the term that will complete the series.\nEGF, HJI, KML, ?", "o": ["OPN", "ONP", "NOP", "NPO"], "ans": 3, "e": "1st letters: E,H,K,N (+3); 2nd letters: G,J,M,P (+3); 3rd letters: F,I,L,O (+3) → NPO." },
{ "n": 38, "q": "Select the odd word from the given alternatives.", "o": ["Book", "Pen", "Pencil", "Marker"], "ans": 0, "e": "Pen, pencil and marker are used for writing; a book is used for reading, so 'Book' is the odd one out." },
{ "n": 39, "q": "Select the odd number pair from the given alternatives.", "o": ["49 : 13", "58 : 15", "69 : 15", "74 : 11"], "ans": 1, "e": "In the others the digits add up to the second number (4+9=13, 6+9=15, 7+4=11); but 5+8=13 ≠ 15, so 58 : 15 is odd." },
{ "n": 40, "q": "Select the odd letters from the given alternatives.", "o": ["UW", "OQ", "IK", "AD"], "ans": 3, "e": "In the others the second letter is +2 from the first (U+2=W, O+2=Q, I+2=K); but A+3=D, so AD is the odd one out." },
{ "n": 41, "q": "Identify the diagram that best represents the relationship among the given classes: Male, Female, Humans. (Refer to the figure.)", "o": OPT4, "ans": 1, "e": "Males and females are separate groups, both of which are humans, so two non-overlapping circles lie inside one big circle — option (2)." },
{ "n": 42, "q": "Select the related word pair from the alternatives.\nPen : Write :: Knife : ?", "o": ["Join", "Erase", "Cut", "Wood"], "ans": 2, "e": "A pen is used to write; similarly a knife is used to cut." },
{ "n": 43, "q": "Select the related number from the given alternatives.\n43 : 12 :: 39 : ?", "o": ["62", "27", "14", "10"], "ans": 1, "e": "The product of the digits gives the second number: 4 × 3 = 12, so 3 × 9 = 27." },
{ "n": 44, "q": "Select the related letters from the given alternatives.\nAD : EI :: KX : ?", "o": ["OC", "ND", "PC", "PD"], "ans": 0, "e": "A+4=E and D+5=I; similarly K+4=O and X+5=C, giving OC." },
{ "n": 45, "q": "Select the word which cannot be formed using the letters of the given word.\nProjections", "o": ["poison", "injection", "project", "section"], "ans": 1, "e": "PROJECTIONS has only one 'I' and one 'N', but INJECTION needs two of each, so 'injection' cannot be formed." },
{ "n": 46, "q": "The ratio of the present ages of Raj and Aman is 4 : 3. After 5 years the age of Aman will be 23 years. What is the present age (in years) of Raj?", "o": ["26", "28", "24", "20"], "ans": 2, "e": "Aman's present age = 23 – 5 = 18 years; Raj's age = 18 × 4/3 = 24 years." },
{ "n": 47, "q": "Kamal is 13th from the left end of a row and 14th from the right end of the row. How many total people are there in the row?", "o": ["26", "27", "25", "28"], "ans": 0, "e": "Total = 13 + 14 – 1 = 26." },
{ "n": 48, "q": "Statements:\nI. All chairs are tables.\nII. Some chairs are pencils.\nConclusions:\nI. All tables are chairs.\nII. Some pencils are chairs.\nWhich conclusion logically follows?", "o": ["Only conclusion (I) follows", "Only conclusion (II) follows", "Both conclusion follow.", "Neither conclusion (I) nor conclusion (II) follows."], "ans": 1, "e": "'All tables are chairs' is not definite, but since some chairs are pencils, some pencils are chairs. So only conclusion II follows." },
{ "n": 49, "q": "In a certain code language, \"VERBAL\" is written as \"ZIVFEP\". How is \"Reasoning\" written in that code language?", "o": ["VIEWSRMRK", "VIKXSRMRK", "VIEWSTMRK", "VIEWSRNSM"], "ans": 0, "e": "Each letter is shifted by +4: REASONING → V,I,E,W,S,R,M,R,K = VIEWSRMRK." },
{ "n": 50, "q": "In a certain code language, \"PARK\" is written as \"TEVO\". How is \"Talk\" written in that code language?", "o": ["XEPO", "XEPP", "XEOP", "XDPO"], "ans": 0, "e": "Each letter is shifted by +4: TALK → X,E,P,O = XEPO." },
// ===================== NUMERICAL APTITUDE (Q51-75) =====================
{ "n": 51, "q": "What is the value of 1³ + 2³ + 3³ + …… + 10³ ?", "o": ["5500", "3025", "6025", "2975"], "ans": 1, "e": "Using [n(n+1)/2]² = [10 × 11 / 2]² = 55² = 3025." },
{ "n": 52, "q": "What is the value of 34 ÷ 17 × 2 + 4?", "o": ["8", "16", "5", "6"], "ans": 0, "e": "34 ÷ 17 × 2 + 4 = 2 × 2 + 4 = 4 + 4 = 8." },
{ "n": 53, "q": "What is the LCM of 18/5 and 20/9?", "o": ["60", "12", "30", "180"], "ans": 3, "e": "LCM of fractions = LCM(numerators)/HCF(denominators) = LCM(18, 20)/HCF(5, 9) = 180/1 = 180." },
{ "n": 54, "q": "If 34P7 is divisible by 11, then what is the value of P?", "o": ["2", "4", "6", "8"], "ans": 3, "e": "(3 + P) – (4 + 7) = P – 8 must be divisible by 11, which happens when P = 8." },
{ "n": 55, "q": "What is the value of (37 + 23)² + (37 – 23)² ?", "o": ["1898", "3796", "2838", "2427"], "ans": 1, "e": "(60)² + (14)² = 3600 + 196 = 3796." },
{ "n": 56, "q": "Which fraction among 3/7, 4/11 and 5/8 is the smallest?", "o": ["3/7", "4/11", "5/8", "all are equal"], "ans": 1, "e": "3/7 ≈ 0.43, 4/11 ≈ 0.36, 5/8 = 0.625, so 4/11 is the smallest." },
{ "n": 57, "q": "Three taps P, Q and R together can completely fill a tank in 40 minutes. Q and R together can fill the same tank in 80 minutes. In how much time (in minutes) can P alone fill the tank?", "o": ["40", "60", "80", "120"], "ans": 2, "e": "P's rate = 1/40 – 1/80 = 1/80, so P alone takes 80 minutes." },
{ "n": 58, "q": "Two taps X and Y together can fill a tank in 36 hours, Y and Z in 48 hours and X and Z in 72 hours. If all three taps are opened, in how much time (in hours) will the tank be completely filled?", "o": ["16", "32", "22", "36"], "ans": 1, "e": "2(X+Y+Z) = 1/36 + 1/48 + 1/72 = 9/144 = 1/16, so X+Y+Z = 1/32, i.e. 32 hours." },
{ "n": 59, "q": "The side of an equilateral triangle is equal to the diagonal of a square. If the side of the square is 12 cm, then what is the area of the equilateral triangle?", "o": ["50√2", "50√3", "72√3", "100√3"], "ans": 2, "e": "Diagonal of square = 12√2 = side of triangle. Area = (√3/4)(12√2)² = (√3/4)(288) = 72√3 cm²." },
{ "n": 60, "q": "After giving a discount of 35%, there is a loss of 7.14%. If only 20% discount is given, then what will be the profit percentage?", "o": ["11.11", "12.5", "14.28", "16.66"], "ans": 2, "e": "Taking list price 100, SP = 65 at 7.14% loss gives CP ≈ 70. New SP = 80; profit% = (80 – 70)/70 × 100 = 14.28%." },
{ "n": 61, "q": "Marked price of an article is Rs 5000. It is purchased at a discount of 20%. If Rs 200 are spent on its repairs, then to gain 15% profit, what should be the selling price (in Rs)?", "o": ["4830", "4600", "5570", "5200"], "ans": 0, "e": "Purchase price = 5000 × 0.8 = 4000; total cost = 4200; SP = 4200 × 1.15 = 4830." },
{ "n": 62, "q": "120 is divided into two parts such that the seventh part of the first and the fifth part of the second are in the ratio 5 : 17. What will be the value of the second part?", "o": ["85", "68", "51", "35"], "ans": 0, "e": "(x/7)/((120–x)/5) = 5/17 ⇒ 17x = 7(120–x) ⇒ 24x = 840 ⇒ x = 35; second part = 120 – 35 = 85." },
{ "n": 63, "q": "Two numbers are in the ratio 5 : 7. If 15 is subtracted from both the numbers, the ratio becomes 2 : 3. What will be the sum of the two numbers?", "o": ["120", "150", "180", "140"], "ans": 2, "e": "(5x–15)/(7x–15) = 2/3 ⇒ x = 15; numbers are 75 and 105, sum = 180." },
{ "n": 64, "q": "Average of 15 consecutive numbers is 18. If each number is divided by 2, then what will be the new average?", "o": ["15", "9", "12", "18"], "ans": 1, "e": "Dividing every number by 2 divides the average by 2: 18/2 = 9." },
{ "n": 65, "q": "An article is purchased for Rs 7500 and sold for Rs 9375. What is the profit%?", "o": ["20", "18", "25", "27"], "ans": 2, "e": "Profit = 9375 – 7500 = 1875; profit% = 1875/7500 × 100 = 25%." },
{ "n": 66, "q": "An article is sold for Rs 8400 at a loss of 25%. What is the cost price (in Rs) of the article?", "o": ["14400", "12400", "11200", "10800"], "ans": 2, "e": "CP = 8400 × 100/(100 – 25) = 8400/0.75 = 11200." },
{ "n": 67, "q": "What is the value of [(20% of 120) + (25% of 48)] ÷ (4% of 25)?", "o": ["12", "48", "36", "24"], "ans": 2, "e": "(24 + 12) ÷ 1 = 36." },
{ "n": 68, "q": "What is the value of [(30% of 360) + (11% of 200)] ÷ (2% of 400)?", "o": ["16.5", "15.25", "14.75", "16.25"], "ans": 3, "e": "(108 + 22) ÷ 8 = 130/8 = 16.25." },
{ "n": 69, "q": "A train is moving at a speed of 72 km/h and covers a certain distance in 6 hours. If the same distance is to be covered in 8 hours, then what will be the speed (in km/h) of the train?", "o": ["45", "54", "63", "64"], "ans": 1, "e": "Distance = 72 × 6 = 432 km; speed = 432 / 8 = 54 km/h." },
{ "n": 70, "q": "Speed of a boat is 4 km/h in still water and the speed of the stream is 2 km/h. If the boat takes 8 hours to go to a place and come back, then what is the distance of the place?", "o": ["12", "9", "15", "18"], "ans": 0, "e": "Upstream = 2, downstream = 6 km/h. x/2 + x/6 = 8 ⇒ 4x/6 = 8 ⇒ x = 12 km." },
{ "n": 71, "q": "An amount invested at simple interest gives Rs 800 interest at 16% in 2 years. What is the principal (in Rs)?", "o": ["4000", "3500", "5000", "2500"], "ans": 3, "e": "P = SI × 100/(R × T) = 800 × 100/(16 × 2) = 2500." },
{ "n": 72, "q": "The bar chart shows the runs scored by a batsman in 10 different innings: I1=108, I2=65, I3=13, I4=113, I5=78, I6=109, I7=72, I8=57, I9=104, I10=106.\nIn how many innings has the batsman scored more than the average runs?", "o": ["5", "7", "6", "8"], "ans": 0, "e": "Average = 825/10 = 82.5. Innings above 82.5: I1, I4, I6, I9, I10 — 5 innings." },
{ "n": 73, "q": "The bar chart shows the runs scored by a batsman in 10 different innings: I1=108, I2=65, I3=13, I4=113, I5=78, I6=109, I7=72, I8=57, I9=104, I10=106.\nRuns scored in inning 1 is what percent of runs scored in inning 5?", "o": ["131.29%", "138.46%", "126.17%", "142.93%"], "ans": 1, "e": "108 / 78 × 100 = 138.46%." },
{ "n": 74, "q": "The bar chart shows the runs scored by a batsman in 10 different innings: I1=108, I2=65, I3=13, I4=113, I5=78, I6=109, I7=72, I8=57, I9=104, I10=106.\nWhat are the average runs per innings?", "o": ["78.5", "82.5", "80.6", "85"], "ans": 1, "e": "Total runs = 825; average = 825/10 = 82.5." },
{ "n": 75, "q": "The bar chart shows the runs scored by a batsman in 10 different innings: I1=108, I2=65, I3=13, I4=113, I5=78, I6=109, I7=72, I8=57, I9=104, I10=106.\nThe runs of the first 5 innings are added (S1) and the runs of the last 5 innings are added (S2). What is the value of S2 − S1?", "o": ["67", "68", "73", "71"], "ans": 3, "e": "S1 = 108+65+13+113+78 = 377; S2 = 109+72+57+104+106 = 448; S2 – S1 = 71." },
// ===================== GENERAL AWARENESS (Q76-100) =====================
{ "n": 76, "q": "Which of the following economic activities comes under the primary sector?\nI. Banking  II. Dairy  III. Transport", "o": ["Only I", "Only II", "Only III", "Both I and II"], "ans": 1, "e": "The primary sector exploits natural resources; of the given options only dairy belongs to it." },
{ "n": 77, "q": "Which of the following sectors is also called the service sector?", "o": ["Primary sector", "Secondary sector", "Tertiary sector", "Quaternary sector"], "ans": 2, "e": "The tertiary sector provides services, so it is also called the service sector." },
{ "n": 78, "q": "The Panchayati Raj system is divided into how many levels of governance?", "o": ["1", "2", "3", "4"], "ans": 2, "e": "Panchayati Raj is a three-tier system: Gram Panchayat, Panchayat Samiti and Zilla Panchayat." },
{ "n": 79, "q": "Name the fundamental right under which 'Freedom of speech' is practised.", "o": ["right to equality", "right to freedom", "cultural and educational rights", "rights to constitutional remedies"], "ans": 1, "e": "Freedom of speech and expression falls under the Right to Freedom." },
{ "n": 80, "q": "Who was the son of Bindusara?", "o": ["Ashoka", "Chandragupra", "Bimbisara", "Azaat Shatru"], "ans": 0, "e": "Bindusara was the son of Chandragupta and the father of Ashoka." },
{ "n": 81, "q": "Where did the Salt March end?", "o": ["Dandi", "Surat", "Ahmedabad", "Sabarmati"], "ans": 0, "e": "The Salt (Dandi) March ended at Dandi, where Gandhi broke the Salt Act on 6th April 1930." },
{ "n": 82, "q": "Which is the nearest star to Earth?", "o": ["Pole star", "Sun", "Dog star", "Sirius"], "ans": 1, "e": "The Sun is the nearest star to the Earth." },
{ "n": 83, "q": "Match the following.\nA. Large Scale map   B. Sketch   C. Plan\n1. Drawing drawn to scale   2. Gives more information   3. Drawing drawn without scale", "o": ["B-2, C-3, A-2", "A-2, B-3, C-1", "C-2, B-3, A-1", "C-2, B-1, A-3"], "ans": 1, "e": "A (Large Scale map) gives more information → 2; B (Sketch) is drawn without scale → 3; C (Plan) is drawn to scale → 1. So A-2, B-3, C-1." },
{ "n": 84, "q": "What is pollination?", "o": ["The transfer of pollen grains from anther to the stigma of a plant", "The germination of pollen grains", "Visiting of flowers by ants", "The growth of pollen tube in the ovule"], "ans": 0, "e": "Pollination is the transfer of pollen grains from the male anther to the female stigma of a flower." },
{ "n": 85, "q": "Name the blood cell which is found in abundance in the human body.", "o": ["red blood cells", "plasma", "blood proteins", "white blood cells"], "ans": 0, "e": "Red blood cells (erythrocytes) are the most abundant cells in the human body." },
{ "n": 86, "q": "Which part of the plant prepares food?", "o": ["leaves", "roots", "stem", "flowers"], "ans": 0, "e": "Leaves prepare food by the process of photosynthesis." },
{ "n": 87, "q": "Sound is produced by a body only if it ____.", "o": ["made of steel", "made of hollow wood", "made of strings", "vibrating"], "ans": 3, "e": "Sound is produced only when a body is vibrating." },
{ "n": 88, "q": "What constitutes current in a metal wire?", "o": ["electrons", "protons", "neutrons", "none of these"], "ans": 0, "e": "A continuous flow of electrons constitutes electric current in a metal." },
{ "n": 89, "q": "Which of the following is NOT a format of storing an image in a computer?", "o": [".bmp", ".png", ".jpg", "All are image formats"], "ans": 3, "e": ".bmp, .png and .jpg are all image formats, so the correct option is 'All are image formats'." },
{ "n": 90, "q": "Name the reducing agent used in the reaction to join railway tracks.", "o": ["aluminum", "nitrogen", "carbon", "carbon dioxide"], "ans": 0, "e": "Railway tracks are joined by the thermite (aluminothermy) reaction, which uses aluminium as the reducing agent." },
{ "n": 91, "q": "Which is the most abundant element in the universe?", "o": ["gold", "oxygen", "carbon", "hydrogen"], "ans": 3, "e": "Hydrogen is the most abundant element in the universe (about 75% of normal matter)." },
{ "n": 92, "q": "Which of the following is a part of the organic impurities of sewage?", "o": ["phosphate", "urea", "carbohydrate", "none of these"], "ans": 1, "e": "Urea (from animal and human waste) is an organic impurity present in sewage." },
{ "n": 93, "q": "Pradhan Mantri Mudra Yojana provides Mudra loans up to Rs ____ lakh.", "o": ["10", "5", "20", "50"], "ans": 0, "e": "The PMMY scheme provides Mudra loans up to Rs 10 lakh." },
{ "n": 94, "q": "Who gave the Raman's Effect?", "o": ["Galileo Galilei", "CV Raman", "Marie Curie", "none of these"], "ans": 1, "e": "Sir C. V. Raman gave the Raman Effect in 1928 and won the Nobel Prize in Physics in 1930." },
{ "n": 95, "q": "How many players are there in a basketball team?", "o": ["3", "4", "5", "6"], "ans": 2, "e": "A basketball team has five active players on the court." },
{ "n": 96, "q": "'Gitanjali' by Rabindranath Tagore is a collection of ____.", "o": ["novels", "plays", "poems", "short stories"], "ans": 2, "e": "'Gitanjali' is a collection of poems by Rabindranath Tagore, for which he won the Nobel Prize in 1913." },
{ "n": 97, "q": "Who among the following is NOT a recipient of the 'Bharat Ratna Award'?", "o": ["Nelson Mandela", "Rajiv Gandhi", "Sachin Tendulkar", "Major Dhyan Chand"], "ans": 3, "e": "Mandela, Rajiv Gandhi and Tendulkar received the Bharat Ratna; Major Dhyan Chand did not (he was given the Padma Bhushan)." },
{ "n": 98, "q": "Name the author of the book named 'Neither a Hawk nor a Dove'.", "o": ["Brian May", "David J Eicher", "Khurshid Mahmud Kasuri", "Kapil Ishapuri"], "ans": 2, "e": "'Neither a Hawk nor a Dove' was written by former Pakistani Foreign Minister Khurshid Mahmud Kasuri." },
{ "n": 99, "q": "How many countries of South Asia and South East Asia are members of BIMSTEC?", "o": ["5", "7", "11", "15"], "ans": 1, "e": "BIMSTEC has 7 member countries: India, Bhutan, Bangladesh, Myanmar, Thailand, Nepal and Sri Lanka." },
{ "n": 100, "q": "Which neighbouring country of India has become the first fully organic country of the world?", "o": ["Sri Lanka", "Bhutan", "Myanmar", "Maldive"], "ans": 1, "e": "Bhutan is set to become the world's first fully organic country in terms of farming practices." }
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

  const TEST_TITLE = 'SSC MTS (2017 Pattern) - 2017 (18 Sep) Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading figure images to Cloudinary)...');
  const questions = await buildQuestions();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 100,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2017, pyqShift: '18 Sep 2017 Shift-1', pyqExamName: 'SSC MTS', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
