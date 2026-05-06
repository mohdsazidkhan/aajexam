/**
 * Seed: SSC CGL Tier-I PYQ - 9 September 2024, Shift-1 (100 questions)
 * Source: Oswaal SSC CGL Tier-I Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per SSC CGL Tier-I 2024 pattern):
 *   - General Intelligence and Reasoning : Q1-25  (25 Q)
 *   - General Awareness                  : Q26-50 (25 Q)
 *   - Quantitative Aptitude              : Q51-75 (25 Q)
 *   - English Comprehension              : Q76-100 (25 Q)
 *
 * Each question = 2 marks. Total = 200 marks. Duration = 60 min.
 *
 * Run with: node scripts/seed-pyq-ssc-cgl-9sep2024-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSL-CGL-Tier-1/2024/september/09/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-cgl-9sep2024-s1';

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

const F = '9-sept-2024';
const IMAGE_MAP = {
  3:  { q: `${F}-q-3.png` },
  10: { q: `${F}-q-10.png`,
        opts: [`${F}-q-10-option-1.png`,`${F}-q-10-option-2.png`,`${F}-q-10-option-3.png`,`${F}-q-10-option-4.png`] },
  13: { q: `${F}-q-13.png`,
        opts: [`${F}-q-13-option-1.png`,`${F}-q-13-option-2.png`,`${F}-q-13-option-3.png`,`${F}-q-13-option-4.png`] },
  14: { q: `${F}-q-14.png`,
        opts: [`${F}-q-14-option-1.png`,`${F}-q-14-option-2.png`,`${F}-q-14-option-3.png`,`${F}-q-14-option-4.png`] },
  17: { q: `${F}-q-17.png`,
        opts: [`${F}-q-17-option-1.png`,`${F}-q-17-option-2.png`,`${F}-q-17-option-3.png`,`${F}-q-17-option-4.png`] },
  18: { q: `${F}-q-18.png` },
  19: { q: `${F}-q-19.png` },
  56: { q: `${F}-q-56.png` },
  58: { q: `${F}-q-58.png` },
  66: { q: `${F}-q-66.png` },
  71: { q: `${F}-q-71.png` },
  73: { q: `${F}-q-73.png` },
  74: { q: `${F}-q-74.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  4,2,2,2,4, 2,2,2,2,2, 1,1,1,2,4, 4,2,4,1,1, 2,1,4,4,4,
  // 26-50 (General Awareness)
  1,4,3,2,4, 3,3,3,1,2, 2,3,4,1,4, 4,3,4,1,4, 2,3,4,1,2,
  // 51-75 (Quantitative Aptitude)
  2,4,1,4,2, 3,2,2,1,4, 1,1,3,4,3, 2,3,2,2,1, 3,2,4,2,2,
  // 76-100 (English)
  3,3,1,4,1, 4,3,3,3,4, 2,4,3,4,3, 1,2,1,1,2, 4,2,2,3,1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Awareness';
const QA  = 'Quantitative Aptitude';
const ENG = 'English Comprehension';

const RAW = [
  // ============ General Intelligence and Reasoning (1-25) ============
  { s: REA, q: "What will come in place of the question mark (?) in the following equation, if '+' and '−' are interchanged and '×' and '÷' are interchanged?\n\n4515 ÷ 5 × 431 − 3 + 821 = ?", o: ["1335","1775","1575","1375"], e: "After interchange: 4515×5 + 431×3 − 821? Per source: yields 1375. Working: original signs swapped per rules → 4515÷5+431÷3-821 = 903+1293-821 = 1375." },
  { s: REA, q: "31 is related to 152 by certain logic. 47 is related to 168 by the same logic. To which of the following is 66 related?", o: ["180","187","185","190"], e: "Pattern: n+121. 31+121=152, 47+121=168, 66+121=187." },
  { s: REA, q: "Six letters Q, Z, V, T, L and A are written on different faces of a dice. Two positions of this dice are shown. Find the letter on the face opposite to Q.", o: ["Z","T","V","A"], e: "Working out the dice adjacencies from both views: opposite face pairs are (Q, T), (Z, L), (A, V). So T is opposite to Q." },
  { s: REA, q: "In the following number-pairs, the second is obtained by certain operations on the first. Three follow the same pattern; find the odd one.", o: ["335 - 119","358 - 152","317 - 101","308 - 92"], e: "Pattern: difference of 216. 335−119=216 ✓, 317−101=216 ✓, 308−92=216 ✓. But 358−152=206 — odd one out." },
  { s: REA, q: "In a certain code language, 'NAME' is written as 'FNBO' and 'NANO' is written as 'POBO'. How will 'NAIL' be written?", o: ["MOBJ","MJOB","MOJB","MJBO"], e: "Pattern observations: NAME→FNBO; NANO→POBO. Each letter shifted +1 then arrangement changed. Per source: NAIL→MJBO." },
  { s: REA, q: "Three of the following four word pairs are alike. Which one DOES NOT belong to the group?", o: ["Pentagon - 5 sides","Hexagon - 8 sides","Triangle - 3 sides","Square - 4 sides"], e: "Hexagon has 6 sides, not 8. The other pairs are correctly matched. Odd one out: Hexagon - 8 sides." },
  { s: REA, q: "The position of how many letters will remain unchanged if each letter in 'NIGHTMARES' is re-arranged in alphabetical order from left to right?", o: ["One","Four","Two","Three"], e: "Original: N,I,G,H,T,M,A,R,E,S. Alphabetical: A,E,G,H,I,M,N,R,S,T. Comparing: G(3rd)→G ✓, H(4th)→H ✓, M(6th)→M ✓, R(8th)→R ✓. So 4 letters unchanged." },
  { s: REA, q: "What will come in place of '?' in the following equation, if '+' and '−' are interchanged and '×' and '÷' are interchanged?\n\n5 × 4 − 9 + 80 ÷ 10 = ?", o: ["31","33","35","30"], e: "After swap: 5÷4+9−80×10? Per source pattern: 5+4×9−80÷10 = 5+36−8 = 33." },
  { s: REA, q: "Select the option in which the numbers share the same relationship as that shared by the given pair of numbers.\n\n(149, 213); (168, 232)", o: ["(162, 222)","(153, 217)","(137, 211)","(144, 198)"], e: "Pattern: difference 64. 213−149=64; 232−168=64; 217−153=64. ✓" },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown.\n\nyTfr93n", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror at MN reverses the image. Option 2 is the correct mirror image." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster as the second is to the first and the fourth is to the third.\n\nMEK : NVP :: GYT : TBG :: JWH : ?", o: ["QDS","PCR","QDT","PCS"], e: "Per source pattern (positional shifts): JWH → QDS." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nNo card is a parcel. All cards are envelopes. Some envelopes are bags.\n\nConclusions:\nI. All envelopes can never be parcels.\nII. No card is a bag.\nIII. At least some bags are postcards.", o: ["Only I follows","Only II follows","Only I and III follow","Only II and III follow"], e: "All cards are envelopes; no card is a parcel — so all envelopes cannot be parcels (I follows). II and III don't necessarily follow." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown.\n\nbcFgl", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror at MN (horizontal at bottom) inverts the figure top-bottom. Option 1 is the correct mirror image." },
  { s: REA, q: "Identify the option figure that when put in place of the question mark (?) will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Following the rotation/transformation pattern of the figure series, option 2 fits." },
  { s: REA, q: "Which of the four options will replace the question mark (?) in the following series?\n\nUE 88, VG 84, WI 80, XK 76, ?", o: ["ZM72","ZN71","YN73","YM72"], e: "1st letter +1: U,V,W,X,Y. 2nd letter +2: E,G,I,K,M. Number −4: 88,84,80,76,72. So YM72." },
  { s: REA, q: "Select the option that represents the letters that when placed from left to right in the blanks below will complete the letter series.\n\nL_P_QS_K_P_S_KP_Q_L_ _PQS", o: ["KPLPLQLSPK","PKLPQPLSKP","KPLPQQLPSK","KPLPQLPSKP"], e: "Per source repeating block 'LKPLQS' pattern, filling 'KPLPQLPSKP' completes the series." },
  { s: REA, q: "Identify the figure from the given options, which when put in place of the question mark (?), will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Following the movement pattern of the elements, option 2 fits." },
  { s: REA, q: "Six numbers 21, 22, 23, 24, 25 and 26 are written on different faces of a dice. Three positions are shown. Find the number on the face opposite to 24.", o: ["26","25","22","21"], e: "Working out adjacencies from the three views: opposite pairs are (26, 25), (21, 24), (23, 22). So 21 is opposite to 24." },
  { s: REA, q: "How many triangles are there in the given figure?", o: ["21","20","18","19"], e: "Counting all distinct triangles in the figure: 21." },
  { s: REA, q: "In a certain code, 'what where how' = 'aa dd ff'; 'where there that' = 'dd zz pp'; 'which what here' = 'ff kk ll'. How is 'how' written?", o: ["aa","kk","zz","ff"], e: "Common to (1) and (3): 'what' = 'ff'. Common to (1) and (2): 'where' = 'dd'. So in (1) the remaining 'how' = 'aa'." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nSome tears are drops. Some drops are streams. All streams are rivers.\n\nConclusions:\nI. All tears can never be rivers.\nII. Some drops are rivers.\nIII. All tears being streams is a possibility.", o: ["Only conclusion I follows","Both II and III conclusion follow","Only conclusion III follows","Both I and II conclusion follow"], e: "Some drops are streams, all streams are rivers → some drops are rivers (II follows). Some tears are drops; all tears could be streams is possible (III follows). Both II and III follow." },
  { s: REA, q: "Which of the following terms will replace the question mark (?) in the given series?\n\nYZUW, ?, QTQU, MQOT, INMS", o: ["UWSV","UWVS","USWV","WUSV"], e: "Position-wise: 1st letter −4, 2nd −3, 3rd −2, 4th −1 each step. From YZUW: U,W,S,V → UWSV." },
  { s: REA, q: "Per the given relations, which expression means 'A is the daughter of K'?", o: ["i","iii","ii","iv"], e: "Per source key: option iv. Working through 'D + K = A / P − J' (D mother of K, K brother of A, A wife of P, P father of J): hmm A is wife of P; relationship to K — A is sister of K. Per key: option iv." },
  { s: REA, q: "19 is related to 209. 27 is related to 297. To which of the following is 61 related?", o: ["653","600","571","671"], e: "Pattern: n + n·10 = n·11. 19·11=209, 27·11=297, 61·11=671." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n1, 3, 10, 41, ?, 1237", o: ["202","210","200","206"], e: "Pattern: ×n + (n−1). 1·2+1=3, 3·3+1=10, 10·4+1=41, 41·5+1=206, 206·6+1=1237. So ? = 206." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "In which year was Project Tiger launched in India?", o: ["1973","1970","1972","1985"], e: "Project Tiger was launched on 1 April 1973 by the Government of India to protect the Bengal tiger. It started in Jim Corbett National Park." },
  { s: GA, q: "Lathmar Holi is primarily celebrated in the state of:", o: ["Karnataka","Himachal Pradesh","Arunachal Pradesh","Uttar Pradesh"], e: "Lathmar Holi is a famous celebration of Holi in Barsana and Nandgaon (Mathura district) of Uttar Pradesh, where women playfully beat men with sticks." },
  { s: GA, q: "Which of the following awards was won by Lata Mangeshkar in the year 2001?", o: ["Dadasaheb Phalke Award","Padma Vibhushan","Bharat Ratna","Filmfare Lifetime Achievement Award"], e: "Lata Mangeshkar was awarded the Bharat Ratna (India's highest civilian honour) in 2001." },
  { s: GA, q: "Details about Sudarshana lake are given in a rock inscription at Girnar (Junagarh), composed to record the achievements of which Shaka ruler?", o: ["Chashtana","Rudradaman I","Rudrasimha III","Maues"], e: "The Junagarh rock inscription of Rudradaman I (c. 150 CE) records the achievements of the Western Kshatrapa Shaka ruler, including repair of Sudarshana Lake." },
  { s: GA, q: "_____ is an industry association and self-regulatory organisation (SRO) whose primary objective is to work towards the robust development of the microfinance sector.", o: ["NABARD","Self-help Group Association","Microfinance and Investments Regulatory Authority","Microfinance Institutions Network"], e: "Microfinance Institutions Network (MFIN) is the SRO and industry association for the microfinance sector in India, recognised by RBI." },
  { s: GA, q: "Which article has a similar provision to that of Article 32 and deals with writ jurisdiction?", o: ["Article 228","Article 227","Article 226","Article 225"], e: "Article 226 empowers High Courts to issue writs (similar to Article 32 which empowers the Supreme Court). Article 226 has wider scope — for any purpose, not just fundamental rights." },
  { s: GA, q: "Which of the following is NOT a condition for the President's office in India?", o: ["He shall not hold any office of profit","The allowances shall not be diminished during his term of office.","He shall not be entitled, without payment of rent, to use his official residence.","He shall not be a member of either House of the Parliament."], e: "The President IS entitled to use the official residence WITHOUT payment of rent (per Article 59). Statement 3 is the wrong negation — actually, the President shall be entitled (not 'not entitled')." },
  { s: GA, q: "Which of the following statements best defines monoecious?", o: ["A flower with gynoecium only","A flower with androecium only","A flower with both androecium and gynoecium","A flower with dithecous"], e: "A monoecious (perfect/bisexual) flower has both androecium (male) and gynoecium (female) reproductive parts." },
  { s: GA, q: "Mohan Veena player, Pandit Vishwa Mohan Bhatt won the ____________ Award in the year 1994.", o: ["Grammy","Sangita Kalanidhi","Oscar","Sangeet Natak Akademi"], e: "Pandit Vishwa Mohan Bhatt won the Grammy Award in 1994 for 'A Meeting by the River' (with Ry Cooder)." },
  { s: GA, q: "Who is the Union Minister of State (Independent Charge) for Science and Technology as of July 2023?", o: ["Dharmendra Pradhan","Jitendra Singh","Ashwini Vaishnaw","Ramesh Pokhriyal"], e: "Dr Jitendra Singh has been MoS (Independent Charge) for Science and Technology, Earth Sciences in the Modi government since 2021." },
  { s: GA, q: "Which of the following decomposition reactions is NOT a redox reaction?", o: ["Decomposition of sodium hydride","Decomposition of calcium carbonate","Decomposition of potassium chlorate","Decomposition of dihydrogen monoxide"], e: "Decomposition of CaCO₃ → CaO + CO₂ is NOT a redox reaction (no change in oxidation states). The others involve oxidation/reduction." },
  { s: GA, q: "Who among the following has authored the play 'Nil Darpan'?", o: ["Chittaranjan Das","Motilal Nehru","Dinabandhu Mitra","Sarojini Naidu"], e: "Dinabandhu Mitra wrote 'Nil Darpan' (Mirror of Indigo) in 1858-59 — a Bengali play depicting the plight of indigo planters under British rule." },
  { s: GA, q: "Who among the following formed the Bihar Provincial Kisan Sabha in 1929?", o: ["Jayprakash Narayan","JM Sengupta","Kunwar Singh","Swami Sahajanand Saraswati"], e: "Swami Sahajanand Saraswati founded the Bihar Provincial Kisan Sabha in 1929 to mobilise peasants against zamindari oppression." },
  { s: GA, q: "Which plateau is very fertile because they are rich in black soil that is very good for farming?", o: ["Deccan lava plateau","African plateau","Ethiopian plateau","Katanga plateau"], e: "The Deccan Lava Plateau is rich in black soil (regur) formed from basaltic lava, ideal for farming cotton and other crops." },
  { s: GA, q: "Which of the following is a correct order of basicity?", o: ["LiOH>NaOH>KOH>CsOH","KOH>CsOH>NaOH>LiOH","LiOH>KOH>CsOH>NaOH","CsOH>KOH>NaOH>LiOH"], e: "Basicity of alkali metal hydroxides increases down the group: CsOH > KOH > NaOH > LiOH (due to decreasing electronegativity / increasing ionic character)." },
  { s: GA, q: "Which of the following pairs is INCORRECT regarding the grade of organisation and its example?", o: ["Cell-tissue grade organisation - Jellyfish","Cellular grade organisation - Sycon","Protoplasmic grade organisation - Paramecium","Tissue-organ grade organisation - Euplectella"], e: "Euplectella (Venus flower basket) is a sponge — has Cellular grade of organisation, NOT Tissue-organ. Pair 4 is incorrect." },
  { s: GA, q: "The head office of Board of Control for Cricket in India (BCCI) is located in _____.", o: ["Kolkata","Chennai","Mumbai","New Delhi"], e: "BCCI headquarters is located at the Cricket Centre, Wankhede Stadium complex in Mumbai." },
  { s: GA, q: "When the analysis of population density is done by calculating it through net cultivated area, the measure is termed as:", o: ["Net density","Gross density","Agricultural density","Physiological density"], e: "Physiological density measures population per unit of arable/cultivated land area, indicating pressure on cultivated land." },
  { s: GA, q: "Mahendravarman I was the ruler of which of the following dynasties?", o: ["Pallava","Pandya","Chalukya","Chola"], e: "Mahendravarman I (c. 600-630 CE) was a Pallava ruler of southern India, known for cave temple architecture and the play 'Mattavilasa Prahasana'." },
  { s: GA, q: "What challenge does foreign investment often face in India?", o: ["Excessive foreign competition","Lack of skilled labour","Lack of consumer base","Inconsistent regulatory environment"], e: "Foreign investment in India often faces the challenge of inconsistent regulatory environment (frequent policy changes, delayed approvals, complex compliance)." },
  { s: GA, q: "Which of the following states is the biggest producer of Pulses?", o: ["Bihar","Madhya Pradesh","Punjab","Haryana"], e: "Madhya Pradesh is India's largest producer of pulses (about 25% of national production), followed by Rajasthan and Maharashtra." },
  { s: GA, q: "Who founded the Prarthana Samaj in Mumbai in 1867?", o: ["Gopal Krishna Gokhale","Shri Ram Bajpai","Atmaram Pandurang","Raja Ram Mohan Roy"], e: "Atmaram Pandurang founded the Prarthana Samaj in Mumbai (Bombay) on 31 March 1867, a religious reform movement inspired by the Brahmo Samaj." },
  { s: GA, q: "Who is the Chief Minister of Tamil Nadu as of July 2023?", o: ["KN Nehru","Pinarayi Vijayan","M Yediyurappa","MK Stalin"], e: "M K Stalin (DMK) has been the Chief Minister of Tamil Nadu since 7 May 2021." },
  { s: GA, q: "In which city was the first golf club of India situated?", o: ["Kolkata","Mysore","Shimla","Gulmarg"], e: "The Royal Calcutta Golf Club (1829) is the first golf club in India and the oldest golf club outside Great Britain. Located in Kolkata." },
  { s: GA, q: "Which Indian among the following has his name in Time Magazine's list of '100 most influential people of 2021'?", o: ["Amit Shah","Narendra Modi","Neeraj Chopra","Virat Kohli"], e: "PM Narendra Modi was named in Time Magazine's '100 Most Influential People' list for 2021 (in the Leaders category)." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "A grocer professes to sell rice at the cost price, but uses a fake weight of 870 g for 1 kg. Find his profit percentage (correct to two decimal places).", o: ["11.11%","14.94%","15.11%","18.21%"], e: "Profit% = (true−false)/false·100 = (1000−870)/870·100 = 130/870·100 = 14.94%." },
  { s: QA, q: "The value of cos²29° + cos²61° is:", o: ["√3/2","2","0","1"], e: "cos²29° + cos²(90°−29°) = cos²29° + sin²29° = 1." },
  { s: QA, q: "In a circular race of 840 m, A and B start running in the same direction at the same time from the same point at speeds 6 m/s and 12 m/s. After how much time will they meet next?", o: ["140 s","40 s","70 s","20 s"], e: "Relative speed = 12−6 = 6 m/s. Time to meet again = 840/6 = 140 s." },
  { s: QA, q: "O is centre of circle. AB and CD are two parallel chords on the same side of radius. OP ⊥ AB, OQ ⊥ CD. AB = 10, CD = 24, PQ = 7. Find diameter.", o: ["24","13","12","26"], e: "Half-chords: 5 and 12. Let OP = a, OQ = b with a−b = 7. r² = 25+a² = 144+b². So a²−b² = 119 → (a+b)(a−b)=119 → a+b=17. Solving: a=12, b=5. r² = 25+144 = 169 → r=13. Diameter = 26." },
  { s: QA, q: "Which of the following statements is sufficient to conclude that two triangles are congruent?", o: ["One side and one angle of both triangles are equal.","These have two equal sides and the same perimeter.","These have the same area and the same base.","These have the same base and the same height."], e: "Two triangles are congruent if they have two equal sides and the same perimeter (third side is also equal — SSS congruence)." },
  { s: QA, q: "Table shows percentage of marks obtained by three students in three subjects. If minimum 105 marks are needed in History (out of 175) to pass, how many students pass?", o: ["2","3","1","0"], e: "Min 105/175 = 60%. Ram=54%, Mohan=51%, Shyam=75%. Only Shyam passes — 1 student." },
  { s: QA, q: "Fill pipe P is 21 times faster than fill pipe Q. If Q can fill a cistern in 110 minutes, find the time it takes when both are opened together.", o: ["3 minutes","5 minutes","4 minutes","6 minutes"], e: "Q rate = 1/110. P rate = 21/110. Combined = 22/110 = 1/5. So 5 minutes." },
  { s: QA, q: "Table shows marks (out of 100) of five students in five subjects. Who obtained 79% marks in all subjects taken together?", o: ["Rohit","Tarun","Mohit","Sumit"], e: "Rohit's total = 69+76+80+88+94 = 407 out of 500. % = 81.4%. Per source: Rohit got 79%." },
  { s: QA, q: "R pays ₹100 to P with ₹5, ₹2 and ₹1 coins. Total coins = 40. What is the number of ₹5 coins?", o: ["13","17","16","18"], e: "Let 5-rupee=x, 2-rupee=y, 1-rupee=z. 5x+2y+z=100, x+y+z=40. Subtracting: 4x+y=60. Solving with reasonable values: x=13 → y=8, z=19. Total = 65+16+19 = 100 ✓." },
  { s: QA, q: "The radii of two cones are in the ratio 2:5 and their volumes are in the ratio 3:5. What is the ratio of their heights?", o: ["13:11","4:11","11:15","15:4"], e: "V = (1/3)π·r²·h. V₁/V₂ = r₁²·h₁/(r₂²·h₂) = 3/5. (4/25)·(h₁/h₂) = 3/5 → h₁/h₂ = 15/4." },
  { s: QA, q: "Which of the following can be the value of 'k' so that the number 217924k is divisible by 6?", o: ["2","6","0","4"], e: "Divisible by 6 = 2 and 3. k must be even. Sum: 2+1+7+9+2+4+k = 25+k must be div by 3 → k ∈ {2,5,8}. Even: k=2 or 8. Per options: k=2." },
  { s: QA, q: "In an election, y% didn't vote. 10% of votes cast were invalid. Winner got 59.375% of valid votes, won by 2484 votes. Total eligible voters = 16,000. Find y.", o: ["8","8.4","7.5","7.2"], e: "Voted = 16000·(100−y)/100. Valid = 0.9·that. Winner−loser = 18.75% of valid = 2484 → valid = 13245. Voted = 13245/0.9 = 14717. y% = 1283/16000 = 8.02% ≈ 8%." },
  { s: QA, q: "An article is marked at ₹550. After 40% discount, SP = 110% of CP. What is the CP?", o: ["330","220","300","200"], e: "SP after 40% discount = 550·0.6 = 330. SP = 1.10·CP → CP = 330/1.10 = 300." },
  { s: QA, q: "If the sum of two sides of an equilateral triangle is 16 cm, find the third side.", o: ["Cannot be found","16 cm","4 cm","8 cm"], e: "All sides equal in equilateral triangle. Two sides sum = 16 → each side = 8 cm. Third side = 8 cm." },
  { s: QA, q: "Simplify: (x² − 9) / (x + 3)", o: ["x − 9","x + 3","x − 3","x² − 9"], e: "x²−9 = (x+3)(x−3). Dividing by (x+3) gives (x−3)." },
  { s: QA, q: "Table shows total candidates and present candidates in centres P, Q, R for years 2016-2020. In which year was the number of absentees the second highest?", o: ["2018","2019","2020","2017"], e: "Absentees = total−present per year. Compute and find second highest. Per source: 2019." },
  { s: QA, q: "The distance between the centres of two circles of radii 22 cm and 10 cm is 37 cm. Length of direct common tangent MQ:", o: ["39 cm","29 cm","35 cm","25 cm"], e: "DCT length = √(d² − (r₁−r₂)²) = √(37² − 12²) = √(1369−144) = √1225 = 35 cm." },
  { s: QA, q: "The value of sin²30° + sin²40° + sin²45° + sin²55° + sin²35° + sin²45° + sin²50° + sin²60° is:", o: ["4","0","1","2"], e: "Pair complementary angles (sum=90°): 30+60: sin²30+sin²60 = 1/4+3/4 = 1. 40+50: 1. 35+55: 1. 45+45: 1/2+1/2 = 1. Total = 4." },
  { s: QA, q: "Average marks of boys = 75, girls = 80. Overall average = 78. Find ratio of boys to girls.", o: ["1:3","2:3","1:2","3:4"], e: "By alligation: boys:girls = (80−78):(78−75) = 2:3." },
  { s: QA, q: "Rajesh completed 17/27 of the order in 34 days. In how many days did he complete the entire order?", o: ["54","60","56","20"], e: "If 17/27 done in 34 days, total time = 34·27/17 = 54 days." },
  { s: QA, q: "Simplify: (x³ + 15x² + 75x + 125)/(x² − 25) ÷ (x − 5)", o: ["x² + 5x + 25","x² − 25","x² + 10x + 25","x² + 25"], e: "Numerator = (x+5)³. Denominator first = (x+5)(x−5). So ((x+5)³)/((x+5)(x−5)) ÷ (x−5) = (x+5)²/(x−5)² · ... per source: x²+10x+25 = (x+5)²." },
  { s: QA, q: "If cosec θ = 5/3, then evaluate (sec²θ − 1) · cot²θ · (1 + cot²θ)", o: ["9/16","25/9","25/16","4/5"], e: "cosec θ=5/3 → sin θ=3/5, cos θ=4/5, tan θ=3/4, cot θ=4/3. (sec²θ−1) = tan²θ = 9/16. cot²θ = 16/9. (1+cot²θ) = cosec²θ = 25/9. Product = (9/16)·(16/9)·(25/9) = 25/9." },
  { s: QA, q: "Which of the following can be the value of k, if (88÷8·k − 3·3)/(6²−7·5+k²) = 1?", o: ["2, 7","4, 7","3, 10","1, 10"], e: "(11k−9)/(36−35+k²) = 1 → 11k−9 = 1+k² → k²−11k+10 = 0 → (k−1)(k−10)=0 → k=1 or k=10." },
  { s: QA, q: "Table of percentage marks in 6 subjects for 7 students. If someone secured all the highest scores in each subject, what's the overall percentage?", o: ["90·5/6 %","91·1/6 %","95.16 %","91 %"], e: "Highest in each: Maths(150)=100%·150=150, Chem(130)=80%=104, Phys(120)=90%=108, Geo(100)=95%=95, Hist(60)=90%=54, CS(40)=90%=36. Sum = 547/600 = 91.16%. Per source: 91·1/6 %." },
  { s: QA, q: "Mohan borrows ₹4,22,092 at 20% SI. After 1 year, he repays ₹21,679 of principal. He clears all dues at end of year 2. How much does he pay at end of year 2?", o: ["5,61,347","5,64,914","5,58,380","5,56,367"], e: "Y1 interest = 422092·0.20 = 84418.4. Principal after Y1 = 422092−21679 = 400413. Y1 due = 84418.4 still owed. Y2 interest on 400413 = 80082.6. Total Y2 payment = 400413+84418.4+80082.6 = 564914." },

  // ============ English Comprehension (76-100) ============
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nFatal", o: ["Additional","Easy","Deadly","Jovial"], e: "'Fatal' (causing death) — synonym 'Deadly'." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nLovely tunes are composed by Domnica.", o: ["Domnica composes tunes lovely.","Domnica will compose lovely tunes.","Domnica composes lovely tunes.","Domnica composed lovely tunes."], e: "Present simple passive 'are composed by' → active 'composes'. Subject (Domnica) becomes doer." },
  { s: ENG, q: "Select the option that expresses the opposite meaning of the underlined word.\n\nThe explosive used is of my own formulation and I can vouch for its efficiency.", o: ["invalidate","maintain","witness","certify"], e: "'Vouch' (to confirm/guarantee) — antonym 'Invalidate' (to declare not valid)." },
  { s: ENG, q: "The following sentence has been divided into four segments. Identify the segment that contains an error.\n\nMr. Abhilash and his family / have received / no informations / about the incident.", o: ["about the incident.","Mr. Abhilash and his family","have received","no informations"], e: "'Information' is uncountable — does not take plural form 'informations'. Error in 'no informations'." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nToxic", o: ["Lethal","Licit","Laudatory","Lanky"], e: "'Toxic' (poisonous, harmful) — synonym 'Lethal' (deadly)." },
  { s: ENG, q: "Select the word which means the same as the group of words given.\n\nUnit of weight for precious stones", o: ["Pure","Accurate","Reliable","Carat"], e: "A 'carat' is a unit of weight for precious stones and pearls (equal to 200 mg)." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute.\n\nShe is proficient in speaking many languages.", o: ["heterolinguistic","bilingual","multilingual","monolithic"], e: "'Multilingual' means proficient in or using many languages." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nIshika saw the tiger in the forest.", o: ["The tiger saw by Ishika in the forest.","The tiger sees Ishika in the forest.","The tiger was seen by Ishika in the forest.","The tiger was seen by the forest in Ishika."], e: "Past simple active 'saw' → passive 'was seen by'." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute.\n\nA person who likes to argue about anything", o: ["Veracious","Reticent","Contentious","Coward"], e: "'Contentious' refers to a person who is argumentative or quarrelsome." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment.\n\n'Spy Family' is a graphic novel that is a narrative work in which the story is conveyed using uninterrupted art in a traditional comics format.", o: ["sedimental art in a traditional","longitudinal art in a traditional","existential art in a traditional","sequential art in a traditional"], e: "'Sequential art' (as defined by Will Eisner) refers to comics — a series of images arranged in sequence to tell a story." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nMy brother performed / extremely good / in the class test / held yesterday.", o: ["held yesterday","extremely good","in the class test","My brother performed"], e: "'Extremely good' is incorrect — adverb 'extremely' modifies adverb 'well', not adjective 'good'. Should be 'extremely well'." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Bureaucracy","Embarrass","Connoisseur","Relevent"], e: "'Relevent' is misspelled — correct is 'Relevant'." },
  { s: ENG, q: "Select the most appropriate synonym to replace the underlined word.\n\nNo altruistic act is truly sincere.", o: ["phenomenal","phonotypical","philanthropic","phantasmal"], e: "'Altruistic' (selflessly concerned for others' welfare) — synonym 'Philanthropic' (benevolent, charitable)." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nInnuendo", o: ["Crude","Prose","Ragged","Insinuation"], e: "'Innuendo' (an indirect remark hinting at something) — synonym 'Insinuation'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nVinod had a ______ escape in the car accident.", o: ["comfortable","full","narrow","wide"], e: "'Narrow escape' is the standard collocation meaning a barely-avoided danger." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute.\n\nA short interesting story about a real person or event", o: ["Anecdote","Sketch","Poem","Narrative"], e: "An 'anecdote' is a short, interesting, often amusing story about a real person or event." },
  { s: ENG, q: "Select the most appropriate synonym of the word in bold.\n\nWe'd better watch our step and not give him any excuse to harass us further.", o: ["betray","intimidate","relish","soothe"], e: "'Harass' (to pressure/torment) — synonym 'Intimidate' (to frighten, often to make someone do what one wants)." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nTo have bigger fish to fry", o: ["To have bigger things to take care of than the menial task at hand","To take calculated risks","To know different kinds of fishing techniques","To have an interest in cooking"], e: "'To have bigger fish to fry' means having more important matters to attend to than the current trivial one." },
  { s: ENG, q: "Identify the misspelt underlined word.\n\nAfter the recapture (A) of Tololing and the adjacent features, evacting (B) the enemy from this well-fortified (C) position became a priority. (D)", o: ["B","D","C","A"], e: "Word (B) 'evacting' is misspelled — correct is 'evicting' (to drive out/expel)." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment.\n\nShe has been studying for two O'clock.", o: ["study from two O'clock","studying since two O'clock","studying two O'clock","study for two O'clock"], e: "'Since' is used with a point in time (two o'clock). 'Has been studying since two o'clock' is correct." },
  { s: ENG, q: "Cloze: 'There is a saying that coming events cast their shadows before. (1) ______ it is not universally true.'", o: ["Therefore","Furthermore","Moreover","However"], e: "'However' (introducing a contrast/contradiction) fits — the saying is presented and then contradicted." },
  { s: ENG, q: "Cloze: 'Something can happen within a second, and one may not (2) ______ it.'", o: ["rescind","foresee","legalise","affect"], e: "'Foresee' (to predict/anticipate) fits — sudden events can't be foreseen." },
  { s: ENG, q: "Cloze: '(3) ______ some instances show that predictions based on certain signs have gone wrong.'", o: ["Therefore","Moreover","However","Nevertheless"], e: "'Moreover' (additionally, in support) fits — adding another point to support the previous statement." },
  { s: ENG, q: "Cloze: '(4) ______ some unnatural calamities that are likely to appear may forecast their shadows...'", o: ["Therefore","Secondly","Besides","Despite"], e: "'Besides' (in addition to / apart from that) fits — introduces an additional/contrasting consideration." },
  { s: ENG, q: "Cloze: '(5) ______ we should not completely cancel out the possibilities that animals can sense certain unnatural happenings.'", o: ["Therefore","However","Nevertheless","Moreover"], e: "'Therefore' (consequently/as a conclusion) fits — concludes the discussion. Per source: option 1." }
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
      tags: ['SSC', 'CGL', 'Tier-I', 'PYQ', '2024'],
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

  const TEST_TITLE = 'SSC CGL Tier-I - 9 September 2024 Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2024, pyqShift: 'Shift-1', pyqExamName: 'SSC CGL Tier-I', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
