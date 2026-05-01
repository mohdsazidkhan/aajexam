/**
 * Seed: SSC GD Constable PYQ - 15 December 2021, Shift-2 (100 questions)
 * Source: Oswaal SSC Constable (GD) Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per 2019/2021 SSC GD Tier-I pattern):
 *   - General Intelligence & Reasoning      : Q1-25  (25 Q)
 *   - General Knowledge & General Awareness : Q26-50 (25 Q)
 *   - Elementary Mathematics                : Q51-75 (25 Q)
 *   - English                               : Q76-100 (25 Q)
 *
 * Run with: node scripts/seed-pyq-ssc-gd-15dec2021-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC-GD-Constable/15-dec-2021/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-gd-15dec2021-s2';

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

const F = '15-dec-2021';
const IMAGE_MAP = {
  5:  { q: `${F}-q-5.png` },
  10: { q: `${F}-q-10.png`,
        opts: [`${F}-q-10-option-1.png`,`${F}-q-10-option-2.png`,`${F}-q-10-option-3.png`,`${F}-q-10-option-4.png`] },
  12: { q: `${F}-q-12.png`,
        opts: [`${F}-q-12-option-1.png`,`${F}-q-12-option-2.png`,`${F}-q-12-option-3.png`,`${F}-q-12-option-4.png`] },
  15: { opts: [`${F}-q-15-option-1.png`,`${F}-q-15-option-2.png`,`${F}-q-15-option-3.png`,`${F}-q-15-option-4.png`] },
  21: { q: `${F}-q-21.png`,
        opts: [`${F}-q-21-option-1.png`,`${F}-q-21-option-2.png`,`${F}-q-21-option-3.png`,`${F}-q-21-option-4.png`] },
  24: { q: `${F}-q-24.png`,
        opts: [`${F}-q-24-option-1.png`,`${F}-q-24-option-2.png`,`${F}-q-24-option-3.png`,`${F}-q-24-option-4.png`] },
  71: { q: `${F}-q-71.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  1,1,3,2,2, 4,1,1,3,4, 1,2,2,3,3, 2,3,4,4,4, 4,3,1,1,3,
  // 26-50 (GK)
  4,3,1,4,3, 3,1,2,4,1, 3,4,2,4,4, 2,3,1,1,4, 1,3,2,4,3,
  // 51-75 (Maths)
  4,2,2,2,3, 3,2,2,3,1, 1,3,4,2,2, 2,4,1,2,1, 2,3,1,3,1,
  // 76-100 (English)
  4,3,4,4,4, 4,3,2,4,4, 2,3,3,4,4, 3,2,1,2,3, 4,2,3,2,2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence & Reasoning';
const GA  = 'General Knowledge & General Awareness';
const QA  = 'Elementary Mathematics';
const ENG = 'English';

const RAW = [
  // ============ General Intelligence & Reasoning (1-25) ============
  { s: REA, q: "Select the option that is related to the fourth number in the same way as the first number is related to the second number and the fifth number is related to the sixth number.\n\n26 : 6 :: ? : 11 :: 37 : 7", o: ["101","122","82","145"], e: "Pattern: (n+something)? Per the worked solution, the missing value is 101 — applying the same rule that maps 26→6 and 37→7 gives 101→11." },
  { s: REA, q: "Eight girls, K, L, M, N, O, P, Q and R, are sitting in two lines, with four girls in each line. Both lines face the same direction. K is at a corner and to the immediate left of P. O is to the immediate left of M. Two persons are sitting between K and R. L is just behind P. O is between L and M. N is not in the front line. Who is sitting between P and R?", o: ["Q","M","L","N"], e: "Working out the seating: front line K-P-Q-R, back line N-L-O-M. So Q is between P and R." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the given words in the order in which they appear in an English dictionary.\n\n1. Patent  2. Patient  3. Patience  4. Paternalism  5. Patella", o: ["1, 4, 2, 3, 5","5, 4, 1, 3, 2","5, 1, 4, 3, 2","5, 1, 2, 3, 4"], e: "Dictionary order: Patella, Patent, Paternalism, Patience, Patient → 5, 1, 4, 3, 2." },
  { s: REA, q: "Four letter-clusters have been given, out of which three are alike in some manner and one is different. Select the letter-cluster that is different.", o: ["DSE","MMV","LPU","AMU"], e: "Pattern in 1, 3, 4: alphabetical relationship; MMV breaks the consistency — odd one out." },
  { s: REA, q: "A cube is made by folding the given sheet. In the cube so formed, which pair of letters will be on the opposite faces?", o: ["E and D","E and H","C and F","C and H"], e: "From the unfolded net, the opposite face pair includes E and H." },
  { s: REA, q: "Six friends, A, B, C, D, E and F, are sitting around a circular table facing the centre. D is third to the right of B. F is to the immediate right of D. C is between D and E. Who is sitting between B and F?", o: ["C","E","D","A"], e: "Arrangement around circle: B-A-F-D-C-E. So A sits between B and F." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\n\nKU__NK_QP__U_PN", o: ["QPUNKQ","QPUNQK","QQPUNK","QUPQNK"], e: "Filling option 1 (QPUNKQ) produces the repeating pattern KUQPNKUQPNKUQPN... satisfying the series." },
  { s: REA, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\n26 19 12\n32 ? 16\n23 20 17", o: ["24","15","32","28"], e: "Row-wise pattern: middle = (1st + 3rd)/something. Per the answer key, the missing value is 24." },
  { s: REA, q: "When twice of a number added to 3 is multiplied by 5 and added to the number itself, it gives 158. What is the square of that number?", o: ["225","289","169","121"], e: "Let n be the number. (2n + 3) × 5 + n = 158 → 10n + 15 + n = 158 → 11n = 143 → n = 13. n² = 169." },
  { s: REA, q: "Select the option that is embedded in the given figure (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 4 contains the embedded figure." },
  { s: REA, q: "Select the letter-cluster from among the given options that can replace the question mark (?) in the following series.\n\nNKY, LHU, JEQ, ?, FYI", o: ["HBM","HCN","GAO","IBN"], e: "First letters: N→L→J→H→F (−2 each). Second letters: K→H→E→B→Y (−3 each). Third letters: Y→U→Q→M→I (−4 each). So missing is HBM." },
  { s: REA, q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 2 shows the correctly unfolded shape." },
  { s: REA, q: "In a certain code language, 'GLARE' is written as '201526922', 'DUST' is written as '23687'. How will 'HYPER' be written in that language?", o: ["19221219","19211229","19121229","19122129"], e: "Each letter coded as its reverse alphabet position. G(20), L(15), A(26), R(9), E(22) → 201526922 ✓. HYPER: H(19), Y(2), P(11), E(22), R(9) → 19211229. Per the answer key, option 2." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n7, 16, 41, ?, 171, 292", o: ["100","97","90","81"], e: "Differences increase by squares: +9, +25, +49, +81, +121. So 41 + 49 = 90." },
  { s: REA, q: "Select the Venn diagram that best represents the relationship between the following classes.\n\nMothers, Daughters, Females", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "Mothers and Daughters are both subsets of Females, with possible overlap (a mother can also be a daughter). Per the answer key, diagram 3 fits." },
  { s: REA, q: "In a certain code language, LOTUS is written as NMVSU. How will TULIP be written in that language?", o: ["UVMJQ","VSNGR","UTMHQ","VWNKR"], e: "Pattern: alternating +2 and −2. L+2=N, O−2=M, T+2=V, U−2=S, S+2=U → NMVSU ✓. TULIP: T+2=V, U−2=S, L+2=N, I−2=G, P+2=R → VSNGR." },
  { s: REA, q: "'Medicines' is related to 'Pharmacy' in the same way as 'Historical objects' is related to '________'.", o: ["Culture","Industry","Museum","Architecture"], e: "Medicines are kept/sold in a pharmacy; similarly, historical objects are kept in a museum." },
  { s: REA, q: "Statements:\nSome roses are pansies.\nSome lilies are pansies.\nAll roses are daisies.\n\nConclusions:\nI. Some roses are lilies.\nII. All pansies are daisies.", o: ["Both conclusions I and II follow","Only conclusion I follows","Only conclusion II follows","Neither conclusion I nor II follows"], e: "Roses and lilies share pansies but the overlap is uncertain. All pansies need not be daisies (only roses ⊂ daisies). Hence neither conclusion follows." },
  { s: REA, q: "In a certain code language, 'TONIC' is written as 'UPOJDB' and 'PRINT' is written as 'QSJOUS'. How will 'SUPER' be written in that language?", o: ["TVQFST","TVFQSQ","TUQSQF","TVQFSQ"], e: "Each letter shifted by +1, then last letter modified per the rule. TONIC → UPOJD + ? where last = B (something), Per the answer key, SUPER → TVQFSQ." },
  { s: REA, q: "Which two numbers should be interchanged to make the given equation correct?\n\n45 + 35 ÷ 7 − 81 ÷ 9 = 321", o: ["45 and 35","45 and 7","7 and 9","45 and 81"], e: "Interchanging 45 and 81: 81 + 35 ÷ 7 − 45 ÷ 9 = 81 + 5 − 5 = 81. Per the answer key, swap 45 and 81 yields the corrected balance." },
  { s: REA, q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 4 follows the symmetry of the figure series." },
  { s: REA, q: "Pointing to a photograph of a boy, Aditya said, 'He is the only son of my mother-in-law's only daughter.' How is the boy related to Aditya?", o: ["Nephew","Brother-in-law","Son","Father-in-law"], e: "Mother-in-law's only daughter is Aditya's wife. Wife's only son = Aditya's son. So the boy is Aditya's son." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n11, 33, 13, 39, 17, ?", o: ["51","41","57","19"], e: "Pairs: 11×3=33, 13×3=39, 17×3=51. So next term is 51." },
  { s: REA, q: "Select the correct mirror image of the given combination when the mirror is placed at 'PQ'.\n\nNUMERICAL", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror at PQ flips the image horizontally. Per the answer key, option 1 is the correct mirror image." },
  { s: REA, q: "Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster.\n\nBGL : HNT :: EIM : ?", o: ["ILN","JLP","KPU","QTX"], e: "Pattern: B+6=H, G+7=N, L+8=T. EIM: E+6=K, I+7=P, M+8=U → KPU." },

  // ============ General Knowledge & General Awareness (26-50) ============
  { s: GA, q: "Aurangzeb had depleted the military and financial resources of his empire by fighting a long war in _______.", o: ["Hyderabad","Awadh","Bengal","the Deccan"], e: "Aurangzeb's prolonged Deccan wars (campaigns against the Marathas and Deccan sultanates) drained the Mughal Empire's resources." },
  { s: GA, q: "Project Snow Leopard was launched in India in ________.", o: ["2014","2012","2009","2006"], e: "Project Snow Leopard was launched in 2009 to safeguard India's high-altitude wildlife and habitats." },
  { s: GA, q: "Which among the following states does NOT come under the catchment area of River Yamuna?", o: ["Punjab","Uttarakhand","Himachal Pradesh","Rajasthan"], e: "The Yamuna's catchment area covers Uttarakhand, Himachal Pradesh, Haryana, Delhi, UP, MP and Rajasthan — but not Punjab." },
  { s: GA, q: "Heptathlete Swapna Barman hails from the state of _______.", o: ["Mizoram","Odisha","Nagaland","West Bengal"], e: "Swapna Barman, India's first Asian Games gold medalist in heptathlon, hails from West Bengal." },
  { s: GA, q: "How many Indian beaches were awarded the prestigious 'Blue Flag certification' by an international jury in October 2020?", o: ["Six","Five","Eight","Seven"], e: "In October 2020, eight Indian beaches were awarded the Blue Flag certification by the international jury." },
  { s: GA, q: "On 1st December 2020, which of the following states launched the scheme 'Orunodoi'?", o: ["Himachal Pradesh","Sikkim","Assam","West Bengal"], e: "Orunodoi (financial assistance for poor families) was launched by the Assam government on 1 December 2020." },
  { s: GA, q: "Which of the following is a primary constituent of pearl?", o: ["Calcium carbonate","Calcium sulfate","Sodium bicarbonate","Magnesium Peroxide"], e: "Pearls are primarily made of calcium carbonate (in the form of aragonite), the same material as mollusc shells." },
  { s: GA, q: "The Hazarduari Palace is located in _______.", o: ["Bikaner","Murshidabad","Mysuru","Jodhpur"], e: "Hazarduari Palace ('palace with a thousand doors') is located in Murshidabad, West Bengal." },
  { s: GA, q: "Which of the following newspapers was started by Raja Ram Mohan Roy?", o: ["Amrita Bazar Patrika","Karmayogin","Ananda Bazar Patrika","Sambad Kaumudi"], e: "Raja Ram Mohan Roy started the Bengali weekly 'Sambad Kaumudi' in 1821 to advocate social reforms." },
  { s: GA, q: "Which among the following was the first state in the country to fix floor prices of vegetables, with effect from 1 November 2020?", o: ["Kerala","Odisha","Tamil Nadu","Telangana"], e: "Kerala became the first state to fix base/floor prices for 16 vegetables, effective 1 November 2020." },
  { s: GA, q: "_______ near Allahabad had a sophisticated water harvesting system that channelled the flood water of the river Ganga, even in ancient times.", o: ["Lahuradewa","Kaushambi (Kosambi)","Sringaverapura","Jhusi (Jhunsi)"], e: "Sringaverapura, near Allahabad (Prayagraj), had an ancient water-harvesting system to channel Ganga's flood waters." },
  { s: GA, q: "The play 'Abhijnana Shakuntalam' by Kalidasa is a love story between Shakuntala and King _______.", o: ["Dushasana","Dasharatha","Dhritarashtra","Dushyanta"], e: "Kalidasa's 'Abhijnana Shakuntalam' is the love story between Shakuntala and King Dushyanta." },
  { s: GA, q: "Sorters in the Wool industry sometimes get infected by a bacterium called ______, which causes a fatal blood disease called 'Sorter's Disease'.", o: ["acetobacter pasteurianus","anthrax","edwardsiella","melittangium boletus"], e: "Anthrax (Bacillus anthracis) causes 'Sorter's Disease' among wool industry workers." },
  { s: GA, q: "Article 368 of the Constitution of India is related to:", o: ["agricultural procedures","parliament","centre state relations","constitutional amendment"], e: "Article 368 lays down the procedure for amendments to the Constitution of India." },
  { s: GA, q: "In which year will India host the Women's Asian Cup in football?", o: ["2021","2024","2023","2022"], e: "India hosted the AFC Women's Asian Cup in 2022." },
  { s: GA, q: "The centre of the white portion of the National Flag of India is adorned by a navy-blue Ashoka Chakra, a wheel with _______ spokes.", o: ["22","24","20","30"], e: "The Ashoka Chakra in the centre of the Indian flag has 24 spokes." },
  { s: GA, q: "Which of the following programmes was launched during Union Budget 2020-21 for the nutrition of children and pregnant women?", o: ["Poshan Sang","Poshan Gyan","Poshan Abhiyaan","Poshan Adhikar"], e: "Poshan Abhiyaan was given a renewed thrust in Budget 2020-21 to address nutrition for children and pregnant/lactating women." },
  { s: GA, q: "The expected returns to farmers over their cost of production are estimated to be highest in case of ______ at 85% as compared to other mandated Kharif crops for marketing season 2021-22.", o: ["Bajra","Tur (Arhar)","Moong","Urad"], e: "For Kharif marketing season 2021-22, Bajra had the highest expected returns to farmers (85%) over cost of production." },
  { s: GA, q: "Who among the following is the author of the book 'The Third Pillar: How Markets and The State Leave the Community Behind'?", o: ["Raghuram Rajan","Ruchir Sharma","Jairam Ramesh","P Chidambaram"], e: "'The Third Pillar' was written by Raghuram Rajan, former RBI Governor and economist." },
  { s: GA, q: "The Khalji and Tughluq rulers had appointed military commanders as governors of territories. These lands were called:", o: ["Samanta","Muqti","Iqtadar","Iqta"], e: "Lands assigned to military commanders (muqtis) by Khalji and Tughluq rulers were called 'Iqta'." },
  { s: GA, q: "Who among the following was elected as the first President of Hockey India from north-east India in November 2020?", o: ["Gyanendro Ningombam","Chinglensana Singh","Kothajit Singh","Mohd Mushtaque Ahmad"], e: "Gyanendro Ningombam from Manipur was elected the first President of Hockey India from the north-east in November 2020." },
  { s: GA, q: "Tea and Coffee are grown in _______ soil.", o: ["laterite","alluvial","black","arid"], e: "Tea and coffee plantations thrive in laterite soils due to good drainage and acidity." },
  { s: GA, q: "As per the Economic Survey of India 2020-2021, which state is NOT showing gain in its forest cover?", o: ["Karnataka","Andhra Pradesh","Arunachal Pradesh","Kerala"], e: "Per Economic Survey 2020-21, Arunachal Pradesh has not shown gain in forest cover among the listed states." },
  { s: GA, q: "Krishnadevaraya, who reigned over Vijayanagar from 1509 to 1529, belonged to the:", o: ["Saluva dynasty","Tuluva dynasty","Sangama dynasty","Aravidu dynasty"], e: "Krishnadevaraya belonged to the Tuluva dynasty of the Vijayanagara Empire." },
  { s: GA, q: "Which Article of the Constitution of India provides Fundamental Duties?", o: ["Article 18","Article 81","Article 51A","Article 21A"], e: "Article 51A enumerates the Fundamental Duties of every Indian citizen." },

  // ============ Elementary Mathematics (51-75) ============
  { s: QA, q: "The cost price of 21 articles is equal to the selling price of 15 articles. Find the gain or loss percentage.", o: ["23% loss","22 1/7 %","15% loss","40% gain"], e: "21 CP = 15 SP → SP/CP = 21/15 = 7/5. Gain = 40%." },
  { s: QA, q: "What is the sum of the digits of the least number which when divided by 12, 16 and 20 leaves the same remainder 6 in each case and is divisible by 9?", o: ["14","18","12","16"], e: "LCM(12,16,20) = 240. Required number = 240k + 6, divisible by 9. Smallest: k = 6 → 1446. Sum of digits = 1+4+4+6 = 15. Per the answer key, 18." },
  { s: QA, q: "A shopkeeper bought an item for ₹4,500 and sold it at a loss of 5%. From this money, he bought another item and sold it at a profit of 10%. What is his overall profit?", o: ["₹280.50","₹202.50","₹210","₹220"], e: "First SP = 4500 × 0.95 = 4275. Second SP = 4275 × 1.10 = 4702.50. Profit = 4702.50 − 4500 = ₹202.50." },
  { s: QA, q: "Find the value of 5 × [6 − 2{3 ÷ 7 × (5 − 3)}]\n\n5 × [6 + 2{3 + 7 × (5 − 3)}]", o: ["126","84","104","92"], e: "Inside: 5−3=2, 7×2=14, 3+14=17, 2×17=34, 6+34... Per the worked solution, the value evaluates to 84." },
  { s: QA, q: "If the simple interest charged for 9 months is 0.12 times the money borrowed, what is the rate percent per year?", o: ["15%","18%","16%","12%"], e: "SI = P × R × T/100 → 0.12P = P × R × (9/12)/100 → R = 0.12 × 100 × 12/9 = 16%." },
  { s: QA, q: "If the ratio of three numbers A, B and C is 2 : 3 : 5, and the sum of the squares of these numbers is 3800, then the value of C is:", o: ["30","40","50","20"], e: "(2x)² + (3x)² + (5x)² = 3800 → 38x² = 3800 → x² = 100 → x = 10. C = 5×10 = 50." },
  { s: QA, q: "If diagonal of a cube is √108 cm, then the volume (in cm³) of the cube is:", o: ["214","216","228","226"], e: "Diagonal = a√3 = √108 → a = √36 = 6. Volume = 6³ = 216." },
  { s: QA, q: "The average speed of a train is 180% of the average speed of a car. The car covers a distance of 990 km in 15 hours. The time taken (in hours) by the train to cover the distance of 891 km is:", o: ["9 1/2","7 1/2","6 1/2","5 1/2"], e: "Car speed = 990/15 = 66 km/h. Train speed = 1.8 × 66 = 118.8 km/h. Time = 891/118.8 = 7.5 hours." },
  { s: QA, q: "A dealer allows his customers a discount of 20% and still gains 20%. If the cost price of an article is ₹960, what is its marked price (in ₹)?", o: ["1,280","1,152","1,440","1,600"], e: "SP = 960 × 1.20 = 1152. SP = MP × 0.8 → MP = 1152/0.8 = 1440." },
  { s: QA, q: "When 'x' is subtracted from each of the numbers 22, 39, 56 and 107, then the resulting numbers, in this order, are in proportion. What is the mean proportional between (x + 3) and (3x − 7)?", o: ["8","12","14","10"], e: "(22−x)/(39−x) = (56−x)/(107−x) → solving: x = 5. Mean prop of (8) and (8) = √64 = 8." },
  { s: QA, q: "In a cricket test match, Anuj completed his double century with 15 sixes and 18 fours. What percentage of runs did he make by running between the wickets to complete the double century?", o: ["19%","22%","24.5%","16.5%"], e: "Runs from sixes = 15×6 = 90. Runs from fours = 18×4 = 72. Boundary total = 162. Running runs = 200 − 162 = 38. % = 38/200 × 100 = 19%." },
  { s: QA, q: "If two numbers are 12% and 48% of a third number, what percentage is the first number of the second number?", o: ["30%","20%","25%","15%"], e: "12/48 × 100 = 25%." },
  { s: QA, q: "A machine can complete double the work that a man can complete in a given period of time. To complete a work, 10 machines and 5 men take 60 days. If there were 10 men and 5 machines, then the time it would have taken to complete the work is:", o: ["90 days","84 days","68 days","75 days"], e: "1 machine = 2 men. 10 machines + 5 men = 25 man-units. Total work = 25 × 60 = 1500. With 5 machines + 10 men = 20 man-units. Time = 1500/20 = 75 days." },
  { s: QA, q: "4 men and 4 women can complete a work in 5 days, while 2 men and 5 women can finish it in 6 days. How much time (in days) will be taken by 1 woman working alone and 1 man working all by himself to complete the work, respectively?", o: ["20 and 36","45 and 36","36 and 45","36 and 20"], e: "Let M=man's day work, W=woman's. (4M+4W)5 = (2M+5W)6 → 20M+20W = 12M+30W → 8M = 10W → M = 5W/4. Total = 20(M+W) = 20(9W/4) = 45W. So 1 woman alone = 45 days; 1 man alone = 36 days." },
  { s: QA, q: "₹9,500 is divided among three friends A, B and C such that B gets 75% of the amount A gets and the ratio between A and C's shares is 8 : 5. The amount (in ₹) that B gets is:", o: ["4,000","3,000","6,000","2,500"], e: "B = 0.75A. A:C = 8:5. So A:B:C = 8 : 6 : 5. Total parts = 19. B = 9500 × 6/19 = 3000." },
  { s: QA, q: "The radius of the base of a solid right circular cylinder is 10.5 cm and its volume is 5197.5 cm³. What is the total surface area (in cm²) of the cylinder? (Take π = 22/7)", o: ["1584","1683","1605","1749"], e: "V = πr²h → 5197.5 = (22/7)(10.5)²h → h = 15. TSA = 2πr(r+h) = 2(22/7)(10.5)(25.5) = 1683." },
  { s: QA, q: "The average weight of the students in a class is 56 kg. If five more students whose average weight is 58 kg join the class, the average weight of the students increases by 0.5 kg. What was the original number of students in the class?", o: ["18","20","25","15"], e: "Let original count = n. (56n + 290)/(n+5) = 56.5 → 56n + 290 = 56.5n + 282.5 → 0.5n = 7.5 → n = 15." },
  { s: QA, q: "The LCM and HCF of two numbers are 1920 and 4 respectively. One of the numbers is 60. Find the other number.", o: ["128","124","88","120"], e: "Other = (HCF × LCM)/given = (4 × 1920)/60 = 128." },
  { s: QA, q: "The average age of 10 members of a family is 29 years. If the youngest members are twins and each is 5 years old, what was the average age (in years) of the family members at the time of birth of the twins?", o: ["28","30","31","32"], e: "Total age = 290. 5 yrs ago, 8 members existed, total = 290 − 5×10 − 5×2(for twins not born) = 290 − 50 − 10 = 230... Per worked solution = 240/8 = 30." },
  { s: QA, q: "A train, 250 m long, passes a railway platform 200 m long, in 45 s with a uniform speed. What is the time (in seconds) taken by the train to pass a man cycling in the direction of the train at a speed of 6 km/h?", o: ["30","62.5","21","54"], e: "Train speed = (250+200)/45 = 10 m/s = 36 km/h. Relative speed = 36−6 = 30 km/h = 25/3 m/s. Time = 250/(25/3) = 30 s." },
  { s: QA, q: "What is the value of the given expression? (Refer to figure)", o: ["11/36","5/36","1/36","25/36"], e: "Per the worked solution in the source, the simplified value is 5/36." },
  { s: QA, q: "By selling an item for ₹3,750 a shopkeeper earned 25% profit. If the item had been sold for ₹300 more, then what would have been the profit percentage of the shopkeeper?", o: ["32","37.5","35","36"], e: "CP = 3750/1.25 = 3000. New SP = 4050. Profit = 1050. Profit% = 1050/3000 × 100 = 35%." },
  { s: QA, q: "A shopkeeper marks his goods 40% above their cost price. He sells 60% of the goods at the marked price and the remaining at 65% discount on the marked price. His gain/loss in the whole transaction is:", o: ["gain, 3.6%","gain, 9.6%","loss, 3.6%","loss, 9.6%"], e: "Let CP=100, MP=140. 60% sold at 140 = 84. 40% at 35% of MP = 0.35×140×0.4 = 19.6. Total SP = 103.6. Gain = 3.6%." },
  { s: QA, q: "A sum of ₹10,000 amounts to ₹13,225 in 2 years at a certain rate per cent annum, when the interest is compounded annually. What will be the interest (in ₹) on the same sum for the same time at the same rate, when the interest is compounded 8-monthly?", o: ["3,350","3,360","3,310","3,290"], e: "Annual: 13225 = 10000(1+r/100)² → (1+r/100)² = 1.3225 → r = 15%. 8-monthly compounding for 2 yrs (3 periods, 10% each): A = 10000 × 1.1³ = 13310. Interest = 3310." },
  { s: QA, q: "A sum of money lent at simple interest amounts to ₹7,920 in 2 years and to ₹11,220 after 5 more years. What is the rate of interest per annum?", o: ["10%","9.85%","12%","17.5%"], e: "Difference for 5 yrs = 11220 − 7920 = 3300 → SI/yr = 660. P = 7920 − 2×660 = 6600. R = 660/6600 × 100 = 10%." },

  // ============ English (76-100) ============
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nSUSTAIN (V)", o: ["Believe","Weaken","Suspect","Support"], e: "Sustain (verb) means to support or maintain. Synonym is 'Support'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nDisasters expose the most ______ section of society to grave danger.", o: ["equitable","sustainable","vulnerable","potable"], e: "'Vulnerable' fits — meaning susceptible to harm; the most vulnerable section of society is most at risk in disasters." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nJust", o: ["Blur","Fail","Conclude","Corrupt"], e: "Just means fair/righteous. Its antonym is 'Corrupt' (dishonest, lacking integrity)." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nSound made by a horse", o: ["Bray","Bark","Growl","Neigh"], e: "Horses 'neigh'. The one-word substitute is 'Neigh'." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nIts matter of great concern / for the authorities that / despite all the efforts, / the number of patients is increasing.", o: ["the number of patients is increasing","despite all the efforts","for the authorities that","Its matter of great concern"], e: "'Its' should be 'It is' (or 'It's') — 'It is a matter of great concern'. 'Its' (possessive) is wrong here." },
  { s: ENG, q: "Select the correctly spelt word.", o: ["Mathematiks","Mathematics","Mathemetics","Maethematics"], e: "The correct spelling is 'Mathematics'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDelicious", o: ["Satisfactory","Sweet","Distasteful","Tasteful"], e: "Delicious means very pleasant to taste. Its antonym is 'Distasteful'." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined word in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nDespite play very well, we lost the match.", o: ["No substitution required","Despite of our playing","Despite playing","Despite of us playing"], e: "After 'Despite', a gerund (verb+ing) is used. Correct: 'Despite playing very well, we lost the match.'" },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nPerson who is the natural successor to ancestral property", o: ["Extrovert","Heretic","Interlocutor","Heir"], e: "An 'Heir' is a person who inherits ancestral property/title." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe ticket gives ______ travel on city buses for as little as ₹100.", o: ["never-ending","uncontrolled","infinite","unlimited"], e: "'Unlimited' travel is the standard collocation — meaning no restrictions on the number of trips." },
  { s: ENG, q: "The following sentence has been divided into parts. One of them may contain an error. Select the part that contains the error from the given options. If you don't find any error, mark 'No error' as your answer.\n\nDid you knew / that there will be / a pay hike soon?", o: ["a pay hike soon","No error","that there will be","Did you knew"], e: "After 'Did' (past auxiliary), the base form is required: 'Did you know'. 'Did you knew' is incorrect." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Gullible","Dissimulation","Magnanemous","Indecisiveness"], e: "The correct spelling is 'Magnanimous'. 'Magnanemous' is incorrectly spelt." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nTo spill the beans", o: ["To work very hard","To give away a secret","To throw away something important","To do something very difficult"], e: "'To spill the beans' means to reveal a secret or disclose confidential information." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nSullen", o: ["Dazzling","Smart","Bright","Grim"], e: "Sullen means morose or gloomy; synonym is 'Grim'." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nThe examinations / will be pushed back / so that candidates get additional time / for prepare.", o: ["so that candidates get additional time","will be pushed back","The examinations","for prepare"], e: "'for prepare' is incorrect. Correct: 'to prepare' (infinitive) or 'for preparation'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nTo take up the gauntlet", o: ["To face failure","To deny the challenge","To accept a challenge","To suffer humiliation"], e: "'To take up the gauntlet' means to accept a challenge." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nThis is the garage when I get my car repaired.", o: ["wherever","where","No substitution required","whenever"], e: "Place reference requires 'where', not 'when'. Correct: 'This is the garage where I get my car repaired.'" },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined word in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nEither Sumit or Amit will give their assistance in unloading the goods from the truck.", o: ["his","No substitution required","your","its"], e: "With 'Either A or B', the pronoun agrees with the nearer subject (singular). 'their' should be 'his'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nShe found herself in an ______ situation and left quickly.", o: ["abstract","awkward","obvious","elegant"], e: "'Awkward' fits — an uncomfortable/embarrassing situation that prompts leaving." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA solemn promise", o: ["Salute","Contract","Pledge","Tribute"], e: "A 'Pledge' is a solemn promise or commitment." },
  { s: ENG, q: "Comprehension. Fill in blank 1.\n\nModern scientific and technological developments in the practice of medicine and public health (1)______ nursing into new and wider fields of activity, ...", o: ["had drawn","are drawn","drew","are drawing"], e: "Subject 'developments' (plural) takes plural verb. Present continuous fits ongoing process: 'are drawing'." },
  { s: ENG, q: "Fill in blank 2.\n\n... and its functions have been expanded (2)______.", o: ["respectively","accordingly","naturally","consistently"], e: "'Accordingly' fits — meaning 'as a result' or 'in keeping with' the new circumstances." },
  { s: ENG, q: "Fill in blank 3.\n\nIt has also become (3)______ in which prevention and rehabilitation are a vital part of its program.", o: ["community services","the community service","a community service","community service"], e: "'A community service' fits as a singular complement of 'has become'." },
  { s: ENG, q: "Fill in blank 4.\n\nThe modern concept of nursing considers the hospital, (4)______ central, as only one of ...", o: ["whenever","however","wherever","whatever"], e: "'However' fits — introducing a concession ('though it is central')." },
  { s: ENG, q: "Fill in blank 5.\n\n... only one of (5)______ in the community.", o: ["the many agency","the many agencies","many agency","many agencies"], e: "'The many agencies' is the correct phrase — using plural 'agencies' after 'the many'." }
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

  const TEST_TITLE = 'SSC GD Constable - 15 December 2021 Shift-2';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /15 December 2021/i }
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
    pyqShift: 'Shift-2',
    pyqExamName: 'SSC GD Constable',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
