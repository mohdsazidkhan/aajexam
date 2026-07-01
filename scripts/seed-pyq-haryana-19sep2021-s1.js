/**
 * Seed: Haryana Police Constable (Female) - 19 Sep 2021 Shift-1
 * Haryana Police Constable written exam (scanned bilingual paper, English version
 * seeded). 100 Q x 1 mark, 4 options, no negative marking. Reuses Exam
 * `HR-POL-CONST` + ExamPattern 'Haryana Police Written Exam'. The scan carried no
 * official key (only unreliable hand-marks) -> answers derived by independent
 * solving; Haryana-state-specific GK falls back to the scan marks.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not found'); process.exit(1); }

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

const TAGS = ["Haryana Police", "Constable", "PYQ", "2021", "Haryana Police Constable (Female) - 19 Sep 2021 Shift-1"];
const RAW = [
  { n: 1, s: "Reasoning", q: "If Vijay's position in a row is 13 from the front side and 6 from the back side, how many persons are standing in that row?", o: ["19", "20", "17", "18"], a: 3 },
  { n: 2, s: "Numerical Ability", q: "3 - 3 + 3 - 3 ..... 101 times =", o: ["3", "0", "-3", "None of these"], a: 0 },
  { n: 3, s: "Numerical Ability", q: "2000 soldiers in a fort had enough food for 20 days. But some soldiers were transferred to another fort and the food lasted for 25 days. How many soldiers were transferred?", o: ["450", "500", "525", "400"], a: 3 },
  { n: 4, s: "Reasoning", q: "Find the missing character from the given alternatives. (A figure of two cells with diagonals: left cell has 20160 top, ? left, 480 bottom-left, 96 bottom-centre; right cell has 4 top, 4 right, 8 bottom-right, 24 bottom-centre.)", o: ["1140", "3240", "2880", "800"], a: 2 },
  { n: 5, s: "General Studies", q: "In 1955, S. R. Rao began excavation of Harappan site at", o: ["Kalibangan", "Lothal", "Dholavira", "Mohenjodaro"], a: 1 },
  { n: 6, s: "Haryana GK", q: "____________ number of Police Commissionerates in Haryana.", o: ["1", "4", "5", "3"], a: 2 },
  { n: 7, s: "Reasoning", q: "If the first half of the alphabet is written in the reverse order, which of the following will be the 19th letter from your right?", o: ["H", "E", "D", "F"], a: 3 },
  { n: 8, s: "General Science", q: "Which of the following are called sac-fungi?", o: ["Phycomycetes", "Ascomycetes", "Basidiomycetes", "Deuteromycetes"], a: 1 },
  { n: 9, s: "Computer Knowledge", q: "Along with a computer's IP address, another unique number given to each computer using Ethernet is something called the", o: ["Port number", "MAC address", "URL address", "Virtual address"], a: 1 },
  { n: 10, s: "Haryana GK", q: "What is the score obtained by Haryana in SDG India Index 2020-21 released by NITI Aayog?", o: ["67", "57", "47", "None of the above"], a: 0 },
  { n: 11, s: "General Studies", q: "'The Council of Ministers' of Central Govt. comes into existence only after", o: ["All the Ministers have taken the Oath of office", "The Prime Minister has taken the Oath of office", "Allocation of portfolios", "Winning the confidence of Parliament"], a: 1 },
  { n: 12, s: "Computer Knowledge", q: "CPU speed today is measured in", o: ["Picohertz", "Gigahertz", "Gigabyte", "Terabytes"], a: 1 },
  { n: 13, s: "Numerical Ability", q: "How much simple interest will Rs 2,000 earn in 18 months at 6% per annum?", o: ["Rs 216", "Rs 240", "Rs 180", "Rs 120"], a: 2 },
  { n: 14, s: "Reasoning", q: "In a row of 16 boys, when Prakash was shifted by two places towards left, he became 7th from the left end. What was his earlier position from the right end of the row?", o: ["7th", "10th", "9th", "8th"], a: 3 },
  { n: 15, s: "Haryana GK", q: "How many districts are there in Haryana at present?", o: ["25", "22", "20", "None of the above"], a: 1 },
  { n: 16, s: "Reasoning", q: "If C denotes '+', D denotes 'x', E denotes '/' and F denotes '-', then which is correct?", o: ["3 C 1 D 8 E 2 F 4 = 3", "3 C 1 D 8 E 2 F 4 = 4", "3 C 1 D 8 E 2 F 4 = 0", "None of these"], a: 0 },
  { n: 17, s: "Current Affairs", q: "Ravi Kumar Dahiya won silver medal at Tokyo Olympics 2020 in the weight class of", o: ["Men's 57 kg free style", "Men's 65 kg free style", "Men's 74 kg free style", "None of the above"], a: 0 },
  { n: 18, s: "General Studies", q: "Master plan of Chandigarh is analogous to", o: ["Necklace", "Bird", "Human body", "Flower"], a: 2 },
  { n: 19, s: "Haryana GK", q: "Signal area of Wireless Repeater Antennae at Tosham hill was", o: ["Bhiwani", "Fatehabad", "Sirsa", "All of the above"], a: 3 },
  { n: 20, s: "Computer Knowledge", q: "Web Services mean the services provided by", o: ["E-mail Services", "World Wide Web", "File Transfer Protocol", "Hyper Text Transfer Protocol"], a: 1 },
  { n: 21, s: "General Science", q: "Splitting of spectral lines in the presence of magnetic field is called", o: ["Stark effect", "Bohr effect", "Sommerfeld effect", "Zeeman effect"], a: 3 },
  { n: 22, s: "Computer Knowledge", q: "_______ is a language for publishing hypermedia on the World Wide Web.", o: ["Hypermedia", "C", "C++", "HTML"], a: 3 },
  { n: 23, s: "Computer Knowledge", q: "A unit equaling approximately one thousand bytes (1024, to be exact) is called a", o: ["Megabyte", "Terabyte", "Gigabyte", "Kilobyte"], a: 3 },
  { n: 24, s: "Haryana GK", q: "The first Women's University of Haryana is named after", o: ["Swami Shraddhanand", "Swami Dayanand", "Bhagat Phool Singh", "Kalpana Chawla"], a: 2 },
  { n: 25, s: "Reasoning", q: "Arrange the below words in a meaningful and logical sequence. 1. Table 2. Tree 3. Wood 4. Seed 5. Plant", o: ["4, 5, 2, 3, 1", "1, 2, 3, 4, 5", "1, 3, 2, 4, 5", "4, 5, 3, 2, 1"], a: 0 },
  { n: 26, s: "Reasoning", q: "If PAINT is coded as 74128 and EXCEL is coded as 93596, then what will be the code for ACCEPT?", o: ["547978", "735961", "455978", "554978"], a: 2 },
  { n: 27, s: "Reasoning", q: "A man walks 30 meters towards South, then turning to his right, he walks 30 meters, then turning to his left, he walks 20 meters, again turning to his left, he walks 30 meters. How far is he from his starting point?", o: ["20 meters", "50 meters", "80 meters", "30 meters"], a: 1 },
  { n: 28, s: "Numerical Ability", q: "From a group of 7 men and 6 women, five persons are to be selected to form a committee so that atleast 3 men are there on the committee. In how many ways can it be done?", o: ["645", "564", "735", "756"], a: 3 },
  { n: 29, s: "Reasoning", q: "Which interchange of signs will make the following equation correct? 35 + 7 x 5 / 5 - 6 = 24", o: ["+ and x", "/ and +", "- and /", "+ and -"], a: 1 },
  { n: 30, s: "General Science", q: "A machine gun of mass 10 kg fires 20 g bullets at the rate of 10 bullets per second with a speed of 500 m/s. What force is required to hold the machine gun in position?", o: ["10 N", "200 N", "20 N", "100 N"], a: 3 },
  { n: 31, s: "Numerical Ability", q: "A person crosses a 600 m long street in 5 minutes. What is his speed in km per hour?", o: ["8.4", "10", "7.2", "3.6"], a: 2 },
  { n: 32, s: "Reasoning", q: "Choose the alternative which closely resembles the mirror image of the given combination: TARAIN1014A. (Figure-based question with four figure options.)", o: ["Figure 1", "Figure 2", "Figure 3", "Figure 4"], a: 0 },
  { n: 33, s: "Haryana GK", q: "Consider the following statements about \"Reading Mission\" of Government of Haryana. I. The initiative was launched to encourage reading habit among the students of the State. II. The Mission has been launched on the lines of the Central Government's 'Reading Mission 2022', which aims to address the lost glory of reading books. Choose the right option.", o: ["Only the Statement II is correct", "Both the Statements I and II are incorrect", "Both the Statements I and II are correct", "Only the Statement I is correct"], a: 2 },
  { n: 34, s: "Haryana GK", q: "\"WH 1270\" is a new variety of which of the following crops released by Chaudhary Charan Singh Haryana Agricultural University (CCSHAU), Hisar?", o: ["Wheat", "Walnut", "Barley", "None of the above"], a: 0 },
  { n: 35, s: "Haryana GK", q: "Fakhre Haryana Award is given for", o: ["Haryanvi literature", "Sanskrit literature", "Urdu literature", "Hindi literature"], a: 2 },
  { n: 36, s: "Reasoning", q: "E is the son of C. D is the husband of C. B and G are the only brother and daughter of D respectively. F is the maternal aunt of E and G. How is B related to E?", o: ["Nephew", "Aunt", "Niece", "Uncle"], a: 3 },
  { n: 37, s: "General Science", q: "The strong magnetic field produced inside a solenoid can be used to magnetise a piece of magnetic material like soft iron when placed inside the coil. The magnet so formed is called as", o: ["Electromagnet", "Permanent magnet", "Paramagnet", "Diamagnet"], a: 0 },
  { n: 38, s: "General Science", q: "Which among the following gas is used for pre-slaughter anesthesia of pigs?", o: ["Carbon dioxide", "Nitrous oxide", "Halothane", "Desflurane"], a: 0 },
  { n: 39, s: "Reasoning", q: "One morning after sunrise, Suresh was standing facing a pole. The shadow of the pole fell exactly to his right. To which direction was he facing?", o: ["West", "Data inadequate", "South", "East"], a: 2 },
  { n: 40, s: "General Science", q: "Which enzyme present in the pancreatic juice is responsible for breakdown of the emulsified fat?", o: ["Lipase", "Trypsin", "Lactase", "Maltase"], a: 0 },
  { n: 41, s: "General Science", q: "Musca domestica belongs to the class", o: ["Dicotyledonae", "Monocotyledonae", "Mammalia", "Insecta"], a: 3 },
  { n: 42, s: "Haryana GK", q: "Who among the following is the Param Vir Chakra awardee from Haryana?", o: ["Roop Chand", "Major Hoshiar Singh", "Hawaldar Lakhmi Chand", "Subedar Shivchand Ram"], a: 1 },
  { n: 43, s: "Haryana GK", q: "Direct recruitment of Haryana to various gazetted and non-gazetted ranks in Police Service shall be made through", o: ["State Level Police Recruitment Board", "District Level Police Recruitment Board", "Both (A) and (B)", "None of these"], a: 0 },
  { n: 44, s: "Haryana GK", q: "Bahadur Singh who won gold medal in 1978 and 1982 Asian games is an Indian", o: ["Wrestler", "Boxer", "Runner", "Shot-putter"], a: 3 },
  { n: 45, s: "Haryana GK", q: "Haryana Armed Police has _______ battalions.", o: ["2", "4", "1", "5"], a: 1 },
  { n: 46, s: "Haryana GK", q: "Which of the following festival of Haryana is celebrated after 6 days of Nav Samvatsar Utsav and is known as Basoda festival?", o: ["Bhadliya Navami", "Sili Sate", "Teej", "Saloni"], a: 1 },
  { n: 47, s: "General Studies", q: "________ prohibits gathering of four or more people in a specified area.", o: ["Section 144 of CrPC", "Section 144 of IPC", "Section 144 of CPC", "None of the above"], a: 0 },
  { n: 48, s: "General Science", q: "Cats belongs to the family", o: ["Canidae", "Ovidae", "Felidae", "Bovidae"], a: 2 },
  { n: 49, s: "Haryana GK", q: "Role and functions of Haryana Police", o: ["To prevent and detect crime", "To preserve public order", "To protect life and property", "All of the above"], a: 3 },
  { n: 50, s: "Haryana GK", q: "The district of Haryana which recorded lowest child population as per census 2011 is", o: ["Panchkula", "Mahendragarh", "Kurukshetra", "Faridabad"], a: 0 },
  { n: 51, s: "General Science", q: "The book published by Charles Darwin marked as a landmark in the study of evolution", o: ["The Selfish Gene", "On the Origin of Species", "The Emperor of all Maladies", "Human Biology"], a: 1 },
  { n: 52, s: "Computer Knowledge", q: "In a wireless network, the hub function is performed by a wireless router, sometimes called a", o: ["Switch", "Adapter", "Modem", "Base station"], a: 3 },
  { n: 53, s: "Computer Knowledge", q: "You can use the ________ keyboard shortcut to select all files in a folder.", o: ["Ctrl + Shift + B", "Ctrl + S", "Ctrl + Shift + A", "Ctrl + A"], a: 3 },
  { n: 54, s: "Computer Knowledge", q: "________ translate easy-to-understand domain names into IP addresses.", o: ["Internet Service Provider", "Domain Name Servers (DNS)", "Hosting Company", "IP Server"], a: 1 },
  { n: 55, s: "General Science", q: "The normal systolic pressure of the Human Blood pressure is about", o: ["100 mm of Hg", "60 mm of Hg", "120 mm of Hg", "80 mm of Hg"], a: 2 },
  { n: 56, s: "General Studies", q: "The symbol of the new Britain - the British flag", o: ["Old Glory", "Union Jack", "Taegukgi", "Maple leaf flag"], a: 1 },
  { n: 57, s: "Reasoning", q: "Consider the two given statements to be true. Statements: 1. Some teachers are students. 2. All students are girls. Conclusions: I. All teachers are girls. II. Some girls are teacher. III. Some girls are students. IV. All students are teachers. Choose the correct option.", o: ["Only I, II, III follow", "Only II and III follow", "All follow", "Only I follows"], a: 1 },
  { n: 58, s: "Computer Knowledge", q: "________ is the maximum number of bits that a microprocessor can process at a time.", o: ["Memory size", "Word size", "Clock speed", "Data size"], a: 1 },
  { n: 59, s: "Haryana GK", q: "Which of the following Departments has been newly constituted in Haryana?", o: ["Chief Electrical Inspector", "Citizen Resources Information", "Food and Drug Administration", "None of the above"], a: 2 },
  { n: 60, s: "Computer Knowledge", q: "________ is a special type of memory that works like both RAM and ROM.", o: ["Register memory", "Secondary memory", "Flash memory", "Cache memory"], a: 2 },
  { n: 61, s: "General Studies", q: "The Separatist Movement of Quebecois is related to", o: ["Spain", "Turkey", "Canada", "Australia"], a: 2 },
  { n: 62, s: "General Studies", q: "Indian Government Agency responsible for collecting and analysing crime data", o: ["The National Crime Record Bureau", "Consumer Financial Protection Bureau", "National Automated Finger Print Identification System", "None of the above"], a: 0 },
  { n: 63, s: "Numerical Ability", q: "A total of 324 coins of 20 paise and 25 paise make a sum of Rs 71. The number of 25 paise coins is", o: ["144", "200", "124", "120"], a: 2 },
  { n: 64, s: "Current Affairs", q: "Kesra Ram has won the 2020 \"Dhahan Prize for Punjabi Literature\" for his anthology of short stories", o: ["Zanani Paud", "Rani Tatt", "Jakari", "None of the above"], a: 1 },
  { n: 65, s: "Numerical Ability", q: "If a, b, c are non-zero, a + 1/b = 1 and b + 1/c = 1, then the value of abc is", o: ["-1", "3", "1", "-3"], a: 0 },
  { n: 66, s: "Haryana GK", q: "Which of the following forest types is majorly found in the State of Haryana?", o: ["Subtropical dry deciduous forest", "Alpine forest", "Montane temperate forest", "None of the above"], a: 0 },
  { n: 67, s: "Numerical Ability", q: "Five years ago, Vinay's age was 1/3 of the age of Vikas and now Vinay's age is 17 years. The present age of Vikas is", o: ["41 years", "51 years", "36 years", "9 years"], a: 0 },
  { n: 68, s: "Numerical Ability", q: "Jayesh is as much younger to Anil as much he is older to Prashant. If the sum of the ages of Anil and Prashant is 48 years, then the age of Jayesh is", o: ["24 years", "30 years", "Can't be determined", "None of these"], a: 0 },
  { n: 69, s: "Reasoning", q: "If ZEBRA can be written as 2652181, how can COBRA be written?", o: ["31822151", "1182153", "3152181", "302181"], a: 2 },
  { n: 70, s: "General Science", q: "Limestone on decomposition produces __________ and carbon-dioxide.", o: ["Calcium oxide", "Calcium hydroxide", "Calcium hydrogen carbonate", "Calcium carbonate"], a: 0 },
  { n: 71, s: "Haryana GK", q: "A Motto of Haryana Police", o: ["Sadrakshnaya Khalanighrahanaya", "Paritranay Sadhunaam", "Sewa Suraksha Sahyog", "Seva hi Lakshya"], a: 0 },
  { n: 72, s: "Numerical Ability", q: "In the first 10 overs of a cricket game, the run rate was only 3.2. What should be the run rate for the remaining 40 overs to reach the target of 282 runs?", o: ["6.5", "7", "6.25", "6.75"], a: 2 },
  { n: 73, s: "General Studies", q: "This famous king was known as 'Rai Pithora'", o: ["Prithviraj Chauhan", "Jatwan", "Anangpal - II", "Mahipal"], a: 0 },
  { n: 74, s: "Haryana GK", q: "Who has been appointed as the Current Chairperson of the Haryana Women Development Corporation?", o: ["Babita Phogat", "Neha Goyal", "Vinesh Phogat", "None of the above"], a: 3 },
  { n: 75, s: "General Science", q: "The type of mirror used by dentists to see larger images of the teeth of patients is", o: ["Convex", "Plano-convex", "Plane", "Concave"], a: 3 },
  { n: 76, s: "Reasoning", q: "Find the missing terms. a b _ d b _ d a _ d a b d a b _", o: ["a b a b", "c a c a", "c c c c", "none of these"], a: 2 },
  { n: 77, s: "Reasoning", q: "Complete the series. 26, 12, 10, 16, ?", o: ["52", "53", "56", "50"], a: 3 },
  { n: 78, s: "Reasoning", q: "Find out the wrong term among 105, 85, 60, 30, 0, -45, -90.", o: ["85", "-45", "60", "0"], a: 3 },
  { n: 79, s: "General Science", q: "The pKa of acetic acid and pKb of ammonium hydroxide are 4.76 and 4.75 respectively. The pH of ammonium acetate solution is", o: ["7.005", "7.75", "4.702", "8.01"], a: 0 },
  { n: 80, s: "Reasoning", q: "If + means x, - means +, x means - and / means +, then 9 + 8 + 8 - 4 x 9 = ?", o: ["17", "11", "65", "26"], a: 2 },
  { n: 81, s: "Current Affairs", q: "Consider the following Statements about Indian Biological Data Centre (IBDC). I. It is the first National repository for life science data in India. II. It is being established at the Regional Centre of Biotechnology (RCB), Faridabad in collaboration with the National Informatics Centre (NIC), India. Choose the right option.", o: ["Only the Statement II is correct", "Both the Statements I and II are incorrect", "Both the Statements I and II are correct", "Only the Statement I is correct"], a: 2 },
  { n: 82, s: "Numerical Ability", q: "Six bells commence tolling together and toll at intervals 2, 4, 6, 8, 10 and 12 seconds respectively. In 30 minutes, how many times do they toll together?", o: ["10", "4", "15", "16"], a: 3 },
  { n: 83, s: "Reasoning", q: "Number of the triangles in the given figure. (Figure: a tent-like shape divided by internal lines forming triangles.)", o: ["10", "12", "14", "8"], a: 1 },
  { n: 84, s: "Numerical Ability", q: "Find the missing number. 4.5, 18, 2.25, ?, 1.6875, 33.75", o: ["25.5", "43", "27", "35"], a: 2 },
  { n: 85, s: "General Science", q: "Calculate the efficiency of a Carnot engine operating between 450 K and 300 K.", o: ["33.33%", "77.7%", "26.67%", "66.66%"], a: 0 },
  { n: 86, s: "Numerical Ability", q: "If a - b = 3 and a^2 + b^2 = 29, find the value of ab.", o: ["12", "10", "15", "18"], a: 1 },
  { n: 87, s: "Reasoning", q: "Complete the following analogy. Country : President : : State : ?", o: ["State Minister", "Lieutenant", "Governor", "Chief Minister"], a: 2 },
  { n: 88, s: "Haryana GK", q: "The State of Haryana falls under which of the following Agroclimatic Zones of the country?", o: ["Upper Gangetic Plains Region", "Trans Gangetic Plains Region", "Lower Gangetic Plains Region", "None of the above"], a: 1 },
  { n: 89, s: "General Science", q: "Panthera leo is", o: ["Lion", "Tiger", "Leopard", "None of these"], a: 0 },
  { n: 90, s: "Haryana GK", q: "This district has the highest literacy rate in Haryana as per census 2011", o: ["Panchkula", "Faridabad", "Gurugram", "Bhiwani"], a: 2 },
  { n: 91, s: "General Studies", q: "Parole means", o: ["Release of offender on bail", "Waiver of punishment", "Temporary release of prisoner", "Remission in punishment"], a: 2 },
  { n: 92, s: "Haryana GK", q: "Central Soil Salinity Research Institute (CSSRI) in Haryana is situated at", o: ["Karnal", "Hisar", "Panipat", "None of the above"], a: 0 },
  { n: 93, s: "Reasoning", q: "If '-' means '+', '+' means '-', 'x' means '/' and '/' means 'x', then which of the following will be the correct equation?", o: ["30 + 5 + 14 - 10 x 15 = 22", "30 x 5 - 4 / 10 + 15 = 31", "30 - 5 + 14 / 10 x 15 = 162", "10 + 5 - 14 / 10 x 15 = 158"], a: 1 },
  { n: 94, s: "General Science", q: "Which among the following disease is an example of Zooanthroponosis?", o: ["Human TB", "Rabies", "Staphylococcosis", "Brucellosis"], a: 0 },
  { n: 95, s: "Haryana GK", q: "Which of the following is the Nodal Agency of the campaign 'Beti Bachao-Beti Padhao' in Haryana?", o: ["Department of Health and Family Welfare", "Department of Women and Child Development", "Ministry of Human Resource", "Ministry of Information"], a: 1 },
  { n: 96, s: "General Studies", q: "Functioning of Police with other agencies of District Administration relates to", o: ["Settlement of land disputes", "Any external aggressions", "Disturbance of the public peace", "All of the above"], a: 3 },
  { n: 97, s: "Haryana GK", q: "This person is famously known as Gandhi of Haryana", o: ["Lala Lajpat Rai", "Mulchand Jain", "Devilal", "Sir Chhotu Ram"], a: 1 },
  { n: 98, s: "General Studies", q: "An arrested person shall be produced before the Magistrate within _______ hours.", o: ["24", "48", "36", "12"], a: 0 },
  { n: 99, s: "Haryana GK", q: "The Haryana Police comes under _______, Government of Haryana.", o: ["Department of Finance", "Department of Home Affairs", "Department of Public Relations", "Department of Social Welfare"], a: 1 },
  { n: 100, s: "General Science", q: "Nitrogen fixing legume-bacteria is", o: ["Rhizobium", "Anabacter", "Rhodospirillum", "Plasmodium"], a: 0 }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'HR-POL-CONST' });
  if (!exam) throw new Error('Exam HR-POL-CONST not found — aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Haryana Police Written Exam' });
  if (!pattern) throw new Error('ExamPattern "Haryana Police Written Exam" not found — aborting.');

  const TEST_TITLE = "Haryana Police Constable (Female) - 19 Sep 2021 Shift-1";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  const questions = RAW.map(r => ({
    questionText: r.q, questionImage: '', options: r.o,
    optionImages: r.o.map(() => ''), correctAnswerIndex: r.a,
    explanation: '', section: r.s, tags: TAGS, difficulty: 'medium'
  }));

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2021,
    pyqShift: TEST_TITLE, pyqExamName: 'Haryana Police Constable', questions
  });
  console.log('Created PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
