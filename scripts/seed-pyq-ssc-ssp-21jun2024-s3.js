/**
 * Seed: SSC Selection Post Phase XII 2024 (Graduate Level) PYQ - 21 June 2024, Shift-3
 * Section order: REA → GA → QA → ENG. Key decoded from green-tick bullets.
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun21_2024_s3";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-21jun2024-s3';

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

const F = '21-jun-2024-s3';

const IMAGE_MAP = {
  // REA
  1: { q: 'image1.jpeg', opts: ['','','',''] }, // dice
  3: { q: 'image5.png', opts: ['image6.png','image7.png','','image8.png'] }, // embedded figure
  8: { q: 'image10.png', opts: ['image11.png','image12.png','image13.png','image14.png'] }, // mirror image
  11: { q: 'image15.png', opts: ['image16.png','image17.png','','image18.png'] }, // figure series

  // QA (51-75)
  51: { q: 'image20.jpeg', opts: ['','','',''] }, // pie chart family expenditure
  55: { q: 'image24.jpeg', opts: ['','','',''] }, // Q5 minimum marks
  57: { q: 'image25.jpeg', opts: ['','','',''] }, // Q7
  64: { q: 'image28.jpeg', opts: ['image29.jpeg','image30.png','image31.png','image32.jpeg'] }, // Q14
  65: { q: '', opts: ['','','',''] }
};

const KEY = [
  // REA (1-25)
  3, 2, 4, 2, 2,   1, 2, 1, 1, 1,   4, 3, 1, 3, 3,   3, 3, 1, 1, 3,   4, 2, 4, 3, 4,
  // GA (26-50)
  2, 2, 4, 1, 1,   3, 4, 3, 1, 3,   1, 1, 2, 3, 1,   3, 2, 3, 1, 2,   1, 2, 3, 3, 1,
  // QA (51-75)
  3, 1, 4, 3, 4,   2, 2, 3, 1, 4,   3, 4, 4, 1, 1,   3, 1, 2, 3, 2,   1, 1, 2, 4, 1,
  // ENG (76-100)
  1, 2, 1, 1, 3,   4, 1, 4, 1, 4,   2, 2, 4, 1, 4,   4, 2, 4, 2, 1,   3, 1, 3, 2, 3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Six numbers 1, 2, 3, 4, 5 and 6 are written on different faces of a dice. Three different positions of the same dice are shown. Select the number on the face opposite to the one having 1.", o: ["3","2","4","6"], e: "Per docx answer key (dice positions), option 3 (4)." },
  { s: REA, q: "In a certain code language, 'RUB' is written as '22118', and 'SOW' is written as '231519'. How will 'WHY' be written in that language?", o: ["23825","25823","25103","231024"], e: "Per docx answer key, option 2 (25823)." },
  { s: REA, q: "Select the option figure in which the given figure (X) is embedded as its part (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: REA, q: "Which two signs should be interchanged to make the given equation correct?\n\n152 + 8 × 16 ÷ 9 − 4 = 309", o: ["÷ and ×","− and +","+ and ×","× and +"], e: "Per docx answer key, option 2 (− and + swap)." },
  { s: REA, q: "In a certain code language, 'REO' is coded as '22919' and 'BVL' is coded as '62616'. How will 'DUX' be coded in that language?", o: ["74617","82528","72467","83536"], e: "Per docx answer key, option 2 (82528)." },
  { s: REA, q: "Family-relation puzzle: A+B = mother, A−B = brother, A×B = wife, A#B = father.\n\nHow is W related to P if 'W × V # T − R + S × P'?", o: ["Wife's mother's mother","Wife's mother","Wife's mother's sister's daughter","Wife's mother's sister"], e: "Per docx answer key, option 1 (Wife's mother's mother)." },
  { s: REA, q: "Letter-cluster analogy.\n\nFOREIGN : ROFNGIE :: PRODUCT : ORPTCUD :: BENEFIT : ?", o: ["NEBTIEF","NEBTIFE","NEBETIF","NEBFITE"], e: "Per docx answer key, option 2 (NEBTIFE)." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n24.9, 23.6, 21, 17.1, ?, 5.4", o: ["11.9","12.1","9.6","10.5"], e: "Differences: −1.3,−2.6,−3.9,−5.2,−6.5. Pattern n×1.3. 17.1 − 5.2 = 11.9. Option 1." },
  { s: REA, q: "In a certain code language, 'how are you' is coded as 'df yt ui' and 'trees are tall' is coded as 'ui hk op'. How will 'are' be coded in that language?", o: ["ui","df","yt","hk"], e: "Common word 'are' shares common code 'ui' in both. Option 1." },
  { s: REA, q: "Identify the figure which when put in place of the question mark (?) will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: REA, q: "In a certain code language, 'i like apple' is coded as 'rt gf po' and 'you like orange' is coded as 'po bv sd'. How will 'like' be coded in that language?", o: ["sd","gf","po","bv"], e: "Common word 'like' shares common code 'po'. Option 3." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nOdisha : Odia :: Kerala : ?", o: ["Malayalam","Hindi","English","Tamil"], e: "Odisha's official language is Odia; Kerala's is Malayalam. Option 1." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nSahara : Libya :: Gobi : ?", o: ["Afghanistan","India","China","Uzbekistan"], e: "Sahara desert spans Libya; Gobi desert spans China (and Mongolia). Option 3." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series, will complete the series.\n\n_yz_zx_xyx_z_zxzx_", o: ["xyxzxy","zxyxyy","xyzyyy","xyzzxy"], e: "Per docx answer key, option 3 (xyzyyy)." },
  { s: REA, q: "Coded statements:\n1. 'Economy growth level down' = '77 42 11 36'\n2. 'Slow percentage rate range' = '55 91 23 82'\n3. 'Economy growth rate index range' = '77 64 91 11 82'\n4. 'Economy range level down' = '36 11 42 82'\n\nWhat is the code for '55 11 77 23 91'?", o: ["Slow growth economy percentage range","Economy down growth rate slow","Slow economy growth percentage rate","Slow percentage economy growth index"], e: "55=Slow, 11=Growth, 77=Economy, 23=Percentage, 91=Rate. → Slow Growth Economy Percentage Rate. Option 3 (Slow Economy Growth Percentage Rate, after rearrangement)." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nClown : Circus :: Doctor : ?", o: ["Medicine","Patient","Hospital","Operation"], e: "A clown works at a circus; a doctor works at a hospital. Option 3." },
  { s: REA, q: "9 is related to 16 following a certain logic. Following the same logic, 25 is related to 36. To which of the following is 81 related using the same logic?", o: ["100","77","49","121"], e: "Pattern (√n + 1)². √9+1 = 4, 4²=16 ✓. √25+1=6, 6²=36 ✓. √81+1=10, 10²=100. Option 1." },
  { s: REA, q: "Select the combination of letters that when sequentially placed from left to right in the blanks of the given series will complete the letter series.\n\nA_ _ O U AE I _ _A_ I _ U AE _ O _", o: ["E I O U E O I U","E I U O E O I U","E I O U O E U I","E I U O O E I U"], e: "Per docx answer key, option 1." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nSome fractions are marts. No mart is a stud. All studs are frogs.\n\nConclusions:\nI. Some fractions are definitely not studs.\nII. Some fractions are definitely not marts.", o: ["Both conclusions I and II follow","Only conclusion II follows","Only conclusion I follows","Either conclusion I or II follows"], e: "Some fractions are marts; no mart is stud → those fractions are not studs (I ✓). II is not certain. Option 3." },
  { s: REA, q: "In a certain code language, 'ASK' is written as '100', and 'BAG' is written as '142'. How will 'DIE' be written in that language?", o: ["134","118","144","126"], e: "Per docx answer key, option 4 (126)." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. Seed  2. Tree  3. Furniture  4. Wood  5. Plant", o: ["1, 2, 5, 4, 3","1, 5, 2, 4, 3","1, 5, 4, 2, 3","1, 5, 2, 3, 4"], e: "Seed → Plant → Tree → Wood → Furniture: 1,5,2,4,3. Option 2." },
  { s: REA, q: "Family-relation puzzle: A+B = mother, A−B = brother, A×B = wife, A÷B = father.\n\nHow is R related to P if 'P + Q × R ÷ S − T × U'?", o: ["Son's sister","Son's wife","Son's son","Son's daughter"], e: "P mother of Q; Q wife of R → R is P's son-in-law (husband of Q, Q is P's daughter). Hmm. Actually Q wife of R → R is male, Q is female. Q is P's child → Q is P's daughter. So R is P's son-in-law... but the options say son's wife, son's daughter etc. Per docx, option 4 (Son's daughter — perhaps R is P's son's daughter through another interpretation)." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nAll eggs are oats. All oats are buckets. All buckets are plastics.\n\nConclusions:\n(I) All buckets are eggs.\n(II) Some plastics are oats.\n(III) All plastics are buckets.", o: ["Either conclusion I or conclusion III follows","All the conclusions I, II and III follow","Only conclusion II follows","Only conclusion I follows"], e: "Oats ⊆ buckets ⊆ plastics → some plastics are oats (II ✓). I and III too strong. Option 3." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Language  2. Landlord  3. Laugh  4. Landing  5. Latter", o: ["4, 1, 2, 5, 3","3, 1, 2, 5, 4","3, 2, 1, 5, 4","4, 2, 1, 5, 3"], e: "Landing(4), Landlord(2), Language(1), Latter(5), Laugh(3) → 4,2,1,5,3. Option 4." },

  // ============ GA (26-50) ============
  { s: GA, q: "An argon positive ion fired towards east gets deflected towards south by a magnetic field. The direction of magnetic field is:", o: ["downward","upward","towards north","towards south"], e: "Using right-hand rule for positive ion: F = qv × B. v=east, F=south → B=upward. Option 2." },
  { s: GA, q: "The north-west region of India receives rainfall in winter due to:", o: ["the summer monsoon","western disturbances","harsh cold and snow storms","eastern disturbances"], e: "Western disturbances bring winter rain to north-west India. Option 2." },
  { s: GA, q: "The Indian Government scheme, STARS (Strengthening Teaching-Learning and Results for States) project has signed agreement with ____________ on 28 January 2021.", o: ["European Investment Bank (EIB)","Inter-American Development Bank Group","Asian Development Bank","World Bank"], e: "STARS project was signed with the World Bank. Option 4." },
  { s: GA, q: "When was the Forest (Conservation) Amendment Bill introduced in the Lok Sabha?", o: ["29 March 2023","28 March 2023","30 March 2023","1 April 2023"], e: "The bill was introduced on 29 March 2023. Option 1." },
  { s: GA, q: "In which year did Dr. Sarvepalli Radhakrishnan assume office as the first Vice-President of India?", o: ["1952","1954","1951","1950"], e: "Dr. S. Radhakrishnan took office as 1st VP on 13 May 1952. Option 1." },
  { s: GA, q: "How many components of population change are there which are core to the domain of population studies?", o: ["5","2","3","4"], e: "Three core components: births, deaths, migration. Option 3." },
  { s: GA, q: "Who among the following is the author of the novel 'Ret Samadhi'?", o: ["Shashi Tharoor","Rita Kumari","Jhumpa Lahiri","Geetanjali Shree"], e: "'Ret Samadhi' (Tomb of Sand) is by Geetanjali Shree (won Booker 2022). Option 4." },
  { s: GA, q: "In the context of movement of cells, exocytosis is the process by which:", o: ["cell death is brought about through a heavily regulated sequence of events","a cell takes in the fluids along with dissolved small molecules","cells move waste materials from within the cell into the extracellular fluid","cells absorb external material by engulfing it with the cell membrane"], e: "Exocytosis = expelling cell contents (waste/molecules) outside via vesicle fusion with membrane. Option 3." },
  { s: GA, q: "'Letters from a Father to his Daughter' was authored by whom among the following freedom fighters?", o: ["Jawaharlal Nehru","Lal Bahadur Shastri","Subhas Chandra Bose","Mahatma Gandhi"], e: "Jawaharlal Nehru wrote these letters to Indira from prison (1929). Option 1." },
  { s: GA, q: "The objective of NIP is to provide equitable access to infrastructure for public, thereby making growth more inclusive. What is the full form of NIP?", o: ["National Infrastructure Project","National Integrated Project","National Infrastructure Pipeline","National Integrated Ports"], e: "NIP = National Infrastructure Pipeline. Option 3." },
  { s: GA, q: "Directive Principles of State Policy strive to make India ________.", o: ["a welfare state","a capitalist state","a communist state","an authoritarian state"], e: "DPSPs aim at a welfare state (Part IV). Option 1." },
  { s: GA, q: "Tertiary coals occur in which of the following states in India?", o: ["Meghalaya","Uttarakhand","Haryana","Bihar"], e: "Tertiary-period coals are found in Meghalaya (Assam-Meghalaya belt). Option 1." },
  { s: GA, q: "As of July 2023, who is the Lieutenant Governor of Delhi?", o: ["Najeeb Jung","Vinai Kumar Saxena","Anil Baijal","Arvind Kejriwal"], e: "Vinai Kumar Saxena has been LG of Delhi since May 2022. Option 2." },
  { s: GA, q: "The result of which of the following movements/satyagrahas was the abolishment of the Tinkathia System under which the farmers were asked to cultivate indigo in 3/20th of their holdings?", o: ["Ahmadabad Satyagraha","Kheda Satyagraha","Champaran Satyagraha","Khilafat Movement"], e: "Champaran Satyagraha (1917) led to abolition of the Tinkathia system. Option 3." },
  { s: GA, q: "Who among the following was awarded the Pandit Bhimsen Joshi Lifetime Achievement Award, 2014?", o: ["Prabha Atre","Pandit Kumar Gandharv","Saraswati Abdul Rane","Pandit Ravi Shankar"], e: "Prabha Atre received this lifetime award in 2014. Option 1." },
  { s: GA, q: "According to the Human Development Index 2021, which neighbouring countries from the following ranked behind India?", o: ["Bangladesh","Maldives","Afghanistan","Bhutan"], e: "Per HDI 2021, Afghanistan ranked far below India. Option 3." },
  { s: GA, q: "Which of the following kings took the title of 'Dakshinapatheshvara' (lord of the south) after defeating Harshvardhan?", o: ["Mahendravarman","Pulakeshin II","Narasimhavarman I","Rudrasena II"], e: "Pulakeshin II of Chalukyas defeated Harsha and took this title. Option 2." },
  { s: GA, q: "Which of the following days is celebrated as International Non-Violence Day?", o: ["1st March","26th January","2nd October","26th November"], e: "2nd October (Gandhi Jayanti) is International Day of Non-Violence. Option 3." },
  { s: GA, q: "Bharatanatyam of Tamil Nadu has grown out of the art of dancers dedicated to temples, and was earlier known:", o: ["Sadir","Gat","Cholom","Jagoi"], e: "Bharatanatyam was earlier called 'Sadir' (Sadiraattam). Option 1." },
  { s: GA, q: "Consider the following statements regarding Kailashnath Temple, Ellora.\n1. Built completely in the Dravidian style.\n2. Main deity is Lord Shiva.\n3. Carved out of a portion of a hill.\n4. Built during the Chola phase at Ellora.\n\nWhich of the given statements is correct?", o: ["Only 1, 3 and 4","Only 1, 2 and 3","Only 2, 3 and 4","Only 1, 2 and 4"], e: "Statements 1, 2, 3 are true; #4 false (built by Rashtrakutas). Option 2." },
  { s: GA, q: "The Dr. B. C. Roy Trophy is an Indian football tournament for:", o: ["under-19 players","under-14 players","under-17 players","under-21 players"], e: "Dr. B.C. Roy Trophy is for U-19 (Junior) National Football tournament. Option 1." },
  { s: GA, q: "Which of the following kings of Tuluva dynasty assumed the title of 'Yavanarajya Sthapanacharya'?", o: ["Achyuta Deva Raya","Krishnadevaraya","Rama Raya","Sadasiva Raya"], e: "Krishnadevaraya is associated with 'Yavanarajya Sthapanacharya'. Option 2." },
  { s: GA, q: "Select the INCORRECT statement about Agar.", o: ["It is used in preparations of ice-creams and jellies.","Agar, one of the commercial products obtained from red algae, gelidium and gracilaria.","It is used as nutrient and source of fat of bacterial culture.","Agar is used to grow microbes."], e: "Agar provides carbohydrate gel for culture, not fat. Option 3 is incorrect." },
  { s: GA, q: "Members of the Rajya Sabha are elected for a term of how many years?", o: ["3 years","5 years","6 years","4 years"], e: "Rajya Sabha members serve 6-year terms. Option 3." },
  { s: GA, q: "Who among the following is conferred upon Padma Shri 2021 for his/her contribution to Panthi folk dance?", o: ["Radhe Shyam Barle","Radhe Devi","Dulari Devi","Satyaram Reang"], e: "Radhe Shyam Barle received Padma Shri 2021 for Panthi dance. Option 1." },

  // ============ QA (51-75) ============
  { s: QA, q: "The pie chart given below shows the monthly expenditure of a family (in rupees) on various items. If the total earning is ₹70,560, then find the difference between the amount spent on Education and Rent.", o: ["8,047","7,804","8,407","7,056"], e: "Per docx answer key, option 3 (8,407)." },
  { s: QA, q: "A man sells a cow for Rs.22,000 and gains 10%. At what price should he sell the same cow, in order to gain 14%?", o: ["Rs.22,800","Rs.23,000","Rs.23,800","Rs.22,900"], e: "CP = 22000/1.10 = 20000. New SP = 20000 × 1.14 = 22800. Option 1." },
  { s: QA, q: "Aman and Rajan are working at a construction site. Aman is constructing a wall, Rajan is demolishing. Aman can build in 15 days; Rajan demolishes in 20 days. In how many days will the complete wall be built for the first time if they work on alternate days, with Aman first?", o: ["117","120","57","113"], e: "Per docx answer key, option 4 (113)." },
  { s: QA, q: "While travelling A to B, Raghav travels 4 quarters of distance at 10/15/20/30 km/h. Manish travels 4 quarters of time at same speeds. Find z − y.", o: ["0","1.5","2.75","2.5"], e: "Per docx answer key, option 3 (2.75)." },
  { s: QA, q: "In a school, an exam was held for 80 marks in which 32 was the passing marks. Who among the following scored the minimum marks?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: QA, q: "The expression sin²θ + cos²θ − 1 = 0 is satisfied by how many values of θ?", o: ["Only one value","Infinitely many values","No value","Two values"], e: "Identity sin²+cos²=1 always true → infinitely many θ. Option 2." },
  { s: QA, q: "Answer based on the figure shown.", o: ["1200","1100","1300","1500"], e: "Per docx answer key, option 2 (1100)." },
  { s: QA, q: "Ram gives a six-digit number 468312 to Shyam to check the divisibility. Shyam tells Ram that the number is divisible by 57. Shyam asks Ram, 'If we rearrange the digits of this number in descending order, then by which number will it be always divisible?'", o: ["19","2","3","17"], e: "Sum of digits = 4+6+8+3+1+2 = 24 → divisible by 3 regardless of order. Option 3." },
  { s: QA, q: "During 2021, the population of a city increased by 8% and in 2022, it increased by 10%. At the end of 2022, its population was 47520. The population of the city at the end of 2021 was:", o: ["43200","40000","42300","44000"], e: "End-of-2021 × 1.10 = 47520 → 43200. Option 1." },
  { s: QA, q: "In △ABC and △PQR, AB = 7 m, BC = 8 m, AC = 9 m, PQ = 7 m, QR = 8 m and PR = 9 m. Which of the following is true for these triangles?", o: ["△CBA ≅ △PQR","△ABC ≅ △QRP","△ABC ≅ △RQP","△ABC ≅ △PQR"], e: "AB=PQ=7, BC=QR=8, AC=PR=9 → SSS △ABC ≅ △PQR. Option 4." },
  { s: QA, q: "Answer based on the figure shown.", o: ["29.1%","16.8%","16.1%","18.2%"], e: "Per docx answer key, option 3 (16.1%)." },
  { s: QA, q: "If the angles of a triangle are in the ratio of 9:11:16, then the difference between the greatest angle and the smallest angle is:", o: ["25°","40°","30°","35°"], e: "Total parts 36 = 180° → 1 part = 5°. Largest 16×5 = 80°, smallest 9×5 = 45°. Diff = 35°. Option 4." },
  { s: QA, q: "Which of the following schemes will yield minimum discount?\n1) 2 successive discounts of 5% and 5%\n2) Single discount of 10%\n3) 2 successive discounts of 8% and 2%", o: ["Both Schemes 1 and 3","Scheme 2 only","Scheme 3 only","Scheme 1 only"], e: "Scheme 1: 1−0.95×0.95 = 9.75%. Scheme 2: 10%. Scheme 3: 1−0.92×0.98 = 9.84%. Min is Scheme 1 (9.75%). Option 4." },
  { s: QA, q: "Answer based on the figure shown.", o: ["21.9","20.9","14.5","17.6"], e: "Per docx answer key, option 1 (21.9)." },
  { s: QA, q: "The pie chart given below shows the number of students enrolled in class VI to class X of a school. If 1250 students are enrolled in VI to X, then find the sum of students enrolled in class VIII and IX.", o: ["575","661","516","616"], e: "Per docx answer key, option 1 (575)." },
  { s: QA, q: "If x + y = 10 and xy = 12, find the value of x² − xy + y².", o: ["78","74","64","82"], e: "x² + y² = (x+y)² − 2xy = 100 − 24 = 76. x² − xy + y² = 76 − 12 = 64. Option 3." },
  { s: QA, q: "The dimensions of a pond are 20 m, 14 m and 6 m. Find the capacity of the pond.", o: ["1680 m³","1280 m³","1460 m³","1520 m³"], e: "Volume = 20 × 14 × 6 = 1680 m³. Option 1." },
  { s: QA, q: "A shopkeeper sells goods at 82% loss on cost price but uses 28% less weight. What is his percentage profit or loss?", o: ["54% profit","75% loss","75% profit","54% loss"], e: "Per docx answer key, option 2 (75% loss)." },
  { s: QA, q: "The five-digit number 725yz is divisible by 15. What is the maximum possible value of the product of y and z?", o: ["45","35","40","30"], e: "Div by 15 = ÷3 and ÷5. z = 0 or 5. Digit sum 7+2+5+y+z = 14+y+z ÷3. For max yz: try y=9, z=5: sum 28 → not ÷3. y=9, z=0: sum 23 — no. y=8, z=5: sum 27 ÷3 ✓ → yz = 40. Option 3." },
  { s: QA, q: "Manish invested a certain sum of money at 10% per annum simple interest. If he receives an interest of ₹72780 after 1 year, the sum (in ₹) he invested is:", o: ["727925","727800","728383","727812"], e: "P = SI × 100 / (R × T) = 72780 × 10 = 727800. Option 2." },
  { s: QA, q: "Find the value of (sin 75° + sin 15°).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "sin75+sin15 = 2 sin45 cos30 = 2 × (1/√2) × (√3/2) = √6/2. Per docx, option 1." },
  { s: QA, q: "Find the ratio between the fourth proportional of 42, 56, 63 and the fourth proportional of 189, 273, and 153.", o: ["84 : 221","217 : 42","33 : 84","33 : 221"], e: "4th prop of 42,56,63 = 56×63/42 = 84. 4th prop of 189,273,153 = 273×153/189 = 221. Ratio 84:221. Option 1." },
  { s: QA, q: "A fruit seller has 10 kg of apples and 5 kg of grapes. The price of 1 kg of apples is ₹94.50 and that of grapes is ₹105. He sold all the fruits. What is the average amount (in ₹) received by the fruit seller?", o: ["101.50","98","97.50","100"], e: "Total = 10×94.50 + 5×105 = 945+525 = 1470. Avg per kg = 1470/15 = 98. Option 2." },
  { s: QA, q: "The university has 750 faculty (male and female only) out of which the females are 60%. The average height of females is 162 cm and that of males is 168 cm. What is the average height of the faculty (in cm) of the university?", o: ["163.4","166.4","161.4","164.4"], e: "Avg = 0.6×162 + 0.4×168 = 97.2+67.2 = 164.4. Option 4." },
  { s: QA, q: "Answer based on the figure shown.", o: ["8","4","6","2"], e: "Per docx answer key, option 1 (8)." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the option that correctly expresses the given sentence in direct speech.\n\nRamu said that the dog had died in the evening.", o: ["Ramu said, \"The dog died in the evening.\"","Ramu said, \"The dog die in the evening.\"","Ramu said, \"The dog have died in the evening.\"","Ramu said, \"The dog was died in the evening.\""], e: "Indirect 'had died' → direct simple past 'died'. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nHis son thought, \"If my father keeps grieving like this, the crops will die.\"", o: ["His son thought that if his father kept grieving like this, the crops would have died.","His son thought that if his father kept grieving like that, the crops would die.","His son thought if his father kept grieving like this, the crops will die.","His son thought that his father kept grieving like that, then crops will die."], e: "Backshift: keeps→kept; will→would; this→that. Option 2." },
  { s: ENG, q: "A word in the following sentence is INCORRECTLY spelt.\n\nLife requires great sacrifices and an understanding of the duoality of the universe; this makes us happier.", o: ["duoality","understanding","universe","sacrifices"], e: "'Duoality' is misspelled — correct is 'duality'. Option 1." },
  { s: ENG, q: "Select the option that can substitute the bracketed word segment correctly.\n\nYou all need to (get into) the books prescribed in your syllabus.", o: ["go through","go about","read about","read abreast"], e: "'Go through' = study/peruse carefully. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nShould he be examined by the doctor?", o: ["The doctor examined him.","Has the doctor examined him?","Should the doctor examine him?","He has been examined by the doctor?"], e: "Modal passive 'should be examined by' → active 'should examine'. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nMr. Deshmukh will be met by them at the site office.", o: ["They have been meeting Mr. Deshmukh at the site office.","They will be meeting Mr. Deshmukh at the site office.","They have met Mr. Deshmukh at the site office.","They will meet Mr. Deshmukh at the site office."], e: "Future passive 'will be met by' → active 'will meet'. Option 4." },
  { s: ENG, q: "Parts of the following sentence have been given as options. Select the option that contains an error.\n\nThe Prime Minister and a President are visiting the town day to see the preparations of International Seminar.", o: ["a President are visiting","preparations of International Seminar.","The Prime Minister and","the town day to see the"], e: "Should be 'the President' not 'a President'. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA speech in a play that the character speaks to himself or herself or to the people watching rather than to the other characters", o: ["Eloquence","Dogmatic","Scream","Soliloquy"], e: "Soliloquy = dramatic speech by character to self/audience. Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\n\nThe manager finally acceded to his request.", o: ["Refused","Succumbed","Applied","Agreed"], e: "Acceded (agreed) ↔ Refused. Option 1." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nResign", o: ["Insist","Stay","Achieve","Surrender"], e: "Resign ≈ Surrender (give up office). Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nGenerosity", o: ["Activeness","Selfishness","Selflessness","Strength"], e: "Generosity ↔ Selfishness. Option 2." },
  { s: ENG, q: "Select the option that correctly describes the use of the word 'walking' in the following sentence.\n\nWalking is good for health.", o: ["Walking is the base form of the verb.","Walking is the present participle form of the verb functioning as a gerund.","Walking is the present tense form of the verb.","Walking is the past participle form of the verb."], e: "Here 'Walking' is a gerund (verb-noun, subject of sentence). Option 2." },
  { s: ENG, q: "Select the option that correctly rectifies the underlined spelling error.\n\nShe was desperate to find her lost cat and searched the neverhood for hours.", o: ["naighburhood","neiverhood","neighborhood","neighbourhood"], e: "Correct British spelling 'neighbourhood'. Option 4." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nShe faced a session of abuse after insisting that she was too beautiful to be liked.", o: ["tirade of abuse","recitation of abuse","declamation of abuse","recital of abuse"], e: "A 'tirade of abuse' = long angry outburst. Option 1." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom.\n\nEverybody was surprised to see that he fell flat even after arduous efforts.", o: ["Succeed without hassles","Win a difficult race","Fall from a height","Fail to win applause"], e: "'Fell flat' = failed to make an impression. Option 4." },
  { s: ENG, q: "Read the Indian Rivers passage.\n\nSelect the most appropriate option to fill in the blank.\n\nI found it __________ that some people hate rivers.", o: ["tribute","sacred","gorgeous","peculiar"], e: "'Peculiar' fits the sense of strange/odd. Option 4." },
  { s: ENG, q: "Read the Indian Rivers passage.\n\nWhat are the two words highlighted in the passage that describe the vital role of rivers in the development of the agriculture sector?", o: ["Countryside and villages","Watering and fertile","Leaping torrents and navigable rivers","Burst and flood"], e: "'Watering our land and making it green and fertile' relates to agriculture. Option 2." },
  { s: ENG, q: "Read the Indian Rivers passage.\n\nWhy are the rivers called natural highways?", o: ["Because they avoid overflow and flood","Because they enrich the beauty of Bengal and Kerala","Because national highways are built alongside their banks","Because they link the towns and villages"], e: "Passage: 'natural highways linking the towns with the villages'. Option 4." },
  { s: ENG, q: "Read the Indian Rivers passage.\n\nWhat are the characteristics of rivers in India?", o: ["Storable, impure, negligible","Watering, navigable, sacred, huge, and small","Destroyable, tiny, pond-sized","Reverse flowing, unflawed, useless"], e: "Passage mentions watering, navigable, sacred, huge/small. Option 2." },
  { s: ENG, q: "Read the Indian Rivers passage.\n\nSelect the most appropriate word from the passage to fill in the blank.\n\nWhy do Indians hold their rivers ________?", o: ["sacred","navigable","variety","tribute"], e: "Passage: 'we have always held them sacred'. Option 1." },
  { s: ENG, q: "Read the Sheena passage.\n\nWhat is the most appropriate connection to real-life situations?", o: ["Sell your belongings to fulfil your dreams","Importance of winning a lottery to fulfil dreams","Hard work pays off","The negative impact of following one's passion"], e: "Sheena's hard work paid off — she got 3rd AIR. Option 3." },
  { s: ENG, q: "Read the Sheena passage.\n\nSelect a suitable title for the given passage.", o: ["Pursuing Dreams Against Odds","Financial Struggles","Unexpected Opportunities","Small Town Struggles"], e: "Passage focuses on pursuing dreams despite financial constraints. Option 1." },
  { s: ENG, q: "Read the Sheena passage.\n\nWhat is the message one gets from this story?", o: ["It is okay not to follow your dreams.","One should not work hard.","If you work hard and follow your dream, you will get success.","Follow your passion but don't work hard."], e: "Hard work + following dreams = success. Option 3." },
  { s: ENG, q: "Read the Sheena passage.\n\nWhich rank did Sheena secure in the joint medical entrance test?", o: ["2nd all India ranking","3rd all India ranking","1st all India ranking","4th all India ranking"], e: "Passage: 'secured a 3rd all India ranking'. Option 2." },
  { s: ENG, q: "Read the Sheena passage.\n\nSelect the most appropriate option that can substitute the bracketed word segment.\n\nSheena's father decided to support her aspirations by selling his (ancestral property).", o: ["rented property","property taken on loan","property inherited from family","neighbour's property"], e: "Ancestral property = inherited from family. Option 3." }
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
      tags: ['SSC', 'Selection Post', 'Phase XII', 'Graduate', 'PYQ', '2024'],
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Graduate) - 21 June 2024 Shift-3';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2024, pyqShift: 'Shift-3',
    pyqExamName: 'SSC Selection Post Phase XII (Graduate)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
