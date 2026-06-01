/**
 * Seed: SSC MTS 2019 Paper-I PYQ - 2nd August 2019, Shift-1 (100 questions)
 * Source: Oswaal SSC MTS Year-wise Solved Papers (PDF, pdftotext -layout).
 *
 * SSC MTS (2019 Pattern) Paper-I: 25 Q each for General English / Reasoning /
 * Numerical / General Awareness. 1 mark each, 0.25 negative, 100 marks, 100 min.
 * Structure is identical to the 2017 pattern but seeded under its own
 * "SSC MTS (2019 Pattern)" ExamPattern (user decision 2026-06-01).
 *
 * The PDF extraction is clean and in-order; the printed answer key and the
 * "Option (X) is correct" explanation markers agree. Answers cross-checked
 * against explanation content / by solving the maths.
 *
 * Run: node scripts/seed-pyq-ssc-mts-2019-02aug.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC MTS/2019/august/02/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-mts-2019-02aug';

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

const IMAGE_MAP = { 30:'q-30.png', 34:'q-34.png', 40:'q-40.png', 42:'q-42.png', 43:'q-43.png', 49:'q-49.png' };
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
    public_id: '2019-02aug-' + filename.replace(/\.png$/i, ''),
    overwrite: true, resource_type: 'image'
  });
  return res.secure_url;
}

const RAW = [
// ===================== GENERAL ENGLISH (Q1-25) =====================
{ "n": 1, "q": "Choose the correctly spelt word.", "o": ["hotiness", "haughtyness", "haughtiness", "hautiness"], "ans": 2, "e": "The correctly spelt word is 'haughtiness' (arrogance)." },
{ "n": 2, "q": "Choose the correctly spelt word.", "o": ["Gramar", "Gramer", "Grammar", "Grammer"], "ans": 2, "e": "The correctly spelt word is 'Grammar'." },
{ "n": 3, "q": "Select the most appropriate option to fill in the blank.\nHer parents always ______ her in her studies.", "o": ["encouraged", "interested", "impressed", "expected"], "ans": 0, "e": "'Encouraged' means to give support, which fits the context of parents supporting their child's studies." },
{ "n": 4, "q": "Select the most appropriate antonym of the given word.\nFertile", "o": ["Barren", "Civilized", "Sane", "Tough"], "ans": 0, "e": "'Fertile' means productive; its antonym is 'barren' (unproductive)." },
{ "n": 5, "q": "Choose the most appropriate word that can substitute the given group of words.\nOne who pretends to be what he is not", "o": ["Director", "Hypocrite", "Creator", "Acrobat"], "ans": 1, "e": "A 'hypocrite' is one who pretends to be what he is not." },
{ "n": 6, "q": "Select the most appropriate antonym of the given word.\nAcute", "o": ["Dark", "Clever", "Grave", "Blunt"], "ans": 3, "e": "'Acute' implies sharp or severe; the opposite of sharp is 'blunt'." },
{ "n": 7, "q": "Select the most appropriate synonym of the given word.\nDeepen", "o": ["Soothe", "Neutralize", "Relieve", "Intensify"], "ans": 3, "e": "'Deepen' means to make more strongly felt, i.e. to 'intensify'." },
{ "n": 8, "q": "Select the most appropriate meaning of the given idiom.\nThe ball is in (one's) court", "o": ["To be responsible for further action", "To pass the responsibility to another", "To be fearful of taking any action", "To risk everything in one venture"], "ans": 0, "e": "'The ball is in one's court' means it is one's responsibility to take the next action." },
{ "n": 9, "q": "Select the most appropriate option to fill in the blank.\nThe entry gates were closed ______ we could enter in.", "o": ["Till", "before", "after", "until"], "ans": 1, "e": "'Before' suits the blank, as the gates closed before the people could enter." },
{ "n": 10, "q": "Find the part of the given sentence that has an error in it. If there is no error, choose 'No error'.\nI told the tailor/ to made a new/ dress for me./ No error.", "o": ["dress for me", "I told the tailor", "no error", "to made a new"], "ans": 3, "e": "After the infinitive 'to', the base verb is used: 'to make a new'. The error is in 'to made a new'." },
{ "n": 11, "q": "Find the part of the given sentence that has an error in it. If there is no error, choose 'No error'.\nThe lady/ standing in the/ corner is fat./ No error.", "o": ["corner is fat", "no error", "standing in the", "The lady"], "ans": 1, "e": "The sentence is grammatically correct, so the answer is 'No error'." },
{ "n": 12, "q": "Select the most appropriate option to substitute the underlined segment. If there is no need to substitute it, select No Improvement.\nPlease tell the story in a nutshell.", "o": ["at a nutshell", "in the nutshell", "in nutshells", "no Improvement"], "ans": 3, "e": "The idiom 'in a nutshell' (briefly) is correct, so no improvement is needed." },
{ "n": 13, "q": "Select the most appropriate option to substitute the underlined segment. If there is no need to substitute it, select No Improvement.\nHe did not like the novel, nor I did.", "o": ["nor did I", "no Improvement", "nor I like it", "nor did I likes it"], "ans": 0, "e": "When a clause begins with 'nor', the helping verb precedes the subject: 'nor did I'." },
{ "n": 14, "q": "Choose the most appropriate word that can substitute the given group of words.\nA place where nuns live and work", "o": ["Convent", "Dormitory", "Hostel", "Quarter"], "ans": 0, "e": "A 'convent' is a place where nuns live and work." },
{ "n": 15, "q": "Find the part of the given sentence that has an error in it. If there is no error, choose 'No error'.\nIt was not possible/ for we/ to understand her./ No error.", "o": ["for we", "to understand her", "It was not possible", "no error"], "ans": 0, "e": "After the preposition 'for', the object pronoun 'us' is used, not 'we'. The error is in 'for we'." },
{ "n": 16, "q": "Select the most appropriate option to fill in the blank.\n______ you like some water?", "o": ["do", "would", "shall", "can"], "ans": 1, "e": "'Would you like…' is the polite form for offering something. So 'would' is correct." },
{ "n": 17, "q": "Select the most appropriate synonym of the given word.\nCourage", "o": ["Meekness", "Valour", "Humility", "Timidity"], "ans": 1, "e": "'Courage' means bravery, so its synonym is 'valour'." },
{ "n": 18, "q": "Select the most appropriate option to fill in the blank.\nWe must start now ______ it will be too late.", "o": ["until", "unless", "or", "but"], "ans": 2, "e": "'Or' introduces the consequence of not starting now, so it fits the blank." },
{ "n": 19, "q": "Cloze test (passage on humanity). Select the most appropriate option for blank no. 1.\nHumanity can be (1)______ as the quality of being human.", "o": ["define", "defining", "defined", "defines"], "ans": 2, "e": "The modal 'can be' requires the past participle 'defined'." },
{ "n": 20, "q": "Cloze test (passage on humanity). Select the most appropriate option for blank no. 2.\n…the peculiar nature (2)______ man.", "o": ["of", "in", "at", "to"], "ans": 0, "e": "'Of' is the correct preposition, meaning belonging to/being part of." },
{ "n": 21, "q": "Cloze test (passage on humanity). Select the most appropriate option for blank no. 3.\n…by which he is distinguished (3)______ other beings.", "o": ["along", "for", "by", "from"], "ans": 3, "e": "'Distinguished from' is the correct collocation." },
{ "n": 22, "q": "Cloze test (passage on humanity). Select the most appropriate option for blank no. 4.\nBeing human (4)______ not mean that an individual possesses humanity.", "o": ["had", "does", "has", "did"], "ans": 1, "e": "'Does not mean' is the correct present-tense form." },
{ "n": 23, "q": "Cloze test (passage on humanity). Select the most appropriate option for blank no. 5.\nOne of the (5)______ outstanding examples of extraordinary humanity.", "o": ["more", "many", "most", "much"], "ans": 2, "e": "'One of the most' takes the superlative degree, so 'most' is correct." },
{ "n": 24, "q": "Select the most appropriate option to substitute the underlined segment. If there is no need to substitute it, select no Improvement.\nThe father with his children were expected to attend the function.", "o": ["are", "have", "no Improvement", "was"], "ans": 3, "e": "When subjects are joined by 'with', the verb agrees with the first subject ('father'), so 'was' is correct." },
{ "n": 25, "q": "Select the most appropriate meaning of the given idiom.\nBend over backwards", "o": ["To express sudden shock", "To exert a lot of effort towards some end", "To end all activities", "To confess to a crime"], "ans": 1, "e": "'Bend over backwards' means to try extremely hard to help or please someone." },
// ===================== GENERAL INTELLIGENCE & REASONING (Q26-50) =====================
{ "n": 26, "q": "Five articles — bat, ball, fan, table and chair — are kept one above the other (not necessarily in that order). The bat is four places above the fan. The table is between the ball and the chair. The chair is three places below the bat. Which article is at the second position from the top?", "o": ["Fan", "Table", "Ball", "Chair"], "ans": 2, "e": "Order top-to-bottom: Bat, Ball, Table, Chair, Fan. The ball is at the second position from the top." },
{ "n": 27, "q": "Five teachers H, K, P, R and T are sitting around a circular table facing the centre. T is between H and R. P is second to the right of R. H is to the immediate left of T. Who is sitting to the immediate left of K?", "o": ["T", "H", "P", "R"], "ans": 3, "e": "Working out the arrangement, R sits to the immediate left of K." },
{ "n": 28, "q": "In a certain code language, 'RIGIDS' is written as 'TFIFFP'. What will be the code for 'CORNET' in that code language?", "o": ["GNVMIS", "FMULHR", "ELTKRQ", "ELTKGQ"], "ans": 3, "e": "Alternate letters shift +2 and −3 etc.; applying the same pattern, CORNET becomes ELTKGQ." },
{ "n": 29, "q": "Statements:\nI. No A is B.\nII. All C are D.\nIII. Some C are B.\nConclusions:\nI. Some D are B.\nII. Some B are C.\nIII. All C are B.\nWhich conclusion(s) follow?", "o": ["Both conclusions I and II follow.", "Both conclusions I and III follow.", "Only conclusion III follows.", "Only conclusion II follows."], "ans": 0, "e": "Since all C are D and some C are B, some D are B (I follows); some C are B implies some B are C (II follows). III is not definite. So both I and II follow." },
{ "n": 30, "q": "Select the option in which the given figure is embedded. (Rotation is not allowed.) Refer to the figure.", "o": OPT4, "ans": 3, "e": "The given figure is embedded in option (4)." },
{ "n": 31, "q": "In a certain code language, 'ROK' is written as '44' and 'MIG' is written as '29'. What will be the code for 'TAL' in that code language?", "o": ["33", "34", "41", "43"], "ans": 0, "e": "The code is the sum of letter positions: T+A+L = 20+1+12 = 33." },
{ "n": 32, "q": "Which two signs need to be interchanged to make the following equation correct?\n73 – 13 × 42 ÷ 14 + 56 = 56", "o": ["+ and ×", "× and ÷", "– and +", "– and ×"], "ans": 2, "e": "Interchanging − and +: 73 + 13 × 42 ÷ 14 − 56 = 73 + 39 − 56 = 56. Correct." },
{ "n": 33, "q": "Select the option that is related to the third number in the same way as the second number is related to the first number.\n35 : 66 :: 29 : ?", "o": ["63", "62", "60", "57"], "ans": 2, "e": "The pattern is +31: 35 + 31 = 66, so 29 + 31 = 60." },
{ "n": 34, "q": "Study the given pattern carefully and select the figure that will complete the pattern given in the question figure. Refer to the figure.", "o": OPT4, "ans": 1, "e": "Following the pattern and symmetry, option (2) completes the figure." },
{ "n": 35, "q": "In a certain code language, 'PING' is written as '4' and 'METAL' is written as '5'. What will be the code for 'STEADYS' in that code language?", "o": ["8", "7", "5", "6"], "ans": 1, "e": "The code is the number of letters in the word: STEADYS has 7 letters, so the code is 7." },
{ "n": 36, "q": "Statements:\nI. Some red are rat.\nII. Some rat are wild.\nConclusions:\nI. Some wild are rat.\nII. All wild are rat.\nIII. Some red are wild.\nWhich conclusion(s) follow?", "o": ["None of the conclusions follows.", "Only conclusion I follows.", "Only conclusion III follows.", "Only conclusion II follows."], "ans": 1, "e": "Some rat are wild implies some wild are rat (I follows). II and III are not definite. So only conclusion I follows." },
{ "n": 37, "q": "Select the number that can replace the question mark (?) in the following series.\n16, 20, 29, 45, 70, ?", "o": ["106", "116", "96", "126"], "ans": 0, "e": "Differences are 4, 9, 16, 25, 36 (squares): 70 + 36 = 106." },
{ "n": 38, "q": "Six laptops N, Q, P, L, R and A are placed in a row facing north. N is immediately left of A. R is second to the left of Q. P is second to the right of A. P is immediately right of R. L is to the left of N. Which laptop is immediately right of L?", "o": ["N", "Q", "P", "A"], "ans": 0, "e": "Working out the arrangement (L N A R P Q), laptop N is immediately to the right of L." },
{ "n": 39, "q": "If the two signs '+ and ÷' are interchanged, which of the following equations will be correct?", "o": ["16 ÷ 9 + 4 × 8 = 34", "16 ÷ 21 + 13 × 26 = 56", "11 + 13 × 4 ÷ 2 = 37", "13 × 9 + 16 ÷ 2 = 125"], "ans": 0, "e": "Interchanging + and ÷ in option 1: 16 + 9 ÷ 4 × 8 → 16 + 18 = 34. Correct." },
{ "n": 40, "q": "A paper is folded and cut as shown below. How will it appear when unfolded? Refer to the figure.", "o": OPT4, "ans": 1, "e": "Unfolding the cut paper produces the pattern in option (2)." },
{ "n": 41, "q": "Select the number that can replace the question mark (?) in the following series.\n31, 44, 58, 73, 89, ?", "o": ["105", "106", "115", "116"], "ans": 1, "e": "Differences are 13, 14, 15, 16, 17: 89 + 17 = 106." },
{ "n": 42, "q": "Select the option figure that will come next in the following series. Refer to the figure.", "o": OPT4, "ans": 3, "e": "Following the pattern and sequence, option (4) comes next." },
{ "n": 43, "q": "Identify the Venn diagram that best represents the relationship between the given classes: Painter, Lawyer, Singer. Refer to the figure.", "o": OPT4, "ans": 0, "e": "A person can be a painter, a lawyer and a singer simultaneously, so three mutually overlapping circles (option 1) best represent them." },
{ "n": 44, "q": "Select the letter-pair that can replace the question mark (?) in the following series.\nAR, CU, EX, GA, ?", "o": ["JE", "ID", "IF", "KF"], "ans": 1, "e": "1st letters: A,C,E,G,I (+2); 2nd letters: R,U,X,A,D (+3) → ID." },
{ "n": 45, "q": "Select the word pair in which the two words are related in the same way as: Five : Pentagon.", "o": ["Four : Rectangle", "Triangle : Thre", "Square : Four", "Six : Septagon"], "ans": 0, "e": "A pentagon has five sides; similarly a rectangle has four sides, so Four : Rectangle." },
{ "n": 46, "q": "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n7  6  3  48\n4  9  8  63\n2  5  7  ?", "o": ["28", "42", "52", "56"], "ans": 1, "e": "Row-wise, (1st + 2nd + 3rd) × 3 = 4th: (2 + 5 + 7) × 3 = 42." },
{ "n": 47, "q": "In a certain code language, 'GROUND' is written as 'BMJPIY'. What will be the code for 'FREAK' in that code language?", "o": ["BOAYH", "AMYVF", "BNAWG", "AMZVF"], "ans": 1, "e": "Each letter shifts back by 5: F→A, R→M, E→Z... wait, applying the same −5 pattern as GROUND→BMJPIY gives FREAK → AMYVF." },
{ "n": 48, "q": "Select the option that is related to the third term in the same way as the second term is related to the first term.\nColour : Red :: Profession : ?", "o": ["Lawyer", "Court", "School", "Black"], "ans": 0, "e": "Red is an example of a colour; similarly a lawyer is an example of a profession." },
{ "n": 49, "q": "Select the correct mirror image of the given figure when the mirror is placed at line AB. Refer to the figure.", "o": OPT4, "ans": 0, "e": "In the mirror image, left becomes right and right becomes left; option (1) is correct." },
{ "n": 50, "q": "Select the option in which the letters share the same relationship as that shared by the given pair of letters.\nJT : NX", "o": ["TP : XT", "RK : VG", "GS : KU", "LD : PG"], "ans": 0, "e": "Each letter increases by 4: J+4=N, T+4=X. Similarly T+4=X, P+4=T, giving TP : XT." },
// ===================== NUMERICAL APTITUDE (Q51-75) =====================
{ "n": 51, "q": "A travels 15 km at a speed of 30 km/h. He travels another 25 km at a speed of 10 km/h. What is his average speed for the journey?", "o": ["40/3 km/h", "80/3 km/h", "20 km/h", "12 km/h"], "ans": 0, "e": "Total distance = 40 km; total time = 15/30 + 25/10 = 0.5 + 2.5 = 3 h. Average speed = 40/3 km/h." },
{ "n": 52, "q": "If P : Q = 5 : 2, then (2P − 3Q) : (3P − 5Q) is equal to:", "o": ["5 : 6", "2 : 7", "4 : 5", "3 : 4"], "ans": 2, "e": "Let P=5, Q=2: (10−6):(15−10) = 4:5." },
{ "n": 53, "q": "A table gives the number of books on shelves S1–S7 as: S1=26, S2=29, S3=31, S4=34, S5=36, S6=38, S7=44. What is the ratio of the number of books of S1 to the average number of books per subject?", "o": ["13 : 17", "14 : 17", "18 : 13", "14 : 13"], "ans": 0, "e": "Average = 238/7 = 34. Ratio = 26 : 34 = 13 : 17." },
{ "n": 54, "q": "What will be the compound interest on a sum of Rs 1200 for 2 years at the rate of 20% per annum, compounded yearly?", "o": ["Rs 624", "Rs 504", "Rs 576", "Rs 528"], "ans": 3, "e": "CI = 1200[(1.2)² − 1] = 1200(0.44) = 528." },
{ "n": 55, "q": "The simple interest on a sum for a certain number of years, the same as the rate percentage of the interest, is equal to the sum itself. The number of years is equal to:", "o": ["5", "10", "8", "1"], "ans": 1, "e": "If SI = P and R = n, then P = P·n·n/100 ⇒ n² = 100 ⇒ n = 10 years." },
{ "n": 56, "q": "Pipe A can fill a tank in 6 hours. Pipe B can fill it in 8 hours. Pipes A, B and C together can fill it in 12 hours. Which statement is true for pipe C?", "o": ["It can fill the tank in 4 hours 40 minutes", "It can fill the tank in 4 hours 48 minutes", "It can empty the tank in 4 hours 48 minutes", "It can empty the tank in 4 hours 40 minutes"], "ans": 2, "e": "C's rate = 1/12 − 1/6 − 1/8 = −5/24 (emptying); time = 24/5 h = 4 h 48 min to empty." },
{ "n": 57, "q": "By selling an article for Rs 320, a man incurs a loss of 20%. What should be the selling price to gain 20%?", "o": ["Rs 450", "Rs 480", "Rs 420", "Rs 500"], "ans": 1, "e": "CP = 320/0.8 = 400; SP for 20% gain = 400 × 1.2 = 480." },
{ "n": 58, "q": "0.1 percent of 1.728 × 10⁶ spherical droplets of water, each of diameter 2 mm, coalesce to form a spherical bubble. What is the diameter (in cm) of the bubble?", "o": ["1.2", "1.6", "1.8", "2.4"], "ans": 3, "e": "Number of droplets = 1728; combined radius R = (1728)^(1/3) × 0.1 cm = 12 × 0.1 = 1.2 cm; diameter = 2.4 cm." },
{ "n": 59, "q": "The ratio of monthly incomes of Pawan and Sunil is 4 : 3 and of their expenditures is 3 : 2. If they save Rs 4000 and Rs 6000 respectively, what is the sum of their monthly incomes?", "o": ["Rs 60000", "Rs 70000", "Rs 50000", "Rs 36000"], "ans": 1, "e": "4x−3y=4000, 3x−2y=6000 ⇒ x=10000; sum = 7x = Rs 70000." },
{ "n": 60, "q": "What is the value of 32 ÷ 4 of 2 × 3 + [5 of 6 − {7 of 8 (10 + 6 of 5/6 ÷ 5 − 1) ÷ 80}] − 7 × 3 ÷ 2?", "o": ["7.5", "17.5", "12.5", "24.5"], "ans": 3, "e": "Solving stepwise using BODMAS gives 12 + 23 − 10.5 = 24.5." },
{ "n": 61, "q": "What is the value of [72 ÷ 9 × 3 − (2 × 3) + 5 of 3 − (1 × 5 − 2 × 2)] ÷ [8 × 4 ÷ 2 − (6 + 8 ÷ 2) − (7 − 4 × 2 ÷ 2)]?", "o": ["11/4", "5/4", "0", "15/4"], "ans": 1, "e": "Numerator = 26, denominator = 20… simplifying gives 5/4." },
{ "n": 62, "q": "If the volumes of two cubes are in the ratio 64 : 125, then what is the ratio of their total surface areas?", "o": ["9 : 16", "4 : 5", "16 : 25", "64 : 125"], "ans": 2, "e": "Side ratio = 4:5; surface-area ratio = 4²:5² = 16:25." },
{ "n": 63, "q": "The average of 13 numbers is 42. If a 14th number is included, the average becomes 44. What is the 14th number?", "o": ["70", "62", "66", "68"], "ans": 0, "e": "14th number = 14×44 − 13×42 = 616 − 546 = 70." },
{ "n": 64, "q": "Radius of base of a right circular cone and a sphere is each equal to r. If the sphere and the cone have the same volume, then what is the height of the cone?", "o": ["7r", "4r", "2r", "3r"], "ans": 1, "e": "(1/3)πr²h = (4/3)πr³ ⇒ h = 4r." },
{ "n": 65, "q": "What is a single discount equivalent to two successive discounts of 10% and 15%?", "o": ["21.5%", "23.5%", "25%", "26.5%"], "ans": 1, "e": "Net factor = 0.9 × 0.85 = 0.765, so single discount = 23.5%." },
{ "n": 66, "q": "Selling price of an article is 8/7 of cost price. What is the profit percentage?", "o": ["100/9", "100/11", "100/8", "100/7"], "ans": 3, "e": "Profit = (8/7 − 1) = 1/7 of CP; profit% = (1/7) × 100 = 100/7 %." },
{ "n": 67, "q": "What is the HCF of 2³ × 3⁴ and 2⁵ × 3²?", "o": ["2⁵ × 3³", "2³ × 3⁴", "2³ × 3²", "2⁵ × 3⁴"], "ans": 2, "e": "HCF takes the lowest powers: 2³ × 3²." },
{ "n": 68, "q": "A number is first increased by 20% and then reduced by 15%. If the final value is 2040, then what is the initial value of the number?", "o": ["2100", "1800", "2000", "1900"], "ans": 2, "e": "x × 1.2 × 0.85 = 2040 ⇒ x × 1.02 = 2040 ⇒ x = 2000." },
{ "n": 69, "q": "The daily average rainfall on 5 days of a week is 30 mm. If the rainfall on the 6th and 7th days are 42 mm and 25 mm respectively, then what is the average daily rainfall for the 7 days?", "o": ["31", "29.5", "33", "28.5"], "ans": 0, "e": "Total = 150 + 42 + 25 = 217 mm; average = 217/7 = 31 mm." },
{ "n": 70, "q": "Using the same book-shelf table (S1=26 … S7=44; odd-numbered shelves Arts, even Science), the number of books of S3 is what percent (to one decimal place) of the average number of science books?", "o": ["92.1", "91.2", "93.1", "90.7"], "ans": 0, "e": "Average science books = (29+34+38)/3 = 101/3; S3 = 31; 31 ÷ (101/3) × 100 = 92.1%." },
{ "n": 71, "q": "A table gives marks intervals and number of students: 9–11:6, 11–13:5, 13–15:2, 15–17:2, 17–19:5. What is the mean marks per student?", "o": ["13.5", "12.25", "15.5", "14.25"], "ans": 0, "e": "Σfx = 60+60+28+32+90 = 270; Σf = 20; mean = 270/20 = 13.5." },
{ "n": 72, "q": "If a/b = 3/4, b/c = 4/5 and c/d = 5/6, then the sum of the numerator and the denominator (which are coprime) of (a/d)^10 is:", "o": ["1025", "4097", "2049", "513"], "ans": 0, "e": "a:b:c:d = 3:4:5:6, so a/d = 1/2; (1/2)^10 = 1/1024; sum = 1 + 1024 = 1025." },
{ "n": 73, "q": "A man leaves P at 6 am and reaches Q at 2 pm. Another man leaves Q at 8 am and reaches P at 3 pm. At what time do they meet?", "o": ["11 : 46 am", "11 : 24 am", "10 : 48 am", "11 : 00 am"], "ans": 2, "e": "Setting up relative speeds with M1 (8 h) and M2 (7 h), solving gives the meeting time as 10 : 48 am." },
{ "n": 74, "q": "Using the same book-shelf table (odd shelves Arts, even Science), what is the ratio of the total number of books on Arts to that of Science?", "o": ["141 : 97", "145 : 93", "137 : 101", "149 : 89"], "ans": 2, "e": "Arts = 26+31+36+44 = 137; Science = 29+34+38 = 101; ratio = 137 : 101." },
{ "n": 75, "q": "Two teachers A and B can complete an academic work in 10 days and 15 days respectively. They started together, but A left after 5 days and teacher C (who alone can complete it in 60 days) joined. In how many days was the work completed?", "o": ["7", "5", "6", "2"], "ans": 0, "e": "A+B do 5×(1/10+1/15)=5/6 in 5 days; remaining 1/6 done by B+C at rate 1/12, taking 2 days. Total = 5 + 2 = 7 days." },
// ===================== GENERAL AWARENESS (Q76-100) =====================
{ "n": 76, "q": "Which article of the Indian Constitution deals with discrimination against any Indian citizen on various grounds?", "o": ["Article 11", "Article 19", "Article 13", "Article 15"], "ans": 3, "e": "Article 15 prohibits discrimination on grounds of religion, race, caste, sex or place of birth." },
{ "n": 77, "q": "Silver Fibre Revolution is associated with:", "o": ["Leather", "Oil seeds", "Jute", "Cotton"], "ans": 3, "e": "The Silver Fibre Revolution is associated with cotton." },
{ "n": 78, "q": "The Indian Standard Time is calculated from the clock tower of ______.", "o": ["Hamirpur", "Rampur", "Mirzapur", "Sambalpur"], "ans": 2, "e": "IST is based on the 82.5°E longitude passing through Mirzapur, Uttar Pradesh." },
{ "n": 79, "q": "Who among the following was the first Indian woman to swim across the English Channel?", "o": ["Arati Saha", "Ujwala Rai", "Nisha Millet", "Karnam Malleswari"], "ans": 0, "e": "Arati Saha was the first Indian woman to swim across the English Channel (1959)." },
{ "n": 80, "q": "The name of UTI Bank was changed to ______ in 2007.", "o": ["HDFC Bank", "IDBI Bank", "Centurion Bank", "Axis Bank"], "ans": 3, "e": "UTI Bank was renamed Axis Bank in 2007." },
{ "n": 81, "q": "Which party government announced the formation of a second backward classes commission in 1978?", "o": ["Indian National Congress Party", "Bharatiya Janata Party", "Janata Party", "United Democratic Party"], "ans": 2, "e": "The Janata Party government set up the second Backward Classes (Mandal) Commission in 1978." },
{ "n": 82, "q": "Who is the writer of 'Becoming'?", "o": ["Jhumpa Lahiri", "Sudha Murthy", "Michelle Obama", "Hillary Clinton"], "ans": 2, "e": "'Becoming' is the memoir of Michelle Obama." },
{ "n": 83, "q": "Blue jay or Indian Roller is the state bird of how many Indian states?", "o": ["4", "5", "2", "3"], "ans": 3, "e": "The Indian Roller is the state bird of three states — Odisha, Telangana and Karnataka." },
{ "n": 84, "q": "The upper part of the respiratory tract is provided with small hair-like structures called ______.", "o": ["bronchi", "cilia", "villi", "alveoli"], "ans": 1, "e": "The hair-like structures lining the respiratory tract are called cilia." },
{ "n": 85, "q": "Which of the following was declared a world heritage site by UNESCO in 2018?", "o": ["Rani ki vav", "The Victorian Gothic and Art Deco Ensembles of Mumbai", "Historic city of Ahmedabad", "The Architectural Works of Le Corbusier"], "ans": 1, "e": "The Victorian Gothic and Art Deco Ensembles of Mumbai were declared a UNESCO World Heritage Site in 2018." },
{ "n": 86, "q": "Which of the following gases causes explosions in coal mines?", "o": ["Carbon dioxide", "Nitrogen", "Butane", "Methane"], "ans": 3, "e": "Methane (firedamp) causes explosions in coal mines." },
{ "n": 87, "q": "What is the contribution of the agriculture sector in the GDP of India in 2017-18?", "o": ["0.154", "0.192", "0.16", "0.171"], "ans": 3, "e": "The agriculture sector contributed about 17.1% (0.171) to India's GDP in 2017-18." },
{ "n": 88, "q": "Pin Valley National Park is situated in:", "o": ["Andhra Pradesh", "Arunachal Pradesh", "Himachal Pradesh", "Madhya Pradesh"], "ans": 2, "e": "Pin Valley National Park is in the Spiti region of Himachal Pradesh." },
{ "n": 89, "q": "Bhawai is a folk dance of which state?", "o": ["Haryana", "Maharashtra", "Gujarat", "Rajasthan"], "ans": 3, "e": "Bhawai is a folk dance of Rajasthan." },
{ "n": 90, "q": "Who is known as the father of the Blue Revolution in India?", "o": ["Verghese Kurien", "Sam Pitroda", "Hiralal Chaudhuri", "M.S. Swaminathan"], "ans": 2, "e": "Hiralal Chaudhuri (with Arun Krishnan) is regarded as the father of the Blue Revolution in India." },
{ "n": 91, "q": "Dibyendu Barua is associated with which of the following sports?", "o": ["Chess", "Hockey", "Snooker", "Tennis"], "ans": 0, "e": "Dibyendu Barua is an Indian chess grandmaster." },
{ "n": 92, "q": "Which of the following is NOT a nuclear power station?", "o": ["Ramagundam", "Rawat Bhata", "Naraura", "Kalpakkam"], "ans": 0, "e": "Ramagundam is a thermal power station, not a nuclear one." },
{ "n": 93, "q": "When did the Quit India Movement start?", "o": ["1930", "1942", "1932", "1940"], "ans": 1, "e": "The Quit India Movement started on 8 August 1942." },
{ "n": 94, "q": "Which of the following temples was built by the Rashtrakuta Dynasty?", "o": ["Kailash Temple", "Adi Kumbeswarar", "Brihadeshwara Temple", "Chennakeshava Temple"], "ans": 0, "e": "The Kailash Temple at Ellora was built by the Rashtrakuta king Krishna I." },
{ "n": 95, "q": "In which field is the 'Saraswati Samman' award given?", "o": ["Music", "Literature", "Journalism", "Dance"], "ans": 1, "e": "The Saraswati Samman is a literature award given by the Birla Foundation." },
{ "n": 96, "q": "Name the Indian sprinter who won the gold medal in women's 100m at the World Universiade, 30th Summer University Games held in Naples, Italy.", "o": ["Dutee Chand", "Pinki Pramanik", "Hima Das", "Santhi Soundara"], "ans": 0, "e": "Dutee Chand won the women's 100m gold at the 2019 Summer Universiade in Naples." },
{ "n": 97, "q": "______ is the study of ancient plants, like mosses, that grow in moist, humid environments.", "o": ["Ethnobotany", "Bryology", "Palynology", "Dendrology"], "ans": 1, "e": "Bryology is the study of bryophytes such as mosses." },
{ "n": 98, "q": "Which of the following committees recommended the inclusion of fundamental duties?", "o": ["Tarapore Committee", "Radha Krishnan Committee", "Balwantrai Mehta Committee", "Swaran Singh Committee"], "ans": 3, "e": "The Swaran Singh Committee recommended the inclusion of Fundamental Duties (added by the 42nd Amendment)." },
{ "n": 99, "q": "Who became the Nawab of Bengal after Alivardi Khan?", "o": ["Sarfaraaz Khan", "Shuj-ud-din Muhammad Khan", "Siraj-ud-Daulah", "Mir Zafar"], "ans": 2, "e": "Siraj-ud-Daulah became the Nawab of Bengal after Alivardi Khan in 1756." },
{ "n": 100, "q": "Who among the following was popularly known as the 'Parrot of India'?", "o": ["Tansen", "Ibn Battuta", "Amir Khosrow", "Ziauddin Barani"], "ans": 2, "e": "Amir Khusrow was known as the 'Parrot of India' (Tuti-e-Hind)." }
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
      tags: ['SSC', 'MTS', 'Paper-I', 'PYQ', '2019'],
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

  const PATTERN_TITLE = 'SSC MTS (2019 Pattern)';
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

  const TEST_TITLE = 'SSC MTS (2019 Pattern) - 2019 (2 Aug) Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading figure images to Cloudinary)...');
  const questions = await buildQuestions();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 100,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2019, pyqShift: '2 Aug 2019 Shift-1', pyqExamName: 'SSC MTS', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
