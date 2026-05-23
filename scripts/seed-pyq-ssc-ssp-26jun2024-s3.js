/**
 * Seed: SSC Selection Post Phase XII 2024 (Graduate Level) PYQ - 26 June 2024, Shift-3
 * Section order: REA → GA → QA → ENG. Key decoded via brute-force 2-bullet removal (3 valid combos all converged).
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

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });

const EXTRACTED_DIR = "D:/Sazid/Github/aajexam/_extracted_jun26_2024_s3";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-26jun2024-s3';

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

const F = '26-jun-2024-s3';

const IMAGE_MAP = {
  9:  { q: 'image5.png', opts: ['image6.png','image7.png','image8.png','image9.png'] },           // REA embedded figure
  15: { q: 'image10.jpeg', opts: ['image11.jpeg','image12.jpeg','image13.png','image14.jpeg'] }, // REA mirror
  18: { q: 'image15.jpeg', opts: ['','','',''] },                                                  // REA dice
  24: { q: 'image16.png', opts: ['image17.png','image18.png','image19.png','image20.png'] },     // REA figure series
  57: { q: '', opts: ['image21.jpeg','image22.jpeg','image23.jpeg','image24.jpeg'] },              // QA Q7 SI rate image opts
  62: { q: 'image26.jpeg', opts: ['','','',''] },                                                  // QA Q12 image
  63: { q: 'image27.jpeg', opts: ['image28.png','image29.jpeg','image30.jpeg','image31.jpeg'] }, // QA Q13 image opts
  66: { q: 'image32.png', opts: ['','','',''] },                                                   // QA Q16 image
  70: { q: '', opts: ['image34.jpeg','image35.jpeg','image36.jpeg','image37.jpeg'] },              // QA Q20 image opts
  71: { q: 'image39.jpeg', opts: ['','','',''] },                                                  // QA Q21 image
  75: { q: 'image40.png', opts: ['image41.jpeg','image42.jpeg','image43.jpeg',''] }                // QA Q25 sin image opts
};

const KEY = [
  // REA (1-25)
  1, 2, 1, 2, 4,   1, 3, 2, 1, 2,   4, 4, 4, 4, 4,   4, 4, 2, 1, 3,   4, 1, 2, 3, 2,
  // GA (26-50)
  3, 1, 1, 2, 3,   2, 4, 2, 2, 2,   1, 2, 2, 3, 1,   1, 4, 2, 4, 1,   4, 2, 4, 2, 4,
  // QA (51-75)
  1, 4, 2, 3, 3,   3, 3, 2, 1, 4,   3, 1, 2, 2, 3,   3, 3, 3, 3, 2,   4, 1, 2, 2, 1,
  // ENG (76-100)
  4, 3, 3, 4, 4,   3, 2, 4, 3, 3,   4, 1, 1, 2, 4,   3, 4, 4, 1, 1,   4, 2, 2, 4, 1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ REA (1-25) ============
  { s: REA, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n552, ?, 650, 702, 756", o: ["600","590","625","576"], e: "Differences: +48, +50, +52, +54. So 552+48 = 600. Option 1." },
  { s: REA, q: "In a certain code language,\nA + B means 'A is the mother of B'\nA − B means 'A is the brother of B'\nA × B means 'A is the wife of B'\nA # B means 'A is the son of B'\nBased on the above, how is W related to P if 'W × V # T − R + P'?", o: ["Husband's father's sister's daughter","Mother's brother's son's wife","Mother's brother's son's mother","Mother's mother"], e: "Per docx answer key, option 2 (Mother's brother's son's wife)." },
  { s: REA, q: "If '+' means 'subtraction', '−' means 'multiplication', '×' means 'addition' and '÷' means 'division', then what is the value of the expression?\n22 − 4 + 72 ÷ 18 × 31", o: ["115","124","118","152"], e: "After swap: 22×4 − 72/18 + 31 = 88 − 4 + 31 = 115. Option 1." },
  { s: REA, q: "In a certain code language, 'MOBILES' is written as 'N12Y18O22H' and 'VEHICLE' is written as 'E22S18X15V'. How will 'NEUTRON' be written in the same code language?", o: ["M22G712M","M22F7I12M","M23F7L13M","M22F8L12M"], e: "Per docx answer key, option 2 (M22F7I12M)." },
  { s: REA, q: "Select the option that represents the letters that, when sequentially placed from left to right in the following blanks, will complete the letter series.\nZ__O __E __F _E M _F", o: ["EZFMOZMO","EOOFZMZM","EMZFMOZO","EMFZMOZO"], e: "Per docx answer key, option 4 (EMFZMOZO)." },
  { s: REA, q: "In a certain code language, 'he knows spanish' is coded as 'ty fr op' and 'spanish is difficult' is coded as 'fr hg df'. How will 'spanish' be coded in that language?", o: ["fr","hg","df","op"], e: "Common word 'spanish' shares common code 'fr'. Option 1." },
  { s: REA, q: "425 is related to 11 following a certain logic. Following the same logic, 482 is related to 14. Which of the following is related to 16 using the same logic?", o: ["284","282","286","280"], e: "Per docx answer key, option 3 (286)." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nEMAILS : VILXPB :: JOINED : GBQFRG :: MAKERS : ?", o: ["VOCHDJ","VOHHDJ","VOBHDJ","VOHHXJ"], e: "Per docx answer key, option 2 (VOHHDJ)." },
  { s: REA, q: "Select the option figure in which the given figure (X) is embedded as its part (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 1." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n(The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word)\n\nDermatologist : Skin :: Ophthalmologist : ?", o: ["Ears","Eyes","Bones","Teeth"], e: "Dermatologist treats skin; ophthalmologist treats eyes. Option 2." },
  { s: REA, q: "Select the combination of letters that when sequentially placed in the blanks of the given series, will complete the series.\nsr_ss_s_s_ss", o: ["srss","ssrs","rrss","srsr"], e: "Per docx answer key, option 4 (srsr)." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nUSA : Dollar :: Bangladesh : ?", o: ["Ruble","Lira","Rupee","Taka"], e: "Bangladesh's currency is Taka. Option 4." },
  { s: REA, q: "In a code language, 'MAINTY' is coded as 'SGOTZE' and 'GENIOUS' is coded as 'MKTOUAY'. How will 'POPULAR' be coded in the same language?", o: ["VUKARGX","KUUARGX","KUVARGX","VUVARGX"], e: "Per docx answer key, option 4 (VUVARGX)." },
  { s: REA, q: "Three statements followed by three conclusions.\nStatements:\nNo code is a knuckle.\nNo eel is a code.\nSome codes are bulldozers.\n\nConclusions:\n(I) Some bulldozers are codes.\n(II) Some bulldozers are not knuckles.\n(III) Some bulldozers are not eels.", o: ["Either I or III follows","Only II follows","Only I follows","All conclusions I, II and III follow"], e: "Some codes ∩ bulldozers; no code is knuckle/eel → those bulldozers are not knuckles/eels. All follow. Option 4." },
  { s: REA, q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 4." },
  { s: REA, q: "Select the option that indicates the correct arrangement of the given words in a logical and meaningful order.\n1. Rinse\n2. Iron\n3. Soak\n4. Dry\n5. Wash", o: ["3, 5, 1, 2, 4","5, 3, 1, 4, 2","3, 1, 5, 4, 2","3, 5, 1, 4, 2"], e: "Per docx answer key, option 4 (Soak→Wash→Rinse→Dry→Iron = 3,5,1,4,2)." },
  { s: REA, q: "Three statements followed by three conclusions.\nStatements:\nNo chess is a can.\nNot a single can is a horn.\nEvery horn is an adapter.\n\nConclusions:\nI. Some adapters which are horns are chess as well.\nII. No chess is a horn.\nIII. Some adapters are horns.", o: ["Either I or II follows","Both II and III follow","All follow","Only III follows"], e: "All horns are adapters → some adapters are horns (III ✓). 'No chess is can' + 'no can is horn' doesn't yield no chess is horn. Per docx, option 4." },
  { s: REA, q: "Six numbers 1, 2, 3, 4, 5 and 6 are written on different faces of a dice. Three different positions of the same dice are shown. Select the number on the face opposite to the one having 4.", o: ["3","5","1","6"], e: "Per docx answer key, option 2 (5)." },
  { s: REA, q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster.\n\nCOMBINE : MOCENIB :: FURTHER : RUFREHT :: REVERSE : ?", o: ["VERESRE","VEREERS","VERESER","VERSERE"], e: "Pattern: swap pairs of letters. REVERSE → VERESRE. Option 1." },
  { s: REA, q: "In a certain code language, 'BELO' is coded as '271217' and 'IGJA' is coded as '117103'. How will 'DUXE' be coded in that language?", o: ["325227","424268","423247","324246"], e: "Per docx answer key, option 3 (423247)." },
  { s: REA, q: "In a code language, 'ELASTCY' is coded as 'GNCSVEA' and 'VIRTUAL' is coded as 'XKTTWCN'. How will 'TANGLED' be coded in the same language?", o: ["VCPGMGF","VCPGMGE","VCQGNGF","VCPGNGF"], e: "Per docx answer key, option 4 (VCPGNGF)." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n1. Block\n2. Province\n3. District\n4. Country\n5. Street\n6. Village", o: ["5, 6, 1, 3, 2, 4","5, 6, 1, 2, 3, 4","5, 1, 6, 3, 2, 4","5, 6, 1, 3, 4, 2"], e: "Street(5)→Village(6)→Block(1)→District(3)→Province(2)→Country(4) = 5,6,1,3,2,4. Option 1." },
  { s: REA, q: "In a certain code language, 'YOUR' is coded as '6543' and 'LOAD' is coded as '3129'. What is the code for 'O' in that code language?", o: ["1","3","5","6"], e: "Per docx answer key, option 2 (3). Wait — but 'O' appears in both YOUR(5) and LOAD(1). Per docx, option 2." },
  { s: REA, q: "Identify the figure which when put in place of the question mark (?) will logically complete the series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 3." },
  { s: REA, q: "Pointing towards the photograph of a person, Saksham said, 'She is the only daughter of the only daughter of my father'. How is Saksham related to the person in the photograph?", o: ["Father","Mother's brother","Father-in-law","Grandfather"], e: "Father's only daughter = Saksham's sister. Her only daughter = niece (Saksham's niece). So Saksham is the niece's mother's brother. Option 2." },

  // ============ GA (26-50) ============
  { s: GA, q: "Which of the following is NOT among the commercial sources of energy?", o: ["Hydropower","Electricity","Fuel wood","Petroleum"], e: "Fuel wood is a non-commercial source. Option 3." },
  { s: GA, q: "Atmospheric temperature does NOT depend on _________.", o: ["salinity of oceans","altitude","distance from sea","latitude"], e: "Salinity of oceans does not affect atmospheric temperature directly. Option 1." },
  { s: GA, q: "________ is associated with the production and metabolism of fats and steroid hormones.", o: ["Smooth endoplasmic reticulum","Nucleus","Golgi apparatus","Mitochondrion"], e: "Smooth ER synthesises lipids and steroid hormones. Option 1." },
  { s: GA, q: "Who elects the Presiding Officer (the speaker) in the State legislature?", o: ["Chief Minister","Members of Vidhan Sabha","Member of Vidhan Parishad","Council of Ministers"], e: "MLAs (members of Vidhan Sabha) elect the Speaker. Option 2." },
  { s: GA, q: "Which ministry started the Pradhan Mantri Rojgar Protsahan Yojana?", o: ["Ministry of Rural Development","Ministry of Corporate Affairs","Ministry of Labour and Employment","Ministry of Home Affairs"], e: "PMRPY launched by Ministry of Labour and Employment. Option 3." },
  { s: GA, q: "Which of the following government schemes was launched to provide financial assistance to start-ups for proof of concept, prototype development, product trials, market entry and commercialisation on 19 April 2021?", o: ["Procurement and Marketing Support (PMS) Scheme","Start-up India Seed Fund Scheme (SISFS)","Pradhan Mantri Rozgar Yojana (PMRY)","Pradhan Mantri MUDRA Yojana (PMMY)"], e: "SISFS launched April 2021. Option 2." },
  { s: GA, q: "In which of the following dance forms is Mati-Akhora used as the basic exercise pattern that facilitates various dance poses?", o: ["Manipuri","Kathakali","Kuchipudi","Sattriya"], e: "Mati-Akhora is the foundational training of Sattriya dance. Option 4." },
  { s: GA, q: "Select the correct statement about climax community.", o: ["It is an ecological community in which populations of plants or animals, which are very unstable and exist for very few time.","It is an ecological community in which populations of plants or animals remain stable and exist in balance with each other and their environment.","It is a very first community of ecosystem.","It consist of only plant population that makes a new ecological system."], e: "Climax community = stable, balanced ecological community. Option 2." },
  { s: GA, q: "Select the INCORRECT statement from among the following.", o: ["'Dhamek Stupa' is situated in Uttar Pradesh.","'Piprahwa Stupa' is situated in Sikkim.","'Bavikonda Stupa' is situated in Andhra Pradesh.","'Sanchi Stupa' is situated in Madhya Pradesh."], e: "Piprahwa Stupa is in UP (Siddharthnagar district), not Sikkim. Option 2." },
  { s: GA, q: "Which of the following statements is/are true for the recipients of the Sangeet Natak Akademi Awards?\n1. Sonal Mansingh was elected as Fellow of Sangeet Natak Akademi in the year 2018.\n2. Jatin Goswami was elected as Fellow of Sangeet Natak Akademi in the year 2018.\n3. Radha Sridhar received the Sangeet Natak Akademi Award in the year 2018 for her contribution to Kathak.", o: ["Both 1 and 3","Both 1 and 2","Both 2 and 3","Only 3"], e: "Per docx answer key, option 2 (Both 1 and 2)." },
  { s: GA, q: "How many countries participated in the 2016 South Asian Games?", o: ["Eight","Five","Seven","Six"], e: "2016 South Asian Games had 8 participating nations. Option 1." },
  { s: GA, q: "Who among the following was conferred with the title of 'Khan-i-Khanan' under Akbar?", o: ["Todar Mal","Bairam Khan","Baz Bahadur","Abul Fazl"], e: "Bairam Khan held the title 'Khan-i-Khanan'. Option 2." },
  { s: GA, q: "What is the percentage of concession on fares provided to women on HRTC buses under the 'Nari ko Naman' scheme launched by the Chief Minister of Himachal Pradesh in 2022?", o: ["75%","50%","100%","25%"], e: "Nari ko Naman provides 50% concession to women on HRTC buses. Option 2." },
  { s: GA, q: "Which Article of the Indian Constitution mentions that the President is eligible for re-election?", o: ["Article 55","Article 56","Article 57","Article 54"], e: "Article 57 makes the President eligible for re-election. Option 3." },
  { s: GA, q: "Which of the following statements about the Kushana dynasty is INCORRECT?", o: ["The First Buddhist Council was organised by Kanishka.","Many Kushana rulers also adopted the title 'devaputra', or 'son of god'.","The Kushanas were a major ruling group in the post-Mauryan period.","Asvaghosha, the author of the Buddhacharita, was the court poet of Kanishka."], e: "Kanishka organised the Fourth Buddhist Council, not the First. Option 1." },
  { s: GA, q: "Who among the following is called 'father of Indian constitution'?", o: ["Bhim Rao Ambedkar","P Subbarayan","Rajendra Prasad","Gopinath Bordoloi"], e: "Dr. BR Ambedkar is the 'Father of the Indian Constitution'. Option 1." },
  { s: GA, q: "The novel 'The White Tiger' was written by:", o: ["Vikram Chandra","Indu Sundaresan","Amitav Ghosh","Aravind Adiga"], e: "'The White Tiger' (Booker Prize 2008) by Aravind Adiga. Option 4." },
  { s: GA, q: "Geologically, which of the following physiographic divisions of India is supposed to be one of the most stable land blocks?", o: ["The Himalayas","The Peninsular Plateau","The Northern Plains","The Indian Desert"], e: "The Peninsular Plateau (Indian Shield) is one of Earth's most stable land blocks. Option 2." },
  { s: GA, q: "Mahatma Gandhi National Rural Employment Guarantee Act (2005) provides work for how many days?", o: ["200","125","300","100"], e: "MGNREGA guarantees 100 days of wage employment per rural household per year. Option 4." },
  { s: GA, q: "Which of the following does NOT come under Directive Principles of State Policy?", o: ["Promotion of Indian Local Languages","Promotion of Cottage Industries","Promotion of the Welfare of the People","Uniform Civil Code"], e: "'Promotion of Indian Local Languages' isn't a DPSP per se. Option 1." },
  { s: GA, q: "Identify the Indian musician who is associated with wind instrument (played by blowing).", o: ["Pandit Ravi Shankar","Vishwa Mohan Bhat","Pandit Deen Dayal","Bismillah Khan"], e: "Bismillah Khan was a renowned shehnai (wind) maestro. Option 4." },
  { s: GA, q: "Which of the following statements best describes Le Chatelier's Principle?", o: ["A: Pressures of mixture = sum of partial pressures","C: Change in variables shifts equilibrium to counteract","B: Reaction rate ∝ concentration of reactants","D: Volume ∝ 1/pressure at constant T"], e: "Le Chatelier's principle: system at equilibrium responds to changes to counteract them. Option 2 (C)." },
  { s: GA, q: "Who among the following founded the Khudai Khidmatgars or the Red Shirts, a powerful non-violent movement?", o: ["Mahatma Gandhi","Subhas Chandra Bose","BR Ambedkar","Khan Abdul Ghaffar Khan"], e: "Khan Abdul Ghaffar Khan (Frontier Gandhi) founded Khudai Khidmatgar. Option 4." },
  { s: GA, q: "Who has taken the oath as the Chief Minister of Meghalaya in March 2023?", o: ["Prestone Tynsong","Conrad K Sangma","Sniawbhalang","Thomas A Sangma"], e: "Conrad Sangma sworn in as Meghalaya CM, March 2023. Option 2." },
  { s: GA, q: "The Ryotwari system, devised by Thomas Munro, in which peasant cultivators had to pay annual taxes directly to the government, was prevalent in which of the following present-day states/provinces?", o: ["Odisha","Punjab","Rajasthan","Tamil Nadu"], e: "Ryotwari was introduced in the Madras Presidency (Tamil Nadu). Option 4." },

  // ============ QA (51-75) ============
  { s: QA, q: "If * is a digit such that 7235*0 is divisible by 11, then the value of * is:", o: ["8","5","6","9"], e: "Alt sum: 7−2+3−5+*−0 = 3+* ; for ÷11 → *=8 (3+8=11). Option 1." },
  { s: QA, q: "XYZ is an isosceles triangle such that XY = XZ. It is given that YS ⊥ XZ and ZT ⊥ XY. What is the relation between YS and ZT?", o: ["YS > ZT","YS < ZT","YS = 2 ZT","YS = ZT"], e: "In isosceles triangle, altitudes to equal sides are equal. YS = ZT. Option 4." },
  { s: QA, q: "30 persons working 10 hours a day can do 5 units of work in 12 days. How many people are required to do 8 units of that work in 16 days if they work for 8 hours a day?", o: ["47","45","38","30"], e: "Work-rate: (P×H×D)/U: 30×10×12/5 = 720. Need P×8×16/8 = 720 → P = 720/16 × (8/8) = 45. Option 2." },
  { s: QA, q: "A dishonest dealer professes to sell grains at cost price, but he uses a weight of 925 g for 1 kg weight. Find his gain percentage. (Approximate to two decimals.)", o: ["8.5%","7.75%","8.11%","7.5%"], e: "Gain% = (true−false)/false × 100 = 75/925 × 100 ≈ 8.11%. Option 3." },
  { s: QA, q: "A stock portfolio consists of three stocks. Stock A represents 30% of the portfolio and has a return of 5%. Stock B represents 40% and 10%. Stock C represents 30% and 8%. What is the average return of the portfolio?", o: ["7.5%","7.2%","7.9%","8.1%"], e: "0.3×5 + 0.4×10 + 0.3×8 = 1.5 + 4 + 2.4 = 7.9%. Option 3." },
  { s: QA, q: "If 12 students can read 4800 pages of a book in 15 days, then how many students can read 7200 pages of the same book in 10 days?", o: ["33","24","27","30"], e: "Pages/student/day = 4800/(12×15) = 26.67. For 7200 in 10 days: 7200/(10×26.67) = 27. Option 3." },
  { s: QA, q: "An amount will be triple itself in 15 years at a certain rate of simple interest per annum. The rate of interest per annum is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Triple = P + SI = 3P → SI = 2P. R = 2×100/15 = 13.33%. Per docx, option 3." },
  { s: QA, q: "If the average score of a cricketer in three matches is 38 and in two other matches is 23, then what is the average score in all five matches?", o: ["34","32","36","30"], e: "Total = 3×38 + 2×23 = 114 + 46 = 160. Avg = 160/5 = 32. Option 2." },
  { s: QA, q: "On an item there is 8% discount on the marked price of ₹32,000. After giving an additional season's discount, the item is sold for ₹25,000. How much is the season's discount (in %)?", o: ["15.08%","14.08%","12.08%","13.08%"], e: "After 8%: 32000×0.92 = 29440. Season disc = (29440−25000)/29440 × 100 ≈ 15.08%. Option 1." },
  { s: QA, q: "On two items of equal prices, T gets 12% profit on one item and incurs 8% loss on other. What is his overall profit or loss percentage?", o: ["Profit, 4%","Loss, 4%","Loss, 2%","Profit, 2%"], e: "Equal prices: net = (12−8)/2 = 2% profit. Option 4." },
  { s: QA, q: "If a total of 900 kg of fruits were sold that week (pie chart of fruit yields), find the difference in sales (in kg) between oranges and grapes.", o: ["75","70","45","60"], e: "Per docx answer key, option 3 (45 kg)." },
  { s: QA, q: "Evaluate the given expression.", o: ["223","225","17","13"], e: "Per docx answer key, option 1 (223)." },
  { s: QA, q: "Evaluate the given expression.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 2." },
  { s: QA, q: "A thief steals an item and escapes, running at 13.5 km/h. A policeman arrives 8 minutes later and starts chasing. 28 minutes after the policeman started, there is still a gap of 540 m between them. At what distance from the spot would the policeman catch up, and what is his speed?", o: ["11.2 km, 16.4","10.8 km, 16.2","10.4 km, 16","12.96 km, 16.2"], e: "Per docx answer key, option 2 (10.8 km, 16.2)." },
  { s: QA, q: "Which of the following numbers is divisible by 8?", o: ["6006","6124","6816","5006"], e: "Last 3 digits div by 8: 816/8 = 102 ✓. Option 3." },
  { s: QA, q: "Evaluate the given expression.", o: ["9","4","6","8"], e: "Per docx answer key, option 3 (6)." },
  { s: QA, q: "The lengths of the three sides of a triangle are given as 3 cm, 4 cm and 5 cm. The ratio of their corresponding altitudes to the opposite vertices will be:", o: ["3:4:5","9:8:7","20:15:12","5:4:3"], e: "Altitude ∝ 1/side (Area constant). h₁:h₂:h₃ = 1/3 : 1/4 : 1/5 = 20:15:12. Option 3." },
  { s: QA, q: "A person spends 40% of his salary on food items, 50% of the remaining on transport, and 30% of the remaining on clothes. After spending on food, transport and clothes, he saves ₹1,260 every month. What is his monthly salary?", o: ["7,000","8,000","6,000","10,000"], e: "After food: 0.6S. After transport: 0.6×0.5×S = 0.3S. After clothes: 0.3×0.7×S = 0.21S = 1260 → S = 6000. Option 3." },
  { s: QA, q: "Vinod and Sanjay were fighting against each other for the post of a village Pradhan. Sanjay got 47.5% votes and lost the election by 270 votes. How many votes did Vinod get (assuming that all the villagers participated in the voting)?", o: ["2655","2565","2835","2385"], e: "(52.5−47.5)% × T = 270 → T = 270/0.05 = 5400. Vinod = 52.5% × 5400 = 2835. Option 3." },
  { s: QA, q: "Evaluate the given expression.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per docx answer key, option 2." },
  { s: QA, q: "Evaluate the given expression.", o: ["61000","62290","62000","61200"], e: "Per docx answer key, option 4 (61200)." },
  { s: QA, q: "The difference between the total surface area and lateral surface area of a cube, if side of the cube is 11 cm (in square cm), is _________.", o: ["242","244","241","243"], e: "TSA − LSA = 2×side² = 2×121 = 242. Option 1." },
  { s: QA, q: "Four distinct positive numbers, 'a', 'b', 'c' and 'd', in the order given, are in proportion. 'b' is 35 more than 'a' and 'd' is 60 more than 'c'. The product of 'a' and 'c' is 5376. What is the sum of 'a', 'b', 'c' and 'd'?", o: ["397","399","398","400"], e: "Per docx answer key, option 2 (399)." },
  { s: QA, q: "Evaluate the given expression.", o: ["92","94","91","97"], e: "Per docx answer key, option 2 (94)." },
  { s: QA, q: "If cos 2θ = 0, where θ is an acute angle, then find the value of sin(75° − θ).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "cos 2θ = 0 → 2θ = 90° → θ = 45°. sin(75°−45°) = sin 30° = 1/2. Per docx, option 1." },

  // ============ ENG (76-100) ============
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nIntelligible", o: ["Dispensable","Responsible","Impossible","Comprehensible"], e: "Intelligible ≈ Comprehensible (understandable). Option 4." },
  { s: ENG, q: "Select the most appropriate meaning of the following idiom.\nAt sixes and sevens", o: ["Heavy rains","Having dispute","In disorder","In happy mood"], e: "'At sixes and sevens' = in confusion/disorder. Option 3." },
  { s: ENG, q: "A word in the following sentence is INCORRECTLY spelt.\nFungal diseases in the lungs are often similar to other illnesses such as bacterial or viral pneumoniia", o: ["often","illnesses","pneumoniia","fungal"], e: "Correct spelling: 'pneumonia', not 'pneumoniia'. Option 3." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\nWe met a lot of people _______ our stay in Ahmedabad.", o: ["on","in","while","during"], e: "'During our stay' fits the temporal context. Option 4." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe arrangement of events or dates in the order of their occurrence.", o: ["Plutocracy","Topography","Allegory","Chronology"], e: "Chronology = events in order of occurrence. Option 4." },
  { s: ENG, q: "Parts of the following sentence have been given as options. Select the option that contains an error.\nGenerally, a cycle has an seat and handle along with two pedals and a bell, sometimes a carrier too.", o: ["with two pedals and","seat and handle along","Generally, a cycle has an","a bell, sometimes a carrier too."], e: "'An seat' is wrong — should be 'a seat'. Option 3." },
  { s: ENG, q: "Select the correct option to substitute the underlined segment in the given sentence.\nThe train left before I reached the station.", o: ["left before I have reached","had left before I reached","No substitution","left before I had reached"], e: "Past perfect for earlier action: 'had left before I reached'. Option 2." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\nThe question is being answered by Sherry.", o: ["Sherry answered the question.","The question was answered by Sherry.","The question was being answered by Sherry.","Sherry is answering the question."], e: "Present continuous active: 'is answering'. Option 4." },
  { s: ENG, q: "Select the option that correctly expresses the given sentence in direct speech.\nThe coach asked us when we were planning to begin practice.", o: ["\"When do you plan to begin practice?\", the coach asked us.","\"When did you planning to begin practice?\", the coach asked us.","\"When are you planning to begin practice?\", the coach asked us.","\"When will you to begin practice?\", the coach asked us."], e: "Direct from 'were planning' → 'are planning'. Option 3." },
  { s: ENG, q: "Select the most appropriate word opposite in meaning (ANTONYM) to the underlined word in the given sentence.\nHuman life is transient.", o: ["thrifty","timid","permanent","tranquil"], e: "Transient ↔ Permanent. Option 3." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\nLoathe", o: ["Love","Esteem","Dissipate","Hate"], e: "Loathe = Hate. Option 4." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\nLift the veil!", o: ["Let the veil be lifted!","Please let the veil be lifted now!","Let the veil had been lifted!","Let the veil have been lifted!"], e: "Imperative passive: 'Let the veil be lifted'. Option 1." },
  { s: ENG, q: "A word in the following sentence is INCORRECTLY spelt.\nIt's better to think about what you are doing right now--without worying about the unknown.", o: ["worying","without","about","better"], e: "Correct spelling: 'worrying'. Option 1." },
  { s: ENG, q: "Select the option that expresses the given sentence in indirect speech.\nThey said to him, \"Do not jump into the pond today.\"", o: ["They told him from jumping into the pond the same day.","They told him not to jump into the pond that day.","They told him to jump into the pond the previous day.","They told him not jumped into the pond that day."], e: "Indirect of negative imperative: 'not to jump ... that day'. Option 2." },
  { s: ENG, q: "Parts of the following sentence have been given as options. Select the option that contains an error.\nShe is enough wise not to interfere in their matter, once being insulted publicly by them.", o: ["their matter, once being","not to interfere in","insulted publicly by them.","She is enough wise"], e: "'Enough wise' is wrong — should be 'wise enough'. Option 4." },
  { s: ENG, q: "Read the Earth Globe passage. Select the most appropriate option to fill in blank number 1.\n'Can we see (1)________ the earth is a globe?'", o: ["whether","if","that","where"], e: "Per docx answer key, option 3 (that)." },
  { s: ENG, q: "Read the Earth Globe passage. Select the most appropriate option to fill in blank number 2.\n'we see that the ship begins (2)________'", o: ["to have disappeared","being disappeared","to be disappeared","to disappear"], e: "'Begins to disappear' is correct infinitive. Option 4." },
  { s: ENG, q: "Read the Earth Globe passage. Select the most appropriate option to fill in blank number 3.\n'sink lower and lower, (3)________ we can only see the top'", o: ["after","since","by the time","until"], e: "Per docx answer key, option 4 (until)." },
  { s: ENG, q: "Read the Earth Globe passage. Select the most appropriate option to fill in blank number 4.\n'(4)________ turn the orange away from you'", o: ["slowly","reluctantly","accidentally","passionately"], e: "Slowly turn the orange. Option 1." },
  { s: ENG, q: "Read the Earth Globe passage. Select the most appropriate option to fill in blank number 5.\n'You will see the pin disappear, (5)________ a ship does on the earth.'", o: ["just as","alike","by the way","the same"], e: "'Just as' fits comparison. Option 1." },
  { s: ENG, q: "Read the Judicial Activism passage. Select the most appropriate title of the passage.", o: ["The Constitutional Principles in India","The Role of the Supreme Court","The Preamble of India","The Debate over Judicial Activism"], e: "Passage discusses judicial activism debate. Option 4." },
  { s: ENG, q: "Read the Judicial Activism passage. Identify the central theme of the passage.", o: ["The evolution of governance in India","The role and impact of judicial activism in India","Division of power into executive, legislature and judiciary","The constitutional rights of judiciary in India"], e: "Central theme: role and impact of judicial activism. Option 2." },
  { s: ENG, q: "Read the Judicial Activism passage. What can be inferred about the Supreme Court's role in shaping laws?", o: ["It is solely responsible for legislative actions.","It has expanded the scope of constitutional principles.","It has no authority to check the executive branch.","It has a limited role in interpreting laws."], e: "Passage: 'court has expanded the scope of constitutional principles'. Option 2." },
  { s: ENG, q: "Read the Judicial Activism passage. Find the correct ANTONYM of the following word from the passage.\nProactive", o: ["Prompt","Provident","Accomplish","Careless"], e: "Proactive ↔ Careless. Option 4." },
  { s: ENG, q: "Read the Judicial Activism passage. According to the passage, what do critics argue regarding judicial activism?", o: ["It encroaches on the domains of other branches.","It is necessary for safeguarding democracy.","It has no impact on constitutional values.","It ensures a balanced exercise of power."], e: "Passage: critics argue 'excessive judicial intervention can encroach upon the domain of the other branches'. Option 1." }
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
  if (!category) category = await ExamCategory.create({ name: 'Central', type: 'Central', description: 'Central government competitive exams' });

  let exam = await Exam.findOne({ code: 'SSC-SSP' });
  if (!exam) exam = await Exam.create({ category: category._id, name: 'SSC Selection Post', code: 'SSC-SSP', description: 'Staff Selection Commission - Selection Post (Graduate, Higher Secondary, Matriculation Levels)', isActive: true });

  const PATTERN_TITLE = 'SSC Selection Post (Graduate Level)';
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

  const TEST_TITLE = 'SSC Selection Post Phase XII (Graduate) - 26 June 2024 Shift-3';
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
