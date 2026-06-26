/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 07 Dec 2020 Shift-1
 * 100 Q x 1 mark, 90 min, 0.25 negative. Reuses Exam SSC-DPC + pattern
 * 'Computer-Based Test (CBT)'. Figure questions upload a local image as questionImage.
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc07_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-07dec2020-s1';

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

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 07 Dec 2020 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "As per the Union Budget 2020-21, TDS at the rate of ______ is levied on e-commerce transactions.", o: ["3%", "1%", "2.5%", "0.25%"], a: 1, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "'Akela' is a fictional character in the children's story book ______.", o: ["The Jungle Book", "The Adventures of Tom Sawyer", "The Adventures of Huckleberry Finn", "Alice's Adventures in Wonderland"], a: 0, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "In which of the following years was the Family Courts Act enacted?", o: ["1948", "1984", "1964", "2004"], a: 1, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "The ______ in Punjab is held to commemorate the warriors who laid down their lives in the battle between Guru Gobind Singh and the Mughals.", o: ["Rauza Sharif Urs", "Hola Mohalla", "Maghi Mela", "Jor Mela"], a: 2, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "The Rohtas Fort is located in present day ______.", o: ["Nepal", "Bangladesh", "Pakistan", "India"], a: 2, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "By which Constitutional Amendment Act, the voting age of Indian citizens has been reduced from 21 years to 18 years?", o: ["Constitution (Sixty-first Amendment) Act, 1988", "Constitution (Sixty-second Amendment) Act, 1989", "Constitution (Sixty-fourth Amendment) Act, 1990", "Constitution (Sixty-third Amendment) Act, 1988"], a: 0, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "The Census of India 2011 was the ______ national census after Independence.", o: ["seventh", "ninth", "eleventh", "fifteenth"], a: 0, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Who was the head coach of the Mumbai Indians IPL cricket team in 2019?", o: ["Shane Bond", "James Pamment", "Robin Singh", "Mahela Jayawardene"], a: 3, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which of the following statements is INCORRECT?", o: ["Proteins help build and repair tissues in the human body.", "Extra fat in the human body is stored under the skin.", "Deficiency of iodine in the human body causes anaemia.", "The human body needs minerals in small quantities."], a: 2, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "A football stadium named after Bhaichung Bhutia has been built near his birthplace in ______.", o: ["Manipur", "Sikkim", "Nagaland", "Meghalaya"], a: 1, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which of the following organisations/agencies does NOT operate a 'Payment Bank' in India as of August 2020?", o: ["Fino", "Wipro", "India Post", "Jio"], a: 1, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Which of the following is the mausoleum of Bahaduddinbhai Hasainbhai in Junagadh?", o: ["Chini Ka Rauza", "Chausath Khamba", "Gol Gumbaz", "Mahabat Maqbara"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "The Adichanallur archaeological site is located in the state of ______.", o: ["Karnataka", "Tamil Nadu", "Andhra Pradesh", "Kerala"], a: 1, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "The ______ was/were founded by Sir William Jones in 1784.", o: ["Calcutta Madrasas", "Sanskrit College at Banaras", "Asiatic Society of Bengal", "Fort William College"], a: 2, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Which of the following statements about clayey soil is INCORRECT?", o: ["Clayey soil is used to make pots and toys.", "Clayey soil cannot hold water for long periods.", "There is very little empty space between particles of clayey soil.", "Clayey soil is also called fuller's earth."], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "______ is a disease that generally develops in the lungs with symptoms such as fever, cough, chest pain and weight loss.", o: ["Malaria", "Dengue", "Elephantiasis", "Tuberculosis"], a: 3, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Which of the following statements is true?", o: ["Tsunamis are rare in the Indian Ocean as compared to the Pacific Ocean.", "Warm ocean currents carry water from polar or higher latitudes to tropical or lower latitudes.", "The Burma tectonic plate went under the India tectonic plate causing the tsunami in 2004.", "Tides are lowest on full moon and new moon days."], a: 0, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Who among the following industrialists has served as an MP in the Rajya Sabha?", o: ["Azim Premji", "Gopichand Hinduja", "Vijay Mallya", "Adi Godrej"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Gandhiji requested Indians to observe ______ as a day of non-violent opposition to the Rowlatt Act.", o: ["9 August 1920", "19 March 1920", "26 September 1919", "6 April 1919"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Who among the following cricketers has NEVER received the Rajiv Gandhi Khel Ratna Award?", o: ["Virat Kohli", "Sachin Tendulkar", "Shikhar Dhawan", "MS Dhoni"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Which of the following is a form of music usually associated with Sufism?", o: ["Qawwali", "Thumri", "Khayal", "Ghazal"], a: 0, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which of the following does NOT form part of the fiscal policy of a country?", o: ["Investment or disinvestment strategies", "Tax policy", "Supply of money in the economy", "Debt or surplus management"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Section 43 of the Motor Vehicles Act, 1988 allows for temporary registration of a vehicle for a period NOT exceeding ______.", o: ["6 months", "12 months", "1 month", "2 months"], a: 2, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Which of the following was NOT an intermediary appointed by the British to collect land revenue from the people of India?", o: ["Zamindar", "Mahalwari", "Ryotwari", "Kumaramatya"], a: 3, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Which of the following is an ancient Indian book on surgery?", o: ["Susruta Samhita", "Arthashastra", "Manusmriti", "Charak Samhita"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "In ancient India, the leader of merchant caravans was called ______.", o: ["Maha-danda-nayaka", "Sandhi-vigrahika", "Prathama-kulika", "Sarthavaha"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which Section of the Indian Penal Code deals with punishment for false evidence during judicial proceedings?", o: ["268", "193", "147", "223"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Who among the following governors of Goa was the first to take oath in Konkani language?", o: ["Satya Pal Malik", "Bhagat Singh Koshyari", "Mridula Sinha", "Margaret Alva"], a: 1, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which of the following was a slogan given by Swami Vivekananda?", o: ["Give me blood and I will give you freedom", "Karo Ya Maro", "Inqilab Zindabad", "Arise, awake and stop not till the goal is reached"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "The British reversed the partition of Bengal in ______.", o: ["1909", "1913", "1911", "1905"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "As per the Union Budget 2020-21, a Super Senior Citizen with net income up to ₹______ is exempt from Income Tax.", o: ["7 lakhs", "7.5 lakhs", "5 lakhs", "5.5 lakhs"], a: 2, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Bagurumba is a group dance performed by the ______ community.", o: ["Majhi", "Bodo", "Rathawa", "Varli"], a: 1, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "As of September 2020, the rate of interest under the Emergency Credit Line Guarantee Scheme (ECLGS) announced by the Government of India is capped at ______ for banks and financial institutions.", o: ["6.75%", "8.75%", "7.25%", "9.25%"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following statements is INCORRECT?", o: ["Chlorofluorocarbons (CFCs) are responsible for decrease in atmospheric ozone.", "Ozone is a deadly poison.", "Ozone is a molecule formed by two atoms of oxygen.", "Ozone shields the surface of Earth from ultraviolet (UV) radiation from the Sun."], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Chopad (also known as Chaupar or Chausar) was an ancient Indian ______.", o: ["warfare tactic", "board game", "adventure sport", "weapon"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "______ in India can be classified as rural or urban.", o: ["Private commercial banks", "Public commercial banks", "Development banks", "Co-operative banks"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "अंगूर की बेल ______ का एक उदाहरण है।", o: ["झाड़ी (Shrub)", "जड़ी बूटी (Herb)", "विसर्पी (Creeper)", "आरोही (Climber)"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which of the following committees of the Constituent Assembly was NOT chaired by Rajendra Prasad?", o: ["Union Powers Committee", "Committee on the Rules of Procedure", "Ad hoc Committee on the National Flag", "Finance and Staff Committee"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Vini Mahajan was the first female chief secretary of the state of ______.", o: ["Gujarat", "Tripura", "Kerala", "Punjab"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "The ______ temple in Nepal is also known as the 'Monkey Temple'.", o: ["Pashupatinath", "Buddasubba", "Swayambhunath", "Barashetra"], a: 2, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "With which of the following games/sports is R Praggnanandhaa associated?", o: ["Chess", "Poker", "Table tennis", "Squash"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "'Duns' are longitudinal valleys between the ______ and the Shiwaliks.", o: ["Greater Himalayas", "Ganga-Brahmaputra Plains", "Lesser Himalayas", "Western Plains"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "What was the most popular source of drinking water, as per the Census of India 2011, reported by more than 41% households?", o: ["River", "Tap", "Well", "Hand pump / Tube well"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Which of the following cities lies on the banks of the river Brahmaputra?", o: ["Cuttack", "Guwahati", "Patna", "Delhi"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Which of the following statements is true?", o: ["The Himalayan Mountains lie to the south-east of India.", "Bay of Bengal lies to the north-west of India.", "Arabian Sea lies to the south-west of India.", "The Indian Ocean lies to the north-east of India."], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "As per the Macro-Economic Framework Statement 2020-21, milk production in India grew ______ in 2018-19 over the previous year.", o: ["6.50%", "0.50%", "2.50%", "10.50%"], a: 0, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "As of September 2020, which of the following is the most recent award given to film actress Kangana Ranaut?", o: ["IIFA Award for Best Actress", "National Film Award for Best Actress", "Padma Shri", "CNN-IBN Indian of the Year Special Achievement"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Unregulated Deposit Schemes were banned in India by the 'Banning of Unregulated Deposit Schemes Act, ______'.", o: ["2016", "2018", "2019", "2017"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "The Ficus religiosa is commonly known as the ______ tree in India.", o: ["Babool", "Sal", "Peepal", "Neem"], a: 2, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "The inaugural train under the 'Kisan Rail' scheme announced in the Union Budget 2020-21 ran between ______.", o: ["Bihar and Telangana", "Maharashtra and Bihar", "Chhattisgarh and Karnataka", "Karnataka and Maharashtra"], a: 1, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "दिए गए चार शब्दों में से तीन में एक निश्चित प्रकार की समानता है और एक असंगत है। उस असंगत विकल्प का चयन करें।", o: ["दौरा (Seizure)", "ऐंठन (Convulsion)", "प्रशांति (Calm)", "संकुचन (Cramp)"], a: 2, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "07dec2020-s1-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "The difference between simple interest and compound interest on a certain sum of money for 2 years at 10% per annum is ₹732. Find the sum.", o: ["₹72,300", "₹70,320", "₹73,200", "₹70,230"], a: 2, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following set.\n(4, 19, 41)", o: ["(8, 67, 137)", "(5, 22, 47)", "(11, 124, 215)", "(6, 39, 75)"], a: 0, e: "", qimg: "" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "07dec2020-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "07dec2020-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "07dec2020-s1-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "If SEIZURE is coded as 8231592 and HARMONY is coded as 1919144132, then how will PRODUCE be coded?", o: ["1194235242", "11122234569", "11912236245", "1194232425"], a: 0, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n1, 5, 10, 27, 58, 153, 340, ?", o: ["803", "830", "903", "930"], a: 2, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "07dec2020-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "07dec2020-s1-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "07dec2020-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "07dec2020-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n15 : 90 :: 18 : ?", o: ["126", "146", "164", "261"], a: 0, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "07dec2020-s1-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "07dec2020-s1-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "07dec2020-s1-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n3, 7, 18, 40, 75, 127, 198, 292, 415, 569, ?", o: ["706", "860", "806", "760"], a: 3, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\nInsects : Entomology :: Rocks : ?", o: ["Topology", "Lithology", "Cytology", "Odontology"], a: 1, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "07dec2020-s1-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "07dec2020-s1-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "07dec2020-s1-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "07dec2020-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct?\n176 − 16 + 33 × 6 ÷ 200 = 9", o: ["+ and ÷", "− and ÷", "÷ and ×", "+ and ×"], a: 1, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "07dec2020-s1-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A loan is to be returned in two equal annual instalments. If the rate of interest is 10% p.a., compounded yearly, and each instalment is ₹3,872, then the total interest charged in this instalment scheme is:", o: ["₹1,024", "₹1,020", "₹980", "₹1,050"], a: 0, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "A and B started simultaneously towards each other from places X and Y, respectively. After meeting at point M on the way, A and B took 3.2 hours and 7.2 hours, to reach Y and X, respectively. The time (in hours) taken by them to reach point M was:", o: ["4.8", "5", "4", "5.2"], a: 0, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of 14 numbers is 73.5. If two numbers 60 and 63 are replaced by 58 and 70 and one more number x is included, then the average of the numbers now increases by 1.5. What is the value of x ?", o: ["91", "85", "88", "82"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "The income of A is 60% more than the income of B, and the income of C is 45% less than the total income of A and B. By what percentage is C's income less than that of A's?", o: ["11.225", "11.88", "10.5", "10.625"], a: 3, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "A certain number of students from school A appeared in an examination and 65% of them passed. 100% more students than those in school A, appeared in the same examination from school B. If 75% of the total students that appeared from schools A and B passed, then what is the percentage of students who failed from school B?", o: ["25", "20", "18", "15"], a: 1, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "The rate of interest on a sum for the first 3 years is 8% p.a., for the next 4 years it is 10% p.a., and for the period beyond 7 years it is 16% p.a. If a person gets ₹11,340 as simple interest after 10 years, how much money did he invest?", o: ["₹11,150", "₹12,140", "₹10,140", "₹10,125"], a: 3, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "The curved surface area of a right circular cylinder is 1320 cm² and the radius of its base is 10.5 cm. The volume (in cm³) of the cylinder is: (Take π = 22/7)", o: ["6930", "6908", "6798", "6732"], a: 0, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of ₹16,380 is divided among A, B, C, and D such that the ratio of the shares of A and B is 1 : 3, that of B and C is 2 : 5, and that of C and D is 2 : 3. The share (in ₹) of C is:", o: ["5,400", "8,100", "6,300", "4,500"], a: 0, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Let x be the least number of 4-digits which when divided by 12, 15, 20 and 27 leaves, in each case, a remainder 7. What is the sum of the digits of x ?", o: ["13", "16", "17", "11"], a: 1, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "The value of (0.5̄8̄ ÷ 0.5̄3̄) × 5/33 + 10/21 ÷ 1 1/14 of 5/3 − 5/3 × 1/10 is:", o: ["13/30", "3/5", "3/10", "4/15"], a: 3, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "The marked price of an article is ₹240. It is sold by giving a discount of 10% on the marked price. If the profit is 8%, then what is the cost price of the article?", o: ["₹175", "₹210", "₹180", "₹200"], a: 3, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "A and B can do a piece of work in 10 days and 15 days, respectively. They work together for 4 days. The remaining work is completed by C alone in 12 days. C alone will complete 4/9 part of the original work in:", o: ["24 days", "12 days", "20 days", "16 days"], a: 3, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Roshan bought 36 kg sugar for ₹1,620. He sold it at a profit equal to the selling price of 6 kg of it. His selling price per kg, is:", o: ["₹51", "₹50", "₹54", "₹52"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "In a division sum, the divisor is 18 times the quotient and 9 times the remainder. If the remainder is 26, then the dividend is:", o: ["3055", "3072", "3068", "3042"], a: 2, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "The perimeter of a rhombus is 148 cm and one of its diagonals is 70 cm. Its area is equal to the area of a rectangle whose sides are in the ratio 7 : 3. The longer side of the rectangle is:", o: ["7√10 cm", "8√5 cm", "4√5 cm", "14√10 cm"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts is used to activate a browser tab to the left of the current tab in a Chrome browser?", o: ["Ctrl + Page up", "Alt + Page down", "Alt + Left arrow", "Ctrl + Right arrow"], a: 0, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "What will be the result of the following MS Excel formula? =EVEN(3) + ODD(8)", o: ["9", "14", "13", "11"], a: 2, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Consider a formula \"=B2+4\" in cell A1. If cell A1 is copied and pasted into D4, then what will be the formula in D4?", o: ["=B4+7", "=D4+4", "=E5+4", "=B2+4"], a: 2, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "In MS Excel, the 'Zoom' option appears in the:", o: ["title bar", "formula bar", "status bar", "horizontal scroll bar"], a: 2, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which of the following appears as a part of the 'Paragraph' command group within the Home menu in recent versions of MS Word, such as Word 2016?", o: ["Copy", "Replace", "Bullets", "Format Painter"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "State whether the following statements related to MS Word are true or false? (i) In Landscape orientation, the height of a page is larger than its width. (ii) In Portrait orientation, the width of a page is larger than its height.", o: ["(i) True, (ii) False", "(i) False, (ii) False", "(i) False, (ii) True", "(i) True, (ii) True"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcuts can be used to insert a hyperlink in an MS Word document?", o: ["Alt + K", "Alt + L", "Ctrl + K", "Ctrl + L"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following notations is generally used to represent an IP address in an understandable format?", o: ["Binary notation", "Hexadecimal notation", "Octal notation", "Dotted-decimal notation"], a: 3, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "While printing an MS Word document, we can set the number of copies to be printed. By default, you will have ______ copy/copies of the document.", o: ["one", "two", "three", "eight"], a: 0, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following protocols pulls messages from the email server?", o: ["HTTP", "POP", "SMTP", "Both, SMTP and POP"], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 07 Dec 2020 Shift-1";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 07 Dec 2020 Shift-1", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
