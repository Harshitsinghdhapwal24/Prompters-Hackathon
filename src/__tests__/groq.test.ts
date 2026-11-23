import { generateLectureWithGroq } from '@/lib/groq';

describe('Groq Fallback Generation Engine', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('throws an error if Groq API key is missing or blank', async () => {
    await expect(
      generateLectureWithGroq({
        apiKey: '',
        title: 'Deep Learning',
        subject: 'CS',
        sourceType: 'text',
      })
    ).rejects.toThrow('Groq API Key is required');
  });

  it('sends correct headers and JSON payload to Groq API endpoint', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: 'Deep Learning Lecture',
              subject: 'Computer Science',
              durationMinutes: 45,
              summary: {
                tldr: 'High yield summary from Groq',
                keyTakeaways: ['Point 1', 'Point 2'],
                detailedSummary: 'Detailed notes',
              },
              notes: '# Notes from LLaMA 3.3',
              keyConcepts: [],
              formulas: [],
              flashcards: [],
              quiz: [],
              examQuestions: { shortAnswer: [], longAnswer: [] },
              transcript: [],
            }),
          },
        },
      ],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    }) as jest.Mock;

    const result = await generateLectureWithGroq({
      apiKey: 'gsk_mock_api_key_123',
      model: 'llama-3.3-70b-versatile',
      title: 'Deep Learning Lecture',
      subject: 'Computer Science',
      sourceType: 'text',
      rawText: 'Neural networks are function approximators.',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer gsk_mock_api_key_123',
        }),
      })
    );

    expect(result.title).toBe('Deep Learning Lecture');
    expect(result.summary.tldr).toBe('High yield summary from Groq');
  });

  it('handles HTTP error responses from Groq gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: jest.fn().mockResolvedValue('Invalid API Key provided'),
    }) as jest.Mock;

    await expect(
      generateLectureWithGroq({
        apiKey: 'invalid_key',
        title: 'Quantum Physics',
        subject: 'Physics',
        sourceType: 'text',
      })
    ).rejects.toThrow('Groq API error (401)');
  });
});
