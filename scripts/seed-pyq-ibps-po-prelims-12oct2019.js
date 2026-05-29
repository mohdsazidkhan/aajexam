/**
 * Seed: IBPS PO Prelims - 12 October 2019
 * IBPS PO Prelims — Probationary Officer Preliminary Exam.
 * 100 Q × 1 mark, 3 sections (Eng 30 / Reas 35 / Quant 35), 60 min total,
 * sectional timing 20 min each, 0.25 negative marking.
 * Uploads question/option images from local _extracted_ibps_po_12oct2019/ to Cloudinary.
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

const EXTRACTED_DIR = path.resolve(__dirname, '../_extracted_ibps_po_12oct2019');
const CLOUDINARY_FOLDER = 'aajexam/pyq/ibps-po-prelims-12oct2019';
const F = '12oct2019';

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

const KEY = [2, 4, 4, 2, 5, 1, 2, 3, 5, 4, 3, 5, 5, 1, 1, 3, 2, 2, 1, 3, 2, 2, 2, 3, 4, 5, 4, 3, 4, 2, 2, 3, 4, 2, 5, 3, 2, 4, 5, 3, 2, 1, 5, 5, 4, 4, 4, 5, 5, 5, 3, 4, 4, 2, 1, 3, 2, 2, 1, 1, 4, 4, 3, 2, 4, 3, 3, 4, 2, 2, 3, 3, 4, 4, 3, 3, 2, 3, 2, 1, 1, 2, 2, 3, 2, 4, 3, 4, 1, 3, 4, 4, 4, 4, 5, 2, 3, 1, 3, 2];
const RAW = [
  { n: 1, s: `English Language`, q: `Read the passage carefully and answer the questions that follow.
A golden age for Western schools in China may be coming to an end in the face of a new Government clampdown. China has been a happy hunting ground for Western schools in the recent years, as a burgeoning middle class looks to equip their children with the qualifications to get into a Western university, as well as the skills to join a global workforce.
The last five years have seen a 64% increase in the number of students enrolled in international schools in China. But from the next year, schools will have to select their students via a lottery, rather than being able to pick and choose from among the applicants. The crackdown has been prompted by fears that foreign-owned schools are poaching the brightest children. The move follows changes introduced last year requiring international schools to teach the Chinese curriculum alongside other national programs.
There is a backlash against the rapid increase in private schools in China, particularly from the big public schools where it’s perceived that they have been simply poaching off the best kids. The Chinese government was also concerned at the number of students heading abroad to study, both at school and universities.
The international schools market has exploded in China in recent years after the authorities relaxed regulations for Chinese children attending foreign-owned schools. Until then, international schools almost entirely served the children of foreign nationals, but opening them up to Chinese children revealed a massive and previously untapped demand. For the growing Chinese middle class, the schools provided a more reliable route than Chinese national schools for getting into highly-regarded universities in the West, particularly those in the U.S. and U.K. These students, in turn, represent a lucrative source of income, for both the schools themselves and for Western universities.
China is the largest source of international students at U.K. universities, accounting for more than one in five at undergraduate and postgraduate level. Some of the most prestigious private schools have sought to capitalize on their brand by opening branches in China in recent years. A record 14 British international schools have opened or are due to open in China this year. Despite the increased 	, there are still opportunities for international schools to open in China, given the "massive demand" among Chinese families. There is a deep desire amongst the wealthy, middle class and young Chinese parents for a Western-style of education. Parents want an international education but also want their children to retain their culture and identity as well as excellent exam results and "places at the top universities."
What does the idiom in the face of mean in the context of the passage?`, qi: ``, o: [`Despite problems, difficulties, etc.`, `As a result of something`, `Laugh in somebody&rsquo;s face`, `On the contrary`, `Face a problem`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 2, s: `English Language`, q: `Which of the following is the most appropriate synonym of relaxed in the context of the passage?`, qi: ``, o: [`Chill out`, `De-stress`, `Constrain`, `Eased`, `Loosen`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 3, s: `English Language`, q: `Which of the sentences is/ are true according to the passage?
Chinese Government welcome international schools as they provide better chances for the students to secure admissions in prestigious western universities.
Parents not only want their children to pursue international education, but also to preserve their culture.
There is a huge demand for international schools in China.`, qi: ``, o: [`Only A`, `A and C`, `Only B`, `B and C`, `Only C`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 4, s: `English Language`, q: `Choose the most appropriate word from the options that can fill the blank.
Despite the increased 	, there are still opportunities for international schools to open in China, given the "massive demand" among Chinese families.`, qi: ``, o: [`Prices`, `Scrutiny`, `Inflation`, `Bad weather`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 5, s: `English Language`, q: `Choose the most appropriate word which is opposite in meaning to crackdown?`, qi: ``, o: [`Clampdown`, `Repress`, `Suppress`, `Squash`, `Abet`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 6, s: `English Language`, q: `Which of the following is incorrect according to the passage?
International schools have been selecting the students based on a lottery method in the last five
years.
The international schools' market has exploded in recent years.
Education from international schools help Chinese students secure admissions in prestigious western universities.`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `A and C`, `A and B`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 7, s: `English Language`, q: `What does the author indicate by the phrase "poaching off the best kids"?`, qi: ``, o: [`The western countries are using the intelligence of Chinese students for their development.`, `The international schools are taking the best students away from Chinese national schools.`, `The international schools are imposing western culture and style of education on China.`, `The international schools are misusing the Chinese intellect.`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 8, s: `English Language`, q: `Which of the following can be the most appropriate title of the passage?`, qi: ``, o: [`Lottery deal for students`, `Chinese education system`, `China's threat to golden age of western schools`, `Western style of education in China`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 9, s: `English Language`, q: `What is the tone of the passage?`, qi: ``, o: [`Argumentative`, `Authoritative`, `Biased`, `Concerned`, `Informative`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 10, s: `English Language`, q: `In the following passage, some words have been deleted. Fill in the blanks with the help of the alternatives given. Select the most appropriate option for each blank.
Basically, though India is moving towards online (1) 	in large numbers, classroom teaching has certain plus points that online teaching simply cannot replace. Firstly, collaborative learning increases a student's self-awareness about how other students learn and enables them to learn more easily and effectively, transforming them into (2) 	learners inside and beyond the classroom. Secondly, teaching in a classroom gives students the opportunity to engage in live discussions in which they are forced to use their critical thinking skills to formulate opinions or arguments. Inside a classroom, students experience social interactions with peers and establish (3) 	with teachers.
Apart from the academic aspect of their education, classroom teaching teaches students how to develop (4)
skills, beginning with the basics, such as arriving at school on time. Students learn how to organize their time, prioritize their assignments and get their homework done. Classroom teaching also (5)
conflict resolving skills, presentation skills, develops team spirit and teaches them to get along with those from different cultural (6) 	. Such experiences are valuable in shaping students' communication and listening skills, as well as growing and maturing emotionally.
Which of the following words fits the blank numbered as (1)?`, qi: ``, o: [`retailing`, `gaming`, `payments`, `education`, `business`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 11, s: `English Language`, q: `Which of the following words fits the blank numbered as (2)?`, qi: ``, o: [`bewildered`, `reluctant`, `keen`, `lethargic`, `distracted`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 12, s: `English Language`, q: `Which of the following words fits the blank numbered as (3)?`, qi: ``, o: [`deals`, `discussions`, `antipathy`, `discord`, `rapport`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 13, s: `English Language`, q: `Which of the following words fits the blank numbered as (4)?`, qi: ``, o: [`bargaining`, `theatrical`, `political`, `marketing`, `organisational`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 14, s: `English Language`, q: `Which of the following words fits the blank numbered as (5)?`, qi: ``, o: [`inculcates`, `creates`, `elaborates`, `collaborates`, `relates`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 15, s: `English Language`, q: `Which of the following words fits the blank numbered as (6)?`, qi: ``, o: [`backgrounds`, `events`, `buildings`, `situations`, `development`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 16, s: `English Language`, q: `In each of the questions given below, four words are given in bold. These four words may or may not be in their correct position. The sentence is then followed by options with the correct
combination of words that should replace each other in order to make the sentence grammatically and contextually correct. Find the correct combination of words that replace each other. If the sentence is correct as it is, select ‘5’ as your option.
The government has collections (A) a committee of officers to suggest (B) measures to augment (C) GST revenue constituted (D) and administration.`, qi: ``, o: [`B-D`, `C-D`, `A-D`, `B-C`, `None of these.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 17, s: `English Language`, q: `In each of the questions given below, four words are given in bold. These four words may or may not be in their correct position. The sentence is then followed by options with the correct
combination of words that should replace each other in order to make the sentence grammatically and contextually correct. Find the correct combination of words that replace each other. If the sentence is correct as it is, select ‘5’ as your option.
A land with a rich invaders (A), a people reduced to slavery, its wealth plundered (B) by successive bands of civilisation (C) was awakened by the call (D) of Vivekananda.`, qi: ``, o: [`B-D`, `A-C`, `B-C`, `C-D`, `A-D`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 18, s: `English Language`, q: `In each of the questions given below, four words are given in bold. These four words may or may not be in their correct position. The sentence is then followed by options with the correct
combination of words that should replace each other in order to make the sentence grammatically and contextually correct. Find the correct combination of words that replace each other. If the sentence is correct as it is, select ‘E’ as your option
There is a view that the depreciation (A) of the rupee has been the appreciation (B) of a general result (C) of the dollar across (D) all currencies.`, qi: ``, o: [`A-D`, `B-C`, `C-D`, `B-D`, `No improvement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 19, s: `English Language`, q: `In each of the questions given below, four words are given in bold. These four words may or may not be in their correct position. The sentence is then followed by options with the correct
combination of words that should replace each other in order to make the sentence grammatically and contextually correct. Find the correct combination of words that replace each other. If the sentence is correct as it is, select ‘E’ as your option.
The billionaire millions(1) kept his businessman(2) stashed under his bed, too stingy(3) to spend(4) a single dollar.`, qi: ``, o: [`1-2`, `2-3`, `3-4`, `1-4`, `No improvement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 20, s: `English Language`, q: `In each of the questions given below, four words are given in bold. These four words may or may not be in their correct position. The sentence is then followed by options with the correct
combination of words that should replace each other in order to make the sentence grammatically and contextually correct. Find the correct combination of words that replace each other. If the sentence is correct as it is, select ‘E’ as your option.
Since the liberalisation (A) of capital flows in 1991, India has always faced a current account stable (B) but inflows of capital have allowed (C) the country to have a deficit (D) balance of payments (BoP).`, qi: ``, o: [`A-B`, `A-D`, `B-D`, `C-B`, `No improvement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 21, s: `English Language`, q: `In the following sentence, some parts have errors and some are correct. Find out which part has an error and mark it as your answer. If there is no error, mark ‘No error’ as your answer.`, qi: ``, o: [`The challenge before India is (1)/ to deepening the tactical (2)/ engagement with China (3)/ keeping strategic glitches at bay (4)/. No error.`, `2`, `3`, `4`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 22, s: `English Language`, q: `In the following sentence, some parts have errors and some are correct. Find out which part has an error and mark it as your answer. If there is no error, mark ‘No error’ as your answer.
The trip to the airport and the (A)/ flight to Singapore was both uneventful, (B)/ the hotel accommodations were better than they (C)/ could have expected on such short notice. (D)/ No error (E)`, qi: ``, o: [`A`, `B`, `C`, `D`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 23, s: `English Language`, q: `In the following sentence, some parts have errors and some are correct. Find out which part has an error and mark it as your answer. If there is no error, mark ‘No error’ as your answer.
I have no difficulty in making it clear (A)/ to her that if plants and animals didn't produces (B)/ offspring of their kind, they would cease (C/) to exist, and everything in the world would soon die. (D)/ No error (E)`, qi: ``, o: [`A`, `B`, `C`, `D`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 24, s: `English Language`, q: `In the following sentence, some parts have errors and some are correct. Find out which part has an error and mark it as your answer. If there is no error, mark ‘No error’ as your answer.
Countless doctors across the world are (A)/ urging consumers to take Turmeric Curcumin on a daily basis. (B)/ Not only does it relieve an arthritis and a joint pain, (C)/ but also has many other amazing benefits. (D)/ No error (E)`, qi: ``, o: [`A`, `B`, `C`, `D`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 25, s: `English Language`, q: `In the following question, one part of the sentence has an error. Read the sentence to find the error and mark the corresponding option. If the sentence has no error choose option 5 ‘No
error’ as your answer.
Promoting entrepreneurship and (1)/ innovation is a key (2)/ priority not just in Dubai (3)/ but the Arabian Gulf as whole.(4)/ No error(5)`, qi: ``, o: [`1`, `2`, `3`, `4`, ``], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 26, s: `English Language`, q: `Select the most appropriate option to substitute the underlined segment in the given sentence.If there is no need to substitute it, select No improvement.
Select the most appropriate option to substitute the underlined segment in the given sentence.
If there is no need to substitute it, select No improvement.
Select the most appropriate option to substitute the underlined segment in the given sentence.
If there is no need to substitute it, select No improvement.
This means we can give a voice to those less heard, explore where others turn away, and rigorously challenge those in power.`, qi: ``, o: [`raise our voice`, `give a raise`, `give a call`, `give the voice`, `No improvement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 27, s: `English Language`, q: `Directions: In the given sentence, a word has been emboldened. Select a suitable word for the word in bold from the given options. If none follows select option 5 as your answer.
Akriti’s naivety was something that made her an easy target for charming con men.`, qi: ``, o: [`Sophistication`, `Cynicism`, `Artfulness`, `Childishness`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 28, s: `English Language`, q: `In the given sentence, a word has been emboldened. Select a suitable word for the word in bold from the given options. If none follows select option 5 as your answer.
There was a/an abundance of bounty on the ships, and yet there were squabbles amongst the sailors.`, qi: ``, o: [`Poverty`, `Dearth`, `Plethora`, `Inadequacy`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 29, s: `English Language`, q: `In the given sentence, a word has been emboldened. Select the correct replacement for the word in bold from the given options. If none follows select option 5 as your answer.
Rahul’s servile behavior towards Nikhil was very disgusting.`, qi: ``, o: [`Obsolete`, `Submissive`, `Observant`, `Haughty`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 30, s: `English Language`, q: `Choose the most appropriate word from the options that can fill the blank.
The students that graduate from that particular university, come out 	and ready to face the world in any capacity.`, qi: ``, o: [`Success`, `Multifaceted`, `Multistranded`, `Multiregional`, `Glory`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 31, s: `Quantitative Aptitude`, q: `Directions: The following line graphs shows the number of males and females’ employees in five different offices. Read the graph carefully and answer the following questions.
If in the new office F, the total number of employees is 20% more than the total employees of office E. and the number of female employees is 160. then find the difference between the number of male employees in office F and E.`, qi: `image3.png`, o: [`60`, `20`, `40`, `30`, `80`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 32, s: `Quantitative Aptitude`, q: `Find the ratio between the female employees in office B and C together to the male employees in office D and E together.`, qi: `image3.png`, o: [`6 : 5`, `11 : 8`, `21 : 11`, `4 : 5`, `8 : 11`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 33, s: `Quantitative Aptitude`, q: `What will be the average number of male employees in the office B, C and E together?`, qi: `image3.png`, o: [`340`, `220`, `280`, `260`, `240`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 34, s: `Quantitative Aptitude`, q: `The total number of female employees in B and C together is what percent of the total number of male employees in the same office?`, qi: `image3.png`, o: [`80%`, `140%`, `78.4%`, `71.4%`, `120%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 35, s: `Quantitative Aptitude`, q: `What will be the difference between the total number of employees in office C to the total number of employees in office B?`, qi: `image3.png`, o: [`240`, `180`, `220`, `260`, `280`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 36, s: `Quantitative Aptitude`, q: `What approximate value should come in place of the question mark (?) in the following question?
3.07 × 14.96 + (15.02)2 - (11.03)2 = ?`, qi: ``, o: [`160`, `168`, `149`, `172`, `125`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 37, s: `Quantitative Aptitude`, q: `What approximate value should come in place of the question mark (?) in the following question? (1/7.01 + 1/13.99 + 1/27.99) × 100.04 = ?`, qi: ``, o: [`35`, `25`, `20`, `15`, `45`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 38, s: `Quantitative Aptitude`, q: `What approximate value should come in place of the question mark (?) in the following question?
111.01 - 241.23 + (4.96)2 + (11.09)2 = ?`, qi: ``, o: [`28`, `36`, `48`, `16`, `9`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 39, s: `Quantitative Aptitude`, q: `What approximate value should come in place of the question mark (?) in the following question? (14.03) + (28.02)2 ÷ 6.98 + (3.96)2 = ?`, qi: ``, o: [`182`, `172`, `192`, `202`, `142`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 40, s: `Quantitative Aptitude`, q: `What approximate value should come in place of the question mark (?) in the following question? (9.99)2 + (15.99)2 - (13.11)2 + (18.11)2 = ?`, qi: ``, o: [`613`, `587`, `511`, `487`, `386`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 41, s: `Quantitative Aptitude`, q: `Maria was twice the age of Monica 7 years back. After 5 years, Monica’s age will be two third of Maria’s age. What was Maria’s age 3 years back?`, qi: ``, o: [`25 years`, `28 years`, `31 years`, `35 years`, `41 years`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 42, s: `Quantitative Aptitude`, q: `A and B invested an amount of Rs. 6000 and Rs. 9000 respectively in a business for the time duration in the ratio of 5 : 3. If they earned a profit of Rs. 4370. Find the share of A in the profit.`, qi: ``, o: [`2300`, `2400`, `2500`, `2600`, `2700`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 43, s: `Quantitative Aptitude`, q: `Two pipes A and B can fill a tank in 18 and 36 hours respectively. An outlet pipe C can empty it in 24 hours. If they opened together, then in how many hours the 3/4th of the capacity of the tank is
filled? 1.
2.
3.
4.
5.`, qi: ``, o: [`22 hours`, `24 hours`, `16 hours`, `20 hours`, `18 hours`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 44, s: `Quantitative Aptitude`, q: `A person invested Rs. 8800 at 10% rate of simple interest per annum in bank A for x years and Rs. 8200 at 20% rate of simple interest per annum in bank B for 3 years less than the time for which he
invested in bank A and receives equal interest from both the banks. Find the approximate value of x.`, qi: ``, o: [`6 years`, `7 years`, `5 years`, `7.5 years`, `6.5 years`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 45, s: `Quantitative Aptitude`, q: `Que. 45The speed of boat in downstream is 16 km/hr and upstream is 10 km/hr. Find the speed of boat in still water?
Que. 45
Que. 45`, qi: ``, o: [`15 km/hr`, `11 km/hr`, `9 km/hr`, `13 km/hr`, `12.5 km/hr`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 46, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. You have to solve both the equations and mark the appropriate answer.
x2 = 81
(y - 9)2 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `Either x = y or Relationship between x and y cannot be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 47, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. You have to solve both the equations and mark the appropriate answer.
x2 + 7x + 12 = 0
y2 + 5y + 6 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `Either x = y or Relationship between x and y cannot be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 48, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. You have to solve both the equations and mark the appropriate answer.
3x2 - 8x + 4 = 0
6y2 - 7y - 10 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `Either x = y or Relationship between x and y cannot be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 49, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. You have to solve both the equations and mark the appropriate answer.
x2 - 18x - 63 = 0
y2 - 8y - 48 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `Either x = y or Relationship between x and y cannot be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 50, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. You have to solve both the equations and mark the appropriate answer.
x2 - 5x - 84 = 0
y2 - 3y - 88 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `Either x = y or Relationship between x and y cannot be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 51, s: `Quantitative Aptitude`, q: `Directions: The following table represents the total number of people and number of females in the society. Read the table carefully and answer the following questions.
Society
Total number of People
Total number of Females
A
1100
300
B
950
400
C
1250
750
D
850
250
E
1600
800
Find the ratio between the total number of people in society B and D to the total number of females in society C and D together.`, qi: ``, o: [`10 : 7`, `11 : 5`, `9 : 5`, `5 : 11`, `27 : 10`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 52, s: `Quantitative Aptitude`, q: `If the weight of 30% of the females in society A, B and E are greater than 80 kg, then find the average of the remaining females in these society?`, qi: ``, o: [`420`, `450`, `375`, `350`, `430`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 53, s: `Quantitative Aptitude`, q: `Find the difference between the total number of males in society A and E and the total number of females in society B, C and D together.`, qi: ``, o: [`400`, `600`, `250`, `200`, `350`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 54, s: `Quantitative Aptitude`, q: `The total number of females in the society C and D together is what percent of the number of males in society A?`, qi: ``, o: [`100%`, `125%`, `75%`, `120%`, `150%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 55, s: `Quantitative Aptitude`, q: `Find the difference between the total number of males and females in the society A and D together respectively and the total number of males and females in the society B and C together
respectively?`, qi: ``, o: [`250`, `200`, `300`, `350`, `400`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 56, s: `Quantitative Aptitude`, q: `A train of length 150 meters passes a pole in 15 seconds and crosses another train of the same length travelling in opposite direction in 12 seconds. The speed of the second train would be :`, qi: ``, o: [`20 km/h`, `40 km/h`, `54 km/h`, `60 km/h`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 57, s: `Quantitative Aptitude`, q: `What is the percentage change in the salary of Amit, if it is first decreased by 25% and then increased by 30%?`, qi: ``, o: [`5% increased`, `5% decreased`, `5% increased`, `5% decreased`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 58, s: `Quantitative Aptitude`, q: `In a mixture of 40 litres, the ratio of milk and water is 3 : 2. How many litres of milk must be added to make the ratio 4 : 1?`, qi: ``, o: [`45`, `40`, `35`, `30`, ``], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 59, s: `Quantitative Aptitude`, q: `The marked price of an article is Rs. 640. If 10% discount is offered on the marked price of an article, then a profit of Rs. 54 is earned. Find the approximate profit or loss percent if the discount
is increased to 30%.`, qi: ``, o: [`14.2% loss`, `16.4% loss`, `11.7% profit`, `12.2% profit`, `15.1% loss`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 60, s: `Quantitative Aptitude`, q: `Two trains of equal length are running on parallel lines in the same direction at 45 km per hr and 54 km per hr. The faster train passes the slower train in 108 seconds. The length of each train is`, qi: ``, o: [`135 m`, `105 m`, `100 m`, `150 m`, `110 m`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 61, s: `Quantitative Aptitude`, q: `Directions: Read the passage carefully and answer the following questions In 4 Colleges:
A, B, C, D are Hostel,
In Hostel A: Number of Boys are 120 and the number of girls are 30% more than that of girls in Hostel B. In Hostel B: Number of boys are double than that of girls.
In Hostel C: Number of Boys are 100 more than that of number boys in Hostel A.
In Hostel D: Average number of girls in Hostel A and D together is 233. Number of boys in Hostel D are 238.
Note: (i) Total number of students are 1500
Difference between the number of boys in D and B is 98. Find the number of girls in Hostel C.`, qi: ``, o: [`238`, `258`, `276`, `246`, `232`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 62, s: `Quantitative Aptitude`, q: `What will be the difference between the number of students in Hostel D and the total number of students in Hostel A?`, qi: ``, o: [`395`, `375`, `415`, `402`, ``], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 63, s: `Quantitative Aptitude`, q: `Find the average of the total number of boys in Hostel A, B and C together?5.	396`, qi: ``, o: [`Que. 63	Find the average of the total number of boys in Hostel A, B and C together?`, `155`, `160`, `145`, `180`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 64, s: `Quantitative Aptitude`, q: `Find the approximate percentage of number of boys in all the hostel together?`, qi: ``, o: [`52%`, `48%`, `46%`, `56%`, `42%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 65, s: `Quantitative Aptitude`, q: `Find the ratio between the number of Girls in Hostel C to Hostel D.`, qi: ``, o: [`88 : 135`, `73 : 155`, `78 : 115`, `82 : 125`, `76 : 135`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 66, s: `Reasoning Ability`, q: `Direction: In the following question assuming the given statements to be true, find which of the conclusion among given three conclusions is/are definitely true and then give your answers
accordingly.
Statements:
M ≥ N < O ≤ P ≤ R ≤ S
Conclusions:
O ≤ S
M < R`, qi: ``, o: [`Both conclusion I and II follow.`, `Only conclusion II follows.`, `Only conclusion I follows.`, `Either I or II follows.`, `None follow.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 67, s: `Reasoning Ability`, q: `Direction: In the following question assuming the given statements to be true, find which of the conclusion among given three conclusions is/are definitely true and then give your answers
accordingly.
Statements:
P > Q ≥ R = S , F ≥ R ≥ E
Conclusions:
Q ≥ E
P > S`, qi: ``, o: [`Only conclusion I follows.`, `Only conclusion II follows.`, `Both conclusions I and II follow.`, `Either I or II follows.`, `Neither I or II follow.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 68, s: `Reasoning Ability`, q: `Directions: In the following question assuming the given statements to be True, find which of the conclusion among given conclusions is/are true and then give your answers accordingly.
Statements: P > Q = R < S; R < Y < Z Conclusions:
Q > Z
Y > P`, qi: ``, o: [`Only I is true`, `Only II is true`, `Both I and II are true`, `Neither I nor II is true`, `Either I or II is true`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 69, s: `Reasoning Ability`, q: `Direction: In the following question assuming the given statements to be true, find which of the conclusion among given three conclusions is/are definitely true and then give your answers
accordingly.
Statements:
A ≥ B > C ≥ D, E ≤ C ≥ F
Conclusions:
E ≥ D
F < A`, qi: ``, o: [`Only conclusion I follows.`, `Only conclusion II follows`, `Both conclusions I and II follow.`, `Neither conclusion I or II follows.`, `Either conclusion I or II follow.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 70, s: `Reasoning Ability`, q: `Direction: In the following question assuming the given statements to be true, find which of the conclusion among given three conclusions is/are definitely true and then give your answers
accordingly.
Statements:
D < E = F > G ≥ H, K ≥ F
Conclusions:
D < H
K > G`, qi: ``, o: [`Only conclusion I follows.`, `Only conclusion II follows.`, `Both conclusion I and II follow.`, `Either conclusion I or II follow.`, `Neither conclusion I or II follow.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 71, s: `Reasoning Ability`, q: `Direction: Read the following passage and choose the correct answer.
In a code language
“you seen can be great” is written as “tu pro dz mp sno”,
“other man you can always” is written as “mp sno tp cmp pmp”, “be you show that creat” is written as “olp yon sno fno tu”, and “show other great always creat” is written as “pro tp pmp yon fno”
what is the code for “never can”?`, qi: ``, o: [`tu rui.`, `pro tyu.`, `mp rgh.`, `yon egh.`, `tp fdrt.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 72, s: `Reasoning Ability`, q: `What is the code for "be that"?`, qi: ``, o: [`pmp dz`, `pmp bno`, `tu olp`, `pmp tp`, `olp sno`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 73, s: `Reasoning Ability`, q: `What is the code for "Seen"?`, qi: ``, o: [`tu`, `sno`, `mp`, `dz`, `pro`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 74, s: `Reasoning Ability`, q: `What is the code for "you"`, qi: ``, o: [`bno`, `cmp`, `either option 1 or 2.`, `sno`, `can't be determined.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 75, s: `Reasoning Ability`, q: `what is the code for "you can be sweet"?`, qi: ``, o: [`olp mp sno pro.`, `tu mp sno yon.`, `tu mp sno gft.`, `fno tu pmp pro`, `tu mp sno pro.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 76, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the questions that follow:
There are ten persons namely L, M, N, O, P, Q, R, S, T and U attending the meeting on either 15th or 30th of January, March, April, September and November.
L attends the meeting on 15th of a month having 31 days.There are three persons attending the meeting between L and P. N attends the meeting on 30th March. T attends the meeting before S but after P. Neither M nor U attends the meeting in January. M attends the meeting before U but not in the same month. O attends the meeting two months before N. There are two persons attending the meeting between S and P. S does not attend the meeting in the month of September. R attends the meeting in the month of April. Neither R nor U attends the meeting on the 15th of any month.
Who attends the meeting immediately before O?`, qi: ``, o: [`L`, `U`, `Q`, `T`, `S`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 77, s: `Reasoning Ability`, q: `Who attends the meeting on 15th September?`, qi: ``, o: [`O`, `P`, `N`, `L`, `M`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 78, s: `Reasoning Ability`, q: `How many persons attend the meeting between P and Q?`, qi: ``, o: [`Two`, `Three`, `Five`, `One`, `Four`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 79, s: `Reasoning Ability`, q: `In which month, does U attend the meeting?`, qi: ``, o: [`April`, `September`, `November`, `March`, `January`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 80, s: `Reasoning Ability`, q: `Who attends the meeting immediately after M?`, qi: ``, o: [`R`, `L`, `O`, `Q`, `N`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 81, s: `Reasoning Ability`, q: `Direction: Study the information given below carefully and answer the questions that follow.
There are seven members in a family – P, Q, R, J, F, G and H. P and J are husband and wife. R is the only brother of J. Q is the only daughter of P. R is the husband of F. G is the mother of R. P is the
daughter in law of H.
If X is the brother of P, then what is the relation of X with Q?`, qi: ``, o: [`Maternal uncle`, `Son`, `Husband`, `Son-in-law`, `Father`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 82, s: `Reasoning Ability`, q: `How is R related to P?`, qi: ``, o: [`Brother`, `Brother-in-law`, `Son`, `Father`, `Grandfather`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 83, s: `Reasoning Ability`, q: `Who is the husband of G?`, qi: ``, o: [`R`, `H`, `P`, `Q`, `F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 84, s: `Reasoning Ability`, q: `The consonants in the word 'SPLENDOR' are changed to the respective previous alphabets in the English alphabetical series and the vowels are changed to the respective alphabets succeeding them
in the English alphabetical series. What is the 4th letter from the right end in the word formed after arranging the remaining letters in alphabetical order?`, qi: ``, o: [`M`, `P`, `O`, `L`, `None of these.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 85, s: `Reasoning Ability`, q: `Direction: Study the following information carefully and answer the questions following it.
There are eight persons A-H sitting on a rectangular table but not necessarily in the same
order. Four of them are sitting on the middle side of the table facing inside and rest of them are sitting on the corners of the table facing outside. There is one person sitting between E and the person who is sitting 2nd to the right of A. H who is the neighbour of G, is facing C. D is not an immediate neighbor of A. A is sitting 3rd to the left of B. H is not facing outside of the table. E is sitting in the middle on the longer side of the table. D is not a neighbor of C.
Which of the following statements is false?`, qi: ``, o: [`A is sitting opposite to E`, `C is sitting to the immediate right of G`, `G is sitting to the immediate left of H`, `F is sitting 3rd to the right of E`, `C is sitting 3rd to the left of D`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 86, s: `Reasoning Ability`, q: `Which of the following are sitting at the corners?`, qi: ``, o: [`GDBA`, `FBDA`, `GDFC`, `GDBF`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 87, s: `Reasoning Ability`, q: `Which of the following is true?`, qi: ``, o: [`G is sitting opposite to E`, `B is sitting to the immediate left of H`, `D and F are sitting at the corners`, `F and E are sitting at the corners`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 88, s: `Reasoning Ability`, q: `What is the position of A with respect to D?`, qi: ``, o: [`A is sitting 4th to the right of D`, `A is sitting to the immediate left of D`, `A is sitting to the immediate right of D`, `A is sitting 3rd to the right of D`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 89, s: `Reasoning Ability`, q: `Who is sitting to the immediate right of B?`, qi: ``, o: [`E`, `F`, `C`, `G`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 90, s: `Reasoning Ability`, q: `How many such pairs of letters are there in the word BRISKLY each of which has as many letters between them in the word (in the forward direction) as they have between them in the English
alphabetical order?`, qi: ``, o: [`1`, `2`, `3`, `none.`, `4`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 91, s: `Reasoning Ability`, q: `If 1 is added to each even digit and 1 is subtracted from each odd digit in the number 624739854, then the sum of digits which is 4th and 5th from right and left respectively 	.`, qi: ``, o: [`11`, `9`, `13`, `10`, `8`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 92, s: `Reasoning Ability`, q: `Direction: Study the given information carefully and answer the following questions.
There are six persons A, B, C, D, F and G sitting in a row facing north direction but not necessarily in the same order. All have different ages.
Age of C is the sum of the ages of F and G who is sitting one of the extreme ends. C is sitting 2nd to the right of D whose age is thrice the age of F. Age of F is four more than the age of G. B who is 18 years old is sitting between G and C. The difference of ages between F and C is 8 years old. C is older than F. Number of persons sitting to the left of A are one less than the number of persons sitting to the right of A who is two years younger than G.
What is the sum of the ages of A and C?`, qi: ``, o: [`18`, `24`, `14`, `26`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 93, s: `Reasoning Ability`, q: `What is the age of A?`, qi: ``, o: [`12 years`, `8 years`, `10 years`, `6 years`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 94, s: `Reasoning Ability`, q: `What is the position of A with respect to B?`, qi: ``, o: [`first to the left`, `second to the right`, `first to the right`, `second to the left`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 95, s: `Reasoning Ability`, q: `How many people are sitting between A and C?`, qi: ``, o: [`Two`, `Three`, `One`, `More than three`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 96, s: `Reasoning Ability`, q: `Who is sitting on the extreme left end?`, qi: ``, o: [`G`, `F`, `B`, `D`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 97, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the following questions:
A, B, C, D, E, F, G, and H are the eight persons working in a fifty-year-old company with different years of joining: 1968, 1975, 1980, 1990, 1999, 2001, 2008 and 2017. They are not necessarily in the same order. All of them have different positions in the company namely Chief Executive Officer (CEO), President, Vice-President, General Manager, Office Manager, Sales Manager, Regional Manager, and Corporate
Head but not necessarily in the same order.
D is the oldest serving person in the company. The President and the Vice-President joined at a gap of five years where the President joined the company first. C joined in the last year of the twentieth century. H is the corporate head and joined in 1990. E is the last one to join and isn’t either the sales manager or the regional manager. B is the first person to join in the twenty-first century and is the general manager. The oldest serving employee is the CEO and F is the President. A is not the vice-president. The Sales manager joined in 2008.
Which year did A join the company?`, qi: ``, o: [`2017`, `1968`, `2008`, `2001`, `1999`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 98, s: `Reasoning Ability`, q: `Who joined first among the following?`, qi: ``, o: [`D`, `Office Manager`, `Regional Manager`, `B`, `A`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 99, s: `Reasoning Ability`, q: `Who is likely to become the next CEO if the company considers the person with the most number of years spent in the company?`, qi: ``, o: [`Sales Manager`, `Office Manager`, `President`, `Vice-President`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 100, s: `Reasoning Ability`, q: `What is the difference in the years of joining of the sales manager and the corporate head?`, qi: ``, o: [`14`, `18`, `15`, `16`, `17`], oi: [``, ``, ``, ``, ``], e: `` }
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
      tags: ['IBPS', 'PO', 'Prelims', 'PYQ', '2019', '12 October 2019'],
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

  const TEST_TITLE = `IBPS PO Prelims - 12 October 2019`;
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2019, pyqShift: `12 October 2019`,
    pyqExamName: 'IBPS PO Prelims', questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
