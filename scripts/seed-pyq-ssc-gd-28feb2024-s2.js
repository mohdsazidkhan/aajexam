/**
 * Seed: SSC GD Constable PYQ - 28 February 2024, Shift-2 (80 questions)
 * Source: Oswaal SSC Constable (GD) Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per current SSC GD Tier-I pattern):
 *   - General Intelligence & Reasoning      : Q1-20  (20 Q)
 *   - General Knowledge & General Awareness : Q21-40 (20 Q)
 *   - Elementary Mathematics                : Q41-60 (20 Q)
 *   - English                               : Q61-80 (20 Q)
 *
 * Run with: node scripts/seed-pyq-ssc-gd-28feb2024-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC-GD-Constable/28-feb-2024/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-gd-28feb2024-s2';

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

const F = '28-feb-2024';
const IMAGE_MAP = {
  4:  { q: `${F}-q-4.png`,
        opts: [`${F}-q-4-option-1.png`,`${F}-q-4-option-2.png`,`${F}-q-4-option-3.png`,`${F}-q-4-option-4.png`] },
  6:  { q: `${F}-q-6.png`,
        opts: [`${F}-q-6-option-1.png`,`${F}-q-6-option-2.png`,`${F}-q-6-option-3.png`,`${F}-q-6-option-4.png`] },
  11: { q: `${F}-q-11.png`,
        opts: [`${F}-q-11-option-1.png`,`${F}-q-11-option-2.png`,`${F}-q-11-option-3.png`,`${F}-q-11-option-4.png`] },
  16: { q: `${F}-q-16.png`,
        opts: [`${F}-q-16-option-1.png`,`${F}-q-16-option-2.png`,`${F}-q-16-option-3.png`,`${F}-q-16-option-4.png`] },
  20: { q: `${F}-q-20.png`,
        opts: [`${F}-q-20-option-1.png`,`${F}-q-20-option-2.png`,`${F}-q-20-option-3.png`,`${F}-q-20-option-4.png`] }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-20 (Reasoning)
  3,4,1,1,4, 2,1,3,4,3, 2,2,2,4,2, 3,2,4,1,4,
  // 21-40 (GK)
  4,1,4,4,4, 2,2,2,2,1, 4,1,4,3,1, 1,1,4,2,1,
  // 41-60 (Maths)
  3,3,4,4,2, 4,1,1,2,4, 2,3,1,2,3, 2,3,3,2,4,
  // 61-80 (English)
  3,3,3,1,4, 4,1,1,1,3, 2,4,3,4,2, 2,3,1,1,4
];
if (KEY.length !== 80) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence & Reasoning';
const GA  = 'General Knowledge & General Awareness';
const QA  = 'Elementary Mathematics';
const ENG = 'English';

const RAW = [
  // ============ General Intelligence & Reasoning (1-20) ============
  { s: REA, q: "After arranging the given words according to dictionary order, which word will come at 'Fourth' position?\n\n1. Slur  2. Suit  3. Slug  4. Slung  5. Slump", o: ["Slung","Slug","Slur","Suit"], e: "Dictionary order: Slug, Slump, Slung, Slur, Suit. Fourth position = Slur." },
  { s: REA, q: "Five persons A, B, C, D and E are sitting around a circular table facing towards the centre. C is not an immediate neighbour of D and A. B is sitting second to the left of E. A is sitting second to the right of E. Who is sitting on the immediate right of D?", o: ["C","B","E","A"], e: "Working out the seating, A sits to the immediate right of D." },
  { s: REA, q: "By interchanging the given two numbers (not digits) which of the following equation will be NOT correct?\n\n9 and 2", o: ["9 × 3 + 2 ÷ 4 = 6","9 ÷ 2 + 7 = 0","2 + 9 × 3 − 4 = 11","9 + 4 × 2 − 6 = 32"], e: "Per the answer key, after swapping 9 and 2 in option 1, the equation becomes incorrect: 2×3 + 9÷4 ≠ 6." },
  { s: REA, q: "Select the dice which can be formed on folding the given sheet.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "From the unfolded sheet, opposite pairs are J↔G, F↔H, E↔I. Per the answer key, only option 1 satisfies all opposite pair constraints." },
  { s: REA, q: "Statements:\nI. Some T are S.\nII. No R is S.\n\nConclusions:\nI. No S is R.\nII. No R is T.\nIII. No S is T.", o: ["Both conclusions II and III follows","Neither conclusion follows","All conclusions follow","Only conclusion I follows"], e: "'No R is S' → 'No S is R' (I ✓). The relationships between R-T and S-T are not certain. So only I follows." },
  { s: REA, q: "From the given option figures, select the one in which the question figure is hidden/embedded. (rotation is NOT allowed)", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 2 contains the embedded figure." },
  { s: REA, q: "In the following question, select the missing number from the given series.\n\n863, 860, 869, 842, 923, ?", o: ["680","550","570","580"], e: "Pattern: −3¹, +3², −3³, +3⁴, −3⁵. 863−3=860, 860+9=869, 869−27=842, 842+81=923, 923−243=680." },
  { s: REA, q: "If 30 A 10 B 30 C 10 = 37 and 45 A 15 B 18 C 9 = 58, then 64 A 34 B 50 C 5 = ?", o: ["90","80","88","87"], e: "From the equations: A=+, B=−, C=÷. 30+10−30÷10 = 30+10−3 = 37 ✓. 64+34−50÷5 = 64+34−10 = 88." },
  { s: REA, q: "In the following question, select the related letters from the given alternatives.\n\nGE : HH :: BA : ?", o: ["RJ","KL","IM","CD"], e: "Pattern: +1, +3. G+1=H, E+3=H. B+1=C, A+3=D → CD." },
  { s: REA, q: "In the following question, select the related letter pair from the given alternatives.\n\nQRN : UVR :: ?", o: ["XUN : LOD","NUP : BBO","SWL : WAP","KJH : ZOW"], e: "Pattern: +4 to each letter. Q+4=U, R+4=V, N+4=R. SWL+4 each = WAP." },
  { s: REA, q: "In the following question, select the figure which can be placed at the sign of question mark (?) from the given alternatives.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 2 follows the symmetry of the figure series." },
  { s: REA, q: "In a certain code language, 'DRAGON' is coded as 'CQZEML'. What is the code for 'WHEELS' in that code language?", o: ["VGDDJQ","VGDCJQ","VGDDKR","VGDCJR"], e: "Pattern: −1, −1, −1, −2, −2, −2. D−1=C, R−1=Q, A−1=Z, G−2=E, O−2=M, N−2=L. WHEELS: W−1=V, H−1=G, E−1=D, E−2=C, L−2=J, S−2=Q → VGDCJQ." },
  { s: REA, q: "In a certain code language, 'WHOM' is coded as 'SCKH'. What is the code for 'BAKE' in that code language?", o: ["XVHA","XVGZ","XVGA","XVHZ"], e: "Pattern: −4, −5, −4, −5. W−4=S, H−5=C, O−4=K, M−5=H. BAKE: B−4=X, A−5=V, K−4=G, E−5=Z → XVGZ." },
  { s: REA, q: "Eight athletes Sunil, Abhishek, Mohit, Cheenu, Rahul, Tanu, Koyal and Ankit are sitting around a circular table facing opposite to the centre. Koyal is third to the left of Rahul. Tanu is third to the right of Cheenu. Mohit is second to the right of Sunil. Abhishek is second to the left of Cheenu. Tanu is second to the left of Sunil. Who is sitting second to the right of Ankit?", o: ["Sunil","Cheenu","Mohit","Rahul"], e: "Working out the seating arrangement, Rahul is sitting second to the right of Ankit." },
  { s: REA, q: "'E ÷ F' means 'E is the wife of F'\n'E + F' means 'E is the brother of F'\n'E × F' means 'E is the husband of F'\n'E − F' means 'E is the son of F'\n\nHow is P related to R in the expression 'P ÷ Q + I × R − S'?", o: ["Sister","Son's wife","Wife's sister","Wife"], e: "Per the encoded relations, P is wife of Q, Q is brother of I, I is husband of R. So P is wife of R's husband's wife's brother... Per the answer key, P is R's son's wife." },
  { s: REA, q: "A paper is folded and cut as shown. How will it appear when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 shows the correctly unfolded shape." },
  { s: REA, q: "Which of the following letter clusters will replace the question mark (?) in the given series?\n\nU, X, A, D, G, J, M, ?", o: ["Q","P","R","S"], e: "Each letter shifts by +3: U+3=X, X+3=A, A+3=D, D+3=G, G+3=J, J+3=M, M+3=P." },
  { s: REA, q: "Which one set of letters when sequentially placed at the gaps in the given letter series shall complete it?\n\ncddfcd_ _c_df_ddfcd", o: ["dfcd","ddcd","ddfc","dfdc"], e: "Filling option 4 'dfdc' produces the repeating pattern cddfcd cddfcd ddfcd... Per the answer key, option 4 fits." },
  { s: REA, q: "In the following question, select the missing number from the given series.\n\n5, 37, 70, 104, ?, 175", o: ["139","140","148","144"], e: "Differences: +32, +33, +34, +35, +36. 104+35 = 139." },
  { s: REA, q: "In the following question, select the figure which can be placed at the sign of question mark (?) from the given alternatives.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 4 fits the symmetry of the pattern." },

  // ============ General Knowledge & General Awareness (21-40) ============
  { s: GA, q: "Who has been appointed as the new Vice Chief of the Indian Air Force on January 30, 2023?", o: ["Harjit Singh Arora","Sandeep Singh","Vivek Ram Chaudhari","Amarpreet Singh"], e: "Air Marshal Amarpreet Singh was appointed Vice Chief of the Indian Air Force on 30 January 2023." },
  { s: GA, q: "The Government of India recently renamed the Rajiv Gandhi Khel Ratna Award as the ____ Khel Ratna Award.", o: ["Major Dhyan Chand","Mary Kom","Indira Gandhi","Gavaskar"], e: "The Rajiv Gandhi Khel Ratna Award was renamed the Major Dhyan Chand Khel Ratna Award in 2021." },
  { s: GA, q: "Ashoka's dhamma ____ worship of a god, or performance of a sacrifice.", o: ["supports certain form","is a part of","primarily involves","did not involve"], e: "Ashoka's dhamma did not involve worship of a god or performance of a sacrifice — it was an ethical, moral code." },
  { s: GA, q: "Which of the following was the 14th Census of India?", o: ["1991","2011","2021","2001"], e: "The 14th Census of India was carried out in 2001." },
  { s: GA, q: "What dancing style was M.K. Saroja, who passed away in June 2022, well known for?", o: ["Kuchipudi","Kathak","Sattriya","Bharatnatyam"], e: "M.K. Saroja was a renowned Bharatanatyam exponent who passed away in June 2022." },
  { s: GA, q: "What is the sex ratio of early childhood (0-6 years) according to the 2011 census of India (Females per Thousand Males)?", o: ["928","918","938","908"], e: "As per Census 2011, the child sex ratio (0-6 years) is 918 females per 1000 males." },
  { s: GA, q: "'Tippani Nritya' is associated with which of the following states?", o: ["Andhra Pradesh","Gujarat","Karnataka","Uttar Pradesh"], e: "Tippani Nritya is a folk dance form of Saurashtra region in Gujarat." },
  { s: GA, q: "Elements in the Modern Periodic Table are arranged in ____ vertical columns called groups and ____ horizontal rows called periods.", o: ["18, 9","18, 7","16, 9","16, 7"], e: "The Modern Periodic Table has 18 groups (vertical columns) and 7 periods (horizontal rows)." },
  { s: GA, q: "ATM booths come under which sector of the economic activity?", o: ["Secondary sector","Tertiary Sector","Quaternary sector","Primary sector"], e: "ATM booths provide banking services and come under the tertiary (services) sector." },
  { s: GA, q: "The Green Revolution started in the year 1965 and the ____ five-year plan of India was between 1961-66.", o: ["third","fourth","first","second"], e: "The Third Five Year Plan of India was between 1961-66, coinciding with the start of the Green Revolution." },
  { s: GA, q: "The Board of Control of Cricket (BCCI) has appointed _______ as the chairman of the Senior Men's Cricket Selection Committee in 2023.", o: ["Sachin Tendulkar","Kapil Dev","M.S. Dhoni","Ajit Agarkar"], e: "Ajit Agarkar was appointed as the Chairman of the Senior Men's Cricket Selection Committee by BCCI in July 2023." },
  { s: GA, q: "Under the Industrial Policy Resolution 1956, industries in India have been classified into how many categories?", o: ["Three","Five","Two","Four"], e: "The Industrial Policy Resolution 1956 classified industries into three categories: Schedule A (state-owned), Schedule B (mixed), and Schedule C (private)." },
  { s: GA, q: "Which of the following statements is correct regarding the Green Revolution?\n\nI. Green Revolution made India self-reliant in foodgrain production.\nII. Post Green Revolution, there is decrease in the use of chemical fertilizers.", o: ["Only II","Neither I nor II","Both I and II","Only I"], e: "Statement I is correct (Green Revolution made India self-reliant in foodgrains). Statement II is incorrect (chemical fertilizer use increased post Green Revolution). Per the answer key, option 4." },
  { s: GA, q: "According to the Indian Constitution, how many organs are there in the government of India?", o: ["Two","Five","Three","Four"], e: "The Indian Constitution provides for three organs of government: Legislature, Executive and Judiciary." },
  { s: GA, q: "Decathlon which is organised for men includes ____ events.", o: ["10","15","8","12"], e: "Decathlon (for men) consists of 10 track and field events." },
  { s: GA, q: "Independence Day is celebrated at the national level at ____ in Delhi.", o: ["Red Fort","India Gate","Taj Mahal","Gateway of India"], e: "India's Independence Day is celebrated nationally at the Red Fort (Lal Qila) in Delhi." },
  { s: GA, q: "Which country won the FIFA U-17 Women's World Cup 2022?", o: ["Spain","Colombia","USA","Japan"], e: "Spain won the FIFA U-17 Women's World Cup 2022 (held in India)." },
  { s: GA, q: "Who among the following social reformers founded the Self Respect Movement?", o: ["Ghasidas","Jyotirao Phule","Narayana Guru","Periyar"], e: "Periyar (E.V. Ramasamy) founded the Self-Respect Movement in 1925 in Tamil Nadu." },
  { s: GA, q: "Which instrument is played by the famous music personality Pt. Shiv Kumar Sharma?", o: ["Guitar","Santoor","Sitar","Piano"], e: "Pandit Shiv Kumar Sharma was a renowned Indian classical musician known for playing the Santoor." },
  { s: GA, q: "Which state government launched the Mukhyamantri Nishulk Annapurna Food Packet Scheme on Independence Day in 2023?", o: ["Rajasthan","Maharashtra","Uttar Pradesh","Kerala"], e: "The Rajasthan government launched the Mukhyamantri Nishulk Annapurna Food Packet Scheme on 15 August 2023." },

  // ============ Elementary Mathematics (41-60) ============
  { s: QA, q: "What is the value of 13[216 ÷ 3 of {48 ÷ 24 × (42 − 38)}]?", o: ["130","143","117","91"], e: "Inside: 42−38 = 4. 48 ÷ 24 × 4 = 8. 3 of 8 = 24. 216÷24 = 9. 13×9 = 117." },
  { s: QA, q: "Two numbers are in the ratio of 6 : 5. If their sum is 22, then what is the sum of the squares of the two numbers?", o: ["234","256","244","196"], e: "Total parts = 11. So numbers = 12 and 10. Sum of squares = 144+100 = 244." },
  { s: QA, q: "I can complete a work in 20 days and U can complete the same work in 10 days. If both of them work together, then in 4 days what percent work of the total work will be completed?", o: ["80 percent","75 percent","65 percent","60 percent"], e: "Combined per day = 1/20+1/10 = 3/20. In 4 days = 12/20 = 60%." },
  { s: QA, q: "An item costing ₹500 is being sold at a 17% loss. If the price is further reduced by 20%, then find the selling price.", o: ["₹452","₹290","₹302","₹332"], e: "First SP = 500 × 0.83 = 415. Further 20% reduction: 415 × 0.80 = ₹332." },
  { s: QA, q: "Convert 0.516̄ into fraction.", o: ["30/61","31/60","31/70","31/63"], e: "0.51666... = 0.5 + 0.01666... = 1/2 + 1/60 = 31/60." },
  { s: QA, q: "A company's revenue increased by 10% in the first quarter and decreased by 5% in the second quarter. What is the net percentage increase or decrease in revenue over these two quarters?", o: ["3.5% increase","4.5% decrease","3.5% decrease","4.5% increase"], e: "Net change = +10 − 5 + (10×−5)/100 = 5 − 0.5 = 4.5% increase." },
  { s: QA, q: "If A : B : C = 2 : 3 : 5, then what is the value of (A + B) : (B + C) : (C + A)?", o: ["5 : 8 : 7","7 : 6 : 5","7 : 8 : 7","5 : 8 : 8"], e: "A=2, B=3, C=5. A+B = 5, B+C = 8, C+A = 7. Ratio = 5:8:7." },
  { s: QA, q: "Deepak marks the price of his table 50 percent above the cost price. He gives some discount on it and earns profit of 10 percent. What is the discount percentage?", o: ["26.67 percent","33.33 percent","16.67 percent","20 percent"], e: "Let CP=100, MP=150, SP=110. Discount = (150−110)/150 × 100 = 26.67%." },
  { s: QA, q: "Mohan, Aman and Sohan together can complete a work in 18 days. If Mohan can work thrice as faster than Aman and Aman can work twice as faster than Sohan, then in how many days Sohan alone can complete the same work?", o: ["172 days","162 days","180 days","195 days"], e: "Let Sohan = 1x. Aman = 2x. Mohan = 6x. Combined = 9x. In 18 days, total work = 9x × 18 = 162x. Sohan alone = 162 days." },
  { s: QA, q: "A ring is sold at three successive discounts of 10%, 20% and 30%. If the marked price of the ring is ₹20,000, find its net selling price.", o: ["₹10000","₹9000","₹10020","₹10080"], e: "SP = 20000 × 0.9 × 0.8 × 0.7 = 20000 × 0.504 = ₹10,080." },
  { s: QA, q: "A train of length 442 metres crosses an electric pole in 13 seconds and crosses another train of the same length travelling in opposite direction in 17 seconds. What is the speed of the second train?", o: ["24 m/s","18 m/s","12 m/s","32 m/s"], e: "Speed of first train = 442/13 = 34 m/s. Combined speed = 884/17 = 52 m/s. Second train speed = 52−34 = 18 m/s." },
  { s: QA, q: "A person borrows some money for 5 years at a certain rate of simple interest. If the ratio of principal and total interest is 5 : 1, then what is the annual rate of interest?", o: ["1.7%","2.2%","4%","3.5%"], e: "P:SI = 5:1. SI = P/5. SI = P×R×T/100 → P/5 = P×R×5/100 → R = 100/(5×5) = 4%." },
  { s: QA, q: "What is the total surface area of a cone whose radius is 24 cm and height is 10 cm?", o: ["3771.43 cm²","3924.61 cm²","3249.76 cm²","4261.23 cm²"], e: "Slant l = √(24²+10²) = 26. TSA = πr(r+l) = (22/7) × 24 × 50 = 3771.43 cm²." },
  { s: QA, q: "What is the sum of all prime numbers between 30 and 50?", o: ["202","199","173","187"], e: "Primes between 30 and 50: 31, 37, 41, 43, 47. Sum = 199." },
  { s: QA, q: "What is the smallest number that is a multiple of 5, 8 and 15?", o: ["40","230","120","60"], e: "LCM(5, 8, 15) = 120." },
  { s: QA, q: "A sells a bottle to B at the profit of 30 percent and B sells it to C at a loss of 20 percent. If C pays ₹3744 for the bottle, then what is the cost price of bottle for A?", o: ["₹3200","₹3600","₹3000","₹3500"], e: "Let A's CP = x. B's CP = 1.3x. C pays = 1.3x × 0.8 = 1.04x = 3744 → x = 3600." },
  { s: QA, q: "The difference between compound interest (compounding annually) and simple interest on a sum of ₹80,000 for 2 years is ₹288. Find the rate of interest per annum.", o: ["8%","5.5%","6%","4%"], e: "Difference = P(R/100)² → 288 = 80000 × (R/100)² → R² = 36 → R = 6%." },
  { s: QA, q: "Average of 8 numbers is 47. The average of first three numbers is 53 and the average of next two numbers is 55. If the sixth number is 7 and 10 less than seventh and eighth number respectively, then what is the value of eighth number?", o: ["52","42","40","47"], e: "Total = 47×8 = 376. First 3 = 159. Next 2 = 110. Sum of last 3 = 376−159−110 = 107. Let 8th = x. 7th = x−10, 6th = x−10−7 = x−17. So x + (x−10) + (x−17) = 107 → 3x = 134 → x = 44.67. Per the answer key, value = 40." },
  { s: QA, q: "The average age of 17 students of a class is 20 years. If a new student of age 38 years joins the class, then what will be the average age of these 18 students?", o: ["24 years","21 years","23 years","26 years"], e: "Total = 17×20 + 38 = 378. New avg = 378/18 = 21 years." },
  { s: QA, q: "A student scores 60% in an exam and gets 24 marks less than another student who scored 80%. What is the maximum marks in the exam?", o: ["150","130","140","120"], e: "Difference = 80% − 60% = 20% = 24 → Max = 24/0.20 = 120." },

  // ============ English (61-80) ============
  { s: ENG, q: "Find the part of the given sentence that has an error in it. If there is no error, choose 'No error'.\n\nNeither Prerna nor Vishaka understand the meaning of friendship.", o: ["Neither Prerna nor","meaning of friendship.","Vishaka understand the","No error"], e: "With 'Neither...nor', the verb agrees with the nearer subject. 'Vishaka' (singular) takes 'understands' (not 'understand')." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nThe Liberal Party is cracking under the pressure of these ____.", o: ["corrosion","allegation","allegations","allegedly"], e: "Plural noun 'allegations' fits — under pressure of these multiple allegations." },
  { s: ENG, q: "Find the part of the given sentence that has an error in it. If there is no error, choose 'No error'.\n\nI'm unable to contact my friend, who deceived me when I was more weaker.", o: ["I'm unable to contact my friend","No error","I was more weaker.","who deceived me when"], e: "'more weaker' is a double comparative — should be either 'weaker' or 'more weak' (preferably just 'weaker')." },
  { s: ENG, q: "Fill in the blank with the most appropriate option.\n\n____ your clothes, it is high time you clean up the mess in your room.", o: ["Fold","Faux","Foaled","Fouled"], e: "'Fold' fits — fold your clothes (imperative verb)." },
  { s: ENG, q: "Improve the underlined part of the sentence. Choose 'No improvement' as an answer if the sentence is grammatically correct.\n\nThe software revolution is at its peaks in India.", o: ["its peaked","it's peaking","No improvement","its peak"], e: "Singular 'peak' is correct in this idiomatic usage — 'at its peak' is the standard phrase." },
  { s: ENG, q: "Improve the underlined part of the sentence. Choose 'No improvement' as an answer if the sentence is grammatically correct.\n\nThe house is a pear tree in the backyard.", o: ["have a pears","has a pears","No improvement","has a pear"], e: "Singular 'has a pear' fits the context — 'The house has a pear tree in the backyard'." },
  { s: ENG, q: "Choose the option which is antonym of (opposite of) the word 'construe' in the sentence given below.\n\nHis silence was misunderstood by many as a lack of interest, when in reality, he was deeply engrossed in thought.", o: ["misunderstood","interest","engrossed","silence"], e: "Construe (to interpret) is the antonym of 'misunderstood' (incorrectly interpreted)." },
  { s: ENG, q: "Find the part of the given sentence that has an error in it.\n\nStudies suggest that well-designed e-books can support early literacy in kids.", o: ["No error","Studies suggest that well-designed","literacy in kids.","e-books can support early"], e: "The sentence is grammatically correct — no error." },
  { s: ENG, q: "Select the sentence with no spelling errors.", o: ["Marine ecosystems were comparatively more resistant to extreme weather events.","Marine ecosysteams were comparatively more resistant to extreme weather events.","Marine ecosystems were comparitively more resistant to extreme weather events.","Marine ecosystems were comparatively more resistaent to extreme weather events."], e: "Option 1 has all words correctly spelt: 'ecosystems', 'comparatively', 'resistant'." },
  { s: ENG, q: "Select the incorrectly spelt word from the given sentence.\n\nHe made several excrsions in the tribal habitats there.", o: ["tribal","habitats","excrsions","several"], e: "'Excrsions' should be 'excursions' (with 'u')." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nDrastic times call for drastic measures", o: ["Something that ends at the last minute or lasts few seconds","When you are extremely desperate, you need to take extremely desperate actions","Do not pull all your resources in one possibility","Don't rely on it until you sure of it"], e: "'Drastic times call for drastic measures' means in extreme/desperate situations, one must take extreme/desperate actions." },
  { s: ENG, q: "Choose the most appropriate synonym of the underlined word.\n\nMy coworkers' loud, endless conversations irritated me.", o: ["Obliged","Pacified","Appeased","Displeased"], e: "Irritated (annoyed) is synonymous with 'Displeased'." },
  { s: ENG, q: "Choose the idiom/phrase that can substitute the highlighted group of words meaningfully.\n\nThe party was great and we thoroughly enjoyed.", o: ["Beat around the bush","In the dark","Had a ball","Cut corners"], e: "'Had a ball' means thoroughly enjoyed oneself — fits the highlighted phrase." },
  { s: ENG, q: "Improve the underlined part of the sentence. Choose 'No improvement' as an answer if the sentence is grammatically correct.\n\nHe sand the wooden with coarse sandpaper.", o: ["sand the wood","No improvement","had sand the wood","sanded the wood"], e: "Past tense 'sanded' and noun 'wood' (not 'wooden' which is an adjective). 'sanded the wood' fits." },
  { s: ENG, q: "Select the most appropriate antonym of the given word.\n\nFacade", o: ["Hidden","Truth","Opening","Closure"], e: "Facade (a deceptive outward appearance) is the antonym of 'Truth' (genuine reality)." },
  { s: ENG, q: "Comprehension. Fill in blank 1.\n\nThe initial two Russian PWR types at the Kudankulam site (1)____, apart from India's three-stage plan ...", o: ["was","were","in","are"], e: "Plural subject 'two Russian PWR types' takes plural verb 'were'." },
  { s: ENG, q: "Fill in blank 2.\n\n... apart from India's three-stage plan (2)____ nuclear power ...", o: ["from","to","for","with"], e: "'Plan for nuclear power' is the standard collocation." },
  { s: ENG, q: "Fill in blank 3.\n\n... and were simply to increase generating capacity (3)____ rapidly.", o: ["more","most","enough","so"], e: "'More rapidly' fits — comparative form to express increased rate." },
  { s: ENG, q: "Fill in blank 4.\n\nNow there are (4)____, for eight 1000 MWe units at that site, ...", o: ["plans","ideas","amends","structures"], e: "'Plans' fits — referring to formal proposals for the eight reactor units." },
  { s: ENG, q: "Fill in blank 5.\n\n... a memorandum of understanding was (5)____ for Russia.", o: ["placed","marked","draft","signed"], e: "MOUs are 'signed' — the standard verb associated with memoranda." }
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
      tags: ['SSC', 'GD', 'Constable', 'PYQ', '2024'],
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

  const TEST_TITLE = 'SSC GD Constable - 28 February 2024 Shift-2';

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
    pyqYear: 2024,
    pyqShift: 'Shift-2',
    pyqExamName: 'SSC GD Constable',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
