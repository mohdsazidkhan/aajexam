/**
 * Seed: IBPS PO Prelims - 14 October 2018
 * IBPS PO Prelims — Probationary Officer Preliminary Exam.
 * 100 Q × 1 mark, 3 sections (Eng 30 / Reas 35 / Quant 35), 60 min total,
 * sectional timing 20 min each, 0.25 negative marking.
 * Uploads question/option images from local _extracted_ibps_po_14oct2018/ to Cloudinary.
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

const EXTRACTED_DIR = path.resolve(__dirname, '../_extracted_ibps_po_14oct2018');
const CLOUDINARY_FOLDER = 'aajexam/pyq/ibps-po-prelims-14oct2018';
const F = '14oct2018';

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

const KEY = [4, 2, 1, 2, 1, 3, 5, 2, 4, 5, 4, 5, 5, 2, 3, 2, 5, 2, 2, 2, 3, 3, 3, 2, 2, 3, 1, 2, 1, 3, 3, 2, 2, 5, 1, 2, 1, 4, 3, 3, 2, 1, 2, 4, 5, 1, 1, 1, 3, 2, 1, 2, 1, 1, 5, 1, 2, 1, 5, 1, 4, 5, 2, 4, 4, 5, 1, 5, 4, 5, 5, 1, 3, 4, 5, 4, 3, 1, 5, 1, 1, 5, 3, 4, 3, 5, 3, 3, 3, 1, 3, 3, 3, 5, 5, 4, 4, 3, 1, 2];
const RAW = [
  { n: 1, s: `English Language`, q: `Read the passage given below and then answer the questions given below the passage. Some words may be highlighted for your attention.
On the day the rupee breached the 74-mark against the US dollar for the first time, RBI governor Urjit Patel on Friday reiterated that the domestic currency is still better than its emerging market peers and that the apex bank does not have a target for it.
After the Reserve Bank of India (RBI) in its fourth bi-monthly policy, this fiscal left the policy rates unchanged and ruled out a rate cut in the rest of the fiscal, the rupee plummeted to 74.13 against the dollar, after opening higher than its previous close at 73.52. Admitting that the country has not been immune to global spillovers from external factors, Patel said, “The rupee fall, in some respect, is moderate in comparison to several other emerging market peers.”
Ruling out a target for the currency, he said, “Our response to these unsettled conditions has been to ensure that the foreign exchange market remains liquid with no undue volatility. There is no target or band around any particular level of exchange rate, which is determined by market forces demand and supply.” Addressing the media after the customary post-policy presser, Mr Patel said the rupee has experienced bouts of volatility since the monetary policy committee meeting in August.
By the end of September, the rupee has depreciated in nominal effective terms by 5.6 per cent since the end of March. In real effective term, the rupee fall has been at 5 per cent, the governor said, adding the foreign exchange reserves of $400.5 billion as of end September, are sufficient to finance 10 months of imports.
Which of the following sentences summarises the key idea of the passage?`, qi: ``, o: [`The rupee fall is sufficient to finance 10 months of imports`, `The rupee plummeted to 74.13 against the dollar`, `The rupee breached the 74-mark against the US dollar`, `Rupee at 74 to a dollar is still better than its peers`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 2, s: `English Language`, q: `Which of the following words is the most similar in meaning to the word ‘monetary’ as given in the passage?`, qi: ``, o: [`Reserve`, `Pecuniary`, `Intervention`, `Antidote`, `Chiropractor`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 3, s: `English Language`, q: `Which of the following words is the most opposite in meaning to the word ‘immune’ as given in the passage?`, qi: ``, o: [`Susceptible`, `Resistant`, `Variation`, `Quantified`, `Exempt`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 4, s: `English Language`, q: `Which of the following stands TRUE as per the reading of the given passage?`, qi: ``, o: [`By the end of March, the rupee has depreciated in nominal effective terms by 5.6 per cent since the end of September.`, `The Reserve Bank of India (RBI) left the policy rates unchanged and ruled out a rate cut in the rest of the fiscal.`, `The domestic currency is still not better than its emerging market peers.`, `There is a target around any particular level of exchange rate, which is determined by market forces demand and supply.`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 5, s: `English Language`, q: `Why did Mr Patel give a response for these 'unsettled conditions'?`, qi: ``, o: [`To ensure that the foreign exchange market remains liquid with no undue volatility`, `To ensure that there is target around any particular level of exchange rate`, `To ensure that the foreign exchange market remains liquid with due volatility`, `Both 2 and 3`, `All 1, 2 and 3`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 6, s: `English Language`, q: `Which of the following stands FALSE as per the reading of the given passage?`, qi: ``, o: [`Mr Patel said the rupee has experienced bouts of volatility since the monetary policy committee meeting in August.`, `India has not been immune to global spillovers from external factors.`, `The rupee fall is extreme in comparison to several other emerging market peers.`, `The rupee plummeted to 74.13 against the dollar after opening higher than its previous close at 73.52.`, `All of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 7, s: `English Language`, q: `Which of the following can be inferred from the passage?`, qi: ``, o: [`The foreign exchange reserves, as of end September, are sufficient to finance 10 months of imports.`, `There is no target for the currency in India.`, `The rupee has experienced a lot of rapid changes since the monetary policy committee meeting in August.`, `Both 2 and 3`, `1, 2 and 3`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 8, s: `English Language`, q: `In the following question, a word has been given. Choose the sentence(s) in which it is used correctly and if all the sentences are correct then choose Option 5.
Crucial
I bought a large silver crucial on a chain.
Vitamins are crucial for maintaining good health.
Hiring was a crucial matter for them, so they did not pay much heed to it.`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `Both A and C`, `All correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 9, s: `English Language`, q: `Que. 9In the following question, a word has been given. Choose the sentence(s) in which it is used correctly and if all the sentences are correct then choose Option 5.
Que. 9
Que. 9
Colloquial
Since I am from a different country, I have a difficult time understanding the colloquial language in this country.
Because a job interview is such a serious event, one should not speak to the interviewer in a colloquial tone.
Both the parties had colloquial relations.`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `Both A and B`, `All correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 10, s: `English Language`, q: `In the following question, a word has been given. Choose the sentence(s) in which it is used correctly and if all the sentences are correct then choose Option 5.
Transparent
The houses of the city were all made of glass, so clear and transparent that one could look through the walls as easily as through a window.
Other nations are becoming more transparent as well.
He stood on the balcony, visible beyond the transparent curtains rustling in the moving haze.`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `Both A and C`, `All correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 11, s: `English Language`, q: `In the following question, a word has been given. Choose the sentence(s) in which it is used correctly and if all the sentences are correct then choose Option 5.
Prudent
A prudent money manager would authorise a loan without knowing its purpose.
Isn't seeking medical or scientific help a prudent course to take?
Even though my aunt thinks it is hard to quit smoking, she knows it is a prudent decision to stop the bad habit.`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `Both B and C`, `All are correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 12, s: `English Language`, q: `In the following question, a word has been given. Choose the sentence(s) in which it is used correctly and if all the sentences are correct then choose Option 5.
Benign
The medicine is benign in its effects and will cause you no harm.
Even though the company claims the energy drink is benign, you may experience some unwanted side effects after drinking the beverage.
The eco-friendly company will only drill for oil in areas where its practices are benign.`, qi: ``, o: [`Only A`, `Only B`, `Only C`, `Both B and C`, `All correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 13, s: `English Language`, q: `In the following question, 2 columns are given containing three phrases/ sentence each. In the first column sentences A, B, C and in the second column D, E, F are given. A sentence from
the first column may or may not connect with another sentence/ phrase from the second column to
make a grammatically and contextually correct sentence. Each question has five options, four of which display the sequences of the sentences. If none of the above is the answer, then mark option (e) as the
answer.
Column 1
Column 2
A. A majority of the people supported the cause
D. there have been countless murders
B. Though it sounds simple it may appear
E. elephants trampling the rice fields
C. The government will provide for
the organisation
F. public consent is necessary for a democracy`, qi: ``, o: [`A-E`, `B-D`, `C-E`, `A-F`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 14, s: `English Language`, q: `In the following question, 2 columns are given containing three phrases/ sentence each. In the first column sentences A, B, C and in the second column D, E, F are given. A sentence from
the first column may or may not connect with another sentence/ phrase from the second column to
make a grammatically and contextually correct sentence. Each question has five options, four of which display the sequences of the sentences. If none of the above is the answer, then mark option (e) as the
answer.
Column 1
Column 2
A. The coming wave of space tourism
D. is teamed up with the designers
B. NASA is set to launch a satellite equipped with
E. the most advanced laser instrument of its kind
C. The target audience is not astronauts
F. for an essential purpose`, qi: ``, o: [`A-E`, `B-E`, `C-D`, `B-F`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 15, s: `English Language`, q: `In the following question, 2 columns are given containing three phrases/ sentence each. In the first column sentences A, B, C and in the second column D, E, F are given. A sentence from
the first column may or may not connect with another sentence/ phrase from the second column to
make a grammatically and contextually correct sentence. Each question has five options, four of which display the sequences of the sentences. If none of the above is the answer, then mark option (e) as the
answer.
Column 1
Column 2
A. The President of the U.S believes in
D. the administration is ruining the city of Ujjain
B. The Paris Climate Change Agreement has been cancelled
E. a protectionist policy for the country
C. Recently the U.S and China have been engaged in
F. exports from Germany declined in this year`, qi: ``, o: [`A-D`, `B-D`, `A-E`, `C-F`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 16, s: `English Language`, q: `In the following question, 2 columns are given containing three phrases/ sentence each. In the first column sentences A, B, C and in the second column D, E, F are given. A sentence from
the first column may or may not connect with another sentence/ phrase from the second column to
make a grammatically and contextually correct sentence. Each question has five options, four of which display the sequences of the sentences. If none of the above is the answer, then mark option (e) as the
answer.
Column 1
Column 2
A. Although he has been living in London for a decade
D. has been one of the causes of the dangerous flood that ruined the state
B. The RBI has claimed to be the guarantor of
E. the school will reopen after the festival of Durga Puja
C. The poor infrastructure of the dams in Kerala
F. he still respects his culture`, qi: ``, o: [`A-D`, `A-F and C-D`, `B-D and C-E`, `A-E`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 17, s: `English Language`, q: `In the following question, 2 columns are given containing three phrases/ sentence each. In the first column sentences A, B, C and in the second column D, E, F are given. A sentence from
the first column may or may not connect with another sentence/ phrase from the second column to
make a grammatically and contextually correct sentence. Each question has five options, four of which display the sequences of the sentences. If none of the above is the answer, then mark option (e) as the
answer.
Column 1
Column 2
A. Informal housing areas without running water have mushroomed
D. has collapsed after years of neglect
B. The government has announced a complete ban on
E. inflation rises to around 4 per cent
C. The rising prices of regular commodities
F. authorities have neglected the plight of the people`, qi: ``, o: [`A-D`, `A-E`, `B-D`, `C-F`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 18, s: `English Language`, q: `In the following sentence, some parts of the sentence have been printed in bold. One of the bold parts is not acceptable in Standard English. Pick up that part and mark its number. If
there is no error in the bold parts, mark (5) i.e. 'no error' as the answer.
Sachin Tendulkar is one of the most greatest cricketers to have ever played the game.`, qi: ``, o: [`One`, `Most`, `Have`, `Game`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 19, s: `English Language`, q: `In the following sentence, some parts of the sentence have been printed in bold. One of the bold parts is not acceptable in Standard English. Pick up that part and mark its number. If
there is no error in the bold parts, mark (5) i.e. 'no error' as the answer.
The Prime Minister has declaring 2018 as the International year for social innovation.`, qi: ``, o: [`Minister`, `Declaring`, `International`, `Innovation`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 20, s: `English Language`, q: `In the following sentence, some parts of the sentence have been printed in bold. One of the bold parts is not acceptable in Standard English. Pick up that part and mark its number. If
there is no error in the bold parts, mark (5) i.e. 'no error' as the answer.
Netflix has decided to invest a substantiated portion of its budget in producing new shows for the Indian audience.`, qi: ``, o: [`Decided`, `Substantiated`, `Producing`, `Audience`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 21, s: `English Language`, q: `In the following sentence, some parts of the sentence have been printed in bold. One of the bold parts is not acceptable in Standard English. Pick up that part and mark its number. If
there is no error in the bold parts, mark (5) i.e. 'no error' as the answer.
The East India Company is considered to be the first multi-nationel corporation in the world.`, qi: ``, o: [`Company`, `Be`, `Multi-nationel`, `World`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 22, s: `English Language`, q: `In the following sentence, some parts of the sentence have been printed in bold. One of the bold parts is not acceptable in Standard English. Pick up that part and mark its number. If
there is no error in the bold parts, mark (5) i.e. 'no error' as the answer.
In the absence of a permanent refugee policy, India has often facing problems in dealing with migrants.`, qi: ``, o: [`Absence`, `Refugee`, `Facing`, `Dealing`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 23, s: `English Language`, q: `In the following sentence, some parts of the sentence have been printed in bold. One of the bold parts is not acceptable in Standard English. Pick up that part and mark its number. If
there is no error in the bold parts, mark (5) i.e. 'no error' as the answer.
The global markets have seen a sharpen rise in the price of crude oil.`, qi: ``, o: [`Global`, `Have`, `Sharpen`, `Price`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 24, s: `English Language`, q: `In the following sentence, some parts of the sentence have been printed in bold. One of the bold parts is not acceptable in Standard English. Pick up that part and mark its number. If
there is no error in the bold parts, mark (5) i.e. 'no error' as the answer.
The Mona Lisa is one of the most famous painting to have ever been painted.`, qi: ``, o: [`Most`, `Painting`, `Have`, `Painted`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 25, s: `English Language`, q: `In the following sentence, some parts of the sentence have been printed in bold. One of the bold parts is not acceptable in Standard English. Pick up that part and mark its number. If
there is no error in the bold parts, mark (5) i.e. 'no error' as the answer.
The Finance minister has declare the government to be in a state of perpetual fiscal deficit.`, qi: ``, o: [`Minister`, `Declare`, `State`, `Perpetual`, `No error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 26, s: `English Language`, q: `Que. 26In the given question, a sentence has been divided into five parts. The question is followed by five options which give possible sequences of the rearranged parts. You must choose the
Que. 26
Que. 26
option which gives the correct sequence. If the sentence is already arranged correctly, or if none of the given options forms the correct sequence, mark option 5, i.e. ‘None of the above’.
A: form but also how
B: through temple studies C: Students not only
D: the art evolved E: learn the dance`, qi: ``, o: [`CDEAB`, `BCDEA`, `CEADB`, `ABCDE`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 27, s: `English Language`, q: `In the given question, a sentence has been divided into five parts. The question is followed by five options which give possible sequences of the rearranged parts. You must choose the
option which gives the correct sequence. If the sentence is already arranged correctly, or if none of the given options forms the correct sequence, mark option 5, i.e. ‘None of the above’.
A: nature walks, ethnographic field visits B: world around them
C: students to the D: trips sensitise the
E: and active social work`, qi: ``, o: [`AEDCB`, `BDCAE`, `ABCDE`, `AECDB`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 28, s: `English Language`, q: `In the given question, a sentence has been divided into five parts. The question is followed by five options which give possible sequences of the rearranged parts. You must choose the
option which gives the correct sequence. If the sentence is already arranged correctly, or if none of the given options forms the correct sequence, mark option 5, i.e. ‘None of the above’.
A: increases for someone who
B: much sugar alone won't give you diabetes C: the risk of diabetes
D: with diabetes, so eating too
E: has an immediate family member`, qi: ``, o: [`CAEBD`, `CAEDB`, `ACEBD`, `ABCED`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 29, s: `English Language`, q: `Que. 29
Que. 29
Que. 29
In the given question, a sentence has been divided into five parts. The question is followed by five options which give possible sequences of the rearranged parts. You must choose the option which gives the correct sequence. If the sentence is already arranged correctly, or if none of the given options forms the correct sequence, mark option 5, i.e. ‘None of the above’.
A: them the time of day
B: the 'everyguy' or girl is pining away C: with a crush on the popular kid
D: who initially doesn't give
E: the story usually proceeds as`, qi: ``, o: [`EBCDA`, `EBACD`, `BCDEA`, `ABCDE`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 30, s: `English Language`, q: `In the given question, a sentence has been divided into five parts. The question is followed by five options which give possible sequences of the rearranged parts. You must choose the
option which gives the correct sequence. If the sentence is already arranged correctly, or if none of the given options forms the correct sequence, mark option 5, i.e. ‘None of the above’.
A: the Indian newsroom B: and equal for women C: or it will lose
D: must be made safe E: all credibility`, qi: ``, o: [`ADBEC`, `BCDEA`, `ADBCE`, `ACBDE`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 31, s: `Quantitative Aptitude`, q: `What should come in place of question mark ‘?’ in the following number series?
89, 70, 87, 74, 85, ?`, qi: ``, o: [`88`, `83`, `78`, `76`, `70`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 32, s: `Quantitative Aptitude`, q: `What should come in place of the question mark ‘?’ in the following number series?
730, ?, 82, 28, 10, 4`, qi: ``, o: [`246`, `244`, `242`, `240`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 33, s: `Quantitative Aptitude`, q: `What should come in place of the question mark ‘?’ in the following number series?
23, 28, 38, 53, 73, ?`, qi: ``, o: [`92`, `98`, `96`, `100`, `93`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 34, s: `Quantitative Aptitude`, q: `What should come in place of question mark ‘?’ in the following number series?
500, 435, 385, 348, ?, 305`, qi: ``, o: [`331`, `333`, `335`, `337`, `None of these.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 35, s: `Quantitative Aptitude`, q: `What should come in place of question mark ‘?’ in the following number series?
2.5, 7.5, 26, 75, 148, ?`, qi: ``, o: [`147`, `152`, `157`, `159`, `None of these.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 36, s: `Quantitative Aptitude`, q: `Consider the following pie-charts and answer the following questions:-

The number of candidates selected, if the percentage of candidates selected from Centre B is 10% of the candidates appeared (weekends + weekdays)`, qi: `image1.png`, o: [`70`, `80`, `90`, `40`, `50`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 37, s: `Quantitative Aptitude`, q: `What is the ratio of candidates appeared at Centre D on (weekends + weekdays) to the candidates appeared at Centre B on weekends.`, qi: `image1.png`, o: [`48 : 35`, `75 : 44`, `177 : 142`, `142 : 177`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 38, s: `Quantitative Aptitude`, q: `Candidates appeared at Centre A and B together on weekends is approximately what percentage of B and E together on (weekends + weekdays)`, qi: `image1.png`, o: [`83%`, `75%`, `105%`, `58%`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 39, s: `Quantitative Aptitude`, q: `What are the average candidates appeared on weekends at centers A and B and D.`, qi: `image1.png`, o: [`756`, `804`, `425`, `870`, `650`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 40, s: `Quantitative Aptitude`, q: `Candidates appeared at Centre C on weekends is how much percentage less than candidates at Centre B on (weekends + weekdays)(Approximate value)`, qi: `image1.png`, o: [`80%`, `75%`, `81%`, `57%`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 41, s: `Quantitative Aptitude`, q: `Directions: In the following question, two equations are given. You have to solve both the equations and find the relation between ‘x’ and ‘y’ and mark the correct answer.
y2 – 18y + 65 = 0
x2 – 26x + 169 = 0`, qi: ``, o: [`if x > y`, `if x ≥ y`, `if x < y`, `if x ≤ y`, `if x = y or the relationship cannot be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 42, s: `Quantitative Aptitude`, q: `Directions: In the following questions two equations numbered I and II are given. You have to solve both the equations and Give answer:
x2 – 11x + 24 = 0
y2 + 4y – 12 = 0`, qi: ``, o: [`If x > y`, `If x ≥ y`, `If x < y`, `If x ≤ y`, `If x = y or the relationship cannot be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 43, s: `Quantitative Aptitude`, q: `Directions: In the following questions two equations numbered I and II are given. You have to solve both the equations and Give answer:
x2 + 2x = 0
y + 4 +
4 = 0
y`, qi: ``, o: [`If x > y`, `If x ≥ y`, `If x < y`, `If x ≤ y`, `If x = y or the relationship cannot be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 44, s: `Quantitative Aptitude`, q: `Directions: In the following questions two equations numbered I and II are given. You have to solve both the equations and Give answer:
3y + 18 = 50 – 5y
x2 = 16`, qi: ``, o: [`If x > y`, `If x ≥ y`, `If x < y`, `If x ≤ y`, `If x = y or the relationship cannot be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 45, s: `Quantitative Aptitude`, q: `Directions: In the following questions two equations numbered I and II are given. You have to solve both the equations and Give answer:
x2 + 2x – 3 = 0
y2 + 6y + 8 = 0`, qi: ``, o: [`If x > y`, `If x ≥ y`, `If x < y`, `If x ≤ y`, `If x = y or the relationship cannot be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 46, s: `Quantitative Aptitude`, q: `Directions: Consider the following graph. Bar graph shows the total population of 4 villages A, B, C, D and the table shows the ratio of men and women in these villages.
Ratio of men and women in villages.
Men
Women
A
14
9
B
16
13
C
9
5
D
25
22
Which village has the lowest number of men?`, qi: `image3.png`, o: [`A`, `B`, `C`, `D`, `can’t be determined`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 47, s: `Quantitative Aptitude`, q: `What is the ratio of males from village B and females from village C?`, qi: `image3.png`, o: [`8 ∶ 5`, `4 ∶ 5`, `5 ∶ 4`, `5 ∶ 8`, `8 ∶ 7`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 48, s: `Quantitative Aptitude`, q: `What is the ratio of total number of females from village C and village D to total population of village A and B?`, qi: `image3.png`, o: [`8 ∶ 13`, `4 ∶ 5`, `5 ∶ 4`, `5 ∶ 8`, `8 ∶ 7`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 49, s: `Quantitative Aptitude`, q: `Females from village B are what percentage of total number of females? (Approximate value)`, qi: `image3.png`, o: [`28%`, `38%`, `24%`, `34%`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 50, s: `Quantitative Aptitude`, q: `What is the ratio of total males to total females from all villages?`, qi: `image3.png`, o: [`54 ∶ 73`, `73 ∶ 54`, `71 ∶ 53`, `53 ∶ 71`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 51, s: `Quantitative Aptitude`, q: `Given below are two quantities named A & B. Based on the given information, you have to determine the relation between the two quantities. You should use the given data and your
knowledge of Mathematics to choose between the possible answers.
Quantity A: A boat goes 39 km downstream, 25 km upstream and takes 8 hours, while it takes 10 hours to go 52 km downstream and 30 km upstream. Find the speed of boat.
Quantity B: A boatman goes 6 km upstream and comes back in 2 hours. If the speed of stream is 4 km/hr, find the speed of boat.`, qi: ``, o: [`Quantity A > Quantity B`, `Quantity A < Quantity B`, `Quantity A ≥ Quantity B`, `Quantity A ≤ Quantity B`, `Quantity A = Quantity B or No relation.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 52, s: `Quantitative Aptitude`, q: `Que. 52Given below are two quantities named A and B. Based on the given information, you have to determine the relation between the two quantities. You should use the given data and your
Que. 52
Que. 52
knowledge of Mathematics to choose between the possible answer.
Quantity A: In a 40 L mixture of milk and water, the water is only 10% then find amount of water to be added to make water concentration 50%.
Quantity B: In a 100 L mixture of petrol and spirit, the spirit is only 2% then find amount of spirit to be added to make spirit concentration 30%.`, qi: ``, o: [`Quantity A > Quantity B`, `Quantity A < Quantity B`, `Quantity A ≥ Quantity B`, `Quantity A ≤ Quantity B`, `Quantity A = Quantity B`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 53, s: `Quantitative Aptitude`, q: `Given below are two quantities named A & B. Based on the given information, you have to determine the relation between the two quantities. You should use the given data and your
knowledge of Mathematics to choose between the possible answers.
Quantity A: A mixture contains milk and water in the ratio 3 ∶ 2. If 10 litres of the mixture is taken out and replaced with 10 litres water, the amount of water and milk becomes equal in the mixture.The initial quantity of milk in the mixture.
Quantity B: 35`, qi: ``, o: [`Quantity A > Quantity B`, `Quantity A < Quantity B`, `Quantity A ≥ Quantity B`, `Quantity A ≤ Quantity B`, `Quantity A = Quantity B or No relation.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 54, s: `Quantitative Aptitude`, q: `Given below are two quantities named A & B. Based on the given information, you have to determine the relation between the two quantities. You should use the given data and your
knowledge of Mathematics to choose between the possible answers.
A bucket has 4 Blue balloons, 6 Red balloons & 3 Green balloons. Five balloons are drawn from the bucket at random.
Quantity A: Find the probability that out of 5 balloons: 2 are Blue, 2 are Red and 1 is Green.
Quantity B: Find the probability that out of 5 balloons: 3 are Red, 1 is Blue and 1 is Green`, qi: ``, o: [`Quantity A > Quantity B`, `Quantity A < Quantity B`, `Quantity A ≥ Quantity B`, `Quantity A ≤ Quantity B`, `Quantity A = Quantity B or No relation.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 55, s: `Quantitative Aptitude`, q: `Given below are two quantities named A & B. Based on the given information, you have to determine the relation between the two quantities. You should use the given data and your
knowledge of Mathematics to choose between the possible answers.
Quantity A: Three persons P, Q and R working together can complete a piece of work in 30 days. P & R together can finish the work in half the time Q can finish it and P & Q together are thrice efficient than R. In how many days Q can finish the work alone?
Quantity B: Two persons A and B can finish a piece of work in 12 days. If A works thrice its efficiency and B works half of its efficiency then the work will be finished in 8 days. Find the time in which A will complete thrice the work alone.`, qi: ``, o: [`Quantity A > Quantity B`, `Quantity A < Quantity B`, `Quantity A ≥ Quantity B`, `Quantity A ≤ Quantity B`, `Quantity A = Quantity B or No relation.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 56, s: `Quantitative Aptitude`, q: `Directions∶ Following line graph represents the population in 6 different villages (M, N, O, P, Q and R) and the tabular column represents the ratio of literate to illiterate people and also represents
the percentage of the male population.

Village
Ratio of literate to illiterate
Percentage of male population
M
1 ∶ 1
30%
N
5 ∶ 4
40%
O
5 ∶ 7
40%
P
3 ∶ 5
50%
Q
2 ∶ 3
40%
R
3 ∶ 7
60%
The number of female from villages O & P is how much percentage more than number of female from villages Q & R?`, qi: `image4.png`, o: [`8.45%`, `8.35%`, `8.50%`, `8.65%`, `9%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 57, s: `Quantitative Aptitude`, q: `Find the average number of female population in all the villages together.`, qi: `image4.png`, o: [`1965.33`, `2296.67`, `1794.67`, `1850.67`, `1795.67`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 58, s: `Quantitative Aptitude`, q: `Find the male population in village O.`, qi: `image4.png`, o: [`1920`, `2000`, `1900`, `1820`, `2020`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 59, s: `Quantitative Aptitude`, q: `What is the respective ratio between total literate males from villages M, N and O and the total number of males from village P, Q and R.?`, qi: `image4.png`, o: [`31 ∶ 79`, `26 ∶ 79`, `75 ∶ 79`, `26 ∶ 75`, `Can't be determined`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 60, s: `Quantitative Aptitude`, q: `What is the average of literate people in all the six villages together?`, qi: `image4.png`, o: [`1700`, `2100`, `2400`, `2600`, `2200`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 61, s: `Quantitative Aptitude`, q: `A box contains red, green and blue colored balls. When one ball is drawn randomly from the box, the probability that it is either green or blue is 2/3. Also, the probability that the ball drawn
randomly from the box is either red or green is 3/5. When two balls are drawn one after another from the box, the probability that both balls are of green color is 1/15. Find the total number of balls in the box.`, qi: ``, o: [`15`, `20`, `30`, `45`, `60`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 62, s: `Quantitative Aptitude`, q: `Venu’s present age is five times his daughter’s present age and five-sevenths of his mother’s present age. The total of the present ages of all of them is 273 years. What is the difference
between Venu and his mother’s present age?`, qi: ``, o: [`21 years`, `24 years`, `28 years`, `Cannot be determined`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 63, s: `Quantitative Aptitude`, q: `Que. 63Marked price of a wheelchair is Rs 9060. The shopkeeper offered a discount of 20% and gained 51%. If no discount is allowed, find his gain percentage?
Que. 63
Que. 63`, qi: ``, o: [`71%`, `88.75%`, `90%`, `61.2%`, `75%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 64, s: `Quantitative Aptitude`, q: `The speed of boat in still water is 20 kmph and speed of stream is 3 kmph. Boat takes a total of 9 hours to cover the distance from point A to point B upward and from point B to point C downward.
If the distance of upstream is three fourth of distance of downstream, the total distance (in m) travel by boat is`, qi: ``, o: [`1,71,500`, `1,70,000`, `1,62,58`, `1,79,700`, `1,71,617`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 65, s: `Quantitative Aptitude`, q: `A bowl contains 5 litres of milk. Rajesh removes 20% of the milk and adds 2 litres of water.
Mahesh removes 40% of this solution and adds 4 litres of soya sauce. Finally, Ramesh removes 30% of this solution. Find the ratio of milk, water and soya sauce in the bucket now.`, qi: ``, o: [`6 ∶ 3 ∶ 7`, `6 ∶ 3 ∶ 8`, `6 ∶ 3 ∶ 9`, `6 ∶ 3 ∶ 10`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 66, s: `Reasoning Ability`, q: `J is the father of A. A is the only child of J. P who is unmarried, is the sister in law of A. Q is the only sibling of P. M is the mother of Q. N is the granddaughter of M.
How Q is related to P?`, qi: ``, o: [`Brother`, `Father`, `Mother`, `Sister`, `Either 1 or 4`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 67, s: `Reasoning Ability`, q: `Who is the father in law of Q?`, qi: ``, o: [`J`, `P`, `M`, `N`, `Cannot be determined`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 68, s: `Reasoning Ability`, q: `Who is the mother of N?`, qi: ``, o: [`J`, `M`, `A`, `Q`, `Either 3 or 4`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 69, s: `Reasoning Ability`, q: `Select the odd letters from the given alternatives.`, qi: ``, o: [`HFBD`, `YWSU`, `TRNP`, `OMJK`, `VTPR`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 70, s: `Reasoning Ability`, q: `Six people P, Q, R, S, T and U were sitting around a circular table but not necessarily in the same order. All of them were facing towards inside. Two people were sitting between P and R. S is
neighbour of P. T is sitting second to the right of S.
How many people were sitting between T and U?`, qi: ``, o: [`1`, `3`, `5`, `2`, `Cannot be determined`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 71, s: `Reasoning Ability`, q: `What is the position of R with respect to Q?`, qi: ``, o: [`Second to the right`, `Third to the right`, `Immediately right`, `Immediately left`, `Either 3 or 4`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 72, s: `Reasoning Ability`, q: `Who is sitting exactly between T and S?`, qi: ``, o: [`P`, `Q`, `Both 1 and 4`, `U`, `Both 2 and 4`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 73, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the questions that follow:
P, V, X, A, D, I, K and U set out for trip(in same order) for different number of days such as 2, 8, 11, 5, 6, 4, 7 and 3, they go to the trip in the same order but the order of number of days is not necessary
D’s trip is not for eight days. Three trips are scheduled between I and the person going for six days. A’s trip is scheduled for a square number days. I go for seven days or else two days. The number of days of the trip of D is greater than the number of days of trip of P. K’s trip is scheduled for the 8th smallest number of days.
X’s trip is not scheduled for three days. U’s trip is scheduled for the second highest prime number of days.
D’s trip is scheduled for how many days?`, qi: ``, o: [`8`, `4`, `5`, `6`, `2`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 74, s: `Reasoning Ability`, q: `Whose trip is scheduled for the second maximum days?`, qi: ``, o: [`U`, `P`, `I`, `X`, `V`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 75, s: `Reasoning Ability`, q: `Whose trip after A has less number of trip days than A?`, qi: ``, o: [`U`, `K`, `V`, `D`, `I`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 76, s: `Reasoning Ability`, q: `Who are going to trip one after another number of days?`, qi: ``, o: [`X, V`, `P, D`, `A, V`, `V, U`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 77, s: `Reasoning Ability`, q: `Who went to trip for 11 days?`, qi: ``, o: [`P`, `X`, `K`, `A`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 78, s: `Reasoning Ability`, q: `Direction: In the following question assuming the given statements to be true, find which of the conclusion among given conclusions is/are definitely true and then give your answers accordingly.
Statements:
H ≤ Q ≤ R = E; P ≥ B > H
Conclusions:
Q ≤ B
B ˃ P`, qi: ``, o: [`Neither conclusion I nor II is true.`, `Both conclusions I and II are true.`, `Only conclusion I is true.`, `Only conclusion II is true.`, `Either conclusion I or II is true.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 79, s: `Reasoning Ability`, q: `Direction: In the following question assuming the given statements to be true, find which of the conclusion among given conclusions is/are definitely true and then give your answers accordingly.
Statements:
T = V > W = M > R; X < G ≤ M
Conclusions:
W > G
R ˃ X`, qi: ``, o: [`Only conclusion I is true.`, `Only conclusion II is true.`, `Either conclusion I or II is true.`, `Both conclusions I and II are true.`, `Neither conclusion I nor II is true.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 80, s: `Reasoning Ability`, q: `Direction: In the following question assuming the given statements to be True, find which of the conclusion among given conclusion(s) is/are definitely True and then give your answers
accordingly.
Statements: T < Q; R = S; Q > P ≥ R Conclusions:
T < R
P = S`, qi: ``, o: [`None is True`, `Both I and II are True`, `Only II is True`, `Only I is True`, `Either I and II is True`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 81, s: `Reasoning Ability`, q: `Direction: In the following question assuming the given statements to be True, find which of the conclusion among given conclusion(s) is/are definitely True and then give your answers
accordingly.
Statements: Y = X; Z < U < V; X > Z Conclusions:
V > X
Y > U`, qi: ``, o: [`None is True`, `Both I and II are True`, `Only II is True`, `Only I is True`, `Either I and II is True`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 82, s: `Reasoning Ability`, q: `Que. 82
Que. 82
Que. 82
Direction: In the following question assuming the given statements to be true, find which of the conclusion among given conclusions is/are definitely true and then give your answers accordingly.
Statements: P ≥ Q ≥ R = S = T ≥ U ≤ V ≤ W = X Conclusions:
W > S
X ≤ R`, qi: ``, o: [`None is true`, `Both I and II are true`, `Only II is true.`, `Only I is true`, `Either I or II is true`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 83, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions following it.
10 persons A, B, C, D, E, F, G, H, I and J, are sitting in two rows facing each other in north south direction with five persons in each row. There are five different colors Red, Blue, Black, Green and Yellow where 2 persons likes the same color.
B is third to the left of E. I is the neighbor of C and sits opposite to B. Persons who likes Yellow color are neighbors of each other. D is second to the right of A. I likes Red color. The person who likes Green color is sitting opposite to I. E is sitting at the extreme end of one of the rows. A and F are seated diagonally opposite to each other. The person who like Red color is the neighbor of the person who like Blue color. F does not like Yellow or Blue color. G is facing north and is not the neighbor of H. One of the neighbors of I is seated opposite to H. Persons who likes Yellow and Green color are at the end of one of the rows. Both the neighbors of B like the same color.
Which color is F’s favorite?`, qi: ``, o: [`Red`, `Blue`, `Black`, `Green`, `Yellow`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 84, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions following it.
10 persons A, B, C, D, E, F, G, H, I and J, are sitting in two rows facing each other in north south direction with five persons in each row. There are five different colors Red, Blue, Black, Green and Yellow where 2 persons likes the same color.
B is third to the left of E. I is the neighbor of C and sits opposite to B. Persons who likes Yellow color are neighbors of each other. D is second to the right of A. I likes Red color. The person who likes Green color is sitting opposite to I. E is sitting at the extreme end of one of the rows. A and F are seated diagonally opposite to each other. Both the persons who like Red color are the neighbors of the person who like Blue color. F does not like Yellow or Blue color. G is facing north and is not the neighbor of H. One of the neighbors of I is seated opposite to H. Persons who likes Yellow and Green color are at the end of one of the rows. Both the neighbors of B like the same color.
What is the position of D with respect to A?`, qi: ``, o: [`Next to the opposite of A`, `Opposite A`, `Second to the left`, `Second to the right`, `Cannot be determined`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 85, s: `Reasoning Ability`, q: `Who likes Green color?`, qi: ``, o: [`A, G`, `D, F`, `B, C`, `I, F`, `J, H`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 86, s: `Reasoning Ability`, q: `Among the following, who are sitting at the extreme end?`, qi: ``, o: [`E and the one who likes red color.`, `The one who like black color and blue color`, `J and B`, `The one who like red`, `C and F`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 87, s: `Reasoning Ability`, q: `How many persons are there between E and F?`, qi: ``, o: [`1`, `2`, `3`, `0`, `2 or 3`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 88, s: `Reasoning Ability`, q: `Direction: Study the following information and answer the questions given below:
There is a MN axis in such a way that M is in the north and N is in the south direction. There is a PQ axis in such a way that P is in west direction and Q is in the east direction. MN axis and PQ axis intersect at a point O in such a way that MO is 13 km, ON is 15 km, OP is 10 km, OQ is 22 km.`, qi: ``, o: [`Robert starts walking from point P and walks 18 km in the south direction and then he takes a turn to his left and walks 30 km. Nicholas starts walking from point M and walks 20 km in the east direction. Thomas starts walking from point Q and walks 3 km in the north direction and then he takes a turn to his left and walks 2 km and again he takes a turn to his left and walks 15 km.`, `In which direction is point N located with respect to Thomas’s current position?`, `South`, `West`, `North-West`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 89, s: `Reasoning Ability`, q: `In which direction is point Q located with respect to Robert’s current position?`, qi: ``, o: [`North`, `East`, `North-East`, `North-West`, `South`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 90, s: `Reasoning Ability`, q: `What is the distance between Nicholas’s current position and Robert’s current position?`, qi: ``, o: [`31 km`, `33 km`, `11 km`, `20 km`, `25 km`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 91, s: `Reasoning Ability`, q: `Direction: Study the following information carefully and answer the given questions.
In a certain code language ‘news asked for knowledge’ is written as ‘ac cc bb ab’, ‘knowledge is for peace’ is written as ‘bb ca ac ae’, ‘peace is for human’ is written as ‘ae ac ee ca’ and ’human asked to gather’ is written as ‘cc ec ba ee’.
Which of the following means ‘knowledge’ in that code language?`, qi: ``, o: [`ac`, `cc`, `bb`, `Either (1) or (2) or (3)`, `ab`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 92, s: `Reasoning Ability`, q: `Which of the following means ‘for’ in that code language?`, qi: ``, o: [`cc`, `bb`, `ac`, `Either (1) or (2)`, `ab`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 93, s: `Reasoning Ability`, q: `Directions: Read the instructions carefully and answer the question below
In a running race, 7 people A, B, C D, E, F and G participated. A finished just after D but immediately before G. B finished at last and F could beat only two people. C exactly finished in the middle of the list. E did not come first.
Who is the person who came immediately after G?`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 94, s: `Reasoning Ability`, q: `Direction: Read the following information carefully and answer the question that follows:
Eight boxes of different colours Blue, Yellow, Green, Orange, White, Black, Red and Pink are kept in stack one above the other. There are only three boxes kept between Blue & Red box. The white box is just below the red box. There are two boxes kept between white & pink. There are as many boxes between Yellow & Orange as between Red & Blue. The green box is immediately above the orange box and neither orange nor white box is at the bottom of the stack. The Blue box is not at the lowermost stack.
How many boxes are there between Pink and Orange box?`, qi: ``, o: [`Five`, `As many as between Orange and Blue.`, `As many as between White and Black.`, `No box is between Pink and Orange.`, `As many as between Yellow and Blue.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 95, s: `Reasoning Ability`, q: `Which of the following boxes is kept below the white box?`, qi: ``, o: [`Pink`, `Red`, `Yellow`, `Either ‘Pink’ or ‘Red’`, `Orange`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 96, s: `Reasoning Ability`, q: `Box of which colour is kept at the bottom of the stack?`, qi: ``, o: [`Orange`, `Yellow`, `Red`, `Black`, `Blue`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 97, s: `Reasoning Ability`, q: `Four of the following five are alike in a certain way and so forms a group. Which is the one that does not belong to the group?`, qi: ``, o: [`Green and Blue`, `Black and Orange`, `Pink and Red`, `Black and White`, `White and Yellow`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 98, s: `Reasoning Ability`, q: `Which of the following statements is False?
The yellow box is kept above the White box.
Only red box is kept between Yellow and White box.
The pink box is kept at the top of Stack.`, qi: ``, o: [`Only III`, `Both I and II`, `None of the given statements is false`, `Both I and III`, `All I, II and III`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 99, s: `Reasoning Ability`, q: `Directions: In each of the questions below are given few statements followed by some conclusions numbered I and II. You have to take the given statements to be true even if they seem to be at
variance with commonly known facts. Read all the conclusions and then decide which of the given conclusions logically follows from the given statements, disregarding commonly known facts. Give answer
Statements:
Some squares are circles.
All circles are triangles.
Some rectangles are triangles.
Conclusions:
All squares being rectangle is a possibility.
At least some rectangles are circles.`, qi: ``, o: [`Only conclusion I follows.`, `Only conclusion II follows.`, `Either conclusion I or conclusion II follows.`, `Neither conclusion I nor conclusion II follows.`, `Both conclusion I and conclusion II follow.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 100, s: `Reasoning Ability`, q: `In the following question below are given some statements followed by some conclusions. Taking the given statements to be true even if they seem to be at variance from commonly known facts,
read all the conclusions and then decide which of the given conclusion logically follows the given statements.
Statements:
Some tables are chairs.
All chairs are cups.
Conclusions:
All tables are cups.
Some tables are cups`, qi: ``, o: [`Only conclusion (I) follows`, `Only conclusion (II) follows`, `Both conclusion follow`, `Neither conclusion (I) nor conclusion (II) follows`, `Either (I) or (II) follows`], oi: [``, ``, ``, ``, ``], e: `` }
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
      tags: ['IBPS', 'PO', 'Prelims', 'PYQ', '2018', '14 October 2018'],
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

  const TEST_TITLE = `IBPS PO Prelims - 14 October 2018`;
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2018, pyqShift: `14 October 2018`,
    pyqExamName: 'IBPS PO Prelims', questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
