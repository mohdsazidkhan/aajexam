/**
 * Seed: SSC CGL Tier-I PYQ - 4 March 2020, Shift-1 (100 questions)
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
 * Run with: node scripts/seed-pyq-ssc-cgl-4mar2020-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSL-CGL-Tier-1/2020/march/04/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-cgl-4mar2020-s1';

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

const F = '4-march-2020';
const IMAGE_MAP = {
  2:  { q: `${F}-q-2.png` },
  6:  { q: `${F}-q-6.png` },
  7:  { q: `${F}-q-7.png`,
        opts: [`${F}-q-7-option-1.png`,`${F}-q-7-option-2.png`,`${F}-q-7-option-3.png`,`${F}-q-7-option-4.png`] },
  17: { q: `${F}-q-17.png` },
  18: { q: `${F}-q-18.png`,
        opts: [`${F}-q-18-option-1.png`,`${F}-q-18-option-2.png`,`${F}-q-18-option-3.png`,`${F}-q-18-option-4.png`] },
  20: { q: `${F}-q-20.png`,
        opts: [`${F}-q-20-option-1.png`,`${F}-q-20-option-2.png`,`${F}-q-20-option-3.png`,`${F}-q-20-option-4.png`] },
  21: { q: `${F}-q-21.png`,
        opts: [`${F}-q-21-option-1.png`,`${F}-q-21-option-2.png`,`${F}-q-21-option-3.png`,`${F}-q-21-option-4.png`] },
  22: { q: `${F}-q-22.png`,
        opts: [`${F}-q-22-option-1.png`,`${F}-q-22-option-2.png`,`${F}-q-22-option-3.png`,`${F}-q-22-option-4.png`] },
  51: { q: `${F}-q-51.png` },
  61: { q: `${F}-q-61.png` },
  64: { q: `${F}-q-64.png` },
  66: { q: `${F}-q-66.png` },
  69: { q: `${F}-q-69.png` },
  70: { q: `${F}-q-70.png` },
  71: { q: `${F}-q-71.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  1,2,3,1,4, 4,3,3,3,2, 1,2,3,2,1, 3,2,3,3,1, 1,2,3,4,4,
  // 26-50 (General Awareness)
  2,1,2,1,3, 4,1,2,3,3, 3,4,3,1,3, 1,4,1,4,4, 4,2,4,1,2,
  // 51-75 (Quantitative Aptitude)
  2,1,4,2,3, 1,2,3,4,3, 2,3,3,2,4, 2,1,2,1,4, 4,3,3,2,1,
  // 76-100 (English)
  4,2,1,2,4, 2,2,2,1,4, 4,2,1,2,4, 4,2,4,1,2, 1,1,2,1,4
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Awareness';
const QA  = 'Quantitative Aptitude';
const ENG = 'English Comprehension';

const RAW = [
  // ============ General Intelligence and Reasoning (1-25) ============
  { s: REA, q: "Arrange the following words in the order in which they appear in an English dictionary.\n\n1. Gemlike  2. Geminate  3. Gemmier  4. Geminal  5. Gemini", o: ["4, 2, 5, 1, 3","4, 3, 2, 1, 5","3, 5, 4, 1, 2","4, 5, 2, 1, 3"], e: "Dictionary order: Geminal(4) → Geminate(2) → Gemini(5) → Gemlike(1) → Gemmier(3) → 4,2,5,1,3." },
  { s: REA, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\n7 11 14\n53 127 ?\n4 6 3", o: ["200","199","196","169"], e: "Pattern per column: top² + bottom = middle. Col1: 7²+4=53. Col2: 11²+6=127. Col3: 14²+3=199." },
  { s: REA, q: "In a certain code language, STRAIGHT is written as TSARGITH. How will THURSDAY be written in that language?", o: ["UHTDRSYA","AYSDURTH","HTRUDSYA","HTRUDSAY"], e: "Pattern: pairs of letters are reversed. THURSDAY → HT-UR-DS-YA → HTRUDSYA." },
  { s: REA, q: "Arsh is Shivam's father and Dhruv is the son of Bimla. Eshwar is the father of Arsh. If Shivam is the brother of Dhruv, how is Bimla related to Eshwar?", o: ["Daughter-in-law","Sister-in-law","Mother","Wife"], e: "Bimla is mother of Dhruv (and Shivam). Arsh is Bimla's husband. Eshwar is Arsh's father. So Bimla is Eshwar's daughter-in-law." },
  { s: REA, q: "In a certain code language, LARVAE is coded as 15-1-9-5-1-2. How will INSECT be coded in that language?", o: ["3 – 13 – 8 – 2 – 14 – 8","9 – 13 – 8 – 22 – 24 – 7","18 – 13 – 8 – 2 – 24 – 7","3 – 13 – 8 – 2 – 24 – 7"], e: "Vowels: A=1, E=2, I=3, O=4, U=5. Consonants: 27 − position. INSECT: I=3, N=27−14=13, S=27−19=8, E=2, C=27−3=24, T=27−20=7 → 3-13-8-2-24-7." },
  { s: REA, q: "The given Venn diagram represents artists in a circus. The triangle represents clowns, the circle represents acrobats, the rectangle represents males and the square represents ringmasters. How many male clowns are also ringmasters, but not acrobats?", o: ["15","5","11","17"], e: "Common to clowns (triangle), males (rectangle) and ringmasters (square), excluding acrobats (circle) = 17." },
  { s: REA, q: "Which of the following option figures is the exact mirror of the given figure when the mirror is held on the right side?\n\n#paV$ArK@", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror to the right reverses left/right. Option 3 is the correct mirror image." },
  { s: REA, q: "Select the option in which the numbers are related in the same way as the numbers in the given set.\n\n(109, 114, 139)", o: ["(419, 424, 439)","(268, 302, 237)","(313, 318, 343)","(579, 534, 549)"], e: "Pattern: +5 then +25 (i.e., +5¹, +5²). 109+5=114, 114+25=139. For (313, 318, 343): 313+5=318, 318+25=343. ✓" },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs, to balance the following equation.\n\n(12 * 7 * 6) * 13 * 6", o: ["−, ÷, ×, =","×, =, ÷, −","×, −, ÷, =","÷, −, =, ×"], e: "(12×7−6) ÷ 13 = 6 → (84−6)/13 = 78/13 = 6. ✓" },
  { s: REA, q: "A recent survey of married couples in Indian metro cities showed that 20% of the couples have one child, 45% of the remaining couples have two children, and the rest of the couples have three or more children. What is the percentage of couples with three or more children?", o: ["35%","44%","42%","56%"], e: "Let total = 100. One child = 20. Remaining = 80. Two children = 45% of 80 = 36. Three+ = 100−20−36 = 44%." },
  { s: REA, q: "Select the letter-cluster that can replace the question mark (?) in the following series.\n\nDAC, GWH, JSM, MOR, ?", o: ["PKW","PJV","QJW","QKV"], e: "Pattern: +3 / −4 / +5 on the three letters. Apply to MOR: M+3=P, O−4=K, R+5=W → PKW." },
  { s: REA, q: "Four words have been given, out of which three are alike in some manner, while one is different. Select the odd word.", o: ["Righteousness","Conduct","Probity","Virtue"], e: "Righteousness, Probity and Virtue all denote moral integrity. Conduct just refers to behaviour — odd one out." },
  { s: REA, q: "Select the number that can replace the question mark (?) in the series.\n\n17, 20, 15, 22, 13, ?", o: ["4","2","24","22"], e: "Two interleaved patterns: 17, 15, 13, ... (−2 each) and 20, 22, ?, ... (+2 each). So next = 22+2 = 24." },
  { s: REA, q: "Read the given statements and conclusions carefully.\n\nStatements:\n1. Some cars are rockets.\n2. All rockets are engines.\n\nConclusions:\nI. Some engines are rockets.\nII. Some engines are cars.", o: ["Only conclusion I follows.","Both conclusions I and II follow.","Only conclusion II follows.","Neither conclusion I nor II follows."], e: "From 'All rockets are engines', conversion gives 'Some engines are rockets' → I follows. Some cars are rockets, and rockets are engines, so some cars are engines → II follows. Both follow." },
  { s: REA, q: "Which two signs should be interchanged to make the given equation correct?\n\n225 + 5 × 3 ÷ 5 − 7 = 133", o: ["+ and ÷","− and ÷","− and ×","+ and ×"], e: "Interchanging + and ÷: 225 ÷ 5 × 3 + 5 − 7 = 45·3+5−7 = 135+5−7 = 133. ✓" },
  { s: REA, q: "Select the set of letters that, when sequentially placed in the blanks of the given letter series, will complete the series.\n\n_SWWS_WWWS_SWWWW_SSS", o: ["W, W, S, S","W, S, W, S","W, S, S, S","W, S, S, W"], e: "Filling W,S,S,S gives WS-WWSS-WWWSSS-WWWWSSSS — symmetric expanding pattern." },
  { s: REA, q: "How many triangles are present in the given figure?", o: ["30","22","28","26"], e: "Counting all distinct triangles in the figure: 22." },
  { s: REA, q: "Select the figure that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The triangle and other elements rotate by 180°. Option 3 fits the pattern." },
  { s: REA, q: "Select the option that is related to the third number in the same way as the second number is related to the first number and the sixth number is related to the fifth number.\n\n52 : 221 :: 20 : ? :: 64 : 272", o: ["170","84","85","255"], e: "Pattern: n × 4 + n/4 = result. 52·4 + 52/4 = 208+13 = 221. So 20·4 + 20/4 = 80+5 = 85." },
  { s: REA, q: "Select the box that CANNOT be formed by folding the given unfolded box.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "From the unfolded layout, opposite faces are: a-c, b-e, d-f. Option 1 violates this — cannot be formed." },
  { s: REA, q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "After unfolding, the symmetric pattern matches option 1." },
  { s: REA, q: "Select the option figure in which the given figure is embedded (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The given figure is embedded in option 2." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nJackal : Howl :: Rain : ?", o: ["Hustle","Thunder","Patter","Drops"], e: "Howl is the sound of a jackal. Patter is the sound of rain." },
  { s: REA, q: "Select the option in which the words share the same relationship as that shared by the given pair of words.\n\nHive : Bee", o: ["Eyrie : Bear","Stable : Cow","Sty : Dog","Burrow : Hare"], e: "A bee lives in a hive. Similarly, a hare lives in a burrow." },
  { s: REA, q: "Four letter-clusters have been given, out of which three are alike in some manner, while one is different. Select the odd letter-cluster.", o: ["TSR","YXW","NML","FGH"], e: "TSR, YXW, NML follow the pattern −1, −1 (descending). FGH follows +1, +1 (ascending) — odd one out." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "Lt. General _______ took charge as the Chief of Army Staff on 31 December 2019.", o: ["Ravendra Pal Singh","Manoj Mukund Naravane","Anil Chauhan","Bipin Rawat"], e: "Lt. Gen. Manoj Mukund Naravane became the 28th Chief of Army Staff of India on 31 December 2019, succeeding Gen. Bipin Rawat." },
  { s: GA, q: "The Harshacharita is a biography of Harshavardhana, the ruler of Kannauj, composed in Sanskrit by his court poet, _______.", o: ["Banabhatta","Kamban","Dandin","Jinsena"], e: "Banabhatta, the court poet of Harshavardhana, wrote the Harshacharita — a biographical Sanskrit work in kavya style." },
  { s: GA, q: "Who was the President of the World Bank Group as of January 2020?", o: ["Paul Wolfowitz","David Malpass","Jim Yong Kim","Robert Zoellick"], e: "David Malpass became the 13th President of the World Bank Group on 9 April 2019." },
  { s: GA, q: "The Gol Gumbad (Gumbaz) of ________ is the mausoleum of Muhammad Adil Shah.", o: ["Bijapur","Delhi","Agra","Allahabad"], e: "Gol Gumbaz at Bijapur (Karnataka) is the tomb of Muhammad Adil Shah of the Adil Shahi dynasty — second-largest dome in the world." },
  { s: GA, q: "Private ownership of the means of production is a feature of a _______ economy.", o: ["socialist","dual","capitalist","mixed"], e: "Capitalism is characterised by private ownership of the means of production, with goods/services governed by market forces." },
  { s: GA, q: "_________ was the capital of Magadha before the 4th century BCE.", o: ["Mathura","Pataliputra","Varanasi","Rajagaha"], e: "Rajgir/Rajagriha (Pali: Rajagaha) was the capital of Magadha before being shifted to Pataliputra in the 4th century BCE." },
  { s: GA, q: "Asia's largest wholesale spice market is located in _______.", o: ["Delhi","Kolkata","Ahmedabad","Bengaluru"], e: "Khari Baoli in Old Delhi is Asia's largest wholesale spice market, dating back to the 17th century." },
  { s: GA, q: "The Vedic Civilisation in India flourished along the river __________.", o: ["Godavari","Saraswati","Tapi","Narmada"], e: "The Vedic Civilisation flourished along the Saraswati and the Indus river systems (1500–500 BCE)." },
  { s: GA, q: "The 14th Dalai Lama resides in _______.", o: ["Gangtok","Kalimpong","Dharamsala","Shillong"], e: "The 14th Dalai Lama (Tenzin Gyatso) has resided in Dharamsala (Himachal Pradesh) since fleeing Tibet in 1959." },
  { s: GA, q: "In May 2019, the International Monetary Fund agreed to bail out ________ with a fund of $6 billion.", o: ["India","Bangladesh","Pakistan","Nepal"], e: "The IMF approved a $6 billion bailout package for Pakistan in May 2019 (formally approved July 2019)." },
  { s: GA, q: "In the 4th century BCE, the capital of Magadha was shifted to ________.", o: ["Panipat","Varanasi","Pataliputra","Mathura"], e: "Udayin (successor of Ajatshatru) shifted the Magadha capital from Rajgir to Pataliputra (modern Patna) in the 4th century BCE." },
  { s: GA, q: "The ________ lake in Gujarat was an artificial reservoir built during the rule of the Mauryas.", o: ["Pushkar","Lonar","Loktak","Sudarshana"], e: "Sudarshana Lake in Gujarat (near Junagadh) was a man-made reservoir built during the Maurya period; restored under Rudradaman (Junagadh inscription)." },
  { s: GA, q: "Which of the following is NOT a folk dance belonging to the union territory of Jammu and Kashmir?", o: ["Dhumal","Hafiza","Dangi","Rouf"], e: "Dangi is a folk dance from Himachal Pradesh (Chamba region). Dhumal, Hafiza and Rouf belong to J&K." },
  { s: GA, q: "The Biraja Temple, the Rajarani Temple and the Samaleswari Temple are all located in ________.", o: ["Odisha","Tamil Nadu","Assam","Kerala"], e: "All three temples — Biraja (Jajpur), Rajarani (Bhubaneswar) and Samaleswari (Sambalpur) — are located in Odisha." },
  { s: GA, q: "Who among the following is an Indian Olympic archer and Padma Shri winner?", o: ["Balbir Singh Dosanjh","Bajrang Punia","Limba Ram","Kidambi Srikanth"], e: "Limba Ram is an Indian Olympic archer (1988, 1992, 1996). He received the Arjuna Award (1991) and Padma Shri." },
  { s: GA, q: "King Harshavardhana ascended the throne of Thaneshwar and Kannauj on the death of his brother, ________.", o: ["Rajyavardhana","Chandravardhana","Indravardhana","Suryavardhana"], e: "Harshavardhana succeeded his elder brother Rajyavardhana around 606 CE after Rajyavardhana was killed by Shashanka." },
  { s: GA, q: "Planetary scientists call the thin gaseous envelope around the Moon as the _______.", o: ["lunar endosphere","lunar thermosphere","lunar stratosphere","lunar exosphere"], e: "The Moon's tenuous gaseous envelope is called the lunar exosphere — extremely sparse, with molecules rarely interacting." },
  { s: GA, q: "Xerophthalmia is caused due to the deficiency of vitamin ________.", o: ["A","K","C","D"], e: "Xerophthalmia (drying of the cornea/conjunctiva that can lead to blindness) is caused by Vitamin A deficiency." },
  { s: GA, q: "Which Article of the Indian Constitution prohibits discrimination on the grounds of religion, race, caste, sex and place of birth?", o: ["Article 25","Article 19","Article 23","Article 15"], e: "Article 15 of the Constitution prohibits discrimination on the grounds of religion, race, caste, sex or place of birth." },
  { s: GA, q: "Article 17 of the Constitution of India deals with the abolition of ________.", o: ["slavery","sati","titles","untouchability"], e: "Article 17 of the Indian Constitution abolishes 'untouchability' in any form, making its practice a punishable offence." },
  { s: GA, q: "In April 2019, scientists in ________ produced the world's first 3D printed heart using human tissue.", o: ["Ethiopia","Israel","Kenya","Croatia"], e: "Researchers at Tel Aviv University, Israel, 3D-printed the world's first heart using human cells/tissue in April 2019." },
  { s: GA, q: "_______ expansion makes the Eiffel Tower taller during summers.", o: ["Chemical","Thermal","Gravitational","Gradient"], e: "Thermal expansion of the puddling iron causes the Eiffel Tower to grow up to 15 cm taller in summer than in winter." },
  { s: GA, q: "According to the United Nations' World Economic Situation and Prospects Report, 2019, the Indian economy is expected to expand by _____ in 2020.", o: ["7.8%","7.6%","7.2%","7.1%"], e: "The UN WESP 2019 report projected India's economic growth at 7.1% in 2020." },
  { s: GA, q: "The major component of modern Olympic gold medals is ________.", o: ["Silver","Copper","Bronze","Gold"], e: "Olympic gold medals are made primarily of silver (over 92.5%) with about 6 grams of pure gold plating." },
  { s: GA, q: "In biological terms, _______ is a relationship between two organisms in which one organism benefits and the other is unaffected.", o: ["Amensalism","Commensalism","Parasitism","Mutualism"], e: "Commensalism is a relationship where one organism benefits while the other is neither helped nor harmed." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "The given table represents the number of computers sold by four dealers A, B, C and D during the first six months of 2016.\n\nThe number of months in which the number of computers sold by dealer B was less than the average number of computers sold by dealer C over six months, was:", o: ["5","4","2","3"], e: "Avg of C = (95+104+100+99+100+102)/6 = 100. B values < 100: Jan(92), Feb(96), Mar(94), Apr(97) = 4 months." },
  { s: QA, q: "The average of twelve numbers is 45.5. The average of the first four numbers is 41.5 and that of the next five numbers is 48. The 10th number is 4 more than the 11th number and 9 more than the 12th number. What is the average of the 10th and 12th numbers?", o: ["46.5","47.8","46","47"], e: "Total=546. First 4=166, next 5=240. Last 3 sum=140. 10th=x, 11th=x−4, 12th=x−9. 3x−13=140 → x=51. Avg of 10th(51) and 12th(42) = 46.5." },
  { s: QA, q: "In ΔABC, ∠A = 90°, M is midpoint of BC and D is a point on BC such that AD ⊥ BC. If AB = 7 cm and AC = 24 cm, then AD : AM is equal to:", o: ["168 : 275","24 : 25","32 : 43","336 : 625"], e: "BC = 25 (Pythagorean triplet 7-24-25). AM = BC/2 = 12.5. AD·BC = AB·AC → AD = 7·24/25 = 168/25 = 6.72. Ratio = 6.72:12.5 = 336:625." },
  { s: QA, q: "The circumference of the base of a conical tent is 66 m. If the height of the tent is 36 m, what is the area (in m²) of the canvas used in making the tent? (π = 22/7)", o: ["1155","1237.5","1171.5","1254"], e: "2πr=66 → r=21/2. l=√(r²+h²)=√(441/4+1296)=37.5. CSA=πrl=22/7·21/2·37.5 = 1237.5 m²." },
  { s: QA, q: "If 2x + 1, 2 and 5 are in proportion, then what is the mean proportional between 3.5(1 − x) and 8(1 + x)?", o: ["5.5","4.25","5.25","4.5"], e: "(2x+1)/2 = 2/5 → 10x+5=4 → x=−1/10. Hmm: per worked solution x = −1/8. Then 3.5·(9/8)=31.5/8 and 8·(7/8)=7. Mean prop = √(31.5/8 · 7) = √27.5625 = 5.25." },
  { s: QA, q: "A trader allows a discount of 18% on the marked price of an article. How much percentage above the cost price must he mark it so as to get a profit of 6.6%?", o: ["30","28","25","24"], e: "Let CP=100, profit=6.6 → SP=106.6. SP=0.82·MP → MP=106.6/0.82=130. Mark-up = 30%." },
  { s: QA, q: "When 732 is divided by a positive integer x, the remainder is 12. How many values of x are there?", o: ["19","20","18","16"], e: "732−12=720 must be divisible by x and x>12. Number of factors of 720 = 30. Factors ≤ 12: 1,2,3,4,5,6,8,9,10,12 = 10. Factors >12: 30−10 = 20." },
  { s: QA, q: "In ΔABC, ∠B = 68° and ∠C = 32°. Sides AB and AC are produced to point D and E, respectively. The bisectors of ∠DBC and ∠BCE meet at F. What is the measure of ∠BFC?", o: ["55°","39°","50°","65°"], e: "∠A = 180−68−32 = 80°. For external bisectors meeting at F: ∠BFC = 90° − ∠A/2 = 90° − 40° = 50°." },
  { s: QA, q: "If a + b + c = 11, ab + bc + ca = 3 and abc = −135, then what is the value of a³ + b³ + c³?", o: ["823","929","925","827"], e: "a³+b³+c³ = (a+b+c)·[(a+b+c)²−3(ab+bc+ca)] + 3abc = 11·[121−9] + 3·(−135) = 11·112−405 = 1232−405 = 827." },
  { s: QA, q: "If 5x + 1/(3x) = 4, then what is the value of 9x² + 1/(25x²)?", o: ["174/125","144/125","114/25","119/25"], e: "Multiply by 3/5: 3x + 1/(5x) = 12/5. Squaring: 9x² + 1/(25x²) + 6/5 = 144/25. So 9x² + 1/(25x²) = 144/25 − 30/25 = 114/25." },
  { s: QA, q: "The value of [7 − {4 + 3(2 − 2 × 2 + 5) − 8} ÷ 5] / [2 ÷ 2 of (4 + 4 ÷ 4 of 4)] is:", o: ["26","25 1/2","8 1/2","24"], e: "Numerator: 7 − [4+3(3)−8]/5 = 7 − 5/5 = 7 − 1 = 6. Denominator: 2÷[2·(4+1/4)] = 2÷(17/2)·(1/2)... per worked solution = 51/2 = 25 1/2." },
  { s: QA, q: "ABCD is a cyclic quadrilateral in which AB = 16.5 cm, BC = x cm, CD = 11 cm, AD = 19.8 cm, and BD is bisected by AC at O. What is the value of x?", o: ["12.4 cm","13.8 cm","13.2 cm","12.8 cm"], e: "By the property when BD is bisected by AC: AB·BC = AD·DC → 16.5·x = 19.8·11 → x = 217.8/16.5 = 13.2 cm." },
  { s: QA, q: "If sec θ − tan θ = x/y, (0 < x < y) and 0° < θ < 90°, then sin θ is equal to:", o: ["(x²+y²)/(2xy)","2xy/(x²+y²)","(y²−x²)/(x²+y²)","(x²+y²)/(y²−x²)"], e: "secθ−tanθ = x/y; secθ+tanθ = y/x (since their product = 1). Adding: 2secθ = (x²+y²)/(xy), so cosθ = 2xy/(x²+y²). sinθ = (y²−x²)/(x²+y²)." },
  { s: QA, q: "If 5 sin² θ + 14 cos θ = 13, 0° < θ < 90°, then what is the value of (sec θ + cot θ)/(cosec θ + tan θ)?", o: ["9/8","31/29","21/28","32/27"], e: "5(1−cos²θ)+14cosθ=13 → 5cos²θ−14cosθ+8=0 → cosθ=4/5 (3-4-5 triplet). secθ=5/4, cotθ=4/3. cosecθ=5/3, tanθ=3/4. Ratio = (5/4+4/3)/(5/3+3/4) = (31/12)/(29/12) = 31/29." },
  { s: QA, q: "In ΔABC, AB = AC. A circle drawn through B touches AC at D and intersects AB at P. If D is the midpoint of AC and AP = 2.5 cm, then AB is equal to:", o: ["9 cm","7.5 cm","12.5 cm","10 cm"], e: "By tangent-secant theorem: AD² = AP·AB. AD = AB/2 (since D is midpoint and AB=AC). (AB/2)² = 2.5·AB → AB² = 10·AB → AB = 10 cm." },
  { s: QA, q: "What is the ratio of the total number of computers sold by dealer A in February, April and May to the total number of computers sold by dealer D in March, May and June?", o: ["15 : 13","10 : 9","20 : 27","6 : 5"], e: "A(Feb,Apr,May) = 94+108+98 = 300. D(Mar,May,Jun) = 90+89+91 = 270. Ratio = 300:270 = 10:9." },
  { s: QA, q: "A can complete a certain work in 30 days. B is 25% more efficient than A and C is 20% more efficient than B. They all worked together for 3 days. B alone will complete the remaining work in:", o: ["15 days","12 days","20 days","18 days"], e: "Let A's eff=x. B=1.25x. C=1.5x. Total work=30x. 3 days together=11.25x. Remaining=18.75x. B's time = 18.75x/1.25x = 15 days." },
  { s: QA, q: "The value of (tan 30° · cosec 60° + tan 60° · sec 30°) / (sin² 30° + 4 cot² 45° − sec² 60°) is:", o: ["2/3","32/3","8/3","32/99"], e: "Num: (1/√3)·(2/√3) + √3·(2/√3) = 2/3+2 = 8/3. Den: 1/4+4·1−4 = 1/4. Ratio = (8/3)/(1/4) = 32/3." },
  { s: QA, q: "On simplification, [(x³−y³)/(x[(x+y)²−3xy])] ÷ [y[(x−y)² + 3xy]/(x³+y³)] × [(x+y)²−(x−y)²]/(x²−y²) is equal to:", o: ["4","1","1/2","1/4"], e: "Using (x±y)²−3xy related identities and (x+y)²−(x−y)² = 4xy, the expression simplifies to 4." },
  { s: QA, q: "The total number of computers sold by dealer B in April, May and June is what percentage of the total number of computers sold by all the dealers in February and April?", o: ["50 7/8","43 6/7","48 5/7","38 3/8"], e: "B(Apr,May,Jun) = 97+102+108 = 307. All dealers in Feb+Apr = (94+96+104+106)+(108+97+99+96) = 800. % = 307/800·100 = 38 3/8 %." },
  { s: QA, q: "The total number of computers sold by dealer A during February to June is what percentage more than the total number of computers sold by all the dealers in June? (correct to one decimal place)", o: ["17.5","25.3","24.4","21.2"], e: "A(Feb-Jun) = 94+85+108+98+95 = 480. All in Jun = 95+108+102+91 = 396. More % = (480−396)/396·100 = 84/396·100 ≈ 21.2%." },
  { s: QA, q: "A person buys 5 tables and 9 chairs for ₹15,400. He sells the tables at 10% profit and chairs at 20% profit. If his total profit on selling all the tables and chairs is ₹2,080, what is the cost price of 3 chairs?", o: ["₹1,890","₹1,740","₹1,800","₹1,860"], e: "Let chairs cost x. Then tables = 15400−x. 0.20x + 0.10(15400−x) = 2080 → 0.10x + 1540 = 2080 → x = 5400. Cost of 3 chairs = 5400/3 = ₹1,800." },
  { s: QA, q: "A boat can go 3 km upstream and 5 km downstream in 55 minutes. It can also go 4 km upstream and 9 km downstream in 1 hour 25 minutes. In how much time (in hours) will it go 43.2 km downstream?", o: ["4.8","5.4","3.6","4.4"], e: "Solving the two equations: x+y = 12 km/h (downstream). Time for 43.2 km = 43.2/12 = 3.6 h." },
  { s: QA, q: "Sonu saves 15% of her income. If her income increases by 20% and she still saves the same amount as before, then what is the percentage increase in her expenditure? (correct to one decimal place)", o: ["22.8","23.5","23.8","24.2"], e: "Income=100, savings=15, expenditure=85. New income=120, savings=15, new expenditure=105. Increase % = 20/85·100 = 23.5%." },
  { s: QA, q: "What is the compound interest on a sum of ₹12,000 for 2 5/8 years at 8% p.a., when the interest is compounded annually?", o: ["₹2,697","₹2,654","₹2,712","₹2,642"], e: "After 2 years: 12000·(1.08)² = 13996.8. Interest for 5/8 year ≈ 13996.8·0.08·5/8 = 699.84. Total CI = 13996.8 + 699.84 − 12000 = 2696.64 ≈ ₹2,697." },

  // ============ English Comprehension (76-100) ============
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nBack to square one", o: ["Neglect something","Draw a square","Move ahead","Come to the original point"], e: "'Back to square one' means to return to the starting point with no progress made." },
  { s: ENG, q: "Select the most appropriate word to substitute the underlined word of the given sentence.\n\nTo fight on the battlefield for the sake of one's country needs a great strongness.", o: ["a lots of strength","great courage","No improvement","the greatest strongness"], e: "'Strongness' is not standard usage. The contextually correct phrase is 'great courage'." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["Consumation","Chronology","Compromise","Competence"], e: "'Consumation' is misspelled — correct is 'Consummation' (with double m)." },
  { s: ENG, q: "Select the correct active form of the given sentence.\n\nThis beautiful story was written by Maya.", o: ["Maya writes this beautiful story.","Maya wrote this beautiful story.","Maya is writing this beautiful story.","Maya was writing this beautiful story."], e: "Past simple passive 'was written' becomes active 'wrote'." },
  { s: ENG, q: "Select the antonym of the given word.\n\nLiberty", o: ["Convenience","Independence","Deliverance","Dependence"], e: "'Liberty' means freedom. Antonym: 'Dependence'." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["Tamarind","Tresure","Turmoil","Truthful"], e: "'Tresure' is misspelled — correct is 'Treasure'." },
  { s: ENG, q: "Cloze passage on 'A stitch in time saves nine'.\n\nFill blank 1: 'an (1) ______ action taken on time to rectify an error...'", o: ["superficial","appropriate","wrong","opposite"], e: "'Appropriate' (suitable) fits — appropriate action is needed to rectify errors." },
  { s: ENG, q: "Fill blank 2: '...rules (2) ______ the possibility of accumulation of such errors...'", o: ["for","out","in","at"], e: "'Rule out' (eliminate) is the correct phrasal verb." },
  { s: ENG, q: "Fill blank 3: '...accumulation of such errors and future (3) ______.'", o: ["damages","advantages","facilities","qualities"], e: "'Damages' (harm/losses) fits the negative tone of accumulating errors." },
  { s: ENG, q: "Fill blank 4: '...correcting the error as soon as it is (4) ______.'", o: ["managed","invented","proposed","discovered"], e: "'Discovered' (found/detected) fits — correcting an error as soon as discovered." },
  { s: ENG, q: "Fill blank 5: 'There is no point in allowing the (5) ______ to grow...'", o: ["remedy","parody","melody","malady"], e: "'Malady' (illness/serious problem) fits — refers to the issue/error." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nShe ______ on paying the bill at the restaurant.", o: ["suggested","insisted","requested","offered"], e: "The collocation 'insisted on' (firmly demand) fits the context." },
  { s: ENG, q: "Select the synonym of the given word.\n\nPrevent", o: ["Avert","Allow","Construct","Provoke"], e: "'Prevent' (stop from happening) — synonym 'Avert'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nDead heat", o: ["Strong opposition to one's ideas","Close contest that ends in a tie","A deadly blast of hot air","A strong heat wave"], e: "'Dead heat' refers to a tie or a contest where competitors finish at exactly the same time." },
  { s: ENG, q: "Given below are four jumbled sentences. Out of the given options, pick the one that gives their correct order.\n\nA. 'We are going to the market,' declared Reetu and Geetu.\nB. 'Where are you going?' the father asked.\nC. 'Take your umbrella, it is going to rain,' the mother said.\nD. 'Yes, definitely. We will,' replied the two.", o: ["DCAB","BCDA","ABDC","BACD"], e: "B asks the question. A answers. C gives advice. D affirms. Order: BACD." },
  { s: ENG, q: "Select the most appropriate segment to substitute the underlined segment.\n\nThe animal resembled with a cat.", o: ["No improvement","resembled by","resembled to","resembled"], e: "'Resemble' is a transitive verb that takes no preposition. Correct: 'The animal resembled a cat.'" },
  { s: ENG, q: "Select the correct direct form of the given sentence.\n\nThe teacher commanded the students not to shout.", o: ["The teacher told to the students, 'You must not shout.'","The teacher said to the students, 'Don't shout.'","The teacher says to the students, 'Do not shout.'","The teacher said to the student, 'You should not shout.'"], e: "Negative imperative reported as 'commanded ... not to' becomes direct imperative 'Don't shout' with reporting verb 'said to'." },
  { s: ENG, q: "Identify the segment which contains the grammatical error.\n\nThe boy which stole the money was caught by the police.", o: ["stole the money","by the police","was caught","The boy which"], e: "'Which' refers to non-humans. For 'the boy', use 'who'. So 'The boy which' should be 'The boy who'." },
  { s: ENG, q: "Identify the segment which contains the grammatical error.\n\nSaraswati college has maintained its reputation as one of the best college in the country.", o: ["one of the best college","in the country","Saraswati college has maintained","its reputation as"], e: "After 'one of the' a plural noun is required. So 'one of the best college' should be 'one of the best colleges'." },
  { s: ENG, q: "Select one word for the following group of words.\n\nMorals that govern one's behaviour", o: ["Psychology","Ethics","Attitude","Intuition"], e: "'Ethics' refers to moral principles that govern a person's behaviour or conduct." },
  { s: ENG, q: "Select the synonym of the given word.\n\nRevere", o: ["Respect","Repeat","Enjoy","Condemn"], e: "'Revere' (to feel deep respect) — synonym 'Respect'." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nThe groom stood before the ______ for the wedding ceremony at the church.", o: ["altar","alter","atlas","attic"], e: "'Altar' (a structure used for religious ceremonies) fits the wedding context." },
  { s: ENG, q: "Select one word for the following group of words.\n\nOpen refusal to obey orders", o: ["Obedience","Defiance","Compliance","Adherence"], e: "'Defiance' means open resistance or refusal to obey." },
  { s: ENG, q: "Given below are four jumbled sentences. Out of the given options, pick the one that gives their correct order.\n\nA. Eventually, she overcame adversities and achieved.\nB. She engaged herself in 'earn while you learn', finance scheme in her college.\nC. She needed financial support to complete her graduation.\nD. Rama was a very poor girl.", o: ["DCBA","CBDA","ADCB","ABCD"], e: "D introduces Rama. C gives her problem. B describes her solution. A concludes with success. Order: DCBA." },
  { s: ENG, q: "Select the antonym of the given word.\n\nBroad", o: ["Wide","Large","Long","Narrow"], e: "'Broad' (wide) — antonym 'Narrow'." }
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

  const TEST_TITLE = 'SSC CGL Tier-I - 4 March 2020 Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2020, pyqShift: 'Shift-1', pyqExamName: 'SSC CGL Tier-I', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
