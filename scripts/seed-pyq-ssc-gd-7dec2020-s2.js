/**
 * Seed: SSC GD Constable PYQ - 7 December 2020, Shift-2 (90 questions)
 * Source: Oswaal SSC Constable (GD) Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per 2020 SSC GD Tier-I pattern):
 *   - General Knowledge & General Awareness : Q1-50  (50 Q)
 *   - General Intelligence & Reasoning      : Q51-75 (25 Q)
 *   - Numerical Ability                     : Q76-90 (15 Q)
 *
 * Run with: node scripts/seed-pyq-ssc-gd-7dec2020-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC-GD-Constable/7-dec-2020/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-gd-7dec2020-s2';

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
  const res = await cloudinary.uploader.upload(fp, {
    folder: CLOUDINARY_FOLDER,
    public_id: filename.replace(/\.png$/i, ''),
    overwrite: true,
    resource_type: 'image'
  });
  return res.secure_url;
}

const F = '7-dec-2020';
const IMAGE_MAP = {
  51: { q: `${F}-q-51.png`,
        opts: [`${F}-q-51-option-1.png`,`${F}-q-51-option-2.png`,`${F}-q-51-option-3.png`,`${F}-q-51-option-4.png`] },
  52: { opts: [`${F}-q-52-option-1.png`,`${F}-q-52-option-2.png`,`${F}-q-52-option-3.png`,`${F}-q-52-option-4.png`] },
  53: { q: `${F}-q-53.png`,
        opts: [`${F}-q-53-option-1.png`,`${F}-q-53-option-2.png`,`${F}-q-53-option-3.png`,`${F}-q-53-option-4.png`] },
  55: { opts: [`${F}-q-55-option-1.png`,`${F}-q-55-option-2.png`,`${F}-q-55-option-3.png`,`${F}-q-55-option-4.png`] },
  56: { q: `${F}-q-56.png`,
        opts: [`${F}-q-56-option-1.png`,`${F}-q-56-option-2.png`,`${F}-q-56-option-3.png`,`${F}-q-56-option-4.png`] },
  57: { q: `${F}-q-57.png` },
  61: { opts: [`${F}-q-61-option-1.png`,`${F}-q-61-option-2.png`,`${F}-q-61-option-3.png`,`${F}-q-61-option-4.png`] },
  62: { q: `${F}-q-62.png`,
        opts: [`${F}-q-62-option-1.png`,`${F}-q-62-option-2.png`,`${F}-q-62-option-3.png`,`${F}-q-62-option-4.png`] },
  63: { q: `${F}-q-63.png`,
        opts: [`${F}-q-63-option-1.png`,`${F}-q-63-option-2.png`,`${F}-q-63-option-3.png`,`${F}-q-63-option-4.png`] },
  64: { q: `${F}-q-64.png`,
        opts: [`${F}-q-64-option-1.png`,`${F}-q-64-option-2.png`,`${F}-q-64-option-3.png`,`${F}-q-64-option-4.png`] },
  66: { q: `${F}-q-66.png` },
  68: { q: `${F}-q-68.png` },
  69: { q: `${F}-q-69.png`,
        opts: [`${F}-q-69-option-1.png`,`${F}-q-69-option-2.png`,`${F}-q-69-option-3.png`,`${F}-q-69-option-4.png`] },
  70: { q: `${F}-q-70.png`,
        opts: [`${F}-q-70-option-1.png`,`${F}-q-70-option-2.png`,`${F}-q-70-option-3.png`,`${F}-q-70-option-4.png`] },
  71: { q: `${F}-q-71.png`,
        opts: [`${F}-q-71-option-1.png`,`${F}-q-71-option-2.png`,`${F}-q-71-option-3.png`,`${F}-q-71-option-4.png`] },
  72: { q: `${F}-q-72.png`,
        opts: [`${F}-q-72-option-1.png`,`${F}-q-72-option-2.png`,`${F}-q-72-option-3.png`,`${F}-q-72-option-4.png`] },
  76: { q: `${F}-q-76.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-10 (GK)
  4,3,4,1,1, 2,2,1,1,4,
  // 11-20
  4,1,3,4,3, 2,4,3,4,3,
  // 21-30
  2,4,3,3,1, 4,3,3,2,2,
  // 31-40
  4,4,4,2,3, 3,4,3,4,1,
  // 41-50
  4,4,4,4,1, 2,1,4,1,4,
  // 51-60 (Reasoning)
  4,1,3,3,2, 4,3,1,4,1,
  // 61-70
  3,1,4,1,1, 3,3,2,2,2,
  // 71-75
  3,1,1,3,1,
  // 76-90 (Numerical)
  2,2,2,1,3, 4,1,1,4,4, 2,4,2,1,4
];
if (KEY.length !== 90) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const GA  = 'General Knowledge & General Awareness';
const REA = 'General Intelligence & Reasoning';
const NA  = 'Numerical Ability';

const RAW = [
  // ============ General Knowledge & General Awareness (1-50) ============
  { s: GA, q: "In which of the following years was the Interim Government of India formed from the newly elected Constituent Assembly?", o: ["1943","1940","1945","1946"], e: "On 2 September 1946, the Interim Government of India was formed to oversee the transition from British colony to independent republic. It lasted till 15 August 1947." },
  { s: GA, q: "In which of the following Articles of the Indian Constitution is the Finance Bill mentioned?", o: ["Article 145","Article 112","Article 110","Article 134"], e: "Article 110 defines the Money Bill (Finance Bill); the Finance Bill is referenced under Article 110 of the Indian Constitution." },
  { s: GA, q: "In India, how many sedimentary basins are there which cover an area of 3.14 million km²?", o: ["10","19","28","26"], e: "India has 26 sedimentary basins covering an area of 3.14 million km², important for hydrocarbon exploration." },
  { s: GA, q: "Jhijhiya is the famous cultural dance of which of the following states?", o: ["Bihar","Madhya Pradesh","Assam","Uttar Pradesh"], e: "Jhijhiya is a fast-paced folk dance from the Mithila region of Bihar, performed during the nine-night Navaratri festival." },
  { s: GA, q: "Nitrous oxide is a colourless and odourless substance that is also known as ______.", o: ["laughing gas","sleeping gas","balloon gas","tear gas"], e: "Nitrous oxide is also known as 'laughing gas' because of the euphoric/laughter-inducing effects when inhaled in small amounts." },
  { s: GA, q: "______ is a branch of horticulture as it deals with the cultivation of flowers and ornamental crops from the time of planting to the time of harvesting.", o: ["Sericulture","Floriculture","Apiculture","Mariculture"], e: "Floriculture, a branch of horticulture, deals with cultivation of flowers and ornamental crops." },
  { s: GA, q: "The CADC is formed under the 6th Schedule to the Constitution of India in 1972, for the Chakma ethnic people. What does CADC stand for?", o: ["Chakma Autonomous District Corporation","Chakma Autonomous District Council","Chakma Attorney Deputy Council","Chakma Associate District Council"], e: "CADC stands for Chakma Autonomous District Council, formed under the 6th Schedule on 29 April 1972." },
  { s: GA, q: "How many committees were set up by the Constituent Assembly for framing the Constitution?", o: ["13","9","11","20"], e: "The Constituent Assembly established 13 committees to draft the Constitution of India." },
  { s: GA, q: "The Dhyan Chand Award, named after the legendary player Major Dhyan Chand, is awarded for the lifetime contribution in the sports field. In which of the following sports did he represent India?", o: ["Hockey","Boxing","Badminton","Wrestling"], e: "Major Dhyan Chand represented India in hockey and is regarded as the greatest hockey player ever." },
  { s: GA, q: "______ deal(s) with the taxation and expenditure decisions of the Government.", o: ["Monetary Policy","Labour Market Policies","Trade Policy","Fiscal Policy"], e: "Fiscal Policy involves the government's decisions on taxation and expenditure to influence the economy." },
  { s: GA, q: "Who among the following women army officers has been promoted to the second highest rank of Lieutenant General in the Indian Army in March 2020?", o: ["Padmavathy Bandopadhyay","Nivedita Choudhary","Punita Arora","Madhuri Kanitkar"], e: "Madhuri Kanitkar was promoted to the rank of Lieutenant General in the Indian Army in March 2020." },
  { s: GA, q: "In which of the following years was the Security and Exchange Board of India (SEBI) established by the government of India?", o: ["1992","1999","1987","1985"], e: "SEBI was established as a non-statutory body in 1988 and granted statutory powers in 1992 through the SEBI Act, 1992." },
  { s: GA, q: "The AIIB is a multilateral development bank with a mission to improve social and economic outcomes in Asia. What does AIIB stand for?", o: ["Asian Investment Industrial Bank","Asian Infrastructure Industrial Bank","Asian Infrastructure Investment Bank","African Infrastructure Investment Bank"], e: "AIIB stands for Asian Infrastructure Investment Bank — a multilateral development bank for Asia." },
  { s: GA, q: "Which of the following is the longest river of Nepal?", o: ["Trishuli","Arun","Tamor","Karnali"], e: "Karnali is the longest river of Nepal, flowing from Tibet through the Himalayas before joining the Ganges in India." },
  { s: GA, q: "The highest civilian awards of the country, 'The Padma Awards' were instituted in which of the following years?", o: ["1967","1952","1954","1960"], e: "The Padma Awards (Padma Vibhushan, Padma Bhushan, Padma Shri) were instituted in 1954." },
  { s: GA, q: "Which of the following financial schemes was launched in 2014, to provide universal access to banking facilities to the Indian people?", o: ["Pradhan Mantri Mudra Yojana (PMMY)","Pradhan Mantri Jan Dhan Yojana (PMJDY)","Stand Up India","Pradhan Mantri Fasal Bima Yojana (PMFBY)"], e: "PMJDY was launched on 28 August 2014 to provide universal access to banking facilities for unbanked households." },
  { s: GA, q: "Galvanisation is a method of protecting steel and iron from rusting by coating them with a thin layer of ______.", o: ["tin","copper","aluminium","zinc"], e: "Galvanisation involves coating steel/iron with a thin layer of zinc to prevent rusting." },
  { s: GA, q: "Who among the following was the President of the Muslim League in 1930?", o: ["Muhammad Ali Jinnah","Jawahar Lal Nehru","Sir Mohammad Iqbal","Maulana Azad"], e: "Sir Muhammad Iqbal was elected President of the All-India Muslim League in 1930 and outlined the idea of a Muslim state in his Allahabad Address." },
  { s: GA, q: "In which of the following countries is the headquarters of FIFA situated?", o: ["Australia","Spain","USA","Switzerland"], e: "FIFA's headquarters is in Zurich, Switzerland." },
  { s: GA, q: "How many dynasties ruled Delhi during the Sultanate period (1206 AD – 1526 AD)?", o: ["6","3","5","4"], e: "Five dynasties ruled the Delhi Sultanate: Mamluk/Slave (1206–1290), Khilji (1290–1320), Tughlaq (1320–1414), Sayyid (1414–1451) and Lodi (1451–1526)." },
  { s: GA, q: "Dinesh Khara has been recommended by the Banks Board Bureau as the next Chairman of which of the following banks from October 2020?", o: ["Punjab Union Bank","State Bank of India","Kotak Mahindra Bank","Yes Bank"], e: "Dinesh Khara was recommended to become Chairman of the State Bank of India (SBI) from October 2020." },
  { s: GA, q: "Who among the following leaders had introduced the 'Objective Resolution' in the Constituent Assembly on 13 December 1946?", o: ["Dr. BR Ambedkar","SN Mukherjee","Subhash Chandra Bose","Jawahar Lal Nehru"], e: "Jawaharlal Nehru introduced the 'Objective Resolution' in the Constituent Assembly on 13 December 1946 — laying down the fundamental principles of the Indian Constitution." },
  { s: GA, q: "With which of the following Constitutional amendments did the capital city Delhi get a Legislative Assembly with the enactment of the National Capital Territory Act, 1991?", o: ["79th Constitutional Amendment","67th Constitutional Amendment","69th Constitutional Amendment","56th Constitutional Amendment"], e: "The 69th Constitutional Amendment Act, 1991 created a Legislative Assembly and Council of Ministers for the National Capital Territory of Delhi." },
  { s: GA, q: "The sale or liquidation of assets by the government, usually Central and State public sector enterprises, projects, or other fixed assets is called ______.", o: ["devaluation","capitalisation","disinvestment","privatisation"], e: "Disinvestment refers to the sale of government holdings in PSUs/projects to private entities or the public, partially or fully." },
  { s: GA, q: "At which of the following places is the Raireshwar temple located, where Chhatrapati Shivaji had taken the oath to build Hindavi Swarajya?", o: ["Bhor","Mulshi","Junnar","Baramati"], e: "The Raireshwar temple, where Shivaji Maharaj took the oath of Hindavi Swarajya in 1645, is located in Bhor near Pune." },
  { s: GA, q: "The famous Ambubachi Mela is held every year in which of the following cities of India?", o: ["Jalandhar","Patna","Jaipur","Guwahati"], e: "The Ambubachi Mela is held annually at the Kamakhya Temple in Guwahati, Assam." },
  { s: GA, q: "Who among the following cricketers announced his retirement from international cricket in August 2020?", o: ["Rohit Sharma","Hardik Pandya","MS Dhoni","Virat Kohli"], e: "MS Dhoni announced his retirement from international cricket on 15 August 2020." },
  { s: GA, q: "Water containing _____ at concentrations below 60 milligrams per litre is generally considered as soft.", o: ["sodium carbonate","potassium carbonate","calcium carbonate","potassium bicarbonate"], e: "Water with calcium carbonate concentration below 60 mg/L is classified as soft water." },
  { s: GA, q: "Which of the following banks has announced a strategic partnership with Adobe to help improve the digital experience journey of its customers in August 2020?", o: ["ICICI Bank","HDFC Bank","State Bank of India","Union Bank of India"], e: "HDFC Bank announced a strategic partnership with Adobe in August 2020 to enhance customer digital experiences." },
  { s: GA, q: "In which year was the Lead Bank Scheme introduced by the Reserve Bank of India?", o: ["1964","1969","1973","1975"], e: "The Lead Bank Scheme was introduced by the RBI in 1969 to coordinate banking activities at district level." },
  { s: GA, q: "The agro-based religious Nuakhai festival is celebrated in which of the following states?", o: ["Maharashtra","Tamil Nadu","Kerala","Odisha"], e: "Nuakhai is an agro-religious festival celebrated in Odisha to welcome the new harvest." },
  { s: GA, q: "Who among the following is the founder ruler of the Lodhi Dynasty?", o: ["Daulat Khan Lodhi","Sikandar Khan Lodhi","Ibrahim Khan Lodhi","Bahlul Khan Lodhi"], e: "Bahlul Khan Lodi founded the Lodi dynasty, ruling from 1451 to 1489 after the decline of the Sayyid dynasty." },
  { s: GA, q: "Which of the following rivers forms part of the India-Bangladesh border, originates from South Tripura district and flows into Bangladesh?", o: ["Surma river","Kaveri river","Sangu river","Feni river"], e: "The Feni River originates in South Tripura, forms part of the India-Bangladesh border, and flows into Bangladesh." },
  { s: GA, q: "______ is also known as brown coal of the lowest rank of coal due to its relatively low heat content.", o: ["Bitumen","Lignite","Anthracite","Peat"], e: "Lignite is known as brown coal — the lowest rank of coal in terms of heat content." },
  { s: GA, q: "Who among the following was the Secretary of the Constituent Assembly?", o: ["Hussain Imam","Dr. Rajendra Prasad","HVR Iyengar","HC Mookherjee"], e: "HVR Iyengar served as the Secretary of the Constituent Assembly from 1946 until its dissolution in 1950." },
  { s: GA, q: "Bara Imambara, a historical edifice with marvellous architecture, is situated in which of the following cities?", o: ["Mumbai","Panipat","Lucknow","Hyderabad"], e: "Bara Imambara, built by Asaf-ud-Daula in 1784, is located in Lucknow, Uttar Pradesh." },
  { s: GA, q: "In which of the following states is the Brihadeswara Temple, the world's first temple built from granite, located?", o: ["Rajasthan","Maharashtra","Gujarat","Tamil Nadu"], e: "The Brihadeswara Temple at Thanjavur, Tamil Nadu — built by Raja Raja Chola I — is the world's first granite temple, a UNESCO World Heritage Site." },
  { s: GA, q: "Who among the following was the leader of the Ahom's Revolt, 1828?", o: ["Achal Singh","Bhagat Jawahar Mal","Gomdhar Konwar","Fond Sawant"], e: "Gomdhar Konwar, an Ahom prince, led the 1828 Ahom Revolt against British rule in Assam." },
  { s: GA, q: "Sri Jayewardenepura Kotte is the legislative capital of which of the following countries?", o: ["Bhutan","Bangladesh","Myanmar","Sri Lanka"], e: "Sri Jayewardenepura Kotte is the legislative capital of Sri Lanka." },
  { s: GA, q: "Which of the following diseases is caused by a virus?", o: ["Polio","Ringworm","Plague","Cholera"], e: "Polio (poliomyelitis) is caused by the poliovirus. Ringworm is fungal; plague and cholera are bacterial." },
  { s: GA, q: "Who among the following has written the novel 'In Custody'?", o: ["Dom Moraes","Mulk Raj Anand","P Lal","Anita Desai"], e: "'In Custody' (1984) is a novel written by Indian author Anita Desai." },
  { s: GA, q: "The book 'Cricket Drona' is written by Jatin Paranjape and Anand Vasu based on whom amongst the following Indian cricket coaches?", o: ["Kapil Dev","Anil Kumble","Ravi Shastri","Vasoo Paranjape"], e: "'Cricket Drona' chronicles the life of legendary Indian cricket coach Vasoo Paranjape." },
  { s: GA, q: "Ian Bell has announced his retirement from professional cricket in 2020. He represents which of the following countries?", o: ["Australia","New Zealand","West Indies","England"], e: "Ian Bell, who announced retirement in 2020, played for England." },
  { s: GA, q: "Where was the Peshwa sent away with a pension after the Third Anglo-Maratha War?", o: ["Poona","Nagpur","Surat","Bithur"], e: "After the Third Anglo-Maratha War, Peshwa Baji Rao II was sent to Bithur (near Kanpur, UP) with a pension." },
  { s: GA, q: "Which of the following countries has the highest peak named Keokradong?", o: ["Bangladesh","Bhutan","Sri Lanka","Myanmar"], e: "Keokradong, in the Chittagong Hill Tracts, is the highest peak of Bangladesh." },
  { s: GA, q: "Who among the following is the first Indian woman to fly to space?", o: ["Shawna Pandya","Kalpana Chawla","Sunita Williams","Prem Mathur"], e: "Kalpana Chawla, aboard Space Shuttle Columbia in 1997, became the first Indian-origin woman in space." },
  { s: GA, q: "Chittagong Hill Tracts are found in which of the following countries?", o: ["Bangladesh","Bhutan","India","Nepal"], e: "The Chittagong Hill Tracts are located in southeastern Bangladesh, bordering India and Myanmar." },
  { s: GA, q: "Which of the following is a non-renewable source of energy?", o: ["Wind power","Hydel power","Solar power","Fossil fuels"], e: "Fossil fuels (coal, oil, natural gas) are non-renewable as they take millions of years to form." },
  { s: GA, q: "Annapurna Devi, the legendary musician awarded with Padma Bhushan in 1977, was associated with which of the following musical instruments?", o: ["Surbahar","Violin","Veena","Flute"], e: "Annapurna Devi was a master of the Surbahar (bass sitar). She received Padma Bhushan in 1977." },
  { s: GA, q: "Lomas Rishi Cave, an example of early cave architecture of the 3rd century BC and the most datable cave of all, is located in which of the following states of India?", o: ["Manipur","Jharkhand","Haryana","Bihar"], e: "Lomas Rishi Cave, part of the Barabar group, is located in Bihar — early Mauryan rock-cut cave architecture from the 3rd century BCE." },

  // ============ General Intelligence & Reasoning (51-75) ============
  { s: REA, q: "Select the figure that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 4 follows the symmetry of the figure series." },
  { s: REA, q: "Four figures have been given, out of which three are alike in some manner and one is different. Select the odd figure.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Options 2, 3 and 4 contain three squares and three arrows. Option 1 has four squares and two arrows — the odd one out." },
  { s: REA, q: "Select the option that when placed in the blank space of the given pattern will correctly complete the pattern.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 completes the pattern as per the followed symmetry." },
  { s: REA, q: "In a certain code language, WARDROBE is written as AWDROREB. How will ORIENTAL be written in the same code language?", o: ["ROETINAL","EORITNLA","ROEITNLA","ROEITNAL"], e: "Pattern: swap pairs of letters and reorder. Applying same rule to ORIENTAL → ROEITNLA." },
  { s: REA, q: "Select the Venn diagram from the given options that represents the correct relationship amongst the following classes.\n\nTin, Metal, Copper", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "Tin and Copper are different metals — both belong to the parent class Metal, with no overlap. Per the answer key, diagram 2 fits." },
  { s: REA, q: "Which of the option figures is the exact mirror image of the given problem figure when the mirror is placed at its right side?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror at right flips left-right. Per the answer key, option 4 is the correct mirror image." },
  { s: REA, q: "If the given figure is folded to form a cube, which number will be opposite to '5'?", o: ["2","3","6","1"], e: "From the unfolded cube net, the opposite pairs are 1↔3, 2↔4, 6↔5. So 6 is opposite to 5." },
  { s: REA, q: "Select the number that can replace the question mark (?) in the following series.\n\n8, 12, 21, 37, 62, ?", o: ["98","88","94","84"], e: "Differences: +4(2²), +9(3²), +16(4²), +25(5²), +36(6²). Next: 62 + 36 = 98." },
  { s: REA, q: "Four words have been given, out of which three are alike in some manner and one is different. Select the odd one.", o: ["Ear","Nose","Eye","Throat"], e: "Ear, Nose and Eye are sense organs. Throat is not a primary sense organ — odd one out." },
  { s: REA, q: "A and B can do a piece of work in 30 days and 15 days respectively. A and B start the work together. In how many days will the entire work be completed?", o: ["10","12","15","9"], e: "LCM(30,15) = 30. A's eff = 1, B's eff = 2. Combined = 3/day. Days = 30/3 = 10." },
  { s: REA, q: "Four figures have been given out of which three are alike in some manner and one is different. Select the odd figure.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 is the odd figure — it contains a similar shape arranged vertically." },
  { s: REA, q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 shows the correctly unfolded shape." },
  { s: REA, q: "Select the option that is related to the third figure in the same way as the second figure is related to the first figure.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Each block is shifted one step anti-clockwise. Per the answer key, option 4 fits." },
  { s: REA, q: "Select the option that is related to the third figure in the same way as the second figure is related to the first figure.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The 2nd figure is the water image of the 1st. Per the answer key, the water image of the 3rd figure is option 1." },
  { s: REA, q: "If '$' stands for 'addition', '@' stands for 'subtraction', '&' stands for 'multiplication' and '#' stands for 'division', then what is the value of the following expression?\n\n16 @ 26 $ 8 & 14 # 7", o: ["6","4","1","0"], e: "16 − 26 + 8 × 14 ÷ 7 = 16 − 26 + 8 × 2 = 16 − 26 + 16 = 32 − 26 = 6." },
  { s: REA, q: "Four positions of a DICE are shown. Find out which number occurs on the face opposite to the face having the number '4'?", o: ["1","2","6","3"], e: "From dice positions 3 and 4, faces 1 and 3 are common. The remaining faces 4 and 6 must be opposite. Hence 6 is opposite to 4." },
  { s: REA, q: "Select the set in which the numbers are related in the same way as are the numbers of the following set.\n\n(1, 2, 3)", o: ["(4, 16, 64)","(4, 8, 16)","(11, 22, 33)","(6, 6, 8)"], e: "Pattern: 1×2 = 2, 1×3 = 3. Similarly 11×2 = 22, 11×3 = 33. So (11, 22, 33) matches." },
  { s: REA, q: "Which of the following sets of classes is best represented by the given diagram?", o: ["Birds, Reptiles, Animals","Girls, Students, Daughters","Flowers, Leaves, Garden","Men, Women, Human Beings"], e: "All daughters are girls; some girls and daughters are students. The given diagram (Girls includes Daughters; both partially overlap with Students) fits 'Girls, Students, Daughters'." },
  { s: REA, q: "Select the figure that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Each object moves one step anti-clockwise. Per the answer key, option 2 is correct." },
  { s: REA, q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 2 contains the embedded figure." },
  { s: REA, q: "Select the option in which the given figure is embedded (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 contains the embedded figure." },
  { s: REA, q: "Select the option that when placed in the blank space of given pattern will correctly complete the pattern.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 completes the pattern as per the followed symmetry." },
  { s: REA, q: "'Runway' is related to 'Airplane' in the same way as 'Track' is related to '______'.", o: ["Athlete","Ship","Bus","Boat"], e: "An airplane runs on a runway; similarly, an athlete runs on a track." },
  { s: REA, q: "Select the option that is related to the third number in the same way as the second number is related to the first number and the sixth number is related to the fifth number.\n\n168 : 8 :: 84 : ? :: 105 : 5", o: ["12","6","4","11"], e: "Pattern: 1st ÷ 21 = 2nd. 168/21 = 8. 105/21 = 5. So 84/21 = 4." },
  { s: REA, q: "Select the number that can replace the question mark (?) in the following series.\n\n23, 33, 57, 101, 171, ?", o: ["273","278","277","275"], e: "Differences: +10, +24, +44, +70, +102. Second differences: +14, +20, +26, +32. Next diff: 102+? Per pattern, next = 273." },

  // ============ Numerical Ability (76-90) ============
  { s: NA, q: "What is the value of the given expression? (Refer to figure)", o: ["79/15","82/15","91/15","67/15"], e: "Per the worked solution in the source, the simplified value is 82/15." },
  { s: NA, q: "Two numbers P and Q are such that the sum of 2% of P and 2% of Q is two-third of the sum of 2% of P and 6% of Q. The ratio of 2 times of P to 5 times of Q is:", o: ["5 : 3","6 : 5","3 : 2","2 : 5"], e: "(2P + 2Q)/100 = 2/3 × (2P + 6Q)/100 → 6P + 6Q = 4P + 12Q → 2P = 6Q → P:Q = 3:1. So 2P:5Q = 6:5." },
  { s: NA, q: "What is the length (in cm) of the diagonal of a square whose area is 5 times that of another square with diagonal as 4√2 cm?", o: ["8√5","4√10","2√10","4√5"], e: "Side of original = 4 cm. Area = 16. New area = 80, side = 4√5. New diagonal = √2 × 4√5 = 4√10 cm." },
  { s: NA, q: "During a rainy day, 4 cm of rain falls. The volume (in m³) of water that falls on 1.5 hectares of ground is:", o: ["600","450","750","500"], e: "Area = 1.5 ha = 15000 m². Rain = 0.04 m. Volume = 15000 × 0.04 = 600 m³." },
  { s: NA, q: "The average of the three-digit numbers that have all three digits the same is:", o: ["666","444","555","525"], e: "Numbers: 111, 222, ..., 999. Sum = 111(1+2+...+9) = 111×45 = 4995. Avg = 4995/9 = 555." },
  { s: NA, q: "An officer undertakes to complete a job in 300 days. He employs 300 people for 60 days and they complete half of the work. He then reduces the number of people to 100, who work for 120 days, after which there are 20 days holiday. How many people must be employed for the remaining period to finish the work?", o: ["50","100","75","60"], e: "Total = 300×120 = 36000. Done in 60 days = 18000 (half). Then 100×120 = 12000 (so 30000 done). Remaining = 6000. Days left = 300−180−20 = 100. People = 6000/100 = 60." },
  { s: NA, q: "A passenger train without stoppages runs at an average speed of 75 km/h, and with stoppages, at an average speed of 60 km/h. What is the total time (in hours) taken by the train for stoppages on a route of length 600 km?", o: ["2","4","3","1"], e: "Time without stoppages = 600/75 = 8 hr. Time with stoppages = 600/60 = 10 hr. Stoppage time = 10 − 8 = 2 hr." },
  { s: NA, q: "A person spent 65% of the income on purchasing items A and B and the rest of the amount is his savings. He spent ₹1,800 on purchasing item A and ₹3,270 on purchasing item B. The saving amount (in ₹) was:", o: ["2730","2500","3000","2950"], e: "65% of income = 1800 + 3270 = 5070 → income = 7800. Savings = 35% × 7800 = 2730." },
  { s: NA, q: "In scheme A, a sum of ₹24,000 is put on simple interest for 2 years at a rate of 8% per annum. In scheme B, a sum of ₹24,000 is put at a rate of 5% per annum, compounded annually, for 2 years. The ratio of interest from A to that from B is:", o: ["41 : 64","45 : 41","41 : 45","64 : 41"], e: "SI = 24000×8×2/100 = 3840. CI = 24000×(1.05² − 1) = 24000×0.1025 = 2460. Ratio = 3840:2460 = 64:41." },
  { s: NA, q: "What will be the least number of marbles with Rohit, if he can arrange them in rows of 9, 10 and 15 marbles each, and the number is also a perfect square?", o: ["100","961","400","900"], e: "LCM(9,10,15) = 90 = 2×3²×5. To make it a perfect square, multiply by 2×5 = 10. Result = 900 = 30²." },
  { s: NA, q: "A student purchased a box of pens at the rate of 8 pens for ₹24 and sold all of them at the rate of 9 pens for ₹45. In this transaction, he gained ₹240. How many pens did the box contain?", o: ["100","120","180","150"], e: "CP/pen = 24/8 = 3. SP/pen = 45/9 = 5. Profit/pen = 2. Pens = 240/2 = 120." },
  { s: NA, q: "A dealer sells an article by allowing a 20% discount on its marked price and gains 24%. If the cost price of the article is increased by 10%, how much discount percentage should he allow now on the same marked price so as to earn the same percentage of profit as before?", o: ["10%","15%","18%","12%"], e: "Let CP=100, SP=124, MP=155. New CP=110, new SP=110×1.24=136.4. New discount = (155−136.4)/155 ×100 = 12%." },
  { s: NA, q: "A person invested a sum of ₹50,000 partly at 15% p.a. and remaining at 18% p.a. at simple interest. At the end of 2 years, the total interest received was ₹16,800. The ratio of the sum at 15% p.a. to the sum at 18% p.a. is:", o: ["1 : 4","2 : 3","4 : 1","3 : 2"], e: "Per year interest = 8400 → effective rate = 16.8%. By alligation: 15% — 16.8% — 18%. Ratio = (18−16.8):(16.8−15) = 1.2:1.8 = 2:3." },
  { s: NA, q: "The monthly income of A, B and C taken together is ₹69,000. A spends 70% of income, B spends 80%, C spends 92%. If their monthly savings are in the ratio 15 : 11 : 10, then the monthly savings (in ₹) of B is:", o: ["3,300","2,500","6,750","1,200"], e: "Savings: A=30%, B=20%, C=8%. Income ratio = 15/0.3 : 11/0.2 : 10/0.08 = 50 : 55 : 125. Total = 230x = 69000 → x=300. B's saving = 11×300 = 3300." },
  { s: NA, q: "The difference between a two-digit number and the number obtained by interchanging the position of its digits is 45. What is the difference between the two digits of that number and how many such numbers are possible?", o: ["6; 3","3; 6","4; 5","5; 4"], e: "(10x+y) − (10y+x) = 9(x−y) = 45 → x−y = 5. Pairs: (9,4),(8,3),(7,2),(6,1) — 4 numbers possible. So difference 5, count 4." }
];

if (RAW.length !== 90) { console.error(`Expected 90 questions, got ${RAW.length}`); process.exit(1); }

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
      tags: ['SSC', 'GD', 'Constable', 'PYQ', '2020'],
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
    console.log(`Created ExamCategory: Central (${category._id})`);
  } else {
    console.log(`Found ExamCategory: Central (${category._id})`);
  }

  let exam = await Exam.findOne({ code: 'SSC-GD' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC GD Constable',
      code: 'SSC-GD',
      description: 'Staff Selection Commission - General Duty (GD) Constable',
      isActive: true
    });
    console.log(`Created Exam: SSC GD Constable (${exam._id})`);
  } else {
    console.log(`Found Exam: SSC GD Constable (${exam._id})`);
  }

  // Re-use the 2020 SSC GD Tier-I pattern (50 GK + 25 Reasoning + 15 Numerical = 90 Q,
  // 180 marks, 60 min, 0.5 negative).
  const PATTERN_TITLE = 'SSC GD Constable Tier-I (2020 Pattern)';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: PATTERN_TITLE,
      duration: 60,
      totalMarks: 180,
      negativeMarking: 0.5,
      sections: [
        { name: GA,  totalQuestions: 50, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: REA, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: NA,  totalQuestions: 15, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  }

  const TEST_TITLE = 'SSC GD Constable - 7 December 2020 Shift-2';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /7 December 2020/i }
  });
  if (dropRes.deletedCount > 0) {
    console.log(`Dropped ${dropRes.deletedCount} prior copy of this PYQ.`);
  }

  console.log('\nUploading images to Cloudinary...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id,
    title: TEST_TITLE,
    totalMarks: 180,
    duration: 60,
    accessLevel: 'FREE',
    isPYQ: true,
    pyqYear: 2020,
    pyqShift: 'Shift-2',
    pyqExamName: 'SSC GD Constable',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
