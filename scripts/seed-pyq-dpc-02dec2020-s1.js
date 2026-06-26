/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 02 Dec 2020 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc02_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-02dec2020-s1';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 02 Dec 2020 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "What does the government do in a contractionary fiscal policy for lowering inflation?", o: ["Reduce the quantum of money by decreasing taxes and increasing spending", "Increase the quantum of money by raising taxes and reducing spending", "Increase the quantum of money by decreasing taxes and increasing spending", "Reduce the quantum of money by raising taxes and reducing spending"], a: 3, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Who among the following was the winner of the Grand Slam Boy's Singles title 2019?", o: ["Arthur Cazaux", "Shintaro Mochizuki", "Harold Mayot", "Carlos Gimeno"], a: 1, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "As per the United Nations Data, in August 2020, India's population was equivalent to ______ of the total world population.", o: ["10.2%", "12.4%", "19.4%", "17.7%"], a: 3, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "What is the chemical name of the common kitchen ingredient named ‘Baking Soda’?", o: ["Sodium Bicarbonate", "Sodium Hydroxide", "Sodium Hypochlorite", "Sodium Peroxide"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Which schedule of the Constitution of India has provisions which apply to the administration of the tribal areas in the states of Assam, Meghalaya, Tripura and Mizoram?", o: ["10th", "4th", "8th", "6th"], a: 3, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Which of the following dance forms has been included in the UNESCO Heritage Dances in the year 2010?", o: ["Paika dance", "Chau dance", "Agni dance", "Mundari dance"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Along which river bank among the following did the ancient city of Madurai, the capital of Pandya Kingdom, exist?", o: ["Brahmaputra", "Ganga", "Godavari", "Vaigai"], a: 3, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Which constitutional amendment deals with reservation of seats in educational institutes and of appointments or posts in the services under a state, for backward classes, scheduled castes and scheduled tribes?", o: ["69", "62", "76", "73"], a: 2, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "In which year was the Central Sanskrit Universities Act passed?", o: ["2014", "2019", "2020", "2016"], a: 2, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a quality of bases?", o: ["Bases don't change the colour of litmus", "Feels slippery or soapy", "Their aqueous (water) solutions conduct an electric current", "Tastes sweet"], a: 3, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "'Ghaggar and Banas' are rivers that feed the state of ______.", o: ["Gujarat", "Orissa", "Punjab", "Rajasthan"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "What kind of light/signal can the bees see that is used by the flowers to attract pollinators?", o: ["Infrared", "Gamma Rays", "Ultraviolet", "Radio Waves"], a: 2, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Who among the following is the author of the book 'The Longest Race'?", o: ["Salman Rushdie", "Tom Alter", "Ruskin Bond", "Nasser Hussain"], a: 1, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which crop has got the highest increase in Minimum Support Price (MSP) proposed by the Cabinet Committee on Economic Affairs (CCEA) for the marketing season 2020-21?", o: ["Sesamum", "Cotton", "Urad", "Niger seed"], a: 3, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "In which state of India is the ‘Siang River Festival’ celebrated?", o: ["Madhya Pradesh", "Arunachal Pradesh", "Uttar Pradesh", "Himachal Pradesh"], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "In which state in India will you find the 'Jamrai Tlang’ mountains?", o: ["Tripura", "Assam", "Bihar", "Sikkim"], a: 0, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "What is the amount of capital infusion proposed by the Budget 2020 into public sector banks?", o: ["₹1.5 lakh crore", "₹3.5 lakh crore", "₹2 lakh crore", "₹4 lakh crore"], a: 1, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Which one of the following was the first Indian state to achieve 100% sanitation in rural and urban households, schools, sanitary complexes and Aanganwadi centres in 2014?", o: ["Kerala", "Sikkim", "Nagaland", "Chhattisgarh"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "How many members represented the Indian Princely States in the Constituent Assembly in 1946?", o: ["81", "93", "75", "62"], a: 1, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Who among the following was a teen freedom fighter from Assam who laid down her life during the Indian Freedom Movement?", o: ["Kamaladevi Chattopadhyaya", "Matangini Hazra", "Moolmati", "Kanaklata Barua"], a: 3, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "How many Indian photo journalists have been awarded the 2020 Pulitzer Prize in the feature photography category?", o: ["Two", "Five", "Four", "Three"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "In wetland farming, the rainfall is in ______ soil moisture requirement of plants during rainy season.", o: ["excess of", "inverse of", "lesser to", "same to"], a: 0, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Which of the following is a 'rain fed' river?", o: ["Sindhu", "Ganga", "Periyar", "Yamuna"], a: 2, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Which Sikh Guru closed the practice of nominating a religious head?", o: ["Guru Tegh Bahadur", "Guru Gobind Singh", "Guru Arjan Dev", "Guru Sri Har Rai"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "'Damane' and 'Hulki' are popular traditional musical instruments from the state of ______.", o: ["Gujarat", "Himachal Pradesh", "Haryana", "Rajasthan"], a: 1, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "What was the percentage of land revenue taken as tax in 'Sardeshmukhi' in the Maratha Empire?", o: ["1-2 per cent", "40-50 per cent", "25-30 per cent", "9-10 per cent"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which one of the following terms was unveiled by the Economic Survey of India 2020 meaning a study of what a common person pays for a food platter across India?", o: ["Thalinomics", "Thalism", "Thalitus", "Thalimania"], a: 0, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "In which year was the Farmers (Empowerment and Protection) Agreement on Price Assurance and Farm Services Ordinance passed?", o: ["2017", "2014", "2016", "2020"], a: 3, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which state of India is the first one to launch the 'Garbage Café'?", o: ["Maharashtra", "Gujarat", "Chhattisgarh", "Madhya Pradesh"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Janapada Geete, which includes the vachanas of Basavanna, is folk music from the Indian state of ______.", o: ["Goa", "Telangana", "Karnataka", "Kerala"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Which of the following was the last dynasty to rule over Gujarat before it passed on to the hands of Ala-ud-din Khilji, Sultan of Delhi?", o: ["Vaghela Dynasty", "Gaikwad Dynasty", "Rathode Dynasty", "Scindia Dynasty"], a: 0, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Which Indian among the following was acknowledged as one of the 100 great astrologers in the last 1000 years by the Millennium Book of Prophecy?", o: ["P Khurrana", "Ajai Bhambi", "KN Rao", "Bejan Daruwalla"], a: 3, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "India is the ______ most vulnerable country to climate change, according to a report of German watch in the Climate Risk Index 2020.", o: ["Ninth", "Seventh", "Fifth", "Third"], a: 2, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following states accorded industry status to sports in May 2020?", o: ["Goa", "Haryana", "Mizoram", "Manipur"], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Which state among the following had the highest membership in the Constituent Assembly of India as on 31 December 1947?", o: ["East Punjab", "Madras", "United Provinces", "Bombay"], a: 2, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "In which year was the National Rural Drinking Water Programme (NRDWP) launched by the Government of India?", o: ["2011", "2001", "2009", "2003"], a: 2, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "In which of the following places in Orissa will you find the cave architecture of the pre- historic times?", o: ["Sisupalgarh", "Barbil", "Baripada", "Jatni"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Where is the IPL 2020 taking place between 19 September and 10 November 2020?", o: ["UAE", "Bangladesh", "Sri Lanka", "Egypt"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Who is the author of the book 'The Inheritance of Loss'?", o: ["Kiran Desai", "Nayantara Sahgal", "Jhumpa Lahiri", "Anita Nair"], a: 0, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Who among the following headed the 'Fundamental Rights Sub-Committee' in the Constituent Assembly in 1946?", o: ["JB Kripalani", "Gopinath Bordoloi", "KM Munsi", "GV Mavalankar"], a: 0, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "______ refers to the use of procedures like selective breeding and forced sterilisation in an attempt to improve the genetic purity of the human race.", o: ["Phylogenetics", "Retro genes", "Eugenics", "Spermatogenesis"], a: 2, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "What is the proposed foreign portfolio investor (FPI) limits in corporate bonds as per Budget 2020?", o: ["11 per cent of outstanding stocks", "9 per cent of outstanding stocks", "12 per cent of outstanding stocks", "15 per cent of outstanding stocks"], a: 3, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "The ‘Modhera Dance Festival’ held every year during the third week of January belongs to the state of ______.", o: ["Punjab", "Rajasthan", "Madhya Pradesh", "Gujarat"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "In which state will you find a monument called 'Teen Darwaza'?", o: ["Gujarat", "Uttar Pradesh", "Rajasthan", "Punjab"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "What is the number of days required for registering a property in Mumbai as per the Economic Survey 2020?", o: ["71", "85", "76", "68"], a: 3, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "In which year did the last king of Punjab Maharaja Duleep Singh ascend on the throne of Punjab at 10 years of age?", o: ["1824", "1849", "1836", "1852"], a: 1, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Which of the following politicians of the United Kingdom with Indian roots was appointed UK's Chancellor of the Exchequer in February 2020?", o: ["Navendu Mishra", "Priti Patel", "Rishi Sunak", "Alok Sharma"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "During which times did the Bhakti and Sufi movements take place in India?", o: ["Medieval times", "Modern times", "Ancient times", "Postmodern times"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "What is India's rank in the FIFA Football ranking among Asian countries in December 2019?", o: ["Twenty-first", "Nineteenth", "Thirtieth", "Fifteenth"], a: 1, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Who among the following was the first Indian to be elected the President of the International Hockey Federation in 2016?", o: ["Mushtaque Ahmad", "Pravin Mahajan", "Narinder Batra", "Praful Patel"], a: 2, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "In a code language, 'FROM' is written as 'UILN'. How will 'SILICA' be written in that language?", o: ["HRORXZ", "HQOQXZ", "GSLSYB", "GRORWZ"], a: 0, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n8, 4, 4, 6, 12, ?", o: ["24", "30", "29", "62"], a: 1, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s1-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n255, 130, ?, 167, 175, 174", o: ["194", "188", "157", "161"], a: 0, e: "", qimg: "" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s1-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\nFood : Energy :: Meditation : ?", o: ["Relaxation", "Lawn", "Teacher", "Human body"], a: 0, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s1-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s1-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "02dec2020-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s1-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Three of the following four letter-clusters are alike in a certain way and one is different. Pick the odd one out.", o: ["IFCZ", "NKHE", "DAXU", "WTQM"], a: 3, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s1-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n14 : 81 :: 18 : ?", o: ["289", "169", "136", "196"], a: 1, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s1-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "02dec2020-s1-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s1-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "A bicycle is sold at ₹53,760 with a profit of 12%. At what price did the seller buy the bicycle?", o: ["₹44,000", "₹40,600", "₹48,000", "₹42,000"], a: 2, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct?\n12 ÷ 6 + 24 × 3 − 8 = 72", o: ["× and −", "− and +", "÷ and ×", "+ and ÷"], a: 2, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "02dec2020-s1-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "02dec2020-s1-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "The length of the minute hand of a clock is 10.5 cm. What is the area (in cm²) swept by the minute hand in 10 minutes? (Use π=22/7)", o: ["60", "52.25", "50", "57.75"], a: 3, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "The salary of a typist was at first raised by 20% and then it was reduced by 5%. He presently draws ₹17,100. What was his original salary (in ₹)?", o: ["12,500", "17,500", "16,000", "15,000"], a: 3, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "A 5-m-deep cylindrical pit having a radius of 1.4 m is dug in a field. The earth so dug out is used to raise a platform of 10 m × 8 m. What is the height of the platform (in cm)? (Use π=22/7)", o: ["38.5", "7.7", "137.5", "30"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "An article is sold for ₹796.875, after allowing two successive discounts of 15% and 25%. The cost price of the article is ₹1,000. If it is sold at the marked price, then what is the gain percentage?", o: ["22.5%", "20%", "27.5%", "25%"], a: 3, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "There are 200 questions in a competitive examination. Savita answered 70% of the first 150 questions correctly. What percentage of the other 50 questions should she answer correctly for her grade in the entire exam to be 60%?", o: ["30%", "25%", "35%", "40%"], a: 0, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "10 men can finish a piece of work in 10 days, whereas it takes 12 women to finish it in 10 days. If 8 men and 6 women undertake to complete the work, then in how many days will they complete it?", o: ["8 9/13", "6 9/13", "5 9/13", "7 9/13"], a: 3, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A positive number which when increased by 17 is equal to 84 times the reciprocal of the number. The number is:", o: ["4", "5", "6", "3"], a: 0, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A person invested one-third of his money at 3 1/2 %, one-fourth of his money at 7 1/2 %, and the remaining at 8% per annum simple interest. If his yearly simple interest is ₹1,479, then what is the sum invested (in ₹)?", o: ["22,300", "23,200", "21,500", "24,500"], a: 1, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Mrs. Sharma bought 7.35 m of fabric for her elder daughter, 6.75 m for the younger daughter, 8.57 m for her husband, and 7.83 m for herself. How much dress material (in m) did she buy in total?", o: ["29.7", "30.5", "27", "32.5"], a: 1, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "A person spends ₹11,000 in buying some cupboards at ₹1,000 each and some chairs at ₹300 each. He purchased both the items. What is the ratio of the number of cupboards to that of the chairs when the maximum possible number of chairs are purchased?", o: ["1 : 10", "1 : 15", "2 : 5", "3 : 10"], a: 1, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper buys 50 kg of sugar from a dealer, keeps 5 kg for his own use, and tries to sell the rest at a certain fixed price. He sells 15 kg at that fixed price. Then, he offers a discount of 10% and sells 10 kg at this discounted price. Finally, he offers an additional 25% discount over the discounted price and manages to sell all the sugar he had left with him. He gets a total of ₹1,875 after selling the sugar and makes an overall profit of 20%. If he could have sold the entire 50 kg sugar at its original fixed price without any discount, then what would have been his profit percentage?", o: ["50%", "65%", "60%", "45%"], a: 2, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "A man decides to pave, with square tiles of the same size, the floor of his hall which is 4.83 metres long and 5.67 metres wide. What is the side of the largest possible tile (in cm)?", o: ["21", "42", "27", "23"], a: 0, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "In a class, there are 48 students (boys and girls). The average weight of 32 boys in the class is 50.25 kg and that of the girls is 45.15 kg. What is the average weight (in kg) of the class?", o: ["48.55", "47.65", "49.67", "50.23"], a: 0, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "What will be the amount after 2 years, if a sum of ₹2,200 is invested at 12% per annum compound interest, compounded half-yearly (correct to two decimal places)?", o: ["₹2,766.18", "₹2,733.45", "₹2,777.45", "₹2,755.76"], a: 2, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "A car runs for 11 hours. For the first 100 km, the car runs with a certain speed and then it increases its speed by 15 km/h to cover the remaining 280 km. How much time (in hours) does it take to cover the first 100 km?", o: ["5", "7", "3", "4"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "In MS Word, which of the following keyboard shortcuts should be used to align a paragraph in the centre?", o: ["Ctrl + J", "Ctrl + C", "Alt + C", "Ctrl + E"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "What is the default horizontal alignment of text in the cell of an MS Excel worksheet?", o: ["Right", "Centre", "Left", "Top"], a: 2, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "What will be the result of the given MS Excel formula? =4^2^3", o: ["8", "4096", "6561", "24"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "When you send an email which of the following fields should contain your email address?", o: ["From", "To", "Bcc", "Cc"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "What will happen when you select a cell of an MS Excel worksheet and press the 'F2' key?", o: ["The content of the cell will be deleted.", "The background colour of the cell will be changed.", "The font colour of the content of the cell will be changed.", "The cell will switch to editing mode so that its content can be modified."], a: 3, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following features is used to type very small letters or numbers just above the line of text?", o: ["Subscript", "Superscript", "Strikethrough", "Format painter"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "TCP/IP is the most popular internet protocol. What is the full form of TCP?", o: ["Transmission Carrying Progress", "Transmission Carrying Protocol", "Transmission Control Protocol", "Transition Control Protocol"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "What is the keyboard shortcut to cut selected text in MS Word?", o: ["Alt + Ctrl + C", "Ctrl + C", "Ctrl + X", "Alt + X"], a: 2, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts is used to add a bookmark of the page currently opened in a Chrome browser?", o: ["Alt + B", "Ctrl + M", "Ctrl + B", "Ctrl + D"], a: 3, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following statements is/are FALSE? (i) In MS Word, the same paragraph can have both, left as well as right alignment. (ii) In MS Word, a paragraph is created by pressing Ctrl + Enter.", o: ["(i) only", "Neither (i) nor (ii)", "Both (i) and (ii)", "(ii) only"], a: 2, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 02 Dec 2020 Shift-1";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 02 Dec 2020 Shift-1", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
