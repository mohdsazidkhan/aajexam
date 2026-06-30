/**
 * Seed: Delhi Police Constable - 28 Nov 2023 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc28nov2023_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-28nov2023-s2';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 28 Nov 2023 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "As per India Skills Report 2022, which Indian state got the first rank with the most employable talent?", o: ["Goa", "Kerala", "Uttar Pradesh", "Maharashtra"], a: 3, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Baishagu is celebrated in which of the following states?", o: ["Punjab", "Assam", "Goa", "Bihar"], a: 1, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "What do you mean by ‘cant’ in kabaddi?", o: ["A player in whose court a raid is made", "A special point is given to an opponent", "A player who enters the court", "Repeating round of the word ‘kabaddi’"], a: 3, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Which of the following is the oldest atomic power plant of India?", o: ["Tarapur", "Kaiga", "Kakrapar", "Narora"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT included in Article 19 of the Constitution of India?", o: ["To reside and settle in any part of India", "To practice any profession or occupation", "To form associations and unions", "To prohibit ineligibility in respect of employment"], a: 3, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Where is the secretariat of the Goods and Services Tax Council located?", o: ["Chandigarh", "Mumbai", "Kolkata", "New Delhi"], a: 3, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Some qualities of Samudragupta are shown on coins, such as on one of the coins he is shown playing the _________.", o: ["Table", "sarangi", "veena", "bansuri"], a: 2, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Which of the following is the largest, double membrane-bound organelles, which contain all the cell’s genetic information?", o: ["Ribosome", "Peroxisomes", "Lysosome", "Nucleus"], a: 3, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a central bank’s function?", o: ["Lending to commercial banks", "Banking facilities for the public", "Financial services for the government", "Lending to the government"], a: 1, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which Treaty resulted in the demarcation of territories between Ranjit Singh and the East India Company?", o: ["Lahore", "Surat", "Amritsar", "Bhaironwal"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Capital market is a market for ________ funds.", o: ["long term", "medium term only", "short term", "both short term and long term"], a: 0, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "As per Article 350 B of the Constitution of India, who appoints the Special Officer for Linguistic Minorities?", o: ["Governor", "Chief Justice of India", "Prime Minister", "President"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "NITI Aayog came into existence in 2015. On which date was it formed?", o: ["31st January", "15th August", "1st March", "1st January"], a: 3, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Name the place where “independent” parallel government by Indians was established during the Quit India movement as a mark of revolt against British government.", o: ["Satara", "Kalpi", "Rohtak", "Kanpur"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Who proposed to pass an Act for the repair and protection of historical monuments of the country?", o: ["Lord Mayo", "Lord Northbrook", "Lord Curzon", "Lord Canning"], a: 2, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "In the popular traditions of Vijayanagara, the Deccan Sultans are termed as ________.", o: ["Gajapati", "Narapati", "Sherapati", "Ashvapati"], a: 3, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "When was the first edition of the Durand Cup played in India?", o: ["1988", "1900", "1880", "1888"], a: 3, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "With which of the following gharanas is Ustad Bade Ghulam Ali Khan associated?", o: ["Kirana gharana", "Patiala gharana", "Agra gharana", "Banaras gharana"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Who conceptualised the idea about animal ecology in 1927?", o: ["Rachel Carson", "Arthur George Tansle", "Charles Elton", "Aldo Leopold"], a: 2, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "What is the duration of a Kabaddi match?", o: ["Two halves of 40 minutes, with a half time break of 5 minutes", "Two halves of 30 minutes, with a half time break of 10 minutes", "Two halves of 20 minutes, with a half time break of 5 minutes", "Two halves of 45 minutes, with a half time break of 10 minutes"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Select the INCORRECT combination of festival and its significance.", o: ["Eid-Milad-ul-Nabi – The birth anniversary of Prophet Muhammad", "KarvaChauth – Married women observe a fast from sunrise to moonrise", "Kartik Purnima – Marks the birth anniversary of Guru Gobind Singh", "Makar Sankranti – Also known as Uttarayana, Lohri, Pongal, Bihu and the Khichdi festival"], a: 2, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Fundamental duties are mentioned in which part of the Indian Constitution?", o: ["Part III-B", "Part III-A", "Part IV-A", "Part II-A"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "पुणे में लड़कियों के लिए देश के पहले स्कूूल की पहली प्रधानाध्यापिका कौन थीं?", o: ["पंडिता रमाबाई", "सावित्री बाई फुले", "एनी बेसेंट", "विजया लक्ष्मी पंडित"], a: 1, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Even in 1990, what proportion of the country’s population continued to be employed in agriculture?", o: ["35%", "65%", "90%", "50%"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Which of the following dances of Assam is associated with the worship of the snake goddess Manasa?", o: ["Bhor Tal Nritya", "Deodhani", "Jhumur", "Bagurumba"], a: 1, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Which of the following dancers is associated with the following two dances - Bharatanatyam and Odissi?", o: ["Shovana Narayan", "Padma Subrahmanyam", "Sonal Mansingh", "Guru Bipin Singh"], a: 2, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Gulabo, a world-renowned dancer, is best known for which of the following dance forms?", o: ["Pandwani", "Ghoomar", "Panthi", "Kalbeliya"], a: 3, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "What kind of image does the eye lens form of the object on the retina?", o: ["Inverted real image", "No image", "Real and opaque image", "Inverted virtual image"], a: 0, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Liberalisation means:", o: ["increase in restrictions on imports and exports", "increase in control of government over the private sector", "reduction in control of government over the private sector", "free play of market forces in all sectors with no controls"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Which of the following movements is included in volcanism?", o: ["Molten rock", "Sedimentary rocks", "Hard rocks", "Metamorphic rock"], a: 0, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "According to the Ministry of Commerce and Industry 2022, which state is the largest producer of grapes?", o: ["Maharashtra", "Andhra Pradesh", "West Bengal", "Arunachal Pradesh"], a: 0, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "The ‘Mission Solar Charkha’ scheme was launched in the year 2018 by ________ of the Government of India.", o: ["Ministry of Skill Development and Entrepreneurship", "Ministry of Commerce and Industry", "Ministry of Rural Development", "Ministry of Micro, Small and Medium Enterprises"], a: 3, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Which of the following countries is the second most populous country in South Asia?", o: ["Bangladesh", "Nepal", "Afghanistan", "Pakistan"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following committees observed that “essentially all that is contained in the fundamental duties is just a codification of tasks integral to the Indian way of life”?", o: ["Rangrajan committee", "Santhanam Committee", "Verma Committee", "Moily committee"], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Which of the following Constitutional Amendment Acts has created the Union territories in India?", o: ["5th", "7th", "4th", "6th"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Which of the following area pair of barrel-shaped organelles located in the cytoplasm of animal cells near the nuclear envelope, which give orientation to the 'mitotic spindle' formed during cell division?", o: ["Centrioles", "Flagella", "Centrosomes", "Basal bodies"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "The Ministry of Rural Development had launched ‘Garib Kalyan Rozgar Abhiyan’ in 2020 to provide immediate employment and livelihood opportunities to returnee migrants and rural population. From which state was the scheme launched?", o: ["Bihar", "Uttar Pradesh", "Gujarat", "Rajasthan"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Who among the following is a Padma Vibhushan awardee and a torch bearer of the Kalka-Bindadin Gharana of Lucknow?", o: ["Pandit Birju Maharaj", "Pandit Lacchu Maharaj", "Pandit Gopi Krishna", "Pandit Shambhu Maharaj"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "In which of the following years did India host the Asian Games?", o: ["1951 and 1982", "1951 and 1985", "1955 and 1982", "1960 and 1983"], a: 0, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Atal Bhujal Yojana (Atal Jal) is targeted at sustainable ________ management.", o: ["groundwater", "pollution", "green", "waste"], a: 0, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Megasthenes, a Greek, was the ambassador in the court of which of the following kings?", o: ["Ashoka", "Chandragupta Maurya", "Bimbisara", "Mahapadma Nanda"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "The Kathiawar Peninsula is a part of which state of India?", o: ["West Bengal", "Tamil Nadu", "Gujarat", "Andhra Pradesh"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Who among the following was the Sultan of Delhi sultanate from 1296 A.D. to 1316 A.D.?", o: ["Ghiyasuddin Balban", "Ghiyasuddin Tughluq", "Alauddin Khalji", "Khizr Khan"], a: 2, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "To which of the following places would a school teacher take her students for a field trip to see Hoshang Shah's tomb, Hindola Mahal, Champa Baoli and Jahaaz Mahal?", o: ["Mandu, Madhya Pradesh", "Varanasi, Uttar Pradesh", "Agra, Uttar Pradesh", "Ratlam, Madhya Pradesh"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "‘My Dateless Diary’ is a novel written by whom among the following authors?", o: ["Robin Singh", "RK Narayan", "Ruskin Bond", "Chetan Bhagat"], a: 1, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which Article of the Constitution of India mentions that “it shall be the duty of every citizen of India to promote harmony and the spirit of common brotherhood amongst all the people of India transcending religious, linguistic and regional or sectional diversities; to renounce practices derogatory to the dignity of women”?", o: ["51A (k)", "51A (e)", "51A (d)", "51A (a)"], a: 1, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Which of the following earthquake waves is more destructive?", o: ["Body Waves", "S-Waves", "Surface waves", "P-Waves"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Which of the following palaces is located in Mysore, Karnataka?", o: ["Kowdiar Palace", "Amba Vilas Palace", "Ujjayanta Palace", "Kangla Palace"], a: 1, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Who among the following physicists wrote an autobiography ‘Autobiographical Notes’?", o: ["Michael Faraday", "Albert Einstein", "Isaac Newton", "James Maxwell"], a: 1, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Who among the following was a renowned pianist and founder of the Shillong Chamber Choir?", o: ["Damon Lyndem", "Kynsai Lyngdoh", "William Basaiawmoit", "Neil Nongkynrih"], a: 3, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["+ and ×", "÷ and ×", "− and ÷", "− and +"], a: 2, e: "", qimg: "28nov2023-s2-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘DESK’ is written as ‘23179’ and ‘FLOW’ is written as ‘4101321’. How will ‘HUNT’ be written in that language?", o: ["6191218", "6111219", "5998795", "5894566"], a: 0, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the figure that will come next in the following figure series.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "28nov2023-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third word in the same way as the second word is related to the first word. (The words must be considered as meaningful English words and must NOT be related to each other based on the number of letters/number of consonants/vowels in the word) Snow : Mountain :: Sand : ?", o: ["Beach", "Sun", "Water", "Bucket"], a: 0, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "28nov2023-s2-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below and complete the pattern.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "28nov2023-s2-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["24", "22", "26", "28"], a: 2, e: "", qimg: "28nov2023-s2-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "28nov2023-s2-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 99 * 11 * 5 * 25 * 15 * 5", o: ["÷ −× = +", "− ÷ × + =", "÷ ×− = +", "÷ −× + ="], a: 2, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "28nov2023-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "28nov2023-s2-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "28nov2023-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "छह विद्यार्थी एक गोल मेज के परित: केंद्र की ओर अभिमुख होकर बैठे हैं। अदिति और अमोल दोनों का निकटतम पड़ोसी अभय है। आभा, अदिति के दाएं से दूसरे स्थान पर बैठी है। अब्दुल, अमोल के दाएं से तीसरे स्थान पर बैठा है। आशना, अभय के बाएं से दूसरे स्थान पर बैठी है। अदिति और आभा दोनों का निकटतम पड़ोसी कौन है?", o: ["अमोल", "अब्दुुल", "अभय", "आशना"], a: 1, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, even if it appears to be at variance with commonly known facts, decide which of the given conclusions logically follow(s) from the statements. Statements: • All peacocks are lion. • Some lions are dogs. • No dog is a cat. Conclusions: I. Some lions are not cats. II. Some peacocks are dogs. III. Some peacocks are not lion.", o: ["Conclusions I, II and III follow", "Only conclusion III follows", "Only conclusion I follows", "Only conclusion II and III follow"], a: 2, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding /deleting /multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is NOT allowed) (49, 12), (81, 14)", o: ["(400, 22)", "(169, 14)", "(144, 20)", "(361, 24)"], a: 3, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "28nov2023-s2-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s2-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? CNWF, FMZE, ?, LKFC, OJIB", o: ["ILCD", "CMBE", "CNCD", "IIBC"], a: 0, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s2-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 12 : 169 :: 15 : ? :: 25 : 676", o: ["256", "196", "225", "289"], a: 0, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s2-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'MN' as shown below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "28nov2023-s2-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 10, 22, 13, 28, 16, ?", o: ["67", "34", "78", "43"], a: 1, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "वह सबसे बड़ी संख्या ________ होगी, जिससे 275 और 146 को भाग देने पर क्रमश: 5 और 6 शेषफल आता है।", o: ["12", "10", "8", "15"], a: 1, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "एक दुकानदार अपने सहयोगी को 12% लाभ अर्जित करने के लिए एक वस्तु पर ₹152 का विक्रय मूल्य टैग लगाने के लिए कहता है। गलती से, सहयोगी ₹125 का मूल्य टैग लगा देता है। नए विक्रय मूल्य टैग से दुकानदार का हानि या लाभ प्रतिशत (दो दशमलव स्थानों तक पूर्णांकित) क्या है?", o: ["6.99% लाभ", "7.89% हानि", "9.66% लाभ", "8.77% हानि"], a: 1, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "एक वस्तु को ₹1,800 में बेचने से प्राप्त प्रतिशत लाभ उसी वस्तु को ₹1,160 में बेचने पर हुई हानि के प्रतिशत के बराबर है। 20% का लाभ प्राप्त के लिए वस्तु को किस मूल्य पर बेचा जाना चाहिए?", o: ["₹1,776", "₹1,650", "₹1,550", "₹1,480"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "यदि 78, 104, 338 का HCF, A है और 136, 357 का HCF, B है, तो A + B का मान ज्ञात कीजिए।", o: ["43", "38", "56", "39"], a: 0, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "The price of tea has decreased by 15%. By what percentage can a person increase the consumption of tea so that there is no change in the expenditure?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s2-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "The length of a diagonal of a quadrilateral is 30 m and length of the perpendiculars from two vertices to the diagonal are 15 m and 25 m. Find the area of the quadrilateral.", o: ["325 m2", "600 m2", "300 m2", "250 m2"], a: 1, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "If a ∶ b = 9 ∶ 14 and b ∶ c = 16 ∶ 7,then what is a ∶ b ∶ c ?", o: ["72 ∶ 112 ∶ 49", "72 ∶ 102 ∶ 49", "9 ∶ 112 ∶ 49", "9 ∶ 112 ∶ 7"], a: 0, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "28nov2023-s2-q-83.png" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "In how much time will ₹800 amount to ₹926.10 at 10% per annum, compounded half- yearly?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "28nov2023-s2-q-84.png" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "नितीश अपने माल पर लागत मूल्य से 20% अधिक मूल्य अंकित करता है लेकिन नकद भुगतान पर 15% की छूट देता है। यदि वह वस्तु को ₹1,020 में बेचता है, तो उसका क्रय मूल्य (₹ में) ज्ञात कीजिए।", o: ["1109", "1000", "1200", "1300"], a: 1, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "एक परिवार में दा -दादी, माता-पिता और दो पोते-पोतियां हैं। पोते-पोतियों की औसत आयु 12 वर्ष, माता-पिता की औसत आयु 40 वर्ष और दा -दादी की औसत आयु 68 वर्ष है। परिवार की औसत आयु की गणना करें।", o: ["40 वर्ष", "30 वर्ष", "35 वर्ष", "45 वर्ष"], a: 0, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "यदि रमेश 25 km/h की चाल से स्कूूल जाता है तो वह 9 मिनट की देरी से पहुँचता है। यदि वह 30 km/h की चाल से चलता है, तो वह 9 मिनट पहले पहुँचता है। उसके घर और स्कूूल के बीच की दूरी ज्ञात कीजिए।", o: ["40 km", "45 km", "48 km", "43 km"], a: 1, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Krisha alone takes 4 hours more to complete a job than if both Krisha and Krupa work together. If Krupa works alone, she takes 9 hours more to complete the job than if Krisha and Krupa worked together. What time would they take to complete the job if both Krisha and Krupa worked together?", o: ["6 hours", "9 hours", "7 hours", "8 hours"], a: 0, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "किसी निश्चित धनराशि पर 5% वार्षिक दर से 9 वर्ष के लिए साधारण ब्याज ₹1,260 है। किस ब्याज दर पर 5 वर्ष बाद समान धनराशि पर समान ब्याज प्राप्त किया जा सकता है?", o: ["10%", "9%", "8.6%", "11%"], a: 1, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Which of the following numbers is greater than the sum of all the prime factors of 2145?", o: ["41", "32", "31", "29"], a: 0, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following is an example of a web browser?", o: ["MS-Word", "Adobe Photoshop", "Mozilla Firefox", "Notepad"], a: 2, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, how we highlight an entire column?", o: ["By pressing ‘Ctrl + F’", "By pressing ‘Ctrl + H’", "By pressing ‘Ctrl + Space bar’", "By pressing ‘Ctrl + Enter’"], a: 2, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In Microsoft Excel 365, how can you sort data in ascending or descending order?", o: ["Data -> Form", "Data -> Sort", "Data -> Find", "Data -> Select"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "In MS Word 365, Ctrl + E key is pressed to perform which of the following tasks?", o: ["Justify", "Left Alignment", "Center Alignment", "Right Alignment"], a: 2, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which formatting option in MS-Word 365 allows you to slant or tilt the selected text to the right, commonly used for indicating emphasis or to differentiate titles from the main text?", o: ["Text Colour", "Bold", "Underline", "Italics"], a: 3, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "What is the primary purpose of ‘sorting and searching emails’ when using email services?", o: ["Organising emails based on various criteria for easy retrieval", "Sending emails to multiple recipients simultaneously", "Changing the background colour of email messages", "Creating animated GIFs to embed in email content"], a: 0, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following coloured wavy lines is used to represent spelling errors in an MS Word 365, document?", o: ["Black line", "Blue line", "Red line", "Green line"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "What does the ‘Font Size’ refer to in Microsoft Word 365?", o: ["The alignment of the text", "The size of the text characters", "The boldness of the text", "The colour of the text"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following options in MS Word 365 means the page is oriented vertically?", o: ["PageSet", "Landscape", "Portrait", "Page Setup"], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "एमएस एक्सेल 365 (MS Excel 365) में, एमएस एक्सेल (MS Excel) में, केटेगरी नेम लंबे होने पर या किसी समय अवधि में डेटा की तुलना करते समय, निम्नलिखित में से किस चार्ट का उपयोग किया जाता है?", o: ["पाई चार्ट (Pie chart)", "बार चार्ट (Bar chart)", "कॉलम चार्ट (Column chart)", "लाइन चार्ट (Line chart)"], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 28 Nov 2023 Shift-2";
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
