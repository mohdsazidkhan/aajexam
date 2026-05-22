/**
 * Seed: SSC Selection Post Phase XII 2024 (Graduate Level) PYQ - 24 June 2024, Shift-3
 * Section order: REA → GA → QA → ENG. Key auto-decoded from green-tick bullets.
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun24_2024_s3";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-24jun2024-s3';

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

const F = '24-jun-2024-s3';

const IMAGE_MAP = {
  6:  { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] },        // REA mirror
  11: { q: 'image9.jpeg', opts: ['','','',''] },                                                     // REA dice
  12: { q: 'image10.png', opts: ['image11.png','image12.png','image13.png','image14.png'] },         // REA figure series
  20: { q: 'image15.png', opts: ['image16.jpeg','image17.png','image18.jpeg','image19.jpeg'] },      // REA embedded figure
  51: { q: 'image20.jpeg', opts: ['image21.jpeg','image22.jpeg','image23.jpeg','image24.jpeg'] },    // QA image-only
  56: { q: 'image25.jpeg', opts: ['','','',''] },                                                    // QA math expr
  57: { q: '', opts: ['image26.jpeg','image27.jpeg','image28.jpeg','image30.jpeg'] },                // QA opts
  58: { q: 'image29.png', opts: ['','','',''] },                                                     // QA math expr
  60: { q: 'image31.jpeg', opts: ['','','',''] },                                                    // QA bar graph
  61: { q: 'image32.jpeg', opts: ['','','',''] },                                                    // QA math expr
  63: { q: 'image33.jpeg', opts: ['','','',''] },                                                    // QA math expr
  64: { q: 'image34.jpeg', opts: ['image35.png','image36.png','image37.png','image38.png'] },        // QA math opts
  67: { q: '', opts: ['image40.png','image41.jpeg','image42.png','image43.jpeg'] },                  // QA work fractions
  72: { q: 'image44.jpeg', opts: ['','','',''] },                                                    // QA math expr
  75: { q: 'image45.png', opts: ['','','',''] }                                                      // QA math expr
};

const KEY = [
  // REA (1-25)
  3, 2, 4, 3, 3,   2, 4, 2, 4, 2,   4, 3, 1, 1, 1,   1, 4, 2, 3, 3,   1, 3, 1, 2, 2,
  // GA (26-50)
  2, 3, 1, 2, 3,   1, 4, 1, 1, 3,   2, 4, 2, 4, 4,   1, 4, 3, 4, 3,   3, 1, 1, 3, 2,
  // QA (51-75)
  4, 1, 1, 4, 3,   2, 4, 3, 3, 4,   4, 4, 1, 3, 4,   4, 2, 3, 4, 4,   2, 2, 3, 3, 1,
  // ENG (76-100)
  1, 2, 3, 2, 3,   2, 1, 3, 1, 3,   4, 1, 3, 2, 2,   4, 2, 4, 1, 2,   3, 1, 1, 1, 1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n(The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word)\n\nMandarin : China :: Swahili : ?", o: ["Ukraine","Peru","Kenya","France"], e: "Mandarin is spoken in China; Swahili is spoken in Kenya. Option 3." },
  { s: REA, q: "What will come in place of the question mark (?) in the following equation, if '+' and '−' are interchanged and '×' and '÷' are interchanged?\n\n15 ÷ 8 + 12 × 2 − 2 = ?", o: ["112","116","114","118"], e: "After swap: 15 × 8 − 12 ÷ 2 + 2 = 120 − 6 + 2 = 116. Option 2." },
  { s: REA, q: "In a certain code language, 'JUDGE' is written as '47', and 'CROSS' is written as '74'. How will 'BRIEF' be written in that language?", o: ["64","50","54","40"], e: "Sum of letter positions: J+U+D+G+E = 10+21+4+7+5 = 47 ✓; C+R+O+S+S = 3+18+15+19+19 = 74 ✓; B+R+I+E+F = 2+18+9+5+6 = 40. Option 4." },
  { s: REA, q: "In a certain code language,\nA + B means 'A is the mother of B'\nA − B means 'A is the brother of B'\nA × B means 'A is the wife of B'\nA # B means 'A is the father of B'\nBased on the above, how is W related to P if 'W × V # T − R + P'?", o: ["Sister","Mother","Mother's mother","Mother's sister"], e: "W is wife of V; V is father of T; T is brother of R; R is mother of P → W is mother of R = mother's mother of P. Option 3." },
  { s: REA, q: "In a certain code language, 'LIFE' is coded as '4765' and 'MEAT' is coded as '9142'. What is the code for 'E' in that code language?", o: ["7","5","4","1"], e: "Per docx answer key, option 3 (4)." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 2." },
  { s: REA, q: "Three statements are given, followed by Three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nNo number is a machine.\nNot a single machine is a bowl.\nEvery bowl is a sink.\n\nConclusions:\nI. Some sinks which are bowls are numbers as well.\nII. No number is a bowl.\nIII. Some sinks are bowls.", o: ["All conclusions, I, II and III, follow","Only conclusions II and III follow","Either conclusion I or II follows","Only conclusion III follows"], e: "All bowls are sinks → III follows. No number is a machine and no machine is a bowl → cannot establish 'no number is a bowl' deterministically — but possibility check fails; II does not necessarily follow. Per docx, option 4 (Only conclusion III follows)." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series, will complete the series.\nyzx_y_xxyz_x_zxx", o: ["xxyz","xzxy","yyzx","yzxx"], e: "Per docx answer key, option 2 (xzxy)." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nDEFGHI : FHHJJL :: MPQSIV : OSSVKY :: POLICE : ?", o: ["RRLNEH","RRNLHE","RRLNHE","RRNLEH"], e: "Pattern adds +2 to each letter: P+2=R, O+2=Q? Per docx answer key, option 4 (RRNLEH)." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n(The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word)\n\nCows : Herd :: Lions : ?", o: ["Flock","Pride","Pack","Bunch"], e: "Group of cows = herd; group of lions = pride. Option 2." },
  { s: REA, q: "Six numbers 1, 2, 3, 4, 5 and 6 are written on different faces of a dice. Three positions of this dice are shown in the given figure. Find the number on the face opposite to the number 2.", o: ["6","5","1","4"], e: "Per docx answer key, option 4 (4)." },
  { s: REA, q: "Identify the figure which when put in place of the question mark (?) will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3." },
  { s: REA, q: "In a certain code language, 'are you coming' is written as 'mk hv rc' and 'coming of age' is written as 'bs rc gt'. How is 'coming' written in the given language?", o: ["rc","gt","hv","bs"], e: "Common word 'coming' shares common code 'rc'. Option 1." },
  { s: REA, q: "8 is related to 45 following a certain logic. Following the same logic, 12 is related to 65. Which of the following is related to 80 using the same logic?", o: ["15","17","16","14"], e: "Pattern: 5n+5. 8→5×8+5=45 ✓, 12→5×12+5=65 ✓, 80→5×?+5=80 → ?=15. Option 1." },
  { s: REA, q: "Select the combination of letters that when sequentially placed from left to right in the blanks of the given series will complete the letter series.\nC _ _ B A C C _ _ A C C D _ _ C _ D _ A", o: ["C D D B B A C B","C D B D B A C B","D C D B B C A B","C D D B A B C B"], e: "Per docx answer key, option 1 (C D D B B A C B)." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n1. Painter\n2. Pace\n3. Pair\n4. Package\n5. Paragraph", o: ["2, 4, 1, 3, 5","2, 1, 5, 4, 3","1, 2, 3, 4, 5","1, 5, 4, 3, 2"], e: "Pace(2), Package(4), Painter(1), Pair(3), Paragraph(5) → 2,4,1,3,5. Option 1." },
  { s: REA, q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, even if it appears to be at variance with commonly known facts, decide which of the given conclusions logically follow(s) from the statements.\n\nStatements:\nFew doctors are buildings.\nMost buildings are papers.\nAll papers are frogs.\n\nConclusions:\n(I) Few doctors are papers.\n(II) Some frogs are doctors.\n(III) Some buildings are frogs.", o: ["Either conclusion I or conclusion II follows","Only conclusion I follows","All the conclusions I, II and III follow","Only conclusion III follows"], e: "Per docx answer key, option 4 (Only conclusion III follows)." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n14, 158, 258, 322, ?, 374", o: ["360","358","353","355"], e: "Differences: 144, 100, 64, 36, ... (12², 10², 8², 6²): 322+36=358. Option 2." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in a logical and meaningful order.\n1. Wool\n2. Shops\n3. Garments\n4. Yarn\n5. Sheep", o: ["5, 1, 3, 4, 2","1, 5, 4, 3, 2","5, 1, 4, 3, 2","5, 1, 4, 2, 3"], e: "Sheep→Wool→Yarn→Garments→Shops = 5,1,4,3,2. Option 3." },
  { s: REA, q: "Select the option figure in which the given figure (X) is embedded as its part (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3." },
  { s: REA, q: "R is the son of Q. M is the brother of B, who is the daughter of Q and the mother of P. How is M related to R?", o: ["Brother","Nephew","Father","Husband"], e: "Q's son R, Q's daughter B, B's brother M. So M is also Q's son → M is brother of R. Option 1." },
  { s: REA, q: "In a certain code language, 'GAS' is written as '54', and 'JOG' is written as '49'. How will 'ZIP' be written in that language?", o: ["38","34","30","42"], e: "Per docx answer key, option 3 (30)." },
  { s: REA, q: "In a certain code language, 'PEDAGOGY' is written as 'QGGECLEX' and 'CLASSICS' is written as 'DNDWOFAR'. How will 'TOGETHER' be written in the same code language?", o: ["UQJIPECQ","UJRPIECQ","RUJIPEQC","RUIJPECQ"], e: "Per docx answer key, option 1 (UQJIPECQ)." },
  { s: REA, q: "In a certain code language, 'BAGS' is coded as '43921' and 'KHEM' is coded as '1310715'. How will 'JINK' be coded in that language?", o: ["11101512","12111613","11121413","109811"], e: "Per docx answer key, option 2 (12111613)." },
  { s: REA, q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster.\n\nCURTAIN : RUCTNIA :: SUPPOSE : PUSPESO :: TONIGHT : ?", o: ["NTOITGH","NOTITHG","NOTITGH","NOTIHTG"], e: "Per docx answer key, option 2 (NOTITHG)." },

  // ============ GA (26-50) ============
  { s: GA, q: "Which Article of the Indian Constitution mentions about the recommendations of the Finance Commission?", o: ["Article 282","Article 281","Article 283","Article 284"], e: "Article 281 deals with the President's duty to lay Finance Commission recommendations before Parliament. Option 2." },
  { s: GA, q: "Which of the following is NOT a poverty alleviation programme in India?", o: ["Rural Housing - Indira Awaas Yojana (IAY)","Sampoorna Grameen Rozgar Yojana (SGRY)","Namami Gange","Rural Employment Generation Programme (REGP)"], e: "Namami Gange is a river-cleaning mission, not a poverty programme. Option 3." },
  { s: GA, q: "The location of 'Dhamek Stupa' is:", o: ["Sarnath","Shravasti","Kushinagar","Bodh Gaya"], e: "Dhamek Stupa is located at Sarnath, Uttar Pradesh. Option 1." },
  { s: GA, q: "Which of the following novels is written by the Indian author Kiran Desai?", o: ["The Golden House","The Inheritance of Loss","A Suitable Boy","The Circle of Reason"], e: "'The Inheritance of Loss' (Man Booker 2006) is by Kiran Desai. Option 2." },
  { s: GA, q: "Which Article of the Indian Constitution mentions that there shall be a Supreme Court of India?", o: ["Article 123","Article 122","Article 124","Article 121"], e: "Article 124 establishes the Supreme Court of India. Option 3." },
  { s: GA, q: "During the British rule in India, who among the following unfurled the flag of India in Germany in 1907?", o: ["Bhikaji Cama","Annie Besant","Sucheta Kriplani","Sarojini Naidu"], e: "Madam Bhikaji Cama unfurled the Flag of Indian Independence at Stuttgart (Germany), 1907. Option 1." },
  { s: GA, q: "Perihelion is when Earth is ____________.", o: ["above the sun","farthest from the sun","under the sun","nearest to the sun"], e: "Perihelion = closest point of Earth's orbit to the Sun. Option 4." },
  { s: GA, q: "What is the percentage share of population working in agricultural sector as per census of India 2011?", o: ["54.6%","56.7%","58%","50.3%"], e: "Per Census 2011, ~54.6% of working population engaged in agriculture. Option 1." },
  { s: GA, q: "Who was the chief guest at India's 74th Republic Day parade?", o: ["Abdel Fattah Al Sisi","Rab Butler","Shehu Shagari","Vladimir Putin"], e: "Egyptian President Abdel Fattah Al Sisi was chief guest at India's 74th Republic Day (2023). Option 1." },
  { s: GA, q: "Who among the following Kushana kings was the founder of the Kushana dynasty?", o: ["Huvishka","Vima Kadphises","Kujula Kadphises","Vasudeva I"], e: "Kujula Kadphises founded the Kushana dynasty. Option 3." },
  { s: GA, q: "Which of the following is NOT correctly matched?", o: ["Ribosome – Assembly of ribosomes","Nucleolus – Synthesis of DNA","Nucleus – Storage of genetic information","Mitochondria – Production of chemical energy"], e: "Nucleolus synthesises rRNA / ribosome assembly, not DNA. Option 2." },
  { s: GA, q: "In 1908 Khudiram Bose along with _________ was involved in throwing a bomb at a carriage believing it to be occupied by Kingsford, the then sitting judge of Muzaffarpur.", o: ["Sukhdev","Bhagat Singh","Rajguru","Prafulla Chaki"], e: "Khudiram Bose and Prafulla Chaki carried out the Muzaffarpur bombing (1908). Option 4." },
  { s: GA, q: "What is the duration of Pradhan Mantri Matsya Sampada Yojana?", o: ["7 years","5 years","6 years","8 years"], e: "PMMSY is implemented over 5 years (2020-21 to 2024-25). Option 2." },
  { s: GA, q: "Akham Lakshmi Devi was honoured with Sangeet Natak Akademi Award for the year 2018 for her contribution to _________ dance.", o: ["Sattriya","Mohiniyattam","Odissi","Manipuri"], e: "Akham Lakshmi Devi was awarded for Manipuri dance. Option 4." },
  { s: GA, q: "Which of the following is NOT considered a method of conservation of natural resources?", o: ["Recycling","Afforestation","Terrace farming","Extraction"], e: "Extraction depletes resources rather than conserving them. Option 4." },
  { s: GA, q: "Using Fleming's right-hand rule, in which direction will the current flow if the direction of magnetic field is towards north and the conductor is moving vertically upward?", o: ["Towards west","Towards south-west","Towards south","Towards east"], e: "Fleming's right-hand rule: with field north and motion up, induced current flows toward west. Option 1." },
  { s: GA, q: "Select the INCORRECT combination of dance and its respective state of origin.", o: ["Kuchipudi – Andhra Pradesh","Kathakali – Kerala","Bharatanatyam – Tamil Nadu","Sattriya – Himachal Pradesh"], e: "Sattriya originated in Assam, not Himachal Pradesh. Option 4." },
  { s: GA, q: "The Telangana state government started the 'SAHAS' initiative in 2023. Which of the following aims is related to the 'SAHAS' initiative?", o: ["To increase access to education","To increase access to healthcare services","To make workplace safe for women","To create job opportunities for the youth"], e: "Telangana's SAHAS initiative focuses on women's workplace safety. Option 3." },
  { s: GA, q: "Under which of the following Mughal emperors were the Marathas a major challenge to the sovereignty of the Mughals?", o: ["Jahangir","Humayun","Babur","Aurangzeb"], e: "Marathas under Shivaji & successors challenged Aurangzeb. Option 4." },
  { s: GA, q: "Identify the INCORRECT pair of cell shape types and their examples.", o: ["Oval – Chlamydomonas","Elongated – Muscle cells","Oblong – Nerve cells","Irregular – Amoeba"], e: "Nerve cells are typically branched/star-shaped, not oblong. Option 3." },
  { s: GA, q: "Uppalapu Shrinivas was a _________ player who was awarded with the Padma Shri in 1998.", o: ["tabla","veena","mandolin","violin"], e: "U. Shrinivas was a renowned mandolin player. Option 3." },
  { s: GA, q: "Industries of strategic and national importance are usually placed in the ________ sector.", o: ["Public","Co-operative","Joint","Private"], e: "Strategic & nationally important industries are in the Public sector. Option 1." },
  { s: GA, q: "In February 2023, who among the following was appointed as the external auditor of ILO for a four-year term?", o: ["GC Murmu","Arun Goel","Sanjeev Shankar Dubey","Praveen Kumar Srivastav"], e: "CAG GC Murmu was appointed external auditor of ILO (Feb 2023). Option 1." },
  { s: GA, q: "Under which Article of the Indian Constitution are traffic in human beings and beggar and other forms of forced labour prohibited?", o: ["Article 32","Article 21","Article 23","Article 27"], e: "Article 23 prohibits trafficking in humans and forced labour. Option 3." },
  { s: GA, q: "The first South Asian Games were hosted by _____.", o: ["Dhaka","Kathmandu","Colombo","Calcutta (Kolkata)"], e: "The first South Asian Games (then SAF Games) were held in Kathmandu, Nepal in 1984. Option 2." },

  // ============ QA (51-75) ============
  { s: QA, q: "Evaluate the given expression.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: QA, q: "If the 6 digit number 7002 * 4 is completely divisible by 8, then the smallest integer in place of * will be:", o: ["2","4","6","0"], e: "Last three digits 2*4 must be divisible by 8. 204/8=25.5, 224/8=28, 244/8=30.5, 264/8=33, 284/8=35.5. Smallest integer giving divisibility is 2 (224). Option 1." },
  { s: QA, q: "The average weight of a group of 15 students is 70 kg. Five more students of weight 65 kg, 68 kg, 45 kg, 77 kg and 62 kg join the group. What is the change in the average weight (rounded off to the nearest integer) of the group?", o: ["Decreases by 2 kg","Increases by 1 kg","Decreases by 1 kg","Increases by 2 kg"], e: "Old total = 15×70 = 1050. New sum of joiners = 317. New total = 1367; new avg = 1367/20 = 68.35 ≈ 68. Decrease ≈ 2 kg. Option 1." },
  { s: QA, q: "The average of six numbers is 4. The average of two of them is 3.5, while the average of the other two is 3.75. What is the average of the remaining two numbers?", o: ["8.375","4.85","4.65","4.75"], e: "Sum total = 24. Sum of four = 7 + 7.5 = 14.5. Remaining sum = 9.5. Average = 4.75. Option 4." },
  { s: QA, q: "A shopkeeper purchased groundnuts at ₹64/kg and sells at ₹80/kg. While selling, he uses faulty weights and gives 800 gm instead of 1 kg. Find his actual profit percentage.", o: ["28.75%","36.65%","56.25%","32.25%"], e: "CP for 800g = 64×0.8 = 51.2; SP = 80. Profit = 28.8 → 28.8/51.2 × 100 = 56.25%. Option 3." },
  { s: QA, q: "Evaluate the given expression.", o: ["16","17","18","15"], e: "Per docx answer key, option 2 (17)." },
  { s: QA, q: "If sin(5x − 40°) = cos (5y + 40°), then the value of x + y is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "sin(5x−40°) = cos(5y+40°) → 5x−40°+5y+40° = 90° → 5(x+y) = 90° → x+y = 18°. Per docx, option 4." },
  { s: QA, q: "Evaluate the given expression.", o: ["24","18","22","26"], e: "Per docx answer key, option 3 (22)." },
  { s: QA, q: "A sum of money was divided between Cyrus, Rohan and Mishti. The ratio of the sums received by Cyrus and Rohan was 3 : 2, while the ratio of the sums received by Rohan and Mishti was 7 : 12. If the sum received by Cyrus was ₹1,800 less than the sum received by Mishti, how many rupees did Rohan receive as his share?", o: ["₹7,560","₹9,240","₹8,400","₹6,300"], e: "C:R = 3:2 = 21:14; R:M = 7:12 = 14:24 → C:R:M = 21:14:24. M − C = 24x − 21x = 3x = 1800 → x = 600. Rohan = 14×600 = 8400. Option 3." },
  { s: QA, q: "The bar graph given below shows sales of table fans (in thousand numbers) from five showrooms during two consecutive years 2021 and 2022. The total sales of showroom B for both years is what per cent of the total sales of showroom E for both years? (Rounded off to 2 decimal places)", o: ["76.94%","74.99%","78.69%","79.49%"], e: "Per docx answer key, option 4 (79.49%)." },
  { s: QA, q: "Evaluate the given expression.", o: ["20 km/h","29 km/h","25 km/h","27 km/h"], e: "Per docx answer key, option 4 (27 km/h)." },
  { s: QA, q: "A sum of ₹5,575 is invested at the rate of 8% simple interest per annum for 4 years. What will be the interest (in ₹) payable on maturity?", o: ["1776","1782","1788","1784"], e: "SI = 5575 × 8 × 4/100 = 1784. Option 4." },
  { s: QA, q: "Evaluate the given expression.", o: ["32","30","36","34"], e: "Per docx answer key, option 1 (32)." },
  { s: QA, q: "Evaluate the given expression.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3." },
  { s: QA, q: "A dealer sells an article at ₹850 after offering a cash discount of 15% on its marked price. Without discount, he would have earned a profit of 25%. What is the cost price of the article (in ₹)?", o: ["950","1000","900","800"], e: "MP = 850/0.85 = 1000. CP = MP/1.25 = 800. Option 4." },
  { s: QA, q: "Evaluate the given expression.", o: ["30","60","50","40"], e: "Per docx answer key, option 4 (40)." },
  { s: QA, q: "A, B and C can do the same work in 9 days, 12 days and 18 days, respectively. A started the work and worked for 3 days and left. Then, B joined the work and worked for 3 days and left. Then, C joined the work and completed the work. Find the number of days C took to complete the work.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "LCM(9,12,18)=36 units. A=4/day×3=12; B=3/day×3=9; Total done=21; left=15; C=2/day → 15/2 = 7.5 days. Per docx, option 2." },
  { s: QA, q: "Which of the following in NOT a criterion of congruent triangles?", o: ["Side-Side-Side","Angle-Side-Angle","Angle-Angle-Angle","Side-Angle-Side"], e: "AAA only proves similarity, not congruence. Option 3." },
  { s: QA, q: "The sum of the two numbers is 450. If the greater number is decreased by 4% and the smaller number is increased by 20%, then the numbers obtained are equal. The smaller number is:", o: ["176","144","164","200"], e: "Let smaller = s, greater = 450 − s. 0.96(450 − s) = 1.20s → 432 − 0.96s = 1.20s → s = 432/2.16 = 200. Option 4." },
  { s: QA, q: "By selling a hair oil product for ₹336, the gain is 12%. If the gain is reduced to 9%, find the resultant selling price (in ₹).", o: ["339","330","300","327"], e: "CP = 336/1.12 = 300. New SP = 300 × 1.09 = 327. Option 4." },
  { s: QA, q: "The price of an item is increased by 15% and then the price is decreased by 12%. What is the effective percentage increase in the price of the item?", o: ["3%","1.2%","2.2%","1.8%"], e: "Effective = 15 − 12 − (15×12)/100 = 3 − 1.8 = 1.2%. Option 2." },
  { s: QA, q: "Evaluate the given expression.", o: ["5430","5544","5524","5452"], e: "Per docx answer key, option 2 (5544)." },
  { s: QA, q: "Select the correct statement about the properties of a triangle.", o: ["The sum of two sides is always equal to the third side.","The sum of two sides is always less than the third side.","The sum of two sides is always greater than the third side.","The sum of two sides may be equal to the third side."], e: "Triangle inequality: sum of any two sides > third side. Option 3." },
  { s: QA, q: "If 72 * 72 is divisible by 9, the missing * digit will be:", o: ["3 or 6","5 or 8","0 or 9","2 or 4"], e: "Digit sum 7+2+*+7+2 = 18+*. Divisible by 9 → * = 0 or 9. Option 3." },
  { s: QA, q: "Evaluate the given expression.", o: ["6","3","4","5"], e: "Per docx answer key, option 1 (6)." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "A word in the following sentence is INCORRECTLY spelt. Select that word from the given options.\n\nMesing up your laundry or being late for work is not very important when you consider your entire life.", o: ["mesing","important","laundry","entire"], e: "Correct spelling is 'messing'. Option 1." },
  { s: ENG, q: "A word in the following sentence is INCORRECTLY spelt. Select that word from the given options.\n\nSpaceX is an American aerospace manufacturer, space transportation services and communications corporation headquartared in Hawthorne, California.", o: ["transportation","headquartared","manufacturer","aerospace"], e: "Correct spelling is 'headquartered'. Option 2." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nProvoke", o: ["Incite","Aggravate","Pacify","Agitate"], e: "Provoke ↔ Pacify (calm). Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe Namesake was written by Jhumpa Lahiri.", o: ["Jhumpa Lahiri was writing The Namesake.","Jhumpa Lahiri wrote The Namesake.","Jhumpa Lahiri has written The Namesake.","Jhumpa Lahiri written The Namesake."], e: "Past simple active: 'Jhumpa Lahiri wrote The Namesake.' Option 2." },
  { s: ENG, q: "Select the correct option to substitute the underlined segment in the given sentence.\n\nThis secret will remain between you and I.", o: ["between you","among you and I","between you and me","between I and you"], e: "After preposition 'between', use object pronoun 'me': 'between you and me'. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word in the following sentence.\n\nThe presence of vagrant children is a common sight in urban cities.", o: ["Vagabond","Settled","Nomad","Gallivanting"], e: "Vagrant (wandering) ↔ Settled. Option 2." },
  { s: ENG, q: "Select the option that expresses the following sentence in direct speech.\n\nHis angry mother jeered and asked whether he supposed that he knew better than his own father.", o: ["\"Do you suppose you know better than your own father?\" jeered his angry mother.","Her mother jeeringly expressed, \"He doesn't know better than his own father.\"","Her mother supposed, \"'He knew better than his own father.\"","\"Do you know better than your father I suppose\" jeered his angry mother."], e: "Direct speech with original interrogative form. Option 1." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThe smoke coming out of the factory chimneys was polluting the air, which was becoming a major _______ for the local residents.", o: ["area","idea","concern","law"], e: "Pollution issue = major 'concern' for residents. Option 3." },
  { s: ENG, q: "Select the most appropriate idiom that can substitute the underlined segment in the given sentence.\n\nHis old car has become a financial burden on him now.", o: ["A white elephant","An apple of one's eye","A rare bird","An eyesore"], e: "A white elephant = costly burden providing little use. Option 1." },
  { s: ENG, q: "Parts of a sentence are given below in jumbled order. Arrange the parts in the correct order to form a meaningful sentence.\n(A) her suburbs, she was enthralled to see\n(B) one cold evening, when she went\n(C) autumn still attached to\n(D) the last golden leaf left from\n(E) out for a walk on the snowy paths of\n(F) an otherwise leafless tree", o: ["BADECF","CABEDF","BEADCF","CAFEDB"], e: "Per docx answer key, option 3 (BEADCF)." },
  { s: ENG, q: "Select the option that expresses the following sentence in passive voice.\n\nThey will publish the research findings in a scientific journal next month.", o: ["The research findings will be being published in a scientific journal by them next month.","The research findings will have been published in a scientific journal by them next month.","The research findings will be published in a scientific journal by them.","The research findings will be published in a scientific journal by them next month."], e: "Future simple passive with full time phrase. Option 4." },
  { s: ENG, q: "Select the most appropriate option that can replace the underlined word in the following sentence with its synonym.\n\nThose who desert their families do not always become anchorites.", o: ["hermits","wanderers","pirates","sailors"], e: "Anchorite = religious recluse / hermit. Option 1." },
  { s: ENG, q: "The following sentence may have an error of article. Choose the correct sentence from the given options. Choose 'No error' if the sentence has no error.\n\nThe festivals are celebrated everywhere to rejuvenate the minds of people.", o: ["The festivals are celebrated everywhere to rejuvenate minds of people.","No error","Festivals are celebrated everywhere to rejuvenate the minds of people.","An festivals are celebrated everywhere to rejuvenate the minds of people."], e: "Festivals (general) takes no article; 'the minds' is correct. Option 3." },
  { s: ENG, q: "Identify the INCORRECT section of the given sentence.\nFour people / were / witnesses of / that event.", o: ["Four people","witnesses of","were","that event."], e: "Idiomatic phrase is 'witnesses to' (not 'witnesses of'). Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nThe Colonel said that it gave him great pleasure to be there that evening.", o: ["The Colonel said, \"It gave him great pleasure to be there that evening.\"","The Colonel said, \"It gives me great pleasure to be here this evening.\"","The Colonel says, \"It gives me great pleasure to be there that evening.\"","The Colonel said, \"It gave me great pleasure to be there that evening.\""], e: "Direct speech reverses backshift: that→this, there→here, him→me. Option 2." },
  { s: ENG, q: "Read the Santosh Bisen passage. Select the most appropriate option to fill in blank number 1.\n'Santosh Bisen ... (1)_______ his drawing ... to convert chapters into comic strips.'", o: ["maintained","reformed","depicted","used"], e: "Per docx answer key, option 4 (used)." },
  { s: ENG, q: "Read the Santosh Bisen passage. Select the most appropriate option to fill in blank number 2.\n'his drawing (2)________ to convert chapters into comic strips.'", o: ["terms","skills","art","tricks"], e: "Drawing 'skills' fits the talent context. Option 2." },
  { s: ENG, q: "Read the Santosh Bisen passage. Select the most appropriate option to fill in blank number 3.\n'I spent my own money to (3)________ textbooks.'", o: ["mend","allocate","restore","design"], e: "Spending money to 'design' textbooks (into comic-style). Option 4." },
  { s: ENG, q: "Read the Santosh Bisen passage. Select the most appropriate option to fill in blank number 4.\n'Students were (4)________ with how simple science became'", o: ["thrilled","shocked","disgusted","disappointed"], e: "Positive context → 'thrilled'. Option 1." },
  { s: ENG, q: "Read the Santosh Bisen passage. Select the most appropriate option to fill in blank number 5.\n'their performance (5)_________' he adds.", o: ["regretted","improved","regained","reframed"], e: "Performance 'improved' fits. Option 2." },
  { s: ENG, q: "Read the Spiritual Help passage. According to the author, which of the following is a far higher gift than food and clothes, or even of life?", o: ["Jobs","Books","Knowledge","Food"], e: "Passage: 'gift of knowledge is far higher than ... food and clothes ... higher than giving life'. Option 3." },
  { s: ENG, q: "Read the Spiritual Help passage. What does the word 'annihilated' mean in the context of the above passage?", o: ["Obliterated","Obstructed","Omitted","Occluded"], e: "Annihilated = obliterated/destroyed. Option 1." },
  { s: ENG, q: "Read the Spiritual Help passage. According to the author, ignorance is _____ and knowledge is _______.", o: ["death, life","bliss, painful","painful, bliss","life, avoidable"], e: "Passage: 'Ignorance is death, knowledge is life.' Option 1." },
  { s: ENG, q: "Read the Spiritual Help passage. How can the faculty of want be destroyed forever?", o: ["With the knowledge of the spirit","With knowledge provided in books","With physical assistance","With a charitable spirit"], e: "Passage: 'It is only with the knowledge of the spirit that the faculty of want is annihilated forever'. Option 1." },
  { s: ENG, q: "Read the Spiritual Help passage. What according to the author is the highest good that one can do?", o: ["Extending spiritual help to others","Helping others physically","Doing intellectual good to people","Monitory help"], e: "Author states spiritual help is the greatest help. Option 1." }
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Graduate) - 24 June 2024 Shift-3';
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
