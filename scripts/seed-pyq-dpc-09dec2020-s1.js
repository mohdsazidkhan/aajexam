/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 09 Dec 2020 Shift-1
 * 100 Q x 1 mark, 90 min, 0.25 negative. Reuses Exam SSC-DPC + pattern
 * 'Computer-Based Test (CBT)'. Figure questions upload a local image as questionImage.
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc09');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-09dec2020-s1';

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

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 09 Dec 2020 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन सी पुस्तक महान विद्वान भवभूति द्वारा नहीं लिखी गई है?", o: ["उत्तररामचरित", "मालतीमाधव", "रामचरितम्", "महावीरचरित"], a: 2, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "The Sanchi Stupa was discovered by _______ in 1818.", o: ["James Prinsep", "John Marshall", "James Burgess", "Sir Henry Taylor"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से किसके द्वारा श्वसन तंत्र के रोगों का उपचार किया जाता है?", o: ["रुधिर रोग विशेषज्ञ (हीमैटोलॉजिस्ट)", "फुप्फुसीय रोग विशेषज्ञ (पल्मोनोलॉजिस्ट)", "त्वचा रोग विशेषज्ञ (डर्मेटोलॉजिस्ट)", "निश्चेतनाविशेषज्ञ (एनेस्थीसियोलॉजिस्ट)"], a: 1, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "The Constituent Assembly of India was formed in _______.", o: ["1947", "1948", "1946", "1945"], a: 2, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "As on August 2020, the Government of India does NOT announce the Minimum Support Price for which of the following crops?", o: ["Groundnut", "Paddy", "Flax seeds", "Ragi"], a: 2, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "______ is related to football.", o: ["Ranji Trophy", "Santosh Trophy", "Duleep Trophy", "Irani Cup"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "In the context of Interim Government (1946) of India, who among the following was holding the portfolio of 'Finance'?", o: ["Jogendra Nath Mandal", "Liaquat Ali Khan", "John Mathai", "Jagjivan Ram"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "S. Jaishankar is the author of which of the following books?", o: ["Kashmir’s untold story: Declassification", "Making of New India", "The India Way: Strategies for an Uncertain World", "Sapiens - A Brief History of Humankind"], a: 2, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "The Index of Industrial Production is computed and published by the Central Statistical Organisation on a ______ basis.", o: ["monthly", "half-yearly", "quarterly", "yearly"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which of the following industrial cities is in Rajasthan?", o: ["Bhagalpur", "Bhabua", "Bellary", "Beawar"], a: 3, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "______ Schedule of the Constitution of India deals with the names of the states and their territorial jurisdiction.", o: ["First", "Second", "Third", "Fourth"], a: 0, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Which among the following is NOT a tennis grand slam tournament?", o: ["US Open", "South African Open", "French Open", "Wimbledon"], a: 1, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "According to which article of the Constitution of India, shall the state NOT deny to any person, equality before the law or equal protection of the laws?", o: ["Article 44", "Article 32", "Article 16", "Article 14"], a: 3, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Who among the following was the leader of 'Paika Rebellion' of 1817?", o: ["Bakshi Jagabandhu Bidyadhara", "Veer Surendra Sai", "Baba Ram Singh", "Tirath Singh"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Taj Trapezium Zone (TTZ) is a defined area of ______ km2 around the Taj Mahal to protect the monument from pollution.", o: ["10,400", "12,700", "10,200", "12,000"], a: 0, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "The Economic Survey of 2019-20 revolves around the theme of enabling markets, promoting 'pro-business' policies and strengthening ______ in the economy.", o: ["reputation", "capital", "zeal", "trust"], a: 3, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "______ is the concentration of a toxin at successively higher levels in a food chain.", o: ["Biodillution", "Biosynthesis", "Biomagnification", "Biosolution"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Who among the following is a Rajiv Gandhi Khel Ratna Awardee for the year 2020?", o: ["Virat Kohli", "Bajrang Punia", "Manika Batra", "Deepa Malik"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Who among the following is best known for his market regulation policy?", o: ["Nasiruddin Mahmud", "Razia Sultan", "Iltutmish", "Alauddin Khalji"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "The Ganapati festival was introduced by ________ in 1893.", o: ["Bal Gangadhar Tilak", "Chandrasekhar Azad", "Lala Lajpat Rai", "Bipin Chandra Pal"], a: 0, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Which of the following places is also known as 'Cape Comorin'?", o: ["Konkan Coast", "Khajuraho", "Gulf of Khambat", "Kanyakumari"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which among the following is NOT a characteristic of the image of an object formed by a plane mirror?", o: ["Erect", "Laterally inverted", "Real", "Virtual"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Which of the following pairs is INCORRECT?", o: ["Junagarh Fort - Karnataka", "Mehrangarh Fort - Rajasthan", "Raigad Fort - Maharashtra", "Asirgarh Fort - Madhya Pradesh"], a: 0, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "______ is a festival for the worship of food grains in Western Odisha.", o: ["Sonam Lasor", "Pongal", "Onam", "Nuakhai"], a: 3, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "नागालैंड के आओ लोगों द्वारा मनाया जाने वाला निम्नलिखित में से कौन सा पर्व, सामुदायिक घनिष्ठता दर्शाता है?", o: ["होजागिरी", "मोआत्सु", "गंटा मृदंगम", "सांगराई"], a: 1, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Which of the following caves contains an inscription of King Kharavela?", o: ["Rosaigumpha", "Hathigumpha", "Ranigumpha", "Sarpagumpha"], a: 1, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which of the following hill stations is located in the Dhauladhar Range?", o: ["Dalhousie", "Kalimpong", "Gulmarg", "Nainital"], a: 0, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "With reference to the 'Discus Throw' event, what is the weight of a metal disc for women?", o: ["2.5 kg", "1 kg", "3 kg", "2 kg"], a: 1, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "The name of Begum Akhtar is mainly associated with which of the following?", o: ["Dhrupad", "Thumri", "Hori", "Tappa"], a: 1, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Bhadravati, situated in Karnataka, is primarily famous for its ______.", o: ["oil field", "iron and steel plant", "cotton textile mill", "nuclear power station"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Who among the following is the first woman to be appointed as the Director General of Bureau of Civil Aviation Security?", o: ["Usha Padhee", "Durga Shakti Nagpal", "Aruna Sundararajan", "Archana Ramasundaram"], a: 0, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन सा शब्द बड़े पत्थरों से निर्मित या उनसे युक्त स्मारकों से संबंधित है?", o: ["ताम्रपाषाण काल", "महापाषाण काल", "मध्यपाषाण काल", "पुरापाषाण काल"], a: 1, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Which of the following rivers originate from the Vindhya Range?", o: ["Betwa", "Kaveri", "Chenab", "Gomati"], a: 0, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following was a major event of the year 1919?", o: ["Passing of the Rowlatt Act", "Formation of Swaraj Party", "Signing of Gandhi-Irwin Pact", "Launch of Non-Cooperation Movement"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "The India-Sri Lanka Commercial Free Trade Agreement was signed in ______.", o: ["1998", "2005", "2015", "2000"], a: 0, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "As of August 2020, which of the following is a regional political party?", o: ["All India Trinamool Congress", "Communist Party of India (M)", "Communist Party of India", "Aam Aadmi Party"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "With reference to the investment schemes of India, what does the second 'P' stand for in 'PPF'?", o: ["Prudent", "Programme", "Provident", "Price"], a: 2, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which of the following was set up in 2005 through a notification on recommendations of the Rangarajan Commission?", o: ["Finance Commission", "Food Corporation of India", "NITI Aayog", "National Statistical Commission"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Who among the following built the city of Tughlaqabad?", o: ["Tughluq Khan", "Muhammad bin Tughlaq", "Firuz Shah Tughlaq", "Ghiyasuddin Tughlaq"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Hindustani Socialist Republican Association was established in 1928, in ________.", o: ["Delhi", "Bengal", "Madras", "Punjab"], a: 0, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Which among the following is a semiconductor?", o: ["Mercury", "Germanium", "Aluminium", "Nickel"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "In ______, the first Republic India banknotes were issued in the denominations of ₹2, ₹5, ₹10 and ₹100.", o: ["1950", "1951", "1949", "1952"], a: 0, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "The famous Kesavananda Bharati (1973) case was associated with which of the following issues?", o: ["Appointment of the judges of the Supreme Court", "Creation of Goa as a State", "Amenability of the Preamble", "Abolition of Directive Principles of State Policy"], a: 2, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "______ of a country is a systematic statement of all economic transactions of a country with the rest of the world during a specific period typically a year.", o: ["Balance of Payment", "Reverse Repo Rate", "Gross Primary Deficit", "Gross Fiscal Deficit"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से किसे 2019 का डैनी केये मानवतावादी पुरस्कार प्रदान किया गया?", o: ["अर्जुन रामपाल", "प्रियंका चोपड़ा", "माधुरी दीक्षित", "अमिताभ बच्चन"], a: 1, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which of the following passes joins the Jammu Division with the Kashmir Valley?", o: ["Bomdila", "Jelep", "Diphu", "Banihal"], a: 3, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "The 'Nine Degree Channel' is associated with which of the following?", o: ["Indo-China Border", "Coastal Odisha", "Lakshadweep Island", "Andaman and Nicobar Islands"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Which gas is used in electrically controlled advertisement signboards so as to enable readability of its contents during the night?", o: ["Neon", "Helium", "Krypton", "Nitrogen"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Prime Minister Narendra Modi took part in the 2019 BRICS Summit held at:", o: ["Bishkek", "Brasilia", "Bangkok", "Osaka"], a: 1, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Rashtriya Ekta Diwas in India is dedicated to _______.", o: ["Indira Gandhi", "Sardar Vallabhbhai Patel", "Zakir Hussain", "Atal Bihari Vajpayee"], a: 1, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "09dec2020-s1-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the option that can replace the question mark (?) in the following series.\n6, 11, 33, 65, 141, ?", o: ["278", "281", "321", "192"], a: 1, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "09dec2020-s1-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "09dec2020-s1-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "09dec2020-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "09dec2020-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "09dec2020-s1-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Three of the following four words are alike in a certain way and one is different. Select the odd one.", o: ["Carton", "Kit", "Sack", "Drawer"], a: 3, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the option that can replace the question mark (?) in the following series.\n2, 56, 91, 136, 176, 212, ?", o: ["257", "252", "260", "275"], a: 0, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "A shopkeeper bought 10 pieces of a type of refrigerator, each at ₹27,000. He sold 5 pieces at 20%, 3 at 10%, and rest at 5% more than the price he bought them at. What was the net profit (in ₹) for the shopkeeper on the whole transaction?", o: ["27,000", "41,960", "37,800", "35,000"], a: 2, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "09dec2020-s1-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "09dec2020-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "09dec2020-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "09dec2020-s1-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct?\n3 − 36 × 9 ÷ 3 + 12 = 3", o: ["× and −", "+ and ÷", "÷ and ×", "÷ and −"], a: 2, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n6, 12, 21\n19, 49, 85\n3, 4, ?", o: ["9", "7", "4", "6"], a: 2, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term.\nLawless : Delinquent :: Juvenile : ?", o: ["Resourceful", "Mature", "Intelligent", "Childish"], a: 3, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "09dec2020-s1-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "09dec2020-s1-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "09dec2020-s1-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "In a certain code language, 'CHART' is written as 'TRACH' and 'CLOSE' is written as 'ESOCL'. How will 'WORLD' be written in the same code language?", o: ["DLROW", "DLRWD", "DLRWO", "OLRDW"], a: 2, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the option in which the two numbers share the same relationship as that shared by the given number-pair.\n14 : 45", o: ["9 : 63", "26 : 80", "15 : 44", "17 : 54"], a: 3, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "09dec2020-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "09dec2020-s1-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "09dec2020-s1-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "एक विभाजन क्रिया में, भाजक भागफल का 32 गुना और शेषफल का 12 गुना है। यदि शेषफल 56 है, तो भाज्य क्या होगा?", o: ["14,168", "13,496", "13,446", "14,112"], a: 0, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "The value of 1 1/3 ÷ 3 3/5 of 5/6 − 5/6 × 2/3 + (0.9̄1̄ ÷ 0.8̄2̄) × 2/11 is:", o: ["4/45", "7/30", "1/5", "1/15"], a: 0, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "स्थिर जल में एक नाव की चाल 30 km/h है। यह जल-धारा के बहाव की विपरीत दिशा में 60 km जाती है और जल-धारा के बहाव की दिशा में आरंभिक बिंदु पर वापस लौट आती है। इस पूरी यात्रा में उसे 4 घंटे 10 मिनट का समय लगता है। जल-धारा के बहाव की दिशा में 136.8 km की दूरी तय करने में उसे कितना समय (घंटे में) लगेगा?", o: ["2.4", "3.8", "4.2", "3.2"], a: 1, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "The average weight of students in a class is 49 kg. Five new students are admitted in the class whose weights are 45 kg, 46.8 kg, 47.4 kg, 54.2 kg and 63.6 kg. Now, the average weight of all the students in the class is 50 kg. The number of students in the class in the beginning was:", o: ["10", "12", "8", "7"], a: 3, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "An article marked at ₹560 is sold at 20% discount. If there is a profit of 40%, then what is the cost price (in ₹) of the article?", o: ["320", "400", "350", "280"], a: 0, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "Apoorv bought 26 kg of apples for ₹2,340. He sold them at a profit equal to the selling price of 6 kg of apples. The selling price of apples per kg, was:", o: ["₹110", "₹105", "₹117", "₹112"], a: 2, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "If the radius of a right circular cone is decreased by 20% and its height is increased by 60%, then its volume:", o: ["increases by 2.4%", "increases by 4.2%", "decreases by 2.5%", "decreases by 4%"], a: 0, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A certain sum amounts to ₹6,655 at 10% p.a. in 3 years. The same sum will amount to ₹x at double the earlier rate in 2 1/2 years and if the interest is compounded annually in both cases. What is the value of x ?", o: ["7,200", "7,920", "7,500", "8,640"], a: 1, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "A certain sum amounts to ₹12,672 after 4 years and to ₹15,744 after 8 years at the same rate percent p.a. at simple interest. The simple interest on the same sum at 10% p.a for 3 1/3 years will be:", o: ["₹3,350", "₹3,000", "₹3,240", "₹3,200"], a: 3, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "The income of A is 125% more than the income of B, and the income of C is 60% less than the total income of A and B. By what percentage is the income of C less than that of A (correct to one decimal place)?", o: ["46.9", "73.1", "40.8", "42.2"], a: 3, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "Remu gives 10% of an amount to Sushma, 20% of the remaining to Rekha, 50% of the remaining to Surbhi, and 40% of the remaining to Avni. Now, if a sum of ₹2,700 is left with her, then the amount paid to Avni is:", o: ["₹1,500", "₹2,000", "₹1,200", "₹1,800"], a: 3, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "A and B together can do a certain work in 20 days, B and C together can do it in 30 days, and C and A together can do it in 24 days. The time in which B alone will complete 2/3 part of the same work is:", o: ["20 days", "16 days", "24 days", "32 days"], a: 3, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of ₹23,808 is divided between A, B, C and D such that the ratio of the shares of A and B is 8 : 9, that of B and C is 3 : 5, and that of C and D is 1 : 2. What is the share of B?", o: ["₹3,456", "₹3,264", "₹3,072", "₹3,546"], a: 0, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "The diameter of a circular garden is 140 m. Its area is equal to a rectangular field whose sides are in the ratio 11 : 7. The perimeter (in m) of the rectangular field is (take π = 22/7):", o: ["360√2", "180√2", "120√2", "270√2"], a: 0, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Let x be the greatest number of 4 digits which, when divided by 16, 28, 40 and 48, leaves remainder 11 in each case. What is the sum of the digits of x ?", o: ["17", "13", "14", "18"], a: 2, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "What is the maximum height of a row in MS Excel 2010?", o: ["255 points", "100 points", "409 points", "128 points"], a: 2, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Pick the odd one out.", o: ["Internet Explorer", "Safari", "Mozilla", "File Explorer"], a: 3, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In MS Excel 2010, a cell may display '______' if that cell contains a number or a date and the width of its column cannot display all the characters that its format requires.", o: ["#####", "**###", "*****", "$$$$$"], a: 0, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts is used to run Spelling and Grammar Check in MS Word 2010?", o: ["F2", "F7", "F1", "F9"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "What is the value of the following MS Excel formula? =SUMSQ(1, 2, 3, 4)", o: ["10", "34", "30", "24"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts is used for closing an MS Word 2010 document?", o: ["Ctrl + E", "Ctrl + W", "Ctrl + N", "Ctrl + O"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Match the following domain name extensions with their respective definitions. 1) .gov A) Government agencies 2) .org B) Network organisations 3) .edu C) Non-profit organisations 4) .net D) Educational organisations", o: ["1-A, 2-D, 3-C, 4-B", "1-D, 2-C, 3-A, 4-B", "1-C, 2-A, 3-D, 4-B", "1-A, 2-C, 3-D, 4-B"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "The option of Spell Check can be selected from the ______ tab in MS Excel 2007.", o: ["Review", "Help", "Formula", "File"], a: 0, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "In MS Word, Ctrl + R is used to align the text to the ______ of the screen.", o: ["left", "right", "top", "bottom"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "To add a watermark in MS Word 2010 document, one has to click on the '______' tab and then select the 'Watermark' option provided in the '______' group.", o: ["Page Layout, Page Background", "View, Page Background", "Layout, Page Background", "Insert, Page Background"], a: 0, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 09 Dec 2020 Shift-1";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 09 Dec 2020 Shift-1", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
