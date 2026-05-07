/**
 * Seed: SSC Selection Post Phase X (Matriculation Level) PYQ - 2 August 2022, Shift-1 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-2aug2022-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/02/shift-1/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-2aug2022-s1';

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
// Reasoning Q9 and Q17 are image-based (only image assets in source folder for this paper).
const IMAGE_MAP = {
  9:  { q: `${F}-q-9.png`,
        opts: [`${F}-q-9-option-1.png`,`${F}-q-9-option-2.png`,`${F}-q-9-option-3.png`,`${F}-q-9-option-4.png`] },
  17: { q: `${F}-q-17.png`,
        opts: [`${F}-q-17-option-1.png`,`${F}-q-17-option-2.png`,`${F}-q-17-option-3.png`,`${F}-q-17-option-4.png`] }
};

// 1-based answer key (Chosen Options + GK overrides for unanswered/wrong picks).
const KEY = [
  // 1-25 (General Intelligence) — Q2/Q10 unanswered (Q2 overridden)
  2,4,4,4,1, 3,4,2,3,1, 2,2,1,3,4, 3,1,2,4,2, 4,3,4,2,4,
  // 26-50 (English Language) — Q7/Q12/Q14/Q15/Q23 wrong picks overridden
  1,2,3,3,3, 4,3,2,4,1, 3,4,4,4,4, 1,1,3,3,1, 1,2,3,1,1,
  // 51-75 (Quantitative Aptitude) — Q24 unanswered overridden
  2,3,3,1,3, 1,3,4,3,2, 1,3,4,4,2, 3,1,3,1,2, 4,4,4,3,3,
  // 76-100 (General Awareness) — many overrides for clearly wrong picks
  1,4,1,1,2, 2,4,2,4,4, 2,2,4,4,1, 4,1,4,4,2, 3,4,1,3,3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n16, 18, 24, 36, ?, 86", o: ["76","56","46","66"], e: "Differences increase: +2, +6, +12, +20, +30. 36 + 20 = 56." },
  { s: REA, q: "In a certain code language, 'PEOPLE' is written as '5' and 'ACADEMIC' is written as '7'. How will 'PRESIDENT' be written in that language?", o: ["7","9","6","8"], e: "Code = (number of letters − 1). PEOPLE(6)→5; ACADEMIC(8)→7; PRESIDENT(9)→8." },
  { s: REA, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\nFirst row: 61, 21, 185\nSecond row: 43, 26, 164\nThird row: 39, 16, ?\n\n(NOTE: Operations should be performed on the whole numbers, not their constituent digits.)", o: ["156","144","123","126"], e: "Pattern: 2a + 3b = c. Row1: 122+63=185. Row2: 86+78=164. Row3: 78+48 = 126." },
  { s: REA, q: "Which of the given letter-clusters will replace the question mark (?) in the following series?\n\nCEYS, EIAV, GMCY, ?, KUGE", o: ["IRGB","JRGB","JQEB","IQEB"], e: "1st: +2 (C,E,G,I,K). 2nd: +4 (E,I,M,Q,U). 3rd: +2 (Y,A,C,E,G). 4th: +3 (S,V,Y,B,E). Missing = IQEB." },
  { s: REA, q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nSome games are toys.\nAll blocks are games.\n\nConclusions:\nI. Some blocks are toys.\nII. All blocks are toys.", o: ["Neither conclusion I nor II follows","Both conclusions I and II follow","Only conclusion I follows","Only conclusion II follows"], e: "All blocks are games — but the 'some games which are toys' may not include any block. Neither conclusion can be definitely drawn." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the following blanks, will complete the letter-series.\n\nPO__Y__IUY_OI_YPO_U_", o: ["IOPUPUIY","IOPUPOIY","IUPOPUIY","UIPOPUIY"], e: "Per response sheet, option 3 (IUPOPUIY)." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nFEUDALS : DUEFSLA :: FREIGHT : IERFTHG :: QUARTER : ?", o: ["RUAQRET","RAUQERT","RACQUET","RAUQRET"], e: "Position rearrangement 1234567 → 4,3,2,1,7,6,5. QUARTER → R,A,U,Q,R,E,T = RAUQRET." },
  { s: REA, q: "Which letter cluster will replace the question mark (?) to complete the given series?\n\nCURE, EXUG, ?, IDAK, KGDM", o: ["HMTR","GAXI","HCYJ","HAXI"], e: "1st: +2 (C,E,G,I,K). 2nd: +3 (U,X,A,D,G). 3rd: +3 (R,U,X,A,D). 4th: +2 (E,G,I,K,M). Missing = GAXI." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "In a code language, 'MOBILE' is written as '8\\$2%¥@', 'DRAPE' is written as '9#+ @' and 'CRUEL' is written as '6#3@¥'. How will 'CRAMP' be written in that language?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Image-based code mapping. Per response sheet, option 1." },
  { s: REA, q: "Which two signs should be interchanged to make the given equation correct?\n\n63 ÷ 3 + 45 × 15 ÷ 2 = 36", o: ["+ and −","÷ and −","× and −","− and ÷"], e: "Per response sheet, option 2 (÷ and −)." },
  { s: REA, q: "In a certain code language, 'NOVEL' is written as 'SSYGM', and 'MUSIC' is written as 'RYVKD'. How will 'ORDER' be written in that language?", o: ["TVGGT","TVGGS","TVGHT","TVGHS"], e: "Shifts +5,+4,+3,+2,+1. ORDER → T,V,G,G,S = TVGGS." },
  { s: REA, q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nSome tunes are songs.\nAll tunes are melodies.\n\nConclusions:\nI. No song is a melody.\nII. All songs are melodies.", o: ["Neither conclusion I nor II follows","Only conclusion II follows","Only conclusion I follows","Both conclusions I and II follow"], e: "From statements, only 'some songs are melodies' can be inferred — but neither I (no song) nor II (all songs) follows." },
  { s: REA, q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nAll planks are woods.\nSome woods are glasses.\n\nConclusions:\nI. Some planks are glasses.\nII. All planks are glasses.", o: ["Only conclusion II follows","Only conclusion I follows","Neither conclusion I nor II follows","Both conclusions I and II follow"], e: "Even though all planks are woods, the 'some woods which are glasses' may not include planks. Neither follows." },
  { s: REA, q: "'P & Q' means 'P is the sister of Q'.\n'P % Q' means 'P is the brother of Q'.\n'P $ Q' means 'P is the mother of Q'.\n'P = Q' means 'P is the father of Q'.\n\nIf A = B $ C & D % E, then how is D related to A?", o: ["Son's son","Son's daughter","Daughter's daughter","Daughter's son"], e: "A is father of B; B (mother) of C; C sister of D, D brother of E. So B is A's daughter; D is B's son. D is A's daughter's son." },
  { s: REA, q: "In a certain code language, 'ABACUS' is written as 'BCBTVD' and 'GENDER' is written as 'OFHSFE'. How will 'IMPACT' be written in that language?", o: ["QJNDBU","JBDQNU","QNJUDB","QUNJDB"], e: "Split into halves, reverse each half, then +1 each letter. IMP→PMI→QNJ; ACT→TCA→UDB. Combined = QNJUDB." },
  { s: REA, q: "Refer to the image for the figure-series question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Frame  2. Friction  3. Fraction  4. Freight  5. Fragile  6. Freedom", o: ["3, 5, 1, 4, 6, 2","3, 5, 1, 6, 4, 2","3, 5, 6, 1, 4, 2","2, 3, 5, 1, 6, 4"], e: "Order: Fraction(3), Fragile(5), Frame(1), Freedom(6), Freight(4), Friction(2) → 3,5,1,6,4,2." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nBull : Cow :: Cock : ?", o: ["Chick","Duck","Doe","Hen"], e: "Bull (male) : Cow (female) :: Cock (male) : Hen (female)." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. Branches  2. Leaves  3. Roots  4. Stem  5. Flowers", o: ["3, 4, 2, 5, 1","3, 4, 1, 2, 5","2, 3, 5, 4, 1","3, 1, 4, 2, 5"], e: "Tree growth/structure: Roots(3) → Stem(4) → Branches(1) → Leaves(2) → Flowers(5)." },
  { s: REA, q: "In a code language, 'FREQUENT' is written as '6-18-5-17-21-5-14-20' and 'DANGER' is written as '4-1-14-7-5-18'. How will 'SOLITUDE' be written in that language?", o: ["19-15-12-9-21-20-4-5","18-15-12-8-20-21-4-5","18-15-12-19-20-21-4-5","19-15-12-9-20-21-4-5"], e: "Each letter coded by its alphabet position. S=19, O=15, L=12, I=9, T=20, U=21, D=4, E=5 → 19-15-12-9-20-21-4-5." },
  { s: REA, q: "Pointing to a person in a photograph, a man, Naren, said, \"Her daughter's son is my daughter's brother.\" How is the person related to Naren?", o: ["Daughter","Sister","Mother-in-law","Wife"], e: "Naren's daughter's brother = Naren's son. So her daughter's son = Naren's son ⇒ her daughter is Naren's wife. So she is Naren's mother-in-law." },
  { s: REA, q: "In a code language, 'BURPS' is written as 'DXVUY' and 'TARDEN' is written as 'VDVIKU'. How will 'GUARD' be written in that language?", o: ["IYFWK","JYEWK","JXFVJ","IXEWJ"], e: "Successive shifts +2,+3,+4,+5,+6. GUARD → I,X,E,W,J = IXEWJ." },
  { s: REA, q: "In a certain code language, 'HAPPY' is written as 'JBRQA' and 'MACRO' is written as 'OBESQ'. How will 'MATES' be written in that language?", o: ["OBVFV","OBVFU","OBVGU","OBWFU"], e: "Alternating +2/+1. M+2=O, A+1=B, T+2=V, E+1=F, S+2=U → OBVFU." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series to make it logically complete?\n\nPST, MPQ, JMN, GJK, ?", o: ["CFG","CGH","DHG","DGH"], e: "Each letter shifts back by 3. P→M→J→G→D; S→P→M→J→G; T→Q→N→K→H. Missing = DGH." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate option to replace the underlined word in the given sentence.\n\nShe is so naïve.", o: ["gullible","meek","illiterate","silly"], e: "'Naïve' (innocent, easily deceived) = 'gullible'." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe battery of the car has been used by the boy for his games.", o: ["The boy used the battery of the car for his games.","The boy has used the battery of the car for his games.","The boy might have used the battery of the car for his games.","The boy was using the battery of the car for his games."], e: "Present perfect passive 'has been used' → active 'has used'." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Strength","Custom","Polution","Promise"], e: "'Polution' is misspelled — correct spelling is 'Pollution' (with double-l)." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nSit tight", o: ["Sit straight","Be conscious","Wait patiently","Walk slowly"], e: "'Sit tight' means to wait patiently / not move." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nOne should __________ one's promises.", o: ["take","hide","keep","give"], e: "'Keep one's promises' is the standard collocation (to fulfil a promise)." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nAmaze", o: ["Assure","Commit","Praise","Astonish"], e: "'Amaze' = 'Astonish' (to surprise greatly)." },
  { s: ENG, q: "Parts of the given sentence have been given as options. One of them contains a spelling error. Select the option that rectifies the error.\n\nIt is important to imediately report a bullying incident to the trusted elders.", o: ["bullying","incident","immediately","trusted"], e: "'Imediately' is misspelled — correct = 'Immediately' (option 3)." },
  { s: ENG, q: "Select the correct meaning of the idiom in bold and italics.\n\nThe scheme says nothing new; it doesn't break new ground.", o: ["To look into your own matter","To do something innovative","To do something that you should not be doing","Out of operational conditions"], e: "'Break new ground' = to do something innovative / pioneering." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nRarely", o: ["Seldom","Every time","Sometimes","Frequently"], e: "'Rarely' (not often) — antonym 'Frequently' (often)." },
  { s: ENG, q: "Select the correctly spelt word to fill in the blank.\n\nGeeta was appointed __________ of Physics in a reputed college in Pune.", o: ["Professor","Professur","Porfessor","Profesor"], e: "Correct spelling: 'Professor'." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nThe newsreader said that he was there for a heartfelt apology for making such a comment.", o: ["The newsreader said, \"I have been here for a heartfelt apology for making such a comment.\"","The newsreader said, \"I was here for a heartfelt apology for making such a comment.\"","The newsreader said, \"I am here for a heartfelt apology for making such a comment.\"","The newsreader said, \"I do come here for a heartfelt apology for making such a comment.\""], e: "Reported 'was there' → direct 'I am here' (present tense + first person + 'here')." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined words in the given sentence.\n\nIn the olden days, most of the groundwater was safe to drink because there was no contamination from industries or sewage.", o: ["vulnerable","edible","useful","potable"], e: "'Safe to drink' = 'potable' (drinkable / fit for drinking)." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nThe ability to laughter is peculiar to mankind.", o: ["ability to laughed","ability to laughable","ability to laughing","ability to laugh"], e: "'Ability to' takes a base infinitive verb — 'ability to laugh'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe henna design on her hand was really ________.", o: ["reversible","solid","compatible","intricate"], e: "'Intricate' (complex / elaborately detailed) fits a henna design." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nPrejudice", o: ["Preconception","Prophecy","Influence","Fairness"], e: "'Prejudice' (unfair, biased opinion) — antonym 'Fairness'." },
  { s: ENG, q: "Read the passage about Voltaire at Ferney and answer the question.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'Voltaire entered one of the most active (1) _____ of his life.'", o: ["period","stretch","periods","day"], e: "'one of the most active period of his life' — singular fits the construction." },
  { s: ENG, q: "Read the passage about Voltaire at Ferney and answer the question.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'He (2) _______ not be true to himself, however, without stirring up village feuds...'", o: ["could","will","should","can"], e: "'Could not be true to himself without...' fits a hypothetical past construction." },
  { s: ENG, q: "Read the passage about Voltaire at Ferney and answer the question.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'He renovated the church and had Deo erexit Voltaire (3) ________ on the facade.'", o: ["knapped","formed","carved","modelled"], e: "'Carved' (engraved / inscribed) fits — words carved on a façade." },
  { s: ENG, q: "Read the passage about Voltaire at Ferney and answer the question.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'Such generous interventions in local politics (4) _______ him enormous popularity.'", o: ["netted","scored","earned","accumulated"], e: "'Earned him popularity' is the standard collocation." },
  { s: ENG, q: "Read the passage about Voltaire at Ferney and answer the question.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'He kept up an (5) ________ correspondence...'", o: ["enormous","grandiose","infinite","goodly"], e: "'Enormous correspondence' (very large in volume) fits the context." },
  { s: ENG, q: "Read the passage about lack of moral values in Indian society and answer.\n\nSelect the most appropriate ANTONYM for: PREVALENT", o: ["Rare","Pervasive","Nonvalent","Common"], e: "'Prevalent' (widespread) — antonym 'Rare' (uncommon)." },
  { s: ENG, q: "Read the passage about lack of moral values in Indian society and answer.\n\nSelect the most appropriate synonym for: INCENTIVE", o: ["Extensive","Inducement","Intensive","Strong"], e: "'Incentive' = 'Inducement' (something that motivates)." },
  { s: ENG, q: "Read the passage about lack of moral values in Indian society and answer.\n\nSelect from among the given options the most appropriate title for the passage.", o: ["Indian Society","Significance of culture","Lack of Moral Values","Cultural System"], e: "The passage centres on the lack of moral values causing the present crisis — best title is 'Lack of Moral Values'." },
  { s: ENG, q: "Read the passage about lack of moral values in Indian society and answer.\n\nWhat is the style used in writing the given passage?", o: ["Argumentative","Descriptive","Narrative","Dramatic"], e: "The passage argues a viewpoint about moral values, leadership and corruption — argumentative style." },
  { s: ENG, q: "Read the passage about lack of moral values in Indian society and answer.\n\nWhich of the following facts is mentioned in the given passage?", o: ["Lack of effective leadership resulted in the failure of Indian society to provide a new direction to its people.","For a successful system of governance, moral values are not essential.","Moral and cultural values account for the crisis in Indian society.","Government is responsible for the moral and cultural behaviour of people."], e: "Per passage: 'Indian society could not lay down the foundations strong enough to evolve an effective leadership which could give a new direction to the people.'" },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "The average marks obtained by 60 students in a certain examination are 35. If the average marks of the students who passed are 39, and that of the students who failed are 15, how many students passed the examination?", o: ["45","50","60","55"], e: "Let p = passed, f = 60−p. 39p + 15(60−p) = 35·60 ⇒ 24p = 1200 ⇒ p = 50." },
  { s: QA, q: "Find the difference between compound interest and simple interest for 2 years at 10% p.a. on a sum of Rs.400.", o: ["Rs.3","Rs.5","Rs.4","Rs.1"], e: "CI − SI for 2 yrs = P·(R/100)² = 400·(0.1)² = ₹4." },
  { s: QA, q: "A person buys a ceiling fan for Rs.1,600 and sells it at a loss of 18%. What is the selling price of the ceiling fan?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "SP = 1600 × (1 − 0.18) = 1600 × 0.82 = ₹1,312. Per response sheet, option 3." },
  { s: QA, q: "In an election there were only two candidates. 20% of the voters did not cast their votes and 1000 votes were declared invalid. The winner, by obtaining 70% of the total valid votes, defeated his rival by 1200 votes. The total number of voters in the election was ________.", o: ["5000","6000","7000","8000"], e: "Diff 70%−30% = 40% of valid = 1200 ⇒ valid = 3000. 0.8T − 1000 = 3000 ⇒ T = 5000." },
  { s: QA, q: "The perimeter of a square is 168 metres. What is its area?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Side = 168/4 = 42 m. Area = 42² = 1764 m². Per response sheet, option 3." },
  { s: QA, q: "Amit can complete a piece of work in 4 days and Raju can complete the same in 6 days. How long will they take, if both Amit and Raju work together?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Together rate = 1/4 + 1/6 = 5/12. Time = 12/5 = 2.4 days. Per response sheet, option 1." },
  { s: QA, q: "A chair is bought for Rs.800 and sold for Rs.750. Find the loss percentage.", o: ["62.5%","7.05%","6.25%","5.25%"], e: "Loss = 50. Loss% = 50/800 × 100 = 6.25%." },
  { s: QA, q: "In an election between two candidates, 90% of the voters cast their votes, out of which 5% of the votes were declared invalid. A candidate got 12825 votes, which were 75% of the total valid votes. Find the total number of voters enrolled in that election.", o: ["16525","18000","15825","20000"], e: "Valid = 0.95 × 0.9T = 0.855T. 0.75 × 0.855T = 12825 ⇒ T = 20000." },
  { s: QA, q: "A successive discount of 11%, 10% and 30% is equal to:", o: ["42.93%","46.26%","43.93%","56.07%"], e: "Net price factor = 0.89 × 0.90 × 0.70 = 0.5607. Total discount = 1 − 0.5607 = 43.93%." },
  { s: QA, q: "In an election of college students' president, a total of 2500 votes were polled. Akshit, Sumit and Rajni were contesting for the election. 10% of the total votes were rejected due to different reasons. Akshit received half of the votes received by Sumit. The average of Akshit's and Sumit's votes was equal to Rajni's votes. How many votes did Akshit receive?", o: ["1000","500","600","555"], e: "Valid = 2250. A = S/2; R = (A+S)/2 = 3S/4. A+S+R = 9S/4 = 2250 ⇒ S = 1000, A = 500." },
  { s: QA, q: "Ramesh covered a total distance of 275 km on bike. For the first three hours, his speed was 65 km/h and for the rest of the journey his speed came down to 40 km/h. Find the average speed of the bike.", o: ["55 km/h","65 km/h","75 km/h","45 km/h"], e: "First 3h: 195 km. Remaining 80 km at 40 km/h = 2h. Total: 275 km in 5h ⇒ 55 km/h." },
  { s: QA, q: "The current population of a town is 50,000. If it is growing at 6%, compounded every year, what will be the population of the town after two years?", o: ["56000","56280","56180","56080"], e: "50000 × (1.06)² = 50000 × 1.1236 = 56,180." },
  { s: QA, q: "The speeds of three cars are in the ratio of 5 : 4 : 3. What is the ratio between the time taken by these cars to cover the same distance?", o: ["10 : 12 : 20","8 : 10 : 12","11 : 15 : 25","12 : 15 : 20"], e: "Time ∝ 1/Speed. Ratio = 1/5 : 1/4 : 1/3 = (LCM 60) 12 : 15 : 20." },
  { s: QA, q: "In a discount scheme, there is 35% discount on the marked price of Rs.4,800, but the sale is finalised at Rs.2,184 only. What additional discount did the customer get?", o: ["20%","34%","42%","30%"], e: "After 35% off: 4800·0.65 = 3120. Final = 2184. Additional discount = (3120−2184)/3120 × 100 = 30%." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "The third proportional to 0.009 and 0.6 is:", o: ["0.004","36","40","0.54"], e: "Third proportional = b²/a = (0.6)²/0.009 = 0.36/0.009 = 40." },
  { s: QA, q: "Refer to the image for the question.", o: ["720","1440","630","840"], e: "Per response sheet, option 1 (720)." },
  { s: QA, q: "Sudhir runs a certain distance at a speed of 13 km/h for 7 minutes. He again walks for 7 minutes at a speed of 3 km/h. What is his average speed for the whole journey?", o: ["7 km/h","6 km/h","8 km/h","4 km/h"], e: "Distance = (13+3) × (7/60) = 16·(7/60) km. Total time = 14 min = 14/60 h. Avg = 16·(7/60)/(14/60) = 8 km/h." },
  { s: QA, q: "The fourth proportional of 24, 32 and 36 is:", o: ["48","40","45","46"], e: "Fourth proportional = (32 × 36)/24 = 1152/24 = 48." },
  { s: QA, q: "The marked price of mustard oil is 10% more than its cost price. At what per cent less than the marked price should it be sold, to have no profit and no loss?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Discount needed = (MP−CP)/MP × 100 = 10/110 × 100 ≈ 9.09% (9 1/11 %). Per response sheet, option 2." },
  { s: QA, q: "On what sum of money will the difference between simple interest and compound interest for 2 years at 10% per annum be equal to Rs.250?", o: ["Rs.45,000","Rs.35,000","Rs.20,000","Rs.25,000"], e: "Diff CI−SI for 2 yrs = P·(R/100)² ⇒ P·(0.1)² = 250 ⇒ P = ₹25,000." },
  { s: QA, q: "Ramesh walks a certain distance and rides back in 5 hours 45 minutes. If he could ride both ways in 3 hours 30 minutes, find the time required by Ramesh to walk both ways.", o: ["5 hours","7 hours","6 hours","8 hours"], e: "(walk + ride) = 5h45m. (ride + ride) = 3h30m. So (walk + walk) = 2(5h45m) − 3h30m = 11h30m − 3h30m = 8 hours." },
  { s: QA, q: "A can work twice as fast as B. If they complete a work together in 18 days, then in how many days will B alone complete the same work?", o: ["58","56","52","54"], e: "Let B = x days, A = x/2. 1/A + 1/B = 1/18 ⇒ 3/x = 1/18 ⇒ x = 54 days." },
  { s: QA, q: "How many prime numbers are there between 30 to 85?", o: ["12","15","13","14"], e: "Primes between 30 and 85: 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83 — total 13." },
  { s: QA, q: "In what ratio must sugar at the rate of Rs.41/kg be mixed with sugar at the rate of Rs.55/kg so that the mixture is worth Rs.49/kg?", o: ["5 : 6","2 : 3","3 : 4","4 : 5"], e: "By alligation: (55 − 49) : (49 − 41) = 6 : 8 = 3 : 4." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "What was the name of the mascot of the Paralympics – 2020?", o: ["Someity","Miraitowa","Bing DwenDwen","Soohorang"], e: "Someity was the mascot of Tokyo 2020 Paralympics. (Miraitowa = Olympics, Bing DwenDwen = Beijing 2022, Soohorang = PyeongChang 2018)." },
  { s: GA, q: "In the temples built by the Gupta rulers in ancient India, which of the following parts was the idol of the main deity installed?", o: ["Jagati","Shikhara","Mandapa","Garbhagriha"], e: "The Garbhagriha is the innermost sanctum housing the main deity's idol in Hindu temple architecture." },
  { s: GA, q: "Western disturbances cause:", o: ["rainfall during winters in the north west part of India","rainfall during winters in the south part of India","rainfall during summers in the north west part of India","rainfall during summers in the north east part of India"], e: "Western disturbances are extra-tropical storms that bring winter rain (and snow on Himalayas) to north-western India." },
  { s: GA, q: "Bahauddin Dagar is associated with which musical instrument?", o: ["Rudra Veena","Sitar","Flute","Sarod"], e: "Ustad Bahauddin Dagar of the Dagar family is renowned for the Rudra Veena (Dhrupad tradition)." },
  { s: GA, q: "Among the following Sufi saints, whose dargah is located at Ajmer?", o: ["Bahauddin Zakariya","Moin-ud-din Chishti","Fariduddin Ganjshakar","Ali Hujwiri"], e: "Khwaja Moin-ud-din Chishti's dargah is at Ajmer (Ajmer Sharif Dargah)." },
  { s: GA, q: "Who was appointed as the Chief Economic Advisor of India in January 2022?", o: ["Krishnamurthy Subramanian","Dr V Anantha Nageswaran","Arvind Subramanian","Raghuram Rajan"], e: "Dr V. Anantha Nageswaran was appointed CEA on 28 January 2022, succeeding Krishnamurthy Subramanian." },
  { s: GA, q: "Which enzyme is present in pancreatic juice?", o: ["Bile","Pepsin","Maltase","Amylase"], e: "Pancreatic juice contains pancreatic amylase (along with lipase and trypsin)." },
  { s: GA, q: "Chemancheri Kunhiraman Nair, born in Kerala, was a ________ dancer.", o: ["Mohiniyattam","Kathakali","Kuchipudi","Kathak"], e: "Guru Chemancheri Kunhiraman Nair (1916-2021) was a celebrated Kathakali dancer/exponent from Kerala." },
  { s: GA, q: "The Ryotwari system was started first in which of the following Presidencies of British India?", o: ["Bengal","Bombay","Burma","Madras"], e: "Ryotwari system was first introduced by Thomas Munro in the Madras Presidency (1820)." },
  { s: GA, q: "Cholesterol rich food can lead to:", o: ["muscular dystrophy","dementia","weak bones and muscles","cardiovascular disease"], e: "High cholesterol intake is linked to cardiovascular disease (atherosclerosis, heart attacks)." },
  { s: GA, q: "Which committee estimated poverty on the basis of nutritional requirements?", o: ["Thakurdas Committee","Alagh Committee","Tendulkar Committee","Lakdawala Committee"], e: "Y.K. Alagh Committee (1979) was the first to estimate poverty based on nutritional (calorie) requirements." },
  { s: GA, q: "How many Fundamental Duties are given in the Constitution?", o: ["12","11","10","9"], e: "Article 51A originally listed 10 Fundamental Duties; the 86th Amendment (2002) added the 11th, totalling 11." },
  { s: GA, q: "The 'Sepahijala Wildlife Sanctuary' is located in which Indian state?", o: ["Uttar Pradesh","Karnataka","Madhya Pradesh","Tripura"], e: "Sepahijala Wildlife Sanctuary is in the Sepahijala district of Tripura, famous for its primates (especially spectacled langurs)." },
  { s: GA, q: "In the state assembly elections held in February-March 2022, the Aam Aadmi Party (AAP) formed the government in which of the following states?", o: ["Goa","Manipur","Uttar Pradesh","Punjab"], e: "AAP won 92/117 seats in Punjab in March 2022; Bhagwant Mann became CM." },
  { s: GA, q: "In February 2022, which state government tabled a bill in the state assembly that has provisions for up to 10-year jail term and a fine of up to Rs.10 crore for anyone found guilty of leaking question paper in government examinations?", o: ["Rajasthan","Gujarat","Madhya Pradesh","Maharashtra"], e: "Rajasthan Public Examination (Measures for Prevention of Unfair Means in Recruitment) Bill, 2022 — up to 10 years jail and ₹10 cr fine." },
  { s: GA, q: "The initiative of 'Shatabdi Sankalp' by the government of India is associated with which of the following National festivals?", o: ["Gandhi Jayanti","Ambedkar Jayanti","Republic Day","Independence Day"], e: "'Shatabdi Sankalp' (centenary resolve, looking ahead to 100 years of independence in 2047) is part of the Independence Day / Azadi ka Amrit Mahotsav theme." },
  { s: GA, q: "The Dhamek Stupa is located in which Indian state?", o: ["Uttar Pradesh","Arunachal Pradesh","Himachal Pradesh","Bihar"], e: "Dhamek Stupa is at Sarnath, Uttar Pradesh — marking the site where Buddha gave his first sermon." },
  { s: GA, q: "Which of the following festivals is associated with the wedding of Goddess Meenakshi celebrated majorly in Tamil Nadu?", o: ["Bihula","Porag","Saga Dawa","Chithirai"], e: "Chithirai Thiruvizha (April–May) celebrates the celestial wedding of Goddess Meenakshi and Lord Sundareswarar at Madurai." },
  { s: GA, q: "What was India's sex ratio in 1951?", o: ["930 females per 1000 males","943 females per 1000 males","929 females per 1000 males","946 females per 1000 males"], e: "Per Census 1951, India's sex ratio was 946 females per 1000 males." },
  { s: GA, q: "The Great Bath of Mohenjo-Daro was built with which material?", o: ["Marble","Brick","Sandstone","Granite"], e: "The Great Bath at Mohenjo-Daro was constructed with finely fitted kiln-fired bricks lined with bitumen for waterproofing." },
  { s: GA, q: "Which of the following is an autobiography of the Indian politician Lal Krishna Advani?", o: ["Unbreakable","Wandering in Many Worlds","My Country My Life","One Life Is Not Enough"], e: "'My Country My Life' (2008) is L.K. Advani's autobiography." },
  { s: GA, q: "The ICC under-19 World Cup Cricket – 2022 tournament was held in _________.", o: ["Australia","England","New Zealand","West Indies"], e: "The ICC Under-19 Cricket World Cup 2022 was held in West Indies; India won the title." },
  { s: GA, q: "In 2019, which mission-mode water conservation campaign was launched for water-stressed districts regarding awareness and improvement of water conservation interventions?", o: ["Jal Shakti Abhiyan","Swajal Scheme","National Rural Drinking Water Programme","Jal Jeevan Mission"], e: "Jal Shakti Abhiyan (launched 1 July 2019) was a time-bound mission-mode campaign for water-stressed districts." },
  { s: GA, q: "Myopia is also known as:", o: ["long-sightedness","distance-sightedness","near-sightedness","plane-sightedness"], e: "Myopia is the medical term for near-sightedness — distant objects appear blurred." },
  { s: GA, q: "The agreement signed between Congress and Muslim League that paved the way for joint political campaign for both the Hindus and the Muslims is known as:", o: ["Cabinet Mission Plan","Poona Pact","Lucknow Pact","Wavell Plan"], e: "Lucknow Pact (1916) — joint Congress-Muslim League agreement for political reforms and joint demands for self-government." }
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

  const TEST_TITLE = 'SSC Selection Post Phase X (Matriculation) - 2 August 2022 Shift-1';
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
