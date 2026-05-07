/**
 * Seed: SSC Selection Post Phase X (Matriculation Level) PYQ - 1 August 2022, Shift-1 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-1aug2022-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/01/shift-1/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-1aug2022-s1';

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

const F = '1-august-2022';
// Only Q1 and Q22 (Reasoning section) have image assets in the source folder for this paper.
const IMAGE_MAP = {
  1:  { q: `${F}-q-1.png`,
        opts: [`${F}-q-1-option-1.png`,`${F}-q-1-option-2.png`,`${F}-q-1-option-3.png`,`${F}-q-1-option-4.png`] },
  22: { q: `${F}-q-22.png`,
        opts: [`${F}-q-22-option-1.png`,`${F}-q-22-option-2.png`,`${F}-q-22-option-3.png`,`${F}-q-22-option-4.png`] }
};

// 1-based answer key (Chosen Options + GK overrides for unanswered/wrong picks).
const KEY = [
  // 1-25 (General Intelligence / Reasoning)
  2,4,2,1,3, 2,3,4,3,1, 4,1,2,3,2, 2,4,2,4,1, 2,4,3,3,1,
  // 26-50 (English Language) — Q3,Q5,Q12 overridden (wrong picks); Q23 unanswered
  3,2,1,1,2, 4,4,2,3,1, 3,1,4,3,4, 2,1,4,4,4, 1,4,3,3,4,
  // 51-75 (Quantitative Aptitude) — Q2 (mean prop) override, Q15/Q25 unanswered
  2,2,3,2,2, 2,1,3,3,4, 1,4,1,1,4, 1,2,4,4,4, 3,1,3,3,4,
  // 76-100 (General Awareness) — Q3,Q10,Q24 overridden; Q9,Q14,Q15,Q16,Q22,Q23,Q25 unanswered
  2,2,4,2,2, 3,1,1,3,4, 3,2,4,4,2, 3,4,2,1,2, 1,4,4,1,2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "Refer to the image for the question.\n\nPointing towards a woman in the photograph, Rahul said, \"She is the mother of the only daughter of my son-in-law, Harish\". How is she related to Rahul?", o: ["Sister","Daughter","Mother","Daughter-in-law"], e: "Son-in-law's only daughter = Rahul's granddaughter. Granddaughter's mother = Rahul's daughter." },
  { s: REA, q: "Based on meaning/relevance of the words, Laptop is related to Keyboard in the same way as Television is related to _______.", o: ["Movies","Internet","Channel","Remote"], e: "Keyboard controls a laptop; remote controls a television." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nDUNK, FSPI, ?, JOTE, LMVC", o: ["HQSF","HQRG","HQRF","HRSG"], e: "1st letters +2: D,F,H,J,L. 2nd −2: U,S,Q,O,M. 3rd +2: N,P,R,T,V. 4th −2: K,I,G,E,C. Missing = HQRG." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the following blanks, will complete the letter-series.\n\nT__RE_YU_ETY_R_T_U_E", o: ["YUTRUEYR","YURRUEYR","YVTRUEYR","YUTEUEYR"], e: "Per response sheet, option 1 (YUTRUEYR)." },
  { s: REA, q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nAll cups are saucers.\nNo saucer is a plate.\n\nConclusions:\nI. Some cups are plates.\nII. No cup is a plate.", o: ["Both conclusions I and II follow","Neither conclusion I nor II follows","Only conclusion II follows","Only conclusion I follows"], e: "All cups ⊆ saucers; no saucer is a plate → no cup is a plate (II follows). I contradicts II." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order. (From small to big)\n\n1. State  2. Town  3. City  4. Continent  5. Country", o: ["4, 5, 3, 1, 2","2, 3, 1, 5, 4","1, 3, 5, 4, 2","3, 4, 5, 2, 1"], e: "Small to big: Town(2) → City(3) → State(1) → Country(5) → Continent(4)." },
  { s: REA, q: "In a certain code language, 'BAD' is written as 'AYA' and 'MINT' is written as 'LGKP'. How will 'SUPER' be written in that language?", o: ["RUPES","RSPES","RSMAM","RMPEU"], e: "Each letter shifted back by its position: B−1=A, A−2=Y, D−3=A; M−1=L, I−2=G, N−3=K, T−4=P. SUPER → S−1=R, U−2=S, P−3=M, E−4=A, R−5=M = RSMAM." },
  { s: REA, q: "Three statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nSome cubs are trucks.\nAll trucks are lanterns.\nNo lanterns are bricks.\n\nConclusions:\nI. Some cubs are lanterns.\nII. Some trucks are not bricks.\nIII. All cubs are trucks.", o: ["All of the conclusions follow","Only conclusion II and III follow","Only conclusion I and III follow","Only conclusion I and II follow"], e: "Some cubs are trucks + all trucks are lanterns → some cubs are lanterns (I ✓). All trucks ⊆ lanterns + no lanterns are bricks → some trucks are not bricks (II ✓). III is not supported." },
  { s: REA, q: "Which number will replace the question mark (?) in the following series?\n\n36, 512, 100, 1728, ?, 4096", o: ["169","2744","196","2197"], e: "Alternating squares and cubes of even numbers: 6²=36, 8³=512, 10²=100, 12³=1728, 14²=196, 16³=4096." },
  { s: REA, q: "'P @ Q' means 'P is the mother of Q'.\n'P & Q' means 'P is the brother of Q'.\n'P # Q' means 'P is the sister of Q'.\n\nIf 'A @ B # C & D @ E # F', then how is A related to E?", o: ["Mother's mother","Mother's brother","Sister","Daughter"], e: "A is mother of B; B sister of C; C brother of D → A is mother of D; D mother of E → A is grandmother of E (mother's mother)." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Social  2. Sober  3. Socks  4. Senile  5. Son  6. Sentiment", o: ["4, 6, 5, 2, 1, 3","4, 6, 2, 3, 1, 5","2, 1, 3, 4, 6, 5","4, 6, 2, 1, 3, 5"], e: "Order: Senile(4), Sentiment(6), Sober(2), Social(1), Socks(3), Son(5) → 4,6,2,1,3,5." },
  { s: REA, q: "Refer to the image for the figure-series question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series to make it logically complete?\n\nTOP, XST, BWX, FAB, ?", o: ["JFE","JEF","IDE","IED"], e: "Each letter advances by 4: T→X→B→F→J; O→S→W→A→E; P→T→X→B→F. Next cluster = JEF." },
  { s: REA, q: "In a certain code language, 'DALLAS' is written as 'EAMLBS' and 'PRAGUE' is written as 'QRBGVE'. How will 'BERLIN' be written in that language?", o: ["DGTNKP","ADQKHM","CESLJN","CFSMJO"], e: "Pattern: positions 1,3,5 shift +1; positions 2,4,6 shift +0. B+1=C, E, R+1=S, L, I+1=J, N → CESLJN." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nJKLO : GHIL :: LJKM : IGHJ :: DOUL : ?", o: ["ARLI","ALRI","LAIR","ALIR"], e: "Each letter shifts back by 3: J−3=G, K−3=H, L−3=I, O−3=L. So D−3=A, O−3=L, U−3=R, L−3=I = ALRI." },
  { s: REA, q: "In a certain code language, 'PROSPEROUS' is written as 'SORPEPSUOR' and 'STATIONARY' is written as 'TATSOIYRAN'. How will 'COMMERCIAL' be written in that language?", o: ["MMOCREALIC","MMOCRELAIC","MMORCELAIC","MMOCERLAIC"], e: "Per source coding pattern, COMMERCIAL → MMOCRELAIC." },
  { s: REA, q: "In a code language, 'she is mother' is coded as 'lim kim nim', 'she likes badminton' is coded as 'lim tim gim', and 'mother plays badminton' is coded as 'nim bim gim'. What is the code for the word 'plays'?", o: ["nim","kim","gim","bim"], e: "Common to eq1 & eq2: 'she' = lim. Common to eq2 & eq3: 'badminton' = gim. Common to eq1 & eq3: 'mother' = nim. So in eq3, 'plays' = bim." },
  { s: REA, q: "In a code language, 'the sun shines bright' is written as '3366', 'summer is here' is written as '624', 'come to the beach' is written as '4235'. What is the code for the phrase 'such a fun filled day' in this language?", o: ["41633","41363","51335","41336"], e: "Each digit = letter count of the corresponding word. such(4), a(1), fun(3), filled(6), day(3) → 41363." },
  { s: REA, q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nNo locks are keys.\nSome keys are passwords.\n\nConclusions:\nI. Some passwords are locks.\nII. All passwords are locks.", o: ["Only conclusion I follows","Both conclusions I and II follow","Only conclusion II follows","Neither conclusion I nor II follows"], e: "Neither conclusion can be definitely concluded from the given statements." },
  { s: REA, q: "Which two numbers (not digits of the numbers), from amongst the given options, should be interchanged to make the given equation correct?\n\n52 ÷ 13 + 6 − 25 ÷ 2 = 17", o: ["6 and 25","13 and 2","13 and 25","6 and 2"], e: "Per response sheet, option 1 (6 and 25)." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nOEST, QGQR, SIOP, ?, WMKL", o: ["VJNO","UKMN","UKJM","VKLN"], e: "1st letter +2: O,Q,S,U,W. 2nd +2: E,G,I,K,M. 3rd −2: S,Q,O,M,K. 4th −2: T,R,P,N,L. Missing = UKMN." },
  { s: REA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "In a certain code language, 'TRIBAL' is written as '112121' and 'CANIPER' is written as '1212121'. How will 'COMFORT' be written in that language?", o: ["1221121","1121211","1211211","1212122"], e: "Vowel = 2, consonant = 1. C(1) O(2) M(1) F(1) O(2) R(1) T(1) = 1211211." },
  { s: REA, q: "In a certain code language, 'RIGOROUS' is written as 'TJIPTPWT' and 'RESPONSE' is written as 'TFUQQOUF'. How will 'REQUIRED' be written in that language?", o: ["TFSVKSGF","TFSVKSEG","TFSVKSGE","TFSRVKSGE"], e: "Pattern alternates +2 and +1: R+2=T, E+1=F, Q+2=S, U+1=V, I+2=K, R+1=S, E+2=G, D+1=E → TFSVKSGE." },
  { s: REA, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\nFirst row: 13, 1, 70\nSecond row: 9, 9, 90\nThird row: 11, ?, 130\n\n(NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into their constituent digits.)", o: ["15","9","8","7"], e: "Pattern: (col1 + col2) × 5 = col3. (13+1)×5=70, (9+9)×5=90, (11+?)×5=130 → ?=15." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nHang in there", o: ["There is no chance","Let go off your stand","Don't give up","Put your ego aside"], e: "'Hang in there' is an encouragement meaning don't give up / persevere." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Kicked","Handicaped","Twisted","Printed"], e: "'Handicaped' is misspelled — correct spelling is 'Handicapped'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nNative", o: ["Foreign","State","Distant","Innate"], e: "'Native' (belonging to a place by birth/origin) — antonym 'Foreign'." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined words in the given sentence.\n\nThe shells that were collected from the seashore are kept on the shelf as a reminder of the place.", o: ["souvenir","solvent","sling","gift"], e: "A 'souvenir' is something kept as a reminder of a place visited." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nAbridge", o: ["Align","Shorten","Combine","Divide"], e: "'Abridge' means to shorten / condense." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Tonsure","Ornate","Mundane","Jwellery"], e: "'Jwellery' is misspelled — correct spelling is 'Jewellery'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nHis wife is expecting a child and we expect some _________ news soon.", o: ["pretty","beautiful","happy","good"], e: "'Good news' is the standard collocation when announcing a baby." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nGo the extra mile", o: ["To show off physical strength","To make an extra effort","To work for long hours","To do rigorous exercise"], e: "'Go the extra mile' means to make an extra effort beyond what is required." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\n________ being a good actor, he is also an amazing singer.", o: ["Also","But","Besides","Beside"], e: "'Besides' means 'in addition to' — fits the additive context." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\n\"Where have you put the medical kit?\" I asked my nephew.", o: ["I asked my nephew where he had put the medical kit.","I asked my nephew where he has put the medical kit.","I asked my nephew that where he had put the medical kit.","I asked my nephew where had he put the medical kit."], e: "Reported wh-question: 'have put' → 'had put'; no inversion; no 'that' before wh-word." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nA gentleman _________ as to what success meant to me.", o: ["featured","impaired","inquired","tailored"], e: "'Inquired' (asked) fits the context of someone asking a question." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nMy brother was being laughed at by them.", o: ["They were laughing at my brother.","They had been laughing at my brother.","They have been laughing at my brother.","They laughed at my brother."], e: "Past-continuous passive 'was being laughed at' → active 'were laughing at'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nMajority", o: ["Produce","Matrimony","Adulthood","Minority"], e: "'Majority' (greater part) — antonym 'Minority'." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nGratification", o: ["Pique","Dejection","Contentedness","Dispiritedness"], e: "'Gratification' (satisfaction) — synonym 'Contentedness'." },
  { s: ENG, q: "Select the correctly spelt word to fill in the blank.\n\nI _________ the idea of my latest project while visiting Goa on a vacation.", o: ["kncieved","cuncieved","quncieved","conceived"], e: "Correct spelling: 'conceived'." },
  { s: ENG, q: "Read the passage and select the most appropriate option to fill in blank no. 1.\n\nWhales and dolphins are (1) _________ to be very unusual creatures.", o: ["contemplated","considered","imagined","maintained"], e: "'Considered to be' is the natural collocation." },
  { s: ENG, q: "Read the passage and select the most appropriate option to fill in blank no. 2.\n\nThe (2) ________ for them being warm-blooded is because of their belonging to the mammal group.", o: ["reason","thought","motive","ground"], e: "'Reason for' fits the explanatory context." },
  { s: ENG, q: "Read the passage and select the most appropriate option to fill in blank no. 3.\n\nThey mostly eat other animals as their (3) ________.", o: ["kill","catch","eat","prey"], e: "'Prey' (animals hunted for food) fits the context." },
  { s: ENG, q: "Read the passage and select the most appropriate option to fill in blank no. 4.\n\nThere are very rare and few dolphins in the world which (4) ________ in fresh water, rivers and lakes.", o: ["exits","settle","life","live"], e: "'Live' (verb meaning to inhabit) is the only grammatical fit." },
  { s: ENG, q: "Read the passage and select the most appropriate option to fill in blank no. 5.\n\nThese animals or marine mammals have many records to their (5) ________.", o: ["debit","praise","approval","credit"], e: "'To their credit' is the standard idiomatic phrase for accomplishments." },
  { s: ENG, q: "Read the passage about Sniffer dog Tucker and detection dogs and answer the question.\n\nWhat is the appropriate title for the passage?", o: ["Importance of Conservation Canines","Dog Euthanasia","Role of Special Dogs","Whale Detection"], e: "The passage discusses how conservation canines are becoming indispensable — the title fits this central idea." },
  { s: ENG, q: "Read the passage about Sniffer dog Tucker and detection dogs and answer the question.\n\nWhat is the summary of the passage?", o: ["Life of a retired conservation canine","The playtime of a conservation canine","The qualities of conservation canines","Life of a Detection Dog"], e: "The passage describes the work, qualities and rescue of detection dogs — broadly the life of a detection dog." },
  { s: ENG, q: "Read the passage about Sniffer dog Tucker and detection dogs and answer the question.\n\nWhat is the theme of the passage?", o: ["The energy levels of conservation canines","The life of conservation canines","The job of conservation canines","The death of conservation canines"], e: "The passage centres on the work conservation canines do — the job of conservation canines." },
  { s: ENG, q: "Read the passage about Sniffer dog Tucker and detection dogs and answer the question.\n\nWhat is the role of conservation canines?", o: ["Play ball games","Find Whales","Sample Detection","Hunt animals"], e: "Per passage: dogs are used for sample detection (e.g., whale faeces) for research." },
  { s: ENG, q: "Read the passage about Sniffer dog Tucker and detection dogs and answer the question.\n\nHow does the dog detect the whale?", o: ["Sniffs whale skin","Listens to whale voices","Watches for whales","Sniffs whale faeces"], e: "Per passage: 'He searches for whale faeces floating on the surface'." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "Refer to the image for the percentage question.", o: ["15%","10%","2%","3%"], e: "Per response sheet, option 2 (10%)." },
  { s: QA, q: "Find the mean proportional of 18 and 50.", o: ["40","30","33","35"], e: "Mean proportional of a and b = √(ab) = √(18×50) = √900 = 30." },
  { s: QA, q: "If the salary of 16 men for 30 days is Rs.20,736, then what is the salary of 1 man for 15 days?", o: ["Rs.520","Rs.812","Rs.648","Rs.742"], e: "Per man per day = 20736/(16·30) = 43.2. 1 man × 15 days = 43.2 × 15 = Rs.648." },
  { s: QA, q: "At a sale, the goods are on a sale at 45% discount. If Rama buys a skirt marked Rs.600, how much would she need to pay?", o: ["Rs.450","Rs.330","Rs.150","Rs.270"], e: "Pay = 600 × (1 − 0.45) = 600 × 0.55 = Rs.330." },
  { s: QA, q: "The compound interest on 50,000 at the rate of 7% per annum compounded annually, for a certain period of time, is 7,245. Find the time period (in years).", o: ["1","2","2.5","1.5"], e: "50000(1.07)^t − 50000 = 7245 → (1.07)^t = 1.1449 = (1.07)² → t = 2 years." },
  { s: QA, q: "A notebook was sold for 23 with a profit of 15%. If it were sold for 21.25, then what would have been the percentage of profit?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "CP = 23/1.15 = 20. New profit = (21.25 − 20)/20 = 6.25%. Per response sheet, option 2." },
  { s: QA, q: "A five-digit number 58828 is divisible by 77. If we add 5 more than twice of 11 to the number, then the resultant number will be divisible by:", o: ["5","11","7","33"], e: "Add 5 + 2·11 = 27 → 58828 + 27 = 58855. Ends in 5 → divisible by 5." },
  { s: QA, q: "What is the average of 1, 5, 7, 8 and 9?", o: ["7","5","6","4"], e: "Sum = 30. Average = 30/5 = 6." },
  { s: QA, q: "20 men can complete a work in 10 days. Five days after they started working, 5 more men joined them. In how many days will the total work be completed?", o: ["10","12","9","11"], e: "Total work = 200 man-days. After 5 days, 100 done, 100 left. 25 men finish 100 in 4 days. Total = 5 + 4 = 9 days." },
  { s: QA, q: "The cost price of an article is 80% of its marked price. The dealer allows 15% discount on the marked price. Find the gain percentage.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Let MP=100. CP=80. SP=85. Gain% = 5/80·100 = 6.25%. Per response sheet, option 4." },
  { s: QA, q: "If a person's salary increases from Rs.200 per day to Rs.234 per day, what is the percent increase per day in the person's salary?", o: ["17%","16%","15%","14%"], e: "Increase = 34/200 × 100 = 17%." },
  { s: QA, q: "A seven-digit number 5702718 is divisible by 147. If we rearrange the digits of the number in descending order and subtract 4 more than three times of 17 from the new number which is formed, then the resultant number will be divisible by:", o: ["17","11","7","5"], e: "Descending: 8775210. Subtract 4 + 3·17 = 55 → 8775155. Ends in 5 → divisible by 5." },
  { s: QA, q: "Ramesh saves 28% of his salary, while Naresh saves 32%. If both get the same salary and Naresh saves Rs.1,736, what is the expenditure of Ramesh?", o: ["Rs.3,906","Rs.4,736","Rs.3,736","Rs.4,906"], e: "Salary = 1736/0.32 = 5425. Ramesh's expenditure = 0.72 × 5425 = Rs.3,906." },
  { s: QA, q: "Refer to the image for the volume question.", o: ["1241.856 cm³","1249.404 cm³","1218.804 cm³","1239.960 cm³"], e: "Per response sheet, option 1 (1241.856 cm³)." },
  { s: QA, q: "A sum of money doubles itself in 5 years at a certain rate of compound interest. In how many years will it be sixteen times at the same rate?", o: ["15","10","25","20"], e: "16 = 2⁴. Doubling time × 4 = 5 × 4 = 20 years." },
  { s: QA, q: "15 is the mean proportional of 30 and a. Find the value of a.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "15² = 30 · a → 225 = 30a → a = 7.5. Per response sheet, option 1." },
  { s: QA, q: "A regular hexagon is circumscribed by a circle of radius 4.5 cm. What is the area (in cm²) of the hexagon?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Area = (3√3/2)·side² = (3√3/2)·4.5² ≈ 52.6 cm². Per response sheet, option 2." },
  { s: QA, q: "The weight of Anjali is 60 kg. After three months, her weight increased by 20% and in the next three months, it increased by 25%. What will be the weight (in kg) of Anjali after six months?", o: ["100","80","75","90"], e: "60 × 1.20 × 1.25 = 90 kg." },
  { s: QA, q: "A's income is 40% more than that of B and B's income is 20% less than that of C. If C's income is Rs.2,500, find A's income.", o: ["Rs.2,200","Rs.2,500","Rs.2,700","Rs.2,800"], e: "B = 0.8·2500 = 2000. A = 1.4·2000 = Rs.2,800." },
  { s: QA, q: "Two numbers are in the ratio of 5 : 9. If 25 is subtracted from each, the ratio becomes 25 : 49. Find the numbers.", o: ["40, 56","55, 77","45, 63","150, 270"], e: "Let numbers be 5x and 9x. (5x−25)/(9x−25) = 25/49 → 245x − 1225 = 225x − 625 → x = 30. Numbers = 150, 270." },
  { s: QA, q: "By selling an article for Rs.360, a woman incurred a loss of 10%. At what price should she sell it so that she makes a profit of 20%?", o: ["Rs.520","Rs.450","Rs.480","Rs.410"], e: "CP = 360/0.9 = 400. SP for 20% profit = 400 × 1.20 = Rs.480." },
  { s: QA, q: "Manoj completed 30 km of his journey at 6 km/h and the remaining 40 km in 5 hours. His average speed for the whole journey is _________.", o: ["7 km/h","8.5 km/h","7.5 km/h","8 km/h"], e: "Time₁ = 30/6 = 5 h. Total = 70 km in 10 h. Avg = 7 km/h." },
  { s: QA, q: "Tejasvi drove at an average speed of 35 miles/h for the first 35 miles of a trip and then at an average speed of 65 miles/h for the remaining 35 miles of the trip. If she made no stops during the trip, what was her average speed (in miles/h) for the entire trip?", o: ["43.5","46.5","45.5","44.5"], e: "Total time = 35/35 + 35/65 = 1 + 7/13 ≈ 1.538 h. Avg = 70/1.538 ≈ 45.5 mph." },
  { s: QA, q: "A plane in flight from Mumbai to Delhi covers a distance of 1728 km in 180 minutes. What is the speed of the plane (in m/sec)?", o: ["185","140","160","175"], e: "1728 km / 180 min = 9.6 km/min = 9600 m / 60 s = 160 m/s." },
  { s: QA, q: "A farmer counted the heads of the animals and birds on the farm and found it to be 40. When he counted the legs, he found it to be 120. If the farm had either pigeons or horses and nothing else, how many horses were there on the farm? On the farm, each horse had four legs and each pigeon had two legs.", o: ["26","22","24","20"], e: "Let h = horses, p = pigeons. h + p = 40, 4h + 2p = 120. Solving: h = 20." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "The Ministry of Social Justice and Empowerment, Government of India has launched an initiative named 'Ambedkar Social Innovation Incubation Mission (ASIIM)' with an aim to support (1000) innovative ideas till __________.", o: ["2025","2024","2023","2022"], e: "ASIIM (launched 2020) targets supporting 1000 innovative ideas by 2024 through Venture Capital Fund for SC/ST." },
  { s: GA, q: "Which of the following statements is correct?", o: ["Trophic level-4 is never found in the ecosystem.","Trophic level-1 has maximum energy.","Trophic level-3 has no energy.","Trophic level-2 has least energy."], e: "Trophic level 1 (producers) has the maximum energy; energy decreases at each successive level (10% rule)." },
  { s: GA, q: "In which Indian state is the Ranganathittu Bird Sanctuary located?", o: ["Tamil Nadu","Telangana","Kerala","Karnataka"], e: "Ranganathittu Bird Sanctuary is in Mandya district of Karnataka, on the banks of the Cauvery river." },
  { s: GA, q: "As per the 2011 census, which of the following states had the least percentage of Indian population in it?", o: ["Manipur","Sikkim","Mizoram","Meghalaya"], e: "Sikkim had the smallest population (~6.1 lakh, 0.05% of India) among these states per Census 2011." },
  { s: GA, q: "Who gave up the 'Kaiser-e-hind' title in protest of Jallianwala massacre of 1919?", o: ["Abul Kalam Azad","Mahatma Gandhi","BR Ambedkar","Jawaharlal Nehru"], e: "Mahatma Gandhi returned the Kaiser-i-Hind gold medal in 1920 in protest of the Jallianwala Bagh massacre and Khilafat issue." },
  { s: GA, q: "What is the length of a hockey field?", o: ["100 m","90 m","91.4 m","85 m"], e: "Standard hockey field length is 91.4 m (100 yards)." },
  { s: GA, q: "Who among the following sultans of Delhi Sultanate controlled the prices of market goods during his reign?", o: ["Alauddin Khilji","Khizr Khan","Qutubuddin Mubarak Shah","Abu Bakr Shah"], e: "Alauddin Khilji introduced famous market reforms (1296-1316) regulating prices through control over Mandi/Sarai/Adal." },
  { s: GA, q: "'Padmapani Bodhisattva' is a mural painting found in _________ caves.", o: ["Ajanta","Badami","Jogimara","Bhimbetka"], e: "Padmapani Bodhisattva is a famous mural in Cave 1 of the Ajanta caves (Maharashtra), Gupta period." },
  { s: GA, q: "'Doongri' festival is celebrated in which of the following states of India?", o: ["Andhra Pradesh","Kerala","Himachal Pradesh","Odisha"], e: "Doongri Mela is celebrated by Gaddi tribals at the Hidimba Devi temple in Manali, Himachal Pradesh." },
  { s: GA, q: "Which industry in India is its own largest consumer?", o: ["Chemical industry","Cement industry","Automobile industry","Steel industry"], e: "Iron and Steel industry is its own largest consumer — steel is heavily used in steel-making infrastructure, machinery and ancillary plants." },
  { s: GA, q: "Sunlight takes an average of _________ to travel from the Sun to Earth.", o: ["3 minutes and 20 seconds","18 minutes and 45 seconds","8 minutes and 20 seconds","8 hours and 20 minutes"], e: "Light from Sun takes about 8 minutes 20 seconds (~500 seconds) to reach Earth at ~150 million km." },
  { s: GA, q: "Which of the following books is written by Mulk Raj Anand?", o: ["The White Tiger","The Private Life of an Indian Prince","Train to Pakistan","Sea of Poppies"], e: "'The Private Life of an Indian Prince' (1953) is by Mulk Raj Anand. (White Tiger – Adiga, Train to Pakistan – Khushwant Singh, Sea of Poppies – Amitav Ghosh)." },
  { s: GA, q: "The Rajarajeshwara Temple in Tanjore is dedicated to which Hindu deity?", o: ["Brahma","Vishnu","Ganesha","Shiva"], e: "Brihadeeswarar (Rajarajeshwara) Temple at Thanjavur, built by Rajaraja Chola I, is dedicated to Lord Shiva." },
  { s: GA, q: "Which of the following groups is a good conductor of heat?", o: ["Sand, wood and silver","Mercury, wood and sand","Iron, wood and copper","Steel, copper and aluminum"], e: "Steel, copper and aluminum are all metals — good conductors of heat. (Other groups contain wood/sand which are insulators.)" },
  { s: GA, q: "What is the maximum length of a cricket bat?", o: ["13 inches","38 inches","35 inches","36 inches"], e: "Per ICC laws, a cricket bat's maximum length is 38 inches (965 mm)." },
  { s: GA, q: "Arvary Pani Sansad is a watershed management programme in ______.", o: ["Andhra Pradesh","Odisha","Rajasthan","Maharashtra"], e: "Arvary Pani Sansad — a community-led watershed/river management programme in Alwar district of Rajasthan, popularised by Rajendra Singh." },
  { s: GA, q: "Which Constitutional amendment added the words, Socialist and Secular in the Preamble?", o: ["Fortieth Amendment Act, 1976","Forty-first Amendment Act, 1976","Forty-Fourth Amendment Act, 1978","Forty-Second Amendment Act, 1976"], e: "The 42nd Amendment (1976) added 'Socialist', 'Secular' and 'Integrity' to the Preamble." },
  { s: GA, q: "Khan Abdul Ghaffar Khan also known as 'Badshah Khan' or 'Frontier Gandhiji' formed a non-government organisation named as:", o: ["Muslim League","Khudai Khidmatgar","Hindustan Socialist Republican Association","Urdu Defence Association"], e: "Khan Abdul Ghaffar Khan founded the Khudai Khidmatgar (Servants of God) movement in 1929 in NWFP." },
  { s: GA, q: "Among the following, which festival is celebrated by the Jain community?", o: ["Paryushana","Nuakhai","Lohri","Hemis"], e: "Paryushana is the most important annual festival of Jains, observed for 8 (Shvetambara) or 10 (Digambara) days." },
  { s: GA, q: "Which of the following state legislative assembly elections were scheduled in February-March 2022?", o: ["West Bengal","Uttar Pradesh","Assam","Karnataka"], e: "Uttar Pradesh, Punjab, Uttarakhand, Goa and Manipur held elections in Feb–Mar 2022." },
  { s: GA, q: "The Wild Life Protection Amendment Bill 2021 seeking to amend the Wild Life (Protection) Act, _________ for better implementation of Convention on International Trade in Endangered Species of Wild Fauna and Flora (CITES) was introduced in Lok Sabha in December 2021.", o: ["1972","1985","1969","1981"], e: "The original Wild Life (Protection) Act was enacted in 1972." },
  { s: GA, q: "Gendathur village of Mysore (Karnataka) is famous for", o: ["making of dams","development of canal system for irrigation","making artificial rainfall system","development of rainwater harvesting system"], e: "Gendathur is renowned as a model rural rainwater harvesting village (~80% households have systems)." },
  { s: GA, q: "Buddhadev Das Gupta is a famous musician, associated with:", o: ["shehnai","flute","tabla","sarod"], e: "Pandit Buddhadev Das Gupta (1933-2018) was a renowned Indian sarod player of the Senia Shahjahanpur Gharana." },
  { s: GA, q: "Which of the following languages was generally used in Ashoka's inscriptions?", o: ["Prakrit","Pali","Sanskrit","Saka"], e: "Most of Ashoka's edicts were in Prakrit (in Brahmi/Kharoshthi scripts), with a few in Greek and Aramaic." },
  { s: GA, q: "Rukmini Devi Arundale was a dancer of which of the following classical Indian dance forms?", o: ["Sattriya","Bharatanatyam","Odissi","Kathakali"], e: "Rukmini Devi Arundale (1904-1986) was the famous Bharatanatyam exponent and founder of Kalakshetra (Chennai)." }
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

  const TEST_TITLE = 'SSC Selection Post Phase X (Matriculation) - 1 August 2022 Shift-1';
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
