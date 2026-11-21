import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeLectureData, extractYouTubeId } from '@/lib/youtube';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(ip, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait a moment before trying again.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const { url } = await req.json();
    if (!url || typeof url !== 'string' || url.length > 500) {
      return NextResponse.json({ success: false, error: 'Valid YouTube URL is required' }, { status: 400 });
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return NextResponse.json({ success: false, error: 'Invalid YouTube link format' }, { status: 400 });
    }

    const data = await getYouTubeLectureData(videoId);

    return NextResponse.json({
      success: true,
      data: {
        videoId: data.videoId,
        url: data.url,
        title: data.title,
        author: data.author,
        thumbnailUrl: data.thumbnailUrl,
        hasTranscript: data.hasTranscript,
        transcriptCount: data.transcriptItems.length,
        excerpt: data.transcriptText ? data.transcriptText.slice(0, 180) + '...' : '',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch YouTube lecture preview' },
      { status: 500 }
    );
  }
}
