/**
 * Seed: SSC Selection Post Phase IX 2021 (Matriculation Level) PYQ - 3 February 2022, Shift-3 (100 questions)
 * Source: SSC official response sheet (PDF + docx). Hindi recovered via docx-XML parse.
 * All image-based questions (REA Q3, Q12, Q19 + all QA Q1-Q25) sourced directly from docx-embedded media.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-3feb2022-s3.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_feb03_s3";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-3feb2022-s3';

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

async function uploadFile(localPath, publicId) {
  if (!fs.existsSync(localPath)) return '';
  const res = await cloudinary.uploader.upload(localPath, {
    folder: CLOUDINARY_FOLDER,
    public_id: publicId,
    overwrite: true,
    resource_type: 'image'
  });
  return res.secure_url;
}

const F = '03-feb-2022-s3';

const IMAGE_MAP = {
  // REA image questions
  3:  { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] },
  12: { q: 'image9.jpeg', opts: ['image10.png','image11.png','image12.png','image13.png'] },
  19: { q: 'image14.jpeg', opts: ['image15.png','image16.png','image17.png','image18.png'] },

  // QA Q51-Q75 — all image-based
  51: { q: 'image19.jpeg', opts: ['image20.jpeg','image21.jpeg','image22.jpeg','image23.jpeg'] },
  52: { q: 'image24.jpeg', opts: ['image25.jpeg','image26.jpeg','image27.jpeg','image28.jpeg'] },
  53: { q: 'image29.jpeg', opts: ['image30.jpeg','image31.jpeg','image32.jpeg','image33.jpeg'] },
  54: { q: 'image34.jpeg', opts: ['image35.jpeg','image36.jpeg','image37.jpeg','image38.jpeg'] },
  55: { q: 'image39.jpeg', opts: ['image40.jpeg','image41.jpeg','image42.jpeg','image43.jpeg'] },
  56: { q: 'image44.jpeg', opts: ['image45.png','image46.png','image47.png','image48.png'] },
  57: { q: 'image49.jpeg', opts: ['image50.jpeg','image51.jpeg','image52.jpeg','image53.jpeg'] },
  58: { q: 'image54.jpeg', opts: ['image55.jpeg','image56.jpeg','image57.jpeg','image58.jpeg'] },
  59: { q: 'image59.jpeg', opts: ['image60.jpeg','image61.jpeg','image62.jpeg','image63.jpeg'] },
  60: { q: 'image64.jpeg', opts: ['image55.jpeg','image57.jpeg','image65.jpeg','image66.jpeg'] },
  61: { q: 'image67.jpeg', opts: ['image68.jpeg','image69.jpeg','image70.jpeg','image71.jpeg'] },
  62: { q: 'image72.jpeg', opts: ['image73.jpeg','image74.jpeg','image75.jpeg','image76.jpeg'] },
  63: { q: 'image77.jpeg', opts: ['image78.jpeg','image79.jpeg','image80.jpeg','image81.jpeg'] },
  64: { q: 'image82.jpeg', opts: ['image83.jpeg','image42.jpeg','image84.jpeg','image41.jpeg'] },
  65: { q: 'image85.jpeg', opts: ['image86.jpeg','image87.jpeg','image88.jpeg','image89.jpeg'] },
  66: { q: 'image90.jpeg', opts: ['image91.jpeg','image92.jpeg','image93.jpeg','image94.jpeg'] },
  67: { q: 'image95.jpeg', opts: ['image96.jpeg','image97.jpeg','image98.jpeg','image99.jpeg'] },
  68: { q: 'image100.jpeg', opts: ['image101.jpeg','image102.jpeg','image103.jpeg','image83.jpeg'] },
  69: { q: 'image104.jpeg', opts: ['image105.jpeg','image106.jpeg','image107.jpeg','image108.jpeg'] },
  70: { q: 'image109.jpeg', opts: ['image110.jpeg','image89.jpeg','image83.jpeg','image41.jpeg'] },
  71: { q: 'image111.jpeg', opts: ['image112.jpeg','image113.jpeg','image114.jpeg','image115.jpeg'] },
  72: { q: 'image116.jpeg', opts: ['image117.jpeg','image118.jpeg','image119.jpeg','image120.jpeg'] },
  73: { q: 'image121.jpeg', opts: ['image122.jpeg','image123.jpeg','image124.jpeg','image125.jpeg'] },
  74: { q: 'image126.jpeg', opts: ['image127.png','image128.png','image129.png','image130.png'] },
  75: { q: 'image131.jpeg', opts: ['image132.jpeg','image133.jpeg','image134.jpeg','image135.jpeg'] }
};

// 1-based answer key.
const KEY = [
  // 1-25 General Intelligence
  2, 1, 1, 1, 3,   1, 2, 1, 1, 2,   2, 2, 4, 1, 1,   4, 2, 3, 1, 2,   3, 4, 1, 2, 2,
  // 26-50 English Language
  1, 2, 4, 4, 4,   1, 1, 1, 3, 3,   3, 3, 3, 3, 1,   4, 2, 4, 1, 4,   4, 2, 1, 1, 4,
  // 51-75 Quantitative Aptitude — image-based; defaults for unanswered
  3, 2, 2, 3, 3,   3, 4, 4, 2, 3,   2, 2, 4, 1, 1,   4, 2, 4, 1, 2,   4, 3, 2, 2, 2,
  // 76-100 General Awareness
  2, 3, 2, 3, 4,   4, 1, 1, 3, 1,   4, 4, 4, 3, 2,   1, 2, 4, 2, 1,   4, 1, 2, 3, 2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "एक निश्चित कूट भाषा में, 'ANSWER' को 'ASNEWR' लिखा जाता है, और 'BRANCH' को 'BARCNH' लिखा जाता है। उसी कूट भाषा में 'LAWYER' को किस प्रकार लिखा जाएगा?", o: ["LWAFYR","LWAEYR","ALYWRE","AYLREW"], e: "Pattern: swap positions 2↔3 and 4↔5. LAWYER → L-W-A-E-Y-R → LWAEYR. Option 2." },
  { s: REA, q: "दिए गए विकल्पों में से उस अक्षर-समूह का चयन कीजिए, जो निम्नलिखित श्रृंखला में चिह्न (?) के स्थान पर आ सकता है।\n\nVQL, RMH, NID, JEZ, ?", o: ["FAV","ROI","HFD","EZS"], e: "Each letter decreases by 4. J−4=F, E−4=A, Z−4=V → FAV. Option 1." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए, जो निम्नलिखित श्रेणी में चिह्न (?) के स्थान पर आ सकती है।\n\n4, 16, 36, 64, ?", o: ["100","96","72","112"], e: "Pattern (2n)²: 2²=4, 4²=16, 6²=36, 8²=64, 10²=100. Option 1." },
  { s: REA, q: "उस विकल्प का चयन कीजिए, जिसका तीसरे अक्षर-समूह से वही संबंध है, जो दूसरे अक्षर-समूह का पहले अक्षर-समूह से है।\n\nSPL : HRO :: KFQ : ?", o: ["OGS","OHT","PHT","PHS"], e: "Pattern: 1st letter mirrored (27−x), 2nd letter +2, 3rd letter +3. S(19)→27−19=8=H, P+2=R, L+3=O ✓. KFQ: 27−11=16=P, F+2=H, Q+3=T → PHT. Option 3." },
  { s: REA, q: "छः लड़कियाँ — M, N, O, P, Q और R एक बेंच पर पूर्व की ओर मुख करके बैठी हैं। M, P और Q के बीच बैठी है। Q के दाईं ओर केवल दो लड़कियाँ बैठी हैं। R, P के बाईं ओर ठीक बगल में बैठी है।\n\nएकदम बाएँ सिरे पर कौन बैठी है?", o: ["R","P","N","Q"], e: "Arrangement (left→right): R, P, M, Q, ?, ?. R is at the leftmost end. Option 1." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'SQUARE' को '1081599' के रूप में कूटबद्ध किया जाता है और 'RIGHT' को '915782' के रूप में कूटबद्ध किया जाता है। उसी भाषा में 'SUBTLE' को किस रूप में कूटबद्ध किया जाएगा?", o: ["1021239","1012239","1220193","1013229"], e: "Per response sheet, option 2 (1012239)." },
  { s: REA, q: "सात मित्र P, Q, R, S, T, U और V एक सीधी क्षैतिज पंक्ति में उत्तर की ओर मुख करके बैठे हैं। V ठीक मध्य स्थान पर बैठा है। P और S के बीच केवल तीन मित्र बैठे हैं। S और T के बीच में केवल Q बैठा है। T, V के दाईं ओर तीसरे स्थान पर बैठा है।\n\nएकदम बाएँ सिरे पर कौन बैठा है?", o: ["P","T","Q","S"], e: "V at position 4 (middle); T = V+3 right = position 7; Q at 6, S at 5; P-S distance 4 ⇒ P at 1. Leftmost = P. Option 1." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'Knowledge' को 'Egdeknowl' के रूप में लिखा जाता है। उसी भाषा में 'Sarcastic' को किस रूप में लिखा जाएगा?", o: ["Citssarca","Citsacras","Cstisarca","Cstiacras"], e: "Pattern: reverse last 4 letters + first 5 letters. Knowledge(9)→edge(reverse=egde)+Knowl=Egdeknowl. Sarcastic→stic(reverse=cits)+Sarca=Citssarca. Option 1." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'CROW' को 177 और 'EAGLE' को 90 के रूप में कूटबद्ध किया जाता है। उसी कूट भाषा में 'DOVE' को किस रूप में कूटबद्ध किया जाएगा?", o: ["117","138","92","142"], e: "Code = 3 × sum of letter positions. CROW: 3·(3+18+15+23) = 3·59 = 177 ✓. EAGLE: 3·30 = 90 ✓. DOVE: 3·(4+15+22+5) = 3·46 = 138. Option 2." },
  { s: REA, q: "उस सही विकल्प का चयन कीजिए, जो दिए गए शब्दों के उस क्रम को दर्शाता है, जिस क्रम में वे अंग्रेज़ी शब्दकोश में मौजूद होते हैं।\n\n1. PREREQUISITE  2. PRESCRIPTION  3. PREPOSITION  4. PREROGATIVE  5. PREPOSTEROUS", o: ["2, 5, 1, 3, 4","3, 5, 1, 4, 2","2, 5, 3, 4, 1","2, 5, 1, 4, 3"], e: "Order: PREPOSITION(3) < PREPOSTEROUS(5) < PREREQUISITE(1) < PREROGATIVE(4) < PRESCRIPTION(2) → 3,5,1,4,2. Option 2." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'JOVIAL' को 'QIECZF' के रूप में लिखा जाता है और 'TENDER' को 'GYMXVL' के रूप में लिखा जाता है। उसी भाषा में 'STRING' को किस रूप में लिखा जाएगा?", o: ["MNLCHA","HNICMA","HIGRMT","HGIRMT"], e: "Per response sheet, option 4 (HGIRMT)." },
  { s: REA, q: "दिए गए कथन और निष्कर्ष सावधानीपूर्वक पढ़िए।\n\nकथन:\nकोई केतली, स्टोव नहीं है। सभी स्टोव, लाइटर हैं।\n\nनिष्कर्ष:\nI. कोई केतली, लाइटर नहीं है।\nII. कोई लाइटर, केतली नहीं है।\nIII. कुछ लाइटर, स्टोव हैं।\nIV. सभी लाइटर, स्टोव हैं।", o: ["केवल निष्कर्ष III अनुसरण करता है।","निष्कर्ष I और II दोनों अनुसरण करते हैं।","निष्कर्ष I और IV दोनों अनुसरण करते हैं।","केवल निष्कर्ष I अनुसरण करता है।"], e: "All stoves are lighters ⇒ some lighters are stoves (III ✓). Others don't necessarily follow. Option 1." },
  { s: REA, q: "चार अक्षर-समूह दिए गए हैं, जिनमें से तीन किसी तरह से संगत हैं और एक असंगत है। उस अक्षर-समूह का चयन कीजिए, जो अन्य से असंगत है।", o: ["QSW","MOR","SUX","KMP"], e: "MOR (+2,+3), SUX (+2,+3), KMP (+2,+3). QSW = (+2,+4) — odd one out. Option 1." },
  { s: REA, q: "'Huge' is related to 'Vast' in the same way as 'Fast' is related to '________'.", o: ["Gentle","Furious","Steady","Rapid"], e: "Huge:Vast :: Fast:Rapid (all are synonyms). Option 4." },
  { s: REA, q: "अक्षरों का वह संयोजन चुनिए जिसे निम्नांकित श्रृंखला के रिक्त स्थानों पर क्रमबद्ध रूप से रखे जाने पर श्रृंखला पूरी हो जाएगी।\n\nK _ T G B _ L T G _ K L _ G B K L T _ B", o: ["L, B, K, G, T","L, K, B, T, G","L, K, B, G, T","L, B, K, T, G"], e: "Per response sheet, option 2 (L, K, B, T, G)." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए, जो निम्नलिखित श्रेणी में चिह्न (?) के स्थान पर आ सकती है।\n\n20, 120, 240, 380, ?", o: ["590","680","540","660"], e: "Differences: +100, +120, +140, +160. 380+160=540. Option 3." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "दिए गए समीकरण को संतुलित करने के लिए किन दो चिह्नों को आपस में बदला जाना चाहिए?\n\n151 + 17 × 18 ÷ 2 − 19 = 17", o: ["+ और ×","− और +","÷ और ×","− और ×"], e: "Swap '−' and '+': 151 − 17 × 18 ÷ 2 + 19 = 151 − 153 + 19 = 17 ✓. Option 2." },
  { s: REA, q: "वह विकल्प चुनिए जो तीसरी संख्या से उसी प्रकार संबंधित है जिस प्रकार दूसरी संख्या, पहली संख्या से संबंधित है और छठी संख्या, पाँचवीं संख्या से संबंधित है।\n\n3 : 17 :: 6 : ? :: 9 : 47", o: ["38","36","32","34"], e: "Pattern: n × 5 + 2. 3·5+2=17 ✓. 9·5+2=47 ✓. 6·5+2=32. Option 3." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'SIGNAL' को 673425 और 'SLIDE' को 65719 के रूप में कूटबद्ध किया जाता है। उसी कूट भाषा में 'IDEAL' को किस रूप में कूटबद्ध किया जाएगा?", o: ["59751","97521","97215","71925"], e: "S=6, I=7, G=3, N=4, A=2, L=5, D=1, E=9. IDEAL = 7-1-9-2-5 = 71925. Option 4." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़िए।\n\nकथन:\nकुछ किताब पेंसिल हैं। सभी पेंसिल शार्पनर हैं। सभी किताब बैग हैं।\n\nनिष्कर्ष:\nI. कुछ बैग शार्पनर हैं।\nII. कुछ शार्पनर किताब हैं।\nIII. कुछ शार्पनर पेंसिल हैं।", o: ["सभी निष्कर्ष I, II और III पालन करते हैं।","केवल निष्कर्ष I और II पालन करते हैं।","केवल निष्कर्ष II और III पालन करते हैं।","केवल निष्कर्ष I और III पालन करते हैं।"], e: "Books∩Pencils ≠ ∅, Pencils⊂Sharpeners, Books⊂Bags ⇒ I, II, III all follow. Option 1." },
  { s: REA, q: "G की माँ, K की इकलौती पुत्री है। N, F और K का पुत्र है। H, N और M का पुत्र है। F, H के पिता का पिता है।\n\nK का H से क्या संबंध है?", o: ["नाना / माँ के पिता","दादी / पिता की माँ","नानी / माँ की माँ","चाचा / पिता का भाई"], e: "K is N's mother (F's wife). N is H's father. So K = H's father's mother = paternal grandmother (दादी). Option 2." },
  { s: REA, q: "'A @ B' का अर्थ है 'A, B का पति है'। 'A & B' का अर्थ है 'A, B की माँ है'। 'A # B' का अर्थ है 'A, B की बेटी है'।\n\nयदि G @ V & K @ P # J है, तो G का P से क्या संबंध है?", o: ["चाचा","ससुर","पिता","मामा"], e: "G@V: G is V's husband. V&K: V is K's mother. K@P: K is P's husband. So G is K's father (V's husband, V=K's mother); K is P's husband ⇒ G is P's father-in-law (ससुर). Option 2." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nFret", o: ["Please","Bother","Disturb","Worry"], e: "'Fret' (worry / be anxious) — antonym 'Please' (delight). Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nFull of people.", o: ["Popular","Populous","Prominent","Porous"], e: "'Populous' = densely populated / full of people. Option 2." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nA piece of cake", o: ["To be difficult","To be sweet","To be correct","To be easy"], e: "'A piece of cake' = something very easy. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nShakespeare still remains the most ________ read and the most performed of all dramatists.", o: ["mainly","narrowly","casually","widely"], e: "'Most widely read' is the standard collocation — meaning extensively read by many. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nI am glad I ________ my friend's invitation to dinner as I met many old friends there.", o: ["admitted","allowed","denied","accepted"], e: "'Accepted my friend's invitation' is the natural fit. Option 4." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nDistinguished", o: ["Acclaimed","Lowly","Practical","Ordinary"], e: "'Distinguished' (eminent / esteemed) — synonym 'Acclaimed'. Option 1." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Accomodate","Tomorrow","Marathon","Grammar"], e: "'Accomodate' is misspelled — correct is 'Accommodate' (double-c, double-m). Option 1." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nSplit", o: ["Divide","Combine","Join","Attach"], e: "'Split' = divide / separate. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDefamatory", o: ["Insulting","Unflattering","Complimentary","Slandering"], e: "'Defamatory' (damaging reputation) — antonym 'Complimentary' (praising). Option 3." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nTo raise a few eyebrows", o: ["To say something funny","To pretend to be shocked","To cause surprise or shock","To mime and make faces"], e: "'Raise eyebrows' = cause surprise / shock / disapproval. Option 3." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["Rebellious","Irritating","Irreligous","Irrelevant"], e: "'Irreligous' is misspelled — correct is 'Irreligious'. Option 3." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nAn afternoon performance of a play, film or show.", o: ["Circus","Musical","Matinee","Exhibition"], e: "'Matinee' = an afternoon performance. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nThe shopkeeper assured me about the freshness of the vegetables.", o: ["I am assured by the shopkeeper about the freshness of the vegetables.","I had been assured by the shopkeeper about vegetables being freshness of the vegetables.","I was assured about the freshness of the vegetables by the shopkeeper.","I was being assured about the freshness of the vegetables by the shopkeeper."], e: "Simple past active 'assured' → passive 'was assured'. Option 3." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["condone","belief","semetery","receive"], e: "'semetery' is misspelled — correct is 'cemetery'. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nThe chef asked his assistant where he had stored the spices.", o: ["The chef said to his assistant, \"Where did you store the spices?\"","The chef said to his assistant, \"Where had he store the spices?\"","The chef said to his assistant, \"Where do you store the spices?\"","The chef said to his assistant, \"Where you have stored the spices?\""], e: "Indirect 'asked where he had stored' (past perfect) → direct 'Where did you store' (simple past). Option 1." },
  { s: ENG, q: "Read the passage on online courses.\n\nBy 'watershed moment' the writer means:", o: ["pinpoint","checkpoint","middle point","turning point"], e: "'Watershed moment' = a turning point / critical juncture. Option 4." },
  { s: ENG, q: "Read the passage on online courses.\n\nSelect the option that does NOT correctly complete the given sentence.\n\nOnline course professors ________.", o: ["intervene when necessary","do not permit peer interaction","interact with student groups","check progress regularly"], e: "Passage says online courses offer 'stimulating online interactions with other students and the teachers' — so 'do not permit peer interaction' is FALSE. Option 2." },
  { s: ENG, q: "Read the passage on online courses.\n\nThe writer found the online course useful because he ________.", o: ["did not have to submit regular assignments","spent wonderful hours chatting online about his interests","was given special study leave from his executive duties","could adjust and fit the course to his work schedule"], e: "Per passage: writer is 'a busy executive' who could fit lecture portions and weekly assignments around his work. Option 4." },
  { s: ENG, q: "Read the passage on online courses.\n\nMany students who have taken online courses feel that ________.", o: ["online experience is equal, if not better than the traditional","nothing can replace face-to-face traditional learning","traditional classrooms have better content and teachers","online courses are only for working people"], e: "Per passage: 'rank their online experiences equal to or better than their more traditional classroom courses'. Option 1." },
  { s: ENG, q: "Read the passage on online courses.\n\nSelect the option that does NOT correctly complete the given sentence.\n\nOnline classes are useful because one ________.", o: ["has more control over one's learning","can study at one's own pace","can easily clarify one's doubts online","has to take only one final examination"], e: "Passage says online courses 'tend to include more frequent assessments' — so 'only one final examination' is FALSE. Option 4." },
  { s: ENG, q: "In the passage about a lecturer, fill in blank No. 1.\n\n'I was often invited to colleges and universities (1)________ lectures.'", o: ["deliver","delivered","delivering","to deliver"], e: "Infinitive 'to deliver' indicates purpose. Option 4." },
  { s: ENG, q: "In the passage about a lecturer, fill in blank No. 2.\n\n'(2)________ it was over, the students gathered to ask questions.'", o: ["Until","After","As long as","While"], e: "'After it was over, students gathered' — chronological sequence. Option 2." },
  { s: ENG, q: "In the passage about a lecturer, fill in blank No. 3.\n\n'…the students gathered to ask (3)________ questions.'", o: ["some","any","a little","all"], e: "'Some questions' — indefinite quantity. Option 1." },
  { s: ENG, q: "In the passage about a lecturer, fill in blank No. 4.\n\n'Though it was getting late (4)________ my next programme…'", o: ["for","to","at","on"], e: "'Late for my next programme' is the standard collocation. Option 1." },
  { s: ENG, q: "In the passage about a lecturer, fill in blank No. 5.\n\n'…since I love talking to (5)________, I remained there answering their questions.'", o: ["teachers","professors","principals","students"], e: "Passage is about a lecturer addressing students — he loves talking to students. Option 4." },

  // ============ Quantitative Aptitude (51-75) — all image-based ============
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "निम्नलिखित में से कौन सी पुस्तक अमिताभ घोष (Amitav Ghosh) द्वारा नहीं लिखी गई है?", o: ["द हंगरी टाइड (The Hungry Tide)","द गॉड ऑफ स्मॉल थिंग्स (The God of Small Things)","द शैडो लाइन्स (The Shadow Lines)","सी ऑफ पॉपीज़ (Sea of Poppies)"], e: "'The God of Small Things' (1997) was written by Arundhati Roy, not Amitav Ghosh. Option 2." },
  { s: GA, q: "शहद, जल तथा दो प्रकार की शक्कराओं — ________ और ग्लूकोज से बना होता है।", o: ["डेक्सट्रोज","सुक्रोज","फ्रुक्टोज","लैक्टुलोज"], e: "Honey is mainly fructose + glucose (with some water). Option 3." },
  { s: GA, q: "निम्न में से कौन सी जीवन बीमा कंपनी, अपने ग्राहकों को UPI ऑटोपे (AutoPay) सुविधा प्रदान करने वाली पहली जीवन बीमा कंपनी बन गई है?", o: ["एसबीआई लाइफ इंश्योरेंस","एचडीएफसी लाइफ इंश्योरेंस","पीएनबी मेटलाइफ इंश्योरेंस","आईसीआईसीआई प्रूडेंशियल लाइफ"], e: "HDFC Life became the first life insurer to offer UPI AutoPay facility to customers. Option 2." },
  { s: GA, q: "भारतीय संविधान का पहला संशोधन अधिनियम किस वर्ष लागू हुआ था?", o: ["1989","1971","1951","1948"], e: "The First Constitutional Amendment Act was passed in 1951 (under Nehru's government). Option 3." },
  { s: GA, q: "________ का उपयोग जल की अस्थाई और स्थाई कठोरता को दूर करने के लिए किया जाता है।", o: ["कैल्शियम ऑक्साइड","हाइड्रोजन सल्फ़ाइड","पोटैशियम ऑक्साइड","सोडियम कार्बोनेट"], e: "Sodium carbonate (washing soda, Na₂CO₃) removes both temporary and permanent hardness of water. Option 4." },
  { s: GA, q: "अगस्त 2021 में लॉन्च किया गया 'PM-DAKSH' पोर्टल और 'PM-DAKSH' मोबाइल ऐप, राष्ट्रीय ई-गवर्नेंस डिवीजन के सहयोग से ________ मंत्रालय द्वारा विकसित किया गया था।", o: ["विधि एवं न्याय","रसायन एवं उर्वरक","कृषि एवं किसान कल्याण","सामाजिक न्याय एवं अधिकारिता"], e: "PM-DAKSH (Pradhan Mantri Dakshta Aur Kushalta Sampann Hitgrahi) was developed by Ministry of Social Justice & Empowerment. Option 4." },
  { s: GA, q: "रुमटेक मठ निम्न में से किस राज्य में स्थित है?", o: ["सिक्किम","त्रिपुरा","असम","नागालैंड"], e: "Rumtek Monastery is located in East Sikkim, near Gangtok. Option 1." },
  { s: GA, q: "दूरी को मापने के लिए निम्नलिखित में से किस उपकरण का उपयोग किया जाता है?", o: ["ओडोमीटर","मैनोमीटर","नोमोन","पाइरोमीटर"], e: "An odometer measures distance travelled (used in vehicles). Option 1." },
  { s: GA, q: "सितंबर 2021 में, एफएमसीजी ब्रांड प्रियागोल्ड का ब्रांड एंबेसडर निम्न में से किसे नियुक्त किया गया था?", o: ["विनोद कानन","कियारा आडवाणी","अक्षय कुमार","करीना कपूर"], e: "Akshay Kumar was signed as brand ambassador for Priyagold biscuits in September 2021. Option 3." },
  { s: GA, q: "निम्नलिखित में से किस गाँव का संबंध विनोबा भावे द्वारा शुरू किए गए 'भूदान आंदोलन' से है?", o: ["पोचमपल्ली","कुम्भारी","होगेनक्कल","आम्रपाली"], e: "Vinoba Bhave started the Bhoodan Movement at Pochampally village (Telangana) on 18 April 1951. Option 1." },
  { s: GA, q: "मद्रास (चेन्नई) में भारतीय महिला संघ की स्थापना किस वर्ष हुई थी?", o: ["1927","1951","1948","1917"], e: "The Women's Indian Association (Bharatiya Mahila Sangh) was founded in Madras in 1917 by Annie Besant, Margaret Cousins and Dorothy Jinarajadasa. Option 4." },
  { s: GA, q: "________, वर्षावन की प्राथमिक परत है जो शेष दो परतों के ऊपर छत का निर्माण करती है।", o: ["वन तल (forest floor)","आपातिक परत (emergent layer)","अंडरस्टोरी परत (understory layer)","वितान परत (canopy layer)"], e: "The canopy layer (विताान परत) is the primary continuous roof formed by the upper crowns of rainforest trees. Option 4." },
  { s: GA, q: "यूनेस्को (UNESCO) का विश्व धरोहर स्थल, पट्टदकल (Pattadakal), ________ नदी के तट पर स्थित है।", o: ["तुंगभद्रा","घटप्रभा","भीमा","मालप्रभा"], e: "Pattadakal in Karnataka sits on the banks of the Malaprabha river. Option 4." },
  { s: GA, q: "निम्न में से किस देश ने टोक्यो पैरालंपिक 2020 में सर्वाधिक पदक जीते थे?", o: ["ग्रेट ब्रिटेन","भारत","चीन","यूएसए (USA)"], e: "China topped the Tokyo 2020 Paralympics medal table with 207 medals (96 gold). Option 3." },
  { s: GA, q: "________ ने 'अष्टाध्यायी' नामक प्रथम संस्कृत व्याकरण ग्रंथ लिखा था।", o: ["कबीर","पाणिनि","तुलसीदास","वाल्मीकि"], e: "Maharshi Panini wrote the Ashtadhyayi — the first Sanskrit grammar treatise (c. 4th century BCE). Option 2." },
  { s: GA, q: "सितंबर 2021 में, निम्न में से किस राज्य ने एक इलेक्ट्रॉनिक पार्क स्थापित करने की घोषणा की थी?", o: ["कर्नाटक","उत्तर प्रदेश","पंजाब","मध्य प्रदेश"], e: "Per response sheet, option 1 (Karnataka)." },
  { s: GA, q: "'डमहल (Dumhal)' निम्न में से किस राज्य/केंद्र शासित प्रदेश की एक प्रसिद्ध नृत्य शैली है?", o: ["उत्तर प्रदेश","जम्मू और कश्मीर","पुदुचेरी","कर्नाटक"], e: "Dumhal is a traditional dance performed by the men of the Wattal tribe of Jammu & Kashmir. Option 2." },
  { s: GA, q: "लोकसभा में अध्यक्षों (chairpersons) के पैनल में कितने सदस्य होते हैं?", o: ["17","13","9","10"], e: "The Speaker of Lok Sabha nominates a Panel of 10 Chairpersons under Rule 9. Option 4." },
  { s: GA, q: "ओइनम बेमबेम देवी (Oinam Bembem Devi) ने निम्नलिखित में से किस खेल में भारत का प्रतिनिधित्व किया है?", o: ["वॉलीबॉल","फुटबॉल","हॉकी","क्रिकेट"], e: "Oinam Bembem Devi is a celebrated Indian footballer (former captain of women's national team). Option 2." },
  { s: GA, q: "निम्न में से किस बैंक की 'खुदरा प्रत्यक्ष योजना (Retail Direct Scheme)', व्यक्तिगत निवेशकों द्वारा सरकारी प्रतिभूतियों में निवेश की सुविधा के लिए वन-स्टॉप समाधान के रूप में तैयार की गई है?", o: ["भारतीय रिज़र्व बैंक","एचडीएफसी बैंक","भारतीय स्टेट बैंक","आईसीआईसीआई बैंक"], e: "RBI Retail Direct Scheme (launched Nov 2021) allows individuals to invest in G-Secs directly. Option 1." },
  { s: GA, q: "सितंबर 2021 में, निम्न में से किस देश में द्विपक्षीय अभ्यास 'समुद्र शक्ति' का तीसरा संस्करण आयोजित हुआ था, जिसमें दो भारतीय नौसैनिक जहाजों, शिवालिक और कदमत ने भाग लिया था?", o: ["ऑस्ट्रेलिया","जापान","मलेशिया","इंडोनेशिया"], e: "Samudra Shakti is a bilateral naval exercise between India and Indonesia. 3rd edition held in Sept 2021 with INS Shivalik & Kadmatt. Option 4." },
  { s: GA, q: "देबेन्द्रनाथ टैगोर ने तत्त्वबोधिनी सभा की स्थापना किस वर्ष की थी?", o: ["1839","1868","1828","1815"], e: "Debendranath Tagore founded the Tattvabodhini Sabha in 1839 in Calcutta. Option 1." },
  { s: GA, q: "यदि एक टेबल टेनिस खेल ड्यूस (deuce) तक नहीं जाता है, तो विजेता द्वारा अर्जित किए जाने वाले अधिकतम अंक कितने होते हैं?", o: ["14","11","10","15"], e: "In table tennis, a game is won by reaching 11 points (with a 2-point lead). If deuce isn't reached, max winning score = 11. Option 2." },
  { s: GA, q: "निम्न में से कौन सी ज़ायद की एक फसल है?", o: ["चावल","मटर","खरबूजा","गेहूँ"], e: "Zaid season crops (summer): watermelon, muskmelon (खरबूजा), cucumber. Rice = Kharif; peas/wheat = Rabi. Option 3." },
  { s: GA, q: "निम्नलिखित में से क्या 'राजस्व प्राप्तियों' में शामिल होता है?\n(a) कर राजस्व\n(b) गैर-कर राजस्व", o: ["केवल (b)","(a) और (b) दोनों","केवल (a)","न तो (a) और न ही (b)"], e: "Revenue receipts = tax revenue + non-tax revenue (both). Option 2." }
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
        const localPath = path.join(EXTRACTED_DIR, imgInfo.q);
        const publicId = `${F}-q-${qNum}`;
        process.stdout.write(`Uploading Q${qNum} question... `);
        questionImage = await uploadFile(localPath, publicId);
        console.log(questionImage ? 'ok' : 'missing');
      }
      if (imgInfo.opts) {
        for (let oi = 0; oi < imgInfo.opts.length; oi++) {
          const localPath = path.join(EXTRACTED_DIR, imgInfo.opts[oi]);
          const publicId = `${F}-q-${qNum}-option-${oi + 1}`;
          process.stdout.write(`  opt ${oi + 1}... `);
          optionImages[oi] = await uploadFile(localPath, publicId);
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
      tags: ['SSC', 'Selection Post', 'Phase IX', 'Matriculation', 'PYQ', '2022'],
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
      description: 'Staff Selection Commission - Selection Post (Matriculation Level - 10th-pass eligibility)',
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

  const TEST_TITLE = 'SSC Selection Post Phase IX (Matriculation) - 3 February 2022 Shift-3';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-3',
    pyqExamName: 'SSC Selection Post Phase IX (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
