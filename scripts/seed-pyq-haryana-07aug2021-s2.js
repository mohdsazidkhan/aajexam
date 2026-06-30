/**
 * Seed: Haryana Police Constable - 07 Aug 2021 Shift-2
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

const TAGS = ["Haryana Police", "Constable", "PYQ", "2021", "Haryana Police Constable - 07 Aug 2021 Shift-2"];
const RAW = [
  { n: 1, s: "General Science", q: "Which one of the following is not a function of the liver?", o: ["Regulation of blood sugar", "Enzyme activation", "Detoxification", "Reproduction"], a: 3 },
  { n: 2, s: "General Science", q: "Proteins are made up of .......", o: ["Sugars", "Amino acids", "Fatty acids", "Nucleic acids"], a: 1 },
  { n: 3, s: "General Science", q: "Which vitamin is needed to prevent Xerophthalmia?", o: ["A", "B", "C", "D"], a: 0 },
  { n: 4, s: "General Science", q: "Hepatitis is a general term for a disease that is caused by:", o: ["Viruses", "Bacteria", "Parasites", "All the above"], a: 3 },
  { n: 5, s: "General Science", q: "What happens to the resistance of a wire when its length is doubled?", o: ["Gets doubled", "Becomes half", "Becomes nil", "None of the above"], a: 0 },
  { n: 6, s: "General Science", q: "The resistance which can be changed as desired is called:", o: ["Wire joints", "Fixed resistance", "Variable resistance", "A switch"], a: 2 },
  { n: 7, s: "General Science", q: "Rheostat is the other name of:", o: ["Fixed resistance", "Variable resistance", "Insulator", "Conductor"], a: 1 },
  { n: 8, s: "General Science", q: "Which one is not the form of Biocides?", o: ["Salt", "Iodine", "Sugar", "Bleach"], a: 2 },
  { n: 9, s: "General Science", q: "What is Rodenticide?", o: ["A medicine to kill worms", "A medicine to kill animals", "A lubricant", "A pesticide"], a: 3 },
  { n: 10, s: "General Science", q: "What is NBR?", o: ["Normal Acrylonitrile-butadiene rubber", "Natural Acrylonitrile-butadiene rubber", "N Acrylonitrile-butane rubber", "Acrylonitrile-butadiene rubber"], a: 3 },
  { n: 11, s: "Computer Knowledge", q: "Which printer is a type of Impact printer?", o: ["Page Printer", "Laser Printer", "Ink Jet Printer", "Dot Matrix Printer"], a: 3 },
  { n: 12, s: "Computer Knowledge", q: "Word Processing, Spreadsheet and Photo Editing are examples of .............", o: ["Application software", "System software", "Operating System Software", "Platform Software"], a: 0 },
  { n: 13, s: "Computer Knowledge", q: "Retail workers generally use ............... terminals to process sales transactions.", o: ["Sales Processing", "Transaction Point", "Automatic Teller", "Point of Sale"], a: 3 },
  { n: 14, s: "Computer Knowledge", q: "Inheritance is a property of the object which passes its characteristics to its .................", o: ["sub classes", "off spring", "Super classes", "Parents"], a: 0 },
  { n: 15, s: "Computer Knowledge", q: "Which of the following is a serial port which provides direct connection to the network?", o: ["Firewire", "NIC", "USB", "Internal Modem"], a: 1 },
  { n: 16, s: "Computer Knowledge", q: "Which one of the following saves non-contiguous clusters on a hard disk?", o: ["Clustered file", "Defragmented file", "Sectored File", "Fragmented File"], a: 3 },
  { n: 17, s: "Computer Knowledge", q: "A program that converts high level language into machine language?", o: ["Linker", "Assembler", "Compiler", "All of the above"], a: 2 },
  { n: 18, s: "Computer Knowledge", q: "How many operating systems can work on one computer at the same time?", o: ["only one", "two", "three", "four"], a: 0 },
  { n: 19, s: "Computer Knowledge", q: "Images can be sent over telephone lines using .................", o: ["Big Bandwidth", "Fax", "Scanner", "Cable"], a: 1 },
  { n: 20, s: "Computer Knowledge", q: "Which of the following is a scientific computer language?", o: ["Basic", "COBOL", "Fortran", "Pascal"], a: 2 },
  { n: 21, s: "General Studies", q: "Single super phosphate fertilizer contains", o: ["16 % phosphorous and 12% sulphur", "20 % phosphorous and 12% sulphur", "16 % phosphorous and 18% sulphur", "18 % phosphorous and 18% sulphur"], a: 0 },
  { n: 22, s: "General Studies", q: "Painted bug is an important insect of following crop", o: ["Gram", "Garden Pea", "Mustard", "Mung bean"], a: 0 },
  { n: 23, s: "General Studies", q: "Karnal bunt disease is found in following crop", o: ["Gram", "Wheat", "Mustard", "Sugarcane"], a: 1 },
  { n: 24, s: "General Studies", q: "Mahi Sugandha is a variety of following crop", o: ["Wheat", "Paddy", "Fennel", "Coriander"], a: 2 },
  { n: 25, s: "General Studies", q: "GNG 2171 (Meera) is a popular variety of following crop", o: ["Black gram", "Green gram", "Cotton", "Gram"], a: 3 },
  { n: 26, s: "General Studies", q: "Seed rate in Bajra (Pearl millet) crop", o: ["4-5 kg/ha.", "6-7 kg/ha.", "1-2 kg/ha.", "8-9 kg/ha."], a: 0 },
  { n: 27, s: "General Studies", q: "Mean annual carbon dioxide concentration in the atmosphere currently is......", o: ["0.02 per cent", "0.03 per cent", "0.04 per cent", "0.05 per cent"], a: 2 },
  { n: 28, s: "General Studies", q: "The highest percentage content of nitrogen among the commonly used nitrogenous fertilizers is embodied by", o: ["Urea", "DAP", "Ammonium nitrate", "Anhydrous ammonia"], a: 3 },
  { n: 29, s: "General Studies", q: "Zero tillage system was first used successfully in 1950 in pasture renovation in............", o: ["Germany", "United Kingdom", "USA", "Japan"], a: 2 },
  { n: 30, s: "General Studies", q: "The irrigation system which have highest efficiencies", o: ["Sprinkler system", "Check basin", "Flood", "Drip system"], a: 3 },
  { n: 31, s: "General Studies", q: "The daily requirement of dry matter for a heavy cow (400 kg) is", o: ["10-12 kg", "15-17 kg", "20-22 kg", "2.5-5 kg"], a: 0 },
  { n: 32, s: "General Studies", q: "A ring should be worn in the nose of the bull-", o: ["at the age of 6 months", "at the age of 8 months to 1 year", "at the age of 1 to 2 years", "after 2 years of age"], a: 2 },
  { n: 33, s: "General Studies", q: "Which one of the following is the best buffalo for milk production in the northern part of India?", o: ["Bhadavari Buffalo", "Murrah Buffalo", "Jafrabadi buffalo", "Mehsana buffalo"], a: 1 },
  { n: 34, s: "General Studies", q: "The main feature of identification of Haryana cow is-", o: ["long and narrow face", "small and narrow face", "long and broad face", "short and wide face"], a: 0 },
  { n: 35, s: "General Studies", q: "Tharparkar cow is of which species-", o: ["Milch Breed", "Working Breed", "Dual Purpose Breed", "None Of these"], a: 2 },
  { n: 36, s: "General Studies", q: "The best method of milking is-", o: ["Copying Method", "Fisting Method", "Stripping Method", "None Of these"], a: 2 },
  { n: 37, s: "General Studies", q: "To which family do cow and buffalo belong?", o: ["Bovidae", "Suidae", "Equidae", "Camelidae"], a: 0 },
  { n: 38, s: "General Studies", q: "Match List-I and List-II and select the correct answer. List-I: (A) White Revolution (B) Cold Brown Revolution (C) Blue Revolution (D) Green Revolution; List-II: 1. Fertilizer Production 2. Fish Production 3. Cereal Production 4. Milk Production. Code- A B C D", o: ["4 1 2 3", "1 2 3 4", "2 4 3 1", "1 3 4 2"], a: 0 },
  { n: 39, s: "General Studies", q: "In one of the following animals, undivided hooves are found-", o: ["in horse", "in the cow", "in buffalo", "in sheep"], a: 0 },
  { n: 40, s: "General Science", q: "What is the average temperature of cow and buffalo?", o: ["98.4 F", "100 F", "101.5 F", "102 F"], a: 2 },
  { n: 41, s: "English Language", q: "All civilized nations now believe in __________ treatment of poisoners.", o: ["human", "humane", "humanitarian", "humiliating"], a: 1 },
  { n: 42, s: "English Language", q: "His father introduced him at an __________ age to the game of cricket.", o: ["inquisitive", "insensible", "impressionable", "impressive"], a: 2 },
  { n: 43, s: "English Language", q: "Find the correctly spelt word.", o: ["Agressive", "Agrressive", "Aggressive", "Aggresive"], a: 2 },
  { n: 44, s: "English Language", q: "Find the correctly spelt word.", o: ["Sinchronize", "Syycronise", "Synchronize", "Synchromise"], a: 2 },
  { n: 45, s: "English Language", q: "Select the option which best expresses the sentence in Passive/Active Voice: Our task had been completed before sunset.", o: ["We completed our task before sunset.", "We have completed our task before sunset.", "We complete our task before sunset.", "We had completed our task before sunset."], a: 3 },
  { n: 46, s: "English Language", q: "Select the option which best expresses the sentence in Passive/Active Voice: We have already done the exercise.", o: ["Already, the exercise has been done by us", "The exercise has already been done by us", "The exercise had been already done by us", "The exercise is already done by us"], a: 1 },
  { n: 47, s: "English Language", q: "Choose the word which is similar to the meaning of the given word: MASSIVE", o: ["Lump sum", "Strong", "Little", "Huge"], a: 3 },
  { n: 48, s: "English Language", q: "Choose the word which is similar to the meaning of the given word: DEFER", o: ["Indifferent", "Defy", "Differ", "Postpone"], a: 3 },
  { n: 49, s: "English Language", q: "Fill in the blank with the right option. Rahul is happy as his uncle is .............. tomorrow.", o: ["Arrived", "Arrives", "Arriving", "Arrive"], a: 2 },
  { n: 50, s: "English Language", q: "Fill the blanks with the right pair of words: My .......... to you is that you should .......... yourself to the situation as quickly as possible.", o: ["Advise, adapt", "Advise, adopt", "Advice, adapt", "Advice, adopt"], a: 2 },
  { n: 51, s: "Numerical Ability", q: "If 3 times a number exceeds its 3/5 by 60, then what is the number?", o: ["25", "35", "45", "60"], a: 0 },
  { n: 52, s: "Numerical Ability", q: "Which smallest number must be added to 2203 so that we get a perfect square?", o: ["1", "3", "6", "8"], a: 2 },
  { n: 53, s: "Numerical Ability", q: "The maximum number of students among whom 1001 pens and 910 pencils can be distributed in such a way that each student gets same number of pens and same number of pencils, is:", o: ["91", "910", "1001", "1911"], a: 0 },
  { n: 54, s: "Numerical Ability", q: "If I would have purchased 11 articles for Rs. 10 and sold all the articles at the rate of 10 for Rs. 11, the profit percent would have been:", o: ["10%", "11%", "21%", "100%"], a: 2 },
  { n: 55, s: "Numerical Ability", q: "If the difference between the compound interest and simple interest on a sum at 5% rate of interest per annum for three years is Rs. 36.60, then the sum is-", o: ["Rs. 8000", "Rs. 8400", "Rs. 4400", "Rs. 4800"], a: 3 },
  { n: 56, s: "Numerical Ability", q: "The ratio of two numbers is 10:7 and their difference is 105. The sum of these numbers is", o: ["595", "805", "1190", "1610"], a: 0 },
  { n: 57, s: "Numerical Ability", q: "A can complete a piece of work in 10 days, B in 15 days and C in 20 days. A and C worked together for two days and then A was replaced by B. In how many days, altogether, work was completed?", o: ["12 days", "10 days", "6 days", "8 days"], a: 3 },
  { n: 58, s: "Numerical Ability", q: "A train 180m long moving at the speed of 20 m/sec overtakes a man moving at a speed of 10 m/sec in the same direction. The train passes the man in:", o: ["6 sec", "9 sec", "18 sec", "27 sec"], a: 2 },
  { n: 59, s: "Numerical Ability", q: "There are 30 students in a class. The average age of first 10 students is 12.5 years. The average age of the remaining 20 students is 13.1 years. The average age (in years) of the students of the whole class is:", o: ["12.5 years", "12.7 years", "12.8 years", "12.9 years"], a: 3 },
  { n: 60, s: "Numerical Ability", q: "A solid metallic cone of height 10cm, radius of base 20 cm is melted to make spherical balls each of 4 cm diameter. How many such balls can be made?", o: ["25 balls", "75 balls", "50 balls", "125 balls"], a: 3 },
  { n: 61, s: "Haryana GK", q: "Red Jungle Fowl is found in which place of Haryana?", o: ["Karnal", "Panipat", "Ambala", "Panchkula"], a: 3 },
  { n: 62, s: "Haryana GK", q: "Where is Nar Narayan Cave located?", o: ["Hisar", "Sirsa", "Rohtak", "Yamunanagar"], a: 3 },
  { n: 63, s: "Haryana GK", q: "Who was the first Haryanvi novel writer?", o: ["Rajaram Shastri", "Dhanik Lal Mandal", "R.S. Narula", "None of these"], a: 0 },
  { n: 64, s: "Haryana GK", q: "First cyber police station of Haryana was established in?", o: ["Panchkula", "Ambala", "Gurugram", "Karnal"], a: 2 },
  { n: 65, s: "Haryana GK", q: "Where is the biggest animal husbandry farm of asia situated at Haryana?", o: ["Ambala", "Bhiwani", "Hisar", "Rohtak"], a: 2 },
  { n: 66, s: "Haryana GK", q: "Which is the main magazine of Haryana Sahitya Academy?", o: ["Ram Vani", "Saral Sarita", "Harigandha", "Devprayag"], a: 2 },
  { n: 67, s: "Haryana GK", q: "IMBEX 2018-19 Military exercise was held at which place?", o: ["Rewari", "Bhondsi", "Chandimandir", "Ambala"], a: 2 },
  { n: 68, s: "Haryana GK", q: "Largest Cancer Institute was inaugurated by PM Narendra Modi at?", o: ["Hisar", "Jhajjar", "Bhiwani", "Sonipat"], a: 1 },
  { n: 69, s: "Haryana GK", q: "Voter Park is opened in which city of the Haryana State?", o: ["Gurugram", "Karnal", "Panipat", "None of these"], a: 0 },
  { n: 70, s: "Haryana GK", q: "Dhosi hills of Aravali Range is located in?", o: ["Narnaul", "Mewat", "Palwal", "Nuh"], a: 0 },
  { n: 71, s: "Reasoning", q: "Select the related word from the given alternatives. Lion : Den :: Rabbit : ?", o: ["Hole", "Pit", "Burrow", "Trench"], a: 2 },
  { n: 72, s: "Reasoning", q: "Suresh introduces a man as He is the son of the woman who is the mother of the husband of my mother. How is Suresh related to the man?", o: ["Uncle", "Son", "Cousin", "Grandson"], a: 1 },
  { n: 73, s: "Reasoning", q: "If + stands for subtraction and division-sign stands for addition and - stands for multiplication and x stands for division, then which of the following equations is correct?", o: ["56 + 12 x 34 - 12 = 102", "8 div 44 - 5 + 25 = 203", "112 x 44 - 12 + 10 = 46", "9 div 64 - 2 x 6 = 54"], a: 1 },
  { n: 74, s: "Reasoning", q: "Select the one which is different from other three alternatives.", o: ["55 x 5", "15 x 15", "5 x 45", "25 x 9"], a: 0 },
  { n: 75, s: "Reasoning", q: "Siddarth and Murali go for jogging from the same point. Siddarth goes towards the east covering 4 km. Murali proceeds towards the West for 3 km. Siddarth turns left and covers 4 km and Murali turns to the right to cover 4 km. Now what will be the distance between Siddarth and Murali?", o: ["14 km", "6 km", "8 km", "7 km"], a: 3 },
  { n: 76, s: "Reasoning", q: "Find the missing number. 44, 56, 69, 83, ?, 114", o: ["90", "98", "100", "110"], a: 1 },
  { n: 77, s: "Reasoning", q: "If UNIVERSITY is coded as 1273948756, how can TRUSTY be written in that code?", o: ["542856", "531856", "541856", "541956"], a: 2 },
  { n: 78, s: "Reasoning", q: "Statements: 1. All metals are silver. 2. All silver are diamond. 3. Some diamonds are gold. 4. Some gold are marbles. Conclusions: (I) Some gold are metals (II) All metals are diamond (III) Some silver are marble (IV) Some gold are silver. Which conclusion follows?", o: ["Only conclusion I follows", "Only conclusion II follows", "Only conclusion III follows", "Only conclusion IV follows"], a: 1 },
  { n: 79, s: "Reasoning", q: "In a row of girls, Kamla is 9th from the left and Venna is 16th from the right. If they interchange their positions, Kamla becomes 25th from the left. How many girls are there in the row?", o: ["34", "36", "40", "41"], a: 2 },
  { n: 80, s: "Reasoning", q: "Find the missing number. A circle is divided into four parts: top-right = 9, bottom-left = 18, bottom-right = 12, top-left = ?", o: ["11", "25", "10", "27"], a: 3 },
  { n: 81, s: "Reasoning", q: "Select the related word from the given alternatives. Study : Knowledge :: Work : ?", o: ["Experiment", "Service", "Experience", "Appointment"], a: 2 },
  { n: 82, s: "Reasoning", q: "A man makes his daughter marry with his aunty's son. How did son-in-law call that man before?", o: ["Uncle", "Brother", "Cousin", "Aunty"], a: 0 },
  { n: 83, s: "Reasoning", q: "If - stands for addition, + for multiplication, division-sign for subtraction and x for division, which one of the following equation is wrong?", o: ["5 - 2 + 12 x 6 div 2 = 27", "5 + 2 - 12 div 6 x 2 = 13", "5 + 2 - 12 x 6 div 2 = 10", "5 div 2 + 12 x 6 - 2 = 3"], a: 0 },
  { n: 84, s: "Reasoning", q: "Select the one which is different from other three alternatives.", o: ["24 - 47", "38 - 61", "74 - 98", "54 - 77"], a: 2 },
  { n: 85, s: "Reasoning", q: "From my house I walked 5 km towards North. I turned right and walked 3 km. Again I went one km to the south. How far am I from my house?", o: ["7 km", "6 km", "4 km", "5 km"], a: 3 },
  { n: 86, s: "Reasoning", q: "Find the missing number. 5255, 5306, ?, 5408, 5459", o: ["5057", "5357", "2257", "5157"], a: 1 },
  { n: 87, s: "Reasoning", q: "In a code language white means black, black is yellow, yellow is blue, blue is red, and red is green. Then what is the colour of blood?", o: ["Yellow", "Blue", "Red", "Green"], a: 3 },
  { n: 88, s: "Reasoning", q: "Statements: (1) All men are employed (2) No employees are professionals. Conclusions: I. No men are unemployed II. No men are professionals. Which conclusion follows?", o: ["Only I follows", "Only II follows", "Neither I nor II follows", "Both I and II follows"], a: 3 },
  { n: 89, s: "Reasoning", q: "A, P, R, X, S and Z are sitting in a row. S and Z are in the centre and A and P are at the ends. R is sitting on the left of A. Then who is on the right of P?", o: ["A", "X", "S", "Z"], a: 1 },
  { n: 90, s: "Reasoning", q: "Find the missing number. A circle shows: ?, 8, 216, 64", o: ["343", "512", "729", "1000"], a: 1 },
  { n: 91, s: "Haryana GK", q: "Who inaugurated the Integrated Command and Control Center in Gurugram?", o: ["Mahesh Balhara", "Bhupinder Singh Hooda", "Chief Minister Manohar Lal", "Anil Vij"], a: 2 },
  { n: 92, s: "Haryana GK", q: "Which Haryanvi has been ranked by the world's famous magazine Forbes in the list of 20 celebrities to dominate the world in 2020?", o: ["Anil Vij", "Manohar Lal Khattar", "Dushyant Chautala", "Krishna Minda"], a: 2 },
  { n: 93, s: "Haryana GK", q: "In which city was the 8th International Conference on Fusion of Science and Technology organized?", o: ["Faridabad", "Rohtak", "Panipat", "Karnal"], a: 0 },
  { n: 94, s: "Haryana GK", q: "Haryana Government has decided to increase the old age pension amount by how much Rupees every year?", o: ["Rs 150", "Rs 250", "Rs 350", "Rs 100"], a: 1 },
  { n: 95, s: "Haryana GK", q: "Who has honored Kautilya Pandit of Haryana with the Global Child Prodigy Award 2020?", o: ["Manohar Lal Khattar", "Anil Vij", "Kiran Bedi", "Venkaiah Naidu"], a: 2 },
  { n: 96, s: "Haryana GK", q: "Poonam Chauhan who has become a Flying Officer in the Air Force is from which district of Haryana?", o: ["Mahinder Garh", "Palwal", "Ambala", "Panipath"], a: 0 },
  { n: 97, s: "Haryana GK", q: "In which village of Bhiwani district have the remains of 5000 years old Harappan civilization been found?", o: ["Tigdana village", "Miran village", "Sippar village", "Gujrani village"], a: 0 },
  { n: 98, s: "Haryana GK", q: "How much budget was presented in the Haryana Vidhan Sabha for the financial year 2020-21?", o: ["Rs 136743.26 crore", "Rs 142343.78 crore", "Rs 157843.90 crore", "Rs 132343.09 crore"], a: 1 },
  { n: 99, s: "Haryana GK", q: "In which city of Haryana was the 38th All India Police Equestrian Competition organized?", o: ["Bhondsi", "Pinjore", "Pehowa", "Surajkund"], a: 0 },
  { n: 100, s: "Haryana GK", q: "In which of the following district of Haryana, Vidhan Sabha Speaker Giyan Chand has launched the Atal Kisan Mazdoor Canteen in the year 2020?", o: ["Kaithal", "Panchkula", "Sirsa", "Palwal"], a: 1 }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'HR-POL-CONST' });
  if (!exam) throw new Error('Exam HR-POL-CONST not found — aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Haryana Police Written Exam' });
  if (!pattern) throw new Error('ExamPattern "Haryana Police Written Exam" not found — aborting.');

  const TEST_TITLE = "Haryana Police Constable - 07 Aug 2021 Shift-2";
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
