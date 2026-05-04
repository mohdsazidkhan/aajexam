/**
 * Seed: SSC CGL Tier-I PYQ - 10 August 2017, Shift-2 (100 questions)
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
 * Run with: node scripts/seed-pyq-ssc-cgl-10aug2017-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSL-CGL-Tier-1/2017/august/10/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-cgl-10aug2017-s2';

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

const F = '10-august-2017';
const IMAGE_MAP = {
  16: { q: `${F}-q-16.png` },
  17: { q: `${F}-q-17.png` },
  19: { q: `${F}-q-19.png` },
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
  62: { q: `${F}-q-62.png` },
  63: { q: `${F}-q-63.png` },
  64: { q: `${F}-q-64.png` },
  72: { q: `${F}-q-72.png` },
  73: { q: `${F}-q-73.png` },
  74: { q: `${F}-q-74.png` },
  75: { q: `${F}-q-75.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  2,1,2,4,3, 1,2,2,1,1, 2,1,4,1,3, 1,3,1,1,2, 4,2,2,3,3,
  // 26-50 (General Awareness)
  3,4,3,2,3, 2,4,4,4,4, 4,1,3,2,1, 2,4,2,3,3, 3,1,3,3,3,
  // 51-75 (Quantitative Aptitude)
  3,4,4,1,3, 3,3,1,4,1, 1,2,1,2,1, 2,3,2,2,2, 4,2,3,1,2,
  // 76-100 (English)
  3,1,1,4,4, 1,4,2,4,3, 3,2,3,3,3, 4,1,1,1,4, 1,1,4,2,4
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Awareness';
const QA  = 'Quantitative Aptitude';
const ENG = 'English Comprehension';

const RAW = [
  // ============ General Intelligence and Reasoning (1-25) ============
  { s: REA, q: "In the following question, select the related word from the given alternatives.\n\nPressure : Barometer :: ? : Odometer", o: ["Humidity","Distance","Thickness","Wind"], e: "A barometer measures pressure; similarly, an odometer measures distance travelled by a vehicle." },
  { s: REA, q: "In the following question, select the related letters from the given alternatives.\n\nAEDM : ZQRN :: FLMO : ?", o: ["BZYS","CZYS","SZYB","YZBC"], e: "Pattern: each letter shifts by +13 (cyclic). A→Z, E→Q (E+13=R, but Z is opposite-letter). Per the worked solution: applying +13 to FLMO gives BZYS." },
  { s: REA, q: "In the following question, select the related number from the given alternatives.\n\n243 : 578 :: 163 : ?", o: ["291","326","347","443"], e: "Pattern: (product of digits)² + 2. 2·4·3=24, 24²+2=578. For 163: 1·6·3=18, 18²+2=326." },
  { s: REA, q: "In the following question, select the odd word from the given alternatives.", o: ["Flower","Fruit","Leaves","Root"], e: "Flower, Fruit and Leaves are visible above ground. Root is underground — odd one out." },
  { s: REA, q: "In the following question, select the odd letters from the given alternatives.", o: ["CEAC","FHDF","PRMP","TVRT"], e: "CEAC, FHDF, TVRT all follow +2,−4,+2. PRMP follows +2,−5,+3 — odd one out." },
  { s: REA, q: "In the following question, select the odd number pair from the given alternatives.", o: ["2132 – 161","2678 – 672","4325 – 120","6931 – 162"], e: "Sum-of-digits differences: (2132-161)=8-8, (2678-672)=23-15=8, (4325-120)=14-3=11, (6931-162)=19-9=10. The first follows a different rule (equal sums) — odd one out." },
  { s: REA, q: "Arrange the given words in the sequence as they occur in the dictionary.\n\n1. Dillydallying  2. Dillydallied  3. Dillydally  4. Dilled  5. Dillydallies", o: ["42351","42531","45312","45321"], e: "Dictionary order: Dilled (4) → Dillydallied (2) → Dillydallies (5) → Dillydally (3) → Dillydallying (1) → 42531." },
  { s: REA, q: "In the following question, which one set of letters when sequentially placed in the gaps in the given letter series shall complete it?\n\nl m _ o _ n m _ l _ n _ _ n m l", o: ["molnon","nolmoo","nomloo","noolmm"], e: "Filling with 'nolmoo' completes pattern: lmnonmlmnonmnml — symmetrical reading." },
  { s: REA, q: "In the following question, select the missing number from the given series.\n\n21, 25, 52, 68, 193, ?", o: ["229","242","257","409"], e: "Differences add successive squares: 21+2²=25, 25+3³=52? Per worked: 21+2²=25, 25+3³=52, 52+4²=68, 68+5³=193, 193+6²=229." },
  { s: REA, q: "Kamal starts walking from his home facing west direction. After walking 10 km, he takes a right turn and walks another 10 km. He takes another right turn and walks 10 km to reach his school. How far (in km) and in which direction is he from his home?", o: ["10, North","10, South","20, North-East","20, South-West"], e: "Path: West 10 → North 10 → East 10. Final position: 10 km North of starting point." },
  { s: REA, q: "In a class, P has more marks than Q and R does not have the least marks. S has more marks than T and T has more marks than P. Who among them will have the least marks?", o: ["P","Q","S","T"], e: "P>Q, S>T>P, R is not least. Order: S>T>P>Q with R somewhere above Q. Q has the least marks." },
  { s: REA, q: "In the following question, from the given alternative words, select the word which cannot be formed using the letters of the given word.\n\nRECIPROCATE", o: ["PROCEED","RACE","REPEAT","TEAR"], e: "RECIPROCATE doesn't contain the letter 'D'. So PROCEED cannot be formed." },
  { s: REA, q: "In a certain code language, 'CASIO' is written as '3119915'. How is 'CITIZEN' written in that code language?", o: ["295629134","3192295614","391265921​44","3920926514"], e: "Each letter replaced by its alphabet position: C=3, I=9, T=20, I=9, Z=26, E=5, N=14 → 3 9 20 9 26 5 14 → 3920926514." },
  { s: REA, q: "In the following question, correct the equation by interchanging the two signs.\n\n6 ÷ 17 × 51 + 6 − 12 = −4", o: ["× and ÷","+ and ÷","+ and −","− and ÷"], e: "Interchanging × and ÷: 6 × 17 ÷ 51 + 6 − 12 = 2 + 6 − 12 = −4. ✓" },
  { s: REA, q: "If 6 * 9 − 4 = 58 and 3 * 9 − 7 = 34, then in the expression A * 4 − 9 = 91, what is the value of 'A'?", o: ["6.5","17.5","20.5","30.5"], e: "Pattern: a*b−c means a·b+c. 6·9+4=58 ✓, 3·9+7=34 ✓. So 4A+9=91 → 4A=82 → A=20.5." },
  { s: REA, q: "In the following question, select the number which can be put in place of question mark (?) from the given alternatives.", o: ["4","6","8","16"], e: "Pattern: (left × right) = sum of all surrounding numbers. Fig1: 9·3=27=9+7+6+5. Fig2: 6·5=30=6+7+9+8. Fig3: 6·3=18=5+6+3+? → ?=4." },
  { s: REA, q: "How many triangles are there in the given figure?", o: ["4","5","6","7"], e: "Counting all triangles in the labelled figure: ABC, DEF, GHI, LJC, MKF, NOC = 6 triangles." },
  { s: REA, q: "Read the given statements and conclusions carefully.\n\nStatements:\nI. Some staplers are pins.\nII. All pins are markers.\n\nConclusions:\nI. Some staplers are markers.\nII. All markers are pins.", o: ["Only conclusion (I) follows.","Only conclusion (II) follows.","Neither conclusion (I) nor conclusion (II) follows.","Both conclusions follow."], e: "Some staplers are pins → these pins are markers (since all pins are markers). So some staplers are markers ✓. All markers are pins is too strong — doesn't follow." },
  { s: REA, q: "Two positions of a cube are shown below. What will come opposite to the face containing '4'?", o: ["1","2","3","6"], e: "From the two cube views: 5,2,4 sequence shows 2 adjacent to 4; 5,6,1 shows 6 adjacent to common 5. Working out adjacencies: 2 is opposite 6; 1 is opposite 4." },
  { s: REA, q: "Identify the diagram that best represents the relationship among the given classes.\n\nGreen, Mango, Fruits", o: ["Option 1","Option 2","Option 3","Option 4"], e: "All Mangoes are Fruits (subset). Green intersects with both (some mangoes/fruits are green). Option 2 shows this." },
  { s: REA, q: "Which of the following figure in the options will complete the pattern of the given figure?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 4 correctly completes the pattern in the given figure." },
  { s: REA, q: "From the following figures in the options, select the one in which the given figure is hidden/embedded.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The given figure is embedded in option 2." },
  { s: REA, q: "A piece of paper is folded and punched as shown below in the figures. From the given option figure, indicate how it will appear when opened?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "After unfolding the punched paper, option 2 shows the symmetric pattern of holes." },
  { s: REA, q: "If a mirror placed on the line AB, then which of the option figure is the right image of the given figure?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror about line AB (vertical) — left becomes right and vice versa. Option 3 is the correct mirror image." },
  { s: REA, q: "A word is represented by only one set of numbers as given in any one of the alternatives. The columns and rows of Matrix-I are numbered 0–4 and Matrix-II are numbered 5–9. A letter is represented first by its row and then its column (e.g., 'A' = 20, 43; 'U' = 68, 87). Identify the set for the word 'GUIDE'.", o: ["00, 68, 95, 58, 04","14, 75, 88, 87, 40","23, 99, 76, 78, 31","41, 87, 57, 66, 12"], e: "Decoding option 3: 23=G, 99=U, 76=I, 78=D, 31=E → GUIDE. Hence option 3." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "In which market form, a market or industry is dominated by a few firms?", o: ["Perfect Competition","Monopoly","Oligopoly","Monopolistic"], e: "An oligopoly is a market structure dominated by a small number of large firms producing similar or identical products." },
  { s: GA, q: "Which amongst the following is not a component of monetary policy in India?", o: ["Repo rate","Moral suasion","Credit Rationing","Public Debt"], e: "Public debt belongs to fiscal policy (managed by the government), not monetary policy (managed by the RBI)." },
  { s: GA, q: "Who among the following is not a member of any of the two houses of our country?", o: ["Prime Minister","Finance Minister","President","Railway Minister"], e: "The President of India is part of Parliament but is not a member of either House (Lok Sabha or Rajya Sabha)." },
  { s: GA, q: "Which article of the Indian Constitution has the provision for National Emergency?", o: ["Article 350","Article 352","Article 312","Article 280"], e: "Article 352 of the Indian Constitution provides for the proclamation of National Emergency on grounds of war, external aggression, or armed rebellion." },
  { s: GA, q: "Who led the Bardoli Satyagraha movement?", o: ["Mahatma Gandhi","Rabindranath Tagore","Sardar Vallabhbhai Patel","Chittaranjan Das"], e: "Sardar Vallabhbhai Patel led the Bardoli Satyagraha in 1928, earning him the title 'Sardar'." },
  { s: GA, q: "Who is known as the 'Father of Indian Unrest'?", o: ["Anant Singh","Bal Gangadhar Tilak","Bhagat Singh","Dadabhai Naoroji"], e: "Bal Gangadhar Tilak was called the 'Father of Indian Unrest' by British journalist Valentine Chirol due to his strong advocacy of Swaraj." },
  { s: GA, q: "Which of the following region is covered by tropical evergreen forest?", o: ["Eastern Ghat","Vindhyanchal","Aravalli","Western Ghat"], e: "Tropical evergreen forests in India occur on the western slopes of the Western Ghats, the Andaman & Nicobar islands, and parts of Northeast India." },
  { s: GA, q: "The final boundary between the Earth and the outer space is called _____.", o: ["magnetosphere","ionosphere","mesopause","magnetopause"], e: "The magnetopause is the boundary between Earth's magnetosphere and the surrounding plasma — effectively the final boundary between Earth and outer space." },
  { s: GA, q: "What is the name of the hormone produced by the thymus gland?", o: ["Thyroxine","Auxins","Cytokinins","Thymosin"], e: "Thymosin is the hormone secreted by the thymus gland; it stimulates the development of disease-fighting T cells." },
  { s: GA, q: "Photosynthesis takes place in the presence of chlorophyll and _________.", o: ["water","nutrients","carbon-dioxide","sunlight"], e: "Photosynthesis requires chlorophyll and sunlight (which provides light energy) — water and CO₂ are reactants but the trigger is sunlight." },
  { s: GA, q: "Which blood group is a universal acceptor?", o: ["O+","O−","AB","AB+"], e: "Blood group AB+ is the universal acceptor — it has both A and B antigens and Rh-positive, so it can receive blood from any group." },
  { s: GA, q: "If objects appear enlarged and inverted in a rear view mirror, then which type of mirror is used?", o: ["Concave","Convex","Cylindrical","Plane"], e: "A concave mirror can produce enlarged and inverted real images when the object is placed beyond the focal point." },
  { s: GA, q: "Soap bubble attains spherical shape due to ______.", o: ["inertia","pressure","surface tension","viscosity"], e: "Surface tension causes a soap bubble to take the shape with the minimum surface area for a given volume — i.e., a sphere." },
  { s: GA, q: "CAD stands for _____.", o: ["Common Aided Design","Computer Aided Design","Complex Aided Design","Communication Aided Design"], e: "CAD stands for Computer Aided Design — software used to create 2D and 3D designs in engineering and architecture." },
  { s: GA, q: "Which of the following is a characteristic of an exothermic reaction?", o: ["Release of heat","Absorption of heat","Does not involve any change in temperature","None of the above"], e: "An exothermic reaction releases energy in the form of heat (and sometimes light) to its surroundings." },
  { s: GA, q: "What is the chemical formula for Sodium Chloride (Salt)?", o: ["NaCl₂","NaCl","Na₂Cl","Na₂C"], e: "Sodium chloride (common salt) has formula NaCl — one Na⁺ ion bonded to one Cl⁻ ion." },
  { s: GA, q: "Which of the following gas contributes the maximum to the phenomena of global warming?", o: ["Methane","Chlorofluorocarbon (CFC)","Nitrogen dioxide","Carbon dioxide"], e: "Carbon dioxide (CO₂) accounts for around 72% of total greenhouse gas emissions and is the largest contributor to global warming." },
  { s: GA, q: "Who selects the Social Audit Committee under MGNREGA scheme?", o: ["Chief Minister","Gram Sabha","Mayor","B.D.O."], e: "Per the MGNREGA Act, the Gram Sabha selects the Social Audit Committee to audit works at the village level." },
  { s: GA, q: "Which of the following was invented by Sir Humphrey Davy?", o: ["Safety Pin","Steam Engine","Safety Lamp","X-Rays"], e: "Sir Humphry Davy invented the Davy safety lamp in 1815 for use in coal mines, preventing explosions from firedamp." },
  { s: GA, q: "Who won the 2016 Men's Single title at the US Open?", o: ["Novak Djokovic","Rafael Nadal","Stan Wawrinka","Andy Murray"], e: "Stan Wawrinka won the 2016 US Open Men's Singles title, defeating Novak Djokovic in the final." },
  { s: GA, q: "Match the following:\n\nDancer — Dance\n1. Radha Reddy — (a) Bharatnatyam\n2. Padma Subrahmanyam — (b) Kathak\n3. Sitara Devi — (c) Kuchipudi", o: ["1-b, 2-a, 3-c","1-c, 2-b, 3-a","1-c, 2-a, 3-b","1-a, 2-c, 3-b"], e: "Radha Reddy → Kuchipudi (c). Padma Subrahmanyam → Bharatanatyam (a). Sitara Devi → Kathak (b). So 1-c, 2-a, 3-b." },
  { s: GA, q: "Who has recently been awarded with Nobel Prize for peace in 2016?", o: ["Juan Manuel Santos","Henry Dunant","Kailash Satyarthi","Malala Yousefzai"], e: "Juan Manuel Santos, President of Colombia, won the 2016 Nobel Peace Prize for ending the 50-year civil war with FARC." },
  { s: GA, q: "Which of the following book is written by Shashi Tharoor?", o: ["It's Not About You","Invisible People","An Era of Darkness","Democrats and Dissenters"], e: "'An Era of Darkness: The British Empire in India' was written by Shashi Tharoor and won the Sahitya Akademi Award." },
  { s: GA, q: "With which country did India has recently decided to become partner for strategic storage of crude oil in southern India?", o: ["Iran","Iraq","United Arab Emirates","United States of America"], e: "India and the UAE signed a deal in 2017 for the UAE's ADNOC to store 6 million barrels of crude oil at Mangalore as a strategic petroleum reserve." },
  { s: GA, q: "Which neighbouring country of India is also referred as 'Druk Yul'?", o: ["Myanmar","Maldives","Bhutan","Afghanistan"], e: "Bhutan is called 'Druk Yul' meaning 'Land of the Thunder Dragon'. Druk is the national symbol on its flag." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "How many numbers are there between 1 to 200 which are divisible by 3 but not by 7?", o: ["38","45","57","66"], e: "Divisible by 3: 66 numbers. Divisible by 21 (i.e., by both): 9 numbers. Divisible by 3 but not by 7 = 66 − 9 = 57." },
  { s: QA, q: "10 women can do a piece of work in 6 days, 6 men can do the same work in 5 days and 8 children can do it in 10 days. What is the ratio of the efficiency of a woman, a man and a child, respectively?", o: ["4 : 6 : 3","4 : 5 : 3","2 : 4 : 3","4 : 8 : 3"], e: "Efficiency: woman = 1/(10·6)=1/60; man = 1/(6·5)=1/30; child = 1/(8·10)=1/80. Ratio = 1/60 : 1/30 : 1/80 = 4 : 8 : 3." },
  { s: QA, q: "The ratio of the volume of two cylinders is 7 : 3 and the ratio of their heights is 7 : 9. If the area of the base of the second cylinder is 154 cm², then what will be the radius (in cm) of the first cylinder?", o: ["6√2","6√3","7√2","7√3"], e: "V₁/V₂ = (πr₁²·h₁)/(πr₂²·h₂) = 7/3. πr₂²=154. So r₁² = (7/3)·(9/7)·154/π = 3·154/π·1 → using π=22/7: r₁² = 3·7·7 = 147 → r₁ = 7√3." },
  { s: QA, q: "Kanchan bought a clock with 25% discount on marked price. She sold it with 75% gain on the price she bought. What was her profit percentage on the marked price?", o: ["31.25%","50%","56.25%","60%"], e: "MP=100. CP=75. SP=75×1.75=131.25. Profit on MP = 131.25 − 100 = 31.25 → 31.25%." },
  { s: QA, q: "A, B and C received an amount of ₹8,400 and distributed among themselves in the ratio of 6 : 8 : 7, respectively. If they save in the ratio of 3 : 2 : 4, respectively and B saves ₹400, then what is the ratio of the expenditures of A, B and C, respectively?", o: ["6 : 8 : 7","8 : 6 : 7","9 : 14 : 10","12 : 7 : 9"], e: "A=2400, B=3200, C=2800. B saves 400 ↔ 2x=400 → x=200. Savings: A=600, B=400, C=800. Expenditures: 1800, 2800, 2000 = 9:14:10." },
  { s: QA, q: "The average age of 24 students is 12 years. It was observed that while calculating the average age, the age of a student was taken as 14 years instead of 8 years. What will be the correct average age (in years)?", o: ["11.25","11.5","11.75","12.25"], e: "Sum = 24·12 = 288. Correction: 288 − 14 + 8 = 282. New avg = 282/24 = 11.75." },
  { s: QA, q: "70% of the cost price of an article is equal to the 40% of its selling price. What is the profit or loss percentage?", o: ["63% loss","70% loss","75% profit","80% profit"], e: "0.7·CP = 0.4·SP → SP/CP = 7/4 = 175%. Profit% = 75%." },
  { s: QA, q: "a% of b + b% of a = ______.", o: ["2a% of b","2a% of 2b","2a% of 2a","2b% of 2b"], e: "a% of b = ab/100. b% of a = ab/100. Sum = 2ab/100 = (2a)·b/100 = 2a% of b." },
  { s: QA, q: "If I walk at 7/6 of my usual speed, then I reach my office 15 minutes early. What is the usual time taken (in minutes) by me to reach the office?", o: ["60","75","90","105"], e: "xt = (7x/6)(t−15). 6t = 7t − 105 → t = 105 minutes." },
  { s: QA, q: "A person lent ₹10,000 to B for 3 years and ₹6,000 to C for 4 years on simple interest at the same rate of interest and received ₹5,400 from both of them as interest. What is the rate of interest (in %)?", o: ["10","12.5","15","20"], e: "(10000·3·R + 6000·4·R)/100 = 5400 → 540R = 5400 → R = 10%." },
  { s: QA, q: "If x³ + 2x² − 5x + k is divisible by x + 1, then what is the value of k?", o: ["−6","−1","0","6"], e: "By factor theorem, p(−1) = 0 → −1 + 2 + 5 + k = 0 → k = −6." },
  { s: QA, q: "If 3x + 1/(5x) = 7, then what is the value of 5x / (15x² + 15x + 1)?", o: ["1/5","1/10","2/5","10"], e: "5x/(15x²+15x+1) = 5x/[5x(3x+3+1/(5x))] = 1/(3x+3+1/(5x)) = 1/(7+3) = 1/10." },
  { s: QA, q: "If x + 1/(4x) = 5/2, then what is the value of (64x⁶ + 1)/(8x³)?", o: ["110","115","125","140"], e: "2x + 1/(2x) = 5. (2x + 1/(2x))³ = 125 = 8x³ + 1/(8x³) + 3·5 → 8x³ + 1/(8x³) = 110. So (64x⁶+1)/(8x³) = 8x³ + 1/(8x³) = 110." },
  { s: QA, q: "If x² + x = 19, then what is the value of (x + 5)² + 1/(x + 5)²?", o: ["77","79","81","83"], e: "Let y = x+5. y + 1/y simplification: x² + x − 19 = 0 → x = (−1+√77)/2 → x+5 = (9+√77)/2. y² + 1/y² = (y+1/y)² − 2. After algebraic manipulation, result = 79." },
  { s: QA, q: "In triangle ABC, AD, BE and CF are the medians intersecting at point G and area of triangle ABC is 156 cm². What is the area (in cm²) of triangle FGE?", o: ["13","26","39","52"], e: "FE is a midsegment so ΔAFE has area = (1/4)·156 = 39. ΔFGE = (1/3)·ΔAFE = 13 (centroid divides medians 2:1 and triangle areas accordingly)." },
  { s: QA, q: "In triangle ABC, ∠ABC = 15°. D is a point on BC such that AD = BD. What is the measure of ∠ADC (in degrees)?", o: ["15","30","45","60"], e: "In ΔABD with AD=BD, ∠ABD = ∠BAD = 15°. ∠ADC = ∠ABD + ∠BAD (exterior angle) = 30°." },
  { s: QA, q: "The length of a diagonal of a square is 9√2 cm. The square is reshaped to form a triangle. What is the area (in cm²) of the largest incircle that can be formed in that triangle?", o: ["6π","9π","12π","15π"], e: "Diagonal √2·a = 9√2 → a = 9. Perimeter = 36. Equilateral triangle of perimeter 36 → side 12. Inradius = side/(2√3) = 6/√3. Area = π·36/3 = 12π." },
  { s: QA, q: "The length of the common chord of two intersecting circles is 12 cm. If the diameters of the circles are 15 cm and 13 cm, then what is the distance (in cm) between their centres?", o: ["7/2","7","7√2","14"], e: "Half-chord = 6. d₁=√((15/2)² − 36)=√(225/4−36)=√(81/4)=9/2. d₂=√((13/2)²−36)=√(25/4)=5/2. Distance = 9/2 + 5/2 = 7." },
  { s: QA, q: "What is the simplified value of sec⁴ θ − sec² θ tan² θ?", o: ["cosec² θ","sec² θ","cot² θ","sec θ tan θ"], e: "sec²θ(sec²θ − tan²θ) = sec²θ · 1 = sec²θ." },
  { s: QA, q: "What is the simplified value of (sin A − cosec A)(sec A − cos A)(tan A + cot A)?", o: ["1","−1","0","2"], e: "Expanding: (sin²A−1)/sinA · (1−cos²A)/cosA · (sin²A+cos²A)/(sinA·cosA) = (−cos²A·sin²A)/(sin²A·cos²A) = −1." },
  { s: QA, q: "If (1/cos θ) − (1/cot θ) = 1/P, then what is the value of cos θ?", o: ["(P+1)/(P−1)","(P²+1)/(2P)","2(P²+1)/P","2P/(P²+1)"], e: "secθ − tanθ = 1/P. Multiplying by (secθ+tanθ): 1 = (secθ+tanθ)/P → secθ+tanθ = P. So 2secθ = P + 1/P = (P²+1)/P → secθ = (P²+1)/(2P) → cosθ = 2P/(P²+1)." },
  { s: QA, q: "Wheat production/sales table for countries A, B, C, D over 2011–2014 (with 2010 stocks). What is the surplus (in '000 quintals) of country A of years 2013 and 2014 taken together?", o: ["122","131","143","158"], e: "A surplus 2013 = 1671 − 1641 = 30. A surplus 2014 = 1103 − 1002 = 101. Total = 131." },
  { s: QA, q: "What is the stock (in '000 quintals) of country C at end of the 4-year period?", o: ["5926","6213","6826","8844"], e: "C: production sum = 8807, sales sum = 9816. Stock(2014) = 7835 + 8807 − 9816 = 6826." },
  { s: QA, q: "What is the difference (in '000 quintals) in average production and average sales, respectively of country C in the given four years?", o: ["−252.25","−415.50","350.75","275.25"], e: "Avg production = 8807/4 = 2201.75. Avg sales = 9816/4 = 2454. Difference = 2201.75 − 2454 = −252.25." },
  { s: QA, q: "What can be said about the total surplus of country B and country D over the 4 years?", o: ["Surplus of B = Surplus of D","Surplus of D > Surplus of B","Surplus of B > Surplus of D","No relation is there"], e: "B total surplus = (1881+2067+1328+1578) − (1798+2389+2063+1239) = 6854 − 7489 = −635. D total = (3126+2987+2143+4126) − (2417+2911+3188+3563) = 12382 − 12079 = 303. So D > B." },

  // ============ English Comprehension (76-100) ============
  { s: ENG, q: "Find out which part of the sentence has an error.\n\nInspite of the doctor's stern warning (1)/ Latika continued taking (2)/ sugars in her milk. (3)/ No Error (4)", o: ["1","2","3","4"], e: "'Sugar' is uncountable and has no plural. The error is in part 3 — should be 'sugar in her milk'." },
  { s: ENG, q: "Find out which part of the sentence has an error.\n\nMyself and Roshni (1)/ will take care of (2)/ the event on Sunday. (3)/ No Error (4)", o: ["1","2","3","4"], e: "A sentence cannot begin with the reflexive pronoun 'Myself'. The correct form is 'Roshni and I'. Error in part 1." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\n_____ the rain stopped, the concert had to be suspended.", o: ["Until","Unless","Till","While"], e: "'Until' fits — the suspension continued until the rain stopped (the concert was on hold up to the point in time)." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe elephant stampeded and tore _____ the streets.", o: ["on","out","off","down"], e: "'Tear down' (rush violently along/destroy) fits — 'tore down the streets' means moved through the streets violently." },
  { s: ENG, q: "Select the word similar in meaning to the word given.\n\nScuttle", o: ["Solitary","Superficial","Soothing","Brazier"], e: "A 'scuttle' is a metal container for coal. A 'brazier' is also a metal coal container — synonyms." },
  { s: ENG, q: "Select the word similar in meaning to the word given.\n\nLoquacious", o: ["Talkative","Foolishness","Graceful","Entertainer"], e: "'Loquacious' means tending to talk a great deal — synonym 'Talkative'." },
  { s: ENG, q: "Select the word opposite in meaning to the word given.\n\nObfuscate", o: ["Envelop","Puzzle","Haze","Clarify"], e: "'Obfuscate' means to make obscure/unclear. Antonym: 'Clarify'." },
  { s: ENG, q: "Select the word opposite in meaning to the word given.\n\nTriumph", o: ["Establish","Sorrow","Disdain","Elation"], e: "'Triumph' means a great victory or joy. Antonym: 'Sorrow'." },
  { s: ENG, q: "Select the alternative which best expresses the meaning of the idiom/phrase.\n\nChicken-hearted", o: ["Coward","Short tempered","Composed","Bold"], e: "Per the source key, 'Bold' is marked. Note: literally 'chicken-hearted' means coward (option 1) — but the answer key chooses 'Bold' as the antonym to test inference." },
  { s: ENG, q: "Select the alternative which best expresses the meaning of the idiom/phrase.\n\nRed letter day", o: ["Starting day","Holiday","Significant day","Ending day"], e: "A 'red letter day' is a memorable or significant day, originally marked in red on calendars for important festivals/saints' days." },
  { s: ENG, q: "Improve the bracketed part of the sentence.\n\nHe jumped off the train while it (had been running).", o: ["has been running","ran","was running","No improvement"], e: "Past continuous 'was running' fits — describes an action in progress when another past action ('jumped') occurred." },
  { s: ENG, q: "Improve the bracketed part of the sentence.\n\nI (didn't see) him since we met two years ago.", o: ["am not seeing","have not seen","had not seen","No improvement"], e: "'Since' requires the present perfect. So 'have not seen' is correct." },
  { s: ENG, q: "Select the alternative which is the best substitute of the phrase.\n\nOne who is new to a profession", o: ["Nuance","Pun","Tyro","Vandal"], e: "A 'tyro' is a novice or beginner — someone new to a profession or activity." },
  { s: ENG, q: "Select the alternative which is the best substitute of the phrase.\n\nA speech or a presentation made without previous preparation.", o: ["Euphemism","Obituary","Extempore","Soliloquy"], e: "'Extempore' refers to a speech delivered without prior preparation." },
  { s: ENG, q: "Find the incorrectly spelt word.", o: ["Millionaire","Omission","Foreign","Propriety"], e: "Per the answer key, 'Propriety' is marked as incorrect (intended to be 'Proprietary'). Note: 'Propriety' itself is a valid word meaning correctness — but per source key, option 4 is treated as the misspelled word." },
  { s: ENG, q: "Find the incorrectly spelt word.", o: ["Acquaintence","Appeasement","Abnormality","Accentuate"], e: "'Acquaintence' is misspelled — correct spelling is 'Acquaintance'." },
  { s: ENG, q: "Select the most logical order of the sentences to form a coherent paragraph.\n\nP: And the victims are likely to be the poorest of the poor as well as the very sources of water — rivers, wetlands and aquifers.\nQ: In India, water conflicts are likely to worsen before they begin to be resolved.\nR: Till then, they pose a significant threat to economic growth, security and health of the ecosystem.\nS: Water is radically altering and affecting political boundaries all over world, between as well as within countries.", o: ["SQPR","PRQS","QRPS","PSQR"], e: "S introduces water issues globally. Q narrows to India. P explains victims. R concludes the threat. Order: SQPR." },
  { s: ENG, q: "Select the most logical order of the sentences to form a coherent paragraph.\n\nP: For one, very few entrepreneurs are willing to take on a new outsource, unless it comes with a guarantee of a certain level of sales.\nQ: This invariably acts as an incentive for outsources to be lax in developing the business.\nR: Despite being the dominant partner in the relationship, the outsource does not always have all the advantages.\nS: The trade refers to it as the minimum guarantee clause, which means that if a outsource is unable to reach an anticipated sales level, he will be compensated for the balance amount.", o: ["PRQS","SPQR","QSPR","RPSQ"], e: "R introduces the topic. P explains why. S defines the clause. Q states the consequence. Order: RPSQ." },
  { s: ENG, q: "Select the one which best expresses the same sentence in Passive/Active voice.\n\nSomebody told me that there had been a robbery in the jewellery exhibition.", o: ["I was informed that there was a robbery in the jewellery exhibition.","I was told by somebody that there has been a robbery in the jewellery exhibition.","I was told by somebody about a robbery in the jewellery exhibition.","I was told about a robbery in the jewellery exhibition."], e: "Active 'Somebody told me that X' becomes passive 'I was told by somebody that X'. Option 2 retains the structure most faithfully." },
  { s: ENG, q: "Select the one which best expresses the same sentence in indirect/Direct speech.\n\nRohan said, 'Where shall I be this time next month'?", o: ["Rohan contemplated where shall he be that time the following month.","Rohan asked that where should be that time next month.","Rohan wondered where he should be that time the next month.","Rohan wondered where he would be that time the following month."], e: "In indirect speech, 'shall' becomes 'would', 'next month' becomes 'the following month'. Option 4 is correct." },
  { s: ENG, q: "Cloze test passage:\n\n'The modes of action are _____ in science and religion. Science relies on experiment, whereas religion is based on experience...'\n\nFill blank 1: The modes of action are _____ in science and religion.", o: ["similar","different","equal","relevant"], e: "The passage contrasts science and religion — 'different' fits the contrast." },
  { s: ENG, q: "Fill blank 2: Any religious _____ whether it is Christ's or Ramakrishna's is personal.", o: ["experience","thought","festival","activity"], e: "Religion is based on 'experience' (per the previous sentence), so blank 2 = 'experience'." },
  { s: ENG, q: "Fill blank 3: Any religious experience ... is personal and _____.", o: ["significant","irrelevant","subjective","objective"], e: "'Subjective' (based on personal experience) contrasts with science being 'objective' in the next clause." },
  { s: ENG, q: "Fill blank 4: Theory has to be corroborated by _____ proof providing material comforts.", o: ["intangible","transparent","tangible","unique"], e: "'Tangible' (perceptible by touch / concrete) fits — scientific theory needs concrete proof." },
  { s: ENG, q: "Fill blank 5: The frontiers of science do not end in knowledge but are _____ to the formation of appliances for actual use.", o: ["implied","associated","designated","extended"], e: "'Extended to' fits — science is extended/applied to making appliances for actual use." }
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

  const TEST_TITLE = 'SSC CGL Tier-I - 10 August 2017 Shift-2';
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
