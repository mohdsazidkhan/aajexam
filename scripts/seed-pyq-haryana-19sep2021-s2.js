/**
 * Seed: Haryana Police Constable (Female) - 19 Sep 2021 Shift-2
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

const TAGS = ["Haryana Police", "Constable", "PYQ", "2021", "Haryana Police Constable (Female) - 19 Sep 2021 Shift-2"];
const RAW = [
  { n: 1, s: "General Studies", q: "Hundred Years War was fought during 1337-1453 between", o: ["Russia-England", "Russia-France", "England-France", "England-America"], a: 2 },
  { n: 2, s: "General Science", q: "The most abundant of all the cells in blood are", o: ["Neutrophils", "Erythrocytes", "Thrombocytes", "Leucocytes"], a: 1 },
  { n: 3, s: "Numerical Ability", q: "Two ships are sailing in the sea on the two sides of a lighthouse. The angle of elevation of the top of the lighthouse observed from the ships are 30 degrees and 45 degrees respectively. If the lighthouse is 100 m high, the distance between the two ships is", o: ["200 m", "173 m", "273 m", "300 m"], a: 2 },
  { n: 4, s: "General Studies", q: "In visual representation of a painting Germania wears a crown of Oak leaves, as the German Oak stands for", o: ["Rich heritage", "Diversity", "Heroism", "Patriotism"], a: 2 },
  { n: 5, s: "Reasoning", q: "Four ladies A, B, C and D and Four gentlemen E, F, G and H are sitting in a circle around a table facing each other. No two ladies or gentlemen are sitting side by side. C who is sitting between G and E is facing D. F is between D and A and facing G. H is to the right of B. Who is sitting left of A?", o: ["E", "H", "G", "F"], a: 3 },
  { n: 6, s: "Numerical Ability", q: "Three unbiased coins are tossed. What is the probability of getting at most two heads?", o: ["7/8", "1/4", "3/8", "3/4"], a: 0 },
  { n: 7, s: "General Science", q: "The power of accommodation of the eye usually decreases with ageing. This condition is called as", o: ["Astigmatism", "Myopia", "Hypermetropia", "Presbyopia"], a: 3 },
  { n: 8, s: "Haryana GK", q: "Haryana had only __________ police range/s when it separated from Punjab.", o: ["Six", "Zero", "Two", "One"], a: 2 },
  { n: 9, s: "General Studies", q: "The name of the customs union formed in 1834 at the initiative of Prussia and joined by most of the German States is", o: ["Zollverein", "National Assembly", "National Guards", "Estate General"], a: 0 },
  { n: 10, s: "Numerical Ability", q: "A batsman scored 110 runs which included 3 boundaries and 8 sixes. What percent of his total score did he make by running between the wickets?", o: ["55%", "54 6/11 %", "45%", "45 5/11 %"], a: 3 },
  { n: 11, s: "Reasoning", q: "Rama ranks 16th from the top and 15th from the bottom in a certain examination. How many students are there in the class?", o: ["33", "30", "32", "31"], a: 1 },
  { n: 12, s: "General Studies", q: "The election system in which the candidate who is ahead of others, who crosses the winning post first of all, is the winner is called", o: ["Dual party system", "Plurality system", "Indirect democracy", "Direct democracy system"], a: 1 },
  { n: 13, s: "General Science", q: "Malfunctioning of kidneys can lead to accumulation of urea in blood, which is called as", o: ["Lardosis", "Uremia", "Dialysis", "Uricomia"], a: 1 },
  { n: 14, s: "General Science", q: "The device that can detect the presence of a current in a circuit is", o: ["Diode", "Voltmeter", "Resistor", "Galvanometer"], a: 3 },
  { n: 15, s: "General Studies", q: "In which among the cases police can arrest a person without a warrant?", o: ["When his presence in the court is assured", "Any person commits a non-cognizable offense", "Has committed an offense punishable with imprisonment for a term lesser than 7 years", "Has committed an offense punishable with imprisonment for a term more than 7 years"], a: 3 },
  { n: 16, s: "Current Affairs", q: "The International Military-Technical Forum \"ARMY 2021\" was inaugurated at", o: ["Gurugram, Haryana", "Kubinka, Moscow", "Ratnaputra, Sabaragamuwa", "None of the above"], a: 1 },
  { n: 17, s: "Haryana GK", q: "Haryana has ________ district jails.", o: ["16", "13", "15", "14"], a: 0 },
  { n: 18, s: "General Studies", q: "The Viceroy who took initiative in creating elected local government bodies", o: ["Lord Harding", "Lord Litton", "Lord Warren Hastings", "Lord Rippon"], a: 3 },
  { n: 19, s: "General Studies", q: "The Council of Ministers is collectively responsible to the", o: ["Lok Sabha", "Rajya Sabha", "Prime Minister", "None of the above"], a: 0 },
  { n: 20, s: "Computer Knowledge", q: "A ________ is the smallest unit of data, the computer can represent.", o: ["Word", "Bit", "Nibble", "Tables"], a: 1 },
  { n: 21, s: "General Science", q: "________ reacts violently with cold water.", o: ["Magnesium", "Mercury", "Calcium", "Potassium"], a: 3 },
  { n: 22, s: "General Studies", q: "Section 159 of Code of Criminal Procedure, 1973 (Cr PC) empowers the Magistrate", o: ["to order magisterial inquiry", "to restrain police investigation", "both (A) and (B)", "none of the above"], a: 0 },
  { n: 23, s: "Numerical Ability", q: "The ratio between the length and the breadth of a rectangular park is 3 : 2. If a man cycling along the boundary of the park at the speed of 12 km/hr completes one round in 8 minutes, then the area of the park (in sq. meters) is", o: ["15360", "307200", "30720", "153600"], a: 3 },
  { n: 24, s: "Haryana GK", q: "The total number of Parliamentary seats in Haryana is", o: ["15", "12", "10", "None of the above"], a: 2 },
  { n: 25, s: "General Science", q: "Cardiac muscle tissue is a contractile tissue present only in", o: ["Liver", "Heart", "Pancreas", "Kidney"], a: 1 },
  { n: 26, s: "Current Affairs", q: "In a first, India started the cultivation of Asafoetida in", o: ["Cold Deserts of Himachal Pradesh", "Cold Deserts of Uttarakhand", "Cold Deserts of Ladakh", "None of the above"], a: 0 },
  { n: 27, s: "Haryana GK", q: "The State Finger Print Bureau was founded in Haryana in", o: ["1997", "1972", "1991", "1975"], a: 3 },
  { n: 28, s: "General Science", q: "What is the other name for bread mould?", o: ["Yeast", "Penicillium", "Peziza", "Rhizopus"], a: 3 },
  { n: 29, s: "Current Affairs", q: "The members of USMCA (which replaced NAFTA) are", o: ["United States-Mexico-Canada", "United Kingdom-Mexico-Canada", "United States-Mongolia-Canada", "None of the above"], a: 0 },
  { n: 30, s: "General Studies", q: "What is the maximum strength of the Lok Sabha envisaged by the Constitution of India?", o: ["544", "545", "552", "None of the above"], a: 2 },
  { n: 31, s: "Haryana GK", q: "The State tree of Haryana is", o: ["Ficus Benghalensis", "Ficus Religiosa", "Ficus Racemosa", "None of the above"], a: 1 },
  { n: 32, s: "Reasoning", q: "In how many different ways can the letters of the word 'LEADING' be arranged in such a way that the vowels always come together?", o: ["360", "5040", "720", "480"], a: 2 },
  { n: 33, s: "Current Affairs", q: "Who among the following Indian wrestlers has won the 150lb (68kg) FloWrestling invitational meet in Austin, Texas?", o: ["Bajrang Punia", "Sakshi Malik", "Vinesh Phogat", "None of the above"], a: 0 },
  { n: 34, s: "Haryana GK", q: "Haryana Roadways Engineering Corporation (HREC) is situated at", o: ["Sirsa", "Gurugram", "Panchkula", "Faridabad"], a: 2 },
  { n: 35, s: "Reasoning", q: "If P is taller than Q but shorter than R, S is shorter than R but taller than P and T is shorter than R, then the tallest is", o: ["T", "R", "Q", "P"], a: 1 },
  { n: 36, s: "Computer Knowledge", q: "____________ are the links to the pages within your own website.", o: ["Text link", "External links", "Uniform Resource Locator (URL)", "Internal links"], a: 3 },
  { n: 37, s: "Reasoning", q: "Which value replaces \"?\" in the following figure? (Three circles: circle 1 - top 42, left 3, right 15, bottom 6, centre 2; circle 2 - top 36, left 3, right 9, bottom 9, centre ?; circle 3 - top 38, left 10, right 20, bottom 19, centre 0.)", o: ["1", "4", "3", "2"], a: 3 },
  { n: 38, s: "Haryana GK", q: "Which of the following cities in the Haryana will be developed as a Smartest city?", o: ["Gurugram", "Sirsa", "Sonipat", "None of the above"], a: 0 },
  { n: 39, s: "Numerical Ability", q: "In a right angled triangle, if the length of base is 8 cm and height is 6 cm, then the length of hypotenuse is", o: ["10 cm", "14 cm", "2 cm", "48 cm"], a: 0 },
  { n: 40, s: "Haryana GK", q: "____________ got the title of Shamsul Ulema in 1904 by the then British Govt.", o: ["Banabhatta", "Balamukund Gupta", "Altaf Husain Hali", "Surdas"], a: 2 },
  { n: 41, s: "Haryana GK", q: "What is the population density of Haryana as per census, 2011?", o: ["855 persons per sq. km", "666 persons per sq. km", "573 persons per sq. km", "733 persons per sq. km"], a: 3 },
  { n: 42, s: "Reasoning", q: "Select the correct answer to continue the series. D I L Q T Y B G ?", o: ["J", "O", "H", "I"], a: 2 },
  { n: 43, s: "Reasoning", q: "19 is related to 361 in the same way 21 is related to", o: ["400", "324", "441", "None of these"], a: 2 },
  { n: 44, s: "Haryana GK", q: "Which of the following Agricultural Universities of Haryana has developed the disease resistant Pea variety HFP-1428?", o: ["ICAR-National Dairy Research Institute, Karnal", "Chaudhary Charan Singh Haryana Agricultural University, Hisar", "Maharana Pratap Horticultural University, Karnal", "None of the above"], a: 1 },
  { n: 45, s: "Haryana GK", q: "Sur Samman Award of Haryana is given in which field?", o: ["Cinema", "Sports", "Literature", "Agriculture"], a: 2 },
  { n: 46, s: "General Studies", q: "Sections 39 and 40 of Code of Criminal Procedure, 1973 (Cr PC) make it mandatory to give information regarding commission of certain offences. Such information can be given to", o: ["local TV channel", "a lawyer", "either to a Magistrate or to a police officer", "a police officer only"], a: 2 },
  { n: 47, s: "Reasoning", q: "The positions of the first and second digits in the number 9 4 3 1 6 8 7 5 are interchanged. Similarly, the positions of the third and fourth digits are interchanged and so on. Which of the following will be the third to the left of the seventh digit from the left end after the rearrangement?", o: ["4", "1", "6", "None of these"], a: 0 },
  { n: 48, s: "Reasoning", q: "Choose the correct option for x in the following sequence. 1, 4, 9, 16, x", o: ["25", "20", "18", "22"], a: 0 },
  { n: 49, s: "General Science", q: "Which type of reproduction is seen in Hydra?", o: ["Budding", "Fission", "Regeneration", "Fragmentation"], a: 0 },
  { n: 50, s: "Reasoning", q: "Select the related word from the given alternatives. West : North-East :: South : ?", o: ["East", "North", "North-West", "South-East"], a: 2 },
  { n: 51, s: "Numerical Ability", q: "The difference between a two digit number and the number obtained by interchanging the positions of its digits is 36. What is the difference between the two digits of that number?", o: ["3", "cannot be determined", "9", "4"], a: 3 },
  { n: 52, s: "Haryana GK", q: "Haryana Police Academy (HPA) at Madhuban has been imparting training to the IPS Probationers of Haryana since", o: ["1999", "1966", "1988", "1977"], a: 3 },
  { n: 53, s: "Reasoning", q: "How many 9's are there in the following number series, which are immediately preceded by 3 and followed by 6? 3 9 6 9 3 9 3 9 3 9 6 3 6 3 9 5 6 9 5 6 9 3 9 6 3 9", o: ["2", "3", "4", "None of these"], a: 0 },
  { n: 54, s: "General Science", q: "Glycosidic bond is formed by the process of", o: ["Annotation", "Dehydration", "Hydration", "Rehydration"], a: 1 },
  { n: 55, s: "Computer Knowledge", q: "Database entries are called", o: ["Form", "Fields", "Records", "Tables"], a: 2 },
  { n: 56, s: "Computer Knowledge", q: "Each table appears as a spreadsheet grid called", o: ["Datasheet", "Queries", "Record", "Tables"], a: 0 },
  { n: 57, s: "Reasoning", q: "There are six persons A, B, C, D, E and F. C is the sister of F. B is the brother of E's husband. D is the father of A and grandfather of F. There are two fathers, three brothers and a mother in the group. Who is the mother?", o: ["E", "A", "C", "D"], a: 0 },
  { n: 58, s: "Computer Knowledge", q: "When _____ bits are grouped together as a unit, they form a byte.", o: ["8", "5", "6", "4"], a: 0 },
  { n: 59, s: "Numerical Ability", q: "log(root 8) / log 8 is equal to", o: ["1/8", "1/root8", "1/2", "1/4"], a: 2 },
  { n: 60, s: "General Science", q: "Which among the following has a larger refractive index?", o: ["Diamond", "Ice", "Ruby", "Carbon"], a: 0 },
  { n: 61, s: "Computer Knowledge", q: "A _____ is a column in a table that contains a specific piece of information within a record.", o: ["Field", "Datasheet", "Reports", "Filter"], a: 0 },
  { n: 62, s: "Haryana GK", q: "The South range of Haryana Police does not include which among the following districts?", o: ["Palwal", "Rewari", "Jhajjar", "Mahendragarh"], a: 2 },
  { n: 63, s: "Reasoning", q: "Pointing to the woman in the picture Rajiv said, \"Her mother has only one grandchild whose mother is my wife\". How is the woman in the picture related to Rajiv?", o: ["Data inadequate", "Sister", "Cousin", "Wife"], a: 3 },
  { n: 64, s: "General Science", q: "Proteins with catalytic power are named as", o: ["Acids", "Enzymes", "Bases", "Hormones"], a: 1 },
  { n: 65, s: "Haryana GK", q: "Haryana has ______ paramilitary battalions funded by the Central Government that are called the India Reserve Battalions.", o: ["3", "1", "4", "2"], a: 3 },
  { n: 66, s: "Numerical Ability", q: "Pipes A and B can fill a tank in 5 and 6 hrs respectively. Pipe C can empty it in 12 hrs. If all the three pipes are opened together, then the tank will be filled in", o: ["4 1/2 hrs", "1 13/17 hrs", "3 9/17 hrs", "3 8/11 hrs"], a: 2 },
  { n: 67, s: "General Studies", q: "Punjab Police Rules were framed in", o: ["1966", "1934", "1954", "1944"], a: 1 },
  { n: 68, s: "General Science", q: "An electric iron of resistance 20 ohm takes a current of 5 A. The heat developed in 30 s is", o: ["0.4 x 10^4 J", "3.5 x 10^4 J", "1.5 x 10^4 J", "2.4 x 10^4 J"], a: 2 },
  { n: 69, s: "Haryana GK", q: "The First Computer Center of Haryana Police came into existence in the year 1979 at", o: ["Chandigarh", "Gurugram", "Faridabad", "Karnal"], a: 3 },
  { n: 70, s: "Reasoning", q: "Six friends P, Q, R, S, T and U are members of a club and play a different game of Football, Cricket, Tennis, Basketball, Badminton and Volleyball. T who is taller than P and S plays Tennis. The tallest among them plays Basketball. The shortest among them plays Volleyball. Q and S neither play Volleyball nor Basketball. R plays Volleyball. T is between Q who plays Football and P in order of height. Who among them plays Basketball?", o: ["U", "S", "Q", "R"], a: 0 },
  { n: 71, s: "Computer Knowledge", q: "A ______ is an entire database list of information.", o: ["Fields", "Form", "Table", "Records"], a: 2 },
  { n: 72, s: "Reasoning", q: "An accurate clock shows 8 O'clock in the morning. Through how many degrees will the hour hand rotate when the clock shows 2 O'clock in the afternoon?", o: ["180 degrees", "144 degrees", "168 degrees", "150 degrees"], a: 0 },
  { n: 73, s: "Current Affairs", q: "The Agricultural Ministry of India recently has signed a Memorandum of Understanding (MoU) with which of the following tech. giants for a pilot project in 100 villages of six states to promote digital agriculture?", o: ["Google", "Microsoft", "Facebook", "None of the above"], a: 1 },
  { n: 74, s: "Computer Knowledge", q: "A complete operating system that works on a desktop computer, notebook computer or a mobile computing device is called ______ operating system.", o: ["Real time", "Server", "Stand-alone", "Mobile"], a: 2 },
  { n: 75, s: "Reasoning", q: "Study the arrangement: F 1 4 K B 5 9 # D R 2 # 7 M G % H V T 3 8 * 1 J A. If all the symbols are dropped, which of the following will be the third to the left of the seventh letter/number from the right?", o: ["M", "G", "D", "R"], a: 0 },
  { n: 76, s: "Computer Knowledge", q: "To locate a web page using a browser, you need to type its ______ in the browser's address or location bar.", o: ["External link", "Hyperlink", "Internal link", "Uniform Resource Locator (URL)"], a: 3 },
  { n: 77, s: "General Science", q: "The decomposition of vegetable matter into compost is an example for", o: ["Replacement reaction", "Redox reaction", "Endothermic reaction", "Exothermic reaction"], a: 3 },
  { n: 78, s: "Numerical Ability", q: "A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is", o: ["8/15", "1/4", "1/10", "7/15"], a: 0 },
  { n: 79, s: "Reasoning", q: "Three positions of a die are given (die faces: first 5-top 3-right 6-front; second 3-top 5-right 4-front; third 5-top 4-right 2-front). Which number is opposite to 5?", o: ["4", "2", "3", "1"], a: 3 },
  { n: 80, s: "Computer Knowledge", q: "The ________ is a special dialog box consisting of all the fields in table.", o: ["Records", "Data form", "Fields", "Tables"], a: 1 },
  { n: 81, s: "Reasoning", q: "Choose the one pair which does not belong to the group.", o: ["22 : 46", "1 : 4", "10 : 24", "8 : 18"], a: 2 },
  { n: 82, s: "Current Affairs", q: "E-Shram portal is a National database of", o: ["Women workers", "Divyang workers", "Unorganised workers", "None of the above"], a: 2 },
  { n: 83, s: "Haryana GK", q: "The Agricultural produce in Haryana is being regulated under", o: ["Haryana Agricultural Produce Markets Act, 1971", "Punjab Agricultural Produce Markets Act, 1981", "Punjab Agricultural Produce Markets Act, 1961", "None of the above"], a: 2 },
  { n: 84, s: "Reasoning", q: "Choose the missing term. BA, DC, FE, ____", o: ["GH", "HG", "IH", "None of these"], a: 1 },
  { n: 85, s: "General Science", q: "24 carat gold is alloyed with either ________ or copper to make it hard which can be used to make ornaments.", o: ["Lead", "Silver", "Zinc", "Tin"], a: 1 },
  { n: 86, s: "Reasoning", q: "At 3:30 p.m., the minute hand of a clock points towards East. Towards which direction the hour hand will point at 9:00 p.m.?", o: ["South-West", "East", "South", "None of these"], a: 2 },
  { n: 87, s: "Numerical Ability", q: "In a group, 50 people speak Hindi, 20 speak Tamil and 10 speak both Hindi and Tamil, then the number of people who speak Hindi or Tamil is", o: ["80", "70", "60", "None of these"], a: 2 },
  { n: 88, s: "General Science", q: "Which of the following is an example of unisexual flower?", o: ["Sunflower", "Papaya", "Mustard", "Hibiscus"], a: 1 },
  { n: 89, s: "Numerical Ability", q: "If the cost of x meters of wire is d rupees, then what is the cost of y meters of wire at the same rate?", o: ["Rs yd/x", "Rs yd", "Rs xy/d", "Rs xd"], a: 0 },
  { n: 90, s: "Haryana GK", q: "How many women Hockey players from Haryana have represented India in Tokyo Olympics 2020 Hockey tournament?", o: ["12", "9", "6", "None of the above"], a: 1 },
  { n: 91, s: "Reasoning", q: "Complete the following analogy. Shoes : Leather : : Rubber : ?", o: ["Chappal", "Plastic", "Latex", "Polythene"], a: 2 },
  { n: 92, s: "Haryana GK", q: "Due to which scheme, Haryana has become the first State in India to implement the use of injectable contraceptives as a family planning measure?", o: ["Gramodaya", "Salamati Scheme", "Antyodaya Aahar Yojna", "Operation Muskan"], a: 1 },
  { n: 93, s: "General Science", q: "Malaria is caused by", o: ["Entamoeba", "Plasmodium", "Trypanosoma", "Paramoecium"], a: 1 },
  { n: 94, s: "Haryana GK", q: "Haryana cabinet has approved implementation of \"Regional Rapid Transport System (RRTS)\" Corridor between", o: ["Rajasthan - Gurugram", "Delhi - Panipat", "Amritsar - Gurugram", "None of the above"], a: 1 },
  { n: 95, s: "General Studies", q: "Which of the following Amendment Acts inserted the \"Fundamental Duties of the Citizens\" in the Indian Constitution?", o: ["42nd Amendment Act", "32nd Amendment Act", "62nd Amendment Act", "None of the above"], a: 0 },
  { n: 96, s: "General Studies", q: "Which of the following statements holds true for the Magistrate's power to send an accused to remand under Section 167 of the Code of Criminal Procedure, 1973?", o: ["If the investigation is not completed within maximum period of 90 days the accused have to be released", "If the investigation is not completed within 60 days he has to be released on bail", "The maximum period of remand in judicial custody cannot exceed 15 days, after that only sending to police custody is possible", "The maximum period of remand in police custody cannot exceed 15 days, after that only sending to judicial custody is possible"], a: 3 },
  { n: 97, s: "Reasoning", q: "P, Q, R, S, T, U and V are sitting on a bench in a park and all are facing East. R is on the immediate right of S. Q is at an extreme end and has T as his neighbour. V is between T and U. S is sitting third from the South end. Which of the following pairs of people are sitting at the extreme ends?", o: ["UQ", "PQ", "RQ", "PT"], a: 1 },
  { n: 98, s: "Haryana GK", q: "Who among the following is known as Kalidas of Haryana?", o: ["Pandit Bhatru Qutbi", "Deepchand Bahman", "Swami Hardev", "Kishan Lal Bhaat"], a: 1 },
  { n: 99, s: "General Studies", q: "Who is the ex-officio Chairman of the Rajya Sabha?", o: ["The Vice President", "The President", "The Prime Minister", "None of the above"], a: 0 },
  { n: 100, s: "Reasoning", q: "If P is a brother of Q, M is a sister of Q and T is a brother of P, then how is Q related to T?", o: ["Data insufficient", "Brother", "Sister", "Brother or sister"], a: 3 }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'HR-POL-CONST' });
  if (!exam) throw new Error('Exam HR-POL-CONST not found — aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Haryana Police Written Exam' });
  if (!pattern) throw new Error('ExamPattern "Haryana Police Written Exam" not found — aborting.');

  const TEST_TITLE = "Haryana Police Constable (Female) - 19 Sep 2021 Shift-2";
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
