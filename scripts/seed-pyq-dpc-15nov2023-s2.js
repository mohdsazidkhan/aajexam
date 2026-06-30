/**
 * Seed: Delhi Police Constable - 15 Nov 2023 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc15nov2023_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-15nov2023-s2';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 15 Nov 2023 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Which of the following State Governments organises Surajkund Mela every year?", o: ["Jammu", "Haryana", "Punjab", "Jharkhand"], a: 1, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "The Wazir (minister) of ________ built Moth ki Masjid in Delhi.", o: ["Alauddin Khalji", "Khizr Khan", "Sikandar Lodi", "Firuz Shah Tughluq"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Which is the most common tidal pattern?", o: ["Mixed tides", "Diurnal tides", "Spring tides", "Semi-diurnal tides"], a: 3, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Which of the following dance forms belongs to the Vaishnava Monasteries of North East India?", o: ["Odissi", "Mohiniattam", "Kuchipudi", "Sattriya"], a: 3, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "How many tiers of government are mentioned in the Constitution of India?", o: ["Two", "Four", "Three", "Five"], a: 2, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "When did the Paris Agreement on Climate Change come into force (become effective from)?", o: ["22nd April 2016", "4th November 2016", "27th January 2017", "12th December 2015"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Who among the following is associated with the Mridangam instrument?", o: ["Zarin S Sharma", "Hari Prasad Chaurasia", "Palghat Mani Iyer", "Ali Akbar Khan"], a: 2, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "According to Census 2011, which group of states have the highest males literacy rates?", o: ["Rajasthan and Bihar", "Kerala and Tamil Nadu", "Kerala and Mizoram", "Sikkim and Nagaland"], a: 2, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "According to Census 2011, what was the population density of India?", o: ["382 persons", "343 persons", "372 persons", "362 persons"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which of the following statements is correct? a)The Indian desert lies towards the eastern margins of the Aravali Hills. It is an undulating sandy plain covered with sand dunes. b) This region has arid climate with low vegetation cover and streams appear during the rainy season.", o: ["Only a is correct.", "Both a and b are correct.", "Only b is correct.", "Both a and b are incorrect."], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Who among the following was the first person in British India to get the scholarship of Indian Society of Oriental Arts, established in 1906?", o: ["Jagdish Chandra Bose", "Subrahmanyan Chandrasekhar", "Nandalal Bose", "Prafulla Chandra Roy"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Which state has two headquarters of Indian Railway Zones?", o: ["Rajasthan", "Uttar Pradesh", "Bihar", "Assam"], a: 1, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Untouchability is against which of the following fundamental rights?", o: ["Right to freedom of religion", "Right to constitutional remedy", "Right to liberty", "Right to equality"], a: 3, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Elections under which act gave the control of seven provinces in 1937 to the Congress?", o: ["Government of India Act, 1935", "Government of India Act, 1937", "Provincial Act, 1935", "Municipalities Act, 1935"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Turmeric powder is adulterated with:", o: ["lead chromate", "zinc carbonate", "silicon oxide", "magnesium chloride"], a: 0, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "In which king’s honour and praise was the Prayag Prashasti written by the Sanskrit poet Harisena?", o: ["Vikramaditya", "Chandragupta", "Samudragupta", "Ashoka"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "When was the Bengal Partition Plan implemented?", o: ["10 September 1910", "16 October 1905", "7 August 1899", "15 August 1915"], a: 1, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Gram Nyayalaya Act was enacted in the year __________.", o: ["2006", "2008", "2000", "2004"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Who became the first Indian woman to win two Olympic medals?", o: ["Karnam Malleswari", "PV Sindhu", "Saina Nehwal", "Mary Kom"], a: 1, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "The three-second rule is applicable for the game of _______.", o: ["kho-kho", "badminton", "basketball", "kabaddi"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Which of the following is a merit of the parliamentary system?", o: ["Autocracy", "Narrow representation", "Non responsible government", "Harmony between legislature and executive"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "‘Godaan’, a famous novel, was authored by _______.", o: ["Jaishankar Prasad", "Harivansh Rai Bachchan", "Suryakant Tripathi Nirala", "Munshi Premchand"], a: 3, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Expenditure incurred by residents during their foreign tour will be added to which component while calculating national income?", o: ["Government final consumption expenditure", "Private final consumption expenditure", "Gross foreign capital formation", "Gross domestic capital formation"], a: 1, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "FIH Asia Cup Men’s Hockey 2022 was hosted by:", o: ["Japan", "Pakistan", "Indonesia", "India"], a: 2, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Who was India’s 12th Prime Minister?", o: ["Inder Kumar Gujral", "Atal Bihari Vajpayee", "PV Narasimha Rao", "Manmohan Singh"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Name the Indian social reformer who played a crucial role in the passing of the Age of Consent Bill, 1891.", o: ["Rabindranath Tagore", "C Subramania Bharathi", "Behramji Malabari", "Ishwarchandra Vidyasagar"], a: 2, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "‘Why I am an Atheist’ is an autobiography of whom among the following Revolutionaries?", o: ["Chandrashekhar Azad", "Suryakant Sen", "Ramprasad Bismil", "Bhagat Singh"], a: 3, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Who among the following was the captain of the Indian cricket team in the 1983 World Cup?", o: ["Kapil Dev", "Mohinder Amarnath", "Dilip Vengsarkar", "Sunil Gavaskar"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Identify the artist who is NOT related to the musical instrument pakhwaj.", o: ["Pandit Kishan Maharaj", "Ayodhya Prasad", "Gopal Das", "Totaram Sharma"], a: 0, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Which of the following temples is located in Uttarakhand?", o: ["Neelkanth Mahadev", "Ranakpur", "Gomateshwara", "Kamakhya"], a: 0, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Sonal Mansingh is an eminent Indian classical dancer and a leading exponent of Bharatanatyam, Kuchipudi, Odissi and _________ .", o: ["Sattriya", "Kathakali", "Chhau", "Kathak"], a: 2, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "By which name was the Head of the Panchayat or the Village Headman called in Mughal India?", o: ["Samant", "Mahant", "Muqaddam", "Khoran"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Sodium hydrogen carbonate is called:", o: ["Washing soda", "Baking soda", "Gypsum", "Plaster of Paris"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "According to the Ministry of Commerce and Industry 2021-22, which of the following is the largest exported agricultural product from India?", o: ["Rice", "Maize", "Spices", "Wheat"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Milk is good source of:", o: ["phosphorous, iron, and protein", "calcium, magnesium, and fibre", "calcium, iron, and fibre", "calcium, phosphorous, and protein"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Which of the following Ministries introduced the Venture Capital Assistance Scheme?", o: ["Ministry of Science and Technology", "Ministry of Micro, Small and Medium Enterprises", "Ministry of Agriculture and Farmers Welfare", "Ministry of Finance"], a: 2, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Which form of art is celebrated at the Mando festival of Goa?", o: ["Painting", "Literature", "Sports", "Music"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Economic reform measures in India were formally introduced in ________.", o: ["1990", "1991", "1980", "1947"], a: 1, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Which of the following statements is correct about India for the period between 1950 and 1990?", o: ["The proportion of GDP contributed by agriculture and population engaged in the", "The proportion of GDP contributed by agriculture declined significantly but not the", "Being an agricultural economy, the contribution of agricultural sector is not", "The proportion of GDP contributed by agriculture increased significantly but not the"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which of the following Constitutional Amendment Acts added Fundamental Duties in the Indian Constitution?", o: ["65th", "74th", "73rd", "42nd"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "According to the Census of India 2011, which group of states recorded the lowest male literacy rate?", o: ["Bihar and Arunachal Pradesh", "Rajasthan and Arunachal Pradesh", "Bihar and Rajasthan", "Arunachal Pradesh and Odisha"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "The first chairman of the Planning Commission in India was ________.", o: ["Jaiprakash Narayan", "Sriman Narayan", "Jawaharlal Nehru", "Radha Mohan Singh"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "The Ghode Modni dance, to celebrate the victory of warriors, is performed in which of the following states of India?", o: ["Goa", "West Bengal", "Karnataka", "Tamil Nadu"], a: 0, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "The Charminar was constructed by which of the following dynasties?", o: ["Pandya", "Chera", "Chalukya", "Qutb Shahi"], a: 3, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Net investment can be best expressed using which of the following elements?", o: ["Net investment-Depreciation", "Depletion Value", "Replacement Cost", "Gross Investment-Depreciation"], a: 3, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "What is the chemical formula of sodium nitrate?", o: ["NaNH3", "NaNO4", "NaNO3", "NaNO2"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Geeta Mahalik won the Sangeet Natak Akademi Award for which form of dance?", o: ["Odissi", "Kathakali", "Bharatanatyam", "Kuchipudi"], a: 0, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "‘Mahatma Gandhi National Fellowship’ (‘MGNF’) is a two-year academic programme that was launched by _________in 2020 as part of the SANKALP programme.", o: ["IIT Madras", "IIM Ahmedabad", "IIT Delhi", "IIM Bangalore"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Who among the following was one of the court poets of the King Samudragupta?", o: ["Harisena", "Surdas", "Pragyajan", "Hariharan"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Which of the following Articles provides the minorities the right to establish and administer educational institutions of their choice?", o: ["Article 31", "Article 30", "Article 29", "Article 28"], a: 1, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: All hens are dogs. All dogs are peacocks. Conclusions: I. All hens are peacocks. II. All peacocks are dogs.", o: ["Only conclusion II follows", "Only conclusion I follows", "Neither conclusion I nor II follows", "Both conclusions I and II follow"], a: 1, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "In a code language, if PETROL is coded as ODSQNK and ENGINE is coded as DMFHMD, then how will VEHICLE be coded?", o: ["UDGHBKD", "UDHGKBD", "WFIJDMF", "WDIHDKF"], a: 0, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the option figure which is embedded in the given figure as its part (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "15nov2023-s2-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "15nov2023-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "15nov2023-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "15nov2023-s2-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct? 98 – 49 ÷ 7 + 74 × 55 = 3", o: ["= and +", "= and ÷", "= and ×", "= and −"], a: 2, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below and complete the pattern.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "15nov2023-s2-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "15nov2023-s2-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "15nov2023-s2-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "15nov2023-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. KEEP : SHHN :: HIDE : HGLK :: EXIT : ?", o: ["XLAH", "WMBH", "WLAH", "WLAI"], a: 2, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "15nov2023-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are NOT related in the same way as are the numbers of the following sets. (59, 236, 175),(24, 124, 98) (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits.)", o: ["(22, 183, 159)", "(21, 124, 108)", "(64, 182, 116)", "(16, 206, 188)"], a: 1, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the figure from the options that can replace the question mark (?) and complete the given pattern.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "15nov2023-s2-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "15nov2023-s2-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 11 * 12 * 70 * 175 * 5 * 97", o: ["×, + , – , ÷ , =", "×, – , + , ÷ , =", "+ , ×, –, ÷ , =", "×, – , + , = , ÷"], a: 1, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "C, D, E, F, G and H were six women, sitting around a circular table, equidistant from each other, facing the centre. D and E were sitting immediately next to each other. F and H were sitting immediately next to each other. G was to the immediate right of C. E was to the immediate right of F. D was to the immediate left of C. Who among the following was sitting third to the left of D?", o: ["F", "G", "C", "H"], a: 3, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Which of the following options will replace the question mark (?) in the given series? 13, 104, 52, 416, 208, ?, 832", o: ["1664", "1158", "790", "690"], a: 0, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Which of the following letter clusters will replace the question mark (?) in the given series to make it logically complete? RTE, PVC, NXA, LZY, ?", o: ["JBW", "JBX", "KXV", "JBA"], a: 0, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "15nov2023-s2-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "15nov2023-s2-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fourth term in the same way as the first term is related to the second term and the fifth term is related to the sixth term. 8 : 199 :: ? : 439 :: 5 : 82", o: ["16", "14", "12", "10"], a: 2, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["18", "12", "15", "10"], a: 2, e: "", qimg: "15nov2023-s2-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "15nov2023-s2-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["245.14", "280.75", "211.25", "205.33"], a: 3, e: "", qimg: "15nov2023-s2-q-76.png" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["75.26", "76.25", "71.65", "72.65"], a: 1, e: "", qimg: "15nov2023-s2-q-77.png" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "The smallest 4-digit prime number is:", o: ["1009", "1007", "1003", "1001"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "14 men can complete a piece of work in 6 days, while 20 women can complete the same work in 8 days. 7 men started working on the job, and after working for 3 days all of them stopped working. How many women should be put on the job to complete the remaining work, if it is to be completed in 6 days?", o: ["20", "25", "15", "30"], a: 0, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the greatest possible length (in cm) of scale to measure exactly the following lengths : 1 m, 20 cm, 3 m, 90 cm?", o: ["30", "10", "45", "50"], a: 0, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "By selling an article, a shopkeeper makes a profit of 30% of its selling price. Find his profit percentage.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "15nov2023-s2-q-81.png" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the total percentage change in the volume of a cuboid if its length and breadth are decreased by 10% and 20%, respectively, while its height is increased by 30%.", o: ["6.4%", "8.2%", "9.1%", "8.6%"], a: 0, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Trader A offers a discount of 25% on the marked price for cash purchase. Trader B offers a trade discount of 20% and a cash discount of 4% on the same article marked at the same price as that of Trader A. If the discount given by Trader A is ₹360 more than the discount given by Trader B, then what is the marked price of the item (in rupees)?", o: ["19,000", "18,000", "30,000", "20,000"], a: 3, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "If the average of 8, 6, 14, 7 and x is 11, then the value of x is:", o: ["18", "20", "22", "15"], a: 1, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "A policeman chases a thief. The speed of the policeman and thief is 8 km/h and 7 km/h, respectively. If the policeman started 6 minutes late, after running how much distance will he be able to catch the thief?", o: ["5.5 km", "5.6 km", "6 km", "6.3 km"], a: 1, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1.5", "1.4", "1.6", "1.8"], a: 0, e: "", qimg: "15nov2023-s2-q-86.png" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "A person took a loan of ₹1,200 on simple interest for as many years as the rate of interest. If he paid ₹432 as interest at the end of the loan period, what was the rate of interest per annum?", o: ["9%", "8%", "5%", "6%"], a: 3, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "एक सभा में 350 स्काउट्स को दूध परोसा गया। उनमें से प्रत्येक को 10 cm आधार त्रिज्या और 15 cm ऊँचाई वाले बेलनाकार गिलास में दूध दिया गया। यदि दाता ने ₹50 प्रति लीटर की दर से दूध खरीदा, तो कितनी राशि खर्च की गई? (बेलनाकार कागज के गिलास आदि की कीमत पर ध्यान न दें)", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "15nov2023-s2-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "Ajay’s test marks in two subjects, Mathematics and Science, are in the ratio 9 ∶ 13. If he got 16 marks more in Science than in Mathematics, what are his marks in Mathematics?", o: ["27", "36", "54", "45"], a: 1, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "A man loses 25% of his money. After spending 60% of the remaining money, he has ₹360 left. What is the amount of money (in ₹) he originally had?", o: ["1200", "1962", "654", "2400"], a: 0, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following is an address on the world wide web that is used to access specific web resources and is the specific path to a resource?", o: ["Hyperlink", "Web server", "Web pages", "Uniform resource locator"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "The keyboard shortcut for opening a new document in Microsoft Word 365, while another document is already open, is ________.", o: ["Ctrl + N", "Ctrl + Y", "Ctrl + S", "Ctrl + P"], a: 0, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT used to edit text in MS-Word 365?", o: ["Making text as Bold/Italic", "Changing Font Color", "Making text as Left align", "Changing Font Style"], a: 2, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following tabs in MS Word 365, allows you to customise the page size in the Page Setup dialog box?", o: ["Layout", "File", "Edit", "Insert"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "While composing an email, what does the user have to write in the 'Subject' field?", o: ["A smiley or emoji to make the email more interesting", "The recipient’s email address", "The main topic of an email message", "The sender’s email address"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following document settings can be changed from the layout tab of MS word 365?", o: ["Change styles", "Margins", "Macros", "Spelling grammar"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which Microsoft Excel 365, function is used to join or concatenate text strings from different cells?", o: ["CONCATENATE", "MERGE", "ADD", "JOIN"], a: 0, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following statements about autofitting the row height in MS Excel 365 is correct?", o: ["Single-clicking on the boundary between row headers will automatically adjust the", "Double-clicking on the boundary between row headers will automatically adjust the", "Double-clicking on the boundary between column headers will automatically adjust", "Single-clicking on the boundary between column headers will automatically adjust the"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, Which function from the following list is used to tally the quantity of empty cells within a specified cell range?", o: ["COUNTB()", "COUNTA()", "COUNT()", "COUNTBLANK()"], a: 3, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following is used to print the document in MS-Word 365?", o: ["File->print", "Design->print", "Home->print", "View->print"], a: 0, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 15 Nov 2023 Shift-2";
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
