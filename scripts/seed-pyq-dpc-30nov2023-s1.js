/**
 * Seed: Delhi Police Constable - 30 Nov 2023 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc30nov2023_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-30nov2023-s1';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 30 Nov 2023 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Annapurna Finance Private Limited had its origin as a not-for-profit company called __________, an NGO that helped poor women in Odisha.", o: ["Alternative for Rural Movement", "Peoples Forum", "All India Development Trust", "Action for Rural Transformation"], a: 1, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Hanukkah is a ______ festival.", o: ["Jain", "Jewish", "Sikh", "Buddhist"], a: 1, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "In which year did Mihir Sen create history by being the only man to swim the five oceans in one calendar year?", o: ["1958", "1966", "1949", "1950"], a: 1, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Select the correct option based on the image given below.", o: ["(a)-(iv), (b)-(i), (c)-(iii), (d)-(ii)", "(a)-(i), (b)-(iv), (c)-(ii), (d)-(iii)", "(a)-(ii), (b)-(i), (c)-(iv), (d)-(iii)", "(a)-(iv), (b)-(i), (c)-(ii), (d)-(iii)"], a: 3, e: "", qimg: "30nov2023-s1-q-4.png" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Which edition of the FIFA U-17 Women’s World Cup was hosted by India in 2022?", o: ["Fifth", "Sixth", "Fourth", "Seventh"], a: 3, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "According to Planning commission of India (2011-12), which group of states has the highest poverty ratio?", o: ["Maharashtra and Gujarat", "Madhya Pradesh and Uttar Pradesh", "Chhattisgarh and Jharkhand", "Punjab and Haryana"], a: 2, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "When did the Pro Wrestling League start in India?", o: ["2015", "2017", "2010", "2014"], a: 0, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "The Ramakrishna Mission was founded by _________ to regenerate Indian society by promoting the Vedanta philosophy.", o: ["Swami Vivekananda", "Swami Dayananda Saraswati", "Debendranath Tagore", "Raja Ram Mohan Roy"], a: 0, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "‘Koman’ and ‘Kuruwa’ are the names of _________ in India.", o: ["peaks of Western Ghats", "artificial lakes", "tribes of Himalaya", "slash and burn agriculture"], a: 3, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "In which of the following sessions did the Indian National Congress decide to boycott the Simon Commission?", o: ["Poona session", "Madras session", "Bombay session", "Allahabad session"], a: 1, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "In 1991, India met with an economic crisis where the _________reserves fell so low that they were not sufficient for even a _________ .", o: ["foreign exchange; quarter", "gold; month", "gold; year", "foreign exchange; fortnight"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Kailasa temple is made up of which of the following types of rock?", o: ["Basalt", "Granite", "Marble", "Pumice"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Suppose a person has four acres of land in India, and he actually needs only two workers and himself to carry out various operations on his farm in a year, but if he employs five workers and his family members such as his wife and children”, this situation known as ____________.", o: ["Transitional Unemployment", "Open Unemployment", "Seasonal Unemployment", "Disguised Unemployment"], a: 3, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "The horizontal distance between two adjacent crests or troughs is known as the __________.", o: ["wave speed", "wave frequency", "wave period", "wave length"], a: 3, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Fundamental duties were first added by which Constitutional Amendment Act?", o: ["48th Constitutional Amendment Act", "46th Constitutional Amendment Act", "42nd Constitutional Amendment Act", "44th Constitutional Amendment Act"], a: 2, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "How many of the main fixed instruments can be found in the Jantar Mantar, Jaipur?", o: ["25", "17", "20", "15"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Which of the following were NOT part of the comprehensive liberalisation reforms introduced in July 1991?", o: ["Disinvestment and public enterprise reforms", "Demographic reforms", "Financial sector reforms", "Trade and capital flow reforms"], a: 1, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "The inscription in Sanskrit, recording the repairing of the Mauryan dam at Junagarh belonged to whom among the following?", o: ["Gautamiputra Satakarni", "Menander", "Kanishka", "Rudradaman"], a: 3, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Who among the following published the book ‘Stripurushtulna’, criticising the social differences between men and women?", o: ["Tarabai Shinde", "Pandita Ramabai", "Ishwar Chandra Vidyasagar", "Vijaya Laxmi Pandit"], a: 0, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Which of the following rivers is also known as ‘Dakshin Ganga’?", o: ["Bhargavi River", "Mahanadi River", "Pranhita River", "Godavari River"], a: 3, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Which Article of the Indian Constitution restricts and prohibits religious instructions in the educational institutions which are maintained by the Government and funded by the government?", o: ["Article 29", "Article 25", "Article 23", "Article 28"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Indian Constitution is related with equal justice and free legal aid?", o: ["Article 39 A", "Article 48 A", "Article 51 A", "Article 43 A"], a: 0, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "In an economy, if the gross national product at factor cost is ₹10,000 crores, depreciation is ₹250 crores, the net factor income from abroad is ₹500 crores, what is the value of national income?", o: ["₹10,750 crores", "₹9,250 crores", "₹10,250 crores", "₹9,750 crores"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "From which country is the legislative procedure in the Indian Constitution taken from?", o: ["Australia", "Ireland", "Japan", "United Kingdom"], a: 3, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Which of the following countries is the winner of the FIFA Football World Cup 2022?", o: ["Argentina", "Brazil", "England", "Japan"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "The jurisdiction of the Supreme Court is guaranteed by the:", o: ["Chief Justice", "Constitution", "President", "Parliament"], a: 1, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "The capital of Satakarni I of the Satavahanas was ________.", o: ["Anahilapura", "Prabhas Patan", "Anahilapatan", "Pratisthana"], a: 3, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Majority of India’s foreign trade is carried out by which means of transportation?", o: ["Road transportation", "Sea transportation", "Rail transportation", "Air transportation"], a: 1, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Who among the following, as Indian slide instrumentalist, vocalist and composer, initiated the Planet Symphony Orchestra in 2019?", o: ["Mohan Kannon", "Rahul Ram", "Abhay Jodhpurkar", "Narasimhan Ravikiran"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Bhagat Singh and ________ threw a bomb in the Central Legislative Assembly on 8 April 1929.", o: ["Jaidev Kapoor", "Batukeshwar Dutt", "Sukhdev Thapar", "Shivaram Rajguru"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "On which of the following matters of the State List can Delhi’s Legislature make laws?", o: ["Police", "Public order", "Land", "Health"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Which festival is celebrated to commemorate the birth anniversary of Lord Buddha?", o: ["Parinirvana Day", "Vesak", "Ullambana", "Kathina"], a: 1, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Lai Haraoba, which literally means ‘the festival of gods’, is primarily celebrated in which state of India?", o: ["Kerala", "Uttarakhand", "Himachal Pradesh", "Manipur"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following is the function of trade barriers?", o: ["Restrict the flow of international goods and services", "Restrict the flow of Indian goods and services in India", "Ban making goods", "Restrict packed goods"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Which of the following is known as the power house of cells?", o: ["Nucleus", "Ribosomes", "Mitochondria", "Cytoplasm"], a: 2, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "In the context of globalisation, FDI is an important term. What does the I stand for in FDI?", o: ["Investor", "International", "Interest", "Investment"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Bhajan Sopori is associated with which of the following instruments?", o: ["Violin", "Santoor", "Sarod", "Been"], a: 1, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Who among the following wrote ‘Nirmala’?", o: ["Munshi Premchand", "Jaishankar Prasad", "Shrilal Shukla", "Ramdhari Singh"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Which form of dance does Kumudini Lakhia perform?", o: ["Manipuri", "Bharatanatyam", "Kathakali", "Kathak"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which of the following statements about water resource is correct?", o: ["Water is a cyclic resource.", "Water is a biotic resource.", "Water is a non-renewable resource.", "Water is both, biotic and abiotic resource."], a: 0, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Veeranatyam is an ancient form of dance from which of these states?", o: ["Rajasthan", "Andhra Pradesh", "Uttar Pradesh", "Punjab"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "‘The Story of My Experiments with Truth’ is an autobiography of ____________.­", o: ["Mahatma Gandhi", "Sardar Vallabhbhai Patel", "Jawaharlal Nehru", "Bhimrao Ambedkar"], a: 0, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "According to the 2011 Census, the literacy rate among females in India is _________ compared to males.", o: ["unpredictable", "equal", "lower", "higher"], a: 2, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Irregular growth of teeth is due to the deficiencies of vitamin ____.", o: ["K", "A", "B", "D"], a: 3, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Rashtrakuta ruler Dantidurga died without a male heir and was succeeded by his uncle__________.", o: ["Amoghavarsha I", "Indra I", "Govinda I", "Krishna I"], a: 3, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which famous chemist refuted the theory of 'vitalism' by saying that organic substances can only be produced from living things?", o: ["John Dalton", "Antoine Lavoisier", "Friedrich Wohler", "Marcellin Berthelot"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "With which of the following states is the ‘Popir’ dance associated?", o: ["Arunachal Pradesh", "Madhya Pradesh", "Jharkhand", "Chhattisgarh"], a: 0, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "The first Battle of Panipat was fought on 20 April 1526 between Babur and _______.", o: ["Sikandar Lodi", "Mahmud Lodi", "Ibrahim Lodi", "Bahlul Lodi"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Who among the following has the power to make provision as he/she may think fit for the discharge of the functions of the Governor of a State in any contingency?", o: ["Chief Justice of India", "President", "Prime Minister", "Chief Justice of the High Court"], a: 1, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "From which Five-Year Plan period was the formulation and implementation of the Five- Year Plan discontinued by the Government of India?", o: ["Twelfth Five-Year Plan", "Tenth Five-Year Plan", "Eleventh Five-Year Plan", "Ninth Five-Year Plan"], a: 0, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "16 is related to 24 following a certain logic. Following the same logic, 22 is related to 33. To which of the following is 36 related, following the same logic? (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into their constituent digits. E.g. 13 – Operations on 13 such as adding/subtracting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed.)", o: ["49", "45", "51", "54"], a: 3, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "30nov2023-s1-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Given below is a series of figures – A, B, C and D which follow a particular pattern. Which of the given option figures should come in place of E to continue the series?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "30nov2023-s1-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: All houses are buildings. Some houses are apartments. Conclusions: I. All buildings are houses. II. Some buildings are apartments.", o: ["Both Conclusions I and II follow.", "Neither Conclusion I nor II follows.", "Only Conclusion I follows.", "Only Conclusion II follows."], a: 3, e: "", qimg: "" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "30nov2023-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "30nov2023-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "30nov2023-s1-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "If P denotes ‘×’, Q denotes ‘÷‘, R denotes ‘+’, and S denotes ‘−’, then what will come in place of ‘?’ in the following equation? (7)2 R (8 Q 2) P 13 R (63 Q 7) P 8 S 41 = ?", o: ["136", "132", "140", "128"], a: 1, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series. _ L _ O P H _ N _ P H L N _ _ H L _ O _", o: ["HNOLOPPN", "NHLOPONP", "NHOLOPPN", "HNLOOPNP"], a: 3, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "30nov2023-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given equation. 6*12*3*8*3*35", o: ["+, –, ×, ÷, =", "÷, –, ×, +, =", "+, ÷, ×, –, =", "+, ×, –, ÷, ="], a: 2, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "30nov2023-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "The given figure is followed by four option figures. Select the option figure in which this figure is embedded (i.e., contains this figure in the same form; rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "30nov2023-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘JAM’ is written as ‘KCP’ and ‘MUG’ is written as ‘NWJ’. How will ‘TEA’ be written in that language?", o: ["UGD", "UGC", "UFB", "UFC"], a: 0, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "30nov2023-s1-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Seven kids, G, H, I, J, K, L and M, are sitting in a straight row facing north. Only two people sit to the right of H. Only three people sit between H and I. J sits to the immediate right of H and to the immediate left of G. K sits to the immediate right of L and is not a neighbour of H. Who sits second from the extreme left end of the row?", o: ["I", "H", "K", "L"], a: 3, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third word in the same way as the second word is related to the first word. (The words must be considered as meaningful English words and must NOT be related to each other based on the number of letters/number of consonants/vowels in the word) Hot : Summer :: Cold : ?", o: ["Winter", "August", "April", "February"], a: 0, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding /deleting /multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is NOT allowed) (6, 48), (12, 168)", o: ["(14, 224)", "(13, 182)", "(16, 278)", "(19, 342)"], a: 0, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Three different positions of the same dice are shown. Find the number on the face opposite the face having ‘1’.", o: ["6", "3", "4", "2"], a: 1, e: "", qimg: "30nov2023-s1-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "30nov2023-s1-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["6", "4", "7", "5"], a: 0, e: "", qimg: "30nov2023-s1-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Six numbers, 7, 8, 9, 10, 11 and 12 are written on different faces of a dice. Three positions of this dice are shown here. Find the number on the face opposite 11.", o: ["9", "10", "8", "7"], a: 3, e: "", qimg: "30nov2023-s1-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Which of the following options will replace the question mark (?) in the given series? 47, 56.4, 67.68, 81.216, ?", o: ["97.4592", "9.7632", "86.9544", "91.3462"], a: 0, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'MN' as shown below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "30nov2023-s1-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "30nov2023-s1-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of money was lent at 12.5% rate of yearly compound interest for three years. If the present value (i.e. after three years) of the sum of money is ₹13,851, then how much money (in ₹) was lent?", o: ["10000", "10278", "8728", "9728"], a: 3, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "A, B and C can do a piece of work in 40, 60 and 120 days, respectively. In how many days can A do the work if he is assisted by B and C on every third day?", o: ["30", "20", "25", "35"], a: 0, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of 7.012, 4.018, 6.012, 4.048, and 3.91, is:", o: ["3.5", "7", "5", "4.5"], a: 2, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "If 184 ÷ 11.5 = 16, then 1.84 ÷ 1.15 is:", o: ["1.6", "0.6", "1.06", "0.16"], a: 0, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the number of lead balls, each 2 cm in diameter, that can be made from a sphere of diameter 20 cm.", o: ["1000", "150", "1500", "100"], a: 0, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1731", "1844", "1232", "1764"], a: 2, e: "", qimg: "30nov2023-s1-q-81.png" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "In an election, there were three candidates: Ram, Ramesh and Ganesh. Ram received 48% votes and Ramesh received 36% votes. If the total number of votes polled was 40,000, find the number of votes received by Ganesh.", o: ["6900", "7400", "6400", "7800"], a: 2, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A table is sold for ₹5,862 with 20% profit. The gain or loss percentage (to one decimal place) if it had been sold at ₹5,000, is:", o: ["1.5% loss", "2.4% profit", "2.3% loss", "1.6% profit"], a: 1, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["₹1,000", "₹5,000", "₹500", "₹2,000"], a: 0, e: "", qimg: "30nov2023-s1-q-84.png" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "If x ∶ y = 2 ∶ 3,y ∶ z = 4 ∶ 7 and z ∶ w = 7 ∶ 3, then x ∶ y ∶ z ∶ w is:", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "30nov2023-s1-q-85.png" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "30nov2023-s1-q-86.png" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "A person spends 80% of his income. His income increases by 30% and his expenditure also increases by 10%. By what percentage will his savings increase?", o: ["90%", "110%", "104%", "98%"], a: 1, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Ramesh sells an article at a discount of 15% of the marked price and he gains 25%. If the marked price of the article is ₹7,600, then the cost price of the article is:", o: ["₹5,168", "₹5,188", "₹5,178", "₹5,198"], a: 0, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "The number of all prime numbers less than 40 is:", o: ["12", "13", "11", "10"], a: 0, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "A missile travels at 1152 km/h. How much distance (in m) does it travel in one second?", o: ["380", "320", "340", "360"], a: 1, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following types of networking is used to connect all the computers within a school or within an office?", o: ["Metropolitan Area Network", "Personal Area Network", "Wide Area Network", "Local Area Network"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "What is the full form of email?", o: ["Express mail", "Efficient mail", "Electro mail", "Electronic mail"], a: 3, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, Which option is typically used to save a new spreadsheet for the first time?", o: ["Save and New", "Save and Print", "Save As", "Close"], a: 2, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following is used to select the entire paragraph in MS-Word 365?", o: ["Triple-click", "Double-click", "Scroll", "Single-click"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "The keyboard shortcut ________ is used to create bullets in MS Word 2010.", o: ["Ctrl + Shift + B", "Ctrl + Shift + L", "Ctrl + Alt + L", "Ctrl + Alt + B"], a: 1, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following shorcut key is used to convert the selected font to subscript in MS Word 365?", o: ["Shift + =", "Ctrl + +", "Ctrl + =", "Shift + +"], a: 2, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which is the following options defines the ‘Clipboard’ in Microsoft Word 365?", o: ["Accessing the internet", "Changing font settings", "Creating hyperlinks", "Storing and managing copied or cut text and objects"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, Which of the following is used to open a save dialog box in MS- Excel?", o: ["View -> save", "Home -> save", "Data -> save", "File -> save"], a: 3, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "The thesaurus tool in MS word 365 is used for ________.", o: ["finding similar words in the document", "checking for nouns and verbs", "checking for synonyms and antonyms", "finding repeated words in the document"], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "In Microsoft Excel 365, which type of sorting places values from smallest to largest?", o: ["Ascending order", "Random order", "Descending order", "Alphanumeric order"], a: 0, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 30 Nov 2023 Shift-1";
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
