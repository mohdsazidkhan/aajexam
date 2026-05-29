/**
 * Seed: UP Police Constable - 17 February 2024 Shift-1
 * UP Police Constable (Uttar Pradesh Police Recruitment & Promotion Board).
 * 150 Q × 2 marks = 300 marks, 4 sections (GK 38 / Hindi 37 / Numerical 38 / Reasoning 37),
 * 120 min total, 0.5 negative marking per wrong answer.
 * Uploads question/option images from local _extracted_up_police_17feb2024_s1/ to Cloudinary.
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

const EXTRACTED_DIR = path.resolve(__dirname, '../_extracted_up_police_17feb2024_s1');
const CLOUDINARY_FOLDER = 'aajexam/pyq/up-police-constable-17feb2024-s1';
const F = '17feb2024-s1';

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

const GK  = 'General Knowledge';
const HIN = 'General Hindi';
const NUM = 'Numerical & Mental Ability';
const REA = 'Mental Aptitude / Reasoning';

const KEY = [3, 2, 4, 3, 4, 4, 2, 2, 4, 1, 4, 1, 2, 3, 4, 4, 2, 3, 2, 4, 3, 3, 3, 4, 3, 1, 4, 4, 3, 3, 3, 4, 1, 2, 4, 1, 2, 4, 3, 3, 4, 3, 1, 4, 1, 3, 2, 1, 2, 1, 4, 2, 3, 2, 2, 1, 1, 4, 1, 3, 1, 3, 2, 3, 1, 4, 2, 1, 2, 4, 1, 2, 1, 1, 2, 4, 2, 3, 2, 2, 1, 3, 4, 2, 3, 2, 2, 2, 1, 2, 1, 3, 3, 3, 3, 2, 1, 3, 3, 4, 1, 2, 1, 3, 2, 4, 2, 1, 2, 2, 4, 3, 3, 4, 3, 2, 4, 1, 1, 4, 3, 3, 4, 3, 1, 2, 3, 4, 4, 3, 4, 2, 1, 2, 1, 1, 4, 2, 1, 4, 4, 3, 1, 1, 2, 4, 4, 2, 4, 2];
const RAW = [
  { n: 1, s: `Numerical & Mental Ability`, q: `Study the bar graph and answer the questions based on it.

In how many of the given years was the production of mobiles more than the average production of the given years?`, qi: `image3.jpeg`, o: [`3`, `1`, `4`, `2`], oi: [``, ``, ``, ``], e: `` },
  { n: 2, s: `Numerical & Mental Ability`, q: `In which year was the percentage increase in production as compared to the previous year the maximum ?`, qi: `image4.jpeg`, o: [`2005`, `2002`, `2007`, `2003`], oi: [``, ``, ``, ``], e: `` },
  { n: 3, s: `Numerical & Mental Ability`, q: `What was the approximate percentage decline in the production of mobile from 2003 to 2004 ?`, qi: `image4.jpeg`, o: [`27%`, `21%`, `29%`, `23%`], oi: [``, ``, ``, ``], e: `` },
  { n: 4, s: `Numerical & Mental Ability`, q: `The average production of 2005 and 2006 was exactly equal to the average production of which of the following pairs of years?`, qi: `image4.jpeg`, o: [`2004 and 2006`, `2006 and 2007`, `2002 and 2007`, `2004 and 2005`], oi: [``, ``, ``, ``], e: `` },
  { n: 5, s: `Numerical & Mental Ability`, q: `What was the approximate percentage increase in production of mobile in 2008 compared to that in 2001?`, qi: `image4.jpeg`, o: [`195%`, `166.67%`, `200%`, `183.33%`], oi: [``, ``, ``, ``], e: `` },
  { n: 6, s: `Numerical & Mental Ability`, q: `Choose the correct mirror image of the given figure (X) from amongst the four alternatives.`, qi: `image5.jpeg`, o: [`1`, `2`, `3`, `4`], oi: [``, ``, ``, ``], e: `` },
  { n: 7, s: `Numerical & Mental Ability`, q: `Choose the Venn diagram which best explains relationship among given: Husband, Family, Wife`, qi: `image5.jpeg`, o: [`1.`, `2.`, `3.`, `4.`], oi: [`image7.jpeg`, `image8.jpeg`, `image9.jpeg`, `image10.jpeg`], e: `` },
  { n: 8, s: `Numerical & Mental Ability`, q: `In the given figure if Triangle represents healthy people, Rectangle represents old persons and Circle represents men, then what is the number of those men who are healthy but not old?`, qi: `image13.jpeg`, o: [`6`, `3`, `8`, `5`], oi: [``, ``, ``, ``], e: `` },
  { n: 9, s: `Numerical & Mental Ability`, q: `If ‘+’ stands for division, '÷' stands for multiplication, '×' stands for subtraction and ‘-' stands for addition, the 63 × 24 + 8 ÷ 4 + 2 - 3 = ?`, qi: `image13.jpeg`, o: [`61`, `58`, `63`, `60`], oi: [``, ``, ``, ``], e: `` },
  { n: 10, s: `Numerical & Mental Ability`, q: `Lion : Den :: Rabbit : (?)`, qi: `image13.jpeg`, o: [`Burrow`, `Hole`, `Trench`, `Pit`], oi: [``, ``, ``, ``], e: `` },
  { n: 11, s: `Numerical & Mental Ability`, q: `Que. 11`, qi: `image13.jpeg`, o: [`HURN`, `DUQN`, `EUQM`, `HUQM`], oi: [``, ``, ``, ``], e: `` },
  { n: 12, s: `Numerical & Mental Ability`, q: `How many triangles are there in the following figure ?`, qi: `image13.jpeg`, o: [`12`, `8`, `14`, `10`], oi: [``, ``, ``, ``], e: `` },
  { n: 13, s: `Numerical & Mental Ability`, q: `A person moves in north direction by 9 km, then turns left and moves by 4 km, again turns left and moves by 10 km, again turns left and moves by 4 km. How far the person is from initial position?`, qi: ``, o: [`9 km`, `1 km`, `14 km`, `4 km`], oi: [``, ``, ``, ``], e: `` },
  { n: 14, s: `Numerical & Mental Ability`, q: `In the following question, one word is given, followed by four words, one of which cannot be formed using the letters of the given word. Find that word.
ADMINISTRATION`, qi: ``, o: [`RATION`, `MIND`, `MINISTER`, `STATION`], oi: [``, ``, ``, ``], e: `` },
  { n: 15, s: `Numerical & Mental Ability`, q: `Which one set of letters when sequentially placed at the gaps in the given letter series shall complete it? a_d_an_n_ma_a_d_m_n`, qi: ``, o: [`mnadmna`, `nmaadna`, `nmadnan`, `nmadnna`], oi: [``, ``, ``, ``], e: `` },
  { n: 16, s: `Numerical & Mental Ability`, q: `Choose the correct alternative from given ones that will complete the series.
8, 23, 38, 53, 68, (?)`, qi: ``, o: [`85`, `78`, `87`, `83`], oi: [``, ``, ``, ``], e: `` },
  { n: 17, s: `Numerical & Mental Ability`, q: `Question given below consists of a statement, followed by four arguments numbered I, II, III and IV. You have to decide which of the argument(s) is/are ‘strong’ argument(s) and which is/are 'weak argument(s) and
accordingly choose your answer from the alternatives given below the question:
Statement: Should India go in for computerization in all possible sectors ?
Arguments:
Yes. It will bring efficiency and accuracy in the work.
No. It will be an injustice to the monumental human resources which are at present underutilized.
No. Computerization demands a lot of money. We should not waste money on it.
Yes. When advanced countries are introducing computers in every field, how can India afford to lag behind.`, qi: ``, o: [`Only I and III are strong.`, `Only I is strong.`, `Only II and III are strong.`, `Only I and II are strong.`], oi: [``, ``, ``, ``], e: `` },
  { n: 18, s: `Numerical & Mental Ability`, q: `In the question below a statement followed by two assumptions numbered I and II is given. You have to consider the statement and the following assumptions and decide which of the assumption(s) is/are implicit
in the statement.
Statement : Imprisonment for 27 years made Mihir Kalal the President.
Assumptions:
One who will be imprisoned for 27 years will become the President.
To become the President imprisonment is a qualification.`, qi: ``, o: [`Either I or II is implicit.`, `Only assumption I is implicit.`, `Neither I nor II is implicit.`, `Only assumption II is implicit.`], oi: [``, ``, ``, ``], e: `` },
  { n: 19, s: `Numerical & Mental Ability`, q: `Following are the criteria for selection of computer professionals in an organisation : The candidate must-
be a Computer Engineer or MCA with first class having minimum 65% marks.
have secured at least 50% marks in the Selection Test.
have secured at least 40% marks in the Interview.
not be less than 21 years and not more than 30 years of age as on 1-10-2005. In case of candidate who satisfies all other criteria, except:
At (1) above, but is an Electronics Engineer with 70% marks, the case may be referred to the GM, Recruitment.
At (2) above, but is having at least 2 years' experience of working as a Systems Analyst, the case may be referred to the Chairman, Recruitment Committee.
In each of the following question, information about one candidate is given. You have to analyse it with reference to the above criteria and condition and then decide the appropriate course of action. You are not to assume anything other than the given information. All these cases are given to you as on 1-10-2005.
Modi Jay did MCA in 1998 with 70% marks at the age of 22 years. He scored 55% marks in Interview and 55% marks in the Selection Test. He joined an IIT company in 1999 as programmer and got promoted as Systems Analyst in December 2002.`, qi: ``, o: [`If the case is to be referred to the Chairman, Recruitment Committee.`, `If the candidate is to be selected.`, `If the case is to be referred to the GM, Recruitment.`, `If the candidate is not to be selected.`], oi: [``, ``, ``, ``], e: `` },
  { n: 20, s: `Numerical & Mental Ability`, q: `Sanjay is a Civil Engineer with 75% marks. He was born on 6th July, 1976. He scored 70% marks in the Selection Test and 42% marks in the Interview.`, qi: ``, o: [`If the case is to be referred to the Chairman, Recruitment Committee.`, `If the candidate is to be selected.`, `If the case is to be referred to the GM, Recruitment.`, `If the candidate is not to be selected.`], oi: [``, ``, ``, ``], e: `` },
  { n: 21, s: `Numerical & Mental Ability`, q: `Vijay, a Computer Engineer, passed out with 72% marks in the final examination at the age of 22 years in 2003. He secured 70% marks in the Selection Test and 48% marks in the Interview.`, qi: ``, o: [`If the case is to be referred to the Chairman, Recruitment Committee`, `If the candidate is to be selected.`, `Data inadequate.`, `If the candidate is not to be selected.`], oi: [``, ``, ``, ``], e: `` },
  { n: 22, s: `Numerical & Mental Ability`, q: `Ankit scored 80% marks in B.Sc. (IT) and 78% marks in Electronics Engineering. His scores at the Selection Test and the Interview are 55% and 60% respectively. He has been working as Systems Analyst
since 2001. His date of birth is 19th April, 1980.-`, qi: ``, o: [`If the case is to be referred to the Chairman, Recruitment Committee.`, `If the candidate is to be selected.`, `If the case is to be referred to the GM, Recruitment.`, `If the candidate is not to be selected.`], oi: [``, ``, ``, ``], e: `` },
  { n: 23, s: `Numerical & Mental Ability`, q: `Divya is a Computer Engineer with 80% marks. She scored more than 55% marks in the Interview and the Selection Test. She has worked in XYZ company as a Systems Analyst for more than 5 years.`, qi: ``, o: [`If the case is to be referred to the Chairman, Recruitment Committee.`, `If the candidate is to be selected.`, `Data inadequate.`, `If the candidate is not to be selected.`], oi: [``, ``, ``, ``], e: `` },
  { n: 24, s: `Numerical & Mental Ability`, q: `You are stationed as a police officer, an agitated crowd at a local fair accuses a teenager of theft and attempts mob lynching. You should :`, qi: ``, o: [`make the accused confess under duress.`, `use force to arrest the accused for questioning.`, `let the mob punish the accused if enough proof available.`, `rescue the teenager and disperse the mob to ensure fair trial.`], oi: [``, ``, ``, ``], e: `` },
  { n: 25, s: `Numerical & Mental Ability`, q: `As head of police in a riot-hit mixed religious locality, you should :`, qi: ``, o: [`act tough on miscreants crossing community lines.`, `impose indefinite curfew till tensions subside.`, `engage elders to reconcile groups through dialogue.`, `table concerns with municipal authorities for resolution.`], oi: [``, ``, ``, ``], e: `` },
  { n: 26, s: `Numerical & Mental Ability`, q: `You are stationed as a police officer, you receive reliable information of preparations to violently disrupt upcoming local body elections. You should :`, qi: ``, o: [`mobilize auxiliary police augmentation in vulnerable areas.`, `recommend postponing the electoral process.`, `ban political campaign events and restrict assembly.`, `conduct preventive detentions to avoid subversion.`], oi: [``, ``, ``, ``], e: `` },
  { n: 27, s: `Numerical & Mental Ability`, q: `You are an Investigating officer; the primary accused in a VIP assassination case is offering huge bribes for manipulating evidence and influencing judges to ensure acquittal. You should :`, qi: ``, o: [`pretend to agree but submit weakly fabricated bogus evidence.`, `comply on records but secretly collect dialogue against accused.`, `avoid investigating as per your independent professional judgement.`, `remain uncorrupted and present facts transparently in court.`], oi: [``, ``, ``, ``], e: `` },
  { n: 28, s: `Numerical & Mental Ability`, q: `You are stationed as a police officer; to prevent further cases of card cloning at ATMs, you should :`, qi: ``, o: [`place one observer each in all ATMs to identify suspicious accomplices.`, `temporarily disable all ATMs in the jurisdiction.`, `purchase card cloning machine prototypes to understand methodology.`, `examine ATM machine access logs for anomalies.`], oi: [``, ``, ``, ``], e: `` },
  { n: 29, s: `Numerical & Mental Ability`, q: `You are a constable in a special cell that deals with cyber crimes and online frauds. You have been trained in various aspects of cyber security and digital forensics. However, due to a shortage of staff, you are assigned
to a patrol duty where you have to patrol the streets and respond to emergency calls. You feel that this is a boring and mundane task that does not suit your expertise. You should:`, qi: ``, o: [`do the patrol duty but constantly look for opportunity of taking leave.`, `refuse to do the patrol duty and insist on staying in the cyber cell.`, `do the patrol duty enthusiastically and learn from the experiences of other patrol officers.`, `do the patrol duty reluctantly and complain about it to your superiors and colleagues.`], oi: [``, ``, ``, ``], e: `` },
  { n: 30, s: `Numerical & Mental Ability`, q: `In the climax stage of a nationwide terror manhunt, you learn your only parent suffers a debilitating stroke.You should :
In the climax stage of a nationwide terror manhunt, you learn your only parent suffers a debilitating stroke.
You should :
In the climax stage of a nationwide terror manhunt, you learn your only parent suffers a debilitating stroke.
You should :`, qi: ``, o: [`conceal news avoiding distraction till mission completion.`, `handover reins to accomplished deputy for family priority.`, `commit singular focus expecting siblings to handle parent.`, `remotely coordinate certain areas without Ops leadership.`], oi: [``, ``, ``, ``], e: `` },
  { n: 31, s: `Numerical & Mental Ability`, q: `when investigating rape forensic evidence from victim, you should :`, qi: ``, o: [`focus on Medical test ruthlessly without any women police present.`, `complete documentation along with FIR using pseudo name.`, `transfer to experienced Woman Inspector without direct involvement.`, `personally interview the victim in plain clothes to build trust.`], oi: [``, ``, ``, ``], e: `` },
  { n: 32, s: `Numerical & Mental Ability`, q: `As a police officer, transgender citizens report facing harassment and dignity violations during law enforcement interactions. You should :`, qi: ``, o: [`enforce strict disciplinary actions against offenders.`, `depute gender-rights community volunteers for engagements.`, `take complaint and forward it to Human Rights Commission.`, `implement mass sensitization drives on appropriate conduct.`], oi: [``, ``, ``, ``], e: `` },
  { n: 33, s: `Numerical & Mental Ability`, q: `As a police officer, you notice certain religious minorities being denied neighbourhood entry. You should :`, qi: ``, o: [`organize multi-faith community dialogues to ease tensions.`, `arrest and prosecute housing societies flouting laws.`, `enforce diversity by posting minority community officers.`, `refer complaints to state's minority welfare schemes.`], oi: [``, ``, ``, ``], e: `` },
  { n: 34, s: `Numerical & Mental Ability`, q: `As a police officer, you are assigned to a police station in a district. Which of the following is the name of the officer who is in-charge of the police station ?`, qi: ``, o: [`Superintendent of Police`, `Station House Officer`, `Deputy Inspector General`, `Circle Officer`], oi: [``, ``, ``, ``], e: `` },
  { n: 35, s: `Numerical & Mental Ability`, q: `As a police officer, what would guide your decision-making in enforcing laws?`, qi: ``, o: [`Following the orders of your superiors without questioning their judgment.`, `Strict adherence to the letter of the law, regardless of individual circumstances.`, `Applying personal moral values even if they conflict with established regulations.`, `Balancing legal requirements with empathy and consideration for the situation.`], oi: [``, ``, ``, ``], e: `` },
  { n: 36, s: `Numerical & Mental Ability`, q: `Find suitable alternative in place of question mark (?).
Mother : Child :: Cloud : ?`, qi: ``, o: [`Rain`, `Shine`, `Weather`, `Loud`], oi: [``, ``, ``, ``], e: `` },
  { n: 37, s: `Numerical & Mental Ability`, q: `As a police officer, certain religious customs violate Supreme Court directions on entry of women in places of worship. You should :`, qi: ``, o: [`avoid the situation by taking leaves.`, `enforce directions by removing opposing groups if necessary.`, `sensitize opinion leaders leveraging spiritual heads' assistance.`, `publicly threaten charges against customs upholding court rulings.`], oi: [``, ``, ``, ``], e: `` },
  { n: 38, s: `Mental Aptitude / Reasoning`, q: `Shyam travels 7 km North, then he turns to his right and walks 3 km. He again turns to his right and moves 7 km forward. Now in which direction is he from his starting point?`, qi: ``, o: [`South`, `North`, `West`, `East`], oi: [``, ``, ``, ``], e: `` },
  { n: 39, s: `Mental Aptitude / Reasoning`, q: `In the following question, some words are given. They have some common features except the odd one. You are required to find odd one out.`, qi: ``, o: [`Harass`, `Annoy`, `Ravage`, `Distress`], oi: [``, ``, ``, ``], e: `` },
  { n: 40, s: `Mental Aptitude / Reasoning`, q: `Choose the correct alternative from given ones that will complete the series: 2.3, 15.9, 79.6, 423, 2574, (?)`, qi: ``, o: [`10300`, `5632`, `18067`, `8432`], oi: [``, ``, ``, ``], e: `` },
  { n: 41, s: `Mental Aptitude / Reasoning`, q: `In a certain code language "MADRAS" is written as "OWNHEQ". How will "SUNDAY" be written in that same code ?`, qi: ``, o: [`WUZWYR`, `WUZRYX`, `UWZYWR`, `UWZRYW`], oi: [``, ``, ``, ``], e: `` },
  { n: 42, s: `Mental Aptitude / Reasoning`, q: `Suresh's sister is the wife of Ram. Ram is Rani's brother. Ram's father is Madhur. Sheetal is Ram's grandmother. Rema is Sheetal's daughter - in - law. Rohit is Rani's brother's son. How is Rohit related to
Suresh ?`, qi: ``, o: [`Brother`, `Brother - in - law`, `Nephew`, `Son`], oi: [``, ``, ``, ``], e: `` },
  { n: 43, s: `Mental Aptitude / Reasoning`, q: `If in the word "SPIRITUAL", position of second and fifth letter is interchanged, similarly position of fourth and sixth letter is interchanged with seventh and ninth letters respectively, then how many pair of letters in
the new word have as many letters between them (either forward or backward) as they have in the English alphabet series?`, qi: ``, o: [`5`, `3`, `6`, `4`], oi: [``, ``, ``, ``], e: `` },
  { n: 44, s: `Mental Aptitude / Reasoning`, q: `A clock is started at noon. By 10 minutes past 4, the hour hand has turned through`, qi: ``, o: [`130°`, `120°`, `135°`, `125°`], oi: [``, ``, ``, ``], e: `` },
  { n: 45, s: `Mental Aptitude / Reasoning`, q: `Study the following figure and answer the question given below.
What is represented by the number 7?`, qi: ``, o: [`Married nurses in the hospital`, `Trained nurses`, `Married trained nurses`, `Unmarried trained nurses`], oi: [``, ``, ``, ``], e: `` },
  { n: 46, s: `Mental Aptitude / Reasoning`, q: `Which of the following diagrams best indicates the relation between India, Gujarat, Surat?`, qi: ``, o: [``, `2.`, `3.`, `4.`], oi: [``, `image75.jpeg`, `image77.png`, `image78.jpeg`], e: `` },
  { n: 47, s: `Mental Aptitude / Reasoning`, q: `Solve: 120 ÷ 3 + 8 × 3 - 40 = ?`, qi: ``, o: [`-256`, `24`, `74`, `-24`], oi: [``, ``, ``, ``], e: `` },
  { n: 48, s: `Mental Aptitude / Reasoning`, q: `In a row Mihir is 17th from the left and 19th from the right, then what is the total number of candidates in that row?`, qi: ``, o: [`35`, `36`, `29`, `31`], oi: [``, ``, ``, ``], e: `` },
  { n: 49, s: `Mental Aptitude / Reasoning`, q: `There is a cuboid whose dimensions are 4 × 3 × 3 cm. The opposite faces of dimensions 4 × 3 are coloured yellow. The opposite faces of other dimensions 4 × 3 are coloured red. The opposite faces of dimensions 3 ×
3 are coloured green. Now the cuboid is cut into small cubes of side 1 cm. How many small cubes have three faces coloured?`, qi: ``, o: [`16`, `8`, `20`, `12`], oi: [``, ``, ``, ``], e: `` },
  { n: 50, s: `Mental Aptitude / Reasoning`, q: `In the following question, a word has been given, followed by four other words, one of which can be formed using the letters of the given word. Find that word.
MEASUREMENT`, qi: ``, o: [`RETUNES`, `ASSURE`, `MANTLE`, `SUMMIT`], oi: [``, ``, ``, ``], e: `` },
  { n: 51, s: `Mental Aptitude / Reasoning`, q: `A scientist is trying to recall the access code to a secure laboratory. He remembers the following details:
The code starts with the digit 5.
The code ends with 987.
The second digit is the sum of the first digit and 3.
The third digit is half of the second digit.
Now, considering these conditions, the scientist has narrowed down four potential access codes for the laboratory. Find the suitable one.`, qi: ``, o: [`563987`, `542987`, `548987`, `584987`], oi: [``, ``, ``, ``], e: `` },
  { n: 52, s: `Mental Aptitude / Reasoning`, q: `In the question below two statements followed by three conclusions numbered I, II and III are given. You have to assume everything in the statements to be true, then consider the the three conclusions together and
decide which of them logically follows beyond reasonable doubt from the information given in the statements.
Statements:
Water has no shape, has volume.
The knowledge is like water, flowed from one side to other.
Conclusions:
The knowledge is interdisciplinary.
The knowledge is bound within a specific area.
The knowledge influences the core of mental activity directly.`, qi: ``, o: [`Both I and II follow.`, `Only conclusion I follows.`, `Both I and III follow.`, `Only conclusion II follows.`], oi: [``, ``, ``, ``], e: `` },
  { n: 53, s: `Mental Aptitude / Reasoning`, q: `A is B's sister. C is B's mother. D is C's father. E is D's mother. Then how is A related to D?`, qi: ``, o: [`Daughter`, `Grand mother`, `Grand daughter`, `Grand father`], oi: [``, ``, ``, ``], e: `` },
  { n: 54, s: `Mental Aptitude / Reasoning`, q: `Que. 54`, qi: ``, o: [`1.`, `2.`, `3.`, `4.`], oi: [`image82.jpeg`, `image83.jpeg`, `image84.jpeg`, `image85.jpeg`], e: `` },
  { n: 55, s: `Mental Aptitude / Reasoning`, q: `Find out which of the figures (1), (2), (3) and (4) can be formed from the pieces given in the figure (X).`, qi: ``, o: [`(1)`, `(2)`, `(3)`, `(4)`], oi: [``, ``, ``, ``], e: `` },
  { n: 56, s: `Mental Aptitude / Reasoning`, q: `Find out from amongst the four alternatives as to how the pattern would appear when the transparent sheet is folded at the dotted line.`, qi: `image89.jpeg`, o: [`(3)`, `(1)`, `(4)`, `(2)`], oi: [``, ``, ``, ``], e: `` },
  { n: 57, s: `Mental Aptitude / Reasoning`, q: `Simplify : 108 ÷ 36 × 1 + 2 × 3 1
4	5
4
Que. 57
Simplify : 108 ÷ 36 × 1 + 2 × 3 1
4	5
4`, qi: `image89.jpeg`, o: [`2 1 5`, `1 1 20`, `2 1 11`, `2 1 20`], oi: [``, ``, ``, ``], e: `` },
  { n: 58, s: `Mental Aptitude / Reasoning`, q: `Which of the following option would be meaningful order of the following words?
Exhaust
Night
Day
Sleep
Work`, qi: `image89.jpeg`, o: [`3, 5, 1, 4, 2`, `1, 3, 5, 4, 2`, `3, 5, 2, 1, 4`, `3, 5, 1, 2, 4`], oi: [``, ``, ``, ``], e: `` },
  { n: 59, s: `Mental Aptitude / Reasoning`, q: `Choose the figure which is different from the rest.`, qi: `image89.jpeg`, o: [`(3)`, `(1)`, `(4)`, `(2)`], oi: [``, ``, ``, ``], e: `` },
  { n: 60, s: `Mental Aptitude / Reasoning`, q: `The number of apples in a basket doubles every minute. If the basket is full of apples in an hour, when was the basket half-filled ?`, qi: `image89.jpeg`, o: [`55 minutes`, `38 minutes`, `59 minutes`, `47 minutes`], oi: [``, ``, ``, ``], e: `` },
  { n: 61, s: `Mental Aptitude / Reasoning`, q: `The Great Barrier Reef is located at the coast of which of the following countries?`, qi: ``, o: [`Australia`, `South Africa`, `Philippines`, `Indonesia`], oi: [``, ``, ``, ``], e: `` },
  { n: 62, s: `Mental Aptitude / Reasoning`, q: `Who among the following was the President of the Constituent Assembly of India in 1946 ?`, qi: ``, o: [`Dr. B.R. Ambedkar`, `Sardar Vallabhbhai Patel`, `Dr. Rajendra Prasad`, `Jawaharlal Nehru`], oi: [``, ``, ``, ``], e: `` },
  { n: 63, s: `Mental Aptitude / Reasoning`, q: `The "Prayaga Prashasti" had been composed by whom among the following in Sanskrit ?`, qi: ``, o: [`Bhavabhuti`, `Harishena`, `Baudhayana`, `Banabhatta`], oi: [``, ``, ``, ``], e: `` },
  { n: 64, s: `Mental Aptitude / Reasoning`, q: `Which of the following is the largest salt water lagoon lake situated at the Eastern coast of India ?`, qi: ``, o: [`The Lonar Crater Lake`, `The Kolleru Lake`, `The Chilika Lake`, `The Panchbhadra Salt Lake`], oi: [``, ``, ``, ``], e: `` },
  { n: 65, s: `Mental Aptitude / Reasoning`, q: `The white light is composed of how many colours ?`, qi: ``, o: [`Seven`, `Five`, `Eight`, `Six`], oi: [``, ``, ``, ``], e: `` },
  { n: 66, s: `Mental Aptitude / Reasoning`, q: `Sri Lanka is separated from India by a narrow channel of sea formed by which of the following ?`, qi: ``, o: [`The Makassar Strait`, `The Eight Degree Channel`, `The Strait of Messina`, `The Palk Strait and the Gulf of Mannar`], oi: [``, ``, ``, ``], e: `` },
  { n: 67, s: `Mental Aptitude / Reasoning`, q: `The Sonepur Cattle Fair is a cultural event held at which of the following states of India every year ?`, qi: ``, o: [`Sikkim`, `Bihar`, `Odisha`, `Assam`], oi: [``, ``, ``, ``], e: `` },
  { n: 68, s: `Mental Aptitude / Reasoning`, q: `The cultivation, growing and harvesting of grapes is known as which of the following ?`, qi: ``, o: [`Viticulture`, `Sericulture`, `Horticulture`, `Pisciculture`], oi: [``, ``, ``, ``], e: `` },
  { n: 69, s: `Mental Aptitude / Reasoning`, q: `The Bailadila hills look like the hump of an ox. This range of hills is situated in which of the following states of India?`, qi: ``, o: [`Kerala`, `Chhattisgarh`, `Karnataka`, `Tamil Nadu`], oi: [``, ``, ``, ``], e: `` },
  { n: 70, s: `Mental Aptitude / Reasoning`, q: `What is the highest post for Census Organisation in India?`, qi: ``, o: [`Deputy Registrar General`, `Census Officer`, `Sr. Technical Director`, `Registrar General & Census Commissioner, India`], oi: [``, ``, ``, ``], e: `` },
  { n: 71, s: `Mental Aptitude / Reasoning`, q: `"Kumarasambhavam" is the literary work of which of the following writers ?`, qi: ``, o: [`Mahakavi Kalidasa`, `Kalhan`, `Mahadevi`, `Bharavi`], oi: [``, ``, ``, ``], e: `` },
  { n: 72, s: `Mental Aptitude / Reasoning`, q: `"World Book Day" is celebrated on which of the following day every year?`, qi: ``, o: [`7th April`, `23rd April`, `25th June`, `5th June`], oi: [``, ``, ``, ``], e: `` },
  { n: 73, s: `Mental Aptitude / Reasoning`, q: `The parts of which of the following states had evolved a local system of canal irrigation called kulhs over four hundred years ago ?`, qi: ``, o: [`Himachal Pradesh`, `Gujarat`, `Kerala`, `Karnataka`], oi: [``, ``, ``, ``], e: `` },
  { n: 74, s: `Mental Aptitude / Reasoning`, q: `National Aluminium Company Limited (NALCO) is having its registered office at which of the following places?`, qi: ``, o: [`Bhubaneshwar, Odisha`, `Noonmati, Assam`, `Raipur, Chhattisgarh`, `Digboi, Assam`], oi: [``, ``, ``, ``], e: `` },
  { n: 75, s: `General Knowledge`, q: `The increase in the proportion population of a country who live in urban areas is known as which of the following?`, qi: ``, o: [`Colonisation`, `Urbanisation`, `Rustication`, `Unplanned Development`], oi: [``, ``, ``, ``], e: `` },
  { n: 76, s: `General Knowledge`, q: `The headquarters of World Health Organisation (WHO) is located at which of the following places ?`, qi: ``, o: [`Brussels, Belgium`, `Amsterdam, Netherlands`, `Paris, France`, `Geneva, Switzerland`], oi: [``, ``, ``, ``], e: `` },
  { n: 77, s: `General Knowledge`, q: `Surha Taal is the famous sanctuary that also receives many migratory birds from Siberia and other colder regions, is located at which of the following districts of Uttar Pradesh?`, qi: ``, o: [`Gonda`, `Ballia`, `Sant Kabir Nagar`, `Etah`], oi: [``, ``, ``, ``], e: `` },
  { n: 78, s: `General Knowledge`, q: `Which of the following social media platforms is best suited for professional networking and job hunting?`, qi: ``, o: [`Instagram`, `Facebook`, `Linkedin`, `Snapchat`], oi: [``, ``, ``, ``], e: `` },
  { n: 79, s: `General Knowledge`, q: `Bhadohi that is located in Uttar Pradesh is famous for which of the following art?`, qi: ``, o: [`Saree weaving`, `Carpet weaving`, `Glazed pottery`, `Chikankari`], oi: [``, ``, ``, ``], e: `` },
  { n: 80, s: `General Knowledge`, q: `Which of the following is the state tree of Uttar Pradesh?`, qi: ``, o: [`Oak`, `Ashoka`, `Bamboo`, `Banyan`], oi: [``, ``, ``, ``], e: `` },
  { n: 81, s: `General Knowledge`, q: `Which among the following well-known folk dance of Uttar Pradesh is performed during paddy and maize cultivation ?`, qi: ``, o: [`Hurka Baul`, `Charkula`, `Kajri`, `Rasiya`], oi: [``, ``, ``, ``], e: `` },
  { n: 82, s: `General Knowledge`, q: `Banaras Hindu University was founded by Pandit Madan Mohan Malaviya with cooperation of whom among , the following ?`, qi: ``, o: [`Madam Bhikaiji Cama`, `Sardar Vallabhbhai Patel`, `Dr. Annie Besant`, `Rabindranath Tagore`], oi: [``, ``, ``, ``], e: `` },
  { n: 83, s: `General Knowledge`, q: `Mathura is the birthplace of whom among the following that is also known as Brij Bhoomi ?`, qi: ``, o: [`Lord Ganesha`, `Lord Shiva`, `Lord Rama`, `Lord Krishna`], oi: [``, ``, ``, ``], e: `` },
  { n: 84, s: `General Knowledge`, q: `Akbar's mausoleum is located at which of the following places?`, qi: ``, o: [`Unnao`, `Sikandara`, `Etah`, `Rampur`], oi: [``, ``, ``, ``], e: `` },
  { n: 85, s: `General Knowledge`, q: `Demonetisation is also known by which of the following names?`, qi: ``, o: [`Cashless`, `New Currency`, `Note Ban`, `No Currency`], oi: [``, ``, ``, ``], e: `` },
  { n: 86, s: `General Knowledge`, q: `A parcel of land held under one tenure or one lease, engagement or grant is known as which of the following according to Uttar Pradesh Revenue Code, 2006 ?`, qi: ``, o: [`Agricultural Land`, `Holding`, `Consolidated`, `Grove Land`], oi: [``, ``, ``, ``], e: `` },
  { n: 87, s: `General Knowledge`, q: `Give full form of UPSSF.`, qi: ``, o: [`Uttar Pradesh Social Security Force`, `Uttar Pradesh Special Security Force`, `Uttar Pradesh Social Source Force`, `Uttar Pradesh Solid Security Force`], oi: [``, ``, ``, ``], e: `` },
  { n: 88, s: `General Knowledge`, q: `Nivesh Mitra Mobile application is an initiative of which of the following states of India?`, qi: ``, o: [`Gujarat`, `Uttar Pradesh`, `Assam`, `Telangana`], oi: [``, ``, ``, ``], e: `` },
  { n: 89, s: `General Knowledge`, q: `Which of the following sentences is in correct for GST?`, qi: ``, o: [`GST is a destination-based tax.`, `There are multiple levies of tax on goods and services.`, `GST is a common law and procedure throughout the country under single administration.`, `GST is a comprehensive levy and collection on both goods and services at the same rate with benefit of input tax credit or subtraction of value.`], oi: [``, ``, ``, ``], e: `` },
  { n: 90, s: `General Knowledge`, q: `An attempt to obtain sensitive information such as username, password and credit card details etc. for malicious reasons, by posing as a trustworthy source in e-mail is called as`, qi: ``, o: [`Losing`, `Phishing`, `Sourcing`, `Cheating`], oi: [``, ``, ``, ``], e: `` },
  { n: 91, s: `General Knowledge`, q: `"Taka" is the currency of which of the following countries?`, qi: ``, o: [`Bangladesh`, `Thailand`, `Serbia`, `Turkey`], oi: [``, ``, ``, ``], e: `` },
  { n: 92, s: `General Knowledge`, q: `Which of the following awards is given to motivate Cooperative and Milk producer Companies to grow and to instill competitive spirit?`, qi: ``, o: [`Arjuna Award`, `Dronacharya Award`, `National Gopal Ratna Award`, `Dhyanchand Award`], oi: [``, ``, ``, ``], e: `` },
  { n: 93, s: `General Knowledge`, q: `Which of the following ports is located in Kuchchh, Gujarat ?`, qi: ``, o: [`Paradwip Port`, `Mormugao Port`, `Kandla Port (Deendayal Port)`, `The Jawaharlal Nehru Port`], oi: [``, ``, ``, ``], e: `` },
  { n: 94, s: `General Knowledge`, q: `Recently, Shri Amit Shah has laid the foundation-stone of the headquarters of National Cooperative Dairy Federation of India (NCDFI) at which of the following places ?`, qi: ``, o: [`Jaipur`, `Gandhinagar`, `Anand`, `Bengaluru`], oi: [``, ``, ``, ``], e: `` },
  { n: 95, s: `General Knowledge`, q: `Who among the following was the founder of the Khudai Khidmatgars?`, qi: ``, o: [`Badruddin Tyabji`, `Mohammad Ali Jinnah`, `Khan Abdul Gaffar Khan`, `Maulana Azad`], oi: [``, ``, ``, ``], e: `` },
  { n: 96, s: `General Knowledge`, q: `Who among the following has inaugurated Kochi-Lakshadweep Islands Submarine Optical Fiber Connection (KLI-SOFC) recently ?`, qi: ``, o: [`Dr. S. Jaishankar`, `Shri Narendra Modi`, `Shri Rajnath Singh`, `Shri Amit Shah`], oi: [``, ``, ``, ``], e: `` },
  { n: 97, s: `General Knowledge`, q: `The Union Cabinet has recently approved the Migration and Mobility Agreement between India and which of the following countries?`, qi: ``, o: [`Italy`, `Nepal`, `Germany`, `Sri Lanka`], oi: [``, ``, ``, ``], e: `` },
  { n: 98, s: `General Knowledge`, q: `Recently, Indian Navy's Fast Attack Craft INS Kabra has arrived at which of the following places ?`, qi: ``, o: [`Male, Maldives`, `Matarbari Port, Bangladesh`, `Colombo, Sri Lanka`, `Port of Jebel Ali, U.A.E.`], oi: [``, ``, ``, ``], e: `` },
  { n: 99, s: `General Hindi`, q: `'पूव और उKर के बीच की िदशा इस वा  ांश के िलए एक श  िन िलिखत म से कौन सा है ?`, qi: ``, o: [`आVेय`, `नैऋw`, `ईशान`, `वायD`], oi: [``, ``, ``, ``], e: `` },
  { n: 100, s: `General Hindi`, q: `िकस िवक  म श  ुितसम-िभ ाथ क का सही अथ -भेद है ?`, qi: ``, o: [`Fण - वण =रंग - घाव`, `िवष - िवस् = धन - जहर`, `कृत - ाकृत = एक भाषा - यथाथ`, `शशधर - शिशधर = चाँद - िशव`], oi: [``, ``, ``, ``], e: `` },
  { n: 101, s: `General Hindi`, q: `िन िलिखत म से िकस िवक  म शु5 वा  है ?`, qi: ``, o: [`दीन - दुब लों को ार करना मानवता है ।`, `लड़के अ ापक को  पूछते ह ।`, `वह ऑिफस म बैठा मेरी  ती ा कर रहा है।`, `दस बजने को पं5ह िमनट ह ।`], oi: [``, ``, ``, ``], e: `` },
  { n: 102, s: `General Hindi`, q: `Que. 102`, qi: ``, o: [`अजवायन`, `िवहार`, `पराधीनता`, `मुि5का`], oi: [``, ``, ``, ``], e: `` },
  { n: 103, s: `General Hindi`, q: `िन िलिखत म से िकस श  का  योग एकवचन म होता है ?`, qi: ``, o: [`सोना`, `ह™ा र`, `ाण`, `दश न`], oi: [``, ``, ``, ``], e: `` },
  { n: 104, s: `General Hindi`, q: `हे ई र ! दया करो। रेखांिकत श  म कौन सा कारक है ?`, qi: ``, o: [`करण कारक`, `कम कारक`, `संबोधन कारक`, `सं दान कारक`], oi: [``, ``, ``, ``], e: `` },
  { n: 105, s: `General Hindi`, q: `िन िलिखत म से तदव श  कौन सा है ?`, qi: ``, o: [`शांित`, `काज`, `जलिध`, `ताप`], oi: [``, ``, ``, ``], e: `` },
  { n: 106, s: `General Hindi`, q: `िन िलिखत म से िकस िवक  म सभी श  तTम ह ?`, qi: ``, o: [`पलंग, पीला`, `कु ार, गधा`, `डंडा, नाक`, `नD, 4ण कार`], oi: [``, ``, ``, ``], e: `` },
  { n: 107, s: `General Hindi`, q: `'निलन' और 'राजीव' श  िन िलिखत म से िकस श  के पया यवाची ह ?`, qi: ``, o: [`अंबर`, `कमल`, `उपवन`, `उ  ष`], oi: [``, ``, ``, ``], e: `` },
  { n: 108, s: `General Hindi`, q: `ों, कब कौन से सव नाम के उदाहरण ह ?`, qi: ``, o: [`वाचक सव नाम`, `िनजवाचक सव नाम`, `अिन यवाचक सव नाम`, `िन यवाचक सव नाम`], oi: [``, ``, ``, ``], e: `` },
  { n: 109, s: `General Hindi`, q: `'मिदरालय' श  के संिध - िव  ेद का चयन कीिजए:`, qi: ``, o: [`मिदरा + अलय`, `मिदरा + आलय`, `मिदरा + लय`, `मंिदर + आलय`], oi: [``, ``, ``, ``], e: `` },
  { n: 110, s: `General Hindi`, q: `अवतरण िच5 को और िकस नाम से जाना जाता है ?`, qi: ``, o: [`को क िच5`, `उ5रण िच5`, `िनद´शक िच5`, `योजक िच5`], oi: [``, ``, ``, ``], e: `` },
  { n: 111, s: `General Hindi`, q: `'सतसई' श  म िकस  कार के सं%ाबोधक िवशेषण का  योग है ?`, qi: ``, o: [`आवृिKबोधक िवशेषण`, `अिनि त सं%ाबोधक िवशेषण`, `गणनावाचक िवशेषण`, `समु  यबोधक िवशेषण`], oi: [``, ``, ``, ``], e: `` },
  { n: 112, s: `General Hindi`, q: `'राधा ने पायल से िच ी िलखवाई।' इस वा  म कौन सी ि या है ?`, qi: ``, o: [`संयु4 ि या`, `पूव कािलक ि या`, `ेरणाथ क ि या`, `नामधातु ि या`], oi: [``, ``, ``, ``], e: `` },
  { n: 113, s: `General Hindi`, q: `'िचWाहट' म कौन सा  wय है ?`, qi: ``, o: [`हट`, `िच`, `आहट`, `िचWा`], oi: [``, ``, ``, ``], e: `` },
  { n: 114, s: `General Hindi`, q: `'अिभभाषण' श  म कौन सा उपसग है ?`, qi: ``, o: [`अ`, `अभी`, `अभ`, `अिभ`], oi: [``, ``, ``, ``], e: `` },
  { n: 115, s: `General Hindi`, q: `'र4रंिजत' श   म कौन सा समास है ?`, qi: ``, o: [`अDयीभाव समास`, `ि गु समास`, `त  ु ष समास`, `ं  समास`], oi: [``, ``, ``, ``], e: `` },
  { n: 116, s: `General Hindi`, q: `'परो ' का िवलोम श  है`, qi: ``, o: [`अपरो`, `w`, `5 D`, `™ूल`], oi: [``, ``, ``, ``], e: `` },
  { n: 117, s: `General Hindi`, q: `'चमड़ी जाए, पर दमड़ी न जाए' लोकोि4 का अथ िन िलिखत म से कौन सा है ?`, qi: ``, o: [`पैसे का ब5त मोह होना`, `पैसा ही माँ - बाप दोनों`, `जान चली जाए पर पैसा न जाए`, `अwिधक कंजूस होना`], oi: [``, ``, ``, ``], e: `` },
  { n: 118, s: `General Hindi`, q: `' ोध' िकस रस का ™ायी भाव है ?`, qi: ``, o: [`रौ5 रस`, `वीभT रस`, `वीर रस`, `भयानक रस`], oi: [``, ``, ``, ``], e: `` },
  { n: 119, s: `General Hindi`, q: `सोरठा के ि तीय और चतुथ चरण म िकतनी मा ाएँ होती ह ?`, qi: ``, o: [`13`, `10`, `16`, `11`], oi: [``, ``, ``, ``], e: `` },
  { n: 120, s: `General Hindi`, q: `िन िलिखत म से िकस अलंकार म समान धम का होना अिनवाय है ?`, qi: ``, o: [`उ  े ा`, `ेष`, `यमक`, `उपमा`], oi: [``, ``, ``, ``], e: `` },
  { n: 121, s: `General Hindi`, q: `िन िलिखत म से 'भाग' श  का अनेकाथT श  िकस िवक  म नहीं है ?`, qi: ``, o: [`बाँटना`, `भागना`, `िह4ा`, `‰ाज`], oi: [``, ``, ``, ``], e: `` },
  { n: 122, s: `General Hindi`, q: `'वह बाज़ार जा चुका है।' इस वा  का काल पहचािनए ।`, qi: ``, o: [`संिद  वत मानकाल`, `पूण भूतकाल`, `आस  भूतकाल / पूण वत मानकाल`, `सामा  वत मानकाल`], oi: [``, ``, ``, ``], e: `` },
  { n: 123, s: `General Hindi`, q: `'राम अभी सोएगा।' इस वा  म कौन सा वा  होगा ?`, qi: ``, o: [`भाववा`, `कम वा`, `इनम से कोई नहीं`, `कतृ वा`], oi: [``, ``, ``, ``], e: `` },
  { n: 124, s: `General Hindi`, q: `'ितल का ताड़ बनाना' मुहावरे का अथ बताइए :`, qi: ``, o: [`आ  मण करना`, `Dथ काम करना`, `साधारण बात को बढ़ा-चढ़ाकर कहना`, `धाक बैठना`], oi: [``, ``, ``, ``], e: `` },
  { n: 125, s: `General Hindi`, q: `िन िलिखत गBांश को पढ़कर पूछे गए   ों के उKर दीिजए
भारत भयंकर अं ेज़ी - मोह की दुरव™ा से गुजर रहा है । इस दुरव™ा का एक भयानक दु  रणाम यह है िक भारतीय भाषाओं के समकालीन सािहw पर उन लोगों की 7ि नहीं पड़ती जो िव िवBालयों के ायः सव Kम छा थे और अब शासन तं म ऊँचे
ओहदों पर काम कर रहे ह । इस 7ि से भारतीय भाषाओं के लेखक केवल यूरोपीय और अमे रकी लेखकों से हीन नहीं ह , बि उनकी िक4त िम , बमा , इंडोनेिशया, चीन और जापान के लेखकों की िक4त से भी खराब है  ों˙िक इन सभी देशों के लेखकों की कृितयाँ वहाँ के अwंत सुिशि त लोग भी पढ़ते ह । केवल हम ही ह िजनकी पु™कों पर यहाँ के तथाकिथत िशि त समुदाय की 7ि ायः नहीं पड़ती । हमारा तथाकिथत उ  िशि त समुदाय जो कुछ पढ़ना चाहता है, उसे अं ेज़ी म ही पढ़ लेता है, यहाँ तक
िक उसकी किवता और उप ास पढ़ने की तृ ा भी अं ेज़ी की किवता और उप ास पढ़कर ही समा™ हो जाती है और उसे यह जानने की इ ा ही नहीं होती िक शरीर से वह िजस समाज का सद4 है उसके मनोभाव उप ास और काD म िकस अदा से D4 हो रहे ह ।
भारतीय लेखकों की िक4त खराब है  ों˙िक`, qi: ``, o: [`वे अपनी बात भारतीय िशि त पाठकों तक प5ँचा नहीं पाते ।`, `वे अपनी भाषा म िलख नहीं सकते ।`, `उनकी पु™कों को यहाँ के नाग रक गव - यो  नहीं मानते ।`, `वे अपनी भाषा के सािहw को पढ़कर अपने समाज का हाल - चाल नहीं जान सकते ।`], oi: [``, ``, ``, ``], e: `` },
  { n: 126, s: `General Hindi`, q: `उपयु4 शीष क दीिजए -
Que. 126
उपयु4 शीष क दीिजए -`, qi: ``, o: [`भारतीय िशि तों का अं ेज़ी - मोह`, `भारत की दुरव™ा`, `भारतीय लेखकों की दुद शा`, `भारतीय िशि तों की दुरव™ा`], oi: [``, ``, ``, ``], e: `` },
  { n: 127, s: `General Hindi`, q: `भारतीय भाषाओं के लेखक अमे रकी यूरोपीय तथा चीन, बमा , जापान के लेखकों से भी हीन ह .  ों˙िक-
Que. 127
भारतीय भाषाओं के लेखक अमे रकी यूरोपीय तथा चीन, बमा , जापान के लेखकों से भी हीन ह .  ों˙िक-`, qi: ``, o: [`उनके सािहw को भारत म नहीं पढ़ा जाता ।`, `उनम 4भाषा के  ित गौरव नहीं है ।`, `उनके सािहw को भारत के सुिशि त लोग नहीं पढ़ते ।`, `वे अं ेज़ी के मोह से  ™ ह ।`], oi: [``, ``, ``, ``], e: `` },
  { n: 128, s: `General Hindi`, q: `भारत का सुिशि त समाज कौन सा सािहw पढ़कर संतु  हो जाता है ?`, qi: ``, o: [`देशी`, `िहंदी`, `भारतीय`, `अं ेज़ी`], oi: [``, ``, ``, ``], e: `` },
  { n: 129, s: `General Hindi`, q: `भारतीय भाषाओं के सािहw के  ित समाज के िकस वग म अ िच की भावना है ?`, qi: ``, o: [`अनपढ़`, `उ`, `नगरवासी`, `सुिशि त`], oi: [``, ``, ``, ``], e: `` },
  { n: 130, s: `General Hindi`, q: `िन िलिखत म से 'नहीं' कौन से कार का रीितवाचक ि यािवशेषण है ?`, qi: ``, o: [`वाचक`, `िविधबोधक`, `िनषेधवाचक`, `िन यबोधक`], oi: [``, ``, ``, ``], e: `` },
  { n: 131, s: `General Hindi`, q: `िन िलिखत म से 'समु5' श  का पया यवाची श  कौन सा है ?Que. 131िन िलिखत म से 'समु5' श  का पया यवाची श  कौन सा है ?
Que. 131
िन िलिखत म से 'समु5' श  का पया यवाची श  कौन सा है ?
Que. 131
िन िलिखत म से 'समु5' श  का पया यवाची श  कौन सा है ?`, qi: ``, o: [`भोर`, `भव`, `वैराग`, `र ाकर`], oi: [``, ``, ``, ``], e: `` },
  { n: 132, s: `General Hindi`, q: `'मेघ - मेध'  ुितसमिभ ाथ क श  का सही अथ - भेद िन  म से कौन सा है ?`, qi: ``, o: [`बादल - जीवन`, `बादल - यy`, `यy - जल`, `यy - बादल`], oi: [``, ``, ``, ``], e: `` },
  { n: 133, s: `General Hindi`, q: `'™ी जो अिभनय करती हो' वा  ांश के िलए एक श  का चयन कीिजए।`, qi: ``, o: [`अिभने ी`, `नत की`, `नाियका`, `गाियका`], oi: [``, ``, ``, ``], e: `` },
  { n: 134, s: `General Hindi`, q: `'मानसरोवर' िकसकी रचनाओं का संकलन है ?`, qi: ``, o: [`महादेवी वमा`, `ेमचंद`, `रामचं5 शु4`, `रवी  नाथ टैगोर`], oi: [``, ``, ``, ``], e: `` },
  { n: 135, s: `General Hindi`, q: `मीराबाई िकसकी िश ा थीं ?`, qi: ``, o: [`संत रैदास`, `संत नामदेव`, `संत एकनाथ`, `संत तुकाराम`], oi: [``, ``, ``, ``], e: `` },
  { n: 136, s: `General Hindi`, q: `िन िलिखत म से कौन सी भाषा पि मी िहंदी से संबंध रखती है ?`, qi: ``, o: [`बाँगV`, `राज™ानी`, `अवधी`, `भोजपुरी`], oi: [``, ``, ``, ``], e: `` },
  { n: 137, s: `Numerical & Mental Ability`, q: `Two numbers are in the ratio of 13 ∶ 9. If their HCF is 13, then find the largest number.`, qi: ``, o: [`117`, `52`, `143`, `169`], oi: [``, ``, ``, ``], e: `` },
  { n: 138, s: `Numerical & Mental Ability`, q: `Salaries of Rohan and Soham are in the ratio 2 ∶ 3. If the salary of each is increased by ₹ 2,000, the new ratio becomes 40 ∶ 57. What is Soham's present salary ?`, qi: ``, o: [`₹ 25,500`, `₹ 17,000`, `₹ 34,000`, `₹ 20,000`], oi: [``, ``, ``, ``], e: `` },
  { n: 139, s: `Numerical & Mental Ability`, q: `In a certain school, 20% of students are below 10 years of age. The number of students above 10 years ofage is 2 of the number of students of 10 years age which is 48. What is the total number of students in the3
In a certain school, 20% of students are below 10 years of age. The number of students above 10 years of
age is 2 of the number of students of 10 years age which is 48. What is the total number of students in the
3
In a certain school, 20% of students are below 10 years of age. The number of students above 10 years of
age is 2 of the number of students of 10 years age which is 48. What is the total number of students in the
3
school?`, qi: ``, o: [`100`, `80`, `110`, `90`], oi: [``, ``, ``, ``], e: `` },
  { n: 140, s: `Numerical & Mental Ability`, q: `A number when divided by 119, leaves 19 as remainder. If it is divided by 17, it will leave a remainder`, qi: ``, o: [`3`, `1`, `4`, `2`], oi: [``, ``, ``, ``], e: `` },
  { n: 141, s: `Numerical & Mental Ability`, q: `Simplify : 17.28÷x = 2
3.6× 0.2
Que. 141
Simplify : 17.28÷x = 2
3.6× 0.2`, qi: ``, o: [`14`, `10`, `15`, `12`], oi: [``, ``, ``, ``], e: `` },
  { n: 142, s: `Numerical & Mental Ability`, q: `What will replace the question mark (?) in the following equation?
5072.19 + 368.312 + (?) = 9018.618`, qi: ``, o: [`3571.115`, `3571.116`, `3578.116`, `3578.112`], oi: [``, ``, ``, ``], e: `` },
  { n: 143, s: `Numerical & Mental Ability`, q: `The average of six numbers is 3.75. The average of two of them is 3.2, while the average of other two is3.55. What is the average of the remaining two numbers?
The average of six numbers is 3.75. The average of two of them is 3.2, while the average of other two is
3.55. What is the average of the remaining two numbers?
The average of six numbers is 3.75. The average of two of them is 3.2, while the average of other two is
3.55. What is the average of the remaining two numbers?`, qi: ``, o: [`4.5`, `4.3`, `4.6`, `4.4`], oi: [``, ``, ``, ``], e: `` },
  { n: 144, s: `Numerical & Mental Ability`, q: ``, qi: ``, o: [``, ``, ``, ``], oi: [``, ``, ``, ``], e: `` },
  { n: 145, s: `Numerical & Mental Ability`, q: `A sum of money amounts to ₹ 4,460 after 3 years and to ₹ 6,690 after 6 years on compound interest. Find the approximate sum.`, qi: ``, o: [`₹ 3,115.33`, `₹ 2,973.33`, `₹ 2,991.66`, `₹ 3,121.66`], oi: [``, ``, ``, ``], e: `` },
  { n: 146, s: `Numerical & Mental Ability`, q: `Three partners P, Q and R start a business. Twice P's capital is equal to thrice Q's capital and Q's capital is equal to four times R's capital. Out of total profit of ₹ 27,500 at the end of the year, R's share is:`, qi: ``, o: [`₹ 5,000`, `₹ 7,000`, `₹ 15,000`, `₹ 2,500`], oi: [``, ``, ``, ``], e: `` },
  { n: 147, s: `Numerical & Mental Ability`, q: `How long will a boy take to run round a square field of side 25 metres, if he runs at the rate of 9 km/hr ?`, qi: ``, o: [`42 sec.`, `38 sec.`, `48 sec.`, `40 sec.`], oi: [``, ``, ``, ``], e: `` },
  { n: 148, s: `Numerical & Mental Ability`, q: `4 boys and 6 girls can do a piece of work in 10 days while 6 boys and 4 girls can do the same work in 8 days. In how many days can 4 boys and 2 girls do the work ?`, qi: ``, o: [`28`, `25/2`, `30`, `27/2`], oi: [``, ``, ``, ``], e: `` },
  { n: 149, s: `Numerical & Mental Ability`, q: `Find the 21st term of the sequence 26, 20, 14, 8, ......... .
Que. 149
Find the 21st term of the sequence 26, 20, 14, 8, ......... .`, qi: ``, o: [`-100`, `146`, `88`, `-94`], oi: [``, ``, ``, ``], e: `` },
  { n: 150, s: `Numerical & Mental Ability`, q: `The area of circular field is 13.86 hectares. Find the cost of fencing it at the rate of Rs. 3.2 per metre. (1 hectare = 10,000 m2)`, qi: ``, o: [`Rs. 5,808`, `Rs. 4,224`, `Rs. 6,132`, `Rs. 5,138`], oi: [``, ``, ``, ``], e: `` }
];

if (RAW.length !== 150) { console.error(`Expected 150, got ${RAW.length}`); process.exit(1); }
if (KEY.length !== 150) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

const uploadCache = new Map();
async function uploadImage(fileName, publicId) {
  if (!fileName) return '';
  if (uploadCache.has(fileName)) return uploadCache.get(fileName);
  const localPath = path.join(EXTRACTED_DIR, fileName);
  if (!fs.existsSync(localPath)) {
    console.log(`  [missing] ${fileName}`);
    uploadCache.set(fileName, '');
    return '';
  }
  try {
    const res = await cloudinary.uploader.upload(localPath, {
      folder: CLOUDINARY_FOLDER, public_id: publicId, overwrite: true, resource_type: 'image'
    });
    uploadCache.set(fileName, res.secure_url);
    return res.secure_url;
  } catch (err) {
    console.error(`  [upload failed] ${fileName}: ${err.message}`);
    uploadCache.set(fileName, '');
    return '';
  }
}

async function buildQuestions() {
  const questions = [];
  for (let i = 0; i < RAW.length; i++) {
    const r = RAW[i];
    const n = r.n;
    let qImage = '';
    let optImages = ['', '', '', ''];
    if (r.qi) {
      process.stdout.write(`Q${n} q-img... `);
      qImage = await uploadImage(r.qi, `${F}-q-${n}`);
      console.log(qImage ? 'ok' : 'missing');
    }
    for (let oi = 0; oi < 4; oi++) {
      if (r.oi[oi]) {
        process.stdout.write(`  Q${n} opt-${oi+1}-img... `);
        optImages[oi] = await uploadImage(r.oi[oi], `${F}-q-${n}-option-${oi+1}`);
        console.log(optImages[oi] ? 'ok' : 'missing');
      }
    }
    questions.push({
      questionText: r.q || '(Question text unavailable — see image)',
      questionImage: qImage,
      options: r.o.map(o => o || '(image option)'),
      optionImages: optImages,
      correctAnswerIndex: KEY[i] - 1,
      explanation: r.e || '',
      section: r.s,
      tags: ['UP Police', 'Constable', 'PYQ', '2024', '17 February 2024 Shift-1'],
      difficulty: 'medium'
    });
  }
  return questions;
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  // UP Police Constable is a State exam — reuse the existing 'State' ExamCategory
  // (per feedback_examcategory_reuse: never create per-state categories).
  let category = await ExamCategory.findOne({ name: 'State', type: 'State' });
  if (!category) {
    category = await ExamCategory.create({ name: 'State', type: 'State', description: 'State government competitive exams' });
  }

  let exam = await Exam.findOne({ code: 'UP-POLICE-CON' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'UP Police Constable',
      code: 'UP-POLICE-CON',
      description: 'Uttar Pradesh Police Recruitment & Promotion Board - Constable Direct Recruitment Examination',
      isActive: true
    });
    console.log('Created Exam: UP-POLICE-CON');
  }

  const PATTERN_TITLE = 'UP Police Constable';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 120, totalMarks: 300, negativeMarking: 0.5,
      sections: [
        { name: GK,  totalQuestions: 38, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: HIN, totalQuestions: 37, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: NUM, totalQuestions: 38, marksPerQuestion: 2, negativePerQuestion: 0.5 },
        { name: REA, totalQuestions: 37, marksPerQuestion: 2, negativePerQuestion: 0.5 }
      ]
    });
    console.log('Created ExamPattern: UP Police Constable');
  }

  const TEST_TITLE = `UP Police Constable - 17 February 2024 Shift-1`;
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 300, duration: 120,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2024, pyqShift: `17 February 2024 Shift-1`,
    pyqExamName: 'UP Police Constable', questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
