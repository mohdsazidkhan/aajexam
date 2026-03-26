import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import Article from '@/models/Article';

export async function GET() {
    try {
        await dbConnect();

        const [quizzes, categories, subcategories, articles] = await Promise.all([
            Quiz.find({ status: 'approved' }).select('slug updatedAt'),
            Category.find({ status: 'approved' }).select('slug updatedAt'),
            Subcategory.find({ status: 'approved' }).select('slug updatedAt'),
            Article.find({ status: 'published' }).select('slug updatedAt')
        ]);

        return NextResponse.json({
            success: true,
            data: {
                quizzes: quizzes.map(q => ({ slug: q.slug, lastModified: q.updatedAt })),
                categories: categories.map(c => ({ slug: c.slug, lastModified: c.updatedAt })),
                subcategories: subcategories.map(s => ({ slug: s.slug, lastModified: s.updatedAt })),
                articles: articles.map(a => ({ slug: a.slug, lastModified: a.updatedAt }))
            }
        });
    } catch (error) {
        console.error('Sitemap data error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
