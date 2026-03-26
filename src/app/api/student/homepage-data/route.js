import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import MonthlyWinners from '@/models/MonthlyWinners';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import Article from '@/models/Article';
import mongoose from 'mongoose';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'monthly';
        const date = searchParams.get('date');
        const week = searchParams.get('week');

        const user = await User.findById(auth.user.id);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        // Ensure level is correct only for current data
        if (!date && !week) {
            await user.updateLevel();
            await user.save();
        }

        const filterValue = type === 'daily' ? date : (type === 'weekly' ? week : null);
        const levelInfo = await User.getHistoricalLevelInfo(user._id, type, filterValue);
        const competitionLevel = await User.getHistoricalCompetitionLevel(user._id, type, filterValue);
        
        if (!levelInfo && filterValue) {
            return NextResponse.json({ error: `No historical data found for ${type} ${filterValue}` }, { status: 404 });
        }

        const currentLevel = competitionLevel.currentLevel;
        const targetLevel = (currentLevel === 0) ? 1 :
            (currentLevel === 10) ? 10 :
                currentLevel + 1;

        // Check level access
        const levelAccess = user.canAccessLevel(targetLevel);
        if (!levelAccess.canAccess) {
            return NextResponse.json({
                message: `You need a ${levelAccess.requiredPlan} subscription to access level ${targetLevel} quizzes`,
                requiredPlan: levelAccess.requiredPlan,
                accessibleLevels: levelAccess.accessibleLevels
            }, { status: 403 });
        }

        // Fetch required homepage data
        const categories = await Category.find().limit(10);
        const subcategories = await Subcategory.find()
            .populate('category', 'name')
            .sort({ name: 1 });

        const topPerformers = await User.find({ role: 'student' })
            .select('name dailyProgress weeklyProgress monthlyProgress badges subscriptionStatus')
            .sort({ 'monthlyProgress.currentLevel': -1, 'monthlyProgress.totalScore': -1 })
            .limit(5);

        const recentWinners = await MonthlyWinners.find()
            .sort({ monthYear: -1 })
            .limit(1);

        const latestArticles = await Article.find({ status: 'published' })
            .sort({ createdAt: -1 })
            .limit(4);

        // Get attempted quiz IDs for this user
        const userId = auth.user.id;
        const userIdObj = new mongoose.Types.ObjectId(userId);
        const attemptedQuizIds = await QuizAttempt.find({ user: userId }).distinct('quiz');

        // Build match condition for unattempted quizzes at target level
        const matchCondition = {
            isActive: true,
            requiredLevel: targetLevel,
            _id: { $nin: attemptedQuizIds },
            $or: [
                { createdType: 'admin' },
                { createdType: { $exists: false } },
                { createdType: null },
                {
                    createdType: 'user',
                    status: 'approved',
                    createdBy: { $ne: userIdObj }
                }
            ]
        };

        // Build quizzesByLevel aggregation (matching what HomePage.jsx expects)
        const buildQuizzesByLevel = async (matchCond) => {
            return Quiz.aggregate([
                { $match: matchCond },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'categoryData'
                    }
                },
                {
                    $lookup: {
                        from: 'subcategories',
                        localField: 'subcategory',
                        foreignField: '_id',
                        as: 'subcategoryData'
                    }
                },
                {
                    $addFields: {
                        category: { $arrayElemAt: ['$categoryData', 0] },
                        subcategory: { $arrayElemAt: ['$subcategoryData', 0] },
                        randomOrder: { $rand: {} }
                    }
                },
                { $sort: { randomOrder: 1 } },
                {
                    $group: {
                        _id: '$requiredLevel',
                        level: { $first: '$requiredLevel' },
                        quizzes: {
                            $push: {
                                _id: '$_id',
                                title: '$title',
                                description: '$description',
                                category: '$category',
                                subcategory: '$subcategory',
                                difficulty: '$difficulty',
                                timeLimit: '$timeLimit',
                                totalMarks: '$totalMarks',
                                isRecommended: { $eq: ['$requiredLevel', targetLevel] }
                            }
                        },
                        quizCount: { $sum: 1 }
                    }
                },
                { $sort: { level: 1 } }
            ]);
        };

        // Primary query: unattempted quizzes
        let quizzesByLevel = await buildQuizzesByLevel(matchCondition);

        // Fallback: if no unattempted quizzes, show ALL quizzes at target level
        if (!quizzesByLevel || quizzesByLevel.length === 0) {
            const fallbackMatchCondition = {
                isActive: true,
                requiredLevel: targetLevel,
                $or: [
                    { createdType: 'admin' },
                    { createdType: { $exists: false } },
                    { createdType: null },
                    {
                        createdType: 'user',
                        status: 'approved',
                        createdBy: { $ne: userIdObj }
                    }
                ]
            };
            quizzesByLevel = await buildQuizzesByLevel(fallbackMatchCondition);
        }

        // Also build quizzesByCategory and quizzesBySubcategory for completeness
        const categoryMatchCondition = {
            isActive: true,
            requiredLevel: targetLevel,
            $or: [
                { createdType: 'admin' },
                { createdType: { $exists: false } },
                { createdType: null },
                {
                    createdType: 'user',
                    status: 'approved',
                    createdBy: { $ne: userIdObj }
                }
            ]
        };

        const quizzesByCategory = await Quiz.aggregate([
            { $match: categoryMatchCondition },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryData'
                }
            },
            {
                $addFields: {
                    category: { $arrayElemAt: ['$categoryData', 0] }
                }
            },
            {
                $group: {
                    _id: '$category._id',
                    category: { $first: '$category' },
                    quizzes: {
                        $push: {
                            _id: '$_id',
                            title: '$title',
                            difficulty: '$difficulty',
                            requiredLevel: '$requiredLevel',
                            timeLimit: '$timeLimit',
                            totalMarks: '$totalMarks'
                        }
                    },
                    quizCount: { $sum: 1 }
                }
            },
            { $sort: { 'category.name': 1 } }
        ]);

        const progress = type === 'daily' ? user.dailyProgress : 
                        (type === 'weekly' ? user.weeklyProgress : user.monthlyProgress);

        return NextResponse.json({
            success: true,
            data: {
                quizzesByLevel,
                quizzesByCategory,
                quizzesBySubcategory: [],
                categories,
                subcategories
            },
            userLevel: {
                currentLevel,
                nextLevel: targetLevel,
                levelName: competitionLevel.levelName,
                progress: progress?.levelProgress || 0,
                highScoreQuizzes: progress?.highScoreWins || 0,
                totalQuizzesPlayed: progress?.totalQuizAttempts || 0
            },
            levelAccess: {
                accessibleLevels: levelAccess.accessibleLevels,
                userPlan: levelAccess.userPlan
            },
            // Keep legacy fields for backward compatibility
            topPerformers,
            recentWinners: recentWinners[0] || null,
            latestArticles
        });

    } catch (error) {
        console.error('HomePage data fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
