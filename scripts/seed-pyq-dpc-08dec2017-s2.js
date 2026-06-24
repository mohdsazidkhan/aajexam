/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 08 Dec 2017 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_img_e2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-08dec2017-s2';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2017', "Delhi Police Constable - 08 Dec 2017 Shift-2"];
const RAW = [
  { n: 1, s: "Reasoning / Logical Ability", q: "In the following question, select the related word from the given alternatives. Knife : Cut :: Rubber : ?", o: ["White", "Soft", "Erase", "Elastic"], a: 2, e: "", qimg: "" },
  { n: 2, s: "Reasoning / Logical Ability", q: "In the following question, select the related letters from the given alternatives. MAZE : SFDH :: EYRI : ?", o: ["JDVK", "KDVL", "JCUK", "KCVK"], a: 1, e: "", qimg: "" },
  { n: 3, s: "Reasoning / Logical Ability", q: "In the following questions select the related number from the given alternatives. 14 : 44 29 : ?", o: ["45", "39", "55", "59"], a: 3, e: "", qimg: "" },
  { n: 4, s: "Reasoning / Logical Ability", q: "In the following question, select the odd word from the given alternatives", o: ["Chair", "Table", "Door", "Wood"], a: 3, e: "", qimg: "" },
  { n: 5, s: "Reasoning / Logical Ability", q: "In the following question, select the odd letters from the given alternatives.", o: ["FKQV", "BFLQ", "CHNS", "BGMR"], a: 1, e: "", qimg: "" },
  { n: 6, s: "Reasoning / Logical Ability", q: "In the following question, select the odd number pair from the given alternatives.", o: ["5 - 20", "9 - 54", "7 - 28", "11 - 44"], a: 1, e: "", qimg: "" },
  { n: 7, s: "Reasoning / Logical Ability", q: "In the following question, select the odd number pair from the given alternatives", o: ["49 - 36", "63 - 18", "74 - 26", "56- 30"], a: 2, e: "", qimg: "" },
  { n: 8, s: "Reasoning / Logical Ability", q: "How many triangles are there in the given figure?", o: ["4", "6", "8", "10"], a: 1, e: "", qimg: "08dec2017-s2-q-8.png" },
  { n: 9, s: "Reasoning / Logical Ability", q: "How many rectangles are there in the given figure?", o: ["11", "12", "10", "13"], a: 1, e: "", qimg: "08dec2017-s2-q-9.png" },
  { n: 10, s: "Reasoning / Logical Ability", q: "Which of the following cube in the answer figure can be made based on the unfolded cube in the question figure?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "08dec2017-s2-q-10.png" },
  { n: 11, s: "Reasoning / Logical Ability", q: "Three positions of a cube are shown below. What will come opposite to face containing P?", o: ["S", "R", "U", "T"], a: 1, e: "", qimg: "" },
  { n: 12, s: "Reasoning / Logical Ability", q: "Which answer figure will complete the pattern in the question figure?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "08dec2017-s2-q-12.png" },
  { n: 13, s: "Reasoning / Logical Ability", q: "Form the given answer figures select the one in which the question figure is hidden/ embedded.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "08dec2017-s2-q-13.png" },
  { n: 14, s: "Reasoning / Logical Ability", q: "If a mirror is placed on the line AB, then which of the answer figures is the right mirror image of the given figure?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "08dec2017-s2-q-14.png" },
  { n: 15, s: "Reasoning / Logical Ability", q: "In the following question, select the number which can be placed at the sign of question mark(?) from the given alternatives. 9 6 8 2 3 2 5 4 7 47 27 ?", o: ["52", "58", "62", "56"], a: 1, e: "", qimg: "" },
  { n: 16, s: "Reasoning / Logical Ability", q: "From the given alternatives, select the word which can be formed using the letters of the given word. REGISTRATION", o: ["GIST", "REACT", "TRACT", "BRAIN"], a: 0, e: "", qimg: "" },
  { n: 17, s: "Reasoning / Logical Ability", q: "Identify the diagram that represents the relationship among the given classes Towel, Pink, Blue", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "08dec2017-s2-q-17.png" },
  { n: 18, s: "Reasoning / Logical Ability", q: "In the given figure, how many pens are of iron but are not hard?", o: ["19", "15", "49", "31"], a: 0, e: "", qimg: "08dec2017-s2-q-18.png" },
  { n: 19, s: "Reasoning / Logical Ability", q: "In the following question below are given some statements is followed by some conclusions. Taking the given statements to be true even if they seem to be at variance from commonly known facts. Read all the conclusions and then decide which of the given conclusion logically follows the given statements. Statements: I. No pencil is table. II. Some table are red. Conclusions: I. All red are table. II. Some pencils are red.", o: ["Only conclusion (I) follows.", "Only conclusion (II) follows.", "Both conclusion follow.", "Neither conclusion (I) nor conclusion (II) follows."], a: 3, e: "", qimg: "" },
  { n: 20, s: "Reasoning / Logical Ability", q: "In the following question below are given some statements followed by some conclusions. Taking the given statements to be true even if they seem to be at variance from commonly known facts. Read all the conclusions and then decide which of the given conclusion logically follows the given statements. Statements: I. All watches are red. II. Some red are blue. Conclusions: I. Some blue are watches. II. All red are blue. III. Some watches are not red.", o: ["Only conclusion (I) follows.", "Only conclusion (II) follows.", "Only conclusion (III) follows.", "Neither conclusion follows."], a: 3, e: "", qimg: "" },
  { n: 21, s: "Reasoning / Logical Ability", q: "Pointing towards a man, a boy said, \"He is the only child of my sister's grandfather. \" How is that man related to boy?", o: ["Father", "Son", "Brother", "Grandfather"], a: 0, e: "", qimg: "" },
  { n: 22, s: "Reasoning / Logical Ability", q: "Aman is the brother of Shweta. Shweta is the mother of Rohit. Rohit is the son of Mayank who is the son of Pankaj. How Rohit's mother related to Pankaj?", o: ["Daughter-in-law", "Sister", "Mother", "Wife"], a: 0, e: "", qimg: "" },
  { n: 23, s: "Reasoning / Logical Ability", q: "If the compound interest on a certain sum for 2 years at the rate of 8% per annum is Rs. 832, then what will be the simple interest (in Rs) at the same rate of interest for 2 years?", o: ["816", "800", "768", "784"], a: 1, e: "", qimg: "" },
  { n: 24, s: "Reasoning / Logical Ability", q: "If trader sells an article at Rs. 528, then his loss is 12%. What is the cost price (in Rs.) of the article?", o: ["612", "576", "600", "633"], a: 2, e: "", qimg: "" },
  { n: 25, s: "Reasoning / Logical Ability", q: "In the given question, there are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is add one out.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "08dec2017-s2-q-25.png" },
  { n: 26, s: "Reasoning / Logical Ability", q: "In the given question, there are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is odd one out", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "08dec2017-s2-q-26.png" },
  { n: 27, s: "Reasoning / Logical Ability", q: "In the given question, there are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is odd one out.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "08dec2017-s2-q-27.png" },
  { n: 28, s: "Reasoning / Logical Ability", q: "In the following question, select the missing number from the given series. 21, 27, 32, 36, 39, ?", o: ["48", "43", "41", "52"], a: 2, e: "", qimg: "" },
  { n: 29, s: "Reasoning / Logical Ability", q: "In the following question, select the missing number from the given series. 9, 19, 40, 83, 170 ?", o: ["345", "228", "320", "245"], a: 0, e: "", qimg: "" },
  { n: 30, s: "Reasoning / Logical Ability", q: "In the following question select the figure which can be placed at the sign of question mark (?) from the given alternatives.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "08dec2017-s2-q-30.png" },
  { n: 31, s: "Reasoning / Logical Ability", q: "In the following question, select the figure which can be placed at the sign of question mark (?) from the given alternatives.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "08dec2017-s2-q-31.png" },
  { n: 32, s: "Reasoning / Logical Ability", q: "In the following question, select the figure which can be placed at the sign of question mark (?) from the given alternatives.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "08dec2017-s2-q-32.png" },
  { n: 33, s: "Reasoning / Logical Ability", q: "In a certain code language, \"PHONE\" is written as SKRQH .how is \"CALLS\" written in that code language?", o: ["VODDF", "FDOOV", "FSMNV", "VNFDG"], a: 1, e: "", qimg: "" },
  { n: 34, s: "Reasoning / Logical Ability", q: "In a certain code language, \"TAP\" is written as \"39\" and \" LAP\" is written as \"31\". How is \"MAT\" written in that code language?", o: ["36", "38", "42", "30"], a: 0, e: "", qimg: "" },
  { n: 35, s: "Reasoning / Logical Ability", q: "In a certain code language, \"FLOCKING\" is written as \"BPKGGMJK\". How is \"FLATMATE\" written in that code language?", o: ["BPWXIEPI", "CQXYJFQJ", "JHEPQWXA", "JQHYIEPI"], a: 0, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Every production is organized by combining land, labour, physical capital and human capital which are known as ________.", o: ["Factors of production", "Factors of investment", "Factors of profit", "Factors of loss"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "The practice of growing more than one crop on a piece of land during a year is known as _________ cropping.", o: ["Mixed", "Inter", "Diverse", "Multiple"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Small Industries Development Bank of India (SIDBI) was established in which year?", o: ["1990", "1988", "1992", "1994"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "To ensure availability of food to all sections of the society, the Indian government carefully designed food security system which is composed of buffer stock and ___________.", o: ["Public distribution system", "Godown construction", "Good transportation", "High production of crops"], a: 0, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which among the following is a part of permanent executive in India?", o: ["Prime Minister of India", "Chief Minister of any state", "Defence Minister of India", "Civil Servants"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "A change in constitution made the supreme legislative body in a country is known as _________.", o: ["New Consitution", "Constituent Assembly", "Constitutional Amendment", "Altered Constitution"], a: 2, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "The Union List or State List is given in which schedule of constitution of India?", o: ["Fourth Schedule", "Sixth Schedule", "Seventh Schedule", "Ninth Schedule"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "According to the Indian Constitution which of the following is an INCORRECT pair?", o: ["Part II - Citizenship", "Part IV - Directive principles of State Policy", "Part IV (A) - Fundamental Duties", "Part IX - The Union Territories"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Which among the following was the second capital of Kushanas in ancient India?", o: ["Patliputra", "Delhi", "Lahore", "Mathura"], a: 3, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Whose tomb was the first garden tomb of India?", o: ["Humayun", "Shah Jahan", "Aurangzeb", "Babur"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which incident was the reason for calling off the non-cooperation movement?", o: ["Kakori Conspiracy", "Chauri-Chaura Incident", "Jallianwalabagh Massacre", "Dandi March"], a: 1, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Which year the British made an attempt to secure full Indian cooperation through the introduction of the Cripps Mission?", o: ["1939", "1940", "1942", "1944"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Which among the following developed into the Brahmo Sabha in the year 1828?", o: ["Atmiya Sabha", "Desh Sabha", "Hriday Sabha", "Pratharna Sabha"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "What was symbolized by hand with a wheel on the palm in Jainism?", o: ["Ahimsa", "Dharma", "Prakirti", "Nirvana"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "India's total area accounts for about what percent of the total geographical area of the world?", o: ["1.8", "2.4", "2.8", "3.2"], a: 1, e: "", qimg: "" },
  { n: 51, s: "General Knowledge / Current Affairs", q: "Uttarakhand, Uttar Pradesh, Bihar, West Bengal and Sikkim have common frontiers with _________.", o: ["Nepal", "Afghanistan", "China", "Pakistan"], a: 0, e: "", qimg: "" },
  { n: 52, s: "General Knowledge / Current Affairs", q: "Which is the correct arrangement of the hills from the West to East?", o: ["The Garo, the khasi and the Jaintia", "The Khasi, the Garo and the Jaintia", "The Garo, the Jaintia and the khasi", "The Jaintia, the Khasi and the Garo"], a: 0, e: "", qimg: "" },
  { n: 53, s: "General Knowledge / Current Affairs", q: "Which soils are also known as regur soils?", o: ["Alluvial Soils", "Laterite Soils", "Arid Soils", "Black Soils"], a: 3, e: "", qimg: "" },
  { n: 54, s: "General Knowledge / Current Affairs", q: "Which is the condition in which experience extreme weather conditions at places away from the sea?", o: ["Continentality", "Specificity", "Relativity", "Complexity"], a: 0, e: "", qimg: "" },
  { n: 55, s: "General Knowledge / Current Affairs", q: "National waterway 1 connects Allahabad to Haldia, including which three rivers?", o: ["Ganga-Narmada-Tapi", "Ganga-Godavari-Krishna", "Ganga-Bhagirathi-Hoogli", "Narmada-Tapi-Brahamputra"], a: 2, e: "", qimg: "" },
  { n: 56, s: "General Knowledge / Current Affairs", q: "Which lens generally bends inwards the light falling on it?", o: ["Convex", "Concave", "Plano concave", "Cylindrical"], a: 0, e: "", qimg: "" },
  { n: 57, s: "General Knowledge / Current Affairs", q: "Which among the following has the highest energy?", o: ["Red light", "Indigo light", "Orange light", "Yellow light"], a: 1, e: "", qimg: "" },
  { n: 58, s: "General Knowledge / Current Affairs", q: "Lubricants are those substances that _________.", o: ["Increase friction", "Reduce friction", "Do not effect friction", "No option is correct"], a: 1, e: "", qimg: "" },
  { n: 59, s: "General Knowledge / Current Affairs", q: "Which among the following is an example of a single cell which can change its shape?", o: ["Amoeba", "Euglena", "Paramecium", "Yeast"], a: 0, e: "", qimg: "" },
  { n: 60, s: "General Knowledge / Current Affairs", q: "Pipe like vessels to transport water and nutrients from the soil in plants are _________.", o: ["Epidermis", "Vascular tissue", "Meristematic tissue", "Collenchyma"], a: 1, e: "", qimg: "" },
  { n: 61, s: "General Knowledge / Current Affairs", q: "What is the chemical name of green vitriol?", o: ["Ferrous Sulphate", "Ferric oxide", "Ferric phosphate", "Ferric hydroxide"], a: 0, e: "", qimg: "" },
  { n: 62, s: "General Knowledge / Current Affairs", q: "Formation of which compound makes lime water milky when carbon dioxide is passed through it?", o: ["calcium sulphate", "Calcium carbonate", "Calcium bicarbonate", "Calcium oxide"], a: 1, e: "", qimg: "" },
  { n: 63, s: "General Knowledge / Current Affairs", q: "Which is NOT an organic acid?", o: ["Nitric acid", "Acetic acid", "Malic acid", "Citric acid"], a: 0, e: "", qimg: "" },
  { n: 64, s: "General Knowledge / Current Affairs", q: "Which among the following is a 'dynamic living entity' - full of life and vitality?", o: ["Desert", "Forest", "Atmosphere", "Water"], a: 1, e: "", qimg: "" },
  { n: 65, s: "General Knowledge / Current Affairs", q: "Acid rain refers to the precipitation with a pH ________.", o: ["less than 5", "between 5 and 5.5", "more than 7", "equal to 7"], a: 0, e: "", qimg: "" },
  { n: 66, s: "General Knowledge / Current Affairs", q: "Which is the first project to be commissioned under Prime Minister's Ladakh Renewable Energy Initivative?", o: ["Hydro power Plant in Biaras Drass", "Hydro Power Plant in Spiti Valley", "Hydro Power Plant in Doothpathari", "Hydro Power Plant in Coorg"], a: 0, e: "", qimg: "" },
  { n: 67, s: "General Knowledge / Current Affairs", q: "Which is a scheme launched on November 3, 2017 to promote Philately (Stamp Collection)?", o: ["Deen Dayal SHISHU Yojana", "Deen Dayal SPARSH Yojana", "Deen Dayaal SAMPRIT Yojana", "Deen Dayal SPARDHA Yojana"], a: 1, e: "", qimg: "" },
  { n: 68, s: "General Knowledge / Current Affairs", q: "Under which project, the World's first negative emissions carbon-capture plant begins operations in Iceland?", o: ["CarbFix", "Carbon-di-Oxide (CO2)Sink", "Carbon Footprint", "Green World"], a: 0, e: "", qimg: "" },
  { n: 69, s: "General Knowledge / Current Affairs", q: "In November 2017, which test was performed by NASA for its Mars 2020 Mission?", o: ["RS-25 Engine Test", "Suborbital Rocket Test", "Dynamic Range Camera Test", "Supersonic Parachute Test"], a: 3, e: "", qimg: "" },
  { n: 70, s: "General Knowledge / Current Affairs", q: "Which cricket team won the ICC Women;s World cup?", o: ["India", "Australia", "New Zealand", "England"], a: 3, e: "", qimg: "" },
  { n: 71, s: "General Knowledge / Current Affairs", q: "Roger Federer won which title in 2017 for the record 8th time in his career?", o: ["French Open", "US Open", "Wimbledon", "Australian Open"], a: 2, e: "", qimg: "" },
  { n: 72, s: "General Knowledge / Current Affairs", q: "India has started implementation of motor pact with its neighbouring countries Bangladesh and _______ in October 2017.", o: ["Bhutan", "Nepal", "Myanmar", "China"], a: 1, e: "", qimg: "" },
  { n: 73, s: "General Knowledge / Current Affairs", q: "With which neighbouring country India has signed a deal in October 2017 to build houses in that nation's port city?", o: ["Bangladesh", "Sri Lanka", "Myanmar", "Maldives"], a: 1, e: "", qimg: "" },
  { n: 74, s: "General Knowledge / Current Affairs", q: "Who has been awarded the 2015-16 Indira Gandhi Award for National Integration on October 14, 2017?", o: ["M S Swaminathan", "Shyam Benegal", "Gulzar", "TM Krishna"], a: 3, e: "", qimg: "" },
  { n: 75, s: "General Knowledge / Current Affairs", q: "Who is the winner of 2017 Blue Planet Prize?", o: ["James Hansen", "Wendell Berry", "Vandna Shiva", "Hans Joachim Schellnhuber"], a: 3, e: "", qimg: "" },
  { n: 76, s: "General Knowledge / Current Affairs", q: "Who is the head of the committee constituted on October 30, 2017 to oversee PSU bank mergers?", o: ["Arun Jaitely", "Urjit Patel", "Raghuram Rajan", "Uday Kotak"], a: 0, e: "", qimg: "" },
  { n: 77, s: "General Knowledge / Current Affairs", q: "In October 2017, which organisation has suggested a three pronged approach for structural reform in India?", o: ["World Bank", "International Monetary Fund (IMF)", "Asian Infrastructure Investment Bank (AIIB)", "World Trade Organization (WTO)"], a: 1, e: "", qimg: "" },
  { n: 78, s: "General Knowledge / Current Affairs", q: "Where was the 12th session India-Tunisia Joint Commission organized on October 30, 2017?", o: ["Benguluru", "Pune", "Shimla", "New Delhi"], a: 3, e: "", qimg: "" },
  { n: 79, s: "General Knowledge / Current Affairs", q: "On November 22, 2017 the union Cabinet of India approved Agreement Cooperation Terrorism and Organized Crime with ______.", o: ["Pakistan", "United States of America", "Russia", "France"], a: 2, e: "", qimg: "" },
  { n: 80, s: "General Knowledge / Current Affairs", q: "The Special Centre of Disaster Research (SCDR) was inaugurated on October 26, 2017 at ________.", o: ["Jawaharlal Nehru University, New Delhi", "Indian Institute of Technology, Delhi", "Indian Institute of Science, Bangalore", "Indian School of Mines, Dhanbad"], a: 0, e: "", qimg: "" },
  { n: 81, s: "General Knowledge / Current Affairs", q: "What is the total capacity of Indian Railway's first of Solar plants launched in July 14, 2017?", o: ["3 megawatt peak", "5 megawatt peak", "10 megawatt peak", "15 megawatt peak"], a: 1, e: "", qimg: "" },
  { n: 82, s: "General Knowledge / Current Affairs", q: "Search engine giant Google Doodle celebrated whose 151st birthday on November 15, 2017?", o: ["Cornelia Sorabji", "Geeta Madhavan", "Violet Alva", "K.K Usha"], a: 0, e: "", qimg: "" },
  { n: 83, s: "General Knowledge / Current Affairs", q: "Who would be the first woman President of NASSCOM in 2018?", o: ["Michelle Bachelete", "Helen Clark", "Debjani Ghosh", "Radhika Coomaraswamy"], a: 2, e: "", qimg: "" },
  { n: 84, s: "General Knowledge / Current Affairs", q: "Which city in India has been included in UNESCO's Creative Cities Network in November 2017?", o: ["Chennai", "visakhapatnam", "Dehradun", "Jaipur"], a: 0, e: "", qimg: "" },
  { n: 85, s: "General Knowledge / Current Affairs", q: "In August 2017 which country allowed the import of Indian bananas, pomegranate custard apple for the first time?", o: ["Spain", "Canada", "Cuba", "Zimbabwe"], a: 1, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "What of the following statement(s) is/are true? I. 2400 > 3300 II. 3400 > 4300", o: ["Only I", "Only II", "Both I and II", "Neither I nor II"], a: 1, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the sum of first 30 even numbers?", o: ["910", "930", "900", "920"], a: 1, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the value of (1.01)2 + (0.01)2?", o: ["1.0202", "1.202", "10.202", "102.02"], a: 0, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "How many numbers are there from 80 to 120 which are divisible by both 7 and 5?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "If a + b = 10 and ab = 5, then what is the value of a2 + b2?", o: ["80", "90", "100", "110"], a: 1, e: "", qimg: "" },
  { n: 91, s: "Numerical Ability (Quantitative Aptitude)", q: "The income of C is 30% more than income of B and the income of B is 30% more than the income of A. The income of C is how much percent more than the income of A?", o: ["63", "60", "55", "69"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Numerical Ability (Quantitative Aptitude)", q: "If x : y = 4 : 3 and y : z = 7 : 9, then what is x : z?", o: ["4:9", "28 : 27", "15 : 17", "12 : 27"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Numerical Ability (Quantitative Aptitude)", q: "Average of 50 numbers was calculated as 18. Three numbers 18, 32 and 65 were wrong taken as 25, 29 and 56. What will be the correct average?", o: ["18.4", "17.8", "18.1", "17.6"], a: 2, e: "", qimg: "" },
  { n: 94, s: "Numerical Ability (Quantitative Aptitude)", q: "A man borrowed Rs. 8000 at compound interest at the rate of 10% per annum. If the interest is compounded half yearly, then what will be the amount(n Rs.) to be paid after 1.5 year?", o: ["9413", "9261", "8286", "8142"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Numerical Ability (Quantitative Aptitude)", q: "If a woman purchases 14 apples for Rs. 13 and sells 13 apples for 14, then what will be her profit or loss percentage?", o: ["13.77 profit", "15.97 profit", "14.28 loss", "12.5 loss"], a: 1, e: "", qimg: "" },
  { n: 96, s: "Numerical Ability (Quantitative Aptitude)", q: "Pankaj purchases a watch for Rs. 900 and marks its marked price such a way that after allowing a discount of 30%, he earns a profit of 40%. What is the marked price (in Rs.) of the watch?", o: ["1200", "1800", "2050", "1980"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Numerical Ability (Quantitative Aptitude)", q: "The length of the diagonal of a square is 7 cm. what is the area (in cm2) of the square?", o: ["23", "32", "24.5", "21"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Numerical Ability (Quantitative Aptitude)", q: "A train takes 30 seconds to pass through a platform 320 meter long and 25 second to pass another platform 230 meter long. What is the length (in meters.) of the train?", o: ["270", "340", "220", "230"], a: 2, e: "", qimg: "" },
  { n: 99, s: "Numerical Ability (Quantitative Aptitude)", q: "Rahul is 50 years old and Mohit is 70 years old. How many years ago the ratio of their ages was 1 : 2?", o: ["35", "30", "25", "20"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Numerical Ability (Quantitative Aptitude)", q: "Anuj's efficiency is 150% of Vinod efficiency. If Anuj can complete a piece of work in 10 days, then how much time (in days) will they both take to complete the same work?", o: ["10", "8", "6", "15 100 Questions"], a: 2, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 08 Dec 2017 Shift-2";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2017,
    pyqShift: "Delhi Police Constable - 08 Dec 2017 Shift-2", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
