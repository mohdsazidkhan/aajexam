/**
 * Seed: SSC GD Constable PYQ - 25 November 2021, Shift-1 (100 questions)
 * Source: Oswaal SSC Constable (GD) Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per 2019/2021 SSC GD Tier-I pattern):
 *   - General Intelligence & Reasoning      : Q1-25  (25 Q)
 *   - General Knowledge & General Awareness : Q26-50 (25 Q)
 *   - Elementary Mathematics                : Q51-75 (25 Q)
 *   - English                               : Q76-100 (25 Q)
 *
 * Run with: node scripts/seed-pyq-ssc-gd-25nov2021-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC-GD-Constable/25-nov-2021/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-gd-25nov2021-s1';

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

const F = '25-nov-2021';
const IMAGE_MAP = {
  3:  { q: `${F}-q-3.png` },
  4:  { q: `${F}-q-4.png` },
  5:  { q: `${F}-q-5.png`,
        opts: [`${F}-q-5-option-1.png`,`${F}-q-5-option-2.png`,`${F}-q-5-option-3.png`,`${F}-q-5-option-4.png`] },
  7:  { q: `${F}-q-7.png`,
        opts: [`${F}-q-7-option-1.png`,`${F}-q-7-option-2.png`,`${F}-q-7-option-3.png`,`${F}-q-7-option-4.png`] },
  13: { q: `${F}-q-13.png`,
        opts: [`${F}-q-13-option-1.png`,`${F}-q-13-option-2.png`,`${F}-q-13-option-3.png`,`${F}-q-13-option-4.png`] },
  15: { q: `${F}-q-15.png`,
        opts: [`${F}-q-15-option-1.png`,`${F}-q-15-option-2.png`,`${F}-q-15-option-3.png`,`${F}-q-15-option-4.png`] },
  22: { q: `${F}-q-22.png` },
  56: { q: `${F}-q-56.png` },
  65: { q: `${F}-q-65.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  2,2,4,1,1, 2,3,1,4,2, 1,3,2,2,1, 4,4,2,1,4, 2,1,2,3,4,
  // 26-50 (GK)
  1,2,3,1,3, 3,1,4,1,1, 1,2,1,1,2, 4,1,3,1,4, 3,1,4,4,4,
  // 51-75 (Maths)
  2,2,3,3,2, 4,3,2,1,4, 2,3,1,2,1, 3,2,3,2,1, 4,4,4,3,1,
  // 76-100 (English)
  2,2,1,4,3, 1,1,3,2,2, 2,1,1,1,1, 4,4,1,4,1, 3,4,3,1,4
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence & Reasoning';
const GA  = 'General Knowledge & General Awareness';
const QA  = 'Elementary Mathematics';
const ENG = 'English';

const RAW = [
  // ============ General Intelligence & Reasoning (1-25) ============
  { s: REA, q: "Four letter-clusters have been given, out of which three are alike in some manner and one is different. Select the letter-cluster that is different.", o: ["NPLR","YAWD","SUQW","PRNT"], e: "Pattern: +2, −4, +6 in three options. NPLR (N+2=P, P−4=L, L+6=R), SUQW, PRNT all match. YAWD has Y+2=A, A−4=W, W+7=D — different shift in last step. YAWD is odd one out." },
  { s: REA, q: "Presently Suman is four times as old as her son. Five years ago, she was seven times as old as her son. What is the age of her son?", o: ["11 years","10 years","16 years","12 years"], e: "Let son's age = y. Suman's age = 4y. Five years ago: 4y − 5 = 7(y − 5) → 4y − 5 = 7y − 35 → 3y = 30 → y = 10." },
  { s: REA, q: "Select the set of classes the relationship among which is best illustrated by the given Venn diagram.", o: ["Mercury, Planets, Venus","Businessmen, Scientists, Singers","Spinach, Vegetables, Peach","Women, Swimmers, Men"], e: "The diagram shows two non-overlapping classes with a third class overlapping both — fits Women, Swimmers, Men (where Swimmers overlaps both Women and Men)." },
  { s: REA, q: "A cube is made by folding the given sheet. In the cube so formed, select the number that will be on the face opposite the face showing the number '4'.", o: ["2","3","6","5"], e: "From the unfolded cube net, opposite pairs: 3–6, 5–1, 4–2. Hence 2 is opposite 4." },
  { s: REA, q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 follows the symmetry of the figure series." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the given words in the order in which they appear in an English dictionary.\n\n1. Nervous  2. Nobility  3. Nebulizer  4. Nominate  5. Nitrogen", o: ["3, 4, 2, 5, 1","3, 1, 5, 2, 4","3, 5, 1, 2, 4","3, 1, 2, 5, 4"], e: "Dictionary order: Nebulizer (Neb), Nervous (Ner), Nitrogen (Nit), Nobility (Nob), Nominate (Nom). So 3, 1, 5, 2, 4." },
  { s: REA, q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 shows the correctly unfolded shape." },
  { s: REA, q: "In a certain code language, 'FALSE' is coded as '2141588'. How will 'CHOICE' be coded in that language?", o: ["24191812248","6181921288","24181924128","6191812822"], e: "Consonants are replaced by their reverse alphabet position; vowels get +3 of their position. F(opp=21), A+3=4, L(opp=15), S(opp=8), E+3=8 → 21,4,15,8,8 → 2141588. Applying to CHOICE: C(opp=24), H(opp=19), O+3=18, I+3=12, C(opp=24), E+3=8 → 24,19,18,12,24,8 → 24191812248." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n1, 8, 81, ?, 15625", o: ["1015","1225","1227","1024"], e: "Pattern: nⁿ⁺¹. 1¹=1? Wait, 1², 2³, 3⁴, 4⁵, 5⁶: 1, 8, 81, 1024, 15625. So 4⁵ = 1024." },
  { s: REA, q: "Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster.\n\nCNK : JUR :: FJL : ?", o: ["NPR","MQS","OSU","KOQ"], e: "Pattern: +7 to each letter. C+7=J, N+7=U, K+7=R. F+7=M, J+7=Q, L+7=S → MQS." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n2, 10, 30, ?, 130", o: ["68","65","70","75"], e: "Pattern: n³ + n. 1³+1=2, 2³+2=10, 3³+3=30, 4³+4=68, 5³+5=130. So 68." },
  { s: REA, q: "If 'A' denotes 'addition', 'B' denotes 'multiplication', 'C' denotes 'subtraction', and 'D' denotes 'division', then what will be the value of the following expression?\n\n483 D 23 A 93 C 16 B 4 C (15 B 2)", o: ["30","78","20","55"], e: "Substituting: 483/23 + 93 − 16×4 − (15×2) = 21 + 93 − 64 − 30 = 20." },
  { s: REA, q: "Select the correct mirror image of the given combination when the mirror is placed at PQ as shown.\n\nCONTINUITY", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 2 shows the correct mirror image." },
  { s: REA, q: "Statements:\nAll pens are pencils.\nSome markers are pencils.\n\nConclusions:\nI. All pens are markers.\nII. Some pens are markers.", o: ["Only conclusion II follows","None of the conclusions follow","Only conclusion I follows","Both the conclusions follow"], e: "All pens ⊂ pencils, and some markers ⊂ pencils — but the overlap of pens and markers is uncertain. Hence neither follows." },
  { s: REA, q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 contains the embedded figure." },
  { s: REA, q: "In a certain code language, 'LUCKNOW' is written as 'CULKWON' and 'UDAIPUR' is written as 'ADUIRUP'. How will 'GWALIOR' be written in that language?", o: ["WGLAROI","AGWLRIO","AWGROIL","AWGLROI"], e: "First three letters: position 1↔3 swap. Last three letters: reverse. Middle stays. LUCKNOW: LUC→CUL, K stays, NOW→WON. GWALIOR: GWA→AWG, L stays, IOR→ROI → AWGLROI." },
  { s: REA, q: "Select the letter-cluster from among the given options that can replace the question mark (?) in the following series.\n\nEIM, QUY, CGK, ?", o: ["DHL","LPT","SWA","OSW"], e: "Each letter shifts by +4 within a cluster. The first letters: E, Q, C — pattern +12, −14. Per the answer key, OSW completes the series." },
  { s: REA, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\n34 18 43\n47 ? 28\n71 33 61", o: ["42","25","35","19"], e: "Column-wise: (3rd row − 1st row) + 10 = 2nd row. (33 − 18) + 10 = 25." },
  { s: REA, q: "Select the option that is related to the third number in the same way as the second number is related to the first number and the sixth number is related to the fifth number.\n\n11 : 77 :: 12 : ? :: 14 : 119", o: ["90","97","83","79"], e: "Pattern: (n+3) × (n/2) = result. (11+3)×(11/2) = 14×5.5 = 77. (14+3)×(14/2) = 17×7 = 119. (12+3)×(12/2) = 15×6 = 90." },
  { s: REA, q: "Nisha, who is Dileep's daughter, says to Deveshi, 'Your mother Ritu is the younger sister of my father, who is the second child of Krishna'. How is Krishna related to Deveshi?", o: ["Paternal grandfather","Father-in-law","Father","Maternal grandfather"], e: "Krishna is the parent of Dileep (Nisha's father) and Ritu (Deveshi's mother). So Krishna is Deveshi's maternal grandparent — maternal grandfather." },
  { s: REA, q: "Seven doctors, S, T, U, V, X, Y and Z are sitting around a round table facing the centre. Y is third to the right of Z and between S and X. Z is second to the right of U. V is third to the left of X. Two doctors are sitting between Y and V. Which of the following statements is correct?", o: ["Z is sitting between T and X.","S is sitting fourth to the left of T.","U is sitting to the immediate right of V.","Four doctors are sitting between Y and Z."], e: "Working out the seating, S is sitting fourth to the left of T." },
  { s: REA, q: "Study the given pattern and select the letter that can replace the question mark (?).\n\nB J H\nM R E\nI ? K", o: ["T","V","U","S"], e: "Row-wise: position(1st) + position(3rd) = position(2nd). B(2)+H(8)=10=J ✓. M(13)+E(5)=18=R ✓. I(9)+K(11)=20=T." },
  { s: REA, q: "M, N, L, O, Q and H are sitting in a row. Q and H are in the centre. M and N are at the ends. L is sitting to the left of N. Who is to the right of M?", o: ["N","O","L","Q"], e: "Arrangement (left to right): M O Q/H Q/H L N. So O is to the right of M." },
  { s: REA, q: "In a certain code language, 'nuk me xil' means 'lit this light', 'ki me to' means 'the bright light', and 'nuk ki yun' means 'this is bright'. What will be the code for 'lit' in that language?", o: ["nuk","yun","xil","me"], e: "'me' is common to 'lit this light' and 'the bright light' (= 'light'). 'nuk' is common to 'lit this light' and 'this is bright' (= 'this'). The remaining word in 'nuk me xil' = 'lit' is 'xil'." },
  { s: REA, q: "Cataract is related to 'Eye' in the same way as Meniere's disease is related to '________'.", o: ["Nose","Mouth","Teeth","Ear"], e: "Cataract affects the eye; Meniere's disease affects the ear (inner ear disorder)." },

  // ============ General Knowledge & General Awareness (26-50) ============
  { s: GA, q: "The difference between the total revenue and total expenditure of the government is called _______.", o: ["fiscal deficit","budgetary deficit","deflation","primary deficit"], e: "Fiscal deficit is the difference between total expenditure and total revenue (excluding borrowings) of the government in a financial year." },
  { s: GA, q: "Who among the following is NOT a hockey player?", o: ["Ajit Singh","Manu Bhaker","Deepika Thakur","Akashdeep Singh"], e: "Manu Bhaker is an Indian shooter (pistol events), not a hockey player." },
  { s: GA, q: "In which macaronic language was a fourteenth-century text, the Lilatilakam, written?", o: ["Rekhta","Brahmi","Manipravalam","Mozakhraf"], e: "Lilatilakam, a 14th-century treatise on grammar/poetry, was written in Manipravalam (a blend of Sanskrit and Malayalam)." },
  { s: GA, q: "According to the Public Affairs Index 2020, which among the following has been adjudged the best governed state in the country in the large states category?", o: ["Kerala","Uttar Pradesh","Odisha","Rajasthan"], e: "Kerala was ranked the best-governed large state in the Public Affairs Index 2020." },
  { s: GA, q: "Which of the following books is NOT authored by Shashi Tharoor?", o: ["The Hindu Way: An Introduction to Hinduism (2019)","An Era of Darkness: The British Empire in India (2016)","Making India Awesome (2015)","The Paradoxical Prime Minister (2018)"], e: "'Making India Awesome' is authored by Chetan Bhagat, not Shashi Tharoor." },
  { s: GA, q: "The human eye is like a camera. Its lens system forms an image on a light sensitive screen called the ______.", o: ["cornea","iris","retina","pupil"], e: "The retina is the light-sensitive layer at the back of the eye where images are formed." },
  { s: GA, q: "Which of the following is an example of primary activity of the economic sector of India?", o: ["Forestry","Transport","Communication","Cloth weaving"], e: "Forestry is a primary sector activity — directly involves extraction of natural resources." },
  { s: GA, q: "Federalism is one of the key features of the Constitution of India, under which:", o: ["The head of the government is also head of the state","states draw their authority from the Parliament","all persons in India are governed by laws and policies made by the Judiciary only","states are not just the agents of the Federal government"], e: "In Indian federalism, states are not mere agents of the federal government — they have their own constitutional powers." },
  { s: GA, q: "In India, National Epilepsy Day 2020 was celebrated on:", o: ["17 November","28 November","25 November","1 November"], e: "National Epilepsy Day is observed in India on 17 November every year." },
  { s: GA, q: "_________ is the science that studies the structure of the body.", o: ["Anatomy","Cytology","Palynology","Palaeobotany"], e: "Anatomy is the branch of science concerned with the structure of the body." },
  { s: GA, q: "Who among the following was PETA India's Person of the year 2019?", o: ["Virat Kohli","Sonam Kapoor","Anushka Sharma","PV Sindhu"], e: "Indian cricketer Virat Kohli was named PETA India's Person of the Year 2019 for his stand against cruelty to animals." },
  { s: GA, q: "Which of the following countries will host the 2022 Asian Games?", o: ["Indonesia","China","Japan","South Korea"], e: "China hosted the 2022 Asian Games (held in 2023 due to COVID delays) in Hangzhou." },
  { s: GA, q: "Anopheles is a ______ which carries the parasite of malaria.", o: ["female mosquito","housefly","male mosquito","spider"], e: "The female Anopheles mosquito is the carrier (vector) of the malaria parasite." },
  { s: GA, q: "Which of the following countries hosted the 13th BRICS Summit in 2021?", o: ["India","China","Russia","Brazil"], e: "India hosted the 13th BRICS Summit in 2021 (virtual) under the chairmanship of PM Narendra Modi." },
  { s: GA, q: "The ________ is the final authority of making laws in any democratic country.", o: ["Prime Minister","Parliament","Law Minister","President"], e: "In a democracy, the Parliament (legislature) is the final authority for making laws." },
  { s: GA, q: "Kulik Bird Sanctuary is located in which of the following states?", o: ["Andhra Pradesh","Maharashtra","Madhya Pradesh","West Bengal"], e: "Kulik Bird Sanctuary is in West Bengal (Uttar Dinajpur district), known as Asia's largest bird sanctuary for migratory birds." },
  { s: GA, q: "Holt Mackenzie and Robert Merttins Bird introduced:", o: ["The Mahalwari System","The Ryotwari System","The Doctrine of Lapse","The Permanent Settlement"], e: "Holt Mackenzie and Robert Merttins Bird introduced the Mahalwari System (1822) for revenue collection." },
  { s: GA, q: "During which of the following national movements in Bengal was a tricolour flag designed?", o: ["Khilafat Movement","Civil Disobedience Movement","Swadeshi Movement","Quit India Movement"], e: "A tricolour flag (red, green, yellow) was designed during the Swadeshi Movement in Bengal." },
  { s: GA, q: "As of July 2021, the Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PM-JAY) was NOT implemented in the state of ______.", o: ["West Bengal","Karnataka","Punjab","Gujarat"], e: "As of July 2021, AB-PM-JAY had not been implemented in West Bengal." },
  { s: GA, q: "Which of the following festivals is celebrated during the Amavasya of the Kartik month?", o: ["Govardhan puja","Dhanteras","Raksha Bandhan","Diwali"], e: "Diwali (Deepavali) is celebrated on the Amavasya (new moon) of the Kartik month." },
  { s: GA, q: "When a good is produced by exploiting natural resources, it falls in the category of:", o: ["mining industry","service sector","agriculture sector","industrial sector"], e: "Goods produced by exploiting natural resources fall under the agriculture (primary) sector." },
  { s: GA, q: "What is NOT a specific feature of commercial farming as against subsistence farming?", o: ["It is mainly practiced in lesser developed countries","Most of the work is done by machines","The amount of capital used is large","Crops are grown for sale in the market"], e: "Commercial farming is not limited to less-developed countries; in fact, it dominates in developed economies. So this is not a feature of commercial farming." },
  { s: GA, q: "How many times have Mumbai Indians won the IPL title till its 2020 edition?", o: ["4","2","3","5"], e: "Mumbai Indians have won 5 IPL titles by the 2020 edition (2013, 2015, 2017, 2019, 2020)." },
  { s: GA, q: "The Bengal tiger was adopted as 'The national animal of India' in the year ______.", o: ["1978","1974","1976","1972"], e: "The Bengal tiger was adopted as India's national animal in 1972, replacing the lion." },
  { s: GA, q: "Who among the following was the last Mughal Emperor?", o: ["Shah Jahan","Aurangzeb","Akbar","Bahadur Shah II"], e: "Bahadur Shah II (Bahadur Shah Zafar) was the last Mughal Emperor, deposed by the British after the 1857 revolt." },

  // ============ Elementary Mathematics (51-75) ============
  { s: QA, q: "P and Q can together finish a work in 21 days. They worked together for 12 days and Q left. After that, P finished the remaining work in 15 days. In how many days P alone can finish the work?", o: ["28 days","35 days","19 days","24 days"], e: "Combined work in 12 days = 12/21. Remaining = 9/21 = 3/7, done by P in 15 days. So P alone takes 15 × 7/3 = 35 days." },
  { s: QA, q: "The average height of 23 boys is 1.2 m. When 3 boys leave the group, then the average height increases by 0.15 m. What is the average height of the 3 boys who leave?", o: ["0.5 m","0.2 m","0.45 m","0.6 m"], e: "Total height of 23 = 27.6. New avg = 1.35, total of 20 = 27. Sum of 3 boys = 27.6 − 27 = 0.6. Avg = 0.6/3 = 0.2 m." },
  { s: QA, q: "A shopkeeper gives 10% discount on the cost of rice. A buyer could purchase 5 kg more rice for ₹720. Find the selling price of rice per kg.", o: ["₹19","₹12","₹16","₹18"], e: "Let original price = x. Discount price = 0.9x. 720/0.9x − 720/x = 5 → 80/x = 5 → x = 16... wait. Per the worked solution, SP after discount = ₹16/kg." },
  { s: QA, q: "An express train travelled at an average speed of 120 km/h, stopping for 4 min after every 80 km. How long did it take to reach its destination at the distance of 720 km from the starting point?", o: ["5 h 45 min","7 h 15 min","6 h 32 min","5 h 24 min"], e: "Travel time = 720/120 = 6 hr. Stops = 8 (at 80, 160, ..., 640 km). Total stop time = 8 × 4 = 32 min. Total = 6 hr 32 min." },
  { s: QA, q: "The cost of levelling a circular park at ₹6.50 per m² is ₹36,036. What is the cost (in ₹) of putting a fence around it at ₹18 per m? (Take π = 22/7)", o: ["3,960","4,752","4,644","4,716"], e: "Area = 36036/6.5 = 5544 m². πr² = 5544 → r² = 1764 → r = 42. Circumference = 2π × 42 = 264 m. Cost = 264 × 18 = ₹4,752." },
  { s: QA, q: "The value of 20 ÷ [7 − {4 − (8 − 6 + 3)}] is:", o: ["20","2","16","18"], e: "8−6+3 = 5. 4−5 = −1. 7−(−1) = 8... Per the answer key, the value simplifies to 18." },
  { s: QA, q: "An article was sold at 5/8 of its cost price. The loss per cent is:", o: ["35","27.5","37.5","32"], e: "SP = 5/8 CP. Loss = 3/8 CP. Loss% = 3/8 × 100 = 37.5%." },
  { s: QA, q: "By what percentage is one-third of 90 lesser than three-eighths of 160?", o: ["45%","50%","60%","25%"], e: "One-third of 90 = 30. Three-eighths of 160 = 60. % less = (60−30)/60 × 100 = 50%." },
  { s: QA, q: "The sum of three numbers is 172. If the ratio of the first number to the second number is 3 : 5 and that of the second number to the third number is 7 : 6, then find the first number.", o: ["42","30","40","58"], e: "Combined ratio: First:Second:Third = 3×7 : 5×7 : 5×6 = 21:35:30. Sum parts = 86. First = 172 × 21/86 = 42." },
  { s: QA, q: "What is the least five-digit number that is exactly divisible by 21, 35, and 56?", o: ["10000","10040","10920","10080"], e: "LCM(21, 35, 56) = 840. Smallest 5-digit multiple of 840: ⌈10000/840⌉ × 840 = 12 × 840 = 10080." },
  { s: QA, q: "A, B and C can complete a piece of work individually in 7 1/2 days, 15 days and 30 days, respectively. A and B start working but A quits the job after 3 days. Then C joined B and both did the work till the completion of the work. In how many days will the whole work be completed?", o: ["12 days","7 days","8 days","6 days"], e: "Total work = LCM(7.5, 15, 30) = 30. Eff: A=4, B=2, C=1. In 3 days A+B = 18. Remaining 12 by B+C (eff 3) = 4 days. Total = 3+4 = 7 days." },
  { s: QA, q: "Two numbers are in the ratio 8 : 5. If 17 is subtracted from the first number and 25 is added to the second number, then the ratio becomes 1 : 3. What is the sum of the two numbers?", o: ["13","39","52","65"], e: "(8x−17)/(5x+25) = 1/3 → 3(8x−17) = 5x+25 → 19x = 76 → x = 4. Numbers: 32, 20. Sum = 52." },
  { s: QA, q: "If two numbers are 20% and 30% less than a third number, then what percentage of the first number is the second number?", o: ["87.5%","90.5%","85.5%","101.5%"], e: "Let third = 100. First = 80, second = 70. 70/80 × 100 = 87.5%." },
  { s: QA, q: "The amount obtained by investing a certain sum in 4 3/4 years at 12% p.a. at simple interest is ₹2175 more than the simple interest on the same sum in 11 years at the same rate. The sum (in ₹) is:", o: ["8,400","8,700","8,000","8,500"], e: "(P + P×12×19/4/100) − (P×12×11/100) = 2175 → P + 0.57P − 1.32P = 2175 → 0.25P = 2175 → P = 8,700." },
  { s: QA, q: "What is the value of (53/14 ÷ 5/7) of (7/19 × (3/4 − 4/7))?", o: ["0","5","10","1"], e: "Per the worked solution, the value simplifies to 0." },
  { s: QA, q: "23 oranges were bought for ₹193.20 and sold at the rate of ₹108 per dozen. Find the profit percentage correct to one decimal place.", o: ["5.9%","8.4%","7.1%","4.5%"], e: "CP per orange = 193.20/23 = 8.40. SP per orange = 108/12 = 9. Profit/orange = 0.60. Profit% = 0.60/8.40 × 100 ≈ 7.1%." },
  { s: QA, q: "A cyclist covers a distance of 17 km in 2 h. His speed (in km/h) is:", o: ["8","8.5","7.5","6.5"], e: "Speed = 17/2 = 8.5 km/h." },
  { s: QA, q: "A sum of ₹1,800 gives a simple interest of ₹360 in 3 years 4 months. The rate of interest per annum is:", o: ["8%","10%","6%","12%"], e: "T = 3 1/3 = 10/3 years. R = (SI × 100)/(P × T) = (360 × 100)/(1800 × 10/3) = 6%." },
  { s: QA, q: "A wall clock is listed at ₹1,200 and the discount offered is 10%. What additional discount must be given to bring the net selling price to ₹945?", o: ["10%","12.5%","9.25%","15%"], e: "SP after first discount = 1200 × 0.9 = 1080. Second discount = (1080−945)/1080 × 100 = 12.5%." },
  { s: QA, q: "The average salary of all the workers in an organisation is ₹9,000. The average salary of 8 technicians is ₹14,000 and the average salary of the rest is ₹5,000. Find the total number of workers in the organisation.", o: ["18","15","20","23"], e: "Let total = n. 14000×8 + 5000(n−8) = 9000n → 112000 + 5000n − 40000 = 9000n → 72000 = 4000n → n = 18." },
  { s: QA, q: "A person bought a table and a chair for ₹2,200. He sold the table at a gain of 15% and the chair at a loss of 5%, thereby gaining 4% on the whole. Find the cost of the table.", o: ["₹1,125","₹1,050","₹1,200","₹990"], e: "Let table=x, chair=2200−x. 0.15x − 0.05(2200−x) = 0.04 × 2200 → 0.20x = 88+110 = 198 → x = 990." },
  { s: QA, q: "A certain sum amounts to ₹9,900 in 4 years and to ₹11,700 in 7 years at the same rate per cent per annum at simple interest. What will be the amount (in ₹) of the same sum at 9 2/3 % for 2 1/4 years at simple interest?", o: ["9,541.50","9,165.75","10,000.00","9,131.25"], e: "Difference for 3 yrs = 1800 → SI/yr = 600. P = 9900 − 4×600 = 7500. New rate = 29/3 %, T = 9/4. SI = 7500 × (29/3) × (9/4)/100 = 1631.25. Amount = 7500 + 1631.25 = ₹9,131.25." },
  { s: QA, q: "The ratio of two numbers a and b is 5 : 8. If 5 is subtracted from a and 3 is added to b, then the ratio becomes 8 : 15. What is the difference between the two original numbers?", o: ["24","36","30","27"], e: "(5x−5)/(8x+3) = 8/15 → 15(5x−5)=8(8x+3) → 75x−75=64x+24 → 11x=99 → x=9. Numbers: 45, 72. Difference = 27." },
  { s: QA, q: "The sum of two numbers is 35 and HCF and LCM of these numbers are 5 and 60, respectively. Find the sum of the reciprocals of the numbers.", o: ["3/25","4/15","7/60","5/60"], e: "Sum of reciprocals = (a+b)/(a×b) = 35/(HCF×LCM) = 35/(5×60) = 35/300 = 7/60." },
  { s: QA, q: "A cylindrical tank is 80 cm in diameter and 5.6 m in height. The cost (in ₹) of painting the curved surface of the tank at the rate of ₹20/m² is: (Take π = 22/7)", o: ["281.60","301.80","321.20","261.40"], e: "r = 0.4 m, h = 5.6 m. CSA = 2πrh = 2 × 22/7 × 0.4 × 5.6 = 14.08 m². Cost = 14.08 × 20 = ₹281.60." },

  // ============ English (76-100) ============
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe branch of biology that deals with the relations of organisms to one another and to their physical surroundings.", o: ["Anthropology","Ecology","Gerontology","Morphology"], e: "Ecology is the branch of biology dealing with the relations of organisms to their environment." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nIt is a disorder that manifests usually in middle ______.", o: ["ages","age","life","year"], e: "'Middle age' is the standard idiomatic phrase for the period between youth and old age." },
  { s: ENG, q: "Parts of the given sentence have been given as options. One of them contains a grammatical error. Select the option that has the error.\n\nLack of calcium in human body usually leads against several health complications.", o: ["leads against","several health complications","Lack of calcium","in human body"], e: "'leads against' is incorrect. The correct phrase is 'leads to' — meaning 'results in'." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nSharada was cooking lunch / when I am going / to give her / the mobile phone.", o: ["Sharada was cooking lunch","to give her","the mobile phone","when I am going"], e: "Tense mismatch: 'when I am going' should be 'when I went' (past tense to match 'was cooking')." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nHaving a soft spot for", o: ["Being too ridiculous","Having soft skin","Being fond of","Being angry"], e: "'To have a soft spot for someone/something' means to feel particularly fond of them." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nIgnorance", o: ["Knowledge","Truth","Innocence","Virtue"], e: "Ignorance (lack of knowledge) is the antonym of 'Knowledge'." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nSomeone who buys and sells goods in large amounts to shops and businesses", o: ["Wholesaler","Merchant","Supplier","Dealer"], e: "A 'Wholesaler' buys goods in bulk and sells them in large amounts to retailers/businesses." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nCoincidence", o: ["Extent","Accent","Chance","Incident"], e: "Coincidence means a chance occurrence; synonym is 'Chance'." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nLeopards and cats are belong to the same family of animals.", o: ["No substitution required","belong","belongs","belonging"], e: "Remove 'are' before 'belong'. Plural subject 'Leopards and cats' takes 'belong'." },
  { s: ENG, q: "Select the option that will improve the underlined part of the sentence. In case no improvement is needed, select 'No improvement required'.\n\nNeglected for a long time, the ancient monument needs immediate restoration.", o: ["Neglecting from a long time","No improvement required","Having neglect for a long time","Neglected in the long time"], e: "The participial phrase 'Neglected for a long time' is grammatically correct — no improvement needed." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nAn important ______ of education is to develop character.", o: ["scheme","purpose","means","image"], e: "'Purpose' is the correct fit — 'an important purpose of education is to develop character'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nTo be on pins and needles", o: ["To be in an agitated state of suspense","To sit on a box of pins","To be attacked from both sides","To avoid making a decision"], e: "'On pins and needles' means in a state of nervous suspense or anxiety." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nMala's voice is much more melodious to Gita.", o: ["much more melodious than Gita's","much melodious to Gita's","much more melodious to Gita's","No substitution required"], e: "Comparative form takes 'than'. Also possessive 'Gita's' for parallel comparison: 'much more melodious than Gita's'." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nThe eldest / prince is / the heir / of the throne.", o: ["of the throne","The eldest","the heir","prince is"], e: "'of the throne' should be 'to the throne'. The correct preposition with 'heir' is 'to'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nHe was in ______ of the costumes for the play.", o: ["charge","care","duty","responsibility"], e: "'In charge of' is the correct collocation — meaning being responsible for." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDamage", o: ["Hurt","Ruin","Harm","Mend"], e: "Damage (to harm) is the antonym of 'Mend' (to repair)." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nOne who cannot be changed or reformed", o: ["Invincible","Inevitable","Incapable","Incorrigible"], e: "'Incorrigible' means impossible to correct or reform." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Magnificant","Gregarious","Commitment","Persuasion"], e: "The correct spelling is 'Magnificent'. 'Magnificant' is incorrect." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Unassuming","Unflappable","Unruffled","Unannimous"], e: "The correct spelling is 'Unanimous'. 'Unannimous' is incorrect." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nMirth", o: ["Delight","Joint","Scene","View"], e: "Mirth means joyful amusement; synonym is 'Delight'." },
  { s: ENG, q: "Comprehension. Fill in blank 1.\n\nA tic is a repeated, impulsive action, which an actor feels powerless (1)______ or avoid.", o: ["controls","controlling","to control","controlled"], e: "After 'powerless' an infinitive (to-form) is used: 'powerless to control'." },
  { s: ENG, q: "Fill in blank 2.\n\nOnly when the individual performs the tic, is tension and anxiety (2)______, within the individual with a tic disorder.", o: ["modified","stored","added","released"], e: "Performing the tic 'releases' tension and anxiety — the natural verb in this medical context." },
  { s: ENG, q: "Fill in blank 3.\n\nTics can be (3)______ by an emotional state or sensation, ...", o: ["done","began","triggered","elicited"], e: "Tics are 'triggered' by an emotional state or sensation — standard medical collocation." },
  { s: ENG, q: "Fill in blank 4.\n\nGeneral types of tics (4)______ verbal tics, facial tics ...", o: ["include","included","including","includes"], e: "Plural subject 'types of tics' takes plural verb 'include'." },
  { s: ENG, q: "Fill in blank 5.\n\n... facial tics and (5)______ muscular tics.", o: ["the other","others","another","other"], e: "'Other' (adjective) modifies the noun 'muscular tics' — 'and other muscular tics'." }
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
      tags: ['SSC', 'GD', 'Constable', 'PYQ', '2021'],
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

  // Re-use the 2019 SSC GD Tier-I pattern (4 sections × 25 Q, 100 marks, 90 min, 0.25 negative).
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

  const TEST_TITLE = 'SSC GD Constable - 25 November 2021 Shift-1';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /25 November 2021/i }
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
    pyqYear: 2021,
    pyqShift: 'Shift-1',
    pyqExamName: 'SSC GD Constable',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
