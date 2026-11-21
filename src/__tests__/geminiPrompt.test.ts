import { SYSTEM_PROMPT } from '@/lib/geminiPrompt';

describe('Gemini AI System Prompt Validation', () => {
  it('should define a comprehensive system prompt string', () => {
    expect(typeof SYSTEM_PROMPT).toBe('string');
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(500);
  });

  it('should instruct exhaustive university-grade study notes', () => {
    expect(SYSTEM_PROMPT).toContain('1,500+ words');
    expect(SYSTEM_PROMPT).toContain('mathematical derivations');
    expect(SYSTEM_PROMPT).toContain('Exam Tip:');
    expect(SYSTEM_PROMPT).toContain('Common Pitfall:');
  });

  it('should require valid JSON format matching schema', () => {
    expect(SYSTEM_PROMPT).toContain('Output MUST be strictly valid JSON');
    expect(SYSTEM_PROMPT).toContain('"summary"');
    expect(SYSTEM_PROMPT).toContain('"flashcards"');
    expect(SYSTEM_PROMPT).toContain('"quiz"');
    expect(SYSTEM_PROMPT).toContain('"examQuestions"');
  });
});
