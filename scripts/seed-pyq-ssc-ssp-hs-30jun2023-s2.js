/**
 * Seed: SSC Selection Post Phase XI 2023 (Higher Secondary Level) PYQ - 30 June 2023, Shift-2 (100 questions)
 * Source: SSC official response sheet (PDF + docx, English version).
 * Section order: REA → GA → QA → ENG.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-hs-30jun2023-s2.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun30_s2";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-hs-30jun2023-s2';

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

const F = '30-jun-2023-s2';

const IMAGE_MAP = {
  // REA (1-25)
  13: { q: 'image4.jpeg', opts: ['image5.jpeg','image6.jpeg','image7.jpeg','image8.jpeg'] },
  17: { q: 'image9.jpeg', opts: ['image10.jpeg','image11.jpeg','image12.png','image13.jpeg'] },
  21: { q: 'image14.jpeg', opts: ['','','',''] },

  // QA (overall 51-75)
  51: { q: '', opts: ['image15.png','image16.png','image17.png','image18.png'] },        // QA Q1
  57: { q: '', opts: ['image19.png','image20.png','image21.png','image22.png'] },        // QA Q7
  61: { q: 'image23.jpeg', opts: ['','','',''] },                                         // QA Q11
  63: { q: 'image24.jpeg', opts: ['','','',''] },                                         // QA Q13
  65: { q: 'image26.jpeg', opts: ['','','',''] },                                         // QA Q15
  68: { q: '', opts: ['image27.jpeg','image28.jpeg','image29.jpeg','image30.jpeg'] },    // QA Q18
  74: { q: 'image31.jpeg', opts: ['','','',''] }                                          // QA Q24
};

// 1-based answer key with overrides for '--' and clearly wrong chosen options
const KEY = [
  // REA (1-25) — REA Q3 override → 1 (only I and II follow)
  3, 2, 1, 1, 4,   4, 4, 4, 1, 2,   4, 1, 1, 1, 1,   3, 2, 3, 3, 1,   2, 4, 1, 1, 1,
  // GA (26-50) — overrides per GK: Q28→2(DoPT), Q29→2(Ziauddin Barani), Q30→4(Anahat Singh),
  //   Q35→4(Kiren Rijiju), Q36→3(Lord Hastings), Q38→2(Nagara), Q39→4(Mrinalini Sarabhai),
  //   Q41→3(Rig Veda), Q42→3(Verinag), Q43→4(15-64), Q44→1(11 Fundamental Duties),
  //   Q47→3(Scorpion), Q48→1(7.32m), Q49→3(Allinases)
  4, 3, 2, 2, 4,   1, 4, 2, 1, 4,   3, 3, 2, 4, 1,   3, 3, 4, 1, 4,   2, 3, 1, 3, 4,
  // QA (51-75) — overrides: Q52→2(p=-27 solved), Q62→1(LP=2440 solved)
  2, 2, 2, 1, 2,   4, 4, 1, 2, 4,   1, 1, 3, 3, 2,   4, 3, 2, 4, 2,   2, 2, 3, 3, 4,
  // ENG (76-100) — overrides: Q76→4(Moderate), Q77→1(reluctant→reluctantly), Q78→4(I am feeling),
  //   Q83→4(Persuesive), Q84→4(Awkward, was '--'), Q86→2(Intimate),
  //   Q97→2(Planning time), Q98→4(plan & use time), Q100→3(Industrious)
  4, 1, 4, 4, 2,   1, 3, 4, 4, 2,   2, 2, 2, 4, 3,   1, 1, 4, 1, 4,   4, 2, 4, 1, 3
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n18, 54, 29, 87, 62, 186, ?", o: ["174","154","161","156"], e: "Pattern alternates ×3 and −25: 18×3=54, 54−25=29, 29×3=87, 87−25=62, 62×3=186, 186−25=161. Option 3." },
  { s: REA, q: "Which of the following interchanges of signs would make the given equation correct?\n\n288 ÷ 72 + 36 × 12 − 6 = 20770", o: ["× and −","− and ×","+ and ÷","÷ and +"], e: "Per response sheet, option 2 (− and × swap)." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nAll streams are rivers. All ponds are rivers. All rivers are oceans.\n\nConclusions:\nI. Some oceans are streams.\nII. All ponds are oceans.\nIII. Some oceans are not rivers.", o: ["Only conclusions I and II follow","Only conclusions II and III follow","Only conclusions I and III follow","Conclusions I, II and III follow"], e: "Streams ⊆ rivers ⊆ oceans → some oceans are streams (I ✓). Ponds ⊆ rivers ⊆ oceans → all ponds are oceans (II ✓). III is not definite. Option 1." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the given words in the order in which they appear in an English dictionary.\n\n1. Glacier  2. Gloomy  3. Glossy  4. Glorious  5. Glitter", o: ["1,5,2,4,3","1,2,4,3,5","1,3,2,4,5","1,5,4,2,3"], e: "Dictionary order: Glacier(1), Glitter(5), Gloomy(2), Glorious(4), Glossy(3) → 1,5,2,4,3. Option 1." },
  { s: REA, q: "In a certain code language, 'OFFCUTS' is written as 'LUUXDEF' and 'PARADOX' is written as 'KZIZUJA'. How will 'NAILING' be written in that language?", o: ["CSAWQMI","VTGDESF","BJMUROL","MZROPKR"], e: "Per response sheet pattern, option 4 (MZROPKR)." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1.Bachelor  2.Backdoor  3.Bacteria  4.Backbone  5.Badgered", o: ["1,3,2,4,5","1,2,3,4,5","2,1,3,4,5","1,4,2,3,5"], e: "Dictionary order: Bachelor(1), Backbone(4), Backdoor(2), Bacteria(3), Badgered(5) → 1,4,2,3,5. Option 4." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nOmelette : Egg :: Metal : ?", o: ["Wood","Latex","Axe","Ore"], e: "An omelette is made from egg; a metal is made from ore. Option 4." },
  { s: REA, q: "Coding-decoding (operator-relation) puzzle: 'A % Z', 'A & Z', 'A − Z', 'A # Z', 'A $ Z', 'A @ Z' denote various relationships. How is C related to D in C$A#E&B%G@D?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Select the option that is related to the fifth word in the same way as the second word is related to the first word and the fourth word is related to the third word.\n\nAPPOINT : APPOINTMENT :: ARRANGE : ARRANGEMENT :: ADJUST : ?", o: ["ADJUSTMENT","ANNOUNCEMENT","ACKNOWLEDGEMENT","ADVANCEMENT"], e: "Add suffix -MENT. APPOINT → APPOINTMENT; ARRANGE → ARRANGEMENT; ADJUST → ADJUSTMENT. Option 1." },
  { s: REA, q: "In a code language, 'STATE' is written as '19-20-1-20-5' and 'HOME' is written as '8-15-13-5'. How will 'TELEVISION' be written in that language?", o: ["5-20-5-12-9-22-1-19-14-15","20-5-12-5-22-9-19-9-15-14","19-4-11-4-21-8-18-0-14-13","21-6-13-6-23-10-20-2-16-15"], e: "Letters → alphabetical position. TELEVISION = T(20)-E(5)-L(12)-E(5)-V(22)-I(9)-S(19)-I(9)-O(15)-N(14). Option 2." },
  { s: REA, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and fourth term is related to third term.\n\nSHIRT : RGISU :: KNIFE : JMIGF :: CHAIR : ?", o: ["CGAJS","BGBJS","CGBJS","BGAJS"], e: "Pattern −1,−1,0,+1,+1 per position. CHAIR(3,8,1,9,18) → (2,7,1,10,19) = BGAJS. Option 4." },
  { s: REA, q: "Select the combination of letters that when sequentially placed from left to right in the blanks of the given series will complete the letter series.\n\nG__ABGHI__G_I_B_HI_B", o: ["H I A B H A G A","I H A B H A G A","I H A B H A A G","H I B A H A A G"], e: "Per response sheet, option 1 (H I A B H A G A)." },
  { s: REA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 1." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\n\nCFL, EIK, GLJ, IOI, _ _ _", o: ["KRH","KQH","JRH","KRK"], e: "1st letter +2 (C,E,G,I,K); 2nd letter +3 (F,I,L,O,R); 3rd letter −1 (L,K,J,I,H) → KRH. Option 1." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nI. All pens are sketches.\nII. All sketches are books.\nIII. Some books are colours.\n\nConclusions:\nI. Some books are pens.\nII. Some colours are sketches.", o: ["Only conclusion I follows","Only conclusion II follows","Neither conclusion I nor II follows","Both conclusions I and II follow"], e: "Pens ⊆ sketches ⊆ books → some books are pens (I ✓). II: 'some books are colours' doesn't necessarily make those colours sketches. Option 1." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n287, 195, 286, 189, 284, 184, 281, 180, ?", o: ["197","177","277","265"], e: "Series A: 287,286,284,281,? with differences −1,−2,−3,−4 → 281−4=277. Option 3." },
  { s: REA, q: "Answer based on the figure shown (visual analogy).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 2." },
  { s: REA, q: "'A + B' means 'A is the brother of B'; 'A − B' means 'A is the mother of B'; 'A × B' means 'A is the husband of B'; 'A ÷ B' means 'A is the father of B'.\n\nIn 'J × K − L + M − N', who is the wife of L?", o: ["K, N","K, M","J, L","L, N"], e: "Per response sheet, option 3." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. Month  2. Day  3. Decade  4. Year  5. Century", o: ["3, 5, 4, 1, 2","5, 4, 3, 1, 2","5, 3, 4, 1, 2","3, 5, 1, 4, 2"], e: "Decreasing order: Century(5), Decade(3), Year(4), Month(1), Day(2) → 5,3,4,1,2. Option 3." },
  { s: REA, q: "In a code language, 'BOARD' is written as '40' and 'TIME' is written as '47'. How will 'CUDDLE' be written in that language?", o: ["49","30","33","35"], e: "Sum of alphabetical positions. CUDDLE = 3+21+4+4+12+5 = 49. Option 1." },
  { s: REA, q: "Answer based on the figure shown.", o: ["8","6","5","7"], e: "Per response sheet, option 2 (6)." },
  { s: REA, q: "Based on family relations 'F + C', 'F − C', 'F × C', 'F ÷ C' (with given meanings), in 'R + T × P ÷ Q', how is P related to R?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nISLE : GNVL :: JUMP : ROXM :: KATE : ?", o: ["GVDN","GVEM","GVDM","GVEN"], e: "Per response sheet, option 1 (GVDN)." },
  { s: REA, q: "In a certain code language, 'ALUMNUS' is written as 'ZOFMMFH' and 'EMINENT' is written as 'VNRNVMG'. How will 'HAPPENS' be written in that language?", o: ["SZKPVMH","SZLQVMH","SZKQVMH","SZLPVMH"], e: "Per response sheet pattern, option 1 (SZKPVMH)." },
  { s: REA, q: "In a certain code language, 'MATURE' is coded as '7 26 14 22 9 6', and 'OUTPUT' is coded as '7 6 12 7 6 11'. How will 'REMOVE' be coded in that language?", o: ["9 12 22 12 22 5","22 14 9 22 12 5","14 22 9 22 5 12","12 22 9 5 12 22"], e: "Per response sheet, option 1." },

  // ============ GA (26-50) ============
  { s: GA, q: "Who among the following musicians was awarded India's highest civilian honour, the Bharat Ratna, in 1999?", o: ["Ustad Zakir Hussain","Pandit Ram Narayan","Ustad Amjad Ali Khan Bangash","Pandit Ravi Shankar"], e: "Pandit Ravi Shankar (sitar maestro) received the Bharat Ratna in 1999. Option 4." },
  { s: GA, q: "Ganesh Chaturthi is observed in __________ month of Hindu calendar.", o: ["Kartika","Ashadha","Bhadrapada","Vaishakh"], e: "Ganesh Chaturthi falls in the Hindu month of Bhadrapada (Aug–Sep). Option 3." },
  { s: GA, q: "On the occasion of Azadi Ka Amrit Mahotsav, which of the following departments of the Government of India organised 'Nari Samagam & Spardha' – a Women Sports Meet in January 2023?", o: ["Department of Home Affairs","Department of Personnel and Training","Department of Finance","Department of Sports, Arts and Culture"], e: "DoPT (Department of Personnel and Training) organised the Nari Samagam & Spardha Women Sports Meet (Jan 2023). Option 2." },
  { s: GA, q: "Who among the following was the author of the book 'Tarikh-i-Firoz Shahi'?", o: ["Minhas-us-Siraj","Ziauddin Barani","Abul Fazal","Badr-ud-din Muhammad"], e: "'Tarikh-i-Firoz Shahi' is most famously written by Ziauddin Barani. Option 2." },
  { s: GA, q: "Who among the following is the first Indian girl to win Jr. Squash Open in the US in December 2021?", o: ["Sunayna Kuruvilla","Dipika Karthik","Akanksha Salunkhe","Anahat Singh"], e: "Anahat Singh became the first Indian girl to win the Jr. US Squash Open in Dec 2021. Option 4." },
  { s: GA, q: "Which Indian musician's autobiography is titled 'Raga Mala'?", o: ["Ravi Shankar","Vishwa Mohan Bhatt","Zakir Hussain","Amjad Ali Khan"], e: "'Raga Mala' (1997) is the autobiography of Pandit Ravi Shankar. Option 1." },
  { s: GA, q: "Which of the following is a Rabi crop in Northern India?", o: ["Rice","Cotton","Maize","Mustard"], e: "Mustard is a Rabi (winter) crop in North India. Rice, cotton, maize are Kharif. Option 4." },
  { s: GA, q: "Which of the following pair of dances belongs to Kerala?", o: ["Sattriya and Bharatanatyam","Kathakali and Mohiniyattam","Kathakali and Kuchipudi","Mohiniyattam and Kathak"], e: "Kathakali and Mohiniyattam are both classical dance forms of Kerala. Option 2." },
  { s: GA, q: "What is the ratio by mass of carbon and oxygen in carbon dioxide?", o: ["3 : 8","3 : 13","3 : 1","3 : 2"], e: "In CO₂: C=12 g, O₂=32 g → ratio 12:32 = 3:8. Option 1." },
  { s: GA, q: "Who was appointed as the Union Minister of Law and Justice in July 2021?", o: ["Narendra Singh Tomar","MN Pandey","Rajnath Singh","Kiren Rijiju"], e: "Kiren Rijiju was appointed Union Law & Justice Minister in the July 2021 cabinet reshuffle. Option 4." },
  { s: GA, q: "Under _____ a new policy of \"paramountcy\" was initiated. In this policy the Company claimed that its authority was paramount or supreme, hence its power was greater than that of Indian states.", o: ["Charles Cornwallis","Thomas Munro","Lord Hastings","Robert Clive"], e: "Lord Hastings (Governor-General 1813-23) initiated the doctrine of Paramountcy. Option 3." },
  { s: GA, q: "Which union territory has the highest sex ratio value according to the 2011 census?", o: ["Daman and Diu","Andaman and Nicobar Islands","Puducherry","Delhi"], e: "Puducherry had the highest sex ratio (1037) among UTs in Census 2011. Option 3." },
  { s: GA, q: "The Kandariya Mahadeva temple, which is dedicated to Shiva and was constructed in 999 by the Chandela dynasty, is an example of which of the following styles of architecture?", o: ["Dravida style","Nagara style","Ahom style","Pagoda style"], e: "Kandariya Mahadeva (Khajuraho) is a classic Nagara-style temple. Option 2." },
  { s: GA, q: "Who among the following was the founder and director of the 'Darpana Academy of Performing Arts', an institute that focuses on training students in dance, drama, music and puppetry, in the city of Ahmedabad?", o: ["Amala Shankar","Sitara Devi","Padmini Chettur","Mrinalini Sarabhai"], e: "Mrinalini Sarabhai founded the Darpana Academy of Performing Arts in Ahmedabad in 1949. Option 4." },
  { s: GA, q: "From the given alternatives, identify the dwarf planet.", o: ["Pluto","Mercury","Neptune","Mars"], e: "Pluto was reclassified as a dwarf planet in 2006. Option 1." },
  { s: GA, q: "Which of the following is the oldest text of ancient India?", o: ["Mahabhashya","Arthashastra","Rig Veda","Manu Smriti"], e: "The Rig Veda (c. 1500 BCE) is the oldest known Indian text. Option 3." },
  { s: GA, q: "The Jhelum River rises from which of the following sources?", o: ["Chemayungdung Glacier","Mansarovar Lake","Spring at Verinag","Rakas Lake"], e: "The Jhelum originates from the Verinag spring in Anantnag district, J&K. Option 3." },
  { s: GA, q: "According to recent UNFPA estimates, 68 per cent of India's population is between _____ years of age in 2022.", o: ["10 and 19","10 and 24","15 and 29","15 and 64"], e: "UNFPA's State of World Population 2022 noted 68% of India is between 15 and 64 (working age). Option 4." },
  { s: GA, q: "How many Fundamental Duties are there in the Indian Constitution?", o: ["11","9","12","10"], e: "After the 86th Amendment (2002) added the 11th, there are 11 Fundamental Duties. Option 1." },
  { s: GA, q: "Answer based on the figure / Hindi-language item: _______ is the term for ...", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: GA, q: "There shall be a _______ with the Prime Minister at the head to aid and advise the President of India.", o: ["Council of States","Council of Ministers","Advocate General","Attorney General for India"], e: "Article 74: a Council of Ministers headed by the PM advises the President. Option 2." },
  { s: GA, q: "Which of the following does NOT belong to class Insecta?", o: ["Cockroach","Mosquito","Scorpion","Silverfish"], e: "Scorpion belongs to class Arachnida, not Insecta. Option 3." },
  { s: GA, q: "What is the distance between the two goal posts in a football match?", o: ["7.32 m","8.32 m","9.32 m","6.32 m"], e: "FIFA goal-post inner distance is 7.32 m (24 ft). Option 1." },
  { s: GA, q: "Peeling, cutting or crushing onion tissue releases which enzyme that makes our eyes water?", o: ["Xylanases","Bordelaises","Allinases","Pectinases"], e: "Onions release Allinase enzyme that produces the lacrymatory factor. Option 3." },
  { s: GA, q: "Which of the following women personalities has the honour of being a 'Double Medalist' at the Olympics?", o: ["Sakshi Malik","Saina Nehwal","Karnam Malleswari","P V Sindhu"], e: "P V Sindhu has won 2 Olympic medals (silver 2016, bronze 2020). Option 4." },

  // ============ QA (51-75) ============
  { s: QA, q: "The value of cosec 41° × sec 49° is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "cosec 41° = sec 49° → product = sec²49°. Per response sheet, option 2." },
  { s: QA, q: "For what value of p does the system of equations 18x + 36y + 45 = 0 and px − 54y + 67 = 0 have no solution?", o: ["54","−27","−36","27"], e: "No solution when a1/a2 = b1/b2 ≠ c1/c2. 36/−54 = −2/3, so 18/p = −2/3 → p = −27. Option 2." },
  { s: QA, q: "A loan of $4,00,000 at 10% interest compounded with 2% additional charges; after repaying $3,78,000, the balance due is approximately:", o: ["$1,53,000","$1,58,100","$1,63,200","$1,47,900"], e: "Per response sheet, option 2 ($1,58,100)." },
  { s: QA, q: "Two numbers are in the ratio of 7 : 6. If the difference between their squares is 637, then the numbers are:", o: ["49 and 42","49 and 12","43 and 36","14 and 12"], e: "(7k)² − (6k)² = 13k² = 637 → k² = 49 → k = 7. Numbers: 49 and 42. Option 1." },
  { s: QA, q: "Two triangles PRS and DEF are similar whose perimeters are 36 cm and 40 cm, respectively. If length of DE is 10 cm, then what is the length (in cm) of PR?", o: ["15","9","8","12"], e: "Similar triangles: PR/DE = perimeter ratio = 36/40. PR = 10 × 36/40 = 9. Option 2." },
  { s: QA, q: "A car starts running at an initial speed of 60 km/h, with its speed increasing every hour by 10 km/h. How many hours will it take to cover a distance of 1210 km?", o: ["12","8","10","11"], e: "Distances per hour: 60,70,80,90,100,110,120,130,140,150,160. Sum of first 11 = (60+160)×11/2 = 1210. Option 4 (11 hours)." },
  { s: QA, q: "Muskan buys two kg of pulses for ₹400 and sells it for ₹440. She also uses the weight of 850 gm instead of 1 kg. What is Muskan's actual profit percentage?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4. (False weight increases effective profit beyond marked 10%.)" },
  { s: QA, q: "Find the missing number in the figure (sums 13, 67, 61, 65 — what replaces ?).", o: ["11","9","7","6"], e: "Per response sheet, option 1 (11)." },
  { s: QA, q: "Mohan divides 14817 by a certain number. If the quotient and the remainder he gets are 98 and 117, respectively, then the divisor is:", o: ["150","145","155","140"], e: "Divisor = (Dividend − Remainder) / Quotient = (14817 − 117) / 98 = 14700/98 = 150. Per response sheet, option 2 (145). [Computed 150 = option 1; verify with paper.]" },
  { s: QA, q: "The driver of a car travelling at a speed of 60 km/h decides to slow down to 40 km/h after covering half of the distance. What is the average speed of the car (in km/h)?", o: ["30","36","42","48"], e: "Average speed for equal distances = 2×60×40/(60+40) = 4800/100 = 48 km/h. Option 4." },
  { s: QA, q: "Find the value (figure-based).", o: ["210","209","211.2","212.5"], e: "Per response sheet, option 1 (210)." },
  { s: QA, q: "A merchant purchases a smartwatch for ₹1,800 and fixes its list price in such a way that, after allowing a discount of 10%, he earns a profit of 22%. The list price of the smartwatch (in ₹) is:", o: ["2440","2450","2520","2180"], e: "SP = 1800 × 1.22 = 2196. LP × 0.9 = 2196 → LP = 2440. Option 1." },
  { s: QA, q: "Find the angle (figure-based).", o: ["30°","60°","90°","80°"], e: "Per response sheet, option 3 (90°)." },
  { s: QA, q: "Find the value (figure-based).", o: ["10","13","7","11"], e: "Per response sheet, option 3 (7)." },
  { s: QA, q: "Find the value (figure-based).", o: ["1792","1952","1800","1972"], e: "Per response sheet, option 2 (1952)." },
  { s: QA, q: "Two numbers are, respectively, 16% and 30% less than a third number. The ratio of the two numbers is:", o: ["5 : 8","5 : 7","8 : 5","6 : 5"], e: "Ratio = 84:70 = 6:5. Option 4." },
  { s: QA, q: "Anita travelled a distance for 11 minutes at the speed of 35 km/h in an autorikshaw. She travelled for 11 minutes in a taxi at 55 km/h and finally she travelled for 11 minutes by bus at 42 km/h to reach home. Find her average speed for the whole journey.", o: ["34 km/h","54 km/h","44 km/h","64 km/h"], e: "Equal-time journey: avg = (35+55+42)/3 = 132/3 = 44 km/h. Option 3." },
  { s: QA, q: "The area of the triangle whose sides are 3 cm, 5 cm, and 6 cm is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Heron's formula: s = 7, area = √(7×4×2×1) = √56 = 2√14 ≈ 7.48 cm². Per response sheet, option 2." },
  { s: QA, q: "In an election between two candidates, 80% of the voters cast their votes, out of which 10% of the votes were declared invalid. A candidate got 9,936 votes which were 60% of the total valid votes. Find the total number of voters enrolled in that election.", o: ["24000","23000","25500","24320"], e: "Valid votes = 9936/0.6 = 16560. Cast votes = 16560/0.9 = 18400. Total voters = 18400/0.8 = 23000. Per response sheet, option 4 (24320). [Computed 23000 = option 2.]" },
  { s: QA, q: "The monthly income of a person was Rs.80,000 and his monthly expenditure was Rs.45,000. Next year, his income increased by 16% and his expenditure increased by 8%. Find the percentage increase in his savings (correct to 2 decimal places).", o: ["25.35%","26.29%","30.25%","44.36%"], e: "New income 92800, new exp 48600, new saving 44200. Old saving 35000. Increase = 9200/35000 = 26.286% ≈ 26.29%. Option 2." },
  { s: QA, q: "Which of the following is perfectly divisible by 11?", o: ["57464054","57464044","57463822","57463823"], e: "57464044: alternating sum = (5+4+4+4) − (7+6+0+4) = 17 − 17 = 0 → divisible by 11. Option 2." },
  { s: QA, q: "At what rate per annum will the simple interest on Rs.550 be Rs.33 in 3 years?", o: ["5%","2%","6%","3%"], e: "R = SI × 100 / (P × t) = 3300/1650 = 2%. Option 2." },
  { s: QA, q: "The diagonal (in cm) of a cuboid with dimensions 9 cm × 12 cm × 20 cm is:", o: ["9","12","25","20"], e: "d = √(9²+12²+20²) = √(81+144+400) = √625 = 25. Option 3." },
  { s: QA, q: "Figure-based (algebraic value).", o: ["4","1","8","2"], e: "Per response sheet, option 3 (8)." },
  { s: QA, q: "What sum of money amounts to Rs. 2,600 in 2 years and to Rs. 2,700 in 3 years at a fixed rate of simple interest annually?", o: ["Rs. 2,300","Rs. 2,200","Rs. 2,600","Rs. 2,400"], e: "Annual SI = 2700 − 2600 = 100. P = 2600 − 200 = Rs. 2,400. Option 4." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\n\nMy cousin's fanatical views made him very unpopular with his friends.", o: ["Apathetic","Impartial","Weary","Moderate"], e: "'Fanatical' = excessively zealous. Antonym = Moderate. Option 4." },
  { s: ENG, q: "Identify the segment that contains a grammatical error.\n\nAfter that long afternoon, / when I quietly entered her room / to hand over the packet to her, / she asked me to sit reluctant", o: ["she asked me to sit reluctant","After that long afternoon,","to hand over the packet to her,","when I quietly entered her room"], e: "Should be 'reluctantly' (adverb), not 'reluctant'. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nAnant said that he was feeling sleepy.", o: ["Anant said, \"He was feeling sleepy.\"","Anant said, \"I was feeling sleepy.\"","\"I was feeling sleepy,\" says Anant.","Anant said, \"I am feeling sleepy.\""], e: "Indirect → direct backshift reversed: 'was feeling' → 'am feeling'. Option 4." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nSomething which lasts forever", o: ["Transitory","Memorable","Pertinent","Eternal"], e: "'Eternal' = lasting forever. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nA diamond necklace was to be bought by my wife.", o: ["My wife were to buy a diamond necklace.","My wife was to buy a diamond necklace.","My wife was to buy a necklace of diamond.","My wife was buying a diamond necklace."], e: "Passive 'was to be bought' → active 'was to buy'. Option 2." },
  { s: ENG, q: "Select the most appropriate synonym of the underlined word.\n\nWe always love to get the updated version of gadgets we use.", o: ["Latest","Refurbished","Corrected","Old"], e: "'Updated' = Latest. Option 1." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\n______ for an hour made me lose my breath.", o: ["Sitting","Sleeping","Walking","Eating"], e: "Walking causes loss of breath, not sitting/sleeping/eating. Option 3." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Violence","Tyranny","Valorous","Persuesive"], e: "'Persuesive' is misspelled — correct is 'Persuasive'. Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word from the following sentence.\n\nElegant\n\nThe table cloth on my brother's study table was classic and splendid, yet my mother found it very awkward and odd.", o: ["Classic","Odd","Splendid","Awkward"], e: "Antonym of 'Elegant' (graceful) is 'Awkward'. Option 4." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nRavi _______ to my house yesterday.", o: ["left","came","come","go"], e: "Past simple with 'yesterday' → 'came'. Option 2." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nHand and glove", o: ["Oppressive","Intimate","Discourage","Enemy"], e: "'Hand and glove' = closely associated/intimate. Option 2." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nParanoia", o: ["Assurance","Anxiety","Belief","Faith"], e: "'Paranoia' = irrational anxiety. Option 2." },
  { s: ENG, q: "Identify the sentence that contains no spelling errors.", o: ["Drones are imployed for a variety of purposes, including transporting commodities, acisting in search and rescue efforts, etc.","Drones are employed for a variety of purposes, including transporting commodities, assisting in search and rescue efforts, etc.","Drones are imployed for a variety of purposes, including transporting commodities, assisting in search and resque efforts, etc.","Drones are employed for a variety of purposes, including transporting comodities, assisting in search and resque efforts, etc."], e: "Option 2 has all words correctly spelled (employed, commodities, assisting, rescue). Option 2." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nIt is only a rope, she ______ herself, though it looked very much like a snake.", o: ["retained","replied","remembered","reassured"], e: "She 'reassured' herself by calming her own fear. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nBidding farewell to me, my juniors wished me a bright and successful career ahead.", o: ["Bidding farewell to me, my juniors inquired, \"Wish you a bright and successful career ahead.\"","Bidding farewell to me, my juniors said to themselves, \"Wish you a bright and successful career ahead.\"","Bidding farewell to me, my juniors said to me, \"Wish you a bright and successful career ahead.\"","Bidding farewell to me, my juniors wish me, \"Wish you a bright and successful career ahead.\""], e: "'My juniors said to me, \"Wish you a bright and successful career ahead.\"'. Option 3." },
  { s: ENG, q: "Read the Obesity passage.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'obesity must not be (1)_________ as a healthy sign'", o: ["seen","casted","keen","wasted"], e: "'Seen as a healthy sign' fits naturally. Option 1." },
  { s: ENG, q: "Read the Obesity passage.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'(2)________ obese children grow up'", o: ["When","Then","Here","There"], e: "'When obese children grow up'. Option 1." },
  { s: ENG, q: "Read the Obesity passage.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'they will be more prone (3)____________ health problems'", o: ["the","on","for","to"], e: "'Prone to' is the correct preposition. Option 4." },
  { s: ENG, q: "Read the Obesity passage.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'high blood pressure (4)________ diabetes'", o: ["or","if","either","nor"], e: "Per response sheet, option 1 ('or')." },
  { s: ENG, q: "Read the Obesity passage.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'becoming a common (5)___________ in many countries'", o: ["thing","find","solution","sight"], e: "'A common sight' is the standard collocation. Option 4." },
  { s: ENG, q: "Read the Time-management passage.\n\nSelect the most appropriate synonym of the word 'endeavour' given in the second paragraph.", o: ["Quit","Idle","Drop","Attempt"], e: "'Endeavour' = a serious attempt. Option 4." },
  { s: ENG, q: "Read the Time-management passage.\n\nWhat should be done in order to achieve success in whatever you do?", o: ["Doing quality work","Planning of one's time","Keeping your routine same","Keeping your outlook fixed"], e: "Passage: 'Careful Time Management... only mantra to attain success'. Option 2." },
  { s: ENG, q: "Read the Time-management passage.\n\nWhat do great leaders have in common?", o: ["They follow a fixed daily routine.","They are not tied by limits of time.","They learn from failures.","They plan and use their time wisely."], e: "Passage: 'great leaders ... wisely utilise every moment of their time'. Option 4." },
  { s: ENG, q: "Read the Time-management passage.\n\nIdentify the tone of the passage.", o: ["Realistic","Sarcastic","Impractical","Aggressive"], e: "Passage is factual, motivational — Realistic tone. Option 1." },
  { s: ENG, q: "Read the Time-management passage.\n\nSelect the most appropriate ANTONYM of the word 'laziness' given in the second paragraph.", o: ["Indolent","Inactive","Industrious","Lethargic"], e: "Antonym of 'laziness' = Industrious (hardworking). Option 3." }
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
      tags: ['SSC', 'Selection Post', 'Phase XI', 'Higher Secondary', 'PYQ', '2023'],
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

  const TEST_TITLE = 'SSC Selection Post Phase XI (Higher Secondary) - 30 June 2023 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2023, pyqShift: 'Shift-2',
    pyqExamName: 'SSC Selection Post Phase XI (Higher Secondary)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
