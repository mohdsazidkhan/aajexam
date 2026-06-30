/**
 * Seed: Delhi Police Constable - 23 Nov 2023 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc23nov2023_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-23nov2023-s2';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 23 Nov 2023 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "In which of the following cities of British India was the Communist Party of India founded, in 1925?", o: ["Calcutta", "Lucknow", "Kanpur", "Delhi"], a: 2, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Who among the following won the ‘67th Filmfare Award 2022 for Best Choreography’ for the film Atrangi Re?", o: ["Remo D’ Souza", "Vijay Ganguly", "Farah Khan", "Prabhu Deva"], a: 1, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "During the census 2011, which of the following states recorded the lowest growth rate?", o: ["Nagaland", "Sikkim", "Uttar Pradesh", "Madhya Pradesh"], a: 0, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Which of the following statements is correct with regard to the effect of globalisation on India and other developing countries?", o: ["Flow of information became highly restricted.", "It led to increased inequality between countries.", "Flow of international capital got restricted.", "It reduced interdependence between countries."], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "According to the Planning Commission of India (2011-12), which state has the highest percentage of the population below the poverty line?", o: ["Chhattisgarh", "Assam", "Madhya Pradesh", "Bihar"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Guru Amubi Singh won the Sangeet Natak Akademi Award for which form of dance?", o: ["Manipuri", "Bihu", "Odissi", "Kathakali"], a: 0, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "The Teliaya Dam is located in which state of India?", o: ["Andhra Pradesh", "Jharkhand", "Karnataka", "Rajasthan"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Who inaugurated the 44th Chess Olympiad, which was organised in 2022?", o: ["MK Stalin", "Anurag Thakur", "Viswanathan Anand", "Narendra Modi"], a: 3, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Who among the following dancers and choreographers is credited to bring fusion art into a dance where European style is mixed with Indian Classical Dance?", o: ["Uday Shankar", "Kelucharan Mohapatra", "Rukmini Devi Arundale", "Birju Maharaj"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which scheme was rolled out to effectively integrate India’s manufacturing capabilities with the demands of global supply chains and to promote domestic value addition and exports?", o: ["Startup India", "Merchandise Exports from India Scheme", "Make in India initiative", "Production Linked Incentive Scheme"], a: 3, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "What is the name of the autobiography written by the 14th Dalai Lama?", o: ["My Country My Life", "Living with the Himalayan Masters", "Freedom in Exile", "Long Walk to Freedom"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "From which country did India import wheat seeds during the Green Revolution?", o: ["USA", "Russia", "Britain", "Mexico"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Ayushman Bharat Programme is an umbrella of ________ scheme launched in 2018.", o: ["employment", "education", "health", "livelihood"], a: 2, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a type of budget of the Government?", o: ["Surplus budget", "Deficit budget", "Circle budget", "Balanced budget"], a: 2, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Stainless steel cookware contains _______________.", o: ["chromium", "magnesium", "calcium", "manganese"], a: 0, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Indian Constitution deals with the District Planning Committee?", o: ["243-XD", "243-ZD", "243-YD", "243- WD"], a: 1, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "‘Vrittayata’ is a major sub-division of ________ style of temple architecture.", o: ["Hoysala", "Nagara", "Dravidian", "Vijayanagara"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Which of the following statements about plastids is INCORRECT?", o: ["Leucoplasts are primarily organelles in which materials such as starch, oils and protein granules are stored.", "Leucoplasts are white or colourless plastids.", "Plastids do not have their own DNA and ribosomes.", "Chromoplasts are responsible for photosynthesis in plants."], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Which of the following dances means ‘dance of the enchantress’?", o: ["Kathak", "Sattriya", "Kuchipudi", "Mohiniyattam"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "‘Faster, More Inclusive and Sustainable Growth’ was the centre point of which Five- Year Plan?", o: ["Tenth", "Twelfth", "Ninth", "Seventh"], a: 1, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "The Constitution (42nd Amendment) Act, 1976, Chapter IV-A introduced a code of ten _____________ for citizens.", o: ["Fundamental Rights", "Fundamental Duties", "Fundamental Principles", "Directive Principles"], a: 1, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a national festival?", o: ["Diwali", "Gandhi Jayanti", "Republic Day", "Independence Day"], a: 0, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "What does LPG cooking gas contain?", o: ["Methane and ethylene", "Propane and ethane", "Propane and butane", "Methane and propane"], a: 2, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Under which Constitutional Amendment Act were the Fundamental Duties first added to the Indian Constitution?", o: ["40th Constitutional Amendment Act", "43rd Constitutional Amendment Act", "41st Constitutional Amendment Act", "42nd Constitutional Amendment Act"], a: 3, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "________ delegates from all over the country congregated for the first session of the Indian National Congress at Bombay in December 1885.", o: ["105", "72", "51", "179"], a: 1, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Purushottam Dadheech is a famous and recognised Indian __________ dancer.", o: ["Kathak", "Kuchipudi", "Sattriya", "Kathakali"], a: 0, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which directive principle provides for a uniform civil code for citizens?", o: ["Article 44", "Article 41", "Article 42", "Article 43"], a: 0, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "According to the Köppen classification, which group of climate is generally found at higher latitudes or higher altitudes?", o: ["D group", "E group", "C group", "A group"], a: 1, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "The final event in decathlon is always:", o: ["110 m hurdle", "1500 m race", "javelin throw", "800 m race"], a: 1, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Which State has the maximum number of members in Rajya Sabha?", o: ["Haryana", "Bihar", "Uttar Pradesh", "Punjab"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Which of the following Acts was passed by Governor General Lord William Bentinck in 1829?", o: ["Indian Telegraph Act", "Bengal Sati Regulation Act", "Indian Slavery Act", "Criminal Tribes Act"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Identify the Headquarters of the East Coast Railway Zone of India?", o: ["Bhubaneswar", "Kolkata", "New Delhi", "Mumbai"], a: 0, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "In which of the following Articles of the Constitution of India, is it mentioned that “it shall be the duty of every citizen of India to value and preserve the rich heritage of our composite culture”?", o: ["51A (f)", "51A (b)", "51A (h)", "51A (m)"], a: 0, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "When is National Unity Day observed?", o: ["31 November", "8 November", "31 October", "11 March"], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Who among the following is credited for laying the foundation of microfinance institutions?", o: ["Amartya Sen", "Jagdish Bhagwati", "PV Narasimha Rao", "Muhammad Yunus"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Who among the following defeated Mughal emperor Humayun in the Battle of Kannauj in 1540?", o: ["Bahadur Shah", "Islam Shah", "Tatar Khan", "Sher Shah Suri"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "In which state is the Kanha National Park located?", o: ["Bihar", "Himachal Pradesh", "Madhya Pradesh", "Karnataka"], a: 2, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Identify the first Gurjara Partihara ruler who successfully defeated the Arab invaders.", o: ["Nagabhata I", "Vatsaraja", "Mahendrapala I", "Mahipala"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Ustad Amjad Ali Khan is the maestro in playing the ________.", o: ["sitar", "sarod", "bansuri", "tabla"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which neighbouring country of India was the eighth most populous country in the world, as per the US Census Bureau, by July 2022?", o: ["Nepal", "Bangladesh", "Bhutan", "Myanmar"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Who became India’s first weightlifter to win a gold medal at the IWF Junior World Championships, in 2022?", o: ["Harshada Sharad Garud", "T Madhavan", "Anjali Patel", "Muna Nayak"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Which of the following is the first published novel of the famous author Salman Rushdie?", o: ["Grimus", "The Moor’s Last Sigh", "The Satanic Verses", "Shame"], a: 0, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Minister of state can attend the cabinet meeting ________.", o: ["on his own will", "only when the speaker invites him", "only when invited", "because its compulsory for him"], a: 2, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "In which of the following places were the remains of Mahaparinirvana Buddha found? It is at this location that a 6.1 m long reclining Buddha has been constructed.", o: ["Vaishali", "Bodhgaya", "Kushinagar", "Vethipada"], a: 2, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "The term 'checkmate' is used in ________.", o: ["Badminton", "Golf", "Chess", "Tennis"], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which king of the Mauryan dynasty succeeded Chandragupta Maurya?", o: ["Brihadratha", "Samprati", "Ashoka", "Bindusara"], a: 3, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "The famous Chinese Buddhist pilgrim, Fa Hein visited India during the reign of which of the following Gupta rulers?", o: ["Sri Gupta", "Samudragupta", "Kumargupta", "Chandragupta II"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Who coined the name ‘Pakistan’?", o: ["Aga Khan", "Chaudhry Rehmat Ali", "Md Iqbal", "Md Ali Jinnah"], a: 1, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "As per Köppen climate classification, the climate of which place is classified as 'Cwg' (meso thermal with dry winters)?", o: ["North-western Gujarat", "Extreme western Rajasthan", "South of Goa", "Gangetic plains"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "In order to preserve pickles, a mixture of 5% to 8% of acetic acid in water is used. This preservative is also commonly known as:", o: ["oil", "salt", "vinegar", "lemon juice"], a: 2, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Six letters, G, H, I, J, K and L are written on different faces of a dice. Three positions of this dice are shown here. Find the letter on the face opposite L.", o: ["J", "I", "H", "G"], a: 1, e: "", qimg: "23nov2023-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "23nov2023-s2-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding /deleting /multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is NOT allowed) (50, 63), (101, 120)", o: ["(226, 253)", "(145, 168)", "(402, 440)", "(169, 196)"], a: 1, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "23nov2023-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "23nov2023-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "In a certain code language, if NOVEL is coded as 67 and HISTORY is coded as 75, then how will SCIENCE be coded?", o: ["120", "131", "130", "126"], a: 1, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given expression. 73 * 12 * 5 * 2 * 39 * 64", o: ["÷, +, ×, –, =", "×, +, –, ÷, =", "+, ×, ÷, –, =", "+, –, ×, ÷, ="], a: 2, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 9 : 729 :: 11 : ? :: 4 : 64", o: ["99", "1331", "121", "1342"], a: 1, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Six numbers, 21, 22, 23, 24, 25 and 26 are written on different faces of a dice. Three positions of this dice are shown here. Find the number on the face opposite 25.", o: ["24", "21", "26", "22"], a: 2, e: "", qimg: "23nov2023-s2-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series. S _ _ A D _ Q W _ D _ Q W A _ S Q _ _ D", o: ["QWSASAWD", "QWSASDWA", "QWSAADWA", "QWSASDQA"], a: 1, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "23nov2023-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "23nov2023-s2-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "23nov2023-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["15", "19", "22", "17"], a: 1, e: "", qimg: "23nov2023-s2-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 225 * 15 * 10 * 50 * 25 * 125", o: ["+ , ×, – , ÷ , =", "÷ , ×, + , – , =", "÷ , + , – , ×, =", "÷ , ×, – , + , ="], a: 3, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the option figure that is embedded in the given figure. (Rotation is not allowed)", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "23nov2023-s2-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "23nov2023-s2-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Two statements are given, followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: All chips are snacks. Some fried foods are chips. Conclusions: I. All fried foods are snacks. II. Some snacks are fried foods. III. No fried food is snack.", o: ["Only conclusion II follows", "Only conclusion III follows", "Only conclusions II and III follow", "Either conclusion I or III follows"], a: 0, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. GAIN : PKCI :: KEYS : UAGM :: ACHE : ________", o: ["EJCE", "ECHA", "BDIF", "GJEC"], a: 3, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "23nov2023-s2-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 10, 15, 30, 75, 210, ?", o: ["600", "567", "435", "615"], a: 3, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Six numbers 1, 2, 3, 4, 5 and 6 are written on different faces of a dice. Two positions of this dice are shown in the figure. Find the number on the face opposite to 2.", o: ["5", "3", "4", "6"], a: 3, e: "", qimg: "23nov2023-s2-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "23nov2023-s2-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Five people A, B, C, D and E are sitting in a straight row, facing north. Only two people are seated to the left of C. D is sitting at the extreme right end. B is not an immediate neighbour of D, and is second to the left of A. Where is B sitting?", o: ["To the immediate right of E", "To the immediate right of C", "Fourth to the left of D", "Third to the left of A"], a: 0, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "23nov2023-s2-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the area (in cm2) of a parallelogram whose base length and height are 4 cm and 5 cm, respectively?", o: ["18", "15", "20", "10"], a: 2, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "Sushil’s income is 22% less than Abhishek’s income. Abhishek’s income is what % more than Sushil’s income?", o: ["27.8%", "28.20%", "30.8%", "25.8%"], a: 1, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the difference between the compound interests on ₹2,000 for 1 year at 8% p.a. compounded annually and half-yearly.", o: ["₹2.20", "₹3.00", "₹3.20", "₹2.00"], a: 2, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "The sum of two numbers is 1904 and their HCF 56. The number of such number pairs is:", o: ["3", "9", "8", "4"], a: 2, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "If the radius of a sphere is increased by 3 cm, then its surface area increases by 156 π cm2. The radius of the sphere before the increase was:", o: ["7 cm", "8 cm", "6 cm", "5 cm"], a: 3, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "A bag contains 4800 g of rice. 20% of rice is added in the bag after which 10% quantity is taken out. Then 15% quantity is added back in the bag. Lastly, 25% of rice is taken out of the bag. What is the weight of the bag now, in grams?", o: ["4471.2", "4173.12", "4473.2", "7452"], a: 0, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "Two erasers cost ₹2 each and are free with one packet of pencils costing ₹15. The discount will be:", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "23nov2023-s2-q-82.png" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["2 hours", "3 hours", "4 hours", "5 hours"], a: 2, e: "", qimg: "23nov2023-s2-q-83.png" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Mr. Sharma deposits his retirement benefit of ₹5 lakhs, partly in a post office and partly in a bank, at 12% and 10% p.a. rate of interest, respectively. If his monthly interest income was ₹4,500, then the difference between the deposit in the post office and in the bank is:", o: ["₹1,50,000", "₹1,60,000", "₹1,40,000", "₹1,00,000"], a: 3, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "23nov2023-s2-q-85.png" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "Which of the following numbers is prime?", o: ["144765", "144723", "144757", "144393"], a: 2, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "A goods train travelling at a constant speed crosses two persons walking in the same direction (as that of the train) in 10.6 seconds and 11 seconds, respectively. The first person was walking at 5.4 km/h, while the second was walking at 6.3 km/h. What was the length of the train (in m)?", o: ["72.975", "72.875", "72.675", "72.725"], a: 1, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["43 : 31", "31 : 32", "31 : 41", "43 : 41"], a: 3, e: "", qimg: "23nov2023-s2-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "If A can do a piece of work in 16 days and B can do the same work in 24 days, the least whole number of days to complete the work, if they start working on alternate days, is:", o: ["18", "19", "21", "20"], a: 1, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "23nov2023-s2-q-90.png" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which option in Microsoft Excel allows you to create a custom bullet style for a bulleted list?", o: ["Format Cells", "Define New Bullet", "Styles", "Text Box"], a: 1, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts can be used to paste cut text after moving it?", o: ["Ctrl + X", "Ctrl + P", "Ctrl + V", "Ctrl + C"], a: 2, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "What does URL stand for?", o: ["Uniform Resource Locator", "Uniform Resource Location", "United Resources Locator", "Uniform Receivers Locator"], a: 0, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which tab in Microsoft Word 365 contains the ‘Open’ option to open an existing document?", o: ["File", "View", "Home", "Insert"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "‘Contact Us’ is present in which of the following sections in MS Word 365?", o: ["Help", "Review", "Mailings", "References"], a: 0, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following is used to select an entire line or paragraph from the cursor place in MS-Word 365?", o: ["Triple mouse click", "Both single and double mouse click", "Single mouse click", "Double mouse click"], a: 0, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following signs appears when you drag the fill handle while creating text, number and data series in MS Excel 365?", o: ["$", "=", "*", "+"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following is an area where the outgoing messages or messages that are in the process of sending or which failed to send are stored?", o: ["Outbox", "Inbox", "Trash", "Sentmail"], a: 0, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following is true about sort A to Z in MS-Excel 365?", o: ["Sorts the selected column in an descending order", "Sorts the selected column in an ascending order", "Sorts data in multiple column by applying different sort criteria", "Sorts the selected row in an descending order"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "What is the purpose of the ‘Track Changes’ feature in Microsoft Word 365?", o: ["To highlight spelling and grammar errors in a document.", "To keep a record of edits made to a document by different authors.", "To create a backup copy of the document.", "To automatically save changes made to a document."], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 23 Nov 2023 Shift-2";
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
