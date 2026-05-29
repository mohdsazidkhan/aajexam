/**
 * Seed: IBPS PO Prelims - 04 December 2021 Shift-3
 * IBPS PO Prelims — Probationary Officer Preliminary Exam.
 * 100 Q × 1 mark, 3 sections (Eng 30 / Reas 35 / Quant 35), 60 min total,
 * sectional timing 20 min each, 0.25 negative marking.
 * Uploads question/option images from local _extracted_ibps_po_04dec2021_shift3/ to Cloudinary.
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

const EXTRACTED_DIR = path.resolve(__dirname, '../_extracted_ibps_po_04dec2021_shift3');
const CLOUDINARY_FOLDER = 'aajexam/pyq/ibps-po-prelims-04dec2021-s3';
const F = '04dec2021-s3';

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

const ENG = 'English Language';
const REA = 'Reasoning Ability';
const QA  = 'Quantitative Aptitude';

const KEY = [2, 4, 3, 4, 4, 4, 4, 4, 2, 4, 4, 4, 1, 5, 4, 3, 2, 4, 5, 1, 3, 4, 2, 5, 3, 4, 3, 4, 2, 4, 4, 3, 2, 5, 3, 4, 3, 4, 5, 3, 4, 5, 5, 5, 1, 2, 2, 4, 3, 1, 1, 1, 4, 2, 1, 3, 2, 4, 2, 2, 1, 2, 5, 2, 4, 1, 2, 3, 3, 2, 4, 2, 4, 5, 3, 3, 2, 2, 5, 4, 5, 3, 2, 5, 3, 4, 4, 3, 4, 3, 2, 4, 2, 3, 5, 5, 5, 3, 5, 5];
const RAW = [
  { n: 1, s: `English Language`, q: `Given below is a word, followed by three sentences which consist of that word. Identify the
sentence(s) which best express(es) the meaning of the word. Choose option 5 ‘None of these’ if
the word is not suitable in any of the sentences.
ALLUSION
A. There are lots of literary echoes and allusions in the novel, but they don't do anything for the tired texture
of the prose.
B. He made some allusion to the years they lived apart.
C. The video game is designed to give the allusion that you are in control of an airplane.`, qi: ``, o: [`Both A and C`, `Both A and B`, `Only B`, `Both B and C`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 2, s: `English Language`, q: `Given below is a word, followed by three sentences which consist of that word. Identify the
sentence(s) which best express(es) the meaning of the word. Choose option 5 ‘None of these’ if
the word is not suitable in any of the sentences.
Borne
A. She was borne up to the ambulance.
B. His version of events just isn't borne out by the facts.
C. These matters are beyond the borne of our understanding.`, qi: ``, o: [`Only A`, `Only B`, `A, B and C`, `A and B`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 3, s: `English Language`, q: `Given below is a word, followed by three sentences which consist of that word. Identify the
sentence(s) which best express(es) the meaning of the word. Choose option 5 ‘None of these’ if
the word is not suitable in any of the sentences.
Corroborate
A. Recent research seems to corroborate his theory.
B. Employment trends corroborate the dismal economic picture.
C. There was no one to corroborate her story about the disturbance in the lounge.`, qi: ``, o: [`Only B`, `A and C`, `A, B and C`, `B and C`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 4, s: `English Language`, q: `Read the passage given below and answer the questions that follow.
It is well accorded that COVID-19 extracts a huge toll on the mental health of patients and leaves
behind a slew of neurological sequelae in its wake. However, what is alarming is the wide gamut of mental
and neurological disorders seen even in those with milder symptoms. Such patients frequently reported being
anxious, depressed and having difficulty in sleeping. A higher incidence of frank psychosis manifesting as
disorganization of thought processes and personality disorders was also reported. Many survivors of COVID-
19 had to battle substance abuse in its immediate aftermath. There was a steep increase in the amount of
alcohol consumed by regular drinkers. Persons who had stopped smoking and consuming alcohol resumed
their habit in disconcerting numbers.
The occurrence of neurodegenerative disorders like Parkinsonism is concerning as this would bring long-
term disability in the form of impaired mobility and memory decline. It has been hypothesized that the
causative mechanism for many of the neurological conditions due to COVID-19 may be the direct invasion
of the nervous system by the virus, an increased tendency to blood clotting or an exaggerated immune
response by the body. Various other factors like pre-existing psychiatric illness, prolonged quarantine,
perceived lack of organizational support, and social stigma are risk factors. Anxiety, Nervousness, and Post-
traumatic stress disorder are often fuelled by fear of infecting other family members, physical
distancing, loneliness, and ________ at home in cramped quarters.
The pandemic has radically transformed the way businesses function and services delivered. Remote
working disrupts a healthy-work life balance. Face to face contact and human interactions which were
considered so essential for emotional well-being has taken a backseat. Lack of comforting physical contact
like shaking hands and hugging friends is stressful and disconcerting. Online classes and home-schooling
have placed a gargantuan burden both on students and parents. Lack of access to reliable computer
hardware and spotty internet connections, particularly in rural areas and in the economically backward have
created a new class divide. Children have been deprived of co-curricular activities, participation in group
events and sports which is essential for their holistic development. Mental stress and fatigue have increased
manyfold due to the rigours imposed by virtual learning.
According to the passage, what is alarming considering COVID-19's toll on mental health?`, qi: ``, o: [`The rise of the black fungus wrecking havoc on patients with mild immunity.`, `The steep increase in the amount of alcohol consumption by regular drinkers.`, `The rise of virtual learning and work from home.`, `The wide range of mental and neurological disorders in patients with milder symptoms.`, `None of the above.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 5, s: `English Language`, q: `What is the synonym of the word gargantuan mentioned in the passage?`, qi: ``, o: [`Puny`, `Miniscule`, `Tepid`, `Enormous`, `Opulent`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 6, s: `English Language`, q: `Choose the most appropriate option to fill in the blank for the sentence given below.
Anxiety, Nervousness, and Post-traumatic stress disorder are often fuelled by fear of infecting other
family members, physical distancing, loneliness, and ________ at home in cramped quarters.`, qi: ``, o: [`Freedom`, `Luxury`, `Independence`, `Confinement`, `Consent`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 7, s: `English Language`, q: `What is the hypothesis behind the many neurological conditions arising due to COVID-19?`, qi: ``, o: [`A direct invasion of the nervous system by the virus.`, `An increased tendency to blood clotting.`, `An exaggerated immune response by the body.`, `All of the above`, `None of the above.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 8, s: `English Language`, q: `What is the synonym of the word function given in the passage?`, qi: ``, o: [`Conjugate`, `Break`, `Impede`, `Operate`, `Conclude`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 9, s: `English Language`, q: `Choose the statement that is false according to the passage.`, qi: ``, o: [`COVID patients frequently reported difficulty in sleeping`, `Smoking and consumption of alcohol decreased due to prolonged quarantine.`, `Disorders like Parkinsonism occurring during COVID is a cause of concern.`, `Prolonged quarantine is a risk factor that can be associated with COVID related neurological conditions.`, `None of the above.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 10, s: `English Language`, q: `Choose the statement that is true according to the passage.`, qi: ``, o: [`People are able to enjoy the work life balance due to work from home.`, `Spending time inside has given people an opportunity for self reflection.`, `Less exposure to the pollution of the outside world is a blessing for many.`, `The imposed virtual learning has increased the mental stress and fatigue in students.`, `None.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 11, s: `English Language`, q: `How did the pandemic transform the way businesses are run?`, qi: ``, o: [`Remote working has disrupted the work-life balance.`, `There is a constant need to be readily available for work.`, `Face to face contact and human interactions have taken a back seat.`, `Both 1 and 3`, `None of the above.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 12, s: `English Language`, q: `What is the synonym of the word accord ?`, qi: ``, o: [`Transpose`, `Expel`, `Reject`, `Agreement`, `Admit`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 13, s: `English Language`, q: `In the following question, an idiomatic expression or a proverb is highlighted. Select the
alternative which best describes its use in the sentence.
Hercules lock of hair was his Achilles heel`, qi: ``, o: [`Weakness that could result in failure`, `A desirable quality`, `A hated quality`, `A wonderful characteristic`, `The strongest ability`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 14, s: `English Language`, q: `In the following questions, an idiomatic expression and its four meanings are
given. Find out the correct meaning of the idiomatic expression.
To be in the doldrums`, qi: ``, o: [`to be in a tough spot`, `to be caught lying`, `to be caught in a hurricane`, `to be misunderstood`, `to be in low spirits`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 15, s: `English Language`, q: `In the given question, four words are printed in bold and are numbered A, B, C, and D. Of
these, the positions of two of these words may be incorrect and need to be exchanged to make
the sentence correct. Find the two words which need to be exchanged. In case the given sentence is
correct, your answer is (E), i.e. No improvement.
Union minister M.J. Akbar newspapers (A) to take legal action against several women journalists (B) who
had accused (C) him of sexual harassment at two threatened (D) where he had been an editor.`, qi: ``, o: [`Both A-B and C-D`, `Only C-D`, `Only A-B`, `Only A-D`, `No improvement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 16, s: `English Language`, q: `Directions: In the following sentence, 4 words are given in bold. Two or more of these words
are incorrectly placed and need to be interchanged. If there is no need for interchanging then
‘No Error’ can be selected.
Vikram was very demolishing (A) with his handling of the chinaware (B), he ended up reckless (C) most of
the pieces before they even turned up (D). No Error (E)`, qi: ``, o: [`ABDC`, `BACD`, `CBAD`, `DCBA`, `No Error`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 17, s: `English Language`, q: `In the following question, a sentence is given with four words marked as (A), (B), (C) and (D).
These words may or may not be placed in their correct order. Four options with different
arrangements of these words have been provided. Mark the option with the correct arrangement as the
answer. If no rearrangement is required, mark option (5) as your answer.
The article (A) was a page five hopefully (B) and filler (C) will be forgotten (D) in a couple of days.`, qi: ``, o: [`A-C`, `B-C`, `C-D`, `B-D`, `No rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 18, s: `English Language`, q: `In the following question, a sentence is given with four words marked as (A), (B), (C) and (D).
These words may or may not be placed in their correct order. Four options with different
arrangements of these words have been provided. Mark the option with the correct arrangement as the
answer. If no rearrangement is required, mark option (5) as your answer.
After entertainment (A) the army (B), he restarted his leaving (C) career on the west coast with movie (D)
and television roles.`, qi: ``, o: [`A-B`, `B-C`, `C-D`, `A-C`, `No rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 19, s: `English Language`, q: `In the following question, a sentence is given with four words marked as (A), (B), (C) and (D).
These words may or may not be placed in their correct order. Four options with different
arrangements of these words have been provided. Mark the option with the correct arrangement as the
answer. If no rearrangement is required, mark option (5) as your answer.
He helped (A) her up and she tried (B) to stand, but her legs (C) felt like rubber (D).`, qi: ``, o: [`C-D`, `D-B`, `B-A`, `A-D`, `No rearrangement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 20, s: `English Language`, q: `Directions: Below, a passage is given with five blanks labelled (A)- (E). Below the passage,
five options are given for each blank. Choose the word that fits each blank most
appropriately in the context of the passage, and mark the corresponding answer.
Tiny plastic particles washed off products like synthetic clothing and car tyres account for up to a third of the
plastic polluting oceans, __ (A) __ eco-systems and human health, a top conservationist body warned.
Unlike the __ (B) __ images of country-sized garbage patches floating in the oceans, the micro plastic
particles that wash off textiles and roadways leave the waterways looking __ (C) __.
But they constitute a significant part of the “plastic soup” clogging our waters — accounting for between
15% and 31% of the estimated 9.5 million tones of plastic released into the oceans each year, according to the
International Union for Conservation of Nature (IUCN).
In its report “Primary Micro plastics in the Oceans”, the IUCN found that in many developed countries in
North America and Europe, which have __ (D) __ waste management, tiny plastic particles are in fact a
bigger source of marine plastic pollution than plastic waste.
In addition to car tyres and synthetic textiles, such particles stem from everything from marine coatings and
road markings, to city dust and the micro beads in cosmetics. “Plastic waste is not all there is to ocean
plastics,” IUCN chief Inger Andersen said in a statement, insisting that “we must look far beyond waste
management if we are to __ (E) __ ocean pollution in its entirety”.
Which of the following words most appropriately fits the blank labelled (D)?`, qi: ``, o: [`Effective`, `Coherent`, `Rational`, `Forcible`, `Productive`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 21, s: `English Language`, q: `Which of the following words most appropriately fits the blank labelled (C)?`, qi: ``, o: [`Unmarked`, `Flawless`, `Pristine`, `Unblemished`, `Sterile`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 22, s: `English Language`, q: `Which of the following words most appropriately fits the blank labelled (A)?`, qi: ``, o: [`Deciding`, `Striking`, `Modifying`, `Impacting`, `Acting`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 23, s: `English Language`, q: `Which of the following words most appropriately fits the blank labelled (B)?`, qi: ``, o: [`Horrifying`, `Shocking`, `Repelling`, `Bewildering`, `Offensive Which of the following words most appropriately fits the blank labelled (E)?`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 24, s: `English Language`, q: ``, qi: ``, o: [`Post`, `Communicate`, `Convey`, `Speech`, `Address`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 25, s: `English Language`, q: `In the following question, two columns are given containing three phrases each. In the first
column, phrases are A, B, and C, and in the second column, the phrases are D, E, and F. A
phrase from the first column may or may not connect with a phrase from the second column to make a
grammatically and contextually correct sentence. There are five options, four of which display the
sequence(s) in which the phrases can be joined to form a grammatically and contextually correct
sentence. If none of the options forms a correct sentence after combination, select ‘None of these’ as
your answer.
Column 1) Column 2)
A) Local officials in 15 areas D) was built to protect the land of the
around the capital were also asked natives.
B) Volvo cars are understandably E) to remove anything lying in the
superior to their streets that could be used as projectiles.
C) Kohli remains the highest run F) indeed needed but wasn't given to the
scorer in poor in time.`, qi: ``, o: [`A-F`, `C-D`, `A-E`, `B-D`, `B-E`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 26, s: `English Language`, q: `In the following question, two columns are given containing three phrases each. In the first
column, phrases are A, B, and C, and in the second column, the phrases are D, E, and F. A
phrase from the first column may or may not connect with a phrase from the second column to make a
grammatically and contextually correct sentence. There are five options, four of which display the
sequence(s) in which the phrases can be joined to form a grammatically and contextually correct
sentence. If none of the options forms a correct sentence after combination, select ‘None of these’ as
your answer.
Column 1) Column 2)
A) We talk and plan and dream about D) a big part of who I am and I have
nothing but no desire to trade any of it away.
B) There were many people in his E) excited to see her dressed up for
dream, and the occasion.
C) Everything I found in books that F) he thought he should remember
pleased me I retained in my memory them.`, qi: ``, o: [`B -E and C-F`, `A-E, B-F and C-D`, `A-F and C-D`, `B-F`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 27, s: `English Language`, q: `In the following question, two columns are given containing three phrases each. In the first
column, phrases are A, B, and C, and in the second column, the phrases are D, E, and F. A
phrase from the first column may or may not connect with a phrase from the second column to make a
grammatically and contextually correct sentence. There are five options, four of which display the
sequence(s) in which the phrases can be joined to form a grammatically and contextually correct
sentence. If none of the options forms a correct sentence after combination, select ‘None of these’ as
your answer.
Column 1) Column 2)
(A) The Consumer Protection Act (D) but there are many dark sides to it
should be implemented more strictly once you enter into this
(E) so that the businessmen become
(B) The music industry is now
alert and are compelled to stop the
saturated with too many singers
unfair practice
(F) and the lifetime of a singer is
C) The showbiz business is not all
hence reduced to one or two songs
rosy as it seems
only`, qi: ``, o: [`A-F`, `B-F, C-D`, `A-E, B-F and C-D`, `B-F, C-E`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 28, s: `English Language`, q: `In the following sentence, a part is underlined. Below are given alternatives to the underlined
part, which may improve the sentence. Choose the correct alternative. In case no
improvement is needed, choose the alternative that indicates 'No improvement’.
The new captain's poker face made them unable for gauge his mood.
A.unable in gauge his mood
B. unable to assess his mood
C. unable to gauge his mood`, qi: ``, o: [`Only A`, `Only C`, `Only B`, `Both B and C`, `No improvement`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 29, s: `English Language`, q: `In the following sentence, a word has been emboldened. Select the best alternative for the
bold word from the given options.
I was shocked at the audacity and brazenness of the gangsters.`, qi: ``, o: [`Cowardice`, `Insolence`, `Presumption`, `Brevity`, `Heed`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 30, s: `English Language`, q: `Direction: In the following question, out of four alternatives, select the word which can replace the
underlined word given in the question. In case no replacement is needed, select 'None of these'.
Those who follow world affairs would not be entirely wise to consign colonialism to the proverbial dustbin
of history, as it remains a relevant factor in understanding the problems and the dangers of the world.`, qi: ``, o: [`Announce`, `Circulate`, `Indicate`, `Assign`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 31, s: `Quantitative Aptitude`, q: `What should come in place of the question mark '?' in the following number series?
64, 62, 65, 60, 67, ?`, qi: ``, o: [`50`, `62`, `64`, `56`, `66`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 32, s: `Quantitative Aptitude`, q: `What should come in place of the question mark '?' in the following number series?
6, 8, 11, 16, 23, ?`, qi: ``, o: [`32`, `36`, `34`, `28`, `42`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 33, s: `Quantitative Aptitude`, q: `What should come in place of the question mark '?' in the following number series?
8.5, 9.5, 21, 66, ?, 1345`, qi: ``, o: [`258`, `268`, `274`, `284`, `278`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 34, s: `Quantitative Aptitude`, q: `What should come in place of the question mark '?' in the following number series?
29, 30, 26, 35, ?, 44`, qi: ``, o: [`31`, `23`, `27`, `15`, `19`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 35, s: `Quantitative Aptitude`, q: `What should come in place of the question mark '?' in the following number series?
77, 76, 84, 57, ?, – 4`, qi: ``, o: [`81`, `100`, `121`, `144`, `169`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 36, s: `Quantitative Aptitude`, q: `What should come in place of the question mark '?' in the following number series?
0.25, 1.25, 4.5, ?, 70, 355`, qi: ``, o: [`16.25`, `16`, `16.75`, `16.5`, `17.25`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 37, s: `Quantitative Aptitude`, q: `Directions: Read the pie chart carefully and answer the following questions.
Note: No new employees joined the given banks of left the given banks from January 2015 to December
2015.
What is the average number of scale I officers in Banks D, E and F?`, qi: ``, o: [`63`, `65`, `64`, `67`, `68`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 38, s: `Quantitative Aptitude`, q: `In January 2015, the number of male Scale I Officers in Bank B was three times the number of
female Scale I Officers in the same bank. If in Bank D, the number of female Scale I Officers was
the same as that in bank B; what was the number of male Scale I Officers in Bank D?`, qi: ``, o: [`80`, `78`, `82`, `84`, `76`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 39, s: `Quantitative Aptitude`, q: `In January 2015, 32% of the total number of scale I officers in Banks B, D, and E together were
unmarried. If the respective ratio between the number of unmarried officers in these banks was 3 :
2 : 3, what was the number of unmarried Scale I officers in Bank D?`, qi: ``, o: [`18`, `24`, `14`, `20`, `16`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 40, s: `Quantitative Aptitude`, q: `In December 2014, 4% of the candidates who applied for a job as Scale 1 officer were recruited in
Bank A. If Bank A had 44 Scale I officers in 2014, what was the number of candidates who applied
for the job?`, qi: ``, o: [`240`, `450`, `400`, `250`, `300`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 41, s: `Quantitative Aptitude`, q: `In January 2016, some Scale I Officers resigned from Bank C and all of them joined Bank B. If the
resultant respective ratio between the number of Scale I Officers in Bank C and that in Bank B is
24 : 13, what is the number of Scale I Officers who resigned from Bank C?`, qi: ``, o: [`3`, `6`, `7`, `4`, `5`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 42, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and
mark the appropriate answer.
I. x2 + 7x + 10 = 0
II. y2 + 5y + 4 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 43, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and
mark the appropriate answer.
I. x2 + 35x + 306 = 0
II. y2 + 41y + 408 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 44, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and
mark the appropriate answer.
I. x2 - 19x + 60 = 0
II. y2 - 20y + 99 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 45, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and
mark the appropriate answer.
I. x2 - 28x + 195 = 0
II. y2 - 21y + 108 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 46, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and
mark the appropriate answer.
I. x2 + 19x + 78 = 0
II. 45y2 + 83y + 28 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 47, s: `Quantitative Aptitude`, q: `In the given question, two equations numbered l and II are given. Solve both the equations and
mark the appropriate answer.
I. x2 + 31x + 240 = 0
II. 5y2 + 60y + 135 = 0`, qi: ``, o: [`x > y`, `x < y`, `x ≥ y`, `x ≤ y`, `x = y or relationship between x and y cannot be established.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 48, s: `Quantitative Aptitude`, q: `The average monthly savings of Shifa for the first 5 months is Rs. 2120, for the next 3 months is
Rs. 4260 and for the remaining months of the year is Rs. 3140. Now, the average monthly
expenditure for the complete year is Rs. 11000. Find the total income of the year`, qi: ``, o: [`Rs. 170,520`, `Rs. 174,680`, `Rs. 180,950`, `Rs. 167,940`, `Rs. 190,360`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 49, s: `Quantitative Aptitude`, q: `In a class, 60% speak Hindi and 70% speak English. If 28% of the students can’t speak any of the
two languages, then what % of the students in the class can speak both the languages?`, qi: ``, o: [`55%`, `56%`, `58%`, `60%`, `62%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 50, s: `Quantitative Aptitude`, q: `Two equal glasses are filled with alcohol and water respectively. First glass is filled with (2/5) of
alcohol and second glass is filled with (1/4) of alcohol. Then, the glasses are filled up with water
and the resultant mixture is put into a big Jug. Find the ratio of alcohol and water in the jug.`, qi: ``, o: [`13 : 27`, `23 : 25`, `17 : 19`, `14 : 25`, `18 : 17`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 51, s: `Quantitative Aptitude`, q: `A train met with an accident 100 km from station P. It completes the remaining journey at 2/3 of
the previous speed and reached 42 min late at station Q. If the accident had taken place 40 km
further, it would have been only 22 min late. Then, what is the original speed of the train?`, qi: ``, o: [`60 km/hr`, `40 km/hr`, `30 km/hr`, `36 km/hr`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 52, s: `Quantitative Aptitude`, q: `A Man rows to a place 63 km far and comes back in 16 hours. He finds that he can row 18 km with
the flow in the same time taken to row 14 km against the flow. What is the speed of the stream?`, qi: ``, o: [`1 km/hr`, `2 km/hr`, `2.5 km/hr`, `4 km/hr`, `5 km/hr`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 53, s: `Quantitative Aptitude`, q: `A and B entered into a partnership by investing Rs. 8000 and Rs. 6000 respectively. After 8
months, A withdrew half his investment while B invested 1.5 times more of his investment more
and C joined the partnership with Rs. 12000. Find the profit share of C after 1 year if A got Rs. 8000 as
profit.`, qi: ``, o: [`Rs. 5400`, `Rs. 4500`, `Rs. 5000`, `Rs. 4800`, `Rs. 6000`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 54, s: `Quantitative Aptitude`, q: `Directions: Read the given pie and table carefully and answer the following questions.
The pie chart shows the percentage distribution of people who found COVID – 19 positive in four
major cities of India from 1st July to 31st August 2020 and the table shows the number of people who tested
positive in July from these cities.
City July
Mumbai 230068
Delhi 48149
Kolkata 83468
Chennai 147890
Number of people from Delhi who tested positive in July is what percent of total positive tested people of
that city?`, qi: ``, o: [`56%`, `57.32%`, `62.58%`, `60%`, `59.86%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 55, s: `Quantitative Aptitude`, q: `What is the average of the number of people in August from Mumbai and the number of people in
July from Chennai who tested positive?`, qi: ``, o: [`258911`, `324526`, `242478`, `278562`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 56, s: `Quantitative Aptitude`, q: `Total numbers of cases in July are how much more or less than the total number of cases in August
of all four cities?`, qi: ``, o: [`509575`, `690425`, `180850`, `245689`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 57, s: `Quantitative Aptitude`, q: `Total peoples tested positive in Delhi is what percent of the total number of people tested positive
in Mumbai?`, qi: ``, o: [`11%`, `14%`, `16%`, `18%`, `19%`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 58, s: `Quantitative Aptitude`, q: `If the recovery rate is 70% and the death rate is 10% of total tested cases in Chennai at the end of
July. How many active cases are on 1st August, if no case is found on that day?`, qi: ``, o: [`32593`, `21500`, `15320`, `29578`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 59, s: `Quantitative Aptitude`, q: `The cost of printing a book increased from Rs. 96 to Rs. 120 from the year 2013 to 2018, such that
the total money spent on printing books by a printing press increased in the ratio 5 ∶ 6. If the
printing press printed 200 books in the year 2013, how many books did they print in the year 2018?`, qi: ``, o: [`176`, `192`, `216`, `252`, `223`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 60, s: `Quantitative Aptitude`, q: `What is the total compound interest on Rs. 45000 for 3 years when the sum is divided into a ratio
of 4 : 5 and rate of interest on a small sum is 10% and 20% on the large sum? (Compounded
annually)`, qi: ``, o: [`Rs. 20010`, `Rs. 24820`, `Rs. 25630`, `Rs. 26400`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 61, s: `Quantitative Aptitude`, q: `A alone can do a piece of work in 15 days, while B alone can do it in 20 days. They work together
for 6 days and the rest of the work is done by C in 6 days. If they get Rs 800 for the whole work,
how should they divide the money?`, qi: ``, o: [`Rs. 320, Rs. 240 and Rs. 240`, `Rs. 640, Rs. 280 and Rs. 260`, `Rs. 320, Rs. 420 and Rs. 360`, `Rs. 360, Rs. 420 and Rs. 240`, `Rs. 320, Rs. 240 and Rs. 720`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 62, s: `Quantitative Aptitude`, q: `If a 50 liters mixture of milk and water is in the ratio of 3 : 2. After removal of 10 liters mixture, 12
liters milk and 12 liters water is added into the mixture. Find the final ratio of water and milk in the
mixture.`, qi: ``, o: [`9 : 7`, `7 : 9`, `3 : 2`, `2 : 3`, `1 : 1`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 63, s: `Quantitative Aptitude`, q: `A shopkeeper gives discounts of 10% on the T.V.. The marked price of T.V. is Rs. 8000. After
allowing discount, a shopkeeper gain 20 %. Find the cost price of a T.V.`, qi: ``, o: [`Rs. 7500`, `Rs. 8500`, `Rs. 3500`, `Rs. 4050`, `Rs. 6000`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 64, s: `Quantitative Aptitude`, q: `Five dice are tossed together. What is the probability of getting different faces in all of the dice?`, qi: ``, o: [`6!/66`, `6!/65`, `5!/65`, `5!/66`, `6!/55`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 65, s: `Quantitative Aptitude`, q: `A circular pavement was to be built around a square park of side 18 m. The maximum width of
pavement is 5 m. Calculate the cost of cementing the pavement at Rs. 15 per m2.`, qi: ``, o: [`Rs. 5000`, `Rs. 4750`, `Rs. 4360`, `Rs. 4380`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 66, s: `Reasoning Ability`, q: `Directions: Answer the questions based on the information given below.
Julie starts her journey from point ‘Z’ and walks 10km east to reach point ‘Y’ then she turns to her
left and walks 3km to reach point ‘R’ and then she turns to her left again and walks 12km to reach point ‘S’.
Again, she turns to her left and walks 3km to reach point ‘E’. Finally, she took to her right and moves for
another 4km to reach point J.
Point E is in which direction with respect to the point R?`, qi: ``, o: [`South west`, `North west`, `North east`, `North`, `South east`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 67, s: `Reasoning Ability`, q: `If point K is southwest of Y and 8km south of point Z then what is the shortest distance (Approx)
between point K and point Y?`, qi: ``, o: [`10 km`, `13 Km`, `8 Km`, `11 Km`, `15 Km`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 68, s: `Reasoning Ability`, q: `Which among the following is to the northwest of Point Z?`, qi: ``, o: [`Point J`, `Point E`, `Point S`, `Point R`, `Point Y`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 69, s: `Reasoning Ability`, q: `In the given word ‘MOTIVATION’ if the vowels are changed to the next letters and the consonants
are changed to the previous letters as per the alphabetical series, then which letter/letters are
repeated more than once?`, qi: ``, o: [`One`, `Two`, `Three`, `Four`, `None`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 70, s: `Reasoning Ability`, q: `If 2 is added to each even digit and 1 is subtracted from each odd digit in the number 945217, then
what will be the sum of number/numbers not repeated in the new number?`, qi: ``, o: [`6`, `8`, `4`, `5`, `7`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 71, s: `Reasoning Ability`, q: `How many pair of letters are there in the word “EFFECTIVE” which has as many letters (in both
forward and backward direction) in between as they have in English alphabet series?`, qi: ``, o: [`One`, `Two`, `Three`, `Four`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 72, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions that follow:
Nine boxes A, B, C, D, E, F, G, H, and I are kept one above the other not necessarily in the same
order.
Three boxes are kept between A and B. Equal number of boxes are kept above and below A. Number of
boxes kept above B is same as the number of boxes kept below C. Only two boxes are kept between C and I.
One box is kept between A and G, which is not kept immediate above I. No box is kept between F and D,
which is not kept above F. E is placed below H, which is kept immediate below D.
How many boxes are kept between F and A?`, qi: ``, o: [`None`, `Two`, `One`, `Three`, `More than three`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 73, s: `Reasoning Ability`, q: `Which box is kept immediately below H?`, qi: ``, o: [`I`, `F`, `D`, `E`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 74, s: `Reasoning Ability`, q: `Four of the following five are alike in a certain way and so form a group, find the one which does
not belong to the group.`, qi: ``, o: [`AG`, `BD`, `FH`, `IC`, `DA`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 75, s: `Reasoning Ability`, q: `Which of the following pairs represent the lowermost and the topmost box?`, qi: ``, o: [`EF`, `EB`, `CB`, `CF`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 76, s: `Reasoning Ability`, q: `Which of the following statement is / are true?`, qi: ``, o: [`Only one box is kept between F and A`, `All of the given statements are true`, `Three boxes are kept between E and H`, `I is kept immediately below G`, `None of the given statement is true`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 77, s: `Reasoning Ability`, q: `Direction: In the question below are given three statements followed by two conclusions
numbered I and II. You have to take the given statements to be true even if they seem to be at
variance with commonly known facts. Read all the conclusions and then decide which of the given
conclusions logically follows from the given statements disregarding commonly known facts.
Statements:
Some A are B.
All B are C.
Only a few D are C.
Conclusions:
I. Some D are not A.
II. Some D are not B.`, qi: ``, o: [`Only conclusion I follows`, `Only conclusion II follows`, `Both conclusion I and II follow`, `Either conclusion I or II follows`, `Neither conclusion I nor II follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 78, s: `Reasoning Ability`, q: `Direction: In the question below are given three statements followed by two conclusions
numbered I and II. You have to take the given statements to be true even if they seem to be at
variance with commonly known facts. Read all the conclusions and then decide which of the given
conclusions logically follows from the given statements disregarding commonly known facts.
Statements:
Some Sparrow are Parrot
Only a few Parrot are Camel.
All Camel are Goats.
Conclusions:
I. All Sparrow are Parrot.
II. Some Parrot are not Camel.`, qi: ``, o: [`Only conclusion I follows`, `Only conclusion II follows`, `Both conclusion I and II follow`, `Either conclusion I or II follows`, `Neither conclusion I nor II follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 79, s: `Reasoning Ability`, q: `Direction: In the question below are given three statements followed by two conclusions
numbered I and II. You have to take the given statements to be true even if they seem to be at
variance with commonly known facts. Read all the conclusions and then decide which of the given
conclusions logically follows from the given statements disregarding commonly known facts.
Statements:
Only a few Bus is Car.
Some Car is Train.
Some Train is Truck.
Conclusions:
I. Some Car is Truck.
II. All Bus being Car is a possibility.`, qi: ``, o: [`Only I follow`, `Only II follow`, `Both I and II follows`, `Either I or II follows`, `Neither I nor II follows`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 80, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions that follow:
Seven persons A, C, P, L, J, K, F are sitting around a circular table but not necessarily in the same
order. Only two of them are facing inside. Three persons are sitting between F and P when counted from the
right of F. L is sitting second to the left of K who is facing inside. L is not an immediate neighbor of A or F.
Both the immediate neighbors of K are facing in opposite direction as that of K. The person sitting adjacent
to both J and P is facing outside. A is sitting to the immediate left of F and facing outside. J is an immediate
neighbor of neither F nor P. L is sitting to the immediate left of P.
Who is sitting to the immediate right of J?`, qi: ``, o: [`P`, `C`, `F`, `L`, `A`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 81, s: `Reasoning Ability`, q: `How many persons are sitting between K and P?`, qi: ``, o: [`1`, `2`, `4`, `3`, `Either 2 or 3 persons`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 82, s: `Reasoning Ability`, q: `If A and L interchange their positions, who will be sitting to the third left of L?`, qi: ``, o: [`P`, `K`, `A`, `L`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 83, s: `Reasoning Ability`, q: `Four of the following five are alike in a way and hence form a group. Choose the one that does not
belong to the group.`, qi: ``, o: [`F`, `K`, `J`, `L`, `A`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 84, s: `Reasoning Ability`, q: `Who is sitting to the fifth right of F?`, qi: ``, o: [`A`, `L`, `P`, `K`, `C`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 85, s: `Reasoning Ability`, q: `Study the following information and answer the given questions.
Eight members of a family are living in a house, in which two are married couples. N is the father
of D. E is married to N. G and D are siblings. C is married to G. N has no son. K is the father of E. Q is the
only son of C. A is the brother-in-law of N.
Who among the following is the son-in-law of N?`, qi: ``, o: [`G`, `K`, `C`, `Q`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 86, s: `Reasoning Ability`, q: `How K is related to D?`, qi: ``, o: [`Father`, `Uncle`, `Grand Mother`, `Grand Father`, `None of these Which of the following statement is true?`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 87, s: `Reasoning Ability`, q: ``, qi: ``, o: [`K is the mother of A`, `D and C are Siblings`, `Q is the son of A`, `N is the husband of E`, `None is correct`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 88, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions that follow:
Five persons T, N, R, C and G went to the market on different days of a week from Monday to
Friday, but not necessarily in the same order. They wore different types of cloths among Cotton, Silk, Wool,
Leather and Linen. Additional information about them is given below.
Three persons went to the market between the persons who wore Cotton and Leather. T wore Silk cloth and
went on one of the days after C. C did not wear Linen. Two persons went to the market between R and N. R
and G did not wear Leather. The number of persons who went to the market before N is more than the
number of persons went to the market after N. C did not go to the market on Monday.
Who went to the market on Monday?`, qi: ``, o: [`C`, `R`, `G`, `N`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 89, s: `Reasoning Ability`, q: `C wore which type of cloth?`, qi: ``, o: [`Leather`, `Linen`, `Cotton`, `Wool`, `Either 1 or 2`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 90, s: `Reasoning Ability`, q: `How many persons went to the market between T and N?`, qi: ``, o: [`One`, `Two`, `Zero`, `Three`, `Four`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 91, s: `Reasoning Ability`, q: `Who went to the market at the first and last respectively?`, qi: ``, o: [`R, C`, `G, N`, `T, N`, `G, R`, `C, N`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 92, s: `Reasoning Ability`, q: `Which of the following statement is false?`, qi: ``, o: [`R did not go on Friday.`, `C did not wear Leather.`, `One person went ot the market between the persons who wore Wool and Leather.`, `N went on Thursday.`, `C and T went to the market on consecutive days.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 93, s: `Reasoning Ability`, q: `Direction: In the following questions, assuming the given statements to be true, find which of the
two conclusions I and II given them is/are definitely follow.
Statement: P ≤ Q < S = T ≥ U ≥ W < Z
Conclusion:
I. S > W
II. W = T`, qi: ``, o: [`Only conclusion II is true`, `Either conclusion I or II is true`, `Both conclusion I and II are true`, `Neither conclusion I nor II is true`, `Only conclusion I is true`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 94, s: `Reasoning Ability`, q: `Direction: In the given question, assuming the given statements to be true, find which of the
conclusions I and II given below the statements is/are definitely true.
Statements:
H > G < C, E ≥ K < D ≤ B, E = C
Conclusions:
I.G ≤ D
II. G>D`, qi: ``, o: [`If only conclusion I follows`, `If only conclusion II follows`, `If either conclusion I or conclusion II follows`, `If neither conclusion I nor conclusion II follows`, `If both conclusions follow`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 95, s: `Reasoning Ability`, q: `Directions: In the following question assuming the given statements to be true, find which of the
conclusion among the given conclusions is/ are definitely true and then give your answers
accordingly
Statements: H ≤ X ≤ R = O > T; Y = F ≥ R > D
Conclusions:
I. H ≥ Y
II. Y > H`, qi: ``, o: [`Only I is true`, `Only II is true`, `Either I or II is true`, `Both I and II is true`, `Neither I nor II is true`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 96, s: `Reasoning Ability`, q: `Directions: Study the following information carefully and answer the questions that follow:
Six persons P, Q, R, S, T and U were born in three different months May, September and
November, on two different dates- 9 and 16 not necessarily in the same order.
P was born after R but not on the same date as that of R. Number of persons born before S is equal to the
number of persons born after T. Q and U were born in the same month. T was born in a month having even
number of days. Two persons were born between R and T.
Who was born on 16th November?`, qi: ``, o: [`R`, `P`, `Q`, `U`, `Either Q or U`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 97, s: `Reasoning Ability`, q: `Who was born immediately before R?`, qi: ``, o: [`P`, `Q`, `S`, `T`, `No one`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 98, s: `Reasoning Ability`, q: `What is the square root of sum of the dates on which R and P were born?`, qi: ``, o: [`16`, `4`, `5`, `9`, `25`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 99, s: `Reasoning Ability`, q: `How many persons were born between P and U?`, qi: ``, o: [`2`, `3`, `4`, `1`, `Cannot be determined`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 100, s: `Reasoning Ability`, q: `Who was born in a month having odd number of days?`, qi: ``, o: [`S`, `T`, `Q`, `U`, `R`], oi: [``, ``, ``, ``, ``], e: `` }
];

if (RAW.length !== 100) { console.error(`Expected 100, got ${RAW.length}`); process.exit(1); }
if (KEY.length !== 100) { console.error(`KEY length ${KEY.length}`); process.exit(1); }

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
    let optImages = ['', '', '', '', ''];
    if (r.qi) {
      process.stdout.write(`Q${n} q-img... `);
      qImage = await uploadImage(r.qi, `${F}-q-${n}`);
      console.log(qImage ? 'ok' : 'missing');
    }
    for (let oi = 0; oi < 5; oi++) {
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
      tags: ['IBPS', 'PO', 'Prelims', 'PYQ', '2021', '04 December 2021 Shift-3'],
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

  let exam = await Exam.findOne({ code: 'IBPS-PO-PRE' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'IBPS PO (Probationary Officer) - Prelims',
      code: 'IBPS-PO-PRE',
      description: 'Institute of Banking Personnel Selection - Probationary Officer Preliminary Examination',
      isActive: true
    });
    console.log('Created Exam: IBPS-PO-PRE');
  }

  const PATTERN_TITLE = 'IBPS PO Prelims';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 60, totalMarks: 100, negativeMarking: 0.25,
      sections: [
        { name: ENG, totalQuestions: 30, marksPerQuestion: 1, negativePerQuestion: 0.25, sectionDuration: 20 },
        { name: REA, totalQuestions: 35, marksPerQuestion: 1, negativePerQuestion: 0.25, sectionDuration: 20 },
        { name: QA,  totalQuestions: 35, marksPerQuestion: 1, negativePerQuestion: 0.25, sectionDuration: 20 }
      ]
    });
    console.log('Created ExamPattern: IBPS PO Prelims');
  }

  const TEST_TITLE = `IBPS PO Prelims - 04 December 2021 Shift-3`;
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2021, pyqShift: `04 December 2021 Shift-3`,
    pyqExamName: 'IBPS PO Prelims', questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
