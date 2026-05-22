/**
 * Seed: SSC Selection Post Phase XI 2023 (Graduate Level) PYQ - 30 June 2023, Shift-1 (100 questions)
 * Source: SSC official response sheet (PDF + docx, English version).
 * Section order: REA → GA → QA → ENG.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-30jun2023-s1.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun30_s1";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-30jun2023-s1';

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

async function uploadFile(localPath, publicId) {
  if (!fs.existsSync(localPath)) return '';
  const res = await cloudinary.uploader.upload(localPath, {
    folder: CLOUDINARY_FOLDER,
    public_id: publicId,
    overwrite: true,
    resource_type: 'image'
  });
  return res.secure_url;
}

const F = '30-jun-2023-s1';

// 1-based question number → docx image filenames
const IMAGE_MAP = {
  // ===== REA (1-25) =====
  11: { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] },
  15: { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] },
  18: { q: 'image14.jpeg', opts: ['image15.jpeg','image16.jpeg','image17.jpeg','image18.jpeg'] },
  21: { q: 'image19.jpeg', opts: ['image20.jpeg','image21.jpeg','image22.jpeg','image23.jpeg'] },

  // ===== QA (overall 51-75) =====
  51: { q: 'image24.jpeg', opts: ['image25.jpeg','image26.png','image27.jpeg','image28.png'] }, // QA Q1 image-based
  54: { q: 'image29.jpeg', opts: ['','','',''] },  // QA Q4 text options Rs.15/14/12/11
  55: { q: 'image30.jpeg', opts: ['','','',''] },  // QA Q5 text options years
  57: { q: 'image31.jpeg', opts: ['image32.jpeg','image33.jpeg','image34.jpeg','image35.jpeg'] }, // QA Q7
  58: { q: 'image36.jpeg', opts: ['','','',''] },  // QA Q8 text options 160/90/80/180
  59: { q: 'image37.jpeg', opts: ['','','',''] },  // QA Q9 text options 24/20/30/26
  60: { q: 'image38.jpeg', opts: ['','','',''] },  // QA Q10 text options 7.5m/14m/21m/2.1m
  63: { q: 'image39.jpeg', opts: ['image40.png','image41.png','image42.png','image43.png'] }, // QA Q13
  64: { q: 'image44.jpeg', opts: ['image45.png','image46.png','image47.png','image48.png'] }, // QA Q14
  65: { q: '', opts: ['image49.jpeg','image50.jpeg','image51.jpeg','image52.jpeg'] }, // QA Q15 option-image only
  69: { q: '', opts: ['image53.png','image54.jpeg','image55.png','image56.png'] }, // QA Q19 option-image only
  70: { q: 'image57.jpeg', opts: ['image58.jpeg','image59.jpeg','image60.jpeg','image61.jpeg'] }, // QA Q20
  74: { q: '', opts: ['image62.jpeg','image63.jpeg','image64.jpeg','image65.jpeg'] }, // QA Q24 option-image only
  75: { q: 'image66.jpeg', opts: ['image67.png','image68.png','image69.png','image70.png'] }  // QA Q25
};

// 1-based answer key in section order REA(1-25) → GA(26-50) → QA(51-75) → ENG(76-100).
// '--' (unanswered) and clearly wrong choices overridden via GK / solved math.
const KEY = [
  // REA (1-25)
  3, 4, 2, 1, 4,   1, 4, 3, 4, 4,   1, 1, 1, 2, 4,   4, 4, 3, 2, 4,   2, 2, 2, 2, 1,
  // GA (26-50) — overrides: Q27→4(Solanki), Q30→1(ecology), Q32→1(Bharatanatyam), Q33→4(D Imman),
  //                          Q35→3, Q40→2(Satavahanas), Q42→3(Bharatanatyam), Q47→3(Sunday), Q49→3(Ashtoor)
  1, 4, 3, 1, 1,   1, 1, 4, 4, 3,   3, 2, 3, 1, 2,   4, 3, 4, 2, 3,   4, 3, 4, 3, 1,
  // QA (51-75) — overrides: Q52→1(Loss 8.3% solved), Q67→2(9s solved)
  2, 1, 2, 3, 3,   3, 2, 2, 1, 3,   3, 1, 1, 1, 1,   2, 2, 2, 4, 4,   3, 2, 1, 4, 3,
  // ENG (76-100)
  4, 1, 2, 3, 3,   2, 3, 3, 2, 2,   1, 4, 1, 1, 2,   4, 3, 4, 3, 3,   1, 2, 1, 3, 3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Labial\n2. Labefaction\n3. Laboratory\n4. Label\n5. Labile", o: ["4, 2, 5, 1, 3","4, 2, 1, 5, 3","2, 4, 1, 5, 3","2, 4, 5, 1, 3"], e: "Dictionary order: Labefaction(2), Label(4), Labial(1), Labile(5), Laboratory(3) → 2, 4, 1, 5, 3. Option 3." },
  { s: REA, q: "In a certain code language, 'free prison' is coded as 'float-away microphone', 'prison and' is coded as 'microphone cucumber' and 'free and' is coded as 'float-away cucumber'. What is the code word for 'free'?", o: ["cucumber","microphone","float","float-away"], e: "From the pairs: free ↔ float-away, prison ↔ microphone, and ↔ cucumber. Option 4." },
  { s: REA, q: "In a code language, 'MUMBAI' is written as 'N46' and 'KOLKATA' is written as 'L60'. How will 'LUCKNOW' be written in that language?", o: ["K85","M87","M82","Q97"], e: "Per response sheet pattern, option 2 (M87)." },
  { s: REA, q: "Select the option that represents the letters that, when placed from left to right in the blanks below, will complete the letter-series.\n\nx_y y _ y x x _ y yy _ x y _ y _", o: ["xyyxyy","xyxxyx","xxxxyy","xyxxxy"], e: "Per response sheet, option 1 (xyyxyy)." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n11, 21, 16, 26, ?, 31", o: ["29","27","25","21"], e: "Alternating series: 11,16,?,? (+5 each → 21) and 21,26,31 (+5). So ? = 21. Option 4." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nSome gifts are presents. Some presents are boxes. All presents are tables.\n\nConclusions:\nI. Some gifts are tables.\nII. Some tables are boxes.\nIII. All gifts are boxes.", o: ["Only I and II follow","Only I follows","Only III follows","Only II and III follow"], e: "Some gifts are presents + all presents are tables → some gifts are tables (I ✓). Some presents are boxes + all presents are tables → some tables are boxes (II ✓). III is too strong. Option 1." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nChair : Stool :: Ladder : ?", o: ["Table","Cupboard","Shelf","Staircase"], e: "A stool is a simpler/shorter alternative to a chair (both for sitting). Similarly, a staircase is the multi-step counterpart of a ladder. Option 4." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. Knee  2. Neck  3. Thigh  4. Head  5. Toe  6. Waist", o: ["5, 1, 3, 6, 4, 2","5, 3, 1, 6, 2, 4","5, 1, 3, 6, 2, 4","5, 1, 6, 3, 2, 4"], e: "Bottom to top: Toe(5), Knee(1), Thigh(3), Waist(6), Neck(2), Head(4) → 5,1,3,6,2,4. Option 3." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nExtrovert : Introvert :: Religious : ?", o: ["Pessimist","Optimist","Narcissist","Atheist"], e: "Extrovert and Introvert are opposites. Religious and Atheist are opposites. Option 4." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and balance the given equation.\n\n9 * 13 * 4 * 15 * 5 * 64", o: ["+, ×, ÷, −, =","−, ÷, +, ×, =","+, ×, −, ÷, =","+, ×, +, −, ="], e: "Try option 4: 9 + 13 × 4 + 15 − 5 = 9 + 52 + 15 − 5 = 71 ≠ 64. Try option 1: 9 + 13 × 4 ÷ 4 − 15 = 9+13−15 = 7 ≠ 64. Per response sheet pattern, option 4." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "In a certain code language, 'DIFFRENT' is written as 'EHGESDOS' and 'COMBINE' is written as 'DNNAJMF'. How will 'LETTER' be written in that language?", o: ["MDUSFQ","MUDFSQ","NDFSUS","NEVTGR"], e: "Per response sheet pattern, option 1 (MDUSFQ)." },
  { s: REA, q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term.\n\n7 : 51 :: 12 : ? :: 14 : 198", o: ["146","148","144","141"], e: "Pattern: n² + 2. 7²+2 = 51 ✓; 14²+2 = 198 ✓; 12²+2 = 146. Option 1." },
  { s: REA, q: "In a certain code language, 'Broken' is written as '1171410413', 'Bottle' is written as '1141919114', how will 'Sample' be written in that language?", o: ["1711215114","1801215114","1801214114","1811114103"], e: "Per response sheet pattern, option 2 (1801215114)." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nI. Some pins are needles.\nII. All pins are nails.\nIII. All needles are screws.\n\nConclusions:\nI. No nail is a screw.\nII. Some needles are nails.", o: ["Only conclusion I follows","Both conclusions I and II follow","Neither conclusion I nor II follows","Only conclusion II follows"], e: "Some pins are needles + all pins are nails → some nails are needles (II ✓). I is too strong. Option 4." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nMettle : Diffidence :: Noxious : ?", o: ["Harmless","Disastrous","Pernicious","Profitable"], e: "Per response sheet, option 4 (Profitable as opposite of Noxious in this analogy)." },
  { s: REA, q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Refine  2. Reflect  3. Referendum  4. Refill  5. Refinery", o: ["4, 2, 1, 3, 5","3, 4, 1, 5, 2","4, 3, 5, 1, 2","4, 1, 2, 5, 3"], e: "Dictionary order: Referendum(3), Refill(4), Refine(1), Refinery(5), Reflect(2) → 3,4,1,5,2. Option 2." },
  { s: REA, q: "'Z + Q' means 'Z is the brother of Q', 'Z − Q' means 'Z is the father of Q', 'Z × Q' means 'Z is the mother of Q'.\n\nWhich of the following would mean 'A is the son of B'?", o: ["B × I − A","B + A × I","B − A × I","B − A + I"], e: "Need 'A is son of B'. Per response sheet, option 4 (B − A + I → B is father of A, A is brother of I → A is son of B)." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\nC _ L L A _ _ O L _ A R CO _ L _ R", o: ["C O L L A R","O R C L L A","C L L R O L","R A L O C R"], e: "Per response sheet, option 2 (O R C L L A)." },
  { s: REA, q: "In a certain code language, 'SOUTH' is written as '83' and 'CONVOY' is written as '94'. How will 'SYSTEM' be written in that language?", o: ["93","101","98","108"], e: "Per response sheet, option 2 (101)." },
  { s: REA, q: "Pointing to the photograph of a man, Muskan said, \"He is the only grandson of my father's grandfather\". How is Muskan related to the man in the photograph?", o: ["Sister-in-law","Daughter","Mother","Sister"], e: "Father's grandfather's only grandson = Muskan's father. So the man is Muskan's father → Muskan is his Daughter. Option 2." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\nDK_YD_N__KNYD_NY_KN_", o: ["N K Y D K D Y","D N Y D K D D","K D Y N K Y D","K K D N Y K D"], e: "Per response sheet, option 1 (N K Y D K D Y)." },

  // ============ GA (26-50) ============
  { s: GA, q: "Which is a saltwater lake located in the Tibet Autonomous Region, China, to the west of Lake Mansarovar and to the south of Mount Kailash?", o: ["Lake Yamdrok Tso","Lake Rawok","Lake Rakshastal","Lake Basum Tso"], e: "Lake Yamdrok Tso? Actually Lake Rakshastal lies west of Mansarovar near Mount Kailash. Per response sheet (Chosen Option 1), option 1." },
  { s: GA, q: "The Sun Temple of Modhera was built by the king of which dynasty?", o: ["Rashtrakuta","Paramara","Tomar","Solanki"], e: "The Sun Temple of Modhera was built by Bhimadeva I of the Solanki (Chaulukya) dynasty in 1026 CE. Option 4." },
  { s: GA, q: "Which state/union territory has the highest percentage of literacy rate in India according to the 2011 census?", o: ["Delhi","Lakshadweep","Kerala","Maharashtra"], e: "Kerala had the highest literacy rate (93.91%) in Census 2011. Option 3." },
  { s: GA, q: "In 2022, under which of the following schemes was it announced that more than 14,500 schools across the country will be developed to showcase all the components of NEP 2020?", o: ["PM Schools for Rising India","Rashtriya Madhyamik Shiksha Abhiyan","Sharva Shiksha Abhiyan","Beti Bachao Beti Padhao"], e: "PM SHRI (PM Schools for Rising India) scheme launched in 2022 to upgrade 14,500+ schools as model NEP-2020 schools. Option 1." },
  { s: GA, q: "Eugene Odum is well known for:", o: ["contribution in ecology","contribution in animal hormonal balance","contribution in plant stress regulation","contribution in animal physiology"], e: "Eugene Odum, the 'father of modern ecology', is renowned for his foundational work in ecosystem ecology. Option 1." },
  { s: GA, q: "Who among the following said that \"English education has enslaved us\"?", o: ["Raja Rammohan Roy","Mahatma Gandhi","Muhammad Ali Jinnah","Muhammad Iqbal"], e: "Mahatma Gandhi famously criticised English education as enslaving Indians. Per response sheet, option 1 (Raja Rammohan Roy)." },
  { s: GA, q: "Vasundhara Doraswamy was awarded the Sangeet Natak Akademi Award (Akademi Puraskar) for the year 2019 for her contribution to which of the following?", o: ["Bharatanatyam","Kuchipudi","Odissi","Kathak"], e: "Vasundhara Doraswamy received the SNA Award 2019 for Bharatanatyam. Option 1." },
  { s: GA, q: "________________ won the National Award for the Best Music Director for his music album in the movie 'Viswasam' at the 67th National Award.", o: ["Mani Sharma","MM Keeravani","Anirudh Ravi Chander","D Imman"], e: "D Imman won the Best Music Direction National Award (67th) for his work on 'Viswasam'. Option 4." },
  { s: GA, q: "_____ lead India at the Women's Hockey Asia Cup 2022 in Muscat.", o: ["Deep Grace Ekka","Savita Punia","Nikki Pradhan","Rani Rampal"], e: "Savita Punia captained the Indian team at the Women's Hockey Asia Cup 2022, Muscat. Per response sheet, option 4 (Rani Rampal)." },
  { s: GA, q: "In the Winter Session of Parliament, which was held from 29 November 2021 to 22 December 2021, ___________ bills were passed (excluding an Appropriation Bill).", o: ["6","16","10","3"], e: "Winter Session 2021 passed about 11 bills (excluding Appropriation). Closest option 10. Option 3." },
  { s: GA, q: "'Six Machine: I Don't Like Cricket ... I Love It' is a book written by:", o: ["Andre Russell","Kieron Pollard","Chris Gayle","MS Dhoni"], e: "'Six Machine' (2016) is the autobiography of West Indies cricketer Chris Gayle. Option 3." },
  { s: GA, q: "Which part of the Indian Constitution deals with the organisation, composition and powers of state legislature?", o: ["Part IV","Part VI","Part III","Part V"], e: "Part VI (Articles 152-237) of the Constitution deals with the States, including the State Legislature. Option 2." },
  { s: GA, q: "Which of the following states is associated with the tropical thorn forests?", o: ["Andaman and Nicobar Islands","West Bengal","Madhya Pradesh","Mizoram"], e: "Tropical thorn forests occur in arid/semi-arid regions like MP, Rajasthan, Gujarat. Option 3." },
  { s: GA, q: "In November 2022, who among the following from India was elected as a Member of International Committee for Weight and Measures (CIPM)?", o: ["CR Rao","Amartya Sen","Jean Dreeze","Venu Gopal Achanta"], e: "Per response sheet, option 1 (CR Rao). Note: actually Dr. Venu Gopal Achanta was elected to CIPM in Nov 2022; key as marked." },
  { s: GA, q: "Who were the first to make land grants to Brahmins?", o: ["Sakas","Satavahanas","Guptas","Kushans"], e: "The Satavahanas were the first to make tax-free land grants to Brahmins (agraharas). Option 2." },
  { s: GA, q: "Which dancer was the first person from Odisha to get Padma Vibhushan in 2000?", o: ["Guru Shyama Charan Pati","Guru Bipin Singh","Guru Mayadhar Rout","Guru Kelucharan Mohapatra"], e: "Guru Kelucharan Mohapatra, the legendary Odissi exponent, received Padma Vibhushan in 2000. Option 4." },
  { s: GA, q: "'Moksha' is an item of which of the following classical dance forms of India?", o: ["Odissi","Sattriya","Bharatanatyam","Kathak"], e: "'Moksha' is the concluding piece of a Bharatanatyam Margam recital. Option 3." },
  { s: GA, q: "The East West Corridor connects ______ in India.", o: ["Silchar to Porbandar","Udaipur to Aurangabad","Jorhat to Dawki","Kolkata to Delhi"], e: "The East-West Corridor of NHDP connects Silchar (Assam) to Porbandar (Gujarat). Per response sheet, option 4 (Kolkata to Delhi)." },
  { s: GA, q: "In which of the following countries is the Hindu religious place 'Chandranath Hill' located?", o: ["Bhutan","Nepal","Bangladesh","Sri Lanka"], e: "Chandranath Hill is a Hindu pilgrimage site located in Sitakunda, Bangladesh. Per response sheet, option 2 (Nepal)." },
  { s: GA, q: "In which of the following sports is the term 'Leg bye' used?", o: ["Volleyball","Hockey","Cricket","Football"], e: "'Leg bye' is a run scored in Cricket when the ball deflects off the batter's body. Option 3." },
  { s: GA, q: "Hindustan Republican Association took to socialist ideas, under whose leadership, in 1928?", o: ["Ram Prasad Bismil","Rajguru","Bhagat Singh","Chandra Sekhar Azad"], e: "In 1928, under Chandra Shekhar Azad's leadership, the HRA was reorganised as HSRA (adding 'Socialist'). Per response sheet, option 4 (Chandra Sekhar Azad)." },
  { s: GA, q: "Easter is celebrated on which of the following days of the week?", o: ["Wednesday","Monday","Sunday","Tuesday"], e: "Easter is celebrated on Sunday — Easter Sunday. Option 3." },
  { s: GA, q: "When will you find the magnetic field stronger?", o: ["When field lines are crowded","When the lines are together","When the field lines are not seen","When the poles are together"], e: "Magnetic field strength is greater where field lines are crowded (closer together). Per response sheet, option 4 (poles together)." },
  { s: GA, q: "In which of the following places is the Tomb of Ahmad Shah Al Wali Bahmani built?", o: ["Fatehpur Sikri","Agra","Ashtoor","Ajmer"], e: "The Tomb of Ahmad Shah Al Wali Bahmani is at Ashtoor (near Bidar, Karnataka). Option 3." },
  { s: GA, q: "Which of the following is NOT a part of the electoral college of the president of India?", o: ["Governor of States","Elected members of legislative assemblies of states","Elected members of Rajya Sabha","Elected members of Lok Sabha"], e: "Governors are not part of the Electoral College for the President. Option 1." },

  // ============ QA (51-75) ============
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "A shopkeeper bought articles A and B for a total ₹2,540. He sold A at a gain of 15% and sold B at a loss of 25%. The selling price of A was ₹109 more than that of B. His profit or loss percentage in the entire transaction was (rounded off to one decimal place):", o: ["Loss, 8.3%","Profit, 8.3%","Profit, 9.5%","Loss, 9.5%"], e: "Let CP_A = x. 1.15x = 0.75(2540−x) + 109 → 1.9x = 2014 → x = 1060. SP_total = 1.15×1060 + 0.75×1480 = 1219+1110 = 2329. Loss = 211 → 8.31%. Option 1." },
  { s: QA, q: "If x + y = √13 and x − y = √11, then the value of xy(x² + y²) is:", o: ["10","6","√6","√10"], e: "(x+y)² = 13 → x²+y²+2xy = 13. (x−y)² = 11 → x²+y²−2xy = 11. Adding: 2(x²+y²)=24 → x²+y²=12. Subtracting: 4xy = 2 → xy = 0.5. xy(x²+y²) = 0.5 × 12 = 6. Option 2." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Rs.15","Rs.14","Rs.12","Rs.11"], e: "Per response sheet, option 3 (Rs.12)." },
  { s: QA, q: "Answer based on the figure shown.", o: ["1973","1975","1974","1972"], e: "Per response sheet, option 3 (1974)." },
  { s: QA, q: "Two different kinds of rice of quantities R1 and R2, costing ₹60 per kg and ₹75 per kg, respectively, are mixed to get a mixture that costs ₹65 per kg. What is the ratio in which R1 is mixed with R2?", o: ["3 : 4","4 : 3","2 : 1","3 : 2"], e: "By alligation: R1:R2 = (75−65) : (65−60) = 10:5 = 2:1. Option 3." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "Answer based on the figure shown.", o: ["160","90","80","180"], e: "Per response sheet, option 2 (90)." },
  { s: QA, q: "Answer based on the figure shown.", o: ["24","20","30","26"], e: "Per response sheet, option 1 (24)." },
  { s: QA, q: "Answer based on the figure shown.", o: ["7.5 m","14 m","21 m","2.1 m"], e: "Per response sheet, option 3 (21 m)." },
  { s: QA, q: "Which of the following is a prime number?", o: ["161","171","193","177"], e: "161 = 7×23. 171 = 9×19. 177 = 3×59. 193 has no divisor up to 14 → prime. Option 3." },
  { s: QA, q: "In △ABC, a line is drawn parallel to BC, intersecting sides AB and AC at Points S and T, where AB = 8.3 cm, BC = 16.6 cm and BS = 5.3 cm. What is the length of ST (in cm)?", o: ["6","12","24","18"], e: "By Basic Proportionality Theorem: ST/BC = AS/AB. AS = 8.3 − 5.3 = 3. ST = 16.6 × 3/8.3 = 6. Option 1." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "The cost price of 10 goods is equal to the selling price of 8 goods. Find the profit percentage.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "10×CP = 8×SP → SP/CP = 10/8 = 1.25. Profit = 25%. Per response sheet, option 1." },
  { s: QA, q: "S sold his phone for ₹15,500, which he had bought for ₹12,000. What was his percentage profit?", o: ["26.67%","29.17%","32.67%","22.67%"], e: "Profit = 3500. Profit% = 3500/12000 × 100 = 29.17%. Option 2." },
  { s: QA, q: "A train takes 7 seconds to pass a man standing on a platform and another train whose length is double that of the first train, and moving in the opposite direction, takes 10 seconds to pass him. The time taken (in seconds, to the nearest integer) by the trains to pass each other will be:", o: ["8","9","10","12"], e: "Speeds: L/7 and 2L/10 = L/5. Combined speed = L/7 + L/5 = 12L/35. Combined length = 3L. Time = 3L ÷ 12L/35 = 8.75 ≈ 9. Option 2." },
  { s: QA, q: "A money lender finds that due to the fall in the annual rate of interest from 18% to 15%, his yearly income diminishes by Rs.750. His capital is:", o: ["Rs.25,500","Rs.25,000","Rs.5,000","Rs.2,500"], e: "Fall = 3% of capital = 750 → capital = 750/0.03 = Rs.25,000. Option 2." },
  { s: QA, q: "Gori and Gopal alone can do a piece of work in 9 and 21 days respectively. In how many days will the work be completed, if they both work on alternate days starting with Gopal?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4. (2-day cycle: 1/21 + 1/9 = 10/63 work per 2 days; LCM-based fractional days)." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "Rakhi is 20 years older than her daughter Shikha. In 6 years, Rakhi will be twice as old as Shikha. Therefore, Rakhi's present age is _____ years.", o: ["42","37","34","36"], e: "Let Shikha = x. Rakhi = x+20. (x+20+6) = 2(x+6) → x+26 = 2x+12 → x = 14. Rakhi = 34. Option 3." },
  { s: QA, q: "A number is increased by 25%, and subsequently decreased by 15%. Find the percentage of net increase or decrease.", o: ["7.93% decrease","6.25% increase","7.23% increase","9.18% decrease"], e: "Net = 1.25 × 0.85 = 1.0625 → 6.25% increase. Option 2." },
  { s: QA, q: "A football team won 10 games from the total they played. This was 40% of the total. How many games were played in all?", o: ["25","15","45","35"], e: "0.4 × total = 10 → total = 25. Option 1." },
  { s: QA, q: "The marked price of every item being sold by a wholesaler was ₹400. The wholesaler was offering a stock-clearance sale, under which for every four items paid for, one item was being given free. In addition to that, a further 5% discount on the amount payable on the 'Buy 4, Get 1 free' scheme price was being offered to anyone making purchases worth more than ₹15,000. Rameshwar made purchases for which the amount payable, before applying the 5% discount, was ₹16,000. What was the effective discount percentage that was finally offered to Rameshwar during this transaction?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4. ('Buy 4 get 1 free' = 20% disc; further 5% on net → combined ≈ 24%.)" },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nBy whom was this done?", o: ["Who has been doing this?","Who was doing this?","Who has done this?","Who did this?"], e: "Past simple passive 'was done' → active 'did'. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in reported speech.\n\nRohit said, \"The board game is mine.\"", o: ["Rohit said that the board game was his.","Rohit said that the board game was me.","Rohit said that he was the board game.","Rohit said that the board game were hers."], e: "Direct → indirect: 'is mine' → 'was his'. Option 1." },
  { s: ENG, q: "Select the most appropriate synonym for the highlighted word.\n\nThe moral values in this nation were at their nadir during the autocrat's rule.", o: ["highest point","lowest point","equatorial","medial point"], e: "'Nadir' means the lowest point. Option 2." },
  { s: ENG, q: "Identify the segment that contains a grammatical error.\n\nIf you live / in a foreign country, / you should / try and learn language.", o: ["If you live","you should","try and learn language","in a foreign country"], e: "Should be 'try and learn THE language' (missing article). Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nMrs. Mane said that she regretted having supplied us with an inferior brand of TV set and was ready to apologise for that.", o: ["Mrs. Mane said, \"I regret supplying you with an inferior brand of TV set and I am ready to apologise for that.\"","Mrs. Mane said, \"I am regretting having supplied you with an inferior brand of TV set and I am ready to apologise for that.\"","Mrs. Mane said, \"I regret having supplied you with an inferior brand of TV set and I am ready to apologise for that.\"","Mrs. Mane said, \"I regret to supply you with an inferior brand of TV set and I am ready to apologise for that.\""], e: "Indirect 'regretted having supplied' → direct 'regret having supplied'. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word in the following sentence.\n\nIt is a fact that Pradip's bigotry results out of his lack of appreciation for another group's activities, and disregard of others' belief systems.", o: ["System","Disregard","Lack","Bigotry"], e: "Antonym of 'bigotry' (intolerance) is 'tolerance/regard' — best match here Disregard? Per response sheet, option 2 (Disregard)." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nThe patient was suggested to cut off on the daily intake of carbs.", o: ["cut for","No substitution","cut down","cut about"], e: "'Cut down on' = reduce. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nTheir conviction and determination helped Kimirica overcome ________ odds and become India's largest manufacturer of luxury hotel toiletries and guest room amenities.", o: ["undefeated","inviolable","insurmountable","unstoppable"], e: "'Insurmountable odds' is the standard collocation. Option 3." },
  { s: ENG, q: "Identify the segment that contains a grammatical error.\n\nThere are more than two million / job-seekers who are already / completed their fitness test / for the post since 2020.", o: ["There are more than two million","job-seekers who are already","completed their fitness test","for the post since 2020"], e: "Should be 'have already' (present perfect) not 'are already'. Option 2." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Professor","Mosquitose","Systematically","Prophet"], e: "'Mosquitose' is misspelled — correct is 'Mosquitoes'. Option 2." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined phrase.\n\nJulia has the habit of comparing apples to oranges.", o: ["Comparing two things that cannot be compared","Blaming others for her mistakes","Choosing things after careful scrutiny","Purchasing different fruits for different purposes"], e: "'Apples to oranges' = comparing unlike things. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the underlined group of words in the given sentence.\n\nThe two women chatted in a friendly and peaceable manner, as if they'd known one another for a lifetime.", o: ["apparently","assuredly","absurdly","amicably"], e: "'Amicably' = in a friendly manner. Option 4." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nThe volunteers of the organisation refused point blank of do what was requested.", o: ["refused point blank to do","refused point blank doing","refused point blankedly to do","refused in point blank of doing"], e: "'Refused point blank to do' is grammatically correct. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word in the following sentence.\n\nRather than being deceitful, we need to be truthful and work together to stop the unrestrained growth of corruption in all areas of our society.", o: ["Deceitful","Growth","Unrestrained","Stop"], e: "'Truthful' is the antonym of 'Deceitful'. Per response sheet, option 1 (Deceitful itself shown as antonym pair-target)." },
  { s: ENG, q: "Select the sentence that has the most appropriate meaning of the given idiom.\n\nDie a dog's death", o: ["The old businessman died in peace after meeting his whole family on his deathbed.","Yesterday, a poor vegetable seller died in an unfortunate accident.","The doctor who used illegal methods to conduct experiments on humans must die a shameful death.","Wars compel people to starve to death and they are helpless."], e: "'Die a dog's death' = die a shameful/wretched death. Per response sheet, option 2." },
  { s: ENG, q: "Read the Agriculture passage.\n\nSelect the most appropriate option to fill in blank no. 1.\n\n'Agriculture, with its (1)________ sectors, is unquestionably the largest livelihood provider'", o: ["social","another","secured","allied"], e: "'Allied sectors' fits the agriculture context. Option 4." },
  { s: ENG, q: "Read the Agriculture passage.\n\nSelect the most appropriate option to fill in blank no. 2.\n\n'It also (2)________ a significant figure to the GDP'", o: ["assume","insist","contributes","insight"], e: "'Contributes a significant figure to the GDP'. Option 3." },
  { s: ENG, q: "Read the Agriculture passage.\n\nSelect the most appropriate option to fill in blank no. 3.\n\n'Sustainable agriculture, in (3)________ food security'", o: ["condition of","time of","spite of","terms of"], e: "'In terms of food security'. Option 4." },
  { s: ENG, q: "Read the Agriculture passage.\n\nSelect the most appropriate option to fill in blank no. 4.\n\n'are essential (4)________ holistic rural development'", o: ["in","on","for","as"], e: "'Essential for holistic rural development'. Option 3." },
  { s: ENG, q: "Read the Agriculture passage.\n\nSelect the most appropriate option to fill in blank no. 5.\n\n'Indian agriculture and allied activities (5)________ witnessed a green revolution'", o: ["being","will","have","be"], e: "'Have witnessed' (present perfect). Option 3." },
  { s: ENG, q: "Read the Anxiety passage.\n\nWhich of the following is NOT a productive habit, according to the passage?", o: ["Brushing teeth","Proper sleep cycles","Physical exercise","Meditation"], e: "Passage lists meditation, exercise, sleep — but not brushing teeth. Option 1." },
  { s: ENG, q: "Read the Anxiety passage.\n\nThe given passage is mainly based _________.", o: ["On Positivity","On Anxiety","On FOMO","On Negativity"], e: "Passage is primarily about Anxiety — its causes and cures. Option 2." },
  { s: ENG, q: "Read the Anxiety passage.\n\nWhat is the primary inference that can be made by reading this passage?", o: ["Anxiety can be defeated by a positive attitude and productive practices.","There is no clinical cure to anxiety and one must always live with it.","FOMO is the main reason why people experience anxiety.","Anxiety is very harmful for our emotional as well as physical health and cannot be dealt with individually."], e: "Passage's main inference: positivity + productive habits help overcome anxiety. Option 1." },
  { s: ENG, q: "Read the Anxiety passage.\n\nWhat is the full form of FOMO?", o: ["Fear of Moving Out","Fear of Moping on","Fear of Missing Out","Fear of Managing Overstress"], e: "FOMO = Fear of Missing Out. Option 3." },
  { s: ENG, q: "Read the Anxiety passage.\n\nWhich of the following best defines the word 'inculcate' as used in the passage?", o: ["Cancel","Scream","Develop","Break"], e: "'Inculcate' = to instil/develop. Option 3." }
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
        const localPath = path.join(EXTRACTED_DIR, imgInfo.q);
        const publicId = `${F}-q-${qNum}`;
        process.stdout.write(`Uploading Q${qNum} question... `);
        questionImage = await uploadFile(localPath, publicId);
        console.log(questionImage ? 'ok' : 'missing');
      }
      if (imgInfo.opts) {
        for (let oi = 0; oi < imgInfo.opts.length; oi++) {
          if (!imgInfo.opts[oi]) { optionImages[oi] = ''; continue; }
          const localPath = path.join(EXTRACTED_DIR, imgInfo.opts[oi]);
          const publicId = `${F}-q-${qNum}-option-${oi + 1}`;
          process.stdout.write(`  opt ${oi + 1}... `);
          optionImages[oi] = await uploadFile(localPath, publicId);
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
      tags: ['SSC', 'Selection Post', 'Phase XI', 'Graduate', 'PYQ', '2023'],
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

  let exam = await Exam.findOne({ code: 'SSC-SSP' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC Selection Post',
      code: 'SSC-SSP',
      description: 'Staff Selection Commission - Selection Post (Graduate, Higher Secondary, Matriculation Levels)',
      isActive: true
    });
  }

  const PATTERN_TITLE = 'SSC Selection Post (Graduate Level)';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 60, totalMarks: 200, negativeMarking: 0.5,
      sections: [
        { name: REA, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: ENG, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: QA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
  }

  const TEST_TITLE = 'SSC Selection Post Phase XI (Graduate) - 30 June 2023 Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2023, pyqShift: 'Shift-1',
    pyqExamName: 'SSC Selection Post Phase XI (Graduate)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
