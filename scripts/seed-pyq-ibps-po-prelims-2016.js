/**
 * Seed: IBPS PO Prelims - 2016
 * IBPS PO Prelims — Probationary Officer Preliminary Exam.
 * 100 Q × 1 mark, 3 sections (Eng 30 / Reas 35 / Quant 35), 60 min total,
 * sectional timing 20 min each, 0.25 negative marking.
 * Uploads question/option images from local _extracted_ibps_po_2016/ to Cloudinary.
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

const EXTRACTED_DIR = path.resolve(__dirname, '../_extracted_ibps_po_2016');
const CLOUDINARY_FOLDER = 'aajexam/pyq/ibps-po-prelims-2016';
const F = '2016';

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

const KEY = [1, 3, 2, 3, 2, 4, 5, 3, 4, 1, 2, 1, 2, 1, 5, 3, 5, 2, 4, 1, 4, 3, 1, 5, 4, 1, 1, 4, 3, 1, 2, 2, 1, 5, 4, 2, 4, 1, 4, 3, 3, 3, 4, 3, 2, 2, 3, 2, 5, 1, 5, 5, 3, 5, 4, 5, 2, 4, 4, 4, 2, 4, 3, 4, 1, 2, 4, 5, 3, 1, 3, 1, 5, 2, 4, 5, 5, 5, 2, 2, 3, 1, 2, 4, 1, 3, 5, 3, 2, 3, 2, 1, 1, 4, 2, 5, 5, 4, 2, 4];
const RAW = [
  { n: 1, s: `English Language`, q: `Read the given passage and 
answer the questions that follow. 
 
 Economic interdependence and globalization has 
resulted in a system in which each country is 
largely dependent upon other countries for 
economic sustainability (though to varying 
degrees). This results in a substantial national 
security threat in the form of conflicting or 
offensive trade strategies between countries. 
Indeed, economics is often used directly as a 
weapon of war and conflict via trad e sanctions. 
This highlights a critical protectionist argument 
pertaining to the very real risk of dependency upon 
other nations for economic sustainability. 
An interesting discussion in economics is the 
relationship between trade and conflict. It has been 
noted, somewhat intuitively and empirically, that 
conflict reduces trade. However, is it also the case 
that trade reduces conflict? This question is largely 
unanswered, although the stances are becoming 
more highly developed. It is hypothesized that 
trade does not necessarily reduce conflict, but 
instead changes the nature of the conflict. 
Economic levers are much more practical than 
military levers, and are often used for similar 
reasons. For this reason, it is difficult to separate 
trade and conflict co mpletely because there is 
some critical overlap between the two. This is a 
fundamental foundation for the trade protectionism 
logic from a national security perspective. 
A more specific context for trade and conflict can 
be the way in which trade is compl icated during 
wartime. Indeed, trade during wartime can be a 
substantial threat to a nation depending on the 
scale and scope of the conflict (most notably who is 
involved). For example, consider World War II. In 
this scenario Germany was largely isolated i n the 
conflict, and therefore had extremely limited trade 
partners. Direct conflict will almost always result in 
a complete cease in trading not only between the 
country in which the war is occurring, but also any 
of that country's allies (who may or may n ot be 
directly involved). However, some argue self -
sufficiency (via protectionism) in war is not 
necessary, as friendly nations will still provi de 
trade and economic support. 
 Sanctions also play a dramatic role as an offensive 
militaristic manoeuver. Ira n and North Korea are 
strong modern examples as well as the recent 
history of the U.S. -Iraq war. In all of these 
circumstances, either the U.S. alone or along with 
a number of allies (representing substantial 
consumption percentages) actively limited the 
ability for these countries to trade and generate 
economic value for their nations (and subsequently 
their people). While this looks purely economic, it 
has important social and huma nitarian implications 
as well. 
 Combining these ideas, it is clear that there is 
substantial national security value to trade 
protectionism. However, the opportunity cost of 
leveraging the ever -growing global markets makes 
this an unattractive prospect if taken to any 
extreme, as the benefits of global trade rapidly 
offset the risk of economic dependency upon 
hostile nations.

Trade is specifically complicated for a nation during 
wartime because-`, qi: ``, o: [`nations and their allies that are in direct conflict 
mostly cease the trade altogether`, `the economy of the warring nation collapses 
completely`, `even friendly nations cease trading and 
economic support during the wartime`, `it is impossible to carry out trade during war 
and conflict`, `None of these`], oi: [``, ``, ``, ``, ``], e: `This can be interpreted from the following lines, “Direct conflict will almost always result in a complete cease in trading not only between the country in which the war is occurring, but also any of that country's allies (who may or may not be directly involved).”` },
  { n: 2, s: `English Language`, q: `Read the given passage and 
answer the questions that follow. 
 
 Economic interdependence and globalization has 
resulted in a system in which each country is 
largely dependent upon other countries for 
economic sustainability (though to varying 
degrees). This results in a substantial national 
security threat in the form of conflicting or 
offensive trade strategies between countries. 
Indeed, economics is often used directly as a 
weapon of war and conflict via trad e sanctions. 
This highlights a critical protectionist argument 
pertaining to the very real risk of dependency upon 
other nations for economic sustainability. 
An interesting discussion in economics is the 
relationship between trade and conflict. It has been 
noted, somewhat intuitively and empirically, that 
conflict reduces trade. However, is it also the case 
that trade reduces conflict? This question is largely 
unanswered, although the stances are becoming 
more highly developed. It is hypothesized that 
trade does not necessarily reduce conflict, but 
instead changes the nature of the conflict. 
Economic levers are much more practical than 
military levers, and are often used for similar 
reasons. For this reason, it is difficult to separate 
trade and conflict co mpletely because there is 
some critical overlap between the two. This is a 
fundamental foundation for the trade protectionism 
logic from a national security perspective. 
A more specific context for trade and conflict can 
be the way in which trade is compl icated during 
wartime. Indeed, trade during wartime can be a 
substantial threat to a nation depending on the 
scale and scope of the conflict (most notably who is 
involved). For example, consider World War II. In 
this scenario Germany was largely isolated i n the 
conflict, and therefore had extremely limited trade 
partners. Direct conflict will almost always result in 
a complete cease in trading not only between the 
country in which the war is occurring, but also any 
of that country's allies (who may or may n ot be 
directly involved). However, some argue self -
sufficiency (via protectionism) in war is not 
necessary, as friendly nations will still provi de 
trade and economic support. 
 Sanctions also play a dramatic role as an offensive 
militaristic manoeuver. Ira n and North Korea are 
strong modern examples as well as the recent 
history of the U.S. -Iraq war. In all of these 
circumstances, either the U.S. alone or along with 
a number of allies (representing substantial 
consumption percentages) actively limited the 
ability for these countries to trade and generate 
economic value for their nations (and subsequently 
their people). While this looks purely economic, it 
has important social and huma nitarian implications 
as well. 
 Combining these ideas, it is clear that there is 
substantial national security value to trade 
protectionism. However, the opportunity cost of 
leveraging the ever -growing global markets makes 
this an unattractive prospect if taken to any 
extreme, as the benefits of global trade rapidly 
offset the risk of economic dependency upon 
hostile nations.

What is the motive of the author behind writing 
this passage?`, qi: ``, o: [`To analyse the effects of conflict on trade and 
vice versa`, `To explain the irrelevance of trade protectionism 
in the globalized world`, `To evaluate the arguments in favour of the use 
of trade protectionism for national security`, `To analyse social and humanitarian implications 
of trade protectionism`, `To highlight the importance of self-sufficiency for 
national security`], oi: [``, ``, ``, ``, ``], e: `The passage revolves around the idea that trade protectionism plays an important role as a weapon of the war and conflict through trade sanctions. It also states various arguments in the favour of trade protectionism as economic levers are much more practical than military levers. Hence, option C is the correct answer.` },
  { n: 3, s: `English Language`, q: `Read the given passage and 
answer the questions that follow. 
 
 Economic interdependence and globalization has 
resulted in a system in which each country is 
largely dependent upon other countries for 
economic sustainability (though to varying 
degrees). This results in a substantial national 
security threat in the form of conflicting or 
offensive trade strategies between countries. 
Indeed, economics is often used directly as a 
weapon of war and conflict via trad e sanctions. 
This highlights a critical protectionist argument 
pertaining to the very real risk of dependency upon 
other nations for economic sustainability. 
An interesting discussion in economics is the 
relationship between trade and conflict. It has been 
noted, somewhat intuitively and empirically, that 
conflict reduces trade. However, is it also the case 
that trade reduces conflict? This question is largely 
unanswered, although the stances are becoming 
more highly developed. It is hypothesized that 
trade does not necessarily reduce conflict, but 
instead changes the nature of the conflict. 
Economic levers are much more practical than 
military levers, and are often used for similar 
reasons. For this reason, it is difficult to separate 
trade and conflict co mpletely because there is 
some critical overlap between the two. This is a 
fundamental foundation for the trade protectionism 
logic from a national security perspective. 
A more specific context for trade and conflict can 
be the way in which trade is compl icated during 
wartime. Indeed, trade during wartime can be a 
substantial threat to a nation depending on the 
scale and scope of the conflict (most notably who is 
involved). For example, consider World War II. In 
this scenario Germany was largely isolated i n the 
conflict, and therefore had extremely limited trade 
partners. Direct conflict will almost always result in 
a complete cease in trading not only between the 
country in which the war is occurring, but also any 
of that country's allies (who may or may n ot be 
directly involved). However, some argue self -
sufficiency (via protectionism) in war is not 
necessary, as friendly nations will still provi de 
trade and economic support. 
 Sanctions also play a dramatic role as an offensive 
militaristic manoeuver. Ira n and North Korea are 
strong modern examples as well as the recent 
history of the U.S. -Iraq war. In all of these 
circumstances, either the U.S. alone or along with 
a number of allies (representing substantial 
consumption percentages) actively limited the 
ability for these countries to trade and generate 
economic value for their nations (and subsequently 
their people). While this looks purely economic, it 
has important social and huma nitarian implications 
as well. 
 Combining these ideas, it is clear that there is 
substantial national security value to trade 
protectionism. However, the opportunity cost of 
leveraging the ever -growing global markets makes 
this an unattractive prospect if taken to any 
extreme, as the benefits of global trade rapidly 
offset the risk of economic dependency upon 
hostile nations.

Which of the following can be used as a weapon of 
war and conflict?`, qi: ``, o: [`Extreme economic dependence`, `Trade sanctions`, `Currency manipulation`, `Withdrawal of bilateral treaties`, `All of the above`], oi: [``, ``, ``, ``, ``], e: `This can be interpreted from these lines of the passage, “Sanctions also play a dramatic role as an offensive militaristic manoeuver” and "Indeed, economics is often used directly as a weapon of war and conflict via trade sanctions."` },
  { n: 4, s: `English Language`, q: `Read the given passage and 
answer the questions that follow. 
 
 Economic interdependence and globalization has 
resulted in a system in which each country is 
largely dependent upon other countries for 
economic sustainability (though to varying 
degrees). This results in a substantial national 
security threat in the form of conflicting or 
offensive trade strategies between countries. 
Indeed, economics is often used directly as a 
weapon of war and conflict via trad e sanctions. 
This highlights a critical protectionist argument 
pertaining to the very real risk of dependency upon 
other nations for economic sustainability. 
An interesting discussion in economics is the 
relationship between trade and conflict. It has been 
noted, somewhat intuitively and empirically, that 
conflict reduces trade. However, is it also the case 
that trade reduces conflict? This question is largely 
unanswered, although the stances are becoming 
more highly developed. It is hypothesized that 
trade does not necessarily reduce conflict, but 
instead changes the nature of the conflict. 
Economic levers are much more practical than 
military levers, and are often used for similar 
reasons. For this reason, it is difficult to separate 
trade and conflict co mpletely because there is 
some critical overlap between the two. This is a 
fundamental foundation for the trade protectionism 
logic from a national security perspective. 
A more specific context for trade and conflict can 
be the way in which trade is compl icated during 
wartime. Indeed, trade during wartime can be a 
substantial threat to a nation depending on the 
scale and scope of the conflict (most notably who is 
involved). For example, consider World War II. In 
this scenario Germany was largely isolated i n the 
conflict, and therefore had extremely limited trade 
partners. Direct conflict will almost always result in 
a complete cease in trading not only between the 
country in which the war is occurring, but also any 
of that country's allies (who may or may n ot be 
directly involved). However, some argue self -
sufficiency (via protectionism) in war is not 
necessary, as friendly nations will still provi de 
trade and economic support. 
 Sanctions also play a dramatic role as an offensive 
militaristic manoeuver. Ira n and North Korea are 
strong modern examples as well as the recent 
history of the U.S. -Iraq war. In all of these 
circumstances, either the U.S. alone or along with 
a number of allies (representing substantial 
consumption percentages) actively limited the 
ability for these countries to trade and generate 
economic value for their nations (and subsequently 
their people). While this looks purely economic, it 
has important social and huma nitarian implications 
as well. 
 Combining these ideas, it is clear that there is 
substantial national security value to trade 
protectionism. However, the opportunity cost of 
leveraging the ever -growing global markets makes 
this an unattractive prospect if taken to any 
extreme, as the benefits of global trade rapidly 
offset the risk of economic dependency upon 
hostile nations.

Which of the following statements can be definitely 
concluded in the context of trade and conflict? 
(i). They are overlapping in nature 
(ii). It is believed that conflict reduces trade 
(iii). Trade changes the nature of conflict`, qi: ``, o: [`Only (i)`, `Only (iii)`, `(i), (ii) and (iii)`, `Both (i) and (ii)`, `Both (i) and (iii)`], oi: [``, ``, ``, ``, ``], e: `Statement (i) can be interpreted from these lines, “it is difficult to separate trade and conflict completely because there is some cr itical overlap between the two.” Statement (ii) can be concluded from these lines, “… that conflict reduces trade.” Statement (iii) can be interpreted from these lines “trade does not necessarily reduce conflict, but instead changes the nature of the confl ict.” Hence, option C is the correct answer.` },
  { n: 5, s: `English Language`, q: `Read the given passage and 
answer the questions that follow. 
 
 Economic interdependence and globalization has 
resulted in a system in which each country is 
largely dependent upon other countries for 
economic sustainability (though to varying 
degrees). This results in a substantial national 
security threat in the form of conflicting or 
offensive trade strategies between countries. 
Indeed, economics is often used directly as a 
weapon of war and conflict via trad e sanctions. 
This highlights a critical protectionist argument 
pertaining to the very real risk of dependency upon 
other nations for economic sustainability. 
An interesting discussion in economics is the 
relationship between trade and conflict. It has been 
noted, somewhat intuitively and empirically, that 
conflict reduces trade. However, is it also the case 
that trade reduces conflict? This question is largely 
unanswered, although the stances are becoming 
more highly developed. It is hypothesized that 
trade does not necessarily reduce conflict, but 
instead changes the nature of the conflict. 
Economic levers are much more practical than 
military levers, and are often used for similar 
reasons. For this reason, it is difficult to separate 
trade and conflict co mpletely because there is 
some critical overlap between the two. This is a 
fundamental foundation for the trade protectionism 
logic from a national security perspective. 
A more specific context for trade and conflict can 
be the way in which trade is compl icated during 
wartime. Indeed, trade during wartime can be a 
substantial threat to a nation depending on the 
scale and scope of the conflict (most notably who is 
involved). For example, consider World War II. In 
this scenario Germany was largely isolated i n the 
conflict, and therefore had extremely limited trade 
partners. Direct conflict will almost always result in 
a complete cease in trading not only between the 
country in which the war is occurring, but also any 
of that country's allies (who may or may n ot be 
directly involved). However, some argue self -
sufficiency (via protectionism) in war is not 
necessary, as friendly nations will still provi de 
trade and economic support. 
 Sanctions also play a dramatic role as an offensive 
militaristic manoeuver. Ira n and North Korea are 
strong modern examples as well as the recent 
history of the U.S. -Iraq war. In all of these 
circumstances, either the U.S. alone or along with 
a number of allies (representing substantial 
consumption percentages) actively limited the 
ability for these countries to trade and generate 
economic value for their nations (and subsequently 
their people). While this looks purely economic, it 
has important social and huma nitarian implications 
as well. 
 Combining these ideas, it is clear that there is 
substantial national security value to trade 
protectionism. However, the opportunity cost of 
leveraging the ever -growing global markets makes 
this an unattractive prospect if taken to any 
extreme, as the benefits of global trade rapidly 
offset the risk of economic dependency upon 
hostile nations.

How did sanctions play a dramatic role as an 
offensive militaristic mano euvre during the U.S -
Iraq war? 
 (i). By isolating Iraq on various cultural and 
religious platforms 
 (ii). By hindering the flo w of technology and 
innovation 
 (iii). By inhibiting the trading capacity of Iraq`, qi: ``, o: [`Only (i)`, `Only (iii)`, `Both (ii) and (iii)`, `Both (i) and (ii)`, `Both (i) and (iii)`], oi: [``, ``, ``, ``, ``], e: `The US sanctions inhibited the trading capacity of Iraq which can be interpreted from these lines of the passage, “In all of these circumstances, either the U.S. alone or along with a number of allies (representing substantial consumption percentages) actively limited the ability for these countries to trade”. Hence, option B is the correct answer.` },
  { n: 6, s: `English Language`, q: `Read the given passage and 
answer the questions that follow. 
 
 Economic interdependence and globalization has 
resulted in a system in which each country is 
largely dependent upon other countries for 
economic sustainability (though to varying 
degrees). This results in a substantial national 
security threat in the form of conflicting or 
offensive trade strategies between countries. 
Indeed, economics is often used directly as a 
weapon of war and conflict via trad e sanctions. 
This highlights a critical protectionist argument 
pertaining to the very real risk of dependency upon 
other nations for economic sustainability. 
An interesting discussion in economics is the 
relationship between trade and conflict. It has been 
noted, somewhat intuitively and empirically, that 
conflict reduces trade. However, is it also the case 
that trade reduces conflict? This question is largely 
unanswered, although the stances are becoming 
more highly developed. It is hypothesized that 
trade does not necessarily reduce conflict, but 
instead changes the nature of the conflict. 
Economic levers are much more practical than 
military levers, and are often used for similar 
reasons. For this reason, it is difficult to separate 
trade and conflict co mpletely because there is 
some critical overlap between the two. This is a 
fundamental foundation for the trade protectionism 
logic from a national security perspective. 
A more specific context for trade and conflict can 
be the way in which trade is compl icated during 
wartime. Indeed, trade during wartime can be a 
substantial threat to a nation depending on the 
scale and scope of the conflict (most notably who is 
involved). For example, consider World War II. In 
this scenario Germany was largely isolated i n the 
conflict, and therefore had extremely limited trade 
partners. Direct conflict will almost always result in 
a complete cease in trading not only between the 
country in which the war is occurring, but also any 
of that country's allies (who may or may n ot be 
directly involved). However, some argue self -
sufficiency (via protectionism) in war is not 
necessary, as friendly nations will still provi de 
trade and economic support. 
 Sanctions also play a dramatic role as an offensive 
militaristic manoeuver. Ira n and North Korea are 
strong modern examples as well as the recent 
history of the U.S. -Iraq war. In all of these 
circumstances, either the U.S. alone or along with 
a number of allies (representing substantial 
consumption percentages) actively limited the 
ability for these countries to trade and generate 
economic value for their nations (and subsequently 
their people). While this looks purely economic, it 
has important social and huma nitarian implications 
as well. 
 Combining these ideas, it is clear that there is 
substantial national security value to trade 
protectionism. However, the opportunity cost of 
leveraging the ever -growing global markets makes 
this an unattractive prospect if taken to any 
extreme, as the benefits of global trade rapidly 
offset the risk of economic dependency upon 
hostile nations.

Which of the following statements is a substantial 
protectionist argument pertaining to the risk of 
dependency upon other nations for economic 
sustainability? 
 (i). Dependency on other nations indirectly 
influences the domestic a nd foreign policies of a 
nation 
 (ii). Threat in the form of conflicting or offensive 
trade strategies between countries 
 (iii). Subservience on various economic and 
sovereignty issues`, qi: ``, o: [`Only (i)`, `Only (iii)`, `(i), (ii) and (iii)`, `Only (ii)`, `None of these`], oi: [``, ``, ``, ``, ``], e: `Statement (ii) can be interpreted from the first paragraph of the passage. The other statement s can't be inferred from the passage in the same context. Hence, option D is the most suitable response.` },
  { n: 7, s: `English Language`, q: `Read the given passage and 
answer the questions that follow. 
 
 Economic interdependence and globalization has 
resulted in a system in which each country is 
largely dependent upon other countries for 
economic sustainability (though to varying 
degrees). This results in a substantial national 
security threat in the form of conflicting or 
offensive trade strategies between countries. 
Indeed, economics is often used directly as a 
weapon of war and conflict via trad e sanctions. 
This highlights a critical protectionist argument 
pertaining to the very real risk of dependency upon 
other nations for economic sustainability. 
An interesting discussion in economics is the 
relationship between trade and conflict. It has been 
noted, somewhat intuitively and empirically, that 
conflict reduces trade. However, is it also the case 
that trade reduces conflict? This question is largely 
unanswered, although the stances are becoming 
more highly developed. It is hypothesized that 
trade does not necessarily reduce conflict, but 
instead changes the nature of the conflict. 
Economic levers are much more practical than 
military levers, and are often used for similar 
reasons. For this reason, it is difficult to separate 
trade and conflict co mpletely because there is 
some critical overlap between the two. This is a 
fundamental foundation for the trade protectionism 
logic from a national security perspective. 
A more specific context for trade and conflict can 
be the way in which trade is compl icated during 
wartime. Indeed, trade during wartime can be a 
substantial threat to a nation depending on the 
scale and scope of the conflict (most notably who is 
involved). For example, consider World War II. In 
this scenario Germany was largely isolated i n the 
conflict, and therefore had extremely limited trade 
partners. Direct conflict will almost always result in 
a complete cease in trading not only between the 
country in which the war is occurring, but also any 
of that country's allies (who may or may n ot be 
directly involved). However, some argue self -
sufficiency (via protectionism) in war is not 
necessary, as friendly nations will still provi de 
trade and economic support. 
 Sanctions also play a dramatic role as an offensive 
militaristic manoeuver. Ira n and North Korea are 
strong modern examples as well as the recent 
history of the U.S. -Iraq war. In all of these 
circumstances, either the U.S. alone or along with 
a number of allies (representing substantial 
consumption percentages) actively limited the 
ability for these countries to trade and generate 
economic value for their nations (and subsequently 
their people). While this looks purely economic, it 
has important social and huma nitarian implications 
as well. 
 Combining these ideas, it is clear that there is 
substantial national security value to trade 
protectionism. However, the opportunity cost of 
leveraging the ever -growing global markets makes 
this an unattractive prospect if taken to any 
extreme, as the benefits of global trade rapidly 
offset the risk of economic dependency upon 
hostile nations.

Which of the following statements is definitely 
FALSE in the context of the given passage?`, qi: ``, o: [`Trade and conflict are interrelated`, `Germany was largely isolated during the World 
War II`, `The ever growing global markets have 
weakened the importance of trade protectionism as 
a national security measure`, `Sanctions as an offensive militaristic manoeuvre 
have important social and humanitarian 
implications`, `None of the above 
 
 Direction (8-12): Rearrange the following six 
sentences A, B, C, D, E and F in the proper 
sequence to form a meaningful paragraph, then 
answer the questions given below them. 
 
 A. While the reference point for the former is the 
state, for the latter it’s society. 
 B. India’s strategic community’ comprises two 
distinct circles with little overlap. 
 C. Consequently, mainstream strategists have an 
external orientation to their discourse, 
concentrating on high politics; the lat ter is more 
internal oriented. 
 D. Their prescriptions too are understandably poles 
apart and thus, the state, to which both their 
commentary is directed, has to play balancer, and 
ends up being at the receiving end of criticism from 
both sides. 
 E. Out of the two, one can be termed the 
‘mainstream’ and the other ‘alternate’. 
 F. To further elaborate on the external and internal 
concept−while one is enamored of India’s rise and 
place in the global order, the other is more 
sensitive to its vulnerabilities and inadequacies.`], oi: [``, ``, ``, ``, ``], e: `Statement A can be interpreted from these lines, “For this reason, it is difficult to separate trade and conflict completely because there i s some critical overlap between the two.” Statement B can be interpreted from these lines, “Germany was largely isolated in the conflict, and therefore had extremely limited trade partners.” Statement C can be interpreted from these lines, “However, the op portunity cost of leveraging the ever - growing global markets make this an unattractive prospect if taken to any extreme, as the benefits of global trade rapidly offset the risk of economic dependency upon hostile nations.” Statement D can be interpreted fr om these lines, “In all of these circumstances, either the U.S. alone or along with a number of allies (representing substantial consumption percentages) actively limited the ability for these countries to trade and generate economic value for their nations (and subsequently their people). While this looks purely economic, it has important social and humanitarian implications as well.” Hence, option E is the correct answer.` },
  { n: 8, s: `English Language`, q: `Rearrange the following six 
sentences A, B, C, D, E and F in the proper 
sequence to form a meaningful paragraph, then 
answer the questions given below them. 
 
 A. While the reference point for the former is the 
state, for the latter it’s society. 
 B. India’s strategic community’ comprises two 
distinct circles with little overlap. 
 C. Consequently, mainstream strategists have an 
external orientation to their discourse, 
concentrating on high politics; the lat ter is more 
internal oriented. 
 D. Their prescriptions too are understandably poles 
apart and thus, the state, to which both their 
commentary is directed, has to play balancer, and 
ends up being at the receiving end of criticism from 
both sides. 
 E. Out of the two, one can be termed the 
‘mainstream’ and the other ‘alternate’. 
 F. To further elaborate on the external and internal 
concept−while one is enamored of India’s rise and 
place in the global order, the other is more 
sensitive to its vulnerabilities and inadequacies.

Which of the following shoul d be the FOURTH 
sentence after rearrangement?`, qi: ``, o: [`E`, `D`, `C`, `B`, `A`], oi: [``, ``, ``, ``, ``], e: `Refer to the last question of the series.` },
  { n: 9, s: `English Language`, q: `Rearrange the following six 
sentences A, B, C, D, E and F in the proper 
sequence to form a meaningful paragraph, then 
answer the questions given below them. 
 
 A. While the reference point for the former is the 
state, for the latter it’s society. 
 B. India’s strategic community’ comprises two 
distinct circles with little overlap. 
 C. Consequently, mainstream strategists have an 
external orientation to their discourse, 
concentrating on high politics; the lat ter is more 
internal oriented. 
 D. Their prescriptions too are understandably poles 
apart and thus, the state, to which both their 
commentary is directed, has to play balancer, and 
ends up being at the receiving end of criticism from 
both sides. 
 E. Out of the two, one can be termed the 
‘mainstream’ and the other ‘alternate’. 
 F. To further elaborate on the external and internal 
concept−while one is enamored of India’s rise and 
place in the global order, the other is more 
sensitive to its vulnerabilities and inadequacies.

Which of the following should be the SIXTH 
sentence after rearrangement?`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `Refer to the last question of the series.` },
  { n: 10, s: `English Language`, q: `Rearrange the following six 
sentences A, B, C, D, E and F in the proper 
sequence to form a meaningful paragraph, then 
answer the questions given below them. 
 
 A. While the reference point for the former is the 
state, for the latter it’s society. 
 B. India’s strategic community’ comprises two 
distinct circles with little overlap. 
 C. Consequently, mainstream strategists have an 
external orientation to their discourse, 
concentrating on high politics; the lat ter is more 
internal oriented. 
 D. Their prescriptions too are understandably poles 
apart and thus, the state, to which both their 
commentary is directed, has to play balancer, and 
ends up being at the receiving end of criticism from 
both sides. 
 E. Out of the two, one can be termed the 
‘mainstream’ and the other ‘alternate’. 
 F. To further elaborate on the external and internal 
concept−while one is enamored of India’s rise and 
place in the global order, the other is more 
sensitive to its vulnerabilities and inadequacies.

Which of the following should be the SECOND 
sentence after rearrangement?`, qi: ``, o: [`E`, `D`, `C`, `B`, `A`], oi: [``, ``, ``, ``, ``], e: `Refer to the last question of the series.` },
  { n: 11, s: `English Language`, q: `Rearrange the following six 
sentences A, B, C, D, E and F in the proper 
sequence to form a meaningful paragraph, then 
answer the questions given below them. 
 
 A. While the reference point for the former is the 
state, for the latter it’s society. 
 B. India’s strategic community’ comprises two 
distinct circles with little overlap. 
 C. Consequently, mainstream strategists have an 
external orientation to their discourse, 
concentrating on high politics; the lat ter is more 
internal oriented. 
 D. Their prescriptions too are understandably poles 
apart and thus, the state, to which both their 
commentary is directed, has to play balancer, and 
ends up being at the receiving end of criticism from 
both sides. 
 E. Out of the two, one can be termed the 
‘mainstream’ and the other ‘alternate’. 
 F. To further elaborate on the external and internal 
concept−while one is enamored of India’s rise and 
place in the global order, the other is more 
sensitive to its vulnerabilities and inadequacies.

Which of the following should be the FIRST 
sentence after rearrangement?`, qi: ``, o: [`A`, `B`, `C`, `D`, `E`], oi: [``, ``, ``, ``, ``], e: `Refer to the last question of the series.` },
  { n: 12, s: `English Language`, q: `Rearrange the following six 
sentences A, B, C, D, E and F in the proper 
sequence to form a meaningful paragraph, then 
answer the questions given below them. 
 
 A. While the reference point for the former is the 
state, for the latter it’s society. 
 B. India’s strategic community’ comprises two 
distinct circles with little overlap. 
 C. Consequently, mainstream strategists have an 
external orientation to their discourse, 
concentrating on high politics; the lat ter is more 
internal oriented. 
 D. Their prescriptions too are understandably poles 
apart and thus, the state, to which both their 
commentary is directed, has to play balancer, and 
ends up being at the receiving end of criticism from 
both sides. 
 E. Out of the two, one can be termed the 
‘mainstream’ and the other ‘alternate’. 
 F. To further elaborate on the external and internal 
concept−while one is enamored of India’s rise and 
place in the global order, the other is more 
sensitive to its vulnerabilities and inadequacies.

Which of the following should be the THIRD 
sentence after rearrangement?`, qi: ``, o: [`A`, `B`, `C`, `D`, `E 
 
 Direction (13-20): In the following passage, 
there are blanks, each of which has been 
numbered. These numbers are printed below the 
passage and against each, five words are 
suggested, one of which fits the blank 
appropriately. Find out the appropriate word in 
each case 
 
 Invention should not be (###Q13###) with 
innovation though both involve creativity to design 
a new product or conceive a new idea or process. 
Innovation is more than just invention, for, after 
creating something new, innovation would make it 
a/an (###Q14## #) through action and 
implementation. The best innovators are those who 
constantly seek to make components that are 
better, faster, cheaper and more efficient, thereby 
increasing the (###Q15###) of what they make 
and sell. After they have implemented this 
upgrade, the innovator will then file a 
(###Q16###) to protect his/her interests. While 
some may actually succeed using this 
(###Q17###) an/a (###Q18###) number of 
such creations fail because they are often 
theoretical, without a basis for marketability. 
Therefore, a more (###Q19###) approach is to 
look at market data, talk to (###Q20###) 
customers, understand their requirements and then 
devise a solution to address a particular problem.`], oi: [``, ``, ``, ``, ``], e: `The third sentence after rearrangement is option A. While arranging sentences in a paragraph it is essential to understand the central theme and then arrange the following subthemes. Here, the first sentence should be statement B as it introduces the main topic. It should be followed by statement E as it talks about the terminologies for the two distinctions. Statem ent A should follow as it talks about the description of difference being talked about. Next should be statement C. It should be followed by statement F as it is a continuing statement about the internal and external concept. Last should be statement D as a concluding sentence. Hence, the correct sequence is BEACFD.` },
  { n: 13, s: `English Language`, q: `In the following passage, 
there are blanks, each of which has been 
numbered. These numbers are printed below the 
passage and against each, five words are 
suggested, one of which fits the blank 
appropriately. Find out the appropriate word in 
each case 
 
 Invention should not be (###Q13###) with 
innovation though both involve creativity to design 
a new product or conceive a new idea or process. 
Innovation is more than just invention, for, after 
creating something new, innovation would make it 
a/an (###Q14## #) through action and 
implementation. The best innovators are those who 
constantly seek to make components that are 
better, faster, cheaper and more efficient, thereby 
increasing the (###Q15###) of what they make 
and sell. After they have implemented this 
upgrade, the innovator will then file a 
(###Q16###) to protect his/her interests. While 
some may actually succeed using this 
(###Q17###) an/a (###Q18###) number of 
such creations fail because they are often 
theoretical, without a basis for marketability. 
Therefore, a more (###Q19###) approach is to 
look at market data, talk to (###Q20###) 
customers, understand their requirements and then 
devise a solution to address a particular problem.

Find the appropriate word in each case.`, qi: ``, o: [`Bound`, `Confused`, `Entangled`, `Jumbled`, `Interlinked`], oi: [``, ``, ``, ``, ``], e: `The author of the passage tries to explain the difference between invention and ‘Innovation’. According to him, these two are generally confused. Many people use one in place of the other. Hence, they are often 'confused'. None of the other options conveys the same meaning.` },
  { n: 14, s: `English Language`, q: `In the following passage, 
there are blanks, each of which has been 
numbered. These numbers are printed below the 
passage and against each, five words are 
suggested, one of which fits the blank 
appropriately. Find out the appropriate word in 
each case 
 
 Invention should not be (###Q13###) with 
innovation though both involve creativity to design 
a new product or conceive a new idea or process. 
Innovation is more than just invention, for, after 
creating something new, innovation would make it 
a/an (###Q14## #) through action and 
implementation. The best innovators are those who 
constantly seek to make components that are 
better, faster, cheaper and more efficient, thereby 
increasing the (###Q15###) of what they make 
and sell. After they have implemented this 
upgrade, the innovator will then file a 
(###Q16###) to protect his/her interests. While 
some may actually succeed using this 
(###Q17###) an/a (###Q18###) number of 
such creations fail because they are often 
theoretical, without a basis for marketability. 
Therefore, a more (###Q19###) approach is to 
look at market data, talk to (###Q20###) 
customers, understand their requirements and then 
devise a solution to address a particular problem.

Find the appropriate word in each case.`, qi: ``, o: [`reality`, `authenticity`, `basis`, `justification`, `achievement`], oi: [``, ``, ``, ``, ``], e: `The author goes on to explain what innovation is. It is not just creation'. It also involves 'implementation'. Hence it transforms one's creativity int o 'reality'. It is not 'authenticity' or 'basis' or justification'. It becomes an 'achievement' only when it is acknowledged to be so by experts.` },
  { n: 15, s: `English Language`, q: `In the following passage, 
there are blanks, each of which has been 
numbered. These numbers are printed below the 
passage and against each, five words are 
suggested, one of which fits the blank 
appropriately. Find out the appropriate word in 
each case 
 
 Invention should not be (###Q13###) with 
innovation though both involve creativity to design 
a new product or conceive a new idea or process. 
Innovation is more than just invention, for, after 
creating something new, innovation would make it 
a/an (###Q14## #) through action and 
implementation. The best innovators are those who 
constantly seek to make components that are 
better, faster, cheaper and more efficient, thereby 
increasing the (###Q15###) of what they make 
and sell. After they have implemented this 
upgrade, the innovator will then file a 
(###Q16###) to protect his/her interests. While 
some may actually succeed using this 
(###Q17###) an/a (###Q18###) number of 
such creations fail because they are often 
theoretical, without a basis for marketability. 
Therefore, a more (###Q19###) approach is to 
look at market data, talk to (###Q20###) 
customers, understand their requirements and then 
devise a solution to address a particular problem.

Find the appropriate word in each case.`, qi: ``, o: [`benefit`, `desirability`, `availability`, `purchase`, `value`], oi: [``, ``, ``, ``, ``], e: `The sentence says what the best innovators would do making their component cheaper, better, faster and more efficient will increase the ‘value’ of the component. Other options are not apt.` },
  { n: 16, s: `English Language`, q: `In the following passage, 
there are blanks, each of which has been 
numbered. These numbers are printed below the 
passage and against each, five words are 
suggested, one of which fits the blank 
appropriately. Find out the appropriate word in 
each case 
 
 Invention should not be (###Q13###) with 
innovation though both involve creativity to design 
a new product or conceive a new idea or process. 
Innovation is more than just invention, for, after 
creating something new, innovation would make it 
a/an (###Q14## #) through action and 
implementation. The best innovators are those who 
constantly seek to make components that are 
better, faster, cheaper and more efficient, thereby 
increasing the (###Q15###) of what they make 
and sell. After they have implemented this 
upgrade, the innovator will then file a 
(###Q16###) to protect his/her interests. While 
some may actually succeed using this 
(###Q17###) an/a (###Q18###) number of 
such creations fail because they are often 
theoretical, without a basis for marketability. 
Therefore, a more (###Q19###) approach is to 
look at market data, talk to (###Q20###) 
customers, understand their requirements and then 
devise a solution to address a particular problem.

Find the appropriate word in each case.`, qi: ``, o: [`share`, `Case`, `patent`, `certificate`, `privilege`], oi: [``, ``, ``, ``, ``], e: `The innovator gets a government license or a patent which gives him/her the sole right to use or sell the invention. This is not a ‘case’ or a 'share' on a 'privilege' It is not just a certificate' as it is legally recognized. Hence patent' is more appropriate.` },
  { n: 17, s: `English Language`, q: `In the following passage, 
there are blanks, each of which has been 
numbered. These numbers are printed below the 
passage and against each, five words are 
suggested, one of which fits the blank 
appropriately. Find out the appropriate word in 
each case 
 
 Invention should not be (###Q13###) with 
innovation though both involve creativity to design 
a new product or conceive a new idea or process. 
Innovation is more than just invention, for, after 
creating something new, innovation would make it 
a/an (###Q14## #) through action and 
implementation. The best innovators are those who 
constantly seek to make components that are 
better, faster, cheaper and more efficient, thereby 
increasing the (###Q15###) of what they make 
and sell. After they have implemented this 
upgrade, the innovator will then file a 
(###Q16###) to protect his/her interests. While 
some may actually succeed using this 
(###Q17###) an/a (###Q18###) number of 
such creations fail because they are often 
theoretical, without a basis for marketability. 
Therefore, a more (###Q19###) approach is to 
look at market data, talk to (###Q20###) 
customers, understand their requirements and then 
devise a solution to address a particular problem.

Find the appropriate word in each case.`, qi: ``, o: [`Technology`, `Policy`, `Rule.`, `Scheme`, `Methodology`], oi: [``, ``, ``, ``, ``], e: `The innovators or the creators use this methodology or procedure to obtain a patent to their creation and thus benefit by it. It is not a policy, rule scheme offered by someone. It is just a method or a modus operandi or a procedure. It has nothing to do with technology. It can even be just an idea that the innovator has conceived and thus the best option is methodology` },
  { n: 18, s: `English Language`, q: `In the following passage, 
there are blanks, each of which has been 
numbered. These numbers are printed below the 
passage and against each, five words are 
suggested, one of which fits the blank 
appropriately. Find out the appropriate word in 
each case 
 
 Invention should not be (###Q13###) with 
innovation though both involve creativity to design 
a new product or conceive a new idea or process. 
Innovation is more than just invention, for, after 
creating something new, innovation would make it 
a/an (###Q14## #) through action and 
implementation. The best innovators are those who 
constantly seek to make components that are 
better, faster, cheaper and more efficient, thereby 
increasing the (###Q15###) of what they make 
and sell. After they have implemented this 
upgrade, the innovator will then file a 
(###Q16###) to protect his/her interests. While 
some may actually succeed using this 
(###Q17###) an/a (###Q18###) number of 
such creations fail because they are often 
theoretical, without a basis for marketability. 
Therefore, a more (###Q19###) approach is to 
look at market data, talk to (###Q20###) 
customers, understand their requirements and then 
devise a solution to address a particular problem.

Find the appropriate word in each case.`, qi: ``, o: [`irresistible`, `overwhelming`, `negligible`, `massive`, `insignificant`], oi: [``, ``, ``, ``, ``], e: `The sentence suggests a contrast. While some benefit by this, a lot many don't. This is the idea suggested here. Hence the best option for this blank is an overwhelming number fail . Negligible' and 'insignificant' can be easily eliminated as they express a meaning that is opposite to the one suggested. "Irresistible' is absurd in this context and massive' is generally used with size and not with number.` },
  { n: 19, s: `English Language`, q: `In the following passage, 
there are blanks, each of which has been 
numbered. These numbers are printed below the 
passage and against each, five words are 
suggested, one of which fits the blank 
appropriately. Find out the appropriate word in 
each case 
 
 Invention should not be (###Q13###) with 
innovation though both involve creativity to design 
a new product or conceive a new idea or process. 
Innovation is more than just invention, for, after 
creating something new, innovation would make it 
a/an (###Q14## #) through action and 
implementation. The best innovators are those who 
constantly seek to make components that are 
better, faster, cheaper and more efficient, thereby 
increasing the (###Q15###) of what they make 
and sell. After they have implemented this 
upgrade, the innovator will then file a 
(###Q16###) to protect his/her interests. While 
some may actually succeed using this 
(###Q17###) an/a (###Q18###) number of 
such creations fail because they are often 
theoretical, without a basis for marketability. 
Therefore, a more (###Q19###) approach is to 
look at market data, talk to (###Q20###) 
customers, understand their requirements and then 
devise a solution to address a particular problem.

Find the appropriate word in each case.`, qi: ``, o: [`energetic`, `precarious`, `feeble`, `robust`, `vigorous`], oi: [``, ``, ``, ``, ``], e: `Many of these creations fail because they are not practical and they don't have a basis for marketability". So, the author here suggests a more "strong' or practical or realistic approach. None of the other options are apt in this context.` },
  { n: 20, s: `English Language`, q: `In the following passage, 
there are blanks, each of which has been 
numbered. These numbers are printed below the 
passage and against each, five words are 
suggested, one of which fits the blank 
appropriately. Find out the appropriate word in 
each case 
 
 Invention should not be (###Q13###) with 
innovation though both involve creativity to design 
a new product or conceive a new idea or process. 
Innovation is more than just invention, for, after 
creating something new, innovation would make it 
a/an (###Q14## #) through action and 
implementation. The best innovators are those who 
constantly seek to make components that are 
better, faster, cheaper and more efficient, thereby 
increasing the (###Q15###) of what they make 
and sell. After they have implemented this 
upgrade, the innovator will then file a 
(###Q16###) to protect his/her interests. While 
some may actually succeed using this 
(###Q17###) an/a (###Q18###) number of 
such creations fail because they are often 
theoretical, without a basis for marketability. 
Therefore, a more (###Q19###) approach is to 
look at market data, talk to (###Q20###) 
customers, understand their requirements and then 
devise a solution to address a particular problem.

Find the appropriate word in each case.`, qi: ``, o: [`potential`, `empathetic`, `accomplished`, `patronizing`, `influential`], oi: [``, ``, ``, ``, ``], e: `What is the robust or the practical approach suggested by the author? It is that the innovators sh ould first look for potential or prospective or future customers, understand their requirements and then create something that they need. In that case the product would certainly find its market easily` },
  { n: 21, s: `English Language`, q: `Read each sentence to find out whether there is 
any grammatical error or idiomatic error in it. The 
error, if any, will be in one part of the sentence. 
The letter of that part is the answer. If there is no 
error, mark the answer as No error. (Ignore errors 
of the punctuation if any). 
 It was a long / and uncomfortable journey / but he 
managed / to reach with time.`, qi: ``, o: [`It was a long`, `and uncomfortable journey`, `but he managed`, `to reach with time.`, `No error`], oi: [``, ``, ``, ``, ``], e: `Here, “to reach in time” should be used. Idiom in times mean, not late. with enough time, to be able to do something` },
  { n: 22, s: `English Language`, q: `Direction: Read each sentence to find out whether 
there is an error in it. The error, if any, will be in 
one part of the sentence. If t here is no error, the 
answer will be “No Error”.`, qi: ``, o: [`Just as a letter’s physical presence, then,`, `resists the rationalisations of the public`, `sphere, its temporal idiosyncrasies resisted the`, `efficiencies of capitalist production.`, `No error.`], oi: [``, ``, ``, ``, ``], e: `In C part, use of ‘resisted' is incorrect. ‘Resists’ should replace ‘resisted’. The given sentence is in present tense. So, present form of verb will be used. Hence C is the correct choice.` },
  { n: 23, s: `English Language`, q: `Direction: Read each sentence to find out whether 
there is an error in it. The error, if any, will be in 
one part of the sentence. If there is no error, the 
answer will be “No Error”.`, qi: ``, o: [`Linking traditional American Native stories`, `to historic records of a Japanese tsunami`, `was considered an exception, not the start`, `of a fruitful geological collaboration.`, `No error.`], oi: [``, ``, ``, ``, ``], e: `In A part, use of 'Native' after ‘American’ is incorrect. Also ‘traditional’ should come before ‘stories’. Native is an adjective that is used here for American and not stories. So native will come before American. Tradit ional is used as an adjective for stories. This is a case of misplaced modifiers. Hence A is the correct choice.` },
  { n: 24, s: `English Language`, q: `Direction: Read each sentence to find out whether 
there is an error in it. The error, if any, will be in 
one part of the sentence. If there is no error, the 
answer will be “No Error”.`, qi: ``, o: [`This is one of London’s most`, `important and ancient axial routes,`, `roughly following the line of`, `a Roman through-road.`, `No error`], oi: [``, ``, ``, ``, ``], e: `The given statement is grammatically correct. Hence E is the correct choice.` },
  { n: 25, s: `English Language`, q: `Direction: Read each sentence to find out whether 
there is any grammatical error in it. The error, if 
any, will be in one part of the sentence. If there is 
no error, the answer is (E), ie ‘No error’. (Ignore 
the errors of punctuation, if any.) 
 The consolation messages (A) / received on the 
(B)/ demise of Mrs. Malhotra (C) / speaks highly of 
her enormity. (D)`, qi: ``, o: [`(A)`, `(B)`, `(C)`, `(D)`, `No error`], oi: [``, ``, ``, ``, ``], e: `Here, the error is in part D. As 'messages' is plural “speaks” will be replaced by “speak”. The rule applied is of subject verb agreement.` },
  { n: 26, s: `English Language`, q: `Direction: Read each sentence to find out whether 
there is any grammatical error or idiomatic error in 
it. The error, if any, will be in one part of the 
sentence. The letter of that part is the answer. If 
there is no error, mark the answer as No error. 
(Ignore errors of the punctuation if any). 
 Do you wanted / to discuss this/ project today or 
can / we do it tomorrow?`, qi: ``, o: [`Do you wanted`, `to discuss this`, `project today or can`, `we do it tomorrow`, `No error`], oi: [``, ``, ``, ``, ``], e: `Look at the structure of the sentence in interrogative in present simple. Do/Does + subject + Verb Hence, do you want should be used.` },
  { n: 27, s: `English Language`, q: `Direction: Read each sentence to find out whether 
there is any grammatical error in it. The error, if 
any, will be in one part of the sentence. If the 
sentence is correct as it is mark 'no error' as the 
answer. 
 Jaitely announced a waivered of the service charge 
(a)/ on e -tickets and spoke about a number of 
steps (b)/ to improve passenger amenities (c)/ 
such as a ‘coach mitra’ facility. (d)/ No error (e).`, qi: ``, o: [`Jaitely announced a waivered of the service 
charge`, `on e-tickets and spoke about a number of steps`, `to improve passenger amenities`, `such as a ‘coach mitra’ facility`, `No error`], oi: [``, ``, ``, ``, ``], e: `'waiver' should be used to make the sentence correct.` },
  { n: 28, s: `English Language`, q: `Direction: Read each sentence to find out whether 
there is any grammatical error in it. The error, if 
any, will be in one part of the sentence. If there is 
no error, the answer is (E), ie ‘No error’. (Ignore 
the errors of punctuation, if any.) 
 The reason why he failed/ to attend the meeting/ 
with a complete presentation/ was because he was 
unwell./ No error`, qi: ``, o: [`The reason why he failed`, `to attend the meeting`, `with a complete presentation`, `was because he was unwell.`, `no error 
 
 Direction (29-30): Read each sentence to find 
out whether there is any grammatical error in it. 
The error, if any, will be in one part of the 
sentence. If there is no error, the answ er is ‘No 
error’. (Ignore the errors of punctuation, if any.)`], oi: [``, ``, ``, ``, ``], e: `The group of words “the reason why" already indicates the reason. There is no need to use the word “because". The word connecting the two clauses should be “that".` },
  { n: 29, s: `English Language`, q: `Read each sentence to find 
out whether there is any grammatical error in it. 
The error, if any, will be in one part of the 
sentence. If there is no error, the answ er is ‘No 
error’. (Ignore the errors of punctuation, if any.)

Their innovative zeal has / touched the lives of 125 
crore / Indians and make India/proud worldwide./ 
No error`, qi: ``, o: [`Their innovative zeal has`, `touched the lives of 125 crore`, `Indians and make India`, `proud worldwide.`, `No error`], oi: [``, ``, ``, ``, ``], e: `'and made India' should be used to make the sentence grammatically correct. You use 'made' when referring to things already done in the past. 'Make' is present and its continuous its still been done unlike 'made' which refers to what has been done.` },
  { n: 30, s: `English Language`, q: `Read each sentence to find 
out whether there is any grammatical error in it. 
The error, if any, will be in one part of the 
sentence. If there is no error, the answ er is ‘No 
error’. (Ignore the errors of punctuation, if any.)

The coverage of schemes remain /patchy because 
of rampant / leakages, and poor execution / and 
monitoring. / No error`, qi: ``, o: [`The coverage of schemes remain`, `patchy because of rampant`, `leakages, and poor execution`, `and monitoring`, `No error 
 

[[PAGEBREAK]]
 Directions (31-35): Study the following table and 
answer the questions that follow.`], oi: [``, ``, ``, ``, ``], e: `'The coverage of schemes remains' should be used to make the sentence correct. Here the noun is 'coverage' that’s why we should use 'remains' instead of 'remain'.` },
  { n: 31, s: `Quantitative Aptitude`, q: `Study the following table and 
answer the questions that follow.

What is the average number of two wheelers sold 
in Mumbai for all these years?`, qi: `Image43.jpg`, o: [`21650`, `22150`, `22650`, `23150`, `23650`], oi: [``, ``, ``, ``, ``], e: `Vehicles stored in 2001 = 15200 Vehicles stored in 2002 = 18600 Vehicles stored in 2003 = 28300 Vehicles stored in 2004 = 26500 Total vehicles sold = 15200 + 18600 + 28300 + 26500 = 88600 Average sale = 88600/4 = 22150` },
  { n: 32, s: `Quantitative Aptitude`, q: `Study the following table and 
answer the questions that follow.

In 2003 if Bajaj sold 35% of the total two 
wheelers, then what is the total number of vehicles 
sold by Bajaj across these cities?`, qi: `Image43.jpg`, o: [`22955`, `23065`, `23155`, `23265`, `22165`], oi: [``, ``, ``, ``, ``], e: `Vehicles sold in Delhi = 28000 Vehicles sold in Mumbai = 28300 Vehicles sold in Kolkata = 9600 Total Vehicles (two wheelers) Sold = 28000 + 28300 + 9600 = 65900 Vehicles sold by Bajaj = 35% of 65900 = 35/100 * 65900 = 23065` },
  { n: 33, s: `Quantitative Aptitude`, q: `Study the following table and 
answer the questions that follow.

In 2003 if Bajaj sold 35% o f the total two 
wheelers, then what is the approximate average 
number of vehicles sold by Bajaj across these 
cities?`, qi: `Image43.jpg`, o: [`7700`, `7500`, `7400`, `8700`, `8100`], oi: [``, ``, ``, ``, ``], e: `Vehicles (two wheelers) sold in Delhi = 28000 Vehicles (two wheelers) sold in Mumbai = 28300 Vehicles (two wheelers) sold in Kolkata = 9600 Total Vehicles Sold (two wheelers) = 28000 + 28300 + 9600 = 65900 Vehicles (two wheelers) sold by Bajaj = 35% of 65900 = 35/100 * 65900 = 23065 Average = 23605/3 =7688.33 =7700(approx.)` },
  { n: 34, s: `Quantitative Aptitude`, q: `Study the following table and 
answer the questions that follow.

Total number of two wheelers sold in Kolkata from 
2001 – 2004 is what percent of total v ehicles sold 
in Delhi from 2001 to 2003?`, qi: `Image43.jpg`, o: [`32.5%`, `32.9%`, `33.3%`, `33.6%`, `34.2%`], oi: [``, ``, ``, ``, ``], e: `Two wheelers sold in Kolkata in 2001 = 8000 Two wheelers sold in Kolkata in 2002 = 7500 Two wheelers sold in Kolkata in 2003 = 9600 Two wheelers sold in Kolkata in 2004 = 11500 Total two wheelers sold in Kolkata = 8000 + 7500 + 9600 + 11500 = 36600 Vehicles sold in Delhi in 2001 = 25000 Vehicles sold in Delhi in 2002 = 39000 Vehicles sold in Delhi in 2003 = 43000 Total vehicles sold in Delhi from 2001 – 03 = 107000 Percentage = (36600/107000) *100 = 34.20%` },
  { n: 35, s: `Quantitative Aptitude`, q: `Study the following table and 
answer the questions that follow.

What is the difference between percentages of two 
wheelers sold in Delhi and Kolkata from 2001 – 04?`, qi: `Image43.jpg`, o: [`15%`, `20%`, `25%`, `30%`, `35%`], oi: [``, ``, ``, ``, ``], e: `Two wheelers sold in Kolkata in 2001 = 8000 Two wheelers sold in Kolkata in 2002 = 7500 Two wheelers sold in Kolkata in 2003 = 9600 Two wheelers sold in Kolkata in 2004 = 11500 Total two wheelers sold in Kolkata = 8000 + 7500 + 9600 + 11500 = 36600 Vehicles sold in Kolkata in 2001 = 22000 Vehicles sold in Kolkata in 2002 = 26000 Vehicles sold in Kolkata in 2003 = 31000 Vehicles sold in Kolkata in 2004 = 38000 Total vehicles sold in Kolkata = 22000 + 26000 + 31000 + 38000 = 117000 Percentage of two wheelers sold in Kolkata = 31.28% Two wheelers sold in Delhi in 2001 = 14000 Two wheelers sold in Delhi in 2002 = 26000 Two wheelers sold in Delhi in 2003 = 28000 Two wheelers sold in Delhi in 2004 = 31000 Total two wheelers sold in Delhi = 14000 + 26000 + 28000 + 31000 = 99000 Vehicles sold in Delhi in 2001 = 25000 Vehicles sold in Delhi in 2002 = 39000 Vehicles sold in Delhi in 2003 = 43000 Vehicles sold in Delhi in 2004 = 52000 Total vehicles sold in Delhi = 25000 + 39000 + 43000 + 52000 = 159000 Percentage of two wheelers sold in delhi= 62.26% Difference between percentages = 62.26 – 31.28 = 30.98 Ã 30` },
  { n: 36, s: `Quantitative Aptitude`, q: `The average ma rks in science subject of a class of 
20 students is 68. If the marks of two students 
were misread as 48 and 65 of the actual marks 72 
and 61 respectively, then what would be the 
correct average?`, qi: ``, o: [`68.5`, `69`, `69.5`, `70`, `66`], oi: [``, ``, ``, ``, ``], e: `Difference of marks = 72 + 61 – 48 – 65 = 20 ∴ Correct average marks = 68 + 20/20 = 69 Hence, option B is correct.` },
  { n: 37, s: `Quantitative Aptitude`, q: `In a container, there is 960 ltr of pure milk from 
which 48 ltr of milk is replaced with 48 ltr of water, 
again 48 ltr milk is replaced by same amount of 
water, as this process is done once more. Now, 
what is the amount of pure milk?`, qi: ``, o: [`901.54 ltr`, `821.54 ltr`, `719.64 ltr`, `823.08 ltr`, `829.64 ltr`], oi: [``, ``, ``, ``, ``], e: `Amount of pure milk = a(1 – b/a)n (n = 3, a = pure milk and b = amount replaced) = 960 (1 – 48/960)3 = 960(1-1/20)3 = 960 * 19/20 * 19/20*19/20 = 823.08 lt.` },
  { n: 38, s: `Quantitative Aptitude`, q: `4 years ago, the ratio of 1/2 of Anita’s age at that 
time and four times of Bablu’s age at that time was 
5 : 12. Eight years hence, 1/2 of Anita’s age at that 
time will be less than Bablu’s ag e at that time by 2 
years. What is Bablu’s present age?`, qi: ``, o: [`10 years`, `24 years`, `9 years`, `15 years`, `18 years`], oi: [``, ``, ``, ``, ``], e: `Let present age of Anita= 'x’ years And present age of Bablu= ‘y’ years Now, 3x – 10y + 28 = 0 ……………….(i) and, x – 2y = 4 ……………(ii) Now, from eqn. (i) & (ii) Bablu present age, Y=10 years` },
  { n: 39, s: `Quantitative Aptitude`, q: `A, B & C started a business and invested in the 
ratio 7:6:5. Next Year, they increased their 
investment by 25%, 20% and 15%, respec tively. 
In what ratio should profit earned only during 
2nd year be distributed?`, qi: ``, o: [`155:144:175`, `155:124:95`, `135:147:152`, `175:144:115`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `Let A’s investment be= 7a Let B’s investment be= 6a Let C’s investment be= 5a Their investment in 2nd year: = (125% of 7a): (120% of 6a) : (115% of 5a) = 175 : 144 : 115` },
  { n: 40, s: `Quantitative Aptitude`, q: `A shopkeeper gives 20% discount on the marked 
price of a book. He provides 1 pair of b ooks free 
with the sale of 9 pair of books. In the whole 
transaction, he gets profit of 26%. Find the 
percentage increase in marked price from the cost 
price.`, qi: ``, o: [`35%`, `65%`, `75%`, `26%`, `None of these`], oi: [``, ``, ``, ``, ``], e: `Given, Let the cost price of single book be Rs. 100. The cost price of (9 + 1) = 10 pair i.e. 20 books = Rs. (100 × 20) = Rs. 2000. He gets profit of 26%. So, the selling price of 9 pair i.e. 18 books = Rs. 2000 × (126/100) = Rs. 2520 Then, the selling price of single book = Rs. 2520/18 = Rs. 140 He gives 20% discount on the marked price of a book. That means, when the selling price is Rs. 80 then the marked price is Rs. 100. ∴ When the selling price of single book is Rs. 140, the marked price = Rs. 140 × (100/80) = Rs. 175 ∴ The percentage increase in marked price from the cost price = (175 – 100)% = 75%.` },
  { n: 41, s: `Quantitative Aptitude`, q: `Directions: What will come in the place of the 
question mark (?) in the following number series? 
 305, 338, 404, 503, 635 , (?)`, qi: ``, o: [`820`, `880`, `800`, `890`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 42, s: `Quantitative Aptitude`, q: `Directions: What should come in place of the 
question mark (?) in the following number series? 
 1, 3, 24, 360, 8640, 302400, ?`, qi: ``, o: [`14525100`, `154152000`, `14515200`, `15425100`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `So, ? = 14515200` },
  { n: 43, s: `Quantitative Aptitude`, q: `Directions: What will come in place of the 
question marks (?) in the following Number 
series? 
 8, 14, 26, 44, 68 (?)`, qi: ``, o: [`94`, `102`, `96`, `98`, `None of these`], oi: [``, ``, ``, ``, ``], e: `The pattern is + 6, + 12, + 18, +24 ……….. So the missing term is = 68 +30 = 98` },
  { n: 44, s: `Quantitative Aptitude`, q: `Direction: What will come in place of the question 
mark (?) in the following number series? 
 14, 18, 9, 25, 0, ?`, qi: ``, o: [`11`, `23`, `36`, `20`, `40`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 45, s: `Quantitative Aptitude`, q: `Direction: What will come in place of the question 
mark (?) in the following number series? 
 11, 19, 40, 87, 173, ?`, qi: ``, o: [`301`, `311`, `304`, `294`, `350`], oi: [``, ``, ``, ``, ``], e: `Hence option B is the right answer.` },
  { n: 46, s: `Quantitative Aptitude`, q: `In a single throw with 2 dices, what is probability 
of neither getting an even number on one and nor 
a multiple of 3 on other?`, qi: ``, o: [`11/36`, `25/36`, `5/6`, `1/6`, `None of these`], oi: [``, ``, ``, ``, ``], e: `We first calculate the probability of getting an even number on one and a multiple of 3 on other, Here, n(s) = 6x6 = 36 and E = (2,3) (2,6) (4,3) (4,6) (6,3) (6,6) (3,2) (3,4) (3,6) (6,2)(6,4) n(E) = 11 P(E) = 11/36 Required probability = 1- 11/36 = 25/36` },
  { n: 47, s: `Quantitative Aptitude`, q: `8 men can complete a work in 16 days. 16 women 
can complete the same work in 24 days. In how 
many days can 4 men and 8 women complete the 
same work?`, qi: ``, o: [`8`, `20`, `19.2`, `55`, `40`], oi: [``, ``, ``, ``, ``], e: `8men *16 days = 16women * 24days = work 1men = 3 women (by equivalence) Work = 8men *16 days = (4men + 8 women) * 'k' days 128 man days = (4men +8*(1/3)men)* 'k' days 128 mandays = (20/3)k mandays k = 19.2 days` },
  { n: 48, s: `Quantitative Aptitude`, q: `Both S.I. and C.I. is calculated with a similar rate 
of 10% per annum on a sum of rupees. If C.I. is 
calculated yearly for two years, then for what 
period must S.I. be evaluated such that S.I. = 
C.I.?`, qi: ``, o: [`4.2 years`, `2.1 years`, `1.6 years`, `1.4 years`, `None of the above`], oi: [``, ``, ``, ``, ``], e: `Let time period of S.I. be T years. Then for a principal amount, say P, ATQ, as, S.I. = C.I. for rate =10%p.a. and time for C.I. = 2 (P x 10 x T)/100 = P{[ (100+10)/100 ]2 - 1} T/10 = [ 110/100 ]2 – 1 = [(11/10)2 – 1] = (121- 100)/100 T/10 = 21/100 T = 21/10 = 2.1 years` },
  { n: 49, s: `Quantitative Aptitude`, q: `A uniformly moving train of leng th 480 m takes 3 
minutes to completely cross a platform. If the 
same train, with the same speed crosses a pole 
completely in 30 sec, then the length of the 
platform is -`, qi: ``, o: [`1 km`, `600 m`, `4.8 km`, `1.2 km`, `2.4 km`], oi: [``, ``, ``, ``, ``], e: `Let length of platform be ‘y’metres. Then, at the platform, Distance travelled = y + (length of train) = (y + 480)m Then, Speed of train = (y + 480)m / (3x60) sec = (y+480)/180 …(1) Also, at the pole, Distance travelled = length of train = 480m Then, Speed of train = 480m / 30sec = 16 m/s …(2) Equating eq.(1) & eq.(2), we get, (y+480)/180 = 16 (y+480) = 16 x 180 = 2880 y = 2880 – 480 = 2400m or 2.4 km long platform.` },
  { n: 50, s: `Quantitative Aptitude`, q: `The perimeter of a rectangle whose length is 
6 metre more than its breadth is 84 metre. What is 
the area of the triangle whose base is equal to the 
diagonal of the rectangle and height is equal to the 
length of the rectangle?`, qi: ``, o: [`360sq metre`, `380 sq metre`, `360 metre`, `400 sq metre`, `None of these`], oi: [``, ``, ``, ``, ``], e: `Let the breadth of rectangle be x m. Then, the length of rectangle = (x + 6) m Perimeter of rectangle = 2 (x + x + 6) m Therefore, 2 (x + x + 6) = 84 m 4x + 12 = 84 4x = 84 – 12 4x = Therefore, length of rectangle = 18 + 6 = 24 m = height of triangle Diagonal of rectangle = m = base of triangle Therefore, are of triangle = 1/2 × base × height = 1/2× 24 × 30 = 360 sq. m Hence, option A is correct.` },
  { n: 51, s: `Quantitative Aptitude`, q: `Direction: In each question two equations 
numbered I and II are given, you have to solve 
both the equation and choose the correct answer. 
 I. 5x2 + 28x = -15 
II. 3y2 + 11y + 6 = 0`, qi: ``, o: [`X > Y`, `X ≥ Y`, `X < Y`, `X ≤ Y`, `X = Y or the relationship cannot be established`], oi: [``, ``, ``, ``, ``], e: `I. 5x2 + 28x = -15 x = (- 3/5, - 5) II. 3y2 + 11y + 6 = 0 y = (-3, -2/3) So Relationship cannot be established` },
  { n: 52, s: `Quantitative Aptitude`, q: `Direction: In each question two equations 
numbered I and II are given, you have to solve 
both the equation and choose the correct answer. 
 I. x2 + 30x + 81 = 0 
II. y2 - 9y - 162 = 0`, qi: ``, o: [`x > y`, `x > y`, `x < y`, `x < y`, `x = y or the relationship can’t be established`], oi: [``, ``, ``, ``, ``], e: `x2 + 30x + 81 = 0 x2 + 27x + 3x + 81 = 0 x = -3, -27 y2 - 9y - 162 = 0 y2 - 18y + 9y - 162 = 0 y = -9, 18 Hence, no relationship can be established between x and y.` },
  { n: 53, s: `Quantitative Aptitude`, q: `Direction: In the following questions two 
equations numbered I and II are given. You have 
to solve both the equations and give answers 
 I. 2x ² – 21x + 54 = 0 
II. y ² – 14y + 49 = 0`, qi: ``, o: [`x = y or relation can’t be established between x 
and y`, `x > y`, `x < y`, `x ≥ y`, `x≤ y 
 
 Directions (54-55): In the given questions, two 
equations numbered I and II are given. Solve both 
the equation and mark the appropriate answer.`], oi: [``, ``, ``, ``, ``], e: `I. 2x ² – 21x + 54 = 0 (x - 6)(2x - 9) x =+6, +9/2 II. y ² – 14y + 49 = 0 (y-7) (y-7) y = +7, +7 y > x` },
  { n: 54, s: `Quantitative Aptitude`, q: `In the given questions, two 
equations numbered I and II are given. Solve both 
the equation and mark the appropriate answer.

I. x2 – 5x – 24 = 0 
II. 2y2 + 19y + 35 = 0`, qi: ``, o: [`x > y`, `x > y`, `x < y`, `x < y`, `x = y or relationship between x and y cannot be 
determined.`], oi: [``, ``, ``, ``, ``], e: `I. x2 – 5x – 24 = 0 (x-8) (x+3) x = 8, -3 II. 2y2 + 19y + 35 = 0 (2y+7) (y+7) y= -7, -5/2 So can’t be determined` },
  { n: 55, s: `Quantitative Aptitude`, q: `In the given questions, two 
equations numbered I and II are given. Solve both 
the equation and mark the appropriate answer.

I. x2=529 
II.`, qi: ``, o: [`x>y`, `x≥y`, `x<y`, `x≤y`, `x=y or relation can’t be established. 
 
 Directions (56-60): Study the following graph 
carefully and answer the questions given below it. 
Consumption of two kinds of Wheat represented by 
ABC and XYZ respectively in the given years by a 
village (in thousand tons`], oi: [``, ``, ``, ``, ``], e: `x = ±23 And, y = 23 hence, x ≤ y` },
  { n: 56, s: `Quantitative Aptitude`, q: `Study the following graph 
carefully and answer the questions given below it. 
Consumption of two kinds of Wheat represented by 
ABC and XYZ respectively in the given years by a 
village (in thousand tons

What was the difference in consumption of ABC 
and XYZ in 2014?`, qi: `Image53.png`, o: [`5 tons`, `500 tons`, `600 tons`, `5000 tons`, `None of these`], oi: [``, ``, ``, ``, ``], e: `From the Graph, Consumption of Rice ABC in 2014 = 21 thousand tons Consumption of Rice XYZ in 2014 = 27 thousand tons Difference in consumption of ABC and XYZ in 2014 = (27 – 21) = 6 thousand tons` },
  { n: 57, s: `Quantitative Aptitude`, q: `Study the following graph 
carefully and answer the questions given below it. 
Consumption of two kinds of Wheat represented by 
ABC and XYZ respectively in the given years by a 
village (in thousand tons

In which of the following years, the consumption of 
both the types of wheat together was 2nd lowest?`, qi: `Image53.png`, o: [`2010`, `2012`, `2013`, `2014`, `None of these`], oi: [``, ``, ``, ``, ``], e: `As it can be seen from the graph given in question, Clearly, the consumption of both the types of rice together was 2nd lowest in 2012.` },
  { n: 58, s: `Quantitative Aptitude`, q: `Study the following graph 
carefully and answer the questions given below it. 
Consumption of two kinds of Wheat represented by 
ABC and XYZ respectively in the given years by a 
village (in thousand tons

In which of the following pair of years, the 
consumption of type ABC was equivalent to the 
consumption of both types of rice in 2015?`, qi: `Image53.png`, o: [`2010 and 2011`, `2011 and 2015`, `2010 and 2015`, `2013 and 2015`, `None of these`], oi: [``, ``, ``, ``, ``], e: `Consumption of both types of rice in 2015 = (18 + 30) thousand tons = 48 thousand tons Now, let’s check for options one by one Option (A) 2010 and 2011 = (19 + 16) thousand tons = 35 thousand tons Option (B) 2011 and 2015 = (16 + 18) thousand tons = 34 thousand tons Option (C) 2010 and 2015 = (19 + 18) thousand tons = 37 thousand tons Option (D) 2013 and 2015 = (30 + 18) thousand tons = 48 thousand tons As it can be seen clearly, option D matches with the consumption amount of 2015.` },
  { n: 59, s: `Quantitative Aptitude`, q: `Study the following graph 
carefully and answer the questions given below it. 
Consumption of two kinds of Wheat represented by 
ABC and XYZ respectively in the given years by a 
village (in thousand tons

In how many y ears, the consumption of Wheat of 
type ABC was less than the average consumption 
of Wheat of type XYZ in all the given years?`, qi: `Image53.png`, o: [`1`, `2`, `3`, `4`, `5`], oi: [``, ``, ``, ``, ``], e: `We know that, Average = Sum of all quantities/number of quantities ∴Average consumption of rice of type XYZ thousand tons = (144/6) thousand tons = 24 thousand tons As it can be seen from the given graph, consumption of rice of type ABC was less than 24 thousand tons in 4 years, i.e. 2010, 2011, 2014, 2015.` },
  { n: 60, s: `Quantitative Aptitude`, q: `Study the following graph 
carefully and answer the questions given below it. 
Consumption of two kinds of Wheat represented by 
ABC and XYZ respectively in the given years by a 
village (in thousand tons

What is the percent decrease in consumption of 
ABC in 2014 in comparison to 2012?`, qi: `Image53.png`, o: [`25%`, `10%`, `8%`, `12.5%`, `None of these`], oi: [``, ``, ``, ``, ``], e: `From the graph, Consumption of type ABC in 2014 = 21 thousand tons Consumption of type ABC in 2012 = 24 thousand tons Difference between consumption of ABC in 2014 in comparison to 2012 = (24 – 21 =) 3 thousand tons Percentage decrease in consumption of ABC in 2014 in comparison to 2012` },
  { n: 61, s: `Quantitative Aptitude`, q: `Direction: What approximate value should come 
in place of the question mark (?) in the following 
equation (Note: You are not expected to calculate 
the exact value)? 
 √580 × ∛510 + 49.999 x 3.999=?`, qi: ``, o: [`384`, `392`, `410`, `372`, `402`], oi: [``, ``, ``, ``, ``], e: `Take nearest values √580 × ∛510 + 49.999 x 3.999=? 24 x 8 + 200 = 392` },
  { n: 62, s: `Quantitative Aptitude`, q: `Directions: What approximate value should come 
in place of the question mark (?) in the following 
equation (Note: You are not expected to calculate 
the exact value)? 
 (55.01+16.0003) × 22.01 ÷ 10.998 =?`, qi: ``, o: [`190`, `130`, `110`, `142`, `175`], oi: [``, ``, ``, ``, ``], e: `Take nearest values (55.01+16.0003) × 22.01 ÷ 10.998 =? 71 × 2 = 142` },
  { n: 63, s: `Quantitative Aptitude`, q: `Direction: What approximate value should come in 
place of the question mark (?) in the following 
equation (Note: You are not expected to calculate 
the exact value)? 
 499.99 + 1999 ÷ 39.99 × 50.01=?`, qi: ``, o: [`3200`, `2700`, `3000`, `2500`, `2400`], oi: [``, ``, ``, ``, ``], e: `500+2000÷40×50=? ?= 500+(2000÷40)×50 ?= 500+50×50 ?=500+2500 ?=3000` },
  { n: 64, s: `Quantitative Aptitude`, q: `Direction: What approximate value should come 
in place of the question mark (?) in the following 
equation (Note: You are not expected to calculate 
the exact value)? 
 [(7.99)2 – (13.001)2 +(4.01) 3 ]2 =?`, qi: ``, o: [`-1800`, `1450`, `-1660`, `1660`, `-1450`], oi: [``, ``, ``, ``, ``], e: `[(7.99)2 – (13.001)2 +(4.01) 3 ]2 = X X= [82-132+43]2 X= [64-169+64]2 X= [-41]2 X=1681` },
  { n: 65, s: `Quantitative Aptitude`, q: `Directions: What approximate value should come 
in place of the question mark (?) in the following 
questions? (You are not expected to 
calculate the exact value.) 
 65. 21.003 × 39.998 – 209.91 = 126 × ?`, qi: ``, o: [`5`, `4`, `3`, `2`, `6`], oi: [``, ``, ``, ``, ``], e: `Take nearest values 21.003 × 39.998 – 209.91 = 126× ? 630 = 126× ? ? = 5 (approx)` },
  { n: 66, s: `Reasoning Ability`, q: `Direction: In the following questions, relationship 
between different elements are shown in the 
statements. These statements are followed by two 
conclusions. Give answer 
 Statements: A > B < C < D, C > E, F > D 
Conclusions: 
I. A > E 
II. F > E`, qi: ``, o: [`if only conclusion I is true.`, `if only conclusion II is true.`, `if either conclusion I or II is true.`, `if neither conclusion I nor II is true.`, `if both conclusion I and II are true.`], oi: [``, ``, ``, ``, ``], e: `I. A > B < C > E, So A>E is not true II. F>D>C>E, So F>E is true.` },
  { n: 67, s: `Reasoning Ability`, q: `Direction: In the following questions, relationship 
between different elements are shown in the 
statements. These statements are followed by two 
conclusions. Give answer 
 Statements: K > L = M < N, O < L > P 
Conclusions: I. K > O II. N > O`, qi: ``, o: [`if only conclusion I is true.`, `if only conclusion II is true.`, `if either conclusion I or II is true.`, `if neither conclusion I nor II is true.`, `if both conclusion I and II are true.`], oi: [``, ``, ``, ``, ``], e: `I. K > L>O, So K>O is not true II. O< L = M < N, So N > O is not true.` },
  { n: 68, s: `Reasoning Ability`, q: `Direction: In the following questions, relationship 
between different elements are shown in the 
statements. These statements are followed by two 
conclusions. Give answer 
 Statements: A < B > C, D > B < E 
Conclusions: I. D > A II. E > C`, qi: ``, o: [`if only conclusion I is true.`, `if only conclusion II is true.`, `if either conclusion I or II is true.`, `if neither conclusion I nor II is true.`, `if both conclusion I and II are true.`], oi: [``, ``, ``, ``, ``], e: `I. A < B<D, So D > A is true. II. E>B > C, So E > C is true.` },
  { n: 69, s: `Reasoning Ability`, q: `In these questions, a relationship between different 
elements is shown in the st atements. The 
statements are followed by two conclusions. 
 Statements: M < S < T = R > D > E > F, G < S < 
H 
Conclusions: 
I. G = R 
II. G < R`, qi: ``, o: [`Only conclusion I is true.`, `Only conclusion II is true.`, `Either conclusion I or II is true.`, `Neither conclusion I nor II is true.`, `Both conclusion I and II is true.`], oi: [``, ``, ``, ``, ``], e: `Given: M < S <T = R >D > E >F ...(i) G <S < H ...(ii) Combining (i) and (ii), we get G <S <T = R >D > E >F and H > S <T = R >D > E >F and G <S > M and M < S < H (I) G = R is not true. (II) G < R is not true. But both are complamentary are pair.` },
  { n: 70, s: `Reasoning Ability`, q: `Direction: In each of these question, the 
relationships between two or more elements are 
shown in the statements. These statements are 
followed by two conclusions. Read the statements 
and give answer 
 Statement: A > B < P, Q < R > P 
Conclusion: 
I. B < R 
II. Q > A`, qi: ``, o: [`Only conclusion I follows.`, `Only conclusion II follows.`, `Either conclusion I or II follows.`, `Neither conclusion I nor II follows.`, `Both conclusions I and II follow. 
 
 Direction ( 71-75): Study the following 
information carefully to answer the questions. 
 
 Eight friends, J, K, L, M, N, O, S and I are sitting 
around a square table each of them faces the 
centre. Four of them sit at the centre of the square 
and other four sits sides of the corner. Each of 
them likes different Colours viz Red, Brown, Blue, 
Yellow, Purple, Green, Pink and Black, but not 
necessarily in the same order. I, sits one corner 
side of a square and likes Red Colour. K sit s third 
to the right of I. M sits third to the right of K and 
likes Purple Colour. O sits immediate left of M and 
likes Yellow Colour. N and J are immediate 
neighbours to each other and likes Blue and Brown 
Colours respectively. The one who likes Blue is n ot 
an immediate neighbour of the one who likes Red. 
S is not an immediate neighbour of I, who is 
neither an immediate neighbour of the one who 
likes Pink nor Green. K does not like Green.`], oi: [``, ``, ``, ``, ``], e: `(i) Q < R > P ... (ii) Combining both statements, we have A > B < P < R > Q Now, B < R is true. Hence, I follows. Again, We can’t compare A and Q. Thus, conclusion II does not follow.` },
  { n: 71, s: `Reasoning Ability`, q: `Who likes Black Colour?`, qi: ``, o: [`S`, `K`, `L`, `Data inadequate`, `None of these`], oi: [``, ``, ``, ``, ``], e: `L likes Black Colour. So answer is (c). Solution: As per the given information the sitting arrangement would be as follows: First mention confirm conditions: I, sits at one corner side of a square and likes Red Colour. K sits third to the right of I. M sits third to the right of K and likes Purple Colour. O sits immediate left of M and likes Yellow Colour. N and J are immediate neighbours to each other and likes Blue and Brown Colours respectively. Now, fill the ambiguous conditions the one who likes Blue is not an immediate neighbour of the one who likes Red. S is not an immediate neighbour of I, who is neither an immediate neighbour of the one who likes Pink nor Green. K does not likes Green. Final arrangement is as follows:` },
  { n: 72, s: `Reasoning Ability`, q: `Who sits third to the left of the one who likes Pink 
Colour?`, qi: ``, o: [`I`, `M`, `L`, `Data inadequate`, `None of these`], oi: [``, ``, ``, ``, ``], e: `I sits third to the left of the one who likes Pink Colour. So answer is (a). Solution: As per the given information the sitting arrangement would be as follows: First mention confirm conditions: I, sits at one corner side of a square and likes Red Colour. K sits third to the right of I. M sits third to the right of K and likes Purple Colour. O sits immediate left of M and likes Yellow Colour. N and J are immediate neighbours to each other and likes Blue and Brown Colours respectively. Now, fill the ambiguous conditions the one who likes Blue is not an immediate neighbour of the one who likes Red. S is not an immediate neighbour of I, who is neither an immediate neighbour of the one who likes Pink nor Green. K does not likes Green. Final arrangement is as follows:` },
  { n: 73, s: `Reasoning Ability`, q: `If 'S' is related to 'Red', 'N' is related to 'Purple'. In 
the same way 'J' is related to which of the 
following?`, qi: ``, o: [`Brown`, `Pink`, `Black`, `Green`, `None of these`], oi: [``, ``, ``, ``, ``], e: `If 'S' is related to 'Red', 'N' is related to 'Purple'. In the same way 'J' is related to ‘Yellow’. So answer is (e). Solution: As per the given information the sitting arrangement would be as follows: First mention confirm conditions: I, sits at one corner side of a square and likes Red Colour. K sits third to the right of I. M sits third to the right of K and likes Purple Colour. O sits immediate left of M and likes Yellow Colour. N and J are immediate neighbours to each other and likes Blue and Brown Colours respectively. Now, fill the ambiguous conditions the one who likes Blue is not an immediate neighbour of the one who likes Red. S is not an immediate neighbour of I, who is neither an immediate neighbour of the one who likes Pink nor Green. K does not likes Green. Final arrangement is as follows:` },
  { n: 74, s: `Reasoning Ability`, q: `Four of the following five are alike in a certain 
waybased on the given seating arrangement and 
thus form a group. Which is the one that does not 
belong to the group?`, qi: ``, o: [`K`, `N`, `L`, `O`, `None of these`], oi: [``, ``, ``, ``, ``], e: `All are sitting in the middle except N. So answer is (b). Solution: As per the given information the sitting arrangement would be as follows: First mention confirm conditions: I, sits at one corner side of a square and likes Red Colour. K sits third to the right of I. M sits third to the right of K and likes Purple Colour. O sits immediate left of M and likes Yellow Colour. N and J are immediate neighbours to each other and likes Blue and Brown Colours respectively. Now, fill the ambiguous conditions the one who likes Blue is not an immediate neighbour of the one who likes Red. S is not an immediate neighbour of I, who is neither an immediate neighbour of the one who likes Pink nor Green. K does not likes Green. Final arrangement is as follows:` },
  { n: 75, s: `Reasoning Ability`, q: `Which of the following information is definitely true 
with respect to given information?`, qi: ``, o: [`L is an immediate neighbour of N`, `K sits second to the right of O`, `L likes Pink Colour`, `J likes Brown Colour`, `None is true`], oi: [``, ``, ``, ``, ``], e: `None information is true in the the given option. So answer is (d). Solution: As per the given information the sitting arrangement would be as follows: First mention confirm conditions: I, sits at one corner side of a square and likes Red Colour. K sits third to the right of I. M sits third to the right of K and likes Purple Colour. O sits immediate left of M and likes Yellow Colour. N and J are immediate neighbours to each other and likes Blue and Brown Colours respectively. Now, fill the ambiguous conditions the one who likes Blue is not an immediate neighbour of the one who likes Red. S is not an immediate neighbour of I, who is neither an immediate neighbour of the one who likes Pink nor Green. K does not likes Green. Final arrangement is as follows:` },
  { n: 76, s: `Reasoning Ability`, q: `Directions (86-90): In each question given below 
three statements are followed by two conclusions 
numbered I and II. You have to take the three 
given statements to be true even if they seem to 
be at variance with the commonly known facts. 
Read the conclusions and decide which conclusion 
logically follows from the three given statement 
disregarding commonly known facts. Give answer - 
 Statements: All tables are chairs. 
All chairs are pencil. 
Some pencil are pen. 
Conclusions: 
I. All tables are pencils. 
II. All pens being tables is a possibility.`, qi: ``, o: [`Only conclusion I follows.`, `Only conclusion II follows.`, `Either conclusion I or II follows.`, `Neither conclusion I nor II follows.`, `Both conclusion I and II follow.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 77, s: `Reasoning Ability`, q: `Directions: Study the following information and 
answer the questions. 
 In each of the questions below are given two or 
three statements followed by two conclusions 
numbered I, II and III. You have to take the given 
statements to be true even if they seem to be at 
variance with commonly known facts. Read all the 
conclusions an d then decide which of the given 
conclusions logically follow from the given 
statements, disregarding commonly known facts. 
 Statements: Some stones are rocks 
All rocks are hills 
Conclusions: 
I. All rocks being stones is a possibility 
II. At least some hills are stones`, qi: ``, o: [`Only conclusion I follows.`, `Only conclusion II follows.`, `Either conclusion I or conclusion II follows.`, `Neither conclusion I nor conclusion II follows.`, `Both conclusions I and II follow.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 78, s: `Reasoning Ability`, q: `In each question given belo w three statements are 
followed by two conclusions numbered I and II. 
You have to take the three given statements to be 
true even if they seem to be at variance from the 
commonly known facts. Read the conclusions and 
decide which logically follows from the three-given 
statement disregarding commonly known facts. 
Give answer 
 Statements: No officer is manager. 
Some managers are staffs. 
Some honest are officers. 
Conclusions: 
I. It is possibility that some honest are staff. 
II. It is possibility that all manager is honest.`, qi: ``, o: [`Only conclusion I follows.`, `Only conclusion II follows.`, `Either conclusion I or II follows.`, `Neither conclusion I nor II follows.`, `Both conclusions I and II follow.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 79, s: `Reasoning Ability`, q: `In each question given below three statements a re 
followed by two conclusions numbered I and II. 
You have to take the three given statements to be 
true even if they seem to be at variance from the 
commonly known facts. Read the conclusions and 
decide which logically follows from the three -given 
statement disregarding commonly known facts. 
Give answer 
 Statements: Some doors are bells. 
Some bells are bags. 
All opens are bell. 
Conclusions: 
I. Some open are doors. 
II. All bags can be open is a possibility.`, qi: ``, o: [`Only conclusion I follows.`, `Only conclusion II follows.`, `Either conclusion I or II follows.`, `Neither conclusion I nor II follows.`, `Both conclusions I and II follow.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 80, s: `Reasoning Ability`, q: `Directions: Study the following information and 
answer the questions. 
 
 In each of the questions below are given two or 
three statements followed by two conclusions 
numbered I, II and III. You have to take the given 
statements to be true even if they seem to be at 
variance with commonly known facts. Read all the 
conclusions an d then decide which of the given 
conclusions logically follow from the given 
statements, disregarding commonly known facts. 
 Statements: 
Some flats are apartments 
Some apartments are halls 
No hall is a room 
Conclusions: 
I. At least some halls are flats 
II. All rooms being apartments is a possibility`, qi: ``, o: [`Only conclusion I follows.`, `Only conclusion II follows.`, `Either conclusion I or conclusion II follows.`, `Neither conclusion I nor conclusion II follows.`, `Both conclusions I and II follow. 
 

[[PAGEBREAK]]
 Direction (81 -85): Study the following 
information carefully to answer the given 
questions. 
 
 E, F, G, H, I, J, K and L are sitting in a straight line, 
but not necessarily in the same order. Some of 
them are not facing north. Only three persons sit 
between I and F. Both H and E face the same 
direction and H sits third to the right of E. I is not 
an immediate neighbour of E or H. K sits on the 
immediate left of F, who faces north. J sits on the 
immediate right of G. Neither E no r H is an 
immediate neighbour of G. Both the immediate 
neighbours of F face opposite directions. K and J 
both face the same direction. L sits second to the 
right of K. I is not facing the same direction as G is 
facing. G sits at one of the extreme ends of the 
line. Both K and J face the same direction as L. 
Only three persons sit between K and G.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 81, s: `Reasoning Ability`, q: `Study the following 
information carefully to answer the given 
questions. 
 
 E, F, G, H, I, J, K and L are sitting in a straight line, 
but not necessarily in the same order. Some of 
them are not facing north. Only three persons sit 
between I and F. Both H and E face the same 
direction and H sits third to the right of E. I is not 
an immediate neighbour of E or H. K sits on the 
immediate left of F, who faces north. J sits on the 
immediate right of G. Neither E no r H is an 
immediate neighbour of G. Both the immediate 
neighbours of F face opposite directions. K and J 
both face the same direction. L sits second to the 
right of K. I is not facing the same direction as G is 
facing. G sits at one of the extreme ends of the 
line. Both K and J face the same direction as L. 
Only three persons sit between K and G.

How many persons are not facing north?`, qi: ``, o: [`Two`, `Three`, `Four`, `Five`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 82, s: `Reasoning Ability`, q: `Study the following 
information carefully to answer the given 
questions. 
 
 E, F, G, H, I, J, K and L are sitting in a straight line, 
but not necessarily in the same order. Some of 
them are not facing north. Only three persons sit 
between I and F. Both H and E face the same 
direction and H sits third to the right of E. I is not 
an immediate neighbour of E or H. K sits on the 
immediate left of F, who faces north. J sits on the 
immediate right of G. Neither E no r H is an 
immediate neighbour of G. Both the immediate 
neighbours of F face opposite directions. K and J 
both face the same direction. L sits second to the 
right of K. I is not facing the same direction as G is 
facing. G sits at one of the extreme ends of the 
line. Both K and J face the same direction as L. 
Only three persons sit between K and G.

Who among the following sit at the extreme ends 
of the line?`, qi: ``, o: [`I,G`, `E,K`, `L,G`, `F,I`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 83, s: `Reasoning Ability`, q: `Study the following 
information carefully to answer the given 
questions. 
 
 E, F, G, H, I, J, K and L are sitting in a straight line, 
but not necessarily in the same order. Some of 
them are not facing north. Only three persons sit 
between I and F. Both H and E face the same 
direction and H sits third to the right of E. I is not 
an immediate neighbour of E or H. K sits on the 
immediate left of F, who faces north. J sits on the 
immediate right of G. Neither E no r H is an 
immediate neighbour of G. Both the immediate 
neighbours of F face opposite directions. K and J 
both face the same direction. L sits second to the 
right of K. I is not facing the same direction as G is 
facing. G sits at one of the extreme ends of the 
line. Both K and J face the same direction as L. 
Only three persons sit between K and G.

Who among the following sits exactly between H 
and the one who is third to the right of I?`, qi: ``, o: [`L`, `F`, `J`, `E`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 84, s: `Reasoning Ability`, q: `Study the following 
information carefully to answer the given 
questions. 
 
 E, F, G, H, I, J, K and L are sitting in a straight line, 
but not necessarily in the same order. Some of 
them are not facing north. Only three persons sit 
between I and F. Both H and E face the same 
direction and H sits third to the right of E. I is not 
an immediate neighbour of E or H. K sits on the 
immediate left of F, who faces north. J sits on the 
immediate right of G. Neither E no r H is an 
immediate neighbour of G. Both the immediate 
neighbours of F face opposite directions. K and J 
both face the same direction. L sits second to the 
right of K. I is not facing the same direction as G is 
facing. G sits at one of the extreme ends of the 
line. Both K and J face the same direction as L. 
Only three persons sit between K and G.

Who among the following is on the immediate left 
of L?`, qi: ``, o: [`I`, `F`, `J`, `E`, `None of these`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 85, s: `Reasoning Ability`, q: `Study the following 
information carefully to answer the given 
questions. 
 
 E, F, G, H, I, J, K and L are sitting in a straight line, 
but not necessarily in the same order. Some of 
them are not facing north. Only three persons sit 
between I and F. Both H and E face the same 
direction and H sits third to the right of E. I is not 
an immediate neighbour of E or H. K sits on the 
immediate left of F, who faces north. J sits on the 
immediate right of G. Neither E no r H is an 
immediate neighbour of G. Both the immediate 
neighbours of F face opposite directions. K and J 
both face the same direction. L sits second to the 
right of K. I is not facing the same direction as G is 
facing. G sits at one of the extreme ends of the 
line. Both K and J face the same direction as L. 
Only three persons sit between K and G.

Which of the following statements is true?`, qi: ``, o: [`Only two persons between G and F`, `Only three persons between J and K`, `L faces the same directions as F`, `E is third to the right of H`, `None is true 
 
 Direction (86 -90): Study the information given 
below and answer the questions based on it. 
 Eight persons A, B, C, D, E, F, G and H live on an 
eight floors building. The ground floor is numbered 
1 and the topmost floor is 8. They run in a race 
different meters, 4200m, 5600m, 6100m, 6800m, 
7400m, 7800m, 8200m and 9400m but not 
necessarily in the same order. A runs 4200m lives 
on even numbered floor below 5 th floor. The one 
who live on 4 th and 5 th floor total run 12000m. 
Three persons live between A and C. Two persons 
live between C and H. Three persons live between 
H and the one who runs 7400m. One person lives 
between G and the one who runs 7400m and G 
lives above the one who runs 7400m. Two pers ons 
live between G and the one who runs 5600m. D , 
who runs 6800m, is lives above A on an odd 
numbered floor. The one who lives just above D is 
run less than D. B lives above G. The one who lives 
on 3rd floor runs more than E who runs more than 
F.`], oi: [``, ``, ``, ``, ``], e: `` },
  { n: 86, s: `Reasoning Ability`, q: `In each question given below 
three statements are followed by two conclusions 
numbered I and II. You have to take the three 
given statements to be true even if they seem to 
be at variance with the commonly known facts. 
Read the conclusions and decide which conclusion 
logically follows from the three given statement 
disregarding commonly known facts. Give answer - 
 Statements: All tables are chairs. 
All chairs are pencil. 
Some pencil are pen. 
Conclusions: 
I. All tables are pencils. 
II. All pens being tables is a possibility. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusion I and II follow. 
77. Directions: Study the following information and 
answer the questions. 
 In each of the questions below are given two or 
three statements followed by two conclusions 
numbered I, II and III. You have to take the given 
statements to be true even if they seem to be at 
variance with commonly known facts. Read all the 
conclusions an d then decide which of the given 
conclusions logically follow from the given 
statements, disregarding commonly known facts. 
 Statements: Some stones are rocks 
All rocks are hills 
Conclusions: 
I. All rocks being stones is a possibility 
II. At least some hills are stones 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or conclusion II follows. 
D. Neither conclusion I nor conclusion II follows. 
E. Both conclusions I and II follow. 
78. In each question given belo w three statements are 
followed by two conclusions numbered I and II. 
You have to take the three given statements to be 
true even if they seem to be at variance from the 
commonly known facts. Read the conclusions and 
decide which logically follows from the three-given 
statement disregarding commonly known facts. 
Give answer 
 Statements: No officer is manager. 
Some managers are staffs. 
Some honest are officers. 
Conclusions: 
I. It is possibility that some honest are staff. 
II. It is possibility that all manager is honest. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusions I and II follow. 
79. In each question given below three statements a re 
followed by two conclusions numbered I and II. 
You have to take the three given statements to be 
true even if they seem to be at variance from the 
commonly known facts. Read the conclusions and 
decide which logically follows from the three -given 
statement disregarding commonly known facts. 
Give answer 
 Statements: Some doors are bells. 
Some bells are bags. 
All opens are bell. 
Conclusions: 
I. Some open are doors. 
II. All bags can be open is a possibility. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusions I and II follow. 
 
80. Directions: Study the following information and 
answer the questions. 
 
 In each of the questions below are given two or 
three statements followed by two conclusions 
numbered I, II and III. You have to take the given 
statements to be true even if they seem to be at 
variance with commonly known facts. Read all the 
conclusions an d then decide which of the given 
conclusions logically follow from the given 
statements, disregarding commonly known facts. 
 Statements: 
Some flats are apartments 
Some apartments are halls 
No hall is a room 
Conclusions: 
I. At least some halls are flats 
II. All rooms being apartments is a possibility 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or conclusion II follows. 
D. Neither conclusion I nor conclusion II follows. 
E. Both conclusions I and II follow. 
 

[[PAGEBREAK]]
 Direction (81 -85): Study the following 
information carefully to answer the given 
questions. 
 
 E, F, G, H, I, J, K and L are sitting in a straight line, 
but not necessarily in the same order. Some of 
them are not facing north. Only three persons sit 
between I and F. Both H and E face the same 
direction and H sits third to the right of E. I is not 
an immediate neighbour of E or H. K sits on the 
immediate left of F, who faces north. J sits on the 
immediate right of G. Neither E no r H is an 
immediate neighbour of G. Both the immediate 
neighbours of F face opposite directions. K and J 
both face the same direction. L sits second to the 
right of K. I is not facing the same direction as G is 
facing. G sits at one of the extreme ends of the 
line. Both K and J face the same direction as L. 
Only three persons sit between K and G. 
81. How many persons are not facing north? 
 A. Two B. Three 
C. Four D. Five 
E. None of these 
82. Who among the following sit at the extreme ends 
of the line? 
 A. I,G B. E,K 
C. L,G D. F,I 
E. None of these 
83. Who among the following sits exactly between H 
and the one who is third to the right of I? 
 A. L B. F 
C. J D. E 
E. None of these 
84. Who among the following is on the immediate left 
of L? 
 A. I B. F 
 C. J D. E 
E. None of these 
85. Which of the following statements is true? 
 A. Only two persons between G and F 
B. Only three persons between J and K 
C. L faces the same directions as F 
D. E is third to the right of H 
E. None is true 
 
 Direction (86 -90): Study the information given 
below and answer the questions based on it. 
 Eight persons A, B, C, D, E, F, G and H live on an 
eight floors building. The ground floor is numbered 
1 and the topmost floor is 8. They run in a race 
different meters, 4200m, 5600m, 6100m, 6800m, 
7400m, 7800m, 8200m and 9400m but not 
necessarily in the same order. A runs 4200m lives 
on even numbered floor below 5 th floor. The one 
who live on 4 th and 5 th floor total run 12000m. 
Three persons live between A and C. Two persons 
live between C and H. Three persons live between 
H and the one who runs 7400m. One person lives 
between G and the one who runs 7400m and G 
lives above the one who runs 7400m. Two pers ons 
live between G and the one who runs 5600m. D , 
who runs 6800m, is lives above A on an odd 
numbered floor. The one who lives just above D is 
run less than D. B lives above G. The one who lives 
on 3rd floor runs more than E who runs more than 
F.

The person who runs the highest lives on which of 
the following floor?`, qi: ``, o: [`1st`, `2nd`, `3rd`, `8th`, `5th`], oi: [``, ``, ``, ``, ``], e: `The one who runs the most lives on 3rd floor. •A runs 4200m lives on even numbered floor below 5th floor. We gets 2 cases- A either lives on 2nd or 4th floor. Case 1: A lives on 2nd floor- •Three persons live between A and C. C must live on 6th floor. Two persons live between C and H. H must live on 3rd floor. •Three persons live between H and the one who runs 7400m. So the one who runs 7400m lives on 7th floor. •One person lives between G and the one who runs 7400m and G lives above the one who runs 7400m but from this cannot be possible so this case gets rejected. Case 1: A lives on 4th floor- •Three persons live between A and C. C must live on 8th floor. Two persons live between C and H. H must live on 5th floor. •Three persons live between H and the one who runs 7400m. So the one who runs 7400m lives on 1st floor. •One person lives between G and the one who runs 7400m and G lives above the one who runs 7400m so G lives on 3rd floor. •Two persons live between G and the one who runs 5600m. So the one who runs 5600m lives on 6th floor. •D ,who runs 6800m, is lives above A on an odd numbered floor. D must live on 7th floor. •The one who live on 4th and 5th floor total run 12000m. A lives on 4th floor and runs 4200m and H lives on 5th floor so H runs= 12000-4200=7800m. •B lives above G. B must live on 6th floor. •The one who lives just above D is run less than D. So only 3 persons runs less than D because D runs 6800m and two of them already placed so C must runs 6100m. •The o` },
  { n: 87, s: `Reasoning Ability`, q: `In each question given below 
three statements are followed by two conclusions 
numbered I and II. You have to take the three 
given statements to be true even if they seem to 
be at variance with the commonly known facts. 
Read the conclusions and decide which conclusion 
logically follows from the three given statement 
disregarding commonly known facts. Give answer - 
 Statements: All tables are chairs. 
All chairs are pencil. 
Some pencil are pen. 
Conclusions: 
I. All tables are pencils. 
II. All pens being tables is a possibility. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusion I and II follow. 
77. Directions: Study the following information and 
answer the questions. 
 In each of the questions below are given two or 
three statements followed by two conclusions 
numbered I, II and III. You have to take the given 
statements to be true even if they seem to be at 
variance with commonly known facts. Read all the 
conclusions an d then decide which of the given 
conclusions logically follow from the given 
statements, disregarding commonly known facts. 
 Statements: Some stones are rocks 
All rocks are hills 
Conclusions: 
I. All rocks being stones is a possibility 
II. At least some hills are stones 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or conclusion II follows. 
D. Neither conclusion I nor conclusion II follows. 
E. Both conclusions I and II follow. 
78. In each question given belo w three statements are 
followed by two conclusions numbered I and II. 
You have to take the three given statements to be 
true even if they seem to be at variance from the 
commonly known facts. Read the conclusions and 
decide which logically follows from the three-given 
statement disregarding commonly known facts. 
Give answer 
 Statements: No officer is manager. 
Some managers are staffs. 
Some honest are officers. 
Conclusions: 
I. It is possibility that some honest are staff. 
II. It is possibility that all manager is honest. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusions I and II follow. 
79. In each question given below three statements a re 
followed by two conclusions numbered I and II. 
You have to take the three given statements to be 
true even if they seem to be at variance from the 
commonly known facts. Read the conclusions and 
decide which logically follows from the three -given 
statement disregarding commonly known facts. 
Give answer 
 Statements: Some doors are bells. 
Some bells are bags. 
All opens are bell. 
Conclusions: 
I. Some open are doors. 
II. All bags can be open is a possibility. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusions I and II follow. 
 
80. Directions: Study the following information and 
answer the questions. 
 
 In each of the questions below are given two or 
three statements followed by two conclusions 
numbered I, II and III. You have to take the given 
statements to be true even if they seem to be at 
variance with commonly known facts. Read all the 
conclusions an d then decide which of the given 
conclusions logically follow from the given 
statements, disregarding commonly known facts. 
 Statements: 
Some flats are apartments 
Some apartments are halls 
No hall is a room 
Conclusions: 
I. At least some halls are flats 
II. All rooms being apartments is a possibility 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or conclusion II follows. 
D. Neither conclusion I nor conclusion II follows. 
E. Both conclusions I and II follow. 
 

[[PAGEBREAK]]
 Direction (81 -85): Study the following 
information carefully to answer the given 
questions. 
 
 E, F, G, H, I, J, K and L are sitting in a straight line, 
but not necessarily in the same order. Some of 
them are not facing north. Only three persons sit 
between I and F. Both H and E face the same 
direction and H sits third to the right of E. I is not 
an immediate neighbour of E or H. K sits on the 
immediate left of F, who faces north. J sits on the 
immediate right of G. Neither E no r H is an 
immediate neighbour of G. Both the immediate 
neighbours of F face opposite directions. K and J 
both face the same direction. L sits second to the 
right of K. I is not facing the same direction as G is 
facing. G sits at one of the extreme ends of the 
line. Both K and J face the same direction as L. 
Only three persons sit between K and G. 
81. How many persons are not facing north? 
 A. Two B. Three 
C. Four D. Five 
E. None of these 
82. Who among the following sit at the extreme ends 
of the line? 
 A. I,G B. E,K 
C. L,G D. F,I 
E. None of these 
83. Who among the following sits exactly between H 
and the one who is third to the right of I? 
 A. L B. F 
C. J D. E 
E. None of these 
84. Who among the following is on the immediate left 
of L? 
 A. I B. F 
 C. J D. E 
E. None of these 
85. Which of the following statements is true? 
 A. Only two persons between G and F 
B. Only three persons between J and K 
C. L faces the same directions as F 
D. E is third to the right of H 
E. None is true 
 
 Direction (86 -90): Study the information given 
below and answer the questions based on it. 
 Eight persons A, B, C, D, E, F, G and H live on an 
eight floors building. The ground floor is numbered 
1 and the topmost floor is 8. They run in a race 
different meters, 4200m, 5600m, 6100m, 6800m, 
7400m, 7800m, 8200m and 9400m but not 
necessarily in the same order. A runs 4200m lives 
on even numbered floor below 5 th floor. The one 
who live on 4 th and 5 th floor total run 12000m. 
Three persons live between A and C. Two persons 
live between C and H. Three persons live between 
H and the one who runs 7400m. One person lives 
between G and the one who runs 7400m and G 
lives above the one who runs 7400m. Two pers ons 
live between G and the one who runs 5600m. D , 
who runs 6800m, is lives above A on an odd 
numbered floor. The one who lives just above D is 
run less than D. B lives above G. The one who lives 
on 3rd floor runs more than E who runs more than 
F.

How many persons run more than B?`, qi: ``, o: [`2`, `3`, `4`, `5`, `More than 5`], oi: [``, ``, ``, ``, ``], e: `6 persons run more than B. •A runs 4200m lives on even numbered floor below 5th floor. We gets 2 cases- A either lives on 2nd or 4th floor. Case 1: A lives on 2nd floor- •Three persons live between A and C. C must live on 6th floor. Two persons live between C and H. H must live on 3rd floor. •Three persons live between H and the one who runs 7400m. So the one who runs 7400m lives on 7th floor. •One person lives between G and the one who runs 7400m and G lives above the one who runs 7400m but from this cannot be possible so this case gets rejected. Case 1: A lives on 4th floor- •Three persons live between A and C. C must live on 8th floor. Two persons live between C and H. H must live on 5th floor. •Three persons live between H and the one who runs 7400m. So the one who runs 7400m lives on 1st floor. •One person lives between G and the one who runs 7400m and G lives above the one who runs 7400m so G lives on 3rd floor. •Two persons live between G and the one who runs 5600m. So the one who runs 5600m lives on 6th floor. •D ,who runs 6800m, is lives above A on an odd numbered floor. D must live on 7th floor. •The one who live on 4th and 5th floor total run 12000m. A lives on 4th floor and runs 4200m and H lives on 5th floor so H runs= 12000-4200=7800m. •B lives above G. B must live on 6th floor. •The one who lives just above D is run less than D. So only 3 persons runs less than D because D runs 6800m and two of them already placed so C must runs 6100m. •The one who lives on 3rd` },
  { n: 88, s: `Reasoning Ability`, q: `In each question given below 
three statements are followed by two conclusions 
numbered I and II. You have to take the three 
given statements to be true even if they seem to 
be at variance with the commonly known facts. 
Read the conclusions and decide which conclusion 
logically follows from the three given statement 
disregarding commonly known facts. Give answer - 
 Statements: All tables are chairs. 
All chairs are pencil. 
Some pencil are pen. 
Conclusions: 
I. All tables are pencils. 
II. All pens being tables is a possibility. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusion I and II follow. 
77. Directions: Study the following information and 
answer the questions. 
 In each of the questions below are given two or 
three statements followed by two conclusions 
numbered I, II and III. You have to take the given 
statements to be true even if they seem to be at 
variance with commonly known facts. Read all the 
conclusions an d then decide which of the given 
conclusions logically follow from the given 
statements, disregarding commonly known facts. 
 Statements: Some stones are rocks 
All rocks are hills 
Conclusions: 
I. All rocks being stones is a possibility 
II. At least some hills are stones 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or conclusion II follows. 
D. Neither conclusion I nor conclusion II follows. 
E. Both conclusions I and II follow. 
78. In each question given belo w three statements are 
followed by two conclusions numbered I and II. 
You have to take the three given statements to be 
true even if they seem to be at variance from the 
commonly known facts. Read the conclusions and 
decide which logically follows from the three-given 
statement disregarding commonly known facts. 
Give answer 
 Statements: No officer is manager. 
Some managers are staffs. 
Some honest are officers. 
Conclusions: 
I. It is possibility that some honest are staff. 
II. It is possibility that all manager is honest. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusions I and II follow. 
79. In each question given below three statements a re 
followed by two conclusions numbered I and II. 
You have to take the three given statements to be 
true even if they seem to be at variance from the 
commonly known facts. Read the conclusions and 
decide which logically follows from the three -given 
statement disregarding commonly known facts. 
Give answer 
 Statements: Some doors are bells. 
Some bells are bags. 
All opens are bell. 
Conclusions: 
I. Some open are doors. 
II. All bags can be open is a possibility. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusions I and II follow. 
 
80. Directions: Study the following information and 
answer the questions. 
 
 In each of the questions below are given two or 
three statements followed by two conclusions 
numbered I, II and III. You have to take the given 
statements to be true even if they seem to be at 
variance with commonly known facts. Read all the 
conclusions an d then decide which of the given 
conclusions logically follow from the given 
statements, disregarding commonly known facts. 
 Statements: 
Some flats are apartments 
Some apartments are halls 
No hall is a room 
Conclusions: 
I. At least some halls are flats 
II. All rooms being apartments is a possibility 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or conclusion II follows. 
D. Neither conclusion I nor conclusion II follows. 
E. Both conclusions I and II follow. 
 

[[PAGEBREAK]]
 Direction (81 -85): Study the following 
information carefully to answer the given 
questions. 
 
 E, F, G, H, I, J, K and L are sitting in a straight line, 
but not necessarily in the same order. Some of 
them are not facing north. Only three persons sit 
between I and F. Both H and E face the same 
direction and H sits third to the right of E. I is not 
an immediate neighbour of E or H. K sits on the 
immediate left of F, who faces north. J sits on the 
immediate right of G. Neither E no r H is an 
immediate neighbour of G. Both the immediate 
neighbours of F face opposite directions. K and J 
both face the same direction. L sits second to the 
right of K. I is not facing the same direction as G is 
facing. G sits at one of the extreme ends of the 
line. Both K and J face the same direction as L. 
Only three persons sit between K and G. 
81. How many persons are not facing north? 
 A. Two B. Three 
C. Four D. Five 
E. None of these 
82. Who among the following sit at the extreme ends 
of the line? 
 A. I,G B. E,K 
C. L,G D. F,I 
E. None of these 
83. Who among the following sits exactly between H 
and the one who is third to the right of I? 
 A. L B. F 
C. J D. E 
E. None of these 
84. Who among the following is on the immediate left 
of L? 
 A. I B. F 
 C. J D. E 
E. None of these 
85. Which of the following statements is true? 
 A. Only two persons between G and F 
B. Only three persons between J and K 
C. L faces the same directions as F 
D. E is third to the right of H 
E. None is true 
 
 Direction (86 -90): Study the information given 
below and answer the questions based on it. 
 Eight persons A, B, C, D, E, F, G and H live on an 
eight floors building. The ground floor is numbered 
1 and the topmost floor is 8. They run in a race 
different meters, 4200m, 5600m, 6100m, 6800m, 
7400m, 7800m, 8200m and 9400m but not 
necessarily in the same order. A runs 4200m lives 
on even numbered floor below 5 th floor. The one 
who live on 4 th and 5 th floor total run 12000m. 
Three persons live between A and C. Two persons 
live between C and H. Three persons live between 
H and the one who runs 7400m. One person lives 
between G and the one who runs 7400m and G 
lives above the one who runs 7400m. Two pers ons 
live between G and the one who runs 5600m. D , 
who runs 6800m, is lives above A on an odd 
numbered floor. The one who lives just above D is 
run less than D. B lives above G. The one who lives 
on 3rd floor runs more than E who runs more than 
F.

Which of the following combination is correct?`, qi: ``, o: [`D-6100m`, `C-7th floor`, `A-4th floor`, `E-7400m`, `G-4th floor`], oi: [``, ``, ``, ``, ``], e: `A lives on the 4th floor. •A runs 4200m lives on even numbered floor below 5th floor. We gets 2 cases- A either lives on 2nd or 4th floor. Case 1: A lives on 2nd floor- •Three persons live between A and C. C must live on 6th floor. Two persons live between C and H. H must live on 3rd floor. •Three persons live between H and the one who runs 7400m. So the one who runs 7400m lives on 7th floor. •One person lives between G and the one who runs 7400m and G lives above the one who runs 7400m but from this cannot be possible so this case gets rejected. Case 1: A lives on 4th floor- •Three persons live between A and C. C must live on 8th floor. Two persons live between C and H. H must live on 5th floor. •Three persons live between H and the one who runs 7400m. So the one who runs 7400m lives on 1st floor. •One person lives between G and the one who runs 7400m and G lives above the one who runs 7400m so G lives on 3rd floor. •Two persons live between G and the one who runs 5600m. So the one who runs 5600m lives on 6th floor. •D ,who runs 6800m, is lives above A on an odd numbered floor. D must live on 7th floor. •The one who live on 4th and 5th floor total run 12000m. A lives on 4th floor and runs 4200m and H lives on 5th floor so H runs= 12000-4200=7800m. •B lives above G. B must live on 6th floor. •The one who lives just above D is run less than D. So only 3 persons runs less than D because D runs 6800m and two of them already placed so C must runs 6100m. •The one who lives on 3rd ` },
  { n: 89, s: `Reasoning Ability`, q: `In each question given below 
three statements are followed by two conclusions 
numbered I and II. You have to take the three 
given statements to be true even if they seem to 
be at variance with the commonly known facts. 
Read the conclusions and decide which conclusion 
logically follows from the three given statement 
disregarding commonly known facts. Give answer - 
 Statements: All tables are chairs. 
All chairs are pencil. 
Some pencil are pen. 
Conclusions: 
I. All tables are pencils. 
II. All pens being tables is a possibility. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusion I and II follow. 
77. Directions: Study the following information and 
answer the questions. 
 In each of the questions below are given two or 
three statements followed by two conclusions 
numbered I, II and III. You have to take the given 
statements to be true even if they seem to be at 
variance with commonly known facts. Read all the 
conclusions an d then decide which of the given 
conclusions logically follow from the given 
statements, disregarding commonly known facts. 
 Statements: Some stones are rocks 
All rocks are hills 
Conclusions: 
I. All rocks being stones is a possibility 
II. At least some hills are stones 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or conclusion II follows. 
D. Neither conclusion I nor conclusion II follows. 
E. Both conclusions I and II follow. 
78. In each question given belo w three statements are 
followed by two conclusions numbered I and II. 
You have to take the three given statements to be 
true even if they seem to be at variance from the 
commonly known facts. Read the conclusions and 
decide which logically follows from the three-given 
statement disregarding commonly known facts. 
Give answer 
 Statements: No officer is manager. 
Some managers are staffs. 
Some honest are officers. 
Conclusions: 
I. It is possibility that some honest are staff. 
II. It is possibility that all manager is honest. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusions I and II follow. 
79. In each question given below three statements a re 
followed by two conclusions numbered I and II. 
You have to take the three given statements to be 
true even if they seem to be at variance from the 
commonly known facts. Read the conclusions and 
decide which logically follows from the three -given 
statement disregarding commonly known facts. 
Give answer 
 Statements: Some doors are bells. 
Some bells are bags. 
All opens are bell. 
Conclusions: 
I. Some open are doors. 
II. All bags can be open is a possibility. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusions I and II follow. 
 
80. Directions: Study the following information and 
answer the questions. 
 
 In each of the questions below are given two or 
three statements followed by two conclusions 
numbered I, II and III. You have to take the given 
statements to be true even if they seem to be at 
variance with commonly known facts. Read all the 
conclusions an d then decide which of the given 
conclusions logically follow from the given 
statements, disregarding commonly known facts. 
 Statements: 
Some flats are apartments 
Some apartments are halls 
No hall is a room 
Conclusions: 
I. At least some halls are flats 
II. All rooms being apartments is a possibility 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or conclusion II follows. 
D. Neither conclusion I nor conclusion II follows. 
E. Both conclusions I and II follow. 
 

[[PAGEBREAK]]
 Direction (81 -85): Study the following 
information carefully to answer the given 
questions. 
 
 E, F, G, H, I, J, K and L are sitting in a straight line, 
but not necessarily in the same order. Some of 
them are not facing north. Only three persons sit 
between I and F. Both H and E face the same 
direction and H sits third to the right of E. I is not 
an immediate neighbour of E or H. K sits on the 
immediate left of F, who faces north. J sits on the 
immediate right of G. Neither E no r H is an 
immediate neighbour of G. Both the immediate 
neighbours of F face opposite directions. K and J 
both face the same direction. L sits second to the 
right of K. I is not facing the same direction as G is 
facing. G sits at one of the extreme ends of the 
line. Both K and J face the same direction as L. 
Only three persons sit between K and G. 
81. How many persons are not facing north? 
 A. Two B. Three 
C. Four D. Five 
E. None of these 
82. Who among the following sit at the extreme ends 
of the line? 
 A. I,G B. E,K 
C. L,G D. F,I 
E. None of these 
83. Who among the following sits exactly between H 
and the one who is third to the right of I? 
 A. L B. F 
C. J D. E 
E. None of these 
84. Who among the following is on the immediate left 
of L? 
 A. I B. F 
 C. J D. E 
E. None of these 
85. Which of the following statements is true? 
 A. Only two persons between G and F 
B. Only three persons between J and K 
C. L faces the same directions as F 
D. E is third to the right of H 
E. None is true 
 
 Direction (86 -90): Study the information given 
below and answer the questions based on it. 
 Eight persons A, B, C, D, E, F, G and H live on an 
eight floors building. The ground floor is numbered 
1 and the topmost floor is 8. They run in a race 
different meters, 4200m, 5600m, 6100m, 6800m, 
7400m, 7800m, 8200m and 9400m but not 
necessarily in the same order. A runs 4200m lives 
on even numbered floor below 5 th floor. The one 
who live on 4 th and 5 th floor total run 12000m. 
Three persons live between A and C. Two persons 
live between C and H. Three persons live between 
H and the one who runs 7400m. One person lives 
between G and the one who runs 7400m and G 
lives above the one who runs 7400m. Two pers ons 
live between G and the one who runs 5600m. D , 
who runs 6800m, is lives above A on an odd 
numbered floor. The one who lives just above D is 
run less than D. B lives above G. The one who lives 
on 3rd floor runs more than E who runs more than 
F.

H runs how many meters?`, qi: ``, o: [`5600m`, `7800m`, `9400m`, `8200m`, `6100m`], oi: [``, ``, ``, ``, ``], e: `H runs 7800m •A runs 4200m lives on even numbered floor below 5th floor. We gets 2 cases- A either lives on 2nd or 4th floor. Case 1: A lives on 2nd floor- •Three persons live between A and C. C must live on 6th floor. Two persons live between C and H. H must live on 3rd floor. •Three persons live between H and the one who runs 7400m. So the one who runs 7400m lives on 7th floor. •One person lives between G and the one who runs 7400m and G lives above the one who runs 7400m but from this cannot be possible so this case gets rejected. Case 1: A lives on 4th floor- •Three persons live between A and C. C must live on 8th floor. Two persons live between C and H. H must live on 5th floor. •Three persons live between H and the one who runs 7400m. So the one who runs 7400m lives on 1st floor. •One person lives between G and the one who runs 7400m and G lives above the one who runs 7400m so G lives on 3rd floor. •Two persons live between G and the one who runs 5600m. So the one who runs 5600m lives on 6th floor. •D ,who runs 6800m, is lives above A on an odd numbered floor. D must live on 7th floor. •The one who live on 4th and 5th floor total run 12000m. A lives on 4th floor and runs 4200m and H lives on 5th floor so H runs= 12000-4200=7800m. •B lives above G. B must live on 6th floor. •The one who lives just above D is run less than D. So only 3 persons runs less than D because D runs 6800m and two of them already placed so C must runs 6100m. •The one who lives on 3rd floor runs mo` },
  { n: 90, s: `Reasoning Ability`, q: `In each question given below 
three statements are followed by two conclusions 
numbered I and II. You have to take the three 
given statements to be true even if they seem to 
be at variance with the commonly known facts. 
Read the conclusions and decide which conclusion 
logically follows from the three given statement 
disregarding commonly known facts. Give answer - 
 Statements: All tables are chairs. 
All chairs are pencil. 
Some pencil are pen. 
Conclusions: 
I. All tables are pencils. 
II. All pens being tables is a possibility. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusion I and II follow. 
77. Directions: Study the following information and 
answer the questions. 
 In each of the questions below are given two or 
three statements followed by two conclusions 
numbered I, II and III. You have to take the given 
statements to be true even if they seem to be at 
variance with commonly known facts. Read all the 
conclusions an d then decide which of the given 
conclusions logically follow from the given 
statements, disregarding commonly known facts. 
 Statements: Some stones are rocks 
All rocks are hills 
Conclusions: 
I. All rocks being stones is a possibility 
II. At least some hills are stones 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or conclusion II follows. 
D. Neither conclusion I nor conclusion II follows. 
E. Both conclusions I and II follow. 
78. In each question given belo w three statements are 
followed by two conclusions numbered I and II. 
You have to take the three given statements to be 
true even if they seem to be at variance from the 
commonly known facts. Read the conclusions and 
decide which logically follows from the three-given 
statement disregarding commonly known facts. 
Give answer 
 Statements: No officer is manager. 
Some managers are staffs. 
Some honest are officers. 
Conclusions: 
I. It is possibility that some honest are staff. 
II. It is possibility that all manager is honest. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusions I and II follow. 
79. In each question given below three statements a re 
followed by two conclusions numbered I and II. 
You have to take the three given statements to be 
true even if they seem to be at variance from the 
commonly known facts. Read the conclusions and 
decide which logically follows from the three -given 
statement disregarding commonly known facts. 
Give answer 
 Statements: Some doors are bells. 
Some bells are bags. 
All opens are bell. 
Conclusions: 
I. Some open are doors. 
II. All bags can be open is a possibility. 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or II follows. 
D. Neither conclusion I nor II follows. 
E. Both conclusions I and II follow. 
 
80. Directions: Study the following information and 
answer the questions. 
 
 In each of the questions below are given two or 
three statements followed by two conclusions 
numbered I, II and III. You have to take the given 
statements to be true even if they seem to be at 
variance with commonly known facts. Read all the 
conclusions an d then decide which of the given 
conclusions logically follow from the given 
statements, disregarding commonly known facts. 
 Statements: 
Some flats are apartments 
Some apartments are halls 
No hall is a room 
Conclusions: 
I. At least some halls are flats 
II. All rooms being apartments is a possibility 
 A. Only conclusion I follows. 
B. Only conclusion II follows. 
C. Either conclusion I or conclusion II follows. 
D. Neither conclusion I nor conclusion II follows. 
E. Both conclusions I and II follow. 
 

[[PAGEBREAK]]
 Direction (81 -85): Study the following 
information carefully to answer the given 
questions. 
 
 E, F, G, H, I, J, K and L are sitting in a straight line, 
but not necessarily in the same order. Some of 
them are not facing north. Only three persons sit 
between I and F. Both H and E face the same 
direction and H sits third to the right of E. I is not 
an immediate neighbour of E or H. K sits on the 
immediate left of F, who faces north. J sits on the 
immediate right of G. Neither E no r H is an 
immediate neighbour of G. Both the immediate 
neighbours of F face opposite directions. K and J 
both face the same direction. L sits second to the 
right of K. I is not facing the same direction as G is 
facing. G sits at one of the extreme ends of the 
line. Both K and J face the same direction as L. 
Only three persons sit between K and G. 
81. How many persons are not facing north? 
 A. Two B. Three 
C. Four D. Five 
E. None of these 
82. Who among the following sit at the extreme ends 
of the line? 
 A. I,G B. E,K 
C. L,G D. F,I 
E. None of these 
83. Who among the following sits exactly between H 
and the one who is third to the right of I? 
 A. L B. F 
C. J D. E 
E. None of these 
84. Who among the following is on the immediate left 
of L? 
 A. I B. F 
 C. J D. E 
E. None of these 
85. Which of the following statements is true? 
 A. Only two persons between G and F 
B. Only three persons between J and K 
C. L faces the same directions as F 
D. E is third to the right of H 
E. None is true 
 
 Direction (86 -90): Study the information given 
below and answer the questions based on it. 
 Eight persons A, B, C, D, E, F, G and H live on an 
eight floors building. The ground floor is numbered 
1 and the topmost floor is 8. They run in a race 
different meters, 4200m, 5600m, 6100m, 6800m, 
7400m, 7800m, 8200m and 9400m but not 
necessarily in the same order. A runs 4200m lives 
on even numbered floor below 5 th floor. The one 
who live on 4 th and 5 th floor total run 12000m. 
Three persons live between A and C. Two persons 
live between C and H. Three persons live between 
H and the one who runs 7400m. One person lives 
between G and the one who runs 7400m and G 
lives above the one who runs 7400m. Two pers ons 
live between G and the one who runs 5600m. D , 
who runs 6800m, is lives above A on an odd 
numbered floor. The one who lives just above D is 
run less than D. B lives above G. The one who lives 
on 3rd floor runs more than E who runs more than 
F.

Who among the following lives on the 7th floor?`, qi: ``, o: [`A`, `B`, `D`, `H`, `G 
 
 Direction (91 -93): Study the following 
information and answer the questions. 
 
 Rahul goes to his office from his house by a car. He 
drives the car from point A. He drives 5km towards 
south and reaches point B, then he turns to his 
right and drives 4km and reaches point C. Now he 
turns to his right and drives 12km and reaches 
point D. He then takes a left turn and drives 5km 
and reaches point E. Finally he drives 7km towards 
south and reaches his office.`], oi: [``, ``, ``, ``, ``], e: `D lives on the 7th floor. •A runs 4200m lives on even numbered floor below 5th floor. We gets 2 cases- A either lives on 2nd or 4th floor. Case 1: A lives on 2nd floor- •Three persons live between A and C. C must live on 6th floor. Two persons live between C and H. H must live on 3rd floor. •Three persons live between H and the one who runs 7400m. So the one who runs 7400m lives on 7th floor. •One person lives between G and the one who runs 7400m and G lives above the one who runs 7400m but from this cannot be possible so this case gets rejected. Case 1: A lives on 4th floor- •Three persons live between A and C. C must live on 8th floor. Two persons live between C and H. H must live on 5th floor. •Three persons live between H and the one who runs 7400m. So the one who runs 7400m lives on 1st floor. •One person lives between G and the one who runs 7400m and G lives above the one who runs 7400m so G lives on 3rd floor. •Two persons live between G and the one who runs 5600m. So the one who runs 5600m lives on 6th floor. •D ,who runs 6800m, is lives above A on an odd numbered floor. D must live on 7th floor. •The one who live on 4th and 5th floor total run 12000m. A lives on 4th floor and runs 4200m and H lives on 5th floor so H runs= 12000-4200=7800m. •B lives above G. B must live on 6th floor. •The one who lives just above D is run less than D. So only 3 persons runs less than D because D runs 6800m and two of them already placed so C must runs 6100m. •The one who lives on 3rd ` },
  { n: 91, s: `Reasoning Ability`, q: `Study the following 
information and answer the questions. 
 
 Rahul goes to his office from his house by a car. He 
drives the car from point A. He drives 5km towards 
south and reaches point B, then he turns to his 
right and drives 4km and reaches point C. Now he 
turns to his right and drives 12km and reaches 
point D. He then takes a left turn and drives 5km 
and reaches point E. Finally he drives 7km towards 
south and reaches his office.

What is the distance between point A and his 
office?`, qi: ``, o: [`10km`, `9km`, `7km`, `6km`, `None of these`], oi: [``, ``, ``, ``, ``], e: `The distance between point A and his office is 9 km.` },
  { n: 92, s: `Reasoning Ability`, q: `Study the following 
information and answer the questions. 
 
 Rahul goes to his office from his house by a car. He 
drives the car from point A. He drives 5km towards 
south and reaches point B, then he turns to his 
right and drives 4km and reaches point C. Now he 
turns to his right and drives 12km and reaches 
point D. He then takes a left turn and drives 5km 
and reaches point E. Finally he drives 7km towards 
south and reaches his office.

If point G is 4km to the east of the point D, then 
how far is G from A and in which direction from 
point A?`, qi: ``, o: [`7km, north`, `5km, north`, `9km, south`, `7km, east`, `None of these`], oi: [``, ``, ``, ``, ``], e: `7km, north` },
  { n: 93, s: `Reasoning Ability`, q: `Study the following 
information and answer the questions. 
 
 Rahul goes to his office from his house by a car. He 
drives the car from point A. He drives 5km towards 
south and reaches point B, then he turns to his 
right and drives 4km and reaches point C. Now he 
turns to his right and drives 12km and reaches 
point D. He then takes a left turn and drives 5km 
and reaches point E. Finally he drives 7km towards 
south and reaches his office.

If Rahul goes 5km to the east from the office, then 
how far and in which direction will he be from point 
D?`, qi: ``, o: [`7km, south`, `4km, north`, `1km, south`, `5km, north`, `None of these 
 
 Direction (94 -96): Study the following 
information and answer the questions. 
 
 There are eight people in a family viz. M, K, A, C, 
D, E, G and H consists of 3 generations. (Note - 
order is not necessarily same) Four of them are 
female. D and A are daughter and son of K 
respectively and both are married. E is sister of H 
whose father i s C. M and G are of 3rd generation 
and M is son-in-law of E. K is brother-in-law of H.`], oi: [``, ``, ``, ``, ``], e: `If Rahul goes 5km to the east from the office, than he will be in 7 km at South direction from point D.` },
  { n: 94, s: `Reasoning Ability`, q: `Study the following 
information and answer the questions. 
 
 There are eight people in a family viz. M, K, A, C, 
D, E, G and H consists of 3 generations. (Note - 
order is not necessarily same) Four of them are 
female. D and A are daughter and son of K 
respectively and both are married. E is sister of H 
whose father i s C. M and G are of 3rd generation 
and M is son-in-law of E. K is brother-in-law of H.

Who among the following is sister-in-law of D?`, qi: ``, o: [`H`, `A`, `M`, `G`, `C`], oi: [``, ``, ``, ``, ``], e: `G is the sister-in-law of D. Female members are - E, H, D & G Male members are - C, K, M & A` },
  { n: 95, s: `Reasoning Ability`, q: `Study the following 
information and answer the questions. 
 
 There are eight people in a family viz. M, K, A, C, 
D, E, G and H consists of 3 generations. (Note - 
order is not necessarily same) Four of them are 
female. D and A are daughter and son of K 
respectively and both are married. E is sister of H 
whose father i s C. M and G are of 3rd generation 
and M is son-in-law of E. K is brother-in-law of H.

If Q is child of D then how A is related to that 
child?`, qi: ``, o: [`Paternal uncle`, `Maternal uncle`, `Father`, `Cannot be determined`, `Grandfather`], oi: [``, ``, ``, ``, ``], e: `If Q is child of D then A is Maternal uncle of that child Female members are - E, H, D & G Male members are - C, K, M & A` },
  { n: 96, s: `Reasoning Ability`, q: `Study the following 
information and answer the questions. 
 
 There are eight people in a family viz. M, K, A, C, 
D, E, G and H consists of 3 generations. (Note - 
order is not necessarily same) Four of them are 
female. D and A are daughter and son of K 
respectively and both are married. E is sister of H 
whose father i s C. M and G are of 3rd generation 
and M is son-in-law of E. K is brother-in-law of H.

How is H related to D?`, qi: ``, o: [`Sister`, `Mother`, `Grandmother`, `Sister-in-law`, `Aunt`], oi: [``, ``, ``, ``, ``], e: `H is aunt of D. Female members are - E, H, D & G Male members are - C, K, M & A` },
  { n: 97, s: `Reasoning Ability`, q: `Direction: Study the following information and 
answer the questions given below: 
 Each of five friends A, B, C, D and E travels 
different distances to their workplaces. A travels 
more than B but less than E. D travels more than 
only C. The one, who travels the most, travels 30 
km. B travels 15 km to his workplace. 
 Who amongst the following possibly travels 5 km to 
the workplace?`, qi: ``, o: [`A`, `C`, `D`, `E`, `Either C or D 
 
 Directions (98 -100): Study the following 
information carefully and answer the questions 
given below: 
 
 Seven persons A, C, H, J, N, O, and V are arranged 
in terms of decreasing heights values but with 
random weights. 
 The height of C is 164 cm. The height of J, 161 cm 
is exactly in the middle. The lowest weight is 55 
kg. All the weights are in multiple of 5 kg. O is not 
the shortest but its weight is highest. H is sho rter 
than only two persons. N’s weight is 65 kg. The 
lowest height is 157 cm. The person with 80 kg 
weight is the longest. C is shorter than only one 
person. V’s weight is 70 kg, which is 5 kg less than 
H. N is longer than both persons, who have highest 
weight and V. J does not have lowest weight. There 
is a difference of 9 cm between the person highest 
in height and person highest in weight.`], oi: [``, ``, ``, ``, ``], e: `According to the question, distance travelled E (30) > A > B (15) > D > C Either C or D possibly travels 5 km to the workplace` },
  { n: 98, s: `Reasoning Ability`, q: `Study the following 
information carefully and answer the questions 
given below: 
 
 Seven persons A, C, H, J, N, O, and V are arranged 
in terms of decreasing heights values but with 
random weights. 
 The height of C is 164 cm. The height of J, 161 cm 
is exactly in the middle. The lowest weight is 55 
kg. All the weights are in multiple of 5 kg. O is not 
the shortest but its weight is highest. H is sho rter 
than only two persons. N’s weight is 65 kg. The 
lowest height is 157 cm. The person with 80 kg 
weight is the longest. C is shorter than only one 
person. V’s weight is 70 kg, which is 5 kg less than 
H. N is longer than both persons, who have highest 
weight and V. J does not have lowest weight. There 
is a difference of 9 cm between the person highest 
in height and person highest in weight.

What is the possible height of the person H?`, qi: ``, o: [`160 cm`, `162 cm`, `163 cm`, `Either option b or c`, `159 cm`], oi: [``, ``, ``, ``, ``], e: `as seen from the figure that person H might have height of 162 or 163 cm, so option D is the correct answer.` },
  { n: 99, s: `Reasoning Ability`, q: `Study the following 
information carefully and answer the questions 
given below: 
 
 Seven persons A, C, H, J, N, O, and V are arranged 
in terms of decreasing heights values but with 
random weights. 
 The height of C is 164 cm. The height of J, 161 cm 
is exactly in the middle. The lowest weight is 55 
kg. All the weights are in multiple of 5 kg. O is not 
the shortest but its weight is highest. H is sho rter 
than only two persons. N’s weight is 65 kg. The 
lowest height is 157 cm. The person with 80 kg 
weight is the longest. C is shorter than only one 
person. V’s weight is 70 kg, which is 5 kg less than 
H. N is longer than both persons, who have highest 
weight and V. J does not have lowest weight. There 
is a difference of 9 cm between the person highest 
in height and person highest in weight.

Who among the following is the third shortest?`, qi: ``, o: [`O`, `N`, `H`, `None of them is true`, `Either N or O`], oi: [``, ``, ``, ``, ``], e: `as seen from the diagram that the person N is the third shortest.` },
  { n: 100, s: `Reasoning Ability`, q: `Study the following 
information carefully and answer the questions 
given below: 
 
 Seven persons A, C, H, J, N, O, and V are arranged 
in terms of decreasing heights values but with 
random weights. 
 The height of C is 164 cm. The height of J, 161 cm 
is exactly in the middle. The lowest weight is 55 
kg. All the weights are in multiple of 5 kg. O is not 
the shortest but its weight is highest. H is sho rter 
than only two persons. N’s weight is 65 kg. The 
lowest height is 157 cm. The person with 80 kg 
weight is the longest. C is shorter than only one 
person. V’s weight is 70 kg, which is 5 kg less than 
H. N is longer than both persons, who have highest 
weight and V. J does not have lowest weight. There 
is a difference of 9 cm between the person highest 
in height and person highest in weight.

Which among the following has the second highest 
weight?`, qi: ``, o: [`N`, `J`, `C`, `A`, `None of them`], oi: [``, ``, ``, ``, ``], e: `as seen from the diagram that the person A has second highest weight (80 kg). ***` }
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
      tags: ['IBPS', 'PO', 'Prelims', 'PYQ', '2016'],
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

  const TEST_TITLE = `IBPS PO Prelims - 2016`;
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 100, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2016, pyqShift: null,
    pyqExamName: 'IBPS PO Prelims', questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
