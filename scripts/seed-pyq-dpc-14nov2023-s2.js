/**
 * Seed: Delhi Police Constable - 14 Nov 2023 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc14nov2023_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-14nov2023-s2';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 14 Nov 2023 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Who was defeated by Chandragupta Maurya in order to found the Maurya dynasty?", o: ["Dhana Nanda.", "Bimbisara", "Mahapadma Nanda", "Ajatshatru"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Any dispute between the Government of India and one or more States or between the Government of India and any State or States comes under ___________________ jurisdiction of the Supreme Court of India.", o: ["Advisory", "Appellate", "Exclusive Original", "Writ"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Kajli Teej is the cultural festival of which Indian state?", o: ["Rajasthan", "Goa", "West Bengal", "Maharashtra"], a: 0, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "In whose presence does the Governor take oath or make affirmation in case of the absence of the Chief Justice of the High Court?", o: ["Nominated judge by President", "Secretary of State Legislature", "Senior-most judge of High Court available", "Speaker of State legislature"], a: 2, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "What is the slogan of the Pradhan Mantri Jan Dhan Yojana?", o: ["MeraAdhikar, MeraKhaata", "MeraKhaata, MeraAdhikar", "Mera Paisa, Mere Bank Me", "Mera Khaata, Bhagya Vidhaata"], a: 3, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "According to Census 2011 of India, which religion recorded highest literacy rate from following?", o: ["Hindu", "Muslim", "Jain", "Sikh"], a: 2, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "In 1932, the Poona Pact was signed between Mahatma Gandhi and _________.", o: ["C. Natesa Mudaliar", "Taravath Madhavan Nair", "Ramaswami Naicker-Periyar", "Dr. Babasaheb Ambedkar"], a: 3, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "In which year did India adopt a dual exchange rate for the interim period?", o: ["1994", "1990", "1996", "1992"], a: 3, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "The Hindi novel ‘Indrajal’ is written by:", o: ["Ramdhari Singh Dinkar", "Harivansh Rai Bachchan", "Jaishankar Prasad", "Namvar Singh"], a: 2, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Rafflesia arnoldii is famous because:", o: ["it has the thickest trunk", "it has the largest leaves in the plant kingdom", "it is the tallest plant in the plant kingdom", "it has the largest flower in the plant kingdom"], a: 3, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "National Investment Fund in India is a corpus fund that mobilises its financial receipts from _____________.", o: ["proceeds of profits of Central Public Sector Undertakings", "proceeds from disinvestment of Central Public Sector Undertakings", "savings of General Provident Fund", "contributory pension scheme"], a: 1, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "When did India host the Asian Games for the first time?", o: ["1951", "1954", "1962", "1990"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Destruction, weathering, dissolving, rainfall, and lithification are the major geological processes that contribute to the formation of which of the following rocks?", o: ["Igneous rocks", "Sedimentary rocks", "Sub-metamorphic rocks", "Metamorphic rocks"], a: 1, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Which of the following statements are correct regarding festivals followed in Christianity? A. Easter is the day celebrated for the ‘Resurrection of Jesus Christ’. B. According to the Bible, ‘Three days after Jesus was crucified, he was resurrected’. C. Good Friday is to commemorate the day of crucifixion of Jesus Christ.", o: ["A and C only", "B and C only", "A, B and C", "A and B only"], a: 2, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a key player in the microfinance sector?", o: ["IDBI", "Regional rural banks", "Small finance banks", "Commercial banks"], a: 0, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "The Begumpuri mosque was built during the reign of Sultan ___________.", o: ["Ghiyasuddin Balban", "Qutbuddin Aybak", "Muhammad Bin Tughluq", "Jalaluddin Khalji"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "R Muthukannammal was conferred the Padma Shri award in 2022. Which of the following is her contribution?", o: ["Working with Orissa’s poor and backward communities", "Specializing in the study of Indian society", "Being a custodian of the early dance form of Bharatnatyam", "Playing a key role in powering India’s Blue Revolution"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Which of the following ministries collaborated with NCERT on a joint mission for the NISHTHA capacity-building programme for Eklavya school teachers and principals?", o: ["Ministry of Skill Development and Entrepreneurship", "Ministry of Minority Affairs", "Ministry of Education", "Ministry of Tribal Affairs"], a: 3, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "What is the molecular mass of an ozone molecule?", o: ["32", "48", "16", "18"], a: 1, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "The famous south Indian epic “Silappadikaram” was originally written in ________ language.", o: ["Sanskrit", "Tamil", "Malayalam", "Telugu"], a: 1, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Jhali is the folk dance of which Indian state?", o: ["Uttar Pradesh", "Madhya Pradesh", "Bihar", "Himachal Pradesh"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Musician Bhajan Sopori was a Santoor maestro from the ______________ Gharana.", o: ["Maihar", "Benaras", "Punjab", "Sufiana"], a: 3, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a feature of India’s parliamentary government?", o: ["Dissolution of the Rajya Sabha", "Presence of nominal and real executives", "Membership of the ministers in the legislature", "Majority party rule"], a: 0, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "The Harappan city of Dholavira was divided into how many parts?", o: ["2", "4", "3", "5"], a: 2, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Identify the crop which is grown in Rabi season in North India from the following.", o: ["Rice", "Cotton", "Gram", "Bajra"], a: 2, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "‘Freedom is my birth right and I shall have it’. Who among the following said this?", o: ["Lala Lajpat Rai", "Bal Gangadhar Tilak", "Aurobindo Ghosh", "Bipin Chandra pal"], a: 1, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "The first battle of Panipat was fought between Babur and _________ .", o: ["Ibrahim Lodhi", "Maharana Pratap", "Muhammad bin Tughlaq", "Sikandar Lodhi"], a: 0, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "The period between two FIFA Football World Cups is ________.", o: ["3 years", "5 years", "4 years", "6 years"], a: 2, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Ajita Srivastava is a famous folk singer from _________ and she received the Padma Shri in 2022.", o: ["Maharashtra", "Gujarat", "Madhya Pradesh", "Uttar Pradesh"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "The Katakhal, Jiri, Chiri, Modhura, Longai, Sonai, Rukni and Singla are the main tributaries of which river?", o: ["Chambal", "Barak", "Damodar", "Ghaghra"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "In India, which mode of transport provide door to door services?", o: ["Waterways", "Road transport", "Railways", "Airways"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "A novel based on the story of a family named ‘Fasting, Feasting’ was written by whom among the following?", o: ["Anita Desai", "Arundhati Roy", "Arvind Adiga", "Kiran Desai"], a: 0, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Pradhan Mantri Awas Yojana–Urban (PMAY-U) was launched in the year ________ by the Government of India.", o: ["2021", "2015", "2017", "2019"], a: 1, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Indian Constitution is related with provision for just and humane conditions of work and maternity relief?", o: ["Article 42", "Article 45", "Article 44", "Article 43"], a: 0, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "Article 39A of the Constitution of India gives the idea of:", o: ["right to work, to education and to public assistance in certain cases", "provisions for just and humane conditions of work", "living wage, etc., for workers", "equal justice and free legal aid"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Who is the Head of the Secretariat of each house of the Parliament?", o: ["Speaker", "Secretary General", "President", "Deputy Speaker"], a: 1, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "According to the census of India 2011, which group of states from the following recorded the highest population?", o: ["Maharashtra and Bihar", "Tamil Nadu and Karnataka", "West Bengal and Madhya Pradesh", "Bihar and West Bengal"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which of the following dances of South India is known as peacock dance?", o: ["Garadi", "Padayani", "Mayilattam", "Kummi"], a: 2, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Which of the following statements about Indian river systems is correct?", o: ["The Mahanadi river flows through the state of Chhattisgarh only.", "Godavari river flows through Haryana state.", "Yamuna River is a tributary of Ganga River.", "Sone River originates in Punjab."], a: 2, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Which of the following statements is true with regard to preference given in most Five- Year Plans in India?", o: ["Extensive Promotion of private sector entrepreneurship", "Control of prices", "Regulation of financial sector", "Investment in basic and heavy industries"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "When was Singer and Nicolson's fluid mosaic model accepted as the foundational model for the interpretation of existing data on membrane proteins and lipids, and their dynamics?", o: ["1952", "1972", "1942", "1982"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "How many temples and monasteries are there in Ellora caves?", o: ["18", "29", "34", "23"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Which of the following gave the British Indian government enormous powers to repress political activities, and allowed the detention of political prisoners without trial for two years?", o: ["Indian Slavery Act", "Rowlatt Act", "Indian Contract Act", "Negotiable Instruments Act"], a: 1, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Autotrophs can fix _______.", o: ["carbon dioxides", "carbon monoxide", "methane", "oxygen"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Who among the following was the first President of the Indian Olympic Association (IOA)?", o: ["Sir Dorabji Tata", "Dr. AG Noehren", "Raja Bhalender Singh", "Maharaja Bhupinder Singh"], a: 0, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Ram Sahay Panday got Padma Shri for promoting the dance form “Raai” from Bundelkhand region. Which State does this dance form belong to?", o: ["Rajasthan", "Madhya Pradesh", "Bihar", "Chhattisgarh"], a: 1, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Reserve Bank of India (RBI) was established on:", o: ["1 April 1945", "1 April 1925", "1 April 1955", "1 April 1935"], a: 3, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से किसने मध्य भारत में चमड़ा श्रमिकों की बेहतरी के लिए सतनामी आंदोलन शुरू किया था?", o: ["बी.आर. अंबेडकर", "महात्मा गांधी", "गुरु घासीदास", "स्वामी विवेकानंद"], a: 2, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "In a volleyball game, ‘libero’ is a ________.", o: ["specialised defensive player", "blocking expert", "specialised attacking player", "smashing expert"], a: 0, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "The parliamentary system of the Government in India is based on the pattern of which of the following Parliamentary Governments?", o: ["Russian", "Canadian", "USA", "British"], a: 3, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "14nov2023-s2-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Six numbers 1, 2, 3, 4, 5 and 6 are written on different faces of a dice. Two positions of this dice are shown in the figure. Find the number on the face opposite to 2.", o: ["3", "4", "1", "6"], a: 0, e: "", qimg: "14nov2023-s2-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14nov2023-s2-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct? 156 ÷ 12 − 4 × 65 + 87 = 74", o: ["+ and −", "= and ×", "× and −", "+ and ="], a: 2, e: "", qimg: "" },
  { n: 55, s: "Reasoning / Logical Ability", q: "छह दोस्त - A, B, C, D, E और F - एक वृत्ताकार मेज के परितः मेज के केंद्र की ओर मुख करके बैठे थे। वे एक दूसरे से समान दूरी पर बैठे थे। A, B के दाएं तीसरे स्थान पर बैठा था। E, D के ठीक बाएं बैठा था। A, F और D के ठीक बीच में बैठा था। निम्नलिखित में से कौन D के बाएं तीसरे स्थान पर बैठा था?", o: ["C", "E", "A", "F"], a: 0, e: "", qimg: "" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding/deleting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is NOT allowed) (39, 130, 13) (45, 150, 15)", o: ["(39, 120, 17)", "(25, 60, 12)", "(35, 125, 10)", "(40, 75, 15)"], a: 2, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Which of the following terms will replace the question mark (?) in the given series? MAF, PCG, SEH, ?, YIJ", o: ["UFI", "RHI", "WHI", "VGI"], a: 3, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) in the following series to continue the pattern?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14nov2023-s2-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘WAR’ is written as ‘39’ and ‘ZIP’ is written as ‘30’. How will ‘YES’ be written in that language?", o: ["36", "34", "32", "37"], a: 2, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Three different positions of the same dice are shown. Find the number on the face opposite to the face showing ‘4’.", o: ["2", "5", "6", "1"], a: 3, e: "", qimg: "14nov2023-s2-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "14nov2023-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, even if it appears to be at variance with commonly known facts, decide which of the given conclusions logically follow(s) from the statements. Statements: Some shoes are shirts. All shirts are jackets. Conclusions: I. Some shoes are jackets. II. All jackets are shoes.", o: ["Only conclusion II follows", "Only conclusion I follows", "Neither conclusion I nor II follows", "Both conclusions I and II follow"], a: 1, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fourth number in the same way as the first number is related to the second number and the fifth number is related to the sixth number. 17 : 69 :: ? : 109 :: 21 : 85", o: ["40", "27", "37", "31"], a: 1, e: "", qimg: "" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["30", "28", "24", "32"], a: 0, e: "", qimg: "14nov2023-s2-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at 'AB' as shown.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "14nov2023-s2-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Three different positions of the same dice are shown, the faces of which are marked with the letters A, B, C, D, E and F. Select the letter that will be on the face opposite to the face having the letter ‘D’.", o: ["F", "A", "C", "B"], a: 3, e: "", qimg: "14nov2023-s2-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster. YDVJ : PHMN :: FJBE : WNSI :: PXYS : ?", o: ["PLEX", "GMNA", "JFBT", "GBPW"], a: 3, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "14nov2023-s2-q-68.png" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Six letters A, B, C, D, E and F are written on different faces of a dice. Two different positions of this dice are shown in the figure. Select the letter that will be on the face opposite to the one having E.", o: ["D", "C", "F", "A"], a: 0, e: "", qimg: "14nov2023-s2-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the number from the given options that can replace the question mark (?) in the following series. 40, 50, 30, 60, 20, ?", o: ["40", "70", "50", "80"], a: 1, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14nov2023-s2-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14nov2023-s2-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Three numbers, 1, 2 and 3, and three letters, X, Y and Z, are written on the different faces of a dice. Two positions of this dice are shown in the given figure. Find the letter/number on the face opposite to Y.", o: ["X", "Z", "3", "1"], a: 3, e: "", qimg: "14nov2023-s2-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "14nov2023-s2-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given expression. 13 * 7 * 32 * 56 * 4 * 73", o: ["+, ×, –, ÷, =", "×, –, +, ÷, =", "–, ÷, +, ×, =", "–, ×, +, ÷, ="], a: 1, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["0.092", "0.0081", "0.27", "1.8"], a: 0, e: "", qimg: "14nov2023-s2-q-76.png" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "A, B and C can complete a piece of work in 8, 10 and 12 days, respectively. In how many days would all of them complete the same work, working together?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "14nov2023-s2-q-77.png" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "A solid copper sphere of diameter 30 cm is drawn into a wire of diameter 10 cm. Find the length of the wire (in cm).", o: ["180", "120", "240", "300"], a: 0, e: "", qimg: "" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "If 45% of Ram’s money is added to 50% of Soham’s money, then the total amount will be 86% of Soham’s money. What percentage of Ram’s money did Soham have?", o: ["137%", "85%", "125%", "95%"], a: 2, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the product of the 5th prime number and the prime number immediately greater than 100?", o: ["1067", "1717", "1111", "1261"], a: 2, e: "", qimg: "" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["225", "250", "275", "200"], a: 0, e: "", qimg: "14nov2023-s2-q-81.png" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "The initial population of a country is 1,87,500. If the birth and the death rates are 13% and 9%, respectively, then find the population of the country after 2 years.", o: ["2,02,700", "2,02,900", "2,03,000", "2,02,800"], a: 3, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "A trip to a destination is made in the following way: a) 550 km by train at an average speed of 55 km/h b) 4500 km by plane at an average speed of 500 km/h c) 400 km by boat at an average speed of 25 km/h d) 55 km by auto at an average speed of 35 km/h What is the average speed for the entire journey?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "14nov2023-s2-q-83.png" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["4", "3", "7", "2"], a: 3, e: "", qimg: "14nov2023-s2-q-84.png" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "If the price of tea goes up by 28%, then by what percentage (correct to the nearest whole number) should its consumption be reduced so that the expenditure on it remains unchanged?", o: ["22%", "27%", "21%", "28%"], a: 0, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the area of a triangle (in \"cm2\" ) having sides of length 24 cm, 17 cm and 9 cm?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "14nov2023-s2-q-86.png" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "If marked price is 75% more than the cost price and a discount of 40% is allowed on the marked price, then percentage profit is:", o: ["5%", "8%", "3%", "7%"], a: 0, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the average of the first five composite numbers.", o: ["7.8", "6.8", "8.2", "7.4"], a: 3, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "A vertical pole of length 8.3 m casts a shadow of length 4.15 m. Find the height of the tree that casts a 40 m long shadow under similar conditions (in m).", o: ["60", "70", "100", "80"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Arun bought 150 guavas for ₹525 and sold them at the rate of ₹36 per dozen. What is the profit or loss percentage of Arun (correct up to two decimal places)?", o: ["16.67% Loss", "14.29% Profit", "16.67% Profit", "14.29% Loss"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following is the foundation of data communication on the web, enabling the transfer of web page content?", o: ["Hypertext Transfer Protocol", "Domain Name Server", "World Wide Web", "Uniform Resource Locator"], a: 0, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "एमएस वर्ड 365 (MS Word 365) से संबंधित निम्न कथनों के आधार पर कौन-सा विकल्प सही है? 1) Ctrl + X का उपयोग डॉक्‍यूमेंट को कॉपी करने के लिए किया जाता है। 2) Ctrl+V का उपयोग डॉक्‍यूमेंट को मूव करने के लिए किया जाता है।", o: ["दोनों (1) और (2)", "केवल (1)", "न तो (1) और न ही (2)", "केवल (2)"], a: 2, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following shortcut keys is used in MS Excel 365 to make the cell in edit mode, allowing you to make changes?", o: ["Ctrl + F1", "F1", "F2", "Ctrl + F2"], a: 2, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "एमएस एक्सेल 365 (MS Excel 365) का निम्नलिखित में से कौन-सा फ़ंंक्शन, प्रत्येक वैल्‍यू (value) के बीच एक स्पेस को छोड़ते हुए अनियमित स्पेस को हटाता है?", o: ["AVERAGE", "SUM", "VLOOKUP", "TRIM"], a: 3, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "MS-Word 365 में निम्नलिखित में से किस विकल्प से आप चयनित टेक्स्ट के फ़ॉन्ट साइज़ को, फ़ॉन्ट साइज़ सूची में उपलब्ध अगले बड़े साइज़ में परिवर्तित कर सकते हैं?", o: ["इटैलिक्स", "बोल्ड", "फ़ॉन्ट साइज़ बढ़ाएँ", "फ़ॉन्ट साइज़ कम करें"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, what is the term for the area that contains specific and formatted data in MS Excel for printing?", o: ["View", "Print preview", "Print area", "Print margin"], a: 2, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "In MS Word 365 What is the primary purpose of using bullets and numbering in document formatting?", o: ["To indicate the importance of specific text.", "To organize information into lists or sequences.", "To adjust the margins and spacing of the document.", "To highlight text with a different font or colour."], a: 1, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following is an example of a table style in Microsoft Word 365?", o: ["Chicago Manual of Style", "Plain Grid", "MLA (Modern Language Association)", "APA (American Psychological Association)"], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "निम्नलिखित में से कौन-सा, यूजर्स के बीच संदेशों के आदान-प्रदान के लिए एक कंप्यूटर-आधारित एप्लिकेशन है?", o: ["ई-मेल (Email)", "क्रोम (chrome)", "बिंग (Bing)", "मोज़िला (Mozilla)"], a: 0, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "नया खाली डॉक्यूमेंट बनाने का तरीका निम्नलिखित में से कौन-सा है?", o: ["एमएस-एक्सेल", "एमएस आउटलुक", "एमएस-पावरप्वाइंट", "एमएस-वर्ड"], a: 3, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 14 Nov 2023 Shift-2";
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
