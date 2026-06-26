/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 08 Dec 2020 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc08_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-08dec2020-s1';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 08 Dec 2020 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Who among the following is a celebrated singer of Chhath Puja songs?", o: ["Vishaka Hari", "Anima Choudhury", "Ila Arun", "Sharda Sinha"], a: 3, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "The arteries divide into smaller vessels. On reaching the tissues, they divide further into extremely thin tubes called ______.", o: ["venules", "arterioles", "capillaries", "veins"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "The causative agent of the deadly disease Ebola is/are:", o: ["parasites", "virus", "bacteria", "fungus"], a: 1, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Who among the following is set to become the first-ever female president of the Marylebone Cricket Club in its 233-year history?", o: ["Mithali Raj", "Diana Edulji", "Clare Connor", "Alyssa Healy"], a: 2, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "In which year was the Indira Gandhi Institute of Development Research (IGIDR) inaugurated?", o: ["1987", "1982", "1993", "1991"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "______ is played on a synthetic hard court.", o: ["Wimbledon", "Australian Open", "London Queens Club", "French Open"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "The Khilafat movement was led by ______.", o: ["Maulana Abul Kalam Azad", "Muhammad Ali and Shaukat Ali", "Muhammad Ali Jinnah", "Syed Ahmad Khan"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "In which year was the NITI Aayog formed?", o: ["2015", "2012", "2017", "2018"], a: 0, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which of the following is the largest jute producing state in India?", o: ["Bihar", "West Bengal", "Tripura", "Meghalaya"], a: 1, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Fatehpur Sikri was founded as the capital of the Mughal Empire by ______.", o: ["Babur", "Humayun", "Jahangir", "Akbar"], a: 3, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Constitution of India provides the ‘Right to Education’?", o: ["Article 39A", "Article 44", "Article 12", "Article 21A"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Who is the author of the book ‘A Tale of Two Victoria Crosses’?", o: ["Lt. Gen. Baljit Singh", "Jairam Ramesh", "Lt. Gen. Devraj Anbu", "Shashi Tharoor"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "A type of asexual reproduction in which new plants are produced from roots, stems, leaves and buds is known as ______.", o: ["grafting propagation", "layering propagation", "budding propagation", "vegetative propagation"], a: 3, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "When was the Indian Rupee de-linked from the Pound Sterling?", o: ["1975", "1947", "1982", "1963"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "In terms of area, which is the second-largest state in India?", o: ["Karnataka", "Rajasthan", "Madhya Pradesh", "Uttar Pradesh"], a: 2, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "In which of the following folk dances of South India do the dancers balance pots on their heads?", o: ["Kolattam", "Mayilattam", "Karagattam", "Pampu Attam"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "The renowned classical singer Uday Bhawalkar is an exponent of which form of Hindustani classical music?", o: ["Ghazal", "Tarana", "Thumri", "Dhrupad"], a: 3, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Who among the following had been appointed as the Chairman of the National Stock Exchange (NSE) in December 2019?", o: ["Girish Chandra Chaturvedi", "Ashish Kumar Chauhan", "Ashok Chawla", "Vikramajit Sen"], a: 0, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Which of the following states won the United Nations Interagency Task Force (UNIATF) award for its outstanding performance in controlling non-communicable diseases in September 2020?", o: ["Himachal Pradesh", "West Bengal", "Goa", "Kerala"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "The Great Stupa at Sanchi was built by ______.", o: ["Bindusara", "Ashoka", "Chandragupta", "Harshavardhana"], a: 1, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Which of the following is the primary constituent of a pearl?", o: ["Potassium sulfate", "Calcium sulfate", "Calcium peroxide", "Calcium carbonate"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Each kho-kho team consists of 12 players, but during a contest, only ______ players from each team take the field.", o: ["7", "11", "9", "8"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "The legal provisions governing the management of foreign exchange reserves are laid down in the Reserve Bank of India Act, ______.", o: ["1934", "1923", "1947", "1971"], a: 0, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "The Nobel Prize in Literature 2019 was won by:", o: ["Alice Ann Munro", "Peter Handke", "Olga Tokarczuk", "Svetlana Alexandrovna Alexievich"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "The total number of ministers, including the Prime Minister, in the Council of Ministers CANNOT be more than ______ of the total number of members of the Lok Sabha.", o: ["6%", "30%", "15%", "21%"], a: 2, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Who was the first ruler of the Gupta Dynasty who claimed the title of Maharajadhiraja?", o: ["Ramagupta", "Chandragupta I", "Samudragupta", "Skandagupta"], a: 1, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "In which state is the Yaoshang festival primarily celebrated?", o: ["Manipur", "Sikkim", "Tripura", "Arunachal Pradesh"], a: 0, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Which simple machine is used in a see-saw?", o: ["Wedge", "Pulley", "Lever", "Wheel and axle"], a: 2, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which of the following is the largest bauxite producing state in India?", o: ["Rajasthan", "Jharkhand", "Odisha", "Gujarat"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "As per the Economic Survey 2020, the share of formal employment increased from 17.9 per cent in 2011-12 to ______ per cent in 2017-18, reflecting formalisation in the Indian economy.", o: ["28.8", "30.8", "20.8", "22.8"], a: 3, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "In which state is Jog Falls located?", o: ["Uttarakhand", "Karnataka", "Jharkhand", "Sikkim"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Article 19(d) of the Constitution of India deals with the ______.", o: ["right to freedom of speech", "right to assemble peaceably", "right to move freely throughout the territory of India", "right to practice any profession"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "The Nobel Prize in Physiology or Medicine 2020 has been awarded jointly to ______.", o: ["Abhijit Banerjee, Esther Duflo and Michael Kremer", "Vitaly L Ginzburg, Karl von Frisch and Willard S Boyle", "John B Goodenough, Leonid Hurwicz and Doris Lessing", "Harvey J Alter, Michael Houghton and Charles M Rice"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "What is India’s ranking in the World Bank's Ease of Doing Business 2020 report?", o: ["53rd", "67th", "63rd", "77th"], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Who among the following was popularly known as Punjab Kesari?", o: ["Dr. Rajendra Prasad", "Mahatma Gandhi", "Subhas Chandra Bose", "Lala Lajpat Rai"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "The Mughal Empire was ruled by Shah Jahan from ______.", o: ["1621 to 1659 AD", "1628 to 1658 AD", "1627 to 1660 AD", "1626 to 1659 AD"], a: 1, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "The Simon Commission was sent to India in ______.", o: ["1928", "1919", "1938", "1918"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which of the following longitudes is the standard meridian of India?", o: ["72 degree 30’ E", "82 degree 30’ E", "52 degree 30’ E", "82 degree 50’ E"], a: 1, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "As per data from the World Economic Forum, the manufacturing sector in India has grown by over ______ per year on average in the last three decades.", o: ["12%", "7%", "2%", "20%"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which of the following statements is correct?", o: ["The Speaker of the Lok Sabha presides over a joint sitting of the two Houses of Parliament.", "The Prime Minister presides over a joint sitting of the two Houses of Parliament.", "The Chairman of the Rajya Sabha presides over a joint sitting of the two Houses of Parliament.", "The Home Minister presides over a joint sitting of the two Houses of Parliament."], a: 0, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "In which year was the first-ever Asian Games organised in New Delhi?", o: ["1947", "1949", "1954", "1951"], a: 3, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "An alloy with ______ in it is referred to as ‘amalgam’.", o: ["nickel", "silver", "mercury", "cobalt"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "The value of Special Drawing Right (SDR) of the International Monetary Fund is determined by a basket of currencies consisting of how many currencies?", o: ["5", "10", "9", "15"], a: 0, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "The paintings and sculptures of the Ajanta Caves in Maharashtra are related to which of the following religions?", o: ["Buddhism", "Zoroastrianism", "Jainism", "Hinduism"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Who among the following established the Swaraj Party?", o: ["Jawaharlal Nehru", "Motilal Nehru", "Dr. Rajendra Prasad", "Subhas Chandra Bose"], a: 1, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which among the following movies won the ‘Best Hindi Film’ award at the 66th National Film Awards?", o: ["Article 15", "Super 30", "Gully Boy", "Andhadhun"], a: 3, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "The Tropic of Cancer passes through all the following states, EXCEPT ______.", o: ["Madhya Pradesh", "Haryana", "Gujarat", "Mizoram"], a: 1, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "India Gate in New Delhi is a memorial built in commemoration of the Indian soldiers killed in which of the following wars?", o: ["India-Pakistan War of 1965", "World War II", "World War I", "India-China War of 1962"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "A Central Minister ceases to be a Minister if he is NOT a member of Parliament for a period of ______.", o: ["6 consecutive months", "10 consecutive months", "10 consecutive weeks", "6 consecutive weeks"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "The word ‘socialist’ was added in the Preamble of the Constitution of India by ______.", o: ["The Constitution (Thirty-fifth Amendment) Act, 1974", "The Constitution (Forty-second Amendment) Act, 1976", "The Constitution (Twenty-fourth Amendment) Act, 1971", "The Constitution (Seventh Amendment) Act, 1956"], a: 1, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "08dec2020-s1-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct?\n65 ÷ 13 × 8 + 39 − 105 = 106", o: ["+ and −", "÷ and −", "+ and ×", "× and ÷"], a: 0, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n1143, 1044, 955, 876, 807, 748, ?, 660, 631, 612", o: ["703", "678", "699", "711"], a: 2, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "08dec2020-s1-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Three of the following four words are alike in a certain way and one is different. Select the odd one.", o: ["Clear", "Transparent", "Translucent", "Opaque"], a: 3, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "08dec2020-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n6385 : 549 :: 8396 : ?", o: ["659", "1458", "2711", "981"], a: 1, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "08dec2020-s1-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "In the Venn diagram given below, the 'rectangle' represents 'Males', the 'triangle' represents 'Engineers', and the 'circle' represents 'Tall People'. The numbers given in the diagram represent number of persons of that particular category.\nFind the number of engineers who are NOT males.", o: ["19", "10", "9", "13"], a: 3, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "08dec2020-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "08dec2020-s1-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "'Factory' is related to 'Production' in the same way as 'Warehouse' is related to '______'.", o: ["Marketing", "Sales", "Storage", "Display"], a: 2, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "08dec2020-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "08dec2020-s1-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "08dec2020-s1-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "08dec2020-s1-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "In a code language, REJOICE is written as VXRLQVI. How will VICTORY be written in that language?", o: ["BILGERX", "BILGXRE", "ERXGLIB", "ERXGBIL"], a: 1, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "08dec2020-s1-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n157, 193, 238, 292, ?, 427, 508, 598", o: ["375", "363", "361", "355"], a: 3, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "A shopkeeper buys a product for ₹80 and marks a price assuming a profit of 50% on his cost price. At the time of making the sale, he gives a 20% discount on the marked price. What is the amount of net profit he makes on this product?", o: ["₹20", "₹25", "₹24", "₹16"], a: 3, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following set.\n(7, 3, 40)", o: ["(8, 1, 54)", "(5, 2, 16)", "(7, 4, 35)", "(6, 3, 27)"], a: 3, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "08dec2020-s1-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "08dec2020-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "08dec2020-s1-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "08dec2020-s1-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A hall is 14 m long and 11 m broad. If the sum of the areas of the floor and the ceiling is equal to the sum of the areas of the four walls, then the volume (in m³) of the hall is:", o: ["975.32", "948.64", "1000", "864.64"], a: 1, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "3 birds fly along the circumference of a jungle. They complete one round in 27 minutes, 45 minutes and 60 minutes, respectively. Since they start together, when will they meet again (in minutes) at the starting position?", o: ["450", "540", "600", "360"], a: 1, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "The difference between a two-digit number and the number obtained by interchanging the digits is 54. What is the difference between the sum and the difference of the digits of the number if the ratio of the digits of the number is 1 : 3?", o: ["4", "3", "6", "8"], a: 2, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "The distance between two places, A and B, is 190 km. A bus starts from A at 6 a.m. and travels towards B at 40 km/h. Another bus starts from B at 7 a.m. and travels towards A at 50 km/h. At what time will they meet?", o: ["8.10 a.m.", "9.20 a.m.", "8.40 a.m.", "9 a.m."], a: 2, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "A is 30% more efficient than B and B can finish a certain job in 13 days. How many days will A alone take to complete the same job?", o: ["7", "9", "10", "11"], a: 2, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "The total consumption of rice is 20 kg per month for a family. As the price of rice increases by 35%, the family reduces its consumption so that the expenditure of rice is increased only by 8%. What is the new consumption (in kg) of rice per month due to the increase in the price of rice?", o: ["18", "14", "16", "12"], a: 2, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "Radha sold a watch at a profit of 12.5%. If she had sold it for ₹50 more, then the profit would have been 15%. The initial selling price (in ₹) of the watch is:", o: ["2,250", "2,000", "1,125", "1,000"], a: 0, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A, B and C agree to pay their total telephone bill in the proportion 3 : 5 : 7. A pays the first month's bill of ₹400, B pays the second month's bill of ₹560 and C pays the third day's bill of ₹840. How much amount (in ₹) should B pay to settle the accounts?", o: ["20", "50", "30", "40"], a: 3, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of the length and breadth of a rectangular park is 5 : 3, respectively. If a man walking along the boundary of the park at the speed of 6 km/h completes one round in 10 minutes, then the area of the park (in m²) is:", o: ["59385.75", "58593.75", "58395.75", "53985.75"], a: 1, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "Ram sold an article for ₹1,476, after allowing a 20% discount on its marked price. If he had not allowed any discount, he would have earned a profit of 24%. What is the cost price (in ₹) of the article (correct to two decimal places)?", o: ["1,576.75", "1,187.76", "1,678.90", "1,487.90"], a: 3, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "The average age of students (boys and girls) of a class is 16.8 years. The average age of the boys in the class is 17.6 years and that of the girls is 16.4 years. The ratio of the number of boys to the number of girls in the class is:", o: ["1 : 2", "2 : 3", "2 : 1", "3 : 2"], a: 0, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "The compound interest on a certain sum for 2 years at a certain rate of interest is ₹1,996.80 if the interest is compounded annually, and the simple interest on the same sum for the same time and at the same rate of interest is ₹1,920. The amount (in ₹) for the same sum, interest compounded annually, at the same rate of interest for 3 years is:", o: ["14,761.35", "14,167.34", "15,116.54", "15,611.45"], a: 2, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "In the first year, the population of a village increases by 10%, and in the second year, it diminishes by 12%. At the end of the second year, its population was 14520. What was the population at the beginning of the first year?", o: ["14750", "15000", "15250", "13500"], a: 1, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "The value of (¼ of 1½) ÷ (3½ − 1¼) of 1½ − 1½ ÷ 2¼ + 1⅓ is:", o: ["7/9", "11/9", "5/9", "17/9"], a: 0, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "A fruit seller had some apples. He sells 30% of the apples and still has 245 apples left with him. The number of apples he had with him initially was:", o: ["250", "400", "300", "350"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Electronic mail belongs to which of the following services on internet?", o: ["World wide web", "Web services", "Communication services", "Information retrieval services"], a: 2, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following options is used to view the page or make adjustments before any document gets printed in MS-Word?", o: ["Print Preview", "Outline", "Web Layout", "Draft"], a: 0, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following functions returns the current date and time in MS-Excel?", o: ["NOW", "DATEVALUE", "TIME", "DATE"], a: 0, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following refers to the specific address associated with each web page displayed on the internet?", o: ["URL", "FTP", "HTTP", "WWW"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "With reference to text formatting, 'Italic' option belongs to which of the following categories in MS-Word?", o: ["Effects", "Size", "Font style", "Font face"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following, with reference to opening an already existing document, is FALSE in MS-Word 2007?", o: ["Click on the \"office button → Open\"", "short cut key for opening existing word document is Ctrl+O", "After clicking on open, from the window opened, double-click on the file", "short cut key for opening existing word document is Ctrl+M"], a: 3, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following shortcut keys is used to cut data from a cell in MS-Excel?", o: ["Ctrl+C", "Ctrl+Z", "Ctrl+X", "Ctrl+V"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following shows the address of the current selection or active cell in MS- Excel?", o: ["Column heading", "Name box", "Formula bar", "Row heading"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following options in MS-Word is used to colour the background behind the selected text or paragraph?", o: ["Font Colour", "Shading", "Format Painter", "Text Highlight Colour"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following is the full form of 'BCC', a field of E-mail header?", o: ["Basic carbon copy", "Blind carbon copy", "Basic common copy", "Blind common copy"], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 08 Dec 2020 Shift-1";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 08 Dec 2020 Shift-1", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
