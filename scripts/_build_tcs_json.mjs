
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseTCS(streamPath, keyPath, outPath, sectionMap) {
    if (!fs.existsSync(streamPath)) return;
    const lines = fs.readFileSync(streamPath, 'utf8').split('\n');
    const keys = fs.readFileSync(keyPath, 'utf8').split('\n').filter(l => l.startsWith('Q')).map(l => parseInt(l.split('=')[1]));
    
    let questions = [];
    let currentQ = null;
    let currentOption = 0;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        // Find Q.X
        const qMatch = line.match(/Q\.(\d+)/);
        if (qMatch && !line.includes('Question ID')) {
            if (currentQ) questions.push(currentQ);
            
            let images = [];
            
            // Extract images on the same line
            if (line.includes('[[IMG:')) {
                const matches = [...line.matchAll(/\[\[IMG:(.+?)\]\]/g)].map(m => m[1]);
                images.push(...matches);
            }
            
            // Look back for images before Q.X
            for (let j = i - 1; j >= 0; j--) {
                const prev = lines[j].trim();
                if (prev.match(/Q\.\d+/)) break;
                if (prev.includes('[[IMG:')) {
                    const matches = [...prev.matchAll(/\[\[IMG:(.+?)\]\]/g)].map(m => m[1]);
                    images.unshift(...matches); // prepend
                }
            }
            
            currentQ = {
                qNum: parseInt(qMatch[1]),
                questionText: 'Refer to image',
                questionImage: images.join(','),
                options: ['', '', '', ''],
                optionImages: ['', '', '', ''],
                correctAnswerIndex: 0,
                explanation: '',
                section: 'Paper I',
                difficulty: 'medium',
                tags: []
            };
            currentOption = 0;
        } else if (currentQ && line.match(/(?:Ans\s*)?([1-4])\./)) {
            // found an option
            const optNum = parseInt(line.match(/(?:Ans\s*)?([1-4])\./)[1]);
            currentOption = optNum;
            // extract text/image for this option
            if (line.includes('[[IMG:')) {
                const img = line.match(/\[\[IMG:(.+?)\]\]/)[1];
                currentQ.optionImages[optNum - 1] = img;
            } else {
                currentQ.options[optNum - 1] = line.replace(/^(?:Ans\s*)?[1-4]\./, '').replace(/Status : Answered|Chosen Option : \d/g, '').trim();
            }
        } else if (currentQ && currentOption > 0) {
            // continuation of option
            if (line.includes('[[IMG:')) {
                const img = line.match(/\[\[IMG:(.+?)\]\]/)[1];
                currentQ.optionImages[currentOption - 1] = img;
            } else if (!line.includes('Status : Answered') && !line.includes('Chosen Option') && !line.includes('Question ID') && !line.match(/Q\.\d+/)) {
                 if(line) currentQ.options[currentOption - 1] += ' ' + line;
            }
        }
    }
    if (currentQ) questions.push(currentQ);
    
    // Assign keys
    questions.forEach((q, idx) => {
        const k = keys[idx];
        if (k > 0 && k <= 4) {
            q.correctAnswerIndex = k - 1;
        } else {
            q.correctAnswerIndex = 0; // default if key missing
        }
        
        for (let o=0; o<4; o++) {
            if (!q.options[o] && !q.optionImages[o]) {
                q.options[o] = 'Option ' + (o+1);
            }
        }
        if (!q.questionImage && q.questionText === 'Refer to image') {
            q.questionText = 'Question text missing.';
        }
    });
    
    fs.writeFileSync(outPath, JSON.stringify(questions, null, 2));
    console.log('Wrote', questions.length, 'questions to', outPath);
}

parseTCS(path.join(__dirname, '_stream_cil2017_gen.txt'), path.join(__dirname, '_key_cil2017_gen.txt'), path.join(__dirname, '_parsed_cil2017_gen.json'));
parseTCS(path.join(__dirname, '_stream_cil2017_mech.txt'), path.join(__dirname, '_key_cil2017_mech.txt'), path.join(__dirname, '_parsed_cil2017_mech.json'));

