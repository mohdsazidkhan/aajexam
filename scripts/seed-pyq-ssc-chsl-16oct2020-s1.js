/**
 * Seed: SSC CHSL Tier-I PYQ - 16 October 2020, Shift-1 (100 questions)
 * Source: Oswaal SSC CHSL Tier-I Year-wise Solved Papers (PDF, verified)
 * Run with: node scripts/seed-pyq-ssc-chsl-16oct2020-s1.js
 *
 * This script:
 *   1. Connects to MongoDB
 *   2. Uploads all figure/graph images to Cloudinary (folder: aajexam/pyq/ssc-chsl-16oct2020-s1)
 *   3. Drops any prior copy of this PracticeTest
 *   4. Inserts the test with question/option image URLs filled in
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC CHSL TIER 1/16th-oct-2020/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-chsl-16oct2020-s1';

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

// Image filenames in this folder are prefixed `16th-march-2020-` (a labelling
// quirk — the paper itself is 16th October 2020). Q-numbers are correct.
const IMAGE_MAP = {
  32: {
    opts: ['16th-march-2020-q-32-option-1.png','16th-march-2020-q-32-option-2.png','16th-march-2020-q-32-option-3.png','16th-march-2020-q-32-option-4.png']
  },
  34: {
    q: '16th-march-2020-q-34.png',
    opts: ['16th-march-2020-q-34-option-1.png','16th-march-2020-q-34-option-2.png','16th-march-2020-q-34-option-3.png','16th-march-2020-q-34-option-4.png']
  },
  38: {
    q: '16th-march-2020-q-38.png',
    opts: ['16th-march-2020-q-38-option-1.png','16th-march-2020-q-38-option-2.png','16th-march-2020-q-38-option-3.png','16th-march-2020-q-38-option-4.png']
  },
  40: {
    q: '16th-march-2020-q-40.png',
    opts: ['16th-march-2020-q-40-option-1.png','16th-march-2020-q-40-option-2.png','16th-march-2020-q-40-option-3.png','16th-march-2020-q-40-option-4.png']
  },
  41: { q: '16th-march-2020-q-41.png' },
  42: { q: '16th-march-2020-q-42.png' },
  43: {
    q: '16th-march-2020-q-43.png',
    opts: ['16th-march-2020-q-43-option-1.png','16th-march-2020-q-43-option-2.png','16th-march-2020-q-43-option-3.png','16th-march-2020-q-43-option-4.png']
  },
  49: { q: '16th-march-2020-q-49.png' },
  50: { q: '16th-march-2020-q-50.png' },
  56: { q: '16th-march-2020-q-56.png' },
  59: { q: '16th-march-2020-q-59.png' },
  62: { q: '16th-march-2020-q-62.png' },
  65: { q: '16th-march-2020-q-65.png' },
  70: { q: '16th-march-2020-q-70.png' },
  72: { q: '16th-march-2020-q-72.png' },
  73: { q: '16th-march-2020-q-73.png' }
};

// 1-based answer key from the paper's Answer Key table (verified from PDF)
const ANSWER_KEY = [
  4,4,3,3,4, 3,3,1,1,1, 1,4,4,4,3, 4,1,4,2,4, 2,4,4,4,1, // 1-25
  2,2,4,3,2, 1,4,1,3,4, 4,2,4,2,3, 1,4,4,3,2, 4,3,3,1,1, // 26-50
  2,3,2,1,3, 1,3,2,3,3, 3,3,3,4,1, 4,4,3,1,4, 2,3,1,3,3, // 51-75
  1,1,4,3,1, 2,1,2,2,4, 4,4,2,1,2, 3,1,3,4,1, 2,3,1,3,3  // 76-100
];

const ENG = 'English Language';
const GI  = 'General Intelligence';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ English Language (1-25) ============
  { s: ENG, q: "Select the word which means the same as the group of words given.\n\nOne whom it is impossible to defeat", o: ["Cowardly","Dissatisfied","Inimitable","Invincible"], e: "'Invincible' means someone who cannot be defeated and is unbeatable. 'Cowardly' = weak/gutless, 'Dissatisfied' = unhappy, 'Inimitable' = unique/matchless." },
  { s: ENG, q: "Given below are four jumbled sentences. Out of the given options, pick the one that gives their correct order.\n\nA. While the most common belief is that these traits remain fixed, research studies show otherwise!\nB. One such research study suggests that we can change our traits provided we want to change them.\nC. We all possess certain personality traits that set us apart from the rest.\nD. These traits, a mix of good and bad, define how we respond to situations and people.", o: ["CBDA","ACDB","BCAD","CDAB"], e: "C introduces personality traits, D continues with their types/impact, A explains the concept by quoting research, B further supports with the research finding. Order: CDAB." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Massage","Amass","Messanger","Immediate"], e: "Correct spelling is 'messenger' (a person who carries information). 'Messanger' is the incorrect spelling." },
  { s: ENG, q: "Select the correct indirect form of the given sentence.\n\nThe manager said, \"I want you to attend the conference.\"", o: ["The manager said I am wanting you to attend the conference.","The manager told to me I am to go to attend the conference.","The manager said that she wanted me to attend the conference.","The manager said that she want me to attend the conference."], e: "Reporting verb 'said' is past, so the reported verb 'want' becomes 'wanted'. Connector 'that' is needed. Pronoun 'I' becomes 'she' (referring to the manager). 'You' becomes 'me'." },
  { s: ENG, q: "Comprehension: In the following passage, some words have been deleted. Fill in the blanks with the help of the alternatives given.\n\nRed okra from Karnataka. Black rice from Gujarat. Red corn from Tamil Nadu. What you would (1)______ as exotic varieties of food today are (2)______ indigenous crops that belong to a specific region. Many such (3)______ crops have gone extinct. Many more are on the brink. But with Indian households (4)______ more conscious about healthy eating and the natural benefits of consuming local food, (5)______ among both consumers and farmers is increasing.\n\nSelect the most appropriate option for blank number 1.", o: ["described","describing","describes","describe"], e: "After modal verb 'would', the base form of the verb is required. 'Describe' is the base form." },
  { s: ENG, q: "Select the most appropriate option for blank number 2.\n(Refer to the passage in Q5)", o: ["incredibly","surprisingly","mostly","openly"], e: "'Mostly' means a greater part of the number, fitting the context that exotic varieties are mostly indigenous crops." },
  { s: ENG, q: "Select the most appropriate option for blank number 3.\n(Refer to the passage in Q5)", o: ["new","global","native","foreign"], e: "The passage is about India's native crops, so 'native' is the right answer." },
  { s: ENG, q: "Select the most appropriate option for blank number 4.\n(Refer to the passage in Q5)", o: ["becoming","becomes","became","have become"], e: "'Becoming' is a gerund showing the state of being more conscious. The other options indicate completed action, not state of being." },
  { s: ENG, q: "Select the most appropriate option for blank number 5.\n(Refer to the passage in Q5)", o: ["awareness","apprehension","experience","intelligence"], e: "The passage discusses growing health-consciousness, so 'awareness' (consciousness in people) is the right option." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No improvement'.\n\nThe teacher said that all (that) students who did not complete the task in the given time should attempt it again.", o: ["those","No improvement","them","this"], e: "'Students' is plural, so 'those' is needed instead of 'that' (which is singular)." },
  { s: ENG, q: "Given below are four jumbled sentences. Out of the given options, pick the one that gives their correct order.\n\nA. Vijay the bus conductor was always there in one of these trucks.\nB. He had now quit his old job and joined politics.\nC. In the week before the elections, trucks bumped up and down the dirty streets of Laxmangarh, full of young men holding microphones and shouting: \"Stand up to the rich!\"\nD. That was the thing about Vijay; each time you saw him, he had done better for himself.", o: ["CABD","ABCD","CBAD","DABC"], e: "C sets the scene of the elections. A introduces Vijay (bus conductor in the trucks). B continues about Vijay quitting his job. D concludes describing his nature. Order: CABD." },
  { s: ENG, q: "In the given sentence, identify the segment which contains the grammatical error.\n\nA Delhi bound aircraft has to make an emergency landing at Mumbai airport as a woman passenger suddenly developed a serious breathing problem.", o: ["a serious breathing problem","as a woman passenger","suddenly developed","has to make"], e: "The construction is in past tense, so 'had to make' is correct, not 'has to make'." },
  { s: ENG, q: "In the given sentence, identify the segment which contains the grammatical error.\n\nAccording to environment activitists, demolition of unauthorised apartment complexes are became a lesson for land encroachers.", o: ["According to","demolition of unauthorised apartment complexes","for land encroachers","are became"], e: "'Are became' is wrong. The sentence must be in past tense — 'became' is correct, not 'are became' (you cannot use a be-verb with the past form of the verb)." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nDEPLETE", o: ["Increase","Raise","Complete","Reduce"], e: "Synonym of 'deplete' is to 'reduce'. Increase/raise = elevation, complete = whole." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Illiterate","Jostle","Dimention","Ideology"], e: "Correct spelling is 'DIMENSION' (a measurement of length, width, or height). 'Dimention' is the incorrect spelling." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nYou've cleared the ______ examination, haven't you?", o: ["frequent","conclusion","ability","entrance"], e: "We say 'entrance examination'. The other options don't collocate with 'examination'." },
  { s: ENG, q: "Select the correct passive form of the given sentence.\n\nMy friend narrated a very interesting story at the International Storytelling Festival.", o: ["A very interesting story was narrated by my friend at the International Storytelling Festival.","A very interesting story is being narrated by my friend at the International Storytelling Festival.","A very interesting story has been narrated by my friend at the International Storytelling Festival.","A very interesting story was being narrated by my friend at the International Storytelling Festival."], e: "Verb is in past form and subject 'a very interesting story' is singular. Use helping verb 'was' + past participle 'narrated' + connector 'by'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nLet off the hook", o: ["Made to pay for one's actions","Not made to wait for a long time","Not allowed to take part in an activity","Allowed to escape from blame"], e: "'Let off the hook' means to allow someone (who has been caught doing something wrong) to go without being punished — i.e., allowed to escape from blame." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No improvement'.\n\nMy doctor knew that I would eventually recover and do the kind of work (I would be doing) before.", o: ["would have been doing","had been doing","No improvement","would have done"], e: "The sentence is about a past action ('knew'). Past perfect continuous 'had been doing' refers to an action that started in the past and continued up until another time in the past." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nDEROGATORY", o: ["Appreciative","Favourable","Lethargic","Sarcastic"], e: "Synonym of 'derogatory' is 'sarcastic' (offensive). Appreciative = grateful, favourable = complimentary, lethargic = lazy/tired." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nOPTIONAL", o: ["Original","Compulsory","Elective","Fanciful"], e: "Antonym of 'optional' is 'compulsory'. Original's antonym is borrowed; elective's is required; fanciful's is grave/usual." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nINCOHERENT", o: ["Delightful","Puzzling","Inconsistent","Intelligible"], e: "Antonym of 'incoherent' is 'intelligible'. Delightful's antonym is unpleasant; puzzling's is clear; inconsistent's is consistent." },
  { s: ENG, q: "Select the word which means the same as the group of words given.\n\nSoon passing out or of a short duration", o: ["Fluke","Extempore","Frostbite","Evanescent"], e: "'Evanescent' means soon passing out of sight, memory, or existence; quickly fading or disappearing. Fluke = lucky accident, extempore = without preparation, frostbite = medical condition." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nParthian shot", o: ["Say goodbye","Praise","Victory","Parting hit"], e: "A 'Parthian shot' is a remark you make when leaving so that it has a stronger effect — i.e., a parting hit." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank.\n\nThe student has made a ______ to the police about a false video of her that is being circulated by some miscreants.", o: ["complaint","complain","complaining","complainant"], e: "'Complaint' (noun) is correct. 'Complain' is a verb, 'complaining' is a verb form, 'complainant' is one who makes a legal complaint." },

  // ============ General Intelligence (26-50) ============
  { s: GI, q: "Select the option that is related to the number in the same way as the second number is related to first number.\n\n215 : 125 :: 415 : ?", o: ["154","145","625","250"], e: "Pattern: middle digit shifts to first place and first digit shifts to middle place. 215 → 125. Similarly 415 → 145." },
  { s: GI, q: "In a certain code language, 458693 is coded as 367784. How will 742351 be coded as in that language?", o: ["651462","651442","655442","863442"], e: "Pattern: alternately subtract 1 and add 1 to each digit. 4−1=3, 5+1=6, 8−1=7, 6+1=7, 9−1=8, 3+1=4 → 367784. Apply the same to 742351 → 651442." },
  { s: GI, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nCar : Garage :: Aeroplane : ?", o: ["Runway","Sky","Pilot","Hangar"], e: "A car is parked in a garage; similarly, an aeroplane is parked in a hangar." },
  { s: GI, q: "In a family Mr. and Mrs. Gajanan have five daughters and each daughter has one brother. How many persons are there in the family?", o: ["6","5","8","9"], e: "Mr. Gajanan + Mrs. Gajanan + 5 daughters + 1 brother (shared by all daughters) = 8 persons." },
  { s: GI, q: "Select the letter that can replace the question mark (?) in the following series.\n\nA, D, B, F, D, I, G, ?, K", o: ["J","M","E","N"], e: "Two interleaved series. Series 1 (positions 1,3,5,7,9): A, B, D, G, K (gaps +1, +2, +3, +4). Series 2 (positions 2,4,6,8): D, F, I, ? (gaps +2, +3, +4) → M." },
  { s: GI, q: "In a certain code language, NEPOLIAN is written as MCQQKGBP. How will MOHANDEV be written as in that language?", o: ["LMICMBFX","NQICMBFX","LMICMBXF","NQGCLBFX"], e: "Pattern alternates: −1, −2, +1, +2 to letters. Applying to MOHANDEV: M−1=L, O−2=M, H+1=I, A+2=C, N−1=M, D−2=B, E+1=F, V+2=X → LMICMBFX." },
  { s: GI, q: "Select the answer figure in which the question figure is embedded. (Rotation is not allowed)", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 4 contains the given figure embedded within it." },
  { s: GI, q: "Four words have been given, out of which three are alike in some manner and one is different. Select the odd one.", o: ["Water Filter","Study Table","Wardrobe","Dining Table"], e: "Except 'Water Filter', all are types of furniture." },
  { s: GI, q: "The sequence of folding a piece of paper and the manner in which the folded paper has been cut is shown in the question figure. Select the figure from the answer figures that would most closely resemble the unfolded paper.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Unfolding the paper produces the pattern shown in option 3." },
  { s: GI, q: "Which two signs should be interchanged to make the given equation correct?\n\n(560 ÷ 80) + 90 × 8 − 38 = 600", o: ["+ and −","+ and ÷","÷ and −","× and +"], e: "Interchanging × and +: (560 ÷ 80) × 90 + 8 − 38 = 7 × 90 + 8 − 38 = 630 + 8 − 38 = 600. Equation balances." },
  { s: GI, q: "Four pairs of letter-cluster have been given, out of which three are alike in some manner and one is different. Select the one that is different.", o: ["KITE : TIEK","FIRU : RIUF","MANY : NAYM","LICK : ILCK"], e: "Pattern: 1st letter shifts to last place; 2nd letter unchanged; 3rd letter shifts to first place. KITE→TIEK, FIRU→RIUF, MANY→NAYM follow this. LICK→ILCK doesn't fit (L should go to last)." },
  { s: GI, q: "Select the option that is related to the third term in the same way as the second term is related to the first term.\n\nKLEN : EKNL :: GHIS : ?", o: ["IGHS","IGSH","IHGS","IHSG"], e: "Pattern: positions rearranged as 3,1,4,2. KLEN(K=1,L=2,E=3,N=4) → 3,1,4,2 → E,K,N,L = EKNL. Apply to GHIS(G=1,H=2,I=3,S=4) → 3,1,4,2 → I,G,S,H = IGSH." },
  { s: GI, q: "If a mirror is placed on line PQ in the question figure, then which of the answer figures is the correct mirror image of the question figure?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "When the mirror is placed at the right side, objects on the right appear on the left and vice versa. Option 4 is the correct mirror image." },
  { s: GI, q: "Four numbers have been given, out of which three are alike in some manner and one is different. Select the number that is different from the rest.", o: ["2197","2306","1331","1728"], e: "2197 = 13³, 1331 = 11³, 1728 = 12³ — all are perfect cubes. 2306 is not, hence it is the odd one out." },
  { s: GI, q: "Select the answer figure that can replace the question mark (?) in the following question figure.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Pattern: every object is rotated by 90° in clockwise direction. Option 3 completes the figure correctly." },
  { s: GI, q: "Study the given pattern carefully and select the number that can replace the question mark (?) in it.", o: ["256","196","81","289"], e: "Pattern: sum the two given numbers and square it. 7+6=13, 13²=169. 9+2=11, 11²=121. 9+7=16, 16²=256." },
  { s: GI, q: "Find the number of triangles in the given figure.", o: ["21","13","18","16"], e: "Counting all triangles formed by lines and intersections: ABC, ABD, ABE, ABF, ACD, ACE, ACF, ADE, ADF, AEF, AGH, AGI, AGJ, AHI, AHJ, AIJ — total 16 triangles." },
  { s: GI, q: "Select the answer figure that can be formed by folding the given sheet along the lines.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "In option 1 C is opposite E (cannot be formed). In option 2 C is opposite A. In option 3 B is opposite F. Hence only option 4 can be formed." },
  { s: GI, q: "Select the combination of letters that when sequentially placed from left to right in the blanks of the given series, will complete the series.\n\na_cd_cba_bcddc_a", o: ["aaba","adcb","bdab","babd"], e: "Total 16 positions split into 4 groups of 4: abcd / dcba / abcd / dcba. Filling in the blanks gives bdab." },
  { s: GI, q: "Arrange the following words in a logical and meaningful sequence.\n\n1. Quintal  2. Kilo Gram  3. Gram  4. Milli Gram  5. Ton", o: ["4 - 3 - 2 - 5 - 1","4 - 3 - 2 - 1 - 5","4 - 2 - 3 - 5 - 1","4 - 2 - 3 - 1 - 5"], e: "All are units of weight. Ascending order: Milli Gram (4) → Gram (3) → Kilo Gram (2) → Quintal (1) → Ton (5)." },
  { s: GI, q: "When Laxmi saw Mahesh, she said, \"He is the son of the father-in-law of the father of my daughter\". How is Mahesh related to Laxmi?", o: ["Maternal uncle","Son","Nephew","Brother"], e: "Father of Laxmi's daughter = Laxmi's husband. Father-in-law of Laxmi's husband = Laxmi's father. Son of Laxmi's father = Laxmi's brother. Mahesh is Laxmi's brother." },
  { s: GI, q: "Select the number that can replace the question mark (?) in the following series.\n\n5, 5, 15, 75, 525, ?", o: ["1575","2625","4725","1050"], e: "Multiplying by odd numbers: 5×1=5, 5×3=15, 15×5=75, 75×7=525, 525×9=4725." },
  { s: GI, q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, decide which conclusions logically follow.\n\nStatements:\n1. All squares are rectangles.\n2. All rectangles are polygons.\n\nConclusions:\nI. Square is not a polygon.\nII. Square is both rectangle and polygon.", o: ["Only conclusion I follows.","Neither conclusion I not II follows.","Only conclusion II follows.","Both conclusions I and II follow."], e: "From the Venn diagram (squares ⊂ rectangles ⊂ polygons), only conclusion II follows: square is both rectangle and polygon." },
  { s: GI, q: "In the given Venn diagram, different animals are represented by different areas. 'A' denotes 'dogs', 'B' denotes 'cats', 'C' denotes 'fishes', 'D' denotes 'mongooses', 'E' denotes 'rats' and 'F' denotes 'rabbits'. Which area represents the group of only dogs, fishes and mongooses?", o: ["D","F","C","A"], e: "The area representing the intersection of A (dogs), C (fishes), and D (mongooses) — without other animals — is the labelled region 'D'." },
  { s: GI, q: "Select the number that can replace the question mark (?) in the following figure series.", o: ["14","16","5","11"], e: "Pattern (Top + Middle − Left = Right): Triangle 1: 5+5−2 = 8. Triangle 2: 3+16−9 = 10. Triangle 3: 1 + ? − 7 = 8 → ? = 14." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "In a company with 600 employees, the average age of the male employees is 42 years and that of the female employees is 41 years. If the average age of all the employees in the company is 41 years 9 months, then the number of female employees is:", o: ["350","150","250","450"], e: "Let male = x, female = y. x + y = 600 and 42x + 41y = (167/4) × 600 = 25050. Solving: y = 150." },
  { s: QA, q: "A person invested a total of Rs 9,000 in three parts at 3%, 4% and 6% per annum on simple interest. At the end of a year, he received equal interest in all the cases. The amount invested at 6% is :", o: ["Rs 3,000","Rs 5,000","Rs 2,000","Rs 4,000"], e: "Equal interest: 3x/100 = 4y/100 = 6z/100 = k. So x:y:z = 4:3:2. Total = 9000 → 9k = 9000 → k = 1000. Amount at 6% = 2k = Rs 2,000." },
  { s: QA, q: "The proportion among three numbers is 3 : 4 : 5 and their LCM is 1800. The second number is :", o: ["90","120","30","150"], e: "Let numbers be 3x, 4x, 5x. LCM = 60x = 1800 → x = 30. Second number = 4 × 30 = 120." },
  { s: QA, q: "If the diameter of a circle bisects each of the two chords of the circle, then both the chords :", o: ["are parallel to each other","intersect at 30°","intersect at 60°","intersect at 90°"], e: "A perpendicular drawn from the centre to a chord bisects the chord. If the diameter bisects each chord, both chords are perpendicular to the diameter and hence parallel to each other." },
  { s: QA, q: "A shopkeeper allows a discount of 20% on an article and still makes a profit of 25%. What does he pay for an article whose marked price is Rs 800?", o: ["Rs 492","Rs 800","Rs 512","Rs 640"], e: "SP after 20% discount = 800 × 0.8 = 640. CP = SP × 100/(100+25) = 640 × 100/125 = Rs 512." },
  { s: QA, q: "The following chart shows the marks (in degrees) scored by a student in different subjects — English, Hindi, History, Economics and Political Science — in an examination. Total marks obtained in the examination are 600. Observe the chart and answer the question.\n\nWhat is the difference between marks scored in History and marks scored in Hindi?", o: ["25","15","40","30"], e: "History marks = (70/360) × 600 = 700/6. Hindi marks = (55/360) × 600 = 550/6. Difference = (700−550)/6 = 150/6 = 25." },
  { s: QA, q: "If x + 1/x = 4, then the value of x⁴ + 1/x⁴ is :", o: ["16","196","194","14"], e: "(x + 1/x)² = x² + 1/x² + 2 = 16 → x² + 1/x² = 14. Then (x² + 1/x²)² = x⁴ + 1/x⁴ + 2 = 196 → x⁴ + 1/x⁴ = 194." },
  { s: QA, q: "If cosec θ = (x² + y²)/(x² − y²), then what will be the value of tan θ?", o: ["2xy/(x² − y²)","(x² − y²)/(2xy)","(x² + y²)/(x² − y²)","2xy/(x² + y²)"], e: "Using cosec²θ − cot²θ = 1: cot θ = √((x²+y²)² − (x²−y²)²)/(x²−y²) = 2xy/(x²−y²). Hence tan θ = (x²−y²)/(2xy)." },
  { s: QA, q: "The following pie-chart shows the percentage-wise distribution of the number of students in five different schools P, Q, R, S and T. Total number of students in all five schools together is 8400.\n\nThe number of students in school T is what percentage of the total number of students in schools Q and S together.", o: ["55%","45%","50%","40%"], e: "T = (20/100) × 8400 = 1680. Q = (18/100) × 8400 = 1512. S = (22/100) × 8400 = 1848. Q+S = 3360. Percentage = (1680/3360) × 100 = 50%." },
  { s: QA, q: "If 'a' is a natural number, then (7a² + 7a) is always divisible by :", o: ["7 only","14 only","7 and 14 both","21 only"], e: "7a² + 7a = 7a(a+1). Since a(a+1) is always even, 7a(a+1) is divisible by both 7 and 14." },
  { s: QA, q: "If a and b are two positive real number such that 4a² + b² = 20 and ab = 4, then the value of 2a + b is :", o: ["80","8","6","5"], e: "(2a + b)² = 4a² + b² + 4ab = 20 + 16 = 36. So 2a + b = 6." },
  { s: QA, q: "In the given figure, PQR is a triangle in which angle P : angle Q : angle R = 3 : 2 : 1, and PR is perpendicular to RS. What will be the measure of angle TRS?", o: ["30°","45°","60°","50°"], e: "Let P = 3x, Q = 2x, R = x. Sum = 6x = 180° → x = 30°. So ∠R = 30°. Since PR ⊥ RS, ∠PRS = 90°. ∠PRQ + ∠PRS + ∠TRS = 180° → 30° + 90° + ∠TRS = 180° → ∠TRS = 60°." },
  { s: QA, q: "Raju can finish a piece of work in 20 days. He worked it for 5 days and then Jakob alone finished the remaining work in 15 days. In how many days can both finish it together?", o: ["20 days","12 days","10 days","16 days"], e: "Raju in 5 days = 5/20 = 1/4 of work. Remaining = 3/4 done by Jakob in 15 days, so Jakob's full work = 20 days. Together: 1/20 + 1/20 = 1/10 → 10 days." },
  { s: QA, q: "If cos(A + B) = 0 and sin(A − B) = 1/2, then the value of B is: (Given 0° < A, B < 90°)", o: ["90°","60°","45°","30°"], e: "cos(A+B) = 0 = cos 90° → A+B = 90°. sin(A−B) = 1/2 = sin 30° → A−B = 30°. Subtracting: 2B = 60° → B = 30°." },
  { s: QA, q: "In the given figure, if OQ = QR, then the value of m is :", o: ["3n°","n°","4n°","2n°"], e: "OQ = QR → ∠QOR = ∠ORQ = n°. Exterior ∠QOP = 2n°. In ΔOPQ, OP = OQ → ∠OPQ = ∠OQP = 2n°. ∠POQ = 180° − 4n°. ∠POS = 180° − (180° − 4n°) − n° = 3n°." },
  { s: QA, q: "A train, 150 m long, is running at 90 km/h. How long (in seconds) will it take to clear a platform that is 300 m long?", o: ["6","12","50","18"], e: "Distance = 150 + 300 = 450 m. Speed = 90 km/h = 25 m/s. Time = 450/25 = 18 seconds." },
  { s: QA, q: "If the gain is one-fifth of the selling price, then the gain percentage is :", o: ["16%","20%","80%","25%"], e: "Let SP = 100. Gain = SP/5 = 20. CP = 100 − 20 = 80. Gain% = (20/80) × 100 = 25%." },
  { s: QA, q: "If cos²θ + cos⁴θ = 1, then the value of sin²θ + sin⁴θ is :", o: ["2","1/2","1","0"], e: "From cos²θ + cos⁴θ = 1: cos⁴θ = 1 − cos²θ = sin²θ → cos²θ = sin θ. So sin²θ + sin⁴θ = cos⁴θ + cos²θ = 1." },
  { s: QA, q: "The value of a motorcycle depreciates every year by 4%. What will be its value after 2 years, if its present value is Rs 75,000?", o: ["Rs 69,120","Rs 72,000","Rs 70,120","Rs 69,000"], e: "Value after 2 years = 75000 × (96/100)² = 75000 × 24/25 × 24/25 = Rs 69,120." },
  { s: QA, q: "In the given figure, AP is perpendicular to BC, and AQ is the bisector of angle PAC. What will be the measure of angle PAQ?", o: ["50°","45°","60°","30°"], e: "In ΔAPC: ∠APC + ∠PAC + ∠PCA = 180° → 90° + ∠PAC + 30° = 180° → ∠PAC = 60°. AQ bisects ∠PAC, so ∠PAQ = 30°." },
  { s: QA, q: "If a + b = 8 and ab = 12, then the value of a³ + b³ is :", o: ["512","224","288","96"], e: "(a+b)² = a² + 2ab + b² → 64 = a² + b² + 24 → a² + b² = 40. (a+b)³ = a³ + b³ + 3ab(a+b) → 512 = a³ + b³ + 288 → a³ + b³ = 224." },
  { s: QA, q: "The following graph shows the number of books sold by a book-seller during five months of 2019 — April, May, June, July and August. Study the graph and answer the question.\n\nThe total number of books sold during these five months is :", o: ["2950","2800","2850","2900"], e: "Total = 900 + 800 + 500 + 350 + 300 = 2850 books." },
  { s: QA, q: "Study the graph and answer the following question.\n\nHow many students spent 5 hours or more than 5 hours in playing mobile games per day?", o: ["14","46","6","8"], e: "Total students at 5+ hours = 8 + 6 = 14." },
  { s: QA, q: "The value of 72 − 3 (2 + 24 ÷ 4 × 3 − 2 × 2) + 8 is :", o: ["72","36","32","24"], e: "= 72 − 3(2 + 6×3 − 2×2) + 8 = 72 − 3(2 + 18 − 4) + 8 = 72 − 3(16) + 8 = 72 − 48 + 8 = 32." },
  { s: QA, q: "The area of a square field is 7200 m². What is the length of its diagonal?", o: ["1800 m","180 m","120 m","60 m"], e: "Side a = √7200 = 60√2 m. Diagonal = a√2 = 60√2 × √2 = 120 m." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "When was the Indian national song 'Vande Mataram' sung for the first time on a political occasion?", o: ["1896 INC session","1903 INC session","1911 INC session","1900 INC session"], e: "'Vande Mataram' was sung for the first time at the 1896 Calcutta INC session, sung by Rabindranath Tagore. The song was written by Bankim Chandra Chatterjee, adapted from his novel Anand Math." },
  { s: GA, q: "The last Mauryan ruler to be killed by Pushyamitra Shunga was:", o: ["Brihadratha","Devavarman","Bindusara","Dasharatha"], e: "Brihadratha, the last Mauryan ruler, was assassinated in 185 B.C by his commander-in-chief Pushyamitra Shunga, who founded the Sunga dynasty." },
  { s: GA, q: "______ is a diagrammatic representation of a program logic.", o: ["Legend","Process","Data","Flowchart"], e: "A flowchart is a diagrammatic representation of program logic, used to analyse, design, document, or manage a process." },
  { s: GA, q: "'Dhimsa' is a tribal dance form of which Indian state?", o: ["Arunachal Pradesh","Madhya Pradesh","Andhra Pradesh","Himachal Pradesh"], e: "Dhimsa is a tribal dance form of Andhra Pradesh, primarily performed by the Porja tribe. It is the official dance of Visakhapatnam." },
  { s: GA, q: "Who is the 47th Chief Justice of India?", o: ["Sharad Arvind Bobde","Dipak Misra","Ranjan Gogoi","NV Ramana"], e: "Sharad Arvind Bobde was appointed as the 47th Chief Justice of India." },
  { s: GA, q: "In which part of a plant are mesophyll cells found?", o: ["Root","Leaf","Stem","Seed"], e: "Mesophyll cells are found in plant leaves. They contain a large number of chloroplasts responsible for CO₂ fixation in photosynthesis." },
  { s: GA, q: "Who is the author of the book 'The Blue Umbrella'?", o: ["Ruskin Bond","Vikram Seth","Suketu Mehta","Vikram Chandra"], e: "'The Blue Umbrella' is a book written by Ruskin Bond. He won the Sahitya Academy Award (1992), Padma Shri (1999), and Padma Bhushan (2014)." },
  { s: GA, q: "The GST council is headed by the:", o: ["Prime minister","Union finance minister","SEBI chairman","RBI governor"], e: "The Goods and Services Tax Council is a constitutional body headed by the Union Finance Minister, with 33 members in total." },
  { s: GA, q: "'Disha Act' was passed by which of the following state in December 2019?", o: ["Tamil Nadu","Andhra Pradesh","Telangana","Karnataka"], e: "The Disha Act (Andhra Pradesh Criminal Law Amendment) was passed by Andhra Pradesh in December 2019, providing for fast-track trials in heinous crimes against women and children." },
  { s: GA, q: "A force due to which moving objects (wind and water current) tend to deflect to the right in Northern hemisphere and left in Southern hemisphere is known as:", o: ["Applied force","Magnetic force","Endogenic force","Coriolis force"], e: "The Coriolis force, due to Earth's rotation, deflects moving objects to the right in the Northern Hemisphere and to the left in the Southern Hemisphere." },
  { s: GA, q: "The ______ is responsible for Earth's magnetic field.", o: ["mantle","crust","inner core","outer core"], e: "Earth's outer core, composed of liquid iron and nickel, generates the magnetic field via convection currents (geodynamo effect)." },
  { s: GA, q: "A higher ______ index represents inequality in income distribution.", o: ["NDP","GDP","CPI","Gini"], e: "The Gini index measures income/consumption inequality. 0 = perfect equality, 100 = perfect inequality. Higher Gini index indicates greater income distribution inequality." },
  { s: GA, q: "The Constitution under Article ______ mandates the Election Commission, to conduct elections to the Parliament and the State Legislatures.", o: ["298","324","330","312"], e: "Article 324 of the Indian Constitution mandates the Election Commission to conduct elections to Parliament and State Legislatures. ECI was established on 25 January 1950." },
  { s: GA, q: "Which is the second most abundant gas in Earth's atmosphere?", o: ["Oxygen","Hydrogen","Nitrogen","Carbon di oxide"], e: "Oxygen (~21%) is the second most abundant gas in Earth's atmosphere, after nitrogen (~78%)." },
  { s: GA, q: "With which of the following sports is Manika Batra associated?", o: ["Badminton","Table Tennis","Gymnastics","Cricket"], e: "Manika Batra is an Indian table tennis player and one of the highest-ranked Indian players in the sport." },
  { s: GA, q: "Batholith is a type of:", o: ["ocean current","secondary pollutant","igneous rock","valley"], e: "A batholith is a large mass of intrusive igneous rock, formed when magma cools and solidifies deep beneath the Earth's surface." },
  { s: GA, q: "How many gold medals did India win at the '1986 Asian Games' held in Seoul, South Korea?", o: ["5","9","6","8"], e: "India won 5 gold medals at the 1986 Asian Games held in Seoul, South Korea." },
  { s: GA, q: "Which of the following is NOT an e-commerce website?", o: ["Swiggy","Flipkart","Google Maps","Uber"], e: "Google Maps is a web mapping platform, not an e-commerce website. Swiggy, Flipkart, and Uber are e-commerce platforms." },
  { s: GA, q: "Which river is also called 'Dihang' in India?", o: ["Indus","Ganges","Tapti","Brahmaputra"], e: "The Brahmaputra is also called 'Dihang' in Arunachal Pradesh, where it enters India from Tibet (where it is known as Tsangpo)." },
  { s: GA, q: "International Astronomical Union (IAU) named minor planet 2006 VP32 (number -300128) in September 2019 after a famous Indian. Who is this Indian?", o: ["Pandit Jasraj","APJ Abdul Kalam","Viswanathan Anand","Hamsa Padmanabhan"], e: "The IAU named minor planet 2006 VP32 (number 300128) after Pandit Jasraj, the legendary Indian classical vocalist, in September 2019." },
  { s: GA, q: "Birthplace of Guru Nanak known as Nankana Sahib today, was earlier called.", o: ["Umarkot","Rai Bhoi di Talvandi","Luni","Roda"], e: "The birthplace of Guru Nanak, now called Nankana Sahib (in Pakistan), was earlier known as Rai Bhoi di Talvandi." },
  { s: GA, q: "In which year was a separate Andhra state formed after the linguistic reorganisation of the then Madras province?", o: ["1947","1950","1952","1956"], e: "Andhra State was formed in 1953 after the death of Potti Sreeramulu. After the States Reorganisation Act of 1956, Andhra Pradesh was created. (Per the answer key, the listed correct option is 1952.)" },
  { s: GA, q: "Rambir Singh Khokar received the 'Dronacharya award' for:", o: ["Kabaddi","Wrestling","Football","Athletics"], e: "Rambir Singh Khokar received the Dronacharya Award for Kabaddi coaching." },
  { s: GA, q: "In which year was the Bharat Ratna award instituted?", o: ["1950","1953","1954","1956"], e: "The Bharat Ratna, India's highest civilian award, was instituted on 2 January 1954." },
  { s: GA, q: "In which medium does sound travel faster?", o: ["Gas","Vacuum","Solid","Liquid"], e: "Sound travels fastest in solids because the molecules are tightly packed, allowing efficient propagation of vibrations. Sound cannot travel through a vacuum." }
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

  // Drop any prior copy so this seed is idempotent
  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /16 October 2020/i }
  });
  if (dropRes.deletedCount > 0) {
    console.log(`Dropped ${dropRes.deletedCount} prior copy of this PYQ.`);
  }

  console.log('\nUploading images to Cloudinary...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id,
    title: 'SSC CHSL Tier-I - 16 October 2020 Shift-1',
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
