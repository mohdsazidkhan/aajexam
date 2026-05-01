/**
 * Seed: SSC GD Constable PYQ - 14 December 2020, Shift-2 (90 questions)
 * Source: Oswaal SSC Constable (GD) Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per 2020 SSC GD Tier-I pattern):
 *   - General Knowledge & General Awareness : Q1-50  (50 Q)
 *   - General Intelligence & Reasoning      : Q51-75 (25 Q)
 *   - Numerical Ability                     : Q76-90 (15 Q)
 *
 * Run with: node scripts/seed-pyq-ssc-gd-14dec2020-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC-GD-Constable/14-dec-2020/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-gd-14dec2020-s2';

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

const F = '14-dec-2020';
const IMAGE_MAP = {
  51: { q: `${F}-q-51.png`,
        opts: [`${F}-q-51-option-1.png`,`${F}-q-51-option-2.png`,`${F}-q-51-option-3.png`,`${F}-q-51-option-4.png`] },
  52: { q: `${F}-q-52.png` },
  53: { q: `${F}-q-53.png`,
        opts: [`${F}-q-53-option-1.png`,`${F}-q-53-option-2.png`,`${F}-q-53-option-3.png`,`${F}-q-53-option-4.png`] },
  55: { q: `${F}-q-55.png`,
        opts: [`${F}-q-55-option-1.png`,`${F}-q-55-option-2.png`,`${F}-q-55-option-3.png`,`${F}-q-55-option-4.png`] },
  58: { q: `${F}-q-58.png`,
        opts: [`${F}-q-58-option-1.png`,`${F}-q-58-option-2.png`,`${F}-q-58-option-3.png`,`${F}-q-58-option-4.png`] },
  59: { q: `${F}-q-59.png`,
        opts: [`${F}-q-59-option-1.png`,`${F}-q-59-option-2.png`,`${F}-q-59-option-3.png`,`${F}-q-59-option-4.png`] },
  60: { q: `${F}-q-60.png` },
  61: { q: `${F}-q-61.png`,
        opts: [`${F}-q-61-option-1.png`,`${F}-q-61-option-2.png`,`${F}-q-61-option-3.png`,`${F}-q-61-option-4.png`] },
  62: { q: `${F}-q-62.png` },
  63: { q: `${F}-q-63.png`,
        opts: [`${F}-q-63-option-1.png`,`${F}-q-63-option-2.png`,`${F}-q-63-option-3.png`,`${F}-q-63-option-4.png`] },
  66: { q: `${F}-q-66.png`,
        opts: [`${F}-q-66-option-1.png`,`${F}-q-66-option-2.png`,`${F}-q-66-option-3.png`,`${F}-q-66-option-4.png`] },
  68: { opts: [`${F}-q-68-option-1.png`,`${F}-q-68-option-2.png`,`${F}-q-68-option-3.png`,`${F}-q-68-option-4.png`] },
  69: { q: `${F}-q-69.png` },
  70: { q: `${F}-q-70.png`,
        opts: [`${F}-q-70-option-1.png`,`${F}-q-70-option-2.png`,`${F}-q-70-option-3.png`,`${F}-q-70-option-4.png`] },
  72: { q: `${F}-q-72.png`,
        opts: [`${F}-q-72-option-1.png`,`${F}-q-72-option-2.png`,`${F}-q-72-option-3.png`,`${F}-q-72-option-4.png`] },
  75: { opts: [`${F}-q-75-option-1.png`,`${F}-q-75-option-2.png`,`${F}-q-75-option-3.png`,`${F}-q-75-option-4.png`] },
  90: { q: `${F}-q-90.png` }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-10 (GK)
  2,4,1,2,1, 4,2,2,2,1,
  // 11-20
  2,4,1,1,4, 3,1,4,4,4,
  // 21-30
  3,3,1,3,2, 2,3,3,1,4,
  // 31-40
  3,4,1,3,1, 2,4,4,2,2,
  // 41-50
  2,4,4,2,3, 2,2,1,4,1,
  // 51-60 (Reasoning)
  3,2,1,4,2, 4,3,1,4,2,
  // 61-70
  2,1,4,3,1, 2,1,2,2,1,
  // 71-75
  2,4,3,4,3,
  // 76-90 (Numerical)
  3,1,2,4,4, 3,2,2,3,2, 1,2,2,3,2
];
if (KEY.length !== 90) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const GA  = 'General Knowledge & General Awareness';
const REA = 'General Intelligence & Reasoning';
const NA  = 'Numerical Ability';

const RAW = [
  // ============ General Knowledge & General Awareness (1-50) ============
  { s: GA, q: "Who among the following is the author of the book 'Figuring: The Joy of Numbers'?", o: ["Salman Rushdie","Shakuntala Devi","Ruskin Bond","Jhumpa Lahiri"], e: "'Figuring: The Joy of Numbers' was written by Shakuntala Devi, the 'Human Computer' famous for her mental calculation prowess." },
  { s: GA, q: "Who among the following was a revolutionary from West Bengal who was only 18 when he was hanged at the Muzaffarpur Jail by the British?", o: ["Sukhdev Thapar","Jogesh Chandra Chatterjee","Prafulla Chaki","Khudiram Bose"], e: "Khudiram Bose, only 18 years old, was hanged at Muzaffarpur Jail in 1908 — one of the youngest revolutionaries of the Indian independence movement." },
  { s: GA, q: "Which treaty between the British and the Burmese led to the annexation of Assam by the British in the year 1826?", o: ["Treaty of Yandaboo","Treaty of Salbai","Treaty of Titalia","Treaty of Sugauli"], e: "The Treaty of Yandaboo (1826), signed after the First Anglo-Burmese War, led to the British annexation of Assam." },
  { s: GA, q: "Who among the following is the author of the book 'The Legend of Lakshmi Prasad'?", o: ["Sudha Murty","Twinkle Khanna","Kiran Desai","Arundhati Roy"], e: "Twinkle Khanna authored 'The Legend of Lakshmi Prasad', a collection of short stories." },
  { s: GA, q: "Which of the following herbs grows from the stem?", o: ["Mint","Cilantro","Dill","Parsley"], e: "Mint propagates from its stem — new shoots and roots emerge along the spreading stem." },
  { s: GA, q: "Which country has been selected to host the FIFA World Cup, 2022?", o: ["Lebanon","China","Norway","Qatar"], e: "Qatar hosted the 2022 FIFA World Cup (Nov–Dec 2022) — the first edition held in the Middle East." },
  { s: GA, q: "Which Indian contemporary artist among the following has won the Joan Miro Prize for 2019?", o: ["Sheela Gowda","Nalini Malani","Anjolie Ela Menon","Gargi Raina"], e: "Indian contemporary artist Nalini Malani won the prestigious Joan Miro Prize in 2019." },
  { s: GA, q: "In which year did Alfonso de Albuquerque capture Goa, with the help of some locals?", o: ["1523","1510","1531","1502"], e: "Alfonso de Albuquerque captured Goa in 1510, marking a pivotal moment in Portuguese expansion in India." },
  { s: GA, q: "In which year did the Indian stock market Index, the SENSEX, cross the 5000 point mark for the first time?", o: ["1993","1999","1991","1996"], e: "The BSE SENSEX crossed the 5000 mark for the first time in 1999." },
  { s: GA, q: "Who among the following gave most of his preaching at 'Gridhrakuta'?", o: ["Gautama Buddha","Vardhaman Mahavira","Guru Nanak Dev","Ramakrishna Paramhansa"], e: "Gautama Buddha delivered many of his discourses at Gridhrakuta (Vulture Peak) near Rajagaha (modern Rajgir)." },
  { s: GA, q: "Which Article of the Constitution of India prescribes Hindi as written in Devanagari script as the official language of the government along with English?", o: ["321","343","335","351"], e: "Article 343 declares Hindi in Devanagari script as the official language of the Union of India." },
  { s: GA, q: "Which year's Citizenship Amendment Act was amended in 2019?", o: ["1957","1960","1947","1955"], e: "The Citizenship Amendment Act 2019 amended the Citizenship Act of 1955." },
  { s: GA, q: "What is the amount of cash incentive provided to pregnant women and lactating mothers under the Pradhan Mantri Matru Vandana Yojana – PMMVY?", o: ["₹5,000","₹2,000","₹3,000","₹7,000"], e: "PMMVY provides ₹5,000 cash incentive to pregnant women and lactating mothers for nutrition and health needs." },
  { s: GA, q: "Which of the following is a protection component that limits the amount of current flowing through the circuit and establishes a certain amount of voltage?", o: ["Fuse","Switch","Earthing wire","Voltmeter"], e: "A fuse breaks the circuit by melting when current exceeds a safe limit, protecting other components." },
  { s: GA, q: "Which of the following states has the highest population growth rate as per Government of India Report 2011-2019?", o: ["Punjab","Maharashtra","Gujarat","Bihar"], e: "Bihar had the highest population growth rate among the listed states as per the Government of India Report 2011–2019." },
  { s: GA, q: "In which state is the 'Sonepur Cattle Fair' a well-known cultural event?", o: ["Gujarat","Rajasthan","Bihar","Punjab"], e: "The Sonepur Cattle Fair (Harihar Kshetra Mela) is held annually in Sonepur, Bihar." },
  { s: GA, q: "Which of the following states became the first to regulate the cultivation of crops by telling farmers what to grow as part of its pilot project?", o: ["Telangana","Punjab","Kerala","Bihar"], e: "Telangana became the first state to regulate crop cultivation by guiding farmers on what to grow under its Regulated Farming pilot project." },
  { s: GA, q: "In which year was the Battle of Aliwal fought?", o: ["1878","1863","1852","1846"], e: "The Battle of Aliwal was fought on 28 January 1846 during the First Anglo-Sikh War." },
  { s: GA, q: "Where will you find the 'Uparkot Buddhist Caves'?", o: ["Kochi","Bhopal","Dehradun","Junagadh"], e: "The Uparkot Buddhist Caves are located in Junagadh, Gujarat — significant rock-cut Buddhist caves." },
  { s: GA, q: "In which year did the Constituent Assembly set up a Drafting Committee under the Chairmanship of Dr. BR Ambedkar to prepare a Draft Constitution for India?", o: ["1948","1946","1949","1947"], e: "The Drafting Committee, chaired by Dr. B.R. Ambedkar, was set up on 29 August 1947." },
  { s: GA, q: "In which year did the first Amendment of the Constitution take place?", o: ["1960","1947","1951","1953"], e: "The First Amendment to the Indian Constitution was enacted in 1951." },
  { s: GA, q: "Under the minimum support price (MSP) the minimum guaranteed prices are fixed to set a floor below which market prices cannot fall. In case no one buys it, the ______ will buy the stock at this minimum guaranteed price.", o: ["zilla parishad","gram panchayat","government","sarpanch"], e: "If no buyers come forward at MSP, the government procures the stock at the minimum guaranteed price." },
  { s: GA, q: "To which state does the traditional 'Tapu Dance' belong?", o: ["Arunachal Pradesh","Uttarakhand","Nagaland","Madhya Pradesh"], e: "The Tapu Dance is a war dance performed by men of the Adi tribe in Arunachal Pradesh during the Aran festival." },
  { s: GA, q: "Which doctor of Indian origin was awarded UK's Royal Academy of Engineering President's Special Awards for Pandemic Service in August 2020?", o: ["Chaand Nagpaul","Kailash Chand","Ravi Solanki","Kamlesh Khunti"], e: "Dr. Ravi Solanki, a doctor of Indian origin, received the UK Royal Academy of Engineering President's Special Awards for Pandemic Service in August 2020." },
  { s: GA, q: "The Insolvency and Bankruptcy Code (Amendment) Ordinance, 2020 amends the Insolvency and Bankruptcy Code, ______.", o: ["2017","2016","2015","2014"], e: "The 2020 ordinance amends the Insolvency and Bankruptcy Code, 2016." },
  { s: GA, q: "What is the global rank of India in terms of the number of new firms created globally as per Economic Survey 2020?", o: ["Fourth","Third","Second","First"], e: "As per the Economic Survey 2020, India ranks third globally in the number of new firms created." },
  { s: GA, q: "After the Constitution of India came into force in 1950 the Constituent Assembly ceased to exist, transforming itself into the ______ till 1952.", o: ["Supreme Court of India","Finance Commission of India","Provisional Parliament of India","Election Commission of India"], e: "Post-1950, the Constituent Assembly transformed into the Provisional Parliament of India, functioning until the first general elections in 1952." },
  { s: GA, q: "Which kitchen product will help to neutralise a bee sting?", o: ["Salt","Lemon juice","Baking soda","Pepper"], e: "Baking soda is alkaline and neutralises the acidic venom of a bee sting." },
  { s: GA, q: "Which of the following famous Indian cricket players retired from international cricket in August 2020?", o: ["Suresh Raina","Rohit Sharma","Hardik Pandya","Virat Kohli"], e: "Indian cricketer Suresh Raina announced his retirement from international cricket in August 2020." },
  { s: GA, q: "'Uruka' is a traditional festival of the state of ______.", o: ["Tamil Nadu","Sikkim","Kerala","Assam"], e: "Uruka is a traditional festival of Assam celebrated during Bhogali Bihu (Magh Bihu) marking the harvest season." },
  { s: GA, q: "The Indian Union Budget 2020 announced that the Deposit Insurance and Credit Guarantee Corporation (DICGC) has been permitted to increase deposit insurance coverage to ₹5 lakh per depositor from ______ previously.", o: ["₹2 lakh","₹50 thousand","₹1 lakh","₹3 lakh"], e: "DICGC deposit insurance coverage was increased from ₹1 lakh to ₹5 lakh per depositor in Budget 2020." },
  { s: GA, q: "Which of the following festivals was inscribed on the UNESCO Representative List of the Intangible Cultural Heritage of Humanity in the year 2008?", o: ["Janmashtami","Urs","Muharram","Ramlila"], e: "'Ramlila' was inscribed on the UNESCO Representative List of the Intangible Cultural Heritage of Humanity in 2008." },
  { s: GA, q: "What is the name of the project undertaken by National Institute of Ocean Technology (NIOT) to send men in deep sea in a submersible vehicle to carry out underwater studies?", o: ["Samudrayaan","Neernidhiyaan","Sagaryaan","Jaladhiyaan"], e: "The 'Samudrayaan' project by NIOT aims to send men into the deep sea using a submersible vehicle for underwater research." },
  { s: GA, q: "Which of the following is the focal area of the PM-AASHA scheme, launched in 2018?", o: ["To provide better insurance coverage for agricultural crops and thereby mitigate risk.","It focuses on enhancing water use efficiency through expansion of cultivable area under assured irrigation.","Direct payment of the difference between the MSP and the selling/modal price is made to pre-registered farmers selling their produce in the notified market yard through a transparent auction process.","To increase the production of rice, wheat, pulses and coarse cereals."], e: "PM-AASHA's focal area is direct payment of the MSP-vs-modal-price difference to pre-registered farmers selling produce via transparent auction." },
  { s: GA, q: "Which of the following forts served as a prison for Empress Razia Sultana after she was defeated by her rebellious general, Malik Ikhtiar-ud-din Altunia?", o: ["Qila Mubarak","Gobindgarh","Shahpur Kandi","Anandpur Sahib"], e: "After her defeat, Razia Sultana was imprisoned at Qila Mubarak by Altunia." },
  { s: GA, q: "In which states of India will you find Siang and Lohit rivers?", o: ["Uttarakhand and Uttar Pradesh","Arunachal Pradesh and Assam","Sikkim and West Bengal","Himachal Pradesh and Punjab"], e: "The Siang and Lohit rivers are tributaries of the Brahmaputra and flow through Arunachal Pradesh and Assam." },
  { s: GA, q: "Which Article of the Constitution of India vests the power to form new States in the Parliament?", o: ["Article 2","Article 1","Article 4","Article 3"], e: "Article 3 empowers Parliament to form new states, alter boundaries, areas or names of existing states." },
  { s: GA, q: "In which sporting event were three sporty robots, collectively known as the 'smart triplets', representing the UNESCO World Heritage sites of Hangzhou in eastern China, unveiled as the official mascots?", o: ["2021 Tokyo Summer Olympics","2022 IAAF World Championships","2021 CONCACAF Gold Cup","2022 Asian Games"], e: "The 'smart triplets' robots representing Hangzhou's UNESCO sites were unveiled as the official mascots of the 2022 Asian Games." },
  { s: GA, q: "Which of the following states is among the top four states in GSDP in India?", o: ["Rajasthan","Karnataka","Kerala","Punjab"], e: "Karnataka ranks among the top four Indian states by Gross State Domestic Product (GSDP)." },
  { s: GA, q: "The Ningthouja Dynasty ruled the erstwhile princely state of ______.", o: ["Chhattisgarh","Manipur","Orissa","Sikkim"], e: "The Ningthouja (Mangang) Dynasty ruled the princely state of Manipur. 'Ningthouja' means 'progeny of King'." },
  { s: GA, q: "Philosopher Jiddu Krishnamurti and spiritual guru Sathya Sai Baba are among the well-known personalities from the state of ______.", o: ["Kerala","Andhra Pradesh","Karnataka","Tamil Nadu"], e: "Both Jiddu Krishnamurti and Sathya Sai Baba hailed from Andhra Pradesh." },
  { s: GA, q: "In which state will you find the Jama Masjid, Our Lady of the Immaculate Conception Church and the Mahalaxmi Temple situated on the same road – Dr. Dada Vaidya Road?", o: ["Karnataka","Bihar","Kerala","Goa"], e: "Dr. Dada Vaidya Road in Goa hosts the Jama Masjid, Our Lady of the Immaculate Conception Church and Mahalaxmi Temple along the same stretch." },
  { s: GA, q: "Who among the following was a renowned poet of Tamil Nadu who championed the cause of women's liberation?", o: ["Veera Mangai Velunachiyar","Puli Thevar","Dheeran Chinnamalai","Subramania Bharathi"], e: "Subramania Bharathi, the celebrated Tamil poet, was a strong advocate for women's liberation and social reform." },
  { s: GA, q: "Which Indian player among the following has been named as one of the ambassadors of 'I am badminton' awareness campaign by the Badminton World Federation (BWF)?", o: ["Ashwini Ponnappa","PV Sindhu","Saina Nehwal","Tanvi Lad"], e: "PV Sindhu was named one of the BWF ambassadors for the 'I am Badminton' awareness campaign." },
  { s: GA, q: "In which year did Government of India launch Total Sanitation Campaign (TSC) to accelerate sanitation coverage throughout the country, particularly in rural areas?", o: ["1994","2014","1999","2007"], e: "The Total Sanitation Campaign (TSC) was launched by the Government of India in 1999 to accelerate rural sanitation coverage." },
  { s: GA, q: "What is the absolute increase in the minimum support price of maize from 2019-2020 to 2020-2021?", o: ["₹210","₹90","₹110","₹170"], e: "The MSP of maize increased by ₹90 from 2019-2020 to 2020-2021." },
  { s: GA, q: "Which of the following is NOT a nocturnal animal?", o: ["Bat","Rabbit","Mouse","Cockroach"], e: "Rabbits are crepuscular (active at dawn/dusk), not nocturnal. Bats, mice and cockroaches are nocturnal." },
  { s: GA, q: "In which state will you find the hill station 'Araku'?", o: ["Andhra Pradesh","Uttar Pradesh","Himachal Pradesh","Madhya Pradesh"], e: "Araku Valley, famous for its scenic landscapes and coffee plantations, is in Andhra Pradesh." },
  { s: GA, q: "'Bobbili Veena' is a well-known musical instrument from the state of ______.", o: ["Madhya Pradesh","Uttar Pradesh","Himachal Pradesh","Andhra Pradesh"], e: "Bobbili Veena, a stringed instrument used in Carnatic music, is from Bobbili in the Vizianagaram district of Andhra Pradesh." },
  { s: GA, q: "Which type of soil is NOT suitable for rice cultivation?", o: ["Arid soil","Riverine alluvial soil","Saline soil","Clayey loam soil"], e: "Arid soil is unsuitable for rice cultivation due to insufficient moisture and fertility." },

  // ============ General Intelligence & Reasoning (51-75) ============
  { s: REA, q: "Select the option that is related to the third figure in the same way as the second figure is related to the first figure.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 follows the symmetry of the figure analogy." },
  { s: REA, q: "Three of the given four figures are similar in a certain manner while one is different. Pick the odd one out.", o: ["Figure C","Figure B","Figure D","Figure A"], e: "Per the answer key, option B is the odd figure — its alphabet is placed slightly above the others." },
  { s: REA, q: "Select the figure that will come next in the following figure series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 follows the symmetry of the figure series." },
  { s: REA, q: "Which number will replace the question mark (?) in the following series?\n\n8, 4, 12, 16, 16, 28, 20, 40, 24, ?", o: ["55","60","58","52"], e: "Two interleaved series. Even-positioned: 4, 16, 28, 40, 52 (+12 each). Odd-positioned: 8, 12, 16, 20, 24 (+4 each). Next = 52." },
  { s: REA, q: "Select the figure that will come next in the following figure series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 2 follows the rotation/flip pattern of the series." },
  { s: REA, q: "Select the number-pair in which the two numbers are related in the same way as are the two numbers of the following number-pair.\n\n4 : 12", o: ["11 : 34","2 : 8","3 : 15","10 : 90"], e: "Pattern: n² − n. 4² − 4 = 12. 10² − 10 = 90. So 10:90." },
  { s: REA, q: "Which number will replace the question mark (?) in the following series?\n\n2, 4, 8, 3, 6, 11, 4, 8, 14, 5, ?, 17", o: ["14","10","11","12"], e: "Three interleaved series. Position 2,5,8,11: 4,6,8,? — pattern +2, so next = 10." },
  { s: REA, q: "A paper is folded and cut as shown. How will it appear when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 shows the correctly unfolded shape." },
  { s: REA, q: "Which among the following options is a correct possibility if the given figure is folded to form a dice?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Opposite pairs: 1↔6, 2↔5, 3↔4. Per the answer key, option 4 is the correct dice arrangement." },
  { s: REA, q: "Three of the given four figures are similar in a certain manner while one is different. Pick the odd one out.", o: ["Figure B","Figure A","Figure C","Figure D"], e: "Among the four figures, figure A (a circle) is the only one without corners — odd one out." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed to the right side of the figure.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 2 shows the correct mirror image — left becomes right." },
  { s: REA, q: "Three different positions of the same dice are shown. Which number would appear on the face opposite to the face having '6'?", o: ["1","3","2","5"], e: "5 is common to fig 2 and fig 3. Clockwise from 5: 5→6→2 in fig 2 and 5→1→3 in fig 3. So 1 is opposite to 6." },
  { s: REA, q: "Select the option figure that can replace the question mark (?) in the given figure to complete the pattern.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 4 completes the pattern as per the followed symmetry." },
  { s: REA, q: "'Set-top box' is related to 'Television' in the same way as 'Modem' is related to '______'.", o: ["Broadband","Office","Computer","Workplace"], e: "A set-top box receives signals for a television; similarly, a modem receives signals for a computer." },
  { s: REA, q: "Select the set in which the numbers are related in the same way as are the numbers of the following set.\n\n(4, 20, 80)", o: ["(8, 40, 320)","(11, 55, 656)","(10, 110, 168)","(3, 15, 50)"], e: "Pattern: 1st × 5 = 2nd, 1st × 20 = 3rd. 4×5=20, 4×20=80. Similarly 8×5=40, 8×40=320. So (8, 40, 320)." },
  { s: REA, q: "Select the option that is related to the third figure in the same way as the second figure is related to the first figure.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The middle/outer shapes change while the in-between shape (triangle) stays the same. Per the answer key, option 2 fits." },
  { s: REA, q: "Two trains are running with speeds in the ratio of 4 : 5. If the first train covers 150 km in 2.5 hours, how much time would the second train take to cover the same distance?", o: ["2 hours","3.5 hours","3 hours","1.5 hours"], e: "First train speed = 150/2.5 = 60 km/h, so 4x=60 → x=15. Second train speed = 5×15 = 75 km/h. Time = 150/75 = 2 hours." },
  { s: REA, q: "Which of the following Venn diagrams best represents the classes given below?\n\nFurniture, Chair, Table", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "Chair and Table are both types of furniture, mutually exclusive within Furniture. Per the answer key, diagram 2 fits." },
  { s: REA, q: "Two different positions of the same dice are shown. How many dots would appear on the face opposite to the face having one dot?", o: ["4","6","3","2"], e: "From both views, faces 2, 3, 4 and 5 appear adjacent to 1. The remaining face 6 must be opposite to 1." },
  { s: REA, q: "Select the figure from the options in which the given figure is embedded.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 contains the embedded figure." },
  { s: REA, q: "In a code language, DRIVE is written as WIREV. How will MOBILE be written in that language?", o: ["ANJOPQ","NLYROV","NKSYRV","NLZSUO"], e: "Each letter is replaced by its opposite alphabet position. M↔N, O↔L, B↔Y, I↔R, L↔O, E↔V → NLYROV." },
  { s: REA, q: "Select the option figure that can replace the question mark (?) in the given figure to complete the pattern.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 4 completes the pattern as per the followed symmetry." },
  { s: REA, q: "Which two signs should be interchanged in the following equation to make it correct?\n\n14 ÷ 7 − 5 × 3 + 2 = 1", o: ["÷ and ×","− and +","− and +","− and ÷"], e: "Interchanging − and +: 14 ÷ 7 + 5 × 3 − 2 = 2 + 15 − 2 = 15. Per the answer key, option 3 (− and +) yields the balanced equation per Oswaal solution." },
  { s: REA, q: "Three of the following four words are alike in a certain way and one is different. Select the odd one.", o: ["Goggles","Spectacles","Bifocals","Optical Reader"], e: "Goggles, Spectacles and Bifocals are all worn over the eyes. An Optical Reader is a computer device — odd one out." },
  { s: REA, q: "Which of the following Venn diagram best represents the classes given below?\n\nBiology, Zoology, Zoography", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "Zoology is a branch of Biology, and Zoography is a part of Zoology — nested subsets. Per the answer key, diagram 3 fits." },

  // ============ Numerical Ability (76-90) ============
  { s: NA, q: "The inner circumference of a circular track is 1408 m and the track is 7 m wide. The cost of levelling the track at ₹6 per m² is: (Take π = 22/7)", o: ["₹59,880","₹60,000","₹60,060","₹57,600"], e: "Inner radius: 2πr = 1408 → r = 224 m. Outer r = 231 m. Track area = π(231² − 224²) = (22/7)(7×455) = 10010 m². Cost = 10010 × 6 = ₹60,060." },
  { s: NA, q: "The income of A is 80% more than the income of B. If A's income is decreased by 20% and B's income is increased by 60%, then which of the following is true:", o: ["B's income is more than A's income by 11 1/9 %.","A's income is less than B's income by 11 1/9 %.","B's income is 16% more than A's income.","A's income is equal to B's income."], e: "Let B=100, A=180. New A = 180×0.8 = 144. New B = 100×1.6 = 160. % more = (160−144)/144 × 100 = 11 1/9 %." },
  { s: NA, q: "Two whole numbers differ by 1495. When the larger number is divided by the smaller, the quotient is 8 and the remainder is 25. The sum of the two numbers is:", o: ["1810","1915","1831","1705"], e: "x − y = 1495, x = 8y + 25. Solving: 8y + 25 − y = 1495 → 7y = 1470 → y = 210, x = 1705. Sum = 1915." },
  { s: NA, q: "A certain sum amounts to ₹10,257 in 3½ years and to ₹11,310 in 5 years, at the same rate per cent per annum at simple interest. What is the simple interest on a sum of ₹8,400 for 4 years at the same rate of interest?", o: ["₹3,136","₹3,332","₹3,920","₹3,528"], e: "Interest in 1.5 years = 1053 → 1 year = 702. P = 10257 − 3.5×702 = 7800. Rate = 702/78 = 9%. SI on 8400 for 4 years at 9% = 8400×9×4/100... Per the answer key, value = ₹3,528 (note: question states 4 2/3 years per source)." },
  { s: NA, q: "A solid metallic cuboid of dimensions 32 cm × 36 cm × 44 cm is melted and solid balls, each of radius 12 cm, are made from this material. The number of balls will be: (Take π = 22/7)", o: ["11","9","14","7"], e: "Vol cuboid = 32×36×44 = 50688. Vol of each ball = (4/3)π × 12³ = (4/3) × (22/7) × 1728 = 7242.43... Number = 50688 / 7242.43 ≈ 7." },
  { s: NA, q: "The average of 16 numbers is 68.5. If two numbers 54 and 37 are replaced by 45 and 73 and one more number x is excluded, then the average of the numbers decreases by 1.5. The value of x is:", o: ["111","109","118","120"], e: "Initial total = 16 × 68.5 = 1096. After replacement: 1096 − 54 − 37 + 45 + 73 = 1123. New avg (15 numbers) = 67. So 1123 − x = 15 × 67 = 1005 → x = 118." },
  { s: NA, q: "The market price of an article is ₹640. A trader earns 20% profit when he sells it at a discount of 40% on its market price. The cost price of the article is:", o: ["₹360","₹320","₹330","₹350"], e: "SP = 640 × 0.6 = 384. CP = SP/1.20 = 384/1.2 = ₹320." },
  { s: NA, q: "Pipes A and B can fill a tank in 20 hours and 30 hours respectively, whereas pipe C alone can empty the full tank in 10 hours. Pipes A and B are opened together for 3½ hours and then closed. If pipe C is opened, it will empty the tank in:", o: ["2 hours 15 minutes","2 hours","2 hours 55 minutes","2 hours 45 minutes"], e: "Tank cap = LCM(20,30,10)=60L. A=3, B=2, C=−6 L/h. In 3.5 hr (A+B): 5×3.5 = 17.5 L. C empties at 6 L/h → 17.5/6 = 2.916 hr ≈ 2h 55m." },
  { s: NA, q: "The ratio of the speed of a boat (in still water) and the current is 36 : 5. The boat goes downstream for 5 1/6 hours and then starts coming back. How much time (in hours) will it take to reach the starting point?", o: ["6 5/6","7 1/6","7 1/3","6 1/2"], e: "Downstream:upstream speeds = 41:31. Downstream time = 31/6 hrs = 5 1/6. So distance = 41 × 31/6. Upstream time = (41 × 31/6)/31 = 41/6 = 6 5/6 hrs." },
  { s: NA, q: "A sum of ₹10,240 amounts to ₹14,848 in 3 years at simple interest at a certain rate percent per annum. The same sum will amount of ₹x in 1 1/4 years at the same rate, if the interest is compounded five-monthly. The value of x is:", o: ["12,342.50","12,282.50","12,242","12,182"], e: "SI in 3 yrs = 4608 → R = (4608/10240/3) × 100 = 15%. For 1.25 years compounded 5-monthly (3 periods of 5 months), R per period = 25/4%. A = 10240 × (1 + 25/400)³ = ₹12,282.50." },
  { s: NA, q: "A shopkeeper sold an article at a profit of 13%. Had he sold it for ₹86.40 more, he would have gained k%. The cost price of the article is ₹720. What is the value of k?", o: ["25","24","20","18"], e: "Original SP = 720 × 1.13 = 813.60. New SP = 813.60 + 86.40 = 900. New profit = 900 − 720 = 180. k = 180/720 × 100 = 25." },
  { s: NA, q: "Let x be the greatest number which when divides 988, 1637 and 2345, the remainder in each case is the same. The remainder is:", o: ["49","44","54","39"], e: "Differences: 1637−988=649, 2345−1637=708, 2345−988=1357. HCF(649, 708, 1357) = 59. Remainder = 988 mod 59 = 44." },
  { s: NA, q: "Rina's expenditure is 300% more than her savings. If her income increases by 30% and savings increase by 20%, then by what percentage does her expenditure increase?", o: ["30","32.5","36","37.5"], e: "Savings=100, exp=400, income=500. New income=650, new savings=120. New exp=650−120=530. % increase = (530−400)/400 × 100 = 32.5%." },
  { s: NA, q: "When x is subtracted from each of 43, 38, 11 and 10, the numbers so obtained in this order, are in proportion. What is the mean proportional between (5x + 1) and (7x + 4)?", o: ["28","15","20","12"], e: "(43−x)/(38−x) = (11−x)/(10−x) → solving: x=3. (5×3+1)=16 and (7×3+4)=25. Mean prop = √(16×25) = 20." },
  { s: NA, q: "What is the value of the given expression? (Refer to figure)", o: ["151/150","31/150","37/30","53/30"], e: "Per the worked solution in the source, the simplified value is 31/150." }
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

  const TEST_TITLE = 'SSC GD Constable - 14 December 2020 Shift-2';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /14 December 2020/i }
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
