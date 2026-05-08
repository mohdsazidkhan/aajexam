/**
 * Seed: SSC Selection Post Phase X (Matriculation Level) PYQ - 5 August 2022, Shift-4 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-5aug2022-s4.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/05/shift-4/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-5aug2022-s4';

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

const F = '5-august-2022';
// Reasoning Q12 and Q23 are image-based (only image assets in source folder for this paper).
const IMAGE_MAP = {
  12: { q: `${F}-q-12.png`,
        opts: [`${F}-q-12-option-1.png`,`${F}-q-12-option-2.png`,`${F}-q-12-option-3.png`,`${F}-q-12-option-4.png`] },
  23: { q: `${F}-q-23.png`,
        opts: [`${F}-q-23-option-1.png`,`${F}-q-23-option-2.png`,`${F}-q-23-option-3.png`,`${F}-q-23-option-4.png`] }
};

// 1-based answer key (Chosen Options + GK overrides for unanswered/wrong picks).
const KEY = [
  // 1-25 (General Intelligence)
  1,2,1,4,1, 1,4,3,1,1, 1,1,1,4,2, 4,2,3,4,3, 4,3,3,3,3,
  // 26-50 (English Language) — Q2/Q3/Q5/Q11/Q15/Q16/Q22 wrong picks overridden
  2,3,1,2,3, 2,4,2,1,1, 1,4,3,1,1, 3,4,2,3,2, 1,3,1,1,2,
  // 51-75 (Quantitative Aptitude) — Q13 unanswered overridden
  2,4,3,4,2, 3,3,2,2,1, 2,3,4,1,3, 4,3,3,4,2, 2,4,1,1,2,
  // 76-100 (General Awareness) — heavy overrides for unanswered/wrong picks
  1,1,2,1,3, 1,1,1,2,1, 1,3,1,4,2, 2,1,4,3,1, 3,1,4,4,4
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n66, 86, 126, ?, 366", o: ["206","208","350","308"], e: "Differences double: +20, +40, +80, +160. 126+80=206, 206+160=366." },
  { s: REA, q: "Which of the given letter-clusters will replace the question mark (?) in the following series?\n\nLUGA, HQCW, DMYS, ?, VEQK", o: ["ZIVO","ZIUO","ZJUO","ZJVO"], e: "Each letter shifts back by 4. L,H,D,Z,V; U,Q,M,I,E; G,C,Y,U,Q; A,W,S,O,K. Missing = ZIUO." },
  { s: REA, q: "In a code language, 'OCEAN' is written as 'SGIER' and 'FISH' is written as 'JMWL'. How will 'RIVER' be written in that language?", o: ["VMZIV","VMXJV","VNZIV","UMZIU"], e: "Each letter +4. RIVER: R+4=V, I+4=M, V+4=Z, E+4=I, R+4=V → VMZIV." },
  { s: REA, q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nSome movies are dramas.\nNo drama is a comedy.\n\nConclusions:\nI. Some movies are comedies.\nII. All movies can never be comedies.", o: ["Neither conclusion I nor II follows","Only conclusion I follows","Both conclusions I and II follow","Only conclusion II follows"], e: "Some movies are dramas, and no drama is a comedy → those movies cannot be comedies, so II (possibility statement) follows." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series to make it logically complete?\n\nVAR, YDU, BGX, EJA, ?", o: ["HMD","HND","GLC","HME"], e: "Each letter +3. V,Y,B,E,H; A,D,G,J,M; R,U,X,A,D. Missing = HMD." },
  { s: REA, q: "In a certain code language, 'STOOL' is written as '405', and 'SKY' is written as '165'. How will 'TABLE' be written in that language?", o: ["200","205","210","195"], e: "Code = (sum of letter positions) × (number of letters). TABLE: (20+1+2+12+5) × 5 = 40 × 5 = 200." },
  { s: REA, q: "In a certain code language, 'CAT' is written as '2124' and 'BAR' is written as '1923'. How will 'FISH' be written in that language?", o: ["114865","59243","88624","920107"], e: "Per response sheet, option 4 (920107)." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation.\n\n96 * 21 * 65 * 8 * 2 * 335", o: ["+, −, ×, ÷, =","÷, +, −, ×, =","−, +, ×, ÷, =","+, ÷, −, =, ×"], e: "Apply −, +, ×, ÷, =: 96 − 21 + 65 × 8 ÷ 2 = 96 − 21 + 260 = 335. ✓" },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order. (From top to Bottom)\n\n1. Chin  2. Eyes  3. Hair  4. Mouth  5. Nose", o: ["3, 2, 5, 4, 1","2, 3, 5, 4, 1","2, 5, 1, 3, 4","1, 3, 2, 4, 5"], e: "Top to bottom: Hair(3), Eyes(2), Nose(5), Mouth(4), Chin(1) → 3,2,5,4,1." },
  { s: REA, q: "In a certain code language, 'BREAD' is written as '5*#$9' and 'BRANCH' is written as '5*$!%8'. How will 'CAND' be written in that language?", o: ["%$!9","%#!9","%!#9","%*!9"], e: "Letter→symbol map: B=5, R=*, A=$, N=!, C=%, D=9 (and E=#, H=8). CAND → %, $, !, 9 = %$!9." },
  { s: REA, q: "In a certain code language, 'REASON' is written as 'VODPEJ' and 'ORIGIN' is written as 'SILDRJ'. How will 'MEDIUM' be written in that language?", o: ["QUGFEI","IUEFEQ","QEGFUI","IEGFUQ"], e: "Per response sheet, option 1 (QUGFEI)." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nNo book is a novel.\nAll novels are diaries.\n\nConclusions:\nI. All diaries can never be books.\nII. Some books are diaries.", o: ["Only conclusion I follows","Neither conclusion I nor II follows","Only conclusion II follows","Both conclusions I and II follow"], e: "All novels (which are not books) are diaries — so at least those diaries can never be books, making 'all diaries can never be books' (a possibility statement) follow." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nSink : Drown :: Refuse : ?", o: ["Short","Sad","Push","Deny"], e: "'Sink' and 'Drown' are synonyms. Similarly, 'Refuse' and 'Deny' are synonyms." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the following blanks, will complete the letter-series.\n\nC__NM_VBN_CV__MC_BN_", o: ["VBCNCMVM","VBCMBNVM","VBCNBNVM","VBCNCNVB"], e: "Per response sheet, option 2 (VBCMBNVM)." },
  { s: REA, q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nAll shrubs are plants.\nSome herbs are plants.\n\nConclusions:\nI. All shrubs being herbs is a possibility.\nII. No herb is a shrub.", o: ["Neither conclusion I nor II follows","Both conclusions I and II follow","Only conclusion II follows","Only conclusion I follows"], e: "Possibility-type conclusion I follows (cannot be ruled out — shrubs and herbs may overlap within plants). II is too strong." },
  { s: REA, q: "In a certain code language, 'WATER' is written as '18120523' and 'BURNT' is written as '202118142'. How will 'STRAIN' be written in that language?", o: ["1420181517","1420181919","1920181914","1420181920"], e: "Pattern: swap first and last letters, then write alphabet positions. STRAIN → NTRAIS → 14,20,18,1,9,19 → 1420181919." },
  { s: REA, q: "In a certain code language, 'FULLY' is written as 'ETKKX' and 'GIVEN' is written as 'FHUDM'. How will 'EARLY' be written in that language?", o: ["DASLY","FCSNY","DZQKX","FBSMZ"], e: "Each letter shifts back by 1. EARLY: E−1=D, A−1=Z, R−1=Q, L−1=K, Y−1=X → DZQKX." },
  { s: REA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nJINGLE : JONGLI :: WASTED : WESTID :: CRIMINAL : ?", o: ["CROMINAL","CROMINEL","CROMONEL","CRIMONEL"], e: "Each vowel shifts to the next vowel in cycle (A→E→I→O→U→A). CRIMINAL vowels I,I,A → O,O,E ⇒ CROMONEL." },
  { s: REA, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\nFirst row - 112, 59, 169\nSecond row - 78, 66, 142\nThird row - 137, 85, ?", o: ["238","216","242","220"], e: "Pattern: c = a + b − 2. 112+59−2=169 ✓; 78+66−2=142 ✓; 137+85−2 = 220." },
  { s: REA, q: "'A @ B' means 'A is the father of B'.\n'A & B' means 'A is the mother of B'.\n'A # B' means 'A is the husband of B'.\n'A % B' means 'A is the sister of B'.\n\nIf G % W # K & C @ M, then M is the grand Daughter of G's ________.", o: ["Father","Mother","Brother","Sister"], e: "G is W's sister ⇒ W is G's brother. W & K are couple; K is mother of C; C is father of M. So M is W's grandchild = G's brother's grandchild." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. River  2. Reign  3. Rest  4. Reinstate  5. Relate  6. Repeat", o: ["2, 4, 3, 5, 6, 1","2, 4, 6, 5, 3, 1","2, 4, 5, 6, 3, 1","2, 5, 4, 6, 3, 1"], e: "Order: Reign(2), Reinstate(4), Relate(5), Repeat(6), Rest(3), River(1) → 2,4,5,6,3,1." },
  { s: REA, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nFUHX, ?, JOPN, LLTI, NIXD", o: ["HRMT","HSKR","HRLS","HSMR"], e: "1st:+2 (F,H,J,L,N). 2nd:−3 (U,R,O,L,I). 3rd:+4 (H,L,P,T,X). 4th:−5 (X,S,N,I,D). Missing = HRLS." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe files were being cleared by Shilpa as per the principal's instructions.", o: ["Shilpa has cleared the files as per the principal's instructions.","Shilpa was clearing the files as per the principal's instructions.","Shilpa were clearing the files as per the Principal's instructions.","Shilpa can be clearing the files as per the principal's instructions."], e: "Past-continuous passive 'were being cleared' → past-continuous active 'was clearing'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nDuring our recent visit to Delhi during the COVID lockdown, we were shocked to find that the railway station was _________ crowded.", o: ["vehemently","generally","surprisingly","heavily"], e: "'Surprisingly crowded' fits 'shocked to find' — unexpected crowding during lockdown." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nBashful", o: ["Introverted","Concussed","Experimented","Expanded"], e: "'Bashful' (shy / reserved) — synonym 'Introverted'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nBetter", o: ["Verse","Worse","Best","Good"], e: "'Better' — antonym 'Worse'." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Truly","Duly","Wholy","Sadly"], e: "'Wholy' is misspelled — correct is 'Wholly' (with double-l)." },
  { s: ENG, q: "Select the most appropriate synonym to replace the italicised word.\n\nIt was a desolate wasteland except for some grazing sheep.", o: ["cheerful","lonely","cordial","festive"], e: "'Desolate' (uninhabited / bleak) — synonym 'lonely'." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nLet us prayer.", o: ["Let us be prayed.","Let us be prayer.","Let us praying.","Let us pray."], e: "After 'Let us', the verb takes the base/infinitive form: 'Let us pray'." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nNirmala scored forty runs in the school cricket match.", o: ["Forty runs scored by Nirmala in the school cricket match.","Forty runs were scored by Nirmala in the school cricket match.","Forty runs had been scored by Nirmala in the school cricket match.","Forty runs was being scored by Nirmala in the school cricket match."], e: "Past simple active 'scored' → past simple passive 'were scored'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nPull yourself together", o: ["Calm down","Stand by your opinion","Pull your clothes","Pull your hair"], e: "'Pull yourself together' = calm down / regain composure." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Causmetic","Turmeric","Playful","Detergent"], e: "'Causmetic' is misspelled — correct is 'Cosmetic'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nUnder the weather", o: ["Feeling sick","Rainy and cloudy weather","Having bad weather","Having good weather"], e: "'Under the weather' = feeling unwell / slightly sick." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nCONQUER", o: ["subdue","crush","overthrow","surrender"], e: "'Conquer' (defeat / win) — antonym 'surrender' (yield)." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA meal that is usually taken late in the morning that combines a late breakfast and an early lunch", o: ["Lunch","Snacks","Brunch","Breakfast"], e: "'Brunch' = a meal eaten in late morning, combining breakfast and lunch." },
  { s: ENG, q: "Substitute one word for the italicised expression.\n\nThe death of the veteran leader was followed by a year of absence of Government in the whole of North India.", o: ["anarchy","calm","harmony","peace"], e: "'Anarchy' = absence of government / political disorder." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Sieze","Believe","Receive","Relieve"], e: "'Sieze' is misspelled — correct is 'Seize' (i before e except after c rule applies)." },
  { s: ENG, q: "Read the passage about honey bees, and answer.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'Honey bees... an important part of the ecosystem (1)__________ us.'", o: ["within","across","around","prior to"], e: "'Around us' fits — bees are part of the ecosystem around (surrounding) us." },
  { s: ENG, q: "Read the passage about honey bees, and answer.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'they are constantly exposed to many (2)_____________.'", o: ["elements","sunrays","tasks","threats"], e: "'Exposed to many threats' fits the context of diseases and parasites." },
  { s: ENG, q: "Read the passage about honey bees, and answer.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'They are particularly (3)_________ to diseases and parasites'", o: ["contrary","vulnerable","dissimilar","insensible"], e: "'Vulnerable to diseases' is the natural collocation." },
  { s: ENG, q: "Read the passage about honey bees, and answer.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'it is very easy for the disease to (4)___________.'", o: ["originate","convert","spread","dominate"], e: "'For the disease to spread' fits — diseases propagate quickly in colonies." },
  { s: ENG, q: "Read the passage about honey bees, and answer.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'honeybees have some (5)____________ behaviours to help them fight infections.'", o: ["offensive","overt","specific","voluntary"], e: "Per response sheet, option 2 (overt)." },
  { s: ENG, q: "Read the passage about Xandersol contamination in Anchorstown, and answer.\n\nWhat is the theme of the passage?", o: ["Responsibility of pharmaceutical companies","Xandersol spill in Anchorstown","Plight of the residents in Anchorstown","Effect of Xandersol"], e: "The passage focuses on identifying who is responsible for the Xandersol contamination — pharmaceutical companies' responsibility is the central theme." },
  { s: ENG, q: "Read the passage about Xandersol contamination in Anchorstown, and answer.\n\nWhat is the appropriate title for the passage?", o: ["Water contamination","Plight of residents","Who spilled Xandersol?","Adverse effects of Xandersol"], e: "The passage is investigative — focusing on the question of which company is responsible. 'Who spilled Xandersol?' captures this central inquiry." },
  { s: ENG, q: "Read the passage about Xandersol contamination in Anchorstown, and answer.\n\nWhat is the tone of the passage?", o: ["News","Appreciative","Accusive","Diplomatic"], e: "The passage reports the situation in factual journalistic style — News tone." },
  { s: ENG, q: "Read the passage about Xandersol contamination in Anchorstown, and answer.\n\nIdentify the appropriate fact from the passage.", o: ["Residents have started using makeshift Xandersol filters","Pharmaceutical companies are closed","The culprit is punished","Residents are fleeing the town"], e: "Per passage: 'residents have resorting to fitting out their taps with makeshift Xandersol filters'." },
  { s: ENG, q: "Read the passage about Xandersol contamination in Anchorstown, and answer.\n\nWhy are the pharmaceutical companies under scrutiny?", o: ["Pharmaceutical companies are irresponsible","Xandersol was spilled from a pharmaceutical company","Pharmaceutical companies are bad","Pharmaceutical companies are good"], e: "Per passage: Xandersol residue was found at a pharmaceutical company's sewer entrance, suggesting the spill originated there." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "If Rakesh's income exceeds Surinder's income by 90% and Surinder's income is less than Sandeep's income by 10%, then find the ratio of the incomes of Rakesh and Sandeep.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "R = 1.9·S, S = 0.9·D ⇒ R = 1.71·D ⇒ R:D = 171:100. Per response sheet, option 2." },
  { s: QA, q: "Refer to the image for the speed-related question (PDF text was garbled).", o: ["45","35","30","40"], e: "Per response sheet, option 4 (40 km/h)." },
  { s: QA, q: "Refer to the image for the volume question.", o: ["2424.5 cm³","2423.5 cm³","2425.5 cm³","2426.5 cm³"], e: "Per response sheet, option 3 (2425.5 cm³)." },
  { s: QA, q: "What is the height of a cuboid whose total surface area is 650 cm²? The cuboid is 10 cm long and 7 cm wide.", o: ["12 cm","14 cm","18 cm","15 cm"], e: "TSA = 2(lb+bh+lh) ⇒ 2(70 + 7h + 10h) = 650 ⇒ 140 + 34h = 650 ⇒ h = 15 cm." },
  { s: QA, q: "A person covers a distance of 24 km at 8 km/h, a distance of 18 km at 9 km/h and a distance of 12 km at 3 km/h. What is the average speed?", o: ["7 km/h","6 km/h","7.5 km/h","6.5 km/h"], e: "Total dist = 54 km. Total time = 24/8 + 18/9 + 12/3 = 3+2+4 = 9 h. Avg = 54/9 = 6 km/h." },
  { s: QA, q: "The count of bacteria in a sample grows by 24% during the first hour. It decreases by 15% during the next one hour and again decreases by 10% during the third hour. If the present count of bacteria in the sample is 55000, then what will be the net increase/decrease in the count of bacteria after three hours?", o: ["Decrease, 2728","Increase, 2827","Decrease, 2827","Increase, 2728"], e: "Net factor = 1.24 × 0.85 × 0.90 = 0.9486. New = 55000 × 0.9486 ≈ 52173. Decrease = 55000 − 52173 = 2827." },
  { s: QA, q: "Refer to the image for the question.", o: ["8 days","7 days","6 days","5 days"], e: "Per response sheet, option 3 (6 days)." },
  { s: QA, q: "A family has an annual income of Rs.8,00,000, out of which they save some money. They spend 15% of the total income on health. The expenditure done on education is half of the expenditure incurred on rent. The expenditure on food was Rs.40,000, which is 10% of the expenditure on rent. How much money (in Rs.) is saved?", o: ["Rs.60,000","Rs.40,000","Rs.80,000","Rs.70,000"], e: "Health=120000, Food=40000, Rent=400000 (food is 10% of rent), Education=200000 (half of rent). Total spent=760000. Saved = ₹40,000." },
  { s: QA, q: "What is the compound interest on Rs.8,125 for 2 years at 4% per annum compounded yearly?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "CI = 8125·(1.04)² − 8125 = 8788 − 8125 = ₹663. Per response sheet, option 2." },
  { s: QA, q: "Refer to the image for the question.", o: ["32","27","26","30"], e: "Per response sheet, option 1 (32)." },
  { s: QA, q: "A thief seeing a policeman from a distance of 550 metres started running at a speed of 9 km/h. The policeman began to chase him immediately, at a speed of 11 km/h and the thief was caught. What is the distance run by the thief before he was caught by the policeman?", o: ["2485 metres","2475 metres","2470 metres","2480 metres"], e: "Relative speed = 2 km/h. Time to catch = 0.55/2 = 0.275 h. Thief's distance = 9 × 0.275 = 2.475 km = 2475 m." },
  { s: QA, q: "A man borrowed Rs.46,000 at 5% per annum compound interest, compounded annually. How much money (in Rs.) will he pay as interest at the end of 2 years to clear his debt?", o: ["50715","48227","4715","6712"], e: "CI = 46000·(1.05)² − 46000 = 50715 − 46000 = ₹4715." },
  { s: QA, q: "A number is cube of 53. When 7 times of 57 is subtracted from the number, then the resultant number which is formed will be divisible by:", o: ["12","19","13","11"], e: "53³ = 148877. 7·57 = 399. 148877 − 399 = 148478. Alternating sum 1−4+8−4+7−8 = 0 ⇒ divisible by 11." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "The HCF of 72, 108 and 360 is _______.", o: ["1080","360","36","72"], e: "72 = 2³·3²; 108 = 2²·3³; 360 = 2³·3²·5. GCD = 2²·3² = 36." },
  { s: QA, q: "The average of 10 numbers is 8. What will be the new average if each of the numbers is multiplied by 7?", o: ["45","55","52","56"], e: "If each number is multiplied by 7, the average is also multiplied by 7. New avg = 8 × 7 = 56." },
  { s: QA, q: "Amit earned a gain of 15% on selling his bike for Rs.80,500. At what price (in Rs.) would Amit have bought his bike?", o: ["Rs.68,000","Rs.75,000","Rs.70,000","Rs.78,000"], e: "CP = SP/1.15 = 80500/1.15 = ₹70,000." },
  { s: QA, q: "Swati can do a piece of work in 60 days. She worked at it for 12 days and then Yogi finished it in 24 days. How long will they together take to complete the work?", o: ["30 days","28 days","20 days","25 days"], e: "Swati did 12/60 = 1/5. Yogi did 4/5 in 24 days ⇒ Yogi rate = 1/30. Together = 1/60+1/30 = 1/20 ⇒ 20 days." },
  { s: QA, q: "Manoj and Kritika divide a sum of Rs.20,000 in the ratio of 5 : 3. If Rs.6,000 is added to each of their shares, what would be the new ratio formed?", o: ["31 : 27","45 : 37","35 : 25","37 : 27"], e: "Manoj=12500, Kritika=7500. After adding 6000: 18500:13500 = 37:27." },
  { s: QA, q: "A baby stroller is sold for Rs.12,320 by allowing a discount of 30% on its marked price. Find the marked price of a baby stroller.", o: ["Rs.18,500","Rs.17,600","Rs.17,320","Rs.12,700"], e: "MP = 12320/0.70 = ₹17,600." },
  { s: QA, q: "A shopkeeper gains 30% after allowing a discount of 20% on the marked price of an article. Find his profit per cent if the articles are sold at a marked price allowing no discount.", o: ["60.5%","62.5%","65.5%","62%"], e: "Let CP=100. SP after 20% off = 130 ⇒ MP = 162.5. Without discount, profit% = 62.5%." },
  { s: QA, q: "If mean proportional of K and 32 is 16, then what is the value of K?", o: ["9","7","6","8"], e: "Mean prop: 16² = K × 32 ⇒ K = 256/32 = 8." },
  { s: QA, q: "The CP of an article is Rs.7,000. By selling it, a person gains 10%. How much should the person sell it for to get a gain of Rs.50 more?", o: ["Rs.7,750","Rs.7,850","Rs.7,650","Rs.7,600"], e: "Original gain = 10% of 7000 = 700. New gain = 750. SP = 7000 + 750 = ₹7,750." },
  { s: QA, q: "How much chicory at Rs.5 per kg should be added to 10 kg of coffee at Rs.12 per kg so that the mixture will be worth Rs.7.50 per kg?", o: ["18 kg","20 kg","22 kg","15 kg"], e: "Alligation: chicory:coffee = (12−7.5):(7.5−5) = 4.5:2.5 = 9:5. Coffee=10 kg ⇒ chicory = 18 kg." },
  { s: QA, q: "Two mobile phones and one LED TV cost Rs.27,000, while two LED TVs and one mobile phone cost Rs.29,802. The value of one LED TV is:", o: ["Rs.10,866","Rs.10,868","Rs.10,870","Rs.10,864"], e: "2m+t=27000; m+2t=29802. Subtract: t−m=2802. Add: 3m+3t=56802 ⇒ m+t=18934 ⇒ t = (18934+2802)/2 = ₹10,868." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Refer to the image for the question (PDF text was garbled).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: GA, q: "Who among the following leaders of British India became the first female Indian President of the Indian National Congress in 1925?", o: ["Sarojini Naidu","Madam Bhikaji Cama","Annie Besant","Sucheta Kripalani"], e: "Sarojini Naidu was the first Indian woman President of the INC at the Kanpur session in 1925. (Annie Besant was the first woman President in 1917 — but she was British/Irish-born.)" },
  { s: GA, q: "In which Indian state is Jaitak Fort located?", o: ["Punjab","Himachal Pradesh","Maharashtra","Arunachal Pradesh"], e: "Jaitak Fort is located in Sirmaur district of Himachal Pradesh; built by Gurkha leader Ranjor Singh Thapa in 1810." },
  { s: GA, q: "Refer to the image for the question (PDF text was garbled).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet (default), option 1." },
  { s: GA, q: "Narendra Nath Datta, the prime follower of Ramakrishna Paramahamsa is also known as:", o: ["Swami Dayanand Sarasvati","Ishwar Chandra Vidyasagar","Swami Vivekananda","Swami Sahajanand"], e: "Narendra Nath Datta took the monastic name Swami Vivekananda; he was Sri Ramakrishna's leading disciple." },
  { s: GA, q: "DDT and plastic are:", o: ["non-biodegradable wastes","chemical-based fertilisers","bio fertilisers","biodegradable wastes"], e: "DDT and plastics are persistent / non-biodegradable wastes that do not decompose naturally." },
  { s: GA, q: "The writer of Bhuddhacharita, Ashvaghosha, was the court poet of who among the following Kushana rulers?", o: ["Kanishka","Vasishka","Kujula Kadphises","Vasudeva"], e: "Ashvaghosha, author of 'Buddhacharita' and 'Saundarananda', adorned the court of Kushana emperor Kanishka." },
  { s: GA, q: "According to Basic Road Statistics of India 2017-2018, which state has the largest share (according to length) of National Highways in India?", o: ["Maharashtra","Karnataka","Gujarat","Tamil Nadu"], e: "Per Basic Road Statistics 2017-18, Maharashtra had the largest National Highway network length among Indian states." },
  { s: GA, q: "Which of the following statements is true about the number of 'million plus cities' in India during 2001 to 2011?", o: ["Decreased from 53 to 35","Increased from 35 to 53","Decreased from 53 to 43","Increased from 45 to 53"], e: "India's million-plus cities grew from 35 in Census 2001 to 53 in Census 2011." },
  { s: GA, q: "The Delhi Special Police Establishment (Amendment) Bill, 2021, passed by the parliament in December 2021, seeks to amend the Delhi Special Police Establishment Act, __________.", o: ["1946","1952","1961","1968"], e: "The CBI is governed by the Delhi Special Police Establishment Act, 1946 — the 2021 amendment extended the CBI Director's tenure." },
  { s: GA, q: "Which of the following represents the unemployment rate?", o: ["The number of people unemployed divided by the working population","The number of people employed divided by the by the eligible population","The number of people unemployed divided by the total population","The number of people employed divided by the by the total population"], e: "Unemployment rate = (unemployed persons / labour force or working population) × 100." },
  { s: GA, q: "Which Part of the Constitution deals with Fundamental Rights?", o: ["Part-IV","Part-I","Part-III","Part-II"], e: "Fundamental Rights are listed under Part III of the Indian Constitution (Articles 12–35). Part IV deals with DPSP." },
  { s: GA, q: "What is the motto of the Birmingham – 2022 Commonwealth Games?", o: ["Games for Everyone","Ever onwards","Faster, Higher, Stronger.... Together.","United by Emotion"], e: "The official motto of Birmingham 2022 Commonwealth Games was 'Games for Everyone'. ('Faster, Higher, Stronger – Together' is the IOC Olympics motto.)" },
  { s: GA, q: "Which of the following mirrors can be used in places where bigger objects are to be viewed in a smaller size?", o: ["Concave mirror","Plane mirror","Cylindrical mirror","Convex mirror"], e: "Convex mirrors form diminished virtual images, allowing larger objects to be viewed in smaller size with a wide field of view." },
  { s: GA, q: "Which of the following harvest festivals is celebrated primarily in Maharashtra?", o: ["Vishu","Pola","Lohri","Bihu"], e: "Pola is the bullock-worship harvest festival of Maharashtra (and parts of Chhattisgarh). Vishu — Kerala; Lohri — Punjab; Bihu — Assam." },
  { s: GA, q: "Who among the following Sultans of the Delhi sultanate started the practice of Sijda and Paibos?", o: ["Shamsuddin Kayumars","Ghiyas ud din Balban","Qutb-al-Din Aibak","Muiz-ud-Din Bahram"], e: "Ghiyas-ud-din Balban introduced the Persian customs of Sijda (prostration) and Paibos (kissing the Sultan's feet) to elevate the status of the Sultan." },
  { s: GA, q: "In which of the following events did India win the gold medal at the Olympics -2020?", o: ["Javelin throw","Badminton","Tennis","Hockey"], e: "Neeraj Chopra won gold in Javelin Throw at the Tokyo 2020 Olympics — India's first individual gold in athletics." },
  { s: GA, q: "Which of the following is an Indian classical dance form?", o: ["Dhimsa","Natpuja","Bihu","Kathakali"], e: "Kathakali is one of the eight Indian classical dance forms (originating in Kerala). The others listed are folk dances." },
  { s: GA, q: "Refer to the image / fill-in-the-blank land-use question (PDF text was garbled).", o: ["Current fallow","Permanent pastures","Culturable wasteland","Wastelands"], e: "Per response sheet, option 3 (Culturable wasteland)." },
  { s: GA, q: "Prior to being appointed as the Governor of Tamil Nadu in September 2021, R.N. Ravi was the governor of the state of ___________.", o: ["Nagaland","Tripura","Sikkim","Mizoram"], e: "R.N. Ravi served as Governor of Nagaland (2019–2021) before being appointed Governor of Tamil Nadu in September 2021." },
  { s: GA, q: "Which Clause of the National Anti-Doping Bill gives National Anti-Doping Agency (NADA) the power of 'entry, search and seizure by any person authorised by the agency for the purpose of determining if any anti-doping rule violation has been committed'?", o: ["Clause 15","Clause 21","Clause 19","Clause 17"], e: "Clause 19 of the National Anti-Doping Bill empowers NADA-authorised persons to enter, search and seize for investigating anti-doping violations." },
  { s: GA, q: "Which of the following festivals is NOT associated broadly with the Indian state of Jharkhand?", o: ["Vishu","Rohini","Sarhul","Sohrai"], e: "Vishu is the Malayali New Year festival of Kerala (and Tulu region of Karnataka). Rohini, Sarhul, Sohrai are tribal festivals of Jharkhand." },
  { s: GA, q: "Which of the following describes 'gopurams'?", o: ["Church Gateways","Stupa Gateways","Tomb Gateways","Temple Gateways"], e: "Gopurams are the monumental ornate gateway towers at the entrance of South Indian (Dravidian-style) Hindu temples." },
  { s: GA, q: "'At the close of play' is an autobiography of which sportsperson?", o: ["Shane Warne","Shahid Afridi","VVS Laxman","Ricky Ponting"], e: "'At the Close of Play' is the autobiography of former Australian cricket captain Ricky Ponting (2013)." },
  { s: GA, q: "Which of the following animals have the longest small intestine?", o: ["Omnivores","Scavengers","Carnivores","Herbivores"], e: "Herbivores have the longest small intestines because plant matter (cellulose-rich) requires longer digestive processing." }
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

  const TEST_TITLE = 'SSC Selection Post Phase X (Matriculation) - 5 August 2022 Shift-4';
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
