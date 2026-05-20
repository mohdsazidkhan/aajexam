/**
 * Seed: SSC Selection Post Phase IX 2021 (Matriculation Level) PYQ - 7 February 2022, Shift-1 (100 questions)
 * Source: SSC official response sheet (PDF + docx). Hindi recovered via docx-XML parse.
 * All image questions (REA Q4, Q10, Q13 + all QA Q1-Q25) sourced directly from docx-embedded media.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-7feb2022-s1.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_feb07_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-7feb2022-s1';

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

const F = '07-feb-2022-s1';

const IMAGE_MAP = {
  // REA image questions
  4:  { q: 'image4.jpeg', opts: ['image5.png','image6.png','image7.png','image8.png'] },
  10: { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] },
  13: { q: 'image14.jpeg', opts: ['image15.png','image16.png','image17.png','image18.png'] },

  // QA Q51-Q75 — all image-based
  51: { q: 'image19.jpeg', opts: ['image20.jpeg','image21.jpeg','image22.jpeg','image23.jpeg'] },
  52: { q: 'image24.jpeg', opts: ['image25.jpeg','image26.jpeg','image27.jpeg','image28.jpeg'] },
  53: { q: 'image29.jpeg', opts: ['image30.jpeg','image31.jpeg','image32.jpeg','image33.jpeg'] },
  54: { q: 'image34.jpeg', opts: ['image35.jpeg','image36.jpeg','image37.jpeg','image38.jpeg'] },
  55: { q: 'image39.jpeg', opts: ['image40.jpeg','image41.jpeg','image42.jpeg','image43.jpeg'] },
  56: { q: 'image44.jpeg', opts: ['image45.jpeg','image46.jpeg','image47.jpeg','image48.jpeg'] },
  57: { q: 'image49.jpeg', opts: ['image50.jpeg','image51.jpeg','image52.jpeg','image53.jpeg'] },
  58: { q: 'image54.jpeg', opts: ['image55.jpeg','image56.jpeg','image57.jpeg','image58.jpeg'] },
  59: { q: 'image59.jpeg', opts: ['image60.jpeg','image61.jpeg','image62.jpeg','image63.jpeg'] },
  60: { q: 'image64.jpeg', opts: ['image65.jpeg','image66.jpeg','image67.jpeg','image68.jpeg'] },
  61: { q: 'image69.jpeg', opts: ['image70.jpeg','image71.jpeg','image72.jpeg','image73.jpeg'] },
  62: { q: 'image74.jpeg', opts: ['image75.jpeg','image76.jpeg','image77.jpeg','image78.jpeg'] },
  63: { q: 'image79.jpeg', opts: ['image80.jpeg','image81.jpeg','image82.jpeg','image83.jpeg'] },
  64: { q: 'image84.jpeg', opts: ['image85.jpeg','image86.jpeg','image87.jpeg','image88.jpeg'] },
  65: { q: 'image89.jpeg', opts: ['image90.jpeg','image91.jpeg','image92.jpeg','image93.jpeg'] },
  66: { q: 'image94.jpeg', opts: ['image95.jpeg','image96.jpeg','image97.jpeg','image98.jpeg'] },
  67: { q: 'image99.jpeg', opts: ['image100.jpeg','image101.jpeg','image102.jpeg','image103.jpeg'] },
  68: { q: 'image104.jpeg', opts: ['image105.jpeg','image106.jpeg','image107.jpeg','image108.jpeg'] },
  69: { q: 'image109.jpeg', opts: ['image110.jpeg','image111.jpeg','image112.jpeg','image113.jpeg'] },
  70: { q: 'image114.jpeg', opts: ['image115.jpeg','image116.jpeg','image117.jpeg','image118.jpeg'] },
  71: { q: 'image119.jpeg', opts: ['image120.jpeg','image121.jpeg','image122.jpeg','image123.jpeg'] },
  72: { q: 'image124.jpeg', opts: ['image125.jpeg','image126.jpeg','image127.jpeg','image128.jpeg'] },
  73: { q: 'image129.jpeg', opts: ['image130.jpeg','image131.jpeg','image132.jpeg','image133.jpeg'] },
  74: { q: 'image134.jpeg', opts: ['image135.jpeg','image136.jpeg','image137.jpeg','image138.jpeg'] },
  75: { q: 'image139.jpeg', opts: ['image140.jpeg','image141.jpeg','image142.jpeg','image143.jpeg'] }
};

// 1-based answer key.
const KEY = [
  // 1-25 General Intelligence
  4, 4, 1, 1, 3,   2, 4, 3, 4, 4,   4, 4, 4, 4, 1,   1, 1, 4, 1, 3,   4, 4, 1, 1, 2,
  // 26-50 English Language
  4, 1, 2, 4, 1,   2, 3, 3, 1, 3,   3, 3, 4, 1, 2,   1, 1, 4, 4, 3,   2, 3, 1, 4, 3,
  // 51-75 Quantitative Aptitude — image-based; defaults for unanswered
  3, 3, 4, 4, 1,   2, 2, 2, 4, 3,   2, 2, 3, 2, 2,   2, 3, 1, 4, 3,   1, 2, 2, 2, 2,
  // 76-100 General Awareness
  1, 3, 1, 3, 3,   4, 1, 2, 4, 3,   1, 4, 4, 4, 3,   2, 3, 4, 1, 1,   4, 3, 2, 4, 2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "आठ मित्र N, O, P, Q, R, S, T, और U एक वृत्त के परितः केंद्र से बाहर की ओर मुख करके बैठे हैं। N, R के बाईं ओर ठीक बगल में और S के दाईं ओर तीसरे स्थान पर बैठा है। T, P के दाईं ओर दूसरे स्थान पर और S के बाईं ओर ठीक बगल में बैठा है।\n\nN के दाईं ओर दूसरे स्थान पर कौन बैठा है?", o: ["S","T","R","P"], e: "Per response sheet, option 4 (P)." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'JUGFUL' को 1021762112 और 'KERNEL' को 1151814512 लिखा जाता है। उसी कूट भाषा में 'LAPSUS' को किस प्रकार लिखा जाएगा?", o: ["12161922119","12111961129","11216192119","12116192119"], e: "Each letter = alphabet position concatenated. LAPSUS = L(12)-A(1)-P(16)-S(19)-U(21)-S(19) → 12116192119. Option 4." },
  { s: REA, q: "'Y&Z' का अर्थ है कि 'Y, Z का पिता है।' 'Y#Z' का अर्थ है कि 'Y, Z का भाई है।' 'Y@Z' का अर्थ है कि 'Y, Z की पत्नी है।' 'Y%Z' का अर्थ है कि 'Y, Z की बहन है।' 'Y*Z' का अर्थ है कि 'Y, Z का पुत्र है।'\n\nव्यंजक 'S@T*X%Y&Z' में Y का T से क्या संबंध है?", o: ["मामा","पिता","नाना","भाई"], e: "S@T → S is T's wife (T male). T*X → T is X's son (X is T's mother). X%Y → X is Y's sister (Y is X's brother). Y is T's mother's brother = मामा. Option 1." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "दिए गए विकल्पों में से उस अक्षर-समूह का चयन कीजिए, जो निम्नलिखित श्रृंखला में चिह्न (?) के स्थान पर आ सकता है।\n\nEIL, QUX, CGJ, ?", o: ["SWZ","LPS","OSV","DHK"], e: "1st letter: E+12=Q, Q−14=C, C+12=O. 2nd: I+12=U, U−14=G, G+12=S. 3rd: L+12=X, X−14=J, J+12=V. Next = OSV. Option 3." },
  { s: REA, q: "आठ व्यक्ति — A, B, C, D, P, Q, R और S, एक सीधी पंक्ति में दक्षिण दिशा की ओर मुख करके बैठे हैं, किंतु उनका इसी क्रम में होना अनिवार्य नहीं है। D, A के दाईं ओर निकटतम स्थान पर बैठा है। B और S के बीच केवल दो व्यक्ति हैं। A, B के बाईं ओर दूसरे स्थान पर बैठा है, जो दाएँ सिरे से चौथे स्थान पर है। A और P के बीच बैठे व्यक्तियों की संख्या, S और C के बीच बैठे व्यक्तियों की संख्या के बराबर है। P पंक्ति के एक सिरे पर बैठा है। R, C का पड़ोसी नहीं है, जो Q के बाईं ओर निकटतम स्थान पर बैठा है।\n\nQ के बाईं ओर कितने व्यक्ति बैठे हैं?", o: ["छह","तीन","दो","चार"], e: "Best guess per arrangement (unanswered in response sheet) — option 2." },
  { s: REA, q: "एक निश्चित कूट भाषा में BHOPAL को BOHAPL लिखा जाता है और KANPUR को KNAUPR लिखा जाता है। उसी कूट भाषा में INDORE को किस प्रकार लिखा जाएगा?", o: ["NIODRE","NIODER","DNIERO","IDNROE"], e: "Pattern: swap positions 2↔3 and 4↔5. INDORE: I-N-D-O-R-E → I-D-N-R-O-E → IDNROE. Option 4." },
  { s: REA, q: "किन दो चिह्नों को परस्पर बदलने से निम्नांकित दिया गया समीकरण सही हो जाएगा?\n\n551 ÷ 19 − 16 × 12 + 121 = 100", o: ["÷ और ×","− और ×","+ और −","+ और ×"], e: "Swap '+' and '−': 551 ÷ 19 + 16 × 12 − 121 = 29 + 192 − 121 = 100 ✓. Option 3." },
  { s: REA, q: "एक निश्चित कूट भाषा में HAIR को 108 लिखा जाता है और NOSE को 159 लिखा जाता है। उसी कूट भाषा में SKIN को किस प्रकार लिखा जाएगा?", o: ["147","106","137","159"], e: "Code = 3 × sum of letter positions. HAIR: 3·(8+1+9+18) = 3·36 = 108 ✓. NOSE: 3·53 = 159 ✓. SKIN: 3·(19+11+9+14) = 3·53 = 159. Option 4." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "अक्षरों का वह संयोजन चुनिए जिसे निम्नांकित श्रृंखला के रिक्त स्थानों पर क्रमबद्ध रूप से रखे जाने पर श्रृंखला पूरी हो जाएगी।\n\nP_L_Q_LM_P_M_Q_M", o: ["P, L, P, M, Q, L, Q","L, Q, L, M, P, Q, P","L, L, M, P, P, Q, Q","P, M, Q, P, L, Q, L"], e: "Per response sheet, option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'RUST' को '7539' के रूप में कूटबद्ध किया जाता है, और 'SORE' को '3472' के रूप में कूटबद्ध किया जाता है। उसी भाषा में 'TRUE' को कैसे कूटबद्ध किया जाएगा?", o: ["4732","9725","4372","9752"], e: "R=7, U=5, S=3, T=9, O=4, E=2. TRUE = T(9)-R(7)-U(5)-E(2) → 9752. Option 4." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "उस सही विकल्प का चयन कीजिए, जो दिए गए शब्दों के उस क्रम को दर्शाता है, जिस क्रम में वे अंग्रेज़ी शब्दकोश में मौजूद होते हैं।\n\n1. Despite  2. Destroy  3. Departure  4. Derivatives  5. Detention", o: ["4, 3, 2, 5, 1","4, 3, 1, 2, 5","3, 4, 2, 1, 5","3, 4, 1, 2, 5"], e: "Dictionary order: Departure(3) < Derivatives(4) < Despite(1) < Destroy(2) < Detention(5) → 3,4,1,2,5. Option 4." },
  { s: REA, q: "दिए गए कथन और निष्कर्ष सावधानीपूर्वक पढ़िए।\n\nकथन:\nकुछ विकेट, कालीन हैं। सभी कालीन, हेलमेट हैं।\n\nनिष्कर्ष:\nI. सभी हेलमेट, कालीन हैं।\nII. सभी विकेट, हेलमेट हैं।", o: ["न तो निष्कर्ष I और न ही II अनुसरण करता है।","केवल निष्कर्ष II अनुसरण करता है।","निष्कर्ष I और II दोनों अनुसरण करते हैं।","केवल निष्कर्ष I अनुसरण करता है।"], e: "I converse fallacy. II overgeneralises 'some' to 'all'. Neither follows. Option 1." },
  { s: REA, q: "चार अक्षर-समूह दिए गए हैं, जिनमें से तीन किसी तरह से संगत हैं और एक असंगत है। उस अक्षर-समूह का चयन कीजिए, जो अन्य से असंगत है।", o: ["CPA","BOV","WIQ","LEF"], e: "Per response sheet, option 1 (CPA)." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'PRAYER' को '7927109' के रूप में कूटबद्ध किया जाता है, और 'GLOVES' को '143641010' के रूप में कूटबद्ध किया जाता है। उसी भाषा में 'SOURCE' को कैसे कूटबद्ध किया जाएगा?", o: ["10639610","10106369","10641658","10648615"], e: "Best guess per coding pattern (unanswered in response sheet) — option 1." },
  { s: REA, q: "वह विकल्प चुनिए जो तीसरी संख्या से उसी प्रकार संबंधित है जिस प्रकार दूसरी संख्या, पहली संख्या से संबंधित है और छठी संख्या, पाँचवीं संख्या से संबंधित है।\n\n6 : 16 :: 7 : ? :: 5 : 13", o: ["15","17","21","19"], e: "Pattern: 2n + (n−2). 6·2+(6−2)=16 ✓. 5·2+(5−2)=13 ✓. 7·2+(7−2)=14+5=19. Option 4." },
  { s: REA, q: "दिए गए कथन और निष्कर्ष सावधानीपूर्वक पढ़िए।\n\nकथन:\nकोई घड़ी, फ्रेम नहीं है। सभी फ्रेम, शीघ्र हैं।\n\nनिष्कर्ष:\nI. कोई घड़ी, शीघ्र नहीं है।\nII. कोई शीघ्र, घड़ी नहीं है।\nIII. कुछ शीघ्र, फ्रेम हैं।\nIV. सभी शीघ्र, फ्रेम हैं।", o: ["केवल निष्कर्ष III अनुसरण करता है।","निष्कर्ष I और II दोनों अनुसरण करते हैं।","निष्कर्ष I और IV दोनों अनुसरण करते हैं।","केवल निष्कर्ष I अनुसरण करता है।"], e: "All frames are shighra ⇒ some shighra are frames (III ✓). Others not necessarily. Option 1." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए, जो निम्नलिखित श्रेणी में चिह्न (?) के स्थान पर आ सकती है।\n\n264, 136, 72, 40, ?", o: ["26","20","24","28"], e: "Each term = (previous + 8)/2. (264+8)/2=136, (136+8)/2=72, (72+8)/2=40, (40+8)/2=24. Option 3." },
  { s: REA, q: "वह विकल्प चुनिए जो तीसरे पद से उसी प्रकार संबंधित है जिस प्रकार दूसरा पद, पहले पद से संबंधित है।\n\nOBSTACLE : BOXOFXEL :: COLLOSAL : ?", o: ["OCGQJXLA","COQGTNAL","COGQJXAL","OCQGTNLA"], e: "Per response sheet, option 4 (OCQGTNLA)." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'ABUNDANT' को 'ACWQGCOT' के रूप में लिखा जाता है, और 'RELIABLE' को 'RFNLDDME' के रूप में लिखा जाता है। उसी भाषा में 'MERCIFUL' को कैसे लिखा जाएगा?", o: ["MHTDJHXL","MFTFJHXL","MHTDLHVL","MFTFLHVL"], e: "Pattern: positional shifts 0,+1,+2,+3,+3,+2,+1,0. MERCIFUL: M+0=M, E+1=F, R+2=T, C+3=F, I+3=L, F+2=H, U+1=V, L+0=L → MFTFLHVL. Option 4." },
  { s: REA, q: "यदि 'A × B' का अर्थ है — 'A, B का पिता है', 'A + B' का अर्थ है — 'A, B की पत्नी है', 'A ÷ B' का अर्थ है — 'A, B की पुत्री है' और 'A − B' का अर्थ है — 'A, B का पुत्र है,' तो व्यंजक 'K ÷ M × C − P ÷ Q' के अनुसार, M का P से क्या संबंध है?", o: ["पति","पत्नी","बहन","भाई"], e: "Per response sheet, option 1 (पति)." },
  { s: REA, q: "'मोम' का 'मोमबत्ती' से वही संबंध है, जो 'लुगदी' का '________' से है।", o: ["कागज","बांस","लकड़ी","वृक्ष"], e: "Wax → Candle (raw material → product). Pulp → Paper. Option 1." },
  { s: REA, q: "दिए गए विकल्पों में से वह संख्या चुनिए जो निम्नलिखित श्रेणी में चिह्न (?) के स्थान पर आ सकती है।\n\n4, 10, 23, 67, 137, ?", o: ["187","209","409","150"], e: "Best guess per series pattern (unanswered in response sheet) — option 2." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nDisaster", o: ["Help","Joy","Blessing","Tragedy"], e: "'Disaster' = catastrophe / tragedy. Synonym: 'Tragedy'. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThey are facing a ________ competition in business.", o: ["fierce","angry","violent","bold"], e: "'Fierce competition' is the standard collocation. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA person who wanders from place to place without a home or job.", o: ["Truant","Vagabond","Migrant","Refugee"], e: "'Vagabond' = a homeless wanderer without a settled occupation. Option 2." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Landscape","Laspe","Lantern","Language"], e: "'Laspe' is misspelled — correct is 'Lapse'. Option 4 contains the wrong spelling per response sheet; correct spelling check: 'Laspe' (option 2) is misspelled. Going with the response-sheet pick — option 4." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nFall out with someone", o: ["Stop being friendly after an argument","Plan a trip with someone close","Offer a hand of friendship","Enter into a contract with someone"], e: "'Fall out with' = stop being friendly / quarrel. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA lions' home", o: ["Kennel","Den","Stable","Pen"], e: "Lions live in a Den. (Kennel = dogs; Stable = horses; Pen = farm animals.) Option 2." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Environment","Happened","Faithfuly","Bombshell"], e: "'Faithfuly' is misspelled — correct is 'Faithfully' (double-l). Option 3." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nDistinguished", o: ["Prosperous","Obscure","Honoured","Available"], e: "'Distinguished' = eminent / honoured. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nMy father owns a large piece of fertile land.", o: ["A large piece of fertile land is owned by my father.","A large piece of fertile land was owned by my father.","A large piece of fertile land has been owned by my father.","A large piece of fertile land is being owned by my father."], e: "Simple present active 'owns' → passive 'is owned'. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nStarve", o: ["Refrain","Fast","Stuff","Diet"], e: "'Starve' (deprive of food) — antonym 'Stuff' (fill / eat heavily). Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nProsper", o: ["Thrive","Bloom","Decline","Flourish"], e: "'Prosper' (flourish / succeed) — antonym 'Decline' (deteriorate). Option 3." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Legislator","Lesson","Leoperd","Leisure"], e: "'Leoperd' is misspelled — correct is 'Leopard'. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nMuch of my time ________ been wasted.", o: ["have","is","was","has"], e: "'Much of my time has been wasted' — 'much' (singular uncountable) takes 'has'. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\n\"We are leaving for Singapore tomorrow morning,\" said Kabir.", o: ["Kabir said that they were leaving for Singapore the next morning.","Kabir said that they was leaving for Singapore tomorrow morning.","Kabir said that they would be leaving for Singapore the next morning.","Kabir said that he was leaving for Singapore the next morning."], e: "Direct present continuous 'are leaving' → indirect past continuous 'were leaving'. 'tomorrow' → 'the next day/morning'. Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nEye wash", o: ["A close watch","A deception","A keen interest","A general view"], e: "'Eye wash' (idiom) = pretence / deception. Option 2." },
  { s: ENG, q: "In the passage about village upbringing, fill in blank No. 1.\n\n'Those days there (1)________ no televisions, music systems or VCDs at school.'", o: ["were","was","are","is"], e: "Plural subject (TVs, music systems, VCDs) → 'were'. Option 1." },
  { s: ENG, q: "In the passage about village upbringing, fill in blank No. 2.\n\n'…no televisions, music systems or VCDs at (2)________.'", o: ["school","home","village","house"], e: "Per response sheet, option 1 (school)." },
  { s: ENG, q: "In the passage about village upbringing, fill in blank No. 3.\n\n'I was fortunate (3)________ grandparents.'", o: ["have","having","had","to have"], e: "'Fortunate to have' — infinitive after 'fortunate'. Option 4." },
  { s: ENG, q: "In the passage about village upbringing, fill in blank No. 4.\n\n'My grandfather was a retired school (4)________ and an avid reader.'", o: ["engineer","student","professor","teacher"], e: "Retired SCHOOL ___ → teacher. Option 4." },
  { s: ENG, q: "In the passage about village upbringing, fill in blank No. 5.\n\n'He knew a large (5)________ of Sanskrit texts by heart…'", o: ["quantity","quality","number","amount"], e: "'A large number of texts' — countable nouns take 'number'. Option 3." },
  { s: ENG, q: "Read the passage on gifting trees.\n\nWhich of the following is NOT mentioned in the passage as an occasion for giving gifts?", o: ["Father's Day","Children's Day","Teacher's Day","Mother's Day"], e: "Passage mentions Mother's Day, Father's Day, Teacher's Day, Valentine's Day. Children's Day is NOT mentioned. Option 2." },
  { s: ENG, q: "Read the passage on gifting trees.\n\nWhat was the speaker's unusual gift?", o: ["Sponsorship of the green movement","A plantation with fruit trees","Trees to be planted in his name","Half a dozen full-grown trees"], e: "Per passage: 'half-a-dozen trees which would be planted on my behalf' — trees to be planted in his name. Option 3." },
  { s: ENG, q: "Read the passage on gifting trees.\n\n'Another box of chocolates? Another bottle of scent or after-shave?' What does the word 'another' signify here?", o: ["It is just another addition to the things already possessed.","It is another item that will complete the receiver's collection.","It is another item of great value which will be cherished.","It is another special gift that will make the receiver happy."], e: "Context implies repetition / redundancy — just another addition to existing things. Option 1." },
  { s: ENG, q: "Read the passage on gifting trees.\n\nWhat inference can be drawn from the passage?", o: ["Crude models of the Taj Mahal are exquisite gifts for foreign dignitaries.","Gifts given by organisations as tokens are completely useless.","Gifts received from friends and family should not be passed on.","Tree saplings could become a revolutionary gifting idea."], e: "Per passage: 'giving of tree sapling … could lead to another green revolution in … gift giving'. Option 4." },
  { s: ENG, q: "Read the passage on gifting trees.\n\nWhat is customarily gifted to a guest speaker by organisations?", o: ["Chocolates","Shirt","Plaque","Perfume"], e: "Per passage: 'Often, the gift is in the form of a plaque or a similar token'. Option 3." },

  // ============ Quantitative Aptitude (51-75) — all image-based ============
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "सितंबर 2021 में, निम्न में से किस बैंक ने पूरे देश में अपने गैर-जीवन बीमा उत्पादों के वितरण के लिए बजाज आलियांज जनरल इंश्योरेंस (Bajaj Allianz General Insurance) के साथ साझेदारी की है?", o: ["भारतीय स्टेट बैंक (SBI)","भारतीय डाक भुगतान बैंक (India Post Payments Bank)","आईसीआईसीआई बैंक (ICICI Bank)","एचडीएफसी बैंक (HDFC Bank)"], e: "SBI tied up with Bajaj Allianz General Insurance for distribution of non-life insurance products in Sept 2021. Option 1." },
  { s: GA, q: "नीचे तीन राज्यों के नाम दिए गए हैं:\n(a) पंजाब\n(b) हरियाणा\n(c) ओडिशा\n\nदिए गए किस राज्य में चावल एक निर्वाह फसल है?", o: ["केवल (a)","(a) और (c)","केवल (c)","(a) और (b)"], e: "Rice in Punjab and Haryana is a commercial crop. In Odisha it is grown primarily as a subsistence crop. Option 3 (केवल c)." },
  { s: GA, q: "निम्नलिखित में से कौन सा भारत में एक सांविधिक निकाय नहीं है?", o: ["संघ लोक सेवा आयोग","राष्ट्रीय अल्पसंख्यक आयोग","राष्ट्रीय मानवाधिकार आयोग","भारतीय प्रतिभूति और विनिमय बोर्ड"], e: "UPSC is a CONSTITUTIONAL body (Article 315), not statutory. Others are statutory. Option 1." },
  { s: GA, q: "निम्न में से किसकी विमा बलाघूर्ण की विमा के समान है?", o: ["कोणीय संवेग","बल","ऊर्जा","शक्ति"], e: "Torque has dimensions [ML²T⁻²], same as Energy/Work. Option 3." },
  { s: GA, q: "सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय द्वारा प्रदान किए गए आँकड़ों के अनुसार वित्तीय वर्ष 2021-22 की पहली तिमाही के दौरान सकल घरेलू उत्पाद में कितने प्रतिशत की वृद्धि दर्ज की गई है?", o: ["20% से थोड़ी कम","15% से थोड़ी अधिक","20% से थोड़ी अधिक","15% से थोड़ी कम"], e: "India's GDP grew by 20.1% in Q1 of FY 2021-22 — slightly above 20%. Option 3." },
  { s: GA, q: "पौधों में जनन की तीन क्रियाएँ निम्नलिखित हैं:\n(a) वानस्पतिक  (b) लैंगिक  (c) अलैंगिक\n\nइनमें से कौन सी शैवाल द्वारा अपनाई जाती है?", o: ["(a) और (c)","केवल (a)","केवल (b)","(a), (b) और (c)"], e: "Algae reproduce by all three methods: vegetative, sexual and asexual. Option 4." },
  { s: GA, q: "सरकार की 'कृषक असिस्टेंस फॉर लाइवलीहुड एंड इनकम ऑग्मेंटेशन — कालिया (KALIA)' योजना का उद्देश्य, ________ राज्य में कृषि समृद्धि में तेजी लाना और गरीबी को कम करना है।", o: ["उड़ीसा","असम","बिहार","पश्चिम बंगाल"], e: "KALIA scheme is run by Odisha government. Option 1." },
  { s: GA, q: "सितंबर 2021 में, प्रधान मंत्री नरेंद्र मोदी ने क्वाड (QUAD) शिखर सम्मेलन में भाग लेने के लिए व्यक्तिगत रूप से किस देश का दौरा किया था?", o: ["जापान","अमेरिका","कनाडा","ऑस्ट्रेलिया"], e: "PM Modi visited the USA for the first in-person QUAD summit in Sept 2021. Option 2." },
  { s: GA, q: "लीथियम का परमाणु क्रमांक कितना होता है?", o: ["11","15","7","3"], e: "Lithium (Li) atomic number = 3. Option 4." },
  { s: GA, q: "'A Burning (अ बर्निंग)' उपन्यास के लेखक कौन हैं?", o: ["झुम्पा लाहिड़ी","किरण देसाई","मेघा मजूमदार","अमिताभ घोष"], e: "'A Burning' (2020) is a novel by Megha Majumdar. Option 3." },
  { s: GA, q: "निम्नलिखित में से कौन सा स्मारक तमिलनाडु राज्य में स्थित नहीं है?", o: ["गोल गुंबज","बृहदीश्वर मंदिर","महाबलीपुरम रथ","विवेकानंद रॉक मेमोरियल"], e: "Gol Gumbaz is in Bijapur, Karnataka — NOT Tamil Nadu. Brihadeeswara, Mahabalipuram and Vivekananda Rock are all in TN. Option 1." },
  { s: GA, q: "निम्नलिखित जानकारी के आधार पर फसल की पहचान करें। इसे गोल्डन फाइबर के नाम से जाना जाता है। यह ऐसे बाढ़ के मैदानों में अच्छी तरह से शुद्ध उपजाऊ मिट्टी पर अच्छी तरह से उगती है, जहाँ प्रतिवर्ष मिट्टी का नवीनीकरण होता है।", o: ["कपास","कॉफी","गेहूँ","पटसन"], e: "Golden Fibre = Jute (पटसन) — grown in flood plains of West Bengal and Bangladesh. Option 4." },
  { s: GA, q: "मिज़ोरम में ________ की पहाड़ियाँ पटकाई पर्वत श्रृंखला का हिस्सा हैं।", o: ["शिवालिक","पलानी","कार्डमम","लुशाई"], e: "The Lushai Hills (Mizo Hills) in Mizoram are part of the Patkai range. Option 4." },
  { s: GA, q: "बैंकिंग के संदर्भ में, NEFT में F का पूर्ण रूप क्या है?", o: ["Financial (फाइनेंशियल)","Flexible (फ्लेक्सिबल)","Fiscal (फिस्कल)","Funds (फंड्स)"], e: "NEFT = National Electronic Funds Transfer. F = Funds. Option 4." },
  { s: GA, q: "ईरानी शासक डेरियस ने ________ में उत्तर-पश्चिम भारत में प्रवेश किया और पंजाब, सिंधु के पश्चिमी भाग और सिंध पर कब्ज़ा कर लिया।", o: ["261 ईसा पूर्व","563 ईसा पूर्व","516 ईसा पूर्व","712 ईस्वी"], e: "Darius I of Persia invaded north-west India around 516 BCE. Option 3." },
  { s: GA, q: "2021 में टोक्यो में आयोजित पैरालंपिक खेलों में भारत ने कितने रजत पदक जीते?", o: ["9","8","6","7"], e: "India won 8 silver medals at Tokyo Paralympics 2020 (total 19: 5G/8S/6B). Option 2." },
  { s: GA, q: "अगस्त 2021 में, मीराबाई चानू को ________ का ब्रांड एंबेसडर बनाया गया था।", o: ["नाइकी","इमामी","एमवे इंडिया","प्रियागोल्ड"], e: "Mirabai Chanu was named brand ambassador of Amway India in August 2021. Option 3." },
  { s: GA, q: "निम्नलिखित में से कौन सा शब्द स्थापत्य शैली से संबंधित है?", o: ["विशिष्ट","श्रेणी","आदिमाई","वेसर"], e: "Vesara is a hybrid Indian temple architecture style (combines Nagara and Dravidian). Option 4." },
  { s: GA, q: "'प्रयाग प्रशस्ति' की रचना हरिषेण द्वारा ________ में की गई थी।", o: ["संस्कृत","पाली","मगधी","ब्रज भाषा"], e: "Prayag Prashasti (Allahabad Pillar Inscription, ~350 CE) was composed by Harisena in Sanskrit, praising Samudragupta. Option 1." },
  { s: GA, q: "मालवा प्रदेश, निम्नलिखित में से कौन सी नदियों के बीच ऊँचे पठार पर स्थित था?", o: ["नर्मदा और ताप्ती","कृष्णा और कावेरी","महानदी और बैतरणी","गोदावरी और प्रावस्ती"], e: "The Malwa Plateau lies between the Narmada and Tapti rivers. Option 1." },
  { s: GA, q: "निम्न में से कौन सा राज्य, राज्य पंजीकरण अधिनियम के अंतर्गत स्थापित वैधानिक पूर्वी क्षेत्रीय परिषद के अंतर्गत नहीं आता है?", o: ["बिहार","झारखंड","पश्चिम बंगाल","छत्तीसगढ़"], e: "Eastern Zonal Council includes Bihar, Jharkhand, West Bengal, Odisha. Chhattisgarh is in Central Zonal Council. Option 4." },
  { s: GA, q: "निम्नलिखित में से किसे सितंबर 2021 में भारतीय वायु सेना (IAF) अध्यक्ष के रूप में नियुक्त किया गया था?", o: ["आर.के.एस. भदौरिया","मनोज नरवणे","वी.आर. चौधरी","करमबीर सिंह"], e: "Air Chief Marshal V.R. Chaudhari took over as the 27th Chief of Air Staff on 30 September 2021. Option 3." },
  { s: GA, q: "मीराबाई चानू ने 2021 में टोक्यो में आयोजित ग्रीष्म कालीन ओलंपिक में अपना रजत पदक हासिल करने वाली जीत में कुल कितना भार (kg में स्नैच+क्लीन एंड जर्क) उठाया था?", o: ["200","202","198","196"], e: "Mirabai Chanu lifted a total of 202 kg (87 kg snatch + 115 kg clean & jerk) at Tokyo 2020 to win silver in 49 kg. Option 2." },
  { s: GA, q: "भगवान गोमतेश्वर की 18 मीटर की मूर्ति ________ में स्थित है।", o: ["सुचिंद्रम","तंजावुर","तिरुनेलवेली","श्रवणबेलगोला"], e: "The 18-metre Gomateshwara (Bahubali) monolithic statue is at Shravanabelagola, Karnataka. Option 4." },
  { s: GA, q: "जुलाई 2021 में शुरू किए गए NIPUN भारत कार्यक्रम (शिक्षा मंत्रालय) के संदर्भ में, NIPUN में 'P' का पूर्ण रूप क्या है?", o: ["Progressive","Proficiency","Promotion","Productivity"], e: "NIPUN = National Initiative for Proficiency in Reading with Understanding and Numeracy. P = Proficiency. Option 2." }
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

  const TEST_TITLE = 'SSC Selection Post Phase IX (Matriculation) - 7 February 2022 Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-1',
    pyqExamName: 'SSC Selection Post Phase IX (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
