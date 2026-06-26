/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 01 Dec 2020 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc01_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-01dec2020-s2';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 01 Dec 2020 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "In which of the following years was the First Amendment Act of the Constitution of India enacted?", o: ["1958", "1951", "1952", "1956"], a: 1, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "IBEF is a trust established by the Ministry of Commerce and Industry. From the given options, select the correct full form of IBEF.", o: ["Indian Board of Exporters Forum", "International Bureau Economic Federation", "India Brand Equity Foundation", "Indian Board of Economics Foundation"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Article 32 belongs to which part of the Indian Constitution?", o: ["Part II", "Part I", "Part III", "Part IV"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "How many public sector banks are there in India as of September 2020?", o: ["13", "24", "22", "12"], a: 3, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "‘Vishu’ is one of the famous festivals of which of the following states?", o: ["Odisha", "Kerala", "Tamil Nadu", "Assam"], a: 1, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "In which of the following years was Sir Richard Stafford Cripps sent to India to win the co- operation of Indian political groups?", o: ["1909", "1917", "1942", "1929"], a: 2, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Which of the following is the most abundant and lightest gas in the universe?", o: ["Nitrogen", "Hydrogen", "Carbon-dioxide", "Oxygen"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Who among the following authors wrote the novel ‘The God of Small Things’?", o: ["Arundhati Roy", "Mary Roy", "Amnika Batra", "Salman Rushdie"], a: 0, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "In which of the following cities is the Thirumalai Nayakkar palace located?", o: ["Kanyakumari", "Madurai", "Chennai", "Mysuru"], a: 1, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "A ______ is a collection of different ecosystems which share similar climatic conditions.", o: ["reef", "flora", "biome", "lagoon"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which of the following is the highest peak in south India?", o: ["Doddabetta", "Perumal", "Vandaravu", "Anamudi"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Which of the following layers of Earth’s atmosphere can be depleted by the use of chlorofluorocarbons?", o: ["Ionosphere", "Troposphere", "Ozone", "Exosphere"], a: 2, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Which of the following soil types becomes less fertile due to the intense leaching caused by tropical rains?", o: ["Red soils", "Yellow soils", "Laterite soils", "Black soils"], a: 2, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "In September 2020, who among the following was appointed as the MD and CEO of the Kerala-based South Indian Bank for a period of three years with effect from 1 October 2020?", o: ["Murali Ramakrishnan", "Kaizad Bharucha", "Romesh Sobti", "Rana Kapoor"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "In which of the following years was ‘Jal Jeevan Mission’ launched. The mission aimed to provide safe and adequate drinking water through household tap connections to every household in rural India by 2024?", o: ["2014", "2017", "2016", "2019"], a: 3, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "When did the Constituent Assembly adopt the Constitution of India?", o: ["10 January 1950", "26 November 1949", "15 August 1948", "24 March 1946"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Amir Khosrow was a royal poet and a disciple of which of the following Sufi saints?", o: ["Fariduddin Ganjshakar", "Syed Muhammad Nizamuddin Auliya", "Shaikh Salim Chisti", "Muhammad Maharavi"], a: 1, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "According to which of the following Articles shall the Supreme Court of India have power to review any judgement pronounced or order made by the Parliament?", o: ["Article 135", "Article 143", "Article 137", "Article 235"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "In which of the following years did the Government of India appoint the Second Backward Classes Commission?", o: ["1990", "1972", "1967", "1979"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Who among the following won the 48th edition of the annual event of World Open Online Chess Tournament in September 2020?", o: ["Nihal Sarin", "Prithu Gupta", "Aryan Chopra", "P Iniyan"], a: 3, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Who among the following became the first female army officer to lead the army contingent in the Army Day and Republic Day parades? She achieved the feat in 2020.", o: ["Anjana Bhaduria", "Priya Jhingan", "Tania Shergill", "Mitali Madhumita"], a: 2, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which of the following is the popular harvest festival of Meghalaya?", o: ["Hampi", "Chapchar Kut", "Wangala", "Losar"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Doodhganga river is a tributary of which of the following rivers?", o: ["Krishna", "Yamuna", "Brahmaputra", "Godavari"], a: 0, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Golkonda fort was built during the reign of which of the following dynasties?", o: ["Maurya", "Chaulukya", "Gupta", "Kakatiya"], a: 3, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Itai-itai disease is caused by the toxicity of which of the following elements?", o: ["Mercury", "Cadmium", "Lead", "Arsenic"], a: 1, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "How many Indians were honoured with the National Sports Awards in August 2020 by President Ram Nath Kovind?", o: ["56", "78", "89", "74"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Garba is the famous folk dance form from which of the following states? The dance is performed during Navratri celebrations to honour the nine forms of Goddess Durga.", o: ["Uttar Pradesh", "Haryana", "Rajasthan", "Gujarat"], a: 3, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "In which of the following years did the Malabar Rebellion break out in the southern taluks of Malabar?", o: ["1935", "1918", "1939", "1921"], a: 3, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Kareena Kapoor Khan inked a two-year contract (starting from March 2020) with ______ as its brand ambassador.", o: ["Adidas", "Sketcher", "Puma", "Nike"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Which of the following sports awards is given to honour coaches for their outstanding and meritorious work on a consistent basis in enabling sportspersons to excel in international events?", o: ["Dronacharya", "Dhyan Chand", "Rajiv Gandhi Khel Ratna", "Arjuna"], a: 0, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Mary Kom was the first Indian woman to win a gold medal at the Asian Games in 2014. In which of the following sports does she represent India?", o: ["Swimming", "Wrestling", "Badminton", "Boxing"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "According to Economic Survey of 2019-2020, current account deficit has contracted to ______ of GDP in 2019-2020 (April-September) from 2.1% in 2018-2019.", o: ["1.4%", "1.7%", "1.5%", "1.2%"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "In which of the following type of markets do the buyers and sellers, mainly individuals and institutions, engage in trade of financial securities such as bonds and stocks?", o: ["Capital market", "Money market", "Domestic market", "Foreign exchange market"], a: 0, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "The Sanchi monument is one of the most well-preserved Indian Buddhist stupas located in which of the following states?", o: ["Madhya Pradesh", "Uttar Pradesh", "Karnataka", "Andhra Pradesh"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Which of the following payment banks has partnered with Mastercard in April 2020 to issue virtual and physical debit cards?", o: ["JIO", "FINO", "Airtel", "Paytm"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Which of the following rivers originates from Amarkantak hills?", o: ["Cauvery", "Narmada", "Tapti", "Mahanadi"], a: 1, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "______ based farming system is developed to improve environmental control over production of fish.", o: ["Pond fish", "RAS (Recirculating Aquaculture Systems)", "Biofilm", "Biofloc"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "The finance bill can only be introduced in ______.", o: ["Securities Exchange Board of India", "Rajya Sabha", "Reserve Bank of India", "Lok Sabha"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Who among the following is the author of the epic poem ‘Ramcharitmanas’?", o: ["Valmiki", "Ved vyasa", "Tulsidas", "Bharat Muni"], a: 2, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Who among the following was the first Indian personality to win an Oscar Award in the ‘Best Costume Design’ category?", o: ["Ritu Kumar", "Neeta Lulla", "Bhanu Athaiya", "Rohit Bal"], a: 2, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "In which of the following years was Jawaharlal Nehru elected as the President of the Lahore Session of the Indian National Congress?", o: ["1929", "1934", "1924", "1928"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Which of the following authorities frames the monetary policy in India?", o: ["Reserve Bank of India", "Ministry of Corporate Affairs", "Ministry of Finance", "Securities and Exchange Board of India"], a: 0, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "In 2019, who among the following was roped in as the brand ambassador of UPI payment app, BharatPe?", o: ["Akshay Kumar", "Salman Khan", "Abhishek Bachchan", "Amitabh Bachchan"], a: 1, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Emperor Ashoka was the king of which of the following dynasties?", o: ["Shunga dynasty", "Nanda dynasty", "Gupta dynasty", "Maurya dynasty"], a: 3, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "In which of the following states are the Nallamala Hills located?", o: ["Arunachal Pradesh", "Madhya Pradesh", "Uttar Pradesh", "Andhra Pradesh"], a: 3, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "The sealable or open glass container containing soil and plants that can be opened for maintenance and to access the plants inside is called ______.", o: ["osmeterium", "riparium", "paludarium", "terrarium"], a: 3, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "In which of the following years was the Battle of Haldighati fought?", o: ["1571", "1567", "1579", "1576"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "______ is the certain percentage of deposits that banks have to maintain with the central bank.", o: ["Repo Rate", "SLR (Statutory Liquidity Ratio)", "CRR (Cash Reserve Ratio)", "Reverse Repo Rate"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Marieke Lucas Rijneveld became the youngest author to win the International Booker Prize for which of his books in 2020?", o: ["Girl, Woman, Other", "The Testaments", "Celestial Bodies", "The Discomfort of Evening"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "In which of the following years did Rani Lakshmibai die fighting with British colonial rulers?", o: ["1856", "1834", "1858", "1867"], a: 2, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "01dec2020-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "01dec2020-s2-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "A motorcycle costs ₹60,000. If the depreciation rate is 15%, what would be its cost after one year?", o: ["₹42,000", "₹45,000", "₹51,000", "₹41,000"], a: 2, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "01dec2020-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Which number can replace the question mark (?) in the following series?\n3, 7, 16, 41, 90, ?, 380", o: ["191", "212", "211", "202"], a: 2, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the number-pair which is NOT related in the same way as are the other number-pairs.", o: ["5 : 25", "7 : 56", "3 : 12", "2 : 6"], a: 0, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "01dec2020-s2-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "01dec2020-s2-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "01dec2020-s2-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "In a code language, SKILL is written as 72. How will CAREER be written as in that language?", o: ["112", "82", "102", "92"], a: 0, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "01dec2020-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "'Piglet' is related to 'Pig' in the same way as 'Kitten' is related to '________'.", o: ["Cow", "Kite", "Cattle", "Cat"], a: 3, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "01dec2020-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n7, 24, 75, 228, ?", o: ["660", "656", "689", "687"], a: 3, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following set.\n(2, 16, 32)", o: ["(4, 256, 512)", "(28, 51, 102)", "(3, 24, 45)", "(18, 158, 316)"], a: 0, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "01dec2020-s2-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "01dec2020-s2-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "01dec2020-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "01dec2020-s2-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "01dec2020-s2-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "01dec2020-s2-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Three of the following four words are alike in a certain way and one is different. Select the odd one.", o: ["Tiger", "Elephant", "Zoo", "Lion"], a: 2, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Which two numbers should be interchanged in the following equation to make it correct?\n4 ÷ 5 − 3 + 2 × 1 = 11", o: ["4 and 3", "4 and 2", "4 and 1", "5 and 1"], a: 3, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "01dec2020-s2-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "01dec2020-s2-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A man takes 5 hours 45 minutes in walking to a certain place and riding back. He would have taken 2 hours more by walking both the ways. The time he would take to ride both the ways is:", o: ["4 hours", "3 hours 15 minutes", "3 hours 45 minutes", "2 hours 45 minutes"], a: 2, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of ₹12,000 amounts to ₹20,736 in 1½ years at a certain rate per annum on compound interest, compounded half yearly. What will be the compound interest (in ₹) of the same sum in 2 years at the same rate on compound interest, if the interest is compounded annually?", o: ["12,510", "11,250", "15,210", "11,520"], a: 3, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of money was put at simple interest at a certain rate for 2 years. Had it been at 3% higher rate for 3 years, it would have fetched ₹72 more. If the sum is 80 times the rate of interest, then the rate per annum is:", o: ["8%", "6%", "5%", "4%"], a: 1, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of 17 numbers is 15. If the average of the first nine numbers is 14 and that of the last 9 numbers is 16, then the middle number is:", o: ["15", "14", "17", "16"], a: 0, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "The arrangement of rational numbers −7/10, −5/8, −2/3 in descending order is:", o: ["−7/10, 2/−3, 5/−8", "−7/10, 5/−8, 2/−3", "−5/8, −2/3, −7/10", "5/−8, −7/10, 2/−3"], a: 2, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "4 bells beep at an interval of 4, 12, 20 and 25 minutes. If they beep together at 8 a.m., then they will beep together again at:", o: ["12 noon", "1 p.m.", "11 a.m.", "2 p.m."], a: 1, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "In a press there are three types of printing machines A, B and C. Machine A can print ten thousand pages in 8 hours, machine B can do the same task in 10 hours, and machine C can do the same task in 12 hours. All three machines start the task at 9:00 a.m. Machine A breaks down at 11:00 a.m. and machines B and C continue working. At 12:00 noon machine B also breaks down and machine C alone has to complete the remaining task. What is the approximate time of completion of the task?", o: ["1:54 p.m.", "2:24 p.m.", "12:45 p.m.", "2:40 p.m."], a: 1, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A towel, when bleached, was found to have lost 25% of its length and 15% of its breadth. The percentage of decrease in the area is:", o: ["38.5%", "36.25%", "35%", "37.75%"], a: 1, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "A cistern, 8 m long and 5 m wide, contains water up to a depth of 1 m 25 cm. The total area (in m²) of the wet surface is:", o: ["72.5", "69", "73.5", "70.5"], a: 0, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "A number consists of 3 digits whose sum is 14. The middle digit is equal to the sum of the other two digits. The number will increase by 99 if its digits are reversed. The number is:", o: ["374", "2755", "572", "473"], a: 0, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "The sum of the selling prices with a discount of 32% and two successive discounts of 20% and 12%, is ₹1,211. The marked price (in ₹) of the article is:", o: ["750", "1,350", "1,000", "875"], a: 3, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "The sides of a triangle are in the ratio 1/2 : 1/3 : 1/5. If the perimeter of the triangle is 186 cm, then the length (in cm) of the largest side is:", o: ["60", "90", "72", "120"], a: 1, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Three candidates contested an election and received 2272, 15272 and 23256 votes, respectively. All votes are valid votes. What percentage of the total votes did the candidate with the minimum votes get (correct to the nearest natural number)?", o: ["5%", "4%", "8%", "6%"], a: 3, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "A housewife spends 60% of her monthly income on grocery, clothes and education in the ratio of 5 : 7 : 10, respectively. If the amount spent on grocery is ₹15,000, then what is her monthly income (in ₹)?", o: ["1,25,000", "1,20,000", "1,00,000", "1,10,000"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "By selling a sofa set for ₹25,800 and a table for ₹5,000, a shopkeeper gains 10% on the whole transaction. However, if he sells the sofa set for ₹22,500 and the table for its original cost, he loses 5%. What is the original cost of the table?", o: ["₹3,500", "₹3,834", "₹4,750", "₹4,100"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following protocols pushes email messages to the server?", o: ["SMTP", "HTTP", "Both, POP and HTTP", "POP"], a: 0, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "State whether the following statements related to MS Word are true or false. (i) When you open a new file in MS Word, by default it has Landscape orientation. (ii) When you open a new file in MS Word, by default it has Portrait orientation.", o: ["(i) True, (ii) True", "(i) False, (ii) True", "(i) True, (ii) False", "(i) False, (ii) False"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Consider a formula \"=A3+B4\" in cell A5. If cell A5 is copied and pasted into E9, then what will be the formula in cell E9?", o: ["=A3+B4", "=E8+F7", "=E7+F8", "=B4+C5"], a: 2, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a valid 'Change case' option in MS Word?", o: ["Uppercase", "Toggle case", "Lowercase", "Pascal case"], a: 3, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which of the following appears as a part of the 'Editing' command group within the Home menu in recent versions of MS Word, such as Word 2016?", o: ["Change case", "Font color", "Format Painter", "Replace"], a: 3, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "What will be the result of the following MS Excel formula? =FACT(0) + FACT(3) + FACT(5)", o: ["126", "9", "127", "8"], a: 2, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts is used to activate a browser tab to the right of the current tab in a Chrome browser?", o: ["Ctrl + Right arrow", "Ctrl + Page down", "Alt + Left arrow", "Ctrl + Page up"], a: 1, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "In dotted-decimal notation, an IP version 4 address is represented by using exactly ______ dot (.) symbols.", o: ["three", "four", "five", "two"], a: 0, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts can be used to indent paragraphs in an MS Word document?", o: ["Alt + I", "Alt + T", "Ctrl + I", "Ctrl + M"], a: 3, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "When you open a new workbook in MS Excel, which of the following appears on the topmost portion of the screen?", o: ["Horizontal scroll bar", "Vertical scroll bar", "Status bar", "Title bar"], a: 3, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 01 Dec 2020 Shift-2";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 01 Dec 2020 Shift-2", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
