/**
 * Seed: Rajasthan Police Constable - 2008 (Hindi)
 * State-level exam PYQ, 98 questions, single General Knowledge section, no
 * negative marking. Hindi-medium, verbatim Devanagari from the Prepp "Solved
 * Paper" scan (legacy fonts -> recovered by vision OCR of rendered pages).
 * Answers printed inline as ( N ); a few clipped-edge answers were derived. 2 questions omitted (missing options / undeterminable answer).
 * Reuses existing Exam `RJ-POL-CONST` + ExamPattern 'Written Test'.
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

const examSchema = new mongoose.Schema({
  category: mongoose.Schema.Types.ObjectId, name: String, code: String
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

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

const TAGS = ["Rajasthan Police", "Constable", "PYQ", "2008", "Hindi", "Rajasthan Police Constable - 2008"];
const RAW = [
  {
    "n": 1,
    "s": "General Knowledge",
    "q": "एक टेबल एवं 6 कुर्सियों का मूल्य 4800 रू. है। यदि एक कुर्सी 300 रू. की है, तो 7 टेबल का मूल्य कितना होगा?",
    "o": [
      "32,000 रू.",
      "30,000 रू.",
      "21,000 रू.",
      "23,000 रू."
    ],
    "a": 2
  },
  {
    "n": 2,
    "s": "General Knowledge",
    "q": "गणना कीजिए –\n11×11+12×12+13×13 = ?",
    "o": [
      "526",
      "426",
      "434",
      "534"
    ],
    "a": 2
  },
  {
    "n": 3,
    "s": "General Knowledge",
    "q": "निम्न श्रृंखला में अगला अक्षर क्या होगा?\na, b, d, g, ...................",
    "o": [
      "k",
      "1",
      "30 m",
      "j"
    ],
    "a": 0
  },
  {
    "n": 4,
    "s": "General Knowledge",
    "q": "निम्न में से कौनसी संख्या 9 से पूर्णतया विभाजित है?",
    "o": [
      "48,736",
      "23,607",
      "31,591",
      "67,133"
    ],
    "a": 1
  },
  {
    "n": 5,
    "s": "General Knowledge",
    "q": "खाली स्थान में कौनसा अंक आएगा?",
    "o": [
      "48",
      "45",
      "36",
      "39"
    ],
    "a": 3
  },
  {
    "n": 6,
    "s": "General Knowledge",
    "q": "1 से 50 तक की संख्याओं का योग कितना होगा?",
    "o": [
      "1,051",
      "1,151",
      "1,275",
      "1,271"
    ],
    "a": 2
  },
  {
    "n": 7,
    "s": "General Knowledge",
    "q": "गणना कीजिए –\n101×99+99×99 = ?",
    "o": [
      "18,900",
      "19,900",
      "18,800",
      "19,800"
    ],
    "a": 3
  },
  {
    "n": 8,
    "s": "General Knowledge",
    "q": "अंक 2, 0, 3, 8, 9 से पाँच अंको की सबसे छोटी संख्या कौनसी बनती है?",
    "o": [
      "20,389",
      "23,089",
      "23,098",
      "20,938"
    ],
    "a": 0
  },
  {
    "n": 9,
    "s": "General Knowledge",
    "q": "निम्न श्रृंखला में अगला अंक क्या होगा?\n2, 8, 18, 32, .................",
    "o": [
      "40",
      "50",
      "52",
      "60"
    ],
    "a": 1
  },
  {
    "n": 10,
    "s": "General Knowledge",
    "q": "आपके रिश्तेदार को सड़क पर चलते हुए स्कूटर से टक्कर लगी। आप सबसे पहले क्या करेंगे?",
    "o": [
      "शोर मचाएँगे एवं भीड एकत्रित करेंगे।",
      "स्कूटर के नम्बर नोट करेंगे।",
      "रिश्तेदार को तुरंत हॉस्पीटल ले जाएँगे।",
      "स्कूटर का पीछा करेंगे।"
    ],
    "a": 1
  },
  {
    "n": 11,
    "s": "General Knowledge",
    "q": "वर्ष 1981 में आबादी वर्ष 1961 की तुलना में अधिक हो गई?",
    "o": [
      "25 करोड़",
      "14 करोड़",
      "69 करोड़",
      "44 करोड़"
    ],
    "a": 0
  },
  {
    "n": 12,
    "s": "General Knowledge",
    "q": "वर्ष 1991 से वर्ष 2001 की अवधि में आबादी की वृद्धि प्रति वर्ष औसत कितनी रही?",
    "o": [
      "1.03 करोड़",
      "0.85 करोड़",
      "1.8 करोड़",
      "0.88 करोड़"
    ],
    "a": 2
  },
  {
    "n": 13,
    "s": "General Knowledge",
    "q": "किस अवधि में आबादी की वृद्धि दर औसत रूप से सबसे कम रही?",
    "o": [
      "1961-71",
      "1971-81",
      "1981-91",
      "1991-2001"
    ],
    "a": 0
  },
  {
    "n": 14,
    "s": "General Knowledge",
    "q": "अंग्रेजी शब्दकोश में निम्न में से कौनसा शब्द सबसे बाद में आएगा?",
    "o": [
      "SPOON",
      "SPEAK",
      "SPOUSE",
      "SPECIAL"
    ],
    "a": 2
  },
  {
    "n": 15,
    "s": "General Knowledge",
    "q": "अंक 2, 6, 0 एवं 3 से चार अंको की सबसे बडी एवं छोटी संख्या में कितना अंतर होगा?",
    "o": [
      "4284",
      "3286",
      "2864",
      "6084"
    ],
    "a": 0
  },
  {
    "n": 16,
    "s": "General Knowledge",
    "q": "निम्न में से कौन अपवाद है?",
    "o": [
      "तेंदुआ",
      "चीता",
      "बाघ",
      "लकड़बग्गा"
    ],
    "a": 2
  },
  {
    "n": 17,
    "s": "General Knowledge",
    "q": "कौनसा अंक विसंगत है?",
    "o": [
      "8",
      "27",
      "49",
      "64"
    ],
    "a": 2
  },
  {
    "n": 19,
    "s": "General Knowledge",
    "q": "कौनसा अंक संख्या 25 से पूर्णतया विभाजित नहीं है?",
    "o": [
      "12,775",
      "37,225",
      "40,810",
      "59,550"
    ],
    "a": 2
  },
  {
    "n": 20,
    "s": "General Knowledge",
    "q": "ताजमहल : भारत : : पिरामिड : ?",
    "o": [
      "ईरान",
      "मिस्र",
      "अमरीका",
      "जापान"
    ],
    "a": 1
  },
  {
    "n": 21,
    "s": "General Knowledge",
    "q": "1 + 1 × 1 ÷ 1 - 1 + 1 × 1 = ?",
    "o": [
      "0",
      "1",
      "2",
      "3"
    ],
    "a": 2
  },
  {
    "n": 22,
    "s": "General Knowledge",
    "q": "खाली स्थान में क्या अंक जाएगा?",
    "o": [
      "5",
      "6",
      "7",
      "8"
    ],
    "a": 0
  },
  {
    "n": 23,
    "s": "General Knowledge",
    "q": "गणना कीजिए – 2 × 2 + 6 × 6 + 8 × 8 + 12 × 12 = ?",
    "o": [
      "248",
      "244",
      "240",
      "236"
    ],
    "a": 0
  },
  {
    "n": 24,
    "s": "General Knowledge",
    "q": "निम्न में से कौन विसंगत है?",
    "o": [
      "चीन",
      "बेल्जियम",
      "टोकियो",
      "मैक्सिको"
    ],
    "a": 2
  },
  {
    "n": 25,
    "s": "General Knowledge",
    "q": "निम्न में से क्या विसंगत है?",
    "o": [
      "मिराज",
      "मिग",
      "बोइंग",
      "जगुआर"
    ],
    "a": 2
  },
  {
    "n": 26,
    "s": "General Knowledge",
    "q": "निम्न में से क्या विसंगत है?",
    "o": [
      "सी.पी.यू.",
      "मॉनिटर",
      "माउस",
      "टेलीफोन"
    ],
    "a": 3
  },
  {
    "n": 27,
    "s": "General Knowledge",
    "q": "एक समूह में बैठे 5 व्यक्तियों की औसत उम्र 26 वर्ष है। एक और व्यक्ति जोड़ने पर इन सभी की औसत उम्र 27 वर्ष हो जाती है। इस नए व्यक्ति की उम्र क्या है?",
    "o": [
      "27 वर्ष",
      "30 वर्ष",
      "32 वर्ष",
      "36 वर्ष"
    ],
    "a": 2
  },
  {
    "n": 28,
    "s": "General Knowledge",
    "q": "अंक 6, 1, 4, 2 एवं 5 से बनने वाली सबसे छोटी एवं सबसे बड़ी पाँच अंकों की संख्याओं का योग कितना होगा?",
    "o": [
      "77,868",
      "52,965",
      "52,956",
      "77,877"
    ],
    "a": 3
  },
  {
    "n": 29,
    "s": "General Knowledge",
    "q": "तैराक : स्वीमिंग पूल : : ? : ट्रेक",
    "o": [
      "अंतरिक्ष यात्री",
      "फिल्म निर्माता",
      "धावक",
      "जिमनास्ट"
    ],
    "a": 2
  },
  {
    "n": 30,
    "s": "General Knowledge",
    "q": "निम्न श्रृंखला में अगला अंक क्या होगा?\n3, 5, 9, 17 .....",
    "o": [
      "31",
      "32",
      "33",
      "34"
    ],
    "a": 2
  },
  {
    "n": 31,
    "s": "General Knowledge",
    "q": "गणना कीजिए –\n3/5 × (75÷3)/(28÷4) × (12+23)/(18–13) = ?",
    "o": [
      "3/5",
      "5",
      "3",
      "5/3"
    ],
    "a": 1
  },
  {
    "n": 32,
    "s": "General Knowledge",
    "q": "निम्न में से कौनसा विसंगत है?",
    "o": [
      "गंगा",
      "कावेरी",
      "भाखड़ा",
      "चम्बल"
    ],
    "a": 2
  },
  {
    "n": 33,
    "s": "General Knowledge",
    "q": "2486 का आधा 354 के दुगुने से कितना अधिक है?",
    "o": [
      "2132",
      "535",
      "1597",
      "1778"
    ],
    "a": 1
  },
  {
    "n": 34,
    "s": "General Knowledge",
    "q": "वर्ष 1960-61 में गेहूँ एवं चावल कुल कितने क्षेत्र में बोया जाता था?",
    "o": [
      "341 लाख हैक्टेयर में",
      "1002 लाख हैक्टेयर में",
      "470 लाख हैक्टेयर में",
      "475 लाख हैक्टेयर में"
    ],
    "a": 2
  },
  {
    "n": 35,
    "s": "General Knowledge",
    "q": "वर्ष 1999-2000 में चावल, गेहूँ की अपेक्षा कितने ज्यादा क्षेत्र में बोया गया?",
    "o": [
      "321 लाख हैक्टेयर",
      "212 लाख हैक्टेयर",
      "176 लाख हैक्टेयर",
      "67 लाख हैक्टेयर"
    ],
    "a": 2
  },
  {
    "n": 36,
    "s": "General Knowledge",
    "q": "हरित क्रांति के लिए निम्न में से कौनसा एक कारण सहायक नहीं है?",
    "o": [
      "उन्नत बीज का प्रयोग",
      "सिंचाई साधनों का प्रयोग",
      "उन्नत मिट्टी का उपयोग",
      "रासायनिक खाद का प्रयोग"
    ],
    "a": 2
  },
  {
    "n": 38,
    "s": "General Knowledge",
    "q": "वर्ष 1999-2000 में गेहूँ का औसत उत्पादन प्रति हैक्टेयर कितना था?",
    "o": [
      "2.21 टन",
      "2.62 टन",
      "2.76 टन",
      "3.19 टन"
    ],
    "a": 2
  },
  {
    "n": 39,
    "s": "General Knowledge",
    "q": "निम्न में से कौनसा वाक्य उपलब्ध तथ्यों के विपरीत है?",
    "o": [
      "वर्ष 1960-61 में चावल का उत्पादन गेहूँ की अपेक्षा तीन गुना से अधिक था।",
      "वर्ष 1960-61 की अपेक्षा वर्ष 1999-2000 में मोटे अनाज का उत्पादन लगभग दोगुना हो गया।",
      "वर्ष 1960-61 में गेहूँ, चावल की अपेक्षा अधिक क्षेत्र में बोया गया।",
      "उपज बढ़ाने में कीटनाशकों का भी योगदान रहा।"
    ],
    "a": 2
  },
  {
    "n": 40,
    "s": "General Knowledge",
    "q": "निम्न में से कौनसा वाक्य उपलब्ध तथ्यों पर आधारित है?",
    "o": [
      "हरितक्रांति से भारत द्वारा खाद्यान्न के आयात की आवश्यकता नहीं रही।",
      "मोटे अनाज के निर्यात से व्यापार में वृद्धि हुई।",
      "लघु कृषकों की आय अन्न कृषकों की अपेक्षा अधिक बढ़ी।",
      "देश रासायनिक खाद के उत्पादन में आत्मनिर्भर हो गया।"
    ],
    "a": 2
  },
  {
    "n": 41,
    "s": "General Knowledge",
    "q": "कौनसा युग्म सही नहीं है?",
    "o": [
      "रावतभाटा-कोटा",
      "रणकपुर-पाली",
      "बालोतरा-बाड़मेर",
      "पुष्कर-अजमेर"
    ],
    "a": 0
  },
  {
    "n": 42,
    "s": "General Knowledge",
    "q": "निम्न में से किस जिले की सीमा मध्यप्रदेश से नहीं लगती है?",
    "o": [
      "प्रतापगढ़",
      "झालावाड़",
      "कोटा",
      "डूंगरपुर"
    ],
    "a": 3
  },
  {
    "n": 43,
    "s": "General Knowledge",
    "q": "निम्न में से कौनसा पद थल सेना से सम्बंधित नहीं है?",
    "o": [
      "मेजर",
      "कैप्टन",
      "एडमिरल",
      "कर्नल"
    ],
    "a": 2
  },
  {
    "n": 44,
    "s": "General Knowledge",
    "q": "उत्तराखण्ड राज्य की राजधानी है?",
    "o": [
      "शिमला",
      "नैनीताल",
      "देहरादून",
      "मनाली"
    ],
    "a": 2
  },
  {
    "n": 45,
    "s": "General Knowledge",
    "q": "पृथ्वी के वायुमण्डल में सर्वाधिक पाई जाने वाली गैस है?",
    "o": [
      "ऑक्सीजन",
      "नाइट्रोजन",
      "ओजोन",
      "हीलियम"
    ],
    "a": 1
  },
  {
    "n": 46,
    "s": "General Knowledge",
    "q": "निम्न में से कौनसा शहर जयपुर से सबसे अधिक दूरी पर स्थित है?",
    "o": [
      "जोधपुर",
      "बीकानेर",
      "उदयपुर",
      "कोटा"
    ],
    "a": 2
  },
  {
    "n": 47,
    "s": "General Knowledge",
    "q": "पानी में बर्फ का कितना भाग पानी की सतह से बाहर (ऊपर) रहता है?",
    "o": [
      "1/8 भाग",
      "1/9 भाग",
      "1/10 भाग",
      "1/11 भाग"
    ],
    "a": 0
  },
  {
    "n": 48,
    "s": "General Knowledge",
    "q": "पृथ्वी पर सबसे छोटा महाद्वीप कौनसा है?",
    "o": [
      "अफ्रीका",
      "उत्तरी अमेरिका",
      "यूरोप",
      "ऑस्ट्रेलिया"
    ],
    "a": 3
  },
  {
    "n": 49,
    "s": "General Knowledge",
    "q": "ओलम्पिक खेलों में निम्न में से कौनसा खेल सम्मिलित है?",
    "o": [
      "कबड्डी",
      "खो-खो",
      "क्रिकेट",
      "टेनिस"
    ],
    "a": 3
  },
  {
    "n": 50,
    "s": "General Knowledge",
    "q": "संयुक्त राज्य अमरीका की राजधानी कहाँ है-",
    "o": [
      "वाशिंगटन",
      "न्यूयार्क",
      "सेन फ्रान्सिस्को",
      "एम्सटरडम"
    ],
    "a": 0
  },
  {
    "n": 51,
    "s": "General Knowledge",
    "q": "'मुद्रास्फीति' शब्द किससे सम्बंधित है?",
    "o": [
      "अर्थव्यवस्था से",
      "बैंकिंग प्रणाली से",
      "नोटों की छपाई की प्रणाली से",
      "सिक्के बनाने की प्रणाली से"
    ],
    "a": 0
  },
  {
    "n": 52,
    "s": "General Knowledge",
    "q": "भारतीय भेड़ एवं ऊन अनुसंधान केन्द्र किस जिले में स्थित है?",
    "o": [
      "अजमेर",
      "बीकानेर",
      "टोंक",
      "नागौर"
    ],
    "a": 2
  },
  {
    "n": 53,
    "s": "General Knowledge",
    "q": "'हरी बाली' रोग किस फसल में होता है?",
    "o": [
      "ज्वार",
      "बाजरा",
      "गेहूँ",
      "जौ"
    ],
    "a": 1
  },
  {
    "n": 54,
    "s": "General Knowledge",
    "q": "निम्न में से कौनसा शहर विसंगत है?",
    "o": [
      "हैदराबाद",
      "भोपाल",
      "अहमदाबाद",
      "ईटानगर"
    ],
    "a": 2
  },
  {
    "n": 55,
    "s": "General Knowledge",
    "q": "ग्राम पंचायतों को अनुदान किसकी अनुशंषा पर दिया जाता है?",
    "o": [
      "केन्द्रीय योजना आयोग",
      "केन्द्रीय वित्त आयोग",
      "राज्य वित्त आयोग",
      "राज्य योजना आयोग"
    ],
    "a": 2
  },
  {
    "n": 56,
    "s": "General Knowledge",
    "q": "वर्तमान में कौनसी पंचवर्षीय योजना चल रही है?",
    "o": [
      "11वीं",
      "12वीं",
      "13वीं",
      "14वीं"
    ],
    "a": 0
  },
  {
    "n": 57,
    "s": "General Knowledge",
    "q": "हाल में ही राजस्थान के किस जिले में नर्मदा नदी का पानी नहर से लाया गया?",
    "o": [
      "सिरोही",
      "जालोर",
      "नागौर",
      "राजसमन्द"
    ],
    "a": 1
  },
  {
    "n": 58,
    "s": "General Knowledge",
    "q": "'बेणेश्वर धाम' मंदिर किस जिले में स्थित है?",
    "o": [
      "प्रतापगढ़",
      "चित्तौड़गढ़",
      "बांसवाड़ा",
      "डूंगरपुर"
    ],
    "a": 3
  },
  {
    "n": 59,
    "s": "General Knowledge",
    "q": "वर्ष 2001 की जनगणना के अनुसार आबादी की दृष्टि से निम्न में से कौनसा राज्य राजस्थान से बड़ा है?",
    "o": [
      "महाराष्ट्र",
      "पंजाब",
      "गुजरात",
      "उड़ीसा"
    ],
    "a": 0
  },
  {
    "n": 60,
    "s": "General Knowledge",
    "q": "निम्न में से कौन टेनिस खिलाड़ी नहीं है?",
    "o": [
      "लिएण्डर पेस",
      "प्रकाश अमृतराज",
      "प्रकाश पादुकोण",
      "रोहन बोपण्णा"
    ],
    "a": 2
  },
  {
    "n": 61,
    "s": "General Knowledge",
    "q": "निम्न में से क्या असंगत है?",
    "o": [
      "गेहूँ",
      "चना",
      "बाजरा",
      "सरसों"
    ],
    "a": 2
  },
  {
    "n": 62,
    "s": "General Knowledge",
    "q": "एक सामान्य व्यक्ति एक मिनट में औसत कितनी बार श्वास लेता है?",
    "o": [
      "72 बार",
      "36 बार",
      "24 बार",
      "16 बार"
    ],
    "a": 3
  },
  {
    "n": 63,
    "s": "General Knowledge",
    "q": "निम्न में से क्या असंगत है?",
    "o": [
      "श्याम बेनेगल",
      "प्रकाश झा",
      "नसीरूद्दीन शाह",
      "गोविंद निहलानी"
    ],
    "a": 2
  },
  {
    "n": 64,
    "s": "General Knowledge",
    "q": "गागरोन किला किस नदी के किनारे स्थित है?",
    "o": [
      "चम्बल",
      "घोड़ा पछाड़",
      "शिप्रा",
      "काली सिंध"
    ],
    "a": 3
  },
  {
    "n": 65,
    "s": "General Knowledge",
    "q": "कुम्भलगढ़ किला किस जिले में स्थित है?",
    "o": [
      "राजसमन्द",
      "उदयपुर",
      "पाली",
      "सिरोही"
    ],
    "a": 0
  },
  {
    "n": 66,
    "s": "General Knowledge",
    "q": "अफीम की खेती निम्न में से किस जिले में नहीं होती है?",
    "o": [
      "झालावाड़",
      "कोटा",
      "चित्तौड़गढ",
      "उदयपुर"
    ],
    "a": 3
  },
  {
    "n": 67,
    "s": "General Knowledge",
    "q": "राष्ट्रीय राजमार्ग संख्या 8 निम्न में किस जिले में गुजरता है?",
    "o": [
      "प्रतापगढ़",
      "जालोर",
      "डूँगरपुर",
      "बाँसवाड़ा"
    ],
    "a": 2
  },
  {
    "n": 68,
    "s": "General Knowledge",
    "q": "कौनसा पौधा परजीवी या मृतजीवी है?",
    "o": [
      "टमाटर",
      "मशरूम",
      "अफीम",
      "गोभी"
    ],
    "a": 1
  },
  {
    "n": 69,
    "s": "General Knowledge",
    "q": "हरा संगमरमर किस जिले में पाया जाता है?",
    "o": [
      "झालावाड़",
      "प्रतापगढ़",
      "उदयपुर",
      "नागौर"
    ],
    "a": 2
  },
  {
    "n": 70,
    "s": "General Knowledge",
    "q": "गौतमेश्वर धाम किस जिले में पाया जाता है?",
    "o": [
      "प्रतापगढ़",
      "चित्तौड़गढ़",
      "बांसवाड़ा",
      "उदयपुर"
    ],
    "a": 0
  },
  {
    "n": 71,
    "s": "General Knowledge",
    "q": "निम्न में से किस जिले में औसत वर्षा सबसे अधिक होती है?",
    "o": [
      "सिरोही",
      "उदयपुर",
      "कोटा",
      "झालावाड़"
    ],
    "a": 3
  },
  {
    "n": 72,
    "s": "General Knowledge",
    "q": "राष्ट्रीय राजमार्ग-12 किस जिले से नहीं गुजरता हैं?",
    "o": [
      "टोंक",
      "अजमेर",
      "जयपुर",
      "कोटा"
    ],
    "a": 1
  },
  {
    "n": 73,
    "s": "General Knowledge",
    "q": "निम्न में से कौन फुटबॉल खिलाड़ी है?",
    "o": [
      "महेश भूपति",
      "शमशेर सिंह",
      "बाइचुंग भुटिया",
      "धनराज पिल्लई"
    ],
    "a": 2
  },
  {
    "n": 74,
    "s": "General Knowledge",
    "q": "VAT किससे सम्बंधित है?",
    "o": [
      "आयकर",
      "सेवाकर",
      "वाणिज्य कर",
      "कस्टम शुल्क"
    ],
    "a": 2
  },
  {
    "n": 75,
    "s": "General Knowledge",
    "q": "निम्न में से किस जिले की सीमा पाकिस्तान से नहीं लगती है?",
    "o": [
      "जोधपुर",
      "बीकानेर",
      "बाड़मेर",
      "गंगानगर"
    ],
    "a": 0
  },
  {
    "n": 76,
    "s": "General Knowledge",
    "q": "राजस्थान से लोकसभा में सांसदों की संख्या कितनी है?",
    "o": [
      "25",
      "48",
      "200",
      "250"
    ],
    "a": 0
  },
  {
    "n": 77,
    "s": "General Knowledge",
    "q": "ग्राम-पंचायत का सरपंच बनने हेतु न्यूनतम आयु कितनी होनी चाहिए?",
    "o": [
      "25 वर्ष",
      "21 वर्ष",
      "27 वर्ष",
      "35 वर्ष"
    ],
    "a": 0
  },
  {
    "n": 78,
    "s": "General Knowledge",
    "q": "अपना सिर काट कर देने वाली प्रसिद्ध 'हाड़ी रानी' का नाम क्या था?",
    "o": [
      "रानी पद्मिनी",
      "रानी लक्ष्मी",
      "सहल कंवर",
      "सरोज कंवर"
    ],
    "a": 2
  },
  {
    "n": 79,
    "s": "General Knowledge",
    "q": "विश्व का प्रथम अंतरिक्ष यात्री कौन था?",
    "o": [
      "सुनीता विलियम्स",
      "राकेश शर्मा",
      "यूरी गागरिन",
      "नील आर्मस्ट्राँग"
    ],
    "a": 2
  },
  {
    "n": 80,
    "s": "General Knowledge",
    "q": "हैदराबाद : आंध्रप्रदेश : : पणजी : ?",
    "o": [
      "लक्षद्वीप",
      "अण्डमान निकोबार द्वीप समूह",
      "गोवा",
      "पाण्डीचेरी"
    ],
    "a": 2
  },
  {
    "n": 81,
    "s": "General Knowledge",
    "q": "पंचतंत्र के लेखक है-",
    "o": [
      "कालिदास",
      "सूरदास",
      "विष्णु शर्मा",
      "प्रेमचंद"
    ],
    "a": 2
  },
  {
    "n": 82,
    "s": "General Knowledge",
    "q": "पृथ्वी पर कितने महाद्वीप है-",
    "o": [
      "5",
      "6",
      "7",
      "8"
    ],
    "a": 2
  },
  {
    "n": 83,
    "s": "General Knowledge",
    "q": "निम्न में से कौनसी रेखा भारत से गुजरती है?",
    "o": [
      "मकर रेखा",
      "कर्क रेखा",
      "0° अक्षांश रेखा",
      "विषुवत् रेखा"
    ],
    "a": 1
  },
  {
    "n": 84,
    "s": "General Knowledge",
    "q": "हजरत निजामुद्दीन औलिया की दरगाह कहाँ स्थित है?",
    "o": [
      "मुम्बई",
      "नई दिल्ली",
      "औरंगाबाद",
      "अजमेर"
    ],
    "a": 1
  },
  {
    "n": 85,
    "s": "General Knowledge",
    "q": "प्रसिद्ध विजय स्तम्भ का निर्माण किसने करवाया?",
    "o": [
      "महाराणा फतेह सिंह",
      "महाराणा उदय सिंह",
      "महाराणा कुम्भा",
      "महाराणा सांगा"
    ],
    "a": 2
  },
  {
    "n": 86,
    "s": "General Knowledge",
    "q": "लिग्नाइट कोयला के भंडार किस राज्य में सर्वाधिक है?",
    "o": [
      "गुजरात",
      "झारखंड",
      "राजस्थान",
      "बिहार"
    ],
    "a": 2
  },
  {
    "n": 87,
    "s": "General Knowledge",
    "q": "कौनसा उपकरण हवा का दबाव नापने के काम आता है?",
    "o": [
      "पाइरोमीटर",
      "थर्मामीटर",
      "बैरोमीटर",
      "गैल्वेनोमीटर"
    ],
    "a": 2
  },
  {
    "n": 88,
    "s": "General Knowledge",
    "q": "वर्ष 2004 में ओलम्पिक खेल कहाँ आयोजित हुए थे?",
    "o": [
      "लंदन",
      "बीजिंग",
      "एथेन्स",
      "बर्लिन"
    ],
    "a": 2
  },
  {
    "n": 89,
    "s": "General Knowledge",
    "q": "वर्ष 2008 में केन्द्रीय कर्मचारियों हेतु कौन से वेतन आयोग ने अपनी रिपोर्ट केन्द्र सरकार को प्रस्तुत की?",
    "o": [
      "चौथे वेतन आयोग",
      "पाँचवें वेतन आयोग",
      "छठे वेतन आयोग",
      "सातवें वेतन आयोग"
    ],
    "a": 2
  },
  {
    "n": 90,
    "s": "General Knowledge",
    "q": "भारत में श्वेत क्रांति किसके उत्पादन से सम्बंधित है?",
    "o": [
      "कागज के उत्पादन से",
      "कपड़े के उत्पादन से",
      "निर्यात बढ़ाने के सम्बंध में",
      "दूध के उत्पादन से"
    ],
    "a": 3
  },
  {
    "n": 91,
    "s": "General Knowledge",
    "q": "निम्न में से किस जिले का क्षेत्र 'राष्ट्रीय राजधानी क्षेत्र' में आता है?",
    "o": [
      "झुन्झुनूं",
      "अलवर",
      "सीकर",
      "अजमेर"
    ],
    "a": 1
  },
  {
    "n": 92,
    "s": "General Knowledge",
    "q": "उपराष्ट्रपति किस सदन का अध्यक्ष होता है?",
    "o": [
      "लोकसभा",
      "विधानसभा",
      "विधान-परिषद्",
      "राज्यसभा"
    ],
    "a": 3
  },
  {
    "n": 93,
    "s": "General Knowledge",
    "q": "रेलवे टाइम टेबिल के 17.00 घण्टे का अर्थ है?",
    "o": [
      "7 P.M.",
      "6 P.M.",
      "10 P.M.",
      "5 P.M."
    ],
    "a": 3
  },
  {
    "n": 94,
    "s": "General Knowledge",
    "q": "घोटिया अम्बा का मेला किस जिले में आयोजित किया जाता है?",
    "o": [
      "प्रतापगढ़",
      "बाँसवाड़ा",
      "डूँगरपुर",
      "करौली"
    ],
    "a": 1
  },
  {
    "n": 95,
    "s": "General Knowledge",
    "q": "निम्न में से किस जिले की जनसंख्या सर्वाधिक है?",
    "o": [
      "उदयपुर",
      "कोटा",
      "अजमेर",
      "बीकानेर"
    ],
    "a": 0
  },
  {
    "n": 96,
    "s": "General Knowledge",
    "q": "राजस्थान में कुल जिलों की संख्या कितनी है?",
    "o": [
      "28",
      "31",
      "33",
      "35"
    ],
    "a": 2
  },
  {
    "n": 97,
    "s": "General Knowledge",
    "q": "दाउदी बोहरा समुदाय का प्रमुख केन्द्र राजस्थान के किस जिले में है?",
    "o": [
      "बाड़मेर",
      "जैसलमेर",
      "बारां",
      "बाँसवाड़ा"
    ],
    "a": 3
  },
  {
    "n": 98,
    "s": "General Knowledge",
    "q": "बनी ठनी का चित्र किस क्षेत्र की चित्रकला से सम्बंधित है?",
    "o": [
      "मेवाड़",
      "हाड़ौती",
      "किशनगढ़",
      "मारवाड़"
    ],
    "a": 2
  },
  {
    "n": 99,
    "s": "General Knowledge",
    "q": "निम्न में से किस स्थान पर कपड़ा छपाई का कार्य नहीं किया जाता है?",
    "o": [
      "बगरू",
      "साँगानेर",
      "बालोतरा",
      "देबारी"
    ],
    "a": 3
  },
  {
    "n": 100,
    "s": "General Knowledge",
    "q": "समुद्र में ज्वार-भाटा का क्या कारण है?",
    "o": [
      "चन्द्रमा की गुरूत्वाकर्षण शक्ति",
      "ओजोन परत में छेद",
      "वैश्विक तापमान में वृद्धि",
      "समुद्र के तापमान में बदलाव"
    ],
    "a": 0
  }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'RJ-POL-CONST' });
  if (!exam) throw new Error('Exam RJ-POL-CONST not found - aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Written Test' });
  if (!pattern) throw new Error('ExamPattern "Written Test" not found - aborting.');

  const TEST_TITLE = "Rajasthan Police Constable - 2008";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  const questions = RAW.map(r => ({
    questionText: r.q, questionImage: '', options: r.o,
    optionImages: r.o.map(() => ''), correctAnswerIndex: r.a,
    explanation: '', section: r.s, tags: TAGS, difficulty: 'medium'
  }));

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: questions.length, duration: 120, accessLevel: 'FREE', isPYQ: true, pyqYear: 2008,
    pyqShift: TEST_TITLE, pyqExamName: 'Rajasthan Police Constable', questions
  });
  console.log('Created PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
