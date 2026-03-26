const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

// Connection URIs
const LIVE_URI = 'mongodb+srv://sajidpahat786:sajidpahat786@cluster0.dnrv0.mongodb.net/SubgQuiz?retryWrites=true&w=majority';
const LOCAL_URI = 'mongodb://localhost:27017/SubgQuiz?retryWrites=true&w=majority';

async function syncDatabases() {
    const liveClient = new MongoClient(LIVE_URI);
    const localClient = new MongoClient(LOCAL_URI);

    try {
        console.log('🚀 Connecting to databases...');
        await liveClient.connect();
        await localClient.connect();
        console.log('✅ Connected to both LIVE and LOCAL databases.');

        const liveDb = liveClient.db();
        const localDb = localClient.db();

        // Get all collections from live DB
        const collections = await liveDb.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log(`📦 Found ${collectionNames.length} collections to sync:`, collectionNames.join(', '));

        for (const colName of collectionNames) {
            console.log(`\n🔄 Syncing collection: ${colName}...`);
            
            // Get data from live
            const data = await liveDb.collection(colName).find({}).toArray();
            console.log(`   - Fetched ${data.length} documents from live.`);

            if (data.length > 0) {
                // Clear local collection
                await localDb.collection(colName).deleteMany({});
                console.log(`   - Cleared local collection ${colName}.`);

                // Insert into local
                await localDb.collection(colName).insertMany(data);
                console.log(`   - Successfully inserted ${data.length} documents into local.`);
            } else {
                console.log(`   - Collection is empty on live, skipping insert.`);
                // Still clear local if it exists
                await localDb.collection(colName).deleteMany({});
            }
        }

        console.log('\n✨ Database sync completed successfully!');
    } catch (error) {
        console.error('\n❌ Error during sync:', error);
    } finally {
        await liveClient.close();
        await localClient.close();
    }
}

syncDatabases();
