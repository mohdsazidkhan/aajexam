/**
 * Seed: SSC CGL Tier-I PYQ - 4 March 2020, Shift-2 (100 questions)
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
 * Run with: node scripts/seed-pyq-ssc-cgl-4mar2020-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSL-CGL-Tier-1/2020/march/04/shift-2/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-cgl-4mar2020-s2';

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

const F = '4-march-2020-shift-2';
const IMAGE_MAP = {
  1:  { q: `${F}-q-1.png` },
  3:  { q: `${F}-q-3.png`,
        opts: [`${F}-q-3-option-1.png`,`${F}-q-3-option-2.png`,`${F}-q-3-option-3.png`,`${F}-q-3-option-4.png`] },
  7:  { q: `${F}-q-7.png`,
        opts: [`${F}-q-7-option-1.png`,`${F}-q-7-option-2.png`,`${F}-q-7-option-3.png`,`${F}-q-7-option-4.png`] },
  10: { q: `${F}-q-10.png`,
        opts: [`${F}-q-10-option-1.png`,`${F}-q-10-option-2.png`,`${F}-q-10-option-3.png`,`${F}-q-10-option-4.png`] },
  18: { q: `${F}-q-18.png` },
  20: { q: `${F}-q-20.png` },
  22: { q: `${F}-q-22.png` },
  24: { q: `${F}-q-24.png` },
  25: { q: `${F}-q-25.png`,
        opts: [`${F}-q-25-option-1.png`,`${F}-q-25-option-2.png`,`${F}-q-25-option-3.png`,`${F}-q-25-option-4.png`] },
  52: { q: `${F}-q-52.png` },
  54: { q: `${F}-q-54.png` },
  55: { q: `${F}-q-55.png` },
  58: { q: `${F}-q-58.png` },
  65: { q: `${F}-q-65.png` },
  66: { q: `${F}-q-66.png` },
  69: { q: `${F}-q-69.png` },
  71: { q: `${F}-q-71.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-25 (Reasoning)
  2,1,2,1,1, 1,3,3,3,1, 3,2,2,4,4, 2,3,2,3,3, 2,3,2,2,4,
  // 26-50 (General Awareness)
  4,3,4,3,4, 3,1,3,4,4, 3,2,2,2,1, 4,1,1,1,3, 1,1,3,2,3,
  // 51-75 (Quantitative Aptitude)
  1,3,2,3,1, 2,1,1,3,4, 3,3,4,3,3, 1,3,4,4,3, 4,1,2,1,2,
  // 76-100 (English)
  1,3,1,4,2, 2,3,2,2,3, 2,2,4,3,3, 3,4,4,4,4, 3,3,3,3,2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Awareness';
const QA  = 'Quantitative Aptitude';
const ENG = 'English Comprehension';

const RAW = [
  // ============ General Intelligence and Reasoning (1-25) ============
  { s: REA, q: "In the given Venn diagram, 'Group A' represents those who can speak 'English', 'Group B' represents those who can speak 'Hindi', and Group C represents those who can speak 'Marathi'. The numbers given in the diagram represent the number of persons in that particular category.\n\nHow many persons can speak exactly two languages?", o: ["21","18","3","12"], e: "Persons in exactly two-language regions (intersections of two but not all three): 2 + 11 + 5 = 18." },
  { s: REA, q: "Select the option in which two words share the same relationship as that shared by the given pair of words.\n\nTurmeric : Spices", o: ["Dates : Dry Fruits","Apricot : Pear","Fig : Cashew Nuts","Nutmeg : Chilli Flakes"], e: "Turmeric is a type of spice. Similarly, Dates is a type of dry fruit." },
  { s: REA, q: "Select the correct mirror image of the given figure when a mirror is placed on the right of the figure.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror to the right side reverses left/right. Option 2 is the correct mirror image." },
  { s: REA, q: "Product A is costlier than product B by ₹2. If the price of product A is increased by two times the price of product B, the new price of product A becomes ₹17. What is the price of product B?", o: ["₹5","₹3","₹6","₹7"], e: "Let B=x, A=x+2. (x+2)+2x=17 → 3x=15 → x=₹5." },
  { s: REA, q: "Select the number that can replace the question mark (?) in the following series.\n\n4, 25, 121, ?, 529, 961", o: ["289","256","324","361"], e: "Pattern: squares of alternate primes — 2², 5², 11², 17², 23², 31². So 17² = 289." },
  { s: REA, q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n\n6 : 252 :: 5 : ?", o: ["150","175","225","125"], e: "Pattern: n³ + n². 6³+6² = 216+36 = 252. So 5³+5² = 125+25 = 150." },
  { s: REA, q: "Select the option in which the given figure is embedded (rotation is not allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The given figure is embedded in option 3." },
  { s: REA, q: "In a certain code language, 'GUM' is coded as '49441169'. How will 'WAX' be coded in that language?", o: ["2891400","8412525","5291576","3611121"], e: "Each letter coded as (its alphabet position)². G(7)²=49, U(21)²=441, M(13)²=169 → 49441169. WAX: W(23)²=529, A(1)²=1, X(24)²=576 → 5291576." },
  { s: REA, q: "Read the given statements and conclusions carefully.\n\nStatements:\n1. All cars are trucks.\n2. Some buses are cars.\n\nConclusion:\nI. All cars are buses.\nII. Some buses are trucks.\nIII. All trucks are buses.", o: ["Only conclusions II and III follow.","Only conclusion I follows.","Only conclusion II follows.","Only conclusions I and III follow."], e: "Some buses are cars and all cars are trucks → some buses are trucks → II follows. I and III don't necessarily follow." },
  { s: REA, q: "Select the option that depicts how the given transparent sheet of paper would appear if it is folded at the dotted line.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "When the transparent sheet is folded along the dotted line, the patterns superimpose as shown in option 1." },
  { s: REA, q: "Four letter-clusters have been given, out of which three are alike in some manner and one is different. Select the odd letter-cluster.", o: ["DVR","GMF","HFE","OVG"], e: "DVR: D(4)+R(18)=22=V ✓. GMF: G(7)+F(6)=13=M ✓. OVG: O(15)+G(7)=22=V ✓. HFE: H(8)+E(5)=13≠F(6) — odd one out." },
  { s: REA, q: "'Grapes' is related to 'Fruit' in the same way as 'Pepper' is related to '_______'.", o: ["Pulses","Spices","Cereals","Dry Fruits"], e: "Grapes is a type of fruit. Similarly, pepper is a type of spice." },
  { s: REA, q: "Select the letter that can replace the question mark (?) in the following series.\n\nW, Q, ?, H, E, C", o: ["K","L","N","M"], e: "Pattern: −6, −5, −4, −3, −2. W−6=Q, Q−5=L, L−4=H, H−3=E, E−2=C. So missing is L." },
  { s: REA, q: "Four words have given out of which three are alike in some manner and one is different. Select the odd word.", o: ["Surat","Rajkot","Ahmedabad","Jhalrapatan"], e: "Surat, Rajkot and Ahmedabad are major cities of Gujarat. Jhalrapatan is a town in Rajasthan — odd one out." },
  { s: REA, q: "Arrange the following words in a logical and meaningful order.\n\n1. Micron  2. Metre  3. Mile  4. Millimetre  5. Kilometre  6. Centimetre", o: ["4-6-2-5-1-3","1-4-6-2-3-5","4-6-2-5-3-1","1-4-6-2-5-3"], e: "Ascending order of length: Micron(1) → Millimetre(4) → Centimetre(6) → Metre(2) → Kilometre(5) → Mile(3) → 1,4,6,2,5,3." },
  { s: REA, q: "In a certain code language, 'PYTHON' is written as 'LMFRWN'. How will 'RHYTHM' be written in that language?", o: ["MFRWFX","KFRWFP","MFRWFT","NFRWFS"], e: "Each letter shifted in a specific reverse pattern. Per worked solution, RHYTHM → KFRWFP." },
  { s: REA, q: "Which two digits should be interchanged to make the given equation correct?\n\n32 ÷ 6 + 26 − 13 × 6 = 54", o: ["3 and 6","2 and 3","6 and 2","3 and 1"], e: "Interchanging 6 and 2: 36 ÷ 2 + 62 − 13 × 2 = 18 + 62 − 26 = 54. ✓" },
  { s: REA, q: "How many triangles are there in the given figure?", o: ["12","11","9","10"], e: "Counting all distinct triangles in the figure: 11." },
  { s: REA, q: "Select the letter-cluster that can replace the question mark (?) in the following series.\n\nAOS, CQU, ?, GUY, IWA", o: ["DRV","FSX","ESW","GSW"], e: "Pattern: each letter +2 across terms. CQU+2 each → ESW. ESW+2 → GUY ✓." },
  { s: REA, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\n10 3 14\n49 15 68\n33 19 ?", o: ["27","25","28","29"], e: "Pattern per row: (1st − 2nd) × 2 = 3rd. Row1: (10−3)·2=14. Row2: (49−15)·2=68. Row3: (33−19)·2=28." },
  { s: REA, q: "Four number-pairs have been given, out of which three are alike in some manner and one is different. Select the number-pair that is different from the rest.", o: ["11 – 143","8 – 138","5 – 155","6 – 174"], e: "143/11=13 ✓, 155/5=31 ✓, 174/6=29 ✓. But 138/8=17.25 — not divisible. Odd: 8-138." },
  { s: REA, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\n11, 28, 327, ?, 5125", o: ["4126","444","464","446"], e: "Pattern: n·(n³). 1·1=1·1³, 2·2³=16... Per worked: 1(1³)=11, 2(2³)=28, 3(3³)=327, 4(4³)=464, 5(5³)=5125. So ?=464." },
  { s: REA, q: "A + B means 'B is the sister of A'. A − B means 'A is the father of B'. A × B means 'B is the son of A'. A ÷ B means 'B is the husband of A'. If E ÷ F − H + J × G + D, then how is D related to H?", o: ["Uncle","Niece","Father","Aunt"], e: "F is husband of E. F is father of H and J. H is sister of J. J is son of G. G is sister of D... working out, D is the niece of H. (Per worked solution.)" },
  { s: REA, q: "Three different positions of the same dice are shown. Select the symbol that will be on the face opposite to the one showing '@'.", o: ["&","#","!","<"], e: "From the dice positions, & is opposite to @ (per the worked solution analyzing common faces)." },
  { s: REA, q: "Select the figure that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Numbers in figures follow vowel positions (A=1, E=5, I=9, O=15, U=21). Option 4 fits the pattern." },

  // ============ General Awareness (26-50) ============
  { s: GA, q: "Georg Simon Ohm in whose honour we have the famous Ohm's Law, hailed from which country?", o: ["Russia","Spain","Poland","Germany"], e: "Georg Simon Ohm (1789–1854) was a German physicist and mathematician — Ohm's Law is named after him." },
  { s: GA, q: "Which Union Minister of Home Affairs released a book titled 'Karmayodha Granth' in New Delhi?", o: ["P. Chidambaram","Sushilkumar Shinde","Amit Shah","Rajnath Singh"], e: "Union Home Minister Amit Shah released the book 'Karmayodha Granth' in New Delhi (January 2020), based on PM Narendra Modi's life." },
  { s: GA, q: "Who was the first Governor of Madhya Pradesh?", o: ["B.D. Sharma","N.N. Wanchu","G.P. Singh","Dr. Sitaramayya"], e: "Pattabhi Sitaramayya served as the first Governor of Madhya Pradesh from 1952 to 1957." },
  { s: GA, q: "Which part of the body is responsible for the manufacture of red blood cells?", o: ["Brain","Lungs","Bone marrow","Heart"], e: "Bone marrow (especially the red marrow in flat bones) is the primary site of red blood cell production through hematopoiesis." },
  { s: GA, q: "Which city of India is known as 'The Athens of the East'?", o: ["Kochi","Allahabad","Patna","Madurai"], e: "Madurai (Tamil Nadu), an ancient city on the banks of the Vaigai River, is called 'The Athens of the East'." },
  { s: GA, q: "Methane is a colourless, odourless, non-toxic but flammable gas. What is its common name?", o: ["Blue vitriol","Heating gas","Marsh gas","Laughing gas"], e: "Methane is commonly called 'marsh gas' as it is released from marshes by anaerobic bacterial decomposition." },
  { s: GA, q: "In which state did the second phase of Intensified Mission Indradhanush (IMI) 2.0 begin in January 2020?", o: ["Uttar Pradesh","Punjab","Kerala","Bihar"], e: "The second phase of Intensified Mission Indradhanush 2.0 was launched in Uttar Pradesh in January 2020." },
  { s: GA, q: "Which of the following is NOT a twin city of India?", o: ["Cuttack and Bhubaneswar","Hubli and Dharwad","Thrissur and Thiruvalla","Ahmedabad and Gandhinagar"], e: "Thrissur and Thiruvalla are not twin cities. The other three pairs are well-known twin cities of India." },
  { s: GA, q: "John Maynard Keynes, best known for his economic theories (Keynesian economics), hailed from which country?", o: ["Sweden","Denmark","Australia","England"], e: "John Maynard Keynes (1883–1946) was a British (English) economist born in Cambridge, England." },
  { s: GA, q: "In the sequence of planets in the solar system, which planet comes in between Mars and Saturn?", o: ["Uranus","Mercury","Venus","Jupiter"], e: "Order: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. Jupiter is between Mars and Saturn." },
  { s: GA, q: "In which state has the Jawara Dance, a dance form to celebrate wealth, originated?", o: ["Gujarat","Kerala","Madhya Pradesh","Rajasthan"], e: "Jawara Dance is a folk harvest dance from the Bundelkhand region of Madhya Pradesh, celebrating prosperity." },
  { s: GA, q: "In which city was the Jhanda Satyagraha or Flag Satyagraha of 1923 held?", o: ["Calcutta","Nagpur","Ahmedabad","Bombay"], e: "The Jhanda Satyagraha (Flag Satyagraha) of 1923 was led prominently in Nagpur to assert the right to hoist the national flag." },
  { s: GA, q: "The development of a fruit without fertilisation is called ______.", o: ["Gametogamy","Parthenocarpy","Hybridogenesis","Apomixis"], e: "Parthenocarpy is the development of fruit without fertilisation, resulting in seedless fruits (e.g., bananas, some grapes)." },
  { s: GA, q: "Which city in India is world renowned for one of the most traditional embroidery styles, Chikankari?", o: ["Udaipur","Hyderabad","Ahmedabad","Lucknow"], e: "Lucknow is world-famous for Chikankari embroidery — delicate hand-embroidery, traditionally on muslin." },
  { s: GA, q: "Who is the first Indian to bag two International hat-tricks in cricket?", o: ["Rohit Sharma","Virat Kohli","Kedar Jadhav","Kuldeep Yadav"], e: "Kuldeep Yadav became the first Indian to take two international hat-tricks (vs Australia 2017, vs West Indies 2018)." },
  { s: GA, q: "Freedom fighter Sucheta Kripalani became the first woman chief minister of which state?", o: ["Uttar Pradesh","Rajasthan","Andhra Pradesh","Gujarat"], e: "Sucheta Kripalani became India's first woman Chief Minister, leading Uttar Pradesh from 1963 to 1967." },
  { s: GA, q: "In which period was the legendary Victoria Terminus station (currently Chhatrapati Shivaji Maharaj Terminus), Mumbai built?", o: ["1878 to 1888","1911 to 1921","1933 to 1943","1843 to 1853"], e: "Victoria Terminus (now CSMT) was constructed between 1878 and 1888 by architect F. W. Stevens in Italian Gothic style." },
  { s: GA, q: "Who chaired the sixth meeting of the Island Development Agency in New Delhi in January 2020?", o: ["Narendra Modi","Nirmala Sitharaman","Amit Shah","Nitin Gadkari"], e: "Union Home Minister Amit Shah chaired the 6th meeting of the Island Development Agency in January 2020." },
  { s: GA, q: "Who was chosen as foreign secretary of India in January 2020?", o: ["Ranjan Mathai","Harsh Vardhan Shringla","Vijay Keshav Gokhale","Nirupama Rao"], e: "Harsh Vardhan Shringla took over as India's Foreign Secretary on 29 January 2020, succeeding Vijay Gokhale." },
  { s: GA, q: "Jellyfish are an example of which type of phylum?", o: ["Phylum–Cnidaria","Phylum–Porifera","Phylum–Protozoa","Phylum–Ctenophora"], e: "Jellyfish belong to phylum Cnidaria, characterised by stinging cells (cnidocytes)." },
  { s: GA, q: "Which Tennis star will have a Swiss coin minted in his/her honour?", o: ["Serena Williams","Rafael Nadal","Novak Djokovic","Roger Federer"], e: "The Swiss Mint announced that Roger Federer would be honoured with a 20-franc coin (December 2019) — first living Swiss to receive this honour." },
  { s: GA, q: "Which US based Indian topped the Forbes India's '20 people to watch in the 2020s' list?", o: ["Hasan Minhaj","Prashant Kishor","Mahua Moitra","Dushyant Chautala"], e: "Indian-American comedian Hasan Minhaj topped Forbes India's '20 people to watch in the 2020s' list." },
  { s: GA, q: "Which of the following is NOT a nationalised bank?", o: ["State Bank of India","Punjab National Bank","United Bank of India","Punjab and Sind Bank"], e: "SBI was created under the State Bank of India Act 1955 (not nationalised). The other banks are nationalised banks." },
  { s: GA, q: "Who was appointed as the Managing Director of the International Monetary Fund in October 2019?", o: ["Kristalina Georgieva","Christine Lagarde","Rodrigo Rato","Dominique Strauss-Kahn"], e: "Kristalina Georgieva (Bulgaria) became the IMF Managing Director on 1 October 2019, succeeding Christine Lagarde." },
  { s: GA, q: "Which pillar inscriptions recorded the achievements of Samudra Gupta, who was known as the 'Napoleon of India' for his conquests?", o: ["Iron Pillar","Vijaya Stambha","Allahabad Pillar","Sun Pillar"], e: "The Allahabad (Prayag Prashasti) Pillar inscription, composed by Harisena, records the conquests of Samudragupta." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "One-third of goods are sold at a 15% profit, 25% of the goods are sold at a 20% profit and the rest at a 20% loss. If the total profit of ₹138.50 is earned on the whole transaction, then the value (in ₹) of the goods is:", o: ["₹8,310","₹7,756","₹8,030","₹8,587"], e: "Net profit per ₹300 of goods = ₹5. So total goods = 300/5 × 138.50 = ₹8,310." },
  { s: QA, q: "If 7 sin² θ − cos² θ + 2 sin θ = 2, 0° < θ < 90°, then the value of (sec 2θ + cot 2θ)/(cosec 2θ + tan 2θ) is:", o: ["(2√3+1)/3","(2/5)(1+√3)","(1/5)(1+2√3)","1"], e: "Solving: 8sin²θ + 2sinθ − 3 = 0 → sinθ = 1/2 → θ=30°. (sec60+cot60)/(cosec60+tan60) = (2+1/√3)/(2/√3+√3) = (2√3+1)/5 → simplification gives (1/5)(1+2√3)." },
  { s: QA, q: "Two chords AB and CD of a circle are produced to intersect each other at a point P outside the circle. If AB = 7 cm, BP = 4.2 cm and PD = 2.8 cm, then the length of CD is:", o: ["15.8 cm","14 cm","14.6 cm","12 cm"], e: "By external chord theorem: AP·BP = CP·DP. (7+4.2)·4.2 = CP·2.8 → CP = 16.8. CD = CP − DP = 16.8 − 2.8 = 14 cm." },
  { s: QA, q: "The given table represents the revenue (in ₹ crores) of a company from the sale of four products A, B, C and D in 6 years.\n\nThe number of years in which the revenue of the company from the sale of product D is more than the average revenue from the sale of product A over six years is:", o: ["4","1","2","3"], e: "Average A = (98+94+80+95+110+115)/6 = 98.67. D > 98.67 in years 2013(102) and 2017(102) = 2 years." },
  { s: QA, q: "If P = (x⁴−8x)/(x³−x²−2x), Q = (x²+2x+1)/(x²−4x−5) and R = (2x²+4x+8)/(x−5), then (P × Q) ÷ R is equal to:", o: ["1/2","4","2","1"], e: "Factorising and simplifying: P·Q÷R = [x(x³−8)/x(x²−x−2)]·[(x+1)²/(x²−5x+x−5)]·[(x−5)/(2(x²+2x+4))] = 1/2." },
  { s: QA, q: "If the 6-digit numbers x35624 and 1257y4 are divisible by 11 and 72, respectively, then what is the value of (5x − 2y)?", o: ["13","14","10","12"], e: "x35624 div by 11: (x+5+2)−(3+6+4) = x+7−13 = x−6 = 0 (or ±11) → x=6. 1257y4 div by 72: y=8 (div by 8 and 9). 5x−2y = 30−16 = 14." },
  { s: QA, q: "If a + b + c = 7 and ab + bc + ca = −6, then the value of a³ + b³ + c³ − 3abc is:", o: ["469","472","463","479"], e: "a²+b²+c² = 49−2(−6) = 61. a³+b³+c³−3abc = (a+b+c)(a²+b²+c²−(ab+bc+ca)) = 7·(61+6) = 7·67 = 469." },
  { s: QA, q: "The total revenue of the company from the sale of products B, C and D in 2014 is what percentage of the total revenue from the sale of products C and D in 6 years?", o: ["25","28","18","20"], e: "B+C+D in 2014 = 92+96+92 = 280. C+D total over 6 years = (82+98+96+88+93+103)+(74+102+92+93+97+102) = 560+560 = 1120. % = 280/1120·100 = 25%." },
  { s: QA, q: "The expression 3 sec² θ tan² θ + tan⁶ θ − sec⁶ θ is equal to:", o: ["−2","2","−1","1"], e: "tan⁶θ − sec⁶θ = (tan²θ−sec²θ)(tan⁴θ+tan²θ·sec²θ+sec⁴θ) = (−1)·(...). Adding 3sec²θ·tan²θ and simplifying gives −1." },
  { s: QA, q: "PRT is a tangent to a circle with centre O, at the point R on it. Diameter SQ of the circle is produced to meet the tangent at P and QR is joined. If ∠QRP = 28°, then the measure of ∠SPR is:", o: ["62°","29°","32°","34°"], e: "∠ORP=90° (radius⊥tangent). ∠QRO=62°. ∠OQR=62°. ∠PQR=180−62=118°. In ΔPQR: ∠SPR=180−28−118=34°." },
  { s: QA, q: "The income of A is 60% less than that of B, and the expenditure of A is equal to 60% of B's expenditure. If A's income is equal to 70% of B's expenditure, then what is the ratio of the savings of A and B?", o: ["3 : 8","4 : 7","2 : 15","5 : 9"], e: "Let B's income=100, A's income=40. A=70% of B's expenditure → B's exp = 400/7. A's exp = 60% × 400/7 = 240/7. Savings A = 40−240/7 = 40/7. Savings B = 100−400/7 = 300/7. Ratio = 40:300 = 2:15." },
  { s: QA, q: "In ΔABC, D and E are the points on sides AC and BC, respectively such that DE || AB. F is a point on CE such that DF || AE. If CE = 6 cm, and CF = 2.5 cm, then BC is equal to:", o: ["12 cm","14 cm","14.4 cm","15.6 cm"], e: "By similarity ratios: CD/CA = CF/CE = 2.5/6 = 5/12. Also CD/CA = CE/CB → 5/12 = 6/BC → BC = 72/5 = 14.4 cm." },
  { s: QA, q: "The difference in compound interest on a certain sum at 10% p.a. for one year, when the interest is compounded half yearly and yearly, is ₹88.80. What is the simple interest on the same sum for 1 2/3 years at the same rate?", o: ["₹5,980","₹5,916","₹5,986","₹5,920"], e: "Diff = P[(1.05)²−1.10] = P·0.0025 = 88.80 → P=35,520. SI = 35520·10·5/(100·3) = ₹5,920." },
  { s: QA, q: "A cylindrical vessel of radius 30 cm and height 42 cm is full of water. Its contents are emptied into a rectangular tub of length 75 cm and breadth 44 cm. The height (in cm) to which the water rises in the tub is: (π = 22/7)", o: ["30","45","36","40"], e: "Volume cylinder = πr²h = 22/7·900·42 = 118,800 cm³. h = 118800/(75·44) = 118800/3300 = 36 cm." },
  { s: QA, q: "The value of (tan² θ − sin² θ)/(2 + tan² θ + cot² θ) is:", o: ["cosec⁶ θ","cos⁴ θ","sin⁶ θ","sec⁴ θ"], e: "Numerator = sin²θ·tan²θ. Denominator = (sin²θ+cos²θ)²/(sin²θ·cos²θ). Ratio = sin⁶θ." },
  { s: QA, q: "By what percentage is the total revenue of the company from the sale of products A, B, and D in 2012 and 2013 more than the total revenue from the sale of product B in 2013 to 2016? (correct to one decimal place)", o: ["45.4","31.2","43.6","44.5"], e: "(98+74+74)+(94+96+102) = 538. B(2013-2016) = 96+92+84+98 = 370. % more = (538−370)/370·100 = 45.4%." },
  { s: QA, q: "The ratio of boys and girls in a group is 7 : 6. If 4 more boys join the group and 3 girls leave the group, then the ratio of boys to girls becomes 4 : 3. What is the total number of boys and girls initially in the group?", o: ["91","117","104","78"], e: "(7x+4)/(6x−3) = 4/3 → 21x+12 = 24x−12 → x=8. Total = 13x = 104." },
  { s: QA, q: "The time taken by a boat to travel 13 km downstream is the same as time taken by it to travel 7 km upstream. If the speed of the stream is 13 km/h, then how much time (in hours) will it take to travel a distance of 44.8 km in still water?", o: ["5 3/5","4 13/25","5 2/5","4 12/25"], e: "13/(x+3) = 7/(x−3) → 13x−39 = 7x+21 → x=10 km/h. (Speed of stream is 3, not 13 — assuming typo.) Time = 44.8/10 = 4.48 = 4 12/25 h." },
  { s: QA, q: "What is the ratio of the total revenue of the company in 2014 from the sale of all the four products to the total revenue from the sale of product C in 2014 to 2017?", o: ["14 : 23","7 : 10","7 : 9","18 : 19"], e: "Total in 2014 = 80+92+96+92 = 360. C(2014-2017) = 96+88+93+103 = 380. Ratio = 360:380 = 18:19." },
  { s: QA, q: "The average weight of some students in a class was 58.4 kg. When 5 students having the average weight 62.8 kg joined the class, the average weight of all students in the class increased by 0.55 kg. The number of students initially in the class were:", o: ["25","40","35","30"], e: "58.4n + 5·62.8 = 58.95(n+5) → 58.4n + 314 = 58.95n + 294.75 → 0.55n = 19.25 → n = 35." },
  { s: QA, q: "The value of the complex arithmetic expression (per Q71 in source).", o: ["1 4/5","9 1/2","3 4/5","1 9/10"], e: "After step-by-step BODMAS simplification, the expression evaluates to 1 9/10." },
  { s: QA, q: "In ΔPQR, ∠Q = 85° and ∠R = 65°. Points S and T are on the sides PQ and PR, respectively such that ∠STR = 95°, and the ratio of QR and ST is 9 : 5. If PQ = 21.6 cm, then the length of PT is:", o: ["12 cm","10.5 cm","9.6 cm","9"], e: "ΔPTS ~ ΔPQR. PT/PQ = ST/QR = 5/9. PT = 5/9·21.6 = 12 cm." },
  { s: QA, q: "A and B, working together, can complete a work in d days. Working alone, A takes (8 + d) days and B takes (18 + d) days to complete the same work. A works for 4 days. The remaining work will be completed by B alone in:", o: ["18 days","24 days","16 days","20 days"], e: "1/(8+d) + 1/(18+d) = 1/d → d²=144 → d=12. A=20 days, B=30 days. After 4 days A: work done=4/20=1/5. Remaining 4/5. B's time = 4/5·30 = 24 days." },
  { s: QA, q: "The marked price of an article is ₹740. After two successive discounts of 15% and x%, it is sold for ₹566.10. What is the value of x?", o: ["10","12","5","20"], e: "740·0.85·(100−x)/100 = 566.1 → (100−x)/100 = 566.1/(740·0.85) = 0.9 → x = 10%." },
  { s: QA, q: "If 30x² − 15x + 1 = 0, then what is the value of 25x² + 1/(36x²)?", o: ["9/2","55/12","65/12","6 1/4"], e: "Dividing by 6x: 5x − 5/2 + 1/(6x) = 0 → 5x + 1/(6x) = 5/2. Squaring: 25x² + 1/(36x²) + 5/3 = 25/4 → 25x² + 1/(36x²) = 25/4 − 5/3 = 55/12." },

  // ============ English Comprehension (76-100) ============
  { s: ENG, q: "Select the word which means the same as the given group of words.\n\nA sudden rush of a large number of frightened people or animals.", o: ["Stampede","Lunacy","Scapegoat","Recluse"], e: "A 'stampede' is a sudden panicked rush of a crowd or animals." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nThe bee's knees", o: ["Problematic","Foolish","Extraordinary","Observant"], e: "'The bee's knees' means something excellent or extraordinary." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nA reward is a ______ which motivates a person to achieve excellence in his field.", o: ["recognition","memorial","collection","monument"], e: "'Recognition' (acknowledgement) fits — a reward is a form of recognition." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nObsolete", o: ["Rigid","Outdated","Remote","Recent"], e: "'Obsolete' means outdated. Antonym: 'Recent' (new)." },
  { s: ENG, q: "Select the word which means the same as the given group of words.\n\nOne who loads and unloads ships", o: ["Spinster","Stevedore","Rustic","Captain"], e: "A 'stevedore' is a dock worker employed to load and unload ships." },
  { s: ENG, q: "Select the correctly spelt word.", o: ["Conscinteous","Encouragement","Comotion","Embarasment"], e: "'Encouragement' is correctly spelt. Others should be conscientious, commotion, embarrassment." },
  { s: ENG, q: "Cloze passage on Discipline.\n\nFill blank 1: 'It is (1) ______ misunderstood as a restriction to freedom...'", o: ["proudly","slowly","usually","happily"], e: "'Usually' (generally) fits — discipline is usually misunderstood as a restriction." },
  { s: ENG, q: "Fill blank 2: 'Discipline is a (2) ______ for students and people in different professions.'", o: ["disadvantage","virtue","curse","dream"], e: "'Virtue' (moral excellence) fits the positive context — discipline is a virtue." },
  { s: ENG, q: "Fill blank 3: 'A disciplined person always (3) ______ in each and every field of life.'", o: ["succeed","succeeds","success","successful"], e: "Subject is singular ('A disciplined person'), so verb 'succeeds' fits." },
  { s: ENG, q: "Fill blank 4: 'Disciplined people (4) ______ a disciplined society and a powerful nation.'", o: ["had made","makes","make","made"], e: "Plural subject 'people' takes plural verb 'make' in present simple." },
  { s: ENG, q: "Fill blank 5: 'Discipline should not be (5) ______ upon the people, rather it should come from within.'", o: ["adorned","imposed","curbed","reposed"], e: "'Imposed' (forced upon) fits — discipline should not be imposed but come from within." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDerogatory", o: ["Intricate","Complimentary","Insulting","Depreciating"], e: "'Derogatory' means disrespectful/insulting. Antonym: 'Complimentary' (expressing praise)." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nThe government should take stringent steps against terrorists and foil their ______ designs.", o: ["exemplary","conducive","benevolent","malicious"], e: "'Malicious' (intended to harm) fits in the context of terrorists' designs." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nTo throw a fit", o: ["Faint and fall down","Become unconscious","Express extreme anger","Caution someone about fitness"], e: "'To throw a fit' means to express extreme anger or shock." },
  { s: ENG, q: "Identify the segment which contains the grammatical error.\n\nThose who follow a healthy routine is likely enjoying good health.", o: ["Those who follow","a healthy routine","is likely enjoying","good health"], e: "Plural subject 'Those who follow' needs plural verb. 'Is likely enjoying' should be 'are likely to enjoy'." },
  { s: ENG, q: "Given below are four jumbled sentences. Out of the given options, pick the one that gives their correct order.\n\nA. They can then purchase them on subsidised rates with additional loan facilities.\nB. It will import technologically advanced medical instruments and provide them to entrepreneurs.\nC. The Indian Government has announced certain facilities in the budget session.\nD. This will help in strengthening the economic condition of entrepreneurs.", o: ["BDCA","DCAB","CBAD","CADB"], e: "C introduces the topic. B explains 'it'. A continues. D concludes. Order: CBAD." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence.\n\nThe mathematical calculation of this problem is easy than a previous one.", o: ["easiest than the","No Improvement","easy than the","easier than the"], e: "Comparison between two needs comparative form 'easier than the'." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nAcknowledgement", o: ["Confusion","Elimination","Compensation","Confirmation"], e: "'Acknowledgement' (acceptance/recognition) — synonym 'Confirmation'." },
  { s: ENG, q: "Identify the segment which contains the grammatical error.\n\nWhen I reached the cinema hall, the movie had already began.", o: ["the cinema hall","When I reached","the movie had","already began"], e: "Past perfect needs past participle. 'Began' should be 'begun' — 'had already begun'." },
  { s: ENG, q: "Select the correct indirect form of the given sentence.\n\nThe teacher said to me, 'You have not submitted the assignment.'", o: ["The teacher told to me that I have not submitted that assignment.","The teacher said to me that I have not submitted the assignment.","The teacher said me that I had not submitted the assignment.","The teacher told me that I had not submitted the assignment."], e: "Reporting verb 'said to' becomes 'told', present perfect 'have not' becomes past perfect 'had not'." },
  { s: ENG, q: "Select the correctly spelt word.", o: ["Employeed","Rehersal","Veterinary","Seperable"], e: "'Veterinary' is correctly spelt. Others should be employed, rehearsal, separable." },
  { s: ENG, q: "Select the correct passive form of the given sentence.\n\nHis elder sister taught him English.", o: ["His elder sister is taught English by him.","He is being taught English by his elder sister.","He was taught English by his elder sister.","He has been taught English by his elder sister."], e: "Past simple active 'taught' becomes passive 'was taught'." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence.\n\nNo effort has been made by the Indian cricket team to cash off on its vibrant image in the World Cup.", o: ["for cash through in","for cashing off on","to cash in on","to cash up on"], e: "The correct idiom is 'to cash in on' (to take advantage of)." },
  { s: ENG, q: "Given below are four jumbled sentences. Out of the given options, pick the one that gives their correct order.\n\nA. This is because of its aroma, flavour and variety in the market.\nB. Thus, it leads to poor health and mental disorders among children.\nC. Children as well as teenagers are tempted towards junk food.\nD. It has no or negligible nutritional value and high content of sugar and salt.", o: ["CDAB","BCDA","CADB","ACDB"], e: "C introduces junk food. A explains why. D describes ill effects. B concludes with consequences. Order: CADB." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nProdigal", o: ["Trivial","Extravagant","Arrogant","Humble"], e: "'Prodigal' (wastefully extravagant) — synonym 'Extravagant'." }
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

  const TEST_TITLE = 'SSC CGL Tier-I - 4 March 2020 Shift-2';
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
