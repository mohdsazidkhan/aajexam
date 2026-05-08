/**
 * Seed: SSC Selection Post Phase X (Matriculation Level) PYQ - 4 August 2022, Shift-3 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Note: PDF metadata header reads "Exam Date 05/08/2022" but image filenames and folder organisation
 * use the "4-august-2022" / shift-3 convention — naming follows the folder convention.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-4aug2022-s3.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/04/shift-3/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-4aug2022-s3';

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
// Reasoning Q8 and Q14 are image-based (only image assets in source folder for this paper).
const IMAGE_MAP = {
  8:  { q: `${F}-q-8.png`,
        opts: [`${F}-q-8-option-1.png`,`${F}-q-8-option-2.png`,`${F}-q-8-option-3.png`,`${F}-q-8-option-4.png`] },
  14: { q: `${F}-q-14.png`,
        opts: [`${F}-q-14-option-1.png`,`${F}-q-14-option-2.png`,`${F}-q-14-option-3.png`,`${F}-q-14-option-4.png`] }
};

// 1-based answer key (Chosen Options + GK overrides for unanswered/wrong picks).
const KEY = [
  // 1-25 (General Intelligence) — Q19/Q23 wrong picks overridden
  3,1,2,1,3, 4,3,3,4,3, 2,3,3,3,4, 1,3,2,1,4, 3,1,3,4,4,
  // 26-50 (English Language) — Q2/Q17/Q25 wrong picks overridden
  4,4,4,1,1, 1,4,1,2,4, 2,4,1,4,3, 2,1,2,3,1, 2,2,4,1,4,
  // 51-75 (Quantitative Aptitude) — Q1/Q4 wrong; Q19/Q20/Q25 unanswered overridden
  4,3,1,3,1, 3,1,1,1,3, 2,3,4,4,3, 4,4,2,3,2, 4,4,3,3,3,
  // 76-100 (General Awareness) — heavy overrides (many unanswered)
  3,1,3,2,1, 3,3,4,2,4, 3,2,3,3,4, 4,1,1,2,1, 1,3,3,2,1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "In a code language, 'JEALOUS' is written as 'QVZOLFH', 'SACRIFICE' is written as 'HZXIRURXV'. How will 'SYMPATHY' be written in that language?", o: ["HBMKZGHB","BHNKZGBS","HBNKZGSB","HCNKZGSC"], e: "Mirror cipher (A↔Z, B↔Y, ...). SYMPATHY: S→H, Y→B, M→N, P→K, A→Z, T→G, H→S, Y→B = HBNKZGSB." },
  { s: REA, q: "Which of the given letter-clusters will replace the question mark (?) in the following series?\n\nFWJT, IZMW, LCPZ, ?, RIVF", o: ["OFSC","OFTD","OFTC","OFSD"], e: "Each letter in the cluster increments by +3. Missing = OFSC." },
  { s: REA, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\nFirst row: 9, 6, 117\nSecond row: 12, 7, 193\nThird row: 13, 8, ?", o: ["231","233","243","241"], e: "Pattern: a² + b² = c. 9²+6²=117 ✓; 12²+7²=193 ✓; 13²+8² = 169+64 = 233." },
  { s: REA, q: "Pointing at a girl, Sai said, \"She is the only daughter of the father, who is the only son of my father's father.\" How is the girl related to Sai?", o: ["Sister","Daughter","Sister-in-law","Mother"], e: "Father's father's only son = Sai's father. The father's only daughter = Sai's sister." },
  { s: REA, q: "In a certain code language, 'SHARE' is written as 'TJDVJ', and 'TOTAL' is written as 'UQWEQ'. How will 'SMOKE' be written in that language?", o: ["TOSOK","TOROK","TOROJ","TOSOJ"], e: "Successive shifts +1,+2,+3,+4,+5. SMOKE: S+1=T, M+2=O, O+3=R, K+4=O, E+5=J → TOROJ." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Zebra  2. Zero  3. Zephyr  4. Zealous  5. Zeppelin  6. Zen", o: ["5, 1, 6, 3, 4, 2","2, 4, 1, 6, 3, 5","6, 1, 4, 3, 5, 2","4, 1, 6, 3, 5, 2"], e: "Order: Zealous(4), Zebra(1), Zen(6), Zephyr(3), Zeppelin(5), Zero(2) → 4,1,6,3,5,2." },
  { s: REA, q: "In a certain code language, 'NOVEL' is written as 'LMTCJ' and 'OCEAN' is written as 'MACYL'. How will 'PARTY' be written in that language?", o: ["MBSUZ","NXRPZ","NYPRW","MCPRX"], e: "Each letter shifts back by 2. PARTY: P−2=N, A−2=Y(wrap), R−2=P, T−2=R, Y−2=W → NYPRW." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Which number will replace the question mark (?) in the following series?\n\n11, 30, 68, 144, 296, ?", o: ["556","498","512","600"], e: "Differences double: +19, +38, +76, +152, +304. 296 + 304 = 600." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the following blanks, will complete the letter-series.\n\nR_G_D_TG_DR_GF_RT__D", o: ["TFRFTDFG","TFTFTDGF","TFRFTDGF","TFRTTDGF"], e: "Per response sheet, option 3 (TFRFTDGF)." },
  { s: REA, q: "In a certain code language, 'FATHER' is written as 'ETRHFA' and 'GALAXY' is written as 'XLYAGA'. How will 'HABITS' be written in that language?", o: ["BAHSTI","TBSIHA","STIBAH","SITBAH"], e: "Position rearrangement 123456 → 5,3,6,4,1,2. HABITS → T,B,S,I,H,A = TBSIHA." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nPRAISE : RPIAES :: ACTIVE : CAITEV :: LOVELY : ?", o: ["LOELYV","LEVYOL","OLEVYL","VOLYLE"], e: "Adjacent-pair swap: (1↔2)(3↔4)(5↔6). LOVELY → O,L,E,V,Y,L = OLEVYL." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Except  2. Exhale  3. Example  4. Exempt  5. Examine  6. Excavate", o: ["6, 5, 3, 1, 4, 2","5, 3, 1, 4, 6, 2","5, 3, 6, 1, 4, 2","5, 3, 1, 6, 4, 2"], e: "Order: Examine(5), Example(3), Excavate(6), Except(1), Exempt(4), Exhale(2) → 5,3,6,1,4,2." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nAll rats are cats.\nAll cats are tigers.\n\nConclusions:\nI. Some tigers are rats.\nII. All rats are tigers.", o: ["Neither conclusion I nor II follows","Only conclusion II follows","Only conclusion I follows","Both conclusions I and II follow"], e: "II follows by transitivity. I follows by conversion (some tigers are rats). Both follow." },
  { s: REA, q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nSome pants are shirts.\nNo shirt is a tie.\n\nConclusions:\nI. All pants can never be ties.\nII. All ties are pants.", o: ["Neither conclusion I nor II follows","Only conclusion I follows","Only conclusion II follows","Both conclusions I and II follow"], e: "Neither conclusion follows from the given statements." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series to make it logically complete?\n\nYAK, CEO, GIS, KMW, ?", o: ["OAQ","OPA","OQA","PRB"], e: "Each cluster shifts by +4 with the third letter wrapping. Y,C,G,K,O; A,E,I,M,Q; K,O,S,W,A → OQA." },
  { s: REA, q: "In a code language, 'SPARKLE' is written as 'TNBPLJF' and 'PRIEST' is written as 'QPJCTR'. How will 'CULTURE' be written in that language?", o: ["DVMUVSF","DSMRVPF","DSNRWPF","DVNUWSF"], e: "Alternating shifts +1,−2. CULTURE: C+1=D, U−2=S, L+1=M, T−2=R, U+1=V, R−2=P, E+1=F → DSMRVPF." },
  { s: REA, q: "Based on meaning/relevance of the words, Mortality is related to Death in the same way as Morbidity is related to _________.", o: ["Disease","Poverty","Wealth","Literacy"], e: "Mortality refers to death rates; Morbidity refers to disease rates." },
  { s: REA, q: "Given below are two statements and two conclusions. Take the statements to be true even if they are at variance with commonly known facts, and decide whether the conclusion(s) follow(s) the given statements.\n\nStatements:\nI. All ovens are stoves.\nII. No stove is a fridge.\n\nConclusions:\nI. No oven is a fridge.\nII. Some fridges are ovens.", o: ["Either conclusion I or II follows","Only conclusion II follows","Neither conclusion I nor II follows","Only conclusion I follows"], e: "All ovens ⊆ stoves and no stove is fridge ⇒ no oven is fridge (I follows). II contradicts I." },
  { s: REA, q: "In a certain code language, 'BEAR' is written as '52' and 'SINK' is written as '106'. How will 'TOYS' be written in that language?", o: ["79","97","158","4322"], e: "Code = (sum of letter positions) × 2. TOYS: 20+15+25+19 = 79; 79 × 2 = 158." },
  { s: REA, q: "'P @ Q' means 'P is the sister of Q'.\n'P & Q' means 'P is the son of Q'.\n'P # Q' means 'P is the mother of Q'.\n\nIf 'A # B @ C # D @ E & F', then how is D related to F?", o: ["Daughter","Brother","Father","Mother"], e: "A is mother of B; B sister of C ⇒ A is C's mother. C mother of D; D sister of E; E son of F. F is E's parent ⇒ F = C. So D is C's daughter (= F's daughter)." },
  { s: REA, q: "In a code language, 'POST' is written as 'KLHG', 'MAIL' is written as 'NZRO'. How will 'TOKEN' be written in that language?", o: ["GLQUM","GKPVM","GLPVM","MVPGL"], e: "Mirror cipher (A↔Z). TOKEN: T→G, O→L, K→P, E→V, N→M → GLPVM." },
  { s: REA, q: "Which two numbers (not the digits of the numbers), from amongst the given options, should be interchanged to make the given equation correct?\n\n42 ÷ 2 + 13 − 5 × 7 = 9", o: ["42 and 7","5 and 13","5 and 7","2 and 7"], e: "Swap 2 and 7: 42÷7 + 13 − 5×2 = 6 + 13 − 10 = 9. ✓" },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the following blanks, will complete the letter-series.\n\nS_F_H_D_GHSD_G_SD__H", o: ["DFGSFHFG","DGFSFDFG","DGFSFHFG","DGSFFHFG"], e: "Per response sheet, option 4 (DGSFFHFG)." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nBy what is she amused?", o: ["She is amused by what?","What amused her?","What has been amusing her?","What amuses her?"], e: "Passive 'is amused by what' → active 'What amuses her?' (simple present)." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nSubmission", o: ["Rebelling","Intractability","Contumacy","Compliance"], e: "'Submission' (yielding / surrendering) — synonym 'Compliance'. (Rebelling, Intractability, Contumacy are antonyms.)" },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nEducation is one of the most important ________ of empowering women with the knowledge, skills and self-confidence necessary to participate fully in the development process.", o: ["endeavours","procedures","deeds","means"], e: "Education is a 'means' (instrument / way) of empowerment." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Accidentaly","Abstain","Hurrying","Horror"], e: "'Accidentaly' is misspelled — correct is 'Accidentally' (with double-l)." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Adequacey","Curiosity","Frailty","Gaiety"], e: "'Adequacey' is misspelled — correct is 'Adequacy'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nThrow cold water", o: ["To discourage by showing indifference","Challenge","Flooded","Met with a cold reception"], e: "'Throw cold water' = to dampen enthusiasm / discourage by being indifferent or critical." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA funeral procession", o: ["Congregation","Constellation","Claque","Cortege"], e: "A 'cortege' is a solemn procession, especially a funeral procession." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nShy", o: ["Timid","Fearless","Gallant","Bright"], e: "'Shy' (reserved / nervous) — synonym 'Timid'." },
  { s: ENG, q: "Select the correctly spelt word to fill in the blank.\n\nMany __________ are still _________ in India.", o: ["supersitons; pervelent","superstitions; prevalent","supersitions; prevelent","supersitions; pravelent"], e: "'Superstitions' and 'prevalent' are correctly spelt (others have typos)." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nIdentical", o: ["Original","Synonymous","Equivalent","Different"], e: "'Identical' (same) — antonym 'Different'." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nReghunath usually leaves his native village during the vacation.", o: ["His native village was usually left by Reghunath during the vacation.","His native village is usually left by Reghunath during the vacation.","His native village has been usually left by Reghunath during the vacation.","His native village is usually being left by Reghunath during the vacation."], e: "Simple present active 'leaves' → simple present passive 'is left'." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nClimate changes can ________ affect the crop diversity.", o: ["diversely","inversely","fortunately","adversely"], e: "'Adversely' (negatively) fits the context of climate change harming crops." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nPREVIOUS", o: ["current","preceding","earlier","past"], e: "'Previous' (earlier) — antonym 'current' (present)." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nA dead loss", o: ["Crude and lacking sophistication","Is slightly better than","Are likely to develop into","Completely useless"], e: "'A dead loss' = something that is completely useless / a total failure." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nWidespread occurrence of an infectious disease crossing international boundaries.", o: ["Catastrophic","Sporadic","Pandemic","Epidemic"], e: "A 'Pandemic' is an outbreak of a disease that spreads across international boundaries." },
  { s: ENG, q: "Read the passage about the film industry vs television, and answer.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'television screens... nearness to (1) _________ seekers'", o: ["thrill","entertainment","relief","mirth"], e: "'Entertainment seekers' fits the context of audience seeking TV / film content." },
  { s: ENG, q: "Read the passage about the film industry vs television, and answer.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'television programmes are as (2) _________ to people as newspaper material'", o: ["indispensable","substantial","weighty","momentous"], e: "'As indispensable as newspaper material' — TV programmes are essential / can't do without." },
  { s: ENG, q: "Read the passage about the film industry vs television, and answer.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'cinema industry so (3) _______ and delightful'", o: ["absorbing","hypnotising","attractive","winning"], e: "'Hypnotising and delightful' — captivating and pleasing pair." },
  { s: ENG, q: "Read the passage about the film industry vs television, and answer.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'bring (4) ________ in international relations'", o: ["equilibrium","uniformity","harmony","equalisation"], e: "'Bring harmony in international relations' is the natural collocation." },
  { s: ENG, q: "Read the passage about the film industry vs television, and answer.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'irritants which breed (5) _______, lack of cooperation'", o: ["distrust","anxiety","unbelief","incredulity"], e: "'Breed distrust' — alongside 'lack of cooperation' fits the listing of negatives." },
  { s: ENG, q: "Read the passage about Flamingos becoming pink, and answer.\n\nSelect the most appropriate ANTONYM of the given word.\n\nVibrant", o: ["Formidable","Sombre","Forlorn","Cardinal"], e: "'Vibrant' (lively / bright) — antonym 'Sombre' (dull / dark)." },
  { s: ENG, q: "Read the passage about Flamingos becoming pink, and answer.\n\nSelect an appropriate title for the given passage.", o: ["Natural Habitats of Flamingos – A Brief Overview","How Do Flamingos Become Pink? – A Study","Origin and Effect of Beta-carotene on Humans","Identifying Different Species of Flamingos"], e: "The passage focuses on the source of flamingos' pink colour (diet, beta-carotene) — title 'How Do Flamingos Become Pink?'." },
  { s: ENG, q: "Read the passage about Flamingos becoming pink, and answer.\n\nIdentify the tone of the passage from the following options.", o: ["Satirical","Reflective","Nostalgic","Informative"], e: "The passage presents factual scientific information — informative tone." },
  { s: ENG, q: "Read the passage about Flamingos becoming pink, and answer.\n\nSelect the most appropriate option to fill in the blank.\n\nFlamingo chicks hatch with ______________ feathers, which later turn into bright pink colours.", o: ["grey","yellow","red","orange"], e: "Per passage: 'Flamingos are in fact born dull grey'." },
  { s: ENG, q: "Read the passage about Flamingos becoming pink, and answer.\n\nSelect the most appropriate option to fill in the blank.\n\nFlamingo's exquisite colour is particularly a result of _______________.", o: ["changing seasons","injected pigments","dynamic genetics","nutritional patterns"], e: "Flamingos get their pink colour from beta-carotene in their diet (algae, brine shrimp) — nutritional patterns." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "The income of a branch manager increases by 15% to Rs.69,000 after one year. In the next year, due to economic depression, the income falls by 10% and in the third year, it again falls by 5%. What is the current income of the branch manager?", o: ["Rs.58,885","Rs.59,895","Rs.58,895","Rs.58,995"], e: "After year 2: 69000 × 0.90 = 62100. After year 3: 62100 × 0.95 = ₹58,995." },
  { s: QA, q: "Arjoo had a sum of Rs.5,00,000. She invested 40% of the money at 6% simple interest for a period of 4 years, while she invested the remaining part at the rate of 8% simple interest for a period of 5 years. How much total simple interest (in Rs.) did she receive?", o: ["Rs.1,72,000","Rs.1,80,000","Rs.1,68,000","Rs.1,44,000"], e: "SI₁ = 200000·6·4/100 = 48000. SI₂ = 300000·8·5/100 = 120000. Total = ₹1,68,000." },
  { s: QA, q: "A can do three-seventh of a work in 15 days and B can do two-fifth of the same work in 14 days. If A and B work together, then how long (in days) will they take to complete the work?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "A: 3/7 in 15 days ⇒ full in 35 days. B: 2/5 in 14 days ⇒ full in 35 days. Together: 1/35 + 1/35 = 2/35 ⇒ 17.5 days. Per response sheet, option 1." },
  { s: QA, q: "A dealer professes to sell his goods at cost price but uses a false weight and thus earns 25% profit. For weighing a kilogram, he uses a false weight of _________.", o: ["900 gm","750 gm","800 gm","850 gm"], e: "Profit% = (1000−X)/X × 100 = 25 ⇒ X = 800 g per kg." },
  { s: QA, q: "The average weight of 10 students is 42 kg. If 3 students of average weight of 43 kg are added and two other students of average weight of 48 kg are also added, then find the average weight of all the students.", o: ["43 kg","48 kg","42 kg","44 kg"], e: "Total = 10·42 + 3·43 + 2·48 = 420+129+96 = 645. Avg = 645/15 = 43 kg." },
  { s: QA, q: "A table is bought for Rs.500 and sold for Rs.650. Find the profit percentage.", o: ["20%","3.0%","30%","25%"], e: "Profit% = (650−500)/500 × 100 = 30%." },
  { s: QA, q: "The ratio of the present age of a father to that of his son is 5 : 2. After 5 years their ages will be in the ratio of 7 : 3. The present age of the father is:", o: ["100 years","95 years","90 years","85 years"], e: "(5x+5)/(2x+5) = 7/3 ⇒ 15x+15 = 14x+35 ⇒ x = 20. Father = 5×20 = 100 years." },
  { s: QA, q: "A sum at simple interest of 7% per annum amounts to Rs.4,368 in 8 years. Find the sum.", o: ["Rs.2,800","Rs.3,800","Rs.2,900","Rs.3,300"], e: "Amount = P(1 + RT/100) ⇒ 1.56P = 4368 ⇒ P = ₹2,800." },
  { s: QA, q: "What number will come in place of the question mark?\n\n2 : 5 :: ? : 35", o: ["14","15","21","20"], e: "Multiply both sides by same factor: 5×7=35, so ?=2×7=14." },
  { s: QA, q: "The average of twenty positive numbers is x. If each number increases by 20%, then x will :", o: ["decrease by 20%","increase by 80%","increase by 20%","remain unchanged"], e: "If every number is multiplied by 1.20, the average is also multiplied by 1.20 — i.e. increases by 20%." },
  { s: QA, q: "If the volume of a cuboid is 440 cm³ and the area of its base is 88 cm², then the height of the cuboid is _______.", o: ["8 cm","5 cm","44 cm","2 cm"], e: "Height = Volume / Base area = 440 / 88 = 5 cm." },
  { s: QA, q: "In a chief election, a candidate got 60% of the total valid votes. 5% of the total votes were declared invalid. If the total number of votes is 20,800, then the number of valid votes polled in favour of the candidate is:", o: ["11858","11056","11856","10006"], e: "Valid = 0.95 × 20800 = 19760. 60% of 19760 = 11,856." },
  { s: QA, q: "60 is the mean proportional of 36 and P. Find the value of P.", o: ["110","81","64","100"], e: "Mean prop: 60² = 36 × P ⇒ P = 3600/36 = 100." },
  { s: QA, q: "To go a distance of 144 km upstream, a rower takes 12 hours while it takes her only 9 hours to row the same distance downstream. The speed of the stream is ______.", o: ["3 km/h","1 km/h","1.5 km/h","2 km/h"], e: "Upstream = 144/12 = 12 km/h; Downstream = 144/9 = 16 km/h. Stream = (16−12)/2 = 2 km/h." },
  { s: QA, q: "A train runs at a speed of 90 km/h in the first 10 min, 60 km/h in the next 20 min, and 40 km/h in the last 5 minutes. What is the average speed (in km/h) of the train?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Total dist = 90·10/60 + 60·20/60 + 40·5/60 = 15+20+10/3 = 38.33 km. Total time = 35/60 h. Avg ≈ 65.71 km/h. Per response sheet, option 3." },
  { s: QA, q: "Which of the following is a pair of coprime numbers?", o: ["55, 121","99, 141","115, 120","131, 143"], e: "GCD(131, 143) = 1 (131 is prime, 143 = 11·13). The other pairs share factors." },
  { s: QA, q: "Mukesh buys 15 bananas for Rs.125 and sells 20 bananas for Rs.180. Find the percentage of his profit.", o: ["14%","10%","12%","8%"], e: "CP/banana = 125/15 = 25/3. SP/banana = 180/20 = 9. Profit% = (9 − 25/3)/(25/3) × 100 = 8%." },
  { s: QA, q: "An article is listed at Rs.900. A customer pays Rs.726.75 for it after getting two successive discounts. If the rate of first discount is 15%, the rate of the second discount is ________.", o: ["6%","5%","4%","8%"], e: "After 15%: 900 × 0.85 = 765. 765·(1−r/100) = 726.75 ⇒ r = 5%." },
  { s: QA, q: "If 72 persons build a 220-m-long wall in 6 days, then how many persons will be required to build the same type of wall of 550-m length in 5 days?", o: ["286","421","216","311"], e: "Persons = (550 × 72 × 6)/(220 × 5) = 237600/1100 = 216." },
  { s: QA, q: "The salary of a typist was first raised by 20% and then the same was reduced by 15%. If the typist presently draws Rs.1,224, what was his/her original salary?", o: ["Rs.975","Rs.1,200","Rs.900","Rs.950"], e: "Original × 1.20 × 0.85 = 1.02·Original = 1224 ⇒ Original = ₹1,200." },
  { s: QA, q: "Find the LCM of 32 and 640.", o: ["320","64","32","640"], e: "640 is a multiple of 32 (640 = 32·20), so LCM = 640." },
  { s: QA, q: "What is the percentage increase in the number if it becomes 6 times the original number?", o: ["600%","16.67%","60%","500%"], e: "Increase = (6n − n)/n × 100 = 500%." },
  { s: QA, q: "A car travels a certain journey at 40 km/h and an equal distance more at 60 km/h. The average speed for the whole journey is:", o: ["28 km/h","58 km/h","48 km/h","38 km/h"], e: "Avg for equal distances = 2·40·60/(40+60) = 4800/100 = 48 km/h." },
  { s: QA, q: "What is the volume of a cube whose side is 2.7 m long?", o: ["22.483 m³","24.743 m³","19.683 m³","16.693 m³"], e: "V = side³ = (2.7)³ = 19.683 m³." },
  { s: QA, q: "A tradesman marks his goods at 15% above the cost price and allows purchasers a discount of 10% for cash. What profit percentage does he make?", o: ["115%","11.5%","3.5%","103.5%"], e: "MP = 1.15·CP. SP = 1.15·CP × 0.90 = 1.035·CP. Profit% = 3.5%." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Which of the following statements is correct?", o: ["The eye lens cannot form any image on the retina.","The eye lens forms a real and upright image on the retina.","The eye lens forms a real and inverted image on the retina.","The eye lens forms only a virtual and inverted image on the retina."], e: "The eye lens forms a real and inverted image on the retina; the brain interprets it as upright." },
  { s: GA, q: "Human blood is grouped into ________ main types.", o: ["four","three","six","two"], e: "ABO system gives 4 main blood groups: A, B, AB, and O." },
  { s: GA, q: "Tankas are a structure of rain water harvesting system that are generally used in which of the following states?", o: ["Meghalaya","Tamil Nadu","Rajasthan","Uttarakhand"], e: "Tankas (underground water storage tanks) are a traditional rainwater harvesting practice in Rajasthan." },
  { s: GA, q: "The super highway connecting Delhi-Kolkata-Chennai-Mumbai and Delhi is known as:", o: ["Platinum Quadrilateral","Golden Quadrilateral","Silver Quadrilateral","Diamond Quadrilateral"], e: "The Golden Quadrilateral connects the four metros (Delhi-Kolkata-Chennai-Mumbai-Delhi) via a national highway network." },
  { s: GA, q: "India's border with Myanmar runs along the states of Nagaland, Manipur, Mizoram and _______.", o: ["Arunachal Pradesh","Assam","West Bengal","Sikkim"], e: "India-Myanmar border runs along Arunachal Pradesh, Nagaland, Manipur and Mizoram." },
  { s: GA, q: "'Hawa Mahal' built by Maharaja Sawai Pratap Singh is situated in which of the following cities?", o: ["Bikaner","Mumbai","Jaipur","Ahmedabad"], e: "Hawa Mahal (Palace of Winds) was built in 1799 by Maharaja Sawai Pratap Singh in Jaipur, Rajasthan." },
  { s: GA, q: "At which of the following Harappan sites has a dockyard been found suggesting the existence of trade?", o: ["Daimabad","Manda","Lothal","Alamgirpur"], e: "Lothal (Gujarat) is famous for the world's earliest known artificial dockyard from the Harappan civilisation." },
  { s: GA, q: "In March-April 2021, the state legislative assembly elections were held in four Indian states. Which of the following is NOT one of them?", o: ["West Bengal","Kerala","Assam","Karnataka"], e: "March-April 2021 elections: West Bengal, Tamil Nadu, Kerala, Assam (and UT Puducherry). Karnataka was NOT among them." },
  { s: GA, q: "Who among the following was the writer of Harshacharita?", o: ["Bharavi","Banabhatta","Bhavabhuti","Amarasimha"], e: "Banabhatta wrote 'Harshacharita', a biographical work on king Harshavardhana of Kannauj." },
  { s: GA, q: "The finals of the ICC Women's Cricket World Cup – 2022 was played in_______.", o: ["Auckland","Hamilton","Wellington","Christchurch"], e: "The final of ICC Women's Cricket World Cup 2022 was held at Hagley Oval, Christchurch (New Zealand)." },
  { s: GA, q: "'Hola Mohalla festival' started by Guru Gobind Singh Ji is majorly celebrated in which of the following states of India?", o: ["Madhya Pradesh","Nagaland","Punjab","Kerala"], e: "Hola Mohalla, started by Guru Gobind Singh in 1701, is celebrated mainly at Anandpur Sahib in Punjab." },
  { s: GA, q: "The principles of \"Liberty, Equality and Fraternity\" have been adopted in the Indian Constitution from which of the following Constitutions?", o: ["American","French","British","German"], e: "The trinity of Liberty, Equality and Fraternity comes from the French Revolution / French Constitution." },
  { s: GA, q: "Where is the Greenfield International Stadium located?", o: ["Varanasi","Mangalore","Thiruvananthapuram","Dehradun"], e: "Greenfield International Stadium (Sports Hub) is located in Thiruvananthapuram, Kerala." },
  { s: GA, q: "In which district of Uttar Pradesh is the Sharda Canal located?", o: ["Amroha district","Sonbhadra district","Pilibhit district","Lalitpur district"], e: "The Sharda Canal originates in Pilibhit district of Uttar Pradesh (head works at Banbasa)." },
  { s: GA, q: "In December 2021, which neighbouring country conferred the Prime Minister of India with its highest civilian award, the Order of the Druk Gyalpo?", o: ["Myanmar","Nepal","Sri Lanka","Bhutan"], e: "Bhutan conferred the Order of the Druk Gyalpo (highest civilian award) on PM Narendra Modi in December 2021." },
  { s: GA, q: "Which of the following chemicals is commonly used for preserving tomato sauces?", o: ["Sodium nitrite","Sodium chloride","Sodium nitrate","Sodium benzoate"], e: "Sodium benzoate is widely used as a food preservative in tomato sauces, jams, soft drinks, etc." },
  { s: GA, q: "Who among the following has written the book 'The Last Queen'?", o: ["Chitra Banerjee Divakaruni","Amrita Pritam","Urvashi Butalia","Kiran Desai"], e: "'The Last Queen' (2021) by Chitra Banerjee Divakaruni — a novel about Maharani Jindan Kaur." },
  { s: GA, q: "The President of which country was invited as a special guest in the first Republic Day parade held in the year 1950?", o: ["Indonesia","Thailand","Pakistan","China"], e: "President Sukarno of Indonesia was the chief guest at India's first Republic Day parade on 26 January 1950." },
  { s: GA, q: "The 'Arya Samaj' was founded in 1875 by:", o: ["Swami Vivekananda","Swami Dayanand Sarasvati","Ishwar Chand Vidyasagar","Raja Ram Mohan Roy"], e: "Arya Samaj was founded in Bombay on 7 April 1875 by Swami Dayananda Saraswati." },
  { s: GA, q: "In December 2021, which State Assembly passed two bills to reserve 50% seats for women for 10 years on a rotational basis in constituencies of the civic bodies in the state?", o: ["Assam","Goa","Jharkhand","Haryana"], e: "Assam Legislative Assembly passed bills in December 2021 reserving 50% seats for women in civic bodies on rotational basis." },
  { s: GA, q: "As per the Planning Commission, what percentage of urban India was living below poverty line in 2011-12?", o: ["13.7","15.2","12.1","10.2"], e: "Per Planning Commission (Tendulkar methodology), urban poverty was 13.7% in 2011-12 (rural 25.7%)." },
  { s: GA, q: "The Nagara and Dravida are architectural styles related with _______.", o: ["gurudwaras","mosques","temples","churches"], e: "Nagara (North Indian) and Dravida (South Indian) are temple architectural styles." },
  { s: GA, q: "Who among the following played an important role in the establishment of the Indian National Congress?", o: ["Charles Bernard","Sir Henry Cotton","Allan Octavian Hume","Walter Badock"], e: "Allan Octavian Hume, a British civil servant, founded the Indian National Congress in December 1885." },
  { s: GA, q: "Which musician is associated with the musical instrument, the Mridangam?", o: ["Ali Akbar Khan","KV Prasad","Zakir Hussain","RK Bijapure"], e: "K. V. Prasad is a renowned Mridangam exponent of South Indian Carnatic classical music." },
  { s: GA, q: "Muhammad bin Tughluq, Sultan of the Delhi sultanate, moved his capital from Delhi to which of the following places?", o: ["Daulatabad","Agra","Aurangabad","Badaun"], e: "Muhammad bin Tughluq shifted his capital from Delhi to Daulatabad (formerly Devagiri) in 1327." }
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

  const TEST_TITLE = 'SSC Selection Post Phase X (Matriculation) - 4 August 2022 Shift-3';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-3',
    pyqExamName: 'SSC Selection Post Phase X (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
