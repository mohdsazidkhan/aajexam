import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const MONGO_URI = process.env.MONGO_URI;

const PracticeTestSchema = new mongoose.Schema({
    slug: String,
    questions: Array
});
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', PracticeTestSchema);

const BASE_IMG_DIR = "D:\\Sazid\\Github\\aajexam\\scripts";
const MAP_FILE = path.join(__dirname, 'cloudinary_map_cil_2025.json');

const jsons = [
    { file: '_parsed_cil2025_elecmech.json', slug: 'cil-mt-2025-elecmech-shift1', extract_dir: '_extracted_cil2025_elecmech' },
    { file: '_parsed_cil2025_env.json', slug: 'cil-mt-2025-env-shift1', extract_dir: '_extracted_cil2025_env' }
];

async function uploadFile(filePath, filename) {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'aajexam/exams/cil/2025',
            public_id: filename.replace(/\.[^/.]+$/, ''), // remove extension
            resource_type: 'image'
        });
        return result.secure_url;
    } catch (e) {
        console.error('Error uploading', filename, e);
        return null;
    }
}

async function run() {
    console.log('Starting Cloudinary Upload for CIL 2025...');

    let mapping = {};
    if (fs.existsSync(MAP_FILE)) {
        mapping = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
    }

    const filesToUpload = [];

    // Collect all required images and their absolute paths
    for (const item of jsons) {
        const jsonPath = path.join(__dirname, item.file);
        if (!fs.existsSync(jsonPath)) continue;
        
        const qs = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const extractDir = path.join(BASE_IMG_DIR, item.extract_dir);
        
        for (const q of qs) {
            if (q.questionImage) {
                const f = q.questionImage.split(',')[0];
                filesToUpload.push({ filename: f, filepath: path.join(extractDir, f) });
            }
            if (q.optionImages) {
                for (const oi of q.optionImages) {
                    if (oi) {
                        const f = oi.split(',')[0];
                        filesToUpload.push({ filename: f, filepath: path.join(extractDir, f) });
                    }
                }
            }
        }
    }

    // Deduplicate array based on filepath
    const uniqueFiles = [];
    const seenPaths = new Set();
    for (const f of filesToUpload) {
        if (!seenPaths.has(f.filepath) && fs.existsSync(f.filepath)) {
            seenPaths.add(f.filepath);
            uniqueFiles.push(f);
        }
    }

    console.log('Found', uniqueFiles.length, 'required images to upload across all papers.');

    // Upload in batches of 10
    const BATCH_SIZE = 10;
    for (let i = 0; i < uniqueFiles.length; i += BATCH_SIZE) {
        const batch = uniqueFiles.slice(i, i + BATCH_SIZE);
        const promises = batch.map(async (fileObj) => {
            // We use a prefix key mapping to avoid collisions across different papers having 'image1.png'
            // We'll map the filename with a small prefix like extract_dir name or use a unique mapping key.
            // Wait, the DB stores them as `/images/exams/cil/2020/imageX.png`. If there are collisions, they'll overwrite.
            // Oh, each paper has its own extracted images which might collide if they are all just "image1.png".
            // Since we seeded them all as `/images/exams/cil/2020/imageX.png`, if they collide they might be different images.
            // Let's use a unique key for mapping: `<slug>_image.png`
            const uniqueFilename = `${path.basename(path.dirname(fileObj.filepath))}_${fileObj.filename}`;
            const mapKey = fileObj.filename; // But the questions only have the filename in DB.
            
            // Wait, if we use just `fileObj.filename`, they will overwrite in `mapping`. 
            // In the DB, the images are referenced as `/images/exams/cil/2020/image2.png`.
            // So if two tests use `image2.png`, they will point to the same file. 
            // BUT wait, `_parse_docx.py` generated image1, image2 in each zip separately!
            // That means "image1.png" in Civil paper is different from "image1.png" in Mechanical paper!
            // Since we ALREADY seeded the DB with `/images/exams/cil/2020/image1.png` for both, this is an issue!
            
            // Instead, I should update the `q.questionImage` in DB with the Cloudinary URL.
            // Let's map it based on the exact test's slug. 
            
            const mappingKey = `${path.basename(path.dirname(fileObj.filepath))}_${fileObj.filename}`;
            if (mapping[mappingKey]) return; // Already uploaded
            
            const url = await uploadFile(fileObj.filepath, mappingKey);
            if (url) {
                mapping[mappingKey] = url;
            }
        });
        await Promise.all(promises);
        
        fs.writeFileSync(MAP_FILE, JSON.stringify(mapping, null, 2));
        console.log('Progress:', Math.min(i + BATCH_SIZE, uniqueFiles.length), '/', uniqueFiles.length);
    }
    
    console.log('Upload complete! Connecting to DB to update PracticeTests...');
    
    try {
        await mongoose.connect(MONGO_URI);
        const slugs = jsons.map(j => j.slug);
        const tests = await PracticeTest.find({ slug: { $in: slugs } });
        
        for (const test of tests) {
            const testConfig = jsons.find(j => j.slug === test.slug);
            let modified = false;
            
            for (let q of test.questions) {
                if (q.questionImage && q.questionImage.startsWith('/images/exams/cil/2020/')) {
                    const filename = q.questionImage.split('/').pop();
                    const mappingKey = `${testConfig.extract_dir}_${filename}`;
                    if (mapping[mappingKey]) {
                        q.questionImage = mapping[mappingKey];
                        modified = true;
                    }
                }
                
                if (q.optionImages && Array.isArray(q.optionImages)) {
                    for (let j = 0; j < q.optionImages.length; j++) {
                        if (q.optionImages[j] && q.optionImages[j].startsWith('/images/exams/cil/2020/')) {
                            const filename = q.optionImages[j].split('/').pop();
                            const mappingKey = `${testConfig.extract_dir}_${filename}`;
                            if (mapping[mappingKey]) {
                                q.optionImages[j] = mapping[mappingKey];
                                modified = true;
                            }
                        }
                    }
                }
            }
            
            if (modified) {
                await PracticeTest.updateOne({ _id: test._id }, { $set: { questions: test.questions } });
                console.log('Updated DB for test:', test.slug);
            } else {
                console.log('No local images found to replace in test:', test.slug);
            }
        }
    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await mongoose.disconnect();
    }
    
    console.log('Done.');
}

run();
