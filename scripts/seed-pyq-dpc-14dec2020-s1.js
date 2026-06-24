/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 14 Dec 2020 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_f1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-14dec2020-s1';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 14 Dec 2020 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Who among the following is the communication channel between the Council of Ministers and the President of India?", o: ["Speaker of the Lok Sabha", "The Vice-President", "The Prime Minister", "Chairman of the Rajya Sabha"], a: 2, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Garia Puja is a festival celebrated in the third week of April. This festival is related to which of the following states?", o: ["Madhya Pradesh", "Tripura", "Punjab", "Arunachal Pradesh"], a: 1, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Pyorrhoea is a ______ infection, which affects the gum tissues and if left untreated, it often leads to subsequent loss of teeth.", o: ["viral", "bacterial", "fungal", "parasitic"], a: 1, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Mallikarjuna and the Virupaksha temples at Pattadakal were built by the two queens of King Vikramaditya II, to commemorate the victory of the Chalukyas over the:", o: ["Guptas", "Mauryas", "Pallavas", "Pandavas"], a: 2, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Who among the following can appoint the Comptroller and Auditor General of India?", o: ["The Prime Minister", "The Chief Justice of the Supreme Court", "The Vice President", "The President"], a: 3, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "An EEG is a test used to evaluate the electrical activity in the brain. Select the full form of EEG.", o: ["Electroepilepsygraph", "Electroencephalogram", "Electroessentialgraphy", "Electroeccentricgraphy"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Ringworm is a common skin infection caused by:", o: ["virus", "fungus", "bacteria", "protozoa"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Who among the following was appointed as the first Law Minister of Independent India in 1947?", o: ["Dr. BR Ambedkar", "Lokmanya Tilak", "Sardar Vallabhbhai Patel", "Lal Bahadur Shastri"], a: 0, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "______ is the integrated approach to study soil as a collection of natural bodies.", o: ["Pedology", "Ecology", "Serology", "Oenology"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Who among the following was the first female Indian Police Service (IPS) Officer?", o: ["Kiran Bedi", "Saina Bedi", "Prem Mathur", "Vimla Mehra"], a: 0, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "NSSO is an organisation under the Ministry of Statistics of the Government of India. What is the full form of NSSO?", o: ["National Statistics Survey Office", "National Sample Survey Office", "National Social Survey Office", "National Social Statistics Office"], a: 1, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Which of the following metals has the highest conductivity of all the metals?", o: ["Aluminium", "Iron", "Silver", "Steel"], a: 2, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Which of the following Schedules of the Constitution of India embodies three lists: Union, State and Concurrent?", o: ["Second", "Ninth", "Sixth", "Seventh"], a: 3, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Who was appointed as the `Goodwill Ambassador to the Poor' for UNADAP (United Nations Association for Development And Peace) in June 2020?", o: ["Alia Bhatt", "Ayushmann Khurrana", "Ashok Amritraj", "Nethra Mohandass"], a: 3, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "The Chola dynasty was founded by which of the following rulers?", o: ["Rajaraja Chola", "Aditya I", "Vijayalaya Chola", "Rajendra Chola I"], a: 2, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "An extensive elevated area of relatively flat land is called:", o: ["plateau", "glacier", "mountain", "lagoon"], a: 0, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Who among the following was conferred the Indira Gandhi Peace Prize 2020 by former Prime Minister Manmohan Singh?", o: ["Jeff Corwin", "Richard Attenborough", "George Page", "David Attenborough"], a: 3, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "To accelerate the efforts to achieve universal sanitation coverage and to put focus on sanitation, when did the Prime Minister of India launch the Swachh Bharat Mission?", o: ["15 August 2016", "14 November 2015", "26 January 2014", "2 October 2014"], a: 3, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Who among the following film personalities was roped in as UNICEF's Indian celebrity advocate for children's rights campaign in September 2020?", o: ["Amitabh Bachchan", "Salman Khan", "Ranbir Kapoor", "Ayushmann Khurrana"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "______ is the harvest festival celebrated on the 13th or 14th of April in Punjab every year and it marks the birth of the Khalsa Panth of the Sikh community.", o: ["Hola Mohalla", "Lohri", "Karva Chauth", "Baisakhi"], a: 3, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "In which of the following cities are the marble carved Dilwara Jain Temples located that enshrine various Jain `Tirthankaras'?", o: ["Jaipur", "Pune", "Mount Abu", "Shimla"], a: 2, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "The Kisan Credit Card Scheme was introduced in which year by Indian banks?", o: ["2001", "1996", "1994", "1998"], a: 3, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "_____ जनसंख्या की समय-समय पर की जाने वाली एक आधिकारिक प्रगणना है।", o: ["ड्राफ्ट", "क्लॉज", "रिकॉर्ड", "सेंसस"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "The First Backward Classes Commission was chaired by:", o: ["V.P. Singh", "PG Shah", "Kaka Kalelkar", "Anup Singh"], a: 2, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "IFTAS (Indian Financial Technology and Allied Services) is a wholly owned subsidiary of which of the following banks?", o: ["SBI", "RBI", "IMF", "ICICI"], a: 1, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Which of the following is a brackish water lake and shallow lagoon with estuarine character spread across the districts of Odisha?", o: ["Chilika Lake", "Pichola Lake", "Wular Lake", "Upper Lake"], a: 0, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "In which year was the Ilbert Bill proposed?", o: ["1891", "1883", "1873", "1879"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Hojagiri dance is a tribal dance form of the Reang community associated with which of the following states/union territories?", o: ["Tripura", "Assam", "Puducherry", "West Bengal"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which Articles of the Indian Constitution were amended by the Constitution (One Hundred and Third Amendment) Act, 2019?", o: ["Article 14 and Article 15", "Article 17 and Article 18", "Article 16 and Article 17", "Article 15 and Article 16"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Who among the following freedom fighters wrote the epic `Gita Rahasya' in jail?", o: ["BR Ambedkar", "Lokmanya Tilak", "Mahatma Gandhi", "Bhagat Singh"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "In which of the following countries is the headquarters of ICC (International Cricket Council) situated?", o: ["UK", "New Zealand", "Australia", "UAE"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "According to Article 112 of the Constitution of India, the Union ______of a year is a statement of the estimated receipts and expenditure of the Government for that particular year.", o: ["Investment", "Capital", "Budget", "Revenue"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Who among the following founded the Harijan Sevak Sangh in 1932?", o: ["Maharshi VR Shinde", "Mahatma Gandhi", "BR Ambedkar", "Swami Vivekanand"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "The prize money for the Arjuna Award has been enhanced from 5 lakh to ______ in 2020.", o: ["15 lakh", "10 lakh", "20 lakh", "25 lakh"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Who among the following had led the Aligarh Movement?", o: ["Abul Kalam Azad", "Muhammad Iqbal", "Syed Ahmad Khan", "Muhammad Ali Jinnah"], a: 2, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Who among the following was the first Finance Minister of Independent India?", o: ["Abul Kalam Azad", "RK Shanmukham Chetty", "Rajendra Prasad", "BR Ambedkar"], a: 1, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Neyyar Dam is a gravity dam on the Neyyar River of which of the following states?", o: ["West Bengal", "Odisha", "Kerala", "Karnataka"], a: 2, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Who among the following is the Captain of Kings XI Punjab for IPL 2020?", o: ["KL Rahul", "Glenn Maxwell", "Chris Gayle", "Mohammed Shami"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Who among the following film personalities became the Chairman of NSD (National School of Drama) in September 2020?", o: ["Rajpal Yadav", "Naseeruddin Shah", "Anupam Kher", "Paresh Rawal"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "In which of the following islands is India's only active volcano found?", o: ["Divar Island", "Neil Island", "Barren Island", "Agatti Island"], a: 2, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन सी आर्थिक योजना, गैर-कॉर्पोरेट, गैर-कृषि क्षेत्र, सूक्ष्म और लघु उद्यमों के लिए डिज़ाइन की गई एक पहल है, जिनकी क्रेडिट जरूरतें ₹10 लाख से कम हैं?", o: ["प्रधानमंत्री मुद्रा योजना", "राष्ट्रीय कृषि योजना", "खुशहाल समृद्धि योजना", "राष्ट्रीय स्वास्थ्य बीमा योजना"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Rajgir Dance Festival attests to the wide popularity of classical dances related to which of the following states/union territories?", o: ["Lakshadweep", "Goa", "Bihar", "Madhya Pradesh"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "How many countries are member countries of the Asian Development Bank (ADB)?", o: ["78", "94", "103", "68"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Who among the following cricketers won the Rajiv Gandhi Khel Ratna Award 2020?", o: ["Virat Kohli", "Suresh Raina", "Rohit Sharma", "Shikhar Dhawan"], a: 2, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "In which year was the Delhi Sultanate established?", o: ["1289", "1206", "1534", "1134"], a: 1, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Anil Kishora is the Vice President and CRO (Chief Risk Officer) of which of the following banks?", o: ["NDB (New Development Bank)", "HDFC Bank", "World Bank", "SBI (State Bank of India)"], a: 0, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "_____ में ऐसे पेड़ होते हैं जिनमें पत्तियों के बजाय सुइयां उगती हैं और फूलों के बजाय शंकु होते हैं।", o: ["शीतोष्ण घास के मैदान", "समशीतोष्ण वर्षावन", "शंकुधारी सदाबहार वन", "शीतोष्ण पर्णपाती वन"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Sheesh Mahal or the Palace of Mirrors, built by Maharaja Narinder Singh, is located in which of the following cities?", o: ["Batala", "Amritsar", "Jalandhar", "Patiala"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "NEFT is the system in which the transactions received up to a particular time are processed in batches. What does NEFT stand for?", o: ["National Economic Funds Transaction", "National Electronic Funds Transfer", "National Electronic Funds Transaction", "National Economic Financial Transfers"], a: 1, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "In which year was the Hunter Commission appointed by Lord Ripon for education reforms?", o: ["1879", "1867", "1857", "1882"], a: 3, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14dec2020-s1-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "14dec2020-s1-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14dec2020-s1-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "14dec2020-s1-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14dec2020-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14dec2020-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14dec2020-s1-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14dec2020-s1-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14dec2020-s1-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14dec2020-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14dec2020-s1-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14dec2020-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14dec2020-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14dec2020-s1-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14dec2020-s1-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14dec2020-s1-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14dec2020-s1-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14dec2020-s1-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14dec2020-s1-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14dec2020-s1-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14dec2020-s1-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14dec2020-s1-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14dec2020-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14dec2020-s1-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Study the question figure and options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "14dec2020-s1-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14dec2020-s1-q-76.png" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14dec2020-s1-q-77.png" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14dec2020-s1-q-78.png" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14dec2020-s1-q-79.png" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14dec2020-s1-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14dec2020-s1-q-81.png" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14dec2020-s1-q-82.png" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14dec2020-s1-q-83.png" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14dec2020-s1-q-84.png" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14dec2020-s1-q-85.png" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "14dec2020-s1-q-86.png" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14dec2020-s1-q-87.png" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14dec2020-s1-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14dec2020-s1-q-89.png" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Solve the question shown in the image below and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14dec2020-s1-q-90.png" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Many email systems use ______ protocol to send messages from one server to another server.", o: ["HTTP", "ARP", "ICMP", "SMTP"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "In MS Word 2010, to use the Spelling and Grammar option, one has to click on the ______ tab and within the ______ group click on `Spelling & Grammar'.", o: ["Design, Tracking", "Review, Proofing", "Review, Compare", "View, Language"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following functions is used to display only current system date in MS Excel 2010?", o: ["Date()", "Today()", "Time()", "Now()"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts is used to open the `Paste Special' dialogue box in MS Word 2010?", o: ["Ctrl + Alt + V", "Ctrl + Shift + V", "Ctrl + V", "Ctrl + Alt + X"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "______ is an information space on the internet where documents and other resources are stored.", o: ["World Wide Web", "Protocol", "Web browser", "File Explorer"], a: 0, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "What is the full form of TCP/IP, with reference to internet protocols?", o: ["Transmission Control Protocol and Intranet Protocol", "Transmission Control Protocol and Internet Protocol", "Transmission Control Protocol and International Protocol", "Transfer Control Protocol and Internet Protocol"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "By default, how many sheets are provided in MS Excel 2010 workbook?", o: ["One", "Seven", "Five", "Three"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "What is the purpose of the keyboard shortcut `Shift + F3' in MS Word 2010?", o: ["This shortcut displays font size options", "This shortcut displays alignment options", "This shortcut switches the text between uppercase, lowercase and title case", "This shortcut displays font colour options"], a: 2, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "To compare two versions of an MS Word 2007 document, one must go to the ______ tab and click on the ______ option within the `Compare' group.", o: ["View, Window", "Review, Track Changes", "Review, Tracking", "Review, Compare"], a: 3, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts is used to strike through the contents of a cell in MS Excel 2010?", o: ["Ctrl + P", "Ctrl + S", "Ctrl + 6", "Ctrl + 5"], a: 3, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 14 Dec 2020 Shift-1";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 14 Dec 2020 Shift-1", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
