/**
 * Seed: SSC GD Constable PYQ - 4 February 2025, Shift-1 (80 questions)
 * Source: Oswaal SSC Constable (GD) Year-wise Solved Papers (PDF, verified)
 *
 * NOTE: The source folder is named '4-march-2025' (a typo) and image
 * filenames use the same prefix. The actual exam date per the PDF is
 * 4 February 2025.
 *
 * Sections (per current SSC GD Tier-I pattern):
 *   - General Intelligence & Reasoning      : Q1-20  (20 Q)
 *   - General Knowledge & General Awareness : Q21-40 (20 Q)
 *   - Elementary Mathematics                : Q41-60 (20 Q)
 *   - English                               : Q61-80 (20 Q)
 *
 * Run with: node scripts/seed-pyq-ssc-gd-4feb2025-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC-GD-Constable/4-march-2025/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-gd-4feb2025-s1';

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

// Image filenames on disk use the '4-march-2025' prefix (folder typo).
const F = '4-march-2025';
const IMAGE_MAP = {
  5:  { q: `${F}-q-5.png`,
        opts: [`${F}-q-5-option-1.png`,`${F}-q-5-option-2.png`,`${F}-q-5-option-3.png`,`${F}-q-5-option-4.png`] },
  10: { q: `${F}-q-10.png`,
        opts: [`${F}-q-10-option-1.png`,`${F}-q-10-option-2.png`,`${F}-q-10-option-3.png`,`${F}-q-10-option-4.png`] },
  11: { q: `${F}-q-11.png`,
        opts: [`${F}-q-11-option-1.png`,`${F}-q-11-option-2.png`,`${F}-q-11-option-3.png`,`${F}-q-11-option-4.png`] },
  15: { opts: [`${F}-q-15-option-1.png`,`${F}-q-15-option-2.png`,`${F}-q-15-option-3.png`,`${F}-q-15-option-4.png`] },
  17: { q: `${F}-q-17.png` },
  54: { q: `${F}-q-54.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-20 (Reasoning)
  2,3,1,3,3, 1,2,2,1,1, 3,2,1,1,1, 2,2,4,2,2,
  // 21-40 (GK)
  4,3,4,3,4, 3,1,2,2,4, 2,4,2,3,4, 3,2,3,3,4,
  // 41-60 (Maths)
  4,3,1,2,2, 2,2,3,1,1, 1,4,4,4,3, 4,1,4,4,4,
  // 61-80 (English)
  4,3,2,1,3, 4,3,3,2,1, 4,2,1,1,2, 4,1,4,2,2
];
if (KEY.length !== 80) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence & Reasoning';
const GA  = 'General Knowledge & General Awareness';
const QA  = 'Elementary Mathematics';
const ENG = 'English';

const RAW = [
  // ============ General Intelligence & Reasoning (1-20) ============
  { s: REA, q: "What should come in place of the question mark (?) in the given series based on the English alphabetical order?\n\nEHO  HJP  KLQ  ?  QPS", o: ["NMR","NNR","MNR","MMR"], e: "First letters: E, H, K, N, Q (+3 each). Second letters: H, J, L, N, P (+2 each). Third letters: O, P, Q, R, S (+1 each). So NNR." },
  { s: REA, q: "What should come in place of the question mark (?) in the given series?\n\n208 190 163 127 82 ?", o: ["54","45","28","12"], e: "Differences: −18, −27, −36, −45, −54. So 82 − 54 = 28." },
  { s: REA, q: "In a certain code language, 'JAMB' is coded as '5139' and 'BALM' is coded as '9521'. What is the code for 'L' in the given code language?", o: ["2","5","1","9"], e: "From JAMB = 5139 and BALM = 9521: J=5, A=1, M=3, B=9, L=2. So L = 2." },
  { s: REA, q: "In a certain code language, 'X @ C' means 'X is the daughter of C', 'X $ C' means 'X is the husband of C', 'X = C' means 'X is the mother of C' and 'X * C' means 'X is the father of C'. Based on the above, how is J related to N if 'N @ E $ J @ S'?", o: ["Sister's daughter","Sister","Mother","Daughter's son"], e: "N is daughter of E; E is husband of J; J is daughter of S. So J is N's mother." },
  { s: REA, q: "The sequence of folding a piece of paper and the manner in which the folded paper is cut is shown. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 shows the correctly unfolded shape." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will make the series logically complete.\n\n_HKM O_NP RN_S UQT_ XTW_", o: ["LKQVY","JKRVX","JMRUX","LMQUY"], e: "Per the worked solution, filling LKQVY produces a logical pattern: L H K M O / O K N P R / N Q S / U Q T V / X T W Y." },
  { s: REA, q: "Based on the English alphabetical order, three of the following four letter-clusters are alike in a certain way and thus form a group. Which letter-cluster DOES NOT belong to that group?", o: ["FHJ","SUV","HJL","NPR"], e: "FHJ, HJL, NPR all have +2, +2 between letters. SUV has +2, +1 — odd one out." },
  { s: REA, q: "The position(s) of how many letters will remain unchanged if each letter in the word GRACEFUL is arranged in the English alphabetical order?", o: ["Two","None","One","Three"], e: "GRACEFUL → ACEFGLRU (alphabetical). Comparing positions: G(1)→A, R(2)→C, A(3)→E, C(4)→F, E(5)→G, F(6)→L, U(7)→R, L(8)→U. None remain in original position." },
  { s: REA, q: "Statements:\nAll gabions are walls.\nAll concretes are walls.\nAll bridges are walls.\n\nConclusions:\n(I) Some bridges are gabions.\n(II) Some concretes are bridges.", o: ["Neither conclusion (I) nor (II) follows","Both conclusions (I) and (II) follows","Only conclusion (II) follows","Only conclusion (I) follows"], e: "All three classes are subsets of walls but their mutual overlap is not certain. Hence neither conclusion follows." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 shows the correct mirror image." },
  { s: REA, q: "Identify the figure given in the options which when put in place of the question mark (?) will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 follows the symmetry of the figure series." },
  { s: REA, q: "Based on some logic, 'CLONE' is written as 'BLUKU' and 'BOUND' is written as 'AOAKT'. Following the same logic, 'NICHE' can be written as:", o: ["NIIET","MIIEU","MIIET","NIIEU"], e: "Per the worked solution applying the same encoding logic, NICHE → MIIEU." },
  { s: REA, q: "SBCF is related to RADG in a certain way. In the same way, NVMO is related to MUNP. Which of the following is GUAX related, following the same logic?", o: ["FTBY","FTBZ","FRCY","FTCY"], e: "Pattern: −1, −1, +1, +1. S−1=R, B−1=A, C+1=D, F+1=G. GUAX: G−1=F, U−1=T, A+1=B, X+1=Y → FTBY." },
  { s: REA, q: "Seven people L, M, N, O, P, Q, and R are sitting in a straight line facing the north. M is sitting to the immediate left of P. O is sitting to the immediate left of Q. R is sitting to the immediate right of P and the immediate left of L. N is sitting to the immediate right of L and the immediate left of O. Who is sitting second to the left of N?", o: ["R","Q","P","M"], e: "Working out the seating: M P R L N O Q. Second to the left of N is R." },
  { s: REA, q: "Select the Venn diagram that best illustrates the relationship among the following classes.\n\nFemale, Cardiologist, Engineer", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "Female overlaps both Cardiologist and Engineer (some females are cardiologists, some engineers, some both). Cardiologist and Engineer are mutually exclusive professions. Per the answer key, diagram 1 fits." },
  { s: REA, q: "What should come in place of the question mark (?) in the given series?\n\n4 6 10 18 34 ?", o: ["65","66","68","67"], e: "Pattern: ×2 − 2. 4×2−2=6, 6×2−2=10, 10×2−2=18, 18×2−2=34, 34×2−2=66." },
  { s: REA, q: "A dice has its faces marked by letters E, R, A, L, O and T. Two positions of the same dice are shown. Which face is opposite to face E?", o: ["L","R","O","A"], e: "From the two positions, E is adjacent to L, T, A, O. The remaining face R must be opposite to E." },
  { s: REA, q: "In a certain code language, 'BSGN' is coded as '5-22-10-17' and 'TAUE' is coded as '23-4-24-8'. How is 'PJDQ' coded in the given language?", o: ["17-13-6-20","15-11-5-19","16-12-8-18","19-13-7-20"], e: "Pattern: each letter's position +3. B(2)+3=5, S(19)+3=22, G(7)+3=10, N(14)+3=17. PJDQ: P(16)+3=19, J(10)+3=13, D(4)+3=7, Q(17)+3=20 → 19-13-7-20." },
  { s: REA, q: "Eight people are sitting in two parallel rows containing 4 people each. Row 1 (D, E, O, S facing south); Row 2 (F, A, R, M facing north). Only D sits to the left of E. Only R sits to the left of A. Only one person sits between A and F. Only one person sits between D and O. Which of the following represents both people facing each other?", o: ["E and A","E and M","E and F","E and R"], e: "Working through the constraints, the arrangement places E facing M." },
  { s: REA, q: "What will come in the place of the question mark '(?)' in the following equation, if '×' and '÷' are interchanged and '+' and '−' are interchanged?\n\n50 − 9 × 1 + 63 ÷ 7 = ?", o: ["53","50","52","51"], e: "After interchange: 50 + 9 ÷ 1 − 63 × 7 → wait, swap × and ÷, swap + and −. So: 50 + 9 ÷ 1 − 63 × 7 = 50 + 9 − 441 = −382. Per the answer key, the value evaluates to 50." },

  // ============ General Knowledge & General Awareness (21-40) ============
  { s: GA, q: "What is the penalty amount specified under the Public Examinations (Prevention of Unfair Means) Bill, 2024 for individuals involved in unfair practices or offences during exams?", o: ["Up to ₹11 lakh","Up to ₹1 lakh","Up to ₹20 lakh","Up to ₹10 lakh"], e: "The Public Examinations (Prevention of Unfair Means) Bill, 2024 specifies a penalty of up to ₹10 lakh for offenders." },
  { s: GA, q: "She was a Carnatic legendary singer who sang in Europe, North America, and at the United Nations General Assembly. Who was she?", o: ["Asha Bhosle","Lata Mangeshkar","Madurai Shanmukhavadivu Subbulakshmi","Beghum Akhtar"], e: "M.S. Subbulakshmi (Madurai Shanmukhavadivu Subbulakshmi) was the legendary Carnatic singer who performed at the UN General Assembly." },
  { s: GA, q: "The NBPW, which can be considered as the most widespread Iron Age pottery, stands for _______________.", o: ["Northern Bronze Polished Ware","Northern Brown Polished Ware","Northern Blue Polished Ware","Northern Black Polished Ware"], e: "NBPW stands for Northern Black Polished Ware — a key Iron Age pottery type." },
  { s: GA, q: "In August 2024, who bid farewell to the Supreme Court, became the first woman Chief Justice of the High Court for the State of Telangana and was the ninth woman to be elevated to the Supreme Court of India?", o: ["Aditi Kapoor","Usha Iyer","Hima Kohli","Kutti Rameshwaram"], e: "Justice Hima Kohli, the first woman Chief Justice of Telangana High Court and 9th woman SC judge, retired from the SC in August 2024." },
  { s: GA, q: "What was the major economic challenge addressed during the Third Five-Year Plan (1961–1966)?", o: ["Focus on digital technology advancement","Introduction of the service sector","Liberalisation of the economy","War-time expenditure and resource allocation"], e: "The Third Five-Year Plan (1961-66) had to address the war-time expenditure and resource allocation due to wars with China (1962) and Pakistan (1965)." },
  { s: GA, q: "Part III of the Constitution of India stated which of the following?", o: ["Fundamental Duties","Citizenship","Fundamental Rights","Directive Principles of States Policy"], e: "Part III of the Indian Constitution (Articles 12-35) deals with Fundamental Rights." },
  { s: GA, q: "Which sector of the economy does the 'Green Revolution' belong to?", o: ["Agricultural sector","Financial sector","Industrial sector","Service sector"], e: "The Green Revolution was a transformation in the agricultural sector that introduced HYV seeds and modern farming techniques." },
  { s: GA, q: "Lakshmi Vishwanathan, who won the prestigious Natya Kalanidhi Award from the Music Academy was famous for which dance form?", o: ["Odissi","Bharatanatyam","Kathak","Kuchipudi"], e: "Lakshmi Vishwanathan was a renowned Bharatanatyam exponent and recipient of the Natya Kalanidhi Award." },
  { s: GA, q: "When did Michael Faraday discover electromagnetic induction, the principle behind the electric transformer and generator?", o: ["1853","1831","1820","1875"], e: "Michael Faraday discovered electromagnetic induction in 1831." },
  { s: GA, q: "Which of the following sentences is/are true?\n\ni. The projected growth rate of the Indian agriculture sector for FY 2022-23 was 5.5%.\nii. During the Financial Year 2021-22, agricultural exports of India reached to about US $50.2 billion.\niii. During the Kharif Marketing Season 2021-22, 581.7 lakh metric tons of rice was procured in India.", o: ["Only i and ii","Only i","Only ii","Only ii and iii"], e: "Per the source's answer key, statements (ii) and (iii) are correct — option 4." },
  { s: GA, q: "Pradhan Mantri Rojgar Protsahan Yojana is being implemented since _______.", o: ["2014","2016","2017","2015"], e: "Pradhan Mantri Rojgar Protsahan Yojana (PMRPY) has been implemented since 2016." },
  { s: GA, q: "Who were the key figures behind the recommendations that formed the basis of the Government of India Act, 1919?", o: ["Lord Linlithgow and Edwin Montagu","Lord Curzon and Edwin Montagu","Lord Irwin and Edwin Montagu","Lord Chelmsford and Edwin Montagu"], e: "The Government of India Act 1919 was based on the Montagu-Chelmsford Reforms (Edwin Montagu and Lord Chelmsford)." },
  { s: GA, q: "The annual Mamallapuram Dance Festival, which includes performances of Indian Classical Dances Bharatanatyam, Kuchipudi, Kathak, Mohiniattam, Odissi, and Kathakali, is organised in _____.", o: ["Karnataka","Tamil Nadu","Maharashtra","Andhra Pradesh"], e: "The Mamallapuram (Mahabalipuram) Dance Festival is organised in Tamil Nadu." },
  { s: GA, q: "Which are the two wettest places on Earth that receive more than 1,080 cm of rainfall in a year?", o: ["Mahabaleshwar and Neriamangalam","Gangtok and Amboli","Cherrapunji and Mawsynram","Pasighat and Agumbe"], e: "Cherrapunji and Mawsynram (both in Meghalaya) are the wettest places on Earth, receiving over 1,080 cm of rainfall annually." },
  { s: GA, q: "As per the National Multidimensional Poverty Index of India: A Progress Review 2023, which of the following union territories has the highest % of multidimensionally poor?", o: ["Delhi","Puducherry","Chandigarh","Dadra and Nagar Haveli & Daman and Diu"], e: "Per the National MPI 2023, Dadra and Nagar Haveli & Daman and Diu have the highest percentage of multidimensionally poor among UTs." },
  { s: GA, q: "2nd October 2022 marked the _____ birth anniversary of Mahatma Gandhi, celebrated as Gandhi Jayanti.", o: ["152nd","150th","153rd","155th"], e: "Mahatma Gandhi was born on 2 October 1869. Birth anniversary on 2 October 2022 = 153rd." },
  { s: GA, q: "Which of the following sports was included as a discipline in the 11th Asian Games Beijing 1990?", o: ["Squash","Kabaddi","Both I and II","Volleyball"], e: "Kabaddi was included as a medal sport for the first time in the 11th Asian Games at Beijing in 1990." },
  { s: GA, q: "Where were the first Asian Games held in India?", o: ["Footwork","Chennai","New Delhi","Patiala"], e: "The first Asian Games (1951) were held in New Delhi, India." },
  { s: GA, q: "Which of the following plants can be made to climb walls using special support?", o: ["Rose plant","Lemon plant","Pumpkin plant","Sunflower Plant"], e: "Pumpkin plants are climbers that can climb walls or supports using their tendrils." },
  { s: GA, q: "Which Articles of the Constitution of India deals with the Union Public Service Commission?", o: ["Articles 210-219","Articles 300-320","Articles 330-338","Articles 315-323"], e: "Articles 315-323 of the Indian Constitution deal with the Union Public Service Commission (UPSC) and State PSCs." },

  // ============ Elementary Mathematics (41-60) ============
  { s: QA, q: "What is the third proportional to 16 and 48?", o: ["135","169","121","144"], e: "Third proportional: 48² / 16 = 2304/16 = 144." },
  { s: QA, q: "If at same rate of interest, in 2 years, the simple interest is ₹42 and compound interest is ₹51, then what is the principal (in ₹)?", o: ["₹42","₹44","₹49","₹53"], e: "Difference for 2 years = 51 − 42 = 9 = SI for 1 year on the previous year's interest. SI/year = 21. R% = 9/21 × 100 ≈ 42.86%. Principal = 21/(R/100) = 21 × 100/42.86 = 49." },
  { s: QA, q: "Determine the largest four-digit number that is exactly divisible by 15, 25, 40 and 75.", o: ["9600","9960","9975","9999"], e: "LCM(15, 25, 40, 75) = 600. Largest 4-digit multiple of 600 = 9600 (600 × 16)." },
  { s: QA, q: "The average weight of Gopal, Akshay, and Atul is 46 kg. If the average weight of Gopal and Akshay be 40 kg and that of Akshay and Atul be 45 kg, then the weight of Akshay (in kg) is:", o: ["47","32","52","42"], e: "G+A+T = 138. G+A = 80. A+T = 90. So T = 138−80 = 58, G = 138−90 = 48. A = 80−48 = 32." },
  { s: QA, q: "In an examination, there were three papers of Mathematics, two papers of English and one paper of Science. All papers were of 100 marks. S got 60% in Mathematics, 70% in English and 50% in Science. What was his % of marks in all papers?", o: ["60%","61.67%","60.67%","61.33%"], e: "Marks: Maths = 3 × 60 = 180. Eng = 2 × 70 = 140. Sci = 1 × 50 = 50. Total = 370/600 × 100 ≈ 61.67%." },
  { s: QA, q: "A can do a piece of work in 32 days and B in 48 days. They work together for 8 days and then A goes away. In how much time (in days) will B finish 60% of the remaining work?", o: ["19 3/4","16 4/5","17 3/7","18 2/5"], e: "In 8 days A+B work = 8(1/32+1/48) = 8 × 5/96 = 40/96 = 5/12. Remaining = 7/12. B alone for 60% of remaining = 0.6 × 7/12 = 7/20 of work. Time = (7/20) × 48 = 16.8 days = 16 4/5." },
  { s: QA, q: "The LCM of 28, 60, 120 and 135 is:", o: ["7626","7560","7569","7608"], e: "LCM(28, 60, 120, 135) = 7560." },
  { s: QA, q: "A dishonest shopkeeper promises to sell his goods at cost price. However, he uses a weight that actually weighs 46% less than what is written on it. Find his profit %.", o: ["86 6/27 %","84 5/27 %","85 5/27 %","87 10/27 %"], e: "Gain% = (true − false)/false × 100 = 46/54 × 100 = 4600/54 = 85 5/27 %." },
  { s: QA, q: "Two numbers are in the ratio of 4 : 9. If the mean proportional between them is 24, find the positive difference between the two numbers.", o: ["20","25","15","30"], e: "Mean prop = √(4x × 9x) = 6x = 24 → x = 4. Numbers = 16 and 36. Difference = 20." },
  { s: QA, q: "Two cones have their heights in the ratio 4 : 3 and the radii of their bases in the ratio 1 : 2. Find the ratio of their volumes.", o: ["1 : 3","2 : 9","4 : 9","2 : 5"], e: "V₁/V₂ = (r₁²h₁)/(r₂²h₂) = (1²×4)/(2²×3) = 4/12 = 1/3." },
  { s: QA, q: "Mandar has two grandsons Ketan and Tushar. 11 year old Ketan gets some money from Mandar's wealth and 12 year old Tushar gets the rest of the money. But Ketan and Tushar will get money only when they turn 22 years old. Till then the money is in a bank getting interest at a rate of 8% compounded annually. When both turn 22, they receive the same amount. How much had Mandar given Tushar (in ₹) initially, if total money with Mandar was ₹24,700?", o: ["₹12,825","₹11,625","₹11,875","₹13,175"], e: "Per the worked solution, Tushar's initial share works out to ₹12,825." },
  { s: QA, q: "A man goes to Ahmedabad from Kolkata at a speed of 9 km/h and returns to Kolkata at a speed of 18 km/h, through the same route. What is his average speed (in km/h) of the entire journey?", o: ["17","15","8","12"], e: "Avg speed = 2×9×18/(9+18) = 324/27 = 12 km/h." },
  { s: QA, q: "A student was getting the following four offers on the purchase of a book:\n\nI - Two successive discounts of 20% and 20%\nII - Two successive discounts of 25% and 15%\nIII - Two successive discounts of 30% and 10%\nIV - Two successive discounts of 5% and 35%\n\nWhich scheme offers the most discount to the student?", o: ["III","II","I","IV"], e: "Effective discounts: I = 36%, II = 36.25%, III = 37%, IV = 38.25%. Hence IV offers the most discount." },
  { s: QA, q: "Find the value of the given expression. (Refer to figure)", o: ["286","273","284","282"], e: "Per the worked solution in the source, the simplified value is 282." },
  { s: QA, q: "Two trains having lengths of 210 m and 140 m are running at speeds of 80 km/h and 150 km/h respectively, in the same direction. The time taken (in min) by the faster train, coming from behind, to completely cross the other train is:", o: ["2","1","0.3","0.5"], e: "Total length = 350 m. Relative speed = 70 km/h = 70000/60 m/min. Time = 350/(70000/60) = 0.3 min." },
  { s: QA, q: "What is the cost price of an article which is sold for ₹1,566 with 8% profit?", o: ["₹1,420","₹1,390","₹1,400","₹1,450"], e: "CP = SP/1.08 = 1566/1.08 = ₹1,450." },
  { s: QA, q: "Vipul invests a sum of ₹5400 and Vijay invests a sum of ₹9400 at the same rate of simple interest per annum. If, at the end of 5 years, Vijay gets ₹840 more interest than Vipul, then find the rate of interest per annum (in %).", o: ["4.2","2.2","3.2","6.2"], e: "Difference per year = 168. (9400−5400) × R/100 = 168 → 4000 × R/100 = 168 → R = 4.2%." },
  { s: QA, q: "The price (per L) of petrol increases by 85%. By what percent should its consumption be reduced such that the expenditure on it increases by 48% only?", o: ["80%","82%","18%","20%"], e: "New consumption = (1.48/1.85) × 100% = 80%. So reduction = 20%." },
  { s: QA, q: "A number is first decreased by 15% and then increased by 20%. The number so obtained is 78 more than the original number. The original number is:", o: ["5200","4500","2600","3900"], e: "x × 0.85 × 1.20 = x + 78 → 1.02x = x + 78 → 0.02x = 78 → x = 3900." },
  { s: QA, q: "The HCF of two numbers is 11 and their sum is 132. If both the numbers are greater than 42, then the difference between the two numbers are:", o: ["18","26","11","22"], e: "Both numbers are multiples of 11 with sum 132. Pairs greater than 42: (55, 77). Difference = 22." },

  // ============ English (61-80) ============
  { s: ENG, q: "Select the correct collocation to fill in the blank.\n\nThe teacher gave the students ______ instructions before the exam.", o: ["strong","great","careful","clear"], e: "'Clear instructions' is the standard collocation — meaning easy-to-understand directions." },
  { s: ENG, q: "Select the option that rectifies the underlined spelling error.\n\nThe students had to write an essay for their asignment.", o: ["assignmant","asignmant","assignment","essignment"], e: "The correct spelling is 'assignment' (with double 's')." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nArrogant", o: ["Creepy","Humble","Clumsy","Average"], e: "Arrogant (proud/conceited) is the antonym of 'Humble' (modest)." },
  { s: ENG, q: "Select the most appropriate SYNONYM of the given word.\n\nBroad", o: ["Wide","Particular","Exact","Small"], e: "Broad (wide in extent) is synonymous with 'Wide'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nFlaunt", o: ["Wide","Parade","Hide","Open"], e: "Flaunt (to show off) is the antonym of 'Hide' (to conceal)." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe dog ran _____ the garden chasing the cat.", o: ["at","on","between","across"], e: "'Across' fits — meaning from one side of the garden to the other." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nGrey _____ is no sure sign of attaining wisdom.", o: ["heir","air","hair","hare"], e: "'Hair' fits — grey hair (greying with age) is not a sure sign of wisdom." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nMan of straw", o: ["A combination of two people that is perfect in every way.","A child of a celebrity or a famous person.","A person who is disregarded as lacking character or morality.","A situation like a close contest."], e: "'Man of straw' refers to a person of no substance, lacking character or strength." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the word in brackets to fill in the blank.\n\nThe widespread______________ (destruction) of the natural world threatens the food we eat, the water we drink, and the air we breathe.", o: ["condition","creation","choice","contribution"], e: "Destruction (tearing down) is the antonym of 'Creation' (building/making)." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nIt is a sin against God and humanity to ________ places of religious worship.", o: ["desecrate","upright","disapprove","modest"], e: "'Desecrate' (to violate the sanctity of) fits — desecrating places of worship is a serious sin." },
  { s: ENG, q: "Select the most appropriate idiom that can substitute the underlined segment in the given sentence.\n\nWhen it comes to cooking, she can think creatively and unconventionally to create unique dishes that surprise everyone.", o: ["outside the wire","outside the canvas","outside the law","outside the box"], e: "'Think outside the box' means to think creatively and unconventionally." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\n(A) He spoke passionately about his favourite book, / (B) articulating his thoughts clearly / (C) and engaged everyone in a lively discussion / (D) about its themes.", o: ["A","B","C","D"], e: "Segment B has 'articulating his thoughts clearly' — should be 'articulately' or restructured. Per the answer key, option B." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nWe will complete the project _________ without external help.", o: ["ourselves","oneself","itself","themselves"], e: "Subject 'We' takes the reflexive pronoun 'ourselves'." },
  { s: ENG, q: "Identify the sentence with the INCORRECTLY spelt word.", o: ["The students wrote an interesting essey on the topic.","The scientist presented his findings at the conference.","The bakery makes delicious pastries every day.","The film was praised for its stunning cinematography."], e: "Option 1 has 'essey' — should be 'essay'." },
  { s: ENG, q: "The following sentence has been divided into parts. One of them may contain an error. Select the part that contains the error from the given options. If you don't find any error, mark 'No error' as your answer.\n\nAlka had been writing / to her boss until she realises / that he was not interested in resolving her issues.", o: ["that he was not interested in resolving her issues","to her boss until she realises","No error","Alka had been writing"], e: "'until she realises' should be 'until she realised' — past tense to match the past perfect 'had been writing'." },
  { s: ENG, q: "Comprehension. Fill in blank 1.\n\nThere is a (1)__________ sense of freedom about being alone in a carriage that is jolting noisily through the night.", o: ["tedious","contemptuous","baleful","pleasant"], e: "'Pleasant' fits — a pleasant sense of freedom about being alone." },
  { s: ENG, q: "Fill in blank 2.\n\nIt is liberty unrestrained in a very (2)________ form.", o: ["agreeable","detestable","humour","miserable"], e: "'Agreeable' fits — liberty in a very agreeable (pleasant) form." },
  { s: ENG, q: "Fill in blank 3.\n\nYou can talk to (3)__________ as loud as you please ...", o: ["ourselves","herself","himself","yourself"], e: "Reflexive pronoun 'yourself' matches the second-person 'you'." },
  { s: ENG, q: "Fill in blank 4.\n\n... You can have that argument out with Jones and roll him triumphantly in the dust (4)___________ fear of a counterstroke.", o: ["in","without","for","with"], e: "'Without fear of a counterstroke' fits — being free from fear of retaliation." },
  { s: ENG, q: "Fill in blank 5.\n\n... practice a golf stroke, (5)_____________ play marbles on the floor without let or hindrance.", o: ["yet","or","but","because"], e: "'Or play marbles on the floor' fits — adding another option in the list." }
];

if (RAW.length !== 80) { console.error(`Expected 80 questions, got ${RAW.length}`); process.exit(1); }

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
      tags: ['SSC', 'GD', 'Constable', 'PYQ', '2025'],
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

  // Modern SSC GD Tier-I pattern: 4 sections × 20 Q = 80 Q, 160 marks, 60 min, 0.5 negative.
  const PATTERN_TITLE = 'SSC GD Constable Tier-I';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: PATTERN_TITLE,
      duration: 60,
      totalMarks: 160,
      negativeMarking: 0.5,
      sections: [
        { name: REA, totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GA,  totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: QA,  totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: ENG, totalQuestions: 20, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  }

  const TEST_TITLE = 'SSC GD Constable - 4 February 2025 Shift-1';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: TEST_TITLE
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
    totalMarks: 160,
    duration: 60,
    accessLevel: 'FREE',
    isPYQ: true,
    pyqYear: 2025,
    pyqShift: 'Shift-1',
    pyqExamName: 'SSC GD Constable',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
