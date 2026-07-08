/**
 * Seed: UP Police Constable - 28 January 2019 Shift-2
 * UP Police Constable (Uttar Pradesh Police Recruitment & Promotion Board).
 * 150 Q × 2 marks = 300 marks, 4 sections (GK 38 / Hindi 37 / Numerical 38 / Reasoning 37),
 * 120 min total, 0.5 negative marking per wrong answer.
 * Uploads question/option images from local _extracted_up_police_28jan2019_s2/ to Cloudinary.
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

const EXTRACTED_DIR = path.resolve(__dirname, '../_extracted_up_police_28jan2019_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/up-police-constable-28jan2019-s2';
const F = '28jan2019-s2';

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
  slug: { type: String, lowercase: true, trim: true },
  totalMarks: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 1 },
  accessLevel: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
  isPYQ: { type: Boolean, default: false },
  pyqYear: { type: Number, default: null },
  pyqShift: { type: String, default: null, trim: true },
  pyqExamName: { type: String, default: null, trim: true },
  publishedAt: { type: Date, default: Date.now },
  questions: [{
    questionText: { type: String, required: true },
    questionImage: { type: String, default: '' },
    options: [{ type: String, required: true }],
    optionImages: [{ type: String, default: '' }],
    correctAnswerIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, trim: true },
    section: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'medium' }
  }]
}, { timestamps: true });

const ExamCategory = mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);
const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

const GK  = 'General Knowledge';
const HIN = 'General Hindi';
const NUM = 'Numerical & Mental Ability';
const REA = 'Mental Aptitude / Reasoning';

const KEY = [3, 3, 4, 3, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 4, 1, 1, 1, 2, 1, 3, 2, 4, 1, 2, 2, 4, 2, 2, 1, 1, 3, 4, 1, 3, 1, 3, 2, 1, 4, 1, 4, 3, 1, 2, 3, 2, 2, 3, 4, 1, 3, 2, 3, 4, 1, 4, 1, 2, 4, 1, 3, 2, 3, 2, 1, 4, 4, 3, 1, 2, 1, 3, 3, 1, 1, 1, 4, 1, 1, 2, 1, 1, 3, 3, 1, 3, 4, 3, 3, 1, 2, 2, 1, 1, 1, 4, 2, 1, 3, 2, 1, 4, 1, 3, 1, 1, 2, 2, 2, 1, 4, 2, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 3, 1, 2, 1, 2, 1, 2, 1, 1];
const RAW = [
  { n: 1, s: `General Knowledge`, q: `The wavelength of violet colour light is about .
Que. 1  The wavelength of violet colour light is about .`, qi: ``, o: [`10 - 11pm`, `1 - 10mm`, `455 - 390 nm`, `230 - 310 pm`], oi: [``, ``, ``, ``], e: `` },
  { n: 2, s: `General Knowledge`, q: `Butter is an example of a .
Que. 2  Butter is an example of a .`, qi: ``, o: [`suspension`, `colloidal solution`, `emulsion`, `amalgam`], oi: [``, ``, ``, ``], e: `` },
  { n: 3, s: `General Knowledge`, q: `Which of the following salts will NOT have 10 molecules of water of crystallisation?
Que. 3  Which of the following salts will NOT have 10 molecules of water of crystallisation?`, qi: ``, o: [`Glauber's salt`, `Washing soda`, `Borax`, `Epsom salt`], oi: [``, ``, ``, ``], e: `` },
  { n: 4, s: `General Knowledge`, q: `Who founded the Allahabad University in 1887?
Que. 4  Who founded the Allahabad University in 1887?`, qi: ``, o: [`Dr. Sarvepalli Radhakrishnan`, `Jonathan Duncan`, `Sir William Muir`, `Madan Mohan Malaviya`], oi: [``, ``, ``, ``], e: `` },
  { n: 5, s: `General Knowledge`, q: `The first woman Chief Minister was appointed in 1963. Which Indian state government did she lead?
Que. 5  The first woman Chief Minister was appointed in 1963. Which Indian state government did she lead?`, qi: ``, o: [`Uttar Pradesh`, `Tamil Nadu`, `West Bengal`, `Assam`], oi: [``, ``, ``, ``], e: `` },
  { n: 6, s: `General Knowledge`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 7, s: `General Knowledge`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 8, s: `General Knowledge`, q: `What was Uttar Pradesh known as from the year 1937-1950?
Que. 8  What was Uttar Pradesh known as from the year 1937-1950?`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 9, s: `General Knowledge`, q: `The Kailash Fair is celebrated in honour of Lord Shiva in which city of Uttar Pradesh?
Que. 9  The Kailash Fair is celebrated in honour of Lord Shiva in which city of Uttar Pradesh?`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 10, s: `General Knowledge`, q: `Which of the following is the longest canal of Uttar Pradesh?
Que. 10  Which of the following is the longest canal of Uttar Pradesh?`, qi: ``, o: [`Agra Canal`, `Sharda Canal`, `Upper Ganga Canal`, `Lower Ganga Canal`], oi: [``, ``, ``, ``], e: `` },
  { n: 11, s: `General Knowledge`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 12, s: `General Knowledge`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 13, s: `General Knowledge`, q: `Which book by Vikram Seth is a collection of ten fables as poems?
Que. 13  Which book by Vikram Seth is a collection of ten fables as poems?`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 14, s: `General Knowledge`, q: `Name the last poem written by Harivanshrai Bachchan.
Que. 14  Name the last poem written by Harivanshrai Bachchan.
Que. 11
Que. 11
In which year did Uttarakhand come into existence?`, qi: ``, o: [`2000`, `1991`, `2016`, `2011`], oi: [``, ``, ``, ``], e: `` },
  { n: 15, s: `General Knowledge`, q: `The blood group system was discovered by .
Que. 15  The blood group system was discovered by .`, qi: ``, o: [`Friedrich Stromeyer`, `Karl Wilhelm Scheele`, `William Murdock`, `Karl Landsteiner`], oi: [``, ``, ``, ``], e: `` },
  { n: 16, s: `General Knowledge`, q: `is a computer worm that targets industrial control systems. It attacked Iran's nuclear program in 2007.
Que. 16 is a computer worm that targets industrial control systems. It attacked Iran's nuclear program in 2007.`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 17, s: `General Knowledge`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 18, s: `General Knowledge`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 19, s: `General Knowledge`, q: `Which is the third most populated country in the world?
Que. 19  Which is the third most populated country in the world?`, qi: ``, o: [`Conficker`, `Stuxnet`, `Zeus`, `Sasser`], oi: [``, ``, ``, ``], e: `` },
  { n: 20, s: `General Knowledge`, q: `Which of the following is NOT one of the emirates of the United Arab Emirates?
Que. 20  Which of the following is NOT one of the emirates of the United Arab Emirates?`, qi: ``, o: [`Muscat`, `Dubai`, `Abu Dhabi`, `Sharjah`], oi: [``, ``, ``, ``], e: `` },
  { n: 21, s: `General Knowledge`, q: `Which one of the following is the capital of Bahrain?`, qi: ``, o: [`Ankara`, `Doha`, `Manama`, `Beirut`], oi: [``, ``, ``, ``], e: `` },
  { n: 22, s: `General Knowledge`, q: `was the first woman speaker of the Lok Sabha.
Que. 22 was the first woman speaker of the Lok Sabha.`, qi: ``, o: [`Sushma Swaraj`, `Meira Kumar`, `Pratibha Patil`, `Sumitra Mahajan`], oi: [``, ``, ``, ``], e: `` },
  { n: 23, s: `General Knowledge`, q: `In which of the following city the Sepoy Mutiny of 1857 War of Independence started?
Que. 23  In which of the following city the Sepoy Mutiny of 1857 War of Independence started?`, qi: ``, o: [`Jhansi`, `Hyderabad`, `Delhi`, `Meerut`], oi: [``, ``, ``, ``], e: `` },
  { n: 24, s: `General Knowledge`, q: `The traditional snack 'Khandvi' is associated with which Indian state?
Que. 24  The traditional snack 'Khandvi' is associated with which Indian state?`, qi: ``, o: [`Gujarat`, `Karnataka`, `West Bengal`, `Bihar`], oi: [``, ``, ``, ``], e: `` },
  { n: 25, s: `General Knowledge`, q: `Name the first Hindi-language newspaper of India, first published on 30 May 1826.
Que. 25  Name the first Hindi-language newspaper of India, first published on 30 May 1826.`, qi: ``, o: [`Dainik Bhaskar`, `Udant Martand`, `Patrika`, `Deshbandhu`], oi: [``, ``, ``, ``], e: `` },
  { n: 26, s: `General Knowledge`, q: `Which of the following is a high-yielding seed variety of wheat that contributed to India's Green Revolution?
Que. 26 Which of the following is a high-yielding seed variety of wheat that contributed to India's Green Revolution?`, qi: ``, o: [`Indira Sona`, `Lerma Rojo`, `Arize Tej`, `Ankur`], oi: [``, ``, ``, ``], e: `` },
  { n: 27, s: `General Knowledge`, q: `prepared the initial draft of the Indian Constitution in February 1948?
Que. 27 prepared the initial draft of the Indian Constitution in February 1948?`, qi: ``, o: [`Beohar Rammanohar Sinha`, `Nandalal Bose`, `Shyama Prasad Mukherjee`, `Benegal Narsing Rau`], oi: [``, ``, ``, ``], e: `` },
  { n: 28, s: `General Knowledge`, q: `Umaid Bhawan Palace is in which city?
Que. 28  Umaid Bhawan Palace is in which city?`, qi: ``, o: [`Udaipur`, `Jodhpur`, `Musuru`, `Jaipur`], oi: [``, ``, ``, ``], e: `` },
  { n: 29, s: `General Knowledge`, q: `Lavani is a famous folk-dance form of which Indian state?
Que. 29  Lavani is a famous folk-dance form of which Indian state?`, qi: ``, o: [`Uttar Pradesh`, `Maharashtra`, `Sikkim`, `Tamil Nadu`], oi: [``, ``, ``, ``], e: `` },
  { n: 30, s: `General Knowledge`, q: `Which was the last year when the Rail Budget and the Union Budget were presented separately in India.
Que. 30 Which was the last year when the Rail Budget and the Union Budget were presented separately in India.`, qi: ``, o: [`2016`, `2012`, `2008`, `2004`], oi: [``, ``, ``, ``], e: `` },
  { n: 31, s: `General Knowledge`, q: `Who was the first de facto Governor- General of India from 1773 to 1785?
Que. 31  Who was the first de facto Governor- General of India from 1773 to 1785?`, qi: ``, o: [`Warren Hastings`, `Lord Minto`, `George Watson`, `William George Wallker`], oi: [``, ``, ``, ``], e: `` },
  { n: 32, s: `General Knowledge`, q: `The Investment Information and Credit Rating Agency (ICRA) has its headquarters in .
Que. 32  The Investment Information and Credit Rating Agency (ICRA) has its headquarters in .`, qi: ``, o: [`Mumbai`, `Bengaluru`, `Gurugram`, `Chennai`], oi: [``, ``, ``, ``], e: `` },
  { n: 33, s: `General Knowledge`, q: `The Indian Government has made tourism illegal in which of these islands?
Que. 33  The Indian Government has made tourism illegal in which of these islands?`, qi: ``, o: [`Praslin Island`, `Pemba Island`, `Tromelin Island`, `Sentinel Island`], oi: [``, ``, ``, ``], e: `` },
  { n: 34, s: `General Knowledge`, q: `The first civil airport of which Indian state was inaugurated on September 2018?
Que. 34  The first civil airport of which Indian state was inaugurated on September 2018?`, qi: ``, o: [`Sikkim`, `Mizoram`, `Nagaland`, `Manipur`], oi: [``, ``, ``, ``], e: `` },
  { n: 35, s: `General Knowledge`, q: `The first Defence Minister of independent India was.
Que. 35  The first Defence Minister of independent India was.`, qi: ``, o: [`Kailash Nath Katju`, `VK Krishna Menon`, `Baldev Singh`, `Yashwantrao Chavan`], oi: [``, ``, ``, ``], e: `` },
  { n: 36, s: `General Knowledge`, q: `The island which has Sardar Vallabhbhai Patel's 'Statue of Unity' is located in which river?'
Que. 36  The island which has Sardar Vallabhbhai Patel's 'Statue of Unity' is located in which river?'`, qi: ``, o: [`Narmada`, `Sabarmati`, `Tapi`, `Mahil`], oi: [``, ``, ``, ``], e: `` },
  { n: 37, s: `General Knowledge`, q: `Pollen is produced in which part of the flower?
Que. 37  Pollen is produced in which part of the flower?`, qi: ``, o: [`Ovary`, `Ovule`, `Anthers`, `Pistil`], oi: [``, ``, ``, ``], e: `` },
  { n: 38, s: `General Knowledge`, q: `Which bacteria are oval-shaped or spherical?
Que. 38  Which bacteria are oval-shaped or spherical?`, qi: ``, o: [`Escherichila coli`, `Coccus`, `Bacillus`, `Vibrio`], oi: [``, ``, ``, ``], e: `` },
  { n: 39, s: `Numerical & Mental Ability`, q: `Retailer bought 7 articles for Rs. 10 each, 9 articles for Rs. 11, 14 articles for Rs. 15 each. Find the selling price per article if the profit is supposed to be 20% of the average cost price.
Que. 39  Retailer bought 7 articles for Rs. 10 each, 9 articles for Rs. 11, 14 articles for Rs. 15 each. Find the selling price per article if the profit is supposed to be 20% of the average cost price.`, qi: ``, o: [`Rs. 15.16`, `Rs. 15.20`, `Rs. 15.24`, `Rs. 15.28`], oi: [``, ``, ``, ``], e: `` },
  { n: 40, s: `Numerical & Mental Ability`, q: `A and B can complete a task in 12 days, B and C can complete the task in 16 days, A and C can complete the task in 24 days. In how many days will they together complete the task?
Que. 40  A and B can complete a task in 12 days, B and C can complete the task in 16 days, A and C can complete the task in 24 days. In how many days will they together complete the task?`, qi: ``, o: [`9.33`, `9.67`, `10.33`, `10.67`], oi: [``, ``, ``, ``], e: `` },
  { n: 41, s: `Numerical & Mental Ability`, q: `A man completes a journey in 5 hrs. He travels first half of the journey at the rate of 21 km/h and the second half at 24 km/ h. Find the total distance travelled.
Que. 41  A man completes a journey in 5 hrs. He travels first half of the journey at the rate of 21 km/h and the second half at 24 km/ h. Find the total distance travelled.`, qi: ``, o: [`112 km`, `116km`, `120 km`, `124km`], oi: [``, ``, ``, ``], e: `` },
  { n: 42, s: `Numerical & Mental Ability`, q: `The ratio of speeds of two trains is 5 : 6. The second train covers 450 km in 5 hrs. What is the speed of the first train?
Que. 42  The ratio of speeds of two trains is 5 : 6. The second train covers 450 km in 5 hrs. What is the speed of the first train?`, qi: ``, o: [`60km/h`, `65 km/h`, `70km/h`, `75 km/h`], oi: [``, ``, ``, ``], e: `` },
  { n: 43, s: `Numerical & Mental Ability`, q: `The length of a rectangular plot is thrice its breadth. The area of the plot 768 m2. Find the perimeter of the plot.`, qi: ``, o: [`120m`, `124m`, `128m`, `132 m`], oi: [``, ``, ``, ``], e: `` },
  { n: 44, s: `Numerical & Mental Ability`, q: `A 3-digit number ABC, where A is at the hundredth place, B is at the tenth place and C is at the unit's place, la re-written as ABCABC and is divided by the LCM of 7, 11 and 13. What will be the result?
Que. 44  A 3-digit number ABC, where A is at the hundredth place, B is at the tenth place and C is at the unit's place, la re-written as ABCABC and is divided by the LCM of 7, 11 and 13. What will be the result?`, qi: ``, o: [`ABC`, `CBA`, `BCA`, `AAB`], oi: [``, ``, ``, ``], e: `` },
  { n: 45, s: `Numerical & Mental Ability`, q: `A 5-digit number 247X8 is divisible by 44. Which digit can replace X?
Que. 45  A 5-digit number 247X8 is divisible by 44. Which digit can replace X?`, qi: ``, o: [`1`, `2`, `3`, `4`], oi: [``, ``, ``, ``], e: `` },
  { n: 46, s: `Numerical & Mental Ability`, q: `Find the product of the square root of 256 and square root of 16 and then find the result's square root.`, qi: ``, o: [`Que. 46  Find the product of the square root of 256 and square root of 16 and then find the result's square root.`, `4`, `6`, `10`], oi: [``, ``, ``, ``], e: `` },
  { n: 47, s: `Numerical & Mental Ability`, q: `Two chairs and a table can be bought for Rs. 170. Five chairs and four tables can be bought for Rs. 530. Find the cost of a chair.
Que. 47 Two chairs and a table can be bought for Rs. 170. Five chairs and four tables can be bought for Rs. 530. Find the cost of a chair.`, qi: ``, o: [`Rs. 40`, `Rs. 50`, `Rs. 60`, `Rs. 70`], oi: [``, ``, ``, ``], e: `` },
  { n: 48, s: `Numerical & Mental Ability`, q: `X has a balance of Rs. 90.53 in the bank account. What will be the balance left after a deposit of Rs. 67.14 and a withdrawal of Rs. 70.16?
Que. 48  X has a balance of Rs. 90.53 in the bank account. What will be the balance left after a deposit of Rs. 67.14 and a withdrawal of Rs. 70.16?`, qi: ``, o: [`Rs. 86.51`, `Rs. 87.51`, `Rs. 78.51`, `Rs. 79.51`], oi: [``, ``, ``, ``], e: `` },
  { n: 49, s: `Numerical & Mental Ability`, q: `The HCF and LCM of two numbers is 2 and 72 respectively. The bigger number is 2 more than twice the smaller number. Find the smaller number.
Que. 49 The HCF and LCM of two numbers is 2 and 72 respectively. The bigger number is 2 more than twice the smaller number. Find the smaller number.`, qi: ``, o: [`4`, `6`, `8`, `10`], oi: [``, ``, ``, ``], e: `` },
  { n: 50, s: `Numerical & Mental Ability`, q: `If 4 : 12 :: x : 9 , find the value of x.
51062
Que. 50
If 4 : 12 :: x : 9 , find the value of x.
51062`, qi: ``, o: [`12`, `15`, `16.5`, `18`], oi: [``, ``, ``, ``], e: `` },
  { n: 51, s: `Numerical & Mental Ability`, q: `Find 40% of 120% of 80% of 750.`, qi: ``, o: [`Que. 51  Find 40% of 120% of 80% of 750.`, `288`, `360`, `400`], oi: [``, ``, ``, ``], e: `` },
  { n: 52, s: `Numerical & Mental Ability`, q: `If an article was bought for Rs. 300 and a repairing charges of Rs. 50 was paid for it and it is supposed to be sold at a profit of 20% on the marked price which is 110% of the cost price. Find the required
selling price (in Rs.).`, qi: ``, o: [`440`, `452`, `462`, `478`], oi: [``, ``, ``, ``], e: `` },
  { n: 53, s: `Numerical & Mental Ability`, q: `What is the total percentage discount applied when 2 successive discounts of 20% and 10% are applicable.
Que. 53 What is the total percentage discount applied when 2 successive discounts of 20% and 10% are applicable.`, qi: ``, o: [`25%`, `28%`, `32%`, `36%`], oi: [``, ``, ``, ``], e: `` },
  { n: 54, s: `Numerical & Mental Ability`, q: `Find the rate of interest if the simple interest on a principal of Rs. 1,000 gave an interest of Rs. 440 in a span of 5 years.
Que. 54  Find the rate of interest if the simple interest on a principal of Rs. 1,000 gave an interest of Rs. 440 in a span of 5 years.`, qi: ``, o: [`8.4%`, `8.55%`, `8.8%`, `8.9%`], oi: [``, ``, ``, ``], e: `` },
  { n: 55, s: `Numerical & Mental Ability`, q: `Find the time for which compound interest of Rs. 331 was generated on principal of Rs. 1,000 at an annual interest rate of 10%.
Que. 55 Find the time for which compound interest of Rs. 331 was generated on principal of Rs. 1,000 at an annual interest rate of 10%.`, qi: ``, o: [`1 year`, `2 years`, `5 years`, `3 years`], oi: [``, ``, ``, ``], e: `` },
  { n: 56, s: `Numerical & Mental Ability`, q: `Que. 56
Three partners, A, B and C shared profits in the ratio 4:5:6. If C's share of the profit was Rs. 200 more than that A, find the total profit generated by them.`, qi: ``, o: [`Rs. 1,500`, `Rs. 1,600`, `Rs. 1,650`, `Rs. 1,750`], oi: [``, ``, ``, ``], e: `` },
  { n: 57, s: `Numerical & Mental Ability`, q: `Three partners, A, B and C shared profits in the ratio 2:3:4. A new partner D joined who took half of the shares of each A and C. If D's share of profit now is Rs. 100, find the total profit.
Que. 57  Three partners, A, B and C shared profits in the ratio 2:3:4. A new partner D joined who took half of the shares of each A and C. If D's share of profit now is Rs. 100, find the total profit.`, qi: ``, o: [`Rs. 200`, `Rs. 250`, `Rs. 275`, `Rs. 300`], oi: [``, ``, ``, ``], e: `` },
  { n: 58, s: `Numerical & Mental Ability`, q: `Each one of the following options consists of pairs of words. Choose the best pair to match with the pair in the question.
Doctor : Nurse`, qi: ``, o: [`Judge : Lawyer`, `Owner : Stall`, `Chef : Waiter`, `Engineer : Driver`], oi: [``, ``, ``, ``], e: `` },
  { n: 59, s: `Numerical & Mental Ability`, q: `Select the alternative that is related to the third term in the same way as the second term is related to the first term.
PQR : UTS :: LMN : ?`, qi: ``, o: [`OPQ`, `QPO`, `NML`, `PQO`], oi: [``, ``, ``, ``], e: `` },
  { n: 60, s: `Numerical & Mental Ability`, q: `Find the alternative that can be a member of the given group/class. Pathology, Radiology, Cardiology
Que. 60  Find the alternative that can be a member of the given group/class. Pathology, Radiology, Cardiology`, qi: ``, o: [`Biology`, `Geology`, `Zoology`, `Hermatology`], oi: [``, ``, ``, ``], e: `` },
  { n: 61, s: `Numerical & Mental Ability`, q: `Find the missing number: 1, 8 ,27, 64, ?
Que. 61 Find the missing number: 1, 8 ,27, 64, ?`, qi: ``, o: [`125`, `135`, `145`, `155`], oi: [``, ``, ``, ``], e: `` },
  { n: 62, s: `Numerical & Mental Ability`, q: `Find the missing numbers (X and Y) in the series and find the value of Y-X: 25, 26, 28, X, 35, Y, 46
Que. 62 Find the missing numbers (X and Y) in the series and find the value of Y-X: 25, 26, 28, X, 35, Y, 46`, qi: ``, o: [`7`, `8`, `9`, `10`], oi: [``, ``, ``, ``], e: `` },
  { n: 63, s: `Numerical & Mental Ability`, q: `Find the pair of the numbers that would fit into the pattern: 32 3, 32 4,32 12, 32 48, 32 240, ? ?
Que. 63 Find the pair of the numbers that would fit into the pattern: 32 3, 32 4,32 12, 32 48, 32 240, ? ?`, qi: ``, o: [`32 1200`, `32 1440`, `32 1320`, `64 1440`], oi: [``, ``, ``, ``], e: `` },
  { n: 64, s: `Numerical & Mental Ability`, q: `Which of the following series is built on the same logic as: C, E, G, K
Que. 64 Which of the following series is built on the same logic as: C, E, G, K`, qi: ``, o: [`M, Q, S, W`, `M, Q, S, X`, `M, O, Q, S`, `M, P, S, V`], oi: [``, ``, ``, ``], e: `` },
  { n: 65, s: `Numerical & Mental Ability`, q: `Fill the missing value in this series: C2BA, FE4D, IHG8, ?
Que. 65 Fill the missing value in this series: C2BA, FE4D, IHG8, ?`, qi: ``, o: [`JI6KL`, `L16KJ`, `MI6NO`, `O16NM`], oi: [``, ``, ``, ``], e: `` },
  { n: 66, s: `Numerical & Mental Ability`, q: `Which pair in the options will complete the following series: A, , I, P,
Que. 66 Which pair in the options will complete the following series: A, , I, P,`, qi: ``, o: [`D, Y`, `D, Z`, `E, Y`, `E, X`], oi: [``, ``, ``, ``], e: `` },
  { n: 67, s: `Numerical & Mental Ability`, q: `X bicycled 15 km north, then 20 km to his left. At least, how many more kms does he need to bicycle to return to his original position?
Que. 67  X bicycled 15 km north, then 20 km to his left. At least, how many more kms does he need to bicycle to return to his original position?`, qi: ``, o: [`35 km`, `15 km`, `20 km`, `25 km`], oi: [``, ``, ``, ``], e: `` },
  { n: 68, s: `Numerical & Mental Ability`, q: `Two cars start from a common point. The 1st car travels north 10km, turns left and goes ahead for 8 km, The 2nd car goes south for 5 km, turns right and travels 8 km. What is the distance between the
cars?`, qi: ``, o: [``, ``, ``, `5 km 10 km 8 km 15 km`], oi: [``, ``, ``, ``], e: `` },
  { n: 69, s: `Numerical & Mental Ability`, q: `X walks 3 km away from his starting point. He turns right and travels a further 8 km. He turns left and walks ahead, but notices that he is in the opposite direction of what he is supposed to be in. He started
by walking towards east. In which direction is he supposed to go?`, qi: ``, o: [`North`, `East`, `West`, `South`], oi: [``, ``, ``, ``], e: `` },
  { n: 70, s: `Numerical & Mental Ability`, q: `Que. 70
X travels 5 km north, turns right and covers 7 km. He then turns right and travels 5 km. In which direction is he going?`, qi: ``, o: [`North`, `East`, `West`, `South`], oi: [``, ``, ``, ``], e: `` },
  { n: 71, s: `Numerical & Mental Ability`, q: `A statement is given below, followed by two conclusions- I and II. You have to consider the statement to be true even if it seems to be at variance with commonly known facts. You have to decide which of
the given conclusions, if any, follows from the given statements
Statement: Company ABC has marketed the product with the following slogan: "Go ahead; purchase it if the price and quality are your considerations".
Conclusion I: The price of the product must be high.
Conclusion II: The product must be of a good quality.`, qi: ``, o: [`Only conclusion l follows`, `Only conclusion II follows`, `Both I and Il follow`, `Neither I nor II follows Correct Option - 2`], oi: [``, ``, ``, ``], e: `` },
  { n: 72, s: `Numerical & Mental Ability`, q: `A statement is given below, followed by two arguments, 1 and 2. You have to consider the statement to be true even if it seems to be at variance with commonly known facts. You have to decide which of the
given arguments, if any, is strong and supports the given statements.
Statement: Should taxes be abolished in a developing country like India?
Arguments 1: No, taxes are a good source of Income for the government to take steps for the development of the country.
Arguments 2. Yes, these taxes are NOT used for the goodwill of the nation.`, qi: ``, o: [`Only 1 argument is strong`, `Only 2 argument is strong`, `Both argument 1 and 2 are strong`, `Neither arguments 1 nor 2 is strong`], oi: [``, ``, ``, ``], e: `` },
  { n: 73, s: `Numerical & Mental Ability`, q: `Two statement are given below, followed by three conclusions, I, II and III. You have to consider the statement to be true even if it seems to be at variance with commonly known facts. You have to decide
which of the given conclusions, if any, follows from the given statements.
Statement 1: Every man should have his identity card with him
Statement 2: That card should mention his blood group, complete address and telephone number for contact, in case of emergencies.
Conclusion I: Blood CANNOT be transfused until its group is mentioned in the card. Conclusion II: No one is supposed to forget his phone number under any circumstances Conclusion III: The police needs this information if the injury is fatal.`, qi: ``, o: [`Only conclusion I follows`, `Only conclusion Il follows`, `Only conclusion III follows`, `None of them follows`], oi: [``, ``, ``, ``], e: `` },
  { n: 74, s: `Numerical & Mental Ability`, q: `Which of the words CANNOT be formed by the letter of the word "CARABINER"?
Que. 74  Which of the words CANNOT be formed by the letter of the word "CARABINER"?`, qi: ``, o: [`Aerious`, `Materious`, `Imperious`, `Facetious Correct Option - 3`], oi: [``, ``, ``, ``], e: `` },
  { n: 75, s: `Numerical & Mental Ability`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 76, s: `Mental Aptitude / Reasoning`, q: `Select the option that is related to the third word on the same basis as the second word is related to the first word.
Birds : Chirp :: Bear : ?`, qi: ``, o: [`Growl`, `Gibber`, `Bleat`, `Grunt`], oi: [``, ``, ``, ``], e: `` },
  { n: 77, s: `Mental Aptitude / Reasoning`, q: `Which of the following cubes in the answer figure CANNOT be made on the basis of the unfolded cube in the question figure?
Que. 77 Which of the following cubes in the answer figure CANNOT be made on the basis of the unfolded cube in the question figure?`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 78, s: `Mental Aptitude / Reasoning`, q: `Read the following information to answer the given questions.
Following are the conditions for issuing a passport.
Que. 78  Read the following information to answer the given questions.
Following are the conditions for issuing a passport.`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 79, s: `Mental Aptitude / Reasoning`, q: `21-year-old Sam is married to Rita who is a citizen of the country. He has the required affidavit for a fresh passport. He has the unique identity cards both of himself as well as his wife.
Que. 79 21-year-old Sam is married to Rita who is a citizen of the country. He has the required affidavit for a fresh passport. He has the unique identity cards both of himself as well as his wife.`, qi: ``, o: [`Allot Passport`, `Reject Passport`, `Refer to head office`, `Data inadequate`], oi: [``, ``, ``, ``], e: `` },
  { n: 80, s: `Mental Aptitude / Reasoning`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 81, s: `Mental Aptitude / Reasoning`, q: `Which of the following answer figure patterns can complete the series given in the question figure?`, qi: ``, o: [`Allot Passport`, `Reject Passport`, `Refer to head office`, `Data inadequate`], oi: [``, ``, ``, ``], e: `` },
  { n: 82, s: `Mental Aptitude / Reasoning`, q: `Which of the following answer figure patterns can complete the series given in the question figure?
Que. 82  Which of the following answer figure patterns can complete the series given in the question figure?
1.`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 83, s: `Mental Aptitude / Reasoning`, q: `What is the minimum number of lines required to make the given image?`, qi: ``, o: [`Que. 83  What is the minimum number of lines required to make the given image?`, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 84, s: `Mental Aptitude / Reasoning`, q: `If a mirror is placed on the line MN, then which of the answer figures is the right image of the given figure?`, qi: ``, o: [`Que. 84  If a mirror is placed on the line MN, then which of the answer figures is the right image of the given figure?`, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 85, s: `Mental Aptitude / Reasoning`, q: `A piece of paper is folded and punched as shown below in the question figures. From the given answer figures, indicate how it will appear when opened.`, qi: ``, o: [`Que. 85 A piece of paper is folded and punched as shown below in the question figures. From the given answer figures, indicate how it will appear when opened.`, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 86, s: `Mental Aptitude / Reasoning`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 87, s: `Mental Aptitude / Reasoning`, q: `A series is given, with one word missing, Choose the correct alternative from the given ones that will complete the series.
Retina, National, Algebra, Radiator, ?`, qi: ``, o: [`Apparel`, `Military`, `Ordinary`, `Barometer Correct Option - 3`], oi: [``, ``, ``, ``], e: `` },
  { n: 88, s: `Mental Aptitude / Reasoning`, q: `A series is given, with one term missing, Choose the correct alternative from the given ones that will complete the series.
FED, HIJ, NML, PQR, VUT, ?
ZYX
WXY
XYZ
YXW
first.
preview; pretence; previous; prettier
preview
prettier
previous
pretence Correct Option - 4
Que. 87 A series is given, with one word missing, Choose the correct alternative from the given ones that will complete the series.
Retina, National, Algebra, Radiator, ?
Apparel
Military
Ordinary
Barometer Correct Option - 3
Que. 88 A series is given, with one term missing, Choose the correct alternative from the given ones that will complete the series.
FED, HIJ, NML, PQR, VUT, ?
ZYX`, qi: ``, o: [`WXY`, `XYZ`, `YXW`, `Que. 86  Arrange the following words as per their order in an English dictionary and choose the one that comes`], oi: [``, ``, ``, ``], e: `` },
  { n: 89, s: `Mental Aptitude / Reasoning`, q: `A series is given, with one word missing, Choose the correct alternative from the given ones that will complete the series.
EEEEEEEFF, EEEEEEFEF, EEEEEFEEF, EEEEFEEEF, EEEFEEEEF,?`, qi: ``, o: [`EEFEEEEF`, `EEEFEEEFE`, `EEFEEEEEF`, `EEEFEEEEEF`], oi: [``, ``, ``, ``], e: `` },
  { n: 90, s: `Mental Aptitude / Reasoning`, q: `A series is given, with one number missing. Choose the correct alternative from the given ones that will complete the series.
–6.2, –3.5, -0.8, ?, 4.6
1.1.9`, qi: ``, o: [`Wednesday`, `Sunday`, `Saturday`, `Thursday Correct Option - 3`], oi: [``, ``, ``, ``], e: `` },
  { n: 91, s: `Mental Aptitude / Reasoning`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 92, s: `Mental Aptitude / Reasoning`, q: `A series is given, with one term missing. Choose the correct alternative from the given ones that will complete the series.
A0F5, B1F6, D1G6, G2I7, ?`, qi: ``, o: [`L4LS`, `K3L8`, `K3M9`, `L4M9`], oi: [``, ``, ``, ``], e: `` },
  { n: 93, s: `Mental Aptitude / Reasoning`, q: `In a code language, 639 means 'water is drink' 316 means 'juice is drink' and 219 means 'water or juice'.
Find the code for 'or'.
Que. 93  In a code language, 639 means 'water is drink' 316 means 'juice is drink' and 219 means 'water or juice'.
Find the code for 'or'.`, qi: ``, o: [`1`, `2`, `9`, `3`], oi: [``, ``, ``, ``], e: `` },
  { n: 94, s: `Mental Aptitude / Reasoning`, q: `Que. 94`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 95, s: `Mental Aptitude / Reasoning`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 96, s: `Mental Aptitude / Reasoning`, q: `If HELIPAD is coded as JGNKRCF, then how will BUY be coded as?
Que. 96  If HELIPAD is coded as JGNKRCF, then how will BUY be coded as?`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 97, s: `Mental Aptitude / Reasoning`, q: `If A @ B means A is the grandson of B A # B means A is the wife of B and if A * B means A is the father of B, then what does X * Y @ Z # W mean, if Z has only 1 child?
Que. 97  If A @ B means A is the grandson of B A # B means A is the wife of B and if A * B means A is the father of B, then what does X * Y @ Z # W mean, if Z has only 1 child?
In a certain code. RICH is written as 4271 and SNOW is written as 8396. How is COIN written in that code?`, qi: ``, o: [`4547`, `9035`, `1901`, `7923`], oi: [``, ``, ``, ``], e: `` },
  { n: 98, s: `Mental Aptitude / Reasoning`, q: `If P % Q means P is the father of Q; P ! Q means P is the sister Q and P * Q means P is the daughter of Q, which of the following shows that I is the sister of K's husband?
Que. 98  If P % Q means P is the father of Q; P ! Q means P is the sister Q and P * Q means P is the daughter of Q, which of the following shows that I is the sister of K's husband?`, qi: ``, o: [`I % G ! H * K`, `I ! G % H * K`, `I ! G * H % K`, `I % G * H ! K`], oi: [``, ``, ``, ``], e: `` },
  { n: 99, s: `Mental Aptitude / Reasoning`, q: `M said to N. "You are my daughter's father's mother's son." How is N related M if M is female?
Que. 99  M said to N. "You are my daughter's father's mother's son." How is N related M if M is female?`, qi: ``, o: [`N is the brother of M's husband`, `N is the father of M`, `N is the father-in-law of M`, `N is the son of M`], oi: [``, ``, ``, ``], e: `` },
  { n: 100, s: `Mental Aptitude / Reasoning`, q: `In the following figure, the square represents accountants, the triangle represents artists, the circle represents planners and the rectangle represents men. Which set of letters represents men who are
artists?`, qi: ``, o: [`GH`, `GAF`, `AB`, `AC`], oi: [``, ``, ``, ``], e: `` },
  { n: 101, s: `Mental Aptitude / Reasoning`, q: `Which of the following Venn diagrams best represents the relationship between Rajasthan, India and Asia?`, qi: ``, o: [`Que. 101 Which of the following Venn diagrams best represents the relationship between Rajasthan, India and Asia?`, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 102, s: `Mental Aptitude / Reasoning`, q: `Student enrolls for a 6 test series to for an entrance exam. He plots progress as a line`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 103, s: `Mental Aptitude / Reasoning`, q: `The bar graph shows GDP for the year 2017, in billion USD, of six countries which have united to form a free trade block, GDP of which country constitutes 1/5th of the total GDP of these 6 countries?
Que. 103  The bar graph shows GDP for the year 2017, in billion USD, of six countries which have united to form a free trade block, GDP of which country constitutes 1/5th of the total GDP of these 6 countries?`, qi: ``, o: [`A`, `E`, `F`, `C`], oi: [``, ``, ``, ``], e: `` },
  { n: 104, s: `Mental Aptitude / Reasoning`, q: `Alloy 1 and alloy 2 are prepared by mixing metals A, B, C and D. The pie charts show the proportions of these metals in the two alloys.
If 1 kg of alloy 1 and 2 kg of alloy 2 is melted and mixed, then the resulting alloy will contain what mass of metal B?`, qi: ``, o: [`700 g`, `500 g`, `70 g`, `50 g`], oi: [``, ``, ``, ``], e: `` },
  { n: 105, s: `Mental Aptitude / Reasoning`, q: `Which word does NOT belong with the others?
Que. 105  Which word does NOT belong with the others?`, qi: ``, o: [`Blue`, `Green`, `Paint`, `Yellow`], oi: [``, ``, ``, ``], e: `` },
  { n: 106, s: `Mental Aptitude / Reasoning`, q: `Find the odd letters from the given alternatives.
Que. 106  Find the odd letters from the given alternatives.`, qi: ``, o: [`GEC`, `IKM`, `OQS`, `VXZ`], oi: [``, ``, ``, ``], e: `` },
  { n: 107, s: `Mental Aptitude / Reasoning`, q: `Four figures have been given, out of which three are alike in some manner and one is different. Select the one that is different.
Que. 107 Four figures have been given, out of which three are alike in some manner and one is different. Select the one that is different.`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 108, s: `Mental Aptitude / Reasoning`, q: `Four figures have been given, out of which three are alike in some manner and one is different. Select the one that is different.
Que. 108 Four figures have been given, out of which three are alike in some manner and one is different. Select the one that is different.
1.
2.`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 109, s: `Mental Aptitude / Reasoning`, q: `Select the alternative that is related to the third term in the same way as the second term is related to the first term.
Necklace : Jewellery :: Pen : ?`, qi: ``, o: [`Paper`, `Stationery`, `Writing`, `Book Correct Option - 2`], oi: [``, ``, ``, ``], e: `` },
  { n: 110, s: `Mental Aptitude / Reasoning`, q: `Select the alternative that is related to the third term in the same way as the second term is related to the first term.
196 : 169 :: 2744 : ?`, qi: ``, o: [`4277`, `2197`, `2977`, `4192`], oi: [``, ``, ``, ``], e: `` },
  { n: 111, s: `Mental Aptitude / Reasoning`, q: `From the given answer figures, select the one in which the question figure is hidden embedded.
Que. 111  From the given answer figures, select the one in which the question figure is hidden embedded.
1.
4.`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 112, s: `Mental Aptitude / Reasoning`, q: `Which answer figure compare are pattern in the question figure?
Que. 112  Which answer figure compare are pattern in the question figure?`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 113, s: `Mental Aptitude / Reasoning`, q: `Which of the following answer figure patterns can be combined to make the question figure?`, qi: ``, o: [`Que. 113  Which of the following answer figure patterns can be combined to make the question figure?`, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 114, s: `General Hindi`, q: `म चार िवक ों म से, उस का चयन कर जो िनद´शानुसार प रवत न वाला सही िवक  है। ब ो ने खेल खेला। (भिव काल)`, qi: ``, o: [`ब े खेल, खेल चुके`, `ब े खेल रहे है`, `ब े खेल चुके होगे`, `ब े खेल खेल गे`], oi: [``, ``, ``, ``], e: `` },
  { n: 115, s: `General Hindi`, q: `िन िलिखत  म चार िवक  िदए गए है िजनम से उस िवक  का चयन कर जो िदए गए श  का सही
™ीिलंग श  है।
राजपूत`, qi: ``, o: [`राजपूतानी`, `रजपूताई`, `राजपूतरीन`, `राजपूती`], oi: [``, ``, ``, ``], e: `` },
  { n: 116, s: `General Hindi`, q: `िन िलिखत  म चार िवक  िदए गए ह िजनमे से उस िवक  का चयन कर जो िदए गए श  का सही
™ीिलंग श  है।
तप4ी
1.तपि4नी`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 117, s: `General Hindi`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 118, s: `General Hindi`, q: `Que. 118`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 119, s: `General Hindi`, q: `Que. 119
2.तप4ीिन
3.तप4ीन
4.तप4ीं
तलवार`, qi: ``, o: [``, ``, ``, `तलवार तलवारों तलवार तलवारे`], oi: [``, ``, ``, ``], e: `` },
  { n: 120, s: `General Hindi`, q: `Que. 120
ेम - ार
सुख - दुः ख
4ण - सोना`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 121, s: `General Hindi`, q: `Que. 121
सव नाम वाले वा  ों म िलंग का पता िकससे चलता है?`, qi: ``, o: [`ि या`, `कम`, `कता`, `वचन`], oi: [``, ``, ``, ``], e: `` },
  { n: 122, s: `General Hindi`, q: `Que. 122`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 123, s: `General Hindi`, q: `Que. 123`, qi: ``, o: [``, ``, ``, `पhावत रस िवलास िवyानगीता ृंगार लहरी`], oi: [``, ``, ``, ``], e: `` },
  { n: 124, s: `General Hindi`, q: `नीचे दी गई रचनाएँ िकस किव की ह ?
िचदंबरा / उKरा / काला और बूढ़ा चाँद / पWव`, qi: ``, o: [``, ``, ``, `सुिम ानंदन प अyेय केदारनाथ िसंह सुभ5ा कुमारी चौहान 1. 2. 3. 4. पhावत रस िवलास िवyानगीता ृंगार लहरी`], oi: [``, ``, ``, ``], e: `` },
  { n: 125, s: `General Hindi`, q: `सव´ र दयाल स ेना को िकस रचना के िलए सािहw अकादमी पुर ार िदया गया था?
Que. 125
सव´ र दयाल स ेना को िकस रचना के िलए सािहw अकादमी पुर ार िदया गया था?`, qi: ``, o: [`खूिटयों पर टंगे लोग`, `जंगल का दद`, `ा कह कर पुकाVँ`, `गम हवाएँ`], oi: [``, ``, ``, ``], e: `` },
  { n: 126, s: `General Hindi`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 127, s: `General Hindi`, q: `Que. 127`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 128, s: `General Hindi`, q: `Que. 128
आपसी झगडा
संयु4 आ  मण
आपसी फूट`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 129, s: `General Hindi`, q: `Que. 129
िवजयनगर के भVाशेष कैसी 74ावलीबीच फैले है?`, qi: ``, o: [`जनशू`, `भीड़भाड़`, `सघन`, `ह रयाली`], oi: [``, ``, ``, ``], e: `` },
  { n: 130, s: `General Hindi`, q: `Que. 130`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 131, s: `General Hindi`, q: `िन िलिखत  म चार िवक ों म से, उस सही िवक  का चयन कर जो िदए गए पB के उिचत अलंकार Vप का सबसे अ ा िवक  हैI
काली घटा का घमंड घटा`, qi: ``, o: [`यमक अलंकार`, `अित4ोि4 अलंकार`, `उ  े ा अलंकार`, `उमपा अलंकार`], oi: [``, ``, ``, ``], e: `` },
  { n: 132, s: `General Hindi`, q: `िन िलिखत  म चार िवक  ों म से उस सही िवक  का चयन कर जो रेखांिकत श  ों के सही-अDय के भेद हो
दरवाजे के बाहर कोई खड़ा है।`, qi: ``, o: [`समु य बोधक अDय`, `िव4यािदबोधक अDय`, `संबंधबोधक अDय`, `िनपात`], oi: [``, ``, ``, ``], e: `` },
  { n: 133, s: `General Hindi`, q: `िन िलिखत  म चार िवक ों म से, उस सही िवक  का चयन करे जो अशु5 वा  के शु5 Vप का सबसे अ ा िवक  है।
म ˙ने गाँव जाना है।`, qi: ``, o: [`म गाँव जाना है।`, `मुझे गाँव जाना है।`, `मैको गाँव जाना है।`, `मेरे को गाँव जाना है।`], oi: [``, ``, ``, ``], e: `` },
  { n: 134, s: `General Hindi`, q: `Que. 134`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 135, s: `General Hindi`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 136, s: `General Hindi`, q: `Que. 136`, qi: ``, o: [``, ``, ``, `Dंजन चरण मा ा वण`], oi: [``, ``, ``, ``], e: `` },
  { n: 137, s: `General Hindi`, q: `िन िलिखत  म , चार िवक ों म से, उस सही िवक  का चयन कर जो िनद´शानुसार वा  प रवत न वाला सही िवक है।
आप इस िकताब को पढ़े है? (कम वा  )`, qi: ``, o: [`इस िकताब को आप के ारा पढ़ा गया है`, `ा आपने इस िकताब को पढ़ा`, `यह िकताब आपके ारा पढी गई`, `आपने यह िकताब पढ़ी`], oi: [``, ``, ``, ``], e: `` },
  { n: 138, s: `General Hindi`, q: `िकसी के ारा कहे गए वचन को  ों का wों िलखने के िलए िकस िच5 का  योग िकया जाता है?
Que. 138
िकसी के ारा कहे गए वचन को  ों का wों िलखने के िलए िकस िच5 का  योग िकया जाता है?`, qi: ``, o: [`योजक`, `उ5रण`, `अ  िवराम`, `अध िवराम`], oi: [``, ``, ``, ``], e: `` },
  { n: 139, s: `General Hindi`, q: `िनƠिलिखत  म , चर िवक ों म से िदए गए वो सही समास वाला िवक  पहचािनयेI चं5शेखर`, qi: ``, o: [`च  : है िशखर पर िजसके`, `च  : है िजसका नाम`, `च  के समान है जो`, `च  के जैसा है जो`], oi: [``, ``, ``, ``], e: `` },
  { n: 140, s: `General Hindi`, q: `िन िलिखत  म चार िवक  िदए गए ह िजनम से उस िवक  का चयन कर जो श  / वा  का सबसे सही
'एक श  ' िवक  है।
िजसका उTाह न हो गया हो`, qi: ``, o: [`उTाही`, `उBमी`, `हतोTािहत`, `िजyासु`], oi: [``, ``, ``, ``], e: `` },
  { n: 141, s: `General Hindi`, q: `िन िलिखत  म , चार िवक  िदए गए है िजनम से एक श  िदए गए अनेकाथT श  का एक अथ है। उस श को चुन ।
जलज`, qi: ``, o: [``, ``, ``, `जहाज मछली धतुर हाथी`], oi: [``, ``, ``, ``], e: `` },
  { n: 142, s: `General Hindi`, q: `िन िलिखत  म , चार िवक ों म से, उस सही िवक  का चयन कर जो िन वा  का पूव कािलक ि या प रवत न वा  बताता है।
ब  ों ने गृहकाय िकया। वे खेलने लग गए।
2.`, qi: ``, o: [``, ``, `ब े गृहकाय के िबना खेलने गए ब े गृहकाय करके खेलने लगे`, `ब  ों ने गृहकाय िकया और खेलने गए`], oi: [``, ``, ``, ``], e: `` },
  { n: 143, s: `General Hindi`, q: `िन िलिखत  म , चार िवक  ों म से रेखांिकत पद के उिचत कारक को पहचािनये।
हे  भु! र ा कीिजये।`, qi: ``, o: [``, ``, ``, `स ोधन कारक अिधकरण कारक स कारक कम कारक`], oi: [``, ``, ``, ``], e: `` },
  { n: 144, s: `General Hindi`, q: `िन िलिखत  म , चार िवक  िदए गए ह , िजनम से उस िवक  का चयन कर जो श  का सबसे अ ा
िवक  है।
पतन`, qi: ``, o: [``, ``, ``, `पKा िगरना पु घर`], oi: [``, ``, ``, ``], e: `` },
  { n: 145, s: `General Hindi`, q: `िन िलिखत  म चार िवक  ों म से, उस िवक  का चयन कर जो िदए गए श  का सही समान अथ वाला श है।
नाश`, qi: ``, o: [``, ``, ``, `तबाही उ ष उ ान नवीन`], oi: [``, ``, ``, ``], e: `` },
  { n: 146, s: `General Hindi`, q: `िन िलिखत  म , चार िवक  ों म से, उस िवक  का चयन कर जो सही िवक  है। उपस ग श  के म लगते ह ।`, qi: ``, o: [`अंत`, `आरंभ`, `ि या`, `आठ`], oi: [``, ``, ``, ``], e: `` },
  { n: 147, s: `General Hindi`, q: `Que. 147`, qi: ``, o: [`गाल`, `कबूतर`, `काम`, `काज`], oi: [``, ``, ``, ``], e: `` },
  { n: 148, s: `General Hindi`, q: `Que. 148`, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 149, s: `General Hindi`, q: `िन िलिखत  म , चार िवक  ों म से उस िवक  का चयन कर जो सही संिध-िव  ेद वाला िवक  है। उWास`, qi: ``, o: [`उत् + लास`, `उल + लास`, `उW + आस`, `उल + आलास`], oi: [``, ``, ``, ``], e: `` },
  { n: 150, s: `General Hindi`, q: `िन िलिखत  म , चार िवक  ों म से िदए गए श  के िवपरीत अथ वाला िवक  चुिनए। संयोग`, qi: ``, o: [`िवयोग`, `अवशेष`, `दु पयोग`, `िमलन`], oi: [``, ``, ``, ``], e: `` }
];

if (RAW.length !== 150) { console.error(`Expected 150, got ${RAW.length}`); process.exit(1); }
if (KEY.length !== 150) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const uploadCache = new Map();
async function uploadImage(fileName, publicId) {
  if (!fileName) return '';
  if (uploadCache.has(fileName)) return uploadCache.get(fileName);
  const localPath = path.join(EXTRACTED_DIR, fileName);
  if (!fs.existsSync(localPath)) {
    console.log(`  [missing] ${fileName}`);
    uploadCache.set(fileName, '');
    return '';
  }
  try {
    const res = await cloudinary.uploader.upload(localPath, {
      folder: CLOUDINARY_FOLDER, public_id: publicId, overwrite: true, resource_type: 'image'
    });
    uploadCache.set(fileName, res.secure_url);
    return res.secure_url;
  } catch (err) {
    console.error(`  [upload failed] ${fileName}: ${err.message}`);
    uploadCache.set(fileName, '');
    return '';
  }
}

async function buildQuestions() {
  const questions = [];
  for (let i = 0; i < RAW.length; i++) {
    const r = RAW[i];
    const n = r.n;
    let qImage = '';
    let optImages = ['', '', '', ''];
    if (r.qi) {
      process.stdout.write(`Q${n} q-img... `);
      qImage = await uploadImage(r.qi, `${F}-q-${n}`);
      console.log(qImage ? 'ok' : 'missing');
    }
    for (let oi = 0; oi < 4; oi++) {
      if (r.oi[oi]) {
        process.stdout.write(`  Q${n} opt-${oi+1}-img... `);
        optImages[oi] = await uploadImage(r.oi[oi], `${F}-q-${n}-option-${oi+1}`);
        console.log(optImages[oi] ? 'ok' : 'missing');
      }
    }
    questions.push({
      questionText: r.q || '(Question text unavailable — see image)',
      questionImage: qImage,
      options: r.o.map(o => o || '(image option)'),
      optionImages: optImages,
      correctAnswerIndex: KEY[i] - 1,
      explanation: r.e || '',
      section: r.s,
      tags: ['UP Police', 'Constable', 'PYQ', '2019', 'Shift-2'],
      difficulty: 'medium'
    });
  }
  return questions;
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  // UP Police Constable is a State exam — reuse the existing 'State' ExamCategory
  // (per feedback_examcategory_reuse: never create per-state categories).
  let category = await ExamCategory.findOne({ name: 'State', type: 'State' });
  if (!category) {
    category = await ExamCategory.create({ name: 'State', type: 'State', description: 'State government competitive exams' });
  }

  let exam = await Exam.findOne({ code: 'UP-POLICE-CON' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'UP Police Constable',
      code: 'UP-POLICE-CON',
      description: 'Uttar Pradesh Police Recruitment & Promotion Board - Constable Direct Recruitment Examination',
      isActive: true
    });
    console.log('Created Exam: UP-POLICE-CON');
  }

  const PATTERN_TITLE = 'UP Police Constable';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 120, totalMarks: 300, negativeMarking: 0.5,
      sections: [
        { name: GK,  totalQuestions: 38, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: HIN, totalQuestions: 37, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: NUM, totalQuestions: 38, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: REA, totalQuestions: 37, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
    console.log('Created ExamPattern: UP Police Constable');
  }

  const TEST_TITLE = `UP Police Constable - 28 January 2019 Shift-2`;
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 300, duration: 120,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2019, pyqShift: `Shift-2`,
    pyqExamName: 'UP Police Constable', questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
