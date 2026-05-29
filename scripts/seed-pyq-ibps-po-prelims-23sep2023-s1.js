/**
 * Seed: IBPS PO Prelims - 23 September 2023 Shift-1
 * IBPS PO Prelims — Probationary Officer Preliminary Exam.
 * 100 Q × 1 mark, 3 sections (Eng 30 / Reas 35 / Quant 35), 60 min total,
 * sectional timing 20 min each, 0.25 negative marking.
 * Uploads question/option images from local _extracted_ibps_po_23sep2023_s1/ to Cloudinary.
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

const EXTRACTED_DIR = path.resolve(__dirname, '../_extracted_ibps_po_23sep2023_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/ibps-po-prelims-23sep2023-s1';
const F = '23sep2023-s1';

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

const KEY = [3, 3, 4, 2, 4, 5, 1, 4, 1, 3, 2, 2, 3, 5, 1, 2, 2, 5, 4, 3, 2, 4, 3, 1, 2, 5, 4, 5, 2, 3, 5, 5, 5, 5, 3, 2, 3, 1, 2, 3, 4, 3, 1, 3, 1, 2, 4, 1, 1, 3, 1, 1, 2, 3, 4, 3, 2, 2, 5, 1, 3, 4, 2, 1, 5, 1, 5, 5, 4, 5, 4, 5, 4, 5, 4, 4, 5, 1, 2, 3, 3, 4, 1, 3, 3, 3, 3, 1, 4, 2, 4, 4, 3, 4, 5, 3, 4, 3, 3, 4];
const RAW = [
  { n: 1, s: `English Language`, q: `Direction: Read the given passage carefully to answer the following questions. Each question will have five alternatives as its answer. Choose the correct option as your answer
As global efforts to curb carbon emissions continue to intensify, particular attention has been drawn to the transportation industry, one sector with significant potential to effect positive change. The drive towards increased electric vehicle (EV) usage is gathering pace, with more consumers moving away from fossil fuel-dependent engines. This transition is expected to build on momentum already achieved in renewable energy sectors, setting the stage for a more sustainable future.
However, success in this field is heavily predicated on the wide-scale availability of element X, a crucial ingredient for the production of EVs, particularly in the manufacture of powerful, reliable batteries. Element X brings together the perfect blend of lightness, energy capacity, heat tolerance, and cost-effectiveness, qualities that soundly position it as an indispensable material in EV battery production.
As global demand for EVs increases, the scale of production and consumption of element X will take an equivalent uptick, impacting a steep upward growth curve on the global market. With governments and corporations across the globe actively driving the transition to green energy, the surge in EV's adoption will lead to an unparalleled build-up in demand for this critical ingredient.
This dynamic presents both opportunities and challenges. On the one hand, the elevated production of element X will contribute to job creation and economic growth in regions where its extraction and refining occur, offering an economic uplift. On the other hand, its extraction and processing must be managed in an environmentally and socially responsible way to match the green ideals of the EV movement.
In this context, planning for the future must consider investment in infrastructural expansion, research into alternate or synthetic substitutes for element X, and regulations that incentivize responsible and sustainable mining. This is a crucial step to not only meet burgeoning demand but also mitigate any negative environmental or social implications.
Ultimately, the drive to increase EV usage necessitates a corresponding upswing in the production and processing of element X. As such, efforts to curb reliance on fossil fuels will catalyze a new trajectory in the mining sector, poised to meet the growing demand of this critical element that underpins the growth of EVs.
Which of the following words is a synonym for the word 'curb' as used in the passage?`, qi: ``, o: [`Encourage`, `Boost`, `Suppress`, `Amplify`, `Raise`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 2, s: `English Language`, q: `What implications does the increased production of element X have for regions where its extraction occurs?`, qi: ``, o: [`Increased pollution`, `Decreased economic activity`, `Job creation and economic growth`, `Social disruption`, `No change`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 3, s: `English Language`, q: `Which of the following words is a antonym for the word 'build' as used in the passage?`, qi: ``, o: [`Construct`, `Develop`, `Assemble`, `Demolish`, `Strengthen`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 4, s: `English Language`, q: `Which of the following statements is/are true?
Environmentally sustainable practices are not necessary in the production and processing of element X.
The production of element X will stimulate job creation and economic growth in regions where it is extracted and refined.
The transition to green energy will decrease the global demand for EVs.`, qi: ``, o: [`Only 1 is true`, `Only 2 is true`, `Only 3 is true`, `1 and 3 are true`, `2 and 3 are true`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 5, s: `English Language`, q: `According to the passage, why is element X crucial in the production of electric vehicle batteries?`, qi: ``, o: [`It makes the battery more substantial.`, `It makes the battery look more attractive.`, `It renders the battery less efficient.`, `It combines qualities of energy capacity, cost-effectiveness, heat tolerance, and lightness.`, `It makes the battery heavier, reducing vehicle speed.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 6, s: `English Language`, q: `What is a crucial step to meet the increasing demand for element X and mitigate negative environmental or social implications?`, qi: ``, o: [`Reducing investment in infrastructural expansion`, `Ignoring research into alternate or synthetic substitutes for element X`, `Decreasing regulations that incentivize sustainable mining`, `Increasing emissions of fossil fuels`, `Planning for investment in infrastructural expansion, research into alternate or synthetic substitutes, and regulations that incentivize sustainable mining`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 7, s: `English Language`, q: `Which of the following statements are true?
The demand for EVs directly impacts the production and consumption of element X.
With the growth of the EV market, the production of element X will decrease.
Regulatory actions and infrastructural expansion are critical for managing the increasing demand for element X.`, qi: ``, o: [`Only 1 and 3 are true`, `Only 2 is true`, `Only 3 is true`, `1, 2, and 3 are true`, `None of them are true`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 8, s: `English Language`, q: `Which of the following statements is/are false?
Research into alternate or synthetic substitutes for Element X is unnecessary for future planning.
Sustainable mining for Element X extraction is undesirable.
Job creation and economic growth will result from the escalated production of Element X.`, qi: ``, o: [`Only 1`, `Only 2`, `Only 3`, `1 and 2`, `2 and 3`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 9, s: `English Language`, q: `In the sentence, certain words are in bold and numbered from A to E, which are the possible pairs to be interchanged. Choose the pair(s) of words which need to be interchanged to make the
sentence grammatically correct and meaningful.
The (A) enemies of using pests’ natural (B) method is (C) known as biological control, and is (D) considered an eco-friendly (E) alternative to the use of insecticides.
Only A-B`, qi: ``, o: [`A-C and B-D`, `No Improvement`, `Only C-D`, `Both A-B and C-D`, `Que. 10Que. 10In the sentence, certain words are in bold and numbered from A to E, which are the possible pairs to be interchanged. Choose the pair(s) of words which need to be interchanged to make the`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 10, s: `English Language`, q: `Que. 10
sentence grammatically correct and meaningful.
Turkey should (A) seek ways to (B) relying the (C) process by (D) expedite on (E) existing research elsewhere.`, qi: ``, o: [`A-C`, `B-E and A-C`, `B-D`, `A-D and B-E`, `A-B`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 11, s: `English Language`, q: `In the sentence, certain words are in bold and numbered from A to E, which are the possible pairs to be interchanged. Choose the pair(s) of words which need to be interchanged to make the
sentence grammatically correct and meaningful.
Suppose we wanted to (A) estimate how many car owners there are in the UK and how many of those (B) data a Ford Fiesta, but we only have (C) own on those people who (D) visited Ford car showrooms in the (E) last year.`, qi: ``, o: [`A-D and B-E`, `B-C`, `A-C and B-D`, `A-D`, `B-C and A-D`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 12, s: `English Language`, q: `In the sentence, certain words are in bold and numbered from A to E, which are the possible pairs to be interchanged. Choose the pair(s) of words which need to be interchanged to make the
sentence grammatically correct and meaningful.
The wind came (A) edge across the (B) highest (C) unhampered of the Pennines, the iciest of (D) blasts from the north-west (E) corner of the sky.`, qi: ``, o: [`B-E`, `A-C`, `D-E`, `A-D and B-E`, `B-C`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 13, s: `English Language`, q: `Direction: The given sentence is divided into four parts: A, B, C, and D. Choose the part that contains an error as your answer. If the sentence is error-free, mark E i.e. No error as your
answer.
Business is about having (A)/ an extremely skilled team (B)/ and provide the best service (C)/ to our customers.
(D)/ No error (E)`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 14, s: `English Language`, q: `Direction: The given sentence is divided into four parts: A, B, C, and D. Choose the part that contains an error as your answer. If the sentence is error-free, mark E i.e. No error as your
answer.
The fundamental idea is to (A)/ foster connections through (B)/ real-life meetups rather (C)/ than solely through virtual interactions. (D)/ No error (E)`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 15, s: `English Language`, q: `Direction: The given sentence is divided into four parts: A, B, C, and D. Choose the part that contains an error as your answer. If the sentence is error-free, mark E i.e. No error as your
answer.
People develop a attachment (A)/ to a city because they find (B)/ a sense of belonging (C)/ within like-minded individuals. (D)/ No error (E)`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 16, s: `English Language`, q: `Direction: The given sentence is divided into four parts: A, B, C, and D. Choose the part that contains an error as your answer. If the sentence is error-free, mark E i.e. No error as your
answer.
These are just small (A)/ alterations with our lifestyle (B)/ that will help us achieve (C)/ that perfect body. (D)/ No error (E)`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 17, s: `English Language`, q: `Direction: The given sentence is divided into four parts: A, B, C, and D. Choose the part that contains an error as your answer. If the sentence is error-free, mark E i.e. No error as your
answer.
Haryana Police are (A)/ carrying out its procedure, (B)/ and our officers are (C)/ in contact with them. (D)/ No error (E)`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 18, s: `English Language`, q: `Directions: Given below is a word, followed by three sentences that consist of that word. Identify the sentence(s) that express(es) the meaning of the word.
INTEREST
She must be allowed to grieve and interest in her own way.
He urged further interest rate cuts in a bid to kick-start the economy.
It might interest you to learn that I've changed my opinion on that matter.`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `Both A and B`, `Both B and C`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 19, s: `English Language`, q: `Directions: The given question has one blank indicating that something has been omitted. Choose the word for the given options that could fit in the blank correctly.
The 	of her nausea was so strong that she felt dizzy and began to retch.
Resonate`, qi: ``, o: [`Vulnerable`, `Susceptible`, `Intensity`, `Diversity`, `Que. 20Que. 20Directions: The given question has one blank indicating that something has been omitted. Choose the word for the given options that could fit in the blank correctly.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 20, s: `English Language`, q: `Que. 20
The 	image displayed was not a real person but a projected hologram.`, qi: ``, o: [`Exclusive`, `Fiasco`, `Illusive`, `Delicate`, `Oblivion`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 21, s: `English Language`, q: `Directions: The given question has one blank indicating that something has been omitted. Choose the word for the given options that could fit in the blank correctly.
They used violence to 	opposition rallies and meetings.`, qi: ``, o: [`Corrupt`, `Disrupt`, `Stigma`, `Supercilious`, `Abrupt`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 22, s: `English Language`, q: `Directions: The following sentences form a paragraph. The rest of the sentences are marked as A, B, C, D, E and F. The sentences are not given in their proper order. Read the sentences and
answer the following questions.
Artificial Intelligence refers to the intelligence of machines.
Most noteworthy, Artificial Intelligence is the simulation of human intelligence by machines.
With Artificial Intelligence, machines perform functions such as learning, planning, reasoning, and problem-solving.
Furthermore, many experts believe AI could solve major challenges and crisis situations.
This is in contrast to the natural intelligence of humans and animals.
It is probably the fastest-growing development in the World of technology and innovation.
Which sentence should be the SECOND sentence in the paragraph?`, qi: ``, o: [`D`, `A`, `F`, `E`, `B`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 23, s: `English Language`, q: `Which sentence should be the FOURTH sentence in the paragraph?`, qi: ``, o: [`F`, `A`, `B`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 24, s: `English Language`, q: `Which sentence should be the SIXTH sentence in the paragraph?`, qi: ``, o: [`D`, `E`, `F`, `B`, `A`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 25, s: `English Language`, q: `Which sentence should be the FIRST sentence in the paragraph?`, qi: ``, o: [`D`, `A`, `B`, `E`, `F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 26, s: `English Language`, q: `Which sentence should be the FIFTH sentence in the paragraph?`, qi: ``, o: [`E`, `D`, `A`, `B`, `F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 27, s: `English Language`, q: `Directions: Which of the phrases given in the options should replace the word/phrase that is underlined in the sentence to make it grammatically correct? If the sentence is correct as it is
given and no correction is required, select ''No correction required'' as the answer.
The Indian football team is set to bear down the Asian Cup trophy for the first time.`, qi: ``, o: [`Is set to bear up`, `Is set to bear out`, `Is set to bear with`, `Is set to bear away`, `No correction required`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 28, s: `English Language`, q: `Directions: In the following sentence, a part of the sentence is underlined. Below are given alternatives to the underlined part, which may improve the sentence. Choose the correct
alternative. In case no improvement is needed, choose the alternative that indicates 'No improvement'.
Mrs. Kavitha is eclipsed by her husband who is much livelier and more intelligent than she is.`, qi: ``, o: [`Much lively and more intelligent`, `Much liveliest and most intelligent`, `More lively and much intelligent`, `Much more lively and much more intelligent`, `No improvement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 29, s: `English Language`, q: `Directions: In the following sentence, a part of the sentence is underlined. Below are given alternatives to the underlined part, which may improve the sentence. Choose the correct
alternative. In case no improvement is needed, choose the alternative that indicates 'No improvement'.
We got at touch with the bank to check out the suspect's story.`, qi: ``, o: [`Got to touch from`, `Got in touch with`, `Getting at touch with`, `Got at touch from`, `No improvement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 30, s: `English Language`, q: `Directions: In the following sentence, a part of the sentence is underlined. Below are given alternatives to the underlined part, which may improve the sentence. Choose the correct
alternative. In case no improvement is needed, choose the alternative that indicates 'No improvement'.
His entry to the team dressing room was restrict as an official inquiry had been constituted against him.
Is restricting as an`, qi: ``, o: [`Was restricting as a`, `Was restricted as an`, `Is restricted as a`, `No improvement`, `Que. 31Que. 31`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 31, s: `Quantitative Aptitude`, q: `Que. 31
In the given question, two equations numbered l and II are given. Solve both the equations and mark the appropriate answer.
x2 – 16x + 55 = 0
y2 – 17y + 52 = 0`, qi: ``, o: [`x > y`, `x ≥ y`, `x < y`, `x ≤ y`, `x = y or relationship between x and y cannot be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 32, s: `Quantitative Aptitude`, q: `In the given questions, two equations numbered l and II are given. You have to solve both the equations and mark the appropriate answer.
I. 2x2 – 7x – 15 = 0
ll. 3y2 – 6y – 9 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relation between them cannot be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 33, s: `Quantitative Aptitude`, q: `In the following question to equations are given. You have to solve the question and mark the answer accordingly.
l. 5x2 + 8x + 3 = 0
ll. 6y2 + 7y – 3 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relation between cannot be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 34, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and mark the appropriate answer.
4x2 – 10x + 4 = 0
3y2 – 11y + 6 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `Relation can't be formed or x = y`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 35, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and mark the appropriate answer.
2x2 – 11x + 15 = 0
2y2 – 9y + 10 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `relation can't be established or x = y`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 36, s: `Quantitative Aptitude`, q: `Directions: Answer the questions based on the information given below.
The first pie chart below shows the percentage distribution of the total number of students in five different schools and the second pie chart below shows the total number of male students in each school.
Total number of students in a school = Number of male students in the school + Number of female students in the school
Total number of students in all five schools together = 4300

Total number of male students in all five schools together = 2100

If the total number of students (male + female) in another school 'Z' is 30% more than that in school 'D' and the respective ratio between the number of male to female students in school 'Z' is 6 : 7 respectively then find the average total number of female students in school 'A' and school 'Z' together?`, qi: `q36_combined.png`, o: [`726`, `736`, `746`, `756`, `766`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 37, s: `Quantitative Aptitude`, q: `If (p - 15)% of the number of female students in school 'D' and (p + 10)% of that in school 'E' are selected for a 'quiz' competition and the average total number of female students who are selected for
the 'quiz' competition from school 'D' and that from school 'E' together is 83 then find the value of 'p'?`, qi: `q36_combined.png`, o: [`25`, `30`, `35`, `40`, `45`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 38, s: `Quantitative Aptitude`, q: `If the average total number of female students in school 'C' and school 'X' together is 498 then the number of female students in school 'X is what percentage of that in school 'A'?`, qi: `q36_combined.png`, o: [`63.33%`, `64.44%`, `65.55%`, `66.66%`, `67.77%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 39, s: `Quantitative Aptitude`, q: `If the difference between the number of male students in school 'A' to that in school 'E' is same as that in school 'C' to school 'M' and the number of male students in school 'M' is more than that in school 'C'
then find the sum of the number of male students in school 'M' and that in school 'B' together?`, qi: `q36_combined.png`, o: [`1150`, `1155`, `1160`, `1165`, `1170`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 40, s: `Quantitative Aptitude`, q: `If the central angle corresponding to the total number of students (male + female) in school 'D' and school 'G' together is 120º then find the difference between the total number of students in school 'A' to
that in school 'G'?`, qi: `q36_combined.png`, o: [`410`, `420`, `430`, `440`, `450`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 41, s: `Quantitative Aptitude`, q: `The second lowest number of five consecutive odd number series is four more than the 5/12th of the third highest number of five consecutive even numbers series. If the average of five consecutive even
number series is 60, then find the difference between the highest number of both series.`, qi: ``, o: [`37`, `27`, `33`, `29`, `31`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 42, s: `Quantitative Aptitude`, q: `Raman scored 456 marks in a exam and Seeta got 54% marks in the same exam which is 24 marks less than Raman. If the minimum passing marks in the exam is 34%, then how much more marks did
Raman score than the minimum passing marks?`, qi: ``, o: [`180`, `190`, `184`, `196`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 43, s: `Quantitative Aptitude`, q: `In a family of four members A, B, C, and D, Rs. 50,000 was divided among them. A took 2/3 of the money, B took 1/5 of the remaining amount, and the rest was divided between C and D in the ratio of 2
: 3 respectively. How much(approx.) did C get as his share?`, qi: ``, o: [`Rs. 5,334`, `Rs. 5,000`, `Rs. 6,000`, `Rs. 7,000`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 44, s: `Quantitative Aptitude`, q: `The present age of mother is four times the present age of her son. 8 years hence, the ratio of ages of mother and son becomes 16:5. If x is the square of the present age of son, then what will be the value
of (x+2)?`, qi: ``, o: [`450`, `481`, `486`, `485`, `480`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 45, s: `Quantitative Aptitude`, q: `1 card is randomly chosen from a deck of which red face cards have been removed, find the probability that the picked card is a face card.`, qi: ``, o: [`3 / 23`, `3 / 46`, `6 / 23`, `3 / 26`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 46, s: `Quantitative Aptitude`, q: `What should come in place of (?) in the given series?
20, 32, 47, 57, ?, 80`, qi: ``, o: [`72`, `74`, `78`, `77`, `79`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 47, s: `Quantitative Aptitude`, q: `What should come in the place of (?) in the given series?
500, 50, 10, 3, 1.2, ?`, qi: ``, o: [`0.4`, `0.8`, `0.3`, `0.6`, `1.4`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 48, s: `Quantitative Aptitude`, q: `What should come in the place of (?) in the given series?
100, ?, 228, 299, 372, 451`, qi: ``, o: [`161`, `163`, `171`, `164`, `173`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 49, s: `Quantitative Aptitude`, q: `What should come in the place of (?) in the given series?
80, ?, 117, 168, 271, 478`, qi: ``, o: [`92`, `95`, `89`, `91`, `87`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 50, s: `Quantitative Aptitude`, q: `What should come in the place of (?) in the given series?
40, 66, 116, 198, 320, ?`, qi: ``, o: [`480`, `510`, `490`, `500`, `495`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 51, s: `Quantitative Aptitude`, q: `The interest earned when a sum invested at 32% p.a. simple interest for 5 years is Rs. 2400. The same initial sum when invested at (R + 12)% p.a. compound interest, compounded annually amounts to Rs.
2535 at the end of two years. Find the value of R.`, qi: ``, o: [`18`, `22`, `26`, `15`, `32`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 52, s: `Quantitative Aptitude`, q: `4 men and 3 women finish a job in 6 days. Also, 5 men and 7 women can do the same job in 4 days. If 1 man and 1 woman will do the same job in x days, then what will be value of the perfect square
nearest to the value of 14x ?`, qi: ``, o: [`324`, `225`, `441`, `625`, `729`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 53, s: `Quantitative Aptitude`, q: `Pipe A can fill a tank in 22 hours, and pipe B can fill 50% of the tank in 14 hours. Pipe C can empty the tank in 14 hours. If all the pipes are opened at 5:00 am, and pipe C is closed after 3 hours, then at
what time (approx) the tank will be filled?`, qi: ``, o: [`5:00 PM`, `8:00 PM`, `7:30 PM`, `6:00PM`, `8:30 PM`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 54, s: `Quantitative Aptitude`, q: `Vessel A contains (2x + 360) liters mixture of milk and water in the ratio of 7:5 and vessel B contains a 200 liters mixture of milk and water in the ratio of 3:2. If vessels A and B are mixed together, then the
ratio of the milk and water becomes 47:33. Find the value of x.`, qi: ``, o: [`80`, `100`, `120`, `125`, `150`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 55, s: `Quantitative Aptitude`, q: `An old man is walking on a foggy road at a speed of x km/hr. Due to low visibility, the old man see only up to 600 meters. If a car overtakes the man from the behind with the speed of 15 km/hr then the
man can see the car for 216 seconds. Find the speed of the man?`, qi: ``, o: [`2 km/hr`, `3 km/hr`, `4 km/hr`, `5 km/hr`, `6 km/hr`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 56, s: `Quantitative Aptitude`, q: `The total time taken by the boat to go 'x' km upstream and then return back to a certain distance is 6 hours. The ratio of the speed boat in still water to the speed of the stream is 8 : 1, respectively. If the
upstream distance covered is 50 km more than the downstream distance covered and the boat can cover (3x + 60) km in still water in 12 hours, then find the value of 'x'?`, qi: ``, o: [`120 km`, `128 km`, `140 km`, `150 km`, `158 km`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 57, s: `Quantitative Aptitude`, q: `Sachin and Kohli decided to invest in a business. They put in their capitals in the ratio of 5:3.
However, in the next year sachin invested 40% more money and kohli withdrew 20% of his capital. If at the end of second year sachin got Rs 4000 as profit, then find the profit earned by kohli.`, qi: ``, o: [`Rs 1500`, `Rs 1800`, `Rs3050`, `Rs 1780`, `Rs 2100`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 58, s: `Quantitative Aptitude`, q: `Ratio of the cost price of apple and orange is 4 : 5. If the shopkeeper sold the apple at 20% profit and oranges at 30% profit and discount offer of 20% and 35 % on apple and oranges respectively,
Then what is the ratio of the marked price of apple and orange ?`, qi: ``, o: [`4 : 5`, `3 : 5`, `7 : 5`, `11 : 9`, `7 : 6`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 59, s: `Quantitative Aptitude`, q: `Directions: Answer the questions based on the information given below.
The table given below shows the total number of male employees (Public + Private) and the total number of female employees (Public + Private) working in five different cities.
Total number of employees in a city = Number of male employees working in the city + Number of female employees working in the city
City
Number of male employees
Total Number of female employees
Public
Private
P
3x + 2y
14y
48
Q
8x
6x
48
R
5x
2x
24
S
12y
81
63
T
36y
28y
48
Note : (1) Sum of the total number of male employees working in the 'Public' sector from city 'P' and city 'R' together is 70.
(2) Sum of the total number of male employees working in the 'Private' sector from city ''Q' and city 'T' together is 132.
What is the average total number of employees working in city 'Q', 'R', and 'T' together?`, qi: ``, o: [`120`, `130`, `140`, `150`, `160`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 60, s: `Quantitative Aptitude`, q: `If the average total number of employees working in city 'P', 'S', 'T' and 'U' together is 185 and the number of female employees working in city 'U' is 25% more than the number of male employees
working in city 'P' then find the total number of male employees working in city 'U' and city 'Q' together?`, qi: ``, o: [`222`, `228`, `232`, `238`, `242`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 61, s: `Quantitative Aptitude`, q: `The number of female employees working in 'private' sector from city 'P' and from city 'Q' is 33.33% and 37.5% of the number of male employees working in 'public' sector from city 'T' and city 'R'
respectively then find the difference between the number of female employees working in 'public' sector from city 'P' and that from city 'Q'?`, qi: ``, o: [`11`, `19`, `21`, `27`, `29`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 62, s: `Quantitative Aptitude`, q: `If the total number of female employees working in the 'public' sector from city 'R' and city 'S' together is 55.55% less than the total number of male employees working in the 'private' sector from city 'P' and
city 'Q' together then find the total number of female employees working in the 'private' sector from city 'R' and city 'S' together?`, qi: ``, o: [`31`, `37`, `41`, `47`, `CND`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 63, s: `Quantitative Aptitude`, q: `If the total number of employees (male + female) working in city 'Z' is 60% less than the total number of employees working in all five cities together and the total number of male employees (public +
private) working in city 'Z' is 8 more than that of female employees then the total number of male employees (public + private) working in city 'Z' is what percentage that of city T'?`, qi: ``, o: [`80%`, `83.33%`, `85%`, `86.66%`, `88%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 64, s: `Quantitative Aptitude`, q: `The area of the circle is 2464 cm2 and the ratio of the breadth of the rectangle to radius of the circle is 6:7. If the circumference of the circle is equal to the perimeter of the rectangle, then what is the area of
the rectangle.`, qi: ``, o: [`1536cm2`, `1546cm2`, `1556cm2`, `1566cm2`, `1576cm2`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 65, s: `Quantitative Aptitude`, q: `Two cars 'M' and 'N' leave from point 'P' towards point 'Q' with car 'M' leaving 1 hour earlier than car 'N'. Both the cars travel first 100 km at 50 km/hr, next 50 km at 25 km/hr and the remaining distance at
20 km/hr. If the distance between 'P' and 'Q' is 250 km, the find the distance between car 'N' and half of the distance between points 'P' and 'Q', when car 'M' reaches point 'Q'?`, qi: ``, o: [`45 km`, `60 km`, `75 km`, `90 km`, `105 km`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 66, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions given below.
Six persons - P, Q, R, S T, and U went on a tour on two different dates either the 9th or 26th in three different months viz. March, May, and November of the same year. Each of them visited different cities viz.
Pune, Gaya, Vadodara, Sonipat, Kota and Mysore. All the information is not necessarily in the same order.
U went on an odd-numbered date. Only two persons went between the one who went to Mysore and U. R and Q went on the same date but none of them went in November. The one who went to Vadodara went immediately before Q but not in May. As many persons went after T is the same as before the one who went to Kota. T did not go in March. Only one person went between the one who went to Pune and Sonipat. P went immediately after the one who went to Sonipat but did not go to Mysore. S did not go to Pune.
Which of the following statement(s) is/are true with respect to the final arrangement?`, qi: ``, o: [`Q went to Mysore city.`, `R went in the month having an even number of days`, `S did not go to tour on an odd-numbered date`, `Only two persons went between T and the one who went to Pune city`, `None is true`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 67, s: `Reasoning Ability`, q: `On which of the following date and month does P went to the tour?`, qi: ``, o: [`26th May`, `9th November`, `26th March`, `9th May`, `26th November`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 68, s: `Reasoning Ability`, q: `T went to which of the following cities?`, qi: ``, o: [`Mysore`, `Vadodara`, `Sonipat`, `Kota`, `Pune`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 69, s: `Reasoning Ability`, q: `Which among the following person went to Gaya?`, qi: ``, o: [`S`, `The one who went immediately before U`, `The one who goes on 26th May`, `P`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 70, s: `Reasoning Ability`, q: `Four of the following five are alike in a certain way as per the given arrangement and hence form a group. Find the one who doesn’t belong to that group.`, qi: ``, o: [`The one who went to Kota`, `The one who went to Pune`, `The one who went to Mysore`, `The one who went to Vadodara`, `The one who went to Sonipat`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 71, s: `Reasoning Ability`, q: `How many pair of letters are there in the word "FABULATED" that has as many letters between them backward and forward in the word as in the alphabet?`, qi: ``, o: [`One`, `Three`, `Two`, `More than three`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 72, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions given below.
Five boxes containing different fruits are kept above one another such that the lowermost box is numbered 1, the box immediately above is numbered 2, and so on.
The box having Bananas is kept in an even-numbered position but the box is not P. Two boxes are kept between the one which has Bananas and Box G. Box Z is kept just below the box which has Mangoes. T is kept three boxes above the box which has Oranges. Box K is kept at an odd-numbered position but doesn’t have Mangoes. The box which has Apples is kept below the box which has Grapes. Box G is kept above Box Z but not just above.
How many boxes are there between the box which has Mangoes and box Z?`, qi: ``, o: [`One`, `Two`, `Three`, `Four`, `None`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 73, s: `Reasoning Ability`, q: `Four of the following five are alike in a certain way and hence form a group. Find the one that doesn’t belong to that group:`, qi: ``, o: [`G - Apples`, `T - Grapes`, `P - Bananas`, `Z - Grapes`, `K - Bananas`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 74, s: `Reasoning Ability`, q: `Which fruit is kept in box K?`, qi: ``, o: [`Bananas`, `Apples`, `Grapes`, `Mangoes`, `Oranges`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 75, s: `Reasoning Ability`, q: `Which box is kept at the 4th position?`, qi: ``, o: [`The one which has Mangoes`, `G`, `The one which has Bananas`, `T`, `The one which has Grapes`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 76, s: `Reasoning Ability`, q: `In which position does the box having Apples is kept?`, qi: ``, o: [`Fifth`, `Second`, `Third`, `Fourth`, `First`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 77, s: `Reasoning Ability`, q: `Direction: In the following question, assuming the given statement to be true, find which of the conclusion(s) among the given conclusions is/are definitely true, and then give your answers
accordingly.
Statement:
H < I > J < L; J < P < R; P > U < W
Conclusions:
H < R
J > W`, qi: ``, o: [`Only I follows`, `Either I or II follows`, `Only Il follows`, `Both I and II follow`, `Neither I nor II follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 78, s: `Reasoning Ability`, q: `Direction: In the following question, assuming the given statement to be true, find which of the conclusion(s) among the given conclusions is/are definitely true, and then give your answers
accordingly.
Statement:
S > T ≥ U < V; U < W = X > Y > Z; X < M < L
Conclusions:
U < L
V < W`, qi: ``, o: [`Only I follows`, `Only Il follows`, `Either I or II follows`, `Neither I nor II follows`, `Both I and II follow`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 79, s: `Reasoning Ability`, q: `Direction: In the following question, assuming the given statement to be true, find which of the conclusion(s) among the given conclusions is/are definitely true, and then give your answers
accordingly.
Statement:
M < T ≤ Q < D; P > A = W ≥ D
Conclusions:
W ≥ T
P > Q`, qi: ``, o: [`Only I follows`, `Only Il follows`, `Either I or II follows`, `Both I and II follow`, `Neither I or II follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 80, s: `Reasoning Ability`, q: `In a certain code, ‘256’ means ‘you are good’; ‘637’ means ‘we are bad’ and ‘358’ means ‘good and bad’. Which of the following digits represents ‘and’ in that code?`, qi: ``, o: [`2`, `5`, `8`, `3`, `6`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 81, s: `Reasoning Ability`, q: `Direction: Read the given information carefully and answer the questions asked below.
Eight people S, Q, A, P, G, O, X and T are sitting around a square table in such a way that four of them sit at four corners of the square while four sit in the middle of each of the four sides. People who are sitting at the corner are facing outside the center while people sitting in the middle are facing the center. G sits second to the right of T. O is sitting opposite to G. S is sitting third to the right of G. Three people are sitting between T and X. A is sitting second to the left of Q, who is one of the immediate neighbours of G. P is sitting at one of the corners of the square and is facing outside.
Who is sitting opposite to A?
S`, qi: ``, o: [`Q`, `P`, `O`, `G`, `Que. 82Que. 82Who is sitting second to the right of X?`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 82, s: `Reasoning Ability`, q: `Que. 82`, qi: ``, o: [`S`, `A`, `P`, `O`, `Q`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 83, s: `Reasoning Ability`, q: `Who is sitting opposite to Q?`, qi: ``, o: [`S`, `X`, `O`, `T`, `G`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 84, s: `Reasoning Ability`, q: `Who is sitting third to the right of T?`, qi: ``, o: [`X`, `G`, `A`, `O`, `S`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 85, s: `Reasoning Ability`, q: `How many people are sitting between G and S when counted from the left of G?`, qi: ``, o: [`One`, `Two`, `Four`, `Three`, `None`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 86, s: `Reasoning Ability`, q: `Directions: In the question below are given statement followed by two conclusions numbered I and II.
You have to take the given statements to be true even if they seem to be at variance with commonly known facts. Read all the conclusions and then decide which of the given conclusions logically follows from the given statements disregarding commonly known facts.
Statement:
All Book are Pages
Some Pages are Pen No Pen is Pencil
Conclusion:
Some Book are Pen
No Book is Pen`, qi: ``, o: [`Only conclusion I follows.`, `Only conclusion II follows.`, `Either conclusion I or II follows.`, `Neither conclusion I nor II follows.`, `Both conclusions I and II follow`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 87, s: `Reasoning Ability`, q: `Directions: In each question three statements followed by two conclusions numbered I and II have been given. You have to take the given statement to be true even if they seem to be at variance with
commonly known facts and then decide which of the given conclusions logically follows from the given statements. Give answer.
Statements:
Only a few airplanes are ships. Only a few ships are cargos.
Only a few cargos are jets.
Conclusions:
Some cargos can be airplanes. All jets can be ships.`, qi: ``, o: [`If only conclusion II follows.`, `If neither conclusion i nor ii follows.`, `If both conclusions I and II follow.`, `If either conclusion I or II follows.`, `If only conclusion I follows.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 88, s: `Reasoning Ability`, q: `Direction: In the question below are given three statements followed by two conclusions numbered I and II. You have to take the given statements to be true even if they seem to be at variance with
commonly known facts. Read all the conclusions and then decide which of the given conclusions logically follows from the given statements disregarding commonly known facts.
Statements:
Only Mug is Knife.
Only a few Mugs are Bowl.
Some Bowls are Spoons.
Conclusions:
No Knife is Spoon.
Some Spoons are Knife.`, qi: ``, o: [`Only I follows`, `Both follow`, `Either I or II follows`, `Only II follows`, `Neither I nor II follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 89, s: `Reasoning Ability`, q: `Directions: Read the following information carefully and answer the questions.
An uncertain number of persons are sitting in a row facing towards North. G sits sixth from one of the extreme ends of the row. Only one person sits between P and T. R, who sits third to the right of T is an immediate neighbour of W. Only two persons sit between G and S, who sits third from the left end of the row. T sits eighth from the right end of the row. F, who sits to the immediate right of G, is seated second to the left of P. W doesn’t sit to the right of R. Only five people sit to the right of W. V sits sixth to the right of T.
How many persons sit between F and W?`, qi: ``, o: [`Six`, `Three`, `Four`, `Five`, `Two`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 90, s: `Reasoning Ability`, q: `Who sits fourth to the right of F?`, qi: ``, o: [`V`, `T`, `R`, `S`, `W`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 91, s: `Reasoning Ability`, q: `How many persons are seated in the row?`, qi: ``, o: [`20`, `13`, `16`, `18`, `21 Que. 92Que. 92`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 92, s: `Reasoning Ability`, q: `Que. 92
If it is possible to make only one meaningful 4-letter English word with the 3rd, 8th, 10th and 11th letters of the word 'COMFORTABLE', which of the following will be the fourth letter from the left end of that word? If no such word can be made give 'A' as the answer and if more than one such word can be made give 'C' as the answer.`, qi: ``, o: [`A`, `E`, `L`, `C`, `M`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 93, s: `Reasoning Ability`, q: `Directions: Read the following information carefully and answer the questions.
Nine persons- P, N, K, J, S, T, H, R and W work in a particular company but they belong to three different countries namely Cyprus, Barcelona and Bosnia, with not more than four persons and not less than two persons belonging from the same country.
W and R do not belong to the same country. S belongs to the same country as H. P doesn’t belong to either Barcelona or Cyprus. J, who belongs to Barcelona, doesn’t work in the same country as N. W and T belong to the same country. K belongs to either Cyprus or Barcelona. H doesn’t belong to either Bosnia or Cyprus. W belongs to either Barcelona or Bosnia. T doesn’t belong to Barcelona or Cyprus. N, who belongs to Cyprus, comes from the same country as K. R belongs to the same country as J.
Which of the following statements is/are not true?
Statement I: J and N belong to the same country.
Statement II: The number of persons belonging to Cyprus is four.
Statement III: H belongs to Bosnia.`, qi: ``, o: [`Only Statement I`, `Both Statements II and III`, `All the statements are not true`, `Both statements I and III`, `Both statements I and II`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 94, s: `Reasoning Ability`, q: `The pair which represents persons belonging to Barcelona is?
W and T`, qi: ``, o: [`N and H`, `R and K`, `J and S`, `W and R`, `Who among the following belongs to Cyprus?`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 95, s: `Reasoning Ability`, q: ``, qi: ``, o: [`H`, `R`, `T`, `S`, `N`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 96, s: `Reasoning Ability`, q: `The total number of persons belonging to Barcelona and Cyprus is?`, qi: ``, o: [`Five`, `Three`, `Six`, `Seven`, `Four`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 97, s: `Reasoning Ability`, q: `W belongs to same country as?`, qi: ``, o: [`R`, `K`, `N`, `P`, `S`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 98, s: `Reasoning Ability`, q: `Study the following information carefully and answer the questions given below:
Point N is 8 m to the west of Point O. Point P is 4 m to the south of Point O. Point Q is 4 m to the east of Point P. Point R is 6 m to the north of Point Q. Point S is 8 m to the west of Point R. Point T is 2 m to the south of Point S.
What is the direction of point P with respect to point T?`, qi: ``, o: [`South-West`, `North-East`, `South-East`, `North-West`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 99, s: `Reasoning Ability`, q: `If a point A is 4 m in the north direction with respect to Q. Then what is the minimum distance between N and A?`, qi: ``, o: [`16 m`, `8 m`, `12 m`, `10 m`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 100, s: `Reasoning Ability`, q: `What is the shortest distance between point S and point Q?`, qi: ``, o: [`15 m`, `13 m`, `12 m`, `10 m`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` }
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
      tags: ['IBPS', 'PO', 'Prelims', 'PYQ', '2023', '23 September 2023 Shift-1'],
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

  const TEST_TITLE = `IBPS PO Prelims - 23 September 2023 Shift-1`;
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2023, pyqShift: `23 September 2023 Shift-1`,
    pyqExamName: 'IBPS PO Prelims', questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
