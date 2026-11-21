import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from '@/lib/geminiPrompt';
import { Lecture, SourceType } from '@/types/lecture';

export const maxDuration = 120; // Allow sufficient time for multimodal AI generation

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let title = '';
    let subject = '';
    let rawText = '';
    let sourceType: SourceType = 'text';
    let fileName = '';
    let fileSize = 0;
    let fileBuffer: Buffer | null = null;
    let mimeType = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      title = (formData.get('title') as string) || '';
      subject = (formData.get('subject') as string) || '';
      rawText = (formData.get('text') as string) || '';
      sourceType = ((formData.get('sourceType') as string) as SourceType) || 'text';

      const file = formData.get('file') as File | null;
      if (file && file.size > 0) {
        fileName = file.name;
        fileSize = file.size;
        mimeType = file.type || 'application/octet-stream';
        const arrayBuf = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuf);

        // infer source type if not explicitly set
        if (mimeType.startsWith('audio/') || fileName.match(/\.(mp3|wav|m4a|aac)$/i)) {
          sourceType = 'audio';
          if (!mimeType.startsWith('audio/')) mimeType = 'audio/mp3';
        } else if (mimeType.startsWith('video/') || fileName.match(/\.(mp4|webm|mov)$/i)) {
          sourceType = 'video';
          if (!mimeType.startsWith('video/')) mimeType = 'video/mp4';
        } else if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
          sourceType = 'pdf';
          mimeType = 'application/pdf';
        } else if (fileName.match(/\.(txt|md)$/i) || mimeType.startsWith('text/')) {
          sourceType = 'text';
          rawText = fileBuffer.toString('utf-8');
          fileBuffer = null;
        }
      }
    } else {
      const json = await req.json();
      title = json.title || '';
      subject = json.subject || '';
      rawText = json.text || '';
      sourceType = json.sourceType || 'text';
      fileName = json.fileName || '';
      fileSize = json.fileSize || 0;
    }

    if (!title && fileName) {
      title = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    } else if (!title) {
      title = 'Lecture Session — ' + new Date().toLocaleDateString();
    }

    if (!subject) {
      subject = 'General Studies';
    }

    // Determine API Key and Model
    const headerApiKey = req.headers.get('x-gemini-api-key');
    const headerModel = req.headers.get('x-gemini-model');
    const apiKey = (headerApiKey && headerApiKey.trim()) || process.env.GEMINI_API_KEY || '';
    const modelName = (headerModel && headerModel.trim()) || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // If Gemini API Key is provided, use official @google/genai SDK
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const parts: any[] = [];

        // Add file part if available
        if (fileBuffer) {
          const base64Data = fileBuffer.toString('base64');
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType || 'application/octet-stream',
            },
          });
        }

        const userPrompt = `Generate a full academic study package for this lecture.
Lecture Title: "${title}"
Subject / Discipline: "${subject}"
Source Modality: ${sourceType}
${rawText ? `Lecture Transcript / Content Notes:\n"""\n${rawText}\n"""` : 'Please process the attached media file completely.'}

Follow all instructions in the system prompt. Return purely valid JSON according to the schema.`;

        parts.push({ text: userPrompt });

        const response = await ai.models.generateContent({
          model: modelName,
          contents: parts,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
          },
        });

        const responseText = response.text || '';
        let parsedData: any = null;

        try {
          parsedData = JSON.parse(responseText);
        } catch (e) {
          // If JSON had backticks or wrappers, clean it
          const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
          parsedData = JSON.parse(cleaned);
        }

        const lectureId = 'lec-' + Date.now();
        const lecture: Lecture = {
          id: lectureId,
          title: parsedData.title || title,
          subject: parsedData.subject || subject,
          createdAt: new Date().toISOString(),
          durationMinutes: parsedData.durationMinutes || 45,
          sourceType,
          sourceFileName: fileName || undefined,
          sourceFileSize: fileSize || undefined,
          status: 'ready',
          summary: parsedData.summary || {
            tldr: 'Study material synthesized from input lecture content.',
            keyTakeaways: ['Primary concepts summarized.', 'Core principles extracted.'],
            detailedSummary: 'Full notes available in structured sections.',
          },
          notes: parsedData.notes || '# Study Notes\nContent processed from source.',
          keyConcepts: (parsedData.keyConcepts || []).map((kc: any, i: number) => ({
            id: kc.id || `kc-${i + 1}`,
            term: kc.term || 'Key Concept',
            definition: kc.definition || '',
            importance: kc.importance || 'high',
            category: kc.category || subject,
            example: kc.example || undefined,
          })),
          formulas: (parsedData.formulas || []).map((f: any, i: number) => ({
            id: f.id || `f-${i + 1}`,
            name: f.name || 'Formula',
            formula: f.formula || '',
            description: f.description || '',
            variables: f.variables || [],
            units: f.units || undefined,
          })),
          flashcards: (parsedData.flashcards || []).map((fc: any, i: number) => ({
            id: fc.id || `fc-${i + 1}`,
            front: fc.front || 'Question',
            back: fc.back || 'Answer',
            category: fc.category || subject,
            difficulty: fc.difficulty || 'medium',
            mastered: false,
          })),
          quiz: (parsedData.quiz || []).map((q: any, i: number) => ({
            id: q.id || `q-${i + 1}`,
            question: q.question || '',
            options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
            explanation: q.explanation || '',
            topic: q.topic || subject,
          })),
          examQuestions: {
            shortAnswer: (parsedData.examQuestions?.shortAnswer || []).map((sa: any, i: number) => ({
              id: sa.id || `sa-${i + 1}`,
              question: sa.question || '',
              sampleAnswer: sa.sampleAnswer || '',
              keyPoints: sa.keyPoints || [],
              marks: sa.marks || 4,
            })),
            longAnswer: (parsedData.examQuestions?.longAnswer || []).map((la: any, i: number) => ({
              id: la.id || `la-${i + 1}`,
              question: la.question || '',
              sampleAnswer: la.sampleAnswer || '',
              markingRubric: la.markingRubric || [],
              marks: la.marks || 10,
            })),
          },
          transcript: Array.isArray(parsedData.transcript)
            ? parsedData.transcript
            : [
                {
                  time: '00:00:00',
                  speaker: 'Instructor',
                  text: rawText || `Lecture content from ${fileName || title}`,
                },
              ],
        };

        return NextResponse.json({ success: true, lecture, isLiveGemini: true });
      } catch (geminiError: any) {
        console.error('Gemini API execution error:', geminiError);
        // If Gemini API fails (e.g. invalid key, quota, or network block), return graceful fallback or error
        return NextResponse.json(
          {
            success: false,
            error: geminiError?.message || 'Error processing lecture with Gemini API.',
            canFallback: true,
          },
          { status: 400 }
        );
      }
    }

    // Fallback / Demonstration Mode (When no API key is set yet)
    // Generates a rich, realistic academic study pack based on the user's title, subject, and text
    const sampleLecture = generateRealisticFallbackLecture({
      title,
      subject,
      rawText,
      sourceType,
      fileName,
      fileSize,
    });

    return NextResponse.json({
      success: true,
      lecture: sampleLecture,
      isDemoMode: true,
      notice: 'Generated in Demonstration Mode. Add your Gemini API Key in Settings to enable direct cloud processing.',
    });
  } catch (err: any) {
    console.error('Server error handling lecture generation:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateRealisticFallbackLecture(params: {
  title: string;
  subject: string;
  rawText: string;
  sourceType: SourceType;
  fileName: string;
  fileSize: number;
}): Lecture {
  const { title, subject, rawText, sourceType, fileName, fileSize } = params;
  const lectureId = 'lec-' + Date.now();

  const sampleExcerpt = rawText ? rawText.slice(0, 300) : 'Classroom lecture audio and conceptual breakdown.';

  return {
    id: lectureId,
    title: title || 'University Lecture on ' + subject,
    subject: subject || 'Science & Technology',
    createdAt: new Date().toISOString(),
    durationMinutes: 45,
    sourceType,
    sourceFileName: fileName || undefined,
    sourceFileSize: fileSize || undefined,
    status: 'ready',
    summary: {
      tldr: `Comprehensive analysis of core principles covered in "${title}". Highlights fundamental theorems, empirical applications, and essential exam takeaways.`,
      keyTakeaways: [
        `Fundamental definitions and core theoretical mechanisms established for ${title}.`,
        'Critical examination of foundational equations and governing constraints.',
        'Methodological framework for solving standard midterm and final exam problems.',
        'Common cognitive pitfalls and exam traps identified during classroom discussion.',
        'Practical real-world implications and experimental paradigms.'
      ],
      detailedSummary: `This lecture provides a structured exploration of ${title}. 
      
The session begins by framing the historical and theoretical context, tracing foundational developments and identifying the operational bottlenecks addressed by modern paradigms.

Key concepts are introduced systematically, pairing formal definitions with intuitive mechanical analogies. Special attention is directed toward mathematical formulation, derivation techniques, and boundary conditions that professors frequently test on examinations.

The lecture concludes with a review of upcoming topics, prerequisite competencies, and recommended problem sets.`
    },
    notes: `# ${title} — Comprehensive Study Notes

## 1. Executive Overview & Core Problem Statement
The lecture establishes the governing principles of **${subject}**, addressing the core problem:
- **Primary Objective:** Rigorously understand and model the dynamics of ${title}.
- **Underlying Challenge:** Balancing theoretical abstraction with measurable empirical constraints.
- **Key Breakthrough:** Formulating invariant relationships that simplify multi-variable analysis.

> **Exam Tip:** Whenever deriving these principles, always state boundary conditions and conservation laws before applying algebraic transformations.

---

## 2. Theoretical Framework & Mechanics
- **First Principles:** Every system under consideration must satisfy basic equilibrium or conservation criteria.
- **State Variables:** Tracking transitions between states requires isolating independent versus dependent parameters.
- **Dynamic Response:** How the system adapts under exogenous shocks or parameter variations.

### Key Observation:
\`\`\`
[Input Stimulus / Data] ──▶ [Transformation Function f(x)] ──▶ [Equilibrium Output Y]
\`\`\`

---

## 3. Mathematical Formalism
Consider the standard governing equation:
$$S(t) = \\alpha \\cdot e^{-\\lambda t} + \\int_0^t K(t - \\tau) u(\\tau) d\\tau$$

Where:
- $\\alpha$ represents initial baseline equilibrium amplitude.
- $\\lambda$ denotes the rate of decay or relaxation time constant.
- $K(t - \\tau)$ is the kernel function weighting historical state influence.

---

## 4. High-Yield Exam Strategies
1. **Never skip unit analysis:** Dimensional consistency catches over 60% of algebraic errors on midterms.
2. **Watch for edge cases:** Evaluate behavior as $t \\to 0$ and $t \\to \\infty$.
3. **Connect theory to intuition:** Always explain the physical or economic meaning behind mathematical symbols.
`,
    keyConcepts: [
      {
        id: 'kc-f-1',
        term: `${title} Primary Principle`,
        definition: `The central governing theorem that dictates how states evolve and interact within ${subject}.`,
        importance: 'high',
        category: 'Theory',
        example: 'Canonical textbook model used across engineering and physical sciences.'
      },
      {
        id: 'kc-f-2',
        term: 'Equilibrium State Criterion',
        definition: 'The balance condition wherein internal forces or rates of change sum to zero.',
        importance: 'high',
        category: 'Foundations',
        example: 'Steady-state conditions where dS/dt = 0.'
      },
      {
        id: 'kc-f-3',
        term: 'Relaxation Time Constant (τ)',
        definition: 'The temporal measure required for a perturbed system to return to 1/e of its initial displacement.',
        importance: 'medium',
        category: 'Dynamics',
        example: 'First-order exponential response curves.'
      }
    ],
    formulas: [
      {
        id: 'f-gen-1',
        name: 'Fundamental Governing Relation',
        formula: '\\Phi(x) = \\sum_{i=1}^n \\omega_i \\cdot \\psi_i(x) + \\epsilon',
        description: 'Represents the weighted decomposition of system state across basis functions.',
        variables: [
          { symbol: '\\Phi(x)', explanation: 'Total observable response metric' },
          { symbol: '\\omega_i', explanation: 'Basis weighting coefficient' },
          { symbol: '\\psi_i(x)', explanation: 'Orthogonal component function' },
          { symbol: '\\epsilon', explanation: 'Stochastic variance / noise term' }
        ],
        units: 'Arbitrary system units'
      }
    ],
    flashcards: [
      {
        id: 'fc-f-1',
        front: `What is the primary governing criterion in ${title}?`,
        back: 'The balance between internal driving forces and boundary dissipation, ensuring stable equilibrium.',
        category: 'Core Concepts',
        difficulty: 'easy',
        mastered: false
      },
      {
        id: 'fc-f-2',
        front: 'Why is dimensional analysis crucial when solving derivations in this topic?',
        back: 'Because verifying unit consistency across all additive terms prevents algebraic sign errors and verifies equation validity.',
        category: 'Exam Strategy',
        difficulty: 'medium',
        mastered: false
      },
      {
        id: 'fc-f-3',
        front: 'What happens to the system under asymptotic limits (as t approaches infinity)?',
        back: 'Transient perturbation terms decay exponentially to zero, leaving only the steady-state baseline response.',
        category: 'Dynamics',
        difficulty: 'hard',
        mastered: false
      }
    ],
    quiz: [
      {
        id: 'q-f-1',
        question: `In the context of ${title}, which assumption is critical for linear superposition to hold?`,
        options: [
          'The system must be non-homogeneous and time-varying.',
          'The governing operator must satisfy both additivity and homogeneity (linearity).',
          'The decay constant must be strictly negative infinity.',
          'The observation window must be zero seconds.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Linear superposition requires linearity: f(ax + by) = a*f(x) + b*f(y), which guarantees that individual responses can be summed.',
        topic: 'Linear Systems'
      },
      {
        id: 'q-f-2',
        question: 'When analyzing experimental data in this domain, what does a high residual variance (ε) indicate?',
        options: [
          'The mathematical model captures 100% of underlying phenomena.',
          'There are unmodeled latent variables or significant measurement noise.',
          'The system has ceased to exist physically.',
          'The sampling frequency was infinitely large.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Large residuals signal that the basis functions do not fully account for variance, or that noise is skewing observations.',
        topic: 'Error Analysis'
      }
    ],
    examQuestions: {
      shortAnswer: [
        {
          id: 'sa-f-1',
          question: `Explain how the boundary conditions alter the solution set for ${title}.`,
          sampleAnswer: 'Boundary conditions constrain the arbitrary constants of integration that emerge from differential equations. By fixing initial state values at t=0 or at geometric endpoints, only specific eigenvalue solutions remain physically realizable.',
          keyPoints: [
            'Fixing constants of integration',
            'Enforcing physical conservation laws at boundaries',
            'Eliminating non-convergent or unbounded mathematical solutions'
          ],
          marks: 4
        }
      ],
      longAnswer: [
        {
          id: 'la-f-1',
          question: `Provide a rigorous step-by-step derivation of the steady-state equilibrium for ${title}. Discuss the physical significance of each term and outline potential exam pitfalls.`,
          sampleAnswer: 'Begin with the general non-equilibrium rate equation dS/dt = F_in - F_out. Set the time derivative to zero (dS/dt = 0) to define steady state. Substitute constitutive equations for flux terms. Factor the characteristic polynomial to solve for equilibrium state S*. Note that professors often introduce a non-zero time-varying external source to test whether students mistakenly assume steady-state when dS/dt != 0.',
          markingRubric: [
            'Clear statement of governing differential equation (2 marks)',
            'Setting dS/dt = 0 with conceptual justification (2 marks)',
            'Correct algebraic isolation of equilibrium variable S* (3 marks)',
            'Discussion of physical stability criteria and exam traps (3 marks)'
          ],
          marks: 10
        }
      ]
    },
    transcript: [
      { time: '00:00:10', speaker: 'Lecturer', text: `Welcome class. Today we dive into ${title}. Please have your lecture notes open to section 1.` },
      { time: '00:04:30', speaker: 'Lecturer', text: 'Notice how the equations on the board mirror the fundamental principles we developed last week.' },
      { time: '00:12:15', speaker: 'Lecturer', text: 'Pay close attention here: this exact derivation appeared on last year’s final examination.' },
      { time: '00:25:40', speaker: 'Lecturer', text: 'If you remember only one thing from today, remember to check your boundary conditions before starting algebraic simplifications.' }
    ]
  };
}
