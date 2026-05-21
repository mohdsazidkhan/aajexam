/**
 * Seed: SSC Selection Post Phase IX 2021 (Matriculation Level) PYQ - 16 February 2022, Shift-1 (100 questions)
 * Source: SSC official response sheet (PDF + docx). Hindi recovered via docx-XML parse.
 * Note: PDF metadata reads "Exam Date 16/03/2022" but folder convention says 16 Feb — went with folder convention.
 * All image questions (REA Q4/Q5/Q15 + all QA Q1-Q25) sourced directly from docx-embedded media.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-mat-16feb2022-s1.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_feb16_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-16feb2022-s1';

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

const F = '16-feb-2022-s1';

const IMAGE_MAP = {
  // REA image questions
  4:  { q: 'image4.jpeg', opts: ['image5.png','image6.png','image7.png','image8.png'] },
  5:  { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] },
  15: { q: 'image14.jpeg', opts: ['image15.png','image16.png','image17.png','image18.png'] },

  // QA Q51-Q75 — all image-based
  51: { q: 'image19.jpeg', opts: ['image20.jpeg','image21.png','image22.jpeg','image23.jpeg'] },
  52: { q: 'image24.jpeg', opts: ['image25.jpeg','image26.jpeg','image27.jpeg','image28.jpeg'] },
  53: { q: 'image29.jpeg', opts: ['image30.jpeg','image31.jpeg','image32.jpeg','image33.jpeg'] },
  54: { q: 'image34.jpeg', opts: ['image35.jpeg','image36.jpeg','image37.jpeg','image38.jpeg'] },
  55: { q: 'image39.jpeg', opts: ['image40.jpeg','image41.jpeg','image42.jpeg','image43.jpeg'] },
  56: { q: 'image44.png', opts: ['image45.jpeg','image46.jpeg','image47.jpeg','image48.jpeg'] },
  57: { q: 'image49.jpeg', opts: ['image50.jpeg','image51.jpeg','image52.jpeg','image53.jpeg'] },
  58: { q: 'image54.jpeg', opts: ['image55.jpeg','image56.jpeg','image57.jpeg','image58.jpeg'] },
  59: { q: 'image59.jpeg', opts: ['image60.jpeg','image61.jpeg','image62.jpeg','image63.jpeg'] },
  60: { q: 'image64.png', opts: ['image65.jpeg','image66.jpeg','image67.jpeg','image68.jpeg'] },
  61: { q: 'image69.jpeg', opts: ['image70.jpeg','image71.jpeg','image72.jpeg','image73.jpeg'] },
  62: { q: 'image74.jpeg', opts: ['image75.jpeg','image76.jpeg','image77.jpeg','image78.jpeg'] },
  63: { q: 'image79.jpeg', opts: ['image80.jpeg','image81.jpeg','image82.jpeg','image83.jpeg'] },
  64: { q: 'image84.jpeg', opts: ['image85.jpeg','image86.jpeg','image87.jpeg','image88.jpeg'] },
  65: { q: 'image89.jpeg', opts: ['image90.jpeg','image91.jpeg','image92.jpeg','image93.jpeg'] },
  66: { q: 'image94.jpeg', opts: ['image95.jpeg','image96.jpeg','image97.jpeg','image98.jpeg'] },
  67: { q: 'image99.png', opts: ['image100.jpeg','image101.jpeg','image102.jpeg','image103.jpeg'] },
  68: { q: 'image104.jpeg', opts: ['image105.jpeg','image106.jpeg','image107.jpeg','image108.jpeg'] },
  69: { q: 'image109.jpeg', opts: ['image110.jpeg','image38.jpeg','image111.jpeg',''] },
  70: { q: 'image112.jpeg', opts: ['image113.jpeg','image114.jpeg','image115.jpeg','image116.jpeg'] },
  71: { q: 'image117.jpeg', opts: ['image118.jpeg','image119.jpeg','image120.jpeg','image121.jpeg'] },
  72: { q: 'image122.jpeg', opts: ['image123.jpeg','image124.jpeg','image125.jpeg','image126.jpeg'] },
  73: { q: 'image127.jpeg', opts: ['image128.jpeg','image129.jpeg','image130.jpeg','image131.jpeg'] },
  74: { q: 'image132.jpeg', opts: ['image133.jpeg','image126.jpeg','image124.jpeg','image134.jpeg'] },
  75: { q: 'image135.jpeg', opts: ['image136.jpeg','image137.jpeg','image138.jpeg','image139.jpeg'] }
};

// 1-based answer key.
const KEY = [
  // 1-25 General Intelligence
  2, 2, 3, 4, 4,   3, 1, 2, 4, 4,   4, 4, 1, 3, 3,   3, 4, 2, 4, 2,   3, 1, 1, 1, 4,
  // 26-50 English Language
  4, 3, 3, 3, 4,   3, 2, 3, 3, 4,   2, 3, 4, 3, 1,   3, 1, 3, 3, 4,   1, 3, 1, 3, 1,
  // 51-75 Quantitative Aptitude — image-based
  2, 2, 4, 2, 2,   2, 3, 3, 2, 2,   3, 2, 3, 2, 3,   3, 4, 2, 2, 4,   2, 4, 2, 2, 2,
  // 76-100 General Awareness
  2, 4, 1, 3, 4,   4, 2, 4, 2, 2,   4, 2, 4, 3, 2,   4, 1, 2, 2, 2,   3, 2, 3, 2, 1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "एक निश्चित कूट भाषा में, 'PUPILS' को 'KFKROH' लिखा जाता है। उसी कूट भाषा में 'EQUAL' को किस प्रकार लिखा जाएगा?", o: ["VJGZP","VJFZO","VKFZP","WJFBO"], e: "Per response sheet, option 2 (VJFZO)." },
  { s: REA, q: "सात मित्र अरविंद, भानु, चरण, दिलीप, प्रेम, कौशल और गोपाल एक वृत्ताकार भोजन-मेज के परितः केंद्र की ओर मुख करके बैठे हैं। कौशल, गोपाल के दाईं ओर दूसरे स्थान पर बैठा है। भानु, कौशल के बगल में बैठा है, लेकिन चरण के बगल में नहीं बैठा है। प्रेम चरण के बगल में बैठा और गोपाल के दाईं ओर चौथे स्थान पर बैठा है। दिलीप, प्रेम और अरविंद के बीच में बैठा है।\n\nगोपाल के बाईं ओर चौथे स्थान पर कौन बैठा है?", o: ["दिलीप","चरण","प्रेम","भानु"], e: "Per response sheet, option 2 (Charan)." },
  { s: REA, q: "अक्षरों के उस संयोजन का चयन कीजिए, जिसे दी गई श्रृंखला के रिक्त स्थानों में क्रमिक रूप से रखने पर श्रृंखला पूर्ण हो जाएगी।\n\nT K _ T K T _ P _ K _ K P T K _ K _ T K", o: ["P, T, T, K, P, T","P, T, K, P, T, K","P, K, T, T, T, P","P, K, T, P, K, T"], e: "Per response sheet, option 3 (P, K, T, T, T, P)." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "उस विकल्प का चयन कीजिए, जिसका तीसरे शब्द से वही संबंध है, जो दूसरे शब्द का पहले शब्द से है।\n\nजटिल : सरल :: डरपोक : ?", o: ["शर्मीला","ईर्ष्यालु","साहसी","घमंडी"], e: "जटिल/सरल are antonyms (complex/simple). डरपोक (coward) → antonym = साहसी (brave). Option 3." },
  { s: REA, q: "किन दो चिह्नों को आपस में बदलने पर दिया गया समीकरण संतुलित हो जाएगा?\n\n48 ÷ 12 + 42 − 24 × 3 = 34", o: ["– और +","+ और ×","÷ और +","÷ और –"], e: "Swap − and +: 48 ÷ 12 − 42 + 24 × 3 = 4 − 42 + 72 = 34 ✓. Option 1." },
  { s: REA, q: "P, M का पिता है। T, V का पुत्र है। Z, M की पत्नी है। Z का पिता Q, V का पति है।\n\nT का Z से क्या संबंध है?", o: ["चाचा","भाई","पुत्र","भांजा"], e: "Q (Z's father) is V's husband → V is Z's mother. T is V's son → T is Z's brother (same parents). Option 2." },
  { s: REA, q: "उस विकल्प का चयन कीजिए, जिसका तीसरे पद से वही संबंध है, जो दूसरे पद का पहले पद से है।\n\nGUARD : TFZIW :: PLOTS : ?", o: ["KOMFH","MNLGH","KOMGE","KOLGH"], e: "Each letter mirrored about alphabet (A↔Z, B↔Y, position 27−n). G(7)→T(20) ✓, U(21)→F(6) ✓, A↔Z ✓, R(18)→I(9) ✓, D(4)→W(23) ✓. PLOTS → 27−16=11=K, 12→O, 15→L, 20→G, 19→H = KOLGH. Option 4." },
  { s: REA, q: "K, C की माँ है। M, P की बहन है। U, P की माँ है। G, K और P का पिता है।\n\nU का C से क्या संबंध है?", o: ["माँ","दादा","चाची","दादी"], e: "K and P are siblings (G is father of both). U is K's mother → U is C's maternal grandmother (दादी / नानी). Option 4." },
  { s: REA, q: "उस विकल्प का चयन कीजिए, जिसका तीसरी संख्या से वही संबंध है, जो दूसरी संख्या का पहली संख्या से है और छठी संख्या का पाँचवीं संख्या से है।\n\n4 : 32 :: 7 : ? :: 12 : 192", o: ["93","98","105","77"], e: "Pattern: n × (n + 4). 4 × 8 = 32 ✓. 12 × 16 = 192 ✓. 7 × 11 = 77. Option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'play well' को 'Se Te' लिखा जाता है, 'do well' को 'Te Ge' लिखा जाता है, और 'do it' को 'Ge Fe' लिखा जाता है। उसी कूट भाषा में 'do play' को किस प्रकार लिखा जाएगा?", o: ["Fe Te","Ge Fe","Te Ge","Ge Se"], e: "Common in sets 1&2: 'well' = Te. Common in 2&3: 'do' = Ge. So 'play' = Se. 'do play' = Ge Se. Option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'SPAIN' को '14-9-1-16-19' लिखा जाता है। उसी कूट भाषा में 'MADRAS' को किस प्रकार लिखा जाएगा?", o: ["19-1-18-4-1-13","19-1-17-4-1-14","19-1-18-6-2-13","18-1-19-4-1-12"], e: "Pattern: alphabet positions in REVERSE order. SPAIN: S(19)P(16)A(1)I(9)N(14) reversed = 14-9-1-16-19 ✓. MADRAS: M(13)A(1)D(4)R(18)A(1)S(19) reversed = 19-1-18-4-1-13. Option 1." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए, जो निम्नलिखित श्रेणी में चिह्न (?) के स्थान पर आ सकती है।\n\n4, 22, 47, 83, 132, 198, 283, ?", o: ["419","319","391","491"], e: "1st diffs: 18, 25, 36, 49, 66, 85. 2nd diffs: 7, 11, 13, 17, 19 (primes). Next prime = 23. Next 1st diff = 85 + 23 = 108. 283 + 108 = 391. Option 3." },
  { s: REA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'ROCKET' को '36' और 'MASON' को '25' लिखा जाता है। उसी कूट भाषा में 'SERVITUDE' को किस प्रकार लिखा जाएगा?", o: ["48","56","81","64"], e: "Code = (number of letters)². ROCKET = 6², 6²=36 ✓. MASON = 5²=25 ✓. SERVITUDE = 9², 9²=81. Option 3." },
  { s: REA, q: "उस सही विकल्प का चयन कीजिए, जो निम्नलिखित शब्दों को तार्किक और सार्थक क्रम में दर्शाता है।\n\n1. भारत  2. उड़ीसा  3. विश्व  4. ब्रह्मांड  5. एशिया", o: ["2, 1, 5, 4, 3","1, 2, 5, 3, 4","2, 1, 3, 5, 4","2, 1, 5, 3, 4"], e: "Ascending containment: Odisha(2) ⊂ India(1) ⊂ Asia(5) ⊂ World(3) ⊂ Universe(4) → 2,1,5,3,4. Option 4." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़ें।\n\nकथन: सभी तोते कौवे हैं। सभी कौवे चील हैं।\n\nनिष्कर्ष:\nI. सभी तोते चील हैं।\nII. कुछ कौवे तोते हैं।", o: ["केवल निष्कर्ष II पालन करता है।","निष्कर्ष I और II दोनों पालन करते हैं।","केवल निष्कर्ष I पालन करता है।","या तो निष्कर्ष I या II पालन करता है।"], e: "I: parrots ⊆ crows ⊆ eagles → all parrots are eagles ✓. II: all parrots are crows → some crows are parrots ✓. Both follow. Option 2." },
  { s: REA, q: "दिए गए विकल्पों में से उस संख्या का चयन कीजिए, जो निम्नलिखित श्रेणी में चिह्न (?) के स्थान पर आ सकती है।\n\n20, 25, 35, 50, 70, ?", o: ["100","85","90","95"], e: "1st diffs: 5, 10, 15, 20 (each +5). Next diff = 25. 70 + 25 = 95. Option 4." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'POISED' को 'CDRHNO' लिखा जाता है। उसी कूट भाषा में 'LEASED' को किस प्रकार लिखा जाएगा?", o: ["CDRZEK","CDRZDK","BDRYDK","CDSZEK"], e: "Reverse word and shift each letter −1. POISED reversed = DESIOP; each −1 → C,D,R,H,N,O = CDRHNO ✓. LEASED reversed = DESAEL; −1 each → C,D,R,Z,D,K = CDRZDK. Option 2." },
  { s: REA, q: "उस सही विकल्प का चयन कीजिए, जो दिए गए शब्दों के उस क्रम को दर्शाता है, जिस क्रम में वे अंग्रेज़ी शब्दकोश में मौजूद होते हैं।\n\n1. Factual  2. Facade  3. Facelift  4. Fantasy  5. Fenugreek", o: ["5, 3, 1, 4, 2","2, 3, 4, 1, 5","2, 3, 1, 4, 5","2, 1, 3, 4, 5"], e: "Dictionary order: Facade(2), Facelift(3), Factual(1), Fantasy(4), Fenugreek(5) → 2,3,1,4,5. Option 3." },
  { s: REA, q: "उस विकल्प का चयन कीजिए, जिसका तीसरे पद से वही संबंध है, जो दूसरे पद का पहले पद से है।\n\nTEMPER : REPMET :: EMOTION : ?", o: ["NOITOME","NTOIOME","ITNOOEM","NOITMEO"], e: "Pattern: reverse the word. TEMPER → REPMET ✓. EMOTION reversed = NOITOME. Option 1." },
  { s: REA, q: "अदिति, विनीता, साक्षी, योद्धा, सुकृति और रोहिणी एक वृत्ताकार मेज के परितः मेज के केंद्र की ओर मुख करके बैठी हैं। साक्षी, योद्धा के बाईं ओर तीसरे स्थान पर बैठी है। सुकृति अदिति के दाईं ओर ठीक बगल में बैठी है। विनीता रोहिणी के बाईं ओर ठीक बगल में बैठी है, जो साक्षी के दाईं ओर दूसरे स्थान पर बैठी है।\n\nरोहिणी के दाईं ओर ठीक बगल में कौन बैठी है?", o: ["योद्धा","अदिति","सुकृति","साक्षी"], e: "Facing centre: right=anticlockwise. Set Yodha=1 (clockwise). Sakshi=4 (3rd clockwise from Yodha). Rohini=2 (2nd anticlockwise from Sakshi). Vinita=3 (1 clockwise from Rohini). Aditi=6, Sukriti=5. Immediate right (anticlockwise) of Rohini = position 1 = Yodha. Option 1." },
  { s: REA, q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़िए।\n\nकथन: कोई सर्टिफिकेट कागज नहीं है। सभी पेन कागज हैं।\n\nनिष्कर्ष:\nI. कोई सर्टिफिकेट पेन नहीं है।\nII. कोई कागज सर्टिफिकेट नहीं है।\nIII. कुछ कागज पेन हैं।", o: ["निष्कर्ष I, II और III, सभी पालन करते हैं","केवल निष्कर्ष I और III पालन करते हैं","केवल निष्कर्ष I और II पालन करते हैं","केवल निष्कर्ष II और III पालन करते हैं"], e: "I: certificate ∩ paper = ∅, pens ⊆ paper → certificate ∩ pen = ∅ ✓. II: 'no certificate is paper' converts to 'no paper is certificate' ✓. III: all pens are paper → some paper are pen ✓. All three follow. Option 1." },
  { s: REA, q: "एक निश्चित कूट भाषा में, 'NOTEPAD' को '456' और 'NUCLEOUS' को '424' लिखा जाता है। उसी कूट भाषा में 'AMBIENT' को किस प्रकार लिखा जाएगा?", o: ["585","500","400","485"], e: "Per response sheet (unanswered), option 4 (485) as best guess." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nCompact", o: ["Firm","Solid","Tight","Loose"], e: "'Compact' = tightly packed. Antonym = Loose. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nShe is quite clever, ________?", o: ["is she","aren't she","isn't she","is it"], e: "Tag question for positive 'is' → negative 'isn't she'. Option 3." },
  { s: ENG, q: "Select the correctly spelt word.", o: ["Spakling","Sparkeling","Sparkling","Sparklling"], e: "'Sparkling' is the correct spelling. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDense", o: ["Thick","Packed","Sparse","Close"], e: "'Dense' = thick / closely packed. Antonym = Sparse (thinly distributed). Option 3." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nMOROSE", o: ["delightful","faithful","beautiful","mournful"], e: "'Morose' = sullen/gloomy/sad. Synonym = mournful. Option 4." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe sound made by a camel", o: ["Bark","Trumpet","Grunt","Growl"], e: "Camels 'grunt'. (Bark=dog, Trumpet=elephant, Growl=tiger/dog.) Option 3." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nsee the light of day", o: ["come out of difficulties","become publicly known","be very happy","get up early in the morning"], e: "'See the light of day' = come into existence or become publicly known. Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA blank book for keeping a collection of photographs, stamps or pictures.", o: ["Anthology","Diary","Album","Atlas"], e: "'Album' = blank book to hold photographs, stamps, etc. Option 3." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Preview","Preserve","Premeir","Presume"], e: "'Premeir' is misspelled — correct is 'Premier'. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in reported speech.\n\nKavya said, \"I am writing a paragraph on the Republic Day parade.\"", o: ["Kavya said that I am writing a paragraph on the Republic Day parade.","Kavya said that I was writing a paragraph on the Republic Day parade.","Kavya said that she is writing a paragraph on the Republic Day parade.","Kavya said that she was writing a paragraph on the Republic Day parade."], e: "Direct → indirect: I → she; am → was. Option 4." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nlose count of", o: ["something that happens rarely","forget the accurate total","depend on others for help","waste a lot of money"], e: "'Lose count of' = forget the exact number / total. Option 2." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Graduate","Gradation","Graiceous","Gratification"], e: "'Graiceous' is misspelled — correct is 'Gracious'. Option 3." },
  { s: ENG, q: "Select the correct passive form of the given sentence.\n\nMy brother picked up my friend from the airport.", o: ["My brother was picked up by my friend from the airport.","My friend has picked up my brother from the airport.","My friend has been picked up by my brother from the airport.","My friend was picked up by my brother from the airport."], e: "Past simple active → past simple passive: subject/object swap, 'picked up' → 'was picked up by'. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nYou went to meet your friend yesterday, ________?", o: ["haven't you","have you","didn't you","did you"], e: "Tag question for positive past simple 'went' → 'didn't you'. Option 3." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nrelease", o: ["free","hold","fix","rise"], e: "'Release' = set free. Option 1." },
  { s: ENG, q: "Read the passage on Rahul's cooking.\n\nWhat did Rahul get from the supermarket?", o: ["Cucumber and carrots","Rice and milk","Peas and paneer","Tomatoes and onions"], e: "Passage: 'Rahul prepared peas and paneer which he bought during the day from the supermarket'. Option 3." },
  { s: ENG, q: "Read the passage on Rahul's cooking.\n\nWhich ingredients did Rahul put in the soup that he prepared?\n(a) Tomatoes  (b) Onions  (c) Carrots", o: ["a, b and c","a and b","b and c","a and c"], e: "Passage: 'He put in tomatoes, carrots and onions in the soup' — all three. Option 1." },
  { s: ENG, q: "Read the passage on Rahul's cooking.\n\nMatch the people with the dishes they liked.\n(a) Rahul's wife → ?  (b) Rahul's mother → ?  (c) Rahul's friends → ?\n1. Soup  2. Peas and paneer  3. Salad", o: ["a-2, b-1, c-3","a-3, b-2, c-1","a-3, b-1, c-2","a-1, b-3, c-2"], e: "Wife loved salad (3); mother loved soup (1); friends liked peas and paneer (2). a-3, b-1, c-2. Option 3." },
  { s: ENG, q: "Read the passage on Rahul's cooking.\n\nHow did Rahul manage to get the cream for the soup?", o: ["His wife got it for him.","He bought it from the supermarket.","He whipped the fresh cream from the milk.","He just took it out of the fridge."], e: "Passage: 'Rahul took some fresh cream from the milk in the fridge, whipped it'. Option 3." },
  { s: ENG, q: "Read the passage on Rahul's cooking.\n\nHow did Rahul get the cookbook?", o: ["He bought it from the supermarket.","His friends brought it for him.","His mother got it for him.","His wife presented it to him."], e: "Passage: 'his wife … decided to get a cookbook for him … She presented it to him in the morning'. Option 4." },
  { s: ENG, q: "Read the passage on man-vs-creatures.\n\nSelect the most appropriate option to fill in blank No. 1.\n\n'creatures which he (1)________ harmful'", o: ["considers","observes","remembers","recognizes"], e: "'He considers harmful' — judgment verb. Option 1." },
  { s: ENG, q: "Read the passage on man-vs-creatures.\n\nSelect the most appropriate option to fill in blank No. 2.\n\n'his warfare makes (2)________ or no difference'", o: ["few","less","little","fewer"], e: "'Little or no difference' — standard idiom (uncountable). Option 3." },
  { s: ENG, q: "Read the passage on man-vs-creatures.\n\nSelect the most appropriate option to fill in blank No. 3.\n\n'He (3)________ those creatures that are useful'", o: ["favours","declines","proves","decides"], e: "'Favours useful creatures' — supportive verb. Option 1." },
  { s: ENG, q: "Read the passage on man-vs-creatures.\n\nSelect the most appropriate option to fill in blank No. 4.\n\n'our (4)________ to song-birds, birds of prey and other animals'", o: ["impression","behaviour","attitude","belief"], e: "'Our attitude to' is the natural collocation. Option 3." },
  { s: ENG, q: "Read the passage on man-vs-creatures.\n\nSelect the most appropriate option to fill in blank No. 5.\n\n'is (5)________ by the fact that they have either been proved useful or of no consequence'", o: ["determined","adapted","completely","certainly"], e: "'Is determined by the fact' — fits grammatically and meaningfully. Option 1." },

  // ============ Quantitative Aptitude (51-75) — all image-based ============
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },
  { s: QA, q: "चित्र में दिए गए प्रश्न को देखकर उत्तर दीजिए।", o: ["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"], e: "Per response sheet (unanswered), option 2 as best guess." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "प्राचीन भारत में, पहली सहस्राब्दी ईस्वी (CE) के मध्य लिखी गई 'जातक कथाएं' इनमें से किस भाषा में लिखी गई थीं?", o: ["संस्कृत","पाली","अरामाइक","खरोष्ठी"], e: "Jataka tales (stories of the previous lives of Buddha) were originally written in Pali. Option 2." },
  { s: GA, q: "भारत का निम्नलिखित में से कौन सा स्मारक यूनेस्को (UNESCO) की विश्व विरासत स्थलों की सूची में शामिल नहीं है?", o: ["सूर्य मंदिर, कोणार्क","काकतीय रुद्रेश्वर (रामप्पा) मंदिर, तेलंगाना","जंतर मंतर, जयपुर","जंतर मंतर, नई दिल्ली"], e: "Jantar Mantar Jaipur is a UNESCO site; Jantar Mantar in New Delhi is NOT. Option 4." },
  { s: GA, q: "पत्रकारों के विरुद्ध अपराधों से दंड-मुक्ति को समाप्त करने हेतु अंतर्राष्ट्रीय दिवस कब मनाया जाता है?", o: ["2 नवंबर","2 जनवरी","2 अक्टूबर","2 दिसंबर"], e: "International Day to End Impunity for Crimes against Journalists is observed annually on 2 November. Option 1." },
  { s: GA, q: "1799 में श्रीरंगपट्टनम की जंग में टीपू सुल्तान की मृत्यु और मैसूर के पतन के बाद, उस राज्य में किस राजवंश का आधिपत्य स्थापित हो गया?", o: ["पशुपति","निज़ाम","वाडियार","चेर"], e: "After Tipu Sultan's death (1799), the Wodeyar dynasty was restored to the throne of Mysore by the British (Krishnaraja Wodeyar III). Option 3." },
  { s: GA, q: "स्वर्गीय लता मंगेशकर ने 13 वर्ष की आयु में अपना पहला गीत किस मराठी फिल्म के लिए रिकॉर्ड किया था?", o: ["काय गो सखू","राम राम पावना","साधी मानस","किती हसाल"], e: "Lata Mangeshkar recorded her first song 'Naachu Yaa Gade' at age 13 in 1942 for the Marathi film 'Kiti Hasaal'. Option 4." },
  { s: GA, q: "भारतीय संघ के राज्यों में संवैधानिक तंत्र की विफलता से संबंधित संवैधानिक प्रावधान भारतीय संविधान के किस अनुच्छेद में दिए गए हैं?", o: ["354","352","358","356"], e: "Article 356 provides for President's Rule on failure of constitutional machinery in States. Option 4." },
  { s: GA, q: "जनवरी 2022 में, संयुक्त राष्ट्र विकास कार्यक्रम (UNDP) की यूथ क्लाइमेट चैम्पियन बनने वाली पहली भारतीय कौन हैं?", o: ["स्नेहा शाही","प्राज्ञा कोली","गर्विता गुलाटी","कृति तुला"], e: "Prajakta Koli was appointed UNDP India's first Youth Climate Champion in January 2022. Option 2." },
  { s: GA, q: "निम्नलिखित में से कौन सा अधिनियम 1919 में पारित किया गया था, जिसने ब्रिटिश सरकार को अदालत में मुकदमा चलाए बिना किसी भी व्यक्ति को गिरफ्तार करने और कैद करने का अधिकार प्रदान किया था?", o: ["भारतीय परिषद अधिनियम","भारतीय रक्षा अधिनियम","राजद्रोही बैठकों की रोकथाम अधिनियम","रॉलेट अधिनियम"], e: "The Rowlatt Act (1919) gave the British government powers to imprison without trial. Option 4." },
  { s: GA, q: "LED का पूर्ण रूप क्या है, जो आज उपलब्ध विभिन्न प्रकार के सभी अर्ध-चालक डायोडों में से सर्वाधिक व्यापक रूप से उपयोग किया जाता है?", o: ["Light Emanating Diode","Light Emitting Diode","Light Energy Diode","Light Emersion Diode"], e: "LED = Light Emitting Diode. Option 2." },
  { s: GA, q: "मुगल शासन के दौरान, पंचायतों का सरदार एक मुखिया होता था, जिसे ________ कहा जाता था।", o: ["मनसबदार","मुक़द्दम (Muqaddam)","पटवारी","प्रधान"], e: "Under Mughal rule, the village panchayat head was called Muqaddam. (Patwari was the revenue accountant.) Option 2." },
  { s: GA, q: "'सेवन समर्स (Seven Summers)' नामक पुस्तक के लेखक कौन हैं?", o: ["नीरद सी. चौधरी","मुल्क राज आनंद","अरुण शौरी","आर.के. नारायण"], e: "'Seven Summers' (1951) is the first volume of Mulk Raj Anand's autobiography. Option 2." },
  { s: GA, q: "भारत सरकार की अटल पेंशन योजना (APY) निम्न में से किस आयु वर्ग के सभी बचत बैंक/डाकघर के बचत बैंक खाताधारकों के लिए उपलब्ध है?", o: ["15 से 55 वर्ष","21 से 60 वर्ष","18 से 55 वर्ष","18 से 40 वर्ष"], e: "Atal Pension Yojana is available for the 18-40 age group. Option 4." },
  { s: GA, q: "निम्नलिखित में से कौन सा राष्ट्रीय अभियान यह सुनिश्चित करने के लिए है कि भारत के प्रत्येक विद्यालय में एक निर्धारित कार्य-प्रणाली और सुव्यवस्थित जल, स्वच्छता, एवं शुचिता सुविधाएं उपलब्ध हों?", o: ["स्वच्छ बनेगा स्कूल: स्वच्छ बनेगा भारत","स्वच्छ भारत: स्वच्छ विद्यालय","स्वच्छ भारत: स्वच्छ विद्यार्थी","हैप्पी स्कूल: हैप्पी स्टूडेंट्स"], e: "'Swachh Bharat: Swachh Vidyalaya' is the national campaign (2014) for school sanitation. Option 2." },
  { s: GA, q: "कोव्वुर और राजमुंदरी को जोड़ने वाला एशिया का सबसे लंबा रेल-सह-सड़क पुल इनमें से किस नदी पर स्थित है?", o: ["कृष्णा","नर्मदा","कावेरी","गोदावरी"], e: "The Godavari Arch Bridge (Asia's longest rail-cum-road bridge of its kind) connects Kovvur and Rajahmundry across the Godavari river. Option 4." },
  { s: GA, q: "निम्नलिखित में से कौन सा राष्ट्रीय उद्यान मध्य प्रदेश में स्थित नहीं है?", o: ["मंडला पादप जीवाश्म राष्ट्रीय उद्यान","बांधवगढ़ राष्ट्रीय उद्यान","मानस राष्ट्रीय उद्यान","कान्हा राष्ट्रीय उद्यान"], e: "Manas National Park is in Assam (not MP). The other three are in Madhya Pradesh. Option 3." },
  { s: GA, q: "Which of the following crops can be grown primarily in low rainfall areas of Western India?", o: ["Tea","Millet","Rubber","Coffee"], e: "Millet (बाजरा) is the principal low-rainfall crop in western India (Rajasthan/Gujarat). Tea/Rubber/Coffee require high rainfall. Option 2." },
  { s: GA, q: "भारतीय संविधान का अनुच्छेद 1 निम्नलिखित में से किससे संबंधित है?", o: ["प्रस्तावना","नागरिकता","नए राज्यों का गठन और मौजूदा राज्यों के क्षेत्रों, सीमाओं या नामों में परिवर्तन","संघ का नाम और क्षेत्र"], e: "Article 1: 'Name and territory of the Union' — declares India that is Bharat to be a Union of States. Option 4." },
  { s: GA, q: "2028 के ग्रीष्मकालीन ओलंपिक खेल ________ में आयोजित किए जाएंगे।", o: ["लॉस एंजिलस","पेरिस","लंदन","बीजिंग"], e: "The 2028 Summer Olympics will be held in Los Angeles, USA. Option 1." },
  { s: GA, q: "लिबरेशन टाइगर्स ऑफ़ तमिल ईलम (LTTE), जो एक गोरिल्ला संगठन था, की स्थापना ________ द्वारा की गई थी।", o: ["ए. नेमिनाथन","वेलुपिल्लई प्रभाकरन","एस. रविशंकर","डगलस देवानंद"], e: "LTTE was founded by Velupillai Prabhakaran in May 1976. Option 2." },
  { s: GA, q: "सर्वाधिक संक्रामक मानव रोगों में से एक — जुकाम, इनमें से किस समूह के वायरस के कारण होता है?", o: ["रोटावायरस","राइनोवायरस","पार्वोवायरस","साइटोमेगालो वायरस"], e: "The common cold is most often caused by Rhinoviruses (~30-80% of cases). Option 2." },
  { s: GA, q: "मांडो महोत्सव (Mando Festival) इनमें से किस राज्य में मनाया जाता है?", o: ["महाराष्ट्र","गुजरात","गोवा","कर्नाटक"], e: "Mando Festival is celebrated in Goa — devoted to the traditional Konkani song-dance form 'Mando'. Option 3." },
  { s: GA, q: "भारत की 2011 की जनगणना के आंकड़ों के अनुसार, भारत में हिंदुओं और मुसलमानों के बाद तीसरा सबसे बड़ा धार्मिक समुदाय कौन सा है?", o: ["बौद्ध","ईसाई","जैन","सिख"], e: "Per Census 2011: Hindu 79.8%, Muslim 14.2%, Christian 2.3%, Sikh 1.7%, Buddhist 0.7%, Jain 0.4%. Christians are the 3rd largest community. Option 2." },
  { s: GA, q: "न्यायालय की अवमानना अधिनियम ________ में पारित किया गया था।", o: ["1972","1970","1971","1973"], e: "The Contempt of Courts Act was enacted in 1971. Option 3." },
  { s: GA, q: "स्तनधारी वर्ग के जीवों का सर्वाधिक अद्वितीय लक्षण ________ की उपस्थिति है।", o: ["जबड़े में एक ही प्रकार के दांत","स्तन ग्रंथियां (mammary glands)","त्रि-कक्षीय हृदय","चलने/उड़ने/तैरने के लिए अनुकूलित अंगों की जोड़ी"], e: "Mammary glands are the defining unique characteristic of mammals (Mammalia). Option 2." },
  { s: GA, q: "पद्म विभूषण से सम्मानित पंडित बिरजू महाराज, जिनका 17 जनवरी 2022 को निधन हो गया, निम्नलिखित में से किस नृत्य शैली से संबद्ध थे?", o: ["कथक","कुचिपुड़ी","भरतनाट्यम","कथकली"], e: "Pandit Birju Maharaj was the legendary doyen of the Kalka-Bindadin Gharana of Kathak. Option 1." }
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

  const TEST_TITLE = 'SSC Selection Post Phase IX (Matriculation) - 16 February 2022 Shift-1';
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
