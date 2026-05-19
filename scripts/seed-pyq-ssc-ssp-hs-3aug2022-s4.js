/**
 * Seed: SSC Selection Post Phase X (Higher Secondary Level) PYQ - 3 August 2022, Shift-4 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Note: image filenames use '3-aug-2022' convention.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-hs-3aug2022-s4.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/03/shift-4/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-hs-3aug2022-s4';

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

const F = '3-aug-2022';
// REA Q15, Q16, Q17 have full image sets; Q12 question-only.
// QA Q57 (=Q7), Q60 (=Q10), GA Q89 (=GA Q14) are question-image only.
const IMAGE_MAP = {
  12: { q: `${F}-q-12.png` },
  15: { q: `${F}-q-15.png`,
        opts: [`${F}-q-15-option-1.png`,`${F}-q-15-option-2.png`,`${F}-q-15-option-3.png`,`${F}-q-15-option-4.png`] },
  16: { q: `${F}-q-16.png`,
        opts: [`${F}-q-16-option-1.png`,`${F}-q-16-option-2.png`,`${F}-q-16-option-3.png`,`${F}-q-16-option-4.png`] },
  17: { q: `${F}-q-17.png`,
        opts: [`${F}-q-17-option-1.png`,`${F}-q-17-option-2.png`,`${F}-q-17-option-3.png`,`${F}-q-17-option-4.png`] },
  57: { q: `${F}-q-57.png` },
  60: { q: `${F}-q-60.png` },
  89: { q: `${F}-q-89.png` }
};

// 1-based answer key (Chosen Options + GK overrides for unanswered/wrong picks).
const KEY = [
  // 1-25 (General Intelligence) — Q5/Q7 unanswered; Q21/Q22/Q24 overridden
  4,3,3,1,1, 4,4,4,3,2, 1,2,4,1,3, 3,1,3,3,2, 4,4,4,1,4,
  // 26-50 (English Language) — Q6/Q10/Q12/Q18/Q21 wrong; Q7/Q14 unanswered overridden
  3,1,1,3,4, 2,2,2,3,4, 3,4,3,2,1, 1,3,3,3,1, 2,1,3,3,3,
  // 51-75 (Quantitative Aptitude) — Q3/Q8/Q17/Q24 unanswered overridden
  4,4,4,1,3, 3,4,3,4,3, 3,2,1,3,3, 1,3,1,3,1, 4,3,4,4,4,
  // 76-100 (General Awareness) — heavy overrides for unanswered / wrong picks
  4,3,3,1,3, 4,4,2,2,1, 3,4,4,4,1, 4,1,3,3,4, 4,2,2,1,4
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "In this question, three statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusion(s) logically follow(s) from the statements.\n\nStatements:\nAll cakes are pastries.\nSome pastries are chocolates.\nAll chocolates are biscuits.\n\nConclusions:\nI. Some biscuits are pastries.\nII. All cakes are chocolates.", o: ["Only conclusion II follows.","Both conclusions I and II follow.","Neither conclusion I nor II follows.","Only conclusion I follows."], e: "Some pastries are chocolates + all chocolates are biscuits ⇒ some pastries are biscuits ⇒ some biscuits are pastries (I follows). II is too strong." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n17 * 4 * 6 * 2 * 4 = 9", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "In this question, three statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusion(s) logically follow(s) from the statements.\n\nStatements:\nSome mugs are jars.\nAll jars are bottles.\nAll glasses are mugs.\n\nConclusions:\nI. All glasses are jars.\nII. Some glasses are bottles.\nIII. Some mugs are bottles.", o: ["Only conclusions I and III follow.","Only conclusions II and III follow.","Only conclusion III follows.","Only conclusion I follows"], e: "Only III follows: 'Some mugs are jars + all jars are bottles' ⇒ some mugs are bottles. I and II are not supported." },
  { s: REA, q: "In a code language, 'FINGER' is coded as GJOFDQ and 'KIDNEY' is coded as LJEMDX. How will 'MUSCLE' be coded in the same language?", o: ["NVTBKD","MURBKD","NVRBLD","NUTCKD"], e: "First three letters +1; last three letters −1. MUSCLE: M+1=N, U+1=V, S+1=T, C−1=B, L−1=K, E−1=D → NVTBKD." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nGARLIC : IZTNHE :: ONIONS : NPHNPU :: CARROT : ?", o: ["EZTTNV","EATTNV","BBQQPU","EZTTPV"], e: "Consonants shift +2, vowels shift −1. CARROT: C+2=E, A−1=Z, R+2=T, R+2=T, O−1=N, T+2=V → EZTTNV." },
  { s: REA, q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets.\n\n(31, 4, 47)\n(17, 8, 81)", o: ["(19, 11, 41)","(2, 12, 16)","(23, 7, 30)","(19, 5, 44)"], e: "Pattern: c = a + b². 31+16=47 ✓; 17+64=81 ✓; (19, 5, 44): 19+25 = 44 ✓." },
  { s: REA, q: "In a code language, 'ROSE' is coded as 228 and 'TULIP' is coded as 390. How will 'DAHLIA' be coded in the same language?", o: ["140","105","320","210"], e: "Code = (sum of letter positions) × (number of letters). DAHLIA: (4+1+8+12+9+1) × 6 = 35 × 6 = 210." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nGEA, IFB, LHA, QKB, XOA, ?", o: ["ISB","HUB","HTB","ITB"], e: "1st letter shifts by primes +2,+3,+5,+7,+11 (G,I,L,Q,X,I). 2nd letter diffs +1,+2,+3,+4,+5 (E,F,H,K,O,T). 3rd letter alternates A,B,A,B,A,B. Missing = ITB." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nMOBILE : CPNFMJ :: PHONES : PIQTFO :: CHARGE : ?", o: ["BIFDHS","BIDFSH","BIDFHS","BIEFHS"], e: "Per response sheet, option 3 (BIDFHS)." },
  { s: REA, q: "In a code language, 'COUCH' is coded as FLXZK and 'TABLE' is coded as WXEIH. How will 'CHAIR' be coded in the same language?", o: ["FEDEU","FEDFU","EFDEU","EFDFV"], e: "Alternating shifts +3,−3. CHAIR: C+3=F, H−3=E, A+3=D, I−3=F, R+3=U → FEDFU." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nJV, MU, OT, RS, TR, ?", o: ["WQ","XQ","YQ","WR"], e: "1st letter diffs +3,+2,+3,+2,+3 (J,M,O,R,T,W). 2nd letter −1 (V,U,T,S,R,Q). Missing = WQ." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["C","D","F","A"], e: "Per response sheet, option 2 (D)." },
  { s: REA, q: "In a certain code language, 'TEA' is coded as 78, and 'SHAKE' is coded as 220. How will 'COFFEE' be coded in that language?", o: ["200","340","160","240"], e: "Code = (sum of letter positions) × (number of letters). COFFEE: (3+15+6+6+5+5) × 6 = 40 × 6 = 240." },
  { s: REA, q: "In a code language, 'CAKE' is coded as 64, and 'WAFER' is coded as 125. How will 'BISCUIT' be coded in the same language?", o: ["343","210","392","255"], e: "Code = (number of letters)³. CAKE(4)=64; WAFER(5)=125; BISCUIT(7)=7³ = 343." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "'P @ Q' means 'P is the husband of Q'.\n'P & Q' means 'P is the wife of Q'.\n'P % Q' means 'P is the mother of Q'.\n'P # Q' means 'P is the father of Q'.\n\nIf 'R @ S % T & U # V', then how is R related to U?", o: ["Father's father","Father","Father-in-law","Brother"], e: "R is husband of S; S is mother of T ⇒ R is father of T. T is wife of U ⇒ U is T's husband ⇒ R is U's father-in-law." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. Lung  2. Kidney  3. Tongue  4. Eyes  5. Nose", o: ["2, 5, 4, 3, 1","2, 3, 5, 1, 4","2, 1, 3, 5, 4","3, 1, 2, 4, 5"], e: "Per response sheet, option 3 (2,1,3,5,4)." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Imperceptible  2. Imperialism  3. Impersonal  4. Imperative  5. Imperfect", o: ["3, 5, 1, 4, 2","4, 1, 5, 2, 3","2, 4, 5, 1, 3","1, 2, 3, 4, 5"], e: "Order: Imperative(4), Imperceptible(1), Imperfect(5), Imperialism(2), Impersonal(3) → 4,1,5,2,3." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nHOUSE : GRPUF :: LOTUS : KROWT :: LEMON : ?", o: ["LIHQO","LHHQO","KIHQO","KHHQO"], e: "Shifts −1,+3,−5,+2,+1. LEMON: L−1=K, E+3=H, M−5=H, O+2=Q, N+1=O → KHHQO." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nBELL : IOBE :: STOP : MRQV :: ARCS : ?", o: ["PFOD","PFNC","QGOD","QGNC"], e: "Per response sheet logic — symmetric shifts pattern. ARCS → QGNC." },
  { s: REA, q: "I is the father of L. L and K are the children of M. L is the husband of N. O is the husband of K. P is the son of O. How is I related to P?", o: ["Father","Brother","Father's father","Mother's father"], e: "I is father of L and K (siblings, children of M). K is mother of P (married to O). So I is P's mother's father." },
  { s: REA, q: "In a certain code language, 'FINAL' is written as 'GHPNY' and 'VISIT' is written as 'GXUVG'. How will 'GROUP' be written in that language?", o: ["IEMWS","PISMR","PIRMS","PIQRS"], e: "Per response sheet, option 1 (IEMWS) (default)." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n213, 199, 235, 221, 257, 243, ?", o: ["271","265","281","279"], e: "Alternating −14, +36. 243 + 36 = 279." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nRaman said, \"Let us enjoy some snacks.\"", o: ["Raman said that they will enjoy some snacks.","Raman proposed that they should enjoy some snacks.","Raman suggested that let they be enjoyed some snacks.","Raman said that let us enjoy some snacks."], e: "'Let us X' is reported with 'proposed/suggested that... should X'." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Capasity","Library","Advocate","Imagination"], e: "'Capasity' is misspelled — correct is 'Capacity'." },
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order to form a meaningful and coherent paragraph.\n\nA. He had a tiny room in a basement, the one window of which looked out on to the street.\nB. There was hardly a pair of boots in the neighbourhood that had not been once or twice through his hands.\nC. In a certain town there lived a cobbler, Martin Avdeitch by name.\nD. Through it one could see the feet of those who passed by, but Martin recognised the people by their boots.", o: ["CADB","CBDA","CDBA","CABD"], e: "C (cobbler intro) → A (tiny room) → D (window/feet) → B (boots through hands) = CADB." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nSunny's parents said to her, \"Do not take anything from strangers.\"", o: ["Sunny's parents asked her do not take anything from strangers.","Sunny's parents said to her that do not take anything from strangers.","Sunny's parents advised her not to take anything from strangers.","Sunny's parents told to her not to take anything from strangers."], e: "Negative imperative reported with 'advised/told not to...'." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nI asked two people the way to Diana's house but no one of them knew it.", o: ["whether either of them knew it","if none of them knew it","that no one of them knew it","but neither of them knew it"], e: "For two people, the correct negation is 'neither of them' (not 'no one')." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nFrail", o: ["Brittle","Stout","Horrible","Precarious"], e: "'Frail' (weak / delicate) — antonym 'Stout' (strong / sturdy)." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined word in a sentence.\n\nHe appealed to the laws of the land to vindicate from his assailants.", o: ["prove","exonerate","banish","assess"], e: "'Vindicate' = clear of blame / exonerate / prove innocent." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nI'll try to phone you in the meeting.", o: ["at the meeting","during the meeting","in meeting","No substitution required"], e: "'During the meeting' is the correct preposition for the time-period reference." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nShe said that she had already eaten her dinner.", o: ["She said, \"I am already eating my dinner.\"","She said, \"I had my dinner.\"","She said, \"I have already eaten my dinner.\"","She said, \"I had already ate my dinner.\""], e: "Reported past perfect 'had already eaten' → direct present perfect 'have already eaten'." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence.\n\nThe magazine teaches parents how to behaves towards children.", o: ["how should behave towards their","how will behave towards","how to behaving their","how to behave towards"], e: "'How to' takes a base infinitive: 'how to behave towards'." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nWhat makes you nervous before exams?", o: ["Why exams are making you nervous?","Why do exams make you nervous?","By what are you made nervous before exams?","How is nervousness caused before exams?"], e: "Active 'What makes you nervous' → passive 'By what are you made nervous'." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom.\n\nHis grandfather always laughs like a drain.", o: ["Laugh bitterly","Laugh fearfully","Laugh silently","Laugh loudly"], e: "'Laugh like a drain' = to laugh very loudly / heartily." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom in the given sentence.\n\nIn his speech on dowry, he set forth his views at length.", o: ["ran","started","explained","hid"], e: "'Set forth' = to explain / present / put forward in detail." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nOne who is extravagantly romantic, chivalrous and impractical.", o: ["Blonde","Quixotic","Teetotaler","Virago"], e: "'Quixotic' (from Don Quixote) = exceedingly idealistic, romantic and impractical." },
  { s: ENG, q: "Select the correct superlative degree of comparison for the given sentence.\n\nThis is one of the beautiful places in the area.", o: ["This is one of the most beautiful places in the area.","This is one of the more beautiful places in the area.","This is one of the beautiful places in the area.","This is a beautiful place in the area."], e: "Superlative of 'beautiful' is 'most beautiful'." },
  { s: ENG, q: "Read the passage about Rosie the dancer and Marco Polo, and answer.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'Thousands of persons must (1) __________ the same thing to her since'", o: ["have said","says","saying","said"], e: "'Must have said' (must + have + past participle) for past necessity." },
  { s: ENG, q: "Read the passage about Rosie the dancer and Marco Polo, and answer.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'They like (2) __________ every hour of the day how well they keep their steps.'", o: ["told","tell","to be told","to have told"], e: "'Like to be told' — passive infinitive after 'like'." },
  { s: ENG, q: "Read the passage about Rosie the dancer and Marco Polo, and answer.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'whenever I could (3) ___________ alone with her'", o: ["snatches a moment","snatched a moment","snatch a moment","have snatched a moment"], e: "After 'could', the base infinitive 'snatch a moment' is used." },
  { s: ENG, q: "Read the passage about Rosie the dancer and Marco Polo, and answer.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'she could more logically (4) ____________ him Marco Polo.'", o: ["called","had called","have called","been called"], e: "'Could + have + past participle' — modal perfect: 'have called'." },
  { s: ENG, q: "Read the passage about Rosie the dancer and Marco Polo, and answer.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'I wanted to call this man Marco (5) ___________'", o: ["at first sight","over first sight","on first sight","in first sight"], e: "'At first sight' is the standard idiomatic preposition." },
  { s: ENG, q: "Read the passage about Rao's hidden documents, and answer.\n\nWhich of the following is most nearly similar in meaning to the phrase 'Odds and ends' as used in the passage?", o: ["Lost items of different types","Various things of different types","Precious items of different types","Rare items of different types"], e: "'Odds and ends' = various miscellaneous items / odd small things of different types." },
  { s: ENG, q: "Read the passage about Rao's hidden documents, and answer.\n\nWhat sort of papers were considered important by Rao?", o: ["Title-deeds, diaries, papers and a will","Love letters","Bank passbooks","Share market papers"], e: "Per passage: 'documents — title-deeds, diaries, papers and a will'." },
  { s: ENG, q: "Read the passage about Rao's hidden documents, and answer.\n\nWhich of the following is the most appropriate word to substitute the word 'stacked' as used in the passage?", o: ["Removed","Torn","Piled","Spoiled"], e: "'Stacked' = piled / arranged in stacks." },
  { s: ENG, q: "Read the passage about Rao's hidden documents, and answer.\n\nHow did Rao ensure the safety of his important papers?", o: ["By putting them in the custody of his wife","By stacking them in a bank lockup","By stacking them in an almirah with lock and key","By getting them laminated"], e: "Per passage: he kept them in a locked almirah, with the key hidden under a paper lining in another locked cupboard." },
  { s: ENG, q: "Read the passage about Rao's hidden documents, and answer.\n\nWhich of the following is most nearly similar in meaning to the word 'Access' as used in the passage?", o: ["To be able to decrease something","To be able to increase something","To be able to obtain something","To be able to overpower"], e: "'Access' = the ability to reach / obtain / approach something." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "Refer to the image for the question.", o: ["14","8","6","2"], e: "Per response sheet, option 4 (2)." },
  { s: QA, q: "Two pipes X and Y can fill a tank in 12 minutes and 18 minutes, respectively. If both the pipes are opened simultaneously, how long will it take to fill the tank?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Together = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 minutes (= 7 min 12 sec). Per response sheet, option 4." },
  { s: QA, q: "A car travels at a speed of 40 km/h for 15 minutes and at a speed of 72 km/h for the next 5 minutes. The average speed of the car for the whole journey is:", o: ["43 km/h","41 km/h","45 km/h","48 km/h"], e: "Total dist = 40·(15/60) + 72·(5/60) = 10 + 6 = 16 km. Total time = 20 min = 1/3 h. Avg = 16·3 = 48 km/h." },
  { s: QA, q: "A sum of Rs.2,400 is divided among A, B and C such that A receives 25% less than B and B receives 20% less than C. The ratio between A's amount and B's amount is:", o: ["3 : 4","5 : 4","4 : 5","3 : 5"], e: "A = 0.75 B ⇒ A:B = 0.75:1 = 3:4." },
  { s: QA, q: "A car is sold on for successive discounts of 10%, 12%, 15% and 20%. If the selling price of the car is Rs.1,68,300, then what is the marked price of the car?", o: ["Rs.4,25,600","Rs.4,12,800","Rs.3,12,500","Rs.5,11,600"], e: "Net factor = 0.90·0.88·0.85·0.80 = 0.53856. MP = 168300/0.53856 = ₹3,12,500." },
  { s: QA, q: "X can complete a work in 5 days and Y in 10 days. If they work on it together for 2 days, then the fraction of the work that is left is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Together rate = 1/5 + 1/10 = 3/10 per day. In 2 days = 6/10 = 3/5. Left = 2/5. Per response sheet, option 3." },
  { s: QA, q: "Refer to the image for the percentage question.", o: ["90.6 Percent","84.8 Percent","86.9 Percent","88.5 Percent"], e: "Per response sheet, option 4 (88.5 Percent)." },
  { s: QA, q: "A chord of a circle of radius 21 cm makes a right angle at the centre. Find the area of major segment (take π = 22/7) closest to nearest integer.", o: ["1360 cm²","1436 cm²","1260 cm²","1160 cm²"], e: "Quadrant area = πr²/4 = 22·441/(7·4) = 346.5. Triangle area = (1/2)·r² = 220.5. Minor segment = 346.5 − 220.5 = 126. Major = πr² − 126 = 1386 − 126 = 1260 cm²." },
  { s: QA, q: "A girl, 4 feet tall can cast a shadow on the ground that is 5 feet long. How tall is a boy who can cast a shadow that is 10 feet long?", o: ["7 feet","5 feet","6 feet","8 feet"], e: "Height/Shadow ratio = 4/5. Boy: height = 10 × 4/5 = 8 feet." },
  { s: QA, q: "Refer to the image for the ratio question.", o: ["1 : 3","3 : 1","1 : 1","2 : 1"], e: "Per response sheet, option 3 (1 : 1)." },
  { s: QA, q: "A seller sells oranges at the rate of 10 for Rs.28, gaining thereby 40%. For how much did he buy a dozen oranges?", o: ["Rs.20","Rs.28","Rs.24","Rs.48"], e: "SP/orange = 2.8. CP/orange = 2.8/1.4 = 2. Dozen CP = 12 × 2 = ₹24." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "The length of the tangent to a circle from a point P, is 17 cm. Point P is 20 cm away from the centre. What is the radius of the circle?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "r² + 17² = 20² ⇒ r² = 400 − 289 = 111 ⇒ r ≈ 10.54 cm. Per response sheet, option 1." },
  { s: QA, q: "Refer to the image for the question.", o: ["1,264 approx.","1,432 approx.","1,685 approx.","1,543 approx."], e: "Per response sheet, option 3 (1,685 approx.)." },
  { s: QA, q: "Raj's monthly income was Rs.12,000 and his monthly expenditure was Rs.8,500. Next year his income increased by 10% and his expenditure increased by 10%. What was the percentage increase or decrease in his savings?", o: ["20% decrease","10% decrease","10% increase","20% increase"], e: "When both income and expenditure increase by the same %, savings also increase by the same % = 10%." },
  { s: QA, q: "The average age of the father and his five children is 10 years which is decreased by 6 years if the age of the father is excluded. The age of the father is:", o: ["40 years","45 years","37 years","25 years"], e: "Total = 6·10 = 60. Children avg = 4 ⇒ children sum = 20. Father = 60 − 20 = 40 years." },
  { s: QA, q: "A retailer marks up the price of his goods by 30%. He sells 50% of his goods at a discount of 8% and the remaining at a discount of 6%. Find his profit percentage.", o: ["13.2%","19.4%","20.9%","17.6%"], e: "CP=100. MP=130. Half at 8% off: 0.5·130·0.92 = 59.8. Half at 6% off: 0.5·130·0.94 = 61.1. Total SP = 120.9. Profit% = 20.9%." },
  { s: QA, q: "A thief steals a scooter at 1:40 p.m. and drives it at 54 km/h. The theft is discovered at 2:10 p.m. and the owner sets off to chase the thief on another scooter at 72 km/h. At what time will he catch the thief?", o: ["3:40 p.m.","4:10 p.m.","4:50 p.m.","3:20 p.m."], e: "Lead at 2:10 PM = 27 km. Relative speed = 18 km/h. Time to catch = 27/18 = 1.5 h. Catch at 2:10 + 1:30 = 3:40 PM." },
  { s: QA, q: "Refer to the image for the question.", o: ["16","18","17","27"], e: "Per response sheet, option 3 (17)." },
  { s: QA, q: "If a man deposits Rs.12,100 in a bank at a simple interest of 15% per annum, then how much money will he receive from the bank after 3 years?", o: ["Rs.17,545","Rs.16,520","Rs.15,115","Rs.17,200"], e: "Amount = 12100 + 12100·0.15·3 = 12100 + 5445 = ₹17,545." },
  { s: QA, q: "A student obtained 72 marks in Biology, 84 marks in Hindi, 91 marks in Mathematics, 80 marks in Science and 73 marks in English (out of 100). Find his average marks.", o: ["65","70","60","80"], e: "Sum = 72+84+91+80+73 = 400. Average = 400/5 = 80." },
  { s: QA, q: "Find the fourth proportional to m + 3, m + 7 and 15m if m = 3.", o: ["58","50","75","62"], e: "With m=3: (m+3)=6, (m+7)=10, 15m=45. Fourth proportional = (10·45)/6 = 75." },
  { s: QA, q: "A cuboid of length 18m, breadth 12m, and height 8m is melted and recast into a cube. Find the length of diagonal of the cube.", o: ["8√3 m","9√3 m","18√3 m","12√3 m"], e: "Volume = 18·12·8 = 1728 m³ ⇒ cube side = ∛1728 = 12 m. Diagonal = 12√3 m." },
  { s: QA, q: "If the product 6352 × 7A1 is divisible by 12, then the value of A is:", o: ["6","3","5","4"], e: "6352 is divisible by 4 (last two digits 52). For divisibility by 12 (also need 3): 7+A+1 = 8+A must be div by 3. A=4 ⇒ 12 ✓." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "The name of which chemical element of group 1 was discovered in 1817 from the Greek word meaning stone?", o: ["Sodium","Potassium","Hydrogen","Lithium"], e: "Lithium was discovered in 1817 by J. A. Arfwedson; its name comes from the Greek 'lithos' meaning stone." },
  { s: GA, q: "Cooperative sector industries are operated by producers and suppliers of raw material. Which of the following is an example of a cooperative sector industry?", o: ["BHEL","TISCO","Sugar industry","Oil India Ltd."], e: "Sugar industry in India is largely organised under the cooperative sector (run by farmer cooperatives). BHEL, TISCO, Oil India are public/private sector." },
  { s: GA, q: "Who among the following leaders was known as 'Deshbandhu'?", o: ["Balashastri Jambhekar","Gopalhari Deshmukh","Chittaranjan Das","Bal Gangadhar Tilak"], e: "Chittaranjan Das (C. R. Das) was popularly known as 'Deshbandhu' (Friend of the Country)." },
  { s: GA, q: "How many members are there in the Committee on Public Undertakings in India?", o: ["22","15","35","30"], e: "The Committee on Public Undertakings has 22 members — 15 from Lok Sabha and 7 from Rajya Sabha." },
  { s: GA, q: "Under which Amendment to the Constitution Act was the reservation for OBCs in educational institutions made?", o: ["95th Amendment","94th Amendment","93rd Amendment","96th Amendment"], e: "The 93rd Constitutional Amendment Act, 2005 enabled reservation for OBCs in educational institutions (including private)." },
  { s: GA, q: "The tomb of Sher Shah Suri is located at which of the following places?", o: ["Patna","Shergarh","Hyderabad","Sasaram"], e: "Sher Shah Suri's tomb is at Sasaram, Bihar — a notable example of Indo-Islamic architecture." },
  { s: GA, q: "_______ union territory has the highest literacy rate as per 2011 census.", o: ["Pondicherry","Chandigarh","Andaman and Nicobar Islands","Lakshadweep"], e: "Per Census 2011, Lakshadweep had the highest literacy rate among Union Territories (91.85%)." },
  { s: GA, q: "Which of the following is a micronutrient, and plays a role in cell division, cell growth, wound healing and the breakdown of carbohydrates?", o: ["Fe","Zn","Cu","Ca"], e: "Zinc (Zn) is a micronutrient essential for cell division, growth, immune function, and carbohydrate metabolism." },
  { s: GA, q: "By whom among the following personalities who lived in the White House is 'Living History' a famous book written?", o: ["Ivanka Trump","Hillary Rodham Clinton","Laura Bush","Melania Trump"], e: "'Living History' (2003) is the memoir of Hillary Rodham Clinton covering her years as First Lady." },
  { s: GA, q: "Tsunami is NOT caused by:", o: ["Hurricanes","volcanic eruptions","undersea landsides","Earthquakes"], e: "Tsunamis are caused by earthquakes, underwater landslides and volcanic eruptions — NOT by hurricanes (which cause storm surges)." },
  { s: GA, q: "Macaulay's Minute on Education was passed in:", o: ["1837","1834","1835","1832"], e: "Lord Macaulay's famous 'Minute on Indian Education' was passed in February 1835, leading to English education in India." },
  { s: GA, q: "Who among the following appoints the Governor of State?", o: ["The Vice President","The Prime Minister","The Attorney General","The President"], e: "Per Article 155, the Governor of a State is appointed by the President of India." },
  { s: GA, q: "Manika Batra won the 82nd Senior National Table Tennis Championship (Female Category) held at Panchkula in ___________ 2021.", o: ["September","June","February","April"], e: "The 82nd Senior National Table Tennis Championships was held at Panchkula in late March / early April 2021." },
  { s: GA, q: "Which Union Territory's appropriation Bill passed in Lok Sabha in 2021 allowed the Central Government to authorise payment and appropriation of certain further sums from and out of the Consolidated Fund of the said Union Territory for the services of the financial year 2020-21?", o: ["Lakshadweep","Chandigarh","Delhi","Puducherry"], e: "The Puducherry Appropriation Bill, 2021 was passed in Lok Sabha (Puducherry was under President's Rule at the time)." },
  { s: GA, q: "Rana Pratap Singh fought against the Mughals at ________ in 1576.", o: ["Haldighati","Chittor","Ranakpur","Kumbhalgarh"], e: "The Battle of Haldighati was fought between Maharana Pratap of Mewar and Akbar's Mughal forces (led by Man Singh) on 18 June 1576." },
  { s: GA, q: "Which state showed the lowest levels of poverty, according to the Multidimensional Poverty Index 2021?", o: ["Mizoram","Goa","Punjab","Kerala"], e: "Per NITI Aayog's National MPI 2021 report, Kerala had the lowest multidimensional poverty rate (0.71%)." },
  { s: GA, q: "Who among the following was defeated by Prithviraj Chauhan in the first battle of Tarain?", o: ["Muhammad Ghori","Mahmud Ghazni","Iltutmish","Qutbuddin Aibak"], e: "In the First Battle of Tarain (1191), Prithviraj Chauhan defeated Muhammad Ghori. Ghori avenged this loss the next year." },
  { s: GA, q: "Who among the following released a signature tune for 'Vande Bharatam' in March 2022?", o: ["Smriti Zubin Irani","Pratima Bhowmik","Meenakshi Lekhi","Anupriya Patel"], e: "MoS Culture Smt. Meenakshi Lekhi released the signature tune for 'Vande Bharatam' Nritya Utsav in March 2022 as part of Azadi ka Amrit Mahotsav." },
  { s: GA, q: "In April 2021, __________ was selected for the award instituted by the Pookkad Kalalayam in Kozhikode, in memory of noted musician Malabar Sukumaran Bhagavathar in recognition of her comprehensive contribution to classical dance.", o: ["Srirangam Gopalaratnam","Bhanupriya","Sreelakshmy Govardhanan","P Ramadevi"], e: "Sreelakshmy Govardhanan, a renowned Kuchipudi dancer, received the Pookkad Kalalayam Award in April 2021." },
  { s: GA, q: "Mozzarella, cheddar and camembert are varieties of:", o: ["yoghurt","vinegar","bread","cheese"], e: "Mozzarella, Cheddar and Camembert are all varieties of cheese." },
  { s: GA, q: "The language of the Aryan texts was:", o: ["Ardh-Magadha Prakrit","Prakrit","Persian","Sanskrit"], e: "The earliest Aryan / Vedic texts (Rigveda etc.) were composed in Sanskrit (Vedic Sanskrit)." },
  { s: GA, q: "Which river was known as the 'Sorrow of Bengal'?", o: ["Ganga","Damodar","Yamuna","Kosi"], e: "The Damodar river (West Bengal/Jharkhand) was historically called the 'Sorrow of Bengal' due to its devastating floods." },
  { s: GA, q: "Who among the following personalities is an exponent of the Manipuri dance form?", o: ["Kumudini Lakhia","Rajkumar Singhajit Singh","MK Saroja","Makar Dhwaja Darogha"], e: "Rajkumar Singhajit Singh is a Padma Shri / Padma Bhushan awardee and a renowned Manipuri dance exponent." },
  { s: GA, q: "On 8 February 2009, for the 51st Grammy Awards, ___________ won in the category Contemporary World Music Album for his collaborative album Global Drum Project along with Mickey Hart, Sikiru Adepoju and Giovanni Hidalgo.", o: ["Zakir Hussain","Anindo Chatterjee","Kumar Bose","Swapan Chaudhuri"], e: "Ustad Zakir Hussain (with Mickey Hart, Sikiru Adepoju, Giovanni Hidalgo) won the 51st Grammy (2009) for 'Global Drum Project'." },
  { s: GA, q: "The first Republic Day parade was held in which of the following years?", o: ["1952","1951","1949","1950"], e: "India's first Republic Day parade was held on 26 January 1950 (after the Constitution came into effect)." }
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
      tags: ['SSC', 'Selection Post', 'Phase X', 'Higher Secondary', 'PYQ', '2022'],
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
      description: 'Staff Selection Commission - Selection Post Phase X (Higher Secondary Level - 12th-pass eligibility)',
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

  const TEST_TITLE = 'SSC Selection Post Phase X (Higher Secondary) - 3 August 2022 Shift-4';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-4',
    pyqExamName: 'SSC Selection Post Phase X (Higher Secondary)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
