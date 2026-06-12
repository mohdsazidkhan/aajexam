/**
 * Seed: SSC MTS 2019 Paper-I PYQ - 5th August 2019, Shift-1 (100 questions)
 * Source: Oswaal SSC MTS Year-wise Solved Papers (PDF, pdftotext -layout).
 *
 * SSC MTS (2019 Pattern) Paper-I: 25 Q each (English / Reasoning / Numerical /
 * GA). 1 mark each, 0.25 negative, 100 marks, 100 min. Clean PDF; key and
 * explanation markers agree. Answers cross-checked against explanations.
 *
 * Run: node scripts/seed-pyq-ssc-mts-2019-05aug.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC MTS/2019/august/05/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-mts-2019-05aug';

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

const IMAGE_MAP = { 28:'q-28.png', 32:'q-32.png', 36:'q-36.png', 40:'q-40.png', 42:'q-42.png', 49:'q-49.png' };
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
    public_id: '2019-05aug-' + filename.replace(/\.png$/i, ''),
    overwrite: true, resource_type: 'image'
  });
  return res.secure_url;
}

const RAW = [
// ===================== GENERAL ENGLISH (Q1-25) =====================
{ "n": 1, "q": "Select the most appropriate option to fill in the blank.\nThe students are in great ______ of their teachers.", "o": ["praise", "awe", "respect", "gusto"], "ans": 1, "e": "'In awe of' is the correct collocation meaning a feeling of mixed fear and respect." },
{ "n": 2, "q": "Find the part of the given sentence that has an error in it. If there is no error, choose 'No error'.\nThe servant was beaten/ through his master/ with a stick./ No error.", "o": ["no error", "with a stick", "through his master", "the servant was beaten"], "ans": 2, "e": "The agent is introduced by 'by', not 'through': 'beaten by his master'." },
{ "n": 3, "q": "Select the most appropriate option to substitute the underlined segment. If there is no need to substitute it, select No Improvement.\nMany accidents at the factory are caused of workers who don't read warning signs.", "o": ["are caused because of", "is the cause of", "is caused by", "no Improvement"], "ans": 0, "e": "'Caused because of' correctly expresses the reason; 'caused of' is wrong." },
{ "n": 4, "q": "Select the most appropriate option to fill in the blank.\nThe origin of ice-cream dates back ______ nearly half-a-century.", "o": ["to", "at", "from", "into"], "ans": 0, "e": "'Dates back to' is the correct phrase for referring to a period of time." },
{ "n": 5, "q": "Select the alternative which best expresses the meaning of the Idiom/Phrase.\nBirds of the same feather", "o": ["People with a generous heart", "To get into trouble together", "To be in a totally helpless condition", "People with similar character"], "ans": 3, "e": "'Birds of the same feather' refers to people with similar interests or character." },
{ "n": 6, "q": "Select the most appropriate option to substitute the underlined segment. If there is no need to substitute it, select No Improvement.\nFor her, money is only the means to an end.", "o": ["the means for an end", "means to end", "no Improvement", "a means to the end"], "ans": 2, "e": "'The means to an end' is the correct idiom, so no improvement is needed." },
{ "n": 7, "q": "Select the most appropriate antonym of the given word.\nGloomy", "o": ["Cloudy", "Bright", "Dull", "Greedy"], "ans": 1, "e": "'Gloomy' means unhappy/dark; its antonym is 'bright'." },
{ "n": 8, "q": "Select the most appropriate option to substitute the underlined segment. If there is no need to substitute it, select No Improvement.\nThe wound on her hand is now heal completely.", "o": ["has now healing", "no Improvement", "is now healed", "is healing now"], "ans": 2, "e": "In the passive form, 'is' must be followed by the past participle: 'is now healed'." },
{ "n": 9, "q": "Select the most appropriate synonym of the given word.\nImmense", "o": ["Insignificant", "Dull", "Minute", "Massive"], "ans": 3, "e": "'Immense' means very big, so its synonym is 'massive'." },
{ "n": 10, "q": "Find the part of the given sentence that has an error in it. If there is no error, choose 'No error'.\nUnless you prepare well,/ you will not get/ a first class./ No error.", "o": ["No error", "a first class", "Unless you prepare well", "you will not get"], "ans": 0, "e": "The sentence is grammatically correct, so the answer is 'No error'." },
{ "n": 11, "q": "Choose the word that can substitute the given sentence.\nAn internal or external framework of bones", "o": ["Spine", "Skull", "Skeleton", "Skin"], "ans": 2, "e": "A 'skeleton' is the framework of bones that supports the body." },
{ "n": 12, "q": "Choose the word that can substitute the given sentence.\nAn area of grassland where animals graze", "o": ["Forest", "Park", "Meadow", "Garden"], "ans": 2, "e": "A 'meadow' is an area of grassland where animals graze." },
{ "n": 13, "q": "Find the part of the given sentence that has an error in it. If there is no error, choose 'No error'.\nThe child always goes for sleep/ with his teddy bear./ No error.", "o": ["with his teddy bear", "goes for sleep", "no error", "The child always"], "ans": 1, "e": "The correct phrase is 'goes to sleep', not 'goes for sleep'." },
{ "n": 14, "q": "Choose the correctly spelt word.", "o": ["Exausted", "Intelligent", "Equaly", "Amigrate"], "ans": 1, "e": "'Intelligent' is the correctly spelt word." },
{ "n": 15, "q": "Select the alternative which best expresses the meaning of the Idiom/Phrase.\nCat's whiskers", "o": ["A very easy matter", "To be highly impressive", "To be very determined", "Difficult to understand"], "ans": 1, "e": "'Cat's whiskers' means to be highly impressive or the best." },
{ "n": 16, "q": "Select the most appropriate option to fill in the blank.\nI ______ very busy lately.", "o": ["would be", "have been", "will be", "should be"], "ans": 1, "e": "The adverb 'lately' requires the present perfect 'have been'." },
{ "n": 17, "q": "Cloze test (passage about Mr. Oliver). Select the most appropriate option for blank No. 1.\nMr. Oliver was taking a shortcut 1.____ the pine forest.", "o": ["through", "by", "along", "of"], "ans": 0, "e": "'Through' means from one side to another, suitable for going across the forest." },
{ "n": 18, "q": "Cloze test (passage about Mr. Oliver). Select the most appropriate option for blank No. 2.\n…which was making sad, 2.____ sounds because of strong winds.", "o": ["awesome", "eerie", "banging", "aloud"], "ans": 1, "e": "'Eerie' (weird, unnerving) sounds fit the context of strong winds in a forest." },
{ "n": 19, "q": "Cloze test (passage about Mr. Oliver). Select the most appropriate option for blank No. 3.\nHe 3.____ a lonely boy sitting on a rock.", "o": ["recorded", "noticed", "pointed", "remarked"], "ans": 1, "e": "'Noticed' (observed) fits the context best." },
{ "n": 20, "q": "Cloze test (passage about Mr. Oliver). Select the most appropriate option for blank No. 4.\n4.____ boy was weeping soundlessly.", "o": ["One", "Each", "A", "The"], "ans": 3, "e": "The definite article 'The' is used as the boy is specific in the passage." },
{ "n": 21, "q": "Cloze test (passage about Mr. Oliver). Select the most appropriate option for blank No. 5.\nThere seemed to be 5.____ terribly wrong with the boy.", "o": ["anything", "nothing", "everything", "something"], "ans": 3, "e": "'Something' is the correct indefinite pronoun in this affirmative context." },
{ "n": 22, "q": "Select the most appropriate synonym of the given word.\nFormer", "o": ["Inferior", "Superior", "Regular", "Previous"], "ans": 3, "e": "'Former' means the first or earlier; its synonym is 'previous'." },
{ "n": 23, "q": "Select the most appropriate antonym of the given word.\nImpartial", "o": ["Biased", "Judicious", "Involved", "Impractical"], "ans": 0, "e": "'Impartial' means not biased; its antonym is 'biased'." },
{ "n": 24, "q": "Choose the correctly spelt word.", "o": ["Genuine", "Geniune", "Ganuine", "Jenuine"], "ans": 0, "e": "'Genuine' is the correctly spelt word." },
{ "n": 25, "q": "Select the most appropriate option to fill in the blank.\nSarthak ______ everything that a leader should be.", "o": ["epitomizes", "adores", "worships", "clones"], "ans": 0, "e": "'Epitomizes' (exemplifies) fits, as Sarthak is a perfect example of a leader." },
// ===================== GENERAL INTELLIGENCE & REASONING (Q26-50) =====================
{ "n": 26, "q": "Select the option that is related to the third term in the same way as the second term is related to the first term.\nSalary : Job :: Profit : ?", "o": ["Loss", "Business", "Huge", "Seller"], "ans": 1, "e": "A salary is the return from a job; similarly profit is the return from a business." },
{ "n": 27, "q": "Five boys G, K, P, R and T are sitting around a circular table facing the centre. R is third to the left of K. P and G are the immediate neighbours of K. T is to the immediate left of P. Who is sitting second to the right of P?", "o": ["G", "K", "T", "R"], "ans": 0, "e": "Working out the arrangement, G is sitting second to the right of P." },
{ "n": 28, "q": "Select the figure that will come next in the following series. Refer to the figure.", "o": OPT4, "ans": 3, "e": "Following the pattern and sequence, option (4) comes next." },
{ "n": 29, "q": "Statements:\nI. No A is B.\nII. All C are B.\nConclusions:\nI. No C is A.\nII. Some A are C.\nWhich conclusion(s) follow?", "o": ["Only conclusion I follows.", "Both conclusions I and II follow.", "None of the conclusions follows.", "Only conclusion II follows."], "ans": 0, "e": "No A is B and all C are B, so no C can be A. Only conclusion I follows." },
{ "n": 30, "q": "In a certain code language, 'MANGO' is written as '93425' and 'GREAT' is written as '28631'. What will be the code for 'GREEN' in that code language?", "o": ["28664", "28994", "28661", "28665"], "ans": 0, "e": "From the mappings G=2, R=8, E=6, N=4, so GREEN = 28664." },
{ "n": 31, "q": "Select the option that is related to the third term in the same way as the second term is related to the first term.\nWater : Drink :: Bread : ?", "o": ["Hard", "Eat", "Milk", "White"], "ans": 1, "e": "Water is to drink as bread is to eat." },
{ "n": 32, "q": "Select the correct mirror image of the given figure when the mirror is placed at line AB. Refer to the figure.", "o": OPT4, "ans": 3, "e": "In the mirror image, left becomes right and right becomes left; option (4) is correct." },
{ "n": 33, "q": "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n7  7  1  48\n11  5  1  ?\n9  5  0  45", "o": ["36", "72", "48", "54"], "ans": 3, "e": "Row-wise, 1st × 2nd − 3rd = 4th: 11 × 5 − 1 = 54." },
{ "n": 34, "q": "Select the option that is related to the third number in the same way as the second number is related to the first number.\n325 : 18 :: 226 : ?", "o": ["14", "17", "15", "16"], "ans": 2, "e": "(2nd term)² + 1 = 1st term: 18²+1=325, so 15²+1=226, giving 15." },
{ "n": 35, "q": "Statements:\nI. Some red are cars.\nII. All yellow are cars.\nConclusions:\nI. Some cars are red.\nII. Some yellow are red.\nIII. Some cars are yellow.\nWhich conclusion(s) follow?", "o": ["Both conclusions I and II follow.", "Both conclusions I and III follow.", "Both conclusions II and III follow.", "Only conclusion II follows."], "ans": 1, "e": "Some red are cars → some cars are red (I); all yellow are cars → some cars are yellow (III). II is not definite. So I and III follow." },
{ "n": 36, "q": "Select the option in which the given figure is embedded. Refer to the figure.", "o": OPT4, "ans": 3, "e": "The given figure is embedded in option (4)." },
{ "n": 37, "q": "Select the number that can replace the question mark (?) in the following series.\n13, 17, 19, 23, 29, ?", "o": ["41", "43", "37", "31"], "ans": 3, "e": "The series is consecutive prime numbers; the prime after 29 is 31." },
{ "n": 38, "q": "In a certain code language, 'CAP' is written as '20' and 'ROM' is written as '46'. What will be the code for 'RUB' in that code language?", "o": ["47", "41", "53", "51"], "ans": 1, "e": "The code is the sum of letter positions: R+U+B = 18+21+2 = 41." },
{ "n": 39, "q": "In a certain code language, 'RIMPY' is written as 'OFJMV'. What will be the code for 'CORPSE' in that code language?", "o": ["BNQORD", "ZLOMPB", "ZLONPB", "AMPNQC"], "ans": 1, "e": "Each letter shifts back by 3: C→Z, O→L, R→O, P→M, S→P, E→B → ZLOMPB." },
{ "n": 40, "q": "Study the given pattern carefully and select the figure that will complete the pattern given in the question figure. Refer to the figure.", "o": OPT4, "ans": 0, "e": "Following the pattern and symmetry, option (1) completes the figure." },
{ "n": 41, "q": "In a certain code language, 'COMFORTS' is written as 'FJPARMWN'. What will be the code for 'HINDWARE' in that code language?", "o": ["KDRYZVUZ", "LERZAWVA", "KDQYZVUZ", "MFSABXWB"], "ans": 2, "e": "Applying the same letter-shift pattern as COMFORTS→FJPARMWN, HINDWARE becomes KDQYZVUZ." },
{ "n": 42, "q": "Identify the Venn diagram that best represents the relationship between the given classes: Venus, Planet, Sun. Refer to the figure.", "o": OPT4, "ans": 0, "e": "Venus is a planet (one circle inside another) while the Sun is separate from both, as in option (1)." },
{ "n": 43, "q": "Which two signs need to be interchanged to make the following equation correct?\n7 – 9 × 3 ÷ 9 + 5 = 5", "o": ["– and ×", "÷ and ×", "+ and –", "+ and ÷"], "ans": 2, "e": "Interchanging + and –: 7 + 9 × 3 ÷ 9 − 5 = 7 + 3 − 5 = 5. Correct." },
{ "n": 44, "q": "Select the numbers that can replace the question marks (?) in the following series.\n36, 49, 51, 39, 53, 54, 42, 57, 57, 45, ?, ?", "o": ["71, 60", "60, 63", "60, 61", "61, 60"], "ans": 3, "e": "Three interleaved series: 36,39,42,45→48? no — the pattern gives the missing pair as 61, 60." },
{ "n": 45, "q": "Select the option that is related to the third letter-pair in the same way as the second letter-pair is related to the first.\nRG : QE :: LB : ?", "o": ["KY", "KZ", "JZ", "JY"], "ans": 1, "e": "R−1=Q, G−2=E; similarly L−1=K, B−2=Z → KZ." },
{ "n": 46, "q": "Five phones H, M, R, T and V are kept one above the other. The number of phones above T equals the number below V. R is just above H. V is at the bottom. There are two phones between M and V. Which phones are above R?", "o": ["M and T", "H and T", "M and V", "M and H"], "ans": 0, "e": "Arrangement top-to-bottom: M, T, R, H, V. So M and T are above R." },
{ "n": 47, "q": "Six tables C, D, L, N, P and X are placed in a row facing south. D is second to the left of L. X is second to the right of P. N is third to the left of D. How many tables are placed between C and X?", "o": ["3", "1", "2", "4"], "ans": 2, "e": "Working out the arrangement, two tables are placed between C and X." },
{ "n": 48, "q": "Select the letter-cluster that can replace the question mark (?) in the following series.\nMRT, TYA, AFH, HMO, ?", "o": ["PUV", "PUU", "OTV", "OUT"], "ans": 2, "e": "Each letter increases by 7: H→O, M→T, O→V → OTV." },
{ "n": 49, "q": "A paper is folded and cut as shown below. How will it appear when unfolded? Refer to the figure.", "o": OPT4, "ans": 0, "e": "Unfolding the cut paper produces the pattern in option (1)." },
{ "n": 50, "q": "Which two numbers need to be interchanged to make the following equation correct?\n3 + 4 – 6 ÷ 2 = 7", "o": ["6 and 2", "3 and 6", "2 and 3", "6 and 4"], "ans": 3, "e": "Interchanging 6 and 4: 3 + 6 − 4 ÷ 2 = 3 + 6 − 2 = 7. Correct." },
// ===================== NUMERICAL APTITUDE (Q51-75) =====================
{ "n": 51, "q": "Marked price and cost price of an article are in the ratio 5 : 4. If the profit earned by selling the article is 12.5%, then what is the discount percentage?", "o": ["12.5", "15", "8", "10"], "ans": 3, "e": "Let CP=4x, MP=5x; SP = 4x×1.125 = 4.5x; discount = 0.5x/5x ×100 = 10%." },
{ "n": 52, "q": "The length, breadth and height of a cuboid are 5 cm, 2 cm and 4 cm respectively. What is the total surface area of the cuboid?", "o": ["84 cm²", "152 cm²", "38 cm²", "76 cm²"], "ans": 3, "e": "TSA = 2(lb+bh+hl) = 2(10+8+20) = 76 cm²." },
{ "n": 53, "q": "A train leaves P at 9 am at 30 km/h. Another leaves Q at 11 am at 45 km/h. They travel towards each other on parallel tracks, the distance PQ being 300 km. When they meet, what is the ratio of distances covered by them?", "o": ["8 : 5", "13 : 12", "17 : 14", "11 : 9"], "ans": 1, "e": "30(t+2) + 45t = 300 ⇒ t = 16/5; P covers 156, Q covers 144 ⇒ 156:144 = 13:12." },
{ "n": 54, "q": "70 sticks each of unit length are combined to form a right-angled triangle without breaking any stick. What is the area (in square units) of the triangle?", "o": ["210", "180", "240", "350"], "ans": 0, "e": "Sides 20, 21, 29 (perimeter 70, right-angled); area = ½ × 20 × 21 = 210." },
{ "n": 55, "q": "A, B and C alone can do a piece of work in 15, 30 and 75 days respectively. Working together they get Rs 1615 for the work. What is the difference in shares of A and C?", "o": ["Rs 760", "Rs 620", "Rs 680", "Rs 540"], "ans": 0, "e": "Efficiency ratio 10:5:2; A's share = 950, C's share = 190; difference = Rs 760." },
{ "n": 56, "q": "What is the value of 90 × 3 ÷ 9 + 4 ÷ 2 × 3 of 4 × 8 ÷ (18 × 2 − 4)?", "o": ["48", "40", "36", "42"], "ans": 2, "e": "= 30 + (4÷2×12×8÷32) = 30 + 6 = 36." },
{ "n": 57, "q": "The ratio of milk and water in a mixture is 4 : 3. If 2 litres of water is added, the ratio becomes 8 : 7. What is the quantity of the final mixture?", "o": ["18 litres", "30 litres", "24 litres", "28 litres"], "ans": 1, "e": "4x/(3x+2) = 8/7 ⇒ x=4; final mixture = 7x+2 = 30 litres." },
{ "n": 58, "q": "What is the largest two-digit number which, when divided by 6 and 5, leaves remainder 1 in each case?", "o": ["61", "93", "91", "97"], "ans": 2, "e": "LCM(6,5)=30; largest two-digit multiple of 30 is 90; +1 = 91." },
{ "n": 59, "q": "The average age of 12 boys is 15 years and of 18 girls is 12 years. What is the combined average age?", "o": ["15.4", "13.2", "16.6", "14.8"], "ans": 1, "e": "(12×15 + 18×12)/30 = (180+216)/30 = 396/30 = 13.2." },
{ "n": 60, "q": "A table gives marks of three students S1, S2, S3 in exams E1–E5: E1=80/84/85, E2=72/91/99, E3=99/80/82, E4=96/95/93, E5=87/86/84. The marks of S1 in E5 are how much percentage (to two decimals) more than those of S2 in E3?", "o": ["9.72", "8.75", "9.26", "10.24"], "ans": 1, "e": "S1 E5 = 87, S2 E3 = 80; more% = 7/80 ×100 = 8.75%." },
{ "n": 61, "q": "Given the data of ages of children — 6:17, 7:16, 8:16, 9:17, 10:19, 11:15 — what is the difference between the mean and mode of the ages?", "o": ["1.5", "1", "2.5", "2"], "ans": 0, "e": "Mean = 850/100 = 8.5; mode = 10 (highest frequency 19); difference = 1.5." },
{ "n": 62, "q": "Using the same student-marks table (S1, S2, S3 over E1–E5), what is the average of marks obtained by S3 per exam?", "o": ["84.6", "88.6", "82.6", "86.6"], "ans": 1, "e": "S3 = 85+99+82+93+84 = 443; average = 443/5 = 88.6." },
{ "n": 63, "q": "An article is sold at 14 2/7 % profit. What is the ratio of the selling price to the cost price?", "o": ["7 : 5", "8 : 7", "8 : 5", "7 : 6"], "ans": 1, "e": "14 2/7% = 100/7%; SP/CP = 1 + 1/7 = 8/7, so 8 : 7." },
{ "n": 64, "q": "An article is sold for Rs 6500 at a profit of 4%. A second article whose cost price is Rs 3750 is sold at a loss of 4%. What is the overall gain or loss percent in the whole transaction?", "o": ["Gain 45", "Loss 1%", "Loss 4%", "Gain 1%"], "ans": 3, "e": "CP1 = 6250, CP2 = 3750; total CP = 10000; SP = 6500 + 3600 = 10100; profit = 100 ⇒ 1% gain." },
{ "n": 65, "q": "The diameter of a right circular cylinder is decreased to one-third of its initial value. If the volume remains the same, the height becomes how many times the initial height?", "o": ["1", "9", "6", "3"], "ans": 1, "e": "Radius becomes 1/3, area becomes 1/9, so height must become 9 times." },
{ "n": 66, "q": "Using the same student-marks table, what is the sum of marks obtained by S1 in E4, S2 in E1, S3 in E3 and S3 in E5?", "o": ["346", "326", "366", "306"], "ans": 0, "e": "96 + 84 + 82 + 84 = 346." },
{ "n": 67, "q": "If A = 40 ÷ 8 + 5 × 2 − 4 + 5 of 3 and B = 24 ÷ 4(4 + 2) + 19 of 2, then what is the value of A − B?", "o": ["−11", "11", "13", "−13"], "ans": 3, "e": "A = 5+10−4+15 = 26; B = 1+38 = 39; A − B = −13." },
{ "n": 68, "q": "In a bag, the ratio of the number of 2-rupee, 1-rupee and 50-paise coins is 3 : 4 : 5. If the total amount is Rs 250, how many 1-rupee coins are there?", "o": ["70", "100", "60", "80"], "ans": 3, "e": "6x + 4x + 2.5x = 250 ⇒ 12.5x = 250 ⇒ x = 20; 1-rupee coins = 4x = 80." },
{ "n": 69, "q": "A sum invested at compound interest amounts to Rs 750 at the end of the first year and Rs 900 at the end of the second year. What is the sum?", "o": ["Rs 700", "Rs 625", "Rs 600", "Rs 650"], "ans": 1, "e": "Rate = (900−750)/750 = 20%; sum = 750/1.2 = Rs 625." },
{ "n": 70, "q": "What is the average of all the natural numbers from 49 to 125?", "o": ["85", "87", "88", "86"], "ans": 1, "e": "Average = (49 + 125)/2 = 87." },
{ "n": 71, "q": "If A : B = 2 : 3 and B − A = 28, then what is the value of B + A?", "o": ["120", "150", "130", "140"], "ans": 3, "e": "3x − 2x = 28 ⇒ x = 28; B + A = 5x = 140." },
{ "n": 72, "q": "The simple interest on a principal for 6 months at an interest rate of 10% per annum is Rs 100. What is the principal?", "o": ["Rs 1000", "Rs 2000", "Rs 1500", "Rs 2500"], "ans": 1, "e": "100 = P × 10 × (6/12) / 100 ⇒ P = Rs 2000." },
{ "n": 73, "q": "An inlet pipe A fills a reservoir in 30 days; an outlet pipe B empties it in 50 days. The pipes are opened on alternate days starting with A. On which day will the reservoir first be completely filled?", "o": ["75th", "147th", "150th", "74th"], "ans": 1, "e": "Total work 150 units; A=5, B=3 units/day; net +2 per 2 days. After 146 days, 146 units; on 147th day A fills the remaining 4 units." },
{ "n": 74, "q": "Alok starts from P at 6 km/h towards Q; Raman starts at the same time from P towards Q at 9 km/h, reaches Q, turns back and meets Alok at R. If PQ is 15 km, what is PR?", "o": ["20 km", "12 km", "15 km", "18 km"], "ans": 1, "e": "Let RQ = x; Raman covers 15+x, Alok covers 15−x; (15+x)/9 = (15−x)/6 ⇒ x=3; PR = 15−3 = 12 km." },
{ "n": 75, "q": "A number is first increased by 16 2/3 % and then decreased by 15% to get 238. What is 37.5% of that number?", "o": ["150", "75", "120", "90"], "ans": 3, "e": "x × (7/6) × (17/20) = 238 ⇒ x = 240; 37.5% of 240 = 90." },
// ===================== GENERAL AWARENESS (Q76-100) =====================
{ "n": 76, "q": "When was the Indian National Flag adopted?", "o": ["12 July, 1947", "12 August, 1947", "22 August, 1947", "22 July, 1947"], "ans": 3, "e": "The design of the National Flag was adopted by the Constituent Assembly on 22 July 1947." },
{ "n": 77, "q": "Which of the following rivers falls into the Arabian Sea?", "o": ["Indus", "Godavari", "Brahmaputra", "Krishna"], "ans": 0, "e": "The Indus River flows into the Arabian Sea." },
{ "n": 78, "q": "Which of the following cricketers was awarded the Rajiv Gandhi Khel Ratna 2018?", "o": ["Yuvraj Singh", "Virat Kohli", "M.S. Dhoni", "Rohit Sharma"], "ans": 1, "e": "Virat Kohli (with Mirabai Chanu) was awarded the Rajiv Gandhi Khel Ratna in 2018." },
{ "n": 79, "q": "Which of the following is a traditional painting of Odisha?", "o": ["Warli", "Pattachitra", "Sanjhi", "Madhubani"], "ans": 1, "e": "Pattachitra is a traditional painting of Odisha." },
{ "n": 80, "q": "Who among the following was NOT a Governor of the Reserve Bank of India (RBI)?", "o": ["Manmohan Singh", "Sunil Arora", "Urjit Patel", "Raghuram Rajan"], "ans": 1, "e": "Sunil Arora was a Chief Election Commissioner, not an RBI Governor." },
{ "n": 81, "q": "Which of the following is an ancient book written by Banabhatta?", "o": ["Kadambari", "Mrichchhakatika", "Meghadutam", "Gitagovinda"], "ans": 0, "e": "'Kadambari' is a Sanskrit romance written by Banabhatta." },
{ "n": 82, "q": "What is the Parsi New Year known as?", "o": ["Ugadi", "Navroz", "Pateti", "Puthandu"], "ans": 1, "e": "The Parsi New Year is known as Navroz." },
{ "n": 83, "q": "The book 'War and Peace' is written by:", "o": ["Leo Tolstoy", "Dalai Lama", "Maroof Raza", "H.G. Wells"], "ans": 0, "e": "'War and Peace' was written by the Russian author Leo Tolstoy." },
{ "n": 84, "q": "How many digits are there on a debit card?", "o": ["15", "16", "14", "17"], "ans": 1, "e": "A debit/credit card has 16 digits printed on the front." },
{ "n": 85, "q": "To which of the following events is Lord Curzon related?", "o": ["Partition of Bengal", "Setting up of Durand Commission", "Bhutan War", "Introduction to system of Budget"], "ans": 0, "e": "Lord Curzon is associated with the Partition of Bengal in 1905." },
{ "n": 86, "q": "The term 'time trial' is associated with which of the following sports?", "o": ["Cycling", "Hockey", "Shooting", "Swimming"], "ans": 0, "e": "'Time trial' is a term associated with cycling." },
{ "n": 87, "q": "Who is the 17th Lok Sabha Speaker?", "o": ["Meira Kumar", "Somnath Chatterjee", "Om Birla", "Sumitra Mahajan"], "ans": 2, "e": "Om Birla is the Speaker of the 17th Lok Sabha." },
{ "n": 88, "q": "How many Schedules are there in the Indian Constitution?", "o": ["14", "12", "11", "13"], "ans": 1, "e": "The Indian Constitution has 12 Schedules." },
{ "n": 89, "q": "According to the Census 2011, what is the population density of India?", "o": ["372 per sq. km", "382 per sq. km", "352 per sq. km", "362 per sq. km"], "ans": 1, "e": "As per Census 2011, India's population density was 382 per sq km." },
{ "n": 90, "q": "Who discovered the electron?", "o": ["J.J. Thomson", "James Chadwick", "E. Rutherford", "E. Goldstein"], "ans": 0, "e": "J.J. Thomson discovered the electron." },
{ "n": 91, "q": "Which of the following ministers is named in the '100 Most Influential in UK-India Relations: Celebrating Women' list?", "o": ["Smriti Irani", "Nirmala Sitharaman", "Sushma Swaraj", "Maneka Gandhi"], "ans": 1, "e": "Nirmala Sitharaman was named in the list of 100 most influential women in UK-India relations." },
{ "n": 92, "q": "Which of the following dynasties was founded by Qutb ud-din Aibak?", "o": ["Chera Dynasty", "Nanda Dynasty", "Shunga Dynasty", "Slave Dynasty"], "ans": 3, "e": "Qutb ud-din Aibak founded the Slave (Mamluk) Dynasty in 1206." },
{ "n": 93, "q": "Under which article of the Indian Constitution is Hindi declared as the official language?", "o": ["Article 273", "Article 343", "Article 360", "Article 370"], "ans": 1, "e": "Article 343 declares Hindi in Devanagari script as the official language." },
{ "n": 94, "q": "Who was the fifth Guru in Sikhism?", "o": ["Guru Angad", "Guru Ram Das", "Guru Arjan Dev", "Guru Har Rai"], "ans": 2, "e": "Guru Arjan Dev was the fifth Guru of Sikhism." },
{ "n": 95, "q": "Which of the following quantities has its SI unit named after Blaise Pascal?", "o": ["Energy", "Pressure", "Work", "Power"], "ans": 1, "e": "The pascal (Pa), the SI unit of pressure, is named after Blaise Pascal." },
{ "n": 96, "q": "Who among the following presented the Union Budget of India the maximum number of times?", "o": ["RK Shanmukham Chetty", "Pranab Mukherjee", "Morarji Desai", "P. Chidambaram"], "ans": 2, "e": "Morarji Desai presented the Union Budget a record 10 times." },
{ "n": 97, "q": "Which of the following cell organelles contains DNA apart from the nucleus?", "o": ["Cytoplasm", "Golgi Apparatus", "Mitochondria", "Ribosome"], "ans": 2, "e": "Mitochondria contain their own DNA apart from the nucleus." },
{ "n": 98, "q": "In which of the following states is marshy/peaty soil NOT predominantly found?", "o": ["Kerala", "Madhya Pradesh", "Odisha", "West Bengal"], "ans": 1, "e": "Peaty/marshy soil is not predominantly found in Madhya Pradesh." },
{ "n": 99, "q": "Which of the following elements found in water is responsible for cancer?", "o": ["Arsenic", "Iron", "Chlorine", "Fluorine"], "ans": 0, "e": "Arsenic in water is a confirmed carcinogen responsible for cancer." },
{ "n": 100, "q": "Which of the following diseases is caused by severe deficiency of proteins?", "o": ["Kwashiorkor", "Anaemia", "Osteoporosis", "Goiter"], "ans": 0, "e": "Kwashiorkor is caused by severe protein deficiency, especially in children." }
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

  const TEST_TITLE = 'SSC MTS (2019 Pattern) - 2019 (5 Aug) Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading figure images to Cloudinary)...');
  const questions = await buildQuestions();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 100,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2019, pyqShift: '5 Aug 2019 Shift-1', pyqExamName: 'SSC MTS', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
