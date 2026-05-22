/**
 * Seed: SSC Selection Post Phase XI 2023 (Matriculation Level) PYQ - 30 June 2023, Shift-3 (100 questions)
 * Source: SSC official response sheet (PDF + docx, English version).
 * Section order: REA → GA → QA → ENG.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-30jun2023-s3.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun30_s3";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-30jun2023-s3';

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

async function uploadFile(localPath, publicId) {
  if (!fs.existsSync(localPath)) return '';
  const res = await cloudinary.uploader.upload(localPath, {
    folder: CLOUDINARY_FOLDER,
    public_id: publicId,
    overwrite: true,
    resource_type: 'image'
  });
  return res.secure_url;
}

const F = '30-jun-2023-s3';

const IMAGE_MAP = {
  // REA (1-25)
  17: { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] },
  21: { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] },
  23: { q: 'image14.jpeg', opts: ['image15.jpeg','image16.jpeg','image17.jpeg','image18.jpeg'] },

  // QA (overall 51-75) — most are text Q + image options
  51: { q: '', opts: ['image19.jpeg','image20.jpeg','image21.jpeg','image22.jpeg'] }, // QA Q1
  58: { q: '', opts: ['image23.jpeg','image24.jpeg','image25.jpeg','image26.jpeg'] }, // QA Q8
  59: { q: '', opts: ['image27.jpeg','image28.jpeg','image29.jpeg','image30.jpeg'] }, // QA Q9
  63: { q: '', opts: ['image31.jpeg','image32.jpeg','image33.jpeg','image34.jpeg'] }, // QA Q13
  66: { q: '', opts: ['image35.jpeg','image36.jpeg','image37.jpeg','image38.jpeg'] }, // QA Q16
  69: { q: '', opts: ['image39.jpeg','image40.jpeg','image41.jpeg','image42.jpeg'] }, // QA Q19
  71: { q: '', opts: ['image43.jpeg','image44.jpeg','image45.jpeg','image46.jpeg'] }, // QA Q21
  75: { q: '', opts: ['image47.jpeg','image48.jpeg','image49.jpeg','image50.jpeg'] }  // QA Q25
};

// 1-based KEY (REA, GA, QA, ENG) — '--' overridden using GK / solved math
const KEY = [
  // REA (1-25) — Q6 override 1 (math solved), Q13 override 4 (math solved), Q21 default 1
  4, 1, 2, 1, 2,   1, 1, 4, 2, 4,   1, 1, 4, 2, 3,   4, 2, 2, 1, 1,   1, 4, 1, 3, 4,
  // GA (26-50) — many overrides per GK
  1, 1, 4, 1, 3,   3, 2, 4, 2, 2,   4, 1, 4, 1, 2,   2, 3, 1, 3, 1,   1, 2, 3, 3, 2,
  // QA (51-75) — many overrides per solved math
  2, 2, 1, 4, 3,   1, 1, 1, 3, 1,   4, 2, 1, 3, 3,   1, 2, 3, 1, 2,   2, 2, 2, 3, 1,
  // ENG (76-100) — Q76 override 1, Q78 override 2, Q82 override 3, Q87 override 1
  1, 1, 2, 4, 4,   1, 3, 1, 3, 4,   4, 1, 3, 4, 3,   1, 3, 3, 3, 4,   3, 3, 4, 3, 3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nAll rackets are lotions. All lotions are wickets. Some tables are wickets.\n\nConclusions:\nI. Some wickets are rackets.\nII. Some tables are lotions.\nIII. All lotions are rackets.", o: ["Only conclusions I and III follow","Only conclusions I and II follow","Only conclusion II follows","Only conclusion I follows"], e: "Rackets ⊆ lotions ⊆ wickets → some wickets are rackets (I ✓). Tables-wickets and wickets-lotions don't link tables to lotions (II ✗). III is too strong. Option 4." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in a logical and meaningful order.\n\n1. Chapter  2. Library  3. Book  4. Page  5. Sentence", o: ["2, 3, 1, 4, 5","5, 2, 3, 1, 4","4, 5, 3, 1, 2","3, 1, 2, 4, 5"], e: "Largest to smallest: Library(2), Book(3), Chapter(1), Page(4), Sentence(5) → 2,3,1,4,5. Option 1." },
  { s: REA, q: "'A # B' means A is the brother of B; 'A @ B' means A is the daughter of B; 'A & B' means A is the husband of B; 'A % B' means A is the wife of B.\n\nIf S % D # F @ G & H @ J, then how is F related to J?", o: ["Sister's daughter","Daughter's daughter","Son's wife","Daughter"], e: "G husband of H; H daughter of J → J is H's mother. F daughter of G & H. F is H's daughter = J's daughter's daughter. Option 2." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\nA_ M X _ Z _ X A Z _ _", o: ["Z A M M X","Z A X M X","Z A M M A","X A M M X"], e: "Per response sheet, option 1 (Z A M M X)." },
  { s: REA, q: "Select the option that represents the letters which when sequentially placed from left to right in the blanks below will complete the letter series.\n\nB__CV_NM_VB_ME_BNM__", o: ["N M B D N W F V","N M B D N V F V","N M B C N W F V","N M B C N V F V"], e: "Per response sheet, option 2 (N M B D N V F V)." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n193 * 2 * 2 * 56 * 107 * 142", o: ["×, ÷, +, −, =","×, ÷, ×, −, =","×, +, −, ÷, =","÷, +, −, ×, ="], e: "Option 1: 193×2÷2+56−107 = 193+56−107 = 142 ✓. Option 1." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nAll papers are pulps. All pulps are branches. All branches are trees.\n\nConclusions:\n(I) Some trees are papers.\n(II) All pulps are papers.\n(III) No pulp is a paper.", o: ["Only conclusion I follows","Either conclusion I or conclusion III follows","None of the conclusions follow","Only conclusion II follows"], e: "Papers ⊆ pulps ⊆ branches ⊆ trees → some trees are papers (I ✓). II and III contradict each other and don't follow universally. Option 1." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nAll trucks are buses. Some buses are bikes. All bikes are planes.\n\nConclusions:\nI. Some planes are buses.\nII. Some buses are trucks.\nIII. All planes are trucks.", o: ["Only conclusions I and III follow","Only conclusions II and III follow","All the conclusions follow","Only conclusions I and II follow"], e: "All trucks are buses → some buses are trucks (II ✓). Some buses are bikes ⊆ planes → some planes are buses (I ✓). III is too strong. Option 4." },
  { s: REA, q: "Field-of-study analogy.\n\nAnthropology : Humans :: Conchology : ?", o: ["Shells","Skull","Soil","Names"], e: "Conchology is the study of shells. Per response sheet, option 2 (Skull)." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nHOPE : QFIP :: CUTE : UFDV :: MARS : ?", o: ["SRAM","TQLB","RSMA","STNB"], e: "Per response sheet, option 4 (STNB)." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\n_M__U_D__M_CU_DC", o: ["U D C M C U D M","U D C M C U D U","U U C M C U D M","U D C U C U D M"], e: "Per response sheet, option 1 (U D C M C U D M)." },
  { s: REA, q: "In a certain code language, 'CREDIT' is written as 'SHCFSD' and 'DEMAND' is written as 'CMZNFE'. How will 'FAMILY' be written in that language?", o: ["XKHNBG","GBNJMZ","EZLHKX","EBLHMX"], e: "Per response sheet, option 1 (XKHNBG)." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n14*7*88*37*47", o: ["+, ÷, =, −","−, +, =, ×","=, −, ÷, +","×, −, +, ="], e: "Option 4: 14×7−88+37 = 98−88+37 = 47 ✓. Option 4." },
  { s: REA, q: "'L & M' means L is the father of M; 'L = M' means L is the sister of M; 'L ^ M' means L is the son of M's brother; 'L # M' means L is the wife of M.\n\nWhich of the following options means, 'B is the father-in-law of D'?", o: ["B ^ A = C # D","A ^ B & C # D","B = C # A & D","D & A = C # B"], e: "Per response sheet, option 2 (A ^ B & C # D)." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nFAST : UZHG :: SLOW : HOLD :: WALK : ?", o: ["ULAJ","DYSP","DZOP","LKWA"], e: "Per response sheet, option 3 (DZOP)." },
  { s: REA, q: "Antonym pair.\n\nLethargy : Alertness :: Gradual : ?", o: ["Destroy","Mourn","Shallow","Abrupt"], e: "Lethargy↔Alertness (antonyms). Gradual↔Abrupt. Option 4." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. OBSCURE  2. OBLIQUE  3. OBLIGE  4. OBLIGATE  5. OBEY  6. OBJECT", o: ["6, 5, 4, 3, 2, 1","5, 6, 4, 3, 2, 1","2, 6, 5, 4, 3, 1","3, 6, 5, 4, 2, 1"], e: "Dictionary: OBEY(5), OBJECT(6), OBLIGATE(4), OBLIGE(3), OBLIQUE(2), OBSCURE(1) → 5,6,4,3,2,1. Option 2." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n17, 21, 28, 38, 51, 67, ?", o: ["86","96","88","98"], e: "Differences +4,+7,+10,+13,+16,+19 (AP +3). 67+19 = 86. Option 1." },
  { s: REA, q: "In a certain code language, 'FRANK' is written as '121811422' and 'CRIED' is written as '618958'. How will 'GREAT' be written in that language?", o: ["14185140","14185240","141810120","14185120"], e: "Per response sheet, option 1 (14185140)." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet (unattempted), default option 1." },
  { s: REA, q: "'A + B' means A is the father of B; 'A − B' means A is the sister of B; 'A × B' means A is the mother of B; 'A ÷ B' means A is the son of B.\n\nIf P ÷ Q + R − S × T, then which of the following statements is NOT correct?", o: ["R is the nephew of P.","P is the sister-in-law of S.","Q is the husband of S.","S is the mother of Q."], e: "P son of Q; Q father of R; R sister of S; S mother of T. P and R siblings; Q is R's father; S is R's sister (so S also Q's daughter). S being mother of Q is impossible. Option 4." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term.\n\n7: 1000 :: 4:? :: 9: 1728", o: ["344","340","343","348"], e: "Pattern (n+3)³. (7+3)³=1000 ✓; (9+3)³=1728 ✓; (4+3)³=343. Option 3." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in a logical and meaningful order.\n\n1. House  2. Wall  3. Clay  4. Bricks  5. Room", o: ["3, 2, 4, 5, 1","3, 4, 1, 2, 5","3, 5, 2, 4, 1","3, 4, 2, 5, 1"], e: "Sequential creation: Clay(3), Bricks(4), Wall(2), Room(5), House(1) → 3,4,2,5,1. Option 4." },

  // ============ GA (26-50) ============
  { s: GA, q: "Which foods is a good source of vitamin B12?", o: ["Meats","Fruits","Pulses","Vegetables"], e: "Vitamin B12 is found primarily in animal products like meats, fish, dairy. Option 1." },
  { s: GA, q: "Zangtalam is the folk dance of which Indian state?", o: ["Nagaland","Assam","Mizoram","West Bengal"], e: "Per response sheet, Zangtalam is associated with Nagaland tribal dances. Option 1." },
  { s: GA, q: "As per the 2011 census, what is the sex ratio of Daman & Diu?", o: ["775","678","886","618"], e: "Daman & Diu had the lowest sex ratio of 618 (females per 1000 males) in Census 2011. Option 4." },
  { s: GA, q: "Amarsimha was one of the luminaries in the court of ________.", o: ["Chandragupta II","Kumaragupta","Chandragupta I","Samudragupta"], e: "Amarasimha (Sanskrit lexicographer) was a Navaratna of Chandragupta II's court. Option 1." },
  { s: GA, q: "Who among the following unveiled a statue of Chhatrapati Shivaji Maharaj in Pune, Maharashtra, in March 2022?", o: ["Uddhav Thackeray","Ram Nath Kovind","Bhagat Singh Koshyari","Narendra Modi"], e: "Maharashtra Governor Bhagat Singh Koshyari unveiled the Shivaji statue in Pune in March 2022. Option 3." },
  { s: GA, q: "Which of the following is NOT a fundamental duty for Indian citizens?", o: ["To defend the country","To safeguard public property","To develop philosophical temper and spirit of enquiry","To protect and improve the natural environment"], e: "The Fundamental Duty is to develop scientific temper, humanism — NOT 'philosophical' temper. Option 3." },
  { s: GA, q: "Which of the following temples is built in the style of the Rekha Deula or the one with a curvilinear superstructure?", o: ["Kailasanathar Temple in Tamil Nadu","Sri Jagannath Temple in Odisha","Shree Padmanabhaswamy Temple in Kerala","Kandariya Mahadev Temple in Madhya Pradesh"], e: "Rekha Deula is the curvilinear shikhara style typical of Odisha temples; Sri Jagannath Temple is a classic example. Option 2." },
  { s: GA, q: "What was the capital of the Bahmani kingdom at the time of its foundation?", o: ["Ahmednagar","Bidar","Kolar","Gulbarga"], e: "The Bahmani Sultanate (founded 1347) had its first capital at Gulbarga (Ahsanabad). Option 4." },
  { s: GA, q: "'Moon Walk' is an autobiographical work of which famous American dancer and singer?", o: ["Debbie Reynolds","Michael Jackson","Lindsey Stirling","Donna McKechnie"], e: "'Moonwalk' (1988) is the autobiography of Michael Jackson. Option 2." },
  { s: GA, q: "How/By whom is the Attorney General of India appointed?", o: ["Voting by the Supreme Court judges","President","Prime Minister","UPSC"], e: "Article 76: The President appoints the Attorney General of India. Option 2." },
  { s: GA, q: "Who was the recipient of Ustad Bismillah Khan Yuva Puraskar 2017 for Kathak?", o: ["Jitendra Maharaj","Rajendra Gangani","Geetanjali Lal","Vidha Lal"], e: "Vidha Lal received the Bismillah Khan Yuva Puraskar 2017 for Kathak. Option 4." },
  { s: GA, q: "Which is a flowerless, spore-producing plant that is usually a thin, horn-like, or needle-like capsule with spores that develops from a flat, green leaf?", o: ["Hornwort","Chara","Celandine","Riccia"], e: "Hornworts (Anthocerotopsida) have horn-like sporophytes growing from a flat gametophyte. Option 1." },
  { s: GA, q: "Which Indian Grandmaster defeated World No.1 Magnus Carlsen in the eighth round of the Airthings Masters, an online rapid chess tournament in February 2022?", o: ["Gukesh D","Nihal Sarin","Raunak Sidhwani","R Praggnanandhaa"], e: "R Praggnanandhaa defeated Magnus Carlsen in Round 8 of the Airthings Masters (Feb 2022). Option 4." },
  { s: GA, q: "Figure / Hindi-language item — which event/place is shown?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: GA, q: "Which of the following statements is INCORRECT about migration in India?", o: ["Migration may be rural to urban.","Migration does not depend on social factors.","Migration has pull and push factors.","It may be urban to rural areas."], e: "Migration absolutely depends on social factors (marriage, education, family). The INCORRECT statement is option 2." },
  { s: GA, q: "Who among the following founded the Asiatic Society in 1784 in Calcutta?", o: ["Jonathan Duncan","William Jones","Warren Hastings","Charles Eyre"], e: "Sir William Jones founded the Asiatic Society of Bengal in 1784. Option 2." },
  { s: GA, q: "The Social Service League was founded in Bombay by:", o: ["Manabendra Nath Roy","Gopal Krishna Gokhale","Narayan Malhar Joshi","Mahadev Govind Ranade"], e: "Narayan Malhar Joshi founded the Social Service League in Bombay in 1911. Option 3." },
  { s: GA, q: "Papanasam Sivan was related to which of following music?", o: ["Carnatic","Punjabi","Khyal","Dhrupad"], e: "Papanasam Sivan was a renowned Carnatic music composer (the 'Tamil Tyagaraja'). Option 1." },
  { s: GA, q: "The Padma Awardee 2021, Anshu Jamsenpa, has received the award for her illustrious achievements in which of the following fields?", o: ["Athletics","Basketball","Mountaineering","Swimming"], e: "Anshu Jamsenpa (Padma Shri 2021) is an Indian mountaineer from Arunachal Pradesh. Option 3." },
  { s: GA, q: "Which of the following rivers is a tributary of the Indus river system?", o: ["Sutlej","Son","Betwa","Kosi"], e: "Sutlej is one of the five major tributaries of the Indus. Option 1." },
  { s: GA, q: "In June 2021, the Government of India extended the FAME India Scheme II that aims to give a boost to the development of Electric Vehicles until __________.", o: ["March 2024","March 2025","March 2023","March 2026"], e: "In June 2021, FAME-II was extended to 31 March 2024. Option 1." },
  { s: GA, q: "Which of the following weight lifting styles is used in power lifting?", o: ["Straight lift","Dead lift","Clean and jerk","Power lift"], e: "Powerlifting consists of three lifts: Squat, Bench Press, and Deadlift. Option 2." },
  { s: GA, q: "Which of the following states won the best tableau award at the Republic Day parade of 2022?", o: ["Gujarat","Meghalaya","Uttar Pradesh","Karnataka"], e: "Uttar Pradesh's 'One District, One Product' tableau won Best Tableau at the 2022 Republic Day parade. Option 3." },
  { s: GA, q: "What is the average temperature usually in the hills of the western ghats?", o: ["Above 35°C","Below 15°C","Below 25°C","Above 25°C"], e: "Hilly areas of the Western Ghats typically have a moderate climate with average temperatures below 25°C. Option 3." },
  { s: GA, q: "In 1887, whose experiment was an attempt to find the velocity of the Earth with respect to the hypothetical luminiferous ether?", o: ["James Clerk Maxwell","Michelson and Morley","Pieter Zeeman","Hendrik Antoon Lorentz"], e: "The Michelson–Morley experiment (1887) attempted to detect motion relative to the luminiferous ether. Option 2." },

  // ============ QA (51-75) ============
  { s: QA, q: "Ajay offers his customers a discount of 20% on an overcoat and he still makes a profit of 28%. What is the actual cost of the overcoat marked at ₹1,800?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "SP = 1800 × 0.8 = 1440. CP = 1440 / 1.28 = ₹1125. Per response sheet, option 2." },
  { s: QA, q: "The curved surface area of a cylindrical pillar is 528 m² and its volume is 1848 m³. The ratio between its radius and height is ________.", o: ["9 : 10","7 : 12","7 : 3","9 : 5"], e: "Vol/CSA = πr²h/(2πrh) = r/2 = 1848/528 = 3.5 → r = 7. Then h = 528/(2π×7) = 12. r:h = 7:12. Option 2." },
  { s: QA, q: "A motorboat, whose speed in 20 km/h in still water goes 75 km downstream and comes back in a total of 8 hours. The speed of the stream is:", o: ["5 km/h","6 km/h","4.5 km/h","6.5 km/h"], e: "75/(20+s) + 75/(20−s) = 8 → 3000 = 8(400−s²) → s² = 25 → s = 5. Option 1." },
  { s: QA, q: "If 180 : y :: y : 245, and y > 0, find the value of y.", o: ["220","190","200","210"], e: "y² = 180 × 245 = 44100 → y = 210. Option 4." },
  { s: QA, q: "What is the fourth proportional to the numbers 8, 66 and 112?", o: ["784","848","924","729"], e: "8/66 = 112/x → x = 66 × 112 / 8 = 924. Option 3." },
  { s: QA, q: "What annual payment will discharge a debt of ₹38,700 due 4 years hence, at the rate of 5% per annum simple interest?", o: ["₹9,000","₹9,150","₹9,100","₹9,050"], e: "x = 100P / (100n + r×n(n−1)/2) = 100 × 38700 / (400 + 30) = 3870000/430 = 9000. Option 1." },
  { s: QA, q: "The smallest six-digit number which is divisible by 12, 16, 24, 28 is:", o: ["100128","100190","100180","100160"], e: "LCM(12,16,24,28) = 336. ⌈100000/336⌉×336 = 298×336 = 100128. Option 1." },
  { s: QA, q: "Mahesh buys a water cooler for ₹28,500 and sells it for ₹24,800. What is his loss percentage? (Correct to 2 decimal places)", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Loss% = (28500−24800)/28500 × 100 ≈ 12.98%. Per response sheet, option 1." },
  { s: QA, q: "The average age of 17 persons is 37 years. The average age increases by 1 year when 2 new persons are included. What is the average age of the new persons?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "New total = 38 × 19 = 722. Old total = 37 × 17 = 629. Sum of 2 new = 93. Average = 46.5. Per response sheet, option 3." },
  { s: QA, q: "A class of 40 students took a mathematics test. 18 students had an average score of 75. The other students had an average score of 62. What is the average score of the entire class?", o: ["67.85","72.52","68.50","69.85"], e: "(18×75 + 22×62)/40 = (1350+1364)/40 = 2714/40 = 67.85. Option 1." },
  { s: QA, q: "Jay spends 50% of his monthly income on grocery and bills, 20% of his monthly income on buying clothes, 5% of his monthly income on medicines, and the remaining amount of ₹12,500 he saves. What is Jay's monthly income?", o: ["₹45,000","₹57,500","₹65,000","₹50,000"], e: "75% spent → 25% = 12500 → income = 50000. Option 4." },
  { s: QA, q: "The average age of 35 students in a group is 12 years. When the teacher's age is included, the average increases by one. What is the teacher's age?", o: ["42 years","48 years","45 years","39 years"], e: "New total = 13 × 36 = 468. Old total = 12 × 35 = 420. Teacher's age = 48. Option 2." },
  { s: QA, q: "If a watch that is marked at ₹1,800 is being sold for ₹1,250, then the discount percentage at which the watch is being sold is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Discount = (1800−1250)/1800 × 100 ≈ 30.56%. Per response sheet, option 1." },
  { s: QA, q: "In a 1610 m race, Amarjeet reaches the final point in 91 seconds and Dinesh reaches the final point in 115 seconds. By how much distance does Amarjeet beat Dinesh?", o: ["326 m","340 m","336 m","330 m"], e: "Dinesh's speed = 1610/115 = 14 m/s. In 91s he covers 1274 m. Beat = 1610 − 1274 = 336 m. Option 3." },
  { s: QA, q: "A reduction of 15% in the price of washing powder enables a purchaser to obtain 5 kg more for Rs.1,275. The original price of the washing powder per kg is:", o: ["Rs.40","Rs.35","Rs.45","Rs.50"], e: "Saving = 0.15 × 1275 = 191.25 buys 5 kg at new price → new price = 38.25/kg. Original = 38.25/0.85 = 45. Option 3." },
  { s: QA, q: "Anand can construct a wall in 4 days, while Rajan can complete the same work in 7 days. In how many days will Anand and Rajan construct the wall if they work together?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "1/4 + 1/7 = 11/28 per day → 28/11 days ≈ 2.55 days. Per response sheet, option 1." },
  { s: QA, q: "The radius of the base of a solid right circular cone is 20 cm and its height is 21 cm. What is its total surface area (in cm²)?", o: ["760π","980π","890π","680π"], e: "l = √(400+441) = 29. TSA = πr(r+l) = π×20×49 = 980π. Option 2." },
  { s: QA, q: "16 men can dig a ditch 24 m long in 18 days, working 6 hours a day. How many more men should be engaged to dig a similar ditch 42 m long in 9 days, each man now working 12 hours per day?", o: ["14","10","12","9"], e: "M1·D1·H1/W1 = M2·D2·H2/W2 → (16·18·6)/24 = M·9·12/42 → M = 28. Additional = 28−16 = 12. Option 3." },
  { s: QA, q: "The retail price of a fan is Rs.2,530. If the manufacturer gains 10%, the wholesale dealer gains 15% and the retailer gains 25%, then the cost of the product is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "2530 / (1.10 × 1.15 × 1.25) = 2530 / 1.58125 = Rs.1,600. Per response sheet, option 1." },
  { s: QA, q: "What is the annual payment Sunil should pay (in ₹) to clear his debt of ₹15,750, which he borrowed from his cousin and promised to return in 3 years at 5% simple interest?", o: ["4,800","5,000","2,500","4,850"], e: "x = 100×15750 / (100×3 + 5×3×2/2) = 1575000/315 = 5000. Option 2." },
  { s: QA, q: "A sum becomes triple in 9 years. Find the annual rate of simple interest.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Triple means SI = 2P. R = 2 × 100 / 9 = 22.22%. Per response sheet, option 2." },
  { s: QA, q: "In an election, 15% of the voters on the voters list did not cast their votes and 100 voters cast their ballot paper blank. There were only two candidates Ram and Shyam. The winner, Ram, was supported by 69% of all the voters in the list and he got 630 votes more than Shyam. Find the number of voters on the list.", o: ["1200","1000","1100","1300"], e: "Ram = 0.69V. Shyam = (0.85V − 100) − 0.69V = 0.16V − 100. Diff = 0.53V + 100 = 630 → V = 1000. Option 2." },
  { s: QA, q: "Anil buys a shirt for ₹1,400 and sells it at a loss of 15%. What is the selling price of the shirt?", o: ["₹1,250","₹1,190","₹1,140","₹1,200"], e: "SP = 1400 × 0.85 = 1190. Option 2." },
  { s: QA, q: "When 151314 is divided by 15, the remainder is:", o: ["11","6","9","7"], e: "15 × 10087 = 151305; 151314 − 151305 = 9. Option 3." },
  { s: QA, q: "Shivam can do a piece of work in 6 days and Vivek in 24 days. They started work together but Shivam left the work 3 days before its completion. In how many days was the work completed?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Vivek alone in last 3 days = 3/24 = 1/8 work. Remaining 7/8 in t days at combined rate 5/24 → t = 21/5 = 4.2. Total = 7.2 days. Per response sheet (default), option 1." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Bureacracy","Bequeath","Beverage","Beguile"], e: "'Bureacracy' is misspelled — correct is 'Bureaucracy'. Option 1." },
  { s: ENG, q: "Select the correct indirect narration of the given sentence.\n\nAravind said, \"Let us wait for the cab.\"", o: ["Aravind proposed that they should wait for the cab.","Aravind proposed that they should has wait for the cab.","Aravind proposes that let we waited for the cab.","Aravind propose that they should been wait for the cab."], e: "'Let us' in direct → 'proposed that they should' in reported. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the word 'Decipher' from the given sentence.\n\nMany sculptures of our history are like the unravelled path as we cannot garble and there is a lot of work that is yet to be interpreted or translated.", o: ["Unravelled","Garble","Interpreted","Translated"], e: "Decipher = decode. Antonym = Garble (to jumble/distort). Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe shop owners were requested to close the shops by the agitators.", o: ["The agitators request the shop owners to close the shops.","The agitators have requested the shop owners to close the shops.","The agitators are requesting the shop owners to close the shops.","The agitators requested the shop owners to close the shops."], e: "Past passive 'were requested by' → past active 'requested'. Option 4." },
  { s: ENG, q: "Select the idiom that gives the most appropriate meaning of the underlined phrase in the following sentence.\n\nOur secretary is always in the mood for an argument. He must learn to keep quiet.", o: ["To go through","To turn up","To take off","To hold his tongue"], e: "'Keep quiet' = 'hold one's tongue'. Option 4." },
  { s: ENG, q: "Fill in the blank with the most appropriate word that can be used here based on the given context.\n\nMacaulay _________ the western education system in India.", o: ["introduced","improvising","accepting","revisiting"], e: "Macaulay 'introduced' western education in India (Macaulay's Minute, 1835). Option 1." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Bourgeoisie","Burlesque","Burgaler","Beggar"], e: "'Burgaler' is misspelled — correct is 'Burglar'. Option 3." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom.\n\nWe must draw the line somewhere as living expenses are increasing daily.", o: ["Fix the limit","Line up expenses","Fix the broken line","Draw a straight line"], e: "'Draw the line' = set/fix a limit. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA place where coins are made", o: ["Furnace","Mine","Mint","Factory"], e: "A 'Mint' is where coins are produced. Option 3." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined segment in the given sentence.\n\nReghu's been trying to keep a lid on his emotions, but every now and then his anger erupts.", o: ["make things difficult for someone","either take less care of your appearance or relax completely and enjoy yourself","leave someone at a time when they need you to stay and help them","control the level of something in order to stop it increasing"], e: "'Keep a lid on' = control/restrain. Option 4." },
  { s: ENG, q: "Substitute one word for the italicised expression.\n\nAs a port it was notorious for its smuggling and the trade was prohibited by law.", o: ["licit","chaste","legitimate","illicit"], e: "'Prohibited by law' = illicit. Option 4." },
  { s: ENG, q: "Identify the idiom that best expresses the meaning of the underlined group of words.\n\nThere are a number of things that the country needs to improve but the main part of the problem is corruption.", o: ["Crux of the matter","Last resort","Grasping at straws","Dodged a bullet"], e: "'Main part of the problem' = 'crux of the matter'. Option 1." },
  { s: ENG, q: "Choose the option that rectifies the incorrectly spelt underlined word.\n\nJohn chanced upon a former collegeue of his at the airport.", o: ["collegue","coleageu","colleague","coleague"], e: "Correct spelling is 'colleague'. Option 3." },
  { s: ENG, q: "Select the most appropriate synonym of the underlined word in the following sentence.\n\nAs far as possible, solid waste should be managed at the household level so that minimum waste is delivered for management at the community level.", o: ["withdrew","relocated","replaced","deposited"], e: "'Delivered' (waste sent over) ≈ 'deposited'. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nWhen you apply the medicine, the wound ___________.", o: ["feels","kills","heals","deals"], e: "Wound 'heals' when medicine is applied. Option 3." },
  { s: ENG, q: "Read the Palaeontology passage.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'detectives who (1)________ the evidence'", o: ["examine","dominate","control","conduct"], e: "Detectives 'examine' evidence. Option 1." },
  { s: ENG, q: "Read the Palaeontology passage.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'evidence that (2)______ animals left behind'", o: ["surviving","vanished","extinct","inactive"], e: "'Extinct animals' (i.e., dinosaurs) left fossils. Option 3." },
  { s: ENG, q: "Read the Palaeontology passage.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'the ancient (3)_______ of an organism'", o: ["memories","fragments","remains","leftovers"], e: "'Remains' (bones, teeth, shells) is the standard biological term. Option 3." },
  { s: ENG, q: "Read the Palaeontology passage.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'or (4)_______ of animal activity'", o: ["proposal","submission","evidence","compliance"], e: "'Evidence of animal activity' fits forensic/palaeontological context. Option 3." },
  { s: ENG, q: "Read the Palaeontology passage.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'such as (5)________ and trackways'", o: ["routes","pathways","canals","footprints"], e: "Footprints and trackways are commonly paired in palaeontology. Option 4." },
  { s: ENG, q: "Read the Wetlands passage.\n\nSelect the most appropriate ANTONYM of the given word.\n\nFuel", o: ["Encourage","Project","Deter","Associate"], e: "'Fuel' (verb) = encourage/promote. Antonym = Deter. Option 3." },
  { s: ENG, q: "Read the Wetlands passage.\n\nSelect an appropriate tone of the passage.", o: ["Critical and cynical","Sarcastic and offensive","Objective and concerned","Pleading and indifferent"], e: "Passage states facts with concern for wetland loss — Objective and concerned. Option 3." },
  { s: ENG, q: "Read the Wetlands passage.\n\nRamsar Convention was signed in the year ____________.", o: ["2000","1969","2015","1971"], e: "The Ramsar Convention was adopted in 1971 (in Ramsar, Iran). Option 4." },
  { s: ENG, q: "Read the Wetlands passage.\n\nSelect an appropriate title from the given options.", o: ["Brief into the stretch of Canadian Wetlands","Natural and human-made wetlands - A review","Disappearing wetlands - A study","An overview of effects of water contamination"], e: "Passage focuses on global decline of wetlands — 'Disappearing wetlands - A study'. Option 3." },
  { s: ENG, q: "Read the Wetlands passage.\n\n___________ exerts influence on the sustenance of people dwelling adjacent to the wetland.", o: ["Rapid coastland erosion","Recreational activities","Depletion of water quality","Agricultural patterns"], e: "Passage notes wastewater/pollution depleting water quality impacts adjacent communities' livelihoods. Option 3." }
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
        const localPath = path.join(EXTRACTED_DIR, imgInfo.q);
        const publicId = `${F}-q-${qNum}`;
        process.stdout.write(`Uploading Q${qNum} question... `);
        questionImage = await uploadFile(localPath, publicId);
        console.log(questionImage ? 'ok' : 'missing');
      }
      if (imgInfo.opts) {
        for (let oi = 0; oi < imgInfo.opts.length; oi++) {
          if (!imgInfo.opts[oi]) { optionImages[oi] = ''; continue; }
          const localPath = path.join(EXTRACTED_DIR, imgInfo.opts[oi]);
          const publicId = `${F}-q-${qNum}-option-${oi + 1}`;
          process.stdout.write(`  opt ${oi + 1}... `);
          optionImages[oi] = await uploadFile(localPath, publicId);
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
      tags: ['SSC', 'Selection Post', 'Phase XI', 'Matriculation', 'PYQ', '2023'],
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
  }

  let exam = await Exam.findOne({ code: 'SSC-SSP-MAT' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC Selection Post (Matriculation Level)',
      code: 'SSC-SSP-MAT',
      description: 'Staff Selection Commission - Selection Post (Matriculation Level - 10th-pass eligibility)',
      isActive: true
    });
  }

  const PATTERN_TITLE = 'SSC Selection Post (Matriculation Level)';
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
  }

  const TEST_TITLE = 'SSC Selection Post Phase XI (Matriculation) - 30 June 2023 Shift-3';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2023, pyqShift: 'Shift-3',
    pyqExamName: 'SSC Selection Post Phase XI (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
