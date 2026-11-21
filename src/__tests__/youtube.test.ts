import { extractYouTubeId, parseSecondsToTimestamp } from '@/lib/youtube';

describe('YouTube Utility Functions', () => {
  describe('extractYouTubeId', () => {
    it('should extract video ID from standard watch URL', () => {
      const url = 'https://www.youtube.com/watch?v=aircAruvnKk';
      expect(extractYouTubeId(url)).toBe('aircAruvnKk');
    });

    it('should extract video ID from short URL (youtu.be)', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      expect(extractYouTubeId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from embed URL', () => {
      const url = 'https://www.youtube.com/embed/aircAruvnKk';
      expect(extractYouTubeId(url)).toBe('aircAruvnKk');
    });

    it('should extract video ID from shorts URL', () => {
      const url = 'https://www.youtube.com/shorts/aircAruvnKk';
      expect(extractYouTubeId(url)).toBe('aircAruvnKk');
    });

    it('should extract video ID with additional query parameters', () => {
      const url = 'https://www.youtube.com/watch?v=aircAruvnKk&t=120s&feature=shared';
      expect(extractYouTubeId(url)).toBe('aircAruvnKk');
    });

    it('should return null for non-YouTube URLs', () => {
      expect(extractYouTubeId('https://example.com/video/123')).toBeNull();
      expect(extractYouTubeId('')).toBeNull();
      expect(extractYouTubeId('invalid-string')).toBeNull();
    });
  });

  describe('parseSecondsToTimestamp', () => {
    it('should format seconds to MM:SS', () => {
      expect(parseSecondsToTimestamp(45)).toBe('00:45');
      expect(parseSecondsToTimestamp(125)).toBe('02:05');
    });

    it('should format hours correctly to HH:MM:SS', () => {
      expect(parseSecondsToTimestamp(3665)).toBe('01:01:05');
      expect(parseSecondsToTimestamp(7200)).toBe('02:00:00');
    });

    it('should handle zero seconds', () => {
      expect(parseSecondsToTimestamp(0)).toBe('00:00');
    });
  });
});
