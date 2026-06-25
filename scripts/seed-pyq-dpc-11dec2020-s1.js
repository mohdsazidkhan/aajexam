/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 11 Dec 2020 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc11');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-11dec2020-s1';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 11 Dec 2020 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Aga Khan Palace, which served as a jail for Mahatma Gandhi and other freedom fighters during Quit India Movement, is located in which of the following states?", o: ["Maharashtra", "Andhra Pradesh", "West Bengal", "Haryana"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Who among the following was the first Indian woman to reach the summit of Mount Everest?", o: ["Aditi Vaidya", "Nahida Manzoor", "Deeya Bajaj", "Bachendri Pal"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Which of the following was the first to set up a bank in the private sector as part of RBI’s (Reserve Bank of India) liberalisation of the Indian banking industry?", o: ["HDFC Bank", "Punjab National Bank", "ICICI Bank", "SBI Bank"], a: 0, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "The Finance BiIl has to be passed by the parliament within how many days of its introduction?", o: ["90", "75", "60", "85"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "In which of the following states is the Corbett National Park located?", o: ["Uttarakhand", "Tripura", "West Bengal", "Gujarat"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "The pH of soil can be raised by adding_.", o: ["sand", "limestone", "urea", "concrete"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "policy refers to the use of monetary instruments under the control of the central bank to regulate the economic magnitudes.", o: ["Fiscal", "Revenue", "Monetary", "Trade"], a: 2, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Hathni Kund Dam is built on which of the following rivers?", o: ["Yamuna", "Mahanadi", "Krishna", "Cauvery"], a: 0, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "'Pulikkali' is a recreational folk art form from which of the following states of India?", o: ["Kerala", "Sikkim", "Karnataka", "Punjab"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Candela is the SI unit of which of the following base quantities?", o: ["Length", "Mass", "Luminous intensity", "Temperature"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Market Stabilisation Scheme, an instrument for monetary management, was introduced in which of the following years?", o: ["1999", "2004", "2001", "2009"], a: 1, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "In which of the following years did Sir John Lawrence officially declare Simla as the summer capital of the British empire?", o: ["1872", "1867", "1870", "1864"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "The legal provisions for the levy and collection of service tax were introduced through the Finance Bill in which of the following years?", o: ["1994", "1989", "1999", "1991"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Cameron White announced his retirement from professional cricket in August 2020. He represented which of the following countries?", o: ["Zimbabwe", "Australia", "England", "New Zealand"], a: 1, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "When was the electron discovered?", o: ["1896", "1897", "1898", "1895"], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "The rule of which of the following dynasties is popularly known as 'the Golden Period of Indian History'?", o: ["Lodhi Dynasty", "Sena Dynasty", "Gupta Dynasty", "Pratihara Dynasty"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "The Sun is visible to us approximatelyminutes before the sunrise because of atmospheric refraction.", o: ["13", "9", "2", "10"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Which of the following acids is found in nettle sting?", o: ["Oxalic acid", "Methanoic acid", "Citric acid", "Acetic acid"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Who along with Bhagat Singh threw a bomb in the Legislative Assembly in April 1929?", o: ["Sukhdev", "Jatin Das", "Batukeshwar Dutta", "Ajay Ghosh"], a: 2, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "On which of the following dates was the Bhutan Constitution enacted?", o: ["25 August 2003", "9 October 1998", "18 July 2008", "12 June 2000"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Who among the following Mughal rulers introduced the Mansabdari system that became the basis of Mughal military organisation and civil administration?", o: ["Aurangzeb", "Babur", "Jehangir", "Akbar"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "In which of the following cities is the headquarters of HDFC Bank located?", o: ["Patna", "Bengaluru", "Mumbai", "New Delhi"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Which of the following banks launched Kisan Gold Card in August 2020 to finance farmers for a specified sum of money towards their farm requirements?", o: ["ICICI Bank", "Axis Bank", "State Bank of India", "HDFC Bank"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "When was the Lahore Session of the Indian National Congress held, where everyone present in the meeting pledged to mark 26 January as ‘Independence Day’?", o: ["14 January 1937", "26 March 1935", "31 December 1929", "31 October 1945"], a: 2, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Where is the headquarters of the Sports Authority of India (SAI)?", o: ["New Delhi", "Mumbai", "Tamil Nadu", "Bengaluru"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Mahindra Rajapaksa became the Prime Minister of which of the following countries in August 2020?", o: ["Sri Lanka", "China", "Bhutan", "Nepal"], a: 0, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "In which of the following years was the Punjab Reorganisation Act enacted by the Indian parliament?", o: ["1967", "1987", "1970", "1966"], a: 3, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "In which of the following years was the foundation of Pondicherry laid?", o: ["1664", "1673", "1678", "1693"], a: 1, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Ustad Ali Akbar Khan was the world renowned musician associated with which of the following musical instruments?", o: ["Violin", "Flute", "Sitar", "Sarod"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "‘Vesak Poya’ festival, which is celebrated on a full moon day in May, belongs to which of the following religions?", o: ["Sikhism", "Buddhism", "Jainism", "Islam"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "'Sattriya' is the famous dance-drama performance art form of which of the following states?", o: ["Bihar", "Gujarat", "Maharashtra", "Assam"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Who among the following wrote Vishesh Briguvanshi’s biography 'Vishesh: Code to Win'?", o: ["Monika Arora", "Arundhati Roy", "Chetan Bhagat", "Nirupama Yadav"], a: 3, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Who among the following is known as the Father of India’s Space Programme?", o: ["Vikram Sarabhai", "Satish Dhawan", "Homi Bhabha", "C V Raman"], a: 0, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "'Bastar Dussehra' is a traditional Indian festival that is celebrated over a span ofdays.", o: ["75", "90", "60", "65"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Which of the following elements is used as a doping agent in semiconductors for solid state devices?", o: ["Lithium", "Nitrogen", "Neon", "Arsenic"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "MRI scans produce detailed images of the organs and tissues in the body. What is the full form of MRI?", o: ["Magnified Retrieved Ionizing", "Magnetic Resonance Imaging", "Magnetic Resource Intersection", "Magnified Resource Imaging"], a: 1, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "is the total value of goods and services produced in a country and is measured over a specific time frame.", o: ["Non-tax revenue", "Gross fiscal deficit", "Gross budgetary support", "Gross domestic product"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Who among the following Indian cricketers was appointed as the brand ambassador of sports eyewear brand Oakley in August 2020?", o: ["Virat Kohli", "Harbhajan Singh", "Suresh Raina", "Rohit Sharma"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Lothian Island Wildlife Sanctuary is located in which of the following states?", o: ["Tamil Nadu", "Maharashtra", "Odisha", "West Bengal"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which of the following Acts laid the foundation for the federal system of India?", o: ["Government of India Act, 1934", "Government of India Act, 1935", "Government of India Act, 1919", "Government of India Act, 1923"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Cinchona trees primarily belong to which of the following vegetations?", o: ["Tropical evergreen forests", "Montane forests", "Tropical deciduous forests", "Mangrove forests"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "As per 2011 Census which of the following is the least populated state in India?", o: ["Mizoram", "Sikkim", "Tripura", "Uttarakhand"], a: 1, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Who among the following former Indian presidents died in August 2020?", o: ["Pranab Mukherjee", "KR Narayan", "Shankar Dayal Sharma", "APJ Abdul Kalam"], a: 0, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "How many members represented Chhattisgarh in Lok Sabha as of October 2020?", o: ["14", "23", "17", "11"], a: 3, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "In which of the following years did Sikh Guru Shri Har Krishan Ji receive enlightenment?", o: ["1661", "1678", "1656", "1664"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Who among the following can dissolve the Lok Sabha on the advice of the Prime Minister before the expiry of its term?", o: ["The Vice-President", "The Speaker of Rajya Sabha", "The Speaker of Lok Sabha", "The President"], a: 3, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "ICC (International Cricket Council) is the global governing body for International Cricket. How many representative teams act as full members of ICC who play official test matches?", o: ["7", "12", "15", "10"], a: 1, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "In which of the following states is 'Zeliang', a tribal folk dance form, popular?", o: ["Nagaland", "Karnataka", "Andhra Pradesh", "West Bengal"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "The Union Budget 2020-2021 raised the FPI (Foreign Portfolio Investors) limit in corporate bonds tofrom 9%.", o: ["17%", "15%", "11%", "13%"], a: 1, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "In which of the following years was Puducherry captured by the Dutch?", o: ["1693", "1665", "1678", "1689"], a: 0, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "11dec2020-s1-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "11dec2020-s1-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following set.\n(16, 24, 30)", o: ["(18, 27, 45)", "(14, 21, 38)", "(22, 32, 40)", "(40, 60, 75)"], a: 3, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "11dec2020-s1-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "11dec2020-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "11dec2020-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "11dec2020-s1-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following number series?\n12, 14, 16, 16, 20, 18, 24, ?, 28, 22", o: ["20", "21", "19", "22"], a: 0, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Two different positions of the same dice are shown. Select the number on the face opposite the face showing '4'.", o: ["2", "3", "1", "6"], a: 0, e: "", qimg: "11dec2020-s1-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "11dec2020-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\nCheese : Cow :: Sweater : ?", o: ["Dog", "Oyster", "Buffalo", "Sheep"], a: 3, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "11dec2020-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "11dec2020-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Three of the following four words are alike in a certain way and one is different. Pick the odd one out.", o: ["Hendecagon", "Hexagon", "Heptagon", "Pentagon"], a: 1, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "11dec2020-s1-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "11dec2020-s1-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "11dec2020-s1-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "If SPRING is coded as 79 and MAGIC is coded as 102, then how will LEAST be coded?", o: ["76", "77", "78", "79"], a: 2, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "11dec2020-s1-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "11dec2020-s1-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n58 : 30 :: 116 : ?", o: ["59", "95", "56", "65"], a: 0, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "11dec2020-s1-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "15 chains were bought for ₹7,520 and sold for ₹9,450. What was the approximate profit percentage per chain?", o: ["26%", "24%", "27%", "28%"], a: 0, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct?\n36 − 14 × 63 ÷ 9 + 11 = 99", o: ["+ and −", "× and +", "× and ÷", "× and −"], a: 1, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n3, 7, 13, 26, 69, 127, 275, ?", o: ["436", "463", "464", "446"], a: 3, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A student requires 221 days attendance to appear in an examination. A student has 204 days attendance and is declared ineligible by 5% attendance. What is the percentage of attendance required to appear in the examination?", o: ["80%", "95%", "85%", "94%"], a: 2, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "The average score of 40 students of section A is 92. Two students of the class having average score 95, moved to another section and 1 new student replaced them. Now the average score of section A is 90. What is the average score of the new student joined section A?", o: ["89", "86", "91", "55"], a: 3, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "At a certain rate, a sum becomes 729/512 of itself in one year when interest is compounded half yearly. What will be the compound interest on ₹10,000 for 2½ years at the same rate of interest, if interest is compounded annually, nearest to the nearest rupee?", o: ["₹4,693", "₹4,352", "₹14,352", "₹4,532"], a: 3, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Six spherical balls of radius 7 cm are dropped in a bucket which is full of water up to the brim. The water flowed out is collected in a cylindrical jar of radius 14 cm. What is the height of the water in the jar?", o: ["14 cm", "6 cm", "7 cm", "10 cm"], a: 0, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "A metallic slab having dimensions 10 cm × 11 cm × 20 cm is melted and recast in the shape of a wire of radius 0.7 cm. What is the length of the wire (in m)? [take π = 22/7]", o: ["1590 m", "110 m", "500 m", "5000 m"], a: 2, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "Sachin took a loan of ₹10,000 partly at 5% and rest at 8% per annum simple interest. He paid a total of ₹3,300 after 4 years as interest. What is the difference in the money borrowed at two different rates of interest?", o: ["₹1,200", "₹600", "₹360", "₹6,000"], a: 1, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper earns a profit of 10% when he sells articles at a discount of 10%. What will be the profit percentage if he gives 20% discount?", o: ["20%", "17.5%", "25%", "15%"], a: 0, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Six men can complete a work in 40 days. In how many days will 4 men and 8 women complete the same work, if one man does as much work as 2 women?", o: ["30 days", "40 days", "36 days", "24 days"], a: 2, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper suffers a loss of 10% if he sells an article for ₹6,750. What should be the selling price so that he earns a 10% profit?", o: ["₹8,100", "₹8,250", "₹8,168", "₹7,500"], a: 1, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "The sum of two numbers is 33. If their LCM and HCF are 72 and 3, respectively, then what is the difference in the numbers?", o: ["39", "30", "69", "15"], a: 3, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "The distance between two stations A and B is 387 km. A 1.8 km long train starts from station B at a speed of 99 km/h. After 10 minutes, another train, 1.2 km long, starts from station A and runs towards station B at a speed of 108 km/h. What is the distance of the point from station A where the two trains pass each other?", o: ["50 km", "60 km", "58.2 km", "57 km"], a: 2, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "A number when divided by 234 leaves remainder 19. What will be the remainder when the same number is divided by 13?", o: ["7", "1", "5", "2"], a: 3, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper bought two computer printers of different companies for ₹10,500. He sells one printer at a gain of 20% and the other printer at a loss of 15%. He finds that the selling price of each printer is the same. What is the net profit or loss?", o: ["Profit ₹1,050", "Loss ₹1,050", "Profit ₹300", "Profit ₹525"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of the prices of wheat and rice is 9 : 4, and the ratio of their quantities consumed in a family is 14 : 5. What is the ratio of the expenditure on wheat and rice?", o: ["33 : 152", "19 : 11", "13 : 5", "2 : 1"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Simplify: (1.16 − 1.2)(13.5 − .03) / 3", o: ["14.5", "145", "1.45", "43.5"], a: 1, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following buttons CANNOT be found in the Clipboard pane in MS Word 2010?", o: ["Ok", "Clear All", "Options", "Paste All"], a: 0, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following is mandatory for sending an email?", o: ["Body", "Sender mail ID", "Attachment", "Subject"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Match the following protocols with their descriptions. http A. Used to login over a TCP/IP connection FTP B. This Protocol used in the file transferring in the Internet and within private networks telnet C. It is the application protocol used for distributed and collaborative hypermedia information system.", o: ["1-C, 2-B, 3-A", "1-A, 2-B, 3-C", "1-A, 2-C, 3-B", "1-B, 2-A, 3-C"], a: 0, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "When you right-click and select the 'Format Cells' option in MS Excel 2010, which of the following Tab is NOT visible?", o: ["Sheet", "Font", "Border", "Alignment"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which of the following Tab is used to enable 'Ruler' option in MS Word 2010?", o: ["Review", "Design", "Page Layout", "View"], a: 3, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "The electronic pages seen on the internet are known as_.", o: ["hard copy", "colour pages", "web pages", "printed pages"], a: 2, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "What is the maximum number of rows in a MS Excel 2010 worksheet?", o: ["16,384", "1,048,500", "1,048,576", "16,000"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "What do you call the distance between written text and the edge of a paper?", o: ["Alignment", "Ruler Line", "Indent Stop", "Margin"], a: 3, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "What will be the value of the following MS Excel formula? =AVERAGEA(5, 4, 4>3, 6)", o: ["5", "3.72", "4", "ERROR"], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Match the following keyboard shortcuts of MS Word 2010 with their respective functionalities. Italic x. Ctrl + [ Decrease font size 1 point y. Ctrl + ] Increase font size 1 point z. Ctrl + I", o: ["a-y, b-z, c-x", "a-z, b-y, c-x", "a-z, b-x, c-y", "a-x, b-y, c-z"], a: 2, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 11 Dec 2020 Shift-1";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 11 Dec 2020 Shift-1", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
