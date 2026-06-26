/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 09 Dec 2020 Shift-2
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
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-09dec2020-s2';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 09 Dec 2020 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "आर्थिक मामलों की मंत्रिमंडलीय समिति (CCEA) ने विपणन सत्र 2020 - 2021 हेतु A ग्रेड वाले धान के लिए _____ प्रति कुंतल न्यूनतम समर्थन मूल्य (MSP) निर्धारित किया है।", o: ["₹1,868", "₹1,888", "₹2,150", "₹2,640"], a: 1, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "The first session of the Indian National Congress was held at ______ in 1885.", o: ["Bombay (Now Mumbai)", "Allahabad (Now Prayagraj)", "Calcutta (Now Kolkata)", "Madras (Now Chennai)"], a: 0, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "The Gandhara School of Art was influenced by ______ art.", o: ["Korean and Mongolian", "Persian and Turkish", "Greek and Roman", "Chinese and Japanese"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Taxonomic studies consider a group of individual organisms with fundamental similarities as a/an ______.", o: ["order", "species", "family", "class"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "As on June 2020, in which of the following places of India are coins minted by the Government of India?", o: ["Alipore", "Cuttack", "Indore", "Gurugram"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "As of 2020, which of the following is a non-BJP ruled state?", o: ["Uttarakhand", "Andhra Pradesh", "Madhya Pradesh", "Karnataka"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "With reference to human physiology, which of the following lobes is mainly concerned with visual information?", o: ["Occipital", "Temporal", "Parietal", "Frontal"], a: 0, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Which of the following pairs is INCORRECTLY matched?", o: ["Mirza Mohammad Qasim : Shahjahan Nama", "Abul Fazl : Akbarnama", "Gulbadan Begum : Humayun Nama", "Abdul Hamid Lahori : Padshahnama"], a: 0, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which of the following pairs is INCORRECT?", o: ["Tamaasha – Uttarakhand", "Maach – Madhya Pradesh", "Mudiyettu – Kerala", "Bhavai – Gujarat"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "In the context of tennis, what is the nationality of Steffi Graf?", o: ["Canada", "Australia", "Germany", "USA"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "As of August 2020, how many classical dance forms exist in India?", o: ["12", "10", "6", "8"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "In which year did PV Sindhu for the first time break into the top 20 of Badminton World Federation Ranking for women?", o: ["2013", "2010", "2012", "2011"], a: 2, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Part XVII of the Constitution of India deals with the official language in Articles 343 to ______.", o: ["352", "349", "351", "356"], a: 2, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which of the following statements is correct with regard to Consumer Price Index?", o: ["It measures the average change in the sale price of goods and services either as they leave the place of production or as they enter the place of production.", "It is used to monitor changes in the cost of living over time.", "It is used to monitor the cost of the goods and services bought by producers and firms.", "It reflects the price of all the goods and services produced domestically."], a: 1, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Which of the following Land Revenue Systems was introduced by Thomas Munro in 1820?", o: ["Zamindari", "Mahalwari", "Ryotwari", "Zabti"], a: 2, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Which of the following is a clause on the Indian bank notes?", o: ["I promise to extend", "I promise to talk", "I am the money of India", "I promise to pay"], a: 3, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "In 1932, the British Prime Minister ______ announced the Communal Award which provided for separate electorates for the ‘Depressed Classes’, the Muslims, the Europeans, the Sikhs, the Anglo-Indians and the Indian-based Christians.", o: ["Bonar Law", "Ramsay MacDonald", "Stanley Baldwin", "Clement Attlee"], a: 1, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "In India, the Attorney General is appointed by the ______.", o: ["Prime Minister", "Finance Minister", "Chief Justice of India", "President"], a: 3, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Who among the following is the winner of the Nobel Prize in Literature 2019?", o: ["Peter Handke", "Kazuo Ishiguro", "Alice Munro", "Bob Dylan"], a: 0, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "The Cellular Jail, which is famous for its unique architecture, is located in ______.", o: ["Daman", "Port Blair", "Puducherry", "Kavaratti"], a: 1, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "The Nagarhole National Park is located in ______.", o: ["Arunachal Pradesh", "Karnataka", "Tamil Nadu", "Goa"], a: 1, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "With reference to the United Nations' Sustainable Development Goals, which of the following pairs is correct?", o: ["Life Below Water - Goal 15", "Climate Action - Goal 13", "Clean Water and Sanitation - Goal 5", "Affordable and Clean Energy - Goal 11"], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Which of the following was NOT commissioned by Emperor Shah Jahan?", o: ["Shahajahanabad, Delhi", "Red Fort, Delhi", "Jama Masjid, Delhi", "Humayun's Tomb, Delhi"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Who was the ‘Man of the Match’ at the 1983 Men’s World Cup Cricket Final?", o: ["K Srikanth", "Madan Lal", "Kapil Dev", "Mohinder Amarnath"], a: 3, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Netaji Subhas National Institute of Sports is located in ______.", o: ["Jhansi", "Patiala", "Imphal", "Guwahati"], a: 1, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "How many atoms are there in a methane molecule?", o: ["3", "5", "4", "2"], a: 1, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "अगस्त 2020 तक की स्थिति के अनुसार, राष्ट्रीय पेंशन योजना के लिए किए गए योगदान _____ तक अतिरिक्त कर कटौती के पात्र हैं।", o: ["₹62,000", "₹40,000", "₹65,000", "₹50,000"], a: 3, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "The terms Veld, Downs, Pampas are related with ______.", o: ["types of clouds", "grasslands", "commercial agriculture", "canyons"], a: 1, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which of the following pairs is INCORRECT?", o: ["Gulf - A large inlet from the ocean into the landmass", "Isthmus - A narrow piece of land connecting two larger areas", "Archipelago - A chain of islands", "Barchan - A strip of land sloping gently towards the sea"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Who among the following kings was given the title of 'Andhra Bhoja'?", o: ["Aliya Rama Raya", "Vira Narasimha Raya", "Krishnadeva Raya", "Rama Raya"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Who among the following is the author of the book 'You Can Win'?", o: ["Rohini Mundra", "Shiv Khera", "Sandeep Maheshwari", "Dipa Karmakar"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "In which year did the Government of India launch the Antyodaya Anna Yojana?", o: ["1995", "2000", "2005", "1998"], a: 1, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Which of the following ports is situated in the State of Gujarat?", o: ["Panambur", "Haldia", "Paradip", "Hazira"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Who among the following is the creator of the character 'Sherlock Holmes'?", o: ["Walt Disney", "Alice Munro", "Federico Pedrocchi", "Arthur Conan Doyle"], a: 3, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "The famous anthology of poems ‘Madhushala' is written by ______.", o: ["Kusumagraj", "Kannadasan", "Harivansh Rai Bachchan", "Mahasweta Devi"], a: 2, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "With reference to the Union Budget 2020 - 2021, which of the following is NOT a component of Aspirational India?", o: ["Agriculture, irrigation and rural development", "Good diplomatic relationship with neighbouring countries", "Wellness, water and sanitation", "Education and skills"], a: 1, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "In the context of the Banking Sector in India, which of the following statements is INCORRECT?", o: ["The Indian law legalises the use of Rupee as a medium of exchange.", "Livestock may also be a form of collateral.", "Credit always pushes the borrower into a situation from which recovery is very painful.", "The RBI issues currency on behalf of the Central Government."], a: 2, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Morphine can be extracted from:", o: ["tobacco", "alcohol", "cannabis", "opium"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "हवा में जलाए जाने पर मैग्नीशियम की पट्टी चमकदार _____ ज्वाला के साथ जलती है।", o: ["हरी", "सफ़ेद", "लाल", "नीली"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "स्वतंत्र भारत के प्रथम मंत्रिमंडल के संदर्भ में, निम्नलिखित में से कौन सा युग्म सुमेलित है?", o: ["राजकुमारी अमृत कौर - शिक्षा", "मौलाना अबुल कमाल आज़ाद - वित्त", "श्यामा प्रसाद मुखर्जी - उद्योग एवं आपूर्ति", "राजेंद्र प्रसाद - वाणिज्य"], a: 2, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "As of August 2020, who amongst the following is the Chief Minister of Nagaland?", o: ["Prem Singh Tamang", "Biplab Kumar Dev", "Zoramthanga", "Neiphiu Rio"], a: 3, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "The 'Mariana Trench' is in the ______.", o: ["North Atlantic Ocean", "South Atlantic Ocean", "Pacific Ocean", "Indian Ocean"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "River Banas is a tributary of the ______ river.", o: ["Indus", "Chambal", "Brahmaputra", "Damodar"], a: 1, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "औरंगज़ेब द्वारा अपने निम्नलिखित में से किन दो सर्वोच्च पदधारक सामंतों को 'मिर्ज़ा राजा' का खिताब दिया गया था?", o: ["रतन सिंह और उदय सिंह द्वितीय", "जय सिंह और जसवंत सिंह", "मान सिंह तोमर और राणा कुंभा", "गोविंद चौहान और राणा हम्मीर"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Which of the following is a Statutory Body?", o: ["CAG", "Finance Commission", "UPSC", "NHRC"], a: 3, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "In August 2020, ______ was appointed as the Governor of Meghalaya.", o: ["Vajubhai Vala", "Kalraj Mishra", "Satya Pal Malik", "Ramesh Vyas"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "In July 2020, who among the following launched the ‘Pravasi Rojgar App’ to help workers in finding jobs?", o: ["Prakash Jha", "Anurag Kashyap", "Sonu Sood", "Ranbir Kapoor"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "The term 'Tripitakas' in Buddhism mean three:", o: ["baskets", "houses", "roads", "trees"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Which of the following musicians belonged to the state of Assam?", o: ["Anuradha Paudwal", "Bhupen Hazarika", "Hariharan", "Manna Dey"], a: 1, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "The Shore Temple, which is a UNESCO Heritage Site, is located in the state of ______.", o: ["Tamil Nadu", "Karnataka", "Maharashtra", "Madhya Pradesh"], a: 0, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "09dec2020-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "09dec2020-s2-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "09dec2020-s2-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "09dec2020-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "09dec2020-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "09dec2020-s2-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "09dec2020-s2-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following set.\n(3, 7, 58)", o: ["(7, 5, 39)", "(3, 2, 13)", "(6, 4, 53)", "(8, 7, 112)"], a: 1, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "09dec2020-s2-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "09dec2020-s2-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n7, 16, 28, 40, ?, 72, 88, 106, 126", o: ["60", "56", "52", "54"], a: 3, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n11, 15, 23, ?, 71, 135, 263, 519", o: ["39", "43", "27", "57"], a: 0, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "09dec2020-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Three of the following four words are alike in a certain way and one is different. Select the odd one.", o: ["Disseminate", "Congregate", "Disperse", "Scatter"], a: 1, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "09dec2020-s2-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n4751 : 8998 :: 5236 : ?", o: ["9999", "8998", "8888", "9879"], a: 2, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "'Ammeter' is related to 'Current' in the same way as 'Anemometer' is related to '______'.", o: ["Wind Speed", "Voltage", "Light", "Blood Pressure"], a: 0, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "09dec2020-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "09dec2020-s2-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct?\n570 × 8 − 240 + 75 ÷ 15 = 79", o: ["÷ and −", "+ and −", "+ and ×", "× and ÷"], a: 0, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "09dec2020-s2-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "In a code language, MARKET is written as GVPIZN. How will RETAIL be written in that language?", o: ["ORZGUI", "ORZGVI", "ORBGVI", "ORBGUI"], a: 1, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "A retailer sells 2 products A and B to a customer. On product A he makes a profit of 20% on his cost price of ₹80, while on product B he incurs a loss of 20% on his cost price as he sold it at ₹80. Overall, what is the amount of profit or loss that he makes on these two products?", o: ["Loss of ₹16", "Loss of ₹4", "No profit or no loss", "Profit of ₹16"], a: 1, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "09dec2020-s2-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "09dec2020-s2-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A person loses 20%, when he sells a watch for ₹2,300. What is his profit percentage if he sells it for ₹3,231.50?", o: ["10.8", "15.2", "12.8", "12.4"], a: 3, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "The perimeter of a circular field is 1012 m. The area of this field is equal to a rectangular garden whose sides are in the ratio 14 : 11. The longer side of the garden is: (Take π = 22/7)", o: ["294 m", "322 m", "308 m", "336 m"], a: 1, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "An article is sold by giving a discount of 30% on its marked price. If there is a gain of 20%, and the cost price of the article is ₹840, then the marked price of the article is:", o: ["₹1,440", "₹1,240", "₹1,260", "₹1,460"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Train A travelling at 55 km/h takes 21 seconds to cross completely train B travelling at 53 km/h in the opposite direction. The length of train A is 2.5 times the length of train B. Train A passes a bridge in 72 seconds. What is the length (in m) of the bridge?", o: ["650", "600", "550", "575"], a: 0, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "सविता अपनी मासिक आय का 8% एक धर्मार्थ न्यास को दान करने का निर्णय लेती है। दान के दिन वह अपने निर्णय को बदलते हुए ₹2,880 की धन-राशि दान करती है जो दान के लिए पहले से निर्धारित धन-राशि से 20% कम है। उसकी मासिक आय (₹ में) कितनी है?", o: ["₹36,000", "₹48,000", "₹45,000", "₹40,000"], a: 2, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "Let x be the least number between 1400 and 1800, which when divided by 5, 6, 8, 9 and 12, the remainder in each case is 3. When x is divided by 11, the remainder is:", o: ["2", "1", "5", "3"], a: 0, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "The value of 7/8 ÷ 4 2/3 of 1 1/4 − 1 1/4 × 1 1/5 + (0.53̄ ÷ 0.58̄) × 2 3/4 is:", o: ["17/20", "27/8", "23/20", "7/5"], a: 2, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Pipes A and B can fill a tank in 10 hours and 13 1/3 hours, respectively. Pipe C is an emptying pipe. When all three pipes are opened together, the tank is filled in 8 hours. Pipe C alone can empty 60% part of the tank in:", o: ["12 hours", "15 hours", "9 hours", "10 hours"], a: 0, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of ₹8,000 amounts to ₹13,824 in 3 years at R% p.a., interest compounded annually. What will it amount to in 1 1/4 years at the same rate, if the interest is compounded half-yearly?", o: ["₹10,648", "₹10,148", "₹10,164", "₹10,872"], a: 2, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "एक विभाजन क्रिया में, भाजक भागफल से 8 गुना और शेषफल से 9 गुना है। यदि शेषफल 24 है, तो भाज्य क्या होगा?", o: ["5,858", "5,820", "5,856", "5,824"], a: 2, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "A certain sum amounts to ₹5,808 after 2 years and to ₹7,320 after 5 years at the same rate per cent per annum at simple interest. What will be the simple interest on a sum of ₹8,500 for 4 2/3 years at the same rate?", o: ["₹4,352", "₹4,165", "₹5,440", "₹4,760"], a: 1, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of ₹x is divided between A, B and C such that the ratio of the shares of A and B is 3 : 5, and that of B and C is 4 : 7. If the difference between the shares of A and C is ₹2,001, then the value of x is:", o: ["5,481", "5,742", "5,655", "5,829"], a: 3, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "The curved surface area of a right circular cylinder is 3432 cm² and the radius of its base is 26 cm. Its volume (in cm³) is: (Take π = 22/7)", o: ["29744", "22308", "59488", "44616"], a: 3, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "The average weight of a certain number of persons in a group is 78 kg. If 4 persons having average weight 80.75 kg leave the group, the average weight of the remaining persons becomes 77.725 kg. The number of persons, initially, is:", o: ["36", "44", "46", "34"], a: 1, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "The income of x is 80% more than that of y, and the income of z is 60% of the total income of x and y. The income of z is what percentage less than that of x (correct to one decimal place)?", o: ["6.3%", "7.1%", "7.3%", "6.7%"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts opens the FIND and REPLACE (or REPLACE) dialogue box in MS Word?", o: ["CTRL + R", "CTRL + H", "ALT + H", "ALT + R"], a: 1, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "When you enter a value in an MS Excel cell and press SHIFT + ENTER keys, what will happen?", o: ["The cursor (selection box) will move to the upper cell", "The cursor (selection box) will move to the lower cell", "The cursor (selection box) will move to the right cell", "The cursor (selection box) will move to the left cell"], a: 0, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following statements is/are FALSE? (i) In MS Word, a table can have one cell. (ii) In MS Word, the font size of a text cannot be less than 8.", o: ["Neither i nor ii", "Both i and ii", "Only i", "Only ii"], a: 3, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "All the Excel functions are stored in ______ under the Formulas tab.", o: ["AutoSum", "Styles", "Formula bar", "Function Library"], a: 3, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "The ______ provides high-speed internet access.", o: ["dial-up", "TCP", "ISP", "broadband"], a: 3, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "What will be the result of the following MS Excel formula? =SUM(8/4/2, 1-2/2)", o: ["3.5", "1", "4", "0.5"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "With respect to the internet, what is the full-form of FTP?", o: ["Fast Transmission Protocol", "First Telecommunication Protocol", "Fast Telecommunication Protocol", "File Transfer Protocol"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "What is the minimum number of columns that a table in MS Word can have?", o: ["8", "0", "1", "2"], a: 2, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following components of an MS Excel worksheet displays the contents of the selected cell?", o: ["Status bar", "Title bar", "Formula bar", "Name box"], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following stores the cut or copied texts in MS Word?", o: ["Table", "Footer", "Clipboard", "Header"], a: 2, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 09 Dec 2020 Shift-2";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 09 Dec 2020 Shift-2", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
