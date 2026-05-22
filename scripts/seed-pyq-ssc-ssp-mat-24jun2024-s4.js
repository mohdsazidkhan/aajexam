/**
 * Seed: SSC Selection Post Phase XII 2024 (Matriculation Level) PYQ - 24 June 2024, Shift-4
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

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun24_2024_s4";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-mat-24jun2024-s4';

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

const F = '24-jun-2024-s4';

const IMAGE_MAP = {
  2:  { q: 'image3.jpeg', opts: ['image4.png','image5.png','image6.jpeg','image7.png'] },     // REA figure series
  3:  { q: 'image8.jpeg', opts: ['image9.jpeg','image10.jpeg','image11.jpeg','image12.jpeg'] }, // REA mirror
  51: { q: '', opts: ['image14.png','image15.png','image16.png','image17.png'] },               // QA spheres SA ratio
  74: { q: 'image18.jpeg', opts: ['','','',''] },                                                // QA image-based
  75: { q: '', opts: ['image19.jpeg','image20.jpeg','image21.jpeg','image22.jpeg'] }            // QA cylinder vol fraction
};

const KEY = [
  // REA (1-25)
  3, 3, 3, 2, 2,   4, 2, 2, 4, 2,   4, 1, 1, 3, 1,   2, 4, 1, 4, 2,   3, 4, 2, 3, 1,
  // GA (26-50)
  4, 3, 1, 4, 3,   4, 1, 3, 4, 2,   1, 4, 3, 1, 4,   1, 2, 2, 2, 4,   4, 2, 4, 1, 3,
  // QA (51-75)
  3, 4, 3, 4, 1,   1, 1, 1, 1, 4,   3, 2, 3, 4, 2,   4, 3, 2, 3, 1,   3, 1, 1, 4, 4,
  // ENG (76-100)
  4, 1, 2, 4, 3,   3, 3, 1, 2, 4,   2, 4, 3, 3, 4,   1, 1, 1, 1, 3,   4, 2, 4, 1, 2
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "What will come in the place of '?' in the following equation, if '+' and '−' are interchanged and also '×' and '÷' are interchanged?\n\n13 ÷ 8 − 96 × 6 + 17 = ?", o: ["107","114","103","98"], e: "After swap: 13 × 8 + 96 ÷ 6 − 17 = 104 + 16 − 17 = 103. Option 3." },
  { s: REA, q: "Identify the figure given in the options which when put in place of ? will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3." },
  { s: REA, q: "In a certain code language, 'GOLIATH' is coded as '216' and 'DYNAMIC' is coded as '207'. How will 'CURRANT' be coded in that language?", o: ["168","285","148","235"], e: "Per docx answer key, option 2 (285)." },
  { s: REA, q: "In this question, three statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follows/follow from the statements.\n\nStatements:\nAll apples are bees.\nSome apples are cannons.\nNo cannon is a dear.\n\nConclusions:\nI. Some cannons are bees.\nII. No dear is an apple.", o: ["Neither conclusion I nor II follows","Only conclusion I follows","Only conclusion II follows","Both conclusions I and II follow"], e: "Some apples are cannons + all apples are bees → some cannons are bees (I follows). 'No cannon is dear' doesn't translate to 'no apple is dear' since not all apples are cannons. Option 2." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nGLOBAL : HNRAYI :: HONEST : IQQDQQ :: ITSELF : ?", o: ["JVVDKC","JVUDJC","JVVEJC","JVVDJC"], e: "Per docx answer key, option 4 (JVVDJC)." },
  { s: REA, q: "In a certain code language, 'BOOK' is coded as 'DMRH' and 'WELL' is coded as 'YCOI'. How will 'TREE' be coded in the same language?", o: ["VSHC","VPHB","UPHC","UQHB"], e: "Per docx answer key, option 2 (VPHB)." },
  { s: REA, q: "In a certain code language,\n'A + B' means 'A is the daughter of B', 'A − B' means 'A is the husband of B', 'A × B' means 'A is the mother of B' and 'A ÷ B' means 'A is the father of B'.\nHow is D related to B if A ÷ B − C + D × E?", o: ["Mother","Wife's mother","Wife","Daughter's husband"], e: "A is father of B; B is husband of C; C is daughter of D; D is mother of E. So D is the mother of C, who is wife of B → D is B's wife's mother. Option 2." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\nJJ_K_LM_N_ _ O _ _ Q _ R _", o: ["IJKLMNOPQ","KLNOPPQRS","JKNNOOPRR","KLMNOPPQR"], e: "Per docx answer key, option 4 (KLMNOPPQR)." },
  { s: REA, q: "Select the numbers from among the given options that can replace the question marks (?) in the following series.\n6, 7, 16, 41, ?, ?, 292", o: ["95, 180","90, 171","115, 240","100, 220"], e: "Pattern: ×1+1, ×2+2, ×2+9?, ... Per docx answer key, option 2 (90, 171)." },
  { s: REA, q: "Which option represents the correct order of the given words as they would appear in an English dictionary?\n1. Illustrate\n2. Illustration\n3. Illustrator\n4. Illuminate\n5. Illumination", o: ["5, 4, 1, 2, 3","4, 1, 5, 2, 3","4, 5, 2, 1, 3","4, 5, 1, 2, 3"], e: "Illuminate(4), Illumination(5), Illustrate(1), Illustration(2), Illustrator(3) → 4,5,1,2,3. Option 4." },
  { s: REA, q: "In a certain code language, 'careful emotion' is coded as 'du yu', 'sun key' is coded as 'bin fin', 'careful sun' is coded as 'du bin' and 'emotion key' is coded as 'yu fin'. What is the code word for 'sun'?", o: ["bin","fin","yu","du"], e: "From 'sun key'='bin fin' and 'careful sun'='du bin' and 'careful emotion'='du yu' → careful=du, so sun=bin. Option 1." },
  { s: REA, q: "In a certain code language, 'PLAYER' is written as 'CNRSFZ' and 'LIQUID' is written as 'SKNEJV'. How will 'RECORD' be written in that language?", o: ["EGTESP","ETGPSP","ETGESP","EGTPES"], e: "Per docx answer key, option 1 (EGTESP)." },
  { s: REA, q: "In a certain code language,\n'C # D' means 'C is the father of D', 'C @ D' means 'C is the sister of D', 'C $ D' means 'C is the mother of D', 'C % D' means 'C is the brother of D'.\nBased on the above, how is S related to V if 'S % T @ U # V'?", o: ["Son","Father","Father's brother","Father's father"], e: "S is brother of T; T is sister of U; U is father of V → S is sibling of U → S is uncle (father's brother) of V. Option 3." },
  { s: REA, q: "Select the letter-cluster from among the given options that can replace the question mark (?) in the following series.\nOTE, PUF, QVG, RWH, ?", o: ["SXI","TVG","SWG","TXI"], e: "Each letter +1 per step. After RWH: SXI. Option 1." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\nS O _ T _ S _ F _ Y _ O F T _ _ O F T Y", o: ["SOTTYFS","FYOTSYS","YFOTSYT","OFSTYFO"], e: "Per docx answer key, option 2 (FYOTSYS)." },
  { s: REA, q: "In a certain code language, 'NORMAL' is written as 'LMPOCN' and 'PEOPLE' is written as 'NCMRNG'. How will 'MOMENT' be written in that language?", o: ["KNKGPU","KMKHPU","LMLGPV","KMKGPV"], e: "Per docx answer key, option 4 (KMKGPV)." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n1. Paragraph\n2. Letters\n3. Phrase\n4. Sentence\n5. Words", o: ["2, 5, 3, 4, 1","2, 5, 1, 3, 4","2, 5, 4, 3, 1","2, 3, 5, 1, 4"], e: "Letters → Words → Phrase → Sentence → Paragraph = 2,5,3,4,1. Option 1." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n(The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word.)\n\nCease : Desist :: Eradicate : ?", o: ["Restore","Replenish","Abstain","Destroy"], e: "Cease and desist are synonyms; eradicate ≈ destroy. Option 4." },
  { s: REA, q: "Following a certain logic, if 36 is related to 9 and 100 is related to 49, to which of the following is 225 related?", o: ["148","144","133","135"], e: "Pattern: (√n − 3)² → √36=6, (6−3)²=9 ✓; √100=10, (10−3)²=49 ✓; √225=15, (15−3)²=144. Option 2." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\nPTXL, OSWK, NRVJ, ?, LPTH", o: ["NQUI","MQVI","MQUI","MQUJ"], e: "Each letter −1 per step. After NRVJ: MQUI. Option 3." },
  { s: REA, q: "In a certain code language, 'right from wrong' is written as 'jn bh yt', and 'take the right' is coded as 'dn yt gd'. How will 'right' be coded in that language?", o: ["bh","jn","gd","yt"], e: "Common word 'right' shares common code 'yt'. Option 4." },
  { s: REA, q: "In a certain code language, 'ALPHA' is written as 'MBPBI' and 'GAMMA' is written as 'BHMBN'. How will 'LASER' be written as in that language?", o: ["BMSFS","BMSSF","BNSSF","BMFSS"], e: "Per docx answer key, option 2 (BMSSF)." },
  { s: REA, q: "Three statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nAll cobblers are masons.\nNo mason is an electrician.\nSome electricians are plumbers.\n\nConclusions:\nI. All plumbers can never be masons.\nII. At least some electricians are cobblers.", o: ["Neither Conclusion I nor II follows.","Both Conclusions I and II follow.","Only Conclusion I follows.","Only Conclusion II follows."], e: "Some plumbers are electricians (no overlap with masons) doesn't prove ALL plumbers ≠ masons (I doesn't follow). All cobblers are masons; no mason is electrician → no cobbler is electrician (II doesn't follow). Option 1." },
  { s: REA, q: "Which two numbers (not individual digits) should be interchanged to make the given equation correct?\n56 + (11 × 2) − (52 ÷ 4) + 16 = 76", o: ["56 and 52","16 and 11","52 and 16","2 and 4"], e: "Per docx answer key, option 1 (56 and 52). Swap → 52 + 22 − 14 + 16 = 76 ✓." },

  // ============ GA (26-50) ============
  { s: GA, q: "A plant cell wall is mainly composed of:", o: ["protein","lipid","starch","cellulose"], e: "Plant cell walls are mainly composed of cellulose. Option 4." },
  { s: GA, q: "Who is the first woman to lead Indian Army unit near China border in Ladakh?", o: ["Lt. Gen. Madhuri Kanitkar","Lt. Gen. Punita Arora","Colonel Geeta Rana","Colonel Shuchita Shekhar"], e: "Colonel Geeta Rana was the first woman to command an Indian Army unit near the China border in Ladakh. Option 3." },
  { s: GA, q: "One-third of the members of the State Legislature Council retire every ____ years.", o: ["second","fifth","fourth","sixth"], e: "1/3 of MLC members retire every 2 years. Option 1." },
  { s: GA, q: "In which of the following states is the Behdienkhlam festival celebrated in the month of July?", o: ["Bihar","Haryana","West Bengal","Meghalaya"], e: "Behdienkhlam is a Jaintia festival celebrated in Meghalaya. Option 4." },
  { s: GA, q: "Which of the following cities is called the Silicon Valley of India due to its prominence in the IT industry?", o: ["Dehradun","Hyderabad","Bengaluru","Gurugram"], e: "Bengaluru is the Silicon Valley of India. Option 3." },
  { s: GA, q: "Which author wrote the autobiography 'Baluta'?", o: ["Nirmal Verma","Teji Grover","Chitra Mudgal","Daya Pawar"], e: "'Baluta' is the Marathi Dalit autobiography by Daya Pawar. Option 4." },
  { s: GA, q: "Archaeological evidence of which of the following dance forms dating back to the 2nd century BC was found in the caves of Udayagiri and Khandagiri?", o: ["Odissi","Manipuri","Kathak","Kuchipudi"], e: "Hathigumpha inscription/Udayagiri-Khandagiri caves show Odissi-style sculptures. Option 1." },
  { s: GA, q: "What is the function of cytochrome P450?", o: ["Assimilation of medicines and xenobiotics","Hydrolysis of glucose","Detoxification of xenobiotics","ATP synthesis"], e: "Cytochrome P450 metabolises/detoxifies drugs and xenobiotics. Option 3." },
  { s: GA, q: "The Prevention of Seditious Meetings Act was passed in ____ by colonial Government.", o: ["1903","1898","1912","1907"], e: "The Prevention of Seditious Meetings Act was passed in 1907. Option 4." },
  { s: GA, q: "Which of the following oilfields is NOT located in Gujarat?", o: ["Nawagam","Naharkatiya","Kalol","Kosamba"], e: "Naharkatiya oilfield is in Assam, not Gujarat. Option 2." },
  { s: GA, q: "As of 1 March 2022, which of the following bills were passed in December 2021?", o: ["The Election Laws (Amendment) Bill, 2021","The Prohibition of Child Marriage (Amendment) Bill, 2021","The National Anti-Doping Bill, 2021","The Mediation Bill, 2021"], e: "Election Laws (Amendment) Bill passed Dec 2021. Option 1." },
  { s: GA, q: "The thermocline layer is the ____ layer of the ocean.", o: ["third","first","fourth","second"], e: "Thermocline is the second layer (below the mixed surface layer). Option 4." },
  { s: GA, q: "Which Mughal ruler's intervention in the succession and internal politics of the Rathor Rajputs of Marwar led to their rebellion?", o: ["Shah Jahan","Akbar","Aurangzeb","Babur"], e: "Aurangzeb's interference in the Marwar succession after Jaswant Singh's death triggered Rajput rebellion. Option 3." },
  { s: GA, q: "In which year was the 'Prime Minister Street Vendor's AtmaNirbhar Nidhi' (PM SVANidhi) scheme launched by the Government of India with the objective of providing an affordable working capital loan to street vendors to resume their livelihoods?", o: ["2020","2021","2019","2022"], e: "PM SVANidhi was launched in June 2020. Option 1." },
  { s: GA, q: "Which of the following politicians was conferred a Lifetime Achievement Honour in 2023 by the India-UK Achievers Honours in London for contribution to economic and political life?", o: ["VP Singh","M Venkaiah Naidu","Sushma Swaraj","Manmohan Singh"], e: "Dr. Manmohan Singh received the Lifetime Achievement Honour from India-UK Achievers Honours, 2023. Option 4." },
  { s: GA, q: "According to the 2011 census, the sex ratio (females per 1000 males) is ____.", o: ["943","923","900","912"], e: "Census 2011: 943 females per 1000 males. Option 1." },
  { s: GA, q: "Which law was studied in the year 1787, in which it was said that as the volume of a gas increases its absolute temperature, if its absolute temperature decreases, then its volume will decrease?", o: ["Avogadro's law","Charles's law","Dalton's law","Boyle's law"], e: "Charles's law (1787): V ∝ T at constant P. Option 2." },
  { s: GA, q: "In which year was the first Cricket World Cup held in India?", o: ["1979","1987","1975","1983"], e: "First World Cup held in India (co-host) was 1987 (Reliance World Cup). Option 2." },
  { s: GA, q: "Which of the following Acts provided the title of the Viceroy to the Governor-General of India?", o: ["Charter Act of 1833","Government of India Act, 1858","Regulating Act of 1773","Charter Act of 1853"], e: "The Government of India Act, 1858 conferred the title of Viceroy on the Governor-General. Option 2." },
  { s: GA, q: "With which field was Madhuri Barthwal associated?", o: ["Literature and education","Sports","Medicine","Music"], e: "Madhuri Barthwal is a renowned Indian folk musician. Option 4." },
  { s: GA, q: "What was the name of the first dynasty that ruled over Magadh kingdom?", o: ["Nanda dynasty","Mauryan dynasty","Shishunga dynasty","Haryanka dynasty"], e: "Haryanka dynasty (Bimbisara) was the first ruling dynasty of Magadha. Option 4." },
  { s: GA, q: "Which of the following articles guarantees the Right to Equality before the Law and the Right to Equal Protection of the Laws?", o: ["Article 15","Article 14","Article 17","Article 16"], e: "Article 14 guarantees equality before the law. Option 2." },
  { s: GA, q: "In which sport is a shuttlecock used?", o: ["Basketball","Football","Kabaddi","Badminton"], e: "Shuttlecock is used in Badminton. Option 4." },
  { s: GA, q: "Stupas are a symbol of which of the following religions?", o: ["Buddhism","Jainism","Hinduism","Sikhism"], e: "Stupas are Buddhist religious structures. Option 1." },
  { s: GA, q: "As per the Indian Constitution, the size of the Council of Ministers shall NOT exceed:", o: ["20 percent of total number of members of the House of the People","10 percent of total number of members of the House of the People","15 percent of total number of members of the House of the People","25 percent of total number of members of the House of the People"], e: "Article 75(1A): Council of Ministers ≤ 15% of Lok Sabha strength. Option 3." },

  // ============ QA (51-75) ============
  { s: QA, q: "If the volume of spheres are 27 : 8, then their ratio of surface areas is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "V ratio 27:8 → radius ratio ∛27 : ∛8 = 3:2. SA ratio = 3²:2² = 9:4. Per docx, option 3." },
  { s: QA, q: "The rice sold by a grocer contained 20% of low-quality rice. What quantity of good-quality rice should be added to 175 kg of mixed rice so that the percentage of low-quality rice remains 10%?", o: ["100 kg","150 kg","125 kg","175 kg"], e: "Low-quality rice = 0.2×175 = 35 kg. Let x = good rice added. 35/(175+x)=0.1 → 175+x=350 → x=175 kg. Option 4." },
  { s: QA, q: "In a constituency, the total number of people on the electoral roll was 2,75,000. Out of them, 90% cast their votes in an election and 15% of the votes cast were declared invalid. What was the number of valid votes cast?", o: ["2,10,325","2,10,425","2,10,375","2,10,275"], e: "Votes cast = 0.9×275000 = 247500. Valid = 0.85×247500 = 210375. Option 3." },
  { s: QA, q: "In how many years will Rs.2,500 invested at the rate of 12% per annum, simple interest, amount to Rs.3,700?", o: ["2","5","3","4"], e: "SI = 3700−2500 = 1200. T = 1200×100/(2500×12) = 4 years. Option 4." },
  { s: QA, q: "The marked price of an item was ₹12,500. Two successive discounts of 12% each was offered on its sale. What was the selling price (in ₹) of the item?", o: ["9680","9720","9620","9500"], e: "SP = 12500×0.88×0.88 = 9680. Option 1." },
  { s: QA, q: "If a 9-digit number 937X728Y6 is divisible by 72, then one of the possible values of X + Y is:", o: ["12","5","8","9"], e: "Per docx answer key, option 1 (12)." },
  { s: QA, q: "The difference between the cost price and the selling price of a table lamp is ₹540. If the profit is 30%, then the selling price (in ₹) is:", o: ["2,340","2,150","2,800","2,280"], e: "Profit = 30% of CP = 540 → CP = 1800. SP = 1800+540 = 2340. Option 1." },
  { s: QA, q: "Shyam bought a chair for ₹1,563 and spent ₹350 on its repairing. He sold it for ₹2,398. Find his profit percentage (correct to two places of decimals).", o: ["25.35%","42.35%","52.55%","35.55%"], e: "Total CP = 1913. Profit = 485. % = 485/1913×100 ≈ 25.35%. Option 1." },
  { s: QA, q: "There are two types of rice. Type 1 rice costs ₹20 per kg and type 2 rice costs ₹25 per kg. Both the rice are mixed in the ratio 2 : 3. Find the cost (in ₹) of the mixed rice per kg.", o: ["23","23.50","22","22.50"], e: "Cost = (2×20+3×25)/5 = (40+75)/5 = 23. Option 1." },
  { s: QA, q: "A group of men decided to complete a job in 4 days. However, since 10 men dropped out every day, the job got completed at the end of the 7th day. How many men were there in the beginning?", o: ["35","140","90","70"], e: "Let initial men = n. Work = 4n. Sum over 7 days = n + (n−10) + (n−20) + ... = 7n − 10(0+1+...+6) = 7n − 210. So 7n−210 = 4n → n=70. Option 4." },
  { s: QA, q: "The annual instalment (in ₹) to discharge a debt of ₹8,432 due in 4 years at 16% simple interest per annum is:", o: ["2,204","1,527","1,700","2,108"], e: "Per docx answer key, option 3 (1,700)." },
  { s: QA, q: "The average cost of a pencil is ₹8 and the average cost of an eraser is ₹4. The cost of 8 erasers, 4 pencils and 12 sharpeners are ₹148. The average cost of a sharpener is ₹ ___.", o: ["6","7","6.66","6.5"], e: "Erasers 32 + pencils 32 + sharpeners 12s = 148 → 12s = 84 → s = 7. Option 2." },
  { s: QA, q: "A policeman chases a thief. The speed of the policeman and thief are 18 km/h and 6 km/h, respectively. If the policeman started 10 minutes late, at what distance will he catch the thief?", o: ["2.0 km","1.0 km","1.5 km","2.5 km"], e: "Thief head start = 6×(10/60) = 1 km. Relative speed = 12 km/h. Catch time = 1/12 h = 5 min. Policeman distance = 18×(5/60) = 1.5 km. Option 3." },
  { s: QA, q: "Akshara scores 85% in five subjects together. The subjects are Hindi, Science, Mathematics, English and Computers, where the maximum marks of each subject are 100. Akshara scores 75 marks in Hindi, 92 marks in Computers, 89 marks in Mathematics, and 81 marks in English. How many marks did Akshara score in Science?", o: ["92","73","67","88"], e: "Total = 0.85×500 = 425. Known = 75+92+89+81 = 337. Science = 425−337 = 88. Option 4." },
  { s: QA, q: "A packet has to consist of three types of jellies – orange, mango and strawberry. The price per unit of orange, mango and strawberry jelly is ₹2.00, ₹3.00 and ₹3.50, respectively. In a packet, there are 80 orange jellies, 50 mango jellies and 120 strawberry jellies. What is the average cost (in ₹) of a jelly in a mixed packet?", o: ["2.80","2.92","3.02","2.96"], e: "Total cost = 80×2 + 50×3 + 120×3.5 = 160+150+420 = 730. Total jellies = 250. Avg = 730/250 = 2.92. Option 2." },
  { s: QA, q: "Find the third proportional to 6 and 24.", o: ["15","12","24","96"], e: "Third proportional x: 6/24 = 24/x → x = 576/6 = 96. Option 4." },
  { s: QA, q: "A policeman spots a thief from a distance of 100 metres. When he starts running after the thief, the thief starts running as well. How far will the thief have to run before being overtaken if his speed is 8 km/h and the policeman's speed is 10 km/h?", o: ["430 metres","380 metres","400 metres","415 metres"], e: "Relative speed = 2 km/h. Time to close 100 m = 0.1/2 = 0.05 h. Thief distance = 8×0.05 = 0.4 km = 400 m. Option 3." },
  { s: QA, q: "Ram, standing on a railway platform, noticed that a train took 36 seconds to completely pass through the platform, which was 108 m long, and it took 12 seconds in passing him. Find the speed of the train.", o: ["20.2 km/h","16.2 km/h","25.2 km/h","18.2 km/h"], e: "Let train length L. L/12 = (L+108)/36 → 3L = L+108 → L=54. Speed = 54/12 = 4.5 m/s = 16.2 km/h. Option 2." },
  { s: QA, q: "A chair is bought for ₹600 and sold for ₹750. Find the profit percentage.", o: ["35%","30%","25%","20%"], e: "Profit% = 150/600×100 = 25%. Option 3." },
  { s: QA, q: "The marked price of a commodity was given as ₹425 per kg. After two successive discounts of 5% and y%, respectively, the retailer purchased it for ₹323 per kg. What was the value of y?", o: ["20","19","18","24"], e: "After 5%: 425×0.95 = 403.75. 403.75×(1−y/100) = 323 → 1−y/100 = 0.8 → y = 20. Option 1." },
  { s: QA, q: "If a number is divisible by both 11 and 13, then it must be:", o: ["divisible by (11+13)","divisible by 42","divisible by (11×13)","divisible by (13−11)"], e: "Coprime → must be divisible by 11×13 = 143. Option 3." },
  { s: QA, q: "A man has to discharge a debt of ₹15,600 which is due in 3 years at 4% simple interest per annum. If he pays this amount in equal instalments of annual payment, find the amount for annual payment.", o: ["₹5,000","₹5,200","₹5,100","₹5,400"], e: "Per docx answer key, option 1 (₹5,000)." },
  { s: QA, q: "Find the area shown in the figure.", o: ["924 ft²","922 ft²","926 ft²","928 ft²"], e: "Per docx answer key, option 1 (924 ft²)." },
  { s: QA, q: "In an election between two candidates, 75% of the voters cast their votes, out of which 2% of the votes were declared invalid. A candidate got 9,261 votes, which were 75% of the total valid votes. Find the total number of votes.", o: ["17,200","17,400","17,000","16,800"], e: "Valid votes = 9261/0.75 = 12348. Cast = 12348/0.98 = 12600. Total = 12600/0.75 = 16800. Option 4." },
  { s: QA, q: "The volume of a right circular cylinder of base radius r is obtained by multiplying its curved surface area by:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "V = πr²h, CSA = 2πrh → V/CSA = r/2. Multiplier = r/2. Per docx, option 4." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Violation","Extinguish","Amendment","Sovereignity"], e: "Correct spelling is 'Sovereignty'. Option 4." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\n\nHe benevolently offered to drop me all the way home after the office party got over in the wee hours of the morning.", o: ["Unkindly","Selflessly","Humanely","Tenderly"], e: "Benevolently (kindly) ↔ Unkindly. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in reported speech.\n\n'Do you have a fair copy of this document?' The editor asked the reporter.", o: ["The editor asked the reporter whether he had had a fair copy of that document.","The editor asked the reporter whether he had a fair copy of that document.","The editor asked the reporter whether had he had a fair copy of that document.","The editor asked the reporter whether did he have a fair copy of that document."], e: "Indirect form retains statement order with backshift have→had. Option 2." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nInscription on a person's grave", o: ["Prologue","Epistle","Monograph","Epitaph"], e: "Epitaph = inscription on a grave. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nTeenu wrote a congratulatory letter.", o: ["A congratulatory letter written by Teenu.","A congratulatory letter had been written by Teenu.","A congratulatory letter was written by Teenu.","A congratulatory letter is written by Teenu."], e: "Past simple passive: 'was written by'. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nAddiction is a ____ process that requires the addict's friends and family's assistance at various addiction levels such as mentally, physically, psychologically, and emotionally.", o: ["abbreviated","condensed","protracted","curtailed"], e: "Addiction recovery is a long-drawn (protracted) process. Option 3." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\nEccentricity", o: ["Regularity","Jeopardy","Mannerism","Deception"], e: "Eccentricity ≈ Mannerism (peculiar habit). Option 3." },
  { s: ENG, q: "Select the MISSPELT word.", o: ["Assence","Escalade","Exhale","Ascend"], e: "Correct spelling is 'Essence'. Option 1." },
  { s: ENG, q: "Select the most appropriate option to fill in the blanks.\n\nWe have four seasons because the earth doesn't sit up straight; it's ____ on its axis. As it orbits the sun, the planet's slight slouch ____ more or less of the northern and southern hemisphere to the sun depending on the time of the year.", o: ["slanted; show","tilted; exposes","sloped; reveal","inclined; uncover"], e: "Earth is 'tilted' on its axis; this tilt 'exposes' hemispheres. Option 2." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\nImpediment", o: ["Benefit","Experiment","Pedestrian","Obstacle"], e: "Impediment ≈ Obstacle. Option 4." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\nControl", o: ["Embrace","Grip","Purchase","Fold"], e: "Control ≈ Grip. Option 2." },
  { s: ENG, q: "Select the MISSPELT word.", o: ["Logarithm","Library","Lexicon","Lagitimate"], e: "Correct spelling is 'Legitimate'. Option 4." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nStop beating around the bush and tell me what is expected out of me.", o: ["getting the conversation going","revealing a secret to everyone","avoiding to talk about the issue","misunderstanding the situation"], e: "'Beating around the bush' = avoiding the issue. Option 3." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom.\n\nShah called Saeed a hard nut to crack, and described him as cool, but intelligent.", o: ["Moderate person","Someone with good will","Someone who is difficult to deal with","Considerate person"], e: "Hard nut to crack = someone difficult to deal with. Option 3." },
  { s: ENG, q: "Select the most appropriate synonym of the underlined word in the following sentence.\n\nThe new software offers a plethora of features to enhance productivity.", o: ["a shortage of","a consequence of","a scarcity of","an abundance of"], e: "Plethora = an abundance of. Option 4." },
  { s: ENG, q: "Read the Frozen Bird passage. Choose the word from the given options which fits in the blank labelled 1 and gives correct meaning.\n'the bird froze and ___1___ to the ground'", o: ["Fell","Soared","Rose","Went up"], e: "Frozen bird 'fell' to the ground. Option 1." },
  { s: ENG, q: "Read the Frozen Bird passage. Choose the word from the given options which fits in the blank labelled 2 and gives correct meaning.\n'While she was ___2___ there, a cow came by'", o: ["Lying","Napping","Sleeping","Walking"], e: "While 'lying' on the ground. Option 1." },
  { s: ENG, q: "Read the Frozen Bird passage. Choose the word from the given options which fits in the blank labelled 3 and gives correct meaning.\n'lay there in the ___3___ of cow dung'", o: ["Pile","Box","Row","Crowd"], e: "Pile of cow dung. Option 1." },
  { s: ENG, q: "Read the Frozen Bird passage. Choose the word from the given options which fits in the blank labelled 4 and gives correct meaning.\n'The dung was actually ___4___ her out!'", o: ["Thawing","Killing","Chilling","Drawing"], e: "Dung was 'thawing' her (warming her up). Option 1." },
  { s: ENG, q: "Read the Frozen Bird passage. Identify the phrasal verb which fits in the blank labelled as 5 and gives correct meaning.\n'A ___5___ cat heard the bird singing'", o: ["covered","hit","discovered","hid"], e: "Per docx answer key, option 3 (discovered)." },
  { s: ENG, q: "Read the Modhera Solar passage. Identify the most appropriate ANTONYM of the word 'ambitious'.", o: ["Mischievous","Impressive","Energetic","Unenthusiastic"], e: "Ambitious ↔ Unenthusiastic. Option 4." },
  { s: ENG, q: "Read the Modhera Solar passage. How many states met the RPO target in 2019-20?", o: ["Two","Four","Three","Five"], e: "Passage: 'only four states met their entire RPO target in 2019-20'. Option 2." },
  { s: ENG, q: "Read the Modhera Solar passage. Select the most appropriate title for the passage.", o: ["Thermal Electricity – Difficulties","The World in Danger Zone","Electricity and Private Companies","Renewable Energy – Moving Forward"], e: "Passage centred on renewable energy progress. Option 4." },
  { s: ENG, q: "Read the Modhera Solar passage. Select the correct full form of RPO?", o: ["Renewable Purchase Obligation","Review Public Obligations","Renewable Purchase Operations","Revenue Purchase Obligation"], e: "RPO = Renewable Purchase Obligation. Option 1." },
  { s: ENG, q: "Read the Modhera Solar passage. Identify the structure of the passage.", o: ["Narrative essay","Factual essay","Argumentative essay","Abstract essay"], e: "The passage provides facts about India's solar power; factual essay. Option 2." }
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
      tags: ['SSC', 'Selection Post', 'Phase XII', 'Matriculation', 'PYQ', '2024'],
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

  let exam = await Exam.findOne({ code: 'SSC-SSP-MAT' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC Selection Post (Matriculation Level)',
      code: 'SSC-SSP-MAT',
      description: 'Staff Selection Commission - Selection Post (Matriculation Level - 10th-pass eligibility)',
      isActive: true
    });
  }

  const PATTERN_TITLE = 'SSC Selection Post (Matriculation Level)';
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Matriculation) - 24 June 2024 Shift-4';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2024, pyqShift: 'Shift-4',
    pyqExamName: 'SSC Selection Post Phase XII (Matriculation)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
