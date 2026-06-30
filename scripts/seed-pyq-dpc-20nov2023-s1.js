/**
 * Seed: Delhi Police Constable - 20 Nov 2023 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc20nov2023_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-20nov2023-s1';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 20 Nov 2023 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "\"______ is the writer of the book 'India Wins Freedom'.\"", o: ["Maulana Abul Kalam Azad", "APJ Abdul Kalam", "Jawahar Lal Nehru", "Mahatma Gandhi"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "_____ accounts for the difference between the concept of market price and factor cost in national income measurement.", o: ["Indirect taxes", "Subsidies", "Direct taxes", "Net indirect taxes"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Madan Singh Chauhan, also known as ‘Guruji’, is a folk and Sufi singer from ___________________.", o: ["Jharkhand", "Uttarakhand", "Haryana", "Chhattisgarh"], a: 3, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Which Article of the Indian Constitution mentions that the laws inconsistent with or in derogation of the fundamental rights will be void?", o: ["Article15", "Article 13", "Article14", "Article16"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Which of the following was the last Five-Year Plan in India before its replacement with NITI Aayog?", o: ["12th Five-Year Plan 2012-2017", "11th Five-Year Plan 2007-2012", "9th Five-Year Plan 2007-2012", "10th Five-Year Plan 2007-2012"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Pillared Verandah and cells are integral parts of which of the following Buddhist structures?", o: ["Tawang Monastery", "Ajanta Caves", "Bodhgaya Temple", "Sanchi Stupa"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Manipuri dance often depicts scenes from the life of which of the following Hindu Gods or Goddess?", o: ["Goddess Durga", "Lord Krishna", "Lord Ram", "Lord Hanuman"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Who can give the order and directives to the government for the enforcement of fundamental rights?", o: ["Prime Minister of India", "President of India", "Governor", "Supreme Court and High Court"], a: 3, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "When government wants to increase the money supply, it:", o: ["purchases government bonds", "sells government bonds", "increases the Cash Reserve Ratio", "increases the Statutory Liquidity Ratio"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "In which of the following years was the peasant movement in Kheda led by Mahatma Gandhi?", o: ["1918", "1909", "1922", "1912"], a: 0, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "The ________ Rebellion in central India broke out in 1910.", o: ["Warli", "Pabna", "Kol", "Bastar"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Consider the following factors. a) Extreme climatic conditions in the Himalayas and the Indian Thar Desert. b) Lack of medical facilities in rural areas. c) Availability of employment in metro cities. d) Poverty in rural India. e) Education facilities in urban areas. Which of the given factors are NOT pull factor(s) for migration in India?", o: ["Only a, b and d", "All except d", "Only c and e", "Only b and d"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "The ‘Make in India’ programme, which started in 2014, is similar to _____________ of the 1970s and 1980s in India.", o: ["Import substitution policy", "License permit raj", "Export-oriented industrial development", "Free trade policy"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "The Ajanta Caves are located on the left bank of which of the following rivers?", o: ["Waghora", "Krishna", "Mahanadi", "Tungabhadra"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Rajaraja I, who assumed power in 985 CE and was known as one of the most powerful kings in South India, belonged to the _________ dynasty.", o: ["Chalukaya", "Chola", "Pallava", "Pandya"], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Junagadh Rock Inscription belongs to whom among the following rulers?", o: ["Bindusara", "Satakarni I", "Rudradaman I", "Kanishka"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Nadaswaran instrument is played by _________ .", o: ["Sheikh Chinna Moula", "KV Prasad", "Panalal Ghosh", "Totaram Sarma"], a: 0, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Non-stick pans are coated with __________.", o: ["polytetrabromoethylene", "polytetrachloroethylene", "polytetrafluoromethylene", "polytetrafluoroethylene"], a: 3, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Kalyani Kutti Amma received the Sangeet Natak Akademi Award for which form of dance?", o: ["Kathakali", "Kuchipudi", "Mohiniattam", "Kathak"], a: 2, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Who is the author of the work ‘Kadambari’?", o: ["Banabhatta", "Vilhad", "Aryabhata", "Bhans"], a: 0, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Which of the following taxes was related to the land revenue (tax on agricultural land) system of the Delhi sultanate?", o: ["Khams", "Zakat", "Kharaj", "Jizya"], a: 2, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Wangala is a popular harvest festival of which Indian state?", o: ["Uttar Pradesh", "Bihar", "Meghalaya", "West Bengal"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "In which state of Myanmar do the Rohingyas primarily reside?", o: ["Shan", "Kayah", "Chin", "Rakhine"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Which of the following is an INCORECT statement related to dental health?", o: ["Tooth enamel, made up of calcium hydroxyapatite is the hardest substance in the body.", "Bacteria present in the mouth produce acids by degradation of sugar and food particles remaining in the mouth after eating.", "Tooth decay starts when the pH of the mouth is lower than 5.5.", "Toothpaste, which is generally acidic, prevents tooth decay."], a: 3, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Padma Shri awardee Pratibha Prahlad is an exponent of which of the following dance forms?", o: ["Kathak", "Kuchipudi", "Odissi", "Bharatanatyam"], a: 3, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Raja Reddy is associated with which of the following dance forms?", o: ["Bharatanatyam", "Kuchipudi", "Kathakali", "Kathak"], a: 1, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "The atomic number of oxygen is _______.", o: ["7", "16", "8", "14"], a: 2, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Which of the following years is related to the SARFAESI Act?", o: ["2002", "2000", "1999", "2004"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which mineral composed of silicon and oxygen with chemical composition of SiO2 is mainly used in glass making, abrasive, foundry sand, hydraulic fracturing proppant, gemstone?", o: ["Olivine", "Muscovite", "Augite", "Quartz"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Which of the following Union territories has the lowest population density according to the 2011 census?", o: ["Delhi", "Andaman and Nicobar Islands", "Daman and Diu", "Puducherry"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "The level of urbanisation in India is measured in terms of ________ of urban population to total population.", o: ["decimal", "ratio", "fraction", "percentage"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "The ‘Rashtriya Swayamsevak Sangh’ was founded in which of the following districts of Maharashtra?", o: ["Amravati", "Nagpur", "Ahmednagar", "Pune"], a: 1, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "The Joint Sitting of the Lok Sabha and Rajya Sabha need a ________ quorum of the Indian Parliament.", o: ["15%", "5%", "20%", "10%"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "The length of a tennis court is _________ .", o: ["78 ft", "70 ft", "80 ft", "73 ft"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Suryakumar Yadav is associated with which of the following games?", o: ["Boxing", "Football", "Cricket", "Wrestling"], a: 2, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "The method of Election of the President of the India in the Constitution was taken from the Constitution of ___________.", o: ["Ireland", "Canada", "South Africa", "the Unites States of America"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "President Sukarno of _______ was the Guest of Honour during India's first Republic Day event in 1950.", o: ["Indonesia", "Malaysia", "Maldives", "Singapore"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Under ‘Atal Beemit Vyakti Kalyan Yojana’, up to how much per cent of average wages is provided as payment relief which is payable up to maximum 90 days of unemployment?", o: ["50%", "30%", "25%", "33%"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Which of the following is a push factor of globalisation of business?", o: ["Availability of cheap raw material in the host country", "Higher rates of return in host economies", "Availability of cheap labour in the host country", "Saturation of domestic market"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "The Bokaro Steel Plant is located in:", o: ["Maharashtra", "Chhattisgarh", "Rajasthan", "Jharkhand"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "The term ‘village panchayats’ is mentioned in which of the following Articles of the Constitution of India?", o: ["Article 47", "Article 40", "Article 49", "Article 51"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "The Siberian Shelf, one of the coastal shelves of the Arctic Ocean, is the largest continental shelf on Earth. How many kilometres does it extend offshore?", o: ["600 km", "910 km", "1,700 km", "1,500 km"], a: 3, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Which of the following does NOT play a crucial role in shaping Indian monsoons?", o: ["Jet Stream", "Western Disturbances", "Intertropical Convergence Zone (ITCZ)", "Tibetan Plateau"], a: 1, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "The English novel ‘Little Women’ was written by which of the following authors?", o: ["George Eliot", "Herman Melville", "Louisa May Alcott", "Anthony Trollope"], a: 2, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "After independence, the 1st national games were hosted by which of the following cities?", o: ["Delhi", "Kolkata", "Bombay", "Lucknow"], a: 3, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "How many seats are reserved for scheduled castes in Lok Sabha?", o: ["86", "82", "84", "85"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "In food processing, which miscellaneous constituent obtained from the maize plant is mixed with water or juice and boiled to form fillings and give products a glossy semi- clear finish?", o: ["Cornstarch", "Acacia", "Gelatin", "Algin"], a: 0, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "भारत के संविधान का निम्नलिखित में से कौन-सा अनुच्छेेद, राज्य की कार्यकारी शक्तियों की सीमा के विषय में उल्लेख करता है?", o: ["अनुच्छेेद 168", "अनुच्छेेद 177", "अनुच्छेेद 165", "अनुच्छेेद 162"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Who among the following founded an organisation called the Indian Association, in 1876, along with Surendranath Banerjee?", o: ["Benoy Krishna Bose", "Jatindranath Mukherjee", "Ananda Mohan Bose", "Chittaranjan Das"], a: 2, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Which State won the 11th Junior National Men’s Hockey Championship?", o: ["Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Haryana"], a: 0, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? WIP, ULN, SOL, ?, OUH", o: ["RRK", "QSK", "QRJ", "RSJ"], a: 2, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "A, B, C, D, E, F and G were sitting in a straight row, facing north. G was second to the left of A. Only C was to the right of F. A was exactly between B and D. E was to the immediate left of F. Who among the following was at the extreme left end of the row?", o: ["D", "B", "G", "E"], a: 2, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding/deleting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed) (16, 40, 5),(3, 27, 18)", o: ["(8, 29, 7)", "(9, 27, 6)", "(7, 26, 8)", "(9, 35, 6)"], a: 1, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘FOOD’ is coded as ‘HMQB’ and ‘EDGE’ is coded as ‘GBIC’. How will ‘MEAT’ be coded in the same language?", o: ["OCDS", "PCCR", "PDCR", "OCCR"], a: 3, e: "", qimg: "" },
  { n: 55, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "20nov2023-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the word-pair that best represents a similar relationship to the one expressed in the pair of words given below. (The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word.) Clarify : Explain", o: ["Raise : Lift", "Boring : Exciting", "Blow : Air", "Mother : Home"], a: 0, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "20nov2023-s1-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the figure from the options that can replace the question mark (?) and complete the given pattern.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "20nov2023-s1-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "20nov2023-s1-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "20nov2023-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Six letters, L, M, N, O, P and Q are written on different faces of a dice. Three positions of this dice are shown here. Find the letter on the face opposite M.", o: ["Q", "L", "O", "P"], a: 3, e: "", qimg: "20nov2023-s1-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "20nov2023-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "20nov2023-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given expression. 23 * 9 * 13 * 96 * 2 * 92", o: ["×, +, –, ÷, =", "÷, +, ×, –, =", "+, –, ×, ÷, =", "+, ×, –, ÷, ="], a: 3, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the figure from the options that can replace the question mark (?) and complete the given pattern.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "20nov2023-s1-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "20nov2023-s1-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Which of the following options will replace the question mark (?) in the given series? 109, 101, 93, 85, 77, ?", o: ["52", "61", "69", "58"], a: 2, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 4 : 125 :: 9 : ? :: 11 : 1728", o: ["999", "512", "1000", "729"], a: 2, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: All computers are machines. Some computers are robots. Conclusions: I. All robots are computers. II. Some machines are robots.", o: ["Only Conclusion I follows.", "Only Conclusion II follows.", "Both Conclusions I and II follow.", "Neither Conclusion I nor II follows."], a: 1, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "20nov2023-s1-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["12", "10", "11", "13"], a: 3, e: "", qimg: "20nov2023-s1-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "20nov2023-s1-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "20nov2023-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct? 87 + 85 − 25 × 3 ÷ 291 = 3", o: ["÷ and +", "+ and −", "= and ÷", "− and ×"], a: 2, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "20nov2023-s1-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "If the breadth of the rectangle is decreased by 40% and its length is increased by 25%, find the percentage change in its area.", o: ["5% increase", "90% decrease", "75% decrease", "25% decrease"], a: 3, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "When 24 is subtracted from a number, it reduces to 60%. The two-fifth of that number is:", o: ["48", "36", "24", "60"], a: 2, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["8.75", "8.54", "5.87", "9.12"], a: 0, e: "", qimg: "20nov2023-s1-q-78.png" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "20nov2023-s1-q-79.png" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "A machine was offered a 16% trade discount on the marked price of ₹30,000. After some cash discount, the machine was sold for ₹23,184. The cash discount is:", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "20nov2023-s1-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "A camp has provisions for 60 persons for 18 days. In how many days will the same provisions finish off if the strength of the camp is increased to 90 persons?", o: ["12 days", "18 days", "8 days", "15 days"], a: 0, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "The average marks of three classes of 50, 65 and 45 students, respectively, are 75, 80 and 90. Find the average marks of all the students.", o: ["91.65", "81.25", "75.81", "71.65"], a: 1, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A device is available for ₹8,000 cash or ₹500 down payment followed by four equal monthly instalments. If the rate of simple interest charged is 25% per annum, then find the instalment, to the nearest rupee.", o: ["₹1,977", "₹1,987", "₹1,970", "₹1,790"], a: 2, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Which of the following numbers is NOT a prime number?", o: ["1571", "1471", "1271", "1171"], a: 2, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "The cost price of an item is one-fourth of its selling price. What is the gain or loss percentage on that item?", o: ["Gain of 300%", "Loss of 100%", "Gain of 100%", "Loss of 300%"], a: 0, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "The sum of five consecutive integers is 235. Which of the five integers is prime?", o: ["47", "51", "43", "53"], a: 0, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of the number of boys to that of the girls in a school is 5 : 7. If there are 1148 girls in the school, how many boys are there in that school?", o: ["830", "840", "820", "810"], a: 2, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["110.5 cm3", "101.2 cm3", "93.4 cm3", "103.4 cm3"], a: 3, e: "", qimg: "20nov2023-s1-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of ₹32,760 was taken as a loan. This is to be paid in three equal annual instalments. If the rate of interest is 20% compounded annually, then the value of each instalment is:", o: ["₹11,000", "₹10,000", "₹15,552", "₹16,552"], a: 2, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "If 27 identical small spheres are made out of a big sphere of diameter 6 cm, what is the radius (in cm) of the small sphere?", o: ["1", "2", "1.5", "0.5"], a: 0, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following components is responsible for translating domain names (e.g., www.example.com) into IP addresses (e.g. 192.168.1.1) to enable communication over the internet?", o: ["Firewall", "Modem", "DNS Server", "Router"], a: 2, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following shortcut keys is used to get context sensitive Help in MS Word 365?", o: ["Press F6", "Press F10", "Press F1", "Press F7"], a: 2, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In Microsoft Word 2019, which of the following settings is NOT found in the 'Indents and Spacing' tab of the 'Paragraph' dialog box?", o: ["General", "Indentation", "Spacing", "Pagination"], a: 3, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "When editing data in an MS Excel 365 worksheet, which of the following actions will allow you to reverse your recent changes?", o: ["Paste", "Undo", "Save", "Copy"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "What is the shortcut command in MS-Word 365 for selecting all the words from the file?", o: ["Ctrl + X", "Ctrl + C", "Ctrl + A", "Ctrl + Z"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which keyboard shortcut allows you to edit the content of a selected cell directly in the cell itself in Microsoft Excel 365?", o: ["Ctrl + E", "Ctrl + C", "F12", "F2"], a: 3, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcut keys is used to pick a new font for the selected text in MS-Word 365?", o: ["Ctrl + Alt + F", "Ctrl + Shift + F", "Ctrl + F", "Shift + F"], a: 1, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "What is the category of software that enables word processing, database management, graphic manipulation and spreadsheet creation?", o: ["Structure", "Application", "Framework", "System"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which social networking platform is known for its character limit on posts and real- time updates?", o: ["Facebook", "LinkedIn", "Instagram", "Twitter"], a: 3, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, What is the main purpose of using a chart in MS Excel?", o: ["To format text", "To perform calculations", "To store data", "To visually represent data"], a: 3, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 20 Nov 2023 Shift-1";
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
