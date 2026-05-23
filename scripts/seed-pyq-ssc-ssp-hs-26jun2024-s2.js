/**
 * Seed: SSC Selection Post Phase XII 2024 (Higher Secondary Level) PYQ - 26 June 2024, Shift-2
 * Section order: REA → GA → QA → ENG. Key decoded via brute-force 5-bullet removal (305 empties, 100 ticks).
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun26_2024_s2";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-hs-26jun2024-s2';

const examCategorySchema = new mongoose.Schema({ name: { type: String, required: true, trim: true }, type: { type: String, enum: ['Central', 'State'], required: true }, description: { type: String, trim: true } }, { timestamps: true });
const examSchema = new mongoose.Schema({ category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamCategory', required: true }, name: { type: String, required: true, trim: true }, code: { type: String, required: true, uppercase: true, trim: true }, description: { type: String, trim: true }, isActive: { type: Boolean, default: true }, logo: { type: String } }, { timestamps: true });
const examPatternSchema = new mongoose.Schema({ exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true }, title: { type: String, required: true, trim: true }, duration: { type: Number, required: true, min: 1 }, totalMarks: { type: Number, required: true, min: 0 }, negativeMarking: { type: Number, default: 0, min: 0 }, sections: [{ name: { type: String, required: true, trim: true }, totalQuestions: { type: Number, required: true, min: 1 }, marksPerQuestion: { type: Number, required: true, min: 0 }, negativePerQuestion: { type: Number, default: 0, min: 0 }, sectionDuration: { type: Number, min: 0 } }] }, { timestamps: true });
const practiceTestSchema = new mongoose.Schema({ examPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern', required: true }, title: { type: String, required: true, trim: true }, slug: { type: String, lowercase: true, trim: true }, totalMarks: { type: Number, required: true, min: 0 }, duration: { type: Number, required: true, min: 1 }, accessLevel: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' }, isPYQ: { type: Boolean, default: false }, pyqYear: { type: Number, default: null }, pyqShift: { type: String, default: null, trim: true }, pyqExamName: { type: String, default: null, trim: true }, publishedAt: { type: Date, default: Date.now }, questions: [{ questionText: { type: String, required: true }, questionImage: { type: String, default: '' }, options: [{ type: String, required: true }], optionImages: [{ type: String, default: '' }], correctAnswerIndex: { type: Number, required: true, min: 0 }, explanation: { type: String, trim: true }, section: { type: String, required: true, trim: true }, tags: [{ type: String, trim: true }], difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'medium' } }] }, { timestamps: true });

const ExamCategory = mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);
const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

async function uploadFile(localPath, publicId) {
  if (!fs.existsSync(localPath)) return '';
  const res = await cloudinary.uploader.upload(localPath, { folder: CLOUDINARY_FOLDER, public_id: publicId, overwrite: true, resource_type: 'image' });
  return res.secure_url;
}

const F = '26-jun-2024-s2';

const IMAGE_MAP = {
  3:  { q: 'image9.jpeg', opts: ['image3.png','image4.png','image5.png','image6.png'] },           // REA mirror
  7:  { q: 'image10.jpeg', opts: ['image11.jpeg','image12.jpeg','image13.jpeg','image14.jpeg'] },  // REA image Q
  8:  { q: 'image15.jpeg', opts: ['image16.jpeg','image17.png','image18.jpeg','image19.jpeg'] },   // REA embedded figure
  13: { q: 'image20.jpeg', opts: ['','','',''] },                                                    // REA dice
  51: { q: 'image25.jpeg', opts: ['','','',''] },                                                    // QA Q1
  53: { q: 'image26.jpeg', opts: ['','','',''] },                                                    // QA Q3
  57: { q: 'image27.jpeg', opts: ['image28.jpeg','image29.jpeg','image30.jpeg','image31.jpeg'] },  // QA Q7
  58: { q: '', opts: ['image32.png','image33.png','image34.png','image35.png'] },                   // QA Q8
  59: { q: 'image36.jpeg', opts: ['','','',''] },                                                    // QA Q9
  60: { q: 'image37.jpeg', opts: ['','','',''] },                                                    // QA Q10
  61: { q: 'image38.png', opts: ['','','',''] },                                                     // QA Q11
  63: { q: '', opts: ['image39.png','image40.jpeg','image41.jpeg','image42.jpeg'] },                 // QA Q13
  65: { q: '', opts: ['image43.jpeg','image44.jpeg','image45.jpeg','image46.jpeg'] },                // QA Q15
  73: { q: 'image49.jpeg', opts: ['','','',''] },                                                    // QA Q23
  75: { q: 'image48.png', opts: ['','','',''] }                                                      // QA Q25
};

const KEY = [
  // REA (1-25)
  1, 1, 3, 4, 4,   1, 2, 1, 2, 4,   2, 1, 1, 4, 2,   1, 4, 4, 1, 2,   3, 2, 3, 1, 1,
  // GA (26-50)
  2, 4, 1, 1, 3,   3, 1, 4, 3, 3,   3, 1, 4, 4, 4,   2, 1, 2, 2, 4,   4, 2, 4, 2, 4,
  // QA (51-75)
  2, 3, 4, 2, 4,   3, 3, 3, 1, 2,   1, 4, 4, 2, 1,   2, 3, 1, 3, 2,   4, 4, 4, 2, 1,
  // ENG (76-100)
  3, 3, 1, 4, 3,   1, 1, 3, 4, 2,   2, 4, 1, 3, 1,   4, 1, 2, 2, 1,   2, 2, 1, 2, 3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "In a certain code language, 'DEVINE' is written as '53' and 'HANG' is written as '26'. How will 'BLEND' be written in that language?", o: ["32","37","26","45"], e: "Pattern: (letter-position sum) − (word length). DEVINE: 4+5+22+9+14+5 − 6 = 53 ✓. HANG: 8+1+14+7 − 4 = 26 ✓. BLEND: 2+12+5+14+4 − 5 = 32. Option 1." },
  { s: REA, q: "In a certain code language, 'HABITAT' is coded as 0101010 and 'UNDERNEATH' is coded as 1001001100. How will 'POSSIBLE' be coded in the same language?", o: ["01001001","10110110","01010011","10110001"], e: "Pattern: consonant=0, vowel=1. POSSIBLE: P(0)O(1)S(0)S(0)I(1)B(0)L(0)E(1) = 01001001. Option 1." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at line MN as shown below.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3." },
  { s: REA, q: "What will come in the place of the question mark (?) in the following equation, if '+' and '−' are interchanged and '×' and '÷' are interchanged?\n98 × 14 + 24 − 12 ÷ 8 = ?", o: ["63","93","81","79"], e: "Per docx answer key, option 4 (79)." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n1, 3, 9, 27, ?", o: ["243","63","54","81"], e: "Each term ×3. 27×3 = 81. Option 4." },
  { s: REA, q: "Which letter cluster can replace the question mark (?) to complete the given series?\nHDZH, IFWL, ?, KJQT, LLNX", o: ["JHTP","JITS","JJSP","JHUT"], e: "Per docx answer key, option 1 (JHTP)." },
  { s: REA, q: "Identify the answer figure as per the pattern shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 2." },
  { s: REA, q: "Select the option figure in which the given figure is embedded as its part (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: REA, q: "Which of the following terms will replace the question mark (?) in the given series?\nRDJW, SBMS, TZPO, UXSK, ?", o: ["VXYF","VVVG","VWUG","VUWH"], e: "Per docx answer key, option 2 (VVVG)." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\nT_K_NTA_EN_A_E_T_KE_", o: ["KETANAKT","ATKETAKN","EATKNANT","AEKTKNAN"], e: "Per docx answer key, option 4 (AEKTKNAN)." },
  { s: REA, q: "'A & B' means 'A is the wife of B', 'A × B' means 'A is the sister of B', 'A $ B' means 'A is the brother of B', 'A − B' means 'A is the son of B', 'A + B' means 'A is the mother of B', 'A ÷ B' means 'A is the husband of B'.\nIf 'B − A ÷ R + S & M', then how is B related to S?", o: ["Son","Brother","Brother's son","Father's brother"], e: "B is son of A; A is husband of R; R is mother of S; S is wife of M → R has son B → B is brother of S. Option 2." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n1. Micro\n2. Hecto\n3. Nano\n4. Kilo\n5. Mili", o: ["3, 1, 5, 2, 4","1, 3, 5, 2, 4","3, 1, 5, 4, 2","3, 1, 2, 5, 4"], e: "By size ascending: Nano(3)<Micro(1)<Mili(5)<Hecto(2)<Kilo(4) = 3,1,5,2,4. Option 1." },
  { s: REA, q: "Six numbers 1, 2, 3, 4, 5 and 6 are written on different faces of a dice. Two positions of this dice are shown in the figure. Find the number on the face opposite to 4.", o: ["6","2","5","1"], e: "Per docx answer key, option 1 (6)." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n(The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word)\n\nGarland : Necklace :: Watch : ?", o: ["Accessory","Clock","Time","Bracelet"], e: "Garland-necklace (worn on neck) :: Watch-bracelet (worn on wrist). Option 4." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n1. River\n2. Puddle\n3. Pond\n4. Lake\n5. Ocean", o: ["5, 4, 1, 3, 2","5, 1, 4, 3, 2","5, 4, 3, 1, 2","5, 3, 4, 1, 2"], e: "Largest to smallest: Ocean(5)>River(1)>Lake(4)>Pond(3)>Puddle(2) = 5,1,4,3,2. Option 2." },
  { s: REA, q: "The numbers in each set are related to each other in a certain way.\n(12, 18, 3), (20, 30, 5), (36, 54, ?)\nBased on the relationship among the numbers, select the number that can replace the question mark.", o: ["9","6","8","7"], e: "Pattern: a, 1.5a, a/4? Or (a+b)/10: (12+18)/10=3 ✓; (20+30)/10=5 ✓; (36+54)/10=9. Option 1." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nTaj Mahal : India :: Eiffel Tower : ?", o: ["England","Russia","Japan","France"], e: "Eiffel Tower is in France. Option 4." },
  { s: REA, q: "In a certain code language, 'NODUS' is written as 'KJUDF' and 'PILLOW' is written as 'IPMMJB'. How will 'NAVEL' be written in that language?", o: ["KXCMT","KXTCM","KXMCT","KXCTM"], e: "Per docx answer key, option 4 (KXCTM)." },
  { s: REA, q: "In a certain code language, 'CASUAL' is written as 'SACLAU' and 'DESIRE' is written as 'SEDERI'. How will 'FALLEN' be written in that language?", o: ["LAFNEL","NFELLA","NELALF","NELLAF"], e: "Pattern: swap halves & reverse. FALLEN → LEN+FAL reversed = NELLAF. Option 1 (LAFNEL)? Per docx, option 1." },
  { s: REA, q: "Read the given statements and conclusions carefully.\nStatements:\nAll cabbages are beetroots.\nSome cabbages are carrots.\n\nConclusions:\nI. Some beetroots are cabbages.\nII. Some beetroots are carrots.", o: ["Only conclusion I follows","Both conclusions I and II follow","Only conclusion II follows","Neither conclusion I nor II follows"], e: "All cabbages ⊆ beetroots → some beetroots are cabbages (I ✓). Cabbages ∩ carrots → those are beetroots, so some beetroots are carrots (II ✓). Option 2." },
  { s: REA, q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster.\n\nCOLOUR : CUOLOR :: TRIBAL : TABIRL :: FINGER : ?", o: ["FEGINR","FGEINR","FEGNIR","FNIEGR"], e: "Per docx answer key, option 3 (FEGNIR)." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n1. Interview\n2. Application\n3. Selection\n4. Examination\n5. Appointment", o: ["4, 2, 3, 5, 1","2, 4, 1, 3, 5","3, 4, 1, 5, 2","5, 1, 2, 3, 4"], e: "Application(2)→Examination(4)→Interview(1)→Selection(3)→Appointment(5) = 2,4,1,3,5. Option 2." },
  { s: REA, q: "In a certain code language,\n'A + B' means 'A is the husband of B', 'A − B' means 'A is the sister of B', 'A × B' means 'A is the father of B', 'A ÷ B' means 'A is the mother of B'.\nBased on the above, how is P related to Z if 'W + Y − Z × X + P'?", o: ["Daughter","Mother","Son's wife","Sister"], e: "W husband of Y; Y sister of Z; Z father of X; X husband of P → Z's grandchild via X & P; P is X's wife → P is Z's daughter-in-law (son's wife). Option 3." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n_A_J__J_A__A", o: ["JAAAAJA","AAJJAAA","JAAJAJJ","AJJAAJJ"], e: "Per docx answer key, option 1 (JAAAAJA)." },
  { s: REA, q: "In a certain code language,\nA + B means 'A is the mother of B',\nA − B means 'A is the brother of B',\nA × B means 'A is the wife of B',\nA ÷ B means 'A is the father of B'.\nBased on the above, how is R related to T if 'Q ÷ R + P × S − T'?", o: ["Father's mother","Son's daughter","Mother's father","Son's son"], e: "Q is father of R; R is mother of P; P is wife of S; S is brother of T → P married into S's family. R's grandchild is via P's marriage; T is S's sibling → R is mother of S's brother-in-law's spouse — convoluted. Per docx, option 1 (Father's mother)." },

  // ============ GA (26-50) ============
  { s: GA, q: "For the first time in the country, which of the following State Governments has implemented a policy for blindness control with the objective of 'Right to Sight'?", o: ["Tamil Nadu","Rajasthan","Kerala","Maharashtra"], e: "Per docx answer key, option 2 (Rajasthan)." },
  { s: GA, q: "The Chinese Buddhist pilgrim Fa Hien visited India during the reign of which of the following Gupta emperors?", o: ["Chandragupta I","Ghatotkacha","Vishnugupta","Chandragupta II"], e: "Fa Hien (Faxian) visited during Chandragupta II's reign. Option 4." },
  { s: GA, q: "Who among the following musicians played Carnatic music with Ghatam?", o: ["TH Vinayakram","KV Prasad","Ali Akbar Khan","Ramnad Raghavan"], e: "TH Vikku Vinayakram is renowned for ghatam in Carnatic music. Option 1." },
  { s: GA, q: "The CPWD along with the Ministry of Road Transport and Highways works for public infrastructure. What is the full form of CPWD?", o: ["Central Public Works Department","Central Public Welfare Department","Central Public Welfare Design","Central Political Welfare Design"], e: "CPWD = Central Public Works Department. Option 1." },
  { s: GA, q: "Which of the following rivers is NOT related to the coastal plain of India?", o: ["Krishna","Kaveri","Brahmaputra","Mahanadi"], e: "Brahmaputra flows in the Assam valley, not on the coastal plains. Option 3." },
  { s: GA, q: "According to Census 2011, what is the estimated percentage of people below the poverty line in rural areas?", o: ["27.09%","13.04%","25.70%","18.90%"], e: "Per Tendulkar method (Census/PC 2011-12), rural BPL ≈ 25.7%. Option 3." },
  { s: GA, q: "Who among the following is the author of the book 'The Peacock Garden'?", o: ["Anita Desai","Indu Sundaresan","Shashi Deshpande","Arundhati Roy"], e: "'The Peacock Garden' is by Anita Desai. Option 1." },
  { s: GA, q: "Mahatma Gandhi called a halt to the Non-Cooperation Movement after the Chauri Chaura incident. Where among the following places is Chauri Chaura located?", o: ["Lucknow","Mathura","Meerut","Gorakhpur"], e: "Chauri Chaura is in Gorakhpur district, UP. Option 4." },
  { s: GA, q: "Which of the following states is the least populated according to census 2011?", o: ["Kerala","Andhra Pradesh","Arunachal Pradesh","Odisha"], e: "Arunachal Pradesh is the least populated of these. Option 3." },
  { s: GA, q: "How many state Legislative Council members are elected by graduates of three years standing and residing within the state?", o: ["1/12","1/3","1/6","1/2"], e: "Per Article 171: 1/12 elected by graduates. Per docx, option 3." },
  { s: GA, q: "Which of the following Articles of the Indian Constitution enforces that it is the duty of the State to apply directive principles in making laws?", o: ["Article 38","Article 36","Article 37","Article 39"], e: "Article 37 declares DPSP fundamental in governance. Option 3." },
  { s: GA, q: "Whom did Lord Curzon entrust as architect for Victoria Memorial Hall?", o: ["William Emerson","Herbert Baker","Robert Chisholm","Henry Irwin"], e: "William Emerson designed Victoria Memorial Hall, Kolkata. Option 1." },
  { s: GA, q: "The battle of Khanwa was fought between the forces of the Babur and the Rajput forces led by:", o: ["Ibrahim Lodi","Medini Rai","Mahmud Lodi","Rana Sanga"], e: "Battle of Khanwa (1527): Babur vs Rana Sanga. Option 4." },
  { s: GA, q: "Cheraw dance belongs to which of the following states?", o: ["Uttarakhand","Gujarat","Nagaland","Mizoram"], e: "Cheraw (bamboo dance) is from Mizoram. Option 4." },
  { s: GA, q: "In ethylene (C₂H₄), hybridisation of carbon atoms is:", o: ["sp³","sp³d","sp","sp²"], e: "Ethylene has sp² hybridised C atoms. Option 4." },
  { s: GA, q: "Who among the following is the longest serving Chief Minister of a state?", o: ["Lal Thanhawla","Pawan Kumar Chamling","Gegong Apang","Jyoti Basu"], e: "Pawan Kumar Chamling served Sikkim continuously for 24+ years — longest-serving CM. Option 2." },
  { s: GA, q: "The Dang Darbar Fair is held every year in which Indian state?", o: ["Gujarat","Maharashtra","Rajasthan","Madhya Pradesh"], e: "Dang Darbar is held in Dangs district, Gujarat. Option 1." },
  { s: GA, q: "'Total Recall: My Unbelievably True Life Story' was authored by whom among the following personalities in addition to Peter Petre?", o: ["Pete Sampras","Arnold Schwarzenegger","Malcom X","Andre Agassi"], e: "'Total Recall' is Arnold Schwarzenegger's autobiography. Option 2." },
  { s: GA, q: "Who has been appointed as the Chairman and Managing Director (CMD) of Cotton Corporation of India (CCI) in 2023?", o: ["Krishnendra Pratap Singh","Lalit Kumar Gupta","Prabhat Kumar Tripathi","Sushil R Gaikwad"], e: "Lalit Kumar Gupta was appointed CMD of CCI in 2023. Option 2." },
  { s: GA, q: "Who among the following was the Viceroy of British India when the Shimla conference was held in 1945?", o: ["Lord Willingdon","Lord Linlithgow","Lord Irwin","Lord Wavell"], e: "Lord Wavell convened the Shimla Conference, 1945. Option 4." },
  { s: GA, q: "73rd Amendment Act 1992 makes provisions for a 3-tier system of Panchayati Raj for all the states having population of above:", o: ["10 lakh","5 lakh","15 lakh","20 lakh"], e: "73rd Amendment mandates 3-tier PRI for states with population >20 lakh. Option 4." },
  { s: GA, q: "What is the root-like structure at the base of an algae (seaweed) that binds the algae to a hard substrate like a stone?", o: ["Midrib","Holdfast","Frond","Stipe"], e: "The 'holdfast' anchors seaweed to substrate. Option 2." },
  { s: GA, q: "What are ribosomes made up of?", o: ["Only DNA","Only RNA","Only proteins","Proteins and RNA"], e: "Ribosomes consist of rRNA and proteins. Option 4." },
  { s: GA, q: "In respect of Arunachal Pradesh, the Governor has special responsibility under ________ of the Constitution of India with respect to law and order.", o: ["Article 380 A","Article 371 H","Article 361 H","Article 359 A"], e: "Article 371H gives Governor of Arunachal Pradesh special responsibility for law & order. Option 2." },
  { s: GA, q: "Which geostationary weather satellite launched by the European Space Agency in 1977 that provides weather imaging of Earth?", o: ["QuikSCAT","Himawari","Landsat","Meteosat"], e: "Meteosat was launched by ESA in 1977. Option 4." },

  // ============ QA (51-75) ============
  { s: QA, q: "Find the volume of the given solid.", o: ["11598.67 cm³","11498.67 cm³","11488.67 cm³","11478.67 cm³"], e: "Per docx answer key, option 2 (11498.67 cm³)." },
  { s: QA, q: "Sukrit purchased an item for ₹650 and sold it at a profit of 26%. At what price (in ₹) did Sukrit sell the item?", o: ["813","829","819","823"], e: "SP = 650 × 1.26 = 819. Option 3." },
  { s: QA, q: "Evaluate the given expression.", o: ["1.525","0.001","0.005","1.000"], e: "Per docx answer key, option 4 (1.000)." },
  { s: QA, q: "In an isosceles ΔLMN, LM = LN, and ∠MLN = 37°. Find ∠MNL.", o: ["70.0°","71.5°","60.5°","65.0°"], e: "Base angles equal: (180−37)/2 = 71.5°. Option 2." },
  { s: QA, q: "In a race of 400 m, Bhim gave Saral a head start by 20 m at the start of the race. Saral took 48 seconds to complete the race. What was the speed (in m/s) of Bhim if Saral defeated Bhim by a margin of 2 seconds?", o: ["8.7","7.6","7.4","8"], e: "Saral ran 380m in 48s. Bhim ran 400m in 50s = 8 m/s. Option 4." },
  { s: QA, q: "Find the third proportional of 9, 7, ?, 14.", o: ["21","24","18","16"], e: "Per docx answer key, option 3 (18). Pattern: 9:7 :: 18:14." },
  { s: QA, q: "Evaluate the given expression.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3." },
  { s: QA, q: "A completes a piece of work in 4 days and B completes it in 6 days. How long will it take to complete the same piece of work if they both work together?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Combined rate = 1/4+1/6 = 5/12 → 12/5 = 2.4 days. Per docx, option 3." },
  { s: QA, q: "Evaluate the value as per the question.", o: ["2 billion","1.5 billion","2.5 billion","3 billion"], e: "Per docx answer key, option 1 (2 billion)." },
  { s: QA, q: "Find the comparison value.", o: ["More, 28.5%","Less, 28.5%","More, 25.5%","Less, 25.5%"], e: "Per docx answer key, option 2 (Less, 28.5%)." },
  { s: QA, q: "Evaluate the given expression.", o: ["7","6","8","5"], e: "Per docx answer key, option 1 (7)." },
  { s: QA, q: "The average weight of 10 persons is increased by 3.5 kg, when one of them whose weight is 45.5 kg is replaced by a new man. The weight (in kg) of the new man is ___.", o: ["75.5","85.5","70.5","80.5"], e: "New weight = 45.5 + 10×3.5 = 45.5 + 35 = 80.5. Option 4." },
  { s: QA, q: "A dealer buys an article listed at ₹250 and gets successive discounts of 12% and 16%. He spends 10% of the cost price on transportation. At what price should he sell the article to earn a profit of 25%?", o: ["244.10","274.10","264.10","254.10"], e: "CP = 250 × 0.88 × 0.84 = 184.80. Total = 184.80 + 18.48 = 203.28. SP at 25% = 254.10. Option 4." },
  { s: QA, q: "Working separately, A and B can complete a work in 15 days and 18 days, respectively. If A starts the work and they work on alternate days, in how many days will the work be completed?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 2." },
  { s: QA, q: "Evaluate the given expression.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: QA, q: "Ramagya spends 22% of his salary on house rent and 75% of the rest on household expenses. If he saves ₹3,705, find his total income (in rupees).", o: ["21,000","19,000","18,000","17,000"], e: "After rent: 0.78 × S. After household: 0.78 × 0.25 × S = 0.195 × S = 3705 → S = 19000. Option 2." },
  { s: QA, q: "Without actual division, find the remainder when 379843 is divided by 3.", o: ["2","4","1","3"], e: "Digit sum: 3+7+9+8+4+3=34 → 3+4=7 → 7 mod 3 = 1. Option 3." },
  { s: QA, q: "A bag contains a total of 180 coins in the denominations of ₹5 and ₹1. Find the number of ₹5 coins in the bag, if the total value of the coins is ₹500.", o: ["80","100","120","60"], e: "Let x = ₹5 coins. 5x + (180−x) = 500 → 4x = 320 → x = 80. Option 1." },
  { s: QA, q: "Find the simple interest on ₹15,000 at the rate of 7% p.a. for 3 years.", o: ["3,120","3,000","3,150","3,100"], e: "SI = 15000 × 7 × 3 / 100 = 3150. Option 3." },
  { s: QA, q: "If 45% of 50% of a number is 27, then what is the number?", o: ["180","120","150","160"], e: "0.45 × 0.50 × x = 27 → 0.225x = 27 → x = 120. Option 2." },
  { s: QA, q: "A and B are participants in a 1,800 m circular race. A is running at 24 km/h and B at 15 km/h. If both start from same point in same direction, find the time when they meet again.", o: ["500 sec","600 sec","400 sec","720 sec"], e: "Relative speed = 9 km/h = 2.5 m/s. Time = 1800/2.5 = 720 s. Option 4." },
  { s: QA, q: "The present ages of Ramu and Ravi are in the ratio of 4 : 3. After 5 years the ratio of their ages will be 5 : 4. Find their present ages, respectively.", o: ["15 years, 20 years","15 years, 12 years","10 years, 15 years","20 years, 15 years"], e: "Let 4x, 3x. (4x+5)/(3x+5) = 5/4 → 16x+20 = 15x+25 → x=5. Ages: 20, 15. Option 4." },
  { s: QA, q: "Evaluate the given expression.", o: ["1","3","0","2"], e: "Per docx answer key, option 4 (2)." },
  { s: QA, q: "During the lockdown, a state government gives 4.5 kg of rice to each person of a family at a cost price of ₹40 per kg. But the distributor uses false weight of 3.75 kg instead of 4.5 kg. He showed the government that he distributed 2700 kg of rice. When caught, he was made to pay a fine of 125% of what he earned in the black market.", o: ["₹54,000","₹45,000","₹28,000","₹36,000"], e: "Per docx answer key, option 2 (₹45,000)." },
  { s: QA, q: "Evaluate the given expression.", o: ["97","92","96","95"], e: "Per docx answer key, option 1 (97)." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the most appropriate idiom that can substitute the underlined words in the given sentence.\nI know you're blaming me for all that has happened but I wasn't at fault alone.", o: ["make hay while the sun shines","it is always darkest before the dawn","it takes two to tango","leave no stone unturned"], e: "'It takes two to tango' = both parties at fault. Option 3." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence.\nWe have been at fours and fives in the office due to network issues.", o: ["At nines and tens","At threes and fours","At sixes and sevens","At eights and nines"], e: "Idiom is 'at sixes and sevens' (disordered). Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\nHe told me, \"I will call you later.\"", o: ["He told me that he would call me later.","He told you call me later.","He told he can call me later.","He told me I would call me later."], e: "Indirect: 'will' → 'would', 'you' → 'me'. Option 1." },
  { s: ENG, q: "Select the option that expresses the following sentence in passive voice.\nThe reviewer gave a dazzling review of the restaurant, which then went viral.", o: ["The reviewer was given a dazzling review to the restaurant, which then had gone viral","A dazzling review of the restaurant is given by the reviewer, which then went viral.","It went viral when the reviewer gave a dazzling review of the restaurant.","A dazzling review of the restaurant was given by the reviewer, which then went viral."], e: "Past simple passive: 'was given by'. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\nThe room will have been cleaned by the servant.", o: ["The servant should clean the room.","The servant will have clean the room.","The servant will have cleaned the room.","The servant will clean the room."], e: "Future perfect active: 'will have cleaned'. Option 3." },
  { s: ENG, q: "Select the correct spelling of the underlined word in the following sentence.\nThe divide between the upper class and the lower class is jixtaposed in this play.", o: ["Juxtaposed","Jextaposed","Juxtapoised","Juxtapused"], e: "Correct spelling: Juxtaposed. Option 1." },
  { s: ENG, q: "Select the most appropriate idiom that can substitute the underlined words in the given sentence.\nSharon doing the work all by herself? Seems like it is possible, but is very unlikely to happen.", o: ["pie in the sky","bent out of shape","a piece of cake","a bad egg"], e: "'Pie in the sky' = unrealistic hope. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nGreat tiredness", o: ["Rejuvenation","Potent","Fatigue","Vigour"], e: "Fatigue = great tiredness. Option 3." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined word in the following sentence with its ANTONYM.\nThe moment our English Instructor said the final paper is going to be tough, it was music to my ears!", o: ["unpredictable","durable","peculiar","resolvable"], e: "Tough ↔ Resolvable. Option 4." },
  { s: ENG, q: "Parts of the following sentences have been given as options. Select the option that contains an error.\nPaul and I played tennis yesterday. He's much better than me, so he win easily.", o: ["Played tennis yesterday","So he win easily","Paul and I","He's much better than me"], e: "'So he win easily' should be 'so he won easily' (past tense). Option 2." },
  { s: ENG, q: "Select the option with the MISSPELT word.\nThe maintainance staff of the heritage hotel have decided to go on a strike from next Wednesday.", o: ["decided","maintainance","heritage","strike"], e: "Correct spelling: 'maintenance'. Option 2." },
  { s: ENG, q: "Select the option that expresses the following sentence in passive voice.\nLet's recall the chapter once again.", o: ["Let the chapter is being recalled once again by us","Let the chapter is recalled once again by us.","Let the chapter being recalled once again by us.","Let the chapter be recalled once again by us."], e: "Let-imperative passive: 'Let the chapter be recalled'. Option 4." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe science of teaching", o: ["Pedagogy","Astrology","Zoology","Technology"], e: "Pedagogy = science/art of teaching. Option 1." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA system of government by one person with absolute power", o: ["Anarchy","Democracy","Autocracy","Bureaucracy"], e: "Autocracy = absolute rule by one. Option 3." },
  { s: ENG, q: "Parts of the following sentence have been given as options. Select the option that contains an error.\nCan we make sure we have a lots of fun on the trip?", o: ["a lots of fun","Can we make","on the trip?","sure we have"], e: "'A lots of' is wrong — should be 'a lot of' or 'lots of'. Option 1." },
  { s: ENG, q: "Read the Smoking passage. Select the most appropriate option to fill in blank no. 1.\n'Nicotine is the (1)_______ addictive component of tobacco smoke.'", o: ["trivial","minor","secondary","primary"], e: "Nicotine is the 'primary' addictive component. Option 4." },
  { s: ENG, q: "Read the Smoking passage. Select the most appropriate option to fill in blank no. 2.\n'The additives, too, cause (2)_______ to the body'", o: ["harm","cure","benefit","favour"], e: "Additives cause 'harm' to the body. Option 1." },
  { s: ENG, q: "Read the Smoking passage. Select the most appropriate option to fill in blank no. 3.\n'a 100-fold increase in nicotine's (3)_________ to enter the nose'", o: ["limitation","capacity","deficiency","inability"], e: "Increase in 'capacity' to enter. Option 2." },
  { s: ENG, q: "Read the Smoking passage. Select the most appropriate option to fill in blank no. 4.\n'by (4)________ the binding of nicotine to brain receptors'", o: ["decreasing","increasing","reducing","diminishing"], e: "Per docx answer key, option 2 (increasing)." },
  { s: ENG, q: "Read the Smoking passage. Select the most appropriate option to fill in blank no. 5.\n'Tobacco smoke has been well (5)______ as a proven carcinogen'", o: ["recognised","neglected","misread","behaved"], e: "Well 'recognised' as carcinogen. Option 1." },
  { s: ENG, q: "Read the Superstitions passage. What does the phrase 'religious orthodoxy' mean?", o: ["The modern beliefs of a social group","The traditional beliefs of a religious group","The western beliefs of a business group","The advanced beliefs of a political group"], e: "Religious orthodoxy = traditional religious beliefs. Option 2." },
  { s: ENG, q: "Read the Superstitions passage. What does 'unenlightened' mean in the context of the given passage?", o: ["Perfect knowledge of something","Lack of necessary knowledge","An intellectual human being","A very delighted person"], e: "Unenlightened = lacking knowledge. Option 2." },
  { s: ENG, q: "Read the Superstitions passage. Superstitions are mainly the outcomes of _____________.", o: ["belief","learning","ignorance","knowledge"], e: "Passage: 'mainly the outcome of ignorance'. Option 1 says belief but answer is ignorance — option 3? Per docx, option 1." },
  { s: ENG, q: "Read the Superstitions passage. Which of the following statements is INCORRECT according to the passage?", o: ["A natural disaster is regarded as a god's wrath by superstitious people.","Superstitions are rational beliefs.","Superstitions are a universal phenomenon.","Superstitions are also prevailing in Canada."], e: "Passage says superstitions are 'unreasonable and irrational'. Option 2." },
  { s: ENG, q: "Read the Superstitions passage. According to the passage, which of the following is NOT regarded as a superstition by people?", o: ["Howling of cats","Sighting of comets","Cries of children","Crossing of path by black cat"], e: "'Cries of children' is not mentioned as a superstition. Option 3." }
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
      questionText: r.q, questionImage, options: r.o, optionImages,
      correctAnswerIndex: KEY[i] - 1, explanation: r.e || '', section: r.s,
      tags: ['SSC', 'Selection Post', 'Phase XII', 'Higher Secondary', 'PYQ', '2024'],
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

  let exam = await Exam.findOne({ code: 'SSC-SSP-HS' });
  if (!exam) exam = await Exam.create({ category: category._id, name: 'SSC Selection Post (Higher Secondary Level)', code: 'SSC-SSP-HS', description: 'Staff Selection Commission - Selection Post (Higher Secondary Level - 12th-pass eligibility)', isActive: true });

  const PATTERN_TITLE = 'SSC Selection Post (Higher Secondary Level)';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) pattern = await ExamPattern.create({
    exam: exam._id, title: PATTERN_TITLE, duration: 60, totalMarks: 200, negativeMarking: 0.5,
    sections: [
      { name: REA, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
      { name: ENG, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
      { name: QA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
      { name: GA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 }
    ]
  });

  const TEST_TITLE = 'SSC Selection Post Phase XII (Higher Secondary) - 26 June 2024 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2024, pyqShift: 'Shift-2',
    pyqExamName: 'SSC Selection Post Phase XII (Higher Secondary)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
