/**
 * Seed: SSC Selection Post Phase X (Matriculation Level) PYQ - 2 August 2022, Shift-4 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-2aug2022-s4.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/02/shift-4/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-2aug2022-s4';

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

const F = '2-august-2022';
// Reasoning Q5 and Q14 are image-based (only image assets in source folder for this paper).
const IMAGE_MAP = {
  5:  { q: `${F}-q-5.png`,
        opts: [`${F}-q-5-option-1.png`,`${F}-q-5-option-2.png`,`${F}-q-5-option-3.png`,`${F}-q-5-option-4.png`] },
  14: { q: `${F}-q-14.png`,
        opts: [`${F}-q-14-option-1.png`,`${F}-q-14-option-2.png`,`${F}-q-14-option-3.png`,`${F}-q-14-option-4.png`] }
};

// 1-based answer key (Chosen Options + GK overrides for unanswered/wrong picks).
const KEY = [
  // 1-25 (General Intelligence)
  4,3,2,2,3, 4,1,2,4,4, 3,2,4,4,4, 4,4,4,4,1, 1,1,2,1,4,
  // 26-50 (English Language) — Q9/Q10/Q21/Q22/Q23/Q24 wrong picks overridden
  3,2,4,3,3, 4,3,3,4,4, 3,1,1,1,4, 2,4,4,2,2, 2,3,3,1,2,
  // 51-75 (Quantitative Aptitude) — Q2/Q19/Q21/Q24 unanswered, Q13/Q16 wrong overridden
  4,2,2,2,4, 3,1,4,4,3, 2,4,1,1,1, 4,4,2,1,3, 1,2,4,1,4,
  // 76-100 (General Awareness) — many overrides for clearly wrong/unanswered picks
  2,1,1,3,2, 3,4,4,3,1, 4,1,3,1,3, 1,2,3,1,4, 2,2,1,2,3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the following blanks, will complete the letter-series.\n\nZ_C_BZX__B_XCV_Z__VB", o: ["XVVCZXBC","XCVCZBXC","XCXVZBXC","XVCVZBXC"], e: "Per response sheet, option 4 (XVCVZBXC)." },
  { s: REA, q: "In a certain code language, 'PAPER' is written as 'RCSHT', and 'PRIDE' is written as 'RTLGG'. How will 'RADIO' be written in that language?", o: ["TCGKQ","TCGMR","TCGLQ","TCGLR"], e: "Shifts +2,+2,+3,+3,+2. R+2=T, A+2=C, D+3=G, I+3=L, O+2=Q → TCGLQ." },
  { s: REA, q: "Three statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nAll cameras are bells.\nSome bells are computers.\nSome computers are printers.\n\nConclusions:\nI. Some cameras are bells.\nII. All bells are computers.\nIII. Some bells are printers.", o: ["Only conclusion III follows","Only conclusion I follows","Only conclusion II follows","All of the conclusions follow"], e: "Only I follows by conversion of 'all cameras are bells'. II and III are not supported." },
  { s: REA, q: "In a certain code language, 'LIQUID' is written as 'UDILQI' and 'HANDLE' is written as 'DELHNA'. How will 'NORMAL' be written in that language?", o: ["LNMROA","MLANRO","LRMOAN","MALNRO"], e: "Position rearrangement 1234 56 → 4,6,5,1,3,2. NORMAL → M,L,A,N,R,O = MLANRO." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Which two signs should be interchanged to make the given equation correct?\n\n99 ÷ 33 × 6 + 48 − 26 = 40", o: ["+ and −","÷ and −","× and −","− and ÷"], e: "Per response sheet, option 4 (− and ÷)." },
  { s: REA, q: "Two Statements are given followed by Three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nAll fruits are flowers.\nNo flower is a leaf.\n\nConclusions:\nI. Some flowers are fruits.\nII. No fruit is a leaf.\nIII. All flowers are fruits.", o: ["Both conclusions I and II follow.","Conclusions I, II and III follow.","Both conclusions II and III follow.","Both conclusions I and III follow."], e: "I follows (conversion of 'all fruits are flowers'). II follows (all fruits ⊆ flowers, no flower is leaf → no fruit is leaf). III is too strong." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nTime : Seconds :: Power : ?", o: ["Newton","Watt","Volt","Ohm"], e: "Time is measured in Seconds; Power is measured in Watt." },
  { s: REA, q: "In a code language, 'please come over' is written as 'bnq tra mns', 'game is over' is written as 'din mns piz', 'come in please' is written as 'tra bnq pvc'. What is the code for the word 'in' in this language?", o: ["tra","din","bnq","pvc"], e: "Common eq1+eq2: 'over'=mns. Common eq1+eq3: 'please'=bnq, 'come'=tra. So in eq3, 'in' = pvc." },
  { s: REA, q: "Pointing to a person in a photograph, a man, Gaurav, said, \"He is the son of my father's daughter's husband.\" How is the person related to Gaurav?", o: ["Father","Brother","Son","Sister's son"], e: "Father's daughter = Gaurav's sister. Sister's husband = brother-in-law. His son = sister's son (Gaurav's nephew)." },
  { s: REA, q: "In a code language, 'garden is beautiful' is coded as 'ne ae ul', 'nice big garden' is coded as 'ce ig ne', and 'water is life' is coded as 'er ae fe'. What is the code for the word 'garden'?", o: ["ul","ae","ne","fe"], e: "Common to eq1 and eq2: 'garden' = ne." },
  { s: REA, q: "Which number will replace the question mark (?) in the following series?\n\n12, 14, 26, 40, 66, ?", o: ["100","106","98","118"], e: "Each term = sum of previous two (Fibonacci-like). 40 + 66 = 106." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Operation  2. Opera  3. Option  4. Opposite  5. Opinion  6. Optical", o: ["2, 1, 5, 4, 3, 6","2, 1, 4, 5, 6, 3","1, 5, 2, 4, 6, 3","2, 1, 5, 4, 6, 3"], e: "Order: Opera(2), Operation(1), Opinion(5), Opposite(4), Optical(6), Option(3) → 2,1,5,4,6,3." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nZVFM, XRJO, ?, TJRS, RFVU", o: ["VMOQ","VMOR","VNMR","VNNQ"], e: "1st: −2 (Z,X,V,T,R). 2nd: −4 (V,R,N,J,F). 3rd: +4 (F,J,N,R,V). 4th: +2 (M,O,Q,S,U). Missing = VNNQ." },
  { s: REA, q: "Three statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nAll papers are files.\nSome files are maps.\nNo map is a paint.\n\nConclusions:\nI. Some papers are files.\nII. All maps are files.\nIII. Some maps are not paints.", o: ["Only conclusion II and III follow","Only conclusions I and II follow","All of the conclusions follow","Only conclusion I and III follow"], e: "I follows by conversion. III follows from 'no map is a paint'. II is too strong." },
  { s: REA, q: "In a code language, 'GOLFER' is coded as '63' and 'PROVE' is coded as '76'. How will 'CURSE' be coded in that language?", o: ["86","75","85","66"], e: "Code = sum of alphabet positions of letters. C(3)+U(21)+R(18)+S(19)+E(5) = 66." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order. (From Small to Big)\n\n1. Apartment  2. Building  3. Room  4. Town  5. Complex", o: ["2, 1, 3, 5, 4","1, 3, 2, 4, 5","3, 5, 4, 1, 2","3, 1, 2, 5, 4"], e: "Small to big: Room(3) → Apartment(1) → Building(2) → Complex(5) → Town(4) = 3,1,2,5,4." },
  { s: REA, q: "'A & B' means 'A is the mother of B'.\n'A ^ B' means 'A is the brother of B'.\n'A @ B' means 'A is the sister of B'.\n\nIf P & Q ^ R @ S ^ T, then how is S related to P?", o: ["Daughter","Brother","Sister","Son"], e: "P is mother of Q. Q,R,S,T are siblings (Q brother, R sister, S brother). S is male (brother), so S is P's son." },
  { s: REA, q: "Which of the given letter-clusters will replace the question mark (?) in the following series?\n\nUDPJ, YHTN, CLXR, ?, KTFZ", o: ["GPBV","GPCU","GPBU","GPBW"], e: "Each letter +4 in successive clusters: U,Y,C,G,K; D,H,L,P,T; P,T,X,B,F; J,N,R,V,Z. Missing = GPBV." },
  { s: REA, q: "Which letter cluster will replace the question mark (?) to complete the given series?\n\nABCD, EEEE, ?, MKIG, QNKH", o: ["IHGF","IFGG","IFGH","IHFG"], e: "Increments: 1st +4, 2nd +3, 3rd +2, 4th +1. So 3rd cluster = I,H,G,F = IHGF." },
  { s: REA, q: "In a certain code language, 'HAPPY' is written as '12' and 'SORROW' is written as '9'. How will 'DELIGHT' be written in that language?", o: ["12","13","10","11"], e: "Per response sheet, option 1 (12)." },
  { s: REA, q: "Select the option that is related to the fifth number in the same way as the second number is related to the first number and the fourth number is related to the third number.\n\n8 : 14 :: 13 : 24 :: 9 : ?", o: ["15","16","17","13"], e: "Pattern: 2n − 2. 8·2−2=14; 13·2−2=24; 9·2−2=16." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nSPRUCES : RPSSECU :: ALRIGHT : RLATHGI :: RESPECT : ?", o: ["SERTCEP","SERCTEP","SETRCEP","SERTECP"], e: "Position rearrangement 1234567 → 3,2,1,7,6,5,4. RESPECT → S,E,R,T,C,E,P = SERTCEP." },
  { s: REA, q: "In a code language, 'keep it simple' is written as '426', 'bring the board games' is written as '5355', 'play by the rules' is written as '4235'. What is the code for the phrase 'puzzles are fun to play' in this language?", o: ["73334","63324","64325","73324"], e: "Each digit = letter count of word. puzzles(7), are(3), fun(3), to(2), play(4) = 73324." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nFish out of water", o: ["To be out of the aquatic ecosystem","To play with fish outside the pond","To be out of your comfort zone","To have some seafood out of water"], e: "'Fish out of water' = to be out of one's element / comfort zone." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Unlawful","Aweful","Dreadful","Faithful"], e: "'Aweful' is misspelled — correct is 'Awful'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the word 'dense' in the given sentence.\n\nThe African continent has thick forests but the Sahara desert area has sparse distribution of population.", o: ["Thick","Population","Distribution","Sparse"], e: "Antonym of 'dense' (thick) = 'sparse' (thinly distributed)." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nSatisfy", o: ["Agitate","Annoy","Delight","Disappoint"], e: "'Satisfy' (to please) — synonym 'Delight'." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nShe informed the students, \"The shooting location has already been very crowded and noisy.\"", o: ["She informed the students that the shooting location could already be crowded and noisy.","She informed the students that the shooting location was already been crowded and noisy.","She informed the students that the shooting location had already been crowded and noisy.","She informed the students that if the shooting location had already been crowded and noisy."], e: "Present perfect 'has been' → past perfect 'had been' in reported speech." },
  { s: ENG, q: "Select the most appropriate ANTONYM to replace the italicised word.\n\nWe wish them a lifetime of wedded bliss together.", o: ["merriness","elatedness","gaiety","misery"], e: "'Bliss' (great happiness) — antonym 'misery'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nIt is a privilege and I shall be _________ to meet the king.", o: ["pleased","happy","obliged","delighted"], e: "'Obliged' (honoured / grateful) fits the formal tone of meeting royalty." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nHit the sack", o: ["Hitting a bag","Hitting a person","Go to sleep","Fall down"], e: "'Hit the sack' = to go to bed / to sleep." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Eighth","Tenth","Nineteenth","Nineth"], e: "'Nineth' is misspelled — correct spelling is 'Ninth'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nChanges observed in Earth's climate since the early 20th century are _______ driven by human activities, particularly fossil fuel burning, which increases heat-trapping greenhouse gas levels in Earth's atmosphere, raising Earth's average surface temperature.", o: ["overall","practically","primitively","primarily"], e: "'Primarily' (mainly) is the standard term used in climate science writing for the dominant cause." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe parcel could have been misplaced by the delivery boy.", o: ["The delivery boy can misplace the parcel.","The delivery boy has misplaced the parcel.","The delivery boy could have misplaced the parcel.","The delivery boy have had misplaced the parcel."], e: "Modal perfect passive 'could have been misplaced' → active 'could have misplaced'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe dancers were _______ to know the results of the All India Dance Competition.", o: ["curious","bland","ambiguous","certain"], e: "'Curious' (eager to know) fits the context of awaiting competition results." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined words in the given sentence.\n\nFashion is something that lasts only for a short time.", o: ["ephemeral","entirety","eternal","euphoria"], e: "'Ephemeral' = lasting for a very short time." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nBoisterous", o: ["Lively","Tough","Recluse","Bold"], e: "'Boisterous' (noisy and energetic) — synonym 'Lively'." },
  { s: ENG, q: "Identify the spelling error in the given sentence and select the option that rectifies the error.\n\nYou may reffer to our research findings in this document.", o: ["documant","mey","resaerch","refer"], e: "'Reffer' is misspelled — correct is 'refer'." },
  { s: ENG, q: "Read the passage about the 'good is the enemy of great' mindset and Eliud Kipchoge.\n\nSelect the most appropriate synonym of the word 'depression' as used in the passage.", o: ["Humor","Despondence","Jollity","Gleefulness"], e: "'Depression' = 'Despondence' (state of low spirits)." },
  { s: ENG, q: "Read the passage about the 'good is the enemy of great' mindset and Eliud Kipchoge.\n\nSelect the most appropriate synonym of the word 'epidemic' as used in the passage.", o: ["Ailment","Slump","Calm","Doldrums"], e: "Per response sheet, option 4 (Doldrums)." },
  { s: ENG, q: "Read the passage about the 'good is the enemy of great' mindset and Eliud Kipchoge.\n\nSelect the most appropriate synonym of the word 'perceived' as used in the passage.", o: ["Neglected","Ignored","Disregarded","Anticipated"], e: "'Perceived' (sensed/anticipated) — closest 'Anticipated' (expected/foreseen)." },
  { s: ENG, q: "Read the passage about the 'good is the enemy of great' mindset and Eliud Kipchoge.\n\nSelect the most appropriate synonym of the word 'marathon' as used in the passage.", o: ["Ephemeral","Extended","Momentary","Fleeting"], e: "'Marathon' (long-lasting) = 'Extended'." },
  { s: ENG, q: "Read the passage about the 'good is the enemy of great' mindset and Eliud Kipchoge.\n\nSelect the most appropriate synonym of the word 'precise' as used in the passage.", o: ["Coarse","Veracious","Inexact","Defective"], e: "'Precise' (exact/accurate) = 'Veracious' (truthful/accurate)." },
  { s: ENG, q: "Read the passage about Florence and her chosen profession of nursing.\n\nSelect the option that gives the closest meaning of the following phrase:\n\nA WOMAN OF MEANS", o: ["A graceful woman","A wealthy woman","A mean woman","A compassionate woman"], e: "'A woman of means' = a wealthy woman with financial resources." },
  { s: ENG, q: "Read the passage about Florence and her chosen profession of nursing.\n\nSelect the most appropriate ANTONYM of the following word:\n\nWRETCHED", o: ["Fevered","Miserable","Cheerful","Churning"], e: "'Wretched' (very unhappy) — antonym 'Cheerful'." },
  { s: ENG, q: "Read the passage about Florence and her chosen profession of nursing.\n\nIdentify the style in which the given passage has been written.", o: ["Argumentative","Narrative","Descriptive","Dramatic"], e: "The passage describes Florence's situation, the profession's reputation and her feelings — descriptive style." },
  { s: ENG, q: "Read the passage about Florence and her chosen profession of nursing.\n\nSelect from among the given options the most suitable title for the passage.", o: ["Florence and Her Dilemma","A Woman of Means","A Life of Independence","Nursing as a Profession"], e: "The passage centres on Florence's struggle with parental opposition over her career choice — best title 'Florence and Her Dilemma'." },
  { s: ENG, q: "Read the passage about Florence and her chosen profession of nursing.\n\nWhich of the following inferences CANNOT be drawn from the given passage?", o: ["The path Florence chose was full of obstacles.","A woman of means has always lived a life of independence.","Florence did not share her parents' opinion regarding the nursing profession.","The nursing profession was considered to be of doubtful reputation in Florence's times."], e: "Per passage: it was 'almost an unimaginable thing' for a woman of means to live independently — option 2 contradicts this and CANNOT be inferred." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "Refer to the image for the question.", o: ["306","302","304","308"], e: "Per response sheet, option 4 (308)." },
  { s: QA, q: "If on a marked price, the difference of selling prices with a discount of 42% and two successive discounts of 15% and 10% is Rs.185, then the marked price is:", o: ["Rs.1,280","Rs.1,000","Rs.1,320","Rs.1,500"], e: "SP1 = MP·0.58. SP2 = MP·0.85·0.90 = MP·0.765. Diff = MP·(0.765 − 0.58) = 0.185·MP = 185 ⇒ MP = ₹1,000." },
  { s: QA, q: "The fourth proportional to 12, 15, 24 is:", o: ["20","30","25","32"], e: "Fourth proportional = (15 × 24)/12 = 30." },
  { s: QA, q: "Find the nearest integer to 5347 which is exactly divisible by 137.", o: ["5243","5343","5141","5247"], e: "5347/137 ≈ 39.03. So 39 × 137 = 5343 — nearest multiple of 137." },
  { s: QA, q: "In 1 day, 25 bottles are packed by Arjun, while 22 bottles are packed by Karan in the same time. They are working on alternate days such that Arjun works on the 1st day, Karan on 2nd, Arjun on 3rd and so on. How many bottles will be packed in 9 days?", o: ["195","210","188","213"], e: "Arjun on odd days (5 days × 25 = 125). Karan on even days (4 days × 22 = 88). Total = 213." },
  { s: QA, q: "A man walks from point A to B at a speed of 15 km/h, but comes back from point B to A at a speed of 25 km/h. Find his average speed.", o: ["17.75 km/h","22 km/h","18.75 km/h","20.70 km/h"], e: "For equal distances both ways: avg = 2·15·25/(15+25) = 750/40 = 18.75 km/h." },
  { s: QA, q: "A man donates 5% of his monthly income to an orphanage and deposits 20% of the remaining income in a bank. If he is left with Rs.14,250, find his monthly income.", o: ["Rs.18,750","Rs.19,250","Rs.17,500","Rs.20,500"], e: "Income I. Left = 0.95I − 0.20·0.95I = 0.76I = 14250 ⇒ I = ₹18,750." },
  { s: QA, q: "Refer to the image for the area question.", o: ["123.86 cm²","114.86 cm²","121.81 cm²","124.74 cm²"], e: "Per response sheet, option 4 (124.74 cm²)." },
  { s: QA, q: "The total number of students in three sections A, B and C of a class in a school is 340. The number of students in sections A and B are in the ratio 3 : 5 and those in sections B and C are in the ratio 3 : 2. What is the mean proportional between number of students in section A and the number of students in section C?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "A:B:C = 9:15:10 (after equating B). Total = 34 parts = 340 ⇒ A=90, C=100. Mean prop = √(90·100) = 30√10. Per response sheet, option 4." },
  { s: QA, q: "In an election, a candidate who gets 78% votes is elected by a margin of 504 votes. What is the total number of votes polled?", o: ["800","750","900","850"], e: "Margin = 78% − 22% = 56% of total = 504 ⇒ total = 900." },
  { s: QA, q: "Ansh bought a smartphone from his colleague Sameer for Rs.45,540 such that Sameer earned a profit of 10%. Sameer bought the phone from Anita, on which Anita earned a profit of 15%. Sujata sold that phone to Anita earning a profit of 20%. At what price (in Rs.) had Sujata bought the phone?", o: ["25,000","30,000","35,000","33,000"], e: "Sameer's CP = 45540/1.10 = 41400. Anita's CP = 41400/1.15 = 36000 (Sujata's SP). Sujata's CP = 36000/1.20 = ₹30,000." },
  { s: QA, q: "The average weight of 35 students in a class increases by 2 kg, when one of the students weighing 35 kg is replaced by a teacher. What is the weight of the teacher?", o: ["101 kg","107 kg","103 kg","105 kg"], e: "Increase in total weight = 35 × 2 = 70. Teacher's weight = 35 + 70 = 105 kg." },
  { s: QA, q: "Find the average of the prime numbers lying between 68 and 96.", o: ["79","81","80","78"], e: "Primes 71, 73, 79, 83, 89. Sum = 395. Average = 395/5 = 79." },
  { s: QA, q: "Krishna bought a computer and paid 25% less than its original price. He sold it at 48% profit on the price he had paid. Find the percentage of profit earned by Krishna on the original price.", o: ["11%","12%","13%","10%"], e: "Original = P. Krishna paid 0.75P, sold at 1.48 × 0.75P = 1.11P. Profit on original = 11%." },
  { s: QA, q: "A school is running tree plantation drive to bring awareness among students about the environment. If 3 teachers can complete the work of tree plantation in 4 days and 4 students take 6 days to do the same work, then how many days will 3 teachers and 2 students take to complete the work of tree plantation?", o: ["3","8","4","6"], e: "Combined rate: 1/4 + 2·(1/24) = 1/4 + 1/12 = 4/12 = 1/3. Days = 3." },
  { s: QA, q: "How much compound interest does Tarun have to pay on a loan of Rs.8,50,000 at the rate of 5% p.a. over a period of two years in case of annual compounding?", o: ["Rs.9,57,125","Rs.1,07,125","Rs.9,37,125","Rs.87,125"], e: "Amount = 850000 × (1.05)² = 850000 × 1.1025 = 9,37,125. CI = Amount − Principal = 9,37,125 − 8,50,000 = ₹87,125." },
  { s: QA, q: "A, B and C are three numbers. If A exceeds B by 70% and B is 20% less than C, then A : C is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "A = 1.7B, B = 0.8C ⇒ A = 1.36C. A:C = 1.36:1 = 34:25. Per response sheet, option 4." },
  { s: QA, q: "The marked price of a T-shirt is Rs.1,000. A shopkeeper offers 15% discount on the T-shirt and then again offers 20% discount on the new price. How much would the customer have to pay finally?", o: ["675","680","690","685"], e: "After 15% off: 850. After another 20% off: 850 × 0.8 = ₹680." },
  { s: QA, q: "A policeman follows a thief who is 400 m ahead of him. If they run at the speed of 7 km/h and 6 km/h, respectively, what distance does the policeman run to catch up with the thief?", o: ["2800 m","2700 m","2500 m","2600 m"], e: "Relative speed = 1 km/h. Time to cover 0.4 km = 0.4 hr. Policeman's distance = 7 × 0.4 = 2.8 km = 2800 m." },
  { s: QA, q: "The population of a town 2 years ago was 62,500. Due to migration to cities, it decreases every year at the rate of 4% per annum. Find its present population.", o: ["55600","51600","57600","53600"], e: "62500 × (0.96)² = 62500 × 0.9216 = 57,600." },
  { s: QA, q: "A thief is noticed by a policeman from a distance of 800 m. The thief starts running and the policeman chases him. The thief and the policeman run at speeds of 20 km/h and 25 km/h, respectively. What is the distance between them after 9 minutes?", o: ["50 metres","100 metres","70 metres","90 metres"], e: "Relative speed = 5 km/h. In 9 min (= 9/60 h) gap closes by 5 × 9/60 = 0.75 km = 750 m. Remaining = 800 − 750 = 50 m." },
  { s: QA, q: "A person sold an item for Rs.4,608 and earned a profit of 28%. What is the cost price of the item?", o: ["Rs.3,500","Rs.3,600","Rs.3,700","Rs.3,800"], e: "CP = SP/1.28 = 4608/1.28 = ₹3,600." },
  { s: QA, q: "The mean proportional between 0.012 and 0.027 is:", o: ["0.039","0.0075","0.0195","0.018"], e: "Mean prop = √(0.012 × 0.027) = √0.000324 = 0.018." },
  { s: QA, q: "The initial population of a country is 2,04,800. If the birth and the death rates are 12% and 7%, respectively, then find the population of the country after 2 years.", o: ["225792","226792","228792","227792"], e: "Net growth rate = 12% − 7% = 5%. Population = 204800 × (1.05)² = 204800 × 1.1025 = 225,792." },
  { s: QA, q: "What is the least value of k, so that 23k57 is divisible by 3?", o: ["3","0","2","1"], e: "Sum of digits 2+3+k+5+7 = 17+k must be divisible by 3. k = 1 gives 18 (smallest valid)." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "'A Fine Balance' is written by whom among the following writers?", o: ["Upamanyu Chatterjee","Rohinton Mistry","Ruskin Bond","Vikram Seth"], e: "'A Fine Balance' (1995) is by Rohinton Mistry, set in 1970s India during the Emergency." },
  { s: GA, q: "Which of the following pairs is correctly matched?", o: ["Vinegar – Acetic acid","Wine – Formic acid","Ginger – Citric acid","Lemon – Acetic acid"], e: "Vinegar contains acetic acid. (Wine — tartaric/malic; Ginger — gingerol/zingiberene; Lemon — citric.)" },
  { s: GA, q: "Which of the following is true about sex ratio in India during 1951 - 2011?", o: ["Has been increasing since 1991","Has been increasing since 2001","Has been increasing since 1971","Has been increasing since 1951"], e: "Sex ratio dipped to its lowest at 1991 (927) and has been improving since: 2001 (933), 2011 (940)." },
  { s: GA, q: "Which of the following is a unicellular organism?", o: ["Funaria","Morchella","Paramoecium","Ectocarpus"], e: "Paramoecium (Paramecium) is a single-celled ciliate protozoan; the others are multicellular." },
  { s: GA, q: "Who among the following teamed up with flautist Pandit Hariprasad Chaurasia and guitarist Brij Bhushan Kabra and produced a concept album titled 'Call of the Valley'?", o: ["Ustad Amjad Ali Khan","Pandit Shiv Kumar Sharma","Ustad Zakir Hussain","Pandit Vishwa Mohan Bhatt"], e: "Pandit Shiv Kumar Sharma (santoor) collaborated with Hariprasad Chaurasia and Brij Bhushan Kabra on the iconic 1967 album 'Call of the Valley'." },
  { s: GA, q: "How much collateral-free loan is provided under Pradhan Mantri Mudra Yojana (PMMY)?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "PMMY provides collateral-free loans up to ₹10 lakh. Per response sheet, option 3." },
  { s: GA, q: "Identify the option that arranges the speed of light in descending order in different mediums.", o: ["Water > Air > Glass > Diamond","Glass > Water > Air > Diamond","Diamond > Water > Air > Glass","Air > Water > Glass > Diamond"], e: "Speed of light decreases as refractive index increases. Order: Air > Water > Glass > Diamond." },
  { s: GA, q: "Fundamental Duties are placed in which part of the Constitution?", o: ["Part-II B","Part-III D","Part-I C","Part-IV A"], e: "Fundamental Duties are listed under Article 51A in Part IV-A of the Indian Constitution (added by 42nd Amendment, 1976)." },
  { s: GA, q: "In which Indian city is Itmad-ud-Daulah's tomb located?", o: ["Daulatabad","Bijapur","Agra","Mysore"], e: "Itmad-ud-Daulah's tomb (often called the 'Baby Taj') is in Agra, built 1622–1628 by Empress Nur Jahan." },
  { s: GA, q: "Who formed the Swaraj Party?", o: ["CR Das and Motilal Nehru","Mahatma Gandhi and Jawaharlal Nehru","CR Das and Annie Besant","CR Das and Abul Kalam Azad"], e: "Chittaranjan Das and Motilal Nehru founded the Swaraj Party on 1 January 1923." },
  { s: GA, q: "Which of the following are gharanas related to Kathak?", o: ["Gwalior and Agra","Patiala and Indore","Ajrara and Delhi","Jaipur and Lucknow"], e: "Major Kathak gharanas: Lucknow, Jaipur, Banaras, Raigarh. (Gwalior/Agra/Patiala — Hindustani vocal; Ajrara/Delhi — tabla.)" },
  { s: GA, q: "In 1972, which Act was implemented to protect wildlife in India?", o: ["The Wildlife (Protection) Act","Biological Diversity Act","The Environment Protection Act","Forest Act"], e: "The Wild Life (Protection) Act was enacted in 1972 for the protection of wildlife and habitats." },
  { s: GA, q: "Who built the famous Mahabodhi temple in Bodhgaya, Bihar?", o: ["Devvarman","Brihadratha","Ashoka","Bindusara"], e: "The original Mahabodhi temple at Bodh Gaya is attributed to Emperor Ashoka (c. 260 BCE)." },
  { s: GA, q: "'Bihu' is majorly celebrated in which of the following states of India?", o: ["Assam","Himachal Pradesh","Maharashtra","Kerala"], e: "Bihu is the most popular festival of Assam, marking the Assamese new year and harvest seasons." },
  { s: GA, q: "In the court of Chandragupta Maurya, Megasthenes was an ambassador of who among the following Greek kings?", o: ["Diodotus","Demetrius","Seleucus Nicator I","Antigonus"], e: "Megasthenes was sent as ambassador by Seleucus I Nicator to the court of Chandragupta Maurya at Pataliputra." },
  { s: GA, q: "The Constitution (SC and ST) Order (Amendment) Bill, 2022 to remove Bhogta caste from the list of Scheduled Castes (SC) and include certain communities in the list of Scheduled Tribes (ST) for ___________ was introduced in the Rajya Sabha in February 2022.", o: ["Jharkhand","Chhattisgarh","Bihar","Madhya Pradesh"], e: "The 2022 amendment Bill was specifically for Jharkhand — to delist 'Bhogta' from SC and add certain communities to ST list." },
  { s: GA, q: "What is the width of a cricket pitch?", o: ["12 feet","10 feet","16 feet","14 feet"], e: "A cricket pitch is 10 feet (3.05 m) wide and 22 yards long." },
  { s: GA, q: "When was the Border Road Organisation established in India?", o: ["1980","1990","1960","1970"], e: "The Border Roads Organisation (BRO) was established on 7 May 1960 to develop infrastructure in border areas." },
  { s: GA, q: "On 24 February 2022, how many years of existence did the Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) Scheme complete?", o: ["Three","Four","One","Two"], e: "PM-KISAN was launched on 24 February 2019. On 24 February 2022, it completed three years." },
  { s: GA, q: "Who among the following launched the 'Ubharte Sitaare Fund'?", o: ["Ministry of Micro, Small and Medium Enterprises","Ministry of Rural Development","Ministry of Education","Ministry of Finance"], e: "The Ubharte Sitaare Fund (USF) was launched by the Ministry of Finance on 21 August 2021 (with Exim Bank and SIDBI as sponsors)." },
  { s: GA, q: "Writer of Kitab-ul-Hind, Al-Biruni, came to India along with who among the following Turkish rulers in 9th century AD?", o: ["Masud I","Mahmud of Ghazni","Khusrau Shah","Bahram Shah"], e: "Al-Biruni (Abu Rayhan al-Biruni) accompanied Mahmud of Ghazni on his Indian campaigns and authored 'Kitab-ul-Hind' (early 11th century)." },
  { s: GA, q: "Under the Regulating Act of 1773, a Supreme Court was established at which of the following places?", o: ["Agra","Calcutta","Delhi","Bombay"], e: "The Regulating Act, 1773 led to the establishment of the Supreme Court of Judicature at Fort William in Calcutta." },
  { s: GA, q: "The twelve yearly festival of Mahamaham is celebrated in which Indian state?", o: ["Tamil Nadu","Andhra Pradesh","Telangana","Karnataka"], e: "Mahamaham is celebrated every 12 years at the Mahamaham tank in Kumbakonam, Tamil Nadu." },
  { s: GA, q: "How many times has India won the U-19 ICC Cricket World Cup?", o: ["One","Five","Two","Four"], e: "India has won the ICC U-19 Cricket World Cup five times: 2000, 2008, 2012, 2018, 2022." },
  { s: GA, q: "Name the layer of the Earth that is about 2200 kilometres (1367 mi) thick, composed mostly of nickel, iron, and molten rock and where temperatures can reach up to 50,000°C?", o: ["Oceanic crust","Continental crust","Outer core","Mantle"], e: "The Outer Core (~2,260 km thick) is composed of liquid iron-nickel and lies between the mantle and the inner core." }
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

  const TEST_TITLE = 'SSC Selection Post Phase X (Matriculation) - 2 August 2022 Shift-4';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-4',
    pyqExamName: 'SSC Selection Post Phase X (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
