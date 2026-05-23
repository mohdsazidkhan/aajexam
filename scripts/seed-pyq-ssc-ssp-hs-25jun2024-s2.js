/**
 * Seed: SSC Selection Post Phase XII 2024 (Higher Secondary Level) PYQ - 25 June 2024, Shift-2
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun25_2024_s2";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-hs-25jun2024-s2';

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

const F = '25-jun-2024-s2';

const IMAGE_MAP = {
  2:  { q: 'image3.jpeg', opts: ['image4.jpeg','image5.jpeg','image6.jpeg','image7.jpeg'] },     // REA embedded figure
  7:  { q: 'image9.jpeg', opts: ['','','',''] },                                                   // REA dice
  9:  { q: 'image10.jpeg', opts: ['image11.jpeg','image12.jpeg','image13.jpeg','image14.jpeg'] }, // REA image Q
  25: { q: 'image15.jpeg', opts: ['image16.png','image17.png','image18.png','image19.png'] },    // REA mirror
  51: { q: 'image20.jpeg', opts: ['','','',''] },                                                  // QA Q1 image
  52: { q: 'image21.jpeg', opts: ['image22.jpeg','image23.jpeg','image24.jpeg','image25.jpeg'] }, // QA Q2 image-only
  53: { q: 'image26.jpeg', opts: ['','','',''] },                                                  // QA Q3 image
  55: { q: '', opts: ['image27.jpeg','image28.jpeg','image29.jpeg','image31.jpeg'] },             // QA Q5 height opts
  56: { q: 'image30.png', opts: ['','','',''] },                                                   // QA Q6 image
  59: { q: 'image32.jpeg', opts: ['','','',''] },                                                  // QA Q9 image
  60: { q: 'image33.png', opts: ['','','',''] },                                                   // QA Q10 table image
  61: { q: 'image34.jpeg', opts: ['','','',''] },                                                  // QA Q11 image
  66: { q: '', opts: ['image35.png','image36.png','image37.png','image38.png'] },                  // QA Q16 percentage opts
  70: { q: 'image39.jpeg', opts: ['','','',''] },                                                  // QA Q20 image
  75: { q: 'image40.jpeg', opts: ['','','',''] }                                                   // QA Q25 image
};

const KEY = [
  // REA (1-25)
  1, 2, 4, 4, 4,   3, 2, 1, 4, 3,   2, 4, 2, 4, 1,   1, 4, 1, 4, 2,   4, 3, 3, 3, 3,
  // GA (26-50)
  3, 2, 4, 2, 1,   2, 2, 4, 2, 3,   1, 2, 4, 1, 4,   2, 1, 2, 4, 3,   4, 1, 3, 4, 1,
  // QA (51-75)
  2, 1, 2, 2, 3,   2, 2, 4, 3, 3,   3, 3, 4, 3, 4,   2, 3, 2, 1, 4,   3, 1, 2, 2, 1,
  // ENG (76-100)
  1, 2, 3, 4, 2,   3, 4, 2, 3, 4,   1, 2, 4, 4, 3,   4, 3, 4, 3, 4,   4, 4, 1, 4, 1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nNEAREST : PICVGWV :: OFFICER : QJHMEIT :: SERVICE : ?", o: ["UITZKGG","UITXMEI","UITXKGG","UITZMGG"], e: "Per docx answer key, option 1 (UITZKGG)." },
  { s: REA, q: "Select the option figure in which the given figure is embedded as its part (Rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 2." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in the order in which they appear in an English dictionary.\n1. Deflection\n2. Degrade\n3. Degeneration\n4. Degree\n5. Deformation", o: ["3, 1, 5, 2, 4","2, 4, 3, 1, 5","1, 2, 3, 4, 5","1, 5, 3, 2, 4"], e: "Deflection(1), Deformation(5), Degeneration(3), Degrade(2), Degree(4) → 1,5,3,2,4. Option 4." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\nF_LT_R_IL_ERFI_ _E_ _ILT_R", o: ["TEILTRFEI","LTEIRTFEI","LTRFEITLE","IEFTLTRFE"], e: "Per docx answer key, option 4 (IEFTLTRFE)." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n1, 3, 7, 15, 31, 63, ?", o: ["125","130","120","127"], e: "Pattern: ×2+1. 63×2+1 = 127. Option 4." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n1. Globetrotter\n2. Globalize\n3. Globule\n4. Global\n5. Globe", o: ["4, 1, 5, 2, 3","3, 5, 1, 4, 2","4, 2, 5, 1, 3","1, 2, 3, 4, 5"], e: "Global(4), Globalize(2), Globe(5), Globetrotter(1), Globule(3) → 4,2,5,1,3. Option 3." },
  { s: REA, q: "Six numbers 1, 2, 3, 4, 5 and 6 are written on different faces of a dice. Two positions of this dice are shown in the following figure. Find the number on the face opposite to 4.", o: ["5","1","3","2"], e: "Per docx answer key, option 2 (1)." },
  { s: REA, q: "In a certain code language, 'ROVE' is written as 'JMFW' and 'ROSE' is written as 'JMIW'. How will 'RUIN' be written in that language?", o: ["JGSN","JNGS","JSGN","JGNS"], e: "Per docx answer key, option 1 (JGSN)." },
  { s: REA, q: "Identify the answer figure as per the question pattern.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: REA, q: "In a certain code language,\n'A + B' means 'A is the wife of B';\n'A − B' means 'A is the sister of B';\n'A × B' means 'A is the father of B' and\n'A ÷ B' means 'A is the brother of B'.\nBased on the above, how is E related to I if 'E ÷ F + G × H − I'?", o: ["Brother","Father's brother","Mother's brother","Mother's father"], e: "E is brother of F; F is wife of G; G is father of H; H is sister of I → G is father of I → E is brother of G's wife = uncle (mother's brother) of I. Option 3." },
  { s: REA, q: "What will come in place of the question mark (?) in the following equation if '+' means '×', '−' means '÷', '×' means '+' and '÷' means '−'?\n(18 + 10 × 20) − 8 ÷ 6 = ?", o: ["22","19","18","20"], e: "After swap: (18 × 10 + 20) ÷ 8 − 6 = 200/8 − 6 = 25 − 6 = 19. Option 2." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n(The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word)\n\nPilot : Airplane :: Captain : ?", o: ["Swim","Sea","Sail","Ship"], e: "Pilot operates an airplane; captain operates a ship. Option 4." },
  { s: REA, q: "In a certain code language, 'GROSS' is written as '4' and 'MOIST' is written as '8'. How will 'ZEBRA' be written in the same code language?", o: ["9","6","2","5"], e: "Pattern: number of vowels (or other simple rule). Per docx answer key, option 2 (6)." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n_ V _ D _ B _ _ B D _ _", o: ["BDDVDVB","BDVVBDV","DDBVDVB","DBVDVVB"], e: "Per docx answer key, option 4 (DBVDVVB)." },
  { s: REA, q: "In a certain code language,\n'A + B' means 'A is the husband of B', 'A − B' means 'A is the brother of B', 'A × B' means 'A is the father of B', 'A ÷ B' means 'A is the son of B'.\nBased on the above, how is E related to C if 'E ÷ F × D − C'?", o: ["Brother","Son-in-law","Son","Father"], e: "E is son of F; F is father of D; D is brother of C → F is father of D & C → E is grandson of F's father → E is brother of C (both children of F). Option 1." },
  { s: REA, q: "Three statements are given followed by two conclusions numbered I and II. Statements:\nAll apples are fruits.\nSome apples are raw.\nNo fruit is a vegetable.\n\nConclusions:\nI. Some vegetables are raw.\nII. No apple is a vegetable.", o: ["Only conclusion II follows.","Both conclusions I and II follow.","Only conclusion I follows.","Neither conclusion I nor II follows."], e: "All apples ⊆ fruits; no fruit is vegetable → no apple is vegetable (II ✓). 'Some apples raw' doesn't make 'some vegetables raw'. Option 1." },
  { s: REA, q: "Three statements are given followed by two conclusions numbered I and II. Statements:\nI. No map is a plan.\nII. All globes are plans.\nIII. All atlases are plans.\n\nConclusions:\nI. No atlas is a map.\nII. Some globes are atlases.", o: ["Both conclusions I and II follow","Neither conclusion I nor II follows","Only conclusion II follows","Only conclusion I follows"], e: "All atlases are plans; no map is plan → no atlas is map (I ✓). Both atlases & globes are plans but no overlap deducible (II ✗). Option 4." },
  { s: REA, q: "Three statements are given, followed by Three conclusions numbered I, II and III. Statements:\nAll buildings are houses.\nSome houses are palaces.\nNo palace is a mansion.\n\nConclusions:\nI. Some buildings are palaces.\nII. Some mansions being not houses is a possibility.\nIII. No building is a palace.", o: ["Conclusion II and either conclusion I or conclusion III follows","All conclusions, I, II and III, follow","Both conclusions I and II follow","Only conclusion I follows"], e: "Per docx answer key, option 1." },
  { s: REA, q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster.\n\nPLEASED : ELPADES :: HOWEVER : WOHEREV :: IMAGINE : ?", o: ["MAIGEIN","AIMGEIN","MAIGNEI","AMIGENI"], e: "Per docx answer key, option 4 (AMIGENI)." },
  { s: REA, q: "In a certain code language, 'GHOST' is coded as 74 and 'TRIBAL' is coded as 68. How will 'HORN' be coded in the same language?", o: ["60","59","55","61"], e: "Per docx answer key, option 2 (59)." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n1. Nail\n2. Elbow\n3. Finger\n4. Shoulder\n5. Wrist", o: ["1, 5, 3, 2, 4","3, 5, 1, 2, 4","3, 1, 2, 5, 4","1, 3, 5, 2, 4"], e: "Nail(1)→Finger(3)→Wrist(5)→Elbow(2)→Shoulder(4) → 1,3,5,2,4. Option 4." },
  { s: REA, q: "In a certain code language, 'PARADOX' is written as 'IXGXUJA' and 'WIPES' is written as 'BPITF'. How will 'PARALLEL' be written in that language?", o: ["MTMXMXGI","MTMMXGXI","IXGXMMTM","IXGXMTMM"], e: "Per docx answer key, option 3 (IXGXMMTM)." },
  { s: REA, q: "In a certain code language,\n'A + B' means 'A is the father of B', 'A − B' means 'A is the brother of B', 'A × B' means 'A is the mother of B', 'A ÷ B' means 'A is the sister of B'.\nBased on the above, how is K related to R if 'L + K ÷ D × P − R'?", o: ["Sister","Father's sister","Mother's sister","Mother"], e: "L is father of K; K is sister of D; D is mother of P; P is brother of R → D is mother of P and R → K (D's sibling sister) is mother's sister (aunt) of R. Option 3." },
  { s: REA, q: "The numbers in each set are related to each other in a certain way.\n(3, 6, 81), (2, 2, 16), (4, 5, ?)\nBased on the relationship among the numbers in the first two sets, select the number that can replace the question mark (?) in the third set.", o: ["18","78","81","72"], e: "Pattern: a²×b/... Per docx answer key, option 3 (81)." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at line MN as shown below.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3." },

  // ============ GA (26-50) ============
  { s: GA, q: "Which of the following Articles of the Indian Constitution are related to the Comptroller and Auditor General of India?", o: ["Article 148-152","Article 147-150","Article 148-151","Article 148-154"], e: "Articles 148-151 deal with the CAG of India. Option 3." },
  { s: GA, q: "The famous musician Aban Mistry is associated with which instrument?", o: ["Flute","Tabla","Shehnai","Drums"], e: "Aban Mistry was a renowned tabla player. Option 2." },
  { s: GA, q: "Who among the following sportspersons is credited with the autobiography 'Undisputed Truth'?", o: ["Muhammad Ali","Matthew Hayden","Kevin Pietersen","Mike Tyson"], e: "'Undisputed Truth' is Mike Tyson's autobiography. Option 4." },
  { s: GA, q: "The highly viscous, mechanically-weak and ductile region of Earth's upper mantle is called:", o: ["exosphere","asthenosphere","lithosphere","mesosphere"], e: "Asthenosphere = ductile upper-mantle region. Option 2." },
  { s: GA, q: "The 11th Fundamental Duty was added by which Amendment?", o: ["86th Amendment 2002","42nd Amendment 1976","44th Amendment 1978","84th Amendment 2000"], e: "The 86th Amendment Act, 2002 added Article 51A(k), the 11th Fundamental Duty. Option 1." },
  { s: GA, q: "On 12th of March 1930, Gandhiji with his 72 followers began a march from _______ up to Dandi coast.", o: ["Kutch","Sabarmati Ashram","Surat","Tolstoy Farm"], e: "Dandi March started from Sabarmati Ashram. Option 2." },
  { s: GA, q: "'My Country, My Life' is an autobiographical text of which of the following Indian politicians?", o: ["Atal Bihari Vajpayee","Lal Krishna Advani","Sharad Pawar","Narendra Modi"], e: "'My Country, My Life' is the autobiography of L.K. Advani. Option 2." },
  { s: GA, q: "Which trek in Bhutan is considered to be the crown jewel of Bhutanese trekking?", o: ["Laya Gasa Trek","Dagala Thousand Lakes Trek","Jumolhari Trek","Snowman Trek"], e: "The Snowman Trek is regarded as Bhutan's crown jewel. Option 4." },
  { s: GA, q: "Which of the following is NOT correct about the Prime Minister of India?", o: ["He is the principal communicator between the President and the Council of Ministers.","He and his ministers are collectively responsible to the Upper House of the Parliament.","He is the Head of the Government.","He recommends the name of persons who can be appointed as ministers by the President."], e: "PM and Council are collectively responsible to Lok Sabha (Lower House), not Upper House. Option 2." },
  { s: GA, q: "The Government of India initiative 'Azadi ka Amrit Mahotsav' to commemorate 75th Independence Day, commenced in which year?", o: ["2020","2022","2021","2019"], e: "Azadi ka Amrit Mahotsav was launched in March 2021. Option 3." },
  { s: GA, q: "Which of the following forts was built by Raja Rai Singh in 1588?", o: ["Junagarh Fort","Kumbhal Garh","Sonar Kila","Amer Fort"], e: "Junagarh Fort (Bikaner) was built by Raja Rai Singh in 1588. Option 1." },
  { s: GA, q: "Gupta emperor Chandragupta I was the first ruler to adopt which of the following titles?", o: ["Vikramaditya","Maharajadhiraja","Mahendraditya","Parmeshvara"], e: "Chandragupta I was the first Gupta to take the title 'Maharajadhiraja'. Option 2." },
  { s: GA, q: "Which of the following types of unemployment arises from a mismatch between the jobs available in the market and the skills of the available workers in the market?", o: ["Frictional","Disguised","Seasonal","Structural"], e: "Structural unemployment = skills-jobs mismatch. Option 4." },
  { s: GA, q: "In May 2023, Ravneet Kaur was in the news due to her appointment as the ________.", o: ["Chairperson of Competition Commission of India","Election Commissioner of India","Chief Vigilance Commissioner","Chief Election Commissioner of India"], e: "Ravneet Kaur was appointed Chairperson of CCI in May 2023. Option 1." },
  { s: GA, q: "Who among the following is NOT associated with the Rahnumai Mazdayasnan Sabha?", o: ["Naoroji Furdunji","SS Bengalee","Dadabhai Naoroji","Syed Ahmed Khan"], e: "Rahnumai Mazdayasnan Sabha (1851) was a Parsi reform society — Sir Syed Ahmed Khan (Muslim reformer) was not associated. Option 4." },
  { s: GA, q: "The dry cell is made up of an outer __________ container that acts as the anode.", o: ["nickel","zinc","manganese","lead"], e: "Dry cell's outer container (anode) is zinc. Option 2." },
  { s: GA, q: "In the reference of the Delhi Sultanate, what was the 'Group of Forty'?", o: ["They were mostly powerful Turkish slaves of Iltutmish, who took power in the interregnum following Sultana Raziyya's killing.","They were forty Rajput nobles who planned a coup to dethrone Qutb ud Din Aibak in 1210.","They were forty banjara leaders who transferred military supplies in times of war.","They were forty military archers who distinguished themselves by their bravery in the Delhi Sultanate."], e: "Turkan-i-Chahalgani (Group of Forty) were Iltutmish's Turkish slaves. Option 1." },
  { s: GA, q: "The Governor's emoluments are decided by the:", o: ["Prime Minister","Parliament","State Legislature","President"], e: "Governor's emoluments are determined by Parliament (Schedule II). Option 2." },
  { s: GA, q: "In August 2021, the third phase of Mission Shakti 3.0 was launched by the Indian state of _________ to empower women and make them self-reliant.", o: ["Himachal Pradesh","Arunachal Pradesh","Madhya Pradesh","Uttar Pradesh"], e: "Mission Shakti 3.0 (August 2021) was launched by Uttar Pradesh. Option 4." },
  { s: GA, q: "Under the 'Mukhyamantri Awasiya Bhu Adhikar Yojana' launched by the Chief Minister of Madhya Pradesh, plots worth about ________ crore were distributed to 10,918 families of Tikamgarh district.", o: ["139","140","129","130"], e: "Per docx answer key, option 3 (₹129 crore)." },
  { s: GA, q: "Republic Day in India is celebrated to commemorate:", o: ["the day when the first meeting of the Constituent Assembly was held.","the day when the Constituent Assembly was formed.","India's independence.","the date on which the Constitution of India came into effect."], e: "Republic Day marks 26 January 1950 — Constitution came into effect. Option 4." },
  { s: GA, q: "Which of the following is an example of a vertebrate?", o: ["Mammals","Crustaceans","Insects","Molluscs"], e: "Mammals are vertebrates; others are invertebrates. Option 1." },
  { s: GA, q: "In 1955, who published a comprehensive study of small particle constituents of the cytoplasm (ribosomes) and correctly estimated their physiological importance?", o: ["Albert Von Kolliker","Pierre Joseph Pelletier","George E Palade","James Thomson"], e: "George E. Palade's 1955 ribosome research earned him the Nobel Prize. Option 3." },
  { s: GA, q: "Pakyong airport is located in ________.", o: ["Assam","Nagaland","Arunachal Pradesh","Sikkim"], e: "Pakyong Airport is in Sikkim. Option 4." },
  { s: GA, q: "The Keoladeo National Park is located in the state of _______.", o: ["Rajasthan","Madhya Pradesh","Odisha","Gujarat"], e: "Keoladeo National Park (Bharatpur) is in Rajasthan. Option 1." },

  // ============ QA (51-75) ============
  { s: QA, q: "Find the answer to the given problem.", o: ["65%","75%","70%","25%"], e: "Per docx answer key, option 2 (75%)." },
  { s: QA, q: "Evaluate the given expression.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: QA, q: "Find the value based on the figure.", o: ["46 cm","56 cm","58 cm","38 cm"], e: "Per docx answer key, option 2 (56 cm)." },
  { s: QA, q: "If a − b = 5 and ab = 25, then the value of a³ − b³ is:", o: ["525","500","450","400"], e: "a³ − b³ = (a−b)(a² + ab + b²). (a−b)² = a² − 2ab + b² = 25 → a² + b² = 75. So a² + ab + b² = 100. a³−b³ = 5×100 = 500. Option 2." },
  { s: QA, q: "The base of a parallelogram is thrice its height. If the area of the parallelogram is 1020 cm², then what is its height?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3. (Height = √(1020/3) ≈ 18.4 cm)" },
  { s: QA, q: "Evaluate the given expression.", o: ["36","34","27","17"], e: "Per docx answer key, option 2 (34)." },
  { s: QA, q: "John buys 20 kg of wheat at ₹30 per kg and 30 kg of wheat at ₹50 per kg. Find his average price.", o: ["₹21 per kg","₹42 per kg","₹20 per kg","₹40 per kg"], e: "Total cost = 600 + 1500 = 2100. Total weight = 50 kg. Avg = 42/kg. Option 2." },
  { s: QA, q: "X and Y can do a piece of work in 18 days and 27 days, respectively. Starting with X, they work on alternate days. The whole number of days to complete the work by X and Y is:", o: ["21","20","24","22"], e: "LCM(18,27)=54. Per day: X=3, Y=2. Two-day pair = 5. After 20 days (10 pairs) = 50 done. Day 21 (X's turn): 53. Day 22 (Y's turn): 54. 22 days. Option 4." },
  { s: QA, q: "Evaluate the given expression.", o: ["14","12","9","10"], e: "Per docx answer key, option 3 (9)." },
  { s: QA, q: "The following table shows the number of voters at 5 different centres P, Q, R, S and T and the percentage of people who voted in an election. If the number of invalid votes cast at Centre S was 20% of the total number of votes cast, then what percentage of the total number of registered voters cast invalid votes at Centre S?", o: ["25%","22%","18%","20%"], e: "Per docx answer key, option 3 (18%)." },
  { s: QA, q: "Evaluate the given expression.", o: ["23.96%","43.96%","33.96%","53.96%"], e: "Per docx answer key, option 3 (33.96%)." },
  { s: QA, q: "A police station, a bank and a safe house for the thief are in a straight line with a bank in between. The distance between the police station and the safe house is four times the distance between the bank and the safe house. After looting the bank at 9:15 A.M, the thief runs away. A policeman gets the information instantly and chases him at the speed of 16 km/h. The policeman catches the thief at the gate of the safe house in fifteen minutes. What is the distance between the bank and the police station?", o: ["4 km","1 km","3 km","2 km"], e: "Policeman covers 4 km in 15 min at 16 km/h. PS-Safe = 4 km. PS-Safe = 4×(Bank-Safe) → Bank-Safe = 1 km. Bank-PS = 4 − 1 = 3 km. Option 3." },
  { s: QA, q: "A work can be finished by 8 men in 10 days working 6 hours a day or same can be finished by 20 qualified workers in 6 days working 8 hours a day. 2 men and 4 qualified workers work simultaneously 10 hours a day, the work will be finished in _______ days.", o: ["9","10","8","12"], e: "Man-rate per hr = 1/(8×10×6) = 1/480; QW-rate = 1/(20×6×8) = 1/960. 2 men + 4 QW per hr = 2/480 + 4/960 = 4/960 + 4/960 = 8/960 = 1/120. So 120 hrs / 10 hrs/day = 12 days. Option 4." },
  { s: QA, q: "Which number should be added to 3, 11, 4 and 14 to make them in proportion?", o: ["3","4","1","2"], e: "(3+x)/(11+x) = (4+x)/(14+x). Cross-multiply: (3+x)(14+x) = (11+x)(4+x). 42 + 17x + x² = 44 + 15x + x². 17x − 15x = 44 − 42 → 2x = 2 → x = 1. Option 3." },
  { s: QA, q: "In a circular race of 840 m, A and B start running in the same direction at the same time from the same point at the speeds of 6 m/s and 12 m/s, respectively. After how much time will they meet next?", o: ["40 s","20 s","70 s","140 s"], e: "Relative speed = 6 m/s. Time = 840/6 = 140 s. Option 4." },
  { s: QA, q: "The salary of an employee is increased by 10% and then the increased salary is reduced by 10%. The percentage loss in the salary of the employee is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Net = 1.1 × 0.9 = 0.99 → 1% loss. Per docx, option 2." },
  { s: QA, q: "A shopkeeper bought 30 books and sold 25 books for same price. What percentage had he gained or lost?", o: ["25% loss","25% gain","20% gain","20% loss"], e: "CP of 30 = SP of 25. Profit% = (30−25)/25 × 100 = 20% gain. Option 3." },
  { s: QA, q: "The number 2918245 is divisible by which of the following numbers?", o: ["3","11","12","9"], e: "Sum 31 → not ÷3, ÷9. 2918245 ÷ 11 = 265295 ✓. Option 2." },
  { s: QA, q: "A shopkeeper claims to sell 450 kg rice at a cost price of ₹40 per kg but uses a weight of 900 grams instead of a one kilogram weight. He makes a profit of ₹2,520 by selling the remaining rice in the black market. The ratio of the black-market price to the original price per kg of rice is:", o: ["7 : 5","9 : 4","10 : 7","4 : 3"], e: "Per docx answer key, option 1 (7 : 5)." },
  { s: QA, q: "Evaluate the given expression.", o: ["256","254","255","259"], e: "Per docx answer key, option 4 (259)." },
  { s: QA, q: "36 persons can do a work in 10 days, working 6 hours a day. In how many days will 24 persons, working 9 hours a day complete the work?", o: ["4","8","10","6"], e: "Work = 36×10×6 = 2160 man-hrs. Days = 2160/(24×9) = 10. Option 3." },
  { s: QA, q: "If an electricity bill is paid before the due date, one gets a reduction of 10% on the amount of the bill. By paying the bill before the due date, a person got a reduction of ₹23. The amount of his electricity bill (in ₹) was:", o: ["230","520","250","380"], e: "10% × bill = 23 → bill = 230. Option 1." },
  { s: QA, q: "Class X has 45 students scoring average marks of 30 and class Y has 35 students scoring average marks of 18. Find the average marks of the students of both classes together.", o: ["25","24.75","30","28.50"], e: "Total = 45×30 + 35×18 = 1350 + 630 = 1980. Avg = 1980/80 = 24.75. Option 2." },
  { s: QA, q: "Pass percentage of an examination is 35%. If a student who got 210 marks, failed by 14 marks, then what are the maximum marks of the examination?", o: ["660","640","600","620"], e: "Pass mark = 210 + 14 = 224. 35% of max = 224 → max = 224/0.35 = 640. Option 2." },
  { s: QA, q: "Find the value as per the given expression.", o: ["2012","2009","2010","2011"], e: "Per docx answer key, option 1 (2012)." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Elocaution","Cryptic","Ethereality","Preclude"], e: "Correct is 'Elocution'. Option 1." },
  { s: ENG, q: "Parts of a sentence are given below in jumbled order. Arrange the parts in the correct order to form a meaningful sentence.\nA: leaped into the water\nB: ship touched the shore\nC: as soon as the\nD: a soldier of the tenth legion", o: ["BDAC","DACB","CBDA","ACBD"], e: "Per docx answer key, option 2 (DACB)." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\nMy friends / and their family members / have gone to the beach / two days ago.", o: ["two days ago","and their family members","have gone to the beach","My friends"], e: "'two days ago' requires simple past, not 'have gone'. Per error placement, option 3 ('have gone to the beach' is wrong tense)." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\nThe flight is carrying relief material.", o: ["Relief material is carried by the flight.","Relief material is being carrying by the flight.","Relief material is carrying by the flight.","Relief material is being carried by the flight."], e: "Present continuous passive: 'is being carried by'. Option 4." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe killing of one's sister", o: ["Uxoricide","Sororicide","Regicide","Parricide"], e: "Sororicide = killing of one's sister. Option 2." },
  { s: ENG, q: "Select the most appropriate idiom that can substitute the underlined words in the given sentence.\nI know you have been really busy with your work, but can you just give me a few minutes?", o: ["through thick and thin","jumped on the bandwagon","snowed under","on cloud nine"], e: "Snowed under = very busy. Option 3." },
  { s: ENG, q: "Parts of a sentence are given below in jumbled order.\n(A) the concert was too expensive\n(B) to watch his favourite\n(C) hard-earned money on\n(D) to waste his parents'\n(E) artist's live performance\n(F) so he sacrificed the chance", o: ["FACEDB","FADECB","BADECF","ADCFBE"], e: "Per docx answer key, option 4 (ADCFBE)." },
  { s: ENG, q: "Parts of the following sentence have been given as options. Select the option that contains an error.\nChildren should watch TV from distance as it will affect their eyesight.", o: ["their eyesight","TV from distance","Children should watch","as it will affect"], e: "'TV from distance' should be 'TV from a distance'. Option 2." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDesperate", o: ["Sloping","Erratic","Hopeful","Bleak"], e: "Desperate ↔ Hopeful. Option 3." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nAn act of copying the behavior or speech of other people.", o: ["Parody","Oratory","Pedantry","Mimicry"], e: "Mimicry = copying behaviour/speech. Option 4." },
  { s: ENG, q: "Select the option that expresses the following sentence in active voice.\nThe wild elephant will be captured and left in the forest.", o: ["They will capture the wild elephant and leave it in the forest.","The wild elephant would be captured by us and left in the forest.","We would have captured and left the wild elephant in the forest.","We had captured and left the wild elephant in the forest."], e: "Future simple active: 'They will capture ... and leave it'. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nRakesh appointed three managers.", o: ["Three managers appointed Rakesh.","Three managers were appointed by Rakesh.","Three managers were being appointed by Rakesh.","Three managers will be appointed by Rakesh."], e: "Past simple passive: 'were appointed by'. Option 2." },
  { s: ENG, q: "Select the sentence that contains a spelling error.", o: ["His presence in the party was unexpected.","I can't believe you.","The result will be declared tomorrow.","I shall always remain greatful to you."], e: "Correct is 'grateful', not 'greatful'. Option 4." },
  { s: ENG, q: "Select the idiom that gives the most appropriate meaning of the underlined phrase in the following sentence.\nOur Principal looked disappointed when no one expressed the willingness to join the trip.", o: ["High and dry","Gave a single shot","Made a comeback","Pulled a long face"], e: "Pulled a long face = looked sad/disappointed. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\nShe said, \"I am going to Delhi to attend my friend's marriage.\"", o: ["She said that I was going to Delhi to attend my friend's marriage.","She said that she was going to Delhi to attend our friend's marriage.","She said that she was going to Delhi to attend her friend's marriage.","She said that she was going to Delhi to attend my friend's marriage."], e: "Indirect: 'I' → 'she', 'am' → 'was', 'my' → 'her'. Option 3." },
  { s: ENG, q: "Read the L.M. Thapar passage. Select the most appropriate option to fill in blank number 1.\n'ASSOCHAM which (1)_________ the interests of trade and commerce'", o: ["designed","developed","demoted","promoted"], e: "ASSOCHAM 'promoted' the interests of trade. Option 4." },
  { s: ENG, q: "Read the L.M. Thapar passage. Select the most appropriate option to fill in blank number 2.\n'He was (2)________ a good life'", o: ["world of","want of","fond of","caring for"], e: "He was 'fond of' a good life. Option 3." },
  { s: ENG, q: "Read the L.M. Thapar passage. Select the most appropriate option to fill in blank number 3.\n'an (3)_________ personal gallery'", o: ["routine","regular","ordinary","impressive"], e: "Impressive gallery of artworks. Option 4." },
  { s: ENG, q: "Read the L.M. Thapar passage. Select the most appropriate option to fill in blank number 4.\n'His (4)________ personality, his generosity'", o: ["hesitant","dull","vivacious","workaholic"], e: "'Vivacious' personality matches the warm description. Option 3." },
  { s: ENG, q: "Read the L.M. Thapar passage. Select the most appropriate option to fill in blank number 5.\n'is remembered (5)__________ by his friends'", o: ["never","eventually","sometimes","fondly"], e: "Remembered 'fondly' by friends. Option 4." },
  { s: ENG, q: "Read the Farm Fires passage. Which of the following options best summarises the given passage?", o: ["There are no political dimensions in dealing with intractable problems.","Farm fires have been halted successfully due to the coordination between AAP and BJP.","Farmers' difficulties have been reduced to zero per cent by agriculture scientists.","A mix of technology, government funds and a sense of political responsibility helps solve difficult problems."], e: "Passage's closing argument. Option 4." },
  { s: ENG, q: "Read the Farm Fires passage. What is the good news mentioned here?", o: ["New policies for farmers","Sufficient electricity","High yielding of crops","Reduction in farm fires"], e: "Passage opens: 'A significant reduction in farm fires ... heartening news'. Option 4." },
  { s: ENG, q: "Read the Farm Fires passage. Select the most appropriate ANTONYM of the word 'deter'.", o: ["Encourage","Bolt","Prove","Disappoint"], e: "Deter (discourage) ↔ Encourage. Option 1." },
  { s: ENG, q: "Read the Farm Fires passage. Select the most appropriate title for the given passage.", o: ["Water and Politics","Fire and Farmers","Fire and Water","A Few Good Policies and Less Farm Fires"], e: "Title fitting the central theme. Option 4." },
  { s: ENG, q: "Read the Farm Fires passage. According to the passage, which of the following statement(s) is/are true?", o: ["Politicians did not pay enough attention to farm fires.","Reduction in farm fires has been achieved due to coordinated efforts including super-seeders and government incentives.","Farm fires increased significantly this year.","Bio-decomposer was the most effective tool used this year."], e: "Per docx answer key, option 1." }
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
  if (!category) {
    category = await ExamCategory.create({ name: 'Central', type: 'Central', description: 'Central government competitive exams' });
  }

  let exam = await Exam.findOne({ code: 'SSC-SSP-HS' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC Selection Post (Higher Secondary Level)',
      code: 'SSC-SSP-HS',
      description: 'Staff Selection Commission - Selection Post (Higher Secondary Level - 12th-pass eligibility)',
      isActive: true
    });
  }

  const PATTERN_TITLE = 'SSC Selection Post (Higher Secondary Level)';
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Higher Secondary) - 25 June 2024 Shift-2';
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
