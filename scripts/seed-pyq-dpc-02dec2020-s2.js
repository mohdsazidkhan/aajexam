/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 02 Dec 2020 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc02_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-02dec2020-s2';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 02 Dec 2020 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "The battle of Dharmatpur, which took place between Aurangzeb and Maharaja Jaswant Singh on 15 April 1658, was fought on the banks of which river?", o: ["Krishna", "Yamuna", "Sutlej", "Narmada"], a: 3, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Which among the following is related to the human skeletal structure?", o: ["Spleen", "Urethra", "Femur", "Iris"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Which of the following is a water borne disease?", o: ["measles", "Dengue", "Yellow Fever", "E. coli"], a: 3, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "With reference to countries and their capitals, which of the following pairs is correct?", o: ["Cambodia-Tbilisi", "Myanmar - Naypyidaw", "Brunei-Beirut", "Azerbaijan-Yerevan"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "The Punjab Himalayas lie between the _______ rivers.", o: ["Black and Teesta", "Sutlej (Sutlej) and Kali", "Teesta and Dihang", "Indus and Sutlej (Sutlej)"], a: 3, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Mandvi Sagar Beach is situated in _______.", o: ["Kerala", "Maharashtra", "Odisha", "Gujarat"], a: 3, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Which of the following schemes is not related to Ministry of Finance?", o: ["Pradhan Mantri Garib Kalyan Yojana", "Pradhan Mantri Kaushal Vikas Yojana", "Kisan Vikas Patra", "Pradhan Mantri Suraksha Bima Yojana"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "According to the Representation of the People Act, 1951, in the event of a person being elected to both houses of Parliament, he has to notify within ______ days in which house he intends to function.", o: ["22", "10", "20", "15"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "In India, which of the following is not a type of budget?", o: ["Balanced", "surplus", "Losses", "Reserved"], a: 3, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "In the fourteenth century, which of the following travelers came to India?", o: ["Ibn Battuta", "Duarte Barbosa", "Francois Bernier", "Antonio Monserrate"], a: 0, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which of the following is a sect of Jainism?", o: ["Hinayana", "Lingayat", "Vajrayana", "Digambar"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "The festival of Pung Lhabsol is celebrated mainly throughout the ______.", o: ["Sikkim", "Assam", "Tripura", "Nagaland"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Which one of the following pairs is not correctly matched?", o: ["Shudraka: Mrithaktik", "Kalhan: Ramcharitam", "Joyful: Banabhatta", "Firdausi: Shahnama"], a: 1, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "The Chalukya king Vikramaditya is described in the Vikramankadeva Charit written by the Kashmiri poet _______.", o: ["Jayank", "orator", "Bilhan", "Kalhan"], a: 2, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "By which among the following is the color of a planet determined?", o: ["Its surface temperature", "Its average density", "Its total mass", "Its average distance from the Sun"], a: 0, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Demonetisation was a new initiative taken by the Government of India in ______.", o: ["October 2018", "November 2016", "January 2017", "December 2015"], a: 1, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "The Olympic symbol — popularly known as the Olympic rings throughout the world — is the visible ambassador of the Olympics to millions of people. Which of the following color of rings is not included in it?", o: ["White", "Black", "Green", "Red"], a: 0, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "The Anglo-Mysore War ended with which of the following battles?", o: ["Battle of Vandiwash", "Battle of Seringapatam", "Battle of Porto Novo", "Battle of Polilur"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Sakshi Malik won a bronze medal in which of the following sports at the 2016 Summer Olympics?", o: ["Wrestling", "Weightlifting", "Shooting", "Boxing"], a: 0, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "As of June 30, 2020, which of the following products in India has GST. (GST) is excluded?", o: ["Life saving drugs", "Air Conditioner (AC) and Refrigerators", "Alcohol for human consumption", "Dental brushing and soap"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Kakrapar Irrigation Project is situated on the river _______.", o: ["Krishna", "Godavari", "Bhagirathi", "Tapi"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "World Water Day is celebrated every year on _______.", o: ["20 August", "22 March", "4 April", "24 January"], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Ujjain is situated on the Malwa plateau on the east side of the river _______.", o: ["Indravati", "Subarnarekha", "Shipra (Kshipra)", "Teesta"], a: 2, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "In the context of players and their related games, which of the following pairs is not correctly matched?", o: ["Michael Phelps - Swimming", "Usain Bolt - Fast Racing", "Tiger Woods - Snooker", "Martina Hingis - Tennis"], a: 2, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Which state has been linked with Himachal Pradesh under 'Ek Bharat Shreshtha Bharat' program to promote national unity through mutual understanding as on 30 June 2020?", o: ["West Bengal", "Goa", "Gujarat", "Kerala"], a: 3, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "What is the required qualification to be appointed as Attorney General of India (Attorney- General)?", o: ["Member of Legislative Assembly", "President of the Council of States", "High Court Judge", "Supreme Court Judge"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "In August 2020, experts from India, Bangladesh, Nepal and Myanmar gathered to improve which of the following?", o: ["Elephant", "Crocodile", "Dolphins", "Tiger"], a: 2, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "With reference to the famous monuments of India, which one of the following pairs is incorrect?", o: ["Kanheri Caves - Mumbai", "Hazara Ram Temple-Hampi", "Kandariya Mahadev Temple - Khajuraho", "Hoshang Shah's Tomb - Delhi"], a: 3, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "According to Human Development Index 2019, India ranks ______.", o: ["127th", "126th", "129th", "128th"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Which of the following is a chromosomal disorder?", o: ["Down's Syndrome", "Haemophilia", "Sickle cell anaemia", "Cystic fibrosis"], a: 0, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "As of August 2020, which of the following states has a two-house system?", o: ["Arunachal Pradesh", "Kerala", "Gujarat", "Maharashtra"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "The Mughal emperor _______ took Bijapur and Golconda under him.", o: ["Akbar", "Shah Jahan", "Jahangir", "Aurangzeb"], a: 3, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "According to the budget 2020-21, how much of the following amount has been proposed for nutrition related programs for the financial year 2020-21?", o: ["₹ 28,600 Crore", "₹ 9,500 crores", "₹ 35,600 Crore", "₹ 53,700 crore"], a: 2, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "In India, the voting age has been reduced from 21 years to 18 years by the ______ Constitutional Amendment Act, 1988.", o: ["60th", "63rd", "61st", "62nd"], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "In kabaddi game, how many players are there in each team?", o: ["6", "8", "5", "7"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "PAN is a (an) ______ digit unique alphanumeric number issued by the Income Tax Department.", o: ["8", "12", "11", "10"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "The Government of India has constituted the Fifteenth Finance Commission with _______ as its operating period.", o: ["2015-2020", "2019-2023", "2020-2025", "2020-2022"], a: 2, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Who among the following is one of the first Bharat Ratna Award recipients?", o: ["Jawaharlal Nehru", "CV Raman", "Rajendra Prasad", "Mother Teresa"], a: 1, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "In which of the following places is the bench of Allahabad High Court established?", o: ["Gorakhpur", "Lucknow", "Agra", "Noida"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "As of August 2020, the Ministry of Culture has announced how many new divisions of the Archaeological Survey of India?", o: ["6", "8", "5", "7"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Poet Lallyd was associated with which of the following regions of India?", o: ["Lucknow", "Kashmir", "Jaunpur", "Orchha"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "The green plants in a terrestrial ecosystem capture about ______ of the energy of sunlight that falls on their leaves and convert it into food energy.", o: ["1%", "10%", "5%", "15%"], a: 0, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "The Coromandel plain is located in the _______ direction of India.", o: ["Southern", "Eastern", "Western", "Northern"], a: 0, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "As on August 2020, what is the number of Seat (s) allocated for Rajya Sabha from Goa?", o: ["1", "9", "4", "7"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "In the context of Chhau (Chhau) dance marked by UNESCO, which of the following is not a style of Chhau (Chhau) dance?", o: ["Purulia Chhau (Chhau)", "Mayurbhanj Chhau (Chhau)", "Kutch Chhau (Chhau)", "Seraikella Chhau (Chhau)"], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which of the following festivals is celebrated as a belief in the resurrection of Jesus Christ?", o: ["Halloween", "Good Friday", "Easter", "Christmas"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "The play 'Andher Nagri Chaupat Raja' is written by which of the following?", o: ["Mahavir Prasad Dwivedi", "Maithilisharan Gupta", "Sumitranandan Pant", "Bharatendu Harishchandra"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Who among the following is credited with the enactment of the First Factories Act, 1881, which had provisions for regulating child employment?", o: ["Lord Irwin", "Lord Mayo", "Lord Ripon", "Lord Curzon"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "______ is the first non-English feature film to win the Oscar for Best Film at the 92nd Academy Awards.", o: ["Crouching Tiger", "Parasite", "Bohemian Rapsdi", "Green Book"], a: 1, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Who among the following is not known for his expertise in painting?", o: ["Tayeb Mehta", "Jamini Roy", "Habib Tanveer", "Satish Gujral"], a: 2, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "02dec2020-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s2-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "निम्न चार शब्दों में से तीन में एक निश्चित प्रकार की समानता है और एक असंगत है। उस असंगत विकल्प का चयन करें।\nI. दौड़ना\nII. कूदना\nIII. उछलना\nIV. धकेलना", o: ["III", "IV", "II", "I"], a: 1, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following number series?\n93, 95, 98, 103, 110, ?", o: ["132", "121", "126", "118"], a: 1, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Choose the number from the given options which is related to the third number in the same way as the second number is related to the first number.\n11 : 1326 :: 9 : _______", o: ["724", "848", "925", "936"], a: 0, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s2-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "02dec2020-s2-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following number series?\n1713, 1311, 117, 75, ?", o: ["48", "59", "53", "39"], a: 2, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s2-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "In a certain code language, HOME is written as ELJB. Which word will be written as ARHB in the same code language?", o: ["KUDE", "EUDK", "DEKU", "DUKE"], a: 3, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s2-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s2-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "02dec2020-s2-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "उस विकल्प का चयन कीजिए जिसका तीसरे शब्द से वही संबंध है, जो दूसरे शब्द का पहले शब्द से है।\nअंगुली : अंगूठी :: टखना : ?", o: ["बिछिया", "चूड़ी", "पायल", "सैंडल"], a: 2, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "02dec2020-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "02dec2020-s2-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s2-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s2-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s2-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Neha wants to sell an item. How many times of the cost price should be the selling price, if she wants to earn 200% profit?", o: ["2 times", "4 times", "3 times", "6 times"], a: 2, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following set.\n(174, 87, 29)", o: ["(212, 106, 42)", "(432, 216, 72)", "(530, 265, 92)", "(236, 92, 22)"], a: 1, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and balance the given equation.\n9 * 6 * 3 * 19 * 4 * 83", o: ["×, +, ÷, −, =", "÷, ×, +, −, =", "+, ÷, ×, −, =", "−, ÷, +, ×, ="], a: 3, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the difference between the compound interest compounded annually and the simple interest on ₹16,000 for 3 years at 5% per annum?", o: ["₹130", "₹140", "₹150", "₹122"], a: 3, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "A cow is tied to a peg at one corner of a square shaped grass field of side 20.5 m. The length of the rope is 10.5 m. What is the area (in m²) of the field in which the cow CANNOT graze? (Use π=22/7)", o: ["333.625", "350", "86.625", "175"], a: 0, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "A spherical solid lead ball of radius 9 cm is melted and small solid lead balls of radius 3 mm are made. What is the number of small balls made?", o: ["27,000", "15,000", "25,000", "30,000"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "₹6,060 को A, B और C के बीच इस प्रकार बांटा जाता है कि यदि A के हिस्से में से ₹15, B के हिस्से में से ₹20 और C के हिस्से में से ₹25 कम कर दें, तो उनके हिस्सों का अनुपात 5 : 7 : 8 हो जाता है। C की मूल हिस्सेदारी कितनी (₹में) थी?", o: ["2,120", "1,525", "2,425", "1,515"], a: 2, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "A publisher sells a book to a wholesale dealer at a profit of 30%. The wholesaler sells the book to a retailer at a profit of 25%. The book is then sold to a customer for ₹312, by earning a profit of 20%. What is the cost price (in ₹) of the book for the wholesale dealer?", o: ["260", "200", "208", "160"], a: 2, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "A loan is returned in two equal yearly instalments of ₹5,808. What is the total amount of the loan if the rate of compound interest, compounded annually, is 10% per annum?", o: ["₹12,450", "₹10,080", "₹18,000", "₹10,800"], a: 1, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "The average score of a group of students in a test is 64. If 20% students obtained an average score of 91 and 25% students obtained an average score of 31, then what is the average score (correct to one decimal place) of the remaining students?", o: ["71.2", "69.2", "70.5", "68.7"], a: 1, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Equal square tiles are to be fixed on a wall, 3 m 50 cm in length and 4 m in height. How many largest possible tiles are needed to cover the wall?", o: ["63", "45", "56", "54"], a: 2, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "A person covered a certain distance at some speed. Had he moved 6 km/h faster, he would have taken 30 minutes less. If he had moved 4 km/h slower, he would have taken 30 minutes more. What is his original speed (in km/h)?", o: ["21", "24", "28", "36"], a: 1, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "Henry is working in a company. From his monthly salary, 25% is deducted as house rent, 15% is spent on children's education and 18% is spent on other heads. If his monthly savings are ₹7,560, then what is his monthly salary (in ₹)?", o: ["18,000", "17,500", "20,000", "15,000"], a: 0, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "A and B together can finish a work in 10 days, B and C together can finish the same work in 15 days, and A and C together can finish the same work in 20 days. In how many days can C alone finish the same work?", o: ["90", "120", "80", "100"], a: 1, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper marks his goods at 32% above the cost price. He sells three-fifth of the goods at the marked price, one-fifth at a discount of 20% on the marked price, and the remaining at 40% discount on the marked price. What is his profit/loss percentage?", o: ["Loss 15.17%", "Loss 17.16%", "Profit 18.17%", "Profit 16.16%"], a: 3, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the number that is always a factor of the sum of a 2-digit number and a number obtained by interchanging the digits of the number?", o: ["5", "3", "11", "9"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "The value of a machine depreciates at the rate of 25% each year. If the difference between its value at the end of the second year and the third year is ₹24,000, then what is the value (in ₹) of the machine at the end of the first year?", o: ["1,28,000", "1,00,000", "1,35,000", "1,12,000"], a: 0, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Which of the following is the largest fraction?\n6/11, 13/18, 15/22, 19/36, 25/33", o: ["19/36", "25/33", "15/22", "13/18"], a: 1, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following view options in MS Word shows the contents of a document as bulleted points?", o: ["Draft", "Web Layout", "Outline", "Print Layout"], a: 2, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Home page is the ______ page of a website.", o: ["about", "last", "first", "middle"], a: 2, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts is used to move through each of the open tabs going to the right in a Chrome browser?", o: ["Alt + N", "Ctrl + N", "Alt + Tab", "Ctrl + Tab"], a: 3, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "POP is an email-related protocol. What is the full form of POP?", o: ["Partial Order Program", "Post Office Protocol", "Post Office Progress", "Partial Order Protocol"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which of the following does NOT appear as a part of the 'Clipboard' command group under the Home menu in recent versions of MS Word, such as Word 2016?", o: ["Format Painter", "Paste", "Cut", "Show / Hide"], a: 3, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "State whether the following statements are true or false. (i) In MS Word, all paragraphs can have right alignment. (ii) In MS Word, all paragraphs cannot have the same hanging position.", o: ["(i) False, (ii) False", "(i) True, (ii) False", "(i) True, (ii) True", "(i) False, (ii) True"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following statements about MS Word table is FALSE?", o: ["Two or more consecutive cells of a column can be merged.", "Two or more consecutive cells of a row can be merged.", "Alternate cells of a row or column cannot be merged.", "The first and last cells of a table can be merged."], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following appears at the top of a worksheet in MS Excel?", o: ["Status bar", "Horizontal scroll bar", "Vertical scroll bar", "Formula bar"], a: 3, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following keys is used to select a range of continuous cells in an MS Excel worksheet?", o: ["Alt", "Shift", "Tab", "Ctrl"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "What will be the result of the following MS-Excel formula? = CEILING (7, 5)", o: ["8", "10", "5", "7"], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 02 Dec 2020 Shift-2";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 02 Dec 2020 Shift-2", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
