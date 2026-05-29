/**
 * Seed: IBPS PO Prelims - 04 December 2021 Shift-1
 * IBPS PO Prelims — Probationary Officer Preliminary Exam.
 * 100 Q × 1 mark, 3 sections (Eng 30 / Reas 35 / Quant 35), 60 min total,
 * sectional timing 20 min each, 0.25 negative marking.
 * Uploads question/option images from local _extracted_ibps_po_04dec2021_shift1/ to Cloudinary.
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

const EXTRACTED_DIR = path.resolve(__dirname, '../_extracted_ibps_po_04dec2021_shift1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/ibps-po-prelims-04dec2021-s1';
const F = '04dec2021-s1';

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

const KEY = [2, 5, 4, 1, 4, 5, 5, 5, 4, 1, 2, 1, 3, 5, 2, 2, 1, 4, 3, 3, 2, 3, 3, 1, 1, 5, 5, 3, 4, 2, 3, 2, 5, 4, 4, 3, 3, 4, 2, 4, 3, 1, 2, 5, 2, 1, 2, 3, 5, 4, 3, 5, 5, 4, 1, 1, 2, 4, 3, 3, 2, 5, 3, 4, 5, 3, 5, 2, 2, 4, 1, 2, 3, 5, 1, 2, 3, 3, 4, 3, 5, 4, 4, 2, 1, 3, 3, 4, 5, 2, 5, 3, 2, 5, 2, 5, 1, 2, 3, 2];
const RAW = [
  { n: 1, s: `English Language`, q: `Read the following passage carefully and answer the questions given below it. Certain words
have been highlighted for your attention.
Most people spend (on average) half of their day tapping away at their hand-held devices. Either, surfing the
net or checking notifications. Facebook ranks the highest in all social networking platforms, followed by
Twitter, Instagram and so forth.
Social media is addictive- which is why so many people are 'hooked'. Often referred to as Social networking
addiction, this phrase is often used to describe someone who spends too much time on Facebook, Twitter,
Instagram and other channels. A blog post, Instagram post, tweet, or youtube video can be produced easily by
anyone and shared, which can then be viewed by millions for free. Psychologists and scientists have now
taken the time to study social media in terms of why they believe it interferes with aspects of our daily
life.There is no official medical term that identifies addiction and social networking. It cannot be deemed as a
disease or disorder as the cases are not severe and the habit can easily be maintained or prevented.
Furthermore, instead of spending long periods of time on social media, we dip into and out of these sites all
day long. We check for updates from friends and family as well as news and information. However, the
behavior associated with the excessive use of these channels has become the subject of much public and
sociological debate.We actively post, like, comment and share personal posts. Not only that, we tend to share
and reshare expressions (of either negative or positive) contagiously. But, why?
Scientists believed some years ago that, dopamine was simply a pleasure chemical in the brain. Recent
studies have shown that; dopamine actually produces the desire in people to 'want' by drawing out the need
for us to -seek and search. Creating the ultimate drive to find what is that what we want.
Dopamine is spontaneous. It’s stimulated by unpredictability and small bits of information as well as reward
cues which are the same conditions that social media presents to all users. In addition, the pull of dopamine is
so strong that recent studies have shown that tweeting, for example, can be harder to resist than cigarettes and
alcohol!
Researchers at Chicago University studied the effects of social media. They concluded quite quickly that
people presented higher levels of addiction to social media than the need to smoke or drink. Media cravings
ranked higher.
And, let’s not forget oxytocin, many call it the cuddle chemical because the brain releases pleasure chemicals
that transpire usually when you kiss and hug- or tweet. It is also known as the hormone that builds the strong
yet unique bond between mothers and their babies. Oxytocin is now regarded as the human stimulant of
empathy, generosity, trust, and more. These are factors which many advertisers and marketers play on when
promoting a brand or business over social media.
Nevertheless, problems have arisen most commonly with school kids - whereby mobile phone devices have
been confiscated because exam results have fallen severely due to lack of attention on homework or studies.
Schools in many westernized countries have had to take drastic action - banning smartphones, iPad and most
portable devices from school premises- as it is claimed to be a huge distraction. Whereas, other schools use it
for educational purposes and as a rewards system for their pupils.
Research has also indicated unsurprisingly that Facebook is the most common activity that university
students switch to, when studying. Worryingly, it has also found that those who most engage in this type of
internet browsing tend to have lower levels of educational achievement.
Also, there have been many cases of students posting or sharing content that is unethical, which has caused
parents and academic institutions to limit the use of these online networking channels.
Which is the most common activity that university students switch to when studying?`, qi: ``, o: [`Youtube`, `Facebook`, `Twitter`, `Whatsapp`, `All of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 2, s: `English Language`, q: `Why is there no real medical term that identifies addiction and social networking?`, qi: ``, o: [`Research is not yet done on the subject`, `It cannot be deemed as a disease or disorder as cases are not severe`, `The habit can easily be maintained or prevented`, `1 and 2`, `2 and 3`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 3, s: `English Language`, q: `What stands true about Dopamine in the present scenario?`, qi: ``, o: [`It creates the ultimate drive to find what is that what we want.`, `It’s stimulated by unpredictability and small bits of information as well as reward cues.`, `Dopamine was simply a pleasure chemical in the brain`, `1 and 2`, `2 and 3`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 4, s: `English Language`, q: `Why is Oxytocin regarded as the cuddle chemical?`, qi: ``, o: [`The brain releases pleasure chemicals that transpire usually when you kiss and hug- or tweet.`, `It builds the strong yet unique bond between mothers and their babies.`, `It produces the desire in people to “want” by drawing out the need for us to -seek and search.`, `1 and 2`, `2 and 3`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 5, s: `English Language`, q: `Which of the following words is the most similar in meaning to the word ‘contagiously’ as
given in the passage?`, qi: ``, o: [`Assail`, `Ambivalent`, `Arboreal`, `Malignant`, `Cogent`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 6, s: `English Language`, q: `Which of the following words is the most opposite in meaning to the word ‘confiscated’ as
given in the passage?`, qi: ``, o: [`Cognizant`, `Covet`, `Expiate`, `Pithy`, `Relinquish`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 7, s: `English Language`, q: `What were the conclusions taken out by the researchers at Chicago University on studying the
effects of social media?`, qi: ``, o: [`People presented higher levels of addiction to social media than the need to smoke or drink.`, `Levels of addiction of smoking and drinking were higher than that of media craving.`, `There was a higher rate of media cravings.`, `1 and 2`, `1 and 3`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 8, s: `English Language`, q: `What actions are taken by schools for students regarding mobile phone devices as mentioned
in the passage?`, qi: ``, o: [`Punish students who bring mobile phones to schools.`, `Use it for educational purposes and as a rewards system for their pupils.`, `Banning smartphones, iPad and most portable devices from school premises.`, `1 and 2`, `2 and 3`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 9, s: `English Language`, q: `What does the phrase 'Social Networking Addiction' mean?`, qi: ``, o: [`Stalking People Socially`, `Creating Fake profiles for fun`, `Finding your Friend Circle Online`, `Someone who spends too much time on social websites`, `Someone who is an introvert socially`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 10, s: `English Language`, q: `Which of the below sentences summarizes the key idea of the passage?`, qi: ``, o: [`The Psychology of Social Addiction`, `The Addiction in Students`, `The Science behind Addiction`, `Beliefs of Scientists for Social Life`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 11, s: `English Language`, q: `Direction: The following sentences form a paragraph. The sentences are - A, B, C, D, E and F.
Sentence E is fixed and its position cannot be changed. The rest of the sentences are not given
in their proper order. Read the sentences and answer the following questions.
A. So a person that has integrity will act and behave as per set values and beliefs they hold dear.
B. There is a famous saying which perfectly describes integrity.
C. The word ‘integrity’ itself has a Latin origin.
D. “Honesty is telling the truth to other people; integrity is telling the truth to myself.”
E. So it refers to the sense of completeness and togetherness one enjoys when they live their lives
honestly and morally.
F. It is derived from the word ‘integer’ and means to feel whole, i.e., a complete person.
Which sentence should be the sixth sentence in the paragraph?`, qi: ``, o: [`F`, `A`, `D`, `C`, `B`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 12, s: `English Language`, q: `Which sentence should be the fourth sentence in the paragraph?`, qi: ``, o: [`F`, `B`, `C`, `D`, `A`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 13, s: `English Language`, q: `Which sentence should be the third sentence in the paragraph?`, qi: ``, o: [`A`, `B`, `C`, `D`, `F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 14, s: `English Language`, q: `Which sentence should be the second sentence in the paragraph?`, qi: ``, o: [`B`, `F`, `C`, `A`, `D`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 15, s: `English Language`, q: `Which sentence should be the first sentence in the paragraph?`, qi: ``, o: [`A`, `B`, `C`, `D`, `F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 16, s: `English Language`, q: `Directions: In each of the questions given below, three words are given in bold. These three
words may or may not be in their correct positions. The sentence is then followed by options
with the correct combination of words that should replace each other in order to make the sentence
grammatically and contextually correct. Find the correct combination of words that replace each other.
If the sentence is correct as it is, select '5' as your option.
Approved (A) on Saturday said (B) a third coronavirus vaccine for domestic use, Prime Minister Mikhail
Mishustin Russia (C) on state TV.`, qi: ``, o: [`ACB`, `CAB`, `BAD`, `ABC`, `None of the above.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 17, s: `English Language`, q: `Directions: In each of the questions given below, three words are given in bold. These three
words may or may not be in their correct positions. The sentence is then followed by options
with the correct combination of words that should replace each other in order to make the sentence
grammatically and contextually correct. Find the correct combination of words that replace each other.
If the sentence is correct as it is, select '5' as your option.
It is mind (A) that people should keep in asserted (B) the importance of adherence to COVID-19 appropriate
behaviour (C).`, qi: ``, o: [`BAC`, `CAB`, `ABC`, `CBA`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 18, s: `English Language`, q: `Directions: In each of the questions given below, three words are given in bold. These three
words may or may not be in their correct positions. The sentence is then followed by options
with the correct combination of words that should replace each other in order to make the sentence
grammatically and contextually correct. Find the correct combination of words that replace each other.
If the sentence is correct as it is, select '5' as your option.
The AstraZeneca company is going to vaccine (A) in Japan doses of the coronavirus produce (B) enough for
40 million people (C), the executive director of the Japanese department of the firm said.`, qi: ``, o: [`CAB`, `ACB`, `ABC`, `BAC`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 19, s: `English Language`, q: `In each of the questions given below, three words are given in bold. These three words may or
may not be in their correct position. The sentence is then followed by options with the correct
combination of words that should replace each other in order to make the sentence grammatically and
contextually correct. Find the correct combination of words that replace each other. If the sentence is
correct as it is, select ‘5’ as your option.
The received (A) birthday party was the best surprise (B) Andrew could have gift. (C)`, qi: ``, o: [`ABC`, `BAC`, `BCA`, `CAB`, `No Rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 20, s: `English Language`, q: `In each of the questions given below, three words are given in bold. These three words may or
may not be in their correct position. The sentence is then followed by options with the 4
placements of words. Find the correct placement. If the sentence is correct as it is, select ‘5’ as your
option.
The blared (A) parlour’s owner night (B) really loud music all tattoo (C) long.`, qi: ``, o: [`BCA`, `ABC`, `CAB`, `BAC`, `No Rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 21, s: `English Language`, q: `Read the following sentence and determine whether there is an error in it. The error, if any,
will be in one part of the sentence. If the sentence is error-free, then select ‘No Error’ as your
answer.
Psychiatrists feel that having a knowledge of (A)/ the physical and mental changes that occurs in one's body
(B)/ and the reasons behind them (C)/ have become essential for all teenagers. (D)`, qi: ``, o: [`A`, `B`, `C`, `D`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 22, s: `English Language`, q: `Read the following sentence and determine whether there is an error in it. The error, if any,
will be in one part of the sentence. If the sentence is error-free, then select ‘No Error’ as your
answer.
As these books on science are (A)/ published only in English, (B)/ we seldom or ever (C)/ find them in
regional languages. (D)`, qi: ``, o: [`A`, `B`, `C`, `D`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 23, s: `English Language`, q: `In the following question, some parts of the sentence may have an error. The error, if any, will
be in one part of the sentence. Find out which part of the sentence has an error and select the
appropriate option. If a sentence is free from errors select ‘No error’ as your answer.
One evening of each week (A) / was set apart by him (B) / for the reception of whomsoever (C) / chose to
visit him. (D) / No error (E)`, qi: ``, o: [`(A)`, `(B)`, `(C)`, `(D)`, `(E)`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 24, s: `English Language`, q: `Read the sentence below to find out if there is any error in it. The error, if any, will be in one
part of the sentence. The letter of that part is the answer. If there is no error the answer is (5).
(Ignore errors in punctuation if any)
Reports of researchers mysterious (A)/ falling ill
at the Wuhan Institute in late 2019, (B) /and other reports of a researcher (C)/
who has reportedly gone missing. (D)/No Error (E)`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 25, s: `English Language`, q: `In the following sentence, some parts have errors and some are correct. Find out
which part has an error and mark it as your answer. If there is no error, mark ‘No
error’ as your answer.
Populist politics among the world has (A)/ sought to privilege national sovereignty (B)/ over universal values
and commitments, (C)/ slacking off efforts to tackle critical challenges that are transnational. (D)/ No error
(E)`, qi: ``, o: [`Only A`, `C and D`, `Only C`, `D and B`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 26, s: `English Language`, q: `Given below is a word, followed by three sentences that consist of that word. Identify the
sentences(s) that best express(es) the meaning of the word.
Wind
A. That noise you can hear is the tape winding back.
B. The blow to my stomach knocked the wind out of me.
C. The sails flapped in the wind.`, qi: ``, o: [`Only B`, `A and C`, `B and C`, `Only C`, `All of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 27, s: `English Language`, q: `Given below is a word, followed by three sentences that consist of that word. Identify the
sentences(s) that best express(es) the meaning of the word.
Fellow
A. He seemed like a decent fellow.
B. He's a fellow of the Royal Institute of Chartered Surveyors.
C. A member of staff was sacked for stealing from fellow employees.`, qi: ``, o: [`Only A`, `Only B`, `A and B`, `A and C`, `All of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 28, s: `English Language`, q: `Given below is a word, followed by three sentences that consist of that word. Identify the
sentences(s) that best express(es) the meaning of the word. Choose option 5 ‘None of the
above’ if the word is not suitable in any of the sentences.
Ascent
A. She made her first successful ascent of Everest last year.
B. She nodded her ascent to the proposal..
C. His ascent to power was rapid and unexpected.`, qi: ``, o: [`Only C`, `Only A`, `A and C`, `B and C`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 29, s: `English Language`, q: `Direction: A sentence/part of the sentence is emboldened. Five alternatives are given to the
embolden part which will improve the sentence. Choose the correct alternative and choose
the option corresponding to it. In case no improvement is needed, click the option corresponding to ‘No
improvement required’.
He slapped the team into action and they headed for the town at a more leisure pace.`, qi: ``, o: [`many leisurely`, `many leisured`, `more leisure paced`, `more leisurely pace`, `No improvement required`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 30, s: `English Language`, q: `In the following sentence, a part of the sentence is underlined. Below are given alternatives to
the underlined part, which may improve the sentence. Choose the correct alternative. In case
no improvement is needed, choose the alternative that indicates 'No improvement'.
Although both the United States and China are formidable world powers, India should side with the later.`, qi: ``, o: [`India should side along the later`, `India should side with the latter`, `India should side along the latter`, `India should be siding with the later`, `No Improvement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 31, s: `Quantitative Aptitude`, q: `Direction: Read the following table carefully and answer the following questions:
Company Total Total workers Male to female ratio
employees
Employees Workers
A 28000 10000 3 : 4 2 : 3
B 25000 6000 2 : 3 2 : 1
C 22000 8000 5 : 6 1 : 3
D 30000 5000 2 : 1 4 : 1
E 40000 4000 5 : 3 1 : 1
Find the average male employees of five companies.`, qi: ``, o: [`15600`, `16400`, `15400`, `16600`, `14400`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 32, s: `Quantitative Aptitude`, q: `What is the ratio between the number of female workers and female employees of five companies?`, qi: ``, o: [`1 : 5`, `1 : 4`, `2 : 5`, `1 : 3`, `2 : 3`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 33, s: `Quantitative Aptitude`, q: `The male workers are approximately what percent of the total workers of five companies?`, qi: ``, o: [`45%`, `42%`, `38%`, `52%`, `48%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 34, s: `Quantitative Aptitude`, q: `Find the difference between the female employees of company D and female workers of the same
company.`, qi: ``, o: [`8000`, `7000`, `10000`, `9000`, `12000 The female workers of five companies are how much percent more than the male workers of five`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 35, s: `Quantitative Aptitude`, q: `companies?`, qi: ``, o: [`3.33%`, `8.5%`, `12.5%`, `6.25%`, `16.66%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 36, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and
mark the appropriate answer.
I. x2 – 37x + 330 = 0
II. y2 – 28y + 195 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 37, s: `Quantitative Aptitude`, q: `Direction: In the following questions two equations numbered I and II are given. You have to
solve both the equations and find relation between x and y.
I. x2 + 14x + 48 = 0
II. y2 + 12y + 32 =0`, qi: ``, o: [`x ≥ y`, `x > y`, `Relationships cannot be established between x and y`, `x ≤ y`, `y > x`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 38, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. You have to solve both the
equations and mark the appropriate answer.
I. 16x2 – 32x + 15 = 0
II. 16y2 – 48y + 35 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or no relationship could be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 39, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and
mark the appropriate answer.
I. x2 – 35x + 294 = 0
II. y2 – 68y + 1140 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 40, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and
mark the appropriate answer.
I. x2 - 12x + 35 = 0
II. y2 - 25y + 126 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 41, s: `Quantitative Aptitude`, q: `Directions: Degree- wise breakup of employees working in various department of an organisation
and the ratio to men to women.
Respective ratio of men to women in each department
Department Men Women
Production 5 4
HR 20 13
IT 5 4
Marketing 7 10
Accounts 15 17
What is the number of men working in the marketing department?`, qi: ``, o: [`240`, `360`, `420`, `720`, `500`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 42, s: `Quantitative Aptitude`, q: `What is the respective ratio of the number of women working in the Marketing department and the
number of men working in the Hr department?`, qi: ``, o: [`3 : 4`, `4 : 5`, `7 : 5`, `4 : 7`, `9 : 4`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 43, s: `Quantitative Aptitude`, q: `The number of men working in the IT department of the Organisation is approximately what
percent of the total number of employees working in that department?`, qi: ``, o: [`24%`, `56%`, `40%`, `72%`, `50%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 44, s: `Quantitative Aptitude`, q: `The number of women working in the Production department of the Organisation is what percent
of the total number of employees working in all the department together?`, qi: ``, o: [`4%`, `6%`, `5%`, `7%`, `8%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 45, s: `Quantitative Aptitude`, q: `What is the total number of women working in the organisation?`, qi: ``, o: [`2450`, `2830`, `2520`, `2480`, `3320`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 46, s: `Quantitative Aptitude`, q: `Directions: Read the following data carefully and answer the questions given below:
There are 6300 students in Manipur University in the academic year 2020. The ratio of the boys to
the girls in the University is 5 : 4. All the students are enrolled in different indoor activities (Chess, Carom,
Debating, Painting, and Quiz) and one student is enrolled in only one indoor activity. The number of boys
enrolled in the Painting is 621. The ratio of the number of boys who enrolled in Chess to the number of boys
who enrolled in Carom is 5 : 3. 36% of the students are enrolled in Quiz. The number of boys enrolled in
Debating is 25% of the total number of boys. The number of girls enrolled in Quiz is 640 which is 150 less
than the number of girls enrolled in Carom. The number of girls enrolled in Chess is 186 more than the
number of boys enrolled in the same activity. The total number of students enrolled in Painting is 816.
Find the percentage of students of the university who are enrolled in Chess. (approximately)`, qi: ``, o: [`10%`, `20%`, `15%`, `25%`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 47, s: `Quantitative Aptitude`, q: `Find the ratio of the number of boys enrolled in Carom to the number of girls enrolled in the same
activity.`, qi: ``, o: [`151 : 790`, `141 : 790`, `2 : 9`, `23 : 17`, `59 : 31`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 48, s: `Quantitative Aptitude`, q: `The difference in the number of boys and girls who are enrolled in painting is what percentage of
the total number of students who are enrolled in Debating? (approximately)`, qi: ``, o: [`20%`, `34%`, `26%`, `38%`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 49, s: `Quantitative Aptitude`, q: `Find the number of girls who are enrolled in Debating.`, qi: ``, o: [`875`, `141`, `640`, `790`, `754`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 50, s: `Quantitative Aptitude`, q: `The total number of girls in Quiz is approximately what percent of the total number of students in
Quiz?`, qi: ``, o: [`18%`, `72%`, `62%`, `28%`, `36%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 51, s: `Quantitative Aptitude`, q: `10 years ago, respective ratio of the age of mother and daughter was 4 : 1. 10 years later, the
respective ratio of the age of mother and daughter will become 2 : 1. At present, what is the sum of
their age?`, qi: ``, o: [`55 years`, `65 years`, `70 years`, `75 years`, `77 years`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 52, s: `Quantitative Aptitude`, q: `The income of Aman is Rs. 30,000 per month and his expenditure is Rs. 20,000 per month. In the
next month, his income increases by Rs. 10,000 per month, and expenditure increases to Rs. 25,000
per month. In the next month, his savings increases by what percent?`, qi: ``, o: [`55%`, `25%`, `100%`, `12.5%`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 53, s: `Quantitative Aptitude`, q: `There is 80% increase in an amount in 8 years at simple interest. What will be the compound
interest on Rs. 15,000 after 3 years at the same rate of interest?`, qi: ``, o: [`Rs. 4,565`, `Rs. 5,000`, `Rs. 4,550`, `Rs. 4,695`, `Rs. 4,965`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 54, s: `Quantitative Aptitude`, q: `In a class, there are certain numbers of students. Their average age is 12 years. If two students
leave the class, their ages are 23 years and 25 years respectively. Then the average age of the class
becomes 11 years. Find the number of students in the class.`, qi: ``, o: [`25`, `28`, `30`, `26`, `35`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 55, s: `Quantitative Aptitude`, q: `A school has 45% girls. If 80% of girls score more than 75% marks and 70% of the boys have
score more than 75% marks. If a student is selected at random and is found to have more than 75%
marks, find the probability of it being a boy.`, qi: ``, o: [`77/149`, `75/149`, `Cannot be determined`, `11/20`, `9/20`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 56, s: `Quantitative Aptitude`, q: `What should come in place of the question mark '?' in the following number series?
46, ?, 284, 345, 378, 391`, qi: ``, o: [`187`, `180`, `190`, `175`, `192`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 57, s: `Quantitative Aptitude`, q: `What should come in place of the question mark '?' in the following number series?
9, 19, 40, 83, ?, 345, 696`, qi: ``, o: [`162`, `170`, `175`, `166`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 58, s: `Quantitative Aptitude`, q: `What should come in place of question mark ‘?’ in the following number series?
17, 35, 106, ?, 2126`, qi: ``, o: [`378`, `590`, `312`, `425`, `531`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 59, s: `Quantitative Aptitude`, q: `What will come in place of question mark (?) in the following number series?
7, 13, ?, 49, 97, 193`, qi: ``, o: [`27`, `23`, `25`, `29`, `34`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 60, s: `Quantitative Aptitude`, q: `What will come in place of question mark (?) in the following number series?
17, 52, 158, 477, ?, 4310`, qi: ``, o: [`1433`, `1432`, `1435`, `1434`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 61, s: `Quantitative Aptitude`, q: `A alone can complete a work in 25 days and B alone can do the same work in 20 days. A started
the work and after working 7 days B joined A to finish the remaining work. In how many days, the
total work will be finished?`, qi: ``, o: [`8 days`, `15 days`, `9 days`, `12 days`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 62, s: `Quantitative Aptitude`, q: `A shopkeeper purchased two types of wheat costing Rs. 220 per kg and Rs. 300 per kg. In what
ratio should he mix the wheat so that he could sell the mixture at the rate of Rs. 360 per kg in order
to earn the profit of 25%?`, qi: ``, o: [`4 : 15`, `2 : 17`, `4 : 17`, `3 : 16`, `3 : 17`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 63, s: `Quantitative Aptitude`, q: `The speed of train A and train B is 93 km/hr and 51 km/hr, respectively. When both the trains are
running in the opposite direction, they cross each other in 18 seconds. The length of train B is half
of the length of train A. If train A crosses a bridge in 42 seconds, then find the length of the bridge.`, qi: ``, o: [`610 m`, `480 m`, `605 m`, `240 m`, `485 m`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 64, s: `Quantitative Aptitude`, q: `R, S and T started a business by investing Rs. 25000, Rs. 15000 and Rs.30000 respectively. If the
total profit earned is Rs. 58800 and it is decided that one-third of the profit will be divided into
their investment ratio and rest of the amount will be invested in another work, then what is the share of T?`, qi: ``, o: [`4200`, `8000`, `7400`, `8400`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 65, s: `Quantitative Aptitude`, q: `A shopkeeper wants to make a profit of 20% on an article after selling it, while he gives a cash
discount of 20%. Further allows 4 more articles for free after purchase of one dozen articles to his
premium customer. How much per cent above the cost price he must mark his article?`, qi: ``, o: [`85%`, `90%`, `110%`, `80%`, `100%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 66, s: `Reasoning Ability`, q: `Direction: Study the information given below carefully and answer the questions that follow.
There are 10 members in the family who are sitting at some distance from each other in a park. N is
4 m in the west of M, who is 5 m in the north of O. Q is 12 m in the west of R. T is 3 m in the west of S,
which is 12 m in the south of R. O is 6 m in the east of V, which is 2 m in the north of P, which is 8 m in the
west of U. T is 1 m in the south of U.
In which direction is U with respect to M?`, qi: ``, o: [`North`, `East`, `South-East`, `North-West`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 67, s: `Reasoning Ability`, q: `What is the shortest distance between N and Q?`, qi: ``, o: [`6 m`, `3 m`, `7 m`, `8 m`, `5 m`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 68, s: `Reasoning Ability`, q: `Suppose an imaginary line is drawn from N to line VO such that it makes a perpendicular. The
imaginary line meets VO at point Y. Then what is the perimeter of the quadrilateral NYOM?`, qi: ``, o: [`14 m`, `18 m`, `20 m`, `24 m`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 69, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions given below:
A certain number of persons are sitting in a linear row facing the north. Three persons are sitting
between X and T, who is sitting adjacent to Q. X is on the left of Q. H is sitting 2nd to the right of Q. Two
persons are sitting between H and S who is sitting at one of the ends. S is not sitting adjacent to Q, who is
sitting 2nd to the right of L. L is sitting exactly in the middle of the row. J is sitting 6th from the left end. X is
not sitting to the right of J. Two persons are sitting between J and R. Two persons are sitting between X and
K.
How many persons are sitting between X and S?`, qi: ``, o: [`Four`, `Nine`, `Eleven`, `One`, `None of These`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 70, s: `Reasoning Ability`, q: `How many persons are sitting in the row?`, qi: ``, o: [`18`, `10`, `17`, `15`, `Cannot Be Determined`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 71, s: `Reasoning Ability`, q: `How many persons are sitting to the left of Q?`, qi: ``, o: [`Nine`, `Three`, `Ten`, `Five`, `None of These`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 72, s: `Reasoning Ability`, q: `What is the position of H with respect to T?`, qi: ``, o: [`5th to the Left`, `3rd to the Right`, `5th to the Right`, `2nd to the left`, `None of These`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 73, s: `Reasoning Ability`, q: `Who sits exactly in the middle of K and L?`, qi: ``, o: [`R`, `J`, `X`, `T`, `None of These`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 74, s: `Reasoning Ability`, q: `Directions:- Relationship between different elements is shown in the statements below. These
Statements are followed by 2 Conclusions. Mark your answer on the basis of given statements and
conclusions.
Statements: A < B ≤ C > D; C > E ≥ F; E > B
Conclusions:
i) A < F
ii) D < B`, qi: ``, o: [`Only conclusion i) follows`, `Only conclusion ii) follows`, `Either conclusion i) or conclusion ii) follows`, `Both conclusions follow`, `None Follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 75, s: `Reasoning Ability`, q: `Directions: In the following question assuming the given statements to be true, find which of the
conclusion(s) among given conclusions is/are definitely true and then give your answers
accordingly.
Statement: B > C = D ; E < F ; B ≤ A; D ≤ E
Conclusions:
I. A > C
II. B = D`, qi: ``, o: [`Only conclusion I follows`, `Only conclusion II follows`, `Either conclusion I or II follows`, `Both conclusion I and III follows`, `None follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 76, s: `Reasoning Ability`, q: `Directions: In the following question assuming the given statements to be true, find which
conclusion among the given conclusions is/are definitely true and then give your answers
accordingly.
Statement:
R ≥ T = Q < M; S ≥ R
Conclusions:
I. M < R
II. S ≥ Q`, qi: ``, o: [`Only I is True`, `Only II is True`, `Either I or II is true`, `Both conclusions I and II are True`, `None is True`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 77, s: `Reasoning Ability`, q: `DIRECTIONS: In the following question assuming the given statements to be true, find which of
the conclusion among given conclusions is / are definitely true and then give your answers
accordingly.
Statement: M > N < O ≤ P; S ≥ R > Q = P
Conclusion:
I. S ≥ M
II. S < M`, qi: ``, o: [`Only I is true`, `Only II is true`, `Either I or II is true`, `Neither I nor II is true`, `Both I and II are true`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 78, s: `Reasoning Ability`, q: `Direction: In the following question assuming the given statement to be true. Find which of the
following conclusion(s) among given conclusions is/are definitely true then give your answer
accordingly.
Statement: A > B, D ≤ E, D ≥ C ≤ B
Conclusion:
I. C < A
II. E ≥ C`, qi: ``, o: [`Only I is true`, `Only II is true`, `Both I and II are true`, `None is true`, `Either I or II is true`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 79, s: `Reasoning Ability`, q: `Direction: Study the following information carefully and answer the given questions.
Six persons P, Q, R, S, T, and U are living in a three-storey building such that ground floor is numbered as 1,
above it is floor 2 then top floor is numbered as 3. Each of the floor has 2 flats in it as flat-X and flat-Y. Flat-
X of floor-2 is immediately above flat-X of floor-1 and immediately below flat-X of floor-3. In the same way
flat-Y of floor-2 is immediately above flat-Y of floor-1 and immediately below flat-Y of floor-3. Flat-X is in
west of flat-Y. They all are from different cities.
The one who is from Kolkata lives immediately above U. S lives to the west of U. P and the one who is from
Kolkata do not live on the same floor. Neither S nor Q is from Bangalore. U is either from Pune or from
Agra. There is one floor between Q and the one who is from Delhi who lives above Q. T does not live in flat
Y. The one who is from Mumbai lives on the same floor on which the one who is from Agra lives. P lives on
an odd numbered floor in flat X.
Which of the following does not belong to the group?`, qi: ``, o: [`T`, `P`, `R`, `S`, `Q`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 80, s: `Reasoning Ability`, q: `Who among the following lives to the east of T?`, qi: ``, o: [`The one who is from Agra`, `U`, `R`, `The one who is from Pune`, `No one`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 81, s: `Reasoning Ability`, q: `Who lives on the bottom most floor?`, qi: ``, o: [`The one who is from Pune`, `U`, `P`, `S`, `Both 1 and 3`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 82, s: `Reasoning Ability`, q: `Which of the following combination is the correct?`, qi: ``, o: [`T - Mumbai`, `Q - Delhi`, `Q - Banglore`, `S - Mumbai`, `R - Agra`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 83, s: `Reasoning Ability`, q: `Who among the following lives in Flat Y?`, qi: ``, o: [`P`, `T`, `S`, `Q`, `The one who lives in Delhi`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 84, s: `Reasoning Ability`, q: `If 2 is added to each even digit and 1 is subtracted from each odd digit in the number 621754, then
what will be the sum of number/numbers not repeated in the new number?`, qi: ``, o: [`5`, `8`, `6`, `4`, `10`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 85, s: `Reasoning Ability`, q: `In the word ‘LAVISLY’, replace each vowel with the next letter in the alphabetical series and each
consonant with the previous letter in the Alphabetical Series. How many letters occur more than
once in this newly formed word?`, qi: ``, o: [`One`, `Two`, `Three`, `Four`, `Zero`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 86, s: `Reasoning Ability`, q: `Direction: Study the following information carefully and answer the given questions.
Fourteen people are sitting in 2 rows, 7 in each. P, Q, R, S, T, U, and V in row 1 facing south
and A, B, C, D, E, F, and G in row 2 facing north but not necessarily in the same order. People in both rows
face each other.
U is sitting third from on of the extreme ends. Two persons are sitting between the one facing U and D. Three
persons are sitting between the immediate neighbor of the one who is facing D and S. E is facing the
immediate neighbor of S. A is sitting to the immediate right of E. P and Q does not sit at any of the ends. Two
persons are sitting between the one who is facing the immediate neighbor of P and A. At least three persons
are sitting between the one facing A and Q. B is facing the one who is sitting second to the left of Q. R is
neither facing E nor B. C is sitting fourth to the left of G. V is sitting to second to the right of T.
How many people are sitting between S and P?`, qi: ``, o: [`One`, `Two`, `Three`, `Four`, `No one`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 87, s: `Reasoning Ability`, q: `Who is facing Q?`, qi: ``, o: [`A`, `B`, `D`, `F`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 88, s: `Reasoning Ability`, q: `____ is sitting second to the right of U.`, qi: ``, o: [`T`, `S`, `Q`, `P`, `V`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 89, s: `Reasoning Ability`, q: `Which of the following person does not sit at any of the ends.`, qi: ``, o: [`R`, `S`, `A`, `C`, `Q`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 90, s: `Reasoning Ability`, q: `Which of the following statement is true regarding B?`, qi: ``, o: [`B sits at the end of the row.`, `B is an immediate neighbour of F.`, `Two persons sit between B and G.`, `B does not faces V`, `None of the statement is true.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 91, s: `Reasoning Ability`, q: `Direction: In the question below are given three statements followed by three conclusions I, II, and
III. You have to take the given statements to be true even if they seem to be at variance from
commonly known facts, Read all the given conclusions and then decide which of the following conclusions
logically follows from the given statements disregarding commonly known facts.
Statements:
Some Glass are Cup.
Only a few Cup are Plate.
Only Plate is Bottle.
Conclusions:
I. All Glass are Plate.
II. Some Cup are not Bottles.
III. Some Cup are not Plates.`, qi: ``, o: [`Only Conclusion I follows`, `Only Conclusion II follows`, `Only Conclusion III follows`, `Both Conclusion I and II follows`, `Both Conclusion II and III follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 92, s: `Reasoning Ability`, q: `Direction: In the question below, there are three statements followed by two conclusions numbered
I and II. You have to take the given statements to be true even if they seem to be at variance with
commonly known facts. Read all the conclusions and then decide which of the given conclusions logically
follows from the given statements disregarding the commonly known facts.
Statements:
Each plant is grass.
No green is tree.
Every grass are green.
Conclusions:
I. No grass is tree.
II. Some green are plant.`, qi: ``, o: [`Only conclusion I follows`, `Only conclusion II follows`, `Both I and II follow`, `Neither I nor II follows`, `Either I or II follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 93, s: `Reasoning Ability`, q: `Directions: In the following questions three statements are given below followed by two
conclusions numbered I and II. You have to take the given statements to be true even if they seem
to be at variance from commonly known facts. Read both the conclusions and decide which of the given
conclusions logically follows from the given statements.
Statements:
I. Only a few leaves are petals.
II. Only leaves are flowers.
III. None of the petals are stems.
Conclusions:
I. Some flowers are stems.
II. No petal is flowers.`, qi: ``, o: [`Only conclusion I is true`, `Only conclusion II is true`, `Both conclusions I and II are true`, `Either conclusion I or II is true`, `Neither of the conclusions is true`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 94, s: `Reasoning Ability`, q: `Directions: In the following question below some statements are given followed by some
conclusions. Taking the given statements to be true even if they seem to be at variance from
commonly known facts, read all the conclusions and then decide which of the given conclusions logically
follows the given statements.
Statement:
Some finger are nails.
Only a few nails are toe.
Only toe is poly.
Conclusion:
I. Some nail is poly.
II. Some finger is toe.`, qi: ``, o: [`Only conclusion I follows`, `Either conclusion I or II follows`, `Only conclusion II follows`, `Both conclusions I and II follow`, `Neither conclusion I nor II follow`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 95, s: `Reasoning Ability`, q: `Directions: In the question below are given three statements followed by three conclusions I, II
and III. You have to take the given statements to be true even if they seem to be at variance from
commonly known facts. Read all the conclusions and then decide which of the given conclusions logically
follows from the given statements disregarding commonly known facts.
Statements:
All black are green.
Only a few greens are good.
Some good are bad.
Conclusions:
I. No black is good.
II. No green is bad.
III. Some black are good.`, qi: ``, o: [`Only I follows`, `Either I or III follows`, `Only II follows`, `Both I and II follow`, `None follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 96, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the given questions:
There are nine people A, B, C, D, E, F, G, H and I who all live in different cities such as Mumbai,
Kolkata, and Jaipur but not necessarily in the same order. Not more than three people live in the
same city and at least two people live in the same city. A neither live in Mumbai nor in Kolkata. D and G are
friends but live in different cities but none of them lives in Jaipur. Either H or F lives in Kolkata. B and G
live in the same city but it's not Mumbai. I, E and D are friends and the two of them live in the same
city. E and H live in the same city but not Mumbai.
Which of the following group will live in Kolkata?`, qi: ``, o: [`A, B, E`, `F, C, H`, `A, D, G`, `C, D, I`, `B, G, F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 97, s: `Reasoning Ability`, q: `Which of the following is true?`, qi: ``, o: [`A lives in Jaipur.`, `B lives in Mumbai.`, `C lives in Kolkata`, `I lives in Kolkata`, `D lives in Jaipur`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 98, s: `Reasoning Ability`, q: `C lives in Mumbai along with?`, qi: ``, o: [`A`, `I`, `E`, `H`, `B`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 99, s: `Reasoning Ability`, q: `Which of the following combination is correct?`, qi: ``, o: [`D - Jaipur`, `G - Jaipur`, `F - Kolkata`, `H - Mumbai`, `B - Mumbai`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 100, s: `Reasoning Ability`, q: `Find the odd one out?`, qi: ``, o: [`A - I`, `C - D`, `B - A`, `C - G`, `I - G`], oi: [``, ``, ``, ``, ``], e: `` }
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
      tags: ['IBPS', 'PO', 'Prelims', 'PYQ', '2021', '04 December 2021 Shift-1'],
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

  const TEST_TITLE = `IBPS PO Prelims - 04 December 2021 Shift-1`;
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2021, pyqShift: `04 December 2021 Shift-1`,
    pyqExamName: 'IBPS PO Prelims', questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
