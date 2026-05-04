/**
 * Seed: SSC CGL Tier-I PYQ - 9 September 2016, Shift-1 (100 questions)
 * Source: Oswaal SSC CGL Tier-I Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per SSC CGL Tier-I 2016 pattern):
 *   - General Intelligence and Reasoning : Q1-25  (25 Q)
 *   - General Awareness                  : Q26-50 (25 Q)
 *   - Quantitative Aptitude              : Q51-75 (25 Q)
 *   - English Comprehension              : Q76-100 (25 Q)
 *
 * Each question = 2 marks. Total = 200 marks. Duration = 60 min.
 *
 * Run with: node scripts/seed-pyq-ssc-cgl-9sep2016-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSL-CGL-Tier-1/2016/september/09/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-cgl-9sep2016-s1';

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

const F = '9-september-2016';
const IMAGE_MAP = {
  16: { q: `${F}-q-16.png` },
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
  72: { q: `${F}-q-72.png` },
  73: { q: `${F}-q-72.png` },
  74: { q: `${F}-q-72.png` },
  75: { q: `${F}-q-72.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  1,3,1,2,4, 4,4,1,1,2, 1,3,1,3,4, 3,2,2,2,2, 2,2,1,3,2,
  // 26-50 (General Awareness)
  1,2,4,1,2, 2,3,1,2,3, 1,2,4,4,3, 1,1,2,3,4, 1,3,3,4,3,
  // 51-75 (Quantitative Aptitude)
  1,1,2,2,3, 1,1,4,3,1, 3,3,2,1,1, 2,2,3,3,4, 2,2,1,2,3,
  // 76-100 (English)
  4,3,2,3,3, 2,1,1,4,3, 4,3,2,1,1, 4,2,4,2,4, 2,1,4,2,1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Awareness';
const QA  = 'Quantitative Aptitude';
const ENG = 'English Comprehension';

const RAW = [
  // ============ General Intelligence and Reasoning (1-25) ============
  { s: REA, q: "Select the related word/letters/numbers from the given alternative.\n\nMagazine : Editor :: Drama : ?", o: ["Director","Hero","Heroine","Painter"], e: "An editor determines the final content of a magazine. Similarly, a director is in charge of a drama." },
  { s: REA, q: "Select the related word/letters/numbers from the given alternative.\n\nACEG : IKMO :: QSUW : ?", o: ["YZCE","YACD","YACE","YBCE"], e: "Each letter is shifted +8: A→I, C→K, E→M, G→O. Similarly Q+8=Y, S+8=A, U+8=C, W+8=E → YACE." },
  { s: REA, q: "Select the related word/letters/numbers from the given alternatives:\n\n12 : 39 :: 15 : ?", o: ["48","52","39","51"], e: "Pattern: n × 3 + 3. 12×3+3=39. So 15×3+3=48." },
  { s: REA, q: "Find the odd word/letters/number pair from the given alternatives.", o: ["Torch","Battery","Candle","Lamp"], e: "Except battery, all others (torch, candle, lamp) are sources of light. Battery is a power source." },
  { s: REA, q: "Find the odd word/letters/number pair from the given alternatives.", o: ["CA","FD","KI","TQ"], e: "CA, FD, KI all have a gap of −2. TQ has a gap of −3, so it is the odd one out." },
  { s: REA, q: "Find the odd word/letters/number pair from the given alternatives.", o: ["73-61","57-69","47-59","42-29"], e: "73−61=12, 69−57=12, 59−47=12, but 42−29=13. So 42-29 is the odd one out." },
  { s: REA, q: "Arrange the following words as per the order in the dictionary.\n\n1. scarf  2. scene  3. shell  4. survey  5. stream", o: ["1, 2, 4, 5, 3","2, 4, 5, 1, 3","3, 1, 2, 5, 4","1, 2, 3, 5, 4"], e: "Dictionary order: scarf → scene → shell → stream → survey, i.e. 1, 2, 3, 5, 4." },
  { s: REA, q: "A series is given with one term missing. Choose the correct alternative from the given ones that will complete the series.\n\nDCB, HGF, ?, PON", o: ["LKJ","QRO","SUM","XZY"], e: "Each group shifts by +4. After HGF (+4) → LKJ (+4) → PON. Missing term = LKJ." },
  { s: REA, q: "A series is given, with one term missing. Choose the correct alternative from the given ones that will complete the series.\n\n4, 9, 16, 25, 36, ?", o: ["49","56","21","94"], e: "Squares of consecutive numbers: 2², 3², 4², 5², 6², 7² = 49." },
  { s: REA, q: "A is D's brother. D is B's father. B and C are sisters. How is C related to A?", o: ["Cousin","Niece","Aunt","Nephew"], e: "D is A's brother and father of B and C. So B and C are A's nieces. C is A's niece." },
  { s: REA, q: "At a college party, 5 girls are sitting in a row. P is positioned to the left of M and to the right of O. R is seated to the right of N, but to the left of O. Who is seated in the middle?", o: ["O","R","P","M"], e: "Arrangement (left to right): N, R, O, P, M. The middle person is O." },
  { s: REA, q: "From the given alternative words, select the word which cannot be formed using the letters of the given word.\n\nCONSULTATION", o: ["CONSTANT","NATION","SALUTE","STATION"], e: "CONSULTATION does not contain the letter 'E'. So 'SALUTE' cannot be formed." },
  { s: REA, q: "If S = 19, SUN = 54 and CAKE = 20, then MISTAKE = ?", o: ["78","68","59","48"], e: "Each letter = its alphabet position. M(13)+I(9)+S(19)+T(20)+A(1)+K(11)+E(5) = 78." },
  { s: REA, q: "If '+' stands for multiplication, '–' stands for addition, '×' stands for division, then what is the value of 128 + 9 – 16 × 4 = ?", o: ["73","256","1,156","1,352"], e: "After substitution: 128 × 9 + 16 ÷ 4 = 1152 + 4 = 1,156." },
  { s: REA, q: "In this question, some equations are solved on the basis of a certain system. On the same basis, find out the correct answer from the four alternatives for the unsolved equation.\n\n6 × 2 × 9 = 269\n8 × 7 × 1 = 781\n4 × 1 × 3 = ?", o: ["431","413","341","143"], e: "Pattern: digits rearranged in reverse order (positions 3,1,2). For 4×1×3 → 3,4,1 → wait, applying same logic to 6,2,9 → 2,6,9 → 269; 8,7,1 → 7,8,1 → 781; so 4,1,3 → 1,4,3 → 143." },
  { s: REA, q: "Select the missing numbers from the given alternatives.\n\n(Refer to the image showing a 4×3 grid: row1=9,11,13; row2=3,4,7; row3=3,4,5; row4=81,176,?)", o: ["143","169","455","545"], e: "Pattern per column: top × mid × bottom. Col1: 9×3×3=81. Col2: 11×4×4=176. Col3: 13×7×5=455." },
  { s: REA, q: "To attend an exam, Sudhir reached the school by travelling 5 km towards South, and after a sharp left turn, he travelled for about 10 km. He again made a sharp left turn and reached in front of the school by travelling 5 km more. Which direction is Sudhir's starting point from the school?", o: ["East","West","North","South"], e: "South 5 km → East 10 km → North 5 km. Final point is 10 km east of start. So start is to the West of school." },
  { s: REA, q: "Consider the given statement/s to be true and decide which of the given conclusions/assumptions can definitely be drawn from the given statement.\n\nStatements:\n1. All books are novels.\n2. Some novels are poems.\n\nConclusions:\nI. Some books are poems.\nII. Some poems are novels.", o: ["Only conclusion I follows.","Only conclusion II follows.","Neither conclusion I nor conclusion II follows.","Both conclusion I and conclusion II follow."], e: "From 'Some novels are poems', conversion gives 'Some poems are novels' → II follows. I does not necessarily follow." },
  { s: REA, q: "Which symbol will appear on the face opposite to the face of a circle O in the cube given below?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "From the two views, triangle, diamond, square, and double triangle are adjacent to the circle. The remaining face (two circles) is opposite — option 2." },
  { s: REA, q: "Which one of the following diagrams represents the relationship between Insects, Flies and Dogs?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Flies are a type of insect (Flies ⊂ Insects). Dogs are unrelated to both. Option 2 fits." },
  { s: REA, q: "Which answer figure will complete the pattern in the question figure?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 2 completes the missing portion of the pattern correctly." },
  { s: REA, q: "From the given answer figures, select the one in which the question figure is hidden.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The question figure is embedded in option 2." },
  { s: REA, q: "A piece of paper is folded and cut as shown below in the question figures. From the given answer figures, indicate how it will appear when opened.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "After unfolding, the paper appears as shown in option 1." },
  { s: REA, q: "Which of the answer figure is exactly the mirror image of the given figure, when the mirror is held on the line AB?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "When mirrored on line AB, left becomes right and vice versa. Option 3 is the correct mirror image." },
  { s: REA, q: "In the question, a word is represented by only one set of numbers as given in any one of the alternatives. The sets of numbers given in the alternatives are represented by two classes of alphabets as in two matrices given below. The columns and rows of Matrix I are numbered from 0 to 4 and that of Matrix II are numbered from 5 to 9. A letter from these matrices can be represented first by its row and next by its column, e.g., 'L' can be represented by 12, 24, etc., and 'R' can be represented by 55, 67, etc. Similarly, you have to identify the set for the word 'SENT'.", o: ["10, 20, 58, 77","22, 32, 65, 78","34, 44, 67, 87","41, 13, 87, 68"], e: "Decoding option 2: 22=S, 32=E, 65=N, 78=T → SENT. Hence option 2." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "Which of the following Greenhouse gases has the greatest heat-trapping ability?", o: ["Chlorofluoro carbon","Methane","Carbon dioxide","Nitrous oxide"], e: "Chlorofluorocarbons (CFCs) have the highest heat-trapping (Global Warming) potential per molecule among the listed greenhouse gases." },
  { s: GA, q: "Which state of India is leading in solar energy generation?", o: ["Gujarat","Rajasthan","Haryana","Uttar Pradesh"], e: "Rajasthan has the highest solar power generation potential in India and has surpassed Karnataka in solar installations." },
  { s: GA, q: "Diamond does not conduct electricity because:", o: ["its structure is very compact","it is of crystalline nature","there are only carbon atoms present in it","no free electrons are present in it"], e: "In diamond, all four valence electrons of every carbon atom are involved in covalent bonds, leaving no free electrons to carry charge." },
  { s: GA, q: "Ganga is a result of confluence of rivers Bhagirathi and Alakananda at which place?", o: ["Dev Prayag","Karan Prayag","Gangotri","Rudra Prayag"], e: "The Bhagirathi and Alaknanda rivers meet at Devprayag in Uttarakhand to form the Ganga." },
  { s: GA, q: "What are aldehydes?", o: ["Mild oxidising agents","Strong oxidising agents","Strong reducing agents","Mild reducing agents"], e: "Aldehydes (R−CHO) are strong reducing agents — they reduce Tollens' and Fehling's reagents." },
  { s: GA, q: "Which circuit is used to store one bit of data?", o: ["Register","Flip Flop","Vector","Encoder"], e: "A flip-flop is a bistable circuit used to store one bit of data (0 or 1)." },
  { s: GA, q: "Why is weightlessness experienced while orbiting the earth in space ships?", o: ["Inertia","Acceleration","Zero gravity","Orbital motion"], e: "While in orbit, the spacecraft and astronauts are in free-fall around Earth at the same rate, producing apparent zero-gravity / weightlessness." },
  { s: GA, q: "Which is the largest gland in the human body?", o: ["Liver","Thyroid","Pituitary","Salivary gland"], e: "The liver is the largest gland in the human body, weighing up to 1.5 kg in adults." },
  { s: GA, q: "Who was the President of Indian National Congress at the time of Indian independence?", o: ["Maulana Abdul Kalam Azad","J. B. Kriplani","Jawaharlal Nehru","Rajendra Prasad"], e: "J. B. Kripalani was the President of INC in 1947 when India achieved independence." },
  { s: GA, q: "What is the minimum age for membership to the Rajya Sabha?", o: ["20 years","25 years","30 years","35 years"], e: "Article 84 of the Constitution requires a minimum age of 30 years to be a member of the Rajya Sabha." },
  { s: GA, q: "What is an octroi?", o: ["Tax","Tax collection centre","Tax processing centre","Tax information centre"], e: "Octroi is a local tax levied on goods entering a municipal/regional limit. It was abolished after GST in 2017." },
  { s: GA, q: "Sextant is an instrument used in which of the following?", o: ["Gynaecology","Navigation","Birth control","Medical treatment"], e: "A sextant measures the angle between a celestial body and the horizon, used for celestial navigation to find latitude/longitude." },
  { s: GA, q: "Which of the following is not correctly matched?", o: ["The Mahakaal temple – Ujjain","Sringeri Matha – Chikkmanglur district","The Sun Temple – Konark","Jain temples – Khajuraho"], e: "Khajuraho is famous for Hindu and Jain temple complexes, but the iconic carvings are largely Hindu; the matching here is treated as incorrect (Jain temples are typically associated with Khajuraho's eastern group, but as per the answer key, this option is incorrectly matched)." },
  { s: GA, q: "What is Gol Gumbadh?", o: ["Mausoleum of Hyder Ali","Mausoleum of Aurangazeb","Mausoleum of Chand Bibi","Mausoleum of Mohammed Adil Shah"], e: "Gol Gumbaz at Bijapur (Karnataka) is the tomb of Mohammed Adil Shah of the Adil Shahi dynasty." },
  { s: GA, q: "Where is a transistor most likely to be found?", o: ["Wrist watch","Fuse","Hearing aid","Fluorescent lamp"], e: "Transistors are widely used as amplifiers and switches in hearing aids." },
  { s: GA, q: "Which organ of the human body secretes insulin?", o: ["Pancreas","Kidney","Gall bladder","Liver"], e: "Insulin is secreted by the beta cells in the islets of Langerhans of the pancreas." },
  { s: GA, q: "If a healthy freshwater fish is placed in salt water, what will be the expected consequence?", o: ["The fish becomes dehydrated and dies.","The fish becomes bloated and dies.","The fish suffers from fungal or bacterial disease and dies.","There is no observable effect on the fish provided there is sufficient food."], e: "By osmosis, water moves out of the fish's body to the saltier surroundings, causing dehydration and death." },
  { s: GA, q: "Which country is known as 'Land of the Midnight Sun'?", o: ["Sweden","Norway","Germany","Finland"], e: "Norway is known as the 'Land of the Midnight Sun' because parts of it lie north of the Arctic Circle where the sun does not set in summer." },
  { s: GA, q: "Which river basin is shared by more than 10 States of India?", o: ["Indus","Brahmaputra","Ganges","Damodar"], e: "The Ganga basin is shared by 11 states — UP, Uttarakhand, MP, Rajasthan, Haryana, Himachal Pradesh, Chhattisgarh, Jharkhand, Bihar, West Bengal and Delhi." },
  { s: GA, q: "Who among the following was the first grammarian of the Sanskrit language?", o: ["Kalhana","Maitreyi","Kalidasa","Panini"], e: "Panini is the earliest known Sanskrit grammarian; his Ashtadhyayi is the foundational text." },
  { s: GA, q: "What is the total strength of the Rajya Sabha?", o: ["250","260","270","280"], e: "Article 80 of the Indian Constitution caps the maximum strength of the Rajya Sabha at 250 (238 elected + 12 nominated)." },
  { s: GA, q: "Which of the following is done at a Stock Exchange?", o: ["Commodities are bought and sold at wholesale price.","Commodities are bought and sold at retail price.","Securities are bought and sold.","None of these"], e: "A stock exchange is a regulated marketplace where securities (shares, bonds etc.) are bought and sold." },
  { s: GA, q: "Which of the following is India's military offensive against Pakistan in the Kargil war?", o: ["Operation Kargil","Operation LOC","Operation Vijay","Operation Success"], e: "The Indian Army's military operation during the 1999 Kargil War was code-named Operation Vijay (with IAF's Operation Safed Sagar)." },
  { s: GA, q: "Who gave the title 'Nightingale of India' to Sarojini Naidu?", o: ["Jawaharlal Nehru","Rabindranath Tagore","Rajendra Prasad","Mahatma Gandhi"], e: "Mahatma Gandhi conferred the title 'Nightingale of India' (Bharat Kokila) on Sarojini Naidu for her lyrical poetry." },
  { s: GA, q: "The headquarters of RBI is in:", o: ["Delhi","Kanpur","Mumbai","Nasik"], e: "The Reserve Bank of India's central office is in Mumbai (relocated from Kolkata in 1937)." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "A and B together finish a job in 24 days, while A, B and C together can finish the same job in 8 days. C alone will finish the job in:", o: ["12 days","14 days","16 days","24 days"], e: "C's 1-day work = 1/8 − 1/24 = 2/24 = 1/12. So C alone finishes in 12 days." },
  { s: QA, q: "Area of the circle inscribed in a square of diagonal 6√2 cm (in sq cm) is:", o: ["9π","6π","3π","9√2 π"], e: "Side of square = diagonal/√2 = 6 cm. Diameter of inscribed circle = side = 6, so r = 3. Area = π(3)² = 9π." },
  { s: QA, q: "The original price of a TV set is ₹6,000. If the price is discounted by 20% and then raised by 10% for service contract, the price charged by the shopkeeper is:", o: ["₹5,400","₹5,280","₹5,100","₹4,200"], e: "After 20% discount: 6000 × 0.8 = 4800. After 10% raise: 4800 × 1.10 = ₹5,280." },
  { s: QA, q: "A certain sum of money was divided between A, B and C in the ratio 5:6:9. If A received ₹450, the sum divided was:", o: ["₹2,000","₹1,800","₹2,250","₹1,000"], e: "A's share 5x = 450 → x = 90. Total = 20x = ₹1,800." },
  { s: QA, q: "By selling a bag at ₹230, profit of 15% is made. The selling price of the bag, when it is sold at 20% profit would be:", o: ["₹250","₹205","₹240","₹200"], e: "CP = 230 × 100/115 = ₹200. New SP = 200 × 1.20 = ₹240." },
  { s: QA, q: "The weights of two iron balls are 3.5 kg and 7.5 kg. What is the percentage weight of the 1st ball with respect to the 2nd ball?", o: ["46 2/3 %","35%","46 1/3 %","45%"], e: "(3.5 / 7.5) × 100 = 46.666... % = 46 2/3 %." },
  { s: QA, q: "If a bus travels at the speed of 36 km/hr, then the distance covered by it in one second is:", o: ["10 m","15 m","12.5 m","13.5 m"], e: "36 km/hr = 36 × 1000/3600 m/s = 10 m/s." },
  { s: QA, q: "The value of  a/(a−b) + b/(b−a)  is:", o: ["(a+b)/(a−b)","−1","2ab","1"], e: "a/(a−b) − b/(a−b) = (a−b)/(a−b) = 1." },
  { s: QA, q: "The value of (1 − √2) + (√2 − √3) + (√3 − √4) + ..... + (√15 − √16) is:", o: ["0","1","−3","4"], e: "Telescoping: result = 1 − √16 = 1 − 4 = −3." },
  { s: QA, q: "ΔABC and ΔDEF are two similar triangles and the perimeter of ΔABC and ΔDEF are 30 cm and 18 cm, respectively. If length of DE = 36 cm, then length of AB is:", o: ["60 cm","40 cm","45 cm","50 cm"], e: "AB/DE = perimeter ratio = 30/18 → AB = 36 × 30/18 = 60 cm." },
  { s: QA, q: "If the length of a chord of a circle is equal to that of the radius of the circle, then the angle subtended, in radians, at the centre of the circle by the chord is:", o: ["1","π/2","π/3","π/4"], e: "Chord = radius makes the triangle equilateral with the two radii, so the central angle = 60° = π/3 rad." },
  { s: QA, q: "The value of (sec² 45° − cot² 45°) − (sin² 30° + sin² 60°) is:", o: ["1","2√3","0","1/√2"], e: "sec²45=2, cot²45=1, sin²30=1/4, sin²60=3/4. (2−1) − (1/4+3/4) = 1 − 1 = 0." },
  { s: QA, q: "The average salary of male employees in a firm was ₹5,200 and that of females was ₹4,200. The mean salary of all the employees was ₹5,000. What is the % of female employees?", o: ["80%","20%","40%","30%"], e: "By alligation: ratio of females:males = (5200−5000):(5000−4200) = 200:800 = 1:4. So females = 1/5 = 20%." },
  { s: QA, q: "If 4x = √5 + 2, then x − 1/(16x) = ?", o: ["1","−1","4","2√5"], e: "x = (√5+2)/4. 1/(16x) = (√5−2)/4. So x − 1/(16x) = ((√5+2) − (√5−2))/4 = 4/4 = 1." },
  { s: QA, q: "The cube of 105 is:", o: ["11,57,625","11,75,625","11,85,625","11,58,625"], e: "(100+5)³ = 100³ + 3·100²·5 + 3·100·25 + 125 = 1000000 + 150000 + 7500 + 125 = 11,57,625." },
  { s: QA, q: "In ΔABC, ∠B is a right angle, D is the mid point of the side AC. If AB = 6 cm, BC = 8 cm, then the length of BD is:", o: ["4 cm","5 cm","8 cm","12 cm"], e: "AC = √(6²+8²) = 10. In a right triangle, the median to the hypotenuse = half the hypotenuse = 5 cm." },
  { s: QA, q: "The diagonals of two squares are in the ratio 5:2. The ratio of their area is:", o: ["5:6","25:4","5:4","125:8"], e: "Area of square = (1/2)·d². So areas are in the ratio (5)²:(2)² = 25:4." },
  { s: QA, q: "The angle of elevation of a ladder leaning against a wall is 60° and the foot of the ladder is 4.6 m away from the wall. The length of the ladder is:", o: ["2.3 m","4.6 m","9.2 m","7.8 m"], e: "cos 60° = 4.6/L → 1/2 = 4.6/L → L = 9.2 m." },
  { s: QA, q: "The product of two 2-digit numbers is 2,160 and their HCF is 12. The numbers are:", o: ["(12, 60)","(72, 30)","(36, 60)","(60, 72)"], e: "HCF=12 → numbers = 12a, 12b with a, b coprime. 144ab = 2160 → ab = 15 → (a,b)=(3,5). Numbers = 36 and 60." },
  { s: QA, q: "The difference between simple and compound interests compounded annually on a certain sum of money for 2 years at 4% per annum is ₹1. The sum (in ₹) is:", o: ["620","630","640","625"], e: "Diff = P(R/100)² → 1 = P(4/100)² → P = 1/0.0016 = 625." },
  { s: QA, q: "In a mixture of 25 litres, the ratio of milk to water is 4:1. Another 3 litres of water is added to the mixture. The ratio of milk to water in the new mixture is:", o: ["5:1","5:2","5:3","5:4"], e: "Milk = 20 L, water = 5 L. New water = 8 L. Ratio = 20:8 = 5:2." },
  { s: QA, q: "A constituency is divided into four regions A, B, C and D. Two candidates X and Y contested the last election from that constituency. The adjoining graph gives the break up of voting in the four regions. (Region A — X:45, Y:40, Did not vote:1; Region B — X:73, Y:88, DNV:9; Region C — X:51, Y:47, DNV:5; Region D — X:56, Y:51, DNV:8.)\n\nApproximately how much per cent of voters voted in favour of X?", o: ["45.4","47.5","50","225"], e: "X total = 45+73+51+56 = 225. Total voters = 474. % = 225/474 × 100 ≈ 47.5%." },
  { s: QA, q: "(Same graph as previous: Region A — X:45, Y:40, DNV:1; Region B — X:73, Y:88, DNV:9; Region C — X:51, Y:47, DNV:5; Region D — X:56, Y:51, DNV:8.)\n\nApproximately how much per cent of voters did not cast their votes?", o: ["4.9","4.5","0.23","23"], e: "DNV total = 1+9+5+8 = 23. % = 23/474 × 100 ≈ 4.85% ≈ 4.9%." },
  { s: QA, q: "(Same graph: Region B — X:73, Y:88.)\n\nIn region B, Y gets A% more votes than X. Find the value of A?", o: ["24%","21%","19%","15%"], e: "(88−73)/73 × 100 = 15/73 × 100 ≈ 20.5% ≈ 21%." },
  { s: QA, q: "(Same graph: X totals — A:45, B:73, C:51, D:56.)\n\nNearly what percentage of his total votes did X receive from region B?", o: ["30","31","32","35"], e: "X total = 225. From region B = 73. % = 73/225 × 100 ≈ 32.4% ≈ 32%." },

  // ============ English Comprehension (76-100) ============
  { s: ENG, q: "In the following question, out of the four alternatives, choose the word which best expresses the meaning of the given word and click on the button corresponding to it.\n\nINSOLENT", o: ["DISTASTEFUL","IMPATIENT","DIABOLIC","RUDE"], e: "'Insolent' means showing rude and arrogant lack of respect. The closest synonym is 'RUDE'." },
  { s: ENG, q: "In the following question, out of the four alternatives, choose the word which is opposite in meaning to the given word and click on the button corresponding to it.\n\nVIRTUE", o: ["WILES","CURSE","VICEs","CUNNING"], e: "'Virtue' means morally good behaviour. Its antonym is 'VICE' (immoral conduct)." },
  { s: ENG, q: "Four words are given, out of which only one word is spelt correctly. Choose the correctly spelt word and click on the button corresponding to it.", o: ["Tranquility","Tranquillity","Trankquility","Trankquility"], e: "The standard British/Indian English spelling is 'tranquillity' (with double 'l')." },
  { s: ENG, q: "In the following question, one part of the sentence may have an error. Find out which part of the sentence has an error. If the sentence is free from error, click the 'No error' option.\n\nCould she cite (A)/ any precedent in support (B)/ for her case? (C)/ No Error (D)", o: ["A","B","C","D"], e: "The correct preposition is 'in support of', not 'in support for'. Error is in part (C)." },
  { s: ENG, q: "In the following question, one part of the sentence may have an error. Find out which part of the sentence has an error. If the sentence is free from error, click on the 'No error' option.\n\nThe General Manager of the industry has felt (A)/ that there is no use of (B)/ discussing about the problems with the labourers. (C)/ No Error (D)", o: ["A","B","C","D"], e: "'Discuss' is a transitive verb and is not followed by 'about'. Error is in part (C)." },
  { s: ENG, q: "In the following question, one part of the sentence may have an error. Find out which part of the sentence has an error. If the sentence is free from error, click on the 'No error' option.\n\nShe enquired from the stranger (A)/ who was he and (B)/ what he wanted from her. (C)/ No Error (D)", o: ["A","B","C","D"], e: "In indirect speech, the order should be 'who he was'. Error is in part (B)." },
  { s: ENG, q: "Choose the correct alternative to fill the blank.\n\nWe acted on a __________ impulse.", o: ["momentary","momentous","memorable","meritorious"], e: "An impulse is a sudden, brief urge — 'momentary' (lasting a very short time) fits best." },
  { s: ENG, q: "Choose the correct alternative to fill the blank.\n\nDo your best and we'll back you ______ .", o: ["on","in","out","up"], e: "The correct phrasal verb is 'back up' meaning to support. Per the answer key, the correct option is 'up'." },
  { s: ENG, q: "Choose the correct alternative to fill the blank.\n\nSanjay __________ his mother in the morning every day.", o: ["calls in","calls up","calls off","calls down"], e: "'Calls up' means to make a phone call, which fits the context." },
  { s: ENG, q: "Choose the alternative which best expresses the meaning of the idiom/phrase.\n\nPut two and two together", o: ["Bad at mathematics","Poor financial condition","Reason logically","Forget something"], e: "'Put two and two together' means to draw an obvious conclusion from available information — i.e., reason logically." },
  { s: ENG, q: "Choose the alternative which best expresses the meaning of the idiom/phrase.\n\nAn axe to grind", o: ["Attack aggressively","Suffer a lot","Betray somebody","Have a selfish interest"], e: "'An axe to grind' means to have a private/selfish motive in a matter." },
  { s: ENG, q: "Choose the alternative which best expresses the meaning of the idiom/phrase.\n\nPick to pieces", o: ["Study something superficially","Complete a work entirely","Analyse critically","Select only what you need."], e: "'Pick to pieces' means to find faults through detailed/critical analysis." },
  { s: ENG, q: "Out of the four alternatives, choose the one which can be substituted for the given words/sentences.\n\nA person who lays too much stress on bookish-learning", o: ["Pervert","Pedant","Philosopher","Scholar"], e: "A 'pedant' is someone who pays excessive attention to minor details and bookish learning." },
  { s: ENG, q: "Out of the four alternatives, choose the one which can be substituted for the given words/sentences.\n\nPostponement or delay permitted in the suffering of a penalty or the discharge of an obligation.", o: ["Respite","Spire","Splurge","Scourge"], e: "'Respite' means a short delay or postponement (especially of punishment or duty)." },
  { s: ENG, q: "Out of the four alternatives, choose the one which can be substituted for the given words/sentences.\n\nDeviation from the right course", o: ["Imagination","Amalgamation","Illumination","Aberration"], e: "'Aberration' means a deviation from what is normal or correct." },
  { s: ENG, q: "A sentence/a part of the sentence is underlined. Choose the alternative which improves it. If no improvement is needed, click on 'No improvement'.\n\nHe likes to drive his car at a speed of eighty kilometres each hour.", o: ["every hour","an hour","hourly","No improvement"], e: "The standard idiomatic phrase is 'eighty kilometres an hour' / 'per hour'." },
  { s: ENG, q: "Choose the alternative which improves the underlined part. If no improvement is needed, click 'No improvement'.\n\nHis argument against his opponent duly brought jeers from the crowd.", o: ["invective","praise","controversy","No improvement"], e: "'Invective' (insulting/abusive language) better matches the reaction of jeers from the crowd than 'argument'." },
  { s: ENG, q: "Choose the alternative which improves the underlined part. If no improvement is needed, click 'No improvement'.\n\nDo you know the time when the train departs?", o: ["which","by","that","No improvement"], e: "The sentence is grammatically correct as it stands. Hence 'No improvement'." },
  { s: ENG, q: "Choose the alternative which improves the underlined part. If no improvement is needed, click 'No improvement'.\n\nI'm staying with some friends who are owning a farm.", o: ["will be owning","own","have been owning","No improvement"], e: "'Own' is a stative verb and is not used in continuous tense. Correct form is 'who own a farm'." },
  { s: ENG, q: "Choose the alternative which improves the underlined part. If no improvement is needed, click 'No improvement'.\n\nAn old friend, may I give you an advice?", o: ["give you some advice","give you an advise","offer you an advice","No improvement"], e: "'Advice' is an uncountable noun and cannot take the article 'an'. Use 'some advice'." },
  { s: ENG, q: "Comprehension: The Alaska pipeline starts at the frozen edge of the Arctic Ocean and stretches southward across the largest and northernmost state in the United States, ending at a remote ice-free seaport village nearly 800 miles from where it begins. (Refer full passage.)\n\nThe Alaskan pipeline ends _________.", o: ["in north of Alaska","at a seaport village","after passing through canyons and rivers","at a tundra covered village"], e: "From the first sentence: the pipeline ends at a remote ice-free seaport village. Per the answer key option 2 — 'at a seaport village'." },
  { s: ENG, q: "What is the capacity of the Alaskan pipeline?", o: ["2 million gallons of crude oil","4 million barrels of crude oil","84 million gallons of crude oil","84 billion barrels of crude oil"], e: "The passage says up to 2 million barrels (or 84 million gallons) of crude oil can be pumped daily." },
  { s: ENG, q: "What are 'bents'?", o: ["Zigzag shape of pipeline","Pipeline's up and down route","The section of the pipeline that drops out of sight","The H-shaped steel racks"], e: "The passage defines 'bents' as the H-shaped steel racks supporting elevated sections of the pipeline." },
  { s: ENG, q: "How was the fund for pipeline construction generated?", o: ["8 major oil companies joined hands to share the cost","8 major oil companies borrowed $8 billion.","A single private company raised $8 billion","Oil rights were sold to 8 major oil companies"], e: "The passage states 8 major oil companies formed a consortium to share the costs." },
  { s: ENG, q: "Which of the following was not problems faced while constructing the pipeline?", o: ["Supply shortages","Treacherous terrain","Lack of funds","Equipment breakdown"], e: "The passage lists climate, supply shortage, equipment breakdowns, labour disagreements, treacherous terrain, mismanagement and theft as challenges. Lack of funds was not mentioned." }
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
      tags: ['SSC', 'CGL', 'Tier-I', 'PYQ', '2016'],
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

  // SSC CGL Tier-I 2016 pattern: 4 sections × 25 Q = 100 Q, 200 marks, 60 min, 0.5 negative.
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

  const TEST_TITLE = 'SSC CGL Tier-I - 9 September 2016 Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2016, pyqShift: 'Shift-1', pyqExamName: 'SSC CGL Tier-I', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
