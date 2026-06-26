/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 02 Dec 2020 Shift-3
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc02_s3');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-02dec2020-s3';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 02 Dec 2020 Shift-3"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "With which musical instrument was the noted musician Pandit Kishan Maharaj associated?", o: ["Rudra Veena", "Mridangam", "Santoor", "Tabla"], a: 3, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "The Prime Minister and the other Ministers of the Indian Union are appointed by the President under:", o: ["Article 79 of the Constitution of India", "Article 75 of the Constitution of India", "Article 85 of the Constitution of India", "Article 70 of the Constitution of India"], a: 1, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "The Governor of a State may, if he is of the opinion that the Anglo-Indian community needs representation in the Legislative Assembly of the State and is not adequately represented therein, nominate ______ of that community to the Assembly.", o: ["one member", "two members", "three members", "four members"], a: 0, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Who among the following is the only Indian to win an Individual Gold in the Olympics?", o: ["Leander Paes", "Saina Nehwal", "Sushil Kumar", "Abhinav Bindra"], a: 3, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "As per Census 2011, the literacy rate of India is:", o: ["74.04%", "69.04%", "76.04%", "67.04%"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "The Finance Commission is constituted by the President:", o: ["at the expiration of every sixth year", "at the expiration of every tenth year", "at the expiration of every seventh year", "at the expiration of every fifth year"], a: 3, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Name the scientific principle behind the working of optical fibres.", o: ["Total external refraction of light", "Total internal refraction of light", "Total internal reflection of light", "Total external reflection of light"], a: 2, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Which of the following features distinguishes Buddhism from Jainism?", o: ["Non-injury to living beings", "Extreme form of conduct and self-mortification", "Belief in good action", "Rejection of the authority of the Vedas"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Who among the following has been appointed as Chairman of the Telecom Regulatory Authority of India (TRAI) in September 2020?", o: ["Ajay Kumar Bhalla", "PD Vaghela", "Snehlata Shrivastava", "KN Vyas"], a: 1, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "The 2018 edition of the Commonwealth Games was hosted by ______.", o: ["UK", "Pakistan", "Australia", "India"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "In which state is the Sarhul festival celebrated?", o: ["Chhattisgarh", "Gujarat", "Jharkhand", "Assam"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "On which river is the Krishna Raja Sagar Dam built?", o: ["Tungabhadra", "Krishna", "Kali nadi", "Kaveri"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Who among the following was appointed as the Chairman of the International Financial Services Centres Authority (IFSCA) on July 6, 2020?", o: ["Nazir Laway", "Injeti Srinivas", "K.S. Reddy", "Anil Kumar Chawla"], a: 1, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "What is the maximum amount of a loan granted by a scheduled commercial bank that is covered under the Credit Guarantee Fund Scheme for Micro and Small Enterprises?", o: ["Rs. 150 lakh", "Rs. 100 lakh", "Rs. 200 lakh", "Rs. 50 lakh"], a: 2, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Which Indian king issued a silver coin and termed it as Rupiya in the 16 th century?", o: ["Hemu", "Krishnadevaraya", "Sher Shah Suri", "Akbar"], a: 2, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "The Governor of a State holds office during the pleasure of the:", o: ["Prime Minister of India", "President of India", "Vice President of India", "Chief Minister of the concerned State"], a: 1, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "What is the maximum age for joining the Atal Pension Yojana?", o: ["45 years", "50 years", "35 years", "40 years"], a: 3, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Who was the founder of the Vakataka Dynasty in ancient India?", o: ["Sarvasena", "Vindhyasakti", "Pravarasena I", "Rudrasena I"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Who among the following is the author of the book ‘The Art of Living — A Guide to Contentment, Joy and Fulfillment’?", o: ["Dalai Lama", "Kiran Bedi", "NR Narayana Murthy", "Tenzin Geyche Tethong"], a: 0, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Which of the following is a thermosetting plastic?", o: ["Bioplastic", "Bagasse", "Mycotecture", "Bakelite"], a: 3, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "In which state is the Ponung folk dance practised?", o: ["Sikkim", "Manipur", "Assam", "Arunachal Pradesh"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which of the following pass(es) through the Indian mainland? 1. The Tropic of Capricorn 2. The Tropic of Cancer 3. The Equator", o: ["Both 2 and 3", "Only 1", "Only 2", "Both 1 and 2"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "What is the highest rate of Goods and Services Tax (GST) in India?", o: ["28%", "22%", "12%", "18%"], a: 0, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Which of the following statements is true about gases?", o: ["Gases have definite volume but no definite shape", "Gases have definite shape but no definite volume", "Gases neither have definite volume nor definite shape", "Gases have definite volume and definite shape"], a: 2, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "The Indian Administrative Service and the Indian Police Service are deemed to be services created by the Parliament:", o: ["under Article 312", "under Article 301", "under Article 292", "under Article 307"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Who among the following was appointed as the Vice-President of the Asian Development Bank (ADB) for private sector operations and public- private partnerships on July 15, 2020?", o: ["Ashok Lavasa", "Sahil Seth", "Rajiv Kumar", "R Narayanaswamy"], a: 0, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "During whose reign did the Moroccan traveller Ibn Battuta visit India in the 14 th century?", o: ["Mohammad Bin Tughlaq", "Alauddin Khalji", "Jalaluddin Khalji", "Feroz Shah Tughlaq"], a: 0, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "What is the minimum amount of bank loan granted under the Stand-Up India scheme of the Government of India?", o: ["Rs. 20 lakh", "Rs. 5 lakh", "Rs. 10 lakh", "Rs. 2 lakh"], a: 2, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "In which year was the Battle of Talikota fought between the Vijayanagara Empire and the Deccan sultanates?", o: ["1561 AD", "1556 AD", "1565 AD", "1575 AD"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Who among the following formally stepped down as International Cricket Council (ICC) Chairman on July 1, 2020, after leading the governing body of the international cricket for four years?", o: ["Brijesh Patel", "Niranjan Shah", "N Srinivasan", "Shashank Manohar"], a: 3, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Who among the following has been appointed as the Ambassador and Permanent Representative of India to the UN and other International Organizations in Geneva on July 1, 2020?", o: ["lndra Mani Pandey", "Venu Rajamony", "Uma Shankar Bajpai", "Deepak Bhojwani"], a: 0, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "With which of the following musical instruments is the musician Sikkil Mala Chandrasekhar associated?", o: ["Swarmandal", "Flute", "Tanpura", "Tabla"], a: 1, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Who was the first Governor-General under the British rule in India?", o: ["Warren Hastings", "John Adam", "George Barlow", "Charles Cornwallis"], a: 0, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "What is the SI Unit of temperature?", o: ["Degree Fahrenheit", "Candela", "Kelvin", "Degree Celsius"], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "In which state is the Ananthagiri Hills located?", o: ["Kerala", "Andhra Pradesh", "Telangana", "Karnataka"], a: 2, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Which of the following football clubs won the La Liga Football Title for the 34 th time on July 16, 2020, in Madrid?", o: ["Levante", "Barcelona", "Real Madrid", "Villarreal"], a: 2, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "In which state is the archaeological site of Surkotada situated?", o: ["Karnataka", "Haryana", "Rajasthan", "Gujarat"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which organisation is operating the Pradhan Mantri Vaya Vandana Yojana of the Government of India?", o: ["Unit Trust of India", "LIC of India", "Post Office", "State Bank of India"], a: 1, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Which of the following commodities is NOT included in the Essential Commodities Act, 1955?", o: ["Wooden furniture", "Cement", "Tyres of scooters", "Soap"], a: 0, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Former Union Food Processing Minister Harsimrat Kaur Badal virtually inaugurated the Zoram Mega Food Park in ______ on July 20, 2020, to boost the food processing industry in the North-East.", o: ["Meghalaya", "Mizoram", "Manipur", "Tripura"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "In which state had the Central Government amalgamated three Regional Rural Banks (RRBs) into one bank with effect from 1 January 2019?", o: ["Haryana", "Rajasthan", "Uttar Pradesh", "Punjab"], a: 3, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "While performing the Suwa folk dance of Chhattisgarh, women act like which of the following birds?", o: ["Pigeon", "Peacock", "Hornbill", "Parrot"], a: 3, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Which of the following activities belongs to the secondary sector of an economy?", o: ["Tea plantation", "Legal consulting", "Farm equipment manufacturing", "Banking"], a: 2, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Name the king who built the famous Lingaraj Temple in Bhubaneswar?", o: ["Jajati Keshari", "Dharmaratha", "Janmejaya I", "Bhimaratha"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Which of the following scientists developed the Theory of Relativity?", o: ["Niels Bohr", "Ernest Rutherford", "JJ Thomson", "Albert Einstein"], a: 3, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Constitution of India has provisions for a joint sitting of both Houses of Parliament?", o: ["Article 93", "Article 126", "Article 108", "Article 122"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "In which of the following states is the Kolleru Lake located?", o: ["Kerala", "Karnataka", "Andhra Pradesh", "Tamil Nadu"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Who among the following founded the Hyderabad city?", o: ["Subhan Quli Qutb Shah", "Ibrahim Quli Qutb Shah", "Muhammad Quli Qutb Shah", "Jamsheed Quli Qutb Shah"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Which of the following instruments is used to measure electromotive force?", o: ["Polarimeter", "Potometer", "Potentiometer", "Platometer"], a: 2, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "In which state is the Kanha National Park situated?", o: ["Madhya Pradesh", "Haryana", "Karnataka", "Manipur"], a: 0, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s3-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct? 77 + 12 - 4 ÷ 10 × 1 = 70", o: ["and ×", "and ÷", "÷ and ×", "+ and -"], a: 1, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term. Amend : Rectify :: Chaos : ?", o: ["Creativity", "Array", "Disorder", "Ungrateful"], a: 2, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "02dec2020-s3-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s3-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Three of the following terms are alike and one is different. Select the option that indicates the odd one.", o: ["Torch", "Candle", "Table Lamp", "Night Bulb"], a: 1, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "02dec2020-s3-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "02dec2020-s3-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the option that can replace the question mark (?) in the following series. 22, 25, 32, 41, 55, 82, 110, 191, ?", o: ["247", "233", "218", "256"], a: 0, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s3-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "02dec2020-s3-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "02dec2020-s3-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "02dec2020-s3-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third number in the same way as the second number is related to the first number. 8 ∶ 515 ∶∶ 14 ∶ ?", o: ["2784", "2747", "2477", "2845"], a: 1, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "02dec2020-s3-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s3-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s3-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the option that can replace the question mark (?) in the following series. 5, 41, 258, 1561, ?", o: ["8140", "9380", "8841", "9983"], a: 1, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "02dec2020-s3-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "If a seller brought a product for 360 rupees and sold it with 28% profit. Select the option which represents the approximate selling price of the product.", o: ["461", "459", "464", "458"], a: 0, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "02dec2020-s3-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "02dec2020-s3-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "02dec2020-s3-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "02dec2020-s3-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "In a certain code language, 'ONE DAY AT A TIME' is written as 'J21 SN5 N3 N 3LG1'. How will 'DYNAMITE' be written in the same code language?", o: ["5SA2G3L1", "S52NLG31", "S52NGL31", "S5N2GL31"], a: 2, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of Rs. 7,560 is divided between A, B and C such that if their shares are diminished by Rs. 400, Rs. 300 and Rs. 260, respectively, then their shares are in the ratio 4 ∶ 2 ∶ 5. What is the original share of B?", o: ["Rs. 1,500", "Rs. 1,200", "Rs. 2,400", "Rs. 2,700"], a: 0, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "The marked price of an article is Rs. 2,400. It is sold for Rs. 1,542.24 after allowing three successive discounts of 15%,10% and x%. What is the value of x?", o: ["16", "16.5", "18", "15.6"], a: 0, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "What least number should be subtracted from 2983 so that the resulting number when divided by 9, 10 and 15, the remainder in each case is 3?", o: ["10", "13", "12", "9"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Two positive integers differ by 1627. When the largest integer is divided by the smaller, the quotient is 7 and the remainder is 157. The sum of the digits of the smaller integer is:", o: ["17", "13", "11", "12"], a: 2, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "The amount obtained by investing a certain sum at r% p. a. for 4 years simple interest is equal to the simple interest on the same sum at the same rate for 14 years. What is the value of r?", o: ["10", "8", "9", "12"], a: 0, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "A person travelled a distance of 60 km and then returned to the starting point. The time taken by him for the return journey was 1/2 hour more than the time taken for the outward journey, and the speed during the return journey was 10 km/h less than that during the outward journey. His speed during the outward journey (in km/h) was:", o: ["24", "40", "36", "30"], a: 1, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "The value of 4/21 ÷ 3/7 of 1/2 − 1/2 × 1 2/3 + (0.89̄ ÷ 0.98̄ × 7 1/3) ÷ 2 1/2 is:", o: ["32/9", "49/18", "7/9", "25/18"], a: 1, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "The diameter of the base of a solid right circular cone is 66 cm, and its curved surface area is 2145 π cm 2. The volume of the cone, in cm 2, is:", o: ["17787 π", "15246 π", "13552 π", "20328 π"], a: 3, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "The area of a triangular park, whose sides are 72 m, 210 m, and 222 m, is equal to the area of a rectangular garden whose sides are in the ratio of 21 : 10. What is the perimeter (in m) of the rectangular garden?", o: ["372", "434", "310", "248"], a: 0, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "The compound interest on a certain sum for 2 years at 15% p. a. is Rs.7,282, interest being compounded 8-monthly. What will be the amount of the same sum at the same rate for the same duration, when the interest is compounded yearly?", o: ["Rs. 29,095", "Rs. 28,540", "Rs. 29,282", "Rs. 26,620"], a: 0, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "If x% of 240 is equal to 60% of (x + 450), then 20% of (x + 50) is what percentage less then 40% of x?", o: ["33 1/3%", "16 2/3%", "50%", "40%"], a: 0, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of the number of boys and girls in a class is 9 : 7. The average weight of all the boys and girls is 54.25 kg. If the average weight of the girls is 52 kg, then what is the average weight (in kg) of the boys?", o: ["56.5", "57.5", "57", "56"], a: 3, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "A can do of a work in 10 days and B can do of the same work in 8 days. Both together worked for 8 days then C alone completes the remaining work in 3 days. A and C together will complete    part of the original work in:", o: ["20 days", "15 days", "12 days", "18 days"], a: 1, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "By selling an article at of its selling price, Madhu incurs a loss of 10%. If he sells the article at 85% of its actual selling price, then what is the profit percentage (correct to one decimal place)?", o: ["6.4", "5.8", "6.5", "5.2"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Arun spends 30% of his monthly income on groceries, 20% of the remaining on rent, and 45% of the remaining on children's education and others. If he saves Rs. 5,544 a month, then how much (in Rs.) does he spend on rent?", o: ["2,690", "2,520", "2,500", "2,680"], a: 1, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "State whether the following statements related to MS Word are true or false. (i) A document file can have both, bulleted and numbered lists. (ii) Page margins in an MS Word document can be customised.", o: ["(i) True, (ii) False", "(i) False, (ii) True", "(i) False, (ii) False", "(i) True, (ii) True"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "When you open a new file in the newer versions of MS Word, such as Word 2016, the default page margin is set as:", o: ["Moderate", "Normal", "Narrow", "Mirrored"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following appears at the extreme right position of a worksheet in MS Excel?", o: ["Status bar", "Vertical scroll bar", "Horizontal scroll bar", "Menu bar"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Consider a formula \"= 3 + 5\" in cell B4. If cell B4 is copied and pasted into F10, then what will be the formula in cell F10?", o: ["= 3 +", "= 3 +", "= 4 +", "= 4 +"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts is used to open a new window in incognito (private) mode in a Chrome browser?", o: ["Ctrl + N", "Alt + Ctrl + N", "Ctrl + Shift + N", "Ctrl + P"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following does NOT appear as a part of the 'Paragraph' command group within the Home menu in recent versions of MS Word, such as Word 2016?", o: ["Bullets", "Multilevel list D C E D D C E D D C", "Numbering", "Change case"], a: 3, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "POP3 is an email-related protocol. What does the numeric value '3' in POP3 represent?", o: ["Number of characters in POP", "Header size of POP", "Version of POP", "Number of codes in POP"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "What will be the result of the following MS Excel formula? = FACT(5-4)", o: ["120", "1", "96", "24"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a web search engine?", o: ["Bing", "Baidu", "Google", "Safari"], a: 3, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts is equivalent to CTRL + S to save an open file in MS Word?", o: ["Shift + F5", "Ctrl + F5", "Shift + F12", "Ctrl + F12"], a: 2, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 02 Dec 2020 Shift-3";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 02 Dec 2020 Shift-3", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
