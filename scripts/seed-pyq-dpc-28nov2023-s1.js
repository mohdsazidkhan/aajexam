/**
 * Seed: Delhi Police Constable - 28 Nov 2023 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc28nov2023_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-28nov2023-s1';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 28 Nov 2023 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "The structures of temples located in India are classified as phamsana and latina on the basis of which of their parts?", o: ["Garbagriha", "Amalaka", "Shikhara", "Mandap"], a: 2, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Which of the following is the major reservoir of carbon on earth?", o: ["Ponds", "Rivers", "Ocean", "Lakes"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "If nominal GDP is ₹1,800 and real GDP is ₹1,000. What will be the value of GDP deflator?", o: ["180%", "200%", "190%", "150%"], a: 0, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Which of the following dance forms is performed by the tribal people of Andhra Pradesh?", o: ["Bihu", "Garba", "Jawara", "Dhimsa"], a: 3, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "At what degree from the epicentre does the seismograph record the arrival of P-waves but NOT S-waves?", o: ["Beyond 105°", "Between 90° and 115°", "Beyond 145°", "Within 90°"], a: 2, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Which of the following statements is/are true about globalisation? I. It is about integration with world economies II. It promotes competition among producers III. Appreciation of domestic currency improves exports", o: ["Only I and II", "Only I and III", "Only I", "Only II and III"], a: 0, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "What was the fraction of sales price collected as tax under the Mauryans?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "28nov2023-s1-q-7.png" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "In which of the following years was the Arjuna Award started in India?", o: ["1963", "1961", "1964", "1962"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Hydrogenation of vegetable oils is catalysed by ___________.", o: ["Al", "Cu", "Ni", "Fe"], a: 2, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Indian Constitution states that ‘The Directive Principles of State Policy are fundamental in the governance of the country and it shall be the duty of the State to apply the Principles in making laws’?", o: ["Article 51", "Article 38", "Article 37", "Article 36"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Sarva Shiksha Abhiyan is a flagship programme of the government of India, that was started in 2001 to achieve ________.", o: ["Universalisation of Higher Education (UHE)", "Universalisation of School Education (USE)", "Universalisation of Pre-primary Education (UPPE)", "Universalisation of Elementary Education (UEE)"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "The Finance Commission submits its report to the:", o: ["President of India", "Finance Minister", "Prime Minister of India", "Parliament"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Which among the following states has the lowest poverty ratio as per the Multidimensional Poverty Index (2021) of the NITI Aayog?", o: ["Kerala", "Tamil Nadu", "Goa", "Sikkim"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "The ‘Valmiki Ambedkar Awas Yojana’ (VAMBAY) was launched in which year by the Government of India?", o: ["2007", "2003", "2001", "2005"], a: 2, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "The Teesta low dam is located in which of the following states?", o: ["Sikkim", "Bihar", "Arunachal Pradesh", "Tripura"], a: 0, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "The main source of ocean heat is __________.", o: ["gases under water", "air", "sunlight", "minerals under water"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Swami Vivekananda established which of the following social organisations in 1897?", o: ["Arya Samaj", "Prarthana Samaj", "Paramhansa Sabha", "Ramakrishna Mission"], a: 3, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "‘Kim’, the English novel about a boy, was written by which of the following authors?", o: ["Joseph Conrad", "Ruskin Bond", "Jerome K Jerome", "Rudyard Kipling"], a: 3, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "In which of the following years was the Central Vigilance Commission set up by the Government of India?", o: ["1975", "1964", "1970", "1984"], a: 1, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Tamladu is the religious festival of the Digaru Mishmis tribe of which Indian state?", o: ["Madhya Pradesh", "Jharkhand", "Arunachal Pradesh", "Odisha"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a Fundamental Duty?", o: ["To develop the scientific temper", "To pay income tax in time", "To value rich heritage", "To protect the natural environment"], a: 1, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Name the employee of the East India Company who deciphered Asokan Brahmi in 1830s.", o: ["James Prinsep", "James Mills", "William Risley", "William Crookes"], a: 0, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "In 2022, Air India was privatised. Which of the following private business groups has taken over Air India?", o: ["Adani", "Birla", "TATA", "Reliance"], a: 2, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "The Halda festival of Himachal Pradesh is primarily celebrated by which religious community?", o: ["Hindu", "Jain", "Buddhist", "Parsi"], a: 2, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a Directive Principle of State Policy?", o: ["Valuing the rich heritage of our culture", "Promotion of co-operative societies", "Uniform civil code for the citizens", "Separation of judiciary from executive"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "In which year did India qualify for the FIFA World Cup?", o: ["1958", "1954", "1946", "1950"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "In India, there are various crops produced. Which group of crops belong to the pulses?", o: ["Tea and coffee", "Jute and cotton", "Wheat and rice", "Gram and tur"], a: 3, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Which of the following Statutory Commissions was set up to study the working of the government after the Government of India Act 1919 was passed?", o: ["The Hunter Commission", "The Butler Commission", "The Simon Commission", "The Campbell Commission"], a: 2, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Kummi dance, usually performed during harvest festivals and Navratri, is a popular dance of which southern state?", o: ["Karnataka", "Tamil Nadu", "Telangana", "Andhra Pradesh"], a: 1, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Which mountain range includes the Shiwalik range as a part?", o: ["Western Ghats", "Eastern Ghats", "Himalayas", "Aravalli"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Which of the following nations won the inaugural under-19 women's cricket world championship?", o: ["New Zealand", "England", "Australia", "India"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Schedule A of the Industrial Policy Resolution 1956 comprised of industries which would be:", o: ["in the private sector", "owned by both private and public sector", "exclusively owned by foreign nationals", "exclusively owned by the state"], a: 3, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "The disintegration of the Bahamani Empire gave rise to ________ independent kingdoms in Deccan.", o: ["four", "five", "two", "seven"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Articles 36 to 51 of the Indian Constitution does NOT deal with which issues?", o: ["Equal justice and free legal aid", "Secure suitable legislation and living wage for workers", "Secure a social order for promotion of welfare of the people", "Control of economic fluctuations for the benefits of a person or group"], a: 3, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "The famous tripartite struggle between the Gurjara-Pratihara, Rashtrakuta and Pala dynasties was fought for control over ________.", o: ["Panipat", "Manyakheta", "Avanti", "Kannauj"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Which state of the matter has LEAST force of attraction between its particles?", o: ["Solid", "Plasma", "Liquid", "Gas"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Madhu Mansuri Hasmukh is a singer, song writer and activist from the state of ____________.", o: ["Madhya Pradesh", "Andhra Pradesh", "Jharkhand", "Chhattisgarh"], a: 2, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "The ‘Population Projection’ in demographics refers to _________.", o: ["measuring the population growth rate", "identifying the sex ratio in a particular area", "calculating the population density of a region", "estimating future population size based on past data and trends"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Part ___________________ of the Constitution of India deals with the Union Executive.", o: ["V", "VI", "I", "III"], a: 0, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "The term 'slip' is related to which of the following games?", o: ["Cricket", "Hockey", "Badminton", "Football"], a: 0, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Which of the following is an example of the most ‘Liquid form of Money’?", o: ["National savings deposits", "Currency notes", "Fixed deposit receipts", "Bonds"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Who among the following established the Academy of Performing Arts and Research in Switzerland?", o: ["Pandit Kumar Gandharva", "Pandit Bhimsen Joshi", "Dr. M Balamuralikrishna", "Pandit Jasraj"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "The interim Government was provisioned under which Plan/Act of the Government of India, by the Britishers?", o: ["Cripps Mission Plan", "Cabinet Mission Plan", "Government of India Act, 1935", "Government of India Act, 1919"], a: 1, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Who founded the Abhinav Bharat Society?", o: ["Lala Hardayal", "Madan Lal Dhingra", "P Mitra", "Savarkar Brothers"], a: 3, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "The fundamental objective of the second five year plan was to initiate and accelerate the process of ________ so that the development of Indian economy takes a firm base.", o: ["liberalisation", "globalisation", "industrialisation", "privatisation"], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Who among the following is a famous Chhau dancer?", o: ["Sadashiva Pradhan", "Alloka Kanungo", "Pratibha Prahlad", "Chhaya Khutegaonkar"], a: 0, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Tanjore Bala saraswati was a prominent dancer of which form of Indian Classical Dance?", o: ["Manipuri", "Bharatanatyam", "Odissi", "Kuchipudi"], a: 1, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "The Stupa sculptures found at Sanghol in Punjab belongs to which of the following schools?", o: ["Gandhara", "Sarnath", "Amravati", "Mathura"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Select the correct sequence of the following steps during the process of photosynthesis. i. Chlorophyll helps in absorbing light energy. ii. Light energy is converted into chemical energy and the water molecule is split into oxygen and hydrogen molecules. iii. Carbon dioxide is converted into carbohydrates.", o: ["Step i and step ii always occur together and step iii can occur any other time", "They always occur sequentially in the order i −> ii −> iii", "Step i occurs first and steps ii and iii occur together next", "These steps need not occur one after another immediately"], a: 1, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Which of the following cricketers has written the autobiography titled ‘At the Close of Play’?", o: ["Ricky Ponting", "Matthew Hayden", "Kevin Pieterson", "Chris Gayle"], a: 0, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: All bats are balls. All balls are wickets. Conclusions: I. All wickets are balls. II. All bats are wickets.", o: ["Neither conclusion I nor II follows", "Only conclusion II follows", "Both conclusions I and II follow", "Only conclusion I follows"], a: 1, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding/deleting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed) (3, 198, 6) (5, 495, 9)", o: ["(9, 1288, 12)", "(5, 424, 8)", "(4, 352, 8)", "(7, 827, 11)"], a: 2, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "28nov2023-s1-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s1-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster. KGMQ : EQGA :: LZUD : FJON :: JRCO : ?", o: ["DNSY", "DBWY", "KXWB", "KRWY"], a: 1, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s1-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Seven friends, Gauri, Vinod, Ridima, Jiya, Ritik, Vishal and Karishma, are sitting on a circular bench, facing towards the centre but not necessarily in the same order. Vinod and Jiya are not the neighbours of Ritik. Karishma is sitting third to the left of Ritik. Gauri is sitting to the immediate right of Karishma. Ridima is sitting to the immediate left of Ritik. Who is sitting second to the right of Gauri?", o: ["Vinod", "Jiya", "Ridima", "Ritik"], a: 3, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["Q", "T", "P", "S"], a: 3, e: "", qimg: "28nov2023-s1-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "28nov2023-s1-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "If + means −, − means ×, × means ÷ and ÷ means +, what is the value of the following expression? 8 – 2 + 6 × 3 ÷ 5", o: ["20", "21", "19", "23"], a: 2, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "28nov2023-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? RTV, PQR, ?, LKJ, JHF", o: ["MNO", "MNM", "NOM", "NNN"], a: 3, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "28nov2023-s1-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "28nov2023-s1-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s1-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "28nov2023-s1-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 5 : 45 :: 4 : ? :: 12 : 108", o: ["24", "36", "40", "48"], a: 1, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 7, 11, 23, 59, 167, ?", o: ["324", "678", "491", "346"], a: 2, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["28", "25", "32", "23"], a: 3, e: "", qimg: "28nov2023-s1-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "28nov2023-s1-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 658 * 14 * 3 * 32 * 56 * 165", o: ["= ÷ ×− +", "÷ ×− + =", "× ÷ − + =", "÷ × + − ="], a: 1, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s1-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘PENCIL’ is written as ‘NEPLIC’ and ‘ERASER’ is written as ‘ARERES’. How will ‘GEOMETRY’ be written in that language?", o: ["MEOGRYTE", "MEOGRRTE", "MOEGYRTE", "MEOGYRET"], a: 2, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "In a chief election, a candidate got 55% of the total valid votes. 6% of the total votes were declared invalid. If the total number of votes is 30,000, then the number of valid votes polled in favour of the candidate is:", o: ["15,510", "15,000", "16,000", "15,500"], a: 0, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "Namita deposited ₹9,000 which amounted to ₹10,200 after 3 years at simple interest per annum. Had the interest been 2% more, what amount (in ₹) would she get?", o: ["11400", "12480", "10740", "11260"], a: 2, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "Anil's income is 18% more than Ramesh’s income. By what percentage is Ramesh’s income less than Anil's income?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "28nov2023-s1-q-78.png" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "P and Q can finish a work individually in 30 and 45 days, respectively. P starts the work and works alone for 5 days. Then Q joins him and they work together for 6 days, after which P leaves. The part of the work left at that point is:", o: ["0.5", "0.6", "0.2", "0.4"], a: 0, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the area of a triangle whose sides are of lengths 9 cm, 40 cm and 41 cm?", o: ["170 cm2", "180 cm2", "160 cm2", "210 cm2"], a: 1, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["27", "23", "15", "21"], a: 3, e: "", qimg: "28nov2023-s1-q-81.png" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A train moving at uniform speed crosses a pole in 3 seconds and a 700 m long bridge in 10 seconds. What is the speed of the train?", o: ["150 m/s", "110 m/s", "120 m/s", "100 m/s"], a: 3, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["3.1", "5.1", "4.1", "6.1"], a: 1, e: "", qimg: "28nov2023-s1-q-83.png" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of the prime numbers between 57 and 99 (both inclusive) is: (Rounded off to one decimal place)", o: ["85.6", "75.4", "87.7", "79.3"], a: 1, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "Let N be a three-digit positive integer such that the unit digit of N is prime and the product of all the digits of N is also prime. The number of possible values of N is:", o: ["4", "12", "3", "8"], a: 0, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of the sixth and seventh terms of the sequence 1, 3, 6, 10, … is:", o: ["4 ∶ 3", "3 ∶ 5", "5 ∶ 3", "3 ∶ 4"], a: 3, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of 6 terms is 30. The first term is twice the sum of the remaining terms. Find the first term.", o: ["120", "60", "80", "100"], a: 0, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "A book is sold at three successive discounts of 20%, 30% and 10%. The net discount in percentage is:", o: ["49.60%", "60%", "37.60%", "47.60%"], a: 0, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "A moneylender borrows money at 4% per annum and pays the interest at the end of the year. He lends it at 8% per annum compound interest, compounded half-yearly, and receives the interest at the end of the year. In this way, he gains ₹166.4 a year. Find the amount of money he borrows.", o: ["₹4,500", "₹6,500", "₹5,050", "₹4,000"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "A dealer sells an item for ₹500 by making a profit of 25%. He sells another item at a loss of 10%, and on the whole, makes neither profit nor loss. What did the second item cost him?", o: ["₹1,000", "₹500", "₹750", "₹800"], a: 0, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following chart types is best suited for showing trends over time?", o: ["Line chart", "Scatter plot", "Pie chart", "Bar chart"], a: 0, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following options quickly changes the font of the selected text in Microsoft Word 365 without opening the Font dialog box?", o: ["Right-click and select \"Font\"", "Press Ctrl + + F", "Use the Font drop-down menu on the Status bar", "Double-click the text"], a: 0, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "The ________ symbol is employed to separate the username and domain name within an email address.", o: ["&", ". (dot)", "@", "$"], a: 2, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a Change Case option in MS word 365?", o: ["Sentence case", "Page case", "Uppercase", "Toggle case"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "What is the primary differentiating factor between broadband and dialup connections offered by ISPs?", o: ["Dialup connections offer higher security levels than broadband.", "Broadband provides faster internet speeds compared to dialup.", "Dialup connections are wireless, while broadband requires wired connections.", "Dialup offers unlimited data usage, unlike broadband."], a: 1, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "What is the purpose of the Help feature in Microsoft Word 365?", o: ["To provide access to online tutorials and resources", "To provide assistance in creating documents", "To allow customisation of the user interface", "To offer grammar and spelling suggestions"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "How do you change the font style and size of selected text in MS-Excel 365?", o: ["Access the ‘Home’ tab, use the ‘Font’ group.", "Apply a new cell style to the selected text.", "Press the ‘Ctrl+F’ shortcut keys together.", "Right-click the text and choose ‘Font’."], a: 0, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following is the correct option to create a table in MS-Word 2010?", o: ["Home Tab -> Create Table", "Home Tab -> Insert Table", "Create Tab -> Insert Table", "Insert Tab -> Table Button"], a: 3, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following functions is executed in MS Word 365 when Ctrl + V is used?", o: ["Copy the data", "Cut the data", "Paste the data", "Select all the data"], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "In a worksheet, there is a list of student scores in a column. To count the number of students who scored above 90, which Excel 365 function should be used?", o: ["COUNT", "COUNTIF", "COUNTBLANK", "COUNTA"], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 28 Nov 2023 Shift-1";
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
