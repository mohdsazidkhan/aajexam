/**
 * Seed: Haryana Police Constable (Female) - 18 Sep 2021 Shift-2
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

const TAGS = ["Haryana Police", "Constable", "PYQ", "2021", "Haryana Police Constable (Female) - 18 Sep 2021 Shift-2"];
const RAW = [
  { n: 1, s: "General Science", q: "The light enters the eye through a thin membrane structure, this is called", o: ["Optic nerve", "Retina", "Iris", "Cornea"], a: 3 },
  { n: 2, s: "Reasoning", q: "Y is the brother of W; X is the daughter of W; E is the sister of Y; Z is the brother of X. Who is the Uncle of Z?", o: ["X", "E", "W", "None of these"], a: 2 },
  { n: 3, s: "Haryana GK", q: "Chhachhrauli is known as _______ of Haryana.", o: ["Cherrapunji", "Agra", "Texas", "New York"], a: 2 },
  { n: 4, s: "Haryana GK", q: "The Bahin Shanno Devi Panchayati Raj Award by Haryana Government is given to those women Panchayat leaders who have done exemplary work for the", o: ["Female literacy", "Health and nutrition", "Empowerment of women", "All of the above"], a: 2 },
  { n: 5, s: "General Studies", q: "Which of the following States of India often called as \"Food Mine\" of the country?", o: ["Kerala", "Maharashtra", "Haryana", "Telangana"], a: 2 },
  { n: 6, s: "General Studies", q: "This famous personality is known as the creator of Rock Garden, Chandigarh", o: ["Dayal Sharma", "Nek Chand", "Neki Ram", "Chhotu Ram"], a: 1 },
  { n: 7, s: "Reasoning", q: "Number of parallelograms in the given figure (a parallelogram divided into a 3-column by 2-row grid of smaller parallelograms) is", o: ["19", "16", "18", "20"], a: 2 },
  { n: 8, s: "Reasoning", q: "Priya goes 30 km towards North from a fixed point, then after turning to her right she goes 15 km. After this she goes 30 km after turning to her right. How far and in what direction is she now from her starting point?", o: ["20 m East", "30 m East", "10 m East", "15 m East"], a: 1 },
  { n: 9, s: "Haryana GK", q: "Haryana Police has wireless repeater antennae at", o: ["Takdi hill", "Sarahan hill", "Tosham hill range", "All the above"], a: 2 },
  { n: 10, s: "General Science", q: "Fowl Cholera is caused by", o: ["Salmonella pullorum", "Paramyxo virus type 1", "Vibrio cholera", "Pasteurella multocida"], a: 3 },
  { n: 11, s: "Computer Knowledge", q: "A _______ is a record of information that most servers collect by default and is often accessible from the hosting company or Internet Service Provider (ISP) for the site.", o: ["Cascaded Style Sheet", "Server Log", "Boot Record", "Root File System"], a: 1 },
  { n: 12, s: "Numerical Ability", q: "The LCM of two numbers is 48. The numbers are in the ratio of 2 : 3. Find the sum of the numbers.", o: ["40", "32", "28", "64"], a: 0 },
  { n: 13, s: "Computer Knowledge", q: "Web page files use the _______ file name extension.", o: [".HTM or .HTML", ".jpeg", ".doc", ".js"], a: 0 },
  { n: 14, s: "General Science", q: "Excessive irrigation with dry climatic regions (Punjab and Haryana) leads to the deposition of salt on the top layer of the soil. In such cases farmers are advised to add which of the following minerals to solve the problem of salinity in the soil?", o: ["Corundum", "Calcite", "Gypsum", "None of the above"], a: 2 },
  { n: 15, s: "General Studies", q: "Who was defeated by Babur at the battle of Khanwa in 1527?", o: ["Harshavardhan", "Gopal Singh", "Jatwan", "Hasan Khan Mewati"], a: 3 },
  { n: 16, s: "Reasoning", q: "Find the missing number in the table (row 1: 3, 8, 10, 2, ?, 1; row 2: 6, 56, 90, 2, 20, 0).", o: ["3", "7", "2", "5"], a: 0 },
  { n: 17, s: "General Studies", q: "Habeas corpus means", o: ["Produce the body before the Court", "Stall the proceedings", "Perform public duty", "What is the authority to continue in the office"], a: 0 },
  { n: 18, s: "General Studies", q: "Highest ranking in Indian Police", o: ["Superintendent of Police", "Deputy Inspector General of Police", "Inspector General of Police", "Director General of Police"], a: 3 },
  { n: 19, s: "Current Affairs", q: "India's first grain ATM has been set up in", o: ["Mysore, Karnataka", "Kochi, Kerala", "Gurugram, Haryana", "None of the above"], a: 2 },
  { n: 20, s: "Haryana GK", q: "Consider the following statements about Pran Vayu Devta Pension Scheme (PVDPS) of Government of Haryana. I. It is an initiative to honour all those trees which are of the age of 75 years and above and have served humanity throughout their life by producing oxygen, reducing pollution, providing shade, etc. II. Such trees will be identified throughout the State and these will be looked after by involving local people. Choose the correct option.", o: ["Both the statements I and II are correct", "Both the statements I and II are incorrect", "Only the statement I is correct", "Only the statement II is correct"], a: 0 },
  { n: 21, s: "Numerical Ability", q: "If a = root(3)/2, then root(1+a) + root(1-a) = ?", o: ["root(3)/2", "2 + root(3)", "2 - root(3)", "root(3)"], a: 3 },
  { n: 22, s: "Computer Knowledge", q: "________ is restricted to a small geographical area, usually to a relatively small number of stations.", o: ["Metropolitan Area Network (MAN)", "Internet", "Local Area Network (LAN)", "Wide Area Network (WAN)"], a: 2 },
  { n: 23, s: "Numerical Ability", q: "A fruit seller had some apples. He sells 40% apples and still has 420 apples. Originally, he had", o: ["672 apples", "700 apples", "588 apples", "600 apples"], a: 1 },
  { n: 24, s: "Haryana GK", q: "How many total number of seats are there in Haryana Legislative Assembly (Vidhan Sabha)?", o: ["77", "90", "94", "None of the above"], a: 1 },
  { n: 25, s: "Numerical Ability", q: "How many days will be there from 26th January, 1988 to 15th May, 1988 (both days included)?", o: ["112", "113", "111", "110"], a: 0 },
  { n: 26, s: "General Studies", q: "Full form of BPRD is", o: ["Bureau of Police Research and Development", "Batch of Police Research and Department", "Board of Police Research and Development", "None of the above"], a: 0 },
  { n: 27, s: "General Science", q: "When area of cross-section of a pipe increases, the velocity of flow of the liquid", o: ["Becomes zero", "Remains the same", "Increases", "Decreases"], a: 3 },
  { n: 28, s: "Reasoning", q: "Which number should come in the place of question mark? 120, 99, 80, 63, 48, ?", o: ["39", "35", "40", "38"], a: 1 },
  { n: 29, s: "Computer Knowledge", q: "Current microprocessor speed is measured in", o: ["Megahertz", "Gigahertz", "Nanohertz", "Kilohertz"], a: 1 },
  { n: 30, s: "Reasoning", q: "Select the odd word from the given alternatives.", o: ["Tree", "Shrub", "Herb", "Flower"], a: 3 },
  { n: 31, s: "General Science", q: "__________ states that at constant volume, pressure of a fixed amount of gas varies directly with the temperature.", o: ["Boyle's law", "Gay Lussac's law", "Avogadro law", "Charles' law"], a: 1 },
  { n: 32, s: "Haryana GK", q: "In this year the campaign of Beti Bachao-Beti Padhao was started in Haryana", o: ["2013", "2019", "2015", "2014"], a: 2 },
  { n: 33, s: "Haryana GK", q: "Shyam Satsai is the composition of", o: ["Santokh Singh", "Mohammad Sarwar", "Tulsi Ram Sharma", "Deedar Singh"], a: 2 },
  { n: 34, s: "Reasoning", q: "If Sunitha is taller than Seema and Reena. Reena is shorter than Radha and Gowri, Bina is taller than Radha and shorter than Sunitha. Sunitha is not the tallest and Reena not the shortest, then who is the tallest?", o: ["Gowri", "Bina", "Data inadequate", "Seema"], a: 0 },
  { n: 35, s: "General Studies", q: "A person below ______ age is not punished for his crime.", o: ["12 years", "18 years", "21 years", "7 years"], a: 3 },
  { n: 36, s: "General Studies", q: "According to Food Safety and Standard Regulations, 2011, which among the following statements is correct with respect to standardized milk?", o: ["Milk should contain standardized to fat minimum 4.5% and solids-not-fat minimum 8.5%.", "Milk should contain standardized to fat minimum 1.5% and solids-not-fat minimum 9%.", "Milk should contain standardized to fat minimum 3% and solids-not-fat minimum 8.5%.", "Milk should contain standardized to fat minimum 4.5% and solids-not-fat minimum 6%."], a: 2 },
  { n: 37, s: "Haryana GK", q: "Which of the following Institutes of Haryana has been renamed after former Finance Minister of India Arun Jaitley?", o: ["National Institute of Design, Ahmedabad", "National Institute of Financial Management (NIFM), Faridabad", "National Institute for Education and Vocational Training, Karnal", "None of the above"], a: 1 },
  { n: 38, s: "Reasoning", q: "Choose the correct alternative that will continue the same pattern and replace the question mark in the given series. 1, 9, 25, 49, ?, 121", o: ["91", "100", "64", "81"], a: 3 },
  { n: 39, s: "Numerical Ability", q: "If the largest 3 digit number is subtracted from the smallest 5 digit number, then the remainder is", o: ["1", "90001", "9001", "9000"], a: 0 },
  { n: 40, s: "Numerical Ability", q: "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.", o: ["4 hrs", "5 hrs", "2 hrs", "3 hrs"], a: 0 },
  { n: 41, s: "Reasoning", q: "In a certain language, MADRAS is coded as NBESBT, how is BOMBAY coded in that code?", o: ["CPOCBZ", "CPNCBZ", "CPNCBX", "CQOCBZ"], a: 0 },
  { n: 42, s: "Computer Knowledge", q: "__________ is a set of rules that governs the communication between computers on a network.", o: ["A protocol", "A port", "A handshake", "A synchronization"], a: 0 },
  { n: 43, s: "General Science", q: "\"Chewing-gum fits\" is a symptom of", o: ["Rabies", "Parvo Viral Enteritis", "Canine Distemper", "None of the above"], a: 2 },
  { n: 44, s: "General Science", q: "A projectile having initial kinetic energy 60 J is projected at an angle of 45 degrees with the horizontal. What is the kinetic energy of the projectile at the highest point of its trajectory?", o: ["30 J", "15 J", "45 J", "60 J"], a: 0 },
  { n: 45, s: "Reasoning", q: "A man had 17 sheep. All but nine died. How many was he left with?", o: ["8", "17", "Nil", "9"], a: 3 },
  { n: 46, s: "Reasoning", q: "What will come in the place of question mark? AZ, CX, FU, ?", o: ["IV", "KP", "IR", "JQ"], a: 3 },
  { n: 47, s: "Haryana GK", q: "In which of the following places of Haryana State Government recently started the 'Project Air Care' to combat rising air pollution?", o: ["Kurukshetra", "Ambala", "Gurugram", "None of the above"], a: 2 },
  { n: 48, s: "Haryana GK", q: "In which of the following districts of Haryana pilgrimage destination \"Gurudwara Nada Sahib\" is situated?", o: ["Karnal", "Sonipat", "Panchkula", "None of the above"], a: 2 },
  { n: 49, s: "Haryana GK", q: "Haryana Armed Police has battalions at", o: ["Sonipat", "Bhiwani", "Ambala", "Rohtak"], a: 3 },
  { n: 50, s: "General Studies", q: "Who among the following is the second woman to be India's External Affairs Minister?", o: ["Manushi Chillar", "Geetha Phogat", "Indira Gandhi", "Sushma Swaraj"], a: 3 },
  { n: 51, s: "Reasoning", q: "Ecology is related to environment in the same way as Histology is related to", o: ["Tissues", "Hormones", "Fossils", "History"], a: 0 },
  { n: 52, s: "General Studies", q: "The total number of seats won by Congress Party in 1984 Lok Sabha elections", o: ["453", "415", "451", "435"], a: 1 },
  { n: 53, s: "Reasoning", q: "A is B's sister. C is B's mother. D is C's father. E is D's mother, then how is A related to D?", o: ["Grand-daughter", "Daughter", "Grandfather", "Grandmother"], a: 0 },
  { n: 54, s: "General Studies", q: "Muhammad Ghori defeated _______ in the second battle of Taraori.", o: ["Akbar", "Prithviraj Chauhan", "Babur", "Ibrahim Lodhi"], a: 1 },
  { n: 55, s: "Numerical Ability", q: "The flowers in a basket double every minute and the basket gets full in one hour. In how many minutes the basket was 1/32 full?", o: ["45 mins", "32 mins", "12 mins", "55 mins"], a: 3 },
  { n: 56, s: "General Science", q: "Which part of the Human lungs provide surface for the exchange of gases?", o: ["Diaphragm", "Bronchioles", "Bronchi", "Alveoli"], a: 3 },
  { n: 57, s: "General Studies", q: "Which of the following statements are true about the functions of Election Commission of India? I. It supervises the preparation of up-to-date voters list. II. It prepares the Election schedule. III. It gives recognition to political parties. IV. It can postpone or cancel the election in the entire country.", o: ["II, III and IV only", "II and III only", "I, II and III only", "All the above"], a: 2 },
  { n: 58, s: "General Science", q: "Nili-Ravi is a breed of", o: ["Cow", "Goat", "Water Buffalo", "None of the above"], a: 2 },
  { n: 59, s: "Haryana GK", q: "What is the main objective of the anti-Covid \"Sanjeevani Pariyojana\" of the Haryana Government?", o: ["To provide for supervised and quick medical care at home largely for people in rural areas with mild to moderate symptoms of Covid-19 disease", "To provide free Covid-19 vaccination to the people residing both rural and urban areas of the State", "To provide free Covid-19 vaccination to the people residing only in rural areas of the State", "None of the above"], a: 0 },
  { n: 60, s: "General Science", q: "Young rabbit which has attained the marketable weight is known as", o: ["Pelt", "Kit", "Fur", "Fryer"], a: 3 },
  { n: 61, s: "General Science", q: "Oxidation state of oxygen in OF2 is", o: ["-1", "-2", "+1", "+2"], a: 3 },
  { n: 62, s: "Current Affairs", q: "Shri Tarlochan Singh awarded Padma Bhushan - 2021 in the field of", o: ["Civil Service", "Medicine", "Public Affairs", "None of the above"], a: 2 },
  { n: 63, s: "Numerical Ability", q: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?", o: ["324 m", "150 m", "120 m", "180 m"], a: 1 },
  { n: 64, s: "Haryana GK", q: "Which district of Haryana is known as the 'hub of making durries'?", o: ["Bhiwani", "Hisar", "Gurugram", "Panipat"], a: 3 },
  { n: 65, s: "Reasoning", q: "Substitute the correct mathematical symbols for * in the following equation. 16 * 4 * 5 * 14 * 6", o: ["+ + = -", "+ x = +", "+ - = x", "- x + ="], a: 0 },
  { n: 66, s: "Reasoning", q: "If the day before yesterday was Thursday, when will Sunday be?", o: ["Day after tomorrow", "3 days after today", "Tomorrow", "Today"], a: 2 },
  { n: 67, s: "General Studies", q: "According to the early Tamil Literature (Sangam Texts) the large landowners living in the villages are called as", o: ["Uzhavar", "Adimai", "Vellalar", "None of the above"], a: 2 },
  { n: 68, s: "Haryana GK", q: "Haryana Police is headed by", o: ["Education Minister", "Health and Welfare Minister", "External Affair Minister", "Home Minister"], a: 3 },
  { n: 69, s: "Numerical Ability", q: "I have a few sweets to be distributed. If I keep 2 or 3 or 4 in a pack, I am left with 1 sweet. If I keep 5 in a pack, I am left with none. What is the minimum number of sweets I have to pack and distribute?", o: ["54", "65", "37", "25"], a: 3 },
  { n: 70, s: "Computer Knowledge", q: "______ is defined as the structure of a website and its pages : how the site and the site navigations are organized.", o: ["Wireframes", "Mock-up", "Information architecture", "User experience"], a: 2 },
  { n: 71, s: "Reasoning", q: "If p > q and r < 0, then which of the following is true?", o: ["p - r < q - r", "pr > qr", "pr < qr", "none of these"], a: 2 },
  { n: 72, s: "Haryana GK", q: "Haryana Police has special women helpline number", o: ["1011", "1091", "1051", "1021"], a: 1 },
  { n: 73, s: "General Science", q: "The SI unit of resistivity is", o: ["Ohm", "Ohm per meter", "Ohm meter", "Per ohm per meter"], a: 2 },
  { n: 74, s: "Reasoning", q: "Choose the odd one out.", o: ["Tiger", "Cow", "Zebra", "Lion"], a: 1 },
  { n: 75, s: "Computer Knowledge", q: "In a spreadsheet, everything is stored in little boxes called", o: ["Cells", "Banner", "Rows", "Columns"], a: 0 },
  { n: 76, s: "Haryana GK", q: "Haryana Police was formed in the year", o: ["1970", "1968", "1966", "1974"], a: 2 },
  { n: 77, s: "Haryana GK", q: "'Sewa Suraksha Sahyog' is the motto of ______ Police Department.", o: ["Gujarat", "Jharkhand", "Haryana", "Maharashtra"], a: 2 },
  { n: 78, s: "Reasoning", q: "If ACNE is coded as 3, 7, 29, 11, then BOIL will be coded as", o: ["5, 29, 19, 25", "5, 29, 19, 27", "5, 31, 21, 25", "5, 31, 19, 25"], a: 3 },
  { n: 79, s: "General Studies", q: "As per Transport of Animal Rules - 1978, the maximum distance allowed for cattle in a day while transport on foot shall be", o: ["45 km", "40 km", "30 km", "20 km"], a: 2 },
  { n: 80, s: "General Science", q: "Bee-sting leaves an acid which causes pain and irritation. Use of a mild base like __________ on the stung area gives relief.", o: ["Lemon juice", "Vinegar", "Milk of magnesia", "Baking soda"], a: 2 },
  { n: 81, s: "Reasoning", q: "Find the missing terms in the given series. G2X, J4V, M8T, ?, S32P", o: ["P16R", "P8S", "N64S", "Q16R"], a: 0 },
  { n: 82, s: "Current Affairs", q: "__________ was the first Indian woman to win a medal in Paralympic games.", o: ["Deepa Phogat", "Deepa Malik", "Saina Nehwal", "Sarojini Gupta"], a: 1 },
  { n: 83, s: "Computer Knowledge", q: "Memory used by your PC's video system is known as", o: ["Cache Memory", "Video Memory", "Virtual Memory", "Flash Memory"], a: 1 },
  { n: 84, s: "Haryana GK", q: "This river enters Haryana near Kalesar forest", o: ["Sahibi", "Yamuna", "Markanda", "Ghaggar"], a: 1 },
  { n: 85, s: "Computer Knowledge", q: "__________ is any kind of unwanted software that is installed without your adequate consent.", o: ["Utility software", "Spam", "Firmware", "Malware"], a: 3 },
  { n: 86, s: "General Studies", q: "The most distinctive feature of Harappan cities is", o: ["Carefully planned drainage system", "Carefully planned agriculture", "Planned buildings", "Carefully planned roads"], a: 0 },
  { n: 87, s: "General Science", q: "The amount of the filtrate formed by the kidneys per minute is called", o: ["Glomerular filtration rate", "Henle's loop filtration rate", "Proximal filtration rate", "Distal filtration rate"], a: 0 },
  { n: 88, s: "Numerical Ability", q: "A vessel is filled with liquid, 3 parts of which are water and 5 parts syrup. How much of the mixture must be drawn off and replaced with water, so that the mixture may be half water and half syrup?", o: ["1/5", "1/7", "1/3", "1/4"], a: 0 },
  { n: 89, s: "Numerical Ability", q: "The price of sugar is increased by 25%. If a family wants to keep its expenses on sugar unaltered, then the family will have to reduce the consumption of sugar by", o: ["22%", "20%", "25%", "21%"], a: 1 },
  { n: 90, s: "Reasoning", q: "Choose pair of numbers which comes next. 2, 44, 4, 41, 6, 38, 8,", o: ["34, 9", "35, 32", "10, 12", "35, 10"], a: 3 },
  { n: 91, s: "Haryana GK", q: "Haryana State Police shall have", o: ["State Crime Investigation Wing", "Both (A) and (C)", "State Intelligence Wing", "None of these"], a: 1 },
  { n: 92, s: "General Science", q: "Anas platyrrhynchos is commonly known as", o: ["Duck", "Quail", "Turkey", "Chicken"], a: 0 },
  { n: 93, s: "General Science", q: "Modulus of elasticity has the dimensions same as that of", o: ["Pressure", "Torque", "Energy", "Power"], a: 0 },
  { n: 94, s: "General Studies", q: "Warrant means", o: ["An order to appear as witness", "An order to produce the evidence", "A notice to appear before the Court", "An arrest order issued by the Court"], a: 3 },
  { n: 95, s: "Reasoning", q: "Choose the alternative which resembles the mirror image of the given combination: GEOGRAPHY", o: ["YHⱭARGOEG", "YHPARGOEG", "ⱭEOGRAPHY", "YHPARⱭOEG"], a: 1 },
  { n: 96, s: "Reasoning", q: "Choose the best alternative. 3 : 11 :: 7 : ?", o: ["18", "22", "51", "29"], a: 2 },
  { n: 97, s: "Current Affairs", q: "Which of the following States has become kerosene free State based on the recent Report of Parliamentary Committee on petroleum?", o: ["Haryana", "Both (A) and (C)", "Punjab", "None of the above"], a: 0 },
  { n: 98, s: "Numerical Ability", q: "The sum of the place values of 3 in the number 503535 is", o: ["6", "3300", "3030", "60"], a: 2 },
  { n: 99, s: "Computer Knowledge", q: "_______ is a process of retrieving, deleted, corrupted and lost data from secondary storage devices.", o: ["Data recovery", "Data mining", "Data discovery", "Data decryption"], a: 0 },
  { n: 100, s: "General Studies", q: "The First Ancient Olympic games were held in", o: ["1992 CE", "1972 CE", "776 BCE", "776 CE"], a: 2 }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'HR-POL-CONST' });
  if (!exam) throw new Error('Exam HR-POL-CONST not found — aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Haryana Police Written Exam' });
  if (!pattern) throw new Error('ExamPattern "Haryana Police Written Exam" not found — aborting.');

  const TEST_TITLE = "Haryana Police Constable (Female) - 18 Sep 2021 Shift-2";
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
