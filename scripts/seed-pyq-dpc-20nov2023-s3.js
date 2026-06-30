/**
 * Seed: Delhi Police Constable - 20 Nov 2023 Shift-3
 * 100 Q x 1 mark, 90 min. Reuses Exam SSC-DPC + pattern 'Computer-Based Test (CBT)'.
 * Source: official TCS/iON 'Question Paper with Answers' PDF (deterministic green
 * colour answer key). Figure/figural questions upload a local crop as questionImage.
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc20nov2023_s3');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-20nov2023-s3';

const examPatternSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  title: { type: String, required: true, trim: true },
  duration: { type: Number }, totalMarks: { type: Number }, negativeMarking: { type: Number },
  sections: [{ name: String, totalQuestions: Number, marksPerQuestion: Number,
    negativePerQuestion: Number, sectionDuration: Number }]
}, { timestamps: true });
const examSchema = new mongoose.Schema({
  category: mongoose.Schema.Types.ObjectId, name: String, code: String
}, { timestamps: true });
const practiceTestSchema = new mongoose.Schema({
  examPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern', required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, lowercase: true, trim: true },
  totalMarks: { type: Number, required: true }, duration: { type: Number, required: true },
  accessLevel: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
  isPYQ: { type: Boolean, default: false }, pyqYear: { type: Number, default: null },
  pyqShift: { type: String, default: null }, pyqExamName: { type: String, default: null },
  publishedAt: { type: Date, default: Date.now },
  questions: [{
    questionText: { type: String, required: true },
    questionImage: { type: String, default: '' },
    options: [{ type: String, required: true }],
    optionImages: [{ type: String, default: '' }],
    correctAnswerIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, trim: true },
    explanationImage: { type: String, default: '' },
    section: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    difficulty: { type: String, enum: ['easy','medium','hard','mixed'], default: 'medium' }
  }]
}, { timestamps: true });

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 20 Nov 2023 Shift-3"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "राज्य के नीति-निर्देशक सिद्धांांत ________में दिए गए 'निर्देशों के लिखत' के समान हैं।", o: ["भारत सरकार अधिनियम, 1935", "भारत सरकार अधिनियम, 1919", "भारतीय स्वतंत्रता अधिनियम, 1947", "भारत सरकार अधिनियम, 1909"], a: 0, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "यात्रियों की कुल संख्या की दृष्टि से, वर्ष 2022 में भारत का सबसे बड़ा हवाई अड्डा कौन-सा था?", o: ["राजीव गांधी अंतर्राष्ट्रीीय हवाई अड्डा (हैदराबाद)", "केंपेपेगौड़ा अंतर्राष्ट्रीीय हवाई अड्डा (बेंगलुरु)", "छत्रपति शिवाजी महाराज अंतर्राष्ट्रीीय हवाई अड्डा (मुंबई)", "इंदिरा गांधी अंतर्राष्ट्रीीय हवाई अड्डा (दिल्ली)"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "In which of the following years was the twelfth plan completed?", o: ["2014", "2016", "2017", "2015"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "Which of the following pairs is NOT correctly matched with respect to the player and sport?", o: ["Yogesh Kathuniya – Discuss throw", "Bhavina Patel – Para-shooting", "Nishad Kumar – High jump", "LY Suhas – Para-badminton"], a: 1, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "Under which function of the Union Budget does the Government of India build roads and hospitals?", o: ["Stabilisation", "Redistribution", "Surplus generation", "Allocation"], a: 3, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "As per the CMIE’s report in December 2022, what was the unemployment rate of the urban population in India?", o: ["8.12%", "10.09%", "11.09%", "12.03%"], a: 1, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Belgium won the Men's International Federation Hockey (FIH) 2018 World Cup, which was held in ________.", o: ["Australia", "India", "Germany", "Belgium"], a: 1, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Who among the following became the first Indian musician to be honoured with the Ramon Magsaysay award, which is considered to be Asia's Nobel Prize?", o: ["Lata Mangeshkar", "MS Subbulakshmi", "Pandit Ravi Shankar", "Pandit Kumar Gandarva"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Which of the following organisations regulates international trade?", o: ["UNICEF", "UNESCO", "IMF", "WTO"], a: 3, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "भारत के पश्चिमी तटीय क्षेत्रोंों में मानसून का मौसम समाप्त होने के उपलक्ष्य में हिंदू माह श्रावण के आखिरी दिन कौन सा पर्व मनाया जाता है?", o: ["नराली पूर्णिमा", "कोजागिरी पूर्णिमा", "साम्बा दशमी", "गुरु पूर्णिमा"], a: 0, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "From where does most of the refracted light rays enter the eyes?", o: ["From the outer surface of the cornea", "From the outer surface of the retina", "From the outer surface of the iris", "From the inner surface of the cornea"], a: 0, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "साहित्य अकादमी पुरस्कार विजेता माया खुटेगांवकर एक प्रसिद्ध _________ नृत्यांांगना हैं।", o: ["बिहु", "सुग्गी", "लावणी", "झूमर"], a: 2, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "संसद _____________ की सिफारिश पर राज्य विधान-परिषद बना या समाप्त कर सकती है।", o: ["राज्य विधानसभा", "राज्य के राज्यपाल", "मुख्यमंत्री", "भारत के राष्ट्रपति"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन-सा अनुच्छेेद निर्देशक सिद्धांांतों को 'देश के शासन में मौलिक' के रूप में निहित करता है और 'कानून बनाने में इन सिद्धांांतों को लागू' करने की राज्य से अपेक्षा करता है?", o: ["अनुच्छेेद 37", "अनुच्छेेद 38", "अनुच्छेेद 39", "अनुच्छेेद 36"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "हरित क्रांांति द्वारा पारंपरिक खेती के विरुद्ध किस कृषि तकनीक को बढ़ावा दिया गया?", o: ["जैविक खेती", "श्रम प्रधान खेती", "वैज्ञानिक खेती", "स्वदेशी खेती"], a: 2, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "क्षमादान देने, सजा में राहत देने, स्थगन देने या छूट देने की शक्ति किसके पास है?", o: ["राष्ट्रपति", "प्रधान मंत्री", "उप-राष्ट्रपति", "अध्यक्ष (स्पीकर)"], a: 0, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "In which year did Lord Curzon arrive in India as Viceroy?", o: ["1898", "1891", "1899", "1892"], a: 2, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "1882 में, थियोसोफिकल सोसायटी का मुख्यालय ________ में स्थापित किया गया था।", o: ["ग्वालियर", "कलकत्ता", "अड्यार", "इलाहाबाद"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "The amphibians of plant kingdom are ________.", o: ["Pteridophytes", "Bryophytes", "Algae", "Fungi"], a: 1, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Which unusual flavour is observed in dairy products due to the formation of ethyl esters catalysed by esterases produced by lactic acid bacteria?", o: ["Fishy flavour", "Musty flavour", "Fruity flavour", "Bitty flavour"], a: 2, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से क्‍या, भारत की जनगणना वाले किसी नगर की परिभाषा के अंतर्गत नहीं आता है?", o: ["जनसंख्या घनत्व 400 व्यक्ति प्रति km2", "नगर पालिका, नगर निगम आदि की उपस्थिति", "प्राथमिक क्षेत्र में लगी हुई 75% से अधिक जनसंख्या", "5000 व्यक्तियों की न्यूनतम जनसंख्या"], a: 2, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Which crop is also known as ‘golden fibre’?", o: ["Cotton", "Wheat", "Rice", "Jute"], a: 3, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "The ‘Infant Mortality Rate’ is defined as the number of deaths of infants aged less than one year per _________ live births in a given year.", o: ["5000", "1000", "100", "500"], a: 1, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "मंदिर वास्तुकला की निम्नलिखित में से किस शैली में शिखर को देउल कहा जाता है?", o: ["ओडिशा", "द्रविड़", "नागर", "वेसरा"], a: 0, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT an amphibian animal?", o: ["Salamander", "Toad", "Tortoise", "Frog"], a: 2, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "Which of the following authors has written the famous novel ‘Gulliver’s Travels’?", o: ["Oscar Wilde", "Samueal Richardson", "Jonathan Swift", "Ruskin Bond"], a: 2, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "आर्य संस्‍कृति के विभिन्‍न स्रोतों में ________प्रमुख हैं।", o: ["अनुष्‍ठान ग्रंथ", "स्‍मारक", "शिलालेख", "पुरातात्‍विक कलाकृतियां"], a: 0, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "बादशाह नामा के लेखक कौन थे ?", o: ["सादुल्लाह खान", "अबुल फजल", "अब्दुुल हमीद लाहौरी", "बैरम खान"], a: 2, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "Who was the author of ‘Raag Darbari’?", o: ["Dharamvir Bharati", "Suryakant Tripathi ‘Nirala’", "Shrilal Shukla", "Harivansh Rai Bachchan"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "What is 25-Ponders with reference to the celebration at the Republic Day Parade?", o: ["March-past by the Cavalry", "Salute by seven canons of the Indian Army", "Salute to the National Flag by the President’s bodyguards", "Presentation of the tableaus from different states"], a: 1, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Amaravati Stupa is located in which of these states?", o: ["West Bengal", "Andhra Pradesh", "Gujarat", "Madhya Pradesh"], a: 1, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Which female singer got the ‘Best Playback Singer (Female)’ award at the Filmfare Awards 2022?", o: ["Shreya Ghoshal", "Priya Sariya", "Neha Kakkar", "Asees Kaur"], a: 3, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से किसका संबंध किसी हिमनदीय स्थलरूप से है?", o: ["जलोढ़ पंखा (Alluvial fan)", "प्लाया (Playas)", "यारडांग (Yardangs)", "हॉर्न (Horns)"], a: 3, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which of the following Constitutional Amendment Acts made it a fundamental duty of parents to educate their child?", o: ["88th Amendment Act", "87thAmendment Act", "86th Amendment Act", "85th Amendment Act"], a: 2, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "‘Samagra Shiksha’, a scheme in the area of education subsumes the earlier schemes pertaining to ____________.", o: ["Sarva Shiksha Abhiyan, Rashtriya Madhyamik Shiksha Abhiyan and Teacher Education only", "Sarva Shiksha Abhiyan and Rashtriya Madhyamik Shiksha Abhiyan only", "Sarva Shiksha Abhiyan only", "Sarva Shiksha Abhiyan, Teacher Education and Rashtria Avishkar Abhiyan only"], a: 0, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "In which year was the Right to Education (RTE) Act implemented?", o: ["2009", "2010", "2015", "2012"], a: 1, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "भारत का पहला महिला संगठन, भारत स्त्री महामंडल की स्थापना __________ के द्वारा की गई थी।", o: ["एनी बेसेंट", "सरला देवी चौधरानी", "सरोजिनी नायडू", "सावित्रीबाई फुले"], a: 1, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "Which of the following is a famous folk dance of Bihar?", o: ["Jhijhiya", "Naga dance", "Maharas", "Khel gopal"], a: 0, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "Who among the following is associated with Kathak?", o: ["Kalamandalam Krishnan Nair", "Nahid Siddiqui", "V Satyanarayana Sarma", "Anokhelal Mishra"], a: 1, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "पाल वंश के धर्मपाल को निम्नलिखित में से किस राष्ट्रकूट शासक ने पराजित किया था?", o: ["अमोघवर्ष द्वितीय", "गोविंद द्वितीय", "कृष्ण प्रथम", "ध्रुव"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से किस नृत्‍यांगना ने प्रसिद्ध बैलेरीना अन्ना पावलोवा (Anna Pavlova) के अनुरोध पर बैले सीखा?", o: ["सितारा देवी", "रुक्मिणी देवी अरुंंडेल", "सोनल मानसिंह", "यामिनी कृष्णमूर्ति"], a: 1, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "In which of the following years was Sati, the practice of widow-burning, banned in India?", o: ["1875", "1819", "1897", "1829"], a: 3, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "The thickness of the continental crust beneath the Central Himalayas is of the order of _________ , marking the end of volcanic activity in the region.", o: ["35–37 km", "60–65 km", "50–63 km", "70–72 km"], a: 3, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "महरौली में लौह स्तंभ का निर्माण निम्नलिखित में से किस राजवंश के शासकों द्वारा करवाया गया था?", o: ["मौखरी", "गुप्त", "कुषाण", "मौर्य"], a: 1, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Which of the following measures is NOT related to the tax reform measures undertaken during the liberalisation phase?", o: ["Reduction in rates of income tax", "Devaluation of Rupee", "Reforms related to indirect taxes", "Simplification of tax procedures"], a: 1, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन-सा 37वें राष्ट्रीीय खेलों का शुभंकर है?", o: ["मोगा", "ऑली", "सावज", "भीमा"], a: 0, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Which month marks the approximate arrival of the monsoon in India?", o: ["Early January", "Early June", "Early February", "Early October"], a: 1, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Which system was prevalent before the invention of money?", o: ["Bretton woods system", "Liquidity system", "Fiscal system", "Barter system"], a: 3, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "निम्नलिखित में से कौन संसद की संयुक्त बैठक की अध्यक्षता करता है?", o: ["भारत के राष्ट्रपति", "राज्यसभा के सभापति", "भारत के प्रधानमंत्री", "लोकसभा अध्यक्ष"], a: 3, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "In which Olympics did Khashaba Jadhav, the first Indian win an individual Olympic medal for India?", o: ["1972 Munich Olympics", "1948 London Olympics", "1952 Helsinki Olympics", "1936 Berlin Olympics"], a: 2, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["÷ and ×", "÷ and +", "− and ÷", "+ and ×"], a: 3, e: "", qimg: "20nov2023-s3-q-51.png" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select a figure from amongst the four given options, which when placed in the blank space of figure (X) would complete the pattern.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "20nov2023-s3-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["6", "4", "1", "3"], a: 0, e: "", qimg: "20nov2023-s3-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Six numbers, 21, 22, 23, 24, 25 and 26 are written on different faces of a dice. Three positions of this dice are shown here. Find the number on the face opposite 26.", o: ["23", "22", "21", "24"], a: 1, e: "", qimg: "20nov2023-s3-q-54.png" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["12", "14", "17", "15"], a: 2, e: "", qimg: "20nov2023-s3-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Select the word-pair that best represents a similar relationship to the one expressed in the pair of words given below. (The words must be considered as meaningful English words and must not be related to each other based on the number of letters/number of consonants/vowels in the word.) False : Untrue", o: ["Trip : Journey", "Fault : Line", "Higher : Hire", "Blanket : Winter"], a: 0, e: "", qimg: "" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Anu, Geeta, Mittal, Radha, Hema and Kriti were sitting around a circular table, facing the centre. They were sitting at an equal distance from one another. Hema and Radha were sitting exactly next to each other. Anu was to the immediate right of Kriti. Geeta was to the immediate left of Hema. Mittal is to the immediate right of Radha. Who among the following is sitting to the immediate left of Geeta?", o: ["Hema", "Radha", "Anu", "Kriti"], a: 2, e: "", qimg: "" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "20nov2023-s3-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "20nov2023-s3-q-59.png" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the option that represents the letters that, when sequentially placed from left to right in the blanks below, will complete the letter series. W _ _ S D _ E A S _ W _ A _ D W E A _ _", o: ["EAWESESD", "EAWDSESD", "EAWSEESD", "EAWDESSD"], a: 3, e: "", qimg: "" },
  { n: 61, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below to complete the pattern so that the final image is symmetrical.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "20nov2023-s3-q-61.png" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 18 * 90 * 3 * 27 * 8 = 0", o: ["÷, −, ×, +", "−, ×, ÷, −", "+, ×, −, ÷", "×, ÷, +, −"], a: 1, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Select the option that is related to the third term in the same way as the second term is related to the first term and the sixth term is related to the fifth term. 20 : 205 :: 75 : ? :: 105 : 1055", o: ["720", "750", "785", "755"], a: 3, e: "", qimg: "" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE: Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding/subtracting/multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed) (24, 86, 67) (39, 64, 71)", o: ["(37, 51, 88)", "(16, 54, 43)", "(18, 45, 63)", "(28, 89, 117)"], a: 1, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 3, 18, 63, 198, 603, ?", o: ["1479", "1200", "1500", "1818"], a: 3, e: "", qimg: "" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'PQ' as shown below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "20nov2023-s3-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "20nov2023-s3-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘STAY’ is written as ‘2732221’ and ‘FROM’ is written as ‘1517208’. How will ‘FIT’ be written in that language?", o: ["6920", "81221", "11226", "22118"], a: 3, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "20nov2023-s3-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Select the option which when placed in the blank space of the given figure will complete the pattern.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "20nov2023-s3-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Two statements are given followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: Some camels are donkeys. Some donkeys are cows. Conclusions: I. Some cows are camels. II. Some donkeys are camels.", o: ["Only conclusion I follows", "Both conclusions I and II follow", "Only conclusion II follows", "Neither conclusion I nor II follows"], a: 2, e: "", qimg: "" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the figure that will replace the question mark (?) in the following figure series.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "20nov2023-s3-q-72.png" },
  { n: 73, s: "Reasoning / Logical Ability", q: "Six numbers, 5, 6, 7, 8, 9 and 10, are written on the different faces of a dice. Two positions of this dice are shown in the given figure. Find the number on the face opposite to 5.", o: ["10", "6", "7", "9"], a: 0, e: "", qimg: "20nov2023-s3-q-73.png" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "20nov2023-s3-q-74.png" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["B", "C", "P", "R"], a: 0, e: "", qimg: "20nov2023-s3-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "If a man walks at five-sixth of his usual speed from his home towards his office, he is 20 minutes late. Find the usual time (in minutes) to cover the distance between his home and his office.", o: ["90", "105", "100", "120"], a: 2, e: "", qimg: "" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["4782.0", "4774.0", "4790.0", "4762.0"], a: 1, e: "", qimg: "20nov2023-s3-q-77.png" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "A alone can build a house in 16 days, but B alone can build it in 12 days. A and B work on alternate days. If A works on the first day, the house will be built in how many days?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "20nov2023-s3-q-78.png" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "A shopkeeper purchased 12 dozen eggs at the rate of ₹60 per dozen. He sold the eggs at ₹6 per piece. What was his profit percentage?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "20nov2023-s3-q-79.png" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "An isosceles right-angled triangle has hypotenuse length as 10 units. What is the area of the triangle (in square units)?", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "20nov2023-s3-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["80", "82", "98", "100"], a: 2, e: "", qimg: "20nov2023-s3-q-81.png" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "निम्नलिखित में से किस संख्या समूह में सबसे कम अभाज्य संख्याएँ हैं?", o: ["30 से 49 तक", "40 से 60 तक", "21 से 40 तक", "60 से 80 तक"], a: 2, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "The value of a machine, purchased 3 years ago, depreciates at the annual rate of 15%. If its present value is ₹51,20,000, find its value after 4 years.", o: ["₹26,72,672", "₹27,62,267", "₹27,76,622", "₹26,67,722"], a: 0, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "Three solid cubes of sides 3 cm, 4 cm and 5 cm are melted to form a new solid cube. Find the surface area (in cm2) of the cube so formed.", o: ["343", "125", "216", "144"], a: 2, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "An article is marked at a price which gives a profit of 20%. After allowing a certain discount, the profit reduces to 10%. The discount percentage is:", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "20nov2023-s3-q-85.png" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of two numbers is 5:6. If their HCF is 8, what is the LCM of these two numbers?", o: ["480", "120", "240", "360"], a: 2, e: "", qimg: "" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of ₹18,910 is divided among Arjun, Raima and Sohan such that Arjun receives 20% less than Raima, while Sohan receives 25% more than Raima’s share. What is the share (in ₹) of Sohan?", o: ["7,750", "7,700", "8,470", "8,750"], a: 0, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "The ratio of P’s salary to Q’s salary is 2 : 3. The ratio of Q’s salary to R’s salary is 4 : 5. What will be the ratio of P’s salary to R’s salary?", o: ["3 : 5", "12 : 15", "8 : 12", "8 : 15"], a: 3, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "In how much time will a sum of money double itself at a rate of simple interest of 5% per annum?", o: ["12 years", "10 years", "20 years", "18 years"], a: 2, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "The average of a, b and c is 35 and the average of a, c and d is 40. If d = 25, then find the value of b.", o: ["38", "10", "15", "22"], a: 1, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following functions in MS Excel 365, generates a real number greater than 0 and is really simple and traditionally used for statistical analysis, cryptography, gaming, gambling, and probability theory, among dozens of other things?", o: ["RAND", "AVERAGE", "SUM", "VLOOKUP"], a: 0, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "माइक्रोसॉफ्ट वर्ड 365 (Microsoft Word 365) में टेक्स्ट पेस्‍ट करते समय, यदि गंतव्य में पहले से ही टेक्स्ट मौजूद है तो डिफ़ॉल्ट व्यवहार क्या होता है?", o: ["पेस्‍ट किए गए टेक्स्ट के साथ एक नया डाक्‍यूमेंट बना ।", "मौजूदा टेक्स्ट ओवरराइट हो जाता है।", "टेक्स्ट को ओवरराइट करने या मर्ज करने के बीच चयन करने के लिए उपयोगकर्ता को संकेत (Prompt) देना।", "पेस्‍ट किया गया टेक्स्ट मौजूदा टेक्स्ट के साथ मर्ज हो जाता है।"], a: 3, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "In Microsoft Word 365, on which page is the header or the footer displayed by default?", o: ["On first page", "On every page", "On last page", "On middle page"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "Which of the following shortcut keys is used to justify the text in MS Word 365?", o: ["Ctrl + B", "Ctrl + J", "Ctrl + I", "Ctrl + U"], a: 1, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "What is the primary purpose of a word processing package like Microsoft Word 365?", o: ["Creating spreadsheets", "Designing presentations", "Creating and editing documents", "Sending emails"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "By default, what number of emails in Gmail can be sorted that a user recently received.", o: ["100", "25", "75", "50"], a: 3, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "In MS Excel _____ have a dollar sign ($) in front of the row number and/or column letter.", o: ["Both absolute reference and mixed reference", "Only mixed reference", "Only absolute reference", "Only relative reference"], a: 0, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "Which of the following shortcut keys is used to get the Help Menu in MS-Word 365?", o: ["F1", "Ctrl + F1", "Alt + F1", "Shift + F1"], a: 0, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following is the full form of GPRS?", o: ["General Packet Radio Service", "General Packet Release Service", "General Protocol Radio Service", "Group Packet Radio Service"], a: 0, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "एमएस एक्सेल 365 (MS Excel 365) में कोई फॉर्मूला शुरू करने के लिए निम्नलिखित में से किस प्रतीक का उपयोग किया जाता है?", o: ["$", "&", "*", "="], a: 3, e: "", qimg: "" }
];

const uploadCache = new Map();
async function uploadImg(fname) {
  if (!fname) return '';
  if (uploadCache.has(fname)) return uploadCache.get(fname);
  const local = path.join(IMG_DIR, fname);
  if (!fs.existsSync(local)) { console.warn('  missing img', local); uploadCache.set(fname, ''); return ''; }
  try {
    const res = await cloudinary.uploader.upload(local, {
      folder: CLOUDINARY_FOLDER, public_id: fname.replace(/\.png$/, ''), overwrite: true, resource_type: 'image'
    });
    uploadCache.set(fname, res.secure_url); return res.secure_url;
  } catch (err) { console.error('  [upload failed]', fname, err.message); uploadCache.set(fname, ''); return ''; }
}

async function buildQuestions() {
  const out = [];
  for (const r of RAW) {
    const qImage = await uploadImg(r.qimg);
    out.push({
      questionText: r.q, questionImage: qImage, options: r.o,
      optionImages: ['', '', '', ''], correctAnswerIndex: r.a,
      explanation: r.e || '', section: r.s, tags: TAGS, difficulty: 'medium'
    });
  }
  return out;
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'SSC-DPC' });
  if (!exam) throw new Error('Exam SSC-DPC not found — aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Computer-Based Test (CBT)' });
  if (!pattern) throw new Error('ExamPattern "Computer-Based Test (CBT)" not found — aborting.');

  const TEST_TITLE = "Delhi Police Constable - 20 Nov 2023 Shift-3";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2023,
    pyqShift: TEST_TITLE, pyqExamName: 'Delhi Police Constable', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
