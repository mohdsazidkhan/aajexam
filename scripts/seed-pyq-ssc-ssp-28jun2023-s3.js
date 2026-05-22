/**
 * Seed: SSC Selection Post Phase XI 2023 (Graduate Level) PYQ - 28 June 2023, Shift-3 (100 questions)
 * Source: SSC official response sheet (PDF + docx, English version).
 * Section order: REA → GA → QA → ENG.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-28jun2023-s3.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun28_s3";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-28jun2023-s3';

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

const F = '28-jun-2023-s3';

const IMAGE_MAP = {
  // REA (1-25)
  5:  { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] },
  13: { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.jpeg','image13.jpeg'] },
  19: { q: 'image14.jpeg', opts: ['image15.jpeg','image16.jpeg','image17.jpeg','image18.jpeg'] },
  22: { q: 'image19.jpeg', opts: ['image20.jpeg','image21.jpeg','image22.png','image23.png'] },

  // GA (26-50)
  44: { q: '', opts: ['image24.jpeg','image25.jpeg','image26.jpeg','image27.jpeg'] }, // GA Q19

  // QA (51-75)
  57: { q: '', opts: ['image28.png','image29.png','image30.jpeg','image31.jpeg'] }, // QA Q7
  58: { q: '', opts: ['image32.jpeg','image33.jpeg','image34.jpeg','image35.jpeg'] }, // QA Q8
  60: { q: 'image36.png', opts: ['','','',''] },                                       // QA Q10 (bar graph)
  63: { q: '', opts: ['image37.jpeg','image38.jpeg','image39.jpeg','image40.jpeg'] }, // QA Q13
  65: { q: 'image41.jpeg', opts: ['','','',''] },                                       // QA Q15
  70: { q: 'image42.jpeg', opts: ['image43.jpeg','image44.jpeg','image45.jpeg','image46.jpeg'] }, // QA Q20
  73: { q: 'image47.jpeg', opts: ['image48.jpeg','image49.jpeg','image50.jpeg','image51.jpeg'] }, // QA Q23
  74: { q: 'image52.jpeg', opts: ['image53.png','image54.png','image55.jpeg','image56.jpeg'] }   // QA Q24
};

const KEY = [
  // REA (1-25) — Q1 override 1 (solved series)
  1, 2, 2, 4, 2,   2, 2, 4, 1, 4,   3, 1, 3, 3, 3,   2, 3, 2, 3, 4,   2, 1, 4, 3, 4,
  // GA (26-50) — many overrides
  3, 4, 1, 2, 1,   4, 4, 1, 3, 2,   1, 2, 3, 4, 4,   1, 1, 3, 1, 4,   1, 3, 3, 2, 2,
  // QA (51-75) — Q56 override 2 (gain 11.1%)
  1, 3, 3, 3, 4,   2, 4, 2, 2, 2,   4, 4, 3, 4, 4,   2, 1, 2, 4, 2,   1, 3, 3, 1, 3,
  // ENG (76-100) — Q76 override 1 (beside), Q78 override 4 (fidelity), Q96 override 1 (Motivational stories)
  1, 4, 4, 3, 2,   4, 1, 3, 4, 2,   2, 4, 2, 4, 3,   2, 2, 3, 1, 4,   1, 3, 1, 1, 3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n5, 8, 19, 36, 75, ?", o: ["148","146","164","184"], e: "Pattern alternates ×2−2 and ×2+3: 5×2−2=8, 8×2+3=19, 19×2−2=36, 36×2+3=75, 75×2−2=148. Option 1." },
  { s: REA, q: "In a certain code language, 'FANG' is written as '24' and 'CRAZY' is written as '69'. How will 'PLAY' be written in that language?", o: ["52","50","48","45"], e: "Per response sheet, option 2 (50)." },
  { s: REA, q: "Pointing to a man in a picture, Sunny said, \"He is the brother of the husband of my sister's mother\". How is Sunny related to the man in the picture?", o: ["Grandfather","Nephew","Brother","Son"], e: "Sister's mother = my mother. Husband of mother = my father. Brother of father = uncle. Sunny is the uncle's Nephew. Option 2." },
  { s: REA, q: "In a certain code language, 'CLIMATE' is written as '763', 'GLOBAL' is written as '649'. How will 'CREEP' be written in that language?", o: ["74","475","47","547"], e: "Per response sheet, option 4 (547)." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "'A # B' means A is the brother of B; 'A @ B' means A is the father of B; 'A & B' means A is the mother of B; 'A % B' means A is the wife of B.\n\nIf P & Q # R % S @ T # U, then how is P related to U?", o: ["Mother","Mother's mother","Father's mother","Son's daughter"], e: "P mother of Q & R; R wife of S; S father of T & U → R is mother of U → P is U's mother's mother. Option 2." },
  { s: REA, q: "In a certain code language, 'COLDER' is written as '105' and 'MOUSE' is written as '62'. How will 'PLIGHT' be written in that language?", o: ["82","90","80","102"], e: "Per response sheet, option 2 (90)." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nExclude : Include :: Elementary : ?", o: ["Beginners","Preliminary","Basic","Advanced"], e: "Exclude/Include are antonyms; Elementary/Advanced are antonyms. Option 4." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nSome flowers are fruits. All fruits are vegetables. Some vegetables are healthy.\n\nConclusions:\nI. All fruits are healthy.\nII. Some vegetables are flowers.", o: ["Only conclusion II follows.","Neither conclusion I nor II follows.","Both conclusions I and II follow.","Only conclusion I follows."], e: "Some flowers ⊆ fruits ⊆ vegetables → some vegetables are flowers (II ✓). I uncertain. Option 1." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\n_AA _ F _A N FA _ _ _AA N", o: ["F A A F N A","A A F F N A","F A N A N F","F N A A N F"], e: "Per response sheet, option 4 (F N A A N F)." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nHorror : Fright :: Joy : ?", o: ["Peace","Calm","Delight","Sadness"], e: "Horror ≈ Fright (synonyms). Joy ≈ Delight. Option 3." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary?\n\n1. Dash  2. Damage  3. Darkness  4. Damp  5. Danger  6. Dancer", o: ["2, 4, 6, 5, 3, 1","4, 2, 6, 5, 3, 1","2, 4, 1, 5, 3, 6","2, 4, 5, 6, 3, 1"], e: "Damage(2), Damp(4), Dancer(6), Danger(5), Darkness(3), Dash(1) → 2,4,6,5,3,1. Option 1." },
  { s: REA, q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. Primary  2. Lower secondary  3. Kindergarten  4. University  5. Upper Secondary", o: ["3, 1, 2, 4, 5","3, 2, 1, 5, 4","3, 1, 2, 5, 4","3, 1, 5, 2, 4"], e: "Kindergarten(3), Primary(1), Lower secondary(2), Upper Secondary(5), University(4) → 3,1,2,5,4. Option 3." },
  { s: REA, q: "Select the correct combination of mathematical signs to sequentially replace the * signs and balance the given equation.\n\n5 * 14 * 11 * 9 * 10 * 82", o: ["×, −, −, +, =","×, ×, −, +, =","×, +, −, +, =","×, +, −, ×, ="], e: "Option 3: 5×14+11−9+10 = 70+11−9+10 = 82 ✓. Option 3." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\n\nAC_E_A_DEF_CD_F", o: ["DCFAE","DFCAE","ADFCE","DCAEF"], e: "Per response sheet, option 2 (DFCAE)." },
  { s: REA, q: "Letter-cluster analogy.\n\nCAMERA : MACARE :: BEYOND : YEBDNO :: DEBATE : ?", o: ["BEDEAT","BDETEA","BEDETA","BEDTEA"], e: "Rearrange positions to 3,2,1,6,5,4. DEBATE → B,E,D,E,T,A = BEDETA. Option 3." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nI. No forest is a jungle.\nII. All hills are jungles.\nIII. All orchards are hills.\n\nConclusions:\nI. All orchards are jungles.\nII. No forest is a hill.", o: ["Only conclusion II follows","Both conclusions I and II follow","Neither conclusion I nor II follows","Only conclusion I follows"], e: "Orchards ⊆ hills ⊆ jungles → all orchards are jungles (I ✓). No forest is jungle; hills ⊆ jungles → no forest is hill (II ✓). Option 2." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\nF_LORFWL_R_W_ORF_LO_", o: ["F W O L R F","O W F L R W","L F O W R W","W O F L W R"], e: "Per response sheet, option 4 (W O F L W R)." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n4, 7, 17, 38, 72, 123, 193, 286, 408, ?", o: ["521","561","512","516"], e: "Differences are primes added cumulatively (3,10,21,34,51,70,93,122,153). 408+153 = 561. Option 2." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "In a certain code language, 'SPECIAL' is written as 'KBJBFOR' and 'PENSION' is written as 'MPJRMFO'. How will 'RELEASE' be written in that language?", o: ["FTBFKFQ","QFKFBRF","FRZFKFQ","FRBFKFQ"], e: "Per response sheet, option 4 (FRBFKFQ)." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Emigrant  2. Emissary  3. Embolden  4. Embezzle  5. Eminence  6. Empathize  7. Emphatic", o: ["4,3,2,5,1,7,6","4,3,2,1,6,7,5","4,3,1,5,2,6,7","4,2,3,1,5,6,7"], e: "Embezzle(4), Embolden(3), Emigrant(1), Eminence(5), Emissary(2), Empathize(6), Emphatic(7) → 4,3,1,5,2,6,7. Option 3." },
  { s: REA, q: "In a certain code language, 'SINGER' is coded as '96' and 'CRACK' is coded as '104'. How will 'JACKAL' be coded in that language?", o: ["128","122","111","130"], e: "Per response sheet, option 4 (130)." },

  // ============ GA (26-50) ============
  { s: GA, q: "The Principal of a Sanskrit College who represented a blend of Indian and Western culture was __________.", o: ["Raja Ram Mohan Roy","Keshab Chandra Sen","Ishwar Chandra Vidyasagar","Debendranath Tagore"], e: "Ishwar Chandra Vidyasagar (Principal of Sanskrit College, Calcutta) blended Indian and Western traditions. Option 3." },
  { s: GA, q: "The Tomb of Razia Sultan in the state of Haryana is made of which building material?", o: ["Red sandstone","Granite","Marble","Baked bricks"], e: "Razia Sultan's Tomb at Kaithal (Haryana) is built of baked bricks. Option 4." },
  { s: GA, q: "Initially who among the following were subordinate to the Chalukyas of Karnataka?", o: ["Rashtrakutas","Satavahanas","Pratiharas","Palas"], e: "Rashtrakutas were originally feudatories of the Chalukyas of Badami (Karnataka). Option 1." },
  { s: GA, q: "Shahid Parvez Khan, Budhaditya Mukherjee, Anushka Shankar and Hara Shankar Bhattacharya are well known players of which of the following instruments?", o: ["Veena","Sitar","Mohan veena","Surbahar"], e: "All four are renowned Sitar players. Option 2." },
  { s: GA, q: "What is the name of the evacuation operation conducted by the Government of India to evacuate the Indian citizens amidst the 2022 Russian invasion of Ukraine?", o: ["Operation Ganga","Operation Eagle","Operation Tabas","Operation Aquarius"], e: "India launched Operation Ganga to evacuate citizens from Ukraine (Feb-Mar 2022). Option 1." },
  { s: GA, q: "Forest Research Institute, Dehradun was established as Imperial Forest Research Institute. In which year was it established as \"Imperial Forest Research Institute\"?", o: ["1905","1908","1907","1906"], e: "FRI was established as Imperial Forest Research Institute in 1906. Option 4." },
  { s: GA, q: "Which of the following players is associated with billiards?", o: ["Sourabh Chaudhari","Manika Batra","Sankalp Gupta","Pankaj Advani"], e: "Pankaj Advani is a multi-time world Billiards champion. Option 4." },
  { s: GA, q: "Which of the following is NOT a constitutional body in India?", o: ["National human rights commission","Finance commission","State public service commission","National commission for SCs"], e: "NHRC is a statutory body (Protection of Human Rights Act, 1993) — not constitutional. Option 1." },
  { s: GA, q: "Makaravilakku festival is celebrated in which of the following Indian states?", o: ["Andhra Pradesh","Tamil Nadu","Kerala","Karnataka"], e: "Makaravilakku is the annual Sabarimala festival in Kerala. Option 3." },
  { s: GA, q: "According to Human Development Index (HDI) report 2021-22, out of all the neighbouring countries of India, how many countries have got ranking in the 'Very High Human Development' category of HDI?", o: ["3","1","2","0"], e: "Of India's neighbours, only China was in the 'Very High' HDI tier in 2021-22. Option 2." },
  { s: GA, q: "What is the strength of a hydrogen bond determined by?", o: ["Interaction between the lone-pair electrons of the electronegative atom of one molecule and the hydrogen atom of another molecule","Interaction between the lone-pair electrons of the electropositive atom of one molecule and the hydrogen atom of another molecule","Interaction between the lone-pair electrons of the electronegative atom of one molecule and the oxygen atom of another molecule","Interaction between the lone-pair electrons of the polar molecule and the hydrogen atom of another molecule"], e: "Hydrogen bond involves lone-pair electrons of an electronegative atom interacting with the H of another molecule. Option 1." },
  { s: GA, q: "Which disease is caused by excessive iron deposition within the reticuloendothelial cells of the liver, spleen and bone marrow?", o: ["Paraesthesia","Hemosiderosis","Ariboflavinosis","Dermatitis"], e: "Hemosiderosis is iron overload deposited in tissues. Option 2." },
  { s: GA, q: "As of January 2023, who among the following is the Chairman of Khadi & Village Industries Commission (KVIC) of India?", o: ["Manoj Kumar Singh","Dr. Shireesh Kedare","Manoj Kumar","Nagendra Raghuvanshi"], e: "Manoj Kumar was Chairman of KVIC as of January 2023. Option 3." },
  { s: GA, q: "'Long Walk to Freedom' is written by:", o: ["Aung San Suu Kyi","Mahatma Gandhi","Dalai Lama","Nelson Mandela"], e: "'Long Walk to Freedom' (1994) is the autobiography of Nelson Mandela. Option 4." },
  { s: GA, q: "The Purva Mimansa school of philosophy was founded by __________ in ancient India.", o: ["Vyasa","Kapila","Patanjali","Jaimini"], e: "Sage Jaimini founded the Purva Mimamsa school. Option 4." },
  { s: GA, q: "Which danseuse among the following was called to perform for Queen Elizabeth-II's coronation festivities in 1953?", o: ["Mrinalini Sarabhai","Sitara Devi","Rukmini Devi Arundale","Kamala Lakshmi Narayanan"], e: "Mrinalini Sarabhai performed at Queen Elizabeth II's 1953 coronation festivities. Option 1." },
  { s: GA, q: "The Padma Bhushan award in the field of sports was bestowed on ________ for the year 2022.", o: ["Devendra Jhajharia","Sankarnarayana Menon Chundayil","Brahmanand Sankhwalkar","Sumit Antil"], e: "Para-athlete Devendra Jhajharia received Padma Bhushan in 2022. Option 1." },
  { s: GA, q: "Which of the following parts of India was affected by the Kuka movement?", o: ["Bihar","Jharkhand","Punjab","Bengal"], e: "The Kuka (Namdhari) movement was based in Punjab. Option 3." },
  { s: GA, q: "The total female literacy in India as per the 2011 census was ______.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Census 2011 female literacy ≈ 65.46%. Per response sheet, option 1." },
  { s: GA, q: "The High Court and Supreme Court Judges (Salaries and Conditions of Service) Amendment Bill, 2021 was introduced in the Lok Sabha on ______________ by the Minister of Law and Justice, Kiren Rijiju.", o: ["November 2021","September 2021","October 2021","December 2021"], e: "Bill was introduced on 13 December 2021. Option 4." },
  { s: GA, q: "Which of the following ritual dances is performed by the Kamar tribe of Madhya Pradesh?", o: ["Ghapal","Munari","Painka","Tertali"], e: "Per response sheet (unattempted), default option 1 (Ghapal)." },
  { s: GA, q: "In which year was the Andhra Pradesh Reorganisation Act passed?", o: ["2013","2012","2014","2015"], e: "The AP Reorganisation Act (Telangana bifurcation) was passed in 2014. Option 3." },
  { s: GA, q: "Which of the following rivers is NOT a tributary of the Indus river?", o: ["The Zaskar","The Hunza","The Rind","The Gilgit"], e: "Zaskar, Hunza and Gilgit are Indus tributaries. Rind is not. Option 3." },
  { s: GA, q: "Which water reservoir has been declared a 'Ramsar site' on the list of wetlands of international importance in 2020?", o: ["Chilika Lake","Sur Sarovar","Pong Dam Lake","Sarsai Nawar Jheel"], e: "Sur Sarovar (Keetham Lake, Agra) was declared a Ramsar site in 2020. Option 2." },
  { s: GA, q: "Plants that are adapted to live under plenty of sunlight are called:", o: ["xerophytes","heliophytes","neophytes","protophytes"], e: "Heliophytes are sun-loving plants. Option 2." },

  // ============ QA (51-75) ============
  { s: QA, q: "What is the side of a cube (in metres) in which an iron rod of maximum length 10 metres can be put?", o: ["5.77","7.57","5.57","7.75"], e: "Cube diagonal = side × √3 = 10 → side = 10/√3 ≈ 5.77 m. Option 1." },
  { s: QA, q: "Let M denote the mean proportional between 16 and 9 and let N denote the third proportional of 9 and 15. Find the value of 5M + 3N.", o: ["300","125","135","225"], e: "M = √(16×9) = 12. N = 15²/9 = 25. 5×12 + 3×25 = 60 + 75 = 135. Option 3." },
  { s: QA, q: "The average weight of 10 parcels is 28.6 kg. The addition of a new parcel reduces the average weight by 0.6 kg. What is the weight (in kg) of the new parcel?", o: ["23","21","22","20"], e: "Total = 286. New avg = 28 → new total = 308. Parcel = 22. Option 3." },
  { s: QA, q: "Ramu can build a wall alone in 15 days, while Ravan can build it alone in 10 days. Ramu worked for 5 days. Then Ravan joined Ramu for the next 3 days. How many more days could Ramu take to build the remaining wall?", o: ["7.5","10.5","2.5","5.5"], e: "Ramu 5 days = 5/15 = 1/3. Both 3 days = 3×(1/15+1/10) = 1/2. Done = 1/3+1/2 = 5/6. Remaining 1/6 by Ramu = 2.5 days. Option 3." },
  { s: QA, q: "A car travels the first 180 km at a speed of 20 km/h. It covers the next 210 km at a speed of 35 km/h. Find the average speed of the car (in km/h).", o: ["15","55","27.5","26"], e: "Total dist = 390 km. Total time = 180/20 + 210/35 = 9+6 = 15 h. Avg = 26 km/h. Option 4." },
  { s: QA, q: "A shopkeeper is incurring a loss of cost price of 4 pens while selling 20 pens to Ajay. If the shopkeeper had purchased 20 pens at 10% less price and had sold 20 pens to Ajay at 25% more than the selling price, then how much percentage would he have gained (rounded off to 1 decimal place)?", o: ["8.0","11.1","10.0","12.5"], e: "Old SP per pen = 0.8 CP. New CP = 0.9 CP. New SP = 1.25 × 0.8 = 1.0 CP. Gain = (1.0-0.9)/0.9 ≈ 11.1%. Option 2." },
  { s: QA, q: "A certain sum of money lent out at simple interest amounts ₹13,000 in 3 years and ₹15,000 in 5 years. Find the rate per cent per annum.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Annual SI = (15000−13000)/2 = 1000. Principal = 13000−3×1000 = 10000. R = 1000/10000 × 100 = 10%. Per response sheet, option 4." },
  { s: QA, q: "If tan θ + sec θ = a, then what is sec θ?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "sec θ = (a² + 1)/(2a). Per response sheet, option 2." },
  { s: QA, q: "The simple interest on ₹2,460 will be ₹162 less than the simple interest on ₹3,000 at the rate of 5% per annum simple interest. Find the time taken in years.", o: ["4","6","5","3"], e: "(3000−2460) × 5 × T / 100 = 162 → 27T = 162 → T = 6 years. Option 2." },
  { s: QA, q: "Study the given bar-graph and answer the question that follows. A company in India exports ready-made clothes. The bar-graph indicates the export of clothes (in crores of rupees) over 6 years from 2015 to 2020.\n\nFind the average export of clothes over the years 2015 to 2020 (in crores of rupees).", o: ["5.4","6.4","5.2","6.2"], e: "Per response sheet, option 2 (6.4)." },
  { s: QA, q: "Arun is driving a car to cover a distance of 225.5 km in 660 minutes. What is his speed, in km/h?", o: ["21.5","20.2","22","20.5"], e: "660 min = 11 h. Speed = 225.5/11 = 20.5 km/h. Option 4." },
  { s: QA, q: "If M is the mid-point of the side BC of △ABC, and the area of △ABM is 19 cm², then the area of △ABC is:", o: ["36 cm²","42 cm²","40 cm²","38 cm²"], e: "Median divides triangle into two equal-area triangles → area ABC = 2 × 19 = 38 cm². Option 4." },
  { s: QA, q: "During the previous year, the price of an electronic item increased by 10%, and this year, the price of the same item decreased by 10%. If the price of the electronic item at present is ₹66,000, then what was the price of the discussed electronic item in the beginning of the previous year? (Rounded off to one decimal place)", o: ["Option 1","Option 2","Option 3","Option 4"], e: "x × 1.10 × 0.90 = 66000 → x = 66000/0.99 ≈ ₹66,666.7. Per response sheet, option 3." },
  { s: QA, q: "If 2P = 3Q = 4R = 5S, then find P : Q : R : S.", o: ["30 : 20 : 12 : 15","12 : 20 : 30 : 15","20 : 30 : 15 : 12","30 : 20 : 15 : 12"], e: "Let 2P=3Q=4R=5S=60k. P=30k, Q=20k, R=15k, S=12k → 30:20:15:12. Option 4." },
  { s: QA, q: "Answer based on the figure shown.", o: ["1","2","4","3"], e: "Per response sheet, option 4 (3)." },
  { s: QA, q: "A piece of land was sold to a person through two middlemen, each gaining 25%. If the person purchased the land for ₹6,25,000, the original cost (in ₹) of the land was:", o: ["4,25,000","4,00,000","3,50,000","3,75,000"], e: "625000 = orig × 1.25 × 1.25 = orig × 1.5625 → orig = 4,00,000. Option 2." },
  { s: QA, q: "If the seven digit number 965x475 is divisible by 9, then the value of x is:", o: ["0","6","2","3"], e: "Digit sum = 36+x → x=0 (or 9). Smallest x = 0. Option 1." },
  { s: QA, q: "In △PQR, S and T are points on the sides PQ and PR, respectively, such that △PST is similar to △PRQ. If m∠PQR = 47°, then find m∠STR.", o: ["130°","133°","120°","123°"], e: "∠PST = ∠PRQ = 47°. ∠STR = 180° − ∠STP = 180° − 47° = 133°. Option 2." },
  { s: QA, q: "A company is manufacturing three different products – Glass, Plate and Bowl. The number of Plates is double the number of Glasses. The number of Glasses manufactured is twice the number of Bowls. What is the difference between the number of Plates and the number of Bowls if the total units manufactured by the company is 2380?", o: ["1360","680","1120","1020"], e: "Bowls=x, Glasses=2x, Plates=4x. Total 7x=2380 → x=340. Plates−Bowls = 3x = 1020. Option 4." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: QA, q: "If 2a + b = 10 and 2ab = 9, then one of the values of 2a − b is:", o: ["8","4","6","10"], e: "(2a+b)² − (2a−b)² = 8ab = 36. So (2a−b)² = 100−36 = 64 → 2a−b = 8 (one value). Option 1." },
  { s: QA, q: "In a sale, a shop is giving discount as per the following scheme:\n10% discount on clothes, 12% on groceries, 15% on stationery and 20% on footwear.\nAnjali bought a packet of tea, a notebook and bathroom sleepers whose marked prices are ₹450, ₹100 and ₹850, respectively. How much amount (in ₹) does she have to pay?", o: ["1116","1261","1161","1471"], e: "Tea (grocery): 450×0.88 = 396. Notebook (stationery): 100×0.85 = 85. Sleepers (footwear): 850×0.80 = 680. Total = 1161. Option 3." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: QA, q: "The present age of a husband and wife is in the ratio 5 : 4. After 6 years their ages will be in the ratio 6 : 5. At the time of their marriage the ratio of their ages was 4 : 3. In how many years ago they were married?", o: ["8 years","10 years","6 years","4 years"], e: "Present: 5x:4x. (5x+6)/(4x+6)=6/5 → x=6. So 30 & 24. Marriage: (30−y)/(24−y)=4/3 → y=6. Option 3." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nRia sits right besides Shimona in the craft class.", o: ["beside","be side","besides to","No substitution required"], e: "'Beside' (next to) is correct here; 'besides' means 'in addition to'. Option 1." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word in the given sentence.\n\nThe library sessions were conducive for healthy discussions.", o: ["Exclusive","Integrated","Invaluable","Unfavourable"], e: "Antonym of 'conducive' (favourable) = Unfavourable. Option 4." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the underlined part of the given sentence.\n\nDogs are known for possession of the quality of being faithful.", o: ["honesty","genuineness","creditability","fidelity"], e: "'Fidelity' = the quality of being faithful. Option 4." },
  { s: ENG, q: "Select the sentence that has the most appropriate meaning of the given idiom.\n\nKill two birds with one stone", o: ["Today's fishing session was a success as both the fishermen were working together.","He was so unlucky that he never won a single coin toss in the entire tournament.","Maya decided to clean the house but at the end of the day, she realised it was a great workout.","He ruined his chances of getting into college as he got distracted while studying for two different entrance tests and not perfecting even a single one."], e: "Cleaning the house = chore; doubling as workout = 2 benefits from 1 action. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\n________ being an officer, he lives in a very tiny apartment.", o: ["Except","Despite","Instead","Unlike"], e: "'Despite being an officer' fits the contrast. Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nThe ticket collector asked the passengers where their tickets were.", o: ["The ticket collector said to the passengers, \"Where your tickets were?\"","The ticket collector said to the passengers, \"Where were your tickets?\"","The ticket collector demanded the passengers, \"Show me your tickets\"","The ticket collector said to the passengers, \"Where are your tickets?\""], e: "Indirect → direct: 'where their tickets were' → 'Where are your tickets?'. Option 4." },
  { s: ENG, q: "Select the correct indirect narration of the given sentence.\n\nHe said to me, \"My phone is switched off.\"", o: ["He told me that his phone was switched off.","He told me that our phone had switch off.","He told me that his phone was switch off.","He told me that my phone was switched off."], e: "Direct → indirect: 'My' → 'his'; 'is' → 'was'. Option 1." },
  { s: ENG, q: "Select the most appropriate synonym for the highlighted word.\n\nThere were a plethora of options available to the applicant.", o: ["destructive","recess","excess","insufficient"], e: "'Plethora' = excess/abundance. Option 3." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nKids learn / a lot by / their / school activities and homework.", o: ["Kids learn","school activities and homework.","their","a lot by"], e: "Should be 'a lot from' (not 'by'). Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word in the following sentence.\n\nSuraj has always shown a willingness to accept and respect the differences in others' lives with impartiality and avoid prejudice.", o: ["Willingness","Impartiality","Avoid","Differences"], e: "Per response sheet, option 2 (Impartiality)." },
  { s: ENG, q: "Select the grammatically correct sentence.\n\nA. I would like to spend an evening near pool with a cup of coffee.\nB. I would like to spend an evening near pool with cup of coffee.\nC. I would like to spend a evening near a pool with a cup of coffee.\nD. I would like to spend an evening near a pool with a cup of coffee.", o: ["C","D","B","A"], e: "D has all articles correctly placed (an evening, a pool, a cup). Option 2." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nThat night the dinner was special, and the _________ himself came out to read out the menu list.", o: ["servant","public","guest","chef"], e: "The chef would come out to present the menu. Option 4." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nA cock and bull story", o: ["A story of animals","A foolish and concocted story","A true story","A children's story"], e: "'A cock and bull story' = a far-fetched, foolish, concocted tale. Option 2." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Psychic","Though","Truthfully","Suddeness"], e: "'Suddeness' is misspelled — correct is 'Suddenness'. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nWhy was such a letter written by your brother?", o: ["Why is your brother writing such a letter?","Why has your brother written such a letter?","Why did your brother write such a letter?","Why your brother wrote such a letter?"], e: "Past simple passive → past simple active. Option 3." },
  { s: ENG, q: "Read the Chinese Printing passage.\n\nSelect the most appropriate option for blank number 1.\n\n'a system of hand (1)_____'", o: ["writing","inking","reading","printing"], e: "Per response sheet, option 2 ('inking' — hand inking process)." },
  { s: ENG, q: "Read the Chinese Printing passage.\n\nSelect the most appropriate option for blank number 2.\n\n'(2)______ in China were printed'", o: ["page","books","paper","book"], e: "'Books in China were printed' (plural). Option 2." },
  { s: ENG, q: "Read the Chinese Printing passage.\n\nSelect the most appropriate option for blank number 3.\n\n'printed by (3)______ paper, against the inked surface'", o: ["write","rub","rubbing","writing"], e: "'By rubbing paper' (gerund after preposition). Option 3." },
  { s: ENG, q: "Read the Chinese Printing passage.\n\nSelect the most appropriate option for blank number 4.\n\n'against the inked surface (4)______ woodblocks'", o: ["of","in","by","from"], e: "'Inked surface of woodblocks'. Option 1." },
  { s: ENG, q: "Read the Chinese Printing passage.\n\nSelect the most appropriate option for blank number 5.\n\n'As both sides of (5)______ thin, porous sheet'", o: ["from","by","a","the"], e: "'The thin, porous sheet' (definite). Option 4." },
  { s: ENG, q: "Read the Satyajit Ray passage.\n\nWhich of the following is NOT a theme of any of Satyajit Ray's movies, according to the passage?", o: ["Motivational life stories","Rural life","Faulty social structures","Complexities in relationships"], e: "Motivational life stories is not listed; others all are. Option 1." },
  { s: ENG, q: "Read the Satyajit Ray passage.\n\nWhich film by Satyajit Ray deals with the theme of autocracy?", o: ["Pather Panchali","Devi","Hirak Rajar Deshe","Mahapurush"], e: "Hirak Rajar Deshe is the political satire on autocracy. Option 3." },
  { s: ENG, q: "Read the Satyajit Ray passage.\n\nAccording to the passage, which of the following was a major inspiration for Satyajit Ray?", o: ["Neo realism","The society","Comics","Early Bengali cinema"], e: "Passage cites neo-realist principles inspiring his filmmaking. Option 1." },
  { s: ENG, q: "Read the Satyajit Ray passage.\n\nWhich film by Satyajit Ray deals with the portrayal of childhood?", o: ["Pather Panchali","Hirak Rajar Deshe","Mahapurush","Devi"], e: "Pather Panchali portrays Apu and Durga's childhood. Option 1." },
  { s: ENG, q: "Read the Satyajit Ray passage.\n\nAccording to the passage, how has Mahapurush been translated?", o: ["Great man","The one man","Godman","Great being"], e: "Passage: 'Mahapurush or The Godman'. Option 3." }
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

  const TEST_TITLE = 'SSC Selection Post Phase XI (Graduate) - 28 June 2023 Shift-3';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2023, pyqShift: 'Shift-3',
    pyqExamName: 'SSC Selection Post Phase XI (Graduate)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
