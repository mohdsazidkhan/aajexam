/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 07 Dec 2020 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc07_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-07dec2020-s2';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 07 Dec 2020 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "In which of t he following years was t he Int erim Government of India formed from t he newly elect ed Const it uent Assembly?", o: ["1943", "1940", "1945", "1946"], a: 3, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "In which of t he following Art icles of t he Indian Const it ut ion is t he Finance Bill ment ioned?", o: ["Article 145", "Article 112", "Article 110", "Article 134"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "In India, how many sediment ary basins are t here which cover an area of 3.14 million km2?", o: ["10", "19", "28", "26"], a: 3, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Jhijhiya is t he famous cult ural dance of which of t he following st at es?", o: ["Bihar", "Madhya Pradesh", "Assam", "Uttar Pradesh"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Nit rous oxide is a colourless and odourless subst ance t hat is also known as ______.", o: ["laughing gas", "sleeping gas", "balloon gas", "tear gas"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "_______ is a branch of hort icult ure as it deals wit h t he cult ivat ion of flowers and ornament al crops from t he t ime of plant ing to t he t ime of harvest ing.", o: ["Sericulture", "Floriculture", "Apiculture", "Mariculture"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "The CADC is formed under t he 6t h Schedule to t he Const it ut ion of India in 1972, for t he Chakma et hnic people. What does CADC st and for?", o: ["Chakma Autonomous District Corporation", "Chakma Autonomous District Council", "Chakma Attorney Deputy Council", "Chakma Associate District Council"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "How many commit t ees were set up by t he Const it uent Assembly for framing t he Const it ut ion?", o: ["13", "9", "11", "20"], a: 0, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "The Dhyan Chand Award, named aft er t he legendary player Major Dhyan Chand, is awarded for t he lifet ime cont ribut ion in t he sport s field. In which of t he following sport s did he represent India?", o: ["Hockey", "Boxing", "Badminton", "Wrestling"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "______ deal(s) wit h t he t axat ion and expendit ure decisions of t he Government .", o: ["Monetary Policy", "Labour Market Policies", "Trade Policy", "Fiscal Policy"], a: 3, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Who among t he following women army officers has been promot ed to t he second- highest rank of Lieut enant General in t he Indian Army in March 2020?", o: ["Padmavathy Bandopadhyay", "Nivedita Choudhary", "Punita Arora", "Madhuri Kanitkar"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "In which of t he following years was t he Securit y and Exchange Board of India (SEBI) est ablished by t he government of India to prot ect t he int erest s of investors in securit ies and to promot e and regulat e t he securit ies market ?", o: ["1992", "1999", "1987", "1985"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "The AIIB is a mult ilat eral development bank wit h a mission to improve social and economic out comes in Asia. What does AIIB st and for?", o: ["Asian Investment Industrial Bank", "Asian Infrastructure Industrial Bank", "Asian Infrastructure Investment Bank", "African Infrastructure Investment Bank"], a: 2, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which of t he following is t he longest river of Nepal?", o: ["Trishuli", "Arun", "Tamor", "Karnali"], a: 3, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "The highest civilian awards of t he count ry, 'The Padma Awards’ were inst it ut ed in which of t he following years?", o: ["1967", "1952", "1954", "1960"], a: 2, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Which of t he following financial schemes was launched in 2014, to provide universal access to banking facilit ies to t he Indian people?", o: ["Pradhan Mantri Mudra Yojana (PMMY)", "Pradhan Mantri Jan Dhan Yojana (PMJDY)", "Stand Up India", "Pradhan Mantri Fasal Bima Yojana (PMFBY)"], a: 1, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Galvanisat ion is a met hod of prot ect ing st eel and iron from rust ing by coat ing t hem wit h a t hin layer of ______.", o: ["tin", "copper", "aluminium", "zinc"], a: 3, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Who among t he following was t he President of t he Muslim League in 1930?", o: ["Muhammad Ali Jinnah", "Jawahar Lal Nehru", "Sir Mohammad Iqbal", "Maulana Azad"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "In which of t he following count ries is t he headquart ers of FIFA, t he int ernat ional federat ion governing associat ion foot ball, sit uat ed?", o: ["Australia", "Spain", "USA", "Switzerland"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "How many dynast ies ruled Delhi during t he Sult anat e period (1206 AD – 1526 AD)?", o: ["6", "3", "5", "4"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Dinesh Khara has been recommended by t he Banks Board Bureau as t he next Chairman of which of t he following banks from October2020?", o: ["Punjab Union Bank", "State Bank of India", "Kotak Mahindra Bank", "Yes Bank"], a: 1, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Who among t he following leaders had int roduced t he ‘Object ive Resolut ion’ in t he Const it uent Assembly on 13 December 1946?", o: ["Dr. BR Ambedkar", "SN Mukherjee", "Subhash Chandra Bose", "Jawahar Lal Nehru"], a: 3, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Wit h which of t he following Const it ut ional amendment s did t he capit al cit y Delhi get a Legislat ive Assembly wit h t he enact ment of t he Nat ional Capit al Territory Act , 1991?", o: ["79th Constitutional Amendment", "67th Constitutional Amendment", "69th Constitutional Amendment", "56th Constitutional Amendment"], a: 2, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "The sale or liquidat ion of asset s by t he government , usually Cent ral and St at e public sector ent erprises, project s, or ot her fixed asset s is called ______.", o: ["devaluation", "capitalisation", "disinvestment", "privatisation"], a: 2, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "At which of t he following places is t he Raireshwar t emple locat ed, where Chhat rapat i Shivaji had t aken t he oat h to build Hindavi Swarajya?", o: ["Bhor", "Mulshi", "Junnar", "Baramati"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "The famous Ambubachi Mela is held every year in which of t he following cit ies of India?", o: ["Jalandhar", "Patna", "Jaipur", "Guwahati"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Who among t he following cricket ers announced his ret irement from t he int ernat ional cricket in August 2020?", o: ["Rohit Sharma", "Hardik Pandya", "MS Dhoni", "Virat Kohli"], a: 2, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Wat er cont aining ______ at concent rat ions below 60 milligrams per lit re is generally considered as soft .", o: ["sodium carbonate", "potassium carbonate", "calcium carbonate", "potassium bicarbonate"], a: 2, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which of t he following banks has announced a st rat egic part nership wit h Adobe to help improve t he digit al experience journey of it s customers in August 2020?", o: ["ICICI Bank", "HDFC Bank", "State Bank of India", "Union Bank of India"], a: 1, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "In which year was t he Lead Bank Scheme int roduced by t he Reserve Bank of India?", o: ["1964", "1969", "1973", "1975"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "The agro-based religious Nuakhai fest ival is celebrat ed in which of t he following st at es?", o: ["Maharashtra", "Tamil Nadu", "Kerala", "Odisha"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Who among t he following is t he founder ruler of t he Lodhi Dynast y?", o: ["Daulat Khan Lodhi", "Sikandar Khan Lodhi", "Ibrahim Khan Lodhi", "Bahlul Khan Lodhi"], a: 3, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Which of t he following rivers forms t he part of t he India-Bangladesh border, originat es from Sout h Tripura dist rict and flows into Bangladesh?", o: ["Surma river", "Kaveri river", "Sangu river", "Feni river"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "______ is also known as brown coal of t he lowest rank of coal due to it s relat ively low heat cont ent .", o: ["Bitumen", "Lignite", "Anthracite", "Peat"], a: 1, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Who among t he following was t he Secret ary of t he Const it uent Assembly?", o: ["Hussain Imam", "Dr. Rajendra Prasad", "HVR Iyengar", "HC Mookherjee"], a: 2, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Bara Imambara, a historical edifice wit h marvellous archit ect ure, is sit uat ed in which of t he following cit ies?", o: ["Mumbai", "Panipat", "Lucknow", "Hyderabad"], a: 2, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "In which of t he following st at es is t he Brihadeswara Temple, t he world’s first t emple built from granit e, locat ed?", o: ["Rajasthan", "Maharashtra", "Gujarat", "Tamil Nadu"], a: 3, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Who among t he following was t he leader of t he Ahom’s Revolt , 1828?", o: ["Achal Singh", "Bhagat Jawahar Mal", "Gomdhar Konwar", "Fond Sawant"], a: 2, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Sri Jayewardenepura Kot t e is t he legislat ive capit al of which of t he following count ries?", o: ["Bhutan", "Bangladesh", "Myanmar", "Sri Lanka"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which of t he following diseases is caused by a virus?", o: ["Polio", "Ringworm", "Plague", "Cholera"], a: 0, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Who among t he following has writ t en t he novel ‘In Custody’?", o: ["Dom Moraes", "Mulk Raj Anand", "P Lal", "Anita Desai"], a: 3, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "The book 'Cricket Drona' is writ t en by Jat in Paranjape and Anand Vasu based on whom amongst t he following Indian cricket coaches?", o: ["Kapil Dev", "Anil Kumble", "Ravi Shastri", "Vasoo Paranjape"], a: 3, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Ian Bell has announced his ret irement from professional cricket in 2020. He represent s which of t he following count ries?", o: ["Australia", "New Zealand", "West Indies", "England"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Where was t he Peshwa sent away wit h a pension aft er t he Third Anglo-Marat ha War?", o: ["Poona", "Nagpur", "Surat", "Bithur"], a: 3, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Which of t he following count ries has t he highest peak named Keokradong?", o: ["Bangladesh", "Bhutan", "Sri Lanka", "Myanmar"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Who among t he following is t he first Indian woman to fly to space?", o: ["Shawna Pandya", "Kalpana Chawla", "Sunita Williams", "Prem Mathur"], a: 1, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Chit t agong Hill Tract s are found in which of t he following count ries?", o: ["Bangladesh", "Bhutan", "India", "Nepal"], a: 0, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Which of t he following is a non-renewable source of energy?", o: ["Wind power", "Hydel power", "Solar power", "Fossil fuels"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Annapurna Devi, t he legendary musician awarded wit h Padma Bhushan in 1977, was associat ed wit h which of t he following musical inst rument s?", o: ["Surbahar", "Violin", "Veena", "Flute"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Lomas Rishi Cave, an example of early cave archit ect ure of t he 3rdcent ury BC and t he most dat able cave of all, is locat ed in which of t he following st at es of India?", o: ["Manipur", "Jharkhand", "Haryana", "Bihar"], a: 3, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "07dec2020-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "07dec2020-s2-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "07dec2020-s2-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "In a certain code language, WARDROBE is written as AWDROREB. How will ORIENTAL be written in the same code language?", o: ["ROETINAL", "EORITNLA", "ROEITNLA", "ROEITNAL"], a: 2, e: "", qimg: "" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "07dec2020-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "07dec2020-s2-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "07dec2020-s2-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the number that can replace the question mark (?) in the following series.\n8, 12, 21, 37, 62, ?", o: ["98", "88", "94", "84"], a: 0, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Four words have been given, out of which three are alike in some manner and one is different. Select the odd one.", o: ["Ear", "Nose", "Eye", "Throat"], a: 3, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "A and B can do a piece of work in 30 days and 15 days, respectively. A and B start the work together. In how many days will the entire work be completed?", o: ["10", "12", "15", "9"], a: 0, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "07dec2020-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "07dec2020-s2-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "07dec2020-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "07dec2020-s2-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "If '$' stands for 'addition', '@' stands for 'subtraction', '&' stands for 'multiplication' and '#' stands for 'division', then what is the value of the following expression?\n16 @ 26 $ 8 & 14 # 7", o: ["6", "4", "1", "0"], a: 0, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "07dec2020-s2-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following set.\n(1, 2, 3)", o: ["(4, 16, 64)", "(4, 8, 16)", "(11, 22, 33)", "(6, 6, 8)"], a: 2, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "07dec2020-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "07dec2020-s2-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "07dec2020-s2-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "07dec2020-s2-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "07dec2020-s2-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "'Runway' is related to 'Airplane' in the same way as 'Track' is related to '______'.", o: ["Athlete", "Ship", "Bus", "Boat"], a: 0, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third number in the same way as the second number is related to the first number and the sixth number is related to the fifth number.\n168 : 8 :: 84 : ? :: 105 : 5", o: ["12", "6", "4", "11"], a: 2, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the number that can replace the question mark (?) in the following series.\n23, 33, 57, 101, 171, ?", o: ["273", "278", "277", "275"], a: 0, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "The value of 8/3 ÷ 3/4 of 5/6 + 4/9 ÷ (3/5 − 1/2) × 9/25 + 3/5 × 4/9 − 4/9 ÷ 2/3 is:", o: ["79/15", "82/15", "91/15", "67/15"], a: 1, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "Two numbers P and Q are such that the sum of 2% of P and 2% of Q is two-third of the sum of 2% of P and 6% of Q. The ratio of 2 times of P to 5 times of Q is:", o: ["5 : 3", "6 : 5", "3 : 2", "2 : 5"], a: 1, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the length (in cm) of the diagonal of a square whose area is 5 times that of another square with diagonal as 4√2 cm?", o: ["8√5", "4√10", "2√10", "4√5"], a: 1, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "During a rainy day, 4 cm of rain falls. The volume (in m³) of water that falls on 1.5 hectares of ground is:", o: ["600", "450", "750", "500"], a: 0, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of the three-digit numbers that have all three digits the same is:", o: ["666", "444", "555", "525"], a: 2, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "An officer undertakes to complete a job in 300 days. He employs 300 people for 60 days and they complete half of the work. He then reduces the number of people to 100, who work for 120 days, after which there are 20 days' holiday. How many people must be employed for the remaining period to finish the work?", o: ["50", "100", "75", "60"], a: 3, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A passenger train without stoppages runs at an average speed of 75 km/h, and with stoppages, at an average speed of 60 km/h. What is the total time (in hours) taken by the train for stoppages on a route of length 600 km?", o: ["2", "4", "3", "1"], a: 0, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A person spent 65% of the income on purchasing items A and B and the rest of the amount is his savings. He spent ₹1,800 on purchasing item A and ₹3,270 on purchasing item B. The savings amount (in ₹) was:", o: ["2730", "2500", "3000", "2950"], a: 0, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "In scheme A, a sum of ₹24,000 is put on simple interest for 2 years at a rate of 8% per annum. In scheme B, a sum of ₹24,000 is put at a rate of 5% per annum, compounded annually, for 2 years. The ratio of interest from A to that from B is:", o: ["41 : 64", "45 : 41", "41 : 45", "64 : 41"], a: 3, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "What will be least number of marbles with Rohit, if he can arrange them in rows of 9, 10 and 15 marbles each, and the number is also a perfect square?", o: ["100", "961", "400", "900"], a: 3, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "A student purchased a box of pens at the rate of 8 pens for ₹24 and sold all of them at the rate of 9 pens for ₹45. In this transaction, he gained ₹240. How many pens did the box contain?", o: ["100", "120", "180", "150"], a: 1, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "A dealer sells an article by allowing a 20% discount on its marked price and gains 24%. If the cost price of the article is increased by 10%, how much discount percentage should he allow now on the same marked price so as to earn the same percentage of profit as before?", o: ["10%", "15%", "18%", "12%"], a: 3, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "A person invested a sum of ₹50,000 partly at 15% p.a. and remaining at 18% p.a. at simple interest. At the end of 2 years, the total interest received was ₹16,800. The ratio of the sum at 15% p.a. to the sum at 18% p.a. is:", o: ["1 : 4", "2 : 3", "4 : 1", "3 : 2"], a: 1, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "The monthly income of A, B and C taken together is ₹69,000. A spends 70% of income, B spends 80% of income and C spends 92% of income. If their monthly savings are in the ratio of 15 : 11 : 10, respectively, then the monthly savings (in ₹) of B is:", o: ["3,300", "2,500", "6,750", "1,200"], a: 0, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "The difference between a two-digit number and the number obtained by interchanging the position of its digits is 45. What is the difference between the two digits of that number and how many such numbers are possible?", o: ["6; 3", "3; 6", "4; 5", "5; 4"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of t he following appears in MS-Word 2007 document area, as soon as a block of t ext is select ed for format t ing?", o: ["New document", "Print preview", "Mini tool bar", "Table"], a: 2, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of t he following is a cent ral locat ion of various relat ed web pages?", o: ["Web host", "Web site", "Web browser", "Search engine"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of t he following funct ions in MS-Excel count s t he number of cells wit hin a range t hat meet t he given condit ion?", o: ["COUNT IFB", "COUNTA", "COUNT", "COUNT IF"], a: 3, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "The icons or pict ures associat ed wit h some commands in menus will appear on t he ______ of MS-Excel.", o: ["tool bar", "formula bar", "title bar", "menu bar"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which of t he following comprises t he second part of an e-mail address?", o: ["Folder name", "Desktop client", "Domain name", "Mail-box name"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "In which of t he following t abs, t he format t ing t asks such as bolding, it alicizing, changing t he font and size of t ext found in MS-Word 2007?", o: ["Home", "Page Layout", "References", "Insert"], a: 0, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of t he following is a short cut key to close a document in MS-Word?", o: ["Ctrl+S", "Ctrl+N", "Ctrl+W", "Ctrl+M"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of t he following is NOT an opt ion in t he 'Table' menu of 'Insert ' t ab in MS- Word 2007?", o: ["Draw Table", "Quick Tables", "Remove Header", "Insert Table"], a: 2, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of t he following short cut s is used to move cursor one word right while edit ing dat a in a cell in MS-Excel?", o: ["Ctrl+Shift+←", "Ctrl+→", "Ctrl+Shift+→", "Ctrl+Shift"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of t he following is a met hod of accessing fixed int ernet for home or office?", o: ["Public Wi-Fi", "Mobile broadband", "Digital subscriber line", "Private Wi-Fi"], a: 2, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 07 Dec 2020 Shift-2";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 07 Dec 2020 Shift-2", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
