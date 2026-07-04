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

const IMAGE_DIR = path.join(__dirname, '../public/images/exams/cil/2017');
const MAP_FILE = path.join(__dirname, 'cloudinary_map_cil.json');

async function uploadFile(filePath, filename) {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'aajexam/exams/cil/2017',
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
    console.log('Starting Cloudinary Upload...');
    
    // Find all actually used images
    const requiredImages = new Set();
    const jsons = ['_parsed_cil2017_gen.json', '_parsed_cil2017_mech.json', '_parsed_cil2017_elec.json'];
    for (const f of jsons) {
        if (!fs.existsSync(path.join(__dirname, f))) continue;
        const qs = JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8'));
        for (const q of qs) {
            if (q.questionImage) requiredImages.add(q.questionImage.split(',')[0]);
            if (q.optionImages) {
                for (const oi of q.optionImages) {
                    if (oi) requiredImages.add(oi);
                }
            }
        }
    }
    console.log('Total required images in JSONs:', requiredImages.size);

    let mapping = {};
    if (fs.existsSync(MAP_FILE)) {
        mapping = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
    }

    if (!fs.existsSync(IMAGE_DIR)) {
        console.log('Image directory not found!');
        process.exit(1);
    }

    let files = fs.readdirSync(IMAGE_DIR).filter(f => !fs.statSync(path.join(IMAGE_DIR, f)).isDirectory());
    // Filter only required files
    files = files.filter(f => requiredImages.has(f));
    
    console.log('Found', files.length, 'required images to upload.');

    // Upload in batches of 10
    const BATCH_SIZE = 10;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        const promises = batch.map(async (f) => {
            if (mapping[f]) return; // Already uploaded
            const url = await uploadFile(path.join(IMAGE_DIR, f), f);
            if (url) {
                mapping[f] = url;
            }
        });
        await Promise.all(promises);
        
        fs.writeFileSync(MAP_FILE, JSON.stringify(mapping, null, 2));
        console.log('Progress:', Math.min(i + BATCH_SIZE, files.length), '/', files.length);
    }
    
    console.log('Upload complete! Connecting to DB to update PracticeTests...');
    
    try {
        await mongoose.connect(MONGO_URI);
        const tests = await PracticeTest.find({ slug: { $in: ['cil-mt-2017-general', 'cil-mt-2017-mechanical', 'cil-mt-2017-electrical'] } });
        
        for (const test of tests) {
            let modified = false;
            for (let q of test.questions) {
                // Update questionImage
                if (q.questionImage && q.questionImage.startsWith('/images/exams/cil/2017/')) {
                    const filename = q.questionImage.split('/').pop();
                    if (mapping[filename]) {
                        q.questionImage = mapping[filename];
                        modified = true;
                    }
                }
                
                // Update optionImages
                if (q.optionImages && Array.isArray(q.optionImages)) {
                    for (let j = 0; j < q.optionImages.length; j++) {
                        if (q.optionImages[j] && q.optionImages[j].startsWith('/images/exams/cil/2017/')) {
                            const filename = q.optionImages[j].split('/').pop();
                            if (mapping[filename]) {
                                q.optionImages[j] = mapping[filename];
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
