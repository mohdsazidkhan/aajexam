import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import ExamCategory from '@/models/ExamCategory';
import Exam from '@/models/Exam';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';
import Blog from '@/models/Blog';
import Reel from '@/models/Reel';
import ReelInteraction from '@/models/ReelInteraction';
import Quiz from '@/models/Quiz';
import Subject from '@/models/Subject';
import Topic from '@/models/Topic';
import Question from '@/models/Question';
import { protect } from '@/middleware/auth';
export const dynamic = 'force-dynamic';

export async function GET(req) {
	try {
		await dbConnect();

		const { searchParams } = new URL(req.url);
		const rawQuery = (searchParams.get('query') || '').trim();
		const page = parseInt(searchParams.get('page')) || 1;
		const limit = parseInt(searchParams.get('limit')) || 12;
		const skip = (page - 1) * limit;

		if (!rawQuery) {
			return NextResponse.json({
				success: true, page, limit,
				users: [], govtExamCategories: [], govtExams: [],
				examPatterns: [], practiceTests: [], blogs: [], reels: [], quizzes: [],
				subjects: [], topics: [], hashtags: [],
			});
		}

		// Strip # prefix for clean search
		const cleanQuery = rawQuery.replace(/^#/, '').trim();
		const regex = new RegExp(cleanQuery, 'i');

		// ── Run all searches in parallel ──
		const [
			users,
			govtExamCategories,
			govtExams,
			examPatterns,
			practiceTests,
			blogs,
			reelResults,
			quizResults,
			subjectResults,
			topicResults,
			hashtagResults,
		] = await Promise.all([

			// ── Users: username, name, email ──
			User.find({
				$or: [
					{ username: regex },
					{ name: regex },
					{ email: regex },
				]
			})
				.select('_id name username email profilePicture level followersCount')
				.limit(limit)
				.lean(),

			// ── ExamCategories: name, type, description ──
			ExamCategory.find({
				$or: [
					{ name: regex },
					{ type: regex },
					{ description: regex },
				]
			})
				.limit(limit)
				.lean(),

			// ── Exams: name, code, description ──
			Exam.find({
				isActive: true,
				$or: [
					{ name: regex },
					{ code: regex },
					{ description: regex },
				]
			})
				.populate('category', 'name type')
				.limit(limit)
				.lean(),

			// ── ExamPatterns: title, sections[].name ──
			ExamPattern.find({
				$or: [
					{ title: regex },
					{ 'sections.name': regex },
				]
			})
				.populate('exam', 'name')
				.limit(limit)
				.lean(),

			// ── PracticeTests: title, questions.questionText, questions.explanation,
			//    questions.section, questions.difficulty, questions.tags[] ──
			PracticeTest.find({
				$or: [
					{ title: regex },
					{ 'questions.questionText': regex },
					{ 'questions.explanation': regex },
					{ 'questions.section': regex },
					{ 'questions.difficulty': regex },
					{ 'questions.tags': regex },
				]
			})
				.select('_id title totalMarks duration isFree examPattern publishedAt')
				.populate({ path: 'examPattern', select: 'title exam', populate: { path: 'exam', select: 'name category', populate: { path: 'category', select: 'name type' } } })
				.limit(limit)
				.lean(),

			// ── Blogs: title, content, excerpt, featuredImageAlt, metaTitle,
			//    metaDescription, tags[] ──
			Blog.find({
				status: 'published',
				$or: [
					{ title: regex },
					{ content: regex },
					{ excerpt: regex },
					{ featuredImageAlt: regex },
					{ metaTitle: regex },
					{ metaDescription: regex },
					{ tags: regex },
				]
			})
				.select('_id title slug excerpt featuredImage tags views likes readingTime author authorName exam createdAt')
				.populate('exam', 'name')
				.limit(limit)
				.lean(),

			// ── Reels: tags first, then full-text fallback ──
			(async () => {
				const baseFilter = { status: 'published' };

				// Step 1: Search tags first
				const tagFilter = {
					...baseFilter,
					tags: { $elemMatch: { $regex: cleanQuery, $options: 'i' } }
				};
				let reels = await Reel.find(tagFilter)
					.sort({ publishedAt: -1 })
					.limit(limit)
					.populate('createdBy', 'name username profilePicture')
					.lean();

				// Step 2: If no tag results, search all content fields
				if (reels.length === 0) {
					const fullFilter = {
						...baseFilter,
						$or: [
							{ type: regex },
							{ title: regex },
							{ content: regex },
							{ caCategory: regex },
							{ keyTakeaway: regex },
							{ pollQuestion: regex },
							{ keyPoints: regex },
							{ steps: regex },
							{ tryYourself: regex },
							{ questionText: regex },
							{ explanation: regex },
							{ shortcutTrick: regex },
							{ formula: regex },
							{ subject: regex },
							{ topic: regex },
							{ examType: regex },
							{ difficulty: regex },
						]
					};
					reels = await Reel.find(fullFilter)
						.sort({ publishedAt: -1 })
						.limit(limit)
						.populate('createdBy', 'name username profilePicture')
						.lean();
				}

				return reels;
			})(),

			// ── Quizzes: title, description, tags ──
			Quiz.find({
				status: 'published',
				$or: [
					{ title: regex },
					{ description: regex },
					{ tags: regex },
				]
			})
				.select('_id title description difficulty type duration totalMarks isFree totalAttempts avgScore tags publishedAt')
				.populate('applicableExams', 'name code')
				.populate('subject', 'name')
				.populate('topic', 'name')
				.sort({ publishedAt: -1 })
				.limit(limit)
				.lean(),

			// ── Subjects: name, description ──
			Subject.find({
				isActive: true,
				$or: [
					{ name: regex },
					{ description: regex },
				]
			})
				.sort({ order: 1, name: 1 })
				.limit(limit)
				.lean(),

			// ── Topics: name, description ──
			Topic.find({
				isActive: true,
				$or: [
					{ name: regex },
					{ description: regex },
				]
			})
				.populate('subject', 'name')
				.sort({ order: 1, name: 1 })
				.limit(limit)
				.lean(),

			// ── Hashtags: unique tags from Questions matching search ──
			Question.aggregate([
				{ $match: { isActive: true, tags: { $elemMatch: { $regex: cleanQuery, $options: 'i' } } } },
				{ $unwind: '$tags' },
				{ $match: { tags: { $regex: cleanQuery, $options: 'i' } } },
				{ $group: { _id: '$tags', count: { $sum: 1 } } },
				{ $sort: { count: -1 } },
				{ $limit: limit },
				{ $project: { _id: 0, tag: '$_id', count: 1 } }
			]),
		]);

		// ── Attach reel interactions if user is logged in ──
		let reelsWithInteraction = reelResults;
		const auth = await protect(req);
		if (auth.authenticated && reelResults.length > 0) {
			const reelIds = reelResults.map(r => r._id);
			const interactions = await ReelInteraction.find({
				userId: auth.user._id,
				reelId: { $in: reelIds }
			}).lean();
			const interactionMap = {};
			interactions.forEach(i => { interactionMap[i.reelId.toString()] = i; });
			reelsWithInteraction = reelResults.map(r => ({
				...r,
				userInteraction: interactionMap[r._id.toString()] || null
			}));
		}

		return NextResponse.json({
			success: true,
			page, limit,
			users: users.map(u => ({ ...u, type: 'user' })),
			govtExamCategories: govtExamCategories.map(c => ({ ...c, type: 'examCategory' })),
			govtExams: govtExams.map(e => ({ ...e, type: 'exam' })),
			examPatterns: examPatterns.map(p => ({ ...p, type: 'pattern' })),
			practiceTests: practiceTests.map(t => ({ ...t, type: 'test' })),
			blogs: blogs.map(b => ({ ...b, type: 'blog' })),
			reels: reelsWithInteraction.map(r => ({ ...r, type: 'reel' })),
			quizzes: quizResults.map(q => ({ ...q, type: 'quiz' })),
			subjects: subjectResults.map(s => ({ ...s, type: 'subject' })),
			topics: topicResults.map(t => ({ ...t, type: 'topic' })),
			hashtags: hashtagResults.map(h => ({ ...h, type: 'hashtag' })),
		});
	} catch (error) {
		console.error('Global search error:', error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
