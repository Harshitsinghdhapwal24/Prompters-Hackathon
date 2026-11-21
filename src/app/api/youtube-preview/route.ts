import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeLectureData, extractYouTubeId } from '@/lib/youtube';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ success: false, error: 'YouTube URL is required' }, { status: 400 });
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
