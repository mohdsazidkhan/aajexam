/**
 * Seed: Delhi Police Constable - 24 Nov 2023 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc24nov2023_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-24nov2023-s2';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 24 Nov 2023 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "The structural part of the Indian Constitution is derived from:", o: ["Government of India Act 1919", "Government of India Act 1935", "Government of India Act 1909", "Government of India Act 1958"], a: 1, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Padma Shri awardee, Shivnath Mishra is an exponent of Benaras Gharana and he plays _________ styles of Benaras Gayaki Ang.", o: ["Six", "Three", "Two", "Four"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "What is the full form of NADA?", o: ["National Age-Detecting Agency", "National Assessment and Development Agency", "National Athletes-Development Agency", "National Anti-Doping Agency"], a: 3, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "What is the primary factor contributing to structural unemployment in India?", o: ["Lack of education", "Seasonal variations", "Unavailability of jobs", "Technological advancements"], a: 3, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "My times: An autobiography, is authored by whom among the following famous freedom fighters of India?", o: ["Vinoba Bhave", "J B Kriplani", "Motilal Nehru", "C R Das"], a: 1, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "The term ‘bouncer’ is used in which of the following games?", o: ["Hockey", "Football", "Tennis", "Cricket"], a: 3, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Who of the following wrote ‘Prithviraj Raso’?", o: ["Rajasekhara", "Jaidev", "Chand Bardai", "Padmagupta"], a: 2, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Shovana Narayan an officer with the Indian Audit and Account Services, has won many awards for her contribution to the field of dance at the international level and has recently acted in a movie. She is an exponent of which of the following dance forms?", o: ["Bharatanatyam", "Kathak", "Odissi", "Kuchipudi"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Article 76 of the Constitution of India provides for:", o: ["Ombudsman", "Finance Commission Chairman", "Election Commissioner", "Attorney General"], a: 3, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Who among the following kings founded a suburban township near Vijayanagara called Nagalapuram?", o: ["Deva Raya II", "Rajaraja Chola", "Rajendra I", "Krishnadevaraya"], a: 3, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "During the British era India was an exporter of:", o: ["capital goods", "industrial products", "Manufacturing products", "primary products"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "In the game of discus throw what is the standard weight of a discus for women?", o: ["1500 gm", "1000 gm", "1200 gm", "800 gm"], a: 1, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Which of the following is referred to as a relaxation of Government restrictions?", o: ["Disinvestment", "Liberalisation", "Globalisation", "Privatisation"], a: 1, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "In which of the following states of India is the Nokrek Biosphere Reserve located?", o: ["Nagaland", "Meghalaya", "Karnataka", "Telangana"], a: 1, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Which of the following communities of Sikkim celebrates ‘Sonam Lochar’ as its New Year on the first day of the twelfth month in the lunar calendar?", o: ["Kirat Khambu Rai", "Lepcha", "Tamang", "Gurung"], a: 2, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "In the Commonwealth Games, 2022, India won _________ .", o: ["25 gold medals", "22 gold medals", "24 gold medals", "23 gold medals"], a: 1, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Identify the precipitate formed when carbon dioxide gas is passed through lime water.", o: ["Zinc carbonate", "Calcium oxide", "Sodium oxide", "Calcium carbonate"], a: 3, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Which Article of the Constitution of India mentions that the State shall, in particular, direct its policy towards securing equal pay for equal work for both, men and women?", o: ["Article 30", "Article 37", "Article 39", "Article 33"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "In which of the following years did the Muslim League demand Pakistan, a separate nation for Indian Muslims?", o: ["1932", "1940", "1937", "1943"], a: 1, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Padmaja Reddy is a famous _________ classical dancer.", o: ["Kathak", "Kathakali", "Kuchipudi", "Bharatnatyam"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "The process of removing silica from soil is known as:", o: ["salinisation", "polarisation", "leaching", "desilication"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Who is considered as the highest law officer in the country?", o: ["Chief Election Commissioner", "Chairman of NITI AAYOG", "Attorney General of India", "Chief Justice of India"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Ponnayya, Vadivelu, Shivanandam and Chinnayya who were renowned as Tanjore Bandhu, were well-known exponents of which dance?", o: ["Kuchipudi", "Kathakali", "Bharatnatyam", "Mohiniyattam"], a: 2, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Which dynasty’s king was the first ruler to issue gold coins on a large scale in India?", o: ["Shaka", "Unani", "Pahlava", "Kushan"], a: 3, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Which Article of the Constitution of India mentions that “it shall be the duty of every citizen of India to protect and improve the natural environment including forests, lakes, rivers and wild life, and to have compassion for living creatures”?", o: ["51A (b)", "51A (j)", "51A (g)", "51A (e)"], a: 2, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Identify the artist who is NOT associated with the musical instrument sarangi.", o: ["Pandit Ram Narayan", "Ustad Binda Khan", "Pandit Vishwa Mohan Bhat", "Shakoor Khan"], a: 2, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which of the following schemes come under the Ministry of Commerce and Industry?", o: ["Swachh Bharat Abhiyan", "National Digital Health Mission", "National Bal Swachhta", "Make in India"], a: 3, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Pandrethan temple of Srinagar is associated with which of the following religions?", o: ["Hinduism", "Sikhism", "Jainism", "Buddhism"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "The Charter Act of _______ suspended the monopoly of the East India Company over trade with India.", o: ["1973", "1853", "1833", "1813"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "In which of the following years was the Railway budget merged with the Union budget?", o: ["2015", "2017", "2012", "2019"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Who among the following won the ‘66th Filmfare Award 2021 for Best Choreography’ for the song Dil Bechara?", o: ["Ganesh Acharya", "Prabhu Deva", "Farah Khan", "Remo D’Souza"], a: 2, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "The process by which the mix of species and habitat in an area changes over time is called:", o: ["ecological balance", "ecological degradation", "ecological succession", "ecological saturation"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Who is known as the ‘Father of Microfinance’? He founded Grameen Bank to make small loans available to the poor.", o: ["Amartya Sen", "Muhammad Yunus", "Mahatma Gandhi", "Mahbub Haq"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Through which Constitution Amendment Act was Article 39A inserted into the Constitution of India?", o: ["48th Amendment Act", "46th Amendment Act", "44th Amendment Act", "42nd Amendment Act"], a: 3, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Banganga Festival, held every year in the city of Mumbai, is a musical tribute to________.", o: ["Lord Brahma", "Lord Rama", "Lord Ganesh", "Lord Shiva"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Identify the group of crops that are associated with Kharif season in the northern states of India?", o: ["Rice, Cotton, Bajra, Rapeseeds, Mustard", "Cotton, Bajra, Maize, Wheat, Gram", "Wheat, Gram, Rapeseeds, Mustard, Barley", "Rice, Cotton, Bajra, Maize, Jowar"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "When was the Jan Dhan Yojana launched?", o: ["2015", "2016", "2013", "2014"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which of the following was co-founded by Subhas Chandra Bose?", o: ["All India Forward Bloc", "All India Students Federation", "Kisan Majdoor Praja Party", "Congress Socialist Party"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "In the states, No Demand for Grants can be made EXCEPT on the recommendation of the ________________.", o: ["Governor", "Chief Minister", "Finance Minister of the State", "President of India"], a: 0, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "The famous Hindu Temple ‘Koneswaram’ is located in which country?", o: ["Pakistan", "Nepal", "Bhutan", "Sri Lanka"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Which of the following statement is related to Koeppen's ‘A’ type of climate?", o: ["Average temperature for all months is below 10°C", "Cold due to elevation", "Average temperature of the coldest month is 18°C or higher", "Possible evaporation is equal to precipitation"], a: 2, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "'Maila Aanchal’, one of the finest examples of regional novels is written by:", o: ["Phanishwar Nath Renu", "Kamleshwar", "Kedar Nath Singh", "Munshi Premchand"], a: 0, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "According to the Ministry of Fisheries, Animal Husbandry and Dairying, Government of India, what was India’s rank in milk production in the world in 2022?", o: ["First", "Third", "Fifth", "Second"], a: 0, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "The lower portion of Dhamekh Stupa at Sarnath is covered with carved _________ .", o: ["granite", "marble", "stone", "wood"], a: 2, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Who among the following Muslim leaders of British India joined the All-India Muslim League in 1913?", o: ["Maulana Shaukat Ali", "Maulana Abul Kalam Azad", "Muhammad Ali Jinnah", "Hakim Ajmal Khan"], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which of the following committees was constituted in 1955 for village and small-scale industries?", o: ["Kohli Committee", "Karve Committee", "Hussain Committee", "Nayak Committee"], a: 1, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Gorgonia ventalina is the scientific name of which saltwater invertebrate?", o: ["Sea cucumber", "Sea urchin", "Common sea fan", "Sea anemone"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "What was the capital of North-western province under Ashoka?", o: ["Ujjayini", "Tosali", "Taxila", "Suvarnagiri"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "According to the 2011 Census, which state has the least population in India?", o: ["Sikkim", "Nagaland", "Tripura", "Arunachal Pradesh"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Consider the following statements and select the correct option. A: All the objects must change from solids into liquids before changing into gases. B: Evaporation is the process by which solids can change into gases.", o: ["A is false, but B is true", "Both A and B are true", "Both A and B are false", "A is true, but B is false"], a: 2, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given equation. 20*60*40*20*10*0", o: ["+, –, ×, ÷, =", "+, ×, –, ÷, =", "+, ×, –, =, ÷", "÷, –, ×, +, ="], a: 0, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'MN' as shown below. Problem figure:", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "24nov2023-s2-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct? 144 ÷ 12 + 12 −12 × 12 = 1", o: ["= and ×", "+ and −", "÷ and +", "× and −"], a: 0, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Which of the following options will replace the question mark (?) in the given series? 43, 301, 236, 1652, 1587, ?, 11044", o: ["963", "11109", "1173", "709"], a: 1, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "24nov2023-s2-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Given below is a series of figures – A, B, C and D which follow a particular pattern. Which of the given option figures should come in place of E to continue the series?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "24nov2023-s2-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Two statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: All shrubs are trees. Some plants are shrubs. Conclusions: I. All plants are trees. II. Some trees are shrubs. III. No plant is a tree.", o: ["Only conclusions II and III follow", "Only conclusion III follows", "Only conclusion II follows", "Either conclusion I or III follows"], a: 2, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "24nov2023-s2-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘CODY’ is written as ‘CQDA’ and ‘DINO’ is written as ‘DKNQ’. How will ‘RAIN’ be written in that language?", o: ["PCIP", "RCIP", "RCPI", "RPIC"], a: 1, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "24nov2023-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["24", "22", "16", "20"], a: 0, e: "", qimg: "24nov2023-s2-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "24nov2023-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'XY' as shown below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s2-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "24nov2023-s2-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the given sets. (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g., 13 – Operations on 13 such as adding/ deleting/ multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed. (101, 106, 111) (214, 198, 182)", o: ["(123, 129, 133)", "(89, 95, 99)", "(78, 136, 190)", "(163, 156, 149)"], a: 3, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? CYFW, GUIT, KQLQ, ?, SIRK", o: ["ONOM", "PMON", "PNON", "OMON"], a: 3, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "24nov2023-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "24nov2023-s2-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. EDGE : CEBC :: ICON : LMAG :: KICK : ?", o: ["IAGJ", "IAGI", "JAGJ", "IAHI"], a: 1, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "O, P, Q, R, W and X are sitting around a circular table facing the centre. W sits second to the left of R. Q sits to the immediate left of W. O sits to the immediate left of X. Who sits to the immediate left of R?", o: ["P", "O", "Q", "X"], a: 0, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "24nov2023-s2-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the figure from the options that can replace the question mark (?) and complete the given pattern.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s2-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s2-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 1278 : 1478 :: 1926 : ? :: 3798 : 3998", o: ["2026", "1986", "1876", "2126"], a: 3, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "Which of the ratio is the smallest?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "24nov2023-s2-q-76.png" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the result of the expression 4.5 × 2.8 + 3.6 × 2.5 − 1.7 × 12? (Use decimal upto 1 point)", o: ["2.3", "1.9", "3.4", "1.2"], a: 3, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1760 cm2", "2960 cm2", "3960 cm2", "2160 cm2"], a: 2, e: "", qimg: "24nov2023-s2-q-78.png" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Ram received an annual salary of ₹48,580 in the year 2008. This was 25% more than his salary in 2007. What was his salary in 2007?", o: ["₹31,750", "₹39,670", "₹33,864", "₹38,864"], a: 3, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "The price of an article is reduced by 25% and its daily sale is increased by 30%. The net effect on the daily sale receipts is:", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "24nov2023-s2-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "If a person walked 14 km/h instead of 10 km/h, he would have walked 20 km more. The actual distance travelled by him is:", o: ["100 km", "70 km", "50 km", "150 km"], a: 2, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the average of 72, 81, 90, 68, 61.", o: ["78.6", "72.2", "74.4", "76.8"], a: 2, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Four years ago, the population of a city was 10,000. The annual growth rate of the population during the first two years was 20%. In the third and fourth years, there was a decrease in the population at the rate of 10% and 5%, respectively. What is the current population of the city after four years?", o: ["10500", "14288", "16632", "12312"], a: 3, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "8 men can complete a work in 6 hours. In how many hours can 12 men complete the same work?", o: ["4", "6", "5", "3"], a: 0, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "Lalita bought 10 water bottles for ₹18 each and sold them for ₹20 each. What is her overall profit percentage?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "24nov2023-s2-q-85.png" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "The market price of a toy is 25% above the cost price. If the shopkeeper gives 12% discount, then find the gain in the deal.", o: ["12%", "10%", "15%", "13%"], a: 1, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1386", "1495", "1586", "1376"], a: 0, e: "", qimg: "24nov2023-s2-q-87.png" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "An amount of ₹4,000 was divided into two parts in such a way that, when the first part was invested at 3% per annum simple interest and the second at 5% per annum simple interest, the total annual interest from both the investments was ₹144. How much was put at 3% per annum simple interest?", o: ["₹2,100", "₹1,400", "₹2,800", "₹700"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the difference between the smallest and the largest prime numbers between 1 to 100?", o: ["95", "94", "87", "86"], a: 0, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "The smallest four-digit number which is divisible by 15, 25, 40 and 75 is:", o: ["1080", "1120", "1100", "1200"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "In Microsoft Word 365, what does paragraph formatting primarily control?", o: ["Font style and colour", "Document headers and footers", "Line spacing and alignment", "Page layout and margins"], a: 2, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "How can we combine names and addresses with a standard document in Microsoft Word 365?", o: ["Mail Merge", "Mail Formatting", "Document Merge", "Document Formatting"], a: 0, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365 , which of the following keyboard shortcuts will open the ‘Open’ dialog box, where you can navigate to the location of a spreadsheet file and open it?", o: ["Alt + O", "Shift + Alt + O", "Ctrl + O", "Ctrl + Shift + O"], a: 2, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following signs is always the first part of the formula followed by an expression that calculates a value in MS-Excel 365?", o: ["/ (Division)", "− (Subtraction)", "= (Equal to)", "+ (Addition)"], a: 2, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which of the following shortcut keys is used to perform right alignment in MS Word 365?", o: ["Ctrl + L", "Ctrl + Shift + >", "Ctrl + Shift + <", "Ctrl + R"], a: 3, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following is an email client offered by Microsoft?", o: ["Thunderbird", "Gmail", "Apple", "Outlook"], a: 3, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following in communication of internet is a process of transferring real- time messages between users that facilitates private chat room atmosphere?", o: ["Collaboration", "Remote access", "File sharing", "Instant messaging"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, how can a full name in MS-Excel 365 be split into separate first name and last name columns?", o: ["Using the TEXT function", "Using the CONCATENATE function", "Using the Data Validation feature", "Using the Text to Columns feature"], a: 3, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "In MS word 365. Which of the following menus has icons to Add Text, Update A Table, Insert Footnote, and Index in the Word Processing Package?", o: ["Page Layout", "References", "Mailings", "Design"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which button in the Home tab of Microsoft Word 365 can be used to cut selected text?", o: ["Clipboard icon", "Scissors icon", "Arrow pointing down icon", "Double sheets of paper icon"], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 24 Nov 2023 Shift-2";
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
