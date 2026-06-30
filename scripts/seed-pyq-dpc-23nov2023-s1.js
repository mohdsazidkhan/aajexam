/**
 * Seed: Delhi Police Constable - 23 Nov 2023 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc23nov2023_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-23nov2023-s1';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 23 Nov 2023 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Who among the following is NOT a tabla player?", o: ["Pannalal Ghosh", "Sabir Khan", "Zakir Hussain", "Sandeep Das"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "जतिन गोस्वामी, जिन्हें संगीत नाटक अकादमी फैलोशिप से सम्मानित किया गया था, _________ नृत्य शैली के प्रसिद्ध नर्तक हैं।", o: ["कथक", "छऊ", "मणिपुरी", "सत्रिया"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "The melting point of a solid is defined as:", o: ["the minimum temperature at which the solid melts to become liquid at the atmospheric pressure", "the minimum temperature at which the solid melts to become liquid at a high pressure", "the minimum temperature at which the solid melts to become liquid at a low pressure", "the maximum temperature at which the solid melts to become liquid at atmospheric pressure"], a: 0, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Who among the following has played the highest number of ODI matches as the Captain of the Indian cricket team, as of 2021?", o: ["Mahendra Singh Dhoni", "Kapil Dev", "Sachin Ramesh Tendulkar", "Virat Kohli"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Which of the following schedules vests additional discretionary powers to the Governors of Mizoram and Tripura?", o: ["6th Schedule", "4th Schedule", "5th Schedule", "7th Schedule"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "विभाजन की कठोर वास्तविकताओं पर आधारित उपन्यास 'कितने पाकिस्तान' के उपन्यासकार ________ हैं।", o: ["फणीश्वर नाथ रेणु", "कमलेश्वर", "काशी नाथ सिंह", "मुंशी प्रेमचंद"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "What is time period under Article 22 (2) of the Constitution of India for every person who is arrested and detained in custody to be produced before the nearest magistrate?", o: ["Within 24 hours", "Within 48 hours", "Within 12 hours", "Within 30 hours"], a: 0, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से किस स्थान पर 'अखिल भारतीय मुस्लिम लीग' (All India Muslim League) की स्थापना की गई थी?", o: ["लाहौर", "ढाका", "कराची", "कलकत्ता"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "In which of the following years was there an all-India campaign in opposition to the all- white Simon Commission?", o: ["1939", "1922", "1942", "1928"], a: 3, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "भारतीय संविधान के किस अनुच्छेेद में उल्लेख किया गया है कि किसी भी अपराध के आरोपी व्यक्ति को अपने खिलाफ गवाह बनने के लिए मजबूर नहीं किया जाएगा?", o: ["अनुच्छेेद 16", "अनुच्छेेद 26", "अनुच्छेेद 20", "अनुच्छेेद 24"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "The Hindustan Socialist Republican Association was founded in ______ by famous revolutionaries like Chandrasekhar Azad, Bhagat Singh, Batukeshwar Dutt and others.", o: ["1921", "1928", "1925", "1919"], a: 1, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "What is the maximum limit of loan under MUDRA Yojana?", o: ["₹1 lakh", "₹5 lakh", "₹50,000", "₹10 lakh"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Lohri is a popular folk festival of which of these states?", o: ["Punjab", "Goa", "Gujarat", "Himachal Pradesh"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "The colossal monolithic statue of Gomateshwara at Shravanabelagola is carved out of a single block of _________ .", o: ["marble", "granite", "stone", "rock"], a: 1, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Which of the following has universal acceptability in discharge of debt & payment obligations?", o: ["Bonds", "Legal tender money", "Houses", "Landed property"], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "The hydrological cycle deals with _________.", o: ["soil", "water", "air", "rocks"], a: 1, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Sangeet Natak Akademi is a society under which ministry of the Government of India?", o: ["Ministry of Home Affairs", "Ministry of Tourism", "Ministry of Culture", "Ministry of Youth Affairs and Sports"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Which of the following organisations has declared October 2 as the International Day of Non-violence to honour Gandhi’s ways?", o: ["International Federation Red Cross and Red Crescent", "United National General Assembly", "United Nations Development Fund", "Amnesty International"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Which of the following is a communication mail channel to facilitate quick delivery of mails in large towns and cities of India?", o: ["Pink channel", "State channel", "Bulk mail channel", "Small mail channel"], a: 2, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT the lead bank?", o: ["HDFC Bank", "Canara Bank", "State Bank of India", "Indian bank"], a: 0, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Who among the following is the writer of ‘Train to Pakistan’, ‘Good, Bad and Ridiculous’ and ‘Delhi: A Novel’?", o: ["Ruskin Bond", "Khushwant Singh", "Vikram Seth", "Amitav Ghosh"], a: 1, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "In which of the following states/UTs were Khelo India Youth Games 2023 organised?", o: ["Punjab", "Madhya Pradesh", "Maharashtra", "Delhi"], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "कृषि सांख्‍यिकी – एक झलक 2015 के अनुसार, भारत वर्ष 2013 में किस फसल का सबसे बड़ा उत्पादक था, जिसका वैश्विक उत्पादन में लगभग 25 प्रतिशत योगदान होता था?", o: ["बाजरा", "दाल", "तिलहन", "गन्ना"], a: 1, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "To provide opportunities for education to his/her children between the ages of ________ is the fundamental duty of the parents according to the 86th Constitutional Amendment Act.", o: ["6 to 14", "5 to 18", "4 to 14", "6 to 18"], a: 0, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Who among the following received the title ‘Nur Jahan'?", o: ["Ratan Bai", "Hamida Banu", "Man Bai", "Meherunissa"], a: 3, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "What was the name of the official mascot for the 44th International Chess Olympiad, which was held in India in 2022?", o: ["Thambi", "Chess Base", "Bathusa Turtlestein", "Chess mate"], a: 0, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "The condition, when the environment becomes enriched with nutrients, increasing the amount of plant and algae growth in estuaries and coastal waters, is called:", o: ["mineralisation", "ozone depletion", "greenhouse effect", "eutrophication"], a: 3, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "How many fundamental rights are provided by the Constitution as of November 2022?", o: ["5", "7", "8", "6"], a: 3, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "The Tumakuru mining belt is located in which state?", o: ["Odisha", "Jharkhand", "Rajasthan", "Karnataka"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "The Brihadeshwara Temple at Thanjavur was built by which of these rulers?", o: ["Raja Raja Chola I", "Rajadhiraja Chola II", "Raja Raja Chola III", "Rajendra Chola III"], a: 0, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Pandit Gopal Prasad Dubey won the Padma Shri for which form of dance?", o: ["Kathakali", "Bihu", "Chhau", "Sattriya"], a: 2, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से किस नीति में घरेलू अर्थव्यवस्था को वैश्विक अर्थव्यवस्था के साथ एकीकृत करना शामिल है?", o: ["भूमंडलीकरण (वैश्वीकरण)", "निजीकरण", "उदारीकरण", "पूंजीवादी अर्थव्यवस्था"], a: 0, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Kongampattu AV Murugaiyan, a _________ exponent, was awarded the Padma Shri in 2022.", o: ["dholak", "sitar", "thavil", "guitar"], a: 2, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "The ground water of Bihar and West Bengal is mostly contaminated by which metal?", o: ["Radium", "Mercury", "Arsenic", "Lead"], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "How many general electoral rolls are there for every territorial constituency for election of the Parliament?", o: ["3", "1", "4", "2"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "The Jaffna Peninsula, known for its cultural heritage and Tamil population, is located in which part of Sri Lanka?", o: ["Eastern Province", "Northern Province", "Western Province", "Central Province"], a: 1, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT responsible for hypertension?", o: ["Excess weight and lack of exercise", "Intake of nicotine either through smoking or chewing tobacco", "Living under stress and worry", "Consuming less salt"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Pavri Naach, a tribal dance of Maharashtra and Gujarat region is performed by which of the following tribes?", o: ["Kokna", "Khatola", "Koli", "Kalanga"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "The National Social Assistance Programme (NSAP) is a welfare programme being administered by the _________.", o: ["Ministry of Women and Child Development", "Ministry of Social Justice and Empowerment", "Ministry of Rural Development", "Ministry of Home Affairs"], a: 2, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which of the following cities hosted the 44th World Chess Olympiad in 2022?", o: ["Kolkata", "Mumbai", "New Delhi", "Chennai"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "During which year was the first Industrial Policy Resolution passed?", o: ["1957", "1967", "1948", "1958"], a: 2, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "सातवाहन साम्राज्य केअधीन प्रशासन का सबसे निचला स्तर एक ग्राम था, जो एक ______________ की देख-रेख के अधीन था।", o: ["राजुक", "अमात्य", "ग्रामिक", "नागरिक"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "A removal motion of a judge must be signed by _______ members if it is initiated in the Lok Sabha.", o: ["75", "50", "100", "54"], a: 2, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "As per the Industrial Policy Resolution 1956, Schedule B comprises of _________ industries.", o: ["14", "12", "13", "15"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "According to the 2011 census, how many districts were there in India?", o: ["610", "570", "640", "680"], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which of the following reports or missions mainly recommended that control over some aspects of provincial government be passed to Indian ministers responsible to an Indian electorate?", o: ["Morley Minto report", "Cripps’ Mission", "Montagu Chelmsford report", "Simon Commission report"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Which of the following is the most common saccharide found in peach juice puree, accounting for about 55% to 80% of the total sugar content?", o: ["Galactose", "Oligofructose", "Raffinose", "Sucrose"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "भारत में पुरापाषाण युग के कितने चरण हैं?", o: ["तीन", "एक", "दो", "चार"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Which of the following elements was NOT part of the Financial Sector Reforms under the Liberalisation Model?", o: ["Permission to set up private banks", "Setting of new branches without RBI approval", "Investment limit in foreign banks up to 74%", "RBI’s role was enhanced to gain control over banks"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "मातृ पक्ष की ओर से, मुग़ल ____________ के वंशज थे।", o: ["चंगेज़ खां", "ताजुद्दीन यल्दौज़", "तैमूर", "मोहम्मद गोरी"], a: 0, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct? 335 × 5 ÷ 7 + 65 − 213 = 321", o: ["+ and =", "÷ and ×", "÷ and −", "+ and −"], a: 1, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the option figure that will replace the question mark (?) in the figure given below to complete the pattern.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "23nov2023-s1-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster. KFUB : BKLG :: PNTD : GSKI :: IVFQ : ?", o: ["ZAWV", "WKNY", "ZDPA", "WNZA"], a: 0, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Three different positions of the same dice are shown (Figures 1-3). Find the number on the face opposite to the face showing ‘2’.", o: ["4", "1", "5", "3"], a: 2, e: "", qimg: "23nov2023-s1-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "23nov2023-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "23nov2023-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fourth number in the same way as the first number is related to the second number and the fifth number is related to the sixth number. 121 : 23 :: ? : 14 :: 166 : 32", o: ["80", "81", "76", "71"], a: 2, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: Some balloons are bags. All belts are bags. Conclusions: I. Some bags are balloons. II. Some belts are balloons.", o: ["Only conclusion II follows", "Neither conclusion I nor II follows", "Only conclusion I follows", "Both conclusions I and II follow"], a: 2, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "छह विद्यार्थी एक गोल मेज के परित: केंद्र की ओर अभिमुख होकर बैठे हैं। पलक और रूचि दोनों का निकटतम पड़ोसी साहिल है। तनय, पलक के बाएं से दूसरे स्थान पर बैठा है। उर्मी, रुचि के दाएं से तीसरे स्थान पर बैठी है। रूचि और तनय दोनों का निकटतम पड़ोसी क़ासिम है। उर्मी और क़ासिम दोनों का निकटतम पड़ोसी कौन है?", o: ["रूचि", "तनय", "पलक", "साहिल"], a: 1, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["2", "6", "3", "1"], a: 2, e: "", qimg: "23nov2023-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "23nov2023-s1-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["F", "E", "B", "A"], a: 1, e: "", qimg: "23nov2023-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series. b _ d _ p b c _ p _ _ c _ p p b _ _ p p", o: ["cpdpdbdc", "cpdpbdcd", "cdppbddc", "pcdpbdcd"], a: 1, e: "", qimg: "" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 21, 22, 24, 28, 36, ?", o: ["67", "52", "43", "47"], a: 1, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "23nov2023-s1-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "23nov2023-s1-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given equation. 18*14*6*16*4*254", o: ["+, ×, –, =, ÷", "÷, –, ×, +, =", "×, +, –, ÷, =", "+, ×, –, ÷, ="], a: 2, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Observe the dots on a dice (one to six dots) in the following figures. How many dots are contained on the face opposite to that containing four dots?", o: ["Six", "Two", "One", "Five"], a: 1, e: "", qimg: "23nov2023-s1-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "23nov2023-s1-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "23nov2023-s1-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern so that the final image is symmetrical.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "23nov2023-s1-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below and complete the pattern.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "23nov2023-s1-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["17", "5", "11", "15"], a: 2, e: "", qimg: "23nov2023-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding/subtracting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed) (12, 26, 57) (13, 27, 60)", o: ["(8, 91, 83)", "(19, 25, 66)", "(17, 21, 38)", "(45, 64, 119)"], a: 1, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘NATION’ is written as ‘RZLRQM’ and 'MARINE' is written as 'SZNRRV'. How will ‘ADVICE’ be written as in that language?", o: ["FNERCV", "EWJRCV", "ERZCWV", "FNZPVR"], a: 1, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "Arun receives a monthly salary. The ratio of his expenditure to savings is 8 ∶ 2. What percentage of his salary does he spend?", o: ["80%", "60%", "40%", "20%"], a: 0, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "A man can complete a work in 15 days, and a woman can complete the same work in 25 days. In how many days will 3 men and 5 women complete the same work?", o: ["3.5", "2", "2.5", "5"], a: 2, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "If P ∶ Q = 5 : 3, then find the value of (P4 - Q4 ) ∶ (P4 + Q4 ) .", o: ["227 : 335", "– 227 : 353", "– 272 : 353", "272 : 353"], a: 3, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "23nov2023-s1-q-79.png" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "Ratnesh marked the price of a pencil box at ₹80. What is the cost price (in ₹) of the pencil box if after giving a discount of 10%, Ratnesh still gains 20%?", o: ["58", "60", "72", "70"], a: 1, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "वह अधिकतम संभावित लंबाई ज्ञात करें जिसका उपयोग 5 मीटर 95 सेंटीमीटर, 8 मीटर और 16 मीटर 65 सेंटीमीटर की लंबाई को सटीकता से मापने के लिए किया जा सकता है?", o: ["5 सेंटीमीटर", "50 मीटर", "50 सेंटीमीटर", "5 मीटर"], a: 0, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "23nov2023-s1-q-82.png" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A music player is sold for ₹4,510 cash, or ₹1,200 cash down payment and the balance in three equal easy installments. If 10% is the rate of interest compounded annually, find the amount of instalment.", o: ["₹1,331", "₹1,330", "₹1,333", "₹1,332"], a: 0, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "The population of a town decreased from 3,68,000 in 2017 to 3,27,200 in 2020. What is the percentage decrease (to the nearest integer) in the population of the town?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "23nov2023-s1-q-84.png" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "If a,b,c,d and e are distinct prime numbers and the sum of these five numbers is odd, then a + b + c + d is:", o: ["an even prime number", "an odd prime number", "an odd number", "an even number"], a: 3, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "Which of the following pairs of numbers are relatively prime to each other?", o: ["(51, 119)", "(98, 567)", "(27, 51)", "(103, 113)"], a: 3, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "If Ram walks at a speed of 8 km/h, he misses a train by 7 minutes. However, if he walks at a speed of 10 km/h, he reaches the station 5 minutes before the departure of the train. Find the distance (in km) between Ram’s house and the station.", o: ["9", "7", "6", "8"], a: 3, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["₹555.8", "₹356.4", "₹456.5", "₹750.4"], a: 1, e: "", qimg: "23nov2023-s1-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "A cricketer has an average score of 52 runs in 10 innings. Find the number of runs to be scored by him in the 11th inning to raise the average score to 58.", o: ["98", "107", "122", "118"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "A person borrows ₹12,000 for 3 years at 2% per annum simple interest. He immediately lends it to another person at 4% per annum for 3 years. Find his gain in the transaction per year.", o: ["₹240", "₹360", "₹720", "₹630"], a: 0, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "In MS Word 365, which of the following commands allows the user to preview the document before printing it on paper?", o: ["Print", "View", "Layout Print Layout", "Print Preview"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following can be done by using the Spelling and Grammar tool in MS Word 365? A. Indicate grammatical errors B. Correct spelling errors as you type C. Identify words with capitalisation problems", o: ["A and C only", "A and B only", "B and C only", "A, B and C"], a: 3, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following is the shortcut key to Cut text in MS Word 365?", o: ["Shift+X", "Ctrl+C", "Ctrl+X", "Ctrl+Shift+X"], a: 2, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which of the following functions is used to find the smallest value in a range of cells?", o: ["AVERAGE", "MIN", "SUM", "COUNT"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, Which of the following is the correct way to save a duplicate MS Excel workbook with the same name as the original workbook, but in a different folder?", o: ["Select the desired folder in the ‘Save in’ field of the ‘Save As’ dialog box and click on the ‘Save’ button.", "Press Ctrl +V", "Press ‘Ctrl + D’", "Click on the ‘Insert’ menu and select ‘Save’."], a: 0, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365 which of the following keyboard shortcuts is used for saving a workbook in MS Excel 365?", o: ["Ctrl + S", "Shift + S", "Shift + C", "Ctrl + V"], a: 0, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a type of network?", o: ["ROR", "MAN", "LAN", "WAN"], a: 0, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which option is used to save changes made to an existing document in Microsoft Word 365?", o: ["Save", "Save Changes", "Save All", "Save With"], a: 0, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following components is typically included in the header of an email?", o: ["Body text", "Subject line", "Salutation", "Signature"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following terms is used to describe the space between the edge of the paper and the text in MS word 365?", o: ["Orientation", "Columns", "Size", "Margins"], a: 3, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 23 Nov 2023 Shift-1";
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
