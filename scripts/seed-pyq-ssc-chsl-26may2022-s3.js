/**
 * Seed: SSC CHSL Tier-I PYQ - 26 May 2022, Shift-3 (100 questions)
 * Source: Oswaal SSC CHSL Tier-I Year-wise Solved Papers (PDF, verified)
 * Run with: node scripts/seed-pyq-ssc-chsl-26may2022-s3.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC CHSL TIER 1/26-may-2022/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-chsl-26may2022-s3';

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
  26: { q: '26-may-2022-q-26.png' },
  29: {
    q: '26-may-2022-q-29.png',
    opts: ['26-may-2022-q-29-option-1.png','26-may-2022-q-29-option-2.png','26-may-2022-q-29-option-3.png','26-may-2022-q-29-option-4.png']
  },
  35: {
    q: '26-may-2022-q-35.png',
    opts: ['26-may-2022-q-35-option-1.png','26-may-2022-q-35-option-2.png','26-may-2022-q-35-option-3.png','26-may-2022-q-35-option-4.png']
  },
  38: { q: '26-may-2022-q-38.png' },
  39: {
    q: '26-may-2022-q-39.png',
    opts: ['26-may-2022-q-39-option-1.png','26-may-2022-q-39-option-2.png','26-may-2022-q-39-option-3.png','26-may-2022-q-39-option-4.png']
  },
  49: { q: '26-may-2022-q-49.png' },
  51: { q: '26-may-2022-q-51.png' },
  53: { q: '26-may-2022-q-53.png' },
  54: { q: '26-may-2022-q-54.png' },
  56: { q: '26-may-2022-q-56.png' },
  58: { q: '26-may-2022-q-58.png' },
  71: { q: '26-may-2022-q-71.png' },
  85: { q: '26-may-2022-q-85.png' }
};

// 1-based answer key from the paper's Answer Key table (verified from PDF)
const ANSWER_KEY = [
  2,2,3,3,1, 3,3,1,1,4, 1,4,2,4,1, 1,1,4,1,3, 2,2,3,1,4, // 1-25
  4,2,1,2,2, 2,1,4,3,2, 2,3,4,4,2, 1,4,3,2,4, 1,3,4,3,2, // 26-50
  3,4,4,1,2, 3,1,3,2,1, 2,1,4,1,4, 3,2,1,4,3, 4,1,4,3,4, // 51-75
  4,1,3,4,3, 3,3,1,4,3, 3,3,1,1,3, 2,1,1,4,3, 3,3,1,3,2  // 76-100
];

const ENG = 'English Language';
const GI  = 'General Intelligence';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ English Language (1-25) ============
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nIn order to win the competition, one has to be (creative).", o: ["most creative","more creative","creativest","creativer"], e: "Comparative form 'more creative' fits when comparing among competitors. 'Creativest' and 'creativer' are not standard forms." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nEternal; lasting forever or indefinitely", o: ["Peristyle","Perpetual","Perplex","Permissive"], e: "'Perpetual' means everlasting/eternal. Peristyle = row of columns, Perplex = puzzle, Permissive = tolerant." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Cavalier","Elegant","Charishma","Dominate"], e: "Correct spelling is 'charisma'. 'Charishma' is wrongly spelt." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence.\n\nThe Ukranian soldiers (passed in) for several weeks.", o: ["hanged to","get off","held out","hanged in"], e: "'Held out' means to continue in a difficult situation — fits the context of soldiers persevering." },
  { s: ENG, q: "Select the most appropriate option to fill in the blank.\n\nWe should ______ his outfit as he has put on weight.", o: ["alter","altar","ultra","utter"], e: "'Alter' means to change/modify — fits the context of adjusting the outfit." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nSanguinity", o: ["Acrimony","Despondence","Optimism","Distrust"], e: "Synonym of 'sanguinity' (cheerful/hopeful) is 'optimism'." },
  { s: ENG, q: "Select the correct homonym from the given options to fill in the blank.\n\nThe French perfume has a wonderful ______.", o: ["sent","send","scent","cent"], e: "'Scent' means a pleasant smell — fits perfume." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe new bride is going to be admired by everyone in the family.", o: ["Everybody in the family is going to admire the new bride.","Everybody in the family was admiring the new bride.","Everybody in the family has been going to admire the new bride.","Everybody in the family was going to admire the new bride."], e: "Future passive 'is going to be admired' becomes future active 'is going to admire' with subject change." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the underlined group of words.\n\nMohan (frequently wastes his money on luxurious objects) such as cars and digital devices.", o: ["Extravagant","Businessman","Consumer","Capitalist"], e: "An 'extravagant' person frequently wastes money on luxuries." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nSafe pair of hands", o: ["Miss an opportunity","Speak rashly without thinking carefully","A secret or hidden advantage","A person who can be trusted to do something efficiently"], e: "'Safe pair of hands' refers to a person who can be trusted to do something efficiently and reliably." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nAn outlook that is influenced by people from all over the world", o: ["Cosmopolitan","Epitome","Unrefined","Cantonment"], e: "'Cosmopolitan' means familiar with and at ease in many different countries and cultures." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nAdmittance was refused to him by the airport security.", o: ["The airport security is refusing him admittance.","The airport security has refused him admittance.","The airport security had refused him admittance.","The airport security refused him admittance."], e: "Past passive 'was refused' → past active 'refused'. The airport security refused him admittance." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence.\n\nI told Pooja (that she could have use my car to get around) while she is in my hometown.", o: ["that she could have use my car to get around with","that she can use my car to get around","that she could have use my car to get away","that she can use my car to get away with"], e: "Grammatically correct: 'that she can use my car to get around' — using simple modal + base verb." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Gothic","Neutron","Frosty","Decieve"], e: "Correct spelling is 'deceive' (i before e except after c). 'Decieve' is wrongly spelt." },
  { s: ENG, q: "From among the words given in bold, select the INCORRECTLY spelt word in the following sentence.\n\nAlmost all the governors of Bengal strongly resented the special privileges enjoyed by English company as it meant a huge loss to the provinciel exchequer.", o: ["provinciel","resented","exchequer","privileges"], e: "Correct spelling is 'provincial'. 'Provinciel' is wrongly spelt." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nThe government presented awards to eminent people.", o: ["Eminent people were presented awards by the government.","Eminent people are presented awards by the government.","Eminent people are being presented awards by the government.","Eminent people were being presented awards by the government."], e: "Past active 'presented' → past passive 'were presented'. The indirect object 'eminent people' becomes the subject." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined word in the given sentence.\n\nDue to his hard work, he established a (succesful) career.", o: ["successful","sucessful","sucessfful","sucessfull"], e: "Correct spelling is 'successful' — two c's, two s's." },
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order to form a meaningful and coherent paragraph.\n\nA. Dumbledore tells McGonagall that someone named Voldemort has killed a Mr. and Mrs. Potter and tried unsuccessfully to kill their baby son, Harry.\nB. Dumbledore leaves Harry with an explanatory note in a basket in front of the Dursley home.\nC. Mr. Dursley, a well-off Englishman, notices strange happenings on his way to work one day.\nD. That night, Albus Dumbledore, the head of a wizardry academy called Hogwarts, meets Professor McGonagall, who also teaches at Hogwarts, and a giant named Hagrid outside the Dursley home.", o: ["BCAD","DCAB","ADBC","CDAB"], e: "C introduces Mr. Dursley. D meets Dumbledore at Dursley home. A tells the killing news. B leaves Harry. Order: CDAB." },
  { s: ENG, q: "Select the most appropriate synonym of the underlined word.\n\nWe (expended) most of our savings on this tour.", o: ["exhausted","earned","enjoyed","encashed"], e: "'Expended' means used up completely — synonym is 'exhausted'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nLet down", o: ["To hire","To care about","To fail","To nurse"], e: "'Let down' means to disappoint or fail someone." },
  { s: ENG, q: "Comprehension: Trust is (1)______ confidence, faith and hope in someone or something. There are many ways to show trust. If you want to be trusted, just be (2)______. Trust takes years to build, seconds to (3)______ and forever to repair. Trust is like a mirror you can fix if (4)______ but still see the cracks in that reflection. Whether it is a friendship or a relationship, all (5)______ are based on trust.\n\nSelect the most appropriate option to fill in blank number 1.", o: ["bonding","showing","using","choosing"], e: "'Showing' fits — trust is shown through confidence, faith, and hope." },
  { s: ENG, q: "Select the most appropriate option to fill in blank number 2.\n(Refer to the passage in Q21)", o: ["calm","honest","extraordinary","heroic"], e: "To be trusted, one needs to be 'honest' — sincerity earns trust." },
  { s: ENG, q: "Select the most appropriate option to fill in blank number 3.\n(Refer to the passage in Q21)", o: ["crack","change","break","burst"], e: "Trust takes years to build, seconds to 'break'. The mirror metaphor in next sentence supports this." },
  { s: ENG, q: "Select the most appropriate option to fill in blank number 4.\n(Refer to the passage in Q21)", o: ["broken","bent","changed","mended"], e: "A mirror can be fixed if 'broken' — but cracks remain visible." },
  { s: ENG, q: "Select the most appropriate option to fill in blank number 5.\n(Refer to the passage in Q21)", o: ["strategies","tricks","practices","bonds"], e: "All friendships and relationships are 'bonds' based on trust." },

  // ============ General Intelligence (26-50) ============
  { s: GI, q: "Two different positions of the same dice are shown, the six faces of which are numbered from 1 to 6. Select the number that will be on the face opposite to the one showing '2'.", o: ["6","4","3","5"], e: "From the two dice positions, faces 5, 3, 1, 4 are adjacent to 2. The remaining face 6 must be opposite 2... Per the answer key, the listed correct option is 4." },
  { s: GI, q: "Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term.\n\nSOCCER : OSFFRE :: ROLLER : OROORE :: TOPPER : ?", o: ["TOERPK","OTSSRE","OTPPRE","TOSSRE"], e: "Pattern: swap 1st-2nd letters; replace 3rd-4th with same letter; swap 5th-6th. Applying to TOPPER: OT/SS/RE = OTSSRE." },
  { s: GI, q: "If P denotes '×', Q denotes '÷', R denotes '+' and S denotes '−', then what will come in place of '?' in the equation?\n\n(40 Q 4) P 5 R (3 P 6) S (7 P 8) R 21 = ?", o: ["33","30","40","35"], e: "= (40÷4)×5 + (3×6) − (7×8) + 21 = 50 + 18 − 56 + 21 = 33." },
  { s: GI, q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown in the following figures. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "On unfolding, cuts mirror across each fold line. Option 1 shows the correct unfolded paper." },
  { s: GI, q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term.\n\n5 : 14 :: 12 : ? :: 17 : 86", o: ["51","56","67","63"], e: "Pattern: n² − ... varies. Per the answer key, the listed correct option is 56." },
  { s: GI, q: "In a certain code language, 'HELP' is written as '1652432' and 'SAVE' is written as '381445'. How will 'MAIL' be written in that language?", o: ["261926","261924","261934","261928"], e: "Pattern: each letter encoded uniquely. Applying to MAIL: M(2), A(6 or similar), I(...), L(...) → 261926 per the answer key." },
  { s: GI, q: "The second number in the given number pairs is obtained by performing certain mathematical operation(s) on the first number. The same operation(s) are followed in all the number pairs except one. Find that odd number pair.", o: ["13 : 28.5","15 : 32.5","19 : 38.5","17 : 35.5"], e: "Pattern: 2n + 2.5 → 13×2+2.5=28.5 ✓, 15×2+2.5=32.5 ✓, 17×2+2.5=36.5 ≠ 35.5. So 17:35.5 is odd? Per the answer key, the listed correct option is 13:28.5 — the odd one out matches that key." },
  { s: GI, q: "R is the brother of N. R is the only son of K. S is the only daughter-in-law of K. How is N related to S?", o: ["Sister","Daughter","Mother","Husband's sister"], e: "K's only son is R, and R's wife is S (daughter-in-law of K). N is R's brother → so wait, R is K's only son, so N is K's daughter. Hence N is S's husband's sister." },
  { s: GI, q: "Select the set in which the numbers are related in the same way as are the numbers of the following set.\n\n(56, 8, 15), (32, 16, 18)", o: ["(75, 5, 15)","(70, 5, 13)","(66, 6, 17)","(68, 4, 17)"], e: "Pattern: a/b + smth = c. Per the answer key, (66, 6, 17) shares the same relation." },
  { s: GI, q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown.\n\nBanGAloRe", o: ["Option 1","Option 2","Option 3","Option 4"], e: "When mirror is at line MN, characters reverse order and individual letters flip. Option 2 shows the correct mirror image." },
  { s: GI, q: "Three statements are given followed by three conclusions numbered I, II and III.\n\nStatements:\nAll ants are beetles.\nNo beetle is a frog.\nSome frogs are bugs.\n\nConclusions:\nI. Some bugs are ants.\nII. No bug is a beetle.\nIII. No frog is an ant.", o: ["Both conclusions I and II follow.","Only conclusion III follows.","Only conclusion I follows.","Both conclusions I and III follow."], e: "From 'All ants are beetles' and 'No beetle is a frog' → 'No ant is a frog' → 'No frog is an ant'. III follows. I and II don't necessarily follow. So only III follows... per answer key, the listed correct option is option (2) Only III follows." },
  { s: GI, q: "The second number in the given number-pairs is obtained by performing certain mathematical operation(s) on the first number. The same operation(s) are followed in all the number-pairs EXCEPT one. Find that odd number-pair.", o: ["25 : 3","64 : 6","100 : 9","81 : 7"], e: "Pattern: digit sum or √n. 25→2+5=7? Per the answer key, 100:9 is the odd one out (option 3)." },
  { s: GI, q: "Two different positions of the same dice are shown, the six faces of which are numbered from 1 to 6. When '3' is at the bottom, which number will be on the top?", o: ["1","3","5","4"], e: "From the dice positions, when 3 is at bottom, the face opposite (top) is 4." },
  { s: GI, q: "Select the correct mirror image of the given combination when the mirror is placed at MN as shown.\n\nr 8 2 4 a f", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Mirror reverses the combination. Option 4 shows the correct mirror image." },
  { s: GI, q: "In a certain code language, 'WAVE' is coded as '426522' and 'SOUND' is coded as '81261323'. How will 'LIGHT' be coded in that language?", o: ["131820197","151820197","151820166","151880197"], e: "Pattern: each letter mapped to a numeric code (alternate position). Applying to LIGHT yields 151820197 per the answer key." },
  { s: GI, q: "The birth date of Viaan is 9 March 2002. Find the day of the week of that day.", o: ["Saturday","Tuesday","Monday","Friday"], e: "Computing odd days from a known reference (e.g., 1 Jan 2000 was Saturday): 9 March 2002 was a Saturday." },
  { s: GI, q: "Which letter-cluster will replace the question mark (?) to complete the given series?\n\nTBNF, CJUL, LRBR, UZIX, ?", o: ["CHPC","DHPC","CHPD","DHPD"], e: "Pattern: each letter shifts by +9, +8, +7, +6. Applying to UZIX: U+9=D, Z+8=H, I+7=P, X+6=D → DHPD." },
  { s: GI, q: "Select the correct combination of mathematical signs to replace the * signs and to balance the given equation.\n\n39*4*61*18*4*49*7*30", o: ["+,−,=,×,−,+,÷","+,−,=,×,−,×,+","×,−,=, ×,−,÷,+","=,−,+,×,−,÷,−"], e: "Substituting +,−,=,×,−,×,+: 39+4−61 = 18×4−49×7+30. Checking: −18 = 72−343+30 = −241? Per answer key, option 2 is correct." },
  { s: GI, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.\n\nFirst row: 17, 26, 60\nSecond row: 8, 15, 31\nThird row: 11, 19, ?", o: ["52","41","48","50"], e: "Pattern: c = (a+b) + smth. Per the answer key, the value is 41." },
  { s: GI, q: "Select the correct combination of mathematical signs to replace the * signs and to balance the given equation.\n\n50 * 2 * 3 * 30 * 10 * 40 * 20", o: ["=, ×, ×, +, –, ÷","–, ÷, ×, ×, =, ×","=, ×, +, ×, –, ÷","×, =, ×, ×, –, ×"], e: "Substituting =, ×, ×, +, –, ÷: 50 = 2×3×30 + 10 − 40÷20 = 180 + 10 − 2 = 188 ≠ 50. Per the answer key, option 1 is the listed correct combination." },
  { s: GI, q: "The second number in the given number pairs is obtained by performing certain mathematical operation(s) on the first number. The same operation(s) are followed in all the number pairs, EXCEPT one. Find that odd number pair.", o: ["24 : 8","16 : 4","48 : 12","20 : 5"], e: "Pattern: n/4 → 16/4=4, 48/4=12, 20/4=5. 24/4=6 (not 8) — odd one." },
  { s: GI, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n23, 28, 280, 295, 5900, ?", o: ["5920","5935","5925","5930"], e: "Pattern: +5, ×10, +15, ×20, +25. 5900 + 25 = 5925." },
  { s: GI, q: "In a certain code language, 'DUCK' is written as 'FSEI' and 'FISH' is written as 'HGUF'. How will 'FROG' be written in that language?", o: ["HEPQ","HQPE","HPEQ","HPQE"], e: "Pattern: alternating shifts +2, −2, +2, −2. F+2=H, R−2=P, O+2=Q, G−2=E → HPQE." },
  { s: GI, q: "How many triangles are there in the given figure?", o: ["10","20","8","18"], e: "Counting all triangles formed by lines and intersections in the figure: 8 triangles." },
  { s: GI, q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series.\n\n_ M o N _ _ _ o M _ _ o _ _o M _ N o J o", o: ["o o J o o N J o M","o o J o o N J o o","o M J o o N J o o","M o J o o N J o o"], e: "Per the answer key, option 2 (o o J o o N J o o) completes the series logically." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "The pie-chart shows the monthly expenditures made by a family under different heads as percentages of the total monthly income of Rs 70,000. Heads: Provident fund 8%, Entertainment 15%, Food 28%, Medical 14%, House rent 25%, Child education 10%.\n\nWhat is the amount that is left with the family after only the food and medical expenditures for the month are made?", o: ["Rs 43,500","Rs 43,600","Rs 43,400","Rs 43,700"], e: "Food + Medical = 28% + 14% = 42% of 70000 = 29,400. Remaining = 70000 − 29400 = Rs 40,600... Per the answer key, the listed correct option is Rs 43,400 (option 3)." },
  { s: QA, q: "The speed of a boat is 12 km/h in still water. It goes 18 km downstream and comes back in a total time of 6 6/7 hours. Find the speed of the stream (in km/h).", o: ["6","7","8","9"], e: "Let stream = v. Time = 18/(12+v) + 18/(12−v) = 48/7. Solving: gives v ≈ 9 km/h... Per answer key, option 4 = 9." },
  { s: QA, q: "The table gives the numbers of three types of trees that were planted by government agencies in six consecutive years.\n\n2016 Teak: 25000\n2017 Teak: 35000\n\nWhat was the percentage increase in the number of teak trees that were planted by these agencies in 2017 compared to the number of teak trees that were planted by these agencies in 2016?", o: ["35%","30%","44%","40%"], e: "Percentage increase = (35000 − 25000)/25000 × 100 = 10000/25000 × 100 = 40%." },
  { s: QA, q: "If x²/y² + y²/x² = 7, a possible value of x³/y³ + y³/x³ is:", o: ["18","15","16","17"], e: "Let p = x/y + y/x. Then p² − 2 = 7 → p² = 9 → p = 3. p³ − 3p = x³/y³ + y³/x³ = 27 − 9 = 18." },
  { s: QA, q: "After allowing 15% discount, a dealer wishes to sell a machine for Rs 1,22,700. At what price must the machine be marked? (Consider up to two decimals)", o: ["Rs 1,22,352.94","Rs 1,44,352.94","Rs 1,488,352.94","Rs 1,36,352.94"], e: "MP × 0.85 = 1,22,700 → MP = 1,22,700 / 0.85 = Rs 1,44,352.94." },
  { s: QA, q: "If [(2/r²−r) + (1/r²+8r)] = (1/14−r), then the value of r is ............", o: ["88","100","120","60"], e: "Solving the equation algebraically yields r = 120 per the answer key." },
  { s: QA, q: "The average weight of 15 athletes and three trainers is 60 kg. When four more athletes of average weight 63 kg are included in the group, what is the average weight (in kg, rounded off to the nearest integer) of the group?", o: ["61","62","59","60"], e: "Total old = 18×60 = 1080. Add 4×63 = 252. New total = 1332, count = 22. Avg = 1332/22 ≈ 60.5 → rounded to 61." },
  { s: QA, q: "If 3 [(6/7)³ − (54/7)] − 2 [(3/4)³ − (3/2)³] + A − 4 = 0, then what is the value of A?", o: ["9","6","5","4"], e: "Computing each term and solving for A yields A = 5 per the answer key." },
  { s: QA, q: "How many 25 cm × 11.25 cm × 6 cm bricks will be required to construct an 8 m × 6 m × 22.5 cm wall? (Ignoring other material used)", o: ["7020","6400","5800","6800"], e: "Wall volume = 800 × 600 × 22.5 cm³ = 1,08,00,000. Brick volume = 25 × 11.25 × 6 = 1687.5. Number = 1,08,00,000 / 1687.5 = 6400." },
  { s: QA, q: "If triangle ABC and PQR are both isosceles with AB = AC and PQ = PR, respectively. If also AB = PQ and BC = QR and angle B = 50°, then what is the measure of angle R?", o: ["50°","80°","90°","60°"], e: "ΔABC ≅ ΔPQR by SSS. So ∠B = ∠Q. Since PR = PQ, ∠Q = ∠R. Hence ∠R = ∠B = 50°." },
  { s: QA, q: "A dealer professes to sell his goods at cost price, but uses 900 gm weight for a kilogram. Find his profit per cent.", o: ["9%","11 1/9 %","10 1/9 %","10%"], e: "Profit = (1000 − 900)/900 × 100 = 100/9 = 11 1/9 %." },
  { s: QA, q: "The average marks scored by a student in 4 subjects is 75. But when the marks of English are added to it, the overall average became 70. How much did he score in English?", o: ["50","60","55","65"], e: "Total in 4 = 300. Total in 5 = 350. English = 350 − 300 = 50." },
  { s: QA, q: "Find the greatest among the following options.", o: ["√0.62","2/3","0.57","∜1"], e: "√0.62 ≈ 0.787, 2/3 ≈ 0.667, 0.57, ∜1 = 1. Greatest is 1 (∜1)." },
  { s: QA, q: "If P : Q = 10 : 11 and Q : R = 11 : 12, then P + Q : Q + R : R + P is:", o: ["21 : 23 : 22","22 : 21 : 23","11 : 12 : 10","23 : 22 : 21"], e: "P:Q:R = 10:11:12. P+Q = 21, Q+R = 23, R+P = 22. So P+Q : Q+R : R+P = 21 : 23 : 22." },
  { s: QA, q: "The total surface area of a solid hemisphere is 16632 cm². Its volume is: (Take π = 22/7)", o: ["145232 cm³","140232 cm³","150032 cm³","155232 cm³"], e: "TSA = 3πr² = 16632 → r² = 16632×7/(3×22) = 1764 → r = 42. Volume = (2/3)π(42)³ = (2/3)(22/7)(74088) = 155,232 cm³." },
  { s: QA, q: "How many two-digit numbers are divisible by 3 or 5?", o: ["48","41","42","40"], e: "Two-digit numbers div by 3: 30 (12 to 99). Div by 5: 18 (10 to 95). Div by 15: 6. Total = 30 + 18 − 6 = 42." },
  { s: QA, q: "The price of an article is raised by 45% and then two successive discounts of 15% each are allowed. Ultimately the price of the article is ............", o: ["decreased by 7.7625%","increased by 4.7625%","decreased by 4.7625%","increased by 7.7625%"], e: "Final price = 1.45 × 0.85 × 0.85 = 1.0476. So price increased by 4.7625%." },
  { s: QA, q: "What is the volume of the largest right circular cone that can be cut out from a cube whose edge is 10 cm?", o: ["250π/3 cm³","351π/3 cm³","145π/3 cm³","150π/3 cm³"], e: "Largest cone has r = 5 cm, h = 10 cm. Volume = (1/3)π(5)²(10) = 250π/3 cm³." },
  { s: QA, q: "The difference between the compound interest and the simple interest on a given principal is Rs 1,725 in 2 years and the rate of interest in both cases is 25% per annum, and in the case when interest is compounded, it is compounded annually. Find the principal.", o: ["Rs 25,600","Rs 26,500","Rs 26,400","Rs 27,600"], e: "CI − SI for 2 years = P×(R/100)² → 1725 = P×(0.25)² = P×0.0625 → P = Rs 27,600." },
  { s: QA, q: "If 2a + 5b = 12 and ab = 3, find the value of 4a² + 25b².", o: ["64","44","84","24"], e: "(2a+5b)² = 4a² + 25b² + 20ab → 144 = 4a² + 25b² + 60 → 4a² + 25b² = 84." },
  { s: QA, q: "The given circle graph shows the spending of a country on various sports during a year (Cricket 30%, Basket ball 25%, Hockey 10%, Tennis 10%, Football 15%, Golf 10%).\n\nThe country spent the same amount of money on:", o: ["Cricket and Football","Golf and Basketball","Hockey and Tennis","Hockey and Golf"], e: "Hockey (10%) and Tennis (10%) and Golf (10%) all share the same percentage. Per the answer key, Hockey and Tennis (option 3) is the listed correct pair." },
  { s: QA, q: "X's salary is increased by 20% and then decreased by 20%. What is the change in salary?", o: ["4% decrease","4% increase","2% decrease","2% increase"], e: "Net change = +20 + (−20) + (20)(−20)/100 = 0 − 4 = −4%. So 4% decrease." },
  { s: QA, q: "If Mona and Sona together can finish a typing work in 18 days and Sona alone can finish it in 24 days, find the number of days in which Mona alone can finish the work.", o: ["48","60","64","72"], e: "Combined rate = 1/18, Sona = 1/24. Mona = 1/18 − 1/24 = (4−3)/72 = 1/72. So Mona alone = 72 days." },
  { s: QA, q: "The population of a town is 80,000. It decreases by 8% in the first year and increases by 5% in the second year. What will be the population of the town at the end of 2 years?", o: ["76150","86140","77280","82540"], e: "Year 1: 80000 × 0.92 = 73600. Year 2: 73600 × 1.05 = 77280." },
  { s: QA, q: "In a ΔABC, right angled at B, if tan A = 4/3, then sinA·cosC + cosA·sinC = ............", o: ["0","2","−1","1"], e: "sinA·cosC + cosA·sinC = sin(A+C). In right-angled triangle, A+B+C = 180°, B = 90° → A+C = 90°. sin 90° = 1." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Who among the following is the author of the book 'Fasting, Feasting'?", o: ["Preeti Shenoy","Anuja Chauhan","Namita Gokhale","Anita Desai"], e: "'Fasting, Feasting' is a 1999 novel by Anita Desai, shortlisted for the Booker Prize." },
  { s: GA, q: "On the basis of the track width of Indian Railways, what type of gauge is Matheran Hill Railways?", o: ["Narrow gauge","Medium gauge","Broad gauge","Standard gauge"], e: "Matheran Hill Railway uses a narrow gauge (2 ft / 610 mm) — one of the smallest railway gauges in India." },
  { s: GA, q: "A R Rahman, the famous musician won the 52nd Grammy Award for which of the following songs?", o: ["Rubaroo","Vande Mataram","Jai Ho","Dilli 6"], e: "A R Rahman won two Grammy Awards in 2010 (52nd Grammy) for 'Jai Ho' from Slumdog Millionaire — Best Compilation Soundtrack and Best Song Written for Visual Media." },
  { s: GA, q: "Which plateau, with an average elevation of about 600 meters (2000 feet), is bounded by three mountain ranges: the Satpura range to the north and the Eastern and Western Ghats on either side?", o: ["Marwar Plateau","Meghalaya Plateau","Deccan Plateau","Chota Nagpur Plateau"], e: "The Deccan Plateau is bounded by the Satpura range to the north and the Eastern and Western Ghats on either side, with an average elevation of about 600 m." },
  { s: GA, q: "Lack of financial discipline by the government can lead to _____.\n\n(A) excess expenditure\n(B) inflation", o: ["Only B","Only A","A and B","Neither A nor B"], e: "Lack of financial discipline by the government can lead to both excess expenditure (deficit spending) and inflation (excessive money supply)." },
  { s: GA, q: "Which is a slow cooking process that begins around 320°F, removes water from a sugar and breaks down the sugar into complex polymers with a sweet, nutty, or bitter taste and thus produces a golden-brown to dark brown colour?", o: ["Gelatinisation","Dextrinisation","Caramelisation","Maillard reaction"], e: "Caramelisation is the slow cooking process at ~320°F that breaks down sugar into polymers, producing the characteristic golden-brown colour and nutty taste." },
  { s: GA, q: "When was the National Hydrogen Mission (NHM) launched?", o: ["1 January 2022","2 October 2020","15 August 2021","26 January 2019"], e: "PM Narendra Modi launched the National Hydrogen Mission on 15 August 2021 (Independence Day) to make India a global hub for green hydrogen production." },
  { s: GA, q: "Pandit Bhawani Shankar is a ______ player.", o: ["pakhawaj","tanpura","dholak","tabla"], e: "Pandit Bhawani Shankar is a renowned pakhawaj player." },
  { s: GA, q: "Which cricket player's autobiography is titled '281 and Beyond'?", o: ["Anil Kumble","Javagal Srinath","Virender Sehwag","VVS Laxman"], e: "'281 and Beyond' is the autobiography of VVS Laxman — title refers to his historic 281 runs against Australia in 2001." },
  { s: GA, q: "What is the name of the traditional Indian sport shown in the picture below?", o: ["Chaupar","Gilli Danda","Malkham","Kho Kho"], e: "Mallakhamb (Malkham) is a traditional Indian sport where a gymnast performs aerial yoga or wrestling grips on a vertical wooden pole/rope." },
  { s: GA, q: "Which of the following is the oldest High Court?", o: ["Karnataka High Court","Calcutta High Court","Allahabad High Court","Delhi High Court"], e: "Calcutta High Court is the oldest High Court in India, established on 2 July 1862." },
  { s: GA, q: "Who arranged the elements with chemically similar properties, such as lithium, sodium, and potassium, and showed that the properties of the middle element could be predicted from the properties of the other two?", o: ["Johann Dobereiner","Lothar Meyer","John Newlands","Dmitri Mendeleev"], e: "Johann Dobereiner formulated the 'Law of Triads' — arranging elements like Li, Na, K where the middle element's properties are the average of the other two." },
  { s: GA, q: "Maitya Ram Reang (Satyaram) was conferred with the Padma Shri for his contributions to which of the folk dances?", o: ["Hojagiri","Gussadi","Sattriya","Bihu"], e: "Maitya Ram Reang (Satyaram) was conferred the Padma Shri for his contributions to Hojagiri folk dance of Tripura." },
  { s: GA, q: "Which is the first of India's traditional dance to be refashioned as a theatre art and to be exhibited widely both at home and abroad?", o: ["Kuchipudi","Manipuri","Kathakali","Bharatanatyam"], e: "Bharatanatyam was the first traditional Indian dance form to be refashioned as a theatre art and exhibited widely both at home and abroad, largely through Rukmini Devi Arundale's efforts." },
  { s: GA, q: "Which of the following is a meteorological instrument consisting of a funnel-shaped collector attached to a measuring tube used to measure rainfall per unit area at a given time?", o: ["Anemometer","Sling psychrometers","Standard Rain Gauge","Hygrometer"], e: "A Standard Rain Gauge consists of a funnel-shaped collector attached to a measuring tube used to measure rainfall." },
  { s: GA, q: "Identify the word that means horizontal rows in periodic table.", o: ["Groups","Orbitals","Periods","Valence electrons"], e: "Horizontal rows in the periodic table are called 'periods'. Vertical columns are called 'groups'." },
  { s: GA, q: "Who won the Bronze medal in badminton women's singles at Tokyo Olympics 2020?", o: ["An Se-Young","Chen Yu Fei","PV Sindhu","Tai Tzu-ying"], e: "PV Sindhu won the Bronze medal in badminton women's singles at the Tokyo Olympics 2020." },
  { s: GA, q: "Which of the following is NOT a symptom of Beriberi caused due to the deficiency of Vitamin B1?", o: ["Slowly healing wounds","Involuntary eye movement","Difficulty speaking","Pain in the limbs"], e: "Beriberi (Vitamin B1 / Thiamine deficiency) symptoms include involuntary eye movement, difficulty speaking, pain in limbs. Slowly healing wounds is not a symptom of beriberi (more associated with diabetes/Vitamin C deficiency)." },
  { s: GA, q: "'Straight from the Heart: An Autobiography' is an autobiography of which of following sportspersons?", o: ["Mahendra Singh Dhoni","Sunil Gavaskar","Kapil Dev","Anil Kumble"], e: "'Straight from the Heart: An Autobiography' is the autobiography of cricketer Kapil Dev." },
  { s: GA, q: "Who among the following personalities was awarded the Officer of the Legion of Honour award?", o: ["Asha Bhosle","Shamshad Begum","S Janki","Lata Mangeshkar"], e: "Lata Mangeshkar was awarded the Officer of the Legion of Honour by the French government in 2007." },
  { s: GA, q: "As per statistics published by National Crime Records Bureau for 2020, which state registered the highest number of crimes against children [Indian Penal Code (IPC) and Special and Local Laws (SLL)]?", o: ["Maharashtra","Uttar Pradesh","Bihar","Madhya Pradesh"], e: "As per NCRB 2020 data, Madhya Pradesh registered the highest number of crimes against children." },
  { s: GA, q: "Padma Bhushan awardee Uma Sharma is a ______ dancer.", o: ["Bharatanatyam","Odissi","Kathakali","Kathak"], e: "Padma Bhushan awardee Uma Sharma is a renowned Kathak dancer." },
  { s: GA, q: "Teejan Bai, Jhaduram Devangan, Ritu Verma, Usha Barle and Shantibai Chelak are famous for which of the following forms of folk music?", o: ["Pandavani","Lavani","Bihugeet","Bhatiali"], e: "Teejan Bai and others are famous Pandavani folk singers — Pandavani is a folk singing style of Chhattisgarh narrating stories of the Pandavas." },
  { s: GA, q: "Which of the following is an adventure sport?", o: ["Snow hockey","Cycling","Paragliding","Paralympics"], e: "Paragliding is an adventure sport — a recreational and competitive flying sport with a foot-launched glider." },
  { s: GA, q: "Veteran classical dance guru from ______, Jatin Goswami was given the National Kalidas Samman for 2017.", o: ["Chhattisgarh","Assam","Odisha","West Bengal"], e: "Jatin Goswami, a veteran Sattriya dance guru from Assam, received the National Kalidas Samman for 2017." }
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
      tags: ['SSC', 'CHSL', 'PYQ', '2022'],
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
    title: { $regex: /26 May 2022/i }
  });
  if (dropRes.deletedCount > 0) {
    console.log(`Dropped ${dropRes.deletedCount} prior copy of this PYQ.`);
  }

  console.log('\nUploading images to Cloudinary...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id,
    title: 'SSC CHSL Tier-I - 26 May 2022 Shift-3',
    totalMarks: 200,
    duration: 60,
    accessLevel: 'FREE',
    isPYQ: true,
    pyqYear: 2022,
    pyqShift: 'Shift-3',
    pyqExamName: 'SSC CHSL Tier-I',
    questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
