/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 03 Dec 2020 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc03_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-03dec2020-s2';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 03 Dec 2020 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "'Samaveda’ is considered to be one of the primary sources of Indian ______.", o: ["coinage", "textile design", "medicine", "music and art"], a: 3, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Which of the following places is associated with the tomb of Jahangir?", o: ["Karachi", "Agra", "Lahore", "Delhi"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Digboi Oil Refinery, commissioned on 11th December 1901, is India's oldest operating refinery and one of the oldest operating refineries in the world. It is located in ______.", o: ["Assam", "Gujarat", "Odisha", "Uttar Pradesh"], a: 0, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Which of the following statements is correct regarding the term 'pietra - dura'?", o: ["It was a technique for the inlay of precious stones and gems into stone walls.", "It was a style of gardening.", "It was a form of Hindustani classical music played in the courts of Delhi Sultans.", "It was a type of painting style carried out on palm leaves."], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Which of the following pairs is INCORRECTLY matched?", o: ["Kuka movement – Assam", "Moplah rebellions – Malabar", "Polygar rebellions – Kurnool", "Faraizi movement – Bengal"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "The cheque number of a bank in India consists of ______ digits as of August 2020.", o: ["five", "eight", "six", "seven"], a: 2, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "With which of the following soils are the terms 'khadar' and 'bhangar' associated?", o: ["Laterite", "Alluvial", "Black", "Arid"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Which of the following pairs is INCORRECTLY matched?", o: ["Konark - Odisha", "Bhimbetka - Chhattisgarh", "Hampi - Karnataka", "Fatehpur Sikri - Uttar Pradesh"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "A glucometer is generally used as a monitor by a ______ patient.", o: ["hypoglycemic", "obstetric", "neurological", "hepatitis-B"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "______ is an instrument for measuring the relative humidity of the atmosphere.", o: ["Hygrometer", "Barometer", "Hydrometer", "Anemometer"], a: 0, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which of the followings was NOT built during the Tughlaq period?", o: ["Jama Masjid", "Tughlaqabad", "Feroz Shah Kotla", "Khirki Masjid"], a: 0, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "As of August 2020, who among the following is NOT an incumbent nominated member to the Rajya Sabha?", o: ["Sonal Mansingh", "Roopa Ganguly", "Jaya Bachchan", "Subramanian Swamy"], a: 2, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "As of August 2020, which of the following pairs is correct with reference to the administration of the Union Territories of India?", o: ["Ladakh – Anil Baijal", "Andaman and Nicobar Island – Dineshwar Sharma", "Delhi (NCT) – Praful Patel", "Jammu and Kashmir – Manoj Sinha"], a: 3, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "In September 2020, who among the following assumed charge as the Election Commissioner of India?", o: ["Rajiv Kumar", "Arvind Pangaria", "Amitabh Kant", "Bibek Debroy"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "In September 2020, the Reserve Bank of India decided to introduce the 'positive pay system' from 1 January 2021 for cheques, under which re-confirmation of key details may be needed for payments beyond ______.", o: ["₹50,000", "₹75,000", "₹55,000", "₹60,000"], a: 0, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "India's rank in the Global Innovation Index 2020 is ______.", o: ["52nd", "87th", "63rd", "48th"], a: 3, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "With reference to Indian music, which of the following is NOT a 'Raga'?", o: ["Poorvi", "Shringara", "Hindol", "Bhairavi"], a: 1, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "How many times has the Indian Men's Cricket team entered the ODI World Cup semi-finals till 2019?", o: ["Seven", "Five", "Eight", "Six"], a: 0, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "______ is an equatorial belt of low atmospheric pressure where the trade winds converge.", o: ["Moraine", "La Nina", "El Nino", "Doldrums"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "In which year were the Commonwealth Games held in New Delhi?", o: ["2010", "2006", "2012", "2018"], a: 0, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Intensified Mission Indradhanush (IMI) 2.0 is a scheme launched by the Government of India to improve coverage in areas with low ______.", o: ["nutrition", "digitisation", "immunisation", "education"], a: 2, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "The Thumba Equatorial Rocket Launching Station (TERLS) is located near ______.", o: ["Somnath", "Thiruvananthapuram", "Sriharikota", "Chandipur"], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "The 11th Five-Year Plan ended in the year ______.", o: ["2010", "2011", "2013", "2012"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "The Vyas Samman, started in 1991 is given for 'outstanding literary work' in ______.", o: ["Rajasthani", "Hindi", "Sanskrit", "Konkani"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Which of the following pairs is INCORRECT?", o: ["Kylian Mbappé – France", "Paolo Rossi – Spain", "Pele – Brazil", "Diego Maradona – Argentina"], a: 1, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Who among the following is the author of the book 'The Shadow Lines'?", o: ["Ravish Kumar", "Amitav Ghosh", "Amish Tripathi", "Arundhati Roy"], a: 1, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Pranab Mukherjee, who passed away in August 2020, served as the ______ President of India.", o: ["14th", "13th", "11th", "12th"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "National Human Rights Commission of India is an independent statutory body established on 12 October ______.", o: ["2002", "1993", "1996", "1999"], a: 1, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which of the following books was NOT written by MK Gandhi?", o: ["Golden Threshold", "India of My Dreams", "Indian Home Rule", "Nature Cure"], a: 0, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "In the context of economic system of Mughal Empire, the term 'Polaj' referred to ______.", o: ["cash payment", "annually cultivated land", "a type of coin introduced by Akbar", "a kind of tax"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "The dancing girl statue of Mohenjodaro was made of:", o: ["silver", "gold", "iron", "bronze"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "‘Operation Greens’ was announced in the budget speech of ______ with an outlay of ₹500 crore to stabilise the supply of tomato, onion and potato (TOP) crops and to ensure availability of TOP crops throughout the country round the year without price volatility.", o: ["2015-16", "2017-18", "2020-21", "2018-19"], a: 3, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Nephritis is a medical condition that affects the ______.", o: ["kidney", "heart", "brain", "muscle joints"], a: 0, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Part ______ of the Constitution of India deals with the organisation, composition, duration, officers, procedures, privileges, powers and so on of the Parliament.", o: ["VIII", "VI", "V", "VII"], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Who among the following was conferred the Shanti Swarup Bhatnagar Prize for Science and Technology, 2020 under the category of ‘Earth, Atmosphere, Ocean and Planetary Sciences’?", o: ["Subhadeep Chatterjee", "Vatsala Thirumalai", "Subi Jacob George", "Abhijit Mukherjee"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "In which year did the Government of India start the Central Rural Sanitation Programme?", o: ["1986", "1992", "1989", "2014"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "In a photovoltaic cell which type of energy gets converted into electrical energy?", o: ["Chemical", "Light", "Sound", "Magnetic"], a: 1, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "In which of the following places is the Agrasen ki Baoli, the historical step well located?", o: ["Chennai", "Chandigarh", "Kolkata", "Delhi"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "The Sharqi style of architecture belonged to the modern state of:", o: ["Telangana", "Punjab", "Uttar Pradesh", "Himachal Pradesh"], a: 2, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "In the context of retirement benefits and related issues of an employee in India, what does EPFO stand for?", o: ["Extensive Pension Funding Ombudsman", "Employees' Provident Fund Organisation", "Employees' Privilege Financial Operation", "Employees' Pension Fixation Organization"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Which of the following events was one of the important reasons for the Swadeshi Movement of 1905?", o: ["Passing of Rowlatt Act", "Partition of Bengal", "Formation of Muslim League", "Formation of Indian National Congress"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "The YONO (You Only Need One) app is an integrated digital banking platform offered by ______ to enable its users to access a variety of financial services.", o: ["HDFC", "Punjab National Bank", "ICICI", "State Bank of India"], a: 3, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Which of the following is a mountain peak of the Eastern Ghats?", o: ["Annapurna", "Deomali", "Doddabetta", "Devimala"], a: 1, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "The ______ Committee is related to electoral reforms in India.", o: ["Bimal Jalan", "Indrajit Gupta", "Balwantrai Mehta", "Kothari"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "In Geography, the feature of 'meander' is primarily associated with which of the following options?", o: ["River", "Peak", "Pond", "Cliff"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "What is the total regulation time duration (in minutes) of any international football match going to extra-time?", o: ["120", "90", "100", "150"], a: 0, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "The base rate is the minimum interest rate of a bank below which it is NOT permissible to lend, except in some cases if allowed by the ______.", o: ["NITI Aayog", "Reserve Bank of India", "CAG", "Supreme Court"], a: 1, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Which of the following pairs is correctly matched?", o: ["Fourth Buddhist Council – Rajgriha", "First Buddhist Council – Kashmir", "Second Buddhist Council – Viratnagar", "Third Buddhist Council – Pataliputra"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "The Bahujan Samaj Party was formed in 1984 under the leadership of ______.", o: ["Vijay Bahuguna", "Mayawati", "Kanshi Ram", "Anil Agrawal"], a: 2, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Zika virus disease is caused by a virus transmitted primarily by ______.", o: ["Rodents", "Aedes mosquitoes", "Dogs", "Uranotaenia mosquitoes"], a: 1, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "03dec2020-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n97, 98, 106, 133, 197, ?", o: ["322", "267", "406", "220"], a: 0, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "03dec2020-s2-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "03dec2020-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "03dec2020-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct?\n86 + 5 − 42 ÷ 28 × 14 = 7", o: ["÷ and −", "× and +", "× and −", "× and ÷"], a: 3, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Ravindra pays ₹4,160 as one year's interest for the amount he borrowed from his friend at the interest rate of 8% per annum. How much money did Ravindra borrow from his friend?", o: ["₹60,400", "₹50,000", "₹52,000", "₹48,000"], a: 2, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "03dec2020-s2-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "03dec2020-s2-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term.\nBrazil : South America :: Sri Lanka : ?", o: ["Country", "Capital", "Asia", "Australia"], a: 2, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "03dec2020-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "03dec2020-s2-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "03dec2020-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "03dec2020-s2-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "03dec2020-s2-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n5573 : 20 :: 8991 : ?", o: ["52", "37", "27", "90"], a: 2, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "In a code language, 'DYNASTY' is written as 'NYDAYTS'. How will 'RESPOND' be written in that language?", o: ["SRENPOD", "TESPDNO", "SERPDNO", "SERQDMO"], a: 2, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "03dec2020-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "03dec2020-s2-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Three of the following four letter-clusters are alike in a certain way and one is different. Pick the odd one out.", o: ["HEA", "LIF", "TQM", "KHD"], a: 1, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n14, 17, 68, 73, 438, ?", o: ["876", "166", "405", "445"], a: 3, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "03dec2020-s2-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "03dec2020-s2-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "03dec2020-s2-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "03dec2020-s2-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "The length of a rectangular plot is 15 m more than its breadth. If the cost of fencing the plot at the rate of ₹16.50 per m is ₹4,950, then what is the length of the plot (in m)?", o: ["82.5", "75", "60", "67.5"], a: 0, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "A man travelled the first part of his journey at 160 km/h and the second part at 240 km/h, and covered a total distance of 3840 km to his destination in 20 hours. How long, in hours, did the second part of his journey last?", o: ["8", "10", "12", "15"], a: 0, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "The smallest number which when divided by 12, 10 and 11 leave remainders 11, 9 and 10, respectively, is:", o: ["331", "659", "661", "329"], a: 1, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "A and B each borrowed equal sums for 3 years at a rate of 5% simple and compound interest compounded annually, respectively. At the time of payment, B had to pay ₹427 more than A. The sum borrowed and the interest paid by B (in ₹) were:", o: ["₹56,000; ₹8,400", "₹48,000; ₹7,200", "₹48,000; ₹7,566", "₹56,000; ₹8,827"], a: 3, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "A vendor bought two varieties of tea, brand A and brand B, costing ₹15 per 100 g and ₹18 per 100 g, respectively, and mixed them in a certain ratio. Then, he sold the mixture at ₹20 per 100 g, making a profit of 20%. What was the ratio of brand A to brand B tea in the mixture?", o: ["4 : 5", "1 : 2", "3 : 4", "2 : 3"], a: 0, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "An open cuboidal cistern is externally 1.6 m long, 1.3 m wide and 53 cm high. Its capacity is 900 litres and its walls are 5 cm thick. The thickness (in cm) of the bottom is:", o: ["4", "3", "5", "2"], a: 1, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper bought 1000 kg of rice, a part of which was sold at a 10% profit and the remaining at a 20% loss; a loss of 11% was incurred on the whole transaction. What was the quantity (in kg) of rice that was sold at a 20% loss?", o: ["600", "500", "300", "700"], a: 3, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "If A's income is 35% more than B's income, then by what percentage is B's income less than A's income (correct to the nearest integer)?", o: ["26%", "19%", "35%", "17%"], a: 0, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "A tank full of petrol in a motorcycle lasts for 30 days. If a rider starts using 20% more petrol every day, then for how many days will the tank full of petrol last?", o: ["25", "18", "10", "20"], a: 0, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "A can do a piece of work in 45 days. He works for 30 days and leaves. If B completes the remaining work in 5 days, then in how many days can B alone complete the entire work?", o: ["10", "15", "18", "12"], a: 1, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "2 years ago, the average age of a family of 5 members was 18 years. After a new member is added to the family, the average age of the family is still the same. The present age of the newly added member, in years, is:", o: ["8", "6", "10", "5"], a: 0, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "An amount of ₹43,892 is lent to each of two persons for 3 years. One at the rate of 30% simple interest and the other at the rate of 30% compound interest, compounded annually. By what percentage will the simple interest be less than the compound interest received in this 3-year duration (correct to one decimal place)?", o: ["24.8%", "23.8%", "22.7%", "25.7%"], a: 0, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "The sum of two numbers is 26 and their difference is 14. If three times the larger number is divided by the smaller number, then the quotient is:", o: ["11", "12", "10", "9"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "The marked price of an article is ₹5000. Three successive discounts of 15%, 10% and 18%, are given on its marked price. The selling price (in ₹) of the article is:", o: ["3136.5", "3250", "3000", "3362.75"], a: 0, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Which of the following fractions is the smallest?\n11/12, 13/14, 12/13, 15/16, 19/20", o: ["13/14", "15/16", "19/20", "11/12"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following displays both the name of the application and the name of the spreadsheet in MS-Excel?", o: ["Title bar", "Tool bar", "Task bar", "Menu bar"], a: 0, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following is FALSE with reference to cell editing in MS-Excel?", o: ["Select the cell, click on the formula bar and edit the content", "Edit the cell by double clicking the cell where the content is located", "Select the cell and press the F2 function key on the keyboard to edit the content of the cell", "Select the cell and press the F5 function key on the keyboard to edit the content of the cell"], a: 3, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following can be used to change the width of the columns in a table in MS- Word?", o: ["Insert", "Translate", "Define", "Table properties"], a: 3, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following is the full form of 'CC', a field of E-mail header?", o: ["Continuous copy", "Carbon copy", "Character copy", "Control copy"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which of the following shortcuts is used to select a sentence in a paragraph in MS-Word?", o: ["Alt+click on a sentence to select it", "Triple-click on a sentence to select it", "Ctrl+click on a sentence to select it", "Double-click on a sentence to select it"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a feature of internet?", o: ["Flexibility of communication", "Accessibility", "High cost", "Ease of use"], a: 2, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "The 'LEN' function in MS-Excel belongs to which of the following categories?", o: ["Financial", "Logical", "Text", "Math & Trig"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Under which of the following menu tabs are Page Setup options usually available in MS- Word 2007?", o: ["Insert", "Page Layout", "Home", "Review"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a search engine?", o: ["Bing", "Ask", "Yahoo", "Safari"], a: 3, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a character formatting option in Ms-Word?", o: ["Font style", "Font", "Size", "Alignment"], a: 3, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 03 Dec 2020 Shift-2";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 03 Dec 2020 Shift-2", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
