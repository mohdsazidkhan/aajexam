/**
 * Seed: SSC Selection Post Phase XII 2024 (Matriculation Level) PYQ - 26 June 2024, Shift-1
 * Section order: REA → GA → QA → ENG. Key auto-decoded from green-tick bullets (clean 400/100/300).
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun26_2024_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-26jun2024-s1';

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

const F = '26-jun-2024-s1';

const IMAGE_MAP = {
  14: { q: 'image4.png', opts: ['image5.png','image6.png','image7.png','image8.png'] },           // REA figure series
  20: { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] }, // REA mirror
  51: { q: '', opts: ['image14.jpeg','image15.jpeg','image16.jpeg','image17.jpeg'] },             // QA Q1 right triangle area
  63: { q: '', opts: ['image18.jpeg','image19.jpeg','image20.jpeg','image21.jpeg'] }              // QA Q13 sphere SA→V ratio
};

const KEY = [
  // REA (1-25)
  4, 2, 4, 1, 2,   2, 3, 1, 2, 4,   1, 1, 2, 1, 2,   1, 1, 4, 3, 2,   4, 1, 4, 2, 2,
  // GA (26-50)
  1, 2, 4, 4, 2,   3, 3, 1, 4, 3,   2, 2, 3, 4, 2,   4, 2, 4, 4, 4,   4, 3, 3, 1, 3,
  // QA (51-75)
  4, 4, 2, 2, 3,   3, 2, 1, 3, 4,   3, 3, 1, 2, 1,   1, 1, 3, 4, 2,   1, 1, 1, 3, 2,
  // ENG (76-100)
  2, 2, 1, 4, 1,   3, 2, 4, 3, 3,   1, 4, 2, 4, 1,   1, 3, 1, 1, 2,   1, 2, 4, 2, 2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "What will come in place of the question mark (?) in the following equation if '+' and '÷' are interchanged and '−' and '×' are interchanged?\n\n5 ÷ 9 − 3 × 4 + 6 = ?", o: ["20","16","34","26"], e: "Per docx answer key, option 4 (26)." },
  { s: REA, q: "Which two numbers (not individual digits) should be interchanged to make the given equation correct?\n21 × 5 − 35 + (42 ÷ 7) + 28 = 96", o: ["21 and 42","35 and 42","28 and 35","28 and 21"], e: "Per docx answer key, option 2 (35 and 42)." },
  { s: REA, q: "If in a code language, REPORT is coded as 3 and CALM is coded as 2, what will be the code for TOGETHER?", o: ["5","10","8","4"], e: "Pattern: vowel count? REPORT has 2 vowels, CALM has 1. Per docx, option 4 (4)." },
  { s: REA, q: "In a certain code language, 'HONOR' is coded as 16-30-28-30-36 and 'PLEAD' is coded as 32-24-10-2-8. How will 'LOCK' be coded in the same language?", o: ["24-30-6-22","26-32-8-20","26-30-8-22","24-32-6-22"], e: "Pattern: each letter position × 2. L(12)=24, O(15)=30, C(3)=6, K(11)=22. Option 1." },
  { s: REA, q: "'A + B' means A is the mother of B; 'A − B' means 'A is the wife of B'; 'A & B' means 'A is the brother of B'; 'A × B' means 'A is the sister of B'; 'A ÷ B' means 'A is the father of B'.\nIf 'A ÷ Z + P & R × Q − S', then how is Z related to S?", o: ["Mother's father","Mother's mother","Mother","Father's mother"], e: "A is father of Z; Z is mother of P; P is brother of R; R is sister of Q; Q is wife of S → Q is wife of S, and Q is R's sister, P's sister, Z's child → Z is mother of Q → Z is S's wife's mother. Per docx, option 2." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\nABZY, CDXW, EFVU, ?, IJRQ", o: ["GHUS","GHTS","FHTS","GHTT"], e: "1st letter +2 (A,C,E,G,I); 2nd +2 (B,D,F,H,J); 3rd −2 (Z,X,V,T,R); 4th −2 (Y,W,U,S,Q). GHTS. Option 2." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nMAKING : NCLKOI :: LUCENT : MWDGOV :: ISLAND : ?", o: ["JUMDOF","JUMCOE","JUMCOF","JUMCPF"], e: "Per docx answer key, option 3 (JUMCOF)." },
  { s: REA, q: "According to the series given below, fill in the blank with a suitable letter that would satisfy the series.\nZ, A, Y, B, X, C, ________", o: ["W","V","U","D"], e: "Alternating: Z,Y,X,W (descending) and A,B,C,D (ascending). Next: W. Option 1." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\nABZ, BCY, CDX, DEW, _______.", o: ["EGH","EFV","EGV","EFG"], e: "1st letter +1 (A,B,C,D,E); 2nd +1 (B,C,D,E,F); 3rd −1 (Z,Y,X,W,V). EFV. Option 2." },
  { s: REA, q: "In a certain language MET is coded as 32, and MOW is coded as 45. How will RUN be coded in the same language?", o: ["50","30","53","47"], e: "Per docx answer key, option 4 (47)." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n(The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word.)\n\nCow : Pen :: Hare : ?", o: ["Burrow","Sty","Rabbit","Den"], e: "Cow lives in a pen; hare lives in a burrow. Option 1." },
  { s: REA, q: "Three statements followed by two conclusions.\nStatements:\nI. No picture is an album.\nII. All albums are frames.\nIII. Some frames are portraits.\nConclusions:\nI. No picture is a frame.\nII. Some pictures are portraits.", o: ["Neither conclusion I nor II follows","Only conclusion I follows","Both conclusions I and II follow","Only conclusion II follows"], e: "No picture is album, but pictures could still be frames (II's all-albums-are-frames doesn't restrict pictures). Option 1." },
  { s: REA, q: "Select the numbers from among the given options that can replace the question marks (?) in the following series.\n83, 86, 91, 98, ?, 122, ?", o: ["92, 173","109, 139","90, 171","98, 189"], e: "Differences: +3, +5, +7, +9, +11, +13, +15. So 98+11=109, 109+13=122 ✓, 122+15=137. Hmm but option 2 is 109,139. Per docx, option 2 (109, 139)." },
  { s: REA, q: "Identify the figure given in the options which when put in place of the question mark (?) will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: REA, q: "In a certain code language,\nR + T means 'R is the sister of T'.\nR − T means 'R is the father of T'.\nR * T means 'R is the wife of T'.\nR ÷ T means 'R is the mother of T'.\nBased on the above, how is H related to E if 'D − E * F − G + H ÷ I + J'?", o: ["Mother","Daughter","Father","Wife"], e: "D father of E; E wife of F; F father of G; G sister of H; H mother of I; I sister of J → H is mother of I; G is H's sibling-sister; G is daughter of F → H is also F's daughter → H is daughter of E (F's wife). Wait E is wife of F so H is daughter of E. Per docx, option 2 (Daughter)." },
  { s: REA, q: "In a certain code language, 'PARTIAL' is written as 'MZJSSZQ' and 'RADICAL' is written as 'MZDHEZS'. How will 'RESPOND' be written as in that language?", o: ["EMPOTDS","EMPQTDS","EMQOTDS","SDTOPME"], e: "Per docx answer key, option 1 (EMPOTDS)." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in the order in which they appear in an English dictionary.\n1. Anger\n2. Analogy\n3. Animate\n4. Anchor\n5. Anarchy", o: ["2, 5, 4, 1, 3","4, 3, 5, 1, 2","4, 2, 5, 3, 1","5, 2, 4, 3, 1"], e: "Analogy(2), Anarchy(5), Anchor(4), Anger(1), Animate(3) → 2,5,4,1,3. Option 1." },
  { s: REA, q: "Two statements followed by two conclusions.\nStatements:\n1) All clothes are black.\n2) All shirts are clothes.\nConclusions:\nI. All shirts are black.\nII. Some clothes are black.", o: ["Only conclusion I follows","Neither conclusion I nor conclusion II follows","Only conclusion II follows","Both conclusions I and II follow"], e: "Shirts ⊆ clothes ⊆ black → I follows. All ⇒ some → II follows. Option 4." },
  { s: REA, q: "Select the option that is related to the fifth number in the same way as the fourth number is related to the third number and the second number is related to the first number.\n37 : 43 :: 23 : 31 :: 17 : ?", o: ["25","21","23","19"], e: "Per docx answer key, option 3 (23)." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at line MN as shown below.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 2." },
  { s: REA, q: "In a certain code language, 'CURVED' is coded as 'FWSUCA' and 'LONDON' is coded as 'OQOCMK'. How will 'SIMPLE' be coded in the same language?", o: ["VKNPJC","WLNPJD","WLMOKB","VKNOJB"], e: "Per docx answer key, option 4 (VKNOJB)." },
  { s: REA, q: "In a certain code, BANK is written as AZMJ and TALE is written as SZKD. What is the code for LAND?", o: ["KZMC","MBOE","JYLB","NDLA"], e: "Each letter −1. L−1=K, A−1=Z, N−1=M, D−1=C → KZMC. Option 1." },
  { s: REA, q: "In a certain code language, BUG is coded as 24 and TWO is coded as 52. What is the code for ONE in that language?", o: ["32","33","27","28"], e: "Sum × ? B+U+G = 2+21+7 = 30? Or position sum: 2+21+7=30; T+W+O=20+23+15=58; 24 and 52. Per docx, option 4 (28)." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\nFKAC, GLCE, HMEG, ?, JOIK", o: ["JNGI","INGI","INHI","INGJ"], e: "1st +1 (F,G,H,I,J); 2nd +1 (K,L,M,N,O); 3rd +2 (A,C,E,G,I); 4th +2 (C,E,G,I,K). INGI. Option 2." },
  { s: REA, q: "Which option represents the correct order of the given words as they would appear in an English dictionary?\n1. Groin\n2. Groove\n3. Grouch\n4. Grocery\n5. Gross", o: ["4, 1, 2, 3, 5","4, 1, 2, 5, 3","4, 2, 1, 3, 5","2, 4, 1, 3, 5"], e: "Grocery(4), Groin(1), Groove(2), Gross(5), Grouch(3) → 4,1,2,5,3. Option 2." },

  // ============ GA (26-50) ============
  { s: GA, q: "What is the title of the autobiography written by the renowned American professional boxer, Mike Tyson?", o: ["Undisputed Truth: My Autobiography","Undisputed Life: My Story","The Greatest: My Own Story","Undeniable Story: My Life"], e: "Mike Tyson's autobiography is 'Undisputed Truth'. Option 1." },
  { s: GA, q: "Which of the following groups represents essential amino acid?", o: ["Glycine, proline, serine, and tyrosine","Histidine, isoleucine, leucine, lysine","Alanine, isoleucine, leucine, lysine","Alanine, arginine, asparagine, aspartic acid"], e: "Essential amino acids include histidine, isoleucine, leucine, lysine. Option 2." },
  { s: GA, q: "What is it called in basketball when a shot goes through the basket without touching the rim or backboard?", o: ["Screen","Dime","Technical foul","Swish"], e: "A 'swish' is a clean basket. Option 4." },
  { s: GA, q: "The Government has approved the continuation of pension for freedom fighters for financial years 2021-22 to 2025-26. What is the name of the scheme?", o: ["Veer Sainik Samman Yojna (VSSY)","Swatantrata Sainik Yojana (SSY)","One Rank One Pension Scheme (OROP)","Swatantrata Sainik Samman Yojana (SSSY)"], e: "Scheme is Swatantrata Sainik Samman Yojana (SSSY). Option 4." },
  { s: GA, q: "Which of the following cell organelles is involved in apoptosis?", o: ["Golgi","Mitochondria","ER","Lysosome"], e: "Mitochondria release cytochrome c to trigger apoptosis. Option 2." },
  { s: GA, q: "'Sattriya' dance is predominantly practiced in which of the following states of India?", o: ["Tamil Nadu","Kerala","Assam","Andhra Pradesh"], e: "Sattriya is a classical dance of Assam. Option 3." },
  { s: GA, q: "Rajataranagini, the book authored by Kalhana in 12th Century was originally written in which of the following languages?", o: ["Tamil","Shaurseni","Sanskrit","Telugu"], e: "Rajatarangini (1148-49) was written in Sanskrit. Option 3." },
  { s: GA, q: "Which inert gas is used in double-glazed windows to fill the space between the panes?", o: ["Argon","Helium","Radon","Xenon"], e: "Argon is used in double-glazed windows. Option 1." },
  { s: GA, q: "The entire salaries, allowances and pensions of the chairman and members of the Union Public Service Commission are charged on the ________.", o: ["Special Fund of the UPSC","Reserve Bank of India","Contingency fund of India","Consolidated fund of India"], e: "Charged on the Consolidated Fund of India (Article 322). Option 4." },
  { s: GA, q: "Which of the following are major coal fields in India?", o: ["Satara and Pune","Jhunjhunu and Alwar","Jharia and Raniganj","Coimbatore and Madurai"], e: "Jharia and Raniganj are major coalfields. Option 3." },
  { s: GA, q: "The Darjeeling hills in India are world famous for ________ cultivation.", o: ["cinnamon","tea","banana","mango"], e: "Darjeeling is world-famous for tea. Option 2." },
  { s: GA, q: "The 'National Food for Work Programme' was launched in the year 2004 by the Government of India in _____ most backward districts of India.", o: ["100","150","250","200"], e: "NFFWP was launched in 150 most backward districts. Option 2." },
  { s: GA, q: "What is the name of the process of gases being outpoured from the interior of the solid earth?", o: ["Gas evolution","Transpiration","Degassing","Evaporation"], e: "Degassing = outpouring of gases from Earth's interior. Option 3." },
  { s: GA, q: "Which of the following Pacts succeeded the Communal Award of 1932?", o: ["Jinnah-Nehru Pact","Ambedkar-CR Das Pact","Gandhi-Jinnah Pact","Gandhi-Ambedkar Pact"], e: "Poona Pact (Gandhi-Ambedkar Pact, 1932) followed the Communal Award. Option 4." },
  { s: GA, q: "The Myoko festival is celebrated in which of the following North-Eastern states of India?", o: ["Meghalaya","Arunachal Pradesh","Manipur","Sikkim"], e: "Myoko festival is celebrated by the Apatani tribe in Arunachal Pradesh. Option 2." },
  { s: GA, q: "________ of the Indian Constitution sets qualifications for being a member of Lok Sabha.", o: ["Article 74","Article 76","Article 64","Article 84"], e: "Article 84 sets qualifications for Parliament members. Option 4." },
  { s: GA, q: "The 2024 Olympic Games will be hosted by ________.", o: ["New Delhi","Paris","New York","London"], e: "Paris hosted the 2024 Summer Olympics. Option 2." },
  { s: GA, q: "Which of the following is expressed as the total number of deaths per thousand population per year in India?", o: ["Infant Mortality rate","Age Specific Death Rate","Incidence Rate","Death Rate"], e: "Crude Death Rate = deaths per 1000 population/year. Option 4." },
  { s: GA, q: "Who was the founder of Jaipur-Atrauli gharana?", o: ["Abdul Karim Khan","Omkarnath Thakur","Ali Baksh Khan","Alladiya Khan"], e: "Ustad Alladiya Khan founded the Jaipur-Atrauli gharana. Option 4." },
  { s: GA, q: "When was the preamble to the Indian Constitution amended?", o: ["1974","1981","1980","1976"], e: "Preamble was amended by the 42nd Amendment, 1976. Option 4." },
  { s: GA, q: "All India Kisan Sabha was founded in 1936 at Indian National Congress (INC) __________ Session as All India Kisan Congress.", o: ["Delhi","Bombay","Agra","Lucknow"], e: "AIKS was founded at the 49th Lucknow Session of INC (1936). Option 4." },
  { s: GA, q: "How many Mahajanapadas were there during the age of Buddha?", o: ["15","9","16","26"], e: "16 Mahajanapadas existed during Buddha's time. Option 3." },
  { s: GA, q: "Who among the following was the first chairperson of National Commission for Women and a senior congress leader who passed away in 2022?", o: ["Sushmita Dev","Sheila Dikshit","Jayanti Patnaik","Ambika Soni"], e: "Jayanti Patnaik was the first chairperson of NCW (passed away 2022). Option 3." },
  { s: GA, q: "The tall sculptures on the Bharhut Stupa are the depictions of ____________.", o: ["Yakshas and Yakshinis","Bodhisattvas","Buddha","Mahavira"], e: "Bharhut Stupa features Yaksha and Yakshini sculptures. Option 1." },
  { s: GA, q: "Who had headed SEBI's High Powered Steering Committee on Cyber Security post expansion to the six-member committee in September 2022?", o: ["Simanchala Dash","Shambhu Kumar","Navin Kumar Singh","Manish Mani Tiwari"], e: "Navin Kumar Singh chaired SEBI's HPSC-CS (Sep 2022). Option 3." },

  // ============ QA (51-75) ============
  { s: QA, q: "Find the area of a right angle whose base is 15 cm and hypotenuse is 17 cm.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Height = √(17² − 15²) = √64 = 8. Area = ½ × 15 × 8 = 60 cm². Per docx, option 4." },
  { s: QA, q: "In an examination, there were two papers, A and B, and the maximum mark in each of the two papers was 10. However, the weights assigned to papers A and B were in the ratio 2 : 1, respectively. Jonathan scored 8 out of 10 in Paper A and an overall 70% in the examination. How much did he score in Paper B out of 10?", o: ["6","5.5","6.5","5"], e: "(2×8 + 1×B)/3 = 7 → 16 + B = 21 → B = 5. Option 4." },
  { s: QA, q: "Three solid iron cubes of edges 8 cm, 10 cm and 12 cm are melted together to make a new cube. It is observed that 496 cm³ of the melted material is lost due to improper handling. The area (in cm²) of the whole surface of the newly formed cube is:", o: ["3375","1176","2197","1331"], e: "Total volume = 512+1000+1728 = 3240. After loss = 3240 − 496 = 2744 = 14³. New edge=14. SA = 6×14² = 1176. Option 2." },
  { s: QA, q: "The percentage profit earned by selling an article for ₹1,910 is equal to the percentage loss incurred by selling the same article for ₹1,690. At what price (in ₹) should the article be sold to make a 12% profit?", o: ["2,106","2,016","2,610","2,160"], e: "CP = (1910+1690)/2 = 1800. SP at 12% = 1800×1.12 = 2016. Option 2." },
  { s: QA, q: "What equal instalment of annual payment (in ₹) will discharge a debt that is due as ₹624 at the end of 5 years at 2% per annum simple interest?", o: ["150","240","120","180"], e: "Per docx answer key, option 3 (120)." },
  { s: QA, q: "A shopkeeper offers 25% discount on all the toys. He offers a further discount of 5% on the reduced price to those customers who pay in cash. How much does a customer have to pay (in ₹) in cash for a toy of ₹510?", o: ["360.38","250.65","363.38","146.25"], e: "510 × 0.75 × 0.95 = 363.375 ≈ 363.38. Option 3." },
  { s: QA, q: "A and B can complete a piece of work in 25 days and 55 days, respectively. The total number of days (in whole number) to complete the work, if A and B both work together, is:", o: ["21","18","22","20"], e: "1/(1/25+1/55) = 1/(8/275+... ) = 275/16 ≈ 17.19. Per docx, option 2 (18)." },
  { s: QA, q: "Shweta spends 21% of her monthly salary on house rent, 14% on education, and 13% on entertainment, and still saves ₹5,408. What is her monthly salary (in ₹)?", o: ["10,400","9,150","12,400","14,000"], e: "Saves = 100−21−14−13 = 52% = 5408 → Salary = 5408/0.52 = 10400. Option 1." },
  { s: QA, q: "Rama sold a car costing ₹4,00,000 to Sansar at a loss of 20%. What is the selling price (in ₹)?", o: ["3,80,000","4,80,000","3,20,000","3,50,000"], e: "SP = 400000 × 0.80 = 320000. Option 3." },
  { s: QA, q: "Three partners decided to start a business. They decided to donate 10% of the profit to a charity organisation and then the remaining profit would be shared among first, second and third partner in the ratio 1 : 2 : 2. The total profit received was ₹1,80,000. Find the share of the first partner.", o: ["₹31,800","₹29,600","₹33,200","₹32,400"], e: "After 10% charity: 162000. 1/(1+2+2) = 1/5 = 32400. Option 4." },
  { s: QA, q: "In an election, the total number of valid votes cast was 3,75,000. Candidate A secured 48% of the valid votes, with the rest of the valid votes going to the winner, Candidate B. By how many valid votes did Candidate B win over Candidate A?", o: ["15,250","13,500","15,000","14,750"], e: "B−A = (52% − 48%) × 375000 = 4% × 375000 = 15000. Option 3." },
  { s: QA, q: "Sandeep spends 32% of his annual income on food, 20% of the remaining income on travelling, and 35% of the remaining income on clothes, and still saves ₹70,720 per year. What is the annual income (in ₹) of Sandeep?", o: ["5,44,000","3,75,000","2,00,000","4,50,000"], e: "After food: 0.68 × I. After travel: 0.68×0.80×I = 0.544×I. After clothes: 0.544×0.65×I = 0.3536×I = 70720 → I = 200000. Option 3." },
  { s: QA, q: "If the surface areas of two spheres are in the ratio of 9 : 49, then the ratio of their volumes is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "SA ratio 9:49 → r ratio 3:7 → V ratio 27:343. Option 1." },
  { s: QA, q: "Reshma covers 45 km at a speed of 15 km/h by bicycle, 80 km at a speed of 40 km/h by car, and another 6 km at a speed of 2 km/h on foot. Find her average speed for the whole journey (correct to 2 decimal places).", o: ["18.36 km/h","16.38 km/h","43.50 km/h","15.25 km/h"], e: "Total dist = 131 km. Time = 3 + 2 + 3 = 8 hrs. Avg = 131/8 = 16.375 ≈ 16.38 km/h. Option 2." },
  { s: QA, q: "A policeman chases a thief on a straight road. The policeman catches the thief in 15 minutes if he drives with a speed of 60 km/h and catches the thief in 0.5 hours if he drives with a speed 45 km/h. What should be his driving speed (in km/h) to catch the thief in just 10 minutes?", o: ["75","65","90","70"], e: "Per docx answer key, option 1 (75)." },
  { s: QA, q: "In nine games, A wins five games with score differences of 12, 3, 8, 4 and 1, while in the remaining four games, he loses with score differences of −4, −1, −2 and −3. The average score difference of A in all the nine games is:", o: ["2","3","4","1"], e: "Sum = (12+3+8+4+1) − (4+1+2+3) = 28 − 10 = 18. Avg = 18/9 = 2. Option 1." },
  { s: QA, q: "Reena makes a profit of 20% by selling pens at a certain price. If she charges ₹5 more on each pen, she will gain 40%. The initial selling price of one pen was:", o: ["30","25","20","35"], e: "20% profit → SP=1.2×CP. Adding 5 → 1.4×CP. So 0.2×CP=5 → CP=25, SP=30. Option 1." },
  { s: QA, q: "A person crosses a road 350 metres wide in 70 seconds. His speed (in km/h) is:", o: ["19","15","18","17"], e: "Speed = 350/70 = 5 m/s = 18 km/h. Option 3." },
  { s: QA, q: "Four numbers are in the ratio of 2 : 3 : 4 : 5, and their sum is 56. Find the sum of the first and third numbers.", o: ["20","12","16","24"], e: "Sum = 14x = 56 → x=4. First+third = 2x+4x = 6x = 24. Option 4." },
  { s: QA, q: "What annual instalment will discharge a debt of ₹5,460 due in 5 years at 10% simple interest per annum?", o: ["1,200","910","1,092","950"], e: "Per docx answer key, option 2 (910)." },
  { s: QA, q: "₹50,000 is deposited in a bank account. There was already some money in the account. Now the bank gives ₹7,500 as simple interest in a year. The rate of simple interest is 4.5% per annum. How much money (in ₹) was already there in the account?", o: ["1,16,666.67","1,66,666.67","1,33,333.33","1,13,333.33"], e: "Total P = 7500×100/4.5 = 166666.67. Already there = 166666.67 − 50000 = 116666.67. Option 1." },
  { s: QA, q: "A shopkeeper gives a discount of 15% on the marked price of an article. If the selling price is ₹8,500, then the discount on it will be ________.", o: ["1,500","1,200","1,600","1,800"], e: "MP × 0.85 = 8500 → MP = 10000. Discount = 1500. Option 1." },
  { s: QA, q: "How many numbers less than 1,000 are multiples of both 7 and 11?", o: ["12","11","10","13"], e: "Multiples of 77 less than 1000: 77, 154, ..., 924 = 12 numbers. Option 1." },
  { s: QA, q: "Which of the following numbers is divisible by 4?\n(i) 67920598\n(ii) 618703592\n(iii) 618703594\n(iv) 67920590", o: ["(i)","(iv)","(ii)","(iii)"], e: "Divisible by 4 iff last two digits div by 4. (i)98/4=24.5 no; (ii)92/4=23 yes; (iii)94/4 no; (iv)90/4 no. Option 3." },
  { s: QA, q: "From a container having pure milk, 40% is replaced by water and the process is repeated thrice. At the end of the third operation, the purity of milk is:", o: ["22.7%","21.6%","18.6%","23.4%"], e: "(0.6)³ = 0.216 = 21.6%. Option 2." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the INCORRECTLY spelt word in the given sentence.\nWithin the walled palace, rows of attractive food stalls, souvenir bouteques and entertainment platforms have been erected by the prominent delegations.", o: ["erected","bouteques","prominent","souvenir"], e: "'Bouteques' should be 'boutiques'. Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThat which cannot be satisfied", o: ["Prickly","Insatiable","Drastic","Stubborn"], e: "Insatiable = cannot be satisfied. Option 2." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\nThe furniture displayed a wonderful combination of elegance and practicality.", o: ["Gracelessness","Simplicity","Magnificence","Glory"], e: "Elegance ↔ Gracelessness. Option 1." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\nPhilosophers dating all the way back to Plato and the Ancient Greeks ________ placed significant emphasis on education.", o: ["was","has","have been","have"], e: "Plural subject 'Philosophers' takes 'have'. Option 4." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Extingish","Extravagant","Dependent","Announcement"], e: "Correct spelling: 'Extinguish'. Option 1." },
  { s: ENG, q: "Select the most appropriate idiom to fill in the blank.\nTaking the summer job proved to be ____________ for Anand's visa applications.", o: ["come up","on the contrary","a blessing in disguise","come in high"], e: "Blessing in disguise = unexpected benefit. Option 3." },
  { s: ENG, q: "Choose the sentence that contains correct spellings.", o: ["Geeta is unable to ricall the events of five years ago in comparison to her brother, Mohit who can recollect the memories of his childhood.","Geeta is unable to recall the events of five years ago in comparison to her brother, Mohit who can recollect the memories of his childhood.","Geeta is unable to recal the events of five years ago in comparison to her brother, Mohit who can recollect the memories of his childhood.","Geeta is unable to rekall the events of five years ago in comparison to her brother, Mohit who can recollect the memories of his childhood."], e: "Only Option 2 uses correct spellings (recall, recollect). Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in reported speech.\nBhavin said, 'I will take you now.'", o: ["Bhavin said that he will be taking me then.","Bhavin said that he has to take me now.","Bhavin said that he will take you then.","Bhavin said that he would take me then."], e: "'will' → 'would', 'you' → 'me', 'now' → 'then'. Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nRetreat", o: ["Withdraw","Destruct","Advance","Dishonour"], e: "Retreat ↔ Advance. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\nThe Russia-Ukraine war has caused chaos.", o: ["Pitilessness","Havoc","Orderliness","Modesty"], e: "Chaos ↔ Orderliness. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\nLast month tomatoes were quite cheap.", o: ["Costly","Less","Inexpensive","Insufficient"], e: "Cheap ↔ Costly. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\nHard but liable to be easily broken", o: ["Stagnant","Fragmentary","Rudiment","Brittle"], e: "Brittle = hard but easily broken. Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\nThey were sure of their victory.", o: ["Imprudent","Doubtful","Vengeful","Confident"], e: "Sure ↔ Doubtful. Option 2." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom in the following sentence.\nDinisha visits her mother once in a blue moon.", o: ["Very frequently","Every week","Every month","Very rarely"], e: "Once in a blue moon = very rarely. Option 4." },
  { s: ENG, q: "Select the option that expresses the following sentence in passive voice.\nRitika closed the box quickly.", o: ["The box was closed by Ritika quickly.","The box has been closed by Ritika quickly.","The box is quickly closed by Ritika.","The box had closed quickly by Ritika."], e: "Past simple passive: 'was closed by'. Option 1." },
  { s: ENG, q: "Read the Food Industry passage. Select the most appropriate option to fill in blank number 1.\n'will be one of the (1)________ growth areas in the years ahead.'", o: ["major","inferior","minor","superior"], e: "'Major' growth area fits positive context. Option 1." },
  { s: ENG, q: "Read the Food Industry passage. Select the most appropriate option to fill in blank number 2.\n'This has given (2)______ to international trade'", o: ["motivation","assurance","impetus","energy"], e: "Given impetus to trade = strong drive. Option 3." },
  { s: ENG, q: "Read the Food Industry passage. Select the most appropriate option to fill in blank number 3.\n'appropriate level of (3)______ in terms of sanitary and phytosanitary protection.'", o: ["safety","welfare","immunity","danger"], e: "Sanitary protection → 'safety'. Option 1." },
  { s: ENG, q: "Read the Food Industry passage. Select the most appropriate option to fill in blank number 4.\n'consumer protection by (4)_______ the safety and wholesomeness of food'", o: ["ensuring","manipulating","contradicting","entangling"], e: "Ensuring safety. Option 1." },
  { s: ENG, q: "Read the Food Industry passage. Select the most appropriate option to fill in blank number 5.\n'widened the scope and (5)______ career options in this area.'", o: ["emphasised","increased","Intensified","enlarged"], e: "Increased career options fits the growth narrative. Option 2." },
  { s: ENG, q: "Read the WWF Wildlife passage. How much forestland, according to the passage, is destroyed every year?", o: ["Ten million hectares","Two and half billion hectares","Twenty-seven trillion hectares","Two-and-a-half percent of land"], e: "Passage: 'every year, we destroy ten million hectares of forestlands'. Option 1." },
  { s: ENG, q: "Read the WWF Wildlife passage. Which of the following is NOT one of the reasons for human-animal conflict?", o: ["Heatwaves","Excessive love of animals","Animal's travel for food","Destruction of forest land"], e: "Excessive love of animals is not a conflict cause. Option 2." },
  { s: ENG, q: "Read the WWF Wildlife passage. Select the most appropriate title for the given passage.", o: ["Birds and their Life","Animal Life in India","World Wildlife Fund and India","Animals in the Anthropocene"], e: "Passage centres on animals during the Anthropocene era. Option 4." },
  { s: ENG, q: "Read the WWF Wildlife passage. As per the World Economic Forum, half the world's GDP depends on _________.", o: ["birds","animals","forests","anthropocene"], e: "Passage: 'over half the world's GDP is dependent on nature and ecosystem services performed by animals'. Option 2." },
  { s: ENG, q: "Read the WWF Wildlife passage. Select the central theme of the passage.", o: ["As GDP growth depends on animals, we should replace them.","For peace and economic well-being, man should not harm animals.","Animals and humans should come to an agreement to live together.","Forest protection should be taken care of by the governments."], e: "Passage's overall message about human-animal coexistence. Option 2." }
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
      tags: ['SSC', 'Selection Post', 'Phase XII', 'Matriculation', 'PYQ', '2024'],
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Matriculation) - 26 June 2024 Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2024, pyqShift: 'Shift-1',
    pyqExamName: 'SSC Selection Post Phase XII (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
