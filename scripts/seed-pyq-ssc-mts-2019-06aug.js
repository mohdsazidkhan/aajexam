/**
 * Seed: SSC MTS 2019 Paper-I PYQ - 6th August 2019, Shift-3 (100 questions)
 * Source: Oswaal SSC MTS Year-wise Solved Papers (PDF, pdftotext -layout).
 *
 * SSC MTS (2019 Pattern) Paper-I: 25 Q each (English / Reasoning / Numerical /
 * GA). 1 mark each, 0.25 negative, 100 marks, 100 min. Clean PDF; key and
 * explanation markers agree.
 *
 * The same pie chart serves Q65/Q68/Q70 (motor-cycle colours: Blue 21%, Red 12%,
 * White 18%, Black 13%, Yellow 17%, Grey 19%) — transcribed into the question
 * text rather than attached as an image.
 *
 * Run: node scripts/seed-pyq-ssc-mts-2019-06aug.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC MTS/2019/august/06/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-mts-2019-06aug';

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

const IMAGE_MAP = { 32:'q-32.png', 34:'q-34.png', 35:'q-35.png', 39:'q-39.png', 44:'q-44.png', 46:'q-46.png' };
const OPT4 = ['Option (1)', 'Option (2)', 'Option (3)', 'Option (4)'];
const PIE = "\n[Pie chart of motor cycles by colour: Blue 21%, Red 12%, White 18%, Black 13%, Yellow 17%, Grey 19%.]";

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
    public_id: '2019-06aug-' + filename.replace(/\.png$/i, ''),
    overwrite: true, resource_type: 'image'
  });
  return res.secure_url;
}

const RAW = [
// ===================== GENERAL ENGLISH (Q1-25) =====================
{ "n": 1, "q": "Select the most appropriate option to substitute the underlined segment. If there is no need to substitute it, select No Improvement.\nLuckily we have got the few minutes to spare.", "o": ["no Improvement", "a little", "quite few", "a few"], "ans": 3, "e": "'A few minutes' (some minutes) is correct; 'the few minutes' is wrong here." },
{ "n": 2, "q": "Select the most appropriate meaning of the given idiom.\nTo pick up the threads", "o": ["To examine an issue seriously", "Being received very warmly", "To restart from the previous closing point", "At a short distance"], "ans": 2, "e": "'To pick up the threads' means to restart something after an interruption." },
{ "n": 3, "q": "Find the part of the given sentence that has an error in it. If there is no error, choose 'No error'.\nHe has deposits/ all his money/ in banks./ No error.", "o": ["no error", "all his money", "he has deposits", "money in banks"], "ans": 2, "e": "After 'has', the past participle is required: 'has deposited', not 'has deposits'." },
{ "n": 4, "q": "Select the most appropriate synonym of the given word.\nProfuse", "o": ["Thrifty", "Sparse", "Aplenty", "Scarce"], "ans": 2, "e": "'Profuse' means in abundance, so its synonym is 'aplenty'." },
{ "n": 5, "q": "Find the part of the given sentence that has an error in it. If there is no error, choose 'No error'.\nHer relatives were/ presented at the station/ to see her off./ No error.", "o": ["to see her off", "her relatives were", "presented at the station", "no error"], "ans": 2, "e": "'Present' (available) should be used, not 'presented'. The error is in 'presented at the station'." },
{ "n": 6, "q": "Choose the correctly spelt word.", "o": ["Noticeable", "Noticable", "Nauticable", "Noteceable"], "ans": 0, "e": "'Noticeable' is the correctly spelt word." },
{ "n": 7, "q": "Select the most appropriate option to fill in the blank.\nYour answer book will be ______ by a computer.", "o": ["evaluated", "submitted", "replied", "tested"], "ans": 0, "e": "'Evaluated' (judged/checked) fits, as the answer book is being assessed by a computer." },
{ "n": 8, "q": "Select the most appropriate option to substitute the underlined segment. If there is no need to substitute it, select No Improvement.\nFriends stand by each other on time of need.", "o": ["for time", "in times", "no Improvement", "of times"], "ans": 1, "e": "The idiom is 'in times of need', so 'in times' is correct." },
{ "n": 9, "q": "Select the most appropriate option to fill in the blank.\nHe is addicted to alcohol and exerts a bad influence ______ his family.", "o": ["for", "on", "about", "in"], "ans": 1, "e": "'Exert influence on' is the correct collocation." },
{ "n": 10, "q": "Choose the most appropriate word that can substitute the given group of words.\nKilling of pests", "o": ["Herbicide", "Suicide", "Pesticide", "Patricide"], "ans": 2, "e": "A 'pesticide' is a substance for killing pests." },
{ "n": 11, "q": "Choose the most appropriate word that can substitute the given group of words.\nA group of ships", "o": ["Fleet", "Bevy", "Suite", "Army"], "ans": 0, "e": "A group of ships is called a 'fleet'." },
{ "n": 12, "q": "Select the most appropriate antonym of the given word.\nRelaxed", "o": ["Calm", "Arrogant", "Peaceful", "Tense"], "ans": 3, "e": "'Relaxed' means calm/stress-free; its antonym is 'tense'." },
{ "n": 13, "q": "Select the most appropriate option to substitute the underlined segment. If there is no need to substitute it, select No Improvement.\nIn his coming film the Spider-Man will be seen in European cities.", "o": ["was seen", "no Improvement", "has seen", "had been seen"], "ans": 1, "e": "The sentence refers to a future action ('coming film'), so 'will be seen' is correct — no improvement needed." },
{ "n": 14, "q": "Select the most appropriate meaning of the given idiom.\nSail in the same boat", "o": ["pay a very low price for something", "be in the same situation as others", "be in heavy debt", "go for a boat ride"], "ans": 1, "e": "'Sail in the same boat' means to be in the same (difficult) situation as others." },
{ "n": 15, "q": "Choose the correctly spelt word.", "o": ["Pasenger", "Passinger", "Passengger", "Passenger"], "ans": 3, "e": "'Passenger' is the correctly spelt word." },
{ "n": 16, "q": "Find the part of the given sentence that has an error in it. If there is no error, choose 'No error'.\nHe went up to her/ and asks her why/ she had insulted him./ No error.", "o": ["he went up to her", "No error", "she had insulted him", "and asks her why"], "ans": 3, "e": "The sentence is in the past tense, so 'asks' should be 'asked'. The error is in 'and asks her why'." },
{ "n": 17, "q": "Select the most appropriate option to fill in the blank.\nRaja ______ the house before Hari got there.", "o": ["left", "had left", "will leave", "leaves"], "ans": 1, "e": "The earlier of two past events takes the past perfect: 'had left'." },
{ "n": 18, "q": "Select the most appropriate synonym of the given word.\nRectify", "o": ["Raid", "Bend", "Folly", "Amend"], "ans": 3, "e": "'Rectify' means to correct, so its synonym is 'amend'." },
{ "n": 19, "q": "Select the most appropriate option to fill in the blank.\nThe teacher was very ______ in his subject.", "o": ["top", "master", "proficient", "best"], "ans": 2, "e": "'Proficient' (skilled) fits the blank to describe the teacher." },
{ "n": 20, "q": "Select the most appropriate antonym of the given word.\nSteep", "o": ["Flat", "Shallow", "Rough", "Narrow"], "ans": 0, "e": "'Steep' means rising sharply; its antonym is 'flat'." },
{ "n": 21, "q": "Cloze test (passage on Thane Municipal Transport). Select the most appropriate option for blank No. 1.\nThe TMT has seen a 6% drop 1.____ passenger density.", "o": ["in", "of", "on", "from"], "ans": 0, "e": "'Drop in' is the correct phrase for a reduction in something." },
{ "n": 22, "q": "Cloze test (passage on Thane Municipal Transport). Select the most appropriate option for blank No. 2.\n…after the BEST reduced 2.____ bus fares.", "o": ["his", "its", "it's", "her"], "ans": 1, "e": "BEST is a non-gendered entity, so the possessive 'its' is correct." },
{ "n": 23, "q": "Cloze test (passage on Thane Municipal Transport). Select the most appropriate option for blank No. 3.\nThe drop is enough to set the 3.____ bells ringing.", "o": ["clock-tower", "alarm", "church", "temple"], "ans": 1, "e": "'Alarm bells ringing' is the correct idiom indicating a warning." },
{ "n": 24, "q": "Cloze test (passage on Thane Municipal Transport). Select the most appropriate option for blank No. 4.\nTMT plies nearly 300 buses and is already facing 4.____ in managing schedules.", "o": ["difficulties", "consequences", "facilities", "differences"], "ans": 0, "e": "'Difficulties' fits, as TMT is facing problems in managing schedules." },
{ "n": 25, "q": "Cloze test (passage on Thane Municipal Transport). Select the most appropriate option for blank No. 5.\nThe ticket cost cut by BEST 5.____ TMT routes that overlap.", "o": ["has impacting", "impacting", "impact", "has impacted"], "ans": 3, "e": "The present perfect 'has impacted' is correct, indicating a completed action with present effect." },
// ===================== GENERAL INTELLIGENCE & REASONING (Q26-50) =====================
{ "n": 26, "q": "By interchanging which two signs will the equation become correct?\n6 + 9 × 2 – 3 ÷ 4 = 8", "o": ["– and ÷", "– and +", "+ and ÷", "÷ and ×"], "ans": 0, "e": "Interchanging − and ÷: 6 + 9 × 2 ÷ 3 − 4 = 6 + 6 − 4 = 8. Correct." },
{ "n": 27, "q": "Select the option that is related to the third number in the same way as the second number is related to the first number.\n16 : 9 :: 36 : ?", "o": ["17", "19", "23", "11"], "ans": 1, "e": "(1st ÷ 2) + 1 = 2nd: (16÷2)+1 = 9, so (36÷2)+1 = 19." },
{ "n": 28, "q": "Statements:\nI. No T is L.\nII. All L are K.\nConclusions:\nI. Some K are L.\nII. Some K are T.\nIII. No K is L.\nWhich conclusion(s) follow?", "o": ["Both conclusion II and III follow", "Neither conclusion follows", "Only conclusion II follows", "Only conclusion I follows"], "ans": 3, "e": "All L are K implies some K are L (I follows). II and III are not definite. So only conclusion I follows." },
{ "n": 29, "q": "Five boys J, K, L, M and T are standing in a queue. There is only one boy between K and J. There is only one boy between K and L. There are four boys behind J. T is three places ahead of L. How many boys are ahead of M?", "o": ["3", "0", "2", "1"], "ans": 0, "e": "Order front-to-back: J, T, K, M, L. So 3 boys (J, T, K) are ahead of M." },
{ "n": 30, "q": "By interchanging which two numbers will the value obtained after solving the given equation be 13?\n7 + 8 ÷ 4 × 3", "o": ["8 and 3", "8 and 4", "7 and 3", "3 and 4"], "ans": 0, "e": "Interchanging 8 and 3: 7 + 3 ÷ 4 × 8 = 7 + 6 = 13. Correct." },
{ "n": 31, "q": "Six cameras G, H, P, S, K and I are placed in a row facing north. S is second to the left of I. H is second to the right of G. K is third to the left of G. Which statement about camera I is correct?", "o": ["I is not the immediate neighbour of H", "I is between G and S", "P is third to the left of I", "I is to the immediate left of G"], "ans": 2, "e": "Arrangement: K P S G I H. So P is third to the left of I." },
{ "n": 32, "q": "A piece of paper is folded and punched as shown below. From the given answer figures, indicate how it will appear when opened. Refer to the figure.", "o": OPT4, "ans": 3, "e": "Unfolding the punched paper produces the pattern in option (4)." },
{ "n": 33, "q": "Select the number which can be placed at the sign of question mark (?) from the given alternatives.\n5  1  3\n9  9  4\n6  ?  7\n29  22  18", "o": ["5", "3", "6", "4"], "ans": 1, "e": "Column-wise: (1st+2nd+3rd) + 2nd = 4th. Column 2: (1+9+?) + 9 = 22 ⇒ ? = 3." },
{ "n": 34, "q": "If a mirror is placed on the line AB, then which of the answer figures is the right image of the given figure? Refer to the figure.", "o": OPT4, "ans": 1, "e": "In the mirror image, left becomes right and right becomes left; option (2) is correct." },
{ "n": 35, "q": "Identify the diagram that best represents the relationship among the given classes: Pentagon, Hexagon, Figure. Refer to the figure.", "o": OPT4, "ans": 0, "e": "A pentagon and a hexagon are separate kinds of figures, so two non-overlapping circles inside one big circle — option (1)." },
{ "n": 36, "q": "Statements:\nI. Some numbers are letters.\nII. No letter is water.\nConclusions:\nI. Some water are numbers.\nII. Some letters are numbers.\nIII. All letters are water.\nWhich conclusion(s) follow?", "o": ["Both conclusion I and III follow", "Only conclusion I follows", "Only conclusion II follows", "Neither conclusion follows"], "ans": 2, "e": "Some numbers are letters implies some letters are numbers (II follows). I and III are false. So only conclusion II follows." },
{ "n": 37, "q": "In a certain code language, 'JAN' is written as '25' and 'WED' is written as '32'. What is the code for 'SEP'?", "o": ["38", "39", "40", "41"], "ans": 2, "e": "The code is the sum of letter positions: S+E+P = 19+5+16 = 40." },
{ "n": 38, "q": "A series is given with one term missing. Select the correct alternative that will complete the series.\nLP, MR, ?, OV, PX", "o": ["MT", "NU", "MU", "NT"], "ans": 3, "e": "1st letters L,M,N,O,P (+1); 2nd letters P,R,T,V,X (+2) → NT." },
{ "n": 39, "q": "Study the given pattern carefully and select the figure that will complete the pattern given in the question figure. Refer to the figure.", "o": OPT4, "ans": 3, "e": "Following the sequence and pattern, option (4) completes the figure." },
{ "n": 40, "q": "In a certain code language, 'DRAUGH' is written as 'LKYEVH'. What is the code for 'MAHTOS' in that code language?", "o": ["WSXLFQ", "XTYMER", "WSXLEQ", "XTYMFR"], "ans": 2, "e": "Applying the same letter-shift mapping as DRAUGH→LKYEVH, MAHTOS becomes WSXLEQ." },
{ "n": 41, "q": "Select the option that is related to the third term in the same way as the second term is related to the first term.\nRainbow : Sky :: Tsunami : ?", "o": ["Pond", "Sea", "Land", "Atmosphere"], "ans": 1, "e": "A rainbow appears in the sky; similarly a tsunami appears in the sea." },
{ "n": 42, "q": "Select the number that can replace the question mark (?) in the following series.\n12, 12, 24, 72, 288, ?", "o": ["1228", "1440", "1680", "1448"], "ans": 1, "e": "Multipliers 1, 2, 3, 4, 5: 288 × 5 = 1440." },
{ "n": 43, "q": "In a certain code language, 'MOTHER' is written as 'TOMREH'. What is the code for 'STORME' in that code language?", "o": ["OUSEMR", "EMROTS", "MROTES", "OTSEMR"], "ans": 3, "e": "The letters are rearranged in the pattern 3-2-1-6-5-4: STORME → OTSEMR." },
{ "n": 44, "q": "Select the figure which can be placed at the sign of question mark (?) from the given alternatives. Refer to the figure.", "o": OPT4, "ans": 2, "e": "Following the pattern of the series, option (3) fits the question mark." },
{ "n": 45, "q": "In a certain code language, 'ROCKS' is written as '82649' and 'MENTR' is written as '01578'. What is the code for 'TROMN' in that code language?", "o": ["78205", "78203", "76205", "70581"], "ans": 0, "e": "From the mappings T=7, R=8, O=2, M=0, N=5, so TROMN = 78205." },
{ "n": 46, "q": "From the given answer figures, select the one in which the question figure is hidden/embedded. (Rotation not allowed.) Refer to the figure.", "o": OPT4, "ans": 2, "e": "The question figure is embedded in option (3)." },
{ "n": 47, "q": "Select the number that can replace the question mark (?) in the following series.\n16, 49, 149, 450, 1354, ?", "o": ["4067", "4062", "4066", "4068"], "ans": 0, "e": "Pattern ×3 + (1,2,3,4,5): 1354 × 3 + 5 = 4067." },
{ "n": 48, "q": "Select the related letters from the given alternatives.\nJRM : DLG :: TNL : ?", "o": ["NHF", "NHE", "MHF", "MHE"], "ans": 0, "e": "Each letter shifts back by 6: T→N, N→H, L→F → NHF." },
{ "n": 49, "q": "Select the option that is related to the third word in the same way as the second word is related to the first word.\nCatching : Tongs :: Digging : ?", "o": ["Pen", "Gutter", "Spoon", "Spade"], "ans": 3, "e": "Tongs are used for catching/holding; similarly a spade is used for digging." },
{ "n": 50, "q": "Six players C, E, G, I, K and M are standing in a row facing north. Two players are standing between C and M. I is to the immediate left of C. E is second to the left of G. K is third to the right of G. Who is standing second to the right of I?", "o": ["E", "M", "K", "C"], "ans": 2, "e": "Working out the arrangement, K is standing second to the right of I." },
// ===================== NUMERICAL APTITUDE (Q51-75) =====================
{ "n": 51, "q": "If x : y = 13 : 12 and x − y = 2, then what is the value of 2x + 3y?", "o": ["144", "120", "124", "136"], "ans": 2, "e": "x=13k, y=12k; x−y=k=2; 2x+3y = 26k+36k = 62k = 124." },
{ "n": 52, "q": "The radii of a right circular cone and a right circular cylinder are in the ratio 2 : 3. If the ratio of their heights is 3 : 4, then what is the ratio of their volumes?", "o": ["1 : 6", "1 : 3", "1 : 9", "2 : 3"], "ans": 2, "e": "Volume ratio = (1/3)r₁²h₁ : r₂²h₂ = (1/3)(4)(3) : (9)(4) = 4 : 36 = 1 : 9." },
{ "n": 53, "q": "Average age of 9 men is 45 years. If the age of one woman is included, the average becomes 44 years. What is the age of the woman?", "o": ["44 years", "30 years", "40 years", "35 years"], "ans": 3, "e": "Woman's age = 10×44 − 9×45 = 440 − 405 = 35 years." },
{ "n": 54, "q": "P sold an article to Q at a profit of 20%. Q sold it to R at a loss of 25%. R sold it to T at a profit of 50%. If P bought the article at Rs 100, at what price did T buy it?", "o": ["Rs 145", "Rs 125", "Rs 115", "Rs 135"], "ans": 3, "e": "100 ×1.2 = 120; ×0.75 = 90; ×1.5 = 135. T paid Rs 135." },
{ "n": 55, "q": "What is the value of (6 of 4 ÷ 16 × 48) ÷ 8 × 4 + 2 × 3 ÷ 6 + 5(6 − 2)?", "o": ["63", "79", "67", "57"], "ans": 3, "e": "= 72 ÷ 8 × 4 + 1 + 20 = 36 + 1 + 20 = 57." },
{ "n": 56, "q": "Rs 480 is invested at simple interest. It becomes Rs 520 after 20 months. What is the interest rate per annum?", "o": ["6%", "5%", "8%", "4%"], "ans": 1, "e": "SI = 40 = 480 × R × (20/12)/100 ⇒ R = 5%." },
{ "n": 57, "q": "The monthly incomes of A and B are Rs 12000 and Rs 15000 respectively. The monthly expenditure of A is Rs 8000. If the ratio of their monthly expenditures is 2 : 3, what is the sum of their monthly savings?", "o": ["Rs 7000", "Rs 8000", "Rs 5000", "Rs 6000"], "ans": 0, "e": "B's expenditure = 12000; savings = (12000−8000)+(15000−12000) = 4000+3000 = Rs 7000." },
{ "n": 58, "q": "The area of a rhombus is 300 cm². If the length of one of its diagonals is 30 cm, what is the length (in cm) of the second diagonal?", "o": ["25", "10", "20", "30"], "ans": 2, "e": "Area = ½ d₁ d₂ ⇒ 300 = ½ × 30 × d₂ ⇒ d₂ = 20 cm." },
{ "n": 59, "q": "If the height of an equilateral triangle is 20√2 cm, then what is its area (in cm²)?", "o": ["800/√3", "1400/3", "800/√3 (≈ 800√3/3)", "400/√3"], "ans": 2, "e": "h = (√3/2)a ⇒ a = 40√2/√3; area = (√3/4)a² = 800/√3 = 800√3/3 cm²." },
{ "n": 60, "q": "A number is first increased by 40% and then increased by 30%. What is the net percentage increase?", "o": ["82%", "96%", "72%", "70%"], "ans": 0, "e": "Net = 40 + 30 + (40×30)/100 = 82%." },
{ "n": 61, "q": "Ravika alone can complete three-fifths of a work in 105 days. Malika can complete one-third of the work in 50 days. In how many days can Ravika and Malika together complete 26/35 of the work?", "o": ["63 days", "70 days", "60 days", "80 days"], "ans": 2, "e": "Ravika full = 175 days, Malika full = 150 days; together rate = 13/1050 per day; 26/35 ÷ that = 60 days." },
{ "n": 62, "q": "The speed of a car is 36 km/h. How much time (in minutes) will a bus travelling at one-fifth of the car's speed take to cover a distance of 900 m?", "o": ["5½", "7½", "10½", "8½"], "ans": 1, "e": "Bus speed = 36/5 km/h = 2 m/s; time = 900/2 = 450 s = 7½ minutes." },
{ "n": 63, "q": "What is the least four-digit number which is exactly divisible by 2, 4, 6 and 8?", "o": ["1016", "1024", "1008", "1096"], "ans": 2, "e": "LCM(2,4,6,8)=24; the least four-digit multiple of 24 is 1008." },
{ "n": 64, "q": "Average of 50 numbers was calculated as 20 when three numbers 26, 36 and 64 were wrongly read as 31, 46 and 59 respectively. What is the correct average?", "o": ["26.2", "19.8", "20.2", "24.4"], "ans": 1, "e": "Correct sum = 1000 − (31+46+59) + (26+36+64) = 990; average = 990/50 = 19.8." },
{ "n": 65, "q": "Refer to the pie chart of motor cycles by colour." + PIE + "\nWhat is the central angle (nearest to one degree) corresponding to the motor cycles of black colour?", "o": ["44", "45", "46", "47"], "ans": 3, "e": "Black = 13%; central angle = 13/100 × 360 = 46.8° ≈ 47°." },
{ "n": 66, "q": "The data shows the number of batsmen with different batting averages: 40–44:12, 44–48:10, 48–52:8, 52–56:6, 56–60:4. What is the mean batting average per batsman?", "o": ["48", "47", "46", "45"], "ans": 2, "e": "Using mid-values 42,46,50,54,58 with the assumed-mean method, the mean works out to 46." },
{ "n": 67, "q": "Mohit is five times as efficient as Rohit. If Mohit can complete a piece of work in 28 days less than Rohit, then in how many days can Rohit alone complete the same work?", "o": ["35 days", "32 days", "45 days", "40 days"], "ans": 0, "e": "If Rohit takes x days, Mohit takes x/5; x − x/5 = 28 ⇒ 4x/5 = 28 ⇒ x = 35 days." },
{ "n": 68, "q": "Refer to the pie chart of motor cycles by colour." + PIE + "\nIf the total number of motor cycles parked is 2300, then what is the number of red-colour motor cycles?", "o": ["284", "288", "280", "276"], "ans": 3, "e": "Red = 12%; 12/100 × 2300 = 276." },
{ "n": 69, "q": "A sum of Rs 2400 becomes Rs 3600 in 6 years at a certain rate of compound interest (compounded annually). What will be the amount after 12 years at the same rate?", "o": ["Rs 6000", "Rs 4800", "Rs 5400", "Rs 4500"], "ans": 2, "e": "In 6 years it becomes 1.5 times; in 12 years (1.5)² = 2.25 times: 2400 × 2.25 = Rs 5400." },
{ "n": 70, "q": "Refer to the pie chart of motor cycles by colour." + PIE + "\nIf the total number of motor cycles parked is 2300, the number having white colour is how much less than those having blue colour?", "o": ["66", "72", "63", "69"], "ans": 3, "e": "Blue − White = (21 − 18)% = 3% of 2300 = 69." },
{ "n": 71, "q": "A train 700 m long crosses a pole in 35 seconds. How much time does it take to cross a platform of length 740 m?", "o": ["1 min 24 s", "1 min 30 s", "1 min 12 s", "1 min 20 s"], "ans": 2, "e": "Speed = 700/35 = 20 m/s; time = (700+740)/20 = 72 s = 1 min 12 s." },
{ "n": 72, "q": "If the selling price of an article is 25% of its cost price, then what will be the loss percentage?", "o": ["25%", "60%", "75%", "50%"], "ans": 2, "e": "SP = 25% of CP, so loss = 75% of CP, i.e. 75%." },
{ "n": 73, "q": "A trader marked up his article 25% more than the cost price. If he offered a discount of 10%, then what will be his profit percentage?", "o": ["140%", "12.5%", "25%", "37.5%"], "ans": 1, "e": "MP = 125; SP = 125 × 0.9 = 112.5; profit = 12.5%." },
{ "n": 74, "q": "The ratio of the ages of two persons is 3 : 4. If the age of one is greater than the other by 8 years, what is the sum of their ages?", "o": ["54 years", "58 years", "60 years", "56 years"], "ans": 3, "e": "4x − 3x = 8 ⇒ x = 8; sum = 7x = 56 years." },
{ "n": 75, "q": "What is the value of (3/4 of 1/2 − 1/16) ÷ 2/3 + (4/9 ÷ 1/3 − 11/81) × 1/4 + 2/3?", "o": ["3", "1", "2", "4"], "ans": 0, "e": "Evaluating the expression stepwise using BODMAS gives 3." },
// ===================== GENERAL AWARENESS (Q76-100) =====================
{ "n": 76, "q": "'Dhansiri' is a tributary of which of the following rivers?", "o": ["Ganga", "Narmada", "Brahmaputra", "Indus"], "ans": 2, "e": "The Dhansiri is a tributary of the Brahmaputra River." },
{ "n": 77, "q": "'Kajri' folk song is related to which of the following states?", "o": ["Maharashtra", "Uttar Pradesh", "Himachal Pradesh", "Rajasthan"], "ans": 1, "e": "Kajri is a folk song genre of Uttar Pradesh (and Bihar)." },
{ "n": 78, "q": "'Rani ki vav' motif is present on which of the following currency notes?", "o": ["50 Rupee Note", "200 Rupee Note", "10 Rupee Note", "100 Rupee Note"], "ans": 3, "e": "Rani ki Vav is depicted on the reverse of the Rs 100 currency note." },
{ "n": 79, "q": "Who has been appointed as the Managing Director and Chief Financial Officer of the World Bank in July 2019?", "o": ["P.S. Jaykumar", "Anshula Kant", "Ravneet Gill", "Amitabh Chaudhry"], "ans": 1, "e": "Anshula Kant was appointed MD and CFO of the World Bank in July 2019." },
{ "n": 80, "q": "Which of the following Articles is related to the Jammu & Kashmir state of India?", "o": ["Article 378", "Article 374", "Article 370", "Article 366"], "ans": 2, "e": "Article 370 gave special status to Jammu & Kashmir." },
{ "n": 81, "q": "According to the Census 2011, what is the literacy rate of India?", "o": ["0.7404", "0.9401", "0.644", "0.8402"], "ans": 0, "e": "As per Census 2011, India's literacy rate was 74.04% (0.7404)." },
{ "n": 82, "q": "Which of the following ions are responsible for the hardness of water?", "o": ["Sodium and Magnesium ions", "Calcium and Magnesium ions", "Potassium and Calcium ions", "Sodium and Calcium ions"], "ans": 1, "e": "Hardness of water is caused by calcium and magnesium ions." },
{ "n": 83, "q": "When was the first amendment made to the Indian Constitution?", "o": ["1954", "1951", "1953", "1952"], "ans": 1, "e": "The first amendment to the Indian Constitution was made in 1951." },
{ "n": 84, "q": "In which of the following states of India is the only floating park in the world situated?", "o": ["Meghalaya", "Manipur", "Tripura", "Assam"], "ans": 1, "e": "Keibul Lamjao National Park, the world's only floating park, is in Manipur (Loktak Lake)." },
{ "n": 85, "q": "When did the Non-Cooperation Movement end?", "o": ["1930", "1925", "1922", "1920"], "ans": 2, "e": "The Non-Cooperation Movement ended in 1922 after the Chauri Chaura incident." },
{ "n": 86, "q": "Which of the following is the traditional theatre of Jammu and Kashmir?", "o": ["Jatra", "Swaang", "Maach", "Bhand Pather"], "ans": 3, "e": "Bhand Pather is the traditional theatre of Jammu and Kashmir." },
{ "n": 87, "q": "The concept of 'The Four Noble Truths' belongs to which of the following religions?", "o": ["Jainism", "Sikhism", "Hinduism", "Buddhism"], "ans": 3, "e": "The Four Noble Truths are a core concept of Buddhism." },
{ "n": 88, "q": "Who among the following received the Rajiv Gandhi Khel Ratna Award 2018 in weightlifting?", "o": ["Mirabai Chanu", "Karnam Malleswari", "Swati Singh", "Sanjita Chanu"], "ans": 0, "e": "Mirabai Chanu received the Rajiv Gandhi Khel Ratna Award 2018 in weightlifting." },
{ "n": 89, "q": "Who among the following has the power to promulgate an ordinance?", "o": ["Prime Minister", "President", "Chief Justice of Supreme Court", "Defence Minister"], "ans": 1, "e": "Under Article 123, the President of India can promulgate ordinances." },
{ "n": 90, "q": "Who is the inventor of dynamite?", "o": ["Alfred Nobel", "Marie Currie", "Robert Oppenheimer", "Otto Hahn"], "ans": 0, "e": "Alfred Nobel invented dynamite." },
{ "n": 91, "q": "'Equus caballus' is the scientific name of which of the following animals?", "o": ["Cheeta", "Horse", "Wild Ass", "Zebra"], "ans": 1, "e": "Equus caballus is the scientific name of the horse." },
{ "n": 92, "q": "As of November 2023, who is the CEO of the Central Bank of India?", "o": ["P. V. Bharti", "Shyam Srinivasan", "Matam Venkata Rao", "T.N. Manoharan"], "ans": 2, "e": "As of November 2023, Matam Venkata Rao is the MD & CEO of the Central Bank of India." },
{ "n": 93, "q": "Which of the following awards is given to a university for its all-round good performance in sports?", "o": ["Maulana Abul Kalam Azad Trophy", "Dhyanchand Award", "Arjuna Award", "Dronacharya Award"], "ans": 0, "e": "The Maulana Abul Kalam Azad (MAKA) Trophy is given to universities for overall sports performance." },
{ "n": 94, "q": "Which of the following vitamins is related to Osteoporosis?", "o": ["Vitamin B", "Vitamin A", "Vitamin C", "Vitamin D"], "ans": 3, "e": "Vitamin D deficiency is related to osteoporosis." },
{ "n": 95, "q": "Who was the Mughal emperor during the 1857 revolt in India?", "o": ["Shah Alam II", "Alamgir II", "Bahadur Shah II", "Akbar Shah II"], "ans": 2, "e": "Bahadur Shah II (Zafar) was the Mughal emperor during the 1857 revolt." },
{ "n": 96, "q": "In which union territory of India is Bastille Day celebrated?", "o": ["Lakshadweep", "Daman & Diu", "Dadra and Nagar Haveli", "Puducherry"], "ans": 3, "e": "Bastille Day is celebrated in Puducherry, a former French colony." },
{ "n": 97, "q": "Which of the following is a communicable disease?", "o": ["Measles", "Asthma", "Diabetes", "Alzheimer"], "ans": 0, "e": "Measles is a highly communicable (infectious) disease." },
{ "n": 98, "q": "Who is the writer of the book 'Thoughts on Pakistan'?", "o": ["Muhammad Ali Jinnah", "Dr. B.R. Ambedkar", "Mahatma Gandhi", "Rajendra Prasad"], "ans": 1, "e": "'Thoughts on Pakistan' was written by Dr. B.R. Ambedkar." },
{ "n": 99, "q": "Dipa Karmakar is associated with which of the following sports?", "o": ["Golf", "Gymnastics", "Tennis", "Badminton"], "ans": 1, "e": "Dipa Karmakar is an Indian gymnast." },
{ "n": 100, "q": "Which of the following states of India is the main producer of chromite?", "o": ["Goa", "Odisha", "Haryana", "Rajasthan"], "ans": 1, "e": "Odisha (Sukinda region) is the main producer of chromite in India." }
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

  const TEST_TITLE = 'SSC MTS (2019 Pattern) - 2019 (6 Aug) Shift-3';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading figure images to Cloudinary)...');
  const questions = await buildQuestions();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 100,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2019, pyqShift: '6 Aug 2019 Shift-3', pyqExamName: 'SSC MTS', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
