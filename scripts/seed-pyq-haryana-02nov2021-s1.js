/**
 * Seed: Haryana Police Constable - 02 Nov 2021 Shift-1
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

const TAGS = ["Haryana Police", "Constable", "PYQ", "2021", "Haryana Police Constable - 02 Nov 2021 Shift-1"];
const RAW = [
  { n: 1, s: "Reasoning", q: "P is Q's daughter. Q is R's mother. S is R's brother. How is S related to P?", o: ["Grandfather", "Brother", "Son", "Father"], a: 1 },
  { n: 2, s: "General Studies", q: "It is the organised aggregate of individuals who interact without giving significance to hierarchy", o: ["Reference groups", "Horizontal groups", "Vertical groups", "None of the above"], a: 1 },
  { n: 3, s: "Numerical Ability", q: "The H.C.F. of two expressions p and q is 1. Their L.C.M. is", o: ["1/pq", "pq", "(p - q)", "(p + q)"], a: 1 },
  { n: 4, s: "Current Affairs", q: "Pacific Step Up is the Forum related to", o: ["USA", "Japan", "Australia", "India"], a: 2 },
  { n: 5, s: "General Science", q: "Animals are named as per", o: ["International Zoological Nomenclature Committee", "International Zoological Nomenclature Organisation", "International Zoological Nomenclature Agency", "International Code of Zoological Nomenclature"], a: 3 },
  { n: 6, s: "Computer Knowledge", q: "A ___________ is the functionality expansion of a memory token, incorporating one or more integrated circuits into the token itself.", o: ["Smart token", "Digital token", "System token", "Memory token"], a: 0 },
  { n: 7, s: "Current Affairs", q: "Formula One F1 British Grand Prix at Silverstone Circuit held on July 18, 2021 was won by", o: ["Mercedes' Lewis Hamilton", "Tekwilson", "Robert D'silva", "Bhavish D'soza"], a: 0 },
  { n: 8, s: "Reasoning", q: "From the given answer figures, select the one in which the question figure is hidden/embedded. (Figure-based question with four figure options.)", o: ["Figure 1", "Figure 2", "Figure 3", "Figure 4"], a: 0 },
  { n: 9, s: "Computer Knowledge", q: "Which Section of IT Act, 2000 deals with legal recognition of digital signature?", o: ["Section 5", "Section 6", "Section 4", "Section 3"], a: 0 },
  { n: 10, s: "General Studies", q: "Who was the author of \"The Spirit of Laws\"?", o: ["Montesquieu", "Rousseau", "Diderot", "Voltaire"], a: 0 },
  { n: 11, s: "Reasoning", q: "What is the maximum number of pieces into which a cube can be cut with 19 cuts?", o: ["316", "412", "392", "145"], a: 2 },
  { n: 12, s: "Computer Knowledge", q: "In Microsoft Word, ___________ is a means of presenting information in an organized and attractive manner that displays text in a grid of rows and columns of cells.", o: ["Chart", "Table", "Word Art", "Picture"], a: 1 },
  { n: 13, s: "General Studies", q: "It has helped in promoting communal harmony and in keeping national integration at the forefront.", o: ["Imperialism", "Both (A) and (D)", "Secularism", "Orientalism"], a: 2 },
  { n: 14, s: "General Studies", q: "Who was the author of \"Divine Comedy\"?", o: ["Romances", "Plato", "Aristotle", "Dante Alighieri"], a: 3 },
  { n: 15, s: "General Science", q: "Density of the unit cell is", o: ["d = M a^3 / (z N_A)", "d = z M N_A / a^3", "d = a^3 N_A / (z M)", "d = z M / (a^3 N_A)"], a: 3 },
  { n: 16, s: "General Studies", q: "The Oath of Office to the President is administered by", o: ["Speaker of Lok Sabha", "Chief Justice of Supreme Court of India", "Prime Minister", "Vice President"], a: 1 },
  { n: 17, s: "Numerical Ability", q: "If a number is subtracted from the square of its one-half, the result is 48. The square root of the number is", o: ["6", "5", "4", "8"], a: 2 },
  { n: 18, s: "Computer Knowledge", q: "___________ is not an option of the alignment tab.", o: ["Left", "Justify", "Middle", "Right"], a: 2 },
  { n: 19, s: "General Studies", q: "From which language is the term \"human\" derived?", o: ["Sanskrit", "Persian", "Latin", "Greek"], a: 2 },
  { n: 20, s: "Reasoning", q: "Find the missing term in the following series. 1A2, 3C4, 7G8, ___________", o: ["13P14", "14O15", "16P17", "15O16"], a: 3 },
  { n: 21, s: "Current Affairs", q: "Who among the following Indian born person has been appointed as Chief Economist of the International Monetary Fund?", o: ["Shankar Acharya", "Bina Agarwal", "Gita Gopinath", "None of the above"], a: 2 },
  { n: 22, s: "Haryana GK", q: "In Haryana, ICAR-National Bureau of Animal Genetic Resources (NBAGR) is located in", o: ["Delhi", "Karnal", "Jind", "Hisar"], a: 1 },
  { n: 23, s: "General Science", q: "Morphologically and genetically similar individuals are called", o: ["Twins", "Traits", "Specimens", "Clones"], a: 3 },
  { n: 24, s: "General Studies", q: "The port which is known as 'Queen of the Arabian Sea'", o: ["Marmagoa", "Mangaluru", "Kochi", "Mumbai"], a: 2 },
  { n: 25, s: "General Studies", q: "The branch of Geography which is devoted to the study of landforms, their evolution and related processes is", o: ["Ecology", "Geomorphology", "Hydrology", "Climatology"], a: 1 },
  { n: 26, s: "General Studies", q: "Tenure of judges of the International Court of Justice is", o: ["6 years", "8 years", "9 years", "5 years"], a: 2 },
  { n: 27, s: "Computer Knowledge", q: "In Microsoft Office Word 2003, ______ is a shortcut key to select an entire document.", o: ["Ctrl + A", "Shift + Up", "Shift + Home", "Shift + End"], a: 0 },
  { n: 28, s: "General Studies", q: "The output per unit of variable input is", o: ["Average product", "Marginal product", "Average cost", "Total product"], a: 0 },
  { n: 29, s: "General Studies", q: "If you deduct depreciation from the Gross Investment, we will get", o: ["Final goods", "Net Investment", "GDP", "None of the above"], a: 1 },
  { n: 30, s: "Numerical Ability", q: "Cost price of 100 books is equal to the selling price of 60 books. The gain or loss percentage will be", o: ["66 1/4 %", "66%", "66 3/4 %", "66 2/3 %"], a: 3 },
  { n: 31, s: "Computer Knowledge", q: "Which of the following is a type of electronic payment mode?", o: ["credit card", "e-cheque", "e-cash", "all the above"], a: 3 },
  { n: 32, s: "General Studies", q: "The type of agriculture called 'Slash and Burn' agriculture is", o: ["Intensive farming", "Sedentary farming", "Shifting farming", "None of the above"], a: 2 },
  { n: 33, s: "General Studies", q: "GDP stands for", o: ["Gross Dollar Price", "Gross Domestic Price", "Gross Domestic Product", "None of the above"], a: 2 },
  { n: 34, s: "Reasoning", q: "Consider the series A B C D E F G H I J K L M N O P Q R S T U V W X Y Z. If the letters interchange positions so that A takes the place of Z and Z takes the place of A and so on, what will be the 13th letter from the right?", o: ["L", "O", "N", "M"], a: 3 },
  { n: 35, s: "General Studies", q: "The Election Commissioner can continue in office till the age of", o: ["62", "65", "58", "60"], a: 1 },
  { n: 36, s: "General Studies", q: "The Right to Property is a simple legal right in the Indian Constitution under Article", o: ["300 A", "326 A", "268", "243"], a: 0 },
  { n: 37, s: "General Studies", q: "Deflation may be defined as a state of falling prices but not", o: ["Fall in prices", "No change in prices", "Zero prices", "Rise in prices"], a: 3 },
  { n: 38, s: "Numerical Ability", q: "How much angle does an hour hand cover in 17 minutes?", o: ["12.5 degrees", "8.5 degrees", "10 degrees", "17 degrees"], a: 1 },
  { n: 39, s: "Reasoning", q: "Statements: 1. Some matters are elements. 2. Some matters are not molecules. Conclusions: I. All elements are matter. II. Some molecules are elements. Choose the conclusion(s) which best fit(s) logically.", o: ["Only conclusion I follows", "Neither conclusion I nor II follows", "Both conclusions I and II follow", "Only conclusion II follows"], a: 1 },
  { n: 40, s: "Numerical Ability", q: "15 litres of a mixture contains 20% alcohol and the rest water. If 3 litres of water be mixed in it, the percentage of alcohol in the new mixture will be", o: ["16 2/3", "18 1/2", "15", "17"], a: 0 },
  { n: 41, s: "Reasoning", q: "Five girls are sitting in a row. Rashi is not adjacent to Sulekha or Abha. Anuradha is not adjacent to Sulekha. Rashi is adjacent to Monika. Monika is at the middle in the row. Then, Anuradha is adjacent to whom?", o: ["Sulekha", "Abha", "Monika", "Rashi"], a: 3 },
  { n: 42, s: "Computer Knowledge", q: "FCFS stands for", o: ["First-Come-Fast-Served", "First-Come-First-Served", "File-Come-Fast-Served", "File-Come-First-Served"], a: 1 },
  { n: 43, s: "General Science", q: "The basic event in reproduction is the creation of a copy of", o: ["RNA (Ribo Nucleic Acid)", "mRNA", "Double Stranded RNA", "DNA (Deoxyribo Nucleic Acid)"], a: 3 },
  { n: 44, s: "General Science", q: "What is Heterostemony?", o: ["6 Stamens of equal length", "Stamens attached to perianth in equal length", "Stamens of different lengths", "4 Stamens of equal length"], a: 2 },
  { n: 45, s: "Reasoning", q: "Find the odd number out. 1, 4, 9, 16, 19, 36, 49, 64, 81", o: ["19", "49", "16", "9"], a: 0 },
  { n: 46, s: "Reasoning", q: "If in a certain code \"MOTHER\" is written as 'JRQKBU', then how will 'PRINCIPAL' be written in that code?", o: ["SULQFLSDO", "MRFKZFMXI", "MUFQZLMDI", "MRFKZLMXI"], a: 2 },
  { n: 47, s: "General Science", q: "A copper wire has diameter 0.5 mm and resistivity of 1.6 x 10^-8 Ohm.m. What will be the length of this wire to make its resistance 10 Ohm?", o: ["142.7 m", "152.7 m", "122.7 m", "112.7 m"], a: 2 },
  { n: 48, s: "General Studies", q: "Which of the following theories attempt to explain large-scale relationships and answer fundamental questions such as why societies form and why they change?", o: ["Grand theories", "Social theories", "Structural theories", "Paradigm theories"], a: 0 },
  { n: 49, s: "Computer Knowledge", q: "Which of the following is not a tab under the Format AutoShape dialog box?", o: ["Position", "Callouts", "Web", "Colors and lines"], a: 1 },
  { n: 50, s: "General Studies", q: "The Companies Act, 2013 focusses on the commission of the fraud rather than the ________ to the affected parties.", o: ["Resulting loss", "Capturing", "Punishment", "None of the above"], a: 0 },
  { n: 51, s: "Reasoning", q: "Six Friends Priya, Quincy, Reena, Shwetha, Twinkle and Varisha are sitting around a circular table facing the centre. Twinkle is not sitting between Quincy and Shwetha but someone else from the group. Priya sits to the left of Varisha. Reena is fourth to the right of Priya. Who is sitting to the right of Varisha?", o: ["Priya", "Quincy", "Twinkle", "None of the above"], a: 2 },
  { n: 52, s: "Reasoning", q: "In a row of boys, Akash is fifth from the left and Nikhil is eleventh from the right. If Akash is twenty-fifth from the right, then how many boys are there between Akash and Nikhil?", o: ["13", "15", "12", "14"], a: 0 },
  { n: 53, s: "Numerical Ability", q: "If 2805 / 2.55 = 1100, then 280.5 / 25.5 = ?", o: ["1.1", "1.01", "11", "0.11"], a: 2 },
  { n: 54, s: "General Studies", q: "This Section of IPC deals with 'Disobedience to Quarantine Rule'", o: ["271", "272", "273", "270"], a: 0 },
  { n: 55, s: "Reasoning", q: "Complete the series. 1, 3, 7, 13, 21, ?", o: ["29", "31", "33", "27"], a: 1 },
  { n: 56, s: "General Science", q: "One mole of a monoatomic gas is mixed with 3 moles of a diatomic gas. What is the molar specific heat of the mixture at constant volume?", o: ["9/4 R", "3/4 R", "R", "5/4 R"], a: 0 },
  { n: 57, s: "Computer Knowledge", q: "When a process is to be executed, it has to be loaded from the secondary storage to the main memory. This is called", o: ["Scheduling", "Paging", "Sharing", "Process loading"], a: 3 },
  { n: 58, s: "Reasoning", q: "In a certain language, MONEY is coded as 68 and RACE is coded as 85, then FUNGI will be coded as", o: ["79", "83", "85", "78"], a: 0 },
  { n: 59, s: "Numerical Ability", q: "In a hospital, there is a consumption of 1350 litres of milk for 70 patients for 30 days. How many patients will consume 1710 litres of milk in 28 days?", o: ["85", "95", "105", "59"], a: 1 },
  { n: 60, s: "Reasoning", q: "Find the missing term in the following series. 2, 5, 10, 17, 26, ____", o: ["30", "42", "35", "37"], a: 3 },
  { n: 61, s: "General Studies", q: "NIFTEM stands for", o: ["National Institute of Food Technology Export and Management", "National Institute of Food Technology Education and Management", "National Institute of Food Teaching Education and Management", "National Institute of Food Technology Entrepreneurship and Management"], a: 3 },
  { n: 62, s: "Computer Knowledge", q: "Which is not an advantage of E-Commerce?", o: ["Increased Prices", "Low Start-Up Cost", "Global Market Place", "24/7 Access"], a: 0 },
  { n: 63, s: "Current Affairs", q: "Recently the Ministry of Road, Transport and Highways launched a scheme for \"Good Samaritans\" under which a cash award of Rs. ______ will be provided per accident to those saving the life of a road accident victim.", o: ["2,000", "5,000", "10,000", "1,000"], a: 1 },
  { n: 64, s: "Reasoning", q: "India : New Delhi :: Germany : ?", o: ["Paris", "Frankfurt", "Berlin", "Munich"], a: 2 },
  { n: 65, s: "Reasoning", q: "How many 5's are there in the following sequence which are preceded by 3 but not followed by 8? 4 5 8 3 2 7 3 5 1 7 8 9 3 5 8 3 1 3 5 2", o: ["3", "2", "1", "4"], a: 1 },
  { n: 66, s: "Reasoning", q: "Find the missing term in the following series. QPO, NML, KJI, ________, EDC.", o: ["CAB", "JKL", "GHI", "HGF"], a: 3 },
  { n: 67, s: "Current Affairs", q: "International Universal Health Coverage Day is celebrated every year on", o: ["3rd January", "22nd September", "12th December", "None of the above"], a: 2 },
  { n: 68, s: "Numerical Ability", q: "If a, b, c, d, e are five consecutive odd numbers, their average is", o: ["abcde/5", "5(a + b + c + d + e)", "a + 4", "5(a + 4)"], a: 2 },
  { n: 69, s: "Numerical Ability", q: "4.5% of 800 + 0.5% of 640 = ?", o: ["12", "11.75", "11.25", "112.05"], a: 2 },
  { n: 70, s: "General Studies", q: "Indradhanush joint exercise between India and UK is", o: ["Air-to-water", "Air-to-land", "Air-to-air", "None of these"], a: 2 },
  { n: 71, s: "General Studies", q: "APMC stands for", o: ["Agricultural Polyhouse Management Committee", "Agricultural Propagation Management Committee", "Agricultural Pest Management Committee", "Agricultural Produce and Market Committee"], a: 3 },
  { n: 72, s: "Reasoning", q: "Ramesh started from a point A towards South and travelled 5 km, then he turned right and travelled 2 km, then he turned right and travelled 5 km, then he turned left and travelled 5 km. How far was he from point A?", o: ["17 km", "15 km", "5 km", "7 km"], a: 3 },
  { n: 73, s: "Haryana GK", q: "The duration of the basic training course for constables is", o: ["9 months", "15 months", "18 months", "6 months"], a: 0 },
  { n: 74, s: "General Studies", q: "Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM) Scheme was launched by", o: ["Ministry of Jalshakti", "Ministry of New and Renewable Energy", "Ministry of Social Welfare", "Ministry of Coal"], a: 1 },
  { n: 75, s: "Computer Knowledge", q: "PowerPoint provides a range of screen views for creating a presentation. They are", o: ["Both (B) and (C)", "Slide Sorter", "Normal", "None of the above"], a: 0 },
  { n: 76, s: "Current Affairs", q: "What is the new per transaction ceiling announced by RBI for Indo-Nepal Remittance?", o: ["Rs. 2 Lakh", "Rs. 4 Lakh", "Rs. 3 Lakh", "None of the above"], a: 0 },
  { n: 77, s: "Numerical Ability", q: "In a college election between two candidates, one candidate got 55% of the total valid votes. 15% of the votes were invalid. If the total votes were 15200, what is the number of valid votes the other candidate got?", o: ["6840", "7106", "5814", "8360"], a: 2 },
  { n: 78, s: "General Science", q: "Vernalisation is substituted by which treatment?", o: ["Ethylene", "Gibberellin", "Auxins", "Cytokinin"], a: 1 },
  { n: 79, s: "General Studies", q: "Consider the following statements about Poverty line estimation in India. I. In India, a subsistence level or minimum level of food requirement, clothing, fuel, medical requirements etc., are determined for estimating the poverty line. II. The accepted average calorie requirement in India is 2400 calories per person per day in rural areas and 2100 calories per person per day in urban areas. Choose the right option.", o: ["Only the statement (II) is correct", "Both the statements (I) and (II) are correct", "Both the statements (I) and (II) are incorrect", "Only the statement (I) is correct"], a: 1 },
  { n: 80, s: "Reasoning", q: "Find the missing number. (Table row 1: 963, 2, 844 ; row 2: 464, ?, 903)", o: ["2", "25", "66", "1"], a: 0 },
  { n: 81, s: "Numerical Ability", q: "The sum of all odd numbers between 200 and 300 is", o: ["25100", "51200", "12500", "25000"], a: 2 },
  { n: 82, s: "General Science", q: "Exoskeleton of cockroach has hardened plates called", o: ["Sclerite", "Chondratin", "Cuticle", "Chitin"], a: 0 },
  { n: 83, s: "General Science", q: "The parameter used to recognize a region as a Hotspot is", o: ["Species evenness", "Area", "Shape of habitat", "Endemism"], a: 3 },
  { n: 84, s: "General Science", q: "Which among the following groups has the most diversity of species?", o: ["Mammalia", "Fungi", "Fishes", "Amphibian"], a: 1 },
  { n: 85, s: "General Studies", q: "Inward Foreign Direct Investment (FDI)", o: ["does not generate jobs", "takes away jobs", "stops existing jobs", "generates jobs"], a: 3 },
  { n: 86, s: "General Studies", q: "Consider the following statements about Voting Rights provided by our Constitution. I. In our country, all the citizens aged 21 years and above can vote in an election. II. Some criminals and persons with unsound mind can be denied the right to vote, but only in rare situations. Choose the right option.", o: ["Only the statement (II) is correct", "Both the statements (I) and (II) are correct", "Both the statements (I) and (II) are incorrect", "Only the statement (I) is correct"], a: 0 },
  { n: 87, s: "General Studies", q: "Who among the following has the sole authority to issue banknotes in India?", o: ["State Bank of India", "Reserve Bank of India", "Government of India", "None of the above"], a: 1 },
  { n: 88, s: "Current Affairs", q: "Consider the following statements about the web portal e-GOPALA. I. It has been launched by the National Dairy Development Board (NDDB). II. It lets farmers manage livestock including buying and selling of disease-free germplasm in all forms. Choose the right option.", o: ["Both the statements (I) and (II) are correct", "Only the statement (II) is correct", "Only the statement (I) is correct", "None of the above"], a: 0 },
  { n: 89, s: "General Science", q: "Aliphatic amines are stronger bases than ammonia due to _____ of alkyl groups.", o: ["- E effect", "- I effect", "+ I effect", "+ E effect"], a: 2 },
  { n: 90, s: "General Studies", q: "Total number of High Courts in India is", o: ["21", "25", "23", "None of the above"], a: 1 },
  { n: 91, s: "English Language", q: "Give one-word substitute: Holding fast or keeping firm hold on an object or principle.", o: ["Teetotaller", "Tenacious", "Tendency", "Tactile"], a: 1 },
  { n: 92, s: "English Language", q: "Fill in the blank with the appropriate word: I did not give him _____ butter.", o: ["fewer", "a few", "any", "some"], a: 2 },
  { n: 93, s: "English Language", q: "Choose the right antonym of the word given in capital letters: TAINTED", o: ["Failure", "Bold", "Bigotry", "Pure"], a: 3 },
  { n: 94, s: "English Language", q: "Spot the correct alternative that best explains the meaning of the word: Wily", o: ["Cunning", "Angry", "Wise", "Stupid"], a: 0 },
  { n: 95, s: "English Language", q: "Select the option which best expresses the sentence in Indirect/Direct speech: \"How clever of you to have solved the Puzzle so quickly!\" said the master.", o: ["The master shouted that he had solved the puzzle so quickly.", "The master was stunned that he had solved cleverly the puzzle.", "The master expressed that he was clever enough to solve the puzzle so quickly", "The master exclaimed with applause that it was very clever of him to have solved the puzzle so quickly."], a: 3 },
  { n: 96, s: "Hindi", q: "'तुम मन लगाकर पढ़ते तो अवश्य पास हो जाते।' यह वाक्य _____ भूतकाल का उदाहरण है।", o: ["अपूर्ण", "हेतु-हेतुमद्", "पूर्ण", "इनमें से कोई नहीं"], a: 1 },
  { n: 97, s: "Hindi", q: "उल्टा अर्थ देनेवाले शब्दों को _____ कहते हैं।", o: ["तद्भव", "विकारी", "विलोम", "तत्सम"], a: 2 },
  { n: 98, s: "Hindi", q: "पूर्वकालिक कृदंत अव्यय किसे कहते हैं?", o: ["यह अव्यय का रूप तात्कालिक कृदंत अव्यय के समान 'ता' को 'ते' आदेश करने से बनता है", "यह अव्यय भूतकालिक कृदंत विशेषण के अंत्य 'आ' को 'ए' आदेश करने से बनता है", "यह अव्यय धातु के रूप में रहता है, या धातु के अंत में 'के', 'कर' या 'करके' जोड़ने से बनता है", "इनमें से कोई नहीं"], a: 2 },
  { n: 99, s: "Hindi", q: "कारक _____ प्रकार के होते हैं।", o: ["पाँच", "छ:", "नौ", "आठ"], a: 3 },
  { n: 100, s: "Hindi", q: "विशेषण के जिस रूप से दो से अधिक वस्तुओं में किसी एक के गुण की अधिकता व न्यूनता सूचित होती है, उसे _____ कहते हैं।", o: ["उत्तरावस्था", "उत्तमावस्था", "मूलावस्था", "इनमें से कोई नहीं"], a: 1 }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'HR-POL-CONST' });
  if (!exam) throw new Error('Exam HR-POL-CONST not found — aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Haryana Police Written Exam' });
  if (!pattern) throw new Error('ExamPattern "Haryana Police Written Exam" not found — aborting.');

  const TEST_TITLE = "Haryana Police Constable - 02 Nov 2021 Shift-1";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  const questions = RAW.map(r => ({
    questionText: r.q, questionImage: '', options: r.o,
    optionImages: r.o.map(() => ''), correctAnswerIndex: r.a,
    explanation: '', section: r.s, tags: TAGS, difficulty: 'medium'
  }));

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2021,
    pyqShift: TEST_TITLE, pyqExamName: 'Haryana Police Constable', questions
  });
  console.log('Created PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
