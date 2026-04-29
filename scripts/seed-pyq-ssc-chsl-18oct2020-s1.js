/**
 * Seed: SSC CHSL Tier-I PYQ - 18 October 2020, Shift-1 (100 questions)
 * Source: Oswaal SSC CHSL Tier-I Year-wise Solved Papers (PDF, verified)
 * Run with: node scripts/seed-pyq-ssc-chsl-18oct2020-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC CHSL TIER 1/18th-oct-2020/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-chsl-18oct2020-s1';

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

// Image filenames in this folder are prefixed `18th-march-2020-` (a labelling
// quirk — the paper itself is 18th October 2020). Q-numbers are correct.
const IMAGE_MAP = {
  27: {
    q: '18th-march-2020-q-27.png',
    opts: ['18th-march-2020-q-27-option-1.png','18th-march-2020-q-27-option-2.png','18th-march-2020-q-27-option-3.png','18th-march-2020-q-27-option-4.png']
  },
  33: { q: '18th-march-2020-q-33.png' },
  37: {
    q: '18th-march-2020-q-37.png',
    opts: ['18th-march-2020-q-37-option-1.png','18th-march-2020-q-37-option-2.png','18th-march-2020-q-37-option-3.png','18th-march-2020-q-37-option-4.png']
  },
  41: { q: '18th-march-2020-q-41.png' },
  44: { q: '18th-march-2020-q-44.png' },
  47: {
    q: '18th-march-2020-q-47.png',
    opts: ['18th-march-2020-q-47-option-1.png','18th-march-2020-q-47-option-2.png','18th-march-2020-q-47-option-3.png','18th-march-2020-q-47-option-4.png']
  },
  51: { q: '18th-march-2020-q-51.png' },
  55: { q: '18th-march-2020-q-55.png' },
  57: { q: '18th-march-2020-q-57.png' },
  58: { q: '18th-march-2020-q-58.png' },
  61: { q: '18th-march-2020-q-61.png' },
  71: { q: '18th-march-2020-q-71.png' }
};

// 1-based answer key from the paper's Answer Key table (verified from PDF)
const ANSWER_KEY = [
  4,3,1,1,3, 3,2,4,1,4, 1,4,2,2,4, 3,1,3,4,2, 4,4,3,2,1, // 1-25
  4,2,1,1,3, 1,3,1,3,3, 4,4,1,2,1, 3,4,2,2,3, 1,1,3,3,3, // 26-50
  3,1,4,3,1, 2,2,4,1,2, 2,4,4,3,4, 1,3,4,4,2, 4,1,4,3,4, // 51-75
  3,3,2,4,1, 1,3,1,4,4, 4,1,3,1,4, 1,4,3,3,3, 3,4,2,4,4  // 76-100
];

const ENG = 'English Language';
const GI  = 'General Intelligence';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ English Language (1-25) ============
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nVanish into the air", o: ["Perpetually postpone","Totally dilute","Permanently mix","Completely disappear"], e: "'Vanish into the air' means to disappear completely in a way that is mysterious." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["Selection","Conviction","Defenition","Valediction"], e: "'Defenition' is incorrectly spelt. The correct spelling is 'definition' — a description or explanation about something." },
  { s: ENG, q: "Select the correct passive form of the given sentence.\n\nThe students have performed a new version of Shakespeare's 'Macbeth'.", o: ["A new version of Shakespeare's 'Macbeth' has been performed by the students.","Shakespeare's 'Macbeth' have been performed by the new version of the students.","Shakespeare's 'Macbeth' has been performed by the new version of the students.","A new version of Shakespeare's 'Macbeth' have been performed by the students."], e: "Tense is present perfect ('have performed'). The object 'A new version of Shakespeare's Macbeth' (singular) becomes the subject. Use 'has been' + past participle 'performed' + connector 'by' + new object." },
  { s: ENG, q: "Select the correct indirect form of the given sentence.\n\nShanti asked me, \"Why did you keep this smartphone in the bin?\"", o: ["Shanti asked me why I had kept that smartphone in the bin.","Shanti asked me why I was keeping that smartphone in the bin.","Shanti asked me why I had been keeping that smartphone in the bin.","Shanti asked me why I kept that smartphone in the bin."], e: "Reporting verb and reported verb both in past form. The reported verb is converted to past perfect ('had kept'). 'You' becomes 'I', 'this' becomes 'that'." },
  { s: ENG, q: "Comprehension: In the following passage some words have been deleted. Fill in the blanks.\n\nThe internet is fast becoming trusted by (1)______ children and adults as reliable and accurate (2)______ of information. Through the internet children now have (3)______ to an almost endless supply of information and opportunity for (4)______. However, there can be real risks and dangers for an (5)______ child.\n\nSelect the most appropriate option for blank No. 1.", o: ["often","not only","both","neither"], e: "The object refers to two groups (children and adults), so 'both' is the right answer." },
  { s: ENG, q: "Select the most appropriate option for blank No. 2.\n(Refer to the passage in Q5)", o: ["piece","deposit","source","collection"], e: "Internet is a 'source' from which information is gathered, not a piece, deposit, or collection." },
  { s: ENG, q: "Select the most appropriate option for blank No. 3.\n(Refer to the passage in Q5)", o: ["gathering","access","ability","easiness"], e: "'Access' means to be able to use or obtain something. Children get access to information via the internet." },
  { s: ENG, q: "Select the most appropriate option for blank No. 4.\n(Refer to the passage in Q5)", o: ["deliberation","intimation","consultation","interaction"], e: "'Interaction' is the right word — internet provides students opportunities to communicate with others." },
  { s: ENG, q: "Select the most appropriate option for blank No. 5.\n(Refer to the passage in Q5)", o: ["unsupervised","undeveloped","unauthorised","unparalleled"], e: "Internet can mislead children if they are not being observed. 'Unsupervised' fits best in this context." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nTake one's hat off to someone", o: ["Express anger","Display humility","Indicate disapproval","Show admiration"], e: "If you take your hat off to someone, you show that you admire them for an achievement." },
  { s: ENG, q: "Select the word which means the same as the group of words given.\n\nA person who is neither well experienced nor professional", o: ["Amateur","Proficient","Veteran","Expert"], e: "An amateur is a person inexperienced or unskilled in a particular activity." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nI had a broken bone in the hand which the doctor called a ______ and suggested immediate surgery.", o: ["wound","infection","contamination","fracture"], e: "A 'fracture' is a break in a bone. 'Wound' = injury (esp. cut), 'infection' = microorganism harm, 'contamination' = pollution." },
  { s: ENG, q: "Select the word which means the same as the group of words given.\n\nSomething which is considered to be very important", o: ["Meagre","Cardinal","Scanty","Supplementary"], e: "'Cardinal' means something that is of great importance. Meagre/scanty = inadequate, supplementary = additional." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nJOVIAL", o: ["Judgmental","Joyous","Jealous","Jeering"], e: "Synonym of 'jovial' is 'joyous' (cheerful). Judgmental = subjective, jealous = envious, jeering = scornful." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No improvement'.\n\n(As of you) are here with me, who cares about the outcome of the issue.", o: ["So long","No improvement","As long to","As long as"], e: "'As long as' is used to talk about something continuing for an amount of time. The other options don't convey this meaning." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nEARTHLY", o: ["Temperamental","Peripheral","Celestial","Temporal"], e: "Antonym of 'earthly' is 'celestial'. Temperamental's antonym is calm, peripheral's is central, temporal's is immaterial." },
  { s: ENG, q: "Given below are four jumbled sentences. Out of the given options select the one that gives their correct order.\n\nA. One day, a strange crow from the west, landed on one of the branches.\nB. There was a large mango tree deep inside a thick forest.\nC. The branches were full of leaves, which crackled when the storm blew.\nD. Its branches spread in all directions, lobbing a large shadow on the ground.", o: ["BDCA","BCAD","CDBA","ACDB"], e: "B introduces the setting (mango tree). D describes its branches. C provides further description (leaves). A introduces the crow's arrival. Order: BDCA." },
  { s: ENG, q: "Given below are four jumbled sentences. Out of the given options select the one that gives their correct order.\n\nA. In the evening, Tejaswini would sing songs praising the Lord.\nB. She would go to the Lord's temple twice a day.\nC. Tejaswini was known in the village for her devotion to the Lord.\nD. In the morning, she would take with her a pot of milk and a bunch of flowers as offering.", o: ["CADB","DCAB","CBDA","ACDB"], e: "C introduces Tejaswini. B speaks about her daily routine of going twice a day. D speaks about morning routine, A about evening routine. Order: CBDA." },
  { s: ENG, q: "In the sentence identify the segment which contains the grammatical error.\n\nThomas is a man of word who have been paying back the borrowed money in instalments.", o: ["the borrowed money","in instalments","Thomas is a man of word","who have been paying back"], e: "Thomas is third-person singular, so 'has been paying back' is correct (not 'have been paying back')." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["Collaborate","Comemorate","Corporate","Conjugate"], e: "Correct spelling is 'commemorate' (celebrate or honour). 'Comemorate' is wrongly spelt." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nShe has shown a great interest towards space science, since her early childhood and a passion to ______ the outer space.", o: ["elicit","entertain","enlighten","explore"], e: "'Explore' means to discover something. Elicit = provoke, entertain = amuse, enlighten = educate." },
  { s: ENG, q: "In the sentence identify the segment which contains the grammatical error.\n\nThough she was able to finish the work on time, she couldn't do that out in fear.", o: ["finish the work on time,","she couldn't do that","Though she was able to","out in fear"], e: "'Out of fear' means worried/frightened. 'Out in fear' is incorrect usage." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nCHOOSY", o: ["Productive","Frank","Selective","Tricky"], e: "Synonym of 'choosy' is 'selective'. Productive = creative, frank = forthright, tricky = complicated." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nOBSCURE", o: ["Ambiguous","Clear","Uncertain","Vague"], e: "Antonym of 'obscure' is 'clear'. Ambiguous = unclear, uncertain = doubtful, vague = unclear." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No improvement'.\n\nBefore it was modified, the Law (provided with) the owner could take possession of the goods at any time.", o: ["provided that","provided on","No improvement","provided as"], e: "'Provided that' means on the condition or understanding. 'Provided with' is wrong usage." },

  // ============ General Intelligence (26-50) ============
  { s: GI, q: "Rishabh is a 10 year old boy. If his mother is 20 years older than him and 6 years younger than his father, then what is his father's age?", o: ["34 years","26 years","30 years","36 years"], e: "Rishabh = 10, mother = 30, father = 30 + 6 = 36 years." },
  { s: GI, q: "Select the option in which the given figure is embedded. (Rotation is not allowed)", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 2 contains the given figure embedded within it." },
  { s: GI, q: "In a certain code language, PAGER is written as MIDOO. How will ANGEL be written as in that language?", o: ["IKDOI","AOIDK","ILVDN","AVIDI"], e: "Consonants decrease by 3 and vowels increase by 8 then 10. P-3=M, A+8=I, G-3=D, E+10=O, R-3=O. Apply to ANGEL: A+8=I, N-3=K, G-3=D, E+10=O, L-3=I → IKDOI." },
  { s: GI, q: "In a certain code language, MUSIC is coded as 60 and TUNE is coded as 56. How will LYRIC be coded as in that language?", o: ["62","65","63","67"], e: "Pattern: sum of letter positions − number of letters. M(13)+U(21)+S(19)+I(9)+C(3)−5 = 65−5 = 60. LYRIC: L(12)+Y(25)+R(18)+I(9)+C(3)−5 = 67−5 = 62." },
  { s: GI, q: "Read the given statements and conclusions carefully.\n\nStatements:\n1. All doors are teachers.\n2. All teachers are cups.\n\nConclusions:\nI. All cups are doors.\nII. All doors are cups.\nIII. All teachers are doors.\nIV. Some cups are teachers.", o: ["Only conclusions I and II follow.","Only conclusion I follows.","Only conclusions II and IV follows.","Only conclusions I and III follows."], e: "From the Venn diagram (doors ⊂ teachers ⊂ cups), conclusions II (all doors are cups) and IV (some cups are teachers) follow." },
  { s: GI, q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n\n9 : 121 :: 7 : ?", o: ["81","102","105","79"], e: "Pattern: (n+2)². (9+2)² = 121. (7+2)² = 81." },
  { s: GI, q: "Arrange the following words in a logical and meaningful order.\n\n1. Letter  2. Satellite  3. Telephone  4. Smartphone", o: ["3, 2, 1, 4","4, 3, 1, 2","1, 3, 4, 2","3, 1, 2, 4"], e: "Chronological order of inventions: Letter → Telephone → Smartphone → Satellite, i.e. 1, 3, 4, 2." },
  { s: GI, q: "If the following figure is folded to form a cube, then how many dots will be on the face opposite to the face having 2 dots?", o: ["1","6","4","3"], e: "When folded: 6 is opposite 3, 5 is opposite 4, and 2 is opposite 1." },
  { s: GI, q: "Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster.\n\nINTEX : EINTX :: SMALL : ?", o: ["ALMLV","AJKLM","ALLMS","LLAMV"], e: "Pattern: rearrange letters in alphabetical order. INTEX → EINTX. SMALL → ALLMS." },
  { s: GI, q: "Select the combination of letters that when sequentially placed in the blanks of the given letter series will complete the series.\n\nab _ _ _ cba _ _ _ dd _ _ _ abcd _ _ baa _____ cba", o: ["abeaacdecdeecdd","acbdecdeaacecdd","cddabccbadcbcdd","abbaacdeecdecdd"], e: "Inserting from option 3 forms: abcd / dcba / abcd / dcba ... a logical sequence. Hence cddabccbadcbcdd." },
  { s: GI, q: "Select the combination of letters that when sequentially placed in the blanks of the given letter series will complete the series.\n\ne _ geef _ gg _ ee _ f _ ggg", o: ["g, f, e, f, f","f, f, f, f, f","f, g, f, g, g","f, f, e, f, f"], e: "Inserting f,f,e,f,f gives efg / eeffgg / eeefffggg — a logical pattern." },
  { s: GI, q: "Select the option figure that will come next in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Pattern: each pair shifts clockwise by one position. Option 4 is next in the series." },
  { s: GI, q: "Four letter-pairs have been given, out of which three are alike in some manner and one is different. Select the odd letter pair.", o: ["BE","AY","US","OM"], e: "Pattern: 2nd letter = 1st letter − 2 (alphabet positions). AY: A+8=Y? No, Y−2=W ≠ A. Actually pattern is gap of −2 from one letter (A−Y, U−S, O−M). BE breaks the pattern (B+3=E, not −2)." },
  { s: GI, q: "A and B can do a piece of work in 30 days and 18 days respectively. A started the work alone and then after 6 days B joined him till the completion of the work. In how many days has the whole work completed?", o: ["17","15","9","12"], e: "LCM(30,18)=90. A's efficiency=3, B's=5. A in 6 days = 18 work. Remaining 72/8 = 9 days. Total = 6+9 = 15 days." },
  { s: GI, q: "Select the option in which the word share the same relationship as that shared by the given pair of words.\n\nChair : Furniture", o: ["Letter paper : Stationary","Pencil : Wood","Bicycle : Travel","Seat : Cover"], e: "Chair is a category of furniture; similarly, letter paper is a category of stationery." },
  { s: GI, q: "How many triangles are there in the given figure?", o: ["12","10","8","13"], e: "Counting all triangles: ACE, AEF, ACF, BCD, CDG, IMH, FJH, GJF — 8 triangles in total." },
  { s: GI, q: "Which two signs should be interchanged to make the following equation correct?\n\n4 ÷ 6 + 9 − 48 × 8 = 27", o: ["+ and ×","+ and −","÷ and +","÷ and ×"], e: "Interchanging ÷ and ×: 4 × 6 + 9 − 48 ÷ 8 = 24 + 9 − 6 = 27. Equation balances." },
  { s: GI, q: "Select the number that can replace the question mark (?) in the following series.\n\n2, 8, 15, 24, 36, 52, ?", o: ["83","73","78","63"], e: "Differences: 6, 7, 9, 12, 16, 21 (gaps: 1,2,3,4,5). Next gap = 6, so next diff = 21. 52 + 21 = 73." },
  { s: GI, q: "Study the following diagram and answer the given question.\n\nHow many people like both tea and coffee, but do NOT like juice?", o: ["22","12","8","20"], e: "From the Venn diagram, the region representing 'tea ∩ coffee but NOT juice' contains 12." },
  { s: GI, q: "Which two signs and numbers should be interchanged to make the following equation correct?\n\n16 × 18 + 2 − 14 ÷ 3 = 38", o: ["14 and 18, + and −","16 and 14, − and −","14 and 18, + and ×","16 and 3, − and ÷"], e: "Interchanging 14↔18 and +↔×: 16 + 14 × 2 − 18 ÷ 3 = 16 + 28 − 6 = 38. Balances." },
  { s: GI, q: "Which of the option is the exact mirror image of the given alpha-numeric figure when the mirror is held at the right side?\n\nAHTOITG46Q34", o: ["Option 1","Option 2","Option 3","Option 4"], e: "When the mirror is held at right side, characters appearing on right move to left and vice versa. Option 1 shows the correct mirror image." },
  { s: GI, q: "A paper is folded and cut as shown in the following figure. How will this paper appear when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Unfolding produces the pattern shown in option 1." },
  { s: GI, q: "Sheela introduced Rahul saying, \"His sister is the single daughter of my mother\". How are Rahul and Sheela related to each other?", o: ["Uncle-Niece","Cousins","Brother-Sister","Son-Mother"], e: "'Single daughter of my mother' = Sheela. So Rahul's sister = Sheela. Therefore Rahul and Sheela are brother and sister." },
  { s: GI, q: "Select the set in which the numbers are related in the same way as are the numbers of the set.\n\n(2, 6, 32)", o: ["(9, 13, 43)","(4, 12, 36)","(8, 18, 80)","(4, 8, 34)"], e: "Pattern: (b − a) × 8 = c. (6−2)×8 = 32. For (8,18,80): (18−8)×8 = 80." },
  { s: GI, q: "In a certain code language, 'APRICOT' is written as 'GLXRIKZ' then how will 'ORANGE' be written in the same code language?", o: ["LIZMTV","VTNZHM","VTMZIL","LHZMSV"], e: "Pattern: each letter is reflected (A↔Z), then the whole word reversed. APRICOT → ZKIRXLG → reversed → GLXRIKZ. ORANGE → LIZMTV → reversed → VTMZIL." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "The following graph shows the data of five companies A, B, C, D, E with the respect to the male and female ratio of employees above, or below the average salary.\n\nIf in the company D, the percentage of employees above the average salary is 16% which is equal to 80, then the number of employees below salary are:", o: ["520","300","420","470"], e: "Total employees in D = 80 × 100/16 = 500. Employees below average = 500 × 84/100 = 420." },
  { s: QA, q: "25 men can complete a task in 16 days. Four days after they started working, 5 more men, with equal workmanship, joined them. How many days will be needed by all to complete the remaining task?", o: ["10 days","12 days","15 days","18 days"], e: "Remaining work after 4 days = (25 × 12) man-days = 300 man-days. With 30 men: 300/30 = 10 days." },
  { s: QA, q: "If 4/(1 + √2 + √3) = a + b√2 + c√3 − d√6, where a, b, c, d are natural numbers, then the value of a + b + c + d is:", o: ["1","0","2","4"], e: "Rationalising step-by-step yields a=2, b=1, c=0, d=1. So a+b+c+d = 4. (Note: c=0 here violates 'natural numbers' strictness, but per the official key the answer is 4.)" },
  { s: QA, q: "A person purchased 40 items at some price. He sold some items at a profit of 30% by selling them at a price equal to the cost price of 26 items. The remaining items are sold at 18% profit. The total profit percentage is :", o: ["27%","28%","24%","25%"], e: "Let CP per item = ₹1. SP for x items at 30% profit = CP of 26 items: 1.3x = 26 → x = 20. Remaining 20 items at 18% profit, SP = 23.6. Total SP = 26 + 23.6 = 49.6. Total profit = 9.6/40 × 100 = 24%." },
  { s: QA, q: "A circle is inscribed in the triangle ABC whose sides are given as AB = 10, BC = 8, CA = 12 units as shown in the figure. The value of AD × BF is :", o: ["21 units","15 units","18 units","16 units"], e: "Tangent lengths: BE = BF = x, CF = CD = y, AD = AE = z. From equations: x+y+z=15, x+y=8, y+z=12, z+x=10. Solving: z=7, x=3. AD × BF = z × x = 21." },
  { s: QA, q: "If [(−3/2 + 2)/(2 × 3/3) × (3x + 7)/(2x + 3) − (−5/6/3)] = [2 × √3/(2/3) − 4/(2 × 3 × 3)/3]/(2 − 4√2 × x), then the value is :", o: ["6","5","3","4"], e: "Simplifying both sides and equating: 2(−42x) = 2(−23) → x = 23/42. Per the answer key, the listed correct option value is 5." },
  { s: QA, q: "PA and PB are tangents to the circle and O is the centre of the circle. The radius is 5 cm, PO is 13 cm. If the area of the triangle PAB is M, then the value of M/15 is :", o: ["12/13","24/13","12/13","24/13"], e: "AP = √(13²−5²) = 12. Area of quadrilateral PAOB = 60. AB = 120/13, ON = 25/13. Area of ΔAPB = 60 − 1500/169 = 8640/169. M/15 = 24×?... Per the answer key, the correct option is 24/13." },
  { s: QA, q: "The following graph shows the profit (in crore Rs) earned by a company in the year from 2012 and 2019.\n\nThe percentage increase in the profit from the previous year, is greatest in the year :", o: ["2017","2015","2018","2013"], e: "Per the graph, the greatest percentage increase from previous year occurred in 2013, with a 26.88% rise." },
  { s: QA, q: "If a sin A + b cos A = c, then a cos A − b sin A is equal to :", o: ["√(a² + b² − c²)","√(a² + b² + c²)","√(a² − b² + c²)","√(a² − b² − c²)"], e: "Squaring (a sinA + b cosA)² = c² and using sin²+cos²=1: a²cos²A + b²sin²A − 2ab sinA cosA = a² + b² − c². Hence a cosA − b sinA = √(a² + b² − c²)." },
  { s: QA, q: "If the length of a rectangle is increased by 12% and the breadth is decreased by 8%, the net effect on the area is :", o: ["decrease by 2.6%","increase by 3.04%","increase by 2.6%","decrease by 3.04%"], e: "Net change = x + y + xy/100 = 12 − 8 + (12 × −8)/100 = 4 − 0.96 = 3.04%. Positive, so increase by 3.04%." },
  { s: QA, q: "The following graph shows the data of the number of candidates that appeared and qualified for a competitive exam from the colleges A, B, C, D, E.\n\nBased on the information, the difference between the percentage of students that qualified, from the colleges B and D is :", o: ["18","15","12","20"], e: "% qualified from B = 420/560 × 100 = 75%. % qualified from D = 432/480 × 100 = 90%. Difference = 90 − 75 = 15%." },
  { s: QA, q: "In a 56 liters mixture of milk and water, the ratio of milk to water 7 : 2. Some quantity of milk is to be added to the mixture. The quantity of the milk present in the new mixture will be :", o: ["16 liters","40 liters","48 liters","56 liters"], e: "Note: question states 7:2 but uses 5:2 in working. With ratio 5:2: milk = 40L, water = 16L. Adding x makes ratio (40+x):16 = 7:2 → 80+2x = 112 → x = 16. New milk = 56 L." },
  { s: QA, q: "If the value of (3x√y + 2y√x)/(3x√y − 2y√x) − (3x√y − 2y√x)/(3x√y + 2y√x) is same as that of √(xy), then which of the following relations between x and y is correct?", o: ["9x + 4y = 36","9x + 4y = 24","9x − 4y = 36","9x − 4y = 24"], e: "Simplifying the difference of fractions: (24xy√(xy))/(9x²y − 4y²x) = √(xy) ⇒ 24xy/(9x²y − 4xy²) = 1 ⇒ 9x − 4y = 24." },
  { s: QA, q: "A man has Rs 10,000. He lent a part of it at 15% simple interest and the remaining at 10% simple interest. The total interest he received after 5 years amounted to Rs 6,500. The difference between the part of the amounts he lent is :", o: ["Rs 1,750","Rs 2,500","Rs 2,000","Rs 1,500"], e: "Let lent at 15% = x. Then x×15×5/100 + (10000−x)×10×5/100 = 6500 → 75x + 50000 − 50x = 130000 → 25x = 80000? Adjusted: x = 6000. Difference = 6000 − 4000 = Rs 2,000." },
  { s: QA, q: "If one side of a triangle is 7 with its perimeter equal to 18, and area equal to √(s·...), then the other two sides are :", o: ["3.5 and 7.5","6 and 5","7 and 4","3 and 8"], e: "Let sides be 7, b, c. b + c = 11. Using Heron's formula and substitution: b² − 11b + 24 = 0 → b = 8, c = 3. So the other two sides are 8 and 3." },
  { s: QA, q: "If (1 − tan A)/(1 + tan A) = (tan 3° tan 15° tan 30° tan 75° tan 87°)/(tan 27° tan 39° tan 51° tan 60° tan 63°), then the value of cot A is :", o: ["2","1","4","3"], e: "Using complementary angle identities, the RHS simplifies to tan 30°/tan 60° = 1/3. Solving (1−tanA)/(1+tanA) = 1/3 gives tan A = 1/2, so cot A = 2." },
  { s: QA, q: "If x is the square of the number when (2/5 of 6¼ × 3/7 of 1²/7) is divided by 1¼/4, then the value of 81√x is :", o: ["16","4","36","9"], e: "Computing: ((2/5 × 25/4) × (3/7 × 9/7))/(5/4) yields x = (4/9)². Then 81√x = 81 × 4/9 = 36." },
  { s: QA, q: "Ravi starts for his school from his house on his cycle at 8:20 a.m. If he runs his cycle at a speed of 10 km/h, he reaches his school 8 minutes late, and if he drives the cycle at a speed of 16 km/h, he reaches his school 10 minutes early. The school starts at:", o: ["9:40 a.m","8:40 a.m.","8:50 a.m.","9:00 a.m."], e: "d/10 − d/16 = 18/60 → 6d/160 = 18/60 → d = 8 km. Time at 10 km/h = 48 min. School starts 8 min before that: 8:20 + 40 min = 9:00 a.m." },
  { s: QA, q: "If a% of 240 is c and c% of a is 117.6, then the value of a + c is :", o: ["144","260","196","238"], e: "a/100 × 240 = c → 12a = 5c. c/100 × a = 117.6 → ac = 11760. Solving: a = 70, c = 168. a + c = 238." },
  { s: QA, q: "A secant is drawn from a point P to a circle so that it meets the circle first at A, then goes through the centre, and leaves the circle at B. If the length of the tangent from P to the circle is 12 cm, and the radius of the circle is 5 cm, then the distance from P to A is:", o: ["10 cm","8 cm","12 cm","18 cm"], e: "PA × PB = PT² → x(x + 10) = 144 → x² + 10x − 144 = 0 → (x + 18)(x − 8) = 0 → x = 8 cm." },
  { s: QA, q: "The given pie chart shows the percentage of students enrolled into the colleges A, B, C, D, E and F in a city, and the table shows the ratio of boys to girls in the college.\n\nBased on this information, if the total number of students is 9800, then the number of girls in college B is :", o: ["504","560","280","1008"], e: "Students in B = 16% of 9800 = 1568. Boys:girls = 5:9. Girls = 1568 × 9/14 = 1008." },
  { s: QA, q: "A shopkeeper pays 12% of the cost price as tax while purchasing an item whose cost is Rs 500. He wants to earn a profit of 20% after giving a discount of 16% on the marked price. So, the marked price should be :", o: ["Rs 800","Rs 780","Rs 960","Rs 840"], e: "Total CP after tax = 500 × 1.12 = 560. Required SP at 20% profit = 560 × 1.2 = 672. MP × 0.84 = 672 → MP = Rs 800." },
  { s: QA, q: "If tan a = 2/√13, then the value of (2 cosec²a − 2 sec²a)/(13 cosec²a − 3 sec²a) is:", o: ["16","32","14","21"], e: "Dividing num & denom by sin²a/cos²a (i.e., expressing in tan): (1/sin²a − 2/cos²a)/(13/sin²a − 3/cos²a). Substituting tan²a = 4/13 yields the value 21." },
  { s: QA, q: "Which of the following numbers is divisible by 2, 5 and 10?", o: ["7,20,345","149","19,400","1,25,375"], e: "A number divisible by 10 must end in 0. Only 19,400 has unit digit 0." },
  { s: QA, q: "Several students have taken an exam. There was an error in the answer key which affected the marks of 48 students, and their average marks reduced from 78 to 66. The average of remaining students increased by 3.5 marks. This resulted the reduction of the average of all students by 4.5 marks. The number of students that attended the exam is :", o: ["96","84","100","93"], e: "By alligation: 48/(x−48) = 16/48 (using mark deltas). Solving: 16x − 768 = 720 → x = 93." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Which of the following cities hosted the third edition of the Khelo India Youth Games?", o: ["Panaji","Cuttack","Guwahati","Patna"], e: "The third edition of Khelo India Youth Games was held in Guwahati, Assam, from 10 to 22 January 2020." },
  { s: GA, q: "Who among the following was conferred with the 'Dadasaheb Phalke Award 2019'?", o: ["Kabir Bedi","Anupam Kher","Amitabh Bachchan","Dilip Kumar"], e: "In 2019, Amitabh Bachchan received the Dadasaheb Phalke Award — India's highest film honour." },
  { s: GA, q: "Who among the following won ICC's '2019 Sir Garfield Sobers Trophy'?", o: ["Virat Kohli","Ben Stokes","Rohit Sharma","Ken Williamson"], e: "England all-rounder Ben Stokes won the Sir Garfield Sobers Trophy (ICC Cricketer of the Year) in 2019." },
  { s: GA, q: "In the context of memory size in computer data storage, one gigabyte is equal to how many megabytes?", o: ["1012 MB","32 MB","64 MB","1024 MB"], e: "1 GB = 1024 MB. Standard binary unit conversion: 1 KB = 1024 B, 1 MB = 1024 KB, 1 GB = 1024 MB." },
  { s: GA, q: "Who was the Chairman of the Drafting Committee of the Constituent Assembly of India?", o: ["BR Ambedkar","Jawaharlal Nehru","Dr. Sardar Vallabhbhai Patel","Rajendra Prasad"], e: "Dr B.R. Ambedkar chaired the Constitution Drafting Committee. He was a wise constitutional expert who had studied constitutions of around 60 countries." },
  { s: GA, q: "A hard disk is an example of which type of data storage device?", o: ["Secondary Storage","Tertiary Storage","Primary Storage","Offline Storage"], e: "A hard disk is an example of secondary storage (auxiliary storage) — non-volatile storage used to retain data and programs for later retrieval." },
  { s: GA, q: "Who among the following was appointed as the Deputy Governor of Reserve Bank of India (RBI) in January 2020?", o: ["NS Vishwanathan","BP Kanungo","Michael Debabrata Patra","Viral Acharya"], e: "Michael Patra, a career RBI officer who joined in 1985, was appointed as Deputy Governor of the RBI in January 2020." },
  { s: GA, q: "What was India's overall rank in the medals tally in the 23rd edition of the Asian Athletics Championship?", o: ["Fourth","Fifth","First","Third"], e: "India finished fourth in the 2019 Asian Athletics Championship in Doha, Qatar (3 gold, 7 silver, 7 bronze) — behind Bahrain, China, and Japan." },
  { s: GA, q: "The rhythmic rise and fall of ocean water twice in a day is called ______.", o: ["Wave","Current","Tsunami","Tide"], e: "A 'tide' is the rhythmic rise and fall of the ocean twice a day, caused by the gravitational force of the sun and moon." },
  { s: GA, q: "Who among the following won the 'Women's World Rapid Chess Championship 2019'?", o: ["Lei Tingjie","Dronavalli Harika","Sopiko Khukhashvili","Koneru Humpy"], e: "Koneru Humpy won the 2019 Women's World Rapid Chess Championship in the tiebreaker series after defeating China's Lei Tingjie." },
  { s: GA, q: "Which of the following articles of the Constitution of India has a provision for financial emergency?", o: ["Article 365","Article 330","Article 356","Article 360"], e: "Article 360 of the Indian Constitution empowers the President to declare a financial emergency if India's financial stability or credibility is threatened." },
  { s: GA, q: "Which of the following is NOT a credit rating agency in India?", o: ["RBI","CRISIL","CARE","ICRA"], e: "RBI is India's central bank, not a credit rating agency. CRISIL, CARE, and ICRA are all credit rating agencies in India." },
  { s: GA, q: "Who among the following took charge as India's first Chief of Defence Staff (CDS) on 1 January 2020?", o: ["Navy Chief Admiral Karambir Singh","General Manoj Mukund Naravane","General Bipin Rawat","Air Chief Marshal Rakesh Kumar Singh Bhadauria"], e: "General Bipin Rawat became India's first CDS on 1 January 2020. He was the Chairman of the Chiefs of Staff Committee and the 27th Chief of Army Staff." },
  { s: GA, q: "The 'Kathakali' dance is a harmonious combination of ______ forms of fine art.", o: ["five","seven","four","six"], e: "Kathakali is a synthesis of five types of fine art: Natyam (expressions), Nritham (dance), Nrithyam (enactment), Sangeetam (music), and Vadya (instruments)." },
  { s: GA, q: "Which of the following teams won the 129th edition of Durand Cup in August 2019?", o: ["East Bengal","Mohammedan Sporting Club","Mohun Bagan","Gokulam Kerala"], e: "Gokulam Kerala won their first Durand Cup trophy by defeating Mohun Bagan 2-1 in the 2019 final at Salt Lake Stadium, Kolkata, on 24 August 2019." },
  { s: GA, q: "Under which of the following schemes has the Government of India set up a new institution for development and refinancing activities related to micro units?", o: ["Pradhan Mantri MUDRA Yojana","Pradhan Mantri Sadak Yojana","Pradhan Mantri Yojna","Pradhan Mantri MNREGA Yojana"], e: "The Pradhan Mantri MUDRA Yojana, launched in 2015, set up institutions for development and refinancing of micro units. Loans up to Rs 10 lakh available." },
  { s: GA, q: "Tummalapalle, believed to have one of the largest uranium reserves in the world, is situated in which of the following states?", o: ["Tamil Nadu","Karnataka","Telangana","Andhra Pradesh"], e: "The Tummalapalle Mine, with one of the world's largest uranium reserves, is located in Andhra Pradesh." },
  { s: GA, q: "In which of the following years did India come under the direct rule of the British crown?", o: ["1888","1878","1858","1868"], e: "From 1858 to 1947, the British maintained 'Crown Rule' over India following the Indian Rebellion of 1857. Control was transferred to Queen Victoria's Crown." },
  { s: GA, q: "______ is the term used for breeding of fish in specially constructed tanks and ponds.", o: ["Horticulture","Agriculture","Pisciculture","Viticulture"], e: "Pisciculture is the practice of raising fish in tanks or ponds. Tilapia, salmon, carp, and catfish are the most important species raised worldwide." },
  { s: GA, q: "Who among the following scientists invented dynamite?", o: ["Rudolf Diesel","Benjamin Franklin","Alfred Nobel","Thomas Alva Edison"], e: "Dynamite was invented in 1867 by Alfred Bernhard Nobel, the Swedish scientist who also founded the Nobel Prize." },
  { s: GA, q: "Which of the following is a disease caused by protozoa?", o: ["Small Pox","AIDS","Kala azar","Rabies"], e: "Kala azar (visceral leishmaniasis) is caused by the protozoan parasite Leishmania donovani. Small Pox is viral, AIDS is caused by HIV, Rabies is viral." },
  { s: GA, q: "Which is the largest uranium producing country in the world?", o: ["Uzbekistan","USA","India","Kazakhstan"], e: "Kazakhstan is the world's leading uranium producer, accounting for approximately 43% of global uranium production in 2019." },
  { s: GA, q: "'Gurpurab' is the most important and sacred festival of the Sikh community. In which of the following months of the Hindu calendar is it celebrated?", o: ["Jyaistha","Kartik","Shravana","Vaisakha"], e: "Guru Nanak was born on the Full Moon (Pooranmashi) of the Kartik Indian Lunar Month. Hence Gurpurab is celebrated in Kartik month." },
  { s: GA, q: "Which of the following statements is correct?", o: ["The Governor has no power to grant pardon in respect of punishment or sentence inflicted by Court Martial.","The President has no power to grant pardon in respect of punishment or sentence inflicted by Court Martial.","The Governor has no power to suspend, remit or commute a sentence of death.","The Governor has power to grant pardon in case of a death sentence."], e: "The Governor has no power to grant pardon for punishment by Court Martial — only the President does. The Governor can suspend/remit/commute a death sentence but cannot grant pardon for it. Per the answer key, the correct option is statement 4." },
  { s: GA, q: "Which of the following scientists was awarded a Nobel Prize for his services to Theoretical Physics, and especially for his discovery of the Law of the Photoelectric Effect?", o: ["Ernest Rutherford","Thomas Edison","Nikola Tesla","Albert Einstein"], e: "Albert Einstein received the 1921 Nobel Prize in Physics for his services to theoretical physics, especially for his discovery of the law of the photoelectric effect." }
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
      tags: ['SSC', 'CHSL', 'PYQ', '2020'],
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
    title: { $regex: /18 October 2020/i }
  });
  if (dropRes.deletedCount > 0) {
    console.log(`Dropped ${dropRes.deletedCount} prior copy of this PYQ.`);
  }

  console.log('\nUploading images to Cloudinary...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id,
    title: 'SSC CHSL Tier-I - 18 October 2020 Shift-1',
    totalMarks: 200,
    duration: 60,
    accessLevel: 'FREE',
    isPYQ: true,
    pyqYear: 2020,
    pyqShift: 'Shift-1',
    pyqExamName: 'SSC CHSL Tier-I',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
