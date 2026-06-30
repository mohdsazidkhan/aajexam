/**
 * Seed: Haryana Police Constable - 23 Dec 2018
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

const TAGS = ["Haryana Police", "Constable", "PYQ", "2018", "Haryana Police Constable - 23 Dec 2018"];
const RAW = [
  { n: 1, s: "Haryana GK", q: "____ is known as \"Mini Cuba\" in India due to the large number of boxers who hail from the region.", o: ["Bhiwani", "Ambala", "Karnal", "Palwal"], a: 0 },
  { n: 2, s: "General Science", q: "Measles and rubella are caused by", o: ["Bacterial", "Virus", "Protista", "Fungi"], a: 1 },
  { n: 3, s: "Reasoning", q: "In the following series of numbers, find out how many times 1, 3 and 7 have appeared together, 7 being in the middle, 1 and 3 on either side of 7 ? 2 9 7 3 1 7 3 7 7 1 3 3 1 7 3 8 5 7 1 3 7 7 1 7 3 9 0 6", o: ["3", "4", "5", "more than 5"], a: 2 },
  { n: 4, s: "General Science", q: "An ideal coil of 10H is connected in series with a resistance of 5 ohm and a battery of 5V. Two seconds after the connection is made, the current flowing in ampere in the circuit is", o: ["(1 - e^-1)", "(1 - e)", "e", "e^-1"], a: 0 },
  { n: 5, s: "Numerical Ability", q: "If P(n) : 2n < n!, n belongs to N then P(n) is true for n", o: ["> 2", "> 3", "< 4", "None of these"], a: 1 },
  { n: 6, s: "Haryana GK", q: "Charri dance of Haryana is related which of the following festival ?", o: ["Navaratri", "Teej", "Googa Navami", "Holi"], a: 2 },
  { n: 7, s: "Numerical Ability", q: "For 3 sets A, B, C if A subset B, B subset C then", o: ["A union B subset C", "C subset A union B", "A - B = C", "None of these"], a: 0 },
  { n: 8, s: "Current Affairs", q: "____ won National Film Award for best supporting actress for her role in this film Pagdi The Honour.", o: ["Usha Sharma", "Baljinder Kaur", "Sumitra Hooda", "Sheela Pahal"], a: 0 },
  { n: 9, s: "Current Affairs", q: "2018 Commonwealth Games held in", o: ["Singapore", "South Africa", "England", "Australia"], a: 3 },
  { n: 10, s: "General Studies", q: "Which one of the following statement is wrong about introduction of Bills in Parliament ?", o: ["The Finance Bill can be presented first in any one of the either Houses of the Parliament.", "President approval is mandatory for all the bills.", "Finance Minister presents the Finance Bill in Lok Sabha.", "Disagreement regarding bills can be resolved through joint session of the Parliament."], a: 1 },
  { n: 11, s: "Current Affairs", q: "UNFCCC - 2017 Conference of Parties 23 held at", o: ["Edinburgh", "Morocco", "California", "Bonn"], a: 3 },
  { n: 12, s: "General Studies", q: "____ is a technique in which a dedicated and complete physical connection is established between two nodes for communication.", o: ["Packet switching", "Circuit switching", "LAN", "All the above"], a: 1 },
  { n: 13, s: "General Studies", q: "The facts can be", o: ["Physical only", "Psychological facts", "Physical as well as psychological", "None of the above"], a: 2 },
  { n: 14, s: "Haryana GK", q: "____ district is known as Sripad Janpad.", o: ["Kurukshetra", "Rewari", "Faridabad", "Panchkula"], a: 0 },
  { n: 15, s: "Reasoning", q: "Select the series in which the letters skipped in between adjacent letters do not decrease in order.", o: ["EQZFI", "GWIQU", "MGVFK", "PJXHM"], a: 0 },
  { n: 16, s: "Haryana GK", q: "This person is considered as the father of Bhakra-Nangal dam", o: ["Seth Chhaju Ram", "Chaudhari Chhotu Ram", "Chaudhari Sukhram", "Diwan Bahadur S.P. Singha"], a: 1 },
  { n: 17, s: "Haryana GK", q: "Which of the following is the name of the monthly magazine published by Haryana Sanskrit Academy ?", o: ["Sanskritavani", "Sanskritabharati", "Hariprabha", "Sanskritabhasha"], a: 2 },
  { n: 18, s: "General Science", q: "The gaseous envelope of invisible film of air surrounding the earth is called", o: ["Ionosphere", "Troposphere", "Stratosphere", "Atmosphere"], a: 3 },
  { n: 19, s: "Haryana GK", q: "Hali Award is given by", o: ["Haryana Punjabi Academy", "Haryana Urdu Academy", "Haryana Sanskrit Academy", "Haryana Hindi Academy"], a: 1 },
  { n: 20, s: "General Science", q: "The group of Planets called as 'Inner Planets' are", o: ["Mercury, Jupiter, Earth and Saturn", "Mercury, Earth, Neptune and Jupiter", "Mercury, Earth, Mars and Saturn", "Mercury, Venus, Earth and Mars"], a: 3 },
  { n: 21, s: "General Studies", q: "_______ are a sequence of values of any type and are indexed by integers. They are immutable.", o: ["Tuple", "String", "List", "Dictionary"], a: 0 },
  { n: 22, s: "Numerical Ability", q: "In a class of 60 students, 25 play cricket, 20 students play tennis and 10 students play both the games. The number of students who play neither tennis nor cricket is", o: ["35", "40", "25", "50"], a: 2 },
  { n: 23, s: "General Science", q: "Sunflower is an example for _______ type of placentation.", o: ["Marginal placentation", "Free central placentation", "Axile placentation", "Basal placentation"], a: 1 },
  { n: 24, s: "General Science", q: "Cattle and buffalo belongs to the family", o: ["Cammelidae", "Suidae", "Equidae", "None of these"], a: 3 },
  { n: 25, s: "Reasoning", q: "In a row of girls, if Seeta who is 10th from the left and Leena who is 7th from the right, interchange their seats, Seeta becomes 15th from the left. How many girls are there in the row ?", o: ["17", "20", "22", "21"], a: 3 },
  { n: 26, s: "Haryana GK", q: "_______ was associated with the tribal republic of the Yaudheyas of the early Christian period and holds a series of mounds which yielded several Indo-Greek coins when excavated by Birbal Saini in 1938.", o: ["Bhiwandi", "Khokrakot", "Charki Dadri", "Kaithal"], a: 1 },
  { n: 27, s: "General Studies", q: "Which one of the following is an ancient port of Indus Valley Civilization ?", o: ["Mohenjodaro", "Kalibangan", "Harappa", "Lothal"], a: 3 },
  { n: 28, s: "General Science", q: "Select the cowpea variety resistant to Bacterial blight disease.", o: ["Himgiri", "Pusa Komal", "Pusa Sadabahar", "Pusa Swarnim"], a: 1 },
  { n: 29, s: "General Studies", q: "The Indian Evidence Act came into effect from", o: ["1 January, 1872", "1 October, 1872", "1 September, 1872", "1 December, 1872"], a: 2 },
  { n: 30, s: "Reasoning", q: "A is richer than B. C is richer than A. D is richer than C and E is richest of all. If they are made to sit in decreasing order of richness who will be in the middle ?", o: ["A", "B", "C", "D"], a: 0 },
  { n: 31, s: "Reasoning", q: "Which two months in a year have same calendar ?", o: ["June, October", "April, November", "April, July", "October, December"], a: 2 },
  { n: 32, s: "General Studies", q: "This King assumed the title of 'Vikramaditya' when he defeated Akbar's Mughal forces in 1556.", o: ["Sher Shah Suri", "Hemachandra", "Rana Pratap", "Prithviraj Chouhan"], a: 1 },
  { n: 33, s: "Numerical Ability", q: "The number of possible outcomes when a coin is tossed 6 times is", o: ["36", "12", "64", "32"], a: 2 },
  { n: 34, s: "General Studies", q: "Self Respect Movement was started by", o: ["Swami Vivekananda", "Ambedkar", "Ramaswamy Naicker", "Rajaram Mohan Roy"], a: 2 },
  { n: 35, s: "General Studies", q: "Which of the following is not an example of database management system?", o: ["SQL", ".net", "SAP", "Oracle"], a: 1 },
  { n: 36, s: "Numerical Ability", q: "A bag contains 5 red and 3 blue balls. If 3 balls are drawn at random without replacement, the probability of getting exactly one red ball is", o: ["45/196", "135/392", "15/56", "15/29"], a: 2 },
  { n: 37, s: "General Science", q: "Activity of a radioactive sample decreases to 1/3rd of its original value in 3 days. Then in 9 days its activity will become", o: ["1/3 of its original value", "1/9 of its original value", "1/18 of its original value", "1/27 of its original value"], a: 3 },
  { n: 38, s: "General Studies", q: "What is the output of following Python code? class test: def __init__(self): self.variable = 'old'; self.change(self.variable); def change(self, var): var = 'new'. obj = test(); print(obj.variable)", o: ["error: function cannot be called", "'new' is printed", "'old' is printed", "nothing is printed"], a: 2 },
  { n: 39, s: "General Studies", q: "In India Food Security Act enacted in the year of", o: ["2011", "2012", "2013", "2010"], a: 2 },
  { n: 40, s: "Haryana GK", q: "As per 2011 census, population of Haryana forms approximately ____ percent of India's population.", o: ["2", "5", "10", "13"], a: 0 },
  { n: 41, s: "Reasoning", q: "From the given alternatives, select the word which cannot be formed using the letters of the word \"OUTRAGEOUS\".", o: ["GREAT", "OUTAGE", "SURAT", "GREGARIOUS"], a: 3 },
  { n: 42, s: "General Studies", q: "When a name is encountered during the execution of the program, it searches for that name in the following order", o: ["local, global, built-in, enclosing functions", "global, local, enclosing functions, built-in", "built-in, enclosing functions, local, global", "local, enclosing functions, global, built-in"], a: 3 },
  { n: 43, s: "General Science", q: "Chile saltpetre is", o: ["NaNO3", "KNO3", "LiNO3", "Ca(NO3)2"], a: 0 },
  { n: 44, s: "Numerical Ability", q: "Values of k for the equation kx(x - 2) + 6 = 0 so that it has two equal roots are", o: ["0, 6", "6", "2, 3", "None of these"], a: 1 },
  { n: 45, s: "Haryana GK", q: "Number of districts when Haryana was carved in 1966 was", o: ["21", "15", "7", "9"], a: 2 },
  { n: 46, s: "Haryana GK", q: "Department of Information, Public Relations and Languages, Haryana brings out a magazine named", o: ["Haryana Vikas", "Haryana Darshan", "Haryana Samvad", "None of the above"], a: 2 },
  { n: 47, s: "General Studies", q: "Predict the output of following code. int f = 1, i = 2; do { f *= i; } while(++i < 5); cout << f;", o: ["12", "5", "4", "24"], a: 3 },
  { n: 48, s: "Haryana GK", q: "A new 2800 Megawatt nuclear power plant will be setup at this place of Haryana", o: ["Rewari", "Gorakhpur", "Jind", "Sirsa"], a: 1 },
  { n: 49, s: "General Studies", q: "Choose the option, which is not included in networking.", o: ["Access to remote database", "Resource sharing", "Power transferring", "Communication"], a: 2 },
  { n: 50, s: "General Studies", q: "The Article of Indian Constitution which gives special status to Jammu and Kashmir", o: ["370", "382", "371", "372"], a: 0 },
  { n: 51, s: "Haryana GK", q: "Select the correct one. I : Ambala receives the highest rainfall in Haryana. II : It is surrounded by Shivalik hills.", o: ["Both I and II are true and II is the correct explanation of I", "Both I and II are true, but II is the not the correct explanation of I", "I is true, II is false", "Both are false"], a: 0 },
  { n: 52, s: "Haryana GK", q: "National Bureau of Animal Genetic Resources is present in", o: ["Kurukshetra", "Karnal", "Mewat", "Rewari"], a: 1 },
  { n: 53, s: "General Studies", q: "Surdas was a contemporary of which of the following Mughal ruler?", o: ["Shahjahan", "Akbar", "Humayun", "Babur"], a: 1 },
  { n: 54, s: "General Studies", q: "Evidence, under Indian Evidence Act, means and includes", o: ["Oral Evidence", "Documentary Evidence", "Both (A) and (B)", "None of the above"], a: 2 },
  { n: 55, s: "General Studies", q: "This protected area contains one of the last surviving remnants of Delhi Ridge hill range", o: ["Bhindawas Wildlife Sanctuary", "Asola-Bhatti Wildlife Sanctuary", "Nahar Wildlife Sanctuary", "Abubshahar Wildlife Sanctuary"], a: 1 },
  { n: 56, s: "General Studies", q: "Select the correct one. I. Gingee fort - Tamil Nadu  II. Ajantha-Ellora caves - Madhya Pradesh", o: ["Only I is correct", "Only II is correct", "Both are correct", "Both are wrong"], a: 0 },
  { n: 57, s: "Haryana GK", q: "This Haryana based writer was the editor of Urdu Magazine 'Bharat Pratap'.", o: ["Balamukund Gupta", "Pratap Narayan Mishra", "Mahaveera Prasad Dwivedi", "None of the above"], a: 1 },
  { n: 58, s: "General Science", q: "The process of delivery of the foetus is called", o: ["Implantation", "Fertilisation", "Parturition", "Ovulation"], a: 2 },
  { n: 59, s: "General Studies", q: "Consider the following statements regarding Right to Equality in Indian Constitution. 1. Article 14 - All are equal before law. 2. Article 16 - Equal opportunity in public employment. 3. Article 17 - Untouchability is Prohibited. 4. Article 19 - Abolition of Titles.", o: ["1 and 4", "2 and 4 only", "1, 2 and 4 only", "1, 2 and 3"], a: 3 },
  { n: 60, s: "Numerical Ability", q: "If the coefficients of 2nd, 3rd and 4th terms in the expansion of (1 + x)^n are in A.P., then the value of n is", o: ["2", "7", "11", "14"], a: 1 },
  { n: 61, s: "General Studies", q: "Which of the following country is not included in the great geographic entity known as the 'Indian Sub-Continent'?", o: ["Myanmar", "Pakisthan", "Bangladesh", "India"], a: 0 },
  { n: 62, s: "Current Affairs", q: "Present Law Minister of India is", o: ["D.V. Sadananda Gowda", "Ananthkumar Hegde", "Ravishankar Prasad", "Nithin Gadkari"], a: 2 },
  { n: 63, s: "General Science", q: "The interference fringes for sodium light (lambda = 5890 A) in a double slit experiment have an angular width of 0.2 degree. For what wavelength will the width be 10% greater?", o: ["5890 A", "7500 A", "6479 A", "8768 A"], a: 2 },
  { n: 64, s: "General Studies", q: "Blue Revolution is related to", o: ["Oilseed crops", "Vegetable crops", "Milk production", "Fisheries"], a: 3 },
  { n: 65, s: "General Science", q: "The condition of the atmosphere at a given place and time is termed as", o: ["Climate", "Weather", "Meteorology", "None of these"], a: 1 },
  { n: 66, s: "General Studies", q: "What is the output of this C++ program? char arr[20]; for(i=0;i<10;i++) arr[i]=65+i; then a null terminator is added and arr is printed.", o: ["ABCDEFGHIJ", "AAAAAAAAAA", "0123456789", "None of the above"], a: 0 },
  { n: 67, s: "Numerical Ability", q: "Coefficient of variation of two distributions are 50 and 60 and their arithmetic means are 30 and 25 respectively. Difference of their standard deviation is", o: ["1", "0", "1.5", "2.5"], a: 1 },
  { n: 68, s: "Haryana GK", q: "___________ is responsible for generation of power in Haryana.", o: ["Haryana Electricity Reform Commission", "Haryana State Electricity Board", "Haryana Power Generation Corporation Limited", "Haryana Vidyut Prasaran Nigam Limited"], a: 2 },
  { n: 69, s: "Haryana GK", q: "___________ was a famous freedom fighter from Haryana who later became the CM of the State.", o: ["Devilal", "Bansilal", "Bhoopinder Singh Hooda", "Manohar Lal Khattar"], a: 0 },
  { n: 70, s: "Reasoning", q: "What will be last digit of the third number from the top when the numbers 517, 325, 639, 841, 792 are arranged in descending order after reversing the position of the digits within each number?", o: ["7", "3", "5", "2"], a: 1 },
  { n: 71, s: "General Studies", q: "Sahiwal is a breed of", o: ["Chinkara", "Tiger", "Crocodile", "Cow"], a: 3 },
  { n: 72, s: "General Studies", q: "Which of the following function/method acts as a constructor in python?", o: ["construct()", "__init__()", "__str__", "function whose name is similar to class name"], a: 1 },
  { n: 73, s: "Haryana GK", q: "Which of the following is one of the 5 villages Yudhishthira wanted to borrow from Duryodhana ?", o: ["Mewat", "Palwal", "Karnal", "Sonipat"], a: 1 },
  { n: 74, s: "Reasoning", q: "Negation of 'All triangles are equilateral triangles' is", o: ["All triangles are not equilateral", "All equilateral triangles are not triangles", "There exists a triangle which is not an equilateral triangle", "All of these"], a: 2 },
  { n: 75, s: "General Studies", q: "Creating an object from a class is called", o: ["Initialisation", "Instantiation", "Creation", "Definition"], a: 1 },
  { n: 76, s: "Numerical Ability", q: "P(n) : 2^(2n) - 1, n belongs to N is divisible by", o: ["4", "3", "5", "None of these"], a: 1 },
  { n: 77, s: "General Studies", q: "Mohd. Ghazni attacked Thanesar in", o: ["1054", "1014", "1263", "1492"], a: 1 },
  { n: 78, s: "Haryana GK", q: "This Panchkula based writer won prestigious Kendra Sahitya Academy Award for 2017", o: ["Nachhatar", "Ramesh Kuntal Megh", "Nasira Sharma", "Mridula Garg"], a: 1 },
  { n: 79, s: "Current Affairs", q: "This woman secured 2nd rank in UPSC who has also been named as the brand ambassador for betibachao betipadhao campaign.", o: ["Anu Kumari", "Divya Kumari", "Saritha Kumari", "Preeti Kumari"], a: 0 },
  { n: 80, s: "Numerical Ability", q: "The sum of odd numbers between 0 and 50 is", o: ["600", "530", "480", "625"], a: 3 },
  { n: 81, s: "Reasoning", q: "A man goes towards east 5 kms, then he takes a turn to south-west and goes 5 kms. He again takes a turn towards north-west and goes 5 kms. With respect to the point from where he started, where is he now ?", o: ["East", "North", "West", "South"], a: 2 },
  { n: 82, s: "General Studies", q: "With the passing of the India Independence Act, 1947, India immediately became", o: ["Republic State", "Democratic State", "Dominion State", "Secular State"], a: 2 },
  { n: 83, s: "General Studies", q: "Which one of the following statement about cold war is wrong ?", o: ["It is an ideological war.", "USSR and America engaged in direct wars.", "It is a competition between the blocs of Soviet Union and USA.", "It motivated arms race in the world."], a: 1 },
  { n: 84, s: "General Studies", q: "To contest in the Lok Sabha Election one must attain", o: ["22 years", "24 years", "25 years", "30 years"], a: 2 },
  { n: 85, s: "Numerical Ability", q: "A set of n values x1, x2, ... xn has standard deviation sigma then the standard deviation of x1+k, x2+k, ... xn+k will be", o: ["sigma", "sigma + k", "sigma - k", "k sigma"], a: 0 },
  { n: 86, s: "General Science", q: "___________ enzyme converts glucose into ethyl alcohol and carbon dioxide.", o: ["Invertase", "Zymase", "Diastase", "Maltase"], a: 1 },
  { n: 87, s: "Numerical Ability", q: "Value of tan1 deg * tan2 deg * tan3 deg ... tan89 deg is", o: ["0", "1", "1/2", "(1/sqrt2)^89"], a: 1 },
  { n: 88, s: "Numerical Ability", q: "If sin(theta) + cosec(theta) = 2 then sin^2(theta) + cosec^2(theta) =", o: ["1", "4", "2", "1/2"], a: 2 },
  { n: 89, s: "English Language", q: "Fill in the blank with correct form of verb: What's that noise? What _______?", o: ["is happening", "happened", "had happened", "has happened"], a: 0 },
  { n: 90, s: "English Language", q: "Fill in the blank with correct form of verb: Yesterday evening the phone _______ three times, while we were having dinner.", o: ["was ringing", "has rung", "had been ringing", "rang"], a: 3 },
  { n: 91, s: "English Language", q: "Fill in the blank with appropriate preposition: I was shocked _______ what I saw. I'd never seen anything like it before.", o: ["for", "at", "on", "with"], a: 1 },
  { n: 92, s: "English Language", q: "Fill in the blank with appropriate preposition: I can't understand people who are cruel _______ animals.", o: ["at", "with", "for", "to"], a: 3 },
  { n: 93, s: "English Language", q: "Select the part of speech of the underlined word: Alas! she is no more.", o: ["interjection", "pronoun", "preposition", "conjunction"], a: 0 },
  { n: 94, s: "English Language", q: "Select the part of speech of the underlined word: He treated it in a light hearted manner.", o: ["conjunction", "verb", "adverb", "adjective"], a: 3 },
  { n: 95, s: "Hindi", q: "इनमें क्रिया विशेषण है", o: ["धीरे धीरे", "चालाक", "हम", "लड़का"], a: 0 },
  { n: 96, s: "Hindi", q: "यात्रियों के समूह को कहते हैं", o: ["व्यूह", "कुंज", "काफिला", "समिति"], a: 2 },
  { n: 97, s: "Hindi", q: "लड़की जाती है। यह वाक्य अपूर्ण भूतकाल में होता है", o: ["लड़की जा रही थी।", "लड़की गयी।", "लड़की गयी थी।", "लड़की जाएगी।"], a: 0 },
  { n: 98, s: "Hindi", q: "जिसे किसी बात को जानने की इच्छा हो उसे कहते हैं", o: ["सहिष्णु", "जिज्ञासु", "सदाचारी", "नास्तिक"], a: 1 },
  { n: 99, s: "Hindi", q: "दाँतों तले उँगली दबाना मुहावरे का अर्थ है", o: ["ईर्ष्या से जल उठना", "खुश होना", "क्रोधित होना", "आश्चर्य होना"], a: 3 },
  { n: 100, s: "Hindi", q: "हम आँखों से देखते हैं इस वाक्य में आँखों से कौनसा कारक है?", o: ["कर्म कारक", "करण कारक", "संबंध कारक", "कर्त्ता कारक"], a: 1 }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'HR-POL-CONST' });
  if (!exam) throw new Error('Exam HR-POL-CONST not found — aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Haryana Police Written Exam' });
  if (!pattern) throw new Error('ExamPattern "Haryana Police Written Exam" not found — aborting.');

  const TEST_TITLE = "Haryana Police Constable - 23 Dec 2018";
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
