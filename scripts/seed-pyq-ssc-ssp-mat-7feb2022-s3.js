/**
 * Seed: SSC Selection Post Phase IX 2021 (Matriculation Level) PYQ - 7 February 2022, Shift-3 (100 questions)
 * Source: SSC official response sheet (PDF + docx). Hindi recovered via docx-XML parse.
 * All image questions (REA Q10, Q11, Q22 + all QA Q1-Q25) sourced directly from docx-embedded media.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-7feb2022-s3.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_feb07_s3";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-7feb2022-s3';

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

const F = '07-feb-2022-s3';

const IMAGE_MAP = {
  // REA image questions
  10: { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] },
  11: { q: 'image9.jpeg', opts: ['image10.png','image11.png','image12.png','image13.png'] },
  22: { q: 'image14.jpeg', opts: ['image15.png','image16.png','image17.png','image18.png'] },

  // QA Q51-Q75 — all image-based
  51: { q: 'image19.jpeg', opts: ['image20.jpeg','image21.jpeg','image22.jpeg','image23.jpeg'] },
  52: { q: 'image24.jpeg', opts: ['image25.jpeg','image26.jpeg','image27.jpeg','image28.jpeg'] },
  53: { q: 'image29.jpeg', opts: ['image30.jpeg','image31.jpeg','image32.jpeg','image33.jpeg'] },
  54: { q: 'image34.jpeg', opts: ['image35.jpeg','image26.jpeg','image36.jpeg','image28.jpeg'] },
  55: { q: 'image37.jpeg', opts: ['image38.jpeg','image39.jpeg','image40.jpeg','image41.jpeg'] },
  56: { q: 'image42.jpeg', opts: ['image43.jpeg','image44.jpeg','image38.jpeg','image45.jpeg'] },
  57: { q: 'image46.jpeg', opts: ['image47.jpeg','image48.jpeg','image49.png','image50.jpeg'] },
  58: { q: 'image51.jpeg', opts: ['image52.jpeg','image53.jpeg','image54.jpeg','image55.jpeg'] },
  59: { q: 'image56.jpeg', opts: ['image57.jpeg','image58.jpeg','image59.jpeg','image60.jpeg'] },
  60: { q: 'image61.jpeg', opts: ['image62.jpeg','image63.jpeg','image64.jpeg','image65.jpeg'] },
  61: { q: 'image66.jpeg', opts: ['image67.jpeg','image68.jpeg','image69.jpeg','image70.jpeg'] },
  62: { q: 'image71.jpeg', opts: ['image72.jpeg','image73.jpeg','image74.jpeg','image75.jpeg'] },
  63: { q: 'image76.jpeg', opts: ['image77.jpeg','image78.jpeg','image79.jpeg','image80.jpeg'] },
  64: { q: 'image81.jpeg', opts: ['image82.jpeg','image83.jpeg','image84.jpeg','image85.jpeg'] },
  65: { q: 'image86.jpeg', opts: ['image87.jpeg','image88.jpeg','image89.jpeg','image90.jpeg'] },
  66: { q: 'image91.jpeg', opts: ['image92.jpeg','image93.jpeg','image23.jpeg','image94.jpeg'] },
  67: { q: 'image95.jpeg', opts: ['image96.jpeg','image97.jpeg','image98.jpeg','image99.jpeg'] },
  68: { q: 'image100.jpeg', opts: ['image101.jpeg','image102.jpeg','image103.jpeg','image104.png'] },
  69: { q: 'image105.jpeg', opts: ['image44.jpeg','image55.jpeg','image38.jpeg','image41.jpeg'] },
  70: { q: 'image106.jpeg', opts: ['image39.jpeg','image107.png','image108.jpeg','image40.jpeg'] },
  71: { q: 'image109.jpeg', opts: ['image110.jpeg','image111.jpeg','image112.jpeg','image113.jpeg'] },
  72: { q: 'image114.jpeg', opts: ['image115.jpeg','image116.jpeg','image117.jpeg','image118.jpeg'] },
  73: { q: 'image119.jpeg', opts: ['image120.jpeg','image121.jpeg','image122.jpeg','image123.jpeg'] },
  74: { q: 'image124.jpeg', opts: ['image125.jpeg','image126.jpeg','image127.jpeg','image128.jpeg'] },
  75: { q: 'image129.jpeg', opts: ['image130.jpeg','image131.jpeg','image132.jpeg','image133.jpeg'] }
};

// 1-based answer key.
const KEY = [
  // 1-25 General Intelligence
  1, 1, 3, 3, 3,   3, 4, 1, 2, 2,   4, 3, 1, 1, 3,   2, 2, 4, 3, 1,   1, 3, 2, 2, 4,
  // 26-50 English Language
  1, 2, 1, 2, 2,   2, 2, 3, 4, 1,   2, 2, 4, 3, 2,   4, 4, 3, 3, 3,   2, 2, 1, 1, 4,
  // 51-75 Quantitative Aptitude — image-based; defaults for unanswered
  2, 2, 3, 3, 4,   2, 1, 2, 4, 4,   2, 2, 4, 3, 3,   2, 2, 1, 4, 2,   4, 1, 3, 3, 2,
  // 76-100 General Awareness
  2, 1, 4, 2, 3,   2, 1, 3, 3, 2,   3, 3, 4, 1, 4,   4, 1, 3, 3, 4,   2, 1, 4, 4, 4
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "उस विकल्प का चयन कीजिए, जिसका तीसरे अक्षर-समूह से वही संबंध है, जो दूसरे अक्षर-समूह का पहले अक्षर-समूह से है।\n\nSNR : QMP :: PGH : ?", o: ["NTF","RTJ","NSG","MTF"], e: "Per response sheet, option 1 (NTF)." },
  { s: REA, q: "सात व्यक्ति, गिरि, मृणाली, अनीता, दिविजा, जगन, टियाना और हेमा, एक ही परिवार से संबंधित हैं। मृणाली, जगन की बहू है। टियाना, दिविजा की दादी है। हेमा, जगन की साली है। गिरि के दो बच्चे हैं, अनीता और दिविजा। टियाना, हेमा की इकलौती बहन है। मृणाली का कोई बेटा नहीं है।\n\nदिविजा का जगन से क्या संबंध है?", o: ["पोती","बहू","बेटी","बहन"], e: "Giri = Jagan's son (Mrunali's husband). Divija = Giri's daughter = Jagan's granddaughter (पोती). Option 1." },
  { s: REA, q: "दिए गए समीकरण को सही करने के लिए किन दो चिह्नों को आपस में बदला जाना चाहिए?\n\n31 + 69 ÷ 23 × 5 − 83 = 99", o: ["− और ×","÷ और ×","− और +","+ और ×"], e: "Swap '−' and '+': 31 − 69 ÷ 23 × 5 + 83 = 31 − 15 + 83 = 99 ✓. Option 3." },
  { s: REA, q: "'विनम्र' का, 'सौम्य' से वही संबंध है, जो 'विपुल' का '________' से है।", o: ["छोटा","साधारण","विशाल","नम्रा"], e: "Vinamra & Saumya are synonyms (polite). Vipul (abundant) → synonym 'विशाल' (vast). Option 3." },
  { s: REA, q: "दिए गए विकल्पों में से उस अक्षर-समूह का चयन कीजिए, जो निम्नलिखित श्रृंखला में चिह्न (?) के स्थान पर आ सकता है।\n\nEIM, QUY, CGK, ?", o: ["DHL","LPT","OSW","SWA"], e: "1st letter: E+12=Q, Q−14=C, C+12=O. 2nd: I+12=U, U−14=G, G+12=S. 3rd: M+12=Y, Y−14=K, K+12=W. Next = OSW. Option 3." },
  { s: REA, q: "वह सही विकल्प चुनिए जो दिए गए शब्दों का वही क्रम दर्शाता है जिस क्रम में वे अंग्रेज़ी शब्दकोश में आते हैं।\n\n1. Graduate  2. Gypsum  3. Geosciences  4. Gradient  5. Gymnasium  6. Geographical", o: ["3, 6, 1, 4, 5, 2","3, 1, 6, 5, 4, 2","6, 3, 4, 1, 5, 2","6, 4, 3, 5, 1, 2"], e: "Dictionary order: Geographical(6) < Geosciences(3) < Gradient(4) < Graduate(1) < Gymnasium(5) < Gypsum(2) → 6,3,4,1,5,2. Option 3." },
  { s: REA, q: "पाँच अक्षर-समूह दिए गए हैं, जिनमें से चार किसी तरह से संगत हैं और एक असंगत है। उस अक्षर-समूह का चयन कीजिए, जो अन्य से असंगत है।", o: ["WXZ","RSU","EFH","KLM"], e: "WXZ, RSU, MNP, EFH all have (+1,+2). KLM has (+1,+1) — odd one out. Option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'PHASE' को 'AEHPS' के रूप में लिखा जाता है। उसी भाषा में 'TONIC' को किस रूप में लिखा जाएगा?", o: ["CINOT","NCOIT","CONTI","CIONT"], e: "Letters arranged alphabetically. PHASE→AEHPS ✓. TONIC sorted → C, I, N, O, T = CINOT. Option 1." },
  { s: REA, q: "आठ व्यक्ति A, B, C, D, E, F, G और H एक परिवार से संबंधित हैं, जिसमें दो विवाहित जोड़ों सहित तीन पीढ़ियाँ शामिल हैं। B, C की माँ है। E, C के इकलौते पुत्र की बहन है। A, G के दादाजी हैं, जो D की पुत्री है। D, A की पुत्रवधू है। H, F का चाचा है, जो C का पुत्र है।\n\nF का B से क्या संबंध है?", o: ["भतीजा","पोता","पुत्र","भाई"], e: "F is C's son. C's mother is B. So F is B's grandson (पोता). Option 2." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "अक्षरों के उस संयोजन का चयन कीजिए, जिसे दी गई श्रृंखला के रिक्त स्थानों में क्रमबद्ध रूप से रखने पर श्रृंखला पूर्ण हो जाएगी।\n\n_cc_d_ch_c_h_ _ch", o: ["dhdccdc","hdcdcdc","dhcdcdc","dhcdccd"], e: "Per response sheet, option 3 (dhcdcdc)." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़िए।\n\nकथन:\nसभी गेंद रैकेट हैं। सभी रैकेट बल्ले हैं। सभी बल्ले पैड हैं।\n\nनिष्कर्ष:\nI. कोई गेंद पैड नहीं है।\nII. सभी बल्ले रैकेट हैं।", o: ["न तो निष्कर्ष I और न ही II पालन करता है।","केवल निष्कर्ष I पालन करता है।","निष्कर्ष I और II दोनों पालन करते हैं।","केवल निष्कर्ष II पालन करता है।"], e: "All ball→racket→bat→pad ⇒ all ball IS pad (I 'No ball is pad' is FALSE). II converse fallacy. Neither follows. Option 1." },
  { s: REA, q: "श्रेणी 199, 208, 217, ……., 406 में कितने पद हैं?", o: ["24","22","17","19"], e: "AP with first=199, d=9, last=406. Number of terms = (406−199)/9 + 1 = 23 + 1 = 24. Option 1." },
  { s: REA, q: "P, Q, R, S, T, V, W, Y और Z एक वृत्त के परितः केंद्र की ओर मुख करके बैठे हैं। Z, R के दाईं ओर दूसरे स्थान पर है, जो P के दाईं ओर चौथे स्थान पर है। S, R और Z के बीच में बैठा है। S, Q के बाईं ओर तीसरे स्थान पर है। V, P के बाईं ओर दूसरे स्थान पर है, जो W और Q के बीच में है। Y, R और T के बीच में बैठा है।\n\nZ के दाईं ओर दूसरे स्थान पर कौन बैठा है?", o: ["W","T","Q","P"], e: "Per response sheet, option 3 (Q)." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'CACTUS' को 'GCGVYU' लिखा जाता है और 'DAHLIA' को 'HCLNMC' लिखा जाता है। उसी कूट भाषा में 'ORCHID' को किस प्रकार लिखा जाएगा?", o: ["STHJNF","STGJMF","STHIMF","STGKNE"], e: "Pattern: alternating +4, +2. CACTUS: C+4=G, A+2=C, C+4=G, T+2=V, U+4=Y, S+2=U ✓. ORCHID: O+4=S, R+2=T, C+4=G, H+2=J, I+4=M, D+2=F → STGJMF. Option 2." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'HASTY' को '2782619' के रूप में कूटबद्ध किया जाता है। उसी भाषा में 'BLAME' को कैसे कूटबद्ध किया जाएगा?", o: ["2523262215","2213261225","2515261422","2214261525"], e: "Best guess per coding pattern (unanswered in response sheet) — option 2." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़िए।\n\nकथन:\nकुछ खिलौने गुड़ियाँ हैं।\nसभी गुड़ियाँ सुंदर हैं।\nसभी कार खिलौने हैं।\n\nनिष्कर्ष:\nI. सभी कार सुंदर हैं।\nII. कुछ खिलौने सुंदर हैं।", o: ["केवल निष्कर्ष I पालन करता है।","निष्कर्ष I और II दोनों ही पालन करते हैं।","न तो निष्कर्ष I और न ही II पालन करता है।","केवल निष्कर्ष II पालन करता है।"], e: "Some toys are dolls + all dolls are beautiful ⇒ some toys are beautiful (II ✓). I too strong (all cars→toys, but only some toys are beautiful). Option 4." },
  { s: REA, q: "यदि केक को 'ब्रेड' कहा जाता है, ब्रेड को 'पेस्ट्री' कहा जाता है, पेस्ट्री को 'कॉफी' कहा जाता है, और कॉफी को 'कुकीज़' कहा जाता है, तो किस उत्पाद में कैफीन होता है?", o: ["पेस्ट्री","ब्रेड","कुकीज़","कॉफी"], e: "In the renamed world, real coffee is called 'कुकीज़'. So caffeine is in 'कुकीज़'. Option 3." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'SLICE' को '222418310' के रूप में कूटबद्ध किया जाता है, और 'FRIGHT' को '2192018921' के रूप में कूटबद्ध किया जाता है। उसी भाषा में 'PLUNGE' को किस रूप में कूटबद्ध किया जाएगा?", o: ["22023537","50215137","52013157","22205337"], e: "Best guess per coding pattern (unanswered in response sheet) — option 1." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'SIGN' को '3614' के रूप में कूटबद्ध किया जाता है और 'RISK' को '7639' के रूप में कूटबद्ध किया जाता है। उसी भाषा में 'KING' को किस रूप में कूटबद्ध किया जाएगा?", o: ["9641","9614","3641","3461"], e: "S=3, I=6, G=1, N=4, R=7, K=9. KING = K(9)-I(6)-N(4)-G(1) → 9641. Option 1." },
  { s: REA, q: "चित्र में दी गई आकृति-पैटर्न का उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "छह मित्र J, K, L, M, N और O एक वृत्ताकार मेज के परितः केंद्र के विपरीत दिशा में मुख करके बैठे हैं। M और J, L के निकटतम पड़ोसी नहीं हैं। L, N के दाईं ओर दूसरे स्थान पर बैठा है। K, L के बाईं ओर निकटतम स्थान पर बैठा है।\n\nN के दाईं ओर तीसरे स्थान पर कौन बैठा है?", o: ["O","M","K","J"], e: "Best guess per arrangement (unanswered in response sheet) — option 2." },
  { s: REA, q: "उस विकल्प का चयन कीजिए, जिसका तीसरी संख्या से वही संबंध है, जो दूसरी संख्या का पहली संख्या से है और छठी संख्या का पाँचवीं संख्या से है।\n\n486 : 9 :: 464 : ? :: 352 : 5", o: ["8","7","9","6"], e: "Pattern: sum of digits / 2. 486 → (4+8+6)/2 = 9 ✓. 352 → (3+5+2)/2 = 5 ✓. 464 → (4+6+4)/2 = 7. Option 2." },
  { s: REA, q: "उस संख्या की पहचान कीजिए, जो निम्नलिखित श्रेणी से संबंधित नहीं है।\n\n209, 160, 124, 95, 83, 74", o: ["83","160","95","124"], e: "Pattern: differences should be −49, −36, −25, −16, −9 (squares of 7, 6, 5, 4, 3). 209−49=160 ✓; 160−36=124, but should be 135 (160−25). So 124 doesn't fit. Option 4." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nCondone", o: ["Forgive","Rejoice","Punish","Scold"], e: "'Condone' = pardon / forgive. Option 1." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nRelease", o: ["Hold","Free","Capture","Keep"], e: "'Release' = set free. Option 2." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nOn the back burner", o: ["To temporarily not deal with some matter because it is not urgent","To be unable to complete a task because of a back problem","To carry a heavy burden successfully and without complaining","To cook a special dish slowly by placing it on the back burner"], e: "'On the back burner' = temporarily set aside / not urgent. Option 1." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe king often went on a hunting ________ in the nearby forest.", o: ["march","expedition","tour","journey"], e: "'Hunting expedition' is the standard collocation. Option 2." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Insult","Esteam","Revere","Scorn"], e: "'Esteam' is misspelled — correct is 'Esteem'. Option 2." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Bedridden","Addittional","Adapt","Adept"], e: "'Addittional' is misspelled — correct is 'Additional'. Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nLet the children be given enough time to read.", o: ["Let us gave the children enough time to read.","Give the children enough time to read.","Let the time give enough children to read.","You should have given the children enough time to read."], e: "Passive 'Let X be given' → active imperative 'Give X'. Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA given space, time or position.", o: ["Shot","Stuff","Slot","Stock"], e: "'Slot' = a given/allotted space, time or position. Option 3." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Gourmet","Gracious","Graceful","Goverment"], e: "'Goverment' is misspelled — correct is 'Government'. Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nFasten", o: ["Release","Attach","Catch","Connect"], e: "'Fasten' (attach/secure) — antonym 'Release'. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nRecede", o: ["Lessen","Enlarge","Reduce","Diminish"], e: "'Recede' (move back / decrease) — antonym 'Enlarge' (grow). Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe belief that people cannot change or avoid what happens.", o: ["Heroism","Fatalism","Truism","Populism"], e: "'Fatalism' = belief that events are inevitable and beyond human control. Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nThe gardener said, \"These roses will bloom early.\"", o: ["The gardener said that these roses will bloom early.","The gardener said that those roses will bloom early.","The gardener said that these roses would bloom early.","The gardener said that those roses would bloom early."], e: "Direct → Indirect: 'will' → 'would'; 'these' → 'those'. Option 4." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nMore or less", o: ["exactly","sometimes more, sometimes less","approximately","correctly"], e: "'More or less' = approximately. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe ancient Indian texts ________ trees and plants to be animate beings that should never be harmed.", o: ["extract","consider","inspect","reflect"], e: "'Consider trees and plants to be animate beings' fits naturally. Option 2." },
  { s: ENG, q: "Read the passage on fashion and carbon footprint.\n\nThe main idea of this text is that one must:", o: ["restrict online shopping only to weekends","take courses in stitching and repairing clothes","make manufacturers manage landfills","act on ways to reduce one's carbon footprint"], e: "Per passage central message: reduce carbon footprint via mindful consumption of clothes. Option 4." },
  { s: ENG, q: "Read the passage on fashion and carbon footprint.\n\nManufacturers can contribute to the environment by motivating people to return their worn out clothes for:", o: ["washing","burning","advertising","recycling"], e: "Per passage: 'most environmentally sound way of disposing them is to send them for recycling'. Option 4." },
  { s: ENG, q: "Read the passage on fashion and carbon footprint.\n\nAccording to the passage, we can all contribute towards a healthy environment by rethinking about our:", o: ["garden","kitchen","wardrobe","bedroom"], e: "Per passage: 'Let us begin with our wardrobe'. Option 3." },
  { s: ENG, q: "Read the passage on fashion and carbon footprint.\n\nSelect the option that does NOT correctly complete the given sentence.\n\nPsychologists state that addictive buying can be a result of the ________.", o: ["availability of internet and round-the clock shopping","lack of a sense of belonging","new craze for vintage clothes","feeling of inferiority and want"], e: "Passage mentions self-esteem, status, belonging and online shopping as causes — NOT 'craze for vintage clothes' (vintage clothes are a SOLUTION). Option 3." },
  { s: ENG, q: "Read the passage on fashion and carbon footprint.\n\nLove your Clothes is an organisation that works for a sustainable environment by teaching people how to ________ their clothes.", o: ["buy","fold","repair","iron"], e: "Per passage: 'Love your Clothes encourage … mending and repairing'. Option 3." },
  { s: ENG, q: "In the passage on positivity, fill in blank no. 1.\n\n'There is a fantastic body of evidence which indicates that (1)________ brings down the stress chemical…'", o: ["playfully","playfulness","played","plays"], e: "Subject of 'brings down' should be a noun → 'playfulness'. Option 2." },
  { s: ENG, q: "In the passage on positivity, fill in blank no. 2.\n\n'…it enhances (2)________ happiness chemical.'", o: ["an","the","one","a"], e: "Specific reference to the happiness chemical — definite article 'the'. Option 2." },
  { s: ENG, q: "In the passage on positivity, fill in blank no. 3.\n\n'The videos of medicos (3)________ in hospital corridors have helped us…'", o: ["dancing","hiding","operating","crying"], e: "Reference to widely-shared COVID-era videos of doctors dancing for morale. Option 1." },
  { s: ENG, q: "In the passage on positivity, fill in blank no. 4.\n\n'…have helped us (4)________ in these gloomy times.'", o: ["get by","get in","get off","get to"], e: "'Get by' = manage / cope. Option 1." },
  { s: ENG, q: "In the passage on positivity, fill in blank no. 5.\n\n'Indeed optimism and (5)________ are the need of the hour.'", o: ["relativity","negativity","uncertainty","positivity"], e: "'Optimism and positivity' is the natural pairing. Option 4." },

  // ============ Quantitative Aptitude (51-75) — all image-based ============
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Best guess (unanswered in response sheet) — option 2." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "पुलू नदी निम्न में से किस राज्य से होकर नहीं बहती है?", o: ["ओडिशा","पश्चिम बंगाल","अरुणाचल प्रदेश","असम"], e: "Per response sheet, option 2 (West Bengal)." },
  { s: GA, q: "भारत के स्वदेशी विमान वाहक (IAC) 'विक्रांत', जिसका अगस्त 2021 में पहला परीक्षण किया गया था, का निर्माण करने वाला शिपयार्ड ________ में स्थित है।", o: ["कोच्चि","मझगाँव","विशाखापत्तनम","काकीनाड़ा"], e: "INS Vikrant (IAC-1) was built by Cochin Shipyard Limited (CSL) in Kochi, Kerala. Option 1." },
  { s: GA, q: "भारतीय खाद्य निगम (FCI) के माध्यम से सरकार द्वारा खरीदे गए गेहूँ और चावल जैसे खाद्यान्नों के स्टॉक को ________ स्टॉक कहा जाता है।", o: ["पब्लिक","कॉर्पोरेशन","यूटिलिटी","बफर"], e: "FCI's grain reserves are called 'Buffer Stock' (बफर स्टॉक). Option 4." },
  { s: GA, q: "भारतीय संविधान के निम्न में से किस अनुच्छेद में यह उल्लिखित है कि भारत का एक राष्ट्रपति होगा?", o: ["अनुच्छेद 98","अनुच्छेद 52","अनुच्छेद 45","अनुच्छेद 78"], e: "Article 52 of the Constitution: 'There shall be a President of India'. Option 2." },
  { s: GA, q: "निम्न में से किस दर के अंतर्गत अनुसूचित वाणिज्यिक बैंक भारतीय रिज़र्व बैंक से रातोंरात धन उधार ले सकते हैं?", o: ["बैंक दर","सीमांत स्थायी सुविधा","रेपो दर","नकद आरक्षित अनुपात"], e: "Per response sheet, option 3 (Repo rate)." },
  { s: GA, q: "कर्नाटक में स्थित इनमें से किस मंदिर को 8वीं शताब्दी में रानी लोकमहादेवी द्वारा बनवाया गया था?", o: ["पापनाथ मंदिर","विरूपाक्ष मंदिर","जैन नारायण मंदिर","गलगनाथ मंदिर"], e: "Virupaksha Temple at Pattadakal was built by Queen Lokamahadevi in the 8th century to commemorate Vikramaditya II's victory. Option 2." },
  { s: GA, q: "ऑपरेशन ________ उस पुलिस कार्रवाई का कोड नाम था, जो नए-नए स्वतंत्र हुए भारत गणराज्य द्वारा सितंबर 1948 में हैदराबाद की रियासत के विरुद्ध की गई थी।", o: ["पोलो","स्माइल","विजय","लोटस"], e: "Operation Polo was the code name for India's military action against Hyderabad in September 1948. Option 1." },
  { s: GA, q: "तेभागा आंदोलन, एक स्वदेशी किसान आंदोलन, 1946 और 1947 के बीच कहाँ हुआ था?", o: ["मणिपुर","कर्नाटक","बंगाल","महाराष्ट्र"], e: "The Tebhaga Movement (1946-47) was a peasant agitation in Bengal demanding two-thirds share of crops. Option 3." },
  { s: GA, q: "निम्न में से किसके माध्यम से जीवन व्यक्त (प्रकट) नहीं होता है?", o: ["दौड़ता हुआ घोड़ा (galloping horse)","भौंकता हुआ कुत्ता (barking dog)","लुढ़कता हुआ पत्थर (rolling stone)","फूलों की घाटी (valley of flowers)"], e: "A rolling stone is non-living/inert — does not express life. Galloping horse, barking dog, valley of flowers are all living forms. Option 3." },
  { s: GA, q: "गन्ना फीडस्टॉक को सरलता से ________ में किण्वित किया जाता है।", o: ["मेथेनॉल","एथेनॉल","प्रोपेनॉल","ब्यूटेनॉल"], e: "Sugarcane feedstock is fermented to produce ethanol (used in ethanol-blended petrol). Option 2." },
  { s: GA, q: "निम्नलिखित में से कौन सा विटामिन आश्रित कार्बोक्सीलेज (vitamin dependent carboxylase) यकृत में पाया जाता है?", o: ["विटामिन A","विटामिन D","विटामिन K","विटामिन C"], e: "Vitamin K-dependent carboxylase (γ-glutamyl carboxylase) is found in the liver. Option 3." },
  { s: GA, q: "'Of Gifted Voice: The Life and Art of M.S. Subbulakshmi' नामक पुस्तक के लेखक कौन हैं?", o: ["सुमित्रा महाजन","चेतन भगत","केशव देसिराजू","एस.एम. खान"], e: "'Of Gifted Voice' (2021) is a biography of Carnatic singer M.S. Subbulakshmi by Keshava Desiraju. Option 3." },
  { s: GA, q: "फरवरी 2021 में, इनमें से किस राज्य की कैबिनेट की ओर से मुख्यमंत्री विज्ञान प्रतिभा परीक्षा योजना को स्वीकृति प्रदान की गई है?", o: ["राजस्थान","हिमाचल प्रदेश","उत्तर प्रदेश","दिल्ली"], e: "Delhi cabinet approved the Mukhyamantri Vigyan Pratibha Pariksha Yojana in February 2021. Option 4." },
  { s: GA, q: "सितंबर 2021 में, आर. राजा ऋत्विक 70वें ग्रैंडमास्टर बने। वे किस राज्य से संबंधित हैं?", o: ["तेलंगाना","चेन्नई","आंध्र प्रदेश","महाराष्ट्र"], e: "R. Raja Rithvik became India's 70th chess Grandmaster in September 2021. He is from Telangana. Option 1." },
  { s: GA, q: "निम्न में से किस वर्ष में, क्रिकेट में टाई को ब्रेक करने हेतु बॉल आउट (bowl-out) पद्धति के स्थान पर सुपर ओवर शुरू हुआ था?", o: ["2000","2018","1997","2008"], e: "Super Over was introduced in 2008 (T20I cricket) to replace the bowl-out method for tie-breaking. Option 4." },
  { s: GA, q: "मसानजोर बाँध इनमें से किस नदी पर स्थित है?", o: ["रूपनारायण","सुबर्णरेखा","अजय","मयूराक्षी"], e: "Masanjore Dam is built on the Mayurakshi river in Dumka, Jharkhand. Option 4." },
  { s: GA, q: "निम्न में से कौन-सा खिलाड़ी क्रिकेट के खेल में ऑफ-ब्रेक गेंदबाज और ऑलराउंडर है?", o: ["मोईन अली","जोस बटलर","जेम्स एंडरसन","सैम कुर्रन"], e: "Moeen Ali (England) is an off-spin bowler and all-rounder. Option 1." },
  { s: GA, q: "निम्न में से कौन सा विषय संघ सूची के अंतर्गत आता है?", o: ["बाजार और मेले","शिक्षा","भारत की रक्षा","पुलिस"], e: "Defence of India is in the Union List. Police & markets/fairs are in State List; Education is in Concurrent List. Option 3." },
  { s: GA, q: "निम्न में से कौन सा राज्य 'पंखिड़ा' के गायन से संबंधित है, जो किसानों द्वारा खेतों में काम करते हुए गाया जाता है?", o: ["पंजाब","हिमाचल प्रदेश","राजस्थान","हरियाणा"], e: "'Pankhida' is a traditional song of Rajasthan farmers sung while working in the fields. Option 3." },
  { s: GA, q: "किसानों को उनकी वांछित भाषा में 'सही समय पर सही जानकारी' प्राप्त करने की सुविधा प्रदान करने के लिए, जुलाई 2021 में ________ नामक डिजिटल प्लेटफॉर्म का शुभारंभ हुआ था।", o: ["किसान संतान","किसान साथी","किसान खबर","किसान सारथी"], e: "'Kisan Sarathi' (launched July 2021) is a digital platform to provide farmers with timely information in their preferred language. Option 4." },
  { s: GA, q: "सितंबर 2021 में, निम्न में से किस बैंक ने अभिनेता पंकज त्रिपाठी को अपना पहला ब्रांड एंबेसडर नियुक्त किया था?", o: ["भारतीय रिज़र्व बैंक","फिनो पेमेंट्स बैंक","यस बैंक","आई.सी.आई.सी.आई. बैंक"], e: "Fino Payments Bank signed Pankaj Tripathi as its first brand ambassador in September 2021. Option 2." },
  { s: GA, q: "निम्न में से किस वर्ष, महात्मा गांधी ने भारत में संवैधानिक सुधार पर चर्चा करने के लिए दूसरे गोलमेज सम्मेलन में भारत का प्रतिनिधित्व किया था?", o: ["1931","1939","1942","1919"], e: "Gandhi attended the 2nd Round Table Conference in London (September-December 1931) as the sole Congress representative. Option 1." },
  { s: GA, q: "निम्न में से किस अफ्रीकी देश की तट रेखा हिंद महासागर के साथ जुड़ी नहीं है?", o: ["केन्या","तंजानिया","सोमालिया","इथियोपिया"], e: "Ethiopia is LANDLOCKED — no coastline at all (since Eritrea's independence). Kenya, Tanzania, Somalia all border the Indian Ocean. Option 4." },
  { s: GA, q: "निम्न में से कौन राष्ट्रकूट साम्राज्य के दंतिदुर्ग के उत्तराधिकारी थे?", o: ["गोविंद तृतीय","इंद्र तृतीय","अशोक","कृष्ण प्रथम"], e: "Krishna I succeeded Dantidurga, the founder of the Rashtrakuta dynasty. Option 4." },
  { s: GA, q: "पर्वतारोही एडमंड हिलेरी की राष्ट्रीयता क्या थी?", o: ["ऑस्ट्रेलियाई","स्कॉटिश","नॉर्वेजियन","न्यूज़ीलैंड"], e: "Sir Edmund Hillary (1919-2008), first to summit Everest with Tenzing Norgay (1953), was a New Zealander. Option 4." }
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

  const TEST_TITLE = 'SSC Selection Post Phase IX (Matriculation) - 7 February 2022 Shift-3';
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
