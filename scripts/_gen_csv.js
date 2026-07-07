import mongoose from 'mongoose';import dotenv from 'dotenv';import path from 'path';import fs from 'fs';import {fileURLToPath} from 'url';
const __d=path.dirname(fileURLToPath(import.meta.url));dotenv.config({path:path.resolve(__d,'../.env.local')});dotenv.config({path:path.resolve(__d,'../.env')});
const Exam=mongoose.models.Exam||mongoose.model('Exam',new mongoose.Schema({},{strict:false}));
const ExamPattern=mongoose.models.ExamPattern||mongoose.model('ExamPattern',new mongoose.Schema({},{strict:false}));
const PracticeTest=mongoose.models.PracticeTest||mongoose.model('PracticeTest',new mongoose.Schema({},{strict:false}));
await mongoose.connect(process.env.MONGO_URI);
const pats=await ExamPattern.find({}).select('_id exam').lean();
const patToExam=new Map(pats.map(p=>[String(p._id),String(p.exam)]));
const exams=await Exam.find({}).select('_id name code').lean();
const tests=await PracticeTest.find({}).select('examPattern isPYQ').lean();
const agg=new Map();
for(const t of tests){const ex=patToExam.get(String(t.examPattern));if(!ex)continue;if(!agg.has(ex))agg.set(ex,{pyq:0,pt:0});const r=agg.get(ex);if(t.isPYQ)r.pyq++;else r.pt++;}
const rows=[];
for(const e of exams){const r=agg.get(String(e._id));if(!r||(r.pyq+r.pt)===0)continue;rows.push({name:e.name||'',code:e.code||'',pt:r.pt,pyq:r.pyq,total:r.pt+r.pyq});}
rows.sort((a,b)=> b.total-a.total || b.pyq-a.pyq || a.name.localeCompare(b.name));
let out='Rank\tExam Name\tExam Code\tPractice Tests\tPYQ’s Count\tTotal\r\n';
rows.forEach((r,i)=>{out+=`${i+1}\t${r.name}\t${r.code}\t${r.pt}\t${r.pyq}\t${r.total}\r\n`;});
const buf=Buffer.concat([Buffer.from([0xFF,0xFE]),Buffer.from(out,'utf16le')]);
fs.writeFileSync(path.resolve(__d,'../exams_pt_and_pyq_list.csv'),buf);
console.log('wrote',rows.length,'exams. Totals: PT',rows.reduce((s,r)=>s+r.pt,0),'PYQ',rows.reduce((s,r)=>s+r.pyq,0));
await mongoose.disconnect();
