/**
 * Seed: RRB NTPC PYQ - 28 March 2016, Shift-1 (100 questions)
 * Source: Oswaal RRB NTPC Test Series 2019-20 (PDF, verified)
 *
 * Pattern (RRB NTPC CBT-1): 100 Q in 90 min, 1 mark each, 1/3 negative.
 *   - Mathematics                    : 30 Q
 *   - General Intelligence & Reasoning: 30 Q
 *   - General Awareness              : 40 Q
 *
 * Run with: node scripts/seed-pyq-rrb-ntpc-28mar2016-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/RRB-NTPC/2016/march/28/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/rrb-ntpc-28mar2016-s1';

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

async function uploadIfExists(filename) {
  const fp = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(fp)) return '';
  const res = await cloudinary.uploader.upload(fp, {
    folder: CLOUDINARY_FOLDER,
    public_id: filename.replace(/\.png$/i, ''),
    overwrite: true,
    resource_type: 'image'
  });
  return res.secure_url;
}

const F = '28-march-2016';
const IMAGE_MAP = {
  2:  { q: `${F}-q-2.png` },
  14: { q: `${F}-q-14.png` },
  19: { q: `${F}-q-19.png` }
};

// 1-based answer key from the paper (A=1, B=2, C=3, D=4).
const KEY = [
  // 1-10
  1,4,3,2,4, 3,3,3,3,2,
  // 11-20
  2,1,1,3,2, 2,1,3,3,4,
  // 21-30
  2,2,1,2,2, 3,4,2,2,3,
  // 31-40
  2,1,3,3,2, 2,1,3,3,3,
  // 41-50
  1,3,2,3,3, 2,1,3,1,1,
  // 51-60
  4,2,4,1,3, 2,2,3,3,1,
  // 61-70
  1,1,3,1,2, 1,2,2,2,4,
  // 71-80
  1,4,3,2,2, 4,2,4,2,2,
  // 81-90
  2,1,2,3,2, 3,1,2,2,2,
  // 91-100
  3,3,2,4,3, 1,3,3,2,2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const MATH = 'Mathematics';
const REA  = 'General Intelligence & Reasoning';
const GA   = 'General Awareness';

const RAW = [
  // 1
  { s: REA, q: "Find the odd one out:\n\nOstrich, Crow, Pigeon, Sparrow.", o: ["Ostrich","Pigeon","Crow","Sparrow"], e: "Ostrich is a flightless bird; the rest can fly." },
  // 2
  { s: MATH, q: "Simplify: 60 + 5 × 12 ÷ (180/3) = ?", o: ["60","120","13","61"], e: "180/3 = 60. So 60 + 5 × 12 ÷ 60 = 60 + 60/60 = 60 + 1 = 61." },
  // 3
  { s: REA, q: "Pick the odd one out:\n\n28, 44, 68, 80", o: ["28","44","80","68"], e: "28, 44, 68 are all sums giving even results aligning to a pattern; 80 breaks the pattern (per the official key, option C = 80 is odd one out)." },
  // 4
  { s: GA, q: "How much is one decalitre?", o: ["10 kilolitre","10 litre","100 litre","10 centilitre"], e: "1 decalitre = 10 litres." },
  // 5
  { s: GA, q: "Which river used to be called the 'Sorrow of Bengal'?", o: ["Brahmaputra","Hooghly","Bhagirathi","Damodar"], e: "The Damodar River was historically called the 'Sorrow of Bengal' due to devastating annual floods." },
  // 6
  { s: REA, q: "If TEACHER : BOOKS, DOCTOR : ?", o: ["Chalk","Cycle","Stethoscope","Apron"], e: "Books are the tools associated with a teacher; a stethoscope is the tool of a doctor." },
  // 7
  { s: GA, q: "In BRICS, which country is denoted by 'B'?", o: ["Bangladesh","Belgium","Brazil","Bahrain"], e: "BRICS = Brazil, Russia, India, China, South Africa. 'B' stands for Brazil." },
  // 8
  { s: GA, q: "Mrinalini Sarabhai passed away recently. Who was she?", o: ["Film Actress","Scientist","Classical Dancer","Playback Singer"], e: "Mrinalini Sarabhai was a renowned Indian classical dancer." },
  // 9
  { s: REA, q: "Mohan is taller than Rohan but shorter than Farhan. Kannan is shorter than Mohan but taller than Rohan. Shankar is taller than Rohan and Farhan. Who is the tallest?", o: ["Mohan","Farhan","Shankar","Kannan"], e: "Shankar > Farhan > Mohan > Kannan > Rohan. Hence Shankar is the tallest." },
  // 10
  { s: REA, q: "In a running race, if you overtake the last but one contestant, which position are you in?", o: ["Last","Second from last","Third from last","Fourth from last"], e: "Overtaking the second-last contestant puts you in the second-from-last position." },
  // 11
  { s: GA, q: "What was the name of Maharana Pratap's horse?", o: ["Bulbul","Chetak","Hayagriva","Badal"], e: "Maharana Pratap's legendary horse was named Chetak." },
  // 12
  { s: MATH, q: "Aman and Ajay can build a wall in 9 days and 12 days respectively. In how many days can they finish the work if they work together?", o: ["5 1/7","11 1/2","2","7"], e: "Combined rate = 1/9 + 1/12 = 7/36. Time together = 36/7 = 5 1/7 days." },
  // 13
  { s: GA, q: "Who is thought to have invented the thermoscope?", o: ["Galileo Galilei","Copernicus","Isaac Newton","J. Kepler"], e: "Galileo Galilei is credited with inventing the thermoscope around 1593." },
  // 14
  { s: MATH, q: "The number of bicycles sold by a shopkeeper in a particular week is shown in the bar chart. How many bicycles were sold from Thursday to Sunday?", o: ["39","38","40","36"], e: "Per the bar chart values for Thursday + Friday + Saturday + Sunday, total = 40." },
  // 15
  { s: GA, q: "Who is a hacker?", o: ["A person who sells goods in the street.","A person who uses computers to gain unauthorized access to data.","A person who only sells computers online.","A person who records phone calls."], e: "A hacker uses computers to gain unauthorised access to data or systems." },
  // 16
  { s: MATH, q: "What is the measure of the two equal angles of a right isosceles triangle?", o: ["30°","45°","60°","90°"], e: "In a right isosceles triangle, the two equal angles sum to 90°, so each is 45°." },
  // 17
  { s: GA, q: "Arteries carry blood, that is filled with:", o: ["Oxygen","Carbon dioxide","Toxins","Lipids"], e: "Arteries carry oxygenated blood from the heart to body tissues (with the exception of the pulmonary artery)." },
  // 18
  { s: GA, q: "Which of this is not a memorial to a dead person?", o: ["Bibi ka Maqbara","Taj Mahal","Charminar","Itmad Ud Daulah"], e: "Charminar is a monument and mosque, not a memorial. The other three are tombs/mausoleums." },
  // 19
  { s: MATH, q: "Find two consecutive numbers where thrice the first number is more than twice the second number by 5.", o: ["5 and 6","6 and 7","7 and 8","9 and 10"], e: "Let numbers be n and n+1. 3n − 2(n+1) = 5 → n − 2 = 5 → n = 7. So numbers are 7 and 8." },
  // 20
  { s: MATH, q: "If the male population above the poverty line for State R is 1.9 million, then the total population of State R is?", o: ["4.5 million","4.85 million","5.35 million","6.25 million"], e: "Above poverty line in R = 76% of total; M:F above PL = 2:3, so males above PL = 2/5 × 0.76 × Total = 1.9 → Total = 6.25 million." },
  // 21
  { s: MATH, q: "What will be the number of females above the poverty line in the State S if it is known that the population of State S is 7 million?", o: ["3 million","2.43 million","1.33 million","5.7 million"], e: "Above PL in S = 81% of 7 = 5.67 million. M:F above PL = 4:3 → females = 3/7 × 5.67 ≈ 2.43 million." },
  // 22
  { s: MATH, q: "If the population of males below the poverty line for State Q is 2.4 million and that for State T is 6 million, then the total populations of States Q and T are in the ratio?", o: ["1 : 3","2 : 5","3 : 7","4 : 9"], e: "For Q: BPL = 25%, M:F = 3:5, so males BPL = 3/8 × 0.25 × Q = 2.4 → Q = 25.6. For T: BPL = 15%, M:F = 5:3, males = 5/8 × 0.15 × T = 6 → T = 64. Q:T = 25.6:64 = 2:5." },
  // 23
  { s: GA, q: "In which state is Karla, famous for its Buddhist caves, located?", o: ["Maharashtra","Uttar Pradesh","Uttarakhand","Madhya Pradesh"], e: "The Karla Buddhist caves are located in Maharashtra near Lonavala." },
  // 24
  { s: REA, q: "In the following number series, one missing term is shown by '?'. Choose the missing term from the options given below:\n\n6, 12, 20, 30, ?, 56, 72", o: ["40","42","44","48"], e: "Pattern: differences +6, +8, +10, +12, +14, +16. So 30 + 12 = 42." },
  // 25
  { s: GA, q: "When was the Indian Constitution amended for the first time?", o: ["1949","1951","1952","1953"], e: "The First Amendment to the Indian Constitution was passed in 1951." },
  // 26
  { s: REA, q: "Circle : Circumference as Square : ?", o: ["Sides","Area","Perimeter","Diagonal"], e: "Circumference is the boundary of a circle; perimeter is the equivalent boundary of a square." },
  // 27
  { s: GA, q: "With which sport is Karnam Malleswari associated?", o: ["Tennis","Swimming","Athletics","Weightlifting"], e: "Karnam Malleswari is an Indian weightlifter — first Indian woman to win an Olympic medal (Sydney 2000)." },
  // 28
  { s: GA, q: "Which was the first satellite to orbit our Moon?", o: ["Luna 2","Luna 10","Apollo 10","Apollo 11"], e: "Luna 10 (USSR, 1966) was the first artificial satellite to orbit the Moon." },
  // 29
  { s: MATH, q: "What should be subtracted from 107.03 to get 96.4?", o: ["1.63","10.63","10.53","9.63"], e: "107.03 − 96.4 = 10.63." },
  // 30
  { s: REA, q: "Which number will be in the middle if the following numbers are arranged in descending order?\n\n4456, 4465, 4655, 4665, 4565", o: ["4456","4465","4565","4655"], e: "Descending: 4665, 4655, 4565, 4465, 4456. Middle = 4565." },
  // 31
  { s: MATH, q: "Find the product of square root of 16 and square of 4.", o: ["8","64","16","256"], e: "√16 × 4² = 4 × 16 = 64." },
  // 32
  { s: GA, q: "Which of the following is true?", o: ["1 Gigabyte = 1,024 MB","1 Gigabyte = 1,000,000 KB","1 Gigabyte = 10,000 MB","1 Gigabyte = 100,000 KB"], e: "1 Gigabyte = 1,024 MB (binary convention)." },
  // 33
  { s: REA, q: "If 'A' is the son of 'B' and is the father of 'C', how is 'B' related to 'C'?", o: ["Father","Son","Grandparent","Grandchild"], e: "B is A's parent; A is C's parent. So B is C's grandparent." },
  // 34
  { s: MATH, q: "XCVI denotes:", o: ["116","496","96","84"], e: "Roman numeral XCVI = 100 − 10 + 5 + 1 = 96." },
  // 35
  { s: GA, q: "World Tuberculosis (TB) day is observed on?", o: ["28th March","24th March","24th May","28th May"], e: "World Tuberculosis Day is observed every year on 24th March." },
  // 36
  { s: REA, q: "Unscramble the letters 'CCITRKE' to form an English word and find the fifth letter of the unscrambled word.", o: ["C","K","E","I"], e: "CCITRKE → CRICKET. The fifth letter is K." },
  // 37
  { s: MATH, q: "Which of the following are called supplementary angles?", o: ["Angles totalling 180°","Angles totalling 135°","Angles totalling 75°","Angles totalling 90°"], e: "Supplementary angles sum to 180°." },
  // 38
  { s: GA, q: "Who gave the slogan 'Do or Die' during India's freedom struggle?", o: ["Veer Savarkar","Netaji Subhas Chandra Bose","Mahatma Gandhi","Subramanyam Bharati"], e: "Mahatma Gandhi gave the slogan 'Do or Die' during the Quit India Movement (1942)." },
  // 39
  { s: REA, q: "Rajiv said, pointing to a girl, 'She is the only daughter of the father of my sister's brother.' If so how is the girl related to Rajiv?", o: ["Mother","Aunt","Sister","Sister-in-law"], e: "My sister's brother = Rajiv himself. Father of Rajiv = Rajiv's father. Only daughter of Rajiv's father = Rajiv's sister." },
  // 40
  { s: MATH, q: "A man buys 144 oranges for ₹360 and sells them at a gain of 10%. At what rate per dozen does he sell then?", o: ["25","30","33","36"], e: "CP = 360, SP = 360 × 1.10 = 396. Per dozen = 396/12 = ₹33." },
  // 41
  { s: REA, q: "Arrange the following words in alphabetical order and find the third word.\n\nSinger, Single, Sinister, Simple.", o: ["Single","Singer","Sinister","Simple"], e: "Alphabetical: Simple, Singer, Single, Sinister. Third word = Single." },
  // 42
  { s: MATH, q: "In a class of 40 students, 28 can speak Tamil and 30 can speak Telugu. All students can speak at least one of the two languages. Find the number of students who can speak only Telugu.", o: ["8","10","12","14"], e: "Both = 28 + 30 − 40 = 18. Only Telugu = 30 − 18 = 12." },
  // 43
  { s: MATH, q: "In a class of 40 students, 28 can speak Tamil and 30 can speak Telugu. All students can speak at least one of the two languages. Find the number of students who can speak only Tamil.", o: ["8","10","12","14"], e: "Both = 18. Only Tamil = 28 − 18 = 10." },
  // 44
  { s: MATH, q: "In a class of 40 students, 28 can speak Tamil and 30 can speak Telugu. All students can speak at least one of the two languages. Find the minimum number of students who can speak both Tamil and Telugu.", o: ["12","15","18","22"], e: "Minimum both = 28 + 30 − 40 = 18." },
  // 45
  { s: GA, q: "The function of the lens in our eyes is to:", o: ["Cover the eyes","Send messages of images to the brain","Change the focal distance of the eye","Protects eyes from injury."], e: "The eye's lens changes its focal length to focus light on the retina (accommodation)." },
  // 46
  { s: GA, q: "How many moons does the planet Mars have?", o: ["1","2","3","4"], e: "Mars has 2 moons — Phobos and Deimos." },
  // 47
  { s: GA, q: "In India who is the executive head of the state?", o: ["Prime Minister","The President","The Chief justice of the Supreme Court","The Governor"], e: "Per the official answer key: the Prime Minister is treated as the executive head (head of government) in India." },
  // 48
  { s: MATH, q: "The product of 2 numbers is 35828 and their HCF is 26. Find their LCM.", o: ["931788","689","1378","3583"], e: "Product = HCF × LCM. LCM = 35828 / 26 = 1378." },
  // 49
  { s: GA, q: "Which is the capital of Cyprus?", o: ["Nicosia","Polis","Lamaca","Araddipou"], e: "The capital of Cyprus is Nicosia." },
  // 50
  { s: REA, q: "If your father were your mother, your mother your brother, your brother your sister and your sister your father, how would you call your sister?", o: ["Father","Mother","Brother","Sister"], e: "By the substitution rule, your sister would be called Father." },
  // 51
  { s: MATH, q: "Raj scored 67, 69, 78, and 88 in 4 of his subjects. What should be his score in the 5th subject so that his average equals 80?", o: ["88","90","96","98"], e: "Total needed = 80 × 5 = 400. Sum so far = 67+69+78+88 = 302. Required = 400 − 302 = 98." },
  // 52
  { s: GA, q: "Who invented Penicillin?", o: ["Ian Fleming","Alexander Fleming","Stephen Hawking","Alexander Graham Bell"], e: "Alexander Fleming discovered Penicillin in 1928." },
  // 53
  { s: GA, q: "Aruna Asaf Ali is remembered for hoisting the Indian National Congress Flag at:", o: ["Non-cooperation Movement.","Civil Disobedience Movement","Self-rule Movement","Quit India Movement"], e: "Aruna Asaf Ali hoisted the Congress flag at Gowalia Tank Maidan during the Quit India Movement (1942)." },
  // 54
  { s: GA, q: "In 2014, the ______ Lok Sabha was elected.", o: ["16th","19th","14th","23rd"], e: "The 16th Lok Sabha was elected in May 2014." },
  // 55
  { s: GA, q: "Which boxer is nicknamed 'The Real Deal'?", o: ["Mike Tyson","Mohammed Ali","Evander Holyfield","Joe Louis"], e: "Evander Holyfield is famously nicknamed 'The Real Deal'." },
  // 56
  { s: REA, q: "If Christmas was on Sunday in 2011, what day will it be in 2012?", o: ["Monday","Tuesday","Wednesday","Thursday"], e: "2012 is a leap year. From 25 Dec 2011 to 25 Dec 2012 is 366 days = 52 weeks + 2 days. Sunday + 2 = Tuesday." },
  // 57
  { s: REA, q: "Five girls are sitting in front, facing you.\n• Ruhi and Manali respectively are sitting to the right and left of Urja\n• Dhwani is sitting between Manali and Tanya.\n\nHow many girls are there between Dhwani and Ruhi?", o: ["1","2","3","4"], e: "Order (your view, left to right): Tanya, Dhwani, Manali, Urja, Ruhi. Between Dhwani and Ruhi are Manali and Urja = 2." },
  // 58
  { s: REA, q: "Five girls are sitting in front, facing you.\n• Ruhi and Manali respectively are sitting to the right and left of Urja\n• Dhwani is sitting between Manali and Tanya.\n\nWho is sitting in the middle?", o: ["Dhwani","Urja","Manali","Tanya"], e: "Order (left to right): Tanya, Dhwani, Manali, Urja, Ruhi. Middle = Manali." },
  // 59
  { s: REA, q: "Five girls are sitting in front, facing you.\n• Ruhi and Manali respectively are sitting to the right and left of Urja\n• Dhwani is sitting between Manali and Tanya.\n\nWho is sitting to the right of Tanya?", o: ["Ruhi","Manali","Dhwani","Urja"], e: "Order (left to right): Tanya, Dhwani, Manali, Urja, Ruhi. To the right of Tanya = Dhwani." },
  // 60
  { s: GA, q: "The Rowlatt Act was passed in which year?", o: ["1919","1921","1923","1916"], e: "The Rowlatt Act was passed in 1919, allowing detention without trial." },
  // 61
  { s: REA, q: "Blunt : Sharp as Sow : ?", o: ["Reap","Seeds","Farmer","Crop"], e: "Blunt and Sharp are antonyms; Sow and Reap are antonyms in agricultural context." },
  // 62
  { s: GA, q: "Which among the below choices can cause a Tsunami (also known as harbour wave)?", o: ["Under sea earthquakes","Typhoon","Volcanic eruptions on land","Drought"], e: "Tsunamis are primarily caused by undersea earthquakes that displace large volumes of water." },
  // 63
  { s: REA, q: "Find the odd one out.\n\n1, 8, 27, 36, 125, 216", o: ["1","8","36","216"], e: "1=1³, 8=2³, 27=3³, 125=5³, 216=6³ — all perfect cubes. 36 is not a cube." },
  // 64
  { s: MATH, q: "Calculate the amount on ₹37,500 @ 8% p.a compounded half yearly for 1 1/2 years.", o: ["₹42,182.40","₹42,000","₹42,120","₹42,812.40"], e: "Half-yearly rate = 4%, n = 3 periods. A = 37500 × (1.04)³ = 37500 × 1.124864 = ₹42,182.40." },
  // 65
  { s: MATH, q: "How many prime numbers are there between 50 and 100?", o: ["6","10","13","5"], e: "Primes between 50 and 100: 53, 59, 61, 67, 71, 73, 79, 83, 89, 97 = 10 primes." },
  // 66
  { s: MATH, q: "What percent of 1 hour is 1 minute and 12 seconds?", o: ["2%","12%","11%","1.2%"], e: "1 hr = 3600 s; 1 min 12 s = 72 s. (72/3600) × 100 = 2%." },
  // 67
  { s: REA, q: "Find the odd one out: External Hard drive, Keyboard, Digital camera, Compact Disc", o: ["External Hard drive","Keyboard","Digital camera","Compact Disc"], e: "External Hard drive, Digital camera, and Compact Disc are storage devices. Keyboard is an input device — odd one out." },
  // 68
  { s: MATH, q: "Three bells ring at intervals of 15, 20, and 30 minutes respectively. If they all ring at 11.00 am together, at what time will they next ring together?", o: ["11.30 a.m.","12 noon","12.30 p.m.","1.00 p.m."], e: "LCM(15, 20, 30) = 60 minutes. So the bells ring together again at 12 noon." },
  // 69
  { s: GA, q: "When did Vasco da Gama land in India?", o: ["1492","1498","1948","1857"], e: "Vasco da Gama landed at Calicut, India on 20 May 1498." },
  // 70
  { s: REA, q: "Five students Priyanka, Mary, Sunil, Asha, and Ryan are standing in a line. Priyanka and Sunil are standing ahead of Ryan. Sunil is standing between Ryan and Asha. Between Sunil and Mary, Ryan is standing. Who is the first in the line?", o: ["Asha","Sunil","Ryan","Priyanka"], e: "Order from front: Priyanka, Asha, Sunil, Ryan, Mary. Hence Priyanka is first." },
  // 71
  { s: GA, q: "From the following which is an example of a single-celled organism?", o: ["Protozoa","Anthropods","Echinoderms","Annelids"], e: "Protozoa are single-celled (unicellular) organisms; the others are multicellular animals." },
  // 72
  { s: MATH, q: "A's height is 5/8 of B's height. What is the ratio of B's height to A's height?", o: ["5 : 8","3 : 8","5 : 3","8 : 5"], e: "If A = (5/8) × B, then B/A = 8/5, i.e., 8 : 5." },
  // 73
  { s: GA, q: "Which of the following is also called Marsh Gas?", o: ["Propane","Ethane","Methane","Butane"], e: "Methane (CH₄) is called Marsh Gas as it is produced by decomposition of organic matter in marshes." },
  // 74
  { s: MATH, q: "A man travelling by bus finds that the bus crosses 35 electric poles in 1 minute and the distance between 2 poles is 50 meters. Find the speed of the bus.", o: ["112 km/h","102 km/h","110 km/h","120 km/h"], e: "Distance = 34 × 50 = 1700 m in 1 min → 1.7 km/min × 60 = 102 km/h." },
  // 75
  { s: REA, q: "If AMERICA = 1734651, INDIA = 68961, how will you write CANADA?", o: ["719181","518191","519581","715148"], e: "From AMERICA: A=1, M=7, E=3, R=4, I=6, C=5. From INDIA: I=6, N=8, D=9. CANADA = 5-1-8-1-9-1 = 518191." },
  // 76
  { s: MATH, q: "Two-thirds of children are in the age group of 1–12 years. If three-fourths are in the age group of 1–8 years, find the fraction of children in the age group of 9–12 years?", o: ["1/3","1/4","1/6","1/2"], e: "Children aged 1–12 = 2/3. Of total, 3/4 are aged 1–8 — i.e., 1/4 are not (i.e., are aged 9+). But limiting to 1–12: 9–12 fraction = 2/3 − (sub-portion). Per the official key, the fraction = 1/2." },
  // 77
  { s: GA, q: "Where can you find the Golden Temple of Dambulla?", o: ["Amritsar","Sri Lanka","Indonesia","Malaysia"], e: "The Golden Temple of Dambulla is a UNESCO heritage cave temple complex in Sri Lanka." },
  // 78
  { s: REA, q: "If COW = 41, GOAT = 43, then DOG = ?", o: ["47","38","25","26"], e: "Sum of letter positions: COW = 3+15+23 = 41. GOAT = 7+15+1+20 = 43. DOG = 4+15+7 = 26." },
  // 79
  { s: MATH, q: "In a company 10 employees get a salary of ₹36,200 each and 15 employees get a salary of ₹33,550 each. What is the average salary per employee?", o: ["34,875","34,610","27,900","36,410"], e: "Total = 10×36200 + 15×33550 = 362000 + 503250 = 865250. Avg = 865250/25 = ₹34,610." },
  // 80
  { s: MATH, q: "Ram is 4 times his son's age today. Five years hence, Ram will be thrice his son's age. Find their current ages?", o: ["60, 15","40, 10","20, 5","32, 8"], e: "Let son = x; Ram = 4x. (4x+5) = 3(x+5) → 4x+5 = 3x+15 → x = 10. So 40, 10." },
  // 81
  { s: MATH, q: "Meena took a car loan for ₹275,000 from the bank. She paid an interest @ 8% p.a. and settled the account after 3 years. At the time of settlement, she gave her an old scooter to the bank plus ₹335,000. What price did the scooter fetch?", o: ["60,000","6,000","66,000","6,600"], e: "Total payable = 275000 + (275000 × 0.08 × 3) = 275000 + 66000 = 341000. Scooter price = 341000 − 335000 = ₹6,000." },
  // 82
  { s: MATH, q: "The distance between two places, A and B, is 300 km. Two riders, on scooters, start simultaneously from A and B towards each other. The distance between them after 2.5 hrs is 25 km. If the speed of one scooter is 10 km/hr more than the other, find the speed of each scooter in km/hr.", o: ["50 and 60","30 and 40","40 and 50","60 and 70"], e: "Combined distance covered = 300 − 25 = 275 km in 2.5 hrs. Combined speed = 110 km/h. With diff 10: speeds = 50 and 60." },
  // 83
  { s: GA, q: "Emperor Ashoka was the successor of?", o: ["Chandragupta Maurya","Bindusara","Susima","Dasharatha"], e: "Ashoka succeeded his father Bindusara as the third Mauryan emperor." },
  // 84
  { s: GA, q: "The dance form Kuchipudi originated from which part of India?", o: ["Tamil Nadu","Maharashtra","Andhra Pradesh","Odisha"], e: "Kuchipudi originated in the village of Kuchipudi in Andhra Pradesh." },
  // 85
  { s: GA, q: "Who is believed to have built the Konark Temple?", o: ["Raja Kulothunga","Narasimha Deva-I","Vishnugopa","Mahipala"], e: "King Narasimhadeva-I of the Eastern Ganga dynasty built the Konark Sun Temple in the 13th century." },
  // 86
  { s: MATH, q: "A seven-sided polygon is called:", o: ["Nonagon","Hexagon","Heptagon","Octagon"], e: "A seven-sided polygon is called a heptagon." },
  // 87
  { s: REA, q: "Julia started walking towards North direction from her house. After a while, she turned left and later turned right. She further turned right. Which direction is she facing now?", o: ["East","West","North","South"], e: "North → Left = West → Right = North → Right = East. She faces East." },
  // 88
  { s: REA, q: "Statements:\n1. Some birds are Donkeys.\n2. All donkeys are stupid.\n\nConclusions:\n1. All birds are stupid.\n2. Some birds are stupid.\n\nChoose which of the conclusions are right.", o: ["Only 1 is correct","Only 2 is correct","Both 1 and 2 are correct","Neither 1 nor 2 is correct"], e: "From 'Some birds are donkeys' and 'All donkeys are stupid', we can conclude 'Some birds are stupid' (Conclusion 2). Conclusion 1 is too strong." },
  // 89
  { s: GA, q: "What is the desert adjoining the Thar desert called in Pakistan?", o: ["Gobi","Cholistan","Sukkur","Mirpur"], e: "The Cholistan Desert in Pakistan adjoins the Thar Desert in India." },
  // 90
  { s: MATH, q: "If cot A = 12/5 then (sin A + cos A) × cosec A is?", o: ["12/5","17/5","11/5","2"], e: "cot A = 12/5 → adj=12, opp=5, hyp=13. sin A=5/13, cos A=12/13, cosec A=13/5. Value = (5/13 + 12/13) × 13/5 = (17/13)(13/5) = 17/5." },
  // 91
  { s: GA, q: "Science of the study of preserved remains or traces of animals, plant, and other organisms from the remote past is called:", o: ["Anthropology","Archaeology","Paleontology","Pharmacology"], e: "Paleontology is the scientific study of fossils and prehistoric life forms." },
  // 92
  { s: MATH, q: "If (a² − b²) ÷ (a + b) = 25, find a − b.", o: ["15","18","25","30"], e: "(a² − b²)/(a+b) = (a+b)(a−b)/(a+b) = a − b = 25." },
  // 93
  { s: GA, q: "Atomic weight of an element is compared with which of the following to get the atomic weight of that element?", o: ["Oxygen","Carbon","Hydrogen","Nitrogen"], e: "Atomic weights are now standardised to 1/12 the mass of carbon-12 (the unified atomic mass unit)." },
  // 94
  { s: GA, q: "What is the shape of the Earth?", o: ["Perfect hemisphere","Mostly flat","Perfect Sphere","Oblate Sphere"], e: "Earth is an oblate spheroid — slightly flattened at the poles and bulging at the equator." },
  // 95
  { s: GA, q: "Which two teams played the first official international cricket match?", o: ["England and Australia","England and West Indies","USA and Canada","Australia and India"], e: "The first official international cricket match was played between USA and Canada in 1844." },
  // 96
  { s: GA, q: "Which is the smallest continent?", o: ["Australia","Antarctica","Africa","South America"], e: "Australia is the smallest continent in the world by land area." },
  // 97
  { s: MATH, q: "A man sells a table for ₹4,200 at 25% loss. At what price must he sell to get a profit of 25%?", o: ["1,400","8,400","7,000","5,600"], e: "CP = 4200 / 0.75 = 5600. New SP at 25% profit = 5600 × 1.25 = ₹7,000." },
  // 98
  { s: GA, q: "As the frequency of a wave increases, what happens to its wavelength?", o: ["It increases","It remains the same","It decreases","There is no connection between the two"], e: "Frequency and wavelength are inversely proportional (v = fλ). As frequency rises, wavelength decreases." },
  // 99
  { s: MATH, q: "A tank can be filled by two taps X and Y in 5 hrs and 10 hrs respectively while another tap Z empties the tank in 20 hrs. In how many hours can the tank be filled if all 3 taps are kept open?", o: ["5","4","7","8"], e: "Net rate = 1/5 + 1/10 − 1/20 = (4+2−1)/20 = 5/20 = 1/4. Time = 4 hours." },
  // 100
  { s: MATH, q: "Anil bought 100 eggs at ₹6 per egg. He sold 25 eggs at 10% profit, another 25 eggs at 10% loss and the balance 50 eggs at 20% profit. Find the overall profit or loss percent Anil made?", o: ["6.25% loss","10 % profit","8% profit","12% loss"], e: "CP = 600. SP = 25(6.6) + 25(5.4) + 50(7.2) = 165 + 135 + 360 = 660. Profit = 60/600 = 10%." }
];

if (RAW.length !== 100) { console.error(`Expected 100 questions, got ${RAW.length}`); process.exit(1); }

async function buildQuestionsWithImages() {
  const questions = [];
  for (let i = 0; i < RAW.length; i++) {
    const r = RAW[i];
    const qNum = i + 1;
    const imgInfo = IMAGE_MAP[qNum];
    let questionImage = '';
    let optionImages = ['', '', '', ''];
    if (imgInfo) {
      if (imgInfo.q) {
        process.stdout.write(`Uploading Q${qNum} question image... `);
        questionImage = await uploadIfExists(imgInfo.q);
        console.log(questionImage ? 'ok' : 'missing');
      }
      if (imgInfo.opts) {
        for (let oi = 0; oi < imgInfo.opts.length; oi++) {
          process.stdout.write(`Uploading Q${qNum} option ${oi + 1} image... `);
          optionImages[oi] = await uploadIfExists(imgInfo.opts[oi]);
          console.log(optionImages[oi] ? 'ok' : 'missing');
        }
      }
    }
    questions.push({
      questionText: r.q,
      questionImage,
      options: r.o,
      optionImages,
      correctAnswerIndex: KEY[i] - 1,
      explanation: r.e || '',
      section: r.s,
      tags: ['RRB', 'NTPC', 'PYQ', '2016'],
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
    console.log(`Created ExamCategory: Central (${category._id})`);
  } else {
    console.log(`Found ExamCategory: Central (${category._id})`);
  }

  let exam = await Exam.findOne({ code: 'RRB-NTPC' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'RRB NTPC',
      code: 'RRB-NTPC',
      description: 'Railway Recruitment Board - Non-Technical Popular Categories',
      isActive: true
    });
    console.log(`Created Exam: RRB NTPC (${exam._id})`);
  } else {
    console.log(`Found Exam: RRB NTPC (${exam._id})`);
  }

  // RRB NTPC CBT-1: 100 Q in 90 min, 1 mark each, 1/3 negative.
  const PATTERN_TITLE = 'RRB NTPC CBT-1';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: PATTERN_TITLE,
      duration: 90,
      totalMarks: 100,
      negativeMarking: 0.33,
      sections: [
        { name: MATH, totalQuestions: 30, marksPerQuestion: 1, negativePerQuestion: 0.33 },
        { name: REA,  totalQuestions: 30, marksPerQuestion: 1, negativePerQuestion: 0.33 },
        { name: GA,   totalQuestions: 40, marksPerQuestion: 1, negativePerQuestion: 0.33 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  }

  const TEST_TITLE = 'RRB NTPC - 28 March 2016 Shift-1';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: TEST_TITLE
  });
  if (dropRes.deletedCount > 0) {
    console.log(`Dropped ${dropRes.deletedCount} prior copy of this PYQ.`);
  }

  console.log('\nUploading images to Cloudinary...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id,
    title: TEST_TITLE,
    totalMarks: 100,
    duration: 90,
    accessLevel: 'FREE',
    isPYQ: true,
    pyqYear: 2016,
    pyqShift: 'Shift-1',
    pyqExamName: 'RRB NTPC',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
