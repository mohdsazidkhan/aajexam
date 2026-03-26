import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import dbConnect from '../lib/db';
import Level from '../models/Level';
import Quiz from '../models/Quiz';

const LevelsPage = dynamic(() => import('../components/pages/LevelsPage'), {
    ssr: false,
    loading: () => <div>Loading...</div>
});

export default function QuizLevels({ levels }) {
    return (
        <>
            <Head>
                <title>My Levels | SUBG QUIZ</title>
            </Head>
            <Suspense fallback={<div>Loading...</div>}>
                {/* showNavbar={false} because this page is wrapped in StudentLayout which has its own Sidebar/Navbar */}
                <LevelsPage showNavbar={false} />
            </Suspense>
        </>
    );
}

// Reuse server-side logic from levels.js if needed, or just rely on component's internal fetching
// Copying getServerSideProps for consistency with levels.js
export async function getServerSideProps(context) {
    try {
        await dbConnect();
        
        const levels = await Level.find({ isActive: true }).sort({ levelNumber: 1 });
        
        // Enhance levels with quiz counts
        const enhancedLevels = await Promise.all(levels.map(async (level) => {
            const quizCount = await Quiz.countDocuments({ 
                levelNumber: level.levelNumber, 
                status: 'approved' 
            });
            return {
                ...level.toObject(),
                level: level.levelNumber, // Mobile parity
                quizCount
            };
        }));

        return {
            props: {
                levels: JSON.parse(JSON.stringify(enhancedLevels)),
            },
        };
    } catch (error) {
        console.error('Error fetching levels:', error);
        // Return empty array to use default content in component
        return {
            props: {
                levels: [],
            },
        };
    }
}
