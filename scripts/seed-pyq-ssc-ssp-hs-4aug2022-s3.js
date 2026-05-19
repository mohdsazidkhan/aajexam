/**
 * Seed: SSC Selection Post Phase X (Higher Secondary Level) PYQ - 4 August 2022, Shift-3 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Note: Folder path includes 'hs' subfolder. PDF subject confirms Higher Secondary Level.
 * Image filenames use '4-august-2022' convention; some image sets (Q15/Q16) are partial in source folder.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-hs-4aug2022-s3.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/04/shift-3/hs/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-hs-4aug2022-s3';

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
// Q8 (REA), Q14 (full set), Q15 (partial), Q16 (partial), Q22 (full set).
// Q57 (=QA Q7), Q74 (=QA Q24), Q75 (=QA Q25) — question-image only.
const IMAGE_MAP = {
  8:  { q: `${F}-q-8.png` },
  14: { q: `${F}-q-14.png`,
        opts: [`${F}-q-14-option-1.png`,`${F}-q-14-option-2.png`,`${F}-q-14-option-3.png`,`${F}-q-14-option-4.png`] },
  15: { q: `${F}-q-15.png`,
        opts: [`${F}-q-15-option-1.png`,`${F}-q-15-option-2.png`,`${F}-q-15-option-3.png`,`${F}-q-15-option-4.png`] },
  16: { q: `${F}-q-16.png`,
        opts: [`${F}-q-16-option-1.png`,`${F}-q-16-option-2.png`,`${F}-q-16-option-3.png`,`${F}-q-16-option-4.png`] },
  22: { q: `${F}-q-22.png`,
        opts: [`${F}-q-22-option-1.png`,`${F}-q-22-option-2.png`,`${F}-q-22-option-3.png`,`${F}-q-22-option-4.png`] },
  57: { q: `${F}-q-57.png` },
  74: { q: `${F}-q-74.png` },
  75: { q: `${F}-q-75.png` }
};

// 1-based answer key (Chosen Options + GK overrides for unanswered/wrong picks).
const KEY = [
  // 1-25 (General Intelligence) — Q7 wrong, Q16/Q18 unanswered overridden
  3,4,1,3,4, 2,4,1,3,2, 2,3,4,4,1, 4,1,1,1,2, 4,4,3,4,3,
  // 26-50 (English Language) — Q1/Q5/Q8/Q11/Q12/Q23 wrong picks overridden
  3,1,1,2,3, 4,4,4,2,3, 3,3,1,4,1, 1,1,3,4,3, 4,1,2,3,4,
  // 51-75 (Quantitative Aptitude) — Q3/Q15/Q21/Q22 unanswered overridden
  3,2,1,1,1, 4,2,2,3,4, 2,2,2,2,1, 2,2,3,1,1, 3,2,1,4,4,
  // 76-100 (General Awareness) — Q3/Q4/Q9/Q22 wrong; many unanswered overridden
  3,2,1,3,2, 3,2,3,1,1, 2,2,3,1,1, 3,1,1,4,2, 1,4,2,3,2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nRI, PK, LO, FU, XC, ?", o: ["PK","MN","NM","NL"], e: "1st letter diffs −2,−4,−6,−8,−10 (R,P,L,F,X,N). 2nd letter diffs +2,+4,+6,+8,+10 (I,K,O,U,C,M). Missing = NM." },
  { s: REA, q: "In this question, three statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusion(s) logically follow(s) from the statements.\n\nStatements:\nAll chairs are tables.\nSome tables are stands.\nAll stands are baskets.\n\nConclusions:\nI. Some chairs are stands.\nII. Some tables are baskets.\nIII. All baskets are chairs.", o: ["Only conclusion III follows.","Only conclusions II and III follow.","Only conclusions I and II follow.","Only conclusion II follows."], e: "Only II follows (some tables are stands + all stands are baskets ⇒ some tables are baskets). I and III are too strong." },
  { s: REA, q: "In a certain code language, 'STATE' is written as '38401405' and 'EXILE' is written as '5489245'. How will 'ARENA' be written in that language?", o: ["1365281","1365141","21810142","21181014"], e: "Vowels = alphabet position; consonants = position × 2. ARENA: A(1), R(18×2=36), E(5), N(14×2=28), A(1) → '1' + '36' + '5' + '28' + '1' = '1365281'." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Genius  2. Genuine  3. Generic  4. Generous  5. Genesis", o: ["4, 1, 5, 2, 3","3, 5, 1, 4, 2","3, 4, 5, 1, 2","1, 2, 3, 4, 5"], e: "Order: Generic(3), Generous(4), Genesis(5), Genius(1), Genuine(2) → 3,4,5,1,2." },
  { s: REA, q: "In a code language, 'MUSCLE' is coded as USMLEC and 'FINGER' is coded as INFERG. How will 'THROAT' be coded in the same language?", o: ["HTRAOT","HTROAT","RHTTAO","HRTATO"], e: "Position rearrangement 1234 56 → 2,3,1,5,6,4. THROAT → H,R,T,A,T,O = HRTATO." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n191, 174, 165, 148, 139, ?", o: ["128","122","125","120"], e: "Alternating diffs −17, −9. 139 − 17 = 122." },
  { s: REA, q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets.\n\n(22, 7, 385)\n(36, 9, 810)", o: ["(14, 3, 115)","(26, 8, 420)","(19, 4, 290)","(27, 6, 405)"], e: "Pattern: c = 2.5·a·b. 2.5·22·7=385 ✓; 2.5·36·9=810 ✓; (27, 6, 405): 2.5·27·6 = 405 ✓." },
  { s: REA, q: "Refer to the image for the question.", o: ["3","1","4","6"], e: "Per response sheet, option 1 (3)." },
  { s: REA, q: "In a code language, 'PALM' is coded as 16-1-12-13 and 'HEAD' is coded as 8-5-1-4. How will 'NECK' be coded in the same language?", o: ["13-5-3-11","14-5-3-10","14-5-3-11","13-5-3-10"], e: "Each letter = alphabet position. NECK: N=14, E=5, C=3, K=11 → 14-5-3-11." },
  { s: REA, q: "Select correct combination of mathematical signs to sequentially replace the letter Y and balance the following equation.\n\n52 Y 13 Y 16 Y 32 Y 2", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "In this question, three statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusion(s) logically follow(s) from the statements.\n\nStatements:\nAll chairs are doors.\nSome doors are keys.\nAll keys are windows.\n\nConclusions:\nI. All chairs are keys.\nII. Some windows are doors.", o: ["Only conclusion I follows.","Only conclusion II follows.","Neither conclusion I nor II follows.","Both conclusions I and II follow."], e: "Some doors are keys + all keys are windows ⇒ some doors are windows ⇒ some windows are doors (II follows). I is too strong." },
  { s: REA, q: "In a certain code language, 'TREE' is written as WWHJ, and 'LEAF' is written as OJDK. How will 'BARK' be written in that language?", o: ["GFUN","EFTP","EFUP","GDWN"], e: "Alternating shifts +3, +5. BARK: B+3=E, A+5=F, R+3=U, K+5=P → EFUP." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. Pentagon  2. Decagon  3. Triangle  4. Hexagon  5. Heptagon", o: ["1, 4, 2, 3, 5","5, 2, 1, 3, 4","4, 2, 1, 3, 5","2, 5, 4, 1, 3"], e: "By decreasing number of sides: Decagon(10), Heptagon(7), Hexagon(6), Pentagon(5), Triangle(3) → 2,5,4,1,3." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "In a certain code language, 'FIRST' is written as 'YWUKG' and 'GROSS' is written as 'XWRTH'. How will 'ROUND' be written in that language?", o: ["JQXQS","IRYQS","HRXQS","IRXQS"], e: "Per response sheet (default), option 4 (IRXQS)." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nTIDE : URBW :: BACK : CZAQ :: WORD : ?", o: ["XLPX","XPSE","XLIW","XMPX"], e: "Per response sheet, option 1 (XLPX)." },
  { s: REA, q: "In a code language, 'TRAIN' is written as AITRS, and 'TRUCK' is written as UCTRP. How will 'CYCLE' be written in the same language?", o: ["CLCYJ","CCYLE","CLYCJ","CLCYM"], e: "Position rearrangement 3,4,1,2 + last letter +5. CYCLE: C,L,C,Y,(E+5=J) → CLCYJ." },
  { s: REA, q: "H is the husband of G. J and K are the sons of H. L is the son of J. L is the brother of M. N is the mother of M. How is N related to H?", o: ["Daughter-in-law","Sister","Daughter","Mother"], e: "M is sibling of L (both children of J). N is mother of M, so N is J's wife ⇒ N is H's daughter-in-law." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nUHS, OJQ, ILO, ENM, ?", o: ["APL","APK","BPK","AOK"], e: "1st letter diffs −6,−6,−4,−4 (U,O,I,E,A). 2nd letter +2 (H,J,L,N,P). 3rd letter −2 (S,Q,O,M,K). Missing = APK." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nBengaluru : Karnataka :: Ranchi : ?", o: ["Assam","Uttar Pradesh","Madhya Pradesh","Jharkhand"], e: "Bengaluru is the capital of Karnataka; Ranchi is the capital of Jharkhand." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Pointing at a woman, Ram said, \"She is the only maternal aunt of my maternal aunt's daughters, and I don't have any maternal uncle.\" What is the relation of the woman to Ram?", o: ["Sister","Sister-in-law","Mother","Grandmother"], e: "Maternal aunt's daughters' only maternal aunt = sister of their mother. Since Ram has no maternal uncle, his mom's only sister besides his aunt is Ram's mother herself." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nFOUR : TLEI :: CODE : WLVV :: LAST : ?", o: ["NUCI","OZHG","PZIG","NZGG"], e: "Per response sheet (alternating sums 26/27 pattern), option 4 (NZGG)." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nGENTLE : VOGMVT :: FACIAL : OZRXZU :: MAKEUP : ?", o: ["KFWPZN","KFVPYN","KFVPZN","KFVQZN"], e: "Symmetric shifts pattern. MAKEUP → KFVPZN with shifts −2,+5,+11,+11,+5,−2." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Versus","Optimal","Exclemation","Homonym"], e: "'Exclemation' is misspelled — correct is 'Exclamation'." },
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order to form a meaningful and coherent paragraph.\n\nA. And hacking is a common method of breaching the defences of protected computer systems by attackers.\nB. Cybercrime is described as any illegal behaviour that occurs on or via the means of computers, the internet or other technologies.\nC. Cyber attackers can conduct cybercrime by employing a variety of programmes and software in cyberspace.\nD. The attackers deploy malware to take advantage of flaws in the hardware and software architecture.", o: ["BCDA","BDAC","CDBA","BACD"], e: "B (definition) → C (means by which attackers act) → D (malware exploitation) → A (hacking is common) = BCDA." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nThe thief asked if he remembered the place where they had hidden their jewellery.", o: ["The thief asked, \"Do you remember the place where we have hidden our jewellery?\"","The thief asked, \"Can you remember the place where we were hiding our jewellery?\"","The thief asked, \"Where do you remember the place where we have hidden our jewellery?\"","The thief asked, \"Did you remember the place where we hid our jewellery?\""], e: "Reported past + past perfect → direct present + present perfect; 'they' → 'we'." },
  { s: ENG, q: "Select the correct superlative degree of comparison for the given sentence.\n\nI told him my inner feelings.", o: ["I told him my feelings.","I told him my innermost feelings.","I told him my in feelings.","I told him my more inner feelings."], e: "Superlative of 'inner' is 'innermost'." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nAnne asked whether I knew a good lawyer.", o: ["Anne asked, \"Whether I knew a good lawyer?\"","Anne said, \"You knew a good lawyer?\"","Anne said, \"Do you know a good lawyer?\"","Anne said, \"Whether do you know a good lawyer?\""], e: "Reported 'whether I knew' → direct simple-present question 'Do you know'." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nFredrick had submitted all the pending assignments by Wednesday.", o: ["All the pending assignments are being submitted by Fredrick by Wednesday.","Fredrick was submitting all the pending assignments by Wednesday.","All the pending assignments are to be submitted by Fredrick by Wednesday.","All the pending assignments had been submitted by Fredrick by Wednesday."], e: "Past perfect active 'had submitted' → past perfect passive 'had been submitted'." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nRumour mongering is one of the bad habit.", o: ["one of the worse habit","No substitution required","ones of the worse habit","one of the bad habits"], e: "'One of the' is followed by a plural noun: 'one of the bad habits'." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom in the given sentence.\n\nThe rope gave way while the workmen were hauling up the iron pillar.", o: ["repressed","lulled","stifled","snapped"], e: "'Gave way' = collapsed / broke / snapped under the load." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe allegation was dismissed by the minister.", o: ["The minister had dismissed the allegation.","The minister dismissed the allegation.","The minister is dismissed the allegation","The minister has dismissed the allegation."], e: "Simple past passive 'was dismissed' → simple past active 'dismissed'." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence.\n\nThey will not sanction to copy without permission", o: ["can not sanction to copying","are not sanction to be copying","will not sanction copying","will not be sanctioned to copy"], e: "'Sanction' here takes a gerund — 'sanction copying'." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined word in a sentence.\n\nThe eagle seized its prey in a tenacious grip.", o: ["timorous","flexible","persistent","passive"], e: "'Tenacious' = persistent / holding firmly." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\n\nThe orator gave his best winsome smile.", o: ["Cunning","Satisfying","Repelling","Winning"], e: "'Winsome' (charming / attractive) — antonym 'Repelling' (unattractive / repulsive)." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nClear the air", o: ["To deal openly with misunderstandings to get rid of them","To switch off fans","To use aroma to sweeten the air","To reduce pollution"], e: "'Clear the air' = to address and resolve misunderstandings." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe killing of a whole race", o: ["Matricide","Patricide","Infanticide","Genocide"], e: "Genocide = the deliberate killing of a whole race/ethnic group." },
  { s: ENG, q: "Select the most appropriate option to fill in the blanks.\n\nHis _________ violation of the moral code of conduct was too _________ to be forgiven.", o: ["flagrant; outrageous","fragrant; outgoing","obscure; outstanding","magnificent; outlandish"], e: "'Flagrant' (blatant) + 'outrageous' (shocking) fits 'unforgivable violation' context." },
  { s: ENG, q: "Read the passage about two childhood buddies in the army, and answer.\n\nSelect the most appropriate option to fill in blank 1.\n\n'There were two (1)________ buddies'", o: ["childhood","childish","child","childlike"], e: "'Childhood buddies' = friends from childhood — the natural collocation." },
  { s: ENG, q: "Read the passage about two childhood buddies in the army, and answer.\n\nSelect the most appropriate option to fill in blank 2.\n\n'War (2)________ and they were ... in the same unit.'", o: ["broke out","broke in","broke up","broke into"], e: "'War broke out' = began suddenly — the standard phrasal verb." },
  { s: ENG, q: "Read the passage about two childhood buddies in the army, and answer.\n\nSelect the most appropriate option to fill in blank 3.\n\n'they were (3)________ in the same unit.'", o: ["fought","fights","fighting","fight"], e: "'Were fighting' — past continuous fits the context." },
  { s: ENG, q: "Read the passage about two childhood buddies in the army, and answer.\n\nSelect the most appropriate option to fill in blank 4.\n\n'Bullets were flying (4)________'", o: ["up and over","over","above","all over"], e: "'All over' = everywhere — fits the chaotic battlefield image." },
  { s: ENG, q: "Read the passage about two childhood buddies in the army, and answer.\n\nSelect the most appropriate option to fill in blank 5.\n\n'Harry (5)________ recognised that voice'", o: ["initially","actually","immediately","suddenly"], e: "'Immediately recognised' fits the urgency of the moment." },
  { s: ENG, q: "Read the passage about Shikshayatan school, and answer.\n\nSelect the most appropriate synonym for the word 'Customise'.", o: ["Readymade","Level","Break","Alter"], e: "'Customise' = to alter / modify according to needs." },
  { s: ENG, q: "Read the passage about Shikshayatan school, and answer.\n\nWhy is free exercise and play encouraged for children?", o: ["Because children need physical energy for better learning","Because children have games period","Because children need physical energy to make their body fit","Because children like to play games"], e: "Per passage: ensures children have the physical energy required for learning." },
  { s: ENG, q: "Read the passage about Shikshayatan school, and answer.\n\nWhy is teaching confined to short periods?", o: ["Because children need to participate in co circular activities","Because children cannot sit with concentration beyond their span of interest","Because children can learn more concepts","Because children need to participate in physical activities"], e: "Per passage: 'Teaching is confined to brief periods according to the natural attention span of each child.'" },
  { s: ENG, q: "Read the passage about Shikshayatan school, and answer.\n\nWhy do the teachers at Shikshayatan believe that learning can be done by the play-way method?", o: ["Because they feel learning can be done in the play ground","Because they feel learning can be done only in the class room","Because they feel learning can be made interesting and enjoyable","Because they feel learning can be made easy through cartoons"], e: "Per passage: 'learning can be made interesting and enjoyable'." },
  { s: ENG, q: "Read the passage about Shikshayatan school, and answer.\n\nSelect the most appropriate ANTONYM for the word 'Spontaneously'.", o: ["Unplanned","Automatically","Naturally","Intended"], e: "'Spontaneously' (without planning) — antonym 'Intended' (planned / deliberate)." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "If A : B = 3 : 4, B : C = 5 : 6, and C : D = 12 : 17, what is A : D?", o: ["13 : 31","17 : 37","15 : 34","30 : 34"], e: "Equate B: A:B:C = 15:20:24. Equate C: A:B:C:D = 15:20:24:34. So A:D = 15:34." },
  { s: QA, q: "If O is the orthocentre of a △ABC and ∠BOC = 140°, then the measure of ∠BAC is:", o: ["45°","40°","30°","60°"], e: "When O is the orthocentre, ∠BOC = 180° − ∠A ⇒ ∠A = 180 − 140 = 40°." },
  { s: QA, q: "In a △ABC, a line DE is drawn from D point on AB to E point on AC such that DE is parallel to BC. Also AD : DB is 2 : 5. If AC is 4.2 cm, then what is the length of AE?", o: ["1.2 cm","3.5 cm","0.9 cm","2.5 cm"], e: "By BPT: AE/AC = AD/AB = 2/7. AE = 2·4.2/7 = 1.2 cm." },
  { s: QA, q: "Anil deposited Rs.8,000 in a two-year fixed deposit scheme on compound interest compounded annually at 5% per annum. Find the maturity value of the fixed deposit.", o: ["Rs.8,820","Rs.8,450","Rs.8,680","Rs.8,900"], e: "Amount = 8000·(1.05)² = 8000·1.1025 = ₹8,820." },
  { s: QA, q: "If A is 25% more than B and B is 15% less than C, then A:B:C = ?", o: ["85 : 68 : 80","75 : 81 : 69","83 : 87 : 69","83 : 81 : 67"], e: "A = 1.25B, B = 0.85C ⇒ A = 1.0625C. With C=100: A=106.25, B=85. Ratio 425:340:400 = 85:68:80." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "Refer to the image for the question.", o: ["Rs.1,06,560","Rs.1,04,880","Rs.1,24,520","Rs.1,34,560"], e: "Per response sheet, option 2 (₹1,04,880)." },
  { s: QA, q: "A man's average driving speed for 9 hours is 72 km/h. During the first 3 hours of his journey, he drove at 54 km/h, and for the next 2 hours and 15 minutes, he drove at a speed of 68 km/h. He maintained a speed of 90 km/h for another 3 hours. What was his speed (in km/h) for the last 45 minutes?", o: ["75","84","93","72"], e: "Total dist = 9·72 = 648 km. Dist so far = 162+153+270 = 585 km. Remaining = 63 km in 0.75 h ⇒ speed = 84 km/h." },
  { s: QA, q: "Raj can build a house in 16 days by himself, while Suraj can do it in 12 days. Raj and Suraj work on alternate days. How many days would the house take to build if Raj starts working on the first day?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "2-day cycle = 1/16 + 1/12 = 7/48. After 12 days: 6·7/48 = 7/8 done. Remaining 1/8 needs ~1.75 days. Per response sheet, option 3." },
  { s: QA, q: "Which of the following numbers is divisible by 72?", o: ["23724128","35127918","24127812","22112136"], e: "72 = 8 × 9. 22112136: last 3 digits 136/8 = 17 ✓; digit sum 18 ✓. So divisible by both 8 and 9." },
  { s: QA, q: "Determine the list price of an item if a 20% discount on the item amounts to Rs.50.", o: ["Rs.200","Rs.250","Rs.260","Rs.210"], e: "20% of MP = 50 ⇒ MP = ₹250." },
  { s: QA, q: "The average of 10 numbers is 47. What should be the 11th number added to them to make the average 53?", o: ["412","113","312","211"], e: "Sum of 10 = 470. New sum = 11·53 = 583. 11th = 583 − 470 = 113." },
  { s: QA, q: "When a number is divided by 296, the remainder is 75. What will be the remainder when the same number is divided by 37?", o: ["19","1","12","23"], e: "296 = 8·37. N = 296q + 75 = 37(8q + 2) + 1. Remainder when divided by 37 = 1." },
  { s: QA, q: "Find the mean proportional between 0.4 and 3.6.", o: ["1.4","1.2","1","0.8"], e: "Mean prop = √(0.4·3.6) = √1.44 = 1.2." },
  { s: QA, q: "The height of a cylinder and its volume are 15 cm and 2310 cm³, respectively. Find the total surface area.", o: ["968 cm²","452 cm²","660 cm²","248 cm²"], e: "V = πr²h ⇒ r² = 2310·7/(22·15) = 49 ⇒ r = 7. TSA = 2πr(r+h) = 2·(22/7)·7·22 = 968 cm²." },
  { s: QA, q: "40 men can complete a work in 15 days. Five days after they started working, 10 more men joined them. In how many days will the total work be completed?", o: ["12","13","14","11"], e: "Total work = 40·15 = 600 man-days. After 5 days: 200 done. Remaining 400 needs 50 men for 8 days. Total = 5 + 8 = 13 days." },
  { s: QA, q: "When 44 is subtracted from a number, it reduces to its 60%. Three-fifth of that number is:", o: ["40","66","44","60"], e: "N − 44 = 0.6N ⇒ 0.4N = 44 ⇒ N = 110. (3/5)·110 = 66." },
  { s: QA, q: "The value of cot(−315°) is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "cot(−315°) = cot(−315° + 360°) = cot(45°) = 1. Per response sheet, option 3." },
  { s: QA, q: "A businessman marks up the price of his goods by 25% and gives a discount of 5% to the customer. He also uses a 950 gm weight instead of a 1000 gm weight. Find his overall profit percentage.", o: ["25%","15%","12%","20%"], e: "Effective SP factor on 950g = 1.25·0.95 = 1.1875. Scaled to 1000g: 1.1875·1000/950 = 1.25. So 25% profit on CP." },
  { s: QA, q: "Refer to the image for the question.", o: ["142","324","321","327"], e: "Per response sheet, option 1 (142)." },
  { s: QA, q: "A thief was spotted by a policeman at a distance of 1200 m and he started chasing him. The thief ran 6.4 km in 52 minutes and the policeman also ran the same distance in 40 minutes. Find the distance the thief had run before he was caught.", o: ["3.0 km","3.5 km","4 km","2.5 km"], e: "Thief speed = 6.4·60/52 ≈ 7.385 km/h; cop speed = 9.6 km/h. Closing rate = 2.215 km/h. Time = 1.2/2.215 ≈ 0.5417 h. Thief covers 7.385·0.5417 ≈ 4 km." },
  { s: QA, q: "A shopkeeper purchases supplies from a supplier. The supplier sells 750 units of bags to the shopkeeper after gaining the sale price of 125 units of bags. What is the gain percentage of the supplier?", o: ["16%","20%","22%","15%"], e: "Profit = 125 SP-units. 750 SP-units − 750 CP-units = 125 SP-units ⇒ 625 SP = 750 CP ⇒ SP/CP = 6/5 ⇒ gain = 20%." },
  { s: QA, q: "The average weight of 32 students is 70 kg. If the weight of the teacher is also included, the average weight of the class becomes 70.5 kg. Calculate the weight of the teacher.", o: ["86.5 kg","88.5 kg","84.5 kg","82.5 kg"], e: "Sum of 32 = 2240. With teacher (33 people): 33·70.5 = 2326.5. Teacher = 86.5 kg." },
  { s: QA, q: "Refer to the image for the question.", o: ["64.90%","61.80%","62.50%","65.12%"], e: "Per response sheet, option 4 (65.12%)." },
  { s: QA, q: "Refer to the image for the question.", o: ["Rs.1 lac","Rs.20 lacs","Rs.15 lacs","Rs.10 lacs"], e: "Per response sheet, option 4 (Rs.10 lacs)." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Who among the following was the Viceroy of India when the Indian Universities Act was passed in 1904?", o: ["Lord Chelmsford","Lord Hardinge","Lord Curzon","Lord Minto"], e: "Lord Curzon was the Viceroy when the Indian Universities Act, 1904 was passed." },
  { s: GA, q: "Which Amendment to the Constitution Act led to establishment of National Judicial Appointments Commission in India?", o: ["95th Amendment","99th Amendment","96th Amendment","97th Amendment"], e: "The 99th Constitutional Amendment Act (2014) established the NJAC (later struck down by the Supreme Court)." },
  { s: GA, q: "Sri Lanka got independence in the year:", o: ["1948","1950","1947","1949"], e: "Sri Lanka (then Ceylon) gained independence from Britain on 4 February 1948." },
  { s: GA, q: "Neeraj Chopra first set the senior national record during the 2016 South Asian Games held at __________.", o: ["Imphal","Itanagar","Guwahati","Kohima"], e: "The 2016 South Asian Games were held jointly at Guwahati and Shillong. Neeraj Chopra set the senior record there." },
  { s: GA, q: "What has been abolished under Article 17 of the Constitution of India by declaring its practice a legal offence?", o: ["Unemployment","Untouchability","Child labour","Double punishment"], e: "Article 17 of the Constitution abolishes 'Untouchability' and declares its practice a punishable offence." },
  { s: GA, q: "India can be divided into how many physiographic regions?", o: ["7","4","6","5"], e: "India is broadly divided into 6 physiographic regions: Himalayas, Northern Plains, Peninsular Plateau, Indian Desert, Coastal Plains, and Islands." },
  { s: GA, q: "In 2021, who among the following was awarded the 12th Kalasagar Awards for exemplary contribution to the field of Mohiniyattam?", o: ["Sandhya Rajan","Sunanda Nair","Gopika Rajan","Krishna Panicker"], e: "Sunanda Nair received the 12th Kalasagar Award in 2021 for her contribution to Mohiniyattam." },
  { s: GA, q: "Who among the following is the author of the book titled 'Selection Day'?", o: ["Nissim Ezekiel","Vikram Seth","Aravind Adiga","Amitav Ghosh"], e: "'Selection Day' (2016) is a novel by Aravind Adiga, set in the world of Indian cricket." },
  { s: GA, q: "Which of the following dance forms is NOT associated with the state of Jharkhand?", o: ["Dhimsa","Jamda","Karma","Paika"], e: "Dhimsa is a tribal dance of Andhra Pradesh. Jamda, Karma and Paika are Jharkhand folk dances." },
  { s: GA, q: "Article 263 of the Indian Constitution relates to the establishment of ___________.", o: ["Inter-State Council","Backward Classes Commission","Election Commission of India","State Election Commission"], e: "Article 263 empowers the President to establish an Inter-State Council to promote Centre-State and inter-state coordination." },
  { s: GA, q: "As per the Union Budget 2022-23, the launch of blockchain based digital rupee is proposed to start from __________.", o: ["2024-25","2022-23","2023-24","2025-26"], e: "Per Union Budget 2022-23, RBI's blockchain-based Digital Rupee (CBDC) was to be launched in FY 2022-23." },
  { s: GA, q: "What is the original name of the Empress of India Act and when was it instituted?", o: ["The Royalty Act of 1876","The Royal Titles Act of 1876","The Royal Titles Act of 1877","The Titles Act of 1875"], e: "The Royal Titles Act, 1876 was passed by the British Parliament conferring the title 'Empress of India' on Queen Victoria." },
  { s: GA, q: "Sammakka-Sarakka Jatara is celebrated in which of the following states of India?", o: ["Odisha","Tamil Nadu","Telangana","Chhattisgarh"], e: "Sammakka-Sarakka Jatara (also called Medaram Jatara) is a biennial tribal festival held in Mulugu district of Telangana." },
  { s: GA, q: "The United Nations estimated the number of poor people in India to be around _______ million in 2019.", o: ["364","200","150","64"], e: "Per UNDP/OPHI estimates around 2019-2020, approximately 364 million Indians were multidimensionally poor." },
  { s: GA, q: "King Porus and Alexander the Great fought which battle?", o: ["Battle of Hydaspes","Battle of Hydasperium","Battle of Hydasperia","Battle of Hyphasis"], e: "The Battle of the Hydaspes (326 BCE) was fought between Alexander the Great and King Porus on the banks of the Jhelum (Hydaspes) river." },
  { s: GA, q: "Eugenol is a major component of:", o: ["turmeric","ginger","clove essential oil","tamarind"], e: "Eugenol is the principal aromatic compound in clove essential oil (Syzygium aromaticum), accounting for 70–90% of its content." },
  { s: GA, q: "Who among the following inaugurated the Dredging Museum 'Nikarshan Sadan' at Vishakhapatnam in February 2022?", o: ["Sarbananda Sonowal","Nitin Jairam Gadkari","Dharmendra Pradhan","Amit Shah"], e: "Shri Sarbananda Sonowal, Union Minister of Ports, Shipping and Waterways, inaugurated 'Nikarshan Sadan' (Dredging Museum) at Vizag in Feb 2022." },
  { s: GA, q: "Which chemical element of the halogen group is a light greenish-yellow highly toxic gas with atomic number 17?", o: ["Astatine","Iodine","Bromine","Chlorine"], e: "Chlorine (Cl) has atomic number 17 and is a yellow-green gas in the halogen group." },
  { s: GA, q: "According to Department of Foreign Affairs and Trade, by 2030, transport will have attracted how much per cent of the infrastructural investment in India?", o: ["60%","50%","70%","40%"], e: "Per Australia DFAT estimates, transport is expected to attract about 50% of India's infrastructural investment by 2030." },
  { s: GA, q: "Dantidurga was associated with which of the following ruling dynasties of the early medieval India?", o: ["Rashtrakuta","Pala","Hoysala","Chola"], e: "Dantidurga was the founder of the Rashtrakuta dynasty (mid-8th century CE)." },
  { s: GA, q: "Pandit Ram Narayan was a popular __________ player who is credited with making the instrument as a solo concert instrument.", o: ["Ghatam","Mridangam","Alghoza","Sarangi"], e: "Pandit Ram Narayan was a renowned Sarangi player and is credited with elevating the Sarangi to a solo classical concert instrument." },
  { s: GA, q: "The Bharhut Stupa is located in which of the following Indian states?", o: ["Uttar Pradesh","Madhya Pradesh","Bihar","Andhra Pradesh"], e: "The Bharhut Stupa is located in Satna district of Madhya Pradesh — built during the Shunga period (2nd century BCE)." },
  { s: GA, q: "Which of the following is an igneous rock usually composed of the minerals quartz, feldspar and mica that is formed when hot molten rock cools relatively slowly underground?", o: ["Granite","Siltstone","Gneiss","Amphibolite"], e: "Granite is an intrusive igneous rock made of quartz, feldspar, and mica, formed by slow cooling of magma underground." },
  { s: GA, q: "The 'Vikramshila University' in Bihar was founded by which of the following kings?", o: ["Gopala II","Devapala","Dharampala","Gopala I"], e: "Vikramshila University was founded by Pala emperor Dharampala (late 8th – early 9th century CE) in Bhagalpur, Bihar." },
  { s: GA, q: "Which of the following is an example of perishable foods that CANNOT be stored for more than a day or two at room temperature, i.e., they have a shelf life of 1 or 2 days?", o: ["Biscuits","Milk","Dry fruits","Spices"], e: "Milk is highly perishable at room temperature — it spoils within a day or two without refrigeration." }
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

  const TEST_TITLE = 'SSC Selection Post Phase X (Higher Secondary) - 4 August 2022 Shift-3';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-3',
    pyqExamName: 'SSC Selection Post Phase X (Higher Secondary)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
