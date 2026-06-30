/**
 * Seed: Delhi Police Constable - 22 Nov 2023 Shift-3
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc22nov2023_s3');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-22nov2023-s3';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 22 Nov 2023 Shift-3"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "The National Rice Research Institute is located at ________ in Odisha.", o: ["Cuttack", "Puri", "Sambalpur", "Koraput"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "In how many phases was the 2011 Census conducted in India?", o: ["One", "Four", "Two", "Three"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "_______ means avoiding imports of goods which could be produced in India.", o: ["Economic growth", "Modernisation", "Self-reliance", "Equity"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "In plants, which hormone helps the cells to grow longer?", o: ["Cytokinin", "Jasmonate", "Ethylene", "Auxin"], a: 3, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "What are the compounds in food that induce the growth or activity of beneficial gut microorganisms called?", o: ["Abiotic", "Postbiotics", "Prebiotics", "Antibiotics"], a: 2, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Which of the following social reform organisations was established in Madras in 1864?", o: ["The Veda Samaj", "The Arya Samaj", "The Brahmo Samaj", "The Prarthana Samaj"], a: 0, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "मुद्रा की छपाई के माध्यम से केंद्रीय बैंक द्वारा जुटाए गए राजस्व को ________ कहा जाता है।", o: ["राजकोषीय बैलेंस (Fiscal Balance)", "लाभ (Profit)", "टंकण प्रलाभ (Seigniorage)", "खजाना (Treasury)"], a: 2, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "जब कई राजनीतिक पार्टियाँ एक आम सहमति कार्यक्रम के एजेंडे के आधार पर सरकार बनाने और राजनीतिक शक्ति का प्रयोग करने के लिए हाथ मिलाती हैं, तो इसे क्या कहा जाता है?", o: ["गठबंधन सरकार", "बहुमत दल की सरकार", "राष्ट्रपति सरकार", "एकदलीय प्रणाली"], a: 0, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Who among the following Bharatanatyam and Kuchipudi dancers received the Padma Vibhushan award in the year 2016?", o: ["Alarmel Valli", "Padma Subrahmanyam", "Aparna Satheesan", "Yamini Krishnanamurthi"], a: 3, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Who among the following was the founder and director of Darpana Academy of Performing Arts?", o: ["Mrinalini Sarabhai", "Kumari Kamala", "Yamini Krishnamurthy", "Rukmini Devi Arundel"], a: 0, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Who among the following fought the Mughal emperor Babur in 1527 at Khanwa?", o: ["Rana Amar Singh", "Rana Pratap", "Rana Sanga", "Rana Raj Singh"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Sheema Kermani is associated with which of these dance forms?", o: ["Bharatanatyam", "Kathakali", "Mohiniyattam", "Sattriya"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "In which of the following years did the peasant movement in Bardoli take place?", o: ["1918", "1928", "1916", "1934"], a: 1, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "In which of the following years was the SFURTI scheme launched by the Ministry of Micro Small and Medium Enterprises?", o: ["2005", "2003", "2009", "2007"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "In an ecosystem, which of the following is/are autotrophs?", o: ["Fishes", "Earthworms", "Sunlight", "Plants"], a: 3, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Constitution of India deals with the National Commission for Scheduled Castes?", o: ["Article 338", "Article 335", "Article 336", "Article 337"], a: 0, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Which of the following international organisations was founded in 1995?", o: ["International Labour Organization", "International Monetary Fund", "World Trade Organization", "World Bank"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "When is Guru Nanak Jayanti celebrated in India as per the Hindu lunar calendar?", o: ["Kartika Poornima", "Paush Poornima", "Paush Amavasya", "Kartika Amavasya"], a: 0, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Who among the following is NOT a shehnai player?", o: ["N Ramani", "Krishna Ram Chaudhary", "Ali Ahmad Hussain", "Bismillah Khan"], a: 0, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "महादेश रचना संबंधी (epeirogenic) प्रक्रिया क्या है?", o: ["इसमें भूपर्पटी पट्टिका का क्षैतिज संचलन शामिल है।", "इसमें जल का अपेक्षाकृत अल्प संचलन शामिल है।", "इसमें चट्टानों का अपेक्षाकृत अल्प संचलन शामिल है।", "इसमें भू-पर्पटी के बड़े हिस्से का उत्थान या आवलन शामिल है।"], a: 3, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "The English novel ‘Heart of Darkness’ was written by which of the following authors?", o: ["Herman Melville", "Joseph Conrad", "Charles Dickens", "Edgar Allen Poe"], a: 1, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which of the following pairs of cities is connected by Sher-Shah Suri Marg?", o: ["Mumbai-Bengaluru", "Delhi-Amritsar", "Delhi-Jaipur", "Delhi-Mumbai"], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "‘Aamar Jiban’, is the autobiography written by an Indian woman. Who was she?", o: ["Sarojini Naidu", "Rassundari Devi", "Sucheta Kriplani", "Annie Besant"], a: 1, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Two compounds with the same molecular formula but different structures are known as:", o: ["structural isomers", "isotopes", "valencies", "allotropes"], a: 0, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Community Development Programme was under the __________ Five-Year Plan in India.", o: ["Third", "Fourth", "Second", "First"], a: 3, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Which of the following countries never hosted the Asian Games till 2022?", o: ["Pakistan", "South Korea", "China", "Japan"], a: 0, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which of the following writs are issued only against judicial and quasi-judicial bodies?", o: ["Mandamus and Certiorari", "Prohibition and Certiorari", "Habeas Corpus and Mandamus", "Prohibition and Quo-Warranto"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "What was the subject under investigation for setting up the Hunter commission in 1882?", o: ["Famine", "Agriculture", "Industry", "Education"], a: 3, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Pandit Birju Maharaj was a legendary _________ dancer, who opened his dance school ‘Kalashram’ in New Delhi.", o: ["Kathak", "Odissi", "Bharatanatyam", "Kathakali"], a: 0, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Who among the following Muslim social reformers propagated his ideas through a magazine ‘Tahdib-ul-Akhlaq’?", o: ["Muhammad Qasim", "Rashid Ahmad", "Ghulam Ahmed", "Syed Ahmed Khan"], a: 3, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Which are the most explosive of the earth’s volcanoes?", o: ["Caldera", "Composite", "Mid ocean ridge", "Flood basalt"], a: 0, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "KV Prasad, SV Rajarao, Umalayapuram Sivaraman, Palghat Mani Iyer, Karaikudi R Mani and Palghat Raghu are noted players of which of the following instruments?", o: ["Pakhawaj", "Sarangi", "Ghatam", "Mridangam"], a: 3, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "How many types of writs can be issued to protect the Fundamental Rights?", o: ["2", "4", "3", "5"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "The Charminar in Hyderabad is a _________ shaped massive structure with four minarets.", o: ["square", "dome", "cylindrical", "rectangular"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Chandragupta II got his daughter married into which of the following dynasties?", o: ["Vakataka dynasty", "Naga dynasty", "Shunga dynasty", "Pushyabhuti dynasty"], a: 0, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "How many fundamental duties were added in the Indian Constitution in 1976?", o: ["8", "9", "11", "10"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Consider the following statements with respect to the limitations of the barter exchange system. (i) Lack of standard of deferred payment (ii) Sufficient double coincidence of wants (iii) Lack of store of value Choose the correct answer.", o: ["Only (iii) is true", "Only (ii) is true", "Only (i) is true", "Both (i) and (iii) are true"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "भारत के संविधान के निम्नलिखित में से किस प्रावधान के लिए संसद के विशेष बहुमत और राज्योंों की सहमति की आवश्यकता होती है?", o: ["विधान परिषदों के उन्मूलन और निर्माण", "संसद में कोरम", "राज्य के नीति निर्देशक सिद्धांांत", "राष्ट्रपति के चुनाव"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Which of the following countries will host the ICC T20 Men’s Cricket World Cup 2024?", o: ["West Indies and Canada", "West Indies and USA", "Australia and New Zealand", "India and Sri Lanka"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "'मानसून (monsoon)' शब्द की व्युत्पत्ति अरबी शब्द 'मौसिम (Mausim)' से हुई है, यह निम्नलिखित में से किसके समतुल्य है?", o: ["वर्षा (Rain)", "तूफ़ान (Storm)", "मौसम (Season)", "पवन (Wind)"], a: 2, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Which of the following churches is NOT located in Goa?", o: ["Reis Magos Church", "Mae De Deus Church", "Santa Cruz Basilica", "Basilica of Bom Jesus"], a: 2, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Which of the following is a violation of the 7th fundamental duty related to the environment and wildlife?", o: ["Trafficking of wildlife animals", "Work for the betterment of the wildlife", "To prohibit exploitation of protected species", "Avoid pollution of water"], a: 0, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Who among the following Russian political leaders visited India as part of Republic Day celebrations in the year 2007?", o: ["Dmitry Medvedev", "Boris Yeltsin", "Vladimir Putin", "Mikhail Mishustin"], a: 2, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Which of the following organisations was given statutory power in 1992?", o: ["LIC", "IRDA", "SEBI", "RBI"], a: 2, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "On the basis of Total Population (2011), arrange the following states in descending order? A) West Bengal B)Maharashtra C) Bihar", o: ["A, C, B", "B, A, C", "A, B, C", "B, C, A"], a: 3, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which of the following universities stood first at the Khelo India University Games- 2021?", o: ["Jain University", "University of Mumbai", "University of Kerala", "Jawaharlal Nehru University"], a: 0, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "In the seventeenth century, Peter Mundy, a foreign traveller from __________ visited India.", o: ["France", "Italy", "Germany", "England"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Who launched the official jersey of the fourth Khelo India Youth Games?", o: ["Anurag Thakur", "Amit Shah", "Narendra Modi", "Nisith Pramanik"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "‘Below the Poverty Line’ Census was done in the year _____ for the Eighth Five Year Plan.", o: ["1989", "1993", "1990", "1992"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Aryabhatta is believed to be one of the greatest astronomers of the:", o: ["Mauryan Period", "Gupta period", "Pallava period", "Vardhan Period"], a: 1, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "22nov2023-s3-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "22nov2023-s3-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. FREE : EPBA :: MORE : LMOA :: BURN : ?", o: ["AROJ", "ASPK", "ASOJ", "ASOK"], a: 2, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 40 : 9 :: 100 : ? :: 50 : 11", o: ["42", "21", "51", "20"], a: 1, e: "", qimg: "" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Find out the figure amongst the four option in which figure X is embedded (Rotation is not allowed)", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "22nov2023-s3-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the option that is embedded in the given figure (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "22nov2023-s3-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "A square transparent sheet with a pattern is shown in the given figure. Find out from amongst the following options, as to how the pattern would appear when the transparent sheet is folded at the dotted line.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "22nov2023-s3-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct? 87 × 2 − 80 ÷ 8 + 160 = 4", o: ["+ and −", "+ and =", "+ and ×", "+ and ÷"], a: 1, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the option figure which is embedded in the given figure (X) as its part. (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "22nov2023-s3-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "22nov2023-s3-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, even if it appears to be at variance with commonly known facts, decide which of the given conclusions logically follow(s) from the statements. Statements: Some trees are rivers. Some rivers are mountains. Conclusions: I. Some mountains are trees. II. All mountains are trees.", o: ["Only conclusion II follows", "Only conclusion I follows", "Neither conclusion I nor II follows", "Both conclusions I and II follow"], a: 2, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the number from the given options that can replace the question mark (?) in the following series. 1, 2, 8, 48, 384, ?", o: ["3456", "4280", "3840", "4608"], a: 2, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘STAY’ is written as ‘65’ and ‘COME’ is written as ‘36’. How will ‘LIST’ be written in that language?", o: ["46", "56", "60", "66"], a: 2, e: "", qimg: "" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "22nov2023-s3-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "22nov2023-s3-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["16", "12", "20", "10"], a: 0, e: "", qimg: "22nov2023-s3-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Six letters S, T, M, P, H and Q are written on different faces of a dice. Two positions of this dice are shown in the figure. Find the letter on the face opposite to P.", o: ["S", "M", "T", "H"], a: 3, e: "", qimg: "22nov2023-s3-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "22nov2023-s3-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Six numbers, 7, 8, 9, 10, 11 and 12 are written on different faces of a dice. Three positions of this dice are shown here. Find the number on the face opposite 7.", o: ["9", "11", "10", "8"], a: 0, e: "", qimg: "22nov2023-s3-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "22nov2023-s3-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding/subtracting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed.) (84, 73, 157) (96, 88, 184)", o: ["(89, 62, 151)", "(88, 79, 191)", "(99, 71, 160)", "(92, 75, 147)"], a: 0, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Six students are sitting around a circular table facing the centre. Kalki is an immediate neighbour of both Oorja and Namita. Leela is sitting second to the left of Oorja. Padma is sitting second to the right of Kalki. Madhuri is sitting third to the right of Namita. Who is an immediate neighbour of both Kalki and Padma?", o: ["Namita", "Leela", "Oorja", "Madhuri"], a: 0, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? CVHT, FSJR, IPLP, ?, OJPL", o: ["MLNM", "LNMN", "LMNN", "KMNM"], a: 2, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["÷ and ×", "× and −", "+ and −", "+ and ×"], a: 1, e: "", qimg: "22nov2023-s3-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "22nov2023-s3-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "Three metallic spheres are of the radius 6 cm, 8 cm and 10 cm, respectively. If they are melted to form a single solid sphere, then the radius of the resulting sphere is:", o: ["48 cm", "24 cm", "12 cm", "36 cm"], a: 2, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "Akash can finish a work in 18 days, while Navin can finish the same work in 36 days. If they work together to finish the work, find the portion of the work done by Navin.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "22nov2023-s3-q-77.png" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "A student misread the number 97 as 79 while doing a calculation. Find the percentage increase or decrease in his calculation.", o: ["19% decrease", "19.55 % increase", "18.55% decrease", "18% decrease"], a: 2, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Susan sold her used mobile phone for ₹4,800 and felt that she incurred a loss of 20%. To earn a profit of 12%, at what price should it have been sold (in ₹)?", o: ["6,000", "6,520", "6,720", "6,780"], a: 2, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "The population of a village increases by 3% per year. If the current population is 75,556, then find the population of the village after 3 years (neglect the decimal part).", o: ["82562", "82563", "82526", "85262"], a: 0, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "The annual salary of Aprajita is 150% of Sonia’s annual salary. Sonia’s salary rises by 20% after an increment, whereas Aprajita’s salary increases by 12%. If the initial salary of Sonia was ₹6,00,000, then what is the salary of Aprajita (in ₹) now after a hike?", o: ["10,08,000", "9,00,000", "1,08,000", "7,20,000"], a: 0, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "The HCF of two numbers is 33 and their sum is 594. Find the total number of such possible pairs of numbers.", o: ["5", "3", "2", "4"], a: 1, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "The largest 3-digit prime number is:", o: ["987", "997", "983", "991"], a: 1, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "The marked price of an LED is ₹9,000. The shopkeeper allows a discount of 25% and gains 8%. If no discount is allowed, his gain percentage will be:", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "22nov2023-s3-q-84.png" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "22nov2023-s3-q-85.png" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "If P ∶ (Q + R) = 2 ∶ 5 and R ∶ (P + Q) = 6 ∶ 7, then find the value of Q ∶(P + R) .", o: ["23 : 59", "23 : 37", "23 : 68", "23 : 29"], a: 2, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["79.0175", "79.185", "79.085", "79.175"], a: 3, e: "", qimg: "22nov2023-s3-q-87.png" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["₹1,10,500", "₹69,600", "₹75,000", "₹1,08,750"], a: 0, e: "", qimg: "22nov2023-s3-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "A boat having a speed of 30 km/h in still water goes 60 km downstream and comes back in 4 hours 30 minutes. The speed of the stream is:", o: ["20 km/h", "10 km/h", "30 km/h", "25 km/h"], a: 1, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "In 5 subjects of 100 marks each, a student gets an average of 62 marks and his average in the first four subjects is 5 less than the marks in the fifth subject. How many marks does he get in the fifth subject?", o: ["66", "64", "65", "63"], a: 0, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365 which of the following will be used to print a spreadsheet?", o: ["Home -> open", "File -> print", "View -> print", "Layout -> print"], a: 1, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following is a type of network that allows users from outside to access the Intranet of an organisation?", o: ["Internet", "Double Intranet", "Externet", "Extranet"], a: 3, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following functions is executed if shortcut key Ctrl + I is used in MS Word 365?", o: ["Make the text italic", "Strike through the text", "Bold the text", "Underline the text"], a: 0, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Autocorrect function may be used in MS Word 365, for grammar and spell-check and it is available through:", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "22nov2023-s3-q-94.png" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which of the following is a shortcut key to open a new spreadsheet in MS Excel?", o: ["Alt + N", "Alt + O", "Ctrl + O", "Ctrl + N"], a: 3, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "You can change how MS Word 365 corrects and formats your text for spelling and grammatical errors by going to File -> Options -> _and ________.", o: ["Font settings", "Proofing", "Page layout settings", "Page size settings"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "What does ‘CC’ stand for in the context of email?", o: ["Confidential Content", "Compose Check", "Carbon Copy", "Centralised Communication"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which of the following is the correct formula to calculate the average of the values in cells A1 to A10?", o: ["=AVERAGE(A1:A10)", "=SUM(A1:A10)/10", "=AVERAGE(10*A1)", "=SUM(A1:A10)/100"], a: 0, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following shortcut keys is used to switch to print preview in MS Word 2016?", o: ["Page Down", "Ctrl+P", "Page UP", "Ctrl+Alt+I"], a: 3, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "What is the primary purpose of creating a table in a word processing document?", o: ["To add decorative elements and enhance the visual appeal of the document.", "To change the page orientation and adjust the margins of the document.", "To apply different fonts and colours to the text within the table.", "To organize and present information in a structured and easy-to-read format."], a: 3, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 22 Nov 2023 Shift-3";
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
