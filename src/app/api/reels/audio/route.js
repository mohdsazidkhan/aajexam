import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
	try {
		const audioDir = path.join(process.cwd(), 'public', 'reel_audio');
		const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.ogg'));

		const audioList = files.map(file => {
			// Generate a readable label from filename
			const name = file.replace(/\.(mp3|wav|ogg)$/, '');
			const parts = name.split('-');
			// First part is usually the artist/source
			const artist = parts[0] ? parts[0].replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^\w/, c => c.toUpperCase()) : 'Unknown';
			// Rest is the track name
			const label = parts.slice(0, -1).join(' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, c => c.toUpperCase()) || name;

			return { value: file, label, artist };
		});

		return NextResponse.json({ success: true, data: audioList });
	} catch (error) {
		console.error('Audio list error:', error);
		return NextResponse.json({ success: true, data: [] });
	}
}
