/**
 * Seed: Delhi Police Constable - 17 Nov 2023 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc17nov2023_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-17nov2023-s2';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 17 Nov 2023 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Which of the following festivals is celebrated primarily by the Parsi Community?", o: ["Songkran", "Milad-un-Nabi", "Deepawali", "Jashan-e-Mihragan"], a: 3, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Which of the following was NOT an effect of devaluation of the rupee in 1991 to make an international adjustment of Indian currency?", o: ["Increased imports", "Increased exports", "Raised the influx of foreign capital", "Decreased imports"], a: 0, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "How many writs are guaranteed under Article 32 of the Indian Constitution?", o: ["Six", "Five", "Four", "Seven"], a: 1, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Who was the author of the book titled ‘Poverty and Un-British Rule in India’?", o: ["Sardar Vallabhbhai Patel", "Dadabhai Naoroji", "Mahatma Gandhi", "Subhash Chandra Bose"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Vijayalaya, who belonged to the ancient chiefly family of the Cholas from Uraiyur, captured the delta from the Muttaraiyar in the middle of the 9th century and built the town of ______________.", o: ["Kanchipuram", "Thanjavur", "Vengi", "Darasuram"], a: 1, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Totaram Sharma, Pandit Ayodhya Prasad, Gopal Das and Babu Ram Shanker Pagaldas are noted players of which of the following instruments?", o: ["Sarod", "Pakhawaj", "Mridangam", "Sarangi"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "In Ancient India, which of the following dynasties was empowered in Deccan by Gautamiputra Satakarni?", o: ["Saka", "Satavahana", "Pahlava", "Kushana"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "In which year was the Basketball Federation of India established?", o: ["1920", "1950", "1947", "1951"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Who among the following Gurus of Sikh religion was the last Guru?", o: ["Guru Angad", "Guru Amar Das", "Guru Hargobind", "Guru Gobind Singh"], a: 3, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Who among the following was not among the convicts sentenced to death by the British Government of India in the Lahore conspiracy case?", o: ["Sukhdev Thapar", "Shivaram Rajguru", "Bhagat Singh", "Udham Singh"], a: 3, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "The decennial census of India is conducted under which Census Act?", o: ["Census Act 2001", "Census Act 1955", "Census Act 1948", "Census Act 2010"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "According to Census of India 2011, which union territories have the lowest literacy rate?", o: ["Chandigarh", "Lakshadweep", "Andaman and Nicobar", "Dadra and Nagar Haveli"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "In Indo Islamic construction, _________and lime mortar was an important factor in construction.", o: ["stone", "mud", "wood", "concrete"], a: 3, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "As of November 2022, in which of the following periods in Indian history was the Republic Day parade NOT performed at the Rajpath(now called Kartavya Path)?", o: ["2006-2008", "2000-2004", "1950-1954", "1990-1994"], a: 2, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "It was decided to celebrate the Republic day on 26th January every year by the Constitution makers to pay homage to the ‘Purna Swaraj’ declaration which was promulgated on _________.", o: ["26th January 1932", "26th January 1931", "26th January 1929", "26th January 1930"], a: 3, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "तालाब पारिस्थितिकी तंत्र का सबसे गहरा, वनस्पति-रहित और दलदली क्षेत्र क्या कहलाता है?", o: ["उष्णकटिबंधीय क्षेत्र (The tropical zone)", "समशीतोष्ण क्षेत्र (The temperate zone)", "लॉटिक क्षेत्र (The lotic zone)", "गहन क्षेत्र (The profundal zone)"], a: 3, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "In the year 2021-22, which country was the largest importer of Jute from India?", o: ["USA", "France", "Italy", "Japan"], a: 0, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "_________ is the largest employer of labour force in India.", o: ["Financial Services Sector", "Cottage Industries", "Agriculture", "Small Scale Industries"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Who popularised the movement of Theosophical Society in India?", o: ["Keshav Chandra Sen", "Ramkrishna Bhandarkar", "Annie Besant", "Swami Vivekananda"], a: 2, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Which of the following Peninsular rivers flows westward?", o: ["Krishna", "Kaveri", "Narmada", "Godavari"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन-सा आज्ञापत्र किसी लोकसेवक को उसके आधिकारिक कर्तव्योंों को ठीक से करने या शक्ति का दुरुपयोग न करने का आदेश देने के लिए न्यायालय द्वारा जारी किया जाता है?", o: ["परमादेश (Mandamus)", "बन्दी प्रत्यक्षीकरण (Habeas corpus )", "निषेधाज्ञा (Prohibition)", "अधिकार पृच्छा (Quo-warranto)"], a: 0, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "As per Census 2011, which Indian demographic group typically exhibits a higher literacy rate?", o: ["Urban females", "Urban males", "Rural males", "Rural females"], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Which method is used to separate ribosomes from the cell?", o: ["Chromatography", "Distillation", "Filtration", "Ultracentrifugation"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Which of the following is the most dominant flora of the plant kingdom?", o: ["Bryophyta", "Angiosperm", "Gymnosperm", "Pteridophyte"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Who among the following is the first ever recipient of Rajiv Gandhi Khel Ratna Award?", o: ["Vishwanathan Anand", "Dhyan Chand", "Virat Kohli", "Sunil Chhetri"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "A new phase of which initiative of the Government of India was launched in 2022 with the overall vision of creating ‘Garbage Free Cities’ and with the new component of wastewater treatment including faecal sludge management?", o: ["Wastewater Management Framework in India", "Rural Open Defecation Free Initiative", "Swachh Bharat Mission (Urban) 2.0", "Swachh Bharat Mission (Urban) 3.0"], a: 2, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which of the following causes the Tsunami waves?", o: ["Exterior of the earth", "Interior of the earth", "Interior of the moon", "Exterior of the moon"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a component of fiscal reforms?", o: ["Change in interest rate", "Public expenditure reforms", "Taxation reforms", "Control of public debt"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "In the year 2017, which of the following countries hosted the Under-17 Football World Cup?", o: ["United Arab Emirates", "India", "United States of America", "Thailand"], a: 1, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "When did India win its last gold medal in Hockey in the Olympics?", o: ["1972", "1976", "1968", "1980"], a: 3, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "The Chairman of the State Public Service Commission can be removed by:", o: ["The President of India", "The Prime Minister of India", "The Governor of the State", "The Chief Minister of the State"], a: 0, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Where are the Ellora caves located?", o: ["Fatehpur Sikri", "Aurangabad", "Indore", "Delhi"], a: 1, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Set in the holy city of Varanasi, ‘Kashi Ka Assi’ is written by:", o: ["Kamleshwar", "Kedar Nath Singh", "Amrita Pritam", "Kashi Nath Singh"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following percussion instruments is used in the popular folk dance ‘Lavani’?", o: ["Dholak", "Xylophone", "Piano", "Sleigh Bells"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "To file the nomination for the post of Vice President, the candidate must be proposed by at least _________ electors.", o: ["25", "30", "40", "20"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "The Index of Industrial Production (IIP) is an index that shows the growth rates in different industry groups of the economy in a fixed period of time. What is the base year of IIP?", o: ["2010-11", "2012-13", "2011-12", "2004-05"], a: 2, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "A baking student started baking a cake. After some time he realised his cake was not rising and hard. This is because he forgotten to add the following ingredient:", o: ["milk", "more cake flour", "baking powder", "vanilla extract"], a: 2, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which region is the source of basaltic magma?", o: ["Transition region", "Lower mantle", "The core", "Upper mantle"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Who among the following wrote, ‘The Autobiography of an Unknown Indian’?", o: ["Swami Rama", "Nirad C Chaudhuri", "Prakash Tandon", "BR Ambedkar"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which of the following parts of the Indian Constitution deals with the Directive Principles of State Policy?", o: ["Part XX", "Part IV", "Part XI", "Part XIV"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "The Rajas(kings) did not have capital cities, palaces or regular armies, nor did they collect taxes during the _______ period.", o: ["Rigvedic", "Huna", "Shunga", "Mauryan"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Famous dance personality Rajarshi Bhagya Chandra is also known as:", o: ["Rewa Prasad Dwivedi", "Bharat Muni", "Bhasa", "Ningthou Ching-Thang Khomba"], a: 3, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Which foreign power made the Indian pepper trade a royal monopoly?", o: ["The Portuguese", "The French", "The Dutch", "The Spanish"], a: 0, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Part XIX of the Indian Constitution deals with:", o: ["elections", "miscellaneous", "emergency provisions", "amendment of the Constitution"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Who among the following received, in 1997, the Japan Art Association’s Praemium Imperiale prize for music?", o: ["Pandit Ravi Shankar", "Ustad Allarakha Khan", "Pandit Shiv Kumar Sharma", "Ustad Bismillah Khan"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which of the following is INCORRECT with respect to repo rate?", o: ["It is a single policy rate to signal the stance of monetary policy to achieve macro- economic objectives of growth with price stability.", "It is a policy rate which is the key lending rate of the central bank, and its nomenclature varies from country to country.", "It is the rate at which banks place their funds with the RBI and receive collateral.", "It is the rate at which the commercial banks borrow funds from the RBI."], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Alarmel Valli and Rukmini Devi Arundale are associated with which of the following styles of Indian Dances?", o: ["Kathakali", "Bharatanatyam", "Kathak", "Kuchipudi"], a: 1, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Select the personality who received the Sangeet Natak Akademi 2021 award for his/her contribution in Kuchipudi.", o: ["N Sailaja", "Kalamandalam Girija", "Bhuvan Kumar", "Bijay Kumar Jena"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Select the correct option based on the image given below.", o: ["1-c, 2- a, 3-b", "1-a, 2- b, 3-c", "1-b, 2- c, 3-a", "1-c, 2- b, 3-a"], a: 3, e: "", qimg: "17nov2023-s2-q-49.png" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Net national product at market price can be defined as:", o: ["Gross national product at market price plus depreciation", "Net domestic product at market price plus net income from abroad", "Net domestic product at market price minus net income from abroad", "Net domestic product at market price minus depreciation"], a: 1, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["× and +", "÷ and +", "− and ×", "÷ and −"], a: 1, e: "", qimg: "17nov2023-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Six students, Ram, Gopi, Sita, Vimal, Tony and John, are sitting in a straight row facing north. Only two people sit to the left of Sita. Only two people sit between Sita and Vimal. Ram sits to the immediate right of Tony. Gopi sits to the immediate left of John. John is not a neighbour of Vimal. Who sits second from the extreme left end of the row?", o: ["John", "Vimal", "Tony", "Ram"], a: 0, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fourth term in the same way as the first term is related to the second term and the fifth term is related to the sixth term. 70 : 625 :: ? : 144 :: 37 : 196", o: ["35", "31", "41", "45"], a: 1, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "17nov2023-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "17nov2023-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "17nov2023-s2-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘EXIT’ is written as ‘FJYU’ and ‘HIDE’ is written as ‘IEJF’. How will ‘GAME’ be written in that language?", o: ["FBND", "HBNF", "HNBF", "FNBD"], a: 2, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["5", "7", "2", "3"], a: 3, e: "", qimg: "17nov2023-s2-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 4, 10, 17, 25, ?, 44", o: ["32", "34", "33", "31"], a: 1, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "17nov2023-s2-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["6", "7", "8", "9"], a: 2, e: "", qimg: "17nov2023-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "A cube (dice) has six different numbers drawn over its six faces. Three different positions of this cube are shown in the given figure. Which number is on the face opposite to ‘1’?", o: ["4", "6", "2", "5"], a: 3, e: "", qimg: "17nov2023-s2-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "17nov2023-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding /deleting /multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is NOT allowed) (4, 39), (5, 100)", o: ["(6, 192)", "(3, 2)", "(9, 684)", "(12, 153)"], a: 1, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "17nov2023-s2-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "17nov2023-s2-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "17nov2023-s2-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Six letters L, M, N, O, P and Q are written on different faces of a dice. Two different positions of this dice are shown in the figure. Select the letter that will be on the face opposite to the one having O.", o: ["Q", "N", "P", "L"], a: 3, e: "", qimg: "17nov2023-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series. TP_BD_T_R_ _QT_RB_Q _PRB_ _T_ _BDQ", o: ["PBPRDTRQDPBR", "RQPBDPDTDQPR", "PBPTRQRDDPBR", "RQPBPRDPBDTR"], a: 1, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. GIVE : JLYH :: TAKE : WDNH :: COPY : ?", o: ["FRRC", "FRSB", "FRSC", "ERSB"], a: 1, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 16 * 4 * 20 * 82 * 14 * 148", o: ["× ÷ + − =", "÷ + ×− =", "÷ × + = −", "÷ × + − ="], a: 3, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below and complete the pattern.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "17nov2023-s2-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'PQ' as shown below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "17nov2023-s2-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "17nov2023-s2-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, even if it appears to be at variance with commonly known facts, decide which of the given conclusions logically follow(s) from the statements. Statements: All pens are laptops. All laptops are computers. Conclusions: I. All pens are computers. II. All laptops are pens.", o: ["Only conclusion I follows", "Only conclusion II follows", "Neither conclusion I nor II follows", "Both conclusions I and II follow"], a: 0, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of the age of a father to that of his son is 7 : 4. If the product of their ages (in years) is 1008, then what is the ratio of the age of the father to that of the son after 10 years?", o: ["26 : 17", "17 : 13", "11 : 13", "23 : 21"], a: 0, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "17nov2023-s2-q-77.png" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "If the simple interest for 8 years is equal to 40% of the principal, then after how many years will it be equal to the principal?", o: ["20", "15", "18", "25"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of four numbers is 20, and one of these four numbers is 26. What is the average of the remaining three numbers?", o: ["18", "16", "19", "17"], a: 0, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "A temple top is a hollow hemispherical dome with an inner radius of 2 units and an outer radius of 3 units. How much concrete (in cubic units) is used to make the top of the temple?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "17nov2023-s2-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "After successive discounts of 15% and 20%, an article was sold for ₹680. What is the marked price of the article?", o: ["₹3,000", "₹1,000", "₹2,000", "₹1,500"], a: 1, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A camp has provisions for 60 pupils for 18 days. In how many days will the same provisions finish off if the strength of the camp is increased to 72 pupils?", o: ["18 days", "15 days", "12 days", "8 days"], a: 1, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "The compound interest on a certain sum of money at 8% per annum for 3 years is ₹4,058. Find the simple interest on the same sum for 4 years at 10% p.a.", o: ["₹6,520", "₹6,052", "₹6,250", "₹6,025"], a: 2, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "The selling price of an item is 15% more than the cost price and shopkeeper is able to earn ₹25. What is the selling price of the item?", o: ["₹166.67", "₹177.67", "₹191.67", "₹181.67"], a: 2, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "17nov2023-s2-q-85.png" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "17nov2023-s2-q-86.png" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "What will be the HCF of (2×2×3×3×5×7×7×11), (2×3×3×5×11), (2×3×3×5×7×11×11), (2×3×3×5×5×11), (2×3×5×7×7)?", o: ["66", "42", "30", "105"], a: 2, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "It takes eight hours for a 600 km journey, if 120 km is done by train and the rest by car. It takes 20 minutes more, if 200 km is done by train and the rest by car. The ratio of the speed of the train to that of the cars is", o: ["2 : 3", "1 : 3", "3 : 4", "1 : 2"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "Kiran sells an object to Varun at a profit of 10%. Varun sells that object to Arun for ₹1,155 and makes a profit of 5%. At what cost did Kiran purchase the object?", o: ["₹1,000", "₹1,500", "₹2,500", "₹2,000"], a: 0, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "The price of a commodity increased by 22%. By what percentage (correct to two decimal places) should its consumption be reduced so that the total expenditure remains the same?", o: ["19.89%", "20.03%", "21.22%", "18.03%"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "In MS Word 365 If you want to print pages 1, 3, and 5 of a document, which of the following page ranges should you select?", o: ["1-3, 5", "1-5", "1, 3, 5", "1, 3-5"], a: 2, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following is used to move text from one location to another in a word document of MS-Word 365?", o: ["Copy and paste the text at desired location", "Copy the selected text", "Select and cut the selected text", "Cut and paste the text at desired location"], a: 3, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365 which of the following keyboard shortcuts in MS Excel will allow us to open a new spreadsheet?", o: ["Shift + N", "Ctrl + N", "Alt + O", "Ctrl + O"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, to insert a new row above the selected row in Microsoft Excel 365, which command should you use?", o: ["Insert Column", "Insert Row", "Delete Row", "Delete Column"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "How do you print a Microsoft Word 365 document?", o: ["Select the Print command and then select ‘Ok’", "Select the Ready Printer command and then select ‘Ok’", "Select the Print command", "Select the Ready Printer command"], a: 0, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "एमएस एक्सेल 365 (MS Excel 365) में, निम्नलिखित में से कौन-सा विकल्प माइक्रोसॉफ्ट एक्सेल (Microsoft Excel) में टेबल बनाने का एक लाभ नहीं है?", o: ["बढ़ी हुई डेटा अखंडता और सटीकता", "ऑटोमेटिक फिल्टरिंंग और सॉर्टिंग विकल्प", "बेहतर कैलकुलेशन क्षमता", "उन्नत विसुअल अपील और फॉर्मेटिंंग"], a: 0, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following is the correct structure of an email address?", o: ["name_domain.com", "name@com_domain", "name@domain.com", "name.com"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following is the correct option to convert text into superscript?", o: ["Shift+S", "Ctrl+Shift+ +", "Ctrl+Shift+U", "Ctrl+Shift+S"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following statements related to MS Word 365 is/are correct? 1) ‘Save’ allows you to update a previously saved file with new content. 2) ‘Save As’ allows you to save a new file or an existing file to a new place with the same name or a different name.", o: ["Neither (1) nor (2)", "Only (1)", "Both (1) and (2)", "Only (2)"], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "A global network of interconnected computers and devices is called ______________.", o: ["Manet", "Ethernet", "Intranet", "Internet"], a: 3, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 17 Nov 2023 Shift-2";
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
