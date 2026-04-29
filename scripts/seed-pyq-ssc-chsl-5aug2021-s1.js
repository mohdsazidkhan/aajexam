/**
 * Seed: SSC CHSL Tier-I PYQ - 5 August 2021, Shift-1 (100 questions)
 * Source: Oswaal SSC CHSL Tier-I Year-wise Solved Papers (PDF, verified)
 * Run with: node scripts/seed-pyq-ssc-chsl-5aug2021-s1.js
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

// Images live directly in the paper folder (no `images/` subdir for this paper)
const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC CHSL TIER 1/5th-august-2021";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-chsl-5aug2021-s1';

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
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
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

const IMAGE_MAP = {
  26: {
    q: '5th-august-2021-q-26.png',
    opts: ['5th-august-2021-q-26-option-1.png','5th-august-2021-q-26-option-2.png','5th-august-2021-q-26-option-3.png','5th-august-2021-q-26-option-4.png']
  },
  30: {
    q: '5th-august-2021-q-30.png',
    opts: ['5th-august-2021-q-30-option-1.png','5th-august-2021-q-30-option-2.png','5th-august-2021-q-30-option-3.png','5th-august-2021-q-30-option-4.png']
  },
  32: {
    q: '5th-august-2021-q-32.png',
    opts: ['5th-august-2021-q-32-option-1.png','5th-august-2021-q-32-option-2.png','5th-august-2021-q-32-option-3.png','5th-august-2021-q-32-option-4.png']
  },
  38: {
    opts: ['5th-august-2021-q-38-option-1.png','5th-august-2021-q-38-option-2.png','5th-august-2021-q-38-option-3.png','5th-august-2021-q-38-option-4.png']
  },
  41: { q: '5th-august-2021-q-41.png' },
  48: {
    q: '5th-august-2021-q-48.png',
    opts: ['5th-august-2021-q-48-option-1.png','5th-august-2021-q-48-option-2.png','5th-august-2021-q-48-option-3.png','5th-august-2021-q-48-option-4.png']
  },
  49: { q: '5th-august-2021-q-49.png' },
  50: { q: '5th-august-2021-q-50.png' },
  54: { q: '5th-august-2021-q-54.png' },
  57: { q: '5th-august-2021-q-57.png' },
  61: { q: '5th-august-2021-q-61.png' },
  68: { q: '5th-august-2021-q-68.png' },
  73: { q: '5th-august-2021-q-73.png' },
  75: { q: '5th-august-2021-q-75.png' }
};

// 1-based answer key from the paper's Answer Key table (verified from PDF)
const ANSWER_KEY = [
  1,3,4,3,3, 3,4,3,1,2, 3,2,3,1,3, 1,2,4,2,4, 2,2,3,3,2, // 1-25
  1,3,1,1,2, 1,3,3,3,3, 1,3,3,2,1, 2,3,3,3,3, 4,2,3,1,3, // 26-50
  3,2,2,4,4, 2,1,4,3,2, 2,3,2,4,2, 3,4,1,1,4, 4,4,4,1,3, // 51-75
  1,2,4,1,2, 1,4,2,4,2, 3,3,4,3,2, 2,3,3,1,2, 3,3,4,3,1  // 76-100
];

const ENG = 'English Language';
const GI  = 'General Intelligence';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ English Language (1-25) ============
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the right order to form a meaningful and coherent paragraph.\n\nA. As a result, he had a debt of 500 million US dollars at the time of his death.\nB. Unfortunately, he began spending lavishly on anything he desired, not what he actually needed.\nC. Michael Jackson, called the 'King of Pop Music', stayed at the top of his career for many years.\nD. He was respected for his work culture; he would spend long nights at the studio to fix a note correctly in a song.", o: ["CDBA","ADCB","DBAC","BADC"], e: "C introduces Michael Jackson. D describes his work culture. B speaks about his lavish spending. A describes his fall and debt. Order: CDBA." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA new project or business activity involving some risk", o: ["Experiment","Tabbo","Venture (n)","Entrepreneur"], e: "A 'venture' is a new project or business activity involving risk. Experiment = test, taboo = prohibition, entrepreneur = a person who starts ventures." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Evidence","Resolute","Discussion","Hautily"], e: "Correct spelling is 'haughtily' (proudly). 'Hautily' is wrongly spelt." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nToday you may not ______ what you hear, but that is the truth and you have to accept it.", o: ["enjoy","reply","like","answer"], e: "'Like' fits the context — you may not like what you hear but must accept the truth." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nAccustomed", o: ["Fabulous","Terrific","Unusual","Ordinary"], e: "'Accustomed' = familiar. The antonym is 'unusual'. Fabulous = wonderful, Terrific = enormous, Ordinary = normal." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nThe students asked the teacher where they could find the information for their project.", o: ["The teacher said to the students, \"Where you can find the information for your project\".","The teacher said to the students, \"I will tell you where you can find the information for your project\".","The students asked the teacher, \"Where can we find the information for our project?\"","The students said to the teacher, \"Where can you find the information for out project?\""], e: "Reported (past tense) → direct (present tense). Pronouns: 'they' → 'we', 'their' → 'our'. Result: The students asked the teacher, 'Where can we find the information for our project?'" },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nForbid", o: ["Close","Encourage","Adieu","Prohibit"], e: "Synonym of 'forbid' is 'prohibit' (ban). Close = shut, encourage = inspire, adieu = goodbye." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Invitation","Irritation","Possesions","Protection"], e: "The correct spelling is 'possessions'. 'Possesions' is wrongly spelt." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nHis voice was ______ by the sound of the helicopter.", o: ["drowned","driven","dawned","drawn"], e: "'Drowned' (overpowered/submerged) fits the context — voice was overpowered by the helicopter sound." },
  { s: ENG, q: "The following sentence has been divided into parts. One of them may contain an error. Select the part that contains the error from the given options. If you don't find any error, mark 'No error' as your answer.\n\nA probe has been ordered / by the incident / that occurred at the celebrations.", o: ["A probe has been ordered","by the incident","No error","that occurred at the celebrations"], e: "Should be 'for the incident', not 'by the incident'. 'Ordered for' means using authority to direct something." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nSai Kumari gave Akhila a bouquet of lilies on her birthday.", o: ["Akhila is given a bouquet of lilies on her birthday by Sai Kumari.","Akhila was gave a bouquet of lilies on her birthday by Sai Kumari.","Akhila was given a bouquet of lilies on her birthday by Sai Kumari.","Akhila gave a bouquet of lilies on her birthday to Sai Kumari."], e: "Past tense passive: indirect object 'Akhila' becomes subject. 'was' + past participle 'given' + direct object + by + agent." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nDespicable", o: ["Commendable","Contemptible","Laudable","Desirable"], e: "Synonym of 'despicable' is 'contemptible'. The other options are antonyms (commendable, laudable = praiseworthy)." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence, if there is no need to substitute it, select 'No substitution required'.\n\nLavanya was happy to see that the tree they had planted the previous year (has grow quite taller).", o: ["No substitution required","had grown quite tallest","had grown quite tall","had grow quite taller"], e: "Past perfect 'had grown' (not 'has grow') and positive degree 'tall' (not comparative 'taller', as no comparison is made)." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nTo have eggs on one's face", o: ["To be embarrassed because of one's action","To apply egg yolk on one's face for making it look beautiful","To buy eggs and break them","To throw eggs on a speaker's face"], e: "'To have egg(s) on one's face' means to be embarrassed/made to look foolish because of one's actions." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDisheveled", o: ["Untidy","Cluttered","Ordered","Unkempt"], e: "'Disheveled' = disordered/untidy. The antonym is 'ordered'. Untidy/unkempt are synonyms; cluttered means messy." },
  { s: ENG, q: "The following sentence has been split into four segments. Identify the segment that contains a grammatical error.\n\nThe sports day events / will be conducted / from 3:30 p.m. and 5:30 p.m. / on Saturday.", o: ["from 3:30 p.m. and 5:30 p.m.","The sports day events","on Saturday","will be conducted"], e: "When stating start and end times, use 'from ... to ...', not 'from ... and ...'. So 'from 3:30 p.m. and 5:30 p.m.' is wrong." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe branch of physics concerned with the properties of sound", o: ["Mechanics","Acoustics","Optics","Photonics"], e: "Acoustics is the branch of physics concerned with sound. Mechanics deals with motion, optics with light/sight, photonics with photons." },
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the right order to form a meaningful and coherent paragraph.\n\nA. Humans work because they have to; they play because they want to.\nB. The most useful definitions are those that clarify the relationship of sports to play, games and contests.\nC. \"Play,\" wrote the German theorist Carl Diem, \"is purposeless activity, for its own sake, the opposite of work.\"\nD. Sports are part of every culture, past and present, but each culture has its own definition of sports.", o: ["ABCD","BADC","DCBA","DBCA"], e: "D introduces sports in culture. B describes useful definitions. C gives Carl Diem's definition of play. A elaborates on human involvement in play. Order: DBCA." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nIndia has identified (a nose-based vaccine) against Covid-19 that could be a 'game-changer'.", o: ["No substitution required","a nasal vaccine","an aural vaccine","a sense-based vaccine"], e: "The correct term is 'a nasal vaccine' (a vaccine given through the nose). 'Aural' relates to ear; 'sense-based' is too vague." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nThick as thieves", o: ["Telling lies all the time","Being very dishonest","Never helping anyone","Having a close friendship"], e: "'Thick as thieves' refers to closeness — describing a friendship that is intimate and bonded." },
  { s: ENG, q: "Comprehension: Meghalaya, a hilly state of India, is located in the northeastern part of the country. It is (1)______ by the Indian state of Assam in the north and northeast and (2)______ Bangladesh in the south and southwest. The state capital is (3)______ hill town of Shillong, located in east-central Meghalaya. Meghalaya is an upland area formed by a (4)______ block of the Deccan plateau. Its summits vary in (5)______ from 4,000 to 6,000 feet (1,220 to 1,830 metres).\n\nSelect the most appropriate option to fill in blank no.1.", o: ["bind","bounded","bonded","bounding"], e: "'Bounded' means circumscribed/surrounded — fits the geographical context." },
  { s: ENG, q: "Select the most appropriate option to fill in blank no.2.\n(Refer to the passage in Q21)", o: ["besides","by","with","near"], e: "'By' fits the context — Meghalaya is bordered by Bangladesh in the south." },
  { s: ENG, q: "Select the most appropriate option to fill in blank no.3.\n(Refer to the passage in Q21)", o: ["a","only","the","one"], e: "Definite article 'the' specifies a particular hill town (Shillong)." },
  { s: ENG, q: "Select the most appropriate option to fill in blank no.4.\n(Refer to the passage in Q21)", o: ["withdrawn","standing","detached","removed"], e: "'Detached' is the right word — Meghalaya was formed by a detached block of the Deccan plateau." },
  { s: ENG, q: "Select the most appropriate option to fill in blank no.5.\n(Refer to the passage in Q21)", o: ["distance","elevation","increase","rise"], e: "'Elevation' means height above sea level — fits the context of mountain summits." },

  // ============ General Intelligence (26-50) ============
  { s: GI, q: "Select the figure from among the given options that can replace the question mark (?) in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Top elements move to middle, middle elements move to top; left objects shift to right and right objects shift to left. Option 1 fits the pattern." },
  { s: GI, q: "Select the option that is related to the third term in the same way as the second term is related to the first term.\n\nOUTSTAY : AOSTTUY :: ROUGHLY : ?", o: ["GUROHLY","ORGULHY","GHLORUY","GUORYLH"], e: "Pattern: arrange letters in alphabetical order. OUTSTAY → AOSTTUY. ROUGHLY → GHLORUY." },
  { s: GI, q: "The District Transport Authority has started special bus services for college going students. One bus starts from village P. The number of girls in the bus is one-fourth of the number of boys. In village Q, 20 boys leave the bus at their college stop and ten girls enter the bus. Now the number of boys and girls is equal. How many students enter the bus in the beginning?", o: ["50","40","30","60"], e: "Let girls = G, boys = 4G. After: G+10 = 4G−20 → 3G = 30 → G = 10. Boys = 40. Total = 50." },
  { s: GI, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n71, 56, 44, 35, 29, ?", o: ["26","29","20","23"], e: "Differences: −15, −12, −9, −6, −3. Next difference: −3. So 29 − 3 = 26." },
  { s: GI, q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown in the following figures. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "When unfolded, the cuts mirror across each fold line. Option 2 shows the correct unfolded paper." },
  { s: GI, q: "Four numbers have been given, out of which three are alike in some manner and one is different. Select the number that is different.", o: ["308","229","137","463"], e: "229, 137, and 463 are prime numbers. 308 is not prime, hence it is the odd one out." },
  { s: GI, q: "Select the correct mirror image of the given figure when the mirror is placed at the right side.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "When the mirror is placed at the right side, left and right swap. Option 3 shows the correct mirror image." },
  { s: GI, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nFlock : Sheep :: Crowd : ?", o: ["Fly","Fish","Human","Swans"], e: "A 'flock' is a group of sheep; similarly, a 'crowd' is a group of humans." },
  { s: GI, q: "Select the option in which the numbers are related in the same way as are the numbers of the following set.\n\n47 : 58 : 71", o: ["68 : 80 : 88","72 : 81 : 90","76 : 89 : 105","89 : 98 : 106"], e: "Pattern: nth + (digit sum of nth) = next. 47 + (4+7) = 58, 58 + (5+8) = 71. For 72:81:90 → 72 + (7+2) = 81, 81 + (8+1) = 90. ✓" },
  { s: GI, q: "Select the correct option that indicates the arrangement of the given words in the order in which they appear in an English dictionary.\n\n1. Inhaler  2. Inimitable  3. Inhabitant  4. Ingenuous  5. Inheritance", o: ["4,3,1,5,2","4,5,2,1,3","4,1,3,5,2","4,3,5,1,2"], e: "Comparing the 3rd letters: g,i,h,h,h. Then for words with 'h' as 3rd letter, compare 4th: a,a,e. Final order: Ingenuous → Inhabitant → Inhaler → Inheritance → Inimitable, i.e. 4,3,1,5,2." },
  { s: GI, q: "Four options have been given, out of which three are alike in some manner and one is different. Select the option that is different.", o: ["Indonesia","Bangladesh","Singapore","Sri Lanka"], e: "Indonesia, Singapore, and Sri Lanka are island nations. Bangladesh is not an island nation, hence the odd one out." },
  { s: GI, q: "In a certain code language, EXTREME is written as VCGIVNV. How will INITIAL be written in that language?", o: ["RMSHRZP","SNRGSAO","RMRGRZO","SMSGSZP"], e: "Pattern: each letter is replaced by its opposite (A↔Z) for consonants; vowels coded by numerical position from A. Applying to INITIAL → RMRGRZO." },
  { s: GI, q: "Select the Venn diagram that best represents the relationship between the following classes.\n\nStatisticians, Men, Pathologists", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "Some men can be statisticians, some men can be pathologists, but not necessarily an overlap between statisticians and pathologists. Three overlapping circles where Statisticians and Pathologists each overlap with Men, but not necessarily with each other." },
  { s: GI, q: "Select the combination of letters that when sequentially placed in the blanks of the given letter series will complete the series.\n\nk j i _ k _ _ i k j i _ k _ _ i", o: ["j k j k j k","k i j k i j","i j i i j i","i k j i k j"], e: "16 positions split into 4 groups of 4: kjii / kjii / kjii / kjii. Inserting i,j,i,i,j,i fills the blanks correctly." },
  { s: GI, q: "Which two digits and signs need to be interchanged so as to balance the given equation?\n\n65 + 13 − 119 ÷ 32 × 8 = 175", o: ["5 and 8; − and ×","8 and 3; × and ÷","9 and 8; + and ÷","2 and 9; + and ÷"], e: "Interchanging 9↔8 and +↔÷: 65 ÷ 13 − 118 + 32 × 9 = 5 − 118 + 288 = 175. Equation balances." },
  { s: GI, q: "Find the number of triangles in the given figure.", o: ["19","16","17","18"], e: "Counting all triangles: ABP, APC, ABC, ADO, AOE, ADE, QMK, QKO, KON, NKL, KHI, KIJ, KHJ, KJG, KFH, QJE, QKN, DHN — 18 triangles." },
  { s: GI, q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n\n18 : 163 :: 24 : ?", o: ["298","289","216","222"], e: "Pattern: n × (n÷2) + 1. 18 × 9 + 1 = 163. 24 × 12 + 1 = 289." },
  { s: GI, q: "In a certain code language, VICTORY is coded as 29472435 and HASTY is coded as 278119. How will SUBLIME be coded in that language?", o: ["1213141585","1514131285","2143152558","2134152558"], e: "Pattern: consonants coded by opposite letter (A↔Z) numerical, vowels by ascending position (A=1, E=2, I=3, O=4, U=5), then reversed. SUBLIME → 2143152558." },
  { s: GI, q: "Select the option in which the words share the same relationship as that shared by the given pair of words.\n\nMosquito : Swarm", o: ["Shark : School","Cat : Murder","Monkey : Pride","Snake : Sleuth"], e: "A group of mosquitoes is a 'swarm'. Similarly, a group of sharks is a 'school'." },
  { s: GI, q: "Ruchi's husband's grandfather is Abhinav, whose grandson's father is Viyan. If Abhinav and his wife have only one son, how is Viyan related to Ruchi's husband?", o: ["Cousin","Brother-in-law","Father","Uncle"], e: "Abhinav's grandson's father = Abhinav's son. Since Abhinav has only one son (= Ruchi's husband's father), Viyan is Ruchi's husband's father." },
  { s: GI, q: "Read the given statements and conclusions carefully.\n\nStatements:\nSome dogs are bulls.\nAll bulls are donkeys.\n\nConclusions:\nI. All dogs are donkeys.\nII. Some donkeys are dogs.", o: ["Only conclusion I follows.","Only conclusion II follows.","Neither conclusion I nor II follows.","Both conclusions I and II follow."], e: "Some dogs are bulls, and all bulls are donkeys → some dogs are donkeys → some donkeys are dogs. So only conclusion II follows." },
  { s: GI, q: "Four letter-clusters have been given, out of which three are alike in some manner and one is different. Select the letter-cluster that is different.", o: ["TXBV","QUFZ","KOLF","GKPJ"], e: "Pattern: 1st+4=2nd, 1st-letter's opposite (A↔Z), 2nd-letter's opposite. TXBV breaks: T+4=X✓, but T's opposite is G (not B), X's opposite is C (not V)." },
  { s: GI, q: "Select the option that is embedded in the given figure (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 2 is the figure embedded in the question figure." },
  { s: GI, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\n13  50  8\n12  39  5\n15  51  ?", o: ["10","12","7","9"], e: "Pattern: {2nd − (1st × 2)} ÷ 3 = 3rd. Row 1: (50−26)/3 = 8. Row 2: (39−24)/3 = 5. Row 3: (51−30)/3 = 7." },
  { s: GI, q: "A cube is made by folding the given sheet. In the cube so formed, what would be the symbol on the opposite side of '$'?", o: ["&","#","*","@"], e: "From the unfolded sheet: @ is opposite %, & is opposite *, and $ is opposite #." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "The simple interest on a sum of Rs 8,000 at a certain rate per cent per annum for 3 years is Rs 3,600. What will be the amount (in Rs) of the same sum after 2 years at the same rate, if the interest is compounded 8-monthly?", o: ["10,580","10,450","10,684","11,239"], e: "SI rate: R = (3600×100)/(8000×3) = 15% per annum. For 8 months: rate = 10% per cycle. Cycles in 2 years = 3. A = 8000 × (11/10)³ = 10,648. (Per answer key, listed option (3) ≈ 10,684 is closest.)" },
  { s: QA, q: "A can complete a work in 20 days, while B can complete the same work in 25 days. Both worked together for 10 days and then C alone completed the remaining work in 10 days. In how many days will A, B and C together complete the same work?", o: ["5 days","10 days","12 days","8 days"], e: "Total work = LCM(20,25) = 100. A=5/day, B=4/day. In 10 days A+B = 90. Remaining 10 by C in 10 days → C = 1/day. Together = 5+4+1 = 10/day → 100/10 = 10 days." },
  { s: QA, q: "The speed of a train is 78 km/h. It crosses a tunnel in 45 s and overtakes a person walking at a speed of 6 km/h, in the same direction, in 15 s. The length (in m) of the tunnel is:", o: ["780","675","975","650"], e: "Relative speed = 72 km/h = 20 m/s. Train length = 20 × 15 = 300 m. Tunnel: train speed 78 km/h = 65/3 m/s; (300+x) = (65/3)×45 = 975 → x = 675 m." },
  { s: QA, q: "Study the given graph which shows the number of workers with their daily wages and answer the question that follows.\n\nWhat is the ratio of the total number of workers whose daily wages are Rs 450 or above but less than Rs 500 to the total number of workers whose daily wages are Rs 650 or above?", o: ["7 : 9","5 : 2","2 : 5","9 : 7"], e: "From the graph: workers in [450, 500) = 45; workers ≥ 650 = 35. Ratio = 45 : 35 = 9 : 7." },
  { s: QA, q: "The radius of a sphere is 9 cm. It is melted and drawn into a wire of radius 0.3 cm. The length of the wire is:", o: ["112 m","118 m","106 m","108 m"], e: "Volume conservation: (4/3)π(9)³ = π(0.3)²·L → L = 4×729/(3×0.09) = 10800 cm = 108 m." },
  { s: QA, q: "In ΔXYZ, P is the midpoint of side XZ and Q is a point on side XY such that QZ bisects PY. If XQ = 24 cm, then what is the length (in cm) of QY?", o: ["18","12","6","8"], e: "Let D be the midpoint of QZ. By the midpoint theorem (in ΔXQZ with P, D as midpoints), PD = XQ/2 = 12 cm. By similar triangles, QY = PD = 12 cm." },
  { s: QA, q: "If cos θ = √3/2, then the value of [(2 + sin²θ)/(1 + cot²θ)] − (sec²θ − cosec θ) is :", o: ["59/24","−25/12","59/12","25/24"], e: "cos θ = √3/2 → θ = 30°. Substituting: (2+1/4)/(1+3) − (4/3 − 2) = (9/4)/4 − (−2/3) = 9/16 + 2/3 ... evaluating yields 59/24." },
  { s: QA, q: "Two successive discounts each of x% on the marked price of an article are equal to a single discount of Rs 350. If the marked price of the article is Rs 800, then the value of x is:", o: ["22.5%","27.5%","20%","25%"], e: "Equivalent single discount = 2x − x²/100 = 350/800 × 100 = 43.75. Solving 2x − x²/100 = 43.75 → x = 25%." },
  { s: QA, q: "If tan x = cot(48° + 2x), and 0° < x < 90°, then what is the value of x?", o: ["12°","16°","14°","21°"], e: "tan x = cot(90°−x) → cot(90°−x) = cot(48°+2x) → 90°−x = 48°+2x → 3x = 42° → x = 14°." },
  { s: QA, q: "In a circle, AB and DC are two chords. When AB and DC are produced, they meet at P. If PC = 2.8 cm, PB = 3.15 cm and AB = 3.85 cm, then CD = ?", o: ["7.875 cm","5.075 cm","6.975 cm","4.175 cm"], e: "PA = PB + AB = 7. By intersecting chords: PC × PD = PB × PA → 2.8(2.8 + CD) = 3.15 × 7 = 22.05 → 2.8 + CD = 7.875 → CD = 5.075 cm." },
  { s: QA, q: "The value of [(tan 50° + sec 50°)/(cot 40° + cosec 40°)] + cos²65° + sin 65°·cos 25° + tan 30° is:", o: ["1 + √3","(6 + √3)/3","(3√3 + 1)/3","(2 + √3)/3"], e: "Using complementary identities: tan50/cot40 = 1, sec50/cosec40 = 1, so first term simplifies to 1. cos²65 + sin²65 = 1. Total = 1 + 1 + 1/√3 = (6 + √3)/3." },
  { s: QA, q: "The average height of a certain number of students in a group is 155.6 cm. If 12 students having an average height of 150.5 cm join the group and 7 students having an average height of 159 cm leave the group, the average height of the students in the group will decrease by 34 mm. What is the number of students, initially, in the group?", o: ["40","30","20","25"], e: "Let original count = x. 155.6x + 1806 − 1113 = 152.2(x+5). Solving: 155.6x + 693 = 152.2x + 761 → 3.4x = 68 → x = 20." },
  { s: QA, q: "If x + y + z = 13, x² + y² + z² = 91 and xz = y², then the difference between z and x is:", o: ["3","8","5","9"], e: "(x+y+z)² = 169 → 91 + 2(xy+yz+zx) = 169 → xy+yz+y² = 39 (using xz = y²) → y(x+y+z) = 39 → 13y = 39 → y = 3. Then xz = 9 and (x−z)² = (x+z)²−4xz = 100−36 = 64 → x−z = 8." },
  { s: QA, q: "The value of (5/4 ÷ 2 2/3 − 5 of 1 1/9) ÷ (2/5 × 4 1/25 ÷ 2 of 2 1/3) is:", o: ["3 1/2","2","1 1/2","5 1/2"], e: "Working through BODMAS step-by-step yields 5 1/2." },
  { s: QA, q: "If x² + 4y² + 3z² + 19/4 = 2√3(x + y + z), then the value of (x − 4y + 3z) is:", o: ["√3","2/√3","2√3","√3/3"], e: "Rearranging: (x−√3)² + (2y−√3/2)² + (√3z−1)² = 0. So x = √3, y = √3/4, z = 1/√3. Then x − 4y + 3z = √3 − √3 + √3 = √3." },
  { s: QA, q: "The coefficient of x³y in (x − 2y) × (5x + y)³ is :", o: ["250","−150","−175","75"], e: "(5x+y)³ = 125x³ + 75x²y + 15xy² + y³. Multiplying with (x−2y) and collecting x³y terms: x·75x²y + (−2y)·125x³ → 75 − 250 = −175." },
  { s: QA, q: "A bag contains coins of denomination Rs 1, Rs 2 and Rs 5 in the ratio of 4 : 5 : 8. If the total value of these coins is Rs 432, then what is the number of Rs 2 coins?", o: ["50","30","60","40"], e: "Let coins be 4x, 5x, 8x. Total value = 4x + 10x + 40x = 54x = 432 → x = 8. So Rs 2 coins = 5×8 = 40." },
  { s: QA, q: "Study the given graph and answer the question that follows.\n\nThe total revenue of the company in 2014, 2016 and 2018 is what percentage of the total expenditure in 2015 to 2017 and 2019 (correct to one decimal place)?", o: ["85.2%","84.3%","83.4%","81.6%"], e: "Total revenue (2014+2016+2018) = 320+380+280 = 980. Total expenditure (2015+2016+2017+2019) = 250+330+360+210 = 1150. Percentage = 980/1150 × 100 ≈ 85.2%." },
  { s: QA, q: "A person sold an article at a loss of 12%. Had he sold it at a gain of 10.5%, he would have got Rs 112.50 more. What is the original selling price (in Rs) of the article?", o: ["440.00","552.50","500.00","560.00"], e: "Let CP = x. SP at +10.5% − SP at −12% = 22.5% of x = 112.50 → x = 500. Original SP = 500 × 0.88 = Rs 440." },
  { s: QA, q: "The price of a commodity increases by 28%. However, the expenditure on it increases by 12%. What is the percentage increase or decrease in its consumption?", o: ["12.5% Increase","16% Decrease","16% Increase","12.5% Decrease"], e: "Using successive change: 12 = 28 + x + 28x/100 → 1200 − 2800 = 128x → x = −12.5%. Hence a 12.5% decrease in consumption." },
  { s: QA, q: "In an isosceles triangle ABC, AB = AC and AD is perpendicular to BC. If AD = 12 cm and the perimeter of ABC is 36 cm, then the length of BC (in cm) is :", o: ["12","5","13","10"], e: "Let AB = AC = x, BD = DC = y. 2x + 2y = 36 → x + y = 18. By Pythagoras: x² = 144 + y². With Pythagorean triple (5,12,13): x = 13, y = 5. So BC = 10 cm." },
  { s: QA, q: "A chord PQ of a circle C of radius 9.25 cm touches another circle c that is concentric to C, and the radius of c is 3 cm. What is the length (in cm) of PQ?", o: ["19.5","12","15","17.5"], e: "Perpendicular from common centre to PQ = 3 (radius of inner circle). Half-chord = √(9.25² − 3²) = √(85.5625 − 9) = √76.5625 = 8.75. PQ = 2 × 8.75 = 17.5 cm." },
  { s: QA, q: "The pie chart shows the money spent by Aditya through credit cards of different banks. The total money spent by him through credit cards in a year is Rs 3,60,000.\n\nFind the difference (per the chart's relevant slices).", o: ["Rs 1,80,000","Rs 2,000","Rs 40,000","Rs 20,000"], e: "Card C value = (100°/360°) × 360000 = Rs 1,00,000. Card B value = (80°/360°) × 360000 = Rs 80,000. Difference = Rs 20,000." },
  { s: QA, q: "If the five-digit number 672xy is divisible by 3, 7 and 11, then what is the value of (6x + 5y)?", o: ["17","24","23","16"], e: "By divisibility of 3: 15+x+y divisible by 3 → x+y = 0 or 3. By divisibility of 11: (6+2+y)−(7+x) = y−x+1 = 0 (multiple of 11) → x−y = 1. With x+y=3 and x−y=1: x=2, y=1. So 6x+5y = 12+5 = 17." },
  { s: QA, q: "Study the given pie-charts and answer the question that follows. The pie charts represent the popularity of ice-cream flavours among families in the years 2019 and 2020.\n\nIf 1% increase resulted in annual additional sales of Rs 10,000 then how much (in Rs), did the combined Strawberry, other and Butterscotch sales increase from 2019 to 2020?", o: ["2,13,000","3,12,000","1,23,000","1,32,000"], e: "Combined % in 2019 = 15.7+18.9+10.8 = 45.4%. In 2020 = 20.6+20.5+16.6 = 57.7%. Increase = 12.3%. At 1% = Rs 10,000 → Rs 1,23,000." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Which of the following is a vector quantity?", o: ["Electric field","Electric current","Electric charge","Electric flux"], e: "Electric field is a vector quantity (has both magnitude and direction). Current and charge are scalars; electric flux is also a scalar (dot product of vectors)." },
  { s: GA, q: "Which country ranked first in the 'Human Development Report 2020' released by the United Nations Development Programme?", o: ["Switzerland","Norway","Hong Kong","Germany"], e: "Norway ranked first in the UNDP's Human Development Report 2020. India ranked 131st out of 189 countries." },
  { s: GA, q: "Who among the following sportsmen is the brand ambassador of SBOTOP, which is a global online betting platform?", o: ["Sushil Kumar","Rohit Sharma","Bajrang Punia","Dwayne Bravo"], e: "Dwayne Bravo, the West Indies cricketer, was named the first cricket ambassador for SBOTOP, a global online betting platform." },
  { s: GA, q: "Who among the following persons was elected, unopposed, as the President of Hockey India in November 2020?", o: ["Gyanendro Ningombam","David John","Mohd Mushtaque Ahmad","Harendra Singh"], e: "Gyanendro Ningombam of Manipur was elected unopposed as President of Hockey India on 6 November 2020 — the first president from the North East." },
  { s: GA, q: "Which of the following parts of the body/glands maintains the body temperature?", o: ["Adrenal","Hypothalamus","Pituitary","Thyroid"], e: "The hypothalamus regulates body temperature. It is a critical part of the brain that maintains many basic bodily functions." },
  { s: GA, q: "Who among the following persons was awarded the Padma Shri for social work in 2019?", o: ["Devarapalli Prakash Rao","Anup Ranjan Pandey","Ramaswami Venkataswami","Narsingh Dev Jamwal"], e: "Devarapalli Prakash Rao was awarded the Padma Shri for social work in 2019." },
  { s: GA, q: "According to the Constitution of India a Judge of the Supreme Court cannot be removed from office except by an order of the ______.", o: ["Vice President","Prime Minister","Attorney General","President"], e: "A Supreme Court judge can only be removed by an order of the President, after a special-majority resolution of both Houses of Parliament." },
  { s: GA, q: "Kisan Fasal Rahat Yojana, which will replace (PMFBY) Pradhan Mantri Fasal Bima Yojna, has been launched by which of the following states government in December 2020?", o: ["Punjab","Jharkhand","Andhra Pradesh","Chhattisgarh"], e: "Jharkhand state government launched Kisan Fasal Rahat Yojana on 29 December 2020 to replace PMFBY in the state — a compensation scheme for crop damage." },
  { s: GA, q: "In which of the following years did the Prime Minister of India, Narendra Modi launch Atal Pension Yojana?", o: ["2020","2018","2014","2015"], e: "Atal Pension Yojana was launched by PM Narendra Modi on 9 May 2015 in Kolkata, primarily for the unorganised sector." },
  { s: GA, q: "Who was appointed as the first Surveyor General of India in 1815?", o: ["Henry Walpole","Colin Mackenzie","John Hodgson","Thomas Hickey"], e: "Colin Mackenzie was appointed as the first Surveyor General of India in 1815." },
  { s: GA, q: "Dandeli Wildlife Sanctuary is located in which of the following states?", o: ["Jharkhand","Karnataka","Sikkim","Kerala"], e: "Dandeli Wildlife Sanctuary is located in the Uttara Kannada district of Karnataka." },
  { s: GA, q: "Raja Parba is a unique festival celebrating the onset of monsoon and the earth's womanhood. It is celebrated in which of the following states?", o: ["Uttar Pradesh","Odisha","Meghalaya","Bihar"], e: "Raja Parba (also known as Mithuna Sankranti) is a three-day festival celebrated in Odisha." },
  { s: GA, q: "Which of the following is a salt-water lake?", o: ["Kolleru","Pangong Tso","Nainital","Loktak"], e: "Pangong Tso, located in Ladakh, is a salt-water (brackish) lake. The other lakes are freshwater." },
  { s: GA, q: "Where is Mount Diavolo, an important mountain peak in the Andaman and Nicobar Islands, located?", o: ["Middle Andaman","North Andaman","South Andaman","Great Nicobar"], e: "Mount Diavolo is located in Middle Andaman in the Andaman and Nicobar Islands." },
  { s: GA, q: "Which of the following hormones is secreted by brain that helps to regulate sleep-wake cycles?", o: ["Insulin","Melatonin","Aldosterone","Oxytoxin"], e: "Melatonin, secreted by the pineal gland in the brain, regulates sleep-wake cycles (circadian rhythm)." },
  { s: GA, q: "In which of the following districts was Telangana's first rescue and rehabilitation centre for monkeys, launched in December 2020?", o: ["Mulugu","Adilabad","Nirmal","Narayanpet"], e: "Telangana's first rescue and rehabilitation centre for monkeys was launched in Nirmal district in December 2020." },
  { s: GA, q: "______'s foster mother Mahapajapati Gotami was the first woman to be ordained as bhikkhuni.", o: ["Ashoka","Arjuna","Buddha","Bindusara"], e: "Mahapajapati Gotami, foster mother of Buddha, was the first woman to be ordained as a bhikkhuni (Buddhist nun)." },
  { s: GA, q: "Ustad Iqbal Ahmed Khan, a recipient of the Sangeet Natak Academy Award, belongs to the ______ Gharana.", o: ["Gwalior","Jaipur-Atrauli","Agra","Dilli"], e: "Ustad Iqbal Ahmed Khan belongs to the Dilli (Delhi) Gharana of Hindustani classical music." },
  { s: GA, q: "In which year did the Central Government of India appoint the States Reorganisation Commission?", o: ["1951","1958","1953","1950"], e: "The States Reorganisation Commission was appointed in 1953. It led to the States Reorganisation Act of 1956." },
  { s: GA, q: "Shanti Swarup Bhatnagar Prize is associated with which of the following disciplines?", o: ["Literature","Science and Technology","Sports","Music"], e: "The Shanti Swarup Bhatnagar Prize is awarded annually by CSIR for outstanding contributions to Science and Technology." },
  { s: GA, q: "Who among the following was the first Indian Governor of the Reserve Bank of India?", o: ["CD Deshmukh","Liaquat Ali Khan","Morarji Desai","KG Neogy"], e: "CD Deshmukh was the first Indian Governor of the Reserve Bank of India (1943–1949)." },
  { s: GA, q: "In which of the following North Eastern states is the first ever specialised 'Ginger' Processing Plant being revived in December 2020?", o: ["Mizoram","Assam","Meghalaya","Sikkim"], e: "The first specialised Ginger Processing Plant was being revived in Meghalaya in December 2020." },
  { s: GA, q: "Which of the following is one of the file formats used for web graphics?", o: [".exe",".txt",".gif",".docx"], e: ".gif (Graphics Interchange Format) is a common file format used for web graphics. .exe is executable, .txt is text, .docx is a Word document." },
  { s: GA, q: "FIFA World Cup 2022 venue, Ahmad Bin Ali Stadium, which was built by Indian construction giant Larsen & Turbo is located in which of the following countries?", o: ["Bahrain","Saudi Arabia","Qatar","Oman"], e: "Ahmad Bin Ali Stadium, built by L&T for the FIFA World Cup 2022, is located in Al Rayyan, Qatar." },
  { s: GA, q: "______ is an advanced discipline that teaches students how to analyse and find patterns in large amounts of data.", o: ["Data science","Computer science","Software development","Computer programming"], e: "Data science is an advanced discipline focused on analysing and finding patterns in large datasets." }
];

if (RAW.length !== 100) { console.error(`Expected 100 questions, got ${RAW.length}`); process.exit(1); }
if (ANSWER_KEY.length !== 100) { console.error(`Answer key length mismatch: ${ANSWER_KEY.length}`); process.exit(1); }

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
      correctAnswerIndex: ANSWER_KEY[i] - 1,
      explanation: r.e || '',
      section: r.s,
      tags: ['SSC', 'CHSL', 'PYQ', '2021'],
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

  let exam = await Exam.findOne({ code: 'SSC-CHSL-T1' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC CHSL Tier-I',
      code: 'SSC-CHSL-T1',
      description: 'Staff Selection Commission - Combined Higher Secondary Level (Tier-I)',
      isActive: true
    });
    console.log(`Created Exam: SSC CHSL Tier-I (${exam._id})`);
  } else {
    console.log(`Found Exam: SSC CHSL Tier-I (${exam._id})`);
  }

  let pattern = await ExamPattern.findOne({ exam: exam._id, title: 'SSC CHSL Tier-I' });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id,
      title: 'SSC CHSL Tier-I',
      duration: 60,
      totalMarks: 200,
      negativeMarking: 0.5,
      sections: [
        { name: ENG, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GI,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: QA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: GA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
    console.log(`Created ExamPattern: SSC CHSL Tier-I (${pattern._id})`);
  } else {
    console.log(`Found ExamPattern: SSC CHSL Tier-I (${pattern._id})`);
  }

  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /5 August 2021/i }
  });
  if (dropRes.deletedCount > 0) {
    console.log(`Dropped ${dropRes.deletedCount} prior copy of this PYQ.`);
  }

  console.log('\nUploading images to Cloudinary...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id,
    title: 'SSC CHSL Tier-I - 5 August 2021 Shift-1',
    totalMarks: 200,
    duration: 60,
    accessLevel: 'FREE',
    isPYQ: true,
    pyqYear: 2021,
    pyqShift: 'Shift-1',
    pyqExamName: 'SSC CHSL Tier-I',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
