/**
 * Seed: SSC CHSL Tier-I PYQ - 4 March 2017, Shift-1 (100 questions)
 * Source: Oswaal SSC CHSL Tier-I Year-wise Solved Papers
 * Run with: node scripts/seed-pyq-ssc-chsl-4mar2017-s1.js
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

// Schemas defined inline to avoid Next.js path alias resolution
const examCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Central', 'State'], required: true },
  description: { type: String, trim: true }
}, { timestamps: true });

const examSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamCategory', required: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  logo: { type: String }
}, { timestamps: true });

const examPatternSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  title: { type: String, required: true, trim: true },
  duration: { type: Number, required: true, min: 1 },
  totalMarks: { type: Number, required: true, min: 0 },
  negativeMarking: { type: Number, default: 0, min: 0 },
  sections: [{
    name: { type: String, required: true, trim: true },
    totalQuestions: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, required: true, min: 0 },
    negativePerQuestion: { type: Number, default: 0, min: 0 },
    sectionDuration: { type: Number, min: 0 }
  }]
}, { timestamps: true });

const practiceTestSchema = new mongoose.Schema({
  examPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern', required: true },
  title: { type: String, required: true, trim: true },
  totalMarks: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 1 },
  isFree: { type: Boolean, default: false },
  isPYQ: { type: Boolean, default: false },
  pyqYear: { type: Number, default: null },
  pyqShift: { type: String, default: null, trim: true },
  pyqExamName: { type: String, default: null, trim: true },
  publishedAt: { type: Date, default: Date.now },
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, trim: true },
    section: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
  }]
}, { timestamps: true });

const ExamCategory = mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);
const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

// 1-based answer key from PDF; converted to 0-based correctAnswerIndex below
const ANSWER_KEY = [3,3,1,1,2,2,4,1,1,3, 1,2,1,4,1,4,1,1,3,2, 2,2,2,3,4,3,1,2,4,4,
                    4,1,2,2,1,2,4,4,4,2, 2,2,4,1,2,3,2,1,3,1, 4,2,3,1,4,2,3,4,1,3,
                    1,3,3,2,3,3,2,1,4,2, 2,3,3,1,3,4,3,4,3,3, 3,2,2,2,4,3,1,1,3,1,
                    1,1,4,1,1,2,4,4,3,2];

const ENG = 'English Language';
const GI  = 'General Intelligence';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ English Language (1-25) ============
  { s: ENG, q: "In the following question, some part of the sentence may have errors. Find out which part of the sentence has an error and select the appropriate option. If a sentence is free from error, select 'No Error'.\n\nDue to the (1)/ snow the (2)/ marks was unrecognisable. (3)/ No error (4)", o: ["1","2","3","4"] },
  { s: ENG, q: "In the following question, some part of the sentence may have errors. Find out which part of the sentence has an error and select the appropriate option. If a sentence is free from error, select 'No Error'.\n\nAcceptance is not about allowing everything to occur or to go on, (1)/ it is neither related to passivity and weakness, (2)/ nor is it about confirmation or mediocrity. (3)/ No error (4)", o: ["1","2","3","4"] },
  { s: ENG, q: "Select the correct alternative to fill in the blank:\n\nShe jumped ______ the bar table.", o: ["upon","in","up","into"] },
  { s: ENG, q: "Select the correct alternative to fill in the blank:\n\nSun is a ______ perfect sphere of hot plasma, with internal convective motion that generates a magnetic field.", o: ["nearly","about","near","more"] },
  { s: ENG, q: "Select the option which best expresses the meaning of the given word:\n\nHybrid", o: ["Homogeneous","Composite","Pure","Love"] },
  { s: ENG, q: "Select the option which best expresses the meaning of the given word:\n\nDiscreet", o: ["Described","Careful","Rash","Mundane"] },
  { s: ENG, q: "Select the option which is opposite in meaning of the given word:\n\nHeed", o: ["Care","Attention","Caution","Neglect"] },
  { s: ENG, q: "Select the option which is opposite in meaning of the given word:\n\nArticulate", o: ["Unclear","Enunciate","Eloquent","Coherent"] },
  { s: ENG, q: "Rearrange the parts of the sentence in correct order.\n\nAll the sound reasons\nP : ever given for conserving\nQ : to the conservation of wildlife\nR : other natural resources apply", o: ["PRQ","PQR","RQP","QRP"] },
  { s: ENG, q: "A sentence has been given in Active/Passive Voice. Select the one which best expresses the same sentence in Passive/Active Voice.\n\nShe will finish the thesis in a fortnight.", o: ["The thesis would be finished in a fortnight by her.","The thesis will finished by her in a fortnight.","The thesis will be finished by her in a fortnight.","A fortnight is required to finish the thesis."] },
  { s: ENG, q: "A sentence has been given in Direct/Indirect Speech. Select the one which best expresses the same sentence in Indirect/Direct Speech.\n\n\"I know her well\" said Manisha.", o: ["Manisha said that she knew her well.","Manisha said if she knows her well.","Manisha said that she knows her.","Manisha says that she knew her well."] },
  { s: ENG, q: "A word has been written in four different ways out of which only one is correctly spelt. Select the correctly spelt word.", o: ["Commiety","Committee","Comittee","Commitee"] },
  { s: ENG, q: "Comprehension (Q13-17): Now, what exactly does big business want? Though they cite some __________ worded performance indicators to compile the index, the true intention appears to be something else. They want land at throwaway prices even if it is fertile agriculture land...\n\nQ13. they cite some __________ worded performance", o: ["cleverly","cleverer","cleverest","cleverness"] },
  { s: ENG, q: "Q14. something __________. They want land at", o: ["other","extra","added","else"] },
  { s: ENG, q: "Q15. prices even __________ it is fertile agriculture land;", o: ["if","then","but","also"] },
  { s: ENG, q: "Q16. environmental __________; they want labour laws.", o: ["degrade","degrading","degraded","degradation"] },
  { s: ENG, q: "Q17. easy to hire __________ fire and exploit", o: ["and","if","thus","so"] },
  { s: ENG, q: "Select the alternative which best expresses the meaning of the idiom/phrase.\n\nAfter one's own heart", o: ["Sharing or having one's tastes or views.","Infatuation with a person which is not reciprocated.","Memorise some thing by heart.","Don't have the courage to do something bad for a good person."] },
  { s: ENG, q: "Select the alternative which best expresses the meaning of the idiom/phrase.\n\nPull the wool over someone's eyes", o: ["To protect someone.","To keep oneself warm.","Deceive someone by telling lies.","To pretend to be blind to the other person's bad behaviour."] },
  { s: ENG, q: "Select the alternative which is the best substitute of the words/sentence.\n\nA warning of impending danger", o: ["Naive","Monition","Obtuse","Draft"] },
  { s: ENG, q: "Select the alternative which is the best substitute of the words/sentence.\n\nConcerned with beauty or the appreciation of beauty", o: ["Foul","Aesthetic","Hideous","Gross"] },
  { s: ENG, q: "Select the alternative which will improve the bracketed part of the sentence. In case no improvement is needed, select 'no improvement'.\n\nWe sat on the floor to eat dinner and he (appreciate) the fresh food my mother served.", o: ["had appreciated","appreciated","will appreciate","no improvement"] },
  { s: ENG, q: "Select the alternative which will improve the bracketed part of the sentence. In case no improvement is needed, select 'no improvement'.\n\nWe sat there (enjoy) the view.", o: ["enjoyed","enjoying","enjoys","no improvement"] },
  { s: ENG, q: "Select the most logical order of the sentences to form a coherent paragraph.\n\nLife is never meant to\nA - country like India\nB - be easy, especially means if you\nC - live in a developing", o: ["BAC","ACB","BCA","ABC"] },
  { s: ENG, q: "Four words are given out of which one word is correctly spelt. Select the correctly spelt word.", o: ["stridancy","stridensy","stridansy","stridency"] },

  // ============ General Intelligence (26-50) ============
  { s: GI, q: "Select the related word pair from the given alternatives.\n\nTrain : Track : : ? : ?", o: ["Car : Four wheeler","Aeroplane : Fly","Truck : Road","Car : Speed"] },
  { s: GI, q: "Select the related number pair from the given alternatives.\n\n53 : 35 : : ? : ?", o: ["37 : 73","16 : 62","42 : 22","54 : 43"] },
  { s: GI, q: "Select the related letter/letters from the given alternatives.\n\nPAL : RDP : : MRF : ?", o: ["FAJ","OUJ","KUC","RPT"] },
  { s: GI, q: "Select the odd word pair from the given alternatives.", o: ["Reptile - Lizard","Mammal - Deer","Mammal - Elephant","Rodent - Rabbit"] },
  { s: GI, q: "Four number pairs are given. The number on left side of (-) is related to the number of the right side of (-) with some Logic/Rule/Relation. Three are similar on basis of same Logic/Rule/Relation. Select the odd one out from the given alternatives.", o: ["20 - 30","45 - 55","35 - 45","25 - 30"] },
  { s: GI, q: "Select the odd letter/letters from the given alternatives.", o: ["RQP","ZYX","XWV","AZX"] },
  { s: GI, q: "From the given alternatives, according to dictionary, which word will come at THIRD position?", o: ["Chimney","Cherry","Childish","Chess"] },
  { s: GI, q: "Select the missing number from the given series.\n\n19, 9, 28, 37, 65, ?", o: ["99","102","97","113"] },
  { s: GI, q: "A series is given with one term missing. Select the correct alternative from the given ones that will complete the series.\n\nI, L, O, R, ?", o: ["S","U","T","V"] },
  { s: GI, q: "Present ages of Ankur and his sister are in the ratio of 4 : 3. After 6 years ratio of ages of Ankur's sister and his brother will be 3 : 2. If the present age of his brother is 32 years, then after 3 years what will be the age (in years) of Ankur?", o: ["71","70","68","65"] },
  { s: GI, q: "From the given alternatives, select the word which CANNOT be formed using the letters of the given word.\n\nSTATEMENT", o: ["Men","Start","Same","State"] },
  { s: GI, q: "In a certain code language, \"FRAME\" is written as \"IUDPH\". How is \"ROYAL\" written in that code language?", o: ["XVTGM","XIDPH","MRDXO","URBDO"] },
  { s: GI, q: "In a certain code language, '-' represents 'x', '×' represents '+', '+' represents '-' and 'x' represents '÷'. Find out the answer to the following question.\n\n15 - 6 + 10 × 3 x 2 = ?", o: ["24","2","9","8"] },
  { s: GI, q: "The following equation is incorrect. Which two signs should be interchanged to correct the equation?\n\n12 + 10 - 28 ÷ 7 × 4 = 48", o: ["- and ÷","- and +","+ and -","× and ÷"] },
  { s: GI, q: "If -4$1 = 4, 7$-7 = 49 and 3$1 = -3, then find the value of -8$-5 = ?", o: ["-1","-40","92","-69"] },
  { s: GI, q: "Which of the following terms follows the trend of the given list?\n\nABABAbab, ABABabaB, ABAbabAB, ABabaBAB, AbabABAB, _______________.", o: ["aBABABab","abaBABAB","ABABAbab","ABABabaB"] },
  { s: GI, q: "A hiker walks 2 km South, then he turns West and walks for 4 km, then he turns North and walks for 5 km, then he turns to his right and walks for 4 km. Where is he now with respect to his starting position?", o: ["7 km North","3 km North","3 km South","7 km South"] },
  { s: GI, q: "Two statements are given, followed by two conclusions, I and II. Decide which of the given conclusions follows from the given statements.\n\nStatement I: No spaghetti are noodles\nStatement II: Some food are spaghetti\nConclusion I: All noodles are food\nConclusion II: All food are noodles", o: ["Only conclusion I follows","Only conclusion II follows","Both conclusions I and II follow","Neither conclusion I nor conclusion II follows"] },
  { s: GI, q: "In the following figure, rectangle represents Plumbers, circle represents Athletes, triangle represents Gamers and square represents Cricketers. Which set of letters represents those who are Athletes as well as Cricketers?", o: ["CD","FG","AB","EH"] },
  { s: GI, q: "A series is given with one term missing. Select the correct alternative from the given ones that will complete the series.\n\nCOT, DQU, ESV, FUW, ?", o: ["GWY","GWX","GVX","GVY"] },
  { s: GI, q: "Select the missing number from the given series.\n\n49, 46, 43, 40, ?, 34", o: ["38","36","37","39"] },
  { s: GI, q: "Four groups of three numbers are given. In each group the second and third number are related to the first number by a Logic/Rule/Relation. Three are similar on basis of same Logic/Rule/Relation. Select the odd one out.", o: ["(1, 11, 1111)","(2, 22, 4444)","(4, 44, 4444)","(8, 88, 8888)"] },
  { s: GI, q: "If a mirror is placed on the line MN, then which of the answer figures is the right image of the given figure? [Refer to original PDF for figures]", o: ["Figure 1","Figure 2","Figure 3","Figure 4"] },
  { s: GI, q: "Which of the following cube in the answer figure cannot be made based on the unfolded cube in the question figure? [Refer to original PDF for figures]", o: ["Figure 1","Figure 2","Figure 3","Figure 4"] },
  { s: GI, q: "A word is represented by only one set of numbers. The columns and rows of Matrix-I are numbered 0-4 and Matrix-II are numbered 5-9. Identify the set for the word 'TOMB'. [Refer to original PDF for matrices]", o: ["77,69,43,22","11,88,34,55","42,66,12,58","30,65,24,65"] },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "Find the value of {(343/49)^(3/2) - (49/343)^(-3/2)}", o: ["117549/343","117550/343","117659/343","117650/343"] },
  { s: QA, q: "Calculate the total numbers of prime factors in the expression (4)^11 × (5)^5 × (3)^2 × (13)^2.", o: ["30","33","31","32"] },
  { s: QA, q: "Which of the following is the CORRECT rationalize form of 15 / (√5 + √2)?", o: ["5√5 - √6","√5 - √30","15√5 - 30","45√5 - 30"] },
  { s: QA, q: "Determine the value of 'x' if x = [(943 - 864)^2 - (943 - 864)^2] / (1886 × 1728)", o: ["1","79","4","1789"] },
  { s: QA, q: "Which of the following options is/are CORRECT about the similarity of two triangles?", o: ["The corresponding sides are proportional to each other.","The corresponding angles are equal.","The corresponding sides may or may not be equal to each other.","All options are correct."] },
  { s: QA, q: "If the height of the equilateral triangle is 2√3 cm, then determine the area (in cm²) of the equilateral triangle.", o: ["6","4√3","2√3","12"] },
  { s: QA, q: "Length and breadth of a rectangle are increased by 10% and 20% respectively. What will be the percentage increase in the area of rectangle?", o: ["30%","28%","32%","33%"] },
  { s: QA, q: "The ratio of three numbers is 3 : 6 : 8. If their product is 9216, then what is the sum of the three numbers?", o: ["96","144","72","68"] },
  { s: QA, q: "Rohit started a business with Rs 75000 and after some months Simran joined him with Rs 60000. If the profit at the end of the year is divided in the ratio 3 : 1, then after how many months did Simran join Rohit?", o: ["7","8","6","4"] },
  { s: QA, q: "A boy bought 50 chocolates for Rs 1000. If the average price of 30 chocolates is Rs 25, then what is the average price (in Rs) of the remaining chocolates?", o: ["10","15","12.5","17.5"] },
  { s: QA, q: "The simple interest on a sum for 8 years is Rs 47500. The rate of interest for the first 5 years is 10% per annum and for the next 3 years is 15% per annum. What is the value (in Rs) of sum?", o: ["50000","45000","60000","62500"] },
  { s: QA, q: "Selling price of a chair is Rs 1386. If loss percentage is 23%, then what is the cost price (in Rs) of chair?", o: ["1600","1900","1800","1067"] },
  { s: QA, q: "Marked price of a computer is Rs 48000 and discount is 13%. What is additional discount (in percentage) should be offered to the customer to bring the price of computer to Rs 39672?", o: ["10","8","5","9"] },
  { s: QA, q: "Which of the following statement(s) is/are TRUE?\n\nI. √144 + √36 < ³√125 + √121\nII. √324 + √49 > ³√216 × √9", o: ["Only I","Only II","Neither I nor II","Both I and II"] },
  { s: QA, q: "Pipe X can fill a tank in 20 hours and Pipe Y can fill the tank in 35 hours. Both the pipes are opened on alternate hours. Pipe Y is opened first, then in how much time (in hours) the tank will be full?", o: ["269/11","280/11","179/7","172/7"] },
  { s: QA, q: "A train is moving at the speed of 54 km/hr. How many seconds it will take to cover a distance of 450 metres?", o: ["60","45","30","36"] },
  { s: QA, q: "Bar graph shows average marks scored in a 100 marks Science exam by students of 7 divisions of Standard X. (Q67-70 refer to this graph.)\n\nQ67. Which division scored the second lowest marks?", o: ["F","G","B","D"] },
  { s: QA, q: "Q68. What is the ratio of average marks scored by Division D to Division A?", o: ["4 : 5","4 : 7","5 : 4","7 : 4"] },
  { s: QA, q: "Q69. Marks of division F were lesser than that of Division C by _________", o: ["35%","45%","47.25%","43.75%"] },
  { s: QA, q: "Q70. If all students of Division A lost 5 marks each for indiscipline then their new average marks would decrease by how much?", o: ["5%","6.67%","11.11%","10%"] },
  { s: QA, q: "If the length of one side and the diagonal of a rectangle are 7 cm and 25 cm respectively, then find its perimeter (in cm).", o: ["124","62","36","72"] },
  { s: QA, q: "If a regular polygon has 5 sides then the measure of its interior angle is greater than the measure of its exterior angle by how many degrees?", o: ["60°","90°","36°","100°"] },
  { s: QA, q: "Find the volume (in cm³) of a cube of side 3.5 cm.", o: ["69.845","19.765","42.875","11.165"] },
  { s: QA, q: "△XYZ is right angled at Y. If m∠X = 60°, then find the value of (sec Z + 2/√3).", o: ["4/√3","(√2 + 2)/2√2","7/2√3","4/2√3"] },
  { s: QA, q: "In △UVW measure of angle V is 90°. If tan U = 12/5, and UV = 10 cm, then what is the length (in cm) of side VW?", o: ["26","25","24","5"] },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "The competitive position of a company can be improved by __________.", o: ["increasing the selling price","reducing the margin of profit","ignoring competitors","understanding and fulfilling customers needs"] },
  { s: GA, q: "Deficit financing means the government borrows money from the __________.", o: ["International Monetary Fund","Ministry of Finance","Reserve Bank of India","World Trade Organization"] },
  { s: GA, q: "Which of the following information is found in Ashoka's inscriptions?", o: ["Life story","Internal policy","Foreign policy","All options are correct."] },
  { s: GA, q: "Bahadur Shah, the ruler of Gujarat was killed in a conflict with which of the following?", o: ["Dutch","English","Portuguese","French"] },
  { s: GA, q: "Which part of the Earth has the abundance of nickel and iron?", o: ["SIAL","SIMA","NIFE","No option is correct."] },
  { s: GA, q: "Konkan coast is stretched from where to where?", o: ["Goa to Kochi","Goa to Diu","Daman to Goa","Goa to Mumbai"] },
  { s: GA, q: "Which of the following pair is NOT matched correctly?", o: ["Bharatanatyam - Tamilnadu","Kathakali - Karnataka","Odissi - Odisha","Kuchipudi - Andhra Pradesh"] },
  { s: GA, q: "How much water has been allowed to India for irrigation, power generation and transport purposes from Indus river?", o: ["10%","20%","15%","25%"] },
  { s: GA, q: "Who among the following was NOT one of the recipients of Dronacharya Award for the year 2017?", o: ["R. Gandhi","Prashant Singh","Heera Nand Kataria","Sanjay Chakarvorthy"] },
  { s: GA, q: "China has the longest border with which of the following country?", o: ["Russia","India","Myanmar","Mongolia"] },
  { s: GA, q: "Which of the following statement(s) is/are CORRECT?\n\nI. Bakelite is a good conductor of heat.\nII. Bakelite is a poor conductor of electricity.\nIII. Bakelite can be softened by heating.", o: ["Only I and II","Only I and III","Only II","All I, II and III"] },
  { s: GA, q: "Which of the following has minimum ignition temperature?", o: ["Petrol","Plastic","Wood","Paper"] },
  { s: GA, q: "Which Article of Indian Constitution empowers Indian Parliament to amend the constitution?", o: ["Article 368","Article 252","Article 254","Article 256"] },
  { s: GA, q: "Which part of Indian constitution deals with Union Territories?", o: ["Part VI","Part VII","Part VIII","Part IX"] },
  { s: GA, q: "The rhythmic contraction of the lining of muscles of canal to push the food along the gut is called __________.", o: ["peristalsis","facilitation","guttation","No option is correct."] },
  { s: GA, q: "Which of the following represents the pair of sex chromosomes in men?", o: ["XY","XX","YY","No option is correct."] },
  { s: GA, q: "How much amount has been reserved for the 'National Biopharma Mission' named 'i3' by the Government of India?", o: ["USD 250 million","USD 350 million","USD 500 million","USD 150 million"] },
  { s: GA, q: "Scientists of which country have developed working human skeletal muscle from stem cells in the laboratory for the first time?", o: ["China","Japan","India","United States of America"] },
  { s: GA, q: "In July 2017, how much revised cost was approved for the Socio Economic and Caste Census 2011 (SECC 2011)?", o: ["Rs 4893 crore","Rs 7983 crore","Rs 9893 crore","Rs 10,000 crore"] },
  { s: GA, q: "From May 2017, the Real Estate Act has come into effect. Under the Act, the Regulatory Authorities are required to dispose of complaints in how many days?", o: ["60","30","45","90"] },
  { s: GA, q: "A body of mass 4 kg accelerates from 15 m/s to 25 m/s in 5 seconds due to the application of a force on it. Calculate the magnitude of this force (in N).", o: ["32","8","16","64"] },
  { s: GA, q: "During __________ motion of an object along a straight line, the change in velocity of the object for any time interval is zero.", o: ["linear","translational","equilibrium","uniform"] },
  { s: GA, q: "The tropical rainforests __________.", o: ["are dry and hot","are in the coastal regions only","are mostly covered in snow","get plenty of rainfall"] },
  { s: GA, q: "Which of the statements given below are correct?\n\nA. Valentino Rossi won the Motorcycle race 2017 Dutch TT MotoGP.\nB. United Kingdom hosted the Table Tennis 2017 ITTF Women's World Cup.\nC. In 2017, Glenn Maxwell captained the IPL team Kings XI Punjab.", o: ["A and B","B and C","A and C","A, B and C"] },
  { s: GA, q: "In Microsoft Word, under character formatting ________ is used to underline some particular text.", o: ["Font style","Underline","Effects","Size"] },
];

if (RAW.length !== 100) { console.error(`Expected 100 questions, got ${RAW.length}`); process.exit(1); }
if (ANSWER_KEY.length !== 100) { console.error('Answer key length mismatch'); process.exit(1); }

const questions = RAW.map((r, i) => ({
  questionText: r.q,
  options: r.o,
  correctAnswerIndex: ANSWER_KEY[i] - 1,
  section: r.s,
  tags: ['SSC', 'CHSL', 'PYQ', '2017'],
  difficulty: 'medium'
}));

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  // 1) ExamCategory: Central
  let category = await ExamCategory.findOne({ name: 'Central', type: 'Central' });
  if (!category) {
    category = await ExamCategory.create({ name: 'Central', type: 'Central', description: 'Central government competitive exams' });
    console.log(`Created ExamCategory: Central (${category._id})`);
  } else {
    console.log(`Found ExamCategory: Central (${category._id})`);
  }

  // 2) Exam: SSC CHSL
  let exam = await Exam.findOne({ code: 'SSC-CHSL' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC CHSL',
      code: 'SSC-CHSL',
      description: 'Staff Selection Commission - Combined Higher Secondary Level',
      isActive: true
    });
    console.log(`Created Exam: SSC CHSL (${exam._id})`);
  } else {
    console.log(`Found Exam: SSC CHSL (${exam._id})`);
  }

  // 3) ExamPattern: SSC CHSL Tier-I
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: 'SSC CHSL Tier-I' });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: 'SSC CHSL Tier-I',
      duration: 60,
      totalMarks: 200,
      negativeMarking: 0.5,
      sections: [
        { name: ENG, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GI,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: QA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
    console.log(`Created ExamPattern: SSC CHSL Tier-I (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: SSC CHSL Tier-I (${pattern._id})`);
  }

  // 4) PracticeTest (PYQ) - skip if already exists
  const existing = await PracticeTest.findOne({
    examPattern: pattern._id, isPYQ: true, pyqYear: 2017, pyqShift: 'Shift-1',
    title: { $regex: /4 March 2017/i }
  });
  if (existing) {
    console.log(`\nPYQ already exists: ${existing._id} - skipping insert.`);
  } else {
    const test = await PracticeTest.create({
      examPattern: pattern._id,
      title: 'SSC CHSL Tier-I - 4 March 2017 Shift-1',
      totalMarks: 200,
      duration: 60,
      isFree: true,
      isPYQ: true,
      pyqYear: 2017,
      pyqShift: 'Shift-1',
      pyqExamName: 'SSC CHSL Tier-I',
      questions
    });
    console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
