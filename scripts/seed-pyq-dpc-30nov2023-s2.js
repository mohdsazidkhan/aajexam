/**
 * Seed: Delhi Police Constable - 30 Nov 2023 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc30nov2023_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-30nov2023-s2';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 30 Nov 2023 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "A 20-page autobiography,’ Waiting for a Visa’, is written by ___________, which is about his experiences with untouchability.", o: ["Jyotiba Phule", "Gopal Krishna Gokhale", "Bhimrao Ramji Ambedkar", "Mahatma Gandhi"], a: 2, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Terekhol, Chapora, Mapusa, Sal, Zuari etc. are the major rivers of which state?", o: ["Telangana", "Goa", "Chhattisgarh", "Gujarat"], a: 1, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Which of the below mentioned items are NOT the part of revenue expenditure as per government budget?", o: ["Infrastructural Development Expenditure", "Salaries and Pensions", "Subsidies", "Interest payments"], a: 0, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Which of the following Constitutional Amendment Acts of the Indian Constitution facilitated the appointment of the same person as governor for two or more states?", o: ["7th", "5th", "8th", "10th"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Choose the correct group of greenhouse gases.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "30nov2023-s2-q-5.png" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "In which year did India's ‘National Food for Work Programme’ begin?", o: ["2003", "2002", "2004", "2000"], a: 2, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Which of the following was NOT a disadvantage of the green revolution?", o: ["High use of fertilisers and pesticides resulted in health illnesses.", "Most of the crops introduced during green revolution were intensive crops.", "It promoted extensive use of chemicals.", "It reduced India’s import of food grains"], a: 3, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Terraces that are level on opposite sides of the valley are referred to as ______ terraces.", o: ["horizontal", "paired", "symmetrical", "triangular"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which of these festivals commemorates the resurrection of Jesus from the dead?", o: ["Good Friday", "New Year", "Christmas", "Easter"], a: 3, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Rural Self-Employment Training Institute is an initiative of which Ministry of the Government of India?", o: ["Ministry of Agriculture", "Ministry of Rural Development", "Ministry of Labour and Employment", "Ministry of Finance"], a: 1, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which of the following statements is correct with respect to the Attorney General of India?", o: ["He/She can participate in sessions of the parliament.", "He/She can vote in the Lok Sabha during the passage of confidence motion and no- confidence motion.", "He/She cannot participate in joint sitting of the parliament.", "He/She does not enjoy any immunity or privileges as compared to members of the parliament."], a: 0, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Consider the below mentioned statements and select the correct option with respect to the Indian folk and tribal dance forms: i) Matki is the folk dance of Assam. ii) Thang Ta is the folk dance of Manipur. iii) Fugdi is the folk dance of Goa.", o: ["Only (ii) is right.", "Both (i) and (ii) are right.", "Both (ii) and (iii) are right.", "Only (i) is right."], a: 2, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "The students in a physics lab have been asked to measure the amount of electric current in a circuit. Which device should they use?", o: ["Altimeter", "Ammeter", "Ohmmeter", "Voltmeter"], a: 1, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which American President has written ‘Dreams from My Father’, an autobiography?", o: ["George Bush", "John Kennedy", "Barack Obama", "George Washington"], a: 2, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Which Article of the Constitution of India mentions that the state shall make effective provision for securing public assistance in cases of unemployment, old age, sickness and disablement?", o: ["Article 45", "Article 47", "Article 39", "Article 41"], a: 3, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "In the game of javelin throw the weight of Javelin for women is:", o: ["600 gm", "800 gm", "700 gm", "825 gm"], a: 0, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "प्रसिद्ध कलाकार तीजन बाई का संबंध निम्नलिखित में से किससे है?", o: ["पंडवानी", "टिप्‍पनी", "कालबेलिया", "भवाई"], a: 0, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Liberalisation is a part of ________ reforms.", o: ["social", "political", "land", "economic"], a: 3, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "The victory of the ________ marked the foundation stone of the Delhi Sultanate in India.", o: ["Afghans", "Arabs", "Persians", "Turks"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Goods and services that are provided by the government to all the people and whose consumption is not rivalrous are known as:", o: ["public goods", "final goods", "private goods", "intermediate goods"], a: 0, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Excessive use of pesticides, insecticides and inorganic fertilisers is not good for human health. This is due to the phenomena called:", o: ["biomagnification", "intoxication", "biotransformation", "biodilution"], a: 0, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Padma Bhushan and Sangeet Natak Akademi award winner Rukmini Devi Arundale was an exponent of _________ .", o: ["Bharatanatyam", "Kathakali", "Kathak", "Sattriya"], a: 0, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Which of the following structures stores carbohydrates?", o: ["Aleuroplast", "Elaioplast", "Amyloplast", "Chloroplast"], a: 2, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Who among the following Gupta emperors held the title of Vikramaditya?", o: ["Chandragupta I", "Skandagupta", "Chandragupta II", "Budhagupta"], a: 2, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Who among the following received the National Award for ‘Best Music Direction’ in September 2022 for his song 'Marange Toh Vahin Jaa Kar' in the documentary film '1232 KMs'?", o: ["Vishal Bharadwaj", "Swanand Kirkire", "Amit Trivedi", "Ajay Atul"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "After which infamous incident of 1919 was the Hunter Commission appointed?", o: ["Indian educational reforms", "Kheda mill strike", "Jallianwala Bagh massacre", "Komagata Maru"], a: 2, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "The first National Winter Games were hosted by _________ .", o: ["Gulmarg", "Manali", "Srinagar", "Auli"], a: 0, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "The Statue of Unity is located at the bank of which of these rivers?", o: ["Narmada", "Krishna", "Yamuna", "Ganga"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "भारत के संविधान के निम्नलिखित में से किस भाग को 'भारतीय संविधान की अंतरात्मा' के रूप में संदर्भित किया गया है?", o: ["केंद्र-राज्य संबंध", "मौलिक कर्तव्य", "मौलिक अधिकार", "नागरिकता"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "मोहनजोदड़ो नगर नियोजन में निम्नलिखित में से किस प्रकार के पैटर्न का पालन किया गया था?", o: ["वृत्तीय", "आयताकार", "जाल", "बेलनाकार"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Which ethnic group is the largest in China, accounting for over 90% of the population?", o: ["Uighur", "Zhuang", "Manchu", "Han"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "How many gold medals has the Indian Hockey team won in the Olympics till 2023?", o: ["11", "7", "8", "10"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Under Liberalisation in 1991, several foreign exchange reforms were initiated. In this context, which of the following is true for devaluation of domestic currency?", o: ["Fixing the domestic currency to all foreign currency", "Lowering the value of foreign currency in relation to domestic currency", "Increasing value of domestic currency in relation to foreign currency", "Lowering the value of domestic currency in relation to foreign currency"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "The All India Trade Union Congress worked for the improvement of the workers’ working and living conditions. One of the main leaders of this was ________.", o: ["Jyotirao Phule", "MN Roy", "GB Pant", "MG Ranade"], a: 1, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "From which of the following countries has ‘advisory jurisdiction of the Supreme Court’ been adopted in the Constitution of India?", o: ["Cuba", "Canada", "Germany", "Portugal"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Who among the following was the Secretary of State of India and a member of the Cabinet Mission sent to India by the British Government in 1946?", o: ["John Simon", "Stafford Cripps", "Lord Irwin", "Lord Pethick-Lawrence"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Which Article of the Constitution of India debars the courts to inquire into the proceedings of the State Legislature?", o: ["Article 209", "Article 211", "Article 210", "Article 212"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which of the following statements are correct regarding the tribal Festival Medaram Jathara? A. This is the largest tribal festival of India. B. This festival is celebrated by the Koya community of Telangana. C. This festival is celebrated once in two years in the month of 'Magha' (February) on the full moon day.", o: ["A,B and C", "B and C only", "A and C only", "A and B only"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "With reference to the travellers who visited India, who among the following was from Portugal?", o: ["François Bernier", "Nicolo Conti", "Ibn Batuta", "Duarte Barbosa"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Of which state was Mirza Wajid Ali Shah the king in 1856, when it was annexed into the British Empire in India under the doctrine of lapse policy?", o: ["Nagpur", "Satara", "Jhansi", "Awadh"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "The Konkan Railway line passes through which of the following groups of states?", o: ["Madhya Pradesh, Goa and Karnataka", "Maharashtra, Goa and Telangana", "Maharashtra, Goa and Karnataka", "Maharashtra, Gujarat and Karnataka"], a: 2, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Which Five-Year Plan was formulated by governments of two political parties?", o: ["Eighth Five-Year Plan", "Sixth Five-Year Plan", "Fifth Five-Year Plan", "Ninth Five-Year Plan"], a: 1, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "मनुष्य इतिहास में किस काल से खाद्य उत्पादक बना?", o: ["नवपाषाण युग", "मध्यपाषाण युग", "पुरापाषाण युग", "ताम्रपाषाण युग"], a: 0, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "पूर्ण रूप से भारतीय अक्षत वनस्पति को स्थानिक या देशज प्रजाति कहा जाता है, जबकि जो वनस्पतियां भारत के बाहर से आती हैं, उन्हें ______ कहा जाता है।", o: ["स्थानीय प्रजाति", "विदेशज प्रजाति", "गैर-स्थानीय प्रजाति", "लुप्तप्राय प्रजाति"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "The Dancer Couple Dhananjayans were awarded the Rashtriya Kalidas Samman Award (2019-2020) for their contribution to which Indian dance form?", o: ["Mohiniyattam", "Kathak", "Bharatanatyam", "Kuchipudi"], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which of the following is the correct statement about the directive principles of state policy?", o: ["Articles 12-35 of the constitution of India deals with directive principles.", "Articles 36-51 of the constitution of India deals with directive principles.", "Articles 62-71 of the constitution of India deals with directive principles.", "Articles 52-62 of the constitution of India deals with directive principles."], a: 1, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Surat, Navsari and Bhavnagar are known for their involvement in which industry?", o: ["Software industry", "Iron and steel industry", "Automobile industry", "Diamond industry"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Which scheme was started in 2000 for additional central assistance to be given to states for basic services such as primary health, primary education, rural shelter, etc.?", o: ["Swarnajayanti Gram Swarojgar Yojana", "Prime Minister Rojgar Yojana", "Rural Employment Generation Programme", "Pradhan Mantri Gramodaya Yojana"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "In which year did the Indian Badminton team create history by winning the Thomas Cup tournament?", o: ["2020", "2019", "2022", "2021"], a: 2, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "The movie RRR has recently been honoured with the prestigious Golden Globe award for the Best Original Song for the track ‘Natu Natu’. Who are the singers of this song?", o: ["Rahul Sipligunj and Kaala Bhairava", "Silambarasan TR and Vineeth Sreenivasan", "KJ Yesudas and Anirudh Ravichander", "Shankar Mahadevan and Rajesh Krishnan"], a: 0, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["13", "12", "14", "11"], a: 0, e: "", qimg: "30nov2023-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding /deleting /multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed.) (40, 8, 24) (60, 12, 36)", o: ["(70, 14, 44)", "(80, 14, 42)", "(70, 14, 42)", "(80, 14, 44)"], a: 2, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "30nov2023-s2-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? YXQM, UUOL, QRMK, MOKJ, ?", o: ["ILII", "OLJI", "NKII", "INJI"], a: 0, e: "", qimg: "" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'XY' as shown below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "30nov2023-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "30nov2023-s2-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "30nov2023-s2-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Six dogs - P, Q, R, S, T and U - were sitting around a circular table, equidistant to one another. They were facing the centre of the table. Q was exactly between P and S. U was to the immediate right of R. T was to the immediate left of S. Who among the following was sitting third to the left of S?", o: ["R", "P", "U", "Q"], a: 0, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "30nov2023-s2-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["B", "Q", "R", "P"], a: 3, e: "", qimg: "30nov2023-s2-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the option figure that will replace the question mark (?) in the figure given below to complete the pattern.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "30nov2023-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 8 : 17 :: 14 : ? :: 20 : 41", o: ["44", "29", "30", "53"], a: 1, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "The sequence of folding a piece of paper and the manner in which the folded paper is cut are shown in the following figures. How would this paper look when unfolded?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "30nov2023-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below and complete the pattern.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "30nov2023-s2-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "In a certain code language, 'SENSE' is written as 'GUPGU' and 'PAINT' is written as 'VPKCR'. How will 'KNIFE' be written in that language?", o: ["MOKHG", "GHMPK", "GHKPM", "GHOMK"], a: 2, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance from commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: All Peanuts are Almonds. All Almonds are Butters. Conclusions: I. All Butters are Almonds. II. All Peanuts are Butters.", o: ["Both conclusions I and II follow.", "Neither conclusion I nor II follows.", "Only conclusion I follows.", "Only conclusion II follows."], a: 3, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "30nov2023-s2-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "30nov2023-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 9, 20, 53, 152, 449, ?", o: ["4344", "1340", "4233", "3146"], a: 1, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "30nov2023-s2-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 88 * 4 * 15 * 3 * 1 * 4", o: ["− ÷ = × +", "− = × + ÷", "÷ − = × +", "÷ −× + ="], a: 2, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the figure from the options that can replace the question mark (?) and complete the given pattern.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "30nov2023-s2-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "उस विकल्प का चयन करें जो तीसरे शब्द से उसी प्रकार संबंधित है, जिस प्रकार दूसरा शब्द पहले शब्द से संबंधित है। (शब्दोंों को अर्थपूर्ण हिंदी शब्दोंों के रूप में माना जाना चाहिए और शब्द में अक्षरों की संख्या/व्यंजनों की संख्या/स्वरों की संख्या के आधार पर उन्‍हें एक-दूसरे से संबंधित नहीं किया जाना चाहिए) संपादक : समाचार पत्र :: नाटककार : ?", o: ["डिजाईन", "भूमिका/किरदार", "सृजन", "नाटक"], a: 3, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["÷ and +", "+ and −", "− and ×", "+ and ×"], a: 3, e: "", qimg: "30nov2023-s2-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "30nov2023-s2-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper gains 35% after allowing a discount of 15% on the marked price of an article. Find his profit per cent if the articles are sold at a marked price allowing no discount.", o: ["58.82%", "65%", "60%", "62%"], a: 0, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "एक आदमी ने दो अलमारियों को ₹650 प्रत्येक में बेचा, एक पर 30% का लाभ और दूसरी पर 20% की हानि हुई। यदि उसने दोनों अलमारियों को ₹875 प्रत्येक में बेचा होता, तो उसका शुद्ध लाभ/हानि प्रतिशत (निकटतम पूर्णांक तक) कितना होता?", o: ["35% लाभ", "42% हानि", "33% लाभ", "36% हानि"], a: 2, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["19240 m3", "17248 m3", "18258 m3", "16445 m3"], a: 1, e: "", qimg: "30nov2023-s2-q-78.png" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Meena has ₹20,000 in her savings account. If she spends ₹6,000, what is the decrease in saving as a percentage?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "30nov2023-s2-q-79.png" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "The length of the rectangle is increased by 5% and its breadth is decreased by 5%. The area of the new rectangle is:", o: ["decreased by 0.25%", "decreased by 1%", "increased by 0.25%", "neither increased nor decreased"], a: 0, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "Ritika is riding her motorcycle at a speed of 84 km/h. How many metres will Ritika cover in 45 seconds if she rides at the same speed?", o: ["1080", "1050", "1020", "1035"], a: 1, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "If 56 workers earn ₹4,050 in 5 days, how much will 48 workers earn in 14 days?", o: ["₹5,968", "₹6,128", "₹9,720", "₹9,980"], a: 2, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["120", "8", "320", "160"], a: 3, e: "", qimg: "30nov2023-s2-q-83.png" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Mr. Singh invests (Simple interest) a sum of ₹1,264 at 5% p.a. in a bank. What is the amount that he will get after 3 years?", o: ["₹2,145.80", "₹1,285.80", "₹1,453.60", "₹1,848.80"], a: 2, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "To wrap a cylinder from all sides, the cloth required to cover the curved area is double the cloth required to cover the flat areas. What is the ratio of the height of the cylinder to the radius of the cylinder?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "30nov2023-s2-q-85.png" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "P,Q,R and S are four prime numbers such that their sum equals 45. If it is given that P < Q < R < S; then the value of P4 + 2P is:", o: ["220", "635", "20", "87"], a: 2, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["6.47", "7.46", "4.67", "4.76"], a: 3, e: "", qimg: "30nov2023-s2-q-87.png" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Ankit is twice as old as Reena, while Reena is three times older than Sanjana. What is the ratio of the ages of Ankit, Reena and Sanjana?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "30nov2023-s2-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "The population of a village is 8,00,865. If it increases at the rate of 11% per annum, then what was the population of the village 2 years ago?", o: ["4,50,000", "6,50,000", "8,65,000", "5,65,000"], a: 1, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the average of the numbers 15, 27, 34 and 48?", o: ["29", "32", "33", "31"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Among the following, under which tab will you find the Bullets and Numbering in MS- Word 365?", o: ["Page Layout", "Insert", "Home", "References"], a: 2, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "एक नया ई-मेल कम्‍पोज़ करने की प्रक्रिया में, प्राथमिक प्राप्तकर्ता का ई-मेल एड्रेेस इंटर करने का सामान्य स्थान कौन-सा होता है?", o: ["ई-मेल का मुख्‍य भाग (Body of the email)", "‘CC’ फील्‍ड (‘CC’ field)", "सब्‍जे़क्‍ट लाइन (Subject line)", "‘To’ फील्‍ड (‘To’ field)"], a: 3, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts helps you copy data in MS Excel 365?", o: ["Ctrl + C", "Ctrl + Y", "Ctrl + Z", "Ctrl + X"], a: 0, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "What is the purpose of sorting data in Microsoft Excel 365?", o: ["To create charts and graphs", "To organise data in a specific order based on values", "To apply formatting to the cells only", "To calculate averages of the data"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In Microsoft Word 365, what does the ‘B’ icon usually represent?", o: ["Bold formatting", "Italic formatting", "Page break", "Bullet points"], a: 0, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which option in the context menu allows you to paste the copied text with formatting removed in Microsoft Word 365?", o: ["Paste", "Paste as Plain Text", "Paste Special", "Paste as Unformatted Text"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which of the following is the correct shortcut key used to paste data in MS Excel?", o: ["Ctrl + C", "Shift + V", "Alt + V", "Ctrl + V"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which keyboard shortcut is commonly used to create a new blank document in MS Word 365?", o: ["Ctrl + S", "Ctrl + C", "Ctrl + O", "Ctrl + N"], a: 3, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "What does ‘ISP’ stand for in the context of internet access?", o: ["International Security Protocol", "Internet System Protocol", "Internet Service Provider", "Internet Security Program"], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following icons are a part of the Design menu in MS Word 365?", o: ["Icons to change themes, colours, fonts, effects and page borders", "Icons for zooming in and out, print layout, switching windows and splitting windows", "Icons for spelling and grammar check, thesaurus and word count", "Icons to change font size, style, alignment and borders"], a: 0, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 30 Nov 2023 Shift-2";
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
