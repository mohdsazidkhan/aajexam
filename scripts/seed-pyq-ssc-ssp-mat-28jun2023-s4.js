/**
 * Seed: SSC Selection Post Phase XI 2023 (Matriculation Level) PYQ - 28 June 2023, Shift-4 (100 questions)
 * Source: SSC official response sheet (PDF + docx, English version).
 * Section order: REA → GA → QA → ENG.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-28jun2023-s4.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun28_s4";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-28jun2023-s4';

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

const F = '28-jun-2023-s4';

const IMAGE_MAP = {
  1:  { q: 'image2.jpeg', opts: ['image3.jpeg','image5.jpeg','image7.jpeg','image8.jpeg'] },
  2:  { q: 'image9.jpeg', opts: ['image10.png','image11.jpeg','image12.jpeg','image13.png'] },
  3:  { q: 'image14.jpeg', opts: ['image15.jpeg','image16.jpeg','image17.jpeg','image18.jpeg'] },
  21: { q: 'image19.jpeg', opts: ['','','',''] },                                          // REA Q21 question image (math signs)
  54: { q: '', opts: ['image20.png','image21.jpeg','image22.jpeg','image23.jpeg'] },       // QA Q4
  55: { q: '', opts: ['image24.jpeg','image25.jpeg','image26.jpeg','image27.jpeg'] },      // QA Q5
  56: { q: 'image28.jpeg', opts: ['','','',''] },                                          // QA Q6 question image (text options)
  58: { q: '', opts: ['image29.jpeg','image30.jpeg','image31.jpeg','image32.jpeg'] },      // QA Q8
  62: { q: 'image33.jpeg', opts: ['image34.jpeg','image35.jpeg','image36.png','image37.png'] }, // QA Q12
  68: { q: 'image38.jpeg', opts: ['','','',''] },                                          // QA Q18 question image
  71: { q: '', opts: ['image39.jpeg','image40.jpeg','image41.jpeg','image42.jpeg'] },      // QA Q21
  75: { q: '', opts: ['image43.jpeg','image44.jpeg','image45.jpeg','image46.jpeg'] }       // QA Q25
};

const KEY = [
  // REA
  2, 4, 3, 3, 4,   2, 3, 4, 2, 2,   3, 2, 2, 4, 2,   4, 3, 4, 1, 3,   3, 4, 1, 4, 4,
  // GA
  3, 4, 3, 2, 4,   4, 1, 3, 1, 3,   3, 3, 2, 4, 3,   1, 3, 1, 3, 3,   4, 4, 3, 1, 3,
  // QA
  4, 3, 2, 2, 4,   3, 3, 3, 2, 2,   4, 3, 3, 2, 2,   1, 2, 2, 1, 4,   1, 2, 1, 3, 4,
  // ENG
  1, 2, 4, 1, 1,   2, 4, 1, 3, 2,   4, 3, 2, 2, 1,   1, 4, 3, 2, 1,   2, 1, 4, 2, 4
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in the order in which they appear in an English dictionary.\n\n1. Reduce  2. Refer  3. Redress  4. Reedy  5. Redeem", o: ["5, 1, 4, 3, 2","4, 3, 5, 2, 1","5, 3, 1, 4, 2","4, 5, 1, 2, 3"], e: "Dictionary: Redeem(5), Redress(3), Reduce(1), Reedy(4), Refer(2) → 5,3,1,4,2. Option 3." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nAll candies are gems. All gems are cakes. Some cakes are sweets.\n\nConclusions:\nI. All candies are cakes.\nII. Some gems are sweets.", o: ["Neither conclusion I nor II follows.","Both conclusions I and II follow.","Only conclusion II follows.","Only conclusion I follows."], e: "I: candies ⊆ gems ⊆ cakes → all candies are cakes ✓. II: 'some cakes are sweets' doesn't pin to gems. Only I. Option 4." },
  { s: REA, q: "'A # B' means 'A is the father of B'; 'A @ B' means 'A is the brother of B'; 'A & B' means 'A is the husband of B'; 'A % B' means 'A is the mother of B'.\n\nIf D # L @ M & N % P @ T, then how is L related to P?", o: ["Brother's son","Father's brother","Father's brother's wife","Wife's brother"], e: "D is L's father; L is M's brother; M & N married; N is P's mother → M is P's father. L is P's father's brother. Option 2." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n59 * 11 * 11 * 48 * 1 * 12", o: ["–, ÷, +, ×, =","–, +, ÷, ×, =","+, ÷, –, ×, =","×, –, +, ÷, ="], e: "Option 3: 59 + 11 ÷ 11 − 48 = 1 × 12 → 59 + 1 − 48 = 12 ✓. Option 3." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Base  2. Barrier  3. Basin  4. Basic  5. Batter  6. Battle", o: ["2, 1, 4, 3, 6, 5","2, 1, 3, 4, 6, 5","2, 4, 3, 6, 5, 1","2, 1, 4, 3, 5, 6"], e: "Dictionary: Barrier(2), Base(1), Basic(4), Basin(3), Batter(5), Battle(6) → 2,1,4,3,5,6. Option 4." },
  { s: REA, q: "'A + B' means 'A is the sister of B'; 'A − B' means 'A is the mother of B'; 'A × B' means 'A is the husband of B'; 'A ÷ B' means 'A is the father-in-law of B'.\n\nIf U ÷ V − W + X × Y, then which of the following statements is NOT correct?", o: ["W is the granddaughter of U.","Y is the sister of W.","V is the mother of X.","W is the sister-in-law of Y."], e: "U is V's father-in-law; V is W's mother; W is X's sister; X is Y's husband. Y is X's wife — sister-in-law of W, not sister. Option 2 is NOT correct. Option 2." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nWarrior : Battlefield :: Gambler : ?", o: ["Field","Casino","Factory","Garage"], e: "A warrior fights on a Battlefield; a gambler gambles at a Casino. Option 2." },
  { s: REA, q: "In a certain code language, 'CARRY' is written as 'DBSSZ' and 'DELAY' is written as 'EFMBZ'. How will 'FAITH' be written in that language?", o: ["GCKVJ","HBKUJ","GBJUI","KCJVI"], e: "Each letter shifted +1. CARRY→DBSSZ ✓; DELAY→EFMBZ ✓. FAITH +1 = GBJUI. Option 3." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in a logical and meaningful order.\n\n1. Fortnight  2. Year  3. Month  4. Decade  5. Week", o: ["2, 4, 5, 3, 1","4, 2, 3, 1, 5","2, 4, 3, 5, 1","4, 2, 3, 5, 1"], e: "Descending order: Decade(4) > Year(2) > Month(3) > Fortnight(1) > Week(5) → 4,2,3,1,5. Option 2." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second is related to the first and the fourth is related to the third.\n\nCORRECT : ROCRTCE :: WRONGLY : ORWNYLG :: NEUTRAL : ?", o: ["RALTNEW","UENTLAR","LARTUEN","ENUTRLA"], e: "Rearrange positions to 3,2,1,4,7,6,5. NEUTRAL → U,E,N,T,L,A,R = UENTLAR. Option 2." },
  { s: REA, q: "Select the option that is related to the fourth term in the same way as the first is related to the second and the fifth is related to the sixth.\n\n7 : 58 :: ? : 370 :: 12 : 153", o: ["18","21","20","19"], e: "Pattern n² + 9. 7²+9 = 58 ✓. 12²+9 = 153 ✓. 19²+9 = 361+9 = 370 → ? = 19. Option 4." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nAll bottles are buildings. Some buildings are short. Some short are girls.\n\nConclusions:\nI. Some buildings are bottles.\nII. All buildings are short.\nIII. Some girls are short.", o: ["Only conclusions II and III follow","Only conclusions I and III follow","All the conclusions follow","Only conclusions I and II follow"], e: "I: all bottles are buildings → some buildings are bottles ✓. III: 'some short are girls' converts to 'some girls are short' ✓. II is too strong. Option 2." },
  { s: REA, q: "Select the option that is related to the fourth term in the same way as the first is related to the second and the fifth is related to the sixth.\n\n28 : 841 :: ? : 324 :: 2 : 9", o: ["22","7","19","17"], e: "Pattern: (n+1)². 28+1=29, 29²=841 ✓. 2+1=3, 3²=9 ✓. √324=18 → ?+1=18 → ?=17. Option 4." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) and complete the given series?\n\nBIRD, DMTG, ?, HUXM, JYZP", o: ["FRVJ","FQWJ","FQVJ","FRWJ"], e: "1st letter +2 each (B,D,F,H,J); 2nd letter +4 each (I,M,Q,U,Y); 3rd letter +2 each (R,T,V,X,Z); 4th letter +3 each (D,G,J,M,P). 3rd term = FQVJ. Option 3." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nBW, DV, ET, GS, HQ, JP, ?", o: ["JN","MN","LN","KN"], e: "1st letter +2,+1,+2,+1,+2,+1 → next K (J+1=K). 2nd letter −1,−2,−1,−2,−1,−2 → next N (P−2=N). KN. Option 4." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\n_BC_C_A_CDC_AB_D_B", o: ["ADBBBCC","ADBBBCA","DBDBBCC","AABBCCD"], e: "Per response sheet, option 1 (ADBBBCC)." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second is related to the first and the fourth is related to the third.\n\nHISTORY : HIOTSRY :: FEATURE : FEUTARE :: JOURNAL : ?", o: ["JORUNAL","JORNUAL","JONRUAL","JOUNRAL"], e: "Swap positions 3 and 5. HISTORY: S↔O → HIOTSRY ✓. FEATURE: A↔U → FEUTARE ✓. JOURNAL: U↔N → JONRUAL. Option 3." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n(Figure-based equation)", o: ["÷, +, =, −, ×, +, ÷","×, +, −, +, ×, =, ÷","+, −, +, ÷, =, ×, +","×, +, =, +, ×, −, ÷"], e: "Per response sheet, option 3." },
  { s: REA, q: "'A # B' means 'A is the brother of B'; 'A @ B' means 'A is the daughter of B'; 'A & B' means 'A is the husband of B'; 'A % B' means 'A is the wife of B'.\n\nIf D @ N @ H & Y @ F % V, then how is Y related to D?", o: ["Father's sister","Mother","Husband's mother","Mother's mother"], e: "D is N's daughter; N is H's daughter; H is Y's husband (so Y is H's wife = N's mother). D is N's daughter → Y is D's grandmother = mother's mother. Option 4." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nPen : Write :: Shovel : ?", o: ["Scoop","Feed","Amplify","View"], e: "A pen is used to write; a shovel is used to scoop. Option 1." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nAll dogs are cats. No bat is a cat. Some rats are bats.\n\nConclusions:\nI. Some cats are rats.\nII. Some dogs are bats.\nIII. No dog is a bat.", o: ["Both conclusions I and II follow.","Both conclusions I and III follow.","Only conclusion I follows.","Only conclusion III follows."], e: "Dogs ⊆ cats. No bat is cat → no dog is bat (III ✓). II is false. I uncertain. Option 4." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\n_ T _ OE _ U _ E _ _ O _ _ UO", o: ["E U T O T U E U","E U T U T U E T","E U E O T U E T","E U T O T U E T"], e: "Per response sheet, option 4 (E U T O T U E T)." },

  // ============ GA (26-50) ============
  { s: GA, q: "Which of the following statements is INCORRECT about the characteristic features of the Indian Desert?", o: ["It is also known as Marusthali.","It lies northwest of the Aravalli hills.","It receives 250 mm rainfall per year.","It has sand dunes."], e: "The Indian Thar Desert receives less than 150 mm rainfall annually (not 250 mm). Option 3." },
  { s: GA, q: "In December 2021, who became the 3rd fastest Indian fast bowler to pick up 200 Test wickets?", o: ["Ishant Sharma","Jasprit Bumrah","Bhuvneshwar Kumar","Mohammed Shami"], e: "Mohammed Shami became the third-fastest Indian fast bowler to claim 200 Test wickets in December 2021. Option 4." },
  { s: GA, q: "In which of the following states is the Tamu Lachar festival celebrated as the New Year by the Gurung Community?", o: ["Goa","Assam","Sikkim","Madhya Pradesh"], e: "Tamu Lachar (also Tamu Loshar) is celebrated as the New Year by the Gurung community in Sikkim. Option 3." },
  { s: GA, q: "In 1948, Ernest Mackay mentioned that in the Harappan city of Lothal, the drains for the drainage system were made of ________ bricks.", o: ["red","burnt","mud","sandstone"], e: "Mackay noted that Lothal's drains were made of burnt bricks. Option 2." },
  { s: GA, q: "In hockey, if the umpire indicates the direction with one arm raised horizontally, it means ________.", o: ["Goal scored","Bully","Timing","Free hit"], e: "In field hockey, one arm raised horizontally indicates a Free Hit. Option 4." },
  { s: GA, q: "Who among the following social reformers of British India is known as Lokhitwadi?", o: ["Balshastri Jambhekar","Daboda Pandurang","Gopal Ganesh Agarkar","Gopal Hari Deshmukh"], e: "Gopal Hari Deshmukh wrote under the pseudonym 'Lokhitwadi' (well-wisher of the people). Option 4." },
  { s: GA, q: "The ________ is an embryonic midline structure common to all members of the phylum Chordata that serves as a source of midline signals to surrounding tissues and as a major skeletal element of the developing embryo.", o: ["notochord","nerve cord","tail fin","anus"], e: "Notochord is the defining embryonic midline rod of all chordates. Option 1." },
  { s: GA, q: "Which of the following is NOT an example of a minor industrial region of India?", o: ["Ambala-Amritsar region","Durg-Raipur region","Hugli region","Northern Malabar region"], e: "Hugli is one of India's MAJOR industrial regions (not minor). Option 3." },
  { s: GA, q: "Who among the following was conferred with the Major Dhyan Chand Khel Ratna Award 2021?", o: ["Pramod Bhagat","Sharad Kumar","Harvinder Singh","Amit Rohidas"], e: "Pramod Bhagat (Para-badminton) was among the 12 awardees of the Major Dhyan Chand Khel Ratna Award 2021. Option 1." },
  { s: GA, q: "Hideki Yukawa, who received the Nobel Prize in 1949, is well known for which discovery?", o: ["Thermal ionization","Cascade process of cosmic radiation","Theory of nuclear forces","Measurement of electronic charge"], e: "Hideki Yukawa received the 1949 Nobel Prize in Physics for predicting mesons via his theory of nuclear forces. Option 3." },
  { s: GA, q: "Which Indian state launched the CLAP Mission on 2nd October 2021?", o: ["Arunachal Pradesh","Uttar Pradesh","Andhra Pradesh","Himachal Pradesh"], e: "Andhra Pradesh launched CLAP (Clean Andhra Pradesh) on 2 October 2021. Option 3." },
  { s: GA, q: "Who among the following won the 'World Choreography Award 2020'?", o: ["Geeta Kapoor","Prabhu Deva","Suresh Mukund","Farah Khan"], e: "Suresh Mukund won the World Choreography Award 2020 for the team 'Kings United'. Option 3." },
  { s: GA, q: "Who among the following has been credited with taking the shehnai from the marriage mandap to the concert hall?", o: ["Ali Ahmed Hussain Khan","Ustad Bismillah Khan","Rajendra Prasanna","Anant Lal"], e: "Ustad Bismillah Khan elevated the shehnai from ceremonial weddings to mainstream concert music. Option 2." },
  { s: GA, q: "In which year did the Election Commission of India for the first time in its history become a multi-member body?", o: ["2004","2014","1995","1989"], e: "The ECI was first made multi-member in October 1989 (and made permanently multi-member in 1993). Option 4." },
  { s: GA, q: "Raichur doab, the land between Krishna and Tungabhadra was a reason of conflict between the kings of Vijayanagar and ________.", o: ["Malwa","Golconda","Bahamani","Bengal"], e: "The Raichur Doab was the long-disputed territory between Vijayanagar and the Bahamani Sultanate. Option 3." },
  { s: GA, q: "Who among the following announced the 'Sushma Swaraj Award' for women in the state budget in 2022?", o: ["Ashok Gehlot","Yogi Adityanath","Manohar Lal Khattar","Amarinder Singh"], e: "CM Ashok Gehlot announced the Sushma Swaraj Award in the Rajasthan budget 2022. Option 1." },
  { s: GA, q: "Pottery was first traceable to which period of ancient Indian history?", o: ["Chalcolithic","Palaeolithic","Neolithic","Mesolithic"], e: "The earliest pottery in India dates back to the Neolithic period. Option 3." },
  { s: GA, q: "As per the 2011 Census, what percentage of the total population in India lives in rural areas?", o: ["68.8%","58.8%","66.8%","67.8%"], e: "Per Census 2011, 68.84% (~68.8%) of India's population lives in rural areas. Option 1." },
  { s: GA, q: "Which is a multicellular filamentous green alga consisting of thin unbranched chains of cylindrical cells and found in floating masses near the surface of streams and ponds?", o: ["Ectocarpus","Laminaria","Spirogyra","Chlorella"], e: "Spirogyra is a filamentous green alga forming floating mats in freshwater. Option 3." },
  { s: GA, q: "Surupa Sen is a famous ________ dancer.", o: ["Kathak","Kathakali","Odissi","Bharatanatyam"], e: "Surupa Sen is a renowned Odissi dancer and artistic director of Nrityagram. Option 3." },
  { s: GA, q: "'How I Became a Hindu' is an autobiography of ________.", o: ["Paramahansa Yogananda","Kiran Bedi","Kamala Surayya","Sita Ram Goel"], e: "'How I Became a Hindu' (1982) is the autobiography of Sita Ram Goel. Option 4." },
  { s: GA, q: "'Dzongkha' is the official language of which country?", o: ["Myanmar","Maldives","Bangladesh","Bhutan"], e: "Dzongkha is the national/official language of Bhutan. Option 4." },
  { s: GA, q: "Some of Swami Dayanand's followers started a network of schools and colleges called D.A.V. What does 'A' stand for in D.A.V.?", o: ["Author","Angel","Anglo","Accept"], e: "D.A.V. = Dayanand Anglo Vedic. Option 3." },
  { s: GA, q: "Which form of government is established by the Constitution of India both at the centre and states?", o: ["Parliamentary","Socialist","Confederal","Presidential"], e: "The Constitution of India establishes a Parliamentary form of government at both Union and State levels. Option 1." },
  { s: GA, q: "What type of climate occurs along the west coast of continents in subtropical latitudes between 30°-40°, covering Central California, Central Chile, South East/South Western Australia?", o: ["Subtropical steppe climate","Humid subtropical climate","Mediterranean climate","Marine west coast climate"], e: "Mediterranean climate occurs in subtropical west coasts (CA, Chile, S. Australia). Option 3." },

  // ============ QA (51-75) ============
  { s: QA, q: "The third proportional to 12 and 36 is:", o: ["96","36","12","108"], e: "Third proportional x: 12 : 36 = 36 : x → x = 36² / 12 = 1296/12 = 108. Option 4." },
  { s: QA, q: "A man sells a bicycle for ₹990 at a loss of 10%. At what price (in ₹) should he sell the bicycle to earn a profit of 24%?", o: ["1,640","1,664","1,364","1,380"], e: "CP = 990/0.9 = ₹1100. SP at 24% = 1100 × 1.24 = ₹1,364. Option 3." },
  { s: QA, q: "What annual payment (in ₹) will discharge a debt of ₹1,500 in 10 years at 5% per annum simple interest? (Correct to two decimal places)", o: ["111.44","122.44","123.44","125.44"], e: "x = 100P / [100n + r×n(n−1)/2] = 100×1500 / (1000 + 225) = 150000/1225 ≈ 122.45. Option 2." },
  { s: QA, q: "If by selling 12 textbooks, a seller earns profit equal to the selling price of 4 textbooks, what is his percentage profit?", o: ["Option (image)","Option (image)","Option (image)","Option (image)"], e: "12s − 12c = 4s → 8s = 12c → s = 1.5c. Profit% = 50%. Per response sheet, option 2." },
  { s: QA, q: "Total savings of X and Y is 40% of their total income. Their average expenditure is ₹21,000. What is the total salary of X and Y?", o: ["Option (image)","Option (image)","Option (image)","Option (image)"], e: "Total expenditure = 60% = 2 × 21000 = 42000. Total income = 42000/0.6 = ₹70,000. Per response sheet, option 4." },
  { s: QA, q: "Answer based on the figure shown.", o: ["₹451.92","₹492.92","₹803.84","₹401.92"], e: "Per response sheet, option 3 (₹803.84)." },
  { s: QA, q: "The monthly income of Anvita was ₹28,500 and her monthly expenditure was ₹22,500. Next year her income increased by 16% and her expenditure increased by 10%. Find the percentage increase in her savings.", o: ["35.5%","35.8%","38.5%","21.05%"], e: "Original saving = 6000. New income = 33060; new exp = 24750; new saving = 8310. Increase% = 2310/6000 × 100 = 38.5%. Option 3." },
  { s: QA, q: "A shopkeeper sold an article at 25% profit. On selling it for ₹225 more he would get a profit of 40%. The cost price of the article was:", o: ["Option (image)","Option (image)","Option (image)","Option (image)"], e: "CP × 0.15 = 225 → CP = ₹1,500. Per response sheet, option 3." },
  { s: QA, q: "Find the average of first 38 natural numbers.", o: ["16.5","19.5","20.5","19"], e: "Avg of 1 to n = (n+1)/2 = 39/2 = 19.5. Option 2." },
  { s: QA, q: "The average of four numbers was 44. With the inclusion of a fifth number, y, the new average dropped to 42. What is the value of y?", o: ["36","34","32","40"], e: "Sum of 4 = 176. Sum of 5 = 210. y = 210 − 176 = 34. Option 2." },
  { s: QA, q: "A solid iron sphere of radius 21 cm is melted down into a cone of height 84 cm. What will be the radius of the cone?", o: ["24 cm","28 cm","32 cm","21 cm"], e: "Volume conservation: (4/3)π(21)³ = (1/3)πr²(84). 4×9261 = 84r² → r²=441 → r=21 cm. Option 4." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "It takes 4 hours to go from Delhi to Chandigarh at an average speed of 60 km/h. How long it will take a person to go from Delhi to Chandigarh at an average speed of 50 km/h?", o: ["4 hours 40 minutes","4 hours 30 minutes","4 hours 48 minutes","5 hours"], e: "Distance = 240 km. Time = 240/50 = 4.8 h = 4 h 48 min. Option 3." },
  { s: QA, q: "If a : b : c = 4 : 7 : 9 and b : c : d = 28 : 36 : 21, then a : b : c : d is:", o: ["12 : 21 : 27 : 17","16 : 28 : 36 : 21","8 : 14 : 18 : 21","4 : 7 : 9 : 11"], e: "Scale first ratio ×4: 16 : 28 : 36. Then d = 21. → 16:28:36:21. Option 2." },
  { s: QA, q: "What is the net discount for two successive discounts of 15% and 35%?", o: ["50%","44.75%","44.57%","25%"], e: "Net = 1 − 0.85 × 0.65 = 1 − 0.5525 = 0.4475 = 44.75%. Option 2." },
  { s: QA, q: "Medha covers 81 km at a speed of 27 km/h by bike, 12 km at a speed of 6 km/h by bicycle, and another 270 km at a speed of 45 km/h by car. Find her average speed for the whole journey.", o: ["33 km/h","36 km/h","34 km/h","35 km/h"], e: "Total dist = 363 km. Total time = 3+2+6 = 11 h. Avg = 33 km/h. Option 1." },
  { s: QA, q: "The number 974581297426 is divisible by:", o: ["6","11","4","9"], e: "Alternating digit sum: (9+4+8+2+7+2) − (7+5+1+9+4+6) = 32 − 32 = 0 → divisible by 11. Option 2." },
  { s: QA, q: "Answer based on the figure shown.", o: ["₹54,575","₹54,675","₹54,475","₹54,875"], e: "Per response sheet, option 2 (₹54,675)." },
  { s: QA, q: "15 men can complete a work in 15 days, whereas it takes 18 women to complete the work in 15 days. In how many days will 20 men and 9 women, together, complete the work?", o: ["8","15","12","5"], e: "Daily rates: 1 man = 1/225, 1 woman = 1/270. 20m+9w = 24/270 + 9/270 = 33/270 = 11/90 per day. Days = 90/11 ≈ 8.18 → 8 days. Option 1." },
  { s: QA, q: "Rajesh marks his goods 30% above the cost price but allows a 12% discount for cash payment. If he sells the goods for ₹3,500, find his cost price (up to one place of decimal).", o: ["₹3,090.5","₹3,095.9","₹3,054.9","₹3,059.4"], e: "SP = CP × 1.3 × 0.88 = CP × 1.144. CP = 3500/1.144 ≈ ₹3,059.4. Option 4." },
  { s: QA, q: "A person covers 11 km at 3 km/h, 21 km at 5 km/h and 37 km at 10 km/h. Find the average speed for the entire journey.", o: ["Option (image)","Option (image)","Option (image)","Option (image)"], e: "Total dist = 69 km. Total time = 11/3 + 21/5 + 37/10 = 347/30. Avg = 69 × 30/347 ≈ 5.96 km/h. Per response sheet, option 1." },
  { s: QA, q: "Ravi borrowed ₹1,380 from a bank which he repaid in 6 years at the rate of 6% per annum simple interest. If payment was made in six equal instalments, then each instalment was:", o: ["₹220","₹200","₹180","₹190"], e: "x = 100P / [100n + r×n(n−1)/2] = 100×1380 / (600 + 90) = 138000/690 = ₹200. Option 2." },
  { s: QA, q: "Which of the following numbers is divisible by 120?", o: ["170280","140240","156200","170360"], e: "120 = 8×15. 170280: digit sum 24 (÷3 ✓), last 3 = 280 (÷8 ✓), ends in 0 (÷5 ✓) → ÷120 ✓. 170280/120 = 1419. Option 1." },
  { s: QA, q: "If in an examination, the marks obtained by Rohan is 36% less than that of Pawan, then marks obtained by Pawan is how much percentage more than the marks obtained by Rohan?", o: ["26.47%","63.25%","56.25%","52.47%"], e: "Rohan = 0.64 × Pawan → Pawan/Rohan = 1/0.64 = 1.5625. So Pawan is 56.25% more. Option 3." },
  { s: QA, q: "13 men can complete a work in 7 days. After 3 days, 4 more men joined them. How many days will they now take to complete the remaining work?", o: ["Option (image)","Option (image)","Option (image)","Option (image)"], e: "Work done in 3 days = 39/91. Remaining = 52/91. 17 men daily rate = 17/91. Days = (52/91) / (17/91) = 52/17 ≈ 3.06 days. Per response sheet, option 4." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nA fire ________ out in the basement of the house.", o: ["broke","breaking","burned","burnt"], e: "'Fire broke out' is the standard idiomatic past simple expression. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe gardening is done by Anil.", o: ["Anil had been done the gardening","Anil does the gardening","Anil is be done the gardening","Anil been done the gardening"], e: "Present simple passive → present simple active: 'is done by' → 'does'. Option 2." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe weather report shows the ________ of rainfall.", o: ["tranquillity","mobility","validity","probability"], e: "'Probability of rainfall' — forecasting term. Option 4." },
  { s: ENG, q: "Select the correct direct narration of the given sentence.\n\nThey said that they would go the next day.", o: ["They said, \"We will go tomorrow.\"","They said, \"I will have went tomorrow.\"","They said, \"I would go tomorrow.\"","They said, \"We will be go tomorrow.\""], e: "Indirect → direct: they → we; would → will; next day → tomorrow. Option 1." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution'.\n\nFor a little while Binod was the media's blue-eyed boy.", o: ["No substitution","blue-shirt boy","green-eyed boy","big-name boy"], e: "'Blue-eyed boy' is a correct idiom meaning 'favourite'. No substitution needed. Option 1." },
  { s: ENG, q: "Choose the most appropriate ANTONYM of the underlined word.\n\nThe melancholy song brought tears to my eyes.", o: ["Seclusion","Ecstasy","Tremendousness","Aesthetic"], e: "'Melancholy' = sad. Antonym = Ecstasy (great joy). Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe supervisor in the examination hall.", o: ["Teacher","Monitor","Principal","Invigilator"], e: "An 'Invigilator' supervises exam-takers. Option 4." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Corporeale","Diminutives","Credulous","Sagacious"], e: "'Corporeale' is misspelled — correct is 'Corporeal'. Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nTo go down in flames", o: ["To burn completely","To take risks whole heartedly","To fail miserably at something","To mend permanently"], e: "'Go down in flames' = fail spectacularly/miserably. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nHumane", o: ["cordial","merciless","forgiving","generous"], e: "'Humane' = compassionate. Antonym = Merciless. Option 2." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nRuffle someone's feathers", o: ["Be relaxed and in control","Do something very easily","Make more of an effort","Make someone annoyed"], e: "'Ruffle someone's feathers' = annoy/irritate them. Option 4." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom.\n\nThose were only crocodile tears.", o: ["Mild regret","Very gloomy","Pretended sadness","A weeping sign"], e: "'Crocodile tears' = insincere or pretended grief. Option 3." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Impious","Renonce","Admirable","Cautious"], e: "'Renonce' is misspelled — correct is 'Renounce'. Option 2." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Longevity","Leftinant","Ludicrous","Location"], e: "'Leftinant' is misspelled — correct is 'Lieutenant'. Option 2." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nRome grew from a small town on the Tiber River in central Italy into a ________ empire that ultimately embraced England.", o: ["vast","voluminous","bountiful","lofty"], e: "'Vast empire' — natural scale collocation. Option 1." },
  { s: ENG, q: "Read the passage on Shark Tank.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'people who have a (1)________ and a stake in India's future'", o: ["vision","priority","perception","consistency"], e: "'Vision and a stake' — entrepreneurs have vision + investment stake. Option 1." },
  { s: ENG, q: "Read the passage on Shark Tank.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'in a very short period since its (2)________'", o: ["birth","debut","departure","formation"], e: "Per response sheet, option 4 (formation)." },
  { s: ENG, q: "Read the passage on Shark Tank.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'stories from across India (3)________ centre stage'", o: ["gratifying","measuring","taking","reinventing"], e: "'Taking centre stage' — standard idiom for being the focus. Option 3." },
  { s: ENG, q: "Read the passage on Shark Tank.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'carve out their individuality via entrepreneurial (4)________'", o: ["integrity","enthusiasm","collaboration","limitation"], e: "'Entrepreneurial enthusiasm' fits motivational tone. Option 2." },
  { s: ENG, q: "Read the passage on Shark Tank.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'The Sharks have made incredible (5)________ with new ventures'", o: ["agreements","promises","accounts","association"], e: "Per response sheet, option 1 (agreements)." },
  { s: ENG, q: "Read the passage on power foods.\n\nWho says that adding a squeeze of lemon to green tea increases the body's ability to absorb catechins?", o: ["Western Cape University researchers","Purdue University researchers","Harvard University researchers","Kentucky University researchers"], e: "Passage explicitly cites Purdue University researchers. Option 2." },
  { s: ENG, q: "Read the passage on power foods.\n\nIdentify the central theme of the passage.", o: ["Food and lifestyle","Impact of consuming green tea","Maintenance of unhealthy food habits","Usefulness of bananas and yoghurt"], e: "Passage discusses various 'power foods' for muscle growth, fitness, lifestyle. Option 1." },
  { s: ENG, q: "Read the passage on power foods.\n\nIdentify a suitable title for the passage.", o: ["Food Choices","Foods for Enjoyment","Easy to Prepare Snacks","Foods for Fitness"], e: "Passage emphasises foods for boosting muscle growth/fitness. Option 4." },
  { s: ENG, q: "Read the passage on power foods.\n\nIdentify the tone of the passage.", o: ["Deductive","Informative","Imperative","Assertive"], e: "Passage provides factual information about power foods — informative tone. Option 2." },
  { s: ENG, q: "Read the passage on power foods.\n\nSelect the most appropriate ANTONYM of the given word.\n\nAbsorb", o: ["Ingest","Dissipate","Blot","Emit"], e: "'Absorb' (take in) — antonym 'Emit' (give off). Option 4." }
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

  const TEST_TITLE = 'SSC Selection Post Phase XI (Matriculation) - 28 June 2023 Shift-4';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2023, pyqShift: 'Shift-4',
    pyqExamName: 'SSC Selection Post Phase XI (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
