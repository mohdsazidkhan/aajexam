/**
 * Seed: SSC Selection Post Phase IX 2021 (Matriculation Level) PYQ - 9 February 2022, Shift-1 (100 questions)
 * Source: SSC official response sheet (PDF + docx). Hindi recovered via docx-XML parse.
 * All image questions (REA Q10, Q16, Q19 + all QA Q1-Q25) sourced directly from docx-embedded media.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-9feb2022-s1.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_feb09_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-9feb2022-s1';

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

const F = '09-feb-2022-s1';

const IMAGE_MAP = {
  // REA image questions
  10: { q: 'image4.jpeg',  opts: ['image5.png','image6.png','image7.png','image8.png'] },
  16: { q: 'image9.jpeg',  opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] },
  19: { q: 'image14.jpeg', opts: ['image15.jpeg','image16.jpeg','image17.jpeg','image18.jpeg'] },

  // QA Q51-Q75 — all image-based
  51: { q: 'image19.jpeg', opts: ['image20.jpeg','image21.jpeg','image22.jpeg','image23.jpeg'] },
  52: { q: 'image24.jpeg', opts: ['image25.jpeg','image26.jpeg','image27.jpeg','image28.jpeg'] },
  53: { q: 'image29.jpeg', opts: ['image30.jpeg','image31.png','image32.jpeg','image33.png'] },
  54: { q: 'image34.jpeg', opts: ['image35.jpeg','image36.jpeg','image37.jpeg','image38.jpeg'] },
  55: { q: 'image39.jpeg', opts: ['image40.png','image41.png','image42.png','image43.png'] },
  56: { q: 'image44.jpeg', opts: ['image45.jpeg','image46.jpeg','image47.jpeg','image48.jpeg'] },
  57: { q: 'image49.jpeg', opts: ['image50.jpeg','image51.png','image52.jpeg','image53.jpeg'] },
  58: { q: 'image54.jpeg', opts: ['image55.jpeg','image56.jpeg','image57.jpeg','image58.jpeg'] },
  59: { q: 'image59.jpeg', opts: ['image60.jpeg','image61.jpeg','image62.jpeg','image63.jpeg'] },
  60: { q: 'image64.jpeg', opts: ['image65.jpeg','image66.jpeg','image67.jpeg','image68.jpeg'] },
  61: { q: 'image69.jpeg', opts: ['image70.jpeg','image71.jpeg','image72.jpeg','image73.jpeg'] },
  62: { q: 'image74.jpeg', opts: ['image75.jpeg','image76.jpeg','image77.jpeg','image78.jpeg'] },
  63: { q: 'image79.jpeg', opts: ['image80.jpeg','image81.jpeg','image82.jpeg','image83.jpeg'] },
  64: { q: 'image84.jpeg', opts: ['image85.jpeg','image86.jpeg','image87.jpeg','image88.jpeg'] },
  65: { q: 'image89.jpeg', opts: ['image90.jpeg','image91.jpeg','image92.jpeg','image93.jpeg'] },
  66: { q: 'image94.jpeg', opts: ['image95.jpeg','image96.jpeg','image97.jpeg','image98.jpeg'] },
  67: { q: 'image99.jpeg', opts: ['image100.png','image101.png','image102.png','image103.png'] },
  68: { q: 'image104.jpeg', opts: ['image105.jpeg','image106.jpeg','image107.jpeg','image108.jpeg'] },
  69: { q: 'image109.jpeg', opts: ['image110.jpeg','image111.jpeg','image112.jpeg','image113.jpeg'] },
  70: { q: 'image114.jpeg', opts: ['image115.png','image116.png','image117.png','image118.png'] },
  71: { q: 'image119.jpeg', opts: ['image120.png','image121.png','image116.png','image122.png'] },
  72: { q: 'image123.jpeg', opts: ['image124.jpeg','image125.jpeg','image126.jpeg','image127.jpeg'] },
  73: { q: 'image128.jpeg', opts: ['image129.jpeg','image130.jpeg','image131.jpeg','image127.jpeg'] },
  74: { q: 'image132.jpeg', opts: ['image133.jpeg','image134.jpeg','image135.jpeg','image136.jpeg'] },
  75: { q: 'image137.jpeg', opts: ['image138.jpeg','image139.jpeg','image140.jpeg','image141.jpeg'] }
};

// 1-based answer key.
const KEY = [
  // 1-25 General Intelligence
  2, 1, 4, 4, 1,   4, 3, 2, 4, 4,   3, 4, 1, 3, 4,   3, 2, 1, 1, 2,   1, 4, 1, 3, 1,
  // 26-50 English Language
  2, 1, 4, 4, 1,   2, 2, 3, 3, 2,   3, 1, 2, 1, 1,   3, 1, 3, 1, 2,   1, 2, 2, 1, 3,
  // 51-75 Quantitative Aptitude — image-based
  2, 4, 1, 4, 3,   1, 4, 4, 2, 2,   2, 3, 2, 4, 2,   2, 2, 2, 4, 3,   2, 2, 1, 2, 3,
  // 76-100 General Awareness
  2, 3, 2, 4, 1,   2, 4, 2, 4, 2,   4, 1, 3, 2, 3,   1, 4, 4, 4, 2,   1, 2, 3, 3, 2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "एक निश्चित कूट भाषा में, 'PARK' को '3749' के रूप में कूटबद्ध किया जाता है, और 'RACE' को '4762' के रूप में कूटबद्ध किया जाता है। उसी भाषा में 'CARE' को कैसे कूटबद्ध किया जाएगा?", o: ["6724","6742","7642","7624"], e: "P=3, A=7, R=4, K=9, C=6, E=2. CARE = C-A-R-E = 6-7-4-2 = 6742. Option 2." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'BHOPAL' को 'OBHLPA' लिखा जाता है, और 'KANPUR' को 'NKARPU' लिखा जाता है। उसी कूट भाषा में 'INDORE' को किस प्रकार लिखा जाएगा?", o: ["DINEOR","DNIORE","NIDROE","ERINDO"], e: "Pattern: 3rd+1st+2nd+6th+4th+5th. BHOPAL→O,B,H,L,P,A=OBHLPA ✓. INDORE→D,I,N,E,O,R = DINEOR. Option 1." },
  { s: REA, q: "अक्षरों के उस संयोजन का चयन करें जो दी गई श्रृंखला के रिक्त स्थानों में क्रमिक रूप से रखे जाने पर श्रृंखला को पूर्ण करेगा।\n\nu _ a _ c _ k _ b a _ c c _ u _ a a _ c k", o: ["b a c k a k b c","b a c u a k a k","b a u u a k b c","b a c u a k b c"], e: "Per response sheet, option 4 (b a c u a k b c)." },
  { s: REA, q: "दिए गए समीकरण को संतुलित करने के लिए किन दो चिह्नों को आपस में बदला जाना चाहिए?\n\n306 ÷ 17 + 4 − 50 × 8 = 30", o: ["÷ और ×","+ और −","× और −","+ और ×"], e: "Swap '+' and '×': 306 ÷ 17 × 4 − 50 + 8 = 18 × 4 − 50 + 8 = 72 − 50 + 8 = 30 ✓. Option 4." },
  { s: REA, q: "चेतना, विलास के बेटे की बेटी है। सुहास, राज का बेटा है। कपिला, विलास की पत्नी है। चेतना, सुहास की बहन है। प्रज्ञा, चेतना की माँ है। कपिला का राज से क्या संबंध है?", o: ["माँ","बहन","चाची","पत्नी"], e: "Suhas & Chetna are siblings; Raj is their father; Prajna is their mother. Chetna is daughter of Vilas's son → Vilas's son = Raj. Kapila is Vilas's wife = Raj's mother. Option 1." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए, जो निम्नलिखित श्रेणी में चिह्न (?) के स्थान पर आ सकती है।\n\n248, 257, 250, 259, 252, ?", o: ["258","272","268","261"], e: "Pattern: +9, −7, +9, −7, +9. 252 + 9 = 261. Option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'you can go' को 'sat nat pat' के रूप में लिखा जाता है, 'they can join' को 'pat gat zat' के रूप में लिखा जाता है, और 'they are ready' को 'dat zat yat' के रूप में लिखा जाता है। उसी भाषा में 'join' को किस रूप में लिखा जाएगा?", o: ["pat","dat","gat","zat"], e: "'can' (sets 1&2 common) = pat. 'they' (sets 2&3 common) = zat. Set 2 remaining: 'join' = gat. Option 3." },
  { s: REA, q: "'सहायता' का 'मदद' से वही संबंध है, जो 'अपशिष्ट' का '________' से है।", o: ["कंप्यूटर","कचरा","शुद्धता","मैमोरी"], e: "सहायता:मदद = synonyms. अपशिष्ट (waste) → synonym = कचरा. Option 2." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन करें जो निम्नलिखित श्रेणी में प्रश्न-वाचक चिह्न (?) के स्थान पर आ सकती है।\n\n1, 5, 10, 23, 63, 167, ?", o: ["862","826","369","396"], e: "Differences: 4, 5, 13, 40, 104. Second differences = 1, 8, 27, 64 = 1³, 2³, 3³, 4³. Next 2nd diff = 5³ = 125. Next 1st diff = 104 + 125 = 229. 167 + 229 = 396. Option 4." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'FROG' को 92 और 'DUCK' को 78 लिखा जाता है। उसी कूट भाषा में 'BEAR' को किस प्रकार लिखा जाएगा?", o: ["82","78","52","64"], e: "Code = sum of alphabet positions × 2. F+R+O+G = 6+18+15+7 = 46; 46×2 = 92 ✓. D+U+C+K = 4+21+3+11 = 39; 39×2 = 78 ✓. B+E+A+R = 2+5+1+18 = 26; 26×2 = 52. Option 3." },
  { s: REA, q: "उस सही विकल्प का चयन कीजिए, जो दिए गए शब्दों के उस क्रम को दर्शाता है, जिस क्रम में वे अंग्रेज़ी शब्दकोश में मौजूद होते हैं।\n\n1. REPRESSIVE  2. REPROACH  3. REPRIMAND  4. REPRISAL  5. REPRIEVE", o: ["2, 5, 1, 4, 3","2, 5, 1, 3, 4","3, 5, 1, 4, 2","1, 5, 3, 4, 2"], e: "Dictionary order: REPRESSIVE(1) < REPRIEVE(5) < REPRIMAND(3) < REPRISAL(4) < REPROACH(2) → 1,5,3,4,2. Option 4." },
  { s: REA, q: "छ: बच्चे G, H, I, J, K और L एक वृत्त के परितः केंद्र के विपरीत दिशा में मुख करके बैठे हैं। G, K के बाईं ओर दूसरे स्थान पर बैठा है। H, G के दाईं ओर निकटतम स्थान पर बैठा है और J के बाईं ओर तीसरे स्थान पर बैठा है। I, J के बाईं ओर निकटतम स्थान पर बैठा है।\n\nG के बाईं ओर निकटतम स्थान पर कौन बैठा है?", o: ["L","I","J","K"], e: "Facing outward: left=anticlockwise, right=clockwise. Place K at 1, G at 5 (2nd left of K), H at 6 (right of G), J at 3 (since H is 3rd left of J), I at 2 (left of J). L fills position 4. G's immediate left = position 4 = L. Option 1." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'Z' को 261 लिखा जाता है, 'R' को 189 लिखा जाता है और 'J' को 1017 लिखा जाता है। उसी कूट भाषा में 'P' को किस प्रकार लिखा जाएगा?", o: ["1512","1607","1611","1119"], e: "Code = position concatenated with (27 − position). Z(26): 26||1 = 261 ✓. R(18): 18||9 = 189 ✓. J(10): 10||17 = 1017 ✓. P(16): 16||11 = 1611. Option 3." },
  { s: REA, q: "उस विकल्प का चयन करें जो तीसरे पद से उसी प्रकार संबंधित है जिस प्रकार दूसरा पद पहले पद से संबंधित है।\n\nTRACK : MFFYE :: GLOBE : ?", o: ["GDTRQ","GTDQR","GTERS","GETSR"], e: "Reverse word and add prime sequence (2,3,5,7,11). KCART + (2,3,5,7,11) → M,F,F,Y,E = MFFYE ✓. GLOBE reversed = EBOLG + (2,3,5,7,11) → G,E,T,S,R = GETSR. Option 4." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए। (Mirror image / pattern)", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "पांच व्यक्ति - हृतिक, अमन, विजय, पीयूष और नितिन एक वृत्ताकार मेज के परितः केंद्र के विपरीत दिशा की ओर मुख करके बैठे हैं। पीयूष, हृतिक के बाईं ओर ठीक बगल में बैठा है। विजय और अमन, हृतिक के ठीक बगल में नहीं बैठे हैं। अमन, विजय के दाईं ओर ठीक बगल में बैठा है।\n\nनितिन के दाईं ओर ठीक बगल में कौन बैठा है?", o: ["हृतिक","विजय","पीयूष","अमन"], e: "Place Hritik at 1. Piyush at 5 (immediate left). Vijay & Aman not adjacent to Hritik → V,A occupy positions 3 & 4. Aman = Vijay+1 → Vijay=3, Aman=4. Nitin at 2. Nitin's right (clockwise) = position 3 = Vijay. Option 2." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'FLOWER' को '166' के रूप में कूटबद्ध किया जाता है, और 'SHIFT' को '73' के रूप में कूटबद्ध किया जाता है। उसी भाषा में 'VOLUME' को कैसे कूटबद्ध किया जाएगा?", o: ["222","184","212","148"], e: "Code = sum of (27 − position) × number of vowels. SHIFT (1 vowel I): 73×1 = 73 ✓. FLOWER (2 vowels O,E): 83×2 = 166 ✓. VOLUME (3 vowels O,U,E): (5+12+15+6+14+22)×3 = 74×3 = 222. Option 1." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 1 as best guess." },
  { s: REA, q: "दिए गए विकल्पों में से उस अक्षर-समूह का चयन करें, जो निम्नलिखित श्रृंखला में चिह्न (?) के स्थान पर आ सकता है।\n\nILP, KHV, MDB, OZH, ?", o: ["RVN","QVN","RWM","QWM"], e: "1st letter: +2 (I→K→M→O→Q). 2nd: −4 (L→H→D→Z→V). 3rd: +6 (P→V→B→H→N). Next = QVN. Option 2." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़ें।\n\nकथन:\nकोई भी रेलगाड़ी, कार नहीं है। कोई भी ऑटो, रेलगाड़ी नहीं है।\n\nनिष्कर्ष:\nI. कोई भी कार, ऑटो नहीं है।\nII. सभी ऑटो, कार हैं।", o: ["न तो निष्कर्ष I और न ही II अनुसरण करता है।","केवल निष्कर्ष I अनुसरण करता है।","केवल निष्कर्ष II अनुसरण करता है।","या तो निष्कर्ष I या निष्कर्ष II अनुसरण करता है।"], e: "Both premises are 'no X is Y' types — no direct relationship between car and auto can be derived. Neither I nor II follows. Option 1." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़ें।\n\nकथन:\nसभी फ़ुटबॉल, हॉकी स्टिक हैं। सभी हॉकी स्टिक, स्टंप हैं। कोई भी स्टंप, रंग नहीं है।\n\nनिष्कर्ष:\nI. कुछ स्टंप, फ़ुटबॉल हैं।\nII. कोई भी हॉकी स्टिक, रंग नहीं है।\nIII. कुछ फ़ुटबॉल, रंग हैं।", o: ["सभी निष्कर्ष I, II और III अनुसरण करते हैं।","केवल निष्कर्ष I और III अनुसरण करते हैं।","केवल निष्कर्ष II और III अनुसरण करते हैं।","केवल निष्कर्ष I और II अनुसरण करते हैं।"], e: "Football ⊆ Hockey stick ⊆ Stump; no stump is colour. I: some stumps are football ✓. II: no hockey stick is colour ✓ (subset of stumps). III: footballs are stumps, no stump is colour → no football is colour, III ✗. I & II follow. Option 4." },
  { s: REA, q: "उस विकल्प का चयन करें जो तीसरी संख्या से उसी प्रकार संबंधित है जिस प्रकार दूसरी संख्या पहली संख्या से संबंधित है और छठी संख्या पाँचवीं संख्या से संबंधित है।\n\n17 : 255 :: 21 : ? :: 24 : 528", o: ["399","419","499","319"], e: "Pattern: n × (n − 2). 17×15 = 255 ✓. 24×22 = 528 ✓. 21×19 = 399. Option 1." },
  { s: REA, q: "चार अक्षर-समूह दिए गए हैं, जिनमें से तीन किसी तरह से संगत हैं और एक असंगत है। उस अक्षर-समूह का चयन करें, जो अन्य से असंगत है।", o: ["LQX","HMT","DKP","BGN"], e: "L→Q→X: +5,+7. H→M→T: +5,+7. B→G→N: +5,+7. D→K→P: +7,+5 (reverse). DKP is odd. Option 3." },
  { s: REA, q: "L, M का पिता है। K, L से विवाहित है। R, K की बहन है। D, N का पुत्र है। K, N की सास है। L का केवल एक पुत्र है और कोई पुत्री नहीं है। R, P से विवाहित है। S, P की पुत्री है। D का L से क्या संबंध है?", o: ["पोता","चाचा","भतीजा","पुत्र"], e: "L & K married, M is their only son. K is N's mother-in-law → N is married to M. D is N's son = M's son = L's grandson (पोता). Option 1." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nEliminate", o: ["Exclude","Add","Cancel","Ignore"], e: "'Eliminate' (remove) — antonym 'Add'. Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nShe said to me, \"I am busy today.\"", o: ["She told me that she was busy that day.","She said me that she was busy that day.","She said to me that she was busy today.","She told me that I am busy today."], e: "Direct → indirect: said to me → told me; I → she; am → was; today → that day. Option 1." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nCamouflage", o: ["Reveal","Open","Show","Mask"], e: "'Camouflage' = disguise / mask. Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nObstruct", o: ["Block","Hinder","Curb","Allow"], e: "'Obstruct' (block / hinder) — antonym 'Allow'. Option 4." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["Voilence","Secretion","Yield","Fiend"], e: "'Voilence' is misspelled — correct is 'Violence'. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA room where food, crockery and cutlery are kept.", o: ["Bakery","Pantry","Gallery","Dispensary"], e: "'Pantry' = room for storing food, crockery, and cutlery. Option 2." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nHave your back against the wall", o: ["To be humiliated and bullied by a superior at work","To be in a desperate situation with very few options","To have a strong group of people supporting you","To be able to successfully tackle a difficult task"], e: "'Back against the wall' = in a desperate situation with few options. Option 2." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nLure", o: ["Reject","Free","Attract","Push"], e: "'Lure' = entice / attract. Option 3." },
  { s: ENG, q: "Select the correct passive form of the given sentence.\n\nYou can see several neem trees along the road to Connaught place.", o: ["Many are seeing several neem trees along the road to Connaught Place.","Neem trees had been seen along the road to Connaught Place.","Several neem trees can be seen along the road to Connaught Place.","Several neem trees were to be seen along the road to Connaught Place."], e: "Modal 'can' + see (active) → 'can be seen' (passive). Option 3." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["production","adrese","primate","technology"], e: "'adrese' is misspelled — correct is 'address'. Option 2." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Glacier","Glitter","Gingar","Girdle"], e: "'Gingar' is misspelled — correct is 'Ginger'. Option 3." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA person who studies the Earth and the materials of which it is made.", o: ["Geologist","Biologist","Anthropologist","Zoologist"], e: "'Geologist' studies Earth and its materials. Option 1." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nI ________ out of the bed when I heard a noise in the room.", o: ["took","sprang","rose","skipped"], e: "Sudden startled action triggered by noise — 'sprang out of bed' is the natural collocation. Option 2." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nThe new school is really wonderful as it is activity-based and believes in ________ learning.", o: ["experiential","ministerial","superficial","theoretical"], e: "Activity-based learning = experiential learning (learning through experience). Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nSpill the beans", o: ["To give away a secret","To postpone a plan","To spoil something","To not save anything"], e: "'Spill the beans' = reveal / give away a secret. Option 1." },
  { s: ENG, q: "Read the passage about the film industry and television.\n\nSelect the word from the passage which means the same as 'Crucial'.", o: ["Glorious","Immense","Indispensable","Delightful"], e: "Passage uses 'indispensable' for TV programs in West. Indispensable = crucial / essential. Option 3." },
  { s: ENG, q: "Read the passage about the film industry and television.\n\nThrough the medium of films:", o: ["harmony in international relations can be achieved","lack of cooperation is encouraged","ties of love and brotherhood can be severed","distrust between nations is strengthened"], e: "Passage: 'cultural contacts ... bring harmony in international relations have been established through the medium of films'. Option 1." },
  { s: ENG, q: "Read the passage about the film industry and television.\n\nAccording to the passage, what is the prime reason for the popularity of the television?", o: ["Interesting programmes","Achievements of the present age","Easy availability and access","Sustained entertainment"], e: "Passage: 'because of its ready availability and nearness to entertainment seekers, is becoming very popular'. Option 3." },
  { s: ENG, q: "Read the passage about the film industry and television.\n\nWhich of the following statements is NOT true?", o: ["Television is likely to replace cinema in view of its increasing popularity.","Films provide an opportunity to understand the beliefs and customs.","Film festivals help in bringing nations closer to each other.","Artists from the film world visit foreign lands to showcase their cultural heritage."], e: "Passage says TV 'may not succeed in replacing it [cinema]' — so option 1 contradicts the passage. Option 1." },
  { s: ENG, q: "Read the passage about the film industry and television.\n\nWhich of the following does NOT make the cinema more attractive than the television?", o: ["Background effects","Large audiences","Colour techniques","Scenic beauty"], e: "Passage lists scenic beauty, background effects, colour techniques as cinema's attractions. 'Large audiences' is NOT mentioned. Option 2." },
  { s: ENG, q: "Read the Nike passage.\n\nSelect the most appropriate option to fill in blank No. 1.\n\n'…help them de-stress (1)________ worries over the COVID-19 pandemic.'", o: ["from","about","of","with"], e: "'De-stress FROM worries' — most natural preposition. Option 1." },
  { s: ENG, q: "Read the Nike passage.\n\nSelect the most appropriate option to fill in blank No. 2.\n\n'The sportswear giant (2)________ its offices so workers could enjoy additional time off…'", o: ["closing","closed","closes","close"], e: "Past simple narrative — 'closed'. Option 2." },
  { s: ENG, q: "Read the Nike passage.\n\nSelect the most appropriate option to fill in blank No. 3.\n\n'enjoy additional time off (3)________ and recover'", o: ["rested","to rest","rest","to resting"], e: "Infinitive of purpose: 'time off TO REST and recover'. Option 2." },
  { s: ENG, q: "Read the Nike passage.\n\nSelect the most appropriate option to fill in blank No. 4.\n\n'A senior manager at Nike (4)________, \"Our senior leaders…\"'", o: ["said","told","spoke","talked"], e: "Reporting verb before a direct quote: 'said'. Option 1." },
  { s: ENG, q: "Read the Nike passage.\n\nSelect the most appropriate option to fill in blank No. 5.\n\n'spend (5)________ with your loved ones'", o: ["hours","money","time","days"], e: "'Spend time with loved ones' — standard collocation. Option 3." },

  // ============ Quantitative Aptitude (51-75) — all image-based ============
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "निम्नलिखित में से कौन 'इंडिया ग्रोज एट नाइट (India Grows at Night)' के लेखक हैं?", o: ["शशि थरूर","गुरचरण दास","जवाहरलाल नेहरू","पी.वी. नरसिम्हा राव"], e: "'India Grows at Night: A Liberal Case for a Strong State' (2012) is by Gurcharan Das. Option 2." },
  { s: GA, q: "सितंबर 2021 में, निम्न में से किसे उत्तराखंड का राज्यपाल नियुक्त किया गया था?", o: ["बेबी रानी मौर्य","जगदीश मुखी","गुरमीत सिंह","आर.एन. रवि"], e: "Lt Gen (retd.) Gurmeet Singh was appointed Governor of Uttarakhand on 15 September 2021. Option 3." },
  { s: GA, q: "अगस्त 2021 में, निम्न में से किसे कैशिफाई के पहले ब्रांड एंबेसडर के रूप में नियुक्त किया गया था?", o: ["सलमान खान","राजकुमार राव","अक्षय कुमार","सोनू सूद"], e: "Cashify (electronics resale platform) appointed Rajkummar Rao as its first brand ambassador in August 2021. Option 2." },
  { s: GA, q: "999 CE में, शिव को समर्पित कंदरिया महादेव मंदिर का निर्माण ________ वंश के राजा धंगदेव द्वारा कराया गया था।", o: ["पश्चिमी गंग","चोल","पूर्वी गंग","चंदेल"], e: "Kandariya Mahadev Temple in Khajuraho was built (c. 999-1002 CE) by Raja Dhangadeva of the Chandela dynasty. Option 4." },
  { s: GA, q: "मान लीजिए कि आप हर महीने के पहले दिन ₹100 कमाते हैं और इस बैलेंस को महीने के बाकी दिनों में समान रूप से कम करते हैं, तो महीने के प्रारंभ और अंत में आपका नकदी बैलेंस (₹ में) होता है।", o: ["100 और 0","0 और 100","50 और 0","50 और 50"], e: "Earn ₹100 on day 1 (start = 100), spend equally over rest of month → ends at 0. Option 1." },
  { s: GA, q: "ऊर्जा की विमा को द्रव्यमान से विभाजित करने पर प्राप्त राशि का वर्गमूल ________ के बराबर होता है।", o: ["त्वरण","वेग","विस्थापन","समय"], e: "[Energy]/[Mass] = (ML²T⁻²)/M = L²T⁻². √(L²T⁻²) = LT⁻¹ = velocity (वेग). Option 2." },
  { s: GA, q: "नारियल किस राजनीतिक दल का आरक्षित चिह्न है?", o: ["तेलुगु देशम","नागा पीपल्स फ्रंट","ऑल इंडिया फॉरवर्ड ब्लॉक","गोवा फॉरवर्ड पार्टी"], e: "Coconut is the reserved election symbol of Goa Forward Party. Option 4." },
  { s: GA, q: "निम्न में से कौन सी असम की सबसे बड़ी मीठे पानी की एक झील होने के साथ-साथ महत्वपूर्ण पक्षी क्षेत्र होने के अलावा राज्य का एकमात्र रामसर स्थल है?", o: ["लोकटाक झील","दीपोर बील","उमियम झील","वाडकी झील"], e: "Deepor Beel — Assam's largest freshwater lake and the state's only Ramsar site (declared 2002). Loktak Lake is in Manipur. Option 2." },
  { s: GA, q: "निम्नलिखित में से किस मंत्री ने खेलो इंडिया योजना की पहली महापरिषद की बैठक की अध्यक्षता की?", o: ["केंद्रीय वाणिज्य मंत्री","केंद्रीय शिक्षा मंत्री","केंद्रीय रक्षा मंत्री","केंद्रीय खेल मंत्री"], e: "The Khelo India scheme falls under the Ministry of Youth Affairs & Sports; its General Council is chaired by the Union Sports Minister. Option 4." },
  { s: GA, q: "निम्न में से कौन सा स्मारक फतेहपुर-सीकरी में स्थित नहीं है?", o: ["जोधा बाई का महल","गरीब नवाज दरगाह","पंचमहल","बुलंद दरवाजा"], e: "Fatehpur Sikri has Jodha Bai's palace, Panch Mahal, Buland Darwaza, and Salim Chishti's Dargah. Gharib Nawaz (Moinuddin Chishti) Dargah is in Ajmer. Option 2." },
  { s: GA, q: "छत्तीसगढ़ का उच्च न्यायालय कहां स्थित है?", o: ["रायपुर","रायगढ़","भिलाई","बिलासपुर"], e: "Chhattisgarh High Court is at Bilaspur (commenced 1 Nov 2000). Option 4." },
  { s: GA, q: "रवींद्रनाथ टैगोर बीच किस शहर में स्थित है?", o: ["कारवार","मुंबई","तूतीकोरिन","पारादीप"], e: "Rabindranath Tagore Beach (Karwar Beach) is in Karwar, Karnataka, where Tagore wrote 'Sea Shore'. Option 1." },
  { s: GA, q: "बौद्ध धर्म के संदर्भ में, 'महायान' का अर्थ है।", o: ["महान विजय","महान बलिदान","महान वाहन","महान युद्ध"], e: "'Mahayana' literally means 'Great Vehicle' (Maha = great, yana = vehicle). Option 3." },
  { s: GA, q: "श्रीकालहस्ती मंदिर, ________ राज्य में स्थित है।", o: ["कर्नाटक","आंध्र प्रदेश","तेलंगाना","तमिलनाडु"], e: "Srikalahasti Temple (one of the Pancha Bhuta Sthalas, representing wind) is in Chittoor district, Andhra Pradesh. Option 2." },
  { s: GA, q: "चिनाब नदी का ऋग्वैदिक नाम ________ था।", o: ["वितस्ता","सिंधु","अस्किनी","परुष्णी"], e: "Rig Vedic names: Vitasta = Jhelum, Sindhu = Indus, Asikni = Chenab, Parushni = Ravi, Shutudri = Sutlej, Vipasa = Beas. So Chenab = Asikni. Option 3." },
  { s: GA, q: "क्रेफिश (Crayfish) और किलनी (ticks) को क्रमशः ________ में वर्गीकृत किया गया है।", o: ["क्रस्टेशियन और अरैक्निडा (Crustacean and Arachnida)","क्रस्टेशियन और कीट (Crustacean and Insecta)","अरैक्निडा और मायरीयापोडा (Arachnida and Myriapoda)","मायरीयापोडा और कीट (Myriapoda and Insecta)"], e: "Crayfish = Crustacea (decapods). Ticks = Arachnida. Option 1." },
  { s: GA, q: "मार्च-अप्रैल 2021 के दौरान, पश्चिम बंगाल विधानसभा चुनावों में टी.एम.सी. (तृणमूल कांग्रेस) के बाद निम्न में से किस राजनीतिक दल ने सर्वाधिक मत प्राप्त किए थे?", o: ["CPM","CPI","INC","BJP"], e: "WB 2021 results: TMC 213 seats (~48% vote), BJP 77 seats (~38% vote) — clear runner-up. Option 4." },
  { s: GA, q: "भारत के आयकर विभाग द्वारा जारी किए गए पैन (PAN) कार्ड में कितने वर्णों/संख्याओं का अल्फान्यूमेरिक कोड होता है?", o: ["8","9","12","10"], e: "PAN is a 10-character alphanumeric identifier (5 letters + 4 digits + 1 letter). Option 4." },
  { s: GA, q: "आउटडोर पोलो टीम में ________ खिलाड़ी होते हैं।", o: ["13","9","8","4"], e: "Outdoor polo: 4 players per side (positions 1, 2, 3, and 4/Back). Option 4." },
  { s: GA, q: "प्राकृतिक भूकंप ज़्यादातर ________ में होते हैं।", o: ["आयनमंडल","स्थलमंडल","जलमंडल","क्षोभमंडल"], e: "Natural earthquakes originate within the lithosphere (Earth's solid outer layer). Option 2." },
  { s: GA, q: "पादपों में श्वसन क्रिया के दौरान, निम्न में से कौन सा उत्पाद के रूप में मुक्त नहीं होता है?", o: ["ऑक्सीजन","कार्बन डाइऑक्साइड","ऊर्जा","जल"], e: "Respiration: C₆H₁₂O₆ + O₂ → CO₂ + H₂O + energy. Oxygen is CONSUMED, not released. Option 1." },
  { s: GA, q: "2021 में, निम्न में से किस संस्थान ने डिजिटल रूपांतरण केंद्र के लिए बैंक ऑफ अमेरिका के साथ साझेदारी की है?", o: ["आईआईएम (IIM) दिल्ली","आईआईएम (IIM) अहमदाबाद","आईआईएम (IIM) इंदौर","आईआईएम (IIM) लखनऊ"], e: "Bank of America partnered with IIM Ahmedabad to set up a Digital Transformation Center (2021). Option 2." },
  { s: GA, q: "दोआब में खेती में सुधार लाने के लिए, मुहम्मद बिन तुग़लक़ ने एक पृथक कृषि विभाग की स्थापना की थी, इसे किस नाम से जाना जाता था?", o: ["दीवान-ए-इस्तियाक़","दीवान-ए-अर्ज़","दीवान-ए-अमीर-कोही","दीवान-ए-मुस्तख़राज"], e: "Muhammad bin Tughlaq set up Diwan-i-Amir-Kohi as a separate agricultural department to promote farming in the Doab region. Option 3." },
  { s: GA, q: "नीरज चोपड़ा द्वारा 2021 में टोक्यो में आयोजित ओलंपिक खेलों में स्वर्ण पदक जीतने वाले थ्रो में भाले द्वारा तय की गई दूरी ________ के बीच थी।", o: ["86.5 m और 87.0 m","87.0 m और 87.5 m","87.5 m और 88.0 m","86.0 m और 86.5 m"], e: "Neeraj Chopra's gold-winning throw at Tokyo 2020 (held 2021) was 87.58 m → falls in 87.5-88.0 m range. Option 3." },
  { s: GA, q: "निम्नलिखित में से किसने 7 सितंबर 2021 को वीडियो कॉन्फ़्रेंसिंग के माध्यम से शिक्षक पर्व का उद्घाटन भाषण दिया?", o: ["अमर्त्य सेन","नरेंद्र मोदी","सी.एन.आर. राव","धर्मेंद्र प्रधान"], e: "PM Narendra Modi delivered the inaugural address of Shikshak Parv 2021 via video conferencing on 7 September 2021. Option 2." }
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

  const TEST_TITLE = 'SSC Selection Post Phase IX (Matriculation) - 9 February 2022 Shift-1';
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
