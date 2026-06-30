/**
 * Seed: Delhi Police Constable - 17 Nov 2023 Shift-3
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc17nov2023_s3');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-17nov2023-s3';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 17 Nov 2023 Shift-3"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Which country did India beat in the Thomas Cup Finals in 2022?", o: ["Indonesia", "Malaysia", "Pakistan", "Singapore"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Who among the following is a famous performer of Kalbelia dance form?", o: ["Minati Mishra", "Geeta Mahalik", "Gulabo Sapera", "Vyjayanti Kashi"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "नलवाड़ी मेला किस भारतीय राज्य में आयोजित किया जाता है?", o: ["पंजाब", "उत्तर प्रदेश", "हिमाचल प्रदेश", "हरियाणा"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Which of the following is an example of a Western coast port?", o: ["Vishakhapatnam port", "Kandla port", "Haldia port", "Tuticorin port"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "रथ सप्तमी का सांस्कृृतिक उत्सव मुख्य रूप से भारत के किस राज्य में मनाया जाता है?", o: ["पश्चिम बंगाल", "बिहार", "हिमाचल प्रदेश", "आंध्र प्रदेश"], a: 3, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Who has the power to grant pardons?", o: ["Chief Justice of India", "Attorney General", "Chief Minister", "President"], a: 3, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "The aim of ‘Poorna Swaraj’ was adopted during the 1929 session of the _________ Congress.", o: ["Lucknow", "Poona", "Amritsar", "Lahore"], a: 3, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Which of the following Articles mentions that the state shall not deny to any person equality before the law or the equal protection of the laws within the territory of India?", o: ["Article 12", "Article13", "Article15", "Article14"], a: 3, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "नादिर शाह ________ का शासक था जिसने 1739 में दिल्ली शहर पर विजय प्राप्त करके इसे लूट लिया था।", o: ["ईरान", "इराक", "तुर्की", "मंगोलिया"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Nanjiyamma received the National Award _________ for the song Kalakkatha Sandana from the Malayalam film Ayyappanum Koshiyum.", o: ["2019", "2018", "2020", "2021"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "State legislature has the concurrent powers enumerated in List ______ of the Seventh Schedule of the Constitution of India.", o: ["I", "IV", "II", "III"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Who among the following social reformers of British India was known as Lokhitwadi?", o: ["VeeresalingamPantulu", "Gopal Hari Deshmukh", "Narayan Guru", "Jyotiba Phule"], a: 1, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Sonal Mansingh got the Sangeet Natak Akademi Award for which form of dance?", o: ["Manipuri", "Kuchipudi", "Mohiniattam", "Odissi"], a: 3, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Who among the following established the Arya Samaj and in which year?", o: ["Swami Dayananda Sarasvati in 1875", "Swami Vivekananda in 1785", "Swami Vivekananda in 1875", "Swami Dayananda Sarasvati in 1785"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "How many fundamental duties were enumerated in the 42nd Amendment of the Constitution?", o: ["10", "8", "12", "18"], a: 0, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Which natural form of vitamin B helps to prevent some of the major birth defects of the baby's brain (anencephaly) and spina bifida?", o: ["Pyridoxine", "Cobalamin", "Pantothenic acid", "Folate"], a: 3, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Which is the largest brackish water lagoon in Asia that was designated as a ‘Ramsar Site’ in 1981?", o: ["Loktak lake", "Chilika lake", "Tampara lake", "Harike lake"], a: 1, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Which of the following Trophies/Cups is related to cricket?", o: ["Thomas Cup", "Santosh Trophy", "Durand Cup", "Duleep Trophy"], a: 3, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "In which of the following states was the first edition of the Khelo India University Games held in 2020?", o: ["Odisha", "Assam", "Haryana", "Karnataka"], a: 0, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Who became the first Indian woman to win an Olympic medal?", o: ["Sakshi Malik", "Mary Kom", "Saina Nehwal", "Karnam Malleswari"], a: 3, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Vacuoles in plant cells can occupy up to what percentage of the cell's volume?", o: ["20", "60", "90", "40"], a: 2, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which of the following replaced the Planning Commission in 2014?", o: ["NABARD", "NITI Aayog", "SEBI", "Stand Up India Scheme"], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "The following are the features of which initiative of the Government of India? a. It is devised to transform India into a global design and manufacturing hub. b. It has an Investor Facilitation Cell to assist investors in seeking regulatory approvals, hand-holding services through the pre-investment phase, execution and after-care support. c. It aspires to facilitate investment, foster innovation, enhance skill development and build best-in-class manufacturing infrastructure.", o: ["Start-up India", "Stand up India", "Skill India", "Make in India"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "उस मौर्य राजा का नाम बताइए जिसने अफगानिस्तान और बलूचिस्तान के रूप में उत्तर पश्चिम तक नियंत्रण बढ़ाया।", o: ["सम्प्रति", "चंद्रगुप्त मौर्य", "दशरथ", "बिन्दुदुसार"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Which river basin has a catchment area of 5,179 km2, which originates from the Belgaum district of Karnataka and falls in Karwar Bay?", o: ["Brahmani", "Kalinadi", "Bharathapuzha", "Palar"], a: 1, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "How many layers of structures consist of the cell envelope?", o: ["One", "Four", "Three", "Two"], a: 2, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "विशेष रूप से 1988 में ऑपरेशन कैक्टस के बाद भारत ने किस देश को व्यापक सुरक्षा सहयोग की पेशकश की थी?", o: ["भूटान", "मालदीव", "नेपाल", "श्रीलंका"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT listed in the Directive Principles of State Policy?", o: ["Equal pay for equal work", "Promote the welfare of the people", "Uniform civil code for citizens", "Rights for transgenders in certain cases"], a: 3, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Pandit Ram Dayal Sharma was awarded the Padma Shri in 2022 for Nautangi, Swang, Bhagat, _________ and Rasiya forms.", o: ["Khoria", "Phag", "Rasleela", "Matki"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "In which state is coffee a major plantation crop?", o: ["Haryana", "Karnataka", "Assam", "Madhya Pradesh"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Which of the following elements has the highest atomic number?", o: ["Copper", "Gold", "Silver", "Iron"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "निम्नलिखित विजयनगर शासकों में से किसने विजयनगर के पास नागलापुरम नामक एक उपनगरीय बस्ती की स्थापना की?", o: ["राम राय", "कृष्ण देव राय", "सदाशिव राय", "अच्युत देव राय"], a: 1, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन-सा राज्य का नीति निर्देशक सिद्धांांत है?", o: ["राष्ट्रीीय संघर्ष के आदर्शों को संजोए रखना और उनका पालन करना", "व्यक्तिगत और सामूहिक गतिविधि के सभी क्षेत्रोंों में उत्कृृष्टता की दिशा में प्रयास करना", "संविधान और उसके आदर्शों का पालन करना", "लोक कल्याण की अभिवृद्धि के लिए सामाजिक व्यवस्था बनाए रखना"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following statements is correct? a) India is the only country in the world that has both tigers and lions. b) The natural habitat of the Indian lion is the Gir forest in Gujarat. Tigers are found in the forests of Madhya Pradesh, the Sundarbans of West Bengal and the Himalayan region.", o: ["Only a is correct.", "Only b is correct.", "Both a and b are incorrect.", "Both a and b are correct."], a: 3, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "‘The Test of My Life: From Cricket to Cancer and Back’, is the autobiography of which famous Indian cricketer?", o: ["Robin Utthappa", "Akash Chopra", "Suresh Raina", "Yuvraj Singh"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "According to the 2011 census, which state has the highest sex ratio?", o: ["Kerala", "Uttar Pradesh", "Maharashtra", "West Bengal"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Who wrote the famous autobiography titled ‘Becoming’?", o: ["Johnny Marr", "Steffi Graf", "Andre Agassi", "Michelle Obama"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Padma Shri awardee Madhuri Barthwal from _________ is a legendary folk singer. She was the first woman music composer for All India Radio.", o: ["Punjab", "Uttar Pradesh", "Uttarakhand", "Haryana"], a: 2, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "बिष्णुपुर मंदिर समूह भारत के किस राज्य में स्थित है?", o: ["पश्चिम बंगाल", "मध्य प्रदेश", "असम", "बिहार"], a: 0, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "What is the purpose of the ‘EShakti’ programme?", o: ["Digitisation of Self-Help Group details for banks", "Giving electricity to women farmers", "Providing credit cards for women", "Providing loans to buy e-rickshaws"], a: 0, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Shovana Narayan is associated with which of these dance forms?", o: ["Kathakali", "Kathak", "Bharatnatyam", "Mohiniyattam"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "In which of the following states is the Thousand Pillar temple located, in which thousand pillars are built?", o: ["Tamil Nadu", "Maharashtra", "Kerala", "Telangana"], a: 3, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Windfall gains are NOT included while calculating national income as _______________.", o: ["there is value addition", "it has already been included", "there is no income", "there is no productive activity connected with them"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Which body was responsible for formulating, implementing and regulating the five year plans before the year 2015?", o: ["Reserve Bank of India", "Ministry of Rural Development", "Ministry of Finance", "Planning Commission"], a: 3, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "In ____, as an immediate measure to resolve the balance of payments crisis, the Indian rupee was devalued against foreign currencies.", o: ["1971", "1981", "1991", "1961"], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "________ scheme was announced based on the five pillars to overcome difficulties caused due to COVID-19 in India.", o: ["Atmanirbhar Bharat Abhiyan", "Swachh Bharat Abhiyan", "PM-JAY", "Ayushman Bharat"], a: 0, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "The ‘Sinhalese’ ethnic group is found in which of the following countries?", o: ["Nepal", "Myanmar", "Indonesia", "Sri Lanka"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Gandhiji participated in the ________ as a result of Gandhi-Irwin Pact.", o: ["Second Round Table Conference", "Quit India Movement", "First Round Table Conference", "Khilafat movement"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Who composed the play ‘Mrichchhakatika’?", o: ["Bhans", "Atul", "Kalidasa", "Sudraka"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "The Chief Justice of India will take prior permission from the _____________, while appointing Adhoc Judges.", o: ["Prime Minister of India", "Collegium of the Supreme Court", "Parliament", "President of India"], a: 3, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding /deleting /multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed.) (63, 9, 36) (105, 15, 60)", o: ["(133, 17, 74)", "(129, 19, 74)", "(129, 17, 76)", "(133, 19, 76)"], a: 3, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["14", "12", "11", "13"], a: 3, e: "", qimg: "17nov2023-s3-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 8 * 14 * 3 * 24 * 7 = 168", o: ["×, ×, −, ×", "+, ×, −, ×", "+, ×, −, +", "×, −, ×, +"], a: 0, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern so that the final image is symmetrical.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "17nov2023-s3-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "17nov2023-s3-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "17nov2023-s3-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Three different positions of the same dice are shown. Find the number on the face opposite the face showing ‘3’.", o: ["2", "5", "4", "1"], a: 1, e: "", qimg: "17nov2023-s3-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "17nov2023-s3-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Three different positions of the same dice are shown. Find the number on the face opposite the face showing ‘3’.", o: ["6", "1", "4", "5"], a: 3, e: "", qimg: "17nov2023-s3-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "If ‘A’ denotes ‘+’, ‘B’ denotes ‘×’, ‘C’ denotes ‘−’ and ‘D’ denotes ‘÷’, then what will come in place of ‘?’ in the following equation? 80 C 4 B 5 A 20 = ?", o: ["20", "80", "40", "120"], a: 1, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "17nov2023-s3-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Which of the following letter clusters will replace the question mark (?) in the given series to make it logically complete? TVU, QSS, NPQ, KMO, ?", o: ["HKM", "HKL", "IKM", "HJM"], a: 3, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "17nov2023-s3-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at 'AB' as shown.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "17nov2023-s3-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern so that the final image is symmetrical.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "17nov2023-s3-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 23 : 92 :: 44 : ? :: 32 : 128", o: ["204", "160", "172", "176"], a: 3, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘HAND’ is written as ‘16’ and ‘ENTRY’ is written as ‘20’. How will ‘AIRPORT’ be written in that language?", o: ["24", "26", "28", "22"], a: 2, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster. GBEJ : DGBO :: TJDG : QOAL :: BAHQ : ?", o: ["PLWM", "YFEV", "YFRM", "OJEH"], a: 1, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the number from the given options that can replace the question mark (?) in the following series. 3, 6, 12, 24, ?, 96", o: ["48", "36", "72", "84"], a: 0, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "17nov2023-s3-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "A square transparent sheet with a pattern is shown in the given figure. How will the pattern appear when the transparent sheet is folded at the dotted line.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "17nov2023-s3-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "17nov2023-s3-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, even if it appears to be at variance with commonly known facts, decide which of the given conclusions logically follow(s) from the statements. Statements: Some balloons are cars. Some cars are rockets. Conclusions: I. Some rockets are balloons. II. All rockets are balloons.", o: ["Neither conclusion I nor II follows", "Only conclusion I follows", "Only conclusion II follows", "Both conclusions I and II follow"], a: 0, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "17nov2023-s3-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "6 persons are sitting around a circular table facing the centre, with each person facing another person. Anshu is between Rohin and Sonal. Rohin is opposite to Leena. Fizza is not the immediate neighbour of Rohin. Who is sitting opposite to Prabhleen?", o: ["Sonal", "Leena", "Anshu", "Fizza"], a: 0, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper is offering 10% discount on a shirt marked at ₹4,000 and still earns a profit of 20%. What is the cost price (in ₹)?", o: ["3,200", "3,333", "3,600", "3,000"], a: 3, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1760", "1792", "1780", "1731"], a: 0, e: "", qimg: "17nov2023-s3-q-77.png" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "The average weight of the first 14 persons among 15 persons is 80 kg. The weight of the 15th person is 42 kg more than the average weight of all 15 persons. Find the weight (in Kg) of the 15th person.", o: ["127", "121", "125", "123"], a: 2, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the area (in square cm) of a right angled triangle whose altitude is 7 cm less than its base and its hypotenuse is 17 cm.", o: ["48", "84", "72", "60"], a: 3, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "How much should you invest today at 10% compound interest annually to accumulate ₹1,46,410 in 4 years?", o: ["₹1,00,000", "₹1,10,000", "₹1,11,100", "₹1,00,500"], a: 0, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "Deepa deposited ₹10,000 in a bank on simple interest. After 4 years, she received an amount of ₹12,400. Find the rate of interest.", o: ["6% p.a.", "7% p.a.", "5.5% p.a.", "6.5% p.a."], a: 0, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "The largest 4-digit prime number is:", o: ["9991", "9967", "9983", "9973"], a: 3, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A man takes 40 minutes to cover a certain distance at a speed of 9 km/h. If he walks with a speed of 12 km/h, he covers the same distance in:", o: ["28 minutes", "32 minutes", "25 minutes", "30 minutes"], a: 3, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Ram and Naresh can complete a work together in 20 days and Naresh and Shyam together in 15 days. All three together can complete the work in 12 days. In how many days can Ram and Shyam together complete the work?", o: ["26", "28", "20", "25"], a: 2, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "17nov2023-s3-q-85.png" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the smallest number which leaves remainder 3 when divided by any of the numbers 5, 8 and 9, but leaves no remainder when it is divided by 11?", o: ["363", "563", "463", "663"], a: 0, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Amit received his monthly salary. The ratio of his expenditure to savings is 3 : 2. What percentage of his salary did he spend and what percentage was saved by him, respectively?", o: ["60% and 40%", "65% and 35%", "70% and 30%", "55% and 45%"], a: 0, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the number of ways in which 960 can be written as the product of two numbers that are co-prime to each other.", o: ["6", "2", "4", "8"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "A person has some amount initially. He gives 30% of the amount to his wife. Then from the remaining amount, he gives 20%, 20% and 15%, respectively, to both his sons and one daughter. Now from the amount left, he pays 1/3 of the amount as house rent and the remaining amount of ₹33,600 he deposits in the bank. Find his initial amount.", o: ["₹1,00,000", "₹1,40,000", "₹1,60,000", "₹1,20,000"], a: 2, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "The selling price of 61 items is equal to the cost price of 53 items. What is the profit or loss percentage (rounded off to two decimal places)?", o: ["8.25% loss", "8.25% profit", "13.11% loss", "13.11% profit"], a: 2, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "When replying to an email, what is the key difference between ‘Reply’ and ‘Reply all’?", o: ["‘Reply’ forwards email to specific contacts, while ‘Reply all’ forwards the original email to all contacts in the address book.", "‘Reply’ allows you to edit the original email’s content before sending the response, while ‘Reply all’ automatically includes the entire original email’s content in the response.", "‘Reply’ sends the response only to the original sender, while ‘Reply all’ sends the response to all recipients of the original email.", "‘Reply’ attaches any files from the original email, while ‘Reply all’ includes any attachments along with the entire original email’s content in response."], a: 2, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "In MS word 365 To change the formatting of the text to match the formatting of other text in a document, which of the following tools can be used?", o: ["Format painter", "Paragraph alignment", "SmartArt", "Change styles"], a: 0, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365 which of the following keyboard shortcuts is used to save a workbook in MS-Excel?", o: ["Ctrl + S", "Ctrl + Alt + S", "Shift + S", "Ctrl + Shift + S"], a: 0, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "In Microsoft Word 2019, which option is common in both the 'Indents & Spacing' and 'Line & Page Breaks' tabs of the 'Paragraph' dialog box?", o: ["Preview", "General", "Textbox options", "Indentation"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, when you right-click on a cell and select 'Filter,' which of the following options is NOT visible?", o: ["Filter by selected cell colour", "Filter by selected cell font", "Filter by selected cell height", "Filter by selected cell values"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "In MS Excel 2007, which option is used for opening a new or existing spreadsheet?", o: ["Home", "Insert", "Format", "Office button"], a: 3, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following is the correct option to draw a line through the middle of text in MS Word 365?", o: ["Line", "Strikethrough", "Dash", "Underline"], a: 1, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which layer of the internet architecture model is responsible for routing packets between networks?", o: ["Transport layer", "Data link layer", "Network layer", "Application layer"], a: 2, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following best describes the difference between Save and Save As?", o: ["‘Save’ is used to save file in a local computer, while ‘Save As’ is used to save it on cloud.", "‘Save’ is used to save file as read only file, while ‘Save As’ is used to save it as editable file.", "‘Save’ is used to save the document for the first time, while ‘Save As’ is used to save the document with a new name or different file format.", "‘Save’ is used to save file in compressed manner, while ‘Save As’ is used to save it as it is."], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following options will allow you to set text within a paragraph at different margins in MS Word 365?", o: ["Page breaks", "Border", "Line spacing", "Indenting"], a: 3, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 17 Nov 2023 Shift-3";
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
