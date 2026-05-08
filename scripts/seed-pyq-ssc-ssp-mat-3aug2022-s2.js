/**
 * Seed: SSC Selection Post Phase X (Matriculation Level) PYQ - 3 August 2022, Shift-2 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-3aug2022-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/03/shift-2/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-3aug2022-s2';

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

const F = '3-august-2022';
// Reasoning Q11 and Q13 are image-based (only image assets in source folder for this paper).
const IMAGE_MAP = {
  11: { q: `${F}-q-11.png`,
        opts: [`${F}-q-11-option-1.png`,`${F}-q-11-option-2.png`,`${F}-q-11-option-3.png`,`${F}-q-11-option-4.png`] },
  13: { q: `${F}-q-13.png`,
        opts: [`${F}-q-13-option-1.png`,`${F}-q-13-option-2.png`,`${F}-q-13-option-3.png`,`${F}-q-13-option-4.png`] }
};

// 1-based answer key (Chosen Options + GK overrides for unanswered/wrong picks).
const KEY = [
  // 1-25 (General Intelligence)
  4,3,2,2,2, 2,3,3,1,2, 4,3,1,1,1, 2,4,3,4,2, 2,3,1,1,1,
  // 26-50 (English Language) — Q4/Q12/Q15/Q20/Q22/Q24 wrong; Q14/Q19/Q23 unanswered overridden
  4,4,4,3,3, 1,1,1,2,1, 4,3,1,3,2, 4,2,3,1,1, 2,4,1,3,4,
  // 51-75 (Quantitative Aptitude) — Q3/Q15/Q19/Q25 unanswered; Q6/Q10 wrong overridden
  1,2,1,1,4, 2,1,1,2,4, 2,3,3,3,2, 3,2,4,4,1, 4,3,3,2,3,
  // 76-100 (General Awareness) — heavy overrides for unanswered / wrong picks
  1,4,1,3,3, 2,4,3,2,2, 1,2,3,2,4, 2,3,4,4,3, 2,3,2,2,3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "Pointing to a girl in a photograph, Kapil said, \"My wife's son is the father of that person.\" How is that person related to Kapil?", o: ["Sister","Daughter","Son's wife","Son's daughter"], e: "Wife's son = Kapil's son. Father of 'that person' = Kapil's son. So 'that person' is Kapil's son's daughter." },
  { s: REA, q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nAll goods are services.\nNo service is a duty.\n\nConclusions:\nI. At least some goods are duties.\nII. No good is a duty.", o: ["Neither conclusion I nor II follows","Only conclusion I follows","Only conclusion II follows","Both conclusions I and II follow"], e: "All goods ⊆ services and no service is a duty ⇒ no good is a duty (II ✓). I contradicts II." },
  { s: REA, q: "In a code language, 'WAITER' is written as '@#6¥3∞', 'HOSTEL' is written as '2$%∞3+' and 'WASHED' is written as '@#%239'. How will 'DRAWS' be written in that language?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Symbol-coded language. Per response sheet, option 2." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nFKSN, HMQL, JOOJ, ?, NSKF", o: ["MRNG","LQMH","MRNH","LQNG"], e: "1st:+2 (F,H,J,L,N). 2nd:+2 (K,M,O,Q,S). 3rd:−2 (S,Q,O,M,K). 4th:−2 (N,L,J,H,F). Missing = LQMH." },
  { s: REA, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\nFirst row: 11, 12, 529\nSecond row: 13, 14, 729\nThird row: 15, 16, ?", o: ["956","961","934","945"], e: "Pattern: (a+b)² = c. (11+12)²=23²=529 ✓; (13+14)²=27²=729 ✓; (15+16)²=31²=961." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order. (From top to Bottom)\n\n1. Feet  2. Hand  3. Head  4. Belly  5. Shoulder", o: ["1, 3, 2, 4, 5","3, 5, 2, 4, 1","2, 3, 5, 4, 1","5, 3, 2, 4, 1"], e: "Top to bottom: Head(3), Shoulder(5), Hand(2), Belly(4), Feet(1) → 3,5,2,4,1." },
  { s: REA, q: "Three statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nSome cats are plates.\nAll plates are tables.\nSome tables are furniture.\n\nConclusions:\nI. Some tables are plates.\nII. Some plates are furniture.\nIII. Some cats are tables.", o: ["Only conclusion I and II follow","All of the conclusions follow","Only conclusion I and III follow","Only conclusion II and III follow"], e: "I follows by conversion of 'all plates are tables'. III follows: cats∩plates ≠ ∅ and plates⊆tables ⇒ some cats are tables. II is not guaranteed." },
  { s: REA, q: "In a code language, 'BROAD' is coded as '40' and 'FLUSH' is coded as '66'. How will 'RICKET' be coded in that language?", o: ["76","61","66","85"], e: "Code = sum of alphabet positions. RICKET: 18+9+3+11+5+20 = 66." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nEUGS, ?, HRJP, KOMM, OKQI", o: ["FTHR","FSIQ","FUGS","FHSQ"], e: "1st: +1,+2,+3,+4 (E,F,H,K,O). 2nd: −1,−2,−3,−4 (U,T,R,O,K). 3rd: +1,+2,+3,+4 (G,H,J,M,Q). 4th: −1,−2,−3,−4 (S,R,P,M,I). Missing = FTHR." },
  { s: REA, q: "Three statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nSome bananas are pears.\nSome pears are grapes.\nAll grapes are sour.\n\nConclusions:\nI. All bananas are grapes.\nII. Some pears are sour.\nIII. Some bananas are grapes.", o: ["Only conclusion I follows","Only conclusion II follows","Only conclusion III follows","None of the conclusions follows"], e: "II follows: some pears are grapes + all grapes are sour ⇒ some pears are sour. I and III do not follow." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nRFTL, ?, VNLH, XRHF, ZVDD", o: ["UKPJ","TJOI","TJPJ","UKOI"], e: "1st:+2 (R,T,V,X,Z). 2nd:+4 (F,J,N,R,V). 3rd:−4 (T,P,L,H,D). 4th:−2 (L,J,H,F,D). Missing = TJPJ." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Which number will replace the question mark (?) in the following series?\n\n8, 16, 48, ?, 960, 5760", o: ["192","240","144","336"], e: "Multiplied by 2,3,4,5,6 in succession. 8×2=16, 16×3=48, 48×4=192, 192×5=960, 960×6=5760." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Geometric  2. Gender  3. Genuine  4. Generous  5. Gene  6. Generator", o: ["2, 5, 6, 4, 3, 1","2, 6, 5, 4, 3, 1","1, 2, 5, 6, 4, 3,","2, 5, 6, 3, 4, 1"], e: "Order: Gender(2), Gene(5), Generator(6), Generous(4), Genuine(3), Geometric(1) → 2,5,6,4,3,1." },
  { s: REA, q: "'A @ B' means 'A is the husband of B'.\n'A & B' means 'A is the mother of B'.\n'A # B' means 'A is the daughter of B'.\n\nIf P & T @ R # S @ W, then how is W related to T?", o: ["Grandmother","Mother-in-law","Mother's sister","Mother's father"], e: "P mother of T; T husband of R; R daughter of S; S husband of W. So W is S's wife = R's mother. R is T's wife ⇒ W is T's mother-in-law." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nHEAVY : YVAEH :: METEOR : ROETEM :: HIGHNESS : ?", o: ["SSNEHGIH","SSENHIGH","SSNEHIGH","SSENHGIH"], e: "Reverse the entire word. HIGHNESS reversed = SSENHGIH." },
  { s: REA, q: "Based on meaning/relevance of the words, Painting is related to Brushes in the same way as Calligraphy is related to ________.", o: ["Music","Maps","Pens","Canvas"], e: "Painting uses Brushes; Calligraphy uses Pens (or specialised pens/nibs)." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nPCXL, ?, TKPH, VOLF, XSHD", o: ["RHSJ","QGTK","QSTJ","RGTJ"], e: "1st:+2 (P,R,T,V,X). 2nd:+4 (C,G,K,O,S). 3rd:−4 (X,T,P,L,H). 4th:−2 (L,J,H,F,D). Missing = RGTJ." },
  { s: REA, q: "In a code language, 'SPORTY' is written as 'UQQSVZ' and 'PLANTS' is written as 'RMCOVT'. How will 'BURDEN' be written in that language?", o: ["DVTFGP","DVTEGO","DWTFGP","DWUEGO"], e: "Alternating shifts +2,+1. B+2=D, U+1=V, R+2=T, D+1=E, E+2=G, N+1=O → DVTEGO." },
  { s: REA, q: "In a code language, 'PLUCK' is coded as '72' and 'GRAZE' is coded as '78'. How will 'CHARTS' be coded in that language?", o: ["73","93","95","85"], e: "Per response sheet, option 2 (93)." },
  { s: REA, q: "Which two numbers (not the digits of the numbers), from amongst the given options, should be interchanged to make the given equation correct?\n\n13 − 36 + 18 × 24 ÷ 6 = 97", o: ["13 and 24","18 and 6","36 and 24","18 and 36"], e: "Swap 36 and 24: 13 − 24 + 18 × 36 ÷ 6 = 13 − 24 + 108 = 97. ✓" },
  { s: REA, q: "In a certain code language, 'BLUE' is written as '160', and 'RED' is written as '81'. How will 'PINK' be written in that language?", o: ["200","204","196","208"], e: "Code = (sum of letter positions) × (number of letters). PINK: (16+9+14+11)×4 = 50×4 = 200." },
  { s: REA, q: "In a certain code language, 'ANGER' is written as 'FRJGS', and 'APPLE' is written as 'FTSNF'. How will 'BRAIN' be written in that language?", o: ["GVDKO","GVCKO","GVDJO","GVDKP"], e: "Successive shifts +5,+4,+3,+2,+1. B+5=G, R+4=V, A+3=D, I+2=K, N+1=O → GVDKO." },
  { s: REA, q: "In a code language, 'PERCH' is written as 'SBTAI' and 'BLANK' is written as 'EICLL'. How will 'GLUES' be written in that language?", o: ["JIWCT","JHXCT","JHWBV","JIXBV"], e: "Alternating shifts +3,−3,+2,−2,+1. G+3=J, L−3=I, U+2=W, E−2=C, S+1=T → JIWCT." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate ANTONYM to replace the italicised word.\n\nThere was no point in trying to conceal the truth now.", o: ["cover","mask","ensconce","reveal"], e: "Antonym of 'conceal' (hide) = 'reveal' (disclose)." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nMeagre", o: ["Satisfactory","Enough","Adequate","Scanty"], e: "'Meagre' (lacking in quantity) — synonym 'Scanty'." },
  { s: ENG, q: "Substitute one word for the italicised expression.\n\nHe did not make perfectly clear what was meant by a significant submission.", o: ["obscure","mystify","conceal","elucidate"], e: "'Make perfectly clear' = 'elucidate' (clearly explain)." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA herd of cattle or animals driven in a body.", o: ["Herd","Grove","Drove","Brood"], e: "'Drove' refers to a herd of animals being moved together." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nCordial", o: ["Antagonistic","Unfriendly","Amicable","Hostile"], e: "'Cordial' (warm, friendly) — synonym 'Amicable'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nLIBERTY", o: ["dependence","independence","free will","freedom"], e: "'Liberty' (freedom) — antonym 'dependence'." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nCan you hope to counting the stars?", o: ["you hope to count","you hope to be counted","you hope to counted","you hope to be count"], e: "'Hope to' takes the base infinitive: 'hope to count'." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nMahabaleshwar is cool than Panchgani.", o: ["is cooler than","is coolest than","is cold than","is cooler then"], e: "Comparative form: 'is cooler than'." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Disappointment","Agrement","Acknowledgement","Excitement"], e: "'Agrement' is misspelled — correct is 'Agreement'." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Heirarchy","Heiress","Ethereal","Notorious"], e: "'Heirarchy' is misspelled — correct is 'Hierarchy'." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe competition was not being taken seriously by her.", o: ["She was not taken the competition seriously","She did not take the competition seriously.","She has not been taking the competition seriously.","She was not taking the competition seriously."], e: "Past-continuous passive 'was not being taken' → active 'was not taking'." },
  { s: ENG, q: "Select the option that expresses the given sentence in reported speech.\n\nShanti said, \"Let us come in.\"", o: ["Shanti said that if they are allowed to come in.","Shanti told that let them be allowed to come in.","Shanti requested that they might be allowed to come in.","Shanti requested me to let them come in."], e: "'Let us...' (a request/suggestion) is reported using 'requested that... might be allowed'." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Reciept","Advantage","Horror","Attitude"], e: "'Reciept' is misspelled — correct is 'Receipt'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nGet your own way", o: ["Allow them to decide how to act, do not control or supervise them","Accept the blame or responsibility alone, even though other people were responsible","Persuade other people to let you do what you want","Do everything they tell you to do, whenever they tell you to do it"], e: "'Get your own way' = succeed in persuading others to let you do what you want." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nBid fair", o: ["Said or done correctly","To seem likely","To pay handsomely","To assume"], e: "'Bid fair' = to seem likely (to do/become something)." },
  { s: ENG, q: "Read the passage about Ashoka and Buddhism, and answer.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'Ashoka ventured out to (1) _________ the city...'", o: ["rename","divide","control","roam"], e: "'Ventured out to roam the city' fits — Ashoka walking through after the war." },
  { s: ENG, q: "Read the passage about Ashoka and Buddhism, and answer.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'he became a (2)__________ of Buddhism.'", o: ["successor","patron","founder","doubter"], e: "Ashoka became a 'patron' (supporter) of Buddhism after the Kalinga war." },
  { s: ENG, q: "Read the passage about Ashoka and Buddhism, and answer.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'led to the (3) __________ of Buddhism in the Mauryan empire'", o: ["modification","condemnation","expansion","emancipation"], e: "'Expansion' (spread / growth) of Buddhism fits the historical context." },
  { s: ENG, q: "Read the passage about Ashoka and Buddhism, and answer.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'social harmony, religious (4) _________ and expansion of the sciences'", o: ["transformation","affiliation","comprehension","apprehension"], e: "'Religious transformation' fits — Mauryan era saw significant religious change/reform." },
  { s: ENG, q: "Read the passage about Ashoka and Buddhism, and answer.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'Ashoka's embrace of Buddhism has been said to have been the (5) _____________ of the reign of social and political peace'", o: ["foundation","retention","accession","drawback"], e: "'Foundation' (basis / starting point) of the era of peace fits the context." },
  { s: ENG, q: "Read the passage about the Gutenberg Bible and Jikji.\n\nThe Mazarin Bible derived its name from the _________.", o: ["Bibliothèque Nationale","Paris Library","Library of Congress","British Library"], e: "Per passage: 'first copy described by bibliographers was located in the Paris library of Cardinal Mazarin'." },
  { s: ENG, q: "Read the passage about the Gutenberg Bible and Jikji.\n\nSelect the most appropriate ANTONYM of the given word.\n\nSimultaneously", o: ["Passionately","Perpetually","Reluctantly","Consecutively"], e: "'Simultaneously' (at the same time) — antonym 'Consecutively' (one after another)." },
  { s: ENG, q: "Read the passage about the Gutenberg Bible and Jikji.\n\nIdentify an appropriate title for the given passage.", o: ["The 42-Line Bible by Gutenberg","The First Printing Press by Gutenberg","The Preservation of Manuscripts","The Bible and Other Contemporary Works"], e: "The passage centres on the Gutenberg Bible (42-line Bible) — its production, features, and surviving copies." },
  { s: ENG, q: "Read the passage about the Gutenberg Bible and Jikji.\n\nWhere was the first printed book published?", o: ["The US","Britain","Korea","Germany"], e: "Per passage: 'Jikji was printed in Korea 78 years before the Gutenberg Bible' — making Korea the location of the earliest movable-type printed book mentioned." },
  { s: ENG, q: "Read the passage about the Gutenberg Bible and Jikji.\n\nWhat is Jikji?", o: ["World's first complete book in the west","Three volume work created by six compositors","'42 line Bible' compiled by Johannes Gutenberg","World's oldest extant movable metal type book"], e: "Per passage: Jikji 'is recognized as the world's oldest extant movable metal type book'." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "An athlete crosses 1200 m distance in 9 minutes. What is his speed (in km/h)?", o: ["8","9","7","6"], e: "Speed = 1.2 km / (9/60) h = 1.2/0.15 = 8 km/h." },
  { s: QA, q: "Arun is going from Delhi to Mumbai for a business trip. He travelled by train to reach Gandhinagar in 16 hours covering a distance of 920 km. After a break of 2 hours, he took another train from the same place to Mumbai, covering the distance in 12 hours. Arun took a total of 30 hours to cover the entire distance of 1478 km. What was the speed (in km/h) of the train going from Gandhinagar to Mumbai?", o: ["39.85","46.5","53.5","49"], e: "Distance Gandhinagar→Mumbai = 1478 − 920 = 558 km. Time = 30 − 16 − 2 = 12 h. Speed = 558/12 = 46.5 km/h." },
  { s: QA, q: "Find the maximum length of a rod, that can be placed in a room of dimension 12 m × 12 m × 14 m.", o: ["22 m","24 m","23 m","21 m"], e: "Diagonal = √(12² + 12² + 14²) = √(144 + 144 + 196) = √484 = 22 m." },
  { s: QA, q: "What is the sum of the mean proportional between 5 and 9.8 and the third proportional to 7 and 14?", o: ["35","32","34","33"], e: "Mean prop of 5 and 9.8 = √(5×9.8) = √49 = 7. Third prop of 7 and 14 = 14²/7 = 28. Sum = 7 + 28 = 35." },
  { s: QA, q: "The third proportional of 5 and 15 is:", o: ["35","40","50","45"], e: "Third proportional = b²/a = 15²/5 = 225/5 = 45." },
  { s: QA, q: "A man borrowed Rs.24,000 and Rs.30,000 at 5% and 9% per annum simple interest, respectively. What amount (in Rs.) will he have to return after 8 years?", o: ["78450","85200","92500","31200"], e: "SI₁ = 24000·5·8/100 = 9600. SI₂ = 30000·9·8/100 = 21600. Total amount = 24000+30000+9600+21600 = 85200." },
  { s: QA, q: "Refer to the image for the question.", o: ["12 years 3 months","15 years 5 months","10 years 6 months","13 years 9 months"], e: "Per response sheet, option 1 (12 years 3 months)." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "A can do a piece of work in 12 days, and B can do the same work in 15 days. With the help of C, they can finish the work in 5 days. How long will it take C to finish the work?", o: ["18 days","20 days","17 days","19 days"], e: "1/A + 1/B + 1/C = 1/5. 1/12 + 1/15 + 1/C = 1/5 ⇒ 9/60 + 1/C = 12/60 ⇒ 1/C = 3/60 = 1/20. C = 20 days." },
  { s: QA, q: "The number of all prime numbers between 0 and 44 is:", o: ["13","12","11","14"], e: "Primes between 0 and 44: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43 — total 14." },
  { s: QA, q: "The valuation of a house depreciates at 10% in a year, compared to its value at the beginning of that year. If the current value of the house is Rs.40,00,000, find what the value of the house will be three years from now.", o: ["Rs.28,00,000","Rs.29,16,000","Rs.29,06,000","Rs.29,26,000"], e: "Value = 40,00,000 × (0.9)³ = 40,00,000 × 0.729 = ₹29,16,000." },
  { s: QA, q: "Shatish sold a music system to Karan at a 25% gain and Karan sold it to Swati at a 30% gain. If Swati paid Rs.12,500 for the music system, what amount did Shatish pay for the same?", o: ["Rs.8,692.31","Rs.6,802.32","Rs.7,692.31","Rs.9,000.35"], e: "Karan's CP = 12500/1.30 ≈ 9615.38. Shatish's CP = 9615.38/1.25 ≈ ₹7,692.31." },
  { s: QA, q: "An article marked for Rs.30,000 is available through two discount schemes. Under scheme 1, successive discounts of 25%, 16% and 15% are offered. Under scheme 2, successive discounts of 20%, 15% and 16% are offered. Find the difference between the selling price under the two schemes.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Scheme 1 SP = 30000·0.75·0.84·0.85 = 16,065. Scheme 2 SP = 30000·0.80·0.85·0.84 = 17,136. Difference = ₹1,071. Per response sheet, option 3." },
  { s: QA, q: "What is the average speed of a car in km/h, if it travels 300 km in 4 h and remaining 150 km in 5 h?", o: ["55","45","50","65"], e: "Avg speed = (300+150)/(4+5) = 450/9 = 50 km/h." },
  { s: QA, q: "In an election, two candidates contested. The winner secured 54% of the votes and won by 256 votes. Find the total number of votes polled if 96 votes were declared invalid?", o: ["3784","3296","3994","3568"], e: "Margin = 8% of valid = 256 ⇒ valid = 3200. Total polled = 3200 + 96 = 3296." },
  { s: QA, q: "Refer to the image for the question.", o: ["Rs.793","Rs.580","Rs.483","Rs.453"], e: "Per response sheet, option 3 (Rs.483)." },
  { s: QA, q: "In an election contested by two candidates, one candidate got 40% of the total votes and still lost by 800 votes, what is the total number of votes cast?", o: ["2500","4000","3550","1550"], e: "Margin = 60%−40% = 20% of total = 800 ⇒ total = 4000." },
  { s: QA, q: "A completes a work in 3 days while B completes it in 6 days. If they work alternately with A starting work first, then in how many days will the work be finished?", o: ["6","7","5","4"], e: "Per day rates: A=1/3, B=1/6. 4-day cycle starting A: 1/3+1/6+1/3+1/6 = 1. Total = 4 days." },
  { s: QA, q: "Sarika bought three shirts for her husband and paid Rs.4,200 for all the three pieces. The shopkeeper gave her a discount of 20% on the total amount. What would be the marked price of one shirt?", o: ["Rs.1,800","Rs.2,150","Rs.1,950","Rs.1,750"], e: "Total MP = 4200/0.80 = 5250. MP per shirt = 5250/3 = ₹1,750." },
  { s: QA, q: "The average of the squares of the natural numbers from 1 to 11 is ______.", o: ["46","506","508","48"], e: "Sum of squares 1²+...+11² = 11·12·23/6 = 506. Average = 506/11 = 46." },
  { s: QA, q: "The radii of the two spheres are in the ratio 4 : 3. What is the ratio between their volumes?", o: ["36 : 27","25 : 64","64 : 36","64 : 27"], e: "Volume ratio = (radius ratio)³ = (4/3)³ = 64/27." },
  { s: QA, q: "If a car covers 80 km in 5 litres of petrol, how much distance (in km) will it cover in 26 litres of petrol?", o: ["417","415","416","418"], e: "Mileage = 80/5 = 16 km/L. Distance = 16 × 26 = 416 km." },
  { s: QA, q: "Rajesh made a profit of 14% when he sold a raincoat for Rs.7,980. Find the cost price of the raincoat.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "CP = 7980/1.14 = ₹7,000. Per response sheet, option 3." },
  { s: QA, q: "The speed of a boat in still water is 15 km/h and the speed of the current is 9 km/h. The distance travelled by the boat downstream in 25 minutes is:", o: ["8 km","10 km","12 km","9 km"], e: "Downstream speed = 15 + 9 = 24 km/h. Distance = 24 × 25/60 = 10 km." },
  { s: QA, q: "Three-fourth students of a class are boys. If 120 girls are added to the class, then three-fourth students of the class would be girls. What percentage increment should be there in the girls to have 40 girls in the class?", o: ["100%","133.33%","166.67%","266.67%"], e: "Original total = 60 (boys 45, girls 15). To reach 40 girls: increment = (40−15)/15 × 100 = 166.67%." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Ashoka sent his son Mahendra to which of the following neighbouring countries to propagate Buddhism in ancient India?", o: ["Sri Lanka","Nepal","Bhutan","Tibet"], e: "Mahendra (Mahinda), son of Ashoka, was sent to Sri Lanka c. 250 BCE to spread Buddhism." },
  { s: GA, q: "Which type of protein is found in milk?", o: ["Pepsin and lipase","Chymotrypsin","Trypsin and amylase","Casein and whey protein"], e: "Milk proteins are casein (~80%) and whey protein (~20%)." },
  { s: GA, q: "In February 2022, the Public Works Department of Delhi Government has decided to dedicate a one-kilometre long stretch in North Delhi to India's Olympics and Para Olympics 2021 champions. What is the name given to this sport-themed stretch?", o: ["Olympic Boulevard","Olympic Town","Olympic Park","Olympic Street"], e: "The stretch was christened 'Olympic Boulevard' to honour India's Olympic and Paralympic medallists." },
  { s: GA, q: "'Waiting for a Visa' is an autobiography of which of the following Indian leaders?", o: ["Rajendra Prasad","Jawaharlal Nehru","Bhimrao Ambedkar","Indira Gandhi"], e: "'Waiting for a Visa' is a short autobiographical work by Dr. B.R. Ambedkar (published posthumously)." },
  { s: GA, q: "'Alarippu' is one of the stages of which of the following Indian classical dances?", o: ["Kathakali","Kuchipudi","Bharatanatyam","Mohiniyattam"], e: "Alarippu is the opening invocatory item in a traditional Bharatanatyam recital." },
  { s: GA, q: "In which of the following countries was the first Winter Olympic Games organised by the IOC?", o: ["Britain","France","Australia","The US"], e: "The first Winter Olympic Games were held in Chamonix, France in 1924." },
  { s: GA, q: "In which of the following years did Muhammad Ghori defeat Prithviraj Chauhan in the second battle of Tarain?", o: ["1180","1199","1173","1192"], e: "The Second Battle of Tarain was fought in 1192; Muhammad Ghori defeated Prithviraj Chauhan III." },
  { s: GA, q: "Which of the following started in August 1942 and was the last nationwide movement led by Mahatma Gandhi against the British Raj in India?", o: ["Civil Disobedience Movement","Non-cooperation Movement","Quit India Movement","Champaran Movement"], e: "The Quit India Movement was launched on 8 August 1942 — Gandhi's last major nationwide movement." },
  { s: GA, q: "Which of the following Stupas is situated in the present-day Madhya Pradesh?", o: ["Ramabhar Stupa","Sanchi Stupa","Kesaria Stupa","Shanti Stupa"], e: "The Sanchi Stupa is located in Raisen district of Madhya Pradesh — a UNESCO World Heritage site." },
  { s: GA, q: "Which of the following options is correctly paired", o: ["Outermost layer of earth – outer core","Innermost layer of earth – Inner core","Innermost layer of earth – Crust","Innermost layer of earth – Mantle"], e: "Earth's innermost layer is the Inner Core (solid iron-nickel)." },
  { s: GA, q: "Which of the following manufacturing industries was set up in Rourkela in 1959, which is in Sundergarh district of Odisha?", o: ["Iron and Steel industry","Textile industry","Cement industry","Chemical industry"], e: "Rourkela Steel Plant (Iron and Steel) was set up in 1959 — India's first integrated steel plant in the public sector." },
  { s: GA, q: "In terms of length and size of the written Constitution among all the countries in the world, what is the rank of the Constitution of India?", o: ["Third","First","Second","Fourth"], e: "The Constitution of India is the longest (most extensive) written constitution of any sovereign nation — ranked first." },
  { s: GA, q: "Who among the following was NOT associated with the 'Trinity of Carnatic Music'?", o: ["Tyagaraja","Shyama Sastri","Annamayya","Muthuswami Dikshitar"], e: "Trinity of Carnatic music: Tyagaraja, Muthuswami Dikshitar, Shyama Sastri. Annamayya (Annamacharya) is a celebrated Telugu composer but not part of the trinity." },
  { s: GA, q: "__________ is a scientific device used to measure atmospheric pressure.", o: ["Thermometer","Barometer","Hydrometer","Electrometer"], e: "Barometer measures atmospheric (air) pressure." },
  { s: GA, q: "Identify the national festival on the basis of the given clues:\ni) India attained freedom on this day.\nii) The Prime Minister gives a speech at the Red Fort in Delhi.", o: ["Mahavir Jayanti","Republic Day","Guru Nanak Jayanti","Independence Day"], e: "Independence Day (15 August) — PM addresses the nation from the Red Fort." },
  { s: GA, q: "On 7 February 2022, which state government launched an open-air classroom for students from class 1 to 7 called 'Paray Shikshalaya'?", o: ["Chhattisgarh","West Bengal","Kerala","Maharashtra"], e: "West Bengal launched 'Paray Shikshalaya' (Neighbourhood Schools) on 7 February 2022 as an open-air primary education initiative." },
  { s: GA, q: "The famous musician RK Bijapure is associated with which musical instrument?", o: ["Pakhawaj","Sarod","Harmonium","Tabla"], e: "Pandit Rambhau Bijapure (RK Bijapure) was a celebrated Harmonium soloist and teacher." },
  { s: GA, q: "In which Indian state is Cold Desert Biosphere Reserve located?", o: ["Uttarakhand","Haryana","Sikkim","Himachal Pradesh"], e: "The Cold Desert Biosphere Reserve is in the Lahaul-Spiti region of Himachal Pradesh." },
  { s: GA, q: "What is the valency of chloride in AlCl₃?", o: ["4","3","2","1"], e: "Chloride (Cl⁻) has a valency of 1; aluminium has valency 3, hence AlCl₃." },
  { s: GA, q: "Bhagat Singh threw a bomb on the Central Legislative Assembly on 8 April 1929 along with who among the following revolutionaries in British India?", o: ["Chandra Shekhar Azad","Shivaram Rajguru","Batukeshwar Dutt","Ashfaq Ulla Khan"], e: "Bhagat Singh and Batukeshwar Dutt threw bombs in the Central Legislative Assembly on 8 April 1929 to protest the Public Safety Bill." },
  { s: GA, q: "Which of the following forts is NOT situated in the Indian state of Rajasthan?", o: ["Nahargarh","Warangal","Kishangarh","Lohagarh"], e: "Warangal Fort is in Telangana. Nahargarh, Kishangarh and Lohagarh are all in Rajasthan." },
  { s: GA, q: "Intensified Mission Indradhanush 4.0, launched by Ministry of Health and Family Welfare on 7 February 2022, will have _________ rounds and will be conducted in 416 districts.", o: ["Four","Five","Three","Two"], e: "Intensified Mission Indradhanush 4.0 was conducted in three rounds across 416 districts." },
  { s: GA, q: "The Constitution of India borrowed the quasi federal structure of government from which country?", o: ["Switzerland","Canada","Australia","United States of America"], e: "India's quasi-federal structure (strong centre with state autonomy) was borrowed from Canada." },
  { s: GA, q: "Rajendra Prasanna plays which musical instrument?", o: ["Veena","Flute","Tabla","Sitar"], e: "Pandit Rajendra Prasanna is a renowned Indian classical Flute (and Shehnai) player from the Banaras gharana." },
  { s: GA, q: "Khajuraho Dance Festival is celebrated in which of the following states of India?", o: ["Gujarat","Uttar Pradesh","Madhya Pradesh","Maharashtra"], e: "The Khajuraho Dance Festival is held annually at the Khajuraho temples in Madhya Pradesh." }
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

  const TEST_TITLE = 'SSC Selection Post Phase X (Matriculation) - 3 August 2022 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-2',
    pyqExamName: 'SSC Selection Post Phase X (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
