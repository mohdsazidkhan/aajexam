/**
 * Seed: Delhi Police Constable - 14 Nov 2023 Shift-3
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc14nov2023_s3');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-14nov2023-s3';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 14 Nov 2023 Shift-3"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Cashpor Micro credit is a company that does NOT operate in the most backward districts of ____________________.", o: ["Bihar", "Chhattisgarh", "Telangana", "Jharkhand"], a: 2, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Which Article of the Constitution of India states that the President shall appoint judges of the Supreme Court under his hand and seal after consultation with such of the judges of the Supreme Court as the President may deem necessary?", o: ["Article 124 (2)", "Article 120 (2)", "Article 134 (2)", "Article 142(2)"], a: 0, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Which of the following was replaced by the Green Revolution?", o: ["Use of inorganic manures", "Use of seeds supplied by the government", "Use of groundwater for irrigation", "Use of organic manures"], a: 3, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "According to Census of India 2011, the growth rate of Hindu population in the decade 2001-2011 was ___________.", o: ["10.0%", "16.8%", "20.1%", "8.6%"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "In which of the following years Cripps Mission offered Dominion Status to India?", o: ["1942", "1934", "1939", "1945"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "किस सिंड्रोोम के कारण कंधों के बीच एक मोटा कूबड़, एक गोल चेहरा और त्वचा पर गुलाबी या बैंगनी खिंचाव के निशान हो जाते हैं?", o: ["डाउन सिंड्रोोम (Down syndrome)", "एंजेलमैन सिंड्रोोम (Angelman syndrome)", "कुशिंग सिंड्रोोम (Cushing syndrome)", "मार्फन सिंड्रोोम (Marfan syndrome)"], a: 2, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "After independence, who had complete control over the established industries?", o: ["Private sector", "Foreign investors", "Britishers", "Government"], a: 3, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Who propounded the philosophy of ‘One Caste, One Religion, One God for all men’?", o: ["Shree Narayana Guru", "Savitribai Phule", "Mahatma Gandhi", "Raja Ram Mohan Roy"], a: 0, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "What type of earthquake occurs when induced stresses around mine workings cause massive rocks to fly explosively from the mine face, creating seismic waves?", o: ["Collapse earthquake", "Explosion earthquake", "Volcanic earthquake", "Tectonic earthquake"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "The term 'monsoon' denotes the seasonal change in wind direction that occurs during which specific time period?", o: ["Two decades", "Two months", "One day", "Year"], a: 3, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Sunlight is the main source of ______.", o: ["Vitamin A", "Vitamin B", "Vitamin D", "Vitamin C"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "In which of the following dance genres is Mallika Sarabhai an accomplished dancer?", o: ["Kathakali and Odissi", "Odissi and Kuchipudi", "Bharatnatyam and Odissi", "Kuchipudi and Bharatnatyam"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "In which of the following Indian states is Ghum Monastery located?", o: ["Karnataka", "Himachal Pradesh", "West Bengal", "Arunachal Pradesh"], a: 2, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "In which language was the largest newspaper published in India in the year 2021-22?", o: ["Hindi", "English", "Urdu", "Bengali"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Which of the following statements is correct about privatisation? Statements: I. It promotes economic efficiency II. It delimits the interference of bureaucracy III. It leads to market failure", o: ["Only statements I and II", "Only statement II", "Only statement III", "Only statement I"], a: 0, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "'नागे वाज़ा' जूडो में इस्तेमाल की जाने वाली एक ________की तकनीक है।", o: ["दम घुटाने (चोकिंंग)", "जकड़ने (ग्रिपिंग)", "दूर हटाने (थ्रोइंग)", "पकड़े रखने (होल्डिंग)"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "In which budget was the policy of LERMS announced?", o: ["1991-92", "1992-93", "1995-96", "1990-91"], a: 1, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "In the context of globalisation, what does PPP stand for?", o: ["Purchase Power Parity", "Purchasing Par Parity", "Purchasing Power Parity", "Purchasing Par Parities"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "_________ is the final interpreter of the Constitution of India.", o: ["Attorney General", "Comptroller and Auditor General", "Supreme Court", "President of India"], a: 2, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Ram Sahay Pandey, a Padma Shri 2022 awardee, is associated with which of the following dance forms of the Bedia community of Madhya Pradesh?", o: ["Karma", "Ravala", "Rai", "Badhai"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Which of the following measures of credit control requires a well-developed money market?", o: ["Open market operations", "Bank rate policy", "Variable reserve ratio", "Qualitative measures"], a: 0, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which of the following festivals is celebrated in honour of Hidimba Devi in Himachal Pradesh?", o: ["Shorai Festival", "Maghi Festival", "Bisua Festival", "Doongri Festival"], a: 3, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Vijayadashami is also known as _______.", o: ["Dussehra", "Holi", "Diwali", "Ganesh Chaturthi"], a: 0, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Who among the following social reformers established Satyashodhak Samaj?", o: ["Jyotiba Phule", "Narayana Guru", "Ramaswami Naicker-Periyar", "Dr. Babasaheb Ambedkar"], a: 0, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Mein Kampf’ has been written by which of the following politicians?", o: ["Benito Mussolini", "Hirohito", "Adolf Hitler", "Clement Attlee"], a: 2, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Pandit Ayodhya Prasad is associated with _________ .", o: ["pakhawaj", "veena", "flute", "guitar"], a: 0, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "High Courts have the power to issue writs under which Article of the Constitution of India?", o: ["Article 222", "Article 223", "Article 226", "Article 225"], a: 2, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Ashvaghosha, the author of Buddhacharita, was the philosopher in the court of which Kushana kings?", o: ["Kanishka I", "Vasudeva I", "Huvishka", "Vima Kadphises"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Select the correct option based on the image given below.", o: ["III", "I", "II", "IV"], a: 3, e: "", qimg: "14nov2023-s3-q-29.png" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Name the Freedom fighter who formed a clan of non-violent revolutionaries called Khudai Khidmatgars in 1929.", o: ["KM Ashraf", "Khan Abdul Ghaffar Khan", "Abbas Tayabji", "Mohammed Yasin Khan"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "The National Sports Festival for Women was started in ____.", o: ["1974", "1975", "1976", "1970"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Which of the following states topped the medal tally in the Khelo India Youth Games 2023?", o: ["Maharashtra", "Haryana", "Uttar Pradesh", "Punjab"], a: 0, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "National Food Security Mission was launched in India in the year 2007-08 to increase the production of rice, wheat and ________.", o: ["saffron", "millet", "pulses", "fruits"], a: 2, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "The autobiography ‘Long Walk to Freedom’ is written by:", o: ["Nelson Mandela", "BR Ambedkar", "Rabindranath Tagore", "MK Gandhi"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Which of the following options had figured in the royal emblem of the Chola dynasty?", o: ["Tiger", "Elephant", "Fish", "Horse"], a: 0, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Which Indian state has got the highest literacy rate as per National Survey of India 2022?", o: ["Goa", "Maharashtra", "Kerala", "Karnataka"], a: 2, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "According to Sangam texts, the term uzhavar means:", o: ["slaves", "large landowners", "teachers", "ordinary ploughmen"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "The famous festival known as ‘Paro Tschechu’ is associated with which country?", o: ["Japan", "Burma", "Bhutan", "Thailand"], a: 2, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Which Article of the Constitution of India empowers a High Court to issue writs?", o: ["Article 230", "Article 220", "Article 223", "Article 226"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Under which Constitutional Amendment Act, was the term “Secular” added in the Preamble?", o: ["43rd Constitutional Amendment Act", "44th Constitutional Amendment Act", "41st Constitutional Amendment Act", "42nd Constitutional Amendment Act"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Khandesh was incorporated into the Mughal empire in which of the following years?", o: ["1601", "1603", "1598", "1600"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Which place in the north-eastern part of the northern Indian state of Himachal Pradesh is popularly known as the Cold Desert Mountains?", o: ["Sangti Valley", "Parvati Valley", "Aalo Valley", "Spiti Valley"], a: 3, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Select the personality who received the Sangeet Natak Akademi 2021 award for his/her contribution in Mohiniyattam.", o: ["Thokchom Ibemubi Devi", "Bhuvan Kumar", "Neena Prasad", "Bijay Kumar Jena"], a: 2, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "From which of the following countries did India adopt the ‘amendment procedure in the constitution’?", o: ["South Africa", "Ireland", "The US", "France"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "The Dronacharya award is given to _________.", o: ["best coach", "best player", "best teacher", "best soldier"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Pandit Hariprasad Chaurasia is a world-renowned exponent of the ________.", o: ["Sarod", "Sitar", "Bansuri", "tabla"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "In the Lok Sabha, ________ seats are reserved for the members from Scheduled Castes.", o: ["80", "82", "73", "84"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Below are some statements about the Ozone layer. Statement 1. It is found in the stratosphere. Statement 2. Chlorofluorocarbons (CFCs) are responsible for Ozone hole. Statement 3. Ozone layer is found around 15–30 km above the earth’s surface. Statement 4. Ozone layer is expected not to recover anymore now. Which of these statements are correct?", o: ["Only statements 2, 3 and 4", "Only statements 3 and 4", "Only statements 1, 2 and 3", "Only statements 1 and 2"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "The Sun Temple of Konark is located on the shore of the ______.", o: ["Bay of Bengal", "Indian Ocean", "Red Sea", "Arabian Sea"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Hojagiri is a famous dance form of which of these states?", o: ["Punjab", "Jharkhand", "Assam", "Tripura"], a: 3, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance from commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: All Shirts are Cottons. Some Shirts are Nets. Conclusions: I. All Nets are Shirts. II. Some Nets are Cottons.", o: ["Both conclusions I and II follow.", "Only conclusion II follows.", "Neither conclusion I nor II follows.", "Only conclusion I follows."], a: 1, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Three different positions of the same dice are shown. Find the number on the face opposite to the face showing ‘3’.", o: ["2", "5", "1", "6"], a: 3, e: "", qimg: "14nov2023-s3-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Which of the following letter clusters will replace the question mark (?) in the given series to make it logically complete? JGI, HJG, FME, DPC, ?", o: ["BSA", "BSB", "BRB", "ASA"], a: 0, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14nov2023-s3-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 1, 2, 5, 26, 677, ?", o: ["3255", "45245", "24563", "458330"], a: 3, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Four different positions of the same dice are shown below. Which number is on the face opposite to the face showing ‘6’?", o: ["1", "3", "2", "4"], a: 0, e: "", qimg: "14nov2023-s3-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14nov2023-s3-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "14nov2023-s3-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["6", "5", "7", "8"], a: 0, e: "", qimg: "14nov2023-s3-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown below. Choose a figure which would most closely resemble the unfolded form of the paper.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14nov2023-s3-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the figure from the options that can replace the question mark (?) and complete the given pattern.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14nov2023-s3-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Six students are sitting around a circular table facing the centre. Red is sitting fourth to the right of White. Blue is sitting second to the right of Gray. Black is sitting third to the right of Pink. White is the immediate neighbour of Gray and Black.. Who is the immediate neighbour of Red and Pink?", o: ["Blue", "Black", "Gray", "White"], a: 0, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14nov2023-s3-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14nov2023-s3-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the word-pair that best represents a similar relationship to the one expressed in the pair of words given below. (The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word.) Exit : Leave", o: ["Fate : Fete", "Select : Choose", "Start : End", "Moat : Mote"], a: 1, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Six numbers, 21, 22, 23, 24, 25 and 26 are written on different faces of a dice. Three positions of this dice are shown here. Find the number on the face opposite 21.", o: ["24", "22", "23", "25"], a: 0, e: "", qimg: "14nov2023-s3-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14nov2023-s3-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding/deleting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed) (4, 42, 5),(3, 45, 7)", o: ["(6, 49, 3)", "(6, 32, 2)", "(7, 43, 4)", "(7, 42, 5)"], a: 1, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at 'AB' as shown.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14nov2023-s3-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Three different positions of the same dice are shown. Find the number on the face opposite the face having ‘2’.", o: ["1", "4", "3", "6"], a: 1, e: "", qimg: "14nov2023-s3-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 400 : 200 :: 248 : ? :: 256 : 128", o: ["200", "124", "148", "114"], a: 1, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["− and ÷", "+ and ÷", "− and ×", "÷ and ×"], a: 3, e: "", qimg: "14nov2023-s3-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘BAE’ is written as ‘512’ and ‘WIN’ is written as ‘14923’. How will ‘HER’ be written in that language?", o: ["1826", "1844", "1838", "1858"], a: 3, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given equation. 54*16*3*6*2*9", o: ["+, ×, –, ÷, =", "÷, –, ×, +, =", "–, ×, +, ÷, =", "+, –, ×, ÷, ="], a: 2, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14nov2023-s3-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "If 4 men or 8 women can do a work in 12 days, then in how many days can 9 men and 6 women do the same work?", o: ["5", "4", "3", "6"], a: 1, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "The selling price of 32 items is equal to the cost price of 45 items. What is the percentage of profit made on the sale of each item?", o: ["40.75%", "40.5%", "40.725%", "40.625%"], a: 3, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "A person divides his property so that his wife’s share to his daughter’s and the daughter’s share to his son’s, are both in the ratio 1 ∶ 4. If the wife gets ₹5,000 less than the son, the value (in ₹) of the whole property is:", o: ["7,000", "5,000", "6,000", "8,000"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "The LCM of two numbers is 12 times their HCF. One of the numbers is 8 and the sum of the HCF and LCM is 52. What is the other number?", o: ["22", "24", "26", "28"], a: 1, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "In an equilateral triangle, each side is ‘a’ units. The altitude of this triangle is:", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14nov2023-s3-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "The inradius of a triangle is 7 cm and its area is 343 cm2. The perimeter of the triangle is", o: ["98 cm", "68 cm", "88 cm", "49 cm"], a: 0, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of ₹2,52,500 at the rate of 4.5% per annum for a period of 2.5 years will amount to how much (in ₹) if the money is invested at simple interest?", o: ["2,75,906.50", "2,78,906.25", "2,82,906.25", "2,80,906.25"], a: 3, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "In how many seconds will a 210 m long train, travelling at a speed of 97 km/h, come from behind and completely cross a 240 m long train travelling at 79 km/h in the same direction as that of the first train?", o: ["96", "100", "90", "84"], a: 2, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "The marked price of a book is ₹700 but the retailer gets a discount of 20%. If the retailer sells the book at marked price, then the profit percentage is:", o: ["20%", "30%", "25%", "22%"], a: 2, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "A person loses 18% of his money and after spending 87% of the remainder, he is left with ₹122. How much did he originally have? (Approximate value)", o: ["₹1,200", "₹1,143.8", "₹1,300", "₹1,144.5"], a: 3, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "The compound interest on a sum of ₹8,000 becomes ₹1,261 in 18 months. Find the rate of interest if interest is compounded half-yearly.", o: ["12%", "20%", "10%", "8%"], a: 2, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Two wires, 18 m and 24 m long, are to be cut into pieces of equal length. Find the maximum length of each piece (in m).", o: ["12", "18", "8", "6"], a: 3, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of 5 consecutive odd numbers is 63. Which of the following is the largest number among them?", o: ["65", "69", "67", "71"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the greatest number that divides 90, 180 and 240 exactly.", o: ["20", "60", "15", "30"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "The base of a right-angle triangle is increased by 60%. How much its height should be decreased to retain the same area?", o: ["30%", "45.2%", "60%", "37.5%"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, Which of the following is NOT a type of chart in MS Excel?", o: ["Line chart", "Bar chart", "Pie chart", "Space chart"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following is used in MS Word 365 to change the case in a reverse way?", o: ["Reverse case", "Change case", "Toggle case", "Alter case"], a: 2, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In Microsoft Excel 365, which option should be selected if you want to save a workbook as a macro-enabled workbook with a different file name and location?", o: ["Save As", "Save a Copy", "Save Excel", "Save Workspace"], a: 0, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "What icon is used for attaching a file or document to an email message?", o: ["Pen icon", "Smiley icon", "Paper clip icon", "Trash can icon"], a: 2, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "What is the main purpose of a search engine?", o: ["Editing news articles", "Playing online games", "Sending emails", "Finding information on the internet"], a: 3, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which icon is commonly used to undo the last action performed in MS Word 365?", o: ["A pair of scissors", "A curved arrow pointing to the left", "A trash can", "A pencil"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which of the following keyboard shortcut keys is used to insert a new row in MS-Excel 365?", o: ["Ctrl + Alt + n", "Ctrl + Alt + + (plus key)", "Ctrl + shift + n", "Ctrl + shift + + (plus key)"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "How do we move the cursor to the beginning of a Microsoft Word 365 document?", o: ["By pressing ‘Ctrl + End’", "By pressing ‘Ctrl + Home’", "By pressing ‘Ctrl + PgUp’", "By pressing ‘Ctrl + PgDn’"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following groups within the Insert tab will help us create a table in Microsoft Word 365?", o: ["Tables", "Illustrations", "Pages", "Links"], a: 0, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "What are the icons below the menu bar in a word processing application called?", o: ["Toolbar icons", "Shortcut icons", "Format icons", "Tool icons"], a: 0, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 14 Nov 2023 Shift-3";
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
