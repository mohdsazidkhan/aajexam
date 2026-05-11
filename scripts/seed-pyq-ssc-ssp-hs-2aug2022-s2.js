/**
 * Seed: SSC Selection Post Phase X (Higher Secondary Level) PYQ - 2 August 2022, Shift-2 (100 questions)
 * Source: SSC official response sheet PDF (with knowledge-based corrections for unanswered/wrong choices)
 *
 * Note: image filenames use '2-aug-2022' (not '2-august-2022') convention.
 *
 * Run with: node scripts/seed-pyq-ssc-ssp-hs-2aug2022-s2.js
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

const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC Staff Selection Post/2022/august/02/shift-2/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-ssp-hs-2aug2022-s2';

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

const F = '2-aug-2022';
// REA Q7, Q14, Q18 have full image sets; Q9 has question image only.
// QA Q53 (=QA Q3), Q55 (=Q5), Q59 (=Q9), Q66 (=Q16) are question-image only.
const IMAGE_MAP = {
  7:  { q: `${F}-q-7.png`,
        opts: [`${F}-q-7-option-1.png`,`${F}-q-7-option-2.png`,`${F}-q-7-option-3.png`,`${F}-q-7-option-4.png`] },
  9:  { q: `${F}-q-9.png` },
  14: { q: `${F}-q-14.png`,
        opts: [`${F}-q-14-option-1.png`,`${F}-q-14-option-2.png`,`${F}-q-14-option-3.png`,`${F}-q-14-option-4.png`] },
  18: { q: `${F}-q-18.png`,
        opts: [`${F}-q-18-option-1.png`,`${F}-q-18-option-2.png`,`${F}-q-18-option-3.png`,`${F}-q-18-option-4.png`] },
  53: { q: `${F}-q-53.png` },
  55: { q: `${F}-q-55.png` },
  59: { q: `${F}-q-59.png` },
  66: { q: `${F}-q-66.png` }
};

// 1-based answer key (Chosen Options + GK overrides for unanswered/wrong picks).
const KEY = [
  // 1-25 (General Intelligence) — Q3/Q22 wrong picks overridden
  4,1,2,2,4, 2,3,3,2,2, 3,2,2,3,4, 1,3,4,2,4, 2,2,1,1,4,
  // 26-50 (English Language) — Q7/Q17/Q20 wrong picks overridden
  3,4,4,3,3, 1,2,2,2,3, 4,4,3,4,1, 1,3,4,4,1, 4,3,3,3,4,
  // 51-75 (Quantitative Aptitude) — Q11 wrong overridden
  1,4,4,4,3, 2,2,3,4,4, 3,4,3,1,1, 4,4,3,1,3, 2,2,4,1,4,
  // 76-100 (General Awareness) — Q3/Q4/Q10/Q14/Q22/Q23/Q25 wrong picks overridden
  3,1,3,1,1, 3,4,2,3,2, 1,2,4,1,2, 1,4,1,4,4, 3,1,4,4,1
];
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const RAW = [
  // ============ General Intelligence (1-25) ============
  { s: REA, q: "Select the option that represents the correct order of the given words as they would appear in an English dictionary.\n\n1. Luxury  2. Lyrics  3. Luscious  4. Lyrical  5. Luxurious", o: ["4, 1, 5, 2, 3","2, 4, 5, 1, 3","3, 2, 1, 4, 5","3, 5, 1, 4, 2"], e: "Order: Luscious(3), Luxurious(5), Luxury(1), Lyrical(4), Lyrics(2) → 3,5,1,4,2." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nXI, EE, LB, SZ, ?", o: ["ZY","ZX","YY","YZ"], e: "1st letter +7 (X,E,L,S,Z). 2nd letter diffs −4,−3,−2,−1 (I,E,B,Z,Y). Missing = ZY." },
  { s: REA, q: "Select the correct option that indicates the arrangement of the following words in a logical and meaningful order.\n\n1. milli  2. nano  3. centi  4. giga  5. mega", o: ["4, 3, 2, 1, 5","2, 1, 3, 5, 4","2, 4, 5, 3, 1","4, 5, 2, 3, 1"], e: "Smallest to largest: nano(10⁻⁹) < milli(10⁻³) < centi(10⁻²) < mega(10⁶) < giga(10⁹) → 2,1,3,5,4." },
  { s: REA, q: "Which of the following letter-clusters will replace the question mark (?) in the given series?\n\nZG, BD, CX, EO, FC, ?", o: ["HL","HN","HK","HM"], e: "1st letter alt +2/+1 (Z,B,C,E,F,H). 2nd letter diffs −3,−6,−9,−12,−15 (G,D,X,O,C,N). Missing = HN." },
  { s: REA, q: "In a code language, 'TUBE' is coded as XYFI and 'WIRE' is coded as AMVI. How will 'BULB' be coded in the same language?", o: ["FZPF","EYPZ","FYQE","FYPF"], e: "Each letter +4. BULB: B+4=F, U+4=Y, L+4=P, B+4=F → FYPF." },
  { s: REA, q: "In a certain code language, 'ANCIENT' is written as 'EPCIVPG' and 'ADVANCE' is written as 'XFCAGEP'. How will 'ABILITY' be written in that language?", o: ["KDCLBVK","KDCLAVK","KDCNAVK","KDCLAWK"], e: "Per response sheet, option 2 (KDCLAVK)." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nHEATED : TWAHWX :: BODIES : ZMXSWI :: CABLES : ?", o: ["YBZPWI","YAZQWJ","YAZPWI","YAZPXI"], e: "Mirror cipher with sum 28: each letter X → (28−X). CABLES: C→Y, A→A, B→Z, L→P, E→W, S→I = YAZPWI." },
  { s: REA, q: "Refer to the image for the question.", o: ["4","6","1","5"], e: "Per response sheet, option 2 (6)." },
  { s: REA, q: "In a code language, 'FIG' is coded as 9, and 'PLUM' is coded as 16. How will 'GUAVA' be coded in the same language?", o: ["30","25","20","35"], e: "Code = (number of letters)². FIG=3²=9; PLUM=4²=16; GUAVA=5²=25." },
  { s: REA, q: "Which of the following interchanges of numbers (not the digits of the numbers) would make the given equation correct?\n\n16 ÷ 12 × 4 + 8 − 16 = 32", o: ["12 and 16","8 and 32","8 and 16","4 and 32"], e: "Per response sheet, option 3 (8 and 16)." },
  { s: REA, q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets.\n\n(23, 9, 307)\n(17, 21, 457)", o: ["(18, 4, 222)","(28, 13, 464)","(34, 8, 392)","(14, 26, 264)"], e: "Pattern: c = a×b + 100. 23·9+100=307 ✓; 17·21+100=457 ✓; 28·13+100 = 464 ✓." },
  { s: REA, q: "Three statements are given followed by three conclusions numbered I, II and III. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements.\n\nStatements:\nSome wallets are purses.\nSome purses are bags.\nAll bags are suitcases.\n\nConclusions:\nI. No wallet is a suitcase.\nII. Some purses are suitcases.\nIII. All wallets being bags is a possibility.", o: ["Only conclusion I follows","Only conclusions II and III follow","All conclusions I, II and III follow","Only conclusions I and II follow"], e: "II follows from 'some purses are bags + all bags are suitcases'. III is a possibility, cannot be ruled out. I is too strong." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 3." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nPROM : QJLN :: WEAR : XWZI :: NOSE : ?", o: ["LKGU","OPTF","MLHV","OMHV"], e: "Per response sheet, option 4 (OMHV)." },
  { s: REA, q: "In a certain code language, 'CHILD' is written as '6169248' and 'GUEST' is written as '142153840'. How will 'BOOK' be written in that language?", o: ["4151522","2303011","23011","41522"], e: "Pattern: consonant × 2; vowel keeps alphabet position. BOOK: B(2×2)=4, O(15), O(15), K(11×2)=22 → '4151522'." },
  { s: REA, q: "Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster.\n\nSONG : VQOT :: RIDE : UKEV :: BEAR : ?", o: ["EHDU","CGDI","EGBI","YVZI"], e: "First 3 letters +3,+2,+1; last letter mirror (sum 27). BEAR: B+3=E, E+2=G, A+1=B, R↔I (mirror) → EGBI." },
  { s: REA, q: "Refer to the image for the figure-pattern question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: REA, q: "Select the option that is related to the third word in the same way as the second word is related to the first word.\n\nBee : Buzz :: Bird : ?", o: ["Egg","Chirp","Nest","Chick"], e: "A bee buzzes; a bird chirps (the sound it makes)." },
  { s: REA, q: "Which of the following numbers will replace the question mark (?) in the given series?\n\n91, 102, 139, ?, 187, 198, 235", o: ["155","162","145","150"], e: "Alternating +11, +37. 91+11=102, +37=139, +11=150, +37=187 ✓." },
  { s: REA, q: "In a certain code language, 'GOOD' is written as '75' and 'FINE' is written as '82'. How will 'BEST' be written in that language?", o: ["68","70","62","72"], e: "Per response sheet, option 2 (70)." },
  { s: REA, q: "In a code language, 'he is tall' is coded as 'lu ma na', 'Giraffe is tall' is coded as 'na pa ma'. What is the code for the word 'Giraffe'?", o: ["ma","pa","lu","na"], e: "Common words ('is', 'tall') correspond to ma & na. So 'he' = lu and 'Giraffe' = pa (the unique word in eq.2)." },
  { s: REA, q: "'A # B' means 'A is the husband of B'.\n'A @ B' means 'A is the wife of B'.\n'A & B' means 'A is the mother of B'.\n'A % B' means 'A is the father of B'.\n\nIf 'J @ I % H # G & F', then how is I related to F?", o: ["Father's father","Father-in-law","Mother's father","Brother"], e: "I is father of H; H is husband of G; G is mother of F ⇒ H is F's father. So I is F's father's father." },
  { s: REA, q: "In this question, three statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusion(s) logically follow(s) from the statements.\n\nStatements:\nAll notebooks are stationeries.\nSome stationeries are pencils.\nAll pencils are costly.\n\nConclusions:\nI. All notebooks are pencils.\nII. All stationeries are costly.", o: ["Neither conclusion I nor II follows.","Only conclusion I follows.","Both conclusions I and II follow.","Only conclusion II follows."], e: "Neither conclusion can be definitely inferred from 'some stationeries are pencils'." },
  { s: REA, q: "A is the brother of B. B is the son of C. C is married to D. E is the daughter of D. E is married to F. How is A related to F?", o: ["Father's father","Father-in-law","Brother","Wife's brother"], e: "C and D are parents of both A and E (siblings). E is F's wife ⇒ A is F's wife's brother." },

  // ============ English Language (26-50) ============
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nHe brought these sweets for you and I.", o: ["for I and you","for you and I both","for you and me","No substitution required"], e: "After preposition 'for', use objective case 'me' (not subjective 'I'): 'for you and me'." },
  { s: ENG, q: "Select the option that expresses the given sentence in direct speech.\n\nThey said that they had gone on a vacation.", o: ["They said, \"we have been going on a vacation.\"","They said, \"we has gone on a vacation.\"","They said, \"we had been gone on a vacation.\"","They said, \"we have gone on a vacation.\""], e: "Reported past perfect 'had gone' → direct present perfect 'have gone'." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nThe assignment will be completed by him tomorrow.", o: ["He will have completed the assignment tomorrow.","He will be completing the assignment tomorrow.","He is completing the assignment tomorrow.","He will complete the assignment tomorrow."], e: "Future-simple passive 'will be completed' → future-simple active 'will complete'." },
  { s: ENG, q: "Select the most appropriate idiom or phrase to complete the given sentence.\n\nI'm not coming to office today, I'm ________.", o: ["taking a back seat","not playing with the full deck","feeling a bit under the weather","letting sleeping dogs lie"], e: "'Feeling a bit under the weather' = feeling slightly unwell — fits skipping office." },
  { s: ENG, q: "Sentences of a paragraph are given below in jumbled order. Arrange the sentences in the correct order to form a meaningful and coherent paragraph.\n\nA. A small stream emerged from a cluster of rocks to feed the pool.\nB. It was on such a day — a hot, tired day — that Ranji found the pool in the forest.\nC. During the monsoon, this stream would be a gushing torrent, cascading down from the hills, but during the summer, it was barely a trickle.\nD. The water had a gentle translucency, and you could see the smooth round pebbles at the bottom of the pool.", o: ["CDAB","ABCD","BDAC","DACB"], e: "B (found pool) → D (water/pebbles described) → A (stream feeding pool) → C (stream's seasonal behaviour) = BDAC." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nOne who loves wisdom and hence pursues it", o: ["Philosopher","Astrologer","Psychologist","Philanderer"], e: "'Philosopher' literally means 'lover of wisdom' (from Greek philo + sophos)." },
  { s: ENG, q: "Select the INCORRECTLY spelt word.", o: ["Asleep","Abraod","Adjust","Alive"], e: "'Abraod' is misspelled — correct is 'Abroad'." },
  { s: ENG, q: "Select the correct superlative degree of comparison for the given sentence.\n\nThe money arrived when I (little) expected it.", o: ["The money arrived when I expected it.","The money arrived when I least expected it.","The money arrived when I less expected it.","The money arrived when I little expected it."], e: "Superlative of 'little' = 'least'." },
  { s: ENG, q: "Select the most appropriate option that can substitute the underlined segment in the given sentence. If there is no need to substitute it, select 'No substitution required'.\n\nIn the introductory session, the teacher asked me to what district I came from.", o: ["to which district","which district","No substitution required","what district"], e: "'Which district' is the natural interrogative form in reported speech context." },
  { s: ENG, q: "Select the option that can be used as a one-word substitute for the given group of words.\n\nThe killing of one's sister", o: ["Fratricide","Regicide","Sororicide","Homicide"], e: "Sororicide = killing of one's sister (from Latin soror = sister)." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nBy whom have the problems been solved?", o: ["Who solved the problems?","Who solves the problems?","Whose problems were solved?","Who has solved the problems?"], e: "Present-perfect passive 'have been solved' → active 'has solved'." },
  { s: ENG, q: "Select the option that expresses the given sentence in active voice.\n\nRohit was taught classical music by the most renowned master in the state Sri Sanath Maharaj.", o: ["The most renowned master in the state Sri Sanath Maharaj is teaching classical music to Rohit","The classical music Rohit learnt was from the most renowned master in the state Sri Sanath Maharaj.","The most renowned master in the state Sri Sanath Maharaj was taught classical music by Rohit.","The most renowned master in the state Sri Sanath Maharaj taught classical music to Rohit"], e: "Past simple passive 'was taught' → past simple active 'taught'." },
  { s: ENG, q: "Select the most appropriate meaning of the underlined idiom in the given sentence.\n\nAll eyes turned to him because he was the only person who could stave off the impending war.", o: ["draw","invoke","prevent","provoke"], e: "'Stave off' = avert / prevent / ward off." },
  { s: ENG, q: "Select the most appropriate synonym of the underlined word.\n\nThe teacher corroborated the statement of the principal.", o: ["disapproved","disagreed","criticised","confirmed"], e: "'Corroborated' = confirmed / supported with evidence." },
  { s: ENG, q: "Select the most appropriate ANTONYM of the underlined word.\n\nDespite the criticism, the government did not rescind the policy.", o: ["Reinstate","Relegate","Rewind","Revoke"], e: "'Rescind' (cancel / revoke) — antonym 'Reinstate' (restore / bring back)." },
  { s: ENG, q: "Read the passage about a struggling shopkeeper, and answer.\n\nSelect the most appropriate option to fill in blank number 1.\n\n'as the railways (1)_________ more peddlers on the platforms.'", o: ["were admitting","had been admitted","were admitted","has been admitted"], e: "Past continuous active 'were admitting' fits the past-tense narrative." },
  { s: ENG, q: "Read the passage about a struggling shopkeeper, and answer.\n\nSelect the most appropriate option to fill in blank number 2.\n\n'my credit sales alone (2) _________.'", o: ["have flourished","are flourishing","flourished","has flourished"], e: "Simple past 'flourished' matches the rest of the past-tense narrative." },
  { s: ENG, q: "Read the passage about a struggling shopkeeper, and answer.\n\nSelect the most appropriate option to fill in blank number 3.\n\n'there (3) __________ on the shelves all over the shop.'", o: ["have been immense gaps","was immense gaps","has been immense gaps","were immense gaps"], e: "Plural subject 'immense gaps' takes 'were' in past tense." },
  { s: ENG, q: "Read the passage about a struggling shopkeeper, and answer.\n\nSelect the most appropriate option to fill in blank number 4.\n\n'I (4) __________ the old stationmaster and porter'", o: ["pleaded over","pleaded on","pleaded of","pleaded with"], e: "'Pleaded with' (someone) is the standard collocation." },
  { s: ENG, q: "Read the passage about a struggling shopkeeper, and answer.\n\nSelect the most appropriate option to fill in blank number 5.\n\n'the order had come from (5) __________.'", o: ["high up","high peak","high down","high top"], e: "'From high up' = from a higher authority / from above (idiomatic)." },
  { s: ENG, q: "Read the passage about Electric Vehicles in India, and answer.\n\nSelect the ANTONYM of the word 'grave'.", o: ["Serious","Lofty","Grand","Trivial"], e: "'Grave' (serious / weighty) — antonym 'Trivial' (insignificant)." },
  { s: ENG, q: "Read the passage about Electric Vehicles in India, and answer.\n\nSelect one of the reasons mentioned in the passage for buying an EV.", o: ["Government policy","Higher mileage than normal vehicles","To protect our mother earth","40 to 45% higher price than normal vehicles"], e: "Per passage: 'saving on petrol and diesel and contributing to saving our mother earth are rational reasons to buy it'." },
  { s: ENG, q: "Read the passage about Electric Vehicles in India, and answer.\n\nWhat is NOT a challenge faced by the customers/buyers of EV?", o: ["Charging issue","The high price","Motor companies not producing many EVs","Fire incidents"], e: "The passage mentions charging, high price, and fire incidents as challenges — but not lack of production." },
  { s: ENG, q: "Read the passage about Electric Vehicles in India, and answer.\n\nIdentify the summary of the passage.", o: ["With the advent of EVs fuel-driven vehicles will disappear","EVs will come on Indian roads soon but cannot continue due to the electricity shortage","Though there are some issues, EVs will arrive on Indian roads soon, which is good for customers and for the earth","There are serious issues that are stopping buyers from buying EVs"], e: "The passage acknowledges issues but ends on a positive note — option 3 captures the balanced summary." },
  { s: ENG, q: "Read the passage about Electric Vehicles in India, and answer.\n\nSelect a suitable title for the passage.", o: ["How to Own an EV","EVs in the World","Woes in Owning EVs","EVs – The Present and Future"], e: "The passage covers both present challenges and future prospects of EVs — fits 'EVs – The Present and Future'." },

  // ============ Quantitative Aptitude (51-75) ============
  { s: QA, q: "The average of twelve numbers is 25. If each number is added by 6, then the new average will be:", o: ["31","20","25","19"], e: "Adding the same constant k to each number increases the average by k. New avg = 25+6 = 31." },
  { s: QA, q: "The bisectors BI and CI of ∠B and ∠C of a △ABC meet in I. If ∠A = 38°, then what is ∠BIC equal to?", o: ["125°","120°","105°","109°"], e: "∠BIC = 90° + ∠A/2 = 90° + 19° = 109°." },
  { s: QA, q: "Refer to the image for the year-related question.", o: ["2018","2020","2019","2021"], e: "Per response sheet, option 4 (2021)." },
  { s: QA, q: "A sum of money on compound interest amounts to Rs.13,200 in 2 years and Rs.14,520 in 3 years. What is the rate of interest per annum?", o: ["9%","7%","8%","10%"], e: "Year-3 interest on year-2 amount: (14520−13200)/13200 × 100 = 1320/13200 × 100 = 10%." },
  { s: QA, q: "Refer to the image for the percentage question.", o: ["0.67%","0.57%","0.78%","0.87%"], e: "Per response sheet, option 3 (0.78%)." },
  { s: QA, q: "A 15% discount is allowed by a tradesman. How much above the cost price (in percentage) must he mark his goods so as to gain 19%?", o: ["32%","40%","35%","47%"], e: "MP = CP × 1.19/0.85 = 1.40·CP. So mark 40% above CP." },
  { s: QA, q: "Rahul can complete a work in 12 days and Ayush in 15 days. If they work together for 3 days, then the fraction of work that will be left is:", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Together rate = 1/12 + 1/15 = 9/60 = 3/20 per day. In 3 days = 9/20. Left = 11/20. Per response sheet, option 2." },
  { s: QA, q: "The longest chord of a circle is equal to:", o: ["three times the radius","two times the diameter","two times the radius","the radius"], e: "The longest chord is the diameter, which equals 2 × radius." },
  { s: QA, q: "Refer to the image for the country/data question.", o: ["Country D","Country A","Country B","Country C"], e: "Per response sheet, option 4 (Country C)." },
  { s: QA, q: "Rohan spends 24% of an amount of money on an insurance policy, 36% on food, 18% on children's education and 14% on recreation. He deposits the remaining amount of Rs.504 in the bank. What is the total amount that he spends on food and insurance policy together?", o: ["Rs.3,708","Rs.3,087","Rs.3,870","Rs.3,780"], e: "Saved = 100−92 = 8% = 504 ⇒ Total = ₹6,300. Food+Insurance = 60% = ₹3,780." },
  { s: QA, q: "The material of a solid right circular cylinder is converted into the shape of a solid cone of equal radius. If the height of the cylinder was 4.5 cm, then the height of the cone is:", o: ["15 cm","1.5 cm","13.5 cm","45 cm"], e: "Equal volume: πr²·h_cyl = (1/3)πr²·h_cone ⇒ h_cone = 3 × 4.5 = 13.5 cm." },
  { s: QA, q: "A person buys a table fan for Rs.1,800 and sells it at a loss of 25%. What is the selling price of the table fan?", o: ["Rs.1,400","Rs.1,450","Rs.1,300","Rs.1,350"], e: "SP = 1800 × (1 − 0.25) = 1800 × 0.75 = ₹1,350." },
  { s: QA, q: "If 608xy0 is divisible by both 3 and 11, the nonzero digit in the hundred's place and ten's places, respectively, are:", o: ["5 and 6","5 and 8","8 and 5","6 and 5"], e: "Test x=8, y=5: digit sum = 6+0+8+8+5+0 = 27 (div by 3 ✓); alt sum from right = 0−5+8−8+0−6 = −11 (div by 11 ✓)." },
  { s: QA, q: "Refer to the image for the question.", o: ["4454","5461","4265","5405"], e: "Per response sheet, option 1 (4454)." },
  { s: QA, q: "A person can row downstream 49 km in 7 hours and upstream 36 km in 9 hours. What is the speed of the current?", o: ["1.5 km/h","2 km/h","2.5 km/h","3 km/h"], e: "Downstream speed = 49/7 = 7 km/h. Upstream = 36/9 = 4 km/h. Current = (7−4)/2 = 1.5 km/h." },
  { s: QA, q: "Refer to the image for the question.", o: ["Option 1","Option 2","Option 3","Option 4"], e: "Per response sheet, option 4." },
  { s: QA, q: "The mean of 10 numbers is 0. If 38 and -2 are included in these numbers, the new mean will be:", o: ["6","18","0","3"], e: "Old sum = 0. New sum = 0 + 38 + (−2) = 36. New mean = 36/12 = 3." },
  { s: QA, q: "Find the fourth proportional of 3, 7, 12.", o: ["36","21","28","42"], e: "Fourth proportional = (7 × 12)/3 = 84/3 = 28." },
  { s: QA, q: "In a typing shop, Lalit can complete typing of a book in 9 days, while Amit can finish the same work in 8 days. How many days will they take together to complete the work?", o: ["4.23 days","5.23 days","3.99 days","4.98 days"], e: "Together rate = 1/9 + 1/8 = 17/72. Days = 72/17 ≈ 4.235 days." },
  { s: QA, q: "12 years ago, the ratio of the ages of Ram and Laxman was 2 : 1. After 13 years from now, the ratio of their ages will be 9 : 7. The sum of their present ages is:", o: ["63","48","54","30"], e: "12 yrs ago: Ram=2x, Laxman=x. 25 yrs later: (2x+25)/(x+25) = 9/7 ⇒ x=10. Present: 32+22 = 54." },
  { s: QA, q: "Suppose every three adults consume 2 litres of milk, 0.5 kg sugar every day and the daily consumption of every five children is double the milk and half of the sugar than what the three adults consume. A family has 5 adults and 8 children. Their expenditure on milk and sugar, for a month of 30 days, if half-litre milk packets costs Rs.25 and one kg sugar packet costs Rs.80, is __________.", o: ["Rs.21,960","Rs.17,560","Rs.18,540","Rs.19,630"], e: "Daily milk = 5(2/3) + 8(4/5) = 146/15 L. Monthly = 292 L = 584 half-L packets × ₹25 = ₹14,600. Daily sugar = 5(1/6) + 8(0.05) = 37/30 kg. Monthly = 37 kg × ₹80 = ₹2,960. Total = ₹17,560." },
  { s: QA, q: "Two numbers are in the ratio of 5 : 7 and their LCM is 385. Find the numbers.", o: ["54, 77","55, 77","54, 76","55, 76"], e: "Numbers 5x, 7x. LCM = 35x = 385 ⇒ x = 11. Numbers = 55, 77." },
  { s: QA, q: "Refer to the image for the question.", o: ["5.23","12","4.46","10"], e: "Per response sheet, option 4 (10)." },
  { s: QA, q: "A policeman follows a thief, who is 840 metres ahead of him. The thief and the policeman run at a speed of 7.5 km/h and 9 km/h, respectively. What distance (in km) is run by the thief before he is nabbed by the policeman?", o: ["4.2","3.1","3.8","4.5"], e: "Relative speed = 1.5 km/h. Time to close 0.84 km = 0.56 h. Thief's distance = 7.5 × 0.56 = 4.2 km." },
  { s: QA, q: "A multi-store outlet sold 1375 items in a week earning 25% gain. The gain is also equal to the selling price of 'Q' number of items. What is the value of Q?", o: ["250","325","225","275"], e: "Gain = 25% of CP = (25/125) of SP = 1/5 of SP. So Q = 1375/5 = 275." },

  // ============ General Awareness (76-100) ============
  { s: GA, q: "Rabindranath Tagore gave up his knighthood as a result of which of the following events?", o: ["Chittagong uprising","Kakori conspiracy","Jallianwala Bagh massacre","Chauri-Chaura incident"], e: "Tagore renounced his knighthood in May 1919 as a protest against the Jallianwala Bagh massacre (13 April 1919)." },
  { s: GA, q: "In which year was the National Commission for Women established in India?", o: ["1992","1994","1993","1991"], e: "The National Commission for Women (NCW) was established on 31 January 1992 under the NCW Act, 1990." },
  { s: GA, q: "Purushottam Dadheech, the Padma Shri Awardee 2020, is a renowned dancer and choreographer from Indore in the dance form:", o: ["Kuchipudi","Bharatnatyam","Kathak","Kathakali"], e: "Purushottam Dadheech (1934–) is a celebrated Kathak exponent and choreographer from Indore, MP." },
  { s: GA, q: "The Siri Fort in New Delhi was constructed during the reign of which medieval Indian ruler?", o: ["Allauddin Khilji","Jahangir","Feroz Shah Tughlaq","Akbar"], e: "Siri Fort, the second of Delhi's seven historic cities, was built by Alauddin Khilji of the Khilji dynasty (c. 1303)." },
  { s: GA, q: "The violation of Fundamental Rights could be redressed by the Supreme Court under which of the following Articles?", o: ["32","301","265","226"], e: "Article 32 (Right to Constitutional Remedies) allows citizens to move the Supreme Court for enforcement of Fundamental Rights." },
  { s: GA, q: "The Prarthana Samaj was established at ________ in the year 1867.", o: ["Calcutta","Poona","Bombay","Delhi"], e: "Prarthana Samaj was founded in Bombay on 31 March 1867 by Atmaram Pandurang." },
  { s: GA, q: "Which state in India is the source of river Ghaggar?", o: ["Uttar Pradesh","Uttarakhand","Haryana","Himachal Pradesh"], e: "The Ghaggar river originates from the Shivalik Hills in Himachal Pradesh." },
  { s: GA, q: "Select the correct statement from the given options.", o: ["The wind blowing in the western ghats in winters is known as Loo.","The wind blowing in the northern plains in summers is known as Loo.","The wind blowing in the northern plains in summers is known as Trade winds.","The wind blowing in the coastal areas in winters is known as Loo."], e: "Loo is a hot, dry wind that blows over the northern plains of India during summer (May–June)." },
  { s: GA, q: "The Vaishnava saint, Sankaradeva introduced the ________ dance in the 15th century CE.", o: ["Manipuri","Kathak","Sattriya","Odissi"], e: "Srimanta Sankaradeva (1449–1568), the Assamese saint, introduced Sattriya dance as part of his Bhakti movement." },
  { s: GA, q: "Rajendra I was the son of which of the following Chola kings?", o: ["Virarajendra","Rajaraja I","Vijayalaya","Gandaraditya"], e: "Rajendra I (Rajendra Chola I) was the son and successor of Rajaraja Chola I; reigned 1014–1044 CE." },
  { s: GA, q: "Boxing Federation of India (BFI) hosted the 2021 men's national championships in the state of __________.", o: ["Karnataka","Tamil Nadu","Kerala","Goa"], e: "Per response sheet, option 1 (Karnataka)." },
  { s: GA, q: "India's unemployment rate touched ___ in December 2021.", o: ["8.2%","7.9%","10%","6.5%"], e: "Per CMIE data, India's unemployment rate rose to 7.9% in December 2021." },
  { s: GA, q: "Where is the National Remote Sensing Centre (NRSC) located?", o: ["Mumbai","Delhi","Pune","Hyderabad"], e: "The National Remote Sensing Centre (NRSC), under ISRO, is headquartered at Balanagar, Hyderabad." },
  { s: GA, q: "In November 2021, Pratap Singh Khachariyawas was allocated food and civil supplies in the Cabinet expansion of the state of ______.", o: ["Rajasthan","Uttar Pradesh","Madhya Pradesh","Chhattisgarh"], e: "Pratap Singh Khachariyawas is a Rajasthan Congress leader; he was allocated Food & Civil Supplies in the Nov 2021 Rajasthan cabinet expansion." },
  { s: GA, q: "Our brain mainly depends on which of the following food?", o: ["Fat and proteins","Glucose and amino acids","Only fat","Only glucose"], e: "The brain primarily uses glucose for energy and amino acids for neurotransmitter and protein synthesis." },
  { s: GA, q: "In physics, steradian is a unit of:", o: ["solid-angle measure","plane angle measure","length measure","mass measure"], e: "Steradian (sr) is the SI unit of solid angle (3D angle); plane angles use radian." },
  { s: GA, q: "The English classic novel 'The Great Gatsby' is written by:", o: ["Leo Tolstoy","Charles Dickens","Jane Austen","F Scott Fitzgerald"], e: "'The Great Gatsby' (1925) is by American author F. Scott Fitzgerald." },
  { s: GA, q: "Which antimicrobial enzymes are present in milk?", o: ["Lactoferrin, lactoperoxidase, and lysozyme","Lipofactin, lipase and lactose","Lactase, invertase, and lipase","Lactose, fructose and mannose"], e: "Milk contains the antimicrobial enzymes lactoferrin, lactoperoxidase and lysozyme." },
  { s: GA, q: "India is the second most populous country with a population of ______, according to the 2011 census data.", o: ["1,678 million","1,245 million","1,300 million","1,210 million"], e: "Per Census 2011, India's population was 1,210 million (1.21 billion)." },
  { s: GA, q: "__________ is the supreme legislative body of India.", o: ["The Supreme Court","The Rajya Sabha","The Lok Sabha","The Parliament"], e: "The Parliament of India (President + Lok Sabha + Rajya Sabha) is the supreme legislative body." },
  { s: GA, q: "As per the Union Budget 2022-23, a scheme called PM Development Initiative for _________ is proposed to be launched.", o: ["West India","North India","North East","North West"], e: "PM-DevINE (Prime Minister's Development Initiative for North East) was announced in the Union Budget 2022-23." },
  { s: GA, q: "Noted singer Tansen, who lived in 16th century, was the disciple of which saint?", o: ["Haridas","Surdas","Kabirdas","Tulsidas"], e: "Tansen, one of Akbar's Navratnas, was a disciple of Swami Haridas of Vrindavan." },
  { s: GA, q: "How many Mandalas are there in the Rigveda?", o: ["Six","Four","Eight","Ten"], e: "The Rigveda is organised into 10 Mandalas (books) containing 1028 hymns (suktas)." },
  { s: GA, q: "Ibrahim Lodi was defeated by ________ in the battle of Panipat.", o: ["Aurangzeb","Akbar","Humayun","Babur"], e: "Babur defeated Ibrahim Lodi at the First Battle of Panipat (1526), founding the Mughal empire." },
  { s: GA, q: "The custom of decorating eggs is practiced during which of the following festivals?", o: ["Easter","Epiphany","Christmas","Navroz"], e: "Easter is associated with the custom of decorated eggs (Easter eggs), symbolising new life and the resurrection." }
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
      tags: ['SSC', 'Selection Post', 'Phase X', 'Higher Secondary', 'PYQ', '2022'],
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

  let exam = await Exam.findOne({ code: 'SSC-SSP-HS' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'SSC Selection Post (Higher Secondary Level)',
      code: 'SSC-SSP-HS',
      description: 'Staff Selection Commission - Selection Post Phase X (Higher Secondary Level - 12th-pass eligibility)',
      isActive: true
    });
  }

  const PATTERN_TITLE = 'SSC Selection Post (Higher Secondary Level)';
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

  const TEST_TITLE = 'SSC Selection Post Phase X (Higher Secondary) - 2 August 2022 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images to Cloudinary)...');
  const questions = await buildQuestionsWithImages();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2022, pyqShift: 'Shift-2',
    pyqExamName: 'SSC Selection Post Phase X (Higher Secondary)', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
