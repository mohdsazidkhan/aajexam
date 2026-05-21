/**
 * Seed: SSC Selection Post Phase IX 2021 (Matriculation Level) PYQ - 10 February 2022, Shift-1 (100 questions)
 * Source: SSC official response sheet (PDF + docx). Hindi recovered via docx-XML parse.
 * All image questions (REA Q5/Q8/Q23 + all QA Q1-Q25) sourced directly from docx-embedded media.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-10feb2022-s1.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_feb10_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-10feb2022-s1';

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

const F = '10-feb-2022-s1';

const IMAGE_MAP = {
  // REA image questions
  5:  { q: 'image4.jpeg',  opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] },
  8:  { q: 'image9.jpeg',  opts: ['image10.png','image11.png','image12.png','image13.png'] },
  23: { q: 'image14.jpeg', opts: ['image15.jpeg','image16.jpeg','image17.jpeg','image18.jpeg'] },

  // QA Q51-Q75 — all image-based
  51: { q: 'image19.jpeg', opts: ['image20.jpeg','image21.jpeg','image22.jpeg','image23.jpeg'] },
  52: { q: 'image24.jpeg', opts: ['image25.jpeg','image26.jpeg','image27.jpeg','image28.jpeg'] },
  53: { q: 'image29.jpeg', opts: ['image30.jpeg','image31.jpeg','image32.jpeg','image33.jpeg'] },
  54: { q: 'image34.jpeg', opts: ['image35.jpeg','image36.png','image37.jpeg','image38.png'] },
  55: { q: 'image39.jpeg', opts: ['image40.jpeg','image41.jpeg','image42.jpeg','image43.jpeg'] },
  56: { q: 'image44.jpeg', opts: ['image45.jpeg','image46.jpeg','image47.jpeg','image48.jpeg'] },
  57: { q: 'image49.jpeg', opts: ['image50.png','image51.png','image52.jpeg','image53.jpeg'] },
  58: { q: 'image54.jpeg', opts: ['image55.jpeg','image56.jpeg','image57.jpeg','image58.jpeg'] },
  59: { q: 'image59.jpeg', opts: ['image52.jpeg','image53.jpeg','image60.jpeg','image61.jpeg'] },
  60: { q: 'image62.jpeg', opts: ['image63.jpeg','image64.jpeg','image65.jpeg','image66.jpeg'] },
  61: { q: 'image67.jpeg', opts: ['image68.jpeg','image69.jpeg','image70.jpeg','image71.jpeg'] },
  62: { q: 'image72.jpeg', opts: ['image73.jpeg','image74.jpeg','image75.jpeg','image76.jpeg'] },
  63: { q: 'image77.jpeg', opts: ['image78.jpeg','image79.jpeg','image80.jpeg','image81.jpeg'] },
  64: { q: 'image82.jpeg', opts: ['image83.jpeg','image84.jpeg','image85.jpeg','image86.jpeg'] },
  65: { q: 'image87.jpeg', opts: ['image88.jpeg','image89.jpeg','image90.jpeg','image91.png'] },
  66: { q: 'image92.jpeg', opts: ['image93.jpeg','image94.jpeg','image95.jpeg','image96.jpeg'] },
  67: { q: 'image97.jpeg', opts: ['image98.jpeg','image99.jpeg','image100.jpeg','image101.jpeg'] },
  68: { q: 'image102.jpeg', opts: ['image103.jpeg','image104.jpeg','image105.jpeg','image106.jpeg'] },
  69: { q: 'image107.jpeg', opts: ['image108.jpeg','image109.jpeg','image110.jpeg','image111.jpeg'] },
  70: { q: 'image112.jpeg', opts: ['image113.jpeg','image114.jpeg','image115.jpeg','image116.jpeg'] },
  71: { q: 'image117.jpeg', opts: ['image118.jpeg','image119.jpeg','image120.jpeg','image121.jpeg'] },
  72: { q: 'image122.jpeg', opts: ['image123.jpeg','image124.jpeg','image125.jpeg','image126.jpeg'] },
  73: { q: 'image127.jpeg', opts: ['image96.jpeg','image128.png','image129.jpeg','image93.jpeg'] },
  74: { q: 'image130.jpeg', opts: ['image131.jpeg','image132.jpeg','image133.jpeg','image134.jpeg'] },
  75: { q: 'image135.jpeg', opts: ['image93.jpeg','image136.jpeg','image94.jpeg','image128.png'] }
};

// 1-based answer key.
const KEY = [
  // 1-25 General Intelligence
  4, 3, 2, 4, 3,   1, 1, 4, 3, 4,   4, 1, 4, 2, 3,   3, 4, 3, 3, 2,   4, 4, 1, 2, 4,
  // 26-50 English Language
  4, 2, 4, 2, 1,   1, 1, 3, 3, 4,   2, 3, 4, 1, 3,   3, 2, 4, 3, 4,   3, 2, 3, 3, 1,
  // 51-75 Quantitative Aptitude — image-based
  2, 3, 1, 4, 1,   2, 1, 1, 2, 1,   3, 2, 1, 2, 3,   4, 2, 1, 3, 1,   3, 3, 3, 4, 1,
  // 76-100 General Awareness
  2, 2, 3, 3, 1,   2, 2, 3, 4, 2,   2, 3, 2, 2, 3,   2, 1, 1, 2, 2,   2, 2, 3, 4, 2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "एक निश्चित कूट भाषा में, 'HEADLIGHT' को 'JGCFNKIJV' लिखा जाता है। उसी कूट भाषा में 'INADVISABLE' को किस प्रकार लिखा जाएगा?", o: ["KQDEXKUDEOG","KQCFXLUDENG","KPDFXLUCDNG","KPCFXKUCDNG"], e: "Each letter shifts by +2. H→J, E→G, A→C, D→F, L→N, I→K, G→I, H→J, T→V ✓. INADVISABLE → K,P,C,F,X,K,U,C,D,N,G = KPCFXKUCDNG. Option 4." },
  { s: REA, q: "उस विकल्प का चयन कीजिए, जिसका तीसरी संख्या से वही संबंध है, जो दूसरी संख्या का पहली संख्या से है और छठी संख्या का पांचवीं संख्या से है।\n\n65 : 192 :: 78 : ? :: 93 : 220", o: ["234","223","205","198"], e: "Pattern: add 127. 65+127=192 ✓. 93+127=220 ✓. 78+127=205. Option 3." },
  { s: REA, q: "आठ व्यक्ति A, B, C, D, E, F, G और H एक वृत्ताकार मेज के परितः मेज के केंद्र की ओर मुख करके बैठे हैं। A, F के दाईं ओर ठीक बगल में बैठा है। D, A के दाईं ओर दूसरे स्थान पर बैठा है। C, D के बाईं ओर चौथे स्थान पर बैठा है। B, H और E के बीच में बैठा है। E, G के दाईं ओर चौथे स्थान पर बैठा है।\n\nA के बाईं ओर दूसरे स्थान पर कौन बैठा है?", o: ["F","C","E","D"], e: "Facing inward: right = anticlockwise. Place A at 1 (clockwise positions). F at 2. D at 7 (2 anticlockwise from A). C at 3 (4 clockwise from D). G at 8 (so E = 4 anticlockwise from G = position 4). B at 5 between E(4) and H(6). 2nd left (clockwise) of A = position 3 = C. Option 2." },
  { s: REA, q: "चार अक्षर-समूह दिए गए हैं, जिनमें से तीन किसी तरह से संगत हैं और एक असंगत है। उस अक्षर-समूह का चयन करें, जो अन्य से असंगत है।", o: ["MNP","WXZ","GHJ","TUV"], e: "MNP, WXZ, GHJ: shifts +1, +2. TUV: shifts +1, +1. TUV is odd. Option 4." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए। (आकृति-पैटर्न)", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'DOME' को '74' के रूप में कूटबद्ध किया जाता है और 'PLACE' को '74' के रूप में कूटबद्ध किया जाता है। उसी भाषा में, 'FLOOD' को किस रूप में कूटबद्ध किया जाएगा?", o: ["104","100","91","70"], e: "Code = sum of alphabet positions × 2. DOME = (4+15+13+5) = 37; ×2 = 74 ✓. PLACE = (16+12+1+3+5) = 37; ×2 = 74 ✓. FLOOD = (6+12+15+15+4) = 52; ×2 = 104. Option 1." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'SHARP' को 'LOATN' के रूप में लिखा जाता है। उसी भाषा में 'VAPID' को कैसे लिखा जाएगा?", o: ["ERPHE","WZPZM","ERTHE","WZLZM"], e: "Sum preserved: SHARP sum = 62, LOATN sum = 62. Pair-sums also preserved: S+H=L+O=27, R+P=T+N=34, A→A. VAPID: V+A=23, P→P=16, I+D=13. ERPHE: E+R=23, P=16, H+E=13 ✓. Option 1." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "अक्षरों के उस संयोजन का चयन कीजिए, जिसे दी गई श्रृंखला के रिक्त स्थानों में क्रमबद्ध रूप से रखने पर श्रृंखला पूर्ण हो जाएगी।\n\nA B _ _ K _ _ D E K _ B _ _ K", o: ["EDABAED","DEBBAAK","DEABADE","EDBABED"], e: "Per response sheet, option 3 (DEABADE)." },
  { s: REA, q: "दिए गए कथन और निष्कर्ष सावधानीपूर्वक पढ़ें।\n\nकथन:\nसभी खिलाड़ी, अभिनेता हैं। कुछ लेखक, अभिनेता हैं।\n\nनिष्कर्ष:\n(I) सभी खिलाड़ी, लेखक हैं।\n(II) कुछ लेखक, खिलाड़ी हैं।", o: ["केवल निष्कर्ष II अनुसरण करता है।","केवल निष्कर्ष I अनुसरण करता है।","या तो निष्कर्ष I या II अनुसरण करता है।","न तो निष्कर्ष I न ही II अनुसरण करता है।"], e: "Players ⊆ actors; some writers are actors. Players could be disjoint from those writer-actors. Neither I nor II definitively follows. Option 4." },
  { s: REA, q: "विनोद, रिया के दादा हैं। रिया, निखिल की पुत्री है। गौरी, निखिल की पत्नी है। सोहन, निखिल का भाई है।\n\nसोहन का रिया से क्या संबंध है?", o: ["पिता के पिता","पुत्र","भाई","पिता का भाई"], e: "Sohan is Nikhil's brother; Nikhil is Riya's father → Sohan is Riya's father's brother (paternal uncle / पिता का भाई). Option 4." },
  { s: REA, q: "संजू का आठ सदस्यों का परिवार है। बिनोद परिवार का सबसे बड़ा पुरुष सदस्य है और उसका विवाह नर्मदा के साथ हुआ है। हयाति, नर्मदा की बहू है और सुविद तथा अलेखा की भाभी हैं। संजू और बिनोद के अलावा, सुविद परिवार का एकमात्र पुरुष सदस्य है। अलेखा संजू की दो बेटियों, सरयू और दक्षि की बुआ है।\n\nदक्षि का सुविद के भाई से क्या संबंध है?", o: ["बेटी","बहन","भाभी","बहू"], e: "Sanju, Suvid, Alekha are Binod+Narmada's children. Sanju = Hayati's husband. Suvid's brother = Sanju. Dakshi is Sanju's daughter → Dakshi is daughter (बेटी) of Suvid's brother. Option 1." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'TABLE' को '10177625' के रूप में कूटबद्ध किया जाता है। उसी भाषा में 'GLOBAL' को किस रूप में कूटबद्ध किया जाएगा?", o: ["1267101712","2171027671","1776021721","1767201712"], e: "Per response sheet (unanswered), option 4 as best guess." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़ें।\n\nकथन:\nकोई पक्षी तोता नहीं है। कुछ कबूतर पक्षी हैं। सभी कौवे तोते हैं।\n\nनिष्कर्ष:\nI. कोई पक्षी कबूतर नहीं है।\nII. सभी तोते निश्चित रूप से पक्षी नहीं हैं।", o: ["निष्कर्ष I और II दोनों पालन करते हैं।","केवल निष्कर्ष II पालन करता है।","केवल निष्कर्ष I पालन करता है।","न तो निष्कर्ष I और न ही II पालन करता है।"], e: "Some pigeons are birds → some birds are pigeons (I ✗). 'No bird is parrot' → contrapositive: 'no parrot is bird' = all parrots are NOT birds (II ✓). Option 2." },
  { s: REA, q: "छह व्यक्ति L, M, N, O, P और Q एक सीधी पंक्ति में पूर्व की ओर मुख करके बैठे हैं। P के बाईं ओर केवल दो व्यक्ति बैठे हैं, जो L के बाईं ओर तीसरे स्थान पर बैठा है। M और N किसी भी सिरे पर नहीं बैठे हैं। M और P, Q के निकटतम पड़ोसी हैं।\n\nबाएं सिरे से दूसरे स्थान पर कौन बैठा है?", o: ["Q","M","N","O"], e: "P at position 3. L at position 6. Q between M and P → Q at 4, M at 5. M&N not at ends → N at 2, O at 1. 2nd from left = position 2 = N. Option 3." },
  { s: REA, q: "उस विकल्प का चयन करें जो तीसरे पद से उसी प्रकार संबंधित है जिस प्रकार दूसरा पद पहले पद से संबंधित है।\n\nSALT : UDFS :: LOCK : ?", o: ["JLWJ","NLWL","NRWJ","NWRJ"], e: "Shifts: +2, +3, −6, −1. SALT→UDFS uses these shifts (S+2=U, A+3=D, L−6=F, T−1=S). LOCK with same shifts: L+2=N, O+3=R, C−6=W (mod 26: 3−6=−3=23=W), K−1=J → NRWJ. Option 3." },
  { s: REA, q: "दिए गए विकल्पों में से वह संख्या चुनें जो निम्नलिखित श्रेणी में चिह्न (?) के स्थान पर आ सकती है।\n\n5, 8, 12, 20, 37, 70, ?", o: ["183","138","182","128"], e: "Differences: 3, 4, 8, 17, 33. 2nd-differences: 1, 4, 9, 16 (1², 2², 3², 4²). Next 2nd-diff = 5² = 25. Next 1st-diff = 33+25 = 58. Next term = 70+58 = 128. Option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'TIGER' को 'SGJMY' लिखा जाता है, और 'HORSE' को 'FUUSM' लिखा जाता है। उसी कूट भाषा में 'PANDA' को किस प्रकार लिखा जाएगा?", o: ["BERFU","CERFV","BFQEU","CFQEU"], e: "Sum of letter positions increases by 15. TIGER=59→SGJMY=74; HORSE=65→FUUSM=80. PANDA=36+15=51. BFQEU sum = 2+6+17+5+21 = 51 ✓. Option 3." },
  { s: REA, q: "किन दो चिह्नों को परस्पर बदलने से निम्नलिखित समीकरण संतुलित हो जाएगा?\n\n25 − 48 + 6 ÷ 12 × 2 = 41", o: ["÷ और –","× और ÷","÷ और +","– और +"], e: "Swap ÷ and +: 25 − 48 ÷ 6 + 12 × 2 = 25 − 8 + 24 = 41 ✓. Option 3." },
  { s: REA, q: "उस सही विकल्प का चयन करें जो दिए गए शब्दों को उस क्रम में दर्शाता है जिस क्रम में वे अंग्रेज़ी शब्दकोश में दिखाई देते हैं।\n\n1. Nutriment  2. Numerable  3. Numerology  4. Nuisance  5. Numerical  6. Nucleolus", o: ["4, 6, 2, 1, 5, 3","6, 4, 2, 5, 3, 1","4, 6, 1, 2, 3, 5","6, 4, 2, 1, 3, 5"], e: "Alphabetical order: Nucleolus(6) < Nuisance(4) < Numerable(2) < Numerical(5) < Numerology(3) < Nutriment(1) → 6,4,2,5,3,1. Option 2." },
  { s: REA, q: "वह विकल्प चुनें जो तीसरे पद से उसी प्रकार संबंधित है जिस प्रकार दूसरा पद, पहले पद से संबंधित है।\n\nSECURITY : MKCIRUNE :: UNBIASED : ?", o: ["OTBSAIKX","OTVOUYYJ","AHABISKX","OTABISYJ"], e: "Positions 3-6 are sorted alphabetically while 1,2,7,8 shift by ±6 toward midpoint. SECURITY pos 3-6 = C,U,R,I → sorted = C,I,R,U ✓. UNBIASED pos 3-6 = B,I,A,S → sorted = A,B,I,S. Pos 1,2,7,8 = U,N,E,D → O,T,Y,J. Result: OTABISYJ. Option 4." },
  { s: REA, q: "श्रेणी 547, 568, 589, ……. में 15वीं संख्या कौन सी होगी?", o: ["894","883","862","841"], e: "AP with first term 547, common difference +21. 15th term = 547 + 14×21 = 547 + 294 = 841. Option 4." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'please have food' को '644' के रूप में कूटबद्ध किया जाता है, 'are you coming' को '336' के रूप में कूटबद्ध किया जाता है, और 'keep it ready' को '425' के रूप में कूटबद्ध किया जाता है। उसी भाषा में, 'they were most welcome' को किस रूप में कूटबद्ध किया जाएगा?", o: ["3122","4447","3347","4456"], e: "Code = letter count of each word concatenated. 'they(4) were(4) most(4) welcome(7)' = 4447. Option 2." },
  { s: REA, q: "दिए गए विकल्पों में से उस अक्षर-समूह का चयन करें, जो निम्नलिखित श्रृंखला में चिह्न (?) के स्थान पर आ सकता है।\n\nOMU, NOT, MQS, LSR, ?", o: ["JUQ","KVO","JVP","KUQ"], e: "1st letter: O→N→M→L→K (−1). 2nd: M→O→Q→S→U (+2). 3rd: U→T→S→R→Q (−1). Next = KUQ. Option 4." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nManufacture", o: ["Build","Fabricate","Produce","Destroy"], e: "'Manufacture' (make/produce) — antonym 'Destroy'. Option 4." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA group of people, especially traders or pilgrims, travelling together across a desert.", o: ["Parade","Caravan","Procession","Convoy"], e: "'Caravan' = group of people travelling together, esp. across a desert. Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nThe airport official said, \"The daily footfall of passengers has increased significantly since last year.\"", o: ["The airport official said that the daily footfall of passengers has increased significantly since last year.","The airport official said that the daily footfall of passengers was increased significantly since last year.","The airport official told that the daily footfall of passengers has increased significantly since the previous year.","The airport official said that the daily footfall of passengers had increased significantly since the previous year."], e: "Present perfect → past perfect (has → had); last year → previous year. Option 4." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nChaos", o: ["Disability","Disharmony","Disappearance","Disagreement"], e: "'Chaos' = complete disorder / disharmony. Option 2." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nIt has been ________ a pleasure to meet you!", o: ["such","much","so","more"], e: "'Such a pleasure' (such + a + noun) is the natural collocation. Option 1." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nReliable", o: ["Stable","False","Weak","Dishonest"], e: "'Reliable' = trustworthy / stable. Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nMake a beeline", o: ["go straight to","put the bees in a line","stand in a queue","look for freebies"], e: "'Make a beeline (for)' = go directly / hurry straight to. Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nPain in the neck", o: ["To suffer pain because of overexertion of neck muscles","To relieve someone from a painful condition","Someone or something that is very annoying","To be unable to deal with someone stronger"], e: "'Pain in the neck' = someone or something very annoying. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nMoist", o: ["Wet","Sweaty","Dry","Damp"], e: "'Moist' (slightly wet) — antonym 'Dry'. Option 3." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Millipede","Milliner","Million","Millenium"], e: "'Millenium' is misspelled — correct is 'Millennium' (double n). Option 4." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Propose","Protien","Protect","Protest"], e: "'Protien' is misspelled — correct is 'Protein' (i before e). Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe young one of a cow.", o: ["Foal","Cub","Calf","Lamb"], e: "Foal = young horse; Cub = young bear; Calf = young cow; Lamb = young sheep. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nHe always had a close ________ with his grandfather.", o: ["company","unity","regard","affinity"], e: "'Close affinity (with)' = natural bond/closeness. Option 4." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Wellfare","Partner","Appeal","Address"], e: "'Wellfare' is misspelled — correct is 'Welfare' (single l). Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nHis mother is staring at him.", o: ["He was being stared by his mother.","He was stared at by his mother.","He is being stared at by his mother.","He is stared at by his mother."], e: "Present continuous active → present continuous passive with preposition retained: 'is being stared at'. Option 3." },
  { s: ENG, q: "Read the passage on grit and perseverance.\n\nWhich of the following statements is NOT true?", o: ["Failing leads to embarrassment.","Optimism can help overcome failure.","One should give up if one fails repeatedly.","Failure empowers and educates."], e: "Passage advocates perseverance — 'give up if you fail repeatedly' contradicts the central message. Option 3." },
  { s: ENG, q: "Read the passage on grit and perseverance.\n\nWhich of the following qualities would you find in a robot?", o: ["Feelings","Precision","Dreams","Emotions"], e: "Passage says humans (unlike robots) have feelings, emotions and dreams. Robots have precision. Option 2." },
  { s: ENG, q: "Read the passage on grit and perseverance.\n\nThomas Edison is a role model for:", o: ["despair","intelligence","self-control","determination"], e: "Passage cites Edison's 1000+ attempts as the model of grit/perseverance = determination. Option 4." },
  { s: ENG, q: "Read the passage on grit and perseverance.\n\nWhat do you understand by 'mindfulness'?", o: ["Peaceful meditation in quiet surroundings","Consciousness of one's fears and doubts","Awareness of experience without judgment","Slipping into despair and frustration"], e: "Passage definition: 'mindfulness ... bringing awareness of his or her experience without judgment'. Option 3." },
  { s: ENG, q: "Read the passage on grit and perseverance.\n\nSelect the word from the passage that means the same as 'grit'.", o: ["Optimism","Curiosity","Gratitude","Perseverance"], e: "Passage uses 'perseverance' as the explicit synonym for grit ('perseverance is one of the seven qualities…'). Option 4." },
  { s: ENG, q: "Read the Mirabai Chanu passage.\n\nSelect the most appropriate option to fill in blank no. 1.\n\n'Mirabai Chanu, (1)________ Indian weight lifter who recently set a new world record…'", o: ["any","a","the","one"], e: "Specific person introduced with relative clause → 'the' Indian weight lifter (the one who set the record). Option 3." },
  { s: ENG, q: "Read the Mirabai Chanu passage.\n\nSelect the most appropriate option to fill in blank no. 2.\n\n'…has improved her (2)________ best to a total of 205 kg.'", o: ["private","personal","subjective","public"], e: "'Personal best' is the standard sports idiom. Option 2." },
  { s: ENG, q: "Read the Mirabai Chanu passage.\n\nSelect the most appropriate option to fill in blank no. 3.\n\n'She has proved that she is stronger (3)________ mentally and physically.'", o: ["each","every","both","either"], e: "'Both X and Y' construction — 'both mentally and physically'. Option 3." },
  { s: ENG, q: "Read the Mirabai Chanu passage.\n\nSelect the most appropriate option to fill in blank no. 4.\n\n'Chanu did not crumble (4)________ pressure.'", o: ["between","along","under","above"], e: "Idiom: 'crumble under pressure'. Option 3." },
  { s: ENG, q: "Read the Mirabai Chanu passage.\n\nSelect the most appropriate option to fill in blank no. 5.\n\n'She is now full of confidence as she now comes within the (5)________ to take the medal in the Olympics.'", o: ["range","extent","width","extreme"], e: "'Within the range (of taking the medal)' — standard collocation. Option 1." },

  // ============ Quantitative Aptitude (51-75) — all image-based ============
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "ममता बनर्जी, मार्च-अप्रैल 2021 में हुए विधानसभा चुनावों में नंदीग्राम सीट से किस व्यक्ति से हारी थीं?", o: ["मुकुल रॉय","सुवेन्दु अधिकारी","तथागत रॉय","दिलीप घोष"], e: "In WB 2021 Assembly election, Mamata Banerjee lost the Nandigram seat to BJP's Suvendu Adhikari. Option 2." },
  { s: GA, q: "भारतीय संविधान के अनुच्छेद 124 और 217 निम्नलिखित में से किससे संबंधित हैं?", o: ["मुख्यमंत्री की नियुक्ति","न्यायाधीशों की नियुक्ति","राज्यपाल की नियुक्ति","UPSC अध्यक्ष की नियुक्ति"], e: "Article 124 = appointment of Supreme Court judges; Article 217 = appointment of High Court judges. Option 2." },
  { s: GA, q: "इंफाल का युद्ध इनमें से किस वर्ष में जीता गया था?", o: ["1912","1956","1944","1934"], e: "The Battle of Imphal (Mar–Jul 1944, WWII) was won by the Allies (incl. British Indian Army) against Imperial Japan. Option 3." },
  { s: GA, q: "'यक्षगान' ________ की एक लोकप्रिय नृत्य-नाटक शैली है।", o: ["उत्तरी भारत","पूर्वी भारत","दक्षिणी भारत","पश्चिमी भारत"], e: "Yakshagana is a traditional dance-drama from Karnataka (Tulu Nadu region) — South India. Option 3." },
  { s: GA, q: "देवमाली पर्वत शिखर कहां स्थित है?", o: ["ओडिशा","असम","झारखंड","केरल"], e: "Deomali (1672 m) in the Eastern Ghats is the highest peak of Odisha (Koraput district). Option 1." },
  { s: GA, q: "'डालखाई (Dalkhai)' नृत्य किस राज्य से संबंधित है?", o: ["पंजाब","ओडिशा","उत्तर प्रदेश","बिहार"], e: "Dalkhai is a popular folk dance of western Odisha (Sambalpur region), performed especially during Dussehra. Option 2." },
  { s: GA, q: "निम्न में से कौन 'The Turbulent Years: 1980 – 1996' के लेखक हैं?", o: ["पी. वी. नरसिम्हा राव","प्रणब मुखर्जी","कमलनाथ","मनमोहन सिंह"], e: "'The Turbulent Years: 1980-1996' (2016) is the second volume of Pranab Mukherjee's memoirs. Option 2." },
  { s: GA, q: "गांधी जी द्वारा आरंभ की गई दांडी यात्रा के समय भारत का वायसरॉय कौन था?", o: ["लॉर्ड लिनलिथगो","लॉर्ड विलिंगडन","लॉर्ड इरविन","लॉर्ड रीडिंग"], e: "The Dandi March (Mar–Apr 1930) took place during the viceroyalty of Lord Irwin (1926-1931). Option 3." },
  { s: GA, q: "उस राष्ट्रीय जनजातीय प्रवासन सहायता पोर्टल का नाम क्या है, जिसे जनवरी 2021 में केंद्रीय जनजातीय मामलों के मंत्री श्री अर्जुन मुंडा द्वारा आरंभ किया गया था?", o: ["श्रमदान","श्रम-शक्ति","श्रम-भक्ति","श्रम-शक्ति मंच (Shramshakti)"], e: "Shramshakti — National Tribal Migration Support Portal — launched January 2021 by Arjun Munda. Option 4." },
  { s: GA, q: "'द थ्री खान्स: एंड द इमरजेंस ऑफ न्यू इंडिया (The Three Khans: And the Emergence of New India)' नामक पुस्तक के/की लेखक/लेखिका इनमें से कौन हैं?", o: ["उदय भाटिया","कावेरी बमजई","चेतन भगत","ट्विंकल खन्ना"], e: "'The Three Khans: And the Emergence of New India' (2021) is by senior journalist Kaveree Bamzai. Option 2." },
  { s: GA, q: "हीरो इंडियन सुपर लीग, 2020-2021 के फाइनल मैच में कौन-सी टीम हारी थी?", o: ["एफ.सी. गोवा (FC Goa)","ए.टी.के. मोहन बागान FC (ATK Mohun Bagan FC)","चेन्नईयिन एफ.सी. (Chennaiyin FC)","बेंगलुरु एफ.सी. (Bengaluru FC)"], e: "ISL 2020-21 final: Mumbai City FC beat ATK Mohun Bagan FC 2-1. So ATK Mohun Bagan lost. Option 2." },
  { s: GA, q: "ITNS चालान संख्या ________ का उपयोग अनुषंगी लाभ कर (Fringe Benefit Tax) के भुगतान के लिए होता है।", o: ["281","282","283","284"], e: "ITNS 283 is the challan for payment of Fringe Benefit Tax / Banking Cash Transaction Tax. Option 3." },
  { s: GA, q: "स्थायी पर्यटन और स्वस्थ तटीय प्रबंधन की योजना बनाने के लिए, पर्यावरण, वन और जलवायु परिवर्तन मंत्रालय ने BEAMS नामक एकीकृत तटीय प्रबंधन योजना की परिकल्पना की है। BEAMS का पूर्ण रूप क्या है?", o: ["Beach Enrolment and Aesthetics Management Services","Beach Environment and Aesthetics Management Services","Best Environment and Aesthetics Management Schemes","Best Environment and Aesthetics Management Services"], e: "BEAMS = Beach Environment and Aesthetics Management Services (MoEFCC's Blue Flag/integrated coastal management programme). Option 2." },
  { s: GA, q: "निम्न में से किस राज्य में NSDL पेमेंट्स बैंक का मुख्यालय स्थित है?", o: ["कर्नाटक","महाराष्ट्र","तमिलनाडु","सिक्किम"], e: "NSDL Payments Bank is headquartered in Mumbai, Maharashtra. Option 2." },
  { s: GA, q: "निम्नलिखित में से किस भारतीय राज्य में एक सींग वाले गैंडों की आबादी सर्वाधिक है?", o: ["अरुणाचल प्रदेश","मेघालय","असम","मणिपुर"], e: "Assam (Kaziranga NP) hosts the world's largest population of the Indian one-horned rhinoceros. Option 3." },
  { s: GA, q: "निम्न में से कौन सा राज्य/केंद्र शासित प्रदेश अरावली पर्वतमाला से सटा नहीं है?", o: ["दिल्ली","पंजाब","हरियाणा","गुजरात"], e: "The Aravalli range runs through Gujarat, Rajasthan, Haryana and Delhi. Punjab is NOT touched by the Aravallis. Option 2." },
  { s: GA, q: "भारत के संविधान के किस अनुच्छेद के अंतर्गत भारतीय राष्ट्रपति राष्ट्रीय आपातकाल की घोषणा कर सकते हैं, यदि उन्हें लगता है कि देश की सुरक्षा को गंभीर खतरा है?", o: ["352","350","351","348"], e: "Article 352 empowers the President to proclaim a National Emergency on grounds of war, external aggression, or armed rebellion. Option 1." },
  { s: GA, q: "सितंबर 2021 तक की जानकारी के अनुसार, भारतीय पुरुष हॉकी टीम ने ग्रीष्मकालीन ओलंपिक खेलों में कितनी बार रजत पदक जीता है?", o: ["कभी नहीं","एक","दो","तीन"], e: "India men's hockey at Summer Olympics: 8 golds, 1 silver (Rome 1960), 3 bronze (1968, 1972, Tokyo 2020). Silver = once. Option 2." },
  { s: GA, q: "सितंबर 2021 में, निम्न में से किसे पंजाब का मुख्यमंत्री नियुक्त किया गया था?", o: ["नवजोत सिंह सिद्धू","चरणजीत सिंह चन्नी","अमरिंदर सिंह","ओ. पी. सोनी"], e: "Charanjit Singh Channi became Chief Minister of Punjab on 20 September 2021 — the state's first Dalit Sikh CM. Option 2." },
  { s: GA, q: "अमोनियम क्लोराइड में हाइड्रोजन के कितने परमाणु होते हैं?", o: ["तीन","चार","दो","एक"], e: "Ammonium chloride NH₄Cl contains 4 hydrogen atoms in the NH₄⁺ ion. Option 2." },
  { s: GA, q: "निम्नलिखित में से किसे अकबर ने 'खान-ए-खाना' की उपाधि दी थी?", o: ["फ़ैज़ी","मिर्ज़ा अब्दुल रहीम खान","अबुल फज़ल","तानसेन"], e: "Akbar conferred the title 'Khan-i-Khanan' on Mirza Abdul Rahim Khan (son of Bairam Khan) in 1584. Option 2." },
  { s: GA, q: "अगस्त 2021 में, वर्ल्ड रिसोर्सेज इंस्टीट्यूट (WRI) भारत और ________ ने संयुक्त रूप से 'फोरम फॉर डीकार्बनाइजिंग ट्रांसपोर्ट (Forum for Decarbonizing Transport)' का शुभारंभ किया था।", o: ["विज्ञान एवं प्रौद्योगिकी विभाग, भारत सरकार","नीति (NITI) आयोग","पर्यावरण मंत्रालय, भारत सरकार","परिवहन मंत्रालय, भारत सरकार"], e: "NITI Aayog and WRI India jointly launched the 'Forum for Decarbonising Transport' in August 2021. Option 2." },
  { s: GA, q: "एक ब्राह्मण को दी गई भूमि थी, जिसे सामान्यतः राजा को भू-राजस्व और अन्य देय राशियों का भुगतान करने से छूट दी जाती थी, और जिसे अक्सर स्थानीय लोगों से इन बकाया राशियों को एकत्र करने का अधिकार दिया जाता था।", o: ["दक्षिणा","नमस्कारम","अग्रहार","आहुति"], e: "Agrahara = tax-free land grant given to Brahmins (also called Brahmadeya), often with rights to collect dues from local cultivators. Option 3." },
  { s: GA, q: "पश्चिम बंगाल के बाद, बांग्लादेश की सबसे लंबी सीमा निम्न में से किस भारतीय राज्य के साथ जुड़ी है?", o: ["मिज़ोरम","मेघालय","असम","त्रिपुरा"], e: "Bangladesh-India border lengths by state: West Bengal (2217 km) > Tripura (856 km) > Meghalaya (443 km) > Assam (262 km) > Mizoram (180 km). Option 4." },
  { s: GA, q: "Which of the following does NOT come under the purview of 'paper taxes'?", o: ["Estate duty","Excise tax","Wealth tax","Gift tax"], e: "'Paper taxes' yield little revenue. Estate duty, wealth tax and gift tax were paper taxes in India (all eventually abolished). Excise tax is a major productive revenue source — NOT a paper tax. Option 2." }
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

  const TEST_TITLE = 'SSC Selection Post Phase IX (Matriculation) - 10 February 2022 Shift-1';
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
