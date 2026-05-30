/**
 * Seed: SSC MTS 2016 Paper-I PYQ - Shift-2 (150 questions)
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
 * Run: node scripts/seed-pyq-ssc-mts-2016-s2.js
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
const IMAGES_DIR = "D:/Sazid/AajExam/Exams PYQ's/SSC MTS/2016/shift-2/images";
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-mts-2016-s2';

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
const IMAGE_MAP = { 55:'q-55.png', 61:'q-61.png', 67:'q-67.png', 68:'q-68.png', 71:'q-71.png', 73:'q-73.png' };

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
    public_id: '2016-s2-' + filename.replace(/\.png$/i, ''),
    overwrite: true, resource_type: 'image'
  });
  return res.secure_url;
}

const RAW = [
{
"n": 1,
"q": "Read the passage:\nExpedition mountaineering could be viewed as slow and heavy, where climbers may use porters, pack animals, glacier airplanes, cooks, multiple carries between camps, usage of fixed lines, etc. Expedition mountaineers still employ the skill sets of the alpine mountaineer, except they have to deal with even higher altitudes, expanded time scale, longer routes, foreign logistics, more severe weather, and additional skills unique to expeditionary climbing. The prevalence of expedition-style climbing in the Himalaya is largely a function of the nature of the mountains in the region. Because Himalaya base camps can take days or weeks to trek to, and Himalayan mountains can take weeks or perhaps even months to climb, a large number of personnel and amount of supplies are necessary. This is why expedition-style climbing is frequently used on large and isolated peaks in the Himalaya. In Europe and North America there is less of a need for expedition-style climbing on most medium-sized mountains. These mountains can often be easily accessed by car or air, are at a lower altitude and can be climbed in a shorter time scale.\n\nWhich of the following is true?",
"o": [
"Expeditionary climbing is popular in the Americas.",
"Most medium-sized peaks in Europe are accessed by car or air.",
"Himalayan base camp treks can be completed in a day or two.",
"European and North American mountains require expanded time scale for climbing."
],
"ans": 1,
"e": "The passage states medium-sized mountains in Europe/North America can be easily accessed by car or air; so option 2 is the true statement."
},
{
"n": 2,
"q": "Read the passage:\nExpedition mountaineering could be viewed as slow and heavy, where climbers may use porters, pack animals, glacier airplanes, cooks, multiple carries between camps, usage of fixed lines, etc. Expedition mountaineers still employ the skill sets of the alpine mountaineer, except they have to deal with even higher altitudes, expanded time scale, longer routes, foreign logistics, more severe weather, and additional skills unique to expeditionary climbing. The prevalence of expedition-style climbing in the Himalaya is largely a function of the nature of the mountains in the region. Because Himalaya base camps can take days or weeks to trek to, and Himalayan mountains can take weeks or perhaps even months to climb, a large number of personnel and amount of supplies are necessary. This is why expedition-style climbing is frequently used on large and isolated peaks in the Himalaya. In Europe and North America there is less of a need for expedition-style climbing on most medium-sized mountains. These mountains can often be easily accessed by car or air, are at a lower altitude and can be climbed in a shorter time scale.\n\nWhat necessitates the huge amount of supplies and large number of personnel in Himalayan expeditions?",
"o": [
"foreign logistics",
"low altitudes",
"expanded time scale",
"severe weather condition"
],
"ans": 2,
"e": "Himalaya base camps take weeks or months to climb; the expanded time scale necessitates large personnel and supplies."
},
{
"n": 3,
"q": "Read the passage:\nExpedition mountaineering could be viewed as slow and heavy, where climbers may use porters, pack animals, glacier airplanes, cooks, multiple carries between camps, usage of fixed lines, etc. Expedition mountaineers still employ the skill sets of the alpine mountaineer, except they have to deal with even higher altitudes, expanded time scale, longer routes, foreign logistics, more severe weather, and additional skills unique to expeditionary climbing. The prevalence of expedition-style climbing in the Himalaya is largely a function of the nature of the mountains in the region. Because Himalaya base camps can take days or weeks to trek to, and Himalayan mountains can take weeks or perhaps even months to climb, a large number of personnel and amount of supplies are necessary. This is why expedition-style climbing is frequently used on large and isolated peaks in the Himalaya. In Europe and North America there is less of a need for expedition-style climbing on most medium-sized mountains. These mountains can often be easily accessed by car or air, are at a lower altitude and can be climbed in a shorter time scale.\n\nWhich of the following style of mountaineering is considered to be slow and heavy?",
"o": [
"sports mountaineering",
"expedition mountaineering",
"alpine mountaineering",
"Himalayan mountaineering"
],
"ans": 1,
"e": "The first line states 'Expedition mountaineering could be viewed as slow and heavy'."
},
{
"n": 4,
"q": "Read the passage:\nExpedition mountaineering could be viewed as slow and heavy, where climbers may use porters, pack animals, glacier airplanes, cooks, multiple carries between camps, usage of fixed lines, etc. Expedition mountaineers still employ the skill sets of the alpine mountaineer, except they have to deal with even higher altitudes, expanded time scale, longer routes, foreign logistics, more severe weather, and additional skills unique to expeditionary climbing. The prevalence of expedition-style climbing in the Himalaya is largely a function of the nature of the mountains in the region. Because Himalaya base camps can take days or weeks to trek to, and Himalayan mountains can take weeks or perhaps even months to climb, a large number of personnel and amount of supplies are necessary. This is why expedition-style climbing is frequently used on large and isolated peaks in the Himalaya. In Europe and North America there is less of a need for expedition-style climbing on most medium-sized mountains. These mountains can often be easily accessed by car or air, are at a lower altitude and can be climbed in a shorter time scale.\n\nWhat accounts for the greater prevalence of expedition mountaineering in the Himalayas?",
"o": [
"glacier airplanes",
"the severe weather condition",
"the specific nature of mountains",
"multiple carries between camps"
],
"ans": 2,
"e": "The prevalence is 'largely a function of the nature of the mountains in the region'."
},
{
"n": 5,
"q": "Read the passage:\nExpedition mountaineering could be viewed as slow and heavy, where climbers may use porters, pack animals, glacier airplanes, cooks, multiple carries between camps, usage of fixed lines, etc. Expedition mountaineers still employ the skill sets of the alpine mountaineer, except they have to deal with even higher altitudes, expanded time scale, longer routes, foreign logistics, more severe weather, and additional skills unique to expeditionary climbing. The prevalence of expedition-style climbing in the Himalaya is largely a function of the nature of the mountains in the region. Because Himalaya base camps can take days or weeks to trek to, and Himalayan mountains can take weeks or perhaps even months to climb, a large number of personnel and amount of supplies are necessary. This is why expedition-style climbing is frequently used on large and isolated peaks in the Himalaya. In Europe and North America there is less of a need for expedition-style climbing on most medium-sized mountains. These mountains can often be easily accessed by car or air, are at a lower altitude and can be climbed in a shorter time scale.\n\nWhich of the following is best undertaken as expedition mountaineering?",
"o": [
"medium-sized mountains",
"short time scale mountaineering",
"peaks in Europe and North America",
"large and isolated peaks"
],
"ans": 3,
"e": "Expedition-style climbing is frequently used on large and isolated peaks in the Himalaya."
},
{
"n": 6,
"q": "Choose the alternative which best expresses the meaning of the underlined Idiom/Phrase.\nJohn was as good as his word and came on time for the meeting.",
"o": [
"convincing",
"punctual",
"able to fulfil his promise",
"a promising young man"
],
"ans": 2,
"e": "The idiom 'as good as his word' means to do everything one promises; hence 'able to fulfil his promise'."
},
{
"n": 7,
"q": "Choose the alternative which best expresses the meaning of the underlined Idiom/Phrase.\nHe came to work looking very off colour.",
"o": [
"tired",
"unhappy",
"worried",
"ill"
],
"ans": 3,
"e": "The idiom 'off colour' means slightly unwell, i.e., ill."
},
{
"n": 8,
"q": "Choose the alternative which best expresses the meaning of the underlined Idiom/Phrase.\nI was asked to take a hike for a comment I made.",
"o": [
"be quiet",
"think",
"leave",
"take a break"
],
"ans": 2,
"e": "The idiom 'take a hike' is a rude way of telling someone to leave."
},
{
"n": 9,
"q": "Choose the most appropriate alternative to fill the blank.\nAs soon as this workshop is over, I am going to ____ every duty and go on a holiday.",
"o": [
"sidetrack",
"abandon",
"overthrow",
"close down"
],
"ans": 1,
"e": "'Abandon' means to give up completely, which fits the context."
},
{
"n": 10,
"q": "Choose the most appropriate alternative to fill the blank.\nShe ____ great pleasure and satisfaction from cooking.",
"o": [
"wants",
"has",
"draws",
"derives"
],
"ans": 3,
"e": "'Derives' means to obtain/receive, which correctly fits 'derives great pleasure'."
},
{
"n": 11,
"q": "Choose the most appropriate alternative to fill the blank.\nPoetry is a ____ form of expression in which the particularity of the word and the image to evoke feeling, assumes great importance.",
"o": [
"suppressed",
"patronized",
"compressed",
"digressed"
],
"ans": 2,
"e": "'Compressed' means squeezed together; poetry packs much meaning into few words."
},
{
"n": 12,
"q": "Choose the most appropriate alternative to fill the blank.\nHe was so filled with contempt for the prisoner that he gave him a ____ look.",
"o": [
"humiliated",
"derisive",
"pitying",
"hurtful"
],
"ans": 1,
"e": "'Derisive' expresses contemptuous ridicule or scorn, matching his contempt."
},
{
"n": 13,
"q": "Choose the most appropriate alternative to fill the blank.\nNext summer we're going ____ a trip to Canada.",
"o": [
"to",
"for",
"on",
"over"
],
"ans": 2,
"e": "The phrase 'go on a trip' is the correct collocation."
},
{
"n": 14,
"q": "Choose the most appropriate alternative to fill the blank.\nRomeo and Juliet's ____ affair is probably the most loved of all times.",
"o": [
"secret",
"covert",
"candid",
"clandestine"
],
"ans": 3,
"e": "'Clandestine' means planned or done in secret, fitting their hidden affair."
},
{
"n": 15,
"q": "Choose the most appropriate alternative to fill the blank.\nThe ____ towards the school was very steep.",
"o": [
"ascend",
"ascent",
"assent",
"accent"
],
"ans": 1,
"e": "'Ascent' (noun) means the act of rising upward; 'ascend' is a verb, 'assent' means acceptance."
},
{
"n": 16,
"q": "Choose the most appropriate alternative to fill the blank.\nSome interesting matters ____ in our discussion yesterday.",
"o": [
"came up",
"got up",
"came in",
"came about"
],
"ans": 0,
"e": "The phrasal verb 'come up' means to occur or arise."
},
{
"n": 17,
"q": "Choose the most appropriate alternative to fill the blank.\nHe loaded the ____ of cotton on the truck.",
"o": [
"baskets",
"bales",
"bunches",
"bundles"
],
"ans": 1,
"e": "A 'bale' is a large bundle, the correct measure word for cotton."
},
{
"n": 18,
"q": "Choose the most appropriate alternative to fill the blank.\nAnything is ____ which is not against the nature of things.",
"o": [
"practicable",
"parable",
"probable",
"possible"
],
"ans": 0,
"e": "'Practicable' means able to be done or put into practice successfully."
},
{
"n": 19,
"q": "Choose the alternative which best improves the underlined part, or 'No improvement'.\nThere are schools in either sides of the road.",
"o": [
"school on either side",
"no improvement",
"school on either side",
"schools on either side"
],
"ans": 3,
"e": "'Either' takes a singular noun for 'side', giving 'schools on either side of the road'."
},
{
"n": 20,
"q": "Choose the alternative which best improves the underlined part, or 'No improvement'.\nMany years have passed since India became free.",
"o": [
"no improvement",
"has became free",
"had became free",
"become free"
],
"ans": 0,
"e": "The simple past 'became' is correct for a completed past event; no improvement needed."
},
{
"n": 21,
"q": "Choose the alternative which best improves the underlined part, or 'No improvement'.\nWe acted your instructions.",
"o": [
"acted over your",
"acted upon your",
"no improvement",
"acted your very"
],
"ans": 1,
"e": "'Act upon' means to take action as a result of instructions."
},
{
"n": 22,
"q": "Choose the alternative which best improves the underlined part, or 'No improvement'.\nAs soon as I called her, she came out of her house.",
"o": [
"is coming out",
"no improvement",
"come out",
"has come out"
],
"ans": 1,
"e": "The sentence is correct; no improvement required."
},
{
"n": 23,
"q": "Choose the alternative which best improves the underlined part, or 'No improvement'.\nCoding is nothing but putting up information in a given format.",
"o": [
"filling up",
"no improvement",
"organizing",
"putting in"
],
"ans": 0,
"e": "'Filling up' (completing a form/format) fits the context better than 'putting up'."
},
{
"n": 24,
"q": "Find the part with an error, or 'No error'.\nCould you please maintain silence for a while?",
"o": [
"please maintain silence",
"for a while?",
"Could you",
"No error"
],
"ans": 3,
"e": "The sentence is grammatically correct; No error."
},
{
"n": 25,
"q": "Find the part with an error, or 'No error'.\nShe hopes to become an engineer after she will complete her education.",
"o": [
"an engineer after she",
"will complete her education.",
"She hopes to become",
"No error"
],
"ans": 1,
"e": "In a conditional/time clause, 'will' is removed: 'after she completes her education'."
},
{
"n": 26,
"q": "Find the part with an error, or 'No error'.\nKindly please direct the tourists to the museum.",
"o": [
"kindly please",
"direct the tourists",
"to the museum",
"no error"
],
"ans": 0,
"e": "'Kindly please' is redundant; one of them must be removed."
},
{
"n": 27,
"q": "Find the part with an error, or 'No error'.\nIf you stand with me in hour of need, I will never forget you.",
"o": [
"no error",
"I will never forget you.",
"If you stand",
"with me in hour of need"
],
"ans": 3,
"e": "Correct collocation is 'stand by me', so 'with me in hour of need' has the error."
},
{
"n": 28,
"q": "Find the part with an error, or 'No error'.\nAt last, he married with a poor girl.",
"o": [
"at last",
"he married",
"no error",
"with a poor girl."
],
"ans": 3,
"e": "The verb 'married' takes 'to', not 'with'; error in 'with a poor girl'."
},
{
"n": 29,
"q": "Find the part with an error, or 'No error'.\nOur team played a football match.",
"o": [
"played",
"our team",
"a football match.",
"no error"
],
"ans": 3,
"e": "The sentence is grammatically correct; No error."
},
{
"n": 30,
"q": "Find the part with an error, or 'No error'.\nIt is better to stay at home than go to market when it is raining.",
"o": [
"when it is raining.",
"no error",
"It is better to stay at home",
"than go to market"
],
"ans": 3,
"e": "The definite article 'the' is needed: 'go to the market'; error in 'than go to market'."
},
{
"n": 31,
"q": "Find the part with an error, or 'No error'.\nAll the girls students are advised to attend the meeting positively.",
"o": [
"attend the meeting positively.",
"no error",
"all the girls students",
"are advised to"
],
"ans": 2,
"e": "It should be 'girl students' (students who are girls), so 'all the girls students' has the error."
},
{
"n": 32,
"q": "Find the part with an error, or 'No error'.\nThe thief had hardly put the cash in his pocket then the owner woke up.",
"o": [
"no error",
"the thief had hardly",
"then the owner woke up.",
"put the cash in his pocket."
],
"ans": 2,
"e": "'Hardly' is followed by 'when', not 'then'; error in 'then the owner woke up'."
},
{
"n": 33,
"q": "Find the part with an error, or 'No error'.\nBengal tigers are now almost extincted.",
"o": [
"Bengal tigers",
"are now",
"almost extincted.",
"No error"
],
"ans": 2,
"e": "The adjective is 'extinct', not 'extincted'; error in 'almost extincted'."
},
{
"n": 34,
"q": "Choose the word opposite in meaning to the given word.\nscatter",
"o": [
"store",
"pile",
"hoard",
"collect"
],
"ans": 3,
"e": "'Scatter' means to throw in random directions; its antonym is 'collect'."
},
{
"n": 35,
"q": "Choose the word opposite in meaning to the given word.\npeak",
"o": [
"inferior",
"deep",
"mount",
"bottom"
],
"ans": 3,
"e": "'Peak' means the highest level; its opposite is 'bottom'."
},
{
"n": 36,
"q": "Choose the word opposite in meaning to the given word.\ndespair",
"o": [
"hope",
"sorrow",
"repair",
"empty"
],
"ans": 0,
"e": "'Despair' means the complete loss of hope; its antonym is 'hope'."
},
{
"n": 37,
"q": "Choose the word nearest in meaning to the given word.\nExactly",
"o": [
"different",
"Precisely",
"Similar",
"Same"
],
"ans": 1,
"e": "'Exactly' means accurately or precisely; the synonym is 'precisely'."
},
{
"n": 38,
"q": "Choose the word nearest in meaning to the given word.\nAnswer",
"o": [
"Response",
"Speak",
"Question",
"React"
],
"ans": 0,
"e": "'Answer' means a response; the synonym is 'response'."
},
{
"n": 39,
"q": "Choose the word nearest in meaning to the given word.\nPain",
"o": [
"Comfort",
"Vibration",
"Ache",
"Throb"
],
"ans": 2,
"e": "'Pain' is an unpleasant sensation; the synonym is 'ache'."
},
{
"n": 40,
"q": "Choose the word/phrase that can most appropriately substitute the given expression.\nThe centre of attraction.",
"o": [
"cynosure",
"focus",
"custodian",
"point"
],
"ans": 0,
"e": "'Cynosure' refers to the centre of attraction."
},
{
"n": 41,
"q": "Choose the word/phrase that can most appropriately substitute the given expression.\nThe murder of one's father.",
"o": [
"patricide",
"homicide",
"fratricide",
"regicide"
],
"ans": 0,
"e": "'Patricide' is the act of killing one's own father."
},
{
"n": 42,
"q": "Choose the word/phrase that can most appropriately substitute the given expression.\nOverturn in water.",
"o": [
"drown",
"swim",
"wreck",
"capsize"
],
"ans": 3,
"e": "'Capsize' means to be overturned/rolled on its side in water."
},
{
"n": 43,
"q": "Choose the word/phrase that can most appropriately substitute the given expression.\nOne whose wife is dead.",
"o": [
"widower",
"spinster",
"bachelor",
"widow"
],
"ans": 0,
"e": "A 'widower' is a man whose wife has died."
},
{
"n": 44,
"q": "Choose the word/phrase that can most appropriately substitute the given expression.\nThat cannot be explained.",
"o": [
"intolerable",
"inexplicit",
"irrevocable",
"inexplicable"
],
"ans": 3,
"e": "'Inexplicable' means that cannot be explained."
},
{
"n": 45,
"q": "Find the correctly spelt word.",
"o": [
"hiar",
"hier",
"heir",
"heirr"
],
"ans": 2,
"e": "The correctly spelt word is 'heir'."
},
{
"n": 46,
"q": "Find the correctly spelt word.",
"o": [
"milenium",
"millennium",
"milennium",
"millenium"
],
"ans": 1,
"e": "The correctly spelt word is 'millennium'."
},
{
"n": 47,
"q": "Find the correctly spelt word.",
"o": [
"hygene",
"higene",
"hygiene",
"higiene"
],
"ans": 2,
"e": "The correctly spelt word is 'hygiene'."
},
{
"n": 48,
"q": "Find the correctly spelt word.",
"o": [
"government",
"goverment",
"guvernment",
"goverrment"
],
"ans": 0,
"e": "The correctly spelt word is 'government' (explanation body explicitly states 'government')."
},
{
"n": 49,
"q": "Find the correctly spelt word.",
"o": [
"skeem",
"scheme",
"skeme",
"sceme"
],
"ans": 1,
"e": "The correctly spelt word is 'scheme'."
},
{
"n": 50,
"q": "Find the correctly spelt word.",
"o": [
"sillabus",
"cyllabus",
"syllabus",
"sylabus"
],
"ans": 2,
"e": "The correctly spelt word is 'syllabus'."
},
{
"n": 51,
"q": "Find the odd letters from the given alternatives.",
"o": [
"HIVW",
"FGKL",
"ACDF",
"TUOP"
],
"ans": 2,
"e": "In HIVW, FGKL and TUOP each is made of two pairs of consecutive letters. ACDF does not follow this (gaps A-C and D-F), so it is odd."
},
{
"n": 52,
"q": "Find the odd word from the given alternatives.",
"o": [
"Cricket",
"Chess",
"Football",
"Hockey"
],
"ans": 1,
"e": "Cricket, Football and Hockey are outdoor field games, whereas Chess is an indoor board game."
},
{
"n": 53,
"q": "Find the odd number from the given alternatives.",
"o": [
"23",
"17",
"13",
"63"
],
"ans": 3,
"e": "23, 17 and 13 are prime numbers, but 63 (= 7 × 9) is not prime."
},
{
"n": 54,
"q": "Some equations are solved on the basis of a certain system. Find the correct answer for the unsolved equation.\n\nIf 12 × 9 = 810 and 15 × 9 = 513, then 13 × 8 = ?",
"o": [
"104",
"410",
"411",
"401"
],
"ans": 1,
"e": "Multiply the two numbers, then shift the last digit to the front: 12×9=108→810, 15×9=135→513, so 13×8=104→410."
},
{
"n": 55,
"q": "A piece of paper is folded and cut as shown in the question figures. From the given answer figures, indicate how it will appear when opened.",
"o": [
"Option (1)",
"Option (2)",
"Option (3)",
"Option (4)"
],
"ans": 1,
"e": "Unfolding the symmetrically cut paper gives the pattern shown in option (2)."
},
{
"n": 56,
"q": "If 'LONDON' is coded as MPOEPO, what code is needed for 'DELHI'?",
"o": [
"DEHLI",
"HLDEI",
"EFIMJ",
"EFMIJ"
],
"ans": 3,
"e": "Each letter is moved one step forward (+1): L→M, O→P, N→O, D→E, O→P, N→O. So DELHI → EFMIJ."
},
{
"n": 57,
"q": "The total age of a mother and her daughter is 60 years. The difference between their ages is 30 years. Find the age of the mother.",
"o": [
"40 years",
"55 years",
"45 years",
"50 years"
],
"ans": 2,
"e": "Mother = (sum + difference)/2 = (60 + 30)/2 = 45 years."
},
{
"n": 58,
"q": "A series is given with one term missing. Choose the alternative that will complete the series.\n\n5, 7, 11, 17, 25, ?",
"o": [
"35",
"32",
"34",
"33"
],
"ans": 0,
"e": "The differences are 2, 4, 6, 8, 10. So 25 + 10 = 35."
},
{
"n": 59,
"q": "Choose the alternative that will complete the series.\n\nBKS, DJT, FIU, HHV, ?",
"o": [
"IGU",
"IGX",
"JGW",
"IJX"
],
"ans": 2,
"e": "First letters +2 (B,D,F,H,J), second letters −1 (K,J,I,H,G), third letters +1 (S,T,U,V,W). Next term = JGW."
},
{
"n": 60,
"q": "Consider the statements to be true and decide which conclusion follows.\n\nStatements:\nI. All Players are Singers.\nII. All Dancers are Singers.\nConclusions:\nI. Some Singers are Dancers.\nII. Some Dancers are Players.",
"o": [
"Only conclusion II follows.",
"Both conclusions I and II follow.",
"Only conclusion I follows.",
"Neither conclusion I nor II follows."
],
"ans": 2,
"e": "Since all Dancers are Singers, 'Some Singers are Dancers' follows (Conclusion I). No link is established between Dancers and Players, so II does not follow."
},
{
"n": 61,
"q": "If a mirror is placed on the line MN, then which of the answer figures is the right image of the given figure?",
"o": [
"Option (1)",
"Option (2)",
"Option (3)",
"Option (4)"
],
"ans": 3,
"e": "In a mirror image left and right are interchanged; this gives option (4)."
},
{
"n": 62,
"q": "Find the missing number from the given responses.\n\n  7    3   10\n  3    4    7\n  2    7    ?\n 42   84  140",
"o": [
"2",
"17",
"9",
"34"
],
"ans": 0,
"e": "In each column, the product of the first three numbers equals the fourth: 7×3×2=42, 3×4×7=84, so 10×7×?=140 → ?=2."
},
{
"n": 63,
"q": "Select the related letters from the given alternatives.\n\nRATE : EATR :: SEAT : ?",
"o": [
"TSEA",
"TESA",
"TEAS",
"TSAE"
],
"ans": 2,
"e": "The first and last letters are interchanged: RATE → EATR. Similarly SEAT → TEAS."
},
{
"n": 64,
"q": "Select the related pair from the given alternatives.\n\nBook : Literature :: ? : ?",
"o": [
"Man : Beast",
"Dancer : Musician",
"Song : Music",
"Species : Science"
],
"ans": 2,
"e": "A book is a form of literature; similarly a song is a form of music."
},
{
"n": 65,
"q": "Select the related number from the given alternatives.\n\n21 : 3 :: 574 : ?",
"o": [
"97",
"23",
"82",
"113"
],
"ans": 2,
"e": "The relationship is division by 7: 21 ÷ 7 = 3, so 574 ÷ 7 = 82."
},
{
"n": 66,
"q": "Select the related word from the given alternatives.\n\nGiant : Dwarf :: Genius : ?",
"o": [
"Tiny",
"Gentle",
"Idiot",
"Wicked"
],
"ans": 2,
"e": "Giant and Dwarf are antonyms; the antonym of Genius is Idiot."
},
{
"n": 67,
"q": "Choose the correct Venn diagram which best illustrates the relationship among: Hockey, Cricket, Games.",
"o": [
"Option (1)",
"Option (2)",
"Option (3)",
"Option (4)"
],
"ans": 1,
"e": "Hockey and Cricket are two distinct games, both lying within the larger set 'Games' — two separate circles inside one big circle, as in option (2)."
},
{
"n": 68,
"q": "How many triangles are there in the given figure?",
"o": [
"16",
"18",
"8",
"12"
],
"ans": 1,
"e": "Counting all the small and composite triangles gives a total of 18."
},
{
"n": 69,
"q": "Which one of the given responses would be a meaningful order of the following?\n\n1. Cutting  2. Dish  3. Vegetable  4. Market  5. Cooking",
"o": [
"1, 2, 4, 5, 3",
"5, 3, 2, 1, 4",
"3, 2, 5, 1, 4",
"4, 3, 1, 5, 2"
],
"ans": 3,
"e": "Logical sequence to prepare a dish: Market → Vegetable → Cutting → Cooking → Dish, i.e. 4, 3, 1, 5, 2."
},
{
"n": 70,
"q": "Out of the four words given, choose the word which cannot be formed using the letters of the following word.\n\nTRANSLATION",
"o": [
"Ratio",
"Nation",
"Transmit",
"Transit"
],
"ans": 2,
"e": "TRANSLATION has no letter 'M', so 'Transmit' cannot be formed from its letters."
},
{
"n": 71,
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
"n": 72,
"q": "'Z' started walking straight towards South. He walked a distance of 15 metres and then took a left turn and walked a distance of 30 metres. Then he took a right turn and walked a distance of 15 metres again. Z is facing which direction?",
"o": [
"North",
"West",
"South",
"East"
],
"ans": 2,
"e": "South → left turn faces East → right turn faces South again. Z is finally facing South."
},
{
"n": 73,
"q": "Which answer figure will complete the pattern in the question figure?",
"o": [
"Option (1)",
"Option (2)",
"Option (3)",
"Option (4)"
],
"ans": 1,
"e": "Option (2) correctly completes the missing portion of the pattern."
},
{
"n": 74,
"q": "A word is represented by one set of numbers as given in the alternatives. In Matrix-I the rows/columns are numbered 0–4 and in Matrix-II they are numbered 5–9. A letter is represented first by its row and then by its column. Identify the set for the word PICK.\n\nMatrix-I\n   0 1 2 3 4\n0  A R B C E\n1  T H S E R\n2  R E H D S\n3  S D T O C\n4  E B O R A\n\nMatrix-II\n   5 6 7 8 9\n5  K P I L M\n6  X W Z M G\n7  F I K X P\n8  G N F L W\n9  N P X Z L",
"o": [
"76, 66, 34, 98",
"65, 67, 43, 65",
"56, 76, 34, 55",
"76, 67, 34, 89"
],
"ans": 2,
"e": "P = 56, I = 76, C = 34, K = 55 — giving the set 56, 76, 34, 55."
},
{
"n": 75,
"q": "If P denotes '÷', Q denotes '×', R denotes '+' and S denotes '−', then 18 Q 12 P 4 R 5 S 6 is equal to:",
"o": [
"65",
"36",
"53",
"34"
],
"ans": 2,
"e": "Substituting: 18 × 12 ÷ 4 + 5 − 6 = 54 + 5 − 6 = 53."
},
{
"n": 76,
"q": "If 'a' and 'b' are positive integers such that a² − b² = 19, then the value of 'a' is:",
"o": [
"20",
"19",
"10",
"9"
],
"ans": 2,
"e": "a² − b² = (a−b)(a+b) = 19 (prime), so a−b=1 and a+b=19, giving a=10, b=9."
},
{
"n": 77,
"q": "A fan is listed at Rs 150 with a discount of 20%. What additional discount must be offered to bring the net price to Rs 108?",
"o": [
"15%",
"5%",
"10%",
"20%"
],
"ans": 2,
"e": "After 20% discount: 150 × 0.8 = Rs 120. To reach 108, further discount = (120−108)/120 = 10%."
},
{
"n": 78,
"q": "The radius of a circle is increased by 10%. The percentage increase of its area is:",
"o": [
"21%",
"20%",
"11%",
"10%"
],
"ans": 0,
"e": "Area ∝ r². New area = (1.1)² = 1.21 times, i.e. an increase of 21%."
},
{
"n": 79,
"q": "If the ratio of areas of two circles is 4 : 9, then the ratio of their circumferences will be:",
"o": [
"4 : 9",
"2 : 3",
"3 : 2",
"9 : 4"
],
"ans": 1,
"e": "Areas in ratio 4 : 9 → radii in ratio 2 : 3 → circumferences (∝ r) in ratio 2 : 3."
},
{
"n": 80,
"q": "The average age of 30 students is 20 years and the average age of 20 other students is 30 years. The average age of the total number of students is:",
"o": [
"24 years",
"48 years",
"25 years",
"50 years"
],
"ans": 0,
"e": "Total age = 30×20 + 20×30 = 1200, over 50 students → 1200/50 = 24 years."
},
{
"n": 81,
"q": "A fruit seller buys 100 kg of superior mangoes at Rs 45 per kg and 200 kg of inferior variety at Rs 40 per kg, and sells all the mangoes at Rs 45 per kg. The profit percentage of the fruit seller is:",
"o": [
"22 2/9 %",
"12.5 %",
"8 %",
"25 %"
],
"ans": 2,
"e": "Cost = 100×45 + 200×40 = 12500; revenue = 300×45 = 13500; profit = 1000 → 1000/12500 = 8%."
},
{
"n": 82,
"q": "A certain number of men complete a piece of work in 60 days. If there were 8 men more, the work could be finished in 10 days less. The number of men originally is:",
"o": [
"32",
"40",
"36",
"30"
],
"ans": 1,
"e": "n × 60 = (n+8) × 50 → 60n = 50n + 400 → n = 40 men."
},
{
"n": 83,
"q": "The simple interest on a sum for 5 years is 3/5th of the sum. The rate of interest per annum is:",
"o": [
"12½ %",
"10 %",
"12 %",
"8 %"
],
"ans": 2,
"e": "SI = P×R×5/100 = 3P/5 → R×5/100 = 3/5 → R = 12% per annum."
},
{
"n": 84,
"q": "A shopkeeper sold a TV set for Rs 17940 with a discount of 8% and earned a profit of 19.6%. What would have been the percentage of profit if no discount was offered?",
"o": [
"23.07 %",
"30 %",
"24.05 %",
"24 %"
],
"ans": 1,
"e": "MP × 0.92 = 17940 → MP = 19500. CP = 17940/1.196 = 15000. Without discount, profit = (19500−15000)/15000 = 30%."
},
{
"n": 85,
"q": "At what percent above the cost price must a person mark the price of an article so that he can enjoy 20% profit after allowing a 20% discount?",
"o": [
"60 %",
"30 %",
"50 %",
"40 %"
],
"ans": 2,
"e": "Let CP = 100, required SP = 120. MP × 0.8 = 120 → MP = 150, i.e. marked 50% above cost price."
},
{
"n": 86,
"q": "If a train maintains an average speed of 42 km/hour it arrives on time; if the average speed is 40 km/hour it arrives 15 minutes late. Find the length of the journey.",
"o": [
"210 km",
"205 km",
"209 km",
"200 km"
],
"ans": 0,
"e": "d/40 − d/42 = 1/4 h → d(2)/(1680) = 1/4 → d = 210 km."
},
{
"n": 87,
"q": "A train covers a distance of 12 km in 10 minutes. If it takes 6 seconds to pass a telegraph post, then the length of the train is:",
"o": [
"120 m",
"90 m",
"100 m",
"140 m"
],
"ans": 0,
"e": "Speed = 12 km / (10/60) h = 72 km/h = 20 m/s. Length = 20 × 6 = 120 m."
},
{
"n": 88,
"q": "A sphere has a total surface area 9π cm². Its volume is:",
"o": [
"36π cm³",
"18π cm³",
"(4/3)π cm³",
"(9/2)π cm³"
],
"ans": 3,
"e": "4πr² = 9π → r = 3/2. Volume = (4/3)πr³ = (4/3)π(27/8) = (9/2)π cm³."
},
{
"n": 89,
"q": "The population of a city increases at the rate of 5% per annum. If the present population is 3,70,440, its population 3 years ago was:",
"o": [
"2,80,000",
"3,60,000",
"3,20,000",
"30,000"
],
"ans": 2,
"e": "Population 3 years ago = 370440 / (1.05)³ = 370440 / 1.157625 = 3,20,000."
},
{
"n": 90,
"q": "The least number of five digits exactly divisible by 88 is:",
"o": [
"10088",
"10023",
"10132",
"10032"
],
"ans": 3,
"e": "10000 ÷ 88 = 113.6, so the next multiple is 114 × 88 = 10032."
},
{
"n": 91,
"q": "The bar diagram shows the sales of items (in lakhs) in a departmental store: April = 500, May = 300, June = 800, July = 900, August = 1100. The sales in July is how many times the sales in May?",
"o": [
"300",
"3",
"2.5",
"2"
],
"ans": 1,
"e": "July ÷ May = 900 ÷ 300 = 3 times."
},
{
"n": 92,
"q": "For the same bar diagram (April = 500, May = 300, June = 800, July = 900, August = 1100, in lakhs), the average monthly sale (in lakhs) is:",
"o": [
"600",
"780",
"650",
"720"
],
"ans": 3,
"e": "Average = (500 + 300 + 800 + 900 + 1100)/5 = 3600/5 = 720 lakhs."
},
{
"n": 93,
"q": "A litre of water weighs a kilogram and a litre of another liquid weighs 1.340 kilograms. A mixture of the two weighs 1.270 kilograms per litre. The ratio of their volumes in a litre of the mixture is:",
"o": [
"27 : 34",
"7 : 27",
"17 : 24",
"7 : 17"
],
"ans": 1,
"e": "Let water x, liquid y, x+y=1 and x + 1.34y = 1.27 → 0.34y = 0.27 → y = 27/34, x = 7/34. Water : liquid = 7 : 27."
},
{
"n": 94,
"q": "A merchant buys 20 kg of rice at Rs 14 per kg and another 40 kg at Rs 10 per kg. He mixes them and sells 1/3 of the mixture at Rs 12.50 per kg. At what rate should he sell the remaining mixture so as to earn a profit of 25% on the whole outlay?",
"o": [
"Rs 12",
"Rs 15",
"Rs 12.50",
"Rs 13"
],
"ans": 1,
"e": "Cost = 20×14 + 40×10 = 680; required revenue = 680×1.25 = 850. Sold 20 kg at 12.50 = 250, so remaining 40 kg must fetch 600 → Rs 15 per kg."
},
{
"n": 95,
"q": "A man sells an article at a loss of 10%. If he had sold it for Rs 75 more he would have gained 20%. The cost price of the article (in Rs) is:",
"o": [
"225",
"300",
"250",
"150"
],
"ans": 2,
"e": "The Rs 75 difference equals 30% of CP (from −10% to +20%), so CP = 75/0.30 = Rs 250."
},
{
"n": 96,
"q": "A person spends 25% of his annual income on house rent, 15% on education of children and 45% on other items. If he saves Rs 14,400 annually, then the person's total income is:",
"o": [
"Rs 98,000",
"Rs 1,00,000",
"Rs 96,000",
"Rs 1,20,000"
],
"ans": 2,
"e": "Total spending = 85%, so savings = 15% = 14400 → income = 14400/0.15 = Rs 96,000."
},
{
"n": 97,
"q": "The sum of the present ages of father and son is 90 years. 10 years earlier the ratio of their ages was 5 : 2. The present age of the father is:",
"o": [
"65",
"68",
"70",
"60"
],
"ans": 3,
"e": "(F−10):(S−10)=5:2 and F+S=90. So F+S−20=7k → 70=7k → k=10, F−10=50 → father = 60 years."
},
{
"n": 98,
"q": "A can do a piece of work in 5 days and B in 4 days. How long will they take to do the same work when working together?",
"o": [
"3 2/9 days",
"2 2/9 days",
"4 1/3 days",
"1 4/9 days"
],
"ans": 1,
"e": "Together's one-day work = 1/5 + 1/4 = 9/20, so time = 20/9 = 2 2/9 days."
},
{
"n": 99,
"q": "If 2 of A = 5 of B = 3 of C, then A : B : C is:",
"o": [
"4 : 6 : 5",
"6 : 4 : 5",
"4 : 5 : 6",
"5 : 4 : 6"
],
"ans": 2,
"e": "Per the given relation, A : B : C works out to 4 : 5 : 6."
},
{
"n": 100,
"q": "Of three numbers, the first is twice the second and the second is twice the third. The average of the reciprocals of the numbers is 7/12. The numbers are:",
"o": [
"20, 10, 5",
"4, 2, 1",
"36, 18, 9",
"16, 8, 4"
],
"ans": 1,
"e": "Let the numbers be 4x, 2x, x. Sum of reciprocals = (1+2+4)/(4x) = 7/(4x); average = 7/(12x) = 7/12 → x = 1. Numbers are 4, 2, 1."
},
{
"n": 101,
"q": "Amrita Shergil was a famous ____.",
"o": [
"singer",
"dancer",
"actress",
"painter"
],
"ans": 3,
"e": "Amrita Sher-Gil was a celebrated Hungarian-Indian painter, a pioneer of modern Indian art known for depicting the lives of Indian women."
},
{
"n": 102,
"q": "The highest plateau of India is the:",
"o": [
"Chota Nagpur",
"Malwa",
"Ladakh",
"Deccan"
],
"ans": 3,
"e": "The Deccan plateau, a triangular landmass south of the Narmada formed by Cretaceous-Eocene lava flows, is the highest plateau in India."
},
{
"n": 103,
"q": "Which of the following elicits the public opinion on a Bill?",
"o": [
"Referendum",
"Recall",
"Plebiscite",
"Initiative"
],
"ans": 0,
"e": "A referendum refers proposed legislation/a Bill to the electorate for direct vote, eliciting public opinion on it."
},
{
"n": 104,
"q": "Biogas is formed through:",
"o": [
"Fermentation",
"Reduction",
"Aerobic respiration",
"Oxidation"
],
"ans": 0,
"e": "Biogas is produced by anaerobic digestion (fermentation) when bacteria break down organic matter in the absence of oxygen."
},
{
"n": 105,
"q": "Hepatitis is a disease of the:",
"o": [
"Kidney",
"Liver",
"Heart",
"Eyes"
],
"ans": 1,
"e": "Hepatitis is inflammation/disease of the liver, caused by hepatitis viruses (A, B, C, D, E)."
},
{
"n": 106,
"q": "A ____ is a program that interprets and displays Web Pages.",
"o": [
"Server",
"Browser",
"Website",
"Link"
],
"ans": 1,
"e": "A web browser is the software that retrieves and displays web pages for the user."
},
{
"n": 107,
"q": "Which of the following countries won the 2023 Cricket World Cup?",
"o": [
"India",
"Australia",
"New Zealand",
"South Africa"
],
"ans": 1,
"e": "Australia won the 2023 Cricket World Cup, beating India in the final at Narendra Modi Stadium, Ahmedabad on 19 Nov 2023."
},
{
"n": 108,
"q": "The State with largest gap in male and female literacy is:",
"o": [
"Rajasthan",
"Kerala",
"Uttar Pradesh",
"Madhya Pradesh"
],
"ans": 0,
"e": "Rajasthan has the largest gap between male and female literacy rates."
},
{
"n": 109,
"q": "The law of demand states that when:",
"o": [
"income and price rises demand rises.",
"price rises demand rises.",
"price falls demand rises.",
"income rises demand rises."
],
"ans": 2,
"e": "The law of demand: price and quantity demanded are inversely related, so when price falls, demand rises (other factors constant)."
},
{
"n": 110,
"q": "Slow and uniform cooling of hot iron in its metallurgy is known as:",
"o": [
"chilling",
"annealing",
"quenching",
"tempering"
],
"ans": 1,
"e": "Annealing is the slow, uniform cooling of hot metal that increases ductility and reduces hardness, making it more workable."
},
{
"n": 111,
"q": "Fraternity means:",
"o": [
"Unity and Integrity",
"Elimination of Economic Justice",
"Fatherly treatment",
"Spirit of brotherhood"
],
"ans": 3,
"e": "Fraternity (from Latin fraternitas) means the spirit of brotherhood that promotes unity and integrity among people."
},
{
"n": 112,
"q": "The Pallava dynasty had their capital at:",
"o": [
"Kanchipuram",
"Vengi",
"Madurai",
"Thanjavur"
],
"ans": 0,
"e": "The Pallava dynasty (c. 275-897 CE) had its capital at Kanchipuram."
},
{
"n": 113,
"q": "Recently, Kishtwar saffron was given a Geographical Indication (GI) tag. It belongs to which of the following states?",
"o": [
"Jammu & Kashmir",
"Maharashtra",
"Madhya Pradesh",
"Himachal Pradesh"
],
"ans": 0,
"e": "Kishtwar saffron is grown in Jammu & Kashmir, which received the GI tag for its saffron."
},
{
"n": 114,
"q": "Nek Chand Saini's name is associated with which of the following gardens:",
"o": [
"Shalimar Bagh, Srinagar",
"Rock garden, Chandigarh",
"Vrindavan Garden, Mysore",
"Hanging garden, Mumbai"
],
"ans": 1,
"e": "Nek Chand Saini built the Rock Garden of Chandigarh from industrial and household waste."
},
{
"n": 115,
"q": "Which of the following sultans adopted Persian customs and manners in court?",
"o": [
"Iltutmish",
"Jalaluddin Khilji",
"Balban",
"Alauddin Khilji"
],
"ans": 2,
"e": "Ghiyasuddin Balban adopted Persian customs (Sijda, Paibos) and the festival of Nauroz in his court."
},
{
"n": 116,
"q": "Who convened the 'Congress of Vienna', 1815?",
"o": [
"Bismarck",
"Mussolini",
"Metternich",
"Napoleon Bonaparte"
],
"ans": 2,
"e": "The Congress of Vienna (1814-15) was convened/hosted by the Austrian Chancellor Duke Metternich."
},
{
"n": 117,
"q": "In the context of alternative sources of energy, ethanol as a viable bio-fuel can be obtained from:",
"o": [
"Potato",
"Wheat",
"Sugarcane",
"Rice"
],
"ans": 2,
"e": "Ethanol as a biofuel is obtained from sugarcane through fermentation of its juice and molasses."
},
{
"n": 118,
"q": "Buland Darwaza is located in which fort?",
"o": [
"Red fort at Agra",
"Red fort at Delhi",
"Fatehpur Sikri",
"Hawa Mahal"
],
"ans": 2,
"e": "Buland Darwaza, built by Akbar to mark his victory over Gujarat, is the main entrance to the Jama Masjid at Fatehpur Sikri."
},
{
"n": 119,
"q": "Distant objects can be seen with the help of?",
"o": [
"spectroscope",
"telescope",
"microscope",
"chronometer"
],
"ans": 1,
"e": "A telescope is used to observe distant objects via their emitted/reflected electromagnetic radiation."
},
{
"n": 120,
"q": "In which of the following states is the world's first 3D-printed temple being built?",
"o": [
"Karnataka",
"Maharashtra",
"Andhra Pradesh",
"Telangana"
],
"ans": 3,
"e": "India's first 3D-printed temple is at Siddipet, Telangana."
},
{
"n": 121,
"q": "When all inputs are doubled and as a result, output also doubles then we have:",
"o": [
"Increasing returns to scale.",
"Constant returns to scale.",
"Decreasing returns to scale.",
"None of the options."
],
"ans": 1,
"e": "When doubling all inputs doubles output, the production function exhibits constant returns to scale."
},
{
"n": 122,
"q": "Two gaseous molecules can react only when they have same ____.",
"o": [
"energy",
"entropy",
"free energy",
"orientation/steric factor"
],
"ans": 3,
"e": "Per collision theory, molecules react only when they collide with sufficient energy AND the proper orientation (steric factor)."
},
{
"n": 123,
"q": "Fathima Beevi passed away recently. She was a/an ____.",
"o": [
"Actor",
"Engineer",
"Doctor",
"Judge"
],
"ans": 3,
"e": "Justice Fathima Beevi was the first female judge of the Supreme Court of India (appointed 1989)."
},
{
"n": 124,
"q": "Himalayan Forest Research Centre is located at:",
"o": [
"Dehradun",
"Bhutan",
"Srinagar",
"Shimla"
],
"ans": 3,
"e": "The Himalayan Forest Research Institute is located at Shimla, Himachal Pradesh."
},
{
"n": 125,
"q": "Brown ring test is used for the detection of ____.",
"o": [
"sulphate",
"chlorate",
"phosphate",
"nitrate"
],
"ans": 3,
"e": "The brown ring test is used to detect nitrate ions in solution."
},
{
"n": 126,
"q": "The element involved with blood clotting is:",
"o": [
"Iron",
"Phosphorus",
"Sodium",
"Calcium"
],
"ans": 3,
"e": "Calcium ions are essential in the coagulation cascade, activating clotting factors and converting fibrinogen to fibrin."
},
{
"n": 127,
"q": "Through which states does the river Chambal flow?",
"o": [
"MP, Gujarat, UP",
"UP, MP, Rajasthan",
"Gujarat, MP, UP, Bihar",
"Rajasthan, MP, Bihar"
],
"ans": 1,
"e": "The Chambal River flows through Uttar Pradesh, Madhya Pradesh and Rajasthan."
},
{
"n": 128,
"q": "A hinged door is an example of:",
"o": [
"First order lever",
"Third order lever",
"Cantilever",
"Second order lever"
],
"ans": 3,
"e": "A hinged door is a second-order lever: the hinge is the fulcrum, the door is the load between fulcrum and effort."
},
{
"n": 129,
"q": "The sub-marine of Indian Navy is:",
"o": [
"INS Virat",
"INS Vikrant",
"INS Sindhurakshak",
"INS Rajali"
],
"ans": 2,
"e": "INS Sindhurakshak was a submarine of the Indian Navy (decommissioned 2017). INS Virat/Vikrant are aircraft carriers."
},
{
"n": 130,
"q": "Stories of Buddha's birth and his previous lives are contained in:",
"o": [
"Tripitakas",
"Jataka tales",
"Panchatantra tales",
"Triratnas"
],
"ans": 1,
"e": "The Jataka tales narrate the previous lives/births of the Buddha before his enlightenment."
},
{
"n": 131,
"q": "The basis for determining the dearness allowance of employees in India is:",
"o": [
"National Income.",
"Consumer Price Index.",
"Per capita income.",
"Standard of living."
],
"ans": 1,
"e": "Dearness Allowance (DA) in India is tied to the Consumer Price Index (CPI), reflecting cost-of-living changes."
},
{
"n": 132,
"q": "In winter, at the time of hibernation, Toads maintain breathing through:",
"o": [
"Both by Skin and Lungs",
"Skin",
"Lungs",
"Buccal Cavity"
],
"ans": 0,
"e": "During hibernation toads breathe mainly through the skin (cutaneous respiration) but also use their lungs to some extent."
},
{
"n": 133,
"q": "The objective of Sangam Yojana of government is",
"o": [
"To ensure wellness of handicapped and disabled.",
"To unite various Hindu groups",
"To make Ganga water pollution free",
"To make Sangam region of Allahabad more attractive for tourists."
],
"ans": 0,
"e": "The Sangam Yojana (1996) was launched for the welfare and economic self-reliance of Persons With Disabilities in rural areas."
},
{
"n": 134,
"q": "Does the President of India have veto power?",
"o": [
"No",
"The Constitution is silent on this.",
"Only for money bills",
"Yes"
],
"ans": 2,
"e": "The President has a limited (suspensive) veto; for money bills the President can assent or withhold, but Parliament can reconsider."
},
{
"n": 135,
"q": "The consumer is compared to a king under?",
"o": [
"Communism",
"Mixed Economy",
"Capitalism",
"Socialism"
],
"ans": 2,
"e": "Under capitalism (a market-driven system), the consumer is described as 'king' due to consumer sovereignty."
},
{
"n": 136,
"q": "The term Renaissance means:",
"o": [
"The Golden Age",
"The Era of Religious reforms",
"The Dark Age",
"The age of Reason, Enlightenment & Discoveries"
],
"ans": 3,
"e": "The Renaissance marked a revival of art, learning and reason, an age of enlightenment and discoveries bridging medieval to modern times."
},
{
"n": 137,
"q": "Which type of function does the analytical engine perform?",
"o": [
"Logical functions",
"Arithmetic functions",
"Control functions",
"Relational functions"
],
"ans": 1,
"e": "Babbage's Analytical Engine was designed to automate calculations, i.e. perform arithmetic functions."
},
{
"n": 138,
"q": "Which one of the following is a land locked country?",
"o": [
"Russia",
"Austria",
"India",
"China"
],
"ans": 1,
"e": "Austria is a landlocked country in Central Europe with no coastline."
},
{
"n": 139,
"q": "Area which supports the economy and export trade of a sea port is called its:",
"o": [
"economic zone",
"export basin",
"umland",
"hinter land"
],
"ans": 3,
"e": "The inland area connected to and supporting a sea port's economy and trade is its hinterland."
},
{
"n": 140,
"q": "In an inflationary situation, which of the following statements is false for a country?",
"o": [
"Cost of living rises.",
"Profits rise faster than wages.",
"Value of money falls.",
"Country's exports become more competitive."
],
"ans": 3,
"e": "During inflation, exports become costlier and less competitive; so 'exports become more competitive' is the false statement."
},
{
"n": 141,
"q": "Which one of the following statement is True regarding rate of interest:",
"o": [
"Rate of interest may be zero.",
"Rate of interest increases with economic growth.",
"Rate of interest can not be zero.",
"Rate of interest cannot be determined."
],
"ans": 0,
"e": "The rate of interest may be zero, so the true statement is 'Rate of interest may be zero.'"
},
{
"n": 142,
"q": "Which of the following is an example of direct democracy?",
"o": [
"Village Panchayat",
"Gram Sabha",
"District Panchayat",
"Nagar Panchayat"
],
"ans": 1,
"e": "The Gram Sabha, where all registered village voters participate directly in decisions, is an example of direct democracy."
},
{
"n": 143,
"q": "Who among the following is not an Olympics medal winner?",
"o": [
"K. Malleshwari",
"Abhinav Bindra",
"Jwala Gutta",
"Mary Kom"
],
"ans": 2,
"e": "Badminton player Jwala Gutta has not won an Olympic medal; the others are Olympic medallists."
},
{
"n": 144,
"q": "Water stomata are present in the:",
"o": [
"Ventral surface of Leaf",
"Leaf margin",
"Veins",
"Dorsal surface of Leaf"
],
"ans": 0,
"e": "Per the book's explanation, water stomata are on the lower/ventral surface of the leaf."
},
{
"n": 145,
"q": "A person suffering from long sightedness wears spectacles having:",
"o": [
"Convex lenses",
"Concave convex lens",
"Lenses with negative power",
"Concave lenses"
],
"ans": 0,
"e": "Long-sightedness (hypermetropia) is corrected with convex (converging) lenses."
},
{
"n": 146,
"q": "The words socialist and secular were inserted in the Preamble to the Constitution by:",
"o": [
"The 16th Amendment",
"The 42nd Amendment",
"The 44th Amendment",
"The 7th Amendment"
],
"ans": 1,
"e": "'Socialist' and 'secular' were added to the Preamble by the 42nd Amendment Act, 1976."
},
{
"n": 147,
"q": "A pressure cooker reduces cooking time because:",
"o": [
"the boiling point of the water inside is elevated",
"it absorbs more heat from its flame.",
"the higher pressure tenderizes the food.",
"the heat is more evenly distributed."
],
"ans": 0,
"e": "Higher pressure raises the boiling point of water, so it cooks at a higher temperature, reducing cooking time."
},
{
"n": 148,
"q": "A Computer that keeps copies of responses and recent requests is known as ____.",
"o": [
"Mail Server",
"Proxy Server",
"Server",
"Web Server"
],
"ans": 1,
"e": "A proxy server acts as an intermediary and caches copies of recent requests/responses."
},
{
"n": 149,
"q": "An area reserved for the protection of the wildlife is called:",
"o": [
"Sanctuary",
"National Park",
"Zoological Park",
"Reserved Forest."
],
"ans": 1,
"e": "Per the book, a National Park is a designated area where wildlife and the natural environment are protected and human activity is limited."
},
{
"n": 150,
"q": "The largest part of our brain is:",
"o": [
"Hypothalamus",
"Medulla oblongata",
"Cerebellum",
"Cerebrum"
],
"ans": 3,
"e": "The cerebrum is the largest part of the human brain, controlling higher cognitive functions and voluntary movement."
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

  const TEST_TITLE = 'SSC MTS (2016 Pattern) - 2016 Shift-2';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('\nBuilding questions (uploading figure images to Cloudinary)...');
  const questions = await buildQuestions();
  console.log(`\nBuilt ${questions.length} questions.`);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 150, duration: 150,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2016, pyqShift: 'Shift-2', pyqExamName: 'SSC MTS', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
