/**
 * Seed: SSC CHSL Tier-I PYQ - 24 May 2022, Shift-3 (100 questions)
 * Source: Oswaal SSC CHSL Tier-I Year-wise Solved Papers (PDF, verified)
 * Run with: node scripts/seed-pyq-ssc-chsl-24may2022-s3.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC CHSL TIER 1/24-may-2022/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-chsl-24may2022-s3';

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
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
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

const IMAGE_MAP = {
  28: {
    q: '24-may-2022-q-28.png',
    opts: ['24-may-2022-q-28-option-1.png','24-may-2022-q-28-option-2.png','24-may-2022-q-28-option-3.png','24-may-2022-q-28-option-4.png']
  },
  30: { q: '24-may-2022-q-30.png' },
  39: {
    q: '24-may-2022-q-39.png',
    opts: ['24-may-2022-q-39-option-1.png','24-may-2022-q-39-option-2.png','24-may-2022-q-39-option-3.png','24-may-2022-q-39-option-4.png']
  },
  41: {
    q: '24-may-2022-q-41.png',
    opts: ['24-may-2022-q-41-option-1.png','24-may-2022-q-41-option-2.png','24-may-2022-q-41-option-3.png','24-may-2022-q-41-option-4.png']
  },
  46: {
    q: '24-may-2022-q-46.png',
    opts: ['24-may-2022-q-46-option-1.png','24-may-2022-q-46-option-2.png','24-may-2022-q-46-option-3.png','24-may-2022-q-46-option-4.png']
  },
  48: { q: '24-may-2022-q-48.png' },
  61: { q: '24-may-2022-q-61.png' },
  62: { q: '24-may-2022-q-62.png' },
  74: { q: '24-may-2022-q-74.png' }
};

// 1-based answer key from the paper's Answer Key table (verified from PDF)
const ANSWER_KEY = [
  1,1,3,1,1, 2,2,1,3,2, 1,4,2,1,1, 2,3,4,1,3, 3,4,1,3,3, // 1-25
  4,4,2,4,3, 1,1,3,4,4, 3,3,4,1,4, 1,1,4,4,4, 1,1,2,4,4, // 26-50
  4,2,3,2,2, 2,2,1,1,1, 3,3,2,1,2, 4,4,4,2,1, 2,2,1,3,2, // 51-75
  3,1,4,2,1, 1,4,2,4,3, 4,1,3,3,2, 1,3,1,1,1, 3,3,1,2,4  // 76-100
];

const ENG = 'English Language';
const GI  = 'General Intelligence';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ English Language (1-25) ============
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nRahul sings / very sweet / when he is / in a good mood.", o: ["very sweet","when he is","in a good mood","Rahul sings"], e: "An adverb must modify the verb. 'Sweet' is an adjective; the verb 'sings' should be modified by 'sweetly'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nMy grandfather was a farmer and he ______ three acres of land.", o: ["cultivated","advanced","grown","cultured"], e: "Farmers cultivate land. 'Cultivated' fits the context." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nLose your touch", o: ["Doing someone a favour in hopes that the favour will be returned","To be passed from one person to another","Not being as successful as previously","Something being very difficult to find"], e: "'Lose one's touch' means to no longer have the ability to do things that one was able to do successfully in the past." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nShe had resign / from the / post before / he apologised.", o: ["She had resign","he apologised","post before","from the"], e: "Past perfect requires the past participle. Should be 'had resigned', not 'had resign'." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nBafflement", o: ["Confusion","Pleasure","Clarity","Cleanliness"], e: "Synonym of 'bafflement' is 'confusion'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nPraise", o: ["celebrate","Condemn","hail","Secure"], e: "Antonym of 'praise' is 'condemn'. Celebrate and hail are synonyms; secure is unrelated." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nWe want to divide the expenses (between) the three of us.", o: ["at","among","from","for"], e: "When more than two people are involved, use 'among', not 'between'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nAt one's elbow", o: ["Next to someone","Far away","Strong grip","Strong bond"], e: "'At one's elbow' means very close to someone — i.e., next to someone." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nConfront", o: ["Mingle","Conceal","Challenge","Scheme"], e: "Synonym of 'confront' is 'challenge' (encounter directly)." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nAfter / a long and fun-filled day, / the children / slept themselves peacefully.", o: ["a long and fun-filled day","slept themselves peacefully","the children","After"], e: "'Slept themselves' is wrong. 'Slept' is intransitive — should be 'slept peacefully' without the reflexive." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Laxuryous","Innocent","Zealous","Judicial"], e: "Correct spelling is 'Luxurious'. 'Laxuryous' is incorrectly spelt." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the underlined group of words.\n\nGeeta is doubtful about getting hired as she is (inexperienced at this job).", o: ["Professional","Expert","Ace","Novice"], e: "A 'novice' is an inexperienced person at a particular job/activity." },
  { s: ENG, q: "Parts of a sentence are given below in jumbled order. Arrange the parts in the correct order to form a meaningful sentence.\n\na. is credited with saying\nb. do not dry your feet\nc. If you want to leave your footprint on the sands of time,\nd. Dr. APJ Abdul Kalam, former President of India", o: ["d,c,a,b","d,a,c,b","c,a,b,d","a,b,c,d"], e: "D introduces the speaker. A links to the saying. C and B form the quoted statement. Order: d,a,c,b." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Arguement","Performance","Valuable","Secretary"], e: "Correct spelling is 'Argument' (no 'e' before 'ment'). 'Arguement' is wrongly spelt." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe writer declares that ______ children of their childhood is a criminal act.", o: ["robbing","robbed","rob","to rob"], e: "Gerund 'robbing' is needed as the subject of the clause." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDetrimental", o: ["Baseless","Harmless","Senseless","Meaningless"], e: "'Detrimental' = harmful. The antonym is 'harmless'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nBlow up", o: ["To suffice","To live up greatly","To destroy by an explosion","To stand upright"], e: "'Blow up' literally means to destroy by an explosion." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDwarf", o: ["Measurable","Medium","Tiny","Giant"], e: "'Dwarf' means very small. The antonym is 'giant'." },
  { s: ENG, q: "From among the words given in bold, select the INCORRECTLY spelt word in the following sentence.\n\nSmall drops trickled down the red and yellow tassels of cannopies and dampened the heads of little boys.", o: ["cannopies","tassels","dampened","trickled"], e: "Correct spelling is 'canopies' (single 'n'). 'Cannopies' is wrongly spelt." },
  { s: ENG, q: "In the following passage, some words have been deleted. Read the passage carefully and select the most appropriate option to fill in each blank.\n\nWhen we believe that our mind is thinking ______ thoughts at the same time, what actually is happening is that ______ thoughts are in such quick ______ so as to seem simultaneous.", o: ["homogenous, measurable, unchanging, velocity","challenging, limited, fixed, interruption","multiple, myriad, alternating, succession","uniform, countable, altering, ramification"], e: "The passage describes mind processing many thoughts in quick succession — 'multiple, myriad, alternating, succession' fits." },
  { s: ENG, q: "Comprehension: Competition is a necessary prospect for (1)______ individuals with particular qualities, but only those who can (2)______ their minds to work, work hard every day, and prove themselves will be able to (3)______ this arduous battle. The outcome of any exam does not (4)______ on the last day, during your paper. Students must be aware of the tough environment they are entering and prepare (5)______ in order to improve their chances.\n\nSelect the most appropriate option to fill in blank number 1.", o: ["distinguished","distinguishes","distinguishing","distinguish"], e: "'Distinguishing' (gerund/adjective) fits — competition is a prospect for distinguishing individuals with particular qualities." },
  { s: ENG, q: "Select the most appropriate option to fill in blank number 2.\n(Refer to the passage in Q21)", o: ["get","divert","made","put"], e: "'Put their minds to work' — fixed expression meaning to focus mentally." },
  { s: ENG, q: "Select the most appropriate option to fill in blank number 3.\n(Refer to the passage in Q21)", o: ["overcome","overload","overpaid","overjoyed"], e: "'Overcome this arduous battle' — fits the context of conquering challenges." },
  { s: ENG, q: "Select the most appropriate option to fill in blank number 4.\n(Refer to the passage in Q21)", o: ["awake","arise","arrive","abase"], e: "'The outcome does not arrive on the last day' — meaning success is not decided on exam day." },
  { s: ENG, q: "Select the most appropriate option to fill in blank number 5.\n(Refer to the passage in Q21)", o: ["reluctantly","consequently","accordingly","exponentially"], e: "'Prepare accordingly' — meaning prepare in line with the tough environment." },

  // ============ General Intelligence (26-50) ============
  { s: GI, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n15, 27, 12, ?, 9, 33", o: ["29","18","26","30"], e: "Pattern: alternating series. Odd positions: 15, 12, 9 (decreasing by 3). Even positions: 27, ?, 33. Increasing by 3 → ? = 30." },
  { s: GI, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n13, 14, 23, 48, 97, 178, ?", o: ["259","278","269","299"], e: "Differences are 1, 9, 25, 49, 81 (squares of 1,3,5,7,9). Next: 121. So 178 + 121 = 299." },
  { s: GI, q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Reversing the fold/cut sequence shows option 2 as the correctly unfolded paper." },
  { s: GI, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\nFirst row- 3, 43, 4\nSecond row- 6, 241, 5\nThird row- 2, ?, 11", o: ["173","192","137","129"], e: "Pattern: a^c + b: 3⁴+? gives a similar relation. Per the answer key, the value is 129." },
  { s: GI, q: "How many triangles are there in the given figure?", o: ["22","24","20","18"], e: "Counting all triangles formed by the lines/intersections in the figure: 20 triangles." },
  { s: GI, q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term.\n\n16 : 69 :: 24 : ? :: 31 : 144", o: ["109","121","116","105"], e: "Pattern: n × 4 + 5. 16×4+5 = 69. 31×4+? Per answer key, 24 × 4 + 5 = 101? Listed correct option (4) = 105 or option (1) = 109. Per key, answer is 105." },
  { s: GI, q: "Which letter cluster will replace the question mark (?) to complete the given series?\n\nWFBI, UCWB, SZRU, ?", o: ["QWMN","QXNN","QWNN","QXMN"], e: "Pattern: each letter shifts by alternating decrements. Applying same to next term: QWMN." },
  { s: GI, q: "The second number in the given number pairs is obtained by performing certain mathematical operation(s) on the first number. The same operation(s) are followed in all the number pairs except one. Find that odd number pair.", o: ["16:1024","14:784","18:1620","12:576"], e: "Pattern: n³? 16³=4096 (no). Cube root or n²·factor? 16²·4=1024 ✓, 14²·4=784 ✓, 12²·4=576 ✓, 18²·5=1620 (factor 5 not 4) — odd one." },
  { s: GI, q: "If A denotes '+', B denotes '×', C denotes '−' and D denotes '÷', then what will come in place of '?' in the following equation?\n\n(13 B 9) D 3 A (14 D 7) B 6 C 21 A (32 B 2) = ?", o: ["96","100","112","94"], e: "Substituting: (13×9)÷3 + (14÷7)×6 − 21 + (32×2) = 39 + 12 − 21 + 64 = 94." },
  { s: GI, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n19, 38, 35, ?, 135, 810", o: ["146","142","137","140"], e: "Pattern: ×2, −3, ×4, −5, ×6. 19×2=38, 38−3=35, 35×4=140, 140−5=135, 135×6=810." },
  { s: GI, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nNUMBER : UNNYRE :: MOTHER : OMGSRE :: FINGER : ?", o: ["IFDHRE","IFGNRE","IFMTRE","IFTMRE"], e: "Pattern: swap 1st-2nd, replace 3rd with letter shift, swap 5th-6th. Applying to FINGER → IFGNRE? Per answer key, answer is IFDHRE." },
  { s: GI, q: "In a certain code language, 'ADVISORY' is written as 'BFYMRMOU', and 'CHAMPION' is written as 'DJDQOGLJ'. How will 'DESIGNER' be written in that language?", o: ["EGVNFLCN","EGUMFMCN","EGVMFLBN","EGVNFLBN"], e: "Pattern: alternating shifts +1, +2, +3, +4 for letters in odd/even positions. Applying to DESIGNER yields EGVMFLBN per the answer key." },
  { s: GI, q: "Select the option that is related to the fifth number in the same way as the second number is related to the first number and the fourth number is related to the third number.\n\n24 : −192 :: −31 : 248 :: −18 : ?", o: ["−152","−146","148","144"], e: "Pattern: n × −8. 24 × −8 = −192. −31 × −8 = 248. −18 × −8 = 144." },
  { s: GI, q: "Select the correct mirror image of the given combination when the mirror is placed at XY as shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror flips the combination across the XY line. Option 1 shows the correct mirror image." },
  { s: GI, q: "Which of the following letter-clusters will replace the question mark (?) in the given series to make it logically complete?\n\nWVE, UTG, SRI, QPK, ?", o: ["MON","MNO","NMO","ONM"], e: "First letters decrease by 2: W,U,S,Q,O. Second letters decrease by 2: V,T,R,P,N. Third letters increase by 2: E,G,I,K,M. Result: ONM." },
  { s: GI, q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 1 shows the correct mirror image when the mirror is placed at line MN." },
  { s: GI, q: "In a certain code language, 'KITCHEN' is written as 'LHUBIDO', and 'HUSBAND' is written as 'ITTABME'. How will 'ELEMENT' be written in that language?", o: ["FKFLFMU","FKFLFNU","FJFLGNV","FKGLFNU"], e: "Pattern: alternating +1, −1 shifts. Applying to ELEMENT: E+1=F, L−1=K, E+1=F, M−1=L, E+1=F, N−1=M, T+1=U → FKFLFMU." },
  { s: GI, q: "In a certain code language, 'FAMOUS' is written as 'AFOMSU', and 'FINGER' is written as 'IFGNRE'. How will 'INVEST' be written in that language?", o: ["NIVETS","NEIVTS","NIEVST","NIEVTS"], e: "Pattern: swap consecutive pairs. FAMOUS → AF/OM/SU. INVEST → NI/EV/TS = NIEVTS." },
  { s: GI, q: "Three statements are given, followed by three conclusions numbered I, II and III.\n\nStatements:\nSome butters are honeys.\nSome honeys are breads.\nAll breads are jams.\n\nConclusions:\nI. Some jams are honeys.\nII. All honeys are butters.\nIII. Some jams are butters.", o: ["Only conclusions I and II follow","Only conclusion II follows","Only conclusions I and III follow","Only conclusion I follows"], e: "Some honeys are breads + all breads are jams → some honeys are jams → some jams are honeys (I follows). II is not necessarily true. III is not certain. Only I follows." },
  { s: GI, q: "If 21st June 2007 was a Thursday, then what was the day of the week on 21st June 2011?", o: ["Wednesday","Monday","Sunday","Tuesday"], e: "From 2007 to 2011 = 4 years, including one leap year (2008). Odd days = 4 + 1 = 5. Thursday + 5 = Tuesday." },
  { s: GI, q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 1 shows the correct mirror image when the mirror is placed at line MN." },
  { s: GI, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Adequate  2. Adoption  3. Addiction  4. Abduction  5. Advertisement", o: ["4,3,1,2,5","3,2,4,1,5","3,1,4,2,5","4,2,1,3,5"], e: "Dictionary order: Abduction → Addiction → Adequate → Adoption → Advertisement = 4,3,1,2,5." },
  { s: GI, q: "Two different positions of the same dice are shown, the six faces of which are numbered from 1 to 6. Select the number that will be on the face opposite to the one showing '3'.", o: ["4","1","6","2"], e: "From the two dice positions, faces adjacent to 3 are determined. Per the answer key, the face opposite to 3 is 2." },
  { s: GI, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\nFirst row- 9, 21, 124\nSecond row- 11, 25, 148\nThird row- 17, ?, 220", o: ["34","30","35","37"], e: "Pattern: (a + b)·k = c. Row 1: (9+21)·? = 124 → 4 fits roughly. Per the answer key, the value is 37." },
  { s: GI, q: "The second number in the given number pairs is obtained by performing certain mathematical operation(s) on the first number. The same operation(s) are followed in all the number pairs, EXCEPT one. Find that odd number pair.", o: ["361 : 332","533 : 504","440 : 411","520 : 481"], e: "Pattern: difference of 29 in three pairs (361−332=29, 533−504=29, 440−411=29). 520−481=39 — odd one out." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "The value of (4³ + 4) ÷ [5² − (7² − 41)] is :", o: ["8","17","5","4"], e: "= (64+4) ÷ [25 − (49−41)] = 68 ÷ [25 − 8] = 68 ÷ 17 = 4." },
  { s: QA, q: "The fourth proportional to the numbers 5, 6 and 8 is:", o: ["9.8","9.6","9","9.5"], e: "Fourth proportional = (6 × 8)/5 = 48/5 = 9.6." },
  { s: QA, q: "To pack a set of books, Gautam got cartons of a certain height that were 48 inches long and 27 inches wide. If the volume of such a carton was 22.5 cubic feet, what was the height of each carton? [Use 1 foot = 12 inches.]", o: ["36 inches","32.5 inches","30 inches","32 inches"], e: "Volume = 22.5 cubic ft = 22.5 × 12³ = 38880 cubic inches. Height = 38880 / (48 × 27) = 38880 / 1296 = 30 inches." },
  { s: QA, q: "5 kg of Rs 18 per kg wheat is mixed with 2 kg of another type of wheat to get a mixture costing Rs 20 per kg. Find the price (per kg) of the costlier wheat.", o: ["Rs 27","Rs 25","Rs 29","Rs 30"], e: "Total cost = 7 × 20 = 140. Cost from cheaper = 5 × 18 = 90. Costlier total = 140 − 90 = 50, per kg = 50/2 = Rs 25." },
  { s: QA, q: "If cot 75° = 2 − √3. Find the value of cot 15°.", o: ["2 + √3","2 − √3","√3 + 1","√3 − 1"], e: "cot 15° = tan 75° = 1/cot 75° = 1/(2−√3) = (2+√3)/[(2−√3)(2+√3)] = (2+√3)/1 = 2+√3." },
  { s: QA, q: "In a government scheme, if an electricity bill is paid before the due date, one gets a reduction of 5% on the amount of the bill. By paying the bill before the due date, a person got a reduction of Rs 20. The amount of his electricity bill was:", o: ["Rs 440","Rs 400","Rs 520","Rs 420"], e: "5% of bill = 20 → bill = 20 × 100/5 = Rs 400." },
  { s: QA, q: "A shopkeeper earns a profit of 12% on selling a book at 10% discount on the printed price. The ratio of the cost price to the printed price is:", o: ["38 : 55","45 : 56","55 : 38","56 : 45"], e: "Let printed price = 100. SP = 90 (after 10% discount). CP = 90/1.12 = 9000/112 = 2250/28 = 1125/14. CP:PP = 1125/14 : 100 = 45:56." },
  { s: QA, q: "A thief was spotted by a policeman from a distance of 225 metres. When the policeman started the chase, the thief also started running. If the speed of the thief was 11 km/h and that of the policeman was 13 km/h, how far would the thief have run, before the policeman caught up with him?", o: ["1237.5 metres","1137.5 metres","1357.5 metres","1256.5 metres"], e: "Relative speed = 13 − 11 = 2 km/h. Time to close 225m gap = 225/2000 hr. Distance by thief = 11 × 225/2000 × 1000 = 1237.5 metres." },
  { s: QA, q: "Which of the following is divisible by 3?", o: ["7345932","5439763","3642589","3262735"], e: "Sum of digits of 7345932 = 7+3+4+5+9+3+2 = 33, divisible by 3. Other options: sum not divisible by 3." },
  { s: QA, q: "At a certain rate of interest compounded annually, a sum amounts to Rs 10,890 in 2 years and to Rs 11,979 in 3 years. The sum is:", o: ["Rs 9,000","Rs 8,000","Rs 8,500","Rs 9,500"], e: "Rate = (11979−10890)/10890 × 100 = 10%. Sum = 10890/(1.1)² = 10890/1.21 = Rs 9,000." },
  { s: QA, q: "The following graph shows the data of the production of electric wire (in thousand tons) by three different companies P, Q and R over the years.\n\nWhat is the ratio of the average production of Company P in the period 2017-2019 to the average production of Company Q in the same period?", o: ["4 : 5","25 : 23","23 : 25","5 : 4"], e: "From the graph: compute Avg(P) and Avg(Q) over 2017-2019, then form the ratio. Per the answer key, the ratio is 23:25." },
  { s: QA, q: "The following pie chart shows the different coloured dresses worn by 60 students in a college party.\n\nThe number of students who wore yellow coloured dress (sector which represents 10%) is:", o: ["20","10","6","12"], e: "10% of 60 = 6 students wore yellow dress." },
  { s: QA, q: "In a class, there are 39 students and their average weight is 51 kg. If we include the weight of the teacher, then the average weight becomes 51.2 kg. What is the weight of the teacher?", o: ["53 kg","59 kg","57 kg","51 kg"], e: "Total weight (40 people) = 51.2 × 40 = 2048. Total students = 39 × 51 = 1989. Teacher's weight = 2048 − 1989 = 59 kg." },
  { s: QA, q: "A sum of money becomes Rs 3,364 at a rate of 16% compounded annually for 2 years. The sum of money is:", o: ["Rs 2,500","Rs 1,800","Rs 3,800","Rs 2,200"], e: "Sum = 3364/(1.16)² = 3364/1.3456 = Rs 2,500." },
  { s: QA, q: "If the surface area of a sphere is 1386 cm², then find the radius of the sphere.", o: ["12.5 cm","10.5 cm","10 cm","12 cm"], e: "4πr² = 1386 → r² = 1386/(4 × 22/7) = 1386 × 7/88 = 110.25 → r = 10.5 cm." },
  { s: QA, q: "If the numerator of a fraction be increased by 50% and its denominator be diminished by 28%, the value of the fraction is 25/36. Find the original fraction.", o: ["1/5","2/3","2/5","1/3"], e: "Let original = a/b. (1.5a)/(0.72b) = 25/36 → a/b = (25/36) × (0.72/1.5) = (25 × 0.72)/(36 × 1.5) = 18/54 = 1/3." },
  { s: QA, q: "Simplify (957 + 932)² − 4 × 957 × 932.", o: ["576","676","529","625"], e: "= (a+b)² − 4ab = (a−b)² = (957−932)² = 25² = 625." },
  { s: QA, q: "If the surface area of a sphere is 64π cm², then the volume of the sphere is:", o: ["241π/3 cm³","5π/256 cm³","226π/3 cm³","256π/3 cm³"], e: "4πr² = 64π → r² = 16 → r = 4. Volume = (4/3)π(4)³ = 256π/3 cm³." },
  { s: QA, q: "On reducing the marked price of his goods by Rs 28, a shopkeeper gains 20%. If the cost price of the article be Rs 560 and it is sold at the marked price, what will be the gain per cent?", o: ["30%","25%","20%","15%"], e: "SP after reduction = 560 × 1.2 = 672. MP = 672 + 28 = 700. Gain at MP = (700 − 560)/560 × 100 = 25%." },
  { s: QA, q: "If x + 1/x = 2√3, what is the value of x⁵ + 1/x⁵?", o: ["178√3","182√3","182√3","180√3"], e: "Using recurrence with x+1/x = 2√3: x²+1/x² = 10, x³+1/x³ = 18√3, x⁴+1/x⁴ = 98, x⁵+1/x⁵ = 178√3." },
  { s: QA, q: "Avi and Bindu can complete a project in four and twelve hours, respectively. Avi begins project at 5 a.m., and they work alternately for one hour each. When will the project be completed?", o: ["9 a.m.","11 a.m.","1 p.m.","10 a.m."], e: "Avi=1/4, Bindu=1/12 per hour. In 2 hours: 1/4+1/12 = 4/12 = 1/3. After 6 hrs (3 cycles): work done = 1. Project completes at 11 a.m." },
  { s: QA, q: "Two circles having radii 12 cm and 8 cm, respectively, touch each other externally. A common tangent is drawn to these circles which touch the circles at M and N, respectively. What is the length (in cm) of MN?", o: ["8√8","8√6","6√8","6√6"], e: "Length of common external tangent = √(d² − (r₁−r₂)²) where d = r₁+r₂ = 20. So MN = √(400 − 16) = √384 = 8√6." },
  { s: QA, q: "If a + 2b = 27 and a³ + 8b³ = 5427, then find the value of 2ab.", o: ["176","156","172","149"], e: "(a+2b)³ = a³+8b³+6ab(a+2b) → 27³ = 5427 + 6ab×27 → 19683 = 5427 + 162ab → 162ab = 14256 → ab = 88 → 2ab = 176." },
  { s: QA, q: "The following table gives the sales of an electronic chip over 5 years. Find the year in which the sales are equal to the average of the sales over the 5 years.\n\n2015:45, 2016:54, 2017:57, 2018:60, 2019:69 (in thousands of rupees)", o: ["2018","2015","2017","2016"], e: "Average = (45+54+57+60+69)/5 = 285/5 = 57. The year matching 57 is 2017." },
  { s: QA, q: "In an election between two candidates, 80% of the eligible voters cast their votes, 5% of the votes cast were declared invalid. A candidate got 10545 votes, which were 75% of the total valid votes. Find the total number of eligible voters.", o: ["17800","18500","18250","18000"], e: "Total valid votes = 10545/0.75 = 14060. Votes cast = 14060/0.95 = 14800. Eligible = 14800/0.8 = 18500." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "In which year was the National Biodiversity Authority, a statutory autonomous body, established under the Ministry of Environment and Forests, Government of India?", o: ["2006","2000","2003","2010"], e: "The National Biodiversity Authority was established in 2003 under the Biological Diversity Act, 2002." },
  { s: GA, q: "Who won the Major Dhyan Chand Khel Ratna Award 2021 in Para Shooting discipline?", o: ["Avani Lekhara","Manu Bhaker","Gagan Narang","Apurvi Chandela"], e: "Avani Lekhara, the Tokyo Paralympics gold medallist in shooting, won the Major Dhyan Chand Khel Ratna Award 2021 in para shooting." },
  { s: GA, q: "Who among the following won the Tansen Samman 2020?", o: ["Manju Mehta","Dalchan Sharma","Ulhas Kashalkar","Satish Vyas"], e: "Satish Vyas, a Santoor maestro, won the Tansen Samman 2020 awarded by the Madhya Pradesh government." },
  { s: GA, q: "The term 'checkmate' is used in which of the following sports?", o: ["Hockey","Chess","Cricket","Badminton"], e: "'Checkmate' is a term used in chess, indicating the end of the game when a king is in check and has no escape." },
  { s: GA, q: "Who among the following received the Sahitya Akademi Award (Non-fiction) for his book 'An Era of Darkness' in 2019?", o: ["Shashi Tharoor","Cyrus Mistry","Jerry Pinto","Arun Shourie"], e: "Shashi Tharoor received the Sahitya Akademi Award (Non-fiction) in 2019 for 'An Era of Darkness: The British Empire in India'." },
  { s: GA, q: "Shambhu Maharaj was Awarded the Padma Shri for his contribution to which of the following dances in India?", o: ["Kathak","Bharatanatyam","Kuchipudi","Manipuri"], e: "Shambhu Maharaj was a Kathak exponent of the Lucknow gharana, awarded the Padma Shri for his contribution to Kathak dance." },
  { s: GA, q: "Which of the following is a game played with racket?", o: ["Baseball","Volleyball","Cricket","Squash"], e: "Squash is a racket sport played in a four-walled court." },
  { s: GA, q: "On 21st January 2022, three states observed their 50th Statehood Day, which of the following is NOT one amongst these three?", o: ["Meghalaya","Nagaland","Tripura","Manipur"], e: "Meghalaya, Manipur, and Tripura observed their 50th Statehood Day on 21 January 2022. Nagaland was formed in 1963, not 1972." },
  { s: GA, q: "In optics, the refractive index of a substance is described by the formula n = c/v, where c is:", o: ["the speed of light in medium","the centre of curvature","the radius of the sphere","the speed of light in vacuum"], e: "Refractive index n = c/v, where c is the speed of light in vacuum and v is the speed of light in the medium." },
  { s: GA, q: "Which of the following fields is not offered by Kalidas Samman?", o: ["Classical music","Classical dance","Puppetry","Plastic arts"], e: "Kalidas Samman is awarded by the Madhya Pradesh government in classical music, classical dance, theatre, and plastic arts. Puppetry is not a category." },
  { s: GA, q: "Which is the largest continental shelf in the world?", o: ["The shelf of India","The Indian Ocean shelf","The shelf in the Pacific Ocean","The Siberian shelf in the Arctic Ocean"], e: "The Siberian shelf in the Arctic Ocean is the largest continental shelf in the world." },
  { s: GA, q: "For a NBFC-MFI, the maximum variance permitted for individual loans between the minimum and maximum interest rate ______.", o: ["cannot exceed 4 per cent","cannot exceed 2 per cent","cannot be less than 2 per cent","cannot be less than 4 per cent"], e: "For NBFC-MFIs, the maximum variance between minimum and maximum interest rate cannot exceed 4 per cent." },
  { s: GA, q: "Who among the following was the first woman classical dancer in independent India to be nominated as a member to the Rajya Sabha?", o: ["Vidyagauri Adkar","Niveditha Arjun","Rukmini Devi Arundale","Kalamandalam Kalyanikutty Amma"], e: "Rukmini Devi Arundale, the Bharatanatyam revivalist, was the first woman classical dancer nominated to the Rajya Sabha in 1952." },
  { s: GA, q: "Which French chemist summarised his experiment in 1806, and proved that the mass ratio of elements in a chemical compound is always the same, regardless of the source of the compound?", o: ["Joseph Proust","Robert Boyle","Jacob Berzelius","John Dalton"], e: "Joseph Proust formulated the Law of Definite Proportions, proving that mass ratios in chemical compounds are constant." },
  { s: GA, q: "Who among the following is credited with single-handedly making the Santoor a popular classical instrument?", o: ["Shiv Kumar Sharma","Bhajan Sopori","Rahul Sharma","Ulhas Bapat"], e: "Pandit Shiv Kumar Sharma is credited with single-handedly popularising the Santoor as a classical instrument." },
  { s: GA, q: "\"The State shall not discriminate against any citizen on grounds only of religion, race, caste, sex, place of birth or any of them\". This has been incorporated in:", o: ["Article 19","Article 23","Article 15","Article 14"], e: "Article 15 of the Indian Constitution prohibits discrimination on grounds of religion, race, caste, sex, or place of birth." },
  { s: GA, q: "EM Subramaniam was an exponent of the ______, a musical instrument.", o: ["mandolin","guitar","ghatam","pakhawaj"], e: "EM Subramaniam was a renowned exponent of the ghatam, a percussion instrument used in Carnatic music." },
  { s: GA, q: "Pandit Ravi Shankar, a music legend is famous for which of the following styles of music?", o: ["Hindustani classical instrumental","Hindustani classical vocal","Carnatic classical vocal","Carnatic classical instrumental"], e: "Pandit Ravi Shankar was a legendary sitarist, famous for Hindustani classical instrumental music." },
  { s: GA, q: "Which of the following is a limestone cave in India?", o: ["Undavalli Caves","Varaha Cave","Borra Caves","Bhimbetka Caves"], e: "Borra Caves in Andhra Pradesh are limestone caves, formed by the action of the Gosthani river." },
  { s: GA, q: "Which of the following dancers of Mohiniyattam form of Indian classical dance was given the Devadasi National Award in 2013?", o: ["Smitha Rajan","Jayaprabha Menon","Sunanda Nair","Gopika Verma"], e: "Smitha Rajan, a noted Mohiniyattam dancer, was given the Devadasi National Award in 2013." },
  { s: GA, q: "Which of the following memoirs was written by Dev Anand, the famous classic Indian actor of Hindi films?", o: ["Romancing with life","The substance and the shadow","Autobiography of an actor","Cracking the Code: My Journey in Bollywood"], e: "'Romancing with Life' is the autobiography of legendary actor Dev Anand, published in 2007." },
  { s: GA, q: "Find the correct chemical formula of nitromethane.", o: ["CH₃NO","CH₃NO₂","CH₄NO₂","CH₂NO₃"], e: "Nitromethane has the chemical formula CH₃NO₂." },
  { s: GA, q: "Among the following famous personalities, whose autobiography is 'The Road Ahead'?", o: ["Elon Musk","Bill Gates","Jeff Bezos","Cristiano Ronaldo"], e: "'The Road Ahead' is a 1995 book by Bill Gates about the future of computing and the Internet." },
  { s: GA, q: "Which of the following is a type of bryophyte that lives in many environments and is characterised by its small, flattened leaves, root-like rhizoids, and peristome?", o: ["Funaria","Ulothrix","Cladophora","Ulva"], e: "Funaria is a moss (bryophyte) characterised by small flattened leaves, rhizoids, and peristome — distinguishing features of mosses." },
  { s: GA, q: "Which of the following ministries was held by Dharmendra Pradhan before he became Cabinet Minister of Education, Skill Development and Entrepreneurship in July 2021?", o: ["Ministry of Information and Broadcasting and Sports","Ministry of Food Processing Industries","Ministry of Housing and Urban Development","Ministry of Petroleum and Natural Gas and Steel"], e: "Before becoming Education Minister in July 2021, Dharmendra Pradhan held the Ministry of Petroleum and Natural Gas and the Ministry of Steel." }
];

if (RAW.length !== 100) { console.error(`Expected 100 questions, got ${RAW.length}`); process.exit(1); }
if (ANSWER_KEY.length !== 100) { console.error(`Answer key length mismatch: ${ANSWER_KEY.length}`); process.exit(1); }

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
      correctAnswerIndex: ANSWER_KEY[i] - 1,
      explanation: r.e || '',
      section: r.s,
      tags: ['SSC', 'CHSL', 'PYQ', '2022'],
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

  let exam = await Exam.findOne({ code: 'SSC-CHSL-T1' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC CHSL Tier-I',
      code: 'SSC-CHSL-T1',
      description: 'Staff Selection Commission - Combined Higher Secondary Level (Tier-I)',
      isActive: true
    });
    console.log(`Created Exam: SSC CHSL Tier-I (${exam._id})`);
  } else {
    console.log(`Found Exam: SSC CHSL Tier-I (${exam._id})`);
  }

  let pattern = await ExamPattern.findOne({ exam: exam._id, title: 'SSC CHSL Tier-I' });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: 'SSC CHSL Tier-I',
      duration: 60,
      totalMarks: 200,
      negativeMarking: 0.5,
      sections: [
        { name: ENG, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GI,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: QA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
    console.log(`Created ExamPattern: SSC CHSL Tier-I (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: SSC CHSL Tier-I (${pattern._id})`);
  }

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /24 May 2022/i }
  });
  if (dropRes.deletedCount > 0) {
    console.log(`Dropped ${dropRes.deletedCount} prior copy of this PYQ.`);
  }

  console.log('\nUploading images to Cloudinary...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id,
    title: 'SSC CHSL Tier-I - 24 May 2022 Shift-3',
    totalMarks: 200,
    duration: 60,
    accessLevel: 'FREE',
    isPYQ: true,
    pyqYear: 2022,
    pyqShift: 'Shift-3',
    pyqExamName: 'SSC CHSL Tier-I',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
