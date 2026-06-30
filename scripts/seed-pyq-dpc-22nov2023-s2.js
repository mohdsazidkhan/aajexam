/**
 * Seed: Delhi Police Constable - 22 Nov 2023 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc22nov2023_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-22nov2023-s2';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 22 Nov 2023 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Who among the following novelists has written ‘A Suitable Boy’?", o: ["Aravind Adiga", "Vikram Seth", "Arundhati Roy", "Chetan Bhagat"], a: 1, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Minati Mishra was conferred the Padma Shree for her contribution to which form of dance?", o: ["Chhau", "Sattriya", "Bihu", "Odissi"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "The Lakshmana temple of Khajuraho, dedicated to Lord Vishnu, is an example of which style of temple architecture?", o: ["Vesara", "Nagara", "Dravidian", "Odisha"], a: 1, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Consider the following methods adopted by the government to protect goods produced in India from imports. (i) Heavy taxes were levied on imported goods (ii) The maximum limit on the imports of a commodity by a domestic user was fixed Choose the correct answer.", o: ["Both (i) and (ii) are true", "Both (i) and (ii) are false", "Only (ii) is true", "Only (i) is true"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Which of the following is a popular festival celebrated in the state of Bihar?", o: ["Me-Dam-Me-Phi", "Sama Chakeva", "Harela", "Ali-Ai-Ligang"], a: 1, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Which region of India is known for the unique Shola forests?", o: ["Eastern Himalayas", "Western Ghats", "Thar Desert", "Deccan Plateau"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "The Ghoomar dance of Rajasthan was originally performed by which tribal community?", o: ["Kathodi", "Mina", "Bhil", "Kanjar"], a: 2, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Who among the following was appointed as the first minister of the Ministry of Disinvestment during the tenure of the Vajpayee Government?", o: ["Yashwant Sinha", "Arun Shourie", "George Fernandes", "Jaswant Singh"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which of the following states is related to Gatka, which was inducted into the 37th National Games?", o: ["Punjab", "Uttar Pradesh", "Haryana", "Uttarakhand"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which of the following dances was traditionally performed by male monks in monasteries?", o: ["Sattriya", "Kathakali", "Kuchipudi", "Odissi"], a: 0, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Constitution of India mentions that Parliament by law can form a new State by separation of territory from any state or by uniting any territory to a part of any State?", o: ["Article 9", "Article 5", "Article 7", "Article 3"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "According to the census of India 2011, what was the literacy rate of Tamil Nadu?", o: ["82.80%", "82.34%", "80.09%", "81.42%"], a: 2, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT one of the several approaches of microfinance delivery mechanisms in India?", o: ["Cheap subsidised credit", "Self-help-group – bank linkage programme", "Microfinance institutions- Credit Lending Models", "Conventional weaker-section lending by banks"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Under which of the following Articles of the Constitution of India does the Governor of Arunachal Pradesh have special responsibility with respect to law and order and in discharge of his functions in relation thereto?", o: ["Article 371 D", "Article 371 H", "Article 371 A", "Article 371 G"], a: 1, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Which of the following words is not part of Article 15 of the Indian Constitution as far as grounds of discrimination are concerned?", o: ["Race", "Profession", "Caste", "Religion"], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Which National Waterway is associated with the Brahmaputra River?", o: ["National Waterway 1", "National Waterway 3", "National Waterway 2", "National Waterway 5"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Which of the following channels is NOT a part of six communication mail channels to facilitate quick delivery of mails in large towns and cities of India?", o: ["Periodical channel", "Business channel", "Weekly channel", "Metro channel"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Which common long-term infection develops when bacteria in the mouth metabolise sugars to produce acids that demineralise the hard tissues of teeth?", o: ["Dental caries", "Cleft palate", "Oro-dental trauma", "Oral thrush"], a: 0, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Dehing Patkai festival is the festival to celebrate the rich culture of which of the following Indian states?", o: ["Nagaland", "Sikkim", "Tripura", "Assam"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "The Sikhs under Guru Hargobind defeated the Mughals four times during the reign of ___________.", o: ["Aurangzeb", "Jahangir", "Akbar", "Shah Jahan"], a: 3, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "In which part of the Constitution of India is the procedure for amendments in the Constitution laid down?", o: ["Part XV", "Part XXI", "Part XX", "Part X"], a: 2, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "What is the air temperature at tropopause over the equator?", o: ["−60°C", "−50°C", "−80°C", "−70°C"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Who among the following is called the ‘Bhajan Samrat’ of India?", o: ["Anup Jalota", "Dayanand Prajapati", "Sanjeev Abhyankar", "Vishnu Bharnagar"], a: 0, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "In which of the following States was the 44th Chess Olympiad held?", o: ["Tamil Nadu", "Andhra Pradesh", "Kerala", "Karnataka"], a: 0, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Mame Khan, an Indian folk singer known for his Sufi and folk music performances, is from the state of _________.", o: ["Rajasthan", "Punjab", "Assam", "Gujarat"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Globalisation, by connecting countries, shall result in ________.", o: ["price enhancement by producers", "no change in competition among producers", "lesser competition among producers", "greater competition among producers"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which Article of the Indian Constitution mentions that it shall be the duty of every citizen of India to have compassion for living creatures?", o: ["51 A (h)", "51 A (g)", "51 A (j)", "51 A (i)"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Which of the following was one of the five states formed by breaking up the Bahmani kingdom?", o: ["Karur", "Golkonda", "Hyderabad", "Madras"], a: 1, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which of the following topped the medals tally, winning 61 gold medals in the National Games-2022?", o: ["Services Sports Control Board", "Kerala", "Haryana", "Maharashtra"], a: 0, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "What is the standard distance for males in a hurdle event?", o: ["110 m and 410 m", "100 m and 400 m", "120 m and 410 m", "110 m and 400 m"], a: 3, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Which of the following is a book written by Jyotirao Phule in 1873?", o: ["Tribe Caste and Society", "Last Among Equals", "Gulamgiri", "Jati ka Vinash"], a: 2, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Becquerel, which is equal to one disintegration per second (dps) is represented by which symbol?", o: ["Bq", "Bl", "Br", "Bc"], a: 0, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "To which genus does the nematode parasite called hookworm belong, which usually spreads through infected soil?", o: ["Fasciola", "Ancylostoma", "Hirudinaria", "Pheretima"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Under which of the following Acts can supreme court initiate International Commercial Arbitration?", o: ["International Arbitration Act, 2012", "Arbitration and Cancelations Act, 2004", "Arbitration and Conciliation Act, 1996", "United Nations Act on justice, 2015"], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Tax rates on higher income groups have been increased resulting in __________.", o: ["economic stability", "reducing inequalities of income and wealth", "economic growth", "reducing regional disparities"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "According to Census of India 2011, which of the following states has a population of more than 10 crores?", o: ["Maharashtra", "Rajasthan", "West Bengal", "Andhra Pradesh"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "In the year 1904, who formed a secret organisation of revolutionaries named Abhinav Bharat?", o: ["Lala Har Dayal", "Subhash Chandra Bose", "Ajit Singh", "Vinayak Damodar Savarkar"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Since which year has the Census become a regular ten yearly exercise in India?", o: ["1951", "1881", "1961", "1851"], a: 1, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "‘The Adventures of Huckleberry Finn’ was written by which of the following authors?", o: ["Mark Twain", "Robert Louis Stevenson", "Jane Austen", "Jerome K Jerome"], a: 0, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Simuka was the founder of which of the following dynasties of the post Mauryan era?", o: ["Kushana", "Parthians", "Kanva", "Satavahana"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Green Revolution is an example of:", o: ["how the service sector can bring about a revolution in India", "how international trade ban can bring changes in the agriculture produce", "how green GDP can be increased with the agricultural revolution", "how technology can bring revolutionary changes in agricultural output"], a: 3, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "The Red Fort was commissioned by which of these emperors?", o: ["Qutb-ud-din Bakhtiyar Khilji", "Shah Jahan", "Jahangir", "Mohammad Bin Tughlaq"], a: 1, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Which of the following is involved in the movement of lava over or towards the surface of the earth?", o: ["Weathering", "Exogenic process", "Diastrophism", "Volcanism"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Which of the following schemes aims to provide generic medicines at reasonable prices to the citizen of the country?", o: ["Pradhan Mantri Bharatiya Janaushadhi Pariyojana", "Mission Indradhanush", "Janani Shishu Suraksha Karyakaram", "Universal Immunisation Programme"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Devadasi National Award is given at the dance festival held at the pilgrim centre in the state of _________.", o: ["Kerala", "West Bengal", "Tamil Nadu", "Odisha"], a: 3, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Who among the following emphasised and propagated that “the Vedanta is the religion of all and not of the Hindus alone”?", o: ["Raja Ram Mohan Roy", "Ishwar Chandra Vidyasagar", "Swami Vivekanand", "Swami Dayanand Saraswati"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "What is the spread of living pteridophytes to narrow geographical regions?", o: ["Limited and restricted", "Limited and unrestricted", "Unlimited and restricted", "Unlimited and unrestricted"], a: 0, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "The Rigveda Samhita comprises of _____ books.", o: ["13", "11", "7", "10"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Which of the following states had the least decadal growth in literacy rate, as per census 2011?", o: ["Mizoram", "Tripura", "Kerala", "Goa"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Who advises the Governor with respect to proroguing of the session of the State Legislature?", o: ["Speaker", "Chief Minister", "Deputy Speaker", "Senior Member of the House"], a: 1, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["6", "11", "12", "8"], a: 1, e: "", qimg: "22nov2023-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "22nov2023-s2-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "22nov2023-s2-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["4", "2", "6", "5"], a: 3, e: "", qimg: "22nov2023-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'XY' as shown below", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "22nov2023-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance from commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: All Tears are Salts. Some Tears are Crocodiles. Conclusions: I. All Crocodiles are Tears. II. All Crocodiles are Salts.", o: ["Neither conclusion I nor II follows.", "Only conclusion I follows.", "Both conclusions I and II follow.", "Only conclusion II follows."], a: 0, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding/deleting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed) (2, 14, 3),(4, 28, 5)", o: ["(7, 37, 2)", "(7, 45, 2)", "(7, 22, 2)", "(7, 39, 2)"], a: 2, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "22nov2023-s2-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the figure from the options that can replace the question mark (?) and complete the given pattern.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "22nov2023-s2-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["÷ and ×", "+ and ÷", "− and +", "− and ×"], a: 0, e: "", qimg: "22nov2023-s2-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 13 : 169 :: 9 : ? :: 21 : 441", o: ["27", "729", "81", "243"], a: 2, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "22nov2023-s2-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "22nov2023-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "P, Q, R, S and T are five friends sitting in a straight line facing North. P sits at the extreme right end. T sits to the immediate left of S but is not at the extreme left end. R is the immediate neighbour of P. Who sits at the extreme left end of the row?", o: ["P", "S", "Q", "R"], a: 2, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘BEAM’ is written as ‘BAFL’ and ‘HUGE’ is written as ‘FFIT’. How will ‘ZERO’ be written in that language?", o: ["FSNY", "DSNA", "DNSA", "FNSY"], a: 3, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 8.8, ?, 7.3, 6.7, 6.2, 5.8", o: ["8.1", "8", "7.9", "8.2"], a: 1, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "22nov2023-s2-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern so that the final image is symmetrical.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "22nov2023-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "22nov2023-s2-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series. A _ _ PS _ LNP _ A _ N _ S _ LNP _", o: ["LNASLPAS", "LNASLPSA", "NLASLPAS", "LNASPLAS"], a: 0, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "22nov2023-s2-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "22nov2023-s2-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "22nov2023-s2-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'PQ' as shown below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "22nov2023-s2-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. HUGE : IJWI :: BEAM : QDGC :: RIDE : ?", o: ["IGLS", "IGKS", "IHKR", "IGKR"], a: 1, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A mobile phone is available for ₹39,300 cash payment, or for ₹7,450 cash down payment and three equal yearly instalments. If the shopkeeper charges interest at the rate of 20% per annum, compounded annually, what is the amount of instalment (in ₹)?", o: ["16240", "15000", "14060", "15120"], a: 3, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "On selling an item for ₹1,500, a shopkeeper loses 20%. For what amount should he sell it to gain 10%?", o: ["₹2,162.50", "₹2,000", "₹2,100", "₹2,062.50"], a: 3, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "If p and q are two prime numbers, then the average of p and q is:", o: ["p − q", "(p + q)/2", "p + q", "(p − q)/2"], a: 1, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "A sphere is 10 cm in diameter. Find the volume of the sphere in cubic metres?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "22nov2023-s2-q-79.png" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "A dealer fixed the price of an article 24% above the cost of production. While selling it, he allows a discount of 15%on the fixed price and makes a profit of ₹27. Find the cost of production of the article.", o: ["₹400", "₹700", "₹500", "₹600"], a: 2, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "22nov2023-s2-q-81.png" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of two numbers is 5∶7 and their difference is 48. The smaller of the two numbers is:", o: ["80", "100", "140", "120"], a: 3, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A can do a work in 30 days and B can do the same work in 40 days. They work together for 8 days and then B leaves the work. In how many days will A finish the remaining work?", o: ["14", "17", "16", "15"], a: 2, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "In how many ways can 480 be written as the product of two numbers which are coprime to each other?", o: ["2", "3", "1", "4"], a: 3, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "In an election between two candidates, 80% of the voters cast their votes, out of which 5% of the votes were declared invalid. A candidate got 5,700 votes, which were 75% of the total valid votes. Find the total number of voters enrolled in that election.", o: ["9000", "10000", "9500", "12000"], a: 1, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "A 220 m long train, travelling at a speed of 99 km/h, completely crosses another train coming from the opposite direction at a speed of 81 km/h in 9 seconds. Find the length of the second train (in metres).", o: ["230", "220", "240", "225"], a: 0, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Rajneesh decided to invest in gold every month. He buys gold worth ₹65,000. He gets a rebate of 8% on it. After getting the rebate, he pays tax at the rate of 10%. Next month, he buys ₹70,000 with a rebate of 10% and tax 12%. What is the percentage change in his investment from the first month to the second month?", o: ["Decrease; between 7 and 8 %", "Decrease; between 5 and 6 %", "Increase; between 7 and 8%", "Increase; between 5 and 6%"], a: 2, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "At what rate per cent per annum will a sum of money double itself on simple interest in 7 years?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "22nov2023-s2-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "Three numbers are in the ratio 4: 5: 6 and their LCM is 180. Their HCF is:", o: ["3", "4", "5", "2"], a: 0, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "The HCF of 204, 507 and 174 is:", o: ["17", "2", "13", "3"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "What is the primary purpose of an email client?", o: ["To create spreadsheets", "To edit photos", "To read and send emails", "To play video games"], a: 2, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "What is the purpose of the ‘Print Preview’ feature in Microsoft Word 365 ?", o: ["It allows you to insert images and graphics.", "It allows you to edit text and formatting.", "It provides suggestions for improving grammar and spelling.", "It provides a preview of how the document will look when printed."], a: 3, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In spreadsheet software, which formula can be used to find the largest value in a range of cells?", o: ["SUM()", "MIN()", "MAX()", "COUNT()"], a: 2, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "In MS Word 365, which group within the Home tab contains the alignment options?", o: ["Font", "Paragraph", "Styles", "Editing"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "The ‘Sort & Filter’ group is available under which of the following tabs in MS Excel 365?", o: ["Data", "View", "Home", "Insert"], a: 0, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following is a function in MS Excel 365 that returns the sum of the values in a range of cells?", o: ["COUNT", "AVERAGE", "SUM", "MAX"], a: 2, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "In MS word 365 What do you mean by hamburger menu?", o: ["It prints the document in the file.", "It deletes the document in the file.", "It hides the traditional file menu.", "It saves the document in the file."], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following is the purpose of the ‘Cell Padding’ property in a table in MS Word?", o: ["It adds a border around each cell", "It merges adjacent cells", "It adjusts the spacing between cells and their content", "It changes the font size within the cells"], a: 2, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following does the ‘Bold’ formatting option typically do to text in an MS Word 365, document?", o: ["Make the text darker and thicker", "Make the text larger", "Change the font style to italics", "Change the text colour"], a: 0, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following internet services is a secure connection over the internet that allows users to connect to a private network from a remote location?", o: ["VoIP", "Email", "VPN", "Web browsing"], a: 2, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 22 Nov 2023 Shift-2";
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
