/**
 * Seed: IBPS PO Prelims - 30 September 2023 Shift-1
 * IBPS PO Prelims — Probationary Officer Preliminary Exam.
 * 100 Q × 1 mark, 3 sections (Eng 30 / Reas 35 / Quant 35), 60 min total,
 * sectional timing 20 min each, 0.25 negative marking.
 * Uploads question/option images from local _extracted_ibps_po_30sep2023_s1/ to Cloudinary.
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

const EXTRACTED_DIR = path.resolve(__dirname, '../_extracted_ibps_po_30sep2023_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/ibps-po-prelims-30sep2023-s1';
const F = '30sep2023-s1';

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

const KEY = [2, 4, 2, 4, 5, 5, 5, 4, 4, 3, 4, 2, 1, 1, 5, 3, 5, 5, 4, 3, 1, 2, 3, 4, 5, 1, 2, 1, 3, 3, 4, 3, 3, 2, 3, 4, 2, 4, 4, 4, 4, 5, 1, 5, 2, 3, 3, 3, 2, 3, 3, 1, 4, 1, 1, 1, 4, 2, 4, 4, 2, 2, 3, 2, 3, 5, 2, 3, 2, 4, 1, 4, 5, 5, 4, 1, 5, 3, 1, 5, 1, 3, 5, 4, 2, 5, 2, 4, 4, 5, 3, 1, 2, 1, 4, 5, 3, 4, 5, 4];
const RAW = [
  { n: 1, s: `English Language`, q: `Read the given passage and answer the questions that follow.
It is not too late. It never will be. Whatever you may have read over the past year — as extreme weather brought a global heatwave and unprecedented wildfires burned through 1.6 million California acres and newspaper headlines declared, “Climate Change Is Here” — global warming is not binary. It is not a matter of “yes” or “no”. Instead, it is a problem that gets worse over time the longer we produce greenhouse gas and can be made better if we choose to stop. Which means that no matter how hot it gets, no matter how fully climate change transforms the planet and the way we live on it, it will always be the case that the next decade could contain more warming, and more suffering, or less warming and less suffering. Just how much is up to us, and always will be.
A century and a half after the greenhouse effect was first identified, and a few decades since climate denial and misinformation began muddying our sense of what scientists do know, we are left with a set of predictions that can appear falsifiable — about global temperatures and sea-level rise and even hurricane frequency and wildfire volume. And there are, it is true, feedback loops in the climate system that we do not yet perfectly understand and dynamic processes that remain mysterious. But to the extent that we live today under clouds of uncertainty about the future of climate change, those clouds are, overwhelmingly, not projections of collective ignorance about the natural world but blindness about the human one, and they can be dispersed by human action. The question of how bad things will get is not, actually, a test of the science; it is a bet on human activity. How much will we do to forestall disaster and how quickly?
These are the disconcerting, contradictory lessons of global warming, which counsels both human humility and human grandiosity, each drawn from the same perception of peril. There’s a name for those who hold the fate of the world in their hands, as we do — gods. But for the moment, at least, many of us seem inclined to run from that responsibility rather than embrace it. Or even admit that we see it, though it sits in front of us as plainly as a steering wheel. That climate change is all-enveloping means that it targets us all and that we must all share in the responsibility so we do not all share in the suffering — at least not share in so suffocatingly much of it.
Since I first began writing about climate a few years ago, I’ve been asked often whether I see any reason for optimism. The thing is, I am optimistic. But optimism is always a matter of perspective, and mine is this: No one wants to believe disaster is coming, but those who look, do. At about two degrees Celsius of warming, just one degree north of where we are today, some of the planet’s ice sheets are expected to begin their collapse, eventually bringing, over centuries, perhaps as much as 50 feet of sea-level rise. In the meantime, major cities in the equatorial band of the planet will become unlivable.
Which of the following words is the most opposite in meaning to the word ‘disconcerting ‘?`, qi: ``, o: [`Perturbing`, `Soothing`, `Efficacious`, `Tenacious`, `Fastidious`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 2, s: `English Language`, q: `What does the author mean by 'climate denial'?`, qi: ``, o: [`The fact that the climate is denying people their rights to go outside in the Sun.`, `It is a law that forbids big companies from using products that lead to the emission of greenhouse gases into the atmosphere.`, `The claim that climate change is happening and that climate scientists are not lying and their data is not fake.`, `The rejection of the proposition that climate change caused by human activity is occurring.`, `None of these.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 3, s: `English Language`, q: `What does the author mean when he says global warming counsels human humility?`, qi: ``, o: [`Global warming makes us forget our achievements, and challenges us to do our best to deal with climate change.`, `Global warming makes us realise that if we wish to survive on this planet, we need to be considerate and keep track of the activities that may be harmful to the environment.`, `Global warming shows us how significant we are in the grand scheme of things.`, `Global warming makes us realise that we are completely powerless when it comes to dealing with the nature's wrath.`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 4, s: `English Language`, q: `What could be the title of the passage?`, qi: ``, o: [`The Evolution of Ideal Global Climate Policy`, `Global Hunger and Climate Change`, `Climate Denial`, `Pessimism Regarding Cimate Change`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 5, s: `English Language`, q: `Which of the following words is the most opposite in meaning to the word ‘unprecedented‘?`, qi: ``, o: [`Incendiary`, `Egregious`, `Extraordinary`, `Intransigent`, `Conventional`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 6, s: `English Language`, q: `Which of the following is TRUE according to the given passage?`, qi: ``, o: [`The predictions regarding the global temperature, sea-level, hurricane frequency and wildfire volume are false.`, `The clouds of uncertainty regarding climate change show our collective ignorance towards the natural world.`, `The writer is being optimistic that the danger of climate change can be averted even if we do not act expeditiously.`, `The fact that scientists know little about climate change is muddying our sense and leading to climate denial.`, `The problem of global warming gets worse over time, the longer we produce greenhouse gas, and no matter how hot it gets, the next decade could be even warmer.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 7, s: `English Language`, q: `Read the given passage and answer the questions that follow.
It is not too late. It never will be. Whatever you may have read over the past year — as extreme weather brought a global heatwave and unprecedented wildfires burned through 1.6 million California acres and newspaper headlines declared, “Climate Change Is Here” — global warming is not binary. It is not a matter of “yes” or “no”. Instead, it is a problem that gets worse over time the longer we produce greenhouse gas and can be made better if we choose to stop. Which means that no matter how hot it gets, no matter how fully climate change transforms the planet and the way we live on it, it will always be the case that the next decade could contain more warming, and more suffering, or less warming and less suffering. Just how much is up to us, and always will be.
A century and a half after the greenhouse effect was first identified, and a few decades since climate denial and misinformation began muddying our sense of what scientists do know, we are left with a set of predictions that can appear falsifiable — about global temperatures and sea-level rise and even hurricane frequency and wildfire volume. And there are, it is true, feedback loops in the climate system that we do not yet perfectly understand and dynamic processes that remain mysterious. But to the extent that we live today under clouds of uncertainty about the future of climate change, those clouds are, overwhelmingly, not projections of collective ignorance about the natural world but blindness about the human one, and they can be dispersed by human action. The question of how bad things will get is not, actually, a test of science; it is a bet on human activity. How much will we do to forestall disaster and how quickly?
These are the disconcerting, contradictory lessons of global warming, which counsels both human humility and human grandiosity, each drawn from the same perception of peril. There’s a name for those who hold the fate of the world in their hands, as we do — gods. But for the moment, at least, many of us seem inclined to run from that responsibility rather than embrace it. Or even admit that we see it, though it sits in front of us as plainly as a steering wheel. That climate change is all-enveloping means that it targets us all and that we must all share in the responsibility so we do not all share in the suffering — at least not share in so suffocatingly much of it.
Since I first began writing about climate a few years ago, I’ve been asked often whether I see any reason for optimism. The thing is, I am optimistic. But optimism is always a matter of perspective, and mine is this: No one wants to believe disaster is coming, but those who look, do. At about two degrees Celsius of warming, just one degree north of where we are today, some of the planet’s ice sheets are expected to begin their collapse, eventually bringing, over centuries, perhaps as much as 50 feet of sea-level rise. In the meantime, major cities in the equatorial band of the planet will become unlivable.
Why should all of us worry about climate change according to the passage?`, qi: ``, o: [`It is expected that if the temperature increases just two degree more, some of the planet's ice sheets will collapse, which will consequently raise the sea level.`, `Wildfires have burned through a huge area in California.`, `Cities in the equatorial band of the planet will be engulfed in water and become uninhabitable.`, `Climate change concerns all of us and will affect all of us.`, `All of the above.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 8, s: `English Language`, q: `Read the given passage and answer the questions that follow.
It is not too late. It never will be. Whatever you may have read over the past year — as extreme weather brought a global heatwave and unprecedented wildfires burned through 1.6 million California acres and newspaper headlines declared, “Climate Change Is Here” — global warming is not binary. It is not a matter of “yes” or “no”. Instead, it is a problem that gets worse over time the longer we produce greenhouse gas and can be made better if we choose to stop. Which means that no matter how hot it gets, no matter how fully climate change transforms the planet and the way we live on it, it will always be the case that the next decade could contain more warming, and more suffering, or less warming and less suffering. Just how much is up to us, and always will be.
A century and a half after the greenhouse effect was first identified, and a few decades since climate denial and misinformation began muddying our sense of what scientists do know, we are left with a set of predictions that can appear falsifiable — about global temperatures and sea-level rise and even hurricane frequency and wildfire volume. And there are, it is true, feedback loops in the climate system that we do not yet perfectly understand and dynamic processes that remain mysterious. But to the extent that we live today under clouds of uncertainty about the future of climate change, those clouds are, overwhelmingly, not projections of collective ignorance about the natural world but blindness about the human one, and they can be dispersed by human action. The question of how bad things will get is not, actually, a test of the science; it is a bet on human activity. How much will we do to forestall disaster and how quickly?
These are the disconcerting, contradictory lessons of global warming, which counsels both human humility and human grandiosity, each drawn from the same perception of peril. There’s a name for those who hold the fate of the world in their hands, as we do — gods. But for the moment, at least, many of us seem inclined to run from that responsibility rather than embrace it. Or even admit that we see it, though it sits in front of us as plainly as a steering wheel. That climate change is all-enveloping means that it targets us all and that we must all share in the responsibility so we do not all share in the suffering — at least not share in so suffocatingly much of it.
Since I first began writing about climate a few years ago, I’ve been asked often whether I see any reason for optimism. The thing is, I am optimistic. But optimism is always a matter of perspective, and mine is this: No one wants to believe disaster is coming, but those who look, do. At about two degrees Celsius of warming, just one degree north of where we are today, some of the planet’s ice sheets are expected to begin their collapse, eventually bringing, over centuries, perhaps as much as 50 feet of sea-level rise. In the meantime, major cities in the equatorial band of the planet will become unlivable.
What is the tone of the passage?`, qi: ``, o: [`Ascerbic`, `Speculative`, `Introspective`, `Cautionary`, `Optimistic`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 9, s: `English Language`, q: `In the following question, a sentence is given with four words marked as (A), (B), (C) and (D).
These words may or may not be placed in their correct order. Four options with different arrangements of these words have been provided. Mark the option with the correct arrangement as the answer. If no rearrangement is required, mark option (5) as your answer.
Thousands (A) and thousands of women (B) were switchboard phones (C) before direct dial operators(D)
were in use.`, qi: ``, o: [`B-D`, `B-A`, `B-C`, `C-D`, `No rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 10, s: `English Language`, q: `In the following question, a sentence is given with four words marked as (A), (B), (C) and (D).
These words may or may not be placed in their correct order. Four options with different arrangements of these words have been provided. Mark the option with the correct arrangement as the answer. If no rearrangement is required, mark option (5) as your answer.
For some (A) years the industry was restarted (B), but was abandoned(C) on a small (D) scale in 1903.`, qi: ``, o: [`A-B`, `C-D`, `B-C`, `A-C`, `No rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 11, s: `English Language`, q: `In the following question, a sentence is given with four words marked as (A), (B), (C) and (D).
These words may or may not be placed in their correct order. Four options with different arrangements of these words have been provided. Mark the option with the correct arrangement as the answer. If no rearrangement is required, mark option (5) as your answer.
After entertainment (A) the army (B), he restarted his leaving (C) career on the west coast with movie (D) and television roles.`, qi: ``, o: [`A-B`, `B-C`, `C-D`, `A-C`, `No rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 12, s: `English Language`, q: `In the following question, a sentence is given with four words marked as (A), (B), (C) and (D).
These words may or may not be placed in their correct order. Four options with different arrangements of these words have been provided. Mark the option with the correct arrangement as the answer. If no rearrangement is required, mark option (5) as your answer.
He continued (A) to have fragile (B) over the incident, renewing (C) our concerns over his nightmares (D)
mental wellbeing.`, qi: ``, o: [`C-D`, `B-D`, `A-B`, `C-B`, `No rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 13, s: `English Language`, q: `In the following question, a sentence is given with four words marked as (A), (B), (C), and (D).
These words may or may not be placed in their correct order. Four options with different arrangements of these words have been provided. Mark the option with the correct arrangement as the answer. If no rearrangement is required, mark option (5) as your answer.
The horrible (A) done to half her face caused damage (B) scarring that left her features lopsided (C) and her skin knotted (D).`, qi: ``, o: [`A-B`, `B-C`, `A-D`, `C-A`, `No rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 14, s: `English Language`, q: `Rearrange the following six sentences/ group of sentences (A), (B), (C), (D), (E) and (F) in the proper sequence to form a meaningful paragraph; then answer the questions given below them
Think of one factor that has made a great difference in the evolution of mankind.
Education therefore plays a crucial role in people’s capacity to contribute to the process of nation building.
We know that the labour skill of an educated person is more than that of an uneducated person.
Hence the former is able to generate more income than the latter and his contribution to economic growth is, consequently, more.
Perhaps it is man’s capacity to store and transmit knowledge which he has been doing through conversation, through songs and through elaborate lectures.
But man soon found out that we need a good deal of training and skill to do things efficiently.
Which of the following should be the FIRST sentence after rearrangement?`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 15, s: `English Language`, q: `Which of the following should be the SECOND sentence after rearrangement?`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 16, s: `English Language`, q: `Which of the following should be the FOURTH sentence after rearrangement?`, qi: ``, o: [`B`, `D`, `C`, `E`, `F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 17, s: `English Language`, q: `Which of the following should be the FIFTH sentence after rearrangement?`, qi: ``, o: [`E`, `B`, `C`, `F`, `D`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 18, s: `English Language`, q: `Which of the following should be the LAST sentence after rearrangement?`, qi: ``, o: [`C`, `A`, `E`, `F`, `B`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 19, s: `English Language`, q: `Select the most appropriate sentence with respect to grammar and usage.
Today the dominant form of economic organization at the world level is based about market-oriented mixed economies.`, qi: ``, o: [`Market socialism is the form of market economy where the means of production are socially owned.`, `Mexico have been called the 'birthplace' and 'burial ground' of the Green Revolution.`, `In 1961, India was on the brink of mass famine.`, `None of these`, `Select the most appropriate sentence with respect to grammar and usage.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 20, s: `English Language`, q: `Brazil's vast inland Cerrado region was regarding as unfit for farming before the 1960s because the`, qi: ``, o: [`soil was too acidic.`, `The effects to the Green Revolution on global food security are difficult to assess.`, `The spread of Green Revolution agriculture affected both agricultural biodiversity and wild biodiversity.`, `Acutely health problems may occur in workers that handle pesticides.`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 21, s: `English Language`, q: `Select the most appropriate sentence with respect to grammar and usage.`, qi: ``, o: [`Infiltration is the process by which water enters the soil.`, `Evaporation was an important part of the water cycle.`, `The upper phase of the river Ganges begun at the confluence of the Bhagirathi and Alkananda rivers.`, `First European traveller to mention the Ganges was the Greek envoy Megasthenes.`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 22, s: `English Language`, q: `Select the most appropriate sentence with respect to grammar and usage.`, qi: ``, o: [`Geographers attempt to understand the Earth terms of physical and spatial relationships.`, `Psychologists seek an understanding of the emergent properties of brains.`, `The purpose of archaeology is to learn more about past societies and the develop of the human race.`, `Regional survey is the attempt to systematically locate previous unknown sites in a region.`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 23, s: `English Language`, q: `Select the most appropriate sentence with respect to grammar and usage.`, qi: ``, o: [`Indian enterprises will continue to invest in digital transform to take advantage of the new market opportunities.`, `The restriction of inter-city and intra-city movement of non-essentials is expect to put additional pressure on existing logistics infrastructure.`, `During Covid, India became the second-largest manufacturer of PPE kits in the world.`, `Banking is an integral part of economy.`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 24, s: `English Language`, q: `Directions: The question below has two blanks, each blank indicating that something has been omitted. Choose the set of words for each blank that best fit the meaning of the sentence as a
whole.
The thieves knew how to 	the shopkeeper’s 	so they could steal the items.`, qi: ``, o: [`abstract, solace`, `concern, amuse`, `neglect, harass`, `divert, attention`, `ritual, aggravate`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 25, s: `English Language`, q: `Directions: The question below has two blanks, each blank indicating that something has been omitted. Choose the set of words for each blank that best fit the meaning of the sentence as a
whole.
Teenagers go through a phase in their life where their 	words seem to get them in 	.`, qi: ``, o: [`fettle, adept`, `salvation, ripe`, `exposure, evolved`, `abide, gracious`, `rude, trouble`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 26, s: `English Language`, q: `Directions: The question below has two blanks, each blank indicating that something has been omitted. Choose the set of words for each blank that best fit the meaning of the sentence as a
whole.
She 	her case with 	passion.`, qi: ``, o: [`argued, considerable`, `trivial, deterred`, `minute, enticed`, `meagre, denied`, `nominal, refuted`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 27, s: `English Language`, q: `Directions: The question below has two blanks, each blank indicating that something has been omitted. Choose the set of words for each blank that best fit the meaning of the sentence as a
whole.
Alcoholics often 	from periods of 	.`, qi: ``, o: [`prohibit, obligation`, `suffer, oblivion`, `forbid, awareness`, `permit, cognizance`, `hinder, memory`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 28, s: `English Language`, q: `Given below is a sentence that may or may not be grammatically viable, choose the most suitable alternative that reflects the grammatically correct sentence.
The CBI officer look into all the evidence. The case was closed years ago. The jury was hung and could not reach a verdict.`, qi: ``, o: [`Looked into`, `Look into`, `Looks into`, `was looked into`, `Looking into`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 29, s: `English Language`, q: `Given below is a sentence that may or may not be grammatically viable, choose the most suitable alternative that reflects the grammatically correct sentence.
Did daddy tell you how little to spend on groceries?, the markets are fluctuating widely. So we need to have a proper amount.`, qi: ``, o: [`how Little`, `how more`, `how much`, `A little`, `how many`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 30, s: `English Language`, q: `Given below is a sentence that may or may not be grammatically viable, choose the most suitable alternative that reflects the grammatically correct sentence. If the sentence does not require any
correction, choose option 5. 'none of the above.'
He used to be playing football professionally but he had to quit because of an injury. It is a tragedy as he was a good player.`, qi: ``, o: [`used to be playing`, `to be played`, `used to play`, `to plays`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 31, s: `Quantitative Aptitude`, q: `Directions: The following direction shows the percentage distribution of number of (Male + Female) studying in five different colleges and the second pie chart shows the percentage distribution of the
number of males studying in five different colleges A, B, C, D and E. Total number of students (Male + Female) = 2500

Total number of male students = 1200

Find the ratio between the number of male students studying in A and B to the number of female students studying in A and B.`, qi: `q31_combined.png`, o: [`43: 78`, `31: 57`, `59: 78`, `48: 57`, `38: 43`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 32, s: `Quantitative Aptitude`, q: `In college A, ages of 1/4th of total males is more than 30 years and ages of 3/5th of total females is less than 30 years. Find the difference between number of males who are less than or equal to 30 yrs and
the number of females who are more than or equal to 30 years in college A.`, qi: `q31_combined.png`, o: [`200`, `110`, `165`, `160`, `230`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 33, s: `Quantitative Aptitude`, q: `Out of the total number of females in college A, the number of females who are from cities is 40% of the total female students in that college and rest are from villages. Find the sum of number of females
in college A who are from villages and total number of females who are in college D.`, qi: `q31_combined.png`, o: [`379`, `346`, `449`, `426`, `422`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 34, s: `Quantitative Aptitude`, q: `If 2/5th of the female students in college C and 1/2 of the female students in college E are participating in a sports competition and 2/3rd of the total students in college C and 3/5th of the total students in
college E are participating in the sports competition, find number of males participating in sports competition from C and E.`, qi: `q31_combined.png`, o: [`324`, `378`, `346`, `392`, `356`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 35, s: `Quantitative Aptitude`, q: `Out of the total female students in college B, the number of female who are doing post graduation in Evening shift is equal to the average of the number of male students in college D and E. The rest of the
female students are doing post graduation in the morning shift. Find the difference between the number of females who are doing post graduation in morning shift from college B and the number of female students in college A.`, qi: `q31_combined.png`, o: [`40`, `90`, `30`, `10`, `80`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 36, s: `Quantitative Aptitude`, q: `There are two candidates participated in an election. It was found that 25% of votes were invalid. One who won the election got 70% of total valid votes, if the total number of votes are 84000. Find the
number of valid votes that the other candidate got.`, qi: ``, o: [`17500`, `18500`, `17800`, `18900`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 37, s: `Quantitative Aptitude`, q: `Sunita can finish a project in 21 days and Sarita can finish the same project in 15 days. Sarita worked for 10 days and left the job. How many days would it take Sunita to finish the remaining work alone?`, qi: ``, o: [`10 days`, `7 days`, `12 days`, `11 days`, `8 days`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 38, s: `Quantitative Aptitude`, q: `What should come in the place of (?) in the given series?
244, 100, 269, 73, 298, (?)`, qi: ``, o: [`38`, `56`, `65`, `42`, `50`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 39, s: `Quantitative Aptitude`, q: `What should come in the place of (?) in the given series?
121, 130, 119, 132, (?), 134`, qi: ``, o: [`120`, `115`, `116`, `117`, `118`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 40, s: `Quantitative Aptitude`, q: `What should come in place of the question mark '?' in the following number series?
2, 3, 5, 9, 17, (?), 65`, qi: ``, o: [`30`, `28`, `35`, `33`, `32`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 41, s: `Quantitative Aptitude`, q: `What should come in place of (?) in the given series?
17, 37, 77, 137, 217, (?)`, qi: ``, o: [`347`, `357`, `327`, `317`, `307`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 42, s: `Quantitative Aptitude`, q: `What should come in the place of (?) in the given series?
2000, 200, 40, 12, 4.8, ?`, qi: ``, o: [`2.2`, `1.8`, `1.6`, `1.2`, `2.4`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 43, s: `Quantitative Aptitude`, q: `A sum when invested at certain rate of simple interest for 3 years gives interest equals to 3/4th of the sum. Find the amount received when Rs. 1500 is invested at the same rate for 2 years at compound
interest, compounded annually.`, qi: ``, o: [`Rs. 2343.75`, `Rs. 3245.15`, `Rs. 2509.52`, `Rs. 3015.08`, `Rs. 2287.65`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 44, s: `Quantitative Aptitude`, q: `Mixture P of lime juice and water contains 45% lime juice and rest water. x ml of lime juice and 2x ml of water is added to mixture P such that ratio of lime juice to water in the resultant mixture becomes
15:23. Find the ratio of the initial quantity of mixture P to x.`, qi: ``, o: [`5:7`, `6:11`, `3:7`, `11:7`, `10:3`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 45, s: `Quantitative Aptitude`, q: `Directions: The below table shows the average number of males and females , difference between males and females, total number of boys and girls having chocolates and number of boys having
chocolates in five different schools.
Schools
Average
Number of boys and girls
Difference between
number of boys and girls
Total number of boys and girls having chocolate
Number of boys having
chocolate
A
275
50
250
150
B
375
50
300
200
C
375
150
400
150
D
475
50
350
200
E
225
50
300
100
Note:
If in only school B, the number of boys is less than the number of girls in the same school.
Total number of chocolate having students in school E is how much percent more than the total number of girls present in the school E.`, qi: ``, o: [`45%`, `50%`, `75%`, `60%`, `40%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 46, s: `Quantitative Aptitude`, q: `If the number of boys and girls in school D is increased by 40% and 20% respectively. Find the difference between the chocolate required to all boys and girls in school D.`, qi: ``, o: [`170`, `140`, `110`, `130`, `150`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 47, s: `Quantitative Aptitude`, q: `If new 200 chocolates are distributed to boys and girls according to the ratio present in the school C. Find the total number of boys having chocolates in School C at present.`, qi: ``, o: [`340`, `330`, `270`, `310`, `290`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 48, s: `Quantitative Aptitude`, q: `3/7 th of the total boys in school B is from section P and 5/8 of the girls in the school B are from section P respectively. Total number of boys and girls having chocolate from section P is 33.33%.
Number of girls having chocolate from section P is 75. Find the ratio between the number of boys and girls from section P in school B not having chocolate.`, qi: ``, o: [`7: 8`, `2: 5`, `5: 7`, `3: 4`, `1: 2`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 49, s: `Quantitative Aptitude`, q: `If the number of boys having chocolate in school A is increased by 20% and the number of girls having chocolate in school A is increased by 25%. Find the difference between the number of boys and girls
not having chocolate in school A.`, qi: ``, o: [`20`, `5`, `10`, `15`, `25`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 50, s: `Quantitative Aptitude`, q: `The cost price of 8 apples is equal to the selling price of 5 apples and cost price of 13 oranges is equal to selling price of 10 oranges, If the ratio of cost price of 1 apple to 1 orange is 5 : 2, Find the net profit
percent on the sale of 8 apples and 10 oranges.`, qi: ``, o: [`55%`, `40%`, `50%`, `45%`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 51, s: `Quantitative Aptitude`, q: `Average of four numbers is 14. Out of four numbers, first number is two times of second number, second number is three times of third number, third number is one-fourth of fourth number. Find the
fourth number.`, qi: ``, o: [`12`, `13`, `16`, `17`, `18`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 52, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and mark the appropriate answer.
x2 + 5x – 104 = 0
y2 + 30y + 224 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 53, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and mark the appropriate answer.
2x2 + 5x – 3 = 0
2y2 – 5y + 2 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between y and y cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 54, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and mark the appropriate answer.
x2 – 38x + 360 = 0
y2 + 10y + 24 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 55, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and mark the appropriate answer.
x2 – 20x + 99 = 0
y2 – 9y + 20 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 56, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and mark the appropriate answer.
6x2 – 17x + 5 = 0
10y2 + 3y – 1 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 57, s: `Quantitative Aptitude`, q: `Directions: Read the below information and answer the following questions.
The total number of Sarees sold in Shop A is 530. The number of Cotton Sarees sold in Shop C is 20% more than the number of Cotton Sarees sold in Shop A. The number of SilkSarees sold in Shop C is 55 less than the number of Cotton Sarees sold in Shop B. The number of Silk Sarees sold in Shop B is 20 more than the number of Cotton Sarees sold in Shop C. The number of Cotton Sarees sold in Shop A is 30 more than the number of Silk Sarees sold in Shop C. Total number of Cotton Sarees sold in all three shops is 825.
Note: Total number of Sarees sold = Number of Cotton Sarees sold + Number of Silk Sarees sold.
Find the difference between the number of Silk and Cotton Sarees sold in all three shops.`, qi: ``, o: [`10`, `7`, `8`, `5`, `9`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 58, s: `Quantitative Aptitude`, q: `If the number of Cotton and Silk Sarees sold in Shop A is increased by 30% and 25% respectively, then find the total number of Sarees sold in Shop A.`, qi: ``, o: [`525`, `675`, `575`, `475`, `355`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 59, s: `Quantitative Aptitude`, q: `The sum of the number of Silk Sarees sold in Shop B and C is how much percentage more than the number of Cotton Sarees sold in Shop C.`, qi: ``, o: [`90%`, `50%`, `75%`, `80%`, `70%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 60, s: `Quantitative Aptitude`, q: `A cylindrical bucket filled with sand is empty out on the ground, then a conical heap of height 24 cm of sand is formed. If the height of cylindrical bucket is 32 cm and it has 18 cm base radius, then find the
area covered on the ground by sand.`, qi: ``, o: [`3072.14 cm2`, `500.14 cm2`, `1296.14 cm2`, `4073.14 cm2`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 61, s: `Quantitative Aptitude`, q: `The addition of the length of two trains A and B is 410 m. The ratio of the speed of train A and train B is 4 : 7. The ratio between time to cross an electric pole by train A and train B is 5 : 3. Then, find the
difference (in m) between the length of train B and train A?`, qi: ``, o: [`8`, `10`, `12`, `15`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 62, s: `Quantitative Aptitude`, q: `The ratio of speed of boat in still water to the speed of stream is 5 : 2. It takes 4 hour more to travel 42 km upstream than to travel same distance downstream. Find the speed of boat in still water.`, qi: ``, o: [`12 km/hr`, `10 km/hr`, `15 km/hr`, `20 km/hr`, `17 km/hr`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 63, s: `Quantitative Aptitude`, q: `Rinku, Puneet and Sweety have balls in the ratio 7 : 6 : 9. If Sweety give 15 balls to Rinku then the ratio of number of balls Rinku, Puneet and Sweety have 5 : 3 : 3 respectively. Find the initial number
of balls that Rinku has.`, qi: ``, o: [`50`, `30`, `35`, `40`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 64, s: `Quantitative Aptitude`, q: `A's mother's present age is 6 times the present age of A. Sum of the ages of A's mother and father, after 5 years is 80 years, A's father is 10 years elder than A's mother. Find the present age of A?`, qi: ``, o: [`15`, `5`, `9`, `20`, `8`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 65, s: `Quantitative Aptitude`, q: `If A and B are involved in a business with the condition that if there is a profit at the end of the year, then both will divide the profit in equal ratio, and if there is a loss, then A will have to bear double the
loss from B. If there is a loss of Rs 3000 at the end of the year. Find the share of A.`, qi: ``, o: [`Rs. 1500`, `Rs. 2500`, `Rs. 2000`, `Rs. 1750`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 66, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the given questions.
Nine persons are sitting in a row facing north. A sits immediately right of one who sits fourth from the one of the extreme end. Three people sit between A and G. B sits immediately left of G. The number of persons sitting to the right of F is the same as the number of persons sitting to the left of C. The persons between H and C are two less than the persons sitting between E and F. B is the only neighbor of D.
How many persons are sitting to the right of J?`, qi: ``, o: [`Seven`, `Five`, `Two`, `Six`, `One`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 67, s: `Reasoning Ability`, q: `Who is sitting second to the right of the person who is sitting immediate left of H?`, qi: ``, o: [`the one who is sitting immediate right of B.`, `F`, `the one who is sitting immediate left of D.`, `G`, `C`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 68, s: `Reasoning Ability`, q: `Which of the following statement is true?`, qi: ``, o: [`G is sitting immediately left of B.`, `Two persons are sitting between F and J.`, `D is sitting at one of the extreme ends.`, `A is sitting third to the right of H.`, `A is sitting third to the right of E.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 69, s: `Reasoning Ability`, q: `How many persons are sitting between G and A?`, qi: ``, o: [`One`, `Three`, `Five`, `Seven`, `Two`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 70, s: `Reasoning Ability`, q: `Who is sitting in the middle of the row?`, qi: ``, o: [`B`, `C`, `E`, `H`, `D`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 71, s: `Reasoning Ability`, q: `Directions: In each question three statements followed by two conclusions numbered I and II have been given. You have to take the given statement to be true even if they seem to be at variance with
commonly known facts and then decide which of the given conclusions logically follows from the given statements. Give answer.
Statements :
Only a few pencils are papers. Only a few pens are inks.
Only a few inks are papers.
Conclusions :
Some inks are pencils.
No inks are pencils.`, qi: ``, o: [`If either conclusion I or II follows.`, `If both conclusions I and II follow.`, `If only conclusion II follows.`, `If only conclusion I follows.`, `If neither conclusion I nor II follows.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 72, s: `Reasoning Ability`, q: `Statements :
Only a few cars are trucks.
Only a few jeeps are buses.
Only a few buses are trucks.
Conclusions :
Some trucks are not jeeps.
All trucks are jeeps.`, qi: ``, o: [`If both conclusions I and II follow.`, `If only conclusion I follows.`, `If only conclusion II follows.`, `If either conclusion I or II follows.`, `If neither conclusion I nor II follows.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 73, s: `Reasoning Ability`, q: `Statements :
Only a few bottles are jugs.
Only a few pans are jugs.
Only a few jugs are mugs.
Conclusions :
No pans are mugs.
Some mugs are pans.`, qi: ``, o: [`If neither conclusion I nor II follows.`, `If only conclusion II follows.`, `If both conclusions I and II follow.`, `If only conclusion I follows.`, `If either conclusion I or II follows.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 74, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the given question.
Six persons Dev, Tom, Jak, Esha, Amu, and Hari live in six different flats in a three-storey building. They like different Metals (Brass, Gold, Tin, Silver, Copper, and Bronze). The bottommost floor is 1 and the floor above is 2 and so on. There are two types of flats on each floor, Flat X and Flat Y such that Flat X is to the west of Flat Y. Floor 1 of Flat X is immediately below Floor 2 of Flat X, and so on. Similarly, Flat Y follows. The dimensions of each of the flats are the same.
Note: If a person lives immediately above the other person, then the flat type of both is the same.
Hari is living two floors above the floor of the person who likes Tin in the same type of flat. Dev lives northeast of Amu. Esha lives to the southwest of Hari. The person who likes gold lives immediately above the one who likes brass metal in the same type of flat. The person who likes Copper lives to the northwest of the person who likes Bronze metal. Jak does not live on the same floor as the person who likes Silver.
What is the position of Jak to the one who likes Gold metal?`, qi: ``, o: [`immediately above`, `Immediately below`, `Two floor above`, `One floor below`, `South-East`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 75, s: `Reasoning Ability`, q: `On which of the floor does the person who likes Silver lives?`, qi: ``, o: [`Floor 1`, `Floor 2`, `Either Floor 1 or Floor 2`, `Floor 3`, `Either Floor 2 or Floor 3`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 76, s: `Reasoning Ability`, q: `Who among the following lives in the Flat X on the first floor?`, qi: ``, o: [`the person who likes Brass metal`, `Jak`, `Tom`, `the person who likes Tin metal.`, `Hari`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 77, s: `Reasoning Ability`, q: `Which of the following combination is true?`, qi: ``, o: [`Tom-Silver`, `Jak-Bronze`, `Dev- Tin`, `Amu-Copper`, `Esha-Gold`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 78, s: `Reasoning Ability`, q: `Who lives immediately below Hari in the same type of flat?`, qi: ``, o: [`Tom`, `Amu`, `Dev`, `Jak`, `Esha`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 79, s: `Reasoning Ability`, q: `Direction: Study the following information carefully and answer the question below.
If in the word "GRATEFUL" all the consonants are arranged in English alphabetical order followed by all vowels in English alphabetical order then, which of the following will be the third letter from the left end?`, qi: ``, o: [`L`, `R`, `F`, `A`, `G`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 80, s: `Reasoning Ability`, q: `How many such pairs of letters are there in the word "EFFICIENCY" each of which has as many letters between them in the word as in the English alphabet? (in both forward and backward
directions).`, qi: ``, o: [`One`, `Two`, `Three`, `Four`, `More than four`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 81, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the given questions.
Eight persons Uma, Joe, Raj, Drake, Nick, Lin, Punit, and Hary are sitting around a square table but not in the same order. Four of them are sitting at the corners of the table and facing toward the center while the other four are sitting at the middle of the table and facing away from the center.
Lin is sitting second to the right of Uma. Raj sits at the immediate right of Nick, who does not sit in the middle of the table. Two persons are sitting between Hary and Raj. Punit is sitting immediately left of Hary. Joe is not facing away from the center. Uma is not an immediate neighbor of Drake.
Who among the following sits second to the left of the one who sits third to the right of Uma?`, qi: ``, o: [`Drake`, `Raj`, `Punit`, `Joe`, `Nick`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 82, s: `Reasoning Ability`, q: `Who among the following faces Nick?`, qi: ``, o: [`Drake`, `Lin`, `Hary`, `Punit`, `Joe`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 83, s: `Reasoning Ability`, q: `Four of the following among five belong to a group find the one that does not belongs to the group.`, qi: ``, o: [`Joe`, `Drake`, `Nick`, `Hary`, `Lin`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 84, s: `Reasoning Ability`, q: `Who among the following sits third to left of Hary?`, qi: ``, o: [`the one who is sitting immediately left of Joe.`, `Drake`, `Uma`, `the one who is sitting immediate right of Nick.`, `Punit`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 85, s: `Reasoning Ability`, q: `How many persons are sitting between Nick and Joe (when counted from the left of Joe)?`, qi: ``, o: [`Two`, `Five`, `Three`, `Four`, `One`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 86, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the given questions.
Six friends Praveen, Geetu, Nitin, Amit, Manisha, and Kiran have different weights. The average weight of Praveen and Amit is equal to that of Nitin. Praveen has more weight than Nitin. Kiran has more weight than Geetu and Manisha but not the highest. At least two persons' weight is more than Geetu's. Nitin's
weight is less than Geetu's but more than Manisha's. Manisha's weight is not the least. The lowest weight is fifty- two kilograms and the highest weight is Seventy kilograms.
What is the difference in the age of Nitin and Praveen?`, qi: ``, o: [`Ten`, `Eighteen`, `Five`, `Seven`, `Nine`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 87, s: `Reasoning Ability`, q: `Which of the following statements is true?
Nitin weight is highest.
Geetu's weight is more than Manisha's.
Kiran weight is more than Praveen and Amit.`, qi: ``, o: [`Only I`, `Only II`, `Only III`, `Only I and II`, `Only II and III`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 88, s: `Reasoning Ability`, q: `What could be the weight of Manisha?`, qi: ``, o: [`51`, `67`, `62`, `55`, `69`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 89, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the given questions.
Five people Pam, Andy, Farah, Manu, and Neha were born in five different years 1940, 1953, 1966, 1976, and 1996 but not necessarily in the same order. Each person is born in different cities Mumbai, Bhopal, Noida, Kolkata, and Chennai. Their age is calculated from the year 2020.
Andy was born ten years before Neha. The person who was born in Noida was born immediately before the one who was born in Kolkata. Pam who was born in Bhopal was neither born in 1940 nor 1953. Andy was not born in Kolkata. Manu's age is not divisible by two. The person born in Mumbai is born in a leap year. Farah is not born in Mumbai.
Which of the person is born in leap year?`, qi: ``, o: [`Andy`, `Manu`, `Farah and Pam`, `Pam, Neha and Farah`, `Pam`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 90, s: `Reasoning Ability`, q: `What is the sum of the age of the person who is born in Noida and the one who is born in 1976?`, qi: ``, o: [`100`, `112`, `120`, `132`, `124`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 91, s: `Reasoning Ability`, q: `Whose age is a Prime number?`, qi: ``, o: [`Farah`, `Andy`, `The one who was born in Kolkata.`, `Neha`, `The one who was born immediately after Manu.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 92, s: `Reasoning Ability`, q: `How many persons are born between the one who is born in Bhopal and Kolkata?`, qi: ``, o: [`Two`, `One`, `Four`, `Either one or three`, `Three`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 93, s: `Reasoning Ability`, q: `Who was born in the year 1966?`, qi: ``, o: [`The person who is born in Kolkata`, `Andy`, `the person who is born in Bhopal`, `Farah`, `Pam`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 94, s: `Reasoning Ability`, q: `If it is possible to make only 3-letter English word with the 5th, 8th and 11th letters of the word 'BURKINAFASO', which of the following will be the first letter from the left end of that word? If no
such word can be made give 'P' as the answer and if more than one such word can be made give 'H' as the answer.`, qi: ``, o: [`P`, `H`, `I`, `O`, `F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 95, s: `Reasoning Ability`, q: `Directions: In the following question assuming the given statements to be true, find which of the conclusion among given conclusions is/are definitely true and then give your answers accordingly.
Statement: A > P < N = Z > R ≤ O ≥ H = M < D > I ≥ K
Conclusions:
Z > H
A < O`, qi: ``, o: [`Only conclusion I follows`, `Only conclusion II follows`, `Either conclsion I or II follows`, `Neither conclusion I nor II follows`, `Both conclusion I and II follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 96, s: `Reasoning Ability`, q: `Directions: In the following question assuming the given statements to be true, Find which of the conclusion among the given conclusions is/are definitely true and then give your answers accordingly.
Statement: B > C ≥ D = E; F > E; C < H
Conclusion:
D > H
E ≥ C
Both I and II follow`, qi: ``, o: [`Only I follow`, `Either I or II follow`, `Only II follow`, `Neither I nor II follow`, `Que. 97Que. 97`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 97, s: `Reasoning Ability`, q: `Que. 97
Direction: In the following question assuming the given statements to be true, find which of the conclusion among given conclusions is/are definitely true and then give your answers accordingly.
Statement: M > P ≥ O = G ≥ S > V > U
Conclusions:
P > V
V < M`, qi: ``, o: [`Only I follow`, `Only II follow`, `Both I and II follow`, `Either I or II follows`, `Neither I nor II follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 98, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the given questions.
There are seven members P, A, N, S, K, Y, and D in a family. S is the granddaughter of Y who is married to K. D is the only son of A and A is the brother of P. P is the sister-in-law of N and N is the mother of S. K is the grandfather of D.
Which of the following statement is definitely true?`, qi: ``, o: [`Y is the sister of N`, `P is the son of K`, `D and A are siblings`, `S is the sister of D`, `N is the sister of A.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 99, s: `Reasoning Ability`, q: `How many men are there in the family?`, qi: ``, o: [`Four`, `Two`, `Six`, `Five`, `Three`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 100, s: `Reasoning Ability`, q: `How is A related to S?`, qi: ``, o: [`Son`, `Daughter`, `Mother-in-law`, `Father`, `Father-in-law`], oi: [``, ``, ``, ``, ``], e: `` }
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
      tags: ['IBPS', 'PO', 'Prelims', 'PYQ', '2023', '30 September 2023 Shift-1'],
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

  const TEST_TITLE = `IBPS PO Prelims - 30 September 2023 Shift-1`;
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2023, pyqShift: `30 September 2023 Shift-1`,
    pyqExamName: 'IBPS PO Prelims', questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
