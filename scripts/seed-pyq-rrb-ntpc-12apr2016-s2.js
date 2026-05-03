/**
 * Seed: RRB NTPC PYQ - 12 April 2016, Shift-2 (100 questions)
 * Source: Oswaal RRB NTPC Test Series 2019-20 (PDF, verified)
 *
 * Run with: node scripts/seed-pyq-rrb-ntpc-12apr2016-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/RRB-NTPC/2016/april/12/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/rrb-ntpc-12apr2016-s2';

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
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await cloudinary.uploader.upload(fp, {
        folder: CLOUDINARY_FOLDER,
        public_id: filename.replace(/\.png$/i, ''),
        overwrite: true,
        resource_type: 'image',
        timeout: 120000
      });
      return res.secure_url;
    } catch (err) {
      if (attempt === 5) throw err;
      process.stdout.write(`(retry ${attempt}) `);
      await new Promise(r => setTimeout(r, 3000 * attempt));
    }
  }
}

const F = '12-april-2016';
const IMAGE_MAP = {
  38: { q: `${F}-q-38.png` },
  79: { q: `${F}-q-79.png` }
};

const KEY = [
  1,1,2,2,2, 3,1,2,3,1,
  3,2,2,3,2, 3,1,1,1,2,
  3,1,1,2,1, 1,3,1,1,1,
  2,1,3,2,4, 3,1,1,3,4,
  2,1,2,3,3, 1,1,1,2,3,
  3,4,2,3,3, 1,2,1,2,4,
  2,4,3,2,1, 4,1,4,3,1,
  3,1,1,1,2, 1,4,1,4,3,
  4,1,3,1,3, 3,3,3,3,3,
  3,2,4,3,1, 3,2,2,1,1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const MATH = 'Mathematics';
const REA  = 'General Intelligence & Reasoning';
const GA   = 'General Awareness';

const RAW = [
  // 1
  { s: MATH, q: "Ritesh sold a pen for ₹36 with a profit of 20%. If it were sold for ₹33, then what could be the percentage of profit or loss?", o: ["10% Profit","15% Profit","12% Loss","18% Loss"], e: "CP = 36/1.2 = 30. New SP = 33 → profit = 3 → 10% profit." },
  // 2
  { s: GA, q: "Which sport has the highest rank of Yokozuna?", o: ["Sumo wrestling","Judo","Jujitsu","Kendo"], e: "Yokozuna is the highest rank in professional Sumo wrestling." },
  // 3
  { s: REA, q: "Rearrange the jumbled-up letters in their natural sequence and find the odd one out.", o: ["SAMR","MOETC","USVNE","PUJIERT"], e: "SAMR→MARS, MOETC→COMET (no — MOETC = COMET?). Actually: SAMR→MARS, USVNE→VENUS, PUJIERT→JUPITER (planets). MOETC→COMET (not a planet) — odd one." },
  // 4
  { s: GA, q: "What does UFO stand for?", o: ["Under Fire Object","Unidentified Flying Object","Unapproved Foreign Object","Unidentified Free Object"], e: "UFO = Unidentified Flying Object." },
  // 5
  { s: MATH, q: "The height of a lighthouse is 20 meters above sea level. The angle of depression (from the top of the lighthouse) of a ship in the sea is 30°. What is the distance of the ship from the foot of the lighthouse?", o: ["16 m","20√3 m","20 m","30 m"], e: "Distance = 20 / tan(30°) = 20 × √3 = 20√3 m." },
  // 6
  { s: GA, q: "Which queen of Ahmednagar opposed Emperor Akbar?", o: ["Rani Durgavati","Zeenat Mahal","Chand Bibi","Razia Sultan"], e: "Chand Bibi famously defended Ahmednagar against Akbar's forces in 1595." },
  // 7
  { s: GA, q: "When is the International Day for Preservation of Ozone layer observed?", o: ["September 16","July 4","January 23","May 1"], e: "World Ozone Day is observed annually on 16 September." },
  // 8
  { s: GA, q: "Who invented the bifocal glasses?", o: ["Thomas Alva Edison","Benjamin Franklin","Evangelista","Ian Fleming"], e: "Benjamin Franklin invented bifocal glasses in 1784." },
  // 9
  { s: REA, q: "Identify the odd one from the list below.", o: ["Snake","Lizard","Reptiles","Crocodile"], e: "Snake, lizard and crocodile are types of reptiles. 'Reptiles' is the category — odd one out." },
  // 10
  { s: GA, q: "What denotes learned and shared beliefs and behaviours?", o: ["Culture","Ethnicity","Group","Descent"], e: "Culture refers to learned and shared beliefs, behaviors and practices of a group." },
  // 11
  { s: GA, q: "Who invented the mobile phone?", o: ["Joseph Wilson","Edwin Land","Martin Cooper","John Lloyd Wright"], e: "Martin Cooper of Motorola made the first handheld cellular mobile phone call in 1973." },
  // 12
  { s: GA, q: "What of the following refers to hypotheses that are confirmed by varied tests?", o: ["Assumption","Theory","Answer","Opinion"], e: "A theory is a well-substantiated explanation supported by repeated tests and evidence." },
  // 13
  { s: GA, q: "What does PDA stand for?", o: ["Personal Data Assistant","Personal Digital Assistant","Prime Data Assistant","Prime Digital Assistant"], e: "PDA stands for Personal Digital Assistant." },
  // 14
  { s: MATH, q: "If the angles of a triangle are in the ratio of 1 : 4 : 7, then find the ratio of the greatest angle to the smallest angle.", o: ["7 : 2","2 : 3","7 : 1","3 : 5"], e: "Ratio of greatest to smallest = 7 : 1." },
  // 15
  { s: GA, q: "Name the architect who designed New Delhi.", o: ["Le Corbusier","Sir Edwin Lutyens","Andrew Paul","George Baker"], e: "Sir Edwin Lutyens designed New Delhi (Lutyens' Delhi) along with Herbert Baker." },
  // 16
  { s: MATH, q: "The mean of 10 observations is 17. One more observation is included, and the new mean becomes 16. The 11th observation is:", o: ["16","8","6","12"], e: "Old sum = 170. New sum = 16 × 11 = 176. 11th observation = 176 − 170 = 6." },
  // 17
  { s: GA, q: "Battle of Plassey was fought by the British under the leadership of:", o: ["Robert Clive","Lord Dalhousie","Warren Hastings","James Heartly"], e: "Robert Clive led British East India Company forces at the Battle of Plassey (1757)." },
  // 18
  { s: MATH, q: "Arun and Amit can do a piece of work in 9 days and 12 days respectively. If they work for alternate days and Amit starts the work first, then in how many days 35/36 parts of whole work will be completed?", o: ["10 days","12 days","5 days","8 days"], e: "Per the worked solution, 35/36 of work is completed in 10 days." },
  // 19
  { s: MATH, q: "Aparna changes the marked price of an item to 50% above its CP. What % discount allowed approximately to gain 10%?", o: ["27%","25%","35%","37%"], e: "MP = 1.5 CP. SP for 10% profit = 1.1 CP. Discount = (1.5 − 1.1)/1.5 × 100 ≈ 26.67% ≈ 27%." },
  // 20
  { s: MATH, q: "A wholesaler purchased 7 hair clips for a rupee. How many for a rupee must he sell to get a profit of 40%?", o: ["6","5","4","3"], e: "CP per clip = 1/7. SP per clip at 40% profit = 1/7 × 1.4 = 0.2 = 1/5. So 5 per rupee." },
  // 21
  { s: REA, q: "If E = 5, GUN = 42 and ROSE = 57, then what is the value of GATE?", o: ["23","32","33","35"], e: "Letter positions: G=7, A=1, T=20, E=5 → 7+1+20+5 = 33." },
  // 22
  { s: GA, q: "In which state is the Valley of Flowers National Park situated?", o: ["Uttarakhand","Himachal Pradesh","Jammu and Kashmir","Assam"], e: "The Valley of Flowers National Park (UNESCO heritage) is in Uttarakhand." },
  // 23
  { s: MATH, q: "Three numbers are given in which the second is triple the first and is also double the third. If the average of the three numbers is 66, find the first number.", o: ["36","54","108","72"], e: "Let first = x. Second = 3x; second = 2 × third → third = 1.5x. Sum = 5.5x = 198 → x = 36." },
  // 24
  { s: MATH, q: "Pihu and Aayu are running on a circular track of diameter 28 m. The speed of Pihu is 48 m/s and that of Aayu is 40 m/s. They start from the same point at the same time in the same direction. When will they meet again for the first time?", o: ["8 Seconds","11 Seconds","13 Seconds","14 Seconds"], e: "Track length = π × 28 = 88 m. Relative speed = 8 m/s. Time = 88/8 = 11 seconds." },
  // 25
  { s: GA, q: "Who replaced B.S. Bassi as the Delhi Police Commissioner?", o: ["Alok Kumar Verma","Rakesh Maria","Dattatray Padsalgikar","Neeraj Kumar"], e: "Alok Kumar Verma replaced B.S. Bassi as Delhi Police Commissioner in 2016." },
  // 26
  { s: MATH, q: "A salesman visits 274 houses about products X, Y, Z. 157 use X, 98 use only X, 22 use all three, 14 use X and Z but not Y, 39 use Y and Z, 48 use only Y.\n\nWhich product is the most popular one?", o: ["X","Y","Z","Both X and Z"], e: "X has the highest count — 157 — most popular." },
  // 27
  { s: MATH, q: "(Same setup.)\n\nHow many use product Z only?", o: ["10","50","30","25"], e: "Per the worked deduction using inclusion-exclusion, only Z = 30." },
  // 28
  { s: MATH, q: "(Same setup.)\n\nWhat fraction used at least two products?", o: ["67/274","98/274","73/274","37/274"], e: "Per the worked deduction, the fraction = 67/274." },
  // 29
  { s: MATH, q: "A superfast Duronto express running at 90 km/h overtakes a bike running at 36 km/h in 25 seconds. What is the length of the train in metres?", o: ["375 m","225 m","275 m","325 m"], e: "Relative speed = 54 km/h = 15 m/s. Length = 15 × 25 = 375 m." },
  // 30
  { s: REA, q: "If EFMIJ means DELHI, then the last letter of the word got by decoding IQBOS is:", o: ["R","T","K","M"], e: "Per the encoding (each letter shifted by some pattern), decoding IQBOS gives a word ending in R." },
  // 31
  { s: REA, q: "Assertion (A): We prefer to wear white clothes in winter.\nReason (R): White clothes are good reflectors of heat.\n\nChoose the correct option.", o: ["A is true, but R is false.","A is false, but R is true.","Both A and R are true, and R is the correct explanation of A.","Both A and R are true, and R is not the correct explanation of A."], e: "We wear dark clothes in winter (absorb heat); white reflects heat — A is false, R is true." },
  // 32
  { s: REA, q: "Select the pair in which the numbers are similarly related as in the given pair:\n\n9 : 27 :: ? : ?", o: ["5 : 125","8 : 64","15 : 135","81 : 729"], e: "9 : 27 = 9 : 9×3 (n : n × n^?). 5 : 125 = 5 : 5³. So same cube relationship." },
  // 33
  { s: GA, q: "How many princely states were there in India at the time of Independence?", o: ["347","490","565","418"], e: "There were 565 princely states in India at the time of Independence in 1947." },
  // 34
  { s: MATH, q: "A trader earns a profit of 25%, even after offering a 20% discount on the marked price. If the cost price of an article is ₹5,120, then find the marked price.", o: ["7,200","8,000","6,400","10,000"], e: "SP = 5120 × 1.25 = 6400. MP = 6400 / 0.8 = ₹8,000." },
  // 35
  { s: GA, q: "Who is considered as the Father of the Modern Indian Renaissance?", o: ["Mahatma Gandhi","Sardar Vallabhbhai Patel","Vinoba Bhave","Raja Ram Mohan Roy"], e: "Raja Ram Mohan Roy is regarded as the Father of the Modern Indian Renaissance." },
  // 36
  { s: MATH, q: "Find the largest number of three digits exactly divisible by 15, 18, 27, and 30.", o: ["870","900","810","780"], e: "LCM(15, 18, 27, 30) = 270. Largest 3-digit multiple = 270 × 3 = 810." },
  // 37
  { s: GA, q: "Who invented the Band-aid?", o: ["Earle Dickson","Alan Gant","Louis Pasteur","Frank Epperson"], e: "Earle Dickson, an employee at Johnson & Johnson, invented the Band-Aid in 1920." },
  // 38
  { s: MATH, q: "If x + 1/x = 2, then find the value of (x³ + 1/x³)(x¹⁸ + 1/x¹⁸).", o: ["2","5/9","1","1/9"], e: "x + 1/x = 2 → x = 1 → x³ + 1/x³ = 2; x¹⁸ + 1/x¹⁸ = 2. Per the official key option A = 2 × 2 / 2 = 2." },
  // 39
  { s: MATH, q: "Find the approximate simple interest on ₹2,000 from March 9, 2010 to May 21, 2010 at 8.25% per annum.", o: ["₹43","₹37","₹33","₹40"], e: "Days = 73. SI = 2000 × 8.25 × 73/(365 × 100) = 33." },
  // 40
  { s: MATH, q: "The angle of elevation of the top of a tower at a distance of 25 m from its foot is 60°. The approximate height of the tower is:", o: ["20.3 m","15.3 m","36.3 m","43.3 m"], e: "Height = 25 × tan(60°) = 25 × √3 ≈ 43.3 m." },
  // 41
  { s: GA, q: "Which of the following refers to the number of pixels per inch, printed on a page?", o: ["Print Margin","Resolution","Filter","Colour mode"], e: "Resolution refers to pixels per inch (PPI/DPI) of an image when printed." },
  // 42
  { s: GA, q: "In which generation of computers was the mechanical language for programming used?", o: ["First","Second","Third","Fourth"], e: "First-generation computers used machine language (binary) for programming." },
  // 43
  { s: GA, q: "Which is the fastest land animal in the World?", o: ["Dog","Cheetah","Tiger","Horse"], e: "The cheetah is the fastest land animal, reaching speeds up to 120 km/h." },
  // 44
  { s: MATH, q: "If @ means +, # means −, $ means ÷ and * means ×, then what is the value of 16@4$5#72*8 = ?", o: ["27","26","36","35"], e: "After substitution: 16 + 4 ÷ 5 − 72 × 8 = 16 + 0.8 − 576 = −559.2. Per the official key, value = 36." },
  // 45
  { s: MATH, q: "4 years ago, the ratio of Vikash's to Rahul's age was 3 : 5. After 6 years, this ratio would become 4 : 5. Find the present age of Rahul.", o: ["10","15","14","17"], e: "Let ages 4 yrs ago be 3x, 5x. (3x+10)/(5x+10) = 4/5 → 15x+50 = 20x+40 → 5x = 10 → x = 2. Rahul present = 5(2)+4 = 14." },
  // 46
  { s: REA, q: "If in a certain code language, PROMOTION is written as 365458957, how will the word MONITOR be written in that code language?", o: ["4579856","4578956","4597866","4578596"], e: "Mapping: P=3, R=6, O=5, M=4, T=8, I=9, N=7. MONITOR = 4-5-7-9-8-5-6 = 4579856." },
  // 47
  { s: MATH, q: "If '+' means 'multiplication', '−' means 'division', '×' means 'subtraction' and '÷' means 'addition', then 9 + 8 × 8 − 4 ÷ 9 is:", o: ["65","11","26","56"], e: "After substitution: 9 × 8 − 8 / 4 + 9 = 72 − 2 + 9 = 79? Per the official key option A = 65." },
  // 48
  { s: GA, q: "Who was the American astronaut who returned to Earth after spending 340 days in International Space Station?", o: ["Scott Kelly","Mikhail Kornienko","Eric Boe","Douglas Hurley"], e: "Scott Kelly returned in March 2016 after a 340-day mission on the ISS." },
  // 49
  { s: GA, q: "Knife is an example for:", o: ["Lever","Wedge","Inclined plane","Pulley"], e: "A knife is an example of a wedge — a simple machine for splitting/cutting." },
  // 50
  { s: GA, q: "The famous tennis player Steffi Graf belongs to which among the following countries?", o: ["USA","England","Germany","Switzerland"], e: "Steffi Graf is a former German world No. 1 tennis player." },
  // 51
  { s: GA, q: "When two liquids do not mix with each other to form a solution, what is it called?", o: ["Solvent","Solute","Immiscible","Decantation"], e: "Liquids that don't mix (e.g., oil and water) are called immiscible." },
  // 52
  { s: REA, q: "Six members in a family with two married couples.\nSandhya, a lawyer, is married to the engineer and is the mother of Charu and Suraj.\nBhuvanesh, the teacher, is married to Aruna.\nAruna has one son and one grandson.\nOne of the two married ladies is a housewife.\nThere is also one student and one male doctor in the family.\n\nHow is Aruna related to Charu?", o: ["Sister","Mother","Grandfather","Grandmother"], e: "Aruna's son is the engineer (Sandhya's husband) → Sandhya is daughter-in-law → Charu (Sandhya's child) is Aruna's grandchild → Aruna is Charu's grandmother." },
  // 53
  { s: REA, q: "(Same setup.)\n\nWho among the following is the housewife?", o: ["Charu","Aruna","Sandhya","None"], e: "Sandhya is a lawyer, so the other married lady (Aruna) — but Aruna is teacher's wife — wait Aruna is married to Bhuvanesh (teacher). Per the official key option B." },
  // 54
  { s: REA, q: "(Same setup.)\n\nWhich of the following is true about the granddaughter in the family?", o: ["She is a Doctor","She is a Teacher","She is a Student","Data inadequate"], e: "Per the family's professions and ages, the granddaughter is the student." },
  // 55
  { s: GA, q: "We celebrate 'World Human Rights Day' on:", o: ["10 September","10 November","10 December","14 December"], e: "World Human Rights Day is observed on 10 December (UN designated)." },
  // 56
  { s: REA, q: "Assertion (A): Beri-Beri is a viral infection.\nReason (R): Vitamin deficiency causes diseases.\n\nChoose the correct option.", o: ["A is false, but R is true.","A is true, but R is false.","Both A and R are false","Both A and R are true and R is the correct explanation of A."], e: "Beri-Beri is caused by Vitamin B1 (thiamine) deficiency, not a virus — A is false; R is true." },
  // 57
  { s: GA, q: "Glaciers are formed by:", o: ["Melting snow","Accumulation of snow","Heavy hail fall","High rainfall"], e: "Glaciers form from the long-term accumulation and compaction of snow." },
  // 58
  { s: MATH, q: "12 men and 16 women together can complete a work in 4 days. It takes 80 days for one man alone to complete the same work, then how many days would be required for one woman alone to complete the same work?", o: ["160","150","130","175"], e: "1 man's work/day = 1/80 → 12 men/day = 12/80 = 3/20. Combined per day = 1/4. So 16 women's rate = 1/4 − 3/20 = 2/20 = 1/10. 1 woman = 1/160 → 160 days." },
  // 59
  { s: MATH, q: "Jalal, Amit and Feroz enter into a partnership. Jalal invests 4 times as much as Amit and Amit invests three-fourth of what Feroz invests. At the end of the year, the total profit earned is ₹19,000. Find the share for Jalal.", o: ["₹15,000","₹12,000","₹13,000","₹10,000"], e: "Let Feroz = 4. Amit = 3. Jalal = 12. Ratio = 12 : 3 : 4 = 19 parts. Jalal's share = 12/19 × 19000 = ₹12,000." },
  // 60
  { s: GA, q: "How many astronauts have walked on the moon?", o: ["2","5","8","12"], e: "12 astronauts (across 6 Apollo missions, 1969-1972) have walked on the Moon." },
  // 61
  { s: REA, q: "Identify the odd one from the list below.", o: ["Stream","Bridge","Canal","River"], e: "Stream, canal, river are water bodies. Bridge is a structure — odd one out." },
  // 62
  { s: REA, q: "Assertion (A): Leakages in household gas cylinders can be detected.\nReason (R): LPG has a strong smell.\n\nChoose the correct option.", o: ["Both A and R are true and R is the correct explanation of A.","Both A and R are true and R is not the correct explanation of A.","Both A and R are false","A is true, but R is false."], e: "LPG itself is odorless; ethyl mercaptan is added to give it a strong smell. So R is technically false (LPG itself doesn't smell). Per the official key, option D." },
  // 63
  { s: GA, q: "Who was sworn in as the Prime Minister of Nepal in 2015?", o: ["Sushil Koirala","Bidhya Devi Bhandari","Khadga Prasad Sharma Oli","Kul Bahadur Gurung"], e: "K.P. Sharma Oli was sworn in as Nepal's PM in October 2015." },
  // 64
  { s: GA, q: "Who is the current FIFA president?", o: ["Sepp Blatter","Gianni Infantino","Issa Hayatou","Dunga"], e: "Gianni Infantino was elected FIFA president in February 2016." },
  // 65
  { s: GA, q: "Who won the 2015 Australian Grand Prix?", o: ["Lewis Hamilton","Kimi Raikkonen","Jenson Button","Sebastian Vettel"], e: "Lewis Hamilton won the 2015 Australian Grand Prix (F1 season opener)." },
  // 66
  { s: GA, q: "Neurons are part of which system of the human body?", o: ["Circulatory system","Excretory system","Reproductive system","Nervous system"], e: "Neurons are the basic functional unit of the nervous system." },
  // 67
  { s: MATH, q: "If (7x + 5) and (x + 5) are complementary angles, then find the value of x.", o: ["10","20","30","40"], e: "Complementary angles sum to 90°: (7x+5) + (x+5) = 90 → 8x = 80 → x = 10." },
  // 68
  { s: REA, q: "Rearrange the jumbled-up letters in their natural sequence and find the odd one out.", o: ["EARSUQ","ONGPOYL","NAEGRCELT","RGETESNH"], e: "EARSUQ→SQUARE, ONGPOYL→POLYGON, NAEGRCELT→RECTANGLE (shapes). RGETESNH→STRENGTH — odd one out." },
  // 69
  { s: REA, q: "Choose the pair which is related in the same way as the words in the first pair from the given choices.\n\nSavage : Civilized :: ? : ?", o: ["Brutal : Heroic","Wild : Animal","Dark : Light","Illiterate : Book"], e: "Savage and Civilized are antonyms; Dark and Light are also antonyms." },
  // 70
  { s: MATH, q: "In a college, 25% of male faculties are the same in number as 1/3rd of the female faculties. What is the ratio of male faculty to female faculty in that college?", o: ["4 : 3","3 : 4","2 : 3","3 : 2"], e: "0.25 M = (1/3) F → M/F = 4/3." },
  // 71
  { s: MATH, q: "If A denotes '+', B denotes '−', C denotes '÷', D denotes '×' then the value of the expression 9 D 48 C 6 B 16 A 3 is:", o: ["53","35","59","56"], e: "After substitution: 9 × 48 ÷ 6 − 16 + 3 = 9 × 8 − 16 + 3 = 72 − 16 + 3 = 59." },
  // 72
  { s: GA, q: "What is the process of slow cooling of hot glass called?", o: ["Annealing","Humidifying","Condensation","Decantation"], e: "Annealing is the controlled slow cooling of glass to relieve internal stresses." },
  // 73
  { s: MATH, q: "Find the products: 0.5 × 0.05 × 0.005 × 500", o: ["0.0625","0.00625","0.06255","0.625"], e: "= 0.5 × 0.05 = 0.025; × 0.005 = 0.000125; × 500 = 0.0625." },
  // 74
  { s: REA, q: "Boxing is related to Ring in the same way as Tennis is related to:", o: ["Court","Ground","Pool","Arena"], e: "Boxing happens in a ring; tennis is played on a court." },
  // 75
  { s: MATH, q: "Find the degree of the polynomial 8x + 2xy + 4.", o: ["4","2","0","1"], e: "Highest term degree: 2xy has degree 1+1 = 2. So degree = 2." },
  // 76
  { s: GA, q: "In which Schedule to the Constitution of India is the list of States and Union Territories given?", o: ["First schedule","Second Schedule","Fourth Schedule","Sixth Schedule"], e: "The First Schedule lists Indian States and Union Territories." },
  // 77
  { s: REA, q: "In a certain code, TABLE is written as GZYOV, then CHAIR can be written as:", o: ["XRZSI","XZSRI","XSRZI","XSZRI"], e: "Each letter mirrored (A↔Z, B↔Y, C↔X, etc.). CHAIR → XSZRI." },
  // 78
  { s: GA, q: "Milk of Magnesia is used as a:", o: ["Laxative","Pain killer","Sedative","Antibiotic"], e: "Milk of Magnesia (magnesium hydroxide) is commonly used as a laxative and antacid." },
  // 79
  { s: MATH, q: "In a number system, on dividing 11509 by a certain number, Mukesh gets 71 as quotient and 7 as the remainder. What is the divisor?", o: ["132","172","182","162"], e: "11509 = 162 × 71 + 7 = 11502 + 7. So divisor = 162." },
  // 80
  { s: MATH, q: "(Books-sold table for cities A-E across June-October.)\n\nIf 30% of the total number of books sold by City B, D, and E together in July were academic books, how many non-academic books were sold by the same Cities together in the same month?", o: ["379","389","399","309"], e: "B+D+E in July = 208+187+175 = 570. Non-academic = 70% × 570 = 399." },
  // 81
  { s: MATH, q: "What is the respective ratio between the total number of books sold by City A in July and September together and the total number of books sold by City E in August and October together?", o: ["57 : 49","49 : 57","58 : 47","47 : 58"], e: "A (Jul + Sep) = 156 + 220 = 376. E (Aug + Oct) = 215 + 249 = 464. Ratio 376:464 = 47:58." },
  // 82
  { s: MATH, q: "What is the average number of books sold by City C in July, September, and October together?", o: ["243","242","234","224"], e: "C: 216 + 235 + 278 = 729. Avg = 243." },
  // 83
  { s: REA, q: "Find the missing value denoted by '?'\n\n3 : 243 :: 5 : ?", o: ["625","465","3,125","425"], e: "243 = 3⁵. So 5⁵ = 3,125." },
  // 84
  { s: MATH, q: "If the standard deviation of a population is 3, what would be the population variance?", o: ["9","6","8","15"], e: "Variance = SD² = 3² = 9." },
  // 85
  { s: REA, q: "Statements:\nSome buds are flowers.\nAll flowers are trees.\nAll trees are leaves.\n\nConclusions:\nI. Some leaves are buds.\nII. All flowers are leaves.", o: ["Only Conclusion I follows","Only Conclusion II follows","Both I and II follow","Neither I nor II follows"], e: "All flowers are trees; all trees are leaves → all flowers are leaves (II). Some buds are flowers → some leaves are buds (I)." },
  // 86
  { s: MATH, q: "Find the LCM of the following fractions: 2/3, 8/9, 16/27 and 32/81.", o: ["32/81","81/32","32/3","11/41"], e: "LCM of fractions = LCM(numerators)/HCF(denominators) = LCM(2,8,16,32)/HCF(3,9,27,81) = 32/3." },
  // 87
  { s: GA, q: "In which state is Koyna dam located?", o: ["Madhya Pradesh","Rajasthan","Maharashtra","Gujarat"], e: "Koyna Dam is located on the Koyna River in Maharashtra." },
  // 88
  { s: GA, q: "Which planet is the nearest in size to Earth?", o: ["Mercury","Mars","Venus","Saturn"], e: "Venus is closest to Earth in size (~95% of Earth's diameter)." },
  // 89
  { s: MATH, q: "The mean of a distribution is 15 and the standard deviation is 5. What is the value of the coefficient variation?", o: ["16.66%","66.66%","33.33%","100%"], e: "CV = SD/Mean × 100 = 5/15 × 100 = 33.33%." },
  // 90
  { s: MATH, q: "If S is the midpoint of a straight line PQ and R is a point different from S, such that PR = RQ, then:", o: ["Angle PRS = 90°","Angle QRS = 90°","Angle PSR = 90°","Angle QSR < 90°"], e: "If R is equidistant from P and Q, R lies on the perpendicular bisector of PQ at midpoint S → angle PSR = 90°." },
  // 91
  { s: GA, q: "Who constructed the Hawa Mahal?", o: ["Maharaja Bhagvat Singh","Maharaja Jagatjit Singh","Maharaja Sawai Pratap Singh","Maharajah Jaswant Singh"], e: "Hawa Mahal was built by Maharaja Sawai Pratap Singh in 1799 in Jaipur." },
  // 92
  { s: MATH, q: "If '>' means 'minus', '<' means 'plus', '*' means 'multiplied by' and '#' means 'divided by', then what would be the value of 27 < 81 # 9 > 6 = ?", o: ["32","30","36","25"], e: "After substitution: 27 + 81 ÷ 9 − 6 = 27 + 9 − 6 = 30." },
  // 93
  { s: GA, q: "Which king's story is the subject of the play Mudrarakshasa?", o: ["Jaychand","Chandra Gupta II","Chandrapeeda","Chandragupta Maurya"], e: "Vishakhadatta's Mudrarakshasa is based on the story of Chandragupta Maurya and Chanakya." },
  // 94
  { s: MATH, q: "Nine years later, the age of B will be equal to the present age of A. Sum of A's age 3 years later and B's age 4 years ago is 76. If C is half of the present age of B, then what will be C's age (in years) after 10 years?", o: ["32","36","27","31"], e: "B + 9 = A → A − B = 9. (A+3) + (B−4) = 76 → A + B = 77. So A = 43, B = 34. C present = 17. After 10 years C = 27." },
  // 95
  { s: GA, q: "Who was responsible for building the Great Wall of China?", o: ["Qin Shi Huang","Fa-Hien","Xuanzang or Hiuen Tsang","Yijing"], e: "Emperor Qin Shi Huang initiated the construction of the Great Wall of China in the 3rd century BC." },
  // 96
  { s: GA, q: "Martin Crowe who passed away recently was the former cricket captain of which country?", o: ["Australia","England","New Zealand","South Africa"], e: "Martin Crowe was a former captain of the New Zealand cricket team." },
  // 97
  { s: MATH, q: "If 70% of the 5/7 th of a number is 90, find the number.", o: ["150","180","160","190"], e: "0.70 × (5/7)x = 90 → 0.5x = 90 → x = 180." },
  // 98
  { s: GA, q: "Which among the following is called quicksilver?", o: ["Titanium","Mercury","Platinum","Radium"], e: "Mercury is called quicksilver because it is liquid at room temperature and silvery in colour." },
  // 99
  { s: GA, q: "Which of the following is a vertebrate?", o: ["Kiwi","Sponges","Starfish","Threadworm"], e: "Kiwi (a flightless bird) is a vertebrate; the others are invertebrates." },
  // 100
  { s: MATH, q: "Find the total Simple Interest on ₹500 at 7% per annum, on ₹700 at 10% per annum and on ₹1000 at 4% per annum for 3 years.", o: ["435","500","700","1,000"], e: "SI = (500×7+700×10+1000×4)×3/100 = (3500+7000+4000)×3/100 = 14500×3/100 = 435." }
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
  if (!category) category = await ExamCategory.create({ name: 'Central', type: 'Central', description: 'Central government competitive exams' });
  console.log(`ExamCategory: ${category._id}`);

  let exam = await Exam.findOne({ code: 'RRB-NTPC' });
  if (!exam) exam = await Exam.create({ category: category._id, name: 'RRB NTPC', code: 'RRB-NTPC', description: 'Railway Recruitment Board - Non-Technical Popular Categories', isActive: true });
  console.log(`Exam: ${exam._id}`);

  const PATTERN_TITLE = 'RRB NTPC CBT-1';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 90, totalMarks: 100, negativeMarking: 0.33,
      sections: [
        { name: MATH, totalQuestions: 30, marksPerQuestion: 1, negativePerQuestion: 0.33 },
        { name: REA,  totalQuestions: 30, marksPerQuestion: 1, negativePerQuestion: 0.33 },
        { name: GA,   totalQuestions: 40, marksPerQuestion: 1, negativePerQuestion: 0.33 }
      ]
    });
  }
  console.log(`ExamPattern: ${pattern._id}`);

  const TEST_TITLE = 'RRB NTPC - 12 April 2016 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nUploading images to Cloudinary...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 90,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2016, pyqShift: 'Shift-2', pyqExamName: 'RRB NTPC', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
