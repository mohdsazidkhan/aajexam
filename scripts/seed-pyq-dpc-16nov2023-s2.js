/**
 * Seed: Delhi Police Constable - 16 Nov 2023 Shift-2
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc16nov2023_s2');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-16nov2023-s2';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 16 Nov 2023 Shift-2"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "The sale of car results in __________.", o: ["decrease in sale of final products", "no change", "decrease in GDP", "increase in GDP"], a: 3, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "As of October 2022, fire altars are primarily found in which of the following Harappan cities?", o: ["Rakhigarhi", "Banawali", "Mohenjo-Daro", "Kalibangan"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Which of the following will NOT be included in the estimation of national income? (i) Expenses on electricity by a factory (ii) Financial help to earthquake victims (iii) Imputed value of production for self-consumption (iv) Brokerage on sale of bonds", o: ["Both (iii) and (iv)", "All of (i), (ii), (iii) and (iv)", "Both (i) and (ii)", "None of (i), (ii), (iii) and (iv)"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Which of the following is the hardest mineral?", o: ["Gypsum", "Talc", "Calcite", "Diamond"], a: 3, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "In which year was the city of Agra founded?", o: ["1404", "1204", "1504", "1304"], a: 2, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "What is the approximate percentage of adolescents (10-19 years) in India as per Census 2011?", o: ["22.6%", "18.3%", "24.3%", "20.9%"], a: 3, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Industrial Licensing is compulsory for five industries. Which of the following is NOT one of those five industries?", o: ["Cottage Industries", "Industrial Explosives", "Alcohol", "Cigarettes"], a: 0, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Kunbi is the folk dance of which Indian state?", o: ["Jharkhand", "Goa", "Tamil Nadu", "Bihar"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT generally used in milk adulteration?", o: ["Urea", "Starch", "Saw dust", "Detergent"], a: 2, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "The maximum duration of a test match of cricket is ________ days.", o: ["five", "two", "four", "three"], a: 0, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Sultan Azlan Shah Cup is held in _________ .", o: ["Malaysia", "Iran", "India", "Indonesia"], a: 0, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "King Kanishka was a famous ruler of which Indian dynasty?", o: ["Hind Unani", "Kushan", "Satavahana", "Shaka"], a: 1, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "Name the autobiography written by Hillary Clinton, as an account of her eight years as the first lady of the United States.", o: ["Living History", "In the Shadow of Man", "My Life, My Truth", "Express Yourself"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Kumaradevi, a Lichchhavi princess, was married to whom among the following Gupta kings?", o: ["Chandragupta I", "Srigupta", "Chandragupta II", "Samudragupta"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Under which Act was the Central Legislature made of two houses?", o: ["Government of India Act, 1935", "Government of India Act, 1919", "Government of India Act, 1947", "The Indian Councils Act, 1909"], a: 1, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Identify the iron and steel plant that was developed in collaboration with Germany.", o: ["Durgapur", "Visvesvaraya", "Rourkela", "Salem"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "From which of the following years did the fourth five-year plan commence?", o: ["1969", "1964", "1966", "1963"], a: 0, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "_______ grows well on well-drained fertile soils in the flood plains of India where soils are renewed every year.", o: ["Natural silk", "Jute", "Saffron", "Bajra"], a: 1, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Which Committee made recommendations for the inclusion of fundamental duties in the Indian Constitution?", o: ["Sardar Swaran Singh Committee", "AP Jain Committee", "PK Wattal Committee", "John Mathai Committee"], a: 0, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Pradhan Mantri Kisan Maan Dhan Yojana is a government scheme meant for old age protection and social security of Small and Marginal Farmers (SMF). It provides for an assured Pension of _________ .", o: ["₹5,000 month", "₹3,000 month", "₹1,000 month", "₹6,000 month"], a: 1, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "Who among the following social reformers was the inspiration behind the establishment of Prarthana Samaj in 1867?", o: ["Raja Ram Mohan Roy", "Keshab Chandra Sen", "Durgaram Mehta", "Shiv Narayan Agnihotri"], a: 1, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "What are the paired organs of balance commonly found in aquatic invertebrates which are usually fluid-filled vesicles with sensory hairs?", o: ["Statocysts", "Nephridia", "Radula", "Pharynx"], a: 0, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Natpuja dance is the folk dance of _________.", o: ["Bihar", "Punjab", "Uttar Pradesh", "Assam"], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "Sulochana Chavan is a celebrated _________ singer who was awarded the Padma award in 2022.", o: ["Carnatic", "Lavani", "Ghazal", "Sufi"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "________is the first Indian woman to have won a Grammy.", o: ["Tanvi Shah", "Neeti Mohan", "Neha Bhasin", "Monali Thakur"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "The Chairman and members of the State Public Service Commission are appointed by the __________________.", o: ["Governor", "President of India", "State Assembly", "Chief Minister"], a: 0, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "To Kill a Mockingbird’, an English novel, was written by which of the following authors?", o: ["Doris Lessing", "Harper Lee", "Muriel Spark", "Joseph Heller"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Who among the following established the Ramakrishna Mission in 1897?", o: ["Swami Dayananda Saraswati", "Swami Shraddananda", "Swami Vivekananda", "Swami Acchutananda"], a: 2, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "‘Lent’ is a religious observance celebrated by the people who practice the ________ religion.", o: ["Buddhist", "Jain", "Sikh", "Christian"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "What does the E stand for in SEZ?", o: ["Economically", "External", "Economic", "Export"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "r-selected species have maximum:", o: ["reproductive rate", "mortality rate", "survival rate", "parental care"], a: 0, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Rahul decided to take a walk through a forest early in the morning. While he was inside the dense forest, he could see the beautiful sunrays through the small gaps within trees and clearly see the path taken by those rays. Of which effect was this a result?", o: ["Reflection", "Diffraction", "Dispersion", "Tyndall effect"], a: 3, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "‘Food, Work and Productivity’ were the focus of which Five-Year Plan?", o: ["Ninth Five-Year Plan", "Fifth Five-Year Plan", "Seventh Five-Year Plan", "Fourth Five-Year Plan"], a: 2, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "The Afghan noble Khan Jahan Lodi rebelled against the Mughal emperor ___________ and was defeated.", o: ["Bahadur Shah", "Shah Jahan", "Aurangzeb", "Muhammad Azam Shah"], a: 1, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "According to the census of India 2011, which group of states has the highest sex ratio?", o: ["Kerala and Tamil Nadu", "Kerala and Andhra Pradesh", "Andhra Pradesh and Chhattisgarh", "Tamil Nadu and Bihar"], a: 0, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "Which of the following Fundamental Duties is mentioned first in the Constitution of India?", o: ["To uphold and protect the sovereignty, unity and integrity of India", "To cherish and follow the noble ideals which inspired our national struggle for freedom", "To defend the country and render national service when called upon to do so", "To abide by the Constitution and respect its ideals and institutions, the National Flag and the National Anthem"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "Which of the following denotes the ideals that the state should keep in mind while formulating policies and enacting laws?", o: ["Directive Principles Of State Policy", "Preamble", "Fundamental Right", "Fundamental Duties"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Dr. Shyama Prasad Mukherjee Swimming Pool Complex is located at:", o: ["Bangalore", "Kolkata", "New Delhi", "Patiala"], a: 2, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Arrange the following Fundamental Duties in sequential order according to their mention in the Constitution of India. A. To abide by the Constitution and respect its ideals and institutions. B. To uphold and protect the sovereignty, unity and integrity of India. C. To cherish and follow the noble ideals which inspired our national struggle for freedom. D. To safeguard public property and to abjure violence.", o: ["B, A, D, C", "A, D, C, B", "A, C, B, D", "A, B, C, D"], a: 2, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Summer Olympics 1948, when Indian hockey team won gold medal was held in which of the following cities?", o: ["Tokyo", "Los Angeles", "Rome", "London"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Champaner-Pavagadh Archaeological Park is situated in which of the following states of India?", o: ["Bihar", "Rajasthan", "Haryana", "Gujarat"], a: 3, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "In which year was Project Tiger launched in India to conserve the declining number of tigers?", o: ["1987", "1973", "1981", "1970"], a: 1, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Public Distribution System was relaunched by Government of India as ____________in 1997.", o: ["Targeted Public Distribution System", "Targeted People Distribution System", "Cooperative Public Distribution System", "Public Food Distribution System"], a: 0, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Who is the first law officer of the Government of India?", o: ["Law Commissioner", "Law Minister", "The Advocate-General for the State", "Attorney General of India"], a: 3, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "What are sea salt, pollen, ash, smoke soot and fine soil associated with?", o: ["Gases", "Dust particles", "Water vapour", "Meteors"], a: 1, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Sangeet Natak Akademi award winner Guru Bipin Singh is a famous _________ dancer.", o: ["Manipuri", "Mohiniattam", "Odissi", "Sattriya"], a: 0, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "The ________Tableau won 'People's Choice Award' at the 74th Republic Day Parade.", o: ["Tripura", "Uttarakhand", "Gujarat", "Kerala"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Sitara Devi and Lachhu Maharaj are popular for their mastery in which of the following styles of Indian dance?", o: ["Manipuri", "Kuchipudi", "Bharatanatyam", "Kathak"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Who is the head of the government among the following?", o: ["President", "Speaker", "Vice President", "Prime Minister"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Who among the following was the founder of Satyashodhak Samaj, a society dedicated towards eradicating caste injustice?", o: ["Bal Gangadhar Tilak", "Periyar Erode Venkata Ramasamy", "Jyotirao Govindrao Phule", "Mahatma Ayyankali"], a: 2, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given equation. 66*3*11*12*230", o: ["×, –, =, ÷", "–, ×, ÷, =", "÷, ×, –, =", "×, –, ÷, ="], a: 2, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "16nov2023-s2-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown below. Choose a figure which would most closely resemble the unfolded form of the paper.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "16nov2023-s2-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "16nov2023-s2-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "16nov2023-s2-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Six letters, M, N, O, P, Q and R are written on different faces of a dice. Three positions of this dice are shown here. Find the letter on the face opposite N.", o: ["M", "P", "R", "O"], a: 0, e: "", qimg: "16nov2023-s2-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "In a code language, if SMILE is coded as RLHKD and BELIEVE is coded as ADKHDUD, then how will LAUGHTER be coded?", o: ["NCWIJVGT", "MBVHIUFS", "MBHVIFSU", "KZTFGSDQ"], a: 3, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "16nov2023-s2-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: All insects are birds. Some birds are fishes. Conclusions: I. All fishes are insects. II. Some fishes are insects.", o: ["Only conclusion II follows", "Neither conclusion I nor II follows", "Both conclusions I and II follow", "Only conclusion I follows"], a: 1, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct? 23 × 7 − 76 + 87 ÷ 344 = 2", o: ["× and ÷", "÷ and =", "× and −", "+ and ×"], a: 1, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "16nov2023-s2-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster. EGAK : WKSO :: JRCU : BVUY :: CLAG : ?", o: ["USPC", "IHAL", "UPSK", "IHEN"], a: 2, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "16nov2023-s2-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Six letters, D, E, F, G, H and I are written on different faces of a dice. Three positions of this dice are shown here. Find the letter on the face opposite E.", o: ["F", "D", "G", "I"], a: 1, e: "", qimg: "16nov2023-s2-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "16nov2023-s2-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["13", "11", "10", "12"], a: 1, e: "", qimg: "16nov2023-s2-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Muskan, Amrita, Pranjali, Deepti, Riya and Sonali are six friends sitting around a circle facing the centre. Muskan is between Amrita and Pranjali. Amrita is opposite to Deepti. Riya is not the immediate neighbour of Amrita. Who is opposite to Sonali?", o: ["Deepti", "Riya", "Muskan", "Pranjali"], a: 3, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fourth term in the same way as the first term is related to the second term and the fifth term is related to the sixth term. 144 : 12 :: ? : 25 :: 216 : 18", o: ["280", "260", "300", "250"], a: 2, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series. A Q _ _ S A _ W E _ A _ _ E S _ Q W _ S", o: ["WESQWAWE", "WEQSQWAE", "WEQSQAWE", "WSQSQAWE"], a: 1, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Six letters, U, V, W, X, Y and Z are written on different faces of a dice. Three positions of this dice are shown here. Find the letter on the face opposite X.", o: ["Z", "V", "U", "W"], a: 2, e: "", qimg: "16nov2023-s2-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the given sets. (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g., 13 – Operations on 13 such as adding/ deleting/ multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed. (205, 146, 87) (333, 274, 215)", o: ["(222, 169, 123)", "(230, 181, 137)", "(188, 129, 70)", "(180, 130, 71)"], a: 2, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "16nov2023-s2-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "A square sheet of paper is folded along the dotted line successively along the directions shown and is then punched in the last. How would the paper look when unfolded?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "16nov2023-s2-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "16nov2023-s2-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 2, 15, 41, 93, 197, ?", o: ["324", "405", "320", "534"], a: 1, e: "", qimg: "" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "The concentration of three wines A, B, and C is given as 15%, 30%, and 45%, respectively. They are mixed in the ratio of p : 5 : 3, resulting in a 30% concentration solution. What is the value of p?", o: ["2", "3", "1", "4"], a: 1, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "The radius of a sphere is 1.8 cm. Find the exact volume (in cm3) of this sphere.", o: ["7.776 π", "7.676 π", "7.786 π", "7.766 π"], a: 0, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["5", "3", "4", "6"], a: 3, e: "", qimg: "16nov2023-s2-q-78.png" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "Simplify the following. (8888 ÷ 88) ÷ 5", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "16nov2023-s2-q-79.png" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["780.50 m2", "750.50 m2", "850.50 m2", "800.50 m2"], a: 2, e: "", qimg: "16nov2023-s2-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the HCF of 3.6, 0.54 and 1.08.", o: ["1.8", "0.018", "0.18", "18"], a: 2, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A man borrows ₹2,196 and agrees to return it with compound interest at the rate of 25% in three equal annual instalments at the end of the first, second and the third year. The amount of instalment (in ₹) is:", o: ["1,125", "984", "1,072", "732"], a: 0, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "16nov2023-s2-q-83.png" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Find the time taken by a train 750 m long to cross a platform twice its length at a speed of 81 km/h.", o: ["80 sec", "90 sec", "100 sec", "75 sec"], a: 2, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "A number y, when reduced by 25%, becomes 120% of a second number z. What percentage of z is y?", o: ["160%", "145%", "175%", "150%"], a: 0, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum was invested at a certain rate of simple interest per annum for 2 years. Had it been invested at 3% per annum more rate than the existing rate, the simple interest accrued in the 2 years would have been ₹240 more. The sum invested was:", o: ["₹16,000", "₹4,000", "₹24,000", "₹6,000"], a: 1, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Deepak sold a bike to Sharath at a profit of 40%. Sharath sold his bike to Sivaji at a loss of 30%. If Deepak paid ₹8,000 for this bike, then find the cost price of the bike for Sivaji.", o: ["₹6,728", "₹7,840", "₹5,423", "₹11,200"], a: 1, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "The marked price of a book is ₹767. A shopkeeper allows a discount of 20% and still earns a profit of 30%. Find the cost price of the book (in ₹).", o: ["680", "450", "472", "525"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "P aims to get total 360 marks out of 500. He gets 5% less than his target. How much does he get?", o: ["335", "325", "340", "330"], a: 0, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "If A and B together can complete a work in 15 days, B and C together in 12 days and C and A together in 10 days, then in how many days can B alone complete the work?", o: ["30", "45", "35", "40"], a: 3, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which of the following is the correct sequence for deleting a column in MS-Excel spreadsheet?", o: ["Select the cell<<Right click<<Delete<<Entire Row", "Select the cell<<Left click<<Delete<<Entire Row", "Select the cell<<Right click<<Delete<<Entire Column", "Select the cell<<Left click<<Delete<<Entire Column"], a: 2, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "Which of the following is a shortcut key for Save as option in MS Word 365?", o: ["F1", "F11", "F12", "F2"], a: 2, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "What is the purpose of the ‘Font Color’ option in Microsoft Word 365?", o: ["Changing the font style", "Changing the font size", "Applying a background colour to text", "Changing the colour of the text"], a: 3, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which menu tab on Microsoft Word's 365 ribbon contains options for text formatting and editing?", o: ["File", "Home", "View", "Insert"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which of the following is NOT a method to open a spreadsheet in MS- Excel?", o: ["Shift + Ctrl + N", "Alt + F + O", "Ctrl + N", "File -> open"], a: 0, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "Which of the following is a common element in an MS Word 365 document's header or footer?", o: ["Document title", "Bullet points", "Page number", "Font colour"], a: 2, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "What information is typically required to sign in to an email client?", o: ["Full name and date of birth", "Email address and password", "Social media account details", "Phone number and address"], a: 1, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365 which of the following statements related to deleting rows in an excel sheet is correct?", o: ["If you want to delete multiple rows at once, simply select the rows by clicking and dragging over the row numbers, and then press ‘Ctrl’ and ‘space’.", "If you want to delete multiple rows at once, simply select the rows by clicking and dragging over the row numbers, and then press ‘Ctrl’ and ‘−‘.", "If you want to delete multiple rows at once, simply select the rows by clicking and dragging over the row numbers, and then press ‘Ctrl’ and ‘+’.", "If you want to delete multiple rows at once, simply select the rows by clicking and dragging over the row numbers, and then press ‘Ctrl’ and ‘Enter’."], a: 1, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following shortcut keys is used to copy formatting in MS Word 365?", o: ["Ctrl + Shift + A", "Ctrl + Shift + D", "Ctrl + Shift + C", "Ctrl + Shift + V"], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "Which of the following services allows users to buy and sell products online?", o: ["Instant messaging", "E-commerce", "Video conferencing", "Streaming"], a: 1, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 16 Nov 2023 Shift-2";
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
