const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: '.env.local' });

async function seed() {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is missing');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const db = mongoose.connection.db;

        // Fetch all topics
        const topics = await db.collection('topics').find({}).toArray();
        console.log(`Found ${topics.length} topics. Seeding flashcards...`);

        // First, clear any previously seeded dummy flashcards to prevent duplicates
        await db.collection('flashcarddecks').deleteMany({ slug: { $regex: '^dummy-rev-' } });

        const gradients = [
            'bg-gradient-to-br from-indigo-500 to-purple-600',
            'bg-gradient-to-br from-teal-500 to-emerald-600',
            'bg-gradient-to-br from-pink-500 to-rose-600',
            'bg-gradient-to-br from-cyan-500 to-blue-600',
            'bg-gradient-to-br from-amber-500 to-orange-600'
        ];

        let count = 0;
        for (const topic of topics) {
            const cards = [
                {
                    content: `<h1>${topic.name}</h1><p>Welcome to the quick revision deck for ${topic.name}.</p><p>Swipe right to continue.</p>`,
                    backgroundColor: gradients[0]
                },
                {
                    content: `<h2>Key Concept 1</h2><br/><p>Always remember the fundamentals of <strong>${topic.name}</strong> when attempting your exams.</p>`,
                    backgroundColor: gradients[1]
                },
                {
                    content: `<h2>Important Tip</h2><br/><p>Most questions from <strong>${topic.name}</strong> focus on recent trends and historical data.</p>`,
                    backgroundColor: gradients[2]
                },
                {
                    content: `<h1>You did it! 🎉</h1><p>Keep practicing quizzes for ${topic.name} to maximize your score.</p>`,
                    backgroundColor: gradients[3]
                }
            ];

            await db.collection('flashcarddecks').insertOne({
                title: `${topic.name} Revision Cards`,
                slug: `dummy-rev-${topic._id.toString()}`,
                description: `Quick flashcards and important points to revise ${topic.name} before exams.`,
                topic: topic._id,
                subject: topic.subject || null,
                status: 'published',
                cards: cards,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            count++;
        }

        console.log(`Seeded ${count} Flashcard Decks successfully!`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
