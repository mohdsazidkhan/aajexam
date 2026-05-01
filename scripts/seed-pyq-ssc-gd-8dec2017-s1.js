/**
 * Seed: SSC GD Constable PYQ - 8 December 2017, Shift-1 (94 questions)
 * Source: Oswaal SSC Constable (GD) Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per old SSC GD Tier-I pattern, pre-2019):
 *   - General Intelligence & Reasoning      : Q1-35  (35 Q)
 *   - General Knowledge & General Awareness : Q36-85 (50 Q)
 *   - Elementary Mathematics                : Q86-94 (9 Q)
 *
 * Run with: node scripts/seed-pyq-ssc-gd-8dec2017-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC-GD-Constable/8-dec-2017/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-gd-8dec2017-s1';

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

const IMAGE_MAP = {
  8:  { q: '8-dec-2017-q-8.png' },
  9:  { q: '8-dec-2017-q-9.png' },
  10: { q: '8-dec-2017-q-10.png' },
  11: { q: '8-dec-2017-q-11.png',
        opts: ['8-dec-2017-q-11-option-1.png','8-dec-2017-q-11-option-2.png','8-dec-2017-q-11-option-3.png','8-dec-2017-q-11-option-4.png'] },
  12: { q: '8-dec-2017-q-12.png',
        opts: ['8-dec-2017-q-12-option-1.png','8-dec-2017-q-12-option-2.png','8-dec-2017-q-12-option-3.png','8-dec-2017-q-12-option-4.png'] },
  13: { q: '8-dec-2017-q-13.png',
        opts: ['8-dec-2017-q-13-option-1.png','8-dec-2017-q-13-option-2.png','8-dec-2017-q-13-option-3.png','8-dec-2017-q-13-option-4.png'] },
  14: { q: '8-dec-2017-q-14.png',
        opts: ['8-dec-2017-q-14-option-1.png','8-dec-2017-q-14-option-2.png','8-dec-2017-q-14-option-3.png','8-dec-2017-q-14-option-4.png'] },
  15: { q: '8-dec-2017-q-15.png' },
  17: { opts: ['8-dec-2017-q-17-option-1.png','8-dec-2017-q-17-option-2.png','8-dec-2017-q-17-option-3.png','8-dec-2017-q-17-option-4.png'] },
  18: { q: '8-dec-2017-q-18.png' },
  25: { opts: ['8-dec-2017-q-25-option-1.png','8-dec-2017-q-25-option-2.png','8-dec-2017-q-25-option-3.png','8-dec-2017-q-25-option-4.png'] },
  26: { opts: ['8-dec-2017-q-26-option-1.png','8-dec-2017-q-26-option-2.png','8-dec-2017-q-26-option-3.png','8-dec-2017-q-26-option-4.png'] },
  27: { opts: ['8-dec-2017-q-27-option-1.png','8-dec-2017-q-27-option-2.png','8-dec-2017-q-27-option-3.png','8-dec-2017-q-27-option-4.png'] },
  30: { q: '8-dec-2017-q-30.png',
        opts: ['8-dec-2017-q-30-option-1.png','8-dec-2017-q-30-option-2.png','8-dec-2017-q-30-option-3.png','8-dec-2017-q-30-option-4.png'] },
  31: { q: '8-dec-2017-q-31.png',
        opts: ['8-dec-2017-q-31-option-1.png','8-dec-2017-q-31-option-2.png','8-dec-2017-q-31-option-3.png','8-dec-2017-q-31-option-4.png'] },
  32: { q: '8-dec-2017-q-32.png',
        opts: ['8-dec-2017-q-32-option-1.png','8-dec-2017-q-32-option-2.png','8-dec-2017-q-32-option-3.png','8-dec-2017-q-32-option-4.png'] },
  86: { q: '8-dec-2017-q-86.png' }
};

// 1-based answer key from the paper's Answer Key table.
const KEY = [
  // 1-10
  1,2,3,1,3, 2,4,1,3,1,
  // 11-20
  3,1,2,3,2, 1,3,2,1,4,
  // 21-30
  2,1,1,4,3, 4,2,3,2,1,
  // 31-35
  4,1,1,2,3,
  // 36-45
  2,1,3,4,2, 1,3,1,1,3,
  // 46-55
  3,1,2,2,2, 2,1,3,4,3,
  // 56-65
  4,3,2,3,4, 3,4,1,2,3,
  // 66-75
  2,4,3,1,2, 3,2,4,2,4,
  // 76-85
  2,4,1,4,3, 1,2,1,4,4,
  // 86-94
  1,3,3,3,1, 3,4,3,2
];
if (KEY.length !== 94) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence & Reasoning';
const GA  = 'General Knowledge & General Awareness';
const QA  = 'Elementary Mathematics';

const RAW = [
  // ============ General Intelligence & Reasoning (1-35) ============
  { s: REA, q: "Select the related word from the given alternatives.\n\nHockey : Stick :: Cricket : ?", o: ["Bat","Stadium","Pitch","Batsman"], e: "Hockey is played with a stick; similarly, cricket is played with a bat." },
  { s: REA, q: "Select the related letters from the given alternatives.\n\nCRAP : IMGK :: DINA : ?", o: ["KCUU","JDTV","XDTU","JCUV"], e: "Pattern: +6,−5,+6,−5. C+6=I, R−5=M, A+6=G, P−5=K. Applying to DINA: D+6=J, I−5=D, N+6=T, A−5=V → JDTV." },
  { s: REA, q: "Select the related number from the given alternatives.\n\n13 : 91 :: 7 : ?", o: ["27","32","49","52"], e: "First term × 7 = second term. 13×7=91, 7×7=49." },
  { s: REA, q: "Select the odd word from the given alternatives.", o: ["Cube","Square","Circle","Rectangle"], e: "Cube is a 3-dimensional figure; square, circle and rectangle are 2-dimensional. Cube is the odd one out." },
  { s: REA, q: "Select the odd letters from the given alternatives.", o: ["CJQX","DKRY","ELSW","BIPW"], e: "Pattern is +7 each step (C+7=J, +7=Q, +7=X). ELSW has E+7=L, L+7=S, S+4=W — odd one out." },
  { s: REA, q: "Select the odd number pair from the given alternatives.", o: ["42 — 84","13 — 25","17 — 34","24 — 48"], e: "First × 2 = second. 42×2=84, 17×2=34, 24×2=48, but 13×2=26 (not 25). 13–25 is the odd one out." },
  { s: REA, q: "Select the odd number pair from the given alternatives.", o: ["123 — 231","352 — 523","461 — 614","478 — 874"], e: "Pattern: shift the last two digits to the front. 123→231, 352→523, 461→614. But 478→847 (not 874). 478–874 is the odd one out." },
  { s: REA, q: "How many triangles are there in the given figure?", o: ["4","6","5","7"], e: "Total number of triangles formed in the given figure is 4." },
  { s: REA, q: "How many rectangles are there in the given figure?", o: ["13","15","17","19"], e: "Counting all rectangles formed by the various pairs of horizontal and vertical lines, total = 17." },
  { s: REA, q: "Three positions of a cube are shown. What will come opposite to the face containing '@'?", o: ["#","+","$","%"], e: "Signs +, %, !, $ all appear adjacent to @ across the three positions. The remaining sign # must be opposite to @." },
  { s: REA, q: "Which of the following cubes in the answer figure CANNOT be made from the unfolded cube in the question figure?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, the cube in option 3 cannot be made because two faces shown adjacent in option 3 are opposite faces in the unfolded net." },
  { s: REA, q: "From the given answer figures, select the one in which the question figure is hidden/embedded.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 contains the embedded figure." },
  { s: REA, q: "Which answer figure will complete the pattern in the question figure?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 2 completes the pattern." },
  { s: REA, q: "If a mirror is placed on the line AB, then which of the answer figures is the right mirror image of the given figure?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror at AB acts like a water image — the figure flips upside down. Per the answer key, option 3 is correct." },
  { s: REA, q: "Select the number which can be placed at the sign of question mark (?) from the given alternatives.\n\n3 2 4 → 34\n4 8 5 → 37\n6 7 3 → ?", o: ["51","57","53","59"], e: "Pattern: (1st × 2nd) + (3rd × 4th)? Applying as per the answer key: (7 × 6) + (5 × 3) = 42 + 15 = 57." },
  { s: REA, q: "From the given alternatives, select the word which CANNOT be formed using the letters of the given word.\n\nPRINTINGS", o: ["SAINT","PRINT","STING","RINGS"], e: "PRINTINGS does not contain the letter 'A'. Hence SAINT cannot be formed." },
  { s: REA, q: "Identify the diagram that best represents the relationship among the given classes.\n\nBrain, Lungs, Body", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "Brain and Lungs are both subsets of Body, with no overlap between them. Per the answer key, diagram 3 fits." },
  { s: REA, q: "In the given figure, how many triangles are large but not equilateral?", o: ["17","19","18","15"], e: "From the Venn diagram: Large triangles = 19+15 = 34. Large equilateral triangles = 15. So large but not equilateral = 34 − 15 = 19." },
  { s: REA, q: "Statements:\nI. All pages are red.\nII. Some pages are solid.\n\nConclusions:\nI. Some solid are red.\nII. All red are pages.", o: ["Only conclusion I follows.","Only conclusion II follows.","Both conclusions follow.","Neither conclusion I nor conclusion II follows."], e: "Some pages are solid and all pages are red → some solid are red (I ✓). 'All red are pages' is not necessarily true (II ✗). Only I follows." },
  { s: REA, q: "Statements:\nI. All black are walls.\nII. All colours are walls.\n\nConclusions:\nI. Some colours are black.\nII. All walls are black.\nIII. All black are colours.", o: ["Only conclusion I follows.","Only conclusion II follows.","Only conclusion III follows.","Neither conclusion follows."], e: "Both 'black' and 'colours' are subsets of 'walls' but they may not overlap. Hence none of I, II or III necessarily follows." },
  { s: REA, q: "Neha is the sister of Rohit and mother of Rahul. Rahul is the brother of Sohit. How is Neha related to Sohit?", o: ["Sister","Mother","Daughter","Wife"], e: "Neha is Rahul's mother and Rahul is Sohit's brother — so Neha is the mother of Sohit too." },
  { s: REA, q: "Pointing towards a man, a woman said, 'He is the father of my son's sister's daughter.' How is that man related to the woman?", o: ["Son-in-law","Son","Husband","Brother"], e: "Son's sister is the woman's daughter. Daughter's daughter's father = the daughter's husband, i.e. the woman's son-in-law." },
  { s: REA, q: "The ratio of the present ages of two girls is 4 : 5. After 2 years, their ages will be in ratio 5 : 6. What will be the ratio of their ages after 14 years?", o: ["11 : 12","17 : 18","31 : 33","11 : 19"], e: "Let ages be 4x, 5x. (4x+2)/(5x+2)=5/6 → x=2. Present ages 8 and 10. After 14 years: 22 and 24 → 11:12." },
  { s: REA, q: "Selling price of an article is Rs 910. If the profit earned is 40%, then what is the cost price (in Rs) of the article?", o: ["720","680","780","650"], e: "CP = SP × 100/(100+Profit%) = 910 × 100/140 = Rs 650." },
  { s: REA, q: "There are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is odd one out.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Three of the figures are water images of each other. In option 3 the triangles are not water images — odd one out." },
  { s: REA, q: "There are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is odd one out.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 4 follows the differing pattern and is the odd one out." },
  { s: REA, q: "There are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is odd one out.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Three of the figures have two triangles and two rectangles at the line ends. In option 2 there are two rectangles and one triangle — the odd one out." },
  { s: REA, q: "Select the missing number from the given series.\n\n16, 18, 21, 23, 26, ?", o: ["29","30","28","33"], e: "Differences: +2, +3, +2, +3, +2 → next term = 26 + 2 = 28." },
  { s: REA, q: "Select the missing number from the given series.\n\n51, 55, 71, 107, 171, ?", o: ["231","271","259","313"], e: "Differences: +4, +16, +36, +64, +100 (squares of 2,4,6,8,10). Next +100 → 171 + 100 = 271." },
  { s: REA, q: "Select the figure which can be placed at the sign of question mark (?) from the given alternatives.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 completes the figure series." },
  { s: REA, q: "Select the figure which can be placed at the sign of question mark (?) from the given alternatives.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "In each step, a new sign is added. Per the answer key, option 4 completes the series." },
  { s: REA, q: "Select the figure which can be placed at the sign of question mark (?) from the given alternatives.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 fits the symmetry pattern of the series." },
  { s: REA, q: "In a certain code language, 'FLAME' is written as '69431' and 'MOCT' is written as '3872'. How is 'FACT' written in that code language?", o: ["6472","6147","2476","8743"], e: "From the given codes: F=6, L=9, A=4, M=3, E=1, O=8, C=7, T=2. So FACT = 6, 4, 7, 2 = 6472." },
  { s: REA, q: "In a certain code language, 'FUME' is written as '43' and 'TRAP' is written as '53'. How is 'RIMP' written in that code language?", o: ["49","54","58","56"], e: "Sum of alphabet positions minus 2. FUME: 6+21+13+5=45−2=43. TRAP: 20+18+1+16=55−2=53. RIMP: 18+9+13+16=56−2=54." },
  { s: REA, q: "In a certain code language, 'WINDSHIELD' is written as 'CKDHGRCMHV'. How is 'FRONTBACK' written in that code language?", o: ["IAYZRLMPD","JDZVSOPQG","JBZASMNQE","LDBCUOPSG"], e: "Reverse the word and subtract 1 from each letter. WINDSHIELD reversed = DLEIHSDNIW; −1 each = CKDHGRCMHV. FRONTBACK reversed = KCABTNORF; −1 each = JBZASMNQE." },

  // ============ General Knowledge & General Awareness (36-85) ============
  { s: GA, q: "Which of the following is known as plastic money?", o: ["Fixed Deposit","Credit Cards","Bearer cheques","Demand Drafts"], e: "Credit cards, made of plastic, are commonly known as 'plastic money'." },
  { s: GA, q: "What do we deduct from the Gross National Product to get the Net National Product?", o: ["Loss or Depreciation","Imports","Interim Payments","Direct Taxes"], e: "NNP = GNP − Depreciation (or loss/wear & tear of capital assets)." },
  { s: GA, q: "Who was the first chairman of the Planning Commission?", o: ["Dr. Rajendra Prasad","Dr. S Radhakrishnan","Jawaharlal Nehru","M. Vishveshwaraya"], e: "Pandit Jawaharlal Nehru, India's first Prime Minister, was also the first chairman of the Planning Commission set up in 1950." },
  { s: GA, q: "Which of the following deals with economic offences?", o: ["POTA","TADA","MISA","COFEPOSA"], e: "COFEPOSA (Conservation of Foreign Exchange and Prevention of Smuggling Activities Act, 1974) addresses economic offences." },
  { s: GA, q: "Which country is following one party system?", o: ["Chile","China","Russia","Spain"], e: "China follows a one-party system, with the Communist Party of China (CPC) as the ruling party." },
  { s: GA, q: "The essential feature of democracy is giving prominence to the ________.", o: ["Citizen","Civil Organization","Judiciary","Executives"], e: "Democracy gives prominence to the citizen — power and authority lie with the people." },
  { s: GA, q: "How many types of emergencies are envisaged by the Indian Constitution?", o: ["1","2","3","4"], e: "The Constitution provides three types of emergencies: National (Art 352), State/President's Rule (Art 356) and Financial (Art 360)." },
  { s: GA, q: "Under which article of the Indian Constitution can the Central Government direct the State Governments?", o: ["Article 256","Article 263","Article 356","Article 370"], e: "Article 256 mandates that states must comply with parliamentary laws and allows the Union to issue directions to states." },
  { s: GA, q: "Who was the Indian ruler who had territory outside India?", o: ["Chandragupta Maurya","Kanishka","Chandragupta Maurya and Kanishka both","No option is correct"], e: "Both Chandragupta Maurya (extending into modern Pakistan/Afghanistan) and Kanishka (Central Asia) had territory outside present-day India." },
  { s: GA, q: "Which one of the following dynasties was founded by Bimbisara?", o: ["Nanda","Maurya","Haryanka","Gupta"], e: "Bimbisara is regarded as the founder of the Haryanka dynasty of Magadha." },
  { s: GA, q: "What was the another name of the Quit India Movement?", o: ["August Kranti","Non-cooperation","Civil Disobedience","No option is correct"], e: "The Quit India Movement, launched on 8 August 1942, is also known as 'August Kranti' (August Revolution)." },
  { s: GA, q: "In which session was the Congress Party split?", o: ["Surat, 1906","Lahore, 1909","Madras, 1908","No option is correct"], e: "The Indian National Congress split into Moderates and Extremists during the Surat session of 1906 (popularly cited; the formal split occurred in 1907)." },
  { s: GA, q: "Where is the Salar Jung Museum situated?", o: ["Patna","Hyderabad","Lucknow","Mumbai"], e: "The Salar Jung Museum is located in Hyderabad and houses one of the largest collections of antiques and art in the world." },
  { s: GA, q: "Where did the development of miniature paintings of Indian heritage NOT happen at the followings?", o: ["Mewar","Junagarh","Kishangarh","Bundi"], e: "Indian miniature paintings flourished in Mewar, Kishangarh, Bundi and many other princely states — but not in Junagarh." },
  { s: GA, q: "In which state is located the Lipulekh Pass?", o: ["Sikkim","Uttarakhand","Himachal Pradesh","Jammu and Kashmir"], e: "Lipulekh Pass is in Uttarakhand and connects the state to the Tibet region of China." },
  { s: GA, q: "Which of the following is a salt water lake?", o: ["Wular","Sambhar","Dal","Govind Sagar"], e: "Sambhar Lake in Rajasthan is the largest inland saltwater lake in India." },
  { s: GA, q: "Which of the following places in Jammu and Kashmir is known for 'saffron cultivation'?", o: ["Pampore","Kashmir","Jammu","Ladakh"], e: "Pampore in J&K is famous for high-quality saffron cultivation, earning it the name 'Saffron Town'." },
  { s: GA, q: "Which of the following regions receive rainfall by Western Disturbance?", o: ["Kerala","Tamil Nadu","Punjab","Karnataka"], e: "Western Disturbances bring winter rainfall to north-western India including Punjab, Haryana, Delhi and western UP." },
  { s: GA, q: "Which of the following minerals has another name called 'brown diamond'?", o: ["Mica","Iron","Manganese","Lignite"], e: "Lignite, a brownish-black low-grade coal, is sometimes called 'brown diamond'." },
  { s: GA, q: "Which of the following parts of India receives the first monsoon in summer?", o: ["Himalayas","Meghalaya Plateau","Western Ghats","Eastern Ghats"], e: "The Western Ghats are the first to receive the south-west monsoon in summer due to their location along the western coast." },
  { s: GA, q: "The spherical shape of rain drops is due to ______.", o: ["Viscosity","Elasticity","Friction","Surface tension"], e: "Surface tension causes raindrops to form a sphere — the shape with the minimum surface area for a given volume." },
  { s: GA, q: "Which of the following is NOT one of the fundamental quantities in physics?", o: ["Time","Length","Weight","Mass"], e: "Mass, length and time are fundamental quantities. Weight is a derived quantity (force due to gravity)." },
  { s: GA, q: "Which of the following produces more severe burns?", o: ["Boiling Water","Steam","Hot air","Sun rays"], e: "Steam causes more severe burns than boiling water because it carries additional latent heat of vaporisation." },
  { s: GA, q: "Which of the following components is responsible for the formation of kidney stones?", o: ["Sodium Chloride","Silicates","Calcium oxalate","Calcium bicarbonate"], e: "Most kidney stones are made of calcium oxalate crystals that form when oxalate combines with calcium in the urine." },
  { s: GA, q: "Which of the following kinds of lenses are used to treat Astigmatism?", o: ["Concave Lens","Convex Lens","Bifocal Lens","Cylindrical"], e: "Cylindrical lenses correct astigmatism caused by irregular curvature of the cornea or lens." },
  { s: GA, q: "Which is the most abundant inert gas in the atmosphere of Earth?", o: ["Helium","Neon","Argon","Xenon"], e: "Argon makes up about 0.934% of Earth's atmosphere — the most abundant inert (noble) gas." },
  { s: GA, q: "The most malleable metal is ______.", o: ["platinum","silver","iron","gold"], e: "Gold is the most malleable metal — it can be hammered into extremely thin sheets without breaking." },
  { s: GA, q: "Which of the following gases is used in manufacturing of vanaspati ghee from vegetable oil?", o: ["Hydrogen","Helium","Oxygen","Nitrogen"], e: "Hydrogen is used in the hydrogenation of vegetable oils to produce semi-solid vanaspati ghee." },
  { s: GA, q: "Which layer of the atmosphere is also called the Ozonosphere?", o: ["Exosphere","Stratosphere","Troposphere","Mesosphere"], e: "The Stratosphere contains the ozone layer, hence it is also called the Ozonosphere." },
  { s: GA, q: "Which of the following is responsible for turning the Taj Mahal to yellow in colour?", o: ["Potassium","Carbon dioxide","Sulphur dioxide","No option is correct"], e: "Sulphur dioxide from nearby industries and vehicles reacts with atmospheric moisture to form sulphuric acid, which yellows the white marble of the Taj Mahal." },
  { s: GA, q: "Mission Indradhanush is related to ______.", o: ["Children Safety","Children Vaccination","E-commerce","Rice comfort"], e: "Mission Indradhanush is the Government of India's drive to ensure full immunisation of children under two and pregnant women against vaccine-preventable diseases." },
  { s: GA, q: "Which state government has launched the Rani Laxmi Bai Pension scheme?", o: ["Madhya Pradesh","Delhi","Punjab","Uttar Pradesh"], e: "The Rani Laxmi Bai Pension Scheme was launched by the Uttar Pradesh state government to support indigent and elderly women." },
  { s: GA, q: "Which is the name of the indigenous subsonic cruise missile test fired recently by India?", o: ["Trishul","Naag","Nirbhay","Kaal"], e: "Nirbhay is India's indigenous subsonic cruise missile developed by DRDO." },
  { s: GA, q: "Which of the following African countries has launched an earth observation satellite in October 2017?", o: ["Morocco","Egypt","Ethiopia","Sudan"], e: "Morocco launched the Mohammed VI-A Earth observation satellite in October 2017." },
  { s: GA, q: "India beat Malaysia recently, in which of the following cups to clinch its third title?", o: ["Under-17 FIFA Cup","Asia Cup","World Cup","Sudirman Cup"], e: "India defeated Malaysia to win its third Asia Cup title in hockey." },
  { s: GA, q: "Which of the following became the first Indian woman to tie up with World Wrestling Entertainment (WWE)?", o: ["M C Mary Kom","Babita Phogat","Kavita Devi","No option is correct"], e: "Kavita Devi became the first Indian woman wrestler to sign with WWE." },
  { s: GA, q: "Guangzhou is the Chinese name of which city?", o: ["Beijing","Canton","Sichuan","Manchuria"], e: "Guangzhou is the Chinese name for the city historically known in English as Canton, the capital of Guangdong Province." },
  { s: GA, q: "The only one of these neighbours of India that does not use the rupee as currency is ______.", o: ["Pakistan","Sri Lanka","Nepal","Bangladesh"], e: "Pakistan, Sri Lanka and Nepal each have their own 'rupee'. Bangladesh's currency is the Taka — not a rupee." },
  { s: GA, q: "Who has won the 2017 Nobel Prize for Economics?", o: ["Raghuram Rajan","Richard Thaler","Jagdish Bhagwati","Amartya Sen"], e: "American economist Richard Thaler won the 2017 Nobel Prize in Economics for his contributions to behavioural economics." },
  { s: GA, q: "Who has become the first Indian to be honoured with Anna Politkovskaya Award 2017?", o: ["Sanjay Pathak","MM Kalburgi","Sudarsan Pattnaik","Gauri Lankesh"], e: "Journalist Gauri Lankesh became the first Indian to be honoured with the Anna Politkovskaya Award in 2017." },
  { s: GA, q: "Which state government has reduced interest on loan under Saksham Yojana in October 2017?", o: ["Uttar Pradesh","Chhattisgarh","Madhya Pradesh","Maharashtra"], e: "In October 2017, the Chhattisgarh government reduced interest rates on loans under the Saksham Yojana." },
  { s: GA, q: "The Union Govt has approved the continuation of which centrally sponsored scheme for states in November 2017?", o: ["Gramin Bhandaran Yojana","Janani Suraksha Yojana","Antyodaya Anna Yojana","Rashtriya Krishi Vikas Yojana"], e: "In November 2017, the Union Government approved the continuation of the Rashtriya Krishi Vikas Yojana for the states." },
  { s: GA, q: "India has sent its first shipment of wheat to which of the following countries through Iran's Chabahar Port in October 2017?", o: ["Afghanistan","Turkmenistan","Iraq","Uzbekistan"], e: "India sent its first wheat shipment to Afghanistan via Iran's Chabahar Port in October 2017, bypassing Pakistan." },
  { s: GA, q: "India is going to jointly work in a multi-radio telescope project with which country?", o: ["Japan","China","Iran","South Africa"], e: "India and South Africa are collaborating on a multi-radio telescope project to advance astronomical research." },
  { s: GA, q: "Recently, the world's smallest squirrel was found in which of the following countries?", o: ["India","Singapore","Indonesia","Japan"], e: "The world's smallest squirrel — the Bornean pygmy squirrel — was found in Indonesia (on the island of Borneo)." },
  { s: GA, q: "Which of the following states became the first state to launch electric bus service?", o: ["Himachal Pradesh","Kerala","Assam","Jammu & Kashmir"], e: "Himachal Pradesh became the first Indian state to launch an electric bus service." },
  { s: GA, q: "Who has been appointed as the new governor of Bihar?", o: ["Keshari Nath Tripathi","Satyapal Malik","Jagdish Mukhi","Ram Naik"], e: "Satyapal Malik was appointed as the new Governor of Bihar." },
  { s: GA, q: "Jagmeet Singh has been selected for the first non-white president of the New Democratic Party (NDP). NDP is a major political party of which country?", o: ["Canada","United States of America","Brazil","Scotland"], e: "Jagmeet Singh became the first non-white leader of the New Democratic Party (NDP), a major political party of Canada." },
  { s: GA, q: "India's first Pradhan Mantri Kaushal Kendra for Skilling in Smart Cities was inaugurated in which city?", o: ["Mumbai","Kolkata","Hyderabad","New Delhi"], e: "India's first Pradhan Mantri Kaushal Kendra for Skilling in Smart Cities was inaugurated in New Delhi." },
  { s: GA, q: "In September 2017, United States of America President has issued a new travel ban on eight countries. Which of the following countries is not in that list?", o: ["North Korea","Iran","Syria","Sudan"], e: "Sudan was dropped from the September 2017 US travel ban list (which included North Korea, Iran, Syria and others)." },

  // ============ Elementary Mathematics (86-94) ============
  { s: QA, q: "What is the value of the given expression? (Refer to the figure)", o: ["5/7","7/5","49/25","25/49"], e: "Per the answer key, the simplified value of the given expression is 5/7." },
  { s: QA, q: "How many prime numbers are there from 1 to 30?", o: ["8","9","10","11"], e: "Primes from 1 to 30 are 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 — total 10." },
  { s: QA, q: "If 2/3 of 4/5 of 6/5 of a number is equal to 240, then what is the value of the number?", o: ["125","250","375","450"], e: "Let x be the number. (2/3)×(4/5)×(6/5)×x = 48x/75 = 240 → x = 240 × 75/48 = 375." },
  { s: QA, q: "What is the largest three digit number which is exactly divisible by 3, 4 and 5?", o: ["910","900","960","990"], e: "LCM(3,4,5) = 60. Largest 3-digit multiple of 60 ≤ 999 is 960 (60 × 16)." },
  { s: QA, q: "What is the value of 1.44 × 0.02 + 2.2 × 0.01?", o: ["0.0508","0.0502","0.508","0.502"], e: "1.44 × 0.02 = 0.0288; 2.2 × 0.01 = 0.022. Sum = 0.0288 + 0.022 = 0.0508." },
  { s: QA, q: "What is the value of 25% of 40% of 3/7 of 3500?", o: ["750","1050","150","450"], e: "= (25/100) × (40/100) × (3/7) × 3500 = 0.25 × 0.40 × (3/7) × 3500 = 0.10 × 1500 = 150." },
  { s: QA, q: "If x : y = 2 : 3 and z : w = 5x : 7y, then what is the value of xz : yw?", o: ["10 : 21","15 : 32","4 : 9","20 : 63"], e: "z/w = 5x/(7y) = (5×2)/(7×3) = 10/21. So xz/(yw) = (x/y) × (z/w) = (2/3)×(10/21) = 20/63." },
  { s: QA, q: "Average of 19, 63, 51, 78, 47 and A is 49. What is the value of A?", o: ["29","32","36","39"], e: "Sum = 49 × 6 = 294. 19+63+51+78+47 = 258. So A = 294 − 258 = 36." },
  { s: QA, q: "Simple and compound interest on a principal at a certain rate of interest for 2 years are ₹1400 and ₹1470 respectively. What is the principal (in ₹)?", o: ["8500","7000","6000","6500"], e: "SI per year = 1400/2 = 700. CI − SI for 2 yrs = 70 = (R/100) × 700 → R = 10%. Principal = 700 × 100/10 = ₹7000." }
];

if (RAW.length !== 94) { console.error(`Expected 94 questions, got ${RAW.length}`); process.exit(1); }

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
      tags: ['SSC', 'GD', 'Constable', 'PYQ', '2017'],
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

  // Re-use the old (pre-2019) SSC GD Tier-I pattern created with the
  // 7-Dec-2017 Shift-3 PYQ. Same structure: 35 GI + 50 GK + 9 Math, 100 marks, 90 min.
  const PATTERN_TITLE = 'SSC GD Constable Tier-I (Pre-2019 Pattern)';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: PATTERN_TITLE,
      duration: 90,
      totalMarks: 100,
      negativeMarking: 0.25,
      sections: [
        { name: REA, totalQuestions: 35, marksPerQuestion: 1, negativePerQuestion: 0.25 },
        { name: GA,  totalQuestions: 50, marksPerQuestion: 1, negativePerQuestion: 0.25 },
        { name: QA,  totalQuestions: 9,  marksPerQuestion: 1, negativePerQuestion: 0.25 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  }

  const TEST_TITLE = 'SSC GD Constable - 8 December 2017 Shift-1';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /8 December 2017/i }
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
    totalMarks: 94,
    duration: 90,
    accessLevel: 'FREE',
    isPYQ: true,
    pyqYear: 2017,
    pyqShift: 'Shift-1',
    pyqExamName: 'SSC GD Constable',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
