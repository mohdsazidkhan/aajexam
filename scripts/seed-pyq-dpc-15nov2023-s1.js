/**
 * Seed: Delhi Police Constable - 15 Nov 2023 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc15nov2023_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-15nov2023-s1';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 15 Nov 2023 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "How many medals did India win in the International Shooting Sport Federation (ISSF) World Cup-2022, which was held in Cairo, Egypt?", o: ["5", "4", "7", "6"], a: 2, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Narthaki Nataraj, awarded with Padma Shri in 2019 is an Indian _________ dancer.", o: ["Odissi", "Bharatanatyam", "Kathakali", "Kathak"], a: 1, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "The innermost sanctum of a Hindu temple where the idol of the main deity is placed is called:", o: ["Garbhagriha", "Mandapa", "Pradakshina path", "Shikhara"], a: 0, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "In which state of India from the following is the old bamboo drip irrigation technology still used in the agriculture?", o: ["Maharashtra", "Chhattisgarh", "Meghalaya", "Telangana"], a: 2, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Which Constitutional Amendment Act has replaced the collegium system of appointing judges to the Supreme Court and High Courts?", o: ["99th Amendment Act", "65th Amendment Act", "82nd Amendment Act", "52nd Amendment Act"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Who led the English Forces in the Battle of Buxar?", o: ["Hector Munro", "Sir Hugh Wheeler", "Henry Lawrence", "John Nicholson"], a: 0, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Under which Article of the Indian Constitution are Fundamental Duties mentioned?", o: ["Article 50B", "Article 44C", "Article 51A", "Article 55D"], a: 2, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Which of the following Indian players has written the autobiography titled ‘Ace Against Odds’?", o: ["Saina Nehwal", "Maria Sharapova", "Monica Seles", "Sania Mirza"], a: 3, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "The Ahaia Winter Festival is primarily organised by the North-Eastern state of ______ to promote tourism.", o: ["Meghalaya", "Tripura", "Arunachal Pradesh", "Sikkim"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which of the following countries hosts the first para Asiad?", o: ["South Korea", "China", "Japan", "India"], a: 1, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Who among the following Padma Bhushan awardee dancers was called to perform for the coronation festivities of Queen Elizabeth II?", o: ["Birju Maharaj", "Kumari Kamala", "Yamini Krishnamurthy", "Alarmel Velli"], a: 1, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Freedom of Conscience provided in Article 25 of the Constitution of India is strengthened by which of the following two articles?", o: ["Article 27 and 28", "Article 27 and 29", "Article 26 and 28", "Article 24 and 28"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "The Article 350 (B) of the Indian Constitution deals with the .", o: ["finance commission", "election commission", "special officer for linguistic minorities", "UPSC"], a: 2, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Who wrote the novel ‘Train to Pakistan’?", o: ["Vikram Seth", "Mulk Raj Anand", "Khushwant Singh", "Bhisham Sahni"], a: 2, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Which of the following union territories recorded the highest sex ratio at birth in India in 2020 as per annual report on vital statistics based on Civil Registration System Report?", o: ["Jammu and Kashmir", "Ladakh", "Lakshadweep", "Chandigarh"], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "The original Constitution contained 395 Articles divided into ________ parts.", o: ["22", "19", "21", "24"], a: 0, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Norman Borlaug, known as the Father of Green Revolution for the world, belongs to which country?", o: ["US", "New Zealand", "Australia", "Germany"], a: 0, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "In which country was the Theosophical Society founded?", o: ["England", "America", "France", "Japan"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "What are the most common type of earthquakes?", o: ["Volcanic earthquakes", "Seismic earthquakes", "Reservoir earthquakes", "Tectonic earthquakes"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Which government scheme’s main aim is to ‘transform rural poor youth into an economically independent and globally relevant workforce’?", o: ["Shyama Prasad Mukherjee Rurban Mission", "National Career Service", "Deen Dayal Upadhyaya Grameen Kaushalya Yojana", "Deendayal Antyoday Yojana- National Rural Livelihood Mission"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Who among the following personalities is an award-winning Mohiniyattam Dancer?", o: ["Meenakshi Chitharanjan", "Vasundhara Doraswamy", "Neena Prasad", "Sutapa Talukdar"], a: 2, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "The scheme called Bringing Green Revolution to Eastern India is being implemented in how many eastern states?", o: ["Four", "Seven", "Three", "Six"], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "According to Census of India, 2011 Which of the following is in the top three states with highest population of age 0-6 years?", o: ["Maharashtra", "Assam", "Kerala", "Madhya Pradesh"], a: 0, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "India announced the NEP in 1991. NEP stands for _________ .", o: ["New Economic Policy", "National Export Plan", "National Economic Policy", "New Economic Provision"], a: 0, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Shambhu Maharaj was conferred the Sangeet Natak Akademi Fellowship for which form of dance?", o: ["Kuchipudi", "Kathak", "Bharatanatyam", "Manipuri"], a: 1, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Gross national product is the total market value of all final goods and services produced by _________.", o: ["nationals and NRIs of a country during a period of five years", "Country’s residents over a period of time", "national and foreigners during a period of two years", "nationals of a country during a period of five year"], a: 1, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "At which Olympic Games did the Indian hockey men’s team win its last gold medal?", o: ["2008", "1980", "2012", "1996"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Select the most appropriate option with respect to the correctness of the following statements. a) India has great potential for the development of tidal energy. b) A geothermal energy plant has been commissioned at Manikaran in Himachal Pradesh.", o: ["Both a and b are correct", "Only a is correct", "Both a and b are incorrect", "Only b is correct"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which of the following parts/structures is located at the topmost part of a Stupa?", o: ["Torana", "Harmika", "Vedika", "Medhi"], a: 1, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Sandeep Das is famous for playing which of the following percussion instruments?", o: ["Pakhawaj", "Tabla", "Kanjira", "Ghatam"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Arakan and Shan are recognised ethnic groups of ________.", o: ["Myanmar", "Sri Lanka", "Nepal", "Bhutan"], a: 0, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "In which of the following States was the 37th National Junior Athletics Championship held?", o: ["Manipur", "Nagaland", "Assam", "Mizoram"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Who among the following introduced binominal nomenclature of biological classification?", o: ["Aristotle", "John Ray", "Charles Darwin", "Linnaeus"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "According to the PRS report of the Ministry of Agriculture, which two crops contributed to 78% of the country's food grain production till 2015-16?", o: ["Maize and soybeans", "Millets and pulses", "Wheat and rice", "Pulses and sugarcane"], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Coal, petroleum, and kerosene are examples of:", o: ["coal fuels", "fossil fuels", "renewable resources", "clean energy resources"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Which Constitutional Amendment Act amended Article 38, enumerated under the Directive Principles of State Policy, and directed ‘State to minimise inequalities in income, status, facilities and opportunities’?", o: ["43", "42", "44", "40"], a: 2, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Why did Mother Teresa establish the ‘Nirmal Hriday’ Hospice?", o: ["To provide a place where the terminally ill could die in peace", "To provide a home for orphan girl-children", "To provide a refuge for patients of leprosy", "To provide a home for young widows"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which of the following correctly describes chemotherapy?", o: ["Use of motivational advice as treatment", "Use of physical exercise for treatment", "Use of chemicals for therapeutic purposes", "Use of treatment for behavioural disorder"], a: 2, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Who was the first Indian to qualify for the covenanted civil services in India?", o: ["Surendra Nath Banerjee", "Subhas Chandra Bose", "Satyendra Nath Tagore", "Rajagopalachari"], a: 2, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "What is the sanctioned judge strength of the Supreme Court excluding Chief Justice of India as per the Supreme Court (Number of Judges) Amendment Act, 2019?", o: ["Ten", "Thirty-Three", "Twenty-One", "Twenty-Eight"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "‘Shaka’ is the Indian term used for the people called Scythians, who originally belonged to _________ .", o: ["central Asia", "south-western Asia", "south-eastern Asia", "eastern Asia"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Who was the leader of the southern military campaign of Alauddin Khalji?", o: ["Aadham Khan", "Mahmud Ganva", "Malik Kafur", "Malik Sarvar"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "मुगल अधिकारी अमल-गुजार मुख्य रूप से ________ का कार्य करते थे।", o: ["शाही उद्यान की बागवानी", "सैनिकों की भर्ती", "भू-राजस्व एकत्रित करने", "शाही परिवार को सुरक्षा प्रदान करने"], a: 2, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "साकेवा एक धार्मिक त्योहार है जो _________ के किरात खंबू राई समुदाय द्वारा मनाया जाता है।", o: ["मध्य प्रदेश", "सिक्किम", "झारखंड", "पंजाब"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Who among the following is known as the tabla maestro?", o: ["Ustad Bismillah Khan", "Ghulam Ali", "Ustad Amjad Ali Khan", "Ustad Zakir Hussain"], a: 3, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "A solution contains 50 g of sugar in 450 g of water. Calculate the concentration in terms of mass by mass percentage of the solution.", o: ["0.1%", "10%", "1%", "0.01%"], a: 1, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Which special symbol is commonly used by geologists to describe the orientation of rock beds, faults, fractures, cuestas, igneous dikes and sills?", o: ["Scale Indicator", "Average directional index", "Strike and dip", "Compass rose"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Which fo the following dynasties arose as a result of Alexander’s invasion?", o: ["Maurya", "Pandya", "Chalukya", "Pallava"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "The phenomenon of liquidity trap is based upon which of the following aspects of demand for money?", o: ["Precautionary", "Velocity of circulation", "Transaction", "Speculative"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "The process of removing government-imposed limits or impediments is known as:", o: ["liberalisation", "financial investments", "privatisation", "globalisation"], a: 0, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it. First row - 56, 16, 60 Second row - 64, 18, 68 Third row - 72, 20, ? (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. Eg. 13 – Operations on 13 such as adding /subtracting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed)", o: ["75", "74", "76", "78"], a: 2, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series. D _ A _ W _ S _ E W _ S A E _ D _ A E _", o: ["SEDADWSW", "SEDADWES", "SEDADSSW", "SEDADESW"], a: 0, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Six students are sitting around a circular table facing the centre. Udit is an immediate neighbour of both Uday and Unnati. Umesh is sitting second to the right of Unnati. Utpal is sitting third to the left of Uday. Utsav is an immediate neighbour of both Umesh and Uday. Who is an immediate neighbour of both Umesh and Unnati?", o: ["Utpal", "Uday", "Utsav", "Udit"], a: 0, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'MN' as shown below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "15nov2023-s1-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, even if it appears to be at variance with commonly known facts, decide which of the given conclusions logically follow(s) from the statements. Statements: Some stars are planets. All stars are comets. Conclusions: I.Some comets are planets. II. Some planets are stars.", o: ["Only conclusion I follows", "Only conclusion II follows", "Both conclusions I and II follow", "Neither conclusion I nor II follows"], a: 2, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below and complete the pattern.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "15nov2023-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "15nov2023-s1-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "14 is related to 27 following a certain logic. Following the same logic, 17 is related to 33. To which of the following is 24 related following the same logic?", o: ["53", "47", "56", "50"], a: 1, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "15nov2023-s1-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "15nov2023-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "15nov2023-s1-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["10", "12", "14", "15"], a: 1, e: "", qimg: "15nov2023-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["B", "P", "A", "Q"], a: 2, e: "", qimg: "15nov2023-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "15nov2023-s1-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "15nov2023-s1-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct? 35 + 76 − 98 ÷ 3 × 6 = 62", o: ["÷ and ×", "= and ×", "+ and ×", "− and +"], a: 0, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "15nov2023-s1-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "15nov2023-s1-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 3, 21, 57, 129, 273, ?", o: ["234", "561", "456", "345"], a: 1, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "In a code language, if MUSIC is coded as 13-21-19-9-3 and BAND is coded as 2-1-14-4, then how will HARMONIUM be coded?", o: ["7-25-16-12-14-13-8-19-12", "8-1-18-13-15-14-9-21-13", "7-26-17-12-14-13-8-20-12", "8-2-19-12-15-14-9-20-12"], a: 1, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Three different positions of the same dice are shown. Find the number on the face opposite the face showing ‘3’.", o: ["2", "4", "5", "6"], a: 3, e: "", qimg: "15nov2023-s1-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third word in the same way as the second word is related to the first word. (The words must be considered as meaningful English words and must NOT be related to each other based on the number of letters/number of consonants/vowels in the word) Norway: Oslo:: Iran:?", o: ["Baghdad", "Moscow", "Tehran", "Madrid"], a: 2, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "15nov2023-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below and complete the pattern.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "15nov2023-s1-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "If A denotes ‘+’, B denotes ‘×‘, C denotes ‘−’, and D denotes ‘÷’, then what will come in place of ‘?’ in the following equation? 24 D (1 A 7) C 2 A 7 B 12 B (5 C 4) = ?", o: ["96", "85", "88", "83"], a: 1, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A certain sum is lent on simple interest at 4% p.a. for 3 years, 8% p.a. for the next 4 years, and 12% p.a. beyond 7 years. If for a period of 11 years, the simple interest obtained is ₹27,600, the sum is (in ₹):", o: ["28,000", "25,000", "30,000", "32,000"], a: 2, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of ₹66,550 is taken on loan. This is to be paid back in two equal instalments. If the rate of interest is 20% compounded annually, find the value of each instalment.", o: ["₹42,560", "₹44,550", "₹40,550", "₹43,560"], a: 3, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "The price of an item is to be increased by 25% in two years. This year, the price increased to ₹140 from ₹120. What is the percentage increase in the next year?", o: ["4.71%", "4.17%", "7.14%", "7.41%"], a: 2, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the diameter of a sphere that has a surface area of 2500π cm2?", o: ["40 cm", "35 cm", "50 cm", "25 cm"], a: 2, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "The price of an article has been reduced by 20%. In order to restore the original price, the new price must be increased by:", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "15nov2023-s1-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "Which of the following is the smallest ratio?", o: ["15 : 20", "7 : 21", "21 : 25", "17 : 25"], a: 1, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "If Malay buys guavas at ₹300 per kg and sells them at ₹25 per 100 gm., then he will have (rounded off to 2 decimal places):", o: ["a loss of 16.67%", "a profit of 25.25%", "a loss of 25.25%", "a profit of 16.67%"], a: 0, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "If 25 people, working 15 hours a day, can complete 5 units of work in 8 days, then how many days will be required by 12 people to complete 10 units of work, working 20 hours a day?", o: ["25 days", "24 days", "20 days", "22 days"], a: 0, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["10 cm", "12.5 cm", "11.5 cm", "11 cm"], a: 0, e: "", qimg: "15nov2023-s1-q-84.png" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "Meera made a profit of 5% by selling a bag after offering a discount of 10%. If the marked price of bag is ₹1,050, find its cost price.", o: ["₹850", "₹900", "₹508", "₹1,000"], a: 1, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the sum of the square of the prime numbers between 20 and 30?", o: ["1500", "1370", "1290", "1276"], a: 1, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "15nov2023-s1-q-87.png" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "What will be the least common multiple of four numbers 15, 35, 42 and 72?", o: ["2550", "2050", "2520", "2025"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "15nov2023-s1-q-89.png" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "The highest common factor (HCF) of 256, 136 and 436 is _________.", o: ["2", "4", "8", "12"], a: 1, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which text alignment option in Microsoft Word 365 aligns text along the left margin?", o: ["Center Align", "Left Align", "Right Align", "Justify"], a: 1, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "What action should be taken to add a new row or column in a spreadsheet?", o: ["Right-click on an existing row or column and select ‘Insert’ from the context menu.", "Use the ‘Find and Replace’ function to search for a specific cell, and then insert a new row or column using the results.", "Highlight a range of cells, right-click, and choose ‘Delete’ from the context menu to create space for the new row or column.", "Select a row or column, press the ‘Ctrl+X’ keyboard shortcut to cut it, and then press ‘Ctrl+V’ to paste it in the desired location."], a: 0, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In Microsoft Excel 365, which tool should we use for creating or editing formulas in a worksheet?", o: ["Formula bar", "Watch window", "Precedents", "Auditing toolbar"], a: 0, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "In which of the following tabs in MS Word 365 is Bullets and Numbering present?", o: ["Page layout", "Home", "Edit", "File"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "What is the purpose of the CC field in an email?", o: ["To include additional recipients who should be kept informed", "To request a read receipt from the recipient", "To encrypt the email for added security", "To indicate that the email is of high importance"], a: 0, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following shorcut key is used to insert a hyperlink in MS Word 365?", o: ["Shift + H", "Ctrl + K", "Ctrl + H", "Shift + K"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Select the correct option based on the image given below.", o: ["Justifying", "Right alignment", "Centre of text", "Left alignment"], a: 1, e: "", qimg: "15nov2023-s1-q-97.png" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "What does the ‘Orientation’ option in the Page Setup menu in Microsoft Word 365 allow you to change?", o: ["Text alignment", "Page layout (portrait or landscape)", "Font style", "Page size"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following is a private network that is typically open to external parties, such as business partners, suppliers, and key customers?", o: ["Telnet", "Extranet", "Intranet", "Internet"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following is the correct way to sort a range of cells in ascending order in MS Excel 365?", o: ["Select the range of cells and press ‘Ctrl + Shift + S’.", "Click on the ‘Review’ tab and select ‘Sort’.", "Click on the ‘OK’ button.", "In the ‘Sort’ dialog box, select the ‘Ascending’ option in the ‘Order’ section."], a: 3, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 15 Nov 2023 Shift-1";
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
