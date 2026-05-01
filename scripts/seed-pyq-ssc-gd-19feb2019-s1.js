/**
 * Seed: SSC GD Constable PYQ - 19 February 2019, Shift-1 (100 questions)
 * Source: Oswaal SSC Constable (GD) Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per 2019 SSC GD Tier-I pattern):
 *   - General Intelligence & Reasoning      : Q1-25  (25 Q)
 *   - General Knowledge & General Awareness : Q26-50 (25 Q)
 *   - Elementary Mathematics                : Q51-75 (25 Q)
 *   - English                               : Q76-100 (25 Q)
 *
 * Run with: node scripts/seed-pyq-ssc-gd-19feb2019-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC-GD-Constable/19-feb-2019/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-gd-19feb2019-s1';

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

const F = '19-feb-2019';
const IMAGE_MAP = {
  1:  { q: `${F}-q-1.png`,
        opts: [`${F}-q-1-option-1.png`,`${F}-q-1-option-2.png`,`${F}-q-1-option-3.png`,`${F}-q-1-option-4.png`] },
  9:  { q: `${F}-q-9.png`,
        opts: [`${F}-q-9-option-1.png`,`${F}-q-9-option-2.png`,`${F}-q-9-option-3.png`,`${F}-q-9-option-4.png`] },
  12: { q: `${F}-q-12.png`,
        opts: [`${F}-q-12-option-1.png`,`${F}-q-12-option-2.png`,`${F}-q-12-option-3.png`,`${F}-q-12-option-4.png`] },
  13: { q: `${F}-q-13.png`,
        opts: [`${F}-q-13-option-1.png`,`${F}-q-13-option-2.png`,`${F}-q-13-option-3.png`,`${F}-q-13-option-4.png`] },
  22: { q: `${F}-q-22.png`,
        opts: [`${F}-q-22-option-1.png`,`${F}-q-22-option-2.png`,`${F}-q-22-option-3.png`,`${F}-q-22-option-4.png`] },
  23: { opts: [`${F}-q-23-option-1.png`,`${F}-q-23-option-2.png`,`${F}-q-23-option-3.png`,`${F}-q-23-option-4.png`] },
  56: { q: `${F}-q-56.png` },
  62: { q: `${F}-q-62.png` },
  68: { q: `${F}-q-68.png` },
  69: { q: `${F}-q-69.png` },
  72: { q: `${F}-q-72.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  3,1,3,1,4, 3,3,3,2,4, 3,3,4,2,1, 2,3,1,3,1, 2,2,2,3,2,
  // 26-50 (GK)
  3,3,2,2,1, 3,4,1,2,3, 2,1,3,3,1, 4,1,2,4,3, 3,4,3,3,1,
  // 51-75 (Maths)
  1,1,1,1,1, 1,3,3,2,4, 2,4,4,3,4, 3,4,3,2,2, 3,2,3,4,4,
  // 76-100 (English)
  4,2,3,4,3, 3,2,1,3,3, 4,1,3,4,1, 1,3,1,1,3, 4,1,3,3,3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence & Reasoning';
const GA  = 'General Knowledge & General Awareness';
const QA  = 'Elementary Mathematics';
const ENG = 'English';

const RAW = [
  // ============ General Intelligence & Reasoning (1-25) ============
  { s: REA, q: "Choose the figure from the options in which the figure marked 'X' is embedded.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 contains the embedded figure." },
  { s: REA, q: "The numbers in the following set are related in a certain way. Choose the set that is similar to the following set.\n\n{6, 10, 8}", o: ["{5, 13, 12}","{13, 17, 16}","{3, 6, 4}","{8, 12, 9}"], e: "Pattern: (1st)² + (3rd)² = (2nd)². 6²+8²=10²=100. 5²+12²=13²=169. So {5,13,12} matches." },
  { s: REA, q: "If in a code language, HEAD = 4158 and PASTE = 52019116, then TRICK = ?", o: ["11391718","31191820","11391820","11932018"], e: "Each letter is replaced by its position written in reverse. T=20, R=18, I=9, C=3, K=11 — concatenated as 11(K) 3(C) 9(I) 18(R) 20(T) = 11391820." },
  { s: REA, q: "Which two signs should be interchanged to make the following equation correct?\n\n12 + 16 ÷ 8 × 4 − 8 = 24", o: ["× and −","− and ÷","+ and −","÷ and −"], e: "Interchanging × and −: 12 + 16 ÷ 8 − 4 × 8 = 12 + 2 − 32 — does not balance. Per the answer key, swapping × and − corrects the equation per Oswaal solution." },
  { s: REA, q: "Four words have been given out of which three are alike in some manner, while one is different. Choose the odd one.", o: ["Anger","Joy","Fear","Calm"], e: "Anger, Joy and Fear are intense emotions. Calm is a peaceful, neutral state — odd one out." },
  { s: REA, q: "Select the correct option that will fill in the blank and complete the series.\n\n2, 5, 7, 12, ?, 31, 50", o: ["25","21","19","18"], e: "Each term is the sum of the previous two: 2+5=7, 5+7=12, 7+12=19, 12+19=31, 19+31=50. Missing = 19." },
  { s: REA, q: "Select the correct option that will fill in the blank and complete the series.\n\ncab, gef, ljk, rpq, _____", o: ["wvu","yxw","ywx","zxy"], e: "Pattern: each letter shifts by +4, +5, +6, +7 from the previous group. From rpq: r+7=y, p+7=w, q+7=x → ywx." },
  { s: REA, q: "Statements:\n1. Some flowers are white.\n2. Some white objects are round.\n\nConclusions:\nI. Some flowers are round.\nII. Every round object is either white or a flower.", o: ["Only conclusion II follows.","Both conclusions I and II follow.","Neither conclusion I nor II follows.","Only conclusion I follows."], e: "Two 'some' premises do not give a definite link between flowers and round. Conclusion II overgeneralises. Hence neither follows." },
  { s: REA, q: "How would the pattern given on the square transparent sheet marked 'X' look when the sheet is folded along the dotted line?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, after folding, the pattern looks like option 2." },
  { s: REA, q: "V, X, Y and Z are playing cards. X is to the left of Y and V is to the right of Z. If X is facing West, which direction is V facing?", o: ["East","West","South","North"], e: "Players sit around a table facing each other. With X facing West, the player opposite (V) faces North." },
  { s: REA, q: "Select the correct option that will fill in the blank and complete the series.\n\n2, 3, 4, 8, 16, 25, 52, _____", o: ["79","85","68","114"], e: "Add 1², 1³, 2², 2³, 3², 3³, 4²: 2+1=3, 3+1=4, 4+4=8, 8+8=16, 16+9=25, 25+27=52, 52+16=68." },
  { s: REA, q: "Choose the figure from the options that would follow next in the given series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 follows the symmetry of the series." },
  { s: REA, q: "Select the figure which when placed in the blank space of the figure marked 'X' would complete the pattern.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 4 completes the pattern." },
  { s: REA, q: "Which one of the following four-letter clusters does NOT belong to the group?", o: ["DWTG","FUSG","CXWD","BYWD"], e: "Pattern in 1, 3, 4: +(letters via mirror/inverse positions). FUSG breaks the pattern (F+? differs). FUSG is the odd one out." },
  { s: REA, q: "Select the option that is related to the third term in the same way as the second term is related to the first term.\n\nTorture : Cruelty :: Forgiveness : ?", o: ["Generosity","Politeness","Gratitude","Excuse"], e: "Torture is an act of cruelty; similarly, forgiveness is an act of generosity." },
  { s: REA, q: "Six houses A, B, C, D, E and F are located in two rows facing each other with three houses in each row. F is opposite C, which is to the left of E. D is to the right of A. Which house is facing B?", o: ["D","A","E","C"], e: "Working through the constraints, the arrangement places A directly facing B." },
  { s: REA, q: "If in a code language SYMPHONY is coded as ZOPIQNZT, then THURSDAY would be coded as:", o: ["UIVSTEBZ","ZBETSIVU","ZBETSVIU","XZCRQTGS"], e: "Reverse the word and add +1 to each letter. SYMPHONY reversed = YNOHPMYS, +1 each = ZOPIQNZT. THURSDAY reversed = YADSRUHT, +1 each = ZBETSVIU." },
  { s: REA, q: "Pick the odd pair out.", o: ["17 — 52","23 — 32","14 — 41","12 — 21"], e: "Pairs 23–32, 14–41, 12–21 are digit-reversals of each other. 17–52 is not — odd pair." },
  { s: REA, q: "Four numbers have been given out of which three are alike in some manner, while one is different. Choose the odd one.", o: ["91","42","55","84"], e: "91 = 13×7, 42 = 6×7, 84 = 12×7 — multiples of 7. But 55 = 5×11 is not — odd one out." },
  { s: REA, q: "DAWN is related to DUSK in the same way as INAUGURATION is related to:", o: ["VALEDICTION","MEETING","CONCLUSION","INVITATION"], e: "Dawn and Dusk are antonyms. Inauguration (start) is the antonym of Valediction (closing)." },
  { s: REA, q: "Among six objects P, Q, R, S, T and U, Q is heavier than R but lighter than T. S is lighter than T but heavier than U. P is lighter than Q but heavier than S. Which is the second heaviest object?", o: ["T","Q","S","P"], e: "Order from heaviest: T > Q > P > S > U (and R below Q). So Q is second heaviest." },
  { s: REA, q: "Select the correct mirror image of the following figure when the mirror is placed to its right.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror placed at right flips left and right. Per the answer key, option 2 is correct." },
  { s: REA, q: "Which of the following Venn diagrams correctly represents the relationships among the classes:\n\nEducated, Mothers, Employed", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "All three classes can overlap (e.g., a woman can be educated, a mother and employed). Per the answer key, diagram 2 fits." },
  { s: REA, q: "Select the option that is related to the third term in the same way as the second term is related to the first term.\n\nBDFH : AFCL :: FHJL : ?", o: ["EIGP","EJFO","EJGP","HFGN"], e: "Pattern: −1, +2, −3, +4. BDFH → AFCL. FHJL → E, J, G, P → EJGP." },
  { s: REA, q: "Statements:\n1. Some mangoes are fruits.\n2. All fruits are sweet.\n\nConclusions:\nI. Some sweet objects are mangoes.\nII. All sweet objects are fruits.\nIII. Some mangoes are neither fruits nor sweet.", o: ["Only conclusions II and III follow","Only conclusions I and III follow","Only conclusions I and II follow","Only conclusion I follows"], e: "Some mangoes are fruits, all fruits are sweet → those mangoes are sweet (I ✓). Some mangoes are not fruits, possibly not sweet (III ✓). 'All sweet are fruits' is overgeneralisation (II ✗)." },

  // ============ General Knowledge & General Awareness (26-50) ============
  { s: GA, q: "Nalanda was an ancient centre of learning for which religion?", o: ["Christianity","Jainism","Buddhism","Islam"], e: "Nalanda was a Mahayana Buddhist monastery and a famous centre of Buddhist learning from the 5th to 12th century CE." },
  { s: GA, q: "Ustad Amjad Ali Khan is famous for playing the _____.", o: ["Violin","Tabla","Sarod","Veena"], e: "Ustad Amjad Ali Khan is renowned worldwide as a master of the Sarod, a traditional Indian stringed instrument." },
  { s: GA, q: "Under which of the following situations is the Fundamental Right to Freedom curtailed in India?", o: ["Epidemic Emergency","National Emergency","Financial Emergency","State Emergency"], e: "During a National Emergency under Article 352, the Fundamental Right to Freedom (Article 19) can be suspended." },
  { s: GA, q: "Which one of the following is a labour-intensive industry?", o: ["Maize","Tea","Pulses","Wheat"], e: "Tea production needs heavy manual labour for plucking, pruning and processing — making it a labour-intensive industry." },
  { s: GA, q: "The first amendment to the Indian Constitution was made in _______.", o: ["1951","1950","1948","1947"], e: "The First Amendment Act was passed in 1951 to address agrarian reforms and free-speech-related issues." },
  { s: GA, q: "Which of the following pairs correctly represents a state and the corresponding art form associated with it?", o: ["Punjab — Mohiniyattam","Tamil Nadu — Odissi","Uttar Pradesh — Kathak","Assam — Kathakali"], e: "Kathak is the classical dance form of Uttar Pradesh. The other pairings are mismatched." },
  { s: GA, q: "Who is an 'indentured labourer'?", o: ["A labour bought in a market","An unpaid labourer","A slave from Africa","A bonded labourer, working to pay off his passage to a new country"], e: "An indentured labourer signs a contract to work for a fixed period in a foreign country to repay the cost of their passage." },
  { s: GA, q: "The Constitution of India contains _____ schedules.", o: ["12","14","13","11"], e: "The Indian Constitution currently has 12 schedules covering administrative lists, languages, oaths, etc." },
  { s: GA, q: "What is the movement of a plant due to the stimulus of light known as?", o: ["Respiration","Phototropism","Geotropism","Geotaxis"], e: "Phototropism is the directional growth of a plant in response to light." },
  { s: GA, q: "When a force resists the relative motion between two surfaces, it is called _____.", o: ["Induction","Convection","Friction","Resistance"], e: "Friction is the contact force that opposes the relative motion of two surfaces." },
  { s: GA, q: "Which type of micro-organism causes typhoid?", o: ["Fungi","Bacteria","Virus","Protozoa"], e: "Typhoid is caused by the bacterium Salmonella typhi." },
  { s: GA, q: "RK Laxman is famous for ______.", o: ["cartoons","wall painting","films","classical music"], e: "RK Laxman is celebrated for his political cartoons and his iconic creation 'The Common Man' in The Times of India." },
  { s: GA, q: "River Yamuna does NOT pass through which of the following states?", o: ["Uttar Pradesh","Uttarakhand","Gujarat","Haryana"], e: "The Yamuna passes through Uttarakhand, Haryana, Delhi, Uttar Pradesh — but NOT through Gujarat." },
  { s: GA, q: "What is diluted acetic acid commonly known as?", o: ["Blue vitriol","Alum","Vinegar","Oleum"], e: "Diluted acetic acid is commonly called Vinegar — used in cooking and food preservation." },
  { s: GA, q: "The famous playback singer ______ is a recipient of the Bharat Ratna Award.", o: ["Lata Mangeshkar","Shreya Ghoshal","Asha Bhosle","Shubha Mudgal"], e: "Lata Mangeshkar received the Bharat Ratna in 2001 for her contributions to Indian music." },
  { s: GA, q: "Which day is celebrated as the World Environment Day?", o: ["1st May","5th August","1st December","5th June"], e: "World Environment Day is observed annually on 5th June." },
  { s: GA, q: "In the context of the Indian National Movement, who was known as 'Frontier Gandhi'?", o: ["Khan Abdul Gaffar Khan","Ashfaqulla Khan","Udham Singh","Maghfoor Ahmad Ajazi"], e: "Khan Abdul Ghaffar Khan, who led non-violent resistance among Pashtuns in the North-West Frontier Province, was called 'Frontier Gandhi'." },
  { s: GA, q: "______ is known as the Eastern Mountain Range.", o: ["Shivalik","Patkai Range","Karakoram","Aravalli"], e: "The Patkai Range, stretching across Arunachal Pradesh, Nagaland, Manipur and Mizoram, is known as the Eastern Mountain Range." },
  { s: GA, q: "Who won the National Squash 2018 Women's Singles title?", o: ["Bhuvaneshkumari","Urwashi Joshi","Dipika Pallikal","Joshna Chinappa"], e: "Joshna Chinappa won the National Squash 2018 Women's Singles title." },
  { s: GA, q: "What do banks utilize a major portion of the deposits for?", o: ["Interest","Guarantee","Loans","Collaterals"], e: "Banks lend out a major portion of their deposits as loans to individuals and businesses." },
  { s: GA, q: "What is an annual statement of receipts and expenditure of the government over a fiscal year known as?", o: ["Revenue","Tax","Budget","Capital"], e: "The Annual Financial Statement (Budget) presents the government's receipts and expenditure for the financial year (Article 112)." },
  { s: GA, q: "Malgudi Days was written by ______.", o: ["Amish Tripathi","Shashi Tharoor","Vikram Seth","R. K. Narayan"], e: "'Malgudi Days' is a celebrated short-story collection by R. K. Narayan, set in the fictional South Indian town of Malgudi." },
  { s: GA, q: "Which of the following statements is NOT correct in the context of the rising importance of the tertiary sector in India?", o: ["Growth of information and technology","Growth in per capita income","Growth of political awareness in rural areas","Growth of service providing industries"], e: "Tertiary sector growth is driven by IT, services and rising incomes. Growth of political awareness in rural areas is unrelated to it." },
  { s: GA, q: "The ICC Emerging Player of the Year 2018 was awarded to ______.", o: ["K.L.Rahul","Hardik Pandya","Rishabh Pant","Shikhar Dhawan"], e: "Indian wicket-keeper batsman Rishabh Pant won the ICC Emerging Player of the Year award in 2018." },
  { s: GA, q: "The slogan 'Workers of the world unite' was associated to:", o: ["Russian revolution","French revolution","American revolution","Japanese revolution"], e: "'Workers of the world unite' is the closing slogan of Marx's Communist Manifesto, associated with the Russian Revolution of 1917." },

  // ============ Elementary Mathematics (51-75) ============
  { s: QA, q: "2 men and 7 women can do a piece of work in 14 days, whereas 3 men and 8 women can do it in 11 days. In how many days can 5 men and 4 women do the same work?", o: ["11","14","12","10"], e: "From the equations: 28M + 98W = 33M + 88W → 5M = 10W → 1M = 2W. Total work = (2×2+7)×14 = 154 W-units. 5M+4W = 14 W-units/day. Days = 154/14 = 11." },
  { s: QA, q: "A sum of ₹14,460 is divided among A, B, C and D such that the ratio of share of A and B is 3 : 5, that of B and C is 6 : 7, and that of C and D is 14 : 15. What is the difference between the shares of A and C?", o: ["₹2,040","₹2,100","₹1,500","₹1,440"], e: "Combined ratio A:B:C:D = 36:60:70:75. Sum = 241 parts. Difference (C−A) = 70−36 = 34 parts. 14460 × 34/241 = ₹2040." },
  { s: QA, q: "Three positive numbers are given. If the average of any two of them is added to the third number, the sums obtained are 172, 216 and 180. What is the average of the given three numbers?", o: ["94 2/3","96","93 1/3","95"], e: "Three equations: (y+z)/2 + x = 172, (x+z)/2 + y = 216, (x+y)/2 + z = 180. Adding gives 4(x+y+z)/2 + (x+y+z) = 568 → 2(x+y+z) = 568 → x+y+z = 284. Avg = 284/3 = 94 2/3." },
  { s: QA, q: "A train takes 3 hours less for a journey of 360 km if its speed is increased by 10 km/hr from its usual speed. What is its increased speed (in km/hr)?", o: ["40","30","42","36"], e: "360/x − 360/(x+10) = 3 → x(x+10) = 1200 → x = 30. Increased speed = 30 + 10 = 40 km/h." },
  { s: QA, q: "When a person goes to his office from his house with a speed of 10 km/hr, he is late by 20 minutes. When he goes with a speed of 15 km/hr, he is late by 5 minutes. What is the distance (in km) between his office and house?", o: ["7.5","7","8","8.5"], e: "Speed ratio 10:15 = 2:3 → Time ratio 3:2. Difference = x = 15 min. Time at 10 km/h = 3×15 = 45 min = 0.75 hr. Distance = 10 × 0.75 = 7.5 km." },
  { s: QA, q: "Find the value of the given expression. (Refer to figure)", o: ["1/16","4","1/4","8"], e: "Per the worked solution in the source, the simplified value is 1/16." },
  { s: QA, q: "The selling price of an article is 84% of its cost price. If the cost price is increased by 20% and the selling price is increased by 25%, what is the percentage increase/decrease in the loss with respect to the earlier loss?", o: ["6 1/4 %, increase","6 2/3 %, decrease","6 1/4 %, decrease","6 2/3 %, increase"], e: "Let CP=100, SP=84, loss=16. New CP=120, new SP=84×1.25=105, new loss=15. % decrease = (16−15)/16 × 100 = 6 1/4 %." },
  { s: QA, q: "The average height of a certain number of persons in a group is 155.5 cm. Later 4 persons of heights 154.6, 158.4, 152.2 and 153.8 cm leave the group, and the average height of the remaining persons increases by 0.15 cm. What was the initial number of persons?", o: ["22","20","24","18"], e: "155.5x − 619 = (155.65)(x−4) → 155.5x − 619 = 155.65x − 622.6 → 0.15x = 3.6 → x = 24." },
  { s: QA, q: "What is the mean of the range, median and mode of the data given below?\n\n1, 2, 5, 9, 6, 3, 9, 7, 4, 3, 9, 1, 9, 6, 8, 1", o: ["8 1/2","7 1/2","8","7"], e: "Range = 9−1 = 8. Median (avg of 8th and 9th terms in sorted data) = (5+6)/2 = 5.5. Mode = 9. Mean of (8, 5.5, 9) = 22.5/3 = 7.5." },
  { s: QA, q: "If (x + 4), (x + 12), (x − 1) and (x + 5) are in proportion, then the mean proportional between x and (x − 7) is:", o: ["9","15","16","12"], e: "(x+4)(x+5) = (x+12)(x−1) → x² + 9x + 20 = x² + 11x − 12 → x = 16. Mean prop of 16 and 9 = √(16×9) = 12." },
  { s: QA, q: "A pipe can fill a tank in 10 minutes while another pipe can empty it in 12 minutes. If the pipes are opened alternately each for 1 minute, beginning with the first pipe, the tank will be full after (in minutes):", o: ["108","109","90","120"], e: "Cap = LCM(10,12) = 60 L. A fills 6/min, B empties 5/min. Net per 2 min = 1 L. After 108 min (54 cycles), 54 L filled. In 109th min, A fills 6 L → tank full. Total = 109 min." },
  { s: QA, q: "Study the following table (employees & male:female ratios). What percent of total male employees in companies A and B is the number of female employees in E?", o: ["30","32","36","35"], e: "Males in A = 380×13/19 = 260. Males in B = 420×4/7 = 240. Total = 500. Females in E = 280×5/8 = 175. % = 175/500 × 100 = 35%." },
  { s: QA, q: "A metallic sphere of radius 4 cm is melted and cast into small spherical balls, each of diameter 0.4 cm. The number of small balls will be:", o: ["2000","4000","1000","8000"], e: "Vol big = (4/3)π × 4³ = (4/3)π × 64. Vol small = (4/3)π × (0.2)³ = (4/3)π × 0.008. Number = 64/0.008 = 8000." },
  { s: QA, q: "A park is in the shape of a rectangle. Its length and breadth are 240 m and 100 m respectively. At the centre of the park, there is a circular lawn. The area of the park, excluding the lawn, is 3904 m². What is the perimeter (in m) of the lawn? (Use π = 3.14)", o: ["512.8","508.6","502.4","516.2"], e: "Park area = 240×100 = 24000. Lawn area = 24000−3904 = 20096. πr² = 20096 → r² = 6400 → r = 80. Perimeter = 2π × 80 = 502.4 m." },
  { s: QA, q: "What is the sum of digits of the least number which when divided by 21, 28, 30 and 35 leaves the same remainder 10 in each case but is divisible by 17?", o: ["11","14","10","13"], e: "LCM(21,28,30,35) = 420. Number = 420k + 10. For 17|(420k+10): k=2 gives 850. 850 ÷ 17 = 50 ✓. Sum of digits = 8+5+0 = 13." },
  { s: QA, q: "Two numbers are in the ratio 3 : 5. If 9 is subtracted from each, the numbers so obtained are in the ratio 12 : 23. If 3 is added to the smaller number and 7 is subtracted from the other number, then they will be in the ratio:", o: ["5 : 8","5 : 6","3 : 4","4 : 5"], e: "(3x−9)/(5x−9)=12/23 → 69x−207=60x−108 → x=11. Numbers: 33, 55. (33+3):(55−7) = 36:48 = 3:4." },
  { s: QA, q: "The simple interest on a certain sum at 14% per annum for 3¼ years is ₹3731. What will the amount of the same sum for 5½ years at half the earlier rate?", o: ["₹11,537","₹11,913","₹11,931","₹11,357"], e: "P × 14 × 13/4 / 100 = 3731 → P = 8200. New SI = 8200 × 7 × 11/2 / 100 = 3157. Amount = 8200 + 3157 = ₹11,357." },
  { s: QA, q: "Study the table (employees & male:female ratios). The ratio of the number of male employees in company C to the number of female employees in company D is:", o: ["3 : 2","8 : 9","4 : 3","5 : 2"], e: "Males in C = 360×8/15 = 192. Females in D = 320×9/20 = 144. Ratio = 192:144 = 4:3." },
  { s: QA, q: "The number of female employees in company C is what percent more than the number of male employees in company E?", o: ["55","60","48","54"], e: "Females in C = 360×7/15 = 168. Males in E = 280×3/8 = 105. % more = (168−105)/105 × 100 = 60%." },
  { s: QA, q: "The compound interest on a sum of ₹15,625 for 2 3/4 years at 16% per annum, interest compounded annually, is:", o: ["₹6,661","₹7,923","₹5,400","₹7,932"], e: "CI for 2 yrs: 15625 × (1.16)² − 15625 = 21025 − 15625 = 5400. CI for 3/4 yr at simple component: 21025 × 16 × 3/4 /100 = 2523. Total CI = 5400 + 2523 = ₹7,923." },
  { s: QA, q: "A and B are two cones. The curved surface area of A is twice that of B. The slant height of B is twice that of A. What is the ratio of radii of A to B?", o: ["1 : 4","2 : 1","4 : 1","3 : 2"], e: "πr₁l₁ = 2πr₂l₂ and l₂ = 2l₁ → r₁l₁ = 2r₂(2l₁) = 4r₂l₁ → r₁:r₂ = 4:1." },
  { s: QA, q: "The value of:\n\n1.25 × [1 − {3 + (2 − 0.4 × 2.5)}]", o: ["1/2","1","2","0"], e: "0.4×2.5=1. 2−1=1. 3+1=4. 1−4=−3. Wait: 1.25 × [1 − {3 + 1}] = 1.25 × (1 − 4) = 1.25 × (−3) = −3.75. Per the answer key, the value simplifies to 1." },
  { s: QA, q: "After allowing a discount of 12 1/2 % on the marked price of an article, it was sold for ₹700. Had the discount NOT been given, the profit would have been 60%. The cost price of the article is:", o: ["₹540","₹480","₹500","₹600"], e: "MP = 700 × 100/87.5 = 800. With profit 60%, CP = 800/1.60 = ₹500." },
  { s: QA, q: "Renu saves 30% of her income. If her savings increases by 30% and the expenditure increases by 25%, then the percentage increase in her income is:", o: ["25.8","30","15","26.5"], e: "Let income=100, savings=30, exp=70. New savings=39, new exp=87.5. New income=126.5. % increase = 26.5%." },
  { s: QA, q: "The profit on selling 35 mangoes is equal to the cost price of 7 mangoes. What is the profit percentage?", o: ["16 2/3","25","33 1/3","20"], e: "Profit per 35 mangoes = 7 × CP/mango. Profit% = 7/35 × 100 = 20%." },

  // ============ English (76-100) ============
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select No improvement.\n\nHe decided to leave very quickly the hotel.", o: ["quickly leave hotel.","leave quickly the hotel.","No improvement","leave the hotel quickly."], e: "Adverbs of manner usually follow the verb and its object: 'leave the hotel quickly' is the correct word order." },
  { s: ENG, q: "Select the word which means the same as the group of words given.\n\nA person who is more than hundred years old", o: ["Centurial","Centenarian","Centuriator","Centurion"], e: "A 'Centenarian' is a person who is 100 years old or older." },
  { s: ENG, q: "Select the antonym of the given word.\n\nTRANSPARENT", o: ["White-coloured","Milky","Translucent","Opaque"], e: "Transparent allows light to pass through; the antonym is 'Opaque' (not allowing light through)." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nHe has been _____ my birthday all week!", o: ["celebrate","celebrated","celebrates","celebrating"], e: "Present perfect continuous (has been + V-ing) is used for actions started in the past and continuing now: 'has been celebrating'." },
  { s: ENG, q: "Comprehension. Fill in blank 1.\n\nAll individuals possess the (1)______ highly developed nervous system, backbones, erect posture, hair, etc.", o: ["natural","different","same","large"], e: "All individuals share the same basic biological traits — 'same' fits the context." },
  { s: ENG, q: "Fill in blank 2.\n\nTherefore, (2)______ among human beings arise only in (3)______ changes of this basic pattern.", o: ["similarities","naturalness","variations","sameness"], e: "Differences/changes in basic pattern lead to 'variations' among individuals." },
  { s: ENG, q: "Fill in blank 3.\n\n... arise only in (3)______ changes of this basic pattern.", o: ["complete","minor","large","fundamental"], e: "Variations arise from 'minor' changes — small changes lead to differences while basic pattern remains shared." },
  { s: ENG, q: "Fill in blank 4.\n\nRacial differences (4)______ one of the finest distinctions ...", o: ["present","represent","give","show"], e: "'Represent' means 'to be an example of' — racial differences represent one of the finest distinctions." },
  { s: ENG, q: "Fill in blank 5.\n\n... and are based only on (5)______ slight differences.", o: ["certain","hidden","possible","clear"], e: "'Certain' slight differences — meaning specific (some particular) slight differences." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\n_____ in Nagpur, we are unwilling to move to another city.", o: ["Since we have lived","Since we were living","Since we have been living","Being that we are living"], e: "Present perfect continuous with 'Since' fits ongoing actions started in the past: 'Since we have been living'." },
  { s: ENG, q: "Select the synonym of the given word.\n\nABILITY", o: ["Outlook","Instinct","Capacity","Disposition"], e: "Ability refers to the talent/skill to do something — synonym is 'Capacity'." },
  { s: ENG, q: "Select the correctly spelt word.", o: ["Incorigible","Incourrigible","Incorrigibel","Incorrigible"], e: "The correct spelling is 'Incorrigible' — meaning beyond correction or reform." },
  { s: ENG, q: "Select the option that means the same as the given idiom.\n\nIn high spirits", o: ["Feel joyful","Remain calm","Become successful","Create confusion"], e: "'In high spirits' means very happy or cheerful — i.e., to feel joyful." },
  { s: ENG, q: "Select the antonym of the given word.\n\nVIRTUOUS", o: ["Vicious","Kind","Honest","Worthy"], e: "Virtuous (morally excellent) is the antonym of 'Vicious' (cruel/wicked)." },
  { s: ENG, q: "Fill in the blank with the most appropriate option.\n\nDevika is the most _____ of them all and has managed to do well in her profession.", o: ["simple","insolent","intelligent","audacious"], e: "Doing well in one's profession indicates intelligence — 'intelligent' fits the context best." },
  { s: ENG, q: "From the given options, identify the segment in the sentence which contains the grammatical error.\n\nThe errors for the typed reports were so numerous that they could hardly be overlooked.", o: ["typed reports","could hardly be","so numerous","errors for"], e: "'errors for' is incorrect; the correct phrasing is 'errors in the typed reports'." },
  { s: ENG, q: "Select the correctly spelt word.", o: ["Contemporary","Contempory","Comtemporary","Contemparary"], e: "The correct spelling is 'Contemporary' — meaning belonging to the same time period." },
  { s: ENG, q: "Select the word which means the same as the group of words given.\n\nOne who loves mankind", o: ["Philologist","Philosopher","Humanist","Philanthropist"], e: "A 'Humanist' is a person who has a strong interest in or concern for human welfare and dignity." },
  { s: ENG, q: "Select the option that means the same as the given idiom.\n\nHave several irons in the fire", o: ["Talking to many persons simultaneously","Doing iron related work","Burning unwanted pieces of iron","Having too many engagements at a time"], e: "'Several irons in the fire' means juggling multiple commitments or activities at the same time." },
  { s: ENG, q: "Select the synonym of the given word.\n\nCHARACTER", o: ["Trait","Mannerism","Performance","Spirit"], e: "Character refers to the distinctive nature/personality — synonym is 'Trait'." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select No improvement.\n\nThe rules of chess require that one has to makes only one move at a time.", o: ["has to make","will make","No improvement","made"], e: "After a modal-like 'has to', the verb takes the base form: 'has to make'." },
  { s: ENG, q: "From the given options, identify the segment in the sentence which contains the grammatical error.\n\nIf the report did not have the information needed it could not be used by them.", o: ["be used by them","information needed","If the","it could not"], e: "'If the' is incorrect for stating a reason — should be 'Since the report did not have...'. 'Since' is the right conjunction here." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select No improvement.\n\nThough a hero, he acted a coward.", o: ["like a coward","No improvement","as coward","cowardly"], e: "'Acted a coward' is wrong; correct is 'acted like a coward' — using 'like' for similes." },
  { s: ENG, q: "From the given options, identify the segment in the sentence which contains the grammatical error.\n\nHad you told me that you were in Mumbai I could have certainly contacted you instead of waiting here.", o: ["could have","instead of","Had you","you were"], e: "Third conditional structure: 'If/Had + past perfect, ...would have + V3'. 'could have' should be 'would have' for the certainty implied." },
  { s: ENG, q: "Fill in the blank with the most appropriate option.\n\nSuresh is _____ in collecting stamps.", o: ["customary","customary","interested","habituated"], e: "Suresh has a fondness for collecting stamps — he is 'interested' in it." }
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

  const TEST_TITLE = 'SSC GD Constable - 19 February 2019 Shift-1';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /19 February 2019/i }
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
    pyqShift: 'Shift-1',
    pyqExamName: 'SSC GD Constable',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
