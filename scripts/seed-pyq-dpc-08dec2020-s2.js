/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 08 Dec 2020 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc08_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-08dec2020-s2';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 08 Dec 2020 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Which of the following rivers has Musi river as one of its tributaries?", o: ["Kaveri", "Mahanadi", "Tapi", "Krishna"], a: 3, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Antibiotics are NOT effective on a virus as it lacks ______.", o: ["cilia", "plasmid", "genetic material", "cell wall"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "When a body rolls over the surface of another body, the resistance to its motion is called ______.", o: ["drag", "fluid friction", "sliding friction", "rolling friction"], a: 3, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "India secured ______ place in the World Competitiveness Index released in June 2020.", o: ["43rd", "38th", "49th", "32nd"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "In which of the following years did Razia become the Sultan of Delhi?", o: ["1232", "1238", "1234", "1236"], a: 3, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Which of the following statements is NOT true about Ashokan pillars?", o: ["These are said to be monolithic pillars.", "Ashoka got the inspiration for such pillars from his father Bindusar.", "These were usually made of sandstone.", "These are mostly polished pillars."], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Which of the following sultans of Delhi was the first one to start military campaigns in southern India?", o: ["Iltutmish", "Qutbuddin Aybak", "Alauddin Khalji", "Balban"], a: 2, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Which of the following Articles was deleted by the Constitution (Forty-Fourth Amendment) Act, 1978?", o: ["Article 31", "Article 29", "Article 27", "Article 25"], a: 0, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which of the following subjects is NOT listed in the Union List in the Seventh Schedule of the Constitution of India?", o: ["Insurance", "Railways", "Corporation tax", "Public health and sanitation"], a: 3, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which of the following statements about the 'pro tem' Speaker of the House of Representatives in India is correct?", o: ["The name for the post is recommended by the outgoing Speaker of the House of Representatives.", "He is appointed by the President of India.", "The name for the post is recommended by the Union Cabinet.", "The name for the post is recommended by the Leader of Opposition in the House of Representatives."], a: 1, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which of the following states is a leading producer of natural rubber?", o: ["Andhra Pradesh", "Madhya Pradesh", "Kerala", "Maharashtra"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Who among the following rulers of Magadha is said to have sent his minister named Vassakara to seek advice of Buddha on how to defeat the Vajjis?", o: ["Bimbisara", "Bindusara", "Shishunag", "Ajatashatru"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Fakhr-i-Mudabbir, who was a contemporary of Delhi's Sultan Iltutmish, was a renowned:", o: ["historian", "sufi saint", "economist", "warrior"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which of the following river systems has a river named Lohit as one of its components?", o: ["Ganga", "Narmada", "Brahmaputra", "Godavari"], a: 2, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "In which of the following states is Pachpadra lake located?", o: ["Madhya Pradesh", "Rajasthan", "Tamil Nadu", "Odisha"], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "With which of the following states is the tribal festival named 'Samakka Saarakka Jaathara' traditionally associated?", o: ["Tripura", "Tamil Nadu", "Kerala", "Telangana"], a: 3, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Which of the following regions of India witnessed the rule of a female ruler named Didda in the late 10th century?", o: ["Kashmir", "Kalinga", "Andhra", "Banga"], a: 0, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Who among the following is the author of the book titled 'How to Avoid a Climate Disaster: The Solutions We Have and the Breakthroughs We Need'?", o: ["Al Gore", "Bill Gates", "RK Pachauri", "Greta Thunberg"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "The cricketer Stuart Broad is a player of the ______ cricket team.", o: ["South African", "England", "New Zealand", "West Indies"], a: 1, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Which of the following Acts introduced Provincial Autonomy during British rule in India?", o: ["Indian Councils Act, 1861", "Indian Councils Act, 1909", "Indian Councils Act, 1892", "Government of India Act, 1935"], a: 3, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Abdul Hamid Lahori's work titled 'Badshah Nama' is the official history of his patron:", o: ["Shah Jahan", "Jahangir", "Humayun", "Aurangzeb"], a: 0, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "When a chemical, which is basic in nature, is treated with turmeric paste, it turns ______ in colour.", o: ["yellow", "red", "black", "green"], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Which of the following pairs of schemes was announced in the Union Budget 2020-21 for a seamless national cold supply chain for perishables?", o: ["Kisan Mitra and Kisan Saathi", "Krishi Udyam and Krishi Saksham", "Krishi Bhandar and Krishi Sewa", "Kisan Rail and Krishi Udaan"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "According to the ‘World Investment Report 2020’ by the UN Conference on Trade and Development (UNCTAD), India was the ______ largest recipient of Foreign Direct Investment in 2019.", o: ["13th", "9th", "7th", "11th"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "In which of the following pair of states is Buckingham canal spread?", o: ["Tamil Nadu and Andhra Pradesh", "Karnataka and Kerala", "Kerala and Tamil Nadu", "Andhra Pradesh and Odisha"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "In which of the following Olympics did Abhinav Bindra win a gold medal for India?", o: ["Beijing 2008", "Athens 2004", "London 2012", "Sydney 2000"], a: 0, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Who among the following sportspersons has NEVER bagged an Olympic medal?", o: ["Gagan Narang", "Sania Mirza", "Vijay Kumar", "Vijender Singh"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Which of the following states has been the permanent host of the International Film Festival since 2004?", o: ["Maharashtra", "Kerala", "Gujarat", "Goa"], a: 3, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "As per the Union Budget 2020-21, what was the disinvestment target of the Union Government for the year 2020-21?", o: ["₹1.35 lakh crore", "₹1.40 lakh crore", "₹1 lakh crore", "₹1.20 lakh crore"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "वैज्ञानिक पर्किंजे द्वारा निम्नलिखित में से किस शब्दावली का सृजन किया गया था?", o: ["कोशिका (सेल)", "जीवद्रव (प्रोटोप्लाज्म)", "कोशिका द्रव्य (साइटोप्लाज्म)", "लयनकाय (लाइसोसोम)"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "In vertebrates, smooth endoplasmic reticulum plays a crucial role in detoxifying ______ from many drugs.", o: ["small intestine", "liver", "brain", "lungs"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a fundamental duty of the citizens of India as specified in Part IV-A of the constitution of India?", o: ["To renounce practices derogatory to the dignity of women", "To value and preserve the rich heritage of our composite culture", "To pay taxes by due date", "To uphold and protect the sovereignty, unity and integrity of India"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Which of the following is an example of bilaterally symmetrical, triploblastic marine animals that have notochord at some stages during their lives?", o: ["Leech", "Lycopodium", "Herdmania", "Rana tigrina"], a: 2, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "As on 31 August 2020, who was the Leader of the House in Rajya Sabha?", o: ["L Hanumanthaiah", "Thawar Chand Gehlot", "Sambit Patra", "Bhubaneswar Kalita"], a: 1, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "According to the Economic Survey 2020, the livestock sector in India had been growing at a Compound Annual Growth Rate (CAGR) of ______ during the past five years.", o: ["7.9%", "8.2%", "5.3%", "4.4%"], a: 0, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "The folk drama named ‘Therukoothu’ traditionally belongs to:", o: ["Odisha", "Tamil Nadu", "Telangana", "Tripura"], a: 1, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "The movie 'Hellaro', which bagged the Best Feature Film Award at the 66th National Film Awards, is a movie produced in ______ language.", o: ["Marathi", "Gujarati", "Tamil", "Kannada"], a: 1, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "According to the Government of India data, the Foreign Direct Investment (FDI) inflow in India from China during the year 2019-20 was approximately ______ million.", o: ["$164", "$245", "$357", "$270"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Which of the following instruments is Gupta ruler Samudragupta shown playing on his coins?", o: ["Veena", "Mridanga", "Sarangi", "Tabla"], a: 0, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which place did India secure in the Global Real Estate Transparency Index 2020?", o: ["34th", "41st", "17th", "26th"], a: 0, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "The census of which of the following animals in 2018 by India has entered into the Guinness Book of World Records in July 2020 as the largest camera-trap wildlife survey ever conducted?", o: ["Deer", "Cheetah", "Elephant", "Tiger"], a: 3, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "During the 'Age of Mahajanapadas', Ujjain was the capital of ______.", o: ["Kosala", "Magadh", "Avanti", "Panchala"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "How many children received the Pradhan Mantri Rashtriya Bal Puraskar 2020?", o: ["37", "33", "49", "45"], a: 2, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "In the context of the polity during the seventh century, the term 'samanta' meant ______.", o: ["a subordinate ruler", "a finance minister", "a commerce minister", "a royal scribe"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Who among the following will relinquish the post of the Managing Director of HDFC Bank in October 2020?", o: ["Aditya Puri", "Rajnish kumar", "Rakesh Sharma", "AS Rajeev"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "The landform named ‘meander’ is created by a ______.", o: ["volcano", "sea", "river", "wind"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "In the context of ancient India culture, 'panchaytana' refers to:", o: ["a military formation used to surround enemies", "a pattern of defence walls in a city", "a city with five residential complexes", "a style of temple architecture"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "As per the Union Budget 2020, which of the following was NOT a component of the theme titled ‘Aspirational India’?", o: ["Education and skills", "Wellness, water and sanitation", "Agriculture, irrigation and rural development", "Urban rejuvenation"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "The cricketer Roston Chase plays for which of the following countries?", o: ["West Indies", "South Africa", "Australia", "New Zealand"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Of the following Harappan Civilization sites, which one provides the evidence of a large open area with terraced stands, identified as ‘stadium’?", o: ["Kalibangan", "Chanhudaro", "Mohanjodaro", "Dholavira"], a: 3, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "08dec2020-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "08dec2020-s2-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "08dec2020-s2-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "08dec2020-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "08dec2020-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nBats : Screech : : Kangaroos : ?", o: ["Chatter", "Snort", "Chortle", "Whoop"], a: 2, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "08dec2020-s2-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "08dec2020-s2-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "08dec2020-s2-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "08dec2020-s2-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "08dec2020-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct?\n7 × 96 ÷ 8 + 39 − 25 = 70", o: ["× and ÷", "+ and −", "+ and ÷", "× and −"], a: 1, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "08dec2020-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n3, 15, 38, 78, 141, 235, 370, 552, ?", o: ["893", "792", "892", "793"], a: 3, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n6 : 24 :: 14 : ?", o: ["121", "76", "65", "112"], a: 3, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "नीचे दिए गए चार शब्दों में से तीन एक निश्चित प्रकार से समान हैं और एक भिन्न है। उस भिन्न विकल्प का चयन करें।", o: ["कलह (Discord)", "सामंजस्य (Harmony)", "उथल-पुथल (Turmoil)", "अराजकता (Chaos)"], a: 1, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "08dec2020-s2-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "08dec2020-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "08dec2020-s2-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n11, 17, 28, 51, 96, 187, 368, ?", o: ["792", "713", "731", "729"], a: 2, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "If VERSION is coded as 1712121621225 and TEARFUL is coded as 15189154223, then how will LOCALITY be coded?", o: ["1231511292025", "281769401215", "1215311292025", "281712940189"], a: 3, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Aravind and Biswanath start at the same time from their hostel and go to the ground with speeds of 30 km/h and 60 km/h, respectively. If Aravind takes 20 minutes longer than Biswanath to reach the ground, then find the distance between their hostel and the ground.", o: ["28 km", "34 km", "40 km", "20 km"], a: 3, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "08dec2020-s2-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following set.\n(11, 19 ,59)", o: ["(4, 5, 13)", "(7, 16, 53)", "(8, 13, 41)", "(9, 15, 43)"], a: 2, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "08dec2020-s2-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A solid metallic sphere of radius 8 cm is converted into a solid right circular cylinder of radius x cm. If the height of the cylinder is 3 times the radius of the sphere, then the value of x is:", o: ["5⁴⁄₅", "6²⁄₃", "3¹⁄₅", "5¹⁄₃"], a: 3, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "If a, b and c are positive numbers such that (a² + b²) : (b² + c²) : (c² + a²) = 34 : 61 : 45, then a : b : c = ?", o: ["6 : 3 : 5", "5 : 3 : 6", "3 : 5 : 6", "3 : 6 : 5"], a: 2, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "In a test, the average score of 52 students is 45. If the highest and the lowest scores (got by only one-one student) are excluded, the average score of the remaining students would decrease by 1. What is the average score of the highest and the lowest scores?", o: ["64", "65", "68", "70"], a: 3, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "A certain sum amounts to ₹9,900 in 4 years and to ₹11,700 in 7 years at the same rate per cent per annum at simple interest. What will be the amount of the same sum at 8²⁄₃% for 2¹⁄₄ years at simple interest?", o: ["₹8,924", "₹8,952.75", "₹8,904", "₹8,962.50"], a: 3, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "If 80% of 50% of A is equal to three times 25% of B, then A is what percentage more or less than B?", o: ["46.7% more", "87.5% less", "87.5% more", "46.7% less"], a: 2, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "A certain sum amounts to ₹12,705 in 2¹⁄₂ years at 10% p.a. interest compounded annually. What is the compound interest on the same sum for one year at the same rate, if the interest is compounded half-yearly?", o: ["₹1,025", "₹1,100", "₹1,050", "₹1,000"], a: 0, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A circle is inscribed in an equilateral triangle of side 30 cm. What is the area of the circle (in cm²)?", o: ["60 π", "45 π", "50 π", "75 π"], a: 3, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "The marked price of an article is 25% above its cost price. If it is sold for ₹480 after a discount of ₹60, then the profit percentage is (correct to one decimal place):", o: ["11.1", "12.4", "10.8", "12.8"], a: 0, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "The value of 1¹⁄₆ ÷ ²⁄₃ of ⁷⁄₈ − ⁷⁄₈ ÷ ⁵⁄₆ × ⁵⁄₂₄ − (0.6̅5 ÷ ̃59) × 1¹⁄₁₁ is:", o: ["¹¹⁄₁₆", "⁵⁷⁄₃₂", "⁹⁄₈", "⁹³⁄₁₆₀"], a: 3, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "When a number is divided by 4, 5, 6 and 9, the remainder in each case is 3. If the number is the smallest 4-digit number, then what is the sum of the digits of the number?", o: ["13", "10", "12", "11"], a: 2, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "In an examination, the number of students that appeared from school A is 20% more than the number of students that appeared from school B. 75% of the students from school B passed. If the total number of students that passed from both schools is 80% more than the number of students that passed from school B, then the percentage of students that passed from school A to those who appeared from school A is:", o: ["50", "60", "64", "54"], a: 0, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "A completes two-third part of a work in 16 days, and the remaining work is completed by B alone. The entire work is completed in 21 days. A and B together will complete 65% of the same work in:", o: ["5 days", "6 days", "8 days", "4 days"], a: 1, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Sumit sells an article at a certain price. Had he sold it at four-fifth of that selling price, he would have lost 10%. If he sells it for 95% of the original selling price, then the gain percentage will be:", o: ["6⁸⁄₉", "6⁷⁄₈", "6¹⁄₉", "6¹⁄₈"], a: 1, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "Two trains X and Y start at the same time, X from station A to B and Y from B to A. After passing each other, X and Y take 8²⁄₅ hours and 4²⁄₇ hours, respectively, to reach their respective destinations. If the speed of X is 50 km/h, then what is the speed (in km/h) of Y?", o: ["84", "56", "63", "70"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "The units digit of a 2-digit number exceeds the tens digit by 3, and the product of the given number and the sum of its digits is 324. The number lies between:", o: ["30 and 35", "45 and 50", "35 and 40", "40 and 45"], a: 2, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following tools can be used to apply the font color and size of a text to multiple pieces of text in MS-Word?", o: ["Eraser", "Replace", "Show/Hide button", "Format Painter"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following characters must be a part of an email id?", o: ["Dot (.)", "Dollar ($)", "Ampersand (&)", "At the rate (@)"], a: 3, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a word processing software?", o: ["MS-Excel", "MS-Word", "WordPad", "Notepad"], a: 0, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "What is the value of the following MS-Excel formula? =MOD(11, 3)", o: ["3", "4", "5", "2"], a: 3, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "A collection of related web pages is called:", o: ["client", "search engine", "server", "website"], a: 3, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "In an MS-Excel worksheet, the \"zoom\" bar appears at the ______ portion of the worksheet.", o: ["top-right", "top-left", "bottom-right", "bottom-left"], a: 2, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "What does the term URL mean?", o: ["Uniform Resource Locator", "Unidentified Resource Locator", "Universal Resource Line", "Unique Reference Line"], a: 0, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following statements is/are FALSE? (i) In MS-Word, different letters of a word cannot be of different font-colors. (ii) In MS-Word, the Show/Hide command button can be used to display paragraph marks in a document.", o: ["Only ii", "Neither i nor ii", "Both i and ii", "Only i"], a: 3, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following steps can be performed to edit the content of a cell in an MS-Excel worksheet?", o: ["Left-click on the cell once", "Double-click on the cell", "Select the cell and press ENTER key", "Right-click on the cell"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "What is the keyboard shortcut to open a new document in MS-Word?", o: ["Alt + N", "Ctrl + O", "Ctrl + N", "Ctrl + W"], a: 2, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 08 Dec 2020 Shift-2";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 08 Dec 2020 Shift-2", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
