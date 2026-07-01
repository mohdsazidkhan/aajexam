/**
 * Seed: Haryana Police Constable - 25 Aug 2024
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

const TAGS = ["Haryana Police", "Constable", "PYQ", "2024", "Haryana Police Constable - 25 Aug 2024"];
const RAW = [
  { n: 1, s: "Reasoning", q: "Pick the odd man out.", o: ["Snake", "Lizard", "Crocodile", "Whale"], a: 3 },
  { n: 2, s: "Haryana GK", q: "Where was the 26th All India Forest Sports Meet held in Haryana?", o: ["Rewari", "Panchkula", "Sirsa", "Palwal"], a: 1 },
  { n: 3, s: "General Studies", q: "What is the rank of Chief of the Naval Staff?", o: ["Vice Admiral", "Admiral", "General", "None of the above"], a: 1 },
  { n: 4, s: "General Studies", q: "Merino sheep is originated from", o: ["Spain", "India", "Pakistan", "Bangladesh"], a: 0 },
  { n: 5, s: "Numerical Ability", q: "The value of 9^0 + (9)^(9^0) is", o: ["9", "99", "11", "10"], a: 3 },
  { n: 6, s: "Haryana GK", q: "Where is North India's first nuclear power plant set up in Haryana?", o: ["Palwal", "Kaithal", "Gorakhpur", "Pinjore"], a: 2 },
  { n: 7, s: "General Science", q: "Incubation period of duck eggs in days is", o: ["21", "28", "30", "18"], a: 1 },
  { n: 8, s: "Reasoning", q: "In a group of 5 boys, Vasant is taller than Manohar but not as tall as Raju. Jayant is taller than Dutta but shorter than Manohar. Who is the shortest in group?", o: ["Raju", "Dutta", "Vasant", "Jayant"], a: 1 },
  { n: 9, s: "Numerical Ability", q: "If x/y = 16/24, then 24y =", o: ["16x", "24x", "36x", "30x"], a: 2 },
  { n: 10, s: "Computer", q: "What is the main benefit of using functions in programming?", o: ["Reduces readability", "Increases code length", "Increases code reusability", "Reduces the need for debugging"], a: 2 },
  { n: 11, s: "Numerical Ability", q: "15 women or 10 men can complete a project in 55 days. The number of days 5 women and 4 men take to complete the same project is", o: ["70", "100", "78", "75"], a: 3 },
  { n: 12, s: "General Studies", q: "McMahon line is a borderline between India and", o: ["China", "Bangladesh", "Pakistan", "None of the above"], a: 0 },
  { n: 13, s: "Haryana GK", q: "Which is the oldest canal of Haryana?", o: ["Gurgaon Canal", "Bhiwani Canal", "Bhakra Canal", "Western Yamuna Canal"], a: 3 },
  { n: 14, s: "General Science", q: "Which soil is having pH less than 7.0?", o: ["Acidic soil", "Alkaline soil", "Calcareous soil", "None of the above"], a: 0 },
  { n: 15, s: "General Studies", q: "At which southern point of peninsular plateau, Western Ghats and Eastern Ghats meet?", o: ["Cardamom hills", "Nilgiri hills", "Mudumalai hills", "None of the above"], a: 1 },
  { n: 16, s: "Computer", q: "What does IoT stand for?", o: ["Internet of Technology", "Internet of Things", "Internet of Tools", "Internet of Transfers"], a: 1 },
  { n: 17, s: "Computer", q: "What is a nested loop?", o: ["A loop inside another loop", "A loop that runs forever", "A loop with no body", "A loop with a single statement"], a: 0 },
  { n: 18, s: "Reasoning", q: "Pick the odd man out.", o: ["Mercury", "Jupiter", "Venus", "Moon"], a: 3 },
  { n: 19, s: "Haryana GK", q: "Where is the Motilal Nehru Sports School situated at Haryana?", o: ["Rai (Sonipat)", "Pataudi (Gurugram)", "Thaneshwar (Kurukshetra)", "Morni (Ambala)"], a: 0 },
  { n: 20, s: "Current Affairs", q: "Which of the following city hosted the Global Partnership on Artificial Intelligence (GPAI) Summit 2024?", o: ["New Delhi", "Surat", "Hyderabad", "None of the above"], a: 0 },
  { n: 21, s: "General Science", q: "The Red Data Book contains a record of", o: ["Extinct species", "Endangered species", "Common species", "Invasive species"], a: 1 },
  { n: 22, s: "General Studies", q: "How many National Parks are there in India?", o: ["1014", "106", "108", "None of the above"], a: 1 },
  { n: 23, s: "General Science", q: "An electric bulb is connected to a 220V generator. The current is 0.50 A. What is the power of the bulb?", o: ["440 W", "110 W", "11 W", "44 W"], a: 1 },
  { n: 24, s: "Current Affairs", q: "Which of the following city in India was officially recognized as a \"World Craft City\" by the World Crafts Council (WCC)?", o: ["Jaipur", "Pune", "Srinagar", "Mumbai"], a: 2 },
  { n: 25, s: "Numerical Ability", q: "If the simple interest on a certain sum of money for 2 years is one fifth of the sum, then the rate of simple interest per annum is", o: ["10%", "12%", "7.2%", "9%"], a: 0 },
  { n: 26, s: "Current Affairs", q: "India's rank in global Human Development Index 2022 is", o: ["134", "130", "132", "133"], a: 0 },
  { n: 27, s: "Computer", q: "Who invented the concept of the stored program computer?", o: ["Alan Turing", "Charles Babbage", "John Von Neumann", "Blaize Pascal"], a: 2 },
  { n: 28, s: "General Studies", q: "In India, every year National Sports Day is celebrated on", o: ["17 August", "29 August", "22 March", "None of the above"], a: 1 },
  { n: 29, s: "Haryana GK", q: "How many districts were present at the time of the formation of the Haryana State in 1966?", o: ["6", "9", "8", "7"], a: 3 },
  { n: 30, s: "Numerical Ability", q: "The volume of a cuboid of length 5 cm, breadth 3 cm and height 4 cm is", o: ["60 cm³", "12 cm³", "45 cm³", "100 cm³"], a: 0 },
  { n: 31, s: "Current Affairs", q: "What was the theme of International Mountain Day 2023 observed on 11 December?", o: ["Restoring Mountain Ecosystems", "Mountain Biodiversity Restoration", "Mountains and Glaciers Restoration", "None of the above"], a: 0 },
  { n: 32, s: "Reasoning", q: "If 1 * 2 = 22, 2 * 3 = 36, 3 * 4 = 412, then 4 * 5 =", o: ["420", "45", "520", "54"], a: 2 },
  { n: 33, s: "General Science", q: "What is the primary function of pepsin in the digestion?", o: ["Break down of carbohydrates", "Emulsify fats", "Convert lipids into fatty acids", "Digest proteins"], a: 3 },
  { n: 34, s: "Haryana GK", q: "In which district of Haryana is the Badkhal Lake situated?", o: ["Hisar", "Jind", "Sirsa", "Faridabad"], a: 3 },
  { n: 35, s: "General Science", q: "Rejupave Technology is related with", o: ["Dam construction", "Road construction", "Urban forest creation", "None of the above"], a: 1 },
  { n: 36, s: "Computer", q: "What is the purpose of the 'break' statement in Python?", o: ["To start a loop", "To pause a loop", "To terminate a loop", "To continue a loop"], a: 2 },
  { n: 37, s: "Reasoning", q: "Select the correct combination of numbers so that letters arranged accordingly form a meaningful word.\nT E L S C A\n1 2 3 4 5 6", o: ["1, 2, 3, 4, 5, 6", "4, 6, 5, 1, 2, 3", "5, 6, 4, 1, 3, 2", "6, 5, 3, 2, 4, 1"], a: 2 },
  { n: 38, s: "Current Affairs", q: "Where was the Shanghai Co-operation Organisation Summit 2024 organized?", o: ["Pakistan", "Japan", "Singapore", "Kazakhstan"], a: 3 },
  { n: 39, s: "General Science", q: "The decomposition of vegetable matter into compost is an example of _______ reaction.", o: ["Calcination", "Exothermic", "Endothermic", "Burning"], a: 1 },
  { n: 40, s: "Current Affairs", q: "In which of the following year was the UNESCO Creative Cities Network (UCCN) established?", o: ["1998", "2015", "2010", "2004"], a: 3 },
  { n: 41, s: "Numerical Ability", q: "Value that appears most number of times in the given data of an attribute/variable is called", o: ["Mode", "Median", "Mean", "None of the above"], a: 0 },
  { n: 42, s: "Haryana GK", q: "Yamuna River enters Haryana from the district of", o: ["Ambala", "Sirsa", "Yamunanagar", "Bhiwani"], a: 2 },
  { n: 43, s: "Computer", q: "In Python, which symbol is used to start a comment?", o: ["//", "\\", "#", "-"], a: 2 },
  { n: 44, s: "Reasoning", q: "Find the correct option for the missing number (?) in the series.\n11, 9, 18, 15, 45, 41, ?", o: ["164", "162", "158", "None of these"], a: 0 },
  { n: 45, s: "Computer", q: "Which kind of output device converts digital information into a physical (hard copy) form?", o: ["Monitor", "Printer", "Scanner", "Keyboard"], a: 1 },
  { n: 46, s: "Haryana GK", q: "Which is the smallest district of Haryana in terms of area?", o: ["Hisar", "Bhiwani", "Panchkula", "Ambala"], a: 2 },
  { n: 47, s: "General Studies", q: "When did the Federal Court of India start functioning?", o: ["01 October, 1937", "01 October, 1945", "02 October, 1930", "None of the above"], a: 0 },
  { n: 48, s: "Haryana GK", q: "What is the total area of Haryana State at present?", o: ["42232 square kilometres", "46217 square kilometres", "44212 square kilometres", "48219 square kilometres"], a: 2 },
  { n: 49, s: "General Science", q: "Which of the following crops are typically sown during the rainy season?", o: ["Winter crops", "Kharif crops", "Spring crops", "None of the above"], a: 1 },
  { n: 50, s: "Reasoning", q: "The zoo had some lions and some parrots. The keeper counted 15 heads and 50 legs, then the number of lions is", o: ["9", "12", "11", "10"], a: 3 },
  { n: 51, s: "Haryana GK", q: "In which city of Haryana, Arjun Stadium is situated?", o: ["Karnal", "Sonipat", "Jind", "Hisar"], a: 2 },
  { n: 52, s: "General Studies", q: "In India, every year National Girl Child Day is celebrated on", o: ["24 January", "16 January", "14 January", "None of the above"], a: 0 },
  { n: 53, s: "General Science", q: "The scientific name of National Flower of India is", o: ["Nelumbo Nucifera Gaertn", "Jasminum", "Oryza sativa", "None of the above"], a: 0 },
  { n: 54, s: "Haryana GK", q: "What is the ancient name of the Markanda river of Haryana?", o: ["Aruna", "Meeru", "Manasa", "Malaya"], a: 0 },
  { n: 55, s: "Haryana GK", q: "How many villages are there in Haryana according to Census 2011?", o: ["6754", "6841", "6657", "6895"], a: 1 },
  { n: 56, s: "Numerical Ability", q: "If a = -1 and b = 3, then the value of (a + b)^2 is", o: ["4", "16", "-4", "0"], a: 0 },
  { n: 57, s: "General Studies", q: "The Hailey (Corbett) National Park, India's oldest National Park was established in the year", o: ["1930", "1932", "1936", "1939"], a: 2 },
  { n: 58, s: "Haryana GK", q: "Giri and Tons are tributaries of which river of Haryana State?", o: ["Tangri", "Krishnawati", "Yamuna", "Markanda"], a: 2 },
  { n: 59, s: "Reasoning", q: "In a certain code language, SIKKIM is written as THLJJL. How is TRAINING written in that code language?", o: ["SQBHOHOH", "UQBJOHOH", "UQBJOHHO", "UQBHOHOF"], a: 3 },
  { n: 60, s: "Current Affairs", q: "How many athletes from Haryana are participating in the Paris Olympics 2024?", o: ["19", "24", "16", "29"], a: 1 },
  { n: 61, s: "Numerical Ability", q: "In a mixture containing milk and water, the ratio of milk to water is 3 : 1, then the quantity of water in 10 litres of mixture is", o: ["3 litres", "2.5 litres", "1 litre", "1.5 litres"], a: 1 },
  { n: 62, s: "Numerical Ability", q: "If (x+2)/5 = (x-1)/2, then the value of x is", o: ["4", "5", "1", "3"], a: 3 },
  { n: 63, s: "General Studies", q: "Headquarters of International Solar Alliance (ISA) is located at", o: ["Mumbai", "Gurugram", "New Delhi", "None of the above"], a: 1 },
  { n: 64, s: "General Studies", q: "Where is Indian Institute of Horticultural Research located?", o: ["New Delhi", "Bengaluru", "Lucknow", "Hyderabad"], a: 1 },
  { n: 65, s: "Numerical Ability", q: "The HCF of 16 and 24 is", o: ["4", "2", "8", "16"], a: 2 },
  { n: 66, s: "Haryana GK", q: "Where is the Headquarters of Mahendragarh district in Haryana?", o: ["Narnaul", "Karnal", "Kaithal", "Bhiwani"], a: 0 },
  { n: 67, s: "Numerical Ability", q: "If the average age of 3 girls in a family is 4 years, then the sum of their ages is", o: ["4 years", "12 years", "9 years", "7 years"], a: 1 },
  { n: 68, s: "Numerical Ability", q: "How many numbers between 9 to 54 are exactly divisible by 9 but not by 3?", o: ["None", "8", "6", "5"], a: 0 },
  { n: 69, s: "General Science", q: "Which of the following instrument is used to measure wind velocity?", o: ["Barometer", "Hygrograph", "Pyradiometer", "Anemometer"], a: 3 },
  { n: 70, s: "Reasoning", q: "If 18th March was Wednesday, then which day will falls on 1st March?", o: ["Tuesday", "Friday", "Thursday", "Sunday"], a: 3 },
  { n: 71, s: "General Science", q: "One ampere is equal to", o: ["One coulomb per second", "One volt per second", "One joule per coulomb", "One second per coulomb charge"], a: 0 },
  { n: 72, s: "Current Affairs", q: "What was the theme of World Children's Day 2023 observed on November 20?", o: ["Imagine a better future for every child", "Children of today, our keepers tomorrow", "For every child, every right", "None of the above"], a: 2 },
  { n: 73, s: "General Studies", q: "Who is the father of Indian Psychoanalysis?", o: ["Sudhir Kakar", "Suman Ranganath", "Suhas Mishra", "Shamanth Singh"], a: 0 },
  { n: 74, s: "General Science", q: "The current through a resistor is inversely proportional to its", o: ["Potential difference", "Resistance", "Electrical charge", "Heat dissipation"], a: 1 },
  { n: 75, s: "Reasoning", q: "In a certain code language, '134' means 'good and tasty', '478' means 'see good pictures' and '729' means 'pictures are faint'. Which of the following digit stands for 'see'?", o: ["9", "2", "1", "8"], a: 3 },
  { n: 76, s: "Numerical Ability", q: "If 3/4 - 5/x = 7/x, then the value of x is", o: ["16", "12", "14", "None of these"], a: 0 },
  { n: 77, s: "Reasoning", q: "Which letter will come in the place of question mark?\nP, R, T, V, ?", o: ["Q", "L", "M", "X"], a: 3 },
  { n: 78, s: "Numerical Ability", q: "The value of 2^3 + 10^3 is", o: ["1080", "38", "1008", "1800"], a: 2 },
  { n: 79, s: "Haryana GK", q: "Which of the following district is known as Paris of Haryana State?", o: ["Karnal", "Panipat", "Gurgaon", "Rohtak"], a: 0 },
  { n: 80, s: "Current Affairs", q: "Where was the world's first portable hospital unveiled?", o: ["Gurugram", "Ranchi", "Patna", "None of the above"], a: 0 },
  { n: 81, s: "Reasoning", q: "In a row of trees, one tree is 7th from either end of the row. The number of trees in the row is", o: ["15", "14", "13", "12"], a: 2 },
  { n: 82, s: "General Science", q: "Which of the following component is found in xylem tissue?", o: ["Sieve tubes", "Phloem fibers", "Tracheids", "Companion cells"], a: 2 },
  { n: 83, s: "Current Affairs", q: "Which of the following State of India has awarded with the Geographical Indication (GI) tag for its Lakadong turmeric?", o: ["Meghalaya", "Sikkim", "Assam", "None of the above"], a: 0 },
  { n: 84, s: "Haryana GK", q: "Which is the first novel written in Haryanvi language?", o: ["Dard-e-Ashoob", "Sandesa", "Janan Janan", "Jhadufiri"], a: 3 },
  { n: 85, s: "Numerical Ability", q: "The number of revolutions a wheel of 28 cms diameter make in travelling a distance of 880 cms is (π = 22/7)", o: ["100", "10", "24", "50"], a: 1 },
  { n: 86, s: "Reasoning", q: "Complete the following analogy.\nMoon : Satellite :: Earth : ?", o: ["Sun", "Planet", "Solar system", "None of the above"], a: 1 },
  { n: 87, s: "Current Affairs", q: "Where was the 14th All India Police Commando Competition organised?", o: ["Kerala", "Gujarat", "Madhya Pradesh", "Andhra Pradesh"], a: 3 },
  { n: 88, s: "General Science", q: "White Silver Chloride turns to _______ in sunlight.", o: ["Grey", "Yellow", "Red", "None of the above"], a: 0 },
  { n: 89, s: "Computer", q: "What is a file?", o: ["A program stored in Random Access Memory", "A temporary storage location", "A named location on a secondary storage media", "A type of Python variable"], a: 2 },
  { n: 90, s: "General Studies", q: "The Supreme Court of India comprises the", o: ["Chief Justice and 28 other Judges", "Chief Justice and 33 other Judges", "Chief Justice and 34 other Judges", "Chief Justice and 30 other Judges"], a: 1 },
  { n: 91, s: "Reasoning", q: "Which number will come in the place of question mark?\n2, 3, 5, 7, 11, 13, ?", o: ["17", "18", "13", "None of the above"], a: 0 },
  { n: 92, s: "Computer", q: "Which encoding scheme can represent characters from almost all the languages of the world?", o: ["American Standard Code for Information Interchange (ASCII)", "Unicode", "Indian Script Code for Information Interchange (ISCII)", "None of the above"], a: 1 },
  { n: 93, s: "Reasoning", q: "If in a certain code language, NIGHT is written as REKDX, then how will CRIME be written in that language?", o: ["GNMII", "GNMIJ", "SMNJI", "SMNJJ"], a: 0 },
  { n: 94, s: "General Studies", q: "Which is the first state of India to introduce VAT (Value Added Tax)?", o: ["Uttar Pradesh", "Madhya Pradesh", "Haryana", "Rajasthan"], a: 2 },
  { n: 95, s: "Current Affairs", q: "Which of the following institution has launched the Sampoornata Abhiyan?", o: ["Reserve Bank of India (RBI)", "Finance Commission of India", "Indian Space Research Organisation (ISRO)", "NITI Aayog"], a: 3 },
  { n: 96, s: "Haryana GK", q: "'Mera Bill Mera Adhikar' Scheme of Haryana State is related with", o: ["Consumer Protection Act", "Public expenditure", "Income tax", "Goods and Services Tax (GST)"], a: 3 },
  { n: 97, s: "General Studies", q: "In Indian Constitution, 'Right to Education' is enshrined under Article", o: ["20 A", "51 A", "21 A", "None of the above"], a: 2 },
  { n: 98, s: "Haryana GK", q: "Which of the following is not administrative division of Haryana State at present?", o: ["Ambala", "Sirsa", "Hisar", "Rohtak"], a: 1 },
  { n: 99, s: "Reasoning", q: "Which number will come in the place of the question mark? Four triangles have numbers at their vertices (top vertex; bottom-left, bottom-right): (13; 5, 12), (17; 8, 15), (25; 7, 24) and (?; 9, 40).", o: ["41", "45", "50", "52"], a: 0 },
  { n: 100, s: "General Science", q: "Metallic oxides are said to be", o: ["Neutral oxides", "Acidic oxides", "Basic oxides", "None of the above"], a: 2 }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'HR-POL-CONST' });
  if (!exam) throw new Error('Exam HR-POL-CONST not found — aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Haryana Police Written Exam' });
  if (!pattern) throw new Error('ExamPattern "Haryana Police Written Exam" not found — aborting.');

  const TEST_TITLE = "Haryana Police Constable - 25 Aug 2024";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  const questions = RAW.map(r => ({
    questionText: r.q, questionImage: '', options: r.o,
    optionImages: r.o.map(() => ''), correctAnswerIndex: r.a,
    explanation: '', section: r.s, tags: TAGS, difficulty: 'medium'
  }));

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2024,
    pyqShift: TEST_TITLE, pyqExamName: 'Haryana Police Constable', questions
  });
  console.log('Created PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
