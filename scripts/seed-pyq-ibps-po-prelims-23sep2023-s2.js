/**
 * Seed: IBPS PO Prelims - 23 September 2023 Shift-2
 * IBPS PO Prelims — Probationary Officer Preliminary Exam.
 * 100 Q × 1 mark, 3 sections (Eng 30 / Reas 35 / Quant 35), 60 min total,
 * sectional timing 20 min each, 0.25 negative marking.
 * Uploads question/option images from local _extracted_ibps_po_23sep2023_s2/ to Cloudinary.
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

const EXTRACTED_DIR = path.resolve(__dirname, '../_extracted_ibps_po_23sep2023_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/ibps-po-prelims-23sep2023-s2';
const F = '23sep2023-s2';

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

const KEY = [2, 5, 4, 2, 2, 1, 3, 4, 3, 4, 2, 3, 1, 5, 2, 4, 1, 3, 2, 4, 4, 1, 3, 5, 2, 4, 5, 2, 2, 4, 2, 3, 1, 2, 4, 3, 3, 4, 1, 2, 4, 2, 5, 2, 3, 3, 3, 3, 2, 2, 4, 4, 2, 3, 5, 1, 3, 1, 4, 3, 5, 3, 5, 2, 4, 1, 3, 4, 5, 4, 4, 2, 3, 2, 4, 2, 3, 5, 2, 2, 3, 3, 2, 3, 4, 1, 5, 2, 2, 4, 2, 3, 5, 3, 1, 5, 2, 5, 2, 2];
const RAW = [
  { n: 1, s: `English Language`, q: `Directions: Read the given passage carefully to answer the following questions. Each question will have five alternatives as its answer. Choose the correct option as your answer.The India Employment Report (IER) 2024 by the Institute for Human Development and International Labour Organization poses questions on the trickle-down effect of benefits to the working class in the backdrop of a 5.4% average real economic growth, from 2015-16 to 2022-23. It also shows a divergent trend between rural and urban areas in terms of employment and income. It demonstrates a relatively higher unemployment rate in urban areas, at 4.8% in 2000 over the 1.5% in rural areas. However, average monthly earnings are higher by 76% for self-employed, 44% for regular employed and 22% for casual labour in urban areas in 2022. The coexistence of higher unemployment and wages requires further investigation to understand its implications for the urban poor. This article looks at the dynamics of employment and wages in pockets of deep urban poverty, such as slums, and juxtaposes these with the findings of the IER 2024.
Directions: Read the given passage carefully to answer the following questions. Each question will have five alternatives as its answer. Choose the correct option as your answer.
The higher income in urban areas and a better life have underrated rural-urban migration in the past. As in the IER 2024, although overall migration has increased, the migration of males has declined by 1.2% during 2000-08 and further marginally in 2021. This implies that migration for economic mobility is losing its sheen. An analysis of income and employment trends among slum dwellers in urban India reveals prospects for economic mobility and decent work, as poor rural households often migrate to slums rather than formal settlements. This writer and a team surveyed 37 slums across different parts of Kolkata in 2012. These slums were again surveyed in 2022-
23. However, we could track only 29 slums as the other slums had either been redeveloped or evicted. We surveyed 513 slum households in 2012 and 396 in 2021-22. To get the overall trends from 2012, we collected data on income and employment in slums in 2019, the pre-COVID-19 year, to avoid the COVID-19-affected years of 2019-22, for comparison.
The major occupations in slums in Kolkata have remained the same over the decade, with a fourth of the working population taking on unskilled labour. It is the most stable and significant occupation in slums. The IER 2024 also finds that a fourth of workers in India were engaged in unskilled work during this period. Other major occupations in slums were skilled or semi-skilled labour work, and people as employees in private organisations, and owning petty businesses or small shops. Unlike unskilled labour, the share of employment in skilled and semi-skilled labour was reduced by 6%, and in private organisations by 3% between 2012-19. On the other hand, employment has increased by 9% in petty businesses or small shops. Surprisingly, the share of other self-employed has also declined by 3%. Among occupations that were less popular earlier but which gained
momentum in the last 10 years are truck driving and cleaning, by 5%, and construction and related work, by 4%. The number of people employed in construction and related work was minuscule in 2012.
What does the passage reveal about the evolution of major occupations in Kolkata's slums over the past decade?`, qi: ``, o: [`There has been a significant shift towards skilled and semi-skilled labour occupations.`, `Unskilled labour remains the most stable and predominant occupation in slums.`, `Employment in private organizations has consistently increased over the years.`, `The number of self-employed individuals has declined steadily since 2012.`, `Truck driving and cleaning declined in popularity compared to construction work.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 2, s: `English Language`, q: `What does the passage suggest about the migration patterns in India based on the IER 2024?`, qi: ``, o: [`Female migration is increasing, contributing to urbanization without slum settlement preference.`, `Economic factors are driving increased migration to rural areas instead of urban centres.`, `Migration patterns are stable, with no significant changes observed in rural-urban migration trends.`, `Economic factors are driving increased migration to urban centres instead of rural areas.`, `Male migration for economic reasons is decreasing, leading to increased migration to urban slums.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 3, s: `English Language`, q: `Which of the following sentence(s) can be inferred from the passage?
Over the decade, the proportion of individuals engaged in skilled and semi-skilled labour decreased
by 6%.
Higher unemployment rates in urban areas are juxtaposed with significantly higher average monthly earnings.
Migration for economic mobility among males declined by 1.2% during 2000-08 and marginally in 2021.`, qi: ``, o: [`Only A`, `Both B and C`, `Only C`, `All A, B, and C`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 4, s: `English Language`, q: `What trend does the IER 2024 highlight regarding unemployment rates between rural and urban areas?`, qi: ``, o: [`Urban areas consistently have lower unemployment rates compared to rural areas.`, `Urban areas experience higher unemployment rates compared to rural areas.`, `There is no significant difference in unemployment rates between rural and urban areas.`, `Unemployment rates have been declining steadily in both rural and urban areas.`, `Urban areas witness a surge in unemployment rates while rural areas remain stable.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 5, s: `English Language`, q: `Which of the highlighted words from the passage is grammatically/contextually incorrect?`, qi: ``, o: [`coexistence`, `underrated`, `petty`, `momentum`, `All are correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 6, s: `English Language`, q: `Which of the following inferences can be drawn from the underlined sentence from the passage?`, qi: ``, o: [`Migration to urban slums in India offers potential economic advancement and job opportunities for poor rural households.`, `Stagnation in urban slums' economy persists, with a significant portion engaged in unskilled labour for over a decade.`, `Choosing formal settlements over urban slums limits economic mobility and work prospects for poor rural households in India.`, `Investigating simultaneous high unemployment and wages is crucial for understanding urban poverty dynamics.`, `Income and employment conditions in urban slums tend to perpetuate rather than alleviate systemic poverty and inequality.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 7, s: `English Language`, q: `Which of the following sentences are TRUE/FALSE according to the passage?
Skilled and semi-skilled labour saw a 6% increase, unlike unskilled labour.
Employment in skilled and semi-skilled labour decreased over the decade.
The urban unemployment rate decreased consistently from 2015-16 to 2022-23.
The number of surveyed slum households decreased from 513 to 396.
Urban areas exhibit higher unemployment rates compared to rural areas.`, qi: ``, o: [`Both B and C are true`, `Only D is false`, `All B, D, and E are true`, `Both B and D are false`, `All A, B, and C are true`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 8, s: `English Language`, q: `Which of the following sentence(s) cannot be inferred from the passage?
The lower wages in urban areas have resulted in a decrease in migration for economic mobility.
The survey revealed that all 396 households in 2021-22 had improved economically since 2012.
Truck driving and cleaning have decreased in popularity as occupations in slums in the last decade.`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `All A, B, and C`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 9, s: `English Language`, q: `What conclusion can be drawn from the third paragraph of the passage?`, qi: ``, o: [`The divergence in employment and income trends between rural and urban areas is highlighted in the report, emphasizing the dynamics of slum economies.`, `The data collected from Kolkata's slums shows a shift towards formal employment and away from self-employment, contradicting the findings of the IER 2024.`, `While unskilled labour remains dominant in Kolkata's slums, skilled labour and formal employment have decreased, replaced by petty businesses.`, `The survey conducted in 2022-23 covered all 37 slums in Kolkata that were surveyed in 2012, although some slums had either been redeveloped or evicted.`, `The income and employment trends in slums were found to be unaffected by the COVID-19 pandemic during the pre-COVID-19 year of 2019.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 10, s: `English Language`, q: `Directions: In each of the questions below, four sentences are given that may or may not contain an error. Choose the one that is grammatically as well as contextually correct and meaningful. If
all the sentences are correct, mark 'All are correct as your answer'.`, qi: ``, o: [`Neither the contestants nor the principal were aware of the fire.`, `Instead criticizing why don't you help with the presentation?`, `It is requested that a detailed report be sent urgent on the representations and ongoing strike by the employees.`, `Neither Sameera nor Vinod knows anything about the accident.`, `All are correct.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 11, s: `English Language`, q: `Directions: In each of the questions below, four sentences are given that may or may not contain an error. Choose the one that is grammatically as well as contextually correct and meaningful. If
all the sentences are correct, mark 'All are correct as your answer'.`, qi: ``, o: [`The developers submitted building plans to the council for the approval.`, `The girl, with several others, was late for school.`, `She was heavily fined last month for coming lately.`, `Each of the ladies have a designer handbag.`, `All are correct.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 12, s: `English Language`, q: `Directions: In each of the questions below, four sentences are given that may or may not contain an error. Choose the one that is grammatically as well as contextually correct and meaningful. If
all the sentences are correct, mark 'All are correct as your answer'.`, qi: ``, o: [`I see you have eaten fewer than ten percent of your mashed potatoes`, `A different policeman has been assigned with the case.`, `No sooner had he arrived in Delhi than he was kidnapped.`, `Five kilograms of flour are all that I need for my baking.`, `All are correct.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 13, s: `English Language`, q: `Directions: In each of the questions below, four sentences are given that may or may not contain an error. Choose the one that is grammatically as well as contextually correct and meaningful. If
all the sentences are correct, mark 'All are correct as your answer'.`, qi: ``, o: [`Several members of the party have resurrected the idea of constitutional change.`, `I clearly empathize with the people who lives in those neighborhoods.`, `When the ship finally reached land, only a few of the crew was left to witness the event.`, `Everyone have their own ideas about the best way to bring up children.`, `All are correct.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 14, s: `English Language`, q: `Directions: In the following questions, there is a statement divided into five parts, when arranged properly forms a coherent sentence both grammatically and contextually. Choose the best
alternative among the five options given below each statement as your answer.
were not protected in the epidemic, and (A)/ the outbreak was originally mistaken for Japanese encephalitis, (B)/ who had been vaccinated against Japanese encephalitis (C)/ but physicians in the area noted that persons (D)/ the number of cases among adults was unusual (E)/`, qi: ``, o: [`DABEC`, `ABCED`, `CBDAE`, `EDABC`, `BDCAE`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 15, s: `English Language`, q: `Directions: In the following questions, there is a statement divided into five parts, when arranged properly forms a coherent sentence both grammatically and contextually. Choose the best
alternative among the five options given below each statement as your answer.
of petroleum-based jet fuel but with a fraction (A)/ of its carbon footprint, giving airlines solid footing (B)/ SAF made from renewable biomass and waste resources (C)/ for decoupling greenhouse gas (GHG) emissions from flight (D)/ has the potential to deliver the performance (E)/`, qi: ``, o: [`AEDCB`, `CEABD`, `DCBAE`, `EDCBA`, `BCDEA`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 16, s: `English Language`, q: `Directions: In the following questions, there is a statement divided into five parts, when arranged properly forms a coherent sentence both grammatically and contextually. Choose the best
alternative among the five options given below each statement as your answer.
registered with the Bureau of Patents (A)/ first mass-produced commercially by (B)/ Magdalo V. Francisco Sr. who founded (C)/ in 1942, banana ketchup was (D)/ the brand name Mafran which he (E)/`, qi: ``, o: [`BAEDC`, `EBACD`, `CAEBD`, `DBCEA`, `ADCBE`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 17, s: `English Language`, q: `Directions: The question below has two blanks, each blank indicating that something has been omitted. Choose the set of words for each blank that best fit the meaning of the sentence as a
whole.
Rekha's family hired 	personnel to 	her in daily tasks like bathing and preparing meals.`, qi: ``, o: [`assistive, support`, `sabotage, antagonistic`, `undercut, hostile`, `weaken, fierce`, `controvert, scrape`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 18, s: `English Language`, q: `Directions: The question below has two blanks, each blank indicating that something has been omitted. Choose the set of words for each blank that best fit the meaning of the sentence as a
whole.
Red Cross workers usually 	in the 	of victims of natural disasters by providing medical care to those who are injured.`, qi: ``, o: [`relapse, obstacle`, `regression, constraint`, `aid, recovery`, `loss, hindrance`, `misplace, drawback`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 19, s: `English Language`, q: `Directions: The question below has two blanks, each blank indicating that something has been omitted. Choose the set of words for each blank that best fit the meaning of the sentence as a
whole.
My supervisor won’t 	my day off because there is no one to 	my shift.`, qi: ``, o: [`bare, proscribe`, `approve, cover`, `expose, prohibit`, `omit, interdict`, `slur, neglect`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 20, s: `English Language`, q: `Directions: The question below has two blanks, each blank indicating that something has been omitted. Choose the set of words for each blank that best fit the meaning of the sentence as a
whole.
If you want to 	your lawn, you will need to water it 	so it stays nice and fresh.`, qi: ``, o: [`rare, ignore`, `seldom, withdraw`, `perpetually, retract`, `maintain, frequently`, `constant, negotiate`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 21, s: `English Language`, q: `Directions: Five sentences A, B, C, D, and E are given below, You need to rearrange the sentences so that the five sentences can together form a meaningful paragraph.
Educated at the University of Pennsylvania in physics, Musk started getting his feet wet as a serial tech entrepreneur.
He is surpassed only by Jeff Bezos as the richest person in the world.
He was instrumental in creating the company that became PayPal.
Elon Musk is the charismatic co-founder and CEO of electric car maker Tesla and rocket manufacturer SpaceX.
His astounding success has given rise to comparisons to other visionary businessmen.
Which of the following should be the FIRST sentence after rearrangement?`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 22, s: `English Language`, q: `Which of the following should be the SECOND sentence after rearrangement?`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 23, s: `English Language`, q: `Which of the following should be the THIRD sentence after rearrangement?`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 24, s: `English Language`, q: `Which of the following should be the FOURTH sentence after rearrangement?`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 25, s: `English Language`, q: `Which of the following should be the FIFTH sentence after rearrangement?`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 26, s: `English Language`, q: `Directions: Select the phrase from the options below that should replace the underlined phrase in the sentence to make it grammatically correct. If the sentence is already correct, select 'No
correction required' as your answer.
As a whole, the Malays are, however, remarkably healthy people, and deformity and hereditary diseases is rare between them.`, qi: ``, o: [`Is rare among them`, `Was rare between them`, `Was rare among them`, `Are rare among them`, `No correction required`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 27, s: `English Language`, q: `Directions: Select the phrase from the options below that should replace the underlined phrase in the sentence to make it grammatically correct. If the sentence is already correct, select 'No
correction required' as your answer.
The location is one of the most important things to consider when buying a house.`, qi: ``, o: [`Are one of the most important things`, `Is one of the most important thing`, `Are one of the most important thing`, `One of the most important thing`, `No correction required`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 28, s: `English Language`, q: `Directions: Select the phrase from the options below that should replace the underlined phrase in the sentence to make it grammatically correct. If the sentence is already correct, select 'No
correction required' as your answer.
It is also important to check to see if each resident has a pitcher of water in his or her room for reach of the bed.`, qi: ``, o: [`Her room during reach`, `Her room within reach`, `Her room among reach`, `His room across reach`, `No correction required`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 29, s: `English Language`, q: `Directions: In the following question, a sentence is given with four words marked as (A), (B), (C), and (D). These words may or may not be placed in the correct order. Four options with different
arrangements of these words have been provided. Mark the option with the correct arrangement as the answer. If no rearrangement is required, mark option (5) as your answer.
If you want to maintain(A) your lawn, you will need to fresh(B) the grass and water it frequently(C) so it stays nice and mow(D).`, qi: ``, o: [`A-C`, `B-D`, `C-D`, `A-B`, `No change required`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 30, s: `English Language`, q: `Directions: In the following question, a sentence is given with four words marked as (A), (B), (C), and (D). These words may or may not be placed in the correct order. Four options with different
arrangements of these words have been provided. Mark the option with the correct arrangement as the answer. If no rearrangement is required, mark option (5) as your answer.
Even though the alibi(A) could not substantiate(B) his defendant(C) for the night of the murder, he was still found innocent(D) of all charges.
D-A`, qi: ``, o: [`C-B`, `B-D`, `A-C`, `No change required`, `Que. 31Que. 31`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 31, s: `Quantitative Aptitude`, q: `Que. 31
Table below shows the number of male and female students studying in three different institutions AMU, MMH, and LPU in two sections A and B.
Institutions
Ratio of male
Ratio of female
Number of students
students in section A to that in section B
in section B is how much more than the number of students in section A
AMU
3: 4
6: 5
10
MMH
1: 3
5: 4
20
LPU
4: 3
2: 3
15
Note:
Male students in AMU college are 50 more than female students in that college.
Female students in colleges MMH and LPU are 30 and 55 respectively more than the number of male students.
Number of males in section B from college AMU is what percentage of the total number of males from section B from all the colleges.`, qi: ``, o: [`55.55%`, `44.44%`, `34.78%`, `88.78%`, `33.33%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 32, s: `Quantitative Aptitude`, q: `If average number of male students in section A of colleges AMU, MMH, LPU, and PQR is 45 and average number of female students in section A of these 4 colleges is 40, then find the total number of
students in section A to college PQR.`, qi: ``, o: [`150`, `140`, `110`, `120`, `130`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 33, s: `Quantitative Aptitude`, q: `Find the ratio of total number of students in section A to colleges AMU and MMH together to the total number of female students in section B of all the three colleges together.`, qi: ``, o: [`1: 1`, `2: 1`, `3: 2`, `2: 3`, `1: 2`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 34, s: `Quantitative Aptitude`, q: `If ratio of male students to female students in section C of LPU college is 10: 7 and total students in section C in LPU college is equal to the total students in section B of MMH college, then find the total
number of male students in all the three sections together of LPU college.`, qi: ``, o: [`140`, `120`, `130`, `150`, `160`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 35, s: `Quantitative Aptitude`, q: `Find the difference between the total number of male students from the colleges AMU and MMH together and the total number of female students the colleges MMH and LPU together.`, qi: ``, o: [`75`, `60`, `65`, `50`, `55`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 36, s: `Quantitative Aptitude`, q: `Out of total male and female students from college MMH, x and (x + 10) are interested in internships respectively. If total students from college MMH who are not interested in internship are 40, find the
value of 'x'.`, qi: ``, o: [`35`, `45`, `50`, `55`, `40`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 37, s: `Quantitative Aptitude`, q: `The ratio of the speed of a boat in still water to the speed of the stream is 5 ∶ 1, if a boat can row a distance of 120 km upstream in 2 hrs more than the time taken to travel the same distance downstream,
find the speed of boat in still water?`, qi: ``, o: [`12 km/hr`, `18 km/hr`, `25 km/hr`, `20 km/hr`, `21 km/hr`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 38, s: `Quantitative Aptitude`, q: `A sum of money is invested for '2t' years at R% simple rate of interest and interest amount received is 40% of the sum invested. If same sum is invested at 2 years at 2R% annual rate of compound interest,
then interest amount received is 44% of the sum invested. Find the value of 't'.`, qi: ``, o: [`8 years`, `5 years`, `6 years`, `2 years`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 39, s: `Quantitative Aptitude`, q: `Two partners Nisha and Arun enter into a partnership with initial investment of Rs. 2000 and Rs. 3000 respectively. After 4 months, Nisha invested Rs. P more such that share of Arun in the annual profit is
9/10 of Nisha's profit share. Find the value of P.`, qi: ``, o: [`Rs. 2000`, `Rs. 4000`, `Rs. 6000`, `Rs. 1000`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 40, s: `Quantitative Aptitude`, q: `What approximate value should come in the place of question mark (?) in the following question? (71.98 + 143.9 × 3.99) ÷ 17.95 + 27.98 = ?`, qi: ``, o: [`72`, `64`, `56`, `48`, `32`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 41, s: `Quantitative Aptitude`, q: `What approximate value should come in the place of question mark (?) in the following question?
39.99% of (124.95 ÷ 25.05 × 3.94 + 15.05) = ?`, qi: ``, o: [`21`, `7`, `24`, `14`, `28`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 42, s: `Quantitative Aptitude`, q: `What approximate value should come in the place of question mark (?) in the following question?
6.972 + 161.92 ÷ 2.992 – 6.99 × 8.99 = ?`, qi: ``, o: [`8`, `4`, `2`, `161`, `12`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 43, s: `Quantitative Aptitude`, q: `What approximate value should come in the place of question mark (?) in the following question?
79.98% of 599.98 + 192.02 ÷ 31.92 = √35.96 × ?`, qi: ``, o: [`63`, `56`, `78`, `72`, `81`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 44, s: `Quantitative Aptitude`, q: `What approximate value should come in the place of question mark (?) in the following question?
11.98 – [25.96 – {1.98 + 4.95 × (6.06 – 2.93)}] = ?`, qi: ``, o: [`7`, `3`, `1`, `-2`, `5`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 45, s: `Quantitative Aptitude`, q: `Cost of a fan is 250 more than the cost of a bulb. If bulb is sold at 35% profit and fan is sold at 40% loss, the selling price of bulb and fan becomes equal. Find the cost of bulb.`, qi: ``, o: [`Rs. 600`, `Rs. 300`, `Rs. 200`, `Rs. 500`, `Rs. 400`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 46, s: `Quantitative Aptitude`, q: `Width of a rectangle is 6 cm and length of rectangle is equal to the side of a square. If side of a square is decreased by 4, then area of square becomes 3 cm2 more than the area of rectangle, then find the
area of rectangle.`, qi: ``, o: [`67`, `54`, `78`, `88`, `90`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 47, s: `Quantitative Aptitude`, q: `Train A running with the speed of 36 km/hr crosses a pole in 20 seconds. Another train B whose length is 100 metre more than length of train A is running with the speed of 18 km/hr. Find the time taken by
train B to cross a platform of length 500 metre.`, qi: ``, o: [`200 seconds`, `150 seconds`, `160 seconds`, `140 seconds`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 48, s: `Quantitative Aptitude`, q: `The given bar - graph shows the total number of health insurance sold to male and females, and the number of vehicle insurance sold to females by three different agents A, B and C.

Note:
All the agents each sold health insurance to 50 males
Ratio of vehicle insurance sold to female to male by each agent is 5: 4 respectively.
If agent A sold '2y' more health and 'y' more vehicle insurance such that total number of vehicle insurance sold by him becomes 27 less than total number of health insurance sold by him. Find the value of 'y'.`, qi: `image3.png`, o: [`25`, `45`, `30`, `35`, `40`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 49, s: `Quantitative Aptitude`, q: `Find the ratio between the health and vehicle insurance sold by A to the number of health and vehicle insurance sold by C.`, qi: `image3.png`, o: [`322: 351`, `303: 239`, `301: 334`, `327: 329`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 50, s: `Quantitative Aptitude`, q: `If cost per person of health insurance and vehicle insurance policy is ₹1500 and 2000 respectively, then find the difference between total cost of all the health insurance done by B and total cost of all the
vehicle insurance done by C?`, qi: `image3.png`, o: [`21000`, `18000`, `12000`, `15000`, `19000`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 51, s: `Quantitative Aptitude`, q: `Health insurance sold to females by agent A is what percentage of the total number of health insurance sold to females by all the agents.`, qi: `image3.png`, o: [`43.78%`, `28.89%`, `34.78%`, `38.46%`, `26.68%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 52, s: `Quantitative Aptitude`, q: `If the vehicle insurance sold by B to all the people is 21% of ‘x ‘then the health insurance sold by B to all the people is what percent value of x?`, qi: `image3.png`, o: [`10%`, `15%`, `30%`, `20%`, `25%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 53, s: `Quantitative Aptitude`, q: `A and B are two inlet pipes connected to a cistern, can alone fill it in 20 hours and 24 hours respectively. There is third pipe C which can empty 160 litres of water in one hour from the cistern. If
all three pipes are opened together cistern gets filled in 40 hours. Find the total capacity of the cistern.
1920 liters`, qi: ``, o: [`2400 liters`, `2240 liters`, `2720 liters`, `3000 liters`, `Que. 54Que. 54A mixture contains Alcohol and water in the ratio 7 : 5. When 5 litres of water and 6 litres of alcohol is added to the mixture, the ratio of alcohol to water in the resultant mixture becomes 34 : 25. Find the`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 54, s: `Quantitative Aptitude`, q: `Que. 54
initial quantity of the mixture.`, qi: ``, o: [`189 litres`, `190 litres`, `48 litres`, `58 litres`, `None of these.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 55, s: `Quantitative Aptitude`, q: `What should come in place of the question mark '?' in the following number series?
63, 80, 99, ?, 143, 168`, qi: ``, o: [`121`, `122`, `124`, `126`, `120`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 56, s: `Quantitative Aptitude`, q: `What should come in place of the question mark '?' in the following number series?
7, 8, 17, 52, ?, 1046`, qi: ``, o: [`209`, `316`, `329`, `263`, `291`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 57, s: `Quantitative Aptitude`, q: `What should come in place of the question mark '?' in the following number series?
16, 160, 281, 381, ?, 526`, qi: ``, o: [`432`, `442`, `462`, `452`, `472 Que. 58Que. 58What will come in place of the question mark (?) in the following series? 103, 615, 958, 1174, 1299, 1363, ?`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 58, s: `Quantitative Aptitude`, q: `Que. 58`, qi: ``, o: [`1390`, `1408`, `1583`, `1498`, `2458`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 59, s: `Quantitative Aptitude`, q: `What should come in place of the question mark '?' in the following number series?
7, 7, 14, ?, 168, 840`, qi: ``, o: [`39`, `40`, `41`, `42`, `43`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 60, s: `Quantitative Aptitude`, q: `Tickets numbered 1 to 50 are mixed up and then a ticket is drawn at random. What is the probability that the ticket drawn bears a number which is a multiple of 8?`, qi: ``, o: [`1/7`, `7/26`, `3/25`, `2/5`, `3/5`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 61, s: `Quantitative Aptitude`, q: `Set A contains 3 consecutive prime numbers while set B contains 2 consecutive odd numbers. Sum of largest number of set A and set B is 64 while largest number of set A is 4 less than the 3 times of largest
number of set B. Find the smallest number of set A.`, qi: ``, o: [`47`, `43`, `53`, `59`, `41`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 62, s: `Quantitative Aptitude`, q: `Subhash spends 40% of his monthly income on household items, 20% of his monthly income on buying clothes, 10% of his monthly income on investing in recurring deposits, and the remaining
amount of Rs. 15,000 he saves. What is Subhash's monthly income?`, qi: ``, o: [`Rs. 25,000`, `Rs. 1,00,000`, `Rs. 50,000`, `Rs. 45,000`, `Rs. 48,000`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 63, s: `Quantitative Aptitude`, q: `Directions: Given below are two quantities named I and II. Based on the given information, you have to determine the relation between the two quantities. You should use the given data and your
knowledge of Mathematics to choose among the possible answers. a = -3, b = -1 and c = 6
Quantity I: Find the value of (a3 + b2 + c2) / 4
Quantity II: Find the value of [a / (a3 + b2)]`, qi: ``, o: [`Quantity I = Quantity II`, `Quantity I ≥ Quantity II`, `Quantity I ≤ Quantity II`, `Quantity I ˂ Quantity II`, `Quantity I ˃ Quantity II`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 64, s: `Quantitative Aptitude`, q: `Direction: Given below are two quantities named A and B. Based on the given information you have to determine the relation between the two quantities. You should use the given data and your
knowledge of Mathematics to choose between the possible answers.
The perimeter of a square is equal to twice the perimeter of a rectangle of length 11 cm and breadth 10 cm. Quantity A: What is the circumference of the semicircle whose diameter is equal to the side of the square? Quantity B: What is the circumference of the circle which is inscribed inside the square?`, qi: ``, o: [`Quantity A > Quantity B`, `Quantity A < Quantity B`, `Quantity A ≥ Quantity B`, `Quantity A ≤ Quantity B`, `Quantity A = Quantity B or No relation`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 65, s: `Quantitative Aptitude`, q: `Directions: Two quantities A and B are given in the following questions. You have to find the value to both A and B by using your knowledge of mathematics and choose the most suitable relation between
the magnitude of A and B from the given options.
Quantity A - Distance between trains after 3 hours. Train X travels 420 km in 7 hours. Ratio of speeds of train X and Y is 5 : 3. Trains are 100 km apart and are travelling towards each other.
Quantity B - Distance (in km) travelled in 2 hours. Bus can travel 300 m in 12 seconds.`, qi: ``, o: [`Quantity A ≥ Quantity B`, `Quantity A ≤ Quantity B`, `Quantity A = Quantity B or no relationship can be established`, `Quantity A > Quantity B`, `Quantity A < Quantity B`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 66, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions given below.
Seven persons A, B, C, D, E, F, and G are sitting in a straight row. Some of them are facing the north while others face the south direction. Two people sit between B and A, who sit at one of the extreme ends of the row. B is second to the left of E. E and A are facing the same direction. E is not an immediate neighbor of A. D is sitting second to the right of G. G faces opposite the direction of E. Persons sitting on the extreme ends face opposite directions. C is not sitting on the extreme end and is not the immediate neighbor of F. F is sitting to the right of D but is not an immediate neighbor of the person who faces the south direction. The immediate neighbor of D faces the same direction. Not more than two persons facing north direction sit adjacent to each other.
Who sits second to the left of B?`, qi: ``, o: [`E`, `D`, `G`, `A`, `C`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 67, s: `Reasoning Ability`, q: `Number of persons sitting right to C is one less than the number of persons sitting to the left of   .`, qi: ``, o: [`The one who sits immediate right of D.`, `A`, `G`, `The one who sits immediate left of F.`, `F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 68, s: `Reasoning Ability`, q: `Who among the following person is standing to the right of the one who stands immediate left of G?`, qi: ``, o: [`The one who stand immediate left of E.`, `A`, `The one who stands immediate right of D.`, `F`, `C`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 69, s: `Reasoning Ability`, q: `What is the position of D from the left end?`, qi: ``, o: [`First`, `Fifth`, `Sixth`, `Second`, `Third`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 70, s: `Reasoning Ability`, q: `How many persons are facing North direction?`, qi: ``, o: [`Two`, `One`, `Five`, `Three`, `Seven`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 71, s: `Reasoning Ability`, q: `Each of the vowels in the word "RANDOM" is replaced by number "2" and each consonant is replaced by a number which is the serial number of that consonant in the word i.e., R by 1, N by 3 and so on.
What is the total of all the numbers once the replacement is completed?`, qi: ``, o: [`14`, `15`, `20`, `18`, `19`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 72, s: `Reasoning Ability`, q: `Direction: In the following question, assuming the given statement to be true, find which of the conclusion(s) among the given conclusions is/are definitely true, and then give your answers
accordingly.
Statement:
M < T ≤ Q < D; P > A = W ≥ D
Conclusions:
W ≥ T
P > Q`, qi: ``, o: [`Only I follows`, `Only Il follows`, `Either I or II follows`, `Both I and II follow`, `Neither I or II follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 73, s: `Reasoning Ability`, q: `Direction: In the following question, assuming the given statement to be true, find which of the conclusion(s) among the given conclusions is/are definitely true, and then give your answers
accordingly.
Statement:
R < V > C ≥ S < N; Q ≥ O > S
Conclusions:
V > O
Q > C`, qi: ``, o: [`Only I follows`, `Only Il follows`, `Neither I or II follows`, `Both follow`, `Either I or II follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 74, s: `Reasoning Ability`, q: `Direction: In the following question, assuming the given statement to be true, find which of the conclusion(s) among the given conclusions is/are definitely true, and then give your answers
accordingly.
Statement:
C < P = R > N > S; Z < S ≤ O < G
Conclusions:
O > R
P > Z`, qi: ``, o: [`Only I follows`, `Only Il follows`, `Neither I or II follows`, `Either I or II follows`, `Both I and II follow`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 75, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions given below.
Six persons Meena, Ritu, Karan, Priya, Vivek, and Lalit visited different Label ATMs on two different dates either the 5th or 18th in three months viz. January, March, and April of the same year. Each of them uses different types of ATMs viz. Green, Brown, Yellow, Pink, Orange, and White. All the information given is not in the same order. Karan and Priya visited the ATM in the same month. Karan visited the ATM before Ritu. A person visited the white Label ATM on 5th January. Two persons visited in between the persons who visited White and Brown Label ATMs. Lalit and Vivek visited the ATM on the same date. The person visited Pink Label ATM in the month which has 30 days only. Two Persons visited in between Meena and the one who visited the
Pink Label ATM. Ritu does not visit Pink Label ATM. Priya and Vivek visited the ATM on different dates. The person visited the Green Label ATM just before the Yellow Label ATM. Meena does not visit Yellow Label ATM. Lalit does not visit Pink Label ATM.
Which of the following colors does ATM Karan like?`, qi: ``, o: [`Orange`, `Pink`, `Brown`, `Yellow`, `White`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 76, s: `Reasoning Ability`, q: `Four of the following five are alike in a certain way and hence they form a group. Which of the following does not belong to that group.`, qi: ``, o: [`Lalit`, `Ritu`, `Priya`, `Meena`, `Karan`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 77, s: `Reasoning Ability`, q: `How many persons went to ATM between Priya and Ritu?`, qi: ``, o: [`Two`, `Three`, `One`, `Five`, `Four`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 78, s: `Reasoning Ability`, q: `Which of the following statements is/are false with respect to Vivek?
Vivek went to Pink Label ATM.
Vivek went to an ATM in April.
Vivek went to the ATM on the18th.`, qi: ``, o: [`Only I`, `Only II`, `Only I and II`, `Only II and III`, `Only III`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 79, s: `Reasoning Ability`, q: `Who among the following pairs are visiting ATM in month of April?`, qi: ``, o: [`Meena, Ritu`, `Vivek, Ritu`, `Lalit, Priya`, `Karan, Meena`, `Vivek, Meena`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 80, s: `Reasoning Ability`, q: `Directions: Study the given information and answer the questions that follow.
Point A is 12 meters to the West of B. B is to the North of C. H is the midpoint of B and C. F is 9 meters to the West of E. E is 13 meters to the North of D. Distance Between C and D is 6 meters. E is in the North East direction of C. Distance between A and H is 13 meters. G is 8 meters South of F. G is in the West direction of H.
What is the distance between B and C?`, qi: ``, o: [`8 meters`, `10 meters`, `12 meters`, `14 meters`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 81, s: `Reasoning Ability`, q: `What Is the Distance between G and H?`, qi: ``, o: [`7 meters`, `11 meters`, `3 meters`, `5 meters`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 82, s: `Reasoning Ability`, q: `In which direction is C with respect to D?`, qi: ``, o: [`South`, `East`, `West`, `South East`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 83, s: `Reasoning Ability`, q: `How many such pairs of letters are there in the word "MACAROONS" which has as many letters between them as in the English alphabetical order (both forward and backward)?`, qi: ``, o: [`Three`, `One`, `More than three`, `Two`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 84, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions given below.
Five friends Ajay, Rahul, Soni, Mayank, and Paras are living in a five-storey building. The lowermost floor is numbered 1 and the floor above it is 2 and so on till the topmost floor is numbered 5. Each of them has a different bike viz. Hero, Royal Enfield, Jawa, Ola, and Ampere. All the given information is not necessarily in the same order. The person sitting on the third floor has an Ampere bike. One floor is between Soni and the one who has an Ampere bike. Mayank is living either immediately above or below Soni. The one who has Ola lives immediately above the one who has a Royal Enfield bike. One person lives between Ajay and Paras. Rahul does not have a Jawa or Hero bike. Soni does not have a Hero bike. Ajay does not have Ola and Royal Enfield.
Paras does not live on the topmost floor.
Which of the following statements is true with respect to the final arrangement.`, qi: ``, o: [`Rahul has Royal Enfield.`, `Mayank lives three floors above Soni.`, `Soni lives on the floor above Ajay.`, `Paras has a Hero bike.`, `Ajay lives on the second floor.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 85, s: `Reasoning Ability`, q: `Who among the following person lives immediately above the one who have Ola?`, qi: ``, o: [`The one who have Hero bike.`, `Soni`, `The one who lives immediately below Paras.`, `The one who has Ampere bike.`, `Mayank`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 86, s: `Reasoning Ability`, q: `Who lives on the floor number three?`, qi: ``, o: [`Ajay`, `Mayank`, `Paras`, `Soni`, `Rahul`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 87, s: `Reasoning Ability`, q: `Who among the following has Hero bike?`, qi: ``, o: [`Ajay`, `Paras`, `Rahul`, `Soni`, `Mayank`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 88, s: `Reasoning Ability`, q: `How many people are living between the floor of Paras and Soni?`, qi: ``, o: [`Either two or three`, `Three`, `Two`, `One`, `Either one or two`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 89, s: `Reasoning Ability`, q: `In the following question below are given some statements followed by some conclusions based on those statements. Take the given statements to be true even if they seem to be at a variance from
commonly known facts. Read all the conclusions and then decide which of the given conclusions logically follow the given statements.
Statements:
All dams are wood.
Some wood are chairs.
No chairs are umbrellas.
Conclusions:
Some umbrellas are wood.
All wood are dams.`, qi: ``, o: [`Only conclusion I follows`, `Neither conclusion I nor II follow`, `Only conclusion II follows`, `Both conclusion I and II follow`, `Either conclusion I or II follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 90, s: `Reasoning Ability`, q: `Directions: In the question below are given statements followed by conclusions. You have to take the given statements to be true even if they seem to be at variance with commonly known facts. Read all
the conclusions and then decide which of the given conclusions logically follows from the given statements disregarding commonly known facts.
Statement:
Only a few Genes are DNA Some DNA is RNA
No RNA is Protein
Conclusion:
All DNA is Protein is a possibility
All Genes being Protein is a possibility
All Protein is DNA`, qi: ``, o: [`Only I follow`, `Both I and III follows`, `Either I or III follows`, `Only II follows`, `None follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 91, s: `Reasoning Ability`, q: `Directions: In the question below are given statement followed by three conclusions numbered I, II and III. You have to take the given statements to be true even if they seem to be at variance with
commonly known facts. Read all the conclusions and then decide which of the given conclusions logically follows from the given statements disregarding commonly known facts.
Statement:
Only a few Fan are bulb All Bulb are switch
Some switch are tube light
Conclusion:
I: All Fan is switch is a possibility II: Some switch is fan
III: Some bulb is tube light`, qi: ``, o: [`Either I or II and III follows`, `Both I and II follows`, `Both II and III follows`, `None follows`, `Only II follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 92, s: `Reasoning Ability`, q: `If each vowel of the word 'VOLUME' is changed to the next letter in the English alphabetical series and each consonant is changed to the previous letter in the English alphabetical series and then the
alphabets thus formed are arranged in alphabetical order from left to right, which of the following will be a fourth letter from the left end?`, qi: ``, o: [`U`, `V`, `P`, `K`, `L`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 93, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions given below.
Nine boxes A, B, C, D, E, F, G, H, and J are kept one above the other in a single stack. The bottommost position is numbered one and the topmost is numbered nine. But not necessarily in the same order. Three boxes are placed between C and E. Two boxes are placed between E and J. J and C are not immediate neighbors. E is kept in two boxes above G. E and G are kept in the even-numbered boxes. Box B is placed just above F. The Same number of boxes are between A and H as between E and G. A is placed above H. Box A is not placed adjacent to Box G. At least two boxes are between D and F.
As many boxes are kept above E as below 	.`, qi: ``, o: [`A`, `J`, `D`, `B`, `F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 94, s: `Reasoning Ability`, q: `Which of the following box is kept exactly in the middle of J and A?`, qi: ``, o: [`G`, `D`, `H`, `C`, `F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 95, s: `Reasoning Ability`, q: `How many boxes are kept between H and B?
As many boxes kept above F.`, qi: ``, o: [`As many boxes kept below B.`, `Two`, `As many boxes kept between D and G.`, `One`, `Que. 96Que. 96If all the boxes are kept in the alphabetical order from bottom to top, then how many boxes remains unchanged in its position?`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 96, s: `Reasoning Ability`, q: `Que. 96`, qi: ``, o: [`Two`, `Four`, `Three`, `Five`, `One`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 97, s: `Reasoning Ability`, q: `Which of the following box is kept second from the top of the stack?`, qi: ``, o: [`The box which is kept two boxes above J.`, `The box which is kept immediately below D.`, `Box E`, `Box A`, `The box which is kept immediately above H.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 98, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions given below.
Six people Mehak, Renu, Atul, Parul, Kiku, and Lata are standing in the bank line one after the other to deposit cash in their respective accounts but not necessarily in the same order. The line is set so that the person standing first will deposit the maximum amount and the person in the last will deposit the least amount. At least two people are standing ahead of Renu. Renu is not the last person in the line. Mehak is standing just before Parul. As many persons are ahead of Kiku as after Renu. Mehak is not standing first in the line. Lata is standing ahead of Atul, who has Rs. 3000 to deposit in the bank. Parul wants to deposit Rs. 5000 in her bank account.
Which of the following statement is true with respect to the final arrangement?`, qi: ``, o: [`Kiku is first in the line.`, `Three persons are standing between Mehak and Lata`, `Parul is the last one in the line.`, `Only two persons are standing before Renu.`, `Only one person is standing after Renu.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 99, s: `Reasoning Ability`, q: `What is the position of Parul with respect to the first position?`, qi: ``, o: [`Third`, `Fourth`, `Second`, `Fifth`, `Sixth`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 100, s: `Reasoning Ability`, q: `What could be the amount Renu deposit in bank?`, qi: ``, o: [`2000`, `4222`, `5500`, `2996`, `5100`], oi: [``, ``, ``, ``, ``], e: `` }
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
      tags: ['IBPS', 'PO', 'Prelims', 'PYQ', '2023', '23 September 2023 Shift-2'],
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

  const TEST_TITLE = `IBPS PO Prelims - 23 September 2023 Shift-2`;
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2023, pyqShift: `23 September 2023 Shift-2`,
    pyqExamName: 'IBPS PO Prelims', questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
