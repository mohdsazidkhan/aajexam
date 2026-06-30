/**
 * Seed: Delhi Police Constable - 14 Nov 2023 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc14nov2023_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-14nov2023-s1';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 14 Nov 2023 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "When is Maha Shivaratri celebrated according to the Drik Panchang?", o: ["Magha, Krishna Paksha, Chaturdashi", "Ashadh, Krishna Paksha, Trayodashi", "Phalguna, Shukla Paksha, Ekadashi", "Chaitra, Shukla Paksha, Ekam"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Which of the following Indian Olympians has written the autobiography titled ‘Playing to Win’?", o: ["Abhinav Bindra", "Saina Nehwal", "Lovlina Borgohain", "Karnam Malleswari"], a: 1, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Which of the following is/are the goals of five year plans?", o: ["Growth, Modernisation, and Equity only", "Growth only", "Growth, and Abolition of intermediaries", "Growth, Modernisation, Equity and Self-reliance"], a: 3, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Which of the following cultural festivals is organised by the Uttar Pradesh tourism department?", o: ["Taj Mahotsav", "Hampi Dance Utsav", "Natyanjali Utsav", "Nishagandhi Festival"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Who among the following was the Prime Minister when the Globalisation Policy as part of ‘New Economic Policy’ was introduced?", o: ["Manmohan Singh", "PV Narasimha Rao", "Narendra Modi", "Atal Bihari Vajpayee"], a: 1, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Which Article of the Indian Constitution deals with the Governor’s assent to Bills?", o: ["Article 201", "Article 164", "Article 264", "Article 200"], a: 3, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Which part of the food is defecated?", o: ["Vitamins in food", "Glucose in food", "Nutrients in food", "Unused food"], a: 3, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Who summons each house of State Legislature to meet from time to time?", o: ["Deputy Speaker", "Chief Minister", "Governor", "Speaker"], a: 2, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Who among the following performed religious rituals for the king during the Vedic period?", o: ["Vrajpati", "Purohita", "Gramani", "Senani"], a: 1, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "National Waterways 10 (NW-10) is located in which state?", o: ["Kerala", "West Bengal", "Tamil Nadu", "Maharashtra"], a: 3, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which of the following pairs is INCORRECT?", o: ["Non-ferrous metal – Zinc", "Precious metal – Platinum", "Ferrous metal – Iron", "Non-metal – Lead"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "In which of the following years was the Rowlatt Act passed to suppress the political violence?", o: ["1919", "1915", "1921", "1924"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Ustad Allah Rakha, Sabir Khan, Pandit Kishan Maharaj and Pandit Jnan Prakash Ghosh are associated with which musical instrument?", o: ["Shehnai", "Tabla", "Mridangam", "Violin"], a: 1, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which of the given monuments is NOT located in Karnataka?", o: ["Kittur Fort", "Hoysaleswara Temple", "Gol Gumbaz", "Palakkad Fort"], a: 3, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "The Indian Parliament approved the 86th Constitutional Amendment Act of 2002, which establishes the fundamental right to elementary education for children aged ________.", o: ["5-11 years", "6-14 Years", "6-17 Years", "7-16 Years"], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "What was the name of the first dynasty that ruled over Magadh kingdom?", o: ["Haryank dynasty", "Nanda dynasty", "Mauryan dynasty", "Shishunga dynasty"], a: 0, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Through which of the following Acts does the government check restrictive trade?", o: ["FEMA Act", "Industrial Policy Act 1991", "MRTP Act", "Foreign Trade Policy"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "The ‘pawn’ is associated with which of the following games?", o: ["Cricket", "Chess", "Tennis", "Badminton"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Which of the following States hosted the fourth edition of the Khelo India Youth Games?", o: ["Telangana", "Haryana", "Karnataka", "Assam"], a: 1, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Which of the following stations receives the highest annual rainfall?", o: ["Shillong", "Chennai", "Jodhpur", "Nagpur"], a: 0, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Which country hosted the IBA Women’s World Boxing Championship-2023?", o: ["Bangladesh", "Sri Lanka", "India", "Pakistan"], a: 2, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Indian Constitution is related with right to work, to education and to public assistance in certain cases?", o: ["Article 41", "Article 44", "Article 43", "Article 42"], a: 0, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Which of the following is an example of igneous rock?", o: ["Breccia", "Chert", "Conglomerate", "Rhyolite"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Siddi Dhamal is performed in which of the following states as a dance to celebrate successful hunting activity?.", o: ["Rajasthan", "Punjab", "Haryana", "Gujarat"], a: 3, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Who among the following was the Sultan of the Delhi Sultanate when the Bahmani Kingdom was established in South India?", o: ["Ghiyasuddin Tughluq", "Muhammad Bin Tughluq", "Nasir-ud-din Mohammed Tughluq", "Firuz Shah Tughluq"], a: 1, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "It is a Fundamental Duty of parents to provide educational opportunities to wards aged ________.", o: ["7-14 years", "6-16 years", "6-14 years", "6-15 years"], a: 2, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which of the following pairs regarding the judicial powers of the Indian President and their definition is INCORRECTLY matched?", o: ["Commutation – It denotes the substitution of one form of punishment for a lighter form", "Respite – It denotes awarding a lesser sentence in place of that which was originally awarded", "Reprieve – It implies reducing the period of sentence without changing its character", "Pardon – it removes both the sentences and the conviction"], a: 2, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Which of the following is an RBI-registered NBFC- MFI that works on a Joint Liability Group lending model of Grameen?", o: ["Asirvad Microfinance Limited", "ESAF Microfinance and Investments (P) Ltd", "Fusion Microfinance Pvt Ltd", "BSS Microfinance Limited"], a: 2, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which of the following is an example of subsistence crop of Uttar Pradesh?", o: ["Jute", "Cotton", "Wheat", "Sugarcane"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Annie Besant was a Fabian socialist under the influence of _________ .", o: ["Charles Turner", "George Bernard Shaw", "Sigmund Freud", "Arthur Miller"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Ibn Battuta’s book of travels, called Rihla was originally written in:", o: ["Persian", "Prakrit", "Arabic", "Urdu"], a: 2, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Which Article of the Indian Constitution states that no citizen of India shall accept any title from any foreign State?", o: ["Article 18 (3)", "Article 18 (4)", "Article 18 (2)", "Article 18 (1)"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Anantha R Krishnan is a famous _________ player.", o: ["flute", "mridangam", "santoor", "sitar"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Prior to India, which country introduced Five-Year Plans for policy-making purposes?", o: ["Great Britain", "Germany", "The US", "The Union of Soviet Socialist Republics"], a: 3, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "The Great Bath in Mohenjo-Daro was excavated in which of the following areas?", o: ["Citadel", "Residential complex", "Lower town", "House courtyard"], a: 0, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Which of the following options is/are correct about cropland ecosystem? Statement 1. Cropland is a man-made ecosystem. Statement 2. Very less genetic diversity is found in cropland ecosystem.", o: ["Only statement 1 correct", "Both statements 1 and 2 correct", "Both statements 1 and 2 incorrect", "Only statement 2 correct"], a: 1, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Bharatanatyam has originated from which of these states?", o: ["Tamil Nadu", "Maharashtra", "Andhra Pradesh", "Telangana"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Who won India’s first medal at the Tokyo Olympics 2021?", o: ["Lovlina Borgohain", "Mirabai Chanu", "Mary Kom", "PV Sindhu"], a: 1, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a noble gas?", o: ["Argon (Ar)", "Nitrogen (N)", "Neon (Ne)", "Helium (He)"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "National income at current prices are calculated based on _________", o: ["constant prices", "future prices", "comparative prices", "prevailing prices"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Select the correct option based on the image given below.", o: ["i-b, ii-a, iii-d, iv-c", "i-d, ii-c, iii-b, iv-a", "i-a, ii-b, iii-c, iv-d", "i-c, ii-d, iii-a, iv-b"], a: 0, e: "", qimg: "14nov2023-s1-q-41.png" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "The much-loved English novel, ‘Alice’s Adventures in Wonderland’ was written by which of the following authors?", o: ["Herman Melville", "Edgar Allan Poe", "Lewis Carroll", "Mary Shelly"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Which of the following words were added in the Preamble by the Forty-second Amendment Act?", o: ["Justice, social", "Fraternity assuring dignity", "Liberty of thought", "Socialist, secular"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Identify the scheme that was launched by the Prime Minister on 8 April 2015 for providing loans upto ₹10 lakh to the non-corporate, non-farm small/micro enterprises?", o: ["Bharat Rojgar Yojana", "Pradhan Mantri Mudra Yojana", "Mahatma Gandhi National Rural Employment Guarantee Act", "Pradhan Mantri Shram Yogi Maan-dhan"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "According to the census of India 2011, which group of states and union territories from the following recorded the highest literacy rate?", o: ["Goa and Lakshadweep", "Mizoram and Delhi", "Kerala and Lakshadweep", "Kerala and Puducherry"], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Who among the following founded the Forward Bloc in 1939?", o: ["Mahatma Gandhi", "Chittaranjan Das", "Subhash Chandra Bose", "Jawaharlal Nehru"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "The Pradhan Mantri Garib Kalyan Yojana (PMGKY) was launched in the year ________.", o: ["2014", "2017", "2016", "2015"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Who among the following Bharatnatyam dancers received the prestigious Natya Kalanidhi award in 2021?", o: ["Chitra Visweswaran", "Padma Subrahmanyam", "Guru Bipin Singh", "Pandit Birju Maharaj"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Who among the following was known for creating fusion arts by adapting European theatrical techniques to Indian Classical dance combined with Indian folk and tribal dance?", o: ["Uday Shankar", "Kelucharan Mahopatra", "Vempti Chinna Satyam", "Bipin Singh"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "The great poet and humanist writer Rabindra Nath Thakur returned his knighthood in protest of which incident?", o: ["Bengal partition, 1905", "Pitt's India Act of 1784", "Kamagatamaru case, 1914", "Jallianwala Bagh Massacre, 1919"], a: 3, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14nov2023-s1-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "14nov2023-s1-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Which of the following options will replace the question mark (?) in the given series? 9000, 7200, 5760, ?, 3686.4", o: ["4600", "3860", "4608", "3456"], a: 2, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "14nov2023-s1-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14nov2023-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14nov2023-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Six numbers, 7, 8, 9, 10, 11 and 12 are written on different faces of a dice. Three positions of this dice are shown here. Find the number on the face opposite 12.", o: ["10", "9", "11", "8"], a: 2, e: "", qimg: "14nov2023-s1-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 198 * 11 * 18 * 20 * 50 * 294", o: ["÷ , ×, = , + , –", "÷ , + , ×, – , =", "÷ , ×, – , + , =", "÷ ,×, + , –, ="], a: 3, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, even if it appears to be at variance with commonly known facts, decide which of the given conclusions logically follow(s) from the statements. Statements: Some roses are lilies. Some lilies are jasmine. Conclusions: I. Some jasmines are roses. II. All jasmines are roses.", o: ["Only conclusion II follows", "Neither conclusion I nor II follows", "Both conclusions I and II follow", "Only conclusion I follows"], a: 1, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14nov2023-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["32", "24", "28", "20"], a: 2, e: "", qimg: "14nov2023-s1-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Given below is a series of figures – A, B, C and D which follow a particular pattern. Which of the given option figures should come in place of E to continue the series?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14nov2023-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third word in the same way as the second word is related to the first word. (The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word) Virus : Influenza :: Fungus : ?", o: ["Algae", "Amaltas", "Bacteria", "Aspergillosis"], a: 3, e: "", qimg: "" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the option figure that will replace the question mark (?) in the figure given below to complete the pattern.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14nov2023-s1-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fourth term in the same way as the first term is related to the second term and the fifth term is related to the sixth term. 7 : 46 :: ?: 78 :: 11 : 118", o: ["13", "11", "9", "10"], a: 2, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? KYIB, IUKF, GQMJ, ?, CIQR", o: ["HNON", "ENOM", "HMNO", "EMON"], a: 3, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below and complete the pattern.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14nov2023-s1-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at 'AB' as shown.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14nov2023-s1-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'XY' as shown below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14nov2023-s1-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 242 * 11 * 76 * 34 * 2 * 32", o: ["÷ − + × =", "÷ + −× =", "+ ÷ − = ×", "÷ + − = ×"], a: 3, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14nov2023-s1-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "C, D, E, F, M and N are sitting around a circular table facing the centre. D sits second to the right of M. F sits to the immediate left of N. N is not an immediate neighbour of M. C is not an immediate neighbour of D. Who among the following is an immediate neighbour of E?", o: ["N", "F", "D", "C"], a: 2, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the figure that will come next in the following figure series.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14nov2023-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘CALIBER’ is written as ‘ECNGDGT’ and ‘BURNING’ is written as ‘DWTLKPI’. How will ‘AUCTION’ be written in that language?", o: ["BVERQKST", "CVBTKQR", "BWDSKPR", "CWERKQP"], a: 3, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding/deleting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is NOT allowed) (40, 253, 17) (30, 187, 13)", o: ["(50, 385, 15)", "(25, 100, 15)", "(40, 240, 20)", "(17, 77, 9)"], a: 0, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "The simple interest on a sum of ₹1,500 at 5% p.a. for 3 years is:", o: ["₹192", "₹195", "₹180", "₹225"], a: 3, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper marks an article 35% above the cost price, and offers 20% discount on the marked price, what is his gain percentage?", o: ["8%", "7%", "5%", "9%"], a: 0, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the unit digit of the product of all the prime numbers between 51 and 78?", o: ["2", "3", "7", "6"], a: 2, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "If a box was sold at a loss of ₹350 for ₹4,650, then the percentage loss is equal to:", o: ["7%", "6%", "5%", "8%"], a: 0, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "The product of the LCM and HCF of two numbers is 48. The difference between the two numbers is 13. Find the numbers.", o: ["9 and 22", "6 and 19", "3 and 16", "10 and 23"], a: 2, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["35.66 cm3", "50.28 cm3", "59.82 cm3", "28.28 cm3"], a: 1, e: "", qimg: "14nov2023-s1-q-81.png" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "After a 15% decline, the income of Ajay stands at ₹2,12,500. What was his original income (in ₹)?", o: ["2,25,000", "1,80,625", "2,50,000", "2,40,000"], a: 2, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "In a 600 m race, A gave B a head start of 5 seconds and still won the race by 20 seconds. If the ratio of the speed of A to the speed of B is 2 : 1, then the speed of B is:", o: ["21 m/sec", "12 m/sec", "10 m/sec", "18 m/sec"], a: 1, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "There are 50 students in a class. The average marks of 20 students is 70 and the remaining 30 have average marks of 80. Calculate the average score of the whole class.", o: ["70", "75", "76", "74"], a: 2, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "A man borrowed a sum of money and agreed to pay off by paying ₹4,200 at the end of the first year and ₹4,410 at the end of the second year. If the rate of compound interest was 5% per annum, find the sum borrowed.", o: ["₹7,500", "₹7,000", "₹8,500", "₹8,000"], a: 3, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "By what percentage should a woman increase the speed of her car to reduce the time by 80% to cover a fixed distance?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14nov2023-s1-q-86.png" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "A, B, C work one after the other in that order. Each can finish a work individually in 10, 16, 12 days, respectively. After working for 3 such cycles ABC, ABC, ABC, then A and C leave the work. B alone will complete the rest of the work in:", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14nov2023-s1-q-87.png" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14nov2023-s1-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "Which of the following is a pair of co-primes?", o: ["(7, 35)", "(217, 651)", "(32, 62)", "(198, 175)"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "14nov2023-s1-q-90.png" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "In MS-Word 2010, Page number option comes under which of the following menus?", o: ["Pages", "Header and Footer", "Home Tab", "Page layout"], a: 1, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365,when entering data into an MS Excel 365 spreadsheet, which data type is most suitable for a person's first name?", o: ["Date", "Currency", "Text", "Number"], a: 2, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which option allows you to adjust the line spacing between lines of text in a paragraph in MS-Word 365?", o: ["Line Spacing", "Text Indentation", "Paragraph Border", "Paragraph Alignment"], a: 0, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "What is the default print range in Microsoft Excel 365, when printing an entire worksheet?", o: ["Entire Workbook", "Active Sheet", "Selected Range", "All Sheets"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, you are working on an Excel worksheet and need to select an entire row above the current row. Which keyboard shortcut combination should you use?", o: ["Ctrl + Spacebar", "Shift + Spacebar", "Alt + Spacebar", "Ctrl + +"], a: 1, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a layer of the Internet Protocol Suite (TCP/IP)?", o: ["Application layer", "Physical layer", "Network layer", "Transport layer"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "In MS Word 365, what happens when you select text and then press the ‘Backspace’ key?", o: ["The text is moved to the end of the document", "The text is formatted with a bold style", "The text is copied to the clipboard", "The text is deleted to the left of the cursor"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following operations is done using shortcut key Ctrl + Shift + > in MS Word 365?", o: ["Increase the font size", "Decrease the font size", "Left Alignment of text", "Right Alignment of text"], a: 0, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which formatting feature in MS Word 365, is used to emphasise text by making it bold, italic or underlined in documents?", o: ["Hyperlinking", "Page margins", "Font styling", "Text wrapping"], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "An attachment in an E-mail can be: 1) Digital photos 2) Documents", o: ["Only (2)", "Only (1)", "Both (1) and (2)", "Neither (1) nor (2)"], a: 2, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 14 Nov 2023 Shift-1";
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
