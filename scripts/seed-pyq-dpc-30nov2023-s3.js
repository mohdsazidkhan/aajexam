/**
 * Seed: Delhi Police Constable - 30 Nov 2023 Shift-3
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc30nov2023_s3');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-30nov2023-s3';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 30 Nov 2023 Shift-3"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "As per Article 118 of the Constitution of India, who presides over the joint sitting of the two houses?", o: ["Prime Minister", "President", "Chairman", "Speaker"], a: 3, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "In 1953,who among the following dancers was called to perform for the coronation festivities of Queen Elizabeth (II)?", o: ["Sonal Mansingh", "Shovana Narayan", "Kumari Kamala", "Mrinalini Sarabhai"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "The chemical name of baking soda is:", o: ["sodium carbonate (Na2CO3)", "sodium citrate (Na3C6H5O7)", "sodium hydrogen carbonate (NaHCO3)", "calcium hydrogen bicarbonate (CaHCO3)2"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Which among the following is NOT a basic attribute of Dhamma mentioned in the Ashokan edicts?", o: ["Truthfulness", "Compassion", "Charity", "Celibacy"], a: 3, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "What is the ornate mountain-like entrance gateway before entering the premises of temples located in South India called?", o: ["Kalasha", "Jagati", "Gopuram", "Garbagriha"], a: 2, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "According to Census 2011, which union territory of India has the lowest population?", o: ["Dadra and Nagar Haveli", "Puducherry", "Daman and Diu", "Lakshadweep"], a: 3, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Which athlete won the gold medal in the Men's Javelin Throw F46 category at the Para Athletics World Championships 2023?", o: ["Ajeet Singh", "Nishad Kumar", "Sumit Antil", "Khilari Sachin"], a: 0, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "India topped the medals tally in the International Shooting Sport Federation (ISSF) World Cup-2022, which was held in Cairo, Egypt from _______.", o: ["12 January 2022 to 22 January 2022", "5 June 2022 to 15 June 2022", "10 April 2022 to 19 April 2022", "26 February 2022 to 8 March 2022"], a: 3, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which is the lengthiest written Constitution in the world?", o: ["Indian Constitution", "US Constitution", "British Constitution", "French Constitution"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Who wrote the novel ‘Vanity Fair’?", o: ["Lewis Carroll", "William Thackeray", "Charles Dickins", "George Eliot"], a: 1, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Who among the following social reformers founded the Ramakrishna Mission?", o: ["Swami Shraddhanand", "Swami Dayanand", "Swami Vivekananda", "Swami Vrajananda"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "According to the Economic Survey 2019-20, the top five trading partners of India continue to be USA, China, UAE and ________. a) Saudi Arabia, b) Hong Kong, c) Singapore, d) Sri Lanka", o: ["Both C and D", "Both A and B", "Both A and D", "Both B and C"], a: 1, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Who founded the Satya Shodhak Samaj ?", o: ["Narayan Guru", "CN Annadurai", "Jyotirao Phule", "BR Ambedkar"], a: 2, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which musical instrument does Gulfam Ahmed, who hails from Uttar Pradesh and has made contributions in the field of art, play apart from Sarod?", o: ["Afghani Rabab", "Doyra", "Zirbaghali", "Afghani Ghichak"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "MK Saroja, a Padma Shri awardee, is known for which form of dance?", o: ["Kathak", "Garba", "Bharatnatyam", "Kathakali"], a: 2, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Who among the following personalities is a Sangeet Natak Akademi award-winning folk dancer from Punjab?", o: ["Ram Lal", "Mamta Chandrakar", "Nathoo Lal Solanki", "Balkar Singh Sidhu"], a: 3, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "The ‘Kalol’, ‘Mehsana’ and ‘Nawagam’ oil fields are associated with which state?", o: ["Rajasthan", "Assam", "Gujarat", "Maharashtra"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Which of the following elements is present in common table salt?", o: ["Magnesium", "Copper", "Sodium", "Calcium"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "The Directive Principles of State Policy resembles the ‘Instrument of Instructions’ enumerated in the ____________________.", o: ["Government of India Act of 1909", "Government of India Act of 1942", "Government of India Act of 1935", "Government of India Act of 1919"], a: 2, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "In which year did the Central Government merge the CSO and NSSO and establish NSO under the Ministry of Statistics and Programme Implementation (MoSPI)?", o: ["2019", "2017", "2018", "2016"], a: 0, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Which Indian classical dance is shown in the sculptures at the ancient Konark Sun Temple?", o: ["Odissi", "Kuchipudi", "‎Mohiniyattam", "Manipuri"], a: 0, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "From which of the following countries did India adopt the ‘procedure established by the law’?", o: ["The US", "Brazil", "Sri Lanka", "Japan"], a: 3, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Chaupakhya Festival is celebrated in the state of _________________________.", o: ["Rajasthan", "Jharkhand", "Uttarakhand", "Chhattisgarh"], a: 2, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "The Chief Minister of Delhi is appointed by the __________.", o: ["Governor", "Lieutenant Governor", "Prime Minister", "President of India"], a: 3, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "The fifth Khelo India Youth Games was hosted by ________.", o: ["Madhya Pradesh", "Maharashtra", "Haryana", "Punjab"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Which of the following is an example of eastern coast port?", o: ["Kandla Port", "New Mangalore port", "Mumbai Port", "Chennai port"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "According to their notion of kingship, many Kushana rulers adopted the title of ________.", o: ["Dhartiputra", "Devaputra", "Aryaputra", "Suryaputra"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "In a food chain, the base of energy pyramid consists of:", o: ["primary consumers", "secondary consumers", "producers", "tertiary consumers"], a: 2, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Who of the following Chola rulers initially occupied the northern part of Sri Lanka in his raids?", o: ["Rajaraja I", "Parantaka I", "Rajadhiraja I", "Rajendra I"], a: 0, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Which of the following educational institute was established by Raja Ram Mohan Roy with the cooperation of David Hare in 1817 in Calcutta?", o: ["Vedanta College", "Sanskrit College", "Hindu College", "Calcutta Madrasa"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Who among the following social reformers developed the modern Bengali Alphabet in British India?", o: ["Keshab Chandra Sen", "Bankim Chandra Chatterjee", "Ishwar Chandra Vidyasagar", "Rabindra Nath Tagore"], a: 2, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "According to the Census of India 2011, which Union Territory recorded the lowest literacy rate?", o: ["Lakshadweep", "Puducherry", "Dadra and Nagar Haveli", "Daman and Diu"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Who is the author of the historical fiction ‘Legend of Suheldev: The King Who Saved India’?", o: ["Ramchandra Guha", "Ranjit Desai", "Nandini Sengupta", "Amish Tripathi"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "In the Eleventh Five-Year Plan, the Planning Commission targeted reducing the gender gap in literacy to _________ percentage points by 2011-2012.", o: ["10", "20", "30", "40"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "In which year was the National Rural Health Mission launched in India to provide accessible, affordable and quality health care to the rural population?", o: ["2005", "2010", "2007", "2001"], a: 0, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "The Nizam Shahi dynasty of Ahmednagar was founded by ________ in 1490.", o: ["Mohammed Shah I", "Alauddin Bahman Shah", "Tajuddin Firuz Shah", "Malik Ahmed Nizamul Mulk Bahri"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Which Article of the Constitution of India is associated with the protection and improvement of the environment and safeguarding of forests and wild life?", o: ["Article 39 A", "Article48 A", "Article 43 A", "Article 51 A"], a: 1, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "In the northern hemisphere, summer solstice occurs on:", o: ["21st June", "21st May", "21st April", "21st March"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "In which of the following places is the Losar Festival celebrated?", o: ["Himachal Pradesh", "Nagaland", "Ladakh", "Lakshadweep"], a: 2, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Faiyyaz Khan, Latafat Hussein Khan and Dinkar Kaikini are famous exponents from which of the following Gharanas?", o: ["Agra", "Jaipur", "Benaras", "Patiala"], a: 0, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "WTO was formed in the year 1995 to replace which of the following institutions?", o: ["Industrial Board of Reconstruction and Development", "World Bank", "General Agreement of Trade and Tariff", "International Monetary Fund"], a: 2, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "What process was discovered in the early 1990s that is currently used to remove ammonia from wastewater and contributes significantly to the loss of fixed nitrogen from the oceans?", o: ["Pervasion", "Anammox", "Coalescence", "Volatilisation"], a: 1, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Which of the following won the highest number of gold medals in the 36th national games?", o: ["Punjab", "Services Sports Control Board", "Haryana", "Maharashtra"], a: 1, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Which of the following Harappan structures had a thin lining of bitumen to prevent the seepage of water ?", o: ["Drainage", "Great Bath", "Roads", "Granaries"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Under competitive assets market condition, the price of a bond must always be ______________ to its present value in equilibrium.", o: ["twice", "half", "equal", "thrice"], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which letter code of Köppen climate characterises a hot-summer humid continental climate?", o: ["Cfc", "BSh", "ETf", "Dfa"], a: 3, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "According to the seventh schedule of the Indian Constitution, Agriculture is in which list?", o: ["Both Union and State List", "Concurrent list", "State list", "Union list"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Who among the following does NOT participate in the election of the President of India?", o: ["Elected members of Lok Sabha", "Elected members of Rajya Sabha", "Elected members of legislative assembly", "Elected members of legislative council of state"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "In which Budget was Disinvestment Fund and Asset Management Company set up?", o: ["2003-04", "1991-92", "1992-93", "2000-01"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "The most common route for MNC investment is to buy up ________.", o: ["local resources", "local technology", "local companies", "excess land and factories"], a: 2, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding/deleting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed) (4, 9, 95) (6, 10, 134)", o: ["(7, 10, 174)", "(9, 12, 232)", "(8, 11, 183)", "(5, 8, 86)"], a: 2, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "30nov2023-s3-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "In a certain code language, 'LAND' is written as 'BLYJ' and 'BIRD' is written as 'BPGZ'. How will 'WAIT' be written in that language?", o: ["RGYU", "YURG", "UYGR", "RGUY"], a: 0, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "30nov2023-s3-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 87 * 2 * 80 * 4 * 150 * 4", o: ["×− ÷ + =", "×− = + ÷", "÷ ×− = +", "×− ÷ = +"], a: 3, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster. JFBW : FMXD :: KDZI : GKVP :: PRDY : ?", o: ["GRUE", "LAPD", "NRHX", "LYZF"], a: 3, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "30nov2023-s3-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements : All trees are greens. Some trees are conifers. Conclusions: I. All conifers are greens. II. Some greens are trees.", o: ["Only Conclusion II follows.", "Only Conclusion I follows.", "Neither Conclusion I nor II follows.", "Both Conclusions I and II follow."], a: 0, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "30nov2023-s3-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below and complete the pattern.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "30nov2023-s3-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "30nov2023-s3-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Six letters, M, N, O, P, Q and R are written on different faces of a dice. Three positions of this dice are shown here. Find the letter on the face opposite O.", o: ["P", "R", "Q", "N"], a: 2, e: "", qimg: "30nov2023-s3-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "30nov2023-s3-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["15", "12", "14", "17"], a: 3, e: "", qimg: "30nov2023-s3-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "If + means ÷, − means +, × means – and ÷ means ×, what is the value of the following expressions? 20 ÷ 4 – 27 + 3 × 12 =?", o: ["75", "79", "80", "77"], a: 3, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "30nov2023-s3-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "30nov2023-s3-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Six students are sitting around a circular table facing the centre. Dwiti is an immediate neighbour of both Durga and Dheeraj. Dilip is sitting second to the right of Dwiti. Dev is sitting third to the left of Dheeraj. Dilip is an immediate neighbour of both Daksh and Dheeraj. Who is an immediate neighbour of both Daksh and Durga?", o: ["Dev", "Dilip", "Dwiti", "Dheeraj"], a: 0, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series. T _ _ E S _ Y R _ S T Y _ E _ T Y _ _ S", o: ["YRTERSRE", "YRETRSRE", "YTRERSRE", "YETERESE"], a: 0, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 225 : 15 :: 1225 : ? :: 2025 : 45", o: ["25", "35", "20", "30"], a: 1, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "30nov2023-s3-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 1, ?, 42, 78, 127, 191", o: ["17", "21", "16", "15"], a: 0, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "30nov2023-s3-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "30nov2023-s3-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "30nov2023-s3-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the LCM of 9, 8.1, 0.27, 0.09?", o: ["8100", "81", "810", "801"], a: 1, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "If the diameter of a hemisphere is 8 cm, then the volume of the hemisphere (in cm3) is:", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "30nov2023-s3-q-77.png" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "How many digits will be there after the decimal point in the product of 0.325 and 1.0302?", o: ["8", "5", "7", "6"], a: 3, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "30nov2023-s3-q-79.png" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["₹5,200", "₹4,000", "₹5,000", "₹4,800"], a: 0, e: "", qimg: "30nov2023-s3-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of money was borrowed and paid back in two annual installments of ₹960 each, allowing 5% compound interest. The sum borrowed was:", o: ["₹1,785.03", "₹1,850.05", "₹1,695.05", "₹1,875.03"], a: 0, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "After allowing a discount of 20% on the marked price of an article, it is sold for ₹500. Find its marked price.", o: ["₹550", "₹520", "₹625", "₹525"], a: 2, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of incomes of A, B and C is 3 : 5 : 4. If the income of A is tripled, the income of C is doubled and the income of B remains the same, what is the ratio of their new incomes?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "30nov2023-s3-q-83.png" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Farida shifted to a job in the social sector at a monthly salary that was 28% less than the monthly salary she was getting in her previous job. If Farida’s monthly salary in the job in the social sector is ₹27,000, what was her monthly salary (in ₹) in the previous job?", o: ["36000", "37500", "38250", "38500"], a: 1, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "The difference between the simple interests on ₹1,800 for 3 years at different rates is ₹40. The difference between the rates of interest is:", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "30nov2023-s3-q-85.png" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "A works twice as fast as B. If both of them together can finish a piece of work in 12 days, then B alone can do it in:", o: ["34 days", "38 days", "36 days", "32 days"], a: 2, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "If the average of 5 consecutive numbers is 24, then the smallest number is:", o: ["21", "22", "23", "20"], a: 1, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "There are only two hostels in XYZ University, Hostel P and Hostel Q, wherein an equal number of students were living in year 2021. The total number of persons living in both hostels of XYZ University fell by 33% to 8,375 in 2022 from 2021. How many students were living in Hostel P in 2021?", o: ["12,500", "5,750", "6,250", "5,612"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "A student goes to school at a speed of 20 km/h and reaches 6 min late. If he goes at a speed of 30 km/h, he is 6 min early. What is the distance to the school?", o: ["17 km", "16 km", "12 km", "18 km"], a: 2, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "The side of a triangle is 17 cm and height of the triangle from this side is 10 cm. Find the area of the triangle.", o: ["95 cm2", "90 cm2", "85 cm2", "75 cm2"], a: 2, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "When you ‘reply’ to an email, what does it mean?", o: ["You're sending the same email back to the original sender.", "You're sending the email to a different recipient.", "You're sending a new email to the same recipient.", "You're deleting the email."], a: 2, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which protocol allows users to make real-time voice and video calls over the internet?", o: ["FTP", "VoIP", "Email", "DNS"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which of the following is the correct shortcut key to open an existing spreadsheet in MS Excel?", o: ["Press Alternate (Alt) + N", "Press Control (Ctrl) + O", "Press Control (Ctrl) + N", "Press Alternate (Alt) + O"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "In MS Word 365 which of the following menus is used to open a word document?", o: ["Start", "Mozilla", "Power", "Control panel"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In Microsoft Word 365, the AutoCorrect feature is used for _______.", o: ["misspelled text", "outside margin text", "formulas", "short repetitive text"], a: 0, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which of the following groups contains the Insert and Delete command in the Home tab of the ribbon in MS-Excel 365?", o: ["Editing", "Cells", "Alignment", "Font"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "एमएस वर्ड 365 (MS Word 365) में, कौन-सा टेक्स्ट अलाइनमेंट विकल्प आमतौर पर कानूनी दस्तावेजों के लिए उपयोग किया जाता है, क्योंोंकि यह टेक्स्ट को बाएं और दाएं दोनों हाशिये पर अलाइन करता है, जिससे दाईं ओर एक दंतुरित किनारा (jagged edge) रह जाता है?", o: ["लेफ्ट अलाइन (Left Align)", "सेंटर अलाइन (Center Align)", "राइड अलाइन (Right Align)", "जस्‍टीफाई (Justify)"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, Which of the following keyboard shortcuts is used to auto fit row height manually in MS Excel?", o: ["Alt + H + O + A", "Alt + O + C + W", "Alt + H + O + H", "Alt + O + C + N"], a: 2, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following tabs is used in MS Word 365 if we want to delete a table?", o: ["Insert tab", "Edit tab", "File tab", "Layout tab"], a: 3, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following shortcut keys is used to make Centre-aligned text in MS-Word 365?", o: ["Ctrl + E", "Ctrl + R", "Ctrl + J", "Ctrl + C"], a: 0, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 30 Nov 2023 Shift-3";
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
