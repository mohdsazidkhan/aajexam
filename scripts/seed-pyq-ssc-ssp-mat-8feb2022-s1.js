/**
 * Seed: SSC Selection Post Phase IX 2021 (Matriculation Level) PYQ - 8 February 2022, Shift-1 (100 questions)
 * Source: SSC official response sheet (PDF + docx). Hindi recovered via docx-XML parse.
 * All image questions (REA Q18, Q19, Q23 + all QA Q1-Q25) sourced directly from docx-embedded media.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-8feb2022-s1.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_feb08_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-8feb2022-s1';

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

const F = '08-feb-2022-s1';

const IMAGE_MAP = {
  // REA image questions
  18: { q: 'image7.jpeg', opts: ['image8.jpeg','image9.jpeg','image10.jpeg','image11.jpeg'] },
  19: { q: 'image12.jpeg', opts: ['image13.png','image14.png','image15.png','image16.png'] },
  23: { q: 'image17.jpeg', opts: ['image18.png','image19.png','image20.png','image21.png'] },

  // QA Q51-Q75 — all image-based
  51: { q: 'image22.jpeg', opts: ['image23.jpeg','image24.jpeg','image25.jpeg','image26.jpeg'] },
  52: { q: 'image27.jpeg', opts: ['image28.png','image29.png','image30.png','image31.png'] },
  53: { q: 'image32.jpeg', opts: ['image33.jpeg','image34.jpeg','image35.jpeg','image36.jpeg'] },
  54: { q: 'image37.jpeg', opts: ['image38.jpeg','image39.jpeg','image40.jpeg','image41.jpeg'] },
  55: { q: 'image42.jpeg', opts: ['image43.jpeg','image44.jpeg','image45.jpeg','image46.jpeg'] },
  56: { q: 'image47.jpeg', opts: ['image48.jpeg','image49.jpeg','image50.jpeg','image51.jpeg'] },
  57: { q: 'image52.jpeg', opts: ['image53.jpeg','image54.jpeg','image55.jpeg','image56.jpeg'] },
  58: { q: 'image57.jpeg', opts: ['image58.jpeg','image59.jpeg','image60.jpeg','image61.jpeg'] },
  59: { q: 'image62.jpeg', opts: ['image63.jpeg','image64.jpeg','image65.png','image66.png'] },
  60: { q: 'image67.jpeg', opts: ['image68.jpeg','image69.jpeg','image70.jpeg','image71.jpeg'] },
  61: { q: 'image72.jpeg', opts: ['image73.jpeg','image74.jpeg','image75.jpeg','image76.jpeg'] },
  62: { q: 'image77.jpeg', opts: ['image78.jpeg','image79.jpeg','image80.jpeg','image81.jpeg'] },
  63: { q: 'image82.jpeg', opts: ['image83.jpeg','image84.jpeg','image85.jpeg','image86.jpeg'] },
  64: { q: 'image87.jpeg', opts: ['image88.jpeg','image89.jpeg','image90.jpeg','image91.jpeg'] },
  65: { q: 'image92.jpeg', opts: ['image93.jpeg','image94.jpeg','image95.jpeg','image96.jpeg'] },
  66: { q: 'image97.jpeg', opts: ['image98.png','image99.jpeg','image100.jpeg','image101.jpeg'] },
  67: { q: 'image102.jpeg', opts: ['image103.jpeg','image104.jpeg','image105.jpeg','image106.jpeg'] },
  68: { q: 'image107.jpeg', opts: ['image108.jpeg','image109.jpeg','image110.jpeg','image111.jpeg'] },
  69: { q: 'image112.jpeg', opts: ['image113.jpeg','image114.jpeg','image115.jpeg','image116.jpeg'] },
  70: { q: 'image117.jpeg', opts: ['image118.jpeg','image119.jpeg','image120.jpeg','image121.jpeg'] },
  71: { q: 'image122.jpeg', opts: ['image123.jpeg','image124.jpeg','image125.jpeg','image126.jpeg'] },
  72: { q: 'image127.jpeg', opts: ['image128.jpeg','image129.jpeg','image130.jpeg','image131.jpeg'] },
  73: { q: 'image132.jpeg', opts: ['image133.jpeg','image134.jpeg','image135.jpeg','image136.jpeg'] },
  74: { q: 'image137.jpeg', opts: ['image138.jpeg','image139.jpeg','image140.jpeg','image141.jpeg'] },
  75: { q: 'image142.jpeg', opts: ['image143.jpeg','image144.jpeg','image145.jpeg','image146.jpeg'] }
};

// 1-based answer key.
const KEY = [
  // 1-25 General Intelligence
  1, 1, 3, 4, 4,   3, 2, 4, 4, 2,   3, 3, 4, 4, 1,   4, 1, 1, 2, 2,   1, 4, 2, 4, 3,
  // 26-50 English Language
  3, 4, 1, 2, 1,   4, 4, 2, 4, 3,   2, 3, 3, 3, 4,   1, 1, 2, 1, 3,   2, 1, 4, 3, 3,
  // 51-75 Quantitative Aptitude — image-based
  2, 4, 4, 4, 3,   4, 4, 1, 3, 2,   2, 4, 2, 1, 2,   4, 1, 1, 3, 4,   4, 2, 4, 4, 3,
  // 76-100 General Awareness
  1, 2, 3, 4, 2,   3, 3, 1, 1, 1,   1, 3, 1, 3, 3,   2, 1, 3, 2, 2,   2, 4, 4, 2, 1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "उस सही विकल्प का चयन कीजिए, जो दिए गए शब्दों के उस क्रम को दर्शाता है, जिस क्रम में वे अंग्रेज़ी शब्दकोश में मौजूद होते हैं।\n\n1. INTRUSION  2. INTRODUCE  3. INTRODUCTORY  4. INTROVERT  5. INTRODUCTION", o: ["2, 5, 3, 4, 1","3, 5, 1, 4, 2","2, 5, 1, 4, 3","2, 5, 1, 3, 4"], e: "Dictionary order: INTRODUCE(2) < INTRODUCTION(5) < INTRODUCTORY(3) < INTROVERT(4) < INTRUSION(1) → 2,5,3,4,1. Option 1." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'ACUMEN' को 'QBPRFX' के रूप में लिखा जाता है। उसी भाषा में 'CENSURE' को किस रूप में लिखा जाएगा?", o: ["HOXPQBF","CORPKBZ","CURVKHZ","HUXVQHF"], e: "Per response sheet, option 1 (HOXPQBF)." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'QUIET' को '70' के रूप में कूटबद्ध किया जाता है और 'TREND' को '57' के रूप में कूटबद्ध किया जाता है। उसी भाषा में 'TROUBLE' को किस रूप में कूटबद्ध किया जाएगा?", o: ["95","93","89","91"], e: "Per response sheet, option 3 (89)." },
  { s: REA, q: "उस विकल्प का चयन कीजिए, जिसका तीसरे अक्षर-समूह से वही संबंध है, जो दूसरे अक्षर-समूह का पहले अक्षर-समूह से है।\n\nNGO : PTQ :: LHT : ?", o: ["NJV","OJG","OSG","NSV"], e: "Per response sheet, option 4 (NSV)." },
  { s: REA, q: "दिए गए विकल्पों में से उस अक्षर-समूह का चयन कीजिए, जो निम्नलिखित श्रृंखला में चिह्न (?) के स्थान पर आ सकता है।\n\nCZP, HWQ, MTR, RQS, ?", o: ["XNT","WMS","YMS","WNT"], e: "1st letter: +5 (C→H→M→R→W). 2nd: −3 (Z→W→T→Q→N). 3rd: +1 (P→Q→R→S→T). Next = WNT. Option 4." },
  { s: REA, q: "उस विकल्प का चयन कीजिए जो तीसरी संख्या से उसी प्रकार संबंधित है जिस प्रकार दूसरी संख्या पहली संख्या से संबंधित है और छठी संख्या पाँचवीं संख्या से संबंधित है।\n\n12 : 153 :: 17 : ? :: 14 : 205", o: ["268","329","298","292"], e: "Pattern: n² + 9. 12²+9=153 ✓. 14²+9=205 ✓. 17²+9=289+9=298. Option 3." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'EAGER' को '167533' के रूप में कूटबद्ध किया जाता है। उसी भाषा में 'EPITOME' को किस रूप में कूटबद्ध किया जाएगा?", o: ["31513227183","31113188143","71517228187","71117187147"], e: "Best guess per coding pattern (unanswered in response sheet) — option 2." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़िए।\n\nकथन:\nकुछ बतख बिल्लियाँ हैं। सभी बिल्लियाँ चूहे हैं।\n\nनिष्कर्ष:\nI. सभी चूहे बतख हैं।\nII. कोई चूहा बतख नहीं है।", o: ["केवल निष्कर्ष II पालन करता है।","केवल निष्कर्ष I पालन करता है।","निष्कर्ष I और II दोनों ही पालन करते हैं।","न तो निष्कर्ष I और न ही II पालन करता है।"], e: "Some ducks are cats + all cats are mice ⇒ some mice are ducks. I (all mice are ducks) is too strong; II (no mouse is duck) contradicts derivation. Neither follows. Option 4." },
  { s: REA, q: "'A % B' का अर्थ है कि 'A, B का बेटा है'। 'A $ B' का अर्थ है कि 'A, B का भाई है'। 'A + B' का अर्थ है कि 'A, B की बहन है'।\n\nयदि N + T $ K % M % Y है, तो N का Y से क्या संबंध है?", o: ["नाती","बेटी","बहन","पोती"], e: "N is T's sister; T is K's brother; K is M's son; M is Y's son. So Y is M's parent, M is K's parent, K's siblings = T and N. So N is M's daughter = Y's granddaughter (पोती). Option 4." },
  { s: REA, q: "पाँच मित्र A, B, C, D और E एक वृत्त के परितः केंद्र की ओर मुख करके बैठे हैं। B, A के दाईं ओर दूसरे स्थान पर बैठा है। B और D के बीच में केवल C बैठा है।\n\nA के बाईं ओर ठीक बगल में कौन बैठा है?", o: ["C","D","B","E"], e: "Clockwise: A, E, B, C, D. A's anticlockwise neighbour (left, facing centre) = D. Option 2." },
  { s: REA, q: "रेखा मुकेश की इकलौती पुत्री है। कपिल रेखा का भाई है। स्नेहा कपिल की माँ हैं।\n\nरेखा का स्नेहा से क्या संबंध है?", o: ["बहन","चाची","पुत्री","माँ"], e: "Sneha is Kapil's mother = Rekha's mother. So Rekha is Sneha's daughter (पुत्री). Option 3." },
  { s: REA, q: "अक्षरों के उस संयोजन का चयन कीजिए जो दी गई श्रृंखला के रिक्त स्थानों में क्रमानुसार रखे जाने पर श्रृंखला को पूर्ण करेगा।\n\nz _ k _ c q t _ u _ p c _ _ z u _ _ c q t", o: ["q p z k z t k p","u p z k z t k u","u p z k q t k p","u p z k u t k q"], e: "Per response sheet, option 3 (u p z k q t k p)." },
  { s: REA, q: "छह व्यक्ति P, Q, R, S, T और U एक सीधी बेंच पर पूर्व की ओर मुख करके बैठे हैं। P और Q के बीच केवल दो व्यक्ति बैठे हैं। P के बाईं स्थान पर केवल S बैठा है। T और U के बीच में केवल Q बैठा है। U दायें सिरे पर बैठा है।\n\nबाएँ सिरे से तीसरे स्थान पर कौन बैठा है?", o: ["T","U","Q","R"], e: "Arrangement: S, P, R, T, Q, U. 3rd from left = R. Option 4." },
  { s: REA, q: "चार अक्षर-समूह दिए गए हैं, जिनमें से तीन किसी तरह से संगत हैं और एक असंगत है। उस अक्षर-समूह का चयन कीजिए, जो अन्य से असंगत है।", o: ["GBI","CHG","AJG","GBK"], e: "Per response sheet, option 4 (GBK)." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'per piece rate' को 'uot eot kot' के रूप में लिखा जाता है, 'per capita income' को 'zot yot uot' के रूप में लिखा जाता है, और 'income is necessary' को 'mot zot sot' के रूप में लिखा जाता है। इसी भाषा में, 'capita' शब्द के लिए क्या कूट होगा?", o: ["yot","sot","zot","uot"], e: "'per' = uot (common in sets 1&2); 'income' = zot (common in sets 2&3). Remaining in set 2: capita = yot. Option 1." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए, जो निम्नलिखित श्रेणी में चिह्न (?) के स्थान पर आ सकती है।\n\n23, 24, 32, 59, ?, 248", o: ["79","120","76","123"], e: "Differences are cubes: 1³=1, 2³=8, 3³=27, 4³=64, 5³=125. 59+64=123. Option 4." },
  { s: REA, q: "दिए गए समीकरण को सही करने के लिए किन दो चिह्नों को आपस में बदला जाना चाहिए?\n\n72 − 63 + 3 × 4 ÷ 49 = 37", o: ["+ और ÷","÷ और ×","− और ×","− और +"], e: "Swap '+' and '÷': 72 − 63 ÷ 3 × 4 + 49 = 72 − 84 + 49 = 37 ✓. Option 1." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए, जो निम्नलिखित श्रेणी में चिह्न (?) के स्थान पर आ सकती है।\n\n27, 54, 162, 648, ?", o: ["728","3240","1944","1296"], e: "Pattern: ×2, ×3, ×4, ×5. 648 × 5 = 3240. Option 2." },
  { s: REA, q: "'महंगा' का 'सस्ता' से वही संबंध है, जो 'साँझ' का '________' से है।", o: ["भोर","चमकीला","रात्रि","मेज़"], e: "Mahanga:Sasta are antonyms. Saanjh (evening) → antonym Bhor (dawn). Option 1." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'PUNE' को 20 और 'DELHI' को 25 लिखा जाता है। उसी कूट भाषा में 'BHOPAL' को किस प्रकार लिखा जाएगा?", o: ["36","32","40","30"], e: "Code = (number of letters) × 5. PUNE=4×5=20 ✓. DELHI=5×5=25 ✓. BHOPAL=6×5=30. Option 4." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़िए।\n\nकथन:\nकुछ वाहन, हेलीकॉप्टर हैं। सभी हेलीकॉप्टर, कारें हैं। कुछ कारें, ट्रक हैं।\n\nनिष्कर्ष:\nI. कुछ वाहन, कारें हैं।\nII. कुछ ट्रक, वाहन हैं।\nIII. कुछ कारें, हेलिकॉप्टर हैं।", o: ["केवल निष्कर्ष I और II अनुसरण करते हैं","केवल निष्कर्ष II और III अनुसरण करते हैं","कोई भी निष्कर्ष अनुसरण नहीं करता है","केवल निष्कर्ष I और III अनुसरण करते हैं"], e: "Some vehicles→helicopters→cars ⇒ some vehicles are cars (I ✓). All helicopters→cars ⇒ some cars are helicopters (III ✓). II not derivable (trucks-vehicles link unclear). Option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'MAGIC' को 'RVLDH' के रूप में लिखा जाता है। उसी भाषा में 'LOCKER' को किस रूप में लिखा जाएगा?", o: ["GHTZFW","GTHFZW","QJHFJM","QJXPJM"], e: "Pattern: alternating +5, −5. M+5=R, A−5=V, G+5=L, I−5=D, C+5=H ✓. LOCKER: L+5=Q, O−5=J, C+5=H, K−5=F, E+5=J, R−5=M → QJHFJM. Option 3." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nPious", o: ["Wise","Wicked","Religious","Active"], e: "'Pious' = devoutly religious. Option 3." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nRejoice", o: ["Conceal","Grieve","Brood","Exult"], e: "'Rejoice' = feel great joy / exult. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe fruit of a tree are either dry or fleshy and there are many different ways in which the seeds ________.", o: ["propagate","calculate","stimulate","hibernate"], e: "'Seeds propagate' (reproduce / disperse) — Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nAccept", o: ["Attain","Deny","Take","Welcome"], e: "'Accept' (receive willingly) — antonym 'Deny' (refuse). Option 2." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nNo love lost", o: ["Persons who do not like each other at all","Persons who have similar likes and dislikes","Persons who work in the same organisation","Persons who love the same person"], e: "'No love lost' = mutual dislike. Option 1." },
  { s: ENG, q: "Select the option which means the same as the group of words given.\n\nTo have a strong feeling of sympathy with a desire to help.", o: ["Gratitude","Apathy","Brutality","Compassion"], e: "'Compassion' = sympathetic concern with a desire to help. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe farmers in this village ________ their fields with water from the river.", o: ["soak","flush","flood","irrigate"], e: "'Irrigate fields' is the standard agricultural collocation. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nMother said to Navin, \"Board the train now.\"", o: ["Mother told Navin boarded the train now.","Mother told Navin to board the train then.","Mother told Navin board the train then.","Mother told Navin to board the train now."], e: "Imperative direct → indirect with 'told … to + verb'. 'now' → 'then'. Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA place where pigs are kept.", o: ["Kennel","Stable","Shed","Sty"], e: "'Sty' = a pen for pigs. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nPeople are continuously watching the election results.", o: ["The election results will continuously be watched by people.","The election results were watched continuously by people.","The election results are continuously being watched by people.","The election results is continuously watching by people."], e: "Present continuous active → present continuous passive 'are being watched'. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nBoycott", o: ["Exclude","Welcome","Spurn","Bar"], e: "'Boycott' (refuse / exclude) — antonym 'Welcome'. Option 2." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nBy and large", o: ["On the contrary","Surely","On the whole","At some future time"], e: "'By and large' = on the whole / generally. Option 3." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Perceive","Deceive","Foriegn","Achieve"], e: "'Foriegn' is misspelled — correct is 'Foreign'. Option 3." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["spelling","automatic","atendent","convenience"], e: "'atendent' is misspelled — correct is 'attendant'. Option 3." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["Shortfall","Parallel","Acceptable","Humbely"], e: "'Humbely' is misspelled — correct is 'Humbly'. Option 4." },
  { s: ENG, q: "In the passage about the Dalai Lama, fill in blank No. 1.\n\n'The Dalai Lama was born in Tibet (1)________ the 6th of July 1935.'", o: ["on","at","to","in"], e: "Specific date → preposition 'on'. Option 1." },
  { s: ENG, q: "In the passage about the Dalai Lama, fill in blank No. 2.\n\n'He is the leader of Tibet's Buddhists (2)________ he lives in India…'", o: ["but","or","because","so"], e: "Contrast — 'but'. Option 1." },
  { s: ENG, q: "In the passage about the Dalai Lama, fill in blank No. 3.\n\n'…where thousands of his followers (3)________ him.'", o: ["call","visit","tour","drop"], e: "'Followers visit him' — natural collocation. Option 2." },
  { s: ENG, q: "In the passage about the Dalai Lama, fill in blank No. 4.\n\n'He is the world's (4)________ Buddhist monk.'", o: ["most famous","as famous","much famous","more famous"], e: "Superlative — 'most famous'. Option 1." },
  { s: ENG, q: "In the passage about the Dalai Lama, fill in blank No. 5.\n\n'He (5)________ for freedom in Tibet and peace in the world.'", o: ["campaigning","campaign","campaigns","to campaign"], e: "Singular subject 'He' takes 'campaigns' (present simple). Option 3." },
  { s: ENG, q: "Read the passage on Homeschooling.\n\nParents are opting for home schooling because it ________.", o: ["consists of educational tours to all metropolitan cities","has a more flexible curriculum and is more engaging","because they have set up their own independent board","gives the child the right to choose one parent as educator"], e: "Per passage: homeschooling has flexible curriculum + addresses child's needs. Option 2." },
  { s: ENG, q: "Read the passage on Homeschooling.\n\nIn home schooling the charge of education is in the hands of the:", o: ["parent","learner","neighbour","teacher"], e: "Per passage: 'puts the parents/guardians in charge'. Option 1." },
  { s: ENG, q: "Read the passage on Homeschooling.\n\nSelect the untrue option.\n\nParents of home schooling pull their children out of school so their children could ________.", o: ["be in charge of their learning","explore their own interests","enjoy the process of learning","excel in board examinations"], e: "Homeschooling often does NOT follow a board curriculum — 'excel in board examinations' is NOT a homeschooling motive. Option 4." },
  { s: ENG, q: "Read the passage on Homeschooling.\n\nSelect the untrue option.\n\nParents prefer home schooling because their children ________.", o: ["are able to study at their own pace","do not fear being bullied or abused","are only interested in nonacademic careers","usually find learning exciting and different"], e: "'Only interested in nonacademic careers' overstates — passage mentions careers outside academics as ONE reason among many. Option 3." },
  { s: ENG, q: "Read the passage on Homeschooling.\n\nMany parents today, like Sharadha Gerg, believe that the education system must ________.", o: ["focus on the study of academic subjects","give parents the right to co teach with teachers","provide for an all-round development","be based on discipline and training"], e: "Per passage: 'giving them an all-round education through home schooling, was the ideal way'. Option 3." },

  // ============ Quantitative Aptitude (51-75) — all image-based ============
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "निम्नलिखित में से किस राज्य में 2021 में विधानसभा चुनाव नहीं हुए थे?", o: ["त्रिपुरा","पश्चिम बंगाल","असम","केरल"], e: "2021 state elections: WB, TN, Kerala, Assam, Puducherry. Tripura did NOT have elections in 2021 (its term: 2018-2023). Option 1." },
  { s: GA, q: "काकोरी ट्रेन कांड के समय भारत का वायसराय निम्नलिखित में से कौन था?", o: ["लॉर्ड चेम्सफोर्ड","लॉर्ड रीडिंग","लॉर्ड हार्डिंग II","लॉर्ड इरविन"], e: "Kakori conspiracy (9 August 1925) — Viceroy was Lord Reading (1921-26). Option 2." },
  { s: GA, q: "बेंगलुरु में भारत का पहला सेंट्रली एयर कंडीशनर रेलवे टर्मिनल, जो मार्च 2021 में चर्चा में था, उसका नाम इनमें से किसके नाम पर रखा गया है?", o: ["सतीश धवन","ए.पी.जे. अब्दुल कलाम","एम. विश्वेश्वरैया","वर्गीज़ कुरियन"], e: "Sir M. Visvesvaraya Terminal in Baiyappanahalli, Bengaluru — India's first centrally air-conditioned railway terminal (opened June 2022, named after the engineer). Option 3." },
  { s: GA, q: "निम्नलिखित में से कौन बाएँ हाथ का ऑर्थोडॉक्स स्पिन गेंदबाज है?", o: ["रविचंद्रन अश्विन","युजवेंद्र चहल","उमेश यादव","अक्षर पटेल"], e: "Axar Patel is a left-arm orthodox spin bowler. Ashwin/Chahal are right-arm; Umesh is fast bowler. Option 4." },
  { s: GA, q: "निम्नलिखित में से कौन 'An Era of Darkness: The British Empire in India' नामक पुस्तक के लेखक हैं?", o: ["अमिताभ घोष","शशि थरूर","किरण देसाई","मनमोहन सिंह"], e: "'An Era of Darkness' (2016) is by Shashi Tharoor. Option 2." },
  { s: GA, q: "निम्नलिखित में से कौन सा सार्वजनिक माल (Public Goods) की श्रेणी में नहीं आता है?", o: ["सरकार प्रशासन","सड़कें","कारें","राष्ट्रीय सुरक्षा"], e: "Cars are PRIVATE goods (excludable, rival). Govt admin, roads, national security are public goods. Option 3." },
  { s: GA, q: "व्यापार और वाणिज्य विशेषता वाले कस्बों और शहरों को ________ शहर/कस्बा कहा जाता है।", o: ["खनन","औद्योगिक","वाणिज्यिक","प्रशासनिक"], e: "Towns specialising in trade/commerce are called 'Commercial towns' (वाणिज्यिक). Option 3." },
  { s: GA, q: "लाहौर में शालीमार (Shalamar) उद्यान किसके द्वारा निर्मित करवाए गए थे?", o: ["शाहजहाँ","अकबर","जहांदार शाह","जहाँगीर"], e: "The Shalimar Gardens in Lahore were built by Mughal emperor Shah Jahan in 1641-42. Option 1." },
  { s: GA, q: "निम्नलिखित में से किस स्मारक की संरचना ताजमहल के समान है?", o: ["हुमायूँ का मकबरा","पंचमहल","बुलंद दरवाजा","चारमीनार"], e: "Humayun's Tomb in Delhi was the architectural precursor to the Taj Mahal — similar Persian-influenced design. Option 1." },
  { s: GA, q: "कोंकण रेलवे निम्नलिखित में से किस पर्वत श्रृंखला से होकर गुजरती है?", o: ["पश्चिमी घाट","विंध्य पर्वतमाला","सतपुड़ा पर्वतमाला","पूर्वी घाट"], e: "Konkan Railway runs along India's western coast through the Western Ghats. Option 1." },
  { s: GA, q: "सितंबर 2021 तक, ________ बाहरी देशों में SBI बैंक के 229 कार्यालय हैं।", o: ["31","43","19","23"], e: "SBI had 229 foreign offices spread across 31 countries (as of Sept 2021). Option 1." },
  { s: GA, q: "सितंबर 2021 में, नीरज चोपड़ा को इनमें से किस ब्रांड के लिए ब्रांड एंबेसडर नियुक्त किया गया था?", o: ["कैशिफाई","मिंत्रा","टाटा एआईए लाइफ इंश्योरेंस","फ्लिपकार्ट"], e: "Neeraj Chopra was signed as brand ambassador for Tata AIA Life Insurance in September 2021. Option 3." },
  { s: GA, q: "फॉस्फोरिक अम्ल के एक अणु में कितने हाइड्रोजन परमाणु होते हैं?", o: ["3","2","1","4"], e: "Phosphoric acid H₃PO₄ has 3 hydrogen atoms per molecule. Option 1." },
  { s: GA, q: "निम्नलिखित में से किसे सितंबर 2021 में फेसबुक इंडिया द्वारा सार्वजनिक नीति निदेशक (Director of Public Policy) के रूप में नियुक्त किया गया था?", o: ["राजेश बिंदा","मुरली नटराजन","राजीव अग्रवाल","अंखी दास"], e: "Rajiv Aggarwal was appointed Director of Public Policy at Facebook India in September 2021. Option 3." },
  { s: GA, q: "सितंबर 2021 में, इनमें से किस राज्य में उस राज्य के पहले और भारत के 61वें सॉफ्टवेयर प्रौद्योगिकी पार्क का उद्घाटन हुआ था?", o: ["सिक्किम","त्रिपुरा","नागालैंड","असम"], e: "STPI Kohima — Nagaland's first and India's 61st Software Technology Park, inaugurated Sept 2021. Option 3." },
  { s: GA, q: "निम्नलिखित में से कौन सा हड़प्पा स्थल वर्तमान पाकिस्तान में स्थित नहीं है?", o: ["अमरी","कालीबंगा","बालाकोट","कोट डीजी"], e: "Kalibangan is in Rajasthan, India. Amri, Balakot, Kot Diji are all in Pakistan. Option 2." },
  { s: GA, q: "1 kg द्रव्यमान वाली वस्तु का भार लगभग ________ न्यूटन (newton) के बराबर होता है।", o: ["10","100","1000","1"], e: "1 kg × g (≈9.8 m/s²) ≈ 10 N. Option 1." },
  { s: GA, q: "Which of the following is the first step in drinking water treatment?", o: ["Sedimentation and Clarification","Disinfection","Coagulation and Flocculation","Filtration"], e: "First step in water treatment: Coagulation and Flocculation (adding chemicals to clump particles). Followed by sedimentation, filtration, disinfection. Option 3." },
  { s: GA, q: "2021 में आयोजित हुए ग्रीष्मकालीन ओलंपिक 2020 के दौरान निम्नलिखित में से किस प्रतियोगिता में कोई रजत पदक विजेता नहीं था?", o: ["पुरुषों की लंबी कूद","महिलाओं की ऊँची कूद","महिलाओं की लंबी कूद","पुरुषों की ऊँची कूद"], e: "At Tokyo 2020, the Men's High Jump ended in a tie for gold (Tamberi/Barshim) so no silver was awarded. Option 4." },
  { s: GA, q: "भारतीय संविधान के अनुसार, जनगणना अधिनियम, 1948 के प्रावधानों के तहत जनगणना आयोजित की जाती है, और यह आँकड़ा प्रत्येक ________ वर्ष में एकत्र किया जाता है।", o: ["5","10","15","12"], e: "Indian Census is conducted every 10 years (decennial). Option 2." },
  { s: GA, q: "भारतीय संविधान के 69वें संशोधन अधिनियम के अनुसार, निम्न में से किस वर्ष दिल्ली को राष्ट्रीय राजधानी क्षेत्र घोषित किया गया था?", o: ["1985","1991","1978","2004"], e: "The 69th Constitutional Amendment Act, 1991 declared Delhi as the National Capital Territory (NCT). Option 2." },
  { s: GA, q: "कौटिल्य के 'अर्थशास्त्र' में कितने तीर्थों का उल्लेख है?", o: ["32","13","25","18"], e: "Kautilya's Arthashastra mentions 18 Tirthas (high-ranking ministerial positions). Option 4." },
  { s: GA, q: "संसद का गठन, भारतीय संविधान के अनुच्छेद ________ के दायरे में आता है।", o: ["78","77","80","79"], e: "Article 79 of the Constitution provides for the constitution of Parliament. Option 4." },
  { s: GA, q: "झारखंड के निम्न में से किस आदिवासी फसल उत्सव (Harvest festival) की तिथि सर्दियों के दौरान पौष माह के अंतिम दिन होती है?", o: ["बांदना","टुसू","रोहिणी","करम"], e: "Tusu Parab is a Jharkhand harvest festival celebrated on the last day of Paush (around 14-15 January). Option 2." },
  { s: GA, q: "सितंबर 2021 में, निम्न में से किसे वाणिज्य और उद्योग मंत्रालय के अधीन कार्यरत उद्योग संवर्धन एवं आंतरिक व्यापार विभाग (DPIIT) का सचिव नियुक्त किया गया था?", o: ["अनुराग जैन","के. संजय मूर्ति","गोविंद मोहन","प्रदीप सिंह"], e: "Anurag Jain was appointed DPIIT Secretary in September 2021. Option 1." }
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

  const TEST_TITLE = 'SSC Selection Post Phase IX (Matriculation) - 8 February 2022 Shift-1';
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
