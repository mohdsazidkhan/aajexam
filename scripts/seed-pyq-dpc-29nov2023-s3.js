/**
 * Seed: Delhi Police Constable - 29 Nov 2023 Shift-3
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc29nov2023_s3');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-29nov2023-s3';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 29 Nov 2023 Shift-3"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "अल्लाह रक्खा, साबिर खान, पंडित किशन महाराज, पंडित ज्ञान प्रकाश घोष और संदीप दास निम्नलिखित में से किस वाद्य यंत्र के प्रसिद्ध वादक हैं?", o: ["तबला", "मृदंगम", "पखवाज", "घटम"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "राष्ट्रीीय आय लेखांकन की किस पद्धति में उत्पादन केंद्रोंों को प्राथमिक, द्वितीयक और तृतीयक क्षेत्रोंों में वर्गीकृत करना शामिल है?", o: ["अवशिष्ट उपागम", "उत्पादन उपागम", "आय उपागम", "व्य उपागम"], a: 1, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Which Indian state has the world's longest highway tunnel (as of July 2023)?", o: ["West Bengal", "Himachal Pradesh", "Gujarat", "Rajasthan"], a: 1, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन 1867 में स्थापित एक सुधारवादी समाज 'प्रार्थना समाज' से संबंधित नहीं है?", o: ["बाल गंगाधर तिलक", "आर. जी. भंडारकर", "गोविन्द रानाडे", "आत्माराम पांडुरंग"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "According to Census 2011, which union territory has the highest male literacy rate?", o: ["Delhi", "Daman & Diu", "Lakshadweep", "Puducherry"], a: 2, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Which of the following Schedules of the Constitution of India have immunity from Judicial Review?", o: ["4th", "6th", "10th", "9th"], a: 3, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "The Mahabodhi Temple is in which of these states?", o: ["Uttar Pradesh", "Bihar", "Chhattisgarh", "Madhya Pradesh"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Which of the following statements about cell is correct?", o: ["Bacterial cell contains cellulose.", "Powerhouse of a cell is plastid.", "Cell is a functional unit of life.", "Cell membrane of a cell is hard and rigid."], a: 2, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which of the following is an example of double displacement reaction?", o: ["2Pb(NO3)2 (s) + Heat → 2PbO (s) + 4NO2 (g) + O2 (g)", "ZnO + C → + Zn + CO", "Fe(s) + CuSO4 (aq) → FeSO4 (aq) + Cu (s)", "Na2SO4 (aq) + BaCl2 (aq) → BaSO4 (s) + 2NaCl (aq)"], a: 3, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which part of our body is responsible for digestion?", o: ["Kidney", "Hands", "Gastric glands", "Heart"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which of the following is the darkest, or least reflective object in the Solar System with an albedo of 0.03?", o: ["9P/Tempel 1", "2P/Encke", "1P/Halley", "19P/Borrelly"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "The voting age was reduced from 21 years to 18 years by the ________ Constitutional Amendment Act of 1988.", o: ["51st", "61st", "71st", "41st"], a: 1, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Which of the following players won the Major Dhyan Chand Khel Ratna Award in Hockey in 2021?", o: ["PR Sreejesh", "Lovlina Borgohain", "Sumit Antil", "Ravi Kumar Dahiya"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन-सा युग्म गलत है?", o: ["चौथी पंचवर्षीय योजना-गरीबी हटाओ लक्ष्य", "प्रथम पंचवर्षीय योजना - कृषि विकास", "दूसरी पंचवर्षीय योजना - नेहरू महालनोबिस मॉडल", "तीसरी पंचवर्षीय योजना - गाडगिल योजना"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "इलाहाबाद के स्तम्भ पर हरिषेण द्वारा लिखित अभिलेख किस भाषा में है?", o: ["फ़ारसी", "संस्कृृत", "प्राकृत", "पाली"], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "What percentage of people were below the poverty line in India in 2011-2012 as per the Economic Survey 2013-14, released by the Ministry of Finance, Government of India?", o: ["12.4%", "21.9%", "10.2%", "18.7%"], a: 1, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से वह कौन तुर्की शासक था जिसने 1398 में लूट के इरादे से भारत पर आक्रमण किया था?", o: ["शाहरुख मिर्ज़ा", "तैमूर लंग", "चंगेज़ खान", "गुयुक खान"], a: 1, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन-सा विकल्प, पृथ्वी के अंतरंग का कोई भाग है?", o: ["समताप मंडल", "दुर्बलता मंडल", "ताप मंडल", "क्षोभ मंडल"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "In the context of external debt, what do ECBs stands for?", o: ["Essential Commercial Borrowings", "Essential Common Borrowings", "External Commercial Borrowings", "External Common Borrowings"], a: 2, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Srimanta Sankar Dev is associated with which of these dance forms?", o: ["Odissi", "Manipuri", "Sattriya", "Kathak"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "_______ का उद्देश्य, शेल्टर फॉर अर्बन होमलेस (SUH) योजना के तहत चरणबद्ध तरीके से शहरी बेघरों को आवश्यक सेवाओं सहित स्थायी आवास प्रदान करना है।", o: ["ग्रामीण आवास योजना", "राजीव आवास योजना", "प्रधानमंत्री आवास योजना", "राष्ट्रीीय शहरी आजीविका मिशन (NULM)"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "भारतीय भूवैज्ञानिक सर्वेक्षण (GSI) की स्थापना 1851 में मुख्य रूप से ________ के लिए कोयला भंडार खोजने हेतु की गई थी।", o: ["जापान को निर्यात करने", "समुद्री परिवहन", "रेलवे", "कपड़ा मील"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "मयूर सिंहासन के नाम से मशहूर रत्न जड़ित सिंहासन को ________ द्वारा साधिकार किया गया था।", o: ["औरंगजेब", "हुमायूँ", "अकबर", "शाहजहाँ"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन-सी नीति निजीकरण को बढ़ावा देती है? A. विनिवेश B. आउटसोर्सिंग C. शहरीकरण", o: ["केवल A और B", "A और C दोनों", "सभी – A, B और C", "केवल A"], a: 0, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "भारतीय संविधान के किस अनुच्छेेद में उल्लेख है कि कलात्मक या ऐतिहासिक रुचि के प्रत्येक स्मारक या स्थान या वस्तु की रक्षा करना राज्य का दायित्व होगा?", o: ["अनुच्छेेद 51", "अनुच्छेेद 47", "अनुच्छेेद 45", "अनुच्छेेद 49"], a: 3, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "भारत के संविधान में निम्नलिखित में से कौन-सी विशेषता भारत सरकार अधिनियम, 1935 से ली गई है?", o: ["आपातकाल के दौरान मौलिक अधिकारों का निलंबन", "संघीय योजना", "संसद के दोनों सदनों की संयुक्त बैठक", "गणतंत्र की कल्पना"], a: 1, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Under the LERMS system, what percentage of foreign exchange earnings can be converted at the official rate?", o: ["35", "40", "25", "20"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से किस खिलाड़ी का संबंध तलवारबाजी (fencing) से है?", o: ["सी.ए. भवानी देवी", "नवजीत कौर ढिल्लोंों", "पारुल चौधरी", "हिमा दास"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "In which of the following years was the Telangana Legislative Assembly established?", o: ["2012", "2013", "2014", "2010"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "In a cricket match, the number of balls in an over is _________ .", o: ["5", "7", "6", "8"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Which of the following Indian states is known for its extensive tea plantations?", o: ["Rajasthan", "Assam", "Punjab", "Gujarat"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "जब एक कोशिका विभाजित नहीं हो रही होती है, तो उसके नाभिक में अत्यधिक विस्तारित और विस्तृत न्यूक्लियो प्रोटीन तंतु होते हैं। इसे क्या कहते हैं?", o: ["फाइब्रोमैटिन", "ब्रोमैटिन", "क्रोमेटिन", "ट्युबुलिन"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "भारतीय संविधान के किस अनुच्छेेद में यह उल्लेख है कि 'मंत्रियों द्वारा राज्यपाल को दी गई सलाह की किसी भी न्यायालय में जांच नहीं की जाएगी'?", o: ["अनुच्छेेद 167", "अनुच्छेेद 161", "अनुच्छेेद 168", "अनुच्छेेद 163"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "With which Indian classical dance form is Sujata Mohapatra associated?", o: ["Bharatanatyam", "Odissi", "Sattriya", "Kathak"], a: 1, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Karaikudi R Mani is India's renowned player of the _________.", o: ["santoor", "mridangam", "violin", "sitar"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Makar Dhwaja Darogha was honoured with the Padma Shri for which form of dance?", o: ["Chhau", "Kalbelia", "Mohiniattam", "Kathak"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Cricketer Ravi Shastri represented the ________ team in the Ranji Trophy tournament.", o: ["Calcutta", "Karnataka", "Delhi", "Mumbai"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "निजीकरण के अर्थ के संबंध में निम्नलिखित कथनों पर विचार करें। (i) सार्वजनिक क्षेत्र के उद्यमों के स्वामित्व का हस्तांांतरण निजी क्षेत्र के उद्यमियों को न करना। (ii) सार्वजनिक क्षेत्र के उद्यमों के प्रबंधन का हस्तांांतरण निजी क्षेत्र के उद्यमियों को करना। सही उत्तर का चयन करें।", o: ["केवल (i) सत्य है", "(i) और (ii) दोनों असत्य हैं", "(i) और (ii) दोनों सत्य हैं", "केवल (ii) सत्य है"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "श्यामजी कृष्णवर्मा ने किस स्थान पर इंडिया होम रूल (India Home Rule) सोसाइटी की स्थापना की, जिसे इंडिया हाउस फॉर इंडियाज लिबरेशन (India House for India’s liberation) के नाम से जाना जाता है?", o: ["बर्लिन", "सैन-फ्रैैन्सिस्को", "लंदन", "पेरिस"], a: 2, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which liberal Viceroy enacted local self-government for municipalities and repealed the unpopular Vernacular Press Act of 1878?", o: ["Lord Ripon", "Lord Ilbert", "Lord Dufferin", "Lord Lytton"], a: 0, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "एलोरा का कैलाश मंदिर और महाबलीपुरम का रथ मंदिर किस प्रकार की मंदिर वास्तुकला के उदाहरण हैं?", o: ["विशालकाय", "पंचायतन", "निम्न आधार", "रॉक-कट"], a: 3, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "वेम्पति चिन्ना सत्यम ने किस प्रकार के नृत्य के लिए वर्ष 1998 में पद्म भूषण प्राप्त किया था?", o: ["कथक", "कुचिपुड़ी", "कथकली", "भरतनाट्यम"], a: 1, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से किस संविधान संशोधन अधिनियम में यह प्रावधान किया गया है कि सभी नागरिकों को सहकारी समितियाँ गठित करने का मौलिक अधिकार होगा?", o: ["89वां संशोधन अधिनियम", "99वां संशोधन अधिनियम", "91वां संशोधन अधिनियम", "97वां संशोधन अधिनियम"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "After MK Gandhi’s returning to India in 1915, who among the following advised him to travel around India to know the land and its people?", o: ["Gopal Krishna Gokhale", "Chittaranjan Das", "Bipin Chandra Pal", "Bal Gangadhar Tilak"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "गुप्त काल में कालिदास द्वारा लिखित राजा दुष्यंत की प्रेम कहानी पर आधारित नाटक निम्नलिखित में से कौन-सा था?", o: ["रघुवंशम्", "विक्रमोर्वशी", "कुमारसंभव", "अभिज्ञानशाकुंतल"], a: 3, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "पूर्वोत्तर भारत में, अहोम इस त्योहार को हर साल 31 जनवरी को सभी पारंपरिक वेशभूषा और धूमधाम से अपने पूर्वजों की पूजा करने के लिए एक आम जगह पर मनाते हैं। त्योहार की पहचान करें।", o: ["डोलजात्रा", "जोनबील मेला", "रोंगकर", "मे दम मे फी"], a: 3, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "भारत के पूर्व प्रधानमंत्रियों में से एक, आई.के. गुजराल ने निम्नलिखित में से कौन-सी आत्मकथा लिखी है?", o: ["फ्रॉम कॉरिडोर्स ऑफ पॉवर", "मैटर्स ऑफ डिस्क्रिशन", "माई टाइम्स", "लिविंग हिस्ट्रीी"], a: 1, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Who is the writer of the famous autobiography ‘The Story of My Life’?", o: ["Helen Keller", "Steve Jobs", "Anne Frank", "Mahatma Gandhi"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "मुद्रा आपूर्ति के निम्नलिखित उपायों में से किस उपाय को 'समाज के कुल मौद्रिक संसाधनों' के रूप में भी जाना जाता है?", o: ["M1", "M4", "M2", "M3"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Bihu festival is majorly celebrated in which of these states?", o: ["Goa", "Maharashtra", "Assam", "Kerala"], a: 2, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g., 13 – Operations on 13 such as adding/deleting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed) (13, 5, 87) (17, 6, 115)", o: ["(21, 7, 153)", "(9, 4, 6)", "(29, 9, 207)", "(25, 8, 171)"], a: 3, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "29nov2023-s3-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "29nov2023-s3-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 65 * 81 * 9 * 10 * 8 * 8", o: ["+ ÷ −× =", "÷ + −× =", "+ ÷ − = ×", "+ − ÷ × ="], a: 2, e: "", qimg: "" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s3-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "29nov2023-s3-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s3-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'MN' as shown below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "29nov2023-s3-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series. D _ P _ U D N _ T _ _ _ P T U D _ _ T U", o: ["TNUPDNNP", "NTUPNDPN", "TNPUNDPN", "NTPUDNNP"], a: 3, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Six letters, J, K, L, M, N and O, are written on the different faces of a dice. Two positions of this dice are shown in the given figure. Find the letter on the face opposite to M.", o: ["L", "K", "O", "N"], a: 1, e: "", qimg: "29nov2023-s3-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Six persons U, V, W, X, Y, Z are sitting in a circle facing each other. V is between X and W. U is between Y and W. Z is to the immediate right of X. Who is the immediate neighbour of both U and Z?", o: ["V", "W", "X", "Y"], a: 3, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "29nov2023-s3-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "29nov2023-s3-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s3-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 30, 45, 75, 135, 255, ?", o: ["495", "634", "430", "568"], a: 0, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct? 16 ÷ 4 + 20 × 82 − 14 = 148", o: ["= and ×", "+ and −", "+ and ×", "+ and ="], a: 2, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "29nov2023-s3-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "In a certain code, if 15-20-17-2-7-0-18-5 denotes PURCHASE and 14-17-3-4-18 denotes ORDER, then what does 15-17-14-2-4-18-19 denote?", o: ["ARRANGE", "PACKETS", "PROCESS", "PROCEED"], a: 2, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "29nov2023-s3-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Given below is a series of figures – A, B, C and D which follow a particular pattern. Which of the given option figures should come in place of E to continue the series?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "29nov2023-s3-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["25", "19", "11", "14"], a: 3, e: "", qimg: "29nov2023-s3-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fourth number in the same way as the first number is related to the second number and the fifth number is related to the sixth number. 311 : 1244 :: ? : 1760 :: 531 : 2124", o: ["395", "410", "440", "352"], a: 2, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "29nov2023-s3-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. INCH : EKAG :: INKS : EKIR :: IDOL : ?", o: ["DAML", "EANJ", "EAMK", "EANK"], a: 2, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance from commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: Some Baskets are Cakes. Some Cakes are Tarts. Conclusions: I. Some Cakes are Baskets. II. Some Tarts are Cakes.", o: ["Only conclusion I follows.", "Only conclusion II follows.", "Neither conclusion I nor II follows.", "Both conclusions I and II follow."], a: 3, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "The radius of a sphere is 1.65 cm. Find the exact surface area (in cm2) of this sphere.", o: ["10.79 π", "10.69 π", "10.89 π", "10.99 π"], a: 2, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of the number of boys to that of the girls in a school is 9 : 13. If the total number of boys and girls in the school is 2134, what is the number of boys in that school?", o: ["855", "891", "882", "873"], a: 3, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "The price of a computer is ₹34,000. What will be the price of the computer (in ₹) after a reduction of 17%?", o: ["26,200", "30,500", "28,220", "27,380"], a: 2, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "The average height of 16 students of a group is 160 cm. If the average height of the first 6 students in the group is 150 cm and those of the last 8 students is 165 cm, then find the average height of the remaining two students, in cm.", o: ["340", "260", "170", "150"], a: 2, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "The salaries of P and Q together amount to ₹4,32,000. P and Q spend 75% and 61% of their salaries, respectively. If their savings are equal, then what is P’s salary?", o: ["₹2,36,750", "₹2,63,750", "₹2,63,250", "₹2,36,250"], a: 2, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "The simple interest on ₹24,000 at a certain rate of interest for 3 years is ₹7,200. What will be the compound interest(compounded annually) on the same sum at the same rate and for the same time?", o: ["₹7,954", "₹7,854", "₹7,845", "₹7,944"], a: 3, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["180 cm2", "108 cm2", "154 cm2", "148 cm2"], a: 2, e: "", qimg: "29nov2023-s3-q-82.png" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A garrison of 1500 men has provisions for 12 days. How long will the provisions last if the garrison is increased to 2000 men?", o: ["12 days", "9 days", "10 days", "6 days"], a: 1, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Which of the following numbers is greater than the sum of all the prime factors of 1560?", o: ["21", "22", "23", "41"], a: 3, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "राम ने किशन से 20% साधारण ब्याज पर ₹30,000 का ऋण लिया। वह 4 वर्ष के लिए 1 वर्ष के अंत में चार समान किस्तोंों में ब्याज सहित ऋण चुकाने के लिए सहमत होता है। हालाँकि, किशन एक शर्त रखता है कि वह तब तक उधार दी गई मूल राशि पर ब्याज की गणना करता रहेगा, जब तक कि राम पूरी तरह से अपना ऋण चुका नहीं देता। प्रत्येक किश्त की धनराशि क्या होगी?", o: ["₹12,450", "₹11,500", "₹13,500", "₹13,000"], a: 2, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "Simplify (0.85 × 3.4 × 2.4) ÷ 0.3.", o: ["24.04", "24.34", "23.02", "23.12"], a: 3, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "The marked price of a table lamp is ₹1,500. If the marked price is 20% above the cost price and the table lamp is sold at a discount of 10%, then find the profit percentage.", o: ["7%", "9%", "8%", "10%"], a: 2, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Aman bought two chairs for ₹1,800. He sold the first chair at a 12% profit and the second one at a 20% profit. Had he sold the first chair at a 20% profit and the second one at a 12% profit, he would have received ₹36 more. Find the difference between the cost-price of the two chairs.", o: ["₹450", "₹650", "₹525", "₹675"], a: 0, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "The LCM of two numbers is 18 times their HCF. The sum of the LCM and HCF is 855. If one number is 81, then what is the other number?", o: ["458", "450", "440", "448"], a: 1, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "काजल अपनी साइकिल से स्कूूल जाती है। यदि वह 4 km/h अधिक चाल से चलती है, तो वह निर्धारित समय से 3 मिनट पहले स्कूूल पहुंचती है, यदि वह 2 km/h कम चाल से चलती है, तो वह निर्धारित समय से 2 मिनट बाद स्कूूल पहुंचती है। उसके घर से स्कूूल की दूरी (Km में) कितनी है?", o: ["4", "3", "8", "6"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following statements related to attaching a file to an email is correct?", o: ["Writing a subject field is mandatory while sending an attachment.", "We can’t use CC field while sending an attachment.", "We can’t attach an audio file in an email attachment.", "In Gmail, If your file is greater than 25 MB, Gmail automatically adds a Google Drive link in the email instead of including it as an attachment."], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "एमएस वर्ड 365 (MS Word 365) में निम्नलिखित में से किस विकल्प से आप किसी डॉक्यूमेंट के लेआउट के विभिन्न पहलुओं, जैसे पेपर साइज़, मार्जिन, ओरिएंटेशन और पेज नंबरिंंग को अनुकूलित कर सकते हैं?", o: ["डॉक्यूमेंट इंस्पेक्टर", "प्रिंट लेआउट व्यू", "पेज सेटअप", "नेविगेशन पेन"], a: 2, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a characteristic of communication on the internet?", o: ["It is asynchronous.", "It is interactive.", "It is global.", "It is always private."], a: 3, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, if you set a row height to 0 (zero), what happens to the row?", o: ["It hides the row.", "It asks for a new value.", "It sets the default height.", "It returns to the last entered value."], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In Microsoft Excel 365, which of the following functions is used for displaying the current date?", o: ["Time()", "Now()", "Today()", "Day()"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365,what is the keyboard shortcut to automatically adjust the width of a column to fit the content in Excel?", o: ["Ctrl + W", "Ctrl + Spacebar", "Ctrl + A", "ALT + H then O and then I"], a: 3, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "When we press the control key with the letter E, what happens to the text in the MS- Word 365?", o: ["It selects the whole content on the file.", "Right aligns the contents on the page.", "Centers the contents on the page.", "Left aligns the contents on the page."], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which action in MS-Word 365, allows you to remove selected text from its original location and place it on the clipboard?", o: ["Copy", "Cut", "Paste", "Select All"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following is the shortcut key to Paste text in MS Word 365?", o: ["Ctrl+Shift+V", "Shift+V", "Ctrl+V", "Ctrl+C"], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a common method of opening a document in a web- based document editor like Google Docs?", o: ["Typing the entire document from scratch", "Creating a new document from a template", "Importing a document from a web link", "Uploading the document from your computer"], a: 0, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 29 Nov 2023 Shift-3";
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
