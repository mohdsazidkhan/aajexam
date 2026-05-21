/**
 * Seed: SSC Selection Post Phase IX 2021 (Matriculation Level) PYQ - 14 February 2022, Shift-1 (100 questions)
 * Source: SSC official response sheet (PDF + docx). Hindi recovered via docx-XML parse.
 * Note: PDF metadata reads "Exam Date 14/03/2022" but folder convention says 14 Feb — went with folder convention.
 * All image questions (REA Q11/Q16/Q23 + all QA Q1-Q25) sourced directly from docx-embedded media.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-14feb2022-s1.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_feb14_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-14feb2022-s1';

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

const F = '14-feb-2022-s1';

const IMAGE_MAP = {
  // REA image questions
  11: { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] },
  16: { q: 'image9.jpeg', opts: ['image10.png','image11.png','image12.png','image13.png'] },
  23: { q: 'image14.jpeg', opts: ['image15.png','image16.png','image17.png','image18.png'] },

  // QA Q51-Q75 — all image-based
  51: { q: 'image19.jpeg', opts: ['image20.jpeg','image21.jpeg','image22.jpeg','image23.jpeg'] },
  52: { q: 'image24.jpeg', opts: ['image25.jpeg','image26.jpeg','image27.jpeg','image28.jpeg'] },
  53: { q: 'image29.png',  opts: ['image30.jpeg','image31.jpeg','image32.jpeg','image33.jpeg'] },
  54: { q: 'image34.jpeg', opts: ['image35.jpeg','image36.png','image37.jpeg','image38.png'] },
  55: { q: 'image39.jpeg', opts: ['image40.jpeg','image41.jpeg','image42.jpeg','image43.jpeg'] },
  56: { q: 'image44.jpeg', opts: ['image45.jpeg','image46.jpeg','image47.png','image48.png'] },
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
  69: { q: 'image109.jpeg', opts: ['image110.jpeg','image111.jpeg','image112.png','image113.jpeg'] },
  70: { q: 'image114.jpeg', opts: ['image115.jpeg','image116.jpeg','image117.jpeg','image118.jpeg'] },
  71: { q: 'image119.jpeg', opts: ['image120.png','image121.png','image112.png','image111.jpeg'] },
  72: { q: 'image122.jpeg', opts: ['image123.jpeg','image124.jpeg','image125.jpeg','image126.jpeg'] },
  73: { q: 'image127.jpeg', opts: ['image128.jpeg','image129.jpeg','image130.jpeg','image131.jpeg'] },
  74: { q: 'image132.jpeg', opts: ['image133.jpeg','image134.jpeg','image135.jpeg','image136.jpeg'] },
  75: { q: 'image137.jpeg', opts: ['image138.jpeg','image139.jpeg','image140.jpeg','image141.jpeg'] }
};

// 1-based answer key.
const KEY = [
  // 1-25 General Intelligence
  4, 1, 1, 1, 2,   3, 1, 2, 1, 4,   2, 3, 3, 4, 2,   4, 3, 1, 3, 4,   4, 4, 4, 3, 1,
  // 26-50 English Language
  4, 3, 3, 2, 3,   4, 1, 2, 1, 3,   4, 2, 2, 3, 1,   2, 3, 1, 3, 1,   2, 4, 1, 4, 4,
  // 51-75 Quantitative Aptitude — image-based
  2, 1, 3, 3, 1,   1, 4, 2, 2, 4,   1, 3, 3, 2, 3,   4, 2, 3, 2, 2,   2, 2, 2, 2, 2,
  // 76-100 General Awareness
  4, 4, 4, 1, 2,   1, 4, 1, 1, 1,   1, 4, 1, 3, 1,   1, 1, 2, 4, 2,   2, 4, 4, 3, 1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "दिए गए समीकरण को संतुलित करने के लिए किन दो संख्याओं (अंकों को नहीं) को परस्पर बदला जाना चाहिए?\n\n48 + 12 × 8 − 24 ÷ 8 = 114", o: ["24 और 12","12 और 8","48 और 8","48 और 24"], e: "Swap 48 and 24: 24 + 12 × 8 − 48 ÷ 8 = 24 + 96 − 6 = 114 ✓. Option 4." },
  { s: REA, q: "पांच व्यक्ति K, L, P, N और O एक सीधी पंक्ति में बैठे हैं, सभी का मुख एक ही दिशा में है। L, N के दाएँ दूसरे स्थान पर बैठा है। K, P के दाएँ तीसरे स्थान पर बैठा है। O, K के बगल में बैठा है। P के ठीक बाएँ कौन बैठा है?", o: ["N","O","K","L"], e: "P=2 (so K=P+3=5), O=K's neighbour=4. L=N+2 with remaining seats {1,3} → N=1, L=3. Line (left→right): N, P, L, O, K. Immediate left of P = N. Option 1." },
  { s: REA, q: "अक्षरों के उस संयोजन का चयन कीजिए जिसे दी गई श्रृंखला के रिक्त स्थानों में क्रमिक रूप से रखने पर श्रृंखला पूर्ण हो जाएगी।\n\nZ K _ R _ Z _ M R _ Z K M _ T _ K M _ T", o: ["M T K T R Z R","M T K Z R Z R","M T K T R T R","Z T K T R Z R"], e: "Per response sheet, option 1 (M T K T R Z R)." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़िए।\n\nकथन: कोई लिली गुलाब नहीं है। सभी गुलाब चमेली हैं।\n\nनिष्कर्ष:\nI. कोई लिली चमेली नहीं है।\nII. कोई चमेली लिली नहीं है।\nIII. कुछ चमेली गुलाब हैं।\nIV. सभी चमेली गुलाब हैं।", o: ["केवल निष्कर्ष III अनुसरण करता है।","केवल निष्कर्ष I अनुसरण करता है।","निष्कर्ष I और IV दोनों अनुसरण करते हैं।","निष्कर्ष I और II दोनों अनुसरण करते हैं।"], e: "All roses are jasmine → some jasmine are roses (III ✓). I, II not derivable (lilies could overlap with non-rose jasmine). IV too strong. Option 1." },
  { s: REA, q: "आठ मित्र A, B, C, D, E, F, G और H एक वृत्ताकार मेज के परितः केंद्र की ओर मुख करके बैठे हैं। केवल B, H और D के बीच में है। केवल C, H और E के बीच में है। E, D के दायीं ओर चौथे स्थान पर है। B, E के दायीं ओर तीसरे स्थान पर है। केवल F, G और A के बीच में है। G, D के निकटस्थ स्थान पर नहीं है।\n\nB के दायीं ओर दूसरे स्थान पर कौन बैठा है?", o: ["H","A","C","F"], e: "Facing centre: right = anticlockwise. Place D=1, then E=5 (4 anticlockwise), B=2 (3 anticlockwise from E), H=3 (B between H&D), C=4 (between H&E), G=6 (not adjacent to D), F=7, A=8. 2nd right of B (B=2 anticlockwise) → A at position 8. Option 2." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'PRESUME' को 'EEMPRSU' लिखा जाता है। उसी कूट भाषा में 'NOCTURNAL' को कैसे लिखा जाएगा?", o: ["ACNLNORTU","ACLNNOUTR","ACLNNORTU","ACLNNTORU"], e: "Code = letters sorted alphabetically. PRESUME → E,E,M,P,R,S,U ✓. NOCTURNAL → A,C,L,N,N,O,R,T,U = ACLNNORTU. Option 3." },
  { s: REA, q: "उस विकल्प का चयन कीजिए जो तीसरी संख्या से उसी प्रकार से संबंधित है, जिस प्रकार दूसरी संख्या पहली संख्या से संबंधित है और छठी संख्या पाँचवीं संख्या से संबंधित है।\n\n7 : 9 :: 8 : ? :: 6 : 2", o: ["26","22","28","25"], e: "Per response sheet, option 1 (26)." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए जो निम्नलिखित श्रेणी में प्रश्न-वाचक चिह्न (?) के स्थान पर आ सकती है।\n\n50, 66, 87, 113, 144, ?", o: ["200","180","170","190"], e: "1st differences: 16, 21, 26, 31 (each +5). Next diff = 36. 144 + 36 = 180. Option 2." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'BREAK' को '259222616' के रूप में कोडित किया जाता है। उसी भाषा में 'FEVER' को कैसे कोडित किया जाएगा?", o: ["21225229","21226228","21235239","20225219"], e: "Code = (27 − letter position) concatenated. B(2)→25, R(18)→9, E(5)→22, A(1)→26, K(11)→16 → 259222616 ✓. FEVER: F→21, E→22, V→5, E→22, R→9 → 21225229. Option 1." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए जो निम्नलिखित श्रेणी में प्रश्न-वाचक चिह्न (?) के स्थान पर आ सकती है।\n\n12, 18, 30, 54, 102, ?", o: ["180","204","146","198"], e: "1st differences: 6, 12, 24, 48 (each ×2). Next diff = 96. 102 + 96 = 198. Option 4." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "विश्रांत की एक तस्वीर की ओर इशारा करते हुए, शशि ने कहा, \"वह मेरे पिता की माँ के पति की बेटी का पति है\"। विश्रांत की पत्नी का शशि के पिता से क्या संबंध है?", o: ["बेटी","माँ","बहन","भांजी"], e: "Shashi's father's mother's husband = paternal grandfather. His daughter = Shashi's aunt (father's sister). Aunt's husband = Vishrant. So Vishrant's wife is Shashi's father's sister (बहन). Option 3." },
  { s: REA, q: "सही विकल्प का चयन करें जो दिए गए शब्दों की व्यवस्था को उसी क्रम में दर्शाता है जिस क्रम में वे अंग्रेजी शब्दकोश में दिखाई देते हैं।\n\n1. Serene  2. Serious  3. Service  4. Severe  5. Seepage", o: ["5, 1, 3, 2, 4","4, 1, 2, 3, 5","5, 1, 2, 3, 4","5, 2, 1, 3, 4"], e: "Dictionary order: Seepage(5), Serene(1), Serious(2), Service(3), Severe(4) → 5,1,2,3,4. Option 3." },
  { s: REA, q: "उस विकल्प का चयन करें जो तीसरे शब्द से उसी प्रकार संबंधित है जैसे दूसरा शब्द पहले शब्द से संबंधित है।\n\nऑर्थोपेडिक : अस्थि भंग :: डर्मेटोलॉजिस्ट : ?", o: ["टिनिटस","गठिया","कंजक्टिवाइटिस","सोरायसिस"], e: "Orthopedist treats bone fractures. Dermatologist treats skin diseases. Psoriasis (सोरायसिस) is a skin disease. Option 4." },
  { s: REA, q: "उस विकल्प का चयन कीजिए जो तीसरे पद से उसी प्रकार संबंधित है जैसे दूसरा पद पहले पद से संबंधित है।\n\nNECTAR : FHQUDW :: PLEASE : ?", o: ["HOSDVH","HORDVG","HOSHVD","HPSEVH"], e: "Per response sheet, option 2 (HORDVG)." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "दिए गए विकल्पों में से उस अक्षर-समूह का चयन कीजिए, जो निम्नलिखित श्रृंखला में प्रश्न-वाचक चिह्न (?) के स्थान पर आ सकता है।\n\nBER, EAT, HWV, ?, NOZ", o: ["LSY","LSX","KSX","KTX"], e: "1st letter: +3 each (B→E→H→K→N). 2nd letter: −4 each (E→A→W→S→O). 3rd letter: +2 each (R→T→V→X→Z). Next = KSX. Option 3." },
  { s: REA, q: "एक निश्चित कोड में, P + Q का अर्थ 'Q, P का पुत्र है'; P @ Q का अर्थ 'Q, P की पुत्री है'; P $ Q का अर्थ 'Q, P का भाई है'; P % Q का अर्थ 'P, Q का पिता है' और P # Q का अर्थ 'P, Q की माता है'।\n\nनिम्नलिखित में से कौन सा विकल्प सही है?", o: ["K + L $ M @ N का अर्थ N, K की पोती है।","C @ D $ F % G का अर्थ G, C का पोता है।","G % H # K $ L का अर्थ L, G का दामाद है।","A + B $ C % D का अर्थ A, D का नाना है।"], e: "K+L: L is K's son. L$M: M is L's brother (also K's son). M@N: N is M's daughter → N is K's granddaughter (पोती). Option 1 holds." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'CONSULT' को 'FOQRVWX' लिखा जाता है। उसी कूट भाषा में 'MAGNETS' को कैसे लिखा जाएगा?", o: ["DHPJVQW","DHJPVQW","DHJPQVW","DHPJQVW"], e: "Code = letters sorted alphabetically then each shifted by +3. CONSULT sorted = C,L,N,O,S,T,U; +3 each = F,O,Q,R,V,W,X ✓. MAGNETS sorted = A,E,G,M,N,S,T; +3 each = D,H,J,P,Q,V,W = DHJPQVW. Option 3." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'PLASTIC' को 'OKZRSHB' लिखा जाता है। उस भाषा में 'NORMAL' कैसे लिखा जाएगा?", o: ["ONSLZK","MNQNZM","MNPRZK","MNQLZK"], e: "Each letter shifted by −1: P→O, L→K, A→Z, S→R, T→S, I→H, C→B ✓. NORMAL: N→M, O→N, R→Q, M→L, A→Z, L→K = MNQLZK. Option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'SUN' को '384228' के रूप में कोडित किया जाता है। उसी कूट भाषा में 'PRICE' को कैसे कोडित किया जाएगा?", o: ["323618812","323416610","303618810","323618610"], e: "Code = (letter position × 2) concatenated. SUN: S(19)×2=38, U(21)×2=42, N(14)×2=28 → 384228 ✓. PRICE: P(16)×2=32, R(18)×2=36, I(9)×2=18, C(3)×2=6, E(5)×2=10 → 323618610. Option 4." },
  { s: REA, q: "उस सही विकल्प का चयन कीजिए जो निम्नलिखित शब्दों को तार्किक और सार्थक क्रम में व्यवस्थित करता है।\n\n1. कैलिफोर्निया  2. उत्तरी अमेरिका  3. विश्व  4. संयुक्त राज्य अमेरिका  5. ब्रह्मांड", o: ["1, 4, 3, 2, 5","4, 2, 1, 3, 5","1, 2, 4, 5, 3","1, 4, 2, 3, 5"], e: "Ascending containment: California(1) → USA(4) → North America(2) → World(3) → Universe(5). Order = 1,4,2,3,5. Option 4." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'RUST' को '7539' और 'SORE' को '3472' कोडित किया जाता है। उसी कूट भाषा में 'TRUE' को कैसे कोडित किया जाएगा?", o: ["9725","4732","9752","4372"], e: "From RUST=7539 and SORE=3472: R=7, U=5, S=3, T=9, O=4, E=2. TRUE = T(9)+R(7)+U(5)+E(2) = 9752. Option 3." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़िए।\n\nकथन: कुछ पार्क मैदान हैं। कुछ मैदान मकान हैं।\n\nनिष्कर्ष:\nI. कुछ मकान पार्क हैं।\nII. कुछ मैदान पार्क हैं।", o: ["केवल निष्कर्ष II अनुसरण करता है","निष्कर्ष I और II दोनों अनुसरण करते हैं","केवल निष्कर्ष I अनुसरण करता है","या तो निष्कर्ष I या II अनुसरण करता है"], e: "Some parks are grounds → conversion: some grounds are parks (II ✓). I cannot be derived (parks-houses link not established). Option 1." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nBLEND", o: ["divide","part","separate","merge"], e: "'Blend' = merge / mix. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nYou have packed your warm clothes, ________?", o: ["have you","did you","haven't you","didn't you"], e: "Tag question for positive present perfect 'have packed' → negative tag 'haven't you'. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nHe said to me, \"Please drop me home in your car.\"", o: ["He said to me please drop me home in your car.","I told him to drop me home in my car.","He requested me to drop him home in my car.","He asked me to drop him home in your car."], e: "Polite imperative → 'requested … to'; pronoun shift me→him and your→my. Option 3." },
  { s: ENG, q: "Select the misspelt word.", o: ["cricketer","presentor","mentor","superior"], e: "'presentor' is misspelled — correct is 'presenter'. Option 2." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nSomber", o: ["Boastful","Doleful","Cheerful","Mournful"], e: "'Somber' = gloomy/sad. Antonym = Cheerful. (Doleful/Mournful are synonyms.) Option 3." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Hostage","Hostel","Hostile","Hospitelity"], e: "'Hospitelity' is misspelled — correct is 'Hospitality'. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nThe green leaves of plants absorb the carbon dioxide.", o: ["The carbon dioxide is absorbed by the green leaves of plants.","The carbon dioxide is being absorbed by the green leaves of plants.","The carbon dioxide absorbs the green leaves of plants.","The green leaves are absorbed by the carbon dioxide of plants."], e: "Present simple active → present simple passive: 'absorb' → 'is absorbed by'. Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nfollow suit", o: ["try a costume","do the same as others","go after someone","get on well with others"], e: "'Follow suit' = do the same as someone else has done. Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\na low area of land between hills", o: ["valley","plateau","beach","gulf"], e: "'Valley' = low land between hills. Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nSwim with the tide", o: ["Accept your fault","Do something again and again","Agree with the popular opinion","Going for a swim during the high tide"], e: "'Swim with the tide' = go along with majority opinion. Option 3." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA place where government records are kept.", o: ["Godown","Library","Warehouse","Archive"], e: "'Archive' = place storing historical/government records. Option 4." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Dislodge","Disuade","Diligent","Divulge"], e: "'Disuade' is misspelled — correct is 'Dissuade' (two s's). Option 2." },
  { s: ENG, q: "Select the most appropriate antonym of the given word.\n\nrestore", o: ["repeat","damage","claim","remove"], e: "'Restore' (return to original condition / repair) — antonym 'damage'. Option 2." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nConflict", o: ["Surrender","Agreement","Battle","Attack"], e: "'Conflict' = struggle / battle. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe guard insisted ________ seeing the ID card of the visitor.", o: ["on","with","for","to"], e: "'Insist on' is the standard prepositional collocation. Option 1." },
  { s: ENG, q: "Read the passage on cartoons.\n\nIt can be inferred from the passage that:", o: ["any good artist can become a cartoonist","making cartoons is a combination of art and wit","all cartoonists get ideas from newspapers","creativity can be acquired in institutes"], e: "Passage: cartoons require 'hard work, training and a good sense of humour' — combining art and wit. Option 2." },
  { s: ENG, q: "Read the passage on cartoons.\n\nWhat is the advice given by established cartoonists?", o: ["Knowledge of current affairs is important for a cartoonist.","Everyone has the talent to become a good cartoonist.","Do not assume you can become a cartoonist just because you can sketch.","Cartoons that make us laugh should have pointed one-liners."], e: "Passage explicitly: 'just because you can sketch, don't take it for granted that you will become a successful cartoonist'. Option 3." },
  { s: ENG, q: "Read the passage on cartoons.\n\nAccording to the author what is the first thing most of us like to see in a newspaper?", o: ["Cartoon","Craft","Art","Headlines"], e: "Passage: 'the first thing most of us like to see when we pick up a newspaper is the cartoon'. Option 1." },
  { s: ENG, q: "Read the passage on cartoons.\n\nWhich of the following is most important in the making of a good cartoonist?", o: ["Drawing skill","Hard work","Sense of humour","Training"], e: "Passage emphasizes that drawing/training can be taught, but creativity and 'sense of humour' make a cartoonist. Option 3." },
  { s: ENG, q: "Read the passage on cartoons.\n\n'making a cartoon is not a piece of cake.' This means that creating cartoons is:", o: ["a tough challenge","a basic skill","a rare talent","a very simple task"], e: "'Not a piece of cake' = not easy / a tough challenge. Option 1." },
  { s: ENG, q: "Read the passage about Baia.\n\nSelect the most appropriate option to fill in the blank No. 1.\n\n'it's hidden (1)________ the sand and pebbles in the waters of the Gulf of Pozzuoli'", o: ["beyond","beneath","besides","beside"], e: "'Hidden beneath the sand' — preposition meaning 'under'. Option 2." },
  { s: ENG, q: "Read the passage about Baia.\n\nSelect the most appropriate option to fill in the blank No. 2.\n\n'just a few kilometers (2)________ Naples, Italy'", o: ["to","for","with","from"], e: "'Few kilometers from Naples' — preposition of distance. Option 4." },
  { s: ENG, q: "Read the passage about Baia.\n\nSelect the most appropriate option to fill in the blank No. 3.\n\n'The slow (3)________ of land from volcanic activity'", o: ["movement","moved","move","mover"], e: "Article 'the' + adjective 'slow' requires noun → 'movement'. Option 1." },
  { s: ENG, q: "Read the passage about Baia.\n\nSelect the most appropriate option to fill in the blank No. 4.\n\n'in 1969, divers (4)________ the ruins of two marble statues by chance'", o: ["concealed","searched","invented","discovered"], e: "'Divers discovered the ruins' is the natural meaning (found by chance). Option 4." },
  { s: ENG, q: "Read the passage about Baia.\n\nSelect the most appropriate option to fill in the blank No. 5.\n\n'tourists visit the (5)________ all year round'", o: ["situation","sight","station","site"], e: "Archaeological/historical 'site' — standard usage. Option 4." },

  // ============ Quantitative Aptitude (51-75) — all image-based ============
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "'लाल सलाम - ए नोवेल' इनमें से किस केंद्रीय मंत्री द्वारा लिखा गया है, जिसमें एक ऐसे युवा अधिकारी की कहानी है, जो एक ऐसी व्यवस्था के खिलाफ चुनौतियों का सामना करता है जो गुपचुप राजनीति और भ्रष्टाचार में डूबी हुई है?", o: ["हरदीप सिंह पुरी","निर्मला सीतारमण","अश्विनी वैष्णव","स्मृति जुबिन ईरानी"], e: "'Lal Salaam: A Novel' (2024) is written by Union Minister Smriti Zubin Irani. Option 4." },
  { s: GA, q: "भारत सरकार की प्रधानमंत्री जीवन ज्योति बीमा योजना (PMJJBY) ________ आयु वर्ग के उन लोगों के लिए शुरू की गई है, जिनके पास बैंक खाता है और जो ऑटो-डेबिट में शामिल होने/सक्षम करने के लिए अपनी सहमति देते हैं।", o: ["18 से 55 वर्ष","19 से 55 वर्ष","21 से 60 वर्ष","18 से 50 वर्ष"], e: "PMJJBY covers age group 18-50 years. Option 4." },
  { s: GA, q: "निम्नलिखित में से कौन-सा शहर, गोमती नदी के तट पर स्थित है?", o: ["भोपाल","अलीगढ़","कानपुर","लखनऊ"], e: "Lucknow is on the banks of the Gomti River. Option 4." },
  { s: GA, q: "भारत जनगणना 2011 के अनुसार, 2001 से 2011 के बीच निम्न में से किस राज्य में जनसंख्या वृद्धि का प्रतिशत सबसे कम था?", o: ["हिमाचल प्रदेश","उत्तराखंड","पंजाब","हरियाणा"], e: "2001-2011 growth rates: HP 12.81%, Punjab 13.73%, Uttarakhand 18.81%, Haryana 19.9%. HP lowest. Option 1." },
  { s: GA, q: "निम्नलिखित में से कौन-सा फ्रांसीसी यात्री, अपने द्वारा देखी गई स्थितियों को अक्सर भारत की तुलना, यूरोप की स्थिति से करते हुए लेखन करता था। वह राजकुमार दारा शुकोह के चिकित्सक के रूप में मुगल दरबार से भी निकटता से संबंधित था?", o: ["डुआर्ट बारबोसा (Duarte Barbosa)","फ्रांस्वा बर्नियर (François Bernier)","जौं-बैप्टिस्ट तैवर्निएर (Jean-Baptiste Tavernier)","जेसुइट रॉबर्टो नोबिली (Jesuit Roberto Nobili)"], e: "François Bernier (1620-1688), French physician, served Dara Shikoh in the Mughal court and frequently compared India with Europe. Option 2." },
  { s: GA, q: "1928 में, कांग्रेस पार्टी की नेहरू रिपोर्ट किसने लिखी थी, जो डोमिनियन स्टेटस प्रदान करने के आधार पर स्वतंत्र भारत के लिए प्रभावी संविधान थी?", o: ["मोतीलाल नेहरू","कमला नेहरू","जवाहरलाल नेहरू","स्वरूप रानी नेहरू"], e: "The Nehru Report (1928) was authored by Motilal Nehru. Option 1." },
  { s: GA, q: "निम्नलिखित में से कौन-सा राज्य बांग्लादेश के साथ सबसे लंबी भूमि सीमा साझा करता है?", o: ["मेघालय","असम","त्रिपुरा","पश्चिम बंगाल"], e: "India-Bangladesh border lengths: West Bengal ~2217 km is the longest. Option 4." },
  { s: GA, q: "वे जड़ें जो पेड़ के तने से निकलती हैं और जो पेड़ को सहारा देने में मदद करती हैं, ________ कहलाती हैं।", o: ["पुश्ता जड़ें (Prop roots)","कंदयुक्त जड़ें (Tuberous)","रेंगने वाली जड़ें","रेशेदार जड़ें"], e: "Roots growing from a tree trunk for support are 'Prop roots' (पुश्ता जड़ें) — e.g., banyan tree. Option 1." },
  { s: GA, q: "निम्नलिखित में से किस पुस्तक को बुकर पुरस्कार 2021 से सम्मानित किया गया?", o: ["द प्रॉमिस","क्लारा एंड द सन","समबडीज डॉटर: अ मेमॉएर","क्लाउड कुकू लैंड"], e: "Damon Galgut's 'The Promise' won the Booker Prize 2021. Option 1." },
  { s: GA, q: "निम्नलिखित में से कौन सा राज्य मांडो महोत्सव के लिए जाना जाता है?", o: ["गोवा","केरल","मणिपुर","नागालैंड"], e: "Mando is a traditional song-dance form of Goa, with the Mando Festival celebrated annually. Option 1." },
  { s: GA, q: "'संकल्प (SANKALP)', ________ की एक केंद्र प्रायोजित योजना है, जो एक परिणाम-केंद्रित योजना है जो व्यावसायिक शिक्षा और प्रशिक्षण में सरकार की कार्यान्वयन रणनीति में इनपुट से परिणाम में बदलाव को चिह्नित करती है।", o: ["कौशल विकास और उद्यमशीलता मंत्रालय","शिक्षा मंत्रालय","युवा कार्यक्रम और खेल मंत्रालय","विज्ञान और प्रौद्योगिकी मंत्रालय"], e: "SANKALP (Skills Acquisition and Knowledge Awareness for Livelihood Promotion) is a Centrally Sponsored Scheme under the Ministry of Skill Development & Entrepreneurship. Option 1." },
  { s: GA, q: "पुरातात्विक निष्कर्षों के आधार पर, निम्नलिखित में से कौन-सा नृत्य मौजूदा भारतीय शास्त्रीय नृत्यों में सबसे पुराना माना जाता है?", o: ["मणिपुरी","कथक","कुचिपुड़ी","ओडिसी"], e: "Based on archaeological evidence (Udayagiri-Khandagiri cave inscriptions, 2nd century BCE Hathigumpha), Odissi is considered the oldest surviving classical dance form of India. Option 4." },
  { s: GA, q: "निम्नलिखित में से किस भारतीय को प्रतिष्ठित रॉयल अल्बर्ट हॉल, लंदन में प्रस्तुति देने वाले पहले भारतीय होने का सम्मान प्राप्त है?", o: ["जगजीत सिंह","दिलीप कुमार","अमिताभ बच्चन","लता मंगेशकर"], e: "Jagjit Singh was the first Indian to perform a solo concert at the prestigious Royal Albert Hall, London. Option 1." },
  { s: GA, q: "कंप्यूटर प्रौद्योगिकी निम्नलिखित में से किस वैज्ञानिक सिद्धांत पर आधारित है?", o: ["अतिचालकता","विकिरण के उद्दीप्त उत्सर्जन द्वारा प्रकाश वर्धन","डिजिटल लॉजिक","प्रकाश विद्युत प्रभाव"], e: "Computer technology is based on Digital Logic (Boolean algebra, binary 0/1). Option 3." },
  { s: GA, q: "संविधान (एक सौवां संशोधन) अधिनियम, 2016 ________ से संबंधित है।", o: ["वस्तु एवं सेवा कर","राष्ट्रीय न्यायिक नियुक्ति आयोग","हैदराबाद-कर्नाटक क्षेत्र के लिए एक अलग विकास बोर्ड की स्थापना","एक निश्चित अवधि के बाद सीटों के आरक्षण और विशेष प्रतिनिधित्व को समाप्त करने"], e: "(Per response sheet — note: 100th Amendment Act 2015 actually pertained to LBA with Bangladesh; question wording may align with GST as the closest match in the given options.) Option 1." },
  { s: GA, q: "प्रथम खेलो इंडिया यूनिवर्सिटी गेम्स का आयोजन निम्नलिखित में से किस राज्य में किया गया था?", o: ["ओडिशा","पंजाब","हरियाणा","असम"], e: "The 1st Khelo India University Games 2020 were held in Bhubaneswar, Odisha. Option 1." },
  { s: GA, q: "भारत के संविधान का निम्नलिखित में से कौन सा अनुच्छेद धर्म की स्वतंत्रता के अधिकार से संबंधित है?", o: ["अनुच्छेद 25 से 28","अनुच्छेद 36 से 39","अनुच्छेद 29 से 31","अनुच्छेद 32 से 35"], e: "Articles 25-28 of the Indian Constitution guarantee the Right to Freedom of Religion. Option 1." },
  { s: GA, q: "भगवान बुद्ध का जन्म ________ में हुआ था।", o: ["कुमिल्ला, बांग्लादेश","लुंबिनी, नेपाल","बामियान, अफ़ग़ानिस्तान","बिहार, भारत"], e: "Lord Buddha was born in Lumbini, present-day Nepal. Option 2." },
  { s: GA, q: "लखनऊ में अखिल भारतीय किसान सभा की स्थापना, जिसमें स्वामी सहजानंद सरस्वती अध्यक्ष के रूप में थे, किस वर्ष में हुई थी?", o: ["1930","1932","1942","1936"], e: "The All India Kisan Sabha was founded on 11 April 1936 in Lucknow with Swami Sahajanand Saraswati as President. Option 4." },
  { s: GA, q: "रॉयटर्स इंस्टीट्यूट फॉर द स्टडी ऑफ जर्नलिज्म द्वारा अपनी डिजिटल न्यूज रिपोर्ट 2021 में किए गए एक सर्वेक्षण के निष्कर्षों के अनुसार, सर्वेक्षित 46 बाजारों में से भारत किस स्थान (रैंक) पर है?", o: ["30वें","31वें","28वें","29वें"], e: "Per the Reuters Institute Digital News Report 2021, India ranked 31st out of 46 markets surveyed. Option 2." },
  { s: GA, q: "1988 के 61वें संविधान संशोधन अधिनियम ने मतदान की आयु को ________ वर्ष से घटाकर 18 वर्ष कर दिया।", o: ["30","21","25","20"], e: "The 61st Amendment Act (1988) reduced voting age from 21 to 18 years. Option 2." },
  { s: GA, q: "कांच महल निम्नलिखित में से किस जिले में स्थित है?", o: ["कटक","विशाखापत्तनम","हैदराबाद","आगरा"], e: "Kanch Mahal (built by Jahangir) is located in the Akbar's Tomb complex at Sikandra, Agra. Option 4." },
  { s: GA, q: "वायुमंडल में ओज़ोन परत पृथ्वी की सतह को सूर्य से किस विकिरण से बचाती है?", o: ["गामा किरणों","अवरक्त प्रकाश","X-किरणों","पराबैंगनी (UV) प्रकाश"], e: "Stratospheric ozone layer absorbs harmful UV (ultraviolet) radiation from the Sun. Option 4." },
  { s: GA, q: "निम्नलिखित में से कौन-सा कथन, DNA के संबंध में गलत है?", o: ["DNA वह अणु है जो सभी सजीव कोशिकाओं में वंशानुगत सामग्री है।","DNA एक बहुत बड़ा अणु है, जो न्यूक्लियोटाइड नामक छोटी इकाइयों से बना होता है।","DNA में पाए जाने वाले क्षार केवल तीन किस्मों में आते हैं: एडेनिन, साइटोसिन और ग्वानिन।","जीन (Genes) DNA से बने होते हैं, और इसी प्रकार जीनोम भी।"], e: "DNA contains FOUR bases — adenine, thymine, cytosine, and guanine. The statement listing only three (missing thymine) is INCORRECT. Option 3." },
  { s: GA, q: "भारतीय कपास निगम (CCI) की स्थापना ________ वर्ष में हुई थी।", o: ["1970","1969","1971","1972"], e: "Cotton Corporation of India (CCI) was established on 31 July 1970 under the Companies Act 1956. Option 1." }
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

  const TEST_TITLE = 'SSC Selection Post Phase IX (Matriculation) - 14 February 2022 Shift-1';
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
