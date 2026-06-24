/**
 * Seed: Delhi Police Constable - Delhi Police Constable - 07 Dec 2017 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_img_e1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-07dec2017-s1';

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

const TAGS = ['Delhi Police', 'Constable', 'PYQ', '2017', "Delhi Police Constable - 07 Dec 2017 Shift-1"];
const RAW = [
  { n: 1, s: "Reasoning / Logical Ability", q: "In the following question, select the related word from the given alternatives. Shirt Garment Necklace : ?", o: ["Neck", "Ornament", "Beads", "Round"], a: 1, e: "", qimg: "" },
  { n: 2, s: "Reasoning / Logical Ability", q: "In the following question, select the related letters from the given alternatives. TULIP ZAROV SCALP ?", o: ["HRIGV", "YIGRV", "PRIHV", "VHPRG"], a: 1, e: "", qimg: "" },
  { n: 3, s: "Reasoning / Logical Ability", q: "In the following question, select the related number from the given alternatives. 5 25 10 ?", o: ["96", "50", "42", "121"], a: 1, e: "", qimg: "" },
  { n: 4, s: "Reasoning / Logical Ability", q: "In the following question, select the odd word from the given alternatives.", o: ["Paragraph", "Word", "Sentence", "Circle"], a: 3, e: "", qimg: "" },
  { n: 5, s: "Reasoning / Logical Ability", q: "In the following question, select the odd letters from the given alternatives.", o: ["ZUPK", "TOJD", "WRMH", "VQLG"], a: 1, e: "", qimg: "" },
  { n: 6, s: "Reasoning / Logical Ability", q: "In the following question, select the odd number pair from the given alternatives.", o: ["10 � 100", "12 � 144", "13 � 171", "15 � 225"], a: 2, e: "", qimg: "" },
  { n: 7, s: "Reasoning / Logical Ability", q: "In the following question, select the odd number pair from the given alternatives.", o: ["6361 � 16", "5921 � 16", "4361 � 14", "2963 � 20"], a: 1, e: "", qimg: "" },
  { n: 8, s: "Reasoning / Logical Ability", q: "How many triangles are there in the given figure?", o: ["3", "4", "5", "6"], a: 2, e: "", qimg: "07dec2017-s1-q-8.png" },
  { n: 9, s: "Reasoning / Logical Ability", q: "How many rectangles are there in the given figure?", o: ["11", "12", "10", "13"], a: 3, e: "", qimg: "07dec2017-s1-q-9.png" },
  { n: 10, s: "Reasoning / Logical Ability", q: "How many surfaces are there in the given figure?", o: ["6", "7", "8", "5"], a: 1, e: "", qimg: "07dec2017-s1-q-10.png" },
  { n: 11, s: "Reasoning / Logical Ability", q: "Three positions of a cube are shown below. What will come opposite to face containing `'?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "07dec2017-s1-q-11.png" },
  { n: 12, s: "Reasoning / Logical Ability", q: "From the given answer figures, select the one in which question figure is hidden / embedded.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "07dec2017-s1-q-12.png" },
  { n: 13, s: "Reasoning / Logical Ability", q: "Which answer figure will complete the pattern in the question figure?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "07dec2017-s1-q-13.png" },
  { n: 14, s: "Reasoning / Logical Ability", q: "If a mirror is placed on the line AB, then which of the answer figure is the right mirror image of the given figure?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "07dec2017-s1-q-14.png" },
  { n: 15, s: "Reasoning / Logical Ability", q: "In the following question, select the number which can be placed at the sign of question mark (?) from the given alternatives. 2 3 4 25 5 7 2 71 156 ?", o: ["31", "33", "37", "43"], a: 0, e: "", qimg: "" },
  { n: 16, s: "Reasoning / Logical Ability", q: "In the given figure, how many books are either old or historic but not both?", o: ["195", "131", "149", "96"], a: 2, e: "", qimg: "07dec2017-s1-q-16.png" },
  { n: 17, s: "Reasoning / Logical Ability", q: "Arrange the given words in the sequence in which they occur in the dictionary.", o: ["Doom", "Down", "Drone", "Drape 5. Ding"], a: 0, e: "", qimg: "" },
  { n: 18, s: "Reasoning / Logical Ability", q: "Identify the diagram that best represents the relationship among the given classes. Circle, Square, Triangle", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "07dec2017-s1-q-18.png" },
  { n: 19, s: "Reasoning / Logical Ability", q: "In the following question below are given some statements followed by some conclusions. Taking the given statements to be true even if they seem to be at variance from commonly known facts. Read all the conclusions and then decide which of the given conclusion logically follows the given statements. Statements: I. All leaves are green. II. Some leaves are hard. Conclusions: I. Some hard are green. II. All green are leaves.", o: ["Only conclusion (I) follows", "Only conclusion (II) follows", "Both conclusion follow", "Neither conclusion (I) nor conclusion (II) follows"], a: 0, e: "", qimg: "" },
  { n: 20, s: "Reasoning / Logical Ability", q: "In the following question below are given some statements followed by some conclusions. Taking the given statements to be true even if they seem to be at variance from commonly known facts. Read all the conclusions and then decide which of the given conclusion logically follows the given statements. Statements: I. All pink are doors. II. All male are doors. Conclusions: I. Some males are pink. II. All doors are pink. III. All pink are males.", o: ["Only conclusion (I) follows", "Only conclusion (II) follows", "Only conclusion (II) and (III) follow", "Neither conclusion follows"], a: 3, e: "", qimg: "" },
  { n: 21, s: "Reasoning / Logical Ability", q: "Pointing towards a man, a lady said, \"He is the son of my husband's brother.\" How is the lady's husband related to the man?", o: ["Son", "Uncle", "Brother", "Husband"], a: 1, e: "", qimg: "" },
  { n: 22, s: "Reasoning / Logical Ability", q: "F is the mother of T. T is the sister of W who is the only son of K. J is the brother of K. How is the mother of W related to K?", o: ["Mother", "Sister", "Wife", "Niece"], a: 2, e: "", qimg: "" },
  { n: 23, s: "Reasoning / Logical Ability", q: "On a certain sum at the rate of 10% per annum, the difference between simple interest for 2 years and the simple interest for 3 years is Rs. 54. What is the value (in Rs.) of sum?", o: ["540", "1080", "720", "480"], a: 0, e: "", qimg: "" },
  { n: 24, s: "Reasoning / Logical Ability", q: "P, Q and R can complete a piece of work in 45, 15 and 5 days respectively. In how may days all three together can complete the same work?", o: ["45/14", "45/13", "9/2", "11/2"], a: 1, e: "", qimg: "" },
  { n: 25, s: "Reasoning / Logical Ability", q: "In the given question, there are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is odd one out.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "07dec2017-s1-q-25.png" },
  { n: 26, s: "Reasoning / Logical Ability", q: "In the given question, there are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is odd one out.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "07dec2017-s1-q-26.png" },
  { n: 27, s: "Reasoning / Logical Ability", q: "In the given question, there are four figures given out of which three are similar in some manner and one is not like the others. Select the figure which is odd one out.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "07dec2017-s1-q-27.png" },
  { n: 28, s: "Reasoning / Logical Ability", q: "In the following question, select the missing number from the given series. 4, 5, 7, 10, 11, 13, 16, ?", o: ["14", "17", "19", "23"], a: 1, e: "", qimg: "" },
  { n: 29, s: "Reasoning / Logical Ability", q: "In the following question, select the missing number from the given series. 5, 3, 8, 11, 19, ?", o: ["43", "37", "25", "30"], a: 3, e: "", qimg: "" },
  { n: 30, s: "Reasoning / Logical Ability", q: "In the following question, select the figure which can be placed at the sign of question mark (?) from the given alternatives.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "07dec2017-s1-q-30.png" },
  { n: 31, s: "Reasoning / Logical Ability", q: "In the following question, select the figure which can be placed at the sign of question mark (?) from the given alternatives.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "07dec2017-s1-q-31.png" },
  { n: 32, s: "Reasoning / Logical Ability", q: "In the following question, select the figure which can be placed at the sign of question mark (?) from the given alternatives.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "07dec2017-s1-q-32.png" },
  { n: 33, s: "Reasoning / Logical Ability", q: "In a certain code language, \"FEARS\" is written as \"HHCUU\". How is \"STAIR\" written in that code language?", o: ["VWLTC", "CLTUW", "UWCLT", "WCTLX"], a: 2, e: "", qimg: "" },
  { n: 34, s: "Reasoning / Logical Ability", q: "In a certain code language, \"ROADS\" is written as \"57\" and \"HORN\" is written as \"55\". How is \"BLOW\" written in that code language?", o: ["46", "48", "47", "52"], a: 3, e: "", qimg: "" },
  { n: 35, s: "Reasoning / Logical Ability", q: "In a certain code language, \"TUNES\" is written as \"16\" and \"FREEZE\" is written as \"11\". How is \"CLIMB\" written in that code language?", o: ["14", "10", "12", "16"], a: 2, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "In India, inflation is measured on the basis of ______.", o: ["Wholesale Price Index", "Producer Price Index", "Consumer price index", "No option is correct"], a: 2, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "The workforce population includes people aged from ______ years to ______ years.", o: ["10, 69", "15, 64", "21, 55", "18, 65"], a: 1, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "In which type of economy there is neither exports nor imports?", o: ["Closed", "Open", "Mixed", "Global"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Which price is declared by the government every year before the sowing season to provide incentives to the farmers for raising the production of their crops?", o: ["Maximum Support Price", "Minimum Support Price", "Maximum Stock Price", "Minimum Stock Price"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "What is an association of workers for the purpose of maintaining or improving the conditions of their employment called as?", o: ["Federation", "Trade Union", "Accord", "Colony"], a: 1, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "______ is the right of a person, party or nation to stop a certain decision or law.", o: ["Strike", "Veto", "Both Strike and Veto", "Neither Strike nor Veto"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "Which part of the Indian Constitution deals with the Municipalities?", o: ["Part IV", "Part V", "Part IX A", "Part X"], a: 2, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Anti-defection law is given in which schedule of Indian Constitution?", o: ["Seventh Schedule", "Eighth Schedule", "Ninth Schedule", "Tenth Schedule"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Which among the following is the most frequently mentioned tax in the inscription of Cholas who ruled in Tamil Nadu?", o: ["Vetti", "Kadamai", "Thari", "Manai"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Chahamanas who ruled over the region around Delhi and Ajmer were later known as _____.", o: ["Chalukyas", "Chauhans", "Cholas", "Chandelas"], a: 1, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "In which session Sarojini Naidu became the first Indian women president of Indian National Congress?", o: ["1922, Gaya", "1925, Kanpur", "1928, Calcutta", "1931, Karachi"], a: 1, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "The period from 1915-47 in India's Freedom Struggle was termed as ______.", o: ["Extremist phase", "Moderate Phase", "Gandhian Phase", "No option is correct"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "What is the name of the Arabic book by Al-Biruni?", o: ["Kitab-ul-Hind", "Hindustan-nama", "Tarikh-e-Hindustan", "Fatawa-e-Hindustani"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "Who started the Shuddhi Movement in India?", o: ["Subhash Chandra Bose", "Swami Dayanand Saraswati", "Chadrashekhar Azad", "Raja Ram Mohan Roy"], a: 1, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "The tropic of cancer passes through how many states of India?", o: ["6", "7", "8", "9"], a: 2, e: "", qimg: "" },
  { n: 51, s: "General Knowledge / Current Affairs", q: "What is the approximate time lag (in hours) from Gujarat to Arunachal Pradesh?", o: ["1", "1.5", "2", "2.5"], a: 2, e: "", qimg: "" },
  { n: 52, s: "General Knowledge / Current Affairs", q: "Which is NOT a part of the Deccan Plateau in the Northeast India?", o: ["The Meghalaya plateau", "Karbi-Anglong plateau", "North Cachar Hills", "The Kaimur Hills"], a: 3, e: "", qimg: "" },
  { n: 53, s: "General Knowledge / Current Affairs", q: "Which vegetation covers the deltas of the Ganga, the Mahanadi, the Krishna, the Godavari and the Kaveri?", o: ["Montane Forest", "Mangrove Forests", "The Thorn Forests", "Tropical Decidous Forest"], a: 1, e: "", qimg: "" },
  { n: 54, s: "General Knowledge / Current Affairs", q: "Anamudi is the highest peak of ______.", o: ["Anaimalai hills", "Nilgiri hills", "Aravalli hills", "Jaintia hills"], a: 0, e: "", qimg: "" },
  { n: 55, s: "General Knowledge / Current Affairs", q: "Which state is largest producer of jute in India?", o: ["Bihar", "Assam", "Odisha", "West Bengal"], a: 3, e: "", qimg: "" },
  { n: 56, s: "General Knowledge / Current Affairs", q: "Each centimeter has ten equal divisions called ______.", o: ["Meter", "Micrometer", "Decimeter", "Millimeter"], a: 3, e: "", qimg: "" },
  { n: 57, s: "General Knowledge / Current Affairs", q: "Translucent objects are the objects through which we ______.", o: ["Cannot see at all", "Can see clearly", "Can see but not very clearly", "No option is correct"], a: 2, e: "", qimg: "" },
  { n: 58, s: "General Knowledge / Current Affairs", q: "A thin wire that gives off light from the bulb is called ______.", o: ["Terminal", "Tip", "Source", "Filament"], a: 3, e: "", qimg: "" },
  { n: 59, s: "General Knowledge / Current Affairs", q: "Which among the following is the reproductive part of a plant?", o: ["Root", "Stem", "Flower", "Fruit"], a: 2, e: "", qimg: "" },
  { n: 60, s: "General Knowledge / Current Affairs", q: "When a disease-carrying microbe enters our body, the body produces ______ to fight the microbe.", o: ["Antigen", "Antibodies", "Antibiotics", "Anti Allergenic"], a: 1, e: "", qimg: "" },
  { n: 61, s: "General Knowledge / Current Affairs", q: "Which man-made fibre is obtained from wood pulp?", o: ["Nylon", "Rayon", "Silk", "Polyster"], a: 1, e: "", qimg: "" },
  { n: 62, s: "General Knowledge / Current Affairs", q: "Which chemical is used to test whether substance is acidic or basic?", o: ["Indicator", "Promoter", "Catalyst", "Neutraliser"], a: 0, e: "", qimg: "" },
  { n: 63, s: "General Knowledge / Current Affairs", q: "Presence of which among the following is essential for rusting? I. Water (or water vapour) II. Oxygen", o: ["Only I", "Only II", "Both I and II", "Neither I nor II"], a: 2, e: "", qimg: "" },
  { n: 64, s: "General Knowledge / Current Affairs", q: "Which is NOT an example of one-sided symbiotic relationship?", o: ["Cattle egrets and cattle", "A hermit crab and an empty seashells", "A spider on a tree", "Tapeworm in host's stomach"], a: 3, e: "", qimg: "" },
  { n: 65, s: "General Knowledge / Current Affairs", q: "What does the sum total of the populations of the same kind of organisms called?", o: ["Kingdom", "Class", "Phylum", "Species"], a: 3, e: "", qimg: "" },
  { n: 66, s: "General Knowledge / Current Affairs", q: "Which is a new scheme named 'Saubhagya' to carry out electrification of all households in India?", o: ["Pradhan Mantri Safal Ujjwal Bhagya Yojana", "Pradhan Mantri Sahaj Bijli Har Ghar Yojana", "Pradhan Mantri Samridh Ujala Bhagyashree Yojana", "No option is correct"], a: 1, e: "", qimg: "" },
  { n: 67, s: "General Knowledge / Current Affairs", q: "The Government of which state will merge its existing seven health schemes to launch a unified scheme � Arogya Bhagya?", o: ["Karnataka", "Maharashtra", "Meghalaya", "Odisha"], a: 0, e: "", qimg: "" },
  { n: 68, s: "General Knowledge / Current Affairs", q: "Which country's scientists have successfully created the world's shortest x-ray laser pulse?", o: ["Sweden", "Bulgaria", "Norway", "Switzerland"], a: 3, e: "", qimg: "" },
  { n: 69, s: "General Knowledge / Current Affairs", q: "Which space agency has launched Joint Polar Satellite System-1 into space on November 18, 2017?", o: ["Indian Space Research Organisation", "China National Space Administration", "National Aeronautics and Space Administration", "Russia State Corporation for Space Activities"], a: 2, e: "", qimg: "" },
  { n: 70, s: "General Knowledge / Current Affairs", q: "India's Sundar Singh Gurjar won Gold medal in which event at World Para Athletics, 2017?", o: ["Javelin throw", "Long jump", "Discus throw", "High Jump"], a: 0, e: "", qimg: "" },
  { n: 71, s: "General Knowledge / Current Affairs", q: "India's Mithali Raj became first women cricketer to score _____ career runs in Women's One Day International Cricket.", o: ["5000", "6000", "7000", "8000"], a: 1, e: "", qimg: "" },
  { n: 72, s: "General Knowledge / Current Affairs", q: "In which country India has designated Zorinpui Land Check post as an authorized immigration check post?", o: ["Myanmar", "Bangladesh", "Bhutan", "Nepal"], a: 0, e: "", qimg: "" },
  { n: 73, s: "General Knowledge / Current Affairs", q: "What is the name of India-Nepal joint military exercise whose 12th edition was held from 3 to 16 September 2017 in Nepal?", o: ["Sampriti", "Surya-kiran", "Indra", "Prabal"], a: 1, e: "", qimg: "" },
  { n: 74, s: "General Knowledge / Current Affairs", q: "Author of the novel named 'Lincoln in the Bardo' has won which literary award in 2017?", o: ["Pulitzer Prize", "Man Booker Prize", "European Union Prize", "Giller Prize"], a: 1, e: "", qimg: "" },
  { n: 75, s: "General Knowledge / Current Affairs", q: "In which field Richard H. Thaler has won 2017 Nobel Prize?", o: ["Economic Sciences", "Literature", "Physics", "Chemistry"], a: 0, e: "", qimg: "" },
  { n: 76, s: "General Knowledge / Current Affairs", q: "What is the name of Google's digital payment app launched on September 18, 2017?", o: ["Tez", "Veg", "Kranti", "Bhim"], a: 0, e: "", qimg: "" },
  { n: 77, s: "General Knowledge / Current Affairs", q: "Who is the head of the Economic Advisory Council to the Prime Minister Constituted on September 25, 2017?", o: ["Ashima Goyal", "Ratan Watal", "Bibek Debroy", "Surjit Bhalla"], a: 2, e: "", qimg: "" },
  { n: 78, s: "General Knowledge / Current Affairs", q: "Which is the 15th country to ratify the Solar Alliance Framework Agreement?", o: ["Somalia", "Tuvalu", "Fiji", "Guinea"], a: 3, e: "", qimg: "" },
  { n: 79, s: "General Knowledge / Current Affairs", q: "Which is the last country to join the Paris Climate Agreement in November 2017?", o: ["Fiji", "Syria", "Afghanistan", "Ghana"], a: 1, e: "", qimg: "" },
  { n: 80, s: "General Knowledge / Current Affairs", q: "Which Metro system is the world's first completely green Metro system?", o: ["Hong Kong Mass Transit Railway", "Singapore Mass Rapid Transit", "Delhi Metro Rail Corporation", "London Underground"], a: 2, e: "", qimg: "" },
  { n: 81, s: "General Knowledge / Current Affairs", q: "On November 1, 2017, the Energy Efficiency Services Limited (EESL), under the Ministry of Power, launched \"Creating and Sustaining Markets for Energy Efficiency Project\" in partnership with ______.", o: ["World Wildlife Fund (WWF)", "Global Environment Facility (GEF)", "Green Climate Fund (GCF)", "World Resources Group (WRG)"], a: 1, e: "", qimg: "" },
  { n: 82, s: "General Knowledge / Current Affairs", q: "Who among the following has been re-elected on November 21, 2017 as a member of International Court of Justice?", o: ["Dalveer Bhandari", "Hishashi Owada", "Peter Tomka", "Ronny Abraham"], a: 0, e: "", qimg: "" },
  { n: 83, s: "General Knowledge / Current Affairs", q: "On November 10, 2017 Audrey Azoulay was appointed as the new Director General of which United Nation body?", o: ["WHO", "UNICEF", "UNDP", "UNESCO"], a: 3, e: "", qimg: "" },
  { n: 84, s: "General Knowledge / Current Affairs", q: "The ninth BRICS summit, 2017 was organized in which city of China?", o: ["Suzhou", "Xian", "Hongkong", "Xiamen"], a: 3, e: "", qimg: "" },
  { n: 85, s: "General Knowledge / Current Affairs", q: "Which country is at the top of the eighth edition of the World Giving Index compiled in October, 2017 by the 'Charities Aid Foundation'?", o: ["United States of America", "Australia", "Myanmar", "China"], a: 2, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "The sum of a positive number and its cube is 10. What is the value of the number?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the value of 13 + 23 + ...... 93?", o: ["477", "565", "675", "776"], a: 0, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the value of 1 + 2 ? 3 1+ 1 2+ 2", o: ["10/11", "7/11", "21/11", "12/11"], a: 2, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the Highest Common Factor of 14, 42 and 84?", o: ["2", "7", "14", "1"], a: 2, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "2 2 What is the value of (1.27) -(1.05) ? 0.22", o: ["0.22", "2.22", "2.32", "2.42"], a: 2, e: "", qimg: "" },
  { n: 91, s: "Numerical Ability (Quantitative Aptitude)", q: "If 80% of P = 2/5 of Q, then what is P : Q?", o: ["2:1", "1 : 2", "1 : 4", "4 : 1"], a: 1, e: "", qimg: "" },
  { n: 92, s: "Numerical Ability (Quantitative Aptitude)", q: "The annual income of Rahul and Mohit are in the ratio 17 : 12 and the ratio of their expenditure is 5 :", o: ["24000", "21000", "If each of them saves Rs 9000 yearly, then what will be the annual income (in Rs) of Mohit?", "34000"], a: 0, e: "", qimg: "" },
  { n: 93, s: "Numerical Ability (Quantitative Aptitude)", q: "12 persons have Rs. 49 on an average. If a person with Rs. 55.5 join them, then what will be the new average (in Rs)?", o: ["49.5", "50", "49.75", "50.25"], a: 0, e: "", qimg: "" },
  { n: 94, s: "Numerical Ability (Quantitative Aptitude)", q: "What will be the simple interest (in Rs) on a sum of Rs. 4000 for 6 years at the rate of 8% per annum?", o: ["2020", "1920", "2080", "1860"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Numerical Ability (Quantitative Aptitude)", q: "Vyom purchased 30 dozen pens at the rate Rs. 48 per dozen. He sold 10 dozen at 20% profit and the remaining 20 dozen at 10% profit. What is his profit percentage?", o: ["13.33", "15.17", "25", "20"], a: 0, e: "", qimg: "" },
  { n: 96, s: "Numerical Ability (Quantitative Aptitude)", q: "The cost price of an article is 64% of the marked price. What will be the gain percentage after allowing a discount of 12% on the marked price?", o: ["25", "37.5", "33.33", "40"], a: 1, e: "", qimg: "" },
  { n: 97, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of the outer and the inner perimeter of a circular path is 14 : 11. If path is 15 meters wide, then what is the radius (in metres) of the inner circle?", o: ["70", "33", "35", "55"], a: 3, e: "", qimg: "" },
  { n: 98, s: "Numerical Ability (Quantitative Aptitude)", q: "A boat covers 20 km upstream and 40 km downstream distance in 4 hours, while it covers 70 km upstream and 60 km downstream distance in 10 hours. What is the speed (in km/hr) of the current?", o: ["10", "15", "5", "12.5"], a: 2, e: "", qimg: "" },
  { n: 99, s: "Numerical Ability (Quantitative Aptitude)", q: "P started a business by investing Rs. 60000. After 4 months Q joined the business by Investing Rs. 80000. After 4 more months, R joined the business by investing Rs. 100000. What will be the ratio of profits of P, Q and R at end of 2 years?", o: ["9 : 11 : 10", "9 : 12 : 10", "12 : 14 : 15", "9 : 10 : 10"], a: 3, e: "", qimg: "" },
  { n: 100, s: "Numerical Ability (Quantitative Aptitude)", q: "S and V can do a work in 12 days. M and S can do the same work in 16 days. M and V can do the same work in 24 days. In how many days S, V and M together can complete the same work?", o: ["32/3", "10", "16/3", "11 100 Questions"], a: 0, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 07 Dec 2017 Shift-1";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2017,
    pyqShift: "Delhi Police Constable - 07 Dec 2017 Shift-1", pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
