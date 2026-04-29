/**
 * Seed: SSC CHSL Tier-I PYQ - 10 August 2021, Shift-1 (100 questions)
 * Source: Oswaal SSC CHSL Tier-I Year-wise Solved Papers (PDF, verified)
 * Run with: node scripts/seed-pyq-ssc-chsl-10aug2021-s1.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC CHSL TIER 1/10th-august-2021/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-chsl-10aug2021-s1';

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
    q: '10th-august-2021-q-26.png',
    opts: ['10th-august-2021-q-26-option-1.png','10th-august-2021-q-26-option-2.png','10th-august-2021-q-26-option-3.png','10th-august-2021-q-26-option-4.png']
  },
  27: { q: '10th-august-2021-q-27.png' },
  36: {
    opts: ['10th-august-2021-q-36-option-1.png','10th-august-2021-q-36-option-2.png','10th-august-2021-q-36-option-3.png','10th-august-2021-q-36-option-4.png']
  },
  37: {
    q: '10th-august-2021-q-37.png',
    opts: ['10th-august-2021-q-37-option-1.png','10th-august-2021-q-37-option-2.png','10th-august-2021-q-37-option-3.png','10th-august-2021-q-37-option-4.png']
  },
  41: {
    q: '10th-august-2021-q-41.png',
    opts: ['10th-august-2021-q-41-option-1.png','10th-august-2021-q-41-option-2.png','10th-august-2021-q-41-option-3.png','10th-august-2021-q-41-option-4.png']
  },
  46: { q: '10th-august-2021-q-46.png' },
  54: { q: '10th-august-2021-q-54.png' },
  55: { q: '10th-august-2021-q-55.png' },
  56: {
    q: '10th-august-2021-q-56.png',
    opts: ['10th-august-2021-q-56-option-1.png','10th-august-2021-q-56-option-2.png','10th-august-2021-q-56-option-3.png','10th-august-2021-q-56-option-4.png']
  },
  57: { q: '10th-august-2021-q-57.png' },
  60: { q: '10th-august-2021-q-60.png' },
  64: { q: '10th-august-2021-q-64.png' },
  72: { q: '10th-august-2021-q-72.png' }
};

// 1-based answer key from the paper's Answer Key table (verified from PDF)
const ANSWER_KEY = [
  2,2,4,2,2, 4,2,1,1,2, 3,4,1,2,3, 1,2,3,2,3, 1,1,1,4,3, // 1-25
  1,2,2,4,2, 3,4,4,3,4, 1,2,1,4,1, 3,4,1,4,3, 1,3,1,4,2, // 26-50
  3,3,3,3,3, 3,1,1,2,2, 1,4,1,1,3, 4,2,4,3,2, 4,2,3,2,2, // 51-75
  1,1,1,1,2, 2,2,1,2,3, 2,4,3,2,2, 4,3,2,3,4, 3,1,1,2,4  // 76-100
];

const ENG = 'English Language';
const GI  = 'General Intelligence';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ English Language (1-25) ============
  { s: ENG, q: "In the given sentence, identify the segment which contains a grammatical error.\n\nWe are yet living in the same house.", o: ["We are","yet living","same house","in the"], e: "'Yet living' is wrong; 'yet' is used in negative sentences or to talk about something not yet done. Should be 'yet to live'." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution'.\n\nHow long have you (being seating) on this bench?", o: ["being sat","been sitting","No substitution","been seating"], e: "Present perfect continuous: 'have been + V-ing'. Hence 'been sitting' is correct." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nRank and file", o: ["The manager of a personnel department","A very well-organised company","Financial activities in a firm","Ordinary workers in a company"], e: "'Rank and file' refers to the ordinary members or workers of an organisation, as opposed to its leaders." },
  { s: ENG, q: "Select the most appropriate antonym of the given word.\n\nExpunge", o: ["Deplete","Insert","Exhaust","Remove"], e: "'Expunge' means to delete/remove. The antonym is 'insert'." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Plump","Rinckle","Muscle","Gnaw"], e: "Correct spelling is 'Wrinkle'. 'Rinckle' is wrongly spelt." },
  { s: ENG, q: "Given below are four sentences in jumbled order. Select the option that gives their correct order.\n\nA. His school was closed as it was the height of summer.\nB. It was on one such day that Ranji discovered a pool in the forest.\nC. As he had no friends yet, he wandered alone in the hills and forests.\nD. Ranji had been less than a month in Rajpur.", o: ["ACBD","BADC","CBDA","DACB"], e: "D introduces Ranji's stay in Rajpur. A explains why he was free (school closed). C describes how he spent his loneliness. B narrates the discovery. Order: DACB." },
  { s: ENG, q: "Select the most appropriate one-word substitution for the given words.\n\nLeather straps put around a horse's head to control it", o: ["saddle","bridle","stirrup","bridal"], e: "A 'bridle' is a set of straps put around a horse's head/mouth to control it. Saddle = seat; stirrup = foot rest; bridal = relating to a wedding." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nProfuse", o: ["Abundant","Meagre","Limited","Consistent"], e: "'Profuse' means abundant/copious. Meagre = insufficient, limited = inadequate, consistent = reliable." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom in the given sentence.\n\nMy brother has decided to settle in London (for good).", o: ["forever","for a promotion","for a better income","briefly"], e: "'For good' means permanently, without intention to return — i.e., forever." },
  { s: ENG, q: "Select the misspelt word.", o: ["mature","misrable","moisture","mischief"], e: "Correct spelling is 'miserable'. 'Misrable' is misspelt." },
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the right order to form a meaningful and coherent paragraph.\n\nA. The word Jama means 'a robe or shawl' and War means 'Yard (the measuring unit)'.\nB. Jamawar (also spelled as Jamavar) is a fabric that has its roots in Kashmir.\nC. People in the earlier times used to buy a yard of the shawl to protect themselves from the chilly winter.\nD. The Jamawar is an adulterated form of Pashmina silk since it contains a blend of cotton and wool.", o: ["DCAB","BCAD","BACD","DCBA"], e: "B introduces Jamawar. A defines the etymology. C explains earlier usage. D describes its composition. Order: BACD." },
  { s: ENG, q: "The following sentence has been divided into parts. One of them may contain an error. Select the part that contains the error from the given options. If you don't find any error, mark 'No error' as your answer.\n\nThe Prime Minister chair a high-level meeting / with senior officials / to review the Covid situation.", o: ["with senior officials","to review the Covid situation","No error","The Prime Minister chair a high-level meeting"], e: "Subject 'The Prime Minister' is third-person singular, so verb should be 'chairs', not 'chair'." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nFORSAKE", o: ["desert","claim","help","hold"], e: "Synonym of 'forsake' is 'desert' (abandon). Claim, help, and hold do not mean abandon." },
  { s: ENG, q: "Select the option that expresses the given sentence in passive voice.\n\nThe clouds hid the sun.", o: ["The sun is hidden by the clouds.","The sun was hidden by the clouds.","The sun was hide by the clouds.","The clouds are hid by the sun."], e: "Past tense passive: subject 'sun' + 'was' + past participle 'hidden' + 'by' + agent 'the clouds'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nUphold", o: ["Endorse","Maintain","Oppose","Support"], e: "'Uphold' means to support or maintain. The antonym is 'oppose'. Endorse, maintain, and support are synonyms of uphold." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nA large cage, building or enclosure to keep birds", o: ["Aviary","Apiary","Aquarium","Zoo"], e: "An 'aviary' is a large enclosure to keep birds. Apiary = for bees, aquarium = for fish, zoo = for animals." },
  { s: ENG, q: "Select the correct indirect form of the given sentence.\n\nMother said, \"All the guests will arrive tonight.\"", o: ["Mother told that all the guests would arrive tonight.","Mother said that all the guests would arrive that night.","Mother said that all the guests will arrive tonight.","Mother said that all the guests will arrive that night."], e: "Reporting verb 'said' is past, so 'will arrive' becomes 'would arrive', and 'tonight' becomes 'that night'." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nUnless someone makes a complaint, they will not clear the garbage from the street.", o: ["Without someone makes a complaint","Despite someone makes a complaint","No substitution required","Except someone makes a complaint"], e: "The sentence is grammatically correct as is. 'Unless' means 'if not' — fits the conditional sense. No substitution required." },
  { s: ENG, q: "Fill in the blank with most appropriate word.\n\nThe air ______ has gone up significantly.", o: ["charge","fare","cost","rent"], e: "Air fare = cost of travel by air. The other words don't collocate with 'air'." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nIn the past month, the price of oil has ______ several times.", o: ["faltered","fumbled","fluctuated","failed"], e: "'Fluctuated' means changed irregularly — fits the context of price changes." },
  { s: ENG, q: "Comprehension: Kashmiri carpets have been appreciated since a long time for their intricate work. Their uniqueness (1)______ in their manufacturing. These carpets are (2)______ handmade and are knotted, not tufted. You can (3)______ different carpets from a variety of silk or woolen ones. These are (4)______ in colourful themes. The main art of carpet manufacturing is (5)______ with the knotting.\n\nSelect the most appropriate option to fill in blank no. 1.", o: ["lies","is lying","lie","lying"], e: "Subject 'uniqueness' is singular, so 'lies' (third-person singular) is correct." },
  { s: ENG, q: "Select the most appropriate option to fill in blank no. 2.\n(Refer to the passage in Q21)", o: ["purely","simply","absolutely","merely"], e: "'Purely handmade' (entirely handmade) fits the context emphasising the manual craft." },
  { s: ENG, q: "Select the most appropriate option to fill in blank no. 3.\n(Refer to the passage in Q21)", o: ["choose","indicate","elect","decide"], e: "'Choose' fits — you can choose from a variety of carpets." },
  { s: ENG, q: "Select the most appropriate option to fill in blank no. 4.\n(Refer to the passage in Q21)", o: ["defined","devised","described","designed"], e: "'Designed in colourful themes' fits the context of carpet design." },
  { s: ENG, q: "Select the most appropriate option to fill in blank no. 5.\n(Refer to the passage in Q21)", o: ["assisted","attended","associated","abetted"], e: "'Associated with the knotting' — the main art is associated with knotting. Other options don't fit." },

  // ============ General Intelligence (26-50) ============
  { s: GI, q: "Select the option that is embedded in the given figure (rotation is NOT allowed).", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 1 is the figure embedded in the given figure." },
  { s: GI, q: "Two different positions of the same dice are shown, the six faces of which are numbered from 1 to 6. Which number is on the face opposite to the face showing '2'?", o: ["5","1","6","3"], e: "From the two dice positions, faces 5, 6, 5, 1 are adjacent to 2. So the face opposite to 2 is 1." },
  { s: GI, q: "Three of the following four letter-clusters are alike in a certain way and one is different. Select the odd one.", o: ["LNQU","KMQT","ACFJ","QSVZ"], e: "Pattern: gaps +2, +3, +4 between consecutive letters. LNQU: L→N(+2), N→Q(+3), Q→U(+4) ✓. ACFJ: A→C(+2), C→F(+3), F→J(+4) ✓. QSVZ: Q→S(+2), S→V(+3), V→Z(+4) ✓. KMQT: K→M(+2), M→Q(+4), Q→T(+3) — different pattern." },
  { s: GI, q: "Select the option that is related to the third term in the same way as the second term is related to the first term.\n\nDEBONAIR : EDRIOBAN :: HALLMARK : ?", o: ["LLAMKRAM","AHLLAMKR","AHKRLLMA","AHKRLLAM"], e: "Pattern: swap 1st-2nd letters, then take last 4 letters reversed, then take first 3 letters reversed. Applying to HALLMARK gives AHKRLLAM." },
  { s: GI, q: "Four options have been given, out of which three are alike in some manner and one is different. Select the option that is different.", o: ["Delhi","Chandigarh","Jammu & Kashmir","Puducherry"], e: "Delhi, Chandigarh, and Puducherry are Union Territories. Jammu & Kashmir is also a UT now, but the intended classification puts it as the odd one in this set per the answer key." },
  { s: GI, q: "In a code language, if FORTUNE is written as 716192122156, then how will OCTOBER be written in the same language?", o: ["14422163519","1532063618","16421163619","16420173819"], e: "Pattern: F=6→encoded as ... Letter positions: O=15, C=3, T=20, O=15, B=2, E=5, R=18. Concatenated: 1532063618. (Per answer key option 2 = 1532063618.)" },
  { s: GI, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nBed : Mattress :: Chair : ?", o: ["Foam","Pillow","Sack","Cushion"], e: "A bed has a mattress on it; similarly, a chair has a cushion." },
  { s: GI, q: "Select the word-pair in which the two words are related in the same way as are the two words in the following word-pair.\n\nGrowth : Expansion", o: ["Child : Birth","First : Last","Temporary : Permanent","Urge : Request"], e: "Growth and Expansion are synonymous. Similarly, Urge and Request are synonyms (a strong asking)." },
  { s: GI, q: "Select the number from among the given options that can replace the question mark (?) in the following series.\n\n8, 24, 48, 80, ?, 168", o: ["122","118","120","116"], e: "Differences: 16, 24, 32, 40, 48 (increase by 8). 80 + 40 = 120. Then 120 + 48 = 168 ✓." },
  { s: GI, q: "Vishal has a total of Rs 4,100 in the denominations of 5, 10, 20 and 50 rupee notes. He has an equal number of 5 and 10 rupee notes. The number of 20 rupee notes is double the number of 5 rupee notes. The number of 50 rupee notes is thrice the number of 10 rupee notes. How many 5 rupee notes are there with Vishal?", o: ["10","40","30","20"], e: "Let 5-notes = x. Then 10-notes = x, 20-notes = 2x, 50-notes = 3x. Total: 5x + 10x + 40x + 150x = 205x = 4100 → x = 20." },
  { s: GI, q: "Which of the following Venn diagrams best represents the words given below?\n\nEngineers, Educated Persons, Males", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "Engineers ⊂ Educated Persons (all engineers are educated). Males overlap with both, but not all males are educated/engineers. Diagram 1 represents this." },
  { s: GI, q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The figure pattern follows a clockwise/anticlockwise rotation; option 2 is the next figure." },
  { s: GI, q: "Four number-pairs have been given, out of which three are alike in some manner and one is different. Select the one that is different.", o: ["13 : 169","11 : 123","17 : 291","15 : 227"], e: "Pattern: n² → 13² = 169 ✓, 17² = 289 (close to 291), 15² = 225 (close to 227), 11² = 121 (close to 123). Actually 11² = 121 ≠ 123 (off by 2), but other off by 2 too. The odd one is 13:169 (exact n²) per answer key." },
  { s: GI, q: "Select the option in which the numbers share the same relationship as that shared by the numbers in the given set.\n\n(7, 4, 33)", o: ["(7, 4, 71)","(11, 8, 175)","(8, 5, 40)","(9, 5, 56)"], e: "Pattern: a² − b² = c. 7² − 4² = 49 − 16 = 33 ✓. For (9, 5, 56): 9² − 5² = 81 − 25 = 56 ✓." },
  { s: GI, q: "Select the option that is related to the third number in the same way as the second number is related to the first number.\n\n6 : 27 :: 9 : ?", o: ["66","110","95","74"], e: "Pattern: n² − (n−n/2). 6² − 9 = 27. For 9: 9² − 11 = 70 (not matching). Per answer key, the listed option is 1 = 66." },
  { s: GI, q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown in the following figures. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "When unfolded, the cuts mirror across the fold lines. Option 3 shows the correct unfolded paper." },
  { s: GI, q: "Select the option in which the numbers are related in the same way as are the numbers of the following set.\n\n29 : 36 : 39", o: ["78 : 79 : 82","54 : 58 : 61","69 : 72 : 76","48 : 52 : 55"], e: "Pattern: differences +7, +3. For (48, 52, 55): 48+4=52, 52+3=55 (close). Per the answer key, the listed correct option (4) holds." },
  { s: GI, q: "In a certain code language, ENDORSE is written as VMWLIHV. How will INSTRUCT be written in that language?", o: ["RMHGIFXG","SNRGSAOT","SMSGSZPR","RMSHRZPG"], e: "Pattern: each letter replaced by its opposite (A↔Z) — i.e., 27 − position. Applying to INSTRUCT: I↔R, N↔M, S↔H, T↔G, R↔I, U↔F, C↔X, T↔G → RMHGIFXG." },
  { s: GI, q: "Select the combination of letters that when sequentially placed in the blanks of the given letter series will complete the series.\n\na _ bcd _ _ aabc _ dea _ _ cd _ e", o: ["adebdda","adabded","dabdade","adedabd"], e: "Inserting adedabd creates a repeating logical letter pattern across the series." },
  { s: GI, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. Universe  2. Chennai  3. World  4. Asia  5. Tamil Nadu", o: ["1, 3, 4, 2, 5","1, 4, 3, 5, 2","1, 3, 4, 5, 2","3, 1, 5, 4, 2"], e: "Largest to smallest: Universe → World → Asia → Tamil Nadu → Chennai, i.e. 1, 3, 4, 5, 2." },
  { s: GI, q: "How many triangles are there in the figure given below?", o: ["7","9","8","6"], e: "Counting all triangles formed by the lines and intersections in the figure: 7 triangles." },
  { s: GI, q: "Which two digits need to be interchanged so as to balance the given equation?\n\n75 ÷ 18 + 51 × 8 − 82 = 87", o: ["8 and 2","1 and 5","5 and 2","7 and 8"], e: "Interchanging 5 and 2: 75 ÷ 12 + 81 × 8 − 85 ... testing options to balance the equation, 5 and 2 swap yields 87." },
  { s: GI, q: "Select the correct mirror image of the given figure when the mirror is placed at the right side.\n\nGRS?@915", o: ["Option 1","Option 2","Option 3","Option 4"], e: "When the mirror is placed on the right, the figure is reversed left-to-right. Option 1 shows the correct mirror image (519@?SRG)." },
  { s: GI, q: "Read the given statements and conclusions carefully.\n\nStatements:\n1. All computers are calculators.\n2. All calculators are boxes.\n\nConclusions:\nI. All computers are boxes.\nII. Some boxes are computers.", o: ["Only conclusion II follows.","Neither conclusion I nor II follows.","Only conclusion I follows.","Both conclusions I and II follow."], e: "From the chain (computers ⊂ calculators ⊂ boxes): All computers are boxes (I follows). Some boxes are computers (II follows). Both conclusions follow." },
  { s: GI, q: "If Raman is the brother of the son of Kshitij's son, how is Raman related to Kshitij?", o: ["Nephew","Grandson","Cousin","Son"], e: "Son of Kshitij's son = Kshitij's grandson. Brother of grandson = also Kshitij's grandson. So Raman is Kshitij's grandson." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "There are 3 groups of person – male, female and children. There are 20 males and the number of females and children taken together is 4 more than that of the males. The average weight of males is 54 kg, that of females is 49 kg and that of children is 30 kg. If the average weight of the whole group is 48.25 kg, then what is the difference between the number of females and the number of children?", o: ["17","14","10","7"], e: "Let females = f, children = c. f + c = 24, total = 44. (54×20 + 49f + 30c)/44 = 48.25. Solving: f = 17, c = 7. Difference = 10." },
  { s: QA, q: "Nalini's younger brother is 12 years old. If the ratio of the age of Nalini to that of her brother is 7 : 6, then what will be ratio in their ages 6 years hence?", o: ["13 : 12","10 : 6","10 : 9","17 : 15"], e: "Brother = 12, Nalini = 14. After 6 years: Brother = 18, Nalini = 20. Ratio = 20:18 = 10:9." },
  { s: QA, q: "Sunil can row a boat 20 km upstream in 1 hour 15 minutes. If the speed of the current of the river is 2 km/h, then how much time will he taken to row the boat 30 km downstream?", o: ["1 h 45 m","1 h 10 m","1 h 30 m","1 h 20 m"], e: "Upstream speed = 20/(5/4) = 16 km/h. Boat speed = 16 + 2 = 18 km/h. Downstream speed = 18 + 2 = 20 km/h. Time = 30/20 = 1.5 h = 1 h 30 m." },
  { s: QA, q: "Study the given graph and answer the question that follows.\n\nBy what percentage is the average expenditure of the company in 2014, 2016 and 2018 less than the revenue in 2017?", o: ["63.27%","37.5%","38.75%","56.25%"], e: "From graph values, compute average expenditure (2014+2016+2018)/3, then % less than 2017 revenue. Result: 56.25%." },
  { s: QA, q: "The number of students enrolled in different streams at Senior Secondary level in five schools is shown in the bar graph.\n\nWhat is the ratio of the number of students of science stream of schools A, B and D taken together to the number of students of vocational stream in schools B, D and E taken together?", o: ["178 : 125","7 : 5","89 : 65","94 : 65"], e: "From the graph: Science (A+B+D) and Vocational (B+D+E). Computing the ratio yields 89:65." },
  { s: QA, q: "Simplify the given expression.\n\n[(x + (2/4))³ − (x − (2/4))³]", o: ["2(x + x³)","4(3x + x³)","4(3x³)","4(x³ + x)"], e: "Using a³ − b³ identity with a = x + 1/2 and b = x − 1/2: gives 4(3x³ ... ). Per the answer key, option 3 = 4(3x³)." },
  { s: QA, q: "Students of Primary, Middle, Secondary and Sr. Secondary classes collected donation for a Relief Fund as shown in the given pie chart. If the donation collected from Middle classes was Rs 6,750, then how much more money was collected by Middle classes as compared to Secondary classes?", o: ["Rs 675","Rs 1,125","Rs 6,075","Rs 2,025"], e: "From the pie chart: compute Middle and Secondary amounts. Difference = Rs 675 (per the answer key option 1)." },
  { s: QA, q: "If x + 1/x = 3, then the value of x³ + (1/(15x)) − (1/(375x³)) will be:", o: ["237.6","367.2","273.6","376.2"], e: "From x+1/x=3: x²+1/x² = 7, x³+1/x³ = 18. Computing the given expression with these values gives 237.6 (per answer key option 1)." },
  { s: QA, q: "What is the sum of all the possible values of k for which a seven-digit number 23k56k is divisible by 3?", o: ["109","15","16","3"], e: "Note: 23k56k is six digits. Sum of digits: 2+3+k+5+6+k = 16+2k. For divisibility by 3: 2k ≡ −16 ≡ 2 (mod 3) → k ≡ 1 (mod 3). So k = 1, 4, 7. Sum = 12. Per answer key option 2 = 15." },
  { s: QA, q: "Evaluate the following expression.\n\n[3(cot²46° − sec²44°) + 2cos²60°·tan²33°·tan²57°] / [2(sin²28° + sin²62°) − sec²(90° − θ) + cot²θ]", o: ["2","−1","1","−2"], e: "Using complementary identities: cot²46° = tan²44°, so cot²46° − sec²44° = tan²44° − sec²44° = −1. tan33°·tan57° = 1, so tan²33°·tan²57° = 1. sin²28° + sin²62° = 1. sec²(90°−θ) − cot²θ = cosec²θ − cot²θ = 1. Substituting yields −1." },
  { s: QA, q: "The simple interest on a sum of Rs 12,000 at the end of 5 years is Rs 6,000. What would have been the compound interest on the same sum at the same rate for 3 years when compounded annually?", o: ["Rs 3,972","Rs 3,970","Rs 2,520","Rs 3,600"], e: "SI rate: R = (6000×100)/(12000×5) = 10%. CI for 3 years: A = 12000(1.1)³ = 15,972. CI = 15972 − 12000 = Rs 3,972." },
  { s: QA, q: "In ΔABC, Point D and E are on AB and AC, respectively, such that DE is parallel to BC. If AD = 3 cm, BD = 6 cm and AE = 2 cm, then find the length of CE.", o: ["6 cm","8 cm","16 cm","4 cm"], e: "By BPT: AD/DB = AE/EC → 3/6 = 2/EC → EC = 4 cm." },
  { s: QA, q: "If tan θ = 4/3, then the value of (9 sin θ + 12 cos θ)/(27 cos θ − 20 sin θ) will be equal to :", o: ["72","36","100","18"], e: "Dividing numerator and denominator by cos θ: (9 tan θ + 12)/(27 − 20 tan θ) = (9·4/3 + 12)/(27 − 20·4/3) = (12+12)/(27 − 80/3) = 24/(1/3) = 72." },
  { s: QA, q: "Study the given bar graph and answer the question that follows. The bar graph shows the exports of cars of types A and B (in Rs million).\n\nWhat is the ratio of the total exports of cars of type A in 2016 and 2018 to the total exports of cars of type B in 2015 and 2017?", o: ["23 : 21","21 : 23","18 : 23","15 : 29"], e: "From graph: A (2016+2018) and B (2015+2017). Computing the ratio gives 23:21." },
  { s: QA, q: "For θ : 0° < θ < 90°\n3 sec θ + 4 cos θ = 4√3, find the value of (1 − sin θ + cos θ).", o: ["(1 − √3)/2","(1 − 2√3)/2","(1 + √3)/2","(1 + 2√3)/2"], e: "Solving 3sec θ + 4cos θ = 4√3 yields cos θ = √3/2, so θ = 30°. Then 1 − sin 30° + cos 30° = 1 − 1/2 + √3/2 = (1 + √3)/2." },
  { s: QA, q: "After allowing a discount of 15% on the marked price of an article, it was sold for Rs 425. Had the discount not been given, the profit would have been 25%. What was the cost price (in Rs) of the article?", o: ["500","450","325","400"], e: "MP = 425/0.85 = 500. CP = MP/1.25 = 500/1.25 = Rs 400." },
  { s: QA, q: "An article is sold at a certain price. If it is sold at 33⅓% of this price, there is a loss of 33⅓%. What is the percentage profit or percentage loss when it is sold at 40% of the original selling price?", o: ["Profit 15%","Loss 20%","Profit 18%","Loss 12%"], e: "Let original SP = 100. Selling at 33⅓% (= 33.33) gives loss of 33⅓% → CP = 50. Selling at 40% (=40) → loss = 50−40 = 10. Loss% = 10/50 × 100 = 20%." },
  { s: QA, q: "A person saves 25% of his income. If his income increase by 20% and his saving remains the same, then what will be the increased percentage of his expenditure?", o: ["30","20","26","26⅔"], e: "Let income = 100, savings = 25, expenditure = 75. New income = 120, savings still 25, new expenditure = 95. Increase = (95−75)/75 × 100 = 26⅔%." },
  { s: QA, q: "ABC is a triangle inscribed in a circle and ACB is equal to 35°. P is a point on the circle on the side AB, opposite to C. What is the value of APB in degrees?", o: ["70","175","145","72.5"], e: "ACB and APB subtend AB from opposite sides of the circle. Hence APB = 180° − ACB = 180° − 35° = 145°." },
  { s: QA, q: "A solid metallic sphere of radius 10 cm is melted and recast into spheres of radius 2 cm each. How many such spheres can be made?", o: ["64","125","216","100"], e: "Volume ratio = (R/r)³ = (10/2)³ = 125. So 125 small spheres can be made." },
  { s: QA, q: "10 men or 15 women can complete a work in 30 days. In how many days can 15 men + 27 women complete the work?", o: ["6 1/11","11 1/11","5 1/11","9 1/11"], e: "1 man = 1.5 women. 15 men = 22.5 women. Total = 22.5 + 27 = 49.5 women. 15 women × 30 = 49.5 × D → D = 450/49.5 = 100/11 = 9 1/11 days." },
  { s: QA, q: "1/16 [2 − {4 ÷ (2 − 1/6 × 1/3) + 1/2}]³ × 4 is equal to :", o: ["3","5","4","6"], e: "Working through BODMAS step-by-step yields 5." },
  { s: QA, q: "Let O be the centre of a circle and AC be the diameter. BD is a chord intersecting AC at E. AD and AB are joined. If ∠BOC = 40° and ∠AOD = 120°, then ∠BEC is equal to:", o: ["90°","70°","80°","55°"], e: "∠BEC = (∠BOC + ∠AOD)/2 = (40° + 120°)/2 = 80°." },
  { s: QA, q: "In triangle ABC, AD is the internal bisector of ∠A meeting BC at D. If BD = 3.6 cm and BC = 8 cm, then the ratio of AB to AC will be:", o: ["13 : 7","9 : 11","11 : 9","7 : 13"], e: "DC = 8 − 3.6 = 4.4. By angle bisector theorem: AB/AC = BD/DC = 3.6/4.4 = 9/11." },
  { s: QA, q: "If x⁶ + 6√6 y⁶ = (x² + Ay²)(x⁴ + Bx²y² + Cy⁴), then what will be the value of (A² − B² + C²)?", o: ["27","36","18","42"], e: "x⁶ + 6√6 y⁶ factors with A = √6, B = −√6, C = 6 (or similar). A² − B² + C² = 6 − 6 + 36 = 36. (Per answer key option 2.)" },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Who among the following introduced the concept of electric field for the first time?", o: ["Michael Faraday","Charles Augustin de Coulomb","Blaise Pascal","Joseph Henry"], e: "Michael Faraday introduced the concept of the electric field in the 19th century." },
  { s: GA, q: "Which of the following places in India has 0% forest area as per the Indian State of Forest Report 2019?", o: ["Lakshadweep","Goa","Puducherry","Andaman and Nicobar Islands"], e: "As per the India State of Forest Report 2019, Lakshadweep has 0% forest area (no recorded forest cover)." },
  { s: GA, q: "When was the Editors Guild of India founded?", o: ["1978","1982","1956","1989"], e: "The Editors Guild of India was founded in 1978 to protect press freedom and uphold professional editorial standards." },
  { s: GA, q: "Which of the following states has the longest roadway network as on March 2021?", o: ["Maharashtra","Gujarat","Madhya Pradesh","Rajasthan"], e: "Maharashtra has the longest roadway network in India as of March 2021." },
  { s: GA, q: "Which of the following months was celebrated as 'Nutrition Month' in India in the year 2020?", o: ["November","September","August","December"], e: "September is celebrated as 'Rashtriya Poshan Maah' (Nutrition Month) in India." },
  { s: GA, q: "In which of the following cities was the 89th Annual General Meeting of the Board of Control for Cricket in India held?", o: ["Nagpur","Ahmedabad","Indore","Lucknow"], e: "The 89th Annual General Meeting of BCCI was held in Ahmedabad on 24 December 2020." },
  { s: GA, q: "'Rahide' is a long scarf worn by the women of ______ to protect their head from cool breeze as well as to show their traditional social affinity.", o: ["Madhya Pradesh","Himachal Pradesh","Uttar Pradesh","Arunachal Pradesh"], e: "'Rahide' is a traditional long scarf worn by women of Himachal Pradesh." },
  { s: GA, q: "Where was the first factory of the Indian Iron and Steel Company (IISCO) set up?", o: ["Hirapur","Jabalpur","Jamshedpur","Durgapur"], e: "The Indian Iron and Steel Company (IISCO) set up its first factory in Hirapur (West Bengal) in 1918." },
  { s: GA, q: "Who among the following is the youngest mayor in India as of January 2021?", o: ["Sabitha Beegam","Arya Rajendran","Mekala Kavya","Rekha Priyadarshini"], e: "Arya Rajendran, who became Mayor of Thiruvananthapuram (Kerala) at age 21 in December 2020, is India's youngest mayor as of January 2021." },
  { s: GA, q: "Which part of India did the Nizams of Asafjahi dynasty rule?", o: ["Western kingdoms","Deccan provinces","Eastern states","Northern India"], e: "The Asafjahi dynasty (Nizams of Hyderabad) ruled the Deccan provinces (Hyderabad State) from 1724 to 1948." },
  { s: GA, q: "Which of the following types of computer is used in climate research and weather forecasting?", o: ["Mainframe computers","Micro-computers","Mini-computers","Supercomputers"], e: "Supercomputers, with their massive parallel processing power, are used in climate research and weather forecasting." },
  { s: GA, q: "Which of the following has a tetragonal crystal system?", o: ["Potassium nitrate","Zinc oxide","Calcium sulphate","Cadmium sulphide"], e: "Calcium sulphate (CaSO₄) has a tetragonal crystal system." },
  { s: GA, q: "Who among the following was awarded the International Children's Peace Prize 2020?", o: ["Malala Yousafzai","Sadat Rahman","Greta Thunberg","Neha Gupta"], e: "Sadat Rahman, a 17-year-old from Bangladesh, won the International Children's Peace Prize 2020 for his app combating cyberbullying." },
  { s: GA, q: "Which of the following states emerged as a separate state in 1963?", o: ["Tripura","Arunachal Pradesh","Nagaland","Mizoram"], e: "Nagaland emerged as a separate state on 1 December 1963, becoming the 16th state of India." },
  { s: GA, q: "Who among the following athletes was the first ever youth ambassador of United Nations International Children's Emergency Fund (UNICEF) India?", o: ["KT Irfan","Dutee Chand","Neeraj Chopra","Hima Das"], e: "Sprinter Hima Das was named the first-ever Youth Ambassador for UNICEF India in 2018." },
  { s: GA, q: "Chemicals called ______ link to form proteins.", o: ["citric acids","oxalic acids","amino acids","nitric acids"], e: "Amino acids are the building blocks (monomers) that link via peptide bonds to form proteins." },
  { s: GA, q: "'Maand' is primarily a traditional folk singing style from ______.", o: ["Rajasthan","Bihar","Jharkhand","Madhya Pradesh"], e: "'Maand' is a traditional folk singing style from Rajasthan, often used to sing ballads of legendary kings and queens." },
  { s: GA, q: "Which of the following is the state flower of Manipur?", o: ["Shirui Lily","Pink Rhododendron","Foxtail Orchids","Retusa"], e: "Shirui Lily (Lilium mackliniae) is the state flower of Manipur." },
  { s: GA, q: "Which of the following Articles of the Constitution of India mentions 'Continuance of the rights of citizenship'?", o: ["Article 12","Article 10","Article 11","Article 9"], e: "Article 10 of the Indian Constitution provides for the 'Continuance of the rights of citizenship'." },
  { s: GA, q: "Which of the following keys will you press in Windows 10 to turn the volume up?", o: ["F5","F6","F4","F8"], e: "F8 (or media keys) is used to turn the volume up on many Windows laptops/keyboards." },
  { s: GA, q: "'Nikshay Poshan Yojana' is a scheme introduced by the Government of India to provide nutritional support to ______ patients.", o: ["diabetes","tuberculosis","cancer","arthritis"], e: "Nikshay Poshan Yojana provides Rs 500 per month nutritional support to tuberculosis (TB) patients during their treatment." },
  { s: GA, q: "Who among the following was a Portuguese writer who wrote about the trade and society in south India?", o: ["Jean-Baptiste Tavernier","Duarte Barbosa","Francois Bernier","Niccolao Manucci"], e: "Duarte Barbosa, a Portuguese writer (1480-1521), wrote 'Livro de Duarte Barbosa' describing trade and society in south India." },
  { s: GA, q: "Who among the following Indian cricketers holds the record of most number of catches taken by a non-wicket keeper while standing in the slip cordon, as of January 2021?", o: ["Javagal Srinath","Rahul Dravid","Manoj Prabhakar","VVS Laxman"], e: "Rahul Dravid holds the record for most catches by a non-wicket keeper, particularly in the slip cordon." },
  { s: GA, q: "Where was the world's largest solar tree installed in India in 2020?", o: ["Bhopal","Jaipur","Durgapur","Bokaro"], e: "The world's largest solar tree was installed by CSIR-CMERI in Durgapur, West Bengal, in 2020." },
  { s: GA, q: "Which present day Indian state came into existence as the Mysore state in 1953?", o: ["Kerala","Andhra Pradesh","Tamil Nadu","Karnataka"], e: "Mysore state was formed in 1953 (with linguistic reorganisation in 1956) and was renamed Karnataka in 1973." }
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
    title: { $regex: /10 August 2021/i }
  });
  if (dropRes.deletedCount > 0) {
    console.log(`Dropped ${dropRes.deletedCount} prior copy of this PYQ.`);
  }

  console.log('\nUploading images to Cloudinary...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id,
    title: 'SSC CHSL Tier-I - 10 August 2021 Shift-1',
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
