/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 01 Dec 2020 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc01_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-01dec2020-s1';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 01 Dec 2020 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "As per the Union Budget 2020, which of the following taxes has been abolished?", o: ["Dividend distribution tax", "Long term capital gains tax on securities", "Securities transaction tax", "Corporate tax"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "The microbes that lie on the border line of the living and non-living world are called:", o: ["fungi", "algae", "bacteria", "viruses"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Constitution of India contains the directive that the State shall make provision for maternity relief?", o: ["Article 40", "Article 39", "Article 42", "Article 41"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Constitution of India prohibits the Indian State from conferring any title, except a military or academic distinction?", o: ["Article 15", "Article 10", "Article 18 (1)", "Article 20"], a: 2, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "With which of the following states is the theatre form 'Maach' traditionally associated?", o: ["Kerala", "Madhya Pradesh", "Assam", "Karnataka"], a: 1, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Atanu Das, who was awarded the Arjuna Award 2020, is a professional player of:", o: ["wrestling", "basketball", "archery", "badminton"], a: 2, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Which of the following books was conferred the International Booker Prize 2020?", o: ["The Discomfort of Evening", "The Enlightenment of the Greengage Tree", "Hurricane Season", "Tyll"], a: 0, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Who among the following was appointed as the Chairperson of Advisory Committee on Corporate Insolvency Resolution and Liquidation process in June 2020?", o: ["Kumar Mangalam Birla", "Nandan Nilekani", "Anand Mahindra", "Uday Kotak"], a: 3, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which of the following states does NOT share its border with West Bengal?", o: ["Meghalaya", "Assam", "Jharkhand", "Sikkim"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Who among the following has been selected for the 2020 World Food Prize?", o: ["Simon N Groot", "Rattan Lal", "Lawrence Haddad", "MS Swaminathan"], a: 1, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "As per the new income tax regime announced in the Union Budget 2020, the tax rate for taxable income between ₹5 lakh to ₹7.5 lakh has been reduced to:", o: ["15%", "5%", "10%", "20%"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Which of the following modes of reproduction is carried out by specialised cells that proliferate to make large number of cells?", o: ["Layering", "Fission", "Fragmentation", "Regeneration"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Which of the following countries does tennis player Alexander Zverev represent?", o: ["Switzerland", "Germany", "The US", "France"], a: 1, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which of the following rivers has Zaskar as one of its tributaries?", o: ["Yamuna", "Ganga", "Indus", "Beas"], a: 2, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "The famous hill station named Mcleodganj is located in:", o: ["Ladakh", "West Bengal", "Uttarakhand", "Himachal Pradesh"], a: 3, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "As per the Census of India 2011, which of the following Union Territories is least densely populated as compared with the other three mentioned in the following options?", o: ["Chandigarh", "Puducherry", "Andaman & Nicobar Islands", "Lakshadweep"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "In the Union Budget 2020, the Finance Minister announced the hike of bank deposit insurance from ______ to ₹5 lakh.", o: ["₹1 lakh", "₹3 lakh", "₹4 lakh", "₹2 lakh"], a: 0, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "In 2020, the government of which of the following states instituted GV Raja Awards for sportspersons?", o: ["Telangana", "Andhra Pradesh", "Maharashtra", "Kerala"], a: 3, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "The painter Abdus Samad, the renowned painter of Iran, came to India on the invitation of:", o: ["Jahangir", "Aurangzeb", "Humayun", "Akbar"], a: 2, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Who is the author of the book titled 'RAW: A History of India’s Covert Operations'?", o: ["Bijal Vachharajani", "Neena Rai", "Yatish Yadav", "Nirupama Yadav"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "The unit of calorific value of a fuel is expressed as:", o: ["psi", "micron", "mmHg", "kJ/kg"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "In India, the custodian of foreign exchange reserves of the country is:", o: ["Union Cabinet", "Reserve Bank of India", "State Bank of India", "Union Finance Ministry"], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "In which of the following soil types is the proportion of fine particles relatively higher than big particles?", o: ["Sandy soil", "Clayey soil", "Black soil", "Loamy soil"], a: 1, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "In which of the following states are the Barabara Caves located?", o: ["Gujarat", "Bihar", "Madhya Pradesh", "Maharashtra"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Till 31 August 2020, the number of sportsperson/s awarded the Bharat Ratna was:", o: ["four", "two", "three", "one"], a: 3, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Who among the following was the author of the ancient text called 'Siddhant Shiromani'?", o: ["Aryabhatta", "Mahaviracharya", "Brahmagupta", "Bhaskaracharya"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which of the following is a protein digesting enzyme that is secreted in the small intestine?", o: ["Trypsin", "Lipase", "Pepsin", "Bile"], a: 0, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Constitution of India specifies the right of minorities to establish and administer educational institutions?", o: ["Article 29", "Article 27", "Article 28", "Article 30"], a: 3, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which of the following is the largest river of Odisha?", o: ["Godavari", "Tapi", "Krishna", "Mahanadi"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "At US Open 2020, Indian player Rohan Bopanna paired with ______ for the Men’s Doubles events.", o: ["Denis Shapovalov", "Mate Pavic", "Bruno Soares", "Sumit Nagpal"], a: 0, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "To which of the following dynasties did the ruler Gautamiputra Satkarni belong?", o: ["Chalukya", "Pallava", "Shaka", "Satavahana"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Which of the following is the earliest text containing the shlokas that were put to music?", o: ["Sama Veda", "Sangeet Ratnakar", "Meghaduta", "Kamasutra"], a: 0, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "The folk songs named 'Pankhida' traditionally belong to:", o: ["Rajasthan", "Chhattisgarh", "Odisha", "Kashmir"], a: 0, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Who among the following propounded the philosophy of 'Ashtangika marga' (the Eightfold Path)?", o: ["Shankaracharya", "Mahavir Swami", "Ramanuja", "Gautam Buddha"], a: 3, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "As on 31 August 2020, who among the following was the Member-Secretary of the Economic Advisory Council to the Prime Minister?", o: ["Bibek Debroy", "Ashima Goyal", "Ratan P Watal", "Sajjid Chinoy"], a: 2, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Which of the following cities has an astronomical observatory constructed under the patronage of Sawai Jai Singh?", o: ["Varanasi", "Prayagraj", "Agra", "Bharatpur"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "In which of the following states are Dafla Hills mainly spread?", o: ["Odisha", "Jharkhand", "Arunachal Pradesh", "West Bengal"], a: 2, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "In the Union Budget 2020, the Finance Minister projected that Indian farmers' income would double by the year:", o: ["2022", "2025", "2023", "2024"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "In which year was the 9th Schedule added in the Constitution of India?", o: ["1954", "1953", "1951", "1952"], a: 2, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "In which part of Ashoka's empire were his inscriptions written in Kharosthi script?", o: ["North Eastern", "Central", "Southern", "North Western"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "The gigantic statue of Gautam Buddha, discovered at Sultanganj (near Bhagalpur in Bihar), has been dated to the ______ period.", o: ["Shunga", "Nanda", "Gupta", "Maurya"], a: 2, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "In how many books is 'Akbar Nama', written by Abul Fazal, divided?", o: ["Five", "Three", "Two", "Four"], a: 1, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Which of the following amendments to the Constitution of India is also referred to as the 'mini Constitution'?", o: ["38th Amendment", "42nd Amendment", "35th Amendment", "40th Amendment"], a: 1, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Who among the following Indians is known for his exemplary contribution in the field of mathematics?", o: ["JC Bose", "S Ramanujan", "CV Raman", "VA Sarabhai"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "In which year was the monopoly of British East India Company on trade with India broken by a legislation?", o: ["1813", "1807", "1858", "1825"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "At which of the following places did the Buddhist event known as 'Dhammachakkapavattan' take place?", o: ["Lumbini", "Kushinagar", "Bodh Gaya", "Sarnath"], a: 3, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Which of the following does NOT have specialized tissue for the conduction of water?", o: ["Grass", "Ipomoea", "Paphiopedilum", "Funaria"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Which of the following is among the industries used for calculating the Index of Eight Core Industries in India?", o: ["Aluminium", "Copper", "Textile", "Refinery products"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "In which of the following years was Article 21A inserted in the Constitution of India?", o: ["2006", "2000", "2004", "2002"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "In August 2020, India and ______ were declared joint winners of the Chess Olympiad gold medal.", o: ["Australia", "Russia", "the US", "New Zealand"], a: 1, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "'Thermometer' is related to 'Temperature' in the same way as 'Protractor' is related to '______'.", o: ["Weight", "Angle", "Mass", "Height"], a: 1, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "01dec2020-s1-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "01dec2020-s1-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "01dec2020-s1-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "01dec2020-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "01dec2020-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n7259 : 4154 :: 3852 : ?", o: ["4201", "2401", "2410", "4210"], a: 0, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "01dec2020-s1-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n1, 5, 13, 29, ?, 125, 253, 509, 1021", o: ["57", "88", "75", "61"], a: 3, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "01dec2020-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "01dec2020-s1-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "01dec2020-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way, as the numbers of the following set.\n(9, 6, 27)", o: ["(7, 5, 13)", "(3, 2, 21)", "(8, 6, 18)", "(6, 4, 16)"], a: 2, e: "", qimg: "" },
  { n: 64, s: "Reasoning / Logical Ability", q: "In a code language, PARROT is written as RLNMUI. How will CUCKOO be written in that language?", o: ["MGLYOV", "MLGXOV", "MLGYOV", "MLGXQV"], a: 1, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "01dec2020-s1-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "01dec2020-s1-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "The distance between Surat and Ahmedabad is 280 km. Satish starts from Surat at 6:00 a.m. and drives in his car towards Ahmedabad at a constant speed of 50 km/h. After two hours, he increases his speed to 60 km/h and maintains the speed till he reaches Ahmedabad. At what time will he reach Ahmedabad?", o: ["11:00 a.m.", "10:00 a.m.", "10:30 a.m.", "11:30 a.m."], a: 0, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "01dec2020-s1-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "01dec2020-s1-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "01dec2020-s1-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n21, 13, 33, 36, 67, 81, ?, 49, 102", o: ["96", "64", "24", "100"], a: 2, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Three of the following four words are alike in a certain way and one is different. Find the odd one.", o: ["Retrench", "Rejuvenate", "Restore", "Regenerate"], a: 0, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "01dec2020-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct?\n42 ÷ 23 + 870 × 3 − 5 = 541", o: ["+ and ×", "÷ and −", "× and ÷", "+ and −"], a: 1, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "01dec2020-s1-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "What should be subtracted from (3 1/7 + 4 3/7) + 7/6 to make the number a whole number?", o: ["7/42", "31/42", "11/42", "17/42"], a: 1, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of the price of two bicycles was 7 : 8. Two years later, when the price of the first has risen by 30% and the price of the second increases by ₹1,500, then their prices are in the ratio 15 : 16. What is the original price of (in ₹) the second bicycle?", o: ["7,031.25", "8,103.25", "7,013.25", "8,031.25"], a: 0, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "A person invested ₹50,000, partly at 10% and the rest at 12% per annum at simple interest. At the end of two years, the total interest received was ₹11,640. How much is the first and the second part of the investment?", o: ["₹9,000; ₹41,000", "₹31,000; ₹19,000", "₹20,000; ₹30,000", "₹10,000; ₹40,000"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "The radii of two circles are 4 cm and 3 cm, respectively. What is the diameter (in cm) of the circle having an area equal to four times the sum of the areas of the two circles?", o: ["12", "20", "24", "10"], a: 1, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "In a two-digit number, the unit's digit exceeds its ten's digit by 4. If the product of the given number and the sum of its digits is 370, then what is the number?", o: ["62", "37", "26", "73"], a: 1, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "The length and breadth of a rectangular floor are 14.35 m and 11.55 m, respectively. How many minimum number of square tiles would be required to cover it completely?", o: ["1353", "1271", "1107", "1435"], a: 0, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A person travelled 120 km by steamer, 450 km by train and 60 km by horse. It took him 13 hours 30 minutes. If the speed of the train is 3 times that of the horse and 1.5 times that of the steamer, then what is the speed (in km/h) of the steamer?", o: ["40", "20", "30", "60"], a: 0, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A person spends 75% of his monthly income. If his income increases by 50% and the expenditure increases by 80%, then what is the percentage increase/decrease in his monthly savings?", o: ["Increase by 35%", "Decrease by 40%", "Increase by 25%", "Decrease by 15%"], a: 1, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "The difference between the selling prices with a discount of 32% and two successive discounts of 20% and 12% is ₹36. What is the marked price (in ₹) of the article?", o: ["1,250", "1,500", "2,000", "1,800"], a: 1, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "A library has an average of 502 visitors on Sundays, 475 on Saturdays and 340 on weekdays. What is the average number of visitors per day in a month of 30 days beginning with a Sunday?", o: ["391", "362", "400", "385"], a: 3, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "A group of men decided to do a work in 20 days, but five of them remained absent. If the rest of the group could complete the work in 24 days, then how many men were in the original group?", o: ["30", "35", "25", "20"], a: 0, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Rohit marks his goods at 30% above the cost price, and allows 13.5% discount. If he sells an article for ₹1,012.05, then what is the cost price (in ₹) of the article?", o: ["900", "750", "1,000", "800"], a: 0, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "The effective annual rate of interest corresponding to 12% per annum payable quarterly, is (correct to two decimal places):", o: ["13.25%", "12.75%", "12.55%", "13.75%"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "A medicine-capsule is in the shape of a cylinder of diameter 0.8 cm with two hemispheres stuck to each of its ends. The length of the entire capsule is 2 cm. What is the capacity (in cm³) of the capsule? (correct to two decimal places) (use π = 22/7)", o: ["0.91", "0.75", "0.87", "0.67"], a: 2, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "What percentage of 4.5 kg is 18 gm?", o: ["4%", "0.4%", "0.004%", "0.04%"], a: 1, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following feature of MS Excel is used to quickly copy and paste content to adjacent cells in the same row or column?", o: ["Clear Formatting", "Format Painter", "Auto Format", "Fill handle"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following refers to the intersection of a column and row in a worksheet of MS Excel?", o: ["Name Box", "Cell", "Formula Bar", "Workbook"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following protocols is used to transfer files from one host to another over the internet?", o: ["IP", "UDP", "FTP", "TCP"], a: 2, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following shortcut key is used to paste the clipboard contents in an MS Word document?", o: ["Ctrl+Z", "Ctrl+X", "Ctrl+V", "Ctrl+C"], a: 2, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which of the following is used to identify every computer in the internet?", o: ["Internet address", "IP address", "Location address", "Computer name"], a: 1, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following is used to create small letters above the line of text in MS Word?", o: ["Subscript", "Superscript", "Underline", "Strikethrough"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following shortcut is used to select a paragraph in MS Word?", o: ["Ctrl+click on a paragraph", "Double-click on a paragraph", "Triple-click on a paragraph", "Alt+click on a paragraph"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT an email service provider?", o: ["Yahoo Mail", "Hotmail", "Coolmail", "Gmail"], a: 2, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "What will be the result of formula '=16/2^3' in a cell in MS Excel?", o: ["2", "512", "124", "6"], a: 0, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following is true with reference to opening and closing documents in MS Word 2007?", o: ["To close a document, click '-' in the upper right corner of the window.", "For opening a new file, click on 'New' in Windows button.", "The shortcut key for opening a document is Ctrl+F.", "By default, MS Word document contains no pages when it is opened."], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 01 Dec 2020 Shift-1";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 01 Dec 2020 Shift-1", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
