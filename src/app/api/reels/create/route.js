import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Reel from '@/models/Reel';
import { protect } from '@/middleware/auth';

export async function POST(req) {
	try {
		await dbConnect();
		const auth = await protect(req);
		if (!auth.authenticated) {
			return NextResponse.json({ success: false, message: 'Login required' }, { status: 401 });
		}

		const body = await req.json();
		const { type, title, content, questionText, options, correctAnswerIndex, explanation,
			shortcutTrick, keyPoints, highlightText, steps, tryYourself, formula,
			caDate, caCategory, tableData, keyTakeaway, pollQuestion, pollOptions,
			subject, topic, examType, difficulty, tags, backgroundColor } = body;

		if (!type) {
			return NextResponse.json({ success: false, message: 'Card type is required' }, { status: 400 });
		}

		// Validate based on type
		if (type === 'question') {
			if (!questionText || !options || options.length !== 4 || correctAnswerIndex === undefined) {
				return NextResponse.json({ success: false, message: 'Question requires questionText, 4 options, and correctAnswerIndex' }, { status: 400 });
			}
		}
		if (type === 'poll') {
			if (!pollQuestion || !pollOptions || pollOptions.length < 2) {
				return NextResponse.json({ success: false, message: 'Poll requires pollQuestion and at least 2 pollOptions' }, { status: 400 });
			}
		}
		if (type === 'current_affairs') {
			if (!title && !content) {
				return NextResponse.json({ success: false, message: 'Current affairs requires title or content' }, { status: 400 });
			}
		}

		const isAdmin = auth.user.role === 'admin';

		const reel = await Reel.create({
			type,
			title: title?.trim() || '',
			content: content?.trim() || '',
			backgroundColor: backgroundColor || '',
			questionText: questionText?.trim(),
			options: options?.map(o => o.trim()),
			correctAnswerIndex,
			explanation: explanation?.trim() || '',
			shortcutTrick: shortcutTrick?.trim() || '',
			keyPoints: keyPoints || [],
			highlightText: highlightText?.trim() || '',
			steps: steps || [],
			tryYourself: tryYourself || [],
			formula: formula?.trim() || '',
			caDate: caDate || null,
			caCategory: caCategory?.trim() || '',
			tableData: tableData || [],
			keyTakeaway: keyTakeaway?.trim() || '',
			pollQuestion: pollQuestion?.trim(),
			pollOptions: pollOptions?.map(o => ({ text: o.text?.trim(), votes: 0 })) || [],
			subject: subject?.trim() || 'General',
			topic: topic?.trim() || '',
			examType: examType?.trim() || 'General',
			difficulty: difficulty || 'medium',
			tags: tags?.map(t => t.toLowerCase().trim()) || [],
			createdBy: auth.user._id,
			creatorRole: isAdmin ? 'admin' : 'user',
			status: isAdmin ? 'published' : 'pending'
		});

		return NextResponse.json({
			success: true,
			data: reel,
			message: isAdmin ? 'Reel published successfully' : 'Reel submitted for approval'
		}, { status: 201 });
	} catch (error) {
		console.error('Create reel error:', error);
		return NextResponse.json({ success: false, message: error.message }, { status: 500 });
	}
}
