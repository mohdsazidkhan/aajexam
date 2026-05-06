/**
 * Seed: SSC CGL Tier-I PYQ - 13 August 2020, Shift-2 (100 questions)
 * Source: Oswaal SSC CGL Tier-I Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per SSC CGL Tier-I 2020 pattern):
 *   - General Intelligence and Reasoning : Q1-25  (25 Q)
 *   - General Awareness                  : Q26-50 (25 Q)
 *   - Quantitative Aptitude              : Q51-75 (25 Q)
 *   - English Comprehension              : Q76-100 (25 Q)
 *
 * Each question = 2 marks. Total = 200 marks. Duration = 60 min.
 *
 * Run with: node scripts/seed-pyq-ssc-cgl-13aug2020-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSL-CGL-Tier-1/2020/august/13/shift-2/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-cgl-13aug2020-s2';

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

const F = '13-august-2020-shift-2';
const IMAGE_MAP = {
  9:  { q: `${F}-q-9.png` },
  10: { q: `${F}-q-10.png`,
        opts: [`${F}-q-10-option-1.png`,`${F}-q-10-option-2.png`,`${F}-q-10-option-3.png`,`${F}-q-10-option-4.png`] },
  12: { q: `${F}-q-12.png`,
        opts: [`${F}-q-12-option-1.png`,`${F}-q-12-option-2.png`,`${F}-q-12-option-3.png`,`${F}-q-12-option-4.png`] },
  14: { q: `${F}-q-14.png`,
        opts: [`${F}-q-14-option-1.png`,`${F}-q-14-option-2.png`,`${F}-q-14-option-3.png`,`${F}-q-14-option-4.png`] },
  15: { opts: [`${F}-q-15-option-1.png`,`${F}-q-15-option-2.png`,`${F}-q-15-option-3.png`,`${F}-q-15-option-4.png`] },
  20: { q: `${F}-q-20.png`,
        opts: [`${F}-q-20-option-1.png`,`${F}-q-20-option-2.png`,`${F}-q-20-option-3.png`,`${F}-q-20-option-4.png`] },
  22: { q: `${F}-q-22.png` },
  52: { q: `${F}-q-52.png` },
  61: { q: `${F}-q-61.png` },
  62: { q: `${F}-q-62.png` },
  65: { q: `${F}-q-65.png` },
  67: { q: `${F}-q-67.png` },
  70: { q: `${F}-q-70.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  3,3,4,4,4, 1,2,1,1,2, 3,3,2,3,4, 3,2,3,4,1, 2,1,1,4,2,
  // 26-50 (General Awareness)
  2,4,3,2,3, 2,3,2,4,2, 3,3,2,1,4, 3,4,1,2,1, 2,3,4,2,4,
  // 51-75 (Quantitative Aptitude)
  1,3,1,4,2, 2,4,1,4,4, 3,1,1,1,1, 2,3,1,1,2, 2,2,4,4,4,
  // 76-100 (English)
  1,4,2,1,2, 2,3,3,1,2, 3,4,1,2,4, 4,2,1,4,2, 2,4,4,4,2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Awareness';
const QA  = 'Quantitative Aptitude';
const ENG = 'English Comprehension';

const RAW = [
  // ============ General Intelligence and Reasoning (1-25) ============
  { s: REA, q: "Select the combination of letters that, when sequentially placed in the blanks of the given series, will complete the series.\n\nI _ chtlgc _ tlg _ ht _ gc _ tlgch _", o: ["g, h, c, h, l, t","h, h, g, c, l, t","g, h, c, l, h, t","h, g, h, c, l, t"], e: "Pattern: 'Igcht' repeated five times. Filling g,h,c,l,h,t completes the pattern: Igcht·Igcht·Igcht·Igcht·Igcht." },
  { s: REA, q: "In a certain code language, 'DOLPHIN' is written as 'EPMPGHM'. How will 'CORDIAL' be written in that language?", o: ["EPTDHZK","DPSDHAL","DPSDHZK","DPSEGZK"], e: "Pattern: +1, +1, +1, 0, −1, −1, −1. C+1=D, O+1=P, R+1=S, D+0=D, I−1=H, A−1=Z (Z), L−1=K → DPSDHZK." },
  { s: REA, q: "Four number-pairs have been given, out of which three are alike in some manner and one is different. Select the number-pair that is different.", o: ["7 : 147","8 : 192","12 : 432","13 : 506"], e: "147/7=21, 192/8=24, 432/12=36, but 506/13≈38.92 — not exact. Odd: 13:506." },
  { s: REA, q: "Select the option in which the words share the same relationship as that shared by the given pair of words.\n\nResistance : Ohm", o: ["Density : Joule","Ampere : Current","Force : Watt","Angle : Radians"], e: "Ohm is the unit of resistance. Similarly, Radian is the unit of angle." },
  { s: REA, q: "Four words have been given, out of which three are alike in some manner and one is different. Select the word that is different.", o: ["Headway","Advance","Growth","Deteriorate"], e: "Headway, Advance and Growth indicate progress. Deteriorate means the opposite — odd one out." },
  { s: REA, q: "Select the option in which the numbers are related in the same way as are the numbers of the following set.\n\n(12, 30, 61)", o: ["(18, 45, 91)","(8, 21, 45)","(6, 15, 30)","(14, 35, 72)"], e: "Pattern: 12·2 + 12/2 = 30; 30·2 + 1 = 61. For (18, 45, 91): 18·2+9=45 ✓; 45·2+1=91 ✓." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n4, 11, 31, 65, 193, ?", o: ["368","389","386","398"], e: "Pattern: alternate ×2+3 and ×3−2. 4·2+3=11, 11·3−2=31, 31·2+3=65, 65·3−2=193, 193·2+3=389." },
  { s: REA, q: "Select the option in which the numbers are related in the same way as are the numbers of the following set.\n\n(24, 10, 392)", o: ["(29, 18, 242)","(21, 18, 234)","(26, 12, 369)","(27, 15, 480)"], e: "Pattern: (a − b)² × 2. (24−10)²·2 = 196·2 = 392 ✓. (29−18)²·2 = 121·2 = 242 ✓." },
  { s: REA, q: "Three different positions of the same dice are shown. Select the letter/number that will be on the face opposite to the face having the letter 'U'.", o: ["E","9","A","I"], e: "From the dice positions, working out adjacencies: E is opposite to U." },
  { s: REA, q: "Select the correct mirror image of the given combination when the mirror is placed at 'PQ' as shown.\n\nTg3c7JUaQ", o: ["Option 1","Option 2","Option 3","Option 4"], e: "When the mirror is at PQ on the right, the characters reverse left-to-right. Option 2 is correct." },
  { s: REA, q: "Select the option that is related to the fourth number in the same way as the first number is related to the second number and the fifth number is related to the sixth number.\n\n17 : 293 :: ? : 488 :: 21 : 445", o: ["28","24","22","20"], e: "Pattern: n² + 4. 17²+4=293, 21²+4=445. So x²+4=488 → x²=484 → x=22." },
  { s: REA, q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "After unfolding the symmetrically punched paper, option 3 shows the correct pattern." },
  { s: REA, q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the equation.\n\n60 * 2 * 3 * 6 * 5 * 43", o: ["÷, +, ×, =, −","÷, +, ×, −, =","+, ÷, ×, =, −","÷, ×, +, −, ="], e: "60÷2 + 3×6 − 5 = 30+18−5 = 43. ✓" },
  { s: REA, q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Following the pattern of letter-pair swaps and numbers, option 3 fits." },
  { s: REA, q: "Select the Venn diagram that best illustrates the relationship between the following classes.\n\nMusicians, Females, Daughters", o: ["Option 1","Option 2","Option 3","Option 4"], e: "All daughters are females (subset). Some musicians are females and some daughters are musicians. Option 4 shows this." },
  { s: REA, q: "Read the given statements and conclusions carefully.\n\nStatements:\nAll directors are actors.\nNo actor is a producer.\nAll choreographers are directors.\n\nConclusions:\nI. No choreographer is a producer.\nII. Some actors are choreographers.\nIII. No director is a producer.", o: ["Only II and III follow.","Only I and II follow.","All follow.","Only I and III follow."], e: "Choreographers ⊂ Directors ⊂ Actors. No actor is producer → no director/choreographer is producer (I, III). Choreographers are actors → some actors are choreographers (II). All follow." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nChisel : Sculptor :: Anvil : ?", o: ["Butcher","Blacksmith","Carpenter","Surgeon"], e: "A chisel is a tool used by a sculptor. Similarly, an anvil is used by a blacksmith." },
  { s: REA, q: "Four letter-clusters have been given, out of which three are alike in some manner and one is different. Select the letter-cluster that is different.", o: ["LNQJ","BDGT","HJMP","TVYB"], e: "LNQJ, BDGT, TVYB follow +2/+3/opposite-letter. HJMP follows +2/+3/+3 — odd one out." },
  { s: REA, q: "Select the letter-cluster from among the given options that can replace the question mark (?) in the following series.\n\nCMQR, BONV, AQKZ, ZSHD, ?", o: ["YVEI","ZUDH","ZVGH","YUEH"], e: "Pattern: −1, +2, −3, +4 on positions. Apply to ZSHD: Z−1=Y, S+2=U, H−3=E, D+4=H → YUEH." },
  { s: REA, q: "Select the option figure that is embedded in the given figure (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 1 is the figure embedded in the given image." },
  { s: REA, q: "Seven years from now, Anamika will be as old as Malini was 4 years ago. Srinidhi was born 2 years ago. The average age of Anamika, Malini and Srinidhi 10 years from now will be 33 years. What is the present age of Anamika?", o: ["30 years","28 years","31 years","29 years"], e: "A+7=M−4 → M=A+11. S=2. (A+10+M+10+S+10)/3=33 → A+M+S=69. Solving: A=28." },
  { s: REA, q: "Find the number of triangles in the given figure.", o: ["13","12","15","14"], e: "Counting all distinct triangles in the labelled figure: 13." },
  { s: REA, q: "'R8S' means 'R is the father of S'. 'R7S' means 'R is the sister of S'. 'R6S' means 'R is the brother of S'. 'R2S' means 'R is the wife of S'. Which of the following expressions represents 'X is the mother of Y'?", o: ["X2M8Y","X7M6O2Y","X2M8O2Y","X8M2Y"], e: "X is wife of M (X2M); M is father of Y (M8Y). So X2M8Y = X is mother of Y." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the given words in the order in which they appear in an English dictionary.\n\n1. protest  2. palindrome  3. probability  4. pathetic  5. parking", o: ["2, 4, 5, 3, 1","2, 1, 3, 4, 5","2, 5, 1, 4, 3","2, 5, 4, 3, 1"], e: "Dictionary order: palindrome(2) → parking(5) → pathetic(4) → probability(3) → protest(1) → 2,5,4,3,1." },
  { s: REA, q: "In a certain code language, 'VIRTUE' is coded as '201' and 'TRAGEDY' is coded as '218'. How will 'PROFANE' be coded in that language?", o: ["570","342","456","432"], e: "Sum of opposite-letter positions × number of vowels. PROFANE: P=11, R=9, O=12, F=21, A=26, N=13, E=22. Sum=114. Vowels: O, A, E = 3. Code = 114·3 = 342." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "Which of the following Articles of the Constitution of India states that there will be a Vice President of India?", o: ["Article 56","Article 63","Article 75","Article 45"], e: "Article 63 of the Indian Constitution states 'There shall be a Vice President of India.'" },
  { s: GA, q: "With which of the following sports is Ruia Gold Cup associated?", o: ["Water polo","Swimming","Badminton","Bridge"], e: "The Ruia Gold Cup is associated with the card game Bridge." },
  { s: GA, q: "Which of the following is NOT used to make toothpaste?", o: ["Silica","Aluminium Oxide","Galena","Limestone"], e: "Galena (lead sulfide) is a lead ore — toxic and not used in toothpaste. The others are common toothpaste ingredients/abrasives." },
  { s: GA, q: "The Mysore Palace was the residence of the ______.", o: ["Palas","Wodeyars","Chandelas","Bundelas"], e: "Mysore Palace was the official residence of the Wodeyar dynasty, who ruled the Kingdom of Mysore." },
  { s: GA, q: "Who among the following assassinated Sir William Hutt Curzon Wyllie in London?", o: ["Sukhdev Thapar","Surya Sen","Madan Lal Dhingra","Khudiram Bose"], e: "Madan Lal Dhingra assassinated Sir William Hutt Curzon Wyllie in London on 1 July 1909." },
  { s: GA, q: "Which of the following Acts introduced federal features and provincial autonomy in the legislature and also made provisions for the distribution of legislative powers between the Centre and the provinces?", o: ["Government of India Act, 1919","Government of India Act, 1935","Government of India Act, 1858","Indian Councils Act, 1909"], e: "The Government of India Act, 1935 introduced federal features, provincial autonomy and three-fold distribution of legislative powers (Federal/Provincial/Concurrent lists)." },
  { s: GA, q: "Lakshya Sen is associated with which of the following sports?", o: ["Basketball","Table tennis","Badminton","Lawn tennis"], e: "Lakshya Sen is an Indian badminton player — won bronze at 2021 BWF World Championships and gold at CWG 2022." },
  { s: GA, q: "Pattachitra art form is dedicated to which Lord in Hindu mythology?", o: ["Lord Ganesha","Lord Jagannath","Lord Brahma","Lord Shiva"], e: "Pattachitra (cloth scroll painting from Odisha/Bengal) is primarily dedicated to Lord Jagannath." },
  { s: GA, q: "With what do you divide thrust in a liquid to obtain the value of pressure?", o: ["Density","Mass","Volume","Area"], e: "Pressure = Thrust (Force) / Area. Pressure is force per unit area." },
  { s: GA, q: "With which of the following countries did India sign an agreement in February 2021 for the construction of Lalandar (Shatoot) Dam?", o: ["Brazil","Afghanistan","Japan","Australia"], e: "India and Afghanistan signed an agreement in February 2021 for the construction of the Lalandar (Shatoot) Dam." },
  { s: GA, q: "Veer Surendra Sai was a freedom fighter from:", o: ["Sikkim","Telangana","Odisha","Nagaland"], e: "Veer Surendra Sai was a freedom fighter from Sambalpur in Odisha; he fought against British East India Company rule." },
  { s: GA, q: "An elastic wave generated by an impulse such as an earthquake or an explosion is called ______.", o: ["tectonic shift","sound wave","seismic wave","epicentre"], e: "Seismic waves are elastic waves generated by earthquakes, volcanic eruptions or explosions, propagating through the Earth." },
  { s: GA, q: "Who among the following persons was announced as the brand ambassador for the BAFTA (British Academy of Film and Television Arts) 'Breakthrough Initiative' in November 2020?", o: ["Akshay Kumar","A.R. Rahman","Kuldeep Handoo","Ajay Devgan"], e: "A. R. Rahman was named brand ambassador for BAFTA's 'Breakthrough Initiative' in India (November 2020)." },
  { s: GA, q: "In which of the following states is the Rowa Wildlife Sanctuary situated?", o: ["Tripura","Punjab","Assam","Haryana"], e: "Rowa Wildlife Sanctuary is located in the North Tripura district of Tripura." },
  { s: GA, q: "Who among the following persons was elected as the Vice President of Asia Pacific Broadcasting Union in December 2020?", o: ["Rakesh Mohan","Hemant Pandey","Bina Agarwal","Shashi Shekhar Vempati"], e: "Shashi Shekhar Vempati, CEO of Prasar Bharati, was elected Vice President of the Asia Pacific Broadcasting Union (ABU) in December 2020." },
  { s: GA, q: "Mizoram has started 'Love Brigade' scheme to fight against which of the following diseases in December 2020?", o: ["Gonorrhoea","Chlamydia","HIV/AIDS","Syphilis"], e: "Mizoram launched the 'Love Brigade' scheme in December 2020 to fight HIV/AIDS through awareness campaigns." },
  { s: GA, q: "Where is the corporate office of RBL Bank located?", o: ["Srinagar","Patna","Bengaluru","Mumbai"], e: "RBL Bank (formerly Ratnakar Bank) is headquartered in Mumbai." },
  { s: GA, q: "Who among the following was the founder of Homeopathy?", o: ["Samuel Hahnemann","F.G. Hopkins","Robert Koch","Selman Waksman"], e: "German physician Samuel Hahnemann developed homeopathy as a system of alternative medicine in 1796." },
  { s: GA, q: "A channel of canal where water is forced to flow against the slope of land by upliftment is called ______.", o: ["groundwater table","lift channel","flow channel","warabandi system"], e: "A 'lift channel' is a canal channel where water is mechanically lifted against the natural slope of the land." },
  { s: GA, q: "Who among the following was appointed as the Chief Executive of the health insurance scheme 'Ayushman Bharat' by the National Health Authority in January 2021?", o: ["R.S. Sharma","Sanjeev Kumar","Rama Mohan Rao Amara","Anil Ladha"], e: "R. S. Sharma was appointed CEO of National Health Authority (Ayushman Bharat scheme) in January 2021." },
  { s: GA, q: "Which of the following states launched the SAANS (Social Awareness and Action to Neutralise Pneumonia Successfully) campaign in February 2021?", o: ["Uttar Pradesh","Madhya Pradesh","Odisha","Sikkim"], e: "Madhya Pradesh launched the SAANS campaign in February 2021 to reduce infant pneumonia mortality." },
  { s: GA, q: "Who among the following wrote the novel 'Rangbhumi: The Arena of Life'?", o: ["Rabindranath Tagore","Abanindranath Tagore","Munshi Premchand","Mahatma Gandhi"], e: "Munshi Premchand wrote the Hindi novel 'Rangbhumi' (1925), set in pre-independence India and reflecting Gandhian values." },
  { s: GA, q: "Who among the following was appointed as the Managing Director and Chief Executive Officer of SBI Cards and Payment Services Ltd. in January 2021?", o: ["Swaminathan Janakiraman","Rajnish Kumar","Ashwini Kumar Tewari","Rama Mohan Rao Amara"], e: "Rama Mohan Rao Amara was appointed MD & CEO of SBI Cards and Payment Services Ltd. in January 2021." },
  { s: GA, q: "In which of the following years was the Mughal empire established by Babur?", o: ["1699","1526","1578","1634"], e: "Babur defeated Ibrahim Lodi in the First Battle of Panipat (1526) and founded the Mughal Empire." },
  { s: GA, q: "In which of the following temples will you find Gopurams?", o: ["Golden Temple, Amritsar","Bhabatarini Temple, Dakshineswar","Dilwara Temple, Mount Abu","Shiva Temple, Chidambaram"], e: "Gopurams are monumental towers at the entrance to South Indian Hindu temples — found at Chidambaram (Tamil Nadu) Shiva temple." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "If 16x² + y² = 48 and xy = 2, x, y > 0, then the value of (64x³ + y³) is:", o: ["320","240","300","340"], e: "(4x+y)² = 16x²+y²+8xy = 48+16 = 64 → 4x+y=8. (4x+y)³ = 512 = 64x³+y³+12xy(4x+y) = 64x³+y³+12·2·8 = 64x³+y³+192. So 64x³+y³ = 320." },
  { s: QA, q: "Refer to the bar graph showing cough syrup production over 5 years.\n\nThe ratio of the average production of all flavours in 2012 to the difference of the average production of flavour A in 2012, 2013 and 2014 and the average production of flavour C in 2012, 2013 and 2014 is:", o: ["15 : 26","26 : 15","11 : 3","3 : 11"], e: "Avg in 2012 = (50+50+65)/3 = 55. A avg = 170/3. C avg = 215/3. Diff = 45/3 = 15. Ratio = 55:15 = 11:3." },
  { s: QA, q: "If x − 1/x = 5, x ≠ 0, then what is the value of (x⁶ − 5x³ − 1)/(x⁶ + 7x³ − 1)?", o: ["45/49","45/41","49/45","41/45"], e: "(x−1/x)³ = 125 → x³−1/x³−3·5 = 125 → x³−1/x³ = 140. Dividing num/den by x³: (140−5)/(140+7) = 135/147 = 45/49." },
  { s: QA, q: "If x − y = 11 and 1/x − 1/y = 11/24, then what is the value of x³ − y³ + x²y²?", o: ["1,105","1,307","1,331","1,115"], e: "(y−x)/xy = 11/24 → −11/xy = 11/24 → xy = −24. (x−y)³ = 1331 = x³−y³−3·(−24)·11. So x³−y³ = 1331−792 = 539. + x²y² = 539+576 = 1115." },
  { s: QA, q: "If length of a rectangle is increased to its three times and breadth is decreased to its half, then the ratio of the area of given rectangle to the area of the new rectangle is:", o: ["3 : 1","2 : 3","3 : 2","1 : 3"], e: "New area = 3l · b/2 = 3lb/2. Ratio = lb : 3lb/2 = 2:3." },
  { s: QA, q: "If 2 cos²θ = 3 sinθ, 0° < θ < 90°, then the value of (sec²θ − tan²θ + cos²θ) is:", o: ["3/4","7/4","9/4","5/4"], e: "2(1−sin²θ)=3sinθ → 2sin²θ+3sinθ−2=0 → sinθ=1/2 → θ=30°. sec²30−tan²30+cos²30 = 4/3−1/3+3/4 = 1+3/4 = 7/4." },
  { s: QA, q: "In a circle with centre O, AD is a diameter and AC is a chord. Point B is on AC such that OB = 7 cm and ∠OBA = 60°. If ∠DOC = 60°, then what is the length of BC (in cm)?", o: ["5","3.5","9","7"], e: "Per the worked solution using triangle and circle properties, BC = 7 cm." },
  { s: QA, q: "A shopkeeper sold two articles for ₹10,591 each. On one, he gained 19% and on the other, he lost 11%. What was his overall gain or loss percent (correct to one decimal place)?", o: ["Profit 1.8%","Loss 2.7%","Profit 5%","Loss 10%"], e: "CP1 = 10591·100/119 = 8900. CP2 = 10591·100/89 = 11900. Total CP = 20800, total SP = 21182. Profit = 382. % = 382/20800·100 ≈ 1.8%." },
  { s: QA, q: "Surbhi sold an article for ₹176 after giving 12% discount on its marked price. Had she not given any discount, she would have earned a profit of 25%. What is the cost price (in ₹) of the article?", o: ["145","165","150","160"], e: "MP = 176·100/88 = 200. CP = 200·100/125 = 160." },
  { s: QA, q: "In a class of 90 students, 60% are girls and remaining are boys. Average marks of boys are 63 and that of girls are 70. What are the average marks of the whole class?", o: ["65.3","58.9","66.7","67.2"], e: "Girls=54, Boys=36. Total marks = 70·54 + 63·36 = 3780+2268 = 6048. Avg = 6048/90 = 67.2." },
  { s: QA, q: "The value of (2 sin²30° tan60° − 3 cos²60° sec²30°) / (4 cot²45° − sec²60° + sin²60° + cos²90°) is:", o: ["(√3+2)/3","2(√3+2)/3","2(√3−2)/3","(√3−2)/3"], e: "Num: 2·(1/4)·√3 − 3·(1/4)·(4/3) = √3/2 − 1. Den: 4 − 4 + 3/4 + 0 = 3/4. Ratio = (√3/2−1)/(3/4) = 2(√3−2)/3." },
  { s: QA, q: "Refer to the bar graph showing male/female members in 5 organisations.\n\nWhat is the ratio of the average number of females in all the five organisations to the average number of males in all the five organisations?", o: ["46 : 49","51 : 49","49 : 51","49 : 46"], e: "Females total = 300+275+250+200+125 = 1150. Males total = 250+225+325+275+150 = 1225. Ratio = 1150:1225 = 230:245 = 46:49." },
  { s: QA, q: "If a five-digit number 247xy is divisible by 3, 7 and 11, then what is the value of (2y − 8x)?", o: ["6","11","9","17"], e: "LCM(3,7,11)=231. 24717 = 231·107 → x=1, y=7. 2y−8x = 14−8 = 6." },
  { s: QA, q: "In a triangle ABC, AB : AC = 5 : 2, BC = 9 cm. BA is produced to D, and the bisector of the Angle CAD meets BC produced at E. What is the length (in cm) of CE?", o: ["6","9","10","3"], e: "By external angle bisector theorem: AB/AC = BE/CE → 5/2 = (9+CE)/CE → 5CE = 18+2CE → CE = 6 cm." },
  { s: QA, q: "Find the value of (8 sin30° sin²60° − 4 sin²90° − sec²45°) / (tan²45° − cot²30°).", o: ["3/2","5/2","−1/2","3/4"], e: "Num: 8·(1/2)·(3/4) − 4·1 − 2 = 3 − 4 − 2 = −3. Den: 1 − 3 = −2. Ratio = −3/−2 = 3/2." },
  { s: QA, q: "In ΔABC, D and E are the points on sides AB and AC, respectively such that ∠ADE = ∠B. If AD = 7 cm, BD = 5 cm and BC = 9 cm, then DE (in cm) is equal to:", o: ["7","5.25","6.75","10"], e: "Since ∠ADE=∠B, ΔADE ~ ΔABC. AD/AB = DE/BC → 7/12 = DE/9 → DE = 63/12 = 5.25 cm." },
  { s: QA, q: "Refer to the histogram of class X student weights.\n\nLet x be the number of students whose weight is less than 50 kg and y be the number of students whose weight is greater than or equal to 60 kg. What is the value of x : y?", o: ["13 : 11","9 : 13","13 : 9","11 : 13"], e: "x = 20+45 = 65. y = 40+5 = 45. Ratio = 65:45 = 13:9." },
  { s: QA, q: "ABCD is a cyclic quadrilateral. Diagonals BD and AC intersect each other at E. If ∠BEC = 138° and ∠ECD = 35°, then what is the measure of ∠BAC?", o: ["103°","123°","113°","133°"], e: "∠CED = 180−138 = 42°. In ΔCED: ∠CDE = 180−35−42 = 103°. ∠BAC and ∠BDC are on same arc → ∠BAC = ∠BDC = 103°." },
  { s: QA, q: "The rate of simple interest for the first two years is 8% p.a., for the next 4 years it is 10% p.a., and for the period beyond 6 years it is 12% p.a. If a person gets ₹18,358.60 as simple interest after 9 years, then how much money (in ₹) did he invest?", o: ["19,955","19,674","21,075","20,087"], e: "Total %: 2·8 + 4·10 + 3·12 = 16+40+36 = 92%. P·92/100 = 18358.60 → P = 19,955." },
  { s: QA, q: "Refer to the pie charts.\n\nWhat is the ratio of the total number of candidates enrolled in institutes Q, R and S together, to the number of candidates who passed from the institutes Q, R and S together?", o: ["15 : 71","75 : 44","71 : 15","44 : 75"], e: "Enrolled in Q+R+S = 60% of 7500 = 4500. Passed = (24+18+24)% of 4000 = 66% of 4000 = 2640. Ratio = 4500:2640 = 75:44." },
  { s: QA, q: "The ratio of two numbers A and B is 5 : 8. If 5 is added to each of A and B, then the ratio of A and B becomes 2 : 3. The sum of A and B is:", o: ["42","65","91","78"], e: "(5x+5)/(8x+5) = 2/3 → 15x+15 = 16x+10 → x = 5. A=25, B=40. Sum = 65." },
  { s: QA, q: "The value of 3 ÷ 18 of 3 × 6 − 22 × 6 ÷ 18 − 3 ÷ 2 + 10 − 3 ÷ 9 of 3 × 9 is:", o: ["1/3","1/2","−1/2","−1/3"], e: "Step-by-step BODMAS gives 1/3 − 22/3 − 3/2 + 10 − 1 = 9 − 7 − 3/2 = 1/2." },
  { s: QA, q: "Eighteen persons working 8 hours a day can complete 3 units of work in 10 days. How many days are required by 25 persons to complete 5 units of work working 6 hours a day?", o: ["12","10","20","16"], e: "1 unit = (18·8·10)/3 = 480 person-hours. 5 units = 2400. Days = 2400/(25·6) = 16 days." },
  { s: QA, q: "A 240 m long train overtakes a man walking at 6 km/h, in the same direction, in 9 seconds. How much time (in seconds) will it take to pass a 372 m long tunnel with the same speed?", o: ["20","20.4","18","21.6"], e: "Man's speed = 5/3 m/s. (Train−man)·9 = 240 → train = 85/3 m/s. Time = (240+372)/(85/3) = 612·3/85 = 21.6 s." },
  { s: QA, q: "Radha saves 25% of her income. If her expenditure increases by 20% and her income increases by 29%, then her savings increase by:", o: ["70%","52%","65%","56%"], e: "Income=100, savings=25, expenditure=75. New: income=129, expenditure=90, savings=39. Increase = 14/25·100 = 56%." },

  // ============ English Comprehension (76-100) ============
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence.\n\n'Can you give me so many examples of subordinate clauses?', the teacher asked the class.", o: ["some more examples of","No substitution required","some few examples of","some many examples of"], e: "'So many' is incorrect here. The teacher is asking for additional examples — 'some more examples of' fits." },
  { s: ENG, q: "Select the option that expresses the given sentence in reported speech.\n\n'Is he alright now?' I asked my neighbour's wife about her husband, Mr. Gulyani.", o: ["I asked Mrs. Gulyani, my neighbour's wife, if her husband had become alright then.","I asked Mrs. Gulyani, my neighbour's wife, if your husband will be alright now.","I asked Mrs. Gulyani, my neighbour's wife, if her husband is alright now.","I asked Mrs. Gulyani, my neighbour's wife, if her husband was alright then."], e: "Yes/no question with past reporting: 'is' becomes 'was', 'now' becomes 'then', 'your' becomes 'her'." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Terrorism","Alottment","Borrow","Allowance"], e: "'Alottment' is misspelled — correct is 'Allotment'." },
  { s: ENG, q: "The following sentence has been divided into parts. One of them may contain an error.\n\nThe river appears to have / got its name / from the town nearby.", o: ["No error","got its name","The river appears to have","from the town nearby"], e: "The sentence is grammatically correct. No error." },
  { s: ENG, q: "Select the most appropriate meaning of the following idiom.\n\nTo walk on air", o: ["To feel very depressed","To be very happy","To be very rich","To be completely free"], e: "'To walk on air' means to feel elated or extremely happy." },
  { s: ENG, q: "Select the most appropriate meaning of the following idiom.\n\nTo take a chill pill", o: ["To ask a doctor for medication","To calm down","To drink cold water","To gulp a tablet for a cold"], e: "'To take a chill pill' means to calm down or relax." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nPrompt", o: ["Slow","Lengthy","Quick","Gradual"], e: "'Prompt' (done without delay) — synonym 'Quick'." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Sincere","Grievance","Liesure","Seize"], e: "'Liesure' is misspelled — correct is 'Leisure'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nHelp from relatives ______ him in difficult times.", o: ["supported","passed","approved","allowed"], e: "'Supported' (gave assistance) fits — help from relatives supported him." },
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange them.\n\nA. While India is home to 75 per cent of the tigers in the world, the Global Tiger Day, as it is also known – sees awareness events organised in the country, as well as in neighbouring Bangladesh and Nepal.\nB. Its primary objective is to preserve the natural habitat of the tiger.\nC. International Tiger Day was initiated in 2010, at the Saint Petersburg Tiger Summit.\nD. This annual event observed on 29 July, aims to create awareness on tiger conservation.", o: ["BACD","CDBA","DCBA","CABD"], e: "C introduces. D follows with date/objective. B states primary objective. A elaborates further. Order: CDBA." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nPutrefy", o: ["Destroy","Contaminate","Combine","Decompose"], e: "'Putrefy' (to decay/rot) — antonym 'Combine' (to join together, opposite of breaking down)." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nThe sunrays burned my face.", o: ["My face is burned by the sunrays.","My face is being burned by the sunrays.","My face has been burned by the sunrays.","My face was burned by the sunrays."], e: "Past simple active 'burned' becomes passive 'was burned'." },
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange them.\n\nA. 'Excellently well,' said she; 'we have everything that we want; I have but one prayer, that we may have a heavy storm of rain to water our plants.'\nB. A man who had two daughters married one to a gardener and the other to a potter.\nC. Off he went to the potter's home and asked his other daughter how matters were with her.\nD. After a while, he paid a visit to the gardener's home and asked his daughter how she was, and how it fared with her.", o: ["BDAC","BCDA","DCAB","ACDB"], e: "B introduces the man and daughters. D — visits gardener's daughter. A — daughter's reply. C — visits potter's daughter. Order: BDAC." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nDedicated", o: ["Tedious","Committed","Dreary","Boring"], e: "'Dedicated' (devoted) — synonym 'Committed'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nHope", o: ["Chance","Courage","Optimism","Doubt"], e: "'Hope' (positive expectation) — antonym 'Doubt' (uncertainty)." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nThe woodcutter felled / some trees / with hardly / many effort at all.", o: ["some trees","with hardly","The woodcutter felled","many effort at all"], e: "'Effort' is uncountable; 'many' is for countable. With 'hardly', 'any effort at all' is the correct phrase." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe interviewer asked Gautam, 'Can you tell me what your ______ in life are?'", o: ["trivialities","aspirations","determinations","frivolities"], e: "'Aspirations' (hopes/ambitions) fits — typical interview question about life ambitions." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA self-governing country or region", o: ["Autonomy","Democracy","Anarchy","Monarchy"], e: "'Autonomy' refers to the right or condition of self-government." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA place where coins, medals or tokens are made", o: ["Workshop","Casting","Mill","Mint"], e: "A 'mint' is a place where coins, medals or tokens are produced under state authority." },
  { s: ENG, q: "Select the option that will improve the underlined part of the given sentence.\n\nFierce competition against restaurants has driven up the prices.", o: ["No improvement required","among","along","through"], e: "'Competition among restaurants' (rivalry within a group) fits — not 'against'." },
  { s: ENG, q: "Cloze passage on Communication.\n\nFill blank 1: 'Communication is a connection between people sharing information with (1)______ other.'", o: ["every","each","one","some"], e: "'Each other' is the standard reciprocal pronoun." },
  { s: ENG, q: "Fill blank 2: 'It is important in everyday life, (2)______ work...'", o: ["from","while","on","at"], e: "'At work' (while working) is the standard phrase." },
  { s: ENG, q: "Fill blank 3: '...nearly any time you interact with other (3)______.'", o: ["animals","creatures","ones","people"], e: "'People' fits — interaction with other people in everyday life." },
  { s: ENG, q: "Fill blank 4: 'Communication issues don't always happen (4)______ of your English level.'", o: ["about","beside","because","since"], e: "'Because of' (reason) fits — issues happen because of language proficiency level." },
  { s: ENG, q: "Fill blank 5: 'You can know how to speak English (5)______ knowing how to communicate in English.'", o: ["lacking","without","devoid","minus"], e: "'Without' (in the absence of) fits — speak English without knowing how to communicate." }
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
      tags: ['SSC', 'CGL', 'Tier-I', 'PYQ', '2020'],
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

  const TEST_TITLE = 'SSC CGL Tier-I - 13 August 2020 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2020, pyqShift: 'Shift-2', pyqExamName: 'SSC CGL Tier-I', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
