/**
 * Seed: Delhi Police Constable - 28 Nov 2023 Shift-3
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc28nov2023_s3');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-28nov2023-s3';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 28 Nov 2023 Shift-3"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Which of the following Chola Kings raided the Ganga Valley region?", o: ["Rajendra I", "Uttama Chola", "Arinjaya Chola", "Gandaraditya"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "In 1991, India met with an economic crisis due to _____.", o: ["low inflation", "political instability", "rise in foreign exchange reserves", "huge debts burden"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "The Sangeet Natak Akademi gives fellowships to eminent artists. Radha Sridhar received it for Bharatanatyam which is a dance form of which state?", o: ["Kerala", "Andhra Pradesh", "Karnataka", "Tamil Nadu"], a: 3, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "‘Per Drop More Crop’ is the main tag line of which government scheme?", o: ["Pradhan Mantri Fasal Bima Yojana", "Pradhan Mantri Krishi Sinchai Yojana", "Atal Bhujal Yojana", "National Action Plan for Climate Change"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "‘India wins Freedom’ is an autobiography written by whom among the following Freedom Fighters?", o: ["Pattabhi Sitaramayya", "Abul Kalam Azad", "Lokmanya Tilak", "Annie Besant"], a: 1, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "To which mineral group do galena, chalcopyrite and molybdenite belong?", o: ["Halides", "Sulphides", "Phosphides", "Oxides"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Who presides over the Lok Sabha in absence of the Speaker and the Deputy Speaker?", o: ["Chief Justice of Supreme Court", "Person appointed by Prime Minister", "Person from amongst the members of the panel nominated by the Speaker", "President"], a: 2, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Pradhan Mantri Garib Kalyan Deposit Scheme (PMGKDS) was launched in which year by the Government of India?", o: ["2009", "2014", "2016", "2020"], a: 2, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which of the following High Courts were established in 1866?", o: ["Allahabad High Court", "Kerala High Court", "Gujarat High Court", "Bombay High Court"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which of the following is an example of indirect tax?", o: ["Customs duty", "Individual income tax", "Gift tax", "Corporate income tax"], a: 0, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Select the correct option based on the image given below.", o: ["a-i, b-ii, c-iii", "a-iii, b-i, c-ii", "a-i, b-iii, c-ii", "a-ii, b-i, c-iii"], a: 3, e: "", qimg: "28nov2023-s3-q-11.png" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Article 51 of the Indian Constitution says that the state shall endeavour to:", o: ["protect and improve the environment and to safeguard forests and wildlife", "protect monuments, places and objects of artistic or historic interest", "separate judiciary from the executive", "promote international peace and security"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "The President of India and the Governor of States enjoy the immunities as mentioned under Article _________________.", o: ["360", "362", "361", "359"], a: 2, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "The Theosophical Society was started by which of the following social reformers?", o: ["Raja Ram Mohan Roy", "Swami Vivekananda", "Annie Besant", "Syed Ahmed Khan"], a: 2, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Which dynasty under the Delhi Sultanate was the first Afghan Pashtun Dynasty in India?", o: ["Khilji", "Mamluk", "Sayyed", "Lodhi"], a: 3, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Under which of the following Acts were the commercial activities to be taken care by the East India Company and the political activities by the British parliament?", o: ["Government of India Act of 1935", "Indian Councils Act of 1861", "Regulating Act of 1773", "Pitts India Act, 1784"], a: 3, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "When were the two annual plans carried out?", o: ["After the ninth Five-Year Plan", "After the eight Five-Year Plan", "After the sixth Five-Year Plan", "After the seventh Five-Year Plan"], a: 3, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "The Bidar Fort is located in which Indian state?", o: ["Andhra Pradesh", "Rajasthan", "Karnataka", "Maharashtra"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "In general, what will happen with rainfall as we move from the equator to the poles?", o: ["Rainfall is doubled", "Rainfall goes on decreasing steadily", "Rainfall remains constant", "Rainfall goes on increasing steadily"], a: 1, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "In which state is New Mangalore port located?", o: ["Kerala", "Karnataka", "Tamil Nadu", "Goa"], a: 1, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "The 23rd Commonwealth Games will be hosted by _________ .", o: ["England", "Australia", "Canada", "India"], a: 1, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Who is the author of the popular novel Pinjar?", o: ["Amrita Pritam", "Yashpal", "Bhisham Sahni", "Dharamvir Bharati"], a: 0, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "When a carbon compound is burnt resulting in a clean flame, it indicates that it is:", o: ["saturated hydrocarbon compounds", "unsaturated hydrocarbon compounds", "sulphur containing compounds", "nitrogen containing compounds"], a: 0, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "The Republic Day Parade in India is presided over by the ____.", o: ["Chief of Defence", "Vice President of India", "President of India", "Prime Minister of India"], a: 2, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "During the period 600 BCE - 600 CE, who among the following was the first ruler who inscribed his messages to his subjects and officials on stone surfaces — natural rocks as well as polished pillars?", o: ["Ajatasattu", "Ashoka", "Bimbisara", "Mahapadma Nanda"], a: 1, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Which of the following Amendment Acts laid down fundamental duties for Indian citizens?", o: ["The 44th Amendment Act", "The 43rd Amendment Act", "The 41st Amendment Act", "The 42nd Amendment Act"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Chanakya had received his education at _________ .", o: ["Vikramashila", "Nalanda", "Ujjain", "Taxila"], a: 3, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Champaran Satyagraha was led by whom among the following freedom fighters of British India?", o: ["Lal Bahadur Shastri", "Rajendra Prasad", "Mahatma Gandhi", "Subhash Chandra Bose"], a: 2, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which of the following dances was influenced by the Ras Leela of North India?", o: ["Bharatnatyam", "Kuchipudi", "Odissi", "Kathak"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Purnamasi Jani is a tribal singer and social activist who has sung thousands of songs promoting social causes in ______________________.", o: ["Kumauni", "Odia", "Marwari", "Bodo"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Which form of art was showcased in the show “Vande Bharatam” organised by the Ministry of Culture on the occasion of Republic Day, 2023?", o: ["Painting", "Dance", "Music", "Literature"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "In karate, how many points are awarded for an ‘Ippon’?", o: ["1", "4", "2", "3"], a: 3, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "For the propagation of which faith was the Sattriya dance form introduced in Assam by Sankaradeva?", o: ["Buddhism", "Vaishnavism", "Jainism", "Shaivism"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Under Article 21 A of the Constitution of India, what is the age for children to be provided with free and compulsory education?", o: ["Eight to fourteen years", "Eight to twelve years", "Six to fourteen years", "Ten to fourteen years"], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Identify the correct combination of musical instrument and the artist associated with that instrument.", o: ["Ali Akbar Khan – Tabla", "Zakir Hussain – Sarod", "Bismillah Khan – Flute", "Shiv Kumar Sharma – Santoor"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Read the given statements and select the most appropriate option. i) A white blood cell (WBC) in human blood can change its shape. ii) The shape of amoeba appears irregular.", o: ["Only statement two is correct.", "Both statements are correct.", "Both statements are incorrect.", "Only statement one is correct."], a: 1, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Which of the following rivers forms the 'Dhuadhar Falls' in Madhya Pradesh?", o: ["Narmada", "Tapi", "Godavari", "Mahanadi"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which of the following associations was established by Dr BR Ambedkar in 1930?", o: ["All India Harijan Sewak Sangh", "Satyashodhak Samaj", "Depressed Classes Association", "Depressed Classes’ Education Society"], a: 2, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Which of the following is a state where more people are engaged in work than are really needed?", o: ["Frictional Unemployment", "Open Unemployment", "Seasonal Unemployment", "Disguised Unemployment"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Select the correct option based on the image given below.", o: ["i-b, ii-a, iii-d, iv-c", "i-b, ii-d, iii-a, iv-c", "i-a, ii-b, iii-c, iv-d", "i-b, ii-a, iii-c, iv-d"], a: 1, e: "", qimg: "28nov2023-s3-q-40.png" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Which of the following constitutes a food chain starting from producer to top carnivores?", o: ["Insects → Frogs → Snakes → Vultures", "Small Plants → Insects → Fish → Birds → Tigers", "Soil → Grass → Deer → Tiger", "Grass → Insects → Snakes → Birds → Tigers"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Which of the following temples is located at the centre point of the world’s magnetic equator?", o: ["Kailasanathar Temple", "Meenakshi Temple", "Chidambaram Temple", "Srirangam Temple"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "What is the approximate circumference of a cricket ball?", o: ["Around 9 inches", "Around 6 inches", "Around 5 inches", "Around 12 inches"], a: 0, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Which of the following industrial plants is supplied water from Bhadravati River?", o: ["Bokaro Steel Plant", "Durgapur Steel Plant", "Rourkela Steel Plant", "Visvesvaraya Iron and Steel Plant"], a: 3, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "R.L.V Ramakrishnan won the Akademi Award for Mohiniyattam in 2021. It is the classical dance form of which of the following States?", o: ["Andhra Pradesh", "Odisha", "Kerala", "Assam"], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which of the following is the first grand slam of the year?", o: ["French Open", "Australian Open", "Wimbledon", "US Open"], a: 1, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "In which year was India's first post-Independence census conducted?", o: ["1954", "1960", "1958", "1951"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "The __________ is empowered to direct that an act of parliament does NOT apply to a scheduled area in the state.", o: ["Supreme Court", "Governor", "Chief Minister", "High Court"], a: 1, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Under the Liberalisation Measure, the Monopolies and Restrictive Trade Practices (MRTP) Act 1969 was repealed by which of the following Acts?", o: ["Industries Development and Regulation Act 1951", "Competition Act 2002", "Foreign Exchange Regulation Act 1973", "Foreign Exchange Management Act 1999"], a: 1, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "According to a new definition of MSMEs 2020, medium enterprise turnover should NOT exceed how much amount?", o: ["₹250 crore", "₹150 crore", "₹200 crore", "₹100 crore"], a: 0, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given pattern when the mirror is placed at 'AB' as shown.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "28nov2023-s3-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, even if it appears to be at variance with commonly known facts, decide which of the given conclusions logically follow(s) from the statements. Statements: All mangoes are grapes. All grapes are guavas. Conclusions: I. Some guavas are mangoes. II. All mangoes are guavas.", o: ["Neither conclusion I nor II follows", "Only conclusion I follows", "Both conclusions I and II follow", "Only conclusion II follows"], a: 2, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["27", "24", "30", "33"], a: 1, e: "", qimg: "28nov2023-s3-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 17 * 17 * 50 * 28 * 7 * 243", o: ["– , + , ×, ÷ , =", "×, – , + , ÷ , =", "÷ , + , – , ×, =", "×, + , – , ÷ , ="], a: 1, e: "", qimg: "" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at 'AB' as shown.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s3-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. LOVE : BSLI :: WORK : HOLT :: SORT : ?", o: ["QOLP", "QOLR", "ROLQ", "QOMP"], a: 0, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding /deleting /multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed.) (63, 9, 27) (105, 15, 45)", o: ["(147, 21, 65)", "(149, 21, 63)", "(147, 21, 63)", "(149, 21, 65)"], a: 2, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given expression. 53 * 19 * 8 * 32 * 4 * 197", o: ["÷, +, ×, –, =", "+, ×, –, ÷, =", "+, –, ×, ÷, =", "×, +, –, ÷, ="], a: 1, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s3-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["Q", "R", "A", "C"], a: 1, e: "", qimg: "28nov2023-s3-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Six letters, A, B, C, D, E and F, are written on the different faces of a dice. Two positions of this dice are shown in the given figure. Find the letter on the face opposite to D.", o: ["E", "B", "F", "A"], a: 3, e: "", qimg: "28nov2023-s3-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s3-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "28nov2023-s3-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Choose the dice from the given options that is similar to the dice formed from the given sheet of paper (X).", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "28nov2023-s3-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'MN' as shown below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "28nov2023-s3-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "28nov2023-s3-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? GSJV, IQLT, KONR, ?, OKRN", o: ["NMOP", "MNPO", "MMPP", "LMPO"], a: 2, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘TIDE’ is written as ‘EDJS’ and ‘MARS’ is written as ‘BLSR’. How will ‘HOPE’ be written in that language?", o: ["EPFG", "FIQP", "PEHO", "FGPO"], a: 3, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "28nov2023-s3-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the figure that will come next in the following figure series.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "28nov2023-s3-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Seven children - T, U, V, W, X, Y and Z - are sitting in a straight row, facing north. U sits second to left of Z. Y sits third to the left of T. Only one child sits to the right of X. Only two children sit to the left of W. Who among the following children sits at the extreme left end of the row?", o: ["T", "Y", "U", "V"], a: 1, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "28nov2023-s3-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Which of the following options will replace the question mark (?) in the given series? 150, 230, 322, 402, ?, 574", o: ["488", "494", "477", "459"], a: 1, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 24 : 566 :: 12 : ? :: 8 : 54", o: ["134", "124", "120", "154"], a: 0, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "28nov2023-s3-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the average of all the even numbers from 22 to 30 (inclusive both).", o: ["26.0", "25.5", "24.5", "25.0"], a: 0, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "200 men have provisions for 30 days. If 50 of these men leave, for how many days will the same provisions last for the remaining men?", o: ["28 days", "32 days", "40 days", "24 days"], a: 2, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of the number of boys to that of the girls in a school is 7 : 9. If there are 1183 boys in the school, what is the total number of boys and girls in that school?", o: ["2736", "2688", "2704", "2720"], a: 2, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["3120", "3.12", "31.2", "312"], a: 0, e: "", qimg: "28nov2023-s3-q-79.png" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "28nov2023-s3-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "A woman gains 20% by selling an article for a certain price. If she sells it at double the price, then the profit made is:", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s3-q-81.png" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "The monthly income of Lucas is ₹42,500. If his income is increased by 18%, then find his new monthly income (in ₹).", o: ["47,500", "43,000", "48,120", "50,150"], a: 3, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "If the volume and surface area of a sphere are numerically the same, then its radius is:", o: ["3 units", "4 units", "1 unit", "2 units"], a: 0, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "If 125 identical small solid spheres are made out of a big solid sphere of radius 5 cm, what is the surface area (in cm2) of each small sphere?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "28nov2023-s3-q-84.png" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "A man completes his journey in 6 h. He covers half the distance at the speed of 30 km/h and the rest at 50 km/h. The length of the journey (in km) is:", o: ["125", "225", "252", "112.5"], a: 1, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "For a sum of Rs.7,500, the rate of interest is 7.5% per annum simple interest. Find the interest earned in 4 years 9 months.", o: ["Rs.2,617.875", "Rs.2,871", "Rs.2,671.875", "Rs.2761.875"], a: 2, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "An almirah is sold at ₹6,500 after allowing a discount of 20%. Find its marked price (in ₹).", o: ["8,125", "8,235", "8,000", "7,546"], a: 0, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "The compound interest on ₹50,000 at 8% per annum is ₹8,320. Find the period.", o: ["2 years", "5 years", "3 years", "4 years"], a: 0, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "In an election between two candidates, 10% of voters didn’t participate in voting, 20% votes were declared invalid and the winner got 70% of the total valid votes and won by 6480 votes. Find the total number of votes in the voting list.", o: ["22,500", "28,400", "26,700", "25,600"], a: 0, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s3-q-90.png" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcut keys is used to cut the selected text in MS- Word 365?", o: ["Ctrl + c", "Ctrl + x", "Ctrl + p", "Ctrl + v"], a: 1, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "What does the Uniform Resource Locator (URL) specify?", o: ["HTML", "Unique address assigned to each web resource", "ISP", "Internet protocol"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In MS Word 365 Which of the following best describes the use of justify text?", o: ["To align evenly along left margins", "To align evenly along right margins", "To center the text", "To align evenly along left and right margins"], a: 3, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which of the following is the correct option to open an existing spread sheet in MS-Excel?", o: ["Click on File tab<<Click on Open", "Click on File tab<<Click on New", "Click on Home tab<<Click on New", "Click on Home tab<<Click on Open"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which Microsoft Excel view allows you to see how the printed worksheet will look before actually printing it?", o: ["Full Screen view", "Page Layout view", "Print Preview", "Normal view"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following options allows you to choose whether to keep or discard the formatting of pasted text in MS Word 365?", o: ["Font Selection", "Cut and Paste", "Paste Special", "Format Painter"], a: 2, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "In MS-Word 365, which action allows you to duplicate selected text and place a copy of it on the clipboard?", o: ["Select All", "Cut", "Paste", "Copy"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following windows is used when we want to write an email in Gmail?", o: ["Compose", "Send", "Spam", "Draft"], a: 0, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following is the default font when a new blank document is created in MS Word 365?", o: ["Calibri", "Times New Roman", "Arial", "Cambria"], a: 0, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365 which of the following is an example of absolute reference pointing to cell A1 in MS Excel?", o: ["$A$1", "A1", "@A1", "1A"], a: 0, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 28 Nov 2023 Shift-3";
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
