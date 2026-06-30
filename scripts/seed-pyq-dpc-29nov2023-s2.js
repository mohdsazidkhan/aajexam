/**
 * Seed: Delhi Police Constable - 29 Nov 2023 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc29nov2023_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-29nov2023-s2';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 29 Nov 2023 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Who among the following is the founder of the Vrindavan Gurukul in Mumbai and Vrindavan Gurukul in Bhubaneshwar?", o: ["Shivkumar Sharma", "M Balamurlikrishnan", "Hariprasad Chaurasia", "Bhimsen Joshi"], a: 2, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "In 1889, ________ established the Mukti Mission, in Pune, a refuge for young widows who had been deserted and abused by their families.", o: ["Pandita Ramabai", "Laxmi Sehgal", "Sarojini Naidu", "Kasturba Gandhi"], a: 0, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT an objective of the Fundamental Rights which are mentioned in the Indian Constitution?", o: ["Promote the ideal of political democracy", "Prevent the establishment of an authoritarian and despotic rule", "Establish a government of laws and not of men", "Drive the citizens towards the objectives of the government"], a: 3, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "The tribal dance Daang is associated with which Indian state?", o: ["Gujarat", "Odisha", "Madhya Pradesh", "Karnataka"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Due to the need for irrigation facilities and pesticides/fertilisers, the first phase of the Green Revolution benefitted few affluent states such as _______________.", o: ["Punjab, Andhra Pradesh and Bihar", "Punjab, Andhra Pradesh and Tamil Nadu", "Punjab, Andhra Pradesh and Uttar Pradesh", "Punjab, Arunachal Pradesh and Uttar Pradesh"], a: 1, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "The brittle crust and the top part of the upper mantle of the earth is called:", o: ["asthenosphere", "lithosphere", "mesosphere", "stratosphere"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Consider the following statements with respect to establishment of SEWA Bank, a microfinance institution in India. (i) SEWA Bank was established in 1974. (ii) SEWA Bank was established in Gujarat. (iii) SEWA Bank was established by the Self- employed Women’s Association. Choose the correct answer.", o: ["Only (iii) is true", "(i), (ii) and (iii) are true", "Only (i) is true", "Only (ii) is true"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "From which country is the concept of independence of the judiciary in the Indian Constitution taken?", o: ["Australia", "United States of America", "Germany", "South Africa"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "In which Olympics did PV Sindhu win a silver medal?", o: ["2016 Summer Olympics (Rio)", "2008 Summer Olympics (Beijing)", "2012 Summer Olympics (London)", "2020 Summer Olympics (Tokyo)"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which of the following mausoleum shapes was found in the architecture of the Lodhi dynasty?", o: ["Cylindrical", "Octagonal", "Circular", "Spherical"], a: 1, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Name the dance form of North-West India in which dancers emulate the movements of snakes?", o: ["Siddi Dhamal", "Tera Tali", "Garba", "Kalbeliya"], a: 3, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Who among the following is the fourth Chief Election Commissioner of India?", o: ["T Swaminathan", "Nagendra Singh", "SP Sen Verma", "KVK Sundaram"], a: 1, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "In which of the following cases does revenue deficit occur?", o: ["When the government’s total revenue exceeds its expenditure", "When the government’s revenue is added to its expenditure", "When the government’s total revenue is less than its expenditure", "When the government’s total revenue is equal to its expenditure"], a: 2, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "In which year was the Pradhan Mantri Kaushal Vikas Yojana launched?", o: ["2017", "2016", "2014", "2015"], a: 3, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Kalaguru Bishnu Rabha Award is given by which government in the field of dance and music?", o: ["Assam", "West Bengal", "Tripura", "Arunachal Pradesh"], a: 0, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "The Khilafat Movement started in India _________ .", o: ["to defend the Islamic caliphate in Turkey", "to oppose the massacre at Jallianwala Bagh", "to protest against communal electorates", "to oppose the restrictions upon freedom of press"], a: 0, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Chhath Pooja is mainly celebrated in which of these states?", o: ["Bihar", "Haryana", "Odisha", "Punjab"], a: 0, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "As per the recent NFHS-5 (2019-21) report, what percentage of children under the age of five are underweight in our country?", o: ["29.2%", "32.1%", "21.0%", "38.1%"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Which of the following features conveys the meaning ‘creating equalitarian society’ ?", o: ["Written Constitution", "Emergency provisions", "Federal system", "Fundamental Rights"], a: 3, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "In which of the following countries will you find the Magar and Tharu ethnic communities?", o: ["Nepal", "Afghanistan", "Bhutan", "Sri Lanka"], a: 0, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Which of the following sets consists of only compounds? A) Sugar solution, Calcium carbonate, Methane, Baking soda B) Sugar, Calcium carbonate, Methane, Baking soda C) Sugar solution, Calcium, Methane, Baking soda D) Sugar solution, Calcium carbonate, Methane, Soda water", o: ["A", "C", "B", "D"], a: 2, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "What was the launch year of ‘Pandit Deen Dayal Upadhyay Unnat Krishi Shiksha Yojana’?", o: ["2000", "1998", "2016", "2015"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "The city of Kolar in Karnataka is renowned for its ________ mines.", o: ["gold", "silver", "limestone", "copper"], a: 0, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Which article empowers the Supreme Court to exercise the jurisdiction and powers of the federal court under any pre-constitution law?", o: ["Article 135", "Article 139", "Article 144", "Article 140"], a: 0, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Which climatologist collaborated with Koppen in 1961 to modify the scheme of climate classification?", o: ["Nerilie Abram", "Richard Alley", "Jacob Bjerknes", "Rudolf Geiger"], a: 3, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "In which year did Indian Railways start its first computerised reservation in New Delhi?", o: ["1992", "1996", "2001", "1986"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which hymn from the Rigveda was used by the Brahmanas of ancient India to justify the Varna system?", o: ["Varna Sukta", "Brahm Sukta", "Manas Sukta", "Purusha Sukta"], a: 3, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "IR-8 is a dwarf variety of which crop?", o: ["Maize", "Rice", "Barley", "Wheat"], a: 1, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "The Olympic Games was organised in Asia for the first time in ____________.", o: ["1968", "1956", "1960", "1964"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "The Chandela dynasty of Rajput clan ruled which of the following regions between 9th and 13th century in early medieval period of India?", o: ["Amarkot", "Jaisalmer", "Bundelkhand", "Mewar"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Who among the following started the ‘Shuddhi Movement’ to bring back converted Hindus to the main Hindu society?", o: ["Ishwar Chand Vidyasagar", "Swami Sahjanand", "Swami Dayanand", "Swami Vivekanand"], a: 2, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Who among the following was chosen by Gandhiji as the first Satyagrahi of the individual Satyagraha movement?", o: ["Dr. BR Ambedkar", "C Rajagopalachari", "Gopal Krishna Gokhale", "Acharya Vinoba Bhave"], a: 3, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Who among the following chroniclers wrote his first chronicle in 1356?", o: ["Minhaj-us-Siraj", "Ziyauddin Barani", "Ibn-Sina", "Al-Biruni"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Deba Prasad Das, Pankaj Charan Das and Gangadhar Pradhan were the famous exponents of which of the following dance forms?", o: ["Odissi", "Sattriya", "Bharatnatyam", "Kathak"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "The deficiency of iodine causes _________.", o: ["Beriberi", "Scurvy", "Rickets", "goitre"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "By which of the following authors is the English novel ‘Three Men in a Boat’ written?", o: ["Robert Louis Stevenson", "Arthur Conan Doyle", "Mark Twain", "Jerome K Jerome"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "मानव विकास रिपोर्ट 2021-22 के अनुसार, भारत की समग्र बहुआयामी निर्धनता में स्वास्थ्य अभाव (health deprivation) का प्रतिशत अंश कितना है?", o: ["41.3%", "18.5%", "31.9%", "31.3%"], a: 2, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which of the following was the revenue collecting officer (collector general of revenue) in the Mauryan administration?", o: ["Antapala", "Samaharta", "Sannidhata", "Amatya"], a: 1, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "The English novel ‘The Rainbow’ was written by which of the following authors?", o: ["Thomas Hardy", "Joseph Conrad", "Emily Bronte", "D. H. Lawrence"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "भारत की पशुधन जनगणना 2019 के अनुसार, निम्नलिखित में से किस श्रेणी के पशुधन की जनसंख्या सबसे अधिक दर्ज की गई?", o: ["मवेशी", "बकरी", "भैंस", "भेड़"], a: 0, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Which of the following was first introduced in bacterial cells by the American molecular biologist Joshua Lederberg in 1952?", o: ["Pili", "Capsule", "Plasmid", "Cytoplasm"], a: 2, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Who among the following became the first Indian to be signed by Elektra Records, a U.S.company in October 2020?", o: ["Vipin Aneja", "Prateek Kuhad", "Kulwinder Dhillon", "Jim Ankan Deka"], a: 1, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Mumbai’s famous Gateway of India was built in the memory of which British emperor's first arrival in India?", o: ["Ani Stuart", "William IV", "Charles I", "King George V"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Habeas Corpus is the writ issued by the Court to bring before a court _________.", o: ["a person from illegal custody", "a person to perform his legal duty", "a tribunal from doing something in excess", "a person who occupies a public office"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "________ refers to relaxation of government restrictions.", o: ["Liberalisation", "Disinvestment", "Privatisation", "Globalisation"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से किस मंत्रालय के पास दिल्ली में गणतंत्र दिवस परेड आयोजित करने की जिम्मेदारी है?", o: ["संस्कृृति मंत्रालय", "नागरिक उड्डयन मंत्रालय", "रक्षा मंत्रालय", "गृह मंत्रालय"], a: 2, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Indian Constitution declares that all laws that are inconsistent with or in derogation of the Fundamental Rights shall be void?", o: ["Article 226", "Article 32", "Article 13", "Article 12"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "U19 T20 Women's World Cup 2023 was organised by _________ .", o: ["England", "New Zealand", "Australia", "South Africa"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Which of the following bodies looked after the various aspects of the Competition Act 2002?", o: ["SEBI", "UPSC", "Competition Commission of India", "Reserve Bank of India"], a: 2, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "In Kabaddi, how many players per team are allowed on the field of play at any one time?", o: ["12", "10", "8", "7"], a: 3, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Three different positions of the same dice are shown. Find the number on the face opposite to the face showing ‘2’.", o: ["1", "4", "3", "5"], a: 3, e: "", qimg: "29nov2023-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'MN' as shown below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s2-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘BATH’ is written as ‘542311’ and ‘FUND’ is written as ‘924177’. How will ‘GOLD’ be written in that language?", o: ["914156", "915157", "1016179", "1018157"], a: 3, e: "", qimg: "" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["+ and ×", "÷ and ×", "− and ×", "− and +"], a: 3, e: "", qimg: "29nov2023-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 15, 24, 42, 78, 150, ?", o: ["5432", "323", "294", "452"], a: 2, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "29nov2023-s2-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "29nov2023-s2-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance from commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: All Mugs are Buckets. Some Mugs are Tumblers. Conclusions: I. All Tumblers are Mugs. II. All Buckets are Tumblers.", o: ["Only conclusion I follows.", "Both conclusions I and II follow.", "Neither conclusion I nor II follows.", "Only conclusion II follows."], a: 2, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'PQ' as shown below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "29nov2023-s2-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "29nov2023-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "29nov2023-s2-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fourth term in the same way as the first term is related to the second term and the fifth term is related to the sixth term. 126 : 14 :: ? : 38 :: 207 : 23", o: ["342", "364", "380", "354"], a: 0, e: "", qimg: "" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third word in the same way as the second word is related to the first word. (The words must be considered as meaningful English words and must not be related to each other based on the number of letters / number of consonants / vowels in the word) Phycology : Algae :: Palaeontology : ?", o: ["Fossils", "Insects", "Plants", "Fungi"], a: 0, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series. H A _ _ E _ _ Y N E H A Y_ _ H _ _ N E", o: ["YHNENEAY", "YHNAEAEY", "YNHANEAY", "YHNANEAY"], a: 2, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the option figure that will replace the question mark (?) in the figure given below to complete the pattern.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "29nov2023-s2-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "29nov2023-s2-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given equation. 7*10*5*6*4*15", o: ["÷, –, ×, +, =", "+, ×, –, ÷, =", "+, ÷, ×, –, =", "+, –, ×, ÷, ="], a: 2, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["18", "16", "15", "14"], a: 2, e: "", qimg: "29nov2023-s2-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Six students are sitting around a circular table facing the centre. Jasbir is an immediate neighbour of both Charan and Jagdish. Chetan is sitting second to the right of Jagdish. Palash is sitting third to the right of Charan. Pankaj is an immediate neighbour of both Charan and Chetan. Who is an immediate neighbour of both Jasbir and Palash?", o: ["Charan", "Chetan", "Pankaj", "Jagdish"], a: 3, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s2-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s2-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "29nov2023-s2-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are NOT related in the same way as are the numbers of the following sets. (7, 245, 7),(8, 200, 5) (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits.)", o: ["(16, 560, 7)", "(6, 270, 9)", "(11, 396, 9)", "(12, 420, 7)"], a: 2, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s2-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "6 boys can complete a work in 18 hours. In how many hours will 16 boys complete the same work?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s2-q-76.png" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the remainder obtained when a prime number greater than 7 is divided by 6?", o: ["3 or 5", "1 or 5", "2 or 3", "2 or 5"], a: 1, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "The monthly income of Amara is ₹80,200. If her income is decreased by 11%, then find her new monthly income (in ₹).", o: ["71,250", "71,500", "71,820", "71,378"], a: 3, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "On a certain sum of money, the difference between the compound interest for a year payable half-yearly, and the simple interest for a year is ₹729. If the rate of interest in both the cases is 6%, then the sum is:", o: ["₹8,50,000", "₹7,90,000", "₹8,10,000", "₹8,30,000"], a: 2, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "29nov2023-s2-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "If the average of 5 consecutive even numbers is 70, then the largest even number is:", o: ["70", "74", "68", "66"], a: 1, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["0.59", "0.70", "0.69", "0.60"], a: 3, e: "", qimg: "29nov2023-s2-q-82.png" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "The area of a triangle is 182 cm2 and the length of one of its sides is 28 cm. What is the length of the perpendicular line segment drawn to this side of the triangle from the opposite vertex (in cm)?", o: ["6.5", "13", "14", "12"], a: 1, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "What number must be added to each term of ratio 3 : 5 so that it may equal to 5 : 6?", o: ["6", "7", "8", "9"], a: 1, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "The price of an article is first decreased by 25% and then increased by 35%. If the resulting price is ₹405, what was the original price of the article?", o: ["₹350", "₹300", "₹450", "₹400"], a: 3, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "29nov2023-s2-q-86.png" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["₹50,000", "₹45,000", "₹60,000", "₹55,000"], a: 2, e: "", qimg: "29nov2023-s2-q-87.png" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "A train travelling at a speed of 54 km/h catches another train travelling in the same direction and then leaves it 70 m behind in 14 seconds. The speed of the second train is:", o: ["54 km/h", "36 km/h", "24 km/h", "48 km/h"], a: 1, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "The annual instalment of ₹750 in 5 years at 5% per annum simple interest will discharge a debt of ______.", o: ["₹4,025", "₹4,215", "₹3,937.5", "₹4,125"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "The marked price of a commodity was ₹2,875. The seller offered a discount of 8% on its sale and still made a profit of 15%. What was the cost price (in ₹) of the commodity?", o: ["2248.25", "2375", "2275.75", "2300"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which folder in an email client is used to store received emails?", o: ["Inbox", "Sent Items", "Drafts", "Outbox"], a: 0, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "What is the primary function of FTP (File Transfer Protocol)?", o: ["Video streaming", "Browsing websites", "Transferring files between computers", "Sending emails"], a: 2, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following options is NOT used to set page margins in MS Word 365?", o: ["Left", "Header", "Bottom", "Right"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365,to enable the edit mode in MS-Excel worksheet, we should follow:", o: ["File > Advanced > Editing options > Options", "File > Options > Editing options", "File > Options > Advanced > Editing options", "File > Advanced > Editing options"], a: 2, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In MS-word 365, the keyboard shortcut Shift + F3 can be used to change the text document as:", o: ["Capitalize Each Word", "Size of Font", "Bold Font", "Highlight Text color"], a: 0, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which of the following functions can be used to display the formula applied to a specific cell?", o: ["=RETFORMULA(Cell_Reference)", "=FORMULATEXT(Cell_Reference)", "=CALLFORMULA(Cell_Reference)", "=TEXTFORMULA(Cell_Reference)"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "Which operation can be used to move the text in a document of MS word 365?", o: ["Cut-paste", "Cut-copy-paste", "Move-paste", "Copy-paste"], a: 0, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "In Microsoft Excel 365, which of the following keyboard shortcuts enables you to save a workbook?", o: ["Ctrl + A", "Ctrl + S", "Ctrl + G", "Ctrl + F"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "What does the menu bar do in MS-Word 365?", o: ["Finds program essential functions", "Displays the title of the software", "It moves the window moving area upside", "Displays the current page number of the document"], a: 0, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "What is the shortcut key for closing the documents in MS-Word 365?", o: ["Ctrl + C", "Ctrl + W", "Ctrl + Alt + S", "Ctrl + B"], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 29 Nov 2023 Shift-2";
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
