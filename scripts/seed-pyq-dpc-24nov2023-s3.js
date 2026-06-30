/**
 * Seed: Delhi Police Constable - 24 Nov 2023 Shift-3
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc24nov2023_s3');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-24nov2023-s3';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 24 Nov 2023 Shift-3"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "In which year did Anil Kumble take 10 wickets in a cricket test match?", o: ["1987", "1986", "1998", "1999"], a: 3, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "In which city of Maharashtra is Kalidasa Festival organised every year?", o: ["Nasik", "Nagpur", "Pune", "Mumbai"], a: 1, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "As per Article 170 of the Constitution of India, the Legislative Assembly of each State shall consist of NOT more than __________ members.", o: ["500", "450", "300", "250"], a: 0, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Who appoints the Attorney-General of India?", o: ["Chief Minister", "Governor", "Prime Minister", "President"], a: 3, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Which Indian cricketer has written the book ‘The Test of My Life’?", o: ["Yuvraj Singh", "MS Dhoni", "Sachin Tendulkar", "Kapil Dev"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Which of the following is a negative impact of globalisation on Indian economy?", o: ["Rise of straight-jacketed approach to leadership styles", "Rise in female participation in employment", "Rise in relative deprivation", "Loss of child labour"], a: 2, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "According to the National Jute Board 2022-23, which state is the largest producer of jute?", o: ["Madhya Pradesh", "Bihar", "Gujarat", "West Bengal"], a: 3, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "The density of population in India (Census 2011) is __________________ persons per sq km.", o: ["296", "357", "382", "284"], a: 2, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which of the following is/are correct about curd formation? Statement 1. The bacteria present in milk breakdown lactose into lactic acid. Statement 2. Production of lactic acid reduces the pH of the milk, coagulating it to form curd. Statement 3. Curd and yoghurt are the synonyms and their texture and taste is exactly same.", o: ["Only statements 1 and 2 are correct", "Only statement 1 is correct", "All statements 1, 2 and 3 are correct", "Only statement 3 is correct"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which of the following rivers passes through the maximum number of states in India?", o: ["Damodar", "Indus", "Ganga", "Mahanadi"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "The correct order of percentage of gases in atmosphere is:", o: ["N2>O2>Ar>CO2", "N2>O2>CO2>Ar", "N2>Ar>O2>CO2", "O2>N2>Ar>CO2"], a: 0, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Who led the Young Bengal Movement?", o: ["Henry Vivian Derozio", "Raja Ram Mohan Roy", "Keshav Chandra Sen", "Devendra Nath Tagore"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Select the INCORRECT pair of festival and the respective state.", o: ["Chhath Puja – Bihar", "Maghi – Himachal Pradesh", "Dang Darbar – Gujarat", "Sarhul – Tamil Nadu"], a: 3, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which of the following books was written by Kautilya, Prime Minister of Chandragupta Maurya?", o: ["Bhagavati Sutra", "Arthashstra", "Anguttara Nikaya", "Purva Mimamsa Sutras"], a: 1, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Which of the following pairs is INCORRECT?", o: ["Part III – Fundamental Rights", "Part I – The Union and its Territory", "Part VIII – The Union Territories", "Part II – Fundamental Duties"], a: 3, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a major jute producing state in India?", o: ["Meghalaya", "West Bengal", "Telangana", "Assam"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Whose name among the following is associated with the second five-year plan?", o: ["Jayanta Kumar Ghosh", "Kantilal Mardia", "Debabrata Basu", "Prasanta Chandra Mahalanobis"], a: 3, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "‘Permanent Settlement’ in Bengal was started by which of the following Governor- Generals?", o: ["Lord Minto", "Thomas Munro", "Alexander Reed", "Lord Cornwallis"], a: 3, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "The term ‘Protozoa’ was coined by ____________.", o: ["Goldfuss", "Robert Grant", "Lamarck", "Charles Darwin"], a: 0, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Identify the artist who popularised the guitar as an instrument in Indian classical music.", o: ["N Ramani", "Sandeep Das", "EM Subramaniam", "Brij Bhushan Kabra"], a: 3, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "PMJJBY (Pradhan Mantri Jeevan Jyoti Bima Yojana) scheme is a type of __.", o: ["life insurance scheme", "AD&D scheme", "pension scheme", "loan scheme"], a: 0, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Who among the following is associated with Kathakali?", o: ["Sujata Mohapatra", "Kalamandalam Krishnan Nair", "Swapana Sundari", "Kaushalya Reddy"], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Dollu Kunitha, a high energy popular folk dance of Karnataka region is primarily performed for which of the following deities?", o: ["Lord Shiva", "Lord Rama", "Lord Vishnu", "Lord Krishna"], a: 0, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "The garbhagriha and shikhara are made in a Rekha-Prasada or Latina style and the mandapa of an old form of wooden architecture. These features of temple architecture are present in which part of India?", o: ["Western", "Northern", "Southern", "Eastern"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Consider the given the values and answer the question that follows. GNP at market prices = ₹15,50,113 crore Indirect taxes = ₹1,75,386 crore Subsidies = ₹38,504 Net factor income from abroad = (-)₹13,439 What will be the value of GDP at factor cost?", o: ["₹13,99,792", "₹14,13,231", "₹17,00,434", "₹14,26,670"], a: 3, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Which of the following is not correct about Article 19 of the Indian Constitution?", o: ["All citizens shall have the right to form associations or unions.", "All citizens shall have the right to assemble peaceably and without arms.", "All citizens shall have the right to move freely outside the territory of India.", "All citizens shall have the right to freedom of speech and expression."], a: 2, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Name the popular dance of North-West India in which dancers balance multiple pots or pitchers on their head while standing on top of glass bottles or on the rim of a brass plate.", o: ["Bhavai", "Ghoomar", "Garba", "Tera Tali"], a: 0, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Who was known as the ‘Frontier Gandhi of India’ and was the leader of North West Frontier province of British India?", o: ["Mahatma Gandhi", "Jawaharlal Nehru", "Subhash Chandra Bose", "Khan Abdul Gaffar Khan"], a: 3, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which of the following equations correctly measures national income by expenditure method?", o: ["Y= C + I + G – X + M", "Y= C + I + G + X + M", "Y= C + I + G + X – M", "Y= C – I + G + X – M"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "In which of following Yajnas was a horse let loose to wander freely and guarded by the raja’s men in ancient India?", o: ["Ashvadhari Yajna", "Naramedha Yajna", "Brahma Yajna", "Ashvamedha Yajna"], a: 3, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "The stratosphere is located between which of the following atmospheric layers?", o: ["Stratopause and Mesopause", "Mesopause and Exosphere", "Mesosphere and Thermosphere", "Tropopause and Stratopause"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Gangwon is the host city of which of the following sports events?", o: ["Summer Olympics 2024", "Summer Youth Olympic Games 2024", "Winter Youth Olympic Games 2024", "Winter Olympics 2024"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Bacteria are the sole members of which of the following kingdoms?", o: ["Animalia", "Plantae", "Protista", "Monera"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following awards is given in the field of dance by the government of Madhya Pradesh?", o: ["Nandi Award for Best Choreographer", "Kalidas Samman", "Sanatan Sangeet Sanskriti", "Tagore Ratna"], a: 1, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "In India, poverty estimations are based on surveys conducted by the National Sample Survey Organisation (NSSO). Under which ministry does the NSSO function?", o: ["Ministry of Consumer Affairs", "Ministry of Statistics and Programme Implementation", "Ministry of Finance", "Ministry of Labour and Employment"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Neeraj Chopra became the first Indian to win the prestigious ______ Final in Switzerland in 2022.", o: ["National Open Athletics Championships", "European Athletics Championships", "World Athletics Championships", "Zurich Diamond League"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "‘A shot at History’ is an autobiography of whom among the following Olympic medal awardees?", o: ["PV Sindhu", "Abhinav Bindra", "Sushil Kumar", "Leander Paes"], a: 1, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Who was the Viceroy of India when the Indian National Congress was founded?", o: ["Lord Elgin II", "Lord Dufferin", "Lord Lansdowne", "Lord Ripon"], a: 1, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "The Directive Principle of State Policy that requires the State ‘to minimise inequalities in income, status, facilities and opportunities’ was added by the _________________Constitution Amendment Act.", o: ["44th", "40th", "43rd", "41st"], a: 0, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Who among the following discovered the ruins of Hampi in1800?", o: ["Robert Fitzroy", "Colonel Colin Mackenzie", "Robert Mackenzie", "Colin Fitzroy"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "The official mascot of the Commonwealth Games 2022 was _________ .", o: ["Perry", "Miraitova", "La’eeb", "Bing Dwen"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Which of the following statements is true with regard to the establishment of Central Public Sector Undertakings in India?", o: ["They are established to fulfil the objective of a self-reliant India.", "They are supposed to reduce the importance of the private sector in India.", "They are only expected to generate greater profits to fund the Indian budget.", "They are established solely for export-oriented industrialisation."], a: 0, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Contingency Fund of India is operated by the __________.", o: ["Executive action", "Reserve Bank’s action", "Judicial action", "Parliamentary action"], a: 0, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "In 2009, AR Rehman won Oscars in which of the given pair of categories?", o: ["Best Sound Mixing and Best Original Song", "Best Original Musical and Best Sound Mixing", "Best Original Score and Best Sound Mixing", "Best Original Score and Best Original Song"], a: 3, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "The process of depositing a layer of any desired metal on another material by means of electricity is called ____________.", o: ["electroplating", "photocatalysis", "photoelectrochemical", "electrolysis"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "According to Census of India 2011, in how many States / Union Territories was the female literacy rate recorded more than 90%?", o: ["Four", "Two", "One", "Three"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Which is the following is abolished, and its practice forbidden in any form, according to Article 17 of the Constitution?", o: ["Untouchability", "Exploitation", "Discrimination", "Freedom of speech"], a: 0, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Famous Scholar Al-Biruni wrote Kitab-ul-Hind in ________ language.", o: ["Sanskrit", "Arabic", "Urdu", "Persian"], a: 1, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Lost wax casting technique was used to make _________ statues during Harappan civilisation.", o: ["bronze", "marble", "wood", "rock"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Gold Monetisation Scheme (GMS) was launched by the Government of India in _________ .Under this scheme, one can deposit their gold in any form in a GMS account to earn interest as the price of the gold metal goes up.", o: ["2005", "2015", "2020", "2010"], a: 1, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Which of the following letter clusters will replace the question mark (?) in the given series to make it logically complete? GMU, IKW, KIY, MGA, ?", o: ["OEC", "OIC", "OEB", "OCI"], a: 0, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Which of the following options will replace the question mark (?) in the given series? 512, 490, 468, 446, 424, ?", o: ["402", "400", "399", "396"], a: 0, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Seven people - A, B, C, D, E, F and G - are sitting in a straight row, facing north. Only two people sit to the left of B. Only three people sit between G and B. D sits second to the right of A. D is not an immediate neighbour of B. E sits to the immediate right of F. Who among the following sits at the extreme left end of the line?", o: ["F", "G", "A", "C"], a: 0, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown below. Choose a figure which would most closely resemble the unfolded form of the paper.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s3-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘WONDER’ is written as ‘KLTWCI’ and 'SPRING' is written as 'OKPRTT'. How will ‘PLAYER’ be written as in that language?", o: ["RTLSUX", "ROGBCI", "RPLSWZ", "RBOICG"], a: 1, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s3-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its consttuent digits. E.g. 13 – Operations on 13 such as adding /deleting /multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is NOT allowed) (184, 23), (264, 33)", o: ["(376, 47)", "(270, 39)", "(341, 41)", "(250, 36)"], a: 0, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: All potatoes are vegetables. All carrots are vegetables. Conclusions: I. Some carrots are potatoes. II. All vegetables are carrots.", o: ["Neither conclusion I nor II follows", "Only conclusion I follows", "Both conclusions I and II follow", "Only conclusion II follows"], a: 0, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the option figure that is embedded in the given figure. (Rotation is not allowed).", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "24nov2023-s3-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["5", "4", "1", "2"], a: 1, e: "", qimg: "24nov2023-s3-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 36 * 16 * 4 * 20 * 90 * 46", o: ["×, ÷ , + , – , =", "+ , ÷ ,×, – , =", "– , ÷ , + , ×, =", "– , ÷ , ×, + , ="], a: 3, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s3-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["10", "16", "12", "8"], a: 1, e: "", qimg: "24nov2023-s3-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "24nov2023-s3-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "24nov2023-s3-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "24nov2023-s3-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s3-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s3-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster. KFCZ : HLZF :: LVEG : IBBM :: PROD : ?", o: ["MXLJ", "IHEX", "IBNX", "MKXJ"], a: 0, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 60 * 40 * 10 * 50 * 100 * 160", o: ["×, ÷ , – , + , =", "+ , ÷ , ×, – , =", "÷ , ×, – , + , =", "– , ÷ , ×, + , ="], a: 1, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Six numbers, 1, 2, 3, 4, 5 and 6, are written on the different faces of a dice. Three different positions of the same dice are shown (Figures 1-3). Find the number on the face opposite to the face showing ‘2’.", o: ["1", "4", "3", "6"], a: 1, e: "", qimg: "24nov2023-s3-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'PQ' as shown below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s3-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "24nov2023-s3-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern so that the final image is symmetrical.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s3-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 15 : 135 :: 13 : ? :: 24 : 216", o: ["121", "117", "104", "91"], a: 1, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the sum of all those prime numbers which are less than 28.", o: ["97", "120", "110", "100"], a: 3, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "24nov2023-s3-q-77.png" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct statement.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s3-q-78.png" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "24nov2023-s3-q-79.png" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s3-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "The sum of money A initially had was 20% less than the sum of money B had. If B gave 16% of her money to her brother, by what percentage should A’s sum increase so that A and B finally have identical amounts?", o: ["4.5%", "5%", "4%", "6%"], a: 1, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A, B and C can do a piece of work in 10 days, 20 days and 40 days, respectively. On the first day A is assisted by B, and on the second day C assists A. This 2-day cycle is repeated starting with A and B, till the work gets completed. How long (in whole number of days) would it take to complete the work?", o: ["10", "6", "4", "8"], a: 3, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the compound interest (in ₹) on ₹24,000 at 10% per annum for 3 years?", o: ["7044", "7200", "7494", "7944"], a: 3, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["13", "17", "12", "11"], a: 2, e: "", qimg: "24nov2023-s3-q-84.png" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "The area of a right triangle is 48 m2 and one of the two sides containing the right angle is 8 m long. What is the length (in m) of the other side containing the right angle?", o: ["6", "16", "12", "24"], a: 2, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper offers a discount of 10% on an article and gains 15%. Calculate the marked price of an article which he purchased for₹1,350.", o: ["₹1,450", "₹1,550", "₹1,630", "₹1,725"], a: 3, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "If the income of P is 25% less than Q, then the combined income of P and Q is what percentage more than P?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s3-q-87.png" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of 24, 39 and y is 33. What is the value of y?", o: ["37", "36", "35", "38"], a: 1, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "Ramu takes 1 hour 20 minutes in walking a distance and riding back to the starting place. He could walk both ways in 2 hours 30 minutes. The time taken by him to ride back both ways is:", o: ["22 minutes", "20 minutes", "18 minutes", "10 minutes"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Radha invested a certain sum on simple interest, which will amount to ₹16,200 in 3 years and to ₹17,400 in 4 years. Find the sum she invested.", o: ["₹11,400", "₹14,000", "₹12,600", "₹13,800"], a: 2, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which is the correct syntax for writing SUMIF() function in MS Excel?", o: ["SUMIF(criteria)", "SUMIF(range, criteria, [sum_range])", "SUMIF(range, criteria)", "SUMIF(range)"], a: 1, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "__________ is used to describe the page direction in which the contents of the page are to be displayed or printed in MS Word 365.", o: ["Columns", "Page margin", "Page orientation", "Page size"], a: 2, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following is used to move a selected text from one place to another in MS word 365?", o: ["Cut-Copy", "Cut-Paste", "Copy-Copy", "Copy-Paste"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which Internet access technique uses the existing cable television infrastructure to provide high-speed Internet access to users?", o: ["Cable Internet", "DSL (Digital Subscriber Line)", "Dial-up", "Fiber-optic"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which of the following is a unique identifier for each user, typically in the format of name@domain.com?", o: ["Password", "Email server", "Email address", "Email client"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following tabs in the MS Word 365, ribbon has the Spelling and Grammar option?", o: ["Review", "Layout", "Insert", "Edit"], a: 0, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which option in Microsoft Excel allows you to move the selected text or cells to a different worksheet or workbook?", o: ["Print", "Copy", "Move", "Cut"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, what is the shortcut to move to the last cell on a worksheet, to the lowest used row of the rightmost used column?", o: ["Ctrl + Home", "Shift + Home", "Ctrl + End", "Shift + End"], a: 2, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "What is the primary purpose of creating a table in Microsoft Word 365?", o: ["For enhancing the page layout and margins", "For organising and presenting information in rows and columns", "For adding decorative elements to the document", "For applying font styles and colours to text"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Where is the Help button located in MS-Word 2010?", o: ["Lower left corner", "Top left corner", "Lower right corner", "Top right corner"], a: 3, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 24 Nov 2023 Shift-3";
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
