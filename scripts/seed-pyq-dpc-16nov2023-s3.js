/**
 * Seed: Delhi Police Constable - 16 Nov 2023 Shift-3
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc16nov2023_s3');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-16nov2023-s3';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 16 Nov 2023 Shift-3"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Which of the following was opened by Gour Mohan Addy in 1829?", o: ["Hindi Seminary", "Anglo-India Seminary", "Anglo-Indian School", "Oriental Seminary"], a: 3, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "In which pair of states is Holi also celebrated as Dola Purnima?", o: ["West Bengal and Odisha", "Rajasthan and Punjab", "Nagaland and Sikkim", "Maharashtra and Gujarat"], a: 0, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Which political party was in power when Sardar Swaran Singh Committee made recommendations about Fundamental Duties?", o: ["Indian National Congress", "Bharatiya Janata Party", "Janata Dal", "Communist Party of India"], a: 0, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Which Article of the Indian Constitution is related with promotion of co-operative societies?", o: ["Article 31 B", "Article 51 A", "Article 43 B", "Article 39 A"], a: 2, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "The Indian government launched the ‘Garib Kalyan Rojgar Abhiyaan’ (‘GKRA’) on 20th June 2020 to provide work for how many days?", o: ["125 days", "130 days", "115 days", "120 days"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "In 2016, Yamini Krishnamurthy received the Padma Vibhushan for her contribution to which fields of classical dance?", o: ["Bharatanatyam and Kathak", "Bharatanatyam and Manipuri", "Bharatanatyam and Odissi", "Bharatanatyam and Kuchipudi"], a: 3, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "शतरंज में उपयोग होने वाले सफेद हाथियों (rooks) की संख्या ________ होती है।", o: ["तीन", "एक", "दो", "चार"], a: 2, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "As per Human Development Report 2021-22, what is the female Life Expectancy at birth in India?", o: ["63.9 years", "68.9 years", "73.9 years", "65.9 years"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "जब लावा, भूमि में विकसित दरारें और विदरों से अपना रास्ता बनाता है, तो यह जमीन के लगभग लंबवत जम जाता है। यह दीवार जैसी संरचना को विकसित करने के लिए उसी स्थिति में ठंडा हो जाता है। इस संरचना को क्या कहा जाता है?", o: ["लैकोलिथ (Lacolith)", "डाइक्स (Dykes)", "लापोलिथ (Lapolith)", "फैकोलिथ (Phacolith)"], a: 1, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT found in animal cells?", o: ["Endoplasmic reticulum", "Mitochondria", "Plastid", "Golgi Complex"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Ustad Latafat Hussain Khan is associated with the ________.", o: ["Patiala gharana", "Agra gharana", "Kirana gharana", "Gwalior gharana"], a: 1, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Which of the following Articles deals with the amendment of the Indian Constitution?", o: ["Article 360", "Article 352", "Article 356", "Article 368"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Which canal has a head regulator capacity of 1133 cumecs (40000 cusecs) and a length of 532 km for which it is considered the world's largest lined irrigation canal?", o: ["Trivandrum-Shoranur canal", "Kalingarayan Canal", "Cumbarjua Canal", "Narmada Main Canal"], a: 3, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which of the following statements is NOT true about the two-sector model?", o: ["There is no foreign sector", "The government sector plays an important role.", "The economy is considered to be closed.", "Firms are the only producing sector in the economy."], a: 1, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Which concept is related to the disposal of the equity of public sector units in the market for covering the fiscal deficit of the central government?", o: ["Liberalisation", "Denationalisation", "Disinvestment", "Globalisation"], a: 2, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Article 51 of Directive Principles of State Policy enumerates which of the following?", o: ["Promotion of international peace and security", "Separation of judiciary from executive", "Uniform civil code for the citizens", "Organisation of agricultural and animal husbandry"], a: 0, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Which species plays a keystone role in supporting insectivore populations with a year- round available food resource?", o: ["Cycas species", "Ficus species", "Meliaceae species", "Ziziphus species"], a: 1, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Which produce was available as a surplus marketed by the farmers in the market during the Green Revolution?", o: ["Oil seeds", "Wheat and jowar", "Wheat and rice", "Rice and maize"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Sunayana Hazarilal won the Padma Shri for which form of classical dance?", o: ["Kathakali", "Odissi", "Kathak", "Bharatanatyam"], a: 2, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "In which state of India was the first train introduced in the year 1853?", o: ["Rajasthan", "West Bengal", "Karnataka", "Maharashtra"], a: 3, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Who issued the silver rupee, which remained a standard coin for centuries after the ruler?", o: ["Babur", "Sher Shah Suri", "Humayun", "Akbar"], a: 1, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Seema switched on an electric circuit and went away to drink some water. She came back after 2 minutes and noticed that the circuit had 2.5 A of current flowing through it. The net charge that had flown through the circuit is:", o: ["1.25 C", "5 C", "300 C", "0.0833 C"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "In which year was Volleyball Federation of India established?", o: ["1948", "1949", "1950", "1951"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Identify the artist who is NOT related to the Carnatic music family.", o: ["TS Vinayakram", "Aruna Sairam", "Begum Akhtar", "MS Subbulakshmi"], a: 2, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Imperfect’ is the autobiography of which Indian cricketer?", o: ["Sanjay Manjrekar", "Kapil Dev", "Sunil Gavaskar", "Ravi Shastri"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Who among the following was re-elected in 1938 as the president of the Indian National Congress session for 1939?", o: ["Satyendra Prasanna Sinha", "Subhash Chandra Bose", "Lal Mohan Ghosh", "Pattabhi Sittaramayya"], a: 1, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which of the following were the two major internal land routes through which trade and commerce took place in the post-Mauryan period?", o: ["Pashchimpatha and Uttarapatha", "Uttarapatha and Dakshinapatha", "Dakshinapatha and Purvapatha", "Dakshinapatha and Pashchimpatha"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Tariffs and quotas in the trade issues are used to ____________.", o: ["protect domestic companies", "promote free trade between countries", "protect only the public sector", "protect only the private sector"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "When is the festival of Ram Navami celebrated in India?", o: ["Ninth day of Ashwin month", "Ninth day of Pausha month", "Ninth day of Magha month", "Ninth day of Chaitra month"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Which Viceroy of India took initiative in creating local government bodies in India?", o: ["Lord Harding II", "Lord Mayo", "Lord Rippon", "Lord Minto"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "The originator of Buddhism, Gautam Buddha, was the prince of which of the following republican states during the Mahajanapada period in Ancient India?", o: ["Kamboja", "Shakya", "Kuru", "Vajji"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Which of the following temples is built in the hoyasala architectural style?", o: ["Kesava Temple", "Ladkhan Temple", "Konark temple", "Khajuraho Temple"], a: 0, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "From which of the following states/union territories does the Yamuna River originate?", o: ["Uttar Pradesh", "Uttarakhand", "Jammu and Kashmir", "Himachal Pradesh"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following methods can be used for liberalisation?", o: ["Increase in taxes", "Abolishing licensing requirement in most industries", "Making procedures for imports and exports tough", "Restrictions in fixing the prices of goods and services"], a: 1, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Playing It My Way: My Autobiography, is the book written by whom among the following cricketers?", o: ["Kapil Dev", "Rahul Dravid", "Virat Kohli", "Sachin Tendulkar"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Dr. Atmaram Pandurang and Justice Ranade founded the ________ in Maharashtra espousing principles of enlightenment based on Vedas.", o: ["Prarthana Samaj", "Bharat Dharma Mahamandal", "Brahmo Samaj", "Arya Samaj"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Which Indian dance form has the Mahari dance style?", o: ["Kathak", "Kathakali", "Odissi", "Mohiniyattam"], a: 2, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which Article allows the Council of Ministers to aid and advise the President?", o: ["Article 70", "Article 52", "Article 61", "Article 74"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "The Brahmo Samaj, which promotes the principal of social equality, was founded by ________.", o: ["Raja Ram Mohan Roy", "Debendranath Tagore", "Swami Vivekananda", "Swami Dayanand"], a: 0, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which portal was launched by SIDBI to improve accessibility of credit and handholding services to MSMEs?", o: ["Samadhan", "Udyami Mitra", "MSME Champions", "Sampark"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "In which year was the Malegam Committee appointed to study issues and concerns of the Micro Finance Sector?", o: ["2010", "2018", "2015", "2005"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Identify the southernmost major port of India.", o: ["Mangaluru", "Kochi", "Tuticorin", "Chennai"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "_________ has a curving shape, a feature found in Nagara architecture.", o: ["Shikhara", "Antarala", "Mandapa", "Kutina"], a: 0, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "The Hunta dance of Jharkhand is associated with which tribal community?", o: ["Oraon", "Munda", "Santhal", "Kol"], a: 2, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Who was the author of the famous work ‘Shishupala Vadha’?", o: ["Jayadeva", "Bhatti", "Bharavi", "Magha"], a: 3, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which of the following countries won the highest number of Kabaddi World Cups, as of 2022?", o: ["Bangladesh", "India", "Pakistan", "Iran"], a: 1, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "The Annapurna Scheme was launched by the Government of India in the year ________ for providing food security.", o: ["2002", "2000", "2001", "2003"], a: 1, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "In which of the following years was the first edition of the Indian Super League (ISL) held?", o: ["2016", "2013", "2014", "2015"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Who described India as a ‘Quasi-Federation’?", o: ["KC Wheare", "KM Munshi", "Harold Joseph Laski", "Ivor Jennings"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Which of the given statements about Vitamin A are correct? Statement A: Beta-carotene is a precursor to Vitamin A. Statement B: Leafy green vegetables and yellow fruits are good sources of Vitamin A.", o: ["Only Statement B", "Only Statement A", "Both Statements A and B", "Neither Statement A nor B"], a: 2, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "16nov2023-s3-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "A cube (dice) has six different numbers drawn over its six faces. Three different positions of this cube are shown in the given figure. Which number is on the face opposite to ‘1’?", o: ["4", "2", "6", "3"], a: 1, e: "", qimg: "16nov2023-s3-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "16nov2023-s3-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Choose the dice from the given options that is similar to the dice formed from the given sheet of paper (X).", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "16nov2023-s3-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Which of the following letter clusters will replace the question mark (?) in the given series to make it logically complete? DSB, GVY, JYV, MBS, ?", o: ["PEP", "PDP", "PEO", "PEQ"], a: 0, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Six numbers, 1, 2, 3, 4, 5 and 6, are written on the different faces of a dice. Three different positions of the same dice are shown (Figures 1-3). Find the number on the face opposite to the face showing ‘4’.", o: ["1", "2", "3", "5"], a: 3, e: "", qimg: "16nov2023-s3-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding /deleting /multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed.) (33, 11, 66) (45, 15, 90)", o: ["(51, 19, 102)", "(51, 17, 104)", "(51, 17, 102)", "(53, 19, 102)"], a: 2, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Six numbers, 1, 2, 3, 4, 5 and 6, are written on the different faces of a dice. Two positions of this dice are shown in the given figure. Find the number on the face opposite to 5.", o: ["3", "1", "2", "6"], a: 0, e: "", qimg: "16nov2023-s3-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. LINK : NKPM :: PART : RCTV :: PATH : ?", o: ["RCWJ", "RBVK", "NCVK", "RCVJ"], a: 3, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given expression. 72 * 5 * 7 * 64 * 8 * 45", o: ["+, ×, –, ÷, =", "÷, +, ×, –, =", "–, ÷, +, ×, =", "–, ×, +, ÷, ="], a: 3, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the number from the given options that can replace the question mark (?) in the following series. 24, 21, 16, 13, 8, ?", o: ["2", "5", "7", "3"], a: 1, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "16nov2023-s3-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "16nov2023-s3-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the option figure which is embedded in the given figure as its part (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "16nov2023-s3-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "H, I, J, K and L are five people sitting in a straight line facing North. I sits exactly between J and K. K sits to the immediate left of H. L sits at the extreme right end. Who sits at the extreme left end?", o: ["J", "I", "H", "K"], a: 0, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fourth number in the same way as the first number is related to the second number and the fifth number is related to the sixth number. 7586 : 8943 :: ? : 6749 :: 8405 : 9762", o: ["5412", "5392", "5586", "6321"], a: 1, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Six numbers, 1, 2, 3, 4, 5 and 6 are written on different faces of a dice. Three positions of this dice are shown in here. Find the number on the face opposite 6.", o: ["5", "4", "3", "1"], a: 3, e: "", qimg: "16nov2023-s3-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Given below is a series of figures – A, B, C and D which follow a particular pattern. Which of the given option figures should come in place of E to continue the series?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "16nov2023-s3-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘live long’ is coded as ‘east west’, ‘long pole’ is coded as ‘east south’, ‘star wars’ is coded as ‘ward four’, and ‘pole star’ is coded as ‘south ward’. What is the code for the word ‘wars’?", o: ["long", "ward", "four", "pole"], a: 2, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance from commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: Some Witches are Humans. All Humans are Cold. Conclusions: I. All Witches are Cold. II. Some Witches are Cold.", o: ["Neither conclusion I nor II follows.", "Both conclusions I and II follow.", "Only conclusion I follows.", "Only conclusion II follows."], a: 3, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "16nov2023-s3-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given expression. 96 * 12 * 15 * 7 * 36 * 77", o: ["–, ÷, +, ×, =", "–, ×, +, ÷, =", "÷, +, ×, –, =", "+, ×, –, ÷, ="], a: 2, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "16nov2023-s3-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "16nov2023-s3-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["19", "12", "15", "10"], a: 0, e: "", qimg: "16nov2023-s3-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A dishonest financier claims to be lending money at simple interest, but he includes the interest every four months for calculating the principal. If he is charging an interest of 3%, the effective rate of interest becomes:", o: ["3.01%", "2.01%", "3.03%", "2.06%"], a: 2, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "If the average of 6, 7, 12, (x - 1) and 10 is 10, then the value of x is:", o: ["14", "12", "15", "16"], a: 3, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["11 : 25", "49 : 16", "49 : 76", "25 : 76"], a: 2, e: "", qimg: "16nov2023-s3-q-78.png" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Let a and b be two numbers such that a and b - a are co-primes and b and b + a are co- primes, respectively. Which of the followings is true?", o: ["a and b are not co-prime", "b is prime", "a is prime", "a and b are co-prime"], a: 3, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "P invested a certain amount in shares. The shares rose successively by 20% and 30% on two consecutive days and fell by 25% and 11% in the next two days. What is the percentage increase or decrease in the value of the shares in four days?", o: ["Increase of 3.62%", "Increase of 4.13%", "Decrease of 4.13%", "Decrease of 3.62%"], a: 1, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the number between 2800 and 3000, which when divided by 24, 32 and 45, leaves no remainder?", o: ["2960", "2920", "2840", "2880"], a: 3, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "16nov2023-s3-q-82.png" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "If Anand can do a piece of work in 9 days and Vinod can complete the same work in 6 days, then in how many days will both of them complete it together?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "16nov2023-s3-q-83.png" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Vishy needs to paint the surfaces of three different spherical balls, having radii of 30 cm, 40 cm, and 50 cm, respectively. If the cost of paint needed to paint π cm2 is given as ₹0.60, what will be the total cost (in ₹) of the quantity of paint required to paint the surfaces of all the three balls mentioned above?", o: ["11700", "12000", "11400", "12600"], a: 1, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["16", "18", "72", "30"], a: 3, e: "", qimg: "16nov2023-s3-q-85.png" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["5.44%", "7.44%", "8.44%", "6.44%"], a: 2, e: "", qimg: "16nov2023-s3-q-86.png" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "If the circumference of the great circle of a hemisphere is 9 π cm, then find the total surface area of the hemisphere?", o: ["54.85 π cm2", "60.75 π cm2", "62.35 π cm2", "50.65 π cm2"], a: 1, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "The difference between the compound interest and the simple interest on ₹80,000 at the same rate of interest per annum for 2 years is ₹98. What is the rate of interest per annum?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "16nov2023-s3-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "A machine is sold for ₹4,800 at a gain of 20%. What would have been the gain or loss percentage if it had been sold for ₹4,500?", o: ["25% gain", "25% loss", "12.5% gain", "12.5% loss"], a: 2, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "A train covers a distance of 54 km from station A to station G in an hour via stations B, C, D, E and F. On each station, the train stops for 72 seconds. What is the speed of the train in km/h?", o: ["64", "62", "58", "60"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following options can be used when we need to retype the same text as it reduces time and effort in MS Word 365?", o: ["Replace", "Find", "Copy", "Cut"], a: 2, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which alignment option in Microsoft Excel is used to align the text to both the left and right sides of the cell, creating a neat and justified appearance?", o: ["Right Align", "Justify", "Centre Align", "Left Align"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following fields tells the recipient what the message is about?", o: ["Date", "To", "Subject", "Signature"], a: 2, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "In MS word 365, What does the ‘Number of Copies’ option in the Print Settings dialog allow you to do?", o: ["Specify how many copies of the document to print", "Choose the paper size", "Adjust the font size", "Specify the number of pages to print"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In MS word 365, what is the keyboard shortcut to copy selected text in most applications?", o: ["Ctrl + X", "Ctrl + Z", "Ctrl + C", "Ctrl + V"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a text alignment in MS-Word 365?", o: ["Align Text Middle", "Align Text Center", "Align Text Right", "Align Text Justify"], a: 0, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365 what does the ‘Save As’ option allow you to do that the regular ‘Save’ option does not?", o: ["Save the workbook with a new name or location", "Save the workbook without any changes", "Save the workbook with the same name", "Save the workbook without confirmation"], a: 0, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "एमएस वर्ड 365 (MS Word 365) में, पेज सेटअप समूह में ब्रेक के बाद टेक्स्ट को नए पेज या डॉक्यूमेंट पर शुरू करने के लिए फोर्स करने हेतु निम्नलिखित में से किसका उपयोग किया जाता है?", o: ["पेज ब्रेक (Page Break)", "पेज साइज (Page Size)", "पेज मार्जिन (Page Margins)", "ओरिएंटेशन Orientation)"], a: 0, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "The term 'ISP' stands for __________, in the context of internet architecture.", o: ["Internet Service Protocol", "International Service Provider", "Intranet Service Provider", "Internet Service Provider"], a: 3, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following is the correct combination of a column letter and a row number that identifies a cell on a worksheet in MS Excel?", o: ["33", "AA", "A3", "3A"], a: 2, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 16 Nov 2023 Shift-3";
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
