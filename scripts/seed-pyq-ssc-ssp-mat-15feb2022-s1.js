/**
 * Seed: SSC Selection Post Phase IX 2021 (Matriculation Level) PYQ - 15 February 2022, Shift-1 (100 questions)
 * Source: SSC official response sheet (PDF + docx). Hindi recovered via docx-XML parse.
 * Note: PDF metadata reads "Exam Date 15/03/2022" but folder convention says 15 Feb — went with folder convention.
 * All image questions (REA Q3/Q17/Q19 + all QA Q1-Q25) sourced directly from docx-embedded media.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-15feb2022-s1.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_feb15_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-15feb2022-s1';

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

const F = '15-feb-2022-s1';

const IMAGE_MAP = {
  // REA image questions
  3:  { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] },
  17: { q: 'image9.jpeg', opts: ['image10.png','image11.png','image12.png','image13.png'] },
  19: { q: 'image14.jpeg', opts: ['image15.png','image16.png','image17.png','image18.png'] },

  // QA Q51-Q75 — all image-based
  51: { q: 'image19.jpeg', opts: ['image20.jpeg','image21.jpeg','image22.jpeg','image23.jpeg'] },
  52: { q: 'image24.jpeg', opts: ['image25.jpeg','image26.jpeg','image27.jpeg','image28.jpeg'] },
  53: { q: 'image29.jpeg', opts: ['image30.jpeg','image31.jpeg','image32.jpeg','image33.jpeg'] },
  54: { q: 'image34.jpeg', opts: ['image35.jpeg','image36.jpeg','image37.jpeg','image38.jpeg'] },
  55: { q: 'image39.jpeg', opts: ['image40.jpeg','image41.jpeg','image42.jpeg','image43.jpeg'] },
  56: { q: 'image44.jpeg', opts: ['image45.jpeg','image46.jpeg','image47.jpeg','image48.jpeg'] },
  57: { q: 'image49.jpeg', opts: ['','image50.png','image51.png','image52.png'] },
  58: { q: 'image53.jpeg', opts: ['image54.jpeg','image55.jpeg','image56.jpeg','image57.jpeg'] },
  59: { q: 'image58.png',  opts: ['image59.jpeg','image60.jpeg','image61.jpeg','image62.jpeg'] },
  60: { q: 'image63.jpeg', opts: ['image64.jpeg','image65.jpeg','image66.jpeg','image67.jpeg'] },
  61: { q: 'image68.jpeg', opts: ['image69.jpeg','image70.jpeg','image71.jpeg','image72.jpeg'] },
  62: { q: 'image73.jpeg', opts: ['image74.jpeg','image75.jpeg','image76.jpeg','image77.jpeg'] },
  63: { q: 'image78.png',  opts: ['image79.jpeg','image80.jpeg','image81.jpeg','image82.jpeg'] },
  64: { q: 'image83.png',  opts: ['','image84.jpeg','image85.jpeg','image86.jpeg'] },
  65: { q: 'image87.png',  opts: ['image88.jpeg','image89.jpeg','image90.jpeg','image91.jpeg'] },
  66: { q: 'image92.jpeg', opts: ['image93.jpeg','image94.jpeg','image95.jpeg','image96.jpeg'] },
  67: { q: 'image97.jpeg', opts: ['image98.jpeg','image99.jpeg','image100.jpeg','image101.jpeg'] },
  68: { q: 'image102.jpeg', opts: ['image103.jpeg','image104.jpeg','image105.jpeg','image106.jpeg'] },
  69: { q: 'image107.jpeg', opts: ['image108.jpeg','image109.jpeg','image110.jpeg','image111.jpeg'] },
  70: { q: 'image112.jpeg', opts: ['image65.jpeg','image64.jpeg','image113.jpeg','image114.jpeg'] },
  71: { q: 'image115.jpeg', opts: ['image116.png','image117.png','image118.jpeg',''] },
  72: { q: 'image119.jpeg', opts: ['image120.jpeg','image121.jpeg','image122.jpeg','image123.jpeg'] },
  73: { q: 'image124.jpeg', opts: ['image125.jpeg','image126.jpeg','image127.jpeg','image128.jpeg'] },
  74: { q: 'image129.jpeg', opts: ['image130.jpeg','image131.jpeg','image132.jpeg','image133.jpeg'] },
  75: { q: 'image134.jpeg', opts: ['image135.jpeg','image136.jpeg','image137.jpeg','image138.jpeg'] }
};

// 1-based answer key.
const KEY = [
  // 1-25 General Intelligence
  2, 4, 1, 4, 3,   3, 4, 4, 4, 3,   3, 3, 1, 3, 3,   3, 4, 1, 2, 4,   4, 1, 3, 3, 1,
  // 26-50 English Language
  1, 1, 3, 2, 4,   1, 4, 4, 3, 4,   4, 1, 1, 1, 1,   1, 1, 3, 1, 4,   4, 2, 1, 4, 2,
  // 51-75 Quantitative Aptitude — image-based
  3, 1, 2, 2, 2,   4, 2, 3, 2, 2,   3, 4, 4, 1, 2,   4, 2, 3, 3, 3,   3, 2, 2, 2, 1,
  // 76-100 General Awareness
  2, 1, 2, 3, 1,   2, 4, 4, 3, 4,   3, 2, 2, 1, 4,   1, 4, 3, 2, 2,   4, 3, 1, 1, 1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "उस विकल्प का चयन करें जो तीसरे शब्द से उसी प्रकार संबंधित है जैसे दूसरा शब्द पहले शब्द से संबंधित है।\n\nश्वसन (Breathing) : श्वसन तंत्र (Respiratory System) :: रक्त परिसंचरण (Blood Circulation) : ?", o: ["तंत्रिका तंत्र (Nervous System)","परिसंचरण तंत्र (Circulatory System)","उत्सर्जन तंत्र (Excretory System)","पाचन तंत्र (Digestive System)"], e: "Breathing is the function of the respiratory system; blood circulation is the function of the circulatory system. Option 2." },
  { s: REA, q: "उस विकल्प का चयन कीजिए जो तीसरे पद से उसी प्रकार से संबंधित है, जिस प्रकार दूसरा पद पहले पद से संबंधित है।\n\nSMART : QOYTR :: LOGIC : ?", o: ["JPEKA","JPEJA","JQFKA","JQEKA"], e: "Alternating shifts −2, +2, −2, +2, −2. SMART → Q,O,Y,T,R ✓. LOGIC → J(L−2), Q(O+2), E(G−2), K(I+2), A(C−2) = JQEKA. Option 4." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "उस सही विकल्प का चयन कीजिए जो दिए गए शब्दों की व्यवस्था को उसी क्रम में इंगित करता है, जिस क्रम में वे अंग्रेज़ी शब्दकोश में दिखाई देते हैं।\n\n1. Nervous  2. Nobility  3. Nebulizer  4. Nominate  5. Nitrogen", o: ["3, 5, 1, 2, 4","3, 1, 2, 5, 4","3, 4, 2, 5, 1","3, 1, 5, 2, 4"], e: "Dictionary order: Nebulizer(3), Nervous(1), Nitrogen(5), Nobility(2), Nominate(4) → 3,1,5,2,4. Option 4." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए, जिसे निम्नलिखित श्रेणी में प्रश्न-वाचक चिह्न (?) के स्थान पर आ सकती है।\n\n21, 22, 18, 27, 11, 36, ?", o: ["72","2","0","27"], e: "Odd positions 21, 18, 11 follow −3, −7, next −11 → 11 − 11 = 0. Option 3." },
  { s: REA, q: "'A + B' का अर्थ है कि 'A, B की बहन है'; 'A = B' का अर्थ है कि 'A, B की पुत्री है'।\n\nयदि 'G + T + U = D' है, तो G, D से किस प्रकार संबंधित है?", o: ["बहन","माँ","पुत्री","मामी"], e: "G+T+U=D means G, T, U are sisters (G+T, T+U). U=D means U is D's daughter — so G & T are also D's daughters. G is D's पुत्री. Option 3." },
  { s: REA, q: "उस विकल्प का चयन करें जो तीसरी संख्या से उसी प्रकार संबंधित है जैसे दूसरी संख्या पहली संख्या से संबंधित है और छठी संख्या पाँचवीं संख्या से संबंधित है।\n\n6 : 41 :: 12 : ? :: 9 : 86", o: ["139","76","58","149"], e: "Pattern: n² + 5. 6² + 5 = 41 ✓. 9² + 5 = 86 ✓. 12² + 5 = 144 + 5 = 149. Option 4." },
  { s: REA, q: "दो कथन और उनके बाद I और II दो निष्कर्ष दिए गए हैं।\n\nकथन: कुछ आम संतरे हैं। सभी संतरे अंगूर हैं।\n\nनिष्कर्ष:\nI. सभी अंगूर संतरे हैं।\nII. सभी आम अंगूर हैं।", o: ["निष्कर्ष I और II, दोनों अनुसरण करते हैं","केवल निष्कर्ष I अनुसरण करता है","केवल निष्कर्ष II अनुसरण करता है","न तो निष्कर्ष I और न ही निष्कर्ष II अनुसरण करता है"], e: "I doesn't follow (orange ⊆ grape ≠ grape ⊆ orange). II doesn't follow either (only some mangoes are oranges, and only those would be grapes). Option 4." },
  { s: REA, q: "एक निश्चित कोड भाषा में, 'PLACID' को 'QNDGNJ' लिखा जाता है। उसी भाषा में 'FLASKS' कैसे लिखा जाएगा?", o: ["GNEXPY","GNDVPZ","GNDWQX","GNDWPY"], e: "Shifts +1, +2, +3, +4, +5, +6 per letter. PLACID: P+1=Q, L+2=N, A+3=D, C+4=G, I+5=N, D+6=J ✓. FLASKS: F+1=G, L+2=N, A+3=D, S+4=W, K+5=P, S+6=Y = GNDWPY. Option 4." },
  { s: REA, q: "उस सही विकल्प का चयन करें जो दिए गए शब्दों की व्यवस्था को उसी क्रम में दर्शाता है जिस क्रम में वे अंग्रेज़ी शब्दकोश में दिखाई देते हैं।\n\n1. Utility  2. Useful  3. Ultimate  4. Ulterior  5. Utensils", o: ["4, 2, 3, 5, 1","3, 4, 2, 5, 1","4, 3, 2, 5, 1","4, 3, 2, 1, 5"], e: "Dictionary order: Ulterior(4), Ultimate(3), Useful(2), Utensils(5), Utility(1) → 4,3,2,5,1. Option 3." },
  { s: REA, q: "'A @ B' का अर्थ है A, B का पति है; 'A & B' का अर्थ है A, B की माँ है।\n\nयदि 'K @ H & C', तो निम्नलिखित में से कौन-सा कथन सही है?", o: ["H, C की बहन है।","H, K के पिता है।","K, C के पिता है।","C, K की माँ है।"], e: "K is H's husband; H is C's mother. So K = C's father. Option 3." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़ें।\n\nकथन: कुछ कैलकुलेटर लालटेन हैं। कुछ लालटेन मोबाइल हैं।\n\nनिष्कर्ष:\nI. सभी मोबाइल कैलकुलेटर हैं।\nII. कोई भी मोबाइल लालटेन नहीं है।\nIII. कुछ मोबाइल लालटेन हैं।", o: ["केवल निष्कर्ष I और III अनुसरण करता है।","केवल निष्कर्ष I अनुसरण करता है।","केवल निष्कर्ष III अनुसरण करता है।","केवल निष्कर्ष I और II अनुसरण करता है।"], e: "'Some lanterns are mobiles' → conversion: 'some mobiles are lanterns' (III ✓). I, II don't follow. Option 3." },
  { s: REA, q: "आठ व्यक्ति K, L, M, N, O, P, Q और R एक वृत्ताकार मेज के चारों ओर दक्षिणावर्त बैठे हैं, वे सभी आपस में समान दूरी रखते हुए इसी क्रम में मेज के केंद्र की ओर मुख करके बैठे हैं। यदि K पूर्व में बैठा है, तो P किस दिशा में बैठा है?", o: ["उत्तर-पश्चिम","उत्तर-पूर्व","पश्चिम","उत्तर"], e: "8 directions (45° apart). Clockwise from K(E): L(SE), M(S), N(SW), O(W), P(NW). Option 1." },
  { s: REA, q: "निम्नलिखित समीकरण को संतुलित करने के लिए किन दो चिह्नों को परस्पर बदलने की आवश्यकता है?\n\n25 − 48 + 6 ÷ 12 × 2 = 41", o: ["– और +","÷ और –","÷ और +","× और ÷"], e: "Swap ÷ and +: 25 − 48 ÷ 6 + 12 × 2 = 25 − 8 + 24 = 41 ✓. Option 3." },
  { s: REA, q: "एक पार्क में चार खंभे A, B, C और D स्थित हैं। B, D से 65 m पश्चिम में है। A, B से 45 m उत्तर में है। A, C से 45 m दक्षिण में है। B और C के बीच की सीधी दूरी कितनी है?", o: ["120 m","110 m","90 m","20 m"], e: "C is 45 m + 45 m = 90 m north of B (since A is 45 m north of B and 45 m south of C). Direct distance B-C = 90 m. Option 3." },
  { s: REA, q: "अक्षरों के उस संयोजन का चयन कीजिए जिसे दी गई श्रृंखला के रिक्त स्थानों में क्रमिक रूप से रखने पर श्रृंखला पूर्ण हो जाएगी।\n\nU K _ _ Z U _ T M _ U K _ M Z _ K T _ Z", o: ["T M K Z T Z M","T M T Z T U M","T M K Z T U M","T M K Z T U T"], e: "Per response sheet, option 3 (T M K Z T U M)." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'CONVERT' को '6445297' और 'FORTUNE' को '3497542' कोडित किया जाता है। उसी कूट भाषा में 'ACQUIRE' को कैसे कोडित किया जाएगा?", o: ["1615392","2614392","1634192","2634192"], e: "Per response sheet, option 1 (1615392)." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "उस विकल्प का चयन करें जो तीसरे पद से उसी प्रकार संबंधित है जैसे दूसरा पद पहले पद से संबंधित है।\n\nFRIEND : GSJFOE :: CLERICAL : ?", o: ["DMFTKDBM","DMFSJEBN","DMFSJBZM","DMFSJDBM"], e: "Each letter shifted +1: FRIEND → GSJFOE ✓. CLERICAL +1 → DMFSJDBM. Option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'CANDOLIM' को '311441512913' के रूप में कूटबद्ध किया जाता है। उस भाषा में 'AMRITSAR' को कैसे कूटबद्ध किया जाएगा?", o: ["1131892120119","1131992120119","1141892119118","1131892019118"], e: "Code = alphabet positions concatenated. CANDOLIM: 3,1,14,4,15,12,9,13 → 311441512913 ✓. AMRITSAR: 1,13,18,9,20,19,1,18 → 1131892019118. Option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'CISTERN' को 'SICGNRE' लिखा जाता है। उसी कूट भाषा में 'CLERGYS' को कैसे लिखा जाएगा?", o: ["ELCISYG","ELCKSYG","ECLRSYG","ELCRSGY"], e: "Per response sheet, option 1 (ELCISYG)." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए जो निम्नलिखित श्रेणी में प्रश्न-वाचक चिह्न (?) के स्थान पर आ सकती है।\n\n6, 6, 18, 90, 630, ?", o: ["8500","1260","5670","4250"], e: "Multipliers: ×1, ×3, ×5, ×7, ×9. 630 × 9 = 5670. Option 3." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'MASTER' को 'BFNSTU' लिखा जाता है। उसी कूट भाषा में 'COVERT' को कैसे लिखा जाएगा?", o: ["FLYBQY","FRBWOS","DFPSUW","FYLQBY"], e: "Sort word alphabetically then shift each letter +1. MASTER sorted = A,E,M,R,S,T → +1 = B,F,N,S,T,U ✓. COVERT sorted = C,E,O,R,T,V → +1 = D,F,P,S,U,W = DFPSUW. Option 3." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'WATER' को '4267229' के रूप में कोडित किया जाता है। उसी कूट भाषा में 'PURITY' को कैसे कोडित किया जाएगा?", o: ["11691872","11791972","10691873","12691882"], e: "Code = (27 − letter position) concatenated. WATER: W→4, A→26, T→7, E→22, R→9 → 4267229 ✓. PURITY: P→11, U→6, R→9, I→18, T→7, Y→2 → 11691872. Option 1." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nCost (someone) dearly", o: ["To bring one suffering","To desire something","To sell something precious","To be fond of someone"], e: "'Cost (someone) dearly' = bring suffering / serious loss. Option 1." },
  { s: ENG, q: "Select the most appropriate antonym of the given word.\n\nrepress", o: ["encourage","subdue","inhibit","crush"], e: "'Repress' = suppress / hold back. Antonym = encourage. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nto walk unsteadily as if about to fall", o: ["stroll","strut","stagger","stride"], e: "'Stagger' = walk unsteadily / sway. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in reported speech.\n\nPushpa said to me, \"I am leaving for Hyderabad.\"", o: ["Pushpa told me that she is leaving for Hyderabad.","Pushpa told me that she was leaving for Hyderabad.","Pushpa told me that I was leaving for Hyderabad.","Pushpa told me that I am leaving for Hyderabad."], e: "Direct → indirect: said to me → told me; I → she; am → was. Option 2." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nDetect", o: ["Ignore","Suspect","Invent","Discover"], e: "'Detect' = discover / find out. Option 4." },
  { s: ENG, q: "Select the most appropriate SYNONYM of the given word.\n\nDefer", o: ["Postpone","Continue","Advance","Hasten"], e: "'Defer' = put off / postpone. Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nCome to blows", o: ["Not accept any responsibility","Agree with someone","Enjoy the cool breeze","Start fighting after a disagreement"], e: "'Come to blows' = start fighting (physically) after a disagreement. Option 4." },
  { s: ENG, q: "Select the misspelt word.", o: ["scientist","manufacture","disposal","benifactor"], e: "'benifactor' is misspelled — correct is 'benefactor'. Option 4." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe sound made by sheep", o: ["Neigh","Grunt","Bleat","Moo"], e: "Sheep 'bleat'. (Neigh=horse, Grunt=pig, Moo=cow.) Option 3." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["kitchen","knives","knight","knowledg"], e: "'knowledg' is misspelled — correct is 'knowledge'. Option 4." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Gossip","Gourd","Governor","Gorgious"], e: "'Gorgious' is misspelled — correct is 'Gorgeous'. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nYou have finished reading this novel, ________?", o: ["haven't you","didn't you","have you","did you"], e: "Tag question for positive present perfect 'have finished' → negative tag 'haven't you'. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nExpedite", o: ["Hinder","Quicken","Promote","Assist"], e: "'Expedite' = speed up. Antonym = Hinder (slow down/obstruct). Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nMy friend hurt his knee during the football match.", o: ["The knee of my friend was hurt during the football match.","The knee of my friend has been hurt during the football match.","The knee of my friend had been hurt during the football match.","The knee of my friend is hurt during the football match."], e: "Past simple active → past simple passive: 'hurt' → 'was hurt'. Option 1." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nWhere are you coming ________?", o: ["from","by","on","for"], e: "'Coming from' — preposition of origin. Option 1." },
  { s: ENG, q: "Read the passage on the hare.\n\nWhy did the horse refuse to help the hare?", o: ["He had work to do for his master","He was afraid of the hounds","He would not be able to carry her","He had an appointment"], e: "Passage: horse 'had important work to do for his master'. Option 1." },
  { s: ENG, q: "Read the passage on the hare.\n\nWhat is the moral of the story?", o: ["Beware of fair weather friends.","Don't try to run before you can walk","Ignorance is bliss","Barking dogs seldom bite"], e: "The story shows 'friends' all making excuses when help was needed — classic 'fair weather friends' moral. Option 1." },
  { s: ENG, q: "Read the passage on the hare.\n\nWhich of these was NOT the reason why the hare believed her friends would help her?", o: ["she believed that's friends always helped","her friends were big and brave","her friends had promised to help","she was popular among all"], e: "The passage doesn't say friends had explicitly 'promised' to help — only that they 'claimed to be her friend'. Option 3." },
  { s: ENG, q: "Read the passage on the hare.\n\nWho could force back the hounds with his horns?", o: ["bull","goat","ram","calf"], e: "Passage: 'she then applied to the bull, and hoped that he would repel the hounds with his horns'. Option 1." },
  { s: ENG, q: "Read the passage on the hare.\n\n'take to her heels' means", o: ["hop on the heels","take others' help","hide somewhere","run away quickly"], e: "'Take to one's heels' = run away quickly. Option 4." },
  { s: ENG, q: "Read the passage on Aerobics.\n\nSelect the most appropriate option to fill in blank no. 1.\n\n'Aerobics is a system of exercise (1)________ stimulates the heart and lungs'", o: ["where","who","whom","which"], e: "Relative pronoun for a thing (system) → 'which'. Option 4." },
  { s: ENG, q: "Read the passage on Aerobics.\n\nSelect the most appropriate option to fill in blank no. 2.\n\n'stimulates the heart and lungs to (2)________ beneficial changes'", o: ["design","produce","assemble","discover"], e: "'Produce changes' is the natural collocation. Option 2." },
  { s: ENG, q: "Read the passage on Aerobics.\n\nSelect the most appropriate option to fill in blank no. 3.\n\n'These (3)________ strengthening of the muscles'", o: ["include","enter","insert","admit"], e: "'These include strengthening…' — list-introducing verb. Option 1." },
  { s: ENG, q: "Read the passage on Aerobics.\n\nSelect the most appropriate option to fill in blank no. 4.\n\n'(4)________ the rapid flow of air in and out of the lungs'", o: ["blocking","choking","stifling","aiding"], e: "Aerobics is positive — 'aiding' the rapid flow of air. Option 4." },
  { s: ENG, q: "Read the passage on Aerobics.\n\nSelect the most appropriate option to fill in blank no. 5.\n\n'a more (5)________ heart to pump more oxygen and blood'", o: ["skillful","efficient","adequate","trained"], e: "'More efficient heart' — standard collocation for cardio-pumping capacity. Option 2." },

  // ============ Quantitative Aptitude (51-75) — all image-based ============
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "मूगा सिल्क वर्म ________ के लिए स्थानिक है।", o: ["पश्चिम बंगाल","असम","नागालैंड","तमिलनाडु"], e: "Muga silk (Antheraea assamensis) is endemic to Assam — the only place in the world where it is produced. Option 2." },
  { s: GA, q: "निम्नलिखित में से कौन खेल में कश्मीर का पहला पद्म पुरस्कार विजेता है?", o: ["फैसल अली डार (Faisal Ali Dar)","मिथुन मन्हास (Mithun Manhas)","इकरा रसूल (Iqra Rasool)","चैन सिंह (Chain Singh)"], e: "Faisal Ali Dar received the Padma Shri in 2021 for sports (martial arts) — the first such recipient from Kashmir. Option 1." },
  { s: GA, q: "निम्नलिखित में से किसे अप्रैल 2021 में नेल्सन मंडेला विश्व मानवतावादी पुरस्कार 2021 प्रदान किया गया?", o: ["सुधा भट्टाचार्य","माना सिद्धा सहगल","अर्चना भट्टाचार्य","सुश्मिता मिश्रा"], e: "Per response sheet, option 2." },
  { s: GA, q: "निम्नलिखित में से कौन-सा एक प्राकृतिक पारिस्थितिकी तंत्र है?", o: ["फसल-क्षेत्र","बगीचा","वन","चिड़ियाघर"], e: "Forest (वन) is a natural ecosystem; the others are man-made. Option 3." },
  { s: GA, q: "निम्नलिखित में से किस शब्द का प्रयोग संग्रहित ऊर्जा के लिए किया जाता है जो एक प्रणाली के विभिन्न भागों की सापेक्ष स्थिति पर निर्भर करता है?", o: ["स्थितिज ऊर्जा (Potential energy)","ऊष्मीय ऊर्जा (Thermal)","यांत्रिक ऊर्जा (Mechanical)","गतिज ऊर्जा (Kinetic)"], e: "Potential energy (स्थितिज ऊर्जा) is the stored energy that depends on the relative positions of parts of a system. Option 1." },
  { s: GA, q: "भारत के किस पड़ोसी देश ने 'ग्रॉस नेशनल हैप्पीनेस (Gross National Happiness)' वाक्यांश गढ़ा था?", o: ["श्रीलंका","भूटान","नेपाल","बांग्लादेश"], e: "The term 'Gross National Happiness' was coined by Bhutan's King Jigme Singye Wangchuck in 1972. Option 2." },
  { s: GA, q: "निम्नलिखित में से किस नृत्य में नृत्य करते समय टांगें मुड़ी हुई होती हैं, जबकि पैर तालबद्ध होते हैं?", o: ["कथकली","कथक","मणिपुरी","भरतनाट्यम"], e: "Bharatanatyam features the half-sitting posture 'Aramandi' with bent knees, and intricate rhythmic footwork. Option 4." },
  { s: GA, q: "भगोड़ा आर्थिक अपराधी अधिनियम ________ वर्ष में पारित किया गया था।", o: ["2019","2016","2017","2018"], e: "The Fugitive Economic Offenders Act was passed in 2018. Option 4." },
  { s: GA, q: "भारत की 2011 की जनगणना के अनुसार, 2001 से 2011 के बीच निम्नलिखित में से किस राज्य की जनसंख्या में अधिकतम प्रतिशत वृद्धि हुई?", o: ["झारखंड","ओडिशा","छत्तीसगढ़","पश्चिम बंगाल"], e: "Census 2011 growth (2001-2011): Jharkhand 22.42%, Chhattisgarh 22.61%, Odisha 14.05%, WB 13.84%. Chhattisgarh highest. Option 3." },
  { s: GA, q: "अक्टूबर 2021 में, 'देश के मेंटर' नामक एक कार्यक्रम, जिसका उद्देश्य कक्षा IX से XII के छात्रों को स्वैच्छिक मार्गदर्शकों के साथ जोड़ना था, निम्नलिखित में से किस राज्य/केंद्र शासित प्रदेश द्वारा शुरू किया गया था?", o: ["आंध्र प्रदेश","पश्चिम बंगाल","उत्तर प्रदेश","दिल्ली"], e: "Delhi Government launched 'Desh ke Mentor' programme in October 2021. Option 4." },
  { s: GA, q: "एक प्रतिष्ठित नियमित पत्रिका 'तहज़ीब-उल-अख़लाक़ (Tahzibul Akhlaq)' की स्थापना ________ द्वारा की गई थी।", o: ["मौलाना अबुल कलाम आज़ाद","मौलाना मुहम्मद अली","सैयद अहमद खान","खान अब्दुल गफ़्फ़ार खान"], e: "Sir Syed Ahmed Khan founded Tahzib-ul-Akhlaq in 1870 as a vehicle for social reform among Indian Muslims. Option 3." },
  { s: GA, q: "भारतीय संविधान को कब अपनाया गया था?", o: ["22 जनवरी 1947","26 नवंबर 1949","26 जनवरी 1950","17 दिसंबर 1946"], e: "Indian Constitution was adopted on 26 November 1949 (came into force 26 January 1950). Option 2." },
  { s: GA, q: "निम्नलिखित में से किस फिल्म निर्माता ने फिल्म 'A Night of Knowing Nothing' के लिए 74वें कान फिल्म महोत्सव (2021) में सर्वश्रेष्ठ वृत्तचित्र का पुरस्कार जीता?", o: ["मुज़फ्फर अली","पायल कपाड़िया","कोमलाई अनवर","जी. अरविंदन"], e: "Payal Kapadia won the Golden Eye (Œil d'or) for Best Documentary at Cannes 2021 for 'A Night of Knowing Nothing'. Option 2." },
  { s: GA, q: "हाथीपांव रोग, जिसमें अंगों की चिरकारी शोथ होती है, निम्नलिखित में से किस कृमि के कारण होता है?", o: ["वुचेरेरिया (Wuchereria)","रिंगवर्म (Ringworm)","माइक्रोस्पोरम (Microsporum)","एस्केरिस (Ascaris)"], e: "Elephantiasis (lymphatic filariasis) is caused by parasitic worms of genus Wuchereria (W. bancrofti). Option 1." },
  { s: GA, q: "निम्नलिखित में से कौन-सा त्योहार आंध्र प्रदेश, तेलंगाना और कर्नाटक राज्यों में नए साल के दिन के रूप में मनाया जाता है?", o: ["दशहरा","बैसागू","ओणम","उगादी"], e: "Ugadi is the New Year festival in AP, Telangana, and Karnataka — falls on Chaitra Shukla Pratipada. Option 4." },
  { s: GA, q: "निम्नलिखित में से किस शहर में छोटा इमामबाड़ा स्थित है?", o: ["लखनऊ","कानपुर","अहमदाबाद","हैदराबाद"], e: "Chota Imambara (Imambara of Hussainabad) is in Lucknow, built by Muhammad Ali Shah in 1838. Option 1." },
  { s: GA, q: "पक्ष्माभी (Ciliate, या Ciliophoran) निम्नलिखित में से किस संघ के सदस्य हैं?", o: ["एकिनोडर्म","रोटीफर्स","सिपुंकुला","प्रोटोज़ोआ"], e: "Ciliates belong to the phylum Ciliophora, which is grouped under Protozoa. Option 4." },
  { s: GA, q: "Pride and Prejudice ________ द्वारा लिखित एक रोमांटिक उपन्यास है।", o: ["रोआल्ड डाल","अगाथा क्रिस्टी","जेन ऑस्टेन","जॉन मिल्टन"], e: "'Pride and Prejudice' (1813) was written by Jane Austen. Option 3." },
  { s: GA, q: "जैनियों के 24वें तीर्थंकर महावीर का जन्म ________ में हुआ था।", o: ["राजस्थान","बिहार","अरुणाचल प्रदेश","सिक्किम"], e: "Mahavir was born in Kundgram (Vaishali), present-day Bihar. Option 2." },
  { s: GA, q: "मानसरोवर झील, निम्नलिखित में से कौन-सी नदी का उद्गम स्थल नहीं है?", o: ["ब्रह्मपुत्र","चिनाब","सिंधु","सतलुज"], e: "Mansarovar/Manas area is source of Brahmaputra, Indus, Sutlej, and Karnali. Chenab originates in Himachal (confluence of Chandra & Bhaga). Option 2." },
  { s: GA, q: "जनवरी 2022 में, केंद्रीय शिक्षा मंत्री धर्मेंद्र प्रधान ने ________ दिन पढ़ने का अभियान 'पढ़े भारत' शुरू किया था।", o: ["180","90","30","100"], e: "Education Minister Dharmendra Pradhan launched the 100-day reading campaign 'Padhe Bharat' on 1 Jan 2022. Option 4." },
  { s: GA, q: "फरवरी 2022 में भारत ने राजनयिक स्तर पर किस खेल आयोजन का बहिष्कार करने की घोषणा की, हालांकि वह इस आयोजन के लिए एक एथलीट भेजेगा?", o: ["बीजिंग पैरालंपिक खेल 2022","कतर में फीफा विश्व कप 2022","बीजिंग शीतकालीन ओलंपिक 2022","इंग्लैंड में राष्ट्रमंडल खेल 2022"], e: "India announced a diplomatic boycott of the Beijing Winter Olympics 2022 in February 2022, though it sent its lone athlete (Arif Khan) to compete. Option 3." },
  { s: GA, q: "ब्रिटिश भारत के किस गवर्नर जनरल ने अवध राज्य को \"एक चेरी जो एक दिन हमारे मुँह में गिर जाएगी\" के रूप में वर्णित किया था?", o: ["लॉर्ड डलहौज़ी","चार्ल्स कैनिंग","लॉर्ड विलियम बेंटिक","चार्ल्स मेटकॉफ"], e: "Lord Dalhousie famously described Awadh as 'a cherry that will drop into our mouths one day' before annexing it via the Doctrine of Lapse (1856). Option 1." },
  { s: GA, q: "भारत के संविधान का निम्नलिखित में से कौन सा अनुच्छेद उन कुछ लोगों के नागरिकता अधिकारों से संबंधित है जो पाकिस्तान से पलायन कर भारत आए हैं?", o: ["अनुच्छेद 6","अनुच्छेद 9","अनुच्छेद 7","अनुच्छेद 8"], e: "Article 6 deals with rights of citizenship of certain persons who migrated to India from Pakistan. Option 1." },
  { s: GA, q: "निम्नलिखित में से कौन-सा मुगल सम्राट तंबाकू की लत से इतना अधिक चिंतित था कि उसने इस पर प्रतिबंध लगा दिया?", o: ["जहांगीर","अकबर","शाहजहाँ","औरंगज़ेब"], e: "Emperor Jahangir banned tobacco in 1617 due to concerns over its addiction. Option 1." }
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
          if (!imgInfo.opts[oi]) { optionImages[oi] = ''; continue; }
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

  const TEST_TITLE = 'SSC Selection Post Phase IX (Matriculation) - 15 February 2022 Shift-1';
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
