export type SourceType = 'audio' | 'video' | 'pdf' | 'text' | 'youtube';

export interface KeyConcept {
  id: string;
  term: string;
  definition: string;
  importance: 'high' | 'medium' | 'low';
  category: string;
  example?: string;
}

export interface Formula {
  id: string;
  name: string;
  formula: string;
  description: string;
  variables: Array<{
    symbol: string;
    explanation: string;
  }>;
  units?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mastered?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
}

export interface ShortAnswerQuestion {
  id: string;
  question: string;
  sampleAnswer: string;
  keyPoints: string[];
  marks: number;
}

export interface LongAnswerQuestion {
  id: string;
  question: string;
  sampleAnswer: string;
  markingRubric: string[];
  marks: number;
}

export interface TranscriptItem {
  time: string;
  speaker?: string;
  text: string;
}

export interface Lecture {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  durationMinutes?: number;
  sourceType: SourceType;
  sourceFileName?: string;
  sourceFileSize?: number;
  youtubeUrl?: string;
  youtubeThumbnail?: string;
  youtubeAuthor?: string;
  status: 'processing' | 'ready' | 'error';
  summary: {
    tldr: string;
    keyTakeaways: string[];
    detailedSummary: string;
  };
  notes: string; // rich markdown
  keyConcepts: KeyConcept[];
  formulas: Formula[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  examQuestions: {
    shortAnswer: ShortAnswerQuestion[];
    longAnswer: LongAnswerQuestion[];
  };
  transcript: TranscriptItem[];
}

export interface UserSettings {
  geminiApiKey: string;
  geminiModel: string;
  theme: 'dark' | 'light';
  notesDetailLevel: 'concise' | 'standard' | 'comprehensive';
  targetAudience: 'university' | 'competitive_exam' | 'quick_review';
}
