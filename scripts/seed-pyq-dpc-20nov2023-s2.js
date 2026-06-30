/**
 * Seed: Delhi Police Constable - 20 Nov 2023 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc20nov2023_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-20nov2023-s2';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 20 Nov 2023 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "The Rourkela Steel Plant was developed with the collaboration of ________.", o: ["France", "Germany", "Japan", "Britain"], a: 1, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "The measurement of a kho-kho field must be ________.", o: ["28 × 15 m", "29 × 16 m", "30 × 15 m", "27 × 16 m"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Who was the Minister of Finance when the economic reforms of 1991 took place in India?", o: ["Mr. Bimal Jalan", "Mr. P Chidambaram", "Mr. Pranab Mukherjee", "Dr. Manmohan Singh"], a: 3, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Kavadi Aattam is a major folk dance form of which of the following states of India?", o: ["Tamil Nadu", "Kerala", "Sikkim", "Karnataka"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Which of the following nations won the third blind cricket World Cup T20 championship?", o: ["India", "Bangladesh", "Pakistan", "Sri Lanka"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "During the British era Indian economy was known as ________.", o: ["a source for its raw material", "a developed economy", "only a market for agricultural products", "a source for finished capital goods"], a: 0, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "After which incident did Mahatma Gandhi call off the non-cooperation movement?", o: ["Jallianwala Bagh massacre of 1919", "Chauri Chaura killing in 1922", "Chauri Chaura killing in 1925", "Jallianwala Bagh massacre of 1922"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Which of the following statements is correct with respect to basketball?", o: ["Each team is made up of 11 players, with only 7 allowed on the court at any time.", "Each team is made up of 12 players, with only 5 allowed on the court at any time.", "Each team is made up of 11 players, with only 4 allowed on the court at any time.", "Each team is made up of 12 players, with only 8 allowed on the court at any time."], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which of the following statements is INCORRECT regarding the collegium system?", o: ["This system started in the year 2007.", "This system was evolved through Supreme Court judgment.", "It recommends the appointments and transfers of judges.", "It consists of Chief Justice and four senior judges of Supreme Court."], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "The Communist Party of India was formed in 1925 at the first Party Conference in _________ .", o: ["Madras", "Kanpur", "Bombay", "Delhi"], a: 1, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which of the tides have variations in height?", o: ["Mixed tide", "Semi diurnal tide", "Diurnal tide", "Neap tide"], a: 0, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Which of the following is considered to be the most liquid asset?", o: ["Gold", "Bond", "Land", "Money"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "The Republic Day parade, in the year 1955, was organised at which of the following places in Delhi?", o: ["Rajghat", "Old Fort", "Rajpath", "Parliament House Street"], a: 2, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Padma Bhushan awardee Kumari Kamala is an exponent of _________ .", o: ["Odissi", "Sattriya", "Bharatanatyam", "Mohiniyattam"], a: 2, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "The Vithal temple of Hampi has _________ columns that produce musical notes.", o: ["75", "63", "56", "49"], a: 2, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "In the year 2022, Arjun Singh Dhurve was conferred the Padma Shri for his contribution to which of the following dance forms?", o: ["Bharatanatyam", "Baiga Tribal Dance", "Kathak", "Chhau"], a: 1, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Which famous Chinese philosopher and scholar emphasised the importance of ethical values, family relationships and social harmony in his teachings?", o: ["Confucius", "Mao Zedong", "Sun Tzu", "Laozi"], a: 0, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Who among the following gave Tansen the title of ‘Mian’?", o: ["Shah Jahan", "Akbar", "Babur", "Humayun"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Which of the following writs is issued by a superior court to compel a lower court or a government officer to perform mandatory or purely ministerial duties correctly?", o: ["Quo warranto", "Certiorari", "Habeas Corpus", "Mandamus"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "When was the Sampoorna Grameen Rozgar Yojana launched?", o: ["2000", "2001", "2003", "2002"], a: 1, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Which of the following is a major inorganic source of food?", o: ["Meat", "Water", "Grains", "Vegetables"], a: 1, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which report of the Second Administrative Reforms Commission is related to the recommendations on Panchayati Raj?", o: ["5th", "4th", "6th", "3rd"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Which of the following is/are meant for promoting the ideals of social and economic democracy?", o: ["Single Citizenship", "Fundamental Duties", "Co-Operative Societies", "Directive Principles of State Policy"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "In the mid-eighth century, Dantidurga, a Rashtrakuta chief overthrew his Chalukya overlord and performed a ritual called ____________.", o: ["Ashvamedha Yajna", "Rajasuya Yajna", "Hiranya-GarbhaYajna", "Deva Yajna"], a: 2, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "On which of the following days is Netaji Subash Chandra Bose’s birth anniversary celebrated?", o: ["23 March", "14 November", "23 January", "16 January"], a: 2, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "In which of the following years had Bal Gangadhar Tilak founded the Home League?", o: ["1924", "1912", "1934", "1916"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "The Contingency Fund of India is operated by the _________.", o: ["Speaker", "Finance Minister", "President", "Prime Minister"], a: 2, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a salient feature of liberalisation?", o: ["Abolishment of industrial licensing", "Autonomy to determine the prices", "Selling part of equity shares of public sector undertakings to public", "De-reservation of goods for small scale industry"], a: 2, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which of the following additions in the Indian Constitution was based on the suggestions of the Swaran Singh Committee?", o: ["Emergency Provisions", "Fundamental Rights", "Directive Principles of State Policy", "Fundamental Duties"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Who among the following had written the ‘Kamayani’?", o: ["Mahadevi Verma", "Jaishankar Prasad", "Sumitranandan Pant", "Amrita Pritam"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "To grant autonomy to firms, some public sector units were given special status. Which of the following was NOT one of the statuses?", o: ["Maharatnas", "Navratnas", "Miniratnas", "Devratnas"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Which of the following statements about hurricanes is true?", o: ["Related to Western Pacific", "Related to Atlantic", "Related to Indian ocean", "Related to Western Australia"], a: 1, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Which of the following is the highest peak of Western Ghats?", o: ["Anai Mudi", "Doda Betta", "Javedi Hills", "Mahendra Giri"], a: 0, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following claims about abiotic is false?", o: ["Water is an abiotic component of the ecosystem", "Abiotic components of the ecosystem were never alive", "They are the non-living components of the ecosystem", "They are the living components of the ecosystem"], a: 3, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "According to Mughal records, during Akbar’s reign, there were 29 Mansabdars with a rank of ___________.", o: ["2,500 zat", "5,000 zat", "7,000 zat", "500 zat"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Which of the following is an example of the cooperative sector industry?", o: ["Steel Authority of India Limited", "Dabur Industry", "Coir Industry", "Bajaj Auto Limited"], a: 2, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Which of the following was adopted as the ‘National Emblem’ on 26 January 1950?", o: ["Lion capital of Sarnath", "Single bull capital at Rampurva", "Single lion capital at Lauriya Nandangarh", "Single lion capital at Rampurva"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Pandit S Ballesh Bhajantri is a _____________ artist.", o: ["Sarod", "Shehnai", "Sitar", "Santoor"], a: 1, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "A dispute petition in the election of the President of the India can be filed in:", o: ["Both, the Supreme Court of India and the High Court of any state", "Only the Supreme Court of India", "Any court within the territory of India", "Only the Delhi High Court"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which of these dances is commonly performed in Odisha?", o: ["Grida dance", "Raas Leela", "Ghumura", "Chakyar Koothu"], a: 2, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Which method was used for making bronze statues during Harrapan Civilisation?", o: ["Lost wax casting", "Ivory carving", "Stone carving", "Wood carving"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Who inaugurated the 36th National Games, which were held in the year 2022?", o: ["Narendra Modi", "Kiren Rijiju", "Nisith Pramanik", "Anurag Thakur"], a: 0, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "The Congress and the Muslim League signed the historic ________ in 1916.", o: ["Lahore Pact", "Surat Pact", "Delhi Pact", "Lucknow Pact"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "‘My Country My life’, is the autobiography of which of the following ex-Deputy Prime Minister of India?", o: ["Vallabh Bhai Patel", "Jagjivan Ram", "Lal Krishna Advani", "Morarji Desai"], a: 2, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "The value of final goods and services produced in a country is known as _________ .", o: ["national income", "national productivity", "per capita income", "distribution of income"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "How many openings does the digestive system in Platyhelminthes have?", o: ["Single", "Indefinite", "Triple", "Double"], a: 0, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "प्रारंभिक वैदिक समाज में, परिवार के मुखिया को किस नाम से जाना जाता था?", o: ["ग्रामणी", "व्रजपति", "पुरोहित", "कुलपा"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Which physicist is known for extensive research in ‘radiation phenomena’ and the discovery of polonium and radium?", o: ["Lise Meitner", "Rosalind Franklin", "Helen Quinn", "Marie Curie"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Which organisation releases the official poverty estimates in India based on data collected from the National Sample Survey Office (NSSO) and other sources?", o: ["World Bank", "NITI Aayog", "Reserve Bank of India", "Ministry of Finance"], a: 1, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Which of the following plans was introduced in the year 1945, before planned economic development began in India?", o: ["The Gandhian Plan", "The People’s Plan", "The Sarvodaya Plan", "The Bombay Plan"], a: 1, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Observe the dots on a dice (one to six dots) in the following figures. How many dots are contained on the face opposite to that containing four dots?", o: ["Two", "One", "Three", "Six"], a: 3, e: "", qimg: "20nov2023-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series. C _ E _ T _ W _ R T C W _ R _ C W E _ _", o: ["WRCEETRT", "WRCERTRT", "WRCERERT", "WRCETERT"], a: 0, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["÷ and ×", "÷ and +", "− and +", "− and ×"], a: 0, e: "", qimg: "20nov2023-s2-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown below. Choose a figure which would most closely resemble the unfolded form of the paper.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "20nov2023-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "20nov2023-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "20nov2023-s2-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Six friends Farheen, Pooja, Richa, Sonika, Vani and Tanya are sitting around a circular table facing the centre. Farheen is an immediate neighbour of both Pooja and Richa. Sonika is sitting second to the right of Pooja. Vani is sitting third to the left of Richa. Tanya is an immediate neighbour of both Sonika and Richa. Who sits to the immediate left of Tanya?", o: ["Richa", "Pooja", "Farheen", "Sonika"], a: 3, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fourth number in the same way as the first number is related to the second number and the fifth number is related to the sixth number. 216 : 344 :: ? : 126 :: 27 : 65", o: ["68", "66", "70", "64"], a: 3, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding/subtracting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed) (7, 16, 168) (3, 28, 126)", o: ["(9, 17, 153)", "(8, 7, 136)", "(11, 18, 396)", "(6, 11, 99)"], a: 3, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Which of the following options will replace the question mark (?) in the given series? 71, 213, 639, 1917, 5751, ?", o: ["19479", "11643", "17253", "16509"], a: 2, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 8*1*4*2*16*2*8", o: ["= × + × ÷ −", "+ − ÷ × × =", "× + × − ÷ =", "÷ × − + × ="], a: 2, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, even if it appears to be at variance with commonly known facts, decide which of the given conclusions logically follow(s) from the statements. Statements: Some backpacks are bags. All backpacks are luggage. Conclusions: I. Some luggage are bags. II. Some luggage are backpacks.", o: ["Neither conclusion I nor II follows", "Both conclusions I and II follow", "Only conclusion I follows", "Only conclusion II follows"], a: 1, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "In a certain code language, 'ORBIT' is written as 'SHAQN' and 'PLANT' is written as 'SMZKO'. How will 'PLUTO' be written in that language?", o: ["OKTSN", "NSTKO", "NSTKP", "SSTKQ"], a: 1, e: "", qimg: "" },
  { n: 64, s: "Reasoning / Logical Ability", q: "The given figure is followed by four option figures. Select the option figure in which this figure is embedded (i.e., contains this figure in the same form; rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "20nov2023-s2-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. BOAT : XESF :: MANY : CREQ :: TIME : ?", o: ["JQMW", "JQMX", "IQMX", "IQNY"], a: 2, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Choose the option figure in which the problem figure is hidden/embedded. (Rotation is not allowed)", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "20nov2023-s2-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Six numbers 1, 2, 3, 4, 5 and 6 are written on different faces of a dice. Two positions of this dice are shown in the figure. Find the number on the face opposite to 5.", o: ["2", "3", "1", "6"], a: 3, e: "", qimg: "20nov2023-s2-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "20nov2023-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "20nov2023-s2-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "20nov2023-s2-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "20nov2023-s2-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "20nov2023-s2-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "20nov2023-s2-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "20nov2023-s2-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["36", "40", "32", "30"], a: 2, e: "", qimg: "20nov2023-s2-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "20nov2023-s2-q-76.png" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["55.56%", "52.56%", "60.56%", "57.56%"], a: 0, e: "", qimg: "20nov2023-s2-q-77.png" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "There are four prime numbers written in ascending order. The product of the first three is 30 and that of the last three is 165. Find the last number.", o: ["11", "7", "17", "13"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "The cost of an item increased to ₹250 from ₹225. What is the percentage increase in the cost?", o: ["11.11%", "13.33%", "9.5%", "16.66%"], a: 0, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper gives a discount of 10% on the marked price. If the selling price is ₹6,750, then find the discount.", o: ["₹750", "₹700", "₹650", "₹800"], a: 0, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "A can complete a work in 16 days and B can complete the same work in 26 days. What will be the number of days required by A and B to complete the same work together?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "20nov2023-s2-q-81.png" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "If the average of 10 numbers is 625 and the average of 25 numbers is 100, then the average of 35 numbers is equal to _______.", o: ["362.5", "66.5", "315", "250"], a: 3, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A certain sum amounts to ₹1,725 in 3 years and ₹1,875 in 5 years on simple interest. The interest rate per annum is:", o: ["6%", "5%", "4%", "7%"], a: 1, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "The compound amount of a certain sum of money in 2 years and 3 years becomes ₹12,260 and ₹12,873, respectively. Find the rate of interest.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "20nov2023-s2-q-84.png" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "A football can occupy 36π cm3 of air. Its radius (in cm) will be:", o: ["5", "2", "4", "3"], a: 3, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "Two stations, A and B are 100 km apart on a straight line. One train starts from A at 7 A.M. and travels towards B at a speed of 20 km/h. Another train starts from B at 8 A.M. and travels towards A at a speed of 25 km/h. At what time they will meet?", o: ["10.47 A.M.", "11.05 A.M.", "10.37 A.M.", "9.47 A.M."], a: 3, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the area of triangle whose sides are 6 cm, 8 cm and 10 cm long.", o: ["12 cm2", "24 cm2", "20 cm2", "28 cm2"], a: 1, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Which of the following is the largest ratio?", o: ["3 : 5", "6 : 5", "4 : 5", "7 : 10"], a: 1, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper sells two articles at a ₹840 each. He earns a 20% profit on the first article and incurs a 20% loss on the second article. Determine the percentage of net profit or loss he incurs.", o: ["Profit of 5%", "Loss of 5%", "Loss of 4%", "Loss of 3%"], a: 2, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "If the product of two co-prime numbers is 306, then the LCM of the numbers is:", o: ["306", "153", "18", "17"], a: 0, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following is a commonly used word processing package?", o: ["Microsoft Word", "Microsoft Excel", "Google Chrome", "Adobe Photoshop"], a: 0, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, in which of the following Ribbon tabs does the add rows option reside in MS Excel 365?", o: ["Home → Insert", "Home → File", "Home → Edit", "Home → Format"], a: 0, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following CANNOT be the default font size in the font-menu dropdown list in MS Word 365 in Windows 10?", o: ["10", "11", "9", "13"], a: 3, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which technology is commonly used for sending and receiving electronic mail?", o: ["Telephony", "Postal services", "Fax machines", "Internet and email protocols"], a: 3, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which of the following is the shortcut key in MS Excel to print a spread sheet?", o: ["Alt + I", "Ctrl + I", "Ctrl + P", "Alt + P"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following is/are parts of the standard Structure of Electronic mail?", o: ["Both Header and Body", "Only Body", "Neither Header nor Body", "Only Header"], a: 0, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "The group of buttons or icons below the menu bar in a word processing software are called:", o: ["status bars", "dialog boxes", "toolbars", "menus"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "What is the full form of NetBIOS?", o: ["Network Basic Input / Output System", "Network Based Input / Output System", "Networking Binary Input / Output System", "Net Binary In / Out System"], a: 0, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, Which of the following shortcut keys is used to save a workbook in MS Excel?", o: ["F6", "Ctrl+A", "Ctrl+S", "F1"], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following is the correct shortcut key used to increase paragraph indention in MS Word 365?", o: ["Ctrl + L", "Ctrl + Tab", "Ctrl + M", "Ctrl + I"], a: 2, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 20 Nov 2023 Shift-2";
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
