/**
 * Seed: SSC Selection Post Phase X (Matriculation Level) PYQ - 4 August 2022, Shift-1 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-4aug2022-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/04/shift-1/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-4aug2022-s1';

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

const F = '4-august-2022';
// Reasoning Q9 and Q23 are image-based (only image assets in source folder for this paper).
const IMAGE_MAP = {
  9:  { q: `${F}-q-9.png`,
        opts: [`${F}-q-9-option-1.png`,`${F}-q-9-option-2.png`,`${F}-q-9-option-3.png`,`${F}-q-9-option-4.png`] },
  23: { q: `${F}-q-23.png`,
        opts: [`${F}-q-23-option-1.png`,`${F}-q-23-option-2.png`,`${F}-q-23-option-3.png`,`${F}-q-23-option-4.png`] }
};

// 1-based answer key (Chosen Options + GK overrides for unanswered/wrong picks).
const KEY = [
  // 1-25 (General Intelligence)
  4,3,4,2,4, 3,1,2,1,1, 2,2,3,4,1, 3,1,3,2,3, 2,2,3,4,3,
  // 26-50 (English Language) — Q12/Q17/Q19/Q24 wrong picks overridden
  1,1,3,3,2, 3,2,2,3,4, 2,4,4,1,2, 4,1,4,1,2, 4,4,1,3,2,
  // 51-75 (Quantitative Aptitude) — Q12 wrong overridden
  2,2,4,2,2, 1,1,1,4,1, 4,1,4,4,2, 3,1,1,4,1, 4,1,4,2,4,
  // 76-100 (General Awareness) — heavy overrides for unanswered/wrong picks
  3,4,2,1,3, 3,2,1,3,4, 4,3,3,1,4, 2,2,2,3,3, 1,2,2,3,1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nHARBOUR : HERBUAR :: FOREST : FURIST :: GLOBAL : ?", o: ["GLUBAL","GLOBEL","GLUBIL","GLUBEL"], e: "Each vowel shifts to the next vowel in cycle (A→E→I→O→U→A). GLOBAL: O→U, A→E ⇒ GLUBEL." },
  { s: REA, q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nAll cycles are buses.\nSome buses are trains.\n\nConclusions:\nI. No cycle is a train.\nII. All cycles are train.", o: ["Only conclusion II follows","Only conclusion I follows","Neither conclusion I nor II follows","Both conclusions I and II follow"], e: "All cycles ⊆ buses, but the 'some buses which are trains' may or may not include cycles. Neither conclusion can be drawn." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Occupation  2. Ocean  3. Octave  4. Occur  5. Octopus  6. Occasion", o: ["6, 4, 1, 2, 3, 5","2, 3, 5, 6, 1, 4","6, 1, 4, 2, 5, 3","6, 1, 4, 2, 3, 5"], e: "Order: Occasion(6), Occupation(1), Occur(4), Ocean(2), Octave(3), Octopus(5) → 6,1,4,2,3,5." },
  { s: REA, q: "Three statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nAll desks are pens.\nSome pens are clips.\nNo clip is a book.\n\nConclusions:\nI. All pens are desks.\nII. Some books are not clips.\nIII. All pens are clips.", o: ["Only conclusion III follows","Only conclusion II follows","None of the conclusions follows","Only conclusion I follows"], e: "II follows: 'no clip is a book' ⇒ no books are clips ⇒ some books are not clips. I and III are too strong." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n40 * 5 * 36 * 60 * 32 * 316", o: ["+, ×, −, =, ÷","÷, +, −, ×, =","+, −, ×, ÷, =","×, ÷, +, −, ="], e: "Per response sheet, option 4 (×, ÷, +, −, =)." },
  { s: REA, q: "In a certain code language, 'IMAGE' is written as 'KPEJG', and 'HOTEL' is written as 'JRXHN'. How will 'JAPAN' be written in that language?", o: ["LDTEP","LDPDT","LDTDP","LDTEQ"], e: "Successive shifts +2,+3,+4,+3,+2. JAPAN: J+2=L, A+3=D, P+4=T, A+3=D, N+2=P → LDTDP." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nGOLF : IMND :: DOLL : FMNJ :: MOLD : ?", o: ["OMNB","ONNB","OMNC","OMMA"], e: "Alternating shifts +2,−2,+2,−2. MOLD: M+2=O, O−2=M, L+2=N, D−2=B → OMNB." },
  { s: REA, q: "In a code language, 'praises to him' is written as '723', 'first in school' is written as '526', 'new chapter begins' is written as '376'. What is the code for the phrase 'welcome to class reunion' in this language?", o: ["7527","7257","7246","6256"], e: "Each digit = letter count. welcome(7), to(2), class(5), reunion(7) = 7257." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Pointing to a person in a photograph, a man, Ravi said, \"He is the father of my son's mother's brother.\" How is the person related to Ravi?", o: ["Father-in-law","Father","Brother","Brother-in-law"], e: "Son's mother = Ravi's wife. Wife's brother = brother-in-law. Father of brother-in-law = Ravi's father-in-law." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nOWDU, QTHP, ?, UNPF, WKTA", o: ["TRLK","SQLK","SQKJ","TRKJ"], e: "1st:+2 (O,Q,S,U,W). 2nd:−3 (W,T,Q,N,K). 3rd:+4 (D,H,L,P,T). 4th:−5 (U,P,K,F,A). Missing = SQLK." },
  { s: REA, q: "In a certain code language, 'MINUTE' is written as 'NKOWUG' and 'LESSON' is written as 'MGTUPP'. How will 'IMPORT' be written in that language?", o: ["JOQTSV","JOQQSV","JORQSV","JOQQTV"], e: "Alternating shifts +1,+2. IMPORT: I+1=J, M+2=O, P+1=Q, O+2=Q, R+1=S, T+2=V → JOQQSV." },
  { s: REA, q: "'P @ Q' means 'P is the father of Q'.\n'P & Q' means 'P is the mother of Q'.\n'P # Q' means 'P is the wife of Q'.\n'P ∽ Q' means 'P is the husband of Q'.\n\nIf 'A # B @ C ∽ D & E', then how is A related to E?", o: ["Father's father","Son's daughter","Father's mother","Mother's mother"], e: "A wife of B; B father of C ⇒ A is C's mother. C husband of D; D mother of E ⇒ E is C's child. So A is E's father's mother." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Understand  2. Untie  3. Uncle  4. University  5. Unlimited  6. Unknown", o: ["1, 3, 4, 6, 5, 2","3, 1, 6, 4, 5, 2","1, 4, 3, 6, 5, 2","3, 1, 4, 6, 5, 2"], e: "Order: Uncle(3), Understand(1), University(4), Unknown(6), Unlimited(5), Untie(2) → 3,1,4,6,5,2." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nPDRT, ?, LJPP, JMON, HPNL", o: ["NGQR","NGRQ","NFQQ","NFPS"], e: "1st:−2 (P,N,L,J,H). 2nd:+3 (D,G,J,M,P). 3rd:−1 (R,Q,P,O,N). 4th:−2 (T,R,P,N,L). Missing = NGQR." },
  { s: REA, q: "In a code language, 'HURDLE' is written as 'REHVNU' and 'TARGET' is written as 'FYHSUF'. How will 'FLANKER' be written in that language?", o: ["RKEANLF","REKNALF","TNYLOUH","TNYOULH"], e: "Per response sheet, option 3 (TNYLOUH)." },
  { s: REA, q: "In a certain code language, 'NATIVE' is written as 'IEVNTA' and 'PALACE' is written as 'AECPLA'. How will 'RELATE' be written in that language?", o: ["AETRLE","ATRELE","TRAELE","TELARE"], e: "Position rearrangement 1234 56 → 4,6,5,1,3,2. RELATE → A,E,T,R,L,E = AETRLE." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\nD_ G J _ F G _ D _ _ J _ F _ J", o: ["FDJFJDG","FGJFGDG","FDJFGDG","FDJFGDL"], e: "Per response sheet, option 3 (FDJFGDG)." },
  { s: REA, q: "Three statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nSome boxes are pins.\nAll pins are taps.\nNo tap is a star.\n\nConclusions:\nI. All boxes are pins.\nII. Some taps are pins.\nIII. Some stars are not taps.", o: ["All of the conclusions follow","Only conclusion II and III follow","Only conclusion I and III follow","Only conclusions I and II follow"], e: "II follows by conversion of 'all pins are taps'. III follows from 'no tap is a star'. I is too strong." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nGQLC, HSOG, ?, JWUO, KYXS", o: ["IUSJ","ITSL","IURK","ITRL"], e: "1st:+1 (G,H,I,J,K). 2nd:+2 (Q,S,U,W,Y). 3rd:+3 (L,O,R,U,X). 4th:+4 (C,G,K,O,S). Missing = IURK." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n9, 17, 33, 65, ?, 257", o: ["229","129","89","99"], e: "Each term = previous × 2 − 1. 65 × 2 − 1 = 129; 129 × 2 − 1 = 257." },
  { s: REA, q: "In a code language, 'let us go shopping' is written as '3228', 'make one list' is written as '434', 'the cart is filled' is written as '3426'. What is the code for the phrase 'pay by cash or card' in this language?", o: ["34224","32424","43224","42324"], e: "Each digit = letter count. pay(3), by(2), cash(4), or(2), card(4) = 32424." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Select the option that is related to the fifth number in the same way as the second number is related to the first number and the fourth number is related to the third number.\n\n32 : 4 :: 72 : 6 :: 200 : ?", o: ["2","8","12","10"], e: "Pattern: result = √(n/2). √(32/2) = 4; √(72/2) = 6; √(200/2) = √100 = 10." },
  { s: REA, q: "In a code language, 'MARKED' is written as '+5%2*@', 'RUBIES' is written as '%4#3*∞' and 'SNORK' is written as '∞9$%2'. How will 'BRAND' be written in that language?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Symbol-coded language. Per response sheet, option 3." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nIntentional", o: ["Accidental","Consequential","Careless","Eventual"], e: "'Intentional' (deliberate) — antonym 'Accidental' (unplanned)." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nThey noted down the details very carefully.", o: ["The details were noted down by them very carefully.","The details was being noted down by them very carefully","The details were being noted down by them very carefully","The details had been noted down by them very carefully."], e: "Simple past active 'noted down' → simple past passive 'were noted down'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDainty", o: ["Baffled","Confused","Clumsy","Lazy"], e: "'Dainty' (delicate / graceful) — antonym 'Clumsy' (awkward)." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Battalion","Battery","Consenses","Confession"], e: "'Consenses' is misspelled — correct is 'Consensus'." },
  { s: ENG, q: "Select the correctly spelt word to fill in the blank.\n\nGaurav faced _________ of court.", o: ["qriminal Contemp","criminal contempt","kriminal cuntempt","kqriminal coontempt"], e: "'Criminal contempt' is the correct spelling and standard legal phrase." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nIt is always good to eat ________ of different colours.", o: ["wheat","meat","vegetables","rice"], e: "'Vegetables of different colours' fits a healthy-eating context." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nEmancipate", o: ["Fetter","Liberate","Enchain","Confine"], e: "'Emancipate' (set free) — synonym 'Liberate'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nOur old Principal was standing and I _________ him a chair.", o: ["gave","offered","took","ordered"], e: "'Offered him a chair' is the polite, idiomatic expression for showing respect." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nDelay in doing something to a later time", o: ["Schedule","Span","Procrastination","Ephemeral"], e: "'Procrastination' = the act of delaying or postponing tasks." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nA bone of contention", o: ["A push","A settlement","An agreement","A dispute"], e: "'A bone of contention' = subject of disagreement / dispute." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nStand in one's own light", o: ["To disclose","To act against one's own interest","In favour with","With all power"], e: "'Stand in one's own light' = to act against one's own interest / be one's own obstacle." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA large group of people", o: ["Population","Posse","Congregation","Horde"], e: "'Horde' specifically means a large multitude / mass of people." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nStupid", o: ["Cunning","Moody","Clumsy","Dull"], e: "'Stupid' (lacking intelligence) — synonym 'Dull'." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Begining","Becoming","Bellowing","Believing"], e: "'Begining' is misspelled — correct is 'Beginning' (with double-n)." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nThe information surprised us.", o: ["We have been surprised by the information.","We were surprised by the information.","We were feeling surprised at the information.","We are surprised by the information."], e: "Simple past active 'surprised' → simple past passive 'were surprised'." },
  { s: ENG, q: "Read the passage about Horus the falcon-headed god, and answer.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'Horus, the falcon-headed god, is a (1) ___________ ancient Egyptian god.'", o: ["nonchalant","humble","rebellious","revered"], e: "'Revered' (deeply respected, worshipped) fits the description of a major Egyptian deity." },
  { s: ENG, q: "Read the passage about Horus the falcon-headed god, and answer.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'on hotels and restaurants (2) _____________ the land.'", o: ["throughout","away from","alongside","outside"], e: "'Throughout the land' = across the entire country, fits the prevalence context." },
  { s: ENG, q: "Read the passage about Horus the falcon-headed god, and answer.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'one of many gods (3) _____________ with the falcon.'", o: ["accommodated","endowed","possessed","associated"], e: "'Associated with' is the standard collocation — gods linked to a symbol." },
  { s: ENG, q: "Read the passage about Horus the falcon-headed god, and answer.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'worshipped from earliest times as a (4)______________ deity whose body represents the heavens'", o: ["cosmic","malevolent","modern","primary"], e: "'Cosmic deity' fits — body representing the heavens, eyes representing sun and moon is a cosmic depiction." },
  { s: ENG, q: "Read the passage about Horus the falcon-headed god, and answer.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'Horus is (5) __________ as a falcon wearing a crown'", o: ["transcended","depicted","translated","introduced"], e: "'Depicted' (portrayed / represented in art) fits the description of how Horus is shown." },
  { s: ENG, q: "Read the passage about Blue Mountains National Park.\n\nSelect the most appropriate ANTONYM of the given word.\n\nInspiring", o: ["Alert","Enriching","Interesting","Monotonous"], e: "'Inspiring' (uplifting / motivating) — antonym 'Monotonous' (dull / boring)." },
  { s: ENG, q: "Read the passage about Blue Mountains National Park.\n\nSelect the most appropriate ANTONYM of the given word.\n\nDistinctive", o: ["Constant","Parallel","Different","Alike"], e: "'Distinctive' (unique / characteristic) — antonym 'Alike' (similar / same)." },
  { s: ENG, q: "Read the passage about Blue Mountains National Park.\n\nChoose the most appropriate title for the passage.", o: ["The Blue Mountains","Nature Wonder","World Heritage","Jenolan Caves"], e: "The passage centres on the Blue Mountains National Park — its name origin and key features." },
  { s: ENG, q: "Read the passage about Blue Mountains National Park.\n\nBased on your reading of the passage, choose the most appropriate option that describes the word 'heritage'.", o: ["Human social background","Someone's birth right","Descended from the generations","Old buildings and monuments"], e: "'Heritage' means valuable traditions/things passed down (descended) through generations." },
  { s: ENG, q: "Read the passage about Blue Mountains National Park.\n\nAccording to the passage, which element is released from the eucalyptus trees?", o: ["Limestone","Oil","Vapour","Sunlight"], e: "Per passage: 'tiny droplets of oil get released from the tree'." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "100 oranges were purchased for Rs.800 and sold at the rate of Rs.108 per dozen. What is the percentage profit?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "CP/orange = 8. SP/orange = 108/12 = 9. Profit% = 1/8 × 100 = 12.5%. Per response sheet, option 2." },
  { s: QA, q: "The effective annual rate of interest corresponding to a nominal rate of 10% per annum payable half-yearly is:", o: ["11.25%","10.25%","10.50%","12.50%"], e: "Effective rate = (1 + 0.10/2)² − 1 = (1.05)² − 1 = 0.1025 = 10.25%." },
  { s: QA, q: "Ram spends 30% of his monthly salary on food, and one-fifth of the remaining on house rent. If Ram saves Rs.7,000 per month, which is equal to one-third of the balance after spending on food and house rent, then what is his monthly salary?", o: ["Rs.37,300","Rs.37,600","Rs.37,400","Rs.37,500"], e: "Salary S. After food = 0.7S. Rent = 0.14S. Balance = 0.56S. Savings = 0.56S/3 = 7000 ⇒ S = 37500." },
  { s: QA, q: "What is the area of a triangle with a base of 18 cm and height of 21 cm?", o: ["378 cm²","189 cm²","195 cm²","328 cm²"], e: "Area = ½ × base × height = ½ × 18 × 21 = 189 cm²." },
  { s: QA, q: "The fourth proportional of 10, 15 and 30 is:", o: ["35","45","40","55"], e: "Fourth proportional = (15 × 30)/10 = 450/10 = 45." },
  { s: QA, q: "A sum of Rs.7,600 amounts to Rs.7,980 in 2 years at simple interest. If the interest rate is increased by 5%, how much would it amount to?", o: ["Rs.8,740","Rs.8,470","Rs.8,240","Rs.8,540"], e: "SI = 380; rate = 380×100/(7600×2) = 2.5%. New rate = 7.5%. New SI = 7600·7.5·2/100 = 1140. Amount = ₹8,740." },
  { s: QA, q: "Out of his income, Ram spends 20% on house rent and 60% of the rest on household expenditure. If he saves Rs.4,600 per month, then his total income per month in Rs. is:", o: ["14375","13375","14300","10375"], e: "Income I. After rent: 0.8I. After household: 0.4·0.8I = 0.32I = 4600. So I = ₹14,375." },
  { s: QA, q: "The average salary of all the staff in an office of a corporate house is Rs.6,000. The average salary of the officers is Rs.15,000 and that of the rest is Rs.5,000. If the total number of staff is 300, then the number of officers is:", o: ["30","50","270","40"], e: "15000x + 5000(300−x) = 6000·300 ⇒ 10000x = 300000 ⇒ x = 30 officers." },
  { s: QA, q: "If a person travels three equal distances at speeds of 20 km/h, 30 km/h and 10 km/h, then find the average speed of the whole journey.", o: ["18.6 km/h","22 km/h","20 km/h","16.36 km/h"], e: "Avg = 3/(1/20 + 1/30 + 1/10) = 3/(11/60) = 180/11 ≈ 16.36 km/h." },
  { s: QA, q: "Refer to the image for the question.", o: ["46","42","32","16"], e: "Per response sheet, option 1 (46)." },
  { s: QA, q: "A sum of Rs.28,000 is invested by Vijay at 10% p.a. compound interest for the period of 4 years. How much money (in Rs.) will Vijay receive after 4 years?", o: ["Rs.41,994.80","Rs.40,992.80","Rs.12,994.80","Rs.40,994.80"], e: "Amount = 28000 × (1.10)⁴ = 28000 × 1.4641 = ₹40,994.80." },
  { s: QA, q: "A girl walks to the park, situated 450m from her house, in 4 min and comes back in 6 min. What is the average speed of the girl (in km/h)?", o: ["5.4 km/h","5.2 km/h","4.4 km/h","5 km/h"], e: "Total dist = 900 m = 0.9 km. Total time = 10 min = 1/6 h. Avg = 0.9 × 6 = 5.4 km/h." },
  { s: QA, q: "Ram sells almonds at the cost price but uses false weight and thus gains 25% profit. How many grams of almonds does he give in 3.5 kilograms?", o: ["2500","2700","2600","2800"], e: "Profit% = (1000−X)/X × 100 = 25 ⇒ X = 800 g per kg. In 3.5 kg: 3.5 × 800 = 2800 g." },
  { s: QA, q: "8 men working 9 hours a day complete a piece of work in 20 days. In how many days can 7 men working for 10 hours a day complete the same piece of work?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Total man-hours = 8·9·20 = 1440. Days = 1440/(7·10) = 20.57 days. Per response sheet, option 4." },
  { s: QA, q: "Pardeep can complete a piece of work in 16 days. He worked for 4 days and left the work, thereafter Sohan finished the remaining work in 8 days. In how many days, can Pardeep and Sohan together complete the work?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Pardeep did 1/4 in 4 days. Sohan did 3/4 in 8 days ⇒ Sohan = 3/32 per day. Together = 5/32 per day ⇒ 32/5 = 6.4 days. Per response sheet, option 2." },
  { s: QA, q: "The ratio of the prices of tea to coffee is 3 : 5 and the ratio of their quantities consumed by a family is 5 : 7. Find the ratio of expenditure on tea to coffee.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Expenditure ratio = (3·5):(5·7) = 15:35 = 3:7. Per response sheet, option 3." },
  { s: QA, q: "Praveen is offering a 10% discount on all clothes to sell the stock as early as possible. One of his friends, Vijay, came to the shop and purchased one coat. Because of their friendship, Praveen gave an additional 6% discount to Vijay. What was the price of the coat if Vijay paid Rs.7,614?", o: ["Rs.9,000","Rs.9,500","Rs.8,500","Rs.9,800"], e: "Effective factor = 0.90 × 0.94 = 0.846. MP = 7614/0.846 = ₹9,000." },
  { s: QA, q: "The ratio of the lengths of two trains is 7 : 5 and the ratio of their speeds is 9 : 7. Find the ratio of the time taken by them to cross a pole.", o: ["49 : 45","35 : 46","49 : 35","46 : 49"], e: "Time = length/speed. Ratio = (7/9):(5/7) = 49:45." },
  { s: QA, q: "A boat covers 18 km downstream in 3 hours and the same distance upstream in 6 hours. The speed of the boat in still water is __________.", o: ["5 km/h","5.5 km/h","4 km/h","4.5 km/h"], e: "Downstream = 18/3 = 6 km/h; upstream = 18/6 = 3 km/h. Boat speed = (6+3)/2 = 4.5 km/h." },
  { s: QA, q: "Find the greatest number that exactly divides 8, 12, 20 and 24.", o: ["4","6","12","8"], e: "GCD(8,12,20,24) = 4." },
  { s: QA, q: "A dealer marks a dishwasher 40% above the cost price and allows a discount of 11% on it. What is his profit (rounded off to 1 decimal place) percentage?", o: ["42.2%","31.7%","28.6%","24.6%"], e: "MP = 1.4·CP. SP = 0.89·MP = 1.246·CP. Profit% = 24.6%." },
  { s: QA, q: "The sum of the first nine prime numbers is:", o: ["100","77","129","123"], e: "First 9 primes: 2+3+5+7+11+13+17+19+23 = 100." },
  { s: QA, q: "A metallic solid hemisphere of radius 12 cm is melted and recast into spheres of radius 2 cm. Find the number of spheres thus formed.", o: ["184","142","216","108"], e: "Hemisphere vol = (2/3)π·12³ = 1152π. Sphere vol = (4/3)π·2³ = 32π/3. Number = 1152π / (32π/3) = 108." },
  { s: QA, q: "Anandi sold a mobile for Rs.22,140 at a profit of 23%. What was the cost price of the mobile?", o: ["Rs.20,000","Rs.18,000","Rs.18,500","Rs.18,550"], e: "CP = 22140/1.23 = ₹18,000." },
  { s: QA, q: "There are two symbols available for voters to cast their votes — Car and Umbrella. The 'Umbrella' got 2412 votes, which were 120% of the votes of the 'Car'. How many votes were cast in total?", o: ["4400","4500","4200","4422"], e: "Car = 2412/1.2 = 2010. Total = 2412 + 2010 = 4422." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "In November 2021, M. Appavu, the state legislative assembly speaker of which state assembly called for 'setting a binding timeframe within which bills should be assented, returned or reserved for consideration of the President of India by the Governors'?", o: ["Karnataka","Kerala","Tamil Nadu","Andhra Pradesh"], e: "M. Appavu is the Speaker of the Tamil Nadu Legislative Assembly." },
  { s: GA, q: "'Game Changer' is the name of an autobiography of which sportsperson?", o: ["Rahul Dravid","Yuvraj Singh","Shane Warne","Shahid Afridi"], e: "'Game Changer' is the autobiography of Pakistani cricketer Shahid Afridi." },
  { s: GA, q: "Who among the following led the Salt Satyagraha march from Trichy to Vedaranyam in Tamil Nadu?", o: ["Sundara Sastri Satyamurti","Chakravarti Rajagopalachari","Kumaraswami Kamaraj","Subramaniya Siva"], e: "C. Rajagopalachari (Rajaji) led the Vedaranyam Salt Satyagraha march from Trichy in 1930." },
  { s: GA, q: "Select the correct pair of state and its corresponding classical dance form from the following.", o: ["Kuchipudi: Andhra Pradesh","Kathakali: Tamil Nadu","Bharatanatyam: Kerala","Manipuri: Odisha"], e: "Kuchipudi originated in Andhra Pradesh. (Kathakali — Kerala; Bharatanatyam — Tamil Nadu; Manipuri — Manipur.)" },
  { s: GA, q: "Sound waves and seismic P waves are examples of which type of waves?", o: ["Matter waves","Electromagnetic waves","Longitudinal waves","Transverse waves"], e: "Sound waves in air and seismic P (primary) waves are longitudinal — particles oscillate along the direction of propagation." },
  { s: GA, q: "Which of the following is India's oldest city?", o: ["Aligarh","Delhi","Varanasi","Lucknow"], e: "Varanasi (Kashi) is widely regarded as one of the world's and India's oldest continuously inhabited cities." },
  { s: GA, q: "Which of the following festivals is NOT celebrated primarily in Arunachal Pradesh?", o: ["Sangken","Losoong","Tamladu","Ojiyale"], e: "Losoong is the harvest festival of Sikkim (Bhutia community). Sangken, Tamladu and Ojiyale are Arunachal Pradesh festivals." },
  { s: GA, q: "Who among the following musicians plays the tabla?", o: ["Zakir Husain","Ramnad Raghavan","Ali Akbar Khan","Pt. Ravi Shankar"], e: "Ustad Zakir Hussain is one of the world's most renowned tabla players." },
  { s: GA, q: "Which of the following was the first state to be annexed into the British empire under the Doctrine of Lapse introduced by Lord Dalhousie?", o: ["Jhansi","Nagpur","Satara","Sambalpur"], e: "Satara was the first princely state to be annexed under the Doctrine of Lapse in 1848 by Lord Dalhousie." },
  { s: GA, q: "In February 2022, the Union Minister for Health and Family Welfare launched the National Polio Immunisation Drive for 2022 for administering polio drops to children below _________ years of age.", o: ["seven","eight","nine","five"], e: "The National Polio Immunisation Drive targets children below 5 years of age." },
  { s: GA, q: "In Census of India 2011, what is the criteria regarding the density of population for considering a settlement as a Census town?", o: ["500 persons per sq. km.","100 persons per sq. km.","300 persons per sq. km.","400 persons per sq. km."], e: "A 'Census Town' must have a minimum density of 400 persons per sq km (along with population ≥5000 and 75% males in non-agricultural work)." },
  { s: GA, q: "Which of the following states registered the highest growth rate in population during 2001 - 2011?", o: ["Kerala","Maharashtra","Meghalaya","Rajasthan"], e: "Per Census 2011 decadal growth: Meghalaya 27.95%, Bihar 25.42%, Rajasthan 21.31%, Maharashtra 15.99%, Kerala 4.91% — Meghalaya highest among the options." },
  { s: GA, q: "The first modern Olympic Games under IOC was held in_______.", o: ["1890","1894","1896","1891"], e: "The IOC was founded in 1894 in Paris; the first modern Olympic Games were held in Athens in 1896." },
  { s: GA, q: "Soft drinks consist of which of the following gases?", o: ["Carbon dioxide","Nitrogen","Sulphur dioxide","Carbon monoxide"], e: "Carbonated soft drinks contain dissolved carbon dioxide (CO₂), which gives the fizz." },
  { s: GA, q: "Who among the following defeated the Lodhi sultan in the battle of Panipat in 1526 and founded the Mughal empire in medieval India?", o: ["Muhammad Azam Shah","Akbar","Jahandar Shah","Babur"], e: "Babur defeated Ibrahim Lodi in the First Battle of Panipat (1526), founding the Mughal empire." },
  { s: GA, q: "Aryabhata, a famous mathematician and astronomer of ancient India, was in the court of who among the following Gupta rulers?", o: ["Ramagupta","Chandragupta II","Kumaragupta","Samudragupta"], e: "Aryabhata (476–550 CE) lived/wrote at Kusumapura (Pataliputra) during the reign of Chandragupta II / Buddhagupta of the Gupta dynasty." },
  { s: GA, q: "The Kesariya Stupa is located in which Indian state?", o: ["Assam","Bihar","Uttar Pradesh","Nagaland"], e: "Kesariya Stupa is located in East Champaran district of Bihar — one of the world's tallest stupas." },
  { s: GA, q: "Wangala is a most famous festival of the Garo tribe of __________.", o: ["Tamil Nadu","Meghalaya","Karnataka","Uttarakhand"], e: "Wangala (Hundred Drums Festival) is the post-harvest festival of the Garo tribe of Meghalaya." },
  { s: GA, q: "Which Fundamental Right was added through the 86th Constitutional Amendment, 2002?", o: ["To safeguard public property and to abjure violence","To value and preserve the rich heritage of our composite culture","The parent or guardian to provide opportunities for education of his/her child/ward between the age of six and fourteen years.","To uphold and protect the sovereignty, unity and integrity of India"], e: "The 86th Amendment 2002 added Article 21A (Right to Education) and Article 51A(k) — duty of parent to provide education to child 6-14 yrs." },
  { s: GA, q: "Announced in February 2022, which of the following organisations is one of the partners of the Sustainable Access to Markets and Resources for Innovative Delivery of Healthcare (SAMRIDH) initiative?", o: ["Department of Pharmaceuticals","NITI Aayog","Ministry of Health and Family Welfare","Central Drugs Standard Control Organisation"], e: "SAMRIDH is a USAID-supported healthcare innovation initiative; the Ministry of Health and Family Welfare is one of its key partners." },
  { s: GA, q: "Quartz consists of _________.", o: ["silicon","carbon","iron","nickel"], e: "Quartz is silicon dioxide (SiO₂) — composed of silicon and oxygen." },
  { s: GA, q: "Jhika Dasain, a famous tribal dance of India, is predominantly performed by which of the following tribal groups?", o: ["Gaddi","Santhal","Bhil","Kuki"], e: "Jhika Dasain is a traditional dance of the Santhal tribe (Jharkhand, West Bengal, Odisha)." },
  { s: GA, q: "The parasitic mode of nutrition is used by:", o: ["mushrooms","tape-worms","bread moulds","yeast"], e: "Tapeworms are parasites that live inside the host's intestine and absorb nutrients (mushrooms, bread moulds, yeast are saprophytes)." },
  { s: GA, q: "Which of the following trophies is related to cricket?", o: ["Sultan Azlan Shah Cup","Santosh Trophy","Vijay Hazare Trophy","Davis Cup"], e: "Vijay Hazare Trophy is the BCCI's domestic List-A (50-over) cricket tournament. (Sultan Azlan Shah — hockey; Santosh — football; Davis Cup — tennis.)" },
  { s: GA, q: "In how many classes are roads classified in India?", o: ["Four","Eight","Seven","Six"], e: "Per the Nagpur Plan / standard textbook classification, roads in India are broadly grouped into four classes: National Highways, State Highways, District Roads, and Village Roads." }
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
      tags: ['SSC', 'Selection Post', 'Phase X', 'Matriculation', 'PYQ', '2022'],
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
      description: 'Staff Selection Commission - Selection Post Phase X (Matriculation Level - 10th-pass eligibility)',
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

  const TEST_TITLE = 'SSC Selection Post Phase X (Matriculation) - 4 August 2022 Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-1',
    pyqExamName: 'SSC Selection Post Phase X (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
