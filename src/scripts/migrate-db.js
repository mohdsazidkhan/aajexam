const { MongoClient } = require('mongodb');
require('dotenv').config();

// Configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sajidpahat786:sajidpahat786@cluster0.dnrv0.mongodb.net/AajExam?retryWrites=true&w=majority';
const SOURCE_DB = 'AajExam';
const TARGET_DB = 'AajExam';

async function migrateDatabase() {
    const client = new MongoClient(MONGO_URI);

    try {
        console.log('🚀 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected successfully.');

        const sourceDb = client.db(SOURCE_DB);
        const targetDb = client.db(TARGET_DB);

        // Get all collections from source DB
        const collections = await sourceDb.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log(`📦 Found ${collectionNames.length} collections in ${SOURCE_DB} to migrate:`, collectionNames.join(', '));

        for (const colName of collectionNames) {
            console.log(`\n🔄 Migrating collection: ${colName}...`);
            
            // Get data from source
            const data = await sourceDb.collection(colName).find({}).toArray();
            console.log(`   - Fetched ${data.length} documents from ${SOURCE_DB}.`);

            if (data.length > 0) {
                // Clear target collection first (optional, but safer for a clean copy)
                await targetDb.collection(colName).deleteMany({});
                console.log(`   - Cleared target collection ${colName} in ${TARGET_DB}.`);

                // Insert into target
                await targetDb.collection(colName).insertMany(data);
                console.log(`   - Successfully inserted ${data.length} documents into ${TARGET_DB}.`);
            } else {
                console.log(`   - Collection is empty, skipping.`);
            }
        }

        console.log('\n✨ Database migration completed successfully!');
    } catch (error) {
        console.error('\n❌ Error during migration:', error);
    } finally {
        await client.close();
    }
}

migrateDatabase();

