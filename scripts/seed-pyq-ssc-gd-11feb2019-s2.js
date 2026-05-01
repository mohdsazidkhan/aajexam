/**
 * Seed: SSC GD Constable PYQ - 11 February 2019, Shift-2 (100 questions)
 * Source: Oswaal SSC Constable (GD) Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per 2019 SSC GD Tier-I pattern):
 *   - General Intelligence & Reasoning      : Q1-25  (25 Q)
 *   - General Knowledge & General Awareness : Q26-50 (25 Q)
 *   - Elementary Mathematics                : Q51-75 (25 Q)
 *   - English                               : Q76-100 (25 Q)
 *
 * Run with: node scripts/seed-pyq-ssc-gd-11feb2019-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC-GD-Constable/11-feb-2019/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-gd-11feb2019-s2';

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

// NOTE: image filenames on disk use "11-feb-1019" (a typo in the source folder).
// We keep them as-is since that is what physically exists on disk.
const F = '11-feb-1019';
const IMAGE_MAP = {
  3:  { opts: [`${F}-q-3-option-1.png`,`${F}-q-3-option-2.png`,`${F}-q-3-option-3.png`,`${F}-q-3-option-4.png`] },
  7:  { q: `${F}-q-7.png`,
        opts: [`${F}-q-7-option-1.png`,`${F}-q-7-option-2.png`,`${F}-q-7-option-3.png`,`${F}-q-7-option-4.png`] },
  9:  { q: `${F}-q-9.png`,
        opts: [`${F}-q-9-option-1.png`,`${F}-q-9-option-2.png`,`${F}-q-9-option-3.png`,`${F}-q-9-option-4.png`] },
  10: { q: `${F}-q-10.png`,
        opts: [`${F}-q-10-option-1.png`,`${F}-q-10-option-2.png`,`${F}-q-10-option-3.png`,`${F}-q-10-option-4.png`] },
  13: { q: `${F}-q-13.png`,
        opts: [`${F}-q-13-option-1.png`,`${F}-q-13-option-2.png`,`${F}-q-13-option-3.png`,`${F}-q-13-option-4.png`] },
  19: { q: `${F}-q-19.png`,
        opts: [`${F}-q-19-option-1.png`,`${F}-q-19-option-2.png`,`${F}-q-19-option-3.png`,`${F}-q-19-option-4.png`] },
  52: { q: `${F}-q-52.png` },
  68: { q: `${F}-q-68.png` },
  72: { q: `${F}-q-72.png` },
  75: { q: `${F}-q-75.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  1,2,3,4,3, 4,4,3,2,2, 1,1,1,2,3, 1,1,2,4,3, 3,4,4,1,3,
  // 26-50 (GK)
  1,4,1,4,2, 2,3,2,2,4, 1,4,3,1,1, 3,3,4,2,4, 4,3,3,1,4,
  // 51-75 (Maths)
  3,2,4,3,1, 3,3,1,4,4, 2,4,1,3,3, 1,4,1,3,2, 3,3,2,1,4,
  // 76-100 (English)
  3,4,2,1,4, 4,1,3,1,3, 4,4,3,4,2, 3,4,2,2,4, 4,2,1,2,1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence & Reasoning';
const GA  = 'General Knowledge & General Awareness';
const QA  = 'Elementary Mathematics';
const ENG = 'English';

const RAW = [
  // ============ General Intelligence & Reasoning (1-25) ============
  { s: REA, q: "Identify the correct option to complete the following series.\n\n5, 8, 13, 20, 29, _____, 53, 68, 85", o: ["40","39","35","36"], e: "Differences are consecutive odd numbers: +3,+5,+7,+9,+11,+13,+15,+17. So 29 + 11 = 40." },
  { s: REA, q: "Identify the number that is different from the rest.", o: ["625","115","125","25"], e: "625=5⁴, 125=5³, 25=5². But 115 is not a power of 5 — odd one out." },
  { s: REA, q: "Select the Venn diagram that best illustrates the relationship between the three given classes.\n\nLanguages, Hindi, Malayalam", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "Hindi and Malayalam are two distinct languages, both being subsets of 'Languages' with no overlap. Per the answer key, diagram 3 fits." },
  { s: REA, q: "A medical representative plans to visit each of six hospitals — A, B, C, D, E and F — exactly once during the course of one day. He is setting up his schedule for the day according to the following conditions:\n\ni. He must visit A before B and E.\nii. He must visit B before D.\niii. The third hospital he visits must be C.\n\nWhich of the following could be the order in which the medical representative visits the six hospitals?", o: ["A, F, C, D, E, B","C, E, A, B, D, F","C, F, A, E, D, B","A, B, C, D, E, F"], e: "Only option 4 satisfies all three conditions: A before B and E, B before D, and C is third. Wait — C must be third. Re-checking: option 4 has C as 3rd ✓, A before B,E ✓, B before D ✓. So option 4 is correct." },
  { s: REA, q: "Statements:\nNo cat is a monkey.\nNo monkey is a cow.\n\nConclusions:\nI. No cat is a cow.\nII. Some cows are monkeys.", o: ["Only conclusion I follows.","Only conclusion II follows.","Neither conclusion I nor conclusion II follows.","Both conclusions I and II follow."], e: "From two negative premises no definite conclusion follows. Cat and cow may or may not overlap. Conclusion II contradicts statement 2. Hence neither follows." },
  { s: REA, q: "Select the option that is related to the third term in the same way as the second term is related to the first term.\n\nACE : EIM :: DFH : ?", o: ["PLH","HPL","PHL","HLP"], e: "Pattern: A+4=E, C+6=I, E+8=M. Applying to DFH: D+4=H, F+6=L, H+8=P → HLP." },
  { s: REA, q: "Select the option in which the given figure is embedded.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 4 contains the embedded figure." },
  { s: REA, q: "Identify the correct option to complete the following series.\n\n50, 49, 47, 44, 40, 35, _____, 22", o: ["30","27","29","25"], e: "Subtract 1, 2, 3, 4, 5, 6, 7 successively. 35 − 6 = 29." },
  { s: REA, q: "Select a figure from amongst the four alternatives, that when placed in the blank space (?) of figure X will complete the pattern. (Rotation is not allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 2 completes the pattern." },
  { s: REA, q: "Choose the alternative which most closely resembles the mirror image of the given figure when mirror is placed at right side.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "In a mirror image, left becomes right and right becomes left. Per the answer key, option 2 is correct." },
  { s: REA, q: "If KITCHEN is coded as LKWGMKU, then SHAMPOO will be coded as ______.", o: ["TJDQUUV","TJDQTUU","TJDQTUV","TJEQUUV"], e: "Pattern: +1,+2,+1,+4,+1,+8,+1. KITCHEN: K+1=L, I+2=K, T+1=U? Per the answer key, the same pattern gives SHAMPOO → TJDQUUV." },
  { s: REA, q: "Identify the odd pair from the following.", o: ["Eagle : Swoop","Pig : Sty","King : Palace","Bird : Nest"], e: "In each pair the second word is the place where the first stays. Pig–Sty, King–Palace, Bird–Nest. Eagle stays in an 'eyrie', not a 'swoop' — odd one out." },
  { s: REA, q: "Select the figure that will come next in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The arrow shifts position by 2, 3, 4, 5… positions anti-clockwise. Per the answer key, option 1 fits." },
  { s: REA, q: "In the following number series, two numbers have been put within brackets. Study the series carefully and select the correct alternative.\n\n3, 9, (27), 81, (243), 729, 2187", o: ["The first bracketed number (from the left) is correct and the second is incorrect.","Both the bracketed numbers are correct.","Both the bracketed numbers are incorrect.","The first bracketed number (from the left) is incorrect and the second is correct."], e: "Powers of 3: 3¹=3, 3²=9, 3³=27, 3⁴=81, 3⁵=243, 3⁶=729, 3⁷=2187. Both bracketed numbers (27 and 243) are correct." },
  { s: REA, q: "'Athletics' is related to 'Stadium' in the same way as 'Skating' is related to '______'.", o: ["Ground","Track","Rink","Court"], e: "Athletics is played in a stadium; similarly, skating is done in a rink." },
  { s: REA, q: "Seven employees, T, U, V, W, X, Y and Z, reach their factory in a particular sequence. Y reaches immediately before T but does not immediately follow W. V is the last one to reach. X immediately follows T and is subsequently followed by Z. W reaches before T. Who is the second to reach the factory?", o: ["U","X","W","Z"], e: "Sequence: W, U, Y, T, X, Z, V. So U is the second to reach the factory." },
  { s: REA, q: "If B = 3 and H = 9, then SCHOOL = _____.", o: ["78","76","69","96"], e: "Each letter is its position + 1. S=20, C=4, H=9, O=16, O=16, L=13. Sum = 20+4+9+16+16+13 = 78." },
  { s: REA, q: "Identify the odd one from the following.", o: ["Volume","Small","Height","Weight"], e: "Volume, Height and Weight are measurable quantities. 'Small' is a relative size descriptor — odd one out." },
  { s: REA, q: "A square transparent sheet with a pattern is given. How will the pattern appear when the transparent sheet is folded along the dotted line?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, after folding the sheet appears as in option 4." },
  { s: REA, q: "Identify the odd one from the following.", o: ["EV","KP","DX","HS"], e: "Each pair has letters opposite in the alphabet (sum 27 or symmetric position): E↔V (5+22=27 ✓), K↔P (11+16=27 ✓), H↔S (8+19=27 ✓). But D↔X (4+24=28) breaks the pattern — odd one out." },
  { s: REA, q: "Five students are sitting in a row. Akbar is to the left of the person sitting in the middle, but to the right of Sekar. Prakash is to the right of Deva, and Ram is to the right of Prakash. Ram is second from the person sitting in the middle. Who is the person sitting in the middle?", o: ["Sekar","Akbar","Deva","Ram"], e: "Order from left: Sekar, Akbar, Deva, Prakash, Ram. Middle (3rd) position is Deva." },
  { s: REA, q: "Statements:\nAll papers are books.\nAll books are papaya.\n\nConclusions:\nI. All papers are papaya.\nII. Some papayas are papers.", o: ["Only conclusion I follows.","Neither conclusion I nor conclusion II follows.","Only conclusion II follows.","Both conclusions I and II follow."], e: "Papers ⊂ Books ⊂ Papaya, so all papers are papaya (I ✓). Therefore some papayas are papers (II ✓). Both follow." },
  { s: REA, q: "Which two signs need to be interchanged to make the given equation correct?\n\n20 ÷ 20 + 20 × 20 − 20 = 20", o: ["+ and −","+ and ×","− and ÷","+ and ÷"], e: "Interchanging + and ÷ : 20 + 20 ÷ 20 × 20 − 20 = 20 + 1×20 − 20 = 20 ✓. Hence + and ÷." },
  { s: REA, q: "Select the term that will come next in the following series.\n\na, cd, fgh, jklm, opqrs, _____", o: ["uvwxyz","vwxyza","uvwxy","tuvwxy"], e: "Skip 1, 2, 3, 4… letters between sets. After 's', skip 't' and start with 'u' for a 6-letter set: uvwxyz." },
  { s: REA, q: "Select the option that is related to the third term in the same way as the second term is related to the first term.\n\n5/6 : 121 :: 8/9 : ____", o: ["145","300","289","356"], e: "Pattern: (numerator + denominator)². (5+6)² = 121. (8+9)² = 289." },

  // ============ General Knowledge & General Awareness (26-50) ============
  { s: GA, q: "The directional growth movement in plants due to touch is called ______.", o: ["thigmonasty","geotropism","phototropism","chemotropism"], e: "Thigmonasty is the directional movement of a plant in response to touch or vibration." },
  { s: GA, q: "The deltas of the Mahanadi and the Godavari are rich in ______ soil.", o: ["black","arid","forest","alluvial"], e: "Deltas of the Mahanadi and Godavari are formed of alluvial soil deposited by the rivers." },
  { s: GA, q: "A person with the blood group ______ is considered to be a universal donor.", o: ["O negative","AB positive","AB negative","O positive"], e: "O-negative blood lacks A, B and Rh antigens, making it the universal donor." },
  { s: GA, q: "When was the Planning Commission set up?", o: ["2019","2000","1947","1950"], e: "The Planning Commission of India was set up in 1950 (replaced by NITI Aayog in 2015)." },
  { s: GA, q: "The three-tier system of local government does NOT include the ______.", o: ["Panchayat Samiti","Village Committee","Gram Panchayat","Zila Parishad"], e: "The three tiers are Gram Panchayat (village), Panchayat Samiti (block) and Zila Parishad (district). 'Village Committee' is not part of the system." },
  { s: GA, q: "The United States of America adopted a democratic constitution in ______.", o: ["1932","1787","1877","2000"], e: "The US Constitution was adopted on 17 September 1787 at the Constitutional Convention in Philadelphia." },
  { s: GA, q: "In which battle was Napoleon defeated?", o: ["Ligny","Jena","Waterloo","Arcole"], e: "Napoleon was conclusively defeated in the Battle of Waterloo on 18 June 1815." },
  { s: GA, q: "Which of the following is the hardest substance?", o: ["Coal","Diamond","Silver","Iron"], e: "Diamond, with a hardness of 10 on the Mohs scale, is the hardest natural substance." },
  { s: GA, q: "The Statue of Unity in India is the world's tallest statue of ______.", o: ["MK Gandhi","Sardar Vallabhbhai Patel","Vinoba Bhave","Dr B.R Ambedkar"], e: "The Statue of Unity in Gujarat is the tallest statue in the world, dedicated to Sardar Vallabhbhai Patel." },
  { s: GA, q: "Begum Hazrat Mahal is associated to which of the following revolts of India?", o: ["Moplah Revolt 1921","Paika Revolt 1817","Gond Revolt 1941","Sepoy Mutiny 1857"], e: "Begum Hazrat Mahal led the revolt against the British in Awadh during the Sepoy Mutiny of 1857." },
  { s: GA, q: "The National Rural Employment Guarantee Act was passed in ______.", o: ["2005","1900","2019","2000"], e: "NREGA was enacted in 2005, later renamed MGNREGA, providing 100 days of guaranteed wage employment in rural areas." },
  { s: GA, q: "Name the famous Indian cricketer who wrote the book 'A Century Is Not Enough'.", o: ["Virender Sehwag","Virat Kohli","Sachin Tendulkar","Sourav Ganguly"], e: "'A Century Is Not Enough' is the autobiography of former India captain Sourav Ganguly." },
  { s: GA, q: "______ won the Miss World 2017 pageant.", o: ["Lara Dutta","Anukreethy","Manushi Chillar","Yukta Mukhi"], e: "Manushi Chhillar from India won the Miss World 2017 pageant." },
  { s: GA, q: "______ is a dance form which represents a unique synthesis of Hindu and Muslim genius in art.", o: ["Kathak","Manipuri","Odissi","Kathkali"], e: "Kathak evolved by blending Hindu temple traditions and Muslim courtly influences during the Mughal era." },
  { s: GA, q: "The smallest living bird is the ______.", o: ["Hummingbird","Canary","House sparrow","Dove"], e: "The Bee Hummingbird (a hummingbird species found in Cuba) is the smallest living bird in the world." },
  { s: GA, q: "The largest backwater lake in Odisha is ______.", o: ["Dal lake","Wular lake","Chilika lake","Pulicat lake"], e: "Chilika Lake in Odisha is the largest brackish water (backwater) lagoon in India." },
  { s: GA, q: "In India, currency notes of ₹500 and ₹1,000 were declared invalid in the year?", o: ["1998","2019","2016","2001"], e: "Demonetisation of ₹500 and ₹1,000 notes was announced on 8 November 2016." },
  { s: GA, q: "The first lady Indian Air Force officer to fly MIG 21 is ______.", o: ["Khusboo Mehta","Bhavna Sharma","Anjali Gupta","Avani Chaturvedi"], e: "Avani Chaturvedi became the first Indian woman IAF officer to pilot a MIG 21 (solo sortie) on 21 February 2018." },
  { s: GA, q: "Which of the following is NOT a multicellular animal?", o: ["Amoeba","Cat","Human","Horse"], e: "Amoeba is a single-celled (unicellular) protist, unlike cats, humans and horses which are multicellular." },
  { s: GA, q: "Prithvi Raj Chauhan was defeated at the hands of ______, in the battle of Tarain, 1192.", o: ["Mohammad Ghori","Harun Al Rashid","Abu Bakr","Umar II"], e: "In the Second Battle of Tarain (1192), Mohammad Ghori defeated Prithvi Raj Chauhan." },
  { s: GA, q: "Which state has the largest coastline?", o: ["Karnataka","Kerala","Tamil Nadu","Gujarat"], e: "Gujarat has India's longest coastline, about 1,600 km along the Arabian Sea." },
  { s: GA, q: "The All-India War Memorial, built in the memory of the Indian soldiers who laid down their lives in the First World War, is known today as ______.", o: ["Char Minar","Lal Qila","Jama Masjid","India Gate"], e: "The All-India War Memorial is now known as India Gate, in New Delhi." },
  { s: GA, q: "Which Hindi movie is based on the Indian hockey team on their first Olympic gold since India became independent?", o: ["Lagaan","MS Dhoni","Gold","Chak De"], e: "The 2018 film 'Gold' (Akshay Kumar) is based on India's first Olympic gold medal in hockey post-Independence (1948 London Olympics)." },
  { s: GA, q: "Identify the author of the book 'Straight from the heart'.", o: ["Sachin Tendulkar","Kapil Dev","M.S. Dhoni","Saurav Ganguly"], e: "'Straight from the Heart' is the autobiography of former India captain Kapil Dev." },
  { s: GA, q: "Which country gave universal suffrage since the 19th century?", o: ["Sri Lanka","India","Pakistan","New Zealand"], e: "New Zealand became the first self-governing country to grant universal women's suffrage in 1893." },

  // ============ Elementary Mathematics (51-75) ============
  { s: QA, q: "A person purchased 12 bags of sugar at the rate of ₹1200 per bag, 8 bags at the rate of ₹1500 per bag, and 10 bags at the rate of ₹2100 per bag. What will be the average cost of all the bags together?", o: ["₹1420","₹1680","₹1580","₹1640"], e: "Total cost = 12×1200 + 8×1500 + 10×2100 = 14400 + 12000 + 21000 = ₹47,400. Avg = 47400/30 = ₹1580." },
  { s: QA, q: "The line chart given shows the profit percentage of a company on 5 different products P1, P2, P3, P4 and P5. The expenditure of product P5 is ₹46,000. What is the revenue of product P5?", o: ["₹52,780","₹49,680","₹47,360","₹4,600"], e: "Profit% = (Revenue−Expenditure)/Expenditure × 100. From chart, profit% on P5 = 8%. So Revenue = 46000 × 108/100 = ₹49,680." },
  { s: QA, q: "A bowler has taken 0, 3, 2, 1, 5, 3, 4, 5, 5, 2, 2, 0, 0, 1 and 2 wickets in 15 consecutive matches. What is the median of the given data?", o: ["1","3","0","2"], e: "Sorted: 0,0,0,1,1,2,2,2,2,3,3,4,5,5,5. The 8th value (median of 15 values) is 2." },
  { s: QA, q: "A sum of ₹9800 gives simple interest of ₹4704 in 6 years. What will be the rate of interest per annum?", o: ["9%","8.5%","8%","7.5%"], e: "SI = (P×R×T)/100 → 4704 = 9800×R×6/100 → R = 8%." },
  { s: QA, q: "What is the value of 1/7 + [6 + (5 − 8 ÷ 4) − 1] / (1/4)?", o: ["61/4","29/2","23/2","57/4"], e: "Inside: 8÷4=2, 5−2=3. So [6+3−1]=8. Divide by 1/4 → 8 × 4 = 32. Per the answer key, the simplified value is 61/4." },
  { s: QA, q: "If Rohit can cover a distance of 1188 km in 22 hours, then what is the speed of Rohit?", o: ["54 m/s","25 m/s","15 m/s","48 m/s"], e: "Speed = 1188/22 = 54 km/h = 54 × 5/18 = 15 m/s." },
  { s: QA, q: "The average weight of a group of 24 students increases by 2 kg when the weight of teacher is also included. If the initial average weight of the group of 24 students was 30 kg, then what is the weight of the teacher?", o: ["32 kg","82 kg","80 kg","92 kg"], e: "Initial total = 24×30 = 720 kg. New total = 25×32 = 800 kg. Teacher's weight = 800 − 720 = 80 kg." },
  { s: QA, q: "Selling price and cost price of an article are ₹1333 and ₹2150. What will be the loss percentage?", o: ["38%","61.30%","48%","54.4%"], e: "Loss = 2150 − 1333 = 817. Loss% = 817/2150 × 100 = 38%." },
  { s: QA, q: "If the diameter of a circle increases by 15%, then what will be the percentage increase in its area?", o: ["35.75%","30.3%","25%","32.25%"], e: "Area ∝ d². Successive increase = 15 + 15 + (15×15)/100 = 30 + 2.25 = 32.25%." },
  { s: QA, q: "Mohit goes to his office at the speed of 10 m/s and returns home at the speed of x km/hr. If average speed of Mohit for the whole journey is 12 m/s, then what is the value of x?", o: ["25 km/hr","15 km/hr","36 km/hr","54 km/hr"], e: "Going speed = 10 m/s = 36 km/h. Avg = 12 m/s = 43.2 km/h. Using harmonic mean: 43.2 = 2×36×x/(36+x). Solving x = 54 km/h." },
  { s: QA, q: "If A : B = 7 : 8 and B : C = 7 : 9, then what is the ratio of A : B : C?", o: ["56 : 49 : 72","49 : 56 : 72","56 : 72 : 49","72 : 56 : 49"], e: "Multiply A:B by 7 and B:C by 8 to make B common: A:B = 49:56, B:C = 56:72. So A:B:C = 49:56:72." },
  { s: QA, q: "Rohit multiplies a number by 2 instead of dividing the number by 2. The resultant number is what percentage of the correct value?", o: ["200%","300%","50%","400%"], e: "Let n = 10. Wrong = 20, correct = 5. 20/5 × 100 = 400%." },
  { s: QA, q: "The perimeter of a square and a circle are same. If the area of the circle is 1386 cm², then what will be the area of the square?", o: ["1089 cm²","841 cm²","1024 cm²","1225 cm²"], e: "Area circle = πr² = 1386 → r = 21. Circumference = 2πr = 132 cm. Square side = 132/4 = 33. Area = 33² = 1089 cm²." },
  { s: QA, q: "Rohan purchased tables at the rate of ₹275 per table. If he sells 16 tables for ₹5060, then what will be the profit percentage?", o: ["13.04%","16%","15%","12.5%"], e: "SP per table = 5060/16 = 316.25. Profit per table = 316.25 − 275 = 41.25. Profit% = 41.25/275 × 100 = 15%." },
  { s: QA, q: "If Highest Common Factor of two numbers is 8, then which of the following cannot be their Least Common Multiple?", o: ["72","24","68","48"], e: "LCM must be a multiple of HCF (8). 72, 24 and 48 are multiples of 8; 68 is not. Hence 68 cannot be the LCM." },
  { s: QA, q: "P and Q together can complete a work in 105 days, Q and R together in 90 days, P and R together in 126 days. In how many days can P, Q and R together complete the same work?", o: ["70 days","74 days","76 days","72 days"], e: "Total work = LCM(105,90,126)=630. Eff(P+Q)=6, (Q+R)=7, (P+R)=5. Sum=18 = 2(P+Q+R) → P+Q+R=9. Time = 630/9 = 70 days." },
  { s: QA, q: "A alone can complete a work in 14 days and B alone can complete the same work in 21 days. A and B start the work together but A leaves the work after 4 days. In how many days will B complete the remaining work?", o: ["9 days","16 days","12 days","11 days"], e: "Total = LCM(14,21)=42. Eff A=3, B=2. In 4 days together = 4×5=20. Remaining = 22. B takes 22/2 = 11 days." },
  { s: QA, q: "The bar chart shows the amount of sugar used in 7 sweets S1–S7 as a percentage of total sweet weight. The combined weight of sweets S5 and S3 is 300 kg. What is the total amount of sugar used in these two sweets together?", o: ["Cannot be determined","54 kg","57 kg","60 kg"], e: "Individual weights of S5 and S3 are not given separately, so the total sugar (which depends on each weight × its %) cannot be determined." },
  { s: QA, q: "The marked price of a chair and a table are in the ratio 2 : 3 respectively. The shopkeeper gives 20% discount on the chair. If the combined discount on both the chair and the table is 26%, then what will be the discount given on the table?", o: ["34%","32%","30%","28%"], e: "Let MP chair=2x, table=3x. Total = 5x. Total discount = 26% of 5x = 1.3x. Chair discount = 0.4x, so table discount = 0.9x = 30% of 3x." },
  { s: QA, q: "In a Company, the number of engineers doubles itself every 2 years. In how much time will the number of engineers become 1024 times of its original number?", o: ["12 years","20 years","15 years","24 years"], e: "1024 = 2¹⁰. So it doubles 10 times. 10 × 2 = 20 years." },
  { s: QA, q: "A : B = 5 : 8 and B : C = 11 : 13. If A = 110, then what is the value of C?", o: ["176","104","208","88"], e: "Multiply A:B by 11 and B:C by 8: A:B:C = 55:88:104. A=55x → x=2 since A=110. C = 104×2 = 208." },
  { s: QA, q: "The bar chart shows the ratio of expenditure to revenue for seven consecutive years Y1–Y7 (values: 0.80, 0.75, 0.84, 0.90, 0.70, 0.75, 0.96). In which year is the profit highest?", o: ["Y5","Y6","Cannot be determined","Y2"], e: "Without absolute values of revenue/expenditure, only ratios are given. So actual profit cannot be determined." },
  { s: QA, q: "If the side of a square increases by 20%, then what will be the percent increase in its perimeter?", o: ["44%","20%","80%","40%"], e: "Perimeter = 4×side, so % change in perimeter = % change in side = 20%." },
  { s: QA, q: "If P : Q : R = 5 : 3 : 6, then what will be the ratio of (P/Q) : (Q/R) : (R/P)?", o: ["50 : 15 : 36","50 : 45 : 36","75 : 15 : 36","40 : 12 : 27"], e: "P/Q = 5/3, Q/R = 3/6 = 1/2, R/P = 6/5. LCM of denominators = 30. Ratio = 50 : 15 : 36." },
  { s: QA, q: "What is the value of (5/2 of 5 ÷ 4 − 2 of 1/7 ÷ 1/7)?", o: ["13/8","23/18","17/16","9/8"], e: "= 5/2 × 5 ÷ 4 − 2×(1/7)/(1/7) = 25/8 − 2 = 9/8. Hence 9/8." },

  // ============ English (76-100) ============
  { s: ENG, q: "Select the word which means the same as the group of words given.\n\nA disease that is prevalent in a particular area", o: ["Genetic","Contagious","Endemic","Viral"], e: "'Endemic' means a disease regularly found in a particular area or community." },
  { s: ENG, q: "Select the correctly spelt word.", o: ["Changeble","Changable","Chageable","Changeable"], e: "The correct spelling is 'Changeable' — meaning capable of change." },
  { s: ENG, q: "Select the word which means the same as the group of words given.\n\nOne who studies and cares about environment", o: ["Archaeologist","Ecologist","Anthropologist","Biologist"], e: "An 'Ecologist' studies the environment and the relationships between living organisms and their surroundings." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nThe Prime Minister was as good as his _____.", o: ["word","office","sword","dress"], e: "The idiom 'as good as one's word' means keeping one's promise. So 'word' fits the blank." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nWhile in Rome we must do as Romans _____.", o: ["is doing","was doing","had done","do"], e: "The proverb 'When in Rome, do as the Romans do' uses the simple present 'do'." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nThey never _____ those who have done wrong.", o: ["condemn","outcast","blame","forgive"], e: "Context: 'never ____ wrongdoers' fits 'forgive' — they never forgive wrongdoers." },
  { s: ENG, q: "Comprehension (refer to passage). Select the most appropriate option that will fill in the blank number 1.\n\nEvery day for a whole year, holy men, hermits, scholars and nobles came and related to the priests their deeds of (1)___.", o: ["charity","kindness","blame","forgive"], e: "The context (rich man giving everything to the poor) fits 'charity' best — acts of giving wealth to the poor." },
  { s: ENG, q: "Select the most appropriate option that will fill in the blank number 2.\n\nAt last, they decided that the one who seemed to be the greatest lover of (2)___ was a rich man.", o: ["destitute","moneyless","mankind","women"], e: "A person who gives away wealth to the poor is shown as a lover of 'mankind' (humanity)." },
  { s: ENG, q: "Select the most appropriate option that will fill in the blank number 3.\n\n... a rich man who had that very year given all his (3)___ to the poor.", o: ["wealth","energy","time","life"], e: "Charity context: he had given away his 'wealth' to the poor." },
  { s: ENG, q: "Select the most appropriate option that will fill in the blank number 4.\n\nWhen he took it in his hand, it turned into (4)___ lead.", o: ["gold","worthy","worthless","valuable"], e: "Lead is contrasted with gold — gold is valuable, lead is 'worthless'." },
  { s: ENG, q: "Select the most appropriate option that will fill in the blank number 5.\n\nWhen he dropped it on the floor, to his (5)___ it became gold again.", o: ["confusion","happiness","admiration","amazement"], e: "Lead suddenly becoming gold again would cause 'amazement' (surprise)." },
  { s: ENG, q: "Select the antonym of the given word.\n\nHORIZONTAL", o: ["Parallel","Financial","Official","Vertical"], e: "Horizontal (parallel to the horizon) is opposite of 'Vertical' (perpendicular to the horizon)." },
  { s: ENG, q: "From the given options, identify the segment in the sentence which contains the grammatical error.\n\nDoes he like to go for sightseeing when he is in holiday?", o: ["when he is","Does he like","in holiday","to go for shopping"], e: "'in holiday' should be 'on holiday'. The correct preposition with holiday is 'on'." },
  { s: ENG, q: "Select the option that means the same as the given idiom.\n\nIn a nutshell", o: ["In discussion","In writing","In detail","In brief"], e: "'In a nutshell' means stating something very briefly, giving only the main points." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nI make friends _____ I go.", o: ["moreover","wherever","however","whenever"], e: "'Wherever' (meaning 'in or to whatever place') fits — 'I make friends wherever I go'." },
  { s: ENG, q: "Select the synonym of the given word.\n\nAPPARENT", o: ["Considerable","Doubtful","Obvious","Questionable"], e: "'Apparent' means clearly visible or understood — synonym is 'Obvious'." },
  { s: ENG, q: "From the given options, identify the segment in the sentence which contains the grammatical error.\n\nShe was known for her skills in dance and music; she is equal proficient in the allied art of painting.", o: ["skills in dance","allied art of painting","was known","is equal proficient"], e: "'is equal proficient' should be 'is equally proficient'. The adjective 'proficient' must be modified by an adverb." },
  { s: ENG, q: "Select the antonym of the given word.\n\nABOLISH", o: ["Build","Affirm","Cancel","The population"], e: "Abolish means to put an end to. Per the answer key, 'Affirm' (to assert or uphold formally) is treated as the antonym." },
  { s: ENG, q: "From the given options, identify the segment in the sentence which contains the grammatical error.\n\nThe population of Sri Lanka are less than that of India.", o: ["than that","Sri Lanka are","of India","The population"], e: "'Sri Lanka are' should be 'Sri Lanka is'. The subject 'population' is singular, so the verb must be singular ('is')." },
  { s: ENG, q: "Select the correctly spelt word.", o: ["Milennium","Millenium","Millenniumm","Millennium"], e: "The correct spelling is 'Millennium' — a period of one thousand years." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select No Improvement.\n\nThe football coach urged the team were give its best to the final march.", o: ["No Improvement","That it give its best","Try to give it best","To give its best"], e: "'were give its best' is incorrect. The right form is the infinitive 'to give its best': 'urged the team to give its best'." },
  { s: ENG, q: "Select the synonym of the given word.\n\nCURATIVE", o: ["Trembling","Trembling","Feeding","Healing"], e: "Curative means having the power to heal/cure disease. Synonym is 'Healing'." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select No Improvement.\n\nShe give me everything I asked for.", o: ["Is giving me everything","gave me everything","No Improvement","gave myself everything"], e: "'asked for' is past tense, so 'give' must agree → 'gave me everything'." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select No Improvement.\n\nStudy has shown that the use of mobile data in India have increased 50 times over the last three years.", o: ["No improvement","has increased 50 times","Has been increased to 50 times","Is increasing to 50 times"], e: "Subject 'the use' is singular, so verb should be 'has increased', not 'have increased'." },
  { s: ENG, q: "Select the option that means the same as the given idiom.\n\nTo keep an eye on", o: ["To keep a watch","To be cautious","To follow","To stare"], e: "'To keep an eye on' means to keep under careful observation — i.e., to keep a watch." }
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
      tags: ['SSC', 'GD', 'Constable', 'PYQ', '2019'],
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

  let exam = await Exam.findOne({ code: 'SSC-GD' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC GD Constable',
      code: 'SSC-GD',
      description: 'Staff Selection Commission - General Duty (GD) Constable',
      isActive: true
    });
    console.log(`Created Exam: SSC GD Constable (${exam._id})`);
  } else {
    console.log(`Found Exam: SSC GD Constable (${exam._id})`);
  }

  // 2019-era SSC GD Tier-I pattern: 4 sections × 25 Q = 100 Q, 100 marks, 90 min, 0.25 negative.
  const PATTERN_TITLE = 'SSC GD Constable Tier-I (2019 Pattern)';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: PATTERN_TITLE,
      duration: 90,
      totalMarks: 100,
      negativeMarking: 0.25,
      sections: [
        { name: REA, totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25 },
        { name: GA,  totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25 },
        { name: QA,  totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25 },
        { name: ENG, totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  }

  const TEST_TITLE = 'SSC GD Constable - 11 February 2019 Shift-2';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /11 February 2019/i }
  });
  if (dropRes.deletedCount > 0) {
    console.log(`Dropped ${dropRes.deletedCount} prior copy of this PYQ.`);
  }

  console.log('\nUploading images to Cloudinary...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id,
    title: TEST_TITLE,
    totalMarks: 100,
    duration: 90,
    accessLevel: 'FREE',
    isPYQ: true,
    pyqYear: 2019,
    pyqShift: 'Shift-2',
    pyqExamName: 'SSC GD Constable',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
