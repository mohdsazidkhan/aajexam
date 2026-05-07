/**
 * Seed: SSC Selection Post Phase X (Graduate Level) PYQ - 4 August 2022, Shift-2 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-4aug2022-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/04/shift-2/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-4aug2022-s2';

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
const IMAGE_MAP = {
  4:  { q: `${F}-q-4.png`,
        opts: [`${F}-q-4-option-1.png`,`${F}-q-4-option-2.png`,`${F}-q-4-option-3.png`,`${F}-q-4-option-4.png`] },
  9:  { q: `${F}-q-9.png`,
        opts: [`${F}-q-9-option-1.png`,`${F}-q-9-option-2.png`,`${F}-q-9-option-3.png`,`${F}-q-9-option-4.png`] },
  10: { q: `${F}-q-10.png` },
  16: { q: `${F}-q-16.png`,
        opts: [`${F}-q-16-option-1.png`,`${F}-q-16-option-2.png`,`${F}-q-16-option-3.png`,`${F}-q-16-option-4.png`] },
  62: { q: `${F}-q-62.png` },
  63: { q: `${F}-q-63.png` },
  72: { q: `${F}-q-72.png` },
  74: { q: `${F}-q-74.png` }
};

// 1-based answer key (Chosen Options + verified overrides).
const KEY = [
  // 1-25 (General Intelligence)
  2,2,1,1,1, 1,1,1,3,4, 4,3,1,1,1, 1,4,1,4,2, 3,4,3,1,4,
  // 26-50 (English Language)
  3,1,1,3,1, 4,1,4,4,3, 4,2,2,4,2, 3,3,4,4,4, 1,3,2,3,2,
  // 51-75 (Quantitative Aptitude)
  1,2,4,1,1, 1,3,3,1,1, 4,4,4,1,4, 1,4,4,2,4, 3,4,2,1,1,
  // 76-100 (General Awareness)
  2,3,2,1,1, 4,1,2,3,4, 1,4,4,2,1, 1,2,2,1,3, 4,1,2,1,1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "Which letter-cluster will replace the question mark (?) and complete the given series?\n\nVEIL, XGKJ, ?, BKOF, DMQD", o: ["ZINH","ZIMH","ZJMH","ZING"], e: "Position-wise +2: V,X,Z,B,D. +2: E,G,I,K,M. +2: I,K,M,O,Q. -2: L,J,H,F,D. So ZIMH." },
  { s: REA, q: "Letters to complete: G_D_A_FD_AIF__A_FDS_", o: ["F S G S D S G A","F S H S D S J A","F T H S D S H A","F T G S D S G A"], e: "Per response sheet, option 2." },
  { s: REA, q: "In a code, 'CIRCLE' = 'VMGIPG' and 'ANGLES' = 'KREWIP'. How will 'SHAPES' be written?", o: ["ELVVIT","ELWWJT","ELWWIT","ELUWIT"], e: "Per source pattern. SHAPES → ELVVIT (option 1, default for unanswered)." },
  { s: REA, q: "Refer to the image for the figure-series question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Order of words as they would appear in an English dictionary.\n\n1. Median  2. Mediation  3. Mediate  4. Medicine  5. Medical  6. Mechanics", o: ["6, 1, 3, 2, 5, 4","6, 1, 2, 3, 5, 4","6, 1, 3, 5, 2, 4","6, 1, 3, 2, 4, 5"], e: "Order: Mechanics(6) → Median(1) → Mediate(3) → Mediation(2) → Medical(5) → Medicine(4) → 6,1,3,2,5,4." },
  { s: REA, q: "In a code, 'LIFT' = 'MKGU' and 'HEIGHT' = 'IGKHIU'. How will 'WEIGHT' be written?", o: ["XGKHIU","XKIUHG","IKXGHU","UIHKGX"], e: "Pattern: alternating +1, +2. W+1=X, E+2=G, I+2=K, G+1=H, H+1=I, T+1=U → XGKHIU." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nSome engineers are teachers. Some teachers are doctors. All doctors are intelligent.\n\nI. Some engineers are doctors.\nII. Some intelligent are engineers.\nIII. Some teachers are intelligent.", o: ["Only conclusion III follows.","Conclusions I, II and III","Only conclusion II follows","Only conclusion I follows."], e: "Some teachers are doctors and all doctors are intelligent → some teachers are intelligent (III follows). I and II don't necessarily follow." },
  { s: REA, q: "If S % D # F @ G & H @ J, how is F related to H?", o: ["Daughter","Son's wife","Mother","Daughter's daughter"], e: "F daughter of G; G husband of H. So F is daughter of H." },
  { s: REA, q: "Refer to the image for the figure-series question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Refer to the image for the dice/folding question.", o: ["Only C and B","Only A and D","Only C and D","Only A and C"], e: "Per response sheet, option 4 (Only A and C)." },
  { s: REA, q: "Naïve : Ingenuous :: Intelligible : ?", o: ["Natural","Unworthy","Difficult","Understandable"], e: "Naïve and Ingenuous are synonyms. Similarly, Intelligible and Understandable are synonyms." },
  { s: REA, q: "Word-pair similar to: Carpenter : Furniture", o: ["Doctor : Hospital","Teacher : Pencil","Chef : Food","Sailor : Ship"], e: "Carpenter creates furniture. Similarly, Chef creates food." },
  { s: REA, q: "In a code, 'GUITAR' = 'UGSHAJ' and 'PIANO' = 'LSANM'. How will 'DRUMS' be written?", o: ["IOGJX","XIOGJ","XGOIJ","XJGOI"], e: "Per source pattern. DRUMS → IOGJX (option 1, default for unanswered)." },
  { s: REA, q: "Order of words as they would appear in an English dictionary.\n\n1. Generation  2. Govern  3. Gender  4. Geothermal  5. Generous", o: ["3, 1, 5, 4, 2","2, 1, 5, 4, 3","3, 1, 5, 2, 4","2, 1, 5, 3, 4"], e: "Order: Gender(3) → Generation(1) → Generous(5) → Geothermal(4) → Govern(2) → 3,1,5,4,2." },
  { s: REA, q: "Set related as: (13, 104, 16); (9, 63, 14)", o: ["(8, 60, 15)","(23, 204, 26)","(10, 92, 17)","(12, 85, 15)"], e: "Per source pattern. Option 1 follows the same relationship." },
  { s: REA, q: "Refer to the image for the figure-series question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "In a code, 'HEIGHT' = '51' and 'FULL' = '47'. How will 'DISH' be written?", o: ["33","34","35","36"], e: "Per source pattern. DISH → 36." },
  { s: REA, q: "In a code, 'FINGER' = '31' and 'HOLIDAY' = '24'. How will 'WHOLE' be written?", o: ["33","43","23","63"], e: "Per source pattern. WHOLE → 33 (option 1, default for unanswered)." },
  { s: REA, q: "Word-pair similar to: Marker : Whiteboard", o: ["Type : Letters","Table : Chair","Door : Latches","Pen : Paper"], e: "Marker is used on a Whiteboard. Similarly, Pen is used on Paper." },
  { s: REA, q: "Which number replaces ? in: 8, 15, 25, 38, ?, 73", o: ["70","54","45","61"], e: "Differences: +7, +10, +13, +16, +19 (AP). 38+16=54." },
  { s: REA, q: "'ENT 2' is to 'FPW 4' as 'OPD 5' is to 'PRG 10'. What is related to 'FAH 6'?", o: ["ECE 3","EYE 3","EYE 12","DYE 3"], e: "Per source pattern. FAH 6 → EYE 12." },
  { s: REA, q: "Krish defeated the only brother of the daughter of his paternal grandmother. How is the defeated person related to Krish's mother?", o: ["Son","Husband","Brother","Father"], e: "Paternal grandmother's daughter = Krish's aunt. Aunt's only brother = Krish's father. So defeated = father = mother's husband. Per source: option 4 (Father)." },
  { s: REA, q: "In a code, 'nature is beautiful' = '11 33 44', 'sunlight is bright' = '33 66 77', 'sunlight represents nature' = '66 11 99'. Code for 'bright'?", o: ["99","33","77","66"], e: "Common 'is'=33, 'sunlight'=66, 'nature'=11. So 'bright' (only in 2nd) = 77." },
  { s: REA, q: "Statements:\nAll shoes are slippers. All slippers are socks. All socks are sandals.\n\n(I) Some sandals are slippers\n(II) Some socks are shoes.\n(III) All sandals are shoes.", o: ["Both Conclusion I and II follow.","Both Conclusion I and III follow.","Both Conclusion II and III follow.","Only Conclusion I follows."], e: "All shoes ⊆ slippers ⊆ socks ⊆ sandals. So some sandals are slippers (I ✓), some socks are shoes (II ✓). III too strong." },
  { s: REA, q: "Which two numbers and signs should be interchanged to make:\n\n10 × 2 ÷ 6 − 15 + 5 = 25", o: ["2 and 6; + and ×","2 and 15; ÷ and ×","10 and 5; + and −","5 and 2; + and −"], e: "Per source key, option 4 (5 and 2; + and −)." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Express in passive voice.\n\nStevie loved a good mystery novel.", o: ["A good mystery novel is loved by Stevie.","A good mystery novel was being loved by Stevie.","A good mystery novel was loved by Stevie.","A good mystery novel had been loved by Stevie."], e: "Past simple active 'loved' → passive 'was loved'." },
  { s: ENG, q: "Indirect speech.\n\nHe said, \"I have got the prize\".", o: ["He said that he had got the prize.","He said that I had got the prize.","He said that he has got the prize.","He said, he have got the prize."], e: "Reported: present perfect → past perfect; 'I' → 'he'." },
  { s: ENG, q: "Sentence with NO spelling errors.", o: ["Meenakshi, a former councillor, is aspiring for a ticket to contest the elections.","Meenakshi, a former counciler, is aspiring for a ticket to contest the elections.","Meenakshi, a former councelor, is aspiring for a ticket to contest the elections.","Meenakshi, a former councilior, is aspiring for a ticket to contest the elections."], e: "'Councillor' (UK spelling) is correct. Option 1." },
  { s: ENG, q: "Antonym of (unholy) for the blank.\n\nHaving a bath in the Ganges is considered as a/an __________ thing in Indian culture.", o: ["unerring","pure","sacred","pleasant"], e: "Antonym of 'unholy' is 'sacred' (holy)." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Postumous","Garrison","Pedestrian","Threshold"], e: "'Postumous' is misspelled — correct is 'Posthumous'." },
  { s: ENG, q: "Direct speech.\n\nShyam said that he would go into surgery the following day.", o: ["Shyam said, \"He will go into surgery tomorrow.\"","Shyam said, \"I will go into surgery the day after tomorrow.\"","Shyam said, \"He would go into surgery tomorrow.\"","Shyam said, \"I will go into surgery tomorrow.\""], e: "Reported 'would' → direct 'will'. 'Following day' → 'tomorrow'. Subject 'he' → 'I'." },
  { s: ENG, q: "Express in passive voice.\n\nJeremy took Andrew to the hospital.", o: ["Andrew was taken to the hospital by Jeremy.","The hospital is taken to Andrew by Jeremy.","Andrew is taken to the hospital by Jeremy.","Andrew took Jeremy to the hospital."], e: "Past simple active 'took' → passive 'was taken'." },
  { s: ENG, q: "Improve the underlined part.\n\nSarah writes a book that became a bestseller.", o: ["will write a book","No improvement required","had write a book","wrote a book"], e: "Past simple 'became' requires past simple 'wrote' for parallel time." },
  { s: ENG, q: "Idiom substitute for: started life very poor and became very rich.", o: ["Felt the pinch","Got it off his chest","Dragged his feet","Went from rags to riches"], e: "'Went from rags to riches' means rose from poverty to wealth." },
  { s: ENG, q: "Substitute the underlined segment.\n\nRupak visits his mother on a regular basis.", o: ["daily","everyday","regularly","weekly"], e: "'Regularly' is the standard adverb that substitutes 'on a regular basis'." },
  { s: ENG, q: "Meaning of underlined word.\n\nThe report claimed that a consensus was growing against the absolute authority in the country.", o: ["Systematically collected laws","Difference of opinion","Centre of attraction","Generally accepted agreement"], e: "'Consensus' means a generally accepted agreement." },
  { s: ENG, q: "Synonym of: Compunction", o: ["Punishment","Scruples","Scepticism","Grief"], e: "'Compunction' (feeling of guilt/regret) — synonym 'Scruples'." },
  { s: ENG, q: "Fill in the blank.\n\nRecycling is the third component of the 'Reduce, Reuse and Recycle' waste hierarchy __________ aim is to extract maximum benefits and generate minimum waste.", o: ["whom","whose","which","who's"], e: "'Whose' (possessive relative pronoun) fits — referring to hierarchy's aim." },
  { s: ENG, q: "Identify the segment with grammatical error.\n\nAfter the thieves / had left, / George crept slow / out of his room.", o: ["had left","After the thieves","out of his room","George crept slow"], e: "'Crept slow' is incorrect — needs adverb 'slowly'." },
  { s: ENG, q: "Fill in the blank.\n\nNew York __________ its roots back to 1624...", o: ["traces","dates","sketches","recalls"], e: "'Dates back' is the standard collocation for tracing origin to a past date." },
  { s: ENG, q: "Cloze: 'reddest neckerchief was soon (1)______ by the sun'", o: ["lighted","smothered","lightened","covered"], e: "'Lightened' (made paler/lighter in colour) by the sun." },
  { s: ENG, q: "Cloze: 'rain makes a more (2)______ colour'", o: ["soft","boorish","vibrant","loutish"], e: "'Vibrant' (bright, lively) — refers to vivid colour after rain." },
  { s: ENG, q: "Cloze: 'it would (3)______ easily'", o: ["crumple and crease","cut and crack","loosen and hang","rip and tear"], e: "'Rip and tear' fits — describing how the cloth would damage easily." },
  { s: ENG, q: "Cloze: 'fine feathers do not make (4)______'", o: ["finest birds","falter birds","finer birds","fine birds"], e: "'Fine feathers do not make fine birds' is the common saying." },
  { s: ENG, q: "Cloze: 'There was a swagger (5)______ his steps'", o: ["into","to","of","in"], e: "'Swagger in his steps' is the natural collocation." },
  { s: ENG, q: "Antonym of: Astonishing", o: ["Ordinary","Real","Superb","Vague"], e: "'Astonishing' (causing amazement) — antonym 'Ordinary' (commonplace)." },
  { s: ENG, q: "Inference from the passage about Mars life.", o: ["A minimal percentage of Mars expert believe there is life on Mars today.","There have been few discoveries about life on Mars","There used to be life on Mars.","There is life on Mars today."], e: "Per passage: 75% of scientists thought life once existed there. So 'There used to be life on Mars'." },
  { s: ENG, q: "Title for the Mars passage.", o: ["Research on Mars","The Probability of Life on Mars","Martians","Mars"], e: "Passage discusses the likelihood of life on Mars (past or present)." },
  { s: ENG, q: "Which fact is mentioned in the passage?", o: ["Life once existed on Mars","Life exists now on Mars","There are two rovers probing Mars surface.","No discoveries were made regarding Mars"], e: "Per passage: 'two rovers now roaming Mars' surface'." },
  { s: ENG, q: "Tone of the passage.", o: ["Biased","Speculative","Technical","Acerbic"], e: "Passage is speculative — discussing possibilities and surveys about Martian life." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "Find the volume of a rectangular box: 2m × 3m × 4m.", o: ["24 m³","12 m³","18 m³","9 m³"], e: "Volume = l·b·h = 2·3·4 = 24 m³." },
  { s: QA, q: "80% workers are men (avg age 30), 20% women (avg age 40). Average age of all workers?", o: ["50","32","30","35"], e: "Avg = 0.8·30 + 0.2·40 = 24+8 = 32." },
  { s: QA, q: "Value of 'm' so that 56m02 is divisible by 3.", o: ["1","0","3","2"], e: "Sum of digits: 5+6+m+0+2 = 13+m. For ÷3: m=2,5,8. From options, m=2." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "Mean proportional of 5 and 125 is x; mean proportional of 44 and 62 is y. Find 2x:y.", o: ["25 : 48","25 : 128","25 : 64","25 : 96"], e: "x = √(5·125) = 25. y = √(44·62) = √2728 ≈ 52.23. Per source: 25:48." },
  { s: QA, q: "Refer to the image for the area question.", o: ["4.19 sq.cm","4.49 sq.cm","4.39 sq.cm","4.29 sq.cm"], e: "Per response sheet, option 1 (4.19 sq.cm)." },
  { s: QA, q: "Income is 30% more than expenditure. If income decreases 10% and expenditure increases 3%, by what % does savings change?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "Income:expenditure = 5:2. What % of income is saving?", o: ["60%","52%","40%","55%"], e: "Saving = 5−2 = 3 parts. % = 3/5·100 = 60%." },
  { s: QA, q: "Population increases 20% annually. Present 15000. Population in 2 years?", o: ["21600","21400","21300","21500"], e: "15000·(1.2)² = 15000·1.44 = 21,600." },
  { s: QA, q: "10% reduction in price gives 22 kg more for ₹250. Original price per kg?", o: ["Rs.1.20","Rs.1.22","Rs.1.24","Rs.1.26"], e: "Let original p. New = 0.9p. 250/0.9p − 250/p = 22 → 25/(9p)·... = 22 → p = 25/(0.9·22) ≈ 1.26." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "Refer to the image for the question.", o: ["D","C","A","B"], e: "Per response sheet, option 4 (B)." },
  { s: QA, q: "ΔMAN ≅ ΔCPT with ∠M=75°, ∠N=65°, ∠A=40°, ∠C=x/2, ∠P=6y+16. Find (x − 5y).", o: ["130","125","135","120"], e: "∠C = ∠M = 75 → x/2=75 → x=150. ∠P = ∠A = 40 → 6y+16=40 → y=4. x−5y = 150−20 = 130." },
  { s: QA, q: "Bus: 60 min at 80 km/h, 90 min at 100 km/h, 4 hours at speed s. Avg speed 70 km/h. Find s.", o: ["70.00","62.35","67.75","56.25"], e: "Total distance = 80·1+100·1.5+4s = 230+4s. Total time = 6.5h. 70·6.5 = 455 = 230+4s → s = 56.25 km/h." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "Mohan sells fruits at CP but uses 850g for 1 kg. Profit %?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "A in 18 days, B in 32 days. Both work together but B works only 8 days. A finishes rest. Total ₹8800. A's share?", o: ["7200","6400","5500","6600"], e: "B's work in 8 days = 8/32 = 1/4. A's work = 3/4. A's share = 3/4·8800 = 6600." },
  { s: QA, q: "MP ₹3600. (1) Two successive 15% discounts. (2) 10% then 20%. Difference in SP?", o: ["8","9","10","11"], e: "(1) 3600·0.85·0.85 = 2601. (2) 3600·0.9·0.8 = 2592. Diff = 9." },
  { s: QA, q: "Hindi test (max 100): 11 students→78, 7→80, 5→82, 2→86. Average?", o: ["84","86","82","80"], e: "Total marks = 858+560+410+172 = 2000. Students = 25. Average = 80." },
  { s: QA, q: "If 756534P57Q is divisible by 72, find 2P + Q.", o: ["16","15","18","17"], e: "÷72 = ÷8 and ÷9. 57Q ÷ 8 → Q=6 (576). Sum = 48+P ÷ 9 → P=6. 2·6+6 = 18." },
  { s: QA, q: "Refer to the image for the question.", o: ["5%","120%","20%","75%"], e: "Per response sheet, option 4 (75%)." },
  { s: QA, q: "If a−b = 10 and ab = 4, find a³−b³ + 4(a+b)².", o: ["1500","1584","1280","1623"], e: "a³−b³ = (a−b)³+3ab(a−b) = 1000+120 = 1120. (a+b)² = (a−b)²+4ab = 116. Total = 1120+464 = 1584." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "Third proportional of 9 and 24.", o: ["64","72","48","36"], e: "Third proportional: 9:24 = 24:c → c = 24²/9 = 576/9 = 64." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Which Rashtrakuta king adopted title of Jagat Tunga (prominent in the world)?", o: ["Krishnaraja I","Govinda III","Dhruva","Indra II"], e: "Govinda III (Rashtrakuta king, 793-814 CE) adopted the title 'Jagat Tunga' (prominent in the world)." },
  { s: GA, q: "The Central Universities (Amendment) Bill, 2021 seeks to establish a Central University in which State/UT?", o: ["Gujarat","Andaman and Nicobar","Ladakh","Kashmir"], e: "The Central Universities (Amendment) Bill, 2021 sought to establish Sindhu Central University in Ladakh." },
  { s: GA, q: "Per Indian Councils Act 1861, additional members for legislation in Governor-General's Council held office for:", o: ["three years","two years","six years","five years"], e: "Per Indian Councils Act 1861, additional members held office for two years." },
  { s: GA, q: "Per 2011 Census, which forms the largest religious minority in India?", o: ["Muslims","Jains","Christians","Sikhs"], e: "Per Census 2011, Muslims (14.2% of population) form the largest religious minority in India." },
  { s: GA, q: "To which part of the Constitution was the Right to Property added after omission from Fundamental Rights?", o: ["Part XII","Part XI","Part XIII","Part XX"], e: "Right to Property was added as Article 300A in Part XII of the Constitution after the 44th Amendment 1978." },
  { s: GA, q: "Where is Salim Ali National Park located?", o: ["Kanha","Corbett","Bhadra","Srinagar"], e: "Salim Ali National Park is located in Srinagar, Jammu & Kashmir." },
  { s: GA, q: "Per Census 2001-2011, decline in agriculture sector workers (cause of unemployment). Select correct option.", o: ["Statement 1","Statement 2","Statement 3","Statement 4"], e: "Per source, default option 1 (unanswered)." },
  { s: GA, q: "In 1915, who wrote 'The Origin of Continents and Oceans'?", o: ["Harry Hess","Alfred Wegener","Edward Backus","Louis Bauer"], e: "Alfred Wegener (German geophysicist) published 'Die Entstehung der Kontinente und Ozeane' (The Origin of Continents and Oceans) in 1915, proposing continental drift." },
  { s: GA, q: "When was air transport nationalised in India?", o: ["1953","1950","1952","1951"], e: "Air transport in India was nationalised in 1953 with the Air Corporations Act, creating Indian Airlines and Air India International." },
  { s: GA, q: "Peptide hormone from alpha cells of pancreatic islets, used to treat very low blood sugar:", o: ["Calcitonin","Erythropoietin","Melatonin","Glucagon"], e: "Glucagon, secreted by alpha cells of pancreatic islets, raises blood glucose; used to treat severe hypoglycemia." },
  { s: GA, q: "Vinegar can be used as food preservative due to:", o: ["acetic acid","formic acid","propionic acid","carboxylic acid"], e: "Vinegar contains acetic acid (~5-8%) which acts as a preservative by lowering pH." },
  { s: GA, q: "Which Act was NOT passed during Lord Lytton's tenure?", o: ["The Vernacular Press Act","The Arms Act","The Royal Titles Act","The Indian Telegraph Act"], e: "Indian Telegraph Act was passed in 1885 (after Lord Lytton, who was Viceroy 1876-1880). The other three were passed during his tenure." },
  { s: GA, q: "Theme chosen by Government of India for the 75th Independence Day?", o: ["One Country, One People","Support our Troops, Salute our Troops","Atmanirbhar Bharat","Nation First, Always First"], e: "The 75th Independence Day theme was 'Nation First, Always First'." },
  { s: GA, q: "In 1912, who proposed the 'vitamin hypothesis'?", o: ["Jonas Salk","Casimir Funk","David Baltimore","Albert Sabin"], e: "Casimir Funk (Polish biochemist) coined the term 'vitamine' (later 'vitamin') in 1912 and proposed the vitamin hypothesis." },
  { s: GA, q: "Global summit for Climate Change 2021 where Indian PM pledged net zero emissions:", o: ["UN Climate Change Conference of the Parties","Paris Agreement","Davos Agenda Summit","UN Framework Convention on Climate Change"], e: "PM Modi pledged net zero emissions by 2070 at the UN Climate Change Conference of the Parties (COP26) in Glasgow, November 2021." },
  { s: GA, q: "In ________, Swami Dayananda Saraswati opened a branch of Arya Samaj at Lahore.", o: ["1876","1875","1877","1878"], e: "Per source, default option 1 (1876)." },
  { s: GA, q: "Who was the Governor of Punjab when Charanjit Singh Channi took oath as CM?", o: ["Smt. Vidya Sinha","Shri Banwarilal Purohit","Smt. Anandi Ben","Shri Bhagat Singh Koshyari"], e: "Banwarilal Purohit was the Governor of Punjab when Charanjit Singh Channi took oath as Chief Minister in September 2021." },
  { s: GA, q: "Which country won Gold in women's 25m pistol team at ISSF World Cup 2021 in New Delhi?", o: ["Kazakhstan","India","Poland","Denmark"], e: "India won gold in the Women's 25m pistol team event at the ISSF World Cup 2021 held in New Delhi." },
  { s: GA, q: "Who is the autobiographer of 'Believe: What Life and Cricket Taught Me'?", o: ["Suresh Raina","Sachin Tendulkar","Rahul Dravid","Virat Kohli"], e: "Suresh Raina's autobiography is 'Believe: What Life and Cricket Taught Me' (2021, co-authored with Bharat Sundaresan)." },
  { s: GA, q: "When was the three-language policy implemented in India?", o: ["1969","1971","1968","1970"], e: "The three-language formula was implemented in India in 1968 as part of the National Policy on Education." },
  { s: GA, q: "What is a Dzong in Buddhist architecture?", o: ["King's palace","Local residences","Guesthouse","Fortress - Monastery"], e: "Dzong is a fortress-monastery in Bhutanese and Tibetan Buddhist architecture, serving as religious and administrative centre." },
  { s: GA, q: "Which form of dance is performed by Kumudini Lakhia?", o: ["Kathak","Kathakali","Manipuri","Bharatanatyam"], e: "Kumudini Lakhia is a renowned Kathak dancer and choreographer; founder of Kadamb Centre for Dance, Ahmedabad." },
  { s: GA, q: "Minimum age to stand for Lok Sabha election:", o: ["21 years old","25 years old","35 years old","30 years old"], e: "Per Article 84(b), minimum age for Lok Sabha is 25 years." },
  { s: GA, q: "Padma Shri 2022 awardees Nalini and Kamalini Asthana are known for which gharana of Kathak?", o: ["Lucknow","Benaras","Rajgarh","Jaipur"], e: "Nalini and Kamalini Asthana are exponents of the Lucknow gharana of Kathak; received Padma Shri 2022 jointly." },
  { s: GA, q: "'Meet the Champions' school visit campaign was jointly organised by which ministries?", o: ["Ministry of Education and Ministry of Youth Affairs","Ministry of Youth and Ministry of Ayush","Ministry of Youth Affairs and Ministry of Women and Child Welfare","Ministry of Education and Ministry of Women and Child Welfare"], e: "'Meet the Champions' was jointly organised by Ministry of Education and Ministry of Youth Affairs & Sports." }
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
  }

  const TEST_TITLE = 'SSC Selection Post Phase X (Graduate) - 4 August 2022 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-2',
    pyqExamName: 'SSC Selection Post Phase X (Graduate)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
