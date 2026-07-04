import fs from 'fs';

function parse(streamPath, keyPath, outPath) {
    if (!fs.existsSync(streamPath)) return;
    let t = fs.readFileSync(streamPath, 'utf8');
    t = t.replace(/\t/g, '\n');
    t = t.replace(/Question ID\s*:/g, '\nQuestion ID :');
    t = t.replace(/Option 1 ID\s*:/g, '\nOption 1 ID :');
    t = t.replace(/Option 2 ID\s*:/g, '\nOption 2 ID :');
    t = t.replace(/Option 3 ID\s*:/g, '\nOption 3 ID :');
    t = t.replace(/Option 4 ID\s*:/g, '\nOption 4 ID :');
    t = t.replace(/Status\s*:/g, '\nStatus :');
    t = t.replace(/Chosen Option\s*:/g, '\nChosen Option :');
    // Handle squashed options like "Ans 1 . 20202. 20213. 201 64. 201 8"
    t = t.replace(/Ans\s*1\s*\./g, '\nAns 1.');
    t = t.replace(/([^\s])2\s*\./g, '$1\n2.');
    t = t.replace(/([^\s])3\s*\./g, '$1\n3.');
    t = t.replace(/([^\s])4\s*\./g, '$1\n4.');
    
    const lines = t.split('\n').map(x => x.trim()).filter(x => x);
    const keys = fs.readFileSync(keyPath, 'utf8').split('\n').filter(l => l.startsWith('Q')).map(l => parseInt(l.split('=')[1]));
    
    let questions = [];
    let qCount = 0;
    
    // Find all indices of 'Question ID :'
    let qIndices = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Question ID')) {
            qIndices.push(i);
        }
    }
    
    let seenQids = new Set();
    
    for (let idx of qIndices) {
        let qidMatch = lines[idx].match(/Question ID\s*:\s*([\d\s]+)/);
        if (!qidMatch) continue;
        let qid = qidMatch[1].replace(/\s+/g, '');
        if (seenQids.has(qid)) continue;
        seenQids.add(qid);
        qCount++;
        
        // Go backwards to collect question and options
        let currentChunk = [];
        for (let j = idx - 1; j >= 0; j--) {
            let cLine = lines[j];
            if (cLine.startsWith('Chosen Option :') || cLine.startsWith('Status :') || cLine.startsWith('Option 4 ID :') || cLine.startsWith('Question ID :')) {
                break; // Hit the previous question's metadata
            }
            if (cLine.startsWith('Section :') || cLine.match(/Participant ID|Participant Name|Test Center Name|Test Date|Test Time|Subject/) || cLine.match(/^[0-9:\/ AM\-PM]+$/) || cLine === 'CIL' || cLine === 'MT' || cLine === 'Previous Year Paper' || cLine.includes('Shift 1') || cLine.includes('Electrical') || cLine.includes('Mechanical') || cLine.includes('Environment') || cLine === 'CIL MT') {
                continue; // Skip headers
            }
            currentChunk.unshift(cLine);
        }
        
        let qTextLines = [];
        let options = ['', '', '', ''];
        let optionImages = ['', '', '', ''];
        let images = [];
        let inOptions = false;
        let optIdx = 0;
        let correctIdx = 0;
        
        for (let cLine of currentChunk) {
            let optMatch = cLine.match(/^(?:Ans\s*)?([1-4])\.(.*)/);
            if (optMatch) {
                inOptions = true;
                optIdx = parseInt(optMatch[1]) - 1;
                let text = optMatch[2].trim();
                if (text.includes('[[TICK]]')) {
                    correctIdx = optIdx;
                    text = text.replace('[[TICK]]', '');
                }
                if (text.includes('[[IMG:')) {
                    let m2 = text.match(/\[\[IMG:(.*?)\]\]/);
                    if (m2) optionImages[optIdx] = m2[1];
                } else {
                    options[optIdx] = text;
                }
            } else if (inOptions) {
                if (cLine.includes('[[TICK]]')) {
                    correctIdx = optIdx;
                    cLine = cLine.replace('[[TICK]]', '');
                }
                if (cLine.includes('[[IMG:')) {
                    let m = cLine.match(/\[\[IMG:(.*?)\]\]/);
                    if (m) {
                        optionImages[optIdx] = m[1];
                    }
                } else {
                    options[optIdx] += ' ' + cLine;
                }
            } else {
                if (cLine.includes('[[IMG:')) {
                    let matches = [...cLine.matchAll(/\[\[IMG:(.+?)\]\]/g)].map(m => m[1]);
                    images.push(...matches);
                    let cleanLine = cLine.replace(/\[\[IMG:.+?\]\]/g, '').trim();
                    if (cleanLine) qTextLines.push(cleanLine);
                } else {
                    qTextLines.push(cLine);
                }
            }
        }
        
        let qText = qTextLines.join('\n');
        qText = qText.replace(/^Q\.\d+\s*/, '').trim();
        if (!qText && images.length) qText = "Refer to image";
        
        questions.push({
            qid: qid,
            qNum: qCount,
            questionText: qText,
            questionImage: images.join(','),
            options: options.map(x => x.trim()),
            optionImages: optionImages,
            correctAnswerIndex: correctIdx,
            explanation: '',
            section: 'Paper',
            difficulty: 'medium',
            tags: []
        });
    }
    
    // Check missing correct answer index
    for (let q of questions) {
        if (q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) q.correctAnswerIndex = 0;
        for (let o=0; o<4; o++) {
            if (!q.options[o] && !q.optionImages[o]) {
                q.options[o] = 'Option ' + (o+1);
            }
        }
    }
    
    fs.writeFileSync(outPath, JSON.stringify(questions, null, 2));
    console.log(`Parsed ${questions.length} unique questions to ${outPath}`);
}

parse('_stream_cil2025_elecmech.txt', '_key_cil2025_elecmech.txt', '_parsed_cil2025_elecmech.json');
parse('_stream_cil2025_env.txt', '_key_cil2025_env.txt', '_parsed_cil2025_env.json');
