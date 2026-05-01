/**
 * Seed: SSC GD Constable PYQ - 1 December 2020, Shift-1 (90 questions)
 * Source: Oswaal SSC Constable (GD) Year-wise Solved Papers (PDF, verified)
 *
 * Sections (per 2020 SSC GD Tier-I pattern):
 *   - General Knowledge & General Awareness : Q1-50  (50 Q)
 *   - General Intelligence & Reasoning      : Q51-75 (25 Q)
 *   - Numerical Ability                     : Q76-90 (15 Q)
 *
 * Computer Proficiency (10 Q) was dropped from this paper as it is no
 * longer asked. So the paper is 90 Q in total.
 *
 * Run with: node scripts/seed-pyq-ssc-gd-1dec2020-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC-GD-Constable/1-dec-2020/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-gd-1dec2020-s1';

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

const F = '1-dec-2020';
const IMAGE_MAP = {
  52: { q: `${F}-q-52.png`,
        opts: [`${F}-q-52-option-1.png`,`${F}-q-52-option-2.png`,`${F}-q-52-option-3.png`,`${F}-q-52-option-4.png`] },
  53: { q: `${F}-q-53.png`,
        opts: [`${F}-q-53-option-1.png`,`${F}-q-53-option-2.png`,`${F}-q-53-option-3.png`,`${F}-q-53-option-4.png`] },
  54: { q: `${F}-q-54.png` },
  55: { q: `${F}-q-55.png` },
  56: { q: `${F}-q-56.png`,
        opts: [`${F}-q-56-option-1.png`,`${F}-q-56-option-2.png`,`${F}-q-56-option-3.png`,`${F}-q-56-option-4.png`] },
  58: { q: `${F}-q-58.png` },
  60: { q: `${F}-q-60.png`,
        opts: [`${F}-q-60-option-1.png`,`${F}-q-60-option-2.png`,`${F}-q-60-option-3.png`,`${F}-q-60-option-4.png`] },
  61: { q: `${F}-q-61.png`,
        opts: [`${F}-q-61-option-1.png`,`${F}-q-61-option-2.png`,`${F}-q-61-option-3.png`,`${F}-q-61-option-4.png`] },
  62: { opts: [`${F}-q-62-option-1.png`,`${F}-q-62-option-2.png`,`${F}-q-62-option-3.png`,`${F}-q-62-option-4.png`] },
  65: { q: `${F}-q-65.png`,
        opts: [`${F}-q-65-option-1.png`,`${F}-q-65-option-2.png`,`${F}-q-65-option-3.png`,`${F}-q-65-option-4.png`] },
  66: { q: `${F}-q-66.png`,
        opts: [`${F}-q-66-option-1.png`,`${F}-q-66-option-2.png`,`${F}-q-66-option-3.png`,`${F}-q-66-option-4.png`] },
  68: { q: `${F}-q-68.png`,
        opts: [`${F}-q-68-option-1.png`,`${F}-q-68-option-2.png`,`${F}-q-68-option-3.png`,`${F}-q-68-option-4.png`] },
  69: { q: `${F}-q-69.png`,
        opts: [`${F}-q-69-option-1.png`,`${F}-q-69-option-2.png`,`${F}-q-69-option-3.png`,`${F}-q-69-option-4.png`] },
  70: { opts: [`${F}-q-70-option-1.png`,`${F}-q-70-option-2.png`,`${F}-q-70-option-3.png`,`${F}-q-70-option-4.png`] },
  73: { q: `${F}-q-73.png`,
        opts: [`${F}-q-73-option-1.png`,`${F}-q-73-option-2.png`,`${F}-q-73-option-3.png`,`${F}-q-73-option-4.png`] },
  75: { opts: [`${F}-q-75-option-1.png`,`${F}-q-75-option-2.png`,`${F}-q-75-option-3.png`,`${F}-q-75-option-4.png`] }
};

// 1-based answer key from the paper.
const KEY = [
  // 1-10 (GK)
  1,4,3,3,2, 3,1,4,1,2,
  // 11-20
  3,4,2,3,4, 3,1,4,3,3,
  // 21-30
  4,2,2,2,4, 4,1,4,4,1,
  // 31-40
  4,1,1,4,3, 1,3,1,3,4,
  // 41-50
  3,2,2,2,1, 4,4,4,4,2,
  // 51-60 (Reasoning)
  2,3,1,2,2, 3,1,3,4,3,
  // 61-70
  3,4,3,2,4, 1,1,2,1,2,
  // 71-75
  3,1,1,2,4,
  // 76-90 (Numerical Ability)
  2,1,1,2,2, 1,1,2,2,4, 1,1,3,3,2
];
if (KEY.length !== 90) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const GA  = 'General Knowledge & General Awareness';
const REA = 'General Intelligence & Reasoning';
const NA  = 'Numerical Ability';

const RAW = [
  // ============ General Knowledge & General Awareness (1-50) ============
  { s: GA, q: "As per the Union Budget 2020, which of the following taxes has been abolished?", o: ["Dividend distribution tax","Long term capital gains tax on securities","Securities transaction tax","Corporate tax"], e: "Union Budget 2020 abolished the Dividend Distribution Tax (DDT). Going forward, dividends are taxed in the hands of recipients." },
  { s: GA, q: "The microbes that lie on the borderline of the living and non-living world are called:", o: ["fungi","algae","bacteria","viruses"], e: "Viruses lie on the borderline of living and non-living — they cannot reproduce or carry out metabolism without a host cell." },
  { s: GA, q: "Which of the following Articles of the Constitution of India contains the directive that the State shall make provision for maternity relief?", o: ["Article 40","Article 39","Article 42","Article 41"], e: "Article 42 directs the State to secure just and humane conditions of work and provide maternity relief." },
  { s: GA, q: "Which of the following Articles of the Constitution of India prohibits the Indian State from conferring any title, except a military or academic distinction?", o: ["Article 15","Article 10","Article 18 (1)","Article 20"], e: "Article 18(1) abolishes titles other than military or academic distinctions." },
  { s: GA, q: "With which of the following states is the theatre form 'Maach' traditionally associated?", o: ["Kerala","Madhya Pradesh","Assam","Karnataka"], e: "'Maach' is a traditional folk theatre form of the Malwa region in Madhya Pradesh." },
  { s: GA, q: "Atanu Das, who was awarded the Arjuna Award 2020, is a professional player of:", o: ["wrestling","basketball","archery","badminton"], e: "Atanu Das is an Indian archer who received the Arjuna Award in 2020 for excellence in archery." },
  { s: GA, q: "Which of the following books was conferred the International Booker Prize 2020?", o: ["The Discomfort of Evening","The Enlightenment of the Greengage Tree","Hurricane Season","Tyll"], e: "Marieke Lucas Rijneveld's 'The Discomfort of Evening' (translated by Michele Hutchison) won the International Booker Prize 2020." },
  { s: GA, q: "Who among the following was appointed as the Chairperson of the Advisory Committee on Corporate Insolvency Resolution and Liquidation process in June 2020?", o: ["Kumar Mangalam Birla","Nandan Nilekani","Anand Mahindra","Uday Kotak"], e: "Uday Kotak, MD & CEO of Kotak Mahindra Bank, was appointed Chairperson of the Advisory Committee in June 2020." },
  { s: GA, q: "Which of the following states does NOT share its border with West Bengal?", o: ["Meghalaya","Assam","Jharkhand","Sikkim"], e: "West Bengal shares borders with Assam, Jharkhand, Sikkim, Bihar and Odisha — but NOT with Meghalaya." },
  { s: GA, q: "Who among the following has been selected for the 2020 World Food Prize?", o: ["Simon N Groot","Rattan Lal","Lawrence Haddad","MS Swaminathan"], e: "Indian-American soil scientist Dr. Rattan Lal received the 2020 World Food Prize for his soil-centred approach to food production." },
  { s: GA, q: "As per the new income tax regime announced in the Union Budget 2020, the tax rate for taxable income between ₹5 lakh to ₹7.5 lakh has been reduced to:", o: ["15%","5%","10%","20%"], e: "Under the new regime announced in Budget 2020, income between ₹5 lakh and ₹7.5 lakh is taxed at 10%." },
  { s: GA, q: "Which of the following modes of reproduction is carried out by specialised cells that proliferate to make a large number of cells?", o: ["Layering","Fission","Fragmentation","Regeneration"], e: "In regeneration, specialised blastema cells proliferate and differentiate to rebuild damaged or missing parts." },
  { s: GA, q: "Which of the following countries does tennis player Alexander Zverev represent?", o: ["Switzerland","Germany","The US","France"], e: "Alexander Zverev is a German professional tennis player." },
  { s: GA, q: "Which of the following rivers has Zaskar as one of its tributaries?", o: ["Yamuna","Ganga","Indus","Beas"], e: "The Zaskar River is a tributary of the Indus, joining it near Nimmu in Ladakh." },
  { s: GA, q: "The famous hill station named Mcleodganj is located in:", o: ["Ladakh","West Bengal","Uttarakhand","Himachal Pradesh"], e: "Mcleodganj, the residence of the 14th Dalai Lama, is a hill suburb of Dharamshala in Himachal Pradesh." },
  { s: GA, q: "As per the Census of India 2011, which of the following Union Territories is least densely populated as compared with the other three mentioned?", o: ["Chandigarh","Puducherry","Andaman & Nicobar Islands","Lakshadweep"], e: "Andaman & Nicobar (46/sq km) is least densely populated among Chandigarh (9258), Puducherry (3231) and Lakshadweep (2149)." },
  { s: GA, q: "In the Union Budget 2020, the Finance Minister announced the hike of bank deposit insurance from ______ to ₹5 lakh.", o: ["₹1 lakh","₹3 lakh","₹4 lakh","₹2 lakh"], e: "Bank deposit insurance was raised from ₹1 lakh to ₹5 lakh per depositor in Budget 2020." },
  { s: GA, q: "In 2020, the government of which of the following states instituted GV Raja Awards for sportspersons?", o: ["Telangana","Andhra Pradesh","Maharashtra","Kerala"], e: "Kerala government instituted the GV Raja Awards in 2020 to honour outstanding sportspersons." },
  { s: GA, q: "The painter Abdus Samad, the renowned painter of Iran, came to India on the invitation of:", o: ["Jahangir","Aurangzeb","Humayun","Akbar"], e: "Abdus Samad and Mir Sayyid Ali came to India on the invitation of Mughal emperor Humayun in the 16th century." },
  { s: GA, q: "Who is the author of the book titled 'RAW: A History of India's Covert Operations'?", o: ["Bijal Vachharajani","Neena Rai","Yatish Yadav","Nirupama Yadav"], e: "Yatish Yadav authored 'RAW: A History of India's Covert Operations'." },
  { s: GA, q: "The unit of calorific value of a fuel is expressed as:", o: ["psi","micron","mmHg","kJ/kg"], e: "Calorific value (heat released per unit mass of fuel) is measured in kJ/kg." },
  { s: GA, q: "In India, the custodian of foreign exchange reserves of the country is:", o: ["Union Cabinet","Reserve Bank of India","State Bank of India","Union Finance Ministry"], e: "The Reserve Bank of India is the custodian of India's foreign exchange reserves." },
  { s: GA, q: "In which of the following soil types is the proportion of fine particles relatively higher than big particles?", o: ["Sandy soil","Clayey soil","Black soil","Loamy soil"], e: "Clayey soil has a higher proportion of fine clay particles, giving it a fine texture and high water-retention capacity." },
  { s: GA, q: "In which of the following states are the Barabar Caves located?", o: ["Gujarat","Bihar","Madhya Pradesh","Maharashtra"], e: "The Barabar Caves, the oldest surviving rock-cut caves in India (Mauryan era), are in Bihar's Jehanabad district." },
  { s: GA, q: "Till 31 August 2020, the number of sportspersons awarded the Bharat Ratna was:", o: ["four","two","three","one"], e: "As of 31 August 2020, only one sportsperson — Sachin Tendulkar (2014) — had been awarded the Bharat Ratna." },
  { s: GA, q: "Who among the following was the author of the ancient text called 'Siddhant Shiromani'?", o: ["Aryabhatta","Mahaviracharya","Brahmagupta","Bhaskaracharya"], e: "'Siddhant Shiromani' was authored by Bhaskaracharya II in 1150 CE — a key Sanskrit treatise on astronomy and mathematics." },
  { s: GA, q: "Which of the following is a protein-digesting enzyme that is secreted in the small intestine?", o: ["Trypsin","Lipase","Pepsin","Bile"], e: "Trypsin, secreted by the pancreas in inactive form (trypsinogen) and activated in the small intestine, digests proteins into peptides and amino acids." },
  { s: GA, q: "Which of the following Articles of the Constitution of India specifies the right of minorities to establish and administer educational institutions?", o: ["Article 29","Article 27","Article 28","Article 30"], e: "Article 30(1) gives religious and linguistic minorities the right to establish and administer educational institutions." },
  { s: GA, q: "Which of the following is the largest river of Odisha?", o: ["Godavari","Tapi","Krishna","Mahanadi"], e: "The Mahanadi is the largest river of Odisha, draining into the Bay of Bengal." },
  { s: GA, q: "At US Open 2020, Indian player Rohan Bopanna paired with ______ for the Men's Doubles event.", o: ["Denis Shapovalov","Mate Pavic","Bruno Soares","Sumit Nagpal"], e: "Rohan Bopanna paired with Canadian Denis Shapovalov in the men's doubles at the 2020 US Open." },
  { s: GA, q: "To which of the following dynasties did the ruler Gautamiputra Satkarni belong?", o: ["Chalukya","Pallava","Shaka","Satavahana"], e: "Gautamiputra Satkarni was the most famous ruler of the Satavahana dynasty in ancient India." },
  { s: GA, q: "Which of the following is the earliest text containing the shlokas that were put to music?", o: ["Sama Veda","Sangeet Ratnakar","Meghaduta","Kamasutra"], e: "The Sama Veda is the oldest text where Vedic verses were set to music for chanting in religious rituals." },
  { s: GA, q: "The folk songs named 'Pankhida' traditionally belong to:", o: ["Rajasthan","Chhattisgarh","Odisha","Kashmir"], e: "'Pankhida' is a traditional folk song form of Rajasthan, sung on cultural and festive occasions." },
  { s: GA, q: "Who among the following propounded the philosophy of 'Ashtangika marga' (the Eightfold Path)?", o: ["Shankaracharya","Mahavir Swami","Ramanuja","Gautam Buddha"], e: "The Ashtangika Marga (Eightfold Path) is the core ethical-mental framework of Buddhism, taught by Gautama Buddha." },
  { s: GA, q: "As on 31 August 2020, who among the following was the Member-Secretary of the Economic Advisory Council to the Prime Minister?", o: ["Bibek Debroy","Ashima Goyal","Ratan P Watal","Sajjid Chinoy"], e: "Ratan P. Watal was the Member-Secretary of the Economic Advisory Council to the PM as of 31 Aug 2020." },
  { s: GA, q: "Which of the following cities has an astronomical observatory constructed under the patronage of Sawai Jai Singh?", o: ["Varanasi","Prayagraj","Agra","Bharatpur"], e: "Sawai Jai Singh II built five Jantar Mantar observatories — Jaipur, Mathura, Delhi, Ujjain and Varanasi. Among the listed options, Varanasi is correct." },
  { s: GA, q: "In which of the following states are Dafla Hills mainly spread?", o: ["Odisha","Jharkhand","Arunachal Pradesh","West Bengal"], e: "The Dafla Hills, part of the Eastern Himalayas, are spread mainly across Arunachal Pradesh." },
  { s: GA, q: "In the Union Budget 2020, the Finance Minister projected that Indian farmers' income would double by the year:", o: ["2022","2025","2023","2024"], e: "Union Budget 2020 reaffirmed the goal of doubling Indian farmers' income by 2022." },
  { s: GA, q: "In which year was the 9th Schedule added to the Constitution of India?", o: ["1954","1953","1951","1952"], e: "The 9th Schedule was added in 1951 through the First Amendment Act to protect certain laws from judicial review." },
  { s: GA, q: "In which part of Ashoka's empire were his inscriptions written in Kharosthi script?", o: ["North Eastern","Central","Southern","North Western"], e: "Ashoka's Kharosthi-script inscriptions were found in the North-Western part of his empire (modern Pakistan and Afghanistan)." },
  { s: GA, q: "The gigantic statue of Gautam Buddha, discovered at Sultanganj (near Bhagalpur in Bihar), has been dated to the ______ period.", o: ["Shunga","Nanda","Gupta","Maurya"], e: "The Sultanganj Buddha (a 2.3 m copper statue) dates back to the Gupta period (c. 500–700 CE)." },
  { s: GA, q: "In how many books is 'Akbar Nama', written by Abul Fazal, divided?", o: ["Five","Three","Two","Four"], e: "'Akbar Nama' is divided into three books — Book 1 (Akbar's ancestors), Book 2 (events of his reign), and Book 3 (the Ain-i Akbari)." },
  { s: GA, q: "Which of the following amendments to the Constitution of India is also referred to as the 'mini Constitution'?", o: ["38th Amendment","42nd Amendment","35th Amendment","40th Amendment"], e: "The 42nd Amendment (1976) is called the 'Mini Constitution' due to its sweeping changes to the Constitution." },
  { s: GA, q: "Who among the following Indians is known for his exemplary contribution in the field of mathematics?", o: ["JC Bose","S Ramanujan","CV Raman","VA Sarabhai"], e: "Srinivasa Ramanujan (1887–1920) made groundbreaking contributions to number theory, mathematical analysis and infinite series." },
  { s: GA, q: "In which year was the monopoly of the British East India Company on trade with India broken by a legislation?", o: ["1813","1807","1858","1825"], e: "The Charter Act of 1813 broke the East India Company's monopoly on trade with India (except in tea and trade with China)." },
  { s: GA, q: "At which of the following places did the Buddhist event known as 'Dhammachakkapavattan' take place?", o: ["Lumbini","Kushinagar","Bodh Gaya","Sarnath"], e: "Buddha delivered his first sermon ('Dhammachakkapavattana') at Sarnath, near Varanasi." },
  { s: GA, q: "Which of the following does NOT have specialized tissue for the conduction of water?", o: ["Grass","Ipomoea","Paphiopedilum","Funaria"], e: "Funaria is a moss (bryophyte) and lacks specialized vascular tissues (xylem) for water conduction." },
  { s: GA, q: "Which of the following is among the industries used for calculating the Index of Eight Core Industries in India?", o: ["Aluminium","Copper","Textile","Refinery products"], e: "The Eight Core Industries include coal, crude oil, natural gas, refinery products, fertilizers, steel, cement and electricity." },
  { s: GA, q: "In which of the following years was Article 21A inserted in the Constitution of India?", o: ["2006","2000","2004","2002"], e: "Article 21A, making free and compulsory education for children aged 6–14 a fundamental right, was inserted by the 86th Amendment Act, 2002." },
  { s: GA, q: "In August 2020, India and ______ were declared joint winners of the Chess Olympiad gold medal.", o: ["Australia","Russia","the US","New Zealand"], e: "India and Russia were declared joint winners of the 2020 FIDE Online Chess Olympiad after a server outage during the final." },

  // ============ General Intelligence & Reasoning (51-75) ============
  { s: REA, q: "'Thermometer' is related to 'Temperature' in the same way as 'Protractor' is related to '______'.", o: ["Weight","Angle","Mass","Height"], e: "A thermometer measures temperature; similarly, a protractor measures angles." },
  { s: REA, q: "Select the option that is related to figure C in the same way as figure B is related to figure A.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 follows the symmetry of A→B applied to C." },
  { s: REA, q: "Which figure will replace the question mark (?) to complete the pattern?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 completes the pattern." },
  { s: REA, q: "Three different positions of the same non-standard dice are shown. Which letter will be on the face opposite to the face with the letter 'T'?", o: ["E","G","F","R"], e: "Across the three positions, R is common; G, E, T, A are adjacent to R. Opposite pairs: G–T, E–A, R–F. So G is opposite to T." },
  { s: REA, q: "In the Venn diagram, the Rectangle represents Lady Teachers, the Triangle represents Chemistry Teachers, and the Circle represents Physics Teachers. The numbers in the diagram represent the number of persons in each category. What is the count of lady teachers who do NOT teach Physics?", o: ["17","28","21","7"], e: "Lady teachers in the rectangle but outside the Physics circle = 21 + 7 = 28." },
  { s: REA, q: "Which figure will replace the question mark (?) in the following series?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 follows the figure-series pattern." },
  { s: REA, q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n\n7259 : 4154 :: 3852 : ?", o: ["4201","2401","2410","4210"], e: "Pattern: multiply first two digits, reverse, then multiply last two digits, reverse, and concatenate. 7×2=14→41, 5×9=45→54 → 4154. 3×8=24→42, 5×2=10→01 → 4201." },
  { s: REA, q: "Three different positions of the same non-standard dice are shown. Which number will be on the face opposite to the face with the number '2'?", o: ["1","5","6","3"], e: "From the three views, 6 is common in two views and 3, 5, 1, 4 are adjacent to it. The remaining face 2 is opposite to 6 (the missing pair gives 6 opposite 2). Per the answer key, the answer is option 3." },
  { s: REA, q: "Which number will replace the question mark (?) in the following series?\n\n1, 5, 13, 29, ?, 125, 253, 509, 1021", o: ["57","88","75","61"], e: "Each term: previous + 2ⁿ. 1+4=5, 5+8=13, 13+16=29, 29+32=61, 61+64=125 ✓." },
  { s: REA, q: "Select the option figure in which the given figure is embedded (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 contains the embedded figure." },
  { s: REA, q: "Which figure will replace the question mark (?) to complete the pattern?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 3 completes the pattern." },
  { s: REA, q: "Select the Venn diagram that best illustrates the relationship between the following classes.\n\nCarnivore, Lion, Elephant", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "Lion is a carnivore; elephant is a herbivore (separate from carnivores). Per the answer key, diagram 4 fits — Lion ⊂ Carnivore, Elephant separate." },
  { s: REA, q: "Select the set in which the numbers are related in the same way as the numbers of the following set.\n\n(9, 6, 27)", o: ["(7, 5, 13)","(3, 2, 21)","(8, 6, 16)","(6, 4, 16)"], e: "Pattern: (1st − 2nd) × 1st = 3rd. (9−6)×9 = 27. (8−6)×8 = 16. So {8, 6, 16} matches." },
  { s: REA, q: "In a code language, PARROT is written as RLNMUI. How will CUCKOO be written in that language?", o: ["MGLYOV","MLGXOV","MLGYOV","MLGXQV"], e: "Per the answer key, applying the same encoding rule, CUCKOO is written as MLGXOV." },
  { s: REA, q: "A paper is folded and cut as shown. How will it appear when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 4 shows the correct unfolded shape." },
  { s: REA, q: "Select the option figure in which the given figure is embedded (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 contains the embedded figure." },
  { s: REA, q: "The distance between Surat and Ahmedabad is 280 km. Satish starts from Surat at 6:00 a.m. and drives at a constant speed of 50 km/h. After two hours he increases his speed to 60 km/h. At what time will he reach Ahmedabad?", o: ["11:00 a.m.","10:00 a.m.","10:30 a.m.","11:30 a.m."], e: "In 2 hrs at 50 km/h: 100 km. Remaining = 180 km at 60 km/h = 3 hrs. Total = 5 hrs from 6 a.m. → 11:00 a.m." },
  { s: REA, q: "Select the correct mirror image of the given figure when a vertical mirror is placed to the right of the figure.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror placed at the right flips left and right. Per the answer key, option 2 is correct." },
  { s: REA, q: "Select the option that is related to figure C in the same way as figure B is related to figure A.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 follows the same transformation as A→B applied to C." },
  { s: REA, q: "Three of the following four figures are alike in a certain way and one is different. Find the odd one.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Three figures share the same symbols/shapes pattern; option 2 differs — odd one out." },
  { s: REA, q: "Which number will replace the question mark (?) in the following series?\n\n21, 13, 33, 36, 67, 81, ?, 49, 102", o: ["96","64","24","100"], e: "Each term reversed and incremented: 21→12+1=13→reverse=31, +2=33→reverse=33, +3=36→reverse=63, +4=67→reverse=76, +5=81→reverse=18, +6=24. Hence 24." },
  { s: REA, q: "Three of the following four words are alike in a certain way and one is different. Find the odd one.", o: ["Retrench","Rejuvenate","Restore","Regenerate"], e: "Rejuvenate, Restore and Regenerate mean revival/renewal. Retrench means to reduce/cut down — odd one out." },
  { s: REA, q: "Which figure will replace the question mark (?) in the following series?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 1 follows the highlighted-parts increasing-by-1 pattern." },
  { s: REA, q: "Which two signs should be interchanged to make the given equation correct?\n\n42 − 23 + 870 ÷ 3 × 5 = 541", o: ["+ and −","× and ÷","− and ÷","+ and ÷"], e: "Interchanging × and ÷: 42 − 23 + 870 × 3 ÷ 5 = 42 − 23 + 522 = 541. ✓" },
  { s: REA, q: "Three of the following figures are alike in a certain way and one is different. Find the odd one out.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per the answer key, option 4 is the odd figure." },

  // ============ Numerical Ability (76-90) ============
  { s: NA, q: "What should be subtracted from 3 1/7 + 4 3/7 + 7/6 to make the number a whole number?", o: ["7/42","31/42","11/42","17/42"], e: "Sum = 22/7 + 31/7 + 7/6 = 53/7 + 7/6 = (53×6 + 7×7)/42 = (318+49)/42 = 367/42 = 8 + 31/42. Subtract 31/42 to get 8." },
  { s: NA, q: "The ratio of the price of two bicycles was 7 : 8. Two years later, the price of the first has risen by 30% and the price of the second increases by ₹1,500, then their prices are in the ratio 15 : 16. What is the original price (in ₹) of the second bicycle?", o: ["7,031.25","8,103.25","7,013.25","8,031.25"], e: "Let prices be 7x, 8x. (7x×1.3)/(8x+1500) = 15/16 → 145.6x = 120x + 22500 → x = 879.39... Per the worked solution, original price of 2nd = ₹7,031.25." },
  { s: NA, q: "A person invested ₹50,000, partly at 10% and the rest at 12% per annum at simple interest. At the end of two years, the total interest received was ₹11,640. How much is the first and the second part of the investment?", o: ["₹9,000; ₹41,000","₹31,000; ₹19,000","₹20,000; ₹30,000","₹10,000; ₹40,000"], e: "Per year interest = 5820 → effective rate = 11.64%. By alligation: 10% — 11.64% — 12%, ratio 0.36 : 1.64 = 9 : 41. So 50000×9/50 = 9000 at 10% and 41000 at 12%." },
  { s: NA, q: "The radii of two circles are 4 cm and 3 cm. What is the diameter (in cm) of the circle having an area equal to four times the sum of the area of the two circles?", o: ["12","20","24","10"], e: "Sum of areas = π(16+9) = 25π. New area = 4 × 25π = 100π → r²=100 → r=10. Diameter = 20 cm." },
  { s: NA, q: "In a two-digit number, the unit's digit exceeds its ten's digit by 4. If the product of the given number and the sum of its digits is 370, then what is the number?", o: ["62","37","26","73"], e: "Check 37: digits 3,7 (diff = 4 ✓); 37×(3+7) = 37×10 = 370 ✓." },
  { s: NA, q: "The length and breadth of a rectangular floor are 14.35 m and 11.55 m respectively. How many minimum number of square tiles would be required to cover it completely?", o: ["1353","1271","1107","1435"], e: "L=1435 cm, B=1155 cm. HCF = 35 cm. Tile side = 35 cm. Tiles = (1435×1155)/(35×35) = 1657425/1225 = 1353." },
  { s: NA, q: "A person travelled 120 km by steamer, 450 km by train and 60 km by horse. It took 13 hours 30 minutes. If the speed of the train is 3 times that of the horse and 1.5 times that of the steamer, then what is the speed (in km/h) of the steamer?", o: ["40","20","30","60"], e: "Let horse = x, train = 3x, steamer = 2x. 120/2x + 450/3x + 60/x = 13.5 → 60/x + 150/x + 60/x = 13.5 → 270/x = 13.5 → x = 20. Steamer = 2×20 = 40 km/h." },
  { s: NA, q: "A person spends 75% of his monthly income. If his income increases by 50% and the expenditure increases by 80%, then what is the percentage increase/decrease in his monthly savings?", o: ["Increase by 35%","Decrease by 40%","Increase by 25%","Decrease by 15%"], e: "Income=100, exp=75, savings=25. New income=150, new exp=135, new savings=15. % decrease in savings = (25−15)/25 × 100 = 40%." },
  { s: NA, q: "The difference between the selling prices with a discount of 32% and two successive discounts of 20% and 12% is ₹36. What is the marked price (in ₹) of the article?", o: ["1,250","1,500","2,000","1,800"], e: "Two successive discounts of 20% and 12% = 20+12 − (20×12)/100 = 29.6%. Difference = (32% − 29.6%) of MP = 2.4% × MP = 36 → MP = ₹1500." },
  { s: NA, q: "A library has an average of 502 visitors on Sundays, 475 on Saturdays and 340 on weekdays. What is the average number of visitors per day in a month of 30 days beginning with a Sunday?", o: ["391","362","400","385"], e: "Sundays = 5×502 = 2510. Saturdays = 4×475 = 1900. Weekdays = 21×340 = 7140. Total = 11550. Avg = 11550/30 = 385." },
  { s: NA, q: "A group of men decided to do a work in 20 days, but five of them remained absent. If the rest of the group could complete the work in 24 days, then how many men were in the original group?", o: ["30","25","25","20"], e: "M × 20 = (M − 5) × 24 → 20M = 24M − 120 → 4M = 120 → M = 30." },
  { s: NA, q: "Rohit marks his goods at 30% above the cost price, and allows 13.5% discount. If he sells an article for ₹1,012.05, then what is the cost price (in ₹) of the article?", o: ["900","750","1,000","800"], e: "MP = 1.3×CP. SP = MP × 0.865 = 1.3×0.865 × CP = 1.1245 × CP = 1012.05 → CP = 900." },
  { s: NA, q: "The effective annual rate of interest corresponding to 12% per annum payable quarterly, is (correct to two decimal places):", o: ["13.25%","12.75%","12.55%","13.75%"], e: "Quarterly rate = 3%. Effective annual = (1.03)⁴ − 1 ≈ 0.1255 = 12.55%." },
  { s: NA, q: "A medicine-capsule is in the shape of a cylinder of diameter 0.8 cm with two hemispheres stuck to each end. The length of the entire capsule is 2 cm. What is the capacity (in cm³) of the capsule? (Use π = 22/7)", o: ["0.91","0.75","0.87","0.67"], e: "r = 0.4. Cylinder height = 2 − 2×0.4 = 1.2 cm. Vol = πr²h + (4/3)πr³ = (22/7)(0.16×1.2 + 4/3×0.064) ≈ 0.87 cm³." },
  { s: NA, q: "What percentage of 4.5 kg is 18 gm?", o: ["4%","0.4%","0.004%","0.04%"], e: "4.5 kg = 4500 g. % = 18/4500 × 100 = 0.4%." }
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

  // 2020 SSC GD Tier-I pattern: 50 GK + 25 Reasoning + 15 Numerical = 90 Q,
  // 180 marks (2 each), 60 min, 0.5 negative.
  // Computer Proficiency (10 Q) is dropped per the source PDF.
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

  const TEST_TITLE = 'SSC GD Constable - 1 December 2020 Shift-1';

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /1 December 2020/i }
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
    pyqShift: 'Shift-1',
    pyqExamName: 'SSC GD Constable',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
