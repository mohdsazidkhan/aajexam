/**
 * Seed: SSC MTS 2016 Paper-I PYQ - Shift-1 (150 questions)
 * Source: Oswaal SSC MTS Year-wise Solved Papers (docx + PDF).
 *
 * SSC MTS (2016 Pattern) Paper-I:
 *   - General English                    : Q1-50   (50 Q)
 *   - General Intelligence & Reasoning   : Q51-75  (25 Q)
 *   - Numerical Aptitude                 : Q76-100 (25 Q)
 *   - General Awareness                  : Q101-150 (50 Q)
 *   1 mark each, 0.25 negative. Total 150 marks, 150 minutes.
 *
 * Answers were resolved by explanation CONTENT (and by solving the maths),
 * not the printed numeric key, because the Oswaal key follows the original
 * SSC option order which sometimes differs from the reprinted option order.
 *
 * Run: node scripts/seed-pyq-ssc-mts-2016-s1.js
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

const ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC MTS/2016/shift-1/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-mts-2016-s1';

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

const ENG = 'General English';
const REA = 'General Intelligence & Reasoning';
const NUM = 'Numerical Aptitude';
const GA  = 'General Awareness';

// Figure questions whose questionImage is a cropped/extracted figure.
const IMAGE_MAP = { 57:'q-57.png', 64:'q-64.png', 65:'q-65.png', 69:'q-69.png', 73:'q-73.png', 75:'q-75.png' };

function sectionFor(n) {
  if (n <= 50) return ENG;
  if (n <= 75) return REA;
  if (n <= 100) return NUM;
  return GA;
}

async function uploadIfExists(filename) {
  const fp = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(fp)) { console.log(`  MISSING image ${filename}`); return ''; }
  const res = await cloudinary.uploader.upload(fp, {
    folder: CLOUDINARY_FOLDER,
    public_id: '2016-s1-' + filename.replace(/\.png$/i, ''),
    overwrite: true, resource_type: 'image'
  });
  return res.secure_url;
}

const RAW = [
{
"n": 1,
"q": "Directions: Find the part of the sentence that has an error. If there is no error, choose \"No error\".\nThis sponge is not able to absorbing water.",
"o": [
"This sponge is",
"no error",
"not able to",
"absorbing water."
],
"ans": 3,
"e": "The infinitive 'to' must be followed by the base verb, so 'absorbing water' should be 'absorb water'. The error lies in option 4."
},
{
"n": 2,
"q": "Directions: Find the part of the sentence that has an error. If there is no error, choose \"No error\".\nI am thinking I will go to the market later this afternoon.",
"o": [
"I am thinking",
"No error",
"later this afternoon",
"I will go to the market"
],
"ans": 0,
"e": "Verbs like 'think, hope, believe' are normally not used in the progressive form; 'I am thinking' should be 'I think'. The error is in option 1."
},
{
"n": 3,
"q": "Directions: Find the part of the sentence that has an error. If there is no error, choose \"No error\".\nI am too much pleased to know that you have topped the list.",
"o": [
"to know that",
"you have topped the list",
"no error",
"I am too much pleased"
],
"ans": 3,
"e": "'Too much' carries a negative sense; it should be 'too pleased' or 'very pleased'. The error is in option 4 ('I am too much pleased')."
},
{
"n": 4,
"q": "Directions: Find the part of the sentence that has an error. If there is no error, choose \"No error\".\nHave you been doing what has been asks of you?",
"o": [
"Have you",
"been doing",
"what has been asks of you?",
"No error"
],
"ans": 2,
"e": "After 'has been' the past participle is required, so 'asks' should be 'asked'. The error is in option 3."
},
{
"n": 5,
"q": "Directions: Find the part of the sentence that has an error. If there is no error, choose \"No error\".\nWe rejoiced at his being promoted.",
"o": [
"being promoted",
"No error",
"we rejoiced",
"at his"
],
"ans": 1,
"e": "The sentence is grammatically correct ('We rejoiced at his being promoted'), so the answer is 'No error'."
},
{
"n": 6,
"q": "Directions: Find the part of the sentence that has an error. If there is no error, choose \"No error\".\nKindly submit your documents to the clerk.",
"o": [
"to the clerk",
"No error",
"your documents",
"Kindly submit"
],
"ans": 1,
"e": "The sentence is grammatically correct, so the answer is 'No error'."
},
{
"n": 7,
"q": "Directions: Find the part of the sentence that has an error. If there is no error, choose \"No error\".\nIt is a most beautiful painting in the gallery.",
"o": [
"It is a most",
"beautiful painting",
"in the gallery.",
"No error"
],
"ans": 0,
"e": "A superlative adjective ('most beautiful') takes the definite article 'the', not 'a'; it should be 'the most beautiful'. The error is in option 1."
},
{
"n": 8,
"q": "Directions: Find the part of the sentence that has an error. If there is no error, choose \"No error\".\nLove for ours environment is enough to protect nature.",
"o": [
"no error",
"ours environment",
"is enough to protect",
"love for nature"
],
"ans": 1,
"e": "Before a noun the possessive adjective 'our' is used, not the pronoun 'ours'; it should be 'our environment'. The error is in option 2."
},
{
"n": 9,
"q": "Directions: Find the part of the sentence that has an error. If there is no error, choose \"No error\".\nHe is not what you would call an honest man, doesn't he?",
"o": [
"he is not what",
"you would call an honest man",
"doesn't he?",
"no error"
],
"ans": 2,
"e": "When the main clause is negative the question tag should be positive: 'is he?'. The error is in option 3 ('doesn't he?')."
},
{
"n": 10,
"q": "Directions: Find the part of the sentence that has an error. If there is no error, choose \"No error\".\nHe has not been attending English classes for one week.",
"o": [
"He has not been attending",
"English classes",
"For one week",
"No error"
],
"ans": 2,
"e": "With a point of time marking the start of an ongoing action, 'since' is used rather than 'for'; it should be 'since one week'. The error is in option 3."
},
{
"n": 11,
"q": "Directions: Fill in the blank with the most appropriate word.\nSince she is a teacher of language, one would not expect her to be guilty of a ____.",
"o": [
"solecism",
"bornbast",
"schism",
"stanchion"
],
"ans": 0,
"e": "A 'solecism' is a grammatical mistake in speech or writing, which a language teacher would not be expected to commit."
},
{
"n": 12,
"q": "Directions: Fill in the blank with the most appropriate word.\nAnna is not popular. She has ____ friends.",
"o": [
"a little",
"a few",
"few",
"little"
],
"ans": 2,
"e": "'Few' (with countable nouns) means 'not many' and carries the negative sense matching 'not popular'; the answer is 'few'."
},
{
"n": 13,
"q": "Directions: Fill in the blank with the most appropriate word.\nSally parked and got ____ the car quickly.",
"o": [
"out of",
"on",
"in",
"over"
],
"ans": 0,
"e": "After parking, Sally would 'get out of' the car, so the correct phrase is 'out of'."
},
{
"n": 14,
"q": "Directions: Fill in the blank with the most appropriate word.\n____ she can't drive, Anita has bought a car.",
"o": [
"Since",
"Even though",
"Whether or not",
"Even if"
],
"ans": 1,
"e": "'Even though' means 'despite the fact that', which fits the contrast that she can't drive yet bought a car."
},
{
"n": 15,
"q": "Directions: Fill in the blank with the most appropriate word.\nYou will have to face some practical problems when you start ____ this plan.",
"o": [
"prosecuting",
"proscribing",
"prescribing",
"executing"
],
"ans": 3,
"e": "'Executing' means putting a plan into effect, which fits the context. The answer is 'executing'."
},
{
"n": 16,
"q": "Directions: Fill in the blank with the most appropriate word.\nThey were worried about a new cult which ____ many followers.",
"o": [
"must be gaining",
"were gaining",
"was gaining",
"is gaining"
],
"ans": 2,
"e": "The sentence is in the past tense and 'cult' is singular, so 'was gaining' is the correct form."
},
{
"n": 17,
"q": "Directions: Fill in the blank with the most appropriate word.\nThe actor died when his car turned ____.",
"o": [
"turtle",
"tortoise",
"across",
"tiger"
],
"ans": 0,
"e": "The idiom 'turn turtle' means to turn upside down, which fits a fatal car accident. The answer is 'turtle'."
},
{
"n": 18,
"q": "Directions: Fill in the blank with the most appropriate word.\nA man is known ____ the company he keeps.",
"o": [
"of",
"by",
"for",
"in"
],
"ans": 1,
"e": "The proverb is 'A man is known by the company he keeps', so 'by' is correct."
},
{
"n": 19,
"q": "Directions: Fill in the blank with the most appropriate word.\nHe must ____ the loans.",
"o": [
"repeal",
"repay",
"repeat",
"receipt"
],
"ans": 1,
"e": "'Repay' means to pay back a loan, which fits the context. The answer is 'repay'."
},
{
"n": 20,
"q": "Directions: Fill in the blank with the most appropriate word.\nThe convict was ____ on a Monday.",
"o": [
"hanging",
"hanged",
"hang",
"hung"
],
"ans": 1,
"e": "'Hanged' is the past form used for execution by hanging (as opposed to 'hung' for suspending objects). The answer is 'hanged'."
},
{
"n": 21,
"q": "Directions: Choose the word most opposite in meaning to the given word.\nAuthentic",
"o": [
"fake",
"honest",
"frank",
"futile"
],
"ans": 0,
"e": "'Authentic' means genuine, so its antonym is 'fake'."
},
{
"n": 22,
"q": "Directions: Choose the word most opposite in meaning to the given word.\nMethodical",
"o": [
"orderly",
"flurry",
"random",
"crazy"
],
"ans": 2,
"e": "'Methodical' means systematic and ordered, so its antonym is 'random'."
},
{
"n": 23,
"q": "Directions: Choose the word most opposite in meaning to the given word.\nPolite",
"o": [
"rude",
"rough",
"tough",
"rash"
],
"ans": 0,
"e": "'Polite' means courteous, so its antonym is 'rude'."
},
{
"n": 24,
"q": "Directions: Choose the word or phrase that can most appropriately substitute the given expression.\nIn a primitive or uncivilized state.",
"o": [
"rural",
"savage",
"village",
"olden"
],
"ans": 1,
"e": "'Savage' means lacking civilising influences, which matches 'a primitive or uncivilized state'."
},
{
"n": 25,
"q": "Directions: Choose the word or phrase that can most appropriately substitute the given expression.\nHappening every year.",
"o": [
"annually",
"routine",
"timely",
"season"
],
"ans": 0,
"e": "'Annually' means happening once a year, which fits 'happening every year'."
},
{
"n": 26,
"q": "Directions: Choose the word or phrase that can most appropriately substitute the given expression.\nOne who believes in God.",
"o": [
"pilgrim",
"believer",
"theist",
"worshipper"
],
"ans": 2,
"e": "A 'theist' is someone who believes in the existence of a god or gods. The answer is 'theist'."
},
{
"n": 27,
"q": "Directions: Choose the word or phrase that can most appropriately substitute the given expression.\nAll in a mess.",
"o": [
"disturbing",
"disarranged",
"negligence",
"distracting"
],
"ans": 1,
"e": "'Disarranged' means having the arrangement or order disturbed, which fits 'all in a mess'. The answer is 'disarranged'."
},
{
"n": 28,
"q": "Directions: Choose the word or phrase that can most appropriately substitute the given expression.\nA number of people listening to a concert or lecture.",
"o": [
"group",
"audience",
"tribe",
"spectator"
],
"ans": 1,
"e": "An 'audience' is a group of listeners at an event such as a lecture or concert. The answer is 'audience'."
},
{
"n": 29,
"q": "Directions: Part of the sentence is underlined. Choose the alternative that best improves it; if none is needed, choose \"No improvement\".\nHow long I shall stay is doubtful. (underlined: shall stay)",
"o": [
"I can stay",
"I will say",
"I want to stay",
"No improvement"
],
"ans": 1,
"e": "The sentence expresses uncertainty about the future, for which 'will' is preferred over 'shall'. The intended correction is 'I will stay' (option 2, here misprinted as 'I will say')."
},
{
"n": 30,
"q": "Directions: Part of the sentence is underlined. Choose the alternative that best improves it; if none is needed, choose \"No improvement\".\nEven at the peak of her success, Kalpana Chawla did not forget her home or her duty towards other human, this is evident from the fact that she distributed education of girls in India. (underlined: she distributed education of girls)",
"o": [
"she contribute to education of girls.",
"she contributed girls for education.",
"No improvement.",
"she contributed to the education of girls."
],
"ans": 3,
"e": "The correct form uses the past tense 'contributed' with the definite article: 'she contributed to the education of girls'. The answer is option 4."
},
{
"n": 31,
"q": "Directions: Part of the sentence is underlined. Choose the alternative that best improves it; if none is needed, choose \"No improvement\".\nEvery person was not fitted for everything. (underlined: was not fitted)",
"o": [
"is not fit at",
"No improvement",
"was not fix at",
"is not fit for"
],
"ans": 3,
"e": "The sentence states a general truth, requiring simple present, and the idiom is 'fit for': 'Every person is not fit for everything.' The answer is option 4."
},
{
"n": 32,
"q": "Directions: Part of the sentence is underlined. Choose the alternative that best improves it; if none is needed, choose \"No improvement\".\nThe doctor scribbed his prescription which I could not make out. (underlined: make out)",
"o": [
"make over",
"make up",
"make for",
"No improvement"
],
"ans": 3,
"e": "'Make out' correctly means to manage with difficulty to read or decipher something, so no improvement is needed. The answer is option 4."
},
{
"n": 33,
"q": "Directions: Part of the sentence is underlined. Choose the alternative that best improves it; if none is needed, choose \"No improvement\".\nNeither parties deserves our help. (underlined: parties deserves)",
"o": [
"No improvement",
"parties deserved",
"party deserves",
"parties deserve"
],
"ans": 2,
"e": "'Neither' takes a singular noun and singular verb, so it should be 'Neither party deserves our help.' The answer is 'party deserves'."
},
{
"n": 34,
"q": "Directions: Choose the word that best expresses the meaning of the given word.\nStationery",
"o": [
"Writing accessories",
"Computer accessories",
"Moving",
"Fixed"
],
"ans": 0,
"e": "'Stationery' means writing and office materials, so the answer is 'writing accessories'."
},
{
"n": 35,
"q": "Directions: Choose the word that best expresses the meaning of the given word.\nAbhorrent",
"o": [
"Irregularity",
"Repugnant",
"Admirable",
"Uncommon"
],
"ans": 1,
"e": "'Abhorrent' means inspiring disgust and loathing, which matches 'repugnant'. The answer is 'repugnant'."
},
{
"n": 36,
"q": "Directions: Choose the word that best expresses the meaning of the given word.\nInnocent",
"o": [
"Guilt",
"Bias",
"Offence",
"Guiltless"
],
"ans": 3,
"e": "'Innocent' means not guilty of a crime or offence, which matches 'guiltless'. The answer is 'guiltless'."
},
{
"n": 37,
"q": "Directions: Find the correctly spelt word.",
"o": [
"municiple",
"muneciple",
"munecipal",
"municipal"
],
"ans": 3,
"e": "The correctly spelt word is 'municipal'."
},
{
"n": 38,
"q": "Directions: Find the correctly spelt word.",
"o": [
"journal",
"jornal",
"jornale",
"jurnale"
],
"ans": 0,
"e": "The correctly spelt word is 'journal'."
},
{
"n": 39,
"q": "Directions: Find the correctly spelt word.",
"o": [
"license",
"liscense",
"lisense",
"licanse"
],
"ans": 0,
"e": "The correctly spelt word is 'license'."
},
{
"n": 40,
"q": "Directions: Find the correctly spelt word.",
"o": [
"harrass",
"harass",
"harras",
"haraas"
],
"ans": 1,
"e": "The correctly spelt word is 'harass'."
},
{
"n": 41,
"q": "Directions: Find the correctly spelt word.",
"o": [
"saperate",
"separete",
"separate",
"seperate"
],
"ans": 2,
"e": "The correctly spelt word is 'separate'."
},
{
"n": 42,
"q": "Directions: Find the correctly spelt word.",
"o": [
"exhilarate",
"exhelerate",
"exhilerate",
"exelerate"
],
"ans": 0,
"e": "The correctly spelt word is 'exhilarate'."
},
{
"n": 43,
"q": "Directions: Choose the alternative that best expresses the meaning of the underlined idiom.\nThe presentation by the group at the meeting passes muster.",
"o": [
"achieves to impress.",
"meets required standards.",
"does not meet the required standards.",
"fails to impress."
],
"ans": 1,
"e": "The idiom 'pass muster' means to be accepted as adequate or satisfactory, i.e. 'meets required standards'."
},
{
"n": 44,
"q": "Directions: Choose the alternative that best expresses the meaning of the underlined idiom.\nAll and sundry were asked to leave the village immediately.",
"o": [
"some people",
"all the people",
"all the adults and elderly",
"all the adults"
],
"ans": 1,
"e": "The idiom 'all and sundry' means everyone, i.e. 'all the people'."
},
{
"n": 45,
"q": "Directions: Choose the alternative that best expresses the meaning of the underlined idiom.\nJoe can be a loose canon sometimes.",
"o": [
"one who acts without thinking.",
"one who speaks without thinking.",
"one who acts crazy.",
"one who is unpredictable."
],
"ans": 2,
"e": "A 'loose cannon' is someone who behaves in an uncontrolled or unexpected way, best matched here by 'one who acts crazy'."
},
{
"n": 46,
"q": "Directions: Read the passage and answer the question.\nWhat best describes Mr. Rogers at the school assembly?",
"o": [
"ruthless and cruel",
"a sensitive army officer",
"a formidable teacher",
"a genial person"
],
"ans": 2,
"e": "At the assembly Mr. Rogers, with his formidable manner and frowning, behaved like an inspecting officer, so he is best described as 'a formidable teacher'."
},
{
"n": 47,
"q": "Directions: Read the passage and answer the question.\nThe staff considered Mr. Rogers to be ____.",
"o": [
"an intimidating person",
"a person to be idolized",
"a person without any scruples",
"a gentle and understanding person"
],
"ans": 0,
"e": "The chemistry master called him a 'dehydrated old sadist' and he was ruthless in public, so the staff saw him as 'an intimidating person'."
},
{
"n": 48,
"q": "Directions: Read the passage and answer the question.\n\"In a most intimidating way\" means.",
"o": [
"in a very fowl way",
"in a very helpless way",
"in an extremely intimate manner",
"in an extremely frightening manner"
],
"ans": 3,
"e": "Given his frowning and tirades of abuse that left offenders trembling, 'in a most intimidating way' means 'in an extremely frightening manner'."
},
{
"n": 49,
"q": "Directions: Read the passage and answer the question.\nAnother word for 'magnanimous' is:",
"o": [
"generous",
"high handed",
"magnificient",
"arrogant"
],
"ans": 0,
"e": "'Magnanimous' means generous or forgiving, so the answer is 'generous'."
},
{
"n": 50,
"q": "Directions: Read the passage and answer the question.\nWhat happened to boys who visited him in private?",
"o": [
"They came out trembling and in tears.",
"They looked even more worried than before.",
"They echoed the sentiments of the staff members.",
"They seemed relieved of their troubles."
],
"ans": 3,
"e": "Boys who saw him privately received a sympathetic hearing and left feeling lightened, so 'they seemed relieved of their troubles'."
},
{
"n": 51,
"q": "From the given alternative words, select the word which cannot be formed using the letters of the given word.\n\nVENTURE",
"o": [
"RENT",
"TURN",
"TRU",
"RATE"
],
"ans": 3,
"e": "The word VENTURE has no letter 'A', so 'RATE' cannot be formed from its letters."
},
{
"n": 52,
"q": "If '+' means '×', '–' means '÷', '×' means '–' and '÷' means '+', then the value of the given equation is:\n\n9 + 8 ÷ 8 – 4 × 6 = ?",
"o": [
"11",
"65",
"68",
"36"
],
"ans": 2,
"e": "Replacing the signs: 9 × 8 + 8 ÷ 4 – 6 = 72 + 2 – 6 = 68."
},
{
"n": 53,
"q": "A series is given with one term missing. Choose the alternative that will complete the series.\n\nACE, GIK, ?, SUW, YAC",
"o": [
"MOQ",
"MPQ",
"MOP",
"MNP"
],
"ans": 0,
"e": "Each group advances by +6 from the previous (A→G→M→S→Y). After GIK, adding 6 to each letter gives MOQ."
},
{
"n": 54,
"q": "Choose the alternative that will complete the series.\n\n2, 5, 10, 17, 26, ?",
"o": [
"37",
"35",
"38",
"33"
],
"ans": 0,
"e": "The differences are 3, 5, 7, 9, 11 (consecutive odd numbers). So 26 + 11 = 37."
},
{
"n": 55,
"q": "Find the missing number from the given responses.\n\n  4    8    2\n  3    2    2\n  5    8    ?\n 60  128   68",
"o": [
"13",
"17",
"15",
"19"
],
"ans": 1,
"e": "In each column, the product of the first three numbers equals the fourth: 4×3×5=60, 8×2×8=128, so 2×2×?=68 → ?=17."
},
{
"n": 56,
"q": "A man facing south turns to his left and walks 10 m, then he turns to his right and walks 15 m, again he turns to his left and walks 5 m and then he turns to his left and walks 15 m. In which direction is he facing now?",
"o": [
"South",
"West",
"North",
"East"
],
"ans": 2,
"e": "Facing South: left→East, right→South, left→East, left→North. He is finally facing North."
},
{
"n": 57,
"q": "Find the number of triangles in the given figure.",
"o": [
"16",
"20",
"18",
"14"
],
"ans": 2,
"e": "Counting all the small and composite triangles in the figure gives a total of 18 triangles."
},
{
"n": 58,
"q": "Select the related number from the given alternatives.\n\n8 : 512 :: 9 : ?",
"o": [
"728",
"729",
"781",
"792"
],
"ans": 1,
"e": "The pattern is the cube of the number: 8³ = 512, so 9³ = 729."
},
{
"n": 59,
"q": "Select the related letters from the given alternatives.\n\nADIP : DGLS :: BEJQ : ?",
"o": [
"FINU",
"EJQU",
"EHMT",
"CGLS"
],
"ans": 2,
"e": "Each letter is advanced by +3: A→D, D→G, I→L, P→S. Similarly BEJQ → EHMT."
},
{
"n": 60,
"q": "Select the related word from the given alternatives.\n\nAuthor : Pen :: Doctor : ?",
"o": [
"Hospital",
"Dispensary",
"Stethoscope",
"Ward"
],
"ans": 2,
"e": "An author's tool is a pen; a doctor's characteristic instrument is a stethoscope."
},
{
"n": 61,
"q": "Select the related pair from the given alternatives.\n\nPOLITE : ETILOP :: ?",
"o": [
"DRAOB : BROAD",
"SINGLE : ELGNIS",
"CHART : TRACH",
"WOMEN : WOMAN"
],
"ans": 1,
"e": "ETILOP is POLITE written in reverse. Only SINGLE reversed gives ELGNIS exactly (DRAOB→BOARD and CHART→TRAHC do not match)."
},
{
"n": 62,
"q": "Consider the statement to be true and decide which conclusion follows.\n\nStatement: No man is a donkey. Rahul is a man.\nConclusions:\nI. Rahul is not a donkey.\nII. All men are not Rahul.",
"o": [
"Only Conclusion I follows.",
"Neither Conclusion I nor II follows.",
"Only Conclusion II follows.",
"Either Conclusion I or II follows."
],
"ans": 0,
"e": "Since no man is a donkey and Rahul is a man, Rahul is not a donkey — Conclusion I follows. II does not definitely follow."
},
{
"n": 63,
"q": "Some equations are solved on the basis of a certain system. Find the correct answer for the unsolved equation.\n\n9 × 6 × 2 = 269,  8 × 6 × 5 = 568,  5 × 4 × 1 = ?",
"o": [
"201",
"145",
"415",
"451"
],
"ans": 1,
"e": "Each set of digits is written in reverse order: (9,6,2)→269, (8,6,5)→568, so (5,4,1)→145."
},
{
"n": 64,
"q": "From the given answer figures, select the one in which the question figure is hidden / embedded.",
"o": [
"Option (1)",
"Option (2)",
"Option (3)",
"Option (4)"
],
"ans": 3,
"e": "The question figure can be traced completely within answer figure (4)."
},
{
"n": 65,
"q": "If a mirror is placed on the line MN, which of the answer figures is the right image of the given figure?",
"o": [
"Option (1)",
"Option (2)",
"Option (3)",
"Option (4)"
],
"ans": 0,
"e": "In a mirror image, left and right are interchanged while top and bottom remain the same; this gives option (1)."
},
{
"n": 66,
"q": "Find the odd word/number from the given alternatives.",
"o": [
"Kilometres",
"Kilograms",
"Tonnes",
"Quintals"
],
"ans": 0,
"e": "Kilometre is a unit of length/distance, whereas Kilograms, Tonnes and Quintals are all units of mass."
},
{
"n": 67,
"q": "Find the odd letters from the given alternatives.",
"o": [
"JKNQ",
"DEGJ",
"YZBE",
"QRTW"
],
"ans": 0,
"e": "In DEGJ, YZBE and QRTW the gaps between letters are +1, +2, +3. JKNQ follows +1, +3, +3, so it is the odd one out."
},
{
"n": 68,
"q": "Find the odd number from the given alternatives.",
"o": [
"154",
"119",
"85",
"51"
],
"ans": 0,
"e": "119, 85 and 51 are all multiples of 17 (17×7, 17×5, 17×3), but 154 is not."
},
{
"n": 69,
"q": "A piece of paper is folded and cut as shown in the question figures. From the given answer figures, indicate how it will appear when opened.",
"o": [
"Option (1)",
"Option (2)",
"Option (3)",
"Option (4)"
],
"ans": 0,
"e": "Unfolding the symmetrically cut paper produces the pattern shown in option (1)."
},
{
"n": 70,
"q": "Which one of the given responses would be a meaningful order of the following?\n\n1. Family  2. Community  3. Member  4. Locality  5. Country",
"o": [
"3, 1, 2, 4, 5",
"3, 1, 2, 5, 4",
"3, 1, 4, 2, 5",
"3, 1, 4, 5, 2"
],
"ans": 2,
"e": "In increasing order of size: Member → Family → Locality → Community → Country, i.e. 3, 1, 4, 2, 5."
},
{
"n": 71,
"q": "The age of a father is twice that of the elder son. After ten years, the age of the father will be three times that of the younger son. If the difference of ages of the two sons is 15 years, the age of the father is?",
"o": [
"70 years",
"55 years",
"60 years",
"50 years"
],
"ans": 3,
"e": "Let elder son = E, younger = Y, father F = 2E and F+10 = 3(Y+10). With E−Y = 15, solving gives Y=10, E=25, F=50 years."
},
{
"n": 72,
"q": "If NAME is coded as MZLD, how will CLAIM be coded?",
"o": [
"BKZII",
"BKYHL",
"BKZHL",
"BKZHI"
],
"ans": 2,
"e": "Each letter is replaced by the previous letter (−1): N→M, A→Z, M→L, E→D. So CLAIM → BKZHL."
},
{
"n": 73,
"q": "Which one of the following diagrams represents the relationship among: Fruits, Mango, Banana",
"o": [
"Option (1)",
"Option (2)",
"Option (3)",
"Option (4)"
],
"ans": 3,
"e": "Both Mango and Banana are fruits but are distinct from each other — two separate circles inside one larger 'Fruits' circle, as in option (4)."
},
{
"n": 74,
"q": "A word is represented by one set of numbers as given in the alternatives. In Matrix-I the rows/columns are numbered 0–4 and in Matrix-II they are numbered 5–9. A letter is represented first by its row and then by its column. Identify the set for the word ZEST.\n\nMatrix-I\n   0 1 2 3 4\n0  A R B C E\n1  T H S E R\n2  R E H D S\n3  S D T O C\n4  E B O R A\n\nMatrix-II\n   5 6 7 8 9\n5  K P I L M\n6  X W Z M G\n7  F I K X P\n8  G N F L W\n9  N P X Z L",
"o": [
"89, 13, 03, 01",
"98, 13, 30, 10",
"89, 31, 30, 01",
"98, 13, 33, 04"
],
"ans": 1,
"e": "Z = 98, E = 13, S = 30, T = 10 — giving the set 98, 13, 30, 10."
},
{
"n": 75,
"q": "Which answer figure will complete the pattern in the question figure?",
"o": [
"Option (1)",
"Option (2)",
"Option (3)",
"Option (4)"
],
"ans": 3,
"e": "Option (4) correctly completes the missing portion of the pattern."
},
{
"n": 76,
"q": "P invests Rs 9100 for 3 months, Q invests Rs 6825 for 2 months and R Rs 8190 for 5 months in a business. If the total profit amounts to Rs 4158, how much profit should Q get?",
"o": [
"Rs 346.50",
"Rs 693",
"Rs 682.50",
"Rs 1386"
],
"ans": 1,
"e": "Capital×time ratio = 9100×3 : 6825×2 : 8190×5 = 27300 : 13650 : 40950 = 2 : 1 : 3 (sum 6). Q's share = 4158 × 1/6 = Rs 693."
},
{
"n": 77,
"q": "A contractor has the target of completing a work in 40 days. He employed 20 persons who completed (1/4) of the work in 10 days and left. The number of persons he has to employ to finish the remaining part as per target is:",
"o": [
"20",
"40",
"30",
"10"
],
"ans": 0,
"e": "20 persons × 10 days = 200 person-days for 1/4 of the work, so total work = 800 person-days. Remaining 3/4 = 600 person-days in the remaining 30 days needs 600/30 = 20 persons."
},
{
"n": 78,
"q": "The average of three numbers, of which the greatest is 16, is 12. If the smallest is half of the greatest, the remaining number is:",
"o": [
"12",
"14",
"8",
"10"
],
"ans": 0,
"e": "Sum = 3 × 12 = 36. Greatest = 16, smallest = 16/2 = 8, so the remaining number = 36 − 16 − 8 = 12."
},
{
"n": 79,
"q": "A person covers a certain distance in 6 hours if he travels at 40 km/hour. If he has to cover the same distance in 4 hours, then his speed must be:",
"o": [
"50 km/hour",
"80 km/hour",
"70 km/hour",
"60 km/hour"
],
"ans": 3,
"e": "Distance = 40 × 6 = 240 km. To cover it in 4 hours, speed = 240/4 = 60 km/hour."
},
{
"n": 80,
"q": "By selling a coat for Rs 630, a shopkeeper gains 5%. Find the cost price of the coat.",
"o": [
"Rs 650",
"Rs 625",
"Rs 600",
"Rs 700"
],
"ans": 2,
"e": "CP = 630 × 100/105 = Rs 600."
},
{
"n": 81,
"q": "Two varieties of sugar are mixed together in a certain ratio. The cost of the mixture per kg is Rs 0.50 less than that of the superior and Rs 0.75 more than the inferior variety. The ratio in which the superior and inferior varieties have been mixed is:",
"o": [
"2 : 3",
"5 : 1",
"5 : 2",
"3 : 2"
],
"ans": 3,
"e": "By alligation, superior : inferior = 0.75 : 0.50 = 3 : 2."
},
{
"n": 82,
"q": "P, Q and R can do a piece of work in 60 days, 100 days and 80 days respectively. They together work to finish the work and receive Rs 2256. Then P will get?",
"o": [
"Rs 960",
"Rs 576",
"Rs 564",
"Rs 752"
],
"ans": 0,
"e": "Efficiency ratio = 1/60 : 1/100 : 1/80 = 20 : 12 : 15 (sum 47). P's share = 2256 × 20/47 = Rs 960."
},
{
"n": 83,
"q": "A box contains one rupee, fifty-paise and twenty-five paise coins. The total number of coins is 378. The ratio of values of the above coins is 13 : 11 : 7. The number of twenty-five paise coins was:",
"o": [
"132",
"78",
"210",
"168"
],
"ans": 3,
"e": "Number = value/denomination → 13/1 : 11/0.5 : 7/0.25 = 13 : 22 : 28 (sum 63). Unit = 378/63 = 6, so 25-paise coins = 28 × 6 = 168."
},
{
"n": 84,
"q": "The selling price of a radio was Rs 255 when a 15% discount was allowed. Then the marked price of the radio was?",
"o": [
"Rs 400",
"Rs 300",
"Rs 350",
"Rs 275"
],
"ans": 1,
"e": "MP × 0.85 = 255 → MP = 255/0.85 = Rs 300."
},
{
"n": 85,
"q": "The unit's digit of the number 6^256 − 4^256 is:",
"o": [
"1",
"4",
"0",
"7"
],
"ans": 2,
"e": "6 raised to any power ends in 6; 4 raised to an even power ends in 6. So 6 − 6 = 0; the unit's digit is 0."
},
{
"n": 86,
"q": "Ram's income is Rs 100 more than that of Shyam. If the average income of Ram and Shyam is Rs 850, then Ram's income is:",
"o": [
"Rs 900",
"Rs 800",
"Rs 850",
"Rs 475"
],
"ans": 0,
"e": "Total = 2 × 850 = 1700. Ram = Shyam + 100, so 2×Shyam + 100 = 1700 → Shyam = 800, Ram = Rs 900."
},
{
"n": 87,
"q": "In a college, 1/5th of the girls and 1/8th of the boys took part in a social camp. If the college has an equal number of boys and girls, the fraction of the total number of students that took part in the camp is:",
"o": [
"13/80",
"2/13",
"4/15",
"13/40"
],
"ans": 0,
"e": "With boys = girls = half of total: (1/5)(1/2) + (1/8)(1/2) = 1/10 + 1/16 = 13/80."
},
{
"n": 88,
"q": "Each side of a square is increased by 10%. The percentage increase of its area is:",
"o": [
"20",
"25",
"21",
"12.5"
],
"ans": 2,
"e": "New area = (1.1)² = 1.21 times the original, i.e. an increase of 21%."
},
{
"n": 89,
"q": "The pie-diagram shows the expenditure on the printing of a book under various heads: A = 20%, B = 25%, C = 30%, D = 10%, E = 15%. If the expenditure incurred under head A is Rs 5000, then the sum of expenditure incurred under heads B and D is:",
"o": [
"Rs 5780",
"Rs 7850",
"Rs 8750",
"Rs 8570"
],
"ans": 2,
"e": "A = 20% = Rs 5000, so total = Rs 25000. B + D = 25% + 10% = 35% = Rs 8750."
},
{
"n": 90,
"q": "In the pie-diagram of printing expenditure (A = 20%, B = 25%, C = 30%, D = 10%, E = 15%), the two expenditures which together form an angle of 108° at the centre are:",
"o": [
"A & D",
"D & E",
"A & E",
"B & E"
],
"ans": 0,
"e": "108° = (108/360) × 100% = 30% of the total. A + D = 20% + 10% = 30%."
},
{
"n": 91,
"q": "A two-wheeler depreciates at 20% of its value every year. If the present value is Rs 90000, its depreciated value would be Rs 36864 after:",
"o": [
"3 years",
"6 years",
"4 years",
"5 years"
],
"ans": 2,
"e": "90000 × (0.8)^n = 36864 → (0.8)^n = 0.4096 = (0.8)^4. So n = 4 years."
},
{
"n": 92,
"q": "A sum was doubled at a 12½% rate of simple interest per annum. Then the time taken for that sum is:",
"o": [
"10 years",
"8 years",
"12½ years",
"8½ years"
],
"ans": 1,
"e": "For the sum to double, SI = Principal, so 100 = 12.5 × t → t = 8 years."
},
{
"n": 93,
"q": "The price of a bicycle is marked by a trader at Rs 1000. He sold it allowing successive discounts of 20%, 10% and 5%. Thus the trader gained 14%. The cost price of the bicycle (in rupees) is:",
"o": [
"790",
"600",
"510",
"560"
],
"ans": 1,
"e": "SP = 1000 × 0.8 × 0.9 × 0.95 = Rs 684 = CP × 1.14, so CP = 684/1.14 = Rs 600."
},
{
"n": 94,
"q": "The price of electricity has been increased by 25%. If a person wants to keep the expenditure the same, then the percentage reduction in use of electricity should be:",
"o": [
"19",
"20",
"21",
"18"
],
"ans": 1,
"e": "Reduction = increase/(100 + increase) × 100 = 25/125 × 100 = 20%."
},
{
"n": 95,
"q": "A dealer marks his goods 20% above cost price. He then allows some discount on it and makes a profit of 8%. The rate of discount is:",
"o": [
"6%",
"10%",
"4%",
"12%"
],
"ans": 1,
"e": "1.20 × (1 − d) = 1.08 → 1 − d = 0.90 → d = 10%."
},
{
"n": 96,
"q": "The radius of a sphere is doubled. The percentage increase in its surface area is:",
"o": [
"100",
"400",
"75",
"300"
],
"ans": 3,
"e": "Surface area ∝ r². Doubling r makes it 2² = 4 times, i.e. an increase of 300%."
},
{
"n": 97,
"q": "The ratio of the areas of two squares, one having double the diagonal of the other, is?",
"o": [
"3 : 2",
"2 : 1",
"4 : 1",
"3 : 1"
],
"ans": 2,
"e": "Area of a square ∝ (diagonal)². With diagonals in ratio 2 : 1, areas are 4 : 1."
},
{
"n": 98,
"q": "A man travels 600 km by train at 80 km/hour, 600 km by ship at 30 km/hour, 500 km by aeroplane at 400 km/hour and 300 km by car at 60 km/hour. What is the average speed (km/hour) for the entire distance?",
"o": [
"63",
"62 7/27",
"56 7/27",
"59 7/27"
],
"ans": 3,
"e": "Total distance = 2000 km. Total time = 600/80 + 600/30 + 500/400 + 300/60 = 7.5 + 20 + 1.25 + 5 = 33.75 h. Average speed = 2000/33.75 = 59 7/27 km/h."
},
{
"n": 99,
"q": "A man retired from his service at the age of 60. He served for 3/5th of his retirement age. He joined his job at the age of:",
"o": [
"20 years",
"18 years",
"24 years",
"36 years"
],
"ans": 2,
"e": "Years served = 3/5 × 60 = 36 years. So he joined at 60 − 36 = 24 years."
},
{
"n": 100,
"q": "A man purchased 120 reams of paper at Rs 80 per ream. He spent Rs 280 on transportation, paid octroi at the rate of 40 paise per ream and paid Rs 72 to a porter. In order to gain 8%, he must sell each ream of paper for:",
"o": [
"Rs 90",
"Rs 85",
"Rs 89",
"Rs 87.5"
],
"ans": 0,
"e": "Total cost = 120×80 + 280 + 0.40×120 + 72 = 9600 + 280 + 48 + 72 = Rs 10000. For 8% gain, SP = 10800, per ream = 10800/120 = Rs 90."
},
{
"n": 101,
"q": "In earth atmosphere, which of the following continuously decreases with height?",
"o": [
"Wind velocity",
"Temperature",
"Pressure",
"Humidity"
],
"ans": 1,
"e": "Temperature falls with altitude (normal lapse rate ~6.5Â°C/km) as the troposphere is heated from below by the Earth's surface."
},
{
"n": 102,
"q": "Which state in India has the largest coastline?",
"o": [
"Andhra Pradesh",
"Gujarat",
"Tamil Nadu",
"Maharashtra"
],
"ans": 1,
"e": "Gujarat has the longest coastline in India (~1600 km) along the Arabian Sea."
},
{
"n": 103,
"q": "The Crop Development Programme of the Government of India covers which of the following groups of commercial crops?",
"o": [
"Tea, Cotton and Rubber",
"Jute, Tea and Coffee",
"Cotton, Jute and Sugarcane",
"Tea, Coffee and Spices"
],
"ans": 2,
"e": "The programme covers cotton, jute and sugarcane as commercial crops under the National Food Security Mission."
},
{
"n": 104,
"q": "Under the Constitution of India who are the ultimate sovereign?",
"o": [
"President of India.",
"Indian People.",
"Prime Minister of India.",
"All elected leaders of India."
],
"ans": 1,
"e": "Under the Indian Constitution the Indian people are the ultimate sovereign, holding supreme authority over internal and external matters."
},
{
"n": 105,
"q": "Which of the following does not belong to physical environment?",
"o": [
"Lithosphere",
"Atmosphere",
"Hemisphere",
"Hydrosphere"
],
"ans": 2,
"e": "Lithosphere, atmosphere and hydrosphere form the physical environment; hemisphere is not a part of it."
},
{
"n": 106,
"q": "An example of a solution of liquid in solid is:",
"o": [
"jelly",
"rubber",
"foam",
"smoke"
],
"ans": 0,
"e": "Jelly is a solution of a liquid dispersed in a solid (a gel)."
},
{
"n": 107,
"q": "Which one of the following is not correctly matched?",
"o": [
"Iron-ore â€“ Kudremukh",
"Copper â€“ Khetri",
"Manganese â€“ Koraput",
"Coal â€“ Singreni"
],
"ans": 0,
"e": "Per the answer key, the pair treated as not correctly matched is 'Iron-ore – Kudremukh' (option 1); Khetri–copper, Koraput–manganese and Singareni–coal are taken as correct."
},
{
"n": 108,
"q": "Which was the instrument that was played by Ustad Bismillah Khan?",
"o": [
"Sitar",
"Shehnai",
"Santoor",
"Flute"
],
"ans": 1,
"e": "Ustad Bismillah Khan was the legendary exponent of the shehnai."
},
{
"n": 109,
"q": "Loss of water in plants in the form of liquid is known as:",
"o": [
"Osmosis",
"Imbibition",
"Transpiration",
"Guttation"
],
"ans": 3,
"e": "Guttation is the exudation of liquid water (xylem sap) from leaf tips/edges of plants."
},
{
"n": 110,
"q": "Which memory is both static and non-volatile?",
"o": [
"RAM",
"CACHE",
"ROM",
"BIOS"
],
"ans": 2,
"e": "ROM (Read Only Memory) is both static and non-volatile, retaining data without power."
},
{
"n": 111,
"q": "The Modi Government at the Centre has formed NITI AYOG by replacing which one of the following?",
"o": [
"Finance Commission",
"Planning Commission",
"Agricultural Price Commission",
"Fiscal Commission"
],
"ans": 1,
"e": "NITI Aayog replaced the Planning Commission in 2015 as the government's think-tank."
},
{
"n": 112,
"q": "Poverty in India is measured through one of the following criteria:",
"o": [
"number of rooms of the residence",
"intake of the calories",
"education level of the family",
"number of family members"
],
"ans": 1,
"e": "Poverty is measured by calorie intake (e.g., 2400 rural / 2100 urban calories per day per Alagh's poverty line)."
},
{
"n": 113,
"q": "The Attorney General of India is appointed by the:",
"o": [
"Prime Minister",
"Law Minister",
"President of India",
"Home Minister"
],
"ans": 2,
"e": "The Attorney General of India is appointed by the President on the advice of the government."
},
{
"n": 114,
"q": "Which of the following cannot act as a bleaching agent?",
"o": [
"Nitrous oxide",
"Sulphur dioxide",
"Chlorine",
"Hydrogen peroxide"
],
"ans": 0,
"e": "Chlorine, SO2 (in moist conditions) and hydrogen peroxide all bleach; nitrous oxide cannot act as a bleaching agent."
},
{
"n": 115,
"q": "Which table in an operating system contains information about all the open files?",
"o": [
"open-file table",
"open-seek table",
"open table",
"open-location table"
],
"ans": 0,
"e": "The open-file table stores information about all files currently open in the operating system."
},
{
"n": 116,
"q": "The aim of the Antyodaya Programme is",
"o": [
"Uplifting minorities",
"Eliminating urban",
"Improving the standards of scheduled castes",
"Helping the poorest among the poor"
],
"ans": 3,
"e": "The Antyodaya programme aims at helping the poorest among the poor (poorest BPL families)."
},
{
"n": 117,
"q": "Which of the following states has recently launched the Annapurna Rasoi Yojna for providing quality meals to weaker sections at subsidised rates?",
"o": [
"Uttar Pradesh",
"West Bengal",
"Madhya Pradesh",
"Rajasthan"
],
"ans": 3,
"e": "Rajasthan launched the Annapurna Rasoi Scheme in 2016 to provide quality food at subsidised rates."
},
{
"n": 118,
"q": "For Commercial Banks lending the 'Priority Sector' denotes:",
"o": [
"Self employed",
"Small industrialists",
"Agriculture and Small scale industries",
"Small farmers"
],
"ans": 2,
"e": "Priority sector lending denotes agriculture, small-scale industries and weaker sections."
},
{
"n": 119,
"q": "The toxic metal associated with the Minamata episode is:",
"o": [
"cadmium",
"lead",
"mercury",
"arsenic"
],
"ans": 2,
"e": "Minamata disease was caused by mercury (methyl mercury) poisoning from contaminated fish."
},
{
"n": 120,
"q": "The release of which of the following into ponds and wells helps in controlling the mosquitoes?",
"o": [
"Crab",
"Dogfish",
"Snail",
"Gambusia fish"
],
"ans": 3,
"e": "Gambusia fish eat mosquito larvae and are released into ponds/wells to control mosquitoes."
},
{
"n": 121,
"q": "Sun Yat Sen was the leader of:",
"o": [
"Taiping Rebellion",
"Boxer Revolt",
"CPC Party",
"KMT Party"
],
"ans": 3,
"e": "Sun Yat-sen was the leader/founder of the KMT (Kuomintang) party of China."
},
{
"n": 122,
"q": "A biome is:",
"o": [
"A group of plants growing in a particular area",
"A delimited area",
"A complex of communities characterized by distinctive climate & vegetation",
"A collection of rate plants & animals"
],
"ans": 2,
"e": "A biome is a complex of communities defined by a distinctive climate and vegetation over a geographic region."
},
{
"n": 123,
"q": "The lens of the eye is behind the:",
"o": [
"Pupil",
"Vitreous human",
"Retina",
"Optic nerve"
],
"ans": 0,
"e": "The lens lies just behind the pupil (and iris), focusing light onto the retina at the back of the eye."
},
{
"n": 124,
"q": "Which of the following income will not be included in national income calculation?",
"o": [
"Income of a joker in a circus company",
"Income of a commercial artist",
"Commission income of a share broker",
"Individual's income from sale of shares"
],
"ans": 3,
"e": "Income from sale of financial assets like shares is a transfer, not a productive service, so it is excluded from national income."
},
{
"n": 125,
"q": "Which one of the following states is known as 'Garden of Spices'?",
"o": [
"Kerala",
"Karnataka",
"Gujarat",
"Tamil Nadu"
],
"ans": 0,
"e": "Kerala, rich in pepper, cardamom, clove and other spices, is known as the Garden of Spices."
},
{
"n": 126,
"q": "Pillared halls where the Buddhist monks worshipped were known as:",
"o": [
"Chaityas",
"Mathas",
"Viharas",
"Stupas"
],
"ans": 0,
"e": "Chaityas were the Buddhist pillared prayer halls (shrines with a stupa) for worship."
},
{
"n": 127,
"q": "Which of the following is a semiconductor?",
"o": [
"silver",
"copper",
"glass",
"silicon"
],
"ans": 3,
"e": "Silicon is a semiconductor, with conductivity between that of a conductor and an insulator."
},
{
"n": 128,
"q": "Milkiness observed on passing carbon dioxide through lime water is due to the formation of:",
"o": [
"Calcium carbonate",
"Calcium chloride",
"Calcium hydroxide",
"Calcium bicarbonate"
],
"ans": 0,
"e": "CO2 reacts with lime water (Ca(OH)2) to form a white precipitate of calcium carbonate (CaCO3)."
},
{
"n": 129,
"q": "Elasticity of demand of luxury goods is:",
"o": [
"Less than one",
"Infinite",
"Zero",
"More than one"
],
"ans": 3,
"e": "Luxury goods have elastic demand, i.e. elasticity greater than one."
},
{
"n": 130,
"q": "A system program designed to aid the programmer in finding and correcting errors or bugs is known as:",
"o": [
"Debugger",
"Evaluator",
"Corrector",
"Quarantiner"
],
"ans": 0,
"e": "A debugger is the system program used to find and correct errors/bugs in other programs."
},
{
"n": 131,
"q": "Both the Tropic of Cancer and the Tropic of Capricorn pass through:",
"o": [
"South America",
"Asia",
"Africa",
"Australia"
],
"ans": 2,
"e": "Africa is crossed by both the Tropic of Cancer (north) and the Tropic of Capricorn (south)."
},
{
"n": 132,
"q": "Who among the following built the Golden Temple at Amritsar?",
"o": [
"Guru Gobind Singh",
"Guru Teg Bahadur",
"Guru Nanak",
"Guru Arjun Dev"
],
"ans": 3,
"e": "The fifth Sikh Guru, Guru Arjun Dev, built the Golden Temple (Harmandir Sahib), completed in 1604."
},
{
"n": 133,
"q": "Who has been elected as the new Secretary General of the United Nations?",
"o": [
"Antonio Guterras",
"Ban Ki-moon",
"Lewis Hamilton",
"Juan Manuel Santos"
],
"ans": 0,
"e": "Antonio Guterres became UN Secretary-General on 1 January 2017."
},
{
"n": 134,
"q": "After a shower of rain, a rainbow is seen:",
"o": [
"anywhere, irrespective of the position of the sun",
"even in the absence of the sun",
"towards the sun",
"opposite the sun"
],
"ans": 3,
"e": "A rainbow appears in the direction opposite to the sun, with the observer's back to the sun."
},
{
"n": 135,
"q": "Who decides about the size and membership of the Council of ministers?",
"o": [
"Lok Sabha",
"Chairman of the Rajya Sabha",
"Prime Minister",
"President"
],
"ans": 2,
"e": "The Prime Minister decides the size and membership of the Council of Ministers (formally approved by the President)."
},
{
"n": 136,
"q": "Varun Singh Bhati who won bronze at 2016 Rio Paralympics Games is associated with which sports?",
"o": [
"Badminton",
"Short Put",
"High Jump",
"Javelin Throw"
],
"ans": 2,
"e": "Varun Singh Bhati won bronze in the Men's High Jump T-42 at the 2016 Rio Paralympics."
},
{
"n": 137,
"q": "The maximum number of Mongol invasions took place during the reign of:",
"o": [
"Muhammad bin Tughlaq",
"Balban",
"Firoz Tughlaq",
"Alauddin Khilji"
],
"ans": 3,
"e": "The maximum Mongol invasions occurred during the reign of Alauddin Khilji (1296-1316)."
},
{
"n": 138,
"q": "Microsoft Excel is a",
"o": [
"Graphics Package",
"MS Office Package",
"Electronic Spreadsheet",
"Financial Planning Package"
],
"ans": 2,
"e": "Microsoft Excel is an electronic spreadsheet program, part of the MS Office suite."
},
{
"n": 139,
"q": "In the Panchayat Raj System, \"the Panchayat Samiti\" is constituted at the:",
"o": [
"State level",
"District level",
"Block level",
"Village level"
],
"ans": 2,
"e": "The Panchayat Samiti (Block Panchayat) is constituted at the block level."
},
{
"n": 140,
"q": "Participation is an important element of every:",
"o": [
"Aristocratic system",
"Oligarchical system",
"Democratic system",
"Monarchial system"
],
"ans": 2,
"e": "Participation is a fundamental element of a democratic system."
},
{
"n": 141,
"q": "The Kailasanatha Temple (Siva Temple) at Kanchipuram containing sculptures with paintings in the inner wall, was built by?",
"o": [
"Narasimhavarnam",
"Ravivarman",
"Mahendravarman",
"Devavarman"
],
"ans": 0,
"e": "The Kailasanatha Temple at Kanchipuram was built by Narasimhavarman (Rajasimha) around 700 CE."
},
{
"n": 142,
"q": "Element that is not found in blood is:",
"o": [
"chromium",
"copper",
"magnesium",
"iron"
],
"ans": 0,
"e": "Chromium is a trace element stored in tissues/organs, not present in blood."
},
{
"n": 143,
"q": "Govind Ballabh Pant Sagar reservoir is situated in:",
"o": [
"Jharkhand",
"Uttar Pradesh",
"Chhattisgarh",
"Uttarakhand"
],
"ans": 1,
"e": "Govind Ballabh Pant Sagar (Rihand Dam) reservoir is situated in Sonbhadra district, Uttar Pradesh."
},
{
"n": 144,
"q": "The teeth lacking in Herbivorous animal is:",
"o": [
"Molar",
"Canine",
"Incissor",
"Premolar"
],
"ans": 1,
"e": "Herbivores lack canines, which are used by carnivores/omnivores for tearing meat."
},
{
"n": 145,
"q": "Of the following, which one is non-contractual earning?",
"o": [
"Profit",
"Interest",
"Rent",
"Wage"
],
"ans": 2,
"e": "Rent is the non-contractual earning here."
},
{
"n": 146,
"q": "Which one of the following gases released from bio-gas plant is used as a fuel gas?",
"o": [
"Ethane",
"Butane",
"Propane",
"Methane"
],
"ans": 3,
"e": "Methane is the major combustible gas released from a bio-gas plant and used as fuel."
},
{
"n": 147,
"q": "The title of 'Gangai Kondan' was adopted by the following Chola King:",
"o": [
"Vijayalaya",
"Karikala",
"Rajaraja I",
"Rajendra I"
],
"ans": 3,
"e": "Rajendra I adopted the title 'Gangai Kondan' ('Conqueror of the Ganges')."
},
{
"n": 148,
"q": "Volt Ã— Second/Coulomb is the unit of",
"o": [
"Inductance",
"Resistance",
"Capacitance",
"Energy"
],
"ans": 1,
"e": "Volt Ã— Second/Coulomb = Volt/Ampere = Ohm, the unit of resistance."
},
{
"n": 149,
"q": "Excretory organ of cockroach is:",
"o": [
"Nephridia",
"Malpighian tubules",
"Kidney",
"Malpighian Corpuscles"
],
"ans": 1,
"e": "The excretory organs of a cockroach are the Malpighian tubules."
},
{
"n": 150,
"q": "The number of players in a Futsal team is",
"o": [
"8",
"6",
"5",
"9"
],
"ans": 2,
"e": "A futsal team has five players on the field, including the goalkeeper."
}
];

async function buildQuestions() {
  const all = RAW.slice().sort((a, b) => a.n - b.n);

  if (all.length !== 150) throw new Error(`Expected 150 questions, got ${all.length}`);
  all.forEach((q, i) => { if (q.n !== i + 1) throw new Error(`Question numbering gap at index ${i}: n=${q.n}`); });

  const questions = [];
  for (const r of all) {
    if (!Array.isArray(r.o) || r.o.length !== 4) throw new Error(`Q${r.n} does not have 4 options`);
    if (typeof r.ans !== 'number' || r.ans < 0 || r.ans > 3) throw new Error(`Q${r.n} bad ans ${r.ans}`);
    let questionImage = '';
    if (IMAGE_MAP[r.n]) {
      process.stdout.write(`Uploading Q${r.n} image... `);
      questionImage = await uploadIfExists(IMAGE_MAP[r.n]);
      console.log(questionImage ? 'ok' : 'missing');
    }
    questions.push({
      questionText: r.q,
      questionImage,
      options: r.o,
      optionImages: ['', '', '', ''],
      correctAnswerIndex: r.ans,
      explanation: r.e || '',
      section: sectionFor(r.n),
      tags: ['SSC', 'MTS', 'Paper-I', 'PYQ', '2016'],
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
  } else console.log(`Found ExamCategory: Central (${category._id})`);

  let exam = await Exam.findOne({ code: 'SSC-MTS' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id, name: 'SSC MTS', code: 'SSC-MTS',
      description: 'Staff Selection Commission - Multi Tasking (Non-Technical) Staff', isActive: true
    });
    console.log(`Created Exam: SSC MTS (${exam._id})`);
  } else console.log(`Found Exam: SSC MTS (${exam._id})`);

  const PATTERN_TITLE = 'SSC MTS (2016 Pattern)';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 150, totalMarks: 150, negativeMarking: 0.25,
      sections: [
        { name: ENG, totalQuestions: 50, marksPerQuestion: 1, negativePerQuestion: 0.25 },
        { name: REA, totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25 },
        { name: NUM, totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25 },
        { name: GA,  totalQuestions: 50, marksPerQuestion: 1, negativePerQuestion: 0.25 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);

  const TEST_TITLE = 'SSC MTS (2016 Pattern) - 2016 Shift-1';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading figure images to Cloudinary)...');
  const questions = await buildQuestions();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 150, duration: 150,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2016, pyqShift: 'Shift-1', pyqExamName: 'SSC MTS', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
