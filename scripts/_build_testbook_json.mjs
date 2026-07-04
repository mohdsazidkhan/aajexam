
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseTestbook(streamPath, outPath) {
    if (!fs.existsSync(streamPath)) return;
    const lines = fs.readFileSync(streamPath, 'utf8').split('\n');
    
    let questions = [];
    let currentQ = null;
    let inOptions = false;
    let optionCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;
        
        // Find Answers at the bottom
        const ansMatch = line.match(/Que\.\s+(\d+)\s+Correct Option -\s+(\d+)/);
        if (ansMatch) {
            const qN = parseInt(ansMatch[1]);
            const ansNum = parseInt(ansMatch[2]);
            const qObj = questions.find(q => q.qNum === qN);
            if (qObj) {
                qObj.correctAnswerIndex = ansNum - 1;
            }
            continue;
        }
        
        // Find Questions
        const qMatch = line.match(/^Que\.\s+(\d+)\s+(.+)/);
        if (qMatch) {
            if (currentQ) questions.push(currentQ);
            
            currentQ = {
                qNum: parseInt(qMatch[1]),
                questionText: qMatch[2],
                questionImage: '',
                options: [],
                optionImages: [],
                correctAnswerIndex: 0,
                explanation: '',
                section: 'Paper II',
                difficulty: 'medium',
                tags: []
            };
            inOptions = true;
            optionCount = 0;
        } else if (currentQ && inOptions && optionCount < 4) {
            // Assume the next 4 non-empty lines are options
            if (!line.startsWith('Que.')) {
                currentQ.options.push(line);
                currentQ.optionImages.push('');
                optionCount++;
            }
        }
    }
    if (currentQ) questions.push(currentQ);
    
    // Cleanup
    questions.forEach(q => {
        while (q.options.length < 4) {
            q.options.push('Option');
            q.optionImages.push('');
        }
    });
    
    fs.writeFileSync(outPath, JSON.stringify(questions, null, 2));
    console.log('Wrote', questions.length, 'questions to', outPath);
}

parseTestbook(path.join(__dirname, '_stream_cil2017_elec.txt'), path.join(__dirname, '_parsed_cil2017_elec.json'));

