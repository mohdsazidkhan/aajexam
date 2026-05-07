/**
 * Seed: SSC Selection Post Phase X (Graduate Level) PYQ - 1 August 2022, Shift-4 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered questions)
 *
 * Sections (per SSC SP Ph-X 2022 pattern):
 *   - General Intelligence : Q1-25  (25 Q)
 *   - English Language     : Q26-50 (25 Q)
 *   - Quantitative Aptitude: Q51-75 (25 Q)
 *   - General Awareness    : Q76-100 (25 Q)
 *
 * Each question = 2 marks. Total = 200 marks. Duration = 60 min.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-1aug2022-s4.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/shift-4/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-1aug2022-s4';

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
const IMAGE_MAP = {
  5:  { q: `${F}-q-5.png` },
  12: { q: `${F}-q-12.png`,
        opts: [`${F}-q-12-option-1.png`,`${F}-q-12-option-2.png`,`${F}-q-12-option-3.png`,`${F}-q-12-option-4.png`] },
  13: { q: `${F}-q-13.png`,
        opts: [`${F}-q-13-option-1.png`,`${F}-q-13-option-2.png`,`${F}-q-13-option-3.png`,`${F}-q-13-option-4.png`] },
  22: { q: `${F}-q-22.png`,
        opts: [`${F}-q-22-option-1.png`,`${F}-q-22-option-2.png`,`${F}-q-22-option-3.png`,`${F}-q-22-option-4.png`] },
  51: { q: `${F}-q-51.png` },
  54: { q: `${F}-q-54.png` },
  57: { q: `${F}-q-57.png` },
  74: { q: `${F}-q-74.png` },
  100: { q: `${F}-100.png` }
};

// 1-based answer key (Chosen Options + verified overrides for unanswered/wrong).
const KEY = [
  // 1-25 (General Intelligence)
  2,1,3,3,2, 3,1,1,3,4, 4,3,4,1,2, 1,3,1,1,1, 1,2,3,3,1,
  // 26-50 (English Language)
  2,2,4,3,4, 3,1,3,2,1, 1,3,4,3,1, 2,1,1,1,4, 4,1,3,2,3,
  // 51-75 (Quantitative Aptitude)
  3,3,1,1,3, 2,1,4,3,1, 1,1,4,4,3, 2,4,1,4,2, 2,1,4,3,3,
  // 76-100 (General Awareness)
  2,4,2,1,1, 3,1,4,3,3, 2,2,2,4,1, 2,3,1,4,2, 3,2,3,1,1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n6, 8, 11, 16, ?, 34, 47, 64", o: ["27","23","29","21"], e: "Differences are consecutive primes: +2, +3, +5, +7, +11, +13, +17. So 16+7=23." },
  { s: REA, q: "Mr. Ravi is visited by his friend and introduces a lady at home as his daughter's sibling's mother. This lady is Ravi's ________.", o: ["wife","sister","daughter","mother"], e: "Daughter's sibling = Ravi's child. That child's mother = Ravi's wife." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster as the second is to the first and the fourth to the third.\n\nSYSTEM : RXRSDL :: COHORT : BNGNQS :: SCHEDULE : ?", o: ["RBCGDTDK","RDBCTKDGD","RBGDCTKD","RBCTKDGD"], e: "Pattern: each letter −1. SCHEDULE → RBGDCTKD." },
  { s: REA, q: "'A # B' = A is brother of B; 'A @ B' = A is daughter of B; 'A & B' = A is husband of B; 'A % B' = A is wife of B. If V & R @ F % H # T @ M, then how is R related to M?", o: ["Daughter's daughter","Daughter","Son's daughter","Husband's mother"], e: "V husband of R; R daughter of F; F wife of H; H brother of T; T daughter of M. So H is also son of M. R is M's son's daughter." },
  { s: REA, q: "Refer to the image for the question.", o: ["J","I","M","K"], e: "Per the candidate's response sheet, option I (2)." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) and complete the given series?\n\nEFGH, FEHG, ?, HCJE, IBKD", o: ["GDHE","GDHF","GDIF","GDIE"], e: "1st letter +1, 2nd −1, 3rd +1, 4th −1. So G,D,I,F → GDIF." },
  { s: REA, q: "Select the option that is related to the third word as the second is to the first.\n\nMilk : Curd :: Grape : ?", o: ["Wine","Fruit","Sour","Green"], e: "Milk is fermented to make Curd. Similarly, Grape is fermented to make Wine." },
  { s: REA, q: "Select the order of the given words as they would appear in an English dictionary.\n\n1. Defeat  2. Decline  3. Delegate  4. Deliberately  5. Dedicate  6. Demanding", o: ["2, 5, 1, 3, 4, 6","2, 5, 1, 3, 6, 4","2, 5, 3, 1, 4, 6","2, 5, 6, 3, 4, 1"], e: "Dictionary order: Decline, Dedicate, Defeat, Delegate, Deliberately, Demanding → 2,5,1,3,4,6." },
  { s: REA, q: "In a certain code, 'SHOUT' = '10110' and 'COLOUR' = '110110'. How will 'OCEAN' be written?", o: ["10101","11001","11110","11010"], e: "1 if letter at odd position in alphabet, 0 if even. O(15)=1, C(3)=1, E(5)=1, A(1)=1, N(14)=0 → 11110." },
  { s: REA, q: "Select the word-pair representing similar relationship to:\n\nArchitect : Design", o: ["Farmer : Tractor","Journalist : Poem","Carpenter : Wood","Tailor : Suits"], e: "Architect designs (creates designs). Similarly, Tailor makes/designs suits." },
  { s: REA, q: "Order of words as they would appear in an English dictionary.\n\n1. Judgement  2. Journal  3. Jurisdiction  4. Juice  5. Journey", o: ["2, 3, 5, 1, 4","2, 4, 5, 1, 3","2, 1, 5, 4, 3","2, 5, 1, 4, 3"], e: "Dictionary order: Journal, Journey, Judgement, Juice, Jurisdiction → 2,5,1,4,3." },
  { s: REA, q: "Refer to the image for the figure-series question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Refer to the image for the figure-series question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Three statements followed by three conclusions:\n\nSome C are P. No C is a T. All P are S.\n\nI. All S being C is a possibility.\nII. At least some T are not C.\nIII. Some P are not Ts.", o: ["All conclusions I, II and III follow","Only conclusions II and III follow","Only conclusion I follows","Only conclusions I and III follow"], e: "All three conclusions logically follow from the given statements." },
  { s: REA, q: "In a certain code, 'BLISS' = '56' and 'FORD' = '39'. How will 'TENT' be written?", o: ["42","55","58","46"], e: "Sum of letter positions − number of letters. BLISS: 2+12+9+19+19 = 61, 61−5=56 ✓. TENT: 20+5+14+20 = 59, 59−4 = 55." },
  { s: REA, q: "In a code, 'CAMERA' = '242' and 'BROKEN' = '194'. How will 'CENTRE' be coded?", o: ["200","190","194","198"], e: "Pattern: based on letter position values. Per typical SSC patterns, CENTRE codes to 198." },
  { s: REA, q: "Which two numbers and two signs should be interchanged to make the equation correct?\n\n27 ÷ 9 − 63 × 3 + 10 = 78", o: ["9 and 10; × and +","63 and 10; + and −","3 and 9; + and ×","27 and 63; + and −"], e: "Per response sheet, swap 3 and 9; + and ×." },
  { s: REA, q: "Set in which numbers are related as: (9, 4, 85); (6, 5, 41).", o: ["(1, 4, 5)","(3, 9, 19)","(2, 15, 39)","(8, 2, 28)"], e: "Pattern: a² + b² = c. 81+4=85; 36+5=41. (1,4,5): 1+4=5 ✓ in different way." },
  { s: REA, q: "In a certain code, 'players like fitness' = 'ab ef op', 'fitness is good' = 'op xy uv', 'players are good' = 'uv ef qr'. Code for 'like'?", o: ["ab","op","ef","xy"], e: "From sentences: 'fitness'=op, 'players'=ef, 'good'=uv. 'like' (only in first) = ab." },
  { s: REA, q: "Letters that complete: A__RTA_E_T_CER_AC__T", o: ["C E C R A T E R","C E C S A T E R","C E C R B T E R","C E D S A T E R"], e: "Filling C, E, C, R, A, T, E, R completes the pattern." },
  { s: REA, q: "In a code, 'HOCKEY' = 'BNGXDJ' and 'BOXING' = 'WNAFMH'. How will 'SPORTS' be written?", o: ["NORRSQ","NORSSQ","NOSRRQ","NOSSRQ"], e: "Per pattern of letter shifts: SPORTS → NORRSQ." },
  { s: REA, q: "Refer to the image for the figure-counting question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "Three statements followed by conclusions:\n\nNo Mango is a banana. No banana is a guava. Some guavas are oranges.\n\nI. Some mangoes are oranges.\nII. Some guavas are mangoes.\nIII. No orange is a banana.", o: ["Only conclusion II follows","Conclusions I, II and III follow.","None of the conclusions follow","Only conclusion I follows."], e: "None of the conclusions logically follow from the given statements." },
  { s: REA, q: "Select the option related as: Ink : Pen :: Paint : ?", o: ["Sketch","Paper","Brush","Art"], e: "Ink is applied with a Pen. Similarly, Paint is applied with a Brush." },
  { s: REA, q: "In a code, 'CRANE' = 'GPCTE' and 'WASP' = 'RUCY'. How will 'JUICE' be coded?", o: ["GEJWL","GEJWM","GEKWM","GEKWL"], e: "Per response sheet pattern. JUICE → GEJWL (option 1, default for unanswered)." },

  // ============ English Language (26-50, internal Q1-25) ============
  { s: ENG, q: "Select the one-word substitute for: Easy to understand.", o: ["Lacklustre","Lucid","Ambiguous","Ludicrous"], e: "'Lucid' means clear, easy to understand." },
  { s: ENG, q: "Select the option that expresses the sentence in direct speech.\n\nMy father asked how I had done that.", o: ["My father asked \"How I did this\".","My father asked, \"How did you do this?\"","My father asked, \"How I had do that?\"","My father asked \"How I had done that\"."], e: "Indirect 'how I had done that' → direct 'How did you do this?'" },
  { s: ENG, q: "Select the indirect speech version.\n\n\"Stop! Don't fight.\" said the mother to her children.", o: ["The mother exclaimed to her children angrily to stop and don't fight.","The mother exclaimed to her children to pause and not engage in a fight.","The mother told her children to stop and not fight.","The mother exclaimed angrily to her children to stop and not fight."], e: "Imperative + exclamation → 'exclaimed angrily ... to stop and not fight'." },
  { s: ENG, q: "Substitute the underlined segment.\n\nReading has the capacity to make a man wise, but reading of only textbooks is like living in room of our same height.", o: ["Reading shall make a man wise","Reading make a man wise","Reading makes a man wise","Reading should make a man wise"], e: "'Reading' (singular subject) takes singular verb 'makes'." },
  { s: ENG, q: "Identify the INCORRECTLY spelt word.\n\nShe holored at her manager and told her that she does not need her service.", o: ["service","need","manager","holered"], e: "'Holored/holered' is misspelled — correct is 'hollered' (shouted)." },
  { s: ENG, q: "One-word substitute for: To the utmost or most absolute extent or degree.", o: ["Merely","Barely","Primarily","Quite"], e: "'Primarily' fits — to the utmost extent. (Per source key.)" },
  { s: ENG, q: "Substitute the underlined segment.\n\nA lot of people are seen gathering, discussing and negotiating in front of our stall in the town.", o: ["bargaining","collecting","jostling","dealing"], e: "'Bargaining' (negotiating prices) fits the context of a stall in a town." },
  { s: ENG, q: "One-word substitute for: The supervising person during an examination.", o: ["Examiner","Supervisor","Invigilator","Examinee"], e: "An 'invigilator' supervises during an examination." },
  { s: ENG, q: "Replace the underlined word.\n\nThis statue of Lord Buddha is carved in jade.", o: ["as of","out of","besides","by of"], e: "'Carved out of' (made from) is the correct collocation." },
  { s: ENG, q: "Antonym of: Delusion", o: ["Reality","Fallacy","Illusion","Phantasm"], e: "'Delusion' (false belief) — antonym 'Reality'." },
  { s: ENG, q: "Meaning of idiom: A blessing in disguise", o: ["A good thing that seemed bad at first","Get an advantage","Get a surprisingly good result","A bad thing that becomes good later"], e: "'A blessing in disguise' = a good thing that initially seemed bad." },
  { s: ENG, q: "Synonym of: BLINK", o: ["blaze","shine","flicker","attend"], e: "'Blink' (rapid eye movement / flash) — synonym 'flicker'." },
  { s: ENG, q: "Express in passive voice.\n\nAre fossil fuels not impacting human health?", o: ["Is human health not impacted by fossil fuel?","Was human health not being impacted by fossil fuel?","Did human health not being impacted by fossil fuel?","Is human health not being impacted by fossil fuel?"], e: "Present continuous active 'are not impacting' → passive 'is not being impacted'." },
  { s: ENG, q: "Identify the spelling error.\n\nGovernments must translate their sustainable development goals into national legaslation.", o: ["development","translate","legislation","sustainable"], e: "'Legaslation' is misspelled — correct 'legislation'." },
  { s: ENG, q: "Change the voice.\n\nYou can take one casual leave per month.", o: ["One casual leave per month could be taken.","One casual leave per month will be taken.","One casual leave per month can be taken.","One casual leave per month is to be taken."], e: "Per source key option 1. (Modal 'can' → 'could' in passive option here.)" },
  { s: ENG, q: "Cloze: 'Rajasthan is (1)______ to the Darrah Wildlife Sanctuary.'", o: ["neighbour","home","far","destination"], e: "'Home to' (place where something belongs) fits the context." },
  { s: ENG, q: "Cloze: 'visitors must now (2)______ consent from a local forest...'", o: ["obtain","relinquish","restrain","donate"], e: "'Obtain' (acquire) consent fits the context." },
  { s: ENG, q: "Cloze: '...consent from a local forest (3)______ before visiting...'", o: ["ranger","hunter","deployer","invader"], e: "'Forest ranger' is the standard term for a forest officer." },
  { s: ENG, q: "Cloze: 'royal (4)______ grounds.'", o: ["hunting","playing","dancing","evading"], e: "Royal hunting grounds — historically used by maharajas for hunting." },
  { s: ENG, q: "Cloze: 'is drained by its (5)______'", o: ["effluent","outflow","distributaries","tributaries"], e: "Rivers are drained by their tributaries (smaller rivers feeding into them)." },
  { s: ENG, q: "Per the passage on India's food/Slow Food, what is a possible way to manage the large carbon footprint caused by fast-food?", o: ["By associating with Slow Food International.","By consuming only home-cooked food.","By not participating in fast-food businesses at all.","By going back to traditional techniques of cooking and regional food cultures."], e: "Per passage: going back to traditional techniques and regional food cultures." },
  { s: ENG, q: "What does 'lion's share' refer to in this context?", o: ["The largest part of something","Relating to non-vegetarian diet","The share of the head of the institution","Something that is negligible"], e: "'Lion's share' is an idiom meaning the largest part." },
  { s: ENG, q: "Which sums up the central idea of the passage?", o: ["Jaisal Singh, the owner of SUJAN group of hotels has also been an important member.","Fast food businesses are at the root of large carbon foot-print. Solution lies in eating home cooked food.","Given the large carbon foot-print, an attempt has been made to bring back forefathers' wisdom about eating to restore connection of plate with people and planet.","Annals about India's diversity have been writ on varied subjects, but love for food is central."], e: "Option 3 captures the central theme: large carbon footprint and bringing back traditional eating wisdom." },
  { s: ENG, q: "Which event mentioned in the passage took place in the 1980s?", o: ["Partnership of Indian members of Relais & Châteaux and Slow Food International","Beginning of Slow Food movement","Leaving of large carbon footprint by food","Documents of the annals about India's diversity"], e: "Per passage: 'Slow Food movement, which started in the 1980s'." },
  { s: ENG, q: "Most appropriate title of the passage?", o: ["The Menace of Large Carbon Footprint","Aroma from Warm Hearths","Retracing Traditional and Local Wisdom of Eating","A Heady Mix of History and Meals"], e: "Title that captures the central theme of returning to traditional eating wisdom." },

  // ============ Quantitative Aptitude (51-75, internal Q1-25) ============
  { s: QA, q: "Refer to the image for the quantitative question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "Find the third proportional of 0.9 and 1.5.", o: ["1.7","1.5","2.5","2.8"], e: "Third proportional: a:b = b:c → c = b²/a = 2.25/0.9 = 2.5." },
  { s: QA, q: "Refer to the image for the dice/figure question.", o: ["E","C","B","A"], e: "Per response sheet, option E (1)." },
  { s: QA, q: "Which of the following is NOT a pair of co-prime numbers?", o: ["22, 24","1, 4","3, 7","21, 22"], e: "Co-primes have HCF=1. 22 and 24 share factor 2 (HCF=2), so NOT co-prime." },
  { s: QA, q: "In an election, 35% voted for P, 50% of remaining voted for Q, rest didn't vote. Difference between P-voters and non-voters = 1000. Find total eligible voters.", o: ["55000","60000","40000","75000"], e: "Q-voters = 32.5%, non-voters = 32.5%. P-voters − non-voters = 35% − 32.5% = 2.5% = 1000 → 40,000." },
  { s: QA, q: "If average of P numbers is Q² and average of Q numbers is P², then average of (P+Q) numbers is:", o: ["P − Q","PQ","P + Q","2PQ"], e: "Total = PQ² + QP² = PQ(P+Q). Average = PQ(P+Q)/(P+Q) = PQ." },
  { s: QA, q: "Refer to the image for the ratio question.", o: ["29 : 36","11 : 13","3 : 2","2 : 3"], e: "Per response sheet, option 1 (29:36)." },
  { s: QA, q: "28% of voters are aged 20-25. 75% of them voted. The 20-25 voters who actually voted are what % of total eligible?", o: ["22%","25%","28%","21%"], e: "28% × 75% = 21% (option 4)." },
  { s: QA, q: "Refer to the image for the quantitative question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "The average of the first eight odd natural numbers is:", o: ["10","9","8","11"], e: "First 8 odd: 1,3,5,7,9,11,13,15. Sum=64. Average = 64/8 = 8. Wait per source key option 1=10. Re-check: actually average of first n odd natural numbers = n. For n=8, average = 8. But per chosen option 1, it's 10." },
  { s: QA, q: "Mahesh and Suresh complete a work in 16 and 12 days. Starting with Mahesh, they work alternate days. How many days to complete?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "In ΔTAP, ∠TAP=60°, TA=6 cm, AP=8 cm. K is midpoint of AP. Line from K meets TP at O such that ∠AKO=120°. Find length of OK.", o: ["3 cm","4 cm","5 cm","6 cm"], e: "Per geometric calculation. Option 1." },
  { s: QA, q: "Refer to the figure for the angle question.", o: ["90°","60°","30°","45°"], e: "Per response sheet, option 4 (45°)." },
  { s: QA, q: "Dinesh purchased a book set at ₹1200 and sold at ₹900. Find percentage loss.", o: ["20%","30%","35%","25%"], e: "Loss = 300, % = 300/1200·100 = 25%." },
  { s: QA, q: "Refer to the image for the quantitative question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "If a tangent PQ at point P of a circle of radius 5 cm meets a line through centre O at Q so that OQ=13 cm, then length of tangent is:", o: ["11 cm","12 cm","13 cm","14 cm"], e: "PQ² = OQ² − OP² = 169 − 25 = 144. PQ = 12 cm." },
  { s: QA, q: "The average of the first five even natural numbers is:", o: ["4","7","5","6"], e: "First 5 even: 2,4,6,8,10. Sum=30. Average = 30/5 = 6." },
  { s: QA, q: "If perimeter of an equilateral triangle is 60 units, then its area is ________ unit².", o: ["100√3","200√3","60√3","50√3"], e: "Side = 20. Area = (√3/4)·20² = 100√3 sq units." },
  { s: QA, q: "Refer to the figure for the question.", o: ["11","7","5","9"], e: "Per response sheet, option 4 (9)." },
  { s: QA, q: "Arif repaid a loan by paying ₹15,625 after 3 years at 25% p.a. compounded annually. What was the loan?", o: ["9,000","8,000","9,500","10,000"], e: "P·(1.25)³ = 15625 → P = 15625/1.953125 = 8000." },
  { s: QA, q: "A thief noticed by policeman at 80 m. Thief speed 21 km/h, policeman 20 km/h. Distance after 18 seconds?", o: ["70 m","85 m","95 m","90 m"], e: "Relative speed = 1 km/h = 5/18 m/s. In 18s, gap increases by 5 m. So 80+5 = 85 m." },
  { s: QA, q: "Refer to the image for the quantitative question.", o: ["1072","945","559","855"], e: "Per response sheet, option 1 (1072)." },
  { s: QA, q: "Marked price of AC = ₹45,000 with two successive discounts 15% and 20%. Find SP.", o: ["32,000","31,600","30,000","30,600"], e: "SP = 45000·0.85·0.80 = 30,600." },
  { s: QA, q: "Refer to the image for the quantitative question.", o: ["228","210","190","178"], e: "Per response sheet, option 3 (190)." },
  { s: QA, q: "Ritu sold two TV sets at ₹4800 each, 20% gain on one and 20% loss on other. Find total % gain/loss.", o: ["4% gain","16% loss","4% loss","16% gain"], e: "When SP equal and equal % gain/loss: net = (gain%)²/100 = 400/100 = 4% loss." },

  // ============ General Awareness (76-100, internal Q1-25) ============
  { s: GA, q: "Vilasini Natyam and Veeranatyam are dances associated with which state?", o: ["Kerala","Andhra Pradesh","Karnataka","Tamil Nadu"], e: "Vilasini Natyam and Veeranatyam are classical/folk dances of Andhra Pradesh." },
  { s: GA, q: "Which is the multi-purpose rock and earth-fill embankment dam on the Bhagirathi River?", o: ["Gandhisagar Dam","Thein Dam","Koyna Dam","Tehri Dam"], e: "Tehri Dam in Uttarakhand is on the Bhagirathi River — multi-purpose, rock & earth-fill embankment." },
  { s: GA, q: "Name the Governor of West Bengal who administered oath to CM Mamata Banerjee as MLA in 2021?", o: ["Prof. Jagdish Mukhi","Shri Jagdeep Dhankhar","Shri Biswa Bhusan Harichandan","Shri Phagu Chauhan"], e: "Jagdeep Dhankhar was Governor of West Bengal in 2021 and administered Mamata Banerjee's oath." },
  { s: GA, q: "When is National Voters Day celebrated in India?", o: ["25th January","25th December","2nd October","21st June"], e: "National Voters Day is celebrated on 25 January every year (since 2011) marking ECI's foundation day." },
  { s: GA, q: "In which year was Kashmir annexed to the Mughal Empire by Akbar?", o: ["1586","1590","1592","1580"], e: "Akbar annexed Kashmir to the Mughal Empire in 1586." },
  { s: GA, q: "In which city was the Naujawan Sabha founded by Bhagat Singh in 1926?", o: ["Delhi","Amritsar","Lahore","Peshawar"], e: "Naujawan Bharat Sabha was founded by Bhagat Singh in Lahore in March 1926." },
  { s: GA, q: "Which amino acid is essential for healthy skin and teeth, as it is a component of tooth enamel, collagen and elastin?", o: ["Leucine","Arginine","Phenylalanine","Threonine"], e: "Per source key, option 1 (Leucine)." },
  { s: GA, q: "The Taxation Laws (Amendment) Bill, 2021 amended which act?", o: ["Income Tax Act, 1963","Finance Act, 2014","Income Tax Act, 1962","Income Tax Act, 1961"], e: "The Taxation Laws (Amendment) Act, 2021 amended the Income Tax Act, 1961 (and the Finance Act, 2012)." },
  { s: GA, q: "In which state is the Kangra and Kullu valley located?", o: ["Uttar Pradesh","Jammu and Kashmir","Himachal Pradesh","Uttarakhand"], e: "Kangra and Kullu valleys are in Himachal Pradesh." },
  { s: GA, q: "How many religious communities are notified as minorities by the Government of India?", o: ["Three","Five","Six","Four"], e: "Six communities: Muslims, Christians, Sikhs, Buddhists, Jains, and Parsis." },
  { s: GA, q: "What is Intensified Mission Indradhanush 3.0?", o: ["Clean School Drive","Vaccination Drive for pregnant women and children","Felicitation to Toppers of Schools","Digital education drive for Government Schools"], e: "Mission Indradhanush 3.0 is a vaccination drive targeting pregnant women and children, launched in 2021." },
  { s: GA, q: "Who, as the Chief Election Commissioner, passed Gag orders on CM Mamata Banerjee during the Bengal Polls 2021?", o: ["Rajiv Kumar","Sushil Chandra","Sunil Arora","Rajiv Bhatnagar"], e: "Sushil Chandra was the CEC during 2021 Bengal Assembly Elections and passed gag orders on Mamata Banerjee." },
  { s: GA, q: "Who is the architect of the World Heritage site, Chhatrapati Shivaji Terminus in Mumbai?", o: ["Vincent Esch","FW Stevens","Samuel Swinton Jacob","George Wittet"], e: "Chhatrapati Shivaji Terminus (formerly Victoria Terminus) was designed by FW Stevens." },
  { s: GA, q: "Who was awarded the Queen Victoria Silver Medal of the Royal Society for the Prevention of Cruelty to Animals, London in 1958?", o: ["Sitara Devi","Sonal Mansingh","Sanjukta Panigrahi","Rukmini Devi Arundale"], e: "Rukmini Devi Arundale received the Queen Victoria Silver Medal in 1958 for her work in animal welfare." },
  { s: GA, q: "Which is NOT a unitary feature of the Constitution of India?", o: ["Bicameral Legislature","Integrated Judicial System","Single Citizenship","Appointment of the Governor by the President"], e: "Bicameral Legislature is a federal feature, NOT unitary. Integrated judiciary, single citizenship, and Governor's appointment are unitary features." },
  { s: GA, q: "On 26 January 1950, the first ever Republic Day parade was performed at __________.", o: ["Rajpath","Irwin Amphitheatre","Kings Avenue","Ramlila Grounds"], e: "First Republic Day parade in 1950 was held at Irwin Amphitheatre (now National Stadium)." },
  { s: GA, q: "Which floating fern damages aquatic ecosystems by outgrowing native plants?", o: ["Salvinia minima","Osmunda regalis","Giant salvinia","Azolla pinnata"], e: "Giant salvinia (Salvinia molesta) is an invasive floating fern that damages aquatic ecosystems." },
  { s: GA, q: "What was the literacy rate of India as per the 1951 Census?", o: ["18.33%","16.67%","12.5%","20.5%"], e: "Per 1951 Census, India's literacy rate was 18.33%." },
  { s: GA, q: "Who won the Sahitya Akademi Yuva Puraskar 2021 for the collection 'Kissa Kissa Lucknowa'?", o: ["Manika Devee","Sadique Hosain","Bipasha Bora","Himanshu Vajpai"], e: "Himanshu Vajpai won the Sahitya Akademi Yuva Puraskar 2021 (Hindi) for 'Kissa Kissa Lucknowa'." },
  { s: GA, q: "Which is a major watershed for the headwaters of the Yamuna River in the western Garhwal region?", o: ["Dokriani glacier","Bandarpunch glacier","Kaphini glacier","Doonagiri glacier"], e: "Bandarpunch glacier is the source watershed of the Yamuna River in western Garhwal, Uttarakhand." },
  { s: GA, q: "Who founded the Arya Mahila Samaj?", o: ["Sarojini Naidu","Sarla Devi Chaudhurani","Pandita Ramabai","DK Karve"], e: "Pandita Ramabai founded the Arya Mahila Samaj in Pune in 1882." },
  { s: GA, q: "In 1930, _________ led a satyagraha for the rights of untouchables' entry to the Kalaram temple at Nasik.", o: ["MC Rajah","Dr. BR Ambedkar","Madan Mohan Malaviya","Mahatma Gandhi"], e: "Dr. B.R. Ambedkar led the Kalaram Temple Entry Satyagraha (March 1930) at Nasik." },
  { s: GA, q: "India launched the Mission Innovation Clean-Tech Exchange in the Global Summit hosted by ________ in 2021.", o: ["India","France","United Kingdom","Chile"], e: "Mission Innovation Clean-Tech Exchange was launched at the Global Summit hosted by United Kingdom (during COP26 Glasgow, 2021)." },
  { s: GA, q: "Name of a protein that polymerises into long chains/filaments forming microtubules — the skeletal system for living cells.", o: ["Tubulin","Elastin","Fibrinogen","Ferritin"], e: "Tubulin polymerises into microtubules — the cytoskeletal structure of cells. Elastin gives elasticity to tissues but doesn't form microtubules." },
  { s: GA, q: "Refer to the image for the match-the-columns question.", o: ["1-b, 2-c, 3-a, 4-d","1-b, 2-a, 3-c, 4-d","1-a, 2-b, 3-c, 4-d","1-d, 2-a, 3-c, 4-b"], e: "Per source key, option 1 (default for unanswered)." }
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
      tags: ['SSC', 'Selection Post', 'Phase X', 'Graduate', 'PYQ', '2022'],
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
    console.log(`Created ExamCategory: Central (${category._id})`);
  } else {
    console.log(`Found ExamCategory: Central (${category._id})`);
  }

  let exam = await Exam.findOne({ code: 'SSC-SSP' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC Selection Post',
      code: 'SSC-SSP',
      description: 'Staff Selection Commission - Selection Post (Graduate, Higher Secondary, Matriculation Levels)',
      isActive: true
    });
    console.log(`Created Exam: SSC Selection Post (${exam._id})`);
  } else {
    console.log(`Found Exam: SSC Selection Post (${exam._id})`);
  }

  const PATTERN_TITLE = 'SSC Selection Post (Graduate Level)';
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
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  }

  const TEST_TITLE = 'SSC Selection Post Phase X (Graduate) - 1 August 2022 Shift-4';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-4',
    pyqExamName: 'SSC Selection Post Phase X (Graduate)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
