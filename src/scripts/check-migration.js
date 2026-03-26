const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function checkMigration() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db('AajExam');
        const collections = await db.listCollections().toArray();
        console.log('✅ Collections in AajExam:', collections.map(c => c.name).join(', '));
        
        const usersCount = await db.collection('users').countDocuments();
        console.log('📊 Users count in AajExam:', usersCount);
        
        const quizzesCount = await db.collection('quizzes').countDocuments();
        console.log('📊 Quizzes count in AajExam:', quizzesCount);
        
    } catch (error) {
        console.error('❌ Error checking migration:', error);
    } finally {
        await client.close();
    }
}

checkMigration();
