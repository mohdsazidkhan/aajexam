/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 11 Dec 2020 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc11s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-11dec2020-s2';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 11 Dec 2020 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "On 21 August 2020, former Finance Secretary Rajiv Kumar was appointed as:", o: ["the Election Commissioner", "a member of UPSC", "the Defence Secretary", "the Secretary of State for Education"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Pandit Jasraj was related to which of the following fields?", o: ["Fiction writing", "Classical instrument", "Classical singing", "Classical dance"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "To treat the eye disease known as myopia or near sightedness, which of the following lenses is used?", o: ["Convex lens", "Concave lens", "Bifocal lens", "Compound lens"], a: 1, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "The 101st Amendment to the Indian Constitution is concerned with:", o: ["Citizenship Act", "Goods and Services Tax (GST)", "Right to Work", "Fundamental Rights"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "The headquarters of National Bank of Agriculture and Rural Development (NABARD) is situated at:", o: ["Delhi", "Kolkata", "Mumbai", "Bengaluru"], a: 2, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "The horizontal rows in Mendeleev's periodic table are called as:", o: ["Periods", "Gradation", "Subgroups", "Groups"], a: 0, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Who are the authors of the book, ‘The Book of Gutsy Women’?", o: ["Jokha Alharthi and Michael Wood", "Michelle Obama and Barak Obama", "Hillary Clinton and Bill Clinton", "Hillary Clinton and Chelsea Clinton"], a: 3, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "How many members are nominated by the President of India to the Rajya Sabha (Council of States)?", o: ["15", "2", "10", "12"], a: 3, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "The Constituent Assembly which had been elected for the framing of the Constitution held its first meeting on:", o: ["15 December 1947", "15 August 1947", "9 December 1946", "9 December 1947"], a: 2, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Who among the following acts as the Chairman of the GST (Goods and Services Tax) Council?", o: ["Prime Minister of India", "Union Finance Minister", "Chief Cabinet Secretary", "Union Finance Secretary"], a: 1, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which international organisation is the current governing body of Badminton?", o: ["Badminton World Federation", "International Badminton Committee", "International Paralympic Committee", "International Olympic Committee"], a: 0, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "‘Bibi ka Maqbara’ is a famous historical monument situated in:", o: ["Bhopal, Madhya Pradesh", "Lucknow, Uttar Pradesh", "Aurangabad, Maharashtra", "Vijayawada, Andhra Pradesh"], a: 2, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "आFथक सवˇ ण 2019-2020 क मु य वषय-व5तु न'निलिखत म से या है?", o: ["वKीय समावेशन", "रोज़गार सृजन", "ह रत अथ' व था", "संप K नमा'ण"], a: 3, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which of the following instruments is used to measure the blood pressure in humans?", o: ["Galvanometer", "Diopter", "Blood meter", "Sphygmomanometer"], a: 3, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "During the 1920s, the ‘Self-respect movement’ took place in which state of India?", o: ["Tamil Nadu", "Uttar Pradesh", "West Bengal", "Maharashtra"], a: 0, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Who is the chairman of the 15th Finance Commission of India?", o: ["Nand Kishore Singh", "YV Reddy", "Vipul Krishna", "Nishikant Das"], a: 0, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Which part of the Indian Constitution deals with the Directive Principles of State Policy?", o: ["Part 2", "Part 5", "Part 3", "Part 4"], a: 3, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "What is the chemical name for vitamin B12?", o: ["Thiamin", "Riboflavin", "Cobalamin", "Niacin"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Which of the following regions of India is famous for its folk dance called ‘Shondol Dance’?", o: ["Uttarakhand", "Arunachal Pradesh", "Ladakh", "Karnataka"], a: 2, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Who among the following has been elected as the Prime Minister of Sri Lanka in August 2020?", o: ["Maitripal Sirisena", "M Premdasa", "Mahindra Rajapaksa", "Gotabaya Rajapaksa"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Who among the following moved the historic ‘Objectives Resolution’ in the Constituent Assembly of India?", o: ["KM Munshi", "Rajendra Prasad", "Maulana Abul Kalam Azad", "Jawaharlal Nehru"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Who among the following had been appointed as the CEO of Google's parent company Alphabet Inc. in December 2019?", o: ["Jeff Bezos", "Sundar Pichai", "Thomas Canning", "Mark Zuckerberg"], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "The famous ‘Ramosi Uprising’ against the British Rule took place in India during the latter half of the 19th century. From the following options, identify the region where it occurred.", o: ["Bundelkhand region", "Chota Nagpur region", "Western Maharashtra", "Southern region of India"], a: 2, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Who among the following shifted his capital from Delhi to Daulatabad?", o: ["Qutubuddin Aibak", "Alauddin Khalji", "Muhammad Bin Tughluq", "Ibrahim Lodi"], a: 2, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "The famous hill station ‘Pachmarhi’ in Madhya Pradesh is situated in which of the following mountain ranges?", o: ["Aravali mountain range", "Satpura mountain range", "PirPanjal mountain range", "Shivalik mountain range"], a: 1, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Which of the following type of soils in India is locally known as ‘Regur soil’?", o: ["Red soil", "Forest soil", "Black cotton soil", "Alluvial soil"], a: 2, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "When did Mahatma Gandhi launch the Quit India Movement?", o: ["8 August 1946", "8 August 1942", "8 August 1944", "8 August 1932"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Where in India is the famous Dhamek Stupa located?", o: ["Sarnath, Uttar Pradesh", "Ujjain, Madhya Pradesh", "Bhagalpur, Bihar", "Gangtok, Sikkim"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which of the following is the second largest ocean in the world?", o: ["Atlantic Ocean", "Pacific Ocean", "Indian Ocean", "Antarctic Ocean"], a: 0, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "In December 2019, the famous Spanish top division football League ‘La Liga’ for the first time in its history named a non-footballer as its brand ambassador. Identify the sportsperson from the given options.", o: ["MS Dhoni", "Gita Phogat", "Rohit Sharma", "Mary Kom"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "In which city did the Khelo India Youth Games 2020 take place?", o: ["Delhi", "Lucknow, Uttar Pradesh", "Guwahati, Assam", "Pune, Maharashtra"], a: 2, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "The river 'Son' is a tributary of which of the following rivers?", o: ["Ganga", "Yamuna", "Narmada", "Mahanadi"], a: 0, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Who among the following was appointed as Controller General of Accounts of India in 2019?", o: ["PK Sinha", "Soma Roy Burman", "Pradip Mishra", "Arundhati Basak"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Gross Domestic Product (GDP) measured at market prices or current prices is called as:", o: ["Nominal GDP", "Real GDP", "Actual GDP", "Practical GDP"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "When was the Fiscal Responsibility and Budget Management Act (FRBM Act) approved by the Parliament?", o: ["2007", "2003", "2004", "2006"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "In which state of India is the ‘Bihu festival’ celebrated?", o: ["Arunachal Pradesh", "Nagaland", "Assam", "Meghalaya"], a: 2, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Which acid is produced in the human stomach to help the digestion of food?", o: ["Sulphuric acid", "Tartaric acid", "Nitric acid", "Hydrochloric acid"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "The Commission for Agriculture Cost and Prices (CACP), earlier named as Agriculture Prices Commission, was established in:", o: ["January 1965", "January 1956", "December 1965", "December 1975"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "The term ‘Yellow Revolution’ is related to which of the following sectors in India?", o: ["Fisheries production", "Oil seeds production", "Fruit production", "Rice production"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "‘Wood's Dispatch’ sent by the British Government in India in 1854 was related to which sector?", o: ["Political matters of India", "Indian education", "Development of railways in India", "Industrial growth in India"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Which of the following periods is considered as a period of steady population growth in India?", o: ["1981-2001", "1921-1951", "1951-1981", "1991-2011"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "The famous ‘Hornbill festival’ is celebrated in which state of India?", o: ["Nagaland", "Himachal Pradesh", "Sikkim", "Kerala"], a: 0, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "The ‘Polly Umrigar Award’ is conferred in which sports category?", o: ["Football", "Hockey", "Badminton", "Cricket"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Who is the recipient of the 28th Saraswati Samman for 2018?", o: ["K Dinkar Rao", "K Siva Reddy", "Bhalchandra Nemade", "Nasir Sharma"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Recently in March 2020 two public sector banks namely, the Oriental Bank of Commerce, and the United Bank of India were merged into another public sector bank. What is the name of that bank?", o: ["Punjab National Bank", "Bank of Baroda", "Union Bank of India", "State Bank of India"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which of the following is a name of the bone in human leg?", o: ["Incus", "Stapes", "Patella", "Malleus"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "In which article of the Indian Constitution is the procedure for the impeachment of the President given?", o: ["Article 61", "Article 69", "Article 52", "Article 56"], a: 0, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "To which part of ancient and medieval India is the ‘Sangam Literature’ related?", o: ["North India", "East India", "North-East India", "South India"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "In which of the following states did the famous ‘Moplah revolt’ take place during the freedom struggle?", o: ["Uttar Pradesh", "Orissa", "Bihar", "Kerala"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Which of the following was a famous port town during the Indus Valley Civilization era?", o: ["Lothal", "Mohenjodaro", "Harappa", "Dholavira"], a: 0, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "11dec2020-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "11dec2020-s2-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "11dec2020-s2-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "11dec2020-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "11dec2020-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "11dec2020-s2-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n3, 15, 30, 46, 75, 115, 186, 286, ?", o: ["432", "423", "443", "434"], a: 2, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n42 : 82 :: 72 : ?", o: ["152", "215", "125", "251"], a: 0, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n7, 11, 20, 35, 70, 133, 268, ?", o: ["527", "572", "752", "725"], a: 0, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "11dec2020-s2-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "नीचे दिए गए चार शब्दों में से तीन एक निश्चित प्रकार से समान हैं और एक भिन्न है। उस भिन्न विकल्प का चयन करें।", o: ["पालक", "प्याज", "मूली", "शलजम"], a: 0, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "11dec2020-s2-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "11dec2020-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "11dec2020-s2-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "11dec2020-s2-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following set.\n(26, 8, 36)", o: ["(33, 6, 54)", "(22, 15, 41)", "(24, 2, 66)", "(19, 2, 25)"], a: 0, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "11dec2020-s2-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Three different positions of the same dice are shown. Select the number on the face opposite the face showing '3'.", o: ["5", "4", "2", "6"], a: 3, e: "", qimg: "11dec2020-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "If SYNTAX is coded as 8213713 and MOULD is coded as 14461523, then how will DESIGN be coded?", o: ["232832013", "235892013", "45892013", "42832014"], a: 0, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "11dec2020-s2-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "'मोतियाबिंद' का 'आँख' से वही संबंध है, जो संबंध 'खाज' (Eczema) का '________' से है।", o: ["पैर", "जीभ", "त्वचा", "कान"], a: 2, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "11dec2020-s2-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "11dec2020-s2-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct?\n784 − 4 + 18 × 16 ÷ 84 = 400", o: ["× and ÷", "− and ÷", "− and +", "× and +"], a: 1, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "A bus has travelled from Nagpur to Sikoli without stopping. It covers the first 50 miles of the journey at an average speed of 75 mph. What was the bus's average speed (in mph) for the remaining 146 miles, if its overall average speed was 65 mph?", o: ["65", "28", "50", "40"], a: 0, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "The price of an item increases by 10% every year. If the difference between its prices at the end of the 4th year and 5th year is ₹58.50, then what will be its price at the end of the 2nd year?", o: ["₹585", "₹540", "₹612", "₹630"], a: 0, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "A is 40% more than B, and C is 50% less than the sum of A and B. By what percentage is C more than A (correct to one decimal place)?", o: ["16.9", "17.3", "14.7", "15.2"], a: 1, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "By selling 32 articles, a shopkeeper gains the selling price of 12 articles. His gain percentage is:", o: ["31¼ %", "50½ %", "60%", "64%"], a: 2, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Let n be the greatest 4-digit number which when divided by 4, 5, 6, 7 and 8 leaves the remainder 3 in each case. What is the sum of the digits of n?", o: ["19", "18", "21", "16"], a: 0, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "A cylindrical bucket of radius 56 cm and height 54 cm is filled with sand. The bucket is emptied on the ground and a conical heap of base radius x cm is formed. If the height of the heap is 72 cm, then what is the value of x?", o: ["108", "196", "144", "120"], a: 2, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "A person rows 30 km upstream and the same distance downstream. The total time taken by him for this whole journey is 7½ hours. If the speed of the stream is 5 km/h, then in how many hours does the person row a distance of 100 km upstream?", o: ["9.6", "8.4", "10", "9"], a: 3, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "If a sum of ₹1,648 is divided into three parts such that 4 times the first part is equal to 5 times the second part and 7 times the third part, then the difference between the second and third part is:", o: ["₹336", "₹448", "₹840", "₹504"], a: 1, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of ten numbers is 72.8. The average of the first six numbers is 58.5 and the average of the last five numbers is 64.4. If the 6th number is included, then what is the average of the remaining numbers?", o: ["65.8", "66.5", "67", "66"], a: 1, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Pipe A is a filling pipe, while B and C are emptying pipes. Pipe A alone can fill a tank in 10 hours and pipe C alone can empty the full tank in 24 hours. If all three pipes are opened together, the tank is completely filled in 40 hours. In how many hours can pipe B alone empty two-third part of the tank?", o: ["24", "20", "18", "30"], a: 1, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum amounts to ₹47,664 in 3 years at 5% p.a., interest being compounded yearly. If the same sum amounts to ₹x in 2 years at the same rate when the interest is compounded half-yearly, then the value of x (in ₹) is:", o: ["40,174", "39,930", "41,261", "42,592"], a: 3, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "In a division sum, the divisor is 14 times the quotient and 7 times the remainder. If the remainder is 34, then the dividend is:", o: ["4063", "4080", "4097", "4414"], a: 1, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "The value of (2/3 + 1⅗ of 5/9 − 5/9) ÷ 3/4 − 5/11 is:", o: ["5/4", "25/9", "4/9", "17/18"], a: 2, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "The area of a circular garden is equal to 22/7 of the area of a triangular field whose sides are 50 m, 84 m and 110 m. What is the perimeter (in m) of the garden? (Take π = 22/7)", o: ["154", "176", "220", "132"], a: 1, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "A certain sum amounts to ₹13,860 after 3 years and to ₹16,170 after 5 years at the same rate per cent per annum at simple interest. What will be the simple interest (in ₹) on a sum of ₹6,000 for 4½ years at the same rate?", o: ["4,650", "4,684", "4,774", "4,752"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Ram marks an article at ₹84.50 above the cost price. He incurs a loss of 30% when he sells the article after allowing 30% discount on its marked price. What is the cost price of the article?", o: ["₹148", "₹147", "₹154", "₹160"], a: 0, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following is used to change the text colour in an MS Word document?", o: ["Text highlight color", "Font color", "Shading", "Styles"], a: 1, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following option can be used to change the column width of a table in MS Word?", o: ["Alignment", "Title bar", "Scroll bar", "Ruler"], a: 3, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In an MS Excel sheet, a cell address is composed of the_.", o: ["cell's row", "worksheet number", "cell's column", "cell's column and row"], a: 3, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following icon is used to add an attachment to an email?", o: ["Stationery icon", "Paper clip icon", "GIF icon", "Emoji icon"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which of the following is the slowest type of internet service?", o: ["Dial-up", "3G and 4G", "Satellite", "Digital Subscriber Line"], a: 0, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "was the first web browser to implement the omnibox.", o: ["Mozilla Firefox", "Safari", "Lynx", "Google Chrome"], a: 3, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following is used to move an active cell to the first column on the current row?", o: ["Page up", "Ctrl + Home", "Page down", "Home"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a valid MS Excel 2007 formula?", o: ["SUMPRODUCT", "SUMIF", "SUM", "SUMADD"], a: 3, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following keyboard shortcut is used to insert a hyperlink in an MS Word 2007 document?", o: ["Alt + K", "Ctrl + Return", "Ctrl + K", "Alt + ="], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "s NOT a valid option of oﬃce button in MS Word 2007.", o: ["Print", "Save As", "Save", "Presentation"], a: 3, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 11 Dec 2020 Shift-2";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 11 Dec 2020 Shift-2", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
