/**
 * Seed: Delhi Police Constable - 22 Nov 2023 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc22nov2023_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-22nov2023-s1';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 22 Nov 2023 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Article 21A pertains to which of the following rights?", o: ["Right to Education", "Right to Freedom", "Right to Freedom of Religion", "Right to Equality"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "__________is the first South Indian musician to win a Grammy for Best World Music Album for his role as a ghatam and morsing player in Mickey Hart’s album‘Planet Drum’.", o: ["Phani Narayana", "S Ballesh", "Dr. Ramachandra Murthy", "TH Vinayakram"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "GNP at market price is measured as:", o: ["GDP at market price − Depreciation", "GNP at market price + subsidies", "GDP at market price + Net factor income from abroad", "NDP at factor cost + Net factor income from abroad"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "In which year was Indian Olympic Association formed?", o: ["1920", "1927", "1900", "1928"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Which of the following does NOT come under Fundamental Duties?", o: ["To safeguard public property", "To cherish and follow the noble ideals that inspired the national struggle for freedom", "To value and preserve rich heritage", "To secure a living wage"], a: 3, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "The novel ‘The Inheritance of Loss’ is written by:", o: ["Aravind Adiga", "Anita Desai", "Kiran Desai", "Anees Salim"], a: 2, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "The Chief Minister of a State acts as __________ of the concerned zonal council on rotation basis along with the other Chief Ministers in that zonal council.", o: ["Member", "Vice Chairman", "Ex- officio Chairman", "Chairman"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "The Gateway of India, located in the city of Mumbai, is built in which of the following architectural styles?", o: ["Indo-Greek", "Indo-British", "Indo-Saracenic", "Indo-Sino"], a: 2, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "The Montagu-Chelmsford Reforms led to enactment of the Government of India Act of:", o: ["1909", "1858", "1919", "1935"], a: 2, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "This temple, that was built by Raja Bhimdev I of the Solanki Dynasty, has a rectangular pond called ‘Surya Kund’ in front of it. What is the name of this temple?", o: ["Modhera Sun Temple", "Khajuraho", "Konark Sun Temple", "Chausath Yogini"], a: 0, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which of the following statements is correct about membership in the World Trade Organization (WTO)?", o: ["It negotiates only bilateral trade agreements between countries.", "All the countries of the world are members of WTO.", "India reduced trade restrictions due to obligations to WTO.", "It was established as a new organisation in 1991."], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Select the correct arrangement of the taxonomic hierarchy in ascending order from the following.", o: ["a", "c", "b", "d"], a: 1, e: "", qimg: "22nov2023-s1-q-12.png" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "At independence, which was the major employment-producing sector?", o: ["Agriculture", "Service", "Industrial", "Foreign trade"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "What is the study of coins called?", o: ["Almanac", "Numismatics", "Petroglyphs", "Curator"], a: 1, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "‘National AYUSH Mission’ has been extended up to 31st March 2026. When was the scheme launched?", o: ["2015", "2016", "2014", "2012"], a: 2, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Which of the following is the most abundant mineral in our body?", o: ["Phosphorous", "Calcium", "Iron", "Copper"], a: 1, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Who is the only living representative of the extremely ancient and diverse group, Sphenopsida, commonly known as ‘horsetails’?", o: ["Equisetum", "Psilotum", "Dryopteris", "Adiantum"], a: 0, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "In 2003, __________________________ became the first Indian woman dancer to be awarded with the Padma Vibhushan.", o: ["Rukmini Devi Arundale", "Sonal Mansingh", "Sitara Devi", "Shovana Narayan"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "What was the primary outcome of the liberalisation and privatisation initiatives under the New Economic Policy (NEP) in 1991, followed by the Indian government?", o: ["Fiscal policy reforms", "Globalisation", "Centralization", "Monetary policy reforms"], a: 1, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Goa is well known for which of the following ores?", o: ["Uranium and copper", "Iron and manganese", "Gold and graphite", "Petroleum and coal"], a: 1, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "The English word juggernaut comes from the name Jagannath, meaning ‘Lord of the World’. Where is the world-famous Shree Jagannath temple located?", o: ["Kolkata", "Cuttack", "Puri", "Bhubaneshwar"], a: 2, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "North-South corridor, that is part of Golden Quadrilateral super highways connects which two States/Union Territories?", o: ["Jammu & Kashmir and Tamil Nadu", "Rajasthan and West Bengal", "Assam and Gujarat", "Chandigarh and Tamil Nadu"], a: 0, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "The Delhi Sultans built many cities in the area that is known as Delhi today. Which of the following was NOT built by them?", o: ["Siri", "Jahanpanah", "Lal Kot", "Tughlakabad"], a: 2, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Which type of electoral system has been adopted in case of Rajya Sabha by the Constitution?", o: ["Two Party System", "First Past The Post", "Proportional Representation", "One Party System"], a: 2, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "In which of the following years was the Indian National Congress founded, in Bombay?", o: ["1889", "1880", "1892", "1885"], a: 3, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "How many Rasas are presented in classical dances?", o: ["5", "6", "7", "9"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which is the first known instrument to measure the humidity of air or gas, built by Leonardo da Vinci around 1400?", o: ["Transmissometer", "Disdrometer", "Sling psychrometer", "Hygrometer"], a: 3, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "The Prayaga Prashasti (also known as the Allahabad Pillar Inscription) was composed in Sanskrit by Harishena, the court poet of:", o: ["Kharavela", "Samudragupta", "Harshavardhana", "Asoka"], a: 1, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "A small scale industry is defined with reference to the maximum investment allowed on assets which is equal to ________.", o: ["₹5 lakhs", "₹1 crore", "₹10 lakhs", "₹10 crores"], a: 1, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Mera Houchongba is an important festival to celebrate peace in which Indian state?", o: ["Assam", "Manipur", "Chhattisgarh", "Jharkhand"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Which of the following Articles has been inserted in the Indian Constitution by the Constitution (Eighty-Sixth Amendment) Act, 2002?", o: ["Article 55-A", "Article 21-A", "Article 31-A", "Article 25-A"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "The kinetic energy of the constitute molecules of the matter is minimum for its:", o: ["liquid state", "plasma state", "gas state", "solid state"], a: 3, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "‘Bathukamma’ is a colourful floral festival of _________ celebrated by womenfolk with exotic flowers of the region.", o: ["Gujarat", "Telangana", "Rajasthan", "Karnataka"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "The height of the net in volleyball for women must be ______.", o: ["2.24 m", "2.15 m", "2.10 m", "2.43 m"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "How many questions were canvassed during Population Enumeration in the 2011 Census of India?", o: ["29", "23", "21", "16"], a: 0, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "In which year was the 11th Fundamental duty added to the Indian Constitution?", o: ["2002", "2001", "2000", "2003"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "________ tribe is one of India's largest tribal groups, according to the 2011 census.", o: ["Kodava", "Bhil", "Khasi", "Bhutia"], a: 1, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which layer of the atmosphere is suitable and most important to humans?", o: ["Troposphere", "Exosphere", "Mesosphere", "Stratosphere"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "As per the National Infrastructure Pipeline 2019-25, what is the share of energy sector projects out of the total estimated capital expenditure of ₹111 lakh crore?", o: ["17%", "24%", "37%", "40%"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Totaram Sharma is a famous _________ player.", o: ["sarangi", "flute", "guitar", "pakhawaj"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "What was India's rank in the medal tally at Tokyo Olympic 2020?", o: ["35", "58", "48", "38"], a: 2, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Jeev Milkha Singh specialises in which event?", o: ["Golf", "Weight lifting", "Shooting", "Athletics"], a: 0, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Identify the correct pair of Indian Dancers who received the Sangeet Natak Akademi Awards 2021 for their contributions in Bharatanatyam and Kathak, respectively.", o: ["Trilochan Mohanta and Mamta Shankar", "Radha Sridhar and Kumkum Dhar", "Jayalakshmi Eshwar and Shama Bhate", "Geeta Chandran and Rajashree Shirke"], a: 2, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Deepa Sashindran, Raja Reddy and Radha Reddy are associated with which of the following Indian dances?", o: ["Bharatanatyam", "Kathakali", "Kuchipudi", "Kathak"], a: 2, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Who produced the document of Mahzar at the instance of Akbar?", o: ["Faizi", "Abul Fazl", "Shaikh Mubarak", "Abdun Nabi"], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "What is the State religion of Maldives?", o: ["Christianity", "Buddhism", "Hinduism", "Islam"], a: 3, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "The Public Accounts Committee consists of ________ members from Lok Sabha and __________ from Rajya Sabha.", o: ["15, 7", "12, 10", "13, 9", "14, 8"], a: 0, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "'Raseedi Ticket’ is an autobiography written by:", o: ["Khushwant Singh", "Baby Halder", "Amrita Pritam", "Ismat Chughtai"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "During the peak of the revolutionary phase of the Indian freedom struggle, an assassination attempt on a district magistrate of Muzaffarpur led to the uncovering of the Alipore Conspiracy in 1908. What was the name of the magistrate?", o: ["Robert Lytton", "JP Saunders", "Douglas Kingsford", "Edward Irwin"], a: 2, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "As a factor of cost, what is the other name of the net national product?", o: ["Gross national product", "Net domestic product", "Personal income", "National income"], a: 3, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "22nov2023-s1-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding/deleting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed) (2, 9, 3),(5, 23, 4)", o: ["(11, 40, 4)", "(10, 33, 3)", "(13, 36, 3)", "(12, 37, 4)"], a: 1, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "22nov2023-s1-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "22nov2023-s1-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "22nov2023-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘RADICAL’ is written as ‘BBDEJMS’ and ‘SUSPECT’ is written as ‘DFQTTUV’. How will ‘VIRTUAL’ be written in that language?", o: ["BJMSUVW", "LAUTRIV", "RIVTLAU", "WJSUVBM"], a: 0, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["10", "8", "9", "6"], a: 1, e: "", qimg: "22nov2023-s1-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "22nov2023-s1-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "22nov2023-s1-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "22nov2023-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, even if it appears to be at variance with commonly known facts, decide which of the given conclusions logically follow(s) from the statements. Statements: All students are teachers. No teacher is the Principal. Conclusions: I. No principal is student. II. All teachers are students.", o: ["Neither conclusion I nor II follows", "Both conclusions I and II follow", "Only conclusion I follows", "Only conclusion II follows"], a: 2, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given equation. 15*3*24*12*2*5", o: ["+, ×, –, =, ÷", "+, –, ×, ÷, =", "+, ×, –, ÷, =", "÷, +, –, ×, ="], a: 3, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "22nov2023-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "22nov2023-s1-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third word in the same way as the second word is related to the first word. (The words must be considered as meaningful English words and must NOT be related to each other based on the number of letters/number of consonants/vowels in the word) Brim: Edge:: Kind:?", o: ["Artificial", "Benevolent", "Illusion", "Cruel"], a: 1, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Which of the following options will replace the question mark (?) in the given series? 3, 8, 18, 33, 53, ?, 108", o: ["55", "53", "78", "39"], a: 2, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "22nov2023-s1-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "22nov2023-s1-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth number in the same way as the second number is related to the first number and the fourth number is related to the third number. 45 : 405 :: 20 : 80 :: 85 : ?", o: ["1270", "1255", "1445", "1440"], a: 2, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at 'AB' as shown.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "22nov2023-s1-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series. M N _ _ Q M _ O _ Q _ N _ P Q M N O _ _", o: ["PONPMOQP", "OPNPMOPQ", "OPPNMOQP", "PONPOMPQ"], a: 1, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Seven students, A, B, C, D, E, F and G, are standing in a straight line facing north. D is standing to the immediate left of E but to the immediate right of C. B is standing to the immediate right of A and to the immediate left of C. Similarly, F is standing to the immediate left of G, who is standing at the extreme right end. Who is standing at the third position from the left end?", o: ["B", "E", "D", "C"], a: 3, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "22nov2023-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Observe the dots on a dice (one to six dots) in the following figures. How many dots are contained on the face opposite to that containing six dots?", o: ["One", "Three", "Five", "Four"], a: 1, e: "", qimg: "22nov2023-s1-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "If ‘A’ denotes ‘+’, ‘B’ denotes ‘×’, ‘C’ denotes ‘−’ and ‘D’ denotes ‘÷’, then what will come in place of ‘?’ in the following equation? (8 B 4 A 3) D 7 = 33 D 11 A?", o: ["9", "2", "5", "7"], a: 1, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["240", "235", "230", "242"], a: 0, e: "", qimg: "22nov2023-s1-q-76.png" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "The least number which, when divided by 15,30 and 45, leaves a remainder of 8 in each case is:", o: ["94", "113", "83", "98"], a: 3, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the largest positive integer that will divide 216, 358 and 454 leaving remainder 9, 13 and 17, respectively.", o: ["23", "29", "27", "17"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of the incomes of Ram and Ganga is 3 : 4 and the ratio of their expenditures is 2 : 3. If each person saves ₹2,000, then what is the ratio of their total income together to their total expenditure together?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "22nov2023-s1-q-79.png" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "G invested ₹x in a scheme which gives 12% return. Finally, he received ₹12,000 more amount than the invested amount. How much money (in ₹) did he invest in the scheme?", o: ["120000", "100000", "112000", "80000"], a: 1, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum was invested on simple interest at a certain rate for 3 years. Had it been put at 5% higher rate, it would have fetched ₹270 more interest. The sum invested was:", o: ["₹2,000", "₹1,500", "₹1,800", "₹1,700"], a: 2, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the yearly rate of compound interest at which ₹2,400 amounts to ₹3,650.10 in a duration of 3 years.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "22nov2023-s1-q-82.png" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A and B individually can finish a work in 15 and 20 days, respectively. If B starts the work on 1 October, and they work on alternate days, the work will be finished on:", o: ["14 October", "19 October", "18 October", "9 October"], a: 2, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the value of [0.7 − {4.3 − 3.6 − (6.1 − 4.7 − 2.3)}].", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "22nov2023-s1-q-84.png" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of the numbers of boys and girls in a school is 6 : 5. If 25% of the boys and 36% of the girls are scholarship holders, then the percentage of students who DO NOT get scholarship is:", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "22nov2023-s1-q-85.png" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of two numbers is 24 and the average of three other numbers is 29. What is the average of these five numbers?", o: ["28", "25", "26", "27"], a: 3, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "In the year 2001, the production of a factory decreased by 30%. But, in 2002, the production increased by 25%. What is the resulting change (increase or decrease) in production over these two years?", o: ["Increase by 13.5%", "Increase by 12.5%", "Decrease by 13.5%", "Decrease by 12.5%"], a: 3, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper marked his items with prices 65% more than their cost price and allowed a discount of 35%. Find the percentage of his profit.", o: ["9.50%", "8.65%", "7.25%", "10.25%"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["₹24,640", "₹20,220 `", "₹24,250", "₹22,350"], a: 0, e: "", qimg: "22nov2023-s1-q-89.png" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "22nov2023-s1-q-90.png" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "In MS word 365 Which of the following keyboard shortcut keys is used to open new blank documents?", o: ["Ctrl + N", "Shift + O", "Alt + O", "Ctrl + O"], a: 0, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following alignments will give your text straight edges on both sides of the paragraph and extends each line of your text to the left and right margins in MS Word 365?", o: ["Justify", "Right alignment", "Center", "Left alignment"], a: 0, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following statements is correct about the row height of the cell in a spreadsheet in MS-Excel 2010?", o: ["Upper and lower bounds for row heights are 509 and 0, respectively.", "Upper and lower bounds for row heights are 709 and 0, respectively.", "Upper and lower bounds for row heights are 609 and 0, respectively.", "Upper and lower bounds for row heights are 409 and 0, respectively."], a: 3, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following is a type of internet connection that uses a telephone line for data transmission?", o: ["Satellite", "Broadband", "Dial up", "Fibre optic"], a: 2, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Among the following, under which tab will you find the Start Mail Merge in the Microsoft Office Professional Plus 2016?", o: ["References", "Insert", "Mailings", "Home"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following is an option present in Paragraph Formatting in MS Word 365?", o: ["Save", "Line spacing", "Replace", "Find"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "What does the cell address ‘C10’ represent in an electronic spreadsheet?", o: ["The cell in the twelfth column and the third row", "The cell in the tenth column and the third row", "The cell in the third column and the tenth row", "The cell in the third column and the twelfth row"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts is used to increase the size of the selected text in MS-Word 365?", o: ["Ctrl + ]", "Ctrl + <", "Ctrl + ?", "Ctrl + +"], a: 0, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following is a secret string of characters used to verify the identity of a user during the authentication process?", o: ["Password", "Domain name", "Username", "Website"], a: 0, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "In MS Excel, which of the following is the correct cell address of the second column and third row?", o: ["3A", "3B", "A3", "B3"], a: 3, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 22 Nov 2023 Shift-1";
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
