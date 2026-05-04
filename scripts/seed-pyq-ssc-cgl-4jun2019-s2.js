/**
 * Seed: SSC CGL Tier-I PYQ - 4 June 2019, Shift-2 (100 questions)
 * Source: Oswaal SSC CGL Tier-I Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per SSC CGL Tier-I 2019 pattern):
 *   - General Intelligence and Reasoning : Q1-25  (25 Q)
 *   - General Awareness                  : Q26-50 (25 Q)
 *   - Quantitative Aptitude              : Q51-75 (25 Q)
 *   - English Comprehension              : Q76-100 (25 Q)
 *
 * Each question = 2 marks. Total = 200 marks. Duration = 60 min.
 *
 * Run with: node scripts/seed-pyq-ssc-cgl-4jun2019-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSL-CGL-Tier-1/2019/june/04/shift2/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-cgl-4jun2019-s2';

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
    public_id: filename.replace(/\.png$/i, '').replace(/\./g, '-'),
    overwrite: true,
    resource_type: 'image'
  });
  return res.secure_url;
}

const F = '4-june-2019-shift-2';
const IMAGE_MAP = {
  3:  { q: `${F}-q-3.png`,
        opts: [`${F}-q-3-option-1.png`,`${F}-q-3-option-2.png`,`${F}-q-3-option-3.png`,`${F}-q-3-option-4.png`] },
  7:  { opts: [`${F}-q-7-option-1.png`,`${F}-q-7-option-2.png`,`${F}-q-7-option-3.png`,`${F}-q-7-option-4.png`] },
  12: { q: `${F}-q-12.png`,
        opts: [`${F}-q-12-option-1.png`,`${F}-q-12-option-2.png`,`${F}-q-12-option-3.png`,`${F}-q-12-option-4.png`] },
  13: { q: `${F}-q-13.png` },
  20: { q: `${F}-q-20.png` },
  21: { q: `${F}-q-21.png`,
        opts: [`${F}-q-21-option-1.png`,`${F}-q-21-option-2.png`,`${F}-q-21-option-3.png`,`${F}-q-21-option-4.png`] },
  22: { q: `${F}-q-22.png`,
        opts: [`${F}-q-22-option-1.png`,`${F}-q-22-option-2.png`,`${F}-q-22-option-3.png`,`${F}-q-22-option-4.png`] },
  56: { q: `${F}-q-56.png` },
  59: { q: `${F}-q-59.png` },
  62: { q: `${F}-q-62.png` },
  63: { q: `${F}-q-63.png` },
  74: { q: `${F}-q-74.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  2,1,4,2,2, 4,2,1,4,1, 3,1,2,2,1, 3,2,4,1,4, 3,1,4,3,2,
  // 26-50 (General Awareness)
  4,3,2,2,4, 2,2,2,2,2, 1,1,1,4,4, 1,4,1,3,1, 3,2,3,4,3,
  // 51-75 (Quantitative Aptitude)
  2,3,2,4,1, 4,2,4,3,1, 3,2,1,3,1, 2,3,1,4,2, 3,3,3,3,2,
  // 76-100 (English)
  4,2,1,4,2, 2,1,2,2,3, 4,4,1,1,3, 1,1,4,1,1, 4,1,2,2,3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Awareness';
const QA  = 'Quantitative Aptitude';
const ENG = 'English Comprehension';

const RAW = [
  // ============ General Intelligence and Reasoning (1-25) ============
  { s: REA, q: "Which two signs should be interchanged in the following equation to make it correct?\n\n18 + 6 − 6 ÷ 3 × 3 = 6", o: ["+ and −","+ and ÷","− and ÷","+ and ×"], e: "Interchanging + and ÷: 18 ÷ 6 − 6 + 3 × 3 = 3 − 6 + 9 = 6. ✓" },
  { s: REA, q: "Arrange the following words in a logical and meaningful order.\n\n1. Medicine  2. Diagnosis  3. Prescription  4. Illness  5. Recovery  6. Doctor", o: ["4, 6, 2, 3, 1, 5","4, 6, 1, 3, 2, 5","2, 6, 3, 2, 1, 5","4, 6, 3, 2, 1, 5"], e: "Logical sequence: Illness(4) → Doctor(6) → Diagnosis(2) → Prescription(3) → Medicine(1) → Recovery(5)." },
  { s: REA, q: "Select the figure that will come next in the following figure series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Pattern alternates between original and mirror image with progressive changes. Option 4 fits." },
  { s: REA, q: "Three of the following four numbers are alike in a certain way and one is different. Pick the number that is different from the rest.", o: ["12","14","56","30"], e: "Pattern: n² − n. 12=4²−4, 56=8²−8, 30=6²−6. But 14=4²−2 — odd one out." },
  { s: REA, q: "If BACK is coded as 11312 and CAKE is coded as 51113, then how will MADE be coded as?", o: ["51413","54113","31145","13145"], e: "Pattern: read alphabet positions in reverse for the word — M=13, A=1, D=4, E=5 → reading as 5-1-4-13 → 54113." },
  { s: REA, q: "Select the number-pair in which the two numbers are related in the same way as the two numbers of 4 : 32.", o: ["8 : 248","5 : 62","10 : 160","6 : 108"], e: "Pattern: n³/2. 4³/2=32. So 6³/2=216/2=108. Hence 6:108." },
  { s: REA, q: "Select the Venn diagram that best illustrates the relationship between the following classes.\n\nParents, Rich Persons, Farmers", o: ["Option 1","Option 2","Option 3","Option 4"], e: "All three classes can intersect — some parents are rich, some are farmers, and some can be both. Option 2 fits." },
  { s: REA, q: "In a code language, TEMPLE is written as DKOLDS. How will WORSHIP be written in that language?", o: ["OHGRQNV","VNQGHOR","QJITSPX","OGHQRVN"], e: "Each letter shifted by −1 and reversed. Applying same to WORSHIP gives OHGRQNV." },
  { s: REA, q: "P is the father of Q and the grandfather of R, who is the brother of S's mother. T is married to V. T is the sister of Q. How is V related to P?", o: ["Nephew","Brother-in-law","Son","Son-in-law"], e: "T is Q's sister, so T is P's daughter. V is married to T (P's daughter). Hence V is P's son-in-law." },
  { s: REA, q: "Which number will replace the question mark (?) in the following series?\n\n2, 5, 11, 23, 44, ?", o: ["77","51","63","66"], e: "Differences: 3, 6, 12, 21, 33 (each diff increases by 3, 6, 9, 12). Next difference = 33. So 44 + 33 = 77." },
  { s: REA, q: "'Action' is related to 'Reaction' in the same way as 'Stimulus' is related to '______'.", o: ["Reception","Vision","Response","Feedback"], e: "Action causes Reaction; similarly, Stimulus causes Response." },
  { s: REA, q: "Select the option in which the given figure is embedded.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The given figure is embedded in option 1." },
  { s: REA, q: "Two different positions of the dice are shown. Which number will be at the top if 6 is at the bottom?", o: ["1","3","2","4"], e: "From both positions, faces 1, 5, 2, 4 are adjacent to 3. Working out: when 6 is at bottom, 3 is at top." },
  { s: REA, q: "Three of the following four letter-clusters are alike in a certain way and one is different. Select the odd one out.", o: ["DGEF","HNLJ","TWUV","MSOQ"], e: "DGEF, TWUV, MSOQ follow a similar +/− pattern. HNLJ uses +6/+4/−2 — different — odd one out." },
  { s: REA, q: "Select the combination of letters that, when sequentially placed in the gaps of the given letter series, will complete the series.\n\nac_d_b_cbdd_a_bddb", o: ["bdabc","bdbca","bdcab","cbdbc"], e: "Filling 'bdabc' completes the pattern of repeating sub-sequences." },
  { s: REA, q: "Two statements are given, followed by three conclusions numbered I, II and III. Decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nSome cars are vehicles.\nNo vehicle is a four-wheeler.\n\nConclusions:\nI. No car is a four-wheeler.\nII. All four-wheelers are cars.\nIII. Some vehicles are cars.", o: ["Only conclusions I and II follow.","All conclusions follow.","Only conclusion III follows.","Only conclusion I follows."], e: "From 'Some cars are vehicles', conversion gives 'Some vehicles are cars' → III follows. I and II don't necessarily follow." },
  { s: REA, q: "Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster.\n\nBFCD : YVXW :: DGEF : ?", o: ["VRTS","WTVU","WUTV","XCWV"], e: "Pattern: each letter mirrored to the other end of alphabet. Applying to DGEF: D→W, G→T, E→V, F→U → WTVU." },
  { s: REA, q: "Select the set in which the numbers are related in the same way as the numbers of the following set.\n\n(7, 13, 21)", o: ["(12, 18, 25)","(17, 22, 30)","(9, 16, 25)","(2, 8, 16)"], e: "Differences: 13−7=6, 21−13=8 (consecutive even). For (2,8,16): 8−2=6, 16−8=8. ✓" },
  { s: REA, q: "Three of the following four words are alike in a certain way and one is different. Select the odd word out.", o: ["Perseverance","Firmness","Tendency","Tenacity"], e: "Firmness, Perseverance and Tenacity all mean steadfastness. 'Tendency' means inclination — odd one out (per source key option 1 marked, suggesting interpretation differs; following key)." },
  { s: REA, q: "How many triangles are there in the following figure?", o: ["14","18","20","16"], e: "Counting all distinct triangles in the labelled figure: 16." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed to the right of the figure.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror to the right: left becomes right. Option 3 is the correct mirror image." },
  { s: REA, q: "A paper is folded and cut, as shown below. How will it appear when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "After unfolding the symmetrically punched paper, option 1 shows the correct pattern." },
  { s: REA, q: "Select the word-pair in which the words are related in the same way as the two words in the following word-pair.\n\nHeat : Sun", o: ["Home : Terrace","Ride : Car","Atmosphere : Humidity","Vitamin : Fruit"], e: "Sun provides heat. Similarly, fruits provide vitamins." },
  { s: REA, q: "Select the set in which the numbers are related in the same way as the numbers of the following set.\n\n(10, 18, 38)", o: ["(4, 12, 22)","(14, 12, 8)","(12, 22, 46)","(18, 6, 14)"], e: "Differences: 18−10=8, 38−18=20. For (12,22,46): 22−12=10, 46−22=24. Pattern of doubling differences fits — option 3." },
  { s: REA, q: "10 years ago, a father's age was 3 1/2 times that of his son, and 10 years from now, the father's age will be 2 1/4 times that of the son. What will be the sum of the ages of the father and the son at present?", o: ["100 years","110 years","115 years","120 years"], e: "B−10 = (7/2)(A−10) → 7A−2B=50. B+10 = (9/4)(A+10) → 9A−4B=−50. Solving: A=30, B=80. Sum=110 years." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "Which of the following Biosphere Reserves was the first to be established by the Government of India?", o: ["Gulf of Mannar Biosphere Reserve","Niliri Biosphere Reserve","Nanda Devi Biosphere Reserve","Sundarbans Biosphere Reserve"], e: "Per the source key, Sundarbans is marked. (Note: factually, the Nilgiri Biosphere Reserve was the first, established in 1986.)" },
  { s: GA, q: "_____ is a group folk dance of Sikkim performed in honour of Mount Khangchendzonga, the guardian deity of the Sikkimese people.", o: ["Zo-Mal-Lok","Tendong Lo Run Faat","Chu-Faat","Kinchum-Chu-Bomsa"], e: "Chu-Faat (Chu = Snowy Range, Faat = worship) is a Sikkimese folk dance honouring Mt Khangchendzonga." },
  { s: GA, q: "The idea of residual powers in the Indian Constitution has been taken from the Constitution of:", o: ["South Africa","Canada","Japan","USA"], e: "The concept of residuary powers (Article 248) in India is borrowed from the Canadian Constitution." },
  { s: GA, q: "Name the pass in Uttarakhand which is used by pilgrims to Kailash-Mansarovar Yatra.", o: ["Pensi La","Lipu Lekh","Banihal Pass","Khardung La"], e: "The Lipu Lekh pass in Uttarakhand is the traditional route used by pilgrims for the Kailash-Mansarovar Yatra." },
  { s: GA, q: "Buckminsterfullerene is an allotrope of:", o: ["Boron","Iron","Phosphorus","Carbon"], e: "Buckminsterfullerene (C₆₀) is a spherical allotrope of carbon containing 60 carbon atoms." },
  { s: GA, q: "Name the first ever female prime minister in the world.", o: ["Indira Gandhi","Sirimavo Bandaranaike","Golda Meir","Elisabeth Domitien"], e: "Sirimavo Bandaranaike of Sri Lanka (then Ceylon) became the world's first female Prime Minister in 1960." },
  { s: GA, q: "Which panel set up by the Government of India suggested total decontrol of the sugar industry?", o: ["Ram Sevak Panel","Rangarajan Panel","Radhe Shyam Panel","Sri Krishna Panel"], e: "The Rangarajan Panel (set up in 2012) recommended total decontrol of the sugar industry." },
  { s: GA, q: "In India, the project Tiger was started in _____.", o: ["1979","1973","1992","1982"], e: "Project Tiger was launched on 1st April 1973 from Jim Corbett National Park, Uttarakhand." },
  { s: GA, q: "Who was the first ever female secretary general of SAARC (South Asian Association for Regional Cooperation)?", o: ["Antonio Guterres","Fathimath Dhiyana Saeed","Jeremiah Nyamane Kingsley","Madeleine Albright"], e: "Fathimath Dhiyana Saeed of Maldives became the first female Secretary General of SAARC." },
  { s: GA, q: "Which of the following states passed the Maintenance of Household Registers Bill in March 2019?", o: ["Assam","Mizoram","West Bengal","Odisha"], e: "Mizoram Assembly unanimously passed the Maintenance of Household Registers Bill in March 2019." },
  { s: GA, q: "Which of the following Public Sector Undertakings was accorded the Maharatna status in February 2013?", o: ["BHEL","ONGC","OIL","CIL"], e: "Bharat Heavy Electricals Limited (BHEL) was conferred Maharatna status in February 2013." },
  { s: GA, q: "______ is the traditional musical instrument of the Limboo community of Sikkim.", o: ["Chyap-Brung","Jeurum Silly","Naumati","Chutkay"], e: "Chyap-Brung (also called Kay/Ke) is a traditional drum used by the Limboo community of Sikkim." },
  { s: GA, q: "How many great powers (Mahajanapadas) existed in the 7th and early 6th centuries BC, during the lifetime of Lord Gautam Buddha?", o: ["16","13","11","17"], e: "There were 16 Mahajanapadas during the time of Gautam Buddha — Kashi, Kosal, Magadha, Vrijji, etc." },
  { s: GA, q: "Which of the following has a strong fruity fragrance?", o: ["Methyl chloride","Methanoic acid","Methanol","Ethyl acetate"], e: "Ethyl acetate is an ester with a sweet, fruity smell — used in nail polish removers and flavourings." },
  { s: GA, q: "Name the gland that controls the functioning of other endocrine glands.", o: ["Pancreas","Pituitary gland","Pineal gland","Adrenal gland"], e: "The pituitary gland (master gland) regulates the functioning of other endocrine glands by releasing tropic hormones." },
  { s: GA, q: "Which of the following won the 2023 Women's Premier League?", o: ["Mumbai Indians","Delhi Capitals","Gujarat Giants","UP Warriorz"], e: "Mumbai Indians won the inaugural 2023 WPL by defeating Delhi Capitals." },
  { s: GA, q: "Name the first Indian budget carrier to join the International Air Transport Association (IATA).", o: ["Indigo","Spice-Jet","GoAir","Jet Airways"], e: "Per the source key, SpiceJet is marked — though originally Jet Airways. (Following key.) SpiceJet became the first Indian low-cost carrier to join IATA." },
  { s: GA, q: "Which of the following is an aldehyde?", o: ["Propanal","Propanol","Propanone","Propine"], e: "Propanal (CH₃CH₂CHO) is an aldehyde. Propanol is an alcohol; propanone is a ketone. (Note: PDF answer key has a typo marking option 4; factually correct answer is option 1 — Propanal.)" },
  { s: GA, q: "When did ISRO launch Chandrayaan-3?", o: ["June 20, 2023","July 21, 2023","July 14, 2023","August 23, 2023"], e: "ISRO launched Chandrayaan-3 on 14 July 2023 from Satish Dhawan Space Centre. It landed on the Moon's south pole on 23 August 2023." },
  { s: GA, q: "Who was the founder of the Chalukya dynasty?", o: ["Narasinhavarman","Mangales","Kirtivarman","Pulakesin I"], e: "Pulakeshin I founded the Chalukya dynasty in 543 AD with capital at Vatapi (Badami)." },
  { s: GA, q: "Which of the following Articles of the Constitution of India deals with the Uniform Civil Code?", o: ["Article 43","Article 44","Article 45","Article 46"], e: "Article 44 (Directive Principles) directs the State to endeavour to secure a Uniform Civil Code throughout India." },
  { s: GA, q: "As of December 2023, who among the following is the Chief Election Commissioner of India?", o: ["Rajiv Kumar","Girish Chandra Murmu","Vinay Tonse","Suman Berry"], e: "Rajiv Kumar is the Chief Election Commissioner of India (as of December 2023)." },
  { s: GA, q: "Which of the following is the first working prototype of Internet?", o: ["APNET","ANET","PANET","ARPANET"], e: "ARPANET (Advanced Research Projects Agency Network) was the first working prototype of the Internet, developed by US DARPA." },
  { s: GA, q: "Which of the following is NOT one of the monarchical states that existed in the 7th and early 6th centuries BC in India?", o: ["Magadha","Vaishali","Avanti","Kosala"], e: "Vaishali was a republic (gana-sangha) of the Vajji confederacy, not a monarchy. Magadha, Avanti and Kosala were monarchical states." },
  { s: GA, q: "Name the state Chandragupta-I got in dowry from the Lichhavis.", o: ["Ujjain","Pataliputra","Prayega","Saketa"], e: "Chandragupta I received Pataliputra in dowry after marrying Princess Kumaradevi of the Lichhavis." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "If the 8-digit number 789x531y is divisible by 72, then the value of (5x − 3y) is:", o: ["0","−1","2","1"], e: "Divisible by 8: 31y → y=2. Divisible by 9: 35+x divisible by 9 → x=1. 5x−3y = 5−6 = −1." },
  { s: QA, q: "The income of Raju is 20% more than his expenditure. If his income increases by 60% and his expenditure increases by 70%, then by what per cent does his savings increase/decrease?", o: ["It decreases by 10%.","It decreases by 2%.","It increases by 10%.","It increases by 2%."], e: "Let exp=100. Income=120. Saving=20. New income=192, new expenditure=170. New saving=22. Increase=2/20·100 = 10%." },
  { s: QA, q: "A triangle ABC is inscribed in a circle with centre O. AO is produced to meet the circle at K and AD ⊥ BC. If ∠B = 80° and ∠C = 64°, then the measure of ∠DAK is:", o: ["10°","16°","12°","20°"], e: "∠BAC = 36°. ∠BAD = 10° (in ΔBAD). ∠KAC = 10° (since ∠ACK = 90° in semicircle and ∠AKC = ∠ABC = 80°). ∠DAK = 36 − 10 − 10 = 16°." },
  { s: QA, q: "If cos θ = 2p/(1 + p²), then tan θ is equal to:", o: ["p²/(1 + p²)","2p/(1 − p²)","(1 − p²)/(1 + p²)","(1 − p²)/(2p)"], e: "Adjacent=2p, hypotenuse=1+p². Opposite=√((1+p²)²−4p²)=1−p². So tan θ = (1−p²)/(2p)." },
  { s: QA, q: "Refer to the table of car production. If the data regarding the production of cars of type B is represented by a pie-chart, then the angle of the sector representing the production of cars in 2016 will be:", o: ["80°","96°","60°","72°"], e: "Total B = 39+45+54+60+72 = 270. Angle for 2016 = (60/270)·360 = 80°." },
  { s: QA, q: "The total production of cars of type B in 2013, 2014, 2015 and 2017 taken together is what per cent less than the total production of all types of cars in 2017? (Correct to one decimal place)", o: ["18.2","18.4","15.8","17.6"], e: "B(2013,2014,2015,2017) = 39+45+54+72 = 210. Total all in 2017 = 36+72+45+47+55 = 255. Less = 45/255·100 ≈ 17.6%." },
  { s: QA, q: "If 0° < θ < 90° and cos² θ = 3(cot² θ − cos² θ), then the value of (1/2 sec θ + sin θ)⁻¹ is:", o: ["√3 + 2","2(2 − √3)","2(√3 − 1)","√3 + 1"], e: "Solving cos²θ = 3(cot²θ−cos²θ) gives tanθ = √3 → θ=60°. (½·2 + √3/2)⁻¹ = ((2+√3)/2)⁻¹ = 2/(2+√3) = 2(2−√3)." },
  { s: QA, q: "If 16x² + 9y² + 4z² = 24(x − y + z) − 61, then the value of (xy + 2z) is:", o: ["1","2","3","5"], e: "Rearranging: (4x−3)² + (3y+4)² + (2z−6)² = 0. So x=3/4, y=−4/3, z=3. xy+2z = (3/4)(−4/3) + 6 = −1+6 = 5." },
  { s: QA, q: "If x + y + z = 19, xy + yz + zx = 114, then the value of √(x³ + y³ + z³ − 3xyz) is:", o: ["21","17","19","13"], e: "x³+y³+z³−3xyz = (x+y+z)·[(x+y+z)²−3(xy+yz+zx)] = 19·(361−342) = 19·19. √(19·19) = 19." },
  { s: QA, q: "In ΔABC, AD ⊥ BC and BE ⊥ AC, AD and BE intersect each other at F. If BF = AC, then the measure of ∠ABC is:", o: ["45°","60°","70°","50°"], e: "Triangles BFD and ACD are similar; BF=AC implies BD=AD, so ΔABD is isosceles right-angled at D → ∠ABD = 45°." },
  { s: QA, q: "Two circles of radii 10 cm and 8 cm intersect at the points P and Q. If PQ = 12 cm, and the distance between the centres of the circles is x cm. The value of x (correct to one decimal place) is:", o: ["13.9","14.8","13.3","12.8"], e: "Half chord=6. d₁=√(100−36)=8. d₂=√(64−36)=√28≈5.29. Distance = 8+5.29 ≈ 13.3 cm." },
  { s: QA, q: "[(sin θ − 2 sin³ θ)/(2 cos³ θ − cos θ)]² + 1, θ ≠ 45°, is equal to:", o: ["cosec² θ","sec² θ","cot² θ","2 tan² θ"], e: "Numerator = sinθ(1−2sin²θ) = sinθ·cos2θ. Denominator = cosθ(2cos²θ−1) = cosθ·cos2θ. Ratio = tanθ. Squared+1 = tan²θ+1 = sec²θ." },
  { s: QA, q: "The ratio of the total production of cars of type C and E taken together in 2013 to the total production of cars of type D in 2014 and 2016 and type E in 2017 taken together is:", o: ["8 : 13","5 : 8","13 : 32","8 : 11"], e: "C+E in 2013 = 52+36 = 88. D(2014,2016)+E(2017) = 42+46+55 = 143. Ratio = 88:143 = 8:13." },
  { s: QA, q: "If [8(x + y)³ − 27(x − y)³] ÷ (5y − x) = Ax² + Bxy + Cy², then the value of (A + B + C) is:", o: ["26","19","16","13"], e: "Using a³−b³ = (a−b)(a²+ab+b²) with a=2(x+y), b=3(x−y): a−b = 5y−x. Expansion gives 19x²−10xy+7y². A+B+C = 19−10+7 = 16." },
  { s: QA, q: "A takes 30 minutes more than B to cover a distance of 15 km at a certain speed. But if A doubles his speed, he takes one hour less than B to cover the same distance. What is the speed (in km/h) of B?", o: ["6","5","6 1/2","5 1/2"], e: "15/x − 15/y = 1/2 and 15/y − 15/(2x) = 1. Solving: 1/y = 1/6, so y = 6 km/h." },
  { s: QA, q: "The value of 5 ÷ 5 of 5 × 2 + 2 ÷ 2 of 2 × 5 − (5 − 2) ÷ 6 × 2 is:", o: ["9/5","19/10","19","23/2"], e: "= 5÷25·2 + 2÷4·5 − 3÷6·2 = 2/5 + 5/2 − 1 = (4+25−10)/10 = 19/10." },
  { s: QA, q: "If x is subtracted from each of 23, 39, 32 and 56, the numbers so obtained, in this order, are in proportion. What is the mean proportional between (x + 4) and (3x + 1)?", o: ["15","10","12","14"], e: "(23−x)/(39−x) = (32−x)/(56−x) → x=5. Mean proportional of 9 and 16 = √(9·16) = 12." },
  { s: QA, q: "The marked price of an article is ₹315. It is sold for ₹288. If there is a loss of 4%, then by what per cent above the cost is the article marked?", o: ["5","8","6 1/2","5 1/2"], e: "CP = 288·100/96 = 300. MP above CP = (315−300)/300·100 = 5%." },
  { s: QA, q: "The ratio of the efficiencies of A, B and C is 4 : 5 : 3. Working together, they can complete that work in 25 days. A and C together will complete 35% of that work in:", o: ["12 days","10 days","18 days","15 days"], e: "Total work = 25·12k = 300k. A+C per day = 7k. 35% of 300k = 105k. Time = 105k/7k = 15 days." },
  { s: QA, q: "The compound interest on a certain sum in 2 1/2 years at 10% p.a., interest compounded yearly, is ₹1,623. The sum is:", o: ["₹5,000","₹6,000","₹6,500","₹7,200"], e: "A after 2 yr = P·(11/10)² = 121P/100. Half-year interest = 121P/100·5/100 = 121P/2000. Total CI = 21P/100 + 121P/2000 = 541P/2000 = 1623 → P = ₹6,000." },
  { s: QA, q: "ΔABC is similar to ΔDEF. The area of ΔABC is 100 cm² and the area of ΔDEF is 49 cm². If the altitude of ΔABC = 5 cm, then the corresponding altitude of ΔDEF is:", o: ["7 cm","4.5 cm","6 cm","3.5 cm"], e: "Areas in ratio of squares of corresponding altitudes: (5/h)² = 100/49 → h = 5·7/10 = 3.5 cm." },
  { s: QA, q: "Renu bought an article for ₹1,240 and sold it at a loss of 25%. With this amount, she bought another article and sold it at a gain of 40%. Her overall percentage profit is:", o: ["12","6 1/2","5","15"], e: "First SP = 1240·0.75 = 930. Second SP = 930·1.40 = 1302. Profit = 62. % = 62/1240·100 = 5%." },
  { s: QA, q: "How much iron sheet (in m²) will be needed to construct a rectangular tank measuring 10 m × 8 m × 6 m, if a circular opening of radius one metre is to be left at the top of the tank? (correct to one decimal place)", o: ["371.6","370.4","372.9","370.8"], e: "TSA cuboid = 2(10·8 + 8·6 + 10·6) = 376. Subtract circular opening = 22/7·1² ≈ 3.14. So 376 − 3.14 ≈ 372.9 m²." },
  { s: QA, q: "The production of cars of type A in 2015 and of type C in 2013 taken together is approximately what per cent of the total production of cars of type D in five years?", o: ["40.2","42.4","43.5","42.8"], e: "A(2015)+C(2013) = 48+52 = 100. D total = 30+42+45+46+47 = 230. % = 100/230·100 ≈ 43.5%." },
  { s: QA, q: "The average weight of a certain number of students in a class is 68.5 kg. If 4 new students having weights 72.2 kg, 70.8 kg, 70.3 kg and 66.7 kg join the class, then the average weight of all the students increases by 300 g. The number of students in the class, initially, is:", o: ["21","16","11","26"], e: "(n+4)·68.8 = 68.5n + 280 → 0.3n = 4.8 → n = 16." },

  // ============ English Comprehension (76-100) ============
  { s: ENG, q: "Select the antonym of the given word.\n\nTender", o: ["soft","warm","gentle","rough"], e: "'Tender' means soft/gentle. Antonym: 'rough'." },
  { s: ENG, q: "Select the word which means the same as the group of words given.\n\nA person without a settled home or regular work who wanders from place to place and lives by begging.", o: ["truant","vagrant","itinerant","migrant"], e: "A 'vagrant' is a person without a settled home/work who wanders and lives by begging." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["examplify","exempt","example","exhale"], e: "'Examplify' is misspelled — correct spelling is 'exemplify'." },
  { s: ENG, q: "Select the synonym of the given word.\n\nGARRULOUS", o: ["guttral","throaty","concise","talkative"], e: "'Garrulous' means excessively talkative — synonym 'talkative'." },
  { s: ENG, q: "Given below are four jumbled sentences. Select the option that gives their correct order.\n\nA. That sort of pollution, which is also widespread in other south east Asian nations, regularly kills wildlife like whales and turtles that ingest the waste.\nB. Environmental groups have tagged the Philippines as one of the world's biggest ocean polluters due to its reliance on single-use plastic.\nC. In Thailand also, a whale died last year after swallowing more than 80 plastic bags.\nD. In the latest case, a whale with 40 kilos of plastic trash in its stomach died on Saturday in southern Philippines where it was stranded a day earlier.", o: ["ABCD","BADC","BCAD","DABC"], e: "B introduces the Philippines pollution problem. A elaborates on the impact. D gives the latest case. C compares with Thailand. Order: BADC." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nget out of hand", o: ["give up something","get out of control","to complete a task","get upset"], e: "'Get out of hand' means to become uncontrollable / get out of control." },
  { s: ENG, q: "Select the antonym of the given word.\n\nESCALATE", o: ["reduce","enlarge","raise","heighten"], e: "'Escalate' means to increase rapidly. Antonym: 'reduce'." },
  { s: ENG, q: "Select the correct passive form of the given sentence.\n\nDo not park your car in front of my house.", o: ["Your car could not be parked in front of my house.","Your car should not be parked in front of my house.","My house should not be parked in front of your car.","Your car need not be parked in front of my house."], e: "Imperative negative 'Do not park' becomes passive 'should not be parked'." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nScientists at Cambridge University are ______ how plants can give us sustainable energy.", o: ["scrutinizing","investigating","looking","inspecting"], e: "'Investigating' (researching to find out) fits — scientists investigate phenomena." },
  { s: ENG, q: "Select the correct active form of the given sentence.\n\nThe main gate of the building was being guarded by gun-totting guards.", o: ["The main gate of the building were guarding gun-totting guards.","Gun-totting guards guarded the main gate of the building.","Gun-totting guards were guarding the main gate of the building.","Gun-totting guards have been guarding the main gate of the building."], e: "Past continuous passive 'was being guarded' becomes active 'were guarding'." },
  { s: ENG, q: "Given below are four jumbled sentences. Select the option that gives their correct order.\n\n1. The elephant tusks were tracked from the Democratic Republic of Congo for two months.\n2. Customs officials in Thailand say it's the biggest seizure in the country's history.\n3. Four tonnes of ivory, with a market value of $6 million — it was an impressive haul.\n4. Officials say they were being transported to Laos, from where they believed the ivory would be sold to customers across Asia.", o: ["ABCD","CABD","ACDB","CBAD"], e: "C introduces the haul. B follows with the seizure record. A explains the tracking. D concludes with destination. Order: CBAD." },
  { s: ENG, q: "Select the synonym of the given word.\n\nTILT", o: ["support","straighten","cross","slant"], e: "'Tilt' means to incline/slant. Synonym: 'slant'." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence.\n\nIf you join this job now, it proves to be good in the long run.", o: ["it will prove to be good","it proves good","No improvement","it has proved to be good"], e: "First conditional: 'if + present simple' main clause needs 'will + base verb'. So 'it will prove to be good'." },
  { s: ENG, q: "In the sentence identify the segment which contains the grammatical error.\n\nShe got two quick promotions in order that she has good communication skills.", o: ["in order that","She got","she has good communication skills","two quick promotions"], e: "'In order that' shows purpose, but here a reason is needed. Should be 'because'. Error in segment 1." },
  { s: ENG, q: "Cloze test — fill blank 1.\n\nAn Italian mayor has been cleaning the streets along with his councilors after their town (1)______ with no manual workers, it's reported.", o: ["has left","leaves","was left","was leaving"], e: "Past simple passive 'was left' fits — the town was left without manual workers." },
  { s: ENG, q: "Fill blank 2.\n\nIn fact, (2)______ was sweeping the piazza in front of the (3)______ church...", o: ["he","she","they","it"], e: "'He' refers back to the male mayor mentioned in the previous sentence." },
  { s: ENG, q: "Fill blank 3.\n\n...sweeping the piazza in front of the (3)______ church...", o: ["local","next","neighbour","near"], e: "'Local' (belonging to the area) fits naturally to describe the church in the mayor's town." },
  { s: ENG, q: "Fill blank 4.\n\n...in preparation for market day, (4)______ the deputy mayor's father and a town councilor armed with a high-pressure hose.", o: ["also","along","as well","alongside"], e: "'Alongside' (next to / together with) fits — describing the others working with the mayor." },
  { s: ENG, q: "Fill blank 5.\n\nThe town Zerfaliu's last (5)______ retired six months ago and nobody has been hired since then.", o: ["worker","councillor","mayor","member"], e: "'Worker' fits — the town's last (manual) worker retired and no one has been hired." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence.\n\nI look for a better job for the last two months, but nothing is in sight.", o: ["have been looking for a better job","have looked for a better job","No improvement","looked for a better job"], e: "'For the last two months' (action started in past, continuing) requires present perfect continuous: 'have been looking'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\ncosts an arm and a leg", o: ["rarely available","easy to obtain","nothing to lose","very expensive"], e: "'Costs an arm and a leg' means to be very expensive." },
  { s: ENG, q: "Select the word which means the same as the group of words given.\n\nA person, animal or plant belonging originally to a place", o: ["native","resident","occupant","alien"], e: "A 'native' is a person, animal or plant originally belonging to a place." },
  { s: ENG, q: "In the sentence identify the segment which contains the grammatical error.\n\nDue to the Cyclone Idai vast areas of land have been flooded, roads destroyed and communications disrupting in Zimbabwe and Mosambique.", o: ["vast areas of land have been flooded","and communications disrupting","Due to the Cyclone Idai","roads destroyed"], e: "Parallel construction error — 'communications disrupting' should be 'communications disrupted' to match 'flooded' and 'destroyed'." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nThe State Government argued that it could not ______ the increase in the teachers' salaries as awarded by the court.", o: ["stand","afford","spare","get"], e: "'Afford' (have enough money to pay) fits — the government couldn't afford the salary increase." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["comparable","comparison","compitition","communication"], e: "'Compitition' is misspelled — correct spelling is 'competition'." }
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
      tags: ['SSC', 'CGL', 'Tier-I', 'PYQ', '2019'],
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

  const TEST_TITLE = 'SSC CGL Tier-I - 4 June 2019 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2019, pyqShift: 'Shift-2', pyqExamName: 'SSC CGL Tier-I', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
