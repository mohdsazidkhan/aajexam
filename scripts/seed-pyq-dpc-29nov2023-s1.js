/**
 * Seed: Delhi Police Constable - 29 Nov 2023 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc29nov2023_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-29nov2023-s1';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 29 Nov 2023 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Who was the President of India between the years 1987 and 1992?", o: ["Giani Zail Singh", "R Venkataraman", "Fakhruddin Ali Ahmed", "Shankar Dayal Sharma"], a: 1, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Buddhist texts called Dipavamsa and Mahavamsa, which are the sources of information to Mauryan times, belong to which of the following countries?", o: ["India", "China", "Myanmar", "Sri Lanka"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "The Nalanda University was built in ________.", o: ["Magadha", "Kuru", "Matsya", "Vatsa"], a: 0, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "In which year did India win its first Olympic gold in hockey?", o: ["1922", "1956", "1928", "1960"], a: 2, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Read the given statements and select the correct option regarding ‘High Powered Money’. (i) High Powered Money consists of currency and cash reserves with the bank. (ii) High Powered Money includes demand deposits of the banks.", o: ["Both (i) and (ii) are true", "Only (i) is true", "Both (i) and (ii) are false", "Only (ii) is true"], a: 1, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Who set up the task force on Supportive Policy and Regulatory Framework for Micro- Finance in India in 1999?", o: ["RRB", "Finance minister", "NABARD", "SBI"], a: 2, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Which component of the cytoskeleton are rigid hollow rods, about 25 nm in diameter, that play an important role in the cell cycle by forming the mitotic spindle?", o: ["Microfibers", "Intermediate filaments", "Actin filaments", "Microtubules"], a: 3, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "From which of the following cities did the Revolt of 1857 begin on 10 May 1857 in British India?", o: ["Meerut", "Kanpur", "Delhi", "Jhansi"], a: 0, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Annatto seeds and extract is used as adulterant in:", o: ["dairy products", "turmeric powder", "rice powder", "wheat flour"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Whose song ‘Shaabaash’ became the anthem of Indian athletes at the Commonwealth Games 2022?", o: ["Jim Ankan Deka", "Jayanta Nath", "Nilotpal Bora", "Zubeen Garg"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Under which Act was the legislative powers of making and amending laws restored to the provinces?", o: ["Indian Council Act, 1892", "Indian Council Act, 1861", "Indian Council Act, 1909", "Regulating Act, 1773"], a: 1, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "How many medals did India win in the Commonwealth Games-2022?", o: ["61", "59", "58", "57"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Guru Bipin Singh was conferred the Kalidas Samman Award for which form of dance?", o: ["Manipuri", "Kuchipudi", "Odissi", "Kathakali"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Who among the following musicians was shortlisted for the Bharat Ratna in 2019?", o: ["Bhupen Hazarika", "Pandit Ravi Shankar", "Lata Mangeshkar", "Pandit Bhimsen Joshi"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Guru Vempati Chinna Satyam is associated with which of these dance forms?", o: ["Kuchipudi", "Bharatanatyam", "Manipuri", "Odissi"], a: 0, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "______ refers to the measure related to the sale of assets for the achievement of some purpose.", o: ["Total denationalisation", "Joint venture", "Management buyout", "Liquidation"], a: 3, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Who among the following said that Raziyya was more able and /qualified than all her brothers for the Sultan of Delhi Sultanate?", o: ["Qutb ud-Din Aibak", "Abdul Malik Isami", "Minhaj-i Siraj", "Ahmad Yadgar"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Select the correct option based on the image given below.", o: ["i-c, ii-a, iii-b, iv-d", "i-c, ii-d, iii-a, iv-b", "i-d, ii-c, iii-b, iv-a", "i-c, ii-d, iii-b, iv-a"], a: 2, e: "", qimg: "29nov2023-s1-q-18.png" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "The term ‘chui’ in judo means ________.", o: ["warning", "throwing technique", "holding technique", "light penalty"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Which of the following dams was NOT funded during the First Five-Year Plan for development of irrigation facility?", o: ["Bhakra Nangal dam", "Hirakund dam", "Mettur dam", "Gosi Khurd dam"], a: 3, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Which of the following deities was known as breaker of forts in the Rig Veda?", o: ["Indra", "Agni", "Varuna", "Marut"], a: 0, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Indian Constitution, related to fundamental rights, CANNOT be suspended during an emergency?", o: ["Articles 29-30", "Articles 17-18", "Articles 20-21", "Articles 31-32"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "In the year 1855, the first jute mill was set up at Rishra, which is located in:", o: ["Odisha", "West Bengal", "Andhra Pradesh", "Bihar"], a: 1, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Dr. Karni Singh Shooting Range is located at:", o: ["New Delhi", "Jaipur", "Bangalore", "Mumbai"], a: 0, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Which festival is also known as the foundation day of Khalsa Panth?", o: ["Baisakhi", "Basant Panchami", "Gurupurab", "Lohri"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Which of the following censuses recorded the highest gap in male and female literacy rates in India?", o: ["2001", "1971", "1991", "1981"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Who has written the famous novel ‘Apsara’?", o: ["Suryakant Tripathi Nirala", "Mahadevi Verma", "Sumitranandan Pant", "Jaishankar Prasad"], a: 0, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "The chemical name of Plaster of Paris is _______________.", o: ["calcium sulphate hemihydrate", "calcium sulphate semihydrate", "calcium hydrogen semihydrate", "calcium hydrogen hemihydrate"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "‘Roads to Mussoorie’, the famous novel is written by whom among the following Sahitya Akademi Awardee?", o: ["Shobha Dey", "Ruskin Bond", "Mulk Raj Anand", "R K Narayan"], a: 1, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Which Article of the Indian Constitution mentions that it shall be the duty of every citizen of India to develop scientific temper?", o: ["51 A (j)", "51 A (k)", "51 A (h)", "51 A (i)"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "The Indira Sagar Multipurpose Project is located in which state?", o: ["Madhya Pradesh", "Rajasthan", "Himachal Pradesh", "Tamil Nadu"], a: 0, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Which of the following is the international partner in the implementation of ‘PM Grameen Digital Saksharta Abhiyan’?", o: ["UNDP", "World Bank", "UNESCO", "UNICEF"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Which part of the Constitution of India states that the citizen has to defend the country and render national service when called upon to do so?", o: ["Part III A", "Part IV A", "Part II A", "Part V A"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Who among the following founded the Ramakrishna Mission in 1897?", o: ["Sri Aurobindo", "Swami Vivekananda", "Sri Ramakrishna Paramhansa", "Raja Ram Mohan Roy"], a: 1, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "___________ wrote a three-volume history of Akbar’s reign, titled ‘Akbar Nama’.", o: ["Humayun", "Abul Fazl", "Bahadur Shah II", "Faizi"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Which Mughal emperor is known for designing a series of inlays behind his throne in the court at Delhi that depicted the legendary Greek god Orpheus playing the lute?", o: ["Babur", "Humayun", "Shah Jahan", "Akbar"], a: 2, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "The Dachigam National Park is best known as the home of the ________.", o: ["hangul", "rhinoceros", "lion", "crocodile"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Under which of the following Articles can a person directly approach the Supreme Court for the enforcement of his Fundamental Rights?", o: ["Article 34", "Article 31", "Article 32", "Article 33"], a: 2, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Abdel Fattah al-Sisi, the Chief Guest of the Republic Day 2023 celebration in Delhi, is associated with which country?", o: ["Syria", "Bahrain", "Egypt", "Israel"], a: 2, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Mount Fuji, the highest mountain in Japan, which is made of felsic to intermediate rock, represents which type of volcanoes?", o: ["Composite", "Shield", "Fissure", "Cinder cone"], a: 0, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Identify the Navratna of Akbar’s court who played a pivotal role in the development of the classical genre of Hindustani music.", o: ["Tansen", "Swami Haridas", "Mirabai", "Amir Khusro"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "In 1991, India met with an economic crisis due to ________.", o: ["political instability", "the rise in foreign exchange reserves", "low inflation", "huge debts burden"], a: 3, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Which of the following layers is important for living things?", o: ["Troposphere", "Mesosphere", "Exosphere", "Stratosphere"], a: 0, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "During the Fourth Five-Year Plan, the process of nationalisation of banks took place. How many banks were nationalised during this period?", o: ["6", "14", "10", "20"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "According to the census of India 2011, select the Union Territory that had less than 1 lakh population?", o: ["Daman and Diu", "Lakshadweep", "Dadra and Nagar Haveli", "Puducherry"], a: 1, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "According to the census of India 2011, what is the female literacy rate in Dadra and Nagar Haveli?", o: ["61.12%", "76.48%", "68.43%", "64.32%"], a: 3, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "What is the tenure of the President of India?", o: ["2 years", "6 years", "5 years", "10 years"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "In which of the following years was the Vernacular Press Act passed?", o: ["1878", "1859", "1902", "1919"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Which of the following powers is NOT enjoyed by the Governor of a State?", o: ["Judiciary powers", "Executive powers", "Diplomatic/Military powers", "Legislative powers"], a: 2, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "For which of the following dance forms was Gaddam Padmaja Reddy awarded the Padma Shri in 2022?", o: ["Kuchipudi", "Kathak", "Bharatanatyam", "Sattriya"], a: 0, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s1-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "29nov2023-s1-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth number in the same way as the second number is related to the first number and fourth number is related to the third number. 64 : 23 :: 121 : 26 :: 256 : ?", o: ["27", "31", "29", "33"], a: 1, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? RNVG, PPRK, ?, LTJS, JVFW", o: ["MSNP", "NSNP", "MRMO", "NRNO"], a: 3, e: "", qimg: "" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["− and ×", "− and +", "÷ and −", "+ and ×"], a: 3, e: "", qimg: "29nov2023-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "A cube (dice) has six different symbols drawn over its six faces. Three different positions of this cube are shown in the given figure. Which symbol is on the face opposite to ‘*’ (star)?", o: ["%", "?", "@", "#"], a: 3, e: "", qimg: "29nov2023-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s1-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 300000, 90000, 27000, 8100, 2430, ?", o: ["645", "729", "3255", "323"], a: 1, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "29nov2023-s1-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the figure from the options that can replace the question mark (?) and complete the given pattern.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "29nov2023-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "छह विद्यार्थी एक गोल मेज के परित: केंद्र की ओर अभिमुख होकर बैठे हैं। योजना और योगिता दोनों की निकटतम पड़ोसी यामिनी है। यशमिता, योजना के बाएं से दूसरे स्थान पर बैठी है। युक्ति, यामिनी के दाएं से दूसरे स्थान पर बैठी है। यश्वी, योगिता के दाएं से तीसरे स्थान पर बैठी है। युक्ति और यामिनी दोनों का निकटतम पड़ोसी कौन है?", o: ["यशमिता", "योजना", "योगिता", "यश्वी"], a: 2, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "29nov2023-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Six letters, J, K, L, M, N and O, are written on the different faces of a dice. Two positions of this dice are shown in the given figure. Find the letter on the face opposite to K?", o: ["N", "M", "L", "J"], a: 1, e: "", qimg: "29nov2023-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "6", "2", "3"], a: 0, e: "", qimg: "29nov2023-s1-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "If A denotes ÷, B denotes ×, C denotes + and D denotes −, then what will be the value of the following equation? 8 B 8 A 4 C 5 D 3 =?", o: ["17", "19", "21", "18"], a: 3, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'PQ' as shown below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "29nov2023-s1-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "In a certain code language, if BEAUTY is coded as 3-6-2-22-21-26 and CREAM is coded as 4-19-6-2-14, then how will HONESTY be coded?", o: ["8-15-14-5-19-20-25", "7-14-14-4-19-19-24", "7-14-13-4-18-19-24", "9-16-15-6-20-21-26"], a: 3, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. TRUE : RPSC :: COPY : AMNW :: MIND : ?", o: ["KGKB", "KGLB", "KGLA", "KGKA"], a: 1, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["23", "28", "25", "20"], a: 1, e: "", qimg: "29nov2023-s1-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Identify the figure given in the options which when put in place of the question mark (?), will logically complete the series.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "29nov2023-s1-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Three statements are given followed by conclusions numbered 1, 2 and 3. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: 1. All books are journals. 2. All journals are novels. 3. Some poems are novels. Conclusions: 1. Some novels are books. 2. Some poems are journals. 3. All the journals are books.", o: ["Both conclusions 1 and 2 follow.", "Both conclusions 2 and 3 follow.", "Only conclusion 2 follows", "Only conclusion 1 follows."], a: 3, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s1-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "29nov2023-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding /deleting /multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed.) (6, 36, 144) (9, 81, 324)", o: ["(14, 196, 764)", "(14, 196, 784)", "(14, 186, 784)", "(15, 195, 784)"], a: 1, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s1-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["65.82", "61.88", "68.78", "75.87"], a: 1, e: "", qimg: "29nov2023-s1-q-76.png" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "दसवीं कक्षा की एक परीक्षा में सभी विद्यार्थियों के औसत अंक 85 हैं। यदि सभी लड़कियों के अंकों का योग 3500 है और लड़कों के अंकों का योग 2025 है, तो कक्षा में विद्यार्थियों की संख्या ज्ञात कीजिए।", o: ["55", "65", "68", "64"], a: 1, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "एक दुकानदार किसी वस्तु का अंकित मूल्य उसके क्रय मूल्य से 45% अधिक पर निर्धारित करता है। 16% लाभ प्राप्त करने के लिए कितने प्रतिशत छूट दी जाएगी?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "29nov2023-s1-q-78.png" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "यदि 483y718, अभाज्य संख्या 11 से विभाज्य है, जहाँ y एक अंक है, तो y का मान ज्ञात करें।", o: ["4", "3", "5", "2"], a: 3, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "₹54,000 के मूलधन पर 2 वर्ष की अवधि के लिए समान वार्षिक ब्याज दर पर चक्रवृद्धि ब्याज और साधारण ब्याज के बीच का अंतर ₹1,215 है। ब्याज दर ज्ञात करें।", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s1-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "वह बड़ी से बड़ी संख्या ज्ञात करें, जो 60, 135 और 235 को विभाजित करने पर हर मामले में एक समान शेषफल देती है।", o: ["35", "45", "25", "50"], a: 2, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "AB = AC और शीर्षलम्‍ब AD = 9 cm वाले एक समद्विबाहु त्रिभुज ABC का क्षेत्रफल 36 cm2 है। इसका परिमाप क्या है?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s1-q-82.png" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "The LCM of 148 and 205 is:", o: ["32640", "25441", "28540", "30340"], a: 3, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "दो उम्मीदवारों के बीच हुए एक चुनाव में, जीतने वाले उम्मीदवार को डाले गए मतों के 60% मत प्राप्त हुए और उसने 18,600 मतों से जीत दर्ज की। हारने वाले उम्मीदवार को कितने मत प्राप्त हुए?", o: ["36,400", "34,600", "37,200", "35,800"], a: 2, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "राहुल के पास 12 केले हैं। वह उनमें से x केलों को 20% के लाभ पर और शेष को 20% की हानि पर बेचता है। उसे पूरे परिव्य पर 10% का लाभ होता है। x का मान ज्ञात कीजिए।", o: ["10", "7", "9", "8"], a: 2, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "एक पाइप को दो टुकड़ोंों में काटा जाता है। यदि छोटा टुकड़ा पाइप की लंबाई का 40% है तो छोटा टुकड़ा बड़े टुकड़े से कितने प्रतिशत छोटा है?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "29nov2023-s1-q-86.png" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "यदि किसी पुस्तक के एक कॉलम में प्रिंट की गई 9 पंक्तियों में 36 शब्द हैं, तो 51 पंक्तियों के एक कॉलम में कितने शब्द होंगे?", o: ["192", "196", "204", "208"], a: 2, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "3 cm, 6 cm और 7 cm भुजाओं वाले त्रिभुज का क्षेत्रफल (cm2 में) ज्ञात करें।", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "29nov2023-s1-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "किस वार्षिक ब्याज दर पर ₹1,300 की राशि पर 10 वर्षों में साधारण ब्याज के रूप में ₹650 प्राप्त होगा?", o: ["7%", "8%", "4%", "5%"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "₹1,900 की एक धनराशि को A, B और C में इस प्रकार बांटा जाता है कि B को A से ₹100 अधिक मिलते हैं और C को B से ₹200 अधिक मिलते हैं। उनके हिस्सोंों का अनुपात क्या है?", o: ["5 ∶ 6 ∶ 8", "4 ∶ 5 ∶ 7", "5 ∶ 7 ∶ 8", "6 ∶ 7 ∶ 9"], a: 0, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "एमएस एक्सेल 365 (MS Excel 365) में, एमएस एक्सेल (MS Excel) का निम्नलिखित में से कौन-सा चार्ट, ऐसे डेटा के विभिन्न आइटम (items) की तुलना करता है, जो समयावधि के साथ बदलते हैं और जिसमें कैटेगरी (categories) को क्षैतिज अक्ष तथा वैल्‍यू को ऊर्ध्वाधर अक्ष में व्यवस्थित किया जाता है?", o: ["लाइन चार्ट (Line chart)", "कॉलम चार्ट (Column chart)", "पाई चार्ट (Pie chart)", "बार चार्ट (Bar chart)"], a: 1, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, how can we change page orientation in Print Preview?", o: ["By using Show Margins", "By using Page Setup dialog box", "By using Zoom", "By using Print dialog box"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following parts of the email contains the address of the sender and recipient?", o: ["Body", "Header", "Footer", "Complimentary close"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which wireless technology allows devices to connect to the internet within the limited range of a wireless router?", o: ["DSL", "LTE", "Wi-Fi", "3G"], a: 2, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "What is the general functionality of Mail Merge in the MS-Word 365?", o: ["To restore the deleted emails", "To delete and remove bulk emails", "To create and receive bulk emails", "To create and send bulk emails"], a: 3, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which area in MS-Word 365 contains icons for common tasks and actions, providing quick access to frequently used commands?", o: ["Status Bar", "Ribbon", "Navigation Pane", "Quick Access Toolbar"], a: 3, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "What is the definition of a workbook in Microsoft Excel 365?", o: ["A workbook is a group of cells.", "A workbook is a group of worksheets.", "A workbook is a group of blocks.", "A workbook is a group of rows."], a: 1, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following is used in MS Word 365 to split text into two or more columns?", o: ["Rows", "Columns", "Margins", "Orientation"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which option is used to paste copied text at a specific location in Microsoft Word 365?", o: ["Paste As Hyperlink", "Paste Link", "Paste Special", "Paste Destination Styles"], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "What is the shortcut key to initiate a spelling check in Microsoft Word 365?", o: ["F8", "F7", "F5", "F6"], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 29 Nov 2023 Shift-1";
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
