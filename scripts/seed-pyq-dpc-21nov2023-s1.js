/**
 * Seed: Delhi Police Constable - 21 Nov 2023 Shift-1
 * 100 Q x 1 mark, 90 min. Reuses Exam SSC-DPC + pattern 'Computer-Based Test (CBT)'.
 * Source: official TCS/iON 'Question Paper with Answers' PDF (deterministic green
 * colour answer key). Figure/figural questions upload a local crop as questionImage.
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc21nov2023_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-21nov2023-s1';

const examPatternSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  title: { type: String, required: true, trim: true },
  duration: { type: Number }, totalMarks: { type: Number }, negativeMarking: { type: Number },
  sections: [{ name: String, totalQuestions: Number, marksPerQuestion: Number,
    negativePerQuestion: Number, sectionDuration: Number }]
}, { timestamps: true });
const examSchema = new mongoose.Schema({
  category: mongoose.Schema.Types.ObjectId, name: String, code: String
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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 21 Nov 2023 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "चट्टानों के अध्यन को क्या कहते हैं?", o: ["शैल विज्ञान", "फल विज्ञान", "कवक विज्ञान", "मृदा विज्ञान"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन-सी, भारतीय संविधान की संघीय विशेषता नहीं है?", o: ["लिखित संविधान", "केंद्र और राज्योंों के बीच शक्तियों का बँटवारा", "एकल नागरिकता", "स्वतंत्र न्यायपालिका"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "2011 की जनगणना के अनुसार, भारत के किस केंद्र शासित प्रदेश में सबसे अधिक लिंगानुपात (प्रति 1000 पुरुषों पर महिलाएँ) है?", o: ["दादरा और नगर हवेली", "पुदुचेरी", "दमन और दीव", "दिल्ली"], a: 1, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "According to the UNDP Human Development Report 2021-22, what was the Human Development Index rank of India?", o: ["132", "114", "154", "133"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "भारतीय संविधान में कानून के शासन का विचार किस देश से लिया गया है?", o: ["जर्मनी", "संयुक्त राज्य अमेरिका", "यूनाइटेड किंंगडम", "फ्रांांस"], a: 2, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Who authored ‘Untouchable’ depicting the caste system?", o: ["Mulk Raj Anand", "Jai Ratan", "RK Narayan", "Vikram Seth"], a: 0, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "मूल रूप से, भारत के संविधान में ________ अनुसूचियां थीं।", o: ["8", "6", "7", "10"], a: 0, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "शासन कला, राजनीतिविज्ञान, आर्थिक नीति और सैन्य रणनीति पर एक प्राचीन भारतीय संस्कृृत ग्रंथ 'अर्थशास्त्र' _________ ने लिखा था।", o: ["विष्णुगुप्त", "अशोक", "चंद्रगुप्त मौर्य", "बिन्दुदुसार"], a: 0, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "SAFF चैंपियनशिप 2023 के आयोजन की मेजबानी किस शहर ने की थी?", o: ["बेंगलुरु", "मैंगलोर", "मैसूर", "गुलबर्ग"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "'Who moved my interest rate’ is the autobiography of D Subbarao who was a _______.", o: ["journalist", "political leader", "businessman", "banker"], a: 3, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "एफ़डीआई (FDI) का पूर्ण रूप है ____ ।", o: ["फॉरेक्स डायरेक्ट इन्वेस्टमेंट (Forex Direct Investment)", "फॉरेक्स डीरेगुलेटेड इन्वेस्टमेंट (Forex Deregulated Investment)", "फॉरेन डायरेक्ट इन्वेस्टमेंट (Foreign Direct Investment)", "फॉरेन डीरेगुलेटेड इन्वेस्टमेंट (Foreign Deregulated Investment)"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "‘Left-arm leg spin’ in cricket is known as ________.", o: ["Chinaman ball", "off-spin", "orthodox spin", "leg spin"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "बहमनी साम्राज्य की स्थापना किस वर्ष हुई थी?", o: ["1325 ईस्वी", "1351 ईस्वी", "1336 ईस्वी", "1347 ईस्वी"], a: 3, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन-सा, सार्वजनिक क्षेत्र के उद्यमों का स्वामित्व, प्रबंधन और नियंत्रण निजी क्षेत्र के उद्यमियों को किए जाने वाले हस्तांांतरण को संदर्भित करता है?", o: ["उदारीकरण", "वैश्वीकरण", "लाइसेंसिंंग", "निजीकरण"], a: 3, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "भारती विट्ठल, मुख्यतः एक पुरस्‍कार विजेता ________नृत्‍यांगना हैं।", o: ["मोहिनीअट्टम", "कुचिपूड़ी", "कथकली", "भरतनाट्यम"], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "भारत सरकार का प्रमुख कार्यक्रम, 'सर्व शिक्षा अभियान' राज्य के नीति निर्देशक सिद्धांांतों के निम्नलिखित में से किस प्रावधान को पूरा करता है?", o: ["अनुच्छेेद 44", "अनुच्छेेद 45", "अनुच्छेेद 42", "अनुच्छेेद 43"], a: 1, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से किस मंत्रालय ने राष्ट्रीीय कौशल विकास निगम (National Skill Development Corporation) की स्थापना की थी?", o: ["वित्त मत्रांांलय", "जनजातीय कार्य मंत्रालय", "शिक्षा मंत्रालय", "कौशल विकास और उद्यमशीलता मंत्रालय"], a: 0, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से किसे विशेष रूप से दिल्ली सल्तनत के सैन्य संगठन की देखभाल के लिए स्थापित किया गया था?", o: ["दीवान-ए-अर्ज", "दीवान-ए-क़ादा", "दीवान-ए-इंशा", "दीवान-ए-विजारत"], a: 0, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "किसी प्रजाति का उसको प्रभावित करने वाले सभी जैविक और अजैविक कारकों के साथ उसके अंतर्संबंध को क्या कहा जाता है?", o: ["पारिस्थितिक ताक (Ecological niche)", "खाद्य जाल (Food web)", "खाद्य श्रृंृंखला (Food chain)", "प्राकृतिक वास (Habitat)"], a: 0, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "‘Mintonette’ is related to which of the following sports?", o: ["Cricket", "Basketball", "Handball", "Volleyball"], a: 3, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "गंगमेई अलुना काबुईनी एक प्रसिद्ध आदिवासी 'काबुई' नर्तकी है, जो निम्नलिखित में से किस राज्य से जुड़ी है?", o: ["असम", "गोवा", "ओडिशा", "मणिपुर"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "कोशिकीय अंगकों और सतह स्थलाकृति प्रतिबिंबन के लिए कोशिका जैविकी शोध में किस तकनीक का उपयोग किया जाता है?", o: ["अवस्था विपर्यासी सूक्ष्मदर्शिकी (Phase contrast microscopy)", "क्रमवीक्षण इलेक्ट्रॉॉन सूक्ष्मदर्शिकी (Scanning electron microscopy)", "अदीप्त क्षेत्र सूक्ष्मदर्शिकी (Dark-field microscopy)", "प्रतिदीप्ति सूक्ष्मदर्शिकी (Fluorescence microscopy)"], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "यूनेस्को की विश्व धरोहर स्थल की सूची में शामिल महाबोधि मंदिर कहाँ स्थित है?", o: ["देवरिया", "पटना", "कुशीनगर", "बोधगया"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "भारत की जनगणना 2011 के अनुसार, सबसे कम साक्षरता दर, केंद्र शासित प्रदेश ______ में दर्ज की गई थी।", o: ["अंडमान व नोकोबार द्वीप समूह", "चंडीगढ़", "पांडिचेरी", "दादरा और नगर हवेली"], a: 3, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन ऋग्वेद में वर्णित 3 सबसे महत्वपूर्ण देवताओं में से एक नहीं हैं?", o: ["सोम", "अग्नि", "इंद्र", "प्रजापति"], a: 3, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "LPG को छोटे सिलिंडरों में उच्च दाब के अंतर्गत संग्रहित किया जाता है क्योंोंकि ___________।", o: ["गैस, द्रव रूप में बदल जाती है, जिससे भंडारण के लिए कम जगह की आवश्यकता होती है", "यह सामान्य तापमान पर आसानी से जलती है", "सिलिंडर में गैस का भंडारण नहीं हो सकता है", "द्रव वहन करने में हल्का होता है"], a: 0, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "वर्ष 1904 में, भारत में पहला सीमेंट प्लांांट कहाँ स्थापित किया गया था?", o: ["मुंबई", "कोलकाता", "दिल्ली", "चेन्नई"], a: 3, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "मधु मंसूरी हसमुख ___________राज्य के एक गायक, गीतकार और कार्यकर्ता हैं।", o: ["झारखंड", "आंध्र प्रदेश", "छत्तीसगढ", "मध्य प्रदेश"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "2016 के किस संविधान संशोधन अधिनियम में जीएसटी परिषद की स्थापना का प्रावधान किया गया है?", o: ["99वाँ", "103वाँ", "101वाँ", "100वाँ"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "वस्तु विनिमय प्रणाली (बार्टर सिस्टम)' से आप क्या समझते हैं?", o: ["मुद्रा के बदले वस्तु की खरीद", "वस्तु के बदले वस्तु की खरीद और बिक्री", "कोई खरीद या बिक्री नहीं", "मुद्रा के बदले वस्तु की बिक्री"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "उत्तरी मैदानों का पश्चिमी भाग निम्नलिखित में से किस नदी प्रणाली द्वारा निर्मित है?", o: ["गंगा और उसकी सहायक नदियों", "सिंधु और उसकी सहायक नदियों", "ब्रह्मपुत्र और उसकी सहायक नदियों", "महानदी और उसकी सहायक नदियों"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "भारत के प्रधानमंत्री ने दिसंबर 2022 में _______ मेट्रोो चरण- I को राष्ट्र को समर्पित किया।", o: ["जयपुर", "शिमला", "नागपुर", "अमृतसर"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "1793 के स्थायी बंदोबस्त अधिनियम का उद्देश्य ईस्ट इंडिया कंपनी और _________ के बीच निश्चित राजस्व संग्रह के लिए एक समझौता करना था।", o: ["मजदूरों", "जमींदारों", "आम आदमी", "किसानों"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "1929 में निम्नलिखित में से किस अधिनियम के क्रियान्वयन का विरोध करने के लिए भगत सिंह और उनके एक सहयोगी ने दिल्ली में केंद्रीय विधानसभा में बम फेंका था?", o: ["वर्नाक्युलर प्रेस अधिनियम", "रोलेट अधिनियम", "भारत रक्षा अधिनियम", "बाल विवाह निरोधक अधिनियम"], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Select the correct option based on the image given below.", o: ["i-c, ii-a, iii-b, iv-d", "i-c, ii-d, iii-a, iv-b", "i-d, ii-c, iii-b, iv-a", "i-c, ii-d, iii-b, iv-a"], a: 0, e: "", qimg: "21nov2023-s1-q-35.png" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "एक पारंपरिक खेल यूबी लक्पी किस राज्य में खेला जाता है?", o: ["मणिपुर", "अरुणाचल प्रदेश", "हिमाचल प्रदेश", "झारखंड"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "राज्य विधानमंडल की सदस्यता के बिना किसी व्यक्ति को कितने माह तक मुख्यमंत्री नियुक्त किया जा सकता है?", o: ["6 माह", "2 वर्ष", "15 माह", "1 वर्ष"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "1828 में ब्रिटिश भारत के निम्नलिखित समाज सुधारकों में से किसके द्वारा ब्रह्म समाज की स्थापना की गई थी?", o: ["ज्योतिबा फुले", "रवीन्द्रनाथ टैगोर", "बा आम्टे", "राजा राम मोहन राय"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "असम में सुकरेश्वर मंदिर एक ______है।", o: ["शिव मंदिर", "विष्णु मंदिर", "राम मंदिर", "कृष्ण मंदिर"], a: 0, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "_________ निर्मित करने की शक्ति केवल विधान सभा के पास होती है।", o: ["ड्रााफ्ट", "धन विधेयक", "परमादेश", "अधनियम"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Which is the largest component of GDP?", o: ["Investment", "Consumption", "Government purchase", "Net exports"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "एल बिनो देवी को किस प्रकार के नृत्य के लिए संगीत नाटक अकादमी पुरस्कार मिला?", o: ["कथकली", "सत्त्रिया", "घूमर", "मणिपुरी"], a: 3, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "हरित क्रांांति मुख्य रूप से किन फसलों के लिए थी?", o: ["बाजरा और चावल", "गेहूँ और चावल", "जौ और बाजरा", "गेहूँ और बाजरा"], a: 1, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "वर्षण पैटर्न के संदर्भ में, गर्म समशीतोष्ण जलवायु में Cf का क्या अर्थ है?", o: ["मौसमी वर्षण", "बूंदा बांदी वर्षण", "हिम वर्षण", "साल भर वर्षण"], a: 3, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "पांचवीं पंचवर्षीय योजना का प्रारूप किसने तैयार और लॉन्च किया था?", o: ["मनमोहन सिंह", "जयप्रकाश नारायण", "बिबेक देबरॉय", "डी.पी. धर"], a: 3, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "राष्ट्रीीय युवा दिवस निम्न में से किस व्यक्तित्व की जन्मतिथि पर मनाया जाता है?", o: ["ए. पी. जे. अब्दुुल कलाम", "नेताजी सुभाष चंद्र बोस", "स्वामी विवेकानंद", "विक्रम साराभाई"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "शकूर खान निम्नलिखित में से किस वाद्य-यंत्र से जुड़े है?", o: ["रुद्र वीणा", "शहनाई", "वायोलिन", "सारंगी"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से किसने 1875 में अलीगढ़ मुस्लिम विश्विद्यालय की स्थापना की थी?", o: ["आगा खान", "नवाब सलीमुल्लाह", "सैय्यद अहमद खाँ", "मोहम्मद इकबाल"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "भगवान महावीर द्वारा निर्वाण प्राप्त करने के उपलक्ष्य में बिहार के पावापुरी में जैन समुदाय द्वारा निम्नलिखित में से कौन-सा त्योहार मनाया जाता है?", o: ["रोट तीज", "देव दीपावली", "ज्ञान पंचमी", "पर्यूषण"], a: 1, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "विलासिनी नाट्यम का प्रसिद्ध कलाकार निम्नलिखित में से कौन है?", o: ["अदिति मंगलदास", "लीला सैमसन", "गिरिजा देवी", "स्वप्नसुंदरी"], a: 3, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "21nov2023-s1-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s1-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["12", "14", "10", "8"], a: 1, e: "", qimg: "21nov2023-s1-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "एक पासे के अलग-अलग फलकों पर छ: अक्षर M, E, K, T, X और B लिखे गए हैं। इस पासे की दो स्थितियों को चित्र में दिखाया गया है। E के विपरीत फलक पर अक्षर ज्ञात कीजिए।", o: ["X", "T", "K", "M"], a: 1, e: "", qimg: "21nov2023-s1-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "एक निश्चित कूट भाषा में, 'VALUE' को 'GWNCX' के रूप में लिखा जाता है और 'PLANT' को 'VPCNR' के रूप में लिखा जाता है। उसी भाषा में 'BRAIN' को कैसे लिखा जाएगा?", o: ["PCKTD", "CTDPK", "PKCTD", "PKCDT"], a: 2, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "उस विकल्प का चयन कीजिए, जो तीसरे शब्द से उसी प्रकार संबंधित है ,जिस प्रकार दूसरा शब्द पहले शब्द से संबंधित है। (शब्दोंों को अंग्रेजी/हिंदी के अर्थपूर्ण शब्दोंों के रूप में माना जाना चाहिए और ये शब्द, अक्षरों की संख्या/ व्यंजनों/स्वरों की संख्या के आधार पर एक-दूसरे से संबंधित नहीं होने चाहिए।) पुस्तकालय : कैटेलॉग :: भोजनालय : ?", o: ["बुकलेट", "मेनू", "इंडेक्स", "रेसिपी बुक"], a: 1, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "उस समुच्चय का चयन करें जिसमें दी गई संख्याएं आपस में उसी प्रकार संबंधित हैं, जिस प्रकार प्रश्न में दिए गए समुच्चय की संख्याएं आपस में संबंधित हैं। (नोट: संख्याओं को उसके घटक अंकों में विभाजित किए बिना, पूर्ण संख्याओं पर ही गणितीय संक्रियाएँ की जानी चाहिए। जैसे 13 - मान लीजिए 13 पर गणितीय संक्रियाएँ जैसे कि 13 में जोड़ना/घटाना/गुणा करना आदि किया जा सकता है। 13 को 1 और 3 में तोड़कर और फिर 1 और 3 पर गणितीय संक्रियाएँ करने की अनुमति नहीं है।) (6, 9, 2) (12, 36, 2)", o: ["(12, 6, 4)", "(14, 7, 7)", "(18, 9, 6)", "(10, 8, 5)"], a: 2, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "जब दर्पण को MN पर, जैसा कि दिखाया गया है, रखा जाता है तब दिए गए संयोजन के सही दर्पण प्रतिबिंब का चयन कीजिए।", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "21nov2023-s1-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "दिए गए विकल्पोंों में से उस आकृति का चयन कीजिए जो पैटर्न को पूर्ण करने के लिए नीचे दी गई आकृति में प्रश्न चिह्न (?) के स्‍थान पर आएगी।", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s1-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "यदि श्रृंृंखला को जारी रखना हो, तो प्रश्न चिह्न (?) के स्थान पर कौन-सी आकृति आनी चाहिए?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "21nov2023-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "निम्नलिखित में से कौन सा पद (अक्षर-समूह) दी गई श्रृंृंखला में प्रश्न चिह्न (?) के स्थान पर आएगा? COL, FMO, IKR, ?, OGX", o: ["LIV", "LIU", "KJV", "KIV"], a: 1, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "S, T, U, V और W पांच बहनें एक सीधी पंक्ति में उत्तर की ओर मुख करके बैठी हैं। V, S के दाएं दूसरे स्थान पर बैठी है। W, T के बाएं दूसरे स्थान पर बैठी है। V पंक्ति के दाएं सिरे पर बैठी है। पंक्ति के ठीक बीच में कौन बैठी है?", o: ["W", "S", "U", "T"], a: 1, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "विकल्पोंों में से उस आकृति का चयन करें, जो दी गई आकृति में सन्निहित है (घुमाने की अनुमति नहीं है)।", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "21nov2023-s1-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "21nov2023-s1-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "जब दर्पण को नीचे दर्शाए गए अनुसार MN रेखा पर रखा जाता है, तो दी गई आकृति के सही दर्पण प्रतिबिंब का चयन करें।", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "21nov2023-s1-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "एक कागज को नीचे दिखाए अनुसार मोड़ा और काटा जाता है। खोलने पर यह कैसा दिखाई देगा?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "21nov2023-s1-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["÷ और −", "+ और ×", "− और +", "− और ×"], a: 3, e: "", qimg: "21nov2023-s1-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s1-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "दिए गए कथनों और निष्कर्षों को ध्यानपूर्वक पढ़िए। यह मानते हुए कि कथनों में दी गई जानकारी सत्य है, भले ही वह सामान्य रूप से ज्ञात तथ्योंों से भिन्न प्रतीत होती हो, तय कीजिए कि दिए गए निष्कर्षों में से कौन-सा/से निष्कर्ष कथनों का तार्किक रूप से अनुसरण करता है/करते हैं। कथन: • कुछ बोतलें, खिड़कियां हैं। • कुछ खिड़कियां, हैंडल हैं। • सभी दरवाजे, हैंडल हैं। निष्कर्ष: I. कुछ बोतलें, हैंडल हैं। II. कुछ खिड़कियां, बोतलें हैं। III. कुछ दरवाजे, बोतलें हैं।", o: ["निष्कर्ष I, II और III अनुसरण करते हैं", "निष्कर्ष I और II अनुसरण करते हैं", "निष्कर्ष I और III अनुसरण करते हैं", "केवल निष्कर्ष II अनुसरण करता है"], a: 3, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "दिए गए समीकरण को सही करने के लिए निम्नलिखित में से किन दो गणितीय चिह्नोंों को आपस में बदला जाना चाहिए? 658 × 14 ÷ 3 − 32 + 56 = 165", o: ["÷ और +", "÷ और −", "÷ और ×", "÷ और ="], a: 2, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "निम्नलिखित में से कौन-सा विकल्प दी गई श्रृंृंखला में प्रश्नवाचक चिन्‍ह (?) को प्रतिस्थापित करेगा? 323, 646, 969, 1292, ?", o: ["1486", "1615", "1276", "1200"], a: 1, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "21nov2023-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "कागज की एक वर्गाकार शीट को बिंदीदार रेखा के अनुदिश दिखाए गए निर्देशों के अनुसार क्रमिक रूप से मोड़ा जाता है और फिर अंत में इसे छिद्रित किया जाता है। कागज को खोलने पर यह कैसा दिखेगा?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s1-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "उस विकल्प का चयन करें जो तीसरे पद से उसी प्रकार संबंधित है जिस प्रकार दूसरा पद पहले पद से और छठा पद पांचवें पद से संबंधित है। 4 : 11 :: 8 : ? :: 12 : 35", o: ["39", "31", "23", "15"], a: 2, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "एक निश्चित राशि साधारण ब्याज की एक निश्चित दर पर दो वर्ष बाद ₹4,620 हो जाती है और समान दर पर ढाई वर्ष बाद ₹4,725 हो जाती है। वार्षिक प्रतिशत दर ज्ञात कीजिए।", o: ["6%", "4%", "3%", "5%"], a: 3, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "15 छात्रोंों की किसी कक्षा का औसत भार 30 kg है। एक नया छात्र शामिल होता है और औसत भार 1 kg बढ़ जाता है। नए छात्र का वजन (kg में) ज्ञात कीजिए।", o: ["45", "42", "40", "46"], a: 3, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "12, 36 और 80 का लघुतम समापवर्त्य ज्ञात कीजिए।", o: ["720", "360", "480", "1440"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "एक कस्बे की जनसंख्या 7,000 है। यदि पुरुष और महिला जनसंख्या में प्रतिशत वृद्धि क्रमशः 11% और 8% है, तो नई जनसंख्या 7,680 होगी। कस्बे में महिला नागरिकों की संख्या ज्ञात कीजिए।", o: ["2500", "4000", "4500", "3000"], a: 3, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "A और B मिलकर किसी काम को 24 दिन में पूरा कर सकते हैं, जबकि B अकेला उसे 48 दिन में पूरा कर सकता है। A अकेले इस काम को कितने दिन में पूरा कर सकेगा?", o: ["48 दिन", "58 दिन", "42 दिन", "36 दिन"], a: 0, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "यदि X का 60% = Y का 40% है, तो X : Y का मान ज्ञात कीजिए।", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "21nov2023-s1-q-81.png" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "श्याम एक नोटबुक को उसके क्रय मूल्य के बराबर लाभ प्रतिशत के साथ ₹24 में बेचता है। श्याम के लिए उस नोटबुक का क्रय मूल्य कितना था?", o: ["₹20", "₹18", "₹24", "₹16"], a: 0, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["₹3,00,521", "₹2,70,521", "₹2,90,521", "₹2,80,521"], a: 2, e: "", qimg: "21nov2023-s1-q-83.png" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the mean proportional of 16.81 and 12.96?", o: ["14.76", "16.48", "21.52", "18.36"], a: 0, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["7 km/h", "6 km/h", "4 km/h", "5 km/h"], a: 3, e: "", qimg: "21nov2023-s1-q-85.png" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["32", "30", "28", "25"], a: 1, e: "", qimg: "21nov2023-s1-q-86.png" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "620 और 248 का एच.सी.एफ. (HCF) ज्ञात करें।", o: ["124", "132", "126", "128"], a: 0, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["67 π", "73 π", "65 π", "83 π"], a: 2, e: "", qimg: "21nov2023-s1-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1310", "1290", "1280", "1296"], a: 3, e: "", qimg: "21nov2023-s1-q-89.png" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "एक विक्रेेता किसी वस्तु की खरीद पर 10% और 20% की व्यापार छूट देता है, जिसका अंकित मूल्य ₹500 है। एक अन्य विक्रेेता उसी वस्तु पर 30% की छूट देता है। उनके विक्रय मूल्य (₹ में) के बीच कितना अंतर है?", o: ["10", "11", "12", "15"], a: 0, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following groups in the Home tab of MS word 365, consists of Bullets and Numbering?", o: ["Paragraph", "Clipboard", "Editing", "Font"], a: 0, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following bars provides a shortcut to menu commands which are represented in the form of icons?", o: ["Space Bar", "Tool Bar", "Menu bar", "Vertical Bar"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following is the function of an IP address?", o: ["Managing email communication", "Formatting web pages", "Creating secure connections", "Identifying devices on a network"], a: 3, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Bullets and numbering are commonly used in Microsoft Word 365 to:", o: ["format text as headings", "create lists for better organisation", "italicise the text", "add borders around paragraphs"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In MS Word 365 how can you select a paragraph in Microsoft Word?", o: ["Double-click anywhere within the paragraph.", "Right-click anywhere within the paragraph and choose ‘Select Paragraph’.", "Press Ctrl+B to select the entire paragraph.", "Triple-click anywhere within the paragraph."], a: 3, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which of the following is the shortcut key in MS Excel to open a spreadsheet that is already existing?", o: ["Ctrl + N", "Ctrl + O", "Alt + O", "Alt + N"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, the shortcut key to open the custom sort is:", o: ["Windows Key + A + S", "Alt + A + S", "Shift + A + S", "Ctrl + A + S"], a: 1, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "What is the purpose of attaching files to an email?", o: ["To add decorative elements to the email", "To format the email text", "To share documents, images or other files with the recipient", "To increase the size of the email"], a: 2, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "In Microsoft Word 365, how can we apply different page formatting within the same document by separating areas with different formats?", o: ["By Page Layout", "By Insert", "By Section Break", "By Page Break"], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "एमएस एक्सेल 365 (MS Excel 365) में, स्प्रेडशीट निम्नलिखित में से किस फॉर्मेट में डिफ़ॉल्ट रूप से व होती है?", o: [".docx", ".xlxs", ".xlsx", ".doc"], a: 2, e: "", qimg: "" }
];

const uploadCache = new Map();
async function uploadImg(fname) {
  if (!fname) return '';
  if (uploadCache.has(fname)) return uploadCache.get(fname);
  const local = path.join(IMG_DIR, fname);
  if (!fs.existsSync(local)) { console.warn('  missing img', local); uploadCache.set(fname, ''); return ''; }
  try {
    const res = await cloudinary.uploader.upload(local, {
      folder: CLOUDINARY_FOLDER, public_id: fname.replace(/\.png$/, ''), overwrite: true, resource_type: 'image'
    });
    uploadCache.set(fname, res.secure_url); return res.secure_url;
  } catch (err) { console.error('  [upload failed]', fname, err.message); uploadCache.set(fname, ''); return ''; }
}

async function buildQuestions() {
  const out = [];
  for (const r of RAW) {
    const qImage = await uploadImg(r.qimg);
    out.push({
      questionText: r.q, questionImage: qImage, options: r.o,
      optionImages: ['', '', '', ''], correctAnswerIndex: r.a,
      explanation: r.e || '', section: r.s, tags: TAGS, difficulty: 'medium'
    });
  }
  return out;
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'SSC-DPC' });
  if (!exam) throw new Error('Exam SSC-DPC not found — aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Computer-Based Test (CBT)' });
  if (!pattern) throw new Error('ExamPattern "Computer-Based Test (CBT)" not found — aborting.');

  const TEST_TITLE = "Delhi Police Constable - 21 Nov 2023 Shift-1";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2023,
    pyqShift: TEST_TITLE, pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
