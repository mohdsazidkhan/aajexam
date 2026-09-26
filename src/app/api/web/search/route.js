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
import StudyNote from '@/models/StudyNote';
import ExamNews from '@/models/ExamNews';
import CurrentAffair from '@/models/CurrentAffair';
import { protect } from '@/middleware/auth';
import { escapeRegex } from '@/lib/utils/regex';

// Web-only search endpoint (tab-scoped, real pagination). The mobile app and
// the legacy combined endpoint keep using /api/search untouched.
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const PREVIEW_LIMIT = 6;
const MERGE_FETCH_CAP = 500;

function sortKeyOf(item) {
	if (item.createdAt) return new Date(item.createdAt).getTime();
	if (item.date) return new Date(item.date).getTime();
	if (item.publishedAt) return new Date(item.publishedAt).getTime();
	if (item._id && typeof item._id.getTimestamp === 'function') return item._id.getTimestamp().getTime();
	return Date.now();
}

async function mergeAndPaginate(sourceFetchers, skip, limit) {
	const cap = Math.min(skip + limit + 1, MERGE_FETCH_CAP);
	const results = await Promise.all(sourceFetchers.map((fn) => fn(cap)));
	const merged = results.flat();
	merged.sort((a, b) => sortKeyOf(b) - sortKeyOf(a));
	const hasMore = merged.length > skip + limit;
	return { items: merged.slice(skip, skip + limit), hasMore };
}

async function attachReelInteractions(reels, auth) {
	if (!auth.authenticated || reels.length === 0) return reels;
	const reelIds = reels.map((r) => r._id);
	const interactions = await ReelInteraction.find({
		userId: auth.user._id,
		reelId: { $in: reelIds },
	}).lean();
	const map = {};
	interactions.forEach((i) => { map[i.reelId.toString()] = i; });
	return reels.map((r) => ({ ...r, userInteraction: map[r._id.toString()] || null }));
}

async function fetchReels(regex, cleanQuery, skip, limit, auth) {
	const baseFilter = { status: 'published' };
	let filter = baseFilter;
	let total = 0;

	if (cleanQuery) {
		const tagFilter = { ...baseFilter, tags: { $elemMatch: { $regex: cleanQuery, $options: 'i' } } };
		filter = tagFilter;
		total = await Reel.countDocuments(tagFilter);

		if (total === 0) {
			filter = {
				...baseFilter,
				$or: [
					{ type: regex }, { title: regex }, { content: regex }, { caCategory: regex },
					{ keyTakeaway: regex }, { pollQuestion: regex }, { keyPoints: regex }, { steps: regex },
					{ tryYourself: regex }, { questionText: regex }, { explanation: regex }, { shortcutTrick: regex },
					{ formula: regex }, { subject: regex }, { topic: regex }, { examType: regex }, { difficulty: regex },
				],
			};
			total = await Reel.countDocuments(filter);
		}
	} else {
		total = await Reel.countDocuments(baseFilter);
	}

	const items = await Reel.find(filter)
		.sort({ publishedAt: -1 })
		.skip(skip)
		.limit(limit)
		.populate('createdBy', 'name username profilePicture')
		.lean();
	const withInteraction = await attachReelInteractions(items, auth);
	return { items: withInteraction.map((r) => ({ ...r, type: 'reel' })), hasMore: skip + items.length < total };
}

async function fetchSubjects(regex, skip, limit) {
	const filter = { isActive: true };
	if (regex) filter.$or = [{ name: regex }, { description: regex }];
	const [items, total] = await Promise.all([
		Subject.find(filter).populate('exams', 'name code').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		Subject.countDocuments(filter),
	]);
	return { items: items.map((s) => ({ ...s, type: 'subject' })), hasMore: skip + items.length < total };
}

async function fetchTopics(regex, skip, limit) {
	const filter = { isActive: true };
	if (regex) filter.$or = [{ name: regex }, { description: regex }];
	const [items, total] = await Promise.all([
		Topic.find(filter).populate('subject', 'name').populate('exams', 'name code').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		Topic.countDocuments(filter),
	]);
	return { items: items.map((t) => ({ ...t, type: 'topic' })), hasMore: skip + items.length < total };
}

async function fetchQuizzes(regex, skip, limit) {
	const filter = { status: 'published' };
	if (regex) filter.$or = [{ title: regex }, { description: regex }, { tags: regex }];
	const [items, total] = await Promise.all([
		Quiz.find(filter)
			.select('_id title slug description difficulty type duration totalMarks isFree totalAttempts avgScore tags publishedAt')
			.populate('applicableExams', 'name code')
			.populate('subject', 'name')
			.populate('topic', 'name')
			.sort({ publishedAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		Quiz.countDocuments(filter),
	]);
	return { items: items.map((q) => ({ ...q, type: 'quiz' })), hasMore: skip + items.length < total };
}

async function fetchPracticeTests(regex, skip, limit) {
	const filter = {};
	if (regex) {
		filter.$or = [
			{ title: regex },
			{ 'questions.questionText': regex },
			{ 'questions.explanation': regex },
			{ 'questions.section': regex },
			{ 'questions.difficulty': regex },
			{ 'questions.tags': regex },
		];
	}
	const [items, total] = await Promise.all([
		PracticeTest.find(filter)
			.select('_id title totalMarks duration isFree examPattern publishedAt')
			.populate({ path: 'examPattern', select: 'title exam', populate: { path: 'exam', select: 'name category', populate: { path: 'category', select: 'name type' } } })
			.sort({ publishedAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		PracticeTest.countDocuments(filter),
	]);
	return { items: items.map((t) => ({ ...t, type: 'test' })), hasMore: skip + items.length < total };
}

async function fetchBlogs(regex, skip, limit) {
	const filter = { status: 'published' };
	if (regex) {
		filter.$or = [
			{ title: regex }, { content: regex }, { excerpt: regex },
			{ featuredImageAlt: regex }, { metaTitle: regex }, { metaDescription: regex }, { tags: regex },
		];
	}
	const [items, total] = await Promise.all([
		Blog.find(filter)
			.select('_id title slug excerpt featuredImage tags views likes readingTime author authorName exam createdAt')
			.populate('exam', 'name')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		Blog.countDocuments(filter),
	]);
	return { items: items.map((b) => ({ ...b, type: 'blog' })), hasMore: skip + items.length < total };
}

async function fetchCurrentAffairs(regex, skip, limit) {
	const filter = { status: 'published' };
	if (regex) filter.$or = [{ title: regex }, { content: regex }, { keyPoints: regex }, { tags: regex }, { category: regex }];
	const [items, total] = await Promise.all([
		CurrentAffair.find(filter)
			.select('_id title category date views tags exam')
			.populate('exam', 'name code')
			.sort({ date: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		CurrentAffair.countDocuments(filter),
	]);
	return { items: items.map((c) => ({ ...c, type: 'currentAffair' })), hasMore: skip + items.length < total };
}

async function fetchNotes(regex, skip, limit) {
	const filter = { status: 'published' };
	if (regex) filter.$or = [{ title: regex }, { content: regex }, { tags: regex }];
	const [items, total] = await Promise.all([
		StudyNote.find(filter)
			.select('_id title slug noteType difficulty views bookmarks subject topic exam tags createdAt')
			.populate('subject', 'name')
			.populate('topic', 'name')
			.populate('exam', 'name code')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		StudyNote.countDocuments(filter),
	]);
	return { items: items.map((n) => ({ ...n, type: 'note' })), hasMore: skip + items.length < total };
}

async function fetchExamNews(regex, skip, limit) {
	const filter = { status: 'published' };
	if (regex) filter.$or = [{ title: regex }, { content: regex }, { examName: regex }, { tags: regex }];
	const [items, total] = await Promise.all([
		ExamNews.find(filter)
			.select('_id title type examName exam isPinned views tags createdAt')
			.populate('exam', 'name code')
			.sort({ isPinned: -1, createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		ExamNews.countDocuments(filter),
	]);
	return { items: items.map((e) => ({ ...e, type: 'examNews' })), hasMore: skip + items.length < total };
}

async function fetchUsers(regex, skip, limit) {
	const filter = regex ? { $or: [{ username: regex }, { name: regex }, { email: regex }] } : {};
	const [items, total] = await Promise.all([
		User.find(filter)
			.select('_id name username email profilePicture level followersCount createdAt')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		User.countDocuments(filter),
	]);
	return { items: items.map((u) => ({ ...u, type: 'user' })), hasMore: skip + items.length < total };
}

async function fetchHashtags(cleanQuery, skip, limit) {
	const cap = skip + limit + 1;
	const pipeline = [
		{ $match: cleanQuery ? { isActive: true, tags: { $elemMatch: { $regex: cleanQuery, $options: 'i' } } } : { isActive: true } },
		{ $unwind: '$tags' },
		...(cleanQuery ? [{ $match: { tags: { $regex: cleanQuery, $options: 'i' } } }] : []),
		{ $group: { _id: '$tags', count: { $sum: 1 } } },
		{ $sort: { count: -1 } },
		{ $limit: cap },
		{ $project: { _id: 0, tag: '$_id', count: 1 } },
	];
	const all = await Question.aggregate(pipeline);
	const items = all.slice(skip, skip + limit);
	return { items: items.map((h) => ({ ...h, type: 'hashtag' })), hasMore: all.length > skip + limit };
}

function examMergeSources(regex) {
	const examCategoryFilter = regex ? { $or: [{ name: regex }, { type: regex }, { description: regex }] } : {};
	const examFilter = { isActive: true, ...(regex ? { $or: [{ name: regex }, { code: regex }, { description: regex }] } : {}) };
	const patternFilter = regex ? { $or: [{ title: regex }, { 'sections.name': regex }] } : {};
	return [
		async (cap) => (await Exam.find(examFilter).populate('category', 'name type').limit(cap).lean()).map((e) => ({ ...e, type: 'exam' })),
		async (cap) => (await ExamCategory.find(examCategoryFilter).limit(cap).lean()).map((c) => ({ ...c, type: 'examCategory' })),
		async (cap) => (await ExamPattern.find(patternFilter).populate('exam', 'name').limit(cap).lean()).map((p) => ({ ...p, type: 'pattern' })),
	];
}

export async function GET(req) {
	try {
		await dbConnect();

		const { searchParams } = new URL(req.url);
		const rawQuery = (searchParams.get('query') || '').trim();
		const type = searchParams.get('type') || 'all';
		const page = Math.max(parseInt(searchParams.get('page')) || 1, 1);
		const limit = Math.max(parseInt(searchParams.get('limit')) || DEFAULT_LIMIT, 1);
		const skip = (page - 1) * limit;

		const cleanQuery = escapeRegex(rawQuery.replace(/^#/, '').trim().slice(0, 100));
		const regex = cleanQuery ? new RegExp(cleanQuery, 'i') : null;
		const auth = await protect(req);

		if (type === 'all') {
			const [reel, exam, test, quiz, subject, topic, blog, currentAffair, note, examNews, user, hashtag] = await Promise.all([
				fetchReels(regex, cleanQuery, 0, PREVIEW_LIMIT, auth),
				mergeAndPaginate(examMergeSources(regex), 0, PREVIEW_LIMIT),
				fetchPracticeTests(regex, 0, PREVIEW_LIMIT),
				fetchQuizzes(regex, 0, PREVIEW_LIMIT),
				fetchSubjects(regex, 0, PREVIEW_LIMIT),
				fetchTopics(regex, 0, PREVIEW_LIMIT),
				fetchBlogs(regex, 0, PREVIEW_LIMIT),
				fetchCurrentAffairs(regex, 0, PREVIEW_LIMIT),
				fetchNotes(regex, 0, PREVIEW_LIMIT),
				fetchExamNews(regex, 0, PREVIEW_LIMIT),
				fetchUsers(regex, 0, PREVIEW_LIMIT),
				fetchHashtags(cleanQuery, 0, PREVIEW_LIMIT),
			]);

			return NextResponse.json({
				success: true,
				type: 'all',
				sections: { reel, exam, test, quiz, subject, topic, blog, currentAffair, note, examNews, user, hashtag },
			});
		}

		let result;
		switch (type) {
			case 'exam': result = await mergeAndPaginate(examMergeSources(regex), skip, limit); break;
			case 'reel': result = await fetchReels(regex, cleanQuery, skip, limit, auth); break;
			case 'subject': result = await fetchSubjects(regex, skip, limit); break;
			case 'topic': result = await fetchTopics(regex, skip, limit); break;
			case 'quiz': result = await fetchQuizzes(regex, skip, limit); break;
			case 'test': result = await fetchPracticeTests(regex, skip, limit); break;
			case 'blog': result = await fetchBlogs(regex, skip, limit); break;
			case 'currentAffair': result = await fetchCurrentAffairs(regex, skip, limit); break;
			case 'note': result = await fetchNotes(regex, skip, limit); break;
			case 'examNews': result = await fetchExamNews(regex, skip, limit); break;
			case 'user': result = await fetchUsers(regex, skip, limit); break;
			case 'hashtag': result = await fetchHashtags(cleanQuery, skip, limit); break;
			default:
				return NextResponse.json({ success: false, error: `Unknown type: ${type}` }, { status: 400 });
		}

		return NextResponse.json({ success: true, type, page, limit, hasMore: result.hasMore, items: result.items });
	} catch (error) {
		console.error('Web search error:', error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
