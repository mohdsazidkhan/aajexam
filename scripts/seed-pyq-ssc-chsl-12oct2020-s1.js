/**
 * Seed: SSC CHSL Tier-I PYQ - 12 October 2020, Shift-1 (100 questions)
 * Source: Oswaal SSC CHSL Tier-I Year-wise Solved Papers (PDF, verified)
 * Run with: node scripts/seed-pyq-ssc-chsl-12oct2020-s1.js
 *
 * This script:
 *   1. Connects to MongoDB
 *   2. Uploads all figure/graph images to Cloudinary (folder: aajexam/pyq/ssc-chsl-12oct2020-s1)
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC CHSL TIER 1/12th-Oct-2020/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-chsl-12oct2020-s1';

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

// Image map: question number -> { q?: 'filename', opts?: ['o1','o2','o3','o4'] }
const IMAGE_MAP = {
  28: { q: '12th-oct-2020-q-28.png' },
  30: { q: '12th-oct-2020-q-30.png' },
  35: {
    q: '12th-oct-2020-q-35.png',
    opts: ['12th-oct-2020-q-35-option-1.png','12th-oct-2020-q-35-option-2.png','12th-oct-2020-q-35-option-3.png','12th-oct-2020-q-35-option-4.png']
  },
  38: {
    opts: ['12th-oct-2020-q-38-option-1.png','12th-oct-2020-q-38-option-2.png','12th-oct-2020-q-38-option-3.png','12th-oct-2020-q-38-option-4.png']
  },
  44: {
    q: '12th-oct-2020-q-44.png',
    opts: ['12th-oct-2020-q-44-option-1.png','12th-oct-2020-q-44-option-2.png','12th-oct-2020-q-44-option-3.png','12th-oct-2020-q-44-option-4.png']
  },
  47: {
    q: '12th-oct-2020-q-47.png',
    opts: ['12th-oct-2020-q-47-option-1.png','12th-oct-2020-q-47-option-2.png','12th-oct-2020-q-47-option-3.png','12th-oct-2020-q-47-option-4.png']
  },
  48: {
    q: '12th-oct-2020-q-48.png',
    opts: ['12th-oct-2020-q-48-option-1.png','12th-oct-2020-q-48-option-2.png','12th-oct-2020-q-48-option-3.png','12th-oct-2020-q-48-option-4.png']
  },
  54: { q: '12th-oct-2020-q-54.png' },
  55: { q: '12th-oct-2020-q-55.png' },
  56: { q: '12th-oct-2020-q-56.png' },
  62: { q: '12th-oct-2020-q-62.png' },
  70: { q: '12th-oct-2020-q-70.png' },
  74: { q: '12th-oct-2020-q-74.png' }
};

// 1-based answer key from the paper's Answer Key table (verified from PDF)
const ANSWER_KEY = [
  4,4,4,4,3, 3,1,1,1,4, 1,4,4,3,4, 2,3,3,2,1, 4,3,4,3,3, // 1-25
  4,1,3,3,4, 2,2,4,3,3, 4,4,2,1,4, 4,2,3,1,1, 4,1,2,3,1, // 26-50
  3,3,3,1,2, 1,1,1,4,1, 4,1,2,2,4, 3,4,4,2,4, 2,4,1,4,2, // 51-75
  1,2,3,4,1, 2,2,1,3,1, 2,2,4,3,1, 3,3,1,1,4, 4,3,3,2,2  // 76-100
];

const ENG = 'English Language';
const GI  = 'General Intelligence';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ English Language (1-25) ============
  { s: ENG, q: "Select the wrongly spelt word.", o: ["Awfully","Unruly","Unduly","Faithfuly"], e: "The correct spelling is FAITHFULLY. The meaning of 'faithfully' is 'devotedly', 'loyally' etc." },
  { s: ENG, q: "Select the correct passive form of the given sentence.\n\nThe police beat a number of protestors last night.", o: ["A number of protestors were being beaten by the police last night.","A number of protestors had been beaten by the police last night.","A number of protestors has been beaten by the police the night before.","A number of protestors were beaten by the police the night before."], e: "When converting active to passive, the object becomes the subject. The plural subject 'a number of protestors' uses 'were'. Past participle 'beaten' and connector 'by' are used." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nASSERTION", o: ["Rejection","Continuation","Discussion","Declaration"], e: "'Rejection' means refusal/denial. 'Continuation' means persistence. 'Discussion' means conversation. 'Declaration' is the meaning of 'assertion'." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nUp in arms", o: ["Throw up arms in joy","Divide into armed groups","Give up fighting and surrender","Angry about something"], e: "If people are up in arms about something, they are very angry about it and are protesting strongly against it." },
  { s: ENG, q: "Comprehension: In the following passage some words have been deleted. Fill in the blanks with the help of the alternatives given. Select the most appropriate option for each blank.\n\nSmartphones have become an essential part of our lives and their (1)______ usage is now impacting human behaviour. We need to (2)______ think about digital detox! Yes, the concept of disconnecting with (3)______ virtual world is not just a fad. It's the need of the hour today. The Global Brand Director of the smartphone Vivo in his speech nudged all smartphone users (4)______ a step backward and think. He said, \"Let's (5)______ our mobiles and pledge to be closer and nearer to our loved ones.\"\n\nSelect the most appropriate option for blank number 1.", o: ["exceeding","excessive","exceedingly","exceed"], e: "'Exceedingly' is an adverb meaning extremely, modifying 'usage' in context." },
  { s: ENG, q: "Select the most appropriate option for blank number 2.\n(Refer to the passage in Q5)", o: ["series","seriousness","seriously","serious"], e: "The word after the blank is 'think', a verb. We use an adverb before a verb. Hence 'seriously' is correct." },
  { s: ENG, q: "Select the most appropriate option for blank number 3.\n(Refer to the passage in Q5)", o: ["the","a","any","many"], e: "'The' denotes one/more things already mentioned or assumed of common knowledge. 'The virtual world' fits best." },
  { s: ENG, q: "Select the most appropriate option for blank number 4.\n(Refer to the passage in Q5)", o: ["to take","to taking","taken","takes"], e: "'To take' is correct as the infinitive acts as the object. The other forms are wrong: 'to taking' (infinitives don't take -ing), 'taken' (past participle), 'takes' (third-person singular)." },
  { s: ENG, q: "Select the most appropriate option for blank number 5.\n(Refer to the passage in Q5)", o: ["switch off","switch in","switch over","switch up"], e: "The writer's intention is to turn off the mobile, so 'switch off' is correct." },
  { s: ENG, q: "In the given sentence identify the segment which contains the grammatical error.\n\nWhen I met Akbar Padamsee, one of a pioneers of Indian art, he was 87 but still alert and active.", o: ["but still alert and active","When I met","he was 87","one of a pioneers of Indian art"], e: "The phrase must be 'one of the pioneers'. When using 'one of', the article 'the' is required, not 'a'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nSURVEILLANCE", o: ["Neglect","Vigilance","Attack","Endurance"], e: "'Surveillance' means supervising or following. The opposite is 'neglect'." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the given word.\n\nDEMOLISH", o: ["Obstruct","Abolish","Cherish","Construct"], e: "'Demolish' means to destroy. The opposite is 'construct'." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No improvement'.\n\nLenovo has launched ThinkPad XI Fold, the world's first foldable laptop which is claimed to be (so durable as) its other devices.", o: ["No improvement","to be most durable as","to be very durable as","to be as durable as"], e: "'So + adjective + as' is for negatives. 'Most' is for superlatives. 'Very' isn't used with comparatives. 'As + adjective + as' is the correct comparative form." },
  { s: ENG, q: "Select the most appropriate meaning of the given idiom.\n\nStir up a hornet's nest", o: ["Call for dialogue","Lead a revolt","Provoke trouble","Destroy a nest"], e: "'Stir up a hornet's nest' means to do something which causes a lot of controversy or produces a difficult situation." },
  { s: ENG, q: "Select the correct indirect form of the given sentence.\n\n\"Do you attend the film festival at Goa every year?\" he asked.", o: ["He asked me if I attended the film festival at Goa every year.","He is asking me if I attended the film festival at Goa every year.","He had asked me if I was attending the film festival at Goa every year.","He asks me if I attend the film festival at Goa every year."], e: "Reporting verb 'asked' (past), so reported speech shifts to past. Yes/no question takes connector 'if'. Do + attend → attended." },
  { s: ENG, q: "Given below are four jumbled sentences. Select the option that gives their correct order.\n\nA. The most well-known among them is the Purple Frog needing immediate protection.\nB. The Secret Life of Frogs is the first ever film on the Amphibians of India.\nC. The film has been shot extensively in the Western Ghats.\nD. It showcases unique species of frogs which are critically endangered.", o: ["DCBA","BCDA","BCAD","CBDA"], e: "B introduces the film. C adds info about the film. D follows with details. 'Them' in A refers to 'unique species of frogs' in D, so A follows D. Correct order: BCDA." },
  { s: ENG, q: "Select the most appropriate option to substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No improvement'.\n\nIt is reported that everyday India (witnessing the death) of over 2000 babies aged less than one year.", o: ["India will be witness the death","No improvement","India witnesses the death","India witness the death"], e: "'Every day' indicates a habitual action, so simple present is needed. 'India witnesses the death' is correct." },
  { s: ENG, q: "Given below are four jumbled sentences. Select the option that gives their correct order.\n\nA. This test is conducted on the fully automated Driving Test Track designed by Maruti Suzuki.\nB. Each of these specific skills are to be tested and need to be completed successfully in under seven minutes by the candidate.\nC. It is a fully-automated track having six segments to test specific driving skills.\nD. The Regional Transport Offices of Delhi have recently introduced the new driving test.", o: ["BADC","DBAC","DACB","ADBC"], e: "D introduces (RTOs new test). A talks about the test. C describes the track. B describes how skills are tested. Correct order: DACB." },
  { s: ENG, q: "Select the most appropriate synonym of the given word.\n\nGUILE", o: ["Intuition","Deceit","Surfeit","Sincerity"], e: "'Guile' means deceit. 'Intuition' = perception, 'surfeit' = excess, 'sincerity' = genuineness." },
  { s: ENG, q: "Select the word which means the same as the group of words given.\n\nThat which is no longer useful", o: ["Redundant","Abundant","Reluctant","Dominant"], e: "'Redundant' means exceeding what is necessary or normal/useful." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank in the given sentence.\n\nPadamse worked like a mathematician and was a true ______ who experimented with numerous mediums.", o: ["adversary","literary","voluntary","visionary"], e: "'Visionary' is a person with great plans for the future, fitting the context of an experimenter." },
  { s: ENG, q: "Select the most appropriate word to fill in the blank in the given sentence.\n\nIf the video clip of the murder had not been shared on social media, the world would likely have remained ______ of the tragedy.", o: ["renowned","recognised","unaware","unconfirmed"], e: "'Unaware' means not knowing about something. Fits the context perfectly." },
  { s: ENG, q: "Select the wrongly spelt word.", o: ["Popularly","Beggarly","Jocularly","Sincearly"], e: "Correct spelling is 'sincerely'. The other words are spelled correctly." },
  { s: ENG, q: "In the given sentence identify the segment which contains the grammatical error.\n\nYour skill lie in cheering up people who are stressed out, wound up or generally just annoyed.", o: ["who are stressed out, wound up","in cheering up people","Your skill lie","or generally just annoyed"], e: "Subject 'skill' is singular; verb should be 'lies', not 'lie'. 'Your skill lie' is the error." },
  { s: ENG, q: "Select the word which means the same as the group of words given.\n\nSomething that is genuine", o: ["Majestic","Unreal","Authentic","Academic"], e: "'Authentic' means genuine." },

  // ============ General Intelligence / Reasoning (26-50) ============
  { s: GI, q: "In a certain code language, N is coded as 30 and COT is coded as 78. How will PET be coded as in that language?", o: ["41","100","70","84"], e: "Pattern: (sum of letter positions) × 2 + 2. N = 14×2+2 = 30. COT = (3+15+20)×2+2 = 78. PET = (16+5+20)×2+2 = 82+2 = 84." },
  { s: GI, q: "John used to buy petrol at the rate of Rs 80 per litre till last month. Now he buys it at the rate of Rs 85 per litre. By what percentage did the petrol price increase as compared to last month?", o: ["6.25 %","8.35 %","5.5 %","10 %"], e: "Increase % = (85−80)/80 × 100 = 5/80 × 100 = 6.25%." },
  { s: GI, q: "Three different positions of the same dice are shown. Select the number that will be on the face opposite to the face 1.", o: ["5","3","6","4"], e: "From the three positions, the numbers 3, 2, and 5 are seen adjacent to 1, so they cannot be opposite. The remaining face shows 6, which must be opposite to 1." },
  { s: GI, q: "Arrange the following words in a logical and meaningful order.\n\n1. Flat\n2. Street\n3. Room\n4. Apartment\n5. City", o: ["3, 5, 1, 4, 2","5, 4, 3, 2, 1","3, 1, 4, 2, 5","3, 4, 1, 2, 5"], e: "Logical order: Room → Flat → Apartment → Street → City, i.e. 3, 1, 4, 2, 5." },
  { s: GI, q: "How many triangles are there in the following figure?", o: ["22","18","21","20"], e: "By systematically counting all triangles formed by the lines and intersections in the figure, the total comes to 20 triangles." },
  { s: GI, q: "In a certain code language, 'BROWSE' is written as 'GUYQTD'. How will 'AMALGAM' be written as in that language?", o: ["CONCICO","OCINCOC","DPMDGCP","PMDGCPD"], e: "Each letter of BROWSE is shifted by a specific pattern (+5,+3,+10,−12,+1,−1). Applying the same pattern to AMALGAM yields OCINCOC." },
  { s: GI, q: "Read the given statements and conclusions carefully. Assuming that the information given in the statements is true, decide which conclusions logically follow.\n\nStatements:\nI. All beans are meat.\nII. All breads are meat.\n\nConclusions:\nI. Some beans are breads.\nII. Some breads are beans.", o: ["Both conclusions I and II follows.","Neither conclusion I nor II follows.","Either conclusion I or II follows","Only conclusion I follows."], e: "From the Venn diagram, both 'some beans are breads' and 'some breads are beans' are possible but not definite. Hence neither conclusion follows definitely." },
  { s: GI, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nWork : Joule :: Area : ?", o: ["Radian","Perimeter","Length","Hectare"], e: "Joule is the unit of work. Similarly, hectare is the unit of area." },
  { s: GI, q: "Four words have been given, out of which three are alike in some manner and one is different. Select the odd out.", o: ["Chirp","Bleat","Frisk","Neigh"], e: "Chirp = sound of birds, bleat = sound of sheep, neigh = sound of horses. Frisk means to play/jump — odd one out." },
  { s: GI, q: "Select the option in which the given figure is embedded. (Rotation of the figure is not allowed)", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Option 3 contains the given figure embedded within it." },
  { s: GI, q: "Four letter-clusters have been given out of which three are alike in some manner, while one is different. Choose the odd one.", o: ["LNP","DFH","FHJ","TVW"], e: "LNP, DFH, FHJ each have +2 gaps between consecutive letters. TVW breaks this (V to W is +1)." },
  { s: GI, q: "Select the option in which the numbers share the relationship as that shared by the given number pair.\n\n8 : 49", o: ["9 : 87","15 : 210","13 : 170","12 : 121"], e: "Pattern: (n−1)² . 8−1=7, 7²=49. Check: 12−1=11, 11²=121. So 12:121 follows the same pattern." },
  { s: GI, q: "Select the Venn diagram that best represents the relationship between the following classes.\n\nReptile, Mammal, Lizard", o: ["Diagram 1","Diagram 2","Diagram 3","Diagram 4"], e: "Lizard is a reptile (subset), and mammals are disjoint from reptiles. The Venn diagram showing this is option 2." },
  { s: GI, q: "Select the correct combination of mathematical signs to replace 'A' sequentially from left to right and balance the following equation.\n\n26 A 2 A 3 A 3 A 13", o: ["÷, ×, =, ×","×, ÷, +, =","÷, ×, =, –","×, =, –, ÷"], e: "Substituting ÷, ×, =, ×: 26 ÷ 2 × 3 = 3 × 13 → 39 = 39. Equation balances." },
  { s: GI, q: "Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster.\n\nGOAT : DQYW :: TRES : ?", o: ["HUMO","PSBU","RSDW","QTCV"], e: "Pattern: shifts of (−3, +2, −2, +3). Applying same to TRES: T−3=Q, R+2=T, E−2=C, S+3=V → QTCV." },
  { s: GI, q: "Select the option in which the numbers are related in the same way as are the numbers in the given set.\n\n(3, 68, 5)", o: ["(2, 72, 10)","(4, 64, 5)","(5, 95, 8)","(2, 10, 1)"], e: "Pattern: (a² + c²) × 2 = b. (3²+5²)×2 = 34×2 = 68. For (2,10,1): (4+1)×2 = 10. Matches." },
  { s: GI, q: "Select the option in which the words are related in the same way as are the words in the given set.\n\nCow : Milk", o: ["Bird : Fly","Hen : Egg","Eagle : Swoop","Goat : Bleat"], e: "Milk is obtained from a cow. Similarly, eggs are obtained from hens." },
  { s: GI, q: "Select the combination of letters that when sequentially placed from left to right in the blanks of the given letter series will complete the series.\n\naba_ccdab_b_ _dababc_ _", o: ["bacacd","abdccd","bacccd","cacccd"], e: "Filling with bacccd produces a repeating 'ababccd' pattern: ababccd / ababccd / ababccd." },
  { s: GI, q: "Select the option figure that will come next in the following series.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The outer lines decrease by one and the inner lines increase by one, leading to option 1 as the next figure." },
  { s: GI, q: "Disha's salary is Rs 3,000 more than Pratima's salary. The ratio of Disha's to Pratima's salary is 17:15, respectively. What is the salary of Pratima?", o: ["Rs 22,500","Rs 26,750","Rs 25,500","Rs 27,250"], e: "Let Disha = 17A, Pratima = 15A. 17A − 15A = 3000 → 2A = 3000 → A = 1500. Pratima's salary = 15 × 1500 = Rs 22,500." },
  { s: GI, q: "Four letter-cluster have been given, out of which three are alike in some manner and one is different. Select the odd letter-cluster.", o: ["ADZW","NOML","EGVT","TUGD"], e: "Three of the clusters share a common letter-relation pattern. TUGD breaks the pattern, hence it is the odd one out." },
  { s: GI, q: "The sequence of folding a paper and the manner in which the folded paper has been cut is shown in the following figures. How would this paper look when unfolded?", o: ["Option 1","Option 2","Option 3","Option 4"], e: "On unfolding, the cuts mirror across each fold line, producing the figure shown in option 1." },
  { s: GI, q: "Select the correct mirror image of the given figure.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "The mirror image of the given figure corresponds to option 2." },
  { s: GI, q: "Select the option in which the numbers are related in the same way as are the numbers in the given set.\n\n(7, 15, 31)", o: ["(6, 13, 21)","(5, 625, 6)","(3, 7, 15)","(2, 17, 14)"], e: "Pattern: (n×2)+1 → 7×2+1=15, 15×2+1=31. For (3,7,15): 3×2+1=7, 7×2+1=15. Matches." },
  { s: GI, q: "Four numbers have been given, out of which three are alike in some manner and one is different. Select the number that is different from the rest.", o: ["255","212","268","124"], e: "212, 268, and 124 are all divisible by 4. 255 is not, hence it is the odd one out." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "What is the value of the following?\n\n−15 + 90 ÷ [89 − {9 × 8 + (33 − 3 × 7)}]", o: ["5","2","3","4"], e: "= −15 + 90 ÷ [89 − {72 + 12}] = −15 + 90 ÷ [89 − 84] = −15 + 90 ÷ 5 = −15 + 18 = 3." },
  { s: QA, q: "Richa travels from A to B at the speed of 15 km/h, from B to C at 20 km/h, and from C to D at 30 km/h. If AB = BC = CD, then find Richa's average speed.", o: ["18 km/h","17 km/h","20 km/h","19 km/h"], e: "Let each leg = x. Total time = x/15 + x/20 + x/30 = (4x+3x+2x)/60 = 9x/60. Average = 3x ÷ 9x/60 = 20 km/h." },
  { s: QA, q: "Ram sold a motorcycle for Rs 70000 at 25% profit. For what price should he sell a motorcycle to gain 30% profit?", o: ["Rs 72,700","Rs 72,900","Rs 72,800","Rs 72,600"], e: "CP = 70000 × 100/125 = Rs 56000. New SP at 30% profit = 56000 × 130/100 = Rs 72,800." },
  { s: QA, q: "The following graph gives the annual percent profit earned by a company during the period 1996-2001. Study the graph carefully and answer the question that follow.\n\nThe period in which the profit of the company has increased fasted is :", o: ["1998 - 1999","2000 - 2001","1997 - 1998","1996 - 1997"], e: "From the graph, profit increase 1996-97 = 10, 1998-99 = 15, 1999-2000 = 10. So profit increased fastest in 1998-1999." },
  { s: QA, q: "In the given figure, chords PQ and RS intersect each other at point L. Find the length of RL.", o: ["3 cm","6 cm","8 cm","2 cm"], e: "When two chords intersect inside a circle, PL × LQ = RL × LS. Using the values from the figure: 9 × 4 = RL × 6 → RL = 6 cm." },
  { s: QA, q: "In the given figure, BC is a chord and CD is a tangent through the point C. If ∠AOC = 118°, then find the ∠ACD.", o: ["59°","65°","56°","63°"], e: "∠ABC = ½ × ∠AOC = ½ × 118° = 59° (angle at centre is twice the angle at circumference). By alternate segment theorem, ∠ACD = ∠ABC = 59°." },
  { s: QA, q: "M is the circumcentre of ΔABC with circumradius 15 cm. Let BC = 24 cm and ML is perpendicular to BC. Then the length of ML is :", o: ["9 cm","12 cm","8 cm","10 cm"], e: "ML, the perpendicular from circumcentre to chord BC, bisects BC. So BL = 12 cm. In ΔMLB: ML² = MB² − BL² = 15² − 12² = 81 → ML = 9 cm." },
  { s: QA, q: "The average age of 25 men is 28 years. 5 new men of an average age of 25 years joined them. Find the average age of all the men together.", o: ["27.5 years","29.5 years","26.5 years","28.5 years"], e: "Combined mean = (25×28 + 5×25)/30 = (700+125)/30 = 825/30 = 27.5 years." },
  { s: QA, q: "Which of the following option is completely divisible by 11?", o: ["809781","107611","116571","963391"], e: "Apply alternating-digit-sum rule. 963391: (9+3+9) − (6+3+1) = 11, divisible by 11. None of the others give a multiple of 11." },
  { s: QA, q: "If a + b + c = 2, 1/a + 1/b + 1/c = 0, ac = 1/4 (so abc = 4) and a³ + b³ + c³ = 28, find the value of a² + b² + c².", o: ["8","6","10","12"], e: "From 1/a+1/b+1/c = 0 ⇒ ab+bc+ca = 0. Using a³+b³+c³ − 3abc = (a+b+c)(a²+b²+c² − (ab+bc+ca)): 28 − 12 = 2(a²+b²+c²) ⇒ a²+b²+c² = 8." },
  { s: QA, q: "If x − 2y = 3 and xy = 5, find the value of x² − 4y².", o: ["22","20","23","21"], e: "(x+2y)² = (x−2y)² + 8xy = 9 + 40 = 49 ⇒ x+2y = 7. So x²−4y² = (x+2y)(x−2y) = 7 × 3 = 21." },
  { s: QA, q: "The following graph given the annual percent profit earned by a company during the period 1996-2001. Study the graph carefully and answer the questions that follow.\n\nThe expenditure of the company during the year 1996 was Rs 30 crores. The income of the company in that year was (in crores Rs):", o: ["43.5","45","44.5","44"], e: "From graph, profit % in 1996 = 45%. Profit% = (Income − Expenditure)/Expenditure × 100. 45 = (Income − 30)/30 × 100 ⇒ Income − 30 = 13.5 ⇒ Income = 43.5 crores." },
  { s: QA, q: "Rs 6,300 is divided between X, Y, Z, such that X:Y = 7 : 5 and Y : Z = 4 : 3. Find the share of Y.", o: ["Rs 1,800","Rs 2,000","Rs 2,200","Rs 2,400"], e: "X:Y = 28:20, Y:Z = 20:15 ⇒ X:Y:Z = 28:20:15. Sum = 63. Share of Y = 20/63 × 6300 = Rs 2,000." },
  { s: QA, q: "If (cos θ + sin θ)/(cos θ − sin θ) = 8, then the value of cot θ is equal to:", o: ["6/5","9/7","7/6","8/7"], e: "Applying componendo-dividendo: (2 cos θ)/(2 sin θ) = (8+1)/(8−1) = 9/7 ⇒ cot θ = 9/7." },
  { s: QA, q: "List the price of a bike is 15% more than its cost price. It is sold at a discount of 20%. Find the dealer's loss or profit percentage.", o: ["Profit 8%","Profit 9%","Loss 9%","Loss 8%"], e: "Let CP = 100. List price = 115. SP after 20% discount = 115 × 0.8 = 92. Loss = 100 − 92 = 8 → Loss 8%." },
  { s: QA, q: "Kavita's attendance in her school for the academic session 2018-2019 was 216 days. On computing her attendance, it was observed that her attendance was 90%. The total working days of the school were:", o: ["194","250","240","195"], e: "90% of x = 216 ⇒ x = 216 × 100/90 = 240 days." },
  { s: QA, q: "If cos(x − y) = √3/2 and sin(x + y) = 1/2 (0 < x < 90°), then the value of x is:", o: ["60°","15°","45°","30°"], e: "cos(x−y) = √3/2 ⇒ x−y = 30°. sin(x+y) = 1/2 ⇒ x+y = 30°. Adding: 2x = 60° ⇒ x = 30°." },
  { s: QA, q: "The least value of 8 cosec²θ + 25 sin²θ is :", o: ["40√2","30√2","10√2","20√2"], e: "Minimum value of (a cosec²θ + b sin²θ) where a, b > 0 is approached using AM-GM. Per the answer key, the listed least value is 20√2." },
  { s: QA, q: "In ΔXYZ, L and M are the middle points of the sides XY and XZ, respectively. R is a point on the segment LM, such that LR : RM = 1 : 2. If LR = 3 cm, then YZ is equal to :", o: ["16 cm","18 cm","19 cm","17 cm"], e: "LR : RM = 1 : 2 with LR = 3 ⇒ RM = 6, so LM = 9 cm. By midpoint theorem, YZ = 2 × LM = 18 cm." },
  { s: QA, q: "The given graph shows the pass percentage of students taught by six teachers of a school in the Senior Secondary Board exam.\n\nIdentify the teacher whose students have shown the maximum improvement.", o: ["Mr. Joshi","Mr. Saxena","Mrs. Taneja","Dr. Kalra"], e: "Per the graph, Dr. Kalra's students have shown the maximum improvement in pass percentage." },
  { s: QA, q: "The diagonal of a rectangle is 15 cm and length is 12 cm. Find the area of the rectangle.", o: ["114 cm²","108 cm²","116 cm²","112 cm²"], e: "Diagonal² = l² + b² ⇒ 15² = 12² + b² ⇒ b² = 225 − 144 = 81 ⇒ b = 9. Area = 12 × 9 = 108 cm²." },
  { s: QA, q: "In how many years shall Rs 3,500 invested at the rate of 10% simple interest per annum, amount to Rs 4,500?", o: ["2 5/7 years","2 3/7 years","2 4/7 years","2 6/7 years"], e: "SI = 4500 − 3500 = 1000. T = (SI×100)/(P×R) = (1000×100)/(3500×10) = 20/7 = 2 6/7 years." },
  { s: QA, q: "If cot A = k, then sin A is equal to : (presume that A is an acute angle)", o: ["1/√(1+k²)","k","1/k²","k/√(1+k²)"], e: "If cot A = k = base/perpendicular, then base = k, perpendicular = 1, hypotenuse = √(1+k²). sin A = perpendicular/hypotenuse = 1/√(1+k²)." },
  { s: QA, q: "The following graph represents the annual percentage profit earned by a company during the period 1996-2001. Study the graph carefully and answer the questions that follow.\n\nThe profit earned by the company is maximum in the year :", o: ["1999","1996","2001","2000"], e: "From the graph, the profit was maximum in the year 2000." },
  { s: QA, q: "15 men can complete a task in 10 days. In how many days can 20 men complete the same task?", o: ["8.5 days","7.5 days","5.5 days","6.5 days"], e: "Total man-days = 15 × 10 = 150. With 20 men: 150/20 = 7.5 days." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "On 2nd December 2019, who became the first female pilot of the Indian Navy?", o: ["Shivangi","Punita Arora","Bhawana Kanth","Sarla Thakral"], e: "Sub-Lieutenant Shivangi became the first female pilot of the Indian Navy on 2 December 2019." },
  { s: GA, q: "'Saga Dawa' is one of the biggest Buddhist festivals. In which one of the following states is it celebrated?", o: ["Jharkhand","Sikkim","Odisha","Kerala"], e: "Saga Dawa is celebrated in Sikkim." },
  { s: GA, q: "Which of the following Bollywood veterans was chosen for the 66th Dadasaheb Phalke Award for 2018?", o: ["Ashutosh Rana","Shatrughan Sinha","Amitabh Bachchan","Nana Patekar"], e: "Amitabh Bachchan was named the recipient of the 66th Dadasaheb Phalke Award for 2018." },
  { s: GA, q: "Which is the second largest river basin in India that covers 10% of the country's area?", o: ["Mahanadi","Krishna","Narmada","Godavari"], e: "Godavari is India's second largest river basin, covering 10% of the country's land area. The river is 1,465 km long and empties into the Bay of Bengal." },
  { s: GA, q: "Who founded the Indian Statistical Institute (ISI) in Calcutta?", o: ["Prasanta Chandra Mahalanobis","Subhendu Sekhar Bose","JM Sengupta","RN Mookerjee"], e: "Professor P.C. Mahalanobis founded the Indian Statistical Institute in Kolkata on December 17, 1931." },
  { s: GA, q: "The Atrial wall of the human heart secretes a very important peptide hormone. What is the name of that hormone?", o: ["GIP","ANF","ADH","CCK"], e: "ANF (Atrial Natriuretic Factor), also known as ANP, is a peptide hormone secreted by the atria of the heart. It increases renal sodium excretion to reduce extracellular fluid volume." },
  { s: GA, q: "How many times did Pankaj Advani win the 'IBSF World Billiards Championship'?", o: ["20","22","24","21"], e: "Pankaj Advani won the IBSF World Billiards Championship 22 times." },
  { s: GA, q: "Which article of the Constitution of India mentions that the Lok Sabha must have a Speaker and a Deputy Speaker?", o: ["Article 93","Article 97","Article 85","Article 100"], e: "Article 93 provides that the Lok Sabha must have a Speaker and a Deputy Speaker." },
  { s: GA, q: "With which of the following sports is Bhamidipati Sai Praneeth associated?", o: ["Cricket","Tennis","Badminton","Hockey"], e: "B. Sai Praneeth is an Indian badminton player. After Prakash Padukone, he is the first Indian male badminton player to win a bronze medal at the BWF World Championship." },
  { s: GA, q: "In which process is a protective zinc coating applied on iron to prevent it from rusting?", o: ["Galvanisation","Annealing","Smelting","Welding"], e: "Galvanisation is the process of coating steel or iron with zinc to protect it from rusting." },
  { s: GA, q: "Who became the first player in history to win the 'Sir Garfield Sobers Trophy' for 'ICC Cricketer of the Year'?", o: ["Sachin Tendulkar","Virat Kohli","Ravichandran Ashwin","Mahendra Singh Dhoni"], e: "Virat Kohli became the first player in history to win the Sir Garfield Sobers Trophy for ICC Cricketer of the Year." },
  { s: GA, q: "What is the range of the intensity scale used in measuring earthquakes?", o: ["1 to 7","1 to 12","1 to 15","1 to 5"], e: "The Mercalli intensity scale, created by Giuseppe Mercalli, runs from 1 to 12." },
  { s: GA, q: "In the context of the mesosphere, which of the following statements is NOT correct?", o: ["It is directly above the stratosphere.","Meteorites burn up in this layer on entering from the space.","It is the third layer of the atmosphere.","In this layer temperature rises very rapidly with increasing height."], e: "In the mesosphere, temperature decreases with increasing height (due to decreased solar heating and CO₂ radiative cooling). The statement that temperature rises rapidly with height is NOT correct." },
  { s: GA, q: "Which Indian actress was chosen for the '2020 Crystal Award' given by the World Economic Forum for spreading awareness about mental health?", o: ["Vidya Balan","Kangana Ranaut","Deepika Padukone","Priyanka Chopra"], e: "Deepika Padukone won the '2020 Crystal Award'. She established the 'Live Love Laugh' foundation to raise mental health awareness." },
  { s: GA, q: "Which forest is also referred to as 'Monsoon Forests'?", o: ["Tropical Deciduous Forests","Tropical Evergreen Forests","Mangrove Forests","Montane Forests"], e: "Tropical Deciduous Forests are also called Monsoon Forests, occurring in regions with 70-200 cm of rainfall." },
  { s: GA, q: "What disease is caused by insulin deficiency?", o: ["Scleroderma","Multiple Sclerosis","Diabetes mellitus","Rheumatoid arthritis (RA)"], e: "Diabetes mellitus is a metabolic disorder caused by insulin deficiency, characterised by high blood sugar levels." },
  { s: GA, q: "In a computer, which unit is responsible for processing data and is also called the electronic brain of the computer?", o: ["RAM","Keyboard","Central Processing Unit (CPU)","Hard Disk"], e: "The CPU (Central Processing Unit) is the electronic brain of the computer. It performs arithmetic, logic, controlling, and input/output operations." },
  { s: GA, q: "Who was best known for hoisting the Indian National Congress flag at the Gowalia Tank maidan in Bombay during the Quit India Movement?", o: ["Aruna Asaf Ali","Lakshmi Sahgal","Kanaklata Barua","Bhikaiji Rustom Cama"], e: "Aruna Asaf Ali hoisted the Congress flag at Gowalia Tank Maidan during the Quit India Movement. She is referred to as the 'Grand Old Lady' of the Independence Movement." },
  { s: GA, q: "Which of the following is INCORRECTLY paired?", o: ["Pedology – Phyto geography","Hydrology – Oceanography","Anthropology – Cultural geography","Demography – Population geography"], e: "Pedology studies soil origins/morphology, NOT phytogeography (which studies plant distribution). So 'Pedology – Phyto geography' is incorrectly paired." },
  { s: GA, q: "'Aatish-i-Chinar' (Flames of Chinar) is the autobiography of which politician?", o: ["APJ Abdul Kalam","Benazir Bhutto","M Hidyatullah","Sheikh Muhammad Abdullah"], e: "Sheikh Muhammad Abdullah's autobiography is 'Aatish-i-Chinar' (Flames of Chinar). He is also known as 'Sher-e-Kashmir'." },
  { s: GA, q: "According to the Economist Intelligence Unit (EIU), what is India's rank in the 2019 worldwide Index of Cancer Preparedness (ICP)?", o: ["15","10","28","19"], e: "India ranked 19th out of 28 countries in the 2019 ICP, with a score of 64.9." },
  { s: GA, q: "Who introduced the 'Doctrine of Lapse'?", o: ["Lord Wellesley","Lord Lytton","Lord Dalhousie","Lord Canning"], e: "Lord Dalhousie was Governor-General of India (1848-1856) and established the Doctrine of Lapse." },
  { s: GA, q: "On which day is Constitution Day celebrated every year in India?", o: ["30 November","15 October","26 November","2 October"], e: "Constitution Day (Samvidhan Diwas) is celebrated on 26 November. The Constitution was adopted on 26 November 1949 and went into effect on 26 January 1950." },
  { s: GA, q: "In which year were the 'Kalbelia' folk songs and dances of Rajasthan included in UNESCO's representative list of Intangible Cultural Heritage?", o: ["2012","2010","2017","2015"], e: "Kalbelia folk songs and dances were added to UNESCO's representative list of Intangible Cultural Heritage in 2010." },
  { s: GA, q: "Which of the following companies was chosen for the UN Global Climate Action Award in the 'Carbon Neutral Now' category in September 2019?", o: ["Reliance Health","Infosys","Wipro","Organic India"], e: "Infosys was selected for the UN Global Climate Action Award in the 'Carbon Neutral Now' category in September 2019, the only Indian corporation to receive this recognition that year." }
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

  // Drop any prior copy so this seed is idempotent (we re-uploaded images)
  const dropRes = await PracticeTest.deleteMany({
    examPattern: pattern._id,
    title: { $regex: /12 October 2020/i }
  });
  if (dropRes.deletedCount > 0) {
    console.log(`Dropped ${dropRes.deletedCount} prior copy of this PYQ.`);
  }

  console.log('\nUploading images to Cloudinary...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id,
    title: 'SSC CHSL Tier-I - 12 October 2020 Shift-1',
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
