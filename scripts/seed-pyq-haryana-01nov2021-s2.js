/**
 * Seed: Haryana Police Constable - 01 Nov 2021 Shift-2
 * Haryana Police Constable written exam (scanned bilingual paper, English version
 * seeded). 100 Q x 1 mark, 4 options, no negative marking. Reuses Exam
 * `HR-POL-CONST` + ExamPattern 'Haryana Police Written Exam'. The scan carried no
 * official key (only unreliable hand-marks) -> answers derived by independent
 * solving; Haryana-state-specific GK falls back to the scan marks.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not found'); process.exit(1); }

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

const TAGS = ["Haryana Police", "Constable", "PYQ", "2021", "Haryana Police Constable - 01 Nov 2021 Shift-2"];
const RAW = [
  { n: 1, s: "General Studies", q: "Which Section of The Code of Criminal Procedure, 1973 deals with sentences which High Courts and Sessions Judges may pass?", o: ["Section 28 of The Code of Criminal Procedure, 1973", "Section 24 of The Code of Criminal Procedure, 1973", "Section 29 of The Code of Criminal Procedure, 1973", "Section 27 of The Code of Criminal Procedure, 1973"], a: 0 },
  { n: 2, s: "Reasoning", q: "Six persons A, B, C, D, E and F are standing in a circle, not necessarily in the same order. B is between F and C. A is between E and D and F is to the left of D. Which of the following is between A and F?", o: ["D", "C", "E", "B"], a: 3 },
  { n: 3, s: "Numerical Ability", q: "The seventh term of the sequence root(3), root(12), root(27), .... is", o: ["root(243)", "147", "243", "root(147)"], a: 3 },
  { n: 4, s: "Computer Knowledge", q: "Microsoft Excel contains many pre-defined or built-in formulas, which are known as", o: ["Relative referencing", "Functions", "Autosum", "Formatting cells"], a: 1 },
  { n: 5, s: "General Studies", q: "When did Akbar set up the Mansabdari system?", o: ["1577 C.E.", "1574 C.E.", "1571 C.E.", "1578 C.E."], a: 1 },
  { n: 6, s: "Numerical Ability", q: "If the surface area of a sphere is 144 pi sq. m, then its volume (in cu. m) is", o: ["300 pi", "316 pi", "188 pi", "288 pi"], a: 3 },
  { n: 7, s: "General Studies", q: "The economic reforms of 'open door' policy were introduced in China by", o: ["Sun-Yat-Sen", "Mao-Tse-Tung", "Deng Xiaoping", "Jin Ping"], a: 2 },
  { n: 8, s: "Numerical Ability", q: "The 12th term of the series 1, 3, 5, 7, .... is", o: ["19", "23", "20", "21"], a: 1 },
  { n: 9, s: "Reasoning", q: "In a row of boys, Anil is 15th from the left and Vishakh is 7th from the right. If they interchange their positions, Vishakh becomes 15th from the right. How many boys are there in the row?", o: ["29", "25", "Cannot be determined", "21"], a: 0 },
  { n: 10, s: "General Studies", q: "Preferential spending on facilities for disadvantaged communities is an example of", o: ["Equality of opportunity", "Affirmative action", "Equal rights", "None of the above"], a: 1 },
  { n: 11, s: "General Science", q: "Larva of Coleoptera is known as", o: ["Grub", "Crub", "Mrub", "Puppa"], a: 0 },
  { n: 12, s: "Numerical Ability", q: "The smallest five digit number which is divisible by 12, 18 and 21 is", o: ["10224", "30256", "10080", "50321"], a: 2 },
  { n: 13, s: "General Science", q: "Compute the heat generated while transferring 96000 Coulomb of charge in one hour through a potential difference of 50 V.", o: ["3.8 x 10^-6 J", "4.8 x 10^6 J", "4.8 x 10^-6 J", "3.8 x 10^6 J"], a: 1 },
  { n: 14, s: "Numerical Ability", q: "The ratio of milk and water in 66 litres of adulterated milk is 5 : 1. Water is added to it to make the ratio 5 : 3. The quantity of water added is", o: ["16.500 litres", "24.750 litres", "22 litres", "20 litres"], a: 2 },
  { n: 15, s: "General Studies", q: "The code name of nuclear bomb dropped by America on Nagasaki was", o: ["Fat Man", "Little Boy", "Little Baby", "None of the above"], a: 0 },
  { n: 16, s: "Reasoning", q: "Which number will come in the place of question mark? 3, 4, 13, 38, 87, ?", o: ["166", "164", "168", "162"], a: 2 },
  { n: 17, s: "Computer Knowledge", q: "In Excel, referring to cells by their column and row labels is called", o: ["Mixed referencing", "Relative referencing", "Absolute referencing", "None of the above"], a: 1 },
  { n: 18, s: "Reasoning", q: "Which number will come in the place of question mark? (Table row 1 = 8, 12, 18; row 2 = 20, 30, ?)", o: ["40", "45", "50", "35"], a: 1 },
  { n: 19, s: "Reasoning", q: "Deepu went 20 m towards east, he turned left and walked 15 m. He turned again right and went 35 m. He again turned right and walked 15 m. How far was he from his starting point?", o: ["60 m", "35 m", "70 m", "None of these"], a: 3 },
  { n: 20, s: "General Science", q: "Example for Emulsifiable concentrates (EC) is", o: ["Tranquilisers", "Endosulfan", "Carbaryl", "Cypermethrin"], a: 1 },
  { n: 21, s: "Numerical Ability", q: "'x' number of men can finish a piece of work in 30 days. If there were 6 men more, the work could be finished in 10 days less. The original number of men is", o: ["6", "10", "15", "12"], a: 3 },
  { n: 22, s: "General Studies", q: "Which among the following IPC Section is related to Offences Relating to Elections?", o: ["354", "509", "498", "171"], a: 3 },
  { n: 23, s: "Current Affairs", q: "International Day of Non-Violence is observed every year on", o: ["1st October", "2nd October", "12th October", "None of the above"], a: 1 },
  { n: 24, s: "General Science", q: "The magnetic field inside a long, straight solenoid carrying current", o: ["increases as we move towards its end", "is infinity", "decreases as we move towards its end", "is uniform (None of the above)"], a: 3 },
  { n: 25, s: "Numerical Ability", q: "100 x 10 - 100 + 2000 / 100 = ?", o: ["780", "920", "29", "920 (979?)"], a: 1 },
  { n: 26, s: "Computer Knowledge", q: "______ command opens a palette of colours from where you can select a colour to apply it as a background shading to the cell containing the insertion point or to any selected part of the table.", o: ["Shading color", "Border color", "Draw table", "Outside border"], a: 0 },
  { n: 27, s: "Reasoning", q: "Statements: 1. All ice-creams are irons. 2. All irons are isotopes. Conclusions: I. All ice-creams are isotopes. II. Some isotopes are ice-creams. Choose the conclusion(s) which best fit(s) logically.", o: ["Both Conclusions I and II follow", "Only Conclusion I follows", "Neither Conclusion I nor II follows", "Only Conclusion II follows"], a: 0 },
  { n: 28, s: "Reasoning", q: "From the given answer figures, select the one in which the question figure is hidden/embedded (rotation is not allowed). (Figure-based question with four figure options.)", o: ["Figure 1", "Figure 2", "Figure 3", "Figure 4"], a: 1 },
  { n: 29, s: "Computer Knowledge", q: "EDI stands for", o: ["Electronic Data on Internet", "Electronic Data Interchange", "Electronic Data Introduction", "Electronic Data Information"], a: 1 },
  { n: 30, s: "General Studies", q: "Which of the following countries is not a permanent member of the United Nations Security Council?", o: ["United Kingdom", "China", "India", "United States of America"], a: 2 },
  { n: 31, s: "General Science", q: "Cancers which spread to other parts of the body and proliferate are called as", o: ["Inactive tumors", "Benign tumors", "Malignant tumors", "None of the above"], a: 2 },
  { n: 32, s: "Numerical Ability", q: "A train, 240 m long crosses a man walking along the line in opposite direction at the rate of 3 kmph in 10 seconds. The speed of the train is", o: ["86.4 kmph", "75 kmph", "83.4 kmph", "63 kmph"], a: 2 },
  { n: 33, s: "Haryana GK", q: "In Haryana, G.D. Goenka University is located at", o: ["Karnal", "Gurugram", "Jind", "Hisar"], a: 1 },
  { n: 34, s: "Numerical Ability", q: "With Rs. 1,000, one can buy 4 pairs of trousers or 8 shirts. What is the amount required to buy 3 pairs of trousers and 3 shirts?", o: ["Rs. 750", "Rs. 562.50", "Rs. 375", "Rs. 1,125"], a: 3 },
  { n: 35, s: "General Studies", q: "Political Rights include", o: ["The right to contest in the election", "Right to vote", "Right to elect representatives", "All the above"], a: 3 },
  { n: 36, s: "Reasoning", q: "If in a certain code, 'CHANNEL' is written as 'XSZMMVO', then how will 'COMPUTER' be written in that code?", o: ["XLNKGFVI", "XLNKFGVI", "XLKNFGVI", "XLNFKGVI"], a: 1 },
  { n: 37, s: "General Science", q: "When phenol is heated with __________, benzene is obtained.", o: ["Zinc dust", "H2SO4", "Nickel", "Na2Cr2O7"], a: 0 },
  { n: 38, s: "Current Affairs", q: "The book titled \"The India Story\" is authored by", o: ["Y. V. Reddy", "Bimal Jalan", "Raghuram Rajan", "None of the above"], a: 1 },
  { n: 39, s: "General Studies", q: "Who carved the Sphinx in Egypt?", o: ["Amorites", "Assyrians", "Papyrus", "None of these"], a: 3 },
  { n: 40, s: "Numerical Ability", q: "Everybody in a room shakes hands with everybody else. The total number of hand shakes is 66. The total number of persons in the room is", o: ["13", "12", "14", "11"], a: 1 },
  { n: 41, s: "General Science", q: "Which of these is not a primary producer?", o: ["Phytoplankton", "Ascaris", "Trees", "Grass"], a: 1 },
  { n: 42, s: "Computer Knowledge", q: "By default, Microsoft PowerPoint (2003) presentation file is saved with _____ extension.", o: [".doc", ".txt", ".JPEG", ".PPT"], a: 3 },
  { n: 43, s: "Reasoning", q: "Complete the following analogy. 11 : 1210 :: ?", o: ["9 : 729", "7 : 1029", "8 : 448", "6 : 216"], a: 3 },
  { n: 44, s: "General Science", q: "Typhoid is caused by", o: ["Anabella typhi", "Shigella typhi", "Plasmodium falciparum", "Salmonella typhi"], a: 3 },
  { n: 45, s: "Current Affairs", q: "World's largest vaccine manufacturer is", o: ["USA", "Russia", "Brazil", "India"], a: 3 },
  { n: 46, s: "General Studies", q: "In India census is carried out once in", o: ["01 year", "10 years", "02 years", "5 years"], a: 1 },
  { n: 47, s: "Current Affairs", q: "Consider the following statements about Pradhan Mantri Vaya Vandana Yojana. I. This is a scheme offered by the Life Insurance Corporation (LIC) of India which gives a guaranteed payout of pension at a specified rate for 10 years. II. It also offers a death benefit in the form of return of purchase price to the nominee.", o: ["Both the statements I and II are correct", "Only the statement I is correct", "Only the statement II is correct", "None of the above"], a: 0 },
  { n: 48, s: "General Studies", q: "A theoretical perspective based on the notion that social events can best be explained in terms of the contribution they make to the continuity of a society is", o: ["Functionalism", "Relativism", "Culturalism", "Socialism"], a: 0 },
  { n: 49, s: "Computer Knowledge", q: "If you want to type in capitals, activate the __________ key by pressing it once.", o: ["Caps lock", "Ctrl", "Alt", "Shift"], a: 0 },
  { n: 50, s: "Reasoning", q: "Three different positions of the same dice are shown (faces seen: 4,1,3 ; 6,2,1 ; 3,1,2). Select the number that will be on the face opposite to the one showing '4'.", o: ["3", "2", "6", "1"], a: 2 },
  { n: 51, s: "General Science", q: "Colloidal __________ is used in curing Kala-azar.", o: ["Albuminoid", "Gold", "Antimony", "Silver"], a: 2 },
  { n: 52, s: "Current Affairs", q: "'Ecowrap' is the research report given by", o: ["Moody", "Centre for Monitoring Indian Economy (CMIE)", "SEBI", "State Bank of India"], a: 3 },
  { n: 53, s: "General Studies", q: "__________ is responsible for investigating and prosecuting cases of white-collar crimes/frauds related to finance.", o: ["CID", "Serious Fraud Investigation Office", "CBI", "Police"], a: 1 },
  { n: 54, s: "Computer Knowledge", q: "PowerPoint allows you to determine the size of the slide by choosing", o: ["Banner", "On-screen show", "35 mm slides", "All of these"], a: 3 },
  { n: 55, s: "Current Affairs", q: "Consider the following statements about One Nation One Ration Card. I. The scheme is aimed at enabling migrant workers and their family members to buy subsidised ration from any fair price shop anywhere in the country under the National Food Security Act, 2013. II. The system identifies a beneficiary through biometric authentication on ePoS devices at fair price shops.", o: ["Both the statements I and II are correct", "Only the statement I is correct", "Only the statement II is correct", "None of the above"], a: 0 },
  { n: 56, s: "Reasoning", q: "Argument: If she loses, she will win. Select the option that is logically consistent.", o: ["She did not lose, she did not win", "She won, she lost", "She did not win, she did not lose", "She did not lose, she won"], a: 2 },
  { n: 57, s: "General Studies", q: "Who was known as Jagadguru Badshah?", o: ["Ali Adil Shah I", "Ali Adil Shah II", "Ibrahim Adil Shah II", "None of these"], a: 2 },
  { n: 58, s: "Reasoning", q: "A painted cube is cut into 729 identical smaller pieces with the minimum number of cuts. How many smaller pieces have no painted face?", o: ["434", "376", "343", "484"], a: 2 },
  { n: 59, s: "General Studies", q: "Which one of the following places is known for 'Chintzes' cloth?", o: ["Burhanpur", "Masulipatnam", "Calicut", "Dhaka"], a: 1 },
  { n: 60, s: "Current Affairs", q: "Which of the following Committees has been constituted to make suggestions on regulation of Primary Urban Co-operative Banks (UCBs)?", o: ["Shashi Tharoor Committee", "Bimal Jalan Committee", "N. S. Vishwanathan Committee", "None of the above"], a: 2 },
  { n: 61, s: "General Studies", q: "It refers to the marriage practice in which the members of a group marry from within the group members", o: ["Exogamy", "Hypergamy", "Endogamy", "Homogamy"], a: 2 },
  { n: 62, s: "Reasoning", q: "Six teachers Abhijit, Binod, Chandan, Dinesh, Emraan and Farhan take Mathematics classes on Monday to Saturday, one teacher per day, taking 2, 3, 4, 5, 6 and 7 classes (not necessarily in order). Binod takes 5 classes but not on Monday or Saturday. Abhijit takes classes on Wednesday but not 3 classes. The teacher who takes 7 classes takes class on Tuesday but is neither Chandan nor Dinesh. The teachers who take 6 and 2 classes take on consecutive days. The one on Saturday doesn't take 6 classes. Chandan takes classes on the day after Farhan. Emraan prefers Tuesday or Friday. What is the total number of classes attended by Dinesh and Emraan?", o: ["Ten", "Four", "Six", "Seven"], a: 0 },
  { n: 63, s: "General Science", q: "Sponges are mostly", o: ["Bipolar", "Asymmetrical", "Polar", "Symmetrical"], a: 1 },
  { n: 64, s: "Current Affairs", q: "With which of the following countries/groupings did India launch a bilateral agreement \"Partnership to Advance Clean Energy (PACE)\"?", o: ["United States of America", "European Union", "Japan", "Australia"], a: 0 },
  { n: 65, s: "Reasoning", q: "A clock uniformly gains two minutes per hour. It is set correctly at 12 o'clock noon. What is the actual time (approximately) when the clock shows 6 o'clock in the evening on the same day?", o: ["5 : 20 p.m.", "5 : 48 p.m.", "6 : 18 p.m.", "5 : 52 p.m."], a: 1 },
  { n: 66, s: "General Studies", q: "The point where ex-ante aggregate demand is equal to ex-ante aggregate supply will be", o: ["Excess supply", "Disequilibrium", "Equilibrium", "Excess demand"], a: 2 },
  { n: 67, s: "General Studies", q: "Inflation can also be seen as", o: ["a reciprocal phenomenon", "a non-recurring phenomenon", "a no-reciprocal phenomenon", "a recurring phenomenon"], a: 3 },
  { n: 68, s: "General Science", q: "Which are membrane bound vesicular structures formed by the process of packaging in the golgi apparatus?", o: ["Lysosomes", "Filosomes", "Lysons", "Lysokines"], a: 0 },
  { n: 69, s: "Reasoning", q: "What should replace the question mark? (Grid rows: A, 7, M, 11, H, 20 ; 9, H, 6, L, 4, N ; 1, G, 13, K, 8, ?)", o: ["O", "I", "T", "P"], a: 3 },
  { n: 70, s: "General Science", q: "What is the movement of free organs/organisms in response to chemicals?", o: ["Phototaxis", "Thermotaxis", "Chemotaxis", "Nastic"], a: 2 },
  { n: 71, s: "Reasoning", q: "If LIGHT can be coded as 1297820, then DARK can be coded as", o: ["4111676", "411811", "412376", "412346"], a: 2 },
  { n: 72, s: "Reasoning", q: "If 5th January 2001 was a Friday, then 25th December 2001 was a", o: ["Wednesday", "Thursday", "Tuesday", "Monday"], a: 2 },
  { n: 73, s: "General Studies", q: "Identify the type of soil related to all of these: i. It is also known as Regur soil. ii. It is generally clayey, deep and impermeable. iii. It retains moisture for a long time.", o: ["Alluvial soil", "Black soil", "Mountain soil", "Red soil"], a: 1 },
  { n: 74, s: "General Studies", q: "Inflation in the price index excluding food, fuel and other volatile components is called as", o: ["Tight inflation", "No inflation", "Core inflation", "None of these"], a: 2 },
  { n: 75, s: "General Studies", q: "It describes how \"any action that is repeated frequently becomes cast into a pattern, which can then be performed again in the future in the same manner and with the same economical effort\"", o: ["Habitualization", "Amalgamation", "Consolidation", "Coalescing"], a: 0 },
  { n: 76, s: "Reasoning", q: "What will be the last digit of the 3rd number from the top when the numbers below are arranged in descending order after reversing the position of the digits within each number? 517, 325, 639, 841, 792", o: ["5", "7", "3", "2"], a: 2 },
  { n: 77, s: "Computer Knowledge", q: "________ refers to the operating system that is self-contained in the device and resident in the ROM.", o: ["Embedded Operating System", "Multiprocessor Operating System", "Batch Processing Operating System", "Multiuser Operating System"], a: 0 },
  { n: 78, s: "General Science", q: "In which of the following fruits are albuminous seeds present?", o: ["Mango", "Apple", "Papaya", "Pear"], a: 2 },
  { n: 79, s: "Reasoning", q: "A + B means A is the daughter of B, A - B means A is the husband of B, A x B means A is the brother of B. If P x Q + R, then which of the following is true?", o: ["P is the father of R", "P is the uncle of R", "P is the son of R", "P is the brother of R"], a: 2 },
  { n: 80, s: "Computer Knowledge", q: "The use of the Internet or other electronic means to harass an individual, a group of individuals, or an organisation is termed", o: ["Pornography", "Cyberspace", "Cyberstalking", "None of these"], a: 2 },
  { n: 81, s: "General Studies", q: "Consider the following statements about Special Economic Zone (SEZ). I. They are industrial zones being set up by the Central and State Governments in different parts of the country to attract foreign companies to invest in India. II. Companies who set up production units in these zones are exempted from taxes for an initial period of three years. Choose the right option.", o: ["Both the statements I and II are correct", "Only the statement II is correct", "Both the statements I and II are incorrect", "Only the statement I is correct"], a: 3 },
  { n: 82, s: "Numerical Ability", q: "The average weight of 12 crewmen in a boat is increased by 1/3 kg, when one of the crewmen whose weight is 55 kg is replaced by a new man. What is the weight of that new man?", o: ["59 kg", "60 kg", "57 kg", "58 kg"], a: 0 },
  { n: 83, s: "Computer Knowledge", q: "An ________ is a collection of system programs that together control the operation of a computer system.", o: ["Memory unit", "Application software", "Operating system", "None of the above"], a: 2 },
  { n: 84, s: "General Studies", q: "The report on children under-nutrition is given by NFHS. NFHS means", o: ["National Fixed Health Survey", "National Family Home Statistics", "National Family Healing Stage", "National Family Health Survey"], a: 3 },
  { n: 85, s: "General Science", q: "The Logistic growth model is considered a more realistic one because", o: ["population becomes limiting sooner or later", "resources become unlimiting sooner or later", "population becomes unlimiting sooner or later", "resources become limiting sooner or later"], a: 3 },
  { n: 86, s: "General Studies", q: "The equation of GDP(MP) is", o: ["C + I + G + X - M", "GDP(MP) - Dep.", "GDP(MP) = R + W + i + profit", "GDP(MP) - NIT"], a: 0 },
  { n: 87, s: "Current Affairs", q: "The United Nations Secretary General is", o: ["Antony Glamark", "Antony Carnad", "Antonio Guterres", "None of the above"], a: 2 },
  { n: 88, s: "General Studies", q: "Which of the following is an important steel city of the United States of America?", o: ["Ohio", "Lorain", "Colorado", "Pittsburgh"], a: 3 },
  { n: 89, s: "Computer Knowledge", q: "__________ is a self-replicating program, which is self-contained and does not require a host program.", o: ["Virus", "Worm", "Malicious code", "Trojan horse"], a: 1 },
  { n: 90, s: "Current Affairs", q: "Who among the following won the Ostrava Open WTA Doubles Title in 2021?", o: ["Sania Mirza and Kaitlyn Christian", "Zhang Shuai and Kaitlyn Christian", "Erin Routliffe and Kaitlyn Christian", "Sania Mirza and Zhang Shuai"], a: 3 },
  { n: 91, s: "English Language", q: "Select the option which best expresses the sentence in passive/active voice: When Rakesh arrived home, police arrested him.", o: ["When Rakesh arrived home, he was arrested by police.", "When Rakesh arrived home, he is arrested by police.", "When Rakesh arrived home, he was being arrested by police.", "When Rakesh arrived home, he had been arrested by police."], a: 0 },
  { n: 92, s: "English Language", q: "Fill in the blank with the appropriate word: I found him standing __________ the crowd.", o: ["in", "among", "besides", "between"], a: 1 },
  { n: 93, s: "English Language", q: "Write the word denoting the sound made by the given noun subject: Hoofs", o: ["clatter", "chatter", "crack", "crackle"], a: 0 },
  { n: 94, s: "English Language", q: "Find the part of the sentence with a grammatical/idiomatic error: The angry at being (a) / left out of the bonanza (b) / is palpable among (c) / employees of the organisation (d).", o: ["is palpable among", "left out of the bonanza", "employees of the organisation.", "The angry at being"], a: 3 },
  { n: 95, s: "English Language", q: "Find which starter(s) can form grammatically correct sentence(s) conveying the same meaning as: Despite trying his best to persuade people to join the campaign, he could not attain success. a. He could not attain.... b. However trying his best... c. In spite of trying...", o: ["Either a or c", "Only b", "Either b or c", "Only a"], a: 0 },
  { n: 96, s: "Hindi", q: "पान, आध, पौन, सवा आदि उदाहरण हैं", o: ["आवृत्तिवाचक विशेषण", "अपूर्णांकबोधक विशेषण", "पूर्णांकबोधक विशेषण", "इनमें से कोई नहीं"], a: 1 },
  { n: 97, s: "Hindi", q: "मूलावस्था, उत्तरावस्था और उत्तमावस्था किसके अंतर्गत आते हैं?", o: ["विशेषण", "संज्ञा", "सर्वनाम", "इनमें से कोई नहीं"], a: 0 },
  { n: 98, s: "Hindi", q: "'ज्ञानवान' पुल्लिंग शब्द है, उसका स्त्रीलिंग रूप है", o: ["ज्ञानवती", "ज्ञानी", "सुज्ञानी", "इनमें से कोई नहीं"], a: 0 },
  { n: 99, s: "Hindi", q: "'आगत' का विलोम शब्द है", o: ["क्रय", "अधिक", "गत", "इनमें से कोई नहीं"], a: 2 },
  { n: 100, s: "Hindi", q: "कर्म कारक किसे कहते हैं?", o: ["जिस व्यक्ति या वस्तु पर क्रिया का प्रभाव या फल पड़ने का बोध होता है।", "संज्ञा या सर्वनाम के जिस रूप से क्रिया के करने वाले का बोध हो।", "संज्ञा या सर्वनाम के जिस रूप से साधन का बोध हो।", "इनमें से कोई नहीं"], a: 0 }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'HR-POL-CONST' });
  if (!exam) throw new Error('Exam HR-POL-CONST not found — aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Haryana Police Written Exam' });
  if (!pattern) throw new Error('ExamPattern "Haryana Police Written Exam" not found — aborting.');

  const TEST_TITLE = "Haryana Police Constable - 01 Nov 2021 Shift-2";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  const questions = RAW.map(r => ({
    questionText: r.q, questionImage: '', options: r.o,
    optionImages: r.o.map(() => ''), correctAnswerIndex: r.a,
    explanation: '', section: r.s, tags: TAGS, difficulty: 'medium'
  }));

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: 2021,
    pyqShift: TEST_TITLE, pyqExamName: 'Haryana Police Constable', questions
  });
  console.log('Created PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
