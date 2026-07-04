import Tesseract from 'tesseract.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runOCR(imageName) {
    const imagePath = path.join(__dirname, '../public/images/exams/cil/2017', imageName);
    console.log('Testing OCR on:', imageName);
    try {
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', { logger: m => {} });
        console.log('=============================');
        console.log('RESULT FOR', imageName);
        console.log('=============================');
        console.log(text.trim());
        console.log('=============================\n');
    } catch (e) {
        console.error('OCR Error:', e);
    }
}

async function main() {
    // Test on a few images
    await runOCR('image6.png'); // Question text
    await runOCR('image13.jpeg'); // Option text
    await runOCR('image32.jpeg'); // Another question
    process.exit(0);
}
main();
