/**
 * Seed: Haryana Police Constable - 31 Oct 2021 Shift-1
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

const TAGS = ["Haryana Police", "Constable", "PYQ", "2021", "Haryana Police Constable - 31 Oct 2021 Shift-1"];
const RAW = [
  { n: 1, s: "Reasoning", q: "In a row of boys, Kapil is eighth from the right and Nikunj is twelfth from the left. When Kapil and Nikunj interchange positions, Nikunj becomes twenty first from the left. Which of the following will be Kapil's position from the right?", o: ["21st", "8th", "Cannot be determined", "17th"], a: 3 },
  { n: 2, s: "General Studies", q: "Which cyclones originate over the Bay of Bengal and the Indian Ocean?", o: ["Western cyclones", "Tropical cyclones", "Eastern cyclones", "Temperate cyclones"], a: 1 },
  { n: 3, s: "General Studies", q: "Under Article 371A, special status was accorded to", o: ["Telangana", "Arunachal Pradesh", "Nagaland", "Manipur"], a: 2 },
  { n: 4, s: "Current Affairs", q: "Project Sunrise of Central Government is", o: ["Prevention of Malaria in eight North Eastern States", "Prevention of AIDS in eight North Eastern States", "Prevention of COVID-19 in eight North Eastern States", "None of the above"], a: 1 },
  { n: 5, s: "Computer Knowledge", q: "_________ is the number of times per second the pixels are recharged so that their glow remains bright.", o: ["Refresh rate", "Resolution", "Pixel rate", "Bit depth"], a: 0 },
  { n: 6, s: "Numerical Ability", q: "64^12 / 4^15 = 64^?", o: ["12", "9", "7", "3"], a: 1 },
  { n: 7, s: "General Studies", q: "WTO was founded in", o: ["1995", "1991", "2005", "1947"], a: 0 },
  { n: 8, s: "General Science", q: "Catla fishes are", o: ["Surface feeders", "Bottom feeders", "Feed at all level", "Middle feeders"], a: 3 },
  { n: 9, s: "Reasoning", q: "Aman ranks eleventh in a class of forty four. What will be his rank from the last?", o: ["35", "33", "37", "34"], a: 3 },
  { n: 10, s: "General Science", q: "What is Canthrophily?", o: ["Pollination by bats", "Pollination by beetles", "Pollination by snails", "Pollination by birds"], a: 1 },
  { n: 11, s: "General Studies", q: "Consider the following statements about President of India. I. President is the Head of the State. II. President exercises only nominal powers. Choose the correct option.", o: ["Both the statements I and II are correct", "Only the statement II is correct", "Only the statement I is correct", "None of the above"], a: 0 },
  { n: 12, s: "General Science", q: "Body with pores and canals in walls is present in", o: ["Amelida", "Annelida", "Porifera", "Ctenophora"], a: 2 },
  { n: 13, s: "Numerical Ability", q: "If 12276 / 1.55 = 7920, the value of 122.76 / 15.5 is", o: ["79.02", "7.92", "79.2", "7.092"], a: 1 },
  { n: 14, s: "General Studies", q: "The Kolkhoz is a collective farming model introduced in", o: ["China", "USA", "Cuba", "Russia"], a: 3 },
  { n: 15, s: "Reasoning", q: "If the word MENTAL is written as LNDFMOSUZBKM, then how would the word TEST be written in that code?", o: ["SUDFQRSM", "UVFGTIIV", "RSCDQRRS", "SUDFRTSU"], a: 3 },
  { n: 16, s: "Computer Knowledge", q: "_________ is an extremely high-speed, low-cost process, which records computer generated information directly from the computer tape or cartridge to a miniaturized microfilm media.", o: ["Character Output Microfilm", "Computer Output Microfilm", "Character Oriented Microfilm", "Computer Oriented Microfilm"], a: 1 },
  { n: 17, s: "General Studies", q: "Who among the following Indian sang the historic song of peace and hope at 1966 United Nations General Assembly (UNGA)?", o: ["Asha Bhosle", "M. S. Subbulakshmi", "Lata Mangeshkar", "None of the above"], a: 1 },
  { n: 18, s: "General Studies", q: "Name the single comprehensive indirect tax operational from 2017 on supply of goods and services", o: ["Excise Duties", "Custom Duties", "Goods and Service Tax", "Value Added Tax"], a: 2 },
  { n: 19, s: "Numerical Ability", q: "The H.C.F. of [x^2 - ax - (a + 1)] and [ax^2 - x - (a + 1)] is", o: ["(x + a + 1)", "(x + 1)", "(x - a - 1)", "(x - 1)"], a: 1 },
  { n: 20, s: "General Studies", q: "The first Non-Aligned Summit was held in", o: ["Bangalore", "Belgrade", "Dhaka", "Delhi"], a: 1 },
  { n: 21, s: "Computer Knowledge", q: "___________ provides a path to transfer data between CPU and memory.", o: ["Control bus", "Address bus", "Data bus", "None of the above"], a: 2 },
  { n: 22, s: "General Science", q: "Nipah virus spreads to humans by", o: ["Cows", "Pigs", "Donkeys", "Dogs"], a: 1 },
  { n: 23, s: "General Science", q: "The major constituent among atmospheric gas is", o: ["Methane", "Oxygen", "Nitrogen", "Carbon Dioxide"], a: 2 },
  { n: 24, s: "Reasoning", q: "Which number will come in the place of question mark? 1, 5, 17, 53, 161, ?", o: ["482", "479", "485", "481"], a: 2 },
  { n: 25, s: "General Science", q: "RBCs in frog are", o: ["Nucleated", "Enucleated", "Trifid", "Bifid"], a: 0 },
  { n: 26, s: "Current Affairs", q: "Pankaj Advani has grabbed his ___________ World title by winning IBSF 6-Red Snooker World Cup.", o: ["23rd", "21st", "24th", "22nd"], a: 3 },
  { n: 27, s: "General Science", q: "Double fertilization is a rule of which plants?", o: ["Pteridophytes", "Bryophytes", "Angiosperms", "Fungi"], a: 2 },
  { n: 28, s: "Reasoning", q: "The position of how many letters in the word BRAKES remain unchanged when they are arranged in alphabetical order?", o: ["Two", "None", "Three", "One"], a: 3 },
  { n: 29, s: "General Science", q: "Structure of XeF6 is", o: ["Distorted octahedral", "Square bipyramidal", "Distorted square planar", "Square planar"], a: 0 },
  { n: 30, s: "Numerical Ability", q: "The average of 5 consecutive numbers is n. If the next two numbers are also included, the average of the 7 numbers will", o: ["remain the same", "increase by 2", "increase by 1.4", "increase by 1"], a: 3 },
  { n: 31, s: "Computer Knowledge", q: "___________ must be refreshed continually to store information, otherwise it will lose what it is holding.", o: ["Double Data Rate Synchronous Dynamic Random Access Memory (DDR-SDRAM)", "Dynamic Random Access Memory (DRAM)", "Synchronous Dynamic Random Access Memory (SDRAM)", "Static Random Access Memory (SRAM)"], a: 1 },
  { n: 32, s: "General Studies", q: "Consider the following statements about World Trade Organization (WTO). I. The WTO is the only Global International Organization dealing with the rules of trade between nations. II. Afghanistan joined the WTO on 29 July as its 164th member. Choose the correct option.", o: ["Both the statements I and II are correct", "The statement II is correct", "The statement I is correct", "None of the above"], a: 2 },
  { n: 33, s: "Computer Knowledge", q: "Digital signature are based on ___________ cryptography.", o: ["Shared-key", "Private-key", "Internal-key", "Public-key"], a: 3 },
  { n: 34, s: "General Studies", q: "Inflation target to be set by the Government of India, in consultation with the Reserve Bank, once every ___________ years.", o: ["3", "5", "1", "4"], a: 1 },
  { n: 35, s: "General Science", q: "Which of the following is a detrivorous?", o: ["Honey bee", "Earthworm", "Ascaris", "Cockroach"], a: 1 },
  { n: 36, s: "Numerical Ability", q: "A is thrice as good a workman as B and is, therefore, able to finish a piece of work in 60 days less than B. The time (in days) in which they can do it working together is", o: ["23 days", "22 days", "23 1/4 days", "22 1/2 days"], a: 3 },
  { n: 37, s: "General Studies", q: "Which of the following administrative subject is not mentioned in Union List of the Indian Constitution?", o: ["Banking", "Defence", "Foreign Affairs", "Police"], a: 3 },
  { n: 38, s: "General Studies", q: "What was the Government (India) expenditure on education as a percentage of GDP in the year 1951-52?", o: ["0.64%", "2.18%", "4.20%", "None of the above"], a: 0 },
  { n: 39, s: "General Science", q: "The productivity and distribution of plants is heavily dependent on", o: ["Water", "Temperature", "Soil", "Light"], a: 1 },
  { n: 40, s: "Reasoning", q: "Anger : Rage : : Moist : ?", o: ["Sad", "Burn", "Dry", "Drench"], a: 3 },
  { n: 41, s: "General Science", q: "Human body temperature being _____ suited for enzyme catalysed reactions.", o: ["360 K", "273 K", "310 K", "290 K"], a: 2 },
  { n: 42, s: "General Studies", q: "IAEA widely known as the world's _____", o: ["Atoms for Power and Drugs", "Atoms for Peace and Development", "Atoms for Piece and Download", "Atoms for Pace and Destruction"], a: 1 },
  { n: 43, s: "Computer Knowledge", q: "The word Internet is derived from two words", o: ["Interface and networks", "Inter communication and networks", "Internal and networks", "Inter connection and networks"], a: 3 },
  { n: 44, s: "General Studies", q: "A small rise in prices or a sudden rise in prices is not a", o: ["Hyper deflation", "Inflation", "Paraflation", "Deflation"], a: 2 },
  { n: 45, s: "General Studies", q: "Who published the Newspaper 'Risorgimento'?", o: ["Joseph Garibaldi", "Joseph Mazzini", "Victor Emmanuel - II", "Count De-Cavour"], a: 3 },
  { n: 46, s: "Numerical Ability", q: "A jar full of whisky contains 40% of alcohol. A part of this whisky is replaced by another containing 19% alcohol and now the percentage of alcohol was found to be 26. The quantity of whisky replaced is", o: ["2/3", "2/5", "3/5", "1/3"], a: 0 },
  { n: 47, s: "General Studies", q: "An officer known as Assistant Commandant or a Subedar, is equivalent in rank to a", o: ["Deputy Superintendent of Police", "Commissioner", "Inspector General of Police", "Superintendent of Police"], a: 0 },
  { n: 48, s: "Reasoning", q: "Statements: 1. All pen are pencils. 2. All books are pen. Conclusions: I. Some books are pens. II. Some pencils are books. Choose the conclusion(s) which best fit(s) logically.", o: ["Neither conclusion I nor II follows", "Only conclusion II follows", "Both conclusions I and II follow", "Only conclusion I follows"], a: 3 },
  { n: 49, s: "General Studies", q: "Socialization helps people _____", o: ["Both (B) and (D)", "To function successfully in their social worlds", "To know the difference between introverts and extrovert", "To adopt beliefs, values and norms that represent its non-material culture"], a: 0 },
  { n: 50, s: "Numerical Ability", q: "In a class of 40 students, 12 enrolled for both English and German. 22 enrolled for German. If the students of the class enrolled for at least one of the two subjects, then how many students enrolled for only English and not German?", o: ["18", "30", "28", "10"], a: 3 },
  { n: 51, s: "Computer Knowledge", q: "The _______ is the portion of window that holds the web page present in the current tab.", o: ["Status Bar", "Command Bar", "Favorites Bar", "Content Area"], a: 3 },
  { n: 52, s: "Reasoning", q: "Select the correct mirror image of the given figure when the mirror is placed at line AB. (Figure-based question with four figure options.)", o: ["Figure 1", "Figure 2", "Figure 3", "Figure 4"], a: 0 },
  { n: 53, s: "Haryana GK", q: "In which district of Haryana is Maharana Pratap Horticultural University located?", o: ["Karnal", "Hisar", "Bhiwani", "Gurugram"], a: 0 },
  { n: 54, s: "Current Affairs", q: "To resolve the growing problem of Non-Performing Assets (NPAs), or loans on which borrowers have defaulted, _______ is set up.", o: ["True Bank", "Good bank", "Bad Bank", "Centre for Monitoring Indian Economy"], a: 2 },
  { n: 55, s: "Computer Knowledge", q: "CPU stands for", o: ["Central Processing Unit", "Computer Preprocessing Unit", "Central Preprocessing Unit", "Computer Processing Unit"], a: 0 },
  { n: 56, s: "General Studies", q: "Cognizable offence under Indian Penal Code has been defined", o: ["Under Section 2(i) of Cr.P.C.", "Under Section 2(a) of Cr.P.C.", "Under Section 2(1) of Cr.P.C.", "Under Section 2(c) of Cr.P.C."], a: 3 },
  { n: 57, s: "Reasoning", q: "I went 10 m to the East, then turned North and walked another 15 m, then I turned West and covered 12 m and then turned South and covered 15 m. How far am I from my house?", o: ["3 m", "0 m", "5 m", "2 m"], a: 3 },
  { n: 58, s: "General Science", q: "The layer of the atmosphere in which Ozone layer is situated?", o: ["Ionosphere", "Troposphere", "Thermosphere", "Stratosphere"], a: 3 },
  { n: 59, s: "Numerical Ability", q: "The ratio of the number of boys and girls in a college is 7 : 8. If the percentage increase in the number of boys and girls be 20% and 10% respectively, what will be the new ratio?", o: ["21 : 22", "8 : 9", "Cannot be determined", "17 : 18"], a: 0 },
  { n: 60, s: "General Studies", q: "When the market price of the goods (p) multiplied by the firm's output (q), we get", o: ["Average revenue", "Total revenue", "Marginal revenue", "None of the above"], a: 1 },
  { n: 61, s: "Reasoning", q: "If 'I am young' is written as '2 4 7' and 'Sheetal is young' as '6 1 4' and 'I like Sheetal' as '5 7 6', then 'I' is written as", o: ["5", "4", "7", "2"], a: 2 },
  { n: 62, s: "General Science", q: "If a magnetic material is having magnetic susceptibility = -1, then the relative magnetic permeability and type of magnetic material is", o: ["1, paramagnetic", "0, diamagnetic", "-1, diamagnetic", "2, ferromagnetic"], a: 1 },
  { n: 63, s: "Current Affairs", q: "Agency to assess the creditworthiness of individual borrowers is", o: ["CABIL", "CIBIL", "FIBIL", "MyBIL"], a: 1 },
  { n: 64, s: "General Studies", q: "Which of the following is not an agency of socialisation?", o: ["Peer group", "Family", "Shopping", "Books"], a: 2 },
  { n: 65, s: "Reasoning", q: "Five boys are sitting in a row. A is on the right of B, E is on the left of B, but to the right of C. If A is on the left of D. Who is sitting in the middle?", o: ["A", "E", "C", "D"], a: 1 },
  { n: 66, s: "Reasoning", q: "There are six persons A, B, C, D, E and F. C is the sister of F. B is the brother of E's husband, D is the father of A and grandfather of F. There are two fathers, three brothers and a mother in the group. How is F related to E?", o: ["Daughter", "Uncle", "Son", "Husband"], a: 2 },
  { n: 67, s: "Computer Knowledge", q: "__________ comprises a set of several routines and start-up instructions inside the ROM.", o: ["Basic Input Output System (BIOS)", "Universal Serial Bus (USB)", "Expansion port", "Port"], a: 0 },
  { n: 68, s: "Numerical Ability", q: "The value of 15C3 + 15C13 is", o: ["15C10", "15C15", "16C3", "30C16"], a: 2 },
  { n: 69, s: "General Science", q: "The developing embryo will also generate waste substances which can be removed by transferring them into the mother's blood through the", o: ["Uterus", "Placenta", "Anus", "Urethra"], a: 1 },
  { n: 70, s: "Reasoning", q: "Find the missing number. (A square with diagonals forming four triangles: top section shows 9 and 19, right section shows 36, bottom section shows 146 and 75, left section shows ?)", o: ["299", "297", "300", "298"], a: 1 },
  { n: 71, s: "General Science", q: "A piece of wire of resistance R is cut into five equal parts. These parts are then connected in parallel. If the equivalent resistance of this combination is R', then the ratio R/R' is", o: ["5", "1/25", "1/5", "25"], a: 3 },
  { n: 72, s: "Computer Knowledge", q: "The __________ is a system that provides a simple and consistent way to organize large data available on the Internet.", o: ["Web site", "Web browser", "Hypertext", "Web server"], a: 2 },
  { n: 73, s: "Reasoning", q: "In the following series, how many such odd numbers are there which are divisible by 3 or 5, then followed by odd numbers and then also followed by even numbers? 12, 19, 21, 3, 25, 18, 35, 20, 22, 21, 45, 46, 47, 48, 9, 50, 52, 54, 55, 56", o: ["Three", "Nil", "Two", "One"], a: 3 },
  { n: 74, s: "General Studies", q: "The practice of assessing a culture by its own standards rather than viewing it through the lens of one's own culture is called", o: ["Both (B) and (C)", "Cultural relativism", "Cultural imperialism", "None of the above"], a: 1 },
  { n: 75, s: "Current Affairs", q: "Satellite Mission - TRISHNA is for", o: ["Eco-system stress and water use monitoring", "Pesticide monitoring", "Ecological balance monitoring", "None of the above"], a: 0 },
  { n: 76, s: "General Studies", q: "Which is the famous work of Pliny?", o: ["Si-Yu-Ki", "Natural Historia", "Periplus of Erithrean Sea", "Indica"], a: 1 },
  { n: 77, s: "Numerical Ability", q: "If you save Re. 1 today, Rs. 2 tomorrow, Rs. 4 the next day and so on, then your total savings in two weeks will be", o: ["Rs. 16,383", "Rs. 18,300", "Rs. 16,300", "None of these"], a: 0 },
  { n: 78, s: "General Studies", q: "_______ is where a person, entrusted with any property, dishonestly misappropriates any property, or dishonestly uses or disposes of that property in violation of any direction of law or contract or wilfully suffer any other person to do so.", o: ["Criminal breach of property", "Cheating", "Trespassing", "Criminal breach of trust"], a: 3 },
  { n: 79, s: "Computer Knowledge", q: "In the _______, Usenet newsgroups and electronic mail (e-mail) came into picture.", o: ["1980s", "1970s", "1990s", "1960s"], a: 0 },
  { n: 80, s: "Reasoning", q: "Which pattern most closely resembles the given pattern? (Figure-based question with four figure options.)", o: ["Figure 1", "Figure 2", "Figure 3", "Figure 4"], a: 0 },
  { n: 81, s: "General Studies", q: "Where is the International Court of Justice (ICJ)?", o: ["China", "Hague", "Paris", "New York"], a: 1 },
  { n: 82, s: "General Studies", q: "The Reserve Bank has introduced banknotes in the Mahatma Gandhi Series since", o: ["1996", "1951", "1974", "None of the above"], a: 0 },
  { n: 83, s: "Computer Knowledge", q: "How many Schedules are there in IT Act 2000?", o: ["6", "3", "2", "4"], a: 3 },
  { n: 84, s: "Numerical Ability", q: "A copper wire is bent in the shape of a square of area 81 cm^2. If the same wire is bent in form of a semicircle, the radius (in cm) of the semicircle is (Take pi = 22/7)", o: ["10", "16", "7", "14"], a: 2 },
  { n: 85, s: "General Science", q: "Evolution of different species in a given geographical area starting from a point and literally radiating to other areas of geography (habitats) is called", o: ["Adaptive breeding", "Adaptive evolution", "Adaptive radiation", "None of these"], a: 2 },
  { n: 86, s: "Reasoning", q: "L, M, N, O, P, Q, R and S are sitting around a circle facing the centre. N, who is third to the left of P, is not a neighbour of R and M. S is the neighbour of O and R and is third to the right of M. L is not the neighbour of O, who is second to the left of N. Which of the following is the pair of adjacent persons?", o: ["L and P", "M and N", "O and M", "None of these"], a: 3 },
  { n: 87, s: "Reasoning", q: "(Based on the circular seating of L, M, N, O, P, Q, R, S) What is the position of Q?", o: ["Third to the right of M", "Immediate right of R", "Second to the left of S", "Immediate left of N"], a: 1 },
  { n: 88, s: "Reasoning", q: "(Based on the circular seating of L, M, N, O, P, Q, R, S) If N and O interchange their positions, then which of the following will be the correct statement?", o: ["O is between L and Q", "S is on the immediate right of N", "N is between L and Q", "R is second to the right of Q"], a: 2 },
  { n: 89, s: "General Studies", q: "The rate at which the Central Bank of a country (Reserve Bank of India) lends money to Commercial Banks in the event of any shortfall of funds refers to", o: ["Bank rate", "Repo rate", "Reverse Repo rate", "None of the above"], a: 1 },
  { n: 90, s: "Reasoning", q: "What is the maximum number of pieces into which a cube can be cut by 13 cuts?", o: ["150", "14", "100", "76"], a: 0 },
  { n: 91, s: "English Language", q: "Fill in the blank with appropriate word: You can go _____ you like.", o: ["Whither", "Where", "Whence", "Wherever"], a: 3 },
  { n: 92, s: "English Language", q: "Give one-word substitute: Beyond the power or laws of nature.", o: ["Surmise", "Superlative", "Superfluous", "Supernatural"], a: 3 },
  { n: 93, s: "English Language", q: "Select the option which best expresses the sentence in Indirect/Direct Speech: \"Call the first witness\", said the Judge.", o: ["The Judge commanded to called the first witness", "The Judge commands to call the first witness", "The Judge commanded to call the first witness", "The Judge pleaded to call the first witness"], a: 2 },
  { n: 94, s: "English Language", q: "Choose the right synonym of the word given in capital letters: AFFLICTION", o: ["Idolised", "Foreign", "Ridiculo", "Distress"], a: 3 },
  { n: 95, s: "English Language", q: "Fill in the blank with appropriate phrasal verb: He _____ his views before the audience.", o: ["set forth", "set on", "set in", "set up"], a: 0 },
  { n: 96, s: "Hindi", q: "विशेष्य के साथ विशेषण का प्रयोग _____ प्रकार से होता है।", o: ["चार", "तीन", "दो", "इनमें से कोई नहीं"], a: 2 },
  { n: 97, s: "Hindi", q: "क्रिया विशेषण के _____ भेद हैं।", o: ["चार", "पाँच", "दो", "इनमें से कोई नहीं"], a: 0 },
  { n: 98, s: "Hindi", q: "जिन स्वरों के उच्चारण में दीर्घ स्वरों से भी अधिक समय लगता है, वे _____ कहलाते हैं।", o: ["ह्रस्व स्वर", "दीर्घ स्वर", "प्लुत स्वर", "इनमें से कोई नहीं"], a: 2 },
  { n: 99, s: "Hindi", q: "हिन्दी वर्णमाला में कुल कितने स्वर हैं?", o: ["11", "9", "13", "10"], a: 0 },
  { n: 100, s: "Hindi", q: "'निम्नलिखित' शब्द का सही अर्थ है", o: ["जिसे गुप्त रखा जाये", "ऊपर लिखा गया", "नीचे लिखा गया", "इनमें से कोई नहीं"], a: 2 }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'HR-POL-CONST' });
  if (!exam) throw new Error('Exam HR-POL-CONST not found — aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Haryana Police Written Exam' });
  if (!pattern) throw new Error('ExamPattern "Haryana Police Written Exam" not found — aborting.');

  const TEST_TITLE = "Haryana Police Constable - 31 Oct 2021 Shift-1";
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
