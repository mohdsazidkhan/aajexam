/**
 * Seed: SSC CHSL Tier-I PYQ - 5 March 2017, Shift-1 (100 questions)
 * Source: Oswaal SSC CHSL Tier-I Year-wise Solved Papers (docx)
 * Run with: node scripts/seed-pyq-ssc-chsl-5mar2017-s1.js
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

// 1-based answer key from the paper's Answer Key table; converted to 0-based below
const ANSWER_KEY = [2,2,2,3,1,3,3,2,2,4, 3,3,3,3,3,1,4,2,2,2, 2,2,4,1,3,3,4,1,3,4,
                    3,1,3,2,3,3,2,1,2,2, 4,1,1,1,1,1,2,1,3,4, 3,1,2,1,2,2,2,3,2,4,
                    1,3,3,4,1,3,2,2,2,3, 2,2,4,2,2,1,4,3,2,1, 4,2,2,3,3,1,2,4,4,1,
                    1,3,1,2,1,2,1,2,3,1];

const ENG = 'English Language';
const GI  = 'General Intelligence';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ English Language (1-25) ============
  { s: ENG, q: "In the following question, some part of the sentence may have errors. Find out which part of the sentence has an error and select the appropriate option. If a sentence is free from error, select 'No Error'.\n\nShe picked (1)/ on the (2)/ trail soon after. (3)/ No error (4)", o: ["1","3","2","4"] },
  { s: ENG, q: "In the following question, some part of the sentence may have errors. Find out which part of the sentence has an error and select the appropriate option. If a sentence is free from error, select 'No Error'.\n\nInternet Service Providers (ISPs) should provide us (1)/ with open networks and should not block or discriminate for (2)/ any application or content that rides over those networks. (3)/ No error (4)", o: ["1","3","2","4"] },
  { s: ENG, q: "In the following question, the sentence given with blank to be filled in with an appropriate word. Select the correct alternative out of the four and indicate it by selecting the appropriate option.\n\nMeera cannot ______ the exam's results.", o: ["depict","await","envision","observe"] },
  { s: ENG, q: "In the following question, the sentence given with blank to be filled in with an appropriate word. Select the correct alternative out of the four and indicate it by selecting the appropriate option.\n\nBeing linked with nature brings joy and peace as it is the ______ of the laws of Nature.", o: ["dissent","refusal","acknowledgement","sustenance"] },
  { s: ENG, q: "In the following question, out of the given four alternatives, select the one which best expresses the meaning of the given word.\n\nFelicity", o: ["Bliss","Misery","Grief","Trouble"] },
  { s: ENG, q: "In the following question, out of the given four alternatives, select the one which best expresses the meaning of the given word.\n\nChafe", o: ["Chain","Safe","Irritate","Joy"] },
  { s: ENG, q: "In the following question, out of the given four alternatives, select the one which is opposite in meaning of the given word.\n\nForgo", o: ["Forfeit","Neglect","Conquer","Pass"] },
  { s: ENG, q: "In the following question, out of the given four alternatives, select the one which is opposite in meaning of the given word.\n\nBanter", o: ["Teasing","Praise","Fun","Gossip"] },
  { s: ENG, q: "Rearrange the parts of the sentence in correct order.\n\nGender inequality has\nP : it reduces economic growth\nQ : development goals as\nR : adverse impact on", o: ["RPQ","RQP","PRQ","QPR"] },
  { s: ENG, q: "A sentence has been given in Active/Passive Voice. Out of the four given alternatives, select the one which best expresses the same sentence in Passive/Active Voice.\n\nWho did this?", o: ["This was done by who?","By who this was done?","By whom this was done?","By whom was this done?"] },
  { s: ENG, q: "A sentence has been given in Direct/Indirect Speech. Out of the four given alternatives, select the one which best expresses the same sentence in Indirect/Direct Speech.\n\nRam said, \"I have cleared the clutter.\"", o: ["Ram told that he cleared the clutter.","Ram says that he cleared the clutter.","Ram said that he had cleared the clutter.","The clutter was cleared by Ram."] },
  { s: ENG, q: "In the following question, a word has been written in four different ways out of which only one is correctly spelt. Select the correctly spelt word.", o: ["Beizarre","Bizaarre","Bizarre","Bigarre"] },
  { s: ENG, q: "Comprehension (Q13-17): In the following passage, some of the words have been left out. Read the passage carefully and select the correct answer for the given blank out of the four alternatives.\n\nOne should always keep in mind that psychology is essentially a laboratory science, and __________ a text-book subject.", o: ["nor","neither","not","none"] },
  { s: ENG, q: "Q14. The laboratory material is to be __________ in ourselves.", o: ["find","finding","found","finds"] },
  { s: ENG, q: "Q15. Its statements should always be verified __________ reference to one's own experience.", o: ["to","at","by","for"] },
  { s: ENG, q: "Q16. Prospective teachers should constantly correlate the lessons of the book __________ the observation of children at work in the school.", o: ["with","until","from","upon"] },
  { s: ENG, q: "Q17. The problems suggested for __________ and introspection will, if mastered, do much to render practical help to find the truths of psychology.", o: ["observe","observes","observed","observation"] },
  { s: ENG, q: "In the following question, out of the four alternatives, select the alternative which best expresses the meaning of the idiom/phrase.\n\nAt large", o: ["A very big opportunity.","A criminal escaped or not yet captured.","To have a big heart.","A big appetite."] },
  { s: ENG, q: "In the following question, out of the four alternatives, select the alternative which best expresses the meaning of the idiom/phrase.\n\nHead over heels", o: ["To do things exactly opposite of what is expected.","Madly in love.","To do stupid things.","To unknowingly dive into an unpleasant situation."] },
  { s: ENG, q: "In the following question, out of the four alternatives, select the alternative which is the best substitute of the words/sentence.\n\nBeyond or above the range of normal or physical human experience", o: ["Mundane","Transcendent","Ribald","Coarse"] },
  { s: ENG, q: "In the following question, out of the four alternatives, select the alternative which is the best substitute of the words/sentence.\n\nCapable of being imagined or grasped mentally", o: ["Dazzling","Conceivable","Stunning","Spectacular"] },
  { s: ENG, q: "In the following question, out of the four alternatives, select the alternative which will improve the bracketed part of the sentence. In case no improvement is needed, select 'no improvement'.\n\nAs he tried harder, his steps slowed, his senses (was activated).", o: ["is activated","were activated","had been activated","no improvement"] },
  { s: ENG, q: "In the following question, out of the four alternatives, select the alternative which will improve the bracketed part of the sentence. In case no improvement is needed, select 'no improvement'.\n\nMy daughter (comes running) as fast as her little feet can take her while her eyes sparkle vivaciously.", o: ["comes run","come running","came run","no improvement"] },
  { s: ENG, q: "The question below consists of a set of labelled sentences. Out of the four options given, select the most logical order of the sentences to form a coherent paragraph.\n\nLeadership and\nA - team-building skills deepened\nB - for relationships\nC - a sense of value", o: ["ACB","ABC","CBA","CAB"] },
  { s: ENG, q: "In the following question, four words are given out of which one word is correctly spelt. Select the correctly spelt word.", o: ["percoletion","parcolation","percolation","parcoletion"] },

  // ============ General Intelligence (26-50) ============
  { s: GI, q: "In the following question, select the related word pair from the given alternatives.\n\nPascal : Pressure : : ? : ?", o: ["Hectare : Volume","Speed : Temperature","Joule : Work","Time : Seconds"] },
  { s: GI, q: "In the following question, select the related number from the given alternatives.\n\n563 : 635 : : 894 : ?", o: ["849","489","498","948"] },
  { s: GI, q: "In the following question, select the related letter pair from the given alternatives.\n\nMOK : KLG : : ? : ?", o: ["FIM : DFI","TMA : UNB","KCN : JBM","FSA : IVD"] },
  { s: GI, q: "In the following question, select the odd word pair from the given alternatives.", o: ["Square – Four","Pentagon – Five","Rectangle – Three","Triangle – Three"] },
  { s: GI, q: "In the following question, four number pairs are given. The number on left side of (–) is related to the number on right side of (–) with some Logic/Rule/Relation. Three are similar on basis of same Logic/Rule/Relation. Select the odd one out from the given alternatives.", o: ["7 – 49","2 – 4","5 – 25","3 – 39"] },
  { s: GI, q: "In the following question, select the odd letter/letters from the given alternatives.", o: ["RTV","HJL","KMP","BDF"] },
  { s: GI, q: "Arrange the given words in the sequence in which they occur in the dictionary.\n\n1. Soften   2. Sterilize   3. Stick   4. Sterile   5. Status", o: ["15423","25134","54213","32154"] },
  { s: GI, q: "In the following question, select the missing number from the given series.\n\n23, 28, 34, 41, 49, ?", o: ["59","57","58","55"] },
  { s: GI, q: "A series is given with one term missing. Select the correct alternative from the given ones that will complete the series.\n\nGJT, IMR, KPP, MSN, ?", o: ["PUL","OVL","OUK","PVM"] },
  { s: GI, q: "In a row of buses, Panjab is at 19th position from the right end. Raftaar is 23 places to the left from Panjab and is at the exact centre of row. How many buses are between Raftaar bus and bus standing at the left end?", o: ["44","42","40","43"] },
  { s: GI, q: "From the given alternatives, select the word which CANNOT be formed using the letters of the given word.\n\nGovernment", o: ["Got","Over","Need","Norm"] },
  { s: GI, q: "In a certain code language, \"FRIED\" is written as \"EQHDC\". How is \"RUSTY\" written in that code language?", o: ["PAXYZ","QTRSX","PARSX","NQVSZ"] },
  { s: GI, q: "In a certain code language, '–' represents 'x', '÷' represents '+', '+' represents '÷' and 'x' represents '–'. Find out the answer to the following question.\n\n19 ÷ 2 – 35 + 10 x 6 = ?", o: ["20","14","32","27"] },
  { s: GI, q: "The following equation is incorrect. Which two signs should be interchanged to correct the equation?\n\n15 × 18 – 6 ÷ 20 + 4 = 29", o: ["+ and ×","÷ and –","+ and ÷","– and +"] },
  { s: GI, q: "If 40@8 = –5, 30@3 = –10 and 20@5 = –4, then find the value of 60@3 = ?", o: ["45","–20","–5","–36"] },
  { s: GI, q: "Which of the following terms follows the trend of the given list?\n\nabABABAB, ABabABAB, ABABabAB, ABABABab, abABABAB, _______________.", o: ["ABABA baB","abABABAB","ABabABAA","ABabABAB"] },
  { s: GI, q: "Two village women are returning home starting from the same point. The first woman walks 1 km South, then turns to her right and walks 6 km to reach her house. In the meanwhile the second woman walks 5 km West, then she turns North and walks 4 km, then she turns to her left and walks 1 km to reach her house. Where is the second woman's house with respect to the first woman's house?", o: ["5 km North","3 km North","5 km South","3 km South"] },
  { s: GI, q: "Two statements are given, followed by two conclusions, I and II. Decide which of the given conclusions follows from the given statements.\n\nStatement I: No books are notebooks\nStatement II: All diaries are books\nConclusion I: No notebooks are diaries\nConclusion II: All diaries are notebooks", o: ["Only conclusion I follows","Only conclusion II follows","Both conclusions I and II follow","Neither conclusion I nor conclusion II follows."] },
  { s: GI, q: "In the following figure, rectangle represents Film critics, circle represents Bakers, triangle represents Divers and square represents Football players. Which set of letter represents Football players who are not Divers? [Refer to original PDF for figure]", o: ["ED","FD","GH","DC"] },
  { s: GI, q: "A series is given with one term missing. Select the correct alternative from the given ones that will complete the series.\n\nHPA, FMZ, DJY, BGX, ?", o: ["ZDW","ZEV","YDW","YEV"] },
  { s: GI, q: "In the following question, select the missing number from the given series.\n\n672, 666, 660, 654, ?", o: ["648","646","650","640"] },
  { s: GI, q: "In the following question, four groups of three numbers are given. In each group the second and third number are related to the first number by a Logic/Rule/Relation. Three are similar on basis of same Logic/Rule/Relation. Select the odd one out.", o: ["(61, 64, 71)","(57, 60, 69)","(75, 78, 85)","(89, 92, 99)"] },
  { s: GI, q: "If a mirror is placed on the line MN, then which of the answer figure is the right image of the given figure? [Refer to original PDF for figures]", o: ["Figure 1","Figure 2","Figure 3","Figure 4"] },
  { s: GI, q: "Which of the following cube in the answer figure cannot be made based on the unfolded cube in the question figure? [Refer to original PDF for figures]", o: ["Figure 1","Figure 2","Figure 3","Figure 4"] },
  { s: GI, q: "A word is represented by only one set of numbers. The columns and rows of Matrix-I are numbered 0-4 and Matrix-II are numbered 5-9. Identify the set for the word 'UNIT'. [Refer to original PDF for matrices]", o: ["22,78,34,69","22,67,34,59","14,69,24,75","85,67,13,57"] },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "What is the least number that can be multiplied to 69120 to make it a perfect cube?", o: ["10","50","25","5"] },
  { s: QA, q: "Mr. Ankit is on tour to Siachin and he has Rs. 360 for his expenditure. If he exceeds his tour by 4 days, he must trim down his daily expenditure by Rs.3. For how many days is Mr. Ankit on tour?", o: ["20","22","24","26"] },
  { s: QA, q: "Determine the value of (1/r + 1/s) when r³ + s³ = 0 and r + s = 6.", o: ["0","0.5","1","6"] },
  { s: QA, q: "What is the y-intercept of the linear equation 59x + 14y – 112 = 0?", o: ["8","14","28","59"] },
  { s: QA, q: "The circumferences of two circles are touching externally. The distance between their centres is 12 cm. The radius of one circle is 7 cm. Find the diameter (in cm) of the other circle.", o: ["12","10","8","5"] },
  { s: QA, q: "The length of the radius of the circumference of a triangle having sides 9 cm, 12 cm and 15 cm is", o: ["6 cm","7.5 cm","4.5 cm","6.5 cm"] },
  { s: QA, q: "If X = 600 and Y = 800, then X is how much percent less than Y?", o: ["33.33","25","75","35"] },
  { s: QA, q: "The ratio of three numbers is 2 : 3 : 5. If the sum of the three numbers is 275, then what is the largest among the three numbers?", o: ["142","82.5","137.5","152"] },
  { s: QA, q: "S, T and U started a business and their capitals are in the ratio of 3 : 4 : 6. At the end they receive the profit in the ratio of 1 : 2 : 3. What will be the respective ratio of time period for which they contributed their capitals?", o: ["3 : 2 : 2","2 : 3 : 3","2 : 2 : 3","4 : 5 : 3"] },
  { s: QA, q: "What is the average of first 7 multiples of 7?", o: ["7","14","21","28"] },
  { s: QA, q: "A sum of Rs 8000 is divided into two parts. The simple interest on first part at the rate of 21% per annum is equal to the simple interest on second part at the rate of 35% per annum. What is the interest (in Rs) of each part?", o: ["1050","840","1400","1220"] },
  { s: QA, q: "Selling price of a glass is Rs 1965 and loss percentage is 25%. If selling price is Rs 3013, then what will be the profit percentage?", o: ["13","10.4","15","20"] },
  { s: QA, q: "Ramesh marks his article at Rs 6000 and after allowing a discount of 20%, he still earns 60% profit. What is the cost price (in Rs) of the article?", o: ["3600","4800","3000","4200"] },
  { s: QA, q: "What is the value of 27 × (1 + 3/√90 + 1/10)? [Refer to original PDF for exact expression]", o: ["40.5","45.6","33.5","38.23"] },
  { s: QA, q: "Rohan and Mohit together can build a wall in 8 days. Mohit and Vikas build the same wall in 10 days and Vikas and Rohan can build the same wall in 12 days. In how many days can all the three complete the same wall while working together?", o: ["240/37","120/37","150/37","180/37"] },
  { s: QA, q: "A boy starts from his house and walks at a speed of 5 km/hr and reaches his school 3 minutes late. Next day he starts at the same time and increases his speed by 4 km/hr and reaches 3 minutes early. What is the distance (in km) between the school and his house?", o: ["1","1.25","1.125","1.5"] },
  { s: QA, q: "Line graph shows the number of students of a certain university who passed in the given year in their final exams. Study the diagram and answer the following questions Q67 to Q70.\n\nQ67. In which year were number of students who passed more than those who passed in the previous year?", o: ["2016","2015","2014","2013"] },
  { s: QA, q: "Q68. What was the difference in the number of students who passed between the years 2013 and 2016?", o: ["1000","500","1500","2000"] },
  { s: QA, q: "Q69. Number of students who passed in 2016 were greater than that in 2017 by ________.", o: ["150%","100%","50%","200%"] },
  { s: QA, q: "Q70. If students who pass are given a certificate, what is the number of certificates awarded in the last three years?", o: ["19500","20000","20500","19000"] },
  { s: QA, q: "The area and the length of one of the diagonals of a rhombus is 84 cm² and 7 cm respectively. Find the length of its other diagonal (in cm).", o: ["12","24","48","36"] },
  { s: QA, q: "Find the perimeter (in cm) of a semicircle of radius 28 cm.", o: ["288","144","121","242"] },
  { s: QA, q: "Find the curved surface area (in cm²) of a hemisphere of diameter 28 cm.", o: ["1152","1024","956","1232"] },
  { s: QA, q: "What is the value of (sin 60° + 2/√3)?", o: ["(2√3+1)/√3","7/2√3","3","2+√3"] },
  { s: QA, q: "△XYZ is right angled at Y. If cos X = 3/5, then what is the value of cosec Z?", o: ["3/4","5/3","4/5","4/3"] },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Sudden decrease of birth rate would cause ________.", o: ["increase in per capita income","increase in investment","increase in savings","increase in loan requests"] },
  { s: GA, q: "In the last one decade, which one among the following sectors has attracted the highest foreign direct investment inflows into India?", o: ["Food processing","Petro-chemical","Chemicals other than fertilizers","Telecommunications"] },
  { s: GA, q: "Harshavardhan's Vallabhi conquest is found in which of the following inscriptions?", o: ["Aihole Pillar Inscription","Junagadh Inscription","Navsari Copperplate Inscription","Damodarpur copper plate Inscription"] },
  { s: GA, q: "What was the northwestern border of the Mughal Empire during the reign of Akbar?", o: ["Punjab","Hindukush","Kabul","Sindh"] },
  { s: GA, q: "What is called the minimum distance from the Sun in a planet in its orbit?", o: ["perihelion","aphelion","Apogee","Perigee"] },
  { s: GA, q: "Another name for Indira Point is: ________.", o: ["Parson point","La-Hi-Ching","Pygmalion point","All options are correct."] },
  { s: GA, q: "What was the real name of Swami Vivekananda?", o: ["Surendra nath Bose","Narendra nath Dutt","Vidyadhar Roy","Shyamal Bose"] },
  { s: GA, q: "Military exercise 'Prabal Dosty' which was held in November 2017 was conducted between ________.", o: ["India and Afghanistan","India and Kazakhstan","India and Uzbekistan","India and Turkmenistan"] },
  { s: GA, q: "Who among the following has been awarded the 'Rajiv Gandhi Khel Ratna Award' for the year 2017?", o: ["Jitu Rai","Jasvir Singh","Sardar Singh","S.V. Snil"] },
  { s: GA, q: "Vedda is a tribe of which of the following countries?", o: ["Maldives","Myanmar","Sri Lanka","Bangladesh"] },
  { s: GA, q: "Which of the following is natural fiber?", o: ["Silk","Rayon","Nylon","Polyester"] },
  { s: GA, q: "Which of the following statement(s) is/are CORRECT?", o: ["Oxides of non-metals are basic.","Oxides of non-metals are acidic.","Oxides of metals are acidic.","All options are correct."] },
  { s: GA, q: "In India, which of the following body is Constitutional in nature?", o: ["NITI Aayog","National Human Rights Commission","Central Vigilance Commission","Finance Commission"] },
  { s: GA, q: "Which part of the Indian Constitution deals with 'The Municipalities'?", o: ["Part VII","Part VIII","Part XI","Part IX A"] },
  { s: GA, q: "Organisms use bio-catalyst to break down complex substances into simpler substances. These bio-catalysts are called ________.", o: ["enzymes","hormones","vitamins","No option is correct."] },
  { s: GA, q: "The first step of process of nutrition is the breakdown of glucose into a three-carbon molecule called ________.", o: ["pyruvate","propanol","propane","methanol"] },
  { s: GA, q: "'Saubhagya' scheme was launched to provide which of the following?", o: ["Water connections","LPG connections","Electricity connections","Broadband connections"] },
  { s: GA, q: "Which of the following became first Indigenously developed vaccine from India to be pre-qualified by World Health Organisation?", o: ["Rotavac","Hemophile","Pentavac","Pneumococca"] },
  { s: GA, q: "In July 2017, RBI Capped how much Customer liability if they report unauthorised transactions within seven working days?", o: ["Rs 50,000","Rs 25,000","Rs 1,00,000","Rs 75,000"] },
  { s: GA, q: "On 10 April 2017, Lok Sabha passed the Motor Vehicles (Amendment) Bill, 2016. The Bill seeks to amend ________.", o: ["Motor Vehicles Act, 1988","Motor Vehicles Act, 1998","Motor Vehicles Act, 2005","Motor Vehicles Act, 2010"] },
  { s: GA, q: "What is the effective resistance (in Ω) of two resistors 20 Ω and 30 Ω connected in parallel?", o: ["50","12","24","25"] },
  { s: GA, q: "1 km/hr equals ________ m/s.", o: ["5/18","18/5","5/16","16/5"] },
  { s: GA, q: "To keep warm, polar bears have a layer of ________ under their skin.", o: ["muscle","fat","cartilage","hair"] },
  { s: GA, q: "Which of the statements given below are correct?\n\nA. Maverick Viñales won the 2017 Qatar Motorcycle Grand Prix MotoGP.\nB. In 2017, Zaheer Khan captained the IPL team Royal Challengers Bangalore.\nC. In 2017, Gautam Gambhir captained the IPL team Kolkata Knight Riders.", o: ["Only A","Only B","A and C","A, B and C"] },
  { s: GA, q: "In Microsoft Word, font, font style, size, font color etc. are options of ________.", o: ["Character formatting","Paragraph formatting","Sentence for matting","Font formatting"] },
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

  let category = await ExamCategory.findOne({ name: 'Central', type: 'Central' });
  if (!category) {
    category = await ExamCategory.create({ name: 'Central', type: 'Central', description: 'Central government competitive exams' });
    console.log(`Created ExamCategory: Central (${category._id})`);
  } else {
    console.log(`Found ExamCategory: Central (${category._id})`);
  }

  let exam = await Exam.findOne({ code: 'SSC-CHSL-T1' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC CHSL Tier-I',
      code: 'SSC-CHSL-T1',
      description: 'Staff Selection Commission - Combined Higher Secondary Level (Tier-I)',
      isActive: true
    });
    console.log(`Created Exam: SSC CHSL Tier-I (${exam._id})`);
  } else {
    console.log(`Found Exam: SSC CHSL Tier-I (${exam._id})`);
  }

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

  // Match on examPattern + title only: pyqShift string varied historically
  // ("Shift 1" vs "Shift-1") and would cause false-negative duplicates.
  const existing = await PracticeTest.findOne({
    examPattern: pattern._id,
    title: { $regex: /5 March 2017/i }
  });
  if (existing) {
    console.log(`\nPYQ already exists: ${existing._id} - skipping insert.`);
  } else {
    const test = await PracticeTest.create({
      examPattern: pattern._id,
      title: 'SSC CHSL Tier-I - 5 March 2017 Shift-1',
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
