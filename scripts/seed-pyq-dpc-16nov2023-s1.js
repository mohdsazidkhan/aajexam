/**
 * Seed: Delhi Police Constable - 16 Nov 2023 Shift-1
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

const IMG_DIR = path.resolve(__dirname, '../_seedimg_dpc16nov2023_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/dpc-16nov2023-s1';

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

const TAGS = ["Delhi Police", "Constable", "PYQ", "2023", "Delhi Police Constable - 16 Nov 2023 Shift-1"];
const RAW = [
  { n: 1, s: "General Knowledge / Current Affairs", q: "Which of the following statements is/are true about NABARD? I. NABARD was formed on the recommendation of Sivaraman Committee. II. NABARD came into existence in 1980. III. It was set up with an initial capital of ₹100 crore.", o: ["Only I", "Only II and III", "Only II", "Only I and III"], a: 3, e: "", qimg: "" },
  { n: 2, s: "General Knowledge / Current Affairs", q: "The Indian Vice President is elected by an electoral college comprising members of __________________.", o: ["Rajya Sabha, Lok Sabha and State Legislative Council", "Lok Sabha and State Legislature", "Rajya Sabha and State Legislative Assembly", "both the houses of Parliament"], a: 3, e: "", qimg: "" },
  { n: 3, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT a fundamental duty?", o: ["To safeguard public property", "To value and preserve the rich heritage of the country’s composite culture", "To promote cooperative society", "To uphold and protect the sovereignty, unity and integrity of India"], a: 2, e: "", qimg: "" },
  { n: 4, s: "General Knowledge / Current Affairs", q: "How many officials are there for looking after each Kabaddi match?", o: ["6", "2", "3", "5"], a: 0, e: "", qimg: "" },
  { n: 5, s: "General Knowledge / Current Affairs", q: "In which town of India did James Prinsep conduct the census in 1824?", o: ["Banaras", "Allahabad", "Bombay", "Calcutta"], a: 1, e: "", qimg: "" },
  { n: 6, s: "General Knowledge / Current Affairs", q: "Where is the National Flag hoisted by the Prime Minister on every Independence Day?", o: ["Red Fort", "Parliament House", "India Gate", "Gateway of India"], a: 0, e: "", qimg: "" },
  { n: 7, s: "General Knowledge / Current Affairs", q: "Which of the following states is associated with the devotional folk dance ‘Gambhira’?", o: ["Rajasthan", "Bihar", "Odisha", "West Bengal"], a: 3, e: "", qimg: "" },
  { n: 8, s: "General Knowledge / Current Affairs", q: "Murad Ali is a well-known _________ player.", o: ["guitar", "sarangi", "tabla", "flute"], a: 1, e: "", qimg: "" },
  { n: 9, s: "General Knowledge / Current Affairs", q: "Who among the following was the first Indian to conduct a major British orchestra in 1961? He was the Israel Philharmonic Orchestra's 'Music Director for Life'.", o: ["Zubin Mehta", "Dr. Lakshminarayana Subramaniam", "Ilaiyaraaja", "AR Rahman"], a: 0, e: "", qimg: "" },
  { n: 10, s: "General Knowledge / Current Affairs", q: "Which of the following is NOT an independent constitutional body according to the Indian Constitution?", o: ["UPSC", "NITI Aayog", "Election Commission", "State Public Service Commission"], a: 1, e: "", qimg: "" },
  { n: 11, s: "General Knowledge / Current Affairs", q: "Which of the following Articles of the Indian Constitution is related with organisation of village panchayats?", o: ["Article40", "Article38", "Article39", "Article 37"], a: 0, e: "", qimg: "" },
  { n: 12, s: "General Knowledge / Current Affairs", q: "The ‘Shiksha Karmi’ initiative and the ‘Lok Jumbish’ programme are schemes that helped increase the literacy rate of which state in India?", o: ["Madhya Pradesh", "Gujarat", "Mizoram", "Rajasthan"], a: 3, e: "", qimg: "" },
  { n: 13, s: "General Knowledge / Current Affairs", q: "The main objective of which of the following schemes is to support sustainable production in the agriculture sector by providing financial assistance to farmers suffering crop loss/damage arising out of unforeseen events?", o: ["Pradhan Mantri Fasal Bima Yojana", "Paramparagat Krishi Vikas Yojana", "Pradhan Mantri Krishi Sinchai Yojana", "Gramin Bhandaran Yojana"], a: 0, e: "", qimg: "" },
  { n: 14, s: "General Knowledge / Current Affairs", q: "Who described Archimedes' method of finding the specific gravity of substances using a balance in the treatise ‘The Little Balance’?", o: ["Galileo Galilei", "Michael Faraday", "Daniel Bernoulli", "Albert Einstein"], a: 0, e: "", qimg: "" },
  { n: 15, s: "General Knowledge / Current Affairs", q: "Sultan Muhammad Bin Tughluq appointed ____________, a wine distiller, to a high administrative post in the Delhi Sultanate.", o: ["Aziz Khummar", "Manka Tabbakh", "Ladha", "Firuz Hajjam"], a: 0, e: "", qimg: "" },
  { n: 16, s: "General Knowledge / Current Affairs", q: "The Rajya Sabha should consist of NOT more than _______________ members.", o: ["240", "245", "250", "238"], a: 2, e: "", qimg: "" },
  { n: 17, s: "General Knowledge / Current Affairs", q: "In which of the following years was Subash Chandra Bose appointed as the President of the Indian Independence League?", o: ["1941", "1944", "1942", "1943"], a: 3, e: "", qimg: "" },
  { n: 18, s: "General Knowledge / Current Affairs", q: "Which thermostable enzyme hydrolyses starch during the cooking of sweet potatoes?", o: ["Pectinase", "Exocellulases", "β-amylase", "Lipase"], a: 2, e: "", qimg: "" },
  { n: 19, s: "General Knowledge / Current Affairs", q: "Harmika is a _________ Buddhist railing, from which a shaft rises and that holds the imperial umbrella.", o: ["square", "rectangular", "cylindrical", "circular"], a: 0, e: "", qimg: "" },
  { n: 20, s: "General Knowledge / Current Affairs", q: "Which of the following is causative factor for oral cancer?", o: ["Spicy food", "Tobacco", "Sugar", "Excess salt"], a: 1, e: "", qimg: "" },
  { n: 21, s: "General Knowledge / Current Affairs", q: "How many types of ministers are there in the Council of Ministers?", o: ["5", "6", "3", "4"], a: 2, e: "", qimg: "" },
  { n: 22, s: "General Knowledge / Current Affairs", q: "Who among the following is an American tennis player who wrote ‘Open: An autobiography’?", o: ["Pete Sampras", "Rod Laver", "Andre Agassi", "Ivan Lendl"], a: 2, e: "", qimg: "" },
  { n: 23, s: "General Knowledge / Current Affairs", q: "Which of the following is an essential feature of the Green Revolution?", o: ["Increase in multi-fold international trade.", "Increase in the role and responsibility of the government.", "Good quality labour can increase industrial productivity.", "HYV seeds have led to a substantial rise in crop productivity."], a: 3, e: "", qimg: "" },
  { n: 24, s: "General Knowledge / Current Affairs", q: "The ‘slash and burn’ agriculture is known as ________ in Rajasthan state.", o: ["Waltre", "Roca", "Dipa", "Podu"], a: 0, e: "", qimg: "" },
  { n: 25, s: "General Knowledge / Current Affairs", q: "Harshavardhana, the ruler of Kannauj in 7th century CE, was the king of which of the following dynasties?", o: ["Pushyabhuti", "Vakataka", "Chalukya", "Maukhari"], a: 0, e: "", qimg: "" },
  { n: 26, s: "General Knowledge / Current Affairs", q: "The Thanksgiving Festival of Nawala that is dedicated to Lord Shiva is majorly celebrated in which city of Himachal Pradesh?", o: ["Chamba", "Dharamshala", "Shimla", "Kangra"], a: 3, e: "", qimg: "" },
  { n: 27, s: "General Knowledge / Current Affairs", q: "In India, the Young Men’s Christian Association (YMCA) at ___________ introduced basketball for the first time.", o: ["Kolkata", "Ranchi", "Mumbai", "Jamshedpur"], a: 0, e: "", qimg: "" },
  { n: 28, s: "General Knowledge / Current Affairs", q: "In which year did the sepoy revolt take place in Vellore?", o: ["1795 CE", "1824 CE", "1806 CE", "1856 CE"], a: 2, e: "", qimg: "" },
  { n: 29, s: "General Knowledge / Current Affairs", q: "How many total jumps are there in a 3000 m steeplechase race?", o: ["36", "33", "35", "34"], a: 2, e: "", qimg: "" },
  { n: 30, s: "General Knowledge / Current Affairs", q: "Which of the following has NOT occurred after the liberalisation of economic policies under the New Economic Policies (NEP) in 1991?", o: ["Increase in India’s share of exports in world trade", "Significant increase in India’s foreign exchange reserves", "Increase in inflows from foreign direct investment", "A massive increase in the share of agriculture in India’s gross domestic product"], a: 3, e: "", qimg: "" },
  { n: 31, s: "General Knowledge / Current Affairs", q: "Microfinance programmes were first created by Nobel prize winning Economist Muhummad Yunus in what decade?", o: ["1960s", "1990s", "1970s", "1950s"], a: 2, e: "", qimg: "" },
  { n: 32, s: "General Knowledge / Current Affairs", q: "Birsa Munda hockey stadium is situated in _________ .", o: ["Jharkhand", "Chhattisgarh", "Haryana", "Odisha"], a: 3, e: "", qimg: "" },
  { n: 33, s: "General Knowledge / Current Affairs", q: "Who among the following was the founder and director of ‘Darpana Academy of Performing Arts’ in Ahmedabad that trains students in dance, drama, music and puppetry?", o: ["Mrinalini Sarabhai", "Padma Subrahmanyam", "Shovana Narayan", "Sonal Mansingh"], a: 0, e: "", qimg: "" },
  { n: 34, s: "General Knowledge / Current Affairs", q: "Which Article of the Constitution of India says that Directive Principles of State Policy are fundamental in the governance of the country and it shall be the duty of the state to apply these in making laws?", o: ["Article 39", "Article 38", "Article 35", "Article 37"], a: 3, e: "", qimg: "" },
  { n: 35, s: "General Knowledge / Current Affairs", q: "As per Census 2011, which of the following states has the highest percentage of Scheduled Tribe population in the country?", o: ["Madhya Pradesh", "Nagaland", "Uttar Pradesh", "Mizoram"], a: 3, e: "", qimg: "" },
  { n: 36, s: "General Knowledge / Current Affairs", q: "The Tungabhadra, the Koyana and the Bhima are major tributaries of which Peninsular river?", o: ["Krishna", "Godavari", "Narmada", "Kaveri"], a: 0, e: "", qimg: "" },
  { n: 37, s: "General Knowledge / Current Affairs", q: "At which place did the Congress declare the resolution of Purna Swaraj in its session in 1929?", o: ["Bombay", "Karachi", "Lahore", "Madras"], a: 2, e: "", qimg: "" },
  { n: 38, s: "General Knowledge / Current Affairs", q: "What is the range of mesosphere?", o: ["0-10 km", "10-30 km", "50-100 km", "50-80 km"], a: 3, e: "", qimg: "" },
  { n: 39, s: "General Knowledge / Current Affairs", q: "The branch of geology exploring how rocks bend in reaction to forces within the Earth’s interior is called:", o: ["basic geology", "mountain geology", "rock geology", "structural geology"], a: 3, e: "", qimg: "" },
  { n: 40, s: "General Knowledge / Current Affairs", q: "Shri Narayana Guru, who belonged to the Ezhava caste, started his social reform movement in the modern state of:", o: ["Maharashtra", "Odisha", "Punjab", "Kerala"], a: 3, e: "", qimg: "" },
  { n: 41, s: "General Knowledge / Current Affairs", q: "The term ‘Takshan’ in the Vedic period was used for ________.", o: ["Carpenter", "Kulapa", "Senani", "Rathakara"], a: 0, e: "", qimg: "" },
  { n: 42, s: "General Knowledge / Current Affairs", q: "General Agreement on Tariffs and Trade was formalised in the year:", o: ["1991", "1947", "2002", "1995"], a: 1, e: "", qimg: "" },
  { n: 43, s: "General Knowledge / Current Affairs", q: "Identify the FALSE statement(s). A. In the context of Green Revolution HYV stands for Hybrid Yielding Variety. B. Fallowing is a practice of leaving land uncultivated for some time for it to regain its fertility.", o: ["Only B", "Only A", "Neither A nor B", "Both A and B"], a: 1, e: "", qimg: "" },
  { n: 44, s: "General Knowledge / Current Affairs", q: "Who is the author of ‘Half Girlfriend and One Indian Girl’?", o: ["Amit Chaudhuri", "Kiran Desai", "Jeet Thayil", "Chetan Bhagat"], a: 3, e: "", qimg: "" },
  { n: 45, s: "General Knowledge / Current Affairs", q: "Muhammad bin Tughlaq appointed Ibn Battuta to the post of the _________ in Delhi.", o: ["Amalguzar", "Qazi", "Shiqdar", "Kotwal"], a: 1, e: "", qimg: "" },
  { n: 46, s: "General Knowledge / Current Affairs", q: "Beti Bachao, Beti Padhao Yojana is a campaign under the Government of India that was established for generating awareness and improving the efficiency of the welfare services intended for ________ in India.", o: ["boys", "girls", "children", "both boys and girls"], a: 1, e: "", qimg: "" },
  { n: 47, s: "General Knowledge / Current Affairs", q: "Nongkrem and Laho are the popular dances of which of the following states?", o: ["Manipur", "Arunachal Pradesh", "Meghalaya", "Assam"], a: 2, e: "", qimg: "" },
  { n: 48, s: "General Knowledge / Current Affairs", q: "Fugdi dance is commonly performed during which of these festivals?", o: ["Ganesh Chaturthi", "Holi", "Navratri", "Deepawali"], a: 0, e: "", qimg: "" },
  { n: 49, s: "General Knowledge / Current Affairs", q: "The Five Kingdom Classification of living organism was first proposed by:", o: ["James A White", "Charles Darwin", "RH Whittaker", "Aristotle"], a: 2, e: "", qimg: "" },
  { n: 50, s: "General Knowledge / Current Affairs", q: "Humayun Tomb, which is located in _________ is an example of Mughal architecture inspired by Persian architecture.", o: ["Bengaluru", "Hyderabad", "Jaipur", "Delhi"], a: 3, e: "", qimg: "" },
  { n: 51, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fifth letter cluster in the same way as the second letter cluster is related to the first letter cluster and the fourth letter cluster is related to the third letter cluster. RJCZ : KPVF :: DJVE : WPOK :: PGCS : ?", o: ["MCJA", "YGBE", "IMVY", "LKSP"], a: 2, e: "", qimg: "" },
  { n: 52, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given figure when the mirror is placed at MN as shown below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "16nov2023-s1-q-52.png" },
  { n: 53, s: "Reasoning / Logical Ability", q: "Three different positions of the same dice are shown. Find the number on the face opposite the face showing ‘2’.", o: ["3", "4", "1", "5"], a: 1, e: "", qimg: "16nov2023-s1-q-53.png" },
  { n: 54, s: "Reasoning / Logical Ability", q: "Two statements are given, followed by two conclusions numbered I and II. Assuming the statements to be true, even if they seem to be at variance with commonly known facts, decide which of the conclusions logically follow(s) from the statements. Statements: All surveys are research. Some surveys are books. Conclusions: I. Some research are surveys. II. All books are research.", o: ["Only Conclusion II follows.", "Only Conclusion I follows.", "Both Conclusions I and II follow.", "Neither Conclusion I nor II follows."], a: 1, e: "", qimg: "" },
  { n: 55, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 1, e: "", qimg: "16nov2023-s1-q-55.png" },
  { n: 56, s: "Reasoning / Logical Ability", q: "Given below is a series of figures – A, B, C and D which follow a particular pattern. Which of the given option figures should come in place of E to continue the series?", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "16nov2023-s1-q-56.png" },
  { n: 57, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'PQ' as shown below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "16nov2023-s1-q-57.png" },
  { n: 58, s: "Reasoning / Logical Ability", q: "Select the figure from the given options that will replace the question mark (?) in the figure given below and complete the pattern.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "16nov2023-s1-q-58.png" },
  { n: 59, s: "Reasoning / Logical Ability", q: "Which two signs should be interchanged to make the given equation correct? 264 ÷ 4 × 7 = 87 − 370 + 5", o: ["= and −", "= and ×", "= and +", "= and ÷"], a: 0, e: "", qimg: "" },
  { n: 60, s: "Reasoning / Logical Ability", q: "Select the correct mirror image of the given combination when the mirror is placed at 'XY' as shown below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "16nov2023-s1-q-60.png" },
  { n: 61, s: "Reasoning / Logical Ability", q: "In a certain code language, ‘BLESSING’ is written as ‘ELJQQFJZ’ and 'OVERNIGHT' is written as ‘RFEJLPFTP’. How will ‘HAMPER’ be written in that language?", o: ["QFNNBJ", "FBKNFP", "PFNKBF", "TBORJE"], a: 2, e: "", qimg: "" },
  { n: 62, s: "Reasoning / Logical Ability", q: "Select the correct combination of mathematical signs to sequentially replace the * signs and to balance the given equation. 98 * 49 * 7 * 74 * 55 * 3", o: ["÷,−, +,×, =", "−, ÷, +, =,×", "−, ÷, +,×, =", "÷,−,×, +, ="], a: 1, e: "", qimg: "" },
  { n: 63, s: "Reasoning / Logical Ability", q: "Three different positions of the same dice are shown. Select the symbol that will be on the face opposite to the face showing ‘L’.", o: ["%", "@", "&", "#"], a: 3, e: "", qimg: "16nov2023-s1-q-63.png" },
  { n: 64, s: "Reasoning / Logical Ability", q: "Select the option that is related to the fourth number in the same way as the first number is related to the second number and the fifth number is related to the sixth number. 1260 : 1890 :: ? : 2160 :: 1882 : 2823", o: ["1280", "1440", "1480", "1860"], a: 1, e: "", qimg: "" },
  { n: 65, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "16nov2023-s1-q-65.png" },
  { n: 66, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["6", "5", "1", "3"], a: 1, e: "", qimg: "16nov2023-s1-q-66.png" },
  { n: 67, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["14", "13", "17", "20"], a: 0, e: "", qimg: "16nov2023-s1-q-67.png" },
  { n: 68, s: "Reasoning / Logical Ability", q: "Which of the following letter clusters will replace the question mark (?) in the given series to make it logically complete? IKN, GHL, EEJ, CBH, ?", o: ["AZF", "AXE", "AYF", "AYE"], a: 2, e: "", qimg: "" },
  { n: 69, s: "Reasoning / Logical Ability", q: "Select the figure that will come next in the following figure series.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "16nov2023-s1-q-69.png" },
  { n: 70, s: "Reasoning / Logical Ability", q: "Which figure should replace the question mark (?) if the series were to be continued?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "16nov2023-s1-q-70.png" },
  { n: 71, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "16nov2023-s1-q-71.png" },
  { n: 72, s: "Reasoning / Logical Ability", q: "Select the number from among the given options that can replace the question mark (?) in the following series. 10, 18, 42, 114, 330, ?", o: ["978", "876", "678", "545"], a: 0, e: "", qimg: "" },
  { n: 73, s: "Reasoning / Logical Ability", q: "L, M, N, O, P, R and S are sitting in a straight row, facing north. O is exactly between L and N. M is exactly between S and P. Only two people sit to the left of O. Who among the following sits at the extreme left end of the row?", o: ["L", "S", "P", "R"], a: 3, e: "", qimg: "" },
  { n: 74, s: "Reasoning / Logical Ability", q: "Select the set in which the numbers are related in the same way as are the numbers of the following sets. (NOTE : Operations should be performed on the whole numbers, without breaking down the numbers into its constituent digits. E.g. 13 – Operations on 13 such as adding /deleting /multiplying etc. to 13 can be performed. Breaking down 13 into 1 and 3 and then performing mathematical operations on 1 and 3 is not allowed.) (63, 9, 27) (105, 15, 45)", o: ["(149, 21, 63)", "(149, 21, 65)", "(147, 21, 65)", "(147, 21, 63)"], a: 3, e: "", qimg: "" },
  { n: 75, s: "Reasoning / Logical Ability", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "16nov2023-s1-q-75.png" },
  { n: 76, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["1", "2", "3", "4"], a: 3, e: "", qimg: "16nov2023-s1-q-76.png" },
  { n: 77, s: "Numerical Ability (Quantitative Aptitude)", q: "A person buys a car at 25% discount on the marked price and sells it at 20% higher than the marked price. What is the actual gain percentage?", o: ["40%", "60%", "25%", "20%"], a: 1, e: "", qimg: "" },
  { n: 78, s: "Numerical Ability (Quantitative Aptitude)", q: "A sum of ₹9,500 becomes ₹11,704.95 in 2 years at compound interest. What is the rate of interest?", o: ["1", "2", "3", "4"], a: 0, e: "", qimg: "16nov2023-s1-q-78.png" },
  { n: 79, s: "Numerical Ability (Quantitative Aptitude)", q: "If 3x ∶ y ∶ 2z = 6 ∶ 5 ∶ 4 and 5x - 3y + 4z = 48, then find the value of 2z.", o: ["64", "48", "60", "54"], a: 0, e: "", qimg: "" },
  { n: 80, s: "Numerical Ability (Quantitative Aptitude)", q: "Select the correct option based on the image given below.", o: ["5%", "4%", "6%", "7%"], a: 0, e: "", qimg: "16nov2023-s1-q-80.png" },
  { n: 81, s: "Numerical Ability (Quantitative Aptitude)", q: "The area of a triangle whose sides are of lengths 5 cm, 6 cm and 8 cm is:", o: ["10.92 cm2", "18.92 cm2", "16.89 cm2", "14.98 cm2"], a: 3, e: "", qimg: "" },
  { n: 82, s: "Numerical Ability (Quantitative Aptitude)", q: "A has completed two-third of a job in 8 days, and B completes the rest of the job in 20 days. In how many days can they together complete the job?", o: ["20", "12", "10", "8"], a: 2, e: "", qimg: "" },
  { n: 83, s: "Numerical Ability (Quantitative Aptitude)", q: "The radius and height of a cone are 4 cm and 3 cm, respectively. Find the volume of the cone.", o: ["12π cm3", "16π cm3", "8π cm3", "48π cm3"], a: 1, e: "", qimg: "" },
  { n: 84, s: "Numerical Ability (Quantitative Aptitude)", q: "If Ram gets a discount of 12% on the marked price of a fan, he saves ₹600. How much did Ram pay for the fan?", o: ["₹4,400", "₹3,300", "₹3,600", "₹4,600"], a: 0, e: "", qimg: "" },
  { n: 85, s: "Numerical Ability (Quantitative Aptitude)", q: "Twin prime numbers are the prime numbers whose difference is always equal to 2. The number of twin primes between 35 and 100 is:", o: ["3", "4", "1", "2"], a: 0, e: "", qimg: "" },
  { n: 86, s: "Numerical Ability (Quantitative Aptitude)", q: "A 300 m long train crosses a platform which is five times of its length, in 7 minutes 40 sec. What is the speed of the train?", o: ["1", "2", "3", "4"], a: 2, e: "", qimg: "16nov2023-s1-q-86.png" },
  { n: 87, s: "Numerical Ability (Quantitative Aptitude)", q: "Three numbers which are co-prime to each other are such that the product of the first two is 391 and that of the last two is 943. Find the middle number.", o: ["17", "23", "41", "19"], a: 1, e: "", qimg: "" },
  { n: 88, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the average of the following numbers? 4, 3, 7, −3, 0, −5, −7, 5, −6, 0, −4, 6", o: ["4", "2", "1", "0"], a: 3, e: "", qimg: "" },
  { n: 89, s: "Numerical Ability (Quantitative Aptitude)", q: "What is the smallest number which, when divided by 15, 17 and 19, leaves remainder 4, 6 and 8, respectively?", o: ["4845", "4548", "4832", "4834"], a: 3, e: "", qimg: "" },
  { n: 90, s: "Numerical Ability (Quantitative Aptitude)", q: "Venu invested a certain amount in shares. The shares rose by 25% on the first day, fell by 8% on the second day and fell by 10% the next day. The percentage profit or loss made by Venu is:", o: ["4.5%, profit", "4.5%, loss", "3.5%, profit", "3.5%, loss"], a: 2, e: "", qimg: "" },
  { n: 91, s: "Computer Awareness / Fundamentals", q: "Which of the following devices is most commonly used to connect multiple computers within a Local Area Network (LAN) and also efficiently manage data traffic by only sending data to the device it is intended for?", o: ["Switch", "Gateway", "Router", "Modem"], a: 0, e: "", qimg: "" },
  { n: 92, s: "Computer Awareness / Fundamentals", q: "How do you access the ‘Save As’ function in MS Word 365?", o: ["By clicking on the ‘Save’ icon", "By going to the File tab and selecting ‘Save As’", "By using the keyboard shortcut ‘Ctrl + S’", "By right-clicking on the document and selecting ‘Save As’"], a: 1, e: "", qimg: "" },
  { n: 93, s: "Computer Awareness / Fundamentals", q: "Which of the following shortcut keys is used to open the help tab in the menu bar in MS Word 365?", o: ["F12", "F1", "F4", "F2"], a: 1, e: "", qimg: "" },
  { n: 94, s: "Computer Awareness / Fundamentals", q: "The symbol which is used to separate the user name and email server parts of an email is:", o: ["@", "$", "%", "#"], a: 0, e: "", qimg: "" },
  { n: 95, s: "Computer Awareness / Fundamentals", q: "In MS-Excel 365, which option allows you to sort data based on multiple columns simultaneously?", o: ["AutoFilter", "Quick Sort", "Custom Sort", "Sort A to Z"], a: 2, e: "", qimg: "" },
  { n: 96, s: "Computer Awareness / Fundamentals", q: "How can you delete a row or column in MS-Excel 365?", o: ["Use the Ctrl+D keyboard shortcut.", "Right-click on the row or column and choose ‘Delete’ from the context menu.", "Use the Ctrl+H keyboard shortcut.", "Go to the ‘Insert’ tab on the Excel ribbon and click on ‘Delete’."], a: 1, e: "", qimg: "" },
  { n: 97, s: "Computer Awareness / Fundamentals", q: "What is the purpose of the ‘Center Align’ text alignment option in Microsoft Word 365?", o: ["It aligns the text along the right margin", "It centres the text horizontally between the margins", "It aligns the text along the left margin", "It adds extra spacing between words"], a: 1, e: "", qimg: "" },
  { n: 98, s: "Computer Awareness / Fundamentals", q: "In MS Word 365 how can you access the spelling and grammar check feature in Microsoft Word?", o: ["Go to the ‘Home’ tab and click on ‘Spelling & Grammar’", "Go to the ‘Insert’ tab and click on ‘Spelling & Grammar’", "Go to the ‘Review’ tab and click on ‘Spelling & Grammar’", "Go to the ‘View’ tab and click on ‘Spelling & Grammar’"], a: 2, e: "", qimg: "" },
  { n: 99, s: "Computer Awareness / Fundamentals", q: "Which of the following tabs on the ribbon in MS Word 365 provides options for formatting text, such as font style and size?", o: ["Insert", "File", "Home", "Page Layout"], a: 2, e: "", qimg: "" },
  { n: 100, s: "Computer Awareness / Fundamentals", q: "In MS Excel 365, which cell reference type allows the cell reference in the formula to reflect the new location after a formula is copied and pasted to another cell?", o: ["Mixed cell reference", "Absolute cell reference", "Relative cell reference", "Circular cell reference"], a: 2, e: "", qimg: "" }
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

  const TEST_TITLE = "Delhi Police Constable - 16 Nov 2023 Shift-1";
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
