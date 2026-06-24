/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 05 Dec 2017 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_img_d1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-05dec2017-s1';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2017', "Delhi Police Constable - 05 Dec 2017 Shift-1"];
const RAW = [
  { n: 1, s: "Reasoning / Logical Ability", q: "Door : Wood : Shirt:?", o: ["Collar", "Buttons", "Cutff", "Cloth"], a: 3, e: "", qimg: "" },
  { n: 2, s: "Reasoning / Logical Ability", q: "BLINK : IGPIR :: PINCH:?", o: ["WDUXO", "XDVOP", "VCTWP", "WCDWO"], a: 0, e: "", qimg: "" },
  { n: 3, s: "Reasoning / Logical Ability", q: "4 : 64 :: 6 :?", o: ["106", "68", "216", "196"], a: 2, e: "", qimg: "" },
  { n: 4, s: "Reasoning / Logical Ability", q: "In the following question, select the odd word from the given alternatives.", o: ["Car", "Cycle", "Truck", "Road"], a: 3, e: "", qimg: "" },
  { n: 5, s: "Reasoning / Logical Ability", q: "In following question, select the letters from the given alternatives.", o: ["FKQX", "CHNU", "JOUC", "DIOV"], a: 2, e: "", qimg: "" },
  { n: 6, s: "Reasoning / Logical Ability", q: "In the following question, select the odd number pair from the given alternatives.", o: ["14-56", "12-48", "8-32", "6-30"], a: 3, e: "", qimg: "" },
  { n: 7, s: "Reasoning / Logical Ability", q: "In the following question, select the odd number pair from the given alternatives.", o: ["5342-16", "4629-21", "1965-21", "5344-16"], a: 0, e: "", qimg: "" },
  { n: 8, s: "Reasoning / Logical Ability", q: "How many triangles are there in the given figure?", o: ["4", "5", "6", "7"], a: 1, e: "", qimg: "05dec2017-s1-q-8.png" },
  { n: 9, s: "Reasoning / Logical Ability", q: "How many rectangles are there in the given figure?", o: ["7", "8", "9", "10"], a: 3, e: "", qimg: "05dec2017-s1-q-9.png" },
  { n: 10, s: "Reasoning / Logical Ability", q: "In the given figure, what will come opposite to face containing `Z'?", o: ["N", "S", "K", "R"], a: 2, e: "", qimg: "05dec2017-s1-q-10.png" },
  { n: 11, s: "Reasoning / Logical Ability", q: "How many surfaces are there in the given figure?", o: ["8", "10", "9", "7"], a: 1, e: "", qimg: "05dec2017-s1-q-11.png" },
  { n: 12, s: "Reasoning / Logical Ability", q: "Form the given answer figure, select the one in which the question figure in hidden/embededded.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "05dec2017-s1-q-12.png" },
  { n: 13, s: "Reasoning / Logical Ability", q: "A piece of paper is folded and pushed as shown below in the question figures. From the given answer figures, indicate how it will appear when opened?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "05dec2017-s1-q-13.png" },
  { n: 14, s: "Reasoning / Logical Ability", q: "If mirror is placed on the line AB, then which of the answer figures is the right mirror of the given figure?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "05dec2017-s1-q-14.png" },
  { n: 15, s: "Reasoning / Logical Ability", q: "From the given alternatives, select, the word which can be formed using the letters of the given word. MOMENTARILY", o: ["MOIST", "TONER", "YARD", "LAID"], a: 1, e: "", qimg: "" },
  { n: 16, s: "Reasoning / Logical Ability", q: "Indentify the diagram that best represents the relationship among the given classes. Gold, Carbon, Metal", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "05dec2017-s1-q-16.png" },
  { n: 17, s: "Reasoning / Logical Ability", q: "In the given figure, how many Indian cricketer are not businessman?", o: ["41", "23", "18", "19"], a: 1, e: "", qimg: "05dec2017-s1-q-17.png" },
  { n: 18, s: "Reasoning / Logical Ability", q: "In the following question, select the number which can be placed at the sign of question mark (?) from the given alternatives. 7 8 4 88 5 11 6 121 973?", o: ["84", "88", "86", "80"], a: 0, e: "", qimg: "" },
  { n: 19, s: "Reasoning / Logical Ability", q: "In the following question below are given some statements followed by some conclusions Taking the given statements to be true even if they seem to be at variance from commonly known facts. Read all the conclusions and then decide which of given conclusion logically follows the given statements, Statements: I. Some figures are small. II. No small is red. Conclusions: I. All small are figures. II. Some red are small.", o: ["Only conclusion (I) follows.", "Only conclusion (II) follows.", "Both conclusion follow.", "Neither conclusion (I) nor conclusion (II) follows."], a: 3, e: "", qimg: "" },
  { n: 20, s: "Reasoning / Logical Ability", q: "In the following question below are given some statements followed by some conclusions Taking the given statements to be true even if they seem to be at variance from commonly known facts. Read all the conclusions and then decide which of given conclusion logically follows the given statements, Statements: I. Some pens are round. II. All round are black. Conclusions: I. All black are pens. II. Some round are black. III. All round are pens.", o: ["Only conclusion (II) follows.", "Only conclusion (III) follows.", "Only conclusion (II) and (III) follow.", "All conclusion follow."], a: 0, e: "", qimg: "" },
  { n: 21, s: "Reasoning / Logical Ability", q: "J is the son of P, P is the sister of Q. Q is the son of M. How M is related to P?", o: ["Daughter", "Son", "Uncle", "Mother or Father"], a: 3, e: "", qimg: "" },
  { n: 22, s: "Reasoning / Logical Ability", q: "Anil is the husband of Suman who is the daughter of Pankaj. Rahul is the only brother of Suman. How is Anil related to Rahul?", o: ["Brother-in-law", "Father", "Brother", "Son"], a: 0, e: "", qimg: "" },
  { n: 23, s: "Reasoning / Logical Ability", q: "The present ages of Rohit and Mohit are 48 years and 32 years respectively. What was the ratio of ages of Rohit and Mohit 12 years ago?", o: ["9 : 4", "9 : 5", "6 : 5", "8 : 5"], a: 1, e: "", qimg: "" },
  { n: 24, s: "Reasoning / Logical Ability", q: "A, B and C alone can do a work in 48, 12 and 24 days respectively. A, B and C together can complete two third of the same work in how many days?", o: ["32/7", "32/5", "28/9", "27/11"], a: 0, e: "", qimg: "" },
  { n: 25, s: "Reasoning / Logical Ability", q: "In the given question, there are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is odd one out.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "05dec2017-s1-q-25.png" },
  { n: 26, s: "Reasoning / Logical Ability", q: "In the given question, there are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is odd one out.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "05dec2017-s1-q-26.png" },
  { n: 27, s: "Reasoning / Logical Ability", q: "In the given question, there are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is odd one out.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "05dec2017-s1-q-27.png" },
  { n: 28, s: "Reasoning / Logical Ability", q: "In the following question, select the missing number from the given series. 4, 6, 10, 18, 34, ?", o: ["62", "66", "54", "78"], a: 1, e: "", qimg: "" },
  { n: 29, s: "Reasoning / Logical Ability", q: "In the following question, select the missing number from the given series. 4, 9, 19, 39,?", o: ["70", "79", "78", "64"], a: 1, e: "", qimg: "" },
  { n: 30, s: "Reasoning / Logical Ability", q: "In the following question, select the figure which can be placed at placed at the sign of question mark(?) from the given alternatives.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "05dec2017-s1-q-30.png" },
  { n: 31, s: "Reasoning / Logical Ability", q: "In the following question, Select the figure which can be place at the sign of question mark (?) from the given alternatives.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "05dec2017-s1-q-31.png" },
  { n: 32, s: "Reasoning / Logical Ability", q: "In the following question, Select the figure which can be place at the sign of question mark (?) from the given alternatives.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "05dec2017-s1-q-32.png" },
  { n: 33, s: "Reasoning / Logical Ability", q: "In a certain code language, \"FLAIR\" is written as \"96432\" and \"TIGHT\" is written as \"73817\". How is \"FLIGHT\" written in that code language?", o: ["871635", "963817", "963827", "986273"], a: 1, e: "", qimg: "" },
  { n: 34, s: "Reasoning / Logical Ability", q: "In a certain code language, \"FLOCK\" is written as \"47\" and \"STAIR\" is written as \"67\". How is \"RUST\" written in that code language?", o: ["73", "76", "75", "78"], a: 3, e: "", qimg: "" },
  { n: 35, s: "Reasoning / Logical Ability", q: "In a certain code language, \"SCIENCE\" is written as \"VZLBQZH\" How is \"FRUSTOM\" written in that code language?", o: ["INYPWLP", "IOXPWLP", "JNYQWLQ", "JOXPWLQ"], a: 1, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Which of the following is the most close to the definition of Oligopoly?", o: ["The cigarette industry", "The barber shop", "The welding shop", "Wheat growing farmers"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "One of the essential conditions of \"perfect competition\" is", o: ["product differentiation", "multiplicity of prices for identical products of a one time", "many sellers and a few buyers", "Same price for same things at one time"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which agency acts as a regulator for Mutual Funds?", o: ["IRDA", "SEBI", "RBI", "DRI"], a: 1, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "In which year was Imperial Bank of India established?", o: ["1921", "1930", "1935", "1955"], a: 0, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT the work of the legislature?", o: ["Making law", "Budgeting", "Passing of budget", "Control on the executive"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Who is the pioneer of Social Contract Theory?", o: ["Hobbes", "Locke", "Rousseau", "All options are correct"], a: 3, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "By which Constitutional Amendment Delhi was provided with Legislative Assembly?", o: ["65th Amendment", "69th Amendment", "72nd Amendment", "No option is correct"], a: 1, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Article 368 deals with ________.", o: ["Announcement of emergency", "Suspension of fundamental rights in special circumstances", "Power of issuance of write by judiciary", "Power of Parliament for constitution amendment"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Which Harappan site is located in Haryana?", o: ["Dholavira", "Rakhigarhi", "Kalibangan", "Alamgirpur"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "\"Chor Minar\" in the Hauz Khas area of Delhi was constructed by _____", o: ["Alauddin Khilji", "Aurangzeb", "Firoz Shah Tughlaq", "Akbar"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "First time during which Indian movement \"Vande Mataram\" became the popular song of people?", o: ["Khilafat Movement", "Quit India Movement", "Non-Co-operation Movement", "Swadeshi Movement"], a: 3, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Which one of the following places was the short term capital of Delhi Sultanate?", o: ["Devagiri", "Ahmedabad", "Jaipur", "Kurukshetra"], a: 0, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "In which state is the 'Adhai Din Ka Jhonpra' located?", o: ["Uttar Pradesh", "Maharashtra", "Rajasthan", "Madhya Pradesh"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "In which state in Yaosang festival celebrated?", o: ["Manipur", "Maharashtra", "Jharkhand", "Goa"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Eastern boundary of Kashmir is ______", o: ["Siachen Glacier", "Gilgit - Baltistan", "Karakoram", "Ladakh region"], a: 3, e: "", qimg: "" },
  { n: 51, s: "General Knowledge / Current Affairs", q: "Jalpaiguri lies on the bank of the river _______.", o: ["Ganga", "Yamuna", "Teesta", "Brahmputra"], a: 2, e: "", qimg: "" },
  { n: 52, s: "General Knowledge / Current Affairs", q: "Which physical feature acts as a watershed between the Indus and the Gangetic river basins?", o: ["Aravali Ridge", "Shivalik Hills", "Vindhya Range", "No option is correct"], a: 0, e: "", qimg: "" },
  { n: 53, s: "General Knowledge / Current Affairs", q: "Where is India's only active volcano Barren Island located?", o: ["Andaman Islands", "Nicobar Islands", "Lakshadweep", "Minicoy"], a: 0, e: "", qimg: "" },
  { n: 54, s: "General Knowledge / Current Affairs", q: "At present what is the rank of India among the cotton exporting countries of the world?", o: ["First", "Second", "Third", "Fourth"], a: 1, e: "", qimg: "" },
  { n: 55, s: "General Knowledge / Current Affairs", q: "Which area of India receives majority of its rainfall from the Northeast Monsoon?", o: ["Kerala", "Marathwada", "Gangetic West Bengal", "Coromandel and Rayalaseema"], a: 3, e: "", qimg: "" },
  { n: 56, s: "General Knowledge / Current Affairs", q: "When the speed of a moving body doubles, then what is the change in its kinetic energy?", o: ["Remains unchanged", "It gets quadrupled", "It gets tripled", "It gets doubled"], a: 1, e: "", qimg: "" },
  { n: 57, s: "General Knowledge / Current Affairs", q: "Which of the following has the maximum specific heat capacity?", o: ["water", "piece of iron", "piece of gold", "chloro form"], a: 0, e: "", qimg: "" },
  { n: 58, s: "General Knowledge / Current Affairs", q: "The instrument used to Record temperature to particular degree is called ______", o: ["Thermostat", "Thermometer", "Pyrometer", "Thermocouple"], a: 0, e: "", qimg: "" },
  { n: 59, s: "General Knowledge / Current Affairs", q: "Which artery does NOT carry oxygenated blood in human body?", o: ["Cardiac artery", "Renal artery", "Hepatic artery", "Pulmonary artery"], a: 3, e: "", qimg: "" },
  { n: 60, s: "General Knowledge / Current Affairs", q: "Human nails are made up of _______", o: ["Pigment", "Elastin", "Albumin", "Keratin"], a: 3, e: "", qimg: "" },
  { n: 61, s: "General Knowledge / Current Affairs", q: "Green spinach comprises ______ in abundance.", o: ["Vitamin A", "Vitamin B", "Vitamin C", "All options are correct"], a: 3, e: "", qimg: "" },
  { n: 62, s: "General Knowledge / Current Affairs", q: "Which hydrocarbons are the constituents of LPG?", o: ["Methane and Ethane", "Propane and Butane", "Pentane and Benzene", "Only Methane"], a: 1, e: "", qimg: "" },
  { n: 63, s: "General Knowledge / Current Affairs", q: "Which of the following is a mangroves flora?", o: ["Spruce", "Moss", "Rhizophora", "Cypress"], a: 2, e: "", qimg: "" },
  { n: 64, s: "General Knowledge / Current Affairs", q: "Which of the following is also known as Gelena?", o: ["Lead sulphate", "Lead oxide", "Lead sulphide", "Calcium sulphate"], a: 2, e: "", qimg: "" },
  { n: 65, s: "General Knowledge / Current Affairs", q: "Air Quality Index is _______.", o: ["an air pollutant measuring machine", "a measuring scale to show quality of air", "used for measuring humidity level", "use for forecasting rain"], a: 1, e: "", qimg: "" },
  { n: 66, s: "General Knowledge / Current Affairs", q: "In which of the following Ecosystem benthic zone is found?", o: ["Tundra Ecosystem", "Forest ecosystem", "Water ecosystem", "Desert ecosystem"], a: 2, e: "", qimg: "" },
  { n: 67, s: "General Knowledge / Current Affairs", q: "On the occasion of Children's Day 2017, which state government launched 'Mukhyamantri Shala Suraksha Yojana' for the children", o: ["Chhattisgarh", "Uttar Pradesh", "Maharashtra", "Himachal pradesh"], a: 0, e: "", qimg: "" },
  { n: 68, s: "General Knowledge / Current Affairs", q: "The 'SAMPADA' scheme of Government of India is related to ______", o: ["Rural banking", "Food processing", "Insurance for BPL familles", "Irrigation sector"], a: 1, e: "", qimg: "" },
  { n: 69, s: "General Knowledge / Current Affairs", q: "Which of the following is an indigenously built nuclear powered submarine inducted in service of Indian Navy in 2017?", o: ["Sindhuraj", "Aridhaman", "Sagarika", "Godavari"], a: 1, e: "", qimg: "" },
  { n: 70, s: "General Knowledge / Current Affairs", q: "Which is NOT true about DIGilocker ?", o: ["Copy of document in electronic form is stored on individual's own computer or mobile phone", "One GB storage space is provided", "Aadhaar linking is mandatory", "All options are correct"], a: 0, e: "", qimg: "" },
  { n: 71, s: "General Knowledge / Current Affairs", q: "The 2020 Summer Olympic games will be hosted by ________", o: ["Mexico", "Tokyo", "Pairs", "Los Angles"], a: 1, e: "", qimg: "" },
  { n: 72, s: "General Knowledge / Current Affairs", q: "Where was the Under-17 FIFA World Cup - 2017 held?", o: ["Brazil", "England", "India", "Spain"], a: 2, e: "", qimg: "" },
  { n: 73, s: "General Knowledge / Current Affairs", q: "China recently purchased a 70 percent stake in strategically located Hambantota deep water port. This port is located in which country?", o: ["Bangladesh", "Myanmar", "Pakistan", "Sri Lanka"], a: 3, e: "", qimg: "" },
  { n: 74, s: "General Knowledge / Current Affairs", q: "Nepal and Bhutan recently approached which of the following entities seeking collaboration to make use of India's digital payment services?", o: ["SEBI", "Union Ministry of Finance", "NPCI", "UIDAI"], a: 2, e: "", qimg: "" },
  { n: 75, s: "General Knowledge / Current Affairs", q: "Which film won the coveted Golden Peacock Award at the 47th International Film Festival of India (IFFI)?", o: ["The Throne", "Daughter", "Mellow Mud", "Rauf"], a: 1, e: "", qimg: "" },
  { n: 76, s: "General Knowledge / Current Affairs", q: "Who among the following became the first woman in the world to be awarded IMO Award for Exceptional Bravery of Sea?", o: ["Kirti Iyyer", "Sujata Malhotra", "Archana Shastri", "Radhika Menon"], a: 3, e: "", qimg: "" },
  { n: 77, s: "General Knowledge / Current Affairs", q: "The GeM Portal of Government of India deals with________.", o: ["Telemedicine", "Distance learning", "Public procurement", "Aadhaar based digital signature"], a: 2, e: "", qimg: "" },
  { n: 78, s: "General Knowledge / Current Affairs", q: "What is the function of MUDRA bank which was recently set up by Government of India?", o: ["To print currency", "To allow deposits of untaxed income", "To provide insurance cover to the poor", "To provide loan and finance to micro enterprises"], a: 3, e: "", qimg: "" },
  { n: 79, s: "General Knowledge / Current Affairs", q: "Sharing of which river's waters are a bone of contention between India and Bangladesh?", o: ["Kosi", "Brahmaputra", "Teesta", "Bagmati"], a: 2, e: "", qimg: "" },
  { n: 80, s: "General Knowledge / Current Affairs", q: "Rio summit is associated with __________.", o: ["Wet lands", "Ozone depletion", "Green house gases", "Convention on Biological Diversity"], a: 3, e: "", qimg: "" },
  { n: 81, s: "General Knowledge / Current Affairs", q: "The water pollution in the rivers is measured by ________.", o: ["amount of dissolved chlorine", "amount of dissolved ozone", "amount of dissolved nitrogen", "amount of dissolved oxygen"], a: 3, e: "", qimg: "" },
  { n: 82, s: "General Knowledge / Current Affairs", q: "Hugh Hefner, died at the age of September 2017. He was the founder of ________.", o: ["L'Oreal Cosmetics", "Johnson & Johnson", "Playboy Magazine", "Science Journal"], a: 2, e: "", qimg: "" },
  { n: 83, s: "General Knowledge / Current Affairs", q: "Before becoming the President of India, Ram Nath Kovind was the Governor of which state?", o: ["Rajasthan", "Bihar", "Madhya Pradesh", "Uttar Pradesh"], a: 1, e: "", qimg: "" },
  { n: 84, s: "General Knowledge / Current Affairs", q: "Which of the following cities has become the first open-defecation free city in India?", o: ["Indore", "Vishakhapatnam", "Mysuru", "Amritsar"], a: 2, e: "", qimg: "" },
  { n: 85, s: "General Knowledge / Current Affairs", q: "Which state will develop an eco-friendly bridge over a canal cutting across the Tiger Corridor linking?", o: ["Telangana", "Andhra Pradesh", "Madhya Pradesh", "Assam"], a: 0, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the value of 0.0625", o: ["2.5", "0.5", "0.25", "25"], a: 2, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the value of [(1 + 2 + 3 + 4 + ........20)/7]?", o: ["30", "35", "40", "50"], a: 0, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Which of the following fraction is greater than 2/3?", o: ["1/2", "3/7", "4/7", "6/7"], a: 3, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the smallest four-digit number which when divided by 2, 3, 4 and 6 leaves remainder 1 in each case?", o: ["1008", "1005", "1009", "1007"], a: 2, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the value of (3.2 � 3.2) + (2.7 � 2.7) + (3.2 � 2.7) (3.2 � 3.2 � 3.2) - (2.7 � 2.7 � 2.7)", o: ["1", "1/2", "2", "3/2"], a: 2, e: "", qimg: "" },
  { n: 91, s: "Numerical Ability (Quantitative Aptitude)", q: "If a number A is 30% less than another number B and B is 20% more than 150, then what is the value of A?", o: ["144", "156", "136", "126"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Numerical Ability (Quantitative Aptitude)", q: "If a = (5/4)b and b = (2/10)c, then what is a : b : c?", o: ["15 : 12 : 20", "1 : 1 : 2", "5 : 2 : 10", "5 : 4 : 20"], a: 3, e: "", qimg: "" },
  { n: 93, s: "Numerical Ability (Quantitative Aptitude)", q: "The average age of 11 players and their coach is 33 years. The average age of the first 5 players is 29 years and the average age of the other 6 players is 30 years. What is the age (in years) of the coach?", o: ["71", "75", "68", "64"], a: 0, e: "", qimg: "" },
  { n: 94, s: "Numerical Ability (Quantitative Aptitude)", q: "What will be the difference (in Rs) between the compound interest and simple interest on 8000 for 2 years at the rate of 2.5% per annum?", o: ["12.5", "7.5", "10", "5"], a: 3, e: "", qimg: "" },
  { n: 95, s: "Numerical Ability (Quantitative Aptitude)", q: "If 40 chairs are bought for Rs. 10000, then how many chairs must be sold for 10000 to gain 60%?", o: ["25", "30", "15", "20"], a: 0, e: "", qimg: "" },
  { n: 96, s: "Numerical Ability (Quantitative Aptitude)", q: "Piyush marks the price of his article 30% more than its cost price. If he sells the article for Rs. 780 after following a discount of 20%, then what will be the cost price (in Rs) of the article?", o: ["600", "700", "680", "750"], a: 3, e: "", qimg: "" },
  { n: 97, s: "Numerical Ability (Quantitative Aptitude)", q: "What will be the ratio of the area of square to area of circle which inscribed in the square?", o: ["15 : 11", "14 : 11", "33 : 26", "25 : 22"], a: 1, e: "", qimg: "" },
  { n: 98, s: "Numerical Ability (Quantitative Aptitude)", q: "A man travelled four equal distances of 3 km at speeds of 10, 20, 30 and 40 km/hr respectively. What is his average speed (in km/hr)?", o: ["14", "19.2", "22.8", "16.8"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Numerical Ability (Quantitative Aptitude)", q: "P started a business with Rs. 80000 and after some months Q joined with Rs. 60000. If the profit at the end of the year was divided in the ratio 2 : 1, then after how many months did Q joined the business?", o: ["4", "6", "5", "7"], a: 0, e: "", qimg: "" },
  { n: 100, s: "Numerical Ability (Quantitative Aptitude)", q: "F and M together can do a piece of work in 8 days. F alone can do the same work in 12 days. In how many days can M alone do the same work?", o: ["8", "12", "24", "6 100 Questions"], a: 2, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 05 Dec 2017 Shift-1";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2017,
    pyqShift: "Delhi Police Constable - 05 Dec 2017 Shift-1", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
