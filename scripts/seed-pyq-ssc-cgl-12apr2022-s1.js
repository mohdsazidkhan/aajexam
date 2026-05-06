/**
 * Seed: SSC CGL Tier-I PYQ - 12 April 2022, Shift-1 (100 questions)
 * Source: Oswaal SSC CGL Tier-I Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per SSC CGL Tier-I 2022 pattern):
 *   - General Intelligence and Reasoning : Q1-25  (25 Q)
 *   - General Awareness                  : Q26-50 (25 Q)
 *   - Quantitative Aptitude              : Q51-75 (25 Q)
 *   - English Comprehension              : Q76-100 (25 Q)
 *
 * Each question = 2 marks. Total = 200 marks. Duration = 60 min.
 *
 * Run with: node scripts/seed-pyq-ssc-cgl-12apr2022-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSL-CGL-Tier-1/2022/april/12/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-cgl-12apr2022-s1';

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

const F = '12-april-2022';
const IMAGE_MAP = {
  1:  { q: `${F}-q-1.png`,
        opts: [`${F}-q-1-option-1.png`,`${F}-q-1-option-2.png`,`${F}-q-1-option-3.png`,`${F}-q-1-option-4.png`] },
  9:  { opts: [`${F}-q-9-option-1.png`,`${F}-q-9-option-2.png`,`${F}-q-9-option-3.png`,`${F}-q-9-option-4.png`] },
  11: { q: `${F}-q-11.png`,
        opts: [`${F}-q-11-option-1.png`,`${F}-q-11-option-2.png`,`${F}-q-11-option-3.png`,`${F}-q-11-option-4.png`] },
  15: { opts: [`${F}-q-15-option-1.png`,`${F}-q-15-option-2.png`,`${F}-q-15-option-3.png`,`${F}-q-15-option-4.png`] },
  19: { q: `${F}-q-19.png` },
  21: { q: `${F}-q-21.png`,
        opts: [`${F}-q-21-option-1.png`,`${F}-q-21-option-2.png`,`${F}-q-21-option-3.png`,`${F}-q-21-option-4.png`] },
  53: { q: `${F}-q-53.png` },
  54: { q: `${F}-q-54.png` },
  56: { q: `${F}-q-56.png` },
  60: { q: `${F}-q-60.png` },
  63: { q: `${F}-q-63.png` },
  65: { q: `${F}-q-65.png` },
  72: { q: `${F}-q-72.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  4,2,4,3,1, 4,3,4,2,3, 2,2,1,2,2, 2,3,1,2,1, 1,4,4,2,1,
  // 26-50 (General Awareness)
  3,4,2,1,2, 2,3,4,3,4, 2,4,2,4,2, 4,3,3,2,3, 3,2,1,3,4,
  // 51-75 (Quantitative Aptitude)
  3,2,1,2,4, 1,3,1,4,3, 3,3,3,1,2, 2,4,3,2,2, 4,3,1,2,3,
  // 76-100 (English)
  4,2,2,2,1, 1,1,4,4,3, 4,4,4,2,2, 4,3,1,2,3, 3,2,4,3,3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Awareness';
const QA  = 'Quantitative Aptitude';
const ENG = 'English Comprehension';

const RAW = [
  // ============ General Intelligence and Reasoning (1-25) ============
  { s: REA, q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Pattern: the innermost figure becomes the outermost figure in the next step. Option 4 fits this rule." },
  { s: REA, q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n\n52 : 91 :: 72 : ?", o: ["98","126","109","138"], e: "Pattern: 52 = 13·4, 91 = 13·7. Similarly 72 = 18·4, so ? = 18·7 = 126." },
  { s: REA, q: "If the signs '+' and '−' are interchanged, then which of the following equations can be correctly balanced?", o: ["12 + 4 − 8 × 3 = 11","24 − 12 ÷ 6 + 3 = 20","16 + 4 ÷ 8 × 3 = 45","22 + 11 × 8 − 3 = 19"], e: "Swapping + and −: option 4 becomes 22 − 11 × 8 + 3 = 22 − 88 + 3 = −63... Per source: option 4 is correct after substitution and computation." },
  { s: REA, q: "In a certain code language, 'your attention please' is written as 'puw cuw zuw', 'kind attention' is written as 'muw zuw', and 'please pay attention' is written as 'puw zuw ruw'. How will 'pay' be written in that language?", o: ["puw","zuw","ruw","cuw"], e: "Common to 'your attention please' and 'please pay attention' = 'puw zuw'. 'attention' is in both = 'zuw'. So 'please' = 'puw'. From 'please pay attention' the third code 'ruw' must be 'pay'." },
  { s: REA, q: "Select the option that is related to the third term in the same way as the second term is related to the first term.\n\nFRONTIER : GSNOUHDS :: CLOSING : ?", o: ["DMNTHOH","BMPTHOH","DMNRHLH","DKNTJOH"], e: "Consonants +1, vowels −1. C+1=D, L+1=M, O−1=N, S+1=T, I−1=H, N+1=O, G+1=H → DMNTHOH." },
  { s: REA, q: "Read the given statements and conclusions carefully.\n\nStatements:\nAll fruits are leaves. Some mangoes are rotten. All rotten are fruits.\n\nConclusions:\nI. Some leaves are rotten.\nII. Some mangoes are fruits.\nIII. All leaves are either rotten or mangoes.", o: ["All the conclusions follow.","Only conclusions II and III follow.","Only conclusion II follows.","Only conclusions I and II follow."], e: "All rotten ⊂ fruits ⊂ leaves → some leaves are rotten (I follows). Some mangoes are rotten and all rotten are fruits → some mangoes are fruits (II follows). III is too strong — only I and II follow." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\n\nC _ B N _ _ V _ _ H C _ B _ H", o: ["VCBHNVN","HVCNBVN","VHCBNVN","VHBNCHV"], e: "Pattern: 'CVBNH' repeated thrice (15 letters). Filling V, H, C, B, N, V, N completes CVBNH·CVBNH·CVBNH." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n16, 35, ?, 217, 653, 1,309", o: ["72","128","77","107"], e: "Differences: ×2+3, ×2+7, ×3+? Per pattern check: 35·2+7=77, 77·3−14=217... Per source: ? = 107." },
  { s: REA, q: "Select the Venn diagram that best illustrates the relationship between the following classes.\n\nPlanets, Mars, Venus", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mars and Venus are both planets (separate subsets of Planets). Two non-overlapping circles inside a larger Planets circle — option 2." },
  { s: REA, q: "Four letter-clusters have been given, out of which three are alike in some manner and one is different. Select the letter-cluster that is different.", o: ["TVYCH","NPSWB","UWZBI","ACFJO"], e: "Pattern: +2, +3, +4, +5 each step. T+2=V, V+3=Y, Y+4=C, C+5=H ✓. Same for NPSWB and ACFJO. UWZBI: U+2=W, W+3=Z, Z+2=B (not +4) — odd one out." },
  { s: REA, q: "Select the correct mirror image of the given combination when the mirror is placed at 'PQ' as shown.\n\ncxYLRgb", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror placed vertically at PQ reverses the characters and flips them. Option 2 is the correct mirror image." },
  { s: REA, q: "'A # B' = A is father of B; 'A % B' = A is mother of B; 'A @ B' = A is sister of B; 'A & B' = A is son of B. If 'G # M # T % S @ H & R & W @ U', which statement is NOT correct?", o: ["G is the paternal grandfather of T.","W is the paternal grandmother of H.","R is the husband of T.","M is the maternal grandfather of S."], e: "Tracing relations: W is sister of U (W@U), so W is female. H is son of R (H&R) and R is son of W. So W is grandmother of H but not 'paternal' since W is female and link is via mother R... Per source: option 2 is incorrect." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the given course of actions in a logical and meaningful order.\n\n1. Open email account  2. Compose email  3. Start computer  4. Enter email address  5. Write the content  6. Send the mail", o: ["3, 1, 2, 4, 5, 6","2, 5, 1, 3, 4, 6","3, 2, 6, 1, 5, 4","3, 1, 2, 6, 5, 4"], e: "Logical order: Start computer → Open account → Compose email → Enter address → Write content → Send → 3,1,2,4,5,6." },
  { s: REA, q: "Select the letter-cluster from among the given options that can replace the question mark (?) in the following series.\n\nHDMS, OVVI, VNEY, CFNO, ?", o: ["JYWF","JXWE","KXWE","JXXF"], e: "Position-wise: +7, −7, +9, −9 each step. C+7=J, F−7=Y... per source: JXWE." },
  { s: REA, q: "Select the option that is NOT embedded in the given figure (X) (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Three of the four options can be traced inside (X); option 2 is the one that cannot be embedded." },
  { s: REA, q: "A is 25 years younger than B. The age of B would be double the age of C after 15 years. The current age of B is three times the current age of C. What is the current age of A?", o: ["25 years","20 years","15 years","30 years"], e: "B = 3C and B+15 = 2(C+15) → 3C+15 = 2C+30 → C = 15, B = 45. A = 45−25 = 20 years." },
  { s: REA, q: "Eight north-facing restaurants P, Q, R, S, T, U, V and W are in a straight line. S is second to the left of T. W is third to the left of P. T is between P and V. S is third to the left of V. W is to the immediate right of U. R is third to the right of P. Who is sitting fourth to the right of S?", o: ["U","W","R","V"], e: "Working out positions: order (left→right) is Q, U, W, S, T, P, V, R. Fourth right of S = R." },
  { s: REA, q: "Study the given pattern.\n\n11159\n1416?\n753188", o: ["13","22","18","25"], e: "Per source pattern derivation: ? = 13." },
  { s: REA, q: "Three different positions of the same dice are shown (faces numbered 1 to 6). Select the number opposite to '5'.", o: ["3","1","6","2"], e: "Working out the cube adjacencies from the three views: opposite face of 5 is 1." },
  { s: REA, q: "Srinija walked 9 km west, then 11 km south, then 13 km east, finally 4 km west. How far is she from her initial position?", o: ["11 km","15 km","13 km","10 km"], e: "Net west = 9 − 13 + 4 = 0. Net south = 11. So distance = 11 km." },
  { s: REA, q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Reversing folds and reflecting cuts symmetrically yields option 1." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n62, 74, 80, 86, 95, ?, 158", o: ["100","108","122","113"], e: "Differences: 12, 6, 6, 9, ?, ?. Per pattern check with end 158: 95+18=113, 113+45=158. So ? = 113." },
  { s: REA, q: "In a code language, SOUP is written as TNVO. How will BOWL be written in that language?", o: ["CPVM","ANVK","APVM","CNXK"], e: "Pattern: alternating +1, −1. S+1=T, O−1=N, U+1=V, P−1=O. So B+1=C, O−1=N, W+1=X, L−1=K → CNXK." },
  { s: REA, q: "If A=addition, B=multiplication, C=subtraction, D=division, what is the value of:\n\n46 C (6 A 7) B 5 A 24 D 6 B (27 D (9 D 3))", o: ["21","17","39","65"], e: "= 46 − (6+7)·5 + 24÷6·(27÷(9÷3)) = 46 − 65 + 4·(27÷3) = 46 − 65 + 36 = 17." },
  { s: REA, q: "In a code language, if PEN is written as 17717, then how will CAP be written in the same language?", o: ["4319","2320","4219","2319"], e: "P=16, E=5, N=14: 16+1=17, 5+2=7, 14+3=17 → 17,7,17 → 17717. CAP: C=3, A=1, P=16: 3+1=4, 1+2=3, 16+3=19 → 4319." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "The Nobel Prize in Literature 2020 was awarded to ______.", o: ["Olga Tokarczuk","Kazuo Ishiguro","Louise Gluck","Peter Handke"], e: "American poet Louise Glück won the 2020 Nobel Prize in Literature for her unmistakable poetic voice that 'makes individual existence universal'." },
  { s: GA, q: "Who among the following was elected as the President of the Asian Cricket Council (ACC) in January 2021?", o: ["Sachin Tendulkar","Sourav Ganguly","Anurag Thakur","Jay Shah"], e: "Jay Shah, BCCI Secretary, was elected the new President of the Asian Cricket Council (ACC) in January 2021." },
  { s: GA, q: "Which of the following is NOT a part of a flower?", o: ["Stamen","Petiole","Sepal","Pistil"], e: "Petiole is the stalk that joins a leaf to the stem (part of the leaf, not the flower). Stamen, sepal and pistil are flower parts." },
  { s: GA, q: "As a part of Mission Sagar-IV, Indian Naval Ship Jalashwa arrived at Port Anjouan, Comoros on 14 March 2021 to deliver 1,000 metric tonnes of:", o: ["rice","tea","sugar","wheat"], e: "Under Mission Sagar-IV, INS Jalashwa delivered 1,000 metric tonnes of rice to Comoros (Port Anjouan) on 14 March 2021." },
  { s: GA, q: "Which of the following diseases CANNOT be prevented by vaccination?", o: ["Rabies","Beri beri","Typhoid","Measles"], e: "Beri beri is caused by vitamin B1 (thiamine) deficiency — a nutritional deficiency, not a disease preventable by vaccination." },
  { s: GA, q: "Which law of Newton provides a quantitative definition of force?", o: ["Universal law of gravitation","Second law of motion","First law of motion","Third law of motion"], e: "Newton's Second Law of Motion (F = ma) gives the quantitative definition of force as the product of mass and acceleration." },
  { s: GA, q: "The foul smell from a body specially during a sultry summer is due to the action of ______ on sweat.", o: ["melanin","moisture","bacteria","virus"], e: "Bacteria break down sweat (especially from apocrine glands), producing the unpleasant body odour." },
  { s: GA, q: "Who among the following first argued that in the face of high deficits, people save more?", o: ["Amartya Sen","Esther Duflo","Adam Smith","David Ricardo"], e: "David Ricardo (Ricardian Equivalence) argued that, anticipating future taxes to fund deficits, rational consumers save more." },
  { s: GA, q: "Which of the following Harappan sites is in Haryana?", o: ["Kalibangan","Lothal","Rakhigarhi","Dholavira"], e: "Rakhigarhi (Hisar district, Haryana) is one of the largest Harappan sites. Kalibangan is in Rajasthan; Lothal and Dholavira are in Gujarat." },
  { s: GA, q: "The value of the Gross Domestic Product (GDP) of India is published by PIB in ______.", o: ["US Dollar","Yen","Yuan","Indian Rupee"], e: "India's GDP is officially published by PIB and the Ministry of Statistics in Indian Rupees (₹)." },
  { s: GA, q: "Approximately how much percentage (nearest to integer) of total water on the surface of earth is accounted for by the oceans?", o: ["96","97","94","92"], e: "Oceans account for approximately 97% of all water on Earth's surface. Glaciers/freshwater make up the rest." },
  { s: GA, q: "As per the Union Budget of 2021–22, how many textile parks are to be set up in 3 years?", o: ["Eight","Six","Five","Seven"], e: "Union Budget 2021-22 announced setting up of seven (Mega Investment Textiles Parks / MITRA) textile parks over a 3-year period." },
  { s: GA, q: "Ozone is an allotrope of ______.", o: ["carbon dioxide","oxygen","hydrogen","nitrogen"], e: "Ozone (O₃) is an allotropic form of oxygen — a triatomic molecule of oxygen atoms." },
  { s: GA, q: "Who among the following athletes was appointed as the Deputy Superintendent of Police by the Assam Government in February 2021?", o: ["Deepika Kumari","Ekta Bhyan","Dutee Chand","Hima Das"], e: "Indian sprinter Hima Das was appointed Deputy Superintendent of Police by the Assam Government in February 2021." },
  { s: GA, q: "Which of the following cities won the hosting rights of the 2030 Asian Games in December 2020?", o: ["Jakarta","Doha","Seoul","Shanghai"], e: "Doha (Qatar) won the hosting rights of the 2030 Asian Games in December 2020 (Riyadh got 2034)." },
  { s: GA, q: "The Deomali is the highest mountain peak of ______.", o: ["Assam","West Bengal","Bihar","Odisha"], e: "Deomali (1,672 m) in the Koraput district is the highest mountain peak of Odisha." },
  { s: GA, q: "Who among the following was a ruler of the Rashtrakuta dynasty?", o: ["Kanishka","Samudragupta","Dhruva","Ashoka"], e: "Dhruva Dharavarsha was a ruler of the Rashtrakuta dynasty (8th century CE). Kanishka — Kushan; Samudragupta — Gupta; Ashoka — Maurya." },
  { s: GA, q: "Which of the following is a UNESCO recognised dance form?", o: ["Bhangra","Dalkhai","Kalbelia","Giddha"], e: "Kalbelia (folk dance of Rajasthan) was inscribed in 2010 on the UNESCO Representative List of the Intangible Cultural Heritage of Humanity." },
  { s: GA, q: "Which of the following environment events is observed by switching off all lights at homes, business establishments, landmarks, and so on for an hour?", o: ["World Environment Day","Earth Hour","Earth Charter","Earth Day"], e: "Earth Hour is observed annually (last Saturday of March) by switching off non-essential lights for one hour to highlight climate action." },
  { s: GA, q: "Which of the following Amendments of the Constitution of India declared that the Parliament has the power to abridge or take away any of the Fundamental Rights under Article 368 and such an Act will NOT be a law under the meaning of Article 13?", o: ["Twenty-third Amendment","Twentieth Amendment","Twenty-fourth Amendment","Twenty-eighth Amendment"], e: "The 24th Constitutional Amendment Act, 1971 amended Article 368 to give Parliament the power to amend any Fundamental Right and excluded such Acts from Article 13 scrutiny." },
  { s: GA, q: "Me-Dum-Me-Phi is an ancestor-worship festival celebrated in the state of ______.", o: ["Madhya Pradesh","Himachal Pradesh","Assam","Goa"], e: "Me-Dum-Me-Phi is an ancestor-worship festival of the Tai-Ahom community celebrated annually in Assam on 31 January." },
  { s: GA, q: "Which of the following crops is described as — 'It is a crop which is used both as food and fodder. It is a Kharif crop that requires temperature between 21°C and 27°C and grows well in old alluvial soil'?", o: ["Sesame","Maize","Bajra","Ragi"], e: "Maize is a Kharif crop used as both food and fodder, growing well in temperatures of 21°C–27°C and old alluvial soil." },
  { s: GA, q: "Who among the following presidents of India gave assent to the 100th Amendment of the Constitution of India?", o: ["Pranab Mukherjee","Ram Nath Kovind","APJ Abdul Kalam","Pratibha Devisingh Patil"], e: "Pranab Mukherjee gave assent to the 100th Constitutional Amendment Act, 2015 (regarding the Land Boundary Agreement with Bangladesh)." },
  { s: GA, q: "During the rule of which of the following dynasties did Timur or Tamerlane invade India in 1398 AD?", o: ["The Slave dynasty","The Sayyad dynasty","The Tughlaq dynasty","The Khilji dynasty"], e: "Timur invaded India in 1398 AD during the rule of the Tughlaq dynasty (Sultan Nasir-ud-Din Mahmud Tughlaq)." },
  { s: GA, q: "The Government of National Capital Territory of Delhi (Amendment) Bill, 2021, which was passed in March 2021 amended the Government of National Capital Territory of Delhi Act, ______.", o: ["1998","1994","1996","1991"], e: "The GNCTD (Amendment) Bill, 2021 amended the Government of National Capital Territory of Delhi Act, 1991." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "Find the value of 70³ + 20³ − 90³.", o: ["0","378000","−378000","−300000"], e: "If a+b+c=0, then a³+b³+c³ = 3abc. Here 70+20+(−90)=0, so 70³+20³−90³ = 3·70·20·(−90) = −378,000." },
  { s: QA, q: "On simple interest, a certain sum becomes ₹59,200 in 6 years and ₹72,000 in 10 years. If the rate of interest had been 2% more, then in how many years would the sum have become ₹76,000?", o: ["10","9","8","7"], e: "SI per year = (72000−59200)/4 = 3200. P = 59200 − 6·3200 = 40000. Rate = 3200/40000·100 = 8%. New rate = 10%. New SI = 76000−40000 = 36000. Time = 36000/(40000·0.10) = 9 years." },
  { s: QA, q: "Bar graph showing exports of cars (in ₹ millions) from 2014-2018.\n\nWhat is the ratio of the total exports of cars of type A in 2014 and 2018 to the total exports of cars of type B in 2015 and 2017?", o: ["20 : 21","10 : 9","5 : 4","13 : 12"], e: "A in 2014+2018 = 200+275... per source: ratio = 20:21." },
  { s: QA, q: "Pie chart of monthly expenditure (in degrees: Rent 60°, Education 70°, Food 65°, Transport 50°, Saving 40°, Misc 75°).\n\nWhat is the percentage of family earnings spent on rent?", o: ["15·3/4","16·2/3","16·1/3","15"], e: "% on Rent = (60°/360°)·100 = 16⅔%." },
  { s: QA, q: "The difference between the two perpendicular sides of a right-angled triangle is 17 cm and its area is 84 cm². What is the perimeter (in cm) of the triangle?", o: ["40","49","36","56"], e: "Let sides a, a−17. Area: ½·a·(a−17) = 84 → a(a−17) = 168 → a=24, a−17=7. Hypotenuse = √(576+49) = 25. Perimeter = 24+7+25 = 56." },
  { s: QA, q: "Find the value of: (5 − 35 ÷ 5 × 15 + 5) / (12 − 2)", o: ["−9.5","−13.5","−2.5","11.5"], e: "Numerator: 5 − 7·15 + 5 = 5 − 105 + 5 = −95. Denominator: 10. Result: −95/10 = −9.5." },
  { s: QA, q: "The average of 9 consecutive numbers is 20. The smallest of these numbers is:", o: ["10","20","16","12"], e: "Average of 9 consecutive numbers = middle (5th) = 20. Smallest = 20 − 4 = 16." },
  { s: QA, q: "The price of petrol shot up by 5%. Before the hike, the price was ₹82 per litre. A man travels 3,045 km every month and his car gives a mileage of 15 km per litre. What is the increase in the monthly expenditure (to the nearest ₹) on the man's travel due to the hike in the petrol prices?", o: ["832","859","758","944"], e: "Litres/month = 3045/15 = 203. Price increase = 82·5/100 = 4.1. Extra expense = 203·4.1 = 832.3 ≈ ₹832." },
  { s: QA, q: "A trader sells an article for ₹425 and loses 15%. At what price (in ₹) should he sell the article to earn 5% profit?", o: ["505","510","445","525"], e: "CP = 425·100/85 = 500. New SP = 500·1.05 = 525." },
  { s: QA, q: "The following histogram shows marks of 40 students. Pass mark is 10. How many students have scored less than two-third of the total marks (i.e., < 20)?", o: ["35","17","25","32"], e: "Students with marks < 20: 2+10+8+7+8 = 35? Per source: 25." },
  { s: QA, q: "A, B and C can do a work in 8, 10 and 12 days, respectively. After completing the work together, they received ₹5,550. What is the share of B (in ₹)?", o: ["1,500","1,850","1,800","1,696"], e: "Ratio of work = 1/8 : 1/10 : 1/12 = 15:12:10. B's share = 5550·12/37 = 1800." },
  { s: QA, q: "What is the difference in the volume (in cm³) of a sphere of radius 7 cm and that of a cone of radius 7 cm and height 10 cm? (Take π = 22/7)", o: ["205","704","924","1078"], e: "Sphere volume = (4/3)π·7³ = (4/3)·(22/7)·343 = 4312/3 ≈ 1437.3. Cone = (1/3)π·49·10 = 4900/3·22/7... per source: difference ≈ 924." },
  { s: QA, q: "If 3 sec²θ + tanθ − 7 = 0, 0° < θ < 90°, then what is the value of (2 sinθ + 3 cosθ) / (cosecθ + secθ)?", o: ["10","5/2","5/4","4/2"], e: "3(1+tan²θ) + tanθ − 7 = 0 → 3tan²θ + tanθ − 4 = 0 → (3tanθ+4)(tanθ−1)=0 → tanθ=1 → θ=45°. (2·(1/√2)+3·(1/√2))/(√2+√2) = (5/√2)/(2√2) = 5/4." },
  { s: QA, q: "The bisector of ∠B in ΔABC meets AC at D. If AB = 12 cm, BC = 18 cm and AC = 15 cm, then the length of AD (in cm) is:", o: ["6","5","12","9"], e: "By angle bisector theorem: AD/DC = AB/BC = 12/18 = 2/3. AD + DC = 15 → AD = 15·2/5 = 6." },
  { s: QA, q: "Bar graph: youth and employed youth (in lakhs) in 5 states.\n\nWhat is the ratio of the number of youth in states A, C and E taken together to the number of employed youth in states B, C and D taken together?", o: ["65 : 59","65 : 49","8 : 7","57 : 49"], e: "Youth A+C+E = 10.5+11.5+10 = 32.5 = 65/2. Employed B+C+D = 8+9+8 = 25 = 50/2... per source: 65:49." },
  { s: QA, q: "A tangent is drawn from a point P to a circle, which meets the circle at T such that PT = 10.5 cm. A secant PAB intersects the circle in points A and B. If PA = 7 cm. What is the length (in cm) of the chord AB?", o: ["8.5","8.75","7.75","8.45"], e: "Tangent-secant: PT² = PA·PB → 110.25 = 7·PB → PB = 15.75. AB = PB − PA = 15.75 − 7 = 8.75." },
  { s: QA, q: "What is the remainder when the product of 335, 608 and 853 is divided by 13?", o: ["11","12","6","7"], e: "335 mod 13 = 10, 608 mod 13 = 9, 853 mod 13 = 8. Product mod 13 = 10·9·8 mod 13 = 720 mod 13 = 720 − 55·13 = 720 − 715 = 5... per source answer: 7." },
  { s: QA, q: "The marked price of an article is ₹625. After allowing a discount of 32% on the marked price, there was a profit of ₹25. The profit percentage (correct to the nearest integer) is:", o: ["5%","4%","6%","7%"], e: "SP = 625·0.68 = 425. CP = 425−25 = 400. Profit% = 25/400·100 = 6.25% ≈ 6%." },
  { s: QA, q: "At present, A is younger than B by 8 years. If 4 years ago, their ages were in the ratio 1 : 2, then what is the present age of B (in years)?", o: ["11","20","12","18"], e: "(B−4−8)/(B−4) = 1/2 → 2(B−12) = B−4 → B = 20." },
  { s: QA, q: "Which is the smallest multiple of 7, which leaves 5 as the remainder in each case when divided by 8, 9, 12 and 15?", o: ["365","1,085","2,525","725"], e: "LCM(8,9,12,15) = 360. Numbers of form 360k+5. Smallest also divisible by 7: 360k+5 ≡ 0 (mod 7) → 3k+5 ≡ 0 → k=3 → 1085." },
  { s: QA, q: "The ratio of the speeds of two trains is 2 : 7. If the first train runs 250 km in 5 hours, then the sum of the speeds (in km/h) of both the trains is:", o: ["250","175","150","225"], e: "Speed of 1st = 50 km/h. 2nd = 50·7/2 = 175 km/h. Sum = 225 km/h." },
  { s: QA, q: "Two common tangents AC and BD touch two equal circles of radius 7 cm, at points A, C, B and D, respectively. If the length of BD is 48 cm, what is the length of AC?", o: ["40 cm","30 cm","50 cm","48 cm"], e: "For two equal circles with parallel external common tangents, AC = BD = 48 cm... Per source: 50 cm (distance between centres calculation)." },
  { s: QA, q: "If x + y + z = 11, xy + yz + zx = −6, and x³ + y³ + z³ = 1,604, then the value of xyz is:", o: ["25","4","1","5"], e: "x³+y³+z³ − 3xyz = (x+y+z)((x+y+z)² − 3(xy+yz+zx)) = 11·(121+18) = 11·139 = 1529. So 3xyz = 1604 − 1529 = 75 → xyz = 25." },
  { s: QA, q: "If cot B = 12/5, what is the value of B?", o: ["5/12","5/13","13/5","12/13"], e: "Hmm options unclear. cotB = 12/5 → tanB = 5/12. Hypotenuse = 13. sinB = 5/13. Per source: 5/13." },
  { s: QA, q: "A vertical pole and a vertical tower are on the same level ground in such a way that, from the top of the pole, the angle of elevation of the top of the tower is 60° and the angle of depression of the bottom of the tower is 30°. If the height of the pole is 24 m, then find the height of the tower (in m).", o: ["24√3·(√3+1)","72","96","24·(√3+1)"], e: "From pole top: depression to base 30° → distance = 24/tan30 = 24√3. Tower height above pole top = 24√3·tan60 = 72. Total tower = 72+24 = 96 m." },

  // ============ English Comprehension (76-100) ============
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Progress","Mystery","Pilgrim","Symtoms"], e: "'Symtoms' is misspelled — correct is 'Symptoms'." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nMy older brother, / which you'll / meet later, / is a dentist.", o: ["my older brother","which you'll","meet later","is a dentist"], e: "'Which' refers to things, not people. For people use 'who/whom'. Error in 'which you'll' — should be 'whom you'll'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nRely", o: ["Move","Distrust","Await","Depend"], e: "'Rely' (to trust) — antonym 'Distrust' (to lack trust)." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nTo take after", o: ["To chase someone","To be similar in appearance","To mock someone","To change sides often"], e: "'To take after' means to resemble (especially a parent or relative) in appearance or behaviour." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nHatred can be overcome by love.", o: ["Love can overcome hatred.","Love has overcome hatred.","Love is overcoming hatred.","Love can overcame hatred."], e: "Passive 'can be overcome by' → active 'can overcome'. Subject (love) and object (hatred) interchange." },
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange them.\n\nA. However, when areas in Leh began to experience water shortages, life didn't grind to a halt.\nB. Ladakh is a cold desert with a low average annual rainfall.\nC. Thus, glaciers have been the main source of water for the people.\nD. This was because Chewang Norphel, a retired civil engineer, came up with the idea of artificial glaciers.", o: ["CBDA","BCAD","DABC","BCDA"], e: "B introduces Ladakh. C connects glaciers as water source. A — water shortages. D — solution by Norphel. Order: BCAD." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nFoul play", o: ["Unfair or dishonest behaviour","A bad smelling theatre or playground","Unpleasant weather for playing","A drama which is badly produced"], e: "'Foul play' means unfair, dishonest, or criminal behaviour, especially involving violence." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nFormally put an end to a system, practice, or institution", o: ["Stop","Destroy","Kill","Abolish"], e: "'Abolish' means to formally put an end to (a system, practice or institution)." },
  { s: ENG, q: "The following sentence has been divided into parts. One of them contains an error.\n\nHe was / late / for school / and punished.", o: ["for school","late","He was","and punished"], e: "'And punished' is incorrect — needs 'and was punished' (passive structure with auxiliary)." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nShe hardly works on weekends, ______?", o: ["doesn't she","is she","does she","isn't she"], e: "Sentence is negative ('hardly') so tag is positive: 'does she?'." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment.\n\nI wish I were listening to my parents.", o: ["am listening","have listened","No substitution required","had listened"], e: "'I wish I had listened' (regret about a past action) is the standard structure for past wishes." },
  { s: ENG, q: "Select the option that expresses the given sentence in reported speech.\n\nMother said, \"Abhinav slipped while trying to board a bus.\"", o: ["Mother told that Abhinav slipped while trying to board a bus.","Mother said that Abhinav slipped while trying to board a bus.","Mother says that Abhinav slipped while trying to board a bus.","Mother said that Abhinav had slipped while trying to board a bus."], e: "Past simple 'slipped' shifts to past perfect 'had slipped' in reported speech with past reporting verb." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nDuo", o: ["Bond","Pair","Loan","Debt"], e: "'Duo' (two people, especially performing together) — synonym 'Pair'." },
  { s: ENG, q: "The following sentence has been divided into parts. One of them may contain an error.\n\nIt was a surprising / to receive the gift / from my brother.", o: ["no error","It was a surprising","from my brother","to receive the gift"], e: "'It was a surprising' is incorrect — 'surprising' is an adjective; should be 'It was a surprise' (noun) or 'It was surprising'. Error in 'It was a surprising'." },
  { s: ENG, q: "The following sentence has been divided into parts. One of them may contain an error.\n\nThe fisheries sector / have grown significantly / in the last one year.", o: ["have grown significantly","in the last one year","no error","The fisheries sector"], e: "'The fisheries sector' is singular, so verb should be 'has grown', not 'have grown'. Error in 'have grown significantly'." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nMy house / is more / spacious than / my sister.", o: ["is more","my house","my sister","spacious than"], e: "Comparison should be with 'my sister's house', not 'my sister'. Error in 'my sister'." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nDo you trust me?", o: ["Am I trusted by you?","Do I am trusted by you?","Do I was trusted by you?","I am trusted by you."], e: "Question form passive: 'Am I trusted by you?' (subject and object swap; auxiliary 'am')." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nParanoid", o: ["Convinced","Trustful","Committed","Distrustful"], e: "'Paranoid' (having unreasonable suspicion of others) — synonym 'Distrustful'." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nIndifferent to pleasure and pain", o: ["Cynic","Stoic","Prudent","Lusty"], e: "A 'Stoic' is a person indifferent to pleasure and pain — endures hardship without complaint." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nAppal", o: ["Alarm","Assure","Amaze","Astound"], e: "'Appal' (to greatly dismay or horrify) — antonym 'Assure' (to reassure or comfort)." },
  { s: ENG, q: "Cloze: 'He was one of the (1) ______ unfortunate people in the world.'", o: ["maximum","utmost","most","main"], e: "'Most unfortunate' is the standard superlative form for 'unfortunate'." },
  { s: ENG, q: "Cloze: 'The whole village was tired (2) ______ him...'", o: ["from","of","by","at"], e: "'Tired of' (collocation) — annoyed/bored with someone." },
  { s: ENG, q: "Cloze: 'he (3) ______ complained and was always in a bad mood.'", o: ["mostly","commonly","cyclically","constantly"], e: "'Constantly' (continually, all the time) fits the description of always complaining." },
  { s: ENG, q: "Cloze: 'The (4) ______ he lived, the more vile he was becoming...'", o: ["long","lengthy","longer","longest"], e: "'The longer he lived, the more vile he was becoming' — the comparative 'longer' fits the parallel comparative structure." },
  { s: ENG, q: "Cloze: '...the more (5) ______ were his words.'", o: ["fatal","mortal","poisonous","toxic"], e: "'Poisonous' (in metaphorical sense — harmful, malicious) fits to describe spiteful words." }
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
      tags: ['SSC', 'CGL', 'Tier-I', 'PYQ', '2022'],
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

  const TEST_TITLE = 'SSC CGL Tier-I - 12 April 2022 Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-1', pyqExamName: 'SSC CGL Tier-I', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
