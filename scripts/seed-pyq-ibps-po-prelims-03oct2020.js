/**
 * Seed: IBPS PO Prelims - 03 October 2020
 * IBPS PO Prelims — Probationary Officer Preliminary Exam.
 * 100 Q × 1 mark, 3 sections (Eng 30 / Reas 35 / Quant 35), 60 min total,
 * sectional timing 20 min each, 0.25 negative marking.
 * Uploads question/option images from local _extracted_ibps_po_03oct2020/ to Cloudinary.
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

const EXTRACTED_DIR = path.resolve(__dirname, '../_extracted_ibps_po_03oct2020');
const CLOUDINARY_FOLDER = 'aajexam/pyq/ibps-po-prelims-03oct2020';
const F = '03oct2020';

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

const ENG = 'English Language';
const REA = 'Reasoning Ability';
const QA  = 'Quantitative Aptitude';

const KEY = [2, 3, 5, 4, 4, 4, 1, 1, 4, 3, 2, 2, 3, 4, 3, 3, 1, 2, 2, 2, 1, 1, 4, 1, 4, 2, 3, 2, 4, 3, 2, 4, 5, 2, 1, 4, 2, 3, 1, 4, 2, 5, 3, 1, 3, 4, 5, 4, 5, 1, 1, 3, 4, 3, 5, 2, 3, 4, 3, 2, 4, 5, 2, 5, 1, 3, 4, 4, 2, 5, 1, 4, 2, 1, 4, 1, 3, 5, 3, 2, 4, 5, 4, 2, 4, 5, 1, 4, 3, 1, 1, 5, 5, 2, 4, 2, 2, 5, 4, 2];
const RAW = [
  { n: 1, s: `English Language`, q: `The question below contains five scattered segments of a sequence. Indicate the sequence which correctly assembles the segments and completes the sentence.
recognise anyone
the company has
of staff that I hardly
from week to week
such a high turnover`, qi: ``, o: [`ADBCE`, `BECAD`, `DECAB`, `ADBEC`, `BECDA`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 2, s: `English Language`, q: `The question below contains five scattered segments of a sequence. Indicate the sequence which correctly assembles the segments and completes the sentence.
and I felt that my
clearly from a distance
my inability to see
both the men
slow pace was because of`, qi: ``, o: [`CBDAE`, `BDAEC`, `DAECB`, `AECBD`, `CBDEA`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 3, s: `English Language`, q: `The question below contains five scattered segments of a sequence. Indicate the sequence which correctly assembles the segments and completes the sentence.
I had to be careful
case they went off
unexploded bombs in
when I was in the army,
not to tread on`, qi: ``, o: [`DAEBC`, `AEDBC`, `BADEC`, `CBAED`, `DAECB`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 4, s: `English Language`, q: `The question below contains five scattered segments of a sequence. Indicate the sequence which correctly assembles the segments and completes the sentence.
gather our thoughts
the relentless stress
we all need time to
of our daily lives
and escape from`, qi: ``, o: [`BAEDC`, `ADEBC`, `DBEAC`, `CAEBD`, `BAECD`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 5, s: `English Language`, q: `In each of the questions given below, three words are given in bold. These three words may or may not be in their correct position. The sentence is then followed by options with the correct combination of words that should replace each other in order to make the sentence grammatically and
contextually correct. Find the correct combination of words that replace each other. If the sentence is correct as it is, select ‘5’ as your option.
The curfew (A) was flooded (B) with people after the beach (C) was lifted.`, qi: ``, o: [`A-B and B-C`, `B-A and A-C`, `C-B`, `C-A`, `No Rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 6, s: `English Language`, q: `In the following question, a sentence is given with three words marked as (A), (B) and (C). These words may or may not be placed in their correct order. Four options with different arrangements
of these words have been provided. Mark the option with the correct arrangement as the answer. If no rearrangement is required, mark option (5) as your answer.
The man wanted to morality (A) brother's death (B) but his avenge (C) wouldn't allow it.`, qi: ``, o: [`A-B`, `B-C and A-B`, `B-C and C-A`, `A-C`, `No Rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 7, s: `English Language`, q: `In the following question, a sentence is given with three words marked as (A), (B) and (C). These words may or may not be placed in their correct order. Four options with different arrangements
of these words have been provided. Mark the option with the correct arrangement as the answer. If no rearrangement is required, mark option (5) as your answer.
The murder (A) was supposed to completely guarded (B) when the museum(C) occurred.`, qi: ``, o: [`A-C`, `C-B and B-A`, `A-C and C-B`, `B-C`, `No Rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 8, s: `English Language`, q: `In the following question, a sentence is given with three words marked as (A), (B) and (C). These words may or may not be placed in their correct order. Four options with different arrangements
of these words have been provided. Mark the option with the correct arrangement as the answer. If no rearrangement is required, mark option (5) as your answer.
The kidnapping (A) was supposed to be completely safeguarded (B) when the victim (C) occurred.`, qi: ``, o: [`A-C`, `C-B and B-A`, `A-C and C-B`, `B-C`, `No Rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 9, s: `English Language`, q: `Direction: In the following question, a sentence is given with four words marked as (A), (B), (C) and (D). These words may or may not be placed in their correct order. Four options with different
arrangements of these words have been provided. Mark the option with the correct arrangement as the answer. If no rearrangement is required, mark option (5) as your answer.
The task force was supply (A) with the task (B) of catching the big fish who was forcing (C) drug dealers to assigned (D) the new drug.`, qi: ``, o: [`B-A`, `C-B`, `D-C`, `A-D`, `No Rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 10, s: `English Language`, q: `In the following passage, some of the words have been left out. Read the passage carefully and select the correct answer for the given blank out of the given alternative.
Today, petroleum is found in vast underground reservoirs where ancient seas were located. Petroleum reservoirs can be found beneath land or the ocean floor. Their crude oil is extracted with giant drilling machines. Petroleum is used to make gasoline, an important product in our everyday lives. Gasoline is also used in a spark-ignition engine. After 	(1)	the fuel, you will see the production of a large amount of energy which happens when the 	(2)		increases the temperature of the fuel. This temperature at which the fuel catches fire has a
(3)	value for every kind of fuel. Crude oil is usually black or dark brown, but can also be yellowish, reddish, tan, or even greenish. Colour variations indicate the distinct chemical compositions of different supplies of crude oil.
In order to 	(4)	the smooth and uninterrupted flow of gasoline to the end-users, it is imperative for the field operators, pipeline engineers, and designers to be conscious of the corrosiveness of gasoline as the lines and their component fittings would 	(5)	material degradations due to corrosion.
The consequence of corrosion in the oil and gas industry cannot be ignored due to the damage caused to equipment and structures, and the huge cost of controlling it. Some case studies on the crude distillation overhead system, the economic cost of corrosion within the oil and gas industry, and the factors responsible for corrosion in crude distillation overhead system are discussed. Corrosion has been a major challenge in the oil and gas industry, 	(6)	in the crude distillation overhead system where the metallic structure used for construction and equipment are majorly affected by corrosion. However, to minimize corrosion costs in the oil and gas industry, the application of corrosion inhibitors and appropriate material selection is of utmost importance as stated in this report.
Which of the following word fits the blank labelled as (1)?`, qi: ``, o: [`Fire`, `Critiquing`, `Igniting`, `Reviewing`, `Describing`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 11, s: `English Language`, q: `Which of the following word fits the blank labelled as (2)?`, qi: ``, o: [`Oil`, `Fire`, `Gasoline`, `Lighter`, `Ignite`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 12, s: `English Language`, q: `Which of the following word fits the blank labelled as (3)?`, qi: ``, o: [`Unspecific`, `Particular`, `Indefinite`, `Excessive`, `Exorbitant`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 13, s: `English Language`, q: `Which of the following word fits the blank labelled as (4)?`, qi: ``, o: [`Assume`, `Censure`, `Ensure`, `Denote`, `Prescribe`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 14, s: `English Language`, q: `Which of the following word fits the blank labelled as (5)?`, qi: ``, o: [`Deny`, `Emanate`, `Enlarge`, `Undergo`, `Resist`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 15, s: `English Language`, q: `Which of the following word fits the blank labelled as (6)?`, qi: ``, o: [`Briskly`, `Anxiously`, `Especially`, `Extremely`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 16, s: `English Language`, q: `Find out which sentence is grammatically incorrect, and choose the correct option. If there is no error, mark ‘No error’ as your answer.
A study conducted in five state shows that the two-child norm was responsible for the largest number of disqualified candidates in panchayat elections.
Of these, Dalits, Adivasis, and OBCs formed an overwhelming 80 percentages of the population.
This contravenes the 73rd amendment, which aims to give political representation to people from marginalised communities in democratic processes.`, qi: ``, o: [`Only A`, `Only B`, `A and B`, `B and C`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 17, s: `English Language`, q: `In the question given below, three sentences are given and are named as- A, B and C. You have to determine which sentence/s contains error and mark the appropriate
option.
Early childhood education is suppose to prepare children for school.
We ought to have realise by now that an inclusive ethos is too deeply ingrained in the Indian mind.
A lot would also depend on the fiscal arithmetic that would emerge from the budget to be presented on February 1.`, qi: ``, o: [`A and B`, `A Only`, `B Only`, `A and C`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 18, s: `English Language`, q: `Que. 18
Que. 18
Que. 18
In the question given below, three sentences are given and are named as- A, B and C. You have to determine which sentence/s contains error(s) and mark the appropriate option.
Once we take into account all these factors — age distribution in grade one, home factors such as affluence, mother’s education, home learning environment, and some baseline abilities that children enter grade one with, private schools still have a learning advantage.
In some States, elections to urban local bodies have not been held since years, defeating the lofty goal of decentralised governance.
A lot of time has been lost, as recalcitrant State leaders, who often have remote rural bases of support, stymie the pace of orderly urban development.`, qi: ``, o: [`Only A`, `Only B`, `A and C`, `A and B`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 19, s: `English Language`, q: `In the question given below, three sentences are given and are named as- A, B and C. You have to determine which sentence/s contains error and mark the appropriate option.
A .The PM said, “Our government is working tirelessly to reach the last person in the society and to bring the fruit of governance and development to him”.
B. The prime minister said his government’s policy was aimed to take the government’s programmes to last person in the queue in line with Mahatama Gandhi’s philosophy.
C. Prime Minister said his government was unlocking the heritage tourism potential in India through the development of the Ganga ghats in Varanasi and Kashi Vishwanath Dham project.`, qi: ``, o: [`Only A`, `A and B`, `B and C`, `A and C`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 20, s: `English Language`, q: `Which of the phrases 1, 2, 3 and 4 given below should replace the phrase given in bold in the following sentence to make the sentence grammatically correct? If the sentence is correct, as it
is and ‘No correction is required’, mark 5 as the answer.
We admire his attempting to climb the summit in such bad weather.`, qi: ``, o: [`his attempting to climb`, `his attempt of climbing`, `him for attempt of climb`, `his for attempt to climbing`, `No correction required`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 21, s: `English Language`, q: `Directions: Which of the following phrases at 1, 2, 3, and 4 given below should replace the phrase given in bold in the following sentence to make the sentence grammatically meaningful and
correct. If the sentence is 'correct' as it is and 'NO correction required' mark 5 as the answer.
If the evidence bear out the charge, he may be sentenced to death.`, qi: ``, o: [`bears out`, `bore out`, `was born out`, `has born out`, `No correction required`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 22, s: `English Language`, q: `Directions: Which of the following phrases (1), (2), (3), (4) given below in the statement should replace the phrase printed in bold in the sentence to make it grammatically correct? If the
sentence is correct as it is given and ‘No Correction is required’, mark (5) as the answer.
Harry always had a disregard for rules and rarely abided to them.`, qi: ``, o: [`Abided by them`, `Abide to them`, `Abided for them`, `Abided with them.`, `No correction`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 23, s: `English Language`, q: `Read the given passage and answer the questions that follow.
Online education has seen a massive boost in India since the lockdown. Almost every other online platform has opened up its content for free making it accessible for all students. Even in a challenging environment, education startup is expected to remain a very hot sector of VC investment, said a KPMG report. As much as a month before the coronavirus lockdown was announced, schools and colleges across India were already shut as a precautionary measure to stop the virus from spreading. As the date for reopening kept getting extended, schools and colleges in India realized they needed to switch their models of teaching in order to continue the education of students and so, they went online. Both the teachers as well as the students found it quite difficult to get used to online classes in the beginning but now they have become comfortable with it.
Education technology startups are seeing their numbers grow by the minute. Although it is true that owing to the unavailability of resources, the divide between rich and poor is growing. However, it is also true that online education has made the gap between education and learners narrow. This is because the existent technology had already enabled the online education sector ripe for development. Moreover, education is the most important factor if we want to drive India’s growth in the economic sector. There’s also growing attention being put toward offering media and technology-driven specialized courses to help students become more attuned to the Internet, and have greater opportunities for learning. The ability to offer better and more reliable access for students across the board—there’s a growing focus on how technology is perceived and used by students, both in the classroom and at home. Standardized testing programs are also making large shifts to online platforms, and children who have had minimal exposure to online technology will likely struggle and need more time for these tests, than students who have had adequate prior digital experience. As Internet access for lower-income families expands, the available devices and support for those devices—networks, software, and assistance programs—must be maintained. Technology enables students of any background to improve their education, and all levels of the educational process need to improve how learning happens in America.
Which of the following words is the closest in meaning to the word ‘drive‘ as given in the passage?`, qi: ``, o: [`Take`, `Believe`, `Forward`, `Propel`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 24, s: `English Language`, q: `What could be the title of the passage?`, qi: ``, o: [`Education Startups in India`, `Divide Between the Rich and the Poor`, `Indian Economy and Education`, `Economic Devel0pment`, `Indian and American Education`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 25, s: `English Language`, q: `Which of the following is TRUE according to the given passage?`, qi: ``, o: [`Education has become expensive because of education startups.`, `The poor have all the resources they need for online education.`, `Teachers in India do not know how to use the internet.`, `Education technology startups are growing at a fast rate.`, `None of these.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 26, s: `English Language`, q: `Which of the following words is the most opposite in meaning to the word ‘divide‘?`, qi: ``, o: [`Proportion`, `Amalgamate`, `Ratio`, `Multiply`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 27, s: `English Language`, q: `What has made the gap between education and learners narrow?`, qi: ``, o: [`Startups`, `Prime Minster's schemes`, `Online education`, `Teachers`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 28, s: `English Language`, q: `What caused schools and colleges to shut down?`, qi: ``, o: [`Lockdown`, `Threat of spreading of Coronavirus.`, `Both 1 and 2`, `Pressure of education on students.`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 29, s: `English Language`, q: `What are the devices for which availability and support should be maintained?`, qi: ``, o: [`Network and Software Programs`, `Network and AssistancePrograms`, `Assistance and Software Programs`, `Network, Software and Assistance Programs`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 30, s: `English Language`, q: `What is the most important factor for India's economic growth?`, qi: ``, o: [`Internal security`, `Competition with China.`, `Education`, `Online startups`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 31, s: `Quantitative Aptitude`, q: `What approximate value should come in the place of question mark (?) in the following question?
263.99 ÷ (35.05 + 8.08 – 31.99) = ?`, qi: ``, o: [`22`, `24`, `34`, `18`, `28`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 32, s: `Quantitative Aptitude`, q: `What approximate value should come in the place of question mark (?) in the following question?
24.96% of 299.99 + 44.98% of 399.99 = ?`, qi: ``, o: [`245`, `225`, `235`, `255`, `265`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 33, s: `Quantitative Aptitude`, q: `What approximate value should come in the place of question mark (?) in the following question?
119.99 - {64.95 + 119.99 ÷ 3.99} = ?2`, qi: ``, o: [`15`, `10`, `8`, `7`, `5`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 34, s: `Quantitative Aptitude`, q: `What approximate value should come in the place of question mark (?) in the following question?
√255.95 + 14.99 × 2.99 = ? + 11.11`, qi: ``, o: [`40`, `50`, `60`, `55`, `45`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 35, s: `Quantitative Aptitude`, q: `What approximate value should come in the place of question mark (?) in the following question?
∛27.27 + 12.99 - 14.99% of 79.98 = ?`, qi: ``, o: [`4`, `2`, `-2`, `8`, `-4`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 36, s: `Quantitative Aptitude`, q: `A and B can do a work in 12 days, B and C can do the same work in 15 days, and C and A can do the same work in 20 days. A, B and C will complete the work together in:`, qi: ``, o: [`20 days`, `28 days`, `12 days`, `10 days`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 37, s: `Quantitative Aptitude`, q: `The sum of Ajay’s and Vijay’s age is 40 years. 10 years later the ratio of their ages will be 5 : 7 respectively. What was the ratio of their ages 10 years before?`, qi: ``, o: [`3 : 1`, `1 : 3`, `2 : 3`, `3 : 2`, `3 : 7`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 38, s: `Quantitative Aptitude`, q: `Que. 38
Que. 38
Que. 38
A sum of Rs. 15000 is divided into two parts. The first part is invested at 8% per annum, while the other part is invested at 12% per annum. The interest in both cases is calculated on the principle of simple interest, and is found to be same at the end of 2 years. What are the two parts in which money was divided?`, qi: ``, o: [`Rs. 7500 each`, `Rs. 7000 and Rs. 8000`, `Rs. 9000 and Rs. 6000`, `Rs. 5000 and Rs. 10000`, `Cannot be determined`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 39, s: `Quantitative Aptitude`, q: `A, B and C enters into a partnership. A invests thrice as much as B invests while B invests twice the investments of C. At the end of the year they received a total profit of Rs. 90000. Then find the share
of A in profit.`, qi: ``, o: [`Rs. 60000`, `Rs. 65000`, `Rs. 36000`, `Rs. 30000`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 40, s: `Quantitative Aptitude`, q: `Length and breadth of a rectangular field is 130 m and 90 m, respectively. Inside it, a road of uniform width 15 m is left on all the sides. In the remaining part, a park is made. What is the area of the road?`, qi: ``, o: [`5500 m2`, `5800 m2`, `5600 m2`, `5700 m2`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 41, s: `Quantitative Aptitude`, q: `Directions: Read the Line graph carefully and answer the following questions:
The following Line graph shows the number of Elephants in two different Zoo in five years.

Find the difference between the total number of Elephants in both the zoo in 2003 and 2005.`, qi: `image1.png`, o: [`2`, `4`, `8`, `6`, `5`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 42, s: `Quantitative Aptitude`, q: `Find the ratio between the number of Elephants in Zoo A in the year 2001 and 2002 together to the number of Elephants in Zoo B in the year 2003 and 2004 together.`, qi: `image1.png`, o: [`2 : 1`, `1 : 2`, `3 : 2`, `2 : 3`, `1 : 1`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 43, s: `Quantitative Aptitude`, q: `The number of Elephants in Zoo A in the year 2001 is what percent of the number of Elephants in Zoo B in the year 2004?`, qi: `image1.png`, o: [`40%`, `33.33%`, `60%`, `50%`, `66.67%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 44, s: `Quantitative Aptitude`, q: `What is the average number of Elephants in Zoo B in the given five years?`, qi: `image1.png`, o: [`18.2`, `19.6`, `17.4`, `16.8`, `17.2`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 45, s: `Quantitative Aptitude`, q: `The number of Elephants in Zoo A in the year 2005 is how much percent less than the number of Elephants in Zoo B in the year 2002?`, qi: `image1.png`, o: [`60%`, `20%`, `40%`, `33.33%`, `25%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 46, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and mark the appropriate answer.
x3 + 512 = 0
y2 - 64 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established. Correct Option - 4`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 47, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and mark the appropriate answer.
x2 + 5x - 36 = 0
y2 + y - 6 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established. Correct Option - 5`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 48, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and mark the appropriate answer.
x2 + 8x + 15 = 0
y2 - 4y - 21 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 49, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and mark the appropriate answer.
x2 - 12x + 35 = 0
y2 - 10y + 24 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established. Correct Option - 5`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 50, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and mark the appropriate answer.
x2 - 7x + 10 = 0
y2 + 8y + 15 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established. Correct Option - 1`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 51, s: `Quantitative Aptitude`, q: `Directions: Read the following information carefully and answer the given questions:-
In school, the total number of students is 14,000. On the annual function of the school, 25% of the total boys and 60% of total girls have participated and the number of total girls in the school is equal to the number of boys who have not participated in the function.
Find the number of boys who have participated in annual function of the school.`, qi: ``, o: [`2000`, `1500`, `1800`, `1000`, `2500`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 52, s: `Quantitative Aptitude`, q: `Find the ratio of boys and girls who have not participated in the annual function.`, qi: ``, o: [`3 : 1`, `3 : 2`, `5 : 2`, `6 : 5`, `4 : 1`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 53, s: `Quantitative Aptitude`, q: `Find the percentage of students who have participated in the annual function.`, qi: ``, o: [`33.33%`, `60%`, `50%`, `40%`, `66.67%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 54, s: `Quantitative Aptitude`, q: `Find the total number of student who not have participated in the annual function.`, qi: ``, o: [`7200`, `6400`, `8400`, `9600`, `8000`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 55, s: `Quantitative Aptitude`, q: `Find the number of girls who have participated is what % more than the number of boys who have participated.`, qi: ``, o: [`75%`, `120%`, `90%`, `66.67%`, `80%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 56, s: `Quantitative Aptitude`, q: `The odds against an event A are 5:3 and odds in favor of another independent event B and 6:5. The chances that neither A nor B occurs is`, qi: ``, o: [`52/88`, `25/88`, `10/88`, `12/88`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 57, s: `Quantitative Aptitude`, q: `Que. 57
Que. 57
Que. 57
On a sum of Rs. 6500, if the difference between the simple interest after 5 years and 2 years is Rs. 1560, find the rate of interest.`, qi: ``, o: [`4%`, `6%`, `8%`, `10%`, `12%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 58, s: `Quantitative Aptitude`, q: `A train passes a station platform in 18 s and a man standing on the platform in 10 s. If the speed of the train is 108 km/h, find the length of the platform.`, qi: ``, o: [`225 m`, `235 m`, `230 m`, `240 m`, `260 m`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 59, s: `Quantitative Aptitude`, q: `A shopkeeper purchased 90 pens and the cost price of each pen is Rs. 10 and he sold it in two parts, the first part at 20% profit and sold the second part at 10% profit. If he sold all 90 pens at a certain price
and got a 15% profit. If the profit earns in the second condition is more than the first condition and the difference in profits from both the conditions is Rs. 40. Find how many pens were sold at 20% profit.`, qi: ``, o: [`10`, `15`, `5`, `20`, `8`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 60, s: `Quantitative Aptitude`, q: `The speed of the boat in still water is 10 kmph and speed of river is 5 kmph. Boat takes a total of 16 hrs to go to a place and come back. What is the total distance covered in the whole process?`, qi: ``, o: [`60 km`, `120 km`, `90 km`, `30 km`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 61, s: `Quantitative Aptitude`, q: `Directions: Read the table carefully and answer the following questions: The following Table shows the efficiency of the 5 different machines.
Machine
Total Capacity
Efficiency
A
150
50%
B
160
40%
C
180
60%
D
120
70%
E
140
60%
Note:- If efficiency is n, then final output will be n × (n +1)/2 Find the final output of C.`, qi: ``, o: [`5776`, `5786`, `5976`, `5886`, `5676`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 62, s: `Quantitative Aptitude`, q: `Find the difference between the output of the machine B and machine D.`, qi: ``, o: [`1280`, `1370`, `1410`, `1530`, `1490`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 63, s: `Quantitative Aptitude`, q: `Find the ratio between the output of machine D and machine E.`, qi: ``, o: [`2 : 1`, `1 : 1`, `1 : 2`, `3 : 2`, `2 : 3`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 64, s: `Quantitative Aptitude`, q: `The output of machine A is approximately how much percent more than the output of B?`, qi: ``, o: [`32%`, `27%`, `42%`, `21%`, `37%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 65, s: `Quantitative Aptitude`, q: `The output of machine D is what percent of the output of Machine E.`, qi: ``, o: [`100%`, `125%`, `90%`, `80%`, `150%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 66, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the questions that follow.
There are 6 persons namely A, B, C, D, E and F. They all are sitting around a circular table facing the centre. Each one of them likes a fruit namely, Apple, Banana, Guava, Mango, Papaya and Orange but not necessarily in the same order.
A likes apples and is sitting second to the left of B. The one who likes mango sits between the one who likes apple and B. C who likes papaya sits opposite to E. Two persons are sitting between B and F. The one who likes guava sits immediately to the left of the one who likes apples. D and B do not like mango. D sits second to the right of E and likes orange.
Which fruit does F like?`, qi: ``, o: [`Mango`, `Apple`, `Guava`, `Banana`, `Papaya`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 67, s: `Reasoning Ability`, q: `How many persons are sitting between A and E, when counted to the left of A?`, qi: ``, o: [`Two`, `Three`, `One`, `Four`, `None`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 68, s: `Reasoning Ability`, q: `Who is sitting opposite to the one who likes orange?`, qi: ``, o: [`C`, `E`, `The one who likes mango`, `The one who likes apple`, `F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 69, s: `Reasoning Ability`, q: `Who is sitting second to the right of C?`, qi: ``, o: [`D`, `A`, `E`, `B`, `F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 70, s: `Reasoning Ability`, q: `Which pair of name – fruit is correct?`, qi: ``, o: [`F – Apple`, `D – Guava`, `B – Mango`, `A – Papaya`, `B – Banana`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 71, s: `Reasoning Ability`, q: `Direction: Study the following information carefully and answer the given questions.
In a certain code language,
‘value theme particle around’ is written as ‘tfk dm un ssd’ ‘song new theme sing’ is written as ‘dj xy tfk src’
‘sing loud particle mix’ is written as ‘ssd bt src hnm’
‘around theme mix song’ is written as ‘xy un tfk bt’ What is the code of ‘around’?`, qi: ``, o: [`un`, `dm`, `dj`, `src`, `ssd`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 72, s: `Reasoning Ability`, q: `In the coded language, 	is coded as ‘hnm’.`, qi: ``, o: [`theme`, `particle`, `around`, `loud`, `value`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 73, s: `Reasoning Ability`, q: `What is the code of ‘theme sing value’?`, qi: ``, o: [`un xy bt`, `tfk src dm`, `src tfk dj`, `dm src ssd`, `dj hnm bt`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 74, s: `Reasoning Ability`, q: `Que. 74
Que. 74
Que. 74
In the given word ‘ALONGSIDE’ the consonants are written first and vowels are written second in alphabetical order then the vowels are changed to the next letter and the consonants are changed to the previous letters as per the alphabetical series, then which letter is fifth from the left end.`, qi: ``, o: [`R`, `C`, `B`, `J`, `P`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 75, s: `Reasoning Ability`, q: `How many such pairs of digits are there in the number ‘73951286’, each of which has as
many digits between them in the number (both forward and backward direction) as they have between them in the Numeric Series?`, qi: ``, o: [`Two`, `Three`, `Four`, `More than Four`, `None`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 76, s: `Reasoning Ability`, q: `There is family of seven member having three generations. There are more than four females in the family. A is the father of B. L is married to the only son of G. L has an unmarried sibling K. B is the
nephew of K. C is the child of A. G is the mother of A. H is the parent of L. How is K related to A?`, qi: ``, o: [`Sister - in- law`, `Brother - in- law`, `Son`, `Daughter`, `Cannot be determined`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 77, s: `Reasoning Ability`, q: `How is C related to G?`, qi: ``, o: [`Grandmother`, `Daughter`, `Granddaughter`, `Sister`, `Cannot be determined`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 78, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions given below.
Six persons (C, D, E, F, J, K) were born on two different dates 5, 12 of three different months viz.
March, May and September. Only one person was born on one date of a month.
J was born on the 5thof a month having 30 days. Not more than two persons were born between F and E. C was born on an even-numbered date but immediately after K. Only two persons were born between J and C. D was born on one of the months before E. K was born before F but not after D. At least two people were born after F. How many persons born between C and F?`, qi: ``, o: [`Two`, `More than three`, `Three`, `One`, `Cannot determined`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 79, s: `Reasoning Ability`, q: `Who among the following was born immediately before E?`, qi: ``, o: [`K`, `C`, `J`, `F`, `D`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 80, s: `Reasoning Ability`, q: `Which of the following is the birth date of C?`, qi: ``, o: [`12 May`, `12 March`, `5 September`, `5 March`, `5 May`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 81, s: `Reasoning Ability`, q: `Which of the following statements is true?`, qi: ``, o: [`J and F both were born in the same month`, `F was born on an odd-numbered date`, `E was born on the 5th of a month.`, `E was born on the 12th of a month`, `All are true.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 82, s: `Reasoning Ability`, q: `Four of the five are alike in a certain way and thus form a group. Find the option which does not belong to the group.`, qi: ``, o: [`K`, `C`, `D`, `F`, `J`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 83, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the questions that follow.
There are six persons namely A, B, C, D, E and F. They are arranged in descending order of their age from left to right. No two persons have the same age.
E is younger than A but elder to B. B is not the youngest. E is 25 years old. The difference of ages of D and E is 20 years. C is the second youngest person.
If the sum of ages of A and E is 70 and the sum of ages of F and D is 89 years then what is the age of D?`, qi: ``, o: [`55 years`, `20 years`, `15 years`, `5 years`, `10 years`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 84, s: `Reasoning Ability`, q: `If the sum of ages of A and E is 70 and the sum of ages of F and D is 89 then what is the possible age of C?`, qi: ``, o: [`45 years`, `10 years`, `26 years`, `2 years`, `30 years`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 85, s: `Reasoning Ability`, q: `If the sum of ages of A and E is 70 and the sum of ages of F and D is 89 then what is the average of the ages of A and E?`, qi: ``, o: [`10 years`, `15 years`, `25 years`, `35 years`, `45 years`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 86, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the given questions
In a bank meeting, the eight bank employees Q, R, U, P, D, H, L, and C hold different positions - Managing Director (MD), Executive Director (ED), Chief General Manager (CGM), General Manager (GM), Assistant General Manager (AGM), Divisional Manager (DM), Marketing Officer (MO) and Clerk but not necessarily in the same order. All the positions are in increasing order where Clerk is junior to all and MD is senior to all.
U is just one position senior to R. D is junior to Q. Q is senior to only three persons. L is neither Chief General Manager nor Managing Director. P is senior to Divisional Manager but junior to Managing Director. H is not junior to P. D is not the most junior. C is an Executive Director.
What is the position of Q?`, qi: ``, o: [`Clerk`, `Managing Director`, `Executive Director`, `Divisional Manager`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 87, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the given questions
In a bank meeting, the eight bank employees Q, R, U, P, D, H, L, and C hold different positions - Managing Director(MD), Executive Director(ED), Chief General Manager(CGM), General Manager(GM), Assistant General Manager(AGM), Divisional Manager(DM), Marketing Officer(MO) and Clerk but not necessarily in the same order. All the positions are in increasing order where Clerk is junior to all and MD is senior to all.
U is just one position senior to R. D is junior to Q. Q is senior to only three persons. L is neither Chief General Manager nor Managing Director. P is senior to Divisional Manager but junior to Managing Director. H is not junior to P. D is not the most junior. C is an Executive Director.
Find the odd one out.`, qi: ``, o: [`Managing Director - P`, `Assistant General Manager - Q`, `Divisional Manager - D`, `Clerk - R`, `Executive Director - C`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 88, s: `Reasoning Ability`, q: `Who is the most senior among them?`, qi: ``, o: [`P`, `U`, `C`, `H`, `Q`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 89, s: `Reasoning Ability`, q: `Who is at the position of Chief General Manager?`, qi: ``, o: [`L`, `C`, `P`, `R`, `Q`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 90, s: `Reasoning Ability`, q: `What is the position of L?`, qi: ``, o: [`General Manager`, `Manaing Director`, `Chief General Manager`, `Clerk`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 91, s: `Reasoning Ability`, q: `Directions: In the following question assuming the given statements to be True, find which of the conclusion among given conclusions is / are definitely true and then give your answers accordingly.
Statements: H < Y < U ≥ Q = N > R; S = T ≥ G = V > H Conclusions:
U < R
S ≥ U`, qi: ``, o: [`None is True`, `Both I and II are True`, `Only II is True`, `Only I is True`, `Either I or II is True`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 92, s: `Reasoning Ability`, q: `Directions: In the following question assuming the given statements to be True, find which of the conclusion among given conclusions is/are definitely true and then give your answers accordingly.
Statements: T ≥ M = K < B = G < P ≥ V > L; X > Z > T
Conclusions
X > P
P ≥ T`, qi: ``, o: [`Only II is True`, `Only I is True`, `Both I and II are True`, `Either I or II is True`, `None is true`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 93, s: `Reasoning Ability`, q: `Direction: In the following question assuming the given statements to be True, find which of the conclusion among given conclusions is/are definitely true and then give your answers accordingly.
Statements: P < Q ≥ G; G ≥ I ≥ E; C ≤ P; C > U Conclusions:
U > I
P ≤ E`, qi: ``, o: [`Both I and II are True`, `Only II is True`, `Either I or II is True`, `Only I is True`, `Neither I nor II is true`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 94, s: `Reasoning Ability`, q: `Direction: In the question below are given two statements followed by two conclusions numbered I and II. You have to take the given statements to be true even if they seem to be at variance with
commonly known facts. Read all the conclusions and then decide which of the given conclusions logically follows from the given statements disregarding commonly known facts.
Statement:
Some Scarfs are Handkerchiefs. Only a few Frocks are Scarfs.
Conclusion:
At least some Frocks are Handkerchiefs.
All Frocks being Handkerchiefs is a possibility.`, qi: ``, o: [`Only I follows`, `Only II follows`, `Either I or II follows`, `Neither I nor II follows`, `Both I and II follow`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 95, s: `Reasoning Ability`, q: `Direction: In the question below are given two statements followed by two conclusions numbered I and II. You have to take the given statements to be true even if they seem to be at variance with
commonly known facts. Read all the conclusions and then decide which of the given conclusions logically follows from the given statements disregarding commonly known facts.
Statement:
Only a few Gold are Green.
Some Gold are not Grey.
Conclusion:
All Gold being Grey is a possibility.
At least some Grey are Green.`, qi: ``, o: [`Only I follows`, `Only II follows`, `Either I or II follows`, `Neither I nor II follows`, `Both I and II follow`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 96, s: `Reasoning Ability`, q: `Direction: In the question below, there are two statements followed by two conclusions numbered I and II. You have to take the given statements to be true even if they seem to be at variance with
commonly known facts. Read all the conclusions and then decide which of the given conclusions logically follows from the given statements disregarding the commonly known facts.
Statements:
All grill are drill.
Only few drill are mill.
Conclusions:
Some grill are mill.
All mill are being drill is a possibility.`, qi: ``, o: [`Only conclusion I follows`, `Only conclusion II follows`, `Both I and II follow`, `Neither I nor II follows`, `Either I or II follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 97, s: `Reasoning Ability`, q: `Direction: Read the information given below and answer the question that follows.
Eight persons A, B, C, D, E, F, G and H are sitting in a horizontal row. Four of them are facing north while the rest are facing south. G is the third person from one of the extreme ends. Two people sitting at extreme ends face in the same direction. Three people sit between B and C. Neighbours of D face in the same direction but opposite to D. Neither C nor D sit at the extreme end. E sits to the left of H, who sits adjacent to neither A nor F. B sits adjacent to G and faces south. E does not sit adjacent to F. A and F are second to the left of each other.
Who among the following sits immediate left of C?`, qi: ``, o: [`D`, `F`, `B`, `H`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 98, s: `Reasoning Ability`, q: `How many persons sit to the right of B?`, qi: ``, o: [`5`, `4`, `7`, `3`, `6`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 99, s: `Reasoning Ability`, q: `Four among the five are the same in a certain way and thus form a group. Which among the following does not belong to the group?`, qi: ``, o: [`E`, `G`, `H`, `A`, `F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 100, s: `Reasoning Ability`, q: `sits second to the left of G`, qi: ``, o: [`D`, `F`, `B`, `H`, `A`], oi: [``, ``, ``, ``, ``], e: `` }
];

if (RAW.length !== 100) { console.error(`Expected 100, got ${RAW.length}`); process.exit(1); }
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

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
    let optImages = ['', '', '', '', ''];
    if (r.qi) {
      process.stdout.write(`Q${n} q-img... `);
      qImage = await uploadImage(r.qi, `${F}-q-${n}`);
      console.log(qImage ? 'ok' : 'missing');
    }
    for (let oi = 0; oi < 5; oi++) {
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
      tags: ['IBPS', 'PO', 'Prelims', 'PYQ', '2020', '03 October 2020'],
      difficulty: 'medium'
    });
  }
  return questions;
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  let category = await ExamCategory.findOne({ name: 'Central', type: 'Central' });
  if (!category) {
    category = await ExamCategory.create({ name: 'Central', type: 'Central', description: 'Central government competitive exams' });
  }

  let exam = await Exam.findOne({ code: 'IBPS-PO-PRE' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'IBPS PO (Probationary Officer) - Prelims',
      code: 'IBPS-PO-PRE',
      description: 'Institute of Banking Personnel Selection - Probationary Officer Preliminary Examination',
      isActive: true
    });
    console.log('Created Exam: IBPS-PO-PRE');
  }

  const PATTERN_TITLE = 'IBPS PO Prelims';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 60, totalMarks: 100, negativeMarking: 0.25,
      sections: [
        { name: ENG, totalQuestions: 30, marksPerQuestion: 1, negativePerQuestion: 0.25, sectionDuration: 20 },
        { name: REA, totalQuestions: 35, marksPerQuestion: 1, negativePerQuestion: 0.25, sectionDuration: 20 },
        { name: QA,  totalQuestions: 35, marksPerQuestion: 1, negativePerQuestion: 0.25, sectionDuration: 20 }
      ]
    });
    console.log('Created ExamPattern: IBPS PO Prelims');
  }

  const TEST_TITLE = `IBPS PO Prelims - 03 October 2020`;
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2020, pyqShift: `03 October 2020`,
    pyqExamName: 'IBPS PO Prelims', questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
