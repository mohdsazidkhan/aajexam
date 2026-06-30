/**
 * Seed: Delhi Police Constable - 24 Nov 2023 Shift-1
 * 100 Q x 1 mark, 90 min. Reuses Exam SSC-DPC + pattern 'Computer-Based Test (CBT)'.
 * Source: official TCS/iON 'Question Paper with Answers' PDF (deterministic green
 * colour answer key). Figure/figural questions upload a local crop as questionImage.
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc24nov2023_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-24nov2023-s1';

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

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 24 Nov 2023 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "In karate, the fight starts when the referee shouts “_______”.", o: ["Yame", "Shobu Hajime!", "Kaizen", "Yuko"], a: 1, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Who decides the disqualification of members of State Legislative Assembly, for matters other than those in the Tenth Schedule of the Constitution of India?", o: ["Chief Minister", "High Court", "State Election Commission", "Governor"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Who among the following received the Padma Shri in 2022 for performing the Rai folk dance form of Madhya Pradesh?", o: ["AKC Natrajan", "Sheesh Ram", "Ram Sahay Pandey", "Ballesh Bhajantri"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "In which year was MS Subbulakshmi honoured with the Bharat Ratna?", o: ["1998", "1997", "1995", "1996"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Whom did Gopal Krishna Gokhale call ‘the best ambassador of Hindu-Muslim unity’?", o: ["Mohammad Ali Jinnah", "Maulana Abul Kalam Azad", "Jawaharlal Nehru", "Mahatma Gandhi"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "During the sixth century BCE, as part of the ‘Shraman’ tradition, which of the following new religious and social movements began in the Gangetic valley?", o: ["Sufism", "Christianity", "Buddhism", "Islam"], a: 2, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "The historic Asamai temple is located in __________ in Afghanistan.", o: ["Kandahar", "Kabul", "Ghazni", "Feyzabad"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "On which date in 1991 was the Indian rupee devalued?", o: ["1st January", "15th October", "30th July", "1st July"], a: 3, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "The term ‘protectionist policy’ in the industrial sector in the pre-1990 India refers to __________.", o: ["protecting public sector companies from domestic private sector companies", "protecting private companies from incurring losses", "protecting domestic companies from the competition of foreign companies", "protecting private sector companies from the competition of public sector companies"], a: 2, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "उत्तर भारतीय मंदिर वास्तुकला के शीर्ष पर सपाट गोल (स्टोन-डिस्क) संरचना के लिए निम्नलिखित में से किस शब्द का उपयोग किया जाता है?", o: ["शिखर (Shikhara)", "कलश (Kalasha)", "अमलक (Amalaka)", "अंतराल (Antarala)"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "भारतीय संविधान का कौन-सा अनुच्छेेद धार्मिक मामलों के प्रबंधन के अधिकार की गारंटी देता है?", o: ["अनुच्छेेद 25", "अनुच्छेेद 28", "अनुच्छेेद 27", "अनुच्छेेद 26"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Which of the following festivals of Mizoram is celebrated to promote horticulture?", o: ["Hlukhla Kut", "Anthurium", "Khuado Kut", "Lyuva Khutla"], a: 1, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Which of the following authors has written the great English novel ‘Moby-Dick’?", o: ["Wilkie Collins", "Herman Melville", "Nathaniel Hawthorne", "Thomas Hardy"], a: 1, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "होली के त्योहार के संबंध में निम्नलिखित में से कौन सा/से कथन सही है/हैं? A. होली से एक रात पहले, होलिका दहन होता है और लोग आग की परिक्रमा करते हैं, जो होलिका के अंत का प्रतीक है। B. त्योहार शरद ऋतु की शुरुआत का प्रतीक है। C. होली का त्योहार माघ मास (हिंदू कैलेंडर) में मनाया जाता है।", o: ["केवल B और C", "केवल A और C", "A,B और C", "केवल A"], a: 3, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Where is the tomb of Mohammad Ghaus located?", o: ["Agra", "Gwalior", "Delhi", "Burhanpur"], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Who wrote ‘The Story of My Experiments with Truth’?", o: ["Gopal Krishna Gokhale", "Jawaharlal Nehru", "Mohandas Karamchand Gandhi", "Bal Gangadhar Tilak"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "In a 100 m Relay Race, how many athletes have to complete a race?", o: ["2", "3", "4", "6"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "As of July 2023, which of the following dances from Kerala has been given a classical status by the Indian government?", o: ["Kolkali", "Thiruvathirakali", "Velakali", "Mohiniyattam"], a: 3, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Table sugar mostly contains:", o: ["maltose", "sucrose", "fructose", "glucose"], a: 1, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "The total replenishable groundwater resource in the country is about 432 cubic km. Accordingly, which water body has 26.55% of the total replenishable groundwater resource?", o: ["Mahanadi", "Brahmaputra", "Kaveri", "Godavari"], a: 1, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "The legendary Kuchipudi dancer and Padma Shri 1970 awardee, V Satyanarayana Sarma was born in _________ .", o: ["Andhra Pradesh", "Tamil Nadu", "Kerala", "Karnataka"], a: 0, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which physical component is required for transfer of antherozoids?", o: ["Air", "Soil", "Light", "Water"], a: 3, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "What is the minimum strength of the Legislative Council?", o: ["100 members", "15 members", "40 members", "60 members"], a: 2, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Which of the following social reformers is credited with the establishment of ‘Bharat Stree Mahamandal’ in 1910?", o: ["Sarojini Naidu", "Sarala Devi Chaudhurani", "Usha Mehta", "Savitri Bai Phule"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "As per census 2011, which of the following states has the highest scheduled caste population?", o: ["Tamil Nadu", "West Bengal", "Uttar Pradesh", "Bihar"], a: 2, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "What is the name of the mascot for the fourth Khelo India Games?", o: ["Jaya", "Veera", "Dhakad", "Vijaya"], a: 2, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "The salary, allowances and pension of the Comptroller and Auditor General of India is charged upon ____________.", o: ["Public Account", "Consolidated Fund of State", "Consolidated Fund of India", "Contingency Fund of India"], a: 2, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Who built the famous stupa of Bharhut originally?", o: ["Sunga", "Satavahana", "Maurya", "Kushan"], a: 2, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "To solve the balance of payment crisis in 1991, the Indian Rupee was ________ against foreign currencies.", o: ["devalued", "undervalued", "depreciated", "appreciated"], a: 0, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "With which of the following rights do Articles 23 and 24 of the Indian Constitution deal with?", o: ["Right to Freedom of Religion", "Right to Equality", "Right Against Exploitation", "Right to Constitutional Remedies"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "In India, seasonal unemployment is predominantly associated with which field?", o: ["Surface Transport", "Mining Industry", "Space and Technology", "Agriculture"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Muhammad Yunus, one of the pioneers in microfinance, founded Grameen Bank in which year?", o: ["1975", "1990", "1983", "1989"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Select the most appropriate option with respect to the correctness of the following statements. a) The northern plains are a densely populated physiographic division. b) The plains have rich soil cover combined with adequate water supply and favourable climate, it is agriculturally a productive part of India.", o: ["Both a and b are incorrect", "Only b is correct", "Only a is correct", "Both a and b are correct"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "In which year did the first Khelo India School Games start?", o: ["2015", "2018", "2016", "2017"], a: 1, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Who among the following won a Grammy Award for 'A Colorful World' in the Best Children's Album category in 2022?", o: ["Raveena Aurora", "Monica Dogra", "Falguni Shah", "Tatyana Ali"], a: 2, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "The first female sultan of Delhi sultanate, Raziyya Sultana, was the daughter of ________.", o: ["Muhammad Ghori", "Qutbuddin Aybak", "Muhammad Tughluq", "Shamsuddin Iltutmish"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "In which state of India is shifting cultivation known as Pamlou?", o: ["Odisha", "Manipur", "Madhya Pradesh", "Andhra Pradesh"], a: 1, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Interest received is a factor income from _________.", o: ["Labour", "land", "entrepreneurship", "Capital"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "As a result of the green revolution, India was able to change its status from __________", o: ["a developing nation to a developed nation", "an agricultural nation to a manufacturing nation", "a slow growing nation to the fastest growing nation in the world", "a food deficient country to a leading agricultural nation"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Who was the first Indian to be elected to the Communist International leadership class?", o: ["Manvendra Nath Roy", "Shripad Amrit Dange", "Jawaharlal Nehru", "Lala Lajpat Rai"], a: 0, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Molten state and very high-temperature are important criteria for the formation of which type of rocks?", o: ["Igneous rocks", "Metamorphic rocks", "Sedimentary rocks", "Sphalerite ore rocks"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Which neighbouring country has emerged as the top destination of wheat exports from India in 2020-21, with the largest share of over 54 per cent both in terms of quantity and value?", o: ["Sri Lanka", "Bhutan", "Nepal", "Bangladesh"], a: 3, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Who among the following was the author of Kitab-ul-Hind based on India?", o: ["Marco Polo", "Abdur Razzak", "Al Masudi", "Al Beruni"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Which kind of emergency is imposed on the grounds of threat to the economic stability or credit of India?", o: ["President’s Rule", "National Emergency", "Financial Emergency", "Internal Emergency"], a: 2, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Which of the following is a salient feature of the Indian Constitution?", o: ["It is the shortest written Constitution in the world.", "It was adopted before India got independence.", "It is the longest written Constitution in the world.", "It is not a written Constitution."], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "‘Beri-Beri’ is caused by the deficiency of __________.", o: ["Riboflavin", "Cyanocobalamin", "Niacin", "thiamine"], a: 3, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "What does ‘F’ stand for in FII?", o: ["Fiduciary", "Foreign", "Fund", "Fast"], a: 1, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "In despair because of the perpetuation of untouchability in Hindu doctrine, BR Ambedkar converted to ­_________ .", o: ["Islam", "Christianity", "Jainism", "Buddhism"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "The rate of change of momentum of an object is proportional to the applied unbalanced force in the direction of force. This is known as:", o: ["law of inertia", "first law of motion", "third law of motion", "second law of motion"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Who among the following was an awardee of the prestigious National Nritya Shiromani Award 2022?", o: ["VP Dhananjayan", "Aparna Satheesan", "ShanthaDhanajayan", "Alarmel Valli"], a: 1, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding /deleting /multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed.) (32, 8, 72) (56, 14, 126)", o: ["(90, 23, 207)", "(92, 23, 209)", "(92, 21, 207)", "(92, 23, 207)"], a: 3, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "24nov2023-s1-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? YUN, URL, QOJ, ?, IIF", o: ["MLH", "NLH", "NKI", "MKI"], a: 0, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "24nov2023-s1-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct? 76 − 8 × 97 + 32 ÷ 8 = 515", o: ["× and −", "+ and ×", "+ and −", "= and +"], a: 0, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘LENGTH’ is written as ‘QVOTIS’ and 'REGARD' is written as 'KVVZKW'. How will ‘NATURE’ be written as in that language?", o: ["OFJLPE", "HBERPX", "OZIFKV", "HPELSH"], a: 2, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 1, 4, 10, 22, 46, ?", o: ["24", "32", "94", "45"], a: 2, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "24nov2023-s1-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the option that is embedded in the given figure (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "24nov2023-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "24nov2023-s1-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s1-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at 'AB' as shown.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s1-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Three statements are given, followed by three conclusions numbered 1, 2 and 3. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: 1. Some locks are keys. 2. Some keys are blades. 3. No blade is a gum. Conclusions: 1. No gum is a key. 2. No blade is a lock. 3. Some keys are locks.", o: ["Only conclusion 3 follows", "Only conclusions 1 and 3 follow", "Only conclusions 2 and 3 follow", "Only conclusions 1 and 2 follow"], a: 0, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Six letters J, K, L, M, N and O are written on different faces of a dice. Three different positions of this dice are shown in the figure. Select the letter that will be on the face opposite to the one having N.", o: ["M", "J", "L", "O"], a: 2, e: "", qimg: "24nov2023-s1-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "24nov2023-s1-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to replace the * signs and to balance the given equation. 111 * 87 * 78 * 3 * 25 * 2", o: ["− + ÷ = ×", "− ÷ = × +", "− + ÷ × =", "− ÷ + × ="], a: 0, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Abhay, Bala, Chan, Dev, Emran, Fanny and Garry are 7 friends sitting around a circular table. Only five of them are facing the centre. Chan is sitting third to the left of Dev and both are facing the centre. Emran is the neighbour of neither Chan nor Dev. The one who is sitting exactly between Dev and Fanny is not facing the centre. Garry is sitting third to the right of Abhay and is facing the centre. One of the immediate neighbours of Bala is not facing the centre. Who is not sitting facing the centre?", o: ["Bala", "Emran", "Fanny", "Chan"], a: 1, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fourth number in the same way as the first number is related to the second number and the fifth number is related to the sixth number. 30 : 68 :: ? : 222 :: 10 : 30", o: ["125", "130", "150", "149"], a: 1, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'MN' as shown below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s1-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "24nov2023-s1-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["31", "29", "27", "28"], a: 0, e: "", qimg: "24nov2023-s1-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the option figure that is embedded in the given figure. (Rotation is not allowed).", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "24nov2023-s1-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the word-pair that best represents a similar relationship to the one expressed in the pair of words given below. (The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word.) Apes : Shrewdness", o: ["Tree : Leaves", "Bears : Sleuth", "Skin : Man", "Lion : Fur"], a: 1, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "A loss of 25% gets converted into a profit of 12% when the selling price of an article is increased by ₹111. Find the cost price of the article.", o: ["₹290", "₹300", "₹295", "₹305"], a: 1, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "The length of a rectangle is increased by 70% and its breadth is decreased by 35%. What is the net percentage increase in its area?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "24nov2023-s1-q-77.png" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "Under a scheme, a vendor is selling an article at a discount of 20% on the marked price; furthermore, he is offering a cash discount of ₹170. Now he is earning a profit of 10%. Determine the marked price of the article if its cost price is ₹1,300.", o: ["₹500", "₹1,000", "₹1,500", "₹2,000"], a: 3, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "24nov2023-s1-q-79.png" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the correct ascending order of the following ratios?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "24nov2023-s1-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "If the base of a triangle is L cm, height is (4L+7) cm and sum of the base and height is 37 cm, then find the area of the triangle.", o: ["82 cm2", "75 cm2", "93 cm2", "105 cm2"], a: 2, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A boat can travel at a speed of 13 km/h in still water. If the speed of the stream is 4 km/h, then the time taken by boat to go 63 km in the opposite direction to stream is:", o: ["6 hours", "5 hours", "9 hours", "7 hours"], a: 3, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the average of the given numbers. 3, 7, 9, -5, 0.25, -3.75", o: ["10.5", "2.625", "4.67", "1.75"], a: 3, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "In how many years will ₹7,81,250 amount to ₹9,13,952 at 4% compound interest?", o: ["4", "4.5", "3", "3.5"], a: 0, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "If 42 workers earn ₹4,080 in 5 days, how much will 48 workers earn in 14 days?", o: ["₹13,056", "₹13,198", "₹6,528", "₹6,128"], a: 0, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of income and expenditure is 9∶5. Income increases by 40% and expenditure decreases by 10%. If the initial income is ₹45,000 then the final saving (in ₹) is:", o: ["40,500", "40,000", "35,000", "41,000"], a: 0, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of two numbers is 16:19 and their least common multiple is 59280. What are the two numbers?", o: ["3120 and 3705", "5345 and 2298", "3750 and 2130", "3175 and 2123"], a: 0, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1.05", "1.07", "1.08", "1.03"], a: 3, e: "", qimg: "24nov2023-s1-q-88.png" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "How long (in years) will it take a sum of money invested at 8% per annum on simple interest to increase its value by 40%?", o: ["5", "3", "6", "7"], a: 0, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "If each side of an equilateral triangle is increased by 80%, then by what percentage will the area increase?", o: ["120%", "240%", "238%", "224%"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a component of an email message?", o: ["Ncc", "Cc", "To", "Subject"], a: 0, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "In Microsoft Word 365, in which layout mode can we see how text and graphics will appear on the printed page?", o: ["Normal Layout", "Quick Layout", "Print Layout", "Web Layout"], a: 2, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In MS-Word 365, which feature allows you to track and review changes made to a document, such as additions, deletions, and formatting modifications?", o: ["Version History", "Track Changes", "AutoSave", "Spelling and Grammar Check"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following is an absolute cell reference in an MS Excel spreadsheet?", o: ["$A1", "A1", "A$1", "$A$1"], a: 3, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "Which pair of keyboard shortcuts is used for copying and pasting words in MS word 365?", o: ["Ctrl + C and Ctrl + V", "Ctrl + C and Ctrl + S", "Ctrl + C and Ctrl + Z", "Ctrl + C and Ctrl + A"], a: 0, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "If you are currently in Cell D4 in Microsoft Excel and you press the Enter key, to which cell will you move?", o: ["You will go to Cell E4", "You will go to Cell D5", "You will go to Cell D3", "You will go to Cell C4"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following is the correct syntax to enter a Date in MS-Excel 365?", o: ["=DATE(month,day,year)", "=DATE(year,day,month)", "=DATE(day,year,month)", "=DATE(year,month,day)"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "What is the shortcut key for opening the documents in MS-Word 365?", o: ["Ctrl + W", "Ctrl + B", "Ctrl + V", "Ctrl + O"], a: 3, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following methods is used to open word Processing package?", o: ["File-> All Programs->Word Processor", "Start->All Programs->Microsoft Word", "Start->All Programs->Word Processor", "File-> All Programs->Microsoft Word"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which internet protocol is responsible for assigning unique IP addresses to devices on a network and ensuring they can communicate with each other?", o: ["TCP (Transmission Control Protocol)", "HTTP (Hypertext Transfer Protocol)", "DNS (Domain Name System)", "DHCP (Dynamic Host Configuration Protocol)"], a: 3, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 24 Nov 2023 Shift-1";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2023,
    pyqShift: TEST_TITLE, pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
