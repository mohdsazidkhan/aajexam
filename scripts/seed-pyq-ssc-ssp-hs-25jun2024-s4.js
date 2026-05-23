/**
 * Seed: SSC Selection Post Phase XII 2024 (Higher Secondary Level) PYQ - 25 June 2024, Shift-4
 * Section order: REA → GA → QA → ENG. Key auto-decoded from green-tick bullets.
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun25_2024_s4";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-hs-25jun2024-s4';

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

const F = '25-jun-2024-s4';

const IMAGE_MAP = {
  1:  { q: '', opts: ['image2.png','image4.png','image5.png','image6.png'] },                       // REA Venn diagram
  7:  { q: 'image8.jpeg', opts: ['image9.jpeg','image10.jpeg','image11.jpeg','image12.jpeg'] },     // REA mirror
  11: { q: 'image13.jpeg', opts: ['image14.jpeg','image15.jpeg','image16.jpeg','image17.jpeg'] },   // REA embedded figure
  15: { q: 'image18.jpeg', opts: ['','','',''] },                                                    // REA dice
  24: { q: 'image19.jpeg', opts: ['image20.jpeg','image21.jpeg','image22.jpeg','image23.jpeg'] },   // REA figure series
  54: { q: 'image24.jpeg', opts: ['','','',''] },                                                    // QA Q4 image
  56: { q: 'image25.png', opts: ['','','',''] },                                                     // QA Q6 bar graph
  58: { q: 'image26.jpeg', opts: ['','','',''] },                                                    // QA Q8 image
  61: { q: 'image27.jpeg', opts: ['','','',''] },                                                    // QA Q11 image
  62: { q: '', opts: ['image28.jpeg','image29.jpeg','image30.jpeg','image31.png'] },                // QA Q12 image opts
  65: { q: 'image32.jpeg', opts: ['','','',''] },                                                    // QA Q15 image
  67: { q: '', opts: ['image33.jpeg','image34.jpeg','image35.jpeg','image36.jpeg'] },                // QA Q17 image opts
  69: { q: 'image37.jpeg', opts: ['','','',''] },                                                    // QA Q19 image
  71: { q: '', opts: ['image38.jpeg','image39.jpeg','image40.jpeg','image41.jpeg'] },                // QA Q21 image opts
  75: { q: 'image42.jpeg', opts: ['','','',''] }                                                     // QA Q25 figure
};

const KEY = [
  // REA (1-25)
  2, 1, 2, 2, 1,   3, 2, 3, 3, 4,   3, 1, 1, 2, 4,   3, 1, 1, 1, 3,   3, 3, 1, 3, 3,
  // GA (26-50)
  3, 1, 1, 1, 3,   3, 4, 4, 4, 3,   1, 3, 3, 2, 3,   1, 3, 4, 2, 1,   4, 1, 2, 1, 3,
  // QA (51-75)
  3, 3, 2, 2, 4,   1, 4, 2, 4, 4,   2, 3, 1, 1, 4,   3, 2, 1, 3, 2,   2, 2, 4, 4, 4,
  // ENG (76-100)
  3, 4, 2, 4, 3,   2, 2, 1, 4, 2,   2, 4, 1, 4, 1,   1, 4, 3, 2, 1,   4, 1, 2, 1, 2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Select the Venn diagram that best illustrates the relationship between the following classes.\nLion, Dog, Elephant", o: ["Option 1","Option 2","Option 3","Option 4"], e: "All three are distinct animal classes (no overlap). Per docx, option 2." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n(The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word)\n\nCow : Bull :: Mare : ?", o: ["Stallion","Buck","Boar","Lamb"], e: "Cow (female) : Bull (male) :: Mare (female horse) : Stallion (male horse). Option 1." },
  { s: REA, q: "The numbers in each set are related to each other in a certain way.\n(2, 12, 72), (7, 42, 252), (4, 24, ?)\nBased on the relationship among the numbers in the first two sets, select the number that can replace the question mark (?) in the third set.", o: ["124","144","164","140"], e: "Pattern: a, a×6, a×36. 2,12,72 ✓; 7,42,252 ✓; 4,24,144. Option 2." },
  { s: REA, q: "In a certain code language, 'PAST' is coded as '9713' and 'SORE' is coded as '8146'. What is the code for 'S' in that language?", o: ["4","1","9","8"], e: "From PAST=9713: P=9,A=7,S=1,T=3. From SORE=8146: S=8? But conflicts with S=1 from PAST. Per docx answer key, option 2 (1)." },
  { s: REA, q: "If 'A' stands for '÷', 'B' stands for '×', 'C' stands for '+' and 'D' stands for '−', what will come in place of the question mark (?) in the following equation?\n36 B 17 D 59 C 224 A 7 = ?", o: ["585","558","685","855"], e: "Substituting: 36 × 17 − 59 + 224 ÷ 7 = 612 − 59 + 32 = 585. Option 1." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n729, 512, 343, ?, 125", o: ["64","16","216","576"], e: "Cubes: 9³, 8³, 7³, 6³=216, 5³. Option 3 (216)." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at line MN as shown below.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 2." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\n_ _NE_ _CIN_ _ _C_ _ _M_", o: ["IMCEANEMAME","AIMCNEMNACN","CIMAEMAINEA","MECIANEMANE"], e: "Per docx answer key, option 3 (CIMAEMAINEA)." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n1. Toddler\n2. Adult\n3. Adolescent\n4. Foetus\n5. Baby", o: ["1, 5, 3, 2, 4","1, 5, 4, 3, 2","4, 5, 1, 3, 2","4, 1, 5, 3, 2"], e: "Foetus(4) → Baby(5) → Toddler(1) → Adolescent(3) → Adult(2) = 4,5,1,3,2. Option 3." },
  { s: REA, q: "In a certain code language, 'BUSHY' is written as 'CTTGZ' and 'COAST' is written as 'DNBRU'. How will 'DWELL' be written in that language?", o: ["EVGKM","EXFMN","EXFKN","EVFKM"], e: "Pattern: +1,−1,+1,−1,+1. D+1=E, W−1=V, E+1=F, L−1=K, L+1=M. EVFKM. Option 4." },
  { s: REA, q: "Select the option figure in which the given figure is embedded as its part (Rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3." },
  { s: REA, q: "In a certain code language,\n'A + B' means 'A is the wife of B'\n'A − B' means 'A is the sister of B'\n'A × B' means 'A is the mother of B'\n'A ÷ B' means 'A is the daughter of B'\nBased on the above, how is O related to L if 'O − M × N + L'?", o: ["Daughter","Mother","Sister","Daughter-in-law"], e: "O is sister of M; M is mother of N; N is wife of L → M is mother of N, L is N's husband → O is sister of M = sister of L's mother-in-law. Per docx, option 1 (Daughter)." },
  { s: REA, q: "Three statements followed by two conclusions.\nStatements:\nI. Some digits are alphabets.\nII. All alphabets are books.\nIII. Some books are novels.\n\nConclusions:\nI. All novels are digits.\nII. Some digits are books.", o: ["Only conclusion II follows","Neither conclusion I nor II follows","Both conclusions I and II follow","Only conclusion I follows"], e: "Some digits alphabets + all alphabets books → some digits are books (II ✓). All novels digits cannot be inferred. Option 1." },
  { s: REA, q: "In a certain code language,\n'A + B' means 'A is the mother of B',\n'A − B' means 'A is the father of B',\n'A × B' means 'A is the daughter of B'.\nBased on the above, how is H related to L if 'H + I − J × K + L'?", o: ["Mother's sister","Father's mother","Father's sister","Mother's mother"], e: "H is mother of I; I is father of J; J is daughter of K; K is mother of L → J=L's sibling? Per docx, option 2 (Father's mother)." },
  { s: REA, q: "Six numbers 1, 2, 3, 4, 5 and 6 are written on different faces of a dice. Two positions of this dice are shown in the following figure. Find the number on the face opposite to 2.", o: ["1","6","4","5"], e: "Per docx answer key, option 4 (5)." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n1. District\n2. Room\n3. Village\n4. State\n5. House", o: ["2, 4, 3, 1, 5","3, 4, 1, 2, 5","2, 5, 3, 1, 4","3, 4, 2, 1, 5"], e: "Room(2) → House(5) → Village(3) → District(1) → State(4) = 2,5,3,1,4. Option 3." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n1. Masterstroke\n2. Malnutrition\n3. Marigold\n4. Magical\n5. Magnify", o: ["4,5,2,3,1","5,4,2,3,1","2,4,5,3,1","3,4,5,2,1"], e: "Magical(4), Magnify(5), Malnutrition(2), Marigold(3), Masterstroke(1) → 4,5,2,3,1. Option 1." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\nC_C_S_C__C__", o: ["SCCSCSC","SCSSCCC","CSSCCSC","CCSCSSC"], e: "Per docx answer key, option 1 (SCCSCSC)." },
  { s: REA, q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster.\n\nDIALOGUE : HMEPKCQA :: HOSPITAL : LSWTEPWH :: CHAMBERS : ?", o: ["GLEQXANO","GLEQXZNO","GLEQWAON","GLEPXANO"], e: "Per docx answer key, option 1 (GLEQXANO)." },
  { s: REA, q: "In a certain code language, 'NOISE' is coded as 124 and 'WILD' is coded as 96. How will 'GIVER' be coded in the same language?", o: ["111","120","122","104"], e: "Per docx answer key, option 3 (122)." },
  { s: REA, q: "In a certain code language,\n'M & N' means 'M is the mother of N'\n'M @ N' means 'M is the son of N',\n'M # N' means 'M is the daughter of N'.\nBased on the above, how is L related to O if 'K & L & M # N @ O'?", o: ["Brother's wife","Sister","Son's wife","Daughter"], e: "K is mother of L; L is mother of M; M is daughter of N; N is son of O → N is M's father; O is N's parent (M's grandparent); L is M's mother (N's wife) → L is O's son's wife. Option 3." },
  { s: REA, q: "In a certain code language, 'THORP' is written as 'IUNKM' and 'SERIES' is written as 'JXKTXJ'. How will 'TRACE' be written in that language?", o: ["XBZKI","IKXBZ","IKBZX","IKBXZ"], e: "Per docx answer key, option 3 (IKBZX)." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n(The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word)\n\nEye : Tears :: Skin : ?", o: ["Sweat","Supple","Soft","Body"], e: "Eyes secrete tears; skin secretes sweat. Option 1." },
  { s: REA, q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3." },
  { s: REA, q: "Two Statements are given followed by Three conclusions.\nStatements:\nSome mugs are rugs.\nAll tugs are mugs.\n\nConclusions:\nI. Some rugs are mugs.\nII. Some mugs are tugs.\nIII. No rug is a mug.", o: ["Both conclusions II and III follow.","Both conclusions I and III follow.","Both conclusions I and II follow.","All conclusions I, II and III follow."], e: "Some mugs are rugs → some rugs are mugs (I ✓). All tugs are mugs → some mugs are tugs (II ✓). 'Some mugs are rugs' contradicts III. Option 3." },

  // ============ GA (26-50) ============
  { s: GA, q: "A _________ is one billionth of a metre.", o: ["parsec","micrometre","nanometre","angstrom"], e: "1 nanometre = 10⁻⁹ metre. Option 3." },
  { s: GA, q: "Who among the following Hindustani classical musicians was NOT associated with 'Maihar Gharana'?", o: ["Ustad Bismillah Khan","Ali Akbar Khan","Pt Ravi Shankar","Annapurna Devi"], e: "Ustad Bismillah Khan (shehnai) was not from Maihar Gharana. Option 1." },
  { s: GA, q: "Which of the following festivals is also known as the '100 drums festival'?", o: ["Wangala","Cheiraoba","Saga Dawa","Sanken"], e: "Wangala (Garo people, Meghalaya) is the 100 Drums Festival. Option 1." },
  { s: GA, q: "Which is the deepest point of Earth's oceans with a depth of 11,022 metres?", o: ["Pacific Ocean's Mariana Trench","Indian Ocean's Java Trench","Arctic Ocean's Eurasian Basin","Atlantic Ocean's Puerto Rico Trench"], e: "Mariana Trench (Challenger Deep) in Pacific. Option 1." },
  { s: GA, q: "Chromosomes found in the salivary glands of Drosophila are:", o: ["giant chromosome lampbrush","presence of minute chromosomes","giant chromosome polytene","presence of fat digestive enzymes"], e: "Drosophila salivary glands contain polytene chromosomes. Option 3." },
  { s: GA, q: "The Vikramshila University was founded under the patronage of the king ___________.", o: ["Devraja","Gopala","Dharmpala","Devpala"], e: "Vikramshila Mahavihara was founded by Pala king Dharmpala. Option 3." },
  { s: GA, q: "Lad Khan Temple at Aihole in Karnataka is an example of which of the following styles of temple architecture?", o: ["Pagoda","Dravida","Nagara","Vesara"], e: "Lad Khan Temple represents the Vesara style. Option 4." },
  { s: GA, q: "In which of the following years was the first population census conducted non-synchronously in different parts of India?", o: ["1912","1885","1900","1872"], e: "First non-synchronous census in India: 1872 (Lord Mayo). Option 4." },
  { s: GA, q: "Which of the following options is INCORRECT?\nIn order to become a member of Vidhan Sabha, a person must:", o: ["not hold any office of profit","have his/her name in the voters' list","be a citizen of India","have attained the age of 21 years"], e: "Min age for MLA is 25 years, not 21. Option 4." },
  { s: GA, q: "In February 2023, which State Government's cabinet has approved the new excise policy under which 'ahatas', or areas for drinking attached to liquor outlets, and shop bars will be closed?", o: ["West Bengal","Bihar","Madhya Pradesh","Uttar Pradesh"], e: "Madhya Pradesh approved the new excise policy (Feb 2023). Option 3." },
  { s: GA, q: "In which of the following festivals is Kolam drawn?", o: ["Pongal","Karma","Bhogali Bihu","Hareli"], e: "Kolam rangoli is drawn during Pongal in Tamil Nadu. Option 1." },
  { s: GA, q: "The ministers in the state hold office during the pleasure of the:", o: ["Speaker of the Legislative Assembly","Deputy Chief Minister","Governor","Chief Minister"], e: "State ministers hold office during pleasure of the Governor (Article 164). Option 3." },
  { s: GA, q: "Which Article of the Indian Constitution makes it clear that Directive Principles of State Policy are fundamental in the governance of the country and it shall be the duty of the state to apply these principles in making laws?", o: ["Article 46","Article 44","Article 37","Article 40"], e: "Article 37 declares DPSP as fundamental in governance. Option 3." },
  { s: GA, q: "________ is the study of the distribution and movement of water both on and below the Earth's surface, as well as the impact of human activity on water availability and conditions.", o: ["Biology","Hydrology","Ecology","Anthology"], e: "Hydrology is the study of water on/under Earth's surface. Option 2." },
  { s: GA, q: "Through an Act passed in which year was the post of Governor-General removed and a new post of Viceroy got created during British rule in India?", o: ["1935","1853","1858","1833"], e: "Government of India Act 1858 created the title of Viceroy. Option 3." },
  { s: GA, q: "Which triangular plateau region of India lies south of the river Narmada?", o: ["Deccan plateau","Malwa plateau","Marwar plateau","Bagelkhand plateau"], e: "Deccan plateau lies south of Narmada. Option 1." },
  { s: GA, q: "Pradhan Mantri Virasat Ka Samvardhan (PM VIKAS) Scheme is a scheme of which Ministry of the Government of India?", o: ["Ministry of Culture","Ministry of Tourism","Ministry of Minority Affairs","Ministry of Tribal Affairs"], e: "PM VIKAS is under Ministry of Minority Affairs. Option 3." },
  { s: GA, q: "Padma Shri Awardee Gosaveedu Shaik Hassan is known for playing:", o: ["Ghatam","Violin","Veena","Nadaswaram"], e: "Gosaveedu Shaik Hassan is renowned for the Nadaswaram. Option 4." },
  { s: GA, q: "Who among the following Mauryan rulers was the first, who tried to convey his messages to his subjects concerning the idea and practice of dhamma through inscriptions?", o: ["Brihadaratha","Ashoka","Dasaratha","Chandragupta Maurya"], e: "Ashoka used edicts/inscriptions to spread Dhamma. Option 2." },
  { s: GA, q: "What is the percentage of people below the poverty line in India according to Government of India, planning commission 2013?", o: ["21.92%","13.98%","23.67%","5.09%"], e: "Tendulkar-based 2011-12 (released 2013) figure: 21.92%. Option 1." },
  { s: GA, q: "AIDS is an abbreviation for:", o: ["Acquired Immunic Deficiency Syndrome","Acquired Immuno Deficiency Syndicate","Acquire Immuno Deficiency Syndicate","Acquired Immuno Deficiency Syndrome"], e: "AIDS = Acquired Immuno Deficiency Syndrome. Option 4." },
  { s: GA, q: "Who among the following is the author of the book 'The Complete Adventures of Feluda'?", o: ["Satyajit Ray","Mrinal Sen","Goutam Ghosh","Ritwik Ghatak"], e: "Satyajit Ray wrote the Feluda series. Option 1." },
  { s: GA, q: "Which of the following does NOT come under the Concurrent List?", o: ["Medical Education","Artificial Habitats","Protection of Wildlife","Population Control"], e: "Artificial Habitats is not a Concurrent List subject. Option 2." },
  { s: GA, q: "Who among the following was appointed as the Chairman of the 22nd Law Commission in November 2022?", o: ["Justice (retd) Rituraj Awasthi","Justice DY Chandrachud","Justice (retd) S Abdul Nazeer","Justice TK Shankar"], e: "Justice (retd) Rituraj Awasthi became Chairman of 22nd Law Commission (Nov 2022). Option 1." },
  { s: GA, q: "Under the Governor Generalship of ________, the Permanent Settlement was introduced in 1793.", o: ["Dalhousie","William Bentinck","Charles Cornwallis","Warren Hastings"], e: "Permanent Settlement (1793) was introduced under Cornwallis. Option 3." },

  // ============ QA (51-75) ============
  { s: QA, q: "A vendor buys 20 pens for ₹15 and sells them at 15 for ₹20. How many pens should be bought and sold to earn a profit of ₹245?", o: ["320","280","420","540"], e: "CP/pen = 15/20 = 0.75; SP/pen = 20/15 = 1.333. Profit/pen ≈ 0.583. Need 245/0.583 ≈ 420 pens. Option 3." },
  { s: QA, q: "A person spends 60% of his income. His income increased by 30% and he increased his expenditure by 20%. His percent savings will then be increased by:", o: ["48%","46%","45%","42%"], e: "Initial: income=100, spend=60, save=40. New: income=130, spend=72, save=58. Increase = (58−40)/40 × 100 = 45%. Option 3." },
  { s: QA, q: "A can do a piece of work in 25 days. After working for 5 days, he took help of B and completed the work in 8 days. If both A and B had worked together from the beginning, in how many days would they have completed the work?", o: ["12","10","14","15"], e: "A's work in 5 days = 5/25 = 1/5. Remaining 4/5 done by A+B in 8 days → A+B/day = 1/10. Together for whole: 10 days. Option 2." },
  { s: QA, q: "Find the value of the given expression.", o: ["343","322","340","332"], e: "Per docx answer key, option 2 (322)." },
  { s: QA, q: "The prices of a school bag and a school dress are in the ratio of 8 : 7. The price of the school bag is ₹400 more than the price of the school dress. Find the price of the school dress.", o: ["3,800","3,400","2,400","2,800"], e: "Let bag=8x, dress=7x. 8x − 7x = 400 → x=400. Dress = 7×400 = 2800. Option 4." },
  { s: QA, q: "The following bar graph shows the failure rates (in thousands) for different electric components: How many times is the failure rate of hybrid micro circuits compared to that of signal devices?", o: ["2.5","0.4","4","5.2"], e: "Per docx answer key, option 1 (2.5)." },
  { s: QA, q: "In a circular race of 2,500 m, Reeta and Geeta start running in the same direction from the same point and at the same time with speeds of 36 km/h and 54 km/h, respectively. After how much time will they meet for the first time on the track?", o: ["490 second","480 second","510 second","500 second"], e: "Relative speed = 18 km/h = 5 m/s. Time = 2500/5 = 500 s. Option 4." },
  { s: QA, q: "Identify the name based on the given clue.", o: ["Ramagya","Bitthal","Krishna","Rameshwar"], e: "Per docx answer key, option 2 (Bitthal)." },
  { s: QA, q: "Two numbers are in the ratio 4 : 5. If 17 is subtracted from each, the new numbers are in the ratio 11 : 14. If 20 is added to each of the original numbers, then the ratio becomes:", o: ["241 : 275","224 : 241","275 : 241","224 : 275"], e: "Let 4x, 5x. (4x−17)/(5x−17) = 11/14 → 14(4x−17) = 11(5x−17) → 56x − 238 = 55x − 187 → x=51. Original 204, 255. Add 20: 224, 275. Option 4." },
  { s: QA, q: "In a division sum, the divisor is 10 times the quotient and 5 times the remainder. If the remainder is 12, then what is the dividend?", o: ["368","386","352","372"], e: "Remainder 12. Divisor = 5×12 = 60. Divisor = 10×Q → Q = 6. Dividend = 60×6 + 12 = 372. Option 4." },
  { s: QA, q: "Evaluate the given expression.", o: ["11","17","3","7"], e: "Per docx answer key, option 2 (17)." },
  { s: QA, q: "Sarthak and Mohan are working on alternate days in a workshop. Sarthak can complete the work in 20 days while Mohan can finish in 25 days. Sarthak works on the 1st day, Mohan on the 2nd day, and so on. How much time (in days) will they take on alternate basis?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "LCM(20,25)=100. S=5/day, M=4/day. Two-day pair=9. After 22 days (11 pairs)=99. Day 23 (S)=104>100, so 22 + small fraction = 22 + 1/5. Per docx, option 3." },
  { s: QA, q: "In what duration (in years) will ₹1,500 amount to ₹2,250 at simple interest 10% per annum?", o: ["5","3.5","3","5.5"], e: "SI = 750. T = SI×100/(P×R) = 75000/15000 = 5 years. Option 1." },
  { s: QA, q: "A shopkeeper normally makes a profit of 20% in a certain transaction; he weighed 900 gm instead of 1 kg due to an error in the weighing machine. If he charges 15% less than what he normally charges, then what is his actual profit or loss percentage?", o: ["13.33% profit","13.33% loss","18.00% loss","18.33% profit"], e: "Let CP=100. Normal SP=120. With error CP for 900g = 90. With 15% less charge SP = 102. Profit = (102−90)/90 ≈ 13.33%. Option 1." },
  { s: QA, q: "Evaluate the given expression.", o: ["0","8","-1","1"], e: "Per docx answer key, option 4 (1)." },
  { s: QA, q: "A shopkeeper announced 17% rebate on the marked price of an article. If the selling price of the article is ₹1,245, then the marked price (in ₹) of the article is:", o: ["1820","1600","1500","1780"], e: "MP × 0.83 = 1245 → MP = 1500. Option 3." },
  { s: QA, q: "A sphere and a cube have equal surface areas. The ratio of the volume of the sphere to that of the cube is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "4πr² = 6a² → V_sphere/V_cube = (4/3)πr³ / a³. Per docx, option 2." },
  { s: QA, q: "In ΔOPQ, ∠O = 50°, ∠P = 70°, and the bisectors of ∠P and ∠Q meet at R. Find ∠PRQ.", o: ["115°","125°","120°","118°"], e: "∠Q = 180−50−70 = 60°. ∠PRQ = 90° + ∠O/2 = 90° + 25° = 115°. Option 1." },
  { s: QA, q: "Find the value as per the given figure.", o: ["Less, 12.7%","More, 14.1%","Less, 14.1%","More, 12.7%"], e: "Per docx answer key, option 3 (Less, 14.1%)." },
  { s: QA, q: "A train leaves Hyderabad at 4:00 A.M. and reaches Vijayawada at 8:00 A.M. the same day. Another train leaves Vijayawada at 6:00 A.M. and reaches Hyderabad at 9:30 A.M the same day. At what time do the two trains cross each other?", o: ["7:45 A.M.","6:56 A.M.","6:45 A.M.","7:56 A.M."], e: "Per docx answer key, option 2 (6:56 A.M.)." },
  { s: QA, q: "A person mixes two liquids, x and y. One litre of x weighs approximately 900 g, and one litre of y weighs approximately 750 g. If one litre of the mixture weighs approximately 800 g, then the percentage of x in the mixture is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "By alligation: (800−750)/(900−800) = 50/100 = 1/2 → x:y = 1:2 → x% = 33.33%. Per docx, option 2." },
  { s: QA, q: "A shopkeeper mixes 15 kg of sugar costing ₹11/kg with 22 kg of sugar costing ₹12/kg. What is the cost (in ₹) per kg of the mixture? (Rounded off to 2 decimal places)", o: ["11.51","11.59","11.84","11.38"], e: "Total cost = 15×11 + 22×12 = 165 + 264 = 429. Total kg = 37. Avg = 429/37 ≈ 11.59. Option 2." },
  { s: QA, q: "If a car covers 90 km using 4 litres of petrol, how much distance (in km) will it cover using 32 litres of petrol?", o: ["650","710","680","720"], e: "Mileage = 90/4 = 22.5 km/L. 22.5 × 32 = 720. Option 4." },
  { s: QA, q: "If (x + y + z) = 23 and x² + y² + z² = 179, then find the value of (xy + yz + zx).", o: ["225","350","280","175"], e: "(x+y+z)² = x²+y²+z² + 2(xy+yz+zx) → 529 = 179 + 2(...) → xy+yz+zx = 175. Option 4." },
  { s: QA, q: "ΔABC and ΔABD are on a common base AB and AC = BD and BC = AD as shown in the given figure. Which of the following options is true?", o: ["There are no congruent triangles in the given figure","ΔABC ≅ ΔABD","ΔABC ≅ ΔADB","ΔABC ≅ ΔBAD"], e: "AC=BD, BC=AD, AB common → ΔABC ≅ ΔBAD by SSS (matching A↔B). Option 4." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "The following sentence has been divided into parts. One of them may contain an error.\nBy the time she retires, / she has been teaching / at the university for 30 years.", o: ["No error","By the time she retires","she has been teaching","at the university for 30 years"], e: "'By the time she retires' (future) needs 'will have been teaching', not 'has been teaching'. Option 3." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\nTo make both ends meet", o: ["Quite worthless","To take back what you have said","To anticipate","To live within one's income"], e: "Make ends meet = live within income. Option 4." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Accuse","Raival","Conservative","Trigger"], e: "Correct spelling is 'Rival', not 'Raival'. Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA study of the conditions and structure of the earth", o: ["Biology","Geography","Meteorology","Geology"], e: "Geology = study of Earth's structure. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\nHe said, \"She has finished the painting.\"", o: ["She has finished the painting he said.","He said she had finished the painting.","He said that she had finished the painting.","He said she has finished the painting."], e: "Indirect: said + that + backshift 'has' → 'had'. Option 3." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\nRohit laid down his proposal, and told Rohit that the ball was now in his court.", o: ["He had to continue the remaining time in court","It is Rohit's responsibility to take the next action or decision","The captaincy of the team was on his shoulders","He had to play the game and win the match"], e: "Ball in his court = his turn to act. Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nCrime of killing a king", o: ["Pesticide","Regicide","Genocide","Homicide"], e: "Regicide = killing of a king. Option 2." },
  { s: ENG, q: "Select the sentence that does NOT have a spelling error.", o: ["How dare you challenge me?","How dare you chellenge me?","How dare you challange me?","How dare you chalenge me?"], e: "Correct spelling: 'challenge'. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\nBeliefs or incidents that happen in a way which cannot be explained by reason or science.", o: ["Marvels","Wonders","Science totems","Superstitions"], e: "Superstitions = beliefs inexplicable by reason. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\nA Mercedes-Benz was owned by my father.", o: ["My father has owned a Mercedes-Benz.","My father owned a Mercedes-Benz.","My father owns a Mercedes-Benz.","My father has been owning a Mercedes-Benz."], e: "Past simple active: 'My father owned'. Option 2." },
  { s: ENG, q: "Select the option that expresses the following sentence in active voice.\nWere these books bought by her yesterday?", o: ["Is she the one who bought these books yesterday?","Did she buy these books yesterday?","Who bought these books yesterday?","Are these books bought by her yesterday?"], e: "Past simple active: 'Did she buy ...'. Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA person who renounces a religious or political belief or principle.", o: ["Ascetic","Atheist","Agnostic","Apostate"], e: "Apostate = one who renounces beliefs. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\nWe love Nathan.", o: ["Nathan is loved by us.","Nathan is being loved by us.","Nathan has been loved by us.","Nathan have been loved by us."], e: "Simple present passive: 'is loved by'. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word in the given sentence.\nA few minutes later a request came that all members of the house party should assemble in the drawing-room.", o: ["Gather","Guard","Search","Disperse"], e: "Assemble ↔ Disperse. Option 4." },
  { s: ENG, q: "Select the most appropriate article to fill in the blank.\nYour shirt is _____ same colour as mine.", o: ["the","an","a","No article required"], e: "Definite article 'the' is required with 'same'. Option 1." },
  { s: ENG, q: "Read the Water Cycle passage. Select the most appropriate option to fill in blank number 1.\n'movement of water between the (1)____________, the water bodies and the land'", o: ["atmosphere","environment","forest","ecosystem"], e: "Water moves between atmosphere, water bodies, land. Option 1." },
  { s: ENG, q: "Read the Water Cycle passage. Select the most appropriate option to fill in blank number 2.\n'At the heart of the water cycle is the process of (2)____________'", o: ["sublimation","liquefaction","condensation","evaporation"], e: "Heat turning water to vapour = evaporation. Option 4." },
  { s: ENG, q: "Read the Water Cycle passage. Select the most appropriate option to fill in blank number 3.\n'they release their moisture through (3)____________, which can fall as rain'", o: ["sublimation","evaporation","precipitation","condensation"], e: "Rain/snow = precipitation. Option 3." },
  { s: ENG, q: "Read the Water Cycle passage. Select the most appropriate option to fill in blank number 4.\n'released back into the atmosphere through a process called (4)_________'", o: ["condensation","transpiration","evaporation","precipitation"], e: "Plants release water via transpiration. Option 2." },
  { s: ENG, q: "Read the Water Cycle passage. Select the most appropriate option to fill in blank number 5.\n'plays a role in regulating (5)_______ temperatures'", o: ["global","national","communal","rural"], e: "Water cycle regulates global temperatures. Option 1." },
  { s: ENG, q: "Read the Common Cold passage. Select the most suitable title for the given passage.", o: ["The Technique of Tissue Culture Independently","The Most Frequent Infectious Diseases","Viruses Gain Immunity from Colds","The Problem Of Controlling the Common Cold"], e: "Passage centres on difficulty controlling colds. Option 4." },
  { s: ENG, q: "Read the Common Cold passage. Medical science has not done anything yet to solve the problem of the common cold because:", o: ["viruses are so much smaller than the bacteria that cause many other infections; they cannot be seen with ordinary microscopes","other viruses get into the bloodstream where anti-bodies oppose them","bacteria causes many common infections such as pneumonia, wound infections and bloodstream infections","we can control one of the commonest of all diseases"], e: "Passage: viruses too small for ordinary microscopes. Option 1." },
  { s: ENG, q: "Read the Common Cold passage. Identify the most suitable inference from the given passage.", o: ["The viruses causing cold attack only on the surface and become immune to it.","Medical Science has not yet resolved the problem of the common cold. Therefore, we have to suffer colds for some more time.","Colds are minor infections of the nose and throat caused by viruses. Rhinovirus is the most common cause of common cold.","When your immune system is exposed to a new germ for the first time, it responds by trying to fight it off."], e: "Passage closes with this point. Option 2." },
  { s: ENG, q: "Read the Common Cold passage. Which of the following is the most appropriate summary of the given passage?", o: ["In spite of having the cure to kill diseases like Typhus and Plague, it seems ridiculous that medical science has not done much yet to solve the problem of the common cold.","Usually, a bacteria strikes only once and we do not gain immunity from colds","The problem of common cold is unusually difficult, hence, we are likely to get relief from cold.","Virus research has led to the discovery of a large number of viruses and leaves the victim immune to further attacks."], e: "Comprehensive summary of passage's argument. Option 1." },
  { s: ENG, q: "Read the Common Cold passage. The most appropriate synonym of the word 'isolated' is:", o: ["accessible","deserted","bare","futile"], e: "Per docx answer key, option 2 (deserted)." }
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
      tags: ['SSC', 'Selection Post', 'Phase XII', 'Higher Secondary', 'PYQ', '2024'],
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

  let exam = await Exam.findOne({ code: 'SSC-SSP-HS' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC Selection Post (Higher Secondary Level)',
      code: 'SSC-SSP-HS',
      description: 'Staff Selection Commission - Selection Post (Higher Secondary Level - 12th-pass eligibility)',
      isActive: true
    });
  }

  const PATTERN_TITLE = 'SSC Selection Post (Higher Secondary Level)';
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Higher Secondary) - 25 June 2024 Shift-4';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2024, pyqShift: 'Shift-4',
    pyqExamName: 'SSC Selection Post Phase XII (Higher Secondary)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
