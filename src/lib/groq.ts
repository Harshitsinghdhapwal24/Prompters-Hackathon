import { SYSTEM_PROMPT } from '@/lib/geminiPrompt';

export interface GroqGenerateOptions {
  apiKey: string;
  model?: string;
  title: string;
  subject: string;
  sourceType: string;
  rawText?: string;
  youtubeUrl?: string;
  youtubeAuthor?: string;
}

/**
 * Executes high-speed lecture synthesis using the Groq LLaMA-3.3 inference engine.
 * Serves as an ultra-fast, zero-latency fallback when Google Gemini is rate-limited or unavailable.
 *
 * @param options - Generation options including credentials, modality, and lecture text.
 * @returns Parsed structured study package matching the Lecture schema.
 */
export async function generateLectureWithGroq(options: GroqGenerateOptions): Promise<any> {
  const {
    apiKey,
    model = 'llama-3.3-70b-versatile',
    title,
    subject,
    sourceType,
    rawText = '',
    youtubeUrl,
    youtubeAuthor,
  } = options;

  if (!apiKey || !apiKey.trim()) {
    throw new Error('Groq API Key is required.');
  }

  const promptContent = `Generate a full academic study package for this lecture.
Lecture Title: "${title}"
Subject / Discipline: "${subject}"
Source Modality: ${sourceType}
${youtubeUrl ? `YouTube Video URL: ${youtubeUrl} (Channel/Instructor: ${youtubeAuthor || 'Instructor'})` : ''}
${rawText ? `Lecture Transcript / Content Notes:\n"""\n${rawText.slice(0, 35000)}\n"""` : 'Please synthesize the lecture topic comprehensively based on title and subject.'}

Follow all instructions in the system prompt. Return purely valid JSON according to the schema without markdown code fences.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: model || 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: promptContent,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const choiceContent = data.choices?.[0]?.message?.content;
  if (!choiceContent) {
    throw new Error('No content received from Groq inference.');
  }

  try {
    return JSON.parse(choiceContent);
  } catch (err) {
    const sanitized = choiceContent
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(sanitized);
  }
}
