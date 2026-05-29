/**
 * Seed: IBPS PO Prelims - 13 October 2018
 * IBPS PO Prelims — Probationary Officer Preliminary Exam.
 * 100 Q × 1 mark, 3 sections (Eng 30 / Reas 35 / Quant 35), 60 min total,
 * sectional timing 20 min each, 0.25 negative marking.
 * Uploads question/option images from local _extracted_ibps_po_13oct2018/ to Cloudinary.
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

const EXTRACTED_DIR = path.resolve(__dirname, '../_extracted_ibps_po_13oct2018');
const CLOUDINARY_FOLDER = 'aajexam/pyq/ibps-po-prelims-13oct2018';
const F = '13oct2018';

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

const KEY = [2, 1, 4, 1, 2, 2, 2, 2, 5, 5, 1, 2, 2, 1, 2, 3, 5, 4, 1, 5, 3, 1, 4, 2, 2, 2, 4, 2, 1, 3, 1, 4, 4, 1, 1, 2, 4, 3, 2, 1, 5, 1, 1, 5, 3, 2, 1, 2, 3, 1, 3, 2, 5, 2, 2, 2, 5, 4, 2, 2, 1, 5, 4, 5, 1, 2, 1, 4, 2, 1, 4, 2, 2, 4, 1, 5, 1, 4, 4, 1, 3, 2, 3, 5, 4, 3, 4, 1, 3, 2, 5, 3, 5, 4, 3, 2, 5, 1, 4, 5];
const RAW = [
  { n: 1, s: `English Language`, q: `In the given question a sentence has been divided into five parts. The question is followed by
five options which give possible sequences of the rearranged parts. You must choose the option which gives the correct sequence. If the sentence is already arranged correctly, or if none of the given options form the correct sequence, mark option 5, i.e. ‘None of the above’.
A- for months, making it
B- to identify it, when it was found
C- wrecked car was unknown
D- the location of the
E- difficult for the police`, qi: ``, o: [`CEADB`, `DCAEB`, `CADEB`, `EBCAD`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 2, s: `English Language`, q: `In the given question a sentence has been divided into five parts. The question is followed by
five options which give possible sequences of the rearranged parts. You must choose the option which gives the correct sequence. If the sentence is already arranged correctly, or if none of the given options form the correct sequence, mark option 5, i.e. ‘None of the above’.
A- Experience especially for
B- skydiving is a
C- people who either have fear
D- of flying or fear of heights
E- challenging but thrilling`, qi: ``, o: [`BEACD`, `ABCDE`, `AECDB`, `BAEDC`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 3, s: `English Language`, q: `In the given question a sentence has been divided into five parts. The question is followed by
five options which give possible sequences of the rearranged parts. You must choose the option which gives the correct sequence. If the sentence is already arranged correctly, or if none of the given options form the correct sequence, mark option 5, i.e. ‘None of the above’.
A: Something to do with B: Chang’s mother is here, C: Chang’s mien and play
D: And her attendance may have E: The staggering woe of`, qi: ``, o: [`EDCBA`, `BEDCA`, `EACDB`, `BDAEC`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 4, s: `English Language`, q: `In the given question a sentence has been divided into five parts. The question is followed by
five options which give possible sequences of the rearranged parts. You must choose the option which gives the correct sequence. If the sentence is already arranged correctly, or if none of the given options form the correct sequence, mark option 5, i.e. ‘None of the above’.
A: Resulted in many bad passes, steals
B: Ball-hawking and perpetual movement – three C: And easy fast-break baskets
D: The defensive coaches taught risk-taking,
E: Strategies that bewildered the opposition and`, qi: ``, o: [`DBEAC`, `ABEAD`, `DCBEA`, `EDACB`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 5, s: `English Language`, q: `In the given question a sentence has been divided into five parts.The question is followed by
five options which give possible sequences of the rearranged parts. You must choose the option which gives the correct sequence. If the sentence is already arranged correctly, or if none of the given options form the correct sequence, mark option 5, i.e. ‘None of the above’.
A: Some as the only animal
B: That can laugh at grief, laugh C: Humans have been defined by D: At the pain and tragedy
E: That define their fate`, qi: ``, o: [`CABED`, `CABDE`, `CDEAB`, `CBDAE`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 6, s: `English Language`, q: `In the given question a sentence has been divided into five parts. The question is followed by
five options which give possible sequences of the rearranged parts. You must choose the option which gives the correct sequence. If the sentence is already arranged correctly, or if none of the given options form the correct sequence, mark option 5, i.e. ‘None of the above’.
A: Almost zero, a demographic event B: In the last five years, European
C: Have profound social implications D: Population growth has dropped to E: That in years to come will`, qi: ``, o: [`BCDAE`, `BDAEC`, `ABDEC`, `CDAEB`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 7, s: `English Language`, q: `In the question, one sentence is given, and four words have been given in bold denoted by (A), (B), (C) and (D). You have to decide, which of the following is inappropriate in context. If all
the words are appropriate in the context then mark ‘All correct’ as your answer.
A microwave heats food by causing (A) the molecules to vertebrate (B) but it certainly does not make food radioactive (C) as misconception (D) suggests.`, qi: ``, o: [`A`, `B`, `C`, `D`, `All are correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 8, s: `English Language`, q: `In the question, one sentence is given, and four words have been given in bold denoted by (A), (B), (C) and (D). You have to decide, which of the following is inappropriate in context. If all
the words are appropriate in the context then mark ‘All correct’ as your answer.
Indigestion (A) is often a sign of an underline (B) problem, such as ulcers (C), rather than a condition (D) on its own.`, qi: ``, o: [`A`, `B`, `C`, `D`, `All are correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 9, s: `English Language`, q: `In the question, one sentence is given, and four words have been given in bold denoted by (A), (B), (C) and (D). You have to decide, which of the following is inappropriate in context. If all
the words are appropriate in the context then mark ‘All correct’ as your answer.
The country can take a lot of credit (A) for supplying (B) affordable (C) machines to treat Tuberculosis (D) around the world.`, qi: ``, o: [`A`, `B`, `C`, `D`, `All are correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 10, s: `English Language`, q: `In the question, one sentence is given, and four words have been given in bold denoted by (A), (B), (C) and (D). You have to decide, which of the following is inappropriate in context. If all
the words are appropriate in the context then mark ‘All correct’ as your answer.
Introverts(A) do not necessarily dislike other people, they just prefer(B) smaller crowds, familiar(C) faces and less interaction. (D).`, qi: ``, o: [`A`, `B`, `C`, `D`, `All are correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 11, s: `English Language`, q: `Read the following passage carefully and answer the questions.
Unemployment means a situation in which people are willing to work, at the existing rate of wage, but they do not get work. Our country is facing many problems but one of the serious problems is of unemployment. As per the labour bureau appraisal, unemployment for the year 2015-2016 was 5 percentage which is an all-time high. For every vacancy, there are dozens of applicants. Out of many candidates who are interviewed, only a few get the job. A student dedicates several years of his life in studies. It is a worry-some condition that even after getting Bachelor's and Master's Degree, the youth of India is facing the problem of unemployment.
The main cause among the educated in India is our faulty system of education. It is not sufficiently related to the socio-economic needs of our people. Moreover, many big industries look for skilled candidates only, for their company. There are a very few technical training institutions in the country, and, secondly, technical education is so costly that common people cannot afford to get their wards admitted in these institutions.
The most immediate of issues is the syllabus. Students are expected to learn long drawn theories and texts with almost no stress on practical application. What they are taught in classes and what is expected of them at the workplace is totally divergent.
The system of present education should also be changed radically. The government should keep a strict watch on the education system and try to implement new ways to generate a skilled labour force. Instead of giving only theoretical education the students should be given vocational training so that they can start some work after they finish their education. This institute prepares a student with skill and knowledge for a particular trade. There is a growing demand for skilled people in various industries. This would go a long way in tackling the growing menace of unemployment.
Which of the following is most similar to the word ‘appraisal’?`, qi: ``, o: [`Estimate`, `Mutiny`, `Apparent`, `Subscription`, `Duty`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 12, s: `English Language`, q: `Which of the following is the most opposite in meaning to the word ‘divergent’?`, qi: ``, o: [`Atypical`, `Parallel`, `Disparate`, `Contrary`, `Conflicting`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 13, s: `English Language`, q: `Which of the following best summarises the above passage?`, qi: ``, o: [`Colleges do not contribute to a person’s employability and therefore being a graduate should not be a criteria for securing a job.`, `An improvement is needed in the functioning of colleges in order to ensure better employability of it’s students.`, `Colleges need to employ more teachers so that employment of graduates increases.`, `The educated youth must secure high grades in college in order to ensure employment.`, `None of the above.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 14, s: `English Language`, q: `Which of the following is not correct as per the given passage?`, qi: ``, o: [`It is easier for a person with a master’s degree to get a job than it is for a person with just a bachelor’s degree.`, `Syllabus of most colleges is not parallel to practical workplace needs.`, `‘Skill’ is an important criteria for securing a job in most big industries.`, `The government should work towards improving the present education system.`, `None of the above.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 15, s: `English Language`, q: `Which of the following is a criterion of unemployment?`, qi: ``, o: [`Not willing to work at existing rate of wage.`, `Willing to work at existing rate of wage but not getting work`, `Not willing to work at existing rate of wage and not getting work`, `Willing to work at lower rate of wage but not getting work`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 16, s: `English Language`, q: `What according to the author is the major reason for unemployment?`, qi: ``, o: [`Students focus more on theories taught in the syllabus.`, `Negligence on the part of the government.`, `Lack of industrial skills among students and such skills not being imparted during college years.`, `Skewed student teacher ratio in most colleges.`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 17, s: `English Language`, q: `What makes the education system of India faulty?`, qi: ``, o: [`It is not sufficiently related to the socio-economic needs of the people`, `Very few technical training institutes in the country. The existing ones are too costly for most people to afford.`, `Syllabus is not as per industrial needs.`, `Colleges emphasize theoretical knowledge over technical skills.`, `All of the above.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 18, s: `English Language`, q: `In the following question, a word has been given. Choose the sentence(s) in which it is used correctly and if all the sentences are correct then choose Option 5.
Adage
Among other things, Ben Franklin is famous for developing an adage to go with each of his philosophical ideals.
Murphy’s Law is a good example of an adage that takes a pessimistic view of life.
The adage of gold led many people to travel to Texas by wagon.`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `Both A and B`, `All correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 19, s: `English Language`, q: `In the following question, a word has been given. Choose the sentence(s) in which it is used correctly.
Hamper
Although the pain medication has its benefits, it can also hamper the body’s capacity to break down toxins.
Hamper and plain, the woman was known for her delicious cooking but not her looks.
The runner hamper tossed the baton to his teammate who took off toward the finish line.`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `Both A and B`, `All are correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 20, s: `English Language`, q: `In the following question, a word has been given. Choose the sentence(s) in which it is used correctly.
Tact
Because he lacks discretion and tact, most of the things my brother says comes off as offensive.
Even though Vincent van Gogh was an extremely tactful artist, he only sold one painting during his lifetime.
Andrew is a man of great tact and is a skilled speaker when it comes to diplomacy.`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `Both A and C`, `All are correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 21, s: `English Language`, q: `In the following question, a word has been given. Choose the sentence(s) in which it is used correctly.
Trauma
The three girl’s voices created a beautiful trauma over the loudspeaker.
The trauma of spices was mixed in, with one of the three being pepper.
The trauma of living in a concentration camp was a suffering that the survivors couldn’t get over easily.`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `Both A and B`, `All are correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 22, s: `English Language`, q: `In the following sentence, one phrase has been printed in bold. Below the sentence, three meanings are given. Select the correct meaning of the phrase from the options given below.
These trades churned out in ever more massive quantities a myriad of things for personal and domestic adornment and use.
A countless or extremely great number of possibilities or options.
Limited or restricted options.
Things belonging to different countries.`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `Both B and C`, `Both A and C`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 23, s: `English Language`, q: `In the following sentence, one phrase has been printed in bold. Below the sentence, three meanings are given. Select the correct meaning of the phrase from the options given below.
To us, in those years, Europe seemed almost as remote and hard to reach as the moon.
Something that is distant.
Something that is unattainable.
Something that is within our grasp.`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `Both A and B`, `Both A and C`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 24, s: `English Language`, q: `In the following sentence, one phrase has been printed in bold. Below the sentence, three meanings are given. Select the correct meaning of the phrase from the options given below.
The cows were not producing enough milk and they also stopped lactating when the calf was not nursing.
Not available at the right time.
Not producing as much as required.
Not belonging to any place or process`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `Both A and B`, `All A, B and C`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 25, s: `English Language`, q: `In the following sentence, one phrase has been printed in bold. Below the sentence, three meanings are given. Select the correct meaning of the phrase from the options given below.
He was against the idea to start with, but he soon changed his tune when he realized how much money he'd get.
Changing your behavior
Changing your mind
Strategically correct`, qi: ``, o: [`Only A`, `Only B`, `Both B and C`, `Both A and C`, `All A, B and C`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 26, s: `English Language`, q: `In the following question, two columns are given containing incomplete sentences. In the first column, the phrases are (A), (B), and (C), and in the second column the phrases are (D), (E),
and (F). You have to match the phrases of column (1) with those of column (2) and make grammatically and contextually correct sentences. If none of the options given forms a correct sentence after combination, select ‘None of these’ as your answer.
Column (1)
Column (2)
A-If a man does not keep pace with his companions,
D-Stuart was often hard to find around the house
B-Her mom came home tired
E-perhaps it is because he hears a different drummer
C-Because he is so small,
F-but she still cooked dinner for her family`, qi: ``, o: [`A-D`, `B-F`, `C-E`, `A-F`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 27, s: `English Language`, q: `In the following question, two columns are given containing incomplete sentences. In the first column, the phrases are (A), (B), and (C), and in the second column the phrases are (D), (E),
and (F). You have to match the phrases of column (1) with those of column (2) and make grammatically and contextually correct sentences. If none of the given options form a correct sentence after combination, select ‘None of these’ as your answer.
Column (1)
Column (2)
A-My father used a dilatory strategy to keep me out of the house
D-evolution progresses
B-As genes change over time,
E-While my mother arranged my surprise birthday party
C-When I came into light after emerging from the dark depths of the cave
F-I only wanted two things: soap and water.`, qi: ``, o: [`A-F`, `B-E`, `C-D`, `A-E, B-D and C-F`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 28, s: `English Language`, q: `In the following question, two columns are given containing incomplete sentences. In the first column, the phrases are (A), (B), and (C), and in the second column the phrases are (D), (E),
and (F). You have to match the phrases of column (1) with those of column (2) and make grammatically and contextually correct sentences. If none of the options given forms a correct sentence after combination, select ‘None of these’ as your answer.
Column (1)
Column (2)
A-When the soldiers put dynamite under the bridge,
D-they hoped it would enervate the foundation to the point of collapse
B-When Kyle died, nobody missed him because
E-he was a bully who liked to enervate women by hitting them
C-While the writing appeared simple, its meaning was esoteric
F-in the fact only a number of scholars could comprehend it.`, qi: ``, o: [`A-F`, `B-E`, `C-E`, `A-E`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 29, s: `English Language`, q: `In the following question, two columns are given containing incomplete sentences. In the first column, the phrases are (A), (B), and (C), and in the second column the phrases are (D), (E),
and (F). You have to match the phrases of column (1) with those of column (2) and make grammatically and contextually correct sentences. If none of the options given forms a correct sentence after combination, select ‘None of these’ as your answer.
Column 1
Column 2
A-Because of advances in DNA testing, the police can now conduct
D- he started a crusade to rid his city of illegal drugs
B-When the mayor learned his son was killed by a drug leader
E- he bet all his savings on the game
C-His football team would pulverize its opponent
F- a belated investigation into the unsolved murder`, qi: ``, o: [`A-F`, `A-E`, `A-D`, `B-F`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 30, s: `English Language`, q: `In the following question, two columns are given containing incomplete sentences. In the first column, the phrases are (A), (B), and (C), and in the second column the phrases are (D), (E),
and (F). You have to match the phrases of column (1) with those of column (2) and make grammatically and contextually correct sentences. If none of the options given forms a correct sentence after combination, select ‘None of these’ as your answer.
Column 1
Column 2
A-The accidental firing of the missile broke the armistice
D-and destroyed the chance of peace between the two nations
B-After a year of fighting, the two armies agreed to an armistice
E- do not realise they could be down-and-out too
C-People who think homeless people are dregs of society
F-would allow the soldiers to rest on Christmas day`, qi: ``, o: [`A-F`, `B-F`, `A-D`, `C-D`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 31, s: `Quantitative Aptitude`, q: `Direction: The given table shows the shirts produced in 4 years by a company. Read the given table carefully and answer the given questions.
Year
No. of Shirts produced (in lakh)
% of shirts failed the quality test
2014
3.2
2.5%
2015
4.0
2.25%
2016
2.8
1.25%
2017
3.6
1.25%
Shirts which failed the quality test were not sold
In 2016, if 2300 formal shirts produced failed the quality test and 99% of informal shirts passed the quality test, what was the respective ratio between number of formal shirts to informal shirts in 2016?`, qi: ``, o: [`4 ∶ 3`, `3 ∶ 4`, `8 ∶ 7`, `7 ∶ 8`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 32, s: `Quantitative Aptitude`, q: `Average number of shirts that passed the quality test in 2016 and in 2017 is:`, qi: ``, o: [`324000`, `321000`, `306000`, `316000`, `308000`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 33, s: `Quantitative Aptitude`, q: `Number of shirts that failed quality test reduced by what percent in 2017 compared to 2014?`, qi: ``, o: [`66 2/3 %`, `62 1/2 %`, `56 1/4 %`, `43 3/4 %`, `37 1/2 %`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 34, s: `Quantitative Aptitude`, q: `In 2015, 40% shirts were white and remaining were coloured. How many were coloured shirts?`, qi: ``, o: [`240000`, `246000`, `180000`, `228000`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 35, s: `Quantitative Aptitude`, q: `In 2015, 10% of the shirts that passed the quality test remained unsold. How many remain unsold?`, qi: ``, o: [`48100`, `39100`, `44500`, `47100`, `50200`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 36, s: `Quantitative Aptitude`, q: `In 2014, all shirts which passed the quality test were sold at an average price of Rs. 500 per shirt.
What was the revenue of the time that year? (in crore)`, qi: ``, o: [`1.56`, `15.6`, `5.6`, `12.8`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 37, s: `Quantitative Aptitude`, q: `Ram drives from A to B by car at 90 km/h. He goes to C from B by bike at 60 km/h. The distance between A and C is 200 km, while the average speed between A and C is 75 km/h. What is the
distance traveled by car?`, qi: ``, o: [`90 km`, `80 km`, `75 km`, `120 km`, `60 km`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 38, s: `Quantitative Aptitude`, q: `200 and 180 students of school A & B passed the exam. 20% and 10% students from A and B did not pass the exam. How many students appeared in the exam from both the schools?`, qi: ``, o: [`420`, `360`, `450`, `400`, `480`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 39, s: `Quantitative Aptitude`, q: `Ram sold 2 items A and B at the same price. Profit on one and incurring loss on the other. Ratio between the total S.P. of both items together and total cost price of both items together is 30 : 37. If
he earns 25% profit on selling A, what was the loss incurred in selling of B in Rs. 600?`, qi: ``, o: [`Rs. 450`, `Rs. 400`, `Rs. 300`, `Rs. 360`, `Rs. 200`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 40, s: `Quantitative Aptitude`, q: `The volume of a cylinder is 500π and the radius is 5 cm. The height of the cylinder is equal to the diagonal of a square. Find the perimeter of the square.`, qi: ``, o: [`40√2 cm`, `40 cm`, `10√2 cm`, `80√2 cm`, `10 cm`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 41, s: `Quantitative Aptitude`, q: `A alone can do a work in 20 days. B is 25% more efficient than A. A and B started working and worked for 4 days. If C alone completed the remaining job in 22 days. How many days C alone
takes to complete the entire job?`, qi: ``, o: [`24 days`, `36 days`, `12 days`, `20 days`, `40 days`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 42, s: `Quantitative Aptitude`, q: `A bag contains X red balls and 5 green balls. 2 balls are picked up from the bag at random, one after the other, without replacement, the probability of both balls being red is 3/7. What will be the
value of X?`, qi: ``, o: [`10`, `15`, `13`, `20`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 43, s: `Quantitative Aptitude`, q: `Rs. 7000 divided unequally and invested in scheme A (offered C.I. at 10% p.a. compounded annually) and in scheme B (offered S.I. at 15% p.a.) for 2 years and 3 years respectively. If the
investment earned from scheme A is 84% of the investment earned from scheme B. Find the sum invested in scheme A.`, qi: ``, o: [`Rs. 4500`, `Rs. 2500`, `Rs. 3500`, `Rs. 4000`, `Rs. 3600`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 44, s: `Quantitative Aptitude`, q: `In the following question, two equations are given. You have to solve both the equations and find the relation between ‘x’ and ‘y’ and mark the correct answer.
x2 – 16x + 63 = 0
y2 – 19y + 88 = 0`, qi: ``, o: [`if x > y`, `if x ≥ y`, `if x < y`, `if x ≤ y`, `if x = y or the relationship cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 45, s: `Quantitative Aptitude`, q: `In the following question, two equations are given. You have to solve both the equations and find the relation between ‘x’ and ‘y’ and mark the correct answer.
x2 – 36x + 324 = 0
y2 – 42y + 441 = 0`, qi: ``, o: [`if x > y`, `if x ≥ y`, `if x < y`, `if x ≤ y`, `if x = y or the relationship cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 46, s: `Quantitative Aptitude`, q: `In the following question, two equations are given. You have to solve both the equations and find the relation between ‘x’ and ‘y’ and mark the correct answer.
x2 – 10x + 25 = 0
y2 = 25`, qi: ``, o: [`if x > y`, `if x ≥ y`, `if x < y`, `if x ≤ y`, `if x = y or the relationship cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 47, s: `Quantitative Aptitude`, q: `In the following question, two equations are given. You have to solve both the equations and find the relation between ‘x’ and ‘y’ and mark the correct answer.
x2 + 12x + 35 = 0
y2 + 17y + 72 = 0`, qi: ``, o: [`if x > y`, `if x ≥ y`, `if x < y`, `if x ≤ y`, `if x = y or the relationship cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 48, s: `Quantitative Aptitude`, q: `In the following question, two equations are given. You have to solve both the equations and find the relation between ‘x’ and ‘y’ and mark the correct answer.
3x2 – 7x + 4 = 0
2y2 – 3y + 1 = 0`, qi: ``, o: [`if x > y`, `if x ≥ y`, `if x < y`, `if x ≤ y`, `if x = y or the relationship cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 49, s: `Quantitative Aptitude`, q: `Direction: In the given question, two equations numbered l and II are given. You have to solve both the equations and mark the appropriate answer.
2x2 + 5x + 3 = 0
2y2 – 7y + 6 = 0`, qi: ``, o: [`if x > y`, `if x ≥ y`, `if x < y`, `if x ≤ y`, `if x = y or the relationship cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 50, s: `Quantitative Aptitude`, q: `Direction: A salon distributed 450 vouchers of free haircut and pedicure. The number of haircut vouchers was 130 more than the number of pedicure voucher. The ratio between the male and
female getting the pedicure voucher is 13 ∶ 7. The number of vouchers redeemed by males for haircut was 15 more than that of vouchers redeemed by males for a pedicure. Note: All vouchers were redeemed.
What is the difference between the male and female getting the pedicure voucher?`, qi: ``, o: [`48`, `42`, `54`, `36`, `60`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 51, s: `Quantitative Aptitude`, q: `How many people redeemed the haircut voucher?`, qi: ``, o: [`300`, `160`, `290`, `280`, `310`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 52, s: `Quantitative Aptitude`, q: `How many males redeemed the pedicure voucher?`, qi: ``, o: [`91`, `104`, `117`, `130`, `78`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 53, s: `Quantitative Aptitude`, q: `If 30 people having pedicure voucher took manicure services and 50% people having haircut voucher took manicure voucher services then how many people took manicure services?`, qi: ``, o: [`145`, `155`, `165`, `135`, `175`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 54, s: `Quantitative Aptitude`, q: `Number of females redeeming pedicure voucher are what percent(approximate) of number of people redeeming haircut voucher?`, qi: ``, o: [`21%`, `19%`, `18%`, `16%`, `22%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 55, s: `Quantitative Aptitude`, q: `In the following series one number is wrong, Find out the wrong number.
201, 200, 194, 184, 167, 141, 104`, qi: ``, o: [`201`, `200`, `184`, `167`, `104`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 56, s: `Quantitative Aptitude`, q: `In the following series one number is wrong, Find out the wrong number.
53.9, 52.7, 50.3, 46.7, 40.9, 35.9, 28.7`, qi: ``, o: [`52.7`, `40.9`, `35.9`, `28.7`, `53.9`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 57, s: `Quantitative Aptitude`, q: `In the following series one number is wrong, Find out the wrong number.
9, 12, 71, 158, 259, 368, 478.5`, qi: ``, o: [`478.5`, `71`, `158`, `259`, `368`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 58, s: `Quantitative Aptitude`, q: `In the following series one number is wrong, Find out the wrong number.
5, 4, 7, 20, 79, 395, 2363`, qi: ``, o: [`4`, `7`, `79`, `395`, `2363`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 59, s: `Quantitative Aptitude`, q: `In the following series one number is wrong, Find out the wrong number.
16, 4, 8, 12, 24, 60, 180`, qi: ``, o: [`16`, `4`, `12`, `60`, `180`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 60, s: `Quantitative Aptitude`, q: `Direction: Sale of wox boxes on different days by ABC company.

Boxes sold on Tuesday of both sizes are what percent of large size boxes sold on Friday?`, qi: `image1.png`, o: [`100%`, `105.71%`, `110%`, `115.71%`, `105%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 61, s: `Quantitative Aptitude`, q: `What is the difference between medium size wox box sold on Monday and large size wox box sold on Thursday?`, qi: ``, o: [`2`, `1`, `0`, `3`, `4`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 62, s: `Quantitative Aptitude`, q: `Find the ratio between large size wox box sold on Wednesday and medium size wox box sold on Tuesday.`, qi: ``, o: [`1 ∶ 2`, `2 ∶ 1`, `1 ∶ 3`, `2 ∶ 3`, `1 ∶ 1`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 63, s: `Quantitative Aptitude`, q: `What is the average of medium size wox box sold on Monday, Thursday and Friday?`, qi: ``, o: [`45.67`, `47.67`, `44.67`, `46.67`, `48.67`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 64, s: `Quantitative Aptitude`, q: `Total boxes sold on Monday are what percent of total boxes sold on Thursday?`, qi: ``, o: [`75.7%`, `77.7%`, `87.5%`, `95.7%`, `85.7%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 65, s: `Quantitative Aptitude`, q: `How many large size wox boxes were sold on all the days?`, qi: ``, o: [`226`, `216`, `206`, `196`, `236`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 66, s: `Reasoning Ability`, q: `Study the following information carefully and answer the question given below it.
Few people are sitting in a row facing North. 3 persons are sitting between M and N. K is third to the right of N. K is second to the left of P. Number of person between M and P is same s the number of person between M and L. Only three person sit to the left of L. Six person sits between L and J. Two person sit between P and R. R is sitting at second position from one of the end.
How many persons are sitting in the row?`, qi: ``, o: [`12`, `26`, `29`, `18`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 67, s: `Reasoning Ability`, q: `What is the position of J with respect to M?`, qi: ``, o: [`2nd to the left`, `Immediate right`, `Immediate left`, `2nd to the right`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 68, s: `Reasoning Ability`, q: `How many persons are sitting between M and P?`, qi: ``, o: [`5`, `6`, `7`, `8`, `9`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 69, s: `Reasoning Ability`, q: `Directions: Read the following information carefully and answer the question given below it:
C, D, H, N, F, S and U are seven members of a family. D is the mother of F, N is the son of F. H is the only sister of N and U, S is the father of U. S is the son of C.
If P is the father-in-law of F, then how is C related to U?`, qi: ``, o: [`Mother`, `Grandmother`, `Father`, `Granddaughter`, `Grandson`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 70, s: `Reasoning Ability`, q: `How is H related to F?`, qi: ``, o: [`Daughter`, `Niece`, `Son`, `Father`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 71, s: `Reasoning Ability`, q: `How is N related to D?`, qi: ``, o: [`Daughter`, `Son`, `Granddaughter`, `Grandson`, `Son-in-law`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 72, s: `Reasoning Ability`, q: `Directions: Read the following information carefully and answer the question given below it:
There are 9 boxes kept one above the other. There are 5 boxes between box P and box R. Box T is kept immediately above R. 3 boxes are kept between box T and box S. Number of boxes between P and S is same as the number of boxes between T and Q. Box U is kept below box Q. Box W is kept somewhere below
X. There is only one box kept between U and V. Box U is not kept at the bottom of the stack.
Which of the following statement is not true?
Two boxes between T and Q.
S is kept below W.`, qi: ``, o: [`U is kept immediately above P.`, `Only I`, `Only II`, `Both I and II`, `Both II and III`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 73, s: `Reasoning Ability`, q: `V is related P and Q is related to X in certain manner. To which of the following is U related in the same manner?`, qi: ``, o: [`R`, `W`, `S`, `T`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 74, s: `Reasoning Ability`, q: `How many boxes are kept between X and P?`, qi: ``, o: [`3`, `5`, `6`, `4`, `2`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 75, s: `Reasoning Ability`, q: `Which of the following pair of box is kept immediately above and below box Q respectively?`, qi: ``, o: [`X and S`, `X and W`, `S and R`, `S and W`, `R and X`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 76, s: `Reasoning Ability`, q: `What is the position of box W in the given arrangement?`, qi: ``, o: [`Third from the bottom`, `Fourth from the top`, `Fifth from top`, `Six from the bottom`, `Fourth from the bottom`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 77, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the question given below it:
8 person P, Q, R, S, T, U, V, and W were born in different years viz. 1945, 1956, 1961, 1973, 1978, 1989, 1996 and 2007 but not necessarily in the same order.
S was born in an odd number year. The difference between the present age of S and V is 5. Only 3 people were born between V and T. The present age of W is twice the present age of Q. As many people were born between T and Q as between T and P. R was born in one of the years before P.
(Calculate all ages with respect to the year 2018).
In which year was R born?`, qi: ``, o: [`1945`, `1961`, `1973`, `1989`, `2007`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 78, s: `Reasoning Ability`, q: `What is the age of U?`, qi: ``, o: [`62`, `57`, `22`, `40`, `73`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 79, s: `Reasoning Ability`, q: `What is the difference between the ages of S and R?`, qi: ``, o: [`17`, `18`, `19`, `16`, `15`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 80, s: `Reasoning Ability`, q: `Who was born before W but after U?`, qi: ``, o: [`T`, `P`, `S`, `V`, `R`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 81, s: `Reasoning Ability`, q: `What will be the age of S after 4 years?`, qi: ``, o: [`60`, `77`, `61`, `62`, `76`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 82, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the questions that follow:
Seven people –G, H, J, K, L, M and N are sitting in a row at equal distances to each other and facing north direction. All of them likes different chocolates – Snickers, Dairy milk, Milky bar, 5-star, Kit Kat, Aero and Bar one (not necessarily in the same order). J is sitting exactly in the middle of the row but neither likes Dairy milk nor Bar-one. The one who likes Snickers is sitting sixth to the left of the one who likes Milky bar. G is sitting with the one who likes Milky bar. H is not sitting with J but likes 5-star. M and N are not sitting at any of the extreme ends. K does not like Milky bar. N neither likes Kit Kat nor is sitting with
G. The one who likes Bar one is sitting to the immediate left of the one who likes Dairy milk Who among the following likes Kit Kat?`, qi: ``, o: [`G`, `J`, `K`, `L`, `M`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 83, s: `Reasoning Ability`, q: `Which of the following chocolate does ‘G’ like?`, qi: ``, o: [`Aero`, `Bar one`, `Dairy milk`, `Kit Kat`, `Snickers`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 84, s: `Reasoning Ability`, q: `Which of the following statements is true with respect to K?`, qi: ``, o: [`K does not like Snickers.`, `K is sitting at the extreme right end.`, `K is sitting between H and J.`, `K likes Aero.`, `K is sitting fourth to the left of M.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 85, s: `Reasoning Ability`, q: `Which of the following statements is not true as per the given details?`, qi: ``, o: [`M likes Bar one.`, `J is sitting between M and N.`, `L is sitting third to the right of J.`, `The one who likes 5-star is sitting with the one who likes Kit Kat.`, `L like Milky Bar.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 86, s: `Reasoning Ability`, q: `Which of the following combination is correct?`, qi: ``, o: [`K, Bar one`, `M, 5-star`, `L, Milkybar`, `M, Aero`, `N, Dairy milk`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 87, s: `Reasoning Ability`, q: `How many such pairs of letters are there in the word TRANSPORT which have as many letters between them in the word as in the English alphabetical series?`, qi: ``, o: [`One`, `Two`, `Three`, `More than three`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 88, s: `Reasoning Ability`, q: `If it is possible to make a meaningful word from first, fourth, sixth and ninth letters of the word UNDERNEATH, then which will be the first letter of that word? Mark X if no such word can be
formed, M if more than one such word can be formed.`, qi: ``, o: [`T`, `L`, `E`, `M`, `X`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 89, s: `Reasoning Ability`, q: `Directions: Read the following information carefully and answer the question given below it:
8 people D, E, F, G, H, I, J and K are sitting around a square table in such a way that four of them sit at corners while four sit in the middle of each of the four sides. The ones sitting in the middle of the sides are facing centre and the ones sitting at the corners are facing outside.
F sits second to the right of G. Only 3 people sit between F and J. Only 1 person sits between J and I (either from left or right). D sits second to the left of K. K is neither an immediate neighbour of I nor J. Only 3 people sit between D and E. E does not sit at any of the corners of the table.
Who sits 3rd to the right of H?`, qi: ``, o: [`K`, `E`, `F`, `J`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 90, s: `Reasoning Ability`, q: `What is the position of I with respect to E?`, qi: ``, o: [`Second to the right`, `Third to the right`, `Third to the left`, `Second to the left`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 91, s: `Reasoning Ability`, q: `Which of the following statements is/are true as per the given arrangement?
G is facing inside
H is an immediate neighbour of J.
F is sitting to the immediate left of K`, qi: ``, o: [`Only one`, `Only two`, `Only three`, `Both one and three`, `Both two and three`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 92, s: `Reasoning Ability`, q: `Four of the following five are alike in a certain way. Which of the following does not belong to the group?`, qi: ``, o: [`F`, `I`, `E`, `J`, `G`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 93, s: `Reasoning Ability`, q: `How many people sit between K and G when counted from right of G?`, qi: ``, o: [`One`, `Two`, `Three`, `More than three`, `None`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 94, s: `Reasoning Ability`, q: `Que. 94
Que. 94
Que. 94
Directions: In the following question assuming the given statements to be True, find which of the conclusion among given conclusions is/are definitely true and then give your answers accordingly.
Statement:
D ≤ R > E ≤ B; S ≤ M = E > D; G > B
Conclusion:
D > E
B < R`, qi: ``, o: [`Only I is True`, `Only II is True`, `Either I or II is True`, `Neither I nor II is True`, `Both I and II are True`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 95, s: `Reasoning Ability`, q: `Directions: In the following question assuming the given statements to be True, find which of the conclusion among given conclusions is/are definitely true and then give your answers accordingly.
Statement:
D ≤ R > E ≤ B; S ≤ M = E > D; G > B
Conclusion:
S < B
B = S`, qi: ``, o: [`Only I is True`, `Only II is True`, `Either I or II is True`, `Neither I nor II is True`, `Both I and II are True`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 96, s: `Reasoning Ability`, q: `Directions: In the following question assuming the given statements to be True, find which of the conclusion among given conclusions is/are definitely true and then give your answers accordingly.
Statement:
N = K ≥ L ≥ P < O < U ≥ R; P > F
Conclusion:
F ≥ R
N > F`, qi: ``, o: [`Only I is True`, `Only II is True`, `Either I or II is True`, `Neither I nor II is True`, `Both I and II are True`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 97, s: `Reasoning Ability`, q: `Directions: In the following question assuming the given statements to be True, find which of the conclusion among given conclusions is/are definitely true and then give your answers accordingly.
Statement:
Q > A ≥ Z ≤ X ≤ C; Z = H
Conclusion:
Q > H
Z ≤ C`, qi: ``, o: [`Only I is True`, `Only II is True`, `Either I or II is True`, `Neither I nor II is True`, `Both I and II are True`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 98, s: `Reasoning Ability`, q: `Direction: In the following question, a given questions is followed by information in three statements. You have to find out the data in which statement (s) is sufficient to answer the question
and mark your answer accordingly.
A group of six students G, H, I, J, K and L are sitting around a circular table facing the centre. Who is sitting opposite to H?
L is sitting to the immediate left of K.
K is sitting opposite to G.
H is sitting to the immediate right of G.`, qi: ``, o: [`Data insufficient.`, `All the statements are required.`, `Statements I and II together are sufficient.`, `Statements II and III together are sufficient.`, `Statements I and III together are sufficient.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 99, s: `Reasoning Ability`, q: `Direction: The following question consists of three statements numbered I, II and III. Decide if data given in the statements are sufficient to answer the questions below.
In a company there are 5 people, L, M, N, O and P who have different salary per month. Who earns the least?
Only two people earn more than N
M is not one of the top two paid employees.
Three people earn more than O.`, qi: ``, o: [`Only statement III is sufficient`, `Only I and II are sufficient`, `Only II and III are sufficient`, `All the statements are needed`, `Insufficient data`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 100, s: `Reasoning Ability`, q: `Direction: In the following question, a given questions is followed by information in three statements. You have to decide the data in which statement (s) is/are sufficient to answer the
question and mark your answer accordingly.
In a row of 20 people facing north, what is the position of P from the right?
There are 5 people are standing between P and R.
R is standing eleventh to the right of Q.
Only 3 people are standing to the left of Q.`, qi: ``, o: [`Only I is sufficient`, `Only I and II are sufficient`, `Only I and III are sufficient`, `Only II and III are sufficient`, `All the statements are required`], oi: [``, ``, ``, ``, ``], e: `` }
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
      tags: ['IBPS', 'PO', 'Prelims', 'PYQ', '2018', '13 October 2018'],
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

  const TEST_TITLE = `IBPS PO Prelims - 13 October 2018`;
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2018, pyqShift: `13 October 2018`,
    pyqExamName: 'IBPS PO Prelims', questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
