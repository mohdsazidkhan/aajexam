/**
 * Seed: Delhi Police Constable - 21 Nov 2023 Shift-3
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc21nov2023_s3');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-21nov2023-s3';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 21 Nov 2023 Shift-3"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Pandit Birju Maharaj, Padma Bhushan awardee, was a globally renowned dancer of which of the following gharanas of Kathak?", o: ["Kalka-Bindadin", "Raigarh", "Janaki Prasad", "Jaipur"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "In which of the following cases is a member of the State Legislature NOT required to vacate his/her seat?", o: ["Disqualification", "Double membership", "Absence for a week without permission", "Resignation"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Gujarat.", o: ["Jama Masjid", "Buland Darwaja", "Sheikh Salim Chisti Dargah", "Panch Mahal"], a: 1, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "What does ‘E’ stand for in SEBI?", o: ["Electronic", "Electronically", "Exchange", "Energy"], a: 2, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Pandit Bhimsen Joshi is associated with the ________.", o: ["Banaras gharana", "Patiala gharana", "Agra gharana", "Kirana gharana"], a: 3, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "The ‘Kachin Manaw Festival’ is associated with which of the following countries?", o: ["Maldives", "Myanmar", "Sri Lanka", "Pakistan"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a primary objective of the Special Economic Zone?", o: ["Development of infrastructure", "Providing employment", "Promoting export", "Promoting clean technology"], a: 3, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Gurmeet Bawa, who received the Padma Bhushan posthumously in 2022, hails from which of the following states?", o: ["Uttarakhand", "Maharashtra", "Punjab", "Haryana"], a: 2, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which weather phenomenon is defined as the movement of large-scale winds around a central region of high atmospheric pressure?", o: ["Tropical cyclone", "Extratropical cyclone", "Polar cyclone", "Anticyclone"], a: 3, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which of the following Acts created a unified administration system for India?", o: ["Pitt’s India Act of 1784", "Regulating Act of 1793", "Regulating Act of 1813", "Regulating Act of 1773"], a: 3, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Meenakshisundaram Pillai, a dance guru from the village of Pandanallur, was famous for which of the following dance forms?", o: ["Mohiniyattam", "Odissi", "Bharatnatyam", "Kathak"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Which of the following forts is located in Goa?", o: ["Jaigarh Fort", "Bekal Fort", "Fort Aguada", "Chandragiri Fort"], a: 2, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "‘Lone Fox Dancing’ is an autobiography by which of the following novelists?", o: ["Arvind Adiga", "Amitav Ghosh", "Ruskin Bond", "Khushwant Singh"], a: 2, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which of the following is needed for the formation of haemoglobin?", o: ["Cu", "P", "Fe", "Ca"], a: 2, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "In which of the following years did the badminton player PV Sindhu win the Olympics Medal?", o: ["2004 and 2008", "2008 and 2012", "2012 and 2020", "2016 and 2020"], a: 3, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Article 32 of the Constitution of India deals with _________ .", o: ["the Right to Freedom and Religion", "the Right to Constitutional Remedies", "Cultural and Educational Rights", "the Right to Freedom"], a: 1, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Where was the Prarthana Samaj established in the 1860s?", o: ["Maharashtra", "Bengal", "United Provinces", "Madras"], a: 0, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Football 2027 Asian Cup will be hosted by _________ .", o: ["Bangladesh", "India", "Saudi Arabia", "Japan"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Where did Dadabhai Naoroji establish the East India Company Association?", o: ["Paris", "Delhi", "Lucknow", "London"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Constitution of India lays down that it is our duty to defend the country and render national service when called upon to do so?", o: ["Article 51 A (d)", "Article 51 A (g)", "Article 51 A (e)", "Article 51 A (f)"], a: 0, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "With reference to electric charges, identify the INCORRECT statement.", o: ["Lightning conductor can be used to predict lightning strike.", "The electrical charges produced by rubbing are called static charges.", "Lightning conductor can protect a building from lightning.", "Like charges repel and unlike charges attract each other."], a: 0, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "According to India Brand Equity Foundation (IBEF), India has the _____ largest road network in the world (as of August 2022).", o: ["first", "fourth", "second", "third"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Chandertal, Renuka and Pong Dam are the three Ramsar wetland sites of which state?", o: ["Karnataka", "Assam", "Gujarat", "Himachal Pradesh"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "According to the Agricultural and Processed food products Export Development Authority (APEDA) 2021-2022, which state of India has the first rank in mango production?", o: ["Bihar", "Uttar Pradesh", "Karnataka", "Maharashtra"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "According to the census of India 2011, which state has the second highest density of population per square kilometre?", o: ["Bihar", "Uttar Pradesh", "Andhra Pradesh", "West Bengal"], a: 3, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT correct about agriculture industry?", o: ["Green revolution enabled India to achieve self-sufficiency in food grain production.", "Green revolution started the usage of HYV seeds.", "Green revolution resulted in the improvement in oilseeds.", "Green revolution led to the introduction of new technology."], a: 2, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "The post of Vice President has been taken from the Constitution of ______.", o: ["Australia", "Germany", "The UK", "The US"], a: 3, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "When did Dipa Karmakar win the Major Dhyan Chand Khel Ratna Award in Gymnastics?", o: ["2016", "2017", "2018", "2015"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "The Harike Barrage has been constructed at the confluence of which two rivers?", o: ["Beas and Sutlej", "Ganga and Yamuna", "Luni and Subarnarekha", "Mahanadi and Damodar"], a: 0, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Fa-Hien visited India during the reign of which of the following Gupta Kings?", o: ["Chandragupta II", "Bhanugupta", "Samudragupta", "Budhagupta"], a: 0, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "The study of cell structure is called ________.", o: ["Fisheries", "Anatomy", "cytology", "Morphology"], a: 2, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Which Article of the Constitution of India empowers the Indian President to constitute a GST Council by an order?", o: ["Article 279-A", "Article 277-A", "Article 280-A", "Article 278-A"], a: 0, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Kolayat festival is celebrated in which Indian state?", o: ["Bihar", "Rajasthan", "Jharkhand", "Madhya Pradesh"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "In which of the following Articles of India is it mentioned that “it shall be the duty of every citizen of India to cherish and follow the noble ideals which inspired our national struggle for freedom”?", o: ["51A (b)", "51A (f)", "51A (a)", "51A (i)"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Guru Vempati Chinna Satyam has gained global recognition for the spread of which of the following classical dance forms of India?", o: ["Bharatanatyam", "Kuchipudi", "Sattriya", "Kathak"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Who among the following is the author of the book Kitab-ul-Hind?", o: ["Al Masudi", "Al-Biruni", "Shihabuddin al-Umari", "Ibn Battuta"], a: 1, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Kelucharan Mohapatra has been awarded the Padma Bhushan for which form of classical dance?", o: ["Odissi", "Bharatanatyam", "Kuchipudi", "Kathak"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Who among the following Indian reformers is credited with the campaign for widow remarriage and on whose suggestion a law was passed by the British officials in 1856, permitting the same?", o: ["Ayyankali", "Ishwar Chandra Vidyasagar", "Mumtaz Ali", "Savitri Bai Phule"], a: 1, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Identify the correct statements about Independence Day and Republic Day of India. i) Independence Day is celebrated on 15th August since 1947. ii) Republic Day is celebrated on 26th January since 1950. iii) Independence Day is celebrated as Independence from British rule. iv) Republic day is celebrated since the Constituent Assembly of India adopted the Constitution of India in 1949.", o: ["i, iii and iv", "ii, iii and iv", "i, ii and iii", "i, ii and iv"], a: 2, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "The 11th Fundamental Duty was added to the Indian Constitution by the ________ Constitutional Amendment Act.", o: ["87th", "84th", "88th", "86th"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Who converted Menander to Buddhism?", o: ["Bhadrabahu", "Buddhaghosh", "Nagasena", "Asvaghosha"], a: 2, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT one of the problems with microfinance?", o: ["Skewed growth across the country", "Lack of transparency and absence of governance structure", "Operational, attitudinal and policy-level constraints", "Excess flow of funds towards microfinance"], a: 3, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "When were female participants formally admitted to the Olympic Games?", o: ["Paris, 1900", "London, 1908", "Helsinki, 1952", "Berlin, 1936"], a: 0, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT true regarding the antioxidants?", o: ["It prevents the damage of cellular functions.", "It helps in the repair of cellular functions.", "Animal products are the chief source of antioxidants.", "It delays the ageing process."], a: 2, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "The city of Hampi was named after the local mother goddess called _________ .", o: ["Hampini", "Hidimba", "Hampidevi", "Pampadevi"], a: 3, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "In foreign technology agreements, automatic permission is provided in high priority industry up to a sum of __________.", o: ["₹1 crore", "₹2.5 crore", "₹2 crores", "₹1.5 crore"], a: 0, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Who pioneered the concept of microfinance?", o: ["Medha Patkar", "Ela Bhatt", "Mohammad Yunus", "Anna Hazare"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "According to the Census of India 2011, which state recorded the highest sex ratio?", o: ["Karnataka", "Tamil Nadu", "Kerala", "Andhra Pradesh"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "‘Both Feet on the Ground’ is an autobiography of which of the following players?", o: ["Cristiano Ronaldo", "Lionel Messi", "Bobby Moore", "David Beckham"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Which of the following was NOT a reason for emphasizing industrial development in the five year plans?", o: ["Industry doesn’t require high investment", "Industry promotes modernisation", "Industry promotes overall prosperity", "Industry provides more stable employment than agriculture"], a: 0, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 200 * 13 * 9 * 200 * 25 = 75", o: ["+, ×, −, ÷", "÷, −, ×, +", "×, ÷, +, −", "−, ×, −, ÷"], a: 3, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["24", "40", "52", "44"], a: 2, e: "", qimg: "21nov2023-s3-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? XUEJ, TRIM, ?, LLQS, HIUV", o: ["POMP", "QONN", "QONO", "PPMO"], a: 0, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "21nov2023-s3-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: All cakes are candies. No pastry is a candy. Conclusions: I. All pastries are cakes. II. Some cakes are pastries.", o: ["Neither conclusion I nor II follows", "Both conclusions I and II follow", "Only conclusion I follows", "Only conclusion II follows"], a: 0, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s3-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 2, 4, 12, 48, ?, 1440", o: ["960", "240", "640", "480"], a: 1, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the option figure which is embedded in the given figure as its part (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "21nov2023-s3-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s3-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 8 : 2 :: 12 : ? :: 24 : 10", o: ["4", "2", "6", "8"], a: 0, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Q, R, S, T, U and V were six doctors sitting around a circular table, facing the centre. They were equidistant from each other. Q was to the immediate right of U. R was exactly in between V and T. S was to the immediate right of Q. T was second to the left of Q. Who among the following was sitting third to the right of U?", o: ["T", "R", "S", "V"], a: 3, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "21nov2023-s3-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s3-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that can replace the question mark (?) in the following series.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "21nov2023-s3-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the figure that will come next in the following figure series.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "21nov2023-s3-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "21nov2023-s3-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the option figure that will replace the question mark (?) in the figure given below to complete the pattern.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "21nov2023-s3-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘PIG’ is written as ‘49’ and ‘HAT’ is written as ‘52’. How will ‘CAB’ be written in that language?", o: ["79", "51", "75", "63"], a: 2, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 12 * 5 * 9 * 54 * 9 = 1", o: ["×, ×, ÷, −", "+, ×, ÷, −", "×, ×, −, −", "×, ×, ÷, +"], a: 0, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s3-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "21nov2023-s3-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "21nov2023-s3-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "21nov2023-s3-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE:Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding/deleting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed) (18, 28, 38) (11,26, 41)", o: ["(17, 48, 53)", "(13, 24, 37)", "(9, 27, 43)", "(18, 35, 52)"], a: 3, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the word-pair that best represents a similar relationship to the one expressed in the pair of words given below. (The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word.) Hexagon : Septagon", o: ["Radius : Diameter", "Triangle : Rectangle", "Chord : Circle", "Area : Square"], a: 1, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "Which ratio is the greatest among the following?", o: ["5 : 8", "4 : 7", "3 : 5", "1 : 3"], a: 0, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of ₹2,400 yields a simple interest of ₹460 in 2 years and 4 months. The rate of interest per annum is:", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "21nov2023-s3-q-77.png" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "Anjali and Manju together can do a piece of work in 5 days. If Anjali does twice as much work as Manju in a given time, how long would Anjali alone take to do the work?", o: ["6 days", "7.5 days", "7 days", "6.5 days"], a: 1, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "21nov2023-s3-q-79.png" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "The price of a car increased by 25%. By what percentage should the price now be reduced to bring it to the actual price?", o: ["20%", "25%", "15%", "35%"], a: 0, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "A train covers a distance of 10 km in 10 minutes. If its speed is decreased by 20 km/h, then the time taken by it to cover the same distance will be:", o: ["18 minutes", "15 minutes", "20 minutes", "12 minutes"], a: 1, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper offers a discount of 15% on the marked price of an article and still makes a profit of 25%. If its marked price is ₹2,100, then find the cost price of the article.", o: ["₹1,248", "₹1,842", "₹1,428", "₹1,284"], a: 2, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Joy borrowed some amount from a bank at the rate of 6% per annum, compounded annually. If he finished paying his loan by paying ₹20,000 at the end of 5 years, then the amount of loan that he had taken (rounded to the nearest thousand rupees) was:", o: ["₹12,000", "₹15,000", "₹16,000", "₹13,000"], a: 1, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of the salaries of Ram and Shyam is 8 : 5. If the salaries of Ram and Shyam are increased by ₹2,600, then their ratio becomes 15 : 11. What is the salary of Shyam?", o: ["₹5,000", "₹3,500", "₹4,000", "₹4,500"], a: 2, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "The highest common factor of 161 and 207 is:", o: ["9", "1", "7", "23"], a: 3, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["8.44", "0.0844", "0.844", "0.00844"], a: 1, e: "", qimg: "21nov2023-s3-q-86.png" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "21nov2023-s3-q-87.png" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of n natural odd numbers is _____, where n is odd.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s3-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "If the area of great circle is 36π m2, then find the volume of a hemisphere. (Use π=3.14)", o: ["445.68 m3", "464.32 m3", "452.16 m3", "458.74 m3"], a: 2, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["0.0068", "0.068", "0.68", "0.088"], a: 1, e: "", qimg: "21nov2023-s3-q-90.png" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following is an example of web browser?", o: ["Mozilla Firefox", "Outlook 365", "Yahoo mail", "Google Search"], a: 0, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "What does the ‘Grammar Check’ feature in MS-Word 365 do?", o: ["It provides suggestions to improve the document’s structure.", "It formats the text based on predefined style rules.", "It highlights correct spelling and offers suggestions.", "It identifies and provides suggestions to correct grammatical errors in the text."], a: 3, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "What is the maximum number of columns existing in MS-Excel 2010?", o: ["8,382 columns", "2,048 columns", "32,386 columns", "16,384 columns"], a: 3, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following tabs on the MS Excel 365 ribbon has the ‘Sort & Filter’ group?", o: ["Review", "Edit", "Data", "Formula"], a: 2, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which protocol is commonly used for sending emails from a client to a server?", o: ["Internet Messaging Access Protocol (IMAP)", "Hypertext Transfer Protocol (HTTP)", "Simple Mail Transfer Protocol (SMTP)", "Post office Protocol (POP3)"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which menu or tab is used to access the ‘Save’ or ‘Save as’ options?", o: ["File", "Home", "Edit", "Insert"], a: 0, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT used to modify selected text in MS-Word 365?", o: ["Ctrl + I", "Ctrl + O", "Ctrl + U", "Ctrl + B"], a: 1, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "In Print Preview mode in Microsoft Word 365, what can you review and modify before printing the document?", o: ["Page layout", "Document content and editing options", "Printer connectivity and network settings", "Font styles and sizes"], a: 0, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "What is the function of the ‘Superscript’ feature in Microsoft Word 365?", o: ["Makes the text bold and italic", "Adds a line under the text", "Makes the text larger and below the baseline", "Makes the text smaller and above the baseline"], a: 3, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "When we open MS-Word 365, which of the following could be found?", o: ["Blank page without any default name", "Blank page with a default name “Document1”", "Blank page with a default name “Doc 1”", "Blank page with a default name “page 1”"], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 21 Nov 2023 Shift-3";
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
