/**
 * Seed: Delhi Police Constable - 15 Nov 2023 Shift-3
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc15nov2023_s3');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-15nov2023-s3';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 15 Nov 2023 Shift-3"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "सरकार ने नवाचार के लिए सक्षम बुनियादी ढांचा और सुगमकारी माहौल प्रदान करके भारत के अल्पसेवित/असेवित क्षेत्रोंों में उद्यमिता की भावना को प्रोत्साहित करने के लिए _________ की शुरुआत की है।", o: ["उत्पादन सम्‍बद्ध प्रोत्साहन योजना", "वन नेशन वन राशन नीति", "अटल समुदाय नवाचार केंद्र कार्यक्रम", "डिजिटल लाइब्रेरी मिशन"], a: 2, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Hydrogen ions cannot exist alone, but they exist after combining with water molecules. Which of the following is the correct way to show hydrogen ions?", o: ["HO-", "H3O+", "H2", "H2SO4"], a: 1, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Which factor contributes to the occurrence of rainfall in the north-western parts of India during winters?", o: ["Southwest Monsoon", "Trade Winds", "Western Disturbances", "Northeast Monsoon"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "किस समिति ने सुझाव दिया कि करों का भुगतान करना भी नागरिकों का मौलिक कर्तव्य होना चाहिए?", o: ["भूटा सिंह समिति", "स्वर्ण सिंह समिति", "चरण सिंह समिति", "जे एस वर्मा समिति"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT covered by the appellate jurisdiction of the Supreme Court?", o: ["Civil cases", "Criminal cases", "Constitutional cases", "Conflicts between central and state"], a: 3, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Har Ghar Tiranga movement was proposed in which year’s Independence Day?", o: ["2020", "2022", "2021", "2019"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Which of the following Constitutional Amendment Acts is related to the addition of eleventh fundamental duty in the Indian Constitution?", o: ["69th Constitutional Amendment Act", "81st Constitutional Amendment Act", "83rd Constitutional Amendment Act", "86th Constitutional Amendment Act"], a: 3, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "The festival of Pushkaralu is celebrated to promote the cultural heritage of which Indian state?", o: ["Tamil Nadu", "Karnataka", "Kerala", "Andhra Pradesh"], a: 3, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "The first edition of the Commonwealth Youth Games was held in the year:", o: ["2008", "2004", "2000", "2011"], a: 2, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "विधान-परिषद के सदस्य के रूप में निर्वाचित होने के लिए किसी व्यक्ति की आयु __________________ वर्ष से कम नहीं होनी चाहिए।", o: ["25", "35", "30", "21"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "As we go down under water in a ocean the water pressure:", o: ["decreases", "remains constant and equal to the atmospheric pressure", "increases", "remains less than atmospheric pressure"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "1993-94 तक, गरीबी रेखा, ________ के आंकड़ों पर आधारित होती थी।", o: ["मिश्रित संदर्भ अवधि (Mixed Reference Period)", "मिश्रित शोध अवधि (Mixed Research Period)", "समान संसाधन अवधि (Uniform Resource Period)", "समान शोध अवधि (Uniform Research Period)"], a: 2, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "The ocean has _________ main temperature layers.", o: ["five", "two", "four", "three"], a: 3, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which state does the noted Sindhi Sarangi player Lakha Khan belong to?", o: ["Rajasthan", "Punjab", "Uttarakhand", "Haryana"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "The headquarters of West Central Railway Zone of Indian Railway is located in ________.", o: ["Jaipur", "Bhopal", "Agra", "Jabalpur"], a: 3, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "मोरमुगाओ बंदरगाह किस राज्य में स्थित है?", o: ["तमिलनाडु", "पश्चिम बंगाल", "गोवा", "महाराष्ट्र"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "दिए गए विकल्पोंों में से कौन-सा विकल्प, नागर मंदिर वास्तुकला में 'जगती' शब्द का सबसे अच्छा वर्णन करता है?", o: ["ऊंचा चबूतरा, जो मुख्य देवी देवताओं का स्थान होता है", "ऊंचा चबूतरा, जिस पर ध्वज (झंडा) लगाया जाता है", "ऊंचा चबूतरा, जिस पर कलश होता है", "ऊंचा चबूतरा, जिस पर मंदिर बना होता है"], a: 3, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "When was Rajiv Gandhi Khel Ratna Award renamed as Major Dhyan Chand Khel Ratna Award?", o: ["2022", "2021", "2020", "2019"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "कम्युनिस्ट जर्नल 'वैनगार्ड (Vangaurd)' के संपादक बनने वाले स्वतंत्रता सेनानी का नाम बताइए।", o: ["सी. राजगोपालाचारी", "एम.एन. रॉय", "के. केलप्पन", "पी. कृष्णा पिल्लई"], a: 1, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "The second edition of the Khelo India Winter Games 2021 was held in which of the following states/Union Territories?", o: ["Sikkim", "Himachal Pradesh", "Jammu and Kashmir", "Uttarakhand"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Vyjayanthi Kashi is an exponent of which Indian classical dance form?", o: ["Kuchipudi", "Bharatanatyam", "Mohiniattam", "Odissi"], a: 0, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Globalisation is a ________ phenomenon.", o: ["multi-dimensional", "cultural only", "uni-dimensional only", "political only"], a: 0, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Which of the following statements is NOT correct about cell cycle?", o: ["M is a meiosis phase.", "In G2, phase cell prepare to divide.", "The correct sequence of cell cycle is G1,S, G2, M.", "DNA replication takes place in S cycle."], a: 0, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Which of the following cricketers has written an autobiography titled ‘Six Machine’?", o: ["Brendon McCullum", "Chris Gayle", "Jacques Kallis", "Adam Gilchrist"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Who among the following is a Sangeet Natak Akademi award-winning Bharatanatyam dancer?", o: ["Jayalakshmi Eshwar", "Kumkum Dhar", "Sunanda Nair", "M Sailaja"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "लघु उद्योग को परिभाषित करने के लिए एक मानदंड क्या है?", o: ["एक वर्ष की अवधि के दौरान कारोबार की राशि", "इकाई का आकार", "किसी विशेष वर्ष के दौरान इकाई की कुल बिक्री", "एक इकाई की संपत्ति पर अधिकतम निवेश की अनुमति"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "मक्कूू, तुइवई, सोनाई और रुक्नी किस नदी की सहायक नदियाँ हैं?", o: ["बराक", "पेन्नार", "साबरमती", "तापी"], a: 0, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "When was Tattvabodhini Sabha established?", o: ["1851", "1831", "1843", "1839"], a: 3, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "As per Census 2011, which of the following states/union territories has the highest male literacy rate?", o: ["Kerala", "Mizoram", "Chandigarh", "Lakshadweep"], a: 0, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "पुदुक्कोट्टई दक्षिणमूर्ति पिल्लई एक प्रसिद्ध _________ वादक हैं।", o: ["मेज़", "गिटार", "बाँसुरी", "कंजीरा"], a: 3, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Which of the following states was selected by the Indian Government to try a new variety of wheat seeds for the first time during the green revolution?", o: ["Madhya Pradesh", "Punjab", "Uttar Pradesh", "Bihar"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "1969 में बैंकों के राष्ट्रीीयकरण के दौरान निम्नलिखित में से किस बैंक का राष्ट्रीीयकरण नहीं किया गया था?", o: ["केनरा बैंक", "एसबीआई", "यूको बैंक", "बैंक ऑफ बड़ौदा"], a: 1, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "‘Sunny Days: An Autobiography’ is written by which of the following Indian cricketers?", o: ["Sunil Gavaskar", "Rahul Dravid", "Mohinder Amarnath", "Kapil Dev"], a: 0, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT an element of the Competition Act 2002?", o: ["Prohibition of anti-competitive agreements", "Regulation of combination", "Abuse of dominant position", "Prohibition of trade"], a: 3, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "In which language is the Hathigumpha Inscription engraved?", o: ["Sanskrit", "Hindi", "Pali", "Marathi"], a: 2, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Who among the following Gupta kings is popularly known as the Napoleon of India?", o: ["Samudragupta", "Kumaragupta I", "Ghatotkacha", "Vishnugupta"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "अनुच्छेेद 166 के अनुसार किसी राज्य सरकार की समस्त कार्यपालिका कार्यवाही किसके नाम पर व्यक्त की जाएगी ?", o: ["राज्यपाल", "मुख्यमंत्री", "राज्य महाधिवक्ता", "राष्ट्रपति"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Who among the following was given the title of ‘Queen of Kathak’ by Gurudev Rabindranath Tagore?", o: ["Rukmini Devi Arundale", "Sanjukta Panigrahi", "Shanta Rao", "Sitara Devi"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "इल्तुतमिश का कुतुबुद्दीन ऐबक से क्या संबंध था?", o: ["दामाद", "भाई", "बहनोई", "पुत्र"], a: 0, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "बौद्धोंों द्वारा निर्मित कन्हेरी गुफाएँ निम्नलिखित में से किस राज्य में स्थित हैं?", o: ["गुजरात", "महाराष्ट्र", "बिहार", "मध्य प्रदेश"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Which of the following fundamental duties was added by the 86th Constitutional Act, 2002?", o: ["To protect and improve the natural environment", "To safeguard public property", "To uphold and protect the sovereignty, unity and integrity of India", "To provide opportunities for education to his/her child between 6 and 14 years"], a: 3, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "In which year did the Indian Government develop ‘SMILE’ (‘Support for Marginalized Individuals for Livelihood and Enterprise’)?", o: ["2019", "2021", "2022", "2018"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Qandahar was lost to the __________ during the reign of Shah Jahan.", o: ["Seljuks", "Uzbegs", "Pahlavis", "Safavids"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "In which of the following kingdoms is the eukaryotic cell NOT found?", o: ["Monera", "Animalia", "Protista", "Fungi"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "1875 में स्थापित निम्नलिखित में से कौन-सा संगठन मूर्ति पूजा का विरोध करता है और वेदों की अचूकता का समर्थन करता है?", o: ["आर्य समाज", "परमहंस मंडली", "प्रार्थना समाज", "रामकृष्ण मिशन"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "The 97th Constitutional Amendment Act of 2011 added a new directive principle of state policy relating to __________________.", o: ["interstate relations", "quasi-judicial bodies", "cooperative societies", "rivers and water bodies"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Through which of the following Government of India Acts the Montagu-Chelmsford Reforms introduced Dyarchy in the provinces?", o: ["1858", "1894", "1919", "1935"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "भारत सरकार ने क्षेत्रीय ग्रामीण बैंकों की स्थापना किस वर्ष शुरू की थी?", o: ["1975 में", "1992 में", "2005 में", "1951 में"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन एक प्रसिद्ध 'सत्रीया' नर्तकी है?", o: ["शारोदी सैकिया", "अलुना काबुईनी", "सोनल मानसिंह", "मल्लिका साराभाई"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन-सा अंतरराष्ट्रीीय संगठन शतरंज का शासी निकाय है?", o: ["ICC", "IOC", "FIDE", "FIFA"], a: 2, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "15nov2023-s3-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "15nov2023-s3-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at 'AB' as shown.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "15nov2023-s3-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "15nov2023-s3-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, even if it appears to be at variance with commonly known facts, decide which of the given conclusions logically follow(s) from the statements. Statements: • All bags are pants. • All pants are eggs. • All eggs are flowers. Conclusions: I. All pants are flowers. II. All pants are bags. III. All flowers are bags. IV. All flowers are pants.", o: ["Only conclusion III follows", "Only conclusion IV follows", "Only conclusion I follows", "Only conclusion II follows"], a: 2, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "The sequence of folding a piece of paper and the manner in which the folded paper is cut is shown in the following figure. How would this paper look when unfolded?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "15nov2023-s3-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Six people, S, T, U, V, W and X, are sitting in a straight row facing north. Only two people sit to the left of U. Only two people sit between U and X. T sits to the immediate right of S. W sits to the immediate left of V. V is not a neighbour of X. Who sits at the extreme left end of the row?", o: ["W", "X", "V", "S"], a: 0, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘SITE’ is written as ‘WMXI’ and ‘MAKE’ is written as ‘QEOI’ . How will ‘TERM’ be written in that language?", o: ["XHUP", "XIVQ", "WHVQ", "WIUO"], a: 1, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Which of the following options will replace the question mark (?) in the given series? 286, 257, 230, 205, ?, 161", o: ["188", "178", "182", "192"], a: 2, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "15nov2023-s3-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "15nov2023-s3-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["12", "8", "14", "10"], a: 2, e: "", qimg: "15nov2023-s3-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["4", "5", "2", "1"], a: 3, e: "", qimg: "15nov2023-s3-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 63 : 9 :: 84 : ? :: 119 : 17", o: ["4", "8", "12", "16"], a: 2, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the correct mirror image from the following options, when the mirror is placed on the right side of the given figure.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "15nov2023-s3-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding /deleting /multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is NOT allowed) (676, 553), (784, 661)", o: ["(547, 424)", "(421, 301)", "(691, 581)", "(752, 628)"], a: 0, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "15nov2023-s3-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "उस विकल्प का चयन कीजिए, जो तीसरे शब्द से उसी प्रकार संबंधित है ,जिस प्रकार दूसरा शब्द पहले शब्द से संबंधित है। (शब्दोंों को अंग्रेजी/हिंदी के अर्थपूर्ण शब्दोंों के रूप में माना जाना चाहिए और ये शब्द, अक्षरों की संख्या/ व्यंजनों/स्वरों की संख्या के आधार पर एक-दूसरे से संबंधित नहीं होने चाहिए।) चूज़े (Chicken) : ब्रूड (Brood) :: मधुमक्‍खियां (Bees) :?", o: ["गैंग (Gang)", "मॉब (Mob)", "लीग (League)", "स्वार्म (Swarm)"], a: 3, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["÷ and −", "− and ×", "− and +", "+ and ×"], a: 1, e: "", qimg: "15nov2023-s3-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Three different positions of the same dice are shown. Find the number on the face opposite to the face showing ‘6’.", o: ["4", "5", "3", "1"], a: 2, e: "", qimg: "15nov2023-s3-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "15nov2023-s3-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "15nov2023-s3-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? BMXO, EOUM, ?, KSOI, NULG", o: ["FQRL", "HQRK", "HORL", "FQSK"], a: 1, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "15nov2023-s3-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given equation. 12*6*3*2*8*4", o: ["+, ×, –, ÷, =", "+, ×, –, =, ÷", "+, –, ×, ÷, =", "÷, –, ×, +, ="], a: 3, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of money on compound interest becomes double of itself in 3 years. How many years will it take for the amount to become eight times of itself at the same rate of interest.?", o: ["7", "9", "5", "8"], a: 1, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "Two numbers are in the ratio 5 : 7. The product of their HCF and LCM is 2835. What is the sum of the numbers?", o: ["108", "107", "109", "106"], a: 0, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["2,800", "2,000", "1,600", "2,400"], a: 3, e: "", qimg: "15nov2023-s3-q-78.png" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Ramesh lent some amount of money at 12% simple interest and an equal amount of money at 15% simple interest, each for 2 years. If his total interest was ₹675, the amount lent was (lent at 12%):", o: ["₹1,150", "₹1,550", "₹1,350", "₹1,250"], a: 3, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "A positive integer is said to be prime if it is not divisible by any positive integer other than itself and one. Let K be a prime number strictly greater than 5. When K2+19 is divided by 12, the remainder will be:", o: ["8", "1", "7", "5"], a: 0, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "In a school, 45% of the staff is female. 80% of the female staff and 60% of the male staff are postgraduates. Find the percentage of the non-postgraduate staff in the school.", o: ["31%", "64%", "42%", "53%"], a: 0, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "Komal sold two devices, each for ₹4,982. If she made 6% profit on the first and 6% loss on the second, what is the total cost of both the devices?", o: ["₹11,000", "₹9,000", "₹8,000", "₹10,000"], a: 3, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A is thrice as good a workman as B and is, therefore, able to finish a job in 60 days less than B. Working together, they can do it in:", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "15nov2023-s3-q-83.png" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1.79", "1.99", "2.17", "2.79"], a: 0, e: "", qimg: "15nov2023-s3-q-84.png" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the average of 144, 169,196, 225 and 256?", o: ["108", "208", "188", "198"], a: 3, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "A number is first decreased by 30% and then, increased by 40%. The resulting number is again increased by 5%. What is the net increase or decrease percentage?", o: ["Decrease of 3.4%", "Increase of 3.4%", "Increase of 2.9%", "Decrease of 2.9%"], a: 2, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["30", "27", "32", "23"], a: 3, e: "", qimg: "15nov2023-s3-q-87.png" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Zeeshan travelled for 40 minutes at a speed of 75 km/h and for 20 minutes at 60 km/h. Find his average speed (in km/h) during the journey.", o: ["70", "65", "67.5", "72.5"], a: 0, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper sells his goods at a 30% discount. Find the marked price of an article whose selling price is ₹1,190.", o: ["₹1,800", "₹1,500", "₹1,700", "₹1,600"], a: 2, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "A tower is topped by a hemispherical dome that has a surface area of 363π sq.ft approximately. Find the volume of the dome (in cubic ft).", o: ["665.7π", "887.3π", "792.7π", "724.3π"], a: 1, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365 what is the cell address of the cell two columns to the right and three rows down from cell D7?", o: ["F9", "E9", "G10", "F10"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Where is the position of the menu bar in accordance with the title bar in MS word 365?", o: ["Menu bar is situated below the title bar.", "Menu bar is situated above the title bar.", "Menu bar is situated to the left of the title bar.", "Menu bar is situated to the right of the title bar."], a: 0, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365 what is the Microsoft Excel formula to create an absolute cell reference for cell B2?", o: ["B2", "$B$2", "$B2", "B$2"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "In Microsoft Excel 365, how do you start to write a formula?", o: ["By typing =", "By typing ;", "By typing /", "By typing :"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which of the following is an Internet accessing technique where computer uses its modem to dial a telephone number given to the user by an Internet Service Provider?", o: ["Digital Subscriber Line", "Dial up Connection", "Broadband Connection", "Integrated Services Digital Network (ISDN) Service"], a: 1, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "In MS-Word 365, which action allows you to replace a specific word or phrase throughout the entire document?", o: ["Cut", "Copy", "Paste", "Find and Replace"], a: 3, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "In MS-Word 365, what is the primary difference between the ‘Save’ and ‘Save As’ commands?", o: ["‘Save’ is used to save the document with a new filename or in a different location,", "‘Save’ is used to save the document in the cloud storage, while ‘Save As’ is used to", "‘Save’ is used to save the document for the first time, while ‘Save As’ is used to save", "Both ‘Save’ and ‘Save As’ perform the same function of saving the document; they"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which option in Page Setup of MS word 365 determines whether the content of the document is displayed vertically or horizontally?", o: ["Columns", "Paper Size", "Margins", "Orientation"], a: 3, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following is an effective method to handle SPAM emails?", o: ["Forward the email to all your contacts", "Mark the email as SPAM or Junk", "Unsubscribe from all mailing lists", "Reply to the sender asking them to stop"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following is the most appropriate option to print pages 1, 3, 5 and so on in MS Word 365?", o: ["Print Odd pages", "Print", "Print Even pages", "Print all"], a: 0, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 15 Nov 2023 Shift-3";
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
