import { YoutubeTranscript } from 'youtube-transcript';

export interface YouTubeVideoInfo {
  videoId: string;
  url: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  transcriptText: string;
  transcriptItems: Array<{ time: string; text: string }>;
  hasTranscript: boolean;
}

export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.trim().match(regExp);
  return match && match[1] ? match[1] : null;
}

export function formatOffsetToTime(offsetMs: number): string {
  const totalSeconds = Math.floor(offsetMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export async function fetchYouTubeMetadata(videoId: string): Promise<{
  title: string;
  author: string;
  thumbnailUrl: string;
}> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || '',
        author: data.author_name || '',
        thumbnailUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  } catch (err) {
    console.warn('Failed to fetch oEmbed metadata for YouTube video:', videoId, err);
  }

  return {
    title: '',
    author: '',
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}

export async function getYouTubeLectureData(urlOrId: string): Promise<YouTubeVideoInfo> {
  const videoId = extractYouTubeId(urlOrId) || urlOrId.trim();
  if (!videoId || videoId.length !== 11) {
    throw new Error('Invalid YouTube URL or Video ID. Please provide a valid YouTube video link.');
  }

  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const metadata = await fetchYouTubeMetadata(videoId);

  let transcriptItems: Array<{ time: string; text: string }> = [];
  let fullText = '';
  let hasTranscript = false;

  try {
    // Attempt fetching English transcript first, fallback to general
    let rawItems: any[] = [];
    try {
      rawItems = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
    } catch {
      rawItems = await YoutubeTranscript.fetchTranscript(videoId);
    }

    if (rawItems && rawItems.length > 0) {
      hasTranscript = true;
      transcriptItems = rawItems.map((item: any) => ({
        time: formatOffsetToTime(item.offset || 0),
        text: (item.text || '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      }));

      fullText = transcriptItems.map((item) => item.text).join(' ');
    }
  } catch (err: any) {
    console.warn('Could not fetch auto-captions for YouTube video:', videoId, err?.message);
    hasTranscript = false;
  }

  return {
    videoId,
    url: cleanUrl,
    title: metadata.title || `YouTube Lecture (${videoId})`,
    author: metadata.author || 'YouTube Educator',
    thumbnailUrl: metadata.thumbnailUrl,
    transcriptText: fullText,
    transcriptItems,
    hasTranscript,
  };
}
