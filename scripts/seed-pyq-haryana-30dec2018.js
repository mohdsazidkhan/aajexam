/**
 * Seed: Haryana Police Constable - 30 Dec 2018
 * Haryana Police Constable written exam (scanned bilingual paper, English version
 * seeded). 100 Q x 1 mark, 4 options, no negative marking. Reuses Exam
 * `HR-POL-CONST` + ExamPattern 'Haryana Police Written Exam'. The scan carried no
 * official key (only unreliable hand-marks) -> answers derived by independent
 * solving; Haryana-state-specific GK falls back to the scan marks.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not found'); process.exit(1); }

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

const TAGS = ["Haryana Police", "Constable", "PYQ", "2018", "Haryana Police Constable - 30 Dec 2018"];
const RAW = [
  { n: 1, s: "Haryana GK", q: "Who was the writer of 'Desan Mein Des Haryana'?", o: ["Lakhamichand", "Uday Bhanu Hams", "Dayachand Mayna", "None of the above"], a: 1 },
  { n: 2, s: "General Studies", q: "Biggest State of India in terms of area is", o: ["Maharashtra", "U.P.", "Rajasthan", "None of the above"], a: 2 },
  { n: 3, s: "General Studies", q: "The amendments which have created uniformity in the structures of Panchayath Raj and Nagarapalika institution across the country are", o: ["74 and 77", "73 and 74", "76 and 42", "21 and 61"], a: 1 },
  { n: 4, s: "General Studies", q: "Internal communication within Institutions is done through", o: ["WAN", "LAN", "MMS", "EBB"], a: 1 },
  { n: 5, s: "Reasoning", q: "Select the word which is least like the other words in the group.", o: ["Othello", "King Lear", "Oliver Twist", "Macbeth"], a: 2 },
  { n: 6, s: "Haryana GK", q: "Gurudwara Dhamtan Sahib was built in the memory of", o: ["Guru Gobind Singh", "Guru Nanak", "Guru Tegh Bahadur", "None of the above"], a: 2 },
  { n: 7, s: "General Science", q: "In front of a concave mirror, an object is placed at a distance d1 from the focus and the real image is formed at a distance d2 from the focus. Then the focal length of the mirror is", o: ["sqrt(d1*d2)", "d1*d2", "(d1+d2)/2", "sqrt(d1/d2)"], a: 0 },
  { n: 8, s: "General Studies", q: "Which of the following States has a separate Constitution?", o: ["Jammu and Kashmir", "Nagaland", "Karnataka", "West Bengal"], a: 0 },
  { n: 9, s: "General Studies", q: "Which of the following is not a world heritage site in India?", o: ["Ahmedabad city", "Hampi group of monuments", "Beluru-Halebeedu sites", "None of the above"], a: 3 },
  { n: 10, s: "Haryana GK", q: "Phalgu fest is held in Faral village on", o: ["Nirjal Ekadashi", "Somavati Amavasya", "Kartik Purnima", "None of the above"], a: 1 },
  { n: 11, s: "Haryana GK", q: "Who is the current Speaker of Haryana Legislative Assembly?", o: ["Abhay Singh Chautala", "Manohar Lal Khattar", "Kanwar Pal Gujjar", "Santosh Yadav"], a: 2 },
  { n: 12, s: "General Studies", q: "_______ represents billion characters.", o: ["Megabytes", "Kilobytes", "Terabytes", "Gigabytes"], a: 3 },
  { n: 13, s: "General Studies", q: "Baisakhi is usually celebrated on", o: ["14th of April", "25th of April", "1st May", "31st December"], a: 0 },
  { n: 14, s: "Numerical Ability", q: "In a survey of 400 people, 100 people like Apple juice, 150 like Orange juice and 75 like both. The number of people who neither like Apple nor Orange is", o: ["100", "250", "175", "225"], a: 3 },
  { n: 15, s: "General Studies", q: "The person who is unanimously regarded as the founder of Modern China.", o: ["Sun-Yat-Sen", "Guomindang", "Mao-Zedong", "Deng Xiaoping"], a: 0 },
  { n: 16, s: "General Studies", q: "World's only habitat for Asiatic lion found in which of the following National Park?", o: ["Bandhavgarh National Park", "Gir National Park", "Mukurthi National Park", "None of the above"], a: 1 },
  { n: 17, s: "General Studies", q: "Constructors are used to", o: ["Construct the data", "Initialize the object", "Both (A) and (B)", "Neither (A) nor (B)"], a: 2 },
  { n: 18, s: "Numerical Ability", q: "The mean of the first 'n' natural numbers is", o: ["(n+1)/2", "n(n+1)/2", "n/2", "None of these"], a: 0 },
  { n: 19, s: "Current Affairs", q: "On 22 January 2015, PM Narendra Modi launched the 'Beti Bachao, Beti Padhao Yojana' in which of the following city of Haryana?", o: ["Kurukshetra", "Panipat", "Chandigarh", "Panchkula"], a: 1 },
  { n: 20, s: "General Science", q: "A magnetic needle lying parallel to a magnetic field requires W units of work to turn it through 60 degrees. The torque needed to maintain the needle in this position will be", o: ["sqrt(3) W", "(sqrt(3)/2) W", "W", "2W"], a: 0 },
  { n: 21, s: "Reasoning", q: "Rahul told Anand, Yesterday I defeated the only brother of the daughter of my grandmother. Whom did Rahul defeat?", o: ["Son", "Uncle", "Brother", "Cousin"], a: 0 },
  { n: 22, s: "General Studies", q: "Gangaur is held in the honour of goddess", o: ["Saraswati", "Lakshmi", "Gouri", "Radha"], a: 2 },
  { n: 23, s: "Reasoning", q: "Complete the analogous pair. Bird : Fish : : Aeroplane : ?", o: ["Submarine", "Ship", "Boat", "Crocodile"], a: 0 },
  { n: 24, s: "Numerical Ability", q: "Two water taps together can fill a tank in 9 3/8 hours. The tap of larger diameter takes 10 hours less than the smaller one to fill the tank separately. Find the time taken by the tap with smaller diameter to fill the tank separately.", o: ["25 hrs.", "20 hrs.", "15 hrs.", "18 hrs."], a: 0 },
  { n: 25, s: "Haryana GK", q: "_______ is a folklore Museum situated in Gurugram.", o: ["Sri Krishna Museum", "Jahaj Kothi Zonal Museum", "Urusvati Museum", "Dharohar Museum"], a: 0 },
  { n: 26, s: "General Studies", q: "The countries who have been considered as the founding members of ASEAN, are", o: ["India, Malaysia, Philippines, Singapore and Thailand", "India, Malaysia, Philippines, Singapore and Nepal", "Indonesia, Malaysia, Nepal, Singapore and Thailand", "Indonesia, Malaysia, Philippines, Singapore and Thailand"], a: 3 },
  { n: 27, s: "Haryana GK", q: "_______ is the current Chairman of Haryana Public Service Commission.", o: ["Manbir Singh Bhadana", "Narendra Singh Tomar", "Ajay Sura", "None of the above"], a: 3 },
  { n: 28, s: "Numerical Ability", q: "If ((1-i)/(1+i))^100 = a + ib, then (a, b) =", o: ["(-1, 0)", "(0, -1)", "(1, 1)", "(1, 0)"], a: 3 },
  { n: 29, s: "Numerical Ability", q: "If line joining P(12, 8) and Q(24, x) is parallel to X-axis then the value of x is", o: ["8", "12", "-8", "6"], a: 0 },
  { n: 30, s: "General Science", q: "Name the primary CO2 acceptor in mesophyll cells of C4 plants.", o: ["Triose phosphate", "Phosphoenol pyruvate", "Ribulose-1, 5-bisphosphate", "Oxaloacetic acid"], a: 1 },
  { n: 31, s: "General Studies", q: "_____ is a type of memory circuitry that holds the computer's system software such as Boot loader.", o: ["RAM", "ROM", "RIM", "Cache"], a: 1 },
  { n: 32, s: "General Science", q: "Origin of Species by means of natural selection was given by", o: ["Lamarck", "Linnaeus", "Charles Darwin", "Erasmus"], a: 2 },
  { n: 33, s: "General Studies", q: "In a C++ program, members of class are by default", o: ["Public", "Private", "Protected", "None"], a: 1 },
  { n: 34, s: "Haryana GK", q: "Mahatma Gandhi was first arrested in this railway station of Haryana", o: ["Palwal", "Panchkula", "Kalka", "Amritsar"], a: 0 },
  { n: 35, s: "Haryana GK", q: "_____ is the present Lokayukta of Haryana.", o: ["Pritam Pal", "Justice Nawal Kishore Agarwal", "Kaptan Singh Solanki", "None of the above"], a: 0 },
  { n: 36, s: "General Science", q: "Which element is deficient in milk?", o: ["Potassium", "Calcium", "Iron", "Magnesium"], a: 2 },
  { n: 37, s: "General Studies", q: "Co-operative farming become more successful in", o: ["Denmark", "Australia", "USA", "India"], a: 0 },
  { n: 38, s: "General Studies", q: "Number of banks nationalized since 1969 is", o: ["18", "19", "14", "None of the above"], a: 2 },
  { n: 39, s: "General Studies", q: "Who is empowered to suspend the operation of Fundamental Rights?", o: ["Parliament", "Supreme Court", "President", "Prime Minister"], a: 2 },
  { n: 40, s: "Haryana GK", q: "Kalpana Chawla, the first woman of Indian origin to go to space was born in this place", o: ["Karnal", "Hisar", "Kurukshetra", "Panipat"], a: 0 },
  { n: 41, s: "Numerical Ability", q: "If x, 2y, 3z are in A.P., where x, y, z are distinct number and are in G.P., then the common ratio of the G.P. is", o: ["3", "1/3", "2", "1/2"], a: 1 },
  { n: 42, s: "Haryana GK", q: "This district of Haryana has highest number of Vidhan Sabha constituencies", o: ["Gurugram", "Panipat", "Hisar", "Yamunanagar"], a: 2 },
  { n: 43, s: "General Studies", q: "Which of the following do you feel are compatible with the idea of secularism?", o: ["Recognition of State religion", "Domination of one religion", "Equal State to support all religions", "None of the above"], a: 2 },
  { n: 44, s: "Current Affairs", q: "Recently Central Government released UMANG app, it is for", o: ["Online banking", "Single window platform for all e-Governance Services", "Registering child sexual abuse cases", "None of the above"], a: 1 },
  { n: 45, s: "Haryana GK", q: "According to a legend, this sarovar has a mention in Mahabharata citing its use by Duryodhana to hide himself under water on the concluding day of the war", o: ["Bhimkund", "Brahma Sarovar", "Surajkund", "Hathnikund"], a: 0 },
  { n: 46, s: "Numerical Ability", q: "How many 2 digit even numbers can be formed from the digits 1, 2, 3, 4, 5, if the digits can be repeated?", o: ["10", "8", "25", "24"], a: 0 },
  { n: 47, s: "General Studies", q: "ASCII is a character-encoding scheme employed by personal computers to represent characters, numbers and control keys. ASCII stands for", o: ["American Standard Code for Information Interchange", "American Standard Code for Intelligent Information", "American Standard Code for Information Integrity", "American Standard Code for Isolated Information"], a: 0 },
  { n: 48, s: "Haryana GK", q: "Haryana was the first State in the country to achieve 100% rural electrification in", o: ["1947", "1955", "1970", "2000"], a: 2 },
  { n: 49, s: "General Science", q: "The radius of Ge nuclide is measured to be twice the radius of Be9. The number of nucleons in Ge are", o: ["71", "72", "73", "74"], a: 1 },
  { n: 50, s: "Reasoning", q: "If Z = 52 and ACT = 48, then BAT will be equal to", o: ["39", "41", "44", "46"], a: 3 },
  { n: 51, s: "General Science", q: "The interaction between sea anemone that has stinging tentacles and the clown fish that lives among them, is an example for", o: ["Mutualism", "Amensalism", "Commensalism", "Parasitism"], a: 0 },
  { n: 52, s: "Reasoning", q: "Paw is related to Cat in the same way Hoof is related to", o: ["Horse", "Lamb", "Elephant", "Lion"], a: 0 },
  { n: 53, s: "Haryana GK", q: "Shivalik hills are present in the _______ part of Haryana.", o: ["West", "East", "North-east", "South-west"], a: 2 },
  { n: 54, s: "General Studies", q: "Which of the following is a floored division in python 3.0?", o: ["/", "//", "%", "."], a: 1 },
  { n: 55, s: "Numerical Ability", q: "Value of k in the quadratic equation 2x^2 + kx + 3 = 0 so that it has 2 equal roots is", o: ["+/-4", "+/-2 sqrt(6)", "+/-3", "None"], a: 1 },
  { n: 56, s: "Haryana GK", q: "Bhagwat Dayal Sharma was representing _______ constituency when he became the first CM of Haryana.", o: ["Bhiwani", "Tosham", "Pataudi", "Jhajjar"], a: 3 },
  { n: 57, s: "Current Affairs", q: "Non-Performing Asset (NPA) which is making headline from past several years, is associated with", o: ["Insurance corporations", "Banking establishments", "Corporate companies", "None of the above"], a: 1 },
  { n: 58, s: "General Studies", q: "The Constitution of India provides reservation of seats for SC and ST in Lok Sabha. As on 1 September 2012 the number of seats reserved in Lok Sabha for SC and ST are", o: ["84 and 47", "38 and 27", "44 and 37", "None of the above"], a: 0 },
  { n: 59, s: "Numerical Ability", q: "If nPr = 840, nCr = 35, then r =", o: ["6", "24", "4", "5"], a: 2 },
  { n: 60, s: "General Science", q: "A character determined by many genes and does not show discrete variation is known as", o: ["Qualitative character", "Oligogenic character", "Quantitative character", "None of the above"], a: 2 },
  { n: 61, s: "Numerical Ability", q: "The mean of six observations is 8. If each observation is multiplied by 3, then new mean becomes", o: ["11", "8", "48", "24"], a: 3 },
  { n: 62, s: "Reasoning", q: "If the word CAPITAL is written as DCSMYGS, how the word NATION is written in that code?", o: ["OCWMTT", "OBVLST", "OBUJPU", "OCLML"], a: 0 },
  { n: 63, s: "General Science", q: "First Clone Dolly was made in", o: ["Sheep", "Goat", "Cow", "Buffalo"], a: 0 },
  { n: 64, s: "General Studies", q: "Hawa Singh won the Asian Games gold medal in consecutive editions of the games in 1966 and 1970 for which of the following games?", o: ["Weight lifting", "Boxing", "Running", "Badminton"], a: 1 },
  { n: 65, s: "General Studies", q: "Which of the following States or Union Territories has highest density of population?", o: ["Delhi", "West Bengal", "Maharashtra", "None of the above"], a: 0 },
  { n: 66, s: "Haryana GK", q: "Tangri river is a tributary of ______", o: ["Yamuna", "Ghaggar", "Ganga", "Markanda"], a: 1 },
  { n: 67, s: "General Science", q: "An unsolicited e-mail message sent to many recipients at once is a", o: ["Worm", "Virus", "Threat", "Spam"], a: 3 },
  { n: 68, s: "General Studies", q: "How many Schedules are there in the Constitution?", o: ["395", "12", "19", "10"], a: 1 },
  { n: 69, s: "General Studies", q: "Gandhiji began his walking from Sabaramati Ashram towards Dandi on", o: ["12 March, 1930", "12 March, 1932", "12 April, 1930", "12 March, 1931"], a: 0 },
  { n: 70, s: "General Science", q: "Finest gold sol is ______ in colour.", o: ["Red", "Purple", "Golden", "Blue"], a: 0 },
  { n: 71, s: "General Science", q: "Consider the following statements: 1. Cirrus clouds are formed at high altitude. 2. Cumulus clouds look like cotton wool. 3. Stratus clouds are the layered clouds covering large portion of the sky. 4. Nimbus clouds are black or dark grey. Identify the correct statements.", o: ["1, 2 and 3", "2, 3 and 4", "Only 3 and 4", "All the above"], a: 3 },
  { n: 72, s: "Haryana GK", q: "This King of Rewari was one of the main leaders of the Indian Rebellion of 1857 in Haryana", o: ["Rao Sukhram", "Rao Tularam", "Rao Gujarmal Singh", "Rao Ruda Singh"], a: 1 },
  { n: 73, s: "General Science", q: "POP3 and IMAP are e-mail accounts in which", o: ["One automatically gets one mail everyday", "One has to be connected to the server to read or write one mail", "One only has to be connected to the server to send and receive e-mail", "One does not need any telephone lines"], a: 2 },
  { n: 74, s: "General Studies", q: "Biography of Harshavardhana, Harshacharita was written by a sanskrit poet _______ which describes his association with Thanesar.", o: ["Bhasa", "Kalidasa", "Banabhatta", "Dandi"], a: 2 },
  { n: 75, s: "General Studies", q: "Human Development Index issued by", o: ["IMF", "World Bank", "UNDP", "None of the above"], a: 2 },
  { n: 76, s: "General Science", q: "_______ is used as a promoter in the synthesis of ammonia by Haber process.", o: ["Antimony", "Arsenic", "Molybdenum", "Iron"], a: 2 },
  { n: 77, s: "Haryana GK", q: "Haryanvi tradition credits _______ for laying the foundation of the present style of Swang.", o: ["Kishan Lal Bhaat", "Pt. Deepchand", "Dayachand Mayna", "None of the above"], a: 0 },
  { n: 78, s: "Numerical Ability", q: "The 4th term of a G.P. is square of its second term and the first term is -3, then the 7th term of the G.P is", o: ["-2187", "2187", "343", "-343"], a: 0 },
  { n: 79, s: "Reasoning", q: "Complete the analogy. 8 : 28 :: 27 : ?", o: ["8", "28", "64", "65"], a: 3 },
  { n: 80, s: "Haryana GK", q: "This politician had a rare distinction of serving as Minister in the undivided Punjab, Rajasthan and Haryana", o: ["Bansilal", "Choudhary Tayyab Husain", "Zakir Husain", "Choudhary Yaseen Husain"], a: 1 },
  { n: 81, s: "Reasoning", q: "In the sequence of number 5, 8, 13, x, 34, 55, 89, the value of x is", o: ["20", "21", "23", "29"], a: 1 },
  { n: 82, s: "Numerical Ability", q: "A coin is tossed twice. The probability that at least one tail appears is", o: ["1/2", "1/4", "3/4", "0"], a: 2 },
  { n: 83, s: "General Studies", q: "Which of the following is an open source word processor?", o: ["MS Word", "WordPerfect Office", "Kwrite", "MS Excel"], a: 2 },
  { n: 84, s: "Numerical Ability", q: "The remainder obtained when 6^n - 5n is divided by 25, is", o: ["0", "10", "1", "5"], a: 2 },
  { n: 85, s: "General Science", q: "Nematode resistant tobacco plant is developed by a novel strategy called", o: ["RNA interference", "DNA interference", "Green revolution", "None of the above"], a: 0 },
  { n: 86, s: "Current Affairs", q: "_______ received the Jnanpith Award for her contribution to Hindi literature in 2017.", o: ["Vanitha", "Shankha Ghosh", "Pratibha Ray", "Krishna Sobti"], a: 3 },
  { n: 87, s: "Numerical Ability", q: "The number of terms in the expansion of ((2x + y^3)^4)^7 is", o: ["8", "29", "28", "12"], a: 1 },
  { n: 88, s: "General Studies", q: "The only person who acted as a caretaker Prime Minister of India twice", o: ["Devilal", "B. D. Jatti", "G. L. Nanda", "Lal Bahadur Shastri"], a: 2 },
  { n: 89, s: "English Language", q: "Fill in the blank with appropriate article: Tagore was ____ truly great poet.", o: ["a", "No article needed", "the", "an"], a: 0 },
  { n: 90, s: "English Language", q: "Fill in the blank with appropriate article: There is not ____ man here who will not support you.", o: ["a", "Not needed", "an", "the"], a: 0 },
  { n: 91, s: "English Language", q: "Supply suitable verb in agreement with its subject: The means employed by you ____ sufficient.", o: ["are", "were", "is", "None of the above"], a: 0 },
  { n: 92, s: "English Language", q: "Supply suitable verb in agreement with its subject: Sanskrit, as well as Arabic, ____ taught there.", o: ["was", "are", "were", "have"], a: 0 },
  { n: 93, s: "English Language", q: "Select the correct expression and fill in the blank: He was much ____ by his loss.", o: ["cast away", "cast down", "cast off", "call up"], a: 1 },
  { n: 94, s: "English Language", q: "Select the correct expression and fill in the blank: A religious hope ____ a man in his trials.", o: ["bears up", "bore away", "bears upon", "bears out"], a: 0 },
  { n: 95, s: "Hindi", q: "हम कलम से लिखते हैं। इस वाक्य में कलम से कौन-सा कारक है?", o: ["कर्म कारक", "करण कारक", "संबंध कारक", "कर्त्ता कारक"], a: 1 },
  { n: 96, s: "Hindi", q: "ढिंढोरा पीटना मुहावरे का अर्थ है", o: ["प्रचार करना", "भाग जाना", "धोखेबाज होना", "मार डालना"], a: 0 },
  { n: 97, s: "Hindi", q: "जिस समास में दूसरा पद प्रधान हो, उसे कौन-सा समास कहते हैं?", o: ["तत्पुरुष", "द्विगु", "द्वन्द्व", "बहुव्रीहि"], a: 0 },
  { n: 98, s: "Hindi", q: "एक + एक = एकैक यह कौन-सी संधि है?", o: ["व्यंजन संधि", "यण् संधि", "वृद्धि संधि", "गुण संधि"], a: 2 },
  { n: 99, s: "Hindi", q: "हम पढ़ते हैं। इस वाक्य को सामान्य भूतकाल में कहते हैं", o: ["हम पढ़ा", "हम पढ़े", "हम पढ़ेंगे", "हम ने पढ़ा"], a: 0 },
  { n: 100, s: "Hindi", q: "लक्ष्मण से मेघनाद मारा गया यह कौन-सा वाच्य है?", o: ["भाव वाच्य", "कर्म वाच्य", "कर्तृ वाच्य", "कोई नहीं"], a: 1 }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'HR-POL-CONST' });
  if (!exam) throw new Error('Exam HR-POL-CONST not found — aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Haryana Police Written Exam' });
  if (!pattern) throw new Error('ExamPattern "Haryana Police Written Exam" not found — aborting.');

  const TEST_TITLE = "Haryana Police Constable - 30 Dec 2018";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  const questions = RAW.map(r => ({
    questionText: r.q, questionImage: '', options: r.o,
    optionImages: r.o.map(() => ''), correctAnswerIndex: r.a,
    explanation: '', section: r.s, tags: TAGS, difficulty: 'medium'
  }));

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2018,
    pyqShift: TEST_TITLE, pyqExamName: 'Haryana Police Constable', questions
  });
  console.log('Created PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
