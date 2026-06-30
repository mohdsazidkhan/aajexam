/**
 * Seed: Delhi Police Constable - 17 Nov 2023 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc17nov2023_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-17nov2023-s1';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 17 Nov 2023 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Which of the following dates is correct with regard to the announcement of LPG model?", o: ["August 1991", "July 1991", "June 1991", "December 1991"], a: 1, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Who among the following has written the novel ‘Pinjar’?", o: ["Bhisham Sahani", "Mohan Rakesh", "Amrita Pritam", "Mannu Bhandari"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "The ________ was abruptly called off by Mahatma Gandhi due to the Chauri Chaura incident.", o: ["Kheda Movement", "Rowlatt Act Satyagraha", "Non-cooperation Movement", "Champaran Satyagraha"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Torrential rain is any amount of rain that is considered especially heavy. Accordingly, which of the following Indian regions receives this type of rainfall during October and November?", o: ["Western Rajasthan", "Southeast Karnataka", "North Bengal", "Central Maharashtra"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Who among the following is known as the ‘Shehnai maestro’?", o: ["Ustad Bismillah Khan", "Ustad Bade Ghulam Ali Khan", "Hariprasad Chaurasia", "Ustad Amjad Ali Khan"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Which of the following new words were added to Indian Constitution by the 42nd Constitutional Amendment Act? A. Socialist B. Integrity C. Fraternity D. Secular E. Equality", o: ["A, D and E only", "B, C and D only", "A, B and D only", "A, C and D only"], a: 2, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Small scale industries in 1950 were defined as all those industries in which the maximum investment was ________ lakh rupees.", o: ["ten", "fifty", "five", "twenty"], a: 2, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "What type of architecture was constructed in Hampi temples and palaces?", o: ["Vesara", "Kalinga", "Nagara", "Dravidian"], a: 3, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "When the total expenditure is less than total receipts, it is called ______________.", o: ["surplus budget", "balanced budget", "deficit budget", "estimate budget"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which Indian dance form is Darshana Jhaveri the leading exponent of?", o: ["Odissi", "Kuchipudi", "Kathak", "Manipuri"], a: 3, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which of the following string instruments is played by Braj Bhushan Kabra?", o: ["Mohan Veena", "Sitar", "Guitar", "Violin"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Which species of Arthropods is horseshoe shaped, with hard shell and spine-like tail?", o: ["Loligo", "Locusta", "Limulus", "Laccifer"], a: 2, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Theyyam dance, performed to appease and make peace with the Gods who ensure good harvest and prosperity, is popular in which of the following states?", o: ["Karnataka", "Kerala", "Jharkhand", "Andhra Pradesh"], a: 1, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which Article of the Indian Constitution provides for an Independent Election Commission for the superintendence, direction and control of the electoral roll and the conduct of elections in India?", o: ["Article 320", "Article 324", "Article 323", "Article 329"], a: 1, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Who among the following was the leader of 1857 revolt in Ramgarh state?", o: ["Zinat Mahal", "Uda Devi", "Jhalkaribai", "Avantibai Lodhi"], a: 3, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "The Green Revolution was commenced under the leadership of whom among the following Prime Ministers of India?", o: ["Gulzarilal Nanda", "Charan Singh", "Morarji Desai", "Lal Bahadur Shastri"], a: 3, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "In which case did the court rule that Parliament CANNOT amend the basic structure of the Constitution?", o: ["Balbir Mehta Case", "Ashok Mehta Case", "Kesavananda Bharti Case", "Golaknath Case"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Who among the following headed the Constitutional States Committee formed for negotiating with the states?", o: ["Dr. Rajendra Prasad", "Jawaharlal Nehru", "JB Kripalani", "Vallabhbhai Patel"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "The Rohtasgarh or Rohtas Fort is located in which river valley?", o: ["Son", "Ganga", "Karmanasa", "Ghaghara"], a: 0, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "What is the integration between countries through foreign trade and foreign investments by multinational corporations (MNCs)?", o: ["World trade", "International trade", "Globalisation", "International investment"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Under which of the following Writs can the Supreme Court and the High Courts call for the record of a case from a lower court or semi-judicial body on an allegation of an excess of jurisdiction?", o: ["Mandamus", "Prohibition", "Certiorari", "Quo Warranto"], a: 2, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "During the Mauryan period, Kalinga was the ancient name of which dominant present- day coastal state?", o: ["Andhra Pradesh", "Tamil Nadu", "Odisha", "Karnataka"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "As of October 2022, in which of the following Harappan cities was the Citadel NOT walled off?", o: ["Harappa", "Lothal", "Kalibangan", "Mohenjo-Daro"], a: 1, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Who was the leader of the French forces during the second Carnatic War?", o: ["John Ferro", "Albert Newman", "Daniel Samuel", "Joseph Francois Dupleix"], a: 3, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Who among the following was the author of Buddhacharita?", o: ["Jinasena", "Shudraka", "Dandin", "Ashvaghosha"], a: 3, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "The process of browning of sugar used extensively in cooking for the resulting sweet nutty flavour and brown colour is called:", o: ["pasteurisation", "neutralisation", "sterilisation", "caramelisation"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "In which state is the Seshachalam Biosphere Reserve located?", o: ["Andhra Pradesh", "Maharashtra", "Gujarat", "Tamil Nadu"], a: 0, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "The term ‘anchor runner’ is related to _______.", o: ["steeple chase", "1500 m race", "relay race", "marathon race"], a: 2, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Olympian boxer Vijender Singh belongs to which of the following states?", o: ["Haryana", "Chandigarh", "Delhi", "Punjab"], a: 0, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "As of the December 2022, which of the following cities of India was NOT a Railway Zone?", o: ["Hajipur", "Bilaspur", "Jabalpur", "Udaipur"], a: 3, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Who among the following personalities is an awardee of Sahitya Natak Akademi for his contribution to the Chhau dance?", o: ["Chandra Shekhar Bhanj", "Radha Reddy", "Reba Vidyarthi", "Chandralekha"], a: 0, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Maintenance functions of a living organism is a _________ process.", o: ["continuous", "long time", "one time", "short time"], a: 0, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "The first Indian Factories Act 1881 was mainly related to which subject?", o: ["Child labour", "Woman labour", "Wages rate", "Equal work equal pay"], a: 0, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "According to the census of India 2011, which of the following religions has the least population?", o: ["Christians", "Buddhists", "Jains", "Sikhs"], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "The term ‘scoop’ is related to which of the following games?", o: ["Boxing", "Hockey", "Badminton", "Football"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Secunderabad is the headquarters of which railway zone?", o: ["West Central Railway Zone", "Southern Railway Zone", "North Central Railway Zone", "South Central Railway Zone"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "‘As I Lay Dying’ is an English novel by which of the following authors?", o: ["William Faulkner", "John Dos Passos", "Stella Gibbons", "Aldous Huxley"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "According to Census of India 2011, which of the following states recorded a population density of less than 100 persons/sq. km?", o: ["Rajasthan", "Sikkim", "Odisha", "Assam"], a: 1, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "At which of the following events did Punjab’s Devansh Jagga break the national record in the Under-16 Discus Throw Competition?", o: ["34th AFI National Junior Athletics Championship", "35th AFI National Junior Athletics Championship", "36th AFI National Junior Athletics Championship", "37th AFI National Junior Athletics Championship"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "What is the range of temperature on the surface of the Moon with no atmosphere?", o: ["−110°C to 190°C", "−190°C to 110°C", "−80°C to 150°C", "−50°C to 120°C"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Which committee was appointed by the Government of India “to operationalise the suggestions to teach Fundamental Duties to the citizens of India” ?", o: ["Justice BN Srikrishna Committee", "Justice Usha Mehra Committee", "Justice AK Mathur Committee", "Justice JS Verma Committee"], a: 3, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "When is Kali Pooja celebrated in West Bengal region?", o: ["Kartika Amavasya", "Kartika Poornima", "Ashwin Amavasya", "Ashwin Poornima"], a: 0, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "To remove unemployment through skill development, how much expenditure is permissible per person on training of the urban poor, under the Deen Dayal Antyodaya Yojana?", o: ["₹12,000", "₹20,000", "₹8,000", "₹15,000"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "A reaction wherein atoms of an element in the reactants are exchanged or replaced to form new elements in the product is called:", o: ["oxidation", "addition reaction", "substitution reaction", "combustion"], a: 2, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Which of the following concepts refers to the income earned by the factors of production at factor cost in the form of wages, profits, rent, interest, etc., within the domestic territory of a country?", o: ["Net Domestic Product at Market Prices", "Net Domestic Product at Factor Cost", "Gross Domestic Product at Market Prices", "Gross National Product at Factor Cost"], a: 1, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "The Speaker and the Deputy Speaker of a state are elected by the _____________.", o: ["Attorney General", "Chief Justice of Supreme Court", "Members of the Legislative Assembly", "Chief Justice of High Court"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Who among the following Sultans of Delhi established Turkan-i-Chahalgani?", o: ["Ghiyasuddin Balban", "Bhalol Lodhi", "Iltutmish", "Alauddin Khilji"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Yamini Krishnamurthy, an eminent _________ and Bharatanatyam dancer has been awarded the Padma Bhushan and Padma Shri.", o: ["Kathakali", "Kuchipudi", "Kathak", "Sattriya"], a: 1, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "‘Azadi ka Amrit Mahotsav’ started how many weeks before the 15th August 2023 celebration?", o: ["75 weeks", "25 weeks", "50 weeks", "100 weeks"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Which ministry is implementing the ‘PM DAKSH’ scheme?", o: ["Ministry of Finance", "Ministry of Social Justice and Empowerment", "Ministry of Micro, Small and Medium Enterprises", "Ministry of Education"], a: 1, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? GOM, INO, KMQ, MLS, ?", o: ["OJV", "NKV", "NJU", "OKU"], a: 3, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third word in the same way as the second word is related to the first word. (The words must be considered as meaningful English words and must NOT be related to each other based on the number of letters/number of consonants/vowels in the word) Swing : Garden :: Stars : ?", o: ["Sky", "Camera", "Light", "Sun"], a: 0, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 1, 13, 85, 517, 3109, ?", o: ["31456", "19834", "18661", "18000"], a: 2, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["4", "5", "6", "7"], a: 3, e: "", qimg: "17nov2023-s1-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "17nov2023-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "17nov2023-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "17nov2023-s1-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 20 * 96 * 66 * 11 * 10 * 56", o: ["+ , – , ÷ , ×, =", "+ , – , ÷ , = , ×", "– , ×, ÷ , + , =", "– , + , ÷ ,×, ="], a: 0, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "D, E, F, G, H, J and K were sitting in a straight row, facing north. J was exactly between H and E. Only K was to the right of F. Only G was to the left of D. H was to the immediate left of F. Who was to the immediate right of D?", o: ["H", "J", "F", "E"], a: 3, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "17nov2023-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the given sets. (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g., 13 – Operations on 13 such as adding/ deleting/ multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed. (428, 150, 278) (401, 139, 262)", o: ["(389, 183, 206)", "(349, 145, 206)", "(191, 891, 118)", "(245, 213, 122)"], a: 0, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "17nov2023-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the option figure in which the given figure is embedded as its part (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "17nov2023-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Six numbers, 1, 2, 3, 4, 5 and 6, are written on the different faces of a dice. Three different positions of the same dice are shown (Figures 1-3). Find the number on the face opposite to the face showing ‘3’.", o: ["4", "2", "1", "5"], a: 2, e: "", qimg: "17nov2023-s1-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "17nov2023-s1-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["5", "4", "6", "3"], a: 1, e: "", qimg: "17nov2023-s1-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "17nov2023-s1-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fourth term in the same way as the first term is related to the second term and the fifth term is related to the sixth term. 98 : 9 :: ? : 13 :: 458 : 21", o: ["168", "158", "185", "186"], a: 3, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Choose the dice from the given options that is similar to the dice formed from the given sheet of paper (X).", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "17nov2023-s1-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Which of the following interchanges of signs would make the given equation correct? 7 – 4 × 40 ÷ 5 + 6 = 51", o: ["− and +", "÷ and ×", "− and ×", "+ and ×"], a: 3, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance from commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: Some Bags are Waters. All Waters are Liquids. Conclusions: I. Some Liquids are Bags. II. All Bags are Liquids.", o: ["Only conclusion II follows.", "Both conclusions I and II follow.", "Only conclusion I follows.", "Neither conclusion I nor II follows."], a: 2, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘BELONG’ is written as ‘DVTLRT’ and 'STUDIO' is written as 'MGKWWL'. How will ‘UPDATE’ be written as in that language?", o: ["KPRBUS", "KLRZBL", "KJLDFO", "KKBZLV"], a: 3, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["5", "4", "1", "2"], a: 2, e: "", qimg: "17nov2023-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "17nov2023-s1-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "17nov2023-s1-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["21 cm", "25 cm", "23 cm", "27 cm"], a: 2, e: "", qimg: "17nov2023-s1-q-76.png" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "An amount of ₹2,500 is divided into two parts in such a way that, if one part is put out at 5% p.a. simple interest and the other at 6% p.a., then the yearly annual interest will be ₹140. How much is lent at 5% p.a.?", o: ["₹500", "₹1,000", "₹2,000", "₹1,500"], a: 1, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "A man invests ₹5,000 for 3 years at compound interest. After one year, the money amounts to ₹5,450. What will be the amount (to the nearest rupee) due at the end of 3 years?", o: ["₹6,475", "₹5,575", "₹7,405", "₹6,970"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper offers a scheme on the purchase of shirts: ‘Buy two, get one free of the same kind’. The cost price of one shirt is ₹300. What should be the selling price (in ₹) of one shirt if he wants to earn 30% profit?", o: ["585", "535", "485", "435"], a: 0, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of the marks of Ram, Ramesh, Somesh and Soham in mathematics is 75, and the average of the marks of Ramesh, Somesh, Soham and Mohan in mathematics is 80. The marks scored by Mohan alone in mathematics is 70. Find the marks scored by Ram alone in mathematics.", o: ["50", "78", "62", "45"], a: 0, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "12 फुट लम्बे वर्गाकार बोर्ड की एक भुजा से 4 फुट लम्बाई का एक टुकड़ा काटा जाता है। बोर्ड के क्षेत्रफल में कितने प्रतिशत की कमी होती है?", o: ["30.33%", "13.33%", "27.27%", "33.33%"], a: 3, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "The number of prime numbers which are greater than 100 and less than 150 is:", o: ["8", "11", "10", "9"], a: 2, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Raju lost 13% by selling a radio set for ₹4,524. What percentage of profit would he have earned by selling it for ₹6,400 (rounded off to two decimal places)?", o: ["25.25%", "28.52%", "21.05%", "23.08%"], a: 3, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "If the diameter of a circle is increased by 24%, then the percentage increase in the area is:", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "17nov2023-s1-q-84.png" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["2992", "2991", "2990", "2993"], a: 0, e: "", qimg: "17nov2023-s1-q-85.png" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "In a circular race on a track of length 2000 m, X and Y start from the same point at the same time in opposite direction at the speeds of 15 km/h and 33 km/h, respectively. After how much time will they meet next?", o: ["400 sec", "250 sec", "300 sec", "275 sec"], a: 0, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "The sum of three prime numbers is 72. If one of them exceeds another by 24, then one of the numbers is:", o: ["47", "29", "37", "31"], a: 0, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["10", "100", "1", "0.1"], a: 0, e: "", qimg: "17nov2023-s1-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "Dileep and Rajesh can complete a work separately in 20 days and 30 days, respectively. In how many days will the entire work be completed, if they work on an alternate basis, starting with Rajesh?", o: ["28", "22", "12", "24"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "17nov2023-s1-q-90.png" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following statements is INCORRECT related to sorting emails in Gmail?", o: ["Sorting mail can help us remove unwanted emails from your inbox and more easily unsubscribe from mailings we don’t need.", "Depending on what we use your email address for, sorting emails can also help you keep track of trends and correspondence by looking at messages sorted by specific criteria.", "We can sort emails by a variety of factors, like the topic, sender, size, or age of the message.", "Sorting mail cannot help us remove unwanted emails from our inboxes and more easily unsubscribe from mailings we don’t need."], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "_________involves using a smartphone's data connection to provide internet access to other devices such as laptops or tablets.", o: ["Satellite", "Dial up", "Wi-Fi", "Tethering"], a: 3, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "What does the ‘Paste’ command do in Microsoft Word 365?", o: ["Deletes the content of the clipboard", "Inserts the content from the clipboard into the document", "Removes the selected text", "Copies the selected text to the clipboard"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which Microsoft Excel 365 function calculates the average of a range of numbers?", o: ["AVG", "MEDIAN", "AVERAGE", "MEAN"], a: 2, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which option in MS-Word 365 allows you to align the text in a paragraph to both the left and right margins, creating a visually appealing document?", o: ["Line Spacing", "Justification", "Paragraph Alignment", "Text Indentation"], a: 1, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which option allows you to select multiple documents while opening them in Microsoft Word 365?", o: ["Hold down the Tab key while clicking on the documents.", "Hold down the Windows key while clicking on the documents.", "Hold down the Shift key while clicking on the documents.", "Hold down the Alt key while clicking on the documents."], a: 2, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "In Microsoft Word 365, which option is used to save an existing document with a new name or in a different location?", o: ["Save As", "Save", "Copy", "Print"], a: 0, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following shortcut keys is used to modify selected text as Italic in MS- Word 365?", o: ["Ctrl + I", "Ctrl + U", "Ctrl + O", "Ctrl + B"], a: 0, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365 which file type used in MS Excel produces a comma-delimited text file that can be read by almost all spreadsheet applications on any operating system?", o: ["csv", "docx", "pdf", "xlsx"], a: 0, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Suppose you have a worksheet in MS Excel 365 containing sales data for different months. You need to update the sales figure for May, as there was an error in the initial entry. What steps should you follow to edit the sales data for the month of May?", o: ["Click on the cell containing the May sales data -> Press F6 to enter edit mode -> Make the necessary changes -> Press Enter to confirm the edit", "Click on the cell containing the May sales data -> Press F2 to enter edit mode -> Make the necessary changes -> Press Enter to confirm the edit", "Click on the cell containing the May sales data -> Press F7 to enter edit mode -> Make the necessary changes -> Press Enter to confirm the edit", "Click on the cell containing the May sales data -> Press F1 to enter edit mode -> Make the necessary changes -> Press Enter to confirm the edit"], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 17 Nov 2023 Shift-1";
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
