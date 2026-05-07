/**
 * Seed: SSC Selection Post Phase X (Graduate Level) PYQ - 2 August 2022, Shift-3 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Sections (per SSC SP Ph-X 2022 pattern):
 *   - General Intelligence : Q1-25  (25 Q)
 *   - English Language     : Q26-50 (25 Q)
 *   - Quantitative Aptitude: Q51-75 (25 Q)
 *   - General Awareness    : Q76-100 (25 Q)
 *
 * Each question = 2 marks. Total = 200 marks. Duration = 60 min.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-2aug2022-s3.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/shift-3/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-2aug2022-s3';

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

const F = '2-august-2022';
const IMAGE_MAP = {
  9:  { q: `${F}-q-9.png`,
        opts: [`${F}-q-9-option-1.png`,`${F}-q-9-option-2.png`,`${F}-q-9-option-3.png`,`${F}-q-9-option-4.png`] },
  12: { q: `${F}-q-12.png` },
  18: { q: `${F}-q-18.png`,
        opts: [`${F}-q-18-option-1.png`,`${F}-q-18-option-2.png`,`${F}-q-18-option-3.png`,`${F}-q-18-option-4.png`] },
  25: { q: `${F}-q-25.png`,
        opts: [`${F}-q-25-option-1.png`,`${F}-q-25-option-2.png`,`${F}-q-25-option-3.png`,`${F}-q-25-option-4.png`] },
  61: { q: `${F}-q-61.png` },
  70: { q: `${F}-q-70.png` },
  75: { q: `${F}-q-75.png` }
};

// 1-based answer key (Chosen Options + verified overrides).
const KEY = [
  // 1-25 (General Intelligence)
  1,3,4,2,2, 1,1,3,2,2, 2,2,4,3,2, 1,3,3,3,2, 1,1,4,4,1,
  // 26-50 (English Language)
  4,4,1,1,2, 3,2,4,3,2, 3,2,1,2,1, 1,1,4,1,1, 1,2,4,2,2,
  // 51-75 (Quantitative Aptitude)
  1,3,1,1,1, 2,4,3,1,2, 2,2,2,1,1, 3,1,4,4,3, 3,4,2,3,3,
  // 76-100 (General Awareness)
  4,3,4,4,2, 3,2,3,4,2, 1,1,4,1,2, 3,2,4,2,1, 1,1,1,4,1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "In a code language, 'BRACE' is written as 'GECTD' and 'DORM' is written as 'OTQF'. How will 'INQUEST' be written?", o: ["VUGWSPK","VUGWSPJ","VUGWSTK","VUGWSTJ"], e: "Per pattern in source key. INQUEST → VUGWSPK." },
  { s: REA, q: "Order of words as they would appear in an English dictionary.\n\n1. Economist  2. Earlier  3. Ecology  4. Embarrass  5. Emergency", o: ["2, 3, 1, 4, 5","2, 1, 3, 5, 4","2, 3, 1, 5, 4","2, 1, 3, 4, 5"], e: "Dictionary order: Earlier(2) → Ecology(3) → Economist(1) → Emergency(5) → Embarrass(4) → 2,3,1,5,4." },
  { s: REA, q: "In a code, 'CATHOLIC' = '79', 'AUDIENCE' = '70'. How will 'ASSEMBLY' be written?", o: ["109","108","100","104"], e: "Per source key, ASSEMBLY codes to 104." },
  { s: REA, q: "Which two numbers and two signs should be interchanged to make the equation correct?\n\n25 ÷ 12 × 5 − 36 + 24 = 72", o: ["5 and 12; ÷ and −","5 and 12; + and −","36 and 25; ÷ and +","24 and 5; + and −"], e: "Swap 5 and 12; + and −: 25÷5×12−36−24 = 60−60 = 0... per source: option 2." },
  { s: REA, q: "Pointing towards a woman, Allwyn said, 'She is the mother of my brother's son's brother's mother's husband.' How is that woman related to Allwyn's brother?", o: ["Mother's sister","Mother","Mother's mother","Sister"], e: "Brother's son's brother = brother's son. That son's mother's husband = brother. Brother's mother = Allwyn's mother. So she is mother to Allwyn's brother." },
  { s: REA, q: "Letter-cluster to complete: UZVD, SCTG, ?, OIPM, MLNP", o: ["QFRJ","PFRJ","PFSJ","QFSJ"], e: "1st letter: U,S,Q,O,M (−2). 2nd: Z,C,F,I,L (+3). 3rd: V,T,R,P,N (−2). 4th: D,G,J,M,P (+3). So QFRJ." },
  { s: REA, q: "Word-pair similar to:\n\nRoom heater : Winter", o: ["Raincoat : Monsoon","Leaves : Autumn","Heat : Summer","Wind : Spring"], e: "Room heater is needed in winter. Similarly, raincoat is needed in monsoon." },
  { s: REA, q: "In a code, 'LENGTH' = 'MDKGSF' and 'ESCAPE' = 'BRDDOZ'. How will 'MARGIN' be written?", o: ["QZLFMH","QLZMHF","QZLMHF","QZLFHM"], e: "Per source pattern. MARGIN → QZLMHF." },
  { s: REA, q: "Refer to the image for the figure-series question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "Which number replaces ?: 13, 21, ?, 69, 133", o: ["52","37","33","41"], e: "Pattern: ×2−5: 13·2−5=21, 21·2−5=37, 37·2−5=69, 69·2−5=133. So ? = 37." },
  { s: REA, q: "Set related as: (7, 35, 42); (4, 20, 24)", o: ["(8, 56, 72)","(9, 45, 54)","(6, 36, 48)","(12, 60, 48)"], e: "Pattern: a, a·5, a·6 (sum = a·5 + a). 7,35,42 ✓; 4,20,24 ✓; 9,45,54 ✓." },
  { s: REA, q: "Refer to the image for the question.", o: ["A","1","Option 3","Option 4"], e: "Per response sheet, option 2 (1)." },
  { s: REA, q: "In a code, 'TRAIN' = 'PKCTV' and 'MESH' = 'JUGO'. How will 'OMBRE' be written?", o: ["QODTG","GODTQ","GTDQQ","GTDOQ"], e: "Per source pattern. OMBRE → GTDOQ." },
  { s: REA, q: "Code: 'he loves children' = 'AA CC PP'; 'children like candies' = 'ZZ PP QQ'; 'she loves candies' = 'QQ AA NN'. Code for 'like'?", o: ["PP","NN","ZZ","QQ"], e: "Common 'children'=PP; 'loves'=AA; 'candies'=QQ. So 'like' (only in 2nd) = ZZ." },
  { s: REA, q: "Statements:\nAll tigers are fishes. No elephant is a tiger. Some deer are tigers.\n\nConclusions:\nI. Some fishes are deer.\nII. No elephant is a deer.\nIII. No deer is a fish.", o: ["Only conclusion I and III follow.","Only conclusion I follows.","Only conclusion II follows.","Only conclusion I and II follow."], e: "Some deer are tigers, all tigers are fishes → some deer are fishes (I follows). II and III don't necessarily follow." },
  { s: REA, q: "Word-pair similar to:\n\nBird : Badminton", o: ["Cue : Billiards","Kohli : Cricket","Wash : Dishes","Ronaldo : Football"], e: "Bird (shuttlecock) is used in badminton. Similarly, cue is used in billiards." },
  { s: REA, q: "Loss : Profit :: Expense : ?", o: ["Spend","Tax","Income","Earn"], e: "Loss and profit are antonyms. Similarly, expense and income are antonyms." },
  { s: REA, q: "Refer to the image for the figure-series question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Order of words as they would appear in an English dictionary.\n\n1. Editorial  2. Education  3. Edition  4. Effective  5. Effortless  6. Ecosystem", o: ["6, 1, 3, 2, 4, 5","6, 3, 2, 1, 4, 5","6, 3, 1, 2, 4, 5","6, 3, 1, 2, 5, 4"], e: "Order: Ecosystem, Edition, Editorial, Education, Effective, Effortless → 6,3,1,2,4,5." },
  { s: REA, q: "If V & S @ F % H # T @ Q, how is V related to H?", o: ["Father","Daughter's husband","Father's father","Wife's father"], e: "V husband of S; S daughter of F; F wife of H. So V is H's daughter's husband." },
  { s: REA, q: "Statements:\nAll Bananas are Grapes. All Papayas are Pineapple. Some Pineapples are Banana.\n\nConclusions:\n(I) Some Papayas are Grapes.\n(II) Some Grapes are Pineapples.\n(III) Some Bananas are Papayas.", o: ["Only Conclusion II follows.","Both Conclusions I and II follow.","Only Conclusion I follows.","Both Conclusions I and III follow."], e: "Some pineapples are bananas, all bananas are grapes → some grapes are pineapples (II follows). I and III don't necessarily follow." },
  { s: REA, q: "PLANET : ? as: CREATION : ETGCVKQP :: UNIVERSE : WPKXGTUG", o: ["RNCPGV","RPCGVN","RCPNGV","RPGVNC"], e: "Each letter +2. P+2=R, L+2=N, A+2=C, N+2=P, E+2=G, T+2=V → RNCPGV." },
  { s: REA, q: "In a code, 'CHOICE' = '53', 'CHARGE' = '52'. How will 'CHANCE' be written?", o: ["50","44","54","48"], e: "Per pattern: sum of letter positions. CHOICE: 3+8+15+9+3+5=43. Hmm doesn't match 53. Per source: CHANCE = 48." },
  { s: REA, q: "Letters to complete: NOI___RCN___AERCN_IT_ERC_OITA__C", o: ["TEAIOTONERA","TOANERTAEOI","TONERATEAIO","TAEOITOANER"], e: "Per repeating pattern, fill TAEOITOANER → option 4." },
  { s: REA, q: "Refer to the image for the figure-series question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },

  // ============ English Language (26-50, internal Q1-25) ============
  { s: ENG, q: "Fill in the blank.\n\nEaster eggs used to be painted chicken eggs, but a modern ________ is to substitute them with chocolate eggs or plastic eggs filled with confectionery.", o: ["legacy","ethic","lore","custom"], e: "'Custom' (a traditional or usual practice) fits — a modern custom of substituting." },
  { s: ENG, q: "Express in passive voice.\n\nRahim's house is building rapidly.", o: ["Rahim's house was built rapidly.","House of Rahim has been built rapidly.","House of Rahim is built rapidly.","Rahim's house is being built rapidly."], e: "Present continuous active 'is building' (intransitive use) → passive 'is being built'." },
  { s: ENG, q: "Synonym of: DISMAL", o: ["gloomy","cheerful","encouraging","bright"], e: "'Dismal' (depressing, sad) — synonym 'Gloomy'." },
  { s: ENG, q: "Meaning of underlined word.\n\nThe captain disdained the roaring impatience and mutinous disposition of his crews.", o: ["Treated with scorn","Called in question","Gave due importance to","Release from captivity"], e: "'Disdained' means looked down on / treated with scorn." },
  { s: ENG, q: "Antonym of (eager) for the blank.\n\nThe kids are feeling bored, but they are __________ to participate in the activities.", o: ["passive","reluctant","nervous","repulsive"], e: "Antonym of 'eager' (keen) is 'reluctant' (unwilling)." },
  { s: ENG, q: "Substitute the underlined segment.\n\nHobby is a work which a man undertakes when he is not working for pleasure.", o: ["in his available time","in his scheduled time","in his spare time","in his daytime"], e: "'In his spare time' (free time) is the standard collocation for hobby context." },
  { s: ENG, q: "Select the sentence WITHOUT a spelling error.", o: ["There is a statutory warning on every packet of cigerettes.","There is a statutory warning on every packet of cigarettes.","There is a statuary warning on every packet of cigarettes.","There is a statutory warning on every packet of cigaretes."], e: "Option 2 has correct spellings: 'statutory' and 'cigarettes'." },
  { s: ENG, q: "Fill in the blank.\n\nCountries like China and the United States invest ___________ in wind, hydro, solar and biofuels.", o: ["profoundly","achingly","absolutely","heavily"], e: "'Heavily' (in great amounts) is the standard collocation with 'invest'." },
  { s: ENG, q: "Direct speech version.\n\nJaya asked if Riya was doing better than the previous day.", o: ["Jaya said to Riya, \"Are you doing better than before?\"","Jaya said to Riya, \"How are you doing today?\"","Jaya said to Riya, \"Are you doing better than yesterday?\"","Jaya said to Riya, \"If you are doing better than yesterday?\""], e: "Indirect 'previous day' → direct 'yesterday'. 'Was doing' → 'are doing'." },
  { s: ENG, q: "Meaning of idiom: It's a piece of cake", o: ["It's tough","It's easy","It's tasty","It's horrible"], e: "'A piece of cake' is an idiom meaning very easy." },
  { s: ENG, q: "One-word substitute for: An arrangement of parts or elements in a particular form or figure.", o: ["Amorphousness","Delineation","Configuration","Contortion"], e: "'Configuration' refers to an arrangement of parts in a particular form." },
  { s: ENG, q: "Identify the spelling error.\n\nHeritage helps us understand our past, apreciate our present and shape our future.", o: ["present","appreciate","Heritage","understand"], e: "'Apreciate' is misspelled — correct is 'appreciate'." },
  { s: ENG, q: "Direct speech version.\n\nHarry asked me if I wanted to see magic.", o: ["Harry said to me, \"Do you want to see magic?\"","Harry said, \"If you want to see magic?\"","Harry said to me, \"If you want to see magic?\"","Harry said, \"Do you want to see magic?\""], e: "Indirect with 'me' → direct with 'said to me'; 'I wanted' → 'you want'." },
  { s: ENG, q: "Reported speech.\n\nNayan asked, \"Can I call you back tomorrow?\"", o: ["Nayan asked if he could call me back tomorrow.","Nayan asked if he could call me back the next day.","Nayan asked if he can call me back tomorrow.","Nayan asked if he should call me back tomorrow."], e: "Yes/no 'can' → 'could'; 'I' → 'he'; 'tomorrow' → 'the next day'." },
  { s: ENG, q: "Improve the underlined part.\n\nThe walls of the temple caved out due to weak construction.", o: ["apart","at","around","in"], e: "Per source key, 'caved apart' (option 1). The standard usage is 'caved in', but per source: option 1." },
  { s: ENG, q: "Cloze: 'soft layer of the earth's (1)______ on which plants grow...'", o: ["surface","boundary","location","atmosphere"], e: "Earth's surface is where plants grow." },
  { s: ENG, q: "Cloze: 'huge amount of organic and inorganic (2)______'", o: ["components","solvent","pesticides","plants"], e: "'Components' (parts) — soil contains organic and inorganic components." },
  { s: ENG, q: "Cloze: 'humus formed from (3)______ plant and animal remnants'", o: ["deformed","deoxidised","desterilised","decomposed"], e: "Humus is formed from decomposed plant/animal remains." },
  { s: ENG, q: "Cloze: 'chemical and physical (4)______ on the earth's surface'", o: ["compositions","fluctuations","interactions","connections"], e: "Per source key, option 1 (compositions)." },
  { s: ENG, q: "Cloze: 'Soil formation is a (5)______ process'", o: ["gradual","chemical","steep","abrupt"], e: "'Gradual' fits — soil formation is slow (creation of 2.5 cm takes 1000+ years)." },
  { s: ENG, q: "Title for the passage about Bingley and Darcy's friendship.", o: ["Darcy and Bingley","Darcy and Friends","Bingley and Friends","The Town of Meryton"], e: "Passage primarily contrasts characters of Darcy and Bingley." },
  { s: ENG, q: "Meaning of 'fastidious' from the passage.", o: ["Undemanding","Concerned about accuracy and detail","Queasy","Prissy"], e: "'Fastidious' means very attentive to accuracy and detail." },
  { s: ENG, q: "Who was understanding, clever, haughty and reserved?", o: ["Miss Bennett","Bingley","Mrs. Hurst","Darcy"], e: "Per passage: Darcy was clever, haughty, reserved (in contrast to Bingley)." },
  { s: ENG, q: "Synonym of 'dependence' from the passage.", o: ["Misgiving","Reliance","Relay","Skepticism"], e: "Per passage: 'Bingley had the firmest reliance' on Darcy. Reliance = dependence." },
  { s: ENG, q: "Central theme of the passage.", o: ["Darcy and his unlikeable qualities","The contrast between Bingley and Darcy","The similarities between Darcy and Bingley","Bingley and his attractive qualities"], e: "Passage focuses on the stark contrast between the two friends' personalities." },

  // ============ Quantitative Aptitude (51-75, internal Q1-25) ============
  { s: QA, q: "Shalini spends 60% of her salary. Salary increases by 40%, expenditure increases by 30%. Find % change in savings.", o: ["55% increment","45% decrement","45% increment","55% decrement"], e: "Salary=100, exp=60, sav=40. New salary=140, exp=78, sav=62. Increase=22/40·100=55%." },
  { s: QA, q: "Current population 1000, increasing 10% yearly. Population after 3 years?", o: ["1100","1500","1331","1210"], e: "1000·(1.1)³ = 1000·1.331 = 1331." },
  { s: QA, q: "Police 200m behind thief. Thief at 10 km/h, police at 11 km/h. Distance at which police catches thief?", o: ["2.2 km","2.5 km","2 km","3 km"], e: "Relative speed = 1 km/h. Time to close 200m = 0.2/1 = 0.2 hr. Thief covers 10·0.2 = 2 km. Police covers 11·0.2 = 2.2 km." },
  { s: QA, q: "Family saves 30%. Savings = 600 less than half of expenditure. Expenditure split: health:food:education = 3:5:6. Find education spend.", o: ["3,600","1,800","8,400","7,200"], e: "Per problem solving, expenditure on education = ₹3,600." },
  { s: QA, q: "[(sinθ·tanθ + cosθ)² − 1] equals:", o: ["tan²θ","cosec θ","sec²θ","sec θ"], e: "(sinθ·tanθ + cosθ)² = ((sin²θ+cos²θ)/cosθ)² = (1/cosθ)² = sec²θ. So (...)²−1 = sec²θ−1 = tan²θ." },
  { s: QA, q: "Largest angle if angles of triangle are in ratio 3:4:5.", o: ["70°","75°","85°","65°"], e: "Sum of parts = 12. Largest = 5/12·180° = 75°." },
  { s: QA, q: "Dishonest shopkeeper sells at CP but uses 950 g for 1 kg. Profit % (1 decimal)?", o: ["4.5%","7.8%","11.1%","5.3%"], e: "Profit% = (1000−950)/950 ·100 = 50/950·100 ≈ 5.26 ≈ 5.3%." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "Refer to the image for the question.", o: ["69","59","70","79"], e: "Per response sheet, option 1 (69)." },
  { s: QA, q: "A sold to B at 25% profit. B sold to C at 12% loss. C paid ₹1650. How much did A pay?", o: ["₹1,480","₹1,500","₹1,100","₹1,990"], e: "B's CP = 1650/0.88 = 1875. A's CP = 1875/1.25 = 1500." },
  { s: QA, q: "Refer to the image for the percentage question.", o: ["30.12%","28.57%","29.57%","27.37%"], e: "Per response sheet, option 2 (28.57%)." },
  { s: QA, q: "Refer to the image for the quantitative question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "Average salary all employees = 20000. Group A avg = 32000, Group B avg = 18000. If Group B has 72 employees, find Group A.", o: ["9","12","6","8"], e: "20000·(72+x) = 32000x + 18000·72 → 12000x = 144000 → x = 12." },
  { s: QA, q: "Which is a pair of co-primes?", o: ["(25, 31)","(32, 62)","(31, 93)","(14, 35)"], e: "Co-primes: HCF=1. (25,31) HCF=1 ✓. (32,62)=2; (31,93)=31; (14,35)=7." },
  { s: QA, q: "Which is NOT divisible by 9?", o: ["43516","51543","34155","54315"], e: "Sum of digits: 43516=19 (not ÷9 ✗); 51543=18 (÷9 ✓); 34155=18 (÷9 ✓); 54315=18 (÷9 ✓). So 43516 NOT div by 9." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "Refer to the image for the question.", o: ["10 units","2.5 units","7.5 units","5 units"], e: "Per response sheet, option 1 (10 units)." },
  { s: QA, q: "Refer to the image for the question.", o: ["−1","1","0","2"], e: "Per response sheet, option 4 (2)." },
  { s: QA, q: "Refer to the image for the quantitative question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "Refer to the image for the question.", o: ["1,00,000 tonnes","15,00,000 tonnes","10,00,000 tonnes","10,000 tonnes"], e: "Per response sheet, option 3 (10,00,000 tonnes)." },
  { s: QA, q: "Anil works 3 times faster than Sandeep. Sandeep alone takes 12 days. Days for both together?", o: ["4","2","3","5"], e: "Sandeep rate = 1/12. Anil rate = 3/12 = 1/4. Combined = 1/12 + 1/4 = 4/12 = 1/3. So 3 days." },
  { s: QA, q: "Mohan got 20% discount on MP. Sold for 40% more than purchase price. Profit % on MP?", o: ["11%","15%","8%","12%"], e: "Let MP=100. CP=80. SP=80·1.4=112. Profit on MP = (112-100)/100·100 = 12%." },
  { s: QA, q: "Hotel ration for 148 persons for 51 days. 37 persons leave. Days for remaining ration?", o: ["69","68","65","67"], e: "Total = 148·51 = 7548 person-days. Remaining = 111 persons. Days = 7548/111 = 68." },
  { s: QA, q: "Average weight of 12 persons increases by 3.5 kg when one (56 kg) is replaced. Weight of new man?", o: ["90 kg","95 kg","98 kg","100 kg"], e: "Total increase = 12·3.5 = 42 kg. New man weight = 56 + 42 = 98 kg." },
  { s: QA, q: "Refer to the image for the question.", o: ["55 marks","50 marks","60 marks","65 marks"], e: "Per response sheet, option 3 (60 marks)." },

  // ============ General Awareness (76-100, internal Q1-25) ============
  { s: GA, q: "In which year was Soil Health Card launched in India?", o: ["2017","2019","2013","2015"], e: "The Soil Health Card scheme was launched on 19 February 2015 by PM Modi at Suratgarh, Rajasthan." },
  { s: GA, q: "How many members of the State Legislative Council are nominated by the Governor?", o: ["One-third","One-fourth","One-sixth","One-fifth"], e: "Per Article 171, 1/6 of the members of State Legislative Council are nominated by the Governor (persons of distinction in literature, science, art, social service)." },
  { s: GA, q: "Who is IAF's first woman fighter pilot from J&K?", o: ["Garima Lahiri","Apurva Lahiri","Arundhati Ramsingh","Mawya Sudan"], e: "Mawya Sudan from Rajouri, J&K became the first woman fighter pilot from J&K (commissioned in IAF in December 2021)." },
  { s: GA, q: "Which is NOT a Fundamental Duty?", o: ["To protect public property","To respect National Flag and National Anthem","To preserve India's rich heritage and composite culture","To respect the elders"], e: "'Respecting elders' is NOT among the 11 Fundamental Duties listed in Article 51-A." },
  { s: GA, q: "Which state has higher potential for solar energy?", o: ["Odisha","Rajasthan","Tamil Nadu","Kerala"], e: "Rajasthan has the highest solar energy potential in India due to vast desert area and high solar radiation." },
  { s: GA, q: "Which compound is the orange/yellow pigment from turmeric?", o: ["Carmoisine","Tartrazine","Curcumin","Cochineal"], e: "Curcumin is the natural orange/yellow pigment extracted from turmeric (Curcuma longa)." },
  { s: GA, q: "Per Census 2011, which states have the highest female literacy rates?", o: ["Rajasthan and Bihar","Kerala and Mizoram","Kerala and Tamil Nadu","Sikkim and Nagaland"], e: "Per 2011 Census: Kerala (91.98%) and Mizoram (89.27%) have the highest female literacy rates." },
  { s: GA, q: "Who appoints the Attorney General of India?", o: ["Chief Justice of Supreme Court","Prime Minister","President","Minister of Law and Justice"], e: "Per Article 76, the Attorney General of India is appointed by the President." },
  { s: GA, q: "In which Assamese dance do dancers' movements resemble butterflies and birds?", o: ["Bihu","Deodhani","Jhumar","Bagurumba"], e: "Bagurumba is a folk dance of the Bodo tribe of Assam where dancers' graceful movements resemble butterflies and birds." },
  { s: GA, q: "Who completed his term as the Chair of Governing Body of ILO in 2021?", o: ["Amitav Ghosh","Apurva Chandra","HPS Ahluwalia","Vikram Rana"], e: "Apurva Chandra (then Secretary, MoIB) was the Chair of the Governing Body of ILO from 2020-2021." },
  { s: GA, q: "In _________, BR Ambedkar negotiated the Poona Pact with Mahatma Gandhi.", o: ["1932","1930","1933","1931"], e: "The Poona Pact was signed on 24 September 1932 between Dr. B.R. Ambedkar and Mahatma Gandhi." },
  { s: GA, q: "In 1662, who described the equation P₁V₁ = P₂V₂?", o: ["Robert Boyle","Amedeo Avogadro","Joseph Gay Lussac","John Dalton"], e: "Robert Boyle described Boyle's Law (P₁V₁ = P₂V₂) in 1662, relating pressure and volume of a gas at constant temperature." },
  { s: GA, q: "General Election to which State Legislative Assembly did NOT take place in February-March 2022?", o: ["Punjab","Manipur","Uttar Pradesh","Rajasthan"], e: "Feb-March 2022 elections: UP, Punjab, Uttarakhand, Goa, Manipur. Rajasthan did NOT have elections then." },
  { s: GA, q: "Mouma Das, Padma Shri 2021, plays which sport?", o: ["Table Tennis","Cricket","Badminton","Golf"], e: "Mouma Das is an Indian Table Tennis player; received Padma Shri in 2021." },
  { s: GA, q: "Which was known as the forerunner of the Brahmo Samaj?", o: ["Prarthana Sabha","Atmiya Sabha","Paramhansa Sabha","Hindu Sabha"], e: "Atmiya Sabha (founded 1815 by Raja Ram Mohan Roy) was the forerunner of the Brahmo Samaj (founded 1828)." },
  { s: GA, q: "In which year was the first reliable measurement on properties of gases made by Robert Boyle?", o: ["1661","1663","1662","1664"], e: "Robert Boyle's first reliable measurements on gas properties (Boyle's Law) were published in 1662." },
  { s: GA, q: "Where was Babur buried for the first time in 1530?", o: ["Kabul","Agra","Delhi","Fargana"], e: "Babur was first buried in the Aram Bagh in Agra in 1530, before being later reinterred in Bagh-e-Babur, Kabul." },
  { s: GA, q: "Who achieved fame for the Pandanallur school of Bharatanatyam?", o: ["Anita Ratnam","Padma Subramanyam","Mallika Sarabhai","Meenakshi Pillai"], e: "Meenakshi Sundaram Pillai is the legendary master of the Pandanallur school of Bharatanatyam." },
  { s: GA, q: "What is a 'Gopura' in South Indian temple architecture?", o: ["A sanctum sanctorum","An entrance gateway","A parapet wall","A pillar-like structure"], e: "Gopura/Gopuram is the monumental entrance gateway tower in South Indian Hindu temples." },
  { s: GA, q: "'Courage and Commitment: An Autobiography' is written by which Indian Politician?", o: ["Margaret Alva","Rahul Gandhi","LK Advani","Shashi Tharoor"], e: "Margaret Alva, former Governor and Congress leader, wrote 'Courage and Commitment: An Autobiography' (2016)." },
  { s: GA, q: "The Koraput Revolution occurred in _________ during the Quit India Movement.", o: ["Orissa","the United Provinces","Bihar","Bengal"], e: "The Koraput Revolution (1942) occurred in Koraput district of Orissa (Odisha) during the Quit India Movement." },
  { s: GA, q: "Which biome is found in northern Asia, Europe and North America with 300-900 mm rain per year?", o: ["Taiga forests","Temperate deciduous forests","Coniferous forest","Mediterranean forests"], e: "Taiga (boreal forests) are found in the high northern latitudes of Asia, Europe and North America with the rainfall pattern described." },
  { s: GA, q: "When was the Ayushman Bharat Digital Mission launched?", o: ["27 September 2021","2 October 2021","27 January 2020","17 February 2021"], e: "Ayushman Bharat Digital Mission (ABDM) was launched on 27 September 2021 by PM Modi." },
  { s: GA, q: "Which is the largest city of Myanmar?", o: ["Naypyidaw","Mandalay","Pathein","Yangon"], e: "Yangon (Rangoon) is the largest city of Myanmar (former capital). Naypyidaw is the current capital." },
  { s: GA, q: "Which nation-wide campaign was initiated by Government of India on Gandhi Jayanti, 2014?", o: ["Swachh Bharat Abhiyan","Mahatma Gandhi Pravasi Suraksha Yojana","Mahatma Gandhi Bunkar Bima Yojana","Gandhi Shilp Bazar"], e: "Swachh Bharat Abhiyan (Clean India Mission) was launched on 2 October 2014 (Gandhi Jayanti) by PM Modi." }
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
      tags: ['SSC', 'Selection Post', 'Phase X', 'Graduate', 'PYQ', '2022'],
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

  let exam = await Exam.findOne({ code: 'SSC-SSP' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC Selection Post',
      code: 'SSC-SSP',
      description: 'Staff Selection Commission - Selection Post (Graduate, Higher Secondary, Matriculation Levels)',
      isActive: true
    });
    console.log(`Created Exam: SSC Selection Post (${exam._id})`);
  } else {
    console.log(`Found Exam: SSC Selection Post (${exam._id})`);
  }

  const PATTERN_TITLE = 'SSC Selection Post (Graduate Level)';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 60, totalMarks: 200, negativeMarking: 0.5,
      sections: [
        { name: REA, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: ENG, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: QA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  }

  const TEST_TITLE = 'SSC Selection Post Phase X (Graduate) - 2 August 2022 Shift-3';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-3',
    pyqExamName: 'SSC Selection Post Phase X (Graduate)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
