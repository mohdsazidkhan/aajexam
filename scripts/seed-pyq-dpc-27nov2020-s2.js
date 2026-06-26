/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 27 Nov 2020 Shift-2
 * 100 Q x 1 mark, 90 min, 0.25 negative. Reuses Exam SSC-DPC + pattern
 * 'Computer-Based Test (CBT)'. Figure questions upload a local image as questionImage.
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc27_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-27nov2020-s2';

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

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2020', "Delhi Police Constable - 27 Nov 2020 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "______ was the Chairman of the Advisory Committee on Fundamental Rights, Minorities and Tribal and Excluded Areas of the Constituent Assembly of India.", o: ["Vallabhbhai Patel", "BR Ambedkar", "Rajendra Prasad", "Jawaharlal Nehru"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a term used to denote couplets of a 'ghazal'?", o: ["Makta/Maqta", "Matla", "Maand/Mand", "Misra"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "The Gulbenkian Prize for Humanity 2020 was awarded to ______.", o: ["Jamie Margolin", "Yara Shahidi", "Greta Thunberg", "Malala Yousafzai"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Graham Reid is the chief coach of Indian men's ______ team as of August 2020.", o: ["cricket", "football", "hockey", "basketball"], a: 2, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "The Economic Survey ______ introduced the concept of ‘Thalinomics’ in an attempt to relate economics to a plate of food.", o: ["2019-20", "2018-19", "2017-18", "2016-17"], a: 0, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "The fictional town 'Malgudi' was the setting for stories written by ______.", o: ["Ruskin Bond", "RK Narayan", "Munshi Premchand", "Sudha Murty"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Which of the following animals was associated with the 'Ashvamedha' ritual in Vedic India?", o: ["Elephant", "Horse", "Bull", "Goat"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "______ is a major festival of Tripura wherein the deity of livestock and wealth is worshipped.", o: ["Lampra Puja", "Ker Puja", "Kharchi Puja", "Garia Puja"], a: 3, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "With which of the following is the term 'Vesara' associated?", o: ["Classical music", "Tribal festival", "Folk dance", "Temple architecture"], a: 3, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "The burial site at Inamgaon lies along the river ______.", o: ["Mahi", "Subarnarekha", "Ghod", "Penner"], a: 2, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "In June 2020, the International Monetary Fund (IMF) projected a contraction of ______% for the Indian economy.", o: ["6.25", "4.50", "2.25", "8.50"], a: 1, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "______ was a poet and minister in the court of King Samudragupta.", o: ["Harisena", "Banabhatta", "Vasumitra", "Kamban"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Mahapadma Nanda ruled over the kingdom of ______.", o: ["Kosala", "Magadha", "Vatsa", "Avanti"], a: 1, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "As of 2020-21, the Commission for Agricultural Costs and Prices (CACP) does NOT recommend the Minimum Support Price (MSP) for ______.", o: ["sunflower", "groundnut", "soya bean", "linseed"], a: 3, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "‘The Disciple’ is an award winning film in ______ by Chaitanya Tamhane.", o: ["Gujarati", "Marathi", "Hindi", "English"], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Which of the following statements is INCORRECT?", o: ["The Reserve Bank of India was set up on the basis of the recommendations of the Hilton Young Commission.", "The Reserve Bank served as the central bank of Pakistan up to April 1947.", "The Reserve Bank of India was nationalised in 1949.", "The Reserve Bank of India commenced operations on 1 April 1935."], a: 1, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "The process of covering bare ground with a layer of organic matter in order to retain soil moisture is called ______.", o: ["contour ploughing", "terrace farming", "mulching", "intercropping"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Which of the following statements is INCORRECT?", o: ["Loamy soil is used to make pots, toys and statues.", "Cotton is grown in sandy loam soil.", "Clay and loam are suitable for growing wheat, gram and paddy.", "Percolation rate of water is highest in sandy soil and least in clayey soil."], a: 0, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Which of the following terms is NOT associated with rivers?", o: ["Waterfall", "Horst", "Meander", "Distributary"], a: 1, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Section ______ of the Banking Regulation Act, 1949 prohibits a banking company incorporated in India from appointing as Director on its Board, any person who is a Director of any other banking company.", o: ["17", "15", "16", "18"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "______ is a Tamil festival wherein temple idols are taken in a procession to a water body for a ceremonial bath.", o: ["Masi Magam", "Mopin", "Vettukad", "Khuado Kut"], a: 0, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which of the following statements about bio-gas is INCORRECT?", o: ["Bio-gas burns without smoke and leaves no residue.", "Bio-gas contains less than 1% methane.", "Bio-gas is also known as ‘gobar-gas’.", "Plant parts, vegetable waste and sewage are used in the production of bio-gas."], a: 1, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "'Pravasi Rojgar' is an initiative by ______, towards contributing to the need of connecting job seekers to relevant employers.", o: ["Riteish Deshmukh", "Salman Khan", "Akshay Kumar", "Sonu Sood"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "The 'Digha Nikaya' is a collection of ______ discourses.", o: ["Sikh", "Buddhist", "Jain", "Hindu"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Which of the following football clubs entered into a two-year partnership with German football giants Borussia Dortmund in August 2020?", o: ["Hyderabad FC", "Odisha FC", "Bengaluru FC", "Jamshedpur FC"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Which of the following terms is associated with the production of honey?", o: ["Apiculture", "Sericulture", "Horticulture", "Silviculture"], a: 0, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "The Cauvery basin lies in the Indian states of Tamil Nadu, Karnataka and ______.", o: ["Maharashtra", "Andhra Pradesh", "Kerala", "Telangana"], a: 2, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Leaves of the nettle plant secrete ______ acid which causes a painful sting on touching.", o: ["acetic", "ascorbic", "oxalic", "methanoic"], a: 3, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Section ______ of the Indian Penal Code deals with punishment for unlawful assembly.", o: ["159", "143", "166", "135"], a: 1, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Which of the following falls under the secondary sector of economic activities?", o: ["Warehousing", "Banking", "Sugar factory", "Transport"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Lord Voldemort is a fictional character in a series of books by ______.", o: ["RL Stine", "JK Rowling", "Ruskin Bond", "Roald Dahl"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "______ became king of Thanesar after the death of his father and elder brother.", o: ["Prabhakarvardhana", "Chandragupta 1", "Harshavardhana", "Samudragupta"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "As per Section 25 of the Banking Regulation Act, 1949, the assets in India of every banking company at the close of business on the last Friday of every quarter or, if that Friday is a public holiday, at the close of the business on the preceding working day, shall not be less than ______ of its demand and time liabilities in India.", o: ["75%", "10%", "25%", "50%"], a: 0, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Who was Panini?", o: ["A Vedic sage who wrote most of the Atharva Veda", "A poet in the court of Emperor Vikramaditya VI", "A health scientist who conducted complicated surgeries", "A scholar who prepared grammar for the Sanskrit language"], a: 3, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Which of the following statements about plains is INCORRECT?", o: ["The Indo-Gangetic plains are the most sparsely populated regions of India.", "Generally, plains are very fertile.", "Plains are large stretches of flat land.", "Some plains are formed by river deposits."], a: 0, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Tertiary consumers make up the ______ trophic level in the food chain.", o: ["fourth", "first", "third", "second"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Which of the following Indian warships arrived at the Alang ship breaking yard for dismantling in September 2020?", o: ["INS Godavari", "INS Vishal", "INS Viraat", "INS Nilgiri"], a: 2, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "The Muslim Women (Protection of Rights on Marriage) Act is deemed to have come into force on 19 September ______.", o: ["2018", "2014", "2004", "2008"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "In August 2020, the Cabinet Committee on Economic Affairs declared the Fair and Remunerative Price of ______ per quintal for sugarcane for the marketing year starting October 2020.", o: ["₹275", "₹265", "₹255", "₹285"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "The first train under the 'Kisan Rail' scheme announced in the Union Budget 2020-21 began transport services on ______.", o: ["1 May 2020", "3 July 2020", "7 August 2020", "5 June 2020"], a: 2, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Which of the following sports personalities was awarded the Rajiv Gandhi Khel Ratna in August 2020?", o: ["Bajrang Punia", "Manika Batra", "Virat Kohli", "Deepa Malik"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Which of the following is a dance form of Haryana?", o: ["Velakali", "Phag", "Chaiti", "Brindabani"], a: 1, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Under the Indian Penal Code, an attempt to commit suicide is punishable with simple imprisonment for a term which may extend to ______ or with a fine, or with both.", o: ["3 years", "6 months", "1 year", "3 months"], a: 2, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Which of the following archaeological sites is located outside the state of Gujarat?", o: ["Amarpura", "Dholavira", "Rangpur", "Rakhigarhi"], a: 3, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "The Census of India 2011, showed an increase in population by about ______% as compared to 2001.", o: ["23.5", "5.5", "17.5", "11.5"], a: 2, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Which of the following monasteries is NOT located in Sikkim?", o: ["Enchey", "Pemayangste", "Ralong", "Tabo"], a: 3, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Sodium carbonate is used ______.", o: ["for bleaching cotton and linen in the textile industry", "as an oxidising agent in many chemical industries", "to make drinking water free from germs", "to remove permanent hardness of water"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Which of the following Acts provides for measures to deter offenders from evading the process of law in India by staying outside the jurisdiction of Indian courts?", o: ["The Black Money (Undisclosed Foreign Income and Assets) and Imposition of Tax Act, 2015", "Prevention of Money-laundering Act, 2002", "Benami Property Transactions Act, 1988", "Fugitive Economic Offenders Act, 2018"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "The BCCI announced ______ as the Title Sponsor of the 2020 edition of the Indian Premier League (IPL) in August 2020.", o: ["Byju's", "Vivo", "DFL", "Dream11"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "World Oral Health Day is observed on ______ every year.", o: ["18th January", "30th July", "6th May", "20th March"], a: 3, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "27nov2020-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "A loss of 26% gets converted into a profit of 24% when the selling price of a sanitizer bottle is increased by ₹185. The cost price of the article is:", o: ["₹370", "₹365", "₹350", "₹345"], a: 0, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "27nov2020-s2-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "27nov2020-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "27nov2020-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "27nov2020-s2-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "27nov2020-s2-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Three of the following four words are alike in a certain way and one is different. Pick the odd one out.", o: ["Doe", "Fawn", "Vixen", "Queen"], a: 1, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "27nov2020-s2-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "27nov2020-s2-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "27nov2020-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "27nov2020-s2-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following set.\n(7, 30, 143)", o: ["(5, 6, 37)", "(9, 18, 83)", "(6, 9, 38)", "(8, 33, 158)"], a: 3, e: "", qimg: "" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "27nov2020-s2-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "27nov2020-s2-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\nSweater : Wool :: Chalk : ?", o: ["Duster", "Oyster", "Limestone", "Haematite"], a: 2, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "27nov2020-s2-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "27nov2020-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n18, 20, 25, 37, 46, 76, 89, 145, ?", o: ["126", "217", "162", "271"], a: 2, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct?\n341 ÷ 11 − 15 × 8 + 100 = 51", o: ["× and −", "− and +", "× and +", "+ and ÷"], a: 1, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "27nov2020-s2-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n11 : 141 :: 17 : ?", o: ["291", "294", "249", "219"], a: 3, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Which number will replace the question mark (?) in the following series?\n13, 13, 15, 27, 47, 67, 97, 153, ?", o: ["325", "252", "225", "352"], a: 2, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "If EQUALITY is coded as 22832631827 and CONFIRM is coded as 2465211894, then how will RESOURCE be coded?", o: ["922106392422", "922103629242", "921206932242", "921206923224"], a: 0, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Study the figure(s) and the four options shown in the image below, and select the correct option.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "27nov2020-s2-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "If the sum of the squares of two positive numbers is 2426 and the square root of one number is 7, then the other number is:", o: ["6", "4", "5", "8"], a: 2, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum invested at 8% p.a. amounts to ₹20,280 at the end of one year, when the interest is compounded half yearly. What will be the compound interest (in ₹) on the same sum for 2 years if the interest rate is the same as earlier and interest is compounded annually?", o: ["3,260", "4,000", "2,750", "3,120"], a: 3, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper marks his goods at 20% above the cost price. He sells three-fourth of the goods at the marked price and the remaining at 30% discount on the marked price. What is his gain/loss percentage?", o: ["Gain 11%", "Loss 9%", "Loss 11%", "Gain 9%"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the least number which when divided by 12, 21 and 35 leaves the same remainder 2?", o: ["212", "844", "632", "422"], a: 3, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "A borrows a sum of ₹9,000 for 3 years at 5% simple interest. He lends it at simple interest to B at 7% for 3 years. What is his gain (in ₹)?", o: ["700", "540", "600", "450"], a: 1, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the area of rhombus (in cm²) whose side is 10 cm and the shorter diagonal is 12 cm?", o: ["60", "96", "48", "192"], a: 1, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A train covers 400 km at a uniform speed. If the speed had been 10 km/h more, it would have taken 2 hours less for the same journey. What is the speed of the train (in km/h)?", o: ["25", "35", "30", "40"], a: 3, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A is 5 times as good a workman as B and is therefore able to complete a job in 52 days less than B. In how many days will they complete it working together?", o: ["12 5/6", "10 5/6", "9 5/6", "11 5/6"], a: 1, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "The value of (5.75 + 5/7 of 28 − 4.5) / (3/4 of (15.8 − 3.4) + 5 × 2.39) is:", o: ["1", "−1/2", "0", "−1"], a: 0, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of n numbers is 36. If each of 75% of the numbers is increased by 5 and each of the remaining numbers is decreased by 8, then the new average of the numbers is:", o: ["37.75", "38.5", "36.25", "37"], a: 0, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "Three articles are bought at ₹200 each. One of them is sold at a loss of 12.5%. If the other two articles are sold so as to gain 20% on the whole transaction, then what is the gain percentage on the two articles?", o: ["35%", "41.5%", "36.25%", "39.75%"], a: 2, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Due to 25% reduction in the price of sugar per kg, Radha is able to buy 10 kg more for ₹1,200. What is the original price of sugar per kg (in ₹)?", o: ["50", "35", "45", "40"], a: 3, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "The length of a rectangle is 2/5 of the radius of a circle. The radius of the circle is equal to the side of a square whose area is 4900 m². What is the area (in m²) of the rectangle, if its breadth is 20 m?", o: ["960", "400", "560", "1400"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "In an election, the votes cast for two candidates are in the ratio 3 : 10. If all votes are valid votes and if the successful candidates received 156200 votes, then the total votes polled are:", o: ["356200", "179256", "468600", "203060"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "If the radius of a circle is increased by 10%, then what is the percentage increase in its area?", o: ["11%", "21%", "25%", "10%"], a: 1, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Every computer connected to the internet must have a(n):", o: ["LED display", "switch", "tertiary memory", "IP address"], a: 3, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following best describes the MS-Word software?", o: ["It is a firmware.", "It is a word processor.", "It is a GUI-based operating system.", "It is a system software."], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "What is the result of the following MS-Excel formula? =256/8/4/2", o: ["16", "0", "4", "64"], a: 2, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following function keys can be used to edit a cell of an MS-Excel worksheet?", o: ["F3", "F5", "F2", "F4"], a: 2, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In MS-Excel, a workbook must contain at least _______ worksheet(s).", o: ["five", "two", "one", "three"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT allowed in an email-id?", o: ["Blank space", "Dot (.)", "Numeric digits", "Capital letters"], a: 0, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which of the following statements is/are true? (i) In MS-Word, a text cannot be both italicized and bold. (ii) In MS-Word, a text cannot have font-size less than 8.", o: ["Both i and ii", "Only i", "Neither i nor ii", "Only ii"], a: 2, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "What is the keyboard shortcut to select all content of a document in MS Word?", o: ["ALT + A", "CTRL + A", "ALT + L", "CTRL + C"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following is NOT a valid paragraph alignment in MS-Word?", o: ["Right", "Top", "Justify", "Left"], a: 1, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "What does the term HTTPS mean?", o: ["Hyper Text Translation Protocol Secure", "Hyper Text Transfer Protocol Secure", "Hyper Text Translation Protocol Service", "Hyper Text Transfer Protocol Service"], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 27 Nov 2020 Shift-2";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: "Delhi Police Constable - 27 Nov 2020 Shift-2", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
