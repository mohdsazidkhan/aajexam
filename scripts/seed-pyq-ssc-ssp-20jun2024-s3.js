/**
 * Seed: SSC Selection Post Phase XII 2024 (Graduate Level) PYQ - 20 June 2024, Shift-3 (100 questions)
 * Source: SSC official docx — answer key decoded from inline green-tick (rId6) image bullets.
 * Section order: REA → GA → QA → ENG.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-20jun2024-s3.js
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun20_2024_s3";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-20jun2024-s3';

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

const F = '20-jun-2024-s3';

const IMAGE_MAP = {
  // REA (1-25)
  9:  { q: 'image4.jpeg', opts: ['','','',''] },
  17: { q: 'image5.png',  opts: ['image6.png','image7.png','image8.png','image9.png'] },
  18: { q: 'image10.jpeg', opts: ['image11.jpeg','image12.jpeg','image13.jpeg','image14.jpeg'] },
  22: { q: 'image15.png', opts: ['image16.png','image17.png','image18.png','image19.png'] },

  // QA (51-75)
  52: { q: '', opts: ['image20.png','image21.png','image22.png','image23.png'] },
  53: { q: 'image24.jpeg', opts: ['','','',''] },
  55: { q: '', opts: ['image26.png','image27.png','image28.png','image29.png'] },
  61: { q: 'image32.jpeg', opts: ['image33.jpeg','image34.jpeg','image35.jpeg','image36.jpeg'] },
  62: { q: 'image37.png', opts: ['','','',''] },
  68: { q: '', opts: ['image39.png','image40.png','image41.png','image42.png'] }
};

// Answer key decoded from inline green-tick bullets in source docx
const KEY = [
  // REA (1-25)
  4, 4, 4, 1, 1,   4, 3, 2, 2, 1,   1, 2, 2, 4, 3,   2, 2, 4, 2, 3,   1, 4, 1, 4, 4,
  // GA (26-50)
  2, 3, 4, 2, 2,   1, 2, 1, 2, 3,   2, 4, 4, 2, 3,   2, 2, 2, 2, 2,   1, 3, 3, 4, 3,
  // QA (51-75)
  3, 2, 4, 2, 4,   2, 1, 3, 3, 4,   2, 3, 2, 1, 2,   2, 3, 1, 3, 1,   2, 2, 2, 2, 1,
  // ENG (76-100)
  3, 1, 1, 2, 4,   3, 1, 2, 4, 3,   2, 3, 3, 3, 1,   1, 1, 2, 3, 4,   3, 2, 2, 4, 1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "In a certain code language, ROSE is coded as 51 and WAX is coded as 33. How will FOX be coded in that language?", o: ["40","31","35","36"], e: "ROSE = R(18)+O(15)+S(19)+E(5) − something? Sum 57, code 51 → diff −6. WAX = 23+1+24 = 48, code 33 → diff −15. Per docx key, option 4 (36)." },
  { s: REA, q: "In a certain code language, 'WBRP' is coded as '59' and 'MSAQ' is coded as '50'. How will 'FUZJ' be coded in that language?", o: ["58","54","69","63"], e: "Sum of letter positions: WBRP = 23+2+18+16 = 59 ✓; MSAQ = 13+19+1+17 = 50 ✓. FUZJ = 6+21+26+10 = 63. Option 4." },
  { s: REA, q: "Family-relation puzzle: A+B = mother, A−B = brother, A×B = wife, A#B = father.\n\nHow is W related to P if 'W × V + T # R − S × P'?", o: ["Brother's wife's father's mother's father","Wife's father's mother's father","Wife's father's mother's brother","Brother's wife's father's mother's brother"], e: "Per docx answer key, option 4." },
  { s: REA, q: "Which two signs should be interchanged to make the given equation correct?\n\n289 + 17 × 12 ÷ 216 − 300 = 120", o: ["× and +","− and +","+ and ×","× and −"], e: "Per docx key, option 1 (× and + swap)." },
  { s: REA, q: "In a certain code language, 'CAN' is written as '63', and 'TWO' is written as '23'. How will 'USE' be written in that language?", o: ["36","33","43","51"], e: "Per docx answer key, option 1 (36)." },
  { s: REA, q: "Select the letter from among the given options that can replace the question mark (?) in the following series.\n\nY, W, T, P, K, ?", o: ["F","G","H","E"], e: "Differences: −2,−3,−4,−5,−6. K(11)−6 = E(5). Option 4." },
  { s: REA, q: "Family-relation puzzle: A+B = mother, A−B = brother, A×B = wife, A÷B = father.\n\nHow is R's daughter related to T if 'P + Q × R ÷ S − T × U'?", o: ["Brother's son","Brother's father","Brother's daughter","Brother's wife"], e: "S brother of T. R father of S. R's daughter is S's sister → T's brother's sister → T is brother's brother? Per docx key, option 3 (Brother's daughter)." },
  { s: REA, q: "In a certain code language, 'you were there' is coded as 'pu sg ka' and 'there are branches' is coded as 'sg np tu'. How is 'there' coded in the given language?", o: ["pu","sg","np","ka"], e: "Common word 'there' has common code 'sg' in both phrases. Option 2." },
  { s: REA, q: "Six numbers 1, 2, 3, 4, 5 and 6 are written on different faces of a dice. Three positions of this dice are shown in the given figure. Find the number on the face opposite to the number 3.", o: ["2","6","1","4"], e: "Per docx answer key (dice figure), option 2 (6)." },
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Campus  2. Calendar  3. Capture  4. Capital  5. Calculate", o: ["5, 2, 1, 4, 3","5, 3, 2, 1, 4","3, 2, 1, 4, 5","3, 5, 4, 2, 1"], e: "Calculate(5), Calendar(2), Campus(1), Capital(4), Capture(3) → 5,2,1,4,3. Option 1." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nNorth America : Mexico :: South America : ?", o: ["Venezuela","Jamaica","Frankfurt","Cranberry"], e: "Mexico is in North America; Venezuela is in South America. Option 1." },
  { s: REA, q: "26 is related to 12 following a certain logic. Following the same logic, 36 is related to 18. Which of the following is related to 20 using the same logic?", o: ["42","45","53","35"], e: "26 → 12 (?), 36 → 18 (/2). Per docx key, option 2 (45)." },
  { s: REA, q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster.\n\nSCATTER : TBBSUDS :: RESPECT : SDTOFBU :: SUCCESS : ?", o: ["RTBDFTR","TTDBFRT","TTDBFTR","TTBDFTR"], e: "Per docx answer key, option 2 (TTDBFRT)." },
  { s: REA, q: "In a certain code language, 'break the wall' is written as 'jl mt hk' and 'wall is black' is written as 'zy hk bs'. How is 'wall' written in the given language?", o: ["bs","zy","jl","hk"], e: "Common word 'wall' shares common code 'hk' in both. Option 4." },
  { s: REA, q: "In a code language, 'THENW' is coded as 'WNEHT' and 'HOVER' is coded as 'REVOH'. How will 'SWAMP' be coded in the same language?", o: ["PAWMS","PWAMS","PMAWS","PMBWS"], e: "Reverse the word: SWAMP → PMAWS. Option 3." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nSPEAK : ROIEJ :: THEIR : SGIOQ :: BEING : ?", o: ["BIONF","AIOMF","AIONF","BOINF"], e: "Per docx answer key, option 2 (AIOMF)." },
  { s: REA, q: "Identify the figure which when put in place of the question mark (?) will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 2." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n15, 20, 45, 170, ?", o: ["840","795","520","645"], e: "Per docx key, option 2 (795). (Pattern of multiplied differences.)" },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nMetal : Ore :: Rubber : ?", o: ["Jute","Fibre","Latex","Flare"], e: "Metals are extracted from ore; rubber is obtained from latex. Option 3." },
  { s: REA, q: "Three statements followed by three conclusions.\n\nStatements:\nAll motors are ships. Some ships are bowls. No ship is a hammer.\n\nConclusions:\n(I) Some motors are hammers.\n(II) Some bowls are motors.\n(III) Some bowls are not hammers.", o: ["Only conclusion III follows","Only conclusion I follows","All the conclusions I, II and III follow","Either conclusion I or conclusion III follows"], e: "Some bowls are ships; no ship is hammer → some bowls (the ship-bowls) are not hammer (III ✓). I and II uncertain. Option 1." },
  { s: REA, q: "Select the option figure in which the given figure (X) is embedded as its part (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in a logical and meaningful order.\n\n1. Fox  2. Lion  3. Caterpillar  4. Leaf  5. Bird", o: ["4, 3, 5, 1, 2","4, 3, 1, 2, 5","3, 4, 5, 1, 2","1, 2, 5, 3, 4"], e: "Food chain: Leaf(4) → Caterpillar(3) → Bird(5) → Fox(1) → Lion(2). Option 1." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series will complete the series.\n\nP_P__B__PB__", o: ["PPBBBPP","BPBBPPB","PBBBBPB","BPPPPPP"], e: "Per docx answer key, option 4." },
  { s: REA, q: "Three statements followed by two conclusions.\n\nStatements:\nSome markers are frogs. All frogs are combs. No comb is a stove.\n\nConclusions:\nI. All markers being stove is a possibility.\nII. Some combs are markers.", o: ["Both conclusions I and II follow","Only conclusion I follows","Neither conclusion I nor II follows","Only conclusion II follows"], e: "Per docx answer key, option 4 (Only II — markers⊆frogs⊆combs → some combs are markers ✓; I impossible since no comb is stove)." },

  // ============ GA (26-50) ============
  { s: GA, q: "In October 2020, which of the following Ministries launched the Ayushman Sahakar Scheme, to assist cooperatives in the creation of healthcare infrastructure?", o: ["Ministry of Health and Family Welfare","Ministry of Agriculture and Farmers Welfare","Ministry of Corporate Affairs","Ministry of Commerce and Industry"], e: "Ayushman Sahakar (NCDC scheme) was launched by the Ministry of Agriculture & Farmers' Welfare. Option 2." },
  { s: GA, q: "Compounds like gingerol, paradol, shogaols and zingerone are:", o: ["antifungal compounds found in ginger","antimicrobial compounds found in citrus fruits","antimicrobial compounds found in ginger","antimicrobial compounds found in turmeric"], e: "These pungent phenolic compounds are antimicrobials found in ginger. Option 3." },
  { s: GA, q: "Sir Garfield Sobers Trophy is related to which of the following sports events?", o: ["Tennis","Football","Hockey","Cricket"], e: "ICC Sir Garfield Sobers Trophy is given to the cricketer of the year. Option 4." },
  { s: GA, q: "The battle of Plassey was fought between the East India Company, force headed by Robert Clive, and the Nawab of Bengal, ________ in 1757.", o: ["Mir Jafar","Siraj-Ud-Daulah","Mir Qasim","Shah Alam"], e: "Siraj-ud-Daulah was the Nawab of Bengal defeated at Plassey (1757). Option 2." },
  { s: GA, q: "Which of the following Union territories has the lowest population as per census 2011?", o: ["Dadra and Nagar Haveli","Lakshadweep","Daman and Diu","Andaman and Nicobar"], e: "Lakshadweep had the lowest population (~64,500) among UTs in Census 2011. Option 2." },
  { s: GA, q: "Which of the following Sultans of Delhi set up the officers like Barid (intelligence officer) and Munhiyans (secret spies) to control the market?", o: ["Alauddin Khalji","Ghiyasuddin Balban","Muhammad Bin Tughlaq","Shamsuddin Iltutmish"], e: "Alauddin Khalji introduced market regulations with intelligence officers like Barid and Munhiyans. Option 1." },
  { s: GA, q: "According to the global Multidimensional Poverty Index (MPI) 2021, India's rank is ________ out of 109 countries.", o: ["101","66","63","98"], e: "India ranked 66 in the global MPI 2021 (out of 109 countries). Option 2." },
  { s: GA, q: "Which Article of the Indian Constitution mentions that every religious denomination or section shall have the right to own and acquire movable and immovable property?", o: ["Article 26(c)","Article 26(b)","Article 26(a)","Article 26(d)"], e: "Article 26(c) gives religious denominations the right to own/acquire property. Option 1." },
  { s: GA, q: "Flowerless plants, naked seeds, needle like leaves and cones as reproductive structure are the characteristics of:", o: ["bryophyta","gymnosperms","angiosperms","pteridophyta"], e: "Gymnosperms (e.g., pines) have naked seeds, cones, needle-like leaves. Option 2." },
  { s: GA, q: "'Moatsu' is a religious festival celebrated in which of the following states?", o: ["Himachal Pradesh","Mizoram","Nagaland","Chhattisgarh"], e: "Moatsu is celebrated by the Ao Naga tribe in Nagaland. Option 3." },
  { s: GA, q: "Sangeet Natak Akademi Award winner Deepak Mazumdar is an exponent of ___________.", o: ["Sattriya","Bharatanatyam","Kuchipudi","Manipuri"], e: "Deepak Mazumdar is a noted Bharatanatyam exponent (SNA Award 2015). Option 2." },
  { s: GA, q: "The historical Sher Shah Suri Marg is called the National Highway no. ________ between Delhi and Amritsar.", o: ["7","3","9","1"], e: "NH-1 (Delhi–Amritsar) corresponds to part of the historic Sher Shah Suri Marg / GT Road. Option 4." },
  { s: GA, q: "What is the annual income threshold for parents of government school students to enrol in private schools under the 'Chirag' scheme in Haryana?", o: ["Less than 1 lakh","Less than 50,000","Less than 2 lakh","Less than 1.8 lakh"], e: "Haryana's Chirag scheme is for families with annual income below ₹1.8 lakh. Option 4." },
  { s: GA, q: "Vedantam Satyanarayana Sarma is associated with which of these dances?", o: ["Manipuri","Kuchipudi","Bharatanatyam","Kathak"], e: "Vedantam Satyanarayana Sarma was a legendary Kuchipudi dancer. Option 2." },
  { s: GA, q: "The first musician to be awarded with the highest civilian award of India, the 'Bharat Ratna' was __________.", o: ["Madurai Mani Iyer","Lalitha Venkataraman","MS Subbulakshmi","Sudha Ragunathan"], e: "MS Subbulakshmi was the first musician to receive the Bharat Ratna (1998). Option 3." },
  { s: GA, q: "Who among the following was one of the founders of the Swaraj Party?", o: ["Jawahar Lal Nehru","Chittaranjan Das","Bal Gangadhar Tilak","Subhas Chandra Bose"], e: "C.R. Das and Motilal Nehru founded the Swaraj Party (1923). Option 2." },
  { s: GA, q: "In which of the following states of India is the largest salt water lake, the Chilika lake, located?", o: ["Tamil Nadu","Odisha","Kerala","Andhra Pradesh"], e: "Chilika Lake is in Odisha. Option 2." },
  { s: GA, q: "Which of the following is the earliest literary record of Indian culture?", o: ["Yajurveda","Rigveda","Atharvaveda","Samaveda"], e: "Rigveda is the oldest among the Vedas (c. 1500 BCE). Option 2." },
  { s: GA, q: "As of July 2023, who is the governor of Uttar Pradesh?", o: ["Sudarshan Agarwal","Anandiben Patel","Ram Naik","TV Rajeswar"], e: "Anandiben Patel has been Governor of UP since 2019. Option 2." },
  { s: GA, q: "When did the United Nations declare the World Physics Year, also known as the Einstein Year, to mark the 100th anniversary of the physicist Albert Einstein?", o: ["2006","2005","2004","2002"], e: "UN declared 2005 as the World Year of Physics (Einstein's miracle year 1905 centenary). Option 2." },
  { s: GA, q: "The Trimbakeshwar Temple, which is situated in Nashik, Maharashtra, was built by:", o: ["Balaji Baji Rao","Maharaja Ganga Singh","Shivaji","Maharana Pratap"], e: "Trimbakeshwar Jyotirlinga temple was built by Peshwa Balaji Baji Rao (Nanasaheb). Option 1." },
  { s: GA, q: "Which Article of the Indian Constitution mentions that 'In the performance of his/her duties, the Attorney-General for India shall have the right of audience in all the courts in the territory of India'?", o: ["Article 76(2)","Article 76(1)","Article 76(3)","Article 76(4)"], e: "Article 76(3) gives the Attorney-General right of audience in all courts. Option 3." },
  { s: GA, q: "According to the Koppen climate classification system, 'Am' is the code for which type of climate?", o: ["Humid subtropical climate","Marine west coast climate","Tropical monsoon climate","Tropical wet and dry climate"], e: "Am = Tropical monsoon climate. Option 3." },
  { s: GA, q: "Under which Schedule of the Indian Constitution is the form of oath or affirmation for a Judge of the Supreme Court mentioned?", o: ["Second Schedule","Fourth Schedule","First Schedule","Third Schedule"], e: "Forms of oath/affirmation are listed under the Third Schedule. Option 4." },
  { s: GA, q: "Which of the following is the autobiography of Abul Kalam Azad, the first Education Minister of free India?", o: ["The Test of My Life","Unbreakable","India Wins Freedom","The Road Ahead"], e: "'India Wins Freedom' (1959) is Maulana Abul Kalam Azad's autobiography. Option 3." },

  // ============ QA (51-75) ============
  { s: QA, q: "A wrist watch was purchased for ₹3,000 and sold for ₹3,500. Find the profit percentage.", o: ["20.50%","18.33%","16.66%","19.58%"], e: "Profit = 500/3000 × 100 = 16.66%. Option 3." },
  { s: QA, q: "Find the area (in cm²) of a circle with a maximum radius that can be inscribed in a rectangle of length 18 cm and breadth 12 cm.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Max inscribed circle radius = breadth/2 = 6 cm. Area = 36π cm². Per docx key, option 2." },
  { s: QA, q: "Answer based on the figure shown.", o: ["0.4","0.7","0.3","0.9"], e: "Per docx answer key, option 4 (0.9)." },
  { s: QA, q: "If x²−1, 2x and x²+1 are the three sides of a right angled triangle, then which of the following can be its hypotenuse?", o: ["x² − 1","x² + 1","x²","2x"], e: "(x²−1)² + (2x)² = (x²+1)² (Pythagorean identity). So hypotenuse = x²+1. Option 2." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: QA, q: "Which of the following numbers is divisible by 9?", o: ["132490","553986","941201","350846"], e: "553986: digit sum 5+5+3+9+8+6 = 36 → divisible by 9. Option 2." },
  { s: QA, q: "Answer based on the figure shown.", o: ["206.25","200.00","215.75","210.25"], e: "Per docx answer key, option 1 (206.25)." },
  { s: QA, q: "The average of 12 numbers is 47. The average of the first 5 numbers is 45 and the average of the next 4 numbers is 52. If the 10th number is 10 less than the 11th number and is 5 more than the 12th number, then what is the average value of the 11th and 12th numbers?", o: ["46.5","47.5","44.5","42.5"], e: "Sum 12 = 564; sum 5 = 225; sum next 4 = 208; sum of last 3 = 131. Let 11th = x → 10th = x-10, 12th = x-15. So (x-10)+x+(x-15)=131 → 3x-25=131 → x=52. 12th = 37. Avg of 11&12 = (52+37)/2 = 44.5. Option 3." },
  { s: QA, q: "Answer based on the figure shown.", o: ["6609","6906","6960","6690"], e: "Per docx answer key, option 3 (6960)." },
  { s: QA, q: "The area of the rhombus (in cm²) having each side equal to 13 cm and one of its diagonals equal to 24 cm is:", o: ["60","130","110","120"], e: "Half d1 = 12, side = 13 → half d2 = √(169−144) = 5 → d2 = 10. Area = (24×10)/2 = 120 cm². Option 4." },
  { s: QA, q: "Answer based on the figure shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 2." },
  { s: QA, q: "Answer based on the figure shown.", o: ["16","28","64","32"], e: "Per docx answer key, option 3 (64)." },
  { s: QA, q: "Answer based on the figure shown.", o: ["0","2","1","−1"], e: "Per docx answer key, option 2 (2)." },
  { s: QA, q: "In a 150-m race, if R gets a 5-metre head start, then he would beat S by 35 metres. If S gets a 25-metre head start in a 100-metre race, then _______ would win the race by ________ metres.", o: ["S; 5.44","S; 4.44","R; 5.44","R; 4.44"], e: "Per docx answer key, option 1 (S; 5.44)." },
  { s: QA, q: "Eight labourers working 10 hours a day completed a work in 18 days. If only 5 labourers are working, then in how many hours a day should they work to finish the work in 24 days?", o: ["10 hours","12 hours","8 hours","9 hours"], e: "M1H1D1 = M2H2D2 → 8×10×18 = 5×H×24 → H = 1440/120 = 12. Option 2." },
  { s: QA, q: "If A : B = 8 : 13, B : C = 5 : 8 and C : D = 4 : 5, then A : B : C : D is equal to:", o: ["20 : 50 : 105 : 119","40 : 65 : 104 : 130","40 : 60 : 103 : 112","38 : 65 : 111 : 120"], e: "Scale: A:B = 40:65, B:C = 65:104, C:D = 104:130. Combined: 40:65:104:130. Option 2." },
  { s: QA, q: "The median AD of a triangle ABC is produced and a perpendicular CF is dropped on it. BE is perpendicular to AD. If BC = 34 cm and DF = 8 cm, what is the length (in cm) of BE?", o: ["9","17","15","19"], e: "Per docx answer key, option 3 (15)." },
  { s: QA, q: "Reyan purchased a laptop for ₹56,000 and a scanner-cum-printer for ₹22,000. He sold the laptop for a 20% profit and the scanner-cum-printer for a 15% profit. What is his profit percentage?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Total profit = 56000×0.20 + 22000×0.15 = 11200+3300 = 14500. Profit% = 14500/78000 × 100 ≈ 18.59%. Per docx, option 1." },
  { s: QA, q: "Which of the following schemes will yield maximum discount on purchase of ₹x?\n\n1) 2 successive discounts of 25% and 15%\n2) Single discount of 20%\n3) 2 free on purchase of 3 items\n4) 3 free on purchase of 7 items", o: ["Scheme 2","Scheme 4","Scheme 3","Scheme 1"], e: "Discount%: Scheme1 = 1−0.75×0.85 = 36.25%; Scheme2 = 20%; Scheme3 = 2/5 = 40%; Scheme4 = 3/10 = 30%. Max = Scheme 3. Option 3." },
  { s: QA, q: "Simplify the expression (0.3−0.2)(0.3² + 0.3×0.2 + 0.2²).", o: ["0.019","0.053","0.027","0.035"], e: "Identity (a−b)(a²+ab+b²) = a³−b³ = 0.3³ − 0.2³ = 0.027 − 0.008 = 0.019. Option 1." },
  { s: QA, q: "A truck travels 75 km in the first hour and 33 km in the second hour. Find the average speed of the truck (in km/h).", o: ["60","54","108","42"], e: "Total dist = 108 km in 2 h → avg = 54 km/h. Option 2." },
  { s: QA, q: "PQ is a diameter of a circle and PS is a chord. If PQ is 82 cm and PS is 80 cm, the distance (in cm) of PS from the centre of the circle is:", o: ["18","9","24","39"], e: "Radius = 41. Perpendicular bisector of chord 80 from centre: distance = √(41² − 40²) = √(1681−1600) = 9. Option 2." },
  { s: QA, q: "Ramesh spends 60% of his income. If his income is increased by 30% and his expenditure is increased by 20%, then the percentage increase in the savings of Ramesh will be:", o: ["35%","45%","30%","50%"], e: "Old: I=100, exp=60, save=40. New: I=130, exp=72, save=58. Increase% = 18/40 × 100 = 45%. Option 2." },
  { s: QA, q: "In an election, there were only two candidates. 12% of the voters did not cast their votes. The winner by obtaining 60% of the total votes defeated his opposite contestant by 1200 votes. Find the total number of votes.", o: ["4000","3750","3570","5730"], e: "Cast votes = 0.88V. Winner = 0.60V (of total). Loser = 0.88V − 0.60V = 0.28V. Diff = 0.60V − 0.28V = 0.32V = 1200 → V = 3750. Option 2." },
  { s: QA, q: "A and B can do a work in 15 days and 30 days, respectively. They start working together, but A leaves after 3 days. How much time will B take to complete the remaining work?", o: ["21 days","24 days","32 days","28 days"], e: "Together in 3 days = 3×(1/15+1/30) = 3×3/30 = 3/10. Remaining = 7/10 by B alone = (7/10)/(1/30) = 21 days. Option 1." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe animals were frightened by the noise.", o: ["The animals frightened the noise.","The noise had frightened the animals.","The noise frightened the animals.","The noise frightened the animal."], e: "Passive past 'were frightened by' → active past 'frightened'. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\n\nThe employee said, \"I somehow managed to submit the project last night.\"", o: ["The employee said that he had somehow managed to submit the project the previous night.","The employee said that he had somehow managed to submit the project last night.","The employee said that I have somehow managed to submit the project last night.","The employee said that I somehow managed to submit the project the previous night."], e: "'I' → 'he'; past 'managed' → 'had managed'; 'last night' → 'the previous night'. Option 1." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nEnvoy", o: ["Ambassador","Carrier","Chief","Receiver"], e: "Envoy = an official diplomatic messenger = Ambassador. Option 1." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nIt is a proven fact that _______ living being can survive without water.", o: ["none","no","any","neither"], e: "'No living being can survive' is the standard construction. Option 2." },
  { s: ENG, q: "Parts of the following sentence have been given as options. Select the option that contains an error.\n\nKing Solomon of Israel is said to be one of a wisest man who ruled the earth.", o: ["King Solomon of Israel","who ruled the earth.","is said to be one","of a wisest man"], e: "Should be 'one of THE wisest men' (plural after 'one of'). Option 4." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom.\n\nWe should teach our wards not to look down upon anybody in human society.", o: ["Kneel down","Guess on something","Despise somebody","Talk leniently"], e: "'Look down upon' = despise / regard as inferior. Option 3." },
  { s: ENG, q: "In the following sentence, four words are given in underlined out of which one word is misspelt. Identify the INCORRECTLY spelt word.\n\nAnd so he was (A), for, as she laughed (B) and talked, Jo had whiskd (C) things into place and given quite (D) a different air to the room.", o: ["C","D","A","B"], e: "'Whiskd' should be 'whisked'. Option 1 (C)." },
  { s: ENG, q: "Parts of the following sentence have been given as options. Select the option that contains an error.\n\nHe was consulted seldom by his colleagues while making important decisions on financial matters.", o: ["decisions on financial matters.","He was consulted seldom","while making important","by his colleagues"], e: "Should be 'He was seldom consulted' (adverb before main verb). Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA person who investigates, reports on, and helps settle complaints", o: ["Bildungsroman","Spokesman","Superhuman","Ombudsman"], e: "An 'Ombudsman' is a public-complaints investigator. Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word in the following sentence.\n\nThe students were asked to assemble in the meeting hall.", o: ["Collect","Gather","Dispersed","Put together"], e: "Antonym of 'assemble' = Disperse(d). Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nThe teacher said that plants have life in them.", o: ["The teacher says, \"A plant has life in them.\"","The teacher said, \"Plants have life in them.\"","The teacher said, \"Plants too have life in them.\"","The teacher said, \"The plants had life in them.\""], e: "Indirect 'plants have' (universal truth) → direct 'Plants have life in them.'. Option 2." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nI have been yet to go to the flower exhibition at Delhi University.", o: ["had been yet","have yet being","have yet","have yet been"], e: "Correct: 'I have yet to go to...'. Option 3." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Experience","Noticeable","Intterupt","Commodity"], e: "'Intterupt' is misspelled — correct is 'Interrupt'. Option 3." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word in the given sentence.\n\nThe bowler signalled the wicket-keeper to catch the ball.", o: ["Give","Change","Drop","Throw"], e: "Antonym of 'catch' = Drop. Option 3." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nEnglish will be taught by Mr. Jha.", o: ["Mr. Jha will teach English.","Mr. Jha would teach English.","Mr. Jha teaches English.","English would be taught by Mr. Jha."], e: "Future passive → future active: 'will teach'. Option 1." },
  { s: ENG, q: "Read the Root Crops passage.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'roots... swollen with the (1)__________ of storage food'", o: ["presence","occupancy","residence","existence"], e: "'Presence of storage food' fits the context. Option 1." },
  { s: ENG, q: "Read the Root Crops passage.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'These are (2)____________ staple foods'", o: ["nutritious","unhealthy","fattening","peptic"], e: "Root crops are nutritious staple foods. Option 1." },
  { s: ENG, q: "Read the Root Crops passage.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'with (3)__________ giving carbohydrates'", o: ["capacity","energy","strength","power"], e: "Carbohydrates are 'energy-giving' nutrients. Option 2." },
  { s: ENG, q: "Read the Root Crops passage.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'These also have large water (4)_____'", o: ["utility","gain","content","worth"], e: "'Water content' is the standard collocation. Option 3." },
  { s: ENG, q: "Read the Root Crops passage.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'Some (5)________ are carrots, beetroots'", o: ["samples","case","illustration","examples"], e: "'Some examples are carrots, beetroots...'. Option 4." },
  { s: ENG, q: "Read the Technology Advancement passage.\n\nAccording to the passage, by linking which sort of products do the Internet of Things (IoT) provide improved resource management?", o: ["Artificial Intelligence (AI) technologies","3D printing technologies","Previously disconnected ordinary products","Renewable energy technologies"], e: "Passage: 'IoT has enabled better resource management via the connection of previously disconnected ordinary products'. Option 3." },
  { s: ENG, q: "Read the Technology Advancement passage.\n\nWhich of the following best captures the underlying theme of the passage?", o: ["The connection between renewable energy and greenhouse gas emissions","The ethical considerations of artificial intelligence (AI) in society","The impact of scientific advancements on medical treatment","The transformative power of technology in tourism sector"], e: "Per docx answer key, option 2." },
  { s: ENG, q: "Read the Technology Advancement passage.\n\nWhich of the following statements concerning the effects of scientific advancements may be derived from the passage?", o: ["There is no longer any need for human intelligence since AI has taken over every field.","Scientific innovations have the potential to revolutionise various sectors and improve efficiency in society.","The only way to solve problems with food security and renewable energy is through genetic engineering.","The development of renewable energy technologies has led to a complete elimination of greenhouse gas emissions."], e: "Passage emphasises revolutionary impact across sectors. Option 2." },
  { s: ENG, q: "Read the Technology Advancement passage.\n\nWhich technologies are stated in the text as utilising renewable or green energy sources?", o: ["Medical treatment and communication","Genetic engineering and 3D printing","Artificial Intelligence (AI) and the Internet of Things (IoT)","Solar panels and wind turbines"], e: "Passage: 'Technologies that utilise renewable energy sources, such as solar panels and wind turbines'. Option 4." },
  { s: ENG, q: "Read the Technology Advancement passage.\n\nAccording to the paragraph, which phrase describes computers' capacity to undertake human-intelligence-based tasks?", o: ["Artificial Intelligence","Profound","Revolution","Communication"], e: "Passage: 'artificial intelligence... to accomplish jobs that previously required human intellect'. Option 1." }
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Graduate) - 20 June 2024 Shift-3';
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
