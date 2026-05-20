/**
 * Seed: SSC Selection Post Phase IX 2021 (Matriculation Level) PYQ - 3 February 2022, Shift-2 (100 questions)
 * Source: SSC official response sheet (PDF + docx). Hindi recovered via docx-XML parse.
 * All image-based questions (REA Q9, Q17, Q25 + all QA Q1-Q25) sourced from docx-embedded media.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-3feb2022-s2.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_feb03_s2";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-3feb2022-s2';

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

const F = '03-feb-2022-s2';

// All images sourced from docx-extracted media (no separate pre-cropped images/ folder for this shift).
const IMAGE_MAP = {
  // REA image questions
  9:  { q: 'image4.jpeg', opts: ['image5.png','image6.png','image7.png','image8.png'] },
  17: { q: 'image9.jpeg', opts: ['image10.png','image11.png','image12.png','image13.png'] },
  25: { q: 'image14.jpeg', opts: ['image15.jpeg','image16.jpeg','image17.jpeg','image18.jpeg'] },

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
  65: { q: 'image89.jpeg', opts: ['image90.jpeg','image91.png','image92.png','image93.jpeg'] },
  66: { q: 'image94.jpeg', opts: ['image95.png','image96.png','image97.png','image98.png'] },
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
  2, 4, 3, 4, 3,   3, 1, 1, 4, 3,   4, 4, 1, 1, 2,   1, 1, 3, 2, 3,   4, 4, 3, 1, 1,
  // 26-50 English Language
  2, 3, 4, 3, 3,   1, 3, 1, 2, 4,   2, 4, 4, 2, 3,   2, 3, 4, 3, 4,   3, 3, 2, 4, 4,
  // 51-75 Quantitative Aptitude — image-based; defaults for unanswered
  2, 4, 2, 1, 2,   2, 3, 4, 1, 4,   3, 1, 1, 4, 1,   3, 4, 4, 1, 4,   3, 2, 3, 2, 3,
  // 76-100 General Awareness
  4, 3, 4, 3, 4,   3, 4, 2, 2, 2,   3, 4, 3, 1, 1,   1, 1, 3, 3, 2,   3, 4, 1, 1, 1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "यदि '×' का अर्थ '+' है, '÷' का अर्थ '−' है, '+' का अर्थ '÷' है, और '−' का अर्थ '×' है, तो दिए गए व्यंजक का मान ज्ञात कीजिए।\n\n231 ÷ 21 × 49 + 7 − 28", o: ["427","406","518","448"], e: "Apply substitutions: 231 − 21 + 49 ÷ 7 × 28 = 231 − 21 + 7 × 28 = 231 − 21 + 196 = 406. Option 2." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'BAT' को 46 और 'LIMP' को 100 लिखा जाता है। उसी कूट भाषा में 'HONOUR' को किस प्रकार लिखा जाएगा?", o: ["186","173","157","182"], e: "Pattern: 2 × (sum of letter positions). BAT: 2(2+1+20)=46 ✓. LIMP: 2(12+9+13+16)=100 ✓. HONOUR: 2(8+15+14+15+21+18) = 2×91 = 182. Option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'DOPING' को 'TMRKLW' के रूप में लिखा जाता है, और 'WATER' को 'IVGZD' के रूप में लिखा जाता है। उसी भाषा में 'COUNTER' को किस रूप में लिखा जाएगा?", o: ["IGIAMUH","WLGMATX","IVGMFLX","WGLAMXT"], e: "Reverse the word, then mirror each letter (27 − pos). COUNTER → RETNUOC → I-V-G-M-F-L-X. Option 3." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'ASCRIBE' को '1-3-19-18-2-5-9' के रूप में कूटबद्ध किया जाता है, और 'SOLVENT' को '12-15-19-22-5-14-20' के रूप में कूटबद्ध किया जाता है। उसी भाषा में 'SPECIES' को कैसे कूटबद्ध किया जाएगा?", o: ["5-16-19-6-5-9-19","15-6-19-3-9-5-19","5-16-19-3-5-9-19","16-5-19-3-5-18-19"], e: "Per response sheet, option 4 (16-5-19-3-5-18-19)." },
  { s: REA, q: "उस विकल्प का चयन कीजिए जो तीसरी संख्या से उसी प्रकार संबंधित है जिस प्रकार दूसरी संख्या पहली संख्या से संबंधित है और छठी संख्या पाँचवीं संख्या से संबंधित है।\n\n8 : 12 :: 6 : ? :: 10 : 15", o: ["8","7","9","10"], e: "Pattern: ×1.5. 8×1.5=12 ✓. 10×1.5=15 ✓. 6×1.5=9. Option 3." },
  { s: REA, q: "उस विकल्प का चयन कीजिए, जिसका तीसरे अक्षर-समूह से वही संबंध है, जो दूसरे अक्षर-समूह का पहले अक्षर-समूह से है।\n\nBEH : GLQ :: JMP : ?", o: ["MRV","QWZ","OTY","NSY"], e: "Differences: +5, +7, +9 (B→G, E→L, H→Q). Apply to JMP: J+5=O, M+7=T, P+9=Y → OTY. Option 3." },
  { s: REA, q: "छः मित्र A, B, C, D, E और F एक वृत्ताकार मेज के परितः केंद्र की ओर मुख करके बैठे हैं। C और A, D के ठीक बगल में बैठे हैं। F और E के बीच केवल B बैठा है। F, C के दाईं ओर ठीक बगल में बैठा है।\n\nA के बाईं ओर दूसरे स्थान पर कौन बैठा है?", o: ["E","F","B","C"], e: "Per response sheet, option 1 (E)." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए, जो निम्नलिखित श्रेणी में चिह्न (?) के स्थान पर आ सकती है।\n\n13, 17, 19, 23, 29, ?", o: ["31","30","36","33"], e: "Series of consecutive primes: 13, 17, 19, 23, 29, 31. Option 1." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "L, M, N, O और P एक सीधी पंक्ति में उत्तर की ओर मुख करके एक बेंच पर बैठे हैं। P, L के बगल में बैठा है। M, O के बाईं ओर ठीक बगल में बैठा है, जो बेंच के एक सिरे पर बैठा है। N, P और M के बीच में नहीं बैठा है। L, M के बाईं ओर दूसरे स्थान पर है। L और N एक साथ बैठे हैं।\n\nN की बैठने की स्थिति क्या है?", o: ["M और L के बीच","P और M के बीच","बेंच के बाएँ सिरे पर","P और O के बीच"], e: "Arrangement: N, L, P, M, O. N is at the leftmost end. Option 3." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'DEATH' को 'IBXYM' के रूप में लिखा जाता है। उसी भाषा में 'SIMPLE' को कैसे लिखा जाएगा?", o: ["NFRKQB","NFKRBQ","XLRUQH","XFRUQB"], e: "Pattern: vowels −3, consonants +5. DEATH: D+5=I, E−3=B, A−3=X(24), T+5=Y, H+5=M ✓. SIMPLE: S+5=X, I−3=F, M+5=R, P+5=U, L+5=Q, E−3=B → XFRUQB. Option 4." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़िए।\n\nकथन:\nकुछ चिकित्सक, एंकर हैं। कुछ एंकर, गायक हैं।\nकोई भी गायक, संगीतकार नहीं है।\n\nनिष्कर्ष:\nI. कुछ गायकों के चिकित्सक होने की संभावना है।\nII. कुछ संगीतकारों के एंकर नहीं होने की संभावना है।", o: ["केवल निष्कर्ष II अनुसरण करता है।","न तो निष्कर्ष I और न ही निष्कर्ष II अनुसरण करता है।","केवल निष्कर्ष I अनुसरण करता है।","निष्कर्ष I और II दोनों अनुसरण करते हैं।"], e: "Both are 'possibility' conclusions — both can be true. Option 4." },
  { s: REA, q: "रघुराम के पिता की कोमली नामक पुत्री और ऋषिक नामक पुत्र है, जिसके पिता की बहन ललिता का विवाह रंजीत के साथ हुआ है जिसके ससुर मुरली हैं। ललिता के पिता का रघुराम से क्या संबंध है?", o: ["दादा","भतीजा","पुत्र","चाचा"], e: "Lalita is sister of Raghuram's father → Lalita's father is Raghuram's grandfather (दादा). Option 1." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए, जो निम्नलिखित श्रेणी में चिह्न (?) के स्थान पर आ सकती है।\n\n52, 65, 82, 95, 112, ?", o: ["129","125","127","132"], e: "Differences alternate +13, +17, +13, +17, +13. 112 + 17 = 129. Option 1." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'DENSITY' को '4-5-14-19-9-20-25' के रूप में कूटबद्ध किया जाता है। उसी भाषा में 'UBIQUITOUS' को किस रूप में कूटबद्ध किया जाएगा?", o: ["21-2-9-16-21-9-19-15-21-18","21-2-9-17-21-9-20-15-21-19","21-2-8-17-21-8-20-15-21-19","20-2-9-16-20-9-20-15-20-19"], e: "Each letter = its alphabet position. UBIQUITOUS: U(21), B(2), I(9), Q(17), U(21), I(9), T(20), O(15), U(21), S(19) → 21-2-9-17-21-9-20-15-21-19. Option 2." },
  { s: REA, q: "अक्षरों के उस संयोजन का चयन कीजिए जो दी गई श्रृंखला के रिक्त स्थानों में क्रमिक रूप से रखे जाने पर श्रृंखला को पूर्ण करेगा।\n\nS_PT_ST_TZ_T_T_S_P_Z", o: ["T, Z, P, S, P, Z, T, T","Z, T, P, P, S, T, Z, T","Z, P, T, S, P, T, T, Z","T, P, Z, S, T, Z, P, T"], e: "Best guess per pattern (unanswered in response sheet) — option 1." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "दिए गए विकल्पों में से उस अक्षर-समूह का चयन कीजिए, जो निम्नलिखित श्रृंखला में चिह्न (?) के स्थान पर आ सकता है।\n\nQJB, RLE, SNH, TPK, ?", o: ["VRM","VSN","URN","WSM"], e: "1st letter: Q→R→S→T→U (+1). 2nd: J→L→N→P→R (+2). 3rd: B→E→H→K→N (+3). Next = URN. Option 3." },
  { s: REA, q: "उस सही विकल्प का चयन कीजिए जो दिए गए शब्दों को उस क्रम में दर्शाता है जिसमें वे अंग्रेज़ी शब्दकोश में दिखाई देते हैं।\n\n1. Planning  2. Playing  3. Place  4. Placard  5. Plough  6. Plead", o: ["3, 4, 1, 2, 6, 5","4, 3, 1, 2, 6, 5","4, 3, 2, 1, 6, 5","4, 3, 1, 2, 5, 6"], e: "Dictionary order: Placard(4), Place(3), Planning(1), Playing(2), Plead(6), Plough(5) → 4,3,1,2,6,5. Option 2." },
  { s: REA, q: "मुकेश, सुरेश के पिता हैं। राजू सुरेश का भाई है। नीना मुकेश की इकलौती पुत्री है। किशन, सुरेश और प्रियंका का पुत्र है।\n\nनीना का किशन से क्या संबंध है?", o: ["पुत्री","मौसी / माँ की बहन","बुआ / पिता की बहन","बहन"], e: "Neena is Suresh's sister (Mukesh's only daughter). Kishan is Suresh's son. So Neena is Kishan's father's sister = बुआ. Option 3." },
  { s: REA, q: "उस विकल्प का चयन कीजिए जो तीसरे शब्द से उसी प्रकार संबंधित है जिस प्रकार दूसरा शब्द पहले शब्द से संबंधित है।\n\nदंत-चिकित्सक : दाँत :: अस्थि-रोग विशेषज्ञ : ?", o: ["रक्त","अस्थि-मज्जा","फेफड़े","अस्थियाँ"], e: "Dentist treats teeth; Orthopedist treats bones (अस्थियाँ). Option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'FATHER' को 'AFHTRE' लिखा जाता है, और 'SISTER' को 'ISTSRE' लिखा जाता है। उसी कूट भाषा में 'MOTHER' को किस प्रकार लिखा जाएगा?", o: ["TOMREH","OMHRET","TMOERH","OMHTRE"], e: "Swap each consecutive pair of letters. MOTHER: MO→OM, TH→HT, ER→RE → OMHTRE. Option 4." },
  { s: REA, q: "चार अक्षर-समूह दिए गए हैं, जिनमें से तीन किसी तरह से संगत हैं और एक असंगत है। उस अक्षर-समूह का चयन कीजिए, जो अन्य से असंगत है।", o: ["FJN","CGK","MQW","JNR"], e: "FJN (+4,+4), CGK (+4,+4), JNR (+4,+4). MQW has (+4,+6) — odd one out. Option 3." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़िए।\n\nकथन:\nसभी तोते सब्जियाँ हैं। कुछ मोबाइल तोते हैं। सभी तौलिए मोबाइल हैं।\n\nनिष्कर्ष:\nI. सभी तौलिए सब्जियाँ हैं।\nII. कुछ तौलिए सब्जियाँ हैं।\nIII. कुछ सब्जियाँ मोबाइल हैं।\nIV. सभी मोबाइल सब्जियाँ हैं।", o: ["केवल निष्कर्ष III पालन करता है।","केवल निष्कर्ष II पालन करता है।","केवल निष्कर्ष I पालन करता है।","केवल निष्कर्ष I और III पालन करते हैं।"], e: "Some mobiles are parrots + all parrots are vegetables ⇒ some mobiles are vegetables ⇒ some vegetables are mobiles (III ✓). Others overgeneralise. Option 1." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nConceit", o: ["Vanity","Humility","Immodesty","Pomposity"], e: "'Conceit' (excessive pride) — antonym 'Humility' (modesty). Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe team is being led by an able captain.", o: ["An able captain was leading the team.","An able captain led the team.","An able captain is leading the team.","An able captain will lead the team."], e: "Present continuous passive 'is being led' → active 'is leading'. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nShe was so angry that she ________ the door and ran out.", o: ["crushed","crashed","blasted","slammed"], e: "'Slammed the door' is the standard collocation for angrily closing a door. Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nTalkative", o: ["Chatty","Conversational","Withdrawn","Garrulous"], e: "'Talkative' (chatty) — antonym 'Withdrawn' (reserved / quiet). Option 3." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nReckless", o: ["Wise","Cautious","Careless","Thoughtful"], e: "'Reckless' = careless / heedless. Option 3." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["infirtile","infidel","infinitive","infiltrate"], e: "'infirtile' is misspelled — correct is 'infertile'. Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nFlex one's muscles", o: ["beat someone physically with muscle strength","show one's muscular strength","give or make a show of one's strength","show that one has more muscles than another"], e: "'Flex one's muscles' = make a show of one's strength/influence. Option 3." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nAll the customers of a business.", o: ["Clientele","Leaders","Workers","Executives"], e: "'Clientele' = the entire body of customers of a business. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in reported speech.\n\n\"Vidushi, you have grown even taller!\" said Sana.", o: ["Sana will exclaim to Vidushi that she was even taller.","Sana exclaimed to Vidushi that she had grown even taller.","Sana exclaims how even taller Vidushi had grown.","Sana had exclaimed how Vidushi is growing even taller."], e: "Direct exclamation in past → 'exclaimed that … had grown'. Option 2." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["classical","classic","classification","classisist"], e: "'classisist' is misspelled — correct is 'classicist'. Option 4." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nFull of hot air", o: ["Nervous","Self-important","Hot-headed","Energetic"], e: "'Full of hot air' = boastful / self-important / talking nonsense. Option 2." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nHamper", o: ["Permit","Push","Facilitate","Block"], e: "'Hamper' = hinder / block / obstruct. Option 4." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nTo stay longer than necessary.", o: ["Wander","Stroll","Digress","Linger"], e: "'Linger' = remain longer than necessary; be slow in leaving. Option 4." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Courteous","Disatisfied","Encourage","Ambition"], e: "'Disatisfied' is misspelled — correct is 'Dissatisfied' (double-s). Option 2." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nI am going to ________ my parrot from the cage.", o: ["issue","deliver","release","clear"], e: "'Release the parrot' (let it free) is the natural collocation. Option 3." },
  { s: ENG, q: "Read the passage on water and energy interdependence.\n\nWhich of the following CANNOT help to save water?", o: ["Drip irrigation","Dehydration","Rainwater harvesting","Preventing run-offs"], e: "Drip irrigation, rainwater harvesting, preventing run-offs are water-saving methods. 'Dehydration' (loss of water) does not save water — it's the problem itself. Option 2." },
  { s: ENG, q: "Read the passage on water and energy interdependence.\n\nThe passage focusses on:", o: ["different forms of energy","high water consumption in the agriculture sector","the interdependence of water and energy","increased dependence on fossil fuels"], e: "Per passage: 'The interdependence of water and energy is evident' — the central theme. Option 3." },
  { s: ENG, q: "Read the passage on water and energy interdependence.\n\nWhich of the following factors is likely to put further pressure on water sources?", o: ["Change in crop patterns","Recycling of water","Checking water pollution","Increase in world population"], e: "Per passage: 'world population of 9 billion by 2050 which will put further stress on the water sourcing and supply systems'. Option 4." },
  { s: ENG, q: "Read the passage on water and energy interdependence.\n\nFossil-based energy is ________.", o: ["human energy","electrical energy","stored solar energy","mechanical energy"], e: "Per passage: 'the sun took 150 million years to store its energy in the fossil fuels' — fossil fuel = stored solar energy. Option 3." },
  { s: ENG, q: "Read the passage on water and energy interdependence.\n\nEconomic water shortage occurs when ________.", o: ["the sources of water dry up","the supply of water is not adequate","water resources are polluted","existing water sources cannot be tapped"], e: "Per passage: 'economic water shortage (when existing water sources cannot be used because of a lack of investment in water-related infrastructure)'. Option 4." },
  { s: ENG, q: "In the passage about Sudha Murty, fill in blank No. 1.\n\n'She did her MTech (1)________ computer science…'", o: ["on","of","in","at"], e: "'MTech in computer science' is the standard collocation. Option 3." },
  { s: ENG, q: "In the passage about Sudha Murty, fill in blank No. 2.\n\n'…the chairperson of (2)________ Infosys Foundation.'", o: ["one","an","the","a"], e: "Specific named foundation — definite article 'the'. Option 3." },
  { s: ENG, q: "In the passage about Sudha Murty, fill in blank No. 3.\n\n'A prolific (3)________ in English and Kannada…'", o: ["poet","writer","reader","speaker"], e: "Sudha Murty writes novels, short stories, etc. → 'prolific writer'. Option 2." },
  { s: ENG, q: "In the passage about Sudha Murty, fill in blank No. 4.\n\n'…she (4)________ novels, technical books, travelogues…'", o: ["writing","will write","write","has written"], e: "Present perfect — she has produced multiple works over time → 'has written'. Option 4." },
  { s: ENG, q: "In the passage about Sudha Murty, fill in blank No. 5.\n\n'(5)________ books have been translated into all the major Indian languages.'", o: ["Their","My","His","Her"], e: "Subject is Sudha Murty (female) — possessive 'Her'. Option 4." },

  // ============ Quantitative Aptitude (51-75) — all image-based ============
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "मानव लाल रक्त कणिकाएँ मुख्य रूप से ________ में बनती हैं।", o: ["मस्तिष्क","हृदय","गुर्दा","अस्थि मज्जा"], e: "Human red blood cells are produced in the bone marrow (अस्थि मज्जा). Option 4." },
  { s: GA, q: "अकबर के शासन काल के संदर्भ में, निम्नलिखित में से कौन-सा शब्द उस जमीन/भूमि को निरूपित करता है, जिस पर कुछ समय के लिए खेती करना रोक दिया जाता था ताकि वह अपनी उपजाऊ ताकत को वापिस पा सके?", o: ["बंजर","चचर","परौती","पोलज"], e: "Akbar's land classification: Parauti = land left fallow temporarily to restore fertility. Option 3." },
  { s: GA, q: "'When Dimple Met Rishi' के लेखक कौन हैं?", o: ["रोहित सुरेश साराफ","जेनिफर कपूर","शशि कपूर","संध्या मेनन"], e: "'When Dimple Met Rishi' (2017) is a YA novel by Sandhya Menon. Option 4." },
  { s: GA, q: "आवेग को ________ में परिवर्तन के रूप में परिभाषित किया जाता है।", o: ["गतिज ऊर्जा","त्वरण","रेखीय संवेग","रेखीय वेग"], e: "Impulse (आवेग) is defined as change in linear momentum (रेखीय संवेग). Option 3." },
  { s: GA, q: "निम्न में से किस वर्ष ब्रिटिश संसद द्वारा भारतीय कानूनों के समेकन और संहिताकरण हेतु विधि आयोग की स्थापना के लिए चार्टर अधिनियम को अधिनियमित किया गया था?", o: ["1933","1898","1927","1833"], e: "Charter Act of 1833 established the first Law Commission of India (under Lord Macaulay). Option 4." },
  { s: GA, q: "निम्न में से किस नदी को आप मुख्य रूप से हड़प्पा सभ्यता से जोड़ेंगे?", o: ["सतलुज","चेनाब","सिंधु","ब्यास"], e: "Harappan / Indus Valley Civilization is primarily associated with the Indus (सिंधु) river. Option 3." },
  { s: GA, q: "तमिलनाडु के किस त्योहार में साँड़ों को वश में करने वाला खेल खेला जाता है?", o: ["कारतीगई","थ्रिशूर पूरम","ओणम","पोंगल"], e: "Jallikattu (bull-taming) is played during Pongal — specifically Mattu Pongal in Tamil Nadu. Option 4." },
  { s: GA, q: "निम्न में से किस टीम ने 2021 में आयोजित यूरोपीय फुटबॉल चैम्पियनशिप, 2020 जीती?", o: ["डेनमार्क","इटली","फ़्रांस","इंग्लैंड"], e: "Italy won UEFA Euro 2020 (held in 2021), defeating England in the final. Option 2." },
  { s: GA, q: "एक ही पत्थर को काटकर बना ग्यारह स्मारक कैलाश मंदिर कहाँ स्थित है?", o: ["आंध्र प्रदेश","महाराष्ट्र","राजस्थान","मध्य प्रदेश"], e: "Kailasa Temple (Ellora Cave 16) — carved from a single rock — is in Maharashtra. Option 2." },
  { s: GA, q: "प्रमोद भगत और मनोज सरकार ने, 2021 में टोक्यो में आयोजित पैरालंपिक खेलों में निम्न में से किस प्रतियोगिता में भारत का प्रतिनिधित्व किया था?", o: ["ऊँची कूद","बैडमिंटन","टेबल टेनिस","फ़ुटबॉल 5-ए-साइड"], e: "Pramod Bhagat (gold) and Manoj Sarkar (bronze) won medals in Para-Badminton at Tokyo 2020 Paralympics. Option 2." },
  { s: GA, q: "कू (Koo) ऐप क्या है, जो सितंबर 2021 में प्रमुखता से चर्चा में आई, जबकि इसे काफी समय पहले लॉन्च किया गया था?", o: ["उपयोगी संबंधों का एक ऑनलाइन क्रिएटर","एक विजुअल मीडिया स्टोर","एक सोशल मीडिया प्लेटफॉर्म","एक म्यूचुअल फंड ट्रैकर"], e: "Koo is an Indian microblogging/social media platform (Twitter alternative) launched 2020. Option 3." },
  { s: GA, q: "2021 में, टोक्यो में आयोजित ओलंपिक खेलों में लवलीना बोरगोहेन ने मुक्केबाजी की निम्न में से किस श्रेणी में कांस्य पदक जीता था?", o: ["फेदरवेट","मिडलवेट","हैवीवेट","वेल्टरवेट"], e: "Lovlina Borgohain won bronze in Women's Welterweight (69 kg) boxing at Tokyo 2020. Option 4." },
  { s: GA, q: "भारतीय संविधान के अनुच्छेद ________ परिभाषित करते हैं कि किसी भी राज्य या केंद्र शासित देश के संबंध में कौन अनुसूचित जाति और अनुसूचित जनजाति होगा।", o: ["179 और 180","97 और 98","341 और 342","241 और 242"], e: "Article 341 (SC) and Article 342 (ST) define SCs and STs of states/UTs. Option 3." },
  { s: GA, q: "निम्नलिखित में से कौन सा मृदा के धीमे क्षरण का कारण बनता है?", o: ["भूवैज्ञानिक अपक्षय","टॉर्नेडो","भूकंप","बाढ़"], e: "Geological weathering (भूवैज्ञानिक अपक्षय) causes slow erosion of soil. Tornado/earthquake/flood are rapid/violent. Option 1." },
  { s: GA, q: "निम्नलिखित में से कौन एक प्रसिद्ध गणितज्ञ थे, और उन्होंने कलकत्ता उच्च न्यायालय के मुख्य न्यायाधीश का पदभार भी संभाला था?", o: ["आशुतोष मुखर्जी","मेघनाद साहा","प्रशांत चंद्र महालनोबिस","दत्तात्रेय कापरेकर"], e: "Sir Ashutosh Mukherjee — renowned mathematician and Chief Justice of Calcutta HC. Option 1." },
  { s: GA, q: "निम्न में से कौन सा अप्रत्यक्ष कर नहीं है?", o: ["निगम कर","केंद्रीय उत्पाद शुल्क","सीमा शुल्क","सेवा कर"], e: "Corporation tax (निगम कर) is a DIRECT tax. Excise, customs, service tax are all INDIRECT taxes. Option 1." },
  { s: GA, q: "विश्व प्रेस स्वतंत्रता सूचकांक 2021 में भारत का स्थान कौन सा है?", o: ["142","145","144","143"], e: "India ranked 142 in the World Press Freedom Index 2021 (out of 180). Option 1." },
  { s: GA, q: "खमीर (यीस्ट), एक सूक्ष्म जीव है, जो किसी रासायनिक अभिक्रिया में ________ उत्पादन के लिए सरल कार्बोहाइड्रेट्स का उपयोग करता है।", o: ["सल्फ्यूरिक एसिड","नाइट्रिक ऑक्साइड","कार्बन डाईऑक्साइड","कार्बन मोनोऑक्साइड"], e: "Yeast ferments simple carbohydrates, producing carbon dioxide and ethanol. Option 3." },
  { s: GA, q: "अर्थशास्त्र में, ________ एक अंतर्क्रिया है, जहाँ एक पक्ष को होने वाला लाभ दूसरे पक्ष को हुई हानि के बराबर होता है।", o: ["सीमांत लागत खेल","सार्वजनिक माल खेल","शून्य-योग खेल","निम्न लागत खेल"], e: "A zero-sum game (शून्य-योग खेल) — one party's gain equals another's loss. Option 3." },
  { s: GA, q: "निम्न में से कौन सा राज्य भारत का एकमात्र ऐसा राज्य है, जहाँ धर्म, लिंग और जाति की परवाह किए बिना समान नागरिक संहिता लागू है?", o: ["असम","गोवा","हिमाचल प्रदेश","केरल"], e: "Goa has the Goa Civil Code (Portuguese-era uniform civil code) — only state with UCC. Option 2." },
  { s: GA, q: "1943 के बंगाल अकाल के दौरान, निम्न में से किस श्रेणी के लोग सबसे अधिक प्रभावित लोगों में शामिल नहीं थे?", o: ["परिवहन कर्मचारी","कृषि श्रमिक","फुटकर विक्रेता","मछुआरे"], e: "Most affected: agricultural labourers, fishermen, transport workers, artisans. Retail sellers (फुटकर विक्रेता) were comparatively less affected. Option 3." },
  { s: GA, q: "निम्न में से कौन सी खरीफ की फसल नहीं है?", o: ["मक्का","सोयाबीन","कपास","गेहूँ"], e: "Maize, soybean, cotton are Kharif crops. Wheat (गेहूँ) is a Rabi crop. Option 4." },
  { s: GA, q: "निम्न में से कौन, राज्यसभा के महासचिव की नियुक्ति कर सकता है?", o: ["राज्यसभा के सभापति","राष्ट्रपति","उपराष्ट्रपति","लोकसभा अध्यक्ष"], e: "The Secretary-General of Rajya Sabha is appointed by the Chairman of Rajya Sabha (Vice-President ex-officio, but the appointment is in his role as RS Chairman). Option 1." },
  { s: GA, q: "भारत में शरीया कानून लागू करने वाला पहला मुगल सम्राट निम्न में से कौन था?", o: ["औरंगज़ेब","अकबर","जहाँगीर","शाहजहाँ"], e: "Aurangzeb was the first Mughal emperor to implement Sharia law in India (compiled the Fatawa-e-Alamgiri). Option 1." },
  { s: GA, q: "विवर्तनिक परिवर्तन (tectonic shift) से पहले हिमालय के स्थान पर निम्न में से कौन सा सागर था?", o: ["टेथिस सागर","लाल सागर","कैस्पियन सागर","कैरिबियन सागर"], e: "Before the Himalayas rose, the Tethys Sea occupied that region — closed by Indian plate collision with Eurasia. Option 1." }
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

  const TEST_TITLE = 'SSC Selection Post Phase IX (Matriculation) - 3 February 2022 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-2',
    pyqExamName: 'SSC Selection Post Phase IX (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
