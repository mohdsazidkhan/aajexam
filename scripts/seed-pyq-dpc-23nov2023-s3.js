/**
 * Seed: Delhi Police Constable - 23 Nov 2023 Shift-3
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc23nov2023_s3');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-23nov2023-s3';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 23 Nov 2023 Shift-3"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Who was known as ‘Zinda Pir’?", o: ["Babur", "Aurangzeb", "Humayun", "Akbar"], a: 1, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "Suryoday Small Finance Bank is the company from _________ to obtain a ‘small finance bank’ license from the Reserve Bank of India.", o: ["Madhya Pradesh", "Andhra Pradesh", "Maharashtra", "Gujarat"], a: 2, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "In cricket, which of the following is considered as LBW?", o: ["The fielder catches a batted ball on the fly.", "The batsman’s body interferes with a bowled ball that would hit the wicket.", "The bowler knocks over (or, breaks) the wicket with a bowl.", "The fielder catches a ground ball and throws it at the wicket, knocking it down before the batsman gets there."], a: 1, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "The number of players playing in a team in the T20 cricket match is ________.", o: ["12", "11", "10", "13"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Who among the following Delhi-based Bharatanatyam dancers received the Nritya Perunjyothi award for the year 2021?", o: ["Lakshmi Vishwanathan", "Pandit Birju Maharaj", "Chitra Visweswaran", "Geeta Chandran"], a: 3, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Typhoid is caused by __________.", o: ["Protozoa", "bacteria", "Fungi", "Virus"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Bhuban Kumar of Purulia is an award-winning _______ dancer.", o: ["Kathak", "Kuchipudi", "Chhau", "Kathakali"], a: 2, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Bindusara was the successor of which of the following Mauryan emperors?", o: ["Shalishuka", "Chandragupta Maurya", "Ashoka", "Devavarman"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "A small enterprise is one in which investment in plant and machinery does NOT exceed what amount?", o: ["₹5 crore", "₹15 crore", "₹10 crore", "₹2 crore"], a: 2, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Tribal Welfare Ministers in Chhattisgarh, Jharkhand, Madhya Pradesh and Odisha are appointed by the __________.", o: ["Tribal Development Council", "Prime Minister", "Chief Minister", "Governor"], a: 3, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "The ‘Hanukkah’ celebration is associated with which of the following communities?", o: ["Buddhist", "Jain", "Jewish", "Parsi"], a: 2, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "Which Article empowers the Supreme Court to issue directions or writs for the enforcement of Fundamental Rights?", o: ["Article 32", "Article 29", "Article 31", "Article 30"], a: 0, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "According to the National Population Policy 2000, what is the target year for reaching stability in population?", o: ["2045", "2050", "2070", "2065"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "The practice of sati was made illegal and punishable in the year 1829, under Governor- General ______________.", o: ["William Bentinck", "John Shore", "Henry Hardinge", "Charles Metcalfe"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Which of the following tribal dances is performed in Tripura by the Mog community?", o: ["Wangala", "Hozagiri", "Hai-Hak", "Sangrai"], a: 3, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "Upon application of heat energy, the atoms of an ice cube start vibrating. At one point, the atoms have so much energy that they break away from their fixed position and loose the fixed structure. We can see this as the formation of water. What is this particular point called?", o: ["Softening point", "Decomposition temperature", "Boiling point", "Melting point"], a: 3, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "Shivnath Mishra is an exponent of Benaras Gharana and he plays the _________ .", o: ["Harmonium", "Rudra Veena", "Sitar", "Tabla"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "As per the 2nd Advance Estimate of the Ministry of Agriculture and Farmers Welfare, the record foodgrains production of _______ million tonnes is estimated in India in the year 2021-22.", o: ["378.54", "420.78", "501.16", "316.06"], a: 3, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Pancha Mahal is located in which of these cities?", o: ["Fatehpur Sikri", "Jaipur", "Delhi", "Ahmedabad"], a: 0, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "In which of the following years was the Gandhi-Irwin Pact signed with the government agreeing to release all political prisoners?", o: ["1930", "1928", "1931", "1929"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "What is the full form of ‘BPO’?", o: ["Buying Process Outsourcing", "Business Product Outsourcing", "Business Process Outcome", "Business Process Outsourcing"], a: 3, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which of the following is a biological name for a Housefly?", o: ["Poaceae", "Triticum aestivum", "Primata", "Musca domestica"], a: 3, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Which of the following Articles pertain to the Right against Exploitation?", o: ["Articles 23-24", "Articles 14-18", "Articles 25-28", "Articles 19-22"], a: 0, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "What is used to make transparent soaps?", o: ["Sodium chloride", "Ethanol", "Rosin", "Sodium carbonate"], a: 1, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "The concept of ‘Concurrent List’ in the Constitution of India is borrowed from ________.", o: ["Australia", "Germany", "Japan", "Canada"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Biswa and Phulaich are the cultural festivals of _____.", o: ["Himachal Pradesh", "West Bengal", "Karnataka", "Bihar"], a: 0, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "Which programme was restructured and renamed as ‘National Rural Employment Programme’?", o: ["Integrated Rural Development Programme", "Food for Work Programme", "National Institute of Rural Development", "Rural Landless Employment Guarantee Programme"], a: 1, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "Which Article of the Constitution defines Advocate General as the legal advisor to a State Government?", o: ["Article 166", "Article 165", "Article 164", "Article 167"], a: 1, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Which of the following Trophies/Cups is related to football?", o: ["Davis Cup", "Sultan Azlan Shah Cup", "Ranji Trophy", "Santosh Trophy"], a: 3, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Which of the following unemployment types is the result of people voluntarily leaving jobs in search of better ones?", o: ["Disguised unemployment", "Cyclical unemployment", "Frictional unemployment", "Structural unemployment"], a: 2, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "When was Dev Samaj established?", o: ["1850", "1902", "1860", "1887"], a: 3, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Which of the following statements is/are true about Regional Rural Banks? I. RRBs were established in 1977. II. The Government of India contributes 50% of the share capital of RRB. III. Narasimham Committee recommended the amalgamation of RRBs.", o: ["Only II and III", "Only I", "Only II", "Only III"], a: 2, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Padma Bhushan 2022, awardee _________ is a Hindustani Classical musician.", o: ["Madhuri Barthwal", "Victor Banerjee", "Geeta Chandran", "Rashid Khan"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following led to reservation of industrial activities for private and public sectors for the first time in India?", o: ["The Industrial Policy Resolution, 1948", "Industrial Policy Resolution, 1956", "The Statement of Industrial Policy, 1945", "Industries Development and Regulation Act, 1951"], a: 1, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "The term ‘scoop’ is used in which of the following sports?", o: ["Hockey", "Tennis", "Badminton", "Football"], a: 0, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "In which season do Western disturbances lead to rainfall in Northern states?", o: ["Summer season", "Monsoon season", "Spring season", "Winter season"], a: 3, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "In which of the following years did Mahatma Gandhi lead the Dandi March?", o: ["1930", "1914", "1919", "1918"], a: 0, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "For which of the following dance forms was Nalini Asthana awarded the Padma Shri in 2022?", o: ["Kathak", "Kathakali", "Bharatanatyam", "Mohiniyattam"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "The author of the book ‘My Music, My Life’ is the famous Sitar player. Who is he?", o: ["Hari Prasad Chaurasia", "Ravi Shankar", "Zakir Hussain", "Brij Narayan"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "During Chandragupta Maurya’s reign, the administration of Pataliputra, which was the capital of the Mauryas was managed by how many committees?", o: ["Three", "Eight", "Six", "Four"], a: 2, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Constitution of India says that a State shall not deny equal protection of the laws within the territory of India?", o: ["Article 12", "Article 14", "Article 11", "Article 13"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "In which two states is the Agasthyamala Biosphere Reserve located?", o: ["Maharashtra and Gujarat", "Kerala and Tamil Nadu", "Madhya Pradesh and Uttar Pradesh", "Gujarat and Rajasthan"], a: 1, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "The famous Hindi novel ‘Suraj Ka SatvanGhoda’ is written by:", o: ["Kamleshwar", "Phanishwar Nath Renu", "Dharmveer Bharati", "Sri Lal Shukla"], a: 2, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "In whose consultation does the President have the power to make rules to the procedure with respect to joint sittings of the two Houses?", o: ["Chairman and Speaker", "Speaker and Members of Lok Sabha", "Speaker, Chairman and Members of Parliament", "Chairman and members of Rajya Sabha"], a: 0, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Who is the main architect of Shri Ram Mandir of Ayodhya?", o: ["Chitra Vishwanath", "Chandrakant Bhai Sompura", "Sashi Prabhu", "Ram Suthar"], a: 1, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Delhi first became the capital of a kingdom during the reign of the _____.", o: ["Mamluks", "Tuglaqs", "Chauhans", "Tomara Rajputs"], a: 3, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "According to Census 2011, which state of India has the lowest population?", o: ["Mizoram", "Arunachal Pradesh", "Sikkim", "Goa"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Which of the following Iron and Steel Plants of India is situated on the coast of Bay of Bengal?", o: ["Bhadravati", "Salem", "Durgapur", "Vishakhapatnam"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "What is the position of the earth called when it is farthest from the sun during its revolution?", o: ["Abherilion", "Pepihelion", "Perihelion", "Aphelion"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Which Act led to the shift from curbing competition to promoting competition in the market?", o: ["MRTP Act 1969", "Competition Act 2002", "Banking Regulation Act 1949", "Copra Act"], a: 1, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "23nov2023-s3-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fourth number in the same way as the first number is related to the second number and the fifth number is related to the sixth number. 252 : 6 :: ? : 9 :: 1872 : 12", o: ["829", "729", "810", "750"], a: 2, e: "", qimg: "" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Find out the figure amongst the four option in which figure X is embedded (Rotation is not allowed)", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "23nov2023-s3-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "23nov2023-s3-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'MN' as shown below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "23nov2023-s3-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the word-pair that best represents a similar relationship to the one expressed in the pair of words given below. (The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word) Seismology : Earthquakes", o: ["Ornithology : Birds", "Paedology : Plants", "Entomology : Bone", "Craniology : Muscle"], a: 0, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern so that the final image is symmetrical.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "23nov2023-s3-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘COMPUTER’ is written as ‘DQNRVVFT’ and 'GARDENER' is written as 'HCSFFPFT'. How will ‘ACADEMIC’ be written as in that language?", o: ["BEBEFOJE", "BFBFFOJE", "BECFFOJE", "BEBFFOJE"], a: 3, e: "", qimg: "" },
  { n: 59, s: "Reasoning / Logical Ability", q: "A paper is folded and cut as shown below. How will it appear when unfolded?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "23nov2023-s3-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 34 * 58 * 2 * 96 * 4 = 29", o: ["−, ÷, +, ÷", "×, ÷, +, −", "+, ×, −, ÷", "÷, ×, +, −"], a: 0, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'PQ' as shown below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "23nov2023-s3-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "23nov2023-s3-q-62.png" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["3", "5", "1", "2"], a: 2, e: "", qimg: "23nov2023-s3-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the figure from the options that can replace the question mark (?) and complete the given pattern so that final image is symmetrical.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "23nov2023-s3-q-64.png" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the option figure that will replace the question mark (?) in the figure given below to complete the pattern.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "23nov2023-s3-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series. C _ _ D F_ A S _ F _ A S D _ C A _ D _", o: ["ASCDCSSF", "ASCDCDSF", "ASCDCFSF", "ASCDFCSF"], a: 2, e: "", qimg: "" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 6, 14, 46, 174, 686, ?", o: ["897", "3232", "2734", "344"], a: 2, e: "", qimg: "" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, even if it appears to be at variance with commonly known facts, decide which of the given conclusions logically follow(s) from the statements. Statements: Some soldiers are officers. Some officers are civilians. Conclusions: I. All soldiers are civilians. II. All civilians are soldiers.", o: ["Neither conclusion I nor II follows", "Only conclusion II follows", "Only conclusion I follows", "Both conclusions I and II follow"], a: 0, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Six students are sitting around a circular table facing the centre. Dipan is an immediate neighbour of both Hansika and Gargi. Ekansh is sitting second to the left of Gargi. Iman is sitting third to the right of Hansika. Firoz is an immediate neighbour of both Ekansh and Hansika. Who is an immediate neighbour of both Dipan and Iman?", o: ["Hansika", "Gargi", "Firoz", "Ekansh"], a: 1, e: "", qimg: "" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs that can sequentially replace the * signs and balance the given expression. 55 * 11 * 7 * 9 * 32 * 36", o: ["+, –, ×, ÷, =", "+, ×, –, =, ÷", "÷, +, ×, –, =", "×, +, –, ÷, ="], a: 2, e: "", qimg: "" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "23nov2023-s3-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["4", "1", "5", "3"], a: 3, e: "", qimg: "23nov2023-s3-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "In this question, Figure X is followed by four figures, numbered (1), (2), (3) and (4). Select the option in which Figure X is embedded.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "23nov2023-s3-q-73.png" }
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

  const TEST_TITLE = "Delhi Police Constable - 23 Nov 2023 Shift-3";
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
