/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 27 Nov 2020 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc27_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-27nov2020-s1';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 27 Nov 2020 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Who among the following won the United Nations Military Gender Advocate of the Year Award (2019)?", o: ["Suman Goswami", "Madhav Thampi", "Tarika Nath", "Neerja Bhatt"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Constitution of India declares that the Supreme Court shall be a court of record?", o: ["Article 119", "Article 111", "Article 129", "Article 135"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "As per Article 106 of the Constitution of India, who among the following determines the salaries of the members of either Houses of Parliament?", o: ["Parliament", "President of India", "Union Finance Ministry", "Finance Commission"], a: 0, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "The rate at which the central bank of any country borrows money from the commercial banks within its own territories is called:", o: ["Reverse Repo Rate", "Secondary Lending Rate", "Repo Rate", "Primary Lending Rate"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "With which of the following sectors is the agency short-named as CIBIL associated?", o: ["Insurance sector", "Banking sector", "Automobile sector", "Sugar sector"], a: 1, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Who among the following has NOT received the Ramon Magsaysay award as of August 2020?", o: ["Kiran Bedi", "Prashant Bhushan", "Arvind Kejriwal", "Arun Shourie"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "In the context of Indian agriculture, the terms 'Bewar', 'Dahiya' and 'Podu' are local names of:", o: ["primitive form of cultivation", "species of cow", "species of buffalo", "varieties of soil"], a: 0, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Which of the following inscriptions refers to the repairing of a lake named 'Sudarshan Lake'?", o: ["Hathigumpha inscription of Kharvela", "Allahabad prashasti of Samudragupta", "Junagarh inscription of Rudradaman", "Aihole inscription of Pulakeshin"], a: 2, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Who among the following authored the book titled 'Barna Parichay'?", o: ["Ishwar Chandra Vidyasagar", "Ram Mohan Roy", "Debendranath Tagore", "Rabindra Nath Tagore"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Two-chambered heart is found in:", o: ["crocodiles", "Scoliodon", "lizards", "humans"], a: 1, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Sahitya Akademi Award winner and author Debesh Roy, who breathed his last in May 2020, is known for his compositions in ______ .", o: ["Gujarati", "Assamese", "Bengali", "Hindi"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "According to Moody's forecast issued in September 2020, Indian economy's growth rate during fiscal year 2021-22 shall be ______.", o: ["8.8%", "8.5%", "9.8%", "10.6%"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "In which of the following states is Dhamek Stupa situated?", o: ["Uttar Pradesh", "Gujarat", "Odisha", "Karnataka"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Chuni Goswami, the footballer who breathed his last in April 2020, was also a former national level ______.", o: ["shooter", "cricketer", "swimmer", "golfer"], a: 1, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Who among the following viceroys of India made the declaration known as 'August Offer'?", o: ["Lord Chelmsford", "Lord Linlithgow", "Lord Willingdon", "Lord Reading"], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "In the context of the human nervous system, which part of the neuron receives information?", o: ["Axon", "Mitochondria", "Dendrite", "Nerve ending"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "In which of the following states is the Chalcolithic culture site named Daimabad located?", o: ["Odisha", "Uttar Pradesh", "Maharashtra", "Punjab"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "In which of the following provinces did the Chauri Chaura incident take place during Non-Cooperation Movement?", o: ["United Province", "North-West Frontier Province", "Central Provinces", "Orissa"], a: 0, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "In India, cultivation of which of the following crops is almost exclusively concentrated in southern states?", o: ["Tea", "Bamboo", "Coffee", "Cotton"], a: 2, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Who among the following was appointed as the Defence Minister in the Interim Government in 1946?", o: ["C Rajagopalachari", "Baldev Singh", "Vallabhbhai Patel", "Asaf Ali"], a: 1, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "After the revision of ranking of teams by the International Cricket Council (ICC) in May 2020, which of the following teams bagged second place in Test ranking?", o: ["New Zealand", "South Africa", "England", "West Indies"], a: 0, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "In which year did the Simon Commission come to India?", o: ["1919", "1928", "1923", "1925"], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "The Genetically Modified variety of which of the following crops is allowed to be grown in India?", o: ["Brinjal", "Cotton", "Bitter gourd", "Bottle gourd"], a: 1, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Which of the following is the target group for the scheme named PM SVANidhi?", o: ["Street vendors", "Landless agricultural labour", "Marginal farmers", "Dairy farmers"], a: 0, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Who among the following became the first Chief Minister of the National Capital Territory of Delhi in 1993?", o: ["Sahib Singh Verma", "Sheila Dixit", "Madan Lal Khurana", "Sushma Swaraj"], a: 2, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "In which of the following states is the Chitrakoot waterfalls on Indravati river located?", o: ["Chhattisgarh", "Jharkhand", "Maharashtra", "Uttar Pradesh"], a: 0, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which of the following Indian beaches is NOT formed by the Arabian Sea?", o: ["Kovalam beach", "Palolem beach", "Radhanagar beach", "Varkala beach"], a: 2, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Who among the following manages the liquidity in Indian economy?", o: ["Reserve Bank of India", "Union Finance Ministry", "Securities and Exchange Board of India", "Indian Bank Association"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "The tribal festival named 'Pawl Kut' is traditionally associated with:", o: ["Mizoram", "Odisha", "Sikkim", "Rajasthan"], a: 0, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Which of the following products are formed during anaerobic respiration in yeast?", o: ["Acetic acid + energy", "Lactic acid + energy", "Ethanol + carbon dioxide + energy", "Lactic acid + carbon dioxide + energy"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Which of the following amendments to the Constitution of India put a cap on the number of ministers in the Union Cabinet?", o: ["69th", "74th", "91st", "83rd"], a: 2, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "To which of the following countries has India lost the rights to host Men's World Boxing Championship 2021?", o: ["Russia", "Serbia", "France", "US"], a: 1, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "As per the estimates released by World Bank in June 2020, India's economy is expected to experience contraction of ______ during the fiscal year 2020-21.", o: ["3.2%", "2.1%", "4.1%", "3.7%"], a: 0, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Constitution of India states that the State shall take steps to organise village panchayats?", o: ["Article 40", "Article 48", "Article 36", "Article 34"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Which of the following glands secretes the hormone that regulates physical growth in humans?", o: ["Thymus", "Pituitary", "Parathyroid", "Adrenal"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "In which of the following years did the breakaway faction of the Congress, led by Bal Gangadhar Tilak, re-unite with it?", o: ["1916", "1917", "1915", "1918"], a: 2, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "As per the Indian practices of national accounting, which of the following is adjusted in the nominal Gross Domestic Product (GDP) to arrive at the real GDP?", o: ["Depreciation", "Government borrowings", "Inflation", "Foreign exchange"], a: 2, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Who among the following was the second Vice-President of India?", o: ["V V Giri", "Gopal Swarup Pathak", "B D Jatti", "Zakir Hussain"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Acclaimed writer and poet Vasdev Mohi, who was selected for the Saraswati Samman in January 2020, is known for his compositions in ______ .", o: ["Bangla", "Sindhi", "Malayalam", "Tamil"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "As per the Union Budget 2020-21, the target of ₹1 lakh crore fisheries' exports is to be achieved by ______.", o: ["2022-23", "2025-26", "2023-24", "2024-25"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "In July 2020, the Union Government announced institution of a new award named 'Prerak Dauur Samman'. To which of the following fields does this award belong?", o: ["Cleanliness", "Organic agriculture", "Adult literacy", "Skill development"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "The tribal festival named 'Yemshe' is traditionally associated with:", o: ["Nagaland", "Andaman and Nicobar Islands", "Jharkhand", "Gujarat"], a: 0, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "The Alexander Dalrymple Award is given by the Hydrographic Office of:", o: ["France", "The US", "The UK", "Norway"], a: 2, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a rabi crop?", o: ["Gram", "Cotton", "Mustard", "Barley"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Which of the following sites has an ancient period temple named Lad Khan Temple?", o: ["Sanchi", "Ellora", "Aihole", "Elephanta"], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "With which of the following states is the tribal festival named 'Madai' traditionally associated?", o: ["Tripura", "Chhattisgarh", "Himachal Pradesh", "Tamil Nadu"], a: 1, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Magnus Carlsen is an international chess player from ______.", o: ["Norway", "France", "Russia", "Germany"], a: 0, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Which of the following mammals is NOT a common source of fibre?", o: ["Alpaca", "Llama", "Zebra", "Angora goat"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Which of the following organisms breaks down food outside the body and then absorbs it?", o: ["Azadirachta", "Rhizopus", "Mangifera", "Humans"], a: 1, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "With which of the following states are songs called 'Lotia' traditionally associated?", o: ["Rajasthan", "Maharashtra", "Telangana", "Meghalaya"], a: 0, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "27nov2020-s1-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs from left to right to balance the following equation.\n24 * 6 * 32 * 4 * 2 * 28", o: ["×, −, ÷, +, =", "÷, −, ×, +, =", "+, ÷, ×, −, =", "÷, +, −, ×, ="], a: 3, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Vishal borrows some X amount of money for one year from Ravi at the rate of 8% per annum. He pays ₹2,240 as annual interest for the borrowed amount. Find the value of X.", o: ["₹34,000", "₹34,600", "₹32,000", "₹28,000"], a: 3, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "27nov2020-s1-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "27nov2020-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "27nov2020-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Three of the following four letter-clusters are alike in a certain way and one is different. Pick the odd one out.", o: ["KORVA", "TXBFJ", "NRVZD", "PTXBF"], a: 0, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "27nov2020-s1-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "27nov2020-s1-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "27nov2020-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "27nov2020-s1-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "27nov2020-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "27nov2020-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "27nov2020-s1-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\nCoward : Brave :: Traditional : ?", o: ["Culture", "National", "Modern", "Progress"], a: 2, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "In a code language, 'PROVEN' is written as 'PSQOFW'. How will 'MONGER' be written in that language?", o: ["OPNSLJ", "OPNSFH", "TGOHPN", "SFHPOR"], a: 1, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n19, 43, 90, 183, 368, ?", o: ["737", "645", "725", "719"], a: 0, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n45, 72, 101, 133, 169, ?", o: ["210", "222", "209", "193"], a: 0, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "27nov2020-s1-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "27nov2020-s1-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "27nov2020-s1-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "27nov2020-s1-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "27nov2020-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n12 : 149 :: 21 : ?", o: ["219", "406", "446", "441"], a: 2, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "27nov2020-s1-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A cow is tied to a peg at one corner of a square shaped grass field of side 25 m. The length of the rope is 14 m long. The area (in m²) of that part of the field in which the cow can graze is: (Use π = 22/7)", o: ["100", "154", "77", "142"], a: 1, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "The average monthly salary of five friends is ₹62,000. Surinder, one of the five friends, got promotion and a hike in the salary. If the new average of their salaries is ₹64,250, then how much is the increase in the monthly salary of Surinder?", o: ["₹14,250", "₹11,250", "₹73,250", "₹12,150"], a: 1, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum invested at 10% per annum amounts to ₹20,947.50 at the end of one year, when the interest is compounded half-yearly. What will be the simple interest (in ₹) on the same sum for 4 2/5 years at triple the earlier rate of interest?", o: ["25,080", "24,020", "26,500", "27,000"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "A can do a work in 40 days and B can do the same work in 50 days. They worked together for 5 days and then B left the work. In how many days will A finish the remaining work?", o: ["40", "41", "33", "31"], a: 3, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "A person spends 22% of the monthly income on house rent, 40% of the income on house expenses and groceries, and 50% of the remaining on children's education and other heads. If the monthly savings are ₹3,800, then what is the expenditure (in ₹) on education and other heads?", o: ["5,600", "1,900", "3,800", "2,700"], a: 2, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "A woman takes 3 hours 20 minutes in walking to a temple and riding back. She would have gained 2 hours by riding both ways. Half of the time she would take to walk both ways is:", o: ["2 hours 40 minutes", "2 hours 50 minutes", "3 hours 20 minutes", "3 hours 10 minutes"], a: 0, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "Two students A and B are paid a total of ₹4,400 as prize money. If A is paid 120 per cent of the sum paid to B, how much is B paid (in ₹)?", o: ["2,000", "1,500", "2,400", "1,800"], a: 0, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "On a certain item, the profit is 120% of the cost. If the cost increases by 25% and the selling price remains constant, then what percentage of the selling price is the profit (correct to a whole number)?", o: ["43%", "39%", "47%", "51%"], a: 0, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "If the annual rate of simple interest increases from 9% to 13 1/2%, then the yearly interest increases by ₹3,690. What is the principal (in ₹)?", o: ["85,000", "80,000", "82,000", "88,000"], a: 2, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "If (x + y − z) : (y − z + 2w) : (2x + z − w) = 2 : 3 : 1, then the ratio of (5w − 3x − z) : 3w = ?", o: ["4 : 3", "5 : 3", "2 : 3", "5 : 2"], a: 2, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "The product of two numbers is 9216. When the larger number is divided by the smaller number, the quotient is 16 leaving no remainder. What is the difference between the numbers?", o: ["384", "408", "360", "380"], a: 2, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the least number which should be added to 3432 so that the sum is exactly divisible by 10, 5, 4 and 2?", o: ["10", "5", "6", "8"], a: 3, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "After allowing three successive discounts of 15%, 20% and 18% on the marked price of an article, it is sold for ₹2,230.40. The marked price (in ₹) of the article is:", o: ["4,000", "4,250", "3,500", "3,750"], a: 0, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "The multiplication of 0.529 and 2.01 is more than 1 by how much?", o: ["0.09326", "0.06329", "0.03269", "0.02369"], a: 1, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "A solid piece of iron in the form of a cuboid of dimensions 24.5 cm × 16.5 cm × 12 cm, is melted to form a solid sphere. What is the radius (in cm) of the sphere? (Use π = 22/7)", o: ["10.5", "12.5", "11", "8"], a: 0, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "The font size of 36 points in MS-Word 2007 is equal to how many inches?", o: ["0.25", "1.0", "0.125", "0.5"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a service offered by an Internet Service Provider?", o: ["Domain name registration", "Web administration", "Dial-up access", "Internet access"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a text function of MS-Excel 2007?", o: ["MID", "COMBIN", "LEFT", "RIGHT"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "By default how many worksheets are there in an MS-Excel 2007 workbook?", o: ["1", "4", "2", "3"], a: 3, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT an option of cell alignment in a table in MS-Word 2007?", o: ["Align bottom right", "Align center", "Align top left", "Align across"], a: 3, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT an option of Menu bar in MS-Word 2007?", o: ["Insert", "Page Layout", "Internet", "Home"], a: 2, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a valid e-mail address?", o: ["1234567890@domain.com", "email @domain.com", "email@domain.com", "email123@domain.com"], a: 1, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the given options best matches the items of LIST-1 with the items of LIST-2 with reference to editing cells in a spreadsheet?\nLIST-1: (i) Enter  (ii) Shift+Tab  (iii) Tab  (iv) Arrow key\nLIST-2: (a) moves you to the next cell to the right  (b) moves you to the next cell down  (c) moves you in the direction of the arrow  (d) moves you to the next cell to the left", o: ["(i)-b, (ii)-a, (iii)-d, (iv)-c", "(i)-b, (ii)-d, (iii)-a, (iv)-c", "(i)-c, (ii)-d, (iii)-a, (iv)-b", "(i)-a, (ii)-d, (iii)-b, (iv)-c"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Borders and Shading option of Table Properties can be used to apply which of the following in MS-Word 2007?", o: ["Mailings", "Margins", "Orientation", "Borders"], a: 3, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the given options best matches the items of LIST-1 with the items of LIST-2 with reference to web browsers and their vendors?\nLIST-1: (i) Internet explorer  (ii) Safari  (iii) Sea Monkey\nLIST-2: (a) Mozilla Foundation  (b) Microsoft  (c) Apple", o: ["(i)-a, (ii)-c, (iii)-b", "(i)-b, (ii)-c, (iii)-a", "(i)-a, (ii)-b, (iii)-c", "(i)-b, (ii)-a, (iii)-c"], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 27 Nov 2020 Shift-1";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 27 Nov 2020 Shift-1", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
