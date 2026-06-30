/**
 * Seed: Delhi Police Constable - 21 Nov 2023 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc21nov2023_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-21nov2023-s2';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 21 Nov 2023 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "The IISCO and TISCO industrial plants are related to which industry?", o: ["Sugar", "Iron and steel", "Textile", "Cement"], a: 1, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Which of the following sports persons is associated with Billiards?", o: ["Homi Motiwala", "Nameirakpam Kunjarani", "Pushpendra Kumar Garg", "Geet Sethi"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Shree Hanuman Vyayam Prasarak Mandal is situated in ____.", o: ["Nagpur", "New Delhi", "Amravati", "Mumbai"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Biome can be defined as:", o: ["an area of desert", "a large area characterised by its vegetation, soil, climate, and wildlife", "a restricted area where only selected species can grow", "an aquatic environment where only fishes can grow"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Member of Rajya Sabha, Sonal Mansingh is an eminent dancer of _________ and Bharatanatyam.", o: ["Mohiniyattam", "Odissi", "Kathakali", "Kathak"], a: 1, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "The Sangeet Natak Akademi gives fellowships to eminent artists. Sonal Mansingh received it for Odissi which is a dance form of which State?", o: ["Andhra Pradesh", "Kerala", "Uttar Pradesh", "Odisha"], a: 3, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Which of the following cultural festivals is celebrated by the tribal people of Jharkhand?", o: ["Sohrai", "Ugadi", "Sao Joao", "Hareli"], a: 0, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "‘Nation First, Always First’ is the theme of _________ Independence Day 2022.", o: ["75th", "72nd", "77th", "70th"], a: 0, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Chaitya Hall of Maharashtra is an example of _________ .", o: ["Islamic architecture", "Nagara architecture", "Cave architecture", "Dravidian architecture"], a: 2, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "What is the name of the scheme which has been rechristened in the year 2018 as Poshan Abhiyaan?", o: ["National Nutrition Mission", "National Mid-Day Meal Scheme", "Integrated Child Development Scheme", "Deen Dayal Upadhyaya Antyodaya"], a: 0, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Rudradaman belonged to which of the following dynasties?", o: ["Kushana", "Maurya", "Gupta", "Shaka"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Vijay Stambh was built by which of these rulers?", o: ["Durga Das Rathore", "Maharana Pratap", "Rana Kumbha", "Prithvi Raj Chauhan"], a: 2, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Sangeet Natak Akademi award winner Guru Vempati Chinna Satyam was an exponent of _________ .", o: ["Kuchipudi", "Bharatanatyam", "Mohiniyattam", "Kathakali"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "In which year was ‘Pradhan Mantri Rozgar Yojana’ (‘PMRY’) launched?", o: ["1990", "1993", "1999", "2001"], a: 1, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "With which of the following subjects are Article 123 and Article 213 of the Constitution of India associated?", o: ["Annual financial statement", "Jurisdiction of Courts", "Ordinance-making power", "Issuing writs"], a: 2, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Who among the following female leaders addressed the Indian National Congress session of 1890?", o: ["Vina Mazumdar", "Basanti Devi", "Nanibala Devi", "Kadambini Ganguli"], a: 3, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "In which of the following years was the Bandhan Financial Services Private Limited set up to alleviate poverty and women empowerment?", o: ["2002", "2004", "2001", "2003"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Who among the following Mughal emperors was taken as the leader by the sepoys and led the revolt of 1857?", o: ["Muhammad Shah", "Shah Jahan II", "Bahadur Shah Zafar", "Aurangzeb"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "KV Prasad and SV Rajarao are both associated with which of the following percussion instruments?", o: ["Ghatam", "Kanjira", "Mridangam", "Tabla"], a: 2, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Which of the following is a Private Sector Undertaking of India?", o: ["Bhadravati Steel Plant", "Housing Development Finance Corporation Limited", "Bengal Chemicals and Pharmaceuticals Limited", "Alloy Steels Plant"], a: 1, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Isobars are defined as:", o: ["atoms of the same element having the same neutron number but different atomic numbers", "atoms of different elements having the same mass number but different atomic numbers", "atoms of the same element having different atomic numbers and different proton numbers", "atoms of the same element having the same atomic number but different mass numbers"], a: 1, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which of the following was added in the Constitution of India in 1976?", o: ["Fundamental rights", "Right to education", "Fundamental duty", "Directive principle"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Where was the first unit of the Singh Sabha formed in 1873?", o: ["Amritsar", "Karachi", "Patiala", "Chandigarh"], a: 0, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Where is the oldest branch of the Ramakrishna Mission in the United States located?", o: ["Texas", "Chicago", "Atlanta", "New York"], a: 3, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "What were cash crops such as cotton and sugarcane called during the Mughal period?", o: ["Jins-i-kamil", "Jins-i-shukr", "Jins-i-taqh", "Jins-i-qiblis"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन-सा कथन सही है?", o: ["पारिस्थितिक तंत्र में ऊर्जा का प्रवाह एकदिशीय होता है।", "ऊर्जा का पिरामिड हमेशा उल्टा होता है।", "सभी पारिस्थितिक तंत्र आकार में स्थिर होते हैं।", "प्रकृति में, केवल खाद्य श्रृंृंखलाएँ मौजूद होती हैं, लेकिन खाद्य जाल नहीं।"], a: 0, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "As per Tendulkar Expert Group (2009), for the year 2011-2012, the national poverty line in India for a person was fixed at _____ per month for the urban areas.", o: ["₹1,500", "₹800", "₹1,000", "₹2,000"], a: 2, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a quality/feature of the parliamentary form of government?", o: ["Wide representation", "Single executive", "Collective responsibility", "Harmony between legislature and executive"], a: 1, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "The first Khelo India Winter Games was hosted by which of the following places?", o: ["Gulmarg", "Ladakh", "Leh", "Shimla"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "What is the full form of HYV seeds that were essential in the implementation of the green revolution?", o: ["Hand Yielding Volume seeds", "High Yielding Variety seeds", "High Yeast Variety seeds", "High Yielding Volume seeds"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "What is the required size of the Olympic swimming pool?", o: ["50 m × 30 m", "60 m × 60 m", "50 m × 25 m", "25 m × 15 m"], a: 2, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "‘Higher Education Leadership Development Programme for Administrator’ is a programme launched by which Union Ministry?", o: ["Ministry of Human Resource Development", "Ministry of MSME", "Ministry of Corporate Affairs", "Ministry of Skill Development and Entrepreneurship"], a: 0, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "According to Census of India 2011, select the state that had less than 10 crore population?", o: ["Maharashtra", "Uttar Pradesh", "West Bengal", "Bihar"], a: 2, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "‘The Great Gatsby’ is an English novel written by which of the following authors?", o: ["F. Scott Fitzgerald", "Oscar Wilde", "Ernest Hemingway", "D. H. Lawrence"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Who can amend any part of the Constitution without affecting the ‘basic structure’ of the Constitution?", o: ["Judiciary", "President", "Parliament", "Executive"], a: 2, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Who among the following novelists wrote ‘Midnight’s Children’?", o: ["Salman Rushdie", "Shashi Tharoor", "VS Naipaul", "Vikram Seth"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Who among the following was NOT a member of the All India Khilafat Committee, formed by Ali brothers in early 1919?", o: ["Yakub Hasan Sait", "Hasrat Mohani", "Maulana Abul Kalam Azad", "Hakim Ajmal Khan"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "According to India Brand Equity Foundation report (2020-21), which group of states of India is the largest coffee producer?", o: ["Tamil Nadu and Kerala", "Kerala and Andhra Pradesh", "Karnataka and Tamil Nadu", "Karnataka and Kerala"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "पंचवर्षीय योजनाओं के वित्तपोषण के संदर्भ में सार्वजनिक क्षेत्र के मुकाबले निजी क्षेत्र के लिए उपलब्ध वित्त के स्रोतों में कौन-सा शामिल नहीं है?", o: ["इक्विटी पूँजी के रूप में विदेशी फंड", "व्यक्तियों की बचत", "कर", "सार्वजनिक क्षेत्र के वित्तीय संस्थान"], a: 2, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which of the following Buddhist texts is based on the conversation between the Buddhist sage Nagasena and Indo Greek king Menander?", o: ["Mahavamsa", "Milindapanha", "Dhammapada", "Prajnaparamita"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "As a result of double counting, National Income is:", o: ["not estimated for the entire year of accounting", "over-estimated", "correctly estimated", "under-estimated"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "What is a relatively small, triangular-shaped minor oceanic plate located beneath the Pacific Ocean off the west coast of Central America?", o: ["Nazca plate", "Okhotsk plate", "Cocos plate", "Sunda plate"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Mrinalini Sarabhai is associated with which of these dance forms?", o: ["Kathak", "Mohiniyattam", "Manipuri", "Kathakali"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Which of the following statements are correct regarding Fundamental Rights of the Indian Citizen? A. Some of the Fundamental Rights are available against the arbitrary action of the state, some of them available against the private people. B. Fundamental Rights are not absolute but qualified. C. The Parliament can curtail or repeal the Fundamental Rights but without affecting the basic structure of the Indian Constitution. D. Under Fundamental Rights, the aggrieved person cannot go to the Supreme Court directly, but they can go to the High Court directly.", o: ["A, C and D only", "B, C and D only", "A, B and C only", "A, B, C and D"], a: 2, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "What types of proteins reside within the bilayer membrane that surrounds cells and organelles, and play an important role in the movement of molecules across them and the transmission of energy and signals?", o: ["Carrier proteins", "Peripheral membrane proteins", "Integral membrane proteins", "Glycoproteins"], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which Article of the Constitution of India deals with the ordinance making power of the Governor?", o: ["Article 209", "Article 205", "Article 213", "Article 203"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Consider following statements. 1)A system consisting of biotic and abiotic components is known as ecosystem. . 2)All the components of the ecosystem are inter-related. 3)Ecosystem always have clear boundaries. Which statement is/are correct?", o: ["Both 1 and 2 statements are correct.", "Both 1 and 3 statements are correct.", "All the statements are correct.", "Both 2 and 3 statements are correct."], a: 0, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Which of the following Directive Principles of State Policy of the Indian Constitution falls under socialistic principles?", o: ["To protect and improve the environment and to safeguard forests and wildlife", "To prohibit the consumption of intoxicating drinks and drugs", "Equal pay for equal work for men and women", "To promote functioning of co-operative societies"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a factor that causes rainfall in India?", o: ["Anti-cyclone", "Convention", "Cyclone", "Orography"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Vilayat Khan is known for playing which of the following instruments?", o: ["Santoor", "Sarod", "Violin", "Sitar"], a: 3, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? CJLR, DINP, ?, FGRL, GFTJ", o: ["EJPO", "EHON", "EHPN", "EIPN"], a: 2, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 21, 30, 23, 32, 25, ?", o: ["36", "34", "37", "38"], a: 1, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster. PENG : LIJK :: MONG : ISJK :: FTCH : ?", o: ["BXYL", "VDAG", "JKRI", "AIEB"], a: 0, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "21nov2023-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern so that the final image is symmetrical.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "21nov2023-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["6", "8", "9", "10"], a: 3, e: "", qimg: "21nov2023-s2-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "21nov2023-s2-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Six numbers 1, 2, 3, 4, 5 and 6 are written on different faces of a dice. Two positions of this dice are shown in the figure. Find the number on the face opposite to 3.", o: ["6", "4", "2", "1"], a: 3, e: "", qimg: "21nov2023-s2-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s2-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 4 : 12 :: 8 : ? :: 10 : 24", o: ["22", "16", "24", "20"], a: 3, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "21nov2023-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given equation. 17*3*6*45", o: ["×, –, =", "÷, –,=", "–, =, ÷", "×, ÷, ="], a: 0, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "J, K, L, M, N and O are sitting around a circular table facing the centre. Only two people sit between J and O. Only one person sits between O and N. Only two people sit between N and M. K sits to the immediate right of N. Who is sitting to the immediate left of L?", o: ["M", "O", "N", "K"], a: 0, e: "", qimg: "" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "21nov2023-s2-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern so that the final image is symmetrical.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s2-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at 'AB' as shown.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s2-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance from commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: Some Fans are Round. Some Round are Circles. Conclusions: I. All Fans are Circles. II. All Circles are Round.", o: ["Only conclusion I follows.", "Neither conclusion I nor II follows.", "Both conclusions I and II follow.", "Only conclusion II follows."], a: 1, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the figure from the options that can replace the question mark (?) and complete the given pattern.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the option figure that is embedded in the given figure. (Rotation is not allowed).", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s2-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are NOT related in the same way as are the numbers of the following sets. (192, 12, 10),(195, 15, 7) (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits.)", o: ["(208, 13, 16)", "(189, 9, 15)", "(228, 12, 13)", "(128, 8, 10)"], a: 0, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "21nov2023-s2-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "If ‘A’ denotes ‘+’, ‘B’ denotes ‘×’, ‘C’ denotes ‘−’ and ‘D’ denotes ‘÷’, then what will come in place of ‘?’ in the following equation? (35 A 7 B 2) D 7 C (14 D 2 C 6) A 6 = ?", o: ["0", "15", "12", "1"], a: 2, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Six letters, M, N, O, P, Q and R are written on different faces of a dice. Three positions of this dice are shown here. Find the letter on the face opposite M.", o: ["R", "N", "O", "Q"], a: 2, e: "", qimg: "21nov2023-s2-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘BABY’ is written as ‘43427’ and ‘CREW’ is written as ‘520725’. How will ‘DATE’ be written in that language?", o: ["63227", "62206", "53215", "41205"], a: 0, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "21nov2023-s2-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum on compound interest at a certain rate becomes ₹9,680 in 2 years and ₹11,712.80 in 4 years. What is the rate of interest?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "21nov2023-s2-q-76.png" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the average of all the odd numbers from 1 to 43.", o: ["21", "23", "25", "22"], a: 3, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "A and B working separately can mow a field in 12 and 10 hours, respectively. They work alternately, each for 1 hour, beginning with A, at 5:00 a.m. At what time will the mowing be completed?", o: ["4:30 p.m.", "5:30 p.m.", "4:00 p.m.", "5:00 p.m."], a: 2, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["15%", "10%", "20%", "5%"], a: 3, e: "", qimg: "21nov2023-s2-q-79.png" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the area (in cm2) of a triangle whose sides are 3 cm, 4 cm, and 5 cm?", o: ["10.5", "4", "8", "6"], a: 3, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "If the radius of the base of a right circular cylinder is increased by 20% and the height is decreased by 30%, then what is the percentage increase/decrease in the volume?", o: ["Increase by 0.8%", "Decrease by 0.8%", "Decrease by 0.5%", "Increase by 0.5%"], a: 0, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "If the simple interest on ₹800 for 4 years and on ₹600 for 2 years combined together is ₹280, then what is the rate of interest per annum?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "21nov2023-s2-q-82.png" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "21nov2023-s2-q-83.png" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "The marked price of a chair was ₹1,200. This price was 20% above its cost price. If the chair was sold at a discount of 5% on the marked price, then find the profit percentage.", o: ["12%", "11%", "16%", "14%"], a: 3, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "In a race of 150 m, R beats S by 9 m. If S takes a head start of 15 m, how long (in m) should the race be to have a tie between them?", o: ["210", "250", "180", "270"], a: 1, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the largest number that can exactly divide 48, 92 and 140?", o: ["4", "12", "11", "14"], a: 0, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "If David purchases 10 bananas for ₹25 and sells 9 bananas for ₹45, then what is the gain percentage?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "21nov2023-s2-q-87.png" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "The HCF of 448 and 336 is _______ times the HCF of 48 and 36.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "21nov2023-s2-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["3593", "1540", "385", "6160"], a: 1, e: "", qimg: "21nov2023-s2-q-89.png" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "The sum of the digits of the LCM of the numbers 30, 48, 96, 150 is:", o: ["12", "14", "6", "8"], a: 2, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "In most word processors, which of the following keyboard shortcuts is used to bold, italicize, and underline the text, respectively?", o: ["Ctrl + B, Ctrl + X, Ctrl + V", "Ctrl + A, Ctrl + B, Ctrl + C", "Ctrl + P, Ctrl + V, Ctrl + U", "Ctrl + B, Ctrl + I, Ctrl + U"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which option allows you to increase the size of selected text in Microsoft Word 365?", o: ["Underline", "Font Size", "Bold", "Italic"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365 which of the following shortcut keys is used to select entire workbook in MS Excel?", o: ["Ctrl + A", "F1", "Ctrl + S", "F6"], a: 0, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "What is the purpose of a URL (Uniform Resource Locator)?", o: ["To format text on websites", "To manage user accounts on websites", "To provide the address of a web resource", "To create animations on websites"], a: 2, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In MS-Word 365, which of the following actions is a part of the document creation process?", o: ["Printing the document", "Applying formatting to the text", "Inserting a table of contents", "Saving the document with a new name"], a: 3, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following options is used while printing documents in MS Word 365, i.e. if we want to print all the pages from 7 till 10, then the printer should print only the 7th, 8th, 9th and 10th pages?", o: ["Print one sided", "Collated", "Print Custom Range", "Orientation"], a: 2, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following statements related to Assigning a Label to an email is INCORRECT?", o: ["We cannot use label in email to sort our inbox.", "Assigning a label to an email is the equivalent of moving it into a specific folder.", "We can use labels in email to sort our inbox.", "We can apply multiple labels to a single email."], a: 0, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "The keyboard shortcut key used to print preview in MS-Word 365 is:", o: ["Ctrl + F2", "Shift + F1", "Ctrl + F1", "Shift + F2"], a: 0, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365 which of the following is one of the options to edit cells in MS-Excel?", o: ["Edit bar", "Formula bar", "Space bar", "Ribbon"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365 which tab on the Microsoft Excel ribbon allows you to access options related to opening and saving files?", o: ["View", "Insert", "File", "Home"], a: 2, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 21 Nov 2023 Shift-2";
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
