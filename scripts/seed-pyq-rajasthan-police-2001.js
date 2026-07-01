/**
 * Seed: Rajasthan Police Constable - 2001 (Hindi)
 * NEW state-level exam. 100 Q x 1 mark, single General Knowledge section, no
 * negative marking. Hindi-medium PYQ (questions/options kept in Devanagari,
 * verbatim from the Prepp scan; answer key printed inline as ( N ) per question).
 * Source PDF used legacy Devanagari fonts (no ToUnicode) -> questions recovered
 * by vision OCR of the rendered pages. Q4 printed only 3 options in the source.
 * Reuses existing Exam `RJ-POL-CONST` (ExamCategory State) + ExamPattern
 * 'Written Test' (section 'General Knowledge'); both pre-exist in the DB.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not found'); process.exit(1); }

const examCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Central', 'State'], required: true },
  slug: { type: String, lowercase: true, trim: true },
  description: { type: String, trim: true }
}, { timestamps: true });
const examSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamCategory', required: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  slug: { type: String, lowercase: true, trim: true },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
const examPatternSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  title: { type: String, required: true, trim: true },
  duration: { type: Number }, totalMarks: { type: Number }, negativeMarking: { type: Number },
  sections: [{ name: String, totalQuestions: Number, marksPerQuestion: Number,
    negativePerQuestion: Number, sectionDuration: Number }]
}, { timestamps: true });
const practiceTestSchema = new mongoose.Schema({
  examPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern', required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, lowercase: true, trim: true },
  totalMarks: { type: Number, required: true }, duration: { type: Number, required: true },
  accessLevel: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
  isPYQ: { type: Boolean, default: false }, pyqYear: { type: Number, default: null },
  pyqShift: { type: String, default: null }, pyqExamName: { type: String, default: null },
  publishedAt: { type: Date, default: Date.now },
  questions: [{
    questionText: { type: String, required: true },
    questionImage: { type: String, default: '' },
    options: [{ type: String, required: true }],
    optionImages: [{ type: String, default: '' }],
    correctAnswerIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, trim: true },
    explanationImage: { type: String, default: '' },
    section: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    difficulty: { type: String, enum: ['easy','medium','hard','mixed'], default: 'medium' }
  }]
}, { timestamps: true });

const ExamCategory = mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);
const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

const TAGS = ["Rajasthan Police", "Constable", "PYQ", "2001", "Hindi", "Rajasthan Police Constable - 2001"];
const RAW = [
  {
    "n": 1,
    "s": "General Knowledge",
    "q": "राजस्थान दिवस मनाया जाता है–",
    "o": [
      "30 जून को",
      "30 अप्रैल को",
      "30 मार्च को",
      "30 जनवरी को"
    ],
    "a": 2
  },
  {
    "n": 2,
    "s": "General Knowledge",
    "q": "बनास नदी का उद्गम स्थल है–",
    "o": [
      "खमनौर की पहाड़ियाँ",
      "बैराठ की पहाड़ियाँ",
      "गोगुन्दा की पहाड़ियाँ",
      "कुम्भलगढ़ की पहाड़ियाँ"
    ],
    "a": 0
  },
  {
    "n": 3,
    "s": "General Knowledge",
    "q": "भारत के राष्ट्रपति को पद से हटा सकते है ?",
    "o": [
      "भारत के प्रधानमंत्री",
      "भारत की लोकसभा",
      "भारत के मुख्य न्यायाधीश",
      "भारत की संसद"
    ],
    "a": 3
  },
  {
    "n": 4,
    "s": "General Knowledge",
    "q": "इनमें कौनसी गाय की नस्ल नहीं हैं ?",
    "o": [
      "राठी",
      "मुर्रा",
      "कांकरेज"
    ],
    "a": 1
  },
  {
    "n": 5,
    "s": "General Knowledge",
    "q": "एक्यूपंक्चर है–",
    "o": [
      "एक फसल का नाम",
      "चीन में प्रचलित चिकित्सा पद्धति",
      "एक पूर्व ऐतिहासिक पशु",
      "टार व ट्यूबों को ठीक करने की विधि"
    ],
    "a": 1
  },
  {
    "n": 6,
    "s": "General Knowledge",
    "q": "'नॉक आउट' शब्दावली का संबंध है–",
    "o": [
      "शतरंज से",
      "हॉकी से",
      "मुक्केबाजी से",
      "फुटबाल से"
    ],
    "a": 2
  },
  {
    "n": 7,
    "s": "General Knowledge",
    "q": "राज्य का जिला, जहाँ से कोई नदी प्रवाहित नहीं होती है ?",
    "o": [
      "नागौर",
      "बूँदी",
      "बीकानेर",
      "जोधपुर"
    ],
    "a": 2
  },
  {
    "n": 8,
    "s": "General Knowledge",
    "q": "वायुमण्डल में ओजोन परत-",
    "o": [
      "वर्षा करती है",
      "प्रदूषण करती है",
      "ऑक्सीजन उत्पन्न करती है",
      "पराबैंगनी विकिरण से रक्षा करती है"
    ],
    "a": 3
  },
  {
    "n": 9,
    "s": "General Knowledge",
    "q": "पक्षी जो उड़ नहीं सकती है?",
    "o": [
      "मुर्गा",
      "शुतुरमुर्ग",
      "कौआ",
      "चील"
    ],
    "a": 1
  },
  {
    "n": 10,
    "s": "General Knowledge",
    "q": "'बासमती' किस्म है-",
    "o": [
      "गेहूँ",
      "चावल की",
      "बाँस की",
      "नाशपाती की"
    ],
    "a": 1
  },
  {
    "n": 11,
    "s": "General Knowledge",
    "q": "रणथम्भौर पर अलाउद्दीन का आक्रमण हुआ-",
    "o": [
      "1301 ई. में",
      "1303 ई. में",
      "1305 ई. में",
      "1306 ई. में"
    ],
    "a": 0
  },
  {
    "n": 12,
    "s": "General Knowledge",
    "q": "बिजौलिया आन्दोलन का नेतृत्व किया-",
    "o": [
      "गुलाबचन्द्र ने",
      "जमनालाल बजाज ने",
      "केसरीसिंह बराहठ ने",
      "विजयसिंह पथिक ने"
    ],
    "a": 3
  },
  {
    "n": 13,
    "s": "General Knowledge",
    "q": "राजस्थान का राज्य पशु है-",
    "o": [
      "बाघ",
      "नीलगाय",
      "चिंकारा",
      "ऊँट"
    ],
    "a": 2
  },
  {
    "n": 14,
    "s": "General Knowledge",
    "q": "बीसलपुर परियोजना का संबंध है-",
    "o": [
      "बनास नदी से",
      "चाकण से",
      "जाखम नदी से",
      "गंभीरी से"
    ],
    "a": 0
  },
  {
    "n": 15,
    "s": "General Knowledge",
    "q": "तेरहताली नृत्य किया जाता है-",
    "o": [
      "शिवरात्री पर",
      "रामदेवजी के मेले पर",
      "तेजाजी के मेले पर",
      "भैरूजी के मेले पर"
    ],
    "a": 1
  },
  {
    "n": 16,
    "s": "General Knowledge",
    "q": "राजस्थान अभिलेखागार का मुख्यालय है-",
    "o": [
      "जयपुर",
      "जोधपुर",
      "अजमेर",
      "बीकानेर"
    ],
    "a": 3
  },
  {
    "n": 17,
    "s": "General Knowledge",
    "q": "सम्पत्ति का अधिकार-",
    "o": [
      "कानूनी अधिकार",
      "संवैधानिक अधिकार",
      "नैसर्गिक अधिकार",
      "मौलिक अधिकार"
    ],
    "a": 0
  },
  {
    "n": 18,
    "s": "General Knowledge",
    "q": "राजस्थान में मीठे पानी की झील है-",
    "o": [
      "पचदरा",
      "साँभर",
      "लूणकरणसर",
      "जयसमंद"
    ],
    "a": 3
  },
  {
    "n": 19,
    "s": "General Knowledge",
    "q": "अमर्त्य सेन को नोबेल पुरस्कार मिला-",
    "o": [
      "विश्वशान्ति के प्रयासों के लिए",
      "अर्थशास्त्र के लिए",
      "चिकित्सा विज्ञान में",
      "साहित्य के लिए"
    ],
    "a": 1
  },
  {
    "n": 20,
    "s": "General Knowledge",
    "q": "गहलोत अथवा सिसोदिया वंश के संस्थापक थे ?",
    "o": [
      "गुहिल",
      "भोज",
      "बप्पा रावल",
      "सिलादित्य"
    ],
    "a": 0
  },
  {
    "n": 21,
    "s": "General Knowledge",
    "q": "पटवों की हवेली स्थित है-",
    "o": [
      "जैसलमेर",
      "कोटा",
      "धौलपुर",
      "जोधपुर"
    ],
    "a": 0
  },
  {
    "n": 22,
    "s": "General Knowledge",
    "q": "पृथ्वीराज रासो की रचना की-",
    "o": [
      "केशवदास ने",
      "बाणभट्ट ने",
      "करणीदान ने",
      "चन्दबरदाई ने"
    ],
    "a": 3
  },
  {
    "n": 23,
    "s": "General Knowledge",
    "q": "लोकसभा का नेता होता है-",
    "o": [
      "राष्ट्रपति",
      "प्रधानमंत्री",
      "लोकसभा अध्यक्ष",
      "उपर्युक्त में से कोई नही"
    ],
    "a": 1
  },
  {
    "n": 24,
    "s": "General Knowledge",
    "q": "सामान्य व्यक्ति की हृदयगति होती है",
    "o": [
      "72 धड़कन प्रति मिनट",
      "60 धड़कन प्रति मिनट",
      "50 धड़कन प्रति मिनट",
      "80 धड़कन प्रति मिनट"
    ],
    "a": 0
  },
  {
    "n": 25,
    "s": "General Knowledge",
    "q": "महाराणा कुम्भा की हत्या की थी-",
    "o": [
      "ऊदा ने",
      "खिज खाँ ने",
      "स्वयं के द्वारा",
      "करणसिंह ने"
    ],
    "a": 0
  },
  {
    "n": 26,
    "s": "General Knowledge",
    "q": "'मौसर' क्या है?",
    "o": [
      "अरावली की एक जनजाति",
      "इसका सम्बन्ध सती से है",
      "मृत्युभोज की प्रथा",
      "एक झील का नाम"
    ],
    "a": 2
  },
  {
    "n": 27,
    "s": "General Knowledge",
    "q": "टेस्ट क्रिकेट में 500 विकट लिए-",
    "o": [
      "इमरान खाँ",
      "कपिलदेव",
      "कर्टनी वाल्श",
      "रिचर्स हेडली"
    ],
    "a": 2
  },
  {
    "n": 28,
    "s": "General Knowledge",
    "q": "राजस्थान का अन्न-भण्डार है-",
    "o": [
      "अजमेर",
      "गंगानगर",
      "भरतपुर",
      "कोटा"
    ],
    "a": 1
  },
  {
    "n": 29,
    "s": "General Knowledge",
    "q": "पानी में नमक मिलाने से उसका-",
    "o": [
      "उबाल बिन्दु बढ़ जाता है",
      "उबाल बिन्दु घट जाता है",
      "गलत बिन्दु बढ़ जाता है",
      "उबाल बिन्दु अपरिवर्तित रहता है"
    ],
    "a": 0
  },
  {
    "n": 30,
    "s": "General Knowledge",
    "q": "पन्नाधाय ने रक्षा की-",
    "o": [
      "राजकुमार अजीतसिंह की",
      "राजकुमार जोधासिंह की",
      "राजकुमार पृथ्वीसिंह की",
      "राजकुमार उदयसिंह की"
    ],
    "a": 3
  },
  {
    "n": 31,
    "s": "General Knowledge",
    "q": "ऐसी जनजाति जो मकान ( घर ) बनाकर नहीं रहती-",
    "o": [
      "सांसी",
      "भील",
      "गरासिया",
      "भोपा"
    ],
    "a": 2
  },
  {
    "n": 32,
    "s": "General Knowledge",
    "q": "कैलादेवी का मंदिर है-",
    "o": [
      "धौलपुर",
      "भरतपुर",
      "करौली",
      "सवाई माधोपुर"
    ],
    "a": 2
  },
  {
    "n": 33,
    "s": "General Knowledge",
    "q": "सागड़ी प्रथा का अन्य नाम है-",
    "o": [
      "देवदासी प्रथा",
      "बँधुआ मजदूर प्रथा",
      "वेश्यावृत्ति प्रथा",
      "सती प्रथा"
    ],
    "a": 1
  },
  {
    "n": 34,
    "s": "General Knowledge",
    "q": "बाड़मेरी प्रिन्ट को कहते है-",
    "o": [
      "अजरक",
      "बादला",
      "फड",
      "पिछवाई"
    ],
    "a": 0
  },
  {
    "n": 35,
    "s": "General Knowledge",
    "q": "जम्बेश्वर जी का मेला लगता है-",
    "o": [
      "मुकाम में",
      "लच्छीपुरा में",
      "पर्वतसर में",
      "गोरिया स्टेशन पर"
    ],
    "a": 0
  },
  {
    "n": 36,
    "s": "General Knowledge",
    "q": "राजस्थान में पशु चिकित्सा कॉलेज है-",
    "o": [
      "नागौर",
      "जयपुर",
      "बीकानेर",
      "कोटा"
    ],
    "a": 2
  },
  {
    "n": 37,
    "s": "General Knowledge",
    "q": "माठव कहते है-",
    "o": [
      "हाथी के रखवाले को",
      "आदिवासी जाति को",
      "शीतकालिन वर्षा को",
      "वाद्ययंत्र को"
    ],
    "a": 2
  },
  {
    "n": 38,
    "s": "General Knowledge",
    "q": "हवा में सबसे अधिक मात्रा में है-",
    "o": [
      "नाइट्रोजन",
      "हाइड्रोजन",
      "कार्बन डाइऑक्साइड",
      "ऑक्सीजन"
    ],
    "a": 0
  },
  {
    "n": 39,
    "s": "General Knowledge",
    "q": "एनीमिया रोग का कारण है-",
    "o": [
      "लोहे की अधिकता",
      "आयोडीन की कमी",
      "लोहे की कमी",
      "उपर्युक्त से कोई नहीं"
    ],
    "a": 2
  },
  {
    "n": 40,
    "s": "General Knowledge",
    "q": "राजस्थान का प्रमुख लोकनृत्य है-",
    "o": [
      "गरबा",
      "घूमर",
      "गिद्धा",
      "बीहू"
    ],
    "a": 1
  },
  {
    "n": 41,
    "s": "General Knowledge",
    "q": "राज्यसभा को भंग करने का अधिकार है-",
    "o": [
      "राष्ट्रपति को",
      "उपराष्ट्रपति को",
      "उच्चतम न्यायालय को",
      "उपर्युक्त में से कोई नहीं"
    ],
    "a": 3
  },
  {
    "n": 42,
    "s": "General Knowledge",
    "q": "राजस्थान का राज्य वृक्ष है-",
    "o": [
      "झरबेरी",
      "नीम",
      "खेजड़ी",
      "कीकर"
    ],
    "a": 2
  },
  {
    "n": 43,
    "s": "General Knowledge",
    "q": "पोलियो रोग का जनक है-",
    "o": [
      "जीवाणु",
      "कवक",
      "विषाणु",
      "प्रोटोजोआ"
    ],
    "a": 2
  },
  {
    "n": 44,
    "s": "General Knowledge",
    "q": "पुत्र गोपीचन्द ने भारत को सम्मान दिलाया-",
    "o": [
      "बैडमिन्टन में",
      "तीरन्दाजी में",
      "कुश्ती में",
      "तैराकी में"
    ],
    "a": 0
  },
  {
    "n": 45,
    "s": "General Knowledge",
    "q": "इन्दिरा गाँधी नहर के योजनाकार थे-",
    "o": [
      "कँवर सेन",
      "एम. वी. माथुर",
      "सीताराम",
      "प्रमोद करण"
    ],
    "a": 0
  },
  {
    "n": 46,
    "s": "General Knowledge",
    "q": "सिक्ख समुदाय के अन्तिम गुरू थे-",
    "o": [
      "गुरू अर्जुन देव",
      "गुरू गोविन्द सिंह",
      "गुरू तेगबहादुर",
      "इनमें से कोई नहीं"
    ],
    "a": 1
  },
  {
    "n": 47,
    "s": "General Knowledge",
    "q": "डूँगरपुर, बाँसवाड़ा का प्राचीन नाम है-",
    "o": [
      "हाड़ौती",
      "मेवाड़",
      "बागड़",
      "कंथान"
    ],
    "a": 2
  },
  {
    "n": 48,
    "s": "General Knowledge",
    "q": "हल्दीघाटी का युद्ध किनके बीच हुआ था?",
    "o": [
      "राणा कुम्भा एवं बाबर",
      "राणा साँगा एवं इब्राहिम लोदी",
      "बाबर एवं इब्राहिम लोदी",
      "महाराणा प्रताप एवं मानसिंह"
    ],
    "a": 3
  },
  {
    "n": 49,
    "s": "General Knowledge",
    "q": "ऊँट के चमड़े से बीकानेर में बना जल पात्र है-",
    "o": [
      "कावड़ा",
      "कोपी",
      "बादला",
      "उष्ट्र-पात्र"
    ],
    "a": 1
  },
  {
    "n": 50,
    "s": "General Knowledge",
    "q": "कृष्ण मृग देखे जा सकते हैं-",
    "o": [
      "शेरगढ़ में",
      "जैविक उद्यान, नाहरगढ़ से",
      "तालछापर में",
      "रणथम्भौर राष्ट्रीय, उद्यान"
    ],
    "a": 2
  },
  {
    "n": 51,
    "s": "General Knowledge",
    "q": "मोहम्मद गौरी ने पृथ्वीराज चौहान को पराजित किया -",
    "o": [
      "प्रथम तराई युद्ध में",
      "प्रथम पानीपत युद्ध में",
      "द्वितीय तराई युद्ध में",
      "खानवा के युद्ध में"
    ],
    "a": 2
  },
  {
    "n": 52,
    "s": "General Knowledge",
    "q": "हृदय की आवाज सुनने के लिए यंत्र है -",
    "o": [
      "स्ट्रोबाकोप",
      "स्टेथोस्कोप",
      "स्टीरियोस्कोप",
      "स्पेक्ट्रोमीटर"
    ],
    "a": 1
  },
  {
    "n": 53,
    "s": "General Knowledge",
    "q": "अरावली पर्वत श्रृंखला का अधिकांश भाग है -",
    "o": [
      "जैसलमेर में",
      "भीलवाड़ा में",
      "उदयपुर में",
      "जयपुर में"
    ],
    "a": 2
  },
  {
    "n": 54,
    "s": "General Knowledge",
    "q": "कोटा राज्य की नींव रखी -",
    "o": [
      "माधोसिंह ने",
      "राजसिंह ने",
      "सवाई जयसिंह ने",
      "बप्पा रावल ने"
    ],
    "a": 0
  },
  {
    "n": 55,
    "s": "General Knowledge",
    "q": "पेन्सिल का लेड है -",
    "o": [
      "ग्रेफाइड",
      "नारकोल",
      "लैम्प ब्लेक",
      "कोयला"
    ],
    "a": 0
  },
  {
    "n": 56,
    "s": "General Knowledge",
    "q": "अधिकतम प्रोटीन वाला वनस्पति खाद्य है -",
    "o": [
      "चना",
      "मटर",
      "सोयाबीन",
      "अरहर"
    ],
    "a": 2
  },
  {
    "n": 57,
    "s": "General Knowledge",
    "q": "संविधान की व्याख्या का अन्ति अधिकार है -",
    "o": [
      "लोकसभा अध्यक्ष को",
      "राष्ट्रपति को",
      "आटॉर्नी जनरल को",
      "उच्चतम न्यायालय को"
    ],
    "a": 3
  },
  {
    "n": 58,
    "s": "General Knowledge",
    "q": "अभ्यारण, जिसमें उड़न गिलहरी देखी जाती है -",
    "o": [
      "केसरबाग",
      "सीतामाता",
      "केवल देव",
      "सरिस्का"
    ],
    "a": 1
  },
  {
    "n": 59,
    "s": "General Knowledge",
    "q": "महाराणा प्रताप पुरस्कार सम्बन्धित है -",
    "o": [
      "खेलकुद",
      "साहित्य",
      "पत्रकारिता से",
      "विज्ञान से"
    ],
    "a": 0
  },
  {
    "n": 60,
    "s": "General Knowledge",
    "q": "ब्ल्यू पॉटरी के लिए पद्म श्री मिला -",
    "o": [
      "कृपालसिंह राव को",
      "कृपालसिंह शेखावत को",
      "किषनंला पटवा को",
      "कृपालसिंह कुमावत को"
    ],
    "a": 1
  },
  {
    "n": 61,
    "s": "General Knowledge",
    "q": "मांड गाय की सुप्रसिद्ध कलाकार है -",
    "o": [
      "उदयपुर",
      "सोनल",
      "हीराबाई बड़ोदकर",
      "अल्ला जिलाई बाई"
    ],
    "a": 3
  },
  {
    "n": 62,
    "s": "General Knowledge",
    "q": "ग्यारहवीं सदी का प्रसिद्ध सास-बहू मन्दिर है -",
    "o": [
      "उदयपुर में",
      "जोधपुर में",
      "अजमेर में",
      "अलवर में"
    ],
    "a": 0
  },
  {
    "n": 63,
    "s": "General Knowledge",
    "q": "नदी जिस पर मेजा बांध बना है -",
    "o": [
      "मन्सी",
      "कोठारी",
      "खारी",
      "बनास"
    ],
    "a": 1
  },
  {
    "n": 64,
    "s": "General Knowledge",
    "q": "डायबिटीज में रोगी का बढ़ जाता है -",
    "o": [
      "नमक",
      "शक्कर",
      "खारी",
      "बनास"
    ],
    "a": 1
  },
  {
    "n": 65,
    "s": "General Knowledge",
    "q": "चन्द्रमा पर ले जाने वाला वस्तु का भार -",
    "o": [
      "बढ़ जाता है",
      "कम हो जायेगा",
      "वही रहेगा",
      "थोडा सा बढ़ जायेगा"
    ],
    "a": 1
  },
  {
    "n": 66,
    "s": "General Knowledge",
    "q": "सेवण किसकी किस्म है ?",
    "o": [
      "पश्चिम राजस्थान की घास की",
      "रेगिस्तानी मिट्टी की",
      "मरूस्थलीय वनस्पति की",
      "रेगिस्तान भेड़ की"
    ],
    "a": 0
  },
  {
    "n": 67,
    "s": "General Knowledge",
    "q": "शुद्ध सोना होता है -",
    "o": [
      "20 कैरेट का",
      "22 कैरेट का",
      "24 कैरेट का",
      "26 कैरेट का"
    ],
    "a": 2
  },
  {
    "n": 68,
    "s": "General Knowledge",
    "q": "पहाड़ो में साँस लेने में कठिनाई का कारण है -",
    "o": [
      "हवा का कम दबाव",
      "बर्फ का जमना",
      "हवा में अधिक नमी",
      "उपर्युक्त में से कोई नहीं"
    ],
    "a": 0
  },
  {
    "n": 69,
    "s": "General Knowledge",
    "q": "अढ़ाई दिन झोपड़ा -",
    "o": [
      "जयपुर",
      "अजमेर",
      "अलवर",
      "झालावाड में"
    ],
    "a": 1
  },
  {
    "n": 70,
    "s": "General Knowledge",
    "q": "राजस्थान का नाम किस साहित्यकार की देन है?",
    "o": [
      "गोपीनाथ शर्मा",
      "कर्नल टाड",
      "श्यामलदास",
      "मैक्समूलर"
    ],
    "a": 1
  },
  {
    "n": 71,
    "s": "General Knowledge",
    "q": "प्रसिद्ध पोलो खिलाड़ी, जिसे पद्म भूषण मिल-",
    "o": [
      "राव राजा हणूतसिंह",
      "श्री प्रेमसिंह",
      "कैप्टन किषनसिंह",
      "महाराजा मानसिंह"
    ],
    "a": 0
  },
  {
    "n": 72,
    "s": "General Knowledge",
    "q": "भारत ने पहला परमाणु विस्फोट किया -",
    "o": [
      "कोटा में",
      "पोखरण में",
      "जैसलमेर में",
      "रणथम्भौर में"
    ],
    "a": 1
  },
  {
    "n": 73,
    "s": "General Knowledge",
    "q": "विश्व कप फुटबाल 2002 का आयोजन हुआ-",
    "o": [
      "आस्ट्रेलिया",
      "जापान",
      "ब्राजील",
      "द. कोरिया व जापान"
    ],
    "a": 3
  },
  {
    "n": 74,
    "s": "General Knowledge",
    "q": "पोथीखाना क्या है ?",
    "o": [
      "राजस्थान विश्वविद्यालय का पुस्तकालय",
      "कोटा स्थित संग्रालय",
      "जयपुर का चित्रकला संग्राहलय",
      "उपर्युक्त कोई नहीं"
    ],
    "a": 2
  },
  {
    "n": 75,
    "s": "General Knowledge",
    "q": "राजस्थान के सबसे निकट बन्दरगाह है -",
    "o": [
      "मद्रास",
      "मुम्बई",
      "काँडला",
      "पाराद्वीप"
    ],
    "a": 2
  },
  {
    "n": 76,
    "s": "General Knowledge",
    "q": "मुगलों से सर्वप्रथम वैवाहिक सम्बन्ध किये -",
    "o": [
      "हाडा कुल ने",
      "कछवाहा कुल ने",
      "राठौड कुल ने",
      "कहलोत कुल ने"
    ],
    "a": 1
  },
  {
    "n": 77,
    "s": "General Knowledge",
    "q": "राजस्थान से लोकसभा व राज्यसभा में सदस्य संख्या है -",
    "o": [
      "25 लोकसभा, 25 राज्यसभा",
      "25 लोकसभा, 10 राज्यसभा",
      "30 लोकसभा, 10 राज्यसभा",
      "30 लोकसभा, 12 राज्यसभा"
    ],
    "a": 1
  },
  {
    "n": 78,
    "s": "General Knowledge",
    "q": "रेगिस्तान का सागवान कौनसा वृक्ष है ?",
    "o": [
      "रोहिडा",
      "खेजड़ी",
      "खैर",
      "बबूल"
    ],
    "a": 0
  },
  {
    "n": 79,
    "s": "General Knowledge",
    "q": "करणीमाता का मन्दिर -",
    "o": [
      "अजमेर में",
      "सवाईमाधोपुर में",
      "चित्तौड़ में",
      "देशनोक में"
    ],
    "a": 3
  },
  {
    "n": 80,
    "s": "General Knowledge",
    "q": "बामीयान बुद्ध की प्रतिमा नष्ट की गई -",
    "o": [
      "इराक में",
      "अफगानिस्तान में",
      "पाकिस्तान में",
      "चीन में"
    ],
    "a": 1
  },
  {
    "n": 81,
    "s": "General Knowledge",
    "q": "बनी-ठनी किस शैली से सम्बन्धित है ?",
    "o": [
      "काँगड़ा शैली",
      "ग्वालियर शैली",
      "किशनगढ़ शैली",
      "जयपुर शैली"
    ],
    "a": 2
  },
  {
    "n": 82,
    "s": "General Knowledge",
    "q": "इन्टरनेट का सम्बन्ध है-",
    "o": [
      "मछली के जाल से",
      "बास्केटबॉल प्रतिस्पर्धा से",
      "अंतर्राष्ट्रीय पुलिस संस्था से",
      "कम्प्यूटर सूचना तंत्र से"
    ],
    "a": 3
  },
  {
    "n": 83,
    "s": "General Knowledge",
    "q": "विटामिन 'सी' का उत्तम स्रोत है -",
    "o": [
      "सेव",
      "आम",
      "आँवला",
      "दूध"
    ],
    "a": 2
  },
  {
    "n": 84,
    "s": "General Knowledge",
    "q": "राजस्थान में 'खुला विश्व विद्यालय' स्थापित है -",
    "o": [
      "अजमेर में",
      "कोटा में",
      "जयपुर में",
      "उदयपुर में"
    ],
    "a": 1
  },
  {
    "n": 85,
    "s": "General Knowledge",
    "q": "किस जिले की सीमा पंजाब से नहीं लगती है ?",
    "o": [
      "गंगानगर",
      "हनुमानगढ़",
      "बीकानेर",
      "किसी की नहीं"
    ],
    "a": 2
  },
  {
    "n": 86,
    "s": "General Knowledge",
    "q": "डायलेसिस का उपयोग किया जाता है -",
    "o": [
      "दिल के लिए",
      "दिमाग के लिए",
      "गुर्दे के लिए",
      "यकृत के लिए"
    ],
    "a": 2
  },
  {
    "n": 87,
    "s": "General Knowledge",
    "q": "गाय के थनों से दूध उतारने वाला हार्मोन है -",
    "o": [
      "सोमेटाट्रॉपिन",
      "ऑक्सीटोसिन",
      "इंटरफेरान",
      "इंसुलिन"
    ],
    "a": 1
  },
  {
    "n": 88,
    "s": "General Knowledge",
    "q": "विधानसभा सदस्यता की न्यूनतम आयु है -",
    "o": [
      "18 वर्ष",
      "25 वर्ष",
      "21 वर्ष",
      "कोई आयु सीमा नहीं"
    ],
    "a": 1
  },
  {
    "n": 89,
    "s": "General Knowledge",
    "q": "वायु-प्रदूषण का मुख्य कारक है -",
    "o": [
      "सीसा",
      "ताँबा",
      "जस्ता",
      "सोना"
    ],
    "a": 0
  },
  {
    "n": 90,
    "s": "General Knowledge",
    "q": "राजस्थान का गाँधी किसे कहा जाता है ?",
    "o": [
      "जमनालाल बजाज को",
      "नरोत्तमलाल जोशी को",
      "गोकुलभाई भट्ट को",
      "भागीलाल पण्डया को"
    ],
    "a": 2
  },
  {
    "n": 91,
    "s": "General Knowledge",
    "q": "लूनी नदी का जल गिरता है -",
    "o": [
      "बंगाल की खाड़ी में",
      "अरब सागर में",
      "कच्छ की खाड़ी में",
      "जवाई बाँध में"
    ],
    "a": 2
  },
  {
    "n": 92,
    "s": "General Knowledge",
    "q": "एच.आई.वी. से होना वाला रोग है –",
    "o": [
      "क्षय रोग",
      "आतशक",
      "कैंसर",
      "एड्स"
    ],
    "a": 3
  },
  {
    "n": 93,
    "s": "General Knowledge",
    "q": "ऑपरेशन फ्लड का सम्बन्ध है –",
    "o": [
      "डेयरी विकास से",
      "मछली विकास से",
      "खाद्यान्न प्रसंस्करण से",
      "बाढ़ नियंत्रण से"
    ],
    "a": 0
  },
  {
    "n": 94,
    "s": "General Knowledge",
    "q": "राजस्थान पूर्वी सिंहद्वार कहलाता है –",
    "o": [
      "अलवर",
      "भरतपुर",
      "धौलपुर",
      "डीग"
    ],
    "a": 1
  },
  {
    "n": 95,
    "s": "General Knowledge",
    "q": "गींदड़ लोकनृत्य किस क्षेत्र से जुड़ा है ?",
    "o": [
      "शेखावाटी",
      "हाड़ौती",
      "मेवाड़",
      "बागड़"
    ],
    "a": 0
  },
  {
    "n": 96,
    "s": "General Knowledge",
    "q": "वैज्ञानिक जिसे भारत का मिसाइलमैन कहते है –",
    "o": [
      "डॉ. विक्रम साराभाई",
      "एच. एन. सेठना",
      "डॉ. होमी भाभा",
      "डॉ. अब्दुल कलाम"
    ],
    "a": 3
  },
  {
    "n": 97,
    "s": "General Knowledge",
    "q": "टेलीविजन का आविष्कार किया –",
    "o": [
      "जी. मार्कोनी ने",
      "जे. एल. बेयर्ड ने",
      "गैलीलियों ने",
      "लुईस ब्रेली ने"
    ],
    "a": 1
  },
  {
    "n": 98,
    "s": "General Knowledge",
    "q": "गधों का मेला लगता है –",
    "o": [
      "जयपुर में",
      "भरतपुर में",
      "दौसा में",
      "धौलपुर में"
    ],
    "a": 0
  },
  {
    "n": 99,
    "s": "General Knowledge",
    "q": "वर्ष 200 का 'गाँधी शांति' पुरस्कार दिया गया –",
    "o": [
      "लता मंगेशकर को",
      "डॉ. चिमरंजन राणावत को",
      "विसमिल्ला खाँ को",
      "नेल्सन मण्डेल को"
    ],
    "a": 3
  },
  {
    "n": 100,
    "s": "General Knowledge",
    "q": "आयड़ स्थापत्य कला देख सकते हैं –",
    "o": [
      "उदयपुर में",
      "जोधपुर में",
      "अजमेर में",
      "बीकानेर में"
    ],
    "a": 0
  }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  // Reuse existing State ExamCategory (never create per-exam categories)
  let category = await ExamCategory.findOne({ type: 'State' });
  if (!category) {
    category = await ExamCategory.create({ name: 'State', type: 'State', slug: 'state',
      description: 'State government competitive exams' });
    console.log('Created ExamCategory: State');
  }

  // Create Exam RJ-POL-CONST on first run
  let exam = await Exam.findOne({ code: 'RJ-POL-CONST' });
  if (!exam) {
    exam = await Exam.create({ category: category._id, name: 'Rajasthan Police Constable',
      code: 'RJ-POL-CONST', slug: slugify('Rajasthan Police Constable'),
      description: 'Rajasthan Police Constable Recruitment Examination', isActive: true });
    console.log('Created Exam: RJ-POL-CONST');
  }

  // Reuse the existing ExamPattern 'Written Test' (has a 'General Knowledge' section)
  const PATTERN_TITLE = 'Written Test';
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) throw new Error(`ExamPattern "${PATTERN_TITLE}" not found for RJ-POL-CONST — aborting.`);

  const TEST_TITLE = "Rajasthan Police Constable - 2001";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  const questions = RAW.map(r => ({
    questionText: r.q, questionImage: '', options: r.o,
    optionImages: r.o.map(() => ''), correctAnswerIndex: r.a,
    explanation: '', section: r.s, tags: TAGS, difficulty: 'medium'
  }));

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 120, accessLevel: 'FREE', isPYQ: true, pyqYear: 2001,
    pyqShift: TEST_TITLE, pyqExamName: 'Rajasthan Police Constable', questions
  });
  console.log('Created PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
