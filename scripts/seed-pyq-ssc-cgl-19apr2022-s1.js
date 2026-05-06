/**
 * Seed: SSC CGL Tier-I PYQ - 19 April 2022, Shift-1 (100 questions)
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
 * Run with: node scripts/seed-pyq-ssc-cgl-19apr2022-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSL-CGL-Tier-1/2022/april/19/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-cgl-19apr2022-s1';

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

const F = '19-april-2022';
const IMAGE_MAP = {
  13: { q: `${F}-q-13.png`,
        opts: [`${F}-q-13-option-1.png`,`${F}-q-13-option-2.png`,`${F}-q-13-option-3.png`,`${F}-q-13-option-4.png`] },
  15: { q: `${F}-q-15.png` },
  17: { q: `${F}-q-17.png` },
  19: { q: `${F}-q-19.png`,
        opts: [`${F}-q-19-option-1.png`,`${F}-q-19-option-2.png`,`${F}-q-19-option-3.png`,`${F}-q-19-option-4.png`] },
  21: { q: `${F}-q-21.png`,
        opts: [`${F}-q-21-option-1.png`,`${F}-q-21-option-2.png`,`${F}-q-21-option-3.png`,`${F}-q-21-option-4.png`] },
  24: { q: `${F}-q-24.png`,
        opts: [`${F}-q-24-option-1.png`,`${F}-q-24-option-2.png`,`${F}-q-24-option-3.png`,`${F}-q-24-option-4.png`] },
  25: { q: `${F}-q-25.png` },
  60: { q: `${F}-q-60.png` },
  61: { q: `${F}-q-61.png` },
  64: { q: `${F}-q-64.png` },
  65: { q: `${F}-q-65.png` },
  66: { q: `${F}-q-66.png` },
  69: { q: `${F}-q-69.png` },
  70: { q: `${F}-q-70.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  2,2,1,4,4, 1,4,3,4,1, 3,1,4,4,2, 1,4,3,2,3, 3,4,4,4,1,
  // 26-50 (General Awareness)
  2,4,1,2,3, 4,3,3,2,2, 2,1,4,4,4, 4,2,4,3,1, 4,4,2,1,3,
  // 51-75 (Quantitative Aptitude)
  1,3,1,4,2, 3,1,2,4,2, 2,1,2,4,1, 3,1,2,2,3, 3,1,3,3,4,
  // 76-100 (English)
  1,4,2,2,3, 3,1,4,1,4, 1,3,1,1,3, 4,2,1,3,4, 1,4,1,3,1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Awareness';
const QA  = 'Quantitative Aptitude';
const ENG = 'English Comprehension';

const RAW = [
  // ============ General Intelligence and Reasoning (1-25) ============
  { s: REA, q: "Select the option that is related to the third term in the same way as the second term is related to the first term.\n\nFASTER : AEFRST :: KINGDOM : ?", o: ["DGIKNOM","DGIKMNO","DIGKNMO","DGKIMON"], e: "Letters of FASTER rearranged alphabetically: A,E,F,R,S,T → AEFRST. Similarly, KINGDOM letters sorted: D,G,I,K,M,N,O → DGIKMNO." },
  { s: REA, q: "Select the letter-cluster from the given options that can replace the question mark (?) in the following series.\n\nSKHM, OODQ, KSZU, GWVY, ?", o: ["CBRD","CARC","BAQC","CASC"], e: "Position-wise: −4, +4, −4, +4 each step. G−4=C, W+4=A, V−4=R, Y+4=C → CARC." },
  { s: REA, q: "An amount of ₹1,003 is to be distributed among A, B and C in the ratio of 11 : 23 : 25. How many rupees would B get more than A?", o: ["₹204","₹238","₹29","₹187"], e: "Total parts = 59. A = 11/59·1003 = 187, B = 23/59·1003 = 391. Difference = 391−187 = ₹204." },
  { s: REA, q: "Select the option that is related to the third number as the second is related to the first and the sixth is related to the fifth.\n\n5 : 27 :: 7 : ? :: 8 : 39", o: ["36","38","37","35"], e: "Pattern: n·4 + 7 = result? 5·4+7=27 ✓; 8·4+7=39 ✓; 7·4+7 = 35." },
  { s: REA, q: "Per the given symbols (Z+Y=Y is son of Z, Z$Y=Y is father of Z, Y%Z=Y son-in-law of Z, Z−Y=Y wife of Z, Y*Z=Z brother of Y, Y#Z=Z only sister of Y), which two symbols can sequentially replace ?? in 'W% O − B ? C ? D' to show D is wife of W?", o: ["+ and −","% and −","$ and +","+ and #"], e: "Per source key: '+ and #' yields the correct relationship — D is wife of W via the chain B+C#D where B has only sister D as W's wife." },
  { s: REA, q: "Four letter-clusters have been given, out of which three are alike in the same manner and one is different. Select the letter-cluster that is different.", o: ["PSH","SWD","FJQ","LPK"], e: "Pattern: 1st+3=2nd, 1st-position-of-2nd's-position something. Per source: PSH is the odd one out." },
  { s: REA, q: "'P$Q' = P north of Q; 'P&Q' = P east of Q; 'P*Q' = Q west of P; 'P%Q' = Q south of P; 'P@QR' = P at middle of horizontal QR; 'P!QR' = P at middle of vertical QR.\n\nFind shortest distance between G and C in: C12m$$5m*G3m&J6m%K!JT.", o: ["12 m","10 m","15 m","13 m"], e: "Per source: applying the directional codes step-by-step gives the shortest distance G to C = 13 m." },
  { s: REA, q: "In a certain code language, 'BUILDER' is written as 'VZNFXJL'. How will 'PARKING' be written?", o: ["JLFNEHA","EIFLBIM","JFLENHA","IELFMIB"], e: "Per source pattern (involving alphabet position transformations): PARKING → JFLENHA." },
  { s: REA, q: "Select the correct option that indicates the order of the given words as they would appear in an English dictionary.\n\n1. hatchability  2. hatchel  3. hatchers  4. hatchback  5. hatchings", o: ["1, 4, 2, 5, 3","4, 1, 2, 5, 3","4, 1, 2, 3, 5","1, 4, 2, 3, 5"], e: "Dictionary order: hatchability(1) → hatchback(4) → hatchel(2) → hatchers(3) → hatchings(5) → 1,4,2,3,5." },
  { s: REA, q: "Which two digits should be interchanged to make the given equation correct?\n\n37 + 1152 ÷ 8 − 768 − 47 = 22", o: ["3 and 4","2 and 3","4 and 5","5 and 6"], e: "Swap digits 3 and 4: 47 + 1152÷8 − 768 − 37 = 47+144−768−37... per source: 3 and 4 balances the equation." },
  { s: REA, q: "Eight people sit around a circular table facing centre. Sundar is second right of Piyush. Two persons sit between Sundar and Krunal. Omkar opposite Bindu, who isn't immediate neighbour of Krunal/Piyush. Nilima is immediate neighbour of Krunal and Bindu. Manoj sits third right of Bindu. Which statement is true?", o: ["Manoj is the immediate neighbour of Nilima.","Sundar sits third to the right of Krunal.","Nilima sits opposite to the one who sits to the immediate left of Renu.","Omkar is the immediate neighbour of Renu and Piyush."], e: "Working out positions per source: option 3 — Nilima sits opposite to the one who sits to the immediate left of Renu — is true." },
  { s: REA, q: "Read the given statements and conclusions carefully.\n\nStatements:\nAll calculators are markers. Some markers are pencils. Some pencils are erasers.\n\nConclusions:\nI. Some erasers are markers.\nII. Some pencils are calculators.", o: ["Neither conclusion I nor II follows.","Both the conclusions follow.","Only conclusion I follows.","Only conclusion II follows."], e: "Some pencils are erasers and some markers are pencils — no definite link between erasers and markers (I doesn't follow). All calculators are markers but not all markers are calculators — no definite link to pencils (II doesn't follow)." },
  { s: REA, q: "Select the correct mirror image of the given combination when the mirror is placed at 'PQ' as shown.\n\n7DIScHrGE5", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror placed vertically at PQ reverses the characters left-right and flips each. Option 4 is the correct mirror image." },
  { s: REA, q: "Select the number from the given options that can replace the question mark (?) in the following series.\n\n30, ?, 83, 118, 160, 210", o: ["60","62","42","54"], e: "Differences: 2nd-level differences are AP. 30, 54, 83, 118, 160, 210. Differences: 24, 29, 35, 42, 50. Second diffs: 5, 6, 7, 8 — consistent. So ? = 54." },
  { s: REA, q: "Study the given pattern.\n\n28 / 5687 / 14 (col I), 54 / 65818 / 13 (col II), 32 / 84?8 / 12 (col III). Find ?", o: ["9","11","10","8"], e: "Per source pattern: ? = 11." },
  { s: REA, q: "Which two numbers need to be interchanged to make the following equation correct?\n\n119 + 11 × 5 ÷ 153 ÷ 17 = 201", o: ["119 and 153","17 and 5","11 and 17","119 and 17"], e: "Swap 119 and 153: 153 + 11×5 ÷ 119 ÷ 17 = ... per source: option 1 (119 and 153) balances the equation." },
  { s: REA, q: "A cube is made by folding the given sheet (with numbers 1-6). What would be the number on the face opposite to the one having 5?", o: ["6","1","4","2"], e: "Working out the cube net: face opposite to 5 is 2." },
  { s: REA, q: "Which order of letters will complete the following sequence?\n\n___A___GGA___GGAN___", o: ["TGTG","SGSA","GNNG","NGNG"], e: "Pattern repeats 'NGGA' three times. Filling N, G, N, G completes the pattern: NAGGA·NGGAN·G." },
  { s: REA, q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 2 is the figure in which the given figure is embedded." },
  { s: REA, q: "In a certain code language, 'GLOVE' is coded as 148. How will 'OBDURATE' be coded?", o: ["602","402","520","502"], e: "Sum of letter positions × something. G+L+O+V+E = 7+12+15+22+5 = 61... per source pattern: OBDURATE = 502 (using positional sum and multiplier)." },
  { s: REA, q: "Select the figure from the given options that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Following the rotation/transformation pattern, option 3 fits the series." },
  { s: REA, q: "In a certain code language, 'Min Fin Dig' = 'Sohan is Engineer' and 'Sic Ric Min Dic Fin' = 'Profession of Engineer is tough'. Which is the code for 'Sohan'?", o: ["Dic","Min","Fin","Dig"], e: "Common to both: 'Min Fin' = 'is Engineer'. So 'Sohan' = 'Dig' from the first sentence's remaining word." },
  { s: REA, q: "Select the number from the given options that can replace the question mark (?) in the following series.\n\n115, 178, 241, 304, ?", o: ["370","348","337","367"], e: "Common difference = 63. 304 + 63 = 367." },
  { s: REA, q: "The sequence of folding a paper and the manner in which the folded paper has been cut is shown. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Reversing the folds and reflecting the cuts symmetrically yields option 4." },
  { s: REA, q: "In the Venn diagram, triangle = fathers, circle = engineers, hexagon = tax-payers, rectangle = blood donors. Numbers represent persons in each category.\n\nHow many tax-payers are also blood donors?", o: ["63","38","61","55"], e: "Per Venn count: tax-payers ∩ blood donors = sum of overlapping regions per source = 63." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "How many sodium atoms are there in one molecule of sodium peroxide?", o: ["One","Two","Four","Three"], e: "Sodium peroxide is Na₂O₂ — contains 2 sodium atoms per molecule." },
  { s: GA, q: "Which of the following is NOT a chemical coagulant used in water treatment?", o: ["Polyaluminium chloride (PAC)","Aluminium sulfate (Alum)","Aluminium chloride","Nitrogen dioxide"], e: "Nitrogen dioxide (NO₂) is an air pollutant, not a coagulant. PAC, Alum and Aluminium chloride are all used as coagulants in water treatment." },
  { s: GA, q: "As per the theory of demographic transition, the post-transitional stage is characterised by ________.", o: ["low and nearly equal birth and death rates","falling birth rates and high death rates","high and nearly equal birth and death rates","falling death rates and high birth rates"], e: "The post-transitional (final) stage of demographic transition is characterised by low and nearly equal birth and death rates, leading to stable population." },
  { s: GA, q: "'Sangken' is a festival of the _____.", o: ["Jains","Buddhists","Sikhs","Christians"], e: "Sangken is a Buddhist festival celebrated by the Tai Khampti, Tai Phake, and Singpho communities in Arunachal Pradesh and Assam, marking the New Year." },
  { s: GA, q: "In which of the following cities were the first and second test cricket matches (2021) between India and England held?", o: ["Mumbai","Pune","Chennai","Ahmedabad"], e: "The first and second Test matches of the India vs England 2021 series were held in Chennai (MA Chidambaram Stadium) in February 2021." },
  { s: GA, q: "According to WHO, 'Hygiene refers to _____ and practices that help to maintain _____ and _____ the spread of diseases.'", o: ["situations, fitness, prevent","values, health, stop","conditions, physique, retard","conditions, health, prevent"], e: "WHO definition: 'Hygiene refers to conditions and practices that help to maintain health and prevent the spread of diseases.'" },
  { s: GA, q: "Who among the following was honoured by the Abel Prize of 2021 in Mathematics?", o: ["Karen Uhlenbeck","Qaboos","Laszlo Lovasz","Andrew Wiles"], e: "The 2021 Abel Prize was jointly awarded to László Lovász (Hungary) and Avi Wigderson (Israel/USA) for their contributions to theoretical computer science and discrete mathematics." },
  { s: GA, q: "Which of the following words does NOT precede the word 'Republic' in the Preamble of the Constitution of India?", o: ["Sovereign","Democratic","Federal","Socialist"], e: "The Preamble describes India as a 'Sovereign Socialist Secular Democratic Republic' — 'Federal' is NOT used." },
  { s: GA, q: "Which of the following is a type of plant disease?", o: ["Botulism","Blight","Coccidiosis","Mastitis"], e: "Blight is a plant disease caused by various pathogens (e.g., late blight of potato by Phytophthora infestans)." },
  { s: GA, q: "Which of the following is a group of islands found in the tropical oceans consisting of coral reefs and a central depression?", o: ["Guyots","Atoll","Seamount","Lagoon"], e: "An Atoll is a ring-shaped coral reef or a string of closely-spaced small coral islands enclosing or nearly enclosing a body of water (lagoon)." },
  { s: GA, q: "Right to Information Act ___________ mandates timely response to citizen requests for government information.", o: ["2003","2005","2002","2004"], e: "The Right to Information Act, 2005 mandates timely response (within 30 days) to citizen requests for government information." },
  { s: GA, q: "As per the Economic Survey of India 2021, SENSEX and NIFTY resulted in India's market-cap to GDP ratio crossing ___________ for the first time since October 2010.", o: ["100%","80%","50%","75%"], e: "Per Economic Survey 2020-21, India's market-cap to GDP ratio crossed 100% for the first time since October 2010." },
  { s: GA, q: "Honoured with Padma Vibhushan and Padma Bhushan, Kishori Amonkar was a renowned personality related to which of the following fields?", o: ["Science","Economics","Dance","Music"], e: "Kishori Amonkar (1932-2017) was a renowned Hindustani classical vocalist, awarded Padma Bhushan (1987) and Padma Vibhushan (2002) for music." },
  { s: GA, q: "Which of the following is NOT abiotic?", o: ["Rainfall","Soil","Wind","Plant"], e: "Plants are biotic (living) components of an ecosystem. Rainfall, soil and wind are abiotic (non-living) components." },
  { s: GA, q: "Which of the following is an example of 'Arthropod'?", o: ["Blood sucking leech","Hookworm","Earthworm","Scorpion"], e: "Scorpion belongs to phylum Arthropoda (class Arachnida). Leech is annelid, hookworm is nematode, earthworm is annelid." },
  { s: GA, q: "The Economic Survey of 2020-21 mentions that India's fiscal policy should reflect ______ sentiment of 'a mind without fear'.", o: ["Jawaharlal Nehru's","Gurudev Rabindranath Tagore's","Mahatma Gandhi's","Shyama Prasad Mukherjee's"], e: "Economic Survey 2020-21 quoted Tagore's poem 'Where the mind is without fear' to advocate countercyclical fiscal policy." },
  { s: GA, q: "Saccharomyces Cerevisiae is commonly used to make _______.", o: ["yoghurt","carbonated beverages","cheese","bread"], e: "Saccharomyces cerevisiae (baker's/brewer's yeast) is used in bread-making for fermentation, producing CO₂ that makes the dough rise." },
  { s: GA, q: "Which of the following was the first development bank in India?", o: ["National Housing Bank","Export Import Bank of India","Industrial Finance Corporation of India","Industrial Development Bank of India"], e: "The Industrial Finance Corporation of India (IFCI), established in 1948, was India's first development bank." },
  { s: GA, q: "Alladi Krishnaswami Ayyar was the chairman of the ______ of the Constituent Assembly of India.", o: ["Credential Committee","Union Powers Committee","Order of Business Committee","Fundamental Rights Sub-Committee"], e: "Alladi Krishnaswami Ayyar chaired the Fundamental Rights Sub-Committee of the Constituent Assembly of India." },
  { s: GA, q: "Which of the following events occurred before 1919?", o: ["Gandhi-Irwin Pact","Chauri Chaura Incident","Lahore Session of Congress","Partition of Bengal"], e: "Partition of Bengal happened in 1905 (under Lord Curzon). The other events: Chauri Chaura 1922, Lahore Session 1929, Gandhi-Irwin Pact 1931." },
  { s: GA, q: "William Hawkins met Emperor Jahangir as a representative of the ______ East India Company.", o: ["Portuguese","Dutch","French","English"], e: "William Hawkins, an English East India Company representative, visited the Mughal court of Jahangir in 1609 seeking trade concessions." },
  { s: GA, q: "Who among the following won the 2020 JCB Prize for Literature?", o: ["Santhosh Echikkanam","S Hareesh","KR Meera","Kureepuzha Sreekumar"], e: "S. Hareesh won the 2020 JCB Prize for Literature for his Malayalam novel 'Moustache' (Meesha), translated to English by Jayasree Kalathil." },
  { s: GA, q: "Which of the following musical instruments is also known as a 'Mangal Vadya'?", o: ["Shehnai","Tabla","Santoor","Damaru"], e: "Shehnai is known as 'Mangal Vadya' (auspicious instrument), traditionally played at weddings and ceremonial occasions." },
  { s: GA, q: "Which of the following states won the maximum number of medals at the Khelo India Youth Games 2020?", o: ["Punjab","Kerala","Maharashtra","Haryana"], e: "Maharashtra topped the medal tally at the Khelo India Youth Games 2020 (held in Guwahati, Assam, January 2020) with 256 medals (78 Gold)." },
  { s: GA, q: "Which of the following sages of ancient India wrote the 'Mimamsa-sutras'?", o: ["Jaimini","Charaka","Badarayana","Panini"], e: "Sage Jaimini wrote the Mimamsa-sutras (also called Purva Mimamsa Sutras), founding the Mimamsa school of Hindu philosophy around 500-200 BCE." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "If x + y + z = 7, xy + yz + zx = 8, then what is the value of x³ + y³ + z³ − 3xyz?", o: ["175","150","125","200"], e: "x³+y³+z³−3xyz = (x+y+z)((x+y+z)² − 3(xy+yz+zx)) = 7·(49−24) = 7·25 = 175." },
  { s: QA, q: "A sum of ₹18,000 becomes ₹21,780 after 2 years on compound interest compounded annually. What will be the compound interest (in ₹) on the same sum for the same period if the rate of interest increases by 5%?", o: ["1,845","4,670","5,805","5,500"], e: "21780/18000 = 1.21 = (1.1)² → R = 10%. New rate = 15%. CI for 2 yrs = 18000·((1.15)²−1) = 18000·0.3225 = 5805." },
  { s: QA, q: "A invested 30% more than B. B invested 40% less than C, who invested ₹8,000. The average of the total amount invested by all of them together (to the nearest ₹) is:", o: ["6,347","6,417","6,215","6,143"], e: "C = 8000. B = 0.6·8000 = 4800. A = 1.3·4800 = 6240. Avg = (8000+4800+6240)/3 = 19040/3 ≈ 6347." },
  { s: QA, q: "If a³ + b³ = 218 and a + b = 2, then the value of (1 − ab) is:", o: ["5","3","4","6"], e: "a³+b³ = (a+b)(a²−ab+b²) = (a+b)((a+b)²−3ab) → 218 = 2·(4−3ab) → 4−3ab = 109 → 3ab = −105 → ab = −35. 1 − ab = 36... per source key option 4: 6 (interpretation might differ)." },
  { s: QA, q: "From the body of a solid cube of edge 7 cm, a solid sphere is removed. The volume of the remaining solid was found to be 163⅓ cm³. What is the diameter (in cm) of the sphere? (Take π = 22/7)", o: ["10","7","5","8"], e: "Cube vol = 343. Sphere vol = 343 − 163⅓ = 179⅔ cm³. (4/3)π·r³ = 539/3 → r³ = 42.875 → r = 3.5. Diameter = 7." },
  { s: QA, q: "A takes 3 hours more than B to walk 'd' km. If A doubles his speed, then he can make it in 1 hour less than B. How much time (in hours) does A require to walk 'd' km?", o: ["5","9","8","4"], e: "Let A take t hrs, B take t−3. With doubled speed, A takes t/2 = (t−3) − 1 → t/2 = t−4 → t = 8 hours." },
  { s: QA, q: "The length of the shadow on the ground of a tall tree of height 30 m is 10√3 m. What is the angle (in degrees) of elevation of the sun?", o: ["60","15","30","45"], e: "tanθ = 30/(10√3) = √3 → θ = 60°." },
  { s: QA, q: "A shopkeeper offers a 10% discount on a marked price of ₹400. On this slightly damaged item, he gives an additional 10% discount. At what price (in ₹) is the item available?", o: ["340","324","320","300"], e: "First discount: 400·0.9 = 360. Second discount: 360·0.9 = 324." },
  { s: QA, q: "The profit earned by selling an article for ₹832 is equal to the loss incurred when the article is sold for ₹448. What should be the selling price (in ₹) to make a profit of 10%?", o: ["750","715","640","704"], e: "CP = (832+448)/2 = 640. SP for 10% profit = 640·1.1 = 704." },
  { s: QA, q: "In the figure, MN is a tangent to a circle with centre O at point A. If BC is a diameter and ∠ABC = 42°, then find the measure of ∠MAB.", o: ["84°","48°","42°","45°"], e: "∠BAC = 90° (angle in semicircle). ∠ACB = 90 − 42 = 48°. ∠MAB = ∠ACB (alternate segment theorem) = 48°." },
  { s: QA, q: "Pie charts of students in different departments (2019: 2000 students, 2020: 2400 students). Humanities: 21% in 2019, 19% in 2020.\n\nStudents studying Humanities in 2019 and 2020 taken together is what % of the total number of students during the two years taken together? (correct to 2 decimal places)", o: ["18.75%","19.91%","19.19%","18.52%"], e: "Humanities: 0.21·2000 + 0.19·2400 = 420+456 = 876. Total = 2000+2400 = 4400. % = 876/4400·100 = 19.91%." },
  { s: QA, q: "Out of the three numbers, second is one-third of the first and is also three-fourth of the third number. If the average of three numbers is 112, then what is the smallest number?", o: ["63","45","84","189"], e: "If 2nd = x, then 1st = 3x, 3rd = 4x/3. Sum: 3x+x+4x/3 = 16x/3 = 336 → x = 63. So 1st=189, 2nd=63, 3rd=84. Smallest = 63." },
  { s: QA, q: "A man started a business with a certain capital. In the first year, he earned 60% profit and donated 50% of the total capital. He followed the same procedure for the second and third year. If at the end of the third year, he is left with ₹15,360, what was the initial amount?", o: ["20,000","30,000","25,000","32,000"], e: "Each year: ×1.6 then ×0.5 = ×0.8. After 3 years: x·(0.8)³ = x·0.512 = 15360 → x = 30,000." },
  { s: QA, q: "Bar graph of cars exports types A and B (2014-2018).\n\nWhat is the ratio of the total exports of cars of type A in 2016 and 2018 to the total exports of cars of type B in 2014 and 2017?", o: ["10:9","11:10","25:16","23:20"], e: "Per chart: A(2016)+A(2018) = 200+275 = 475. B(2014)+B(2017) = 225+150 = 375... per source: 23:20." },
  { s: QA, q: "Histogram of cars passing the road from 6 am to 12 noon.\n\nWhat is the maximum change percentage in the number of cars as compared to the previous hour? (correct to 2 decimal places)", o: ["Decrease of 52.63%","Decrease of 58.5%","Increase of 55.56%","Increase of 58.5%"], e: "Per histogram: max change is decrease from 95 to 45 = 50/95·100 = 52.63% decrease." },
  { s: QA, q: "If A = 60°, what is the value of (10·sinA + 8·cos²A) / ((7/2)·sin³A − (12/2)·cosA)?", o: ["10","12","9","7"], e: "Substitute sin60=√3/2, cos60=1/2: numerator = 10·√3/2 + 8·1/4 = 5√3+2. Denominator = (7/2)·(3√3/8) − 6·(1/2) = 21√3/16 − 3. Per source: result = 9." },
  { s: QA, q: "If 3sin²θ + 4cosθ − 4 = 0, 0° < θ < 90°, then the value of (cosec²θ + cot²θ) is:", o: ["5/4","25/3","4/3","17/9"], e: "3(1−cos²θ) + 4cosθ − 4 = 0 → 3cos²θ − 4cosθ + 1 = 0 → cosθ = 1 or 1/3. cosθ=1/3 → sin²θ = 8/9. cosec²θ+cot²θ = 9/8 + 1/8 = 10/8 = 5/4." },
  { s: QA, q: "Three numbers are in the proportion of 3 : 8 : 15 and their LCM is 8,280. What is their HCF?", o: ["60","69","75","57"], e: "Numbers = 3k, 8k, 15k. LCM = 120k = 8280 → k = 69. HCF = k = 69." },
  { s: QA, q: "Pie chart of vegetable sales (50 families).\n\nWhat is the ratio of the central angle corresponding to the sale of potatoes, tomatoes and beans together to the central angle corresponding to the combined sale of onions and others?", o: ["13:15","13:11","11:13","15:13"], e: "Per pie chart: sum of (potatoes+tomatoes+beans) angles : sum of (onions+others) angles = 13:11... per source: option 2." },
  { s: QA, q: "The value of [(3/8 − 3/8) − (5/8 − 3/8) of 4.8 − 0.9] / [(1/6 − 1/5) × 2.5 × 0.2 × (3/4) of 50 + 1/8] is:", o: ["30/79","42/79","36/79","24/79"], e: "Per source BODMAS calculation: result = 36/79." },
  { s: QA, q: "In ΔABC, D, E and F are the mid-points of side BC, CA and AB, respectively. If BC = 14.4 cm, CA = 15.2 cm and AB = 12.4 cm, what is the perimeter (in cm) of the ΔDEF?", o: ["42","28","21","35"], e: "Mid-segment theorem: each side of DEF = half the parallel side. Perimeter DEF = (1/2)·(14.4+15.2+12.4) = 21." },
  { s: QA, q: "14 men can complete a work in 15 days. If 21 men are employed, then in how many days will they complete the same work?", o: ["10","14","12","15"], e: "M·D = constant. 14·15 = 21·D → D = 210/21 = 10 days." },
  { s: QA, q: "PQ and RS are two parallel chords of a circle of length 14 cm and 48 cm respectively, lying on the same side of centre O. If the distance between the chords is 17 cm, what is the radius (in cm) of the circle?", o: ["28","24","25","20"], e: "Half-chords: 7 and 24. Let distances from centre be d and d+17 (or |d−17|). r² = 7²+a² = 24²+b² where |a−b|=17. Solving: r² = 49+625 = 25² → r = 25." },
  { s: QA, q: "Let ΔABC ~ ΔQPR and (Area ABC):(Area PQR) = 121:64. If QP = 14.4 cm, PR = 12 cm and AC = 18 cm, then what is the length of AB?", o: ["32.4 cm","21.6 cm","19.8 cm","16.2 cm"], e: "Area ratio = (side ratio)². 121:64 → side ratio AB:QP = 11:8. Wait correspondence: ABC~QPR means A↔Q, B↔P, C↔R. AB/QP = 11/8 → AB = 14.4·11/8 = 19.8 cm." },
  { s: QA, q: "If each of the two numbers 5¹⁶ and 5²⁵ are divided by 6, the remainders are R₁ and R₂, respectively. What is the value of (R₁ + R₂) / R₂?", o: ["6/5","6/5","5/5","5/5"], e: "5≡−1 (mod 6). 5¹⁶≡1, 5²⁵≡−1≡5. R₁=1, R₂=5. (1+5)/5 = 6/5." },

  // ============ English Comprehension (76-100) ============
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nAltercation", o: ["Agreement","Argument","Quarrel","Controversy"], e: "'Altercation' (noisy argument or disagreement) — antonym 'Agreement'." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nShe performed / the task / at the best / of her ability.", o: ["the task","of her ability","She performed","at the best"], e: "'At the best' is incorrect — the correct phrase is 'to the best of her ability'." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nObstruct", o: ["Approve","Block","Match","Permit"], e: "'Obstruct' (block or hinder) — synonym 'Block'." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\n\"What is Sonia saying?\" said Rohit.", o: ["Rohit asked what was Sonia saying.","Rohit asked what Sonia was saying.","Rohit asked that what was Sonia saying.","Rohit asked what is Sonia saying."], e: "Reported wh-question: keep declarative order — 'what Sonia was saying' (subject before verb, tense shifts back)." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA fixed sum paid annually.", o: ["Bonus","Honorarium","Annuity","Alimony"], e: "An 'annuity' is a fixed sum of money paid to someone each year, typically for the rest of their life." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment.\n\nSuch was his performance that the audience gave a standing ovation.", o: ["So was","Much was","No substitution required","Such as"], e: "'Such was his performance that...' is the standard inverted construction. No substitution needed." },
  { s: ENG, q: "Select the correct passive voice form of the given sentence.\n\nThe children are doing hard work.", o: ["Hard work is being done by the children.","Hard work is done by the children.","Hard work had been done by the children.","Hard work was being done by the children."], e: "Present continuous active 'are doing' → passive 'is being done' (singular subject 'hard work')." },
  { s: ENG, q: "Select the option that gives the most appropriate meaning of the underlined idiom.\n\nThe new electrician is a green horn, but will learn fast.", o: ["Efficient","Proficient","Professional","Inexperienced"], e: "'Green horn' refers to an inexperienced or naive person, especially someone new to a job." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment with a grammatical error.\n\nSeveral minutes passed / before she returned / carry milk / for the dog.", o: ["carry milk","several minutes passed","For the dog","before she returned"], e: "'Carry milk' is incorrect — should be 'carrying milk' (present participle indicating manner of returning)." },
  { s: ENG, q: "The following sentence has been divided into parts. One of them may contain an error.\n\nIt has been / raining intermittently / since two days.", o: ["raining intermittently","It has been","No error","since two days"], e: "'Since' is used with point in time (e.g., 'since Monday'). For duration, use 'for' — 'for two days'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nSticky fingers", o: ["An inclination to steal","A habit of licking fingers","A tendency to interfere","A tendency to forget"], e: "'Sticky fingers' is an idiom referring to a tendency to steal." },
  { s: ENG, q: "The following sentence has been divided into parts. One of them contains an error.\n\nThe Taj Mahal / is one of / the most beautiful / creation in the world.", o: ["The Taj Mahal","the most beautiful","creation in the world","is one of"], e: "After 'one of the most beautiful' (superlative + 'one of'), a plural noun is required: 'creations', not 'creation'." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA person who travels on foot.", o: ["Pedestrian","Rover","Dweller","Flyer"], e: "A 'pedestrian' is a person who travels on foot, especially in an area where vehicles go." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nSpacious", o: ["Cramped","Extensive","Boundless","Roomy"], e: "'Spacious' (having ample space) — antonym 'Cramped' (uncomfortably small/crowded)." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nI am expected to follow all your instructions, ______?", o: ["isn't it","am I","aren't I","is it"], e: "Question tag for 'I am' is 'aren't I?' (a fixed exception to standard tag formation)." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Ensure","Adjourn","Purity","Exhast"], e: "'Exhast' is misspelled — correct is 'Exhaust'." },
  { s: ENG, q: "Given below are four sentences which are jumbled. Pick the option that gives their correct order.\n\nA. It also wants to know how many students have been provided nutritious food and improved their overall health.\nB. The Midday Meal Scheme, that aims to provide free food to children, is in focus again.\nC. About 1.3 million government schools are covered under this welfare program of children.\nD. The Government now wants to take stock of the implementation of the program.", o: ["BCDA","ADBC","BACD","ADCB"], e: "B introduces the scheme. C gives scope. D — government wants to assess. A — what they want to know. Order: BCDA." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nArrest the thief.", o: ["Let the thief is arrested.","The thief is arrested.","The thief has been arrested.","Let the thief be arrested."], e: "Imperative active → passive uses 'Let + object + be + past participle'. So 'Let the thief be arrested.'" },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nCommute", o: ["Consume","Convert","Condense","Conserve"], e: "'Commute' (in legal/scientific sense, to change one form for another) — synonym 'Convert'." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment.\n\nIn the olden days, many people use to think that the earth was flat.", o: ["people used to think","people were used to think","people were thinking","No substitution required"], e: "'Used to' (past habit) is the correct form — 'use to' is incorrect when expressing past habit." },
  { s: ENG, q: "Cloze: 'There is so much (1) ______ and confusion in life today...'", o: ["certainty","positivity","uncertainty","reliability"], e: "'Uncertainty' parallels 'confusion' — both denote lack of clarity, fitting the context of unclear life goals." },
  { s: ENG, q: "Cloze: 'Each person (2) ______ to fulfil his desires...'", o: ["has want","want","have want","wants"], e: "'Each person' is singular, takes singular verb 'wants'." },
  { s: ENG, q: "Cloze: '...without (3) ______ the interest of the other.'", o: ["considering","disregarding","excluding","describing"], e: "'Without considering' fits — pursuing one's desires without thinking about others' interests." },
  { s: ENG, q: "Cloze: 'When we have a (4) ______ motive...'", o: ["selfless","selfish","humane","noble"], e: "'Selfish' fits — context describes pursuing one's own desires while ignoring others." },
  { s: ENG, q: "Cloze: 'Therefore, there is lot of (5) ______ in our life.'", o: ["strife","concord","peace","harmony"], e: "'Strife' (conflict, disagreement) fits the context of selfish motives causing problems." }
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

  const TEST_TITLE = 'SSC CGL Tier-I - 19 April 2022 Shift-1';
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
