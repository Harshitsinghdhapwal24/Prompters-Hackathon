import {
  getStoredLectures,
  saveLecture,
  updateLecture,
  deleteLecture,
  getStoredSettings,
  saveStoredSettings,
  DEFAULT_SETTINGS,
} from '@/lib/storage';
import { Lecture } from '@/types/lecture';

const mockLecture: Lecture = {
  id: 'test-lec-1',
  title: 'Test Lecture on Algorithms',
  subject: 'Computer Science',
  createdAt: new Date().toISOString(),
  durationMinutes: 45,
  sourceType: 'text',
  status: 'ready',
  summary: {
    tldr: 'Algorithm analysis overview.',
    keyTakeaways: ['O(N) runtime', 'Space complexity'],
    detailedSummary: 'Detailed overview of algorithms and runtime bounds.',
  },
  notes: '# Test Notes\n## 1. Overview\nAlgorithmic fundamentals.',
  keyConcepts: [
    {
      id: 'kc-1',
      term: 'Big-O',
      definition: 'Upper bound on asymptotic complexity.',
      importance: 'high',
      category: 'Theory',
    },
  ],
  formulas: [],
  flashcards: [
    {
      id: 'fc-1',
      front: 'What is O(1)?',
      back: 'Constant time complexity.',
      category: 'Complexity',
      difficulty: 'easy',
      mastered: false,
    },
  ],
  quiz: [
    {
      id: 'q-1',
      question: 'Which of the following is fastest?',
      options: ['O(1)', 'O(N)', 'O(N^2)', 'O(2^N)'],
      correctAnswerIndex: 0,
      explanation: 'Constant time executes independently of input size.',
      topic: 'Algorithms',
    },
  ],
  examQuestions: {
    shortAnswer: [],
    longAnswer: [],
  },
  transcript: [],
};

describe('Storage Management Utility', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize and return demo lectures when storage is empty', () => {
    const lectures = getStoredLectures();
    expect(Array.isArray(lectures)).toBe(true);
    expect(lectures.length).toBeGreaterThan(0);
  });

  it('should save a new lecture and place it at the front', () => {
    const updated = saveLecture(mockLecture);
    expect(updated[0].id).toBe('test-lec-1');
    expect(updated[0].title).toBe('Test Lecture on Algorithms');
  });

  it('should update an existing lecture', () => {
    saveLecture(mockLecture);
    const modified: Lecture = {
      ...mockLecture,
      title: 'Updated Algorithm Title',
    };
    const updated = updateLecture(modified);
    const target = updated.find((l) => l.id === 'test-lec-1');
    expect(target?.title).toBe('Updated Algorithm Title');
  });

  it('should delete a lecture by id', () => {
    saveLecture(mockLecture);
    const remaining = deleteLecture('test-lec-1');
    expect(remaining.some((l) => l.id === 'test-lec-1')).toBe(false);
  });

  it('should persist and retrieve user settings', () => {
    const initial = getStoredSettings();
    expect(initial).toEqual(DEFAULT_SETTINGS);

    const newSettings = saveStoredSettings({
      geminiModel: 'gemini-2.5-pro',
      theme: 'light',
    });

    expect(newSettings.geminiModel).toBe('gemini-2.5-pro');
    expect(newSettings.theme).toBe('light');

    const retrieved = getStoredSettings();
    expect(retrieved.geminiModel).toBe('gemini-2.5-pro');
    expect(retrieved.theme).toBe('light');
  });
});
