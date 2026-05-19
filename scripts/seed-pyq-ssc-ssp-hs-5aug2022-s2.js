/**
 * Seed: SSC Selection Post Phase X (Higher Secondary Level) PYQ - 5 August 2022, Shift-2 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-hs-5aug2022-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/05/shift-2/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-hs-5aug2022-s2';

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

const F = '5-aug-2022';
// REA Q15 question-only; Q20, Q22, Q24 full image sets.
// QA Q51 (=Q1), Q65 (=Q15), Q70 (=Q20) question-image only.
const IMAGE_MAP = {
  15: { q: `${F}-q-15.png` },
  20: { q: `${F}-q-20.png`,
        opts: [`${F}-q-20-option-1.png`,`${F}-q-20-option-2.png`,`${F}-q-20-option-3.png`,`${F}-q-20-option-4.png`] },
  22: { q: `${F}-q-22.png`,
        opts: [`${F}-q-22-option-1.png`,`${F}-q-22-option-2.png`,`${F}-q-22-option-3.png`,`${F}-q-22-option-4.png`] },
  24: { q: `${F}-q-24.png`,
        opts: [`${F}-q-24-option-1.png`,`${F}-q-24-option-2.png`,`${F}-q-24-option-3.png`,`${F}-q-24-option-4.png`] },
  51: { q: `${F}-q-51.png` },
  65: { q: `${F}-q-65.png` },
  70: { q: `${F}-q-70.png` }
};

// 1-based answer key (Chosen Options + GK overrides for unanswered/wrong picks).
const KEY = [
  // 1-25 (General Intelligence) — Q5 unanswered overridden
  4,4,2,3,2, 3,1,4,3,2, 2,4,1,4,4, 3,4,2,2,1, 1,3,3,3,3,
  // 26-50 (English Language) — Q7/Q12 unanswered; Q10 wrong; Q13/Q18/Q21/Q22/Q23/Q24/Q25 overridden
  2,3,2,1,4, 2,4,2,2,2, 1,1,4,4,2, 2,2,3,3,4, 2,3,3,4,4,
  // 51-75 (Quantitative Aptitude)
  4,3,1,2,4, 1,2,4,4,4, 1,3,4,1,2, 1,3,3,3,3, 3,4,3,1,1,
  // 76-100 (General Awareness) — heavy overrides (many unanswered)
  3,2,3,2,1, 4,3,2,3,3, 1,1,2,3,2, 3,3,1,4,3, 3,4,2,3,1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nTAKE : GZPV :: NOTE : MLGV :: FAST : ?", o: ["UYHG","VZHF","VZIG","UZHG"], e: "Mirror cipher (sum 27). FAST: F→U, A→Z, S→H, T→G → UZHG." },
  { s: REA, q: "In a certain code language, 'FOCUS' is written as 'UVCPH' and 'AMONG' is written as 'IOONC'. How will 'CHILD' be written in that language?", o: ["EMIID","FMIEI","FNIJE","FMIIE"], e: "Per response sheet, option 4 (FMIIE)." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nTH, RD, NZ, LV, ?", o: ["GR","HR","HQ","HS"], e: "1st letter diffs alt −2,−4 (T,R,N,L,H). 2nd letter −4 each (H,D,Z,V,R). Missing = HR." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. Sea  2. Lake  3. Pond  4. River  5. Ocean", o: ["1, 4, 5, 2, 3","5, 2, 1, 4, 3","5, 1, 4, 2, 3","5, 2, 3, 4, 1"], e: "Largest to smallest water bodies: Ocean(5) > Sea(1) > River(4) > Lake(2) > Pond(3) → 5,1,4,2,3." },
  { s: REA, q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets.\n\n(29, 13, 168)\n(17, 28, 180)", o: ["(81, 45, 144)","(23, 41, 256)","(14, 25, 78)","(31, 47, 234)"], e: "Pattern: c = (a + b) × 4. (29+13)·4=168 ✓; (17+28)·4=180 ✓; (23+41)·4 = 256 ✓." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Qualify  2. Quadrant  3. Quaint  4. Quacker  5. Quaff", o: ["2, 3, 5, 4, 1","2, 5, 3, 4, 1","4, 2, 5, 3, 1","5, 2, 3, 4, 1"], e: "Order: Quacker(4), Quadrant(2), Quaff(5), Quaint(3), Qualify(1) → 4,2,5,3,1." },
  { s: REA, q: "A is the son of B. C is the wife of B. D is the son of C. D is married to E. E is the mother of F. How A is related to E?", o: ["Husband's brother","Father","Brother","Son"], e: "A and D are both sons of B and C → A is D's brother. D is E's husband ⇒ A is E's husband's brother." },
  { s: REA, q: "Select the option that is related to the sixth letter cluster in the same way as the first letter cluster is related to the second letter cluster and the third letter cluster is related to the fourth letter cluster.\n\nDGJ : LOR :: CFI : KNQ :: ? : TWZ", o: ["MPS","PSV","KNQ","LOR"], e: "Each letter +8 transforms left to right cluster. To get TWZ, subtract 8: T-8=L, W-8=O, Z-8=R → LOR." },
  { s: REA, q: "Select correct combination of mathematical signs to sequentially replace the # signs and balance the following equation.\n\n36 # 9 # 3 # 4 # 3", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nBT, CO, FH, GW, JJ, ?", o: ["KU","KS","KT","KR"], e: "Per response sheet, option 2 (KS)." },
  { s: REA, q: "In a certain code language, if 'HIGH' is written as '9887' and 'LOW' is written as '131424', then how will 'MEDIUM' be written in that language?", o: ["144582232","144582212","144582214","144582215"], e: "Per response sheet, option 2 (144582212)." },
  { s: REA, q: "In a code language, 'BREAD' is coded as AQEZC and 'HONEY' is coded as GNNDX. How will 'SUGAR' be coded in the same language?", o: ["RTFZQ","RUGZQ","RTHZQ","RTGZQ"], e: "Each letter −1 except middle letter (pos 3) stays same. SUGAR: S−1=R, U−1=T, G+0=G, A−1=Z(wrap), R−1=Q → RTGZQ." },
  { s: REA, q: "In a code language, 'HAND' is coded as 8-1-14-4 and 'SHIN' is coded as 19-8-9-14. How will 'NOSE' be coded in the same language?", o: ["14-15-19-5","14-16-18-5","13-15-19-5","13-16-17-5"], e: "Each letter coded by its alphabet position. NOSE: N=14, O=15, S=19, E=5 → 14-15-19-5." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n28, 41, 54, ?, 80, 93", o: ["63","70","69","67"], e: "Arithmetic progression with common difference +13. 54 + 13 = 67." },
  { s: REA, q: "Refer to the image for the question.", o: ["F","E","A","B"], e: "Per response sheet, option 4 (B)." },
  { s: REA, q: "In a code language, 'CLASS' is written as ASCLQ, and 'CHAIR' is written as AICHP. How will 'TABLE' be written in the same language?", o: ["LABLE","BLTAG","BLTAC","TLABE"], e: "Position rearrangement 3,4,1,2 with last letter −2. TABLE: B(3),L(4),T(1),A(2), E−2=C → BLTAC." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nTRAFFIC : CJFFBRT :: RELATED : DFTBLFR :: PROBLEM : ?", o: ["MFLPBRP","MFLBRPP","MELBPRP","MFLBPRP"], e: "Reverse word and shift vowels by +1. PROBLEM reversed = MELBORP. Vowels E,O shifted +1 → MFLBPRP." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nMONKEY : NPMYFK :: ROMPER : MPRRFP :: LEMONS : ?", o: ["MFLSOP","MFLSOO","MELSOP","MELSOO"], e: "Per response sheet, option 2 (MFLSOO)." },
  { s: REA, q: "In this question, three statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusion(s) logically follow(s) from the statements.\n\nStatements:\nSome monitors are keyboards.\nAll keyboards are laptops.\nAll printers are monitors.\n\nConclusions:\nI. All printers are keyboards.\nII. Some printers are laptops.\nIII. Some monitors are laptops.", o: ["Only conclusions I and III follow.","Only conclusion III follows.","Only conclusion I follows.","Only conclusions II and III follow."], e: "Only III follows: some monitors are keyboards + all keyboards are laptops ⇒ some monitors are laptops." },
  { s: REA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "'P # Q' means 'P is the husband of Q'.\n'P % Q' means 'P is the wife of Q'.\n'P @ Q' means 'P is the brother of Q'.\n'P & Q' means 'P is the father of Q'.\n\nIf 'C @ D % E & F # G', then how is D related to G?", o: ["Mother-in-law","Mother","Daughter-in-law","Father's mother"], e: "C brother of D; D wife of E; E father of F; F husband of G. So D is F's mother (E and D are F's parents); G is F's wife ⇒ D is G's mother-in-law." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "In a certain code language, 'JESUS' is written as 'CLUUS' and 'FAITH' is written as 'YHKJR'. How will 'ADOPT' be written in that language?", o: ["BCQNV","DEQVN","BCQVN","BGQVN"], e: "Per response sheet, option 3 (BCQVN)." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "In this question, three statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusion(s) logically follow(s) from the statements.\n\nStatements:\nNo flower is a vegetable.\nSome vegetables are fruits.\nAll fruits are red.\n\nConclusions:\nI. Some vegetables are red.\nII. Some fruits are flowers.", o: ["Neither conclusion I nor II follows.","Both conclusions I and II follow.","Only conclusion I follows.","Only conclusion II follows."], e: "Some vegetables are fruits + all fruits are red ⇒ some vegetables are red (I ✓). 'No flower is vegetable' ⇒ no fruit (which is vegetable) is flower (II is too strong)." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the correct degree of comparison for the given sentence.\n\nDavid looks (old) than he really is.", o: ["David looks old than he really is.","David looks older than he really is.","David looks elder than he really is.","David looks elder from he really is."], e: "Comparative of 'old' (general) = 'older'. ('Elder' is used for family relations.)" },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nNothing ventured, nothing gained", o: ["Nothing can be gained with ventures","Doing nothing is the best thing","One has to make every effort in order to achieve something","Through hard work one can receive nothing"], e: "'Nothing ventured, nothing gained' = without taking risks/making efforts, no rewards." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom in the given sentence.\n\nThe question came up before the Municipal Corporation last week.", o: ["cleared up","was raised","was left","departed"], e: "'Came up' = was raised / introduced for discussion." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Terible","Adverse","Management","Visible"], e: "'Terible' is misspelled — correct is 'Terrible' (with double-r)." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nNobody can change Raman's ill fate.", o: ["Changing ill fate of Raman by nobody is impossible.","Ill fate of Raman cannot be changed by nobody.","Raman's ill fate cannot be changed by nobody.","Raman's ill fate cannot be changed."], e: "When the active subject is 'nobody', the passive simply drops the agent: 'cannot be changed'." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence.\n\nYou are failed to be achieved high enough sales to earn a bonus this month.", o: ["You will fail to achieve","You failed to achieve","You have fail achieving","You fails to achieve"], e: "Correct form: 'You failed to achieve' (past tense, active)." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\n\nThe penurious little boy could not get the school lunch.", o: ["Lazy","Naughty","Unlawful","Munificent"], e: "'Penurious' (extremely poor / stingy) — antonym 'Munificent' (very generous)." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nThe author was writing the novel when the house caught fire.", o: ["The novel has been written by the author when the house caught fire.","The novel was being written by the author when the house caught fire.","The novel was written by the author when the house caught fire.","The novel had been written by the author when the house caught fire."], e: "Past continuous active 'was writing' → past continuous passive 'was being written'." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nThey say they are quite safe there.", o: ["\"We're quiet safe here,\" they told.","\"We're quite safe here,\" they said.","\"We're quite safe,\" they said.","\"They're quite safe there,\" they are saying."], e: "Indirect 'they say they are quite safe there' → direct: 'We're quite safe here'." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence.\n\nThe numbers applying for the course had dropped off very sharply during the pandemic.", o: ["have dropped off sharply","has dropped off sharply","have dropped off very sharply","had dropped off sharply"], e: "Per response sheet, option 2 (has dropped off sharply)." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nThe painter is painting the room", o: ["The room is being painted by the painter.","The room is being paint by the painter.","The room has been painted by the painter.","The room is painted by the painter."], e: "Present continuous active 'is painting' → passive 'is being painted'." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nSybarite", o: ["Debauchee","Gratuitous","Ornery","Brusque"], e: "'Sybarite' = a self-indulgent person devoted to pleasure / luxury — synonym 'Debauchee' (one given to sensual indulgence)." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA highly unpleasant, annoying, objectionable sound.", o: ["Slight","Natal","Lovely","Nasty"], e: "'Nasty' (highly unpleasant / objectionable) is the closest fit." },
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order to form a meaningful and coherent paragraph.\n\nA. In this style of essay, it is critical to incorporate precise details that allow the reader to experience the emotion.\nB. When creating a narrative essay, you should have a cast of people, a setting, a compelling storyline and a satisfying ending.\nC. Not only should they express their emotions or employ their senses, but they should also allow the tale to convey a point.\nD. A narrative essay tells a tale from a certain point of view or can say a story of the personal experiences one had.", o: ["DBAC","BCAD","CDBA","DABC"], e: "D introduces narrative essay → A (in this style, precise details) → B (cast, setting, plot) → C (express emotions, convey point) = DABC." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nBoth, Amit as well as Rahul are leaving for Delhi.", o: ["as well as Rahul is leaving","and Rahul are leaving","and Rahul is leaving","No substitution required"], e: "'Both ... as well as' is redundant — correct form is 'Both Amit and Rahul are leaving'." },
  { s: ENG, q: "Read the passage about walking for health, and answer.\n\nSelect the most appropriate answer to fill in blank number 1.\n\n'The more you walk, the more energised and healthier you (1)__________.'", o: ["becomes","become","becoming","became"], e: "Subject 'you' takes 'become' (present, base form)." },
  { s: ENG, q: "Read the passage about walking for health, and answer.\n\nSelect the most appropriate answer to fill in blank number 2.\n\n'Walking is a sort of physical activity that is also (2)__________.'", o: ["futile","worthwhile","contemptible","frangible"], e: "'Worthwhile' (valuable / beneficial) fits — walking is described positively as a daily-practice activity." },
  { s: ENG, q: "Read the passage about walking for health, and answer.\n\nSelect the most appropriate answer to fill in blank number 3.\n\n'Some folks stroll at a leisurely (3)_________.'", o: ["time","place","pace","distance"], e: "'Leisurely pace' is the standard collocation (= slow rate of walking)." },
  { s: ENG, q: "Read the passage about walking for health, and answer.\n\nSelect the most appropriate answer to fill in blank number 4.\n\n'rapid walking is an excellent kind of exercise that provides mental and physical (4)__________'", o: ["pressure","credibility","stability","fatigue"], e: "'Mental and physical stability' fits the health-benefit context." },
  { s: ENG, q: "Read the passage about walking for health, and answer.\n\nSelect the most appropriate answer to fill in blank number 5.\n\n'fresh air is (5)_________ early in the morning.'", o: ["tangible","feasible","permissible","accessible"], e: "'Fresh air is accessible (= available) early in the morning'." },
  { s: ENG, q: "Read the passage about an ancient house in Vinayak Mudali Street, and answer.\n\nWhich of the following is most nearly similar in meaning to the word 'hapless' as used in the passage?", o: ["Homeless","Wretched","Destitute","Rehabilitated"], e: "'Hapless' (unfortunate / luckless) — closest synonym 'Wretched' (miserable / unhappy)." },
  { s: ENG, q: "Read the passage about an ancient house in Vinayak Mudali Street, and answer.\n\nWhose needs are served by the well and lavatory under the tamarind tree?", o: ["Neighbours","Slaves","Tenants","Owners"], e: "Per passage: 'served the needs of the motley tenants of the ancient house'." },
  { s: ENG, q: "Read the passage about an ancient house in Vinayak Mudali Street, and answer.\n\nWhich of the following is most nearly similar in meaning to the word 'swarming' as used in the passage?", o: ["Separating","Leaving","Coming together","Attacking"], e: "'Swarming' (moving in large numbers / gathering) = 'Coming together'." },
  { s: ENG, q: "Read the passage about an ancient house in Vinayak Mudali Street, and answer.\n\nHow did the owner manage to collect maximum rent?", o: ["By charging heavy rent","By charging extra dues for various facilities","By creating special facilities","By accommodating many tenants in a partitioned and fragmented space"], e: "Per passage: 'by partitioning and fragmenting all the available space, had managed to create an illusion of shelter and privacy... squeezed the maximum rent out of everyone'." },
  { s: ENG, q: "Read the passage about an ancient house in Vinayak Mudali Street, and answer.\n\nWhich of the following words is the ANTONYM of the word 'slightest' as used in the passage?", o: ["Sweetest","Smallest","Farthest","Biggest"], e: "'Slightest' (smallest / least) — antonym 'Biggest' (largest / greatest)." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "Refer to the image for the question.", o: ["2020","2021","2018","2019"], e: "Per response sheet, option 4 (2019)." },
  { s: QA, q: "What is the length of the longest pencil that can be kept in a box of 2 cm long, 4 cm wide and 6 cm deep?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Longest pencil = body diagonal = √(2²+4²+6²) = √56 = 2√14 ≈ 7.48 cm. Per response sheet, option 3." },
  { s: QA, q: "Refer to the image for the question.", o: ["0","5","10","1"], e: "Per response sheet, option 1 (0)." },
  { s: QA, q: "In a △ABC, the side BC is extended from vertex C to point D such that ∠ACB and ∠ACD are in the ratio of 2 : 3. If ∠A is 75°, then what is the value of ∠B?", o: ["72°","33°","45°","69°"], e: "∠ACB + ∠ACD = 180° (linear pair). With 2:3 ratio, ∠ACB = 72°. ∠B = 180 − 75 − 72 = 33°." },
  { s: QA, q: "A trader marks the price of his goods 40% more than the cost price. If he allows successive discounts of 10% and 20% on the marked price, then how much percentage does he gain?", o: ["1.2%","0.5%","0.7%","0.8%"], e: "Let CP=100. MP=140. SP = 140·0.9·0.8 = 100.8. Gain = 0.8%." },
  { s: QA, q: "Four cities P, Q, R and S are on the corner of the square and the side of a square is 75 km. A businessman travels from P to Q at 5 km/h, Q to R at 3 km/h, R to S at 5 km/h and S to P at 3 km/h. Find his average speed of the whole journey.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Total dist = 300 km. Time = 75/5 + 75/3 + 75/5 + 75/3 = 15+25+15+25 = 80 h. Avg = 300/80 = 3.75 km/h. Per response sheet, option 1." },
  { s: QA, q: "Vikas spends 90% of his income. When his income increased by 25%, his expenditure increased by 20%. The percentage of increase in his savings is:", o: ["58%","70%","45%","62%"], e: "Let income=100, exp=90, savings=10. New income=125, new exp=108, new savings=17. Increase = 7/10 × 100 = 70%." },
  { s: QA, q: "In a △PQR, a line segment ST is drawn joining the mid points S of PQ and T of PR. Also, ST is parallel to QR. Which of the following options is correct?", o: ["2 ST = PQ + PR","ST = PS + PT","ST = 2 (QR)","2 ST = QR"], e: "By Mid-point theorem, ST = (1/2)QR ⇒ 2ST = QR." },
  { s: QA, q: "The mean proportional between 75 and x is five times the mean proportional between 15 and 26. The value of x is:", o: ["100","120","110","130"], e: "5·√(15·26) = √(75x) ⇒ 25·390 = 75x ⇒ x = 130." },
  { s: QA, q: "Car A covers a distance in 2 hours at the speed of 12 km/h. Car B covers twice the distance covered by Car A in 3 hours. What is the difference between the speeds (in km/h) of Car A and Car B?", o: ["3","5","6","4"], e: "Car A dist = 24 km. Car B dist = 48 km in 3 h ⇒ B speed = 16 km/h. Difference = 4 km/h." },
  { s: QA, q: "The mean of ten numbers is 12. The mean of seven of these numbers is 14. Find the mean of the remaining three numbers.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Sum of 10 = 120. Sum of 7 = 98. Sum of 3 = 22. Mean = 22/3 ≈ 7.33. Per response sheet, option 1." },
  { s: QA, q: "Tea worth Rs.75 per kg and Rs.100 per kg are mixed so as to get a mixture worth Rs.85 per kg. Find the ratio of mixing of these two varieties.", o: ["1 : 2","1 : 3","3 : 2","3 : 5"], e: "By alligation: (100−85):(85−75) = 15:10 = 3:2." },
  { s: QA, q: "What is the third proportional to 4 and 14?", o: ["56","28","16","49"], e: "Third proportional = b²/a = 14²/4 = 196/4 = 49." },
  { s: QA, q: "The income of Ram is 80% more than Shyam's income, and the income of Shyam is 50% more than Ghanshyam's income. By what percentage is Ram's income more than Ghanshyam's income?", o: ["170%","100%","110%","150%"], e: "Ram = 1.8·Shyam = 1.8·1.5·Ghanshyam = 2.7·Ghanshyam ⇒ 170% more." },
  { s: QA, q: "Refer to the image for the question.", o: ["B","D","C","A"], e: "Per response sheet, option 2 (D)." },
  { s: QA, q: "The difference between the compound interest and simple interest for the amount Rs.5,000 in 2 years is Rs.50. The rate of interest is:", o: ["10%","12%","8%","5%"], e: "CI − SI for 2 yrs = P·(r/100)². 5000·(r/100)² = 50 ⇒ r² = 100 ⇒ r = 10%." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "If machine A and B can produce 800 units in 3 hours and 8 hours, respectively, in how many hours can machine A and B working together at these constant rates produce 800 units?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Together rate = 800/3 + 100 = 1100/3 per hr. Time = 2400/1100 ≈ 2.18 hr. Per response sheet, option 3." },
  { s: QA, q: "Refer to the image for the question.", o: ["E","C","A","B"], e: "Per response sheet, option 3 (A)." },
  { s: QA, q: "Anil made a profit of 25% when he sold a jacket at Rs.8,000. Find the cost price of the jacket.", o: ["6,300","6,100","6,400","6,200"], e: "CP = 8000/1.25 = ₹6,400." },
  { s: QA, q: "P can do 25% more work than Q in the same time. Q alone completes the total part of that work in 25 days, then in how many days will P and Q together finish the same work?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "P:Q rate = 5:4. P alone = 25·(4/5) = 20 days. Together = 25·20/45 = 100/9 ≈ 11.11 days. Per response sheet, option 4." },
  { s: QA, q: "Find the unit digit in (14)¹¹² + (14)¹¹³.", o: ["2","8","0","4"], e: "14¹¹² + 14¹¹³ = 14¹¹²(1+14) = 15·14¹¹². Unit digit of 14¹¹² = 6, ×15 = 90 → unit digit 0." },
  { s: QA, q: "Mohan bought 1 kg of apples for Rs.175 and sold them for Rs.220 per kg. How much is the profit gained by him?", o: ["45","50","35","40"], e: "Profit = 220 − 175 = ₹45." },
  { s: QA, q: "If x − y = 5 and x³ − y³ = 520, then the value of xy is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "x³−y³ = (x−y)(x²+xy+y²) = 5·(x²+xy+y²) = 520 ⇒ x²+xy+y² ≈ 104. (x−y)² = 25 ⇒ xy ≈ 79/3. Per response sheet, option 1." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Which of the following is able to regenerate our digestive system with good microbes that will neutralise the harmful ones?", o: ["Antibiotics","Prosthetics","Probiotics","Prosynthetics"], e: "Probiotics are beneficial live microorganisms that restore gut microbiota and neutralise harmful bacteria." },
  { s: GA, q: "From an ecological point of view, _______ refers to a process of formation of a dark-coloured amorphous substance (organic matter that has reached maturity) decomposed from plant remains.", o: ["leaching","humification","mineralisation","stratification"], e: "Humification is the formation of dark, stable humus from decomposed plant remains." },
  { s: GA, q: "'Seamer' is a term used in the game of __________.", o: ["Football","Hockey","Cricket","Basketball"], e: "'Seamer' (a fast/medium-pace bowler who uses the seam of the ball) is a term used in Cricket." },
  { s: GA, q: "In which state in India is Chandratal wetland located?", o: ["Jammu and Kashmir","Himachal Pradesh","Uttarakhand","Uttar Pradesh"], e: "Chandratal (Moon Lake) wetland is located in Spiti district of Himachal Pradesh — a Ramsar site." },
  { s: GA, q: "Select the correct statement from the given options.", o: ["A light-year is a unit of distance","A light-year is a unit of time","A joule is a unit of power","A pascal is a unit of force"], e: "A light-year is the distance light travels in one year (~9.46 × 10¹² km) — a unit of DISTANCE, not time." },
  { s: GA, q: "Who among the following has composed the Prashasti of Pulakeshin II?", o: ["Harisena","Kalidasa","Banabhatta","Ravikirti"], e: "Ravikirti, a Jain court poet of Chalukya king Pulakeshin II, composed the Aihole Prashasti." },
  { s: GA, q: "The Modhera dance festival is organised annually in the state of _________.", o: ["Karnataka","Punjab","Gujarat","Odisha"], e: "Modhera Dance Festival (Uttarardha Mahotsav) is held annually at the Sun Temple, Modhera, Gujarat." },
  { s: GA, q: "Various types of crops are produced in India. Which of the following crops are fibre crops?", o: ["Gram and tur","Cotton and jute","Sugarcane and tea","Rice and wheat"], e: "Cotton and jute are the major fibre crops of India. (Gram/tur — pulses; sugarcane/tea — beverages; rice/wheat — cereals.)" },
  { s: GA, q: "The State cannot discriminate against any citizen on the grounds of religion, race, caste, sex or place of birth under which of the following Articles?", o: ["17","14","15","18"], e: "Article 15 prohibits discrimination on grounds of religion, race, caste, sex or place of birth." },
  { s: GA, q: "Kathakali, a mask dance is primarily performed in the Indian state of ____________.", o: ["Andhra Pradesh","Assam","Kerala","Uttar Pradesh"], e: "Kathakali is the classical dance-drama of Kerala, known for its elaborate makeup and masks." },
  { s: GA, q: "In March 2022, Haryana Chief Minister announced a 'Sushma Swaraj Award' for women, which carries a cash prize of _______________ along with a commendation.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1 (₹5 lakh)." },
  { s: GA, q: "Who releases the Periodic Labour Force Survey (PLFS)?", o: ["National Statistical Office","Education Ministry","Finance Ministry","NITI Aayog"], e: "The Periodic Labour Force Survey (PLFS) is conducted and released by the National Statistical Office (NSO), under MoSPI." },
  { s: GA, q: "Sultan Iltutmish introduced a metal coin named Tanka which was made of:", o: ["copper","silver","nickel","bronze"], e: "Iltutmish introduced two key coins: the silver Tanka and the copper Jital. Tanka = silver." },
  { s: GA, q: "_________, the Bharatanatyam danseuse India born was honoured with British Citizen Award for her contribution to Performing Arts in the last decade on 29 September 2021.", o: ["Ragasudha Vinjamuri","Chitra Sundaram","Pushkala Gopal","Shobana Jeyasingh"], e: "Pushkala Gopal, the India-born Bharatanatyam exponent, was honoured with the British Citizen Award (BCAa) on 29 September 2021." },
  { s: GA, q: "Which Article of the Constitution of India provides that there shall be a Governor for each State?", o: ["Article 152","Article 153","Article 157","Article 158"], e: "Article 153 of the Indian Constitution provides that there shall be a Governor for each State." },
  { s: GA, q: "What is the tenure of the Election Commissioner of India?", o: ["Five Years","Four Years","Six Years","Three Years"], e: "Per Article 324, CEC and other ECs hold office for 6 years or until age 65, whichever is earlier." },
  { s: GA, q: "Who among the following founded the Vedanta College in 1825?", o: ["Swami Dayanand Saraswati","Ishwar Chandra Vidyasagar","Raja Ram Mohan Roy","Swami Vivekananda"], e: "Raja Ram Mohan Roy founded the Vedanta College in 1825 in Calcutta to promote rational Vedantic study." },
  { s: GA, q: "Who among the following founded the Swaraj Party in 1923 along with Motilal Nehru", o: ["Chittaranjan Das","Mahatma Gandhi","Jawaharlal Nehru","Gopal Krishna Gokhale"], e: "Chittaranjan Das (CR Das) and Motilal Nehru founded the Swaraj Party on 1 January 1923 within the INC." },
  { s: GA, q: "An artificial lake named Gobind Sagar was created in 1976 by a huge hydroelectric dam at Bhakra on the _________ river.", o: ["Tapti","Gandak","Chenab","Sutlej"], e: "Gobind Sagar is the reservoir created by the Bhakra Dam on the Sutlej river in Himachal Pradesh." },
  { s: GA, q: "In which of the following years was Chittor attacked by Alauddin Khalji?", o: ["1302","1305","1303","1304"], e: "Alauddin Khalji laid siege to and conquered Chittor in 1303 CE." },
  { s: GA, q: "Most Mughal buildings are constructed using which building material?", o: ["Grey sandstone","Yellow sandstone","Red sandstone","Granite"], e: "Mughal buildings (especially Akbar's era — Fatehpur Sikri, Agra Fort, Red Fort) extensively used red sandstone." },
  { s: GA, q: "Ustad Asad Ali Khan was one of the few active Rudra Veena Players and the master of one of the four schools of Dhrupad named __________.", o: ["Nauhar","Dagar","Gauhar","Khandar"], e: "Ustad Asad Ali Khan was a master of the Khandar Bani / Vani — one of the four traditional schools (Bani) of Dhrupad." },
  { s: GA, q: "In which year was the National Youth Policy launched by the Government of India?", o: ["2015","2014","2016","2017"], e: "The National Youth Policy was launched by the Government of India in 2014 to empower youth in all aspects of life." },
  { s: GA, q: "Who among the following is the author of the book 'A Handful of Nuts'?", o: ["Tom Alter","RK Narayan","Ruskin Bond","Raja Rao"], e: "'A Handful of Nuts' (1998) is a memoir/novel by celebrated author Ruskin Bond." },
  { s: GA, q: "Mr. Pradeep Kumar Rawat was in news in December 2021. Which of the following describes the reason correctly?", o: ["He has been appointed as the ambassador to China","He has been appointed as UPSC chairperson","He is the first Chief of Defence Services","He is the Principal Advisor to Prime Minister of India"], e: "Pradeep Kumar Rawat was appointed as India's Ambassador to China in December 2021." }
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

  const TEST_TITLE = 'SSC Selection Post Phase X (Higher Secondary) - 5 August 2022 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-2',
    pyqExamName: 'SSC Selection Post Phase X (Higher Secondary)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
