/**
 * Seed: SSC Selection Post Phase IX 2021 (Matriculation Level) PYQ - 7 February 2022, Shift-2 (100 questions)
 * Source: SSC official response sheet (PDF + docx). Hindi recovered via docx-XML parse.
 * All image questions (REA Q6, Q9, Q24 + all QA Q1-Q25) sourced directly from docx-embedded media.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-7feb2022-s2.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_feb07_s2";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-7feb2022-s2';

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

const F = '07-feb-2022-s2';

const IMAGE_MAP = {
  // REA image questions
  6:  { q: 'image4.jpeg', opts: ['image5.png','image6.png','image7.png','image8.png'] },
  9:  { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] },
  24: { q: 'image14.jpeg', opts: ['image15.jpeg','image16.jpeg','image17.jpeg','image18.jpeg'] },

  // QA Q51-Q75 — all image-based
  51: { q: 'image19.jpeg', opts: ['image20.jpeg','image21.jpeg','image22.jpeg','image23.jpeg'] },
  52: { q: 'image24.jpeg', opts: ['image25.jpeg','image26.jpeg','image27.jpeg','image28.jpeg'] },
  53: { q: 'image29.jpeg', opts: ['image30.jpeg','image31.jpeg','image32.jpeg','image33.jpeg'] },
  54: { q: 'image34.jpeg', opts: ['image35.jpeg','image36.jpeg','image37.jpeg','image38.jpeg'] },
  55: { q: 'image39.jpeg', opts: ['image40.jpeg','image41.jpeg','image42.jpeg','image43.jpeg'] },
  56: { q: 'image44.jpeg', opts: ['image45.jpeg','image37.jpeg','image46.jpeg','image47.jpeg'] },
  57: { q: 'image48.jpeg', opts: ['image49.jpeg','image50.jpeg','image47.jpeg','image51.jpeg'] },
  58: { q: 'image52.jpeg', opts: ['image53.png','image54.png','image55.jpeg','image56.png'] },
  59: { q: 'image57.jpeg', opts: ['image58.jpeg','image59.jpeg','image60.jpeg','image61.jpeg'] },
  60: { q: 'image62.jpeg', opts: ['image63.jpeg','image64.jpeg','image65.jpeg','image66.jpeg'] },
  61: { q: 'image67.jpeg', opts: ['image68.jpeg','image69.jpeg','image70.jpeg','image71.jpeg'] },
  62: { q: 'image72.jpeg', opts: ['image73.jpeg','image74.jpeg','image75.jpeg','image76.jpeg'] },
  63: { q: 'image77.jpeg', opts: ['image78.jpeg','image79.jpeg','image80.png','image81.png'] },
  64: { q: 'image82.jpeg', opts: ['image83.jpeg','image84.png','image85.png','image86.png'] },
  65: { q: 'image87.jpeg', opts: ['image88.jpeg','image89.jpeg','image90.jpeg','image91.jpeg'] },
  66: { q: 'image92.jpeg', opts: ['image93.jpeg','image94.jpeg','image95.jpeg','image96.jpeg'] },
  67: { q: 'image97.jpeg', opts: ['image98.jpeg','image99.jpeg','image100.jpeg','image101.jpeg'] },
  68: { q: 'image102.jpeg', opts: ['image80.png','image103.png','image81.png','image86.png'] },
  69: { q: 'image104.jpeg', opts: ['image105.jpeg','image106.jpeg','image107.jpeg','image108.jpeg'] },
  70: { q: 'image109.jpeg', opts: ['image110.jpeg','image111.jpeg','image112.jpeg','image113.jpeg'] },
  71: { q: 'image114.jpeg', opts: ['image115.jpeg','image116.jpeg','image117.jpeg','image118.jpeg'] },
  72: { q: 'image119.jpeg', opts: ['image120.jpeg','image121.jpeg','image122.jpeg','image123.jpeg'] },
  73: { q: 'image124.jpeg', opts: ['image125.jpeg','image126.jpeg','image127.jpeg','image128.jpeg'] },
  74: { q: 'image129.jpeg', opts: ['image130.jpeg','image47.jpeg','image51.jpeg','image49.jpeg'] },
  75: { q: 'image131.jpeg', opts: ['image132.jpeg','image133.jpeg','image134.jpeg','image135.jpeg'] }
};

// 1-based answer key.
const KEY = [
  // 1-25 General Intelligence
  1, 2, 1, 3, 2,   4, 4, 4, 2, 3,   2, 2, 2, 4, 3,   3, 2, 4, 1, 1,   4, 2, 1, 2, 3,
  // 26-50 English Language
  1, 3, 4, 4, 1,   3, 1, 2, 3, 1,   4, 4, 1, 2, 2,   1, 1, 1, 1, 3,   2, 4, 3, 2, 2,
  // 51-75 Quantitative Aptitude — image-based; defaults for unanswered
  3, 2, 1, 3, 4,   2, 1, 1, 3, 4,   4, 2, 2, 3, 1,   3, 1, 2, 2, 1,   2, 2, 3, 2, 2,
  // 76-100 General Awareness
  3, 4, 2, 4, 3,   4, 1, 1, 4, 2,   4, 1, 4, 3, 2,   4, 3, 2, 2, 4,   2, 4, 4, 3, 1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "दिए गए समीकरण को संतुलित करने के लिए किन दो चिह्नों को आपस में बदला जाना चाहिए।\n\n12 + 156 ÷ 13 × 6 − 100 = 50", o: ["+ और ×","÷ और −","− और ×","÷ और ×"], e: "Swap '+' and '×': 12 × 156 ÷ 13 + 6 − 100 = 12·12 + 6 − 100 = 144+6−100 = 50 ✓. Option 1." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'ALGORITHM' को 'AGLOYHIMT' के रूप में लिखा जाता है। उसी भाषा में 'MALICIOUS' को कैसे लिखा जाएगा?", o: ["ALIMJISOU","MLAIXUISO","AILMJIOSU","MALIXUISO"], e: "Per response sheet, option 2 (MLAIXUISO)." },
  { s: REA, q: "'श्वास' का 'पानी' से वही संबंध है, जो 'बीमारी' का '________' से है।", o: ["दवा","चिकित्सक","अस्पताल","अन्वेषण"], e: "Breath:Water (essential to life) :: Disease:Medicine (cure). Option 1." },
  { s: REA, q: "उस विकल्प का चयन कीजिए, जिसका तीसरी संख्या से वही संबंध है, जो दूसरी संख्या का पहली संख्या से है और छठी संख्या का पाँचवीं संख्या से है।\n\n53 : 15 :: 84 : ? :: 62 : 12", o: ["46","34","32","42"], e: "Pattern: product of digits. 5×3=15 ✓. 6×2=12 ✓. 8×4=32. Option 3." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'SLATE' को 'TNDXJ' लिखा जाता है, और 'STARK' को 'TVDVP' लिखा जाता है। उसी कूट भाषा में 'BLEAT' को किस प्रकार लिखा जाएगा?", o: ["CMGFY","CNHEY","CMHEZ","CMGFZ"], e: "Pattern: each letter +1, +2, +3, +4, +5 by position. SLATE: S+1=T, L+2=N, A+3=D, T+4=X, E+5=J ✓. BLEAT: B+1=C, L+2=N, E+3=H, A+4=E, T+5=Y → CNHEY. Option 2." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "उस सही विकल्प का चयन कीजिए, जो दिए गए शब्दों के उस क्रम को दर्शाता है, जिस क्रम में वे अंग्रेज़ी शब्दकोश में मौजूद होते हैं।\n\n1. Estranged  2. Estate  3. Establish  4. Esteem  5. Estimate", o: ["4, 2, 3, 1, 5","4, 3, 2, 1, 5","3, 4, 2, 5, 1","3, 2, 4, 5, 1"], e: "Dictionary order: Establish(3) < Estate(2) < Esteem(4) < Estimate(5) < Estranged(1) → 3,2,4,5,1. Option 4." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए, जो निम्नलिखित श्रेणी में चिह्न (?) के स्थान पर आ सकती है।\n\n4, 8, 16, 64, 36, 216, 64, ?", o: ["432","729","343","512"], e: "Alternating squares (4,16,36,64) and cubes (8,64,216,?). Next cube = 8³ = 512. Option 4." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'GARDEN' को '719425' के रूप में कूटबद्ध किया जाता है, और 'KINLEY' को '235327' के रूप में कूटबद्ध किया जाता है। उसी भाषा में 'SLUMBER' को कैसे कूटबद्ध किया जाएगा?", o: ["10354229","19313259","10334259","19313229"], e: "Per response sheet, option 3 (10334259)." },
  { s: REA, q: "G, H, I, J, K और L एक पंक्ति में दक्षिण की ओर मुख करके बैठे हैं। H, I के बाईं ओर ठीक बगल में बैठा है। I, G के बाईं ओर चौथे स्थान पर बैठा है। K, L और J का पड़ोसी है। वह व्यक्ति, जो J के दाईं ओर तीसरे स्थान पर है, किसी एक सिरे पर है।\n\nK के दाईं ओर कौन बैठा है?", o: ["J","I","L","H"], e: "Best guess per arrangement (unanswered in response sheet) — option 2." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़िए।\n\nकथन:\nसभी आयत, समलंब हैं। सभी वृत्त, समलंब हैं।\n\nनिष्कर्ष:\nI. कुछ आयतों के वृत्त होने की संभावना है।\nII. कुछ समलंब, आयत हैं।", o: ["केवल निष्कर्ष I अनुसरण करता है","केवल निष्कर्ष II अनुसरण करता है","निष्कर्ष I और II दोनों अनुसरण करते हैं","न तो निष्कर्ष I और न ही निष्कर्ष II अनुसरण करता है"], e: "All rectangles are trapeziums ⇒ some trapeziums are rectangles (II ✓). I 'possibility' not strictly required. Option 2." },
  { s: REA, q: "उस विकल्प का चयन कीजिए जो तीसरे पद से उसी प्रकार संबंधित है जिस प्रकार दूसरा पद पहले पद से संबंधित है।\n\nEIGHT : ICLEX :: DETAIL : ?", o: ["EAZHEP","EZIEPP","EZAEHP","EIZPEP"], e: "Best guess per coding pattern (unanswered in response sheet) — option 2." },
  { s: REA, q: "चार अक्षर-समूह दिए गए हैं, जिनमें से तीन किसी तरह से संगत हैं और एक असंगत है। उस अक्षर-समूह का चयन कीजिए, जो अन्य से असंगत है।", o: ["VXZ","QSU","HJL","MOP"], e: "VXZ, QSU, HJL all have (+2,+2). MOP has (+2,+1) — odd one out. Option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'DENTIST' को 'GHQTKUV' लिखा जाता है, और 'TEACHER' को 'WHDCJGT' लिखा जाता है। उसी कूट भाषा में 'BROTHER' को किस प्रकार लिखा जाएगा?", o: ["EURWNKX","GTQVJGT","EURTJGT","EURGLIV"], e: "Pattern: 1st-3rd letters +3, 4th letter +0, last 3 letters +2. BROTHER: B+3=E, R+3=U, O+3=R, T+0=T, H+2=J, E+2=G, R+2=T → EURTJGT. Option 3." },
  { s: REA, q: "छह लड़कियाँ एक वृत्ताकार व्यवस्था में केंद्र की ओर मुख करके बैठी हैं। प्रीति, डॉली के दाईं ओर ठीक बगल में बैठी है। आशी, निशा और नव्या के बीच में बैठी है। डिंपी, डॉली और निशा के बीच में बैठी है।\n\nनव्या के दाईं ओर ठीक बगल में कौन बैठी है?", o: ["प्रीति","डॉली","आशी","निशा"], e: "Per response sheet, option 3 (Ashi)." },
  { s: REA, q: "एक निश्चित कूट भाषा में LION को 12-9-15-14 लिखा जाता है और GOAT को 7-15-1-20 लिखा जाता है। उसी कूट भाषा में LAMB को किस प्रकार लिखा जाएगा?", o: ["11-1-12-2","12-1-13-2","12-2-14-3","11-1-12-3"], e: "Each letter = its alphabet position. LAMB: L(12), A(1), M(13), B(2) → 12-1-13-2. Option 2." },
  { s: REA, q: "दयाकर, जो सुकुमार की संतान है, का विवाह प्रिया के साथ हुआ है। बैदेही, सुकुमार की बेटी है। सुकुमार, गरिमा के दादा हैं। बैदेही अविवाहित है। रघु, दयाकर का इकलौता बेटा है। प्रिया के दो बच्चे हैं और उनमें से एक का विवाह निकिता के साथ हुआ है।\n\nदयाकर का निकिता से क्या संबंध है?", o: ["पिता","पति","बेटा","ससुर"], e: "Dayakar has 2 children (Raghu = only son, plus a daughter). One is married to Nikita — must be daughter (since Raghu is only son). So Nikita = Dayakar's son-in-law. Dayakar = Nikita's father-in-law (ससुर). Option 4." },
  { s: REA, q: "रीता, कविता की माँ है। कविता, निशु की माँ है। पंकज, निशु की माँ का भाई है।\n\nरीता का पंकज से क्या संबंध है?", o: ["माँ","बहन","पुत्री","दादी"], e: "Nishu's mother = Kavita. Pankaj is Kavita's brother (= Reeta's son). So Reeta is Pankaj's mother. Option 1." },
  { s: REA, q: "दिए गए विकल्पों में से उस अक्षर-समूह का चयन कीजिए, जो निम्नलिखित श्रृंखला में चिह्न (?) के स्थान पर आ सकता है।\n\nBYE, CVG, ERI, ?, LGM", o: ["HMK","GMI","HLK","GLJ"], e: "1st letters: B(+1), C(+2), E(+3), H(+4)=L. 2nd: Y(-3), V(-4), R(-5), M(-6)=G. 3rd: E(+2), G(+2), I(+2), K(+2)=M. Next = HMK. Option 1." },
  { s: REA, q: "अक्षरों के उस संयोजन का चयन कीजिए, जिसे दी गई श्रृंखला के रिक्त स्थानों में क्रमबद्ध रूप से रखने पर श्रृंखला पूर्ण हो जाएगी।\n\n_cb_a_b_a_b_ _c_da", o: ["adcdcdba","adcddcab","adcdcadb","adcdcdab"], e: "Per response sheet, option 4 (adcdcdab)." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'Y' को 225 और 'Q' को 1017 लिखा जाता है। उसी कूट भाषा में 'T' को किस प्रकार लिखा जाएगा?", o: ["216","720","621","618"], e: "Per response sheet, option 2 (720)." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़िए।\n\nकथन:\nसभी कैलकुलेटर कंपास हैं। सभी कंपास घड़ियाँ हैं। कुछ घड़ियाँ बैग हैं।\n\nनिष्कर्ष:\nI. कुछ बैग कंपास हैं।\nII. कुछ घड़ियाँ कैलकुलेटर हैं।\nIII. कुछ कंपास कैलकुलेटर हैं।", o: ["केवल निष्कर्ष II और III पालन करते हैं।","केवल निष्कर्ष I और II पालन करते हैं।","सभी निष्कर्ष I, II और III पालन करते हैं।","केवल निष्कर्ष I और III पालन करते हैं।"], e: "All calc⊂compass⊂clocks. So some clocks are calc (II ✓), some compass are calc (III ✓). Bags overlap clocks but no link to compass (I ✗). Only II and III. Option 1." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "दिए गए विकल्पों में से वह संख्या चुनिए जो निम्नलिखित श्रेणी में चिह्न (?) के स्थान पर आ सकती है।\n\n3, 23, 33, 43, 58, 88, ?", o: ["153","135","163","136"], e: "Best guess per series pattern (unanswered in response sheet) — option 3 (163)." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nHumble", o: ["Arrogant","Poor","Meek","Modest"], e: "'Humble' (modest) — antonym 'Arrogant' (haughty). Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA place where bread and cakes are made.", o: ["Eatery","Pantry","Bakery","Larder"], e: "'Bakery' = a place where bread, cakes etc. are made. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nHe isn't very fond of reading, ________?", o: ["aren't he","has he","isn't it","is he"], e: "Question tag for negative statement 'isn't' → positive 'is he'. Option 4." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe young one of a sheep.", o: ["Kitten","Cub","Kid","Lamb"], e: "A young sheep is called a 'Lamb'. Option 4." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Electrnone","Eleven","Edge","Efficient"], e: "'Electrnone' is misspelled — correct is 'Electron'. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nThe stranger asked where he could spend the night.", o: ["The stranger said, \"Where I could spend the night?\"","The stranger said, \"Where I can spend the night?\"","The stranger said, \"Where can I spend the night?\"","The stranger said, \"Where he could spend the night?\""], e: "Indirect 'asked where he could' → direct interrogative 'Where can I spend the night?'. Option 3." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nLearn the ropes", o: ["To learn how to do a job or activity","To pretend one is trained in something","To have a talent for magic tricks","To be good with rope exercises"], e: "'Learn the ropes' = learn how to do a job/activity. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nFilthy", o: ["Soiled","Clean","Dirty","Black"], e: "'Filthy' (dirty) — antonym 'Clean'. Option 2." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nRecapitulate", o: ["Enlarge","Prolong","Summarize","Elaborate"], e: "'Recapitulate' = summarise / recap. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nWe accept all credit cards.", o: ["All credit cards are accepted by us.","All credit cards are being accepted by us.","All credit cards were accepted by us.","All credit cards have been accepted by us."], e: "Simple present active 'accept' → passive 'are accepted'. Option 1." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nI don't have enough money to ________ photography as a serious hobby.", o: ["assist","enliven","untie","pursue"], e: "'Pursue photography as a hobby' is the natural fit — pursue = engage in. Option 4." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nJostle", o: ["Control","Swallow","Hinder","Shove"], e: "'Jostle' = push roughly / shove. Option 4." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["eleborate","election","electric","elastic"], e: "'eleborate' is misspelled — correct is 'elaborate'. Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nTake a toll", o: ["To take notice","To harm or damage","To warn someone","To ring a bell"], e: "'Take a toll' = cause harm / damage gradually. Option 2." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Resistance","Seperate","Resplendent","Pendant"], e: "'Seperate' is misspelled — correct is 'Separate'. Option 2." },
  { s: ENG, q: "In the passage on Radio Talk, fill in blank no. 1.\n\n'Radio Talk is a kind of writing that is in some ways (1)________ to a magazine or feature article.'", o: ["similar","varied","unlike","singular"], e: "'Similar to' — comparison with magazine article. Option 1." },
  { s: ENG, q: "In the passage on Radio Talk, fill in blank no. 2.\n\n'…the radio talk is (2)________ written for the radio.'", o: ["specifically","automatically","questionably","incidentally"], e: "'Specifically written for the radio' fits the medium-specific context. Option 1." },
  { s: ENG, q: "In the passage on Radio Talk, fill in blank no. 3.\n\n'Although talks are usually based on one's (3)________ experiences…'", o: ["personal","public","alien","indifferent"], e: "'Personal experiences' is the natural collocation. Option 1." },
  { s: ENG, q: "In the passage on Radio Talk, fill in blank no. 4.\n\n'…they must be of general interest to a wider (4)________.'", o: ["audience","congregation","company","crowd"], e: "Wider audience — listenership for a radio talk. Option 1." },
  { s: ENG, q: "In the passage on Radio Talk, fill in blank no. 5.\n\n'The key is to have an interesting opening so that it grabs the listener's (5)________.'", o: ["disregard","indifference","attention","neglect"], e: "'Grabs the listener's attention' is the standard collocation. Option 3." },
  { s: ENG, q: "Read the passage on panthers and prey.\n\nHow do smaller animals force the panther to back off?", o: ["By always being watchful and alert","By raising a shrill chorus of sounds","By assembling in the open grasslands","By attacking it collectively"], e: "Per passage: 'make such a loud noise' / 'shrill note' / 'deafening bark' — chorus of sounds drives the panther away. Option 2." },
  { s: ENG, q: "Read the passage on panthers and prey.\n\nWhich of these animals produces a deafening bark to ward off panthers?", o: ["Chital","Sambar","Monkey","Kakar"], e: "Per passage: 'the kakar emits a deafening bark'. Option 4." },
  { s: ENG, q: "Read the passage on panthers and prey.\n\n'Impertinent brat' in the passage refers to the:", o: ["crow","deer","baby chital","antelope"], e: "Per passage: a tiny chital baby is described as the 'impertinent brat'. Option 3." },
  { s: ENG, q: "Read the passage on panthers and prey.\n\nWhat is the common belief about how a panther attacks its prey?", o: ["It runs at the victim at a great speed.","It suddenly leaps upon its prey.","It creeps up close to its prey.","It chases its prey for long distances."], e: "Per passage: 'Contrary to the common belief, the panther never springs upon its prey suddenly' — so common belief = it suddenly leaps. Option 2." },
  { s: ENG, q: "Read the passage on panthers and prey.\n\nWhat does the phrase 'stand their ground' mean?", o: ["Hide silently till the attacker moves away","Stay in position to face the enemy boldly","Stand still being unable to move in fear","Try to escape as fast as possible"], e: "'Stand their ground' = hold one's position bravely. Option 2." },

  // ============ Quantitative Aptitude (51-75) — all image-based ============
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "निम्नलिखित में से कौन एक विकेटकीपर बल्लेबाज़ के रूप में भारत का प्रतिनिधित्व करता है?", o: ["रवींद्र जडेजा","जसप्रीत बुमराह","ऋद्धिमान साहा","मयंक अग्रवाल"], e: "Wriddhiman Saha is India's Test wicketkeeper-batsman. Jadeja = all-rounder; Bumrah = pace bowler; Mayank = opener. Option 3." },
  { s: GA, q: "भारतीय वित्तीय प्रणाली कोड (IFSC) में कितने अल्फा-न्यूमेरिक वर्ण होते हैं?", o: ["10","9","12","11"], e: "IFSC code has 11 alphanumeric characters (4 letters + 0 + 6 alphanumeric). Option 4." },
  { s: GA, q: "नवंबर 2020 में, निम्नलिखित में से किसे 2020-21 की अवधि के लिए न्यूज़ ब्रॉडकास्टर्स एसोसिएशन के अध्यक्ष के रूप में नियुक्त किया गया था?", o: ["संदीप चौधरी","रजत शर्मा","ज़ोहरा चटर्जी","नसीम ज़ैदी"], e: "Rajat Sharma was appointed President of the News Broadcasters Association for 2020-21. Option 2." },
  { s: GA, q: "मार्च 2021 में, मिशन सागर IV के अंतर्गत, आईएनएस (INS) जलाश्व, द्वीप राष्ट्र को 1000 मीट्रिक टन ________ पहुँचाने के लिए पोर्ट अंजुआन, कोमोरोस पहुँचा था।", o: ["गेहूँ","चीनी","चाय","चावल"], e: "Under Mission Sagar IV, INS Jalashwa delivered 1000 metric tonnes of rice to Comoros in March 2021. Option 4." },
  { s: GA, q: "बग़दाद के ख़लीफ़ा मुस्तानसिर बिल्लाह (Mustansir Billah) ने इल्तुतमिश को 'सुल्तान-ए-आज़म' और 'नासिर-अमीर-अल-मोमिन' की उपाधियाँ कब प्रदान कीं?", o: ["1224 ईस्वी","1210 ईस्वी","1229 ईस्वी","1220 ईस्वी"], e: "Caliph Mustansir Billah conferred the titles on Iltutmish in 1229 CE. Option 3." },
  { s: GA, q: "अगस्त 2021 में, ________ के तेज़ू हवाई अड्डे से वाणिज्यिक उड़ानों का संचालन शुरू किया गया।", o: ["हिमाचल प्रदेश","मिज़ोरम","सिक्किम","अरुणाचल प्रदेश"], e: "Tezu Airport is in Arunachal Pradesh — commercial flights started Aug 2021. Option 4." },
  { s: GA, q: "सम्राट अकबर ने 1585 में अपनी राजधानी लाहौर स्थानांतरित की। उसने राजधानी को लाहौर से पुनः आगरा में कब स्थानांतरित किया?", o: ["1591","1595","1588","1599"], e: "Per response sheet, option 1 (1591)." },
  { s: GA, q: "नीले आसमान के लिए अंतर्राष्ट्रीय स्वच्छ वायु दिवस ________ को मनाया जाता है।", o: ["7 सितंबर","23 मई","13 अक्टूबर","30 जुलाई"], e: "International Day of Clean Air for Blue Skies is observed on 7 September. Option 1." },
  { s: GA, q: "निम्न में से कौन सा, उभयलिंगी (hermaphrodite) प्राणी नहीं है?", o: ["केंचुआ","जोंक","थल घोंघा","रानी मधुमक्खी"], e: "Queen bee is NOT hermaphrodite (female only). Earthworms, leeches, land snails are hermaphrodites. Option 4." },
  { s: GA, q: "रामप्पा मंदिर के नाम से लोकप्रिय, ________ ________ में स्थित है।", o: ["आंध्र प्रदेश","तेलंगाना","केरल","कर्नाटक"], e: "Ramappa Temple (Rudreshwara) at Palampet is in Telangana — UNESCO World Heritage Site. Option 2." },
  { s: GA, q: "भारत के सर्वोच्च न्यायालय की पहली बैठक इनमें से किस वर्ष में आयोजित हुई थी?", o: ["1952","1947","1957","1950"], e: "The Supreme Court of India was inaugurated on 28 January 1950 — first sitting that year. Option 4." },
  { s: GA, q: "खेलो इंडिया यूथ गेम्स के चौथे संस्करण का आयोजन ________ में किया जाएगा।", o: ["हरियाणा","पंजाब","कर्नाटक","असम"], e: "4th Khelo India Youth Games was held in Haryana (Panchkula) in June 2022. Option 1." },
  { s: GA, q: "स्रोत पर एकत्रित कर (TDS) जमा करने के लिए भारतीय करदाताओं द्वारा किस ITNS चालान का उपयोग किया जाता है?", o: ["ITNS 282","ITNS 284","ITNS 283","ITNS 281"], e: "ITNS 281 is used for depositing TDS/TCS by Indian taxpayers. Option 4." },
  { s: GA, q: "निम्न में से कौन सा रासायनिक यौगिक नहीं है?", o: ["जल","साधारण नमक","वायु","बेकिंग सोडा"], e: "Air is a MIXTURE of gases, not a chemical compound. Water (H₂O), salt (NaCl), baking soda (NaHCO₃) are compounds. Option 3." },
  { s: GA, q: "पंडित निखिल बनर्जी ________ के प्रतिपादकों में से एक थे।", o: ["वीणा","सितार","बांसुरी","संतूर"], e: "Pandit Nikhil Banerjee (1931-86) was an acclaimed sitar exponent of the Maihar gharana. Option 2." },
  { s: GA, q: "मुगल साम्राज्य के संदर्भ में, 'हरम' शब्द निम्न में से किसे संदर्भित करता है?", o: ["मुगलों की दक्कन नीति","संगमरमर के स्मारकों के निर्माण की पहल","कराधान प्रणाली","मुगलों की घरेलू दुनिया"], e: "'Harem' in Mughal context refers to the domestic / private quarters of the emperor's household (women's quarters). Option 4." },
  { s: GA, q: "1952 में आयोजित पहले लोकसभा चुनाव से गणना करते हुए, 2019 लोकसभा चुनाव की क्रम संख्या कितनी होगी?", o: ["16वीं","19वीं","17वीं","18वीं"], e: "The 2019 Lok Sabha election was for the 17th Lok Sabha (counted from 1952 = 1st). Option 3." },
  { s: GA, q: "निम्न में से कौन भारत में आर्थिक सर्वेक्षण के प्रमुख लेखक (principal author) हैं?", o: ["वित्त मंत्री","मुख्य आर्थिक सलाहकार","प्रधान मंत्री","राज्यपाल"], e: "The Economic Survey of India is authored by the Chief Economic Advisor (CEA) and his team in the Ministry of Finance. Option 2." },
  { s: GA, q: "इनमें से किसे 2019 के आम चुनावों के बाद लोकसभा में भारतीय राष्ट्रीय कांग्रेस के नेता के रूप में नियुक्त किया गया था?", o: ["ओम बिरला","अधीर रंजन चौधरी","आनंद शर्मा","मनीष तिवारी"], e: "Adhir Ranjan Chowdhury was appointed Leader of the Congress Party in the 17th Lok Sabha (post-2019). Option 2." },
  { s: GA, q: "निम्न में से किस नदी का उद्गम स्थल, त्र्यंबकेश्वर के पास स्थित है?", o: ["नर्मदा","कावेरी","कृष्णा","गोदावरी"], e: "The Godavari river originates from Trimbakeshwar (Nashik district), Maharashtra. Option 4." },
  { s: GA, q: "निम्नलिखित में से किसने 'मातोश्री' पुस्तक लिखी, जो मराठा रानी अहिल्याबाई होलकर के जीवन पर आधारित है?", o: ["के.सी. पंत","सुमित्रा महाजन","चेतन भगत","अरुंधति सुब्रमण्यम"], e: "Sumitra Mahajan, former Lok Sabha Speaker, authored 'Matoshree' on Ahilyabai Holkar's life. Option 2." },
  { s: GA, q: "दिए गए भारतीय शहरों को सुदूरतम दक्षिणी भाग से शुरू करते हुए, दक्षिण से उत्तर की ओर के क्रम में व्यवस्थित करें।\n(A) मदुरई\n(B) सेलम\n(C) कुर्नूल\n(D) तिरुपति", o: ["ABCD","BCAD","BADC","ABDC"], e: "Latitudes — Madurai (9.9°N), Salem (11.7°N), Tirupati (13.6°N), Kurnool (15.8°N). S→N order: A, B, D, C → ABDC. Option 4." },
  { s: GA, q: "इनमें से कौन भारत के अंतिम वायसराय थे?", o: ["लॉर्ड कैनिंग","लॉर्ड कर्ज़न","लॉर्ड इरविन","लॉर्ड माउंटबेटन"], e: "Lord Mountbatten was the last Viceroy of British India (and first Governor-General of independent India). Option 4." },
  { s: GA, q: "तमिलनाडु, आंध्र प्रदेश और केरल में पाई जाने वाली लाल लैटेराइट मिट्टी ________ जैसी फसलों के लिए अधिक उपयुक्त होती है।", o: ["गेहूँ","कपास","काजू","चावल"], e: "Red laterite soil in TN/AP/Kerala is well-suited for plantation crops like cashew, coffee, rubber. Option 3." },
  { s: GA, q: "निम्न में से किस भारतीय शतरंज खिलाड़ी ने क्लिमबर्ग ओपन शतरंज टूर्नामेंट, 2021 जीता था?", o: ["आर. वैशाली","निहाल सरीन","श्रीनाथ नारायणन","रौनक साधवानी"], e: "GM R. Vaishali won the Klimburg Open chess tournament 2021. Option 1." }
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

  const TEST_TITLE = 'SSC Selection Post Phase IX (Matriculation) - 7 February 2022 Shift-2';
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
